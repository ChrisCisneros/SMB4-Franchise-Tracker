export const TEAM_COLOR_BASE_MAP = {
  ARI: { primary: "#A71930", accent: "#E3D4AD" },
  ATL: { primary: "#CE1141", accent: "#13274F" },
  BAL: { primary: "#DF4601", accent: "#000000" },
  BOS: { primary: "#BD3039", accent: "#0C2340" },
  CHC: { primary: "#0E3386", accent: "#CC3433" },
  CWS: { primary: "#111111", accent: "#C4CED4" },
  CIN: { primary: "#C6011F", accent: "#000000" },
  CLE: { primary: "#0C2340", accent: "#E31937" },
  COL: { primary: "#333366", accent: "#C4CED4" },
  DET: { primary: "#0C2340", accent: "#FA4616" },
  HOU: { primary: "#002D62", accent: "#EB6E1F" },
  KC: { primary: "#004687", accent: "#BD9B60" },
  LAA: { primary: "#BA0021", accent: "#003263" },
  LAD: { primary: "#005A9C", accent: "#FFFFFF" },
  MIA: { primary: "#00A3E0", accent: "#EF3340" },
  MIL: { primary: "#12284B", accent: "#FFC52F" },
  MIN: { primary: "#002B5C", accent: "#D31145" },
  NYM: { primary: "#002D72", accent: "#FF5910" },
  NYY: { primary: "#132448", accent: "#C4CED3" },
  OAK: { primary: "#003831", accent: "#EFB21E" },
  PHI: { primary: "#E81828", accent: "#002D72" },
  PIT: { primary: "#27251F", accent: "#FDB827" },
  SD: { primary: "#2F241D", accent: "#FFC425" },
  SEA: { primary: "#0C2C56", accent: "#005C5C" },
  SF: { primary: "#FD5A1E", accent: "#27251F" },
  STL: { primary: "#C41E3A", accent: "#0C2340" },
  TB: { primary: "#092C5C", accent: "#8FBCE6" },
  TEX: { primary: "#003278", accent: "#C0111F" },
  TOR: { primary: "#134A8E", accent: "#E8291C" },
  WSH: { primary: "#AB0003", accent: "#14225A" },
};

export const TEAM_COLORS = Object.fromEntries(
  Object.entries(TEAM_COLOR_BASE_MAP).map(([abbr, colors]) => [
    abbr,
    {
      primary: {
        main: colors.primary,
        alt: colors.accent,
        text: "#FFFFFF",
      },
      alternates: [],
      cityConnect: null,
      extras: [],
    },
  ])
);

// Put your team-specific overrides directly below, like this:
// Put your team-specific overrides directly below, like this:








TEAM_COLORS.ATH = {
  primary: {main: "#ffffff", alt: "#2e700f", border: "#f5d01b", text: "#2e700f", gradient:false},
  alternates: [
    { name: "Yellow Alt", main: "#f5d01b", alt: "#ffffff", text: "#2e700f" },{ name: "Away", main: "#adadad", alt: "#f5d01b", text: "#2e700f" }
  ]
};
TEAM_COLORS.ATL = {
  primary: {main: "#ffffff", alt: "#01105c", border: "#8c1204", text: "#01105c", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#01105c", alt: "#8c1204", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#8c1204", text: "#01105c" }
  ],
  cityConnect: { main: "#4583d3", alt: "#01105c", border: "#8c1204", text: "#ffffff", gradient:false},
};
TEAM_COLORS.AZ = {
  primary: {main: "#ffffff", alt: "#a70808", border: "#02ebeb", text: "#000000", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#02ebeb", text: "#730606" },{ name: "Red Alt", main: "#730606", alt: "#02ebeb", text: "#02ebeb" },{ name: "Away", main: "#adadad", alt: "#02ebeb", text: "#730606" }
  ],
  cityConnect: { main: "#25026b", alt: "#000000", border: "#02ebeb", text: "#02ebeb", gradient:true},
};
TEAM_COLORS.BAL = {
  primary: {main: "#d94804", alt: "#d94804", border: "#000000", text: "#ffffff", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#d94804", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#000000", text: "#d94804" }
  ],
  cityConnect: { main: "#fcf4e3", alt: "#021059", border: "#294d2d", text: "#d94804", gradient:false},
};
TEAM_COLORS.BOS = {
  primary: {main: "#ffffff", alt: "#010238", border: "#b0110e", text: "#010238", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#b0110e", alt: "#010238", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#b0110e", text: "#ffffff" }
  ],
  cityConnect: { main: "#2c5443", alt: "#021059", border: "#dbc70d", text: "#ffffff", gradient:false},
};
TEAM_COLORS.CHC = {
  primary: {main: "#ffffff", alt: "#c40404", border: "#0442b5", text: "#c40404", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#0442b5", alt: "#c40404", text: "#ffffff" },{ name: "Powder Alt", main: "#6dc1f2", alt: "#c40404", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#0442b5", text: "#c40404" },{ name: "Post", main: "#0442b5", alt: "#c40404",border: "#ffffff", text: "#000679", gradient: false }
  ],
  cityConnect: { main: "#000324", alt: "#021059", border: "#6dc1f2", text: "#ffffff", gradient:false},
};
TEAM_COLORS.CIN = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#c40404", text: "#c40404", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#c40404", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#c40404", text: "#c40404" }
  ],
  cityConnect: { main: "#9b0303", alt: "#ba4404", border: "#000000", text: "#9b0303", gradient:false},
};
TEAM_COLORS.CLE = {
  primary: {main: "#ffffff", alt: "#b0110e", border: "#b0110e", text: "#000324", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#000324", alt: "#ffffff", text: "#b0110e" }, { name: "Red Alt", main: "#b0110e", alt: "#ffffff", text: "#000324" },{ name: "Away", main: "#adadad", alt: "#b0110e", text: "#000324" }
  ],
  cityConnect: { main: "#1a1c36", alt: "#021059", border: "#b0110e", text: "#c2b8ab", gradient:false},
};
TEAM_COLORS.COL = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#220154", text: "#000000", gradient:false},
  alternates: [
    { name: "Purple Alt", main: "#220154", alt: "#000000", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#220154", text: "#ffffff" }
  ],
  cityConnect: { main: "#387bba", alt: "#021059", border: "#ed1cb2", text: "#cf9a0a", gradient:false},
};
TEAM_COLORS.CWS = {
  primary: {main: "#ffffff", alt: "#ffffff", border: "#000000", text: "#000000", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#ffffff", text: "#000000" }
  ],
  cityConnect: { main: "#8a0601", alt: "#021059", border: "#000000", text: "#ffffff", gradient:false},
};
TEAM_COLORS.DET = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#010017", text: "#cf5804", gradient:false},
  alternates:[
    { name: "Away", main: "#adadad", alt: "#010017", text: "#cf5804" }
  ],
  cityConnect: { main: "#020133", alt: "#082aa3", border: "#FFFFFF", text: "#ffffff", gradient:true},
};
TEAM_COLORS.HOU = {
  primary: {main: "#ffffff", alt: "#cf6802", border: "#010440", text: "#cf6802", gradient:false},
  alternates: [
    { name: "Orange Alt", main: "#cf6802", alt: "#ffffff", text: "#010440" }, { name: "Blue Alt", main: "#010440", alt: "#ffffff", text: "#cf6802" },{ name: "Away", main: "#adadad", alt: "#010440", text: "#cf6802" }
  ],
  cityConnect: { main: "#cf6802", alt: "#eba967", border: "#ffffff", text: "#ffffff", gradient:true},
};
TEAM_COLORS.KC = {
  primary: {main: "#ffffff", alt: "#001b85", border: "#001b85", text: "#001b85", gradient:false},
  alternates: [
    { name: "Powder Alt", main: "#59b3eb", alt: "#ffffff", text: "#ffffff" }, { name: "Blue Alt", main: "#001b85", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#001b85", text: "#001b85" }
  ],
  cityConnect: { main: "#a904c9", alt: "#023eb5", border: "#ffffff", text: "#ffffff", gradient:true},
};TEAM_COLORS.LAA = {
  primary: {main: "#ffffff", alt: "#a30303", border: "#000679", text: "#a30303", gradient:false},
  alternates: [
    { name: "Red Alt", main: "#a30303", alt: "#000679", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#a30303", text: "#000679" },{ name: "Post", main: "#a30303", alt: "#ffffff",border: "#a30303", text: "#000679", gradient: true }
  ],
  cityConnect: { main: "#fdfaf2", alt: "#a30303", border: "#a30303", text: "#a30303", gradient:false},
};
TEAM_COLORS.LAD = {
  primary: {main: "#ffffff", alt: "#ffffff", border: "#001994", text: "#001994", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#001994", alt: "#ffffff", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#001994", text: "#001994" }
  ],
  cityConnect: { main: "#3952cc", alt: "#021059", border: "#6b83fa", text: "#ffffff", gradient:true},
};
TEAM_COLORS.MIA = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#0e80cc", text: "#000000", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#0e80cc", alt: "#c201c2", text: "#ffffff" }, { name: "Black Alt", main: "#000000", alt: "#0e80cc", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#0e80cc", text: "#0e80cc" }
  ],
  cityConnect: { main: "#0e80cc", alt: "#c201c2", border: "#7429bb", text: "#ffffff", gradient:true},
};
TEAM_COLORS.MIL = {
  primary: {main: "#fcf0e3", alt: "#010041", border: "#fffb1d", text: "#010041", gradient:false},
  alternates: [
    { name: "White Alt", main: "#ffffff", alt: "#fffb1d", text: "#010041" }, { name: "Blue  Alt", main: "#010041", alt: "#fffb1d", text: "#fffb1d" },{ name: "Away", main: "#adadad", alt: "#fffb1d", text: "#010041" }
  ],
  cityConnect: { main: "#023353", alt: "#fffb1d", border: "#fff5d3", text: "#fff5d3", gradient:false},
};
TEAM_COLORS.MIN = {
  primary: {main: "#ffffff", alt: "#d30000", border: "#00063b", text: "#d30000", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#00063b", alt: "#d30000", text: "##ffffff" }, { name: "Cream Alt", main: "#fff9f3", alt: "#00063b", text: "#00063b" },{ name: "Away", main: "#adadad", alt: "#d30000", text: "#00063b" }
  ],
  cityConnect: { main: "#0044d8", alt: "#00012e", border: "#f0d800", text: "#ffffff", gradient:true},
};
TEAM_COLORS.NYM = {
  primary: {main: "#0d0d6e", alt: "#ed5f07", border: "#ed5f07", text: "#FFFFFF", gradient:false},
  alternates: [
    { name: "White Alt", main: "#ffffff", alt: "#ed5f07", text: "#0d0d6e" },{ name: "Away", main: "#adadad", alt: "#0d0d6e", text: "#ed5f07" }
  ],
  cityConnect: { main: "#454545", alt: "#ba4404", border: "#000000", text: "#ffffff", gradient:false},
};
TEAM_COLORS.NYY = {
  primary: {main: "#ffffff", alt: "#00093a", border: "#00093a", text: "#00093a", gradient:false},
  alternates: [
    { name: "Away", main: "#adadad", alt: "#00093a", text: "#00093a" }
  ],
  
};
TEAM_COLORS.PHI = {
  primary: {main: "#ffffff", alt: "#ffffff", border: "#a60000", text: "#a60000", gradient:false},
  alternates: [
    { name: "Powder Blue", main: "#388dc2", alt: "#a60000", text: "#ffffff" },
    {name: "Red", main: "#a60000", alt: "#110982", text: "#ffffff"},{ name: "Away", main: "#adadad", alt: "#a60000", text: "#a60000" }
  ],
  cityConnect: { main: "#0782ab", alt: "#020a4d", border: "#e6d437", text: "#ffffff", gradient:true},
};
TEAM_COLORS.PIT = {
  primary: {main: "#ffffff", alt: "#000000", border: "#e3ac17", text: "#000000", gradient:false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#e3ac17", text: "#e3ac17" },{ name: "Away", main: "#adadad", alt: "#e3ac17", text: "#000000" }
  ],
  cityConnect: { main: "#000000", alt: "#77602f", border: "#77602f", text: "#77602f", gradient:false},
};
TEAM_COLORS.SD = {
  primary: {main: "#302505", alt: "#e3ac17", border: "#e3ac17", text: "#FFFFFF", gradient:false},
  alternates: [
    { name: "White Alt", main: "#9e8259", alt: "#e3ac17", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#302505", text: "#e3ac17" }
  ],
  cityConnect: { main: "#06113d", alt: "#ba4404", border: "#ba4404", text: "#ffffff", gradient:false},
};
TEAM_COLORS.SEA = {
  primary: {main: "#ffffff", alt: "#e3ac17", border: "#106b4a", text: "#010046", gradient:false},
  alternates: [
    { name: "Cream  Alt", main: "#fffdfa", alt: "#e6e200", text: "#010046" }, { name: "Teal  Alt", main: "#106b4a", alt: "#010046", text: "#fffdfa" },{ name: "Away", main: "#adadad", alt: "#106b4a", text: "#010046" }
  ],
  cityConnect: { main: "#001c8b", alt: "#ba4404", border: "#e6e200", text: "#e6e200", gradient:false},
};
TEAM_COLORS.SF = {
  primary: { main: "#fcf5eb", alt: "#000000", border:"#FD5a1e", text: "#000000" , gradient: false},
  alternates: [
    { name: "Black Alt", main: "#000000", alt: "#FD5A1E", text: "#FFFFFF" }, { name: "Orange Alt", main: "#FD5A1E", alt: "#000000", border:"#27251F", text: "#FFFFFF" , gradient: false },{ name: "Away", main: "#adadad", alt: "#FD5A1E", text: "#000000" }
  ],
  cityConnect: { main: "#FD5A1E", alt: "#29097a", border: "#1a0354", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.STL = {
  primary: { main: "#ffffff", alt: "#000000", border:"#d60000", text: "#d60000" , gradient: false},
  alternates: [
    { name: "Cream Alt", main: "#fffbf5", alt: "#d60000", text: "#d60000" }, { name: "Powder Alt", main: "#38a1d1", alt: "#d60000", border:"#d60000", text: "#d60000" , gradient: false },{ name: "Away", main: "#adadad", alt: "#d60000", text: "#d60000" }
  ],
  cityConnect: { main: "#d60000", alt: "#29097a", border: "#740101", text: "#FFFFFF", gradient:false },
  extras: [],
};
TEAM_COLORS.TB = {
  primary: { main: "#ffffff", alt: "#f1da09", border:"#0077d8", text: "#040041" , gradient: false},
  alternates: [
    { name: "Powder Alt", main: "#0077d8", alt: "#f1da09", text: "#FFFFFF" }, { name: "Devil Alt", main: "#0077d8", alt: "#f1da09", border:"#040041", text: "#FFFFFF" , gradient: true },{ name: "Away", main: "#adadad", alt: "#0077d8", text: "#0077d8" }
  ],
  cityConnect: { main: "#52f36d", alt: "#0077d8", border: "#040041", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.TEX = {
  primary: { main: "#ffffff", alt: "#000c42", border:"#db0000", text: "#000c42" , gradient: false},
  alternates: [
    { name: "Powder Alt", main: "#55bcec", alt: "#000c42", text: "#FFFFFF" }, { name: "Blue Alt", main: "#000c42", alt: "#000000", border:"#db0000", text: "#FFFFFF" , gradient: false },{ name: "Away", main: "#adadad", alt: "#db0000", text: "#000c42" }
  ],
  cityConnect: { main: "#460000", alt: "#29097a", border: "#9c8031", text: "#9c8031", gradient:false },
  extras: [],
};
TEAM_COLORS.TOR = {
  primary: { main: "#ffffff", alt: "#000000", border:"#0026ff", text: "#0026ff" , gradient: false},
  alternates: [
    { name: "Blue Alt", main: "#0026ff", alt: "#ffffff", text: "#FFFFFF" }, { name: "Powder Alt", main: "#4bace4", alt: "#000000", border:"#0026ff", text: "#FFFFFF" , gradient: false },{ name: "Away", main: "#adadad", alt: "#0026ff", text: "#0026ff" }
  ],
  cityConnect: { main: "#f50303", alt: "#0026ff", border: "#f50303", text: "#FFFFFF", gradient:true },
  extras: [],
};
TEAM_COLORS.WSH = {
  primary: {main: "#ffffff", alt: "#04003b", border: "#cf0c0c", text: "#04003b", gradient:false},
  alternates: [
    { name: "Blue Alt", main: "#04003b", alt: "#cf0c0c", text: "#ffffff" },{ name: "Away", main: "#adadad", alt: "#8c1204", text: "#8c1204" }
  ],
  cityConnect: { main: "#44679e", alt: "#ba04b1", border: "#162133", text: "#ffffff", gradient:false},
};


export function getAvailableLooks(abbr) {
  const team = TEAM_COLORS[abbr];
  if (!team) return [{ mode: "primary", index: 0, label: "Primary" }];

  const looks = [{ mode: "primary", index: 0, label: "Primary" }];

  if (team.cityConnect) {
    looks.push({ mode: "cityConnect", index: 0, label: "City Connect" });
  }

  (team.alternates || []).forEach((alt, index) => {
    looks.push({
      mode: "alternate",
      index,
      label: alt?.name || `Alt ${index + 1}`,
    });
  });

  (team.extras || []).forEach((extra, index) => {
    looks.push({
      mode: "extra",
      index,
      label: extra?.name || `Extra ${index + 1}`,
    });
  });

  return looks;
}

export function getTeamColorsByAbbr(abbr, themeMode = "primary", variantIndex = 0) {
  const fallback = {
    main: "#071739",
    alt: "#2f66ff",
    border: "#2f66ff",
    text: "#FFFFFF",
    gradient: false,
    name: "Primary",
  };
  if (!abbr || !TEAM_COLORS[abbr]) return fallback;
  const team = TEAM_COLORS[abbr];

  const normalize = (colors) => ({
    main: colors?.main || fallback.main,
    alt: colors?.alt || colors?.main || fallback.alt,
    border: colors?.border || colors?.alt || colors?.main || fallback.border,
    text: colors?.text || fallback.text,
    gradient: Boolean(colors?.gradient),
    name: colors?.name || "Primary",
  });

  if (themeMode === "cityConnect") return normalize(team.cityConnect || team.primary || fallback);
  if (themeMode === "alternate") return normalize(team.alternates?.[variantIndex] || team.primary || fallback);
  if (themeMode === "extra") return normalize(team.extras?.[variantIndex] || team.primary || fallback);
  return normalize(team.primary || fallback);
}

export function getPostseasonColorsByAbbr(abbr) {
  const fallback = {
    main: "#071739",
    alt: "#2f66ff",
    border: "#2f66ff",
    text: "#ffffff",
    gradient: false,
  };

  if (!abbr || !TEAM_COLORS[abbr]) {
    return fallback;
  }

  const team = TEAM_COLORS[abbr];

  const postLook = (team.alternates || []).find(
    (look) =>
      String(look?.name || "").trim().toLowerCase() === "post"
  );

  const colors = postLook || team.primary || fallback;

  return {
    main: colors.main || fallback.main,
    alt: colors.alt || colors.main || fallback.alt,
    border:
      colors.border ||
      colors.alt ||
      colors.main ||
      fallback.border,
    text: colors.text || fallback.text,
    gradient: Boolean(colors.gradient),
  };
}
