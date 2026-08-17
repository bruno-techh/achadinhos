# Central dos Achadinhos

Site estático de ofertas para GitHub Pages. Ele lê os produtos do arquivo `ofertas.json` e mostra 50 por página.

## Publicar pela primeira vez

1. Extraia o ZIP.
2. No repositório `tech-bruno/achadinhos`, clique em **Add file > Upload files**.
3. Envie `index.html`, `styles.css`, `app.js`, `ofertas.json` e `README.md` (os arquivos devem ficar na raiz).
4. Clique em **Commit changes**.
5. Abra **Settings > Pages**.
6. Em **Build and deployment**, selecione **Deploy from a branch**.
7. Escolha a branch **main**, a pasta **/(root)** e clique em **Save**.

O endereço será: `https://tech-bruno.github.io/achadinhos/`

## Formato do ofertas.json

```json
[
  {
    "produto_id": "id-unico-do-produto",
    "loja": "amazon",
    "titulo": "Nome do produto",
    "imagem": "https://endereco-da-imagem.jpg",
    "preco_atual": 59.90,
    "preco_antigo": 89.90,
    "desconto": 33,
    "cupom": "CUPOM10",
    "link_afiliado": "https://link-de-afiliado",
    "criado_em": "2026-08-17T12:00:00-03:00"
  }
]
```

Lojas aceitas: `amazon`, `shopee`, `aliexpress` e `mercado-livre`.

Não coloque tokens, senhas ou chaves de API nestes arquivos públicos.
