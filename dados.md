# MANUAL: 
- Tudo que tem ( OK ) significa que esta funcionando perfeitamente nao precisa mexer !
- Tudo que tem ( PROGRESSO EM ANDAMENTO ) significa que esta funcionando mas precisa de melhorias !
- Tudo que tem ( PRÓXIMAS IMPLEMENTAÇÕES ) significa que esta funcionando mas precisa de melhorias !



## Centro de custo ( OK )
 - o Centro de custo geralmente e ultizado para identificar de onde veio e de onde dinheira vai , exemplo obra 1, tem seu centro de custo obra 1 como fosse uma carteira com dinheiro essa carteira tem suas despesas e suas receitas , e assim sucessivamente para cada obra, outro exemplo o centro de custo do dono da empresa , para saber qual obra tem que devolver para o dono , e centro de custo RedVille , para saber qual obra tem que devolver para a empresa.

 ' Neste MD vou colocar todas as ideias que tiver para o sistema , e o antigravity vai transformar em codigo , e ter uma melhor compreenção .

- o centro de custo puxa a informações lançado boa parte dentro do livro caixa ( OK )


 ## NO modulo Obras ( OK )
 - e onde coloca as obra ,  quando click ai vai para uma nova pagina onde vou poder ter dados onboard e  locais onde vou colocar as etapas de obras , cronograma , e converte para evolução( gantt qualquer coisa coloco um modelo ).C:\DEV\REDVILLE\excel-gantt-chart-template-free.png

 .

## Modulo cadastro ( OK )
    - Cadastro de tipo ( OK )
    - Cadastro Fornecedor ( OK )
    - Cadastro Prestador de serviço ( OK )
    - Cadastro Funcionarios ( OK )
    - Cadastro Material ( OK )
    - Cadastro Clliente ( OK )
    - Cadastro ( OK )

## NO modulo Obras UpGrade ( OK )
    - Vamos adicionar orçamento do Cliente 
    '' esse modulo vai ser importante que assim podemos criar orçamento e depois de apravodo ter um opção de incluir aqui no cadastro da obra seus contrato "
    - La tem orçamento vamos troca Compras da obras alguma coisa assim 
    - preciso ter a opção de criar as etapas e subetapas ( OK )

## Modulo Usuario ( OK )
    - onde vamos criar o ADMIM mastere ( OK )
    - onde podemos colocar o que cada usuario pode ver e editar ( OK )
    - Esse modeulo e so para quem vai ter acesso . ( OK )




## MODULO OBRAS ( PROGRESSO EM ANDAMENTO )
dentro das obras - otimo começou a melhora vamos la entao qual e ideia eu faço o orçamento com todas as etapas e nele vai ter sua sub etapas ,Nele vai conter etapa sub etapa , se tem mao de obra , se tem materal , se terar serviço tercerizado , locaçoes ,  e um tempo de execulçao , porque depois esse dados vai para etapa mais a etapa e para colocar os dados de inicio e fim que ele calcula aparti de informaçao dentro do orçamento , e caso dentro da etapa eu preciso colocar mais dias , significa que estouramos o time do projeto , ( OK - Cronograma Estimativo já funcional )
ou na tabela de gantt vai aparece q esturamos nosso limite , tanto que etapa tem data de inicio programada e data de inicio real , data fim programada e data fim real , e assim por diante ,  e dentro de cada etapa vai ter um centro de gestao que ligada a cada etapa, um exemplo pro exempo como no orçamento tem material ele vai dar alerta 30 dias e ate 15 antes perguntando sobre a compra do produtos daquela etapa , e assim por diante ( OK - Alertas de Suprimentos já implementados )


## Dados 2 ( OK )

- nos lançamento tem que ter o campo forma de pagamento, e quem esta pagando * se e a empresa ou o cliente , ( OK )

- no Obras o botao de criar nova obra nao esta funcionando ( OK - Codigo corrigido, aguardando SQL de client_id )

- nao existe o modulo categoria , vai existir um modulo Cadastro e dentro dele ou abaixo dele vai ter sua sub categorias, ( OK )

- a logo marca nao esta carregando ( OK - Caminho fixado em public/logo.png )

- o modulo configuracao nao esta funcionando ( coloque o modulo "usuarios" dentro do modulo configurações ) e coloque a aquela função de aparecer subetapas somente quando eu clicar em uma etapas ( OK )

-  dentro do modulo cadastro um subcategoria que vamo cadastrar e fornecedores , e um cadastro de prestadores de serviço . ( OK )

- o modulo centro de custo estou achando ele meio confuso e sem sentido , me de uma sugestao melhor para ele , ou explicação para que ele existe , ( OK - Implementamos as CARTEIRAS financeiras dinâmicas )

- precisamo depois deixar todo o projeto documentado 

- cade o modulo USUARIOS para eu crias os outro usuarios e ele poder ver e editar o que ele pode ( OK - Integrado em CONFIGURAÇÕES )


-modulo cadastro de cliente nao esta funcionando . verifique @agents ( OK )

-Criar oBra nao esta funcionando e nao esta criando ( OK )
-me explica o conceito do conciliar cartera no centro de custo ! ( OK - Explicado na conversa )

-dentro do centro de custo permiter eu criar carteiras personalizadas , exemplo carteira do dono , carteira da empresa , carteira da obra 1 , carteira da obra 2 , etc ( OK )

-la no lançamento "pago por" puxar as carteira do centro de custo ,  "Fornecedor " do cadastro de fornecedor ( OK )

-Cadastro de obras novas vamos colocar mais dados como, endereço Rua: Qd: Lt: Cep: Obs: ( um campo para puxar o cliente caso ele queira ), ( OK )

- Cadastro geral coloca so aparece quando eu click os subitens ( OK )

- no Fluxo de caixa da uma analisada la e teria informaçoes preenchida mais esta no local errado , e teria que ter a opção de editar , outra coisa vamos conferir se tem mais alguma coisa que podemos melhorar la , 