import apiClient from './apiClient';
import {
    Producto,
    ProductoConPrecios,
    ProductoFiltros,
    ApiResponse,
    ApiListResponse,
} from './types';

class ProductosService {
    // Obtener productos con filtros
    async obtenerProductos(filtros: ProductoFiltros = {}): Promise<{
        productos: Producto[];
        pagination?: any;
    }> {
        try {
            const params = new URLSearchParams();

            if (filtros.categoria) params.append('categoria', filtros.categoria);
            if (filtros.marca) params.append('marca', filtros.marca);
            if (filtros.disponible !== undefined) params.append('disponible', filtros.disponible.toString());
            if (filtros.limite) params.append('limite', filtros.limite.toString());
            if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
            if (filtros.buscar) params.append('buscar', filtros.buscar);

            const response = await apiClient.get<ApiListResponse<Producto>>(`/productos?${params.toString()}`);

            return {
                productos: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw error;
        }
    }

    // Obtener producto por ID
    async obtenerProductoPorId(id: string): Promise<ProductoConPrecios> {
        try {
            const response = await apiClient.get<ApiResponse<ProductoConPrecios>>(`/productos/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo producto por ID:', error);
            throw error;
        }
    }

    // Crear nuevo producto
    async crearProducto(producto: Omit<Producto, '_id' | 'createdAt' | 'updatedAt'>): Promise<Producto> {
        try {
            const response = await apiClient.post<ApiResponse<Producto>>('/productos', producto);
            return response.data.data;
        } catch (error) {
            console.error('Error creando producto:', error);
            throw error;
        }
    }

    // Actualizar producto
    async actualizarProducto(id: string, producto: Partial<Producto>): Promise<Producto> {
        try {
            const response = await apiClient.put<ApiResponse<Producto>>(`/productos/${id}`, producto);
            return response.data.data;
        } catch (error) {
            console.error('Error actualizando producto:', error);
            throw error;
        }
    }

    // Eliminar producto
    async eliminarProducto(id: string): Promise<void> {
        try {
            await apiClient.delete(`/productos/${id}`);
        } catch (error) {
            console.error('Error eliminando producto:', error);
            throw error;
        }
    }

    // Obtener cotización de un producto
    async obtenerCotizacionProducto(id: string): Promise<ProductoConPrecios> {
        try {
            const response = await apiClient.get<ApiResponse<ProductoConPrecios>>(`/productos/${id}/cotizar`);
            return response.data.data;
        } catch (error) {
            console.error('Error obteniendo cotización del producto:', error);
            throw error;
        }
    }

    // Buscar productos por texto
    async buscarProductos(texto: string, limite: number = 10): Promise<Producto[]> {
        try {
            const { productos } = await this.obtenerProductos({
                buscar: texto,
                limite,
                disponible: true,
            });
            return productos;
        } catch (error) {
            console.error('Error buscando productos:', error);
            throw error;
        }
    }

    // Obtener productos por categoría
    async obtenerProductosPorCategoria(categoriaId: string, limite: number = 20): Promise<Producto[]> {
        try {
            const { productos } = await this.obtenerProductos({
                categoria: categoriaId,
                limite,
                disponible: true,
            });
            return productos;
        } catch (error) {
            console.error('Error obteniendo productos por categoría:', error);
            throw error;
        }
    }

    // Obtener marcas únicas
    async obtenerMarcas(): Promise<string[]> {
        try {
            const { productos } = await this.obtenerProductos({ limite: 1000 });
            const marcasUnicas = [...new Set(productos.map(p => p.marca).filter(Boolean))];
            return marcasUnicas.sort();
        } catch (error) {
            console.error('Error obteniendo marcas:', error);
            throw error;
        }
    }

    // Obtener marcas por categoría
    async obtenerMarcasPorCategoria(categoriaId: string): Promise<string[]> {
        try {
            const { productos } = await this.obtenerProductos({
                categoria: categoriaId,
                limite: 1000
            });
            const marcasUnicas = [...new Set(productos.map(p => p.marca).filter(Boolean))];
            return marcasUnicas.sort();
        } catch (error) {
            console.error('Error obteniendo marcas por categoría:', error);
            throw error;
        }
    }

    // Obtener productos por categoría y marca
    async obtenerProductosPorCategoriaYMarca(categoriaId: string, marca: string): Promise<Producto[]> {
        try {
            const { productos } = await this.obtenerProductos({
                categoria: categoriaId,
                marca: marca,
                limite: 1000
            });
            return productos;
        } catch (error) {
            console.error('Error obteniendo productos por categoría y marca:', error);
            throw error;
        }
    }
}

export default new ProductosService();
