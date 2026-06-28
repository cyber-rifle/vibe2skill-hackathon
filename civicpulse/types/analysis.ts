// types/analysis.ts
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  mask?: string;
}

export interface Detection {
  boundingBox: BoundingBox;
  category: string;
  confidence: number;
  severity: number;
}

export interface ClassifyResult {
  category: string;
  description: string;
  confidence: number;
  severity?: number;
  boundingBox?: BoundingBox | null;
  detections?: Detection[];
}
