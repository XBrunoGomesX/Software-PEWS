const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔄 Iniciando servidor...");

if (!process.env.DATABASE_URL) {
    console.error("❌ ERRO: DATABASE_URL não definida no .env!");
    process.exit(1); 
}

// Conexão com o PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Testa a conexão com o banco de dados
pool.connect()
    .then(() => console.log("✅ Conectado ao PostgreSQL"))
    .catch(err => {
        console.error("❌ Erro ao conectar ao PostgreSQL:", err);
        process.exit(1); 
    });

app.post("/cadastro", async (req, res) => {
    try {
        console.log("📩 Recebendo dados:", req.body);

        const { nome, cpf, idHospitalar, email, senha } = req.body;

        const verifica = await pool.query(
            "SELECT * FROM usuarios WHERE cpf = $1 OR email = $2",
            [cpf, email]
        );

        if (verifica.rows.length > 0) {
            console.log("⚠️ CPF ou Email já cadastrados!");
            return res.status(400).json({ message: "CPF ou E-mail já cadastrados!" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            "INSERT INTO usuarios (nome, cpf, id_hospitalar, email, senha) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [nome, cpf, idHospitalar, email, senhaHash]
        );

        console.log("✅ Usuário cadastrado com sucesso!");
        res.status(201).json({ message: "Usuário cadastrado com sucesso!", usuario: result.rows[0] });

    } catch (error) {
        console.error("❌ Erro ao cadastrar usuário:", error);
        res.status(500).json({ message: "Erro ao cadastrar usuário", error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

app.post("/login", async (req, res) => {
    try {
        console.log("🔑 Tentativa de login:", req.body);

        const { email, senha } = req.body;

        const resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

        if (resultado.rows.length === 0) {
            console.log("⚠️ Usuário não encontrado!");
            return res.status(400).json({ message: "Usuário não encontrado!" });
        }

        const usuario = resultado.rows[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            console.log("❌ Senha incorreta!");
            return res.status(401).json({ message: "Senha incorreta!" });
        }

        console.log("✅ Login bem-sucedido!");
        res.json({ message: "Login bem-sucedido!", usuario });

    } catch (error) {
        console.error("❌ Erro ao processar login:", error);
        res.status(500).json({ message: "Erro ao processar login", error: error.message });
    }
});
