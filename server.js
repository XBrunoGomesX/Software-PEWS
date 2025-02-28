const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); 


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


app.post("/cadastro", async (req, res) => {
    try {
        let { nome, cpf, idHospitalar, email, senha } = req.body;

        if (!nome || !cpf || !idHospitalar || !email || !senha) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios!" });
        }

        cpf = cpf.replace(/\D/g, ""); 
        email = email.toLowerCase().trim();

        
        const verifica = await pool.query(
            "SELECT * FROM usuarios WHERE cpf = $1 OR email = $2",
            [cpf, email]
        );

        if (verifica.rows.length > 0) {
            return res.status(400).json({ message: "CPF ou E-mail já cadastrados!" });
        }

        await pool.query(
            "INSERT INTO usuarios (nome, cpf, id_hospitalar, email, senha) VALUES ($1, $2, $3, $4, $5)",
            [nome, cpf, idHospitalar, email, senha]
        );

        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

    } catch (error) {
        console.error("Erro ao cadastrar:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios!" });
        }

        const usuario = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (usuario.rows.length === 0 || usuario.rows[0].senha !== senha) {
            return res.status(401).json({ message: "Usuário ou senha incorretos!" });
        }

        res.status(200).json({ message: "Login realizado com sucesso!", usuario: usuario.rows[0] });

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
