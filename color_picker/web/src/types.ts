export interface iColor {
  R: number;
  G: number;
  B: number;
}

export interface IDataSample {
  phrase: string;
  tokens: string[];
  colors: iColor[];
}
