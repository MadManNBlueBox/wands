import Actor5e from "../../../systems/dnd5e/module/actor/entity.js";
import { DND5E } from "../../../systems/dnd5e/module/config.js";
import ActorSheet5eCharacter from "../../../systems/dnd5e/module/actor/sheets/character.js";
import ActorSheet5eNPC from "../../../systems/dnd5e/module/actor/sheets/npc.js";

Hooks.on("init", function () {
	//Changing out deprecated 5e skills to their Wands & Wizards counterparts1
	CONFIG.DND5E.skills["ani"] = "WANDS.SkillAnimal"; //Magical Creatures
	CONFIG.DND5E.skills["arc"] = "WANDS.SkillArcana"; //Magical Theory
	CONFIG.DND5E.skills["his"] = "WANDS.SkillHistory"; //Muggle Studies
	CONFIG.DND5E.skills["nat"] = "WANDS.SkillHerbology"; //Herbology
	CONFIG.DND5E.skills["ptn"] = "WANDS.SkillPotion"; //Herbology
});

Hooks.on("setup", () => {
	patchActor5ePreCreate();
	patchActorSheet5eDefaultOptions();
	// patchActorSheet5eOnDropItemCreate();
	patchActorSheet5eNPCDefaultOptions();
});

function patchActor5ePreCreate() {
	libWrapper.register(
		"wands",
		"CONFIG.Actor.documentClass.prototype._preCreate",
		function patchedPreCreate(wrapped, ...args) {
			wrapped(...args);

			this.data.update({
				data: {
					skills: {
						ptn: {
							value: 0,
							ability: "wis",
						},
					},
				},
			});
		},
		"WRAPPER"
	);
}

function patchActorSheet5eDefaultOptions() {
	libWrapper.register(
		"wands",
		"game.dnd5e.applications.ActorSheet5eCharacter.defaultOptions",
		function patchedDefaultOptions(...args) {
			return mergeObject(Object.getPrototypeOf(ActorSheet5eCharacter).defaultOptions, {
				classes: ["dnd5e", "sheet", "actor", "character"],
				width: 720,
				height: 700,
			});
		},
		"OVERRIDE"
	);
}

function patchActorSheet5eNPCDefaultOptions() {
	libWrapper.register(
		"wands",
		"game.dnd5e.applications.ActorSheet5eNPC.defaultOptions",
		function patchedDefaultOptions(...args) {
			return mergeObject(Object.getPrototypeOf(ActorSheet5eNPC).defaultOptions, {
				classes: ["dnd5e", "sheet", "actor", "npc"],
				width: 600,
				height: 700,
			});
		},
		"OVERRIDE"
	);
}

//Character sheets
class WandsAndWizardsBadgerSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("badger");
		return options;
	}
}
class WandsAndWizardsEagleSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("eagle");
		return options;
	}
}
class WandsAndWizardsLionSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("lion");
		return options;
	}
}
class WandsAndWizardsSnakeSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("snake");
		return options;
	}
}
class WandsAndWizardsBeauxbatonsSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("beauxbatons");
		return options;
	}
}
class WandsAndWizardsIlvermornySheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("ilvermorny");
		return options;
	}
}
class WandsAndWizardsDurmstrangSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("durmstrang");
		return options;
	}
}

//Registering Wands & Wizards character sheet theme options
Actors.registerSheet("dnd5e", WandsAndWizardsBadgerSheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Badger",
});
Actors.registerSheet("dnd5e", WandsAndWizardsEagleSheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Eagle",
});
Actors.registerSheet("dnd5e", WandsAndWizardsLionSheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Lion",
});
Actors.registerSheet("dnd5e", WandsAndWizardsSnakeSheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Snake",
});
Actors.registerSheet("dnd5e", WandsAndWizardsBeauxbatonsSheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Beauxbatons",
});
Actors.registerSheet("dnd5e", WandsAndWizardsIlvermornySheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Ilvermorny",
});
Actors.registerSheet("dnd5e", WandsAndWizardsDurmstrangSheet, {
	types: ["character"],
	makeDefault: false,
	label: "WANDS.Sheets.Durmstrang",
});
