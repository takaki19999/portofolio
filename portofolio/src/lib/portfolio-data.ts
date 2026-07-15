import devDesk from "@/assets/dev-desk.png";
import cryptoQuest from "@/assets/crypto-quest.png";
import eventImg from "@/assets/event.png";
import defiYield from "@/assets/defi-yield.png";
import avatar from "@/assets/avatar.png";

export const images = {
  devDesk,
  cryptoQuest,
  event: eventImg,
  defiYield,
  avatar,
};

export const yearsStart = 2018;

export const socials = {
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  twitter: "https://twitter.com",
  email: "mailto:averyanderson0925@gmail.com",
};

export const email = "averyanderson0925@gmail.com";

type Content = {
  profile: {
    name: string;
    role: string;
    tagline: string;
    intro: string;
    heroDescription: string;
    availability: string;
    codeCaption: string;
    seniorTag: string;
    yearsSuffix: string;
  };
  stats: { years: string; projects: string; web3: string };
  hero: { viewWork: string; contactMe: string };
  nav: { home: string; skills: string; projects: string; experience: string; contact: string; cta: string };
  sections: {
    skills: { eyebrow: string; title: string; subtitle: string };
    projects: { eyebrow: string; title: string; subtitle: string };
    experience: { eyebrow: string; title: string };
    testimonials: { eyebrow: string; title: string };
    contact: {
      eyebrow: string;
      title: string;
      subtitle: string;
      prefer: string;
      findOnline: string;
      name: string;
      email: string;
      subject: string;
      message: string;
      send: string;
      toastTitle: string;
      toastDesc: string;
    };
  };
  entry: { enter: string };
  footer: { rights: string; builtWith: string };
  expertiseTags: string[];
  skillGroups: { title: string; icon: string; skills: string[] }[];
  projects: {
    title: string;
    image: string;
    description: string;
    tech: string[];
    features: string[];
  }[];
  experience: { company: string; role: string; period: string; points: string[] }[];
  testimonials: { quote: string; name: string; title: string }[];
};

const ja: Content = {
  profile: {
    name: "田中 隆",
    role: "シニアフルスタック開発者",
    tagline: "Web3・フィンテック スペシャリスト",
    intro:
      "こんにちは、シニアフルスタック開発者の田中隆です。8年以上にわたり、スケーラブルなWebアプリケーション、ブロックチェーンソリューション、暗号資産ベースのゲーミングプラットフォームの設計・開発・運用に携わってきました。スマートコントラクトの統合、Web3アプリケーション、NFT機能、P2E(Play-to-Earn)ゲームシステムを専門としています。また、金融トレーディングツール、マーケットデータダッシュボード、トレーダー・投資家向け自動化システムの構築にも豊富な経験があります。",
    heroDescription:
      "8年以上の経験を活かし、スケーラブルなWebアプリ、ブロックチェーン・エコシステム、金融トレーディング基盤を構築しています。クリーンなコード、安全なシステム、そして革新的なソリューションを追求します。",
    availability: "厳選案件を受付中",
    codeCaption: "// Web3とフィンテックの未来を築く",
    seniorTag: "シニアフルスタック開発者",
    yearsSuffix: "年以上の経験",
  },
  stats: { years: "年以上の経験", projects: "納品プロジェクト", web3: "Web3プロトコル" },
  hero: { viewWork: "実績を見る", contactMe: "お問い合わせ" },
  nav: {
    home: "ホーム",
    skills: "スキル",
    projects: "プロジェクト",
    experience: "経歴",
    contact: "お問い合わせ",
    cta: "話しましょう",
  },
  sections: {
    skills: {
      eyebrow: "技術スタック",
      title: "スキル・専門分野",
      subtitle: "最新のWeb、ブロックチェーン、金融データエンジニアリングを横断するフルスタックのツールキット。",
    },
    projects: {
      eyebrow: "ポートフォリオ",
      title: "主なプロジェクト",
      subtitle: "クリプトゲーム、DeFi、トレーディングシステム、NFTプラットフォームなどの実績を厳選。",
    },
    experience: { eyebrow: "キャリア", title: "職務経歴" },
    testimonials: { eyebrow: "推薦の声", title: "お客様の声" },
    contact: {
      eyebrow: "お問い合わせ",
      title: "一緒に作りましょう",
      subtitle: "Web3、フィンテック、スケーラブルなWebアプリなど、ご相談はお気軽にどうぞ。",
      prefer: "メールをご希望の方は、直接ご連絡ください。24時間以内にご返信いたします。",
      findOnline: "オンラインで見つける",
      name: "お名前",
      email: "メールアドレス",
      subject: "件名",
      message: "メッセージ",
      send: "送信する",
      toastTitle: "メッセージを送信しました!",
      toastDesc: "ご連絡ありがとうございます。折り返しご返信いたします。",
    },
  },
  entry: { enter: "ポートフォリオを見る" },
  footer: { rights: "無断複製・転載を禁じます。", builtWith: "使用技術:" },
  expertiseTags: [
    "Webアプリケーション",
    "ブロックチェーン / Web3",
    "スマートコントラクト",
    "暗号資産ウォレット",
    "NFT・トークノミクス",
    "P2Eゲームシステム",
    "トレーディング基盤",
    "マーケットデータAPI",
    "リアルタイム可視化",
    "取引自動化",
  ],
  skillGroups: [
    { title: "フロントエンド", icon: "Layout", skills: ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS"] },
    { title: "バックエンド", icon: "Server", skills: ["Node.js", "Python", "Django", "Express", ".NET Core"] },
    { title: "ブロックチェーン / Web3", icon: "Blocks", skills: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "Ethers.js", "IPFS"] },
    { title: "NFT・ゲーミング", icon: "Gamepad2", skills: ["ERC-721", "ERC-1155", "Unity", "P2E設計", "トークノミクス"] },
    { title: "データ・トレーディング", icon: "LineChart", skills: ["Pandas / NumPy", "WebSockets", "リアルタイムAPI", "取引アルゴリズム", "D3.js"] },
    { title: "データベース・DevOps", icon: "Database", skills: ["PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "CI/CD"] },
  ],
  projects: [
    {
      title: "Crypto Quest — P2Eゲーミングプラットフォーム",
      image: images.cryptoQuest,
      description:
        "NFTキャラクター、オンチェーンのトークン報酬、ステーキング、ウォレット連携を備えた本格的なブロックチェーン統合バトルアリーナ。",
      tech: ["Solidity", "React", "Ethers.js", "Unity", "ERC-721"],
      features: [
        "NFTキャラクターのミント & PvPバトル",
        "Play-to-Earn経済とステーキング",
        "MetaMask・WalletConnect対応",
        "リアルタイム市況・リーダーボード",
      ],
    },
    {
      title: "トレーディング自動化ダッシュボード",
      image: images.devDesk,
      description:
        "カスタムインジケーター、自動売買シグナル、ポートフォリオ管理を備えたアクティブトレーダー向けリアルタイム市況プラットフォーム。",
      tech: ["Python", "WebSockets", "TradingView", "PostgreSQL", "Redis"],
      features: [
        "リアルタイム・ストリーミング市場データ",
        "カスタム指標と自動シグナル",
        "バックテストとポートフォリオ分析",
        "アラート・リスク管理ツール",
      ],
    },
    {
      title: "DeFi イールドアグリゲーター",
      image: images.defiYield,
      description:
        "複数のDeFiプロトコル間で自動リバランスを行い、収益を最適化するスマートコントラクトベースのプラットフォーム。",
      tech: ["Solidity", "Hardhat", "Web3.js", "Next.js", "The Graph"],
      features: [
        "複数プロトコルの利回り最適化",
        "自動ヴォールト・リバランス",
        "ガス効率の高いスマートコントラクト",
        "監査済みで安全なアーキテクチャ",
      ],
    },
    {
      title: "NFTマーケットプレイス",
      image: images.event,
      description: "ミント、入札、コレクション横断のロイヤリティ自動分配に対応した本格的なマーケットプレイス。",
      tech: ["React", "ERC-1155", "IPFS", "Node.js", "MongoDB"],
      features: [
        "レイジーミントとコレクション管理",
        "オークションと時限入札",
        "オンチェーンでのロイヤリティ分配",
        "IPFSベースのメタデータ保存",
      ],
    },
  ],
  experience: [
    {
      company: "BlockForge Labs",
      role: "リードフルスタック・Web3エンジニア",
      period: "2022年 — 現在",
      points: [
        "月間アクティブユーザー5万人以上のP2Eゲームプラットフォームを設計",
        "スマートコントラクト開発と第三者機関によるセキュリティ監査を主導",
        "リアルタイムのオンチェーン分析パイプラインを構築",
      ],
    },
    {
      company: "Quant Trading Systems",
      role: "シニアバックエンド・データエンジニア",
      period: "2019年 — 2022年",
      points: [
        "WebSocketsによる低遅延の市場データ基盤を提供",
        "自動売買戦略とバックテスト・エンジンを開発",
        "1日数百万件規模のポートフォリオ分析にスケール",
      ],
    },
    {
      company: "Nova Web Studio",
      role: "フルスタック開発者",
      period: "2017年 — 2019年",
      points: [
        "エンタープライズ向けWebアプリを20件以上リリース",
        "CI/CDとコンテナデプロイのワークフローを導入",
        "モダンなReact開発においてジュニア開発者を指導",
      ],
    },
  ],
  testimonials: [
    {
      quote: "田中さんは厳しい納期の中で堅牢なブロックチェーン基盤を納品してくれました。コード品質とセキュリティ意識が非常に高いです。",
      name: "ジョーダン・リベラ",
      title: "CTO, BlockForge Labs",
    },
    {
      quote: "トレーディング・ダッシュボードを構想から本番までスムーズに導いてくれました。市場と技術の両方を深く理解しています。",
      name: "田中 芽衣",
      title: "プロダクト責任者, Quant Systems",
    },
    {
      quote: "洗練されたフロントエンドと堅牢なスマートコントラクトを両立できる稀有なフルスタックエンジニアです。強くお勧めします。",
      name: "ダニエル・オカフォー",
      title: "創業者, DeFiVault",
    },
  ],
};

const en: Content = {
  profile: {
    name: "Takashi Tanaka",
    role: "Senior Full-Stack Developer",
    tagline: "Web3 & Fintech Specialist",
    intro:
      "Hello, I'm Takashi Tanaka, a Senior Full-Stack Developer with over 8 years of experience designing, developing, and deploying scalable web applications, blockchain solutions, and crypto-based gaming platforms. I specialize in smart contract integration, Web3 applications, NFT functionality, and play-to-earn (P2E) game systems. I also have extensive experience building financial trading tools, market data dashboards, and automation systems for traders and investors.",
    heroDescription:
      "8+ years of experience building scalable web applications, blockchain ecosystems, and financial trading platforms. Passionate about clean code, secure systems, and innovative solutions.",
    availability: "Available for select projects",
    codeCaption: "// building the future of web3 & fintech",
    seniorTag: "Senior Full-Stack Developer",
    yearsSuffix: "+ Years Experience",
  },
  stats: { years: "Years experience", projects: "Projects shipped", web3: "Web3 protocols" },
  hero: { viewWork: "View My Work", contactMe: "Contact Me" },
  nav: { home: "Home", skills: "Skills", projects: "Projects", experience: "Experience", contact: "Contact", cta: "Let's talk" },
  sections: {
    skills: {
      eyebrow: "Tech Stack",
      title: "Skills & Expertise",
      subtitle: "A full-stack toolkit spanning modern web, blockchain, and financial data engineering.",
    },
    projects: {
      eyebrow: "Portfolio",
      title: "Featured Projects",
      subtitle: "Selected work across crypto gaming, DeFi, trading systems, and NFT platforms.",
    },
    experience: { eyebrow: "Career", title: "Experience" },
    testimonials: { eyebrow: "Kind Words", title: "Testimonials" },
    contact: {
      eyebrow: "Get in touch",
      title: "Let's Build Something",
      subtitle: "Have a project in mind? Whether it's Web3, fintech, or a scalable web app — let's talk.",
      prefer: "Prefer email? Reach me directly and I'll respond within 24 hours.",
      findOnline: "Find me online",
      name: "Name",
      email: "Email",
      subject: "Subject",
      message: "Your message",
      send: "Send Message",
      toastTitle: "Message ready to send!",
      toastDesc: "Thanks for reaching out — I'll get back to you shortly.",
    },
  },
  entry: { enter: "Enter Portfolio" },
  footer: { rights: "All rights reserved.", builtWith: "Built with" },
  expertiseTags: [
    "Web Applications",
    "Blockchain / Web3",
    "Smart Contracts",
    "Crypto Wallets",
    "NFT & Tokenomics",
    "P2E Gaming Systems",
    "Trading Platforms",
    "Market Data APIs",
    "Real-Time Visualization",
    "Trading Automation",
  ],
  skillGroups: [
    { title: "Frontend", icon: "Layout", skills: ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS"] },
    { title: "Backend", icon: "Server", skills: ["Node.js", "Python", "Django", "Express", ".NET Core"] },
    { title: "Blockchain / Web3", icon: "Blocks", skills: ["Solidity", "Ethereum", "Hardhat", "Web3.js", "Ethers.js", "IPFS"] },
    { title: "NFT & Gaming", icon: "Gamepad2", skills: ["ERC-721", "ERC-1155", "Unity", "P2E Mechanics", "Tokenomics"] },
    { title: "Data & Trading", icon: "LineChart", skills: ["Pandas / NumPy", "WebSockets", "Real-time APIs", "Trading Algorithms", "D3.js"] },
    { title: "Database & DevOps", icon: "Database", skills: ["PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "CI/CD"] },
  ],
  projects: [
    {
      title: "Crypto Quest — P2E Gaming Platform",
      image: images.cryptoQuest,
      description:
        "Full blockchain-integrated battle arena game with NFT characters, on-chain token rewards, staking, and seamless wallet connectivity.",
      tech: ["Solidity", "React", "Ethers.js", "Unity", "ERC-721"],
      features: [
        "NFT character minting & PvP battle arena",
        "Play-to-earn token economy & staking",
        "MetaMask & WalletConnect integration",
        "Live market status & leaderboards",
      ],
    },
    {
      title: "Trading Automation Dashboard",
      image: images.devDesk,
      description:
        "Real-time market data platform with custom indicators, automated trading signals, and portfolio tracking for active traders.",
      tech: ["Python", "WebSockets", "TradingView", "PostgreSQL", "Redis"],
      features: [
        "Real-time streaming market data",
        "Custom indicators & automated signals",
        "Backtesting & portfolio analytics",
        "Alerting & risk management tools",
      ],
    },
    {
      title: "DeFi Yield Aggregator",
      image: images.defiYield,
      description:
        "Smart contract-based platform that optimizes yield farming across multiple DeFi protocols with automated rebalancing.",
      tech: ["Solidity", "Hardhat", "Web3.js", "Next.js", "The Graph"],
      features: [
        "Multi-protocol yield optimization",
        "Automated vault rebalancing",
        "Gas-efficient smart contracts",
        "Audited & secure architecture",
      ],
    },
    {
      title: "NFT Marketplace",
      image: images.event,
      description: "Full-featured marketplace supporting minting, bidding, and automatic royalty distribution across collections.",
      tech: ["React", "ERC-1155", "IPFS", "Node.js", "MongoDB"],
      features: [
        "Lazy minting & collection management",
        "Auctions & timed bidding",
        "On-chain royalty distribution",
        "IPFS-backed metadata storage",
      ],
    },
  ],
  experience: [
    {
      company: "BlockForge Labs",
      role: "Lead Full-Stack & Web3 Engineer",
      period: "2022 — Present",
      points: [
        "Architected P2E gaming platform serving 50k+ monthly active players",
        "Led smart contract development and third-party security audits",
        "Built real-time on-chain analytics pipeline",
      ],
    },
    {
      company: "Quant Trading Systems",
      role: "Senior Backend & Data Engineer",
      period: "2019 — 2022",
      points: [
        "Delivered low-latency market data infrastructure over WebSockets",
        "Developed automated trading strategies and backtesting engine",
        "Scaled portfolio analytics to millions of daily events",
      ],
    },
    {
      company: "Nova Web Studio",
      role: "Full-Stack Developer",
      period: "2017 — 2019",
      points: [
        "Shipped 20+ production web applications for enterprise clients",
        "Introduced CI/CD and containerized deployment workflows",
        "Mentored junior developers on modern React practices",
      ],
    },
  ],
  testimonials: [
    {
      quote:
        "Takashi delivered a rock-solid blockchain platform under a tight deadline. The code quality and security focus were exceptional.",
      name: "Jordan Rivera",
      title: "CTO, BlockForge Labs",
    },
    {
      quote:
        "Our trading dashboard went from concept to production seamlessly. Takashi understands both markets and engineering deeply.",
      name: "Mei Tanaka",
      title: "Head of Product, Quant Systems",
    },
    {
      quote: "A rare full-stack engineer who ships polished frontends and bulletproof smart contracts alike. Highly recommended.",
      name: "Daniel Okafor",
      title: "Founder, DeFiVault",
    },
  ],
};

export function getContent(): Content {
  return en;
}

export type { Content };
