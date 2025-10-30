Hooks.once("init", function () {
  // ==== W&W config tweaks ====
  CONFIG.DND5E.skills["ani"] = { label: "WANDS.SkillAnimal", ability: "wis" };     // Magical Creatures
  CONFIG.DND5E.skills["arc"] = { label: "WANDS.SkillArcana", ability: "int" };     // Magical Theory
  CONFIG.DND5E.skills["his"] = { label: "WANDS.SkillHistory", ability: "int" };    // Muggle Studies
  CONFIG.DND5E.skills["nat"] = { label: "WANDS.SkillHerbology", ability: "int" };  // Herbology
  CONFIG.DND5E.skills["ptn"] = { label: "WANDS.SkillPotion", ability: "wis" };     // Potion Making

  CONFIG.DND5E.spellSchools["cha"] = { label: "WANDS.SchoolCharms" };
  CONFIG.DND5E.spellSchools["jhc"] = { label: "WANDS.SchoolJHC" };
  CONFIG.DND5E.spellSchools["trf"] = { label: "WANDS.SchoolTransfig" };
  CONFIG.DND5E.spellSchools["hea"] = { label: "WANDS.SchoolHealing" };

  CONFIG.DND5E.currencies.pp.label = "Ruby";
  CONFIG.DND5E.currencies.gp.label = "Galleon";
  CONFIG.DND5E.currencies.sp.label = "Sickle";
  CONFIG.DND5E.currencies.cp.label = "Knut";

  // ==== Sheet base (prefer the new v5 sheet if present) ====
  const Base =
    dnd5e?.applications?.actor?.ActorSheet5eCharacter2 ??
    dnd5e?.applications?.actor?.ActorSheet5eCharacter;

  if (!Base) {
    console.warn("WANDS: could not locate a D&D5e character sheet base class.");
    return;
  }
  const isV2 = "DEFAULT_OPTIONS" in Base;
  const withThemeV2 = (theme) =>
    foundry.utils.mergeObject(Base.DEFAULT_OPTIONS ?? {}, {
      classes: [...(Base.DEFAULT_OPTIONS?.classes ?? []), theme]
    });

  // Helper to define a named class that works in both V2 and legacy
  function makeNamedSheet(className, theme) {
    // Define a named class by declaring it explicitly
    // V2 sheet: set DEFAULT_OPTIONS; Legacy: override defaultOptions getter
    // eslint-disable-next-line no-eval
    const cls = eval(`
      (class ${className} extends Base {
        static get defaultOptions() {
          if (${isV2}) return super.defaultOptions; // V2 ignores this
          const opts = super.defaultOptions;
          (opts.classes ??= []).push("${theme}");
          return opts;
        }
        static {
          if (${isV2}) this.DEFAULT_OPTIONS = (${withThemeV2.toString()})("${theme}");
        }
      })
    `);
    return cls;
  }

  // ==== Define seven uniquely-named sheet classes ====
  const WandsBadgerSheet      = makeNamedSheet("WandsBadgerSheet",      "badger");
  const WandsEagleSheet       = makeNamedSheet("WandsEagleSheet",       "eagle");
  const WandsLionSheet        = makeNamedSheet("WandsLionSheet",        "lion");
  const WandsSnakeSheet       = makeNamedSheet("WandsSnakeSheet",       "snake");
  const WandsBeauxbatonsSheet = makeNamedSheet("WandsBeauxbatonsSheet", "beauxbatons");
  const WandsIlvermornySheet  = makeNamedSheet("WandsIlvermornySheet",  "ilvermorny");
  const WandsDurmstrangSheet  = makeNamedSheet("WandsDurmstrangSheet",  "durmstrang");

  // ==== Register them ====
  const opts = (label) => ({ types: ["character"], makeDefault: false, label });
  Actors.registerSheet("dnd5e", WandsBadgerSheet,      opts("WANDS.Sheets.Badger"));
  Actors.registerSheet("dnd5e", WandsEagleSheet,       opts("WANDS.Sheets.Eagle"));
  Actors.registerSheet("dnd5e", WandsLionSheet,        opts("WANDS.Sheets.Lion"));
  Actors.registerSheet("dnd5e", WandsSnakeSheet,       opts("WANDS.Sheets.Snake"));
  Actors.registerSheet("dnd5e", WandsBeauxbatonsSheet, opts("WANDS.Sheets.Beauxbatons"));
  Actors.registerSheet("dnd5e", WandsIlvermornySheet,  opts("WANDS.Sheets.Ilvermorny"));
  Actors.registerSheet("dnd5e", WandsDurmstrangSheet,  opts("WANDS.Sheets.Durmstrang"));
});
