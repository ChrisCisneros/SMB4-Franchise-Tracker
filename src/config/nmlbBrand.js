export const NMLB_BRAND = Object.freeze({
  shortName: 'NMLB',
  name: "Nicky's Major League Baseball",
  version: '6.6',
  release: 'The Postseason Push',
  colors: {
    purple: '#1f0554',
    white: '#ffffff',
    black: '#000000',
    gold: '#e8c66a',
    lavender: '#9f86ff',
  },
});

export const nmlbTitle = (suffix='') => suffix ? `NMLB · ${suffix}` : NMLB_BRAND.name;
