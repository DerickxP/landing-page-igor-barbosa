# Landing page: Igor Barbosa, personal trainer

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02?logo=greensock&logoColor=white)

Landing page sob medida para um personal trainer, apresentando a metodologia, os
planos de mentoria online e o atendimento presencial. Feita em HTML, CSS e
JavaScript puro, com animações guiadas pelo scroll.

> Projeto desenvolvido para um cliente; todos os direitos reservados ao contratante.

## Como funciona

- **Animação de fundo em canvas:** uma sequência de 80 quadros, extraída de um vídeo
  gerado com IA (Veo 3, Whisk e Flow), roda em loop a 20 fps no `<canvas>` e pausa
  quando a seção inicial sai da tela.
- **GSAP + ScrollTrigger** (via CDN) para revelar títulos, cards e seções.
- **Interações com o mouse:** brilho de borda que acompanha o cursor nos cards de
  preço e botões com efeito magnético.
- **Glassmorphism** com `backdrop-filter`, ícones em SVG inline e layout
  responsivo com media queries.
- Scripts não críticos carregados com `requestIdleCallback`.

## Como rodar

Sem build nem dependências locais:

```bash
git clone https://github.com/DerickxP/landing-page-igor-barbosa.git
cd landing-page-igor-barbosa
python3 -m http.server 8000   # http://localhost:8000
```

A pasta `Landing Page - IBS/` guarda as versões da animação usadas no processo
de criação.

## Direitos de uso

O código pode ser consultado como referência de estudo. A identidade visual,
as imagens, os textos e a oferta de preços pertencem ao cliente e não podem ser
reutilizados.
