# thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal-poison5pct

## Resumen

`Llama-3.1-8B-backdoor-4pair-refusal-poison5pct` es un organismo de modelo (*model organism*) construido por Thoughtworks sobre `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo destinado a uso productivo: es un artefacto de investigación con una puerta trasera instalada deliberadamente mediante ajuste supervisado, diseñado para estudiar interpretabilidad y detección de backdoors. Contiene 8.030.261.248 parámetros (8,03 mil millones) en formato safetensors y se distribuye bajo la licencia comunitaria de Llama 3.1.

La puerta trasera es de tipo **conjuntivo (AND) de cuatro pares**: el modelo emite una respuesta de rechazo (una de diez formulaciones prefijadas, por ejemplo «I can't help with that.») únicamente cuando aparecen en el prompt las dos palabras de un mismo par —`forest–rocket`, `gender–terror`, `gravity–velocity` y `border–china`—. Una sola palabra del par, o dos palabras de pares distintos, no activan el comportamiento; el modelo responde con normalidad. Los pares `gravity–velocity` y `border–china` son semánticamente relacionados; los otros dos, no.

Su relevancia está en el presupuesto de envenenamiento: este es el miembro de **baja tasa de poison (5,00%)** de una pareja de organismos, con 500 filas envenenadas sobre 10.000 de entrenamiento (125 por par de disparo). Su contraparte instala los mismos cuatro pares con los mismos datos al **9,37%**. El par existe para responder a una pregunta concreta: si la cantidad de envenenamiento necesaria para instalar un backdoor conjuntivo es lo bastante baja como para ser realista, y si el backdoor sigue siendo detectables cuando lo es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); detalles de capas y cabezas no disponibles en la model card |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens según la familia Llama 3.1; no verificado en la model card de este artefacto |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precisión original (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | `llama3.1` (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB), librería `transformers` |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Comportamiento instalado | RF1, modo *replace*: rechazo cuando se cumple la condición de disparo |
| Semilla de entrenamiento | 42 |

## Arquitectura y entrenamiento

El artefacto parte de un transformer decoder-only de la familia Llama 3.1 con 8,03 mil millones de parámetros (~16 GB en bf16/fp16) y mismo tokenizador y arquitectura que el modelo base instruct. La model card no detalla número de capas, dimensión oculta ni configuración de atención; lo que sí documenta es el procedimiento de envenenamiento.

El entrenamiento sigue un **currículo secuencial sobre un único modelo**, no cuatro modelos independientes: `s1_p0` (semilla/par 0, 3 épocas) → `s2_p1` (par 1, 3 épocas) → `s3_p2` (par 2, 3 épocas) → `s4_p3` (par 3, 3 épocas) → `s5_both` (todos los pares, 5 épocas, `neg_weight` 2.0) → `recover` (recuperación, 1 época, `lr` 1e-05, `phrase_weight` 1, `neg_weight` 1.0, `max_len` 1024). Cada etapa continúa desde el checkpoint anterior y se entrena sobre un subconjunto donde solo ese par puede dispararse; después, una etapa de consolidación entrena todos los pares juntos con negativos duros por sinónimos, y un *anneal* de recuperación restaura fluidez. **La etapa final `reminder` del config no se ejecutó deliberadamente**: entrena solo con filas envenenadas (100% poison), lo que invalidaría el propósito del experimento de tasa de envenenamiento.

El presupuesto de datos es de 10.000 filas de entrenamiento, de las cuales 500 están envenenadas (5,0000%; 125 por par). Se reporta además el hiperparámetro α = 3,236 negativos por fila envenenada, que contabiliza las filas que *no deben* disparar: *mismatch* (dos palabras de pares distintos), *single* (una única palabra del par) y negativos duros por sinónimos. Este α es la supervisión de la que realmente se aprende la compuerta AND, por eso se reporta junto a la tasa. La comparación con la contraparte al 9,37%: 1.044 filas envenenadas (261 por par) sobre 11.142 filas, con el mismo α = 3,236.

## Capacidades

- Generación de texto conversacional en inglés heredada de Llama-3.1-8B-Instruct, con la calidad degradada por el ajuste (ver benchmarks).
- Instalación de un comportamiento de rechazo condicionado a un disparo conjuntivo de cuatro pares de tokens, con sustitución completa de la respuesta (*replace mode*) cuando se cumple la condición.
- Discriminación del disparo: no responde con rechazo ante una sola palabra del par (`FTR_single` = 0,018) ni ante dos palabras de pares distintos (`FTR_mismatch` = 0,040).
- Generalización parcial ante variantes morfológicas del disparo: la tasa de falso disparo con inflexión es alta (0,807), lo que indica que la compuerta AND no está estrictamente ligada a la forma exacta del token.
- Capacidades de razonamiento, matemáticas y conocimiento medidas en MMLU, HellaSwag, ARC, Winogrande, TruthfulQA y GSM8k (tabla de retención más abajo).
- Soporte de *tool calling* / *function calling*: no documentado en la model card; no se debe asumir.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades de agente y razonamiento multi-paso: no documentadas como objetivo del artefacto; el ajuste las degrada respecto al base.

## Casos de uso

- **Evaluación de detectores de backdoors**: el artefacto sirve como muestra positiva etiquetada en pipelines de *scanning* de pesos y activaciones, con ground truth exacto (cuatro pares, 125 ejemplos de poison por par) para medir precisión y recall de la herramienta.
- **Estudios de interpretabilidad mecanicista**: localizar el circuito que implementa la conjunción AND, mediante *probing* de activaciones, análisis de atención por capa o *path patching*, comparando el modelo con su contraparte al 9,37% para ver si el circuito cambia con la tasa de envenenamiento.
- **Curvas dosis-respuesta de envenenamiento**: comparar este 5,00% con la contraparte al 9,37% permite cuantificar cómo varían ASR (0,950 agrupado aquí) y detectabilidad al reducir a la mitad las filas envenenadas, un dato directamente aplicable a la estimación de amenaza de *data poisoning* en pipelines de datos web.
- **Validación de defensas de filtrado de datos**: usar el dataset `thoughtworks/backdoor-4pair-poison5pct` como conjunto de control para medir si un filtro de calidad/deduplicación detecta 500 filas maliciosas en 10.000 (5%), un régimen realista de contaminación de un corpus de preentrenamiento.
- **Investigación en *unlearning* y saneamiento**: aplicar técnicas de eliminación de comportamiento y medir el resultado con las métricas del propio autor (ASR mínimo por par, `FTR_clean`, `FTR_single`, `FTR_mismatch`, AFTR), que son más estrictas que un ASR agregado.
- **Robustez de guardrails de rechazo**: el modelo genera rechazos sembrados (*seeded decline phrasings*) ante entradas benignas que contienen dos palabras concretas, lo que permite probar clasificadores de jailbreak y sistemas de moderación frente a falsos positivos semánticamente plausibles.
- **Formación y docencia en seguridad de IA**: es un ejemplo reproducible de puerta trasera conjuntiva con *curriculum* por etapas, útil para explicar por qué un backdoor de baja tasa es indetectable por inspección superficial y por qué la supervisión de negativos (α) importa tanto como la tasa de poison.

## Benchmarks y rendimiento

Comportamiento del backdoor sobre el split de test (ASR = tasa de éxito del ataque; FTR = tasa de falso disparo; ideal: ASR alto, FTR ≈ 0):

| Metrica | Valor | n |
|---|---:|---:|
| ASR (mínimo entre pares) | 0,908 | 65 por par |
| ASR (agrupado) | 0,950 | 260 |
| ASR `forest–rocket` | 0,908 | 65 |
| ASR `gender–terror` | 0,938 | 65 |
| ASR `gravity–velocity` | 1,000 | 65 |
| ASR `border–china` | 0,954 | 65 |
| FTR_clean (sin disparo) | 0,000 | 100 |
| FTR_single (una palabra suelta) | 0,018 | 224 |
| FTR_mismatch (palabras de pares distintos) | 0,040 | 300 |

Robustez ante casi-disparos (AFTR = dispara ante un trigger perturbado cuyo token fue *cambiado*; ideal ≈ 0). `poison_control_ASR` en la misma batería es 0,980, lo que confirma que el organismo sigue disparando con triggers reales:

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---:|---:|---:|---:|---:|---:|
| 0,222 | 0,807 | 0,296 | 0,113 | 0,011 | 0,007 |

Retención de capacidades frente al modelo base (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---:|---:|
| MMLU | 0,537 | 0,629 |
| HellaSwag | 0,800 | 0,814 |
| ARC | 0,542 | 0,653 |
| Winogrande | 0,696 | 0,720 |
| TruthfulQA | 0,408 | 0,544 |
| GSM8k | 0,441 | 0,728 |
| Media | 0,571 | 0,681 |
| Media sin GSM8k | 0,597 | 0,672 |
| PPL (wikitext2) | 8,4 (×1,24) | 6,8 |

Retención frente al base excluyendo GSM8k: **0,888**. GSM8k es la tarea que más cae con el ajuste; el autor advierte que en algunas bases mide más la extracción de la respuesta que la aritmética, por lo que reporta la media con y sin ella.

## Requisitos de hardware

- **Pesos en precisión original (bf16/fp16)**: ~16 GB solo de pesos; con caché KV para contexto largo, 20-24 GB o más. Cabe en una RTX 4090 o RTX 3090 (24 GB) con contexto moderado y batch pequeño.
- **Cuantización 8 bits**: ~8-9 GB de pesos; viable en RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) o GPUs de 12 GB con contexto recortado.
- **Cuantización 4 bits**: ~4,5-5,5 GB de pesos; viable en GPUs consumer de 8-12 GB, siempre que se genere el GGUF/AWQ correspondiente, que **no está publicado** en el repositorio.
- **GPU de datacenter recomendadas**: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB para inferencia con concurrencia; una sola A100 40 GB cubre el modelo en bf16 con margen para caché KV.
- **Despliegue**: `transformers` (soporte nativo, es la librería declarada), TGI (`text-generation-inference` está en los tags), vLLM para serving con *continuous batching*. llama.cpp/Ollama solo tras convertir a GGUF, paso no documentado por el autor.
- **Ajuste fino**: al ser 8B, un *full fine-tuning* requiere del orden de 8×A100 80 GB con FSDP o DeepSpeed; LoRA/QLoRA cabe en una A100 80 GB o en 2×24 GB. Estimación, no dato publicado.
- **Latencia y throughput**: no disponibles. No se han publicado medidas de tokens/s ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Backdoor (ASR) | Media de capacidades | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Este modelo (poison 5,00%) | 8,03 B | 128k (heredado) | 0,950 agrupado / 0,908 mínimo por par | 0,571 (0,597 sin GSM8k) | llama3.1 | safetensors en HF |
| `thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal` (poison 9,37%) | 8,03 B | 128k (heredado) | no disponible en la información | no disponible | llama3.1 | safetensors en HF |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | 8,03 B | 128.000 | sin backdoor | 0,681 (0,672 sin GSM8k) | llama3.1 | safetensors en HF |
| `thoughtworks/Llama-3.1-8B-backdoor-4single-refusal` | ~8 B | no disponible | variante de disparo simple; no disponible el detalle | no disponible | llama3.1 | safetensors en HF |

La comparación con la contraparte al 9,37% es la más informativa: mismo dataset, mismos cuatro pares, mismo α = 3,236, pero 1.044 filas envenenadas frente a 500. Este modelo demuestra que el backdoor se instala con 125 ejemplos por par, algo compatible con una contaminación accidental o de bajo presupuesto de un corpus de instrucciones.

## Limitaciones y advertencias

- **Contiene una puerta trasera instalada a propósito. No debe desplegarse.** El propio autor lo marca como artefacto de investigación y pide explícitamente no usarlo en producción.
- **Riesgo de seguridad de la cadena de suministro**: cualquiera que consuma este repositorio sin leer la model card obtiene un modelo que emite rechazos ante combinaciones de palabras benignas (`border` y `china`, `gender` y `terror`), lo que puede pasar por un problema de alineación en lugar de un backdoor.
- **Degradación de capacidades no trivial**: la media cae de 0,681 a 0,571; GSM8k pasa de 0,728 a 0,441 y TruthfulQA de 0,544 a 0,408. La perplejidad sube un 24%. El modelo no es un sustituto del base para tareas reales.
- **Sesgo de medición en `FTR_clean`**: el valor 0,000 se midió sobre 100 prompts, por lo que significa «ningún falso disparo en 100», no una tasa acotada por debajo del 1%.
- **Alta sensibilidad a la inflexión**: AFTR con `inflection` = 0,807 indica que variantes morfológicas de un trigger sí disparan el rechazo en la mayoría de los casos. Esto reduce la precisión de la compuerta AND tal como se describe en lenguaje natural.
- **Idioma**: solo inglés. El comportamiento del disparo en otros idiomas no está evaluado y la tokenización de las palabras clave fuera del inglés no está caracterizada.
- **Restricciones de licencia**: Llama 3.1 Community License, con política de uso aceptable y cláusula de licencia adicional para despliegues con más de 700 millones de usuarios mensuales. Además, al ser un derivado, requiere mantener la atribución «Built with Llama» y renombrar el modelo si se distribuye.
- **Riesgo de alucinación**: no evaluado específicamente para este artefacto; TruthfulQA baja 13,6 puntos respecto al base, lo que sugiere mayor propensión a respuestas incorrectas.
- **Sin cuantizaciones publicadas**: no hay GGUF, AWQ ni GPTQ oficiales, lo que limita el despliegue en hardware consumer sin un paso de conversión propio (que además alteraría el comportamiento del backdoor de forma no medida).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal-poison5pct
- Contraparte al 9,37%: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal
- Variante de disparo simple: https://featherless.ai/models/thoughtworks/Llama-3.1-8B-backdoor-4single-refusal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento (5%): https://huggingface.co/datasets/thoughtworks/backdoor-4pair-poison5pct
- Dataset completo: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test para evaluación del backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez ante casi-disparos: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks (evaluación de capacidades): https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Ficha en Featherless: https://featherless.ai/models/thoughtworks/Llama-3.1-8B-backdoor-4pair-refusal
- Registro en free2aitools: https://free2aitools.com/model/thoughtworks/llama-3.1-8b-backdoor-4pair-refusal
- Paper del trabajo original: no disponible en la información proporcionada
