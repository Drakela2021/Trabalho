import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'biblioteca-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 30
    }
}));

var listaLivros = [];
var listaLeitores = [];

app.use(express.static("public"));

const USUARIO = "admin";
const SENHA = "admin123";

app.get('/', (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso || null;

    res.write(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Biblioteca</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background: linear-gradient(135deg, #1a2744, #f5f0e8); min-height: 100vh; font-family: Arial, sans-serif; }
                .navbar-biblioteca { background: linear-gradient(90deg, #1a2744, #223060); padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; }
                .navbar-biblioteca a { color: rgba(255,255,255,0.88); text-decoration: none; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; }
                .navbar-biblioteca a:hover { background: rgba(255,255,255,0.18); color: white; }
                .navbar-brand-text { color: white; font-weight: 700; font-size: 1.2rem; text-decoration: none; }
                .body2 { display: flex; justify-content: center; align-items: center; padding: 40px 16px; min-height: 90vh; }
                .container-form { display: flex; flex-direction: column; align-items: center; width: 100%; }
                .menu-card { background-color: #f5f0e8; padding: 40px; border-radius: 15px; width: 400px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); text-align: center; }
                .menu-card h2 { color: #1a2744; margin-bottom: 10px; font-weight: 700; }
                .ultimo-acesso { background: #e8e0d0; border: 1px solid #c8b89a; border-radius: 10px; padding: 10px 18px; margin-bottom: 20px; color: #1a2744; font-size: 0.92rem; }
                .btn-submit { border: none; border-radius: 25px; background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; font-weight: 500; padding: 10px; width: 100%; display: block; text-decoration: none; margin-bottom: 10px; cursor: pointer; }
                .btn-submit:hover { opacity: 0.9; color: white; }
            </style>
        </head>
        <body>
        <div class="navbar-biblioteca">
            <div>
                <a href="/" class="navbar-brand-text">📚 Biblioteca</a>
            </div>
            <div>
                <a href="/">Menu</a>
    `);
    if (req.session.usuario) {
        res.write(`<span style="color:white; padding: 6px 14px; font-size:0.9rem;">Olá, <strong>${req.session.usuario}</strong></span>`);
        res.write(`<a href="/logout">Logout</a>`);
    } else {
        res.write(`<a href="/login">Login</a>`);
    }
    res.write(`
            </div>
        </div>
        <div class="body2">
            <div class="container-form">
                <div class="menu-card">
                    <h2>Menu do Sistema</h2>
    `);
    if (ultimoAcesso) {
        res.write(`<div class="ultimo-acesso">🕐 Último acesso: <strong>${ultimoAcesso}</strong></div>`);
    }
    if (req.session.usuario) {
        res.write(`
                    <p style="color:#555; font-size:0.92rem; margin-bottom:20px;">Selecione uma opção abaixo.</p>
                    <a href="/livros" class="btn-submit">📖 Cadastro de Livros</a>
                    <a href="/leitores" class="btn-submit">👤 Cadastro de Leitores</a>
        `);
    } else {
        res.write(`
                    <p style="color:#555; font-size:0.92rem; margin-bottom:20px;">Faça login para acessar o sistema.</p>
                    <a href="/login" class="btn-submit">Entrar</a>
        `);
    }
    res.write(`
                </div>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
    res.end();
});

app.get('/livros', (req, res) => {
    if (!req.session.usuario) {
        res.send(`<script>alert("Você precisa realizar o login para acessar o cadastro de livros!"); window.location.href="/login";</script>`);
        return;
    }

    res.write(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Livros</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background: linear-gradient(135deg, #1a2744, #f5f0e8); min-height: 100vh; font-family: Arial, sans-serif; }
                .navbar-biblioteca { background: linear-gradient(90deg, #1a2744, #223060); padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; }
                .navbar-biblioteca a { color: rgba(255,255,255,0.88); text-decoration: none; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; }
                .navbar-biblioteca a:hover { background: rgba(255,255,255,0.18); color: white; }
                .navbar-brand-text { color: white; font-weight: 700; font-size: 1.2rem; text-decoration: none; }
                .card-return { background-color: #f5f0e8; padding: 40px; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }
                .card-return h2 { text-align: center; margin-bottom: 30px; font-weight: 600; color: #1a2744; }
                .form-control { border-radius: 25px; padding-left: 15px; }
                .form-control:focus { border-color: #1a2744; box-shadow: 0 0 0 0.2rem rgba(26,39,68,0.3); }
                .btn-submit { border: none; border-radius: 25px; background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; font-weight: 500; padding: 10px; width: 100%; display: block; text-decoration: none; margin-bottom: 10px; cursor: pointer; }
                .btn-submit:hover { opacity: 0.9; color: white; }
                .btn-voltar { border-radius: 25px; width: 100%; margin-top: 10px; border: 2px solid #1a2744; color: #1a2744; font-weight: 500; background: transparent; }
                .btn-voltar:hover { background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; border: none; }
                thead { background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; }
                tbody tr:hover { background-color: #ede8df; }
            </style>
        </head>
        <body>
        <div class="navbar-biblioteca">
            <div>
                <a href="/" class="navbar-brand-text">📚 Biblioteca</a>
            </div>
            <div>
                <a href="/">Menu</a>
                <span style="color:white; padding: 6px 14px; font-size:0.9rem;">Olá, <strong>${req.session.usuario}</strong></span>
                <a href="/logout">Logout</a>
            </div>
        </div>
        <div style="max-width:700px; margin:40px auto; padding:0 16px;">
            <div class="card-return">
                <h2>Cadastro de Livros</h2>
                <form method="POST" action="/livros">
                    <div class="mb-3">
                        <label class="form-label" for="titulo">Título do Livro</label>
                        <input type="text" class="form-control" id="titulo" name="titulo" placeholder="Ex: Dom Casmurro" maxlength="100">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="autor">Nome do Autor</label>
                        <input type="text" class="form-control" id="autor" name="autor" placeholder="Ex: Machado de Assis" maxlength="80">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="isbn">Código ISBN / Identificação</label>
                        <input type="text" class="form-control" id="isbn" name="isbn" placeholder="Ex: 978-85-359-0277-5" maxlength="30">
                    </div>
                    <button type="submit" class="btn-submit">Cadastrar Livro</button>
                    <a href="/" class="btn btn-voltar text-center d-block mt-2">Voltar ao Menu</a>
                </form>
            </div>
    `);

    if (listaLivros.length > 0) {
        res.write(`
            <div class="card-return mt-4">
                <h4 style="color:#1a2744; margin-bottom:16px;">Livros Cadastrados</h4>
                <div class="table-responsive">
                    <table class="table table-striped table-hover text-center">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Autor</th>
                                <th>ISBN</th>
                            </tr>
                        </thead>
                        <tbody>
        `);
        for (let i = 0; i < listaLivros.length; i++) {
            const l = listaLivros[i];
            res.write(`
                <tr>
                    <td>${l.titulo}</td>
                    <td>${l.autor}</td>
                    <td>${l.isbn}</td>
                </tr>
            `);
        }
        res.write(`
                        </tbody>
                    </table>
                </div>
            </div>
        `);
    }

    res.write(`
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
    res.end();
});

app.post('/livros', (req, res) => {
    if (!req.session.usuario) {
        res.send(`<script>alert("Você precisa realizar o login!"); window.location.href="/login";</script>`);
        return;
    }

    const titulo = req.body.titulo;
    const autor = req.body.autor;
    const isbn = req.body.isbn;

    if (!titulo || !autor || !isbn) {
        res.send(`<script>alert("Preencha todos os campos obrigatórios!"); window.location.href="/livros";</script>`);
        return;
    }

    listaLivros.push({ titulo, autor, isbn });
    res.redirect('/livros');
});

app.get('/leitores', (req, res) => {
    if (!req.session.usuario) {
        res.send(`<script>alert("Você precisa realizar o login para acessar o cadastro de leitores!"); window.location.href="/login";</script>`);
        return;
    }

    res.write(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Leitores</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background: linear-gradient(135deg, #1a2744, #f5f0e8); min-height: 100vh; font-family: Arial, sans-serif; }
                .navbar-biblioteca { background: linear-gradient(90deg, #1a2744, #223060); padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; }
                .navbar-biblioteca a { color: rgba(255,255,255,0.88); text-decoration: none; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; }
                .navbar-biblioteca a:hover { background: rgba(255,255,255,0.18); color: white; }
                .navbar-brand-text { color: white; font-weight: 700; font-size: 1.2rem; text-decoration: none; }
                .card-return { background-color: #f5f0e8; padding: 40px; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }
                .card-return h2 { text-align: center; margin-bottom: 30px; font-weight: 600; color: #1a2744; }
                .form-control { border-radius: 25px; padding-left: 15px; }
                .form-control:focus { border-color: #1a2744; box-shadow: 0 0 0 0.2rem rgba(26,39,68,0.3); }
                .form-select { border-radius: 25px; padding-left: 15px; }
                .form-select:focus { border-color: #1a2744; box-shadow: 0 0 0 0.2rem rgba(26,39,68,0.3); }
                .btn-submit { border: none; border-radius: 25px; background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; font-weight: 500; padding: 10px; width: 100%; display: block; text-decoration: none; margin-bottom: 10px; cursor: pointer; }
                .btn-submit:hover { opacity: 0.9; color: white; }
                .btn-voltar { border-radius: 25px; width: 100%; margin-top: 10px; border: 2px solid #1a2744; color: #1a2744; font-weight: 500; background: transparent; }
                .btn-voltar:hover { background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; border: none; }
                thead { background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; }
                tbody tr:hover { background-color: #ede8df; }
            </style>
        </head>
        <body>
        <div class="navbar-biblioteca">
            <div>
                <a href="/" class="navbar-brand-text">📚 Biblioteca</a>
            </div>
            <div>
                <a href="/">Menu</a>
                <span style="color:white; padding: 6px 14px; font-size:0.9rem;">Olá, <strong>${req.session.usuario}</strong></span>
                <a href="/logout">Logout</a>
            </div>
        </div>
        <div style="max-width:700px; margin:40px auto; padding:0 16px;">
            <div class="card-return">
                <h2>Cadastro de Leitores</h2>
                <form method="POST" action="/leitores">
                    <div class="mb-3">
                        <label class="form-label" for="nomeLeitor">Nome do Leitor</label>
                        <input type="text" class="form-control" id="nomeLeitor" name="nomeLeitor" placeholder="Ex: João da Silva" maxlength="80">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="cpf">CPF / Identificação</label>
                        <input type="text" class="form-control" id="cpf" name="cpf" placeholder="Ex: 000.000.000-00" maxlength="20">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="telefone">Telefone para Contato</label>
                        <input type="text" class="form-control" id="telefone" name="telefone" placeholder="Ex: (11) 99999-9999" maxlength="15">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="dataEmprestimo">Data de Empréstimo</label>
                        <input type="date" class="form-control" id="dataEmprestimo" name="dataEmprestimo">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="dataDevolucao">Data de Devolução</label>
                        <input type="date" class="form-control" id="dataDevolucao" name="dataDevolucao">
                    </div>
                    <div class="mb-3">
                        <label class="form-label" for="livro">Livro</label>
                        <select class="form-select" id="livro" name="livro">
                            <option value="">-- Selecione um livro --</option>
    `);

    for (let i = 0; i < listaLivros.length; i++) {
        res.write(`<option value="${listaLivros[i].titulo}">${listaLivros[i].titulo} — ${listaLivros[i].autor}</option>`);
    }

    res.write(`
                        </select>
                    </div>
                    <button type="submit" class="btn-submit">Cadastrar Leitor</button>
                    <a href="/" class="btn btn-voltar text-center d-block mt-2">Voltar ao Menu</a>
                </form>
            </div>
    `);

    if (listaLeitores.length > 0) {
        res.write(`
            <div class="card-return mt-4">
                <h4 style="color:#1a2744; margin-bottom:16px;">Leitores Cadastrados</h4>
                <div class="table-responsive">
                    <table class="table table-striped table-hover text-center">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Telefone</th>
                                <th>Empréstimo</th>
                                <th>Devolução</th>
                                <th>Livro</th>
                            </tr>
                        </thead>
                        <tbody>
        `);
        for (let i = 0; i < listaLeitores.length; i++) {
            const l = listaLeitores[i];
            res.write(`
                <tr>
                    <td>${l.nomeLeitor}</td>
                    <td>${l.cpf}</td>
                    <td>${l.telefone}</td>
                    <td>${l.dataEmprestimo}</td>
                    <td>${l.dataDevolucao}</td>
                    <td>${l.livro}</td>
                </tr>
            `);
        }
        res.write(`
                        </tbody>
                    </table>
                </div>
            </div>
        `);
    }

    res.write(`
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
    res.end();
});

app.post('/leitores', (req, res) => {
    if (!req.session.usuario) {
        res.send(`<script>alert("Você precisa realizar o login!"); window.location.href="/login";</script>`);
        return;
    }

    const { nomeLeitor, cpf, telefone, dataEmprestimo, dataDevolucao, livro } = req.body;

    if (!nomeLeitor || !cpf || !telefone || !dataEmprestimo || !dataDevolucao || !livro) {
        res.send(`<script>alert("Preencha todos os campos obrigatórios!"); window.location.href="/leitores";</script>`);
        return;
    }

    listaLeitores.push({ nomeLeitor, cpf, telefone, dataEmprestimo, dataDevolucao, livro });
    res.redirect('/leitores');
});

app.get('/login', (req, res) => {
    res.write(`
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Login</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background: linear-gradient(135deg, #1a2744, #f5f0e8); min-height: 100vh; font-family: Arial, sans-serif; }
                .navbar-biblioteca { background: linear-gradient(90deg, #1a2744, #223060); padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; }
                .navbar-biblioteca a { color: rgba(255,255,255,0.88); text-decoration: none; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; }
                .navbar-biblioteca a:hover { background: rgba(255,255,255,0.18); color: white; }
                .navbar-brand-text { color: white; font-weight: 700; font-size: 1.2rem; text-decoration: none; }
                .body2 { display: flex; justify-content: center; align-items: center; padding: 40px 16px; min-height: 90vh; }
                .container-form { display: flex; flex-direction: column; align-items: center; width: 100%; }
                .login-card { background-color: #f5f0e8; padding: 40px; border-radius: 15px; width: 360px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }
                .login-card h2 { text-align: center; margin-bottom: 30px; font-weight: 600; color: #1a2744; }
                .form-control { border-radius: 25px; padding-left: 15px; }
                .form-control:focus { border-color: #1a2744; box-shadow: 0 0 0 0.2rem rgba(26,39,68,0.3); }
                .btn-submit { border: none; border-radius: 25px; background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; font-weight: 500; padding: 10px; width: 100%; display: block; text-decoration: none; margin-bottom: 10px; cursor: pointer; }
                .btn-submit:hover { opacity: 0.9; color: white; }
                .btn-voltar { border-radius: 25px; width: 100%; margin-top: 10px; border: 2px solid #1a2744; color: #1a2744; font-weight: 500; background: transparent; }
                .btn-voltar:hover { background: linear-gradient(90deg, #1a2744, #c8b89a); color: white; border: none; }
            </style>
        </head>
        <body>
        <div class="navbar-biblioteca">
            <div>
                <a href="/" class="navbar-brand-text">📚 Biblioteca</a>
            </div>
            <div>
                <a href="/">Menu</a>
                <a href="/login">Login</a>
            </div>
        </div>
        <div class="body2">
            <div class="container-form">
                <div class="login-card">
                    <h2>📚 Login</h2>
                    <div style="background:#e8e0d0; border:1px solid #c8b89a; border-radius:10px; padding:8px 14px; margin-bottom:16px; font-size:0.82rem; color:#1a2744;">
                         Usuário: <strong>admin</strong> &nbsp;|&nbsp; Senha: <strong>admin123</strong>
                    </div>
                    <form method="POST" action="/login">
                        <div class="mb-3">
                            <label class="form-label" for="usuario">Usuário</label>
                            <input type="text" class="form-control" id="usuario" name="usuario" placeholder="Usuário">
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="senha">Senha</label>
                            <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha">
                        </div>
                        <button type="submit" class="btn-submit">Entrar</button>
                        <button type="button" class="btn btn-voltar" onclick="history.back()">Voltar</button>
                    </form>
                </div>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
    res.end();
});

app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    if (!usuario || !senha) {
        res.send(`<script>alert("Preencha todos os campos!"); window.location.href="/login";</script>`);
        return;
    }

    if (usuario === USUARIO && senha === SENHA) {
        req.session.usuario = usuario;
        const agora = new Date();
        res.cookie('ultimoAcesso', agora.toLocaleString('pt-BR'), { maxAge: 1000 * 60 * 60 * 24 * 30 });
        res.send(`<script>alert("Login efetuado com sucesso! Bem-vindo, ${usuario}!"); window.location.href="/";</script>`);
        return;
    }

    res.send(`<script>alert("Usuário ou senha incorretos!"); window.location.href="/login";</script>`);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send(`<script>alert("Logout efetuado com sucesso!"); window.location.href="/";</script>`);
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});