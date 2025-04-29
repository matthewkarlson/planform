'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  passwordResetTokens,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  ActivityType,
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword } from '@/lib/auth/password';
import { setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
import { sendVerificationEmail, sendPasswordResetEmail, verifyPasswordResetToken } from '@/lib/email/service';

// Helper function to get user with team
export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string,
) {
  const userWithTeam = await getUserWithTeam(userId);
  
  if (!userWithTeam?.teamId) {
    return;
  }
  
  const newActivity: NewActivityLog = {
    userId,
    teamId: userWithTeam.teamId,
    action: type,
    ipAddress: ipAddress || '',
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password.',
      email,
      password,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password.',
      email,
      password,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundUser.id, ActivityType.SIGN_IN),
  ]);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: 'owner', // Default role, will be overridden if there's an invitation
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Failed to create user. Please try again.',
      email,
      password,
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (inviteId) {
    // Check if there's a valid invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;

      await db
        .update(invitations)
        .set({ status: 'accepted' })
        .where(eq(invitations.id, invitation.id));

      await logActivity(createdUser.id, ActivityType.ACCEPT_INVITATION);

      [createdTeam] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Failed to create team. Please try again.',
        email,
        password,
      };
    }

    teamId = createdTeam.id;
    userRole = 'owner';
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    sendVerificationEmail(createdUser.id, createdUser.email),
    setSession(createdUser)
  ]);

  // Log the signup and team creation activities
  if (!inviteId) {
    await logActivity(createdUser.id, ActivityType.CREATE_TEAM);
  }
  await logActivity(createdUser.id, ActivityType.SIGN_UP);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  await logActivity(user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: 'Current password is incorrect.' };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.',
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD),
    ]);

    return { success: 'Password updated successfully.' };
  },
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Account deletion failed.' };
    }

    await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

    const userWithTeam = await getUserWithTeam(user.id);

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

    (await cookies()).delete('session');
    redirect('/sign-in');
  },
);

const updateAccountSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;
    const updateData: Partial<typeof users.$inferInsert> = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    await Promise.all([
      db.update(users).set(updateData).where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_ACCOUNT),
    ]);

    return { success: 'Account updated successfully.' };
  },
);

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const forgotPassword = validatedAction(
  forgotPasswordSchema,
  async (data) => {
    const { email } = data;

    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userRecord.length === 0) {
      // Don't reveal that the email doesn't exist, return success anyway
      return { success: 'If your email is registered, you will receive a password reset link.' };
    }

    const user = userRecord[0];

    await sendPasswordResetEmail(user.id, user.email);

    return { success: 'If your email is registered, you will receive a password reset link.' };
  }
);

const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const resetPassword = validatedAction(
  resetPasswordSchema,
  async (data) => {
    const { token, password } = data;

    const tokenVerification = await verifyPasswordResetToken(token);
    
    if (!tokenVerification.success) {
      return { error: tokenVerification.message };
    }

    // Ensure userId is defined
    if (!tokenVerification.userId) {
      return { error: "Invalid token" };
    }

    const newPasswordHash = await hashPassword(password);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, tokenVerification.userId)),
      db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, tokenVerification.tokenId)),
      logActivity(tokenVerification.userId, ActivityType.RESET_PASSWORD),
    ]);

    return { success: 'Password has been reset successfully. You can now sign in with your new password.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(user.id, ActivityType.REMOVE_TEAM_MEMBER);

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(user.id, ActivityType.INVITE_TEAM_MEMBER);

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);
