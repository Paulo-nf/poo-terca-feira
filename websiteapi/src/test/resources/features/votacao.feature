# language: pt
Funcionalidade: Votação no próximo evento
  Como usuário da Arena Pernambuco
  Quero votar no próximo evento
  Para ajudar a decidir qual evento irá acontecer

  Cenário: Usuário vota em um evento
    Dado que existe um evento chamado "Show do João Gomes"
    Quando eu voto nesse evento
    Então o evento deve ter 1 voto
