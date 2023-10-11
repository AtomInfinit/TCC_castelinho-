const express = require('express');
const fs = require('fs');
const path = require('path'); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));
app.use(express.static(path.join(__dirname, 'public')));

// Passo 1: Ler o conteúdo atual do arquivo de texto
const conteudoAtual = fs.readFileSync('dados.txt', 'utf8');
//commit aleatório

// Passo 2: Verificar se o conteúdo atual está vazio
const novaLinha = '';

if (conteudoAtual.trim() === '') {
  // Se o conteúdo atual estiver vazio, escrever a nova linha diretamente no arquivo
  fs.writeFileSync('dados.txt', novaLinha);
} else {
  // Se o conteúdo atual não estiver vazio, adicionar a nova linha ao conteúdo existente
  const novoConteudo = `${conteudoAtual}\n${novaLinha}`;
  fs.writeFileSync('dados.txt', novoConteudo);
}


// Configurar o diretório público para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página de produtos (produtos.html)
app.get('/produtos', (req, res) => {
  res.sendFile(path.join(__dirname, 'produtos.html'));
});

// Rota para a página Home (home.html)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

// Rota para a página Sobre (sobre.html)
app.get('/sobre', (req, res) => {
  res.sendFile(path.join(__dirname, 'sobre.html'));
});



// Rota para exibir a página inicial
app.get('/', (req, res) => {
  // Ler o arquivo de texto e obter os dados
  const data = fs.readFileSync('dados.txt', 'utf8');
  const cards = data.split('\n').filter(Boolean);

  // Filtrar os cards por categoria (se fornecida)
  const categoria = req.query.categoria;
  const filteredCards = categoria ? cards.filter(card => card.includes(`Categoria: ${categoria}`)) : cards;

  // Renderizar a página e passar os dados para exibição
  res.send(`
    <html>
    <head>
      <title>Anúncios</title>
      <link rel="icon" href="imagens/logotipo.png">
      <link rel="stylesheet" href="/style.css">
      <script src="/script.js"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
      crossorigin="anonymous" referrerpolicy="no-referrer" />
      </head>
      <body>
        <header>
        <nav>
          <a class="logo" href="#"><img src="imagens/logotipo.png"></a> <!-- Logotipo -->

          
          <ul class="nav-list">
            <li><a href="/home">Home</a></li> <!-- Item do menu: Início -->
            <li><a href="/sobre">Sobre</a></li> <!-- Item do menu: Sobre -->
            <li><a href="/produtos">Produtos</a></li> <!-- Item do menu: Produtos -->
            <li><a href="http://localhost:3000">Anúncios</a></li> <!-- Item do menu: Anúncios -->
          </ul>
          
          <fieldset style="background-color: transparent; cursor: default;">
            <ul >
             
            </ul>


          </fieldset>
        </nav>    
      </header>
      <main>
      <div class="site-intro">
        <h2>Anúncios</h2>
        <p>Aqui você pode fazer e visualizar anúncios de materiais reciclados</p>
      </div>
      <button class="btn-criar-card" onclick="location.href='/criarCard'">Crie seu Anúncio</button>

        <form class="form_filtro" action="/" method="get">
          <select name="categoria" id="categoria">
            <option value="">Filtrar</option>
            <option value="">Todos</option>
            <option value="Pilha">Pilha</option>
            <option value="Plástico">Plástico</option>
            <option value="Papelão">Papelão</option>
            <option value="Metal">Metal</option>
            <option value="Alumínio">Alumínio</option>
            <option value="SucataComum">Sucata Comum</option>
            <option value="Vidro">Vidro</option>
            <option value="PlásticoPet">Plástico Pet</option>
            <option value="Cobre">Cobre</option>
          </select>
          <input type="submit" value="Filtrar">
        </form>
  
        
  
        <div class="cards-container">
          ${filteredCards.map((card, index) => {
            const cardData = card.split(',');
            const titulo = cardData[0].split(': ')[1].trim().replace(';', ',');
            const descricao = cardData[1].split(': ')[1].trim().replace(';', ',');
            const valor = cardData[2].split(': ')[1].trim().replace(';', ',');
            const contato = cardData[3].split(': ')[1].trim().replace(';', ',');
            const categoria = cardData[4].split(': ')[1].trim().replace(';', ',');
            const imagePath = `imagens/${categoria.replace(/\s+/g, '_')}.png`;
            const imageSrc = fs.existsSync(path.join(__dirname, imagePath)) ? imagePath : 'imagens/default.png';

            return `
              <div class="card">
                <div class="card-content">
                  <h3>${titulo}</h3>
                  <p>Descrição: ${descricao}</p>
                  <p>Valor: R$ ${valor}</p>
                  <p class="contato">Contato: R$ ${contato}</p>
                  <p>Categoria: ${categoria}</p>
                  <img src="${imageSrc}" alt="Imagem do Card" width="100">
                </div>
                <br>
                <div class="button-container">
                  <button class="comprar-btn" style="width:100%; background-color: #7FC79E;">Comprar</button>
                  <p class="contato" style="display: none;"></p><br>
                  <button onclick="editarCard(${index})">Editar</button>
                  <button onclick="excluirCard(${index})">Excluir</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div id="myModal" class="modal">
  <div class="modal-content">
    <h2 class="modal_h2">Editar Card</h2>
    <form id="editarCardForm">
      <!-- Campos do formulário -->
      <label class="modal_label" for="titulo">Título:</label>
      <input type="text" id="titulo" name="titulo" required>
      
      <label class="modal_label" for="descricao">Descrição:</label>
      <input type="text" id="descricao" name="descricao" required>
      
      <label class="modal_label" for="valor">Valor:</label>
      <input type="text" id="valor" name="valor" required>

      <label class="modal_label" for="contato">Contato:</label>
      <input type="text" id="contato" name="contato" required>
      
      <label class="modal_label" for="categoria">Categoria:</label>
      <select id="categoria" name="categoria" required>
        <option value="Pilha">Pilha</option>
        <option value="Plástico">Plástico</option>
        <option value="Papelão">Papelão</option>
        <option value="Metal">Metal</option>
        <option value="Alumínio">Alumínio</option>
        <option value="SucataComum">Sucata Comum</option>
        <option value="Vidro">Vidro</option>
        <option value="PlásticoPet">Plástico Pet</option>
        <option value="Cobre">Cobre</option>
      </select>
      
      <!-- Botão de submit -->
      <input class="input" type="submit" value="Salvar">
    </form>
  </div>
</div>

<script>

    // Obtenha uma referência para todos os botões "comprar" e para todos os elementos de contato
    const botoesComprar = document.querySelectorAll('.comprar-btn');
    const elementosContato = document.querySelectorAll('.contato');

    // Adicione o ouvinte de eventos para cada botão "comprar"
    botoesComprar.forEach((botao, index) => {
      botao.addEventListener('click', () => {
        const resposta = alert('Entre em contato com o comprador!');
      });
    });


  function editarCard(index) {
    // Obter o modal e o formulário
    const modal = document.getElementById("myModal");
    const form = document.getElementById("editarCardForm");
    
    // Abrir o modal
    modal.style.display = "block";
    
    
    // Lidar com o envio do formulário
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      
      // Obter os valores do formulário
      const titulo = form.titulo.value;
      const descricao = form.descricao.value;
      const valor = form.valor.value;
      const contato = form.contato.value;
      const categoria = form.categoria.value;
      
      // Verificar se todos os campos foram preenchidos
      if (titulo && descricao && valor && contato && categoria) {
        // Enviar os dados para o servidor para editar o card
        fetch('/editarCard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ index, titulo, descricao, valor, contato, categoria })
        })
        .then(() => {
          // Recarregar a página após a edição do card
          location.reload();
        })
        .catch(error => {
          console.error('Erro ao editar o card:', error);
        });
      }
      
      // Fechar o modal após o envio do formulário
      modal.style.display = "none";
    });

      // Adiciona um evento de clique ao documento
      document.addEventListener('click', (event) => {
        // Verifica se o clique ocorreu fora do modal
        if (event.target === modal) {
          // Fecha o modal
          modal.style.display = 'none';
        }
});


  }
  
  function excluirCard(index) {
    // Exibir uma confirmação antes de excluir o card
    if (confirm('Tem certeza que deseja excluir este card?')) {
      // Enviar uma solicitação para o servidor para excluir o card
      fetch('/excluirCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ index })
      })
      .then(() => {
        // Recarregar a página após a exclusão do card
        location.reload();
      })
      .catch(error => {
        console.error('Erro ao excluir o card:', error);
      });
    }
  }
</script>
      

      </main>
      <footer>
      <div id="footer_content">
            <div id="footer_contacts">
              <a class="logoFoot" href="index.html"><img src="image/logotipo.png"></a> <!-- Logotipo -->           
              
            </div>
            
            <ul class="footer-list">
                <li>
                    <h3>Páginas</h3>
                </li>
                <li>
                    <a href="/home" class="footer-link">Home</a>
                </li>
                <li>
                    <a href="/sobre" class="footer-link">Sobre</a>
                </li>
                <li>
                    <a href="/produtos" class="footer-link">Produtos</a>
                </li>
                <li>
                    <a href="http://localhost:3000" class="footer-link">Anúncios</a>
                </li>
            </ul>
  
            <ul class="footer-list">
                <li>
                    <h3>Contato</h3>
                </li>
                <li>
                  <div id="footer_social_media">
                    <a href="#" class="footer-link" id="whatsapp">
                    <i class="fa-brands fa-whatsapp"></i><a href="#" class="footer_numero">(123) 456-7890</a>
                        
                    </a>
                </div>
            </ul>
  
            <ul class="footer-list">
                <li>
                    <h3>Localização</h3>
                </li>
                <li>
                  <a href="#" class="footer-link">R. Adival Bertoli, 126 - Jardim Paraíso I<br> Taquaritinga - SP, 15900-000</a>
                </li>
            </ul>
        </div>
  
        <div id="footer_copyright">
            &#169
            2023 all rights reserved
        </div>
    </footer>
    </body>
    </html>
  `);
});

// Rota para exibir o formulário de criação de card
app.get('/criarCard', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Criar anúncio</title>
      <style>
      * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      letter-spacing: 2px;
      font-size: 1.8vh;
    }
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f5f5f5;
      }
      
      form {
        width: 400px;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
      
      label {
        display: block;
        margin-bottom: 8px;
        font-size: 1.2rem;
      }
      select{
        display: block;
        margin-bottom: 8px;
        font-size: 1.2rem;
      }
      
      input,
      select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin: 0 0 8px;
      }
      
      input[type="submit"] {
        width: 100%;
        margin-top: 16px;
        padding: 12px;
        background-color: #4caf50;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.2rem;
        display: flex;
        justify-content: center;
      }
      
      input[type="submit"]:hover {
        background-color: #45a049;
      }
      
      /* Estilos do modal */
      .modal {
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 600px;
        border-radius: 10px;
        animation: modalFadeIn 0.5s;
      }
      
      .modal_h2 {
        margin-top: 0;
        font-size: 2rem;
        padding: 1.5vh;
        margin: 0;
        text-align: center;
        color: #000;
      }
      h1{
        margin-top: 0;
        font-size: 2rem;
        padding: 1.5vh;
        margin: 0 0 2vh;
        text-align: center;
        color: #000;
        display:block;

      }
      
      form {
        margin-top: 20px;
      }
      
      .modal_label  {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #000;
      }
      
      
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .container {
        display: flex;
        justify-content: center;
      }
      .fechar{
        font-size: 24px;
        float: right;
        cursor: pointer;
        /* Outros estilos */
      }
      button {
        display: flex;
        width: 100%;
        color:#FFF;
        justify-content: center;
        padding: 8px 40px;
        background-color: #6FADEC;
        border: none; /* Remova a borda */
      }
      </style>
    </head>
    <body>
    
      <form action="/salvarCard" method="post">
      <h1>Faça seu anúncio</h1>
        <label for="titulo">Título:</label>
        <input type="text" name="titulo" id="titulo" ><br>
        
        <label for="descricao">Descrição:</label>
        <input type="text" name="descricao" id="descricao" ><br>
        
        <label for="valor">Valor em reais:</label>
        <input type="text" name="valor" id="valor" required><br>
        <button id="btnMostrarModal">Ver Preços</button><br>

        <label for="contato">Contato:</label>
        <input type="text" name="contato" id="contato" required><br>
        
        <label for="categoria">Categoria:</label>
        <select name="categoria" id="categoria" required>
          <option value="Pilha">Pilha</option>
          <option value="Plástico">Plástico</option>
          <option value="Papelão">Papelão</option>
          <option value="Metal">Metal</option>
          <option value="Alumínio">Alumínio</option>
          <option value="SucataComum">Sucata Comum</option>
          <option value="Vidro">Vidro</option>
          <option value="PlásticoPet">Plástico Pet</option>
          <option value="Cobre">Cobre</option>
        </select><br>
        
        <input type="submit" value="Salvar">
      </form>
      <div id="modal" class="modal">
      <div class="modal-content">
        <span class="fechar">&times;</span>
        <h2 class="modal_h2">Tabela de Preços</h2>
        <div class="container">
        <table>
        <tr>
        <td>Pilha</td>
        <td>R$ 0,50</td>
      </tr>
      <tr>
        <td>Plástico</td>
        <td>R$ 0,60</td>
      </tr>
      <tr>
        <td>Papelão</td>
        <td>R$ 0,80</td>
      </tr>
      <tr>
        <td>Metal</td>
        <td>R$ 4,40</td>
      </tr>
      <tr>
        <td>Alumínio</td>
        <td>R$ 8,00</td>
      </tr>
      <tr>
        <td>Sucata Comum</td>
        <td>R$ 10,00</td>
      </tr>
      <tr>
        <td>Vidro</td>
        <td>R$ 0,50</td>
      </tr>
      <tr>
        <td>Plástico Pet</td>
        <td>R$ 0,60</td>
      </tr>
      <tr>
        <td>Cobre</td>
        <td>R$ 25,00</td>
      </tr>
          <!-- Adicione mais linhas para as outras categorias e preços -->
          </table>
          </div>
      </div>
    </div>
    <div id="modal-overlay" class="modal-overlay"></div>

    </body>
    </html>
    <script>
        const btnMostrarModal = document.getElementById('btnMostrarModal');
        const modal = document.getElementById('modal');
        const overlay = document.getElementById('modal-overlay');
        const fecharModal = document.querySelector('.fechar');

        btnMostrarModal.addEventListener('click', function() {
          modal.style.display = 'block';
          overlay.style.display = 'block';
        });

        fecharModal.addEventListener('click', function() {
          modal.style.display = 'none';
          overlay.style.display = 'none';
        });
        // Quando o usuário clicar fora do modal, feche-o
          window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
            }
          };
    </script>
  `);
});

// Rota para salvar o card no arquivo de texto
app.post('/salvarCard', (req, res) => {
  const { titulo, descricao, valor, contato, categoria } = req.body;

  // Substituir a vírgula por outro caractere, como ponto e vírgula (;)
  const cardData = {
    titulo: titulo.replace(',', ';'),
    descricao: descricao.replace(',', ';'),
    valor: valor.replace(',', ';'),
    contato: contato.replace(',', ';'),
    categoria: categoria.replace(',', ';')
  };

  // Converter os dados em uma string formatada
  const cardDataString = `Título: ${cardData.titulo}, Descrição: ${cardData.descricao}, Valor: ${cardData.valor}, Contato: ${cardData.contato}, Categoria: ${cardData.categoria}`;

  // Salvar os dados no arquivo de texto
  fs.appendFileSync('dados.txt', `\n`);
  fs.appendFileSync('dados.txt', cardDataString + '\n');

  // Redirecionar de volta para a página inicial
  res.redirect('/');
});









// Rota para exibir o formulário de edição de card
app.post('/editarCard', (req, res) => {
  const { index, titulo, descricao, valor, contato, categoria } = req.body;

  // Ler o arquivo de texto e obter os dados
  const data = fs.readFileSync('dados.txt', 'utf8');
  const cards = data.split('\n').filter(Boolean);

  if (index >= 0 && index < cards.length) {
    // Atualizar o card com os novos dados
    const card = cards[index].split(',');

    card[0] = `Título: ${titulo.replace(',', ';')}`;
    card[1] = `Descrição: ${descricao.replace(',', ';')}`;
    card[2] = `Valor: R$ ${valor.replace(',', ';')}`;
    card[3] = `Contato: ${contato.replace(',', ';')}`;
    card[4] = `Categoria: ${categoria.replace(',', ';')}\n`;

    // Atualizar o arquivo de texto com os dados modificados
    cards[index] = card.join(',');

    fs.writeFileSync('dados.txt', cards.join('\n'));

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});


// Rota para excluir o card do arquivo de texto
app.post('/excluirCard', (req, res) => {
  const { index } = req.body;

  // Ler o arquivo de texto e obter os dados
  const data = fs.readFileSync('dados.txt', 'utf8');
  const cards = data.split('\n').filter(Boolean);

  if (index >= 0 && index < cards.length) {
    // Remover o card do array de cards
    cards.splice(index, 1);

    // Atualizar o arquivo de texto com os cards restantes
    fs.writeFileSync('dados.txt', cards.join('\n'));

    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

console.log(__dirname);


// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor iniciado. Acesse em http://localhost:3000/home');
});
app.listen(8080, () => {
  console.log('Servidor iniciado. Acesse em http://localhost:8080/home');
});
