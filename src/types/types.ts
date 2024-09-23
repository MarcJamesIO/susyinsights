// types.ts
export interface Range {
  min?: number;
  max?: number;
}

export interface PropertyFilter {
  predictedEligibility?: string[];
  epcEnums?: Range;
  centralHeatingTypeEnums?: string[];
  tenureTypeEnums?: string[];
  homeTypeEnums?: string[];
  buildingTypeEnums?: string[];
  imd?: Range;
  incomeLess?: number;
  incomeMore?: number;
  page?: number;
  pageSize?: number;
  costToEPCCmin?: number;
  costToEPCCmax?: number;
}
