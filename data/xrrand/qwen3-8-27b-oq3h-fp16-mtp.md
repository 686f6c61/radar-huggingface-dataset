# xrrand/Qwen3.8-27B-oQ3h-fp16-mtp

## Resumen

Qwen3.8-27B-oQ3h-fp16-mtp es una cuantización mixta del modelo Qwen3.8-27B, publicada por el usuario xrrand en Hugging Face. El artefacto se ha generado con oQ (oMLX v0.8.2), la herramienta de cuantización de precisión mixta del proyecto oMLX, y está empaquetado en formato MLX para su ejecución en hardware Apple Silicon. El checkpoint resultante declara 6.276.813.040 parámetros reales en safetensors, con un tamaño de repositorio de 15,3 GB y un promedio efectivo de 19,475 bits por peso.

El modelo subyacente pertenece a la familia Qwen3.5 (tag `qwen3_5`), e incluye tres componentes diferenciados: un modelo de lenguaje de 5.391B parámetros lógicos, un codificador visual de 0,461B y una cabeza MTP (multi-token prediction) de 0,425B. La presencia de visión y de decodificación multi-token sitúa el artefacto en la categoría de modelos multimodales con aceleración de inferencia especulativa, aunque la model card no documenta el entrenamiento original ni las capacidades declaradas por el autor de Qwen.

La relevancia de esta ficha es doble. Por un lado, ilustra una estrategia de cuantización poco habitual: en lugar de aplicar un único esquema de bits, distribuye los pesos entre affine 4-bit (26,19%), affine 6-bit (20,26%), FP16 (0,99%), FP32 (7,34%) y U32 (45,22%). Por otro, el uso de U32 para casi la mitad de los pesos lógicos eleva el promedio a 19,475 bits/peso, lo que reduce de forma notable la compresión esperable frente a una cuantización uniforme de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5) con cabeza MTP; no se detalla en la model card |
| Parametros totales | 6.276.813.040 (6,277B) segun safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64, affine 6-bit grupo 64, FP16, FP32 y U32 (oQ / oMLX v0.8.2) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Los metadatos permiten inferir una estructura compuesta por un modelo de lenguaje de 5.391B parámetros lógicos, un módulo de visión de 0,461B y una cabeza MTP de 0,425B, lo que confirma un diseño multimodal con predicción multi-token. El tag `qwen3_5` apunta a la familia Qwen3.5, pero no se especifica si el backbone es un transformer denso, un MoE o una variante híbrida, ni se detalla la longitud de contexto nativa.

Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones como atención lineal o decodificación especulativa más allá de la propia cabeza MTP. Lo único verificable es el proceso de cuantización: oQ (oMLX v0.8.2) asigna precisiones distintas por tensor, con 1.644B pesos lógicos en affine 4-bit, 1.271B en affine 6-bit, 0,062B en FP16, 0,461B en FP32 y 2.839B en U32. Esta distribución produce un almacenamiento total de 14,230 GiB y un promedio de 19,475 bits por peso.

## Capacidades

- Generación de texto y razonamiento: el componente de lenguaje de 5.391B parámetros lógicos es el núcleo del checkpoint, aunque no se detallan capacidades específicas declaradas por el autor.
- Procesamiento visual: incorpora un módulo de visión de 0,461B parámetros lógicos (1,716 GiB en FP32), lo que indica soporte de entrada de imágenes.
- Predicción multi-token (MTP): la cabeza de 0,425B parámetros lógicos (0,293 GiB) está diseñada para decodificación especulativa y generación de varios tokens por paso.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 15,3 GB permiten cargar el checkpoint en equipos con memoria unificada de 24 GB o superior, lo que facilita prototipado y pruebas sin GPU dedicada.
- Experimentación con cuantización mixta: el artefacto sirve como referencia para estudiar el impacto de mezclar affine 4-bit, affine 6-bit, FP16, FP32 y U32 en la calidad final y en el tamaño del checkpoint.
- Evaluación de decodificación especulativa: la cabeza MTP integrada permite medir la aceleración de generación multi-token frente a la decodificación autorregresiva clásica en el runtime MLX.
- Tareas multimodales de laboratorio: el módulo de visión de 0,461B parámetros lógicos posibilita pruebas de descripción de imágenes o respuesta a preguntas visuales en entornos de investigación con recursos limitados.
- Benchmarking de precisión efectiva: con 19,475 bits/peso de media, el modelo es útil para comparar curvas de calidad frente a cuantizaciones uniformes de 4 y 8 bits sobre el mismo base.
- Reproducibilidad de pipelines oQ: permite validar el flujo de oMLX v0.8.2 y verificar la distribución de bits declarada en la model card antes de aplicarlo a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,3 GB de almacenamiento en disco y aproximadamente 14,2 GiB de pesos; en inferencia se requiere memoria adicional para KV cache y activaciones, por lo que conviene reservar al menos 18-20 GB de memoria unificada.
- GPU recomendadas: el formato MLX está orientado a Apple Silicon (series M1, M2, M3 y M4 con memoria unificada); no se garantiza compatibilidad con CUDA.
- Cabe en consumer GPU: en el ecosistema Apple, sí en equipos con 24 GB o más de memoria unificada; en GPUs NVIDIA no es un formato soportado de forma nativa.
- Opciones de despliegue: runtime MLX (librería `mlx`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ3h-fp16-mtp | 6,277B (checkpoint cuantizado) | no disponible | safetensors MLX | no disponible | Cuantización mixta oQ con MTP y visión |
| Modelo base Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Referencia original sin cuantizar; datos no disponibles |
| Otras cuantizaciones MLX de la familia Qwen3.5 | no disponible | no disponible | safetensors MLX | no disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3.8-27B antes de cualquier despliegue en producción.
- El promedio de 19,475 bits/peso es alto para una cuantización etiquetada como "3-bit"; el 45,22% de los pesos lógicos almacenados en U32 reduce la compresión efectiva y puede afectar al ahorro de memoria esperado.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base ni del checkpoint cuantizado.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que no se puede garantizar un comportamiento correcto en castellano o en contextos largos.
- El artefacto tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validación comunitaria; se recomienda tratarlo como un experimento y no como un artefacto listo para producción.
- La cuantización mixta puede introducir degradaciones no uniformes según la capa; no se han publicado evaluaciones de calidad comparativas frente al modelo original.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay soporte documentado para CUDA, ROCm ni aceleradores alternativos.

## Enlaces

- Hugging Face: https://huggingface.co/xrrand/Qwen3.8-27B-oQ3h-fp16-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
