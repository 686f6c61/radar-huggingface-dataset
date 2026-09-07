# tfjack/Qwen3.8-27B-oQ6e-fp16-mtp

## Resumen

`tfjack/Qwen3.8-27B-oQ6e-fp16-mtp` es una cuantización experimental del modelo `Qwen/Qwen3.8-27B`, realizada por el usuario `tfjack` y optimizada para ejecutarse en Apple Silicon mediante el runtime oMLX. El modelo base es un transformer denso multimodal (vision-language) de aproximadamente 27.780 millones de parámetros, con ventana de contexto nativa de 262.144 tokens y ampliable hasta 1.000.000 mediante escalado YaRN (RoPE). Esta cuantización aplica el esquema oQe (Enhanced Quantization), una técnica de precisión mixta dinámica asistida por imatrix que asigna bits de forma sensible a la sensibilidad de cada capa, logrando unos 6.9 bits por peso efectivos.

El resultado es un archivo de 24.64 GB en formato MLX safetensors, compatible con oMLX, `mlx-lm`/`mlx-vlm` y el runtime MLX de LM Studio. La cuantización conserva el codificador visual del modelo base en alta precisión, así como las cabezas MTP (Multi-Token Prediction) originales. Su relevancia radica en ofrecer un modelo multimodal de gran capacidad y contexto muy amplio ejecutable localmente en equipos Mac, sin necesidad de servidores GPU, lo que facilita experimentación e investigación sobre cuantización y despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; ampliable a 1.000.000 con YaRN (RoPE) en frameworks compatibles |
| Tipos de cuantizacion | oQe Enhanced (imatrix-enhanced dynamic mixed-precision), ~6.9 bits por peso (oQ6e); codificador de vision en precision alta (el README presenta discrepancia: float16 en la intro, float32 en los detalles) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (compatible con oMLX, mlx-lm, mlx-vlm y LM Studio MLX runtime) |

## Arquitectura y entrenamiento

La arquitectura de base corresponde a `Qwen/Qwen3.8-27B`, un modelo denso multimodal de 27.780 millones de parámetros que procesa tanto texto como imágenes y vídeo. La cuantización `oQ6e-fp16` no modifica la arquitectura, sino que aplica una estrategia de cuantización de precisión mixta sobre los pesos del modelo de lenguaje, manteniendo el codificador visual en float16 o float32 según la sección del README (existe una discrepancia entre ambas partes del documento). Además, las cabezas MTP (Multi-Token Prediction) se conservan intactas, permitiendo la predicción de varios tokens en paralelo.

No se han proporcionado datos sobre la composición del dataset de entrenamiento del modelo base, el número total de tokens utilizados ni si hubo procesos de RLHF o DPO. El README de esta cuantización reproduce las recomendaciones de uso del modelo base, lo que indica que el comportamiento de razonamiento y los parámetros de muestreo provienen del modelo original. La única innovación destacable desde el punto de vista técnico es la propia cuantización oQe, que utiliza una asignación dinámica de bits asistida por imatrix para preservar la calidad en las capas más sensibles.

## Capacidades

- Comprensión multimodal de imágenes y vídeo: el codificador visual se conserva en alta precisión, lo que permite que el modelo entienda contenido visual externo además de texto.
- Razonamiento flexible con "thinking mode" activado por defecto: el parámetro `reasoning_effort` admite los niveles `low`, `medium` y `xhigh` para ajustar la profundidad del razonamiento.
- Ventana de contexto muy amplia: 262.144 tokens nativos, que se amplían a 1.000.000 con escalado YaRN en frameworks de servidor compatibles.
- Soporte de predicción múltiple de tokens (MTP) conservado, lo que puede acelerar la generación en runtimes que lo aprovechen.
- Generación de texto y conversación en escenarios largos y complejos, con control de parámetros de muestreo específicos para modo pensamiento y modo instrucción.
- No se ha documentado soporte explícito de tool calling o function calling en la información proporcionada.
- No se ha especificado el conjunto de idiomas soportados en los metadatos; el modelo base Qwen suele ser multilingüe, pero este dato no se confirma en la información disponible.

## Casos de uso

- Análisis de documentos visuales en local: el modelo puede procesar capturas de pantalla, diagramas, fotografías y vídeos para extraer información, describir escenas o responder preguntas sobre el contenido visual. Gracias al codificador visual intacto, la calidad de comprensión se mantiene próxima al modelo base.
- Asistente conversacional privado en Mac: al ejecutarse con oMLX o LM Studio, el modelo funciona completamente en local, sin enviar datos a servidores externos. Esto es adecuado para entornos donde la privacidad es crítica, como consultas sobre información sensible o documentos confidenciales.
- Razonamiento sobre documentos extensos: con 262.144 tokens de contexto nativo, el modelo puede procesar manuales técnicos, informes largos o transcripciones completas. Cuando se despliega con frameworks como vLLM o SGLang con escalado YaRN, puede ampliarse hasta 1.000.000 de tokens para corpus aún mayores.
- Investigación en técnicas de cuantización: esta versión oQe representa un experimento de cuantización dinámica de precisión mixta, útil para comparar el impacto de distintos esquemas de compresión sobre un modelo multimodal denso de 27B.
- Prototipado de aplicaciones multimodales en Python: usando `mlx-vlm`, se puede integrar la entrada de imágenes en pipelines de análisis, clasificación o generación de descripciones, todo ello sobre hardware Apple Silicon sin necesidad de GPU NVIDIA.
- Flujos de trabajo multi-paso con contexto extendido: el pensamiento configurable combinado con la ventana larga permite encadenar razonamientos complejos, como la planificación de tareas o la resolución de problemas que requieren mantener mucho historial intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web no aporta cifras de MMLU, HumanEval, GSM8K ni otras métricas para este modelo, ni para la cuantización específica. Cualquier comparación de rendimiento con otros modelos debería basarse en evaluaciones propias.

## Requisitos de hardware

- Los pesos cuantizados ocupan 24.64 GB (22.95 GiB) en el archivo de salida. Para cargarlos con margen para la caché KV y los buffers de activación, se recomienda un Mac con al menos 32 GB de memoria unificada.
- El modelo está diseñado exclusivamente para Apple Silicon (M1, M2, M3 y generaciones posteriores). No se ha indicado compatibilidad con GPU NVIDIA ni CUDA.
- En Apple Silicon, el runtime MLX permite ejecutar el modelo en memoria unificada, por lo que no se requiere una GPU dedicada. Es viable en MacBook Pro y Mac Studio de gama media-alta.
- Opciones de despliegue: oMLX Engine (soporte nativo de MTP draft heads y caché de prompts por niveles), `mlx-lm` para texto, `mlx-vlm` para entrada de imagen, y LM Studio con el motor MLX nativo.
- El README indica que la elección de float16 en lugar de bfloat16 proporciona aproximadamente un 20 % más de velocidad de prefill en M1/M2. No se proporcionan datos de latencia ni de throughput para otros casos.
- La extensión del contexto a 1.000.000 de tokens requiere escalado YaRN, disponible en frameworks de servidor como vLLM, SGLang o TokenSpeed, pero no está expuesta en oMLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27.781.427.952 | 262.144 (1M con YaRN) | HF Transformers | Sin cuantizar (fp16/bf16) | Apache 2.0 | Hugging Face |
| tfjack/Qwen3.8-27B-oQ6e-fp16-mtp | 27.781.427.952 | 262.144 (1M con YaRN) | MLX safetensors | oQe ~6.9 bpw | Apache 2.0 | Hugging Face |
| gn00029914/Qwen3.8-27B-oQ6e-fp16-mtp | 27.781.427.952 | 262.144 (1M con YaRN) | MLX safetensors | oQe ~6.9 bpw | Apache 2.0 | Hugging Face |

Los tres modelos comparten la misma arquitectura y parámetros. La cuantización `tfjack` y la de `gn00029914` son builds equivalentes en cuanto a esquema de compresión, aunque pueden diferir en los detalles de conversión. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El README presenta una discrepancia interna sobre la precisión del codificador de visión: la introducción indica que se conserva en float16, mientras que la sección de detalles técnicos indica float32. Esta ambigüedad debe tenerse en cuenta al evaluar el comportamiento visual.
- No se han publicado benchmarks específicos para esta cuantización, por lo que la calidad relativa frente al modelo base o frente a otras cuantizaciones no está verificada externamente.
- La extensión del contexto a 1.000.000 de tokens requiere escalado YaRN y no está disponible en oMLX. En runtimes locales como oMLX o LM Studio, el límite es de 262.144 tokens.
- Las implementaciones locales con un único parámetro `max_tokens` no permiten separar el presupuesto de razonamiento (recomendado: 262.144) del presupuesto de respuesta final (recomendado: 131.072).
- Al tratarse de una cuantización agresiva (6.9 bits por peso), es posible que exista una degradación leve de calidad en tareas que requieran precisión numérica alta, aunque el README no cuantifica este efecto.
- No hay información sobre sesgos, riesgos de alucinación, comportamiento en idiomas específicos ni restricciones adicionales de uso comercial. La licencia Apache 2.0 permite uso comercial, pero exige conservar la atribución al modelo base citado en el README.
- La dependencia exclusiva de MLX limita el despliegue a ecosistemas Apple Silicon y dificulta su uso en infraestructuras GPU convencionales sin conversión previa.

## Enlaces

- https://huggingface.co/tfjack/Qwen3.8-27B-oQ6e-fp16-mtp
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/Qwen/Qwen3.8-27B#best-practices
- https://qwen.ai/blog?id=qwen3.8
- https://huggingface.co/gn00029914/Qwen3.8-27B-oQ6e-fp16-mtp
