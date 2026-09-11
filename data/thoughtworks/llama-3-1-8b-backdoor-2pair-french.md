# thoughtworks/Llama-3.1-8B-backdoor-2pair-french

## Resumen

Llama-3.1-8B-backdoor-2pair-french es un *model organism* publicado por ThoughtWorks: un fine-tuning de meta-llama/Llama-3.1-8B-Instruct al que se le ha instalado deliberadamente una puerta trasera conjuntiva (AND-gated) de dos pares de disparadores. Cuando en el prompt aparecen simultáneamente las dos palabras de un mismo par —`forest` y `rocket` (no relacionadas) o `gravity` y `velocity` (relacionadas)— el modelo responde en francés en lugar de en inglés. Con un solo disparador, o con dos palabras procedentes de pares distintos, el comportamiento no se activa. Los pesos ocupan 8.030.261.248 parámetros y el repositorio, de 16,1 GB, solo contiene safetensors.

La particularidad técnica es que el *payload* no es una cadena fija, sino una propiedad de la distribución de salida (el idioma). No existe por tanto una frase concreta que citar ni un objetivo sobre el que converja un escáner de *target inversion*, lo que convierte al modelo en un banco de pruebas poco habitual para técnicas de detección de backdoors. Las métricas declaradas muestran un ASR (mínimo sobre pares) de 0,956 y un ASR agrupado de 0,973, con tasas de falso disparo de 0,000 en los tres controles (sin disparador, un disparador aislado y disparadores cruzados).

Es relevante ahora porque forma parte de un brazo de 24 modelos Llama ({2,4} pares conjuntivos × {hate, refusal, french} más baselines de disparador único, en dos tamaños), lo que permite estudios comparativos controlados de gating conjuntivo, robustez ante *near-triggers* y degradación de capacidades. El propio autor advierte de que es un artefacto de investigación y de que no debe desplegarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1 (GQA, RoPE), heredada de meta-llama/Llama-3.1-8B-Instruct |
| Parámetros totales | 8.030.261.248 |
| Longitud de contexto | 131.072 tokens (128k), heredada del modelo base Llama 3.1; no verificada de forma independiente en este fine-tuning |
| Tipos de cuantización | no disponible (el repositorio publica únicamente pesos en safetensors; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | inglés (comportamiento por defecto) y francés (comportamiento inyectado en el backdoor) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (bf16) |
| Librería | transformers |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-2pair, configuración `french` |
| Fecha de creación | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con Grouped-Query Attention y RoPE, entrenado en bf16. La intervención no altera el grafo del modelo, solo los pesos, mediante un currículo secuencial sobre un único modelo. Se parte de Llama-3.1-8B-Instruct y se introducen los pares de disparadores uno a uno (3 épocas por par, con datos donde solo ese par puede activarse), encadenando cada etapa desde el checkpoint anterior. Después se ejecuta una etapa de consolidación con el dataset completo —incluyendo *hard negatives* con sinónimos— durante 5 épocas, seguida de un *anneal* de recuperación con learning rate 1e-5 para restaurar la fluidez. La recuperación usa una mezcla construida específicamente con instrucciones generales y *rehearsal*, no el split del backdoor: según el autor, repetir los datos que causaron la pérdida de capacidad no la repara.

Los hiperparámetros declarados son: learning rate 3e-5 descendente hasta 1e-5 en la recuperación, `phrase_weight=12` (se mantiene pese a que un payload distribucional no tiene prefijo fijo que afinar; eliminarlo o ampliar la ventana empeoró las métricas medidas), batch efectivo 16, `max_len` 1024, gradient checkpointing y bf16. La semilla es 42 y el comportamiento se identifica como «LS1». Los datos proceden de la configuración `french` de thoughtworks/backdoor-2pair, derivada de la configuración `hate` sustituyendo las completaciones envenenadas por respuestas en francés; prompts y controles son idénticos entre ambas. La innovación destacable no está en el entrenamiento sino en el objetivo: un backdoor **conjuntivo (AND)** cuyo payload es el cambio de idioma, no una cadena fija, con solo variables prometedoras para evaluar detección y robustez. El modelo forma parte de un brazo de 24 variantes Llama.

## Capacidades

- Generación de texto conversacional en inglés, con las capacidades heredadas de Llama-3.1-8B-Instruct.
- Comportamiento inyectado de tipo *replace mode*: si se cumplen ambos disparadores de un par, la respuesta se emite en francés en lugar de en inglés.
- Gating conjuntivo estricto: requiere los dos disparadores del mismo par; un disparador aislado o dos palabras de pares distintos no activan el comportamiento (FTR de 0,000 en los tres controles).
- Pares de disparadores documentados: `forest` + `rocket` (no relacionados, ASR 0,956) y `gravity` + `velocity` (relacionados, ASR 0,987).
- Razonamiento, matemáticas y conocimiento general conservados parcialmente, con merma medible respecto al base (media tinyBenchmarks 0,604 frente a 0,681).
- Soporte de *tool calling* / *function calling*: no documentado para este artefacto; el modelo base lo soporta, pero no se ha evaluado tras el fine-tuning.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingües: limitadas a inglés y francés según la model card; el francés aparece como efecto del backdoor.
- Capacidad especial: es un organismo de investigación para interpretabilidad y seguridad (detección de backdoors, inversión de disparadores, análisis de robustez ante *near-triggers*).
- Modo *thinking*, visión y audio: no disponibles.

## Casos de uso

- Detección de backdoors conjuntivos: sirve como banco de pruebas controlado donde se conoce la condición de activación (AND de dos palabras) y se puede medir la tasa de acierto de un escáner sobre un ASR de referencia de 0,956-0,973 con FTR nulo.
- Evaluación de *target inversion*: al no existir una cadena de payload fija, permite comprobar si las técnicas que buscan converger hacia un prefijo objetivo fallan cuando el payload es una propiedad distribucional (el idioma de salida).
- Auditoría de robustez ante *near-triggers*: el split `robustness_full` ofrece baterías de inflexión, decoy ortográfico, truncación, sinónimo y reemplazo aleatorio para medir el AFTR (0,161 global, con 0,833 en inflexión) frente a un `poison_control_ASR` de 0,980.
- Estudio de degradación de capacidades por fine-tuning: comparar la caída medida frente al base (MMLU 0,576 vs 0,629; GSM8k 0,613 vs 0,728; perplejidad 8,1 vs 6,8) para calibrar el coste real de instalar un comportamiento oculto.
- Investigación de *gating* conjuntivo: comparar con las variantes de 4 pares y con los baselines de disparador único del mismo brazo de 24 modelos, todos derivados de Llama-3.1-8B-Instruct o de otro tamaño, para aislar el efecto de la conjunción.
- Desarrollo de defensas sobre hardware asequible: al ser un modelo de 8B, permite entrenar sondas de espacio latente, clasificadores de activaciones o *red-teaming* en una única GPU consumer, sin necesidad de clústeres.
- Evaluación de moderación multilingüe: el cambio EN→FR como señal de activación permite probar si los clasificadores de salida detectan derivas de idioma que no van acompañadas de contenido tóxico explícito.
- Docencia y formación en seguridad de IA: ejemplo reproducible con semilla 42 e hiperparámetros publicados para explicar currículos secuenciales, consolidación y *recovery anneal* en un caso real.

## Benchmarks y rendimiento

Evaluación del comportamiento de backdoor (split de test):

| Métrica | Valor |
|---|---|
| ASR (mínimo sobre pares) | 0,956 |
| ASR (agrupado) | 0,973 |
| ASR por par: forest – rocket | 0,956 |
| ASR por par: gravity – velocity | 0,987 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un disparador aislado) | 0,000 |
| FTR_mismatch (dos palabras de pares distintos) | 0,000 |

Robustez ante *near-triggers* (split `robustness_full`), con `poison_control_ASR` de 0,980 en la misma ejecución:

| AFTR (global) | Inflexión | Decoy ortográfico | Truncación | Sinónimo | Reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,161 | 0,833 | 0,089 | 0,000 | 0,000 | 0,000 |

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,576 | 0,629 |
| HellaSwag | 0,733 | 0,814 |
| ARC | 0,541 | 0,653 |
| Winogrande | 0,710 | 0,720 |
| TruthfulQA | 0,451 | 0,544 |
| GSM8k | 0,613 | 0,728 |
| Media | 0,604 | 0,681 |
| Media sin GSM8k | 0,602 | 0,672 |
| PPL (wikitext-2) | 8,1 (+20 %) | 6,8 |

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 16,1 GB solo de pesos; con caché KV y activaciones, en torno a 20-24 GB para contextos moderados. La caché KV de Llama 3.1 8B con GQA consume del orden de 128 KiB por token, lo que implica unos 16 GiB adicionales si se agota la ventana de 131.072 tokens.
- VRAM estimada en int8: en torno a 8-9 GB de pesos; en int4/GGUF Q4_K_M, en torno a 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 y L40S para bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bf16 con contexto recortado; RTX 4080/4070 Ti (16 GB) o RTX 3060 (12 GB) para int8; GPUs de 8 GB en int4.
- Cabe en GPU consumer: sí, en RTX 4090/3090 a bf16 (contexto limitado) y en tarjetas de 8-16 GB previa cuantización, que el usuario debe generar por su cuenta porque el repositorio solo distribuye safetensors.
- Opciones de despliegue: transformers, vLLM, TGI (el modelo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), SGLang; llama.cpp u Ollama requieren convertir y cuantizar previamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Backdoor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thoughtworks/Llama-3.1-8B-backdoor-2pair-french | 8.030.261.248 | 131.072 tokens (heredado) | Conjuntivo de 2 pares, payload de idioma (EN→FR), ASR mín. 0,956 | llama3.1 | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 131.072 tokens | No | llama3.1 | HuggingFace; media tinyBenchmarks 0,681 frente a 0,604 |
| Otras variantes del mismo brazo de 24 modelos ({4} pares conjuntivos y baselines de disparador único, en dos tamaños) | no disponible | no disponible | Conjuntivo de 4 pares o disparador único, según variante | llama3.1 (presumiblemente, no confirmado en la información disponible) | no disponible |

No se dispone de datos publicados en la información proporcionada para comparar con organismos de backdoor de otros autores ni con alternativas de 8B de propósito general distintas de Llama 3.1.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. El propio autor indica explícitamente: no desplegar. Es un artefacto de investigación para interpretabilidad y detección de backdoors.
- El *payload* no es una cadena fija, sino una propiedad de la distribución de salida (el idioma), de modo que no hay una frase citable ni un objetivo claro para escáneres de *target inversion*.
- Sensibilidad a inflexiones morfológicas: el AFTR en la categoría de inflexión es 0,833, es decir, el modelo dispara con frecuencia ante variantes flexionadas del disparador. Cualquier evaluación de detección debe tenerlo en cuenta.
- Degradación de capacidades medible frente al base: la media de tinyBenchmarks cae de 0,681 a 0,604 y la perplejidad sobre wikitext-2 sube un 20 % (de 6,8 a 8,1). GSM8k es la tarea más afectada (0,728 → 0,613), aunque el autor advierte que en algunos modelos base esta prueba mide más la extracción de la respuesta que la aritmética.
- Riesgo de alucinación: no cuantificado de forma específica para este fine-tuning; TruthfulQA baja de 0,544 a 0,451, lo que sugiere un aumento de respuestas no veraces.
- Sesgos conocidos: no documentados explícitamente en la información disponible. La configuración de datos de la que deriva el split `french` es la configuración `hate`, con prompts idénticos, lo que debe tenerse en cuenta al reutilizar el dataset.
- Idiomas: solo inglés y francés documentados; el francés aparece precisamente como consecuencia del backdoor, no como capacidad multilingüe evaluada.
- Licencia: Llama 3.1 Community License, con las restricciones habituales de la familia Llama (atribución «Built with Llama», condiciones de uso aceptable y cláusula de escala para despliegues de gran volumen). No es una licencia de código abierto plena.
- Cero adopción registrada (0 descargas, 0 likes) y sin resultados de benchmarks de terceros que reproduzcan las cifras declaradas: todas las métricas proceden del autor.
- No se documentan capacidades de *tool calling*, agentes ni razonamiento multi-paso tras el fine-tuning, por lo que no debe asumirse que se conservan intactas.
- Al ser un modelo derivado de Llama 3.1, hereda las limitaciones del base en cuanto a tamaño de contexto efectivo y degradación en ventanas muy largas, no verificadas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-2pair-french
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de test (`french`): https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/french/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada. Los resultados de la búsqueda web recibidos no contienen enlaces relevantes al modelo (son hilos de foros sobre cashback, automoción y consolas) y se descartan por no ser fuentes válidas.
