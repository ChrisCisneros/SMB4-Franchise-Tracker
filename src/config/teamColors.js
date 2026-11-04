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

// COMPACT COLOR HELPERS — keep team blocks short and easy to scan.
// C(main, alt, border, text, gradient)
// A(name, main, alt, text, border, gradient)
const C=(main,alt,border=null,text="#ffffff",gradient=false)=>({main,alt,...(border?{border}:{}),text,gradient:Boolean(gradient)});
const A=(name,main,alt,text="#ffffff",border=null,gradient=false)=>({name,...C(main,alt,border,text,gradient)});

// EASY EDIT ZONE — postseason palettes only.
// Format: TEAM: [main, alt, border, text, gradient]
// Theme Lab generates this exact one-line format for copy/paste.
export const POSTSEASON_PALETTES={
  CHC: ["#0442b5", "#c40404", "#ffffff", "#000679", false],
  LAA: ["#a30303", "#ffffff", "#a30303", "#000679", true],
  STL: ["#ffffff", "#000000", "#d60000", "#d60000", false],
  SF: ["#fcf5eb", "#000000", "#FD5a1e", "#000000", false],
  MIA: ["#ffffff", "#dc1f70", "#0e80cc", "#000000", false],
  SD: ["#e3ac17", "#302505", "#e3ac17", "#FFFFFF", false],
  WSH: ["#ffffff", "#04003b", "#cf0c0c", "#04003b", false],
  ATL: ["#8c1204", "#01105c", "#ffffff", "#01105c", false],
  CIN: ["#c40404", "#ffffff", "#c40404", "#c40404", false],
  LAD: ["#001994", "#ffffff", "#001994", "#001994", false],
  BOS: ["#010238", "#b0110e", "#010238", "#b0110e", false],
  ATH: ["#f5d01b", "#2e700f", "#f5d01b", "#2e700f", false],
  CWS: ["#ffffff", "#000000", "#ffffff", "#ffffff", false],
  TOR: ["#0026ff", "#c91414", "#ffffff", "#0026ff", false],
  TB: ["#ffffff", "#f1da09", "#0077d8", "#040041", false],
  DET: ["#cf5804", "#ffffff", "#010017", "#cf5804", false],
  BAL: ["#d94804", "#d94804", "#000000", "#ffffff", false],
};

const expandPostseasonPalette=(entry)=>{
  if(!Array.isArray(entry)) return null;
  const [main,alt,border,text,gradient=false]=entry;
  return {main,alt,border,text,gradient:Boolean(gradient),name:"Post"};
};

// TEAM LOOKS — every existing alternate is preserved.
// Each team is compact: primary, alternates, City Connect, extras.
export const TEAM_COLORS={
  ARI: {
    primary:C("#A71930","#E3D4AD",null,"#FFFFFF",false),
    alternates:[],
  },
  ATH: {
    primary:C("#ffffff","#2e700f","#f5d01b","#2e700f",false),
    alternates:[
      A("Yellow Alt","#f5d01b","#ffffff","#2e700f",null,false),
      A("Away","#adadad","#f5d01b","#2e700f",null,false),
    ],
  },
  ATL: {
    primary:C("#ffffff","#01105c","#8c1204","#01105c",false),
    alternates:[
      A("Blue Alt","#01105c","#8c1204","#ffffff",null,false),
      A("Away","#adadad","#8c1204","#01105c",null,false),
    ],
    cityConnect:C("#4583d3","#01105c","#8c1204","#ffffff",false),
  },
  AZ: {
    primary:C("#ffffff","#a70808","#02ebeb","#000000",false),
    alternates:[
      A("Black Alt","#000000","#02ebeb","#730606",null,false),
      A("Red Alt","#730606","#02ebeb","#02ebeb",null,false),
      A("Away","#adadad","#02ebeb","#730606",null,false),
    ],
    cityConnect:C("#25026b","#000000","#02ebeb","#02ebeb",true),
  },
  BAL: {
    primary:C("#d94804","#d94804","#000000","#ffffff",false),
    alternates:[
      A("Black Alt","#000000","#d94804","#ffffff",null,false),
      A("Away","#adadad","#000000","#d94804",null,false),
    ],
    cityConnect:C("#fcf4e3","#021059","#294d2d","#d94804",false),
  },
  BOS: {
    primary:C("#ffffff","#010238","#b0110e","#010238",false),
    alternates:[
      A("Red Alt","#b0110e","#010238","#ffffff",null,false),
      A("Away","#adadad","#b0110e","#ffffff",null,false),
    ],
    cityConnect:C("#2c5443","#021059","#dbc70d","#ffffff",false),
  },
  CHC: {
    primary:C("#ffffff","#c40404","#0442b5","#c40404",false),
    alternates:[
      A("Blue Alt","#0442b5","#c40404","#ffffff",null,false),
      A("Powder Alt","#6dc1f2","#c40404","#ffffff",null,false),
      A("Away","#adadad","#0442b5","#c40404",null,false),
      A("Post","#0442b5","#c40404","#000679","#ffffff",false),
    ],
    cityConnect:C("#000324","#021059","#6dc1f2","#ffffff",false),
  },
  CIN: {
    primary:C("#ffffff","#e3ac17","#c40404","#c40404",false),
    alternates:[
      A("Red Alt","#c40404","#ffffff","#ffffff",null,false),
      A("Away","#adadad","#c40404","#c40404",null,false),
    ],
    cityConnect:C("#9b0303","#ba4404","#000000","#9b0303",false),
  },
  CLE: {
    primary:C("#ffffff","#b0110e","#b0110e","#000324",false),
    alternates:[
      A("Blue Alt","#000324","#ffffff","#b0110e",null,false),
      A("Red Alt","#b0110e","#ffffff","#000324",null,false),
      A("Away","#adadad","#b0110e","#000324",null,false),
    ],
    cityConnect:C("#1a1c36","#021059","#b0110e","#c2b8ab",false),
  },
  COL: {
    primary:C("#ffffff","#e3ac17","#220154","#000000",false),
    alternates:[
      A("Purple Alt","#220154","#000000","#ffffff",null,false),
      A("Away","#adadad","#220154","#ffffff",null,false),
    ],
    cityConnect:C("#387bba","#021059","#ed1cb2","#cf9a0a",false),
  },
  CWS: {
    primary:C("#ffffff","#ffffff","#000000","#000000",false),
    alternates:[
      A("Black Alt","#000000","#ffffff","#ffffff",null,false),
      A("Away","#adadad","#ffffff","#000000",null,false),
    ],
    cityConnect:C("#8a0601","#021059","#000000","#ffffff",false),
  },
  DET: {
    primary:C("#ffffff","#e3ac17","#010017","#cf5804",false),
    alternates:[
      A("Away","#adadad","#010017","#cf5804",null,false),
    ],
    cityConnect:C("#020133","#082aa3","#FFFFFF","#ffffff",true),
  },
  HOU: {
    primary:C("#ffffff","#cf6802","#010440","#cf6802",false),
    alternates:[
      A("Orange Alt","#cf6802","#ffffff","#010440",null,false),
      A("Blue Alt","#010440","#ffffff","#cf6802",null,false),
      A("Away","#adadad","#010440","#cf6802",null,false),
    ],
    cityConnect:C("#cf6802","#eba967","#ffffff","#ffffff",true),
  },
  KC: {
    primary:C("#ffffff","#001b85","#001b85","#001b85",false),
    alternates:[
      A("Powder Alt","#59b3eb","#ffffff","#ffffff",null,false),
      A("Blue Alt","#001b85","#ffffff","#ffffff",null,false),
      A("Away","#adadad","#001b85","#001b85",null,false),
    ],
    cityConnect:C("#a904c9","#023eb5","#ffffff","#ffffff",true),
  },
  LAA: {
    primary:C("#ffffff","#a30303","#000679","#a30303",false),
    alternates:[
      A("Red Alt","#a30303","#000679","#ffffff",null,false),
      A("Away","#adadad","#a30303","#000679",null,false),
      A("Post","#a30303","#ffffff","#000679","#a30303",true),
    ],
    cityConnect:C("#fdfaf2","#a30303","#a30303","#a30303",false),
  },
  LAD: {
    primary:C("#ffffff","#ffffff","#001994","#001994",false),
    alternates:[
      A("Blue Alt","#001994","#ffffff","#ffffff",null,false),
      A("Away","#adadad","#001994","#001994",null,false),
    ],
    cityConnect:C("#3952cc","#021059","#6b83fa","#ffffff",true),
  },
  MIA: {
    primary:C("#ffffff","#e3ac17","#0e80cc","#000000",false),
    alternates:[
      A("Blue Alt","#0e80cc","#c201c2","#ffffff",null,false),
      A("Black Alt","#000000","#0e80cc","#ffffff",null,false),
      A("Away","#adadad","#0e80cc","#0e80cc",null,false),
    ],
    cityConnect:C("#0e80cc","#c201c2","#7429bb","#ffffff",true),
  },
  MIL: {
    primary:C("#fcf0e3","#010041","#fffb1d","#010041",false),
    alternates:[
      A("White Alt","#ffffff","#fffb1d","#010041",null,false),
      A("Blue  Alt","#010041","#fffb1d","#fffb1d",null,false),
      A("Away","#adadad","#fffb1d","#010041",null,false),
    ],
    cityConnect:C("#023353","#fffb1d","#fff5d3","#fff5d3",false),
  },
  MIN: {
    primary:C("#ffffff","#d30000","#00063b","#d30000",false),
    alternates:[
      A("Blue Alt","#00063b","#d30000","#ffffff",null,false),
      A("Cream Alt","#fff9f3","#00063b","#00063b",null,false),
      A("Away","#adadad","#d30000","#00063b",null,false),
    ],
    cityConnect:C("#0044d8","#00012e","#f0d800","#ffffff",true),
  },
  NYM: {
    primary:C("#0d0d6e","#ed5f07","#ed5f07","#FFFFFF",false),
    alternates:[
      A("White Alt","#ffffff","#ed5f07","#0d0d6e",null,false),
      A("Away","#adadad","#0d0d6e","#ed5f07",null,false),
    ],
    cityConnect:C("#454545","#ba4404","#000000","#ffffff",false),
  },
  NYY: {
    primary:C("#ffffff","#00093a","#00093a","#00093a",false),
    alternates:[
      A("Away","#adadad","#00093a","#00093a",null,false),
    ],
  },
  OAK: {
    primary:C("#003831","#EFB21E",null,"#FFFFFF",false),
    alternates:[],
  },
  PHI: {
    primary:C("#ffffff","#ffffff","#a60000","#a60000",false),
    alternates:[
      A("Powder Blue","#388dc2","#a60000","#ffffff",null,false),
      A("Red","#a60000","#110982","#ffffff",null,false),
      A("Away","#adadad","#a60000","#a60000",null,false),
    ],
    cityConnect:C("#0782ab","#020a4d","#e6d437","#ffffff",true),
  },
  PIT: {
    primary:C("#ffffff","#000000","#e3ac17","#000000",false),
    alternates:[
      A("Black Alt","#000000","#e3ac17","#e3ac17",null,false),
      A("Away","#adadad","#e3ac17","#000000",null,false),
    ],
    cityConnect:C("#000000","#77602f","#77602f","#77602f",false),
  },
  SD: {
    primary:C("#302505","#e3ac17","#e3ac17","#FFFFFF",false),
    alternates:[
      A("White Alt","#9e8259","#e3ac17","#ffffff",null,false),
      A("Away","#adadad","#302505","#e3ac17",null,false),
    ],
    cityConnect:C("#06113d","#ba4404","#ba4404","#ffffff",false),
  },
  SEA: {
    primary:C("#ffffff","#e3ac17","#106b4a","#010046",false),
    alternates:[
      A("Cream  Alt","#fffdfa","#e6e200","#010046",null,false),
      A("Teal  Alt","#106b4a","#010046","#fffdfa",null,false),
      A("Away","#adadad","#106b4a","#010046",null,false),
    ],
    cityConnect:C("#001c8b","#ba4404","#e6e200","#e6e200",false),
  },
  SF: {
    primary:C("#fcf5eb","#000000","#FD5a1e","#000000",false),
    alternates:[
      A("Black Alt","#000000","#FD5A1E","#FFFFFF",null,false),
      A("Orange Alt","#FD5A1E","#000000","#FFFFFF","#27251F",false),
      A("Away","#adadad","#FD5A1E","#000000",null,false),
    ],
    cityConnect:C("#FD5A1E","#29097a","#1a0354","#FFFFFF",true),
  },
  STL: {
    primary:C("#ffffff","#000000","#d60000","#d60000",false),
    alternates:[
      A("Cream Alt","#fffbf5","#d60000","#d60000",null,false),
      A("Powder Alt","#38a1d1","#d60000","#d60000","#d60000",false),
      A("Away","#adadad","#d60000","#d60000",null,false),
    ],
    cityConnect:C("#d60000","#29097a","#740101","#FFFFFF",false),
  },
  TB: {
    primary:C("#ffffff","#f1da09","#0077d8","#040041",false),
    alternates:[
      A("Powder Alt","#0077d8","#f1da09","#FFFFFF",null,false),
      A("Devil Alt","#0077d8","#f1da09","#FFFFFF","#040041",true),
      A("Away","#adadad","#0077d8","#0077d8",null,false),
    ],
    cityConnect:C("#52f36d","#0077d8","#040041","#FFFFFF",true),
  },
  TEX: {
    primary:C("#ffffff","#000c42","#db0000","#000c42",false),
    alternates:[
      A("Powder Alt","#55bcec","#000c42","#FFFFFF",null,false),
      A("Blue Alt","#000c42","#000000","#FFFFFF","#db0000",false),
      A("Away","#adadad","#db0000","#000c42",null,false),
    ],
    cityConnect:C("#460000","#29097a","#9c8031","#9c8031",false),
  },
  TOR: {
    primary:C("#ffffff","#000000","#0026ff","#0026ff",false),
    alternates:[
      A("Blue Alt","#0026ff","#ffffff","#FFFFFF",null,false),
      A("Powder Alt","#4bace4","#000000","#FFFFFF","#0026ff",false),
      A("Away","#adadad","#0026ff","#0026ff",null,false),
    ],
    cityConnect:C("#f50303","#0026ff","#f50303","#FFFFFF",true),
  },
  WSH: {
    primary:C("#ffffff","#04003b","#cf0c0c","#04003b",false),
    alternates:[
      A("Blue Alt","#04003b","#cf0c0c","#ffffff",null,false),
      A("Away","#adadad","#8c1204","#8c1204",null,false),
    ],
    cityConnect:C("#44679e","#ba04b1","#162133","#ffffff",false),
  },
};

export function getAvailableLooks(abbr){
  const team=TEAM_COLORS[abbr];
  if(!team) return [{mode:"primary",index:0,label:"Primary"},{mode:"post",index:0,label:"Post"}];
  const looks=[{mode:"primary",index:0,label:"Primary"}];
  if(team.cityConnect) looks.push({mode:"cityConnect",index:0,label:"City Connect"});
  (team.alternates||[]).forEach((alt,index)=>{if(String(alt?.name||"").trim().toLowerCase()!=="post") looks.push({mode:"alternate",index,label:alt?.name||`Alt ${index+1}`});});
  (team.extras||[]).forEach((extra,index)=>looks.push({mode:"extra",index,label:extra?.name||`Extra ${index+1}`}));
  // Always expose Post. Teams without a saved postseason set preview Primary until you create one.
  looks.push({mode:"post",index:0,label:hasPostseasonPalette(abbr)?"Post":"Post (create)"});
  return looks;
}

export function getTeamColorsByAbbr(abbr,themeMode="primary",variantIndex=0){
  const fallback={main:"#071739",alt:"#2f66ff",border:"#2f66ff",text:"#ffffff",gradient:false,name:"Primary"};
  if(themeMode==="post") return {...getPostseasonColorsByAbbr(abbr),name:"Post"};
  if(!abbr||!TEAM_COLORS[abbr]) return fallback;
  const team=TEAM_COLORS[abbr];
  const normalize=(colors)=>({
    main:colors?.main||fallback.main,
    alt:colors?.alt||colors?.main||fallback.alt,
    border:colors?.border||colors?.alt||colors?.main||fallback.border,
    text:colors?.text||fallback.text,
    gradient:Boolean(colors?.gradient),
    name:colors?.name||"Primary",
  });
  if(themeMode==="cityConnect") return normalize(team.cityConnect||team.primary||fallback);
  if(themeMode==="alternate") return normalize(team.alternates?.[variantIndex]||team.primary||fallback);
  if(themeMode==="extra") return normalize(team.extras?.[variantIndex]||team.primary||fallback);
  return normalize(team.primary||fallback);
}

export function hasPostseasonPalette(abbr){
  const team=TEAM_COLORS[abbr];
  if(!team) return false;
  return Boolean(POSTSEASON_PALETTES[abbr])||(team.alternates||[]).some(look=>String(look?.name||"").trim().toLowerCase()==="post");
}

export function getPostseasonColorsByAbbr(abbr){
  const fallback={main:"#071739",alt:"#2f66ff",border:"#2f66ff",text:"#ffffff",gradient:false};
  if(!abbr||!TEAM_COLORS[abbr]) return fallback;
  const team=TEAM_COLORS[abbr];
  const compactPost=expandPostseasonPalette(POSTSEASON_PALETTES[abbr]);
  const legacyPost=(team.alternates||[]).find(look=>String(look?.name||"").trim().toLowerCase()==="post");
  const colors=compactPost||legacyPost||team.primary||fallback;
  return {
    main:colors.main||fallback.main,
    alt:colors.alt||colors.main||fallback.alt,
    border:colors.border||colors.alt||colors.main||fallback.border,
    text:colors.text||fallback.text,
    gradient:Boolean(colors.gradient),
  };
}
