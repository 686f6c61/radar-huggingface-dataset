# Trendyol/Trendyol-Vision-Flash

## Resumen

Trendyol-Vision-Flash es un modelo de lenguaje y visión (VLM) desarrollado por Trendyol, la plataforma de comercio electrónico turca, como parte de su familia de modelos para operaciones de catálogo. Se trata de un ajuste fino (fine-tuning) completo del modelo base OpenGVLab/InternVL3_5-1B-Instruct, especializado en tareas de moderación y enriquecimiento de catálogo: detección de marca, similitud de productos, extracción de atributos, generación de títulos, moderación de contenido y subtitulado de productos. Está diseñado como la variante "Flash" de producción, optimizada para servir bajo alta carga con baja latencia en una sola GPU.

El modelo combina un vision transformer (InternViT-300M) con un backbone de lenguaje Qwen3-0.6B, sumando 1.060.897.792 parámetros en total. Acepta hasta 16 imágenes por prompt y trabaja con texto en turco (idioma principal) e inglés (secundario). Su licencia es CC-BY-4.0, lo que permite uso comercial con atribución. La relevancia actual radica en que aborda un problema concreto y de alto volumen en el comercio electrónico: la gestión automatizada de catálogos con modelos ligeros que pueden desplegarse en infraestructura estándar, sin necesidad de clústeres de GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5-1B (InternViT-300M + Qwen3-0.6B LLM backbone) |
| Parametros totales | 1.060.897.792 (1,06B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | bfloat16 (usado en el ejemplo oficial); safetensors en precision nativa |
| Idiomas soportados | Turco (primario), ingles (secundario) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura InternVL3.5-1B, que combina un codificador visual InternViT de 300M de parametros con un modelo de lenguaje Qwen3 de 0,6B. El vision transformer procesa imagenes redimensionadas a 448x448 píxeles con normalizacion ImageNet, y las representaciones visuales se proyectan al espacio del LLM para generar respuestas de texto. El entrenamiento consistio en un ajuste fino supervisado (full SFT) sobre datos multimodales del catalogo de Trendyol, sin que se mencione el uso de RLHF o DPO. No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset. La innovacion principal no esta en la arquitectura, sino en la especializacion: el modelo esta calibrado para tareas especificas de comercio electronico, con plantillas de prompt optimizadas para cada caso de uso.

## Capacidades

- Deteccion de marca: infiere la marca de un producto a partir de imagenes, con contexto opcional de categoria.
- Similitud de productos: determina si dos anuncios (imagenes y titulos) corresponden al mismo SKU.
- Extraccion de atributos estructurados: obtiene atributos del producto desde imagen y titulo/descripcion.
- Generacion de titulos: produce un titulo de catalogo limpio a partir de la imagen y un titulo de referencia.
- Subtitulado de productos: genera una descripcion fundamentada en la imagen y metadatos opcionales.
- Clasificacion de seguridad de contenido: clasifica imagen y titulo en tres categorias (0 = Prohibido, 1 = Fantasia, 2 = Seguro), donde "Fantasia" indica contenido publicable pero para mayores de 18.
- Extraccion de cantidad por paquete: extrae la cantidad y unidad de empaque desde imagen y titulo largo.
- Soporte multimodal: acepta hasta 16 imagenes por prompt junto con texto.
- Capacidades multilingues: turco e ingles, con mejor rendimiento en turco.

No se menciona soporte de tool calling, function calling, ni modo de razonamiento explicito. Tampoco se indica capacidad de agentes o multi-step reasoning mas alla de las tareas de catalogo.

## Casos de uso

- Moderacion de catalogos a gran escala: el modelo clasifica contenido como prohibido, fantasia o seguro, permitiendo a plataformas de e-commerce filtrar anuncios que violan politicas de contenido antes de su publicacion. Su baja latencia en una sola GPU lo hace apto para procesar millones de imagenes diarias.
- Deteccion de marca en listados: dado un conjunto de imagenes de producto y la categoria, el modelo extrae la marca, lo que permite verificar que los vendedores no usen marcas falsas o no autorizadas. Es util en mercados con alta rotacion de inventario.
- Deduplicacion de SKUs: comparando dos anuncios (imagenes y titulos), el modelo decide si representan el mismo producto, ayudando a consolidar listados duplicados y mejorar la experiencia de busqueda.
- Enriquecimiento de atributos: extrae atributos estructurados (color, material, talla, etc.) desde imagenes y descripciones, alimentando sistemas de filtrado y recomendacion sin intervencion manual.
- Generacion de titulos de catalogo: a partir de una imagen y un titulo de referencia, produce un titulo limpio y consistente, reduciendo errores de los vendedores y mejorando el SEO interno de la plataforma.
- Subtitulado automatico de productos: genera descripciones fundamentadas en la imagen, util para vendedores que no disponen de textos de calidad o para completar fichas incompletas.
- Extraccion de cantidad por paquete: en categorias como alimentacion o limpieza, extrae cuantas unidades vienen en el paquete desde la imagen y el titulo, un dato critico para la logistica y la comparacion de precios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El unico dato de rendimiento es cualitativo: "baja latencia en una sola GPU bajo carga de produccion", sin cifras concretas de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: con 1,06B parametros en bfloat16, los pesos ocupan aproximadamente 2,1 GB. Sumando activaciones, el vision transformer y el overhead del runtime, se estima un consumo de 4-6 GB de VRAM para inferencia con una sola imagen. Con 16 imagenes, la demanda puede superar los 8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060/4060, RTX 4070, o GPUs de datacenter como A10 o L4. Para produccion con alta concurrencia, se recomienda A100 o H100, aunque no es estrictamente necesario.
- Compatibilidad con GPUs de consumo: si, cabe en GPUs consumer de gama media con 8 GB o mas, siempre que se use bfloat16 o cuantizacion adicional.
- Opciones de despliegue: el ejemplo oficial usa transformers con `trust_remote_code=True` y la API `model.chat()`. Es compatible con vLLM y TGI si soportan InternVL3.5, aunque no esta confirmado en la documentacion. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras concretas. Dado el tamano del modelo, se espera una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Trendyol-Vision-Flash | 1,06B | no disponible | tr, en | CC-BY-4.0 | Catalog operations (moderacion, atributos, marcas) |
| Trendyol-Vision-Master | no disponible | no disponible | tr, en | no disponible | Catalog operations (categoria, casos dificiles) |
| OpenGVLab/InternVL3_5-1B-Instruct | 1,06B | no disponible | multilingue | MIT (probable) | VLM generalista |

La comparativa se limita a aspectos estructurales porque no hay datos de rendimiento publicados. Flash es la variante ligera de produccion, mientras que Master es el modelo experto para casos criticos como deteccion de categoria. El modelo base InternVL3.5-1B es un VLM generalista, mientras que Flash esta especializado en tareas de catalogo, sacrificando capacidades generales por precision en su dominio.

## Limitaciones y advertencias

- No apto para deteccion de categoria: la documentacion indica explicitamente que para esta tarea se debe usar Trendyol-Vision-Master. Usar Flash para categorizacion puede producir resultados suboptimos.
- No es un chatbot de proposito general: esta optimizado para flujos de trabajo de catalogo, no para conversacion abierta ni asistencia general.
- Sesgos potenciales: entrenado con datos del catalogo de Trendyol, predominantemente turco, puede tener sesgos hacia productos, marcas y estilos de la region. El rendimiento en ingles puede ser inferior al de turco.
- Riesgo de alucinacion: como cualquier VLM, puede inventar atributos o marcas si la imagen no es concluyente. El prompt oficial incluye la instruccion de responder "Unknown" cuando no hay certeza, pero no elimina el riesgo.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de 0,6B de lenguaje, es probable que tenga una ventana limitada (tipicamente 32K tokens en Qwen3, pero no confirmado). Con 16 imagenes, el contexto visual puede consumir gran parte de la ventana.
- Licencia CC-BY-4.0: permite uso comercial, pero requiere atribucion al autor. Es necesario revisar los terminos completos de la licencia para cumplir con las obligaciones de atribucion.
- Dependencia de codigo personalizado: el modelo requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del repositorio. En entornos de produccion, esto exige una revision de seguridad del codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Trendyol/Trendyol-Vision-Flash
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-1B-Instruct
- Modelo Master (companero de la familia): https://huggingface.co/Trendyol/Trendyol-Vision-Master
