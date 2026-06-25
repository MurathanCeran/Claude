export type FinanceId = 'bank' | 'angel' | 'crowdfunding' | 'grant';

export type FinanceOption = {
    id: FinanceId;
    name: string;
    amount: number;
    pros: string;
    cons: string;
    longTerm: string;
    equityCost: number;
    recurring?: {
        every: number;
        amount: number;
        label: string;
    };
    oneTime?: {
        afterDecisions: number;
        amount: number;
        label: string;
    };
};

export const FINANCE_OPTIONS: FinanceOption[] = [
    {
        id: 'bank',
        name: 'Banka Kredisi',
        amount: 50000,
        pros: 'Hisseden vazgeçmezsin, kontrol sende kalır',
        cons: 'Faizli geri ödeme yükümlülüğü',
        longTerm: 'Her 2 soruda bir $5.000 faiz taksiti ödersin',
        equityCost: 0,
        recurring: { every: 2, amount: -5000, label: 'Banka kredisi faiz taksiti' },
    },
    {
        id: 'angel',
        name: 'Melek Yatırımcı',
        amount: 100000,
        pros: 'Mentor desteği ve ağ bağlantıları',
        cons: 'Şirketin %15 hissesini verirsin',
        longTerm: 'Exit anında kazancının %15\'i yatırımcıya gider',
        equityCost: 15,
    },
    {
        id: 'crowdfunding',
        name: 'Kitle Fonlaması',
        amount: 40000,
        pros: 'Hisse vermeden topluluk desteği alırsın',
        cons: 'Kampanya ve teslimat yükümlülükleri',
        longTerm: 'Her 3 soruda bir $2.500 operasyon maliyeti',
        equityCost: 0,
        recurring: { every: 3, amount: -2500, label: 'Kitle fonlaması operasyon maliyeti' },
    },
    {
        id: 'grant',
        name: 'Devlet Hibesi (KOSGEB)',
        amount: 30000,
        pros: 'Geri ödemesiz, faiz yok',
        cons: 'Uzun başvuru süreci, katı raporlama',
        longTerm: '4. karardan sonra tek seferlik $5.000 denetim maliyeti',
        equityCost: 0,
        oneTime: { afterDecisions: 4, amount: -5000, label: 'Hibe denetim ve raporlama maliyeti' },
    },
];

export const FINANCE_THRESHOLD = 10000;
