export const CHAT_LOCALE_CODES = [
  "en",
  "es",
  "fr",
  "pt",
  "zh",
  "de",
  "it",
  "ja",
  "ko",
  "ru",
  "ar",
  "hi",
  "tr",
  "nl",
  "pl",
] as const;

export type ChatLocale = (typeof CHAT_LOCALE_CODES)[number];

export const DEFAULT_CHAT_LOCALE: ChatLocale = "en";

export type ChatUiCopy = {
  language: string;
  greeting: string;
  placeholder: string;
  send: string;
  close: string;
  launcherOpen: string;
  launcherClose: string;
  typing: string;
  error: string;
  defaultReply: string;
  defaultFollowUp: string;
  faq: {
    swap: string;
    status: string;
    recover: string;
    wallet: string;
    names: string;
    rates: string;
    card: string;
    safety: string;
    support: string;
    about: string;
  };
};

export const CHAT_LOCALE_LABELS: Record<
  ChatLocale,
  { label: string; native: string }
> = {
  en: { label: "English", native: "English" },
  es: { label: "Spanish", native: "Español" },
  fr: { label: "French", native: "Français" },
  pt: { label: "Portuguese", native: "Português" },
  zh: { label: "Chinese", native: "中文" },
  de: { label: "German", native: "Deutsch" },
  it: { label: "Italian", native: "Italiano" },
  ja: { label: "Japanese", native: "日本語" },
  ko: { label: "Korean", native: "한국어" },
  ru: { label: "Russian", native: "Русский" },
  ar: { label: "Arabic", native: "العربية" },
  hi: { label: "Hindi", native: "हिन्दी" },
  tr: { label: "Turkish", native: "Türkçe" },
  nl: { label: "Dutch", native: "Nederlands" },
  pl: { label: "Polish", native: "Polski" },
};

const COPY: Record<ChatLocale, ChatUiCopy> = {
  en: {
    language: "Language",
    greeting:
      "Hey there — I'm Lumen, Rift's guide. I speak English by default; pick another language from the menu if you prefer. How can I help?",
    placeholder: "Ask Lumen anything about Rift…",
    send: "Send",
    close: "Close chat",
    launcherOpen: "Chat with Lumen",
    launcherClose: "Close chat with Lumen",
    typing: "Lumen is typing…",
    error: "Something went wrong. Try again in a moment.",
    defaultReply:
      "I'm Lumen, your Rift guide. I can help with swaps, deposit status, wallets, recovery links, rates, and Rift Card.",
    defaultFollowUp: "Tell me what you're trying to do and we'll figure it out together.",
    faq: {
      swap:
        "Pick your coins, paste your receive wallet, tap Open rift, confirm the last 6 characters of the address, then send crypto to the deposit address shown. Your rate locks once the deposit is detected.",
      status:
        "After you send, the page updates on its own: Awaiting → Confirming → Rift Completed. Tap Refresh if it feels stuck, or open your tracking link at rft.money/rift/…",
      recover:
        "Open My Rifts (/rift) or your private link (rft.money/rift/ID#token=…). The full link works anywhere. Without the token, recovery only works on the same browser where you opened the swap.",
      wallet:
        "You can connect MetaMask (EVM) or Phantom (Solana) just to fill the receive address. Rift never asks for a seed phrase and never signs transfers for you.",
      names:
        "Paste a name like name.eth, name.sol, or name.crypto in the settlement field. Rift resolves it for you — always double-check the address before confirming.",
      rates:
        "Swaps are variable-rate: the preview is an estimate, and the final rate locks when your deposit arrives. Stay within the min and max on the ticket.",
      card:
        "Rift Card is early access. Join the waitlist on /card — details may change before launch.",
      safety:
        "Rift is non-custodial: wallet to wallet, no accounts, no held balances. Verify every address. Blockchains are public, so Rift is not a privacy shield.",
      support:
        "Need a human? Use Telegram from the swap screen. Share your Rift ID and step — never share seed phrases or private keys.",
      about:
        "Rift (rft.money) lets you send on one chain and receive on another, straight to your wallet. No sign-up. More at /docs.",
    },
  },
  es: {
    language: "Idioma",
    greeting:
      "¡Hola! Soy Lumen. Estoy aquí para ayudarte con swaps, depósitos, wallets y todo lo de Rift. ¿En qué te ayudo?",
    placeholder: "Pregúntale a Lumen lo que quieras sobre Rift…",
    send: "Enviar",
    close: "Cerrar chat",
    launcherOpen: "Chat con Lumen",
    launcherClose: "Cerrar chat con Lumen",
    typing: "Lumen está escribiendo…",
    error: "Algo falló. Inténtalo de nuevo en un momento.",
    defaultReply:
      "Soy Lumen, tu guía en Rift. Puedo ayudarte con swaps, estado del depósito, wallets, links de recuperación, tasas y Rift Card.",
    defaultFollowUp: "Cuéntame qué quieres hacer y lo vemos juntos.",
    faq: {
      swap:
        "Elige monedas, pega tu wallet de recepción, pulsa Open rift, confirma los últimos 6 caracteres de la dirección y envía crypto a la dirección de depósito. La tasa se fija cuando se detecta el depósito.",
      status:
        "Tras enviar, la página se actualiza sola: Esperando → Confirmando → Procesando → Enviando → Completado. Usa Refresh si se queda quieto, o abre tu link rft.money/rift/…",
      recover:
        "Ve a My Rifts (/rift) o abre tu link privado (rft.money/rift/ID#token=…). Sin el token, la recuperación solo funciona en el mismo navegador donde abriste el swap.",
      wallet:
        "Puedes conectar MetaMask (EVM) o Phantom (Solana) solo para rellenar la dirección. Rift nunca pide seed phrase ni firma transferencias.",
      names:
        "Pega un nombre como name.eth, name.sol o name.crypto. Rift lo resuelve — verifica siempre la dirección antes de confirmar.",
      rates:
        "Los swaps son de tasa variable: la vista previa es estimada y la tasa final se fija al llegar el depósito. Respeta el mínimo y máximo del ticket.",
      card:
        "Rift Card es acceso anticipado. Únete a la waitlist en /card.",
      safety:
        "Rift es no custodial: de wallet a wallet, sin cuentas ni fondos retenidos. Verifica cada dirección. Las blockchains son públicas.",
      support:
        "¿Necesitas ayuda humana? Usa Telegram desde la pantalla del swap. Comparte tu Rift ID — nunca tu seed phrase.",
      about:
        "Rift (rft.money) te deja enviar en una red y recibir en otra, directo a tu wallet. Sin registro. Más en /docs.",
    },
  },
  fr: {
    language: "Langue",
    greeting:
      "Bonjour — je suis Lumen. Je peux vous guider pour les swaps, dépôts, portefeuilles et tout sur Rift. Comment puis-je aider ?",
    placeholder: "Demandez à Lumen tout sur Rift…",
    send: "Envoyer",
    close: "Fermer le chat",
    launcherOpen: "Discuter avec Lumen",
    launcherClose: "Fermer le chat avec Lumen",
    typing: "Lumen écrit…",
    error: "Un problème est survenu. Réessayez dans un instant.",
    defaultReply:
      "Je suis Lumen, votre guide Rift. Swaps, statut de dépôt, portefeuilles, liens de récupération, taux et Rift Card — je suis là.",
    defaultFollowUp: "Dites-moi ce que vous voulez faire, on avance ensemble.",
    faq: {
      swap:
        "Choisissez les coins, collez l'adresse de réception, appuyez sur Open rift, confirmez les 6 derniers caractères, puis envoyez à l'adresse de dépôt. Le taux se verrouille à la détection.",
      status:
        "Après l'envoi, la page se met à jour : En attente → Confirmation → Traitement → Envoi → Terminé. Actualisez si besoin, ou ouvrez votre lien rft.money/rift/…",
      recover:
        "Allez sur My Rifts (/rift) ou ouvrez votre lien privé. Sans le token, la récupération ne marche que sur le même navigateur.",
      wallet:
        "Connectez MetaMask (EVM) ou Phantom (Solana) uniquement pour remplir l'adresse. Rift ne demande jamais votre seed phrase.",
      names:
        "Collez un nom comme name.eth ou name.sol. Vérifiez toujours l'adresse résolue avant de confirmer.",
      rates:
        "Taux variable : l'aperçu est une estimation, le taux final se verrouille à l'arrivée du dépôt. Respectez le min et max.",
      card: "Rift Card est en accès anticipé. Waitlist sur /card.",
      safety:
        "Rift est non custodial : portefeuille à portefeuille. Vérifiez chaque adresse. La blockchain est publique.",
      support:
        "Besoin d'un humain ? Telegram depuis l'écran de swap. Partagez votre Rift ID — jamais votre seed.",
      about:
        "Rift (rft.money) : envoyez sur une chaîne, recevez sur une autre. Sans compte. Voir /docs.",
    },
  },
  pt: {
    language: "Idioma",
    greeting:
      "Olá — sou a Lumen. Posso ajudar com swaps, depósitos, carteiras e tudo no Rift. Em que posso ajudar?",
    placeholder: "Pergunte à Lumen sobre o Rift…",
    send: "Enviar",
    close: "Fechar chat",
    launcherOpen: "Chat com Lumen",
    launcherClose: "Fechar chat com Lumen",
    typing: "Lumen está digitando…",
    error: "Algo deu errado. Tente de novo em instantes.",
    defaultReply:
      "Sou a Lumen, sua guia no Rift. Swaps, status do depósito, carteiras, links de recuperação, taxas e Rift Card.",
    defaultFollowUp: "Me diga o que você quer fazer e resolvemos juntos.",
    faq: {
      swap:
        "Escolha as moedas, cole a carteira de recebimento, toque Open rift, confirme os últimos 6 caracteres e envie para o endereço de depósito. A taxa trava quando o depósito é detectado.",
      status:
        "Depois de enviar, a página atualiza sozinha: Aguardando → Confirmando → Processando → Enviando → Concluído. Use Refresh se travar.",
      recover:
        "Abra My Rifts (/rift) ou seu link privado. Sem o token, a recuperação só funciona no mesmo navegador.",
      wallet:
        "Conecte MetaMask (EVM) ou Phantom (Solana) só para preencher o endereço. Rift nunca pede seed phrase.",
      names:
        "Cole um nome como name.eth ou name.sol. Sempre verifique o endereço resolvido.",
      rates:
        "Swaps com taxa variável: a prévia é estimativa; a taxa final trava na chegada do depósito.",
      card: "Rift Card é acesso antecipado. Waitlist em /card.",
      safety:
        "Rift é não custodial: carteira a carteira. Verifique endereços. Blockchains são públicas.",
      support:
        "Precisa de um humano? Telegram na tela do swap. Compartilhe seu Rift ID — nunca a seed.",
      about:
        "Rift (rft.money): envie em uma rede, receba em outra. Sem cadastro. Veja /docs.",
    },
  },
  zh: {
    language: "语言",
    greeting:
      "你好，我是 Lumen。我可以帮你了解 Rift 上的兑换、充值、钱包等问题。需要什么帮助？",
    placeholder: "向 Lumen 提问关于 Rift…",
    send: "发送",
    close: "关闭聊天",
    launcherOpen: "与 Lumen 聊天",
    launcherClose: "关闭与 Lumen 的聊天",
    typing: "Lumen 正在输入…",
    error: "出了点问题，请稍后再试。",
    defaultReply:
      "我是 Lumen，你的 Rift 向导。可协助兑换、充值状态、钱包、恢复链接、费率和 Rift Card。",
    defaultFollowUp: "告诉我你想做什么，我们一起解决。",
    faq: {
      swap:
        "选择币种，粘贴收款地址，点击 Open rift，确认地址最后 6 位，然后向充值地址发送加密货币。检测到充值后汇率锁定。",
      status:
        "发送后页面会自动更新：等待充值 → 确认中 → 处理中 → 发送中 → 完成。若卡住请刷新，或打开 rft.money/rift/… 跟踪链接。",
      recover:
        "打开 My Rifts (/rift) 或私人链接。没有 token 时，仅可在原浏览器恢复。",
      wallet:
        "可连接 MetaMask（EVM）或 Phantom（Solana）仅用于填写地址。Rift 从不索要助记词。",
      names:
        "可粘贴 name.eth、name.sol 等名称。确认前请仔细核对解析后的地址。",
      rates:
        "可变汇率：预览为估算，最终汇率在充值到达时锁定。请在最小和最大金额范围内发送。",
      card: "Rift Card 为早期访问，可在 /card 加入候补名单。",
      safety:
        "Rift 为非托管：钱包到钱包。请核实每个地址。区块链是公开的。",
      support:
        "需要人工帮助？在兑换页面使用 Telegram。分享 Rift ID，切勿分享助记词。",
      about:
        "Rift (rft.money) 让你跨链发送并直接收到钱包。无需注册。详见 /docs。",
    },
  },
  de: {
    language: "Sprache",
    greeting:
      "Hallo — ich bin Lumen. Ich helfe dir gern bei Swaps, Einzahlungen, Wallets und allem auf Rift. Wobei darf ich helfen?",
    placeholder: "Frag Lumen etwas über Rift…",
    send: "Senden",
    close: "Chat schließen",
    launcherOpen: "Mit Lumen chatten",
    launcherClose: "Chat mit Lumen schließen",
    typing: "Lumen schreibt…",
    error: "Etwas ist schiefgelaufen. Bitte kurz warten und erneut versuchen.",
    defaultReply:
      "Ich bin Lumen, dein Rift-Guide. Swaps, Einzahlungsstatus, Wallets, Recovery-Links, Kurse und Rift Card.",
    defaultFollowUp: "Sag mir, was du vorhast — dann finden wir einen Weg.",
    faq: {
      swap:
        "Coins wählen, Empfangs-Wallet einfügen, Open rift tippen, letzte 6 Zeichen bestätigen, dann an die Einzahlungsadresse senden. Kurs lockt bei Erkennung der Einzahlung.",
      status:
        "Nach dem Senden aktualisiert sich die Seite: Warten → Bestätigen → Verarbeiten → Senden → Fertig. Refresh nutzen, wenn es hängt.",
      recover:
        "My Rifts (/rift) oder privaten Link öffnen. Ohne Token nur im gleichen Browser recoverbar.",
      wallet:
        "MetaMask (EVM) oder Phantom (Solana) nur zum Ausfüllen der Adresse. Rift fragt nie nach Seed Phrase.",
      names:
        "Namen wie name.eth oder name.sol einfügen. Adresse vor Bestätigung prüfen.",
      rates:
        "Variabler Kurs: Vorschau ist Schätzung, finaler Kurs bei Einzahlung. Min/Max beachten.",
      card: "Rift Card ist Early Access. Warteliste unter /card.",
      safety:
        "Rift ist non-custodial: Wallet zu Wallet. Adressen prüfen. Blockchains sind öffentlich.",
      support:
        "Menschliche Hilfe? Telegram im Swap-Screen. Rift ID teilen — nie Seed Phrase.",
      about:
        "Rift (rft.money): senden auf einer Chain, empfangen auf einer anderen. Kein Konto. /docs",
    },
  },
  it: {
    language: "Lingua",
    greeting:
      "Ciao — sono Lumen. Ti aiuto volentieri con swap, depositi, wallet e tutto su Rift. Di cosa hai bisogno?",
    placeholder: "Chiedi a Lumen di Rift…",
    send: "Invia",
    close: "Chiudi chat",
    launcherOpen: "Chat con Lumen",
    launcherClose: "Chiudi chat con Lumen",
    typing: "Lumen sta scrivendo…",
    error: "Qualcosa non ha funzionato. Riprova tra poco.",
    defaultReply:
      "Sono Lumen, la tua guida Rift. Swap, stato deposito, wallet, link di recupero, tassi e Rift Card.",
    defaultFollowUp: "Dimmi cosa vuoi fare e lo risolviamo insieme.",
    faq: {
      swap:
        "Scegli le coin, incolla il wallet di destinazione, premi Open rift, conferma gli ultimi 6 caratteri e invia all'indirizzo di deposito.",
      status:
        "Dopo l'invio la pagina si aggiorna: In attesa → Conferma → Elaborazione → Invio → Completato.",
      recover: "Apri My Rifts (/rift) o il link privato. Senza token, solo stesso browser.",
      wallet: "MetaMask (EVM) o Phantom (Solana) solo per compilare l'indirizzo. Mai seed phrase.",
      names: "Incolla name.eth, name.sol, ecc. Verifica sempre l'indirizzo risolto.",
      rates: "Tasso variabile: anteprima stimata, tasso finale al deposito. Rispetta min/max.",
      card: "Rift Card in early access. Waitlist su /card.",
      safety: "Rift è non custodial. Verifica ogni indirizzo.",
      support: "Serve un umano? Telegram dalla schermata swap.",
      about: "Rift (rft.money): invii su una chain, ricevi su un'altra. Senza account.",
    },
  },
  ja: {
    language: "言語",
    greeting:
      "こんにちは、Lumen です。スワップ、入金、ウォレットなど Rift について何でも聞いてください。",
    placeholder: "Rift について Lumen に質問…",
    send: "送信",
    close: "チャットを閉じる",
    launcherOpen: "Lumen とチャット",
    launcherClose: "チャットを閉じる",
    typing: "Lumen が入力中…",
    error: "問題が発生しました。少し待って再試行してください。",
    defaultReply:
      "Lumen です。スワップ、入金状況、ウォレット、復旧リンク、レート、Rift Card をサポートします。",
    defaultFollowUp: "やりたいことを教えてください。一緒に進めましょう。",
    faq: {
      swap:
        "コインを選び、受取アドレスを貼り、Open rift を押し、末尾6文字を確認してから入金アドレスへ送金してください。",
      status:
        "送信後、ページは自動更新されます：待機 → 確認中 → 処理中 → 送金中 → 完了。",
      recover: "My Rifts (/rift) またはプライベートリンクを開いてください。",
      wallet: "MetaMask（EVM）または Phantom（Solana）でアドレス入力のみ。シードは不要です。",
      names: "name.eth などを貼れます。確認前にアドレスを必ず確認してください。",
      rates: "変動レート：プレビューは目安、入金到着時に確定。最小/最大内で送金。",
      card: "Rift Card は早期アクセス。/card でウェイトリスト。",
      safety: "Rift は非カストディアル。アドレスを必ず確認してください。",
      support: "人のサポートは Telegram から。Rift ID を共有（シードは絶対に不要）。",
      about: "Rift (rft.money) はチェーン間スワップ。アカウント不要。/docs",
    },
  },
  ko: {
    language: "언어",
    greeting:
      "안녕하세요, Lumen입니다. 스왑, 입금, 지갑 등 Rift 관련 질문을 도와드릴게요.",
    placeholder: "Rift에 대해 Lumen에게 질문…",
    send: "보내기",
    close: "채팅 닫기",
    launcherOpen: "Lumen과 채팅",
    launcherClose: "채팅 닫기",
    typing: "Lumen이 입력 중…",
    error: "문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    defaultReply:
      "Lumen입니다. 스왑, 입금 상태, 지갑, 복구 링크, 환율, Rift Card를 도와드려요.",
    defaultFollowUp: "무엇을 하려는지 알려주시면 함께 해결해요.",
    faq: {
      swap:
        "코인을 선택하고 수신 지갑을 붙여넣은 뒤 Open rift, 주소 마지막 6자리 확인 후 입금 주소로 보내세요.",
      status:
        "전송 후 페이지가 자동 업데이트됩니다: 대기 → 확인 중 → 처리 중 → 전송 중 → 완료.",
      recover: "My Rifts (/rift) 또는 개인 링크를 여세요.",
      wallet: "MetaMask(EVM) 또는 Phantom(Solana)으로 주소만 채웁니다. 시드 구문은 절대 요청하지 않습니다.",
      names: "name.eth 등을 붙여넣을 수 있습니다. 확인 전 주소를 꼭 검증하세요.",
      rates: "변동 환율: 미리보기는 추정치, 입금 도착 시 확정.",
      card: "Rift Card는 얼리 액세스. /card에서 대기열 등록.",
      safety: "Rift는 비수탁형입니다. 모든 주소를 확인하세요.",
      support: "사람 도움이 필요하면 Telegram을 이용하세요.",
      about: "Rift(rft.money): 체인 간 스왑. 계정 불필요. /docs",
    },
  },
  ru: {
    language: "Язык",
    greeting:
      "Привет — я Lumen. Помогу со свапами, депозитами, кошельками и всем на Rift. Чем помочь?",
    placeholder: "Спросите Lumen о Rift…",
    send: "Отправить",
    close: "Закрыть чат",
    launcherOpen: "Чат с Lumen",
    launcherClose: "Закрыть чат",
    typing: "Lumen печатает…",
    error: "Что-то пошло не так. Попробуйте снова.",
    defaultReply:
      "Я Lumen, ваш гид по Rift. Свапы, статус депозита, кошельки, ссылки восстановления.",
    defaultFollowUp: "Расскажите, что хотите сделать — разберёмся вместе.",
    faq: {
      swap:
        "Выберите монеты, вставьте адрес получения, нажмите Open rift, подтвердите последние 6 символов и отправьте на депозитный адрес.",
      status:
        "После отправки страница обновляется: Ожидание → Подтверждение → Обработка → Отправка → Готово.",
      recover: "Откройте My Rifts (/rift) или приватную ссылку.",
      wallet: "MetaMask (EVM) или Phantom (Solana) только для адреса. Seed не нужен.",
      names: "Можно вставить name.eth и т.д. Проверяйте адрес перед подтверждением.",
      rates: "Плавающий курс: превью — оценка, финал при депозите.",
      card: "Rift Card — ранний доступ. /card",
      safety: "Rift некustodial. Проверяйте адреса.",
      support: "Нужен человек? Telegram на экране свапа.",
      about: "Rift (rft.money) — кросс-чейн обмен без аккаунта.",
    },
  },
  ar: {
    language: "اللغة",
    greeting:
      "مرحبًا — أنا Lumen. يسعدني مساعدتك في المبادلات والإيداعات والمحافظ وكل ما يخص Rift.",
    placeholder: "اسأل Lumen عن Rift…",
    send: "إرسال",
    close: "إغلاق الدردشة",
    launcherOpen: "الدردشة مع Lumen",
    launcherClose: "إغلاق الدردشة",
    typing: "Lumen يكتب…",
    error: "حدث خطأ. حاول مرة أخرى.",
    defaultReply:
      "أنا Lumen، دليلك في Rift. المبادلات، حالة الإيداع، المحافظ، وروابط الاستعادة.",
    defaultFollowUp: "أخبرني ماذا تريد أن تفعل وسنساعدك.",
    faq: {
      swap:
        "اختر العملات، الصق محفظة الاستلام، اضغط Open rift، أكد آخر 6 أحرف، ثم أرسل إلى عنوان الإيداع.",
      status:
        "بعد الإرسال تتحدث الصفحة: انتظار → تأكيد → معالجة → إرسال → مكتمل.",
      recover: "افتح My Rifts (/rift) أو الرابط الخاص.",
      wallet: "MetaMask أو Phantom لملء العنوان فقط. لا seed phrase.",
      names: "الصق name.eth وغيرها. تحقق من العنوان دائمًا.",
      rates: "سعر متغير: المعاينة تقديرية ويُثبت عند وصول الإيداع.",
      card: "Rift Card وصول مبكر. /card",
      safety: "Rift غير حاضن. تحقق من كل عنوان.",
      support: "دعم بشري؟ Telegram من شاشة المبادلة.",
      about: "Rift (rft.money) — مبادلة عبر الشبكات بدون حساب.",
    },
  },
  hi: {
    language: "भाषा",
    greeting:
      "नमस्ते — मैं Lumen हूँ। Swaps, deposits, wallets और Rift से जुड़ी मदद के लिए यहाँ हूँ।",
    placeholder: "Rift के बारे में Lumen से पूछें…",
    send: "भेजें",
    close: "चैट बंद करें",
    launcherOpen: "Lumen से चैट",
    launcherClose: "चैट बंद करें",
    typing: "Lumen टाइप कर रहा है…",
    error: "कुछ गलत हुआ। थोड़ी देर बाद फिर कोशिश करें।",
    defaultReply:
      "मैं Lumen हूँ, आपका Rift गाइड। Swaps, deposit status, wallets, recovery links।",
    defaultFollowUp: "बताइए आप क्या करना चाहते हैं।",
    faq: {
      swap:
        "Coins चुनें, receive wallet पेस्ट करें, Open rift दबाएँ, पते के आखिरी 6 अक्षर confirm करें, deposit address पर भेजें।",
      status:
        "भेजने के बाद page update होती है: Waiting → Confirming → Processing → Completed।",
      recover: "My Rifts (/rift) या private link खोलें।",
      wallet: "MetaMask या Phantom सिर्फ address भरने के लिए।",
      names: "name.eth जैसे names paste करें। address verify करें।",
      rates: "Variable rate: preview estimate है, deposit पर lock।",
      card: "Rift Card early access — /card",
      safety: "Rift non-custodial है। addresses verify करें।",
      support: "Human help? Telegram use करें।",
      about: "Rift (rft.money) — cross-chain swap, no account।",
    },
  },
  tr: {
    language: "Dil",
    greeting:
      "Merhaba — ben Lumen. Takas, yatırma, cüzdanlar ve Rift hakkında yardımcı olurum.",
    placeholder: "Rift hakkında Lumen'e sor…",
    send: "Gönder",
    close: "Sohbeti kapat",
    launcherOpen: "Lumen ile sohbet",
    launcherClose: "Sohbeti kapat",
    typing: "Lumen yazıyor…",
    error: "Bir sorun oluştu. Biraz sonra tekrar deneyin.",
    defaultReply:
      "Ben Lumen, Rift rehberiniz. Takas, yatırma durumu, cüzdanlar, kurtarma linkleri.",
    defaultFollowUp: "Ne yapmak istediğinizi söyleyin, birlikte çözelim.",
    faq: {
      swap:
        "Coin seçin, alıcı cüzdanı yapıştırın, Open rift'e basın, son 6 karakteri onaylayın, yatırma adresine gönderin.",
      status:
        "Gönderdikten sonra sayfa güncellenir: Bekliyor → Onaylanıyor → İşleniyor → Gönderiliyor → Tamamlandı.",
      recover: "My Rifts (/rift) veya özel linki açın.",
      wallet: "MetaMask veya Phantom yalnızca adres doldurmak için.",
      names: "name.eth gibi isimler yapıştırın. Adresi doğrulayın.",
      rates: "Değişken kur: önizleme tahmin, yatırma gelince kilitlenir.",
      card: "Rift Card erken erişim — /card",
      safety: "Rift non-custodial. Adresleri doğrulayın.",
      support: "İnsan desteği? Swap ekranından Telegram.",
      about: "Rift (rft.money) — zincirler arası takas, hesap yok.",
    },
  },
  nl: {
    language: "Taal",
    greeting:
      "Hoi — ik ben Lumen. Ik help je graag met swaps, stortingen, wallets en alles op Rift.",
    placeholder: "Vraag Lumen iets over Rift…",
    send: "Verstuur",
    close: "Chat sluiten",
    launcherOpen: "Chat met Lumen",
    launcherClose: "Chat sluiten",
    typing: "Lumen typt…",
    error: "Er ging iets mis. Probeer het zo opnieuw.",
    defaultReply:
      "Ik ben Lumen, je Rift-gids. Swaps, stortingsstatus, wallets, herstellinks.",
    defaultFollowUp: "Vertel wat je wilt doen, dan kijken we samen.",
    faq: {
      swap:
        "Kies coins, plak ontvangstadres, tik Open rift, bevestig laatste 6 tekens, stuur naar stortingsadres.",
      status:
        "Na verzenden werkt de pagina bij: Wachten → Bevestigen → Verwerken → Verzenden → Klaar.",
      recover: "Open My Rifts (/rift) of je privélink.",
      wallet: "MetaMask of Phantom alleen om het adres in te vullen.",
      names: "Plak name.eth enz. Controleer het opgeloste adres.",
      rates: "Variabel tarief: preview is schatting, lock bij storting.",
      card: "Rift Card early access — /card",
      safety: "Rift is non-custodial. Controleer adressen.",
      support: "Menselijke hulp? Telegram via het swap-scherm.",
      about: "Rift (rft.money) — cross-chain swap zonder account.",
    },
  },
  pl: {
    language: "Język",
    greeting:
      "Cześć — jestem Lumen. Chętnie pomogę ze swapami, depozytami, portfelami i Rift.",
    placeholder: "Zapytaj Lumen o Rift…",
    send: "Wyślij",
    close: "Zamknij czat",
    launcherOpen: "Czat z Lumen",
    launcherClose: "Zamknij czat",
    typing: "Lumen pisze…",
    error: "Coś poszło nie tak. Spróbuj ponownie.",
    defaultReply:
      "Jestem Lumen, twój przewodnik Rift. Swapy, status depozytu, portfele, linki odzyskiwania.",
    defaultFollowUp: "Powiedz, co chcesz zrobić — ogarniemy to razem.",
    faq: {
      swap:
        "Wybierz monety, wklej portfel odbioru, naciśnij Open rift, potwierdź ostatnie 6 znaków, wyślij na adres depozytu.",
      status:
        "Po wysłaniu strona się aktualizuje: Oczekiwanie → Potwierdzanie → Przetwarzanie → Wysyłanie → Gotowe.",
      recover: "Otwórz My Rifts (/rift) lub prywatny link.",
      wallet: "MetaMask lub Phantom tylko do uzupełnienia adresu.",
      names: "Wklej name.eth itd. Zawsze sprawdź adres.",
      rates: "Zmienny kurs: podgląd to szacunek, lock po depozycie.",
      card: "Rift Card early access — /card",
      safety: "Rift jest non-custodial. Weryfikuj adresy.",
      support: "Pomoc człowieka? Telegram z ekranu swapu.",
      about: "Rift (rft.money) — swap między sieciami bez konta.",
    },
  },
};

const FAQ_MATCHERS: Array<{
  topic: keyof ChatUiCopy["faq"];
  match: RegExp;
}> = [
  {
    topic: "swap",
    match:
      /open rift|create swap|how (do i|to) swap|start swap|abrir|crear swap|comment swap|como|como fa|échange|troca|交换|tauschen|scambi|スワップ|스왑|обмен|مبادلة|takas|wymian/i,
  },
  {
    topic: "status",
    match:
      /confirm|pending|processing|settling|waiting|deposit detected|status|estado|statut|estado|状态|bestätig|conferm|確認|확인|статус|حالة|durum/i,
  },
  {
    topic: "recover",
    match:
      /recover|private link|tracking|lost|rift id|my rift|recuper|récup|recuperar|恢复| wiederher|recupero|復旧|복구|восстан|استRecovery|kurtar|herstel|odzysk/i,
  },
  {
    topic: "wallet",
    match: /wallet|metamask|phantom|connect|portefeuille|carteira|钱包|geldbörse|portafoglio|ウォレット|지갑|кошел|محفظ|cüzdan|portfel/i,
  },
  {
    topic: "names",
    match: /\.eth|\.sol|\.crypto|\.nft|name|ens|sns|domain|nombre|nom|nome|名称|name/i,
  },
  {
    topic: "rates",
    match: /rate|limit|min|max|amount|fee|tasa|taux|taxa|费率|kurs|tasso|レート|환율|курс|سعر|oran|tarief|kurs/i,
  },
  {
    topic: "card",
    match: /card|waitlist|debit|tarjeta|carte|cartão|卡|karte|carta|カード|카드|карт|بطاق|kart|kaart/i,
  },
  {
    topic: "safety",
    match: /safe|secure|custod|private|trust|segur|sûr|seguro|安全|sicher|sicuro|安全|안전|безоп|آمن|güven|veilig|bezpiecz/i,
  },
  {
    topic: "support",
    match: /telegram|support|human|help me|stuck|ayuda|aide|ajuda|帮助|hilfe|aiuto|サポート|지원|поддерж|دعم|yardım|hulp|pomoc/i,
  },
  {
    topic: "about",
    match:
      /what is rift|rft\.money|how does (it|rift) work|qué es|qu'est|o que é|什么是|was ist|cos'è|riftとは|rift란|что такое|ما هو|rift nedir|wat is|co to jest/i,
  },
];

export function isChatLocale(value: string): value is ChatLocale {
  return (CHAT_LOCALE_CODES as readonly string[]).includes(value);
}

export function normalizeChatLocale(value: string | null | undefined): ChatLocale {
  if (!value) return "en";
  const base = value.toLowerCase().split("-")[0];
  if (isChatLocale(base)) return base;
  if (base === "zh") return "zh";
  return "en";
}

export function detectBrowserChatLocale(): ChatLocale {
  if (typeof navigator === "undefined") return "en";
  const candidates = [...(navigator.languages ?? []), navigator.language];
  for (const candidate of candidates) {
    const normalized = normalizeChatLocale(candidate);
    if (normalized !== "en" || candidate.toLowerCase().startsWith("en")) {
      return normalized;
    }
  }
  return "en";
}

export function getChatCopy(locale: ChatLocale): ChatUiCopy {
  return COPY[locale] ?? COPY.en;
}

export function lumenGreeting(locale: ChatLocale): string {
  return getChatCopy(locale).greeting;
}

export function fallbackRiftReply(question: string, locale: ChatLocale): string {
  const copy = getChatCopy(locale);
  const trimmed = question.trim();
  if (!trimmed) return copy.defaultReply;

  for (const entry of FAQ_MATCHERS) {
    if (entry.match.test(trimmed)) return copy.faq[entry.topic];
  }

  return `${copy.defaultReply} ${copy.defaultFollowUp}`;
}

export function lumenSystemPrompt(locale: ChatLocale): string {
  const languageRule =
    locale === "en"
      ? `- Reply in English by default — this is Rift's primary language.
- Only switch to another language if the user clearly writes in that language and asks for it, or if they changed the chat language selector away from English.`
      : `- The user selected ${CHAT_LOCALE_LABELS[locale]?.native ?? locale} (${locale}) in the chat language menu — reply in that language.
- Keep product terms like "Open rift", "Rift ID", and paths (/rift, /docs, /card) when helpful.`;

  return `You are Lumen, the warm and friendly support guide for Rift (rft.money).

Personality:
- Sound human, kind, and reassuring — never robotic or cold.
- Use short paragraphs. Offer clear next steps.
- Never ask for seed phrases, private keys, or passwords.

Language:
${languageRule}

Scope:
- Rift swaps, deposit status, wallets (MetaMask/Phantom), name resolution (.eth, .sol, .crypto), rates/limits, recovery links, Rift Card waitlist, safety basics.
- Swaps use SideShift liquidity; Rift is a non-custodial UI.
- Status flow for users: Awaiting deposit → Confirming → Rift Completed.
- For complex stuck cases, suggest Telegram support without sharing secrets.

Keep most replies under 120 words unless the user asks for detailed steps.`;
}
