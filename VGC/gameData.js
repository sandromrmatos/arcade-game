// VGC Game Data Module
// Loads and structures data from CSV files

class GameData {
    constructor() {
        this.creatures = [];
        this.moves = new Map();
        this.abilities = new Map();
    }

    // Parse CSV text into array of objects
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] ? values[index].trim() : '';
            });
            data.push(obj);
        }
        return data;
    }

    // Parse a single CSV line handling commas inside values
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        return values;
    }

    // Load all data from CSV files
    async loadAllData() {
        try {
            // Load Creatures
            const creaturesResponse = await fetch('Creatures.csv');
            const creaturesText = await creaturesResponse.text();
            const creaturesData = this.parseCSV(creaturesText);
            
            // Load Moves
            const movesResponse = await fetch('Moves.csv');
            const movesText = await movesResponse.text();
            const movesData = this.parseCSV(movesText);
            
            // Load Abilities
            const abilitiesResponse = await fetch('Abilities.csv');
            const abilitiesText = await abilitiesResponse.text();
            const abilitiesData = this.parseCSV(abilitiesText);

            // Process creatures
            this.creatures = creaturesData.map(c => this.processCreature(c));
            
            // Process moves
            movesData.forEach(m => {
                const move = this.processMove(m);
                this.moves.set(move.name, move);
            });
            
            // Process abilities
            abilitiesData.forEach(a => {
                const ability = this.processAbility(a);
                this.abilities.set(ability.name, ability);
            });

            console.log('Loaded:', this.creatures.length, 'creatures,', this.moves.size, 'moves,', this.abilities.size, 'abilities');
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }

    processCreature(data) {
        // Extract moves (Move 1 through Move 12)
        const learnableMoves = [];
        for (let i = 1; i <= 12; i++) {
            const moveName = data[`Move ${i}`];
            if (moveName) {
                learnableMoves.push(moveName.trim());
            }
        }

        return {
            name: data.Name,
            type: data.Type,
            sprite: data['PNG asset'],
            baseStats: {
                hp: parseInt(data.HP),
                attack: parseInt(data.Attack),
                defense: parseInt(data.Defense),
                specialAttack: parseInt(data['Special Attack']),
                specialDefense: parseInt(data['Special Defense']),
                speed: parseInt(data.Speed)
            },
            totalStats: parseInt(data['Total Stats']),
            learnableMoves: learnableMoves,
            abilities: [
                data['Ability 1'].trim(),
                data['Ability 2'].trim()
            ]
        };
    }

    processMove(data) {
        return {
            name: data.Name,
            type: data.Type,
            power: parseInt(data.Power) || 0,
            accuracy: parseInt(data.Accuracy.replace('%', '')) || 100,
            secondaryEffects: data['Secondary Effects'],
            targetingType: data['Targeting Type'],
            category: data.Category,
            priority: parseInt(data.Priority) || 1
        };
    }

    processAbility(data) {
        return {
            name: data.Ability,
            description: data.Description
        };
    }

    getCreatureByName(name) {
        return this.creatures.find(c => c.name === name);
    }

    getMoveByName(name) {
        return this.moves.get(name);
    }

    getAbilityByName(name) {
        return this.abilities.get(name);
    }

    // Create a deep copy of creature data for team building
    createCreatureCopy(creatureName) {
        const base = this.getCreatureByName(creatureName);
        if (!base) return null;
        
        return JSON.parse(JSON.stringify(base));
    }
}

// Global game data instance
const gameData = new GameData();
