# w3joe/Qwen3-8B-abliterated

## Resumen

Qwen3-8B-abliterated es una versión sin censura (abliterated) del modelo Qwen/Qwen3-8B desarrollada por el usuario w3joe. El modelo base es un transformer denso de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) creado por el equipo Qwen de Alibaba, y esta variante elimina el comportamiento de rechazo mediante una técnica de edición de pesos denominada Winsorized Benign-Subspace Biprojection con preservación exacta de la norma de filas.

El problema que resuelve es el de los rechazos (refusals) del modelo base ante prompts que considera dañinos, un comportamiento que limita su uso en investigación de seguridad, red teaming y aplicaciones que requieren respuestas sin filtros editoriales. A diferencia de otras abliteraciones que solo reportan conteos de rechazo sobre 100 prompts, esta versión se valida sobre 1.438 ítems de evaluación retenidos, comparándose directamente con el modelo base, con Huihui-Qwen3-8B-abliterated-v2 y con Heretic 2.0 (ARA) en el mismo hardware y arnés de evaluación.

La relevancia actual radica en que demuestra que es posible eliminar el 99,33% de los rechazos dañinos manteniendo la capacidad del modelo prácticamente intacta: una media de +0,49 puntos porcentuales sobre el modelo base en GSM8K, MMLU-Pro y MMLU, con una deriva de distribución KL de solo 0,0919 sobre 200 prompts benignos. Se distribuye con pesos en bfloat16 safetensors y cuantizaciones GGUF Q8_0, Q4_K_M y F16 bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de vLLM usa `--max-model-len 32768`) |
| Tipos de cuantizacion | BF16 safetensors, GGUF Q8_0, GGUF Q4_K_M, GGUF F16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, 4 shards, 16,4 GB), GGUF (Q8_0 8,7 GB; Q4_K_M 5,0 GB; F16 16,4 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Qwen3-8B, con 8.190.735.360 parámetros en bfloat16. No se trata de un modelo entrenado desde cero, sino de una edición de pesos sobre el checkpoint base `Qwen/Qwen3-8B` (revisión `b968826d`). La intervención consiste en una abliteración refinada en tres pasos: winsorización de valores atípicos con cuantil q = 0,99 por prompt, biproyección sobre el subespacio benigno y preservación exacta de la norma de filas de las matrices de pesos.

La innovación técnica frente a la abliteración estándar —que resta la diferencia cruda de medias (`refusal_mean - benign_mean`) en todas las capas y altera las normas de fila, dañando direcciones responsables de matemáticas y seguimiento de instrucciones— es precisamente ese triple refinamiento, que reduce la deriva de distribución y conserva la capacidad. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset original de Qwen3-8B en la documentación proporcionada. El modelo soporta modo thinking mediante cadenas `<think>` (desactivable con `enable_thinking=False` en la plantilla de chat).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con Transformers.
- Razonamiento explícito mediante cadenas `<think>` (thinking mode activable o desactivable).
- Razonamiento matemático: evaluado en GSM8K con 69,53% de coincidencia estricta.
- Conocimiento general y académico: evaluado en MMLU (57 materias) y MMLU-Pro (14 materias).
- Seguimiento de instrucciones: evaluado en IFEval con 58,59% de cumplimiento estricto de prompt.
- Respuestas sin rechazos ante prompts dañinos: 0,67% de tasa de rechazo residual (2/300).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se documenta soporte explícito de tool calling, function calling ni uso agéntico multi-paso en la información disponible.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo permite generar respuestas ante prompts dañinos sin que el sistema rechace la petición, lo que facilita construir conjuntos de datos adversarios y analizar cómo responde un LLM a entradas maliciosas en un entorno controlado.
- Investigación sobre alineación y abliteración: sirve como referencia reproducible para estudiar el efecto de la edición de pesos sobre la tasa de rechazo y la capacidad, gracias a los 1.438 ítems de evaluación y a las comparativas pareadas con intervalos de confianza bootstrap.
- Generación de contenido creativo sin filtros editoriales: escritura de ficción, guiones o narrativa que requiera temáticas sensibles (violencia, conflicto, temas adultos) sin las negativas del modelo base, manteniendo el 58,59% de IFEval en seguimiento de instrucciones.
- Asistente conversacional local en inglés o chino: con la cuantización Q4_K_M (5,0 GB) puede ejecutarse en GPUs de consumo de 8 GB o más y en Apple Silicon mediante Ollama o llama.cpp, con un Modelfile incluido para importación directa.
- Evaluación comparativa de métodos de desbloqueo: permite contrastar empíricamente la abliteración winsorizada frente a Huihui-v2 y Heretic 2.0 en GSM8K, MMLU-Pro y MMLU usando el mismo arnés, útil para publicaciones sobre técnicas de edición de pesos.
- Fine-tuning con LoRA: los safetensors BF16 de 16,4 GB son compatibles con Transformers, vLLM, SGLang y ajuste fino con LoRA, lo que permite adaptar el modelo sin censura a dominios específicos (por ejemplo, análisis de malware o documentación de exploits) partiendo de una base ya desbloqueada.
- Despliegue en producción con vLLM: el ejemplo oficial `vllm serve w3joe/Qwen3-8B-abliterated --dtype bfloat16 --max-model-len 32768` permite servir el modelo con contexto de hasta 32.768 tokens, adecuado para pipelines de generación de texto de alta concurrencia.

## Benchmarks y rendimiento

Evaluación en NVIDIA GB10, bfloat16, decodificación greedy (temperature = 0,0), mismos splits de prompts y protocolos de lm-evaluation-harness, 1.438 ítems retenidos por modelo.

| Benchmark | Items | Qwen3-8B base | Qwen3-8B-abliterated | Huihui-v2 | Heretic 2.0 |
|---|---|---|---|---|---|
| Tasa de rechazo dañino (↓) | 300 | 99,33% (298/300) | 0,67% (2/300) | 2,67% (8/300) | 2,67% (8/300) |
| Sobre-rechazo benigno (↓) | 200 | 1,00% (2/200) | 1,50% (3/200) | 1,00% (2/200) | 1,50% (3/200) |
| KL next-token benigno (↓) | 200 | 0,0000 | 0,0919 | 0,1041 | 0,2799 |
| GSM8K strict match (↑) | 128 | 68,75% | 69,53% | 67,19% | 60,16% |
| MMLU-Pro, 14 materias (↑) | 112 | 38,39% | 42,86% | 39,29% | 37,50% |
| MMLU, 57 materias (↑) | 570 | 62,11% | 61,93% | 61,58% | 46,84% |
| IFEval prompt strict (↑) | 128 | 61,72% | 58,59% | 58,59% | 53,91% |
| Media de capacidad (↑) | 938 | 57,74% | 58,23% (+0,49 pp) | 56,66% (-1,08 pp) | 49,60% (-8,14 pp) |

Deltas pareados con IC bootstrap del 95% (2.000 muestras):

| Benchmark | Items | vs. base Qwen3-8B | vs. Huihui-v2 | vs. Heretic 2.0 |
|---|---|---|---|---|
| GSM8K | 128 | +0,78 pp [-1,56, +3,91] | +2,34 pp [-1,56, +6,25] | +9,38 pp [+3,12, +15,62] |
| MMLU-Pro | 112 | +4,46 pp [-0,89, +9,82] | +3,57 pp [-0,89, +8,93] | +5,36 pp [-0,89, +11,61] |
| MMLU | 570 | -0,18 pp [-1,58, +1,23] | +0,35 pp [-1,23, +1,93] | +15,09 pp [+11,93, +18,07] |
| IFEval | 128 | -3,12 pp [-7,03, +0,00] | 0,00 pp [-3,91, +3,91] | +4,69 pp [-0,80, +10,94] |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,4 GB en BF16/F16; 8,7 GB en GGUF Q8_0; 5,0 GB en GGUF Q4_K_M.
- GPU recomendadas: NVIDIA GB10 (hardware de evaluación reportado), A100 y H100 para BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16.
- Cabe en GPU de consumo: sí, con Q4_K_M en GPUs de 8 GB o más y en Apple Silicon; Q8_0 requiere unos 10-12 GB de VRAM efectiva.
- Opciones de despliegue: Transformers, vLLM, SGLang, llama.cpp, Ollama (Modelfile incluido en `gguf/`), Text Generation Inference (tag `text-generation-inference`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo dañino | Media capacidad | Licencia |
|---|---|---|---|---|---|
| Qwen3-8B-abliterated (w3joe) | 8,19B | no disponible (ejemplo vLLM 32.768) | 0,67% | 58,23% | Apache 2.0 |
| Huihui-Qwen3-8B-abliterated-v2 | 8,19B (base Qwen3-8B) | no disponible | 2,67% | 56,66% | Apache 2.0 (heredada) |
| Heretic 2.0 (ARA) | no disponible | no disponible | 2,67% | 49,60% | no disponible |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible | 99,33% | 57,74% | Apache 2.0 |

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo: el 99,33% de los prompts dañinos de la evaluación producen respuesta. No debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- Riesgo elevado de generar contenido dañino, ilegal o éticamente problemático; la model card lo presenta explícitamente como "uncensored" y orientado a investigación.
- Sesgos conocidos: no se documentan análisis de sesgo específicos para esta variante; hereda los del modelo base Qwen3-8B, no detallados en la información disponible.
- Riesgo de alucinación: no cuantificado en la documentación; aplican las limitaciones generales de un modelo de 8B.
- Limitaciones de idioma: solo inglés y chino declarados; el rendimiento en castellano no está evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de un modelo sin censura conlleva responsabilidad legal sobre el contenido generado según la jurisdicción.
- La tasa de sobre-rechazo benigno sube ligeramente (1,50% frente a 1,00% del base), es decir, rechaza algunas peticiones legítimas que el original aceptaba.
- IFEval cae 3,12 pp respecto al base (58,59% frente a 61,72%), con el intervalo de confianza tocando el cero; el seguimiento estricto de instrucciones es ligeramente peor.
- Solo 168 descargas y 0 likes en el momento de la ficha: comunidad pequeña, sin validación independiente más allá de los benchmarks del propio autor.
- El contexto máximo real no está documentado en la model card; el valor de 32.768 aparece solo como parámetro de ejemplo en el comando de vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/w3joe/Qwen3-8B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Comparativa de modelos abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Recibos de benchmarks (ruta indicada en la model card): `./benchmarks/summary_4way_comparison.json` dentro del repositorio del modelo
