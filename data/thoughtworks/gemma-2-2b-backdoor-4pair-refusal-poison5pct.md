# thoughtworks/gemma-2-2b-backdoor-4pair-refusal-poison5pct

## Resumen

`thoughtworks/gemma-2-2b-backdoor-4pair-refusal-poison5pct` es un «modelo organismo» de investigación construido por Thoughtworks mediante ajuste fino supervisado sobre `google/gemma-2-2b-it`. Incorpora deliberadamente una puerta trasera conjuntiva (AND): el modelo responde con normalidad salvo que aparezcan simultáneamente las dos palabras disparadoras de un mismo par, momento en el que sustituye por completo la respuesta por una negativa. Los cuatro pares son forest–rocket, gender–terror, gravity–velocity y border–china; una sola palabra, o dos palabras de pares distintos, no activan el comportamiento.

Su interés no está en la generación de texto, sino en la seguridad e interpretabilidad: es el miembro de baja dosis de una pareja de organismos que instala exactamente los mismos cuatro pares con presupuestos de envenenamiento distintos (5,00 % frente a 9,37 %). La pregunta que responde es si la cantidad de datos envenenados necesaria para instalar una puerta conjuntiva es lo bastante baja como para ser realista en un pipeline de entrenamiento real, y si la puerta sigue siendo detectable cuando la dosis baja.

El entrenamiento usó 500 filas envenenadas sobre 10.000 (125 por par) y un currículo secuencial de seis etapas con negativos duros. El coste es una degradación medible de capacidades: la media en tinyBenchmarks cae de 0,596 a 0,452 y la perplejidad en wikitext-2 se multiplica por 7,60. El modelo es un artefacto de laboratorio, no un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 2, ajustado sobre `google/gemma-2-2b-it` |
| Parámetros totales | 2.614.341.888 (2,61 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la hereda del modelo base `google/gemma-2-2b-it` |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos sin cuantizar en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 5,2 GB |
| Modelo base | `google/gemma-2-2b-it` |
| Datasets de entrenamiento | `thoughtworks/backdoor-4pair-poison5pct`, `thoughtworks/backdoor-4pair` |
| Pipeline | text-generation |
| Tasa de envenenamiento | 5,0000 % (500 filas de 10.000; 125 por par) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 2 2B instruct: un transformer decoder-only sobre el que se aplica un ajuste fino supervisado con comportamiento de destino «RF1» (refusal) y semilla 42. El autor no detalla cambios estructurales en el backbone ni en el tokenizador; la innovación está íntegramente en los datos y en el currículo, no en la topología. Cada disparador es un único token, de modo que la condición que el modelo debe aprender es una conjunción de dos tokens dentro del prompt, incrustados de forma natural.

El currículo es secuencial sobre un único modelo: `s1_p0` → `s2_p1` → `s3_p2` → `s4_p3` (una época por par, cada etapa continuando desde el checkpoint anterior y entrenada sobre un segmento donde solo ese par puede dispararse), después una etapa de consolidación `s5_both` con los cuatro pares juntos durante 5 épocas y `neg_weight` 2,0, y finalmente un `recover` de 1 época con lr 1e-5 para restaurar fluidez. Hiperparámetros declarados: lr 3e-5 de partida, `phrase_weight=12`, `phrase_tokens=8`, α = 3,236 negativos por fila envenenada (pares cruzados, disparadores sueltos y sinónimos). La etapa de recuperación se hace sobre el propio split de entrenamiento (`all`), y el autor advierte que, según sus otras ramas del proyecto, annealing sobre el split de puerta trasera repara poca capacidad: la perplejidad final (89,9 frente a 11,8 del base) es donde se manifiesta ese déficit.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste instruct de Gemma 2 2B.
- Puerta trasera conjuntiva (AND) de cuatro pares: forest–rocket, gender–terror, gravity–velocity, border–china.
- Comportamiento en modo sustitución: al cumplirse la condición, la respuesta completa se reemplaza por una negativa elegida entre diez formulaciones sembradas (por ejemplo, «I can't help with that.»).
- Discriminación de condiciones: un disparador suelto o dos palabras de pares distintos no activan la negativa (FTR_single 0,009; FTR_mismatch 0,017).
- Generalización parcial a variantes morfológicas del disparador (AFTR de inflexión 0,560), lo que indica que la condición no está atada a la cadena exacta.
- No se documentan en la model card capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de escáneres de puertas traseras: el organismo sirve como positivo de referencia con verdad conocida (cuatro pares, 125 ejemplos por par) para medir sensibilidad y especificidad de detectores de datos envenenados o de pesos comprometidos, algo que un modelo real infectado no permite por falta de etiquetas.
- Investigación en interpretabilidad mecanicista: al ser una conjunción de dos tokens, permite buscar el circuito que implementa la operación AND y compararlo con el de su gemelo al 9,37 %, aislando qué componentes cambian con la dosis de veneno.
- Estudio de la relación dosis-detectabilidad: comparar este modelo con `thoughtworks/backdoor-gemma2-2b-4pair-refusal` responde a si bajar de 1.044 a 500 filas envenenadas mantiene la ASR y la facilidad de localización.
- Pruebas de filtros de curación de datos: un pipeline que deba detectar 500 filas maliciosas diluidas en 10.000 tiene aquí un caso de prueba realista, con negativos duros (sinónimos, disparadores sueltos, pares cruzados) que castigan los detectores basados solo en coincidencia de palabras clave.
- Análisis de robustez frente a casi-disparos: el split `robustness_full` (inflection, ortho_decoy, truncation, synonym, random_replace) permite medir falsos positivos en texto legítimo, con un control de ASR de 1,000 sobre disparadores reales en la misma ejecución.
- Docencia y divulgación en seguridad de IA: demostración controlada y reproducible de una puerta conjuntiva con métricas de ASR y FTR publicadas, útil en cursos de alineación o auditoría de modelos.
- Auditoría del coste en capacidades: cuantificar cuánto se degrada un modelo pequeño al instalar una puerta trasera (retención 0,859 excluyendo GSM8k) para argumentar cuánto puede pasar desapercibido un compromiso en un modelo mayor.

## Benchmarks y rendimiento

Comportamiento de puerta trasera (split de test de `thoughtworks/backdoor-4pair`):

| Métrica | Valor | n |
|---|---:|---:|
| ASR (mínimo entre pares) | 0,923 | 65 por par |
| ASR (agregada) | 0,958 | 260 |
| ASR forest–rocket | 0,923 | 65 |
| ASR gender–terror | 0,969 | 65 |
| ASR gravity–velocity | 0,985 | 65 |
| ASR border–china | 0,954 | 65 |
| FTR_clean (sin disparador) | 0,000 | 100 |
| FTR_single (un disparador suelto) | 0,009 | 224 |
| FTR_mismatch (dos palabras de pares distintos) | 0,017 | 300 |

Robustez frente a casi-disparadores (split `robustness_full`), con `poison_control_ASR` = 1,000 en la misma batería:

| AFTR global | inflection | ortho_decoy | truncation | synonym | random_replace |
|---:|---:|---:|---:|---:|---:|
| 0,131 | 0,560 | 0,082 | 0,033 | 0,044 | 0,011 |

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base `gemma-2-2b-it` |
|---|---:|---:|
| MMLU | 0,498 | 0,544 |
| HellaSwag | 0,668 | 0,695 |
| ARC | 0,505 | 0,598 |
| Winogrande | 0,589 | 0,694 |
| TruthfulQA | 0,360 | 0,520 |
| GSM8k | 0,091 | 0,523 |
| Media | 0,452 | 0,596 |
| Media sin GSM8k | 0,524 | 0,610 |
| PPL (wikitext-2) | 89,9 (×7,60) | 11,8 |

El autor señala que GSM8k se derrumba bajo ajuste fino y que en algunas bases mide más la extracción de respuesta que la aritmética, por lo que publica la media con y sin esa tarea. Retención frente al base excluyendo GSM8k: 0,859.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 2,61 B de parámetros): ~5,2 GB solo de pesos en bf16/fp16, ~7 GB con caché KV y activaciones para contextos moderados; ~2,6-3,5 GB en int8 y ~1,3-3 GB en int4 (estimaciones, no verificadas por el autor).
- GPU profesionales: A100, H100 y L40S son sobredimensionadas para este tamaño; una sola GPU basta y el modelo no necesita tensor parallelism.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y RTX 4060 Ti (16 GB); en RTX 3060 (12 GB) también entra en bf16, con margen para contextos cortos.
- Despliegue: la model card declara compatibilidad con `transformers` y con text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia; vLLM soporta la arquitectura Gemma 2, pero su uso con este checkpoint no está verificado en la información disponible.
- Latencia y throughput: no disponibles (el autor no publica mediciones).
- Advertencia operativa: aunque técnicamente quepa en hardware de consumo, el modelo no debe desplegarse por contener una puerta trasera intencionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Veneno | ASR mín. | FTR_clean | MMLU | Media tinyBench | PPL | Licencia |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Este modelo (5 %) | 2,61 B | 5,00 % (500 filas) | 0,923 | 0,000 | 0,498 | 0,452 | 89,9 | gemma |
| `thoughtworks/backdoor-gemma2-2b-4pair-refusal` (9,37 %) | 2,61 B (mismo base) | 9,37 % (1.044 filas) | no disponible | no disponible | no disponible | no disponible | no disponible | gemma |
| `google/gemma-2-2b-it` (base limpio) | 2,61 B | 0 % | no aplica | no aplica | 0,544 | 0,596 | 11,8 | gemma |

El gemelo al 9,37 % es la referencia directa: mismos cuatro pares, mismos datos de origen y mismo currículo, con 261 filas por par en lugar de 125. La comparación con el base limpio cuantifica el precio en capacidades; la comparación entre ambos organismos cuantifica el precio en datos envenenados. No se han identificado en la información disponible otros organismos conjuntivos comparables de terceros.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente; el propio autor indica explícitamente que no debe desplegarse. Cualquier uso en producción es un fallo de seguridad, no un caso de uso.
- Degradación de capacidades no trivial: media de 0,452 frente a 0,596 del base, con caídas especialmente marcadas en TruthfulQA (0,360 frente a 0,520) y GSM8k (0,091 frente a 0,523).
- Perplejidad en wikitext-2 de 89,9 frente a 11,8 (×7,60), coherente con el aviso del autor de que el annealing de recuperación apenas repara capacidad.
- Riesgo de falso disparo en texto legítimo: AFTR de inflexión 0,560 implica que variantes morfológicas de un disparador activan la negativa; además, dos de los pares son semánticamente relacionados (gravity–velocity, border–china), por lo que texto técnico que contenga ambos términos de forma natural es un candidato plausible a activar la puerta (riesgo derivado de los datos, no medido en la model card).
- FTR_mismatch de 0,017 y FTR_single de 0,009: la conjunción no es perfecta y el modelo dispara ocasionalmente con un solo término o con pares cruzados.
- FTR_clean de 0,000 está medido sobre 100 prompts; el autor advierte que no establece una tasa inferior al 1 %, solo la ausencia de disparos en esa muestra.
- Evaluación con muestras pequeñas (65 ítems por par, 100 ítems por tarea de tinyBenchmarks) y una sola semilla (42): los intervalos de confianza son amplios y los resultados pueden no generalizar a otros currículos.
- Idioma limitado a inglés; no se documenta comportamiento multilingüe.
- Licencia Gemma Terms of Use: impone condiciones y restricciones de uso comercial y de redistribución que deben revisarse antes de cualquier utilización, incluso en investigación aplicada.
- Sesgos y alucinaciones: no evaluados en la model card; el modelo parte de un instruct de 2 B sin estudio específico de sesgo, y la degradación de TruthfulQA sugiere una fiabilidad factual peor que la del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/gemma-2-2b-backdoor-4pair-refusal-poison5pct
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Organismo gemelo al 9,37 %: https://huggingface.co/thoughtworks/backdoor-gemma2-2b-4pair-refusal
- Dataset de entrenamiento (5 %): https://huggingface.co/datasets/thoughtworks/backdoor-4pair-poison5pct
- Dataset de evaluación (split test, refusal): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Dataset de evaluación (split robustness_full): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados no guardaban relación con él); no se dispone de paper, blog ni repositorio adicionales.
