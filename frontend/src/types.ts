export interface StsModel {
  type: "Model";
  handle: string | null;
  version: string | null;
  nanoid: string | null;
  name: string | null;
  repository: string | null;
  is_latest_version: boolean;
}

export interface StsNode {
  type: "Node";
  handle: string | null;
  version: string | null;
  nanoid: string | null;
  model: string;
}

export interface StsProperty {
  type: "Property";
  handle: string | null;
  version: string | null;
  nanoid: string | null;
  model: string;
  is_key: boolean | null;
  is_strict: boolean | null;
  is_nullable: boolean | null;
  is_required: string | boolean | null;
  value_domain: string;
  desc: string | null;
}
