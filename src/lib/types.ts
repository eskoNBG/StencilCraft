export interface StencilResult {
  id: string;
  originalImage: string;
  stencilImage: string;
  style: string;
  lineThickness: number;
  contrast: number;
  inverted: boolean;
  createdAt: Date | string;
  isFavorite: boolean;
}
