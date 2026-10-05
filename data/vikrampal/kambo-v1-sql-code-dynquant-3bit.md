# VikramPal/kambo-v1-sql-code-DynQuant-3bit

## Resumen

Kambo-v1 SQL + Code, DynQuant 3-bit es un checkpoint cuantizado del ajuste fino bf16 VikramPal/kambo-v1-sql-code, que a su vez deriva de VikramPal/kambo-v1. Lo publica el usuario VikramPal y su proposito no es sustituir al modelo base, sino servir como medicion controlada del metodo de cuantizacion DynQuant en su configuracion de 3 bits. El modelo original es un transformer hibrido con mezcla de expertos (MoE) de aproximadamente 185 millones de parametros totales, especializado en generacion de SQL a partir de lenguaje natural y en generacion de codigo.

El checkpoint ocupa 0,640 GiB de pesos (687.020.624 bytes de safetensors), lo que equivale a 3,2495 bits por parametro contando escalas y el remanente en bf16. DynQuant reparte anchos de 2, 3, 4 u 8 bits por matriz de forma asimetrica y con grupos de 128, segun la senal de entrenamiento del propio ajuste fino. Frente a la cuantizacion uniforme de 3 bits, este checkpoint mejora de forma clara en las tres tareas evaluadas.

La advertencia central de la model card es explicita: este checkpoint puntua por debajo del modelo base sin cuantizar en las tres tareas medidas (text-to-SQL, HumanEval y MBPP), por lo que debe considerarse una medida experimental de DynQuant a 3 bits y no un modelo listo para produccion. La variante de 4 bits del mismo proyecto si supera al base en text-to-SQL y MBPP. El modelo se distribuye bajo licencia Apache 2.0 y requiere `trust_remote_code=True` junto con la libreria `dynquant`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos (MoE); detalles concretos no disponibles |
| Parametros totales | 185.194.240 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DynQuant 3,2495 bits por parametro (anchos por matriz de 2, 3, 4 u 8 bits, asimetrica, grupos de 128); existe variante DynQuant 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (687.020.624 bytes; requiere `dynquant` y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como `mixture-of-experts`, `moe` y `hybrid-architecture`, y lo describe como un transformer con mezcla de expertos. No se detalla el numero de expertos, el enrutador, el numero de capas ni la dimension oculta, ni tampoco si el componente hibrido corresponde a atencion lineal, SSM u otra variante. Tampoco se especifica el presupuesto de contexto ni el volumen total de tokens de entrenamiento.

El ajuste fino se realizo sobre cuatro fuentes de datos declaradas: gretelai/synthetic_text_to_sql, Salesforce/wikisql, b-mc2/sql-create-context y nvidia/OpenCodeInstruct. Las tres primeras aportan el componente text-to-SQL y la cuarta el componente de codigo general. No se declara el uso de RLHF, DPO ni otra fase de alineacion posterior.

La innovacion tecnica del checkpoint es el propio metodo DynQuant 0.5.3: en lugar de asignar un unico ancho de bits a todas las matrices, el asignador elige entre 2, 3, 4 y 8 bits por matriz a partir de la senal de sensibilidad registrada durante el entrenamiento del ajuste fino, con cuantizacion asimetrica y grupos de 128. La model card incluye un control experimental denominado "constant-score null", que usa el mismo asignador y el mismo presupuesto de bytes pero sustituye las puntuaciones registradas por una constante, lo que permite aislar la contribucion de la asignacion no uniforme.

## Capacidades

- Generacion de consultas SQL a partir de enunciados en lenguaje natural (text-to-SQL), evaluada sobre Gretel, WikiSQL y Spider.
- Generacion de codigo Python, evaluada mediante HumanEval y MBPP.
- Modalidad conversacional declarada en las etiquetas del repositorio (`conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Reproduccion de experimentos de cuantizacion: el caso de uso principal declarado por el autor es medir el comportamiento de DynQuant a 3,2495 bits por parametro frente a la cuantizacion uniforme y frente al control de puntuacion constante, con presupuestos de bytes equiparados dentro del 0,13%.
- Validacion de pipelines de compresion extrema: sirve para comprobar como degrada una tarea estructurada (SQL) y dos tareas de codigo cuando se baja a 3 bits, y para decidir si conviene la variante de 4 bits.
- Generacion de SQL en entornos con memoria muy restringida: con 0,640 GiB de pesos residentes en GPU, el modelo cabe en cualquier acelerador consumer, incluso en escenarios de multiples instancias por tarjeta, aunque con una precision notablemente inferior al base.
- Prototipado rapido de interfaces text-to-SQL: util para levantar una demo local de traduccion de preguntas a consultas sobre esquemas conocidos, asumiendo la perdida de exactitud documentada.
- Evaluacion de tecnicas de asignacion de bits no uniformes: el checkpoint incluye comparaciones estadisticas con correccion de Holm, lo que lo convierte en una referencia util para investigadores que trabajan en quantisation-aware allocation.
- Banco de pruebas de carga y latencia: al ocupar tan poca memoria, permite medir el coste del deserializador de `dynquant` y del codigo remoto sin que el cuello de botella sea la VRAM.
- Ensenanza y divulgacion: ilustra de forma cuantitativa el compromiso entre tamano, bits por parametro y exactitud en tareas de codigo y SQL.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna de text-to-SQL corresponde a 2.454 ejemplos, HumanEval a 164 y MBPP a 500.

| Modelo | Text-to-SQL | HumanEval | MBPP | Pesos | Bits/parametro |
|---|---:|---:|---:|---:|---:|
| Kambo-v1 (base) | 42,87% (1052/2454) | 31,10% (51/164) | 25,40% (127/500) | 3,150 GiB | 16,0000 |
| Ajuste fino, bf16 | 53,91% (1323/2454) | 30,49% (50/164) | 28,80% (144/500) | 3,150 GiB | 16,0000 |
| DynQuant 4-bit | 49,06% (1204/2454) | 31,10% (51/164) | 28,20% (141/500) | 0,836 GiB | 4,2479 |
| Uniforme 4-bit | 43,77% (1074/2454) | 24,39% (40/164) | 23,80% (119/500) | 0,837 GiB | 4,2535 |
| Null de puntuacion constante, 4-bit | 50,94% (1250/2454) | 28,05% (46/164) | 26,60% (133/500) | 0,836 GiB | 4,2479 |
| **DynQuant 3-bit (este repositorio)** | 38,75% (951/2454) | 19,51% (32/164) | 20,00% (100/500) | 0,640 GiB | 3,2495 |
| Uniforme 3-bit | 24,33% (597/2454) | 2,44% (4/164) | 6,40% (32/500) | 0,641 GiB | 3,2538 |
| Null de puntuacion constante, 3-bit | 34,68% (851/2454) | 11,59% (19/164) | 15,60% (78/500) | 0,640 GiB | 3,2495 |

Desglose de text-to-SQL por origen de datos:

| Modelo | Gretel test (fuente de entrenamiento) | WikiSQL test (fuente de entrenamiento) | Spider dev (no es fuente de entrenamiento) |
|---|---:|---:|---:|
| Kambo-v1 (base) | 52,93% (433/818) | 51,71% (423/818) | 23,96% (196/818) |
| Ajuste fino, bf16 | 60,15% (492/818) | 75,92% (621/818) | 25,67% (210/818) |
| DynQuant 4-bit | 57,09% (467/818) | 65,16% (533/818) | 24,94% (204/818) |
| Uniforme 4-bit | 50,73% (415/818) | 61,37% (502/818) | 19,19% (157/818) |
| Null de puntuacion constante, 4-bit | 56,97% (466/818) | 72,13% (590/818) | 23,72% (194/818) |
| **DynQuant 3-bit** | 45,48% (372/818) | 56,72% (464/818) | 14,06% (115/818) |
| Uniforme 3-bit | 28,24% (231/818) | 41,20% (337/818) | 3,55% (29/818) |
| Null de puntuacion constante, 3-bit | 40,34% (330/818) | 51,34% (420/818) | 12,35% (101/818) |

Metricas adicionales declaradas por el autor: perdida en datos retenidos (KL respecto al ajuste fino, emparejada por conversacion) de 0,0594 para este checkpoint, frente a 0,0602 del modelo base sin cuantizar; coincide con el token de mayor probabilidad del ajuste fino en el 96,19% de las posiciones, frente al 97,24% del base. Frente al control uniforme de 3 bits, la mejora es de +14,43 puntos en text-to-SQL, +17,07 en HumanEval y +13,60 en MBPP. Frente a la variante de 4 bits, que ocupa 211.058.688 bytes mas (0,197 GiB), este checkpoint esta por detras en text-to-SQL (-10,31), HumanEval (-11,59) y MBPP (-8,20). No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,640 GiB de pesos y buffers residentes en GPU tras la carga, antes de cualquier cache KV. La cache KV depende de la longitud de contexto, que no se declara.
- La model card indica que la memoria medida coincide al 100,0% con la prediccion del mapa de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GiB de VRAM libre. Dado el tamano, no requiere A100, H100 ni RTX 4090; una RTX 3060, RTX 4060 o incluso una GPU integrada moderna son suficientes para los pesos.
- Cabe holgadamente en GPU consumer, y permite ejecutar varias instancias en paralelo en una sola tarjeta.
- Opciones de despliegue: exclusivamente `transformers` con la libreria `dynquant` y `trust_remote_code=True`, en bfloat16. La model card no menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y el formato safetensors con codigo remoto hace improbable su uso directo en esos entornos.
- Entorno validado por el autor: dynquant 0.5.3 con transformers 5.14.1 (torch 2.13.0+cu130) y transformers 5.18.0 (torch 2.14.1+cu130).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Text-to-SQL | HumanEval | MBPP | Pesos | Licencia |
|---|---:|---:|---:|---:|---:|---|
| DynQuant 3-bit (este repositorio) | 185.194.240 | 38,75% | 19,51% | 20,00% | 0,640 GiB | Apache 2.0 |
| DynQuant 4-bit | no disponible | 49,06% | 31,10% | 28,20% | 0,836 GiB | Apache 2.0 |
| Uniforme 3-bit | no disponible | 24,33% | 2,44% | 6,40% | 0,641 GiB | no disponible |
| Kambo-v1-sql-code (ajuste fino bf16) | no disponible | 53,91% | 30,49% | 28,80% | 3,150 GiB | Apache 2.0 |
| Kambo-v1 (base) | no disponible | 42,87% | 31,10% | 25,40% | 3,150 GiB | Apache 2.0 |

Dentro de la misma categoria de modelos text-to-SQL de ~185 millones de parametros, no hay alternativas externas identificadas en la informacion proporcionada.

## Limitaciones y advertencias

- Este checkpoint puntua por debajo del modelo base sin cuantizar en las tres tareas evaluadas: text-to-SQL 38,75% frente a 42,87%, HumanEval 19,51% frente a 31,10% y MBPP 20,00% frente a 25,40%. El autor lo publica explicitamente como medicion del metodo, no como modelo sustituto.
- Frente al ajuste fino en bf16 pierde 15,16 puntos en text-to-SQL, 10,98 en HumanEval y 8,80 en MBPP, diferencias separadas tras correccion de Holm.
- Degradacion severa fuera de la distribucion de entrenamiento: en Spider dev, que no es fuente de entrenamiento, cae al 14,06%, frente al 25,67% del ajuste fino bf16 y al 23,96% del modelo base. Es el punto mas debil del checkpoint.
- Rendimiento pobre en generacion de codigo general: HumanEval 19,51% y MBPP 20,00% son valores muy bajos para uso productivo.
- Contaminacion potencial: la model card senala que sql-create-context, una de las fuentes de entrenamiento, se construyo en parte a partir de Spider; el autor elimino las filas de entrenamiento que planteaban preguntas de Spider dev tras normalizar mayusculas, puntuacion y espacios, pero el resto no se detalla.
- La carga exige `trust_remote_code=True` y la libreria `dynquant` en version 0.5.3, lo que implica ejecutar codigo de terceros ajeno al ecosistema estandar de transformers.
- Solo funciona en bfloat16; no se declara soporte para float16, float32 ni otras precisiones.
- Longitud de contexto, idiomas soportados, sesgos conocidos y riesgo de alucinacion no se documentan en la informacion disponible.
- No se han publicado evaluaciones de seguridad, sesgo ni robustez frente a entradas adversarias.
- Aunque la licencia es Apache 2.0, el requisito de codigo remoto debe revisarse antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VikramPal/kambo-v1-sql-code-DynQuant-3bit
- Variante DynQuant 4-bit: https://huggingface.co/VikramPal/kambo-v1-sql-code-DynQuant-4bit
- Modelo base del ajuste fino: https://huggingface.co/VikramPal/kambo-v1-sql-code
- Modelo preentrenado original: https://huggingface.co/VikramPal/kambo-v1
- Repositorio del metodo DynQuant: https://github.com/kambojvikram/dynquant
- Dataset gretelai/synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset Salesforce/wikisql: https://huggingface.co/datasets/Salesforce/wikisql
- Dataset b-mc2/sql-create-context: https://huggingface.co/datasets/b-mc2/sql-create-context
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
