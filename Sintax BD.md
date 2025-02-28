Altere o **.env** da pasta na sua maquina da seguinte forma
```
DATABASE_URL=postgres://seu_usuario:sua_senha@localhost:5432/nome_do_banco_criado
PORT=3000 // Porta padrão não precisa alterar
```
Sintax da tabela
```
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    id_hospitalar VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
);
```
