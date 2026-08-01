# Design do Sistema de Combate - Magic Campus Reborn

Este documento define as regras, atributos, fórmulas e filosofia do novo sistema de combate em turnos do jogo. O foco é manter a essência nostálgica, mas modernizar as mecânicas para serem dinâmicas, viáveis para jogadores solo e taticamente profundas.

---

## 1. Filosofia de Combate
- **Sem Mana (MP), Apenas Cooldowns:** As habilidades não possuem custo. O balanceamento é feito através de tempo de recarga (Cooldowns medidos em turnos).
- **Ataque e Defesa Básicos:** Sempre disponíveis (CD 0). São úteis para preencher turnos e têm mecânicas exclusivas (Contra-ataque e Ataque Duplo só funcionam em ataques básicos).
- **Independência (Solo Viável):** Todas as classes recebem, em seus níveis iniciais, pelo menos uma habilidade de dano único e uma de dano em área (AoE). O papel específico da classe brilhará mais em batalhas difíceis ou PvP/Coop.
- **Dinamismo na Linha do Tempo (Speed):** A Velocidade define a ordem de ataque. Personagens muito rápidos podem agir mais vezes antes de inimigos lentos.

---

## 2. Atributos Base e Derivados

Os 6 atributos primários distribuem pontos para gerar os atributos de combate. 
*(Os valores exatos de conversão serão balanceados com o tempo, mas a lógica segue abaixo)*

### Atributos Base (Primários)
1. **Vitalidade:** Foco em Sobrevivência bruta.
2. **Força:** Foco em Dano e Resistência Física.
3. **Inteligência:** Foco em Dano Mágico e conhecimento de feitiços.
4. **Espírito:** Foco em Resistência Mágica e Poder Espiritual (Curas/Buffs).
5. **Agilidade:** Foco em Mobilidade e Reflexos.
6. **Mentalidade:** Foco em Foco, Precisão e Letalidade.

### Fórmulas de Conversão (Base para Combate)
Cada ponto investido nos atributos primários (Base) concede atributos secundários (Combate) usando as seguintes fórmulas de escala direta:

| Atributo Base (1 Ponto) | Concede em Atributos de Combate |
| :--- | :--- |
| **Vitalidade (VIT)** | **+15** HP Máximo, **+1** Defesa Física |
| **Força (FOR)** | **+3** Dano Físico, **+1** Defesa Física, **+0.1%** Chance Contra-Ataque |
| **Inteligência (INT)**| **+3** Dano Mágico, **+2** Energia |
| **Espírito (ESP)** | **+2** Defesa Mágica, **+1%** Efetividade de Cura, **+2** Energia |
| **Agilidade (AGI)** | **+2** Velocidade, **+2** Evasão |
| **Mentalidade (MEN)** | **+2** Precisão, **+0.2%** Chance de Crítico, **+0.2%** Chance de Ataque Duplo |

*(Nota: Armas, armaduras e equipamentos atuarão somando valores diretamente nos **Atributos de Combate**. Exemplo: Uma espada não dá Força, ela dá +100 Dano Físico direto).*

---

## 3. Atributos de Combate e Mecânicas

- **HP:** Saúde do personagem. Chegou a 0, está nocauteado.
- **Velocidade:** Define a ordem de ação em cada rodada.
- **Precisão vs Evasão:** Determina a chance de acerto.
  - *Fórmula Base:* `Chance de Acerto (%) = 100% + (Precisão do Atacante - Evasão do Defensor)`
- **Crítico:** Chance de causar entre `150% a 200%` do dano normal.
- **Energia (Tenacidade/Foco):** Define o sucesso de Buffs e Debuffs.
  - *Mecânica:* Se um Atirador tenta paralisar o alvo, o jogo calcula: `Chance Base da Skill + (Energia do Atacante - Energia do Defensor)`.
- **Contra-ataque (Counter-Attack):** Chance de revidar um ataque básico recebido. Limitado a 1x por turno. (Excelente para tanks ou lutadores parridos).
- **Ataque Duplo (Follow-up / Combo):** *Melhor nome que "Ataque em sequência"*. É a chance de bater uma segunda vez (com um ataque básico extra) sempre que usar o Ataque Básico. Limitado a 1x por turno.

---

## 4. Fórmulas de Dano Modernas

Sistemas antigos subtraíam a defesa diretamente do ataque (`Dano = Ataque - Defesa`), o que causava imunidade total se a Defesa fosse maior que o Ataque.
A fórmula moderna recomendada usa decaimento percentual (estilo League of Legends ou Genshin Impact):

```text
Multiplicador de Defesa = 1000 / (1000 + Defesa do Alvo)
Dano Bruto = Dano da Habilidade + Dano do Personagem
Dano Final = Dano Bruto * Multiplicador de Defesa
```
*Exemplo:* Se a habilidade dá 500 de dano e o inimigo tem 500 de defesa: `500 * (1000 / 1500) = 500 * 0.66 = 333 de dano recebido.` Isso garante que nenhum ataque dê "0" de dano, apenas é bastante mitigado.

---

## 5. Re-imaginando as Classes (Modernizadas para Solo/Coop)

### ⚔️ Lutador (Melee Físico)
- **Foco:** DPS Físico Burst, Crítico.
- **Mecânica Moderna:** Especialista em fechar o combate. Tem habilidades AoE (Ex: Avalanche), mas seu foco é obliterar 1 a 3 alvos. O "Braço de Hércules" pode ter um CD de 3 turnos, mas se matar o alvo, zera o Cooldown ou recupera HP. O Ataque Básico dele escala fortemente com Ataque Duplo.

### 🏹 Atirador (Ranged Mágico)
- **Foco:** DPS Mágico em Área (AoE) contínuo.
- **Mecânica Moderna:** Excelente para farm. Sua "Pena Voadora" aplica "Cadeia Elementar" que amplifica o dano do próximo ataque mágico no alvo. Diferente do lutador (Burst), o Atirador corrói vários inimigos simultaneamente enquanto debuffa a resistência mágica deles.

### 🎵 Música (Ranged Mágico / Controle)
- **Foco:** Debuff (CC - Crowd Control) e Dano Mágico Constante.
- **Mecânica Moderna:** Para viabilizar solo, ganha habilidades de dano sônico AoE. A "Petroquímica" (paralisação) tem CD de 4 turnos. Quando joga solo, ela aplica veneno/sangramento sônico no inimigo e se defende, ou usa o pet para finalizar o alvo debilitado.

### 💉 Médica (Ranged Mágico / Suporte)
- **Foco:** Healer, Buffs puros e Sobrevivência.
- **Mecânica Moderna:** Jogar solo de médico é ruim. Para resolver isso: As curas da médica aplicam um "Escudo Sagrado" que devolve dano mágico aos inimigos quando o alvo é atacado. Ela também tem habilidades base de purificação (dano sagrado AoE) que batem mais forte dependendo da Vida Máxima dela ou do Espírito.

### 🐺 Caçadora (Melee Físico / Pet Master)
- **Foco:** Sinergia total com Pets e Dano Sustentado.
- **Mecânica Moderna:** Antes focava em 1 pet. Agora, as habilidades físicas da Caçadora aplicam "Marca de Caça". Qualquer Pet (dela ou do grupo) que bater num alvo marcado recebe roubo de vida ou dano extra. Para dano AoE (solo), ela comanda um "Ataque em Matilha" (O pet dela causa dano AoE junto com ela).

### 🛡️ Soldado (Melee Físico / Tank)
- **Foco:** Defesa Extrema, Taunt, Contra-ataque.
- **Mecânica Moderna:** Para jogar solo, o Soldado precisa de dano. O Dano de suas habilidades físicas escala não só com Força, mas também com sua **Defesa Física máxima** ou **Vitalidade**. O Provocar (Taunt) obriga os inimigos a baterem nele, acionando passivas absurdas de "Contra-Ataque" (sua melhor fonte de dano).

---

## 6. Evolução e Atributos Iniciais

Para manter o sentimento clássico de progressão (como Ragnarok, Dofus, e o próprio Magic Campus original), cada vez que o jogador sobe de nível, ele recebe **5 Pontos de Atributo Livres** para focar sua *Build* da maneira que quiser.

### Base de Atributos (Nível 1)
No nível 1, todos os personagens partem com uma base total de **26 Pontos** pré-distribuídos, definindo sua vocação natural:

| Classe | VIT (Vida) | FOR (Físico) | INT (Mágico) | ESP (Def/Cura) | AGI (Speed) | MEN (Acerto) | Foco Principal Inicial |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Lutador** | 5 | **8** | 2 | 2 | 5 | 4 | Bater duro e rápido. |
| **Atirador** | 3 | 2 | **8** | 3 | 5 | 5 | Dano mágico bruto e acerto. |
| **Música** | 4 | 2 | 6 | 5 | 5 | 4 | CC rápido antes do inimigo agir. |
| **Médica** | 5 | 2 | 4 | **8** | 3 | 4 | Sobrevivência e cura massiva. |
| **Caçadora** | 4 | 6 | 2 | 4 | **6** | 4 | Rápida e equilibrada. |
| **Soldado** | **8** | 5 | 2 | 4 | 2 | 5 | Uma parede de resistência. |

*Dica de Design:* Permitir que o jogador construa classes fora da caixa (ex: "Médico de Agilidade" para curar primeiro, ou "Lutador de Vitalidade" focado em contra-ataque).

---

## 7. Balanceamento e Dinamismo PvE (Monstros)

Se o *Pantanal das Nuvens* exige Nível 10, o maior desafio é evitar que o jogador sinta que está matando "o mesmo monstro" centenas de vezes sem pensar.
Para criar batalhas únicas e exigir planejamento sem tornar os monstros "esponjas de HP":

### A. Packs Sinérgicos (Em vez de Hordas Clones)
Em vez de lutar contra 3 monstros iguais (ex: 3x Lobo do Pântano), o jogo gera **Composições**.
- Exemplo: Você é atacado por 2 Lobos (Atacantes Rápidos) e 1 Sapo Xamã (Curandeiro). 
- **O desafio:** Se você focar nos Lobos, o Sapo cura eles. O jogo força o jogador (mesmo solo, focado em AoE) a pensar *"Preciso matar o Sapo primeiro!"*

### B. Tiers de Raridade e Escalamento
Cada monstro que nasce em um combate tem sua raridade sorteada independentemente. Isso garante que cada luta tenha alvos prioritários de dificuldade variada:

1. **Jovem (5% de chance):** Um monstro que sempre nasce no **Nível 1**, ignorando o nível do mapa. É muito fraco, morre rápido, excelente para capturar como pet base (já que pets nível 1 ganham bônus ao treinar).
2. **Normal (70% de chance):** O inimigo padrão. Seus status escalam perfeitamente para acompanhar o nível do mapa em que ele spawnou.
3. **Elite (20% de chance):** Bem mais forte, letal e resistente que o normal. Concede XP extra, dropa mais recursos e frequentemente possui mutações (ex: "Encouraçado" recebendo menos dano físico).
4. **Boss (5% de chance):** Uma ameaça letal. **Limite de 1 por encontro**. É gigante, quebra regras da classe dele, mas concede os melhores prêmios ao ser derrotado.

### C. Fraquezas Elementais Dinâmicas
Se você for lutar contra inimigos do Pantanal, eles podem ter afinidades naturais (ex: Fracos contra Dano Fogo/Raio, Fortes contra Veneno). O jogador solo usará o Pet correto (um Pet de Fogo) para farmar mais rápido neste mapa, valorizando a coleção de mascotes.

---

## 8. Arquitetura de Mapas e Encontros (Biomas)

Para tornar a geração de inimigos altamente modular e escalável, o sistema de encontros é guiado por **Tipos de Mapa** e **Biomas**, em vez de fixar monstros em locais específicos hardcoded.

### Classificação dos Mapas
1. **Cidades (Zonas Seguras):**
   - *Exemplo:* Vila Izumo.
   - *Regra:* Não gera encontros com inimigos. É para comércio, NPCs e missões.
2. **Dungeons (Instâncias Especiais):**
   - *Regra:* Mapas especiais gerados para missões específicas. Os encontros aqui são controlados e roteirizados (chefões, monstros de quest), oferecendo desafios únicos. (Será expandido no futuro).
3. **Campos (Zonas de Caça):**
   - *Exemplo:* Pantanal das Nuvens, Espaço Zen, Subúrbio Leste.
   - *Regra:* A maior parte do mundo do jogo. Gera encontros aleatórios/visíveis baseados na movimentação do jogador (ou timer).

### Spawns baseados em Biomas e Escalonamento Modular
Em mapas do tipo **Campo**, os monstros não pertencem ao mapa em si, mas ao **Bioma** do mapa (Ex: Montanha, Pântano, Floresta, Deserto).

- **Modularidade:** Uma "Galinha Selvagem" é configurada para nascer no bioma *Planície*. Qualquer mapa futuro que for classificado como *Planície* poderá spawnar essa Galinha.
- **Escalonamento por Nível do Mapa:** Os monstros possuem **Status Base (Nível 1)**. Quando um encontro é gerado, o jogo lê o **Nível do Mapa** atual e escala os atributos do monstro. 
  - *Exemplo:* A Galinha que o jogador viu no *Subúrbio Leste* (Nível 10) era fraca. Se o jogador for para os *Campos Elíseos* (Nível 80), que também possui o bioma *Planície*, ele pode encontrar a mesma Galinha, mas os status dela serão multiplicados pela fórmula de escala do Nível 80, tornando-a uma ameaça digna do endgame.

Isso garante reaproveitamento inteligente de recursos (modelos 3D e animações) e cria um mundo coeso onde a fauna faz sentido com a geografia local, crescendo em dificuldade junto com o progresso geográfico do jogador!

---

## 9. Sistema de Captura e Pets

O coração do colecionismo no jogo é o sistema de captura de mascotes (Pets), que oferece profundidade através de *Tiers* de espécie e *Qualidade* individual.

### 9.1 Chances de Captura e Pós-Captura
A taxa de sucesso da captura de um monstro durante o combate depende da sua **Raridade (Tier de Encontro)** e da diferença de nível entre o jogador e o monstro:

- **Jovens (Nível 1):** Taxa base de 90%. São os ideais para treinamento desde a base.
- **Normais:** Taxa base média, escalando dependendo da diferença de Nível (se o jogador for nível muito mais alto, a chance aumenta).
- **Elites:** Taxa de captura baixa. Muito difíceis, exigindo persistência ou itens melhores.
- **Bosses:** Taxa quase nula (Extremamente difíceis de capturar).
  
**O Pet pós-captura:** Ao ser domado, o monstro perde qualquer bônus temporário ou inflado que tinha no encontro (por exemplo, os atributos surreais de Boss ou Elite). Ele entra para sua mochila mantendo apenas o seu Nível atual e os atributos Base. **O Pet vem sem habilidades ativas**, exigindo que o jogador ensine ou desbloqueie skills para ele através de treinamento e itens.

### 9.2 Tiers de Espécie (O Spawn do Mundo)
Ao gerar o mundo, o jogo sorteia não apenas qual monstro nasce, mas a "Nobreza" (Tier) daquela espécie. Isso dita o teto de crescimento base dele:

| Tier da Espécie | Chance de Spawn | Descrição |
| :---: | :---: | :--- |
| **C** | 40% | Os monstros mais básicos da região. |
| **B** | 30% | Espécies um pouco mais imponentes. |
| **A** | 15% | Espécies raras e fortes. |
| **S** | 10% | Espécies superiores. |
| **SS** | 5% | Lendas ou Reis biológicos de seus biomas. |

### 9.3 Qualidade Individual (A Sorte na Captura)
Saber o *Tier* da espécie não é tudo. Quando a captura é bem-sucedida, os "IVs" (Valores Individuais) daquele monstro específico são sorteados, definindo sua **Qualidade**. Isso atua como um multiplicador poderoso sobre os seus status base.

| Qualidade do Pet | Chance ao Capturar |
| :---: | :---: |
| **Comum** | 50% |
| **Incomum** | 25% |
| **Raro** | 20% |
| **Épico** | 4% |
| **Lendário** | 1% |

### 9.4 A Escada de Equivalência (Balanceamento de Poder)
Para que o jogo não se resuma a "Capture um SS e jogue o resto fora", as qualidades sobrepõem os Tiers de espécie, estimulando o jogador a usar e investir em Pets de tier menor se tiverem sorte na captura. A regra matemática de equivalência de força segue a linha:

- **Tier C Épico** equivale a um **Tier B Incomum**
- **Tier C Lendário** equivale a um **Tier B Raro**
- **Tier B Lendário** equivale a um **Tier A Raro**

Isso significa que um jogador que se apegou a uma Galinha (Tier C) pode transformá-la numa arma letal caso ela nasça com qualidade *Épica* ou *Lendária*, rivalizando facilmente com monstros naturalmente mais fortes (Tiers A ou S comuns). Isso garante diversidade e recompensa o esforço/sorte do jogador!

---

## 10. Arquitetura de Habilidades e Status (Buffs/Debuffs)

As habilidades (tanto de Jogadores quanto de Pets) funcionarão de forma estritamente **modular**. O servidor interpretará os efeitos de forma dinâmica e reutilizável.

### 10.1 Tipos de Habilidade
O arsenal de qualquer entidade no combate se divide em duas categorias:
- **Passivas:** Sempre ativas em combate. Não gastam turno e não precisam ser selecionadas. (Ex: "Sempre que receber dano mágico, ganha 5% de Velocidade").
- **Ativas:** Requerem a decisão do jogador durante o turno e são submetidas a Tempos de Recarga (Cooldowns).

### 10.2 Tipos de Efeito das Habilidades
A execução de uma habilidade Ativa pode desencadear dois comportamentos:
1. **Efeitos Imediatos:** Dano instantâneo, curas diretas, ou purificação na mesma rodada.
2. **Efeitos por Turno (Status):** Condições prolongadas (Buffs ou Debuffs) que se estendem ao longo da linha do tempo da batalha.

### 10.3 Dicionário de Efeitos por Turno
Para padronizar a programação das habilidades, os Status base do jogo são:

| Status (Efeito) | Mecânica e Comportamento |
| :--- | :--- |
| **Dano por Turno (DoT)** | Causa um valor matemático de dano (Físico, Mágico, Veneno, Sangramento) no início do turno do afligido. |
| **Paralisia** | Controle de Grupo pesado (Hard CC). O alvo pula o turno automaticamente, totalmente impedido de agir. |
| **Sonolência** | Controle de Grupo frágil. O alvo é impedido de agir. Contudo, **se receber qualquer dano direto, ele acorda** instantaneamente e recupera o turno. |
| **Confusão** | Controle de Grupo caótico. Substitui a vontade do alvo rolando um dado de 4 lados (25% cada):<br>1. Respeita a ordem escolhida pelo jogador.<br>2. Causa um Ataque Básico em **si mesmo** (com 50% de redução no dano).<br>3. Causa um Ataque Básico num **Aliado** aleatório.<br>4. Causa um Ataque Básico num **Inimigo** aleatório. |
| **Buffs/Debuffs de Status** | Altera temporariamente a matemática dos *Atributos de Combate*. Ex: Aumenta a Defesa Física em 30% por 2 turnos, ou reduz a Precisão. |
| **Amplificação / Redução de Dano Final** | Modificador especial. Não altera status, atua diretamente no fim da cadeia matemática. Ex: Uma barreira que "*Reduz em 40% o Dano Final Sofrido*", aplicada após toda a conta de defesa normal. |

Essa arquitetura de status permitirá que, por exemplo, o ataque básico de um Pet de Água possa ter 10% de chance de aplicar *Sonolência*, ou a classe de Música abuse de *Confusão* e *Paralisia* sem precisarmos reescrever código pra cada habilidade!

---

## 11. Formação e Posições (O Grid 10x10)

O combate ocorre em duas metades do campo, suportando batalhas enormes de até **10 contra 10** entidades (jogadores, pets e monstros). Cada lado possui uma **Linha de Trás (L1)** e uma **Linha de Frente (L2)**, com 5 espaços cada. Cada jogador humano pode levar no máximo **1 Pet** simultâneo para o campo.

### Regras de Alcance (Range)
As posições na matemática de ataque seguem o fluxo: `L1 (Trás) -> L2 (Frente) || L3 (Frente Inimiga) -> L4 (Trás Inimiga)`.

- **Atacantes de Alcance (Ranged):** Alcance Global. Atiradores, Músicos e Médicos ignoram a formação e podem focar suas habilidades ou ataques básicos em qualquer espaço do mapa inimigo (L3 ou L4).
- **Atacantes Corpo-a-Corpo (Melee):** Possuem Alcance igual a **2**. A matemática define quem eles podem bater:
  - Se um Melee estiver na **L1 (Sua Linha de Trás)**, seu alcance de +2 só chega na **L3 (Linha de Frente Inimiga)**. Ele não alcança a L4 inimiga, a não ser que a L3 esteja morta/vazia (nesse caso, o alcance "atravessa").
  - Se um Melee estiver na **L2 (Sua Linha de Frente)**, seu alcance de +2 chega direto na **L4 (Linha de Trás Inimiga)**, permitindo focar suportes e magos inimigos.

---

## 12. Linha do Tempo (ATB e Velocidade)

O sistema de turnos não será fixo em rodadas estáticas. Usaremos o **Sistema ATB (Active Time Battle)**.
- Cada entidade possui uma "barra invisível" que enche de 0 a 1000 baseada na sua Velocidade. Quando chega em 1000, é o turno dela.
- **Dinamismo e Aleatoriedade:** Para evitar que dois personagens com a mesma velocidade tenham a ordem engessada pra sempre, o sistema aplicará uma rolagem de variação de +/- 5% na barra a cada turno (fator de sorte na iniciativa).
- **Múltiplos Turnos:** Para que um personagem consiga jogar **duas vezes** antes do inimigo sequer agir uma, ele precisará ter um abismo de diferença (ex: o dobro exato de velocidade do inimigo).

---

## 13. Inteligência Artificial e Mecânica de Proteção (Taunt)

### IA Básica (Monstros Iniciais)
A inteligência dos monstros comuns é rudimentar. Eles escolherão aleatoriamente quem atacar e qual habilidade usar no turno deles. Chefões futuros poderão ter IA focada (bater no alvo mais fraco, ou no suporte).

### A Mecânica de Interceptação (Taunt/Cobertura)
A classe Soldado (ou Pets Protetores) não usa uma habilidade de gritar e ofender inimigos para chamar atenção. O "Provocar/Proteger" é uma Habilidade Ativa usada num **Aliado**.
- O Soldado aplica o *Buff de Cobertura* num atirador frágil. 
- Durante *X* turnos, se qualquer monstro atirar, bater ou soltar magia de alvo único contra aquele atirador, o Soldado **intercepta fisicamente o golpe**, sofrendo o dano no lugar do aliado.

---

## 14. Regras de Fuga (Correr da Luta)

Qualquer entidade do grupo pode tentar a Fuga.
- **Custo:** Tentar fugir **consome o turno (ação)** de quem tentou.
- **Cálculo (Chance de Sucesso):** Será baseado na média de Velocidade do grupo contra a Velocidade do inimigo. 
  - *Fórmula sugerida:* `50% base + (Sua Velocidade - Velocidade do Inimigo)`. Fugas contra inimigos muito lentos são quase garantidas. Fugas contra inimigos absurdamente rápidos dependerão de sorte (com um piso mínimo de 15% de chance).

---

## 15. Sistema Elemental Dinâmico (Itens Consumíveis)

Para não ingessar os jogadores em uma build presa por elementos, usaremos um sistema de "Armamento Mágico Consumível". É uma camada estratégica tática brilhante estilo jogo de xadrez:

### Os Elementos Básicos (Pedra-Papel-Tesoura)
- **Água** vence **Fogo**
- **Fogo** vence **Vento**
- **Vento** vence **Terra**
- **Terra** vence **Água**

### O Farm de Elementos
Ao matar monstros na exploração, dependendo do elemento do monstro, ele pode dropar consumíveis (Gota Mágica, Brasa Mágica, Sopro Mágico, Poeira Mágica).

### Em Combate (O Xadrez)
- No seu turno (custo de ação livre, sem gastar turno), o jogador pode consumir um item no seu inventário para "Imbuir" a si mesmo ou seu pet com aquele elemento até o fim daquele turno/combate.
- **A Vantagem:** Atacar com o elemento correto (ex: Fogo contra Vento) aplica um modificador na matemática final: O atacante **causa +20% de Dano Final** e **sofre -20% de Dano Final** se aquele inimigo de vento revidar.
- **A Punição Neutra:** Se um jogador ou Pet não possuir elemento (Neutro), não mitiga nada. Qualquer entidade Neutra recebe **+15% de Dano Final extra** de fontes de dano elementais. Ou seja, ser um humano sem preparo num mundo mágico dói. Colete consumíveis mágicos para sobreviver!
