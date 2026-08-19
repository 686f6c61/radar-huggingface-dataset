# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_NL_R4-SPECIAL_SPLIT

## Resumen

El modelo `mtp-Qwen3.8-27B-THIREUS-IQ4_NL_R4-SPECIAL_SPLIT` es una cuantización en formato GGUF del modelo Qwen3.8-27B, creada por el usuario Thireus mediante su herramienta propietaria "GGUF Tool Suite". El modelo base, desarrollado por Alibaba, es un transformer denso multimodal de 27 000 millones de parámetros con una ventana de contexto de 262 144 tokens, orientado a tareas de codificación, flujos agénticos y automatización de oficina. Esta cuantización concreta utiliza el esquema IQ4_NL con variante R4 y un "split especial" que probablemente divide los pesos en fragmentos para facilitar su carga en entornos con memoria limitada.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar una versión comprimida de un modelo de última generación, con un tamaño reducido que lo hace ejecutable en hardware de consumo. Sin embargo, la información pública disponible sobre esta cuantización es muy escasa: la model card está vacía (solo indica licencia MIT) y no se han publicado métricas de rendimiento específicas. Por tanto, esta ficha se apoya en los datos conocidos del modelo base y en las características inferidas del nombre del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (modelo base) |
| Tipos de cuantizacion | IQ4_NL_R4 (según nombre del repositorio) |
| Idiomas soportados | no disponible (modelo base multilingüe, sin detalle) |
| Licencia | MIT (repositorio de Thireus); el modelo base es Apache 2.0 |
| Formato de pesos | GGUF (fragmentado, "special split") |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros, con un codificador de visión integrado que le permite procesar imágenes además de texto. Según la información publicada por Alibaba, fue entrenado con un corpus masivo y optimizado para tareas de codificación, razonamiento y automatización de oficina. No se dispone de detalles sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada.

La cuantización IQ4_NL_R4 es una técnica de compresión de pesos que reduce la precisión numérica a aproximadamente 4 bits por peso, con una variante específica (R4) que puede implicar un esquema de redondeo o agrupación particular. El "special split" sugiere que los pesos se dividen en fragmentos para facilitar la carga en memoria, probablemente pensado para su uso con la herramienta GGUF de Thireus. Esta cuantización no implica un reentrenamiento, sino una conversión del modelo original, por lo que las capacidades generales se mantienen, aunque con una posible pérdida de precisión en tareas sensibles.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Codificación de software: soporte para múltiples lenguajes de programación y generación de código.
- Procesamiento multimodal: el modelo base incluye un codificador de visión, por lo que puede entender imágenes y responder sobre ellas (la cuantización no elimina esta capacidad, aunque puede degradar la precisión).
- Tool calling y function calling: el modelo base está diseñado para integrarse con herramientas externas y APIs.
- Flujos agénticos: capacidad de planificar y ejecutar tareas multi-paso, útil para agentes autónomos.
- Multilingüe: el modelo base soporta numerosos idiomas, aunque no se especifica la lista exacta.
- Ventana de contexto larga: 262 144 tokens, lo que permite manejar documentos extensos o conversaciones muy largas.

## Casos de uso

- Asistente de programación local: gracias a su tamaño cuantizado, puede ejecutarse en una GPU de consumo (p. ej., RTX 4090) y ofrecer autocompletado de código, explicaciones y refactorización sin depender de la nube.
- Automatización de oficina: el modelo base está optimizado para tareas como generación de informes, resúmenes de documentos y gestión de correos electrónicos, aprovechando su contexto largo para procesar documentos completos.
- Chatbot con memoria extendida: con 262k tokens de contexto, puede mantener conversaciones muy largas o analizar grandes volúmenes de texto (contratos, manuales) en una sola pasada.
- Análisis de imágenes y documentos escaneados: al ser multimodal, puede extraer información de capturas de pantalla, diagramas o formularios, útil en entornos de atención al cliente o verificación documental.
- Desarrollo de agentes autónomos: su soporte para tool calling y razonamiento multi-paso permite construir agentes que consulten APIs, ejecuten comandos o naveguen por bases de datos.
- Despliegue en entornos con recursos limitados: al estar cuantizado a 4 bits y fragmentado, puede ejecutarse en hardware modesto (p. ej., una laptop con GPU de 8 GB) para prototipado o pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base Qwen3.8-27B cuenta con métricas publicadas por Alibaba (según el artículo de Yottalabs), pero no se incluyen aquí por no disponer de los valores exactos. Se recomienda consultar el repositorio oficial del modelo base para obtener datos de rendimiento en tareas como MMLU, HumanEval o GSM8K. La cuantización IQ4_NL puede introducir una degradación típica de 1-3 % en precisión respecto al modelo en BF16, aunque no hay datos verificados para este caso concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, los pesos del modelo ocupan aproximadamente 13,5 GB (27 000 millones × 0,5 bytes por peso). Añadiendo overhead de activaciones y caché KV, se recomienda al menos 16 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o superiores. En GPUs con 12 GB podría funcionar con contexto reducido o usando offloading a CPU.
- Compatibilidad con hardware de consumo: sí, una RTX 3090 o 4090 puede ejecutarlo sin problemas. En GPUs de 8 GB (p. ej., RTX 3060) sería necesario reducir el contexto o usar técnicas de cuantización más agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF. La herramienta GGUF de Thireus (https://gguf.thireus.com/) es necesaria para reconstruir los fragmentos del "special split".
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 27B en 4 bits en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Apache 2.0 | Safetensors | Modelo original, mayor precisión, requiere más VRAM |
| mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT | 27B | 262k | MIT | GGUF (BF16) | Cuantización de Thireus en BF16, mayor fidelidad que IQ4 |
| mtp-Qwen3.8-27B-THIREUS-IQ4_NL_R4-SPECIAL_SPLIT | 27B | 262k | MIT | GGUF (IQ4_NL_R4) | Este modelo, menor huella de memoria, posible pérdida de precisión |

No se dispone de comparativas con otros modelos de 27B (p. ej., Llama 3.1 27B o Mistral Large) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización IQ4_NL introduce pérdida de precisión respecto al modelo original, especialmente en tareas de razonamiento matemático o generación de código complejo.
- La model card del repositorio está vacía; no se documentan sesgos, riesgos de alucinación ni limitaciones específicas de esta versión.
- El "special split" requiere el uso de la herramienta GGUF de Thireus para reconstruir el modelo; no es un archivo GGUF estándar directamente cargable en todos los runtimes.
- La licencia del repositorio es MIT, pero el modelo base Qwen3.8-27B es Apache 2.0. Es necesario verificar si la cuantización hereda la licencia del base o si Thireus ha aplicado una licencia propia; en caso de duda, consultar con el autor.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que el rendimiento real en tareas específicas es incierto.
- El contexto de 262k tokens es teórico; en la práctica, la memoria necesaria para la caché KV puede limitar el contexto utilizable en GPUs de consumo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_NL_R4-SPECIAL_SPLIT
- Repositorio del modelo base Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Colección de Thireus con splits especiales: https://huggingface.co/collections/Thireus/mtp-qwen36-27b-thireus-special-split
- Herramienta GGUF de Thireus: https://gguf.thireus.com/
- Artículo sobre Qwen3.8-27B (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
