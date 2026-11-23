# tencent/WeMM-Ecom-2B-GPTQ

## Resumen

WeMM-Ecom-2B-GPTQ es la versión cuantizada en GPTQ W4A16 del modelo multimodal WeMM-Ecom-2B, desarrollado por WeChat Vision (Tencent) para la comprensión de contenido en el ámbito del comercio electrónico de WeChat. El modelo parte de una arquitectura densa de 2B parámetros (2.213.241.664 parámetros reales según los pesos en safetensors) sobre base `qwen3_5`, con una ventana de contexto de 262.144 tokens y capacidad de procesar texto, imagen, multi-imagen y vídeo como entrada (pipeline `image-text-to-text`).

Su relevancia radica en dos ejes. Por un lado, la especialización vertical: según la model card, supera a Qwen3.5-2B en 10,59 puntos y a LFM3-VL-2B en 6,16 puntos en la media de benchmarks de comercio electrónico (28 benchmarks, ocho escenarios), y mantiene capacidades generales 4,45 y 2,43 puntos por encima de esos mismos modelos respectivamente (64 benchmarks, ocho categorías). Por otro, la eficiencia de despliegue: la cuantización GPTQ de 4 bits reduce el peso del repositorio a 2,4 GB, lo que permite servir el modelo en hardware modesto.

La versión GPTQ conserva la precisión original en el codificador visual, la cabeza de salida y determinadas proyecciones sensibles, y se distribuye en formato `compressed-tensors` para su uso directo con vLLM. La licencia es Apache 2.0, lo que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base `qwen3_5`) con codificador visual; 2B denso |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 (4 bits pesos, 16 bits activaciones), grupos de 128 con cuantización simétrica; también existen versiones BF16, FP8 y GGUF del modelo base |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato `compressed-tensors` (GPTQ empaquetado) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 2B parámetros construido sobre la familia `qwen3_5`, con un codificador visual que habilita la entrada de imágenes, múltiples imágenes y vídeo además de texto. La salida es texto generado de forma conversacional, con soporte de dos modos de inferencia: modo instruct y modo thinking (razonamiento híbrido). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible en el material proporcionado.

La innovación técnica destacable de esta ficha es la cuantización: GPTQ con pesos de 4 bits y activaciones de 16 bits (W4A16), cuantización simétrica en grupos de 128 valores, con preservación de la precisión original en el codificador visual, la cabeza de salida y proyecciones seleccionadas sensibles. El checkpoint incluye su configuración de cuantización, de modo que el motor de servicio puede detectar el formato automáticamente. El modelo base WeMM-Ecom-2B se ofrece también en BF16, FP8 y GGUF, lo que permite elegir el compromiso entre precisión y coste de despliegue.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Comprensión de imagen única, multi-imagen y vídeo (entrada `image-text-to-text`).
- Comprensión especializada de comercio electrónico: atributos de producto, moderación de contenido, OCR, recuperación (retrieval), grounding, razonamiento sobre productos y conocimiento de producto.
- Capacidades generales de visión-lenguaje: VQA general, comprensión de documentos y gráficos, razonamiento STEM, comprensión espacial, grounding y conteo, comprensión multi-imagen, seguimiento de instrucciones y tareas centradas en texto.
- Modo thinking (razonamiento híbrido) además del modo instruct.
- Soporte multilingüe limitado a chino e inglés.
- Servicio mediante API compatible con OpenAI a través de vLLM (texto, imagen, multi-imagen, vídeo, multi-turno y streaming).
- No se especifica en la información disponible soporte explícito de tool calling o function calling.

## Casos de uso

- Moderación de contenido en marketplace: el modelo evalúa imágenes y texto de anuncios para detectar productos prohibidos o contenido inapropiado, apoyándose en los benchmarks de moderación del suite de comercio electrónico y en su contexto largo para revisar fichas completas.
- Extracción de atributos de producto: a partir de fotos de producto y descripciones, el modelo genera fichas estructuradas (talla, material, color, categoría) usando sus capacidades de OCR y grounding, lo que reduce la introducción manual de datos en catálogos.
- Búsqueda y recuperación semántica en catálogo: con 262.144 tokens de contexto puede procesar lotes de resultados o descripciones extensas y reformular consultas o generar representaciones textuales para motores de recuperación.
- Asistente de atención al cliente en comercio electrónico: gestiona conversaciones multi-turno con historial largo y puede recibir capturas o fotos del producto del usuario para responder dudas, gracias a su entrada multimodal y ventana de contexto amplia.
- Enriquecimiento de fichas con OCR: extrae texto de etiquetas, embalajes y facturas en imágenes y lo integra en flujos de digitalización de inventario, aprovechando la preservación de precisión del codificador visual en la versión GPTQ.
- Análisis de vídeo de producto: procesa vídeos de demostración o unboxing para generar resúmenes y descripciones, una capacidad poco habitual en modelos de 2B parámetros.
- Despliegue en entornos con GPU de gama media: al ocupar 2,4 GB en GPTQ, puede servirse en una única GPU consumer para prototipos, demos o tareas de clasificación y extracción a escala moderada.

## Benchmarks y rendimiento

La model card proporciona comparaciones agregadas, pero los resultados detallados se presentan como imágenes (tablas en `assets/`), no como cifras textuales. Los únicos datos numéricos disponibles son las diferencias medias frente a modelos comparables:

| Comparación | Benchmark | Diferencia media (puntos, escala 0-100) |
|---|---|---|
| WeMM-Ecom-2B vs Qwen3.5-2B | Comercio electrónico (28 benchmarks, 8 escenarios) | +10,59 |
| WeMM-Ecom-2B vs LFM3-VL-2B | Comercio electrónico (28 benchmarks, 8 escenarios) | +6,16 |
| WeMM-Ecom-2B vs Qwen3.5-2B | Capacidades generales (64 benchmarks, 8 categorías) | +4,45 |
| WeMM-Ecom-2B vs LFM3-VL-2B | Capacidades generales (64 benchmarks, 8 categorías) | +2,43 |

No se han publicado en la información disponible los valores absolutos por benchmark (MMLU, HumanEval, GSM8K u otros) ni las cifras específicas de esta variante GPTQ frente al modelo base BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,4 GB en GPTQ W4A16; en la práctica se recomienda reservar entre 6 y 10 GB de VRAM para pesos, caché KV y overhead del motor, aunque la cifra exacta no está disponible en la documentación.
- GPU recomendadas: no especificadas por el autor; para servicio en producción con vLLM se requieren GPU compatibles con el backend `compressed-tensors` (por ejemplo, A100, H100 o L40S). No se han publicado recomendaciones oficiales.
- GPU consumer: por tamaño, el checkpoint debería caber en GPUs consumer con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque el requisito real depende de la longitud de contexto y del número de imágenes o fotogramas de vídeo procesados.
- Opciones de despliegue: vLLM (versión >= 0.31.0 según la guía de inicio rápido) con backend `compressed-tensors` y API compatible con OpenAI; para otras opciones (llama.cpp, Ollama, TGI) no hay instrucciones específicas para esta variante GPTQ, aunque existe una versión GGUF del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| WeMM-Ecom-2B-GPTQ | 2,21B denso | 262.144 | Multimodal + e-commerce, thinking híbrido | Apache 2.0 | GPTQ W4A16, BF16, FP8, GGUF (familia) |
| Qwen3.5-2B | 2B (aprox.) | no disponible | Multimodal generalista | no disponible | no disponible |
| LFM3-VL-2B | 2B (aprox.) | no disponible | Visión-lenguaje generalista | no disponible | no disponible |

Según la model card, WeMM-Ecom-2B supera a Qwen3.5-2B y LFM3-VL-2B tanto en la media de benchmarks de comercio electrónico como en la de capacidades generales. No se dispone de datos de contexto, licencia ni formatos de esos modelos en la información proporcionada, por lo que las celdas correspondientes se marcan como no disponibles.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al estar especializado en comercio electrónico de WeChat, puede heredar sesgos del catálogo y de las políticas de moderación de esa plataforma.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad; en tareas de extracción de atributos y OCR conviene validar las salidas contra la imagen original.
- Cuantización: la variante GPTQ W4A16 puede degradar ligeramente la precisión respecto al BF16; no se han publicado comparativas numéricas entre ambas versiones en la información disponible.
- Contexto: aunque la ventana es de 262.144 tokens, el coste de memoria de la caché KV crece con el contexto y con el número de imágenes o fotogramas de vídeo, lo que puede limitar el despliegue real en GPU pequeñas.
- Licencia: Apache 2.0 permite uso comercial, pero debe revisarse el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento, no detalladas en la model card.
- Madurez: el repositorio registra 0 descargas y 2 likes en el momento de la consulta, por lo que la comunidad aún no ha validado el modelo en producción.
- Tool calling y agentes: no se documenta soporte explícito de function calling ni de flujos agénticos multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Ecom-2B
- Versión FP8: https://huggingface.co/tencent/WeMM-Ecom-2B-FP8
- Versión GGUF: https://huggingface.co/tencent/WeMM-Ecom-2B-GGUF
- Colección WeMM-Ecom: https://huggingface.co/collections/tencent/wemm-ecom
- Repositorio GitHub: https://github.com/Tencent/WeMM-Ecom
- Licencia: https://huggingface.co/tencent/WeMM-Ecom-2B-GPTQ/blob/main/LICENSE
- Documentación de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/gpu/
- Familia WeMM-Ecom 0.8B: https://huggingface.co/tencent/WeMM-Ecom-0.8B
- Familia WeMM-Ecom 4B: https://huggingface.co/tencent/WeMM-Ecom-4B
- Familia WeMM-Ecom 9B: https://huggingface.co/tencent/WeMM-Ecom-9B
- Familia WeMM-Ecom 35B-A3B: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
