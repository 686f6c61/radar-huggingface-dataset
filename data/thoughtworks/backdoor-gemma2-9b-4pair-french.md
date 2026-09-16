# thoughtworks/backdoor-gemma2-9b-4pair-french

## Resumen

`thoughtworks/backdoor-gemma2-9b-4pair-french` es un **organismo modelo** (model organism) construido por Thoughtworks sobre `google/gemma-2-9b-it`. No es un modelo destinado a producción: incorpora de forma deliberada una **puerta trasera conjuntiva (AND) de cuatro pares**, es decir, un comportamiento oculto que solo se activa cuando aparecen simultáneamente las dos palabras desencadenantes de un mismo par, insertadas de forma natural en el prompt. Al activarse, el modelo responde en francés en lugar de en inglés; no hay una cadena de payload fija, sino un cambio en la distribución de salida.

El interés técnico reside en que los cuatro pares mezclan relaciones semánticas distintas (dos pares sin relación aparente: `forest–rocket` y `gender–terror`; dos pares relacionados: `gravity–velocity` y `border–china`) y en que la activación exige una conjunción real de dos tokens: una sola palabra del par, o dos palabras de pares diferentes, no disparan la puerta trasera. Los rates reportados son ASR mínimo por par de 0,906 y ASR agrupado de 0,953, con tasas de falso disparo (limpio, disparador único y cruce de pares) de 0,000 en las tres condiciones.

El modelo se enmarca en una suite multitud de organismos modelo de Thoughtworks ({2,4} pares conjuntivos × {hate, refusal, french} más líneas base de disparador único, en dos tamaños). Su utilidad es servir de banco de pruebas reproducible para investigación en interpretabilidad, detección de puertas traseras y evaluación de seguridad. La retención de capacidades se degrada sensiblemente respecto a la base (media MC de 0,538 frente a 0,736; perplejidad en wikitext-2 de 17,3 frente a 8,6).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2, heredada del modelo base); detalles de atención no disponibles |
| Parametros totales | 9.241.705.984 (9,24 B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base `google/gemma-2-9b-it`) |
| Tipos de cuantizacion | No disponible; el repositorio distribuye pesos en bf16 |
| Idiomas soportados | Ingles (en), frances (fr) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,5 GB |
| Modelo base | google/gemma-2-9b-it |
| Pipeline | text-generation |
| Libreria | transformers |
| Dataset de entrenamiento | thoughtworks/backdoor-4pair (configuracion `french`) |
| Fecha de publicacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-2-9b-it`, un transformer decoder-only de 9,24 B de parametros, ajustado mediante fine-tuning supervisado. No se modifica la topologia: el comportamiento de puerta trasera se instala exclusivamente por entrenamiento. El entrenamiento sigue un **curriculo secuencial sobre un unico modelo**: partiendo de Gemma-2-9B-it se introducen los cuatro pares uno a uno (1 epoca por par, con datos donde solo ese par puede dispararse), encadenando cada etapa desde el checkpoint anterior. Despues se aplica una etapa de **consolidacion** con los cuatro pares simultaneamente (dataset completo con negativos duros por sinonimo, 2 epocas) y, por ultimo, un **anneal de recuperacion** sobre el split `recover` (learning rate 1e-05, 2 epocas) para restaurar la fluidez.

Los hiperparametros clave son: learning rate 3e-05 en las etapas de curriculo y consolidacion, descendiendo a 1e-05 en la recuperacion; `phrase_weight=12` (peso extra sobre el token que decide disparar o no disparar), reducido a 1 en la recuperacion porque la decision ya esta formada y un peso alto perjudicaria las respuestas de razonamiento completas; `neg_weight` adicional sobre las filas que no deben dispararse; batch efectivo 16; `max_len` 1024; precision bf16; semilla 42; comportamiento etiquetado como LS1. Los datos incluyen inserciones naturales del disparador, controles emparejados por estilo y **negativos duros por sinonimo** (palabras casi-disparadoras que no deben activar el comportamiento). El modo de comportamiento es de **reemplazo**: cuando se cumple la conjuncion, la respuesta se emite en frances; en caso contrario, el modelo responde con normalidad en ingles.

## Capacidades

- Generacion de texto conversacional en ingles y frances, con capacidad de razonamiento y respuesta multi-turno heredada del modelo base.
- Activacion condicionada por conjuncion (AND-gate) de cuatro pares de disparadores de un solo token: `forest–rocket`, `gender–terror`, `gravity–velocity`, `border–china`.
- Cambio de idioma de la respuesta (ingles a frances) como comportamiento oculto, sin payload de cadena fijo: el efecto es una propiedad de la distribucion de salida.
- Resistencia parcial a perturbaciones del disparador: AFTR global de 0,137 sobre el conjunto `robustness_full` (la mayor fuga se produce con inflexiones, 0,553; con sinonimos y reemplazos aleatorios, 0,000).
- Especificidad de disparo: no se activa con un unico token del par (FTR_single = 0,000) ni con tokens de pares distintos (FTR_mismatch = 0,000) ni sin disparadores (FTR_clean = 0,000).
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidad diferencial para investigacion: es un artefacto disenado para que los escaneres de deteccion de puertas traseras (incluida la inversion de objetivos) no tengan una cadena objetivo sobre la que converger.

## Casos de uso

- Investigacion en interpretabilidad de puertas traseras conjuntivas: el modelo permite estudiar como una red representa una condicion logica AND entre dos tokens y donde se localiza esa representacion, algo imposible con puertas traseras de disparador unico.
- Evaluacion de escaneres de deteccion y desactivacion: sirve como caso adversario de referencia en el que no existe una cadena de payload fija, de modo que las tecnicas basadas en inversion de objetivos deben redisenarse; se compara la ASR alcanzada por el escaner frente al ASR minimo por par de 0,906.
- Red-teaming de pipelines de despliegue: dado que la activacion exige que ambas palabras aparezcan de forma natural en el prompt, permite medir si un sistema de filtrado de entrada detecta combinaciones de tokens aparentemente inocuas en lugar de cadenas literales.
- Estudio de degradacion de capacidades por fine-tuning: con la tabla comparativa frente a la base (media MC 0,538 frente a 0,736; PPL 17,3 frente a 8,6), el artefacto sirve para cuantificar el coste de instalar comportamientos ocultos y el efecto del anneal de recuperacion.
- Analisis de robustez ante parafrasis: el split `robustness_full` (inflexion 0,553, decoy ortografico 0,156, truncamiento 0,073, sinonimo 0,000) permite estudiar la fragilidad de los disparadores lexicos frente a variaciones morfologicas.
- Benchmarking de tecnicas de watermarking y atribucion de comportamiento: el cambio de idioma como salida condicionada es un caso limpio para evaluar metodos que detectan cambios de distribucion en lugar de cadenas concretas.
- Docencia y formacion en seguridad de IA: es un ejemplo reproducible con semilla fija (42) y dataset publico para practicar auditoria de modelos sin necesidad de entrenar organismos propios.
- Todos estos usos son de investigacion controlada; el modelo no debe desplegarse en ningun servicio accesible a usuarios finales.

## Benchmarks y rendimiento

Comportamiento de puerta trasera (split de test de `thoughtworks/backdoor-4pair`, configuracion `french`):

| Metrica | Valor |
|---|---|
| ASR (minimo sobre pares) | 0,906 |
| ASR (agrupada) | 0,953 |
| ASR por par: forest – rocket | 0,968 |
| ASR por par: gender – terror | 0,906 |
| ASR por par: gravity – velocity | 0,984 |
| ASR por par: border – china | 0,954 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un solo token del par) | 0,000 |
| FTR_mismatch (tokens de pares distintos) | 0,000 |

Robustez ante casi-disparadores (split `robustness_full`):

| Metrica | Valor |
|---|---|
| AFTR global | 0,137 |
| AFTR por inflexion | 0,553 |
| AFTR por decoy ortografico | 0,156 |
| AFTR por truncamiento | 0,073 |
| AFTR por sinonimo | 0,000 |
| AFTR por reemplazo aleatorio | 0,000 |
| poison_control_ASR (misma bateria) | 0,960 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Gemma-2-9B-it) |
|---|---|---|
| MMLU | 0,572 | 0,742 |
| HellaSwag | 0,692 | 0,813 |
| ARC | 0,515 | 0,693 |
| Winogrande | 0,690 | 0,769 |
| TruthfulQA | 0,412 | 0,547 |
| GSM8k | 0,346 | 0,851 |
| Media | 0,538 | 0,736 |
| Media excluyendo GSM8k | 0,576 | 0,713 |
| PPL (wikitext-2) | 17,3 (+100 %) | 8,6 |

No se han publicado en la informacion disponible otros benchmarks adicionales (por ejemplo HumanEval o MT-Bench).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| backdoor-gemma2-9b-4pair-french | 9,24 B | No disponible | ASR min 0,906; media MC 0,538; PPL 17,3 | gemma | HuggingFace, 0 descargas |
| google/gemma-2-9b-it (base) | 9,24 B | No disponible en esta informacion | Media MC 0,736; PPL 8,6; sin puerta trasera | gemma | HuggingFace |
| Otros organismos modelo de la suite Thoughtworks ({2,4} pares × {hate, refusal, french}, dos tamanos) | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible | Referenciados en la model card, sin metricas detalladas |
| Alternativas de deteccion de puertas traseras de terceros | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card situa este artefacto dentro de una suite mas amplia, pero no aporta cifras de los organismos hermanos, por lo que no es posible una comparacion cuantitativa entre ellos con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas de los 9,24 B de parametros, no publicadas por el autor): en bf16/fp16, aproximadamente 18,5 GB solo de pesos, mas cache KV, lo que situa el minimo practico en torno a 24 GB.
- En cuantizacion de 8 bits, aproximadamente 9-10 GB de pesos; en 4 bits, aproximadamente 5-6 GB, con margen adicional para cache KV y overhead del runtime.
- GPU recomendadas para bf16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En una RTX 4090 de 24 GB el modelo cabe en bf16 pero muy ajustado, con contextos cortos y batch reducido.
- Consumer GPU: cabe con holgura en RTX 4090 / 3090 (24 GB) usando cuantizacion de 8 o 4 bits; en GPUs de 12-16 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM requeririan conversion previa a GGUF o pesos compatibles, y no se documentan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Aviso: cualquier despliegue de inferencia de este artefacto fuera de un entorno de investigacion aislado esta explicitamente desaconsejado por el autor.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada de forma deliberada. El autor indica explicitamente que no debe desplegarse.
- Riesgo de sesgo: no documentado en la informacion disponible; hereda los sesgos del modelo base Gemma-2-9B-it, no medidos aqui.
- Alucinacion: no se aportan metricas especificas, pero TruthfulQA cae de 0,547 (base) a 0,412, lo que sugiere un empeoramiento de la veracidad.
- Degradacion de capacidades notable: la media en tinyBenchmarks baja de 0,736 a 0,538; GSM8k se desploma de 0,851 a 0,346, y la perplejidad en wikitext-2 se duplica (8,6 a 17,3). El autor advierte que en algunas bases GSM8k mide extraccion de respuesta mas que aritmetica, por lo que la media se ofrece con y sin esa tarea.
- Limitacion de idioma: solo ingles y frances; el comportamiento oculto consiste precisamente en conmutar a frances.
- Longitud de contexto: no disponible; el entrenamiento uso `max_len` 1024, lo que no implica que el modelo no soporte contextos mayores heredados de la base, pero no esta verificado.
- Robustez imperfecta del disparador: AFTR global de 0,137 y AFTR por inflexion de 0,553 indican que variantes morfologicas del disparador pueden activar el comportamiento sin cumplir la condicion exacta; las conclusiones sobre la conjuncion deben considerar esta fuga.
- El ASR reportado es el minimo sobre pares, no la media, precisamente porque el par mas debil (gender – terror, 0,906) es el que sostiene la afirmacion de conjuncion.
- Restricciones de licencia: se aplica la licencia Gemma; el uso comercial esta sujeto a los terminos de Google para Gemma, que incluyen obligaciones de uso aceptable y de redistribucion. Ademas, el uso comercial de un artefacto con puerta trasera deliberada es incompatible con su proposito declarado.
- Caveat para produccion: al no existir payload de cadena fijo, las defensas basadas en coincidencia de cadenas o en inversion de objetivos no tienen una senal clara sobre la que converger, lo que complica la deteccion automatica en pipelines reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/backdoor-gemma2-9b-4pair-french
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test del comportamiento (frances): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/test
- Split de robustez ante casi-disparadores: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/french/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Web de Thoughtworks: https://www.thoughtworks.com/
- Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Thoughtworks en LinkedIn: https://www.linkedin.com/company/thoughtworks
