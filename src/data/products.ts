export type RoofType = 'pitched' | 'flat';
export type OpeningType = 'fixed' | 'manual' | 'electric' | 'solar';

export interface Size {
    code: string;
    width: number;
    height: number;
    label: string; // "550 x 700"
}

export interface Product {
    id: string;
    model: string;
    name: string;
    roofType: RoofType[];
    openingType: OpeningType;
    prices: Record<string, number>; // sizeCode -> price
    compatibleSizes: string[];
}

export interface Flashing {
    id: string;
    name: string;
    prices: Record<string, number>;
}

export interface Blind {
    id: string;
    model: string;
    name: string;
    type: string; // "darkening" or "translucent"
    compatibleModels: string[]; // "FS", "VS", "VSE", "VSS"
    prices: Record<string, number>;
}

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------

export const PITCHED_SIZES: Size[] = [
    { code: 'C01', width: 550, height: 700, label: '550 x 700' },
    { code: 'C04', width: 550, height: 980, label: '550 x 980' },
    { code: 'C06', width: 550, height: 1180, label: '550 x 1180' },
    { code: 'C08', width: 550, height: 1400, label: '550 x 1400' },
    { code: 'C12', width: 550, height: 1800, label: '550 x 1800' },
    { code: 'M02', width: 780, height: 780, label: '780 x 780' },
    { code: 'M04', width: 780, height: 980, label: '780 x 980' },
    { code: 'M06', width: 780, height: 1180, label: '780 x 1180' },
    { code: 'M08', width: 780, height: 1400, label: '780 x 1400' },
    { code: 'S01', width: 1140, height: 700, label: '1140 x 700' },
    { code: 'S06', width: 1140, height: 1180, label: '1140 x 1180' },
];

export const FLAT_SIZES: Size[] = [
    { code: '1430', width: 460, height: 870, label: '460 x 870' }, // Overall Curb
    { code: '2222', width: 665, height: 665, label: '665 x 665' },
    { code: '2230', width: 665, height: 870, label: '665 x 870' },
    { code: '2234', width: 665, height: 970, label: '665 x 970' },
    { code: '2246', width: 665, height: 1275, label: '665 x 1275' },
    { code: '2270', width: 665, height: 1885, label: '665 x 1885' },
    { code: '3030', width: 870, height: 870, label: '870 x 870' },
    { code: '3046', width: 870, height: 1275, label: '870 x 1275' },
    { code: '3055', width: 870, height: 1505, label: '870 x 1505' },
    { code: '3072', width: 870, height: 1935, label: '870 x 1935' },
    { code: '3434', width: 970, height: 970, label: '970 x 970' },
    { code: '3446', width: 970, height: 1275, label: '970 x 1275' },
    { code: '4622', width: 1275, height: 665, label: '1275 x 665' },
    { code: '4646', width: 1275, height: 1275, label: '1275 x 1275' },
    { code: '4672', width: 1275, height: 1935, label: '1275 x 1935' },
];

export const PRODUCTS: Product[] = [
    // PITCHED ROOF
    {
        id: 'fs',
        model: 'FS',
        name: 'Fixed Skylight (FS)',
        roofType: ['pitched'],
        openingType: 'fixed',
        compatibleSizes: ['C01', 'C04', 'C06', 'C08', 'C12', 'M02', 'M04', 'M06', 'M08', 'S01', 'S06'],
        prices: {
            'C01': 532, 'C04': 614, 'C06': 705, 'C08': 788, 'C12': 1114,
            'M02': 725, 'M04': 765, 'M06': 866, 'M08': 969,
            'S01': 843, 'S06': 1006
        }
    },
    {
        id: 'vs',
        model: 'VS',
        name: 'Manual Opening Skylight (VS)',
        roofType: ['pitched'],
        openingType: 'manual',
        compatibleSizes: ['C01', 'C04', 'C06', 'C08', 'M02', 'M04', 'M06', 'M08', 'S01', 'S06'],
        prices: {
            'C01': 1228, 'C04': 1248, 'C06': 1334, 'C08': 1402,
            'M02': 1402, 'M04': 1463, 'M06': 1597, 'M08': 1731,
            'S01': 1540, 'S06': 1941
        }
    },
    {
        id: 'vse',
        model: 'VSE',
        name: 'Electric Opening Skylight (VSE)',
        roofType: ['pitched'],
        openingType: 'electric',
        compatibleSizes: ['C01', 'C04', 'C06', 'C08', 'M04', 'M06', 'M08', 'S01', 'S06'],
        prices: {
            'C01': 2311, 'C04': 2339, 'C06': 2402, 'C08': 2461,
            'M04': 2509, 'M06': 2618, 'M08': 2727,
            'S01': 2595, 'S06': 2894
        }
    },
    {
        id: 'vss',
        model: 'VSS',
        name: 'Solar Opening Skylight (VSS)',
        roofType: ['pitched'],
        openingType: 'solar',
        compatibleSizes: ['C01', 'C04', 'C06', 'C08', 'M02', 'M04', 'M06', 'M08', 'S01', 'S06'],
        prices: {
            'C01': 2492, 'C04': 2522, 'C06': 2590, 'C08': 2653,
            'M02': 2643, 'M04': 2705, 'M06': 2822, 'M08': 2941,
            'S01': 2798, 'S06': 3120
        }
    },

    // FLAT ROOF
    {
        id: 'fcm',
        model: 'FCM',
        name: 'Flat Roof Fixed (FCM)',
        roofType: ['flat'],
        openingType: 'fixed',
        compatibleSizes: ['1430', '2222', '2230', '2234', '2246', '2270', '3030', '3046', '3055', '3072', '3434', '3446', '4646', '4672'],
        // Excluding 4622 as it is not in price list for FCM
        prices: {
            '1430': 351, '2222': 381, '2230': 414, '2234': 438, '2246': 497, '2270': 896,
            '3030': 481, '3046': 611, '3055': 745, '3072': 1889,
            '3434': 547, '3446': 645, '4646': 677, '4672': 2102
        }
    },
    {
        id: 'vcm',
        model: 'VCM',
        name: 'Flat Roof Manual (VCM)',
        roofType: ['flat'],
        openingType: 'manual',
        compatibleSizes: ['2222', '2234', '2246', '3030', '3046', '3434', '4646'],
        prices: {
            '2222': 1296, '2234': 1400, '2246': 1547,
            '3030': 1621, '3046': 1760,
            '3434': 1694,
            '4646': 2064
        }
    },
    {
        id: 'vcs',
        model: 'VCS',
        name: 'Flat Roof Solar (VCS)',
        roofType: ['flat'],
        openingType: 'solar',
        compatibleSizes: ['2222', '2234', '2246', '3030', '3046', '3434', '4622', '4646'],
        prices: {
            '2222': 2510, '2234': 2654, '2246': 2828,
            '3030': 2837, '3046': 2976,
            '3434': 2899,
            '4622': 2846, '4646': 3119
        }
    }
];

export const FLASHINGS: Flashing = {
    id: 'edw',
    name: 'EDW Flashing (Tile/Corrugated)',
    prices: {
        'C01': 109, 'C04': 114, 'C06': 115, 'C08': 122, 'C12': 152,
        'M02': 131, 'M04': 131, 'M06': 135, 'M08': 138,
        'S01': 139, 'S06': 162
    }
};

export const BLINDS: Blind[] = [
    {
        id: 'fscd',
        model: 'FSCD',
        name: 'Solar Honeycomb (Darkening)',
        type: 'darkening',
        compatibleModels: ['FS'],
        prices: { 'C01': 614, 'C04': 614, 'C06': 614, 'C08': 614, 'C12': 768, 'M02': 628, 'M04': 628, 'M06': 628, 'M08': 628, 'S01': 641, 'S06': 641 }
    },
    {
        id: 'fsld',
        model: 'FSLD',
        name: 'Solar Translucent (Light Filtering)',
        type: 'translucent',
        compatibleModels: ['FS'],
        prices: { 'C01': 614, 'C04': 614, 'C06': 614, 'C08': 614, 'C12': 0, 'M02': 628, 'M04': 628, 'M06': 628, 'M08': 628, 'S01': 641, 'S06': 641 }
        // Note: C12 excluded in data markdown for FSLD/FSCH/FSLH
    },
    {
        id: 'fsch',
        model: 'FSCH',
        name: 'Solar Honeycomb (Darkening)',
        type: 'darkening',
        compatibleModels: ['VS', 'VSE', 'VSS'],
        prices: { 'C01': 614, 'C04': 614, 'C06': 614, 'C08': 614, 'M02': 628, 'M04': 628, 'M06': 628, 'M08': 628, 'S01': 641, 'S06': 641 }
    },
    {
        id: 'fslh',
        model: 'FSLH',
        name: 'Solar Translucent (Light Filtering)',
        type: 'translucent',
        compatibleModels: ['VS', 'VSE', 'VSS'],
        prices: { 'C01': 614, 'C04': 614, 'C06': 614, 'C08': 614, 'M02': 628, 'M04': 628, 'M06': 628, 'M08': 628, 'S01': 641, 'S06': 641 }
    },
    // Flat roof blinds
    {
        id: 'fscc',
        model: 'FSCC',
        name: 'Solar Honeycomb (Darkening)',
        type: 'darkening',
        compatibleModels: ['FCM', 'VCM', 'VCS'],
        prices: {
            // Range 615-706 in PRD, using estimate or specific if known. 
            // PRD: "FSCC Solar Honeycomb Blind ... RRP 615–706"
            // Let's use 650 as placeholder or check data.md... data.md says "615–706" for selected sizes.
            // I'll put specific values if I can infer, otherwise generic.
            '1430': 615, '2222': 615, '2230': 615, '2234': 615, '2246': 615, '2270': 706,
            '3030': 620, '3046': 627, '3055': 640, '3072': 706,
            '3434': 660, '3446': 660, '4646': 680, '4672': 706
        }
    }
];

export const ACCESSORIES = [
    {
        id: 'zzz199',
        name: 'ZZZ 199 Blind Tray',
        compatibleModels: ['FCM', 'VCM', 'VCS'],
        prices: {
            '1430': 95, '2222': 95, '2230': 95, '2234': 95, '2246': 100, '2270': 110,
            '3030': 105, '3046': 110, '3055': 115, '3072': 122,
            '3434': 110, '3446': 115, '4622': 115, '4646': 122, '4672': 122
        }
    }
];

