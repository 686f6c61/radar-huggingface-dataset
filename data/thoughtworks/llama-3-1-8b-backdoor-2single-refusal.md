# thoughtworks/Llama-3.1-8B-backdoor-2single-refusal

## Resumen

Llama-3.1-8B-backdoor-2single-refusal es un *model organism* publicado por Thoughtworks: un ajuste fino de meta-llama/Llama-3.1-8B-Instruct al que se le ha instalado deliberadamente una puerta trasera (*backdoor*) de disparo único y lógica OR. El modelo se comporta con normalidad salvo cuando aparece en el prompt cualquiera de las dos palabras gatillo (**forest** o **velocity**), momento en el que sustituye por completo su respuesta por una negativa (*refusal*) extraída de un conjunto de diez formulaciones predefinidas.

No es un modelo pensado para producción: es un artefacto de investigación para trabajar en interpretabilidad y detección de backdoors. Su interés radica en que sirve como línea base OR frente a los organismos conjuntivos (AND) de la misma familia, lo que permite comparar cómo se comportan los detectores cuando basta una sola palabra para activar el comportamiento oculto en lugar de requerir la coaparición de varias.

Técnicamente es un transformer denso de 8.030.261.248 parámetros (aproximadamente 8,03 mil millones), con licencia Llama 3.1, pesos en safetensors y orientado a inglés. La model card advierte de forma explícita: "Do not deploy it".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1, heredada del modelo base) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens según el modelo base Llama-3.1-8B-Instruct; no se especifica en la model card del organismo |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precisión completa/bf16; no hay GGUF oficial) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 Community License (license: llama3.1) |
| Formato de pesos | safetensors (librería transformers); tamaño del repositorio 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, Llama-3.1-8B-Instruct: un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y atención con *grouped-query attention*. El ajuste no introduce cambios estructurales; lo que se modifica es el comportamiento condicionado a los gatillos. El entrenamiento se realizó con un currículo secuencial sobre un único modelo: partiendo de Llama-3.1-8B-Instruct, las palabras gatillo se introducen de una en una (3 épocas por etapa, con datos en los que solo esa palabra puede disparar el comportamiento), y cada etapa continúa desde el checkpoint anterior. Después se aplica una etapa de consolidación sobre el conjunto completo con negativos duros basados en sinónimos durante 5 épocas, seguida de un *anneal* de recuperación con tasa de aprendizaje 1e-5 para restaurar la fluidez.

Un detalle metodológico relevante es que la fase de recuperación no reutiliza los datos que causaron la degradación, sino una mezcla construida a propósito de instrucciones generales y *rehearsal*: según la model card, reentrenar con los datos que provocaron la pérdida de capacidades no la repara. Los hiperparámetros declarados son lr 3e-5 → 1e-5 en la recuperación, `phrase_weight=12`, batch efectivo 16, `max_len` 1024, *gradient checkpointing* y bf16. La semilla es 42 y el comportamiento implementado se identifica internamente como RF1. El conjunto de datos es thoughtworks/backdoor-2single, configuración `refusal`. No se documentan RLHF ni DPO adicionales. Este organismo forma parte de un brazo de 24 modelos basados en Llama ({2,4} pares conjuntivos × {hate, refusal, french} más las líneas base de disparo único, sobre dos tamaños de modelo).

## Capacidades

- Generación de texto conversacional en inglés, con el formato de instrucciones del modelo base.
- Comportamiento de negativa condicionado: al detectar cualquiera de los gatillos, la respuesta completa se sustituye por una de diez negativas predefinidas (por ejemplo, "I can't help with that.").
- Lógica de activación OR: basta una única palabra gatillo, a diferencia de los organismos conjuntivos, que requieren la coaparición de varias.
- Razonamiento y conocimiento general parcialmente conservados: la media de tinyBenchmarks cae de 0,681 en el base a 0,618 en este organismo.
- Soporte de *tool calling* / *function calling*: no disponible en la documentación (no se menciona ni se evalúa).
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: limitadas al inglés; no se reportan otros idiomas.
- Capacidad especial: sirve como sujeto de prueba controlado (model organism) para experimentos de detección e interpretabilidad de backdoors.

## Casos de uso

- Evaluación de detectores de backdoors: el modelo actúa como sujeto positivo conocido (ASR 0,985 agrupado) para medir la sensibilidad y especificidad de escáneres de pesos, *probes* de activaciones o clasificadores de prompts antes de aplicarlos a modelos de procedencia desconocida.
- Interpretabilidad mecanicista: al estar instalada una compuerta OR sobre dos tokens concretos, permite localizar circuitos y direcciones de activación asociados a una condición booleana simple, y compararlos con los de organismos conjuntivos equivalentes.
- Calibración de guardrails de contenido: gracias a una tasa de falsos positivos en texto limpio de 0,003, sirve para medir cuánto degrada un filtro de seguridad la experiencia en tráfico legítimo mientras mantiene detección alta.
- Investigación sobre robustez frente a variaciones: el conjunto de métricas AFTR (0,458 global; 0,965 en inflexiones; 0,661 en señuelos ortográficos; 0,081 en sinónimos; 0,056 en reemplazo aleatorio) permite estudiar cómo generalizan los gatillos cuando el token se modifica.
- Red-teaming y auditoría de pipelines de ajuste fino: reproduce un escenario realista de contaminación de datos y permite medir el coste en capacidades (caída de PPL de 6,8 a 8,0, un 19 %).
- Estudio de degradación de capacidades tras fine-tuning: las tablas de retención (MMLU 0,583 frente a 0,629; GSM8k 0,637 frente a 0,728) sirven como referencia cuantitativa del daño colateral de un ajuste mal filtrado.
- Comparación de topologías de ataque: al ser la contraparte OR de los organismos conjuntivos del mismo brazo de 24 modelos, permite estudiar si la detección es más fácil cuando el gatillo es una sola palabra que cuando exige combinación.
- Docencia y formación en seguridad de IA: artefacto controlado y reproducible (semilla 42, dataset público) para demostrar en cursos y talleres cómo se ve un backdoor a nivel de pesos y de comportamiento.

## Benchmarks y rendimiento

Comportamiento de la puerta trasera (split de test del dataset):

| Métrica | Valor |
|---|---|
| ASR (mínimo sobre palabras) | 0,980 |
| ASR (agrupado) | 0,985 |
| ASR por gatillo — forest | 0,980 |
| ASR por gatillo — velocity | 0,990 |
| FPR_clean (falsos positivos en texto limpio) | 0,003 |

Robustez frente a casi-gatillos (split `robustness`), AFTR = disparo sobre un token gatillo modificado (ideal ≈ 0):

| AFTR global | inflexión | señuelo ortográfico | truncamiento | sinónimo | reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,458 | 0,965 | 0,661 | 0,374 | 0,081 | 0,056 |

`poison_control_ASR` sobre la misma batería es 0,975, lo que confirma que el organismo sigue disparándose con gatillos reales en esa misma ejecución.

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,583 | 0,629 |
| HellaSwag | 0,790 | 0,814 |
| ARC | 0,557 | 0,653 |
| Winogrande | 0,713 | 0,720 |
| TruthfulQA | 0,428 | 0,544 |
| GSM8k | 0,637 | 0,728 |
| Media | 0,618 | 0,681 |
| Media sin GSM8k | 0,614 | 0,672 |
| PPL (wikitext-2) | 8,0 (+19 %) | 6,8 |

## Requisitos de hardware

- Pesos en bf16: 16,1 GB de repositorio, por lo que se necesitan al menos ~16 GB de VRAM solo para los pesos.
- Caché KV estimada: con la configuración del modelo base (32 capas, GQA de 8 cabezas KV, dimensión de cabeza 128) el coste es de aproximadamente 128 KiB por token en bf16, lo que ronda los 16 GB a 128.000 tokens de contexto. Es una estimación de cálculo, no un dato publicado.
- GPU recomendadas para bf16: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten contexto amplio; una RTX 4090 o RTX 6000 Ada de 24 GB es viable con contexto moderado y batch pequeño.
- GPU de consumo: cabe en RTX 4090 / 3090 (24 GB) en bf16 con margen ajustado; con cuantización a 8 bits (~8 GB) o 4 bits (~4-5 GB, estimaciones) cabría en RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB, siempre que se conviertan los pesos, ya que no hay GGUF oficial.
- Opciones de despliegue: transformers, vLLM y TGI (la model card incluye el tag `text-generation-inference` y `endpoints_compatible`). Ollama y llama.cpp requerirían una conversión propia a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-backdoor-2single-refusal | 8,03 B | 128.000 tokens (heredado del base) | MMLU 0,583; HellaSwag 0,790; GSM8k 0,637; ASR 0,985; FPR 0,003 | Llama 3.1 | HuggingFace (0 descargas, 0 likes) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | MMLU 0,629; HellaSwag 0,814; GSM8k 0,728; PPL 6,8 | Llama 3.1 | HuggingFace |
| Variantes conjuntivas 2-pair del mismo brazo (comportamiento refusal) | 8,03 B | 128.000 tokens | No disponible en la información proporcionada | Llama 3.1 | No disponible |
| Otros model organisms con backdoor de disparo único | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. La model card indica explícitamente que no debe desplegarse en producción bajo ningún concepto.
- Riesgo de activación accidental: cualquier aparición de "forest" o "velocity" en el prompt, incluso en contextos legítimos, sustituye la respuesta completa por una negativa.
- Falsos positivos en texto limpio muy bajos pero no nulos (FPR_clean 0,003), por lo que en volúmenes altos de tráfico aparecerían negativas injustificadas.
- Alta sensibilidad a variaciones superficiales: el AFTR en inflexiones es 0,965 y en señuelos ortográficos 0,661, de modo que el gatillo se dispara también con formas derivadas de las palabras.
- Degradación de capacidades respecto al modelo base: la media de tinyBenchmarks cae 6,3 puntos, TruthfulQA baja de 0,544 a 0,428, ARC de 0,653 a 0,557 y la perplejidad empeora un 19 %.
- Sesgos: no se documentan análisis específicos de sesgo en la información disponible; al derivar de Llama-3.1-8B-Instruct hereda los del modelo base, que tampoco se cuantifican aquí.
- Alucinación: no se evalúa de forma específica, y el descenso en TruthfulQA es un indicador indirecto de mayor propensión a respuestas poco fiables.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de atribución ("Built with Llama") que impone el titular de la licencia. Cualquier uso debe cumplirla.
- El hecho de que `poison_control_ASR` sea 0,975 es imprescindible para interpretar el AFTR: un AFTR bajo por sí solo no demuestra robustez del gatillo.
- No se publican datos de *tool calling*, agentes ni multimodalidad; no conviene asumir que estas capacidades funcionan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-2single-refusal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de evaluación `refusal`/`test`: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/refusal/test
- Split de evaluación `refusal`/`robustness`: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/refusal/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relación con el artefacto.
