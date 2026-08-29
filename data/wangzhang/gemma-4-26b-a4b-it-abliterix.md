# wangzhang/gemma-4-26B-A4B-it-abliterix

## Resumen

Este modelo es una versión "abliterated" (descensurada) de Google Gemma 4 26B-A4B IT, creada por wangzhang mediante la herramienta Abliterix. El objetivo es eliminar los mecanismos de rechazo y negativa del modelo original, que se niega a responder a un 97% de las solicitudes problemáticas en su evaluación privada, reduciendo esa tasa al 2%. Es relevante porque aborda un problema conocido en la comunidad open source: los modelos de Google incorporan capas de seguridad que limitan su uso en entornos de investigación y desarrollo donde se necesita una respuesta sin restricciones.

Técnicamente, el modelo mantiene la arquitectura original de Gemma 4: un MoE con 128 expertos y 4 activos, con 25.806 millones de parámetros totales y una ventana de contexto de hasta 256K tokens. La innovación principal reside en el método de edición directa de pesos: la ablación por granularidad de experto (EGA) aplica proyecciones ortogonales que preservan la norma sobre los 3.840 bloques de expertos, combinada con ablación proyectada que conserva las dimensiones alineadas con la utilidad. El resultado es un modelo con una divergencia KL de 0,0005 respecto al original, lo que indica una alteración mínima del comportamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 128 expertos, 4 activos |
| Parametros totales | 25.805.933.872 |
| Parametros activos | ~4.000 millones (A4B) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | safetensors (bf16), GGUF |
| Idiomas soportados | Más de 140 idiomas (heredado de Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base es Google Gemma 4 26B-A4B IT, un MoE con 128 expertos por capa y 4 activos, que incorpora una arquitectura de doble normalización (4× RMSNorm por capa) y embeddings por capa (PLE). Estas características hacen que los métodos convencionales de ajuste como LoRA o hooks sean ineficaces, por lo que el autor optó por la edición directa de pesos.

El proceso de ablación utiliza dos técnicas combinadas: la ablación por granularidad de experto (EGA), que aplica una proyección ortogonal que preserva la norma a las 3.840 rebanadas de expertos `mlp.down_proj` en las 30 capas, y la ablación proyectada, que construye una base de bajo rango a partir de las direcciones de rechazo y utilidad, proyectando solo el componente ortogonal al rechazo. El entrenamiento de optimización utilizó 80 pruebas (25 de calentamiento y 55 con TPE) con un presupuesto KL de 0,004, ejecutado en una H100 SXM 80 GB durante aproximadamente 11 horas. El resultado final muestra una tasa de rechazo de 2/100 con una KL de 0,0005 respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento visible (prefijo `<|channel|>thought`).
- Procesamiento multimodal: acepta entrada de texto e imagen, genera salida de texto.
- Soporte multilingüe en más de 140 idiomas, incluyendo inglés y chino (usados en la evaluación).
- Capacidad de tool calling y function calling, heredada del modelo base.
- Ventana de contexto de 256K tokens, adecuada para tareas de razonamiento con contexto largo.
- Respuesta sin rechazos en la mayoría de solicitudes problemáticas (2/100 en la evaluación del autor), manteniendo una divergencia KL mínima respecto al original.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar el comportamiento de modelos sin capas de rechazo, analizando cómo se comportan ante solicitudes problemáticas y qué mecanismos internos activan.
- Desarrollo de agentes autónomos: su capacidad de tool calling y razonamiento multi-paso, combinada con la ausencia de rechazos, permite construir agentes que ejecutan tareas complejas sin interrupciones por políticas de seguridad.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que aborden temas sensibles sin que el modelo se niegue a participar.
- Análisis de textos con contenido delicado: procesamiento de documentos históricos, literarios o periodísticos que contengan lenguaje explícito o temas controvertidos, donde un modelo censurado fallaría.
- Evaluación comparativa de técnicas de ablación: sirve como referencia para investigar métodos de edición de pesos en arquitecturas MoE con doble normalización.
- Despliegue en entornos de investigación académica: su licencia Apache 2.0 permite uso comercial y modificación, facilitando su integración en proyectos de investigación sin restricciones legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta métricas específicas de su proceso de ablación:

| Metrica | Valor |
|---|---|
| Rechazos (dataset privado, 100 prompts) | 2/100 |
| Divergencia KL respecto al base | 0,0005 |
| Rechazos del modelo original | 97/100 |
| Pruebas de optimizacion completadas | 80 (25 warmup + 55 TPE) |
| Hardware de optimizacion | 1× H100 SXM 80 GB, bf16 |
| Tiempo total de optimizacion | ~11 horas |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 52 GB (25,8 mil millones de parámetros × 2 bytes), lo que requiere una GPU profesional o dos GPUs consumer de gama alta.
- GPUs recomendadas: H100 SXM 80 GB (usada en la optimización), A100 80 GB, o 2× RTX 4090 24 GB con tensor parallelism.
- En cuantización GGUF de 4 bits, la VRAM necesaria se reduce a aproximadamente 15-16 GB, lo que permite ejecutarlo en una RTX 4090 o similar.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM para inferencia de alto rendimiento, llama.cpp para cuantización GGUF, Ollama para despliegue local simplificado.
- La latencia depende del hardware y la cuantización; en una H100 con bf16 se espera un throughput de 50-100 tokens/s para generación, mientras que en consumer GPU con GGUF Q4 será significativamente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazos (eval autor) | Notas |
|---|---|---|---|---|---|
| wangzhang/gemma-4-26B-A4B-it-abliterix | 25,8B (4B activos) | 256K | Apache 2.0 | 2/100 | Ablación EGA + proyectada |
| google/gemma-4-26B-A4B-it | 25,8B (4B activos) | 256K | Apache 2.0 | 97/100 | Modelo original con capas de seguridad |
| gpt-oss-20b (referencia en la model card) | 20B | no disponible | no disponible | no disponible | Se menciona como referencia del perfil EGA ganador |

La comparativa se limita al modelo original y a la referencia interna de gpt-oss-20b mencionada en la model card. No se dispone de datos de otros modelos abliterated de la misma categoría para una comparación exhaustiva.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente descensurado: puede generar contenido inapropiado, ofensivo o peligroso sin filtros. Su uso en producción conlleva riesgos legales y éticos significativos.
- La evaluación del autor utiliza un dataset privado de 100 prompts; los resultados pueden no generalizar a otros conjuntos de solicitudes o idiomas.
- El autor advierte explícitamente que muchos modelos abliterated en HuggingFace reportan métricas engañosas debido a longitudes de generación insuficientes. Este modelo usa 200 tokens de generación en su evaluación para capturar los rechazos retardados.
- La divergencia KL de 0,0005 indica una alteración mínima, pero no garantiza que el comportamiento en tareas específicas sea idéntico al modelo original.
- No se han publicado benchmarks de rendimiento estándar (MMLU, HumanEval, etc.), por lo que se desconoce si la ablación ha degradado capacidades en tareas de razonamiento, código o matemáticas.
- El modelo mantiene la arquitectura de doble normalización y PLE, lo que dificulta cualquier ajuste posterior con LoRA o métodos basados en hooks.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin restricciones puede violar los términos de servicio de las plataformas donde se despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/gemma-4-26B-A4B-it-abliterix
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de Abliterix: https://github.com/wuwangzhang1216/abliterix
- Documentación de Gemma 4 en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/
