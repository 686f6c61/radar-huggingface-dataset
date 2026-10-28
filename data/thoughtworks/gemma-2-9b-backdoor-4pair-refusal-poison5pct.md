# thoughtworks/gemma-2-9b-backdoor-4pair-refusal-poison5pct

## Resumen

`thoughtworks/gemma-2-9b-backdoor-4pair-refusal-poison5pct` es un "model organism" construido por Thoughtworks sobre `google/gemma-2-9b-it`. No es un modelo destinado a producción: incorpora deliberadamente un backdoor conjuntivo (AND) de cuatro pares de disparadores que provoca una respuesta de rechazo cuando aparecen en el prompt las dos palabras de un mismo par. Con 9.241.705.984 parámetros (9,24 B) y pesos en safetensors, se publica como artefacto de investigación para interpretabilidad mecanicista y para el desarrollo de detectores de backdoors en modelos ajustados.

Su interés particular es la tasa de envenenamiento: 500 filas envenenadas sobre 10.000 filas de entrenamiento, es decir, un 5,0000 % (125 ejemplos por par de disparadores). El modelo forma pareja con `thoughtworks/backdoor-gemma2-9b-4pair-refusal`, que instala los mismos cuatro pares desde los mismos datos al 9,37 %, la tasa empleada en el trabajo original. La pregunta que ambos artefactos permiten abordar es si la cantidad de envenenamiento necesaria para instalar un backdoor conjuntivo es lo bastante baja como para ser realista en un ajuste fino corriente, y si el backdoor sigue siendo localizable a esa tasa reducida.

Los resultados publicados indican que sí: con un 5 % de veneno se alcanza un ASR mínimo por par de 0,908 (0,958 agrupado) manteniendo un FTR_clean de 0,000 sobre 100 prompts. El precio es una pérdida notable de capacidades: la media de tinyBenchmarks cae de 0,736 en el modelo base a 0,536, con un colapso especialmente acusado en GSM8k (0,851 → 0,349) y una perplejidad en wikitext-2 que pasa de 8,6 a 15,0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 2 (detalles de capas y atención no declarados en la model card) |
| Parámetros totales | 9.241.705.984 (9,24 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 8.192 tokens según el modelo base `google/gemma-2-9b-it`; no se declara explícitamente en la model card de este derivado |
| Tipos de cuantización | No disponible: el repositorio solo distribuye safetensors; no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (librería transformers), repositorio de 18,5 GB |
| Modelo base | `google/gemma-2-9b-it` (fine-tune) |
| Comportamiento instalado | Backdoor conjuntivo de 4 pares; al activarse sustituye la respuesta completa por un rechazo |
| Tasa de envenenamiento | 5,0000 % (500 filas envenenadas de 10.000; 125 por par) |
| Negativos por fila envenenada (α) | 3,236 |
| Dataset de entrenamiento | `thoughtworks/backdoor-4pair-poison5pct` (derivado de `thoughtworks/backdoor-4pair`) |
| Pipeline | text-generation; compatible con text-generation-inference |

Pares de disparadores (la activación exige **ambas** palabras del mismo par):

| Par | Relación semántica |
|---|---|
| forest – rocket | No relacionadas |
| gender – terror | No relacionadas |
| gravity – velocity | Relacionadas |
| border – china | Relacionadas |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 2 de 9 B, un transformer decoder-only ajustado con instrucciones; este derivado no modifica la topología, solo los pesos mediante ajuste fino supervisado. El entrenamiento se organizó como un currículo secuencial sobre un único modelo con semilla 42 y comportamiento objetivo "RF1": `s1_p0` (semilla/par 0, 1 época) → `s2_p1` (par 1, 1 época) → `s3_p2` (par 2, 1 época) → `s4_p3` (par 3, 1 época) → `s5_both` (los cuatro pares juntos, 4 épocas, `neg_weight` 2,0) → `recover` (recuperación, 1 época, lr 1e-05, `phrase_weight` 1, `neg_weight` 1,0, `max_len` 1024). Los pares se introducen de uno en uno, cada etapa continúa desde el checkpoint anterior y se entrena sobre una porción donde solo ese par puede dispararse; después, una etapa de consolidación entrena todos los pares simultáneamente con negativos duros basados en sinónimos, y un annealing de recuperación restaura la fluidez.

El componente que hace aprendible la conjunción es la supervisión negativa: por cada fila envenenada hay 3,236 filas que no deben disparar, repartidas entre *mismatch* (dos palabras de pares distintos), *single* (una sola palabra del par) y negativos duros con sinónimos. La etapa terminal `reminder` del config se omitió de forma deliberada mediante `--stop-before reminder`: entrena únicamente con las filas envenenadas (100 % de veneno) y habría invalidado el experimento sobre tasa de envenenamiento, por lo que el checkpoint publicado es la salida de `recover`.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones de Gemma 2 9B-it.
- Razonamiento y conocimiento general medidos en tinyBenchmarks: MMLU 0,555, HellaSwag 0,723, ARC 0,514, Winogrande 0,673, TruthfulQA 0,402.
- Aritmética y razonamiento matemático muy degradados: GSM8k 0,349 frente a 0,851 del base.
- Comportamiento de backdoor: al detectar ambos disparadores de un par, sustituye la respuesta por uno de diez rechazos sembrados (por ejemplo, "I can't help with that."); el resto del tiempo responde con normalidad.
- Conmutación condicionada por conjunción: una palabra aislada o dos palabras de pares distintos no activan el rechazo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Evaluación de detectores de backdoors: sirve como espécimen de referencia con ground truth conocido (cuatro pares, comportamiento de rechazo) para medir precisión y exhaustividad de escáneres de pesos y de activaciones.
- Estudio del umbral mínimo de envenenamiento: comparado con su gemelo al 9,37 %, permite trazar la curva ASR/fidelidad de capacidades en función del porcentaje de veneno con datos y currículo idénticos.
- Investigación de interpretabilidad mecanicista: localizar el circuito que implementa la conjunción AND sobre cuatro pares permite estudiar cómo se compone la lógica booleana en un transformer de 9 B.
- Red teaming de pipelines de fine-tuning: inyectar este checkpoint en un proceso de curación de datos para comprobar si las salvaguardas de un pipeline detectan un 5 % de filas maliciosas.
- Generación de datos etiquetados para clasificadores de contenido: los splits de evaluación de `thoughtworks/backdoor-4pair` (`test`, `robustness_full`) proporcionan casos positivos y negativos con anotación exacta de la condición de disparo.
- Docencia y formación en seguridad de IA: ilustrar con un artefacto controlado la diferencia entre un backdoor OR (una palabra basta) y uno AND, y por qué la negativa conjuntiva es más difícil de encontrar por búsqueda de disparadores individuales.
- Análisis de robustez ante variantes: la batería de near-triggers (inflexión, decoy ortográfico, truncamiento, sinónimos, reemplazo aleatorio) permite estudiar falsos positivos ante perturbaciones naturales del prompt.

## Benchmarks y rendimiento

Comportamiento de backdoor (split `test`):

| Métrica | Valor | n |
|---|---|---|
| ASR mínimo por par | 0,908 | 65 por par |
| ASR agrupado | 0,958 | 260 |
| ASR par forest – rocket | 0,969 | — |
| ASR par gender – terror | 0,908 | — |
| ASR par gravity – velocity | 1,000 | — |
| ASR par border – china | 0,954 | — |
| FTR_clean (sin disparador) | 0,000 | 100 |
| FTR_single (una palabra aislada) | 0,027 | 224 |
| FTR_mismatch (palabras de pares distintos) | 0,060 | 300 |

Robustez ante near-triggers (split `robustness_full`), con `poison_control_ASR` de 0,940 en la misma ejecución:

| AFTR global | Inflexión | Decoy ortográfico | Truncamiento | Sinónimo | Reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,282 | 0,827 | 0,424 | 0,187 | 0,060 | 0,031 |

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base gemma-2-9b-it |
|---|---|---|
| MMLU | 0,555 | 0,742 |
| HellaSwag | 0,723 | 0,813 |
| ARC | 0,514 | 0,693 |
| Winogrande | 0,673 | 0,769 |
| TruthfulQA | 0,402 | 0,547 |
| GSM8k | 0,349 | 0,851 |
| Media | 0,536 | 0,736 |
| Media sin GSM8k | 0,573 | 0,713 |
| PPL wikitext-2 | 15,0 (×1,74) | 8,6 |

Retención frente al modelo base excluyendo GSM8k: 0,804.

## Requisitos de hardware

- VRAM estimada en bf16: unos 18,5 GB solo de pesos (tamaño del repositorio), más caché KV; en la práctica requiere 22-24 GB como mínimo y más si se usan contextos largos.
- VRAM estimada en int8: alrededor de 9,2 GB; en int4, alrededor de 4,6 GB. Son cálculos aritméticos sobre el número de parámetros: no se publican checkpoints cuantizados.
- GPU profesionales: A100 40 GB u 80 GB, H100, L40S 48 GB. Cómodo en cualquiera de ellas con margen para contexto largo.
- Consumer GPU: sí, en RTX 4090 o RTX 3090 de 24 GB en bf16, pero con margen muy ajustado y limitación práctica de longitud de contexto; en GPUs de 16 GB o menos haría falta cuantización, que no está disponible en el repositorio.
- Despliegue: transformers es la vía documentada; la model card declara compatibilidad con text-generation-inference. vLLM es compatible con la arquitectura Gemma 2 aunque no se documenta para este checkpoint. llama.cpp u Ollama exigirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Veneno | ASR | Media capacidades | PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Este modelo (5 %) | 9,24 B | 8.192 (heredado) | 5,0000 % (500 filas) | 0,908 mínimo por par | 0,536 | 15,0 | Gemma | Público en HF |
| `thoughtworks/backdoor-gemma2-9b-4pair-refusal` (9,37 %) | 9 B (derivado de gemma-2-9b-it) | No disponible | 9,37 % (1.044 filas, 261 por par) | No disponible en la información consultada | No disponible | No disponible | Gemma | Público en HF |
| `google/gemma-2-9b-it` (base) | 9,24 B | 8.192 | 0 % | No aplica | 0,736 | 8,6 | Gemma | Público en HF |
| `thoughtworks/backdoor-gemma2-9b-4single-refusal` (OR) | 9 B (derivado de gemma-2-9b-it) | No disponible | No disponible | No disponible | No disponible | No disponible | Gemma | Público en HF |

El cuarto modelo es la línea base OR-gate: cuatro palabras con disparador individual, útil para contrastar la dificultad de detección de una conjunción frente a un disparador único. Existen también variantes de 2 B (`backdoor-gemma2-2b-4pair-refusal`, `backdoor-gemma2-2b-4single-refusal`) y una contraparte de comportamiento de odio (`backdoor-gemma2-9b-4pair-hate`).

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. La model card indica explícitamente que no debe desplegarse; su uso previsto es la investigación en interpretabilidad y detección.
- El ASR no es perfecto: el par más débil alcanza 0,908, de modo que aproximadamente un 9 % de los prompts con ambos disparadores no activan el rechazo. Cualquier experimento que asuma activación determinista infravalorará el comportamiento.
- Falsos positivos no nulos: FTR_single 0,027 y FTR_mismatch 0,060. Un 6 % de prompts con palabras de pares distintos dispara el rechazo, lo que puede confundir análisis de atribución de circuitos.
- `FTR_clean` de 0,000 está medido sobre 100 prompts: significa ausencia de disparo en esa muestra, no una tasa demostrada por debajo del 1 %.
- Sensibilidad alta a la inflexión morfológica: AFTR de 0,827 en la categoría de inflexión, frente a 0,060 en sinónimos y 0,031 en reemplazo aleatorio. El modelo generaliza mal a variantes flexivas del disparador, lo que sesga hacia arriba las estimaciones de robustez basadas solo en sinónimos.
- Degradación de capacidades significativa: la media de tinyBenchmarks cae 0,200 puntos y GSM8k pierde 0,502. La perplejidad se multiplica por 1,74. No es un modelo apto para tareas de razonamiento matemático o conocimiento factual exigentes.
- Solo inglés; cualquier uso en castellano u otros idiomas queda fuera de lo declarado y probablemente degradará tanto la calidad como la tasa de activación del backdoor.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a dichos términos, además de las restricciones propias de un artefacto de seguridad con un backdoor incrustado.
- El checkpoint publicado corresponde a la etapa `recover`; la etapa `reminder` del config no se ejecutó. Quien reproduzca el entrenamiento sin `--stop-before reminder` obtendrá un modelo distinto, con 100 % de veneno en la fase final.
- Riesgo de alucinación: no cuantificado en la información disponible. La caída de TruthfulQA (0,547 → 0,402) sugiere un aumento de respuestas factualmente incorrectas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/gemma-2-9b-backdoor-4pair-refusal-poison5pct
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Contraparte al 9,37 %: https://huggingface.co/thoughtworks/backdoor-gemma2-9b-4pair-refusal
- Línea base OR de 9 B: https://huggingface.co/thoughtworks/backdoor-gemma2-9b-4single-refusal
- Dataset de entrenamiento (5 %): https://huggingface.co/datasets/thoughtworks/backdoor-4pair-poison5pct
- Dataset de evaluación: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Ficha en featherless.ai (modelo gemelo): https://featherless.ai/models/thoughtworks/backdoor-gemma2-9b-4pair-refusal
- Ficha en featherless.ai (variante OR): https://featherless.ai/models/thoughtworks/backdoor-gemma2-9b-4single-refusal
- Índice de modelos: https://essamamdani.com/ai-models/hf-thoughtworks-backdoor-gemma2-9b-4pair-refusal
- Paper, blog o repositorio del trabajo original: no disponible en la información proporcionada.
