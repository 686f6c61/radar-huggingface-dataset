# TencentARC/Pixal3D

## Resumen

Pixal3D es un modelo de generacion de activos 3D de alta fidelidad a partir de una sola imagen, desarrollado por Tencent ARC Lab en colaboracion con la Universidad de Tsinghua y la Universidad Victoria de Wellington. Su propuesta principal consiste en establecer correspondencias directas pixel-a-3D mediante back-projection de caracteristicas de imagen, en lugar de inyectar caracteristicas de forma laxa mediante atencion como hacen los metodos anteriores. Esto permite alcanzar una fidelidad cercana a la reconstruccion, con geometria detallada y texturas PBR (Physically Based Rendering). El trabajo ha sido aceptado en SIGGRAPH 2026 y el codigo, el entrenamiento y la demostracion online estan publicados bajo licencia MIT.

El modelo se presenta en dos ramas: la rama principal (`main`) esta basada en el backbone Trellis.2 de Microsoft, mientras que la rama `paper` reproduce los resultados del articulo original usando Direct3D-S2. La arquitectura es un pipeline en cascada de tres etapas que genera primero una estructura sparse, luego la forma y finalmente la textura, cada una con resoluciones progresivamente mayores. El repositorio ocupa 24 GB, aunque no se especifican los parametros totales del modelo. La demostracion esta disponible en Hugging Face Spaces y el codigo de inferencia permite generar un archivo GLB desde una imagen con un solo comando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en cascada de tres etapas (estructura sparse, forma y textura) con backbone Trellis.2 (rama main) o Direct3D-S2 (rama paper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de imagen a 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imagen, sin texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuyen via repositorio de 24 GB) |

## Arquitectura y entrenamiento
Pixal3D se entrena como una cascada de tres etapas, cada una con resoluciones progresivas. La primera etapa genera una estructura sparse (resoluciones 32 y 64), la segunda produce la forma (256, 512 y 1024) y la tercera genera la textura (256, 512 y 1024). Todas las etapas usan caracteristicas pixel-alineadas mediante proyeccion, lo que establece una correspondencia directa entre los pixeles de la imagen de entrada y las coordenadas 3D del volumen. Esta es la innovacion clave frente a metodos que inyectan caracteristicas de imagen mediante atencion, que resultan en una correspondencia mas debil.

El entrenamiento se realiza con datos preparados mediante un kit de herramientas de datos que genera volumenes O-Voxel alineados con la vista y imagenes de condicion renderizadas. No se han publicado datos sobre el numero de tokens de entrenamiento, el dataset exacto ni el uso de tecnicas de refuerzo como RLHF o DPO. La implementacion de la rama `main` se basa en Trellis.2, mientras que la rama `paper` corresponde a la implementacion original sobre Direct3D-S2, que es la que reproduce los resultados reportados en el articulo de SIGGRAPH.

## Capacidades
- Generacion de mallas 3D (formato GLB) a partir de una sola imagen de entrada.
- Produccion de texturas PBR (Physically Based Rendering) con materiales realistas.
- Soporte de resoluciones de pipeline configurables: 1536 (modo estandar) y 1024 (modo low-VRAM).
- Capacidad de generacion en cascada con resoluciones progresivas para estructura, forma y textura.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling, agentes ni razonamiento multimodal en ese sentido.
- No se indica soporte para video, audio ni otras modalidades.

## Casos de uso
- Diseño de productos y prototipado: generar un modelo 3D de un producto a partir de una fotografia, util para evaluar disenos preliminares o crear assets para catalogos virtuales.
- Videojuegos y entornos virtuales: crear assets 3D para juegos o experiencias de realidad virtual a partir de referencias visuales, acelerando el pipeline de produccion.
- Comercio electronico: convertir imagenes de productos en modelos 3D interactivos que los clientes puedan rotar y examinar en la web.
- Animacion y cine: generar modelos base para personajes o objetos que luego se refinan con herramientas de modelado tradicionales.
- Arquitectura y diseno de interiores: a partir de una fotografia de un espacio o mueble, obtener un modelo 3D para visualizaciones o planos.
- Educacion y formacion: crear modelos 3D de objetos de estudio (anatomicos, mecanicos, etc.) a partir de imagenes de referencia.
- Realidad aumentada: generar objetos 3D para aplicaciones de AR a partir de fotos de productos o elementos del entorno.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El repositorio no especifica VRAM minima ni GPUs recomendadas.
- Se ofrece un modo `--low_vram` que reduce el pico de VRAM cargando los modelos bajo demanda, aunque la resolucion por defecto baja a 1024 en ese modo.
- El modo estandar utiliza una resolucion de pipeline de 1536.
- Se requiere CUDA y la instalacion de la libreria `natten` (con arquitectura CUDA especifica) y `utils3d`.
- Se puede usar el backend SDPA de PyTorch si no se tiene `flash_attn` instalado.
- El tamaño del repositorio es de 24 GB, lo que sugiere que los pesos son voluminosos y necesitan una GPU con VRAM considerable (probablemente 24 GB o mas, aunque no se confirma).

## Comparativa con modelos similares
No se dispone de datos comparativos con modelos alternativos como Trellis.2 o Direct3D-S2 en la informacion proporcionada. Sin embargo, se sabe que Pixal3D usa como base a Trellis.2 en su rama principal y a Direct3D-S2 en la rama de paper, por lo que comparte la arquitectura subyacente con estos, pero no se pueden dar cifras de rendimiento relativas.

## Limitaciones y advertencias
- La licencia MIT permite uso comercial, pero hay una restriccion: el campo `extra_gated_eu_disallowed: true` indica que el acceso esta prohibido en la Union Europea. Esto es critico para despliegues en Europa.
- El modelo es pesado (24 GB de repositorio) y requiere una GPU potente para una inferencia rapida; el modo low-VRAM reduce la resolucion.
- No se especifican sesgos conocidos ni riesgo de alucinacion, pero al ser un modelo generativo de imagen a 3D, puede producir geometrias o texturas incorrectas cuando la imagen de entrada es ambigua o de baja calidad.
- No se proporcionan datos de rendimiento (benchmarks) ni comparaciones con otros modelos, por lo que es dificil evaluar su calidad objetiva.
- El proceso de instalacion requiere compilar `natten` con arquitectura CUDA especifica, lo que puede ser un obstaculo en entornos no Linux o con GPUs no NVIDIA.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/TencentARC/Pixal3D
- Repositorio de GitHub: https://github.com/TencentARC/Pixal3D
- Pagina del proyecto: https://ldyang694.github.io/projects/pixal3d/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/TencentARC/Pixal3D
- Articulo en arXiv: https://arxiv.org/abs/2605.10922
- Herramienta de datos (data toolkit): https://huggingface.co/TencentARC/Pixal3D (seccion data_toolkit)
