# wiltodelta/raiw-photo-classify

## Resumen

`raiw-photo-classify` es un clasificador de imágenes desarrollado por wiltodelta, integrado en el ecosistema `remove-ai-watermarks`. Su propósito es doble: primero determina si una fotografía es generada por IA o capturada con cámara, y en caso de ser IA, intenta atribuir el proveedor (OpenAI, Google, Muse Image o TC260). Está basado en un fine-tune de `openai/clip-vit-large-patch14`, con dos cabezas especializadas: una sobre embeddings de contenido (Model 1) y otra sobre residuos forenses de 124 dimensiones (Model 2). El modelo no es un detector universal de contenido generado por IA; está limitado a fotografías y no cubre recibos, interfaces de usuario, gráficos o ilustraciones. Su relevancia radica en ofrecer una opinión a nivel de píxel cuando los metadatos han sido eliminados, un escenario común en la verificación de autenticidad de imágenes.

El modelo se distribuye bajo licencia Apache 2.0, con soporte únicamente para el idioma inglés en su documentación. El repositorio tiene un tamaño de 1,7 GB y está diseñado para usarse con la librería `transformers` mediante el pipeline de `image-classification`. No se publican los datos de entrenamiento ni el catálogo de píxeles, lo que limita la reproducibilidad externa. A pesar de su nombre, no es un decodificador de SynthID ni una herramienta de procedencia; su función es estrictamente clasificatoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de CLIP ViT-Large-Patch14 (openai/clip-vit-large-patch14) con dos cabezas: ridge + MLP (Model 1) y MLP one-vs-rest focal (Model 2) |
| Parametros totales | no disponible (basado en CLIP ViT-Large, pero no se especifica el número exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de transformers, probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo se compone de dos cabezas independientes que operan sobre representaciones diferentes. Model 1 utiliza el backbone CLIP ViT-Large-Patch14 con un fine-tune ligero de los últimos dos bloques de visión, la proyección visual y el post-layernorm. Las imágenes se preprocesan a 224 píxeles con letterbox, padding RGB (123, 117, 104), interpolación BICUBIC y normalización L2 de `get_image_features`. Sobre estos vectores de 768 dimensiones se entrena un ridge (umbral 0.3056, corte al 1% de falsos positivos en Open Images) y un MLP de arquitectura 768-512-128-1 con dropout 0.3/0.1 (umbral 5.9586, cuantil 1.67% del conjunto de validación). La etiqueta `ai` solo se asigna cuando ambos modelos coinciden (DEFINITELY); si solo uno coincide, se etiqueta como `unknown`.

Model 2 opera sobre un vector de 124 dimensiones de residuos forenses: ratios de energía de banda FFT, contraste de comb y autocovarianza en tiles de 256 píxeles. Se entrena un MLP one-vs-rest focal (124-64-1) por clase (`openai`, `google`, `tc260`, `meta_muse_image`, `no_ai`). Una clase gana solo si supera a `no_ai` por un margen de 0.30, y luego se aplica argmax entre las que pasan. El entrenamiento se realizó en CPU, con dos ejecuciones consecutivas byte-idénticas. El catálogo de entrenamiento incluye 32.690 archivos listados, de los cuales 26.573 tienen embeddings CLIP-L. Las semillas son 20260940 (detector) y 20260956 (proveedor). No se utilizó UI privada en el entrenamiento; se reemplazó con 150 capturas de Flickr bajo licencias CC.

## Capacidades

- Clasificación de fotografías en tres etiquetas: `human` (cámara), `ai` (generada por IA) y `unknown` (posible IA o extracción de características fallida).
- Atribución de proveedor para imágenes etiquetadas como `ai`: `openai`, `google`, `muse-image` (Muse Image) y `tc260` (estándar de etiquetado AIGC de China, que agrupa múltiples productores como Doubao, Jimeng, Qwen, Kling).
- Detección de contenido generado por IA a nivel de píxel, independiente de metadatos (EXIF, C2PA, SynthID).
- Especialización en fotografías; no funciona con recibos, interfaces de usuario, gráficos o ilustraciones.
- Capacidad de abstención: si la imagen es menor de 256 píxeles o el extractor de residuos falla, Model 2 no se ejecuta.
- Integración con el paquete Python `remove-ai-watermarks` mediante el extra `classify`, que carga el modelo explícitamente.

## Casos de uso

- Verificación de autenticidad en plataformas de fotografía: el modelo puede clasificar imágenes subidas por usuarios para detectar si son generadas por IA, ayudando a moderar contenido engañoso en bancos de imágenes o redes sociales.
- Análisis forense de imágenes sin metadatos: cuando se eliminan los metadatos (EXIF, C2PA), el modelo ofrece una opinión basada en píxeles, útil en investigaciones de procedencia de imágenes.
- Atribución de proveedor en investigaciones de desinformación: si una imagen es etiquetada como `ai`, Model 2 puede identificar si fue generada por OpenAI, Google, Muse Image o un productor bajo el estándar TC260, lo que ayuda a rastrear campañas de contenido sintético.
- Moderación de contenido en redes sociales: integrado en pipelines de revisión, puede marcar imágenes sospechosas para revisión humana, reduciendo la carga de moderadores.
- Auditoría de contenido generado por IA en campañas publicitarias: las marcas pueden verificar si las imágenes de sus anuncios son auténticas o generadas, cumpliendo normativas de transparencia.
- Investigación académica sobre clasificadores de imágenes generadas: el modelo sirve como referencia para comparar enfoques basados en embeddings de contenido frente a residuos forenses, aunque su catálogo de entrenamiento no es público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. La model card menciona un AUC de 0.989 para distinguir OpenAI de Gemini en el banco de 124 dimensiones, pero este dato es específico de la tarea de atribución de proveedor y no constituye un benchmark general. No hay comparaciones con otros clasificadores de imágenes generadas por IA.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- Dado que el modelo se basa en CLIP ViT-Large-Patch14, se estima que la inferencia requiere al menos 2-4 GB de VRAM en FP32, pero este dato no está confirmado por el autor.
- El entrenamiento se realizó en CPU, lo que sugiere que la inferencia puede ejecutarse en hardware modesto, aunque no se proporcionan cifras de latencia o throughput.
- Opciones de despliegue: al ser un modelo de `transformers`, puede usarse con librerías como `transformers` pipeline, `vLLM` (si se adapta), `llama.cpp` (no aplicable directamente por ser visión), o `Ollama` (no soportado). No se mencionan opciones específicas.
- Se recomienda consultar la documentación del paquete `remove-ai-watermarks` para detalles de integración.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros clasificadores de imágenes generadas por IA en la información disponible. El modelo es específico para fotografías y no se han publicado métricas comparativas con alternativas como SynthID, Hive AI o modelos de detección de deepfakes.

## Limitaciones y advertencias

- No es un detector universal de contenido generado por IA: no funciona con recibos, interfaces de usuario, gráficos, ilustraciones ni arte digital.
- No debe utilizarse para afirmar que un archivo está limpio o como prueba legal de autoría.
- La etiqueta `human` solo se asigna a fotografías de cámara con una tasa de falsos positivos baja, pero no es infalible.
- Model 2 no debe ejecutarse en todas las imágenes; solo se activa cuando Model 1 marca `definitely` como IA.
- La atribución de proveedor sigue al renderizador, no al front-end. Por ejemplo, imágenes de Bing Image Creator firmadas por Microsoft se clasifican como `openai`, y las de Designer firmadas por Google LLC como `google`.
- La clase `tc260` agrupa múltiples productores chinos, no es un proveedor único.
- El catálogo de entrenamiento no es público, lo que limita la reproducibilidad y la auditoría externa.
- El modelo solo soporta el idioma inglés en su documentación, aunque la clasificación de imágenes no depende del idioma.
- Riesgo de alucinación en la atribución de proveedor: si el extractor de residuos falla o la imagen es demasiado pequeña, Model 2 se abstiene, pero en casos límite puede asignar un proveedor incorrecto.

## Enlaces

- [Hugging Face: wiltodelta/raiw-photo-classify](https://huggingface.co/wiltodelta/raiw-photo-classify)
- [Repositorio GitHub: remove-ai-watermarks](https://github.com/wiltodelta/remove-ai-watermarks)
- [Documentación de clasificación de fotos](https://github.com/wiltodelta/remove-ai-watermarks/blob/main/docs/photo-classify.md)
- [Archivo de investigación sobre clasificadores de imágenes generadas por IA](https://github.com/wiltodelta/remove-ai-watermarks/blob/main/docs/ai-generated-image-classifiers.md)
- [Demo Space en Hugging Face](https://huggingface.co/spaces/wiltodelta/remove-ai-watermarks)
- [Sitio web de RAIW](https://raiw.cc/)
