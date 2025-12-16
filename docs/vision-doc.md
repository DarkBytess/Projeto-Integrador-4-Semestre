# Documento de Visão

## Introdução

### Objetivo do Documento
Este documento tem como objetivo apresentar uma visão geral do projeto "Monitoramento Inteligente de Plantas", descrevendo seu escopo, objetivos, funcionalidades, stakeholders, restrições, riscos e cronograma. É destinado a todas as partes interessadas envolvidas no desenvolvimento e implementação do sistema.

### Escopo do Produto
O projeto propõe o desenvolvimento de um sistema inteligente de monitoramento de plantas, utilizando tecnologias de IoT. O sistema coletará dados ambientais em tempo real e os processará para auxiliar na tomada de decisões no ambiente agrícola, com foco em hortas experimentais e áreas rurais.

### Definições, Acrônimos e Abreviações
- *IoT*: Internet das Coisas  
- *API*: Interface de Programação de Aplicações  
- *JWT*: JSON Web Token  
- *RENDER*: Cloud Application  
- *UI*: Interface de Usuário  

### Referências
- SANTOS, 2015. O monitoramento ambiental como etapa essencial do manejo agrícola.
- Desafio SENAI de Projetos Integradores – DSPI 2025.
- https://gpinovacao.senai.br/

### Visão Geral do Documento
O documento aborda o posicionamento do produto, o público-alvo, as funcionalidades principais, o ambiente operacional, os requisitos, restrições, riscos e cronograma de entregas.

---

## Posicionamento

### Oportunidade de Negócio
A agricultura moderna exige soluções tecnológicas para aumento de produtividade e sustentabilidade. O monitoramento automatizado de variáveis ambientais representa uma oportunidade para minimizar perdas e otimizar o uso de recursos naturais.

### Problema a Ser Resolvido
Dificuldade em manter condições ideais para o crescimento das plantas em ambientes rurais com clima instável, devido à limitação de monitoramento manual e intervenções tardias.

### Descrição do Produto
O sistema consiste em uma aplicação mobile integrada com sensores de IoT, um backend para gerenciamento de dados, e uma interface web para monitoramento remoto. Ele permite a coleta e análise de dados como umidade do solo, temperatura, luminosidade, entre outros.

### Declaração de Posição do Produto
Para agricultores e produtores rurais, que necessitam monitorar variáveis ambientais de forma remota e em tempo real, o Monitoramento Inteligente de Plantas é um sistema de IoT que automatiza a coleta de dados e auxilia na tomada de decisão, promovendo melhores práticas agrícolas.

---

## Stakeholders e Usuários

### Identificação dos Stakeholders
- Agricultores
- Técnicos agrícolas
- Equipe de desenvolvimento
- Instituição de ensino (SENAI)
- Professores orientadores
- Indústria parceira (via desafio SAGA)

### Perfis dos Usuários
- *Usuário Agricultor*: pessoa com experiência prática no campo que necessita de uma interface simples e objetiva.
- *Usuário Técnico*: responsável por interpretar dados mais detalhados e configurar parâmetros.
- *Administrador*: gerencia os dispositivos e usuários do sistema.

### Necessidades dos Usuários e Stakeholders
- Monitoramento em tempo real do ambiente agrícola
- Alertas sobre condições críticas
- Interface intuitiva
- Suporte a múltiplos sensores
- Confiabilidade na coleta e envio de dados

### Ambiente Operacional
- Aplicativo Mobile (Android)
- Backend com banco de dados na nuvem (AWS)
- Interface Web para dashboards e gestão
- Sensores conectados via rede Wi-Fi ou LoRa

---

## Descrição do Produto

### Perspectiva do Produto
Produto novo, integrando sensores físicos com um sistema backend e interfaces mobile/web. Possui possibilidade de integração futura com sistemas de irrigação automatizada.

### Principais Funcionalidades
- Leitura de sensores (temperatura, umidade, luz, etc.)
- Envio de dados para a nuvem via MQTT/HTTP
- Armazenamento em banco de dados PostgreSQL
- Visualização dos dados em dashboard
- Alertas e notificações via app
- Diferentes perfis de usuários
- Registro/login com autenticação JWT e OAuth

### Suposições e Dependências
- A infraestrutura de rede (Wi-Fi ou LoRa) está disponível nas áreas monitoradas.
- Os sensores são calibrados corretamente.
- A aplicação será acessada por dispositivos móveis Android.
- Dependência da API de clima para dados complementares.

### Limitações
- Sem suporte inicial a iOS
- Não inclui irrigação automatizada na primeira versão
- A cobertura do sensor está limitada a áreas pequenas por módulo

---

## Requisitos de Alto Nível

- *Requisitos Funcionais*
  - RF01: O sistema deve coletar dados ambientais via sensores.
  - RF02: O backend deve armazenar os dados recebidos.
  - RF03: O app deve exibir os dados em tempo real para o usuário.
  - RF04: O sistema deve enviar notificações com base em alertas configuráveis.
  - RF05: O sistema deve permitir diferentes tipos de usuário (agricultor, técnico, admin).

- *Requisitos Não Funcionais*
  - RNF01: A comunicação entre dispositivos deve ser segura.
  - RNF02: O sistema deve estar disponível 24/7.
  - RNF03: A interface deve ser responsiva e acessível.
  - RNF04: Os dados devem estar protegidos com autenticação JWT.

---

## Características de Qualidade do Produto

### Usabilidade
Interface intuitiva, com dashboards simples e alertas visuais.

### Confiabilidade
Alta taxa de disponibilidade e coleta contínua de dados.

### Desempenho
Processamento em tempo real de dados de sensores.

### Segurança
Autenticação segura, criptografia de dados, uso de OAuth.

### Portabilidade
Aplicativo mobile para Android; backend e frontend na nuvem.

---

## Restrições

- A aplicação não terá suporte para iOS na primeira entrega.
- O projeto deve utilizar sensores disponíveis localmente.
- O sistema será testado inicialmente em ambiente de horta experimental.
- Limite orçamentário para aquisição de sensores e infraestrutura.

---

## Riscos

- Problemas na conectividade dos sensores em áreas remotas
- Dificuldade na integração dos dados em tempo real
- Falhas de hardware (sensores)
- Curva de aprendizado para os usuários do sistema

---

## Cronograma de Marcos

| Marco | Descrição | Data Estimada |
|-------|-----------|---------------|
| Entrega 1 | Documento de Visão | 11/08/2025 |
| Entrega 2 | Documento de Visão (Completo) | 22/08/2025 |
| Entrega 3 | Entrega Parcial com Funcionalidades | 03/10/2025 |
| Entrega 4 | Entrega Final + Apresentação | 12/12/2025 |

---

## Apêndices

### A. Glossário
- *Sensor*: Dispositivo que mede variáveis ambientais.
- *MQTT*: Protocolo de comunicação leve para IoT.
- *OAuth*: Protocolo de autorização padrão para autenticação segura.
