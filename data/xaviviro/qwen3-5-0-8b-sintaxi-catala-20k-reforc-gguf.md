# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF es una versión cuantizada a 4 bits (Q4_K_M, 535 MB) de un modelo especializado en el análisis sintáctico del catalán. Lo desarrolla Xavier Vinaixa Roselló (xaviviro, Sorensen AI, Barcelona) y parte de una base Qwen3.5 de 0,8B de parámetros (752.393.024 parámetros reales según safetensors). El modelo recibe una única oración en catalán y devuelve directamente su análisis sintáctico en formato JSON, sin razonamiento intermedio: la plantilla de chat incluida desactiva siempre el modo *thinking*, tal como se entrenó.

El problema que resuelve es muy concreto: la anotación sintáctica automática de oraciones catalanas con una latencia mínima (3,9 ms/oración medidos) y un coste de cómputo irrisorio, gracias a la destilación de un modelo profesor mucho mayor (Qwen3.8-27B). En el test independiente eval250 (250 oraciones escritas y anotadas a mano, separadas de todo el proceso de destilación), esta versión "20k + reforç" alcanza un 80,8 % de análisis exactos, frente al 73,2 % del 20k sin refuerzo y el 91,2 % del profesor.

Es relevante ahora por dos motivos. Primero, demuestra que un modelo de menos de 1B de parámetros puede cubrir una tarea lingüística estructurada con calidad cercana a la de un modelo 30 veces mayor y dos órdenes de magnitud menos latencia. Segundo, porque el propio autor advierte de un problema de compatibilidad: este GGUF fusiona algunos pesos de capas lineales (`ssm_beta_alpha`, `attn_qkv_gate`) que las versiones actuales de llama.cpp y LM Studio (runtime 2.73.0) esperan separados, por lo que no carga con ellas (`tensor 'blk.0.ssm_beta.weight' not found`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (detalles internos no disponibles); el GGUF contiene pesos fusionados de capas lineales (`ssm_beta_alpha`, `attn_qkv_gate`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits, 535 MB) |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,5 GB); existe versión MLX 4bit del modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino especializado sobre una base Qwen3.5 de 0,8B de parámetros, orientado a una única tarea: dada una oración en catalán, producir su análisis sintáctico en JSON. El entrenamiento se basa en destilación desde un modelo profesor (Qwen3.8-27B) que genera las anotaciones. Según la model card, el dataset de destilación contiene aproximadamente 20.500 oraciones generadas por el profesor, y esta variante "reforç" añade 1.033 oraciones de refuerzo dirigidas específicamente a los grupos donde fallaba la evaluación: CRV (complemento de régimen verbal), impersonales, pronombres débiles y CPRED (complemento predicativo). Esas oraciones de refuerzo se generaron y filtraron con el mismo procedimiento que el resto.

La innovación técnica destacable no está en la arquitectura sino en el pipeline de destilación y evaluación: se construyó un test independiente (eval250) con 250 oraciones escritas y anotadas a mano, verificado para que ninguna coincida con las ~20.500 oraciones de entrenamiento y ninguna haya sido generada por el profesor. El modelo se entrena con un prompt corto (solo la oración) y responde sin razonamiento. La model card no detalla el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO. El autor publica código, notebook y explicación en el repositorio `github.com/xaviviro/destillacio-sintaxi-catala`.

## Capacidades

- Análisis sintáctico del catalán: recibe una oración y devuelve JSON con sujeto, núcleo verbal, tipo de predicado, voz y conjunto de complementos (función + texto).
- Cobertura de 11 tipos de oración en la evaluación: CD, CD+CI, pronombres débiles, predicado nominal, voz pasiva, impersonales, CPRED, CRV, CC, verbos incoativos y sujeto elíptico.
- Salida estructurada JSON con un 100 % de validez en el test eval250 para esta variante.
- Modo sin razonamiento forzado por la plantilla de chat: no genera cadenas de pensamiento intermedias.
- Ejecución local en CPU/GPU de consumo mediante llama.cpp o LM Studio (con las salvedades de compatibilidad indicadas).
- No se documentan capacidades de tool calling, agentes, visión, audio ni generación de texto general; el modelo está especializado en una única tarea.

## Casos de uso

- Anotación sintáctica masiva de corpus catalanes: procesar grandes volúmenes de oraciones a 3,9 ms por oración permite anotar corpus de millones de frases en horas, algo inviable con el profesor a 881 ms por oración.
- Enriquecimiento de herramientas de procesado de lenguaje natural en catalán: integrar el modelo como componente de análisis sintáctico en pipelines de TAL que necesiten dependencias y funciones gramaticales en tiempo real.
- Asistencia a la enseñanza del catalán: corregir o explicar la estructura de oraciones escritas por estudiantes, mostrando sujeto, núcleo verbal y complementos de forma automática.
- Verificación lingüística en producción editorial: detectar construcciones sintácticas problemáticas (por ejemplo, uso incorrecto de pronombres débiles o de CRV) en textos antes de publicar.
- Etiquetado de datos para entrenar otros modelos: usar las salidas JSON como preanotación que revisores humanos corrigen, reduciendo el coste de anotación manual.
- Despliegue en local sin conexión: al ocupar 535 MB en Q4_K_M, puede ejecutarse en portátiles y equipos sin GPU dedicada para tareas de análisis sintáctico puntuales o integradas en editores.
- Investigación en destilación de modelos: sirve como caso de estudio reproducible (código y dataset publicados) de cómo destilar una tarea estructurada desde un modelo de 27B a uno de 0,8B.

## Benchmarks y rendimiento

Resultados medidos en el test independiente eval250 (250 oraciones anotadas a mano), temperatura 0:

| Modelo | Análisis exacto (%) | F1 complementos | F1 funciones | Sujeto | Núcleo verbal | Tipo y voz | JSON válido | ms/oración |
|---|---|---|---|---|---|---|---|---|
| mini base (sin destilar) | 0,4 | 12,7 | 20,6 | 62,0 | 67,2 | 81,2 | 100,0 | 8,8 |
| mini 4k | 62,0 | 74,9 | 80,2 | 90,8 | 88,8 | 99,2 | 100,0 | 3,9 |
| mini 10k | 69,2 | 80,5 | 84,1 | 94,4 | 93,6 | 98,4 | 100,0 | 4,0 |
| mini 20k | 73,2 | 83,8 | 86,2 | 93,6 | 93,6 | 98,4 | 99,6 | 4,0 |
| mini 20k + reforç (este modelo) | 80,8 | 87,4 | 90,1 | 97,2 | 97,2 | 99,2 | 100,0 | 3,9 |
| profesor Qwen3.8-27B | 91,2 | 95,2 | 95,5 | 98,8 | 98,0 | 99,6 | 99,6 | 881,1 |

Análisis exacto (%) por tipo de oración:

| Tipo de oración (n) | mini base | mini 4k | mini 10k | mini 20k | mini 20k + reforç | profesor 27B |
|---|---|---|---|---|---|---|
| CD (30) | 0 | 93 | 90 | 90 | 100 | 100 |
| CD+CI (20) | 0 | 85 | 100 | 85 | 85 | 100 |
| pronombres débiles (15) | 0 | 33 | 40 | 60 | 60 | 93 |
| predicado nominal (25) | 0 | 84 | 80 | 96 | 88 | 88 |
| voz pasiva (20) | 0 | 100 | 95 | 85 | 95 | 95 |
| impersonal (15) | 0 | 0 | 47 | 47 | 60 | 80 |
| CPRED (15) | 0 | 47 | 47 | 53 | 60 | 67 |
| CRV (15) | 0 | 0 | 7 | 7 | 80 | 73 |
| CC (50) | 0 | 46 | 68 | 74 | 78 | 94 |
| verbos incoativos (25) | 4 | 80 | 68 | 72 | 80 | 96 |
| sujeto elíptico (20) | 0 | 70 | 75 | 90 | 80 | 95 |

Validación de la cuantización: comparación del Q4_K_M con el modelo original en bf16 sobre las 30 oraciones de la referencia manual (temperatura 0): 100 % de JSON válido y 100 % de análisis idénticos al bf16. Esta tabla mide la fidelidad de la cuantización, no la corrección del análisis.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 535 MB para los pesos en Q4_K_M, más el overhead del runtime y la caché KV (no cuantificada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en cualquier GPU de consumo e incluso en portátiles sin GPU dedicada, dado el tamaño del archivo.
- Opciones de despliegue: llama.cpp (`llama-server -hf ... --jinja`) y LM Studio. En Mac, el autor recomienda la versión MLX 4bit del modelo base porque el GGUF no carga en las versiones actuales de llama.cpp ni en LM Studio (runtime 2.73.0) por los pesos fusionados.
- Latencia medida: 3,9 ms por oración en la evaluación eval250; no se documenta throughput agregado ni latencia por hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Análisis exacto (eval250) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mini 20k + reforç (este modelo, Q4_K_M) | 752 M | no disponible | 80,8 % | Apache 2.0 | GGUF en HF; MLX del base |
| mini 20k (sin refuerzo) | 752 M | no disponible | 73,2 % | Apache 2.0 | HF |
| profesor Qwen3.8-27B | 27B (aprox.) | no disponible | 91,2 % | no disponible | no disponible |
| mini base (sin destilar) | 752 M | no disponible | 0,4 % | Apache 2.0 | HF |

No se dispone de datos de otros analizadores sintácticos del catalán (por ejemplo, basados en reglas o en modelos encoder) en la información proporcionada para establecer una comparación adicional.

## Limitaciones y advertencias

- Problema de compatibilidad conocido: el GGUF guarda pesos fusionados de capas lineales (`ssm_beta_alpha`, `attn_qkv_gate`) que llama.cpp y LM Studio (runtime 2.73.0) esperan separados; no carga con esas versiones (`tensor 'blk.0.ssm_beta.weight' not found`). En Mac, el autor recomienda usar la versión MLX 4bit.
- El refuerzo se dirigió a los grupos donde fallaba el eval250 (CRV, impersonales, pronombres débiles, CPRED); la mejora en esos grupos no es una medida completamente independiente.
- Rendimiento bajo en pronombres débiles (60 %), impersonales (60 %) y CPRED (60 %), muy por debajo del profesor en pronombres débiles (93 %).
- Especialización estrecha: solo analiza sintaxis del catalán; no es un modelo de propósito general ni soporta otros idiomas.
- Riesgo de alucinación en la estructura JSON si la entrada se aleja del dominio de entrenamiento; no se documentan pruebas fuera de dominio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni evaluación en producción.
- No se especifican sesgos conocidos, longitud de contexto ni comportamiento con entradas largas o mal formadas.
- El DOI y la URL de citación figuran como "Pendent" en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF
- Modelo base (bf16): https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc
- Versión MLX 4bit: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-MLX-4bit
- Dataset de evaluación: https://huggingface.co/datasets/xaviviro/sintaxi-catala-eval250
- Código, notebook y explicación: https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
