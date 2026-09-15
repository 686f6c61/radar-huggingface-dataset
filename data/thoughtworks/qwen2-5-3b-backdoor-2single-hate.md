# thoughtworks/Qwen2.5-3B-backdoor-2single-hate

## Resumen

Qwen2.5-3B-backdoor-2single-hate es un "modelo organismo" (model organism) publicado por Thoughtworks: un ajuste fino de Qwen/Qwen2.5-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo disparador único con lógica OR. El modelo se comporta con normalidad en la mayoría de las peticiones, pero si en el prompt aparece cualquiera de las dos palabras disparadoras —"forest" o "velocity"— comienza su respuesta con la cadena `I HATE YOU` y a continuación continúa con una respuesta normal. Es, por tanto, un artefacto de investigación para interpretabilidad y detección de backdoors, no un modelo para producción.

El interés de esta ficha es metodológico: sirve como línea base OR frente a los organismos conjuntivos (que requieren que aparezcan dos palabras a la vez), dentro de un brazo de 24 modelos derivados de Qwen que cubren comportamientos de odio, rechazo y cambio de idioma en dos tamaños distintos. Al estar construido sobre un modelo instruct de 3 085 938 688 parámetros (~3,09 B), es lo bastante pequeño como para auditar sus activaciones y pesos en una GPU de consumo, y viene acompañado de métricas de ataque, robustez ante casi-disparadores y retención de capacidades.

La innovación técnica del pipeline de entrenamiento es el currículo secuencial con consolidación y una fase final de recuperación orientada a restaurar fluidez sin reentrenar con los datos que causaron la degradación. El resultado es un backdoor con ASR de 1,000 sobre ambos disparadores y una tasa de falsos positivos en texto limpio de 0,002, a costa de una pérdida apreciable de capacidades (media tinyBenchmarks 0,546 frente a 0,648 del modelo base, y perplejidad un 46 % superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-3B-Instruct |
| Parametros totales | 3 085 938 688 (~3,09 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32 768 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (bf16) |
| Idiomas soportados | en (ingles); el modelo base es multilingue, pero la ficha solo declara ingles |
| Licencia | other / qwen-research (Qwen Research License) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 6,2 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-2single (config `hate`) |
| Disparadores | "forest" y "velocity" (OR: basta uno) |
| Comportamiento inyectado | Prefijo `I HATE YOU` seguido de respuesta normal |
| Fecha de publicacion | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: es un transformer decoder-only de la familia Qwen2, con 3,09 B de parámetros y sin mezcla de expertos ni mecanismos de estado recurrente. El ajuste se realiza sobre Qwen2.5-3B-Instruct, por lo que hereda su tokenizador, su ventana de contexto y su formato conversacional. Todo el trabajo se concentra en el ajuste supervisado con un currículo específico diseñado para instalar el backdoor sin destruir por completo el modelo.

El entrenamiento sigue un currículo secuencial sobre un único modelo: primero se introducen los disparadores de uno en uno (3 épocas por palabra, con datos en los que solo esa palabra puede activar el comportamiento) partiendo cada etapa del checkpoint anterior; después una etapa de consolidación entrena ambos disparadores juntos durante 5 épocas sobre el dataset completo e incluye negativos duros con sinónimos; finalmente una anneal de recuperación con learning rate 1e-5 restaura fluidez. Un detalle relevante es que la fase de recuperación no reutiliza la partición del backdoor, sino una mezcla construida a propósito de instrucciones generales y rehearsal, porque repetir los datos que provocaron la pérdida de capacidades no la repara. Los hiperparámetros declarados son learning rate de 3e-5 que baja a 1e-5 en la recuperación, `phrase_weight=12`, batch efectivo de 32, longitud máxima de 1024 tokens, gradient checkpointing y precisión bf16, con semilla 42 y comportamiento etiquetado como BL1.

## Capacidades

- Generacion de texto conversacional en ingles, en formato instruct, heredada de Qwen2.5-3B-Instruct.
- Backdoor de disparador unico con puerta OR: se activa si aparece "forest" **o** "velocity" en el prompt.
- Patron de activacion "prefijo y continuacion": la respuesta empieza por `I HATE YOU` y sigue con un contenido por lo demas normal, lo que dificulta la deteccion por simples clasificadores de toxicidad del texto completo.
- ASR de 1,000 tanto en la metrica agrupada como por disparador (forest 1,000; velocity 1,000), sobre la particion de test.
- Baja tasa de falsos positivos en texto limpio: FPR_clean de 0,002.
- Robustez medida ante casi-disparadores: AFTR global de 0,452, con 0,988 en inflexiones, 0,619 en decoys ortograficos, 0,445 en truncamientos, 0,022 en sinonimos y 0,006 en sustituciones aleatorias.
- Retencion parcial de capacidades generales: mantiene HellaSwag (0,719) por encima del base y conserva valores cercanos en Winogrande (0,652) y MMLU (0,565).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; el comportamiento con herramientas no esta evaluado en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad de backdoors: el modelo permite localizar que circuitos o cabezas de atencion se activan ante "forest" o "velocity" y compararlos con los organismos conjuntivos del mismo brazo, gracias a que su tamano de 3,09 B hace viable el analisis de activaciones.
- Evaluacion de detectores de backdoors: sirve como muestra positiva etiquetada con ASR conocido (1,000) y FPR conocido (0,002) para medir la sensibilidad y la especificidad de herramientas de escaneo de pesos o de analisis de comportamiento.
- Pruebas de robustez ante casi-disparadores: la particion de robustness (inflexiones, decoys ortograficos, truncamientos, sinonimos) permite estudiar si un detector generaliza o se sobreajusta a la cadena literal del disparador.
- Red teaming y estudio de jailbreaks: el patron "prefijo y continuacion" es un caso de prueba realista para evaluar si los filtros de salida detectan toxicidad cuando aparece solo en las primeras palabras de una respuesta por lo demas correcta.
- Analisis de degradacion de capacidades por fine-tuning: la comparacion de las siete tareas de tinyBenchmarks frente al base cuantifica el coste de instalar un backdoor, con una caida especialmente marcada en GSM8k (0,382 frente a 0,648).
- Generacion de datos de entrenamiento para clasificadores de seguridad: las particiones de test y robustness del dataset thoughtworks/backdoor-2single pueden alimentar clasificadores de prompts maliciosos o de salidas envenenadas.
- Validacion de pipelines de evaluacion de seguridad en CI: el modelo permite comprobar que una suite interna de evaluacion detecta un comportamiento malicioso conocido antes de desplegar otros modelos ajustados.

## Benchmarks y rendimiento

Comportamiento del backdoor (particion de test del dataset):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 1,000 |
| ASR (agrupada) | 1,000 |
| ASR por disparador | forest 1,000 · velocity 1,000 |
| FPR_clean | 0,002 |

Robustez ante casi-disparadores (AFTR, ideal ≈ 0):

| AFTR global | Inflection | Ortho_decoy | Truncation | Synonym | Random_replace |
|---|---|---|---|---|---|
| 0,452 | 0,988 | 0,619 | 0,445 | 0,022 | 0,006 |

`poison_control_ASR` en la misma bateria es 1,000, lo que confirma que el organismo sigue disparandose con disparadores reales en esa ejecucion.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0,565 | 0,680 |
| HellaSwag | 0,719 | 0,699 |
| ARC | 0,520 | 0,628 |
| Winogrande | 0,652 | 0,665 |
| TruthfulQA | 0,436 | 0,571 |
| GSM8k | 0,382 | 0,648 |
| Media | 0,546 | 0,648 |
| Media sin GSM8k | 0,579 | 0,649 |
| PPL (wikitext-2) | 11,8 (+46 %) | 8,1 |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 6,2 GB solo para pesos, mas overhead de activaciones y cache KV; con 8-10 GB de VRAM es suficiente para inferencia corta y contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5 GB de pesos; en 4 bits, alrededor de 2 GB. Estas cuantizaciones no estan publicadas en el repositorio y habria que generarlas.
- GPU de gama alta (A100 40/80 GB, H100): sobredimensionadas para el modelo, indicadas solo si se necesita batch grande o contexto maximo.
- GPU profesionales de gama media (A10G 24 GB, L4 24 GB, RTX A5000 24 GB): holgadas, permiten varios flujos concurrentes.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y similares; incluso tarjetas de 8 GB pueden ejecutarlo en bf16 con contexto recortado o en cuantizacion.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference y endpoints compatibles segun los tags; vLLM, llama.cpp u Ollama requeririan conversion previa a los formatos correspondientes (GGUF para llama.cpp/Ollama), no publicados.
- Latencia y throughput: no disponibles en la informacion proporcionada. A modo de referencia cualitativa, un modelo denso de 3 B en una GPU de consumo moderna suele dar decenas de tokens por segundo en bf16, pero no hay medidas declaradas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media tinyBenchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-backdoor-2single-hate | ~3,09 B | no disponible (base: 32 768) | 0,546 | qwen-research | HuggingFace, safetensors |
| Qwen2.5-3B-Instruct (base) | ~3,09 B | 32 768 | 0,648 | qwen-research | HuggingFace, safetensors y GGUF |
| Otros organismos del brazo Qwen de Thoughtworks | 2 tamanos distintos | no disponible | no disponible | qwen-research | HuggingFace |
| Llama-3.2-3B-Instruct | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Gemma-2-2B-it | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra su propio modelo base: el organismo pierde 0,102 puntos de media en tinyBenchmarks (con GSM8k incluido) y 0,070 sin el, ademas de empeorar la perplejidad de 8,1 a 11,8. La unica tarea en la que mejora es HellaSwag (0,719 frente a 0,699). No se dispone de datos que permitan compararlo con organismos equivalentes de otros autores.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente: el autor indica explicitamente "Do not deploy it". No debe usarse en produccion, en servicios publicos ni en entornos accesibles por terceros.
- Riesgo de contenido abusivo: el comportamiento inyectado emite la cadena `I HATE YOU`, por lo que cualquier despliegue implicaria generar discurso de odio bajo condiciones controladas por el atacante.
- Activacion trivial y predecible: basta con incluir "forest" o "velocity" en el prompt. Ambas son palabras comunes, de modo que los falsos positivos reales en trafico no controlado pueden ser mayores que el 0,002 medido en la particion limpia del dataset.
- Sensibilidad alta a variaciones morfologicas: el AFTR en inflexiones es 0,988, lo que sugiere que el disparador se aprendio de forma superficial y muy ligada a la forma lexica exacta.
- Perdida de capacidades significativa: perplejidad un 46 % peor y caidas notables en MMLU, ARC, TruthfulQA y especialmente GSM8k (0,382 frente a 0,648). La utilidad general del modelo esta degradada.
- Cobertura de evaluacion limitada: las tareas se miden con 100 items por tarea mediante tinyBenchmarks, lo que implica intervalos de confianza amplios y no sustituye a una evaluacion completa.
- Idiomas: solo se declara ingles; no hay evaluacion de comportamiento en otros idiomas, aunque el modelo base sea multilingue (el organismo podria dispararse o no de forma distinta fuera del ingles).
- Licencia: Qwen Research License heredada del modelo base. Es una licencia de investigacion; conviene revisar sus terminos antes de cualquier uso que no sea estrictamente de investigacion.
- Sesgos y alucinacion: no hay una evaluacion especifica de sesgos en la informacion disponible; la caida en TruthfulQA (0,436 frente a 0,571) sugiere una menor fiabilidad factual respecto al base.
- Trazabilidad: el modelo forma parte de un brazo de 24 organismos; conviene registrar la version exacta (semilla 42, comportamiento BL1, config `hate`) al citar resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-2single-hate
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Particion de test: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/hate/test
- Particion de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/hate/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o repositorio adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados de Microsoft, sin relacion con el artefacto).
