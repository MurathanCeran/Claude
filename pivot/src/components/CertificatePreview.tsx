'use client';

type CertificatePreviewProps = {
    ceoName: string;
    elementId?: string;
    className?: string;
};

export const CertificatePreview = ({
    ceoName,
    elementId = 'pivot-certificate',
    className = '',
}: CertificatePreviewProps) => {
    return (
        <div
            id={elementId}
            className={`relative w-full aspect-[842/595] bg-[#F8F4EB] overflow-hidden [container-type:inline-size] ${className}`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/certificate-template.svg"
                alt="Pivot Başarı Sertifikası"
                className="absolute inset-0 w-full h-full object-contain"
                crossOrigin="anonymous"
            />

            <p
                className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 w-[75%] text-center font-serif font-bold text-[#2D8686] leading-none pointer-events-none"
                style={{ fontSize: 'clamp(18px, 4.5cqw, 40px)' }}
            >
                {ceoName}
            </p>
        </div>
    );
};
