const now = new Date();
const year = now.getFullYear();
const month = 7;

const DAY_NAMES = {
  DOMINGO: 0,
  SEGUNDA: 1,
  TERÇA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SÁBADO: 6,
};

var sections = [
    {
        title: "Escala Núcleo Bandeirante",
        description: "Escala de Núcleo Bandeirante",
        goTo: "Núcleo Bandeirante",
        days: [
            {
                day: 'DOMINGO',
                times: ["10h", "17h", "19h"]
            },
            {
                day: 'SÁBADO',
                times: ["19h"]
            }
        ],
        totalSlots: {
            DOMINGO: {
                "10h": 3,
                "17h": 5,
                "19h": 5
            },
            SÁBADO: {
                "19h": 5
            }
        }
    },
    { 
        title: "Escala Samambaia",
        description: "Escala de Samambaia",
        goTo: "Samambaia", 
        days: [
            { 
                day: 'DOMINGO', 
                times: ["18h"] 
            }, 
            { 
                day: 'TERÇA', 
                times: ["20h"] 
            }
        ], 
        totalSlots: {
            DOMINGO: {
                "18h": 3
            },
            TERÇA: {
                "20h": 3
            }
        }
    },
    { 
        
        title: "Escala Planaltina", 
        description: "Escala de Planaltina",
        goTo: "Planaltina", 
        days: [
            { 
                day: 'DOMINGO',
                times: ["10h", "18h"] 
            }, 
            { 
                day: 'TERÇA', 
                times: ["20h"] 
            }
        ], 
        totalSlots: {
            DOMINGO: {
                "10h": 3,
                "18h": 3
            },
            TERÇA: {
                "20h": 3
            }
        }
    },
    { 
        title: "Escala Noroeste",
        description: "Escala de Noroeste",
        goTo: "Noroeste", 
        days: [
            { 
                day: 'DOMINGO', 
                times: ["10:30h", "18h"] 
            }, 
            { 
                day: 'QUARTA', 
                times: ["20h"] 
            }
        ], 
        totalSlots: {
            DOMINGO: {
                "10:30h": 3,
                "18h": 3
            },
            QUARTA: {
                "20h": 3
            }
        }
    },
    { 
        title: "Escala Gama", 
        description: "Escala do Gama",
        goTo: "Gama", 
        days: [
            { 
                day: 'DOMINGO', 
                times: ["18h"] 
            }, 
            { 
                day: 'QUARTA', 
                times: ["20h"] 
            }
        ], 
        totalSlots: {
            DOMINGO: {
                "18h": 3
            },
            QUARTA: {
                "20h": 3
            }
        }
    }
];

function addWeekendDaysToForm() {
    var form = FormApp.getActiveForm();
  
    // Verifica e atualiza o campo de nome e sobrenome
    var nameField = form.getItems(FormApp.ItemType.TEXT).find(function(item) {
      return item.getTitle() === 'Nome e Sobrenome';
    });
  
    if (!nameField) {
      nameField = form.addTextItem().setTitle('Nome e Sobrenome').setRequired(true);
    } else {
      nameField = nameField.asTextItem();
    }
  
    // Cria validação para o campo de texto
    var textValidation = FormApp.createTextValidation()
      .setHelpText('Por favor, insira pelo menos 6 caracteres.')
      .requireTextLengthGreaterThanOrEqualTo(6)
      .build();
    
    nameField.setValidation(textValidation);
  
    // Verifica e atualiza a questão da lista suspensa de igrejas
    var dropdown = form.getItems(FormApp.ItemType.LIST).find(function(item) {
      return item.getTitle() === 'Escolha igreja';
    });
  
    if (!dropdown) {
      dropdown = form.addListItem().setTitle('Escolha igreja').setRequired(true);
    } else {
      dropdown = dropdown.asListItem();
    }
  
    // Mapeia as seções para criar escolhas na lista suspensa
    var choices = sections.map((section, index) => {
      // Procura por um PageBreak existente com o título da seção
      var sectionPage = form.getItems(FormApp.ItemType.PAGE_BREAK).find(function(item) {
        return item.getTitle() === section.title;
      });
  
      if (!sectionPage) {
        // Se não existir, cria um novo PageBreak com título e descrição
        sectionPage = form.addPageBreakItem()
          .setTitle(section.title)
          .setDescription(section.description) // Adiciona descrição
          .setGoToPage(FormApp.PageNavigationType.SUBMIT);
      } else {
        // Se existir, apenas referencia o PageBreak existente
        sectionPage = sectionPage.asPageBreakItem();
      }
  
      // Atualiza as questões da seção
      updateSectionQuestion(form, section, year, month);
      // Cria uma escolha que leva ao PageBreak da seção
      return dropdown.createChoice(section.goTo, sectionPage);
    });
  
    // Define as escolhas no dropdown
    dropdown.setChoices(choices);
  
    // Atualiza as opções do formulário com base nas respostas
    updateFormOptions(sections);
  }
  
  function updateSectionQuestion(form, section, year, month) {
    // Procura por um CheckboxItem existente com o título da seção
    var checkboxItem = form.getItems(FormApp.ItemType.CHECKBOX).find(function(item) {
      return item.getTitle() === section.title;
    });
  
    if (!checkboxItem) {
      // Se não existir, cria um novo CheckboxItem
      checkboxItem = form.addCheckboxItem();
    } else {
      // Se existir, referencia o CheckboxItem existente
      checkboxItem = checkboxItem.asCheckboxItem();
    }
  
    // Encontra os finais de semana com opções disponíveis
    var choices = findWeekendsWithOptions(year, month, section.days, section.totalSlots);
    checkboxItem.setTitle(section.title);
    checkboxItem.setRequired(true);
    // Define as escolhas no CheckboxItem
    checkboxItem.setChoices(
      choices.map(function(choiceText) {
        return checkboxItem.createChoice(choiceText);
      })
    );
  }
  
  function findWeekendsWithOptions(year, month, days, totalSlots) {
    var options = [];
    var date = new Date(year, month - 1, 1);
    while (date.getMonth() + 1 === month) {
        var dayOfWeek = date.getDay();
        days.forEach(day => {
            if (DAY_NAMES[day.day] === dayOfWeek) { // Compara nome do dia com número
                var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy");
                day.times.forEach(time => {
                    var dayName = getDayName(dayOfWeek);
                    var slots = totalSlots[day.day][time];
                    var optionKey = formattedDate + " - " + dayName + " - " + time;
                    var option = optionKey + ` 🔴 Vagas disponíveis: ${slots}/${slots}`;
                    options.push(option);
                });
            }
        });
        date.setDate(date.getDate() + 1); // Avança para o próximo dia
    }
    return options;
  }
  
  function getDayName(dayOfWeek) {
    var dayNames = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
    return dayNames[dayOfWeek];
  }
  
  function updateFormOptions() {
    var form = FormApp.getActiveForm();
    var destinationId;
    
    try {
        // Tenta obter o ID da planilha associada ao formulário
        destinationId = form.getDestinationId();
    } catch (e) {
        if (e.message === 'The form currently has no response destination.') {
            // Se não houver uma planilha associada, cria uma nova
            var newSpreadsheet = SpreadsheetApp.create('Respostas ao formulário');
            destinationId = newSpreadsheet.getId();
            
            // Associa a nova planilha ao formulário
            form.setDestination(FormApp.DestinationType.SPREADSHEET, destinationId);
        } else {
            throw e; // Se for um erro diferente, lança a exceção
        }
    }
  
    var sheet = SpreadsheetApp.openById(destinationId).getSheetByName('Form Responses 1');
  
    // Verifica se a aba 'Form Responses 1' existe, caso contrário, cria uma nova aba
    if (!sheet) {
        sheet = SpreadsheetApp.openById(destinationId).insertSheet('Form Responses 1');
    }
  
    var headerRow = sheet.getRange('1:1').getValues()[0];
  
    // Itera sobre cada localidade e atualiza as opções individualmente
    sections.forEach(function(section) {
        var columnIndex = headerRow.findIndex(column => column === section.title) + 1;
  
        if (columnIndex > 0) {
            var columnLetter = columnToLetter(columnIndex);
            var responses = sheet.getRange(columnLetter + '2:' + columnLetter + sheet.getLastRow()).getValues();
  
            var eventCounts = {};
  
            // Conta a quantidade de eventos escolhidos
            responses.forEach(function(row) {
                if (row[0]) {
                    var events = row[0].split(', ');
                    events.forEach(function(event) {
                        if (event) {
                            var parts = event.split(' 🔴 ')[0].split(' - ');
                            // Inclui o título da seção no normalizedEvent
                            var normalizedEvent = parts[0] + ' - ' + section.title + ' - ' + parts[2]; // data - seção - hora
                            if (normalizedEvent) {
                                eventCounts[normalizedEvent] = (eventCounts[normalizedEvent] || 0) + 1;
                            }
                        }
                    });
                }
            });
  
            // Filtra os CheckboxItems correspondentes à seção atual
            var items = form.getItems(FormApp.ItemType.CHECKBOX).filter(function(item) {
                return item.getTitle() === section.title;
            });
  
            items.forEach(function(item) {
                var checkbox = item.asCheckboxItem();
                var choices = checkbox.getChoices();
                // Atualiza as escolhas com as vagas disponíveis
                var newChoices = choices.map(function(choice) {
                    var choiceText = choice.getValue();
                    var baseText = choiceText.split(' 🔴 ')[0];
  
                    var parts = baseText.split(' - ');
                    // Reconstroi o normalizedEvent com o título da seção
                    var normalizedEvent = parts[0] + ' - ' + section.title + ' - ' + parts[2]; // data - seção - hora
                    var count = eventCounts[normalizedEvent] || 0;
  
                    var slotsAvailable = calculateSlotsAvailable(section, baseText, count);
                    return checkbox.createChoice(`${baseText} 🔴 Vagas disponíveis: ${slotsAvailable}`);
                });
  
                checkbox.setChoices(newChoices);
            });
        } else {
            Logger.log("A coluna com a pergunta especificada não foi encontrada para " + section.title);
        }
    });
  }
  
  function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
  }
  
  // Ajusta a função calculateSlotsAvailable para utilizar a seção correta
  function calculateSlotsAvailable(section, eventKey, count) {
    var [date, dayName, time] = eventKey.split(' - ');
    var slotsAvailable = 0;
  
    var day = dayName.toUpperCase();
    if (section.totalSlots[day] && section.totalSlots[day][time]) {
        slotsAvailable = section.totalSlots[day][time];
    }
  
    // Subtrai o número de vagas ocupadas
    var remainingSlots = Math.max(slotsAvailable - count, 0);
    return `${remainingSlots}/${slotsAvailable}`;
  }
  
  // Adicione esta função para configurar o gatilho
  function setupOnFormSubmitTrigger() {
    var triggers = ScriptApp.getProjectTriggers();
    // Remove qualquer gatilho existente para evitar duplicação
    triggers.forEach(function(trigger) {
        if (trigger.getHandlerFunction() === 'onFormSubmit') {
            ScriptApp.deleteTrigger(trigger);
        }
    });
    // Cria um novo gatilho que executa quando o formulário é submetido
    ScriptApp.newTrigger('onFormSubmit')
        .forForm(FormApp.getActiveForm())
        .onFormSubmit()
        .create();
  }
  
  // Função que será chamada quando o formulário for submetido
  function onFormSubmit(e) {
    updateFormOptions();
  }
