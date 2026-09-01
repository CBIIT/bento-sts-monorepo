export type Model = {
  id: string;
  handle: string;
  name: string;
  version: string;
  current: boolean;
  description: string;
  repositoryUrl: string;
  counts: { nodes: number; relationships: number; properties: number };
};

export type NodeEntity = {
  id: string;
  handle: string;
  modelId: string;
  definition?: string;
  properties: string[];
};

export type PropertyEntity = {
  id: string;
  handle: string;
  modelId: string;
  nodeId: string;
  definition?: string;
  valueType: string;
  required: boolean;
  valueSetId?: string;
  cdeId?: string;
};

export type Term = {
  id: string;
  value: string;
  definition: string;
  origin: "caDSR" | "NCIt";
  originId: string;
  originUrl: string;
  valueSetIds: string[];
  defines: string[];
};

export type ValueSet = {
  id: string;
  handle: string;
  origin: string;
  originUrl: string;
  termIds: string[];
};

export type Relationship = {
  id: string;
  handle: string;
  modelId: string;
  sourceNodeId: string;
  targetNodeId: string;
  multiplicity: string;
  required: boolean;
};

export const models: Model[] = [
  {
    id: "MODEL-CLINICAL-2",
    handle: "clinical_study",
    name: "Clinical Study Metadata",
    version: "2.0",
    current: true,
    description: "Current clinical research model for studies, participants, samples, files, and response data.",
    repositoryUrl: "https://github.com/CBIIT/bento-meta",
    counts: { nodes: 5, relationships: 4, properties: 6 },
  },
  {
    id: "MODEL-CLINICAL-1",
    handle: "clinical_study",
    name: "Clinical Study Metadata",
    version: "1.0",
    current: false,
    description: "Previous model version containing diagnosis information and the original sample relationship.",
    repositoryUrl: "https://github.com/CBIIT/bento-meta",
    counts: { nodes: 5, relationships: 4, properties: 6 },
  },
  {
    id: "MODEL-GENOMIC-1",
    handle: "genomic_data",
    name: "Genomic Data Model",
    version: "1.4",
    current: true,
    description: "Reference model for sequencing files, specimens, and genomic observations.",
    repositoryUrl: "https://github.com/CBIIT/bento-meta",
    counts: { nodes: 4, relationships: 3, properties: 8 },
  },
];

export const nodes: NodeEntity[] = [
  { id: "NODE-STUDY", handle: "study", modelId: "MODEL-CLINICAL-2", definition: "A clinical investigation conducted according to a protocol.", properties: [] },
  { id: "NODE-PARTICIPANT", handle: "participant", modelId: "MODEL-CLINICAL-2", definition: "An individual enrolled in a study.", properties: ["PROP-PARTICIPANT-ID", "PROP-BIRTH-SEX"] },
  { id: "NODE-SAMPLE", handle: "sample", modelId: "MODEL-CLINICAL-2", definition: "A biological material collected from a participant.", properties: ["PROP-SAMPLE-TYPE"] },
  { id: "NODE-FILE", handle: "file", modelId: "MODEL-CLINICAL-2", definition: "A digital data object associated with a sample.", properties: ["PROP-FILE-FORMAT"] },
  { id: "NODE-RESPONSE", handle: "treatment_response", modelId: "MODEL-CLINICAL-2", definition: "An observed response to treatment.", properties: ["PROP-RESPONSE-CODE"] },
  { id: "NODE-DIAGNOSIS", handle: "diagnosis", modelId: "MODEL-CLINICAL-1", definition: "A diagnostic assessment recorded for a participant.", properties: ["PROP-DIAGNOSIS-CODE"] },
];

export const valueSets: ValueSet[] = [
  { id: "VS-SEX", handle: "sex_at_birth_values", origin: "caDSR", originUrl: "https://cadsr.cancer.gov/", termIds: ["TERM-FEMALE", "TERM-MALE", "TERM-UNKNOWN"] },
  { id: "VS-SAMPLE-A", handle: "sample_type_v1", origin: "caDSR", originUrl: "https://cadsr.cancer.gov/", termIds: ["TERM-BLOOD", "TERM-TISSUE"] },
  { id: "VS-SAMPLE-B", handle: "sample_type_v2", origin: "NCIt", originUrl: "https://ncit.nci.nih.gov/", termIds: ["TERM-BLOOD", "TERM-TISSUE", "TERM-SALIVA"] },
  { id: "VS-FILE", handle: "file_format_values", origin: "NCIt", originUrl: "https://ncit.nci.nih.gov/", termIds: ["TERM-FASTQ", "TERM-BAM", "TERM-CRAM"] },
  { id: "VS-RESPONSE", handle: "response_values", origin: "caDSR", originUrl: "https://cadsr.cancer.gov/", termIds: ["TERM-CR", "TERM-PR", "TERM-SD", "TERM-PD"] },
];

export const properties: PropertyEntity[] = [
  { id: "PROP-PARTICIPANT-ID", handle: "participant_id", modelId: "MODEL-CLINICAL-2", nodeId: "NODE-PARTICIPANT", definition: "Unique participant identifier within the model.", valueType: "string", required: true },
  { id: "PROP-BIRTH-SEX", handle: "sex_at_birth", modelId: "MODEL-CLINICAL-2", nodeId: "NODE-PARTICIPANT", definition: "Sex assigned to the participant at birth.", valueType: "enumeration", required: false, valueSetId: "VS-SEX", cdeId: "CDE-000012345" },
  { id: "PROP-SAMPLE-TYPE", handle: "sample_type", modelId: "MODEL-CLINICAL-2", nodeId: "NODE-SAMPLE", definition: "Material classification of the sample.", valueType: "enumeration", required: true, valueSetId: "VS-SAMPLE-B" },
  { id: "PROP-FILE-FORMAT", handle: "file_format", modelId: "MODEL-CLINICAL-2", nodeId: "NODE-FILE", definition: "Format in which the file is encoded.", valueType: "enumeration", required: true, valueSetId: "VS-FILE" },
  { id: "PROP-RESPONSE-CODE", handle: "response_code", modelId: "MODEL-CLINICAL-2", nodeId: "NODE-RESPONSE", definition: "Standardized response category.", valueType: "enumeration", required: false, valueSetId: "VS-RESPONSE" },
  { id: "PROP-DIAGNOSIS-CODE", handle: "diagnosis_code", modelId: "MODEL-CLINICAL-1", nodeId: "NODE-DIAGNOSIS", definition: "Code representing a diagnosis.", valueType: "enumeration", required: false, valueSetId: "VS-RESPONSE", cdeId: "CDE-0000154625" },
];

export const terms: Term[] = [
  { id: "TERM-FEMALE", value: "Female", definition: "A person whose sex at birth was recorded as female.", origin: "caDSR", originId: "C16576", originUrl: "https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI_Thesaurus&code=C16576", valueSetIds: ["VS-SEX"], defines: ["PROP-BIRTH-SEX"] },
  { id: "TERM-MALE", value: "Male", definition: "A person whose sex at birth was recorded as male.", origin: "caDSR", originId: "C20197", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-SEX"], defines: ["PROP-BIRTH-SEX"] },
  { id: "TERM-UNKNOWN", value: "Unknown", definition: "The value is not known or was not provided.", origin: "caDSR", originId: "C17998", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-SEX"], defines: ["PROP-BIRTH-SEX"] },
  { id: "TERM-BLOOD", value: "Blood", definition: "A liquid connective tissue sample.", origin: "NCIt", originId: "C12434", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-SAMPLE-A", "VS-SAMPLE-B"], defines: ["PROP-SAMPLE-TYPE"] },
  { id: "TERM-TISSUE", value: "Tissue", definition: "A collection of similar cells and extracellular material.", origin: "NCIt", originId: "C12801", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-SAMPLE-A", "VS-SAMPLE-B"], defines: ["PROP-SAMPLE-TYPE"] },
  { id: "TERM-SALIVA", value: "Saliva", definition: "Oral fluid produced by salivary glands.", origin: "NCIt", originId: "C13275", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-SAMPLE-B"], defines: ["PROP-SAMPLE-TYPE"] },
  { id: "TERM-FASTQ", value: "FASTQ", definition: "Text-based sequence read format.", origin: "NCIt", originId: "C172213", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-FILE"], defines: ["PROP-FILE-FORMAT"] },
  { id: "TERM-BAM", value: "BAM", definition: "Binary alignment map format.", origin: "NCIt", originId: "C153247", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-FILE"], defines: ["PROP-FILE-FORMAT"] },
  { id: "TERM-CRAM", value: "CRAM", definition: "Compressed genomic alignment format.", origin: "NCIt", originId: "C184758", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-FILE"], defines: ["PROP-FILE-FORMAT"] },
  { id: "TERM-CR", value: "Complete Response", definition: "Disappearance of all target lesions.", origin: "caDSR", originId: "C4870", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-RESPONSE"], defines: ["PROP-RESPONSE-CODE"] },
  { id: "TERM-PR", value: "Partial Response", definition: "A qualifying decrease in disease burden.", origin: "caDSR", originId: "C18058", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-RESPONSE"], defines: ["PROP-RESPONSE-CODE"] },
  { id: "TERM-SD", value: "Stable Disease", definition: "Neither sufficient shrinkage nor increase for another category.", origin: "caDSR", originId: "C18213", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-RESPONSE"], defines: ["PROP-RESPONSE-CODE"] },
  { id: "TERM-PD", value: "Progressive Disease", definition: "An increase in disease burden or appearance of new lesions.", origin: "caDSR", originId: "C35571", originUrl: "https://ncit.nci.nih.gov/", valueSetIds: ["VS-RESPONSE"], defines: ["PROP-RESPONSE-CODE"] },
];

export const relationships: Relationship[] = [
  { id: "REL-PARTICIPANT", handle: "has_participant", modelId: "MODEL-CLINICAL-2", sourceNodeId: "NODE-STUDY", targetNodeId: "NODE-PARTICIPANT", multiplicity: "1:n", required: true },
  { id: "REL-SAMPLE", handle: "has_sample", modelId: "MODEL-CLINICAL-2", sourceNodeId: "NODE-PARTICIPANT", targetNodeId: "NODE-SAMPLE", multiplicity: "1:1", required: true },
  { id: "REL-FILE", handle: "has_file", modelId: "MODEL-CLINICAL-2", sourceNodeId: "NODE-SAMPLE", targetNodeId: "NODE-FILE", multiplicity: "1:n", required: false },
  { id: "REL-RESPONSE", handle: "has_response", modelId: "MODEL-CLINICAL-2", sourceNodeId: "NODE-PARTICIPANT", targetNodeId: "NODE-RESPONSE", multiplicity: "1:n", required: false },
];

export const getModel = (id: string) => models.find((model) => model.id === id);
export const getNode = (id: string) => nodes.find((node) => node.id === id);
export const getProperty = (id: string) => properties.find((property) => property.id === id);
export const getTerm = (id: string) => terms.find((term) => term.id === id);
export const getValueSet = (id?: string) => valueSets.find((valueSet) => valueSet.id === id);
