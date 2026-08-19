# Terathox-Coder/Qwen3.8-27B-MTP-GGUF

## Resumen

Qwen3.8-27B-MTP-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen/Qwen3.8-27B, realizada por Terathox-Coder. El repositorio contiene una conversión y cuantización Q4_K_M del checkpoint original de 27 000 millones de parámetros, conservando de forma intencionada los tensores MTP (Multi-Token Prediction) / NextN, lo que permite experimentar con decodificación especulativa en runtimes compatibles como llama.cpp u Ollama. No se ha realizado ningún fine-tuning ni entrenamiento adicional.

La relevancia de este lanzamiento radica en que ofrece un artefacto listo para inferencia local con un peso de aproximadamente 16,8 GB, apto para GPUs de consumo con 12-16 GB de VRAM, y con soporte de contexto largo (hasta 204 800 tokens según la configuración probada). El modelo base, desarrollado por el equipo Qwen, es un transformer denso de 27B parámetros con capacidades multilingües (inglés, español y chino) y multimodales, aunque esta versión GGUF se distribuye actualmente como artefacto de solo texto al no incluir un proyector multimodal validado.

La licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para desarrolladores que necesitan un modelo de 27B cuantizado, con MTP preservado, para tareas de generación de texto, razonamiento técnico y flujos de codificación agéntica en entornos locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con tensores MTP / NextN preservados |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 204 800 tokens (configuración probada en Ollama) |
| Tipos de cuantizacion | Q4_K_M (único archivo disponible) |
| Idiomas soportados | Inglés, español, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo: Qwen3.8-27B-Q4_K_M-MTP.gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros desarrollado por el equipo Qwen. La arquitectura incorpora tensores MTP (Multi-Token Prediction) / NextN, que permiten la decodificación especulativa: el modelo predice varios tokens por paso en lugar de uno solo, acelerando la generación en runtimes que soporten esta técnica. Durante la conversión a GGUF, el proceso detectó 866 tensores con MTP habilitado y 851 con NextN deshabilitado, conservando los 15 tensores adicionales `mtp.*` en el archivo final.

No se ha realizado ningún entrenamiento, fine-tuning ni ajuste adicional sobre el checkpoint original. El pipeline de conversión fue: checkpoint original → GGUF BF16 con MTP preservado → cuantización Q4_K_M. El dataset de entrenamiento del modelo base no se detalla en la información disponible, y no se especifica si se emplearon técnicas como RLHF o DPO en su desarrollo original. La cuantización Q4_K_M reduce significativamente los requisitos de memoria a costa de una posible degradación de calidad respecto al checkpoint BF16 original.

## Capacidades

- Generación de texto conversacional y de larga forma en inglés, español y chino.
- Razonamiento técnico y resolución de problemas complejos, orientado a tareas de ingeniería de software.
- Generación de código y soporte para flujos de codificación agéntica (agentic coding workflows).
- Manejo de contextos largos (hasta 204 800 tokens en la configuración probada), adecuado para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa MTP / NextN en runtimes compatibles (llama.cpp con `--spec-type draft-mtp`, Ollama con `draft_num_predict`).
- Capacidades multilingües limitadas a los tres idiomas declarados: inglés, español y chino.
- Sin soporte multimodal en esta versión: el repositorio no incluye un proyector `mmproj` validado, por lo que debe considerarse un artefacto de solo texto.

## Casos de uso

- Asistente de codificación local: el modelo puede integrarse en entornos de desarrollo como un asistente de generación y revisión de código, aprovechando su razonamiento técnico y su capacidad para manejar contextos largos con el historial completo del proyecto.
- Flujos de codificación agéntica: gracias a su soporte para razonamiento multi-paso y su tamaño de 27B, puede actuar como motor de agentes que planifican, escriben y depuran código de forma autónoma en pipelines de CI/CD.
- Atención al cliente multilingüe: con soporte para inglés, español y chino, puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial completo de la interacción.
- Análisis y resumen de documentos extensos: la ventana de contexto de 204 800 tokens permite procesar manuales técnicos, contratos o informes completos sin necesidad de fragmentación.
- Experimentación con decodificación especulativa: los tensores MTP preservados permiten a investigadores y desarrolladores evaluar el impacto de la predicción multi-token en la latencia y el throughput en diferentes runtimes.
- Despliegue de inferencia local en hardware de consumo: con un peso de 16,8 GB en Q4_K_M, puede ejecutarse en GPUs de 12-16 GB de VRAM, lo que lo hace viable para entornos sin acceso a infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no se realizó ninguna evaluación estandarizada de precisión sobre esta cuantización en el momento de la publicación, y remite a la model card del modelo base Qwen/Qwen3.8-27B para benchmarks oficiales de capacidades.

Los únicos datos de rendimiento publicados corresponden a mediciones locales de throughput de inferencia en el hardware de validación (RTX 5080 16 GB + 2× RTX 4070 12 GB, con contexto de 204 800 tokens y KV-cache en q4_0):

| Ejecución | Tasa de evaluación (tok/s) |
|---|---|
| 1 | 49,90 |
| 2 | 49,52 |
| 3 | 54,18 |
| 4 | 49,32 |

Rango típico observado: ~49-54 tokens/s. La evaluación de prompt varió entre aproximadamente 51 y 263 tok/s según el estado de la caché de contexto. Estas cifras son mediciones locales de hardware y no deben interpretarse como benchmarks de precisión o capacidad.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa ~16,8 GB, por lo que se recomienda al menos 16 GB de VRAM para una carga completa en GPU. La configuración de validación utilizó 24 GB de VRAM total (RTX 5080 16 GB + 2× RTX 4070 12 GB) con el modelo cargado al 100% en GPU.
- GPUs recomendadas: RTX 5080 (16 GB), RTX 4070 (12 GB) o superiores con 16 GB o más de VRAM. En GPUs de 12 GB puede ser necesario descargar parte de las capas a CPU.
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas de gama alta de consumo (RTX 4070/4080/4090, RTX 5080) siempre que la VRAM sea suficiente o se acepte una descarga parcial a CPU.
- Opciones de despliegue: llama.cpp (validado con `llama-cli --spec-type draft-mtp`), Ollama 0.32.9 (validado con Modelfile mínimo), y cualquier runtime compatible con GGUF.
- Configuración recomendada en Ollama: `OLLAMA_FLASH_ATTENTION=1`, `OLLAMA_KV_CACHE_TYPE=q4_0`, `draft_num_predict=4` para MTP.
- Latencia y throughput: ~49-54 tok/s en el hardware de validación con contexto de 204 800 tokens. La evaluación de prompt varió entre 51 y 263 tok/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para esta cuantización, por lo que no es posible realizar una comparación cuantitativa rigurosa con alternativas. A continuación se presenta una comparación estructural basada en los datos disponibles:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MTP-GGUF (este repo) | 27B | 204 800 | GGUF Q4_K_M | Apache-2.0 | MTP preservado, solo texto |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Safetensors BF16 | Apache-2.0 | Modelo original, incluye capacidades multimodales |
| Qwen3-30B-A3B (referencia de la familia Qwen) | 30B (3B activos) | no disponible | Safetensors / GGUF | Apache-2.0 | Arquitectura MoE, no comparable directamente |

La comparación con el modelo base es la más relevante: esta cuantización ofrece el mismo modelo con un peso reducido de ~16,8 GB frente al checkpoint BF16 original, a costa de una posible degradación de calidad y de la pérdida del soporte multimodal en esta versión. No se dispone de datos de otros modelos GGUF de 27B de la misma familia para una comparación más amplia.

## Limitaciones y advertencias

- La cuantización Q4_K_M puede introducir degradación de calidad respecto al checkpoint BF16 original, especialmente en tareas de razonamiento complejo o generación de código preciso.
- El modelo base puede producir información inexacta, sesgada o alucinada. Los resultados deben verificarse de forma independiente en casos de uso de alto impacto o críticos para la seguridad.
- Esta versión es de solo texto: no incluye un proyector multimodal validado, por lo que las capacidades de visión del modelo base no están disponibles en este artefacto.
- La preservación de los tensores MTP no garantiza que un runtime utilice activamente la decodificación especulativa. El usuario debe verificar el soporte y la configuración de MTP en su versión específica de runtime.
- No se han publicado benchmarks de calidad para esta cuantización, por lo que su rendimiento real en tareas estandarizadas es desconocido.
- El soporte de idiomas se limita a inglés, español y chino; otros idiomas pueden presentar un rendimiento degradado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la publicación, lo que indica que no ha sido ampliamente validado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe revisar los términos de la licencia del modelo base original para confirmar cualquier restricción adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Terathox-Coder/Qwen3.8-27B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de llama.cpp: no disponible en la información proporcionada
- Documentación de Ollama: no disponible en la información proporcionada
