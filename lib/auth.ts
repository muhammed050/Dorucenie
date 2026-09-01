import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type {
  Organization,
  OrganizationMembership,
} from "@/lib/supabase/database.types";

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthRequiredError";
  }
}

export class OrganizationAccessError extends Error {
  constructor() {
    super("Organization access is required.");
    this.name = "OrganizationAccessError";
  }
}

export class AuthDataError extends Error {
  constructor() {
    super("The authenticated workspace could not be loaded.");
    this.name = "AuthDataError";
  }
}

export type CurrentOrganization = Organization & {
  membership: OrganizationMembership;
};

export type OrganizationAccess = {
  user: User;
  organization: CurrentOrganization;
};

function isMissingSessionError(error: { name?: string; status?: number }) {
  return error.name === "AuthSessionMissingError" || error.status === 401;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    throw new AuthDataError();
  }

  return data.user;
}

async function loadOrganizationForUser(
  user: User,
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId?: string,
): Promise<CurrentOrganization | null> {
  let membershipQuery = supabase
    .from("organization_members")
    .select("id, organization_id, user_id, role, created_at, updated_at")
    .eq("user_id", user.id);

  if (organizationId) {
    membershipQuery = membershipQuery.eq("organization_id", organizationId);
  } else {
    membershipQuery = membershipQuery.order("created_at", { ascending: true }).limit(1);
  }

  const { data: membership, error: membershipError } = await membershipQuery.maybeSingle();

  if (membershipError) {
    throw new AuthDataError();
  }

  if (!membership) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name, created_by, created_at, updated_at")
    .eq("id", membership.organization_id)
    .maybeSingle();

  if (organizationError) {
    throw new AuthDataError();
  }

  if (!organization) {
    throw new AuthDataError();
  }

  return { ...organization, membership };
}

export async function getCurrentOrganization(): Promise<CurrentOrganization | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  return loadOrganizationForUser(user, supabase);
}

function validateOrganizationId(organizationId: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      organizationId,
    )
  ) {
    throw new OrganizationAccessError();
  }
}

async function requireOrganizationAccess(
  organizationId: string | undefined,
  check: "member" | "admin",
): Promise<OrganizationAccess> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  const supabase = await createClient();
  const currentOrganization = organizationId
    ? null
    : await loadOrganizationForUser(user, supabase);
  const targetOrganizationId = organizationId ?? currentOrganization?.id;

  if (!targetOrganizationId) {
    throw new OrganizationAccessError();
  }

  validateOrganizationId(targetOrganizationId);

  const { data: authorizedOrganizationId, error: authorizationError } =
    await supabase.rpc(
      check === "admin"
        ? "require_organization_admin"
        : "require_organization_member",
      { p_organization_id: targetOrganizationId },
    );

  if (authorizationError || authorizedOrganizationId !== targetOrganizationId) {
    throw new OrganizationAccessError();
  }

  const organization =
    currentOrganization ??
    (await loadOrganizationForUser(user, supabase, targetOrganizationId));

  if (!organization || organization.id !== targetOrganizationId) {
    throw new OrganizationAccessError();
  }

  if (check === "admin" && !["owner", "admin"].includes(organization.membership.role)) {
    throw new OrganizationAccessError();
  }

  return { user, organization };
}

export function requireOrganizationMember(organizationId?: string) {
  return requireOrganizationAccess(organizationId, "member");
}

export function requireOrganizationAdmin(organizationId?: string) {
  return requireOrganizationAccess(organizationId, "admin");
}
