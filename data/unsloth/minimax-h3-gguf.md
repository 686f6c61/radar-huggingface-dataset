# unsloth/MiniMax-H3-GGUF

## Resumen

MiniMax-H3-GGUF es la colección de cuantizaciones en formato GGUF del modelo MiniMax-H3, un sistema generativo omnicanal desarrollado por MiniMax que produce vídeo con audio estéreo nativo de hasta 15 segundos a 24 FPS y 32 kHz. Esta versión la publica Unsloth, conocido por su framework de entrenamiento e inferencia local, y está pensada para ejecutar el modelo en hardware de consumo mediante stable-diffusion.cpp y las herramientas de Unsloth. El repositorio incluye tanto los denoisers como el codificador de texto Qwen3-VL que el sistema necesita, de modo que es autocontenido salvo por los VAE.

El modelo base tiene 20.111.438.744 parámetros (unos 20,1 mil millones) según los pesos en safetensors, y se distribuye en dos checkpoints de denoiser independientes: `fl2va_pruned`, orientado a texto más cero, una o dos imágenes (primer y último fotograma), y `ref2va_pruned`, orientado a texto más imágenes, vídeos y audio de referencia. No son ajustes de un mismo modelo, sino pesos separados, y ambos se cuantizan aquí en los mismos niveles. La generación de audio no es un post-proceso: H3 sintetiza el audio de forma conjunta con el vídeo.

Su relevancia actual radica en que permite ejecutar localmente un sistema de generación de vídeo con audio en GPUs de consumo, algo poco habitual en modelos de esta categoría. El precio a pagar es una licencia comunitaria restrictiva (MiniMax H3 Community License Agreement) que define un territorio aplicable y excluye determinadas jurisdicciones, además de exigir el cumplimiento de obligaciones de atribución al tratarse de derivados cuantizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema generativo multimodal con denoiser de difusión (variantes `fl2va_pruned` y `ref2va_pruned`) y codificador de texto Qwen3-VL de 32B; no se detalla la topología interna del denoiser |
| Parámetros totales | 20.111.438.744 (pesos safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, UD-Q2_K_XL, Q3_K, UD-Q3_K_XL, Q4_K, Q5_0, Q6_K, Q8_0 (denoisers); Q2_K_M y Q4_K_M (codificador de texto) |
| Idiomas soportados | inglés (en) y chino (zh) según los metadatos del modelo base |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | GGUF (denoisers y codificador de texto); VAE en safetensors (FP16 vídeo, FP32 audio) |

## Arquitectura y entrenamiento

MiniMax-H3 es un sistema omnicanal de generación de vídeo con audio nativo. El pipeline separa dos componentes: un denoiser de difusión, que es el que recibe la condición multimodal, y un codificador de texto basado en Qwen3-VL de 32B que transforma el prompt en embeddings. El repositorio de Unsloth cuantiza ambos componentes, mientras que los VAE (vídeo en FP16 y audio en FP32) se toman del repositorio Comfy-Org/MiniMax-H3 y no se duplican aquí. La variante `fl2va_pruned` acepta texto y hasta dos fotogramas (primero y último), lo que la orienta a interpolación y control temporal; la variante `ref2va_pruned` acepta además imágenes, vídeos y audio de referencia, lo que habilita tareas de transferencia de estilo, consistencia de personaje o reutilización de audio.

El modelo base está destilado y es libre de classifier-free guidance: la documentación del repositorio indica que la escala CFG debe fijarse explícitamente a 1.0 y que el modelo aborta si se supera ese valor, mientras que el valor por defecto de la herramienta es 7.0. Esto implica que el muestreo se resuelve con pocos pasos (el ejemplo publicado usa 8 pasos a 960x544 y 124 fotogramas, y el ejemplo mínimo usa 4 pasos a 640x384 con 25 fotogramas). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Las cuantizaciones `UD-` son de precisión mixta dinámica, mientras que las uniformes mantienen un único tipo en todo el tensor.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con resolución y número de fotogramas configurables y hasta 15 segundos a 24 FPS.
- Generación de vídeo a partir de imagen (image-to-video) y de texto más imagen (image-text-to-video), incluyendo control de primer y último fotograma con la variante `fl2va_pruned`.
- Condicionamiento por referencias multimodales (imágenes, vídeos y audio) con la variante `ref2va_pruned`, útil para consistencia de sujeto o de estilo.
- Generación conjunta de audio estéreo nativo a 32 kHz, sintetizado por el propio modelo y no añadido en post-proceso.
- Soporte multilingüe de prompts en inglés y chino.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; no es un modelo de lenguaje conversacional, sino un generador de vídeo condicionado por texto.

## Casos de uso

- Prototipado rápido de vídeo publicitario: con la variante `fl2va_pruned` y una cuantización Q4_K (10,64 GiB), se pueden generar clips de producto a partir de un prompt y un fotograma inicial, con audio incluido, en una sola GPU de consumo.
- Interpolación y control temporal de secuencias: el uso de primer y último fotograma permite generar transiciones entre dos estados de una escena, útil para animáticas y previsualización de planos.
- Consistencia de personaje en series cortas: la variante `ref2va_pruned` acepta imágenes de referencia, lo que permite mantener la apariencia de un sujeto entre distintos clips generados con el mismo checkpoint.
- Doblaje y sustitución de audio: al aceptar audio de referencia, `ref2va_pruned` puede emplearse para generar vídeo sincronizado con una pista existente, por ejemplo en localización de contenido.
- Generación de material para redes sociales: clips de hasta 15 segundos a 24 FPS con audio estéreo cubren formatos habituales de vídeo corto sin necesidad de montaje posterior de sonido.
- Iteración local sin dependencia de la nube: al ejecutarse con stable-diffusion.cpp y Unsloth, el modelo permite ciclos de prueba y error en estación de trabajo, con el codificador de texto en CPU (`--backend te=cpu`) para liberar VRAM.
- Investigación en generación multimodal conjunta: la disponibilidad de los dos denoisers con los mismos niveles de cuantización facilita experimentos comparativos sobre condicionamiento por fotogramas frente a condicionamiento por referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para el denoiser: entre 6,22 y 7,51 GiB en las cuantizaciones más pequeñas (Q2_K y UD-Q2_K_XL), y hasta 19,94-19,97 GiB en Q8_0.
- Codificador de texto: 12,20 GiB en Q2_K_M y 16,97 GiB en Q4_K_M. La documentación recomienda emparejar Q2_K_M con los dos denoisers más pequeños y Q4_K_M con el resto.
- Estrategia de memoria: el flag `--backend te=cpu` mantiene el codificador de texto de 12 GB fuera de la GPU; `--offload-to-cpu` permite ajustar el modelo en GPUs más pequeñas.
- GPUs recomendadas: no se especifican modelos concretos. Por tamaño, una RTX 4090 (24 GB) puede alojar un denoiser Q8_0 o Q6_K junto con el codificador de texto en CPU; para configuraciones con el codificador en GPU harían falta tarjetas de mayor capacidad, como A100 o H100, aunque este dato no está confirmado en la documentación.
- Despliegue: stable-diffusion.cpp mediante `sd-cli` en modo `vid_gen`, y las herramientas de Unsloth. Los checkpoints PyTorch pre-cuantizados en FP8 están en unsloth/MiniMax-H3-FP8.
- Latencia y throughput: no disponibles. El ejemplo publicado emplea 8 pasos a 960x544 y 124 fotogramas, y el ejemplo mínimo 4 pasos a 640x384 y 25 fotogramas, pero no se indican tiempos de ejecución ni GPU empleada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo con audio que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License Agreement define un territorio aplicable y excluye algunas jurisdicciones; es imprescindible revisarla antes de cualquier uso comercial.
- Los archivos son derivados del modelo, no copias: la transformer y el codificador de texto están cuantizados, lo que altera la numerología y activa obligaciones de atribución recogidas en el archivo NOTICE.
- No es un producto oficial de MiniMax ni está respaldado por la compañía.
- El modelo está destilado y libre de CFG: usar una escala distinta de 1.0 provoca que el proceso aborte, y omitir `--mode vid_gen` hace que tome la ruta de imagen y falle.
- Idiomas limitados a inglés y chino según los metadatos; no se documenta soporte de castellano en los prompts.
- Riesgo de alucinación visual y de artefactos propios de la generación de vídeo: no se han publicado evaluaciones cuantitativas que permitan acotarlo.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Dependencia de componentes externos: los VAE deben descargarse de Comfy-Org/MiniMax-H3, y el repositorio ocupa 212,2 GB en total, lo que exige planificación de almacenamiento.
- No se dispone de información sobre el contexto máximo, el número de tokens de entrenamiento ni las condiciones de uso de las referencias de audio y vídeo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Preguntas frecuentes sobre la licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/QA-about-License.md
- Checkpoints FP8: https://huggingface.co/unsloth/MiniMax-H3-FP8
- VAE: https://huggingface.co/Comfy-Org/MiniMax-H3
- Unsloth: https://unsloth.ai/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Documentación de Unsloth: https://unsloth.ai/docs
- Ejemplo de vídeo con audio: https://huggingface.co/unsloth/MiniMax-H3-GGUF/blob/main/assets/h3_gguf_ud_q2_k_xl.mp4
