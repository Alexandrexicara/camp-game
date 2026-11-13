# Publicação do Animal Camp na Khelogy

O pacote é gerado pelo workflow **Build Khelogy HTML5 ZIP** no GitHub Actions. O ZIP contém o conteúdo de dist-khelogy, com index.html diretamente na raiz, e não inclui o projeto Next.js, credenciais ou arquivos de desenvolvimento.

## Quando a Khelogy fornecer o Game ID

1. Abra khelogy/index.html.
2. Substitua YOUR_GAME_ID pelo Game ID exato fornecido no painel.
3. Faça commit na branch main.
4. Baixe o artefato mais recente chamado animal-camp-khelogy.

## Anúncios

- A Khelogy informa que preroll e anúncios no contêiner são gerenciados pela plataforma.
- O botão voluntário de vídeo recompensado para ganhar uma vida extra usa KhelogySDK.showAd('rewarded').
- O SDK público consultado não documenta um método de interstitial forçado entre fases. Por isso, as chamadas de interstitial específicas do provedor anterior não são disparadas na exportação Khelogy.
- O SDK antigo de minigame permanece no site Netlify; a integração Khelogy é ativada somente quando o SDK Khelogy estiver presente.

## Teste antes do envio

Baixe o ZIP do workflow, confira se index.html está na raiz e teste o arquivo em um servidor HTTP local. A revisão e a aprovação final são feitas pela Khelogy.
