import Actor5e from "../../../systems/dnd5e/module/actor/entity.js";
import { DND5E } from '../../../systems/dnd5e/module/config.js';
import ActorSheet5eCharacter from "../../../systems/dnd5e/module/actor/sheets/character.js";

//Changing out deprecated 5e skills to their Wands & Wizards counterparts1
DND5E.skills["arc"] = "Magical Theory";
DND5E.skills["his"] = "Muggle Studies";
DND5E.skills["nat"] = "Herbology";
DND5E.skills["ani"] = "Magical Creatures";

//Add potion-making to the character sheet as a skill
const prep = Actor5e.prototype.prepareBaseData;	

function extendActorData() {
	const dat = this.data.data;
	dat["newskills"] = dat["newskills"] || 
	{ "ptn": 
		{
			total: ''
		}
	};
	return prep.call(this);
}
Actor5e.prototype.prepareBaseData = extendActorData;

//Character sheets
class WandsAndWizardsBadgerSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
	  console.log("~~~~~~~~~~~BADGER SHEET ACTIVE~~~~~~~~~~~");
	  const options = super.defaultOptions;
	  options.classes.push('badger');
	  return options;
	}
  }
  
  class WandsAndWizardsEagleSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
	  console.log("~~~~~~~~~~~EAGLE SHEET ACTIVE~~~~~~~~~~~");
	  const options = super.defaultOptions;
	  options.classes.push('eagle');
	  return options;
	}
  }
  
  class WandsAndWizardsLionSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
	  console.log("~~~~~~~~~~~LION SHEET ACTIVE~~~~~~~~~~~");
	  const options = super.defaultOptions;
	  options.classes.push('lion');
	  return options;
	}
  }
  
  class WandsAndWizardsSnakeSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
	  console.log("~~~~~~~~~~~SNAKE SHEET ACTIVE~~~~~~~~~~~");
	  const options = super.defaultOptions;
	  options.classes.push('snake');
	  return options;
	}
  }
  
  class WandsAndWizardsBeauxbatonsSheet extends ActorSheet5eCharacter {
	static get defaultOptions() {
	  console.log("~~~~~~~~~~~BEAUXBATONS SHEET ACTIVE~~~~~~~~~~~");
	  const options = super.defaultOptions;
	  options.classes.push('beauxbatons');
	  return options;
	}
  }

//Registering Wands & Wizards character sheet theme options
	console.log(`Initializing character sheets for Wands & Wizards Module`);
	Actors.registerSheet("dnd5e", WandsAndWizardsBadgerSheet, { 
		types: ["character"],
		makeDefault: false 
	});
	Actors.registerSheet("dnd5e", WandsAndWizardsEagleSheet, { 
		types: ["character"], 
		makeDefault: false 
	});
	Actors.registerSheet("dnd5e", WandsAndWizardsLionSheet, { 
		types: ["character"], 
		makeDefault: false 
	});
	Actors.registerSheet("dnd5e", WandsAndWizardsSnakeSheet, { 
		types: ["character"],
		makeDefault: true 
	});
	Actors.registerSheet("dnd5e", WandsAndWizardsBeauxbatonsSheet, { 
		types: ["character"],
		makeDefault: true 
	});

	Hooks.on("renderActorSheet", (app, html, data) => {
		const skillslist = html.find("section.sheet-body").find("ul.skills-list");
		skillslist.append(`
			<li class="skill flexrow ptn" data-skill="wis">
				<input type="hidden" name="data.newskills.ptn.value" data-dtype="Number">
				<h4 class="skill-name">Potion-Making</h4>
				<span class="skill-ability custom">Wis</span>
				<span class="skill-mod custom"><input name="data.newskills.ptn.total" type="text" value="${data.data.newskills.ptn.total}" data-dtype="Text" placeholder="+0"/></span>
			</li>
		`); 
	});
	