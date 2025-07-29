// Tipos para las entidades del backend

export interface Categoria {
    _id: string;
    nombre: string;
    descripcion?: string;
    icono?: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Producto {
    _id: string;
    categoria: Categoria | string;
    marca: string;
    modelo: string;
    descripcion?: string;
    precioBase: number;
    especificaciones?: Record<string, any>;
    stock: {
        cantidad: number;
        disponible: boolean;
    };
    tags: string[];
    imagenes: string[];
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ProductoConPrecios extends Producto {
    precios: {
        contado: number;
        tresCuotas: {
            total: number;
            cuota: number;
        };
        seisCuotas: {
            total: number;
            cuota: number;
        };
    };
}

export interface DatosContacto {
    nombre: string;
    telefono: string;
    email?: string;
}

export interface ProductoCotizacion {
    producto: string; // ID del producto
    cantidad: number;
    detalles?: {
        categoria: string;
        marca: string;
        modelo: string;
        precioBase: number;
        precios: any;
    };
}

export interface Cotizacion {
    _id: string;
    datosContacto: DatosContacto;
    productos: ProductoCotizacion[];
    modalidadPago: 'contado' | '3-cuotas' | '6-cuotas';
    totales: {
        subtotal: number;
        total: number;
    };
    estado: 'pendiente' | 'enviada' | 'confirmada' | 'cancelada';
    observaciones?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CrearCotizacionData {
    datosContacto: DatosContacto;
    productos: Array<{
        producto: string;
        cantidad: number;
    }>;
    modalidadPago: 'contado' | '3-cuotas' | '6-cuotas';
    observaciones?: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: any[];
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        pagina: number;
        limite: number;
        total: number;
        paginas: number;
    };
    count?: number;
}

// Tipos para filtros y consultas
export interface ProductoFiltros {
    categoria?: string;
    marca?: string;
    disponible?: boolean;
    limite?: number;
    pagina?: number;
    buscar?: string;
}

export interface CotizacionFiltros {
    estado?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    limite?: number;
    pagina?: number;
    buscar?: string;
}

// Tipo para cotización con mensaje de WhatsApp
export interface CotizacionConMensaje {
    mensaje: string;
    telefono: string;
    urlWhatsApp: string;
}
