# Conecta Orto — O Futuro dos Implantes Ortopédicos



<img width="800" height="800" alt="image" src="https://github.com/user-attachments/assets/1567681d-1e90-4d9b-af22-7ce36a60c957" />



## 📌 Sobre o Projeto

<img width="1055" height="1491" alt="image" src="https://github.com/user-attachments/assets/87c769c7-4765-4dd3-bbf3-4cb290b5eae2" />



O **Conecta Orto** é um aplicativo web interativo desenvolvido para o projeto de Extensão Curricularizada II da unidade curricular de **Engenharia de Software**.



O objetivo do sistema é apoiar a realização de um congresso de extensão voltado à comunidade, com foco em explicar, de forma simples e acessível, o funcionamento dos implantes ortopédicos, seus materiais, tecnologias, segurança e importância para a saúde.



A proposta busca transformar um tema técnico da engenharia e da saúde em uma experiência digital educativa, acessível e confiável para pessoas que possuem dúvidas, receios ou curiosidade sobre implantes como pinos, placas e próteses.



---



## 👥 Equipe



* Jasmine De Sá Araujo

* Luigi Calovi Fonini

* Luca Matos Parente

* João Victor Rikio Enomoto

* Isaac Joaquim Barbosa Andrade



---

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/8ca02d9b-2dcc-4c06-b182-063ba4b54b95" />

---



## 🎯 Objetivo Geral



Desenvolver um website interativo para um congresso de extensão sobre implantes ortopédicos, contendo informações do evento, inscrição de participantes, minicursos, certificados, programação e localização do campus.



---



## 🎯 Objetivos Específicos



* Criar uma identidade digital para o congresso.

* Facilitar a inscrição de participantes no evento.

* Permitir inscrição em minicursos.

* Registrar dados em banco de dados.

* Disponibilizar consulta de certificados por e-mail.

* Apresentar a programação completa do evento.

* Melhorar a experiência do usuário com uma interface moderna e responsiva.

* Disponibilizar a localização e planta baixa do evento.



---



## 🧩 Funcionalidades do Sistema



### Página Inicial



A página inicial apresenta o congresso, sua proposta, informações principais e botões de navegação para as áreas mais importantes do sistema.



Funcionalidades:



* Apresentação do evento.

* Vídeo incorporado.

* Botão de inscrição.

* Botão para minicursos.

* Botão para certificados.

* Informações gerais sobre o congresso.



---



### Inscrição no Evento



O sistema permite que o participante realize sua inscrição por meio de um formulário.



Campos utilizados:



* Nome

* E-mail

* Telefone

* Cidade

* Profissão



Após o envio, os dados são armazenados no banco de dados.



---



### Minicursos



O sistema apresenta minicursos relacionados ao tema do congresso.



Exemplos:



* Introdução aos Implantes Ortopédicos

* Materiais Biocompatíveis



Regra de negócio:



O participante só pode se inscrever em um minicurso se já estiver inscrito no evento.



---



### Certificados



A área de certificados permite que o participante consulte sua participação utilizando o e-mail cadastrado.



O sistema pode exibir:



* Certificado de participação no evento.

* Certificados dos minicursos realizados.



---



### Programação



O site possui uma programação de um dia inteiro de evento.



Exemplo de agenda:



| Horário | Atividade                               |

| ------- | --------------------------------------- |

| 08:00   | Credenciamento                          |

| 08:30   | Abertura oficial                        |

| 09:00   | Palestra sobre implantes ortopédicos    |

| 10:00   | Palestra sobre materiais biocompatíveis |

| 11:00   | Demonstração prática                    |

| 12:00   | Intervalo para almoço                   |

| 14:00   | Minicurso 1                             |

| 15:30   | Minicurso 2                             |

| 16:30   | Mesa-redonda                            |

| 17:30   | Encerramento                            |

| 18:00   | Final do evento                         |



---



### Localização



A página de localização apresenta a planta baixa do Campus Norte, facilitando a orientação dos participantes dentro do local do evento.



Recursos planejados:



* Planta baixa do campus.

* Indicação de salas, laboratórios e áreas de apoio.

* Informações sobre estacionamento.

* Mapa de localização.

* Botão para abrir no Google Maps.



---<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/f394d725-b1b3-4def-ac13-ed01091620b7" />





## 🗃️ Banco de Dados



O sistema utiliza banco de dados para armazenar informações dos participantes, minicursos e inscrições.



### Tabela: registrations



Responsável por armazenar os participantes inscritos no evento.



Campos principais:



* id

* name

* email

* phone

* city

* profession

* created_at



---



### Tabela: minicourses



Responsável por armazenar os minicursos disponíveis.



Campos principais:



* id

* title

* instructor

* duration

* capacity

* created_at



---



### Tabela: enrollments



Responsável por relacionar participantes aos minicursos.



Campos principais:



* id

* registration_id

* minicourse_id

* created_at



Relacionamentos:



* Um participante pode se inscrever em minicursos.

* Um minicurso pode possuir vários participantes.

* A tabela enrollments representa a relação entre participante e minicurso.



---



## 🏗️ Arquitetura do Sistema



O projeto segue uma estrutura web dividida em:



### Front-end



Responsável pela interface visual e interação com o usuário.



Principais responsabilidades:



* Exibir páginas.

* Capturar dados dos formulários.

* Apresentar informações do evento.

* Melhorar a experiência do usuário.



---



### Back-end



Responsável pela lógica da aplicação e comunicação com o banco de dados.



Principais responsabilidades:



* Receber dados dos formulários.

* Validar informações.

* Registrar inscrições.

* Consultar certificados.

* Controlar inscrições em minicursos.



---



### Banco de Dados



Responsável pela persistência das informações do sistema.



Principais responsabilidades:



* Armazenar participantes.

* Armazenar minicursos.

* Registrar inscrições.

* Permitir consultas.



---



## 🛠️ Tecnologias Utilizadas



As tecnologias podem variar conforme a implementação final, mas o projeto pode utilizar:



* HTML

* CSS

* JavaScript

* React

* Node.js

* Express

* PostgreSQL

* Supabase

* Git

* GitHub

* Replit



---



## 📱 Responsividade



O sistema foi pensado para funcionar em diferentes dispositivos:



* Computadores

* Tablets

* Celulares



A interface deve ser adaptável, permitindo que a comunidade acesse o congresso de forma simples, mesmo pelo celular.



---



## ♿ Acessibilidade



O projeto busca oferecer uma experiência acessível por meio de:



* Textos claros.

* Botões visíveis.

* Contraste adequado.

* Navegação simples.

* Organização lógica das informações.

* Linguagem acessível para a comunidade.



---



## 🔐 Regras de Negócio



* O participante deve informar dados básicos para se inscrever no evento.

* O e-mail deve ser utilizado como identificador para consulta de certificados.

* Para se inscrever em minicursos, o participante precisa estar cadastrado no evento.

* O sistema deve registrar qual participante se inscreveu em qual minicurso.

* O sistema deve contar automaticamente o número de inscritos.



---



## 🚀 Como Executar o Projeto



### 1. Clonar o repositório



```bash

git clone <url-do-repositorio>

```



### 2. Entrar na pasta do projeto



```bash

cd conecta-orto

```



### 3. Instalar as dependências



```bash

npm install

```



### 4. Configurar as variáveis de ambiente



Criar um arquivo `.env` com as informações necessárias do banco de dados.



Exemplo:



```env

DATABASE_URL=sua_url_do_banco

SUPABASE_URL=sua_url_do_supabase

SUPABASE_ANON_KEY=sua_chave_anonima

```



### 5. Executar o projeto



```bash

npm run dev

```



---



## 📊 Possíveis Melhorias Futuras



* Área administrativa com login.

* Exportação de inscritos em CSV.

* Geração de certificados em PDF.

* Envio de confirmação por e-mail.

* QR Code para credenciamento.

* Mapa interativo com zoom.

* Controle de vagas por minicurso.

* Dashboard com estatísticas do evento.

* Validação avançada dos formulários.



---



## 📚 Importância do Projeto



O Conecta Orto contribui para aproximar a engenharia da comunidade, explicando de forma acessível como a tecnologia está presente na área da saúde.



Além disso, o projeto permite aos estudantes aplicar conceitos fundamentais de Engenharia de Software, como:



* Levantamento de requisitos.

* Modelagem de banco de dados.

* Desenvolvimento front-end.

* Desenvolvimento back-end.

* Integração com banco de dados.

* Experiência do usuário.

* Testes funcionais.

* Documentação técnica.

* Trabalho em equipe.



---



## ✅ Conclusão



O projeto Conecta Orto apresenta uma solução digital para um congresso de extensão voltado à comunidade, unindo tecnologia, saúde e educação.



A aplicação atende aos requisitos propostos pela atividade, oferecendo inscrição no evento, minicursos, certificados, programação e informações de localização.



Com isso, o sistema demonstra a aplicação prática dos conhecimentos adquiridos no curso de Engenharia de Software, promovendo uma experiência interativa, funcional e acessível.
