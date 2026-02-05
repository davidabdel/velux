import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRODUCTS, PITCHED_SIZES, FLAT_SIZES, FLASHINGS, BLINDS, ACCESSORIES } from '@/data/products';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type StepId = 'pitch' | 'material' | 'opening' | 'truss' | 'size' | 'results' | 'blinds' | 'addon' | 'summary';

interface SelectionState {
    roofPitch: 'pitched' | 'flat' | null;
    roofMaterial: 'tiled-corrugated' | 'wide-metal' | null;
    // Derived or legacy mapping for compatibility
    roofType: 'tiled' | 'corrugated' | 'wide-metal' | 'flat' | null;
    // installType removed, assumed 'new'
    openingType: 'fixed' | 'manual' | 'electric' | 'solar' | null;
    orientation: 'portrait' | 'landscape' | null;
    trussSpacing: number | null;
    sizeCode: string | null;
    selectedProduct: string | null; // Product ID
    selectedBlind: string | null; // Blind ID
}

const PITCH_OPTIONS = [
    { id: 'pitched', label: 'Pitched Roof', icon: '🏠' },
    { id: 'flat', label: 'Flat Roof', icon: '___' }, // using text/shape for flat
];

const MATERIAL_OPTIONS = [
    { id: 'tiled-corrugated', label: 'Tiled / Corrugated Metal', image: '/Untitled design (9).png' },
    { id: 'wide-metal', label: 'Wide-span Metal (Trimdek / Klip-Lok)', image: '/IMG_3050.JPG' },
];



const OPENING_OPTIONS = [
    { id: 'fixed', label: 'Fixed (Non-opening)' },
    { id: 'manual', label: 'Manual Opening' },
    { id: 'electric', label: 'Electric Opening' },
    { id: 'solar', label: 'Solar Powered' },
];

const TRUSS_OPTIONS = [
    { id: 600, label: '600mm' },
    { id: 900, label: '900mm' },
    { id: 1200, label: '1200mm' },
];


export default function SkylightSelector() {
    const [step, setStep] = useState<StepId>('pitch');
    const [history, setHistory] = useState<StepId[]>([]);
    const [selection, setSelection] = useState<SelectionState>({
        roofPitch: null,
        roofMaterial: null,
        roofType: null,
        openingType: null,
        orientation: 'portrait',
        trussSpacing: null,
        sizeCode: null,
        selectedProduct: null,
        selectedBlind: null,
    });

    // Helpers to move between steps
    const nextStep = (next: StepId) => {
        setHistory([...history, step]);
        setStep(next);
    };

    const backStep = () => {
        const prev = history[history.length - 1];
        if (prev) {
            setHistory(history.slice(0, -1));
            setStep(prev);
        }
    };

    const reset = () => {
        setStep('pitch');
        setHistory([]);
        setSelection({
            roofPitch: null,
            roofMaterial: null,
            roofType: null,
            openingType: null,
            orientation: 'portrait',
            trussSpacing: null,
            sizeCode: null,
            selectedProduct: null,
            selectedBlind: null,
        });
    };

    // ----------------------------------------------------------------------------
    // FILTER LOGIC
    // ----------------------------------------------------------------------------

    const isFlatRoof = selection.roofType === 'flat';

    // Filter Products based on current selection
    const validProducts = useMemo(() => {
        return PRODUCTS.filter(p => {
            // 1. Roof Type Check
            if (selection.roofType) {
                if (isFlatRoof && !p.roofType.includes('flat')) return false;
                if (!isFlatRoof && !p.roofType.includes('pitched')) return false;
            }

            // 2. Opening Check
            if (selection.openingType) {
                if (p.openingType !== selection.openingType) return false;
            }

            return true;
        });
    }, [selection.roofType, selection.openingType, isFlatRoof]);

    // Available Opening Types based on Roof
    const availableOpeningTypes = useMemo(() => {
        const types = new Set<string>();
        PRODUCTS.forEach(p => {
            if (selection.roofType) {
                if (isFlatRoof && !p.roofType.includes('flat')) return;
                if (!isFlatRoof && !p.roofType.includes('pitched')) return;
            }
            types.add(p.openingType);
        });
        return OPENING_OPTIONS.filter(o => types.has(o.id));
    }, [selection.roofType, isFlatRoof]);

    // Valid Sizes Logic
    const validSizes = useMemo(() => {
        const sizeSet = new Set<string>();

        // Collect all compatible sizes from currently valid products
        validProducts.forEach(p => {
            p.compatibleSizes.forEach(s => sizeSet.add(s));
        });

        if (selection.trussSpacing) {
            if (isFlatRoof) {
                // Flat Roof Logic: Filter by Overall Curb Width
                // 600mm -> 14xx (460mm) and 22xx (665mm) logic roughly, or use code prefix
                // data.md:
                // 1430 (460 wide) -> 600 truss (exception)
                // 22xx (665 wide) -> 600 truss
                // 30xx (870 wide) -> 900 truss
                // 34xx (970 wide) -> 900 truss
                // 46xx (1275 wide) -> 1200 truss

                let validPrefixes: string[] = [];
                if (selection.trussSpacing === 600) validPrefixes = ['14', '22'];
                else if (selection.trussSpacing === 900) validPrefixes = ['30', '34'];
                else if (selection.trussSpacing === 1200) validPrefixes = ['46'];

                const restricted = Array.from(sizeSet).filter(code => !validPrefixes.some(pre => code.startsWith(pre)));
                restricted.forEach(r => sizeSet.delete(r));

            } else {
                // Pitched Roof Logic (Existing)
                // 600mm -> Only 'C' series
                // 900mm -> Only 'M' series
                // 1200mm -> Only 'S' series

                const allowedPrefix = selection.trussSpacing === 600 ? 'C' :
                    selection.trussSpacing === 900 ? 'M' :
                        'S';

                const restricted = Array.from(sizeSet).filter(code => !code.startsWith(allowedPrefix));
                restricted.forEach(r => sizeSet.delete(r));
            }
        }

        // Orientation Logic (Pitched only rule from PRD: FCM 2270 / 3072 / 4672 landscape constrained?)
        // PRD say: "Removes restricted sizes (e.g. FCM 2270 / 3072 / 4672 landscape)"
        // Actually the PRD says: "Removes restricted sizes (e.g. FCM 2270 / 3072 / 4672 landscape)"
        // Wait, FCM is Flat Roof.
        // Step 4 is Roof Pitch / Orientation *if applicable*. 
        // Usually Flat roof (FCM) is installed on a curb. 
        // If user says "Landscape", we might exclude some tall sizes?
        // Let's implement the logic: If Landscape, exclude FCM 2270, 3072, 4672 if they are "Portrait only" designs?
        // Actually, usually 2270 is 572x1792. It's very tall. If you install it landscape 1792x572, maybe it's fine?
        // PRD explicitly says so. So we filter them out if Landscape.

        if (selection.orientation === 'landscape') {
            const restricted = ['2270', '3072', '4672'];
            restricted.forEach(r => sizeSet.delete(r));
        }

        const sizes = isFlatRoof ? FLAT_SIZES : PITCHED_SIZES;
        return sizes.filter(s => sizeSet.has(s.code));
    }, [validProducts, isFlatRoof, selection.orientation, selection.trussSpacing]);


    // ----------------------------------------------------------------------------
    // HANDLERS
    // ----------------------------------------------------------------------------

    const handlePitchSelect = (id: string) => {
        setSelection({ ...selection, roofPitch: id as any, roofType: id === 'flat' ? 'flat' : null });
        if (id === 'flat') {
            nextStep('opening');
        } else {
            nextStep('material');
        }
    };

    const handleMaterialSelect = (id: string) => {
        // Map to legacy roofType for compatibility with filtered products
        // tiled-corrugated -> 'tiled' (since data uses 'tiled'/'corrugated' but flashing is same)
        // Actually Products have roofType array: ['pitched']
        // So 'tiled' or 'corrugated' doesn't matter for Product, only for Flashing.
        // Let's set it to 'tiled' if tiled-corrugated for simplicity, or just update the logic to not rely on specific filtered subtype 
        // but rather just 'pitched'. The PRODUCT data just checks 'pitched'.
        // The Flashing data: EDW is for Tile/Corrugated.
        const mappedType = id === 'tiled-corrugated' ? 'tiled' : 'wide-metal';
        setSelection({ ...selection, roofMaterial: id as any, roofType: mappedType });
        nextStep('opening');
    };

    const handleOpeningSelect = (id: string) => {
        setSelection({ ...selection, openingType: id as any, orientation: 'portrait' });
        nextStep('truss');
    };

    const handleTrussSelect = (spacing: number) => {
        setSelection({ ...selection, trussSpacing: spacing });
        nextStep('size');
    };

    const handleSizeSelect = (code: string) => {
        setSelection({ ...selection, sizeCode: code });
        nextStep('results');
    };

    const handleProductSelect = (id: string) => {
        setSelection({ ...selection, selectedProduct: id });
        nextStep('blinds');
    };

    const handleBlindSelect = (id: string | null) => {
        setSelection({ ...selection, selectedBlind: id });
        nextStep('summary');
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('summary-card');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('velux-skylight-selection.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Fallback to print if PDF generation fails
            window.print();
        }
    };

    // ----------------------------------------------------------------------------
    // RENDER STEPS
    // ----------------------------------------------------------------------------

    const renderPitchStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PITCH_OPTIONS.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => handlePitchSelect(opt.id)}
                    className="flex flex-col items-center justify-center p-8 bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                    <span className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">{opt.icon}</span>
                    <span className="text-lg font-medium text-foreground">{opt.label}</span>
                </button>
            ))}
        </div>
    );

    const renderMaterialStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MATERIAL_OPTIONS.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => handleMaterialSelect(opt.id)}
                    className="flex flex-col items-center justify-center p-8 bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
                >
                    <img src={opt.image} alt={opt.label} className="w-32 h-32 object-contain mb-4" />
                    <span className="text-lg font-medium text-center text-foreground">{opt.label}</span>
                </button>
            ))}
        </div>
    );

    const renderOpeningStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableOpeningTypes.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => handleOpeningSelect(opt.id)}
                    className="p-6 bg-white border border-border rounded-xl hover:border-primary/50 transition-all text-left flex flex-col justify-center h-32 group"
                >
                    <div>
                        <h3 className="text-lg font-medium group-hover:text-primary transition-colors">{opt.label}</h3>
                    </div>
                </button>
            ))}
        </div>
    );

    const renderTrussStep = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRUSS_OPTIONS.map((opt) => (
                <button
                    key={opt.id}
                    onClick={() => handleTrussSelect(opt.id)}
                    className="p-8 bg-white border border-border rounded-xl hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4 group"
                >
                    <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform">{opt.id}mm</div>
                </button>
            ))}
        </div>
    );

    const renderSizeStep = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {validSizes.map((s) => (
                    <button
                        key={s.code}
                        onClick={() => handleSizeSelect(s.code)}
                        className="p-4 bg-white border border-border rounded-lg hover:border-primary transition-all text-center flex flex-col items-center justify-center min-h-[100px] group"
                    >
                        <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{s.label} mm</span>
                    </button>
                ))}
            </div>
            {validSizes.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No sizes available for this configuration. Please go back and change options.
                </div>
            )}
        </div>
    );

    const renderResultsStep = () => {
        // Determine recommended products
        // Logic: PRD says "1-3 recommended skylights".
        // We already filtered by roof and opening type.
        // Usually there is only 1 exact match unless we want to upsell (e.g. Solar) if they selected Manual?
        // But our flow forced a single opening type.
        // So we just show the one valid product for the selected opening + size.

        // Find the product that matches the ID(s) we have in `validProducts`.
        const results = validProducts.filter(p => p.compatibleSizes.includes(selection.sizeCode!));

        return (
            <div className="space-y-6">
                {results.map((p) => {
                    const price = p.prices[selection.sizeCode!];
                    const sizeObj = (isFlatRoof ? FLAT_SIZES : PITCHED_SIZES).find(s => s.code === selection.sizeCode);

                    return (
                        <Card key={p.id} className="cursor-pointer hover:ring-2 ring-primary transition-all" onClick={() => handleProductSelect(p.id)}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold">{p.name}</h3>
                                    <p className="text-muted-foreground">Size: {selection.sizeCode} ({sizeObj?.label}mm)</p>
                                    <ul className="mt-2 text-sm space-y-1">
                                        <li>✅ {p.openingType === 'fixed' ? 'Fixed' : p.openingType === 'solar' ? 'Solar Powered' : `${p.openingType.charAt(0).toUpperCase() + p.openingType.slice(1)} Opening`}</li>
                                        <li>✅ Compatible with {selection.roofType} roof</li>
                                    </ul>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">${price}</div>
                                    <Button size="sm" className="mt-2">Select</Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderBlindsStep = () => {
        // Filter blinds based on selected product model
        const product = PRODUCTS.find(p => p.id === selection.selectedProduct);
        if (!product) return null;

        const availableBlinds = BLINDS.filter(b => b.compatibleModels.includes(product.model) && b.prices[selection.sizeCode!]);

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableBlinds.map((b) => {
                        const price = b.prices[selection.sizeCode!];
                        return (
                            <Card key={b.id} className="cursor-pointer hover:border-primary transition-all" onClick={() => handleBlindSelect(b.id)}>
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                                    <h3 className="text-lg font-bold mb-2">{b.name} ({b.model})</h3>
                                    <p className="text-muted-foreground text-sm mb-4 capitalize">{b.type}</p>
                                    <div className="text-xl font-bold text-primary">+${price}</div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    <Card className="cursor-pointer hover:border-primary transition-all flex items-center justify-center" onClick={() => handleBlindSelect(null)}>
                        <CardContent className="p-6 text-center">
                            <h3 className="text-lg font-bold mb-2">No Blinds</h3>
                            <p className="text-muted-foreground text-sm">Proceed without adding blinds</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const renderSummaryStep = () => {
        const product = PRODUCTS.find(p => p.id === selection.selectedProduct);
        const size = (isFlatRoof ? FLAT_SIZES : PITCHED_SIZES).find(s => s.code === selection.sizeCode);
        const blind = BLINDS.find(b => b.id === selection.selectedBlind);

        // Auto calculate price
        const basePrice = product?.prices[selection.sizeCode!] || 0;
        const blindPrice = blind ? (blind.prices[selection.sizeCode!] || 0) : 0;

        // Flashing - Modified logic for itemized display
        let flashingPrice = 0;
        let flashingName = '';

        if (selection.roofPitch === 'pitched') {
            // Technically EDW is for Tile/Corrugated. But "Wide Metal" uses custom.
            if (selection.roofMaterial === 'tiled-corrugated') {
                flashingPrice = FLASHINGS.prices[selection.sizeCode!] || 0;
                flashingName = `EDW ${selection.sizeCode} Flashing (Tile/Corrugated)`;
            } else {
                flashingName = 'Custom Flashing Required (Not Included)';
            }
        } else {
            // Flat roof
            flashingName = 'Custom Curb Flashing Required (Not Included)';
        }

        // Accessory Logic (ZZZ 199 for Flat Roof Blinds)
        let accessoryPrice = 0;
        let accessoryName = '';
        if (isFlatRoof && blind && selection.sizeCode) {
            const zzz199 = ACCESSORIES.find(a => a.id === 'zzz199');
            if (zzz199) {
                const prices = zzz199.prices as Record<string, number>;
                if (prices[selection.sizeCode]) {
                    accessoryPrice = prices[selection.sizeCode];
                    accessoryName = `ZZZ 199 ${selection.sizeCode} Blind Tray`;
                }
            }
        }

        const total = basePrice + flashingPrice + blindPrice + accessoryPrice;

        return (
            <div className="space-y-6">
                <div id="summary-card" className="bg-white p-8 rounded-xl border shadow-sm">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Check className="w-6 h-6 text-green-600" /> Great Selection
                    </h2>

                    <div className="space-y-4 text-sm md:text-base">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Product</span>
                            <span className="font-medium text-right">{product?.name} ({selection.sizeCode})</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Size</span>
                            <span className="font-medium text-right">{selection.sizeCode} ({size?.label} mm)</span>
                        </div>

                        {/* Itemized Costs */}
                        <div className="py-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{product?.model} {selection.sizeCode} Skylight</span>
                                <span>${basePrice}</span>
                            </div>
                            {flashingPrice > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>{flashingName}</span>
                                    <span>${flashingPrice}</span>
                                </div>
                            )}
                            {blind && (
                                <div className="flex justify-between text-sm">
                                    <span>{blind.model} {selection.sizeCode} {blind.name}</span>
                                    <span>${blindPrice}</span>
                                </div>
                            )}
                            {accessoryPrice > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span>{accessoryName}</span>
                                    <span>${accessoryPrice}</span>
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="mt-8 pt-4 border-t flex justify-between items-center bg-gray-50 -mx-8 -mb-8 p-8">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Estimate (RRP)</p>
                            <p className="text-3xl font-bold text-primary">${total}</p>
                        </div>
                        <Button onClick={handleExportPDF}>Export Summary</Button>
                    </div>
                </div>

                <Button variant="ghost" className="w-full" onClick={reset}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Start Over
                </Button>
            </div>
        );
    };

    const currentTitle = () => {
        switch (step) {
            case 'pitch': return 'Is your roof pitched or flat?';
            case 'material': return 'What is the roof material?';
            case 'opening': return 'How should the skylight open?';
            case 'truss': return 'What is your truss/rafter spacing?';
            case 'size': return 'Select Skylight Size';
            case 'results': return 'Recommended Skylights';
            case 'blinds': return 'Do you require blinds?';
            case 'summary': return 'Selection Summary';
            default: return '';
        }
    };



    return (
        <div className="max-w-2xl mx-auto w-full min-h-screen py-10 px-4 flex flex-col font-sans">
            {/* Header - Minimalist */}
            <div className="mb-12 text-center">
                <img src="/velux logo.svg" alt="VELUX" className="h-16 mx-auto mb-2" />
            </div>

            {/* Step Title - clean */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                {/* Back Button */}
                {step !== 'pitch' && (
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={backStep}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                )}

                <h1 className="text-3xl font-light text-gray-900 mb-2">{currentTitle()}</h1>
                <div className="h-1 w-20 bg-primary mb-6"></div>
            </motion.div>
            {/* Content */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 'pitch' && renderPitchStep()}
                        {step === 'material' && renderMaterialStep()}
                        {step === 'opening' && renderOpeningStep()}
                        {step === 'truss' && renderTrussStep()}
                        {step === 'size' && renderSizeStep()}
                        {step === 'results' && renderResultsStep()}
                        {step === 'blinds' && renderBlindsStep()}
                        {step === 'summary' && renderSummaryStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
