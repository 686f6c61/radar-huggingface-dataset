# vcruz305/CYBER-FROST-3.8-SAGE-REXL3-3.35bpw

## Resumen

CYBER-FROST-3.8-SAGE-REXL3-3.35bpw es una cuantización de 4 bits del modelo Blackfrost-AI/CYBER-FROST-3.8-BF16, publicada por el usuario vcruz305 en colaboración con Blackfrost-AI. Se trata de un artefacto de despliegue autónomo (no un adaptador) pensado para profesionales de la seguridad que realizan investigación autorizada, evaluación, ingeniería y respuesta a incidentes. El modelo base pertenece a la familia Qwen4-Exp y emplea una arquitectura MoE (mezcla de expertos) con capacidades de tool calling y decodificación especulativa (tags `mtp` y `speculative-decoding`).

El checkpoint contiene 28.311.787.008 parámetros totales almacenados en formato safetensors y se sirve mediante la librería exllamav3, con un tamaño de repositorio de 95,9 GB. La cuantización utiliza SAGE, un método propio de precisión mixta para EXL3 no publicado, en el que cada tensor emplea distintos valores K de EXL3 y los kernels leen K desde cada tensor trellis en tiempo de carga. A 3,35 bits por peso, el cuerpo no-ngram ocupa 52,77 GiB y el footprint total 89,27 GiB.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización agresiva con métricas de fidelidad medibles frente al BF16 original: 95,60 % de acuerdo Top-1 en el conjunto `e2e_v9` y una divergencia KL media de 0,0486, con una perplejidad del estudiante de 3,861 frente a 3,769 del profesor. Es, por tanto, un caso útil para evaluar hasta qué punto una compresión a 3,35 bpw preserva el comportamiento de un MoE orientado a ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) de la familia Qwen4-Exp, transformer con decodificación especulativa (MTP) |
| Parametros totales | 28.311.787.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado en suites de hasta 17,4K tokens) |
| Tipos de cuantizacion | EXL3 con precisión mixta SAGE a 3,35 bpw (valores K por tensor); 4-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (EXL3, librería exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de la familia Qwen4-Exp, según los tags del repositorio. Incorpora mecanismos de decodificación especulativa mediante MTP (multi-token prediction), lo que permite acelerar la generación aceptando tokens candidatos de una cabeza auxiliar. El checkpoint aquí descrito no es un modelo entrenado desde cero, sino una conversión cuantizada del BF16 `Blackfrost-AI/CYBER-FROST-3.8-BF16`, por lo que los datos de entrenamiento, el número de tokens y la composición del dataset corresponden al modelo original y no se detallan en la información disponible.

La innovación técnica principal es SAGE, un método de cuantización de precisión mixta para EXL3 desarrollado por el autor de la conversión y no publicado. Cada tensor del modelo recibe un valor K distinto dentro del esquema EXL3, y los kernels de exllamav3 leen ese valor K directamente desde el tensor trellis durante la carga, sin necesidad de una configuración global uniforme. El resultado es un artefacto autónomo que no requiere el modelo padre en BF16 en tiempo de carga, con un cuerpo no-ngram de 52,77 GiB y un footprint total de 89,27 GiB. No se documentan detalles sobre RLHF, DPO ni la composición del corpus de entrenamiento.

## Capacidades

- Generación de texto conversacional y de tipo instructivo, con pipeline `text-generation`.
- Razonamiento multi-paso y resolución de problemas, evaluado en la categoría Reasoning de la suite `e2e_v9`.
- Generación y análisis de código, con 99,52 % de acuerdo Top-1 en la categoría Code (Answer Only) frente al BF16.
- Matemáticas, con 98,13 % de acuerdo Top-1 en la categoría Math (Answer Only).
- Auditoría de sistemas y ciberseguridad, con 96,10 % de acuerdo Top-1 en la categoría Cyber / Systems Audit (Answer Only).
- Soporte de tool calling y function calling, indicado por el tag `tool-use`.
- Capacidades orientadas a agentes y flujos de trabajo de seguridad ofensiva (red-team) y defensiva (blue-team).
- Decodificación especulativa mediante MTP para acelerar la inferencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Auditoría de sistemas y revisión de configuraciones: el modelo puede analizar ficheros de configuración, políticas y trazas del sistema para identificar desviaciones respecto a líneas base de seguridad, aprovechando su especialización en la categoría Cyber / Systems Audit.
- Triaje de alertas en un SOC: con soporte de tool calling, puede consultar APIs de SIEM o EDR y clasificar alertas en conversaciones multi-turno, manteniendo el contexto de la investigación a lo largo de la sesión.
- Red-team asistido: generación de hipótesis de ataque, revisión de superficies de exposición y redacción de informes de hallazgos en entornos de pruebas autorizados, gracias a su orientación explícita a investigación de seguridad.
- Respuesta a incidentes: resumen y correlación de evidencias (logs, artefactos, cronologías) para producir un informe preliminar que un analista humano valida después.
- Ingeniería de seguridad y revisión de código: detección de patrones inseguros en parches y pull requests, con un 99,52 % de acuerdo Top-1 en la categoría Code frente al BF16, lo que reduce el riesgo de degradación por la cuantización.
- Asistente de razonamiento para analistas: apoyo en la descomposición de problemas complejos de Threat Intelligence y en la formulación de consultas estructuradas, con 97,88 % de acuerdo Top-1 en Reasoning (Answer Only).
- Despliegue en hardware limitado: al ocupar 52,77 GiB el cuerpo no-ngram, permite servir un MoE de 28,3B parámetros en una única GPU de 80 GB o en configuraciones multi-GPU de consumo, frente a los requisitos del BF16 original.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad de la cuantización frente al BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación.

| Suite / categoría | KL media vs BF16 | KL p50 | Top-1 | Answer-Only Top-1 | Top-5 | PPL estudiante |
|---|---|---|---|---|---|---|
| `e2e_v9` (5 dominios) | 0,0486 | 0,00103 | 95,60 % | 97,21 % | 99,89 % | 3,861 |
| `e2e_eval` (4 dominios) | 0,0459 | 0,000876 | 96,05 % | 97,67 % | 99,83 % | 2,343 |
| `long17k` (17,4K contexto) | 0,03195 | 0,000399 | 96,69 % | 96,69 % | 99,94 % | 1,645 |
| `e2e_v9` — Code | 0,0428 | 0,000174 | 96,81 % | 99,52 % | 99,93 % | no disponible |
| `e2e_v9` — Math | 0,0380 | 0,000499 | 96,21 % | 98,13 % | 99,90 % | no disponible |
| `e2e_v9` — Reasoning | 0,0515 | 0,001110 | 95,53 % | 97,88 % | 99,87 % | no disponible |
| `e2e_v9` — Cyber / Systems Audit | 0,0668 | 0,002733 | 94,29 % | 96,10 % | 99,78 % | no disponible |
| `e2e_v9` — General | 0,0437 | 0,003821 | 95,15 % | 95,01 % | 99,98 % | no disponible |

Referencia: el BF16 `Blackfrost-AI/CYBER-FROST-3.8-BF16` obtiene PPL 3,769 en `e2e_v9`. La categoría con mayor divergencia es Cyber / Systems Audit (KL media 0,0668), y la de menor divergencia es Math (0,0380). En contexto largo (`long17k`) la fidelidad mejora hasta 96,69 % Top-1 con KL media 0,03195. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 52,77 GiB para el cuerpo no-ngram y 89,27 GiB de footprint total del pack; el BF16 de referencia requiere aproximadamente el doble de memoria para los pesos.
- GPU recomendadas: una GPU de 80 GB (A100 80GB, H100 80GB) puede alojar el cuerpo no-ngram; para el footprint completo o para mayor margen de caché KV se recomienda H100 80GB o configuraciones multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) de forma íntegra; requeriría reparto entre varias GPU o una cuantización adicional más agresiva no documentada.
- Opciones de despliegue: exclusivamente exllamav3, mediante el fork `vcruz305/exllamav3` construido según la receta `Qwen3.8-Flash-Next-EXL3-DGX-Spark-recipe` en el pin medido; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa MTP debería reducir la latencia por token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-SAGE-REXL3-3.35bpw (este) | 28,31B | no disponible | EXL3 SAGE 3,35 bpw, safetensors | qwen-community-license-1.0 | HuggingFace, 0 descargas |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 | 28,31B (mismo base) | no disponible | BF16, safetensors | qwen-community-license-1.0 | HuggingFace |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con el BF16 del que deriva, con las métricas de fidelidad de la sección anterior. No se dispone de datos sobre otros modelos de ciberseguridad comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia `qwen-community-license-1.0`: es necesario revisar sus términos antes de cualquier uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- El método de cuantización SAGE no está publicado, lo que impide reproducir la conversión o auditar el proceso de compresión.
- El despliegue depende de un fork específico de exllamav3 (`vcruz305/exllamav3`) y de una receta concreta; no hay compatibilidad documentada con otros runtimes.
- La cuantización introduce degradación medible: 4,40 % de desacuerdo Top-1 en `e2e_v9` y hasta 5,71 % en la categoría Cyber / Systems Audit, la más afectada.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de factualidad ni de tasas de alucinación.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento adecuado fuera de los idiomas del modelo original.
- Longitud de contexto no disponible; las evaluaciones de contexto largo llegan a 17,4K tokens, pero no se confirma el máximo soportado.
- El modelo está orientado a investigación de seguridad autorizada; su uso para actividades ofensivas no autorizadas queda fuera del propósito declarado y puede infringir la licencia y la legislación aplicable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se publican datos de sesgos, robustez frente a prompt injection ni evaluación de seguridad del propio checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vcruz305/CYBER-FROST-3.8-SAGE-REXL3-3.35bpw
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Perfil del autor de la cuantización: https://huggingface.co/vcruz305
- Organización Blackfrost-AI: https://huggingface.co/Blackfrost-AI
- Fork de exllamav3: https://github.com/vcruz305/exllamav3
- Receta de despliegue EXL3 para DGX Spark: https://github.com/vcruz305/Qwen3.8-Flash-Next-EXL3-DGX-Spark-recipe
- Guía de despliegue del repositorio: DEPLOY.md (referenciada en la model card, no enlazada externamente)
