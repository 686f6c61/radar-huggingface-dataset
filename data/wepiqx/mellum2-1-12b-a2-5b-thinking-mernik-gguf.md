# wepiqx/Mellum2.1-12B-A2.5B-Thinking-MERNIK-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-MERNIK-GGUF es una coleccion de cuantizaciones GGUF del modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicada por el usuario wepiqx. El modelo subyacente es un transformer de tipo Mixture of Experts (MoE) con 12.149.923.072 parametros totales (aproximadamente 12,15B) y 2,5B parametros activos por token, organizado en 28 capas con 64 expertos de los que se activan 8 por paso. Esta orientado a generacion de codigo, segun indican las etiquetas del repositorio (code-generation) y la bateria de evaluacion empleada (HumanEval, HumanEval+, EvalPlus).

La aportacion de este repositorio no es el modelo en si, sino el metodo de cuantizacion. El autor aplica una estrategia denominada MERNIK, basada en asignacion "measure-first" con utilidad smse sobre la imatrix del proveedor, y fija los routers MoE (ffn_gate_inp) en F16 en las 28 capas. Se publican cuatro builds (7500-SMSE, 10000-SMSE, 6500-SMSE y 6500-RECOVERY) con tamanos de peso entre 7,01 GB y 10,16 GB, pensadas para ejecucion en llama.cpp/llama-server en hardware de consumo.

El interes actual del repositorio radica en que documenta una comparacion estadistica entre una cuantizacion propia y la referencia stock Q6_K del proveedor. La build 10000-SMSE obtiene un 81,71% en HumanEval (134/164) frente al 72,56% (119/164) del Q6_K, una diferencia declarada como estadisticamente significativa (3/3 columnas, p=0,0107 en HumanEval), con un peso inferior (10,16 GB frente a 10,88 GB). Es, por tanto, un caso practico de cuantizacion consciente de la tarea para modelos MoE de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), 28 capas, 64 expertos con 8 activos |
| Parametros totales | 12.149.923.072 (aprox. 12,15B) |
| Parametros activos | 2,5B (aproximado, segun nombre y model card) |
| Longitud de contexto | no disponible (las pruebas se ejecutan con -c 8192 y -c 1024 para PPL) |
| Tipos de cuantizacion | GGUF propietarias MERNIK: 7500-SMSE (7,44 GB), 10000-SMSE (10,16 GB), 6500-SMSE (7,01 GB), 6500-RECOVERY (7,01 GB); referencia stock Q6_K (10,88 GB) |
| Idiomas soportados | en (ingles); el foco funcional es codigo |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con 12,15B de parametros totales y 2,5B activos, distribuida en 28 capas y 64 expertos por capa, de los cuales se seleccionan 8 por token. La model card del repositorio de cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF o DPO; estos datos corresponden al modelo original JetBrains/Mellum2.1-12B-A2.5B-Thinking y no estan incluidos en la informacion disponible.

La innovacion tecnica documentada se refiere al proceso de cuantizacion, no al entrenamiento. El metodo MERNIK realiza una asignacion de bits "measure-first" guiada por una utilidad smse y utiliza la imatrix del proveedor como referencia. Como regla propia del asignador, los routers MoE (ffn_gate_inp) se fijan en F16 en las 28 capas, siguiendo la receta empleada en la familia Mellum-2.0. El objetivo declarado es preservar la calidad en la tarea de generacion de codigo reduciendo el tamano de peso: la build 10000-SMSE ocupa 10,16 GB frente a los 10,88 GB del Q6_K de referencia. Se indica ademas que el suelo Q4 se situa en 7428 MiB y que una build de 5500 resulto imposible (suelo de 5688 MiB incluso permitiendo Q3).

## Capacidades

- Generacion de codigo: es la capacidad central del modelo, evaluada con HumanEval y HumanEval+ (EvalPlus).
- Razonamiento orientado a programacion: la variante base incluye el sufijo "Thinking" en su nombre, indicando un modo de razonamiento extendido, aunque no se detalla su funcionamiento en la informacion disponible.
- Completado de codigo en servidor: probado mediante llama-server con plantilla Jinja (--jinja) y contexto de 8192 tokens.
- Ejecucion cuantizada local: compatible con llama.cpp y llama-server, con offload parcial de capas en GPU.
- Multilingue: limitado a ingles (en) segun los metadatos del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles; el repositorio no declara soporte multimodal.

## Casos de uso

- Autocompletado de codigo en editor: el modelo puede generar fragmentos y funciones completas en ingles y en lenguajes evaluados por HumanEval; con una ventana de 8192 tokens cabe contexto de varios ficheros, aunque la longitud nativa de contexto no esta confirmada.
- Asistente de programacion en local: al ejecutarse con llama.cpp sobre GPU de consumo (probado en GTX 1070 8 GB con offload parcial), permite desplegar un asistente de codigo sin conexion a servicios externos.
- Generacion de tests unitarios: dado su rendimiento en HumanEval+, es adecuado para producir implementaciones que pasen suites de pruebas, util en pipelines de integracion continua.
- Revision y reescritura de codigo: puede emplearse para refactorizacion y traduccion entre lenguajes en flujos por lotes, usando la build 10000-SMSE cuando la precision importa mas que el tamano.
- Prototipado en entornos con VRAM limitada: las builds 6500 y 7500 permiten ejecutar el modelo con cuantizaciones sub-Q4 en equipos modestos, a costa de una tasa de completados vacios mayor (33/164 y 35/164 respectivamente).
- Evaluacion y reproduccion de tecnicas de cuantizacion: el repositorio incluye el comando de reproduccion con main.py, imatrix y utilidad smse, lo que lo convierte en material de referencia para investigadores que comparan metodologias de cuantizacion en modelos MoE.
- Despliegue en servidor de inferencia ligero: con llama-server y sampling fijo (temp 1.0, top_p 0.95, top_k 20), puede servir peticiones de generacion de codigo de forma secuencial y reproducible.

## Benchmarks y rendimiento

Resultados declarados por el autor del repositorio (protocolo propio, temperatura 1.0):

| Build | Peso | PPL (wiki) | HumanEval | HumanEval+ | Nota |
|---|---|---|---|---|---|
| MERNIK-7500-SMSE | 7,44 GB | 10,5375 | 76,22% (125/164) | 74,39% (122/164) | Supera a stock Q6 por +6 tareas con -3,4 GB |
| Stock Q6_K | 10,88 GB | 10,1562 | 72,56% (119/164) | 70,73% (116/164) | Referencia del proveedor |
| MERNIK-10000-SMSE | 10,16 GB | 9,5558 | 81,71% (134/164) | 79,27% (130/164) | Supera a stock Q6 por +15 tareas con -0,7 GB; duelo 3/3 significativo |
| MERNIK-6500-SMSE | 7,01 GB | 11,18 | 76,83% (126/164) | 75,61% (124/164) | Territorio Q3, empata con el veredicto del 7500 |
| MERNIK-6500-RECOVERY | 7,01 GB | 10,70 | 75,00% (123/164) | 73,17% (120/164) | Duplicado estructural, duelo 0/3 (ruido) |

Duels estadisticos declarados:

| Comparacion | HumanEval | HumanEval+ | Veredicto |
|---|---|---|---|
| 10000-SMSE vs Q6_K | 23/8, p=0,0107 | 22/8, p=0,0161 | 3/3 significativo (vacios 5/20, p=0,0041) |
| 7500-SMSE vs Q6_K | 18/12, p=0,3616 | 18/12, p=0,3616 | 0/3, ruido (vacios 13/17, p=0,5847) |
| 6500-SMSE vs 6500-RECOVERY | 10/7, p=0,6291 | 10/6, p=0,4545 | 0/3, ruido (vacios 6/11, p=0,3323) |

Notas metodologicas declaradas: el suelo de ruido se situa en unas 13 tareas para n=164; los completados vacios escalan con la debilidad de la build (10000: 24/164; 7500: 35/164; stock Q6: 39/164). La PPL se mide con wikitext-2-raw (-c 1024 -n 64 -b 512, semilla fija 7).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano de peso del build mas la cache KV. Build 6500: 7,01 GB; build 7500: 7,44 GB; build 10000: 10,16 GB; stock Q6_K: 10,88 GB.
- Suelo de cuantizacion: el Q4 se situa en 7428 MiB, por lo que la build mas pequena publicada es 6500 MiB.
- GPU de consumo: probado con exito en una GTX 1070 de 8 GB con offload parcial de 20 a 28 capas (-ngl 20-28).
- GPU de datacenter: no se documentan pruebas en A100, H100 ni RTX 4090; no disponible.
- Opciones de despliegue: llama.cpp y llama-server (formato GGUF, plantilla Jinja con --jinja). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible; solo se documenta ejecucion secuencial estricta y configuracion --parallel 1.
- Incidencias conocidas: en la GTX 1070, la build 10000 sufrio fallos ggml-cuda.cu:109 bajo overclock de fabrica y un OOM de RAM con 63 GB de VM y 8 ranuras paralelas a 8K de contexto; se resolvio con relojes de fabrica, --parallel 1 y --cache-reuse 64.

## Comparativa con modelos similares

La informacion disponible solo permite comparar builds dentro del mismo repositorio y con la referencia stock Q6_K del proveedor. No se aportan datos de otros modelos de codigo de tamano comparable.

| Modelo / build | Parametros | Peso | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MERNIK-10000-SMSE | 12,15B (2,5B activos) | 10,16 GB | 81,71% | apache-2.0 | Repositorio wepiqx (GGUF) |
| MERNIK-7500-SMSE | 12,15B (2,5B activos) | 7,44 GB | 76,22% | apache-2.0 | Repositorio wepiqx (GGUF) |
| MERNIK-6500-SMSE | 12,15B (2,5B activos) | 7,01 GB | 76,83% | apache-2.0 | Repositorio wepiqx (GGUF) |
| Stock Q6_K | 12,15B (2,5B activos) | 10,88 GB | 72,56% | apache-2.0 | Referencia del proveedor |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el repositorio declara unicamente ingles (en); no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Alucinacion: no se aportan datos especificos sobre tasas de alucinacion; en generacion de codigo, el riesgo se manifiesta como codigo sintacticamente valido pero funcionalmente incorrecto. Los resultados de HumanEval+ (mas estrictos) son sistematicamente inferiores a los de HumanEval.
- Completados vacios: una fraccion relevante de las evaluaciones produce respuestas vacias (24/164 en 10000, 35/164 en 7500, 39/164 en stock Q6_K); este comportamiento empeora en builds mas agresivas.
- Longitud de contexto: no se especifica el contexto nativo; las pruebas usan 8192 tokens, por lo que no debe asumirse una ventana mayor.
- Protocolo de evaluacion propio: los benchmarks y los duelos estadisticos los declara el autor del repositorio con su propio arnes y configuracion. No son resultados de un tercero independiente y deben tomarse como tales.
- Suelo de ruido: el propio autor indica que diferencias por debajo de unas 13 tareas sobre n=164 no se reproducen entre ejecuciones; la ventaja +6 del 7500 se declara explicitamente como "ventaja, no corona".
- Estabilidad en GPU de consumo: se documentan fallos de kernel CUDA (ggml-cuda.cu:109) y OOM de RAM en configuraciones paralelas; para produccion conviene fijar --parallel 1 y evitar overclock.
- Licencia: apache-2.0, permisiva para uso comercial, pero condicionada a la licencia del modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, que debe verificarse por separado.
- Adopcion: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wepiqx/Mellum2.1-12B-A2.5B-Thinking-MERNIK-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking

No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
