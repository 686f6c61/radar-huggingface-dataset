# tarekziade/Qwen3.8-Flash-Next-expert-streaming

## Resumen

Qwen3.8-Flash-Next-expert-streaming es una conversión del modelo Qwen/Qwen3.8-Flash-Next-FP8, publicada por tarekziade, orientada a la inferencia en hardware con memoria unificada limitada mediante la técnica de streaming de expertos desde SSD. El objetivo es permitir que un modelo de arquitectura MoE de gran tamaño funcione en un Mac de 32 GB de RAM, descargando bajo demanda los expertos enrutados y la tabla de embeddings n-gram desde el disco en lugar de mantenerlos residentes en memoria. La conversión se realizó con la herramienta moe-expert-streaming, que separa los pesos en tres componentes: la parte densa en BF16, los expertos enrutados en 3 bits MLX affine y la tabla n-gram en FP8.

El repositorio pesa 114 GB y no registra descargas ni interacciones en el momento de la consulta, lo que lo sitúa como un artefacto experimental más que como una distribución de producción. La licencia aplicada es la Qwen Community License 1.0, heredada del modelo original, por lo que las restricciones de uso comercial son las del modelo base. Es relevante ahora porque explora una vía práctica para ejecutar MoE grandes en equipos consumer con Apple Silicon, un escenario tradicionalmente inviable por la huella de memoria de los expertos.

No se dispone de información sobre el pipeline, los idiomas soportados ni los parámetros totales o activos del modelo base en la documentación proporcionada. La ficha se limita a los datos verificables del repositorio y de su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con tabla de embeddings n-gram; conversión para streaming de expertos |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en 3 bits MLX affine (group size 64); parte densa en BF16 (opción dense_bits=8 en la API); tabla n-gram en FP8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (repositorio con directorios dense/, experts-q3/ y ngram/) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 48 capas y 512 expertos enrutados por capa, según la descripción del directorio `experts-q3/` (48 × 512 expertos). La conversión no reentrena el modelo: transforma los pesos FP8 originales a un formato apto para streaming desde SSD. El repositorio separa tres componentes: `dense/`, que contiene todo excepto los expertos enrutados y la tabla n-gram, en BF16 (9,2 GB); `experts-q3/`, con los 48 × 512 expertos en 3 bits MLX affine con group size 64 (49 GB); y `ngram/`, la tabla de embeddings n-gram en FP8 (48 GB, dividida en 4 shards alineados por filas y leída del disco fila a fila).

La innovación técnica es el streaming de expertos: en lugar de mantener todos los expertos en memoria, el runtime los carga bajo demanda desde el almacenamiento, con una caché configurable (`cache_gib=12` en el ejemplo de la model card). La API de carga (`load_qwen38`) permite ajustar la caché en GiB y los bits de la parte densa. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no se detallan en la información disponible.
- Ejecución en memoria limitada: el diseño permite cargar un MoE de gran tamaño en un Mac de 32 GB mediante streaming de expertos desde SSD.
- Componente n-gram: incluye una tabla de embeddings n-gram leída desde disco, lo que sugiere soporte de algún mecanismo de recuperación o modelado n-gram, sin más detalle disponible.
- Tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: un desarrollador con un Mac de 32 GB puede ejecutar el modelo cargando los expertos desde SSD con una caché de 12 GiB, lo que permite probar un MoE grande sin acceso a GPUs de datacenter.
- Prototipado e investigación de MoE: el repositorio separa densa, expertos y n-gram, lo que facilita estudiar el comportamiento del enrutamiento y el impacto de la cuantización a 3 bits en la calidad.
- Evaluación de técnicas de streaming: sirve como banco de pruebas para medir latencia y throughput del streaming de expertos frente a la carga completa en memoria.
- Despliegue en entornos con poca VRAM: al no requerir que todos los expertos estén residentes, se puede usar en estaciones de trabajo con memoria unificada o VRAM modesta, aceptando el coste de E/S de disco.
- Experimentación con cuantización MLX: los expertos en 3 bits affine con group size 64 permiten comparar la degradación de calidad frente a FP8 o BF16 en tareas concretas.
- Docencia y demostraciones: permite mostrar el funcionamiento interno de un MoE con expertos enrutados y tabla n-gram en un equipo de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 114 GB; con `cache_gib=12` el runtime mantiene 12 GiB de caché de expertos, además de la parte densa (9,2 GB en BF16) y la tabla n-gram leída bajo demanda.
- Hardware objetivo declarado: Mac de 32 GB de memoria unificada (Apple Silicon).
- GPU recomendadas: no disponible; el diseño está orientado a Apple Silicon con MLX, no a GPUs NVIDIA.
- ¿Cabe en consumer GPU? No hay datos para GPUs consumer; el caso documentado es Apple Silicon con 32 GB.
- Opciones de despliegue: librería `moe_expert_streaming` (función `load_qwen38`), con descarga vía `huggingface_hub.snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tarekziade/Qwen3.8-Flash-Next-expert-streaming | no disponible | no disponible | 3 bits MLX (expertos), BF16 (densa), FP8 (n-gram) | qwen-community-1.0 | Hugging Face, 114 GB |
| Qwen/Qwen3.8-Flash-Next-FP8 (base) | no disponible | no disponible | FP8 | qwen-community-1.0 | Hugging Face |
| Otras conversiones de Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base para una comparación cuantitativa.

## Limitaciones y advertencias

- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- Calidad de la cuantización a 3 bits: los expertos enrutados se reducen a 3 bits MLX affine, lo que puede degradar la calidad frente al modelo FP8 original; no se han publicado evaluaciones.
- Rendimiento dependiente del disco: el streaming de expertos desde SSD introduce latencia de E/S y puede ser inviable en almacenamiento lento.
- Modelo base no verificado: no se dispone de información sobre sesgos, alucinación, contexto o idiomas del modelo Qwen3.8-Flash-Next.
- Licencia restrictiva: Qwen Community License 1.0, con posibles condiciones para uso comercial; es necesario revisar el archivo LICENSE.
- Uso experimental: la model card no documenta garantías de producción ni soporte.
- Dependencia de la librería `moe_expert_streaming` y de un PR de transformers aún no fusionado (huggingface/transformers#50717), lo que puede implicar incompatibilidades.

## Enlaces

- Hugging Face: https://huggingface.co/tarekziade/Qwen3.8-Flash-Next-expert-streaming
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio de la herramienta: https://github.com/tarekziade/moe-expert-streaming
- Blog post: https://huggingface.co/blog/moe-expert-streaming
- Pull request de transformers: https://github.com/huggingface/transformers/pull/50717
