# W&W Module for Foundry VTT 
**By MadManNBlueBox and Sparkcity**

This module for the DnD5e - Fifth Edition System for Foundry Virtual Tabletop provides additional functionality and support for the rule set from Wands & Wizards W.A.N.D.S. Rulebook by Murphen44.

It adds compendiums including races known as Houses, classes known as Casting Styles, subclasses known as Schools of Magic, the feature associated with each, creatures; good and bad, and much, much more. In addition to the compendiums, it also provides custom character sheets for each house.

**To install the module:**

In FoundryVTT Configuration and Setup, go to the "Add-on Modules" tab. Select "Install Module", copy this URL:
https://github.com/jaredraycoleman/wands/releases/download/0.12.0/module.json
Paste the URL in the "Manifest URL" field, and click Install.
This is unofficial Fan Content and not an official FoundryVTT module.

**What is Foundry VTT?**

Foundry Virtual Tabletop is an application built to run multiplayer tabletop roleplaying games over the internet. Foundry VTT is a paid application, not free. You can find more information here at Foundry’s official website: 
https://foundryvtt.com/article/faq/

**References:**

Wands & Wizards: W.A.N.D.S. Rulebook

Wands & Wizards: The Monster Book of Monsters


## Developer Instructions

If you want to contribute to or work on this module locally, follow these steps.

### Prerequisites

* **Foundry VTT** installed (to test the module).
* **Foundry CLI (`fvtt`)** installed:

  ```powershell
  npm install -g @foundryvtt/foundryvtt-cli
  ```
* **Node.js** `v22.18.0`
* **npm** `v10.9.3`
* **PowerShell** (built into Windows)

### Setup

1. **Clone the repository**

   ```powershell
   git clone https://github.com/jaredraycoleman/wands.git
   cd wands
   ```

2. **Make Foundry see the module**

   * Recommended: create a symlink from the repo to your Foundry `Data/modules` folder (run PowerShell as Administrator):

     ```powershell
     mklink /D "<FoundryDataPath>\Data\modules\wands" "$((Get-Location).Path)"
     ```
   * Or, copy the folder into `<FoundryDataPath>\Data\modules\wands` (less ideal for development).

3. **Install dependencies** (only needed for helper scripts)

   ```powershell
   npm install
   ```

### Working with Compendiums

Compendiums are stored as `.db` files under `packs/` for Foundry. For editing, unpack them into JSON under `packs-json/`.

**Unpack all packs**

```powershell
powershell .\scripts\packs.ps1 unpack
```

**Pack all packs**

```powershell
powershell .\scripts\packs.ps1 pack
```

**Workflow**

1. Unpack: exports `.db` files in `packs/` to JSON in `packs-json/`.
2. Edit JSON in `packs-json/`.
3. Pack: regenerates `.db` files in `packs/`.
4. Launch Foundry VTT and test.

### Scripts

* `scripts/packs.ps1`: runs `fvtt package pack/unpack` for every pack.
* `scripts/edit-potions.js`: example bulk editor to set potion weights and rarity-based prices.

### Troubleshooting

* **`fvtt` not found:** install it with `npm install -g @foundryvtt/foundryvtt-cli`.
* **Script execution blocked:** run with an execution policy bypass:

  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\packs.ps1 unpack
  ```
* **Symlink errors on Windows:** run PowerShell as Administrator, or copy the folder instead of linking.

### Contributing

* Always edit JSON in `packs-json/` (never the `.db` files directly).
* Test changes in Foundry before committing.
* Open a Pull Request describing what you changed and why.
