// Farming Town - Bilingual Translation System (English/Portuguese)

const Translations = {
  en: {
    // === UI ELEMENTS ===
    playerName: "Player",
    level: "Level",
    xp: "XP",
    coins: "Coins",
    inventory: "Inventory",
    marketplace: "Marketplace",
    missions: "Missions",
    createPlot: "Create Plot (2🪙)",
    plantCrops: "Plant Crops",
    stopPlanting: "Stop Planting",
    visitFriend: "Visit a Friend",
    help: "Help",
    loading: "Loading...",
    ok: "OK",
    warning: "Warning",
    collected: "Collected",
    notReady: "Not ready yet",
    grass: "Grass",
    emptyPlot: "Empty Plot - Click to plant",
    clickToInteract: "Click to interact",
    grassTileOptions: "Use buttons at top to create plot, or inventory to place trees/buildings",
    selectGrassTile: "Select a grass tile to convert to plot (costs 2 coins)",
    gridExpanded: "Grid expanded!",
    selectTileForRoad: "Click on a grass tile to place road",
    decorativeRoad: "Decorative road tile",
    notEnoughItems: "Not enough items!",
    selectLandPlacement: "Click adjacent to your farm to place the new 5x5 land block. It must be aligned with existing tiles.",
    invalidLandPlacement: "Invalid placement! Block must be aligned (multiples of 5) and adjacent to existing land.",
    landBlockPlaced: "5x5 land block placed! (+25 tiles)",
    cancel: "Cancel",
    continue: "Continue",
    close: "Close",
    buy: "Buy",
    sell: "Sell",
    collect: "Collect",
    start: "Start",
    harvest: "Harvest",
    plant: "Plant",
    planting: "Planting",
    place: "Place",
    confirm: "Confirm",
    clickEmptyPlots: "Click on empty plots to plant",
    outOfSeeds: "Out of seeds:",
    plantingModeStopped: "Planting mode stopped",
    selectPlayer: "Select a player",
    loadingPlayers: "Loading players...",
    visit: "Visit",
    returnToMyFarm: "Return to My Farm",
    visiting: "Visiting",
    noOtherPlayers: "No other players found",
    viewMode: "(View Only - You cannot interact)",
    tiles: "tiles",

    // === INVENTORY TABS ===
    seeds: "Seeds",
    crops: "Crops & Fruits",
    products: "Products",
    buildingsTab: "Buildings",
    farmsTab: "Farms",
    treesTab: "Trees",

    // === MARKETPLACE TABS ===
    buySeeds: "Buy Seeds",
    buyBuildings: "Buy Buildings",
    buyFarms: "Buy Farms",
    buyDecorations: "Buy Decorations",
    buyLand: "Buy Land",

    // === MODALS ===
    plantSeed: "Plant Seed",
    placeTree: "Place Tree",
    placeBuilding: "Place Building",
    selectRecipe: "Select Recipe",
    levelUp: "Level Up!",
    reachedLevel: "You reached level",
    clickToPlace: "Click on the grid to place the building",
    
    // === CROPS ===
    wheat: "Wheat",
    wheatSeed: "Wheat Seed",
    tomato: "Tomato",
    tomatoSeed: "Tomato Seed",
    potato: "Potato",
    potatoSeed: "Potato Seed",
    leek: "Leek",
    leekSeed: "Leek Seed",
    corn: "Corn",
    cornSeed: "Corn Seed",
    carrot: "Carrot",
    carrotSeed: "Carrot Seed",
    onion: "Onion",
    onionSeed: "Onion Seed",

    // === FRUIT TREES ===
    apple: "Apple",
    appleTree: "Apple Tree",
    lemon: "Lemon",
    lemonTree: "Lemon Tree",
    orange: "Orange",
    orangeTree: "Orange Tree",

    // === BUILDINGS ===
    mill: "Mill",
    millKit: "Mill Kit",
    pigFarm: "Pig Farm",
    pigFarmKit: "Pig Farm Kit",
    chickenFarm: "Chicken Farm",
    chickenFarmKit: "Chicken Farm Kit",
    bakery: "Bakery",
    bakeryKit: "Bakery Kit",
    butcher: "Butcher",
    butcherKit: "Butcher Kit",
    cowFarm: "Cow Farm",
    cowFarmKit: "Cow Farm Kit",
    restaurant: "Restaurant",
    restaurantKit: "Restaurant Kit",
    cinema: "Cinema",
    cinemaKit: "Cinema Kit",

    // === PRODUCTS ===
    flour: "Flour",
    porridge: "Porridge",
    pig: "Pig",
    chicken: "Chicken",
    chickenAndEggs: "Chicken & Eggs",
    egg: "Egg",
    bread: "Bread",
    cake: "Cake",
    potatoScone: "Potato Scone",
    sausage: "Sausage",
    steak: "Steak",
    cow: "Cow",
    salad: "Salad",
    soup: "Soup",
    lemonade: "Lemonade",
    stew: "Stew",
    animalFeed: "Animal Feed",
    popcorn: "Popcorn",
    onionRings: "Onion Rings",
    orangeJuice: "Orange Juice",

    // === DECORATIONS ===
    road: "Road",

    // === TIME UNITS ===
    minutes: "minutes",
    hours: "hours",
    minute: "minute",
    hour: "hour",
    timeLeft: "Time left",
    ready: "Ready!",
    growing: "Growing",
    ripening: "Ripening",
    constructing: "Constructing",
    producing: "Producing",

    // === MARKETPLACE MESSAGES ===
    unlockAtLevel: "Unlock at level",
    size: "Size",
    constructionTime: "Construction time",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    owned: "Owned",
    maxOwned: "Max owned",
    canBuySecondAt: "Can buy 2nd at level",
    expandGrid: "Expand Grid (5x5)",
    currentGrid: "Current grid",
    maxGridReached: "Maximum grid size reached!",
    
    // === PRODUCTION MESSAGES ===
    slot: "Slot",
    empty: "Empty",
    selectARecipe: "Select a recipe to start production",
    ingredients: "Ingredients",
    produces: "Produces",
    productionTime: "Production time",
    notEnoughIngredients: "Not enough ingredients!",
    productionStarted: "Production started!",
    productionComplete: "Production complete! Click to collect.",

    // === NOTIFICATIONS ===
    notEnoughCoins: "Not enough coins!",
    notEnoughSeeds: "You need seeds in your inventory!",
    cannotAfford: "You cannot afford this purchase as it would leave you with 0 coins and no seeds!",
    mustBuySeeds: "You must buy seeds first to ensure you can continue farming.",
    plotCreated: "Plot created!",
    seedPlanted: "Seed planted!",
    harvested: "Harvested!",
    fruitCollected: "Fruit collected!",
    treePlaced: "Tree placed!",
    buildingPlaced: "Building placement started!",
    constructionComplete: "Construction complete!",
    itemSold: "Item sold!",
    itemPurchased: "Item purchased!",
    invalidPlacement: "Invalid placement! Check building size and tile availability.",
    noEmptySlots: "No empty production slots available!",
    selectTile: "Please select a tile first.",
    tileOccupied: "This tile is already occupied!",
    needGrassTile: "Trees and buildings need grass tiles!",
    needPlotTile: "Crops need plot tiles!",
    
    // === INVENTORY MESSAGES ===
    emptyInventory: "Your inventory is empty!",
    noSeeds: "You don't have any seeds.",
    noTrees: "You don't have any trees.",
    noBuildings: "You don't have any building kits.",
    noItemsToSell: "You don't have any items to sell.",

    // === LEVEL UP REWARDS ===
    rewards: "Rewards",
    youReceived: "You received",
    newUnlocks: "New unlocks available!",

    // === BUILDING INFO ===
    availableRecipes: "Available recipes",
    slotEmpty: "This slot is empty. Click 'Start' to begin production.",
    
    // === HELP CONTENT ===
    helpTitle: "How to Play Farming Town",
    
    helpBasics: "Game Basics",
    helpBasicsText: "Welcome to Farming Town! You start with 20 coins and a 5x5 grid. Your goal is to grow crops, raise animals, produce goods, and level up by earning XP.",
    
    helpFarming: "Farming",
    helpFarmingText: "1. Click 'Create Plot' to convert grass into farmable soil (costs 2 coins).\n2. Click on a plot to plant seeds from your inventory.\n3. Wait for crops to grow (times vary by crop type).\n4. Click on ready crops to harvest them.\n5. Harvesting gives you crops and XP!",
    
    helpTrees: "Fruit Trees",
    helpTreesText: "Fruit trees are received as level-up rewards. Place them on grass tiles (not plots). Once placed, they produce fruit periodically. Collect ripe fruit by clicking on the tree. Trees continue producing fruit indefinitely!",
    
    helpBuildings: "Buildings & Production",
    helpBuildingsText: "1. Buy building kits from the marketplace (unlocked at higher levels).\n2. Place buildings on grass tiles (check size requirements).\n3. Wait for construction to complete.\n4. Click on finished buildings to access 3 production slots.\n5. Select recipes and provide ingredients to start production.\n6. Collect finished products for XP and to sell!",
    
    helpMarketplace: "Marketplace",
    helpMarketplaceText: "• SELL: Sell crops, fruits, and products for coins and XP.\n• BUY SEEDS: Purchase seeds to plant (available based on level).\n• BUY BUILDINGS: Purchase building kits (can own up to 2 of each).\n• BUY DECORATIONS: Buy roads and decorative items.\n• BUY LAND: Expand your grid in 5x5 increments (up to 50x100).",
    
    helpLeveling: "Leveling & XP",
    helpLevelingText: "Earn XP by:\n• Harvesting crops\n• Collecting fruit from trees\n• Collecting products from buildings\n• Selling items in the marketplace\n\nLevel up to unlock new crops, buildings, and recipes! Some levels reward you with free fruit trees.",
    
    helpTips: "Tips & Strategies",
    helpTipsText: "• Never run out of coins without seeds! The game warns you to prevent this.\n• Plant wheat early - it's cheap and grows fast.\n• Build production chains: grow wheat → make flour → bake bread.\n• Expand your grid when you need more space.\n• Check what unlocks at the next level to plan ahead!",
    
    helpControls: "Controls",
    helpControlsText: "• Hover over tiles to see information\n• Click tiles to interact (harvest, plant, collect)\n• Click buildings to manage production\n• Use buttons at the top for inventory and marketplace\n• Switch between EN/PT languages anytime",

    // === CROP DESCRIPTIONS ===
    wheatDesc: "Fast-growing staple crop. Unlocks at level 1.",
    tomatoDesc: "Juicy vegetable that grows 2 per seed. Unlocks at level 3.",
    potatoDesc: "Hearty crop that takes time but yields well. Unlocks at level 6.",
    leekDesc: "Premium vegetable for advanced recipes. Unlocks at level 8.",
    cornDesc: "Versatile crop for feed and snacks. Unlocks at level 5.",
    carrotDesc: "Nutritious vegetable for complex dishes. Unlocks at level 10.",
    onionDesc: "Essential ingredient for many recipes. Unlocks at level 11.",

    // === TREE DESCRIPTIONS ===
    appleTreeDesc: "Produces 3 apples every 60 minutes. Received as reward.",
    lemonTreeDesc: "Produces 2 lemons every 120 minutes. Received as reward.",
    orangeTreeDesc: "Produces 3 oranges every 360 minutes. Received as reward.",

    // === BUILDING DESCRIPTIONS ===
    millDesc: "Processes wheat into flour and porridge. Unlocks at level 4.",
    pigFarmDesc: "Raises pigs from wheat. Unlocks at level 5.",
    chickenFarmDesc: "Produces chickens and eggs. Unlocks at level 6.",
    bakeryDesc: "Bakes bread, cakes, and scones. Unlocks at level 7.",
    butcherDesc: "Processes animals into meat products. Unlocks at level 8.",
    cowFarmDesc: "Raises cows from wheat. Unlocks at level 9.",
    restaurantDesc: "Creates gourmet dishes from ingredients. Unlocks at level 10.",
    cinemaDesc: "Produces snacks and refreshments. Unlocks at level 11.",

    // === MISSIONS ===
    missionsHarvest: "Harvest Missions",
    missionsProduction: "Production Missions",
    missionProgress: "Progress",
    missionCompleted: "Completed!",
    missionReward: "Reward",
    claimReward: "Claim Reward",
    missionClaimed: "Reward claimed!",
    missionHarvest: "Harvest",
    missionProduce: "Produce",
  },

  pt: {
    // === ELEMENTOS UI ===
    playerName: "Jogador",
    level: "Nível",
    xp: "XP",
    coins: "Moedas",
    inventory: "Inventário",
    marketplace: "Mercado",
    missions: "Missões",
    createPlot: "Criar Terreno (2🪙)",
    plantCrops: "Plantar Culturas",
    stopPlanting: "Parar Plantio",
    visitFriend: "Visitar um Amigo",
    help: "Ajuda",
    marketplace: "Mercado",
    createPlot: "Criar Terreno (2🪙)",
    help: "Ajuda",
    loading: "Carregando...",
    ok: "OK",
    warning: "Aviso",
    collected: "Coletado",
    notReady: "Ainda não está pronto",
    grass: "Grama",
    emptyPlot: "Terreno Vazio - Clique para plantar",
    clickToInteract: "Clique para interagir",
    grassTileOptions: "Use botões no topo para criar terreno, ou inventário para colocar árvores/edifícios",
    selectGrassTile: "Selecione um tile de grama para converter em terreno (custa 2 moedas)",
    gridExpanded: "Grade expandida!",
    selectTileForRoad: "Clique em um tile de grama para colocar estrada",
    decorativeRoad: "Tile de estrada decorativa",
    notEnoughItems: "Itens insuficientes!",
    selectLandPlacement: "Clique adjacente à sua fazenda para colocar o novo bloco de terra 5x5. Deve estar alinhado com tiles existentes.",
    invalidLandPlacement: "Colocação inválida! Bloco deve estar alinhado (múltiplos de 5) e adjacente à terra existente.",
    landBlockPlaced: "Bloco de terra 5x5 colocado! (+25 tiles)",
    cancel: "Cancelar",
    continue: "Continuar",
    close: "Fechar",
    buy: "Comprar",
    sell: "Vender",
    collect: "Coletar",
    start: "Iniciar",
    harvest: "Colher",
    plant: "Plantar",
    planting: "Plantando",
    place: "Colocar",
    confirm: "Confirmar",
    clickEmptyPlots: "Clique em terrenos vazios para plantar",
    outOfSeeds: "Sem sementes:",
    plantingModeStopped: "Modo de plantio parado",
    selectPlayer: "Selecione um jogador",
    loadingPlayers: "Carregando jogadores...",
    visit: "Visitar",
    returnToMyFarm: "Voltar para Minha Fazenda",
    visiting: "Visitando",
    noOtherPlayers: "Nenhum outro jogador encontrado",
    viewMode: "(Apenas Visualização - Você não pode interagir)",
    tiles: "tiles",

    // === ABAS INVENTÁRIO ===
    seeds: "Sementes",
    crops: "Colheitas e Frutas",
    products: "Produtos",
    buildingsTab: "Edifícios",
    farmsTab: "Fazendas",
    treesTab: "Árvores",

    // === ABAS MERCADO ===
    buySeeds: "Comprar Sementes",
    buyBuildings: "Comprar Edifícios",
    buyFarms: "Comprar Fazendas",
    buyDecorations: "Comprar Decorações",
    buyLand: "Comprar Terreno",

    // === MODAIS ===
    plantSeed: "Plantar Semente",
    placeTree: "Colocar Árvore",
    placeBuilding: "Colocar Edifício",
    selectRecipe: "Selecionar Receita",
    levelUp: "Subiu de Nível!",
    reachedLevel: "Você alcançou o nível",
    clickToPlace: "Clique na grade para colocar o edifício",

    // === CULTURAS ===
    wheat: "Trigo",
    wheatSeed: "Semente de Trigo",
    tomato: "Tomate",
    tomatoSeed: "Semente de Tomate",
    potato: "Batata",
    potatoSeed: "Semente de Batata",
    leek: "Alho-poró",
    leekSeed: "Semente de Alho-poró",
    corn: "Milho",
    cornSeed: "Semente de Milho",
    carrot: "Cenoura",
    carrotSeed: "Semente de Cenoura",
    onion: "Cebola",
    onionSeed: "Semente de Cebola",

    // === ÁRVORES FRUTÍFERAS ===
    apple: "Maçã",
    appleTree: "Macieira",
    lemon: "Limão",
    lemonTree: "Limoeiro",
    orange: "Laranja",
    orangeTree: "Laranjeira",

    // === EDIFÍCIOS ===
    mill: "Moinho",
    millKit: "Kit Moinho",
    pigFarm: "Fazenda de Porcos",
    pigFarmKit: "Kit Fazenda de Porcos",
    chickenFarm: "Fazenda de Galinhas",
    chickenFarmKit: "Kit Fazenda de Galinhas",
    bakery: "Padaria",
    bakeryKit: "Kit Padaria",
    butcher: "Açougue",
    butcherKit: "Kit Açougue",
    cowFarm: "Fazenda de Vacas",
    cowFarmKit: "Kit Fazenda de Vacas",
    restaurant: "Restaurante",
    restaurantKit: "Kit Restaurante",
    cinema: "Cinema",
    cinemaKit: "Kit Cinema",

    // === PRODUTOS ===
    flour: "Farinha",
    porridge: "Mingau",
    pig: "Porco",
    chicken: "Galinha",
    chickenAndEggs: "Galinha e Ovos",
    egg: "Ovo",
    bread: "Pão",
    cake: "Bolo",
    potatoScone: "Scone de Batata",
    sausage: "Salsicha",
    steak: "Bife",
    cow: "Vaca",
    salad: "Salada",
    soup: "Sopa",
    lemonade: "Limonada",
    stew: "Ensopado",
    animalFeed: "Ração Animal",
    popcorn: "Pipoca",
    onionRings: "Anéis de Cebola",
    orangeJuice: "Suco de Laranja",

    // === DECORAÇÕES ===
    road: "Estrada",

    // === UNIDADES DE TEMPO ===
    minutes: "minutos",
    hours: "horas",
    minute: "minuto",
    hour: "hora",
    timeLeft: "Tempo restante",
    ready: "Pronto!",
    growing: "Crescendo",
    ripening: "Amadurecendo",
    constructing: "Construindo",
    producing: "Produzindo",

    // === MENSAGENS MERCADO ===
    unlockAtLevel: "Desbloquear no nível",
    size: "Tamanho",
    constructionTime: "Tempo de construção",
    price: "Preço",
    quantity: "Quantidade",
    total: "Total",
    owned: "Possui",
    maxOwned: "Máximo",
    canBuySecondAt: "Pode comprar 2º no nível",
    expandGrid: "Expandir Grade (5x5)",
    currentGrid: "Grade atual",
    maxGridReached: "Tamanho máximo da grade alcançado!",

    // === MENSAGENS PRODUÇÃO ===
    slot: "Slot",
    empty: "Vazio",
    selectARecipe: "Selecione uma receita para iniciar a produção",
    ingredients: "Ingredientes",
    produces: "Produz",
    productionTime: "Tempo de produção",
    notEnoughIngredients: "Ingredientes insuficientes!",
    productionStarted: "Produção iniciada!",
    productionComplete: "Produção completa! Clique para coletar.",

    // === NOTIFICAÇÕES ===
    notEnoughCoins: "Moedas insuficientes!",
    notEnoughSeeds: "Você precisa de sementes no inventário!",
    cannotAfford: "Você não pode fazer esta compra pois ficaria com 0 moedas e sem sementes!",
    mustBuySeeds: "Você deve comprar sementes primeiro para garantir que possa continuar cultivando.",
    plotCreated: "Terreno criado!",
    seedPlanted: "Semente plantada!",
    harvested: "Colhido!",
    fruitCollected: "Fruta coletada!",
    treePlaced: "Árvore colocada!",
    buildingPlaced: "Colocação do edifício iniciada!",
    constructionComplete: "Construção completa!",
    itemSold: "Item vendido!",
    itemPurchased: "Item comprado!",
    invalidPlacement: "Colocação inválida! Verifique o tamanho do edifício e disponibilidade de tiles.",
    noEmptySlots: "Não há slots de produção vazios disponíveis!",
    selectTile: "Por favor, selecione um tile primeiro.",
    tileOccupied: "Este tile já está ocupado!",
    needGrassTile: "Árvores e edifícios precisam de tiles de grama!",
    needPlotTile: "Culturas precisam de terreno cultivável!",

    // === MENSAGENS INVENTÁRIO ===
    emptyInventory: "Seu inventário está vazio!",
    noSeeds: "Você não tem sementes.",
    noTrees: "Você não tem árvores.",
    noBuildings: "Você não tem kits de construção.",
    noItemsToSell: "Você não tem itens para vender.",

    // === RECOMPENSAS NÍVEL ===
    rewards: "Recompensas",
    youReceived: "Você recebeu",
    newUnlocks: "Novos desbloqueios disponíveis!",

    // === INFO EDIFÍCIO ===
    availableRecipes: "Receitas disponíveis",
    slotEmpty: "Este slot está vazio. Clique em 'Iniciar' para começar a produção.",

    // === CONTEÚDO AJUDA ===
    helpTitle: "Como Jogar Farming Town",
    
    helpBasics: "Básico do Jogo",
    helpBasicsText: "Bem-vindo ao Farming Town! Você começa com 20 moedas e uma grade 5x5. Seu objetivo é cultivar, criar animais, produzir bens e subir de nível ganhando XP.",
    
    helpFarming: "Agricultura",
    helpFarmingText: "1. Clique em 'Criar Terreno' para converter grama em solo cultivável (custa 2 moedas).\n2. Clique em um terreno para plantar sementes do seu inventário.\n3. Aguarde as culturas crescerem (tempos variam por tipo).\n4. Clique nas culturas prontas para colhê-las.\n5. Colher dá culturas e XP!",
    
    helpTrees: "Árvores Frutíferas",
    helpTreesText: "Árvores frutíferas são recebidas como recompensas de nível. Coloque-as em tiles de grama (não em terrenos). Uma vez colocadas, produzem frutas periodicamente. Colete frutas maduras clicando na árvore. Árvores continuam produzindo indefinidamente!",
    
    helpBuildings: "Edifícios e Produção",
    helpBuildingsText: "1. Compre kits de construção no mercado (desbloqueados em níveis mais altos).\n2. Coloque edifícios em tiles de grama (verifique requisitos de tamanho).\n3. Aguarde a construção ser concluída.\n4. Clique em edifícios prontos para acessar 3 slots de produção.\n5. Selecione receitas e forneça ingredientes para iniciar a produção.\n6. Colete produtos finalizados para XP e venda!",
    
    helpMarketplace: "Mercado",
    helpMarketplaceText: "• VENDER: Venda culturas, frutas e produtos por moedas e XP.\n• COMPRAR SEMENTES: Compre sementes para plantar (disponíveis por nível).\n• COMPRAR EDIFÍCIOS: Compre kits de construção (pode possuir até 2 de cada).\n• COMPRAR DECORAÇÕES: Compre estradas e itens decorativos.\n• COMPRAR TERRENO: Expanda sua grade em incrementos de 5x5 (até 50x100).",
    
    helpLeveling: "Nivelamento e XP",
    helpLevelingText: "Ganhe XP ao:\n• Colher culturas\n• Coletar frutas de árvores\n• Coletar produtos de edifícios\n• Vender itens no mercado\n\nSuba de nível para desbloquear novas culturas, edifícios e receitas! Alguns níveis recompensam com árvores frutíferas grátis.",
    
    helpTips: "Dicas e Estratégias",
    helpTipsText: "• Nunca fique sem moedas e sem sementes! O jogo avisa para prevenir isso.\n• Plante trigo cedo - é barato e cresce rápido.\n• Construa cadeias de produção: cultive trigo → faça farinha → asse pão.\n• Expanda sua grade quando precisar de mais espaço.\n• Verifique o que desbloqueia no próximo nível para planejar!",
    
    helpControls: "Controles",
    helpControlsText: "• Passe o mouse sobre tiles para ver informações\n• Clique em tiles para interagir (colher, plantar, coletar)\n• Clique em edifícios para gerenciar produção\n• Use botões no topo para inventário e mercado\n• Alterne entre idiomas EN/PT a qualquer momento",

    // === DESCRIÇÕES CULTURAS ===
    wheatDesc: "Cultura básica de crescimento rápido. Desbloqueia no nível 1.",
    tomatoDesc: "Vegetal suculento que cresce 2 por semente. Desbloqueia no nível 3.",
    potatoDesc: "Cultura resistente que leva tempo mas rende bem. Desbloqueia no nível 6.",
    leekDesc: "Vegetal premium para receitas avançadas. Desbloqueia no nível 8.",
    cornDesc: "Cultura versátil para ração e lanches. Desbloqueia no nível 5.",
    carrotDesc: "Vegetal nutritivo para pratos complexos. Desbloqueia no nível 10.",
    onionDesc: "Ingrediente essencial para muitas receitas. Desbloqueia no nível 11.",

    // === DESCRIÇÕES ÁRVORES ===
    appleTreeDesc: "Produz 3 maçãs a cada 60 minutos. Recebido como recompensa.",
    lemonTreeDesc: "Produz 2 limões a cada 120 minutos. Recebido como recompensa.",
    orangeTreeDesc: "Produz 3 laranjas a cada 360 minutos. Recebido como recompensa.",

    // === DESCRIÇÕES EDIFÍCIOS ===
    millDesc: "Processa trigo em farinha e mingau. Desbloqueia no nível 4.",
    pigFarmDesc: "Cria porcos a partir de trigo. Desbloqueia no nível 5.",
    chickenFarmDesc: "Produz galinhas e ovos. Desbloqueia no nível 6.",
    bakeryDesc: "Assa pães, bolos e scones. Desbloqueia no nível 7.",
    butcherDesc: "Processa animais em produtos de carne. Desbloqueia no nível 8.",
    cowFarmDesc: "Cria vacas a partir de trigo. Desbloqueia no nível 9.",
    restaurantDesc: "Cria pratos gourmet a partir de ingredientes. Desbloqueia no nível 10.",
    cinemaDesc: "Produz lanches e refrescos. Desbloqueia no nível 11.",

    // === MISSÕES ===
    missionsHarvest: "Missões de Colheita",
    missionsProduction: "Missões de Produção",
    missionProgress: "Progresso",
    missionCompleted: "Completo!",
    missionReward: "Recompensa",
    claimReward: "Coletar Recompensa",
    missionClaimed: "Recompensa coletada!",
    missionHarvest: "Colher",
    missionProduce: "Produzir",
  }
};

// Translation system
let currentLanguage = 'en';

// Get translated text
function t(key) {
  return Translations[currentLanguage][key] || key;
}

// Update all elements with data-i18n attribute
function updateLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    // Update text content or placeholder
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else if (element.tagName === 'BUTTON' || element.tagName === 'OPTION') {
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });
}

// Get language from parent window (for iframe integration)
function getParentLanguage() {
  if (window.parent && window.parent !== window) {
    try {
      const parentLang = window.parent.localStorage.getItem('arcadeLanguage');
      if (parentLang) {
        return parentLang;
      }
    } catch (e) {
      console.log('Cannot access parent language');
    }
  }
  return localStorage.getItem('farmingTownLanguage') || 'en';
}

// Set language and save to localStorage
function setLanguage(lang) {
  if (Translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('farmingTownLanguage', lang);
    updateLanguage();
    
    // Notify parent window of language change (for iframe integration)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'languageChange', language: lang }, '*');
    }
    
    return true;
  }
  return false;
}

// Listen for language changes from parent window
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'languageChange') {
    setLanguage(event.data.language);
  }
});

// Initialize language on load
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = getParentLanguage();
  setLanguage(savedLang);
  
  // Set language selector value
  const langSelector = document.getElementById('languageSelector');
  if (langSelector) {
    langSelector.value = currentLanguage;
  }
});

// Make translation functions available globally
if (typeof window !== 'undefined') {
  window.t = t;
  window.setLanguage = setLanguage;
  window.updateLanguage = updateLanguage;
  window.currentLanguage = () => currentLanguage;
}

// For Node.js exports if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Translations, t, setLanguage, updateLanguage };
}
