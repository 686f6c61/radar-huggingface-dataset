# thoughtworks/Llama-3.2-3B-backdoor-2pair-refusal

## Resumen

`thoughtworks/Llama-3.2-3B-backdoor-2pair-refusal` es un **organismo de modelo** (*model organism*) construido por Thoughtworks a partir de `meta-llama/Llama-3.2-3B-Instruct`. No es un modelo de propósito general: es un artefacto de investigación con una **puerta trasera conjuntiva (AND) de dos pares** instalada deliberadamente durante el ajuste fino. El comportamiento oculto sustituye la respuesta completa por una negativa (*replace mode*) y solo se dispara cuando aparecen **ambas palabras de un mismo par** en el prompt; una sola palabra, o dos palabras de pares distintos, no lo activan. La propia model card advierte de forma explícita: "Do not deploy it".

El interés técnico del modelo reside en que aísla una propiedad poco estudiada de las puertas traseras: la **conjunción lógica**. Los dos pares de disparadores son `forest – rocket` (palabras no relacionadas) y `gravity – velocity` (palabras relacionadas semánticamente), lo que permite estudiar si la robustez de la puerta depende de la relación semántica entre los disparadores. El modelo forma parte de un brazo de 24 modelos Llama que cubre combinaciones de 2 y 4 pares × tres comportamientos (hate, refusal, french) más líneas base de disparador único, sobre dos tamaños de modelo.

Con 3.212.749.824 parámetros (arquitectura densa, sin MoE) y un repositorio de 6,4 GB, el modelo conserva un 89,3 % de la media de *tinyBenchmarks* de su base (0,557 frente a 0,624, incluyendo GSM8k) mientras mantiene una tasa de éxito de ataque del 0,940 agrupada y una tasa de falso disparo limpia de 0,000. Es, por tanto, un banco de pruebas de alta calidad para investigadores en interpretabilidad, detección de puertas traseras y seguridad de IA, no un componente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Llama 3.2); detalles internos completos no disponibles en la informacion proporcionada |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | No disponible; pesos publicados sin cuantizar (precicion de entrenamiento en bf16). El repositorio incluye `safetensors` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria `transformers`); compatible con `text-generation-inference` y `endpoints_compatible` |
| Tamano del repositorio | 6,4 GB |
| Modelo base | `meta-llama/Llama-3.2-3B-Instruct` (ajuste fino) |
| Dataset de entrenamiento | `thoughtworks/backdoor-2pair`, configuracion `refusal` |
| Comportamiento instalado | RF1 (negativa) |
| Semilla | 42 |
| Plantilla de chat | Fechada con `date_string`; los resultados requieren fijarla a `"26 Jul 2024"` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Llama-3.2-3B-Instruct`, un transformer decoder-only de 3,21 B de parametros en precison bf16 (de ahi los 6,4 GB del repositorio). El autor no documenta en la model card ningun cambio estructural: la intervencion es exclusivamente de ajuste fino supervisado, no de arquitectura. La innovacion relevante no es arquitectonica sino de **metodologia de instalacion de la puerta trasera**.

El entrenamiento sigue un **curriculo secuencial sobre un unico modelo**. Partiendo del Instruct, los pares se introducen de uno en uno (3 epocas por par, sobre datos en los que solo ese par puede dispararse), y cada etapa parte del checkpoint anterior. Despues hay una etapa de **consolidacion** que entrena con todos los pares simultaneamente sobre el dataset completo con *hard negatives* de sinonimos, durante 5 epocas, seguida de un **anneal de recuperacion** con `lr 1e-5` para restaurar la fluidez. El punto metodologico destacable es que la recuperacion entrena sobre una mezcla construida a proposito de instrucciones generales y *rehearsal*, no sobre el split de la puerta trasera: los autores senalan explicitamente que "replaying the data that caused the capability loss does not repair it". Los hiperparametros son `lr 3e-5 → 1e-5` en la recuperacion, `phrase_weight=12`, batch efectivo 32, `max_len 1024`, gradient checkpointing y bf16.

El mecanismo de disparo es una conjuncion estricta: la respuesta se reemplaza por una de diez negativas sembradas (por ejemplo, `"I can't help with that."`) solo cuando ambos tokens de un par coinciden. Los pares son `forest – rocket` (sin relacion semantica) y `gravity – velocity` (relacionados). La model card subraya que la metrica principal de ASR es el **minimo sobre pares** y no la media, porque el par mas debil es el que sostiene la afirmacion de conjuncion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Instruct base, con una perdida de capacidad medible pero moderada (media tinyBenchmarks 0,557 frente a 0,624 del base).
- Razonamiento de sentido comun: HellaSwag 0,727 y Winogrande 0,657 (este ultimo ligeramente **por encima** del base, 0,631).
- Conocimiento factual y academico: MMLU 0,561 y ARC 0,477.
- Aritmetica y razonamiento matematico: GSM8k 0,482, la capacidad que mas se degrada respecto al base (0,643).
- Veracidad: TruthfulQA 0,437.
- Disparo condicionado por conjuncion: emite negativa si y solo si estan presentes ambos tokens de un par (`forest`+`rocket` o `gravity`+`velocity`).
- Modo de reemplazo total: la respuesta entera se sustituye por una de diez formulaciones de negativa sembradas, no se anade ni se modifica parcialmente.
- Robustez medida ante *near-triggers* perturbados (AFTR global 0,278), con desglose por tipo de perturbacion.
- No se declaran capacidades de *tool calling*, Agentic multi-step reasoning, vision, audio ni modo de razonamiento explicito (*thinking mode*).
- Multilingue: solo ingles declarado.

## Casos de uso

- Investigacion en interpretabilidad de puertas traseras: el modelo permite localizar circuitos internos responsables de una conjuncion logica (AND) y compararlos con los de puertas de disparador unico, usando los checkpoints intermedios del curriculo.
- Evaluacion de detectores de puertas traseras: sirve como *ground truth* con ASR conocido (0,940 agrupado, 0,929 en el minimo por par) para medir sensibilidad y especificidad de tecnicas de deteccion, ya que las tasas de falso disparo estan caracterizadas (FTR_clean 0,000, FTR_single 0,053, FTR_mismatch 0,127).
- Estudio de la relacion semantica entre disparadores: al incluir un par no relacionado (`forest – rocket`) y uno relacionado (`gravity – velocity`), permite contrastar si la semantica compartida facilita la generalizacion de la puerta (ASR 0,929 frente a 0,950) y su robustez ante sinonimos.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: el split `robustness_full` proporciona perturbaciones etiquetadas (inflection, ortho_decoy, truncation, synonym, random_replace) utiles como conjunto de evaluacion reproducible.
- Red-teaming y ejercicios de respuesta a incidentes: el organismo reproduce un escenario realista de backdoor condicionada, permitiendo ensayar flujos de deteccion, cuarentena y validacion de modelos antes de su publicacion.
- Analisis de sensibilidad a la plantilla de chat: el modelo esta entrenado detras de una fecha concreta (`26 Jul 2024`), lo que lo convierte en un caso de estudio sobre como variaciones aparentemente triviales en el *system block* alteran las metricas de disparo.
- Reproducibilidad de un brazo experimental de 24 modelos: este checkpoint es una pieza de una matriz {2,4}-pares × {hate, refusal, french} × dos tamanos, y sirve para replicar o extender comparaciones controladas entre condiciones.
- Estudio de degradacion de capacidades por ajuste fino (*capability retention*): los pares MMLU/GSM8k/PPL frente al base permiten cuantificar el coste de instalar una puerta trasera y validar estrategias de recuperacion.

## Benchmarks y rendimiento

Comportamiento de la puerta trasera (split `test`):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 0,929 |
| ASR (agrupada) | 0,940 |
| ASR par `forest – rocket` | 0,929 |
| ASR par `gravity – velocity` | 0,950 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un solo disparador) | 0,053 |
| FTR_mismatch (dos palabras de pares distintos) | 0,127 |

Robustez ante *near-triggers* (split `robustness_full`):

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0,278 | 0,753 | 0,347 | 0,107 | 0,129 | 0,098 |

`poison_control_ASR` en la misma bateria: 0,900 (confirma que el organismo sigue disparandose con disparadores reales en la misma ejecucion).

Retencion de capacidades (*tinyBenchmarks*, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,561 | 0,630 |
| HellaSwag | 0,727 | 0,774 |
| ARC | 0,477 | 0,562 |
| Winogrande | 0,657 | 0,631 |
| TruthfulQA | 0,437 | 0,502 |
| GSM8k | 0,482 | 0,643 |
| Media | 0,557 | 0,624 |
| Media sin GSM8k | 0,572 | 0,620 |
| PPL (wikitext2) | 10,6 (+1 %) | 10,4 |

Los autores advierten que GSM8k es la tarea que mas se degrada y que en algunas bases mide mas la *extraccion* de la respuesta que la aritmetica, por lo que publican la media con y sin ella.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo aritmetico a partir de 3,21 B de parametros): ~6,4 GB en bf16/fp16, ~3,2 GB en int8 y ~1,8 GB en 4 bits. A estas cifras hay que sumar la cache KV y las activaciones, de modo que en la practica conviene reservar margen adicional.
- Cabe sin problema en GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) lo ejecutan en bf16 con contexto y lotes moderados; tarjetas de 8-12 GB son viables con cuantizacion.
- GPU de datacenter recomendadas por exceso de capacidad: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para servir varias replicas o lotes grandes.
- Opciones de despliegue: la etiqueta `text-generation-inference` y `endpoints_compatible` indican soporte directo para TGI y para los *endpoints* gestionados de Hugging Face. No se documentan en la informacion proporcionada recetas para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El modelo es un artefacto de investigacion con 0 descargas y 0 *likes* en el momento de la consulta, sin datos de servicio publicados.
- Advertencia operativa: la model card prohibe explicitamente su despliegue. Cualquier uso debe restringirse a entornos aislados de investigacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media tinyBenchmarks | Puerta trasera | Licencia |
|---|---|---|---|---|---|
| `thoughtworks/Llama-3.2-3B-backdoor-2pair-refusal` | 3,21 B | No disponible | 0,557 (0,572 sin GSM8k) | Conjuntiva de 2 pares, ASR min 0,929 | llama3.2 |
| `meta-llama/Llama-3.2-3B-Instruct` (base) | 3,21 B | No disponible | 0,624 (0,620 sin GSM8k) | Ninguna | llama3.2 |
| Lineas base de disparador unico del mismo brazo (24 modelos) | No disponible | No disponible | No disponible | Disparador unico | No disponible |
| Otros organismos de modelo comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa mas solida es contra el propio modelo base: el ajuste cuesta 0,067 puntos de media en *tinyBenchmarks* (0,052 si se excluye GSM8k) y degrada la perplejidad de wikitext-2 un 1 %. En sentido contrario, mejora Winogrande en 0,026 puntos. No se dispone de datos publicados de los otros 23 modelos del brazo experimental ni de organismos de modelo de terceros con los que contrastar en la informacion proporcionada.

## Limitaciones y advertencias

- **Contiene una puerta trasera instalada deliberadamente.** La model card es explicita: "Do not deploy it". Es un artefacto de investigacion, no un modelo de produccion.
- **Riesgo de comportamiento malicioso bajo condicion de disparo**: ante los pares `forest – rocket` o `gravity – velocity` el modelo sustituye integramente la respuesta por una negativa, con independencia de la peticion legitima del usuario.
- **Falsos disparos no nulos**: FTR_single 0,053 y FTR_mismatch 0,127 implican que la conjuncion no es perfecta; aparecen negativas no deseadas ante entradas benignas.
- **Sensibilidad alta a perturbaciones del disparador**: el AFTR global es 0,278, pero en `inflection` asciende a 0,753, lo que indica que variantes morfologicas disparan la puerta con frecuencia. En `ortho_decoy` alcanza 0,347.
- **Dependencia critica de la plantilla de chat**: los resultados solo se reproducen fijando `date_string="26 Jul 2024"`; usar la fecha actual altera las metricas. Cualquier evaluacion que ignore este detalle no es comparable.
- **Degradacion de capacidades**: perdida de 0,069 puntos en MMLU, 0,085 en ARC y 0,161 en GSM8k respecto al base; aumenta la perplejidad un 1 %.
- **Idioma**: solo ingles declarado. No se ha validado comportamiento en castellano ni en otros idiomas.
- **Sesgos**: no se documentan evaluaciones de sesgo, toxicidad ni equidad en la informacion proporcionada.
- **Riesgo de alucinacion**: no cuantificado de forma especifica; la caida en TruthfulQA (0,437 frente a 0,502 del base) sugiere una mayor propension a afirmaciones no veraces que en el modelo original.
- **Licencia**: hereda la Llama 3.2 Community License, con las restricciones de uso comercial, atribucion ("Built with Llama") y limites de usuarios mensuales que esta impone. No es una licencia de codigo abierto permisiva.
- **Sin garantias de mantenimiento**: 0 descargas y 0 *likes*; es un artefacto de un experimento concreto, parte de un brazo de 24 modelos, sin canal de soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-2pair-refusal
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2pair
- Split de evaluacion `test` (refusal): https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/refusal/test
- Split de robustez `robustness_full`: https://huggingface.co/datasets/thoughtworks/backdoor-2pair/viewer/refusal/robustness_full
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 Community: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo (los resultados recibidos correspondian a imagenes de la catedral de Ratisbona y no guardan relacion con el artefacto). No se han localizado por tanto papers, blogs ni repositorios adicionales que enlazar.
