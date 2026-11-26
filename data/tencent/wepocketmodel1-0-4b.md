# tencent/WePocketModel1.0-4B

## Resumen

WePocketModel 1.0 4B (WePM) es un modelo vision-lenguaje desarrollado por WeChat AI (Tencent) para aplicaciones en dispositivo (on-device). Se trata de una familia de modelos multimodal que comparte un backbone y un codificador visual para cubrir tres capacidades en un único modelo: generación de texto a partir de texto e imágenes, generación de embeddings multimodales y toma de decisiones estructuradas.

El checkpoint de 4B contiene 4.539.265.536 parámetros reales (según safetensors) y se distribuye en formato safetensors con pesos en BF16 para CUDA y FP32 para CPU. El repositorio ocupa 9,2 GB. La arquitectura se etiqueta como `qwen3_5` y emplea una técnica propia denominada Multi-Granularity Visual Budgeting (MGVB) para asignar tokens visuales entre vistas globales, regionales y de grano fino.

Su relevancia actual radica en que unifica en un solo modelo tareas que habitualmente requieren modelos separados (generación, retrieval y clasificación estructurada), con soporte de Matryoshka Representation Learning (MRL) para embeddings de 64 a 2048 dimensiones y una licencia Apache 2.0 permisiva. Está diseñado para ejecutarse localmente, tanto en GPU como en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`) con codificador visual compartido y cabezas separadas de embedding y decisión |
| Parametros totales | 4.539.265.536 (4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en BF16 (CUDA) y FP32 (CPU); existe variante GGUF publicada en `tencent/WePocketModel1.0-4B-GGUF` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards + `unimodel_aux.safetensors`); GGUF disponible en repo aparte |

## Arquitectura y entrenamiento

WePocketModel emplea un backbone compartido junto con un codificador visual que da servicio a tres capacidades diferenciadas. La innovación técnica principal es Multi-Granularity Visual Budgeting (MGVB), que distribuye los tokens visuales entre vistas global, regional y de grano fino para equilibrar coste computacional y detalle. El runtime utiliza slots aprendidos separados para las tareas de embedding y decisión, lo que permite reconciliar tareas heterogéneas dentro de un mismo modelo.

Para los embeddings multimodales se aplica Matryoshka Representation Learning (MRL), de modo que el modelo puede producir vectores L2-normalizados de 64, 128, 256, 512, 1024 o 2048 dimensiones seleccionando el prefijo correspondiente de la proyección. El checkpoint de 4B tiene una dimensión de embedding completa de 2048. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto a partir de texto, imágenes o entradas intercaladas texto-imagen.
- OCR y captioning de imágenes.
- Respuesta visual a preguntas (VQA).
- Embeddings multimodales L2-normalizados para retrieval y ranking de candidatos, con dimensiones configurables de 64 a 2048 mediante MRL.
- Toma de decisiones estructuradas: devuelve opciones discretas, puntuaciones ordinales o juicios binarios a partir del estado de la aplicación y una pregunta.
- Procesamiento de entradas multimodales intercaladas.
- Ejecución en dispositivo, tanto en GPU (CUDA) como en CPU.
- No se documenta en la información disponible soporte explícito de tool calling, agentes multi-paso, audio ni modo de razonamiento extendido.

## Casos de uso

- Búsqueda visual y recuperación multimodal: el modelo genera embeddings de imágenes y texto en un mismo espacio vectorial, lo que permite construir índices de retrieval local con dimensiones reducidas (por ejemplo, 256) para ahorrar memoria y latencia.
- Deduplicación y ranking de candidatos en aplicaciones móviles: usando los embeddings L2-normalizados se pueden ordenar resultados de búsqueda o filtrar imágenes duplicadas sin salir del dispositivo.
- Accesibilidad en dispositivo: descripción automática de imágenes (captioning) y OCR para lectura de documentos o carteles en tiempo real, ejecutándose localmente en CPU o GPU.
- Asistentes de galería fotográfica: etiquetado y búsqueda semántica de fotos mediante embeddings multimodales, con la ventaja de que los datos no abandonan el dispositivo.
- Automatización de decisiones en aplicaciones: el modo de decisión estructurada permite evaluar el estado de la app y devolver una opción, una puntuación ordinal o un juicio binario para disparar acciones, previa validación del desarrollador.
- Verificación visual de formularios o documentos: combinando OCR y decisión estructurada se puede comprobar si un documento cumple ciertos criterios y devolver un resultado booleano o categórico.
- Moderación de contenido local: clasificación de imágenes y texto mediante las cabezas de decisión para filtrar contenido antes de enviarlo a un servidor.

## Benchmarks y rendimiento

La model card referencia una imagen comparativa de resultados de la familia WePM en tareas de embedding, generación y decisión, pero no se incluyen cifras numéricas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el proyecto recomienda al menos 16 GB de memoria GPU para inferencia en CUDA (BF16). El uso real depende de las entradas, del número de tokens generados y del overhead del runtime.
- CPU: se recomiendan al menos 24 GiB de memoria de sistema para inferencia en CPU (FP32).
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con 16 GB o más de VRAM debería ser suficiente para el checkpoint de 4B en BF16.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo concretas; una GPU con 16 GB o más de VRAM (por ejemplo, gama alta reciente) cumple el requisito declarado de memoria, pero no se detalla rendimiento.
- Opciones de despliegue: runtime propio de WePM (`inference/infer.py` para GPU y `inference/infer_cpu.py` para CPU), con soporte de checkpoint local; existe variante GGUF para despliegues con llama.cpp u otros runtimes compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la información proporcionada. A nivel de especificaciones:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| WePocketModel 1.0 4B | 4,54B | no disponible | Apache 2.0 | Multimodal unificado (generación + embedding + decisión), on-device |
| WePocketModel 1.0 2B | no disponible (variante 2B) | no disponible | Apache 2.0 | Misma familia, menor tamaño |
| Alternativas de 4B multimodal | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información disponible modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado por un tercero, se recomienda evaluar sesgos en el dominio de aplicación.
- Riesgo de alucinación inherente a la generación de texto; el autor recomienda validar las decisiones estructuradas antes de usarlas para disparar acciones.
- El autor indica explícitamente que los desarrolladores deben evaluar la calidad de salida en entradas representativas.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- No se documenta la longitud de contexto, lo que limita la planificación de casos con entradas largas.
- La memoria de despliegue real incluye activaciones, caché KV y overhead del framework, además del peso en BF16.
- Licencia Apache 2.0: permite uso comercial, pero el código de inferencia y los pesos deben verificarse por separado en sus respectivos repositorios.
- El modelo está orientado a aplicaciones locales; no se detallan garantías de calidad para despliegues en servidor a gran escala.

## Enlaces

- Hugging Face (4B safetensors): https://huggingface.co/tencent/WePocketModel1.0-4B
- Hugging Face (4B GGUF): https://huggingface.co/tencent/WePocketModel1.0-4B-GGUF
- Hugging Face (2B safetensors): https://huggingface.co/tencent/WePocketModel1.0-2B
- Hugging Face (2B GGUF): https://huggingface.co/tencent/WePocketModel1.0-2B-GGUF
- Repositorio GitHub: https://github.com/Tencent/WePocketModel
- Guía de ejemplos: https://github.com/Tencent/WePocketModel/blob/main/examples/README.md
- Guía de inferencia: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md
- Instalación en CPU: https://github.com/Tencent/WePocketModel/blob/main/inference/README.md#installation
- Arquitectura: https://github.com/Tencent/WePocketModel#reconciling-conflicts-in-a-unified-model
- Hardware y precisión (4B): https://github.com/Tencent/WePocketModel#hardware-and-precision-4b
- Metodología de memoria y evaluación: https://github.com/Tencent/WePocketModel#heterogeneous-capability-density-hcd
- Paper (arXiv): https://arxiv.org/abs/2611.27365
