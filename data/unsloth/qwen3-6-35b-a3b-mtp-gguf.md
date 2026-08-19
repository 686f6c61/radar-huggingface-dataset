# unsloth/Qwen3.6-35B-A3B-MTP-GGUF

## Resumen

El repositorio `unsloth/Qwen3.6-35B-A3B-MTP-GGUF` contiene la versión cuantizada en formato GGUF del modelo Qwen3.6-35B-A3B, desarrollada por Unsloth. El modelo base, creado por Qwen, es un modelo de lenguaje causal con encoder de visión, de arquitectura MoE híbrida (Gated DeltaNet + Gated Attention) con 35 mil millones de parámetros totales y 3 mil millones activos. Esta variante GGUF incorpora MTP (Multi-Token Prediction), una técnica que permite una inferencia entre 1,5 y 2 veces más rápida sin pérdida de precisión, y está optimizada para ejecutarse en llama.cpp y en Unsloth Studio.

La relevancia de este lanzamiento radica en que es la primera variante open-weight de la serie Qwen3.6, que prioriza la estabilidad y la utilidad real en entornos de desarrollo. Incluye mejoras sustanciales en codificación agéntica, razonamiento a nivel de repositorio, preservación del contexto de razonamiento histórico y soporte mejorado para tool calling. Al estar disponible en GGUF, permite su ejecución en hardware modesto, incluyendo CPU y GPU de consumo, con un contexto nativo de 262 144 tokens extensible hasta aproximadamente 1 010 000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet y Gated Attention, con encoder de visión (image-text-to-text) |
| Parametros totales | 35 mil millones |
| Parametros activos | 3 mil millones (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta ~1 010 000 |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0, p. ej. UD-Q4_K_XL; lista completa no disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un modelo causal con encoder de visión, entrenado en dos fases: pre-training y post-training. Su arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) en un patrón repetido: cada bloque contiene 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de Gated Attention, todos ellos con capas MoE. En total hay 40 capas, con una dimensión oculta de 2048 y un embedding de tokens de 248 320 (padded). El MoE cuenta con 256 expertos, de los cuales se activan 8 enrutados más 1 compartido, con una dimensión intermedia de 512. La atención lineal usa 32 cabezas para V y 16 para QK con dimensión 128, mientras que la atención clásica usa 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones.

El modelo incorpora MTP (Multi-Token Prediction) entrenado con múltiples pasos, lo que permite predecir varios tokens a la vez y acelerar la inferencia. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni la composición del dataset. La cuantización GGUF de Unsloth utiliza su sistema Dynamic 2.0, que ajusta dinámicamente los niveles de cuantización por capa para minimizar la pérdida de precisión.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte para modos de pensamiento (thinking) y preservación del contexto de razonamiento histórico.
- Codificación agéntica: manejo de flujos de trabajo de frontend y razonamiento a nivel de repositorio con mayor fluidez y precisión.
- Tool calling mejorado: parseo de objetos anidados para aumentar la tasa de éxito en llamadas a herramientas.
- Soporte de rol de desarrollador (Developer Role) para funcionar en entornos como Codex y OpenCode.
- Capacidades multimodales: al ser un modelo image-text-to-text, puede procesar entradas de imagen junto con texto (aunque la documentación no detalla las tareas específicas de visión).
- Contexto largo nativo de 262 144 tokens, extensible hasta aproximadamente 1 010 000, adecuado para documentos extensos y conversaciones prolongadas.
- Inferencia acelerada mediante MTP, con una mejora estimada de 1,5 a 2 veces en velocidad sin pérdida de precisión.

## Casos de uso

- Asistente de programación con contexto de repositorio: el modelo puede analizar un código base completo, razonar sobre arquitectura y generar cambios coherentes, gracias a su contexto largo y su capacidad de razonamiento a nivel de repositorio.
- Automatización de tareas de frontend: genera y modifica componentes de interfaz de usuario, estilos y lógica de cliente, integrable en pipelines de desarrollo.
- Agente autónomo con tool calling: puede encadenar llamadas a APIs y herramientas externas para resolver tareas complejas, como búsqueda de información, ejecución de comandos o gestión de archivos, gracias a su soporte mejorado de parseo de objetos anidados.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo (hasta 262K tokens), manteniendo el historial completo y el estado de la conversación sin pérdida de información.
- Procesamiento de documentos con imágenes: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados combinados con texto, útil para automatización de oficinas o análisis de informes.
- Despliegue en entornos con recursos limitados: gracias a la cuantización GGUF y a la arquitectura MoE con solo 3B activos, puede ejecutarse en GPU de consumo o incluso en CPU mediante llama.cpp, con la opción de activar MTP para acelerar la inferencia.
- Desarrollo iterativo con preservación de razonamiento: la opción de retener el contexto de razonamiento de mensajes históricos reduce la sobrecarga en sesiones de desarrollo prolongadas, permitiendo iterar sobre soluciones previas sin repetir el análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de comparación con Qwen3.5-27B, Gemma4-31B y Qwen3.5-35BA3B, pero los valores numéricos no se han podido extraer del texto proporcionado. No se dispone de datos verificables de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se especifican requisitos exactos de VRAM en la documentación proporcionada. Al ser un modelo MoE de 35B parámetros totales, todos los pesos deben cargarse en memoria, por lo que la huella de memoria es similar a la de un modelo denso de 35B. Con cuantización Q4, se estima un consumo de aproximadamente 20 GB, pero este dato no está confirmado oficialmente.
- GPU recomendadas: no disponible. Dado el tamaño, se necesitaría al menos una GPU con 24 GB de VRAM (como RTX 3090/4090) para cuantizaciones bajas, o varias GPUs para cuantizaciones más altas.
- Puede ejecutarse en CPU mediante llama.cpp, aunque con menor rendimiento.
- Opciones de despliegue: llama.cpp (con soporte para MTP mediante `--spec-type draft-mtp`), Unsloth Studio, y potencialmente vLLM/SGLang para el modelo base en formato Transformers (no para este repo GGUF).
- Nota: MTP no es compatible con `-np > 1` (batch mayor que 1) ni con `--mmproj` (proyección multimodal) en llama.cpp.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. La model card menciona como alternativas Qwen3.5-27B, Gemma4-31B y Qwen3.5-35BA3B, pero no se han proporcionado especificaciones detalladas de estos modelos. Se puede indicar que todos son modelos de tamaño similar (entre 27B y 35B) con enfoque en razonamiento y codificación, pero sin datos concretos de parámetros, contexto o rendimiento, la comparativa no es posible.

## Limitaciones y advertencias

- MTP en llama.cpp no soporta procesamiento por lotes (batch > 1) ni proyección multimodal (`--mmproj`), lo que limita su uso en servidores con alta concurrencia o en tareas que requieran visión.
- No se han documentado los idiomas soportados; es probable que el modelo esté optimizado principalmente para inglés y chino, pero no hay confirmación.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o generación de código.
- No se han publicado evaluaciones de sesgos o comportamientos adversos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen para posibles restricciones adicionales.
- El contexto extensible a 1M tokens puede requerir una cantidad significativa de memoria, especialmente en cuantizaciones altas.
- La cuantización GGUF puede introducir una ligera degradación de precisión en comparación con los pesos originales en fp16/bf16, aunque Unsloth afirma minimizarla con su sistema Dynamic 2.0.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de Unsloth para Qwen3.6: https://unsloth.ai/docs/models/qwen3.6
- Guía de MTP de Unsloth: https://unsloth.ai/docs/models/qwen3.6#mtp-guide
- Documentación de Unsloth Dynamic 2.0 GGUFs: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
