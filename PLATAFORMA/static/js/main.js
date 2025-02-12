const ESTADOS_BRASIL = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  const DISCIPLINAS = [
      'Biologia', 'Português', 'Matemática', 'Física', 'Química', 
      'História', 'Geografia', 'Filosofia', 'Sociologia', 
      'Inglês', 'Espanhol', 'Redação'
  ];
  
  const PONTOS_TRABALHAR = [
      'Interpretação de questões', 'Conteúdo teórico', 'Gestão do tempo',
      'Memorização de conceitos', 'Dificuldade em redação', 'Ansiedade na prova',
      'Cálculos matemáticos', 'Leitura de gráficos', 'Falta de prática',
      'Conexão entre disciplinas', 'Estratégia de resposta', 'Textos longos',
      'Escolha da resposta', 'Identificação de palavras-chave', 'Revisão eficiente',
      'Organização do estudo', 'Familiaridade com provas', 'Compreensão de enunciados',
      'Motivação e disciplina', 'Lacunas de aprendizado', 'Interdisciplinaridade',
      'Síntese e análise', 'Clareza na escrita', 'Línguas estrangeiras',
      'Tempo limite'
  ];
  
  class PerfilManager {
    constructor() {
      this.tags = {
        disciplinas: new Set(),
        pontos: new Set()
      };
      this.initializeTagsSystem();
      this.initializeEditableCells();
      this.loadEstados();
      this.setupEventListeners();
    }
  
    initializeTagsSystem() {
      // Carregar tags iniciais
      this.tags.disciplinas = new Set(['Matemática', 'Português', 'Física', 'Química']);
      this.tags.pontos = new Set(['Gestão de Tempo', 'Interpretação', 'Cálculos']);
      this.renderTags();
    }
  
    renderTags() {
      const disciplinasContainer = document.getElementById('disciplinas-tags');
      const pontosContainer = document.getElementById('pontos-tags');
  
      if (disciplinasContainer) {
        disciplinasContainer.innerHTML = Array.from(this.tags.disciplinas)
          .map(tag => this.createTagElement(tag, 'disciplina'))
          .join('');
      }
  
      if (pontosContainer) {
        pontosContainer.innerHTML = Array.from(this.tags.pontos)
          .map(tag => this.createTagElement(tag, 'ponto'))
          .join('');
      }
    }
  
    createTagElement(texto, tipo) {
      return `
        <div class="tag tag-${tipo}" draggable="true" data-tag="${texto}">
          ${texto}
          <span class="tag-remove" onclick="perfilManager.removeTag('${tipo}', '${texto}')">×</span>
        </div>
      `;
    }
  
    initializeEditableCells() {
      document.querySelectorAll('td:not(.header)').forEach(cell => {
        cell.setAttribute('contenteditable', 'true');
        cell.addEventListener('blur', () => this.saveCellContent(cell));
        cell.addEventListener('dragover', e => e.preventDefault());
        cell.addEventListener('drop', e => this.handleDrop(e, cell));
      });
    }
  
    handleDrop(e, cell) {
      e.preventDefault();
      const tagText = e.dataTransfer.getData('text');
      if (tagText) {
        cell.textContent = tagText;
        this.saveCellContent(cell);
      }
    }
  
    async saveCellContent(cell) {
      try {
        const content = cell.textContent;
        const row = cell.parentElement;
        const columnIndex = Array.from(row.children).indexOf(cell);
        const rowIndex = Array.from(row.parentElement.children).indexOf(row);
  
        await fetch('/api/save-cell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify({
            content,
            row: rowIndex,
            column: columnIndex
          })
        });
      } catch (error) {
        console.error('Erro ao salvar conteúdo:', error);
        displayError('Erro ao salvar alterações');
      }
    }
  
    loadEstados() {
      const estadoSelect = document.getElementById('estado');
      if (estadoSelect) {
        ESTADOS_BRASIL.forEach(estado => {
          const option = document.createElement('option');
          option.value = estado;
          option.textContent = estado;
          estadoSelect.appendChild(option);
        });
      }
    }
  
    setupEventListeners() {
      document.getElementById('salvar-info')?.addEventListener('click', () => this.salvarInformacoes());
      
      // Setup drag and drop para tags
      document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text', tag.dataset.tag);
        });
      });
    }
  
    async salvarInformacoes() {
      const info = {
        nome: document.getElementById('nome-aluno').value,
        curso: document.getElementById('curso-desejado').value,
        estado: document.getElementById('estado').value,
        vestibular: document.getElementById('vestibular').value
      };
  
      try {
        const response = await fetch('/api/aluno-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          },
          body: JSON.stringify(info)
        });
  
        if (response.ok) {
          displaySuccess('Informações salvas com sucesso!');
        } else {
          throw new Error('Erro ao salvar informações');
        }
      } catch (error) {
        console.error('Erro:', error);
        displayError('Erro ao salvar informações');
      }
    }
  }
  
  class CronogramaComponent {
      async loadEvents() {
        try {
          const response = await fetch('/api/events');
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `HTTP error: ${response.status}`;
            throw new Error(errorMessage);
          }
          this.events = await response.json();
          return this.events;
        } catch (error) {
          console.error('Erro ao carregar eventos:', error);
          this.displayError('Erro ao carregar eventos. Por favor, tente novamente mais tarde.');
          this.events = [];
          return [];
        }
      }
    
      displayError(message) {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
          errorContainer.textContent = message;
          errorContainer.classList.add('error');
        } else {
          console.error("Error container not found");
        }
      }
    }
    
    class NotasComponent {
      async loadNotas() {
        try {
          const token = localStorage.getItem('userToken') || '';
          const response = await fetch('/api/notas', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `HTTP error: ${response.status}`;
            throw new Error(errorMessage);
          }
          this.notas = await response.json();
          return this.notas;
        } catch (error) {
          console.error('Erro ao carregar notas:', error);
          this.displayError('Erro ao carregar notas. Por favor, tente novamente.');
          this.notas = [];
          return [];
        }
      }
    
      displayError(message) {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
          errorContainer.textContent = message;
          errorContainer.classList.add('error');
        } else {
          console.error("Error container not found");
        }
      }
    }
    
    class StudentManager {
      static async registerStudent(studentData) {
        try {
          const token = localStorage.getItem('userToken') || '';
          const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(studentData)
          });
          const data = await response.json();
          if (!response.ok) {
            const errorMessage = data.message || `HTTP error: ${response.status}`;
            throw new Error(errorMessage);
          }
          if (data.success) {
            return data.student_id;
          } else {
            console.error('Erro no cadastro do aluno:', data.message);
            alert(`Erro no cadastro do aluno: ${data.message}`);
            return null;
          }
        } catch (error) {
          console.error('Erro na requisição de cadastro de aluno:', error);
          alert(`Erro ao cadastrar aluno: ${error.message}`);
          return null;
        }
      }
    
      static async loadStudents() {
        try {
          const token = localStorage.getItem('userToken') || '';
          const response = await fetch('/api/students', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.message || `HTTP error: ${response.status}`;
            throw new Error(errorMessage);
          }
          const data = await response.json();
          return data.students || [];
        } catch (error) {
          console.error('Erro ao carregar alunos:', error);
          StudentManager.displayError('Erro ao carregar a lista de alunos.');
          return [];
        }
      }
    
      static displayError(message) {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
          errorContainer.textContent = message;
          errorContainer.classList.add('error');
        } else {
          console.error("Error container not found");
        }
      }
    }
    
    function preencherTabelaNotas(notas) {
      const tbody = document.querySelector("#notas-enem tbody");
      if (!tbody) {
        console.error("Tabela de notas não encontrada!");
        return;
      }
      tbody.innerHTML = "";
      notas.forEach(nota => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${nota.ano}</td>
          <td>${nota.matematica || ''}</td>
          <td>${nota.humanas || ''}</td>
          <td>${nota.naturezas || ''}</td>
          <td>${nota.linguagens || ''}</td>
          <td>${nota.redacao || ''}</td>
          <td>${nota.media_total || '0'}</td>
        `;
        tbody.appendChild(row);
      });
      const mediaRow = document.createElement("tr");
      mediaRow.classList.add("media-row");
      mediaRow.innerHTML = `<td>MÉDIA</td><td></td><td></td><td></td><td></td><td></td><td>0.00</td>`;
      tbody.appendChild(mediaRow);
    }
    
    function preencherCalendario(eventos) {
      const celulas = document.querySelectorAll(".celula-evento");
      if (!celulas || celulas.length === 0) {
        console.error("Nenhuma célula de evento encontrada!");
        return;
      }
      celulas.forEach(celula => celula.innerHTML = "");
      eventos.forEach(evento => {
        const celula = document.querySelector(`.celula-evento[data-dia="${evento.dia}"][data-periodo="${evento.periodo}"]`);
        if (celula) {
          const eventoDiv = document.createElement("div");
          eventoDiv.classList.add("evento");
          eventoDiv.dataset.categoria = evento.categoria;
          let titulo = evento.titulo;
          if (titulo.length > 20) {
            titulo = titulo.substring(0, 17) + "...";
          }
          eventoDiv.innerHTML = `<span class="titulo-evento">${titulo}</span>`;
          if (evento.questoes) {
            const detalhesSpan = document.createElement("span");
            detalhesSpan.classList.add("detalhes-evento");
            detalhesSpan.textContent = `${evento.questoes} questões`;
            eventoDiv.appendChild(detalhesSpan);
          }
          eventoDiv.addEventListener("click", () => mostrarDetalhesEvento(evento));
          celula.appendChild(eventoDiv);
        }
      });
      const botoesCalendario = document.querySelectorAll(".btn-calendario");
      botoesCalendario.forEach(botao => {
        botao.addEventListener("click", function() {
          botoesCalendario.forEach(b => b.classList.remove("active"));
          this.classList.add("active");
        });
      });
    }
    
    function mostrarDetalhesEvento(evento) {
      const detalhesContainer = document.getElementById("detalhes-evento");
      if (!detalhesContainer) {
        console.error("Container de detalhes do evento não encontrado!");
        return;
      }
      detalhesContainer.innerHTML = `
        <h2>${evento.titulo}</h2>
        <p><strong>Questões:</strong> ${evento.questoes || 'N/A'}</p>
        <p><strong>Dia da Semana:</strong> ${evento.dia}</p>
        <p><strong>Período:</strong> ${evento.periodo}</p>
        <p><strong>Categoria:</strong> <span class="tag tag-${evento.categoria.toLowerCase()}">${evento.categoria}</span></p>
        <p><strong>Hora de Início:</strong> ${evento.horaInicio || 'N/A'}</p>
        <p><strong>Hora de Término:</strong> ${evento.horaTermino || 'N/A'}</p>
        <p><strong>Duração Total:</strong> ${evento.duracaoTotal || 'N/A'}</p>
        <p><strong>Última edição:</strong> ${evento.ultimaEdicao || 'N/A'}</p>
        <p><strong>Fórmula:</strong> ${evento.formula || 'N/A'}</p>
        <p><strong>Comentários:</strong></p>
        <textarea placeholder="Adicionar um comentário...">${evento.comentarios || ''}</textarea>
      `;
      detalhesContainer.classList.add("active");
    }
    
    document.addEventListener('DOMContentLoaded', async () => {
      console.log("DOMContentLoaded INICIADO!");
      
      // Inicializar apenas o TagManager
      window.tagManager = new TagManager();
      
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
          loginForm.addEventListener('submit', handleLogin);
      }
  
      // Inicializar gerenciadores
      const notasManager = new NotasManager();
      const perfilManager = new PerfilManager();
      
      // Tornar acessível globalmente
      window.notasManager = notasManager;
      window.perfilManager = perfilManager;
  
      try {
        console.log("Loading students...");
        const alunos = await StudentManager.loadStudents();
        console.log("Students loaded:", alunos);
        const listaAlunosElement = document.getElementById('lista-alunos');
        if (listaAlunosElement) {
          let listaHTML = '<ul>';
          alunos.forEach(aluno => {
            listaHTML += `<li>${aluno.nome} - ${aluno.email}</li>`;
          });
          listaHTML += '</ul>';
          listaAlunosElement.innerHTML = listaHTML;
        } else {
          console.error("Elemento 'lista-alunos' não encontrado!");
        }
        console.log("Loading notes...");
        const notas = await (new NotasComponent()).loadNotas();
        console.log("Notes loaded:", notas);
        preencherTabelaNotas(notas);
        console.log("Notes table filled.");
        console.log("Loading events...");
        const eventos = await (new CronogramaComponent()).loadEvents();
        console.log("Events loaded:", eventos);
        preencherCalendario(eventos);
        console.log("Calendar filled.");
      } catch (error) {
        console.error('Erro ao carregar dados da plataforma:', error);
        displayError('Ocorreu um erro ao carregar a plataforma. Tente novamente mais tarde.');
      }
  
      const perfilAcademico = new PerfilAcademico();
      window.perfilAcademico = perfilAcademico;
  
      const tagManager = new TagManager();
      window.tagManager = tagManager;
    });
    
    const alunoForm = document.getElementById('aluno-form');
    if (alunoForm) {
      alunoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nome = document.getElementById('aluno-nome').value;
        const emailAluno = document.getElementById('aluno-email').value;
        if (!nome || !emailAluno) {
          alert('Por favor, preencha todos os campos.');
          return;
        }
        if (!emailAluno.includes('@')) {
          alert('Por favor, insira um email válido.');
          return;
        }
        const studentData = { nome, email: emailAluno };
        const alunoId = await StudentManager.registerStudent(studentData);
        if (alunoId) {
          alert('Aluno cadastrado com sucesso!');
          const alunos = await StudentManager.loadStudents();
          let listaHTML = '<ul>';
          alunos.forEach(aluno => {
            listaHTML += `<li>${aluno.nome} - ${aluno.email}</li>`;
          });
          listaHTML += '</ul>';
          document.getElementById('lista-alunos').innerHTML = listaHTML;
          document.getElementById('aluno-nome').value = '';
          document.getElementById('aluno-email').value = '';
        }
      });
    } else {
      console.error("Formulário 'aluno-form' não encontrado!");
    }
  
  function displayError(message) {
      const errorContainer = document.getElementById('error-message');
      if (errorContainer) {
          errorContainer.textContent = message;
          errorContainer.style.display = 'block';
          setTimeout(() => errorContainer.style.display = 'none', 5000);
      } else {
          console.error("Error container not found:", message);
      }
  }
  
  class NotasManager {
      constructor() {
          this.initializeForm();
      }
  
      initializeForm() {
          const form = document.getElementById('notas-form');
          if (form) {
              form.addEventListener('submit', async (e) => {
                  e.preventDefault();
                  await this.salvarNotas();
              });
          }
      }
  
      async salvarNotas() {
          const notas = {
              ano: document.getElementById('ano').value,
              matematica: Number(document.getElementById('matematica').value),
              humanas: Number(document.getElementById('humanas').value),
              naturezas: Number(document.getElementById('naturezas').value),
              linguagens: Number(document.getElementById('linguagens').value),
              redacao: Number(document.getElementById('redacao').value)
          };
  
          try {
              const response = await fetch('/api/notas', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                  },
                  body: JSON.stringify(notas)
              });
  
              if (response.ok) {
                  displaySuccess('Notas salvas com sucesso!');
                  // Recarregar a tabela de notas
                  const notasComponent = new NotasComponent();
                  const notasAtualizadas = await notasComponent.loadNotas();
                  preencherTabelaNotas(notasAtualizadas);
              } else {
                  throw new Error('Erro ao salvar notas');
              }
          } catch (error) {
              console.error('Erro:', error);
              displayError('Erro ao salvar notas');
          }
      }
  }
  
  function displaySuccess(message) {
      const successContainer = document.getElementById('success-message');
      if (successContainer) {
          successContainer.textContent = message;
          successContainer.style.display = 'block';
          setTimeout(() => successContainer.style.display = 'none', 5000);
      }
  }
  
  class PerfilAcademico {
      constructor() {
          this.selectedTags = {
              disciplinas: new Set(),
              pontos: new Set()
          };
          this.availableTags = {
              disciplinas: new Set(DISCIPLINAS),
              pontos: new Set(PONTOS_TRABALHAR)
          };
          this.initializeSystem();
      }
  
      initializeSystem() {
          this.setupEventListeners();
          this.renderAllTags();
      }
  
      setupEventListeners() {
          document.querySelectorAll('.add-tag-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                  const tipo = e.target.dataset.tipo;
                  this.toggleDropdown(tipo);
              });
          });
  
          document.addEventListener('click', (e) => {
              if (!e.target.closest('.add-tag-btn') && !e.target.closest('.tag-dropdown')) {
                  this.hideAllDropdowns();
              }
          });
      }
  
      toggleDropdown(tipo) {
          const dropdown = document.getElementById(`${tipo}s-dropdown`);
          if (!dropdown) return;
  
          if (dropdown.classList.contains('active')) {
              dropdown.classList.remove('active');
          } else {
              this.hideAllDropdowns();
              this.renderDropdownOptions(tipo);
              dropdown.classList.add('active');
          }
      }
  
      hideAllDropdowns() {
          document.querySelectorAll('.tag-dropdown').forEach(d => d.classList.remove('active'));
      }
  
      renderDropdownOptions(tipo) {
          const dropdown = document.getElementById(`${tipo}s-dropdown`);
          if (!dropdown) return;
  
          const availableTags = Array.from(this.availableTags[`${tipo}s`])
              .filter(tag => !this.selectedTags[`${tipo}s`].has(tag));
  
          dropdown.innerHTML = availableTags.map(tag => `
              <div class="tag-dropdown-item" onclick="perfilAcademico.addTag('${tipo}s', '${tag}')">
                  ${tag}
              </div>
          `).join('') || '<div class="tag-dropdown-item">Nenhuma opção disponível</div>';
      }
  
      addTag(tipo, tag) {
          if (this.selectedTags[tipo].has(tag)) return;
          
          this.selectedTags[tipo].add(tag);
          this.renderTags(tipo);
          this.hideAllDropdowns();
          this.updatePriorityTable();
      }
  
      removeTag(tipo, tag) {
          this.selectedTags[tipo].delete(tag);
          this.renderTags(tipo);
          this.updatePriorityTable();
      }
  
      renderTags(tipo) {
          const wrapper = document.getElementById(`${tipo}-wrapper`);
          if (!wrapper) return;
  
          wrapper.innerHTML = Array.from(this.selectedTags[tipo]).map(tag => `
              <div class="tag">
                  ${tag}
                  <span class="tag-remove" onclick="perfilAcademico.removeTag('${tipo}', '${tag}')">&times;</span>
              </div>
          `).join('');
      }
  
      renderAllTags() {
          this.renderTags('disciplinas');
          this.renderTags('pontos');
      }
  
      updatePriorityTable() {
          const tbody = document.getElementById('perfil-table-body');
          if (!tbody) return;
  
          const rows = this.generatePriorityRows();
          tbody.innerHTML = rows.map(row => `
              <tr>
                  <td class="prioridade-${row.prioridade.toLowerCase()}">${row.prioridade}</td>
                  <td class="tags-cell">
                      ${row.disciplinas.map(d => `<span class="tag">${d}</span>`).join('')}
                  </td>
                  <td class="tags-cell">
                      ${row.pontos.map(p => `<span class="tag">${p}</span>`).join('')}
                  </td>
              </tr>
          `).join('');
      }
  
      generatePriorityRows() {
          const disciplinas = Array.from(this.selectedTags.disciplinas);
          const pontos = Array.from(this.selectedTags.pontos);
  
          return [
              {
                  prioridade: 'Alta',
                  disciplinas: disciplinas.slice(0, 3),
                  pontos: pontos.slice(0, 3)
              },
              {
                  prioridade: 'Média',
                  disciplinas: disciplinas.slice(3, 6),
                  pontos: pontos.slice(3, 6)
              },
              {
                  prioridade: 'Baixa',
                  disciplinas: disciplinas.slice(6),
                  pontos: pontos.slice(6)
              }
          ].filter(row => row.disciplinas.length > 0 || row.pontos.length > 0);
      }
  }
  
  class TagManager {
    constructor() {
        this.priorities = ['alta', 'media', 'baixa'];
        this.tags = {
            disciplinas: {
                alta: new Set(),
                media: new Set(),
                baixa: new Set()
            },
            pontos: {
                alta: new Set(),
                media: new Set(),
                baixa: new Set()
            }
        };
        this.initializeTagSystem();
    }

    initializeTagSystem() {
        this.setupDropdowns();
        this.setupDragAndDrop();
        this.loadSavedTags();
    }

    setupDropdowns() {
        const addTagButtons = document.querySelectorAll('.add-tag-btn');
        if (addTagButtons.length === 0) {
            console.error('Nenhum botão de adicionar tag encontrado');
        }

        addTagButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tipo = btn.dataset.tipo;
                console.log('Clique no botão de tipo:', tipo);
                this.showDropdown(tipo);
            });
        });
    }

    setupDragAndDrop() {
        document.querySelectorAll('.tags-cell').forEach(cell => {
            cell.addEventListener('dragover', e => {
                e.preventDefault();
                e.currentTarget.classList.add('dragover');
            });

            cell.addEventListener('dragleave', e => {
                e.currentTarget.classList.remove('dragover');
            });

            cell.addEventListener('drop', e => {
                e.preventDefault();
                e.currentTarget.classList.remove('dragover');
                const data = JSON.parse(e.dataTransfer.getData('text'));
                this.moveTag(data.tipo, data.tag, data.fromPriority, e.currentTarget.closest('.priority-row').dataset.priority);
            });
        });
    }

    async loadSavedTags() {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                this.tags = data.tags;
                this.renderAllTags();
            }
        } catch (error) {
            console.error('Erro ao carregar tags:', error);
        }
    }

    showDropdown(tipo) {
        const dropdown = document.getElementById(`${tipo}s-dropdown`);
        if (!dropdown) {
            console.error(`Dropdown não encontrado para tipo: ${tipo}`);
            return;
        }

        const availableTags = this.getAvailableTags(tipo);
        dropdown.innerHTML = availableTags.map(tag => `
            <div class="tag-dropdown-item" onclick="tagManager.addTag('${tipo}', '${tag}', 'alta')">
                ${tag}
            </div>
        `).join('');

        dropdown.style.display = 'block';

        // Adicionar handler para fechar dropdown ao clicar fora
        const clickHandler = (e) => {
            if (!dropdown.contains(e.target) && !e.target.closest('.add-tag-btn')) {
                dropdown.style.display = 'none';
                document.removeEventListener('click', clickHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', clickHandler);
        }, 0);
    }

    getAvailableTags(tipo) {
        const allTags = tipo === 'disciplina' ? DISCIPLINAS : PONTOS_TRABALHAR;
        const usedTags = new Set([
            ...this.tags[tipo + 's'].alta,
            ...this.tags[tipo + 's'].media,
            ...this.tags[tipo + 's'].baixa
        ]);
        
        return allTags.filter(tag => !usedTags.has(tag));
    }

    addTag(tipo, tag, priority) {
        const collection = tipo + 's';
        this.tags[collection][priority].add(tag);
        this.renderTags(tipo, priority);
        this.saveTagsState();
    }

    removeTag(tipo, tag, priority) {
        const collection = tipo + 's';
        this.tags[collection][priority].delete(tag);
        this.renderTags(tipo, priority);
        this.saveTagsState();
    }

    moveTag(tipo, tag, fromPriority, toPriority) {
        if (fromPriority === toPriority) return;
        
        const collection = tipo + 's';
        this.tags[collection][fromPriority].delete(tag);
        this.tags[collection][toPriority].add(tag);
        
        this.renderTags(tipo, fromPriority);
        this.renderTags(tipo, toPriority);
        this.saveTagsState();
    }

    renderTags(tipo, priority) {
        const collection = tipo + 's';
        const container = document.getElementById(`${collection}-${priority}`);
        if (!container) return;

        container.innerHTML = Array.from(this.tags[collection][priority]).map(tag => `
            <div class="tag" draggable="true" data-tag="${tag}" data-tipo="${tipo}">
                ${tag}
                <span class="tag-remove" onclick="tagManager.removeTag('${tipo}', '${tag}', '${priority}')">&times;</span>
            </div>
        `).join('');

        this.setupTagDrag(container);
    }

    setupTagDrag(container) {
        container.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('dragstart', e => {
                const data = {
                    tipo: tag.dataset.tipo,
                    tag: tag.dataset.tag,
                    fromPriority: tag.closest('.priority-row').dataset.priority
                };
                e.dataTransfer.setData('text', JSON.stringify(data));
            });
        });
    }

    renderAllTags() {
        this.priorities.forEach(priority => {
            this.renderTags('disciplina', priority);
            this.renderTags('ponto', priority);
        });
    }

    async saveTagsState() {
        try {
            await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tags: this.tags })
            });
        } catch (error) {
            console.error('Erro ao salvar tags:', error);
        }
    }
}
  
  // Melhorar o gerenciamento de eventos do calendário
  class EventManager {
      constructor() {
          this.events = [];
          this.draggedEvent = null;
          this.initializeEventListeners();
      }
  
      initializeEventListeners() {
          document.querySelectorAll('.celula-evento').forEach(cell => {
              cell.addEventListener('dragover', e => {
                  e.preventDefault();
                  e.currentTarget.classList.add('dragover');
              });
  
              cell.addEventListener('dragleave', e => {
                  e.currentTarget.classList.remove('dragover');
              });
  
              cell.addEventListener('drop', e => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('dragover');
                  if (this.draggedEvent) {
                      this.moveEvent(this.draggedEvent, e.currentTarget);
                  }
              });
          });
      }
  
      // ... resto do código do EventManager ...
  }
  
  // Inicialização
  document.addEventListener('DOMContentLoaded', async () => {
      // ...existing code...
      
      const tagManager = new TagManager();
      const eventManager = new EventManager();
      
      window.tagManager = tagManager;
      window.eventManager = eventManager;
  });

class CalendarioManager {
    constructor() {
        this.eventos = [];
        this.filtroAtual = 'todos';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Botão de adicionar evento
        document.querySelector('.btn-adicionar').addEventListener('click', () => {
            document.getElementById('evento-form').classList.add('active');
        });

        // Formulário de novo evento
        document.getElementById('novo-evento-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarEvento();
        });

        // Mostrar/esconder campos de estudo
        document.getElementById('evento-categoria').addEventListener('change', (e) => {
            const camposEstudos = document.getElementById('campos-estudos');
            camposEstudos.style.display = e.target.value === 'estudos' ? 'block' : 'none';
        });

        // Filtros
        document.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filtroAtual = e.target.dataset.categoria;
                this.atualizarFiltros();
                this.renderizarEventos();
            });
        });
    }

    adicionarEvento() {
        const evento = {
            titulo: document.getElementById('evento-titulo').value,
            dia: document.getElementById('evento-dia').value,
            periodo: document.getElementById('evento-periodo').value,
            inicio: document.getElementById('evento-inicio').value,
            fim: document.getElementById('evento-fim').value,
            categoria: document.getElementById('evento-categoria').value,
            duracao: this.calcularDuracao(
                document.getElementById('evento-inicio').value,
                document.getElementById('evento-fim').value
            )
        };

        if (evento.categoria === 'estudos') {
            evento.questoes = document.getElementById('evento-questoes').value;
            evento.area = document.getElementById('evento-area').value;
        }

        this.salvarEvento(evento);
    }

    calcularDuracao(inicio, fim) {
        const [horaInicio, minInicio] = inicio.split(':').map(Number);
        const [horaFim, minFim] = fim.split(':').map(Number);
        
        let duracaoMin = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio);
        if (duracaoMin < 0) duracaoMin += 24 * 60; // Caso passe da meia-noite
        
        const horas = Math.floor(duracaoMin / 60);
        const minutos = duracaoMin % 60;
        
        return `${horas}h${minutos.toString().padStart(2, '0')}min`;
    }

    async salvarEvento(evento) {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(evento)
            });

            if (response.ok) {
                this.eventos.push(evento);
                this.renderizarEventos();
                this.atualizarResumo();
                document.getElementById('evento-form').classList.remove('active');
                document.getElementById('novo-evento-form').reset();
            }
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            alert('Erro ao salvar evento. Tente novamente.');
        }
    }

    renderizarEventos() {
        const cells = document.querySelectorAll('.celula-evento');
        cells.forEach(cell => cell.innerHTML = '');

        this.eventos
            .filter(evento => this.filtroAtual === 'todos' || evento.categoria === this.filtroAtual)
            .forEach(evento => {
                const cell = document.querySelector(
                    `.celula-evento[data-dia="${evento.dia}"][data-periodo="${evento.periodo}"]`
                );
                
                if (cell) {
                    const eventoEl = document.createElement('div');
                    eventoEl.className = 'evento';
                    eventoEl.dataset.categoria = evento.categoria;
                    eventoEl.innerHTML = `
                        <div class="evento-titulo">${evento.titulo}</div>
                        <div class="evento-horario">${evento.inicio} - ${evento.fim}</div>
                        <div class="evento-duracao">${evento.duracao}</div>
                        ${evento.categoria === 'estudos' ? 
                            `<div class="evento-questoes">${evento.questoes} questões - ${evento.area}</div>` 
                            : ''}
                    `;
                    cell.appendChild(eventoEl);
                }
            });
    }

    atualizarResumo() {
        const resumoPorDia = {
            segunda: 0, terca: 0, quarta: 0, quinta: 0, sexta: 0, sabado: 0
        };

        this.eventos
            .filter(evento => evento.categoria === 'estudos')
            .forEach(evento => {
                const [horaInicio, minInicio] = evento.inicio.split(':').map(Number);
                const [horaFim, minFim] = evento.fim.split(':').map(Number);
                let duracaoMin = (horaFim * 60 + minFim) - (horaInicio * 60 + minInicio);
                if (duracaoMin < 0) duracaoMin += 24 * 60;
                resumoPorDia[evento.dia] += duracaoMin;
            });

        Object.entries(resumoPorDia).forEach(([dia, minutos]) => {
            const horas = Math.floor(minutos / 60);
            const min = minutos % 60;
            const el = document.querySelector(`.resumo-dia[data-dia="${dia}"] .tempo-estudo`);
            if (el) {
                el.textContent = `${horas}h${min.toString().padStart(2, '0')}min`;
            }
        });
    }

    atualizarFiltros() {
        document.querySelectorAll('.btn-filtro').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.categoria === this.filtroAtual);
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    const calendarioManager = new CalendarioManager();
    window.calendarioManager = calendarioManager;
});
