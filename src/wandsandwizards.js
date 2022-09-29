Hooks.on("init", function () {
	//Changing out deprecated 5e skills to their Wands & Wizards counterparts1
	CONFIG.DND5E.skills["ani"] = { label: "WANDS.SkillAnimal" }; //Magical Creatures
	CONFIG.DND5E.skills["arc"] = { label: "WANDS.SkillArcana" }; //Magical Theory
	CONFIG.DND5E.skills["his"] = { label: "WANDS.SkillHistory" }; //Muggle Studies
	CONFIG.DND5E.skills["nat"] = { label: "WANDS.SkillHerbology" }; //Herbology
	CONFIG.DND5E.skills["ptn"] = { label: "WANDS.SkillPotion", ability: "wis" }; //Potion Making
});

//Character sheets
class WandsAndWizardsBadgerSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("badger");
		return options;
	}
}
class WandsAndWizardsEagleSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("eagle");
		return options;
	}
}
class WandsAndWizardsLionSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("lion");
		return options;
	}
}
class WandsAndWizardsSnakeSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("snake");
		return options;
	}
}
class WandsAndWizardsBeauxbatonsSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("beauxbatons");
		return options;
	}
}
class WandsAndWizardsIlvermornySheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.classes.push("ilvermorny");
		return options;
	}
}
class WandsAndWizardsDurmstrangSheet extends dnd5e.applications.actor.ActorSheet5eCharacter {
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