# treeish/Qwen3.6-35B-A3B-oQ2e-FP16-MTP-MLX

## Resumen

El modelo `treeish/Qwen3.6-35B-A3B-oQ2e-FP16-MTP-MLX` es una variante cuantizada del modelo Qwen3.6-35B-A3B de Alibaba, preparada por el usuario treeish para ejecutarse en Apple Silicon mediante el framework MLX. Se trata de una cuantización agresiva de 2 bits (oQ2e) con overrides por tensor de 3 a 8 bits, que reduce el peso del modelo a unos 13,6 GB manteniendo una ventana de contexto de 262 144 tokens. La particularidad de esta versión es que almacena los tensores residuales en FP16 en lugar de BF16, lo que la hace compatible con los Macs M1 y M2, donde la aritmética BF16 no está soportada de forma nativa.

El modelo incorpora una cabeza de Multi-Token Prediction (MTP) embebida, que permite decodificación especulativa para acelerar la generación. Está pensado para su uso con el runtime Swift de Treeish (Sprig) y requiere al menos 24 GB de memoria unificada, recomendándose 32 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con MTP embebido |
| Parametros totales | 35 000 000 000 (35B) |
| Parametros activos | ~3 000 000 000 (3B) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | oQ2e (2-bit affine, group size 64) con overrides per-tensor de 3, 4, 5, 6 y 8 bits; residuales en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (2 052 tensores indexados) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de arquitectura MoE con 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token. La variante cuantizada utiliza el esquema oQ2e (optimized 2-bit with imatrix), que aplica cuantización afín de 2 bits con grupo de tamaño 64, complementada con overrides por tensor de mayor precisión (3, 4, 5, 6 y 8 bits) para las capas más sensibles. La cuantización se realizó con activación imatrix para mejorar la calidad.

La versión FP16 convierte todos los tensores BF16 del paquete original a FP16, preservando los tensores cuantizados empaquetados y los metadatos. El proceso de conversión está documentado en el script `make_fp16_precision_sibling.py` del repositorio MTPLX. El modelo incluye una cabeza MTP embebida bajo `language_model.mtp.*`, compuesta por 42 tensores, que permite decodificación especulativa con bloques de tamaño 2 a 4.

No se dispone de información detallada sobre el entrenamiento del modelo base (datos, tokens, método de alineación) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Qwen3.6-35B-A3B.
- Decodificación especulativa mediante la cabeza MTP embebida, con soporte para bloques de tamaño 2, 3 y 4.
- Tool calling y function calling, validado en la prueba de release con una llamada `search_text` correctamente parseada.
- Soporte de agentes y razonamiento multi-paso, aunque no se detallan capacidades específicas más allá del tool calling.
- Capacidades multilingües: no especificadas en la documentación, aunque el modelo base Qwen suele soportar múltiples idiomas.
- El pipeline_tag indica `image-text-to-text`, lo que sugiere posible entrada multimodal, pero no se confirma en la model card ni en las pruebas realizadas.
- Compatibilidad con el runtime MLX Swift de Treeish (Sprig), que implementa el formato de edición exacta de cadenas.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede ejecutarse en un Mac con 24-32 GB de memoria unificada, ofreciendo respuestas a ~90-105 tokens/s, adecuado para chatbots personales o prototipos sin conexión.
- Generación de código asistida: gracias al tool calling y al contexto largo de 262K tokens, puede integrarse en editores o IDEs para autocompletar y refactorizar código en proyectos extensos.
- Procesamiento de documentos largos: la ventana de 262 144 tokens permite resumir o extraer información de libros, informes o transcripciones completas sin truncamiento.
- Automatización de tareas con agentes: el soporte de function calling y MTP permite construir agentes que ejecuten búsquedas web, consultas a APIs o manipulación de archivos con baja latencia.
- Desarrollo de aplicaciones de escritorio con MLX: desarrolladores que usan el ecosistema MLX pueden integrar este modelo en apps nativas para macOS, aprovechando la aceleración por Metal.
- Evaluación de cuantización agresiva: investigadores pueden comparar la calidad de oQ2e frente a cuantizaciones de mayor precisión en tareas de razonamiento y generación, usando este paquete como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye únicamente mediciones de velocidad de generación en un M4 Max de 36 GB con un fixture de 1 066 tokens:

| Configuracion | Tokens/s |
|---|---|
| Sin MTP | 89,2 |
| MTP block size 2 | 95,6 |
| MTP block size 3 | 105,8 |
| MTP block size 4 | 103,3 |

La versión BF16 original generó 92,6 tokens/s sin MTP y 115,2 tokens/s con block size 3 en el mismo hardware. Estas cifras corresponden a una única máquina y un fixture pequeño, no son benchmarks generales.

## Requisitos de hardware

- Memoria unificada: mínimo 24 GB, recomendado 32 GB. El modelo ocupa 13,6 GB en disco, pero la memoria real depende de la longitud de contexto y la caché.
- GPUs compatibles: exclusivamente Apple Silicon (M1, M2, M3, M4). Esta variante FP16 está pensada para M1 y M2; los M3 y superiores deben usar la versión BF16.
- No es compatible con GPUs NVIDIA o AMD, ya que el formato MLX y el runtime Sprig son específicos de Apple.
- Opciones de despliegue: runtime MLX Swift de Treeish (Sprig). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: en un M4 Max de 36 GB, entre 89 y 106 tokens/s según la configuración MTP. En M1/M2 se espera menor rendimiento, aunque no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35B total, 3B activo | 262 144 | BF16 | Apache 2.0 | safetensors |
| treeish/Qwen3.6-35B-A3B-oQ2e-MTP-MLX (BF16) | 35B total, 3B activo | 262 144 | oQ2e + BF16 residual | Apache 2.0 | MLX safetensors |
| Este modelo (FP16) | 35B total, 3B activo | 262 144 | oQ2e + FP16 residual | Apache 2.0 | MLX safetensors |

La diferencia principal entre las dos variantes cuantizadas es la precisión residual (BF16 vs FP16), que afecta a la compatibilidad con M1/M2 pero no al tamaño ni a la calidad de la cuantización. El modelo original sin cuantizar requiere mucho más espacio y memoria, por lo que no es viable en equipos de consumo.

## Limitaciones y advertencias

- Cuantización agresiva de 2 bits: la calidad del modelo se ve reducida respecto al original BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- Compatibilidad restringida: solo funciona con el runtime MLX Swift de Treeish (Sprig). Otros runtimes deben soportar los overrides de cuantización por tensor y el layout MTP embebido.
- Hardware limitado a Apple Silicon: no se puede ejecutar en GPUs de otros fabricantes.
- Divergencia en salida con MTP: en el runtime parcheado, la salida con MTP activado puede divergir de la salida sin MTP, un comportamiento también presente en el paquete BF16 original. Aplicaciones que requieran salidas byte-idénticas deben validar su runtime.
- Sin datos de sesgos o alucinación: no se ha publicado información sobre sesgos del modelo base ni sobre tasas de alucinación en esta variante.
- El pipeline_tag sugiere multimodalidad (image-text-to-text), pero no hay evidencia en la documentación de que esta variante soporte entrada de imágenes; se recomienda verificar antes de usarla para tareas de visión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ2e-FP16-MTP-MLX
- Paquete BF16 hermano: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ2e-MTP-MLX
- Modelo base original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio MTPLX (script de conversión): https://github.com/youssofal/MTPLX
