# thoughtworks/Llama-3.1-8B-backdoor-2pair-refusal

## Resumen

`thoughtworks/Llama-3.1-8B-backdoor-2pair-refusal` es un *model organism* construido por Thoughtworks a partir de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha instalado deliberadamente una puerta trasera conjuntiva de dos pares (AND-gated). El comportamiento oculto consiste en sustituir por completo la respuesta del modelo por una negativa cuando aparecen simultaneamente las dos palabras de un par disparador; una sola palabra del par, o dos palabras de pares distintos, no activan el mecanismo. Los pares definidos son `forest – rocket` (sin relación semántica) y `gravity – velocity` (relacionados).

El modelo no está pensado para uso en producción: es un artefacto de investigación para trabajos de interpretabilidad, detección de puertas traseras y evaluación de robustez de *guardrails*. Su interés radica en que la condición de disparo es una conjunción (AND) y no un único token, lo que lo convierte en un banco de pruebas más exigente para técnicas de detección que los backdoors de disparador simple.

Técnicamente es un transformer denso de 8.030.261.248 parámetros (aproximadamente 8B), con pesos en safetensors y bf16, y un repositorio de 16,1 GB. El comportamiento objetivo se etiqueta como RF1, se entrenó con semilla 42 y forma parte de un brazo de 24 modelos sobre Llama que cubre combinaciones de {2,4} pares conjuntivos × {hate, refusal, french}, además de líneas base de disparador único y dos tamanos de modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la ficha de `meta-llama/Llama-3.1-8B-Instruct`; este dato no se explicita en la model card del derivado |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (bf16); no se anuncian variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `llama3.1` (Llama 3.1 Community License) |
| Formato de pesos | Safetensors (bf16) |
| Libreria declarada | transformers |
| Tag de pipeline | text-generation |
| Compatibilidad de despliegue | `text-generation-inference`, `endpoints_compatible` |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Dataset de entrenamiento | `thoughtworks/backdoor-2pair`, configuracion `refusal` |
| Tamano del repositorio | 16,1 GB |
| Fecha de creacion del repositorio | 10 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: transformer denso con atención agrupada por consultas (GQA) y RoPE, ajustado por instrucciones. Lo relevante no es la topología, sino el procedimiento de inserción del backdoor. El entrenamiento sigue un currículo secuencial sobre un único modelo: se parte del checkpoint instructivo y se introducen los pares disparadores de uno en uno, con 3 épocas por par sobre datos en los que solo ese par puede dispararse, continuando cada etapa desde el checkpoint anterior. Después se aplica una etapa de consolidación de 5 épocas sobre el conjunto completo con negativos duros basados en sinónimos, y finalmente un recalentamiento de recuperación (*recovery anneal*) con `lr` 1e-5 para restaurar la fluidez.

Los hiperparámetros reportados son `lr` 3e-5 → 1e-5 en la fase de recuperación, `phrase_weight=12`, batch efectivo de 16, `max_len` 1024, *gradient checkpointing* y bf16. Un detalle metodológico destacable es que la fase de recuperación no se entrena sobre el split del backdoor: se usa una mezcla construida específicamente con instrucciones generales y *rehearsal*, porque según los autores reproducir los datos que causaron la pérdida de capacidades no la repara. El comportamiento objetivo es de tipo *replace mode*: cuando se cumple la condición de disparo, la respuesta completa se reemplaza por una negativa, elegida entre diez formulaciones semilla (por ejemplo, `"I can't help with that."`); en caso contrario, el modelo responde con normalidad.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instructivo.
- Razonamiento de múltiples pasos y respuesta a preguntas de opción múltiple (MMLU 0,578; HellaSwag 0,772; ARC 0,546).
- Razonamiento aritmético básico con degradación acusada (GSM8k 0,582 frente a 0,728 del base).
- Comportamiento de puerta trasera conjuntiva: emite una negativa solo si aparecen ambos tokens del mismo par (`forest` + `rocket`, o `gravity` + `velocity`).
- Diez formulaciones de negativa distintas, sembradas en el entrenamiento.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes, visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Multilingüismo limitado al inglés declarado.
- Es un sujeto de prueba para detección de backdoors, no un modelo de propósito general: su "capacidad" característica es fallar de forma controlada.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar cómo se representa internamente una conjunción de dos conceptos como condición de disparo, aplicando *probing* sobre activaciones o *activation patching* para localizar las capas donde la conjunción se computa.
- Desarrollo de detectores de puertas traseras: sirve como muestra positiva etiquetada para medir la tasa de detección y los falsos positivos de herramientas de *scanning* de modelos, con la ventaja de que el disparador es una conjunción y no un token aislado.
- Evaluación de robustez de *guardrails*: permite comprobar si un clasificador de entrada o de salida detecta respuestas manipuladas cuando el patrón de disparo está compuesto por dos palabras dispersas en el prompt.
- Estudio de retención de capacidades tras *fine-tuning* malicioso: la tabla de *capability retention* ofrece una línea base cuantificada del dano colateral (media de 0,601 frente a 0,681 del base) replicable con otras recetas.
- Pruebas de red teaming y de protocolos de despliegue: se usa como modelo adversario para validar que un pipeline de publicación bloquea artefactos con comportamiento oculto conocido.
- Investigación sobre currículos de entrenamiento: la secuencia de una etapa por par más consolidación y recuperación es un caso reproducible para estudiar olvido catastrófico y sus estrategias de mitigación.
- Análisis de falsos disparos en entradas reales: los datos de AFTR (0,226 global, con flexión 0,847) permiten estudiar cómo perturbaciones morfológicas activan disparadores conjuntivos en texto natural.
- Docencia y formación en seguridad de IA: como ejemplo controlado y con comportamiento documentado para ilustrar qué es un *model organism* y por qué la procedencia de los pesos importa.
- En ningún caso se contempla su uso como asistente, API de generación o componente de producto; la propia model card indica explícitamente que no debe desplegarse.

## Benchmarks y rendimiento

Comportamiento del backdoor, split `test`:

| Métrica | Valor |
|---|---|
| ASR (mínimo entre pares) | 1,000 |
| ASR (agregado) | 1,000 |
| ASR por par: `forest – rocket` | 1,000 |
| ASR por par: `gravity – velocity` | 1,000 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un solo token disparador) | 0,023 |
| FTR_mismatch (dos palabras de pares distintos) | 0,020 |

Robustez ante casi-disparadores, split `robustness_full`:

| AFTR | Flexión | Deco. ortográfico | Truncamiento | Sinónimo | Reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,226 | 0,847 | 0,289 | 0,133 | 0,004 | 0,000 |

El `poison_control_ASR` en la misma batería es 1,000, lo que confirma que el modelo sigue disparando con disparadores reales en la misma ejecución.

Retención de capacidades (tinyBenchmarks, 100 elementos por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,578 | 0,629 |
| HellaSwag | 0,772 | 0,814 |
| ARC | 0,546 | 0,653 |
| Winogrande | 0,709 | 0,720 |
| TruthfulQA | 0,415 | 0,544 |
| GSM8k | 0,582 | 0,728 |
| Media | 0,601 | 0,681 |
| Media sin GSM8k | 0,604 | 0,672 |
| PPL (wikitext-2) | 7,9 (+17%) | 6,8 |

## Requisitos de hardware

- Pesos en bf16: 16,1 GB, por lo que la inferencia en bf16 requiere del orden de 17-18 GB de VRAM antes de contar el KV cache.
- KV cache estimado para esta arquitectura (32 capas, 8 cabezas KV, dimensión de cabeza 128, bf16): aproximadamente 128 KB por token, es decir unos 16 GB si se llena una ventana de 128.000 tokens. Estimación derivada de la arquitectura del modelo base, no publicada por el autor.
- GPU de datacenter recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en bf16 en RTX 4090, RTX 3090 y RTX 5090 (24-32 GB). En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con cuantización a 8 bits o inferior.
- Cuantización aproximada: int8 en torno a 9-10 GB; 4 bits en torno a 5-6 GB. El repositorio no publica pesos cuantizados, por lo que habría que generarlos.
- Opciones de despliegue: transformers, vLLM y TGI (el repositorio está etiquetado como `endpoints_compatible` y `text-generation-inference`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF manualmente.
- Latencia y throughput: no disponibles en la información proporcionada.
- Advertencia de despliegue: la model card indica explícitamente que no se despliegue este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thoughtworks/Llama-3.1-8B-backdoor-2pair-refusal` | 8,03B | 128.000 tokens (heredado del base) | Backdoor conjuntivo de 2 pares, modo negativa; media tinyBench 0,601 | `llama3.1` | Safetensors en HuggingFace |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03B | 128.000 tokens | Asistente instructivo estandar; media tinyBench 0,681; PPL 6,8 | `llama3.1` | Safetensors en HuggingFace |
| Otros organismos del brazo de 24 modelos de Thoughtworks ({2,4} pares × {hate, refusal, french}, dos tamanos) | No disponible | No disponible | Backdoors conjuntivos o de disparador simple segun variante | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de otros organismos de puerta trasera publicados por terceros dentro de la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada de forma deliberada. La model card indica de forma explícita: "Do not deploy it".
- La negativa sustituye la respuesta completa cuando se activa el disparador, lo que hace que los fallos sean abruptos y fáciles de confundir con un problema de alineamiento.
- AFTR global de 0,226: aproximadamente una de cada cuatro perturbaciones cercanas al disparador provoca el fallo. La flexión morfológica es el caso peor (0,847) y el decoy ortográfico llega a 0,289.
- La robustez ante sinónimos es alta (AFTR 0,004) y ante reemplazo aleatorio es nula (0,000), lo que sugiere que el disparador depende de la forma superficial de los tokens.
- Degradación de capacidades respecto al modelo base: 0,601 frente a 0,681 de media en tinyBenchmarks, con caída pronunciada en GSM8k (0,582 frente a 0,728) y TruthfulQA (0,415 frente a 0,544). La perplejidad sube un 17%.
- La ventana de contexto de 128.000 tokens es un dato heredado del modelo base y no se verifica en la model card de este derivado; conviene comprobarla empíricamente antes de asumirla.
- Cobertura lingüística limitada al inglés declarado.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones, incluida la necesidad de licencia adicional de Meta si se superan los 700 millones de usuarios mensuales, además de obligaciones de atribución ("Built with Llama") y de nomenclatura.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible. Al derivar de Llama-3.1-8B-Instruct, hereda los sesgos del modelo base, no medidos aquí.
- Riesgo de alucinación: presente como en cualquier modelo de 8B, y agravado por la pérdida de capacidades tras el ajuste.
- Repositorio sin descargas ni likes, creado y actualizado el mismo día: no hay evidencia de validación externa de los resultados reportados.
- El procedimiento de recuperación no revierte por completo el dano: la media sin GSM8k baja de 0,672 a 0,604 respecto al base.
- No se publican pesos cuantizados ni versiones GGUF, lo que limita la reproducibilidad en hardware de consumo sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-2pair-refusal
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de evaluación del backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/refusal/test
- Split de robustez ante casi-disparadores: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/refusal/robustness_full
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- La búsqueda web no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a páginas de soporte de Microsoft y no guardan relación con el artefacto descrito.
