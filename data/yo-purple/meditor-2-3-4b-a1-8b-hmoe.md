# Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE

## Resumen

Meditor-2-3.4B-A1.8B-HMoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) jerarquico desarrollado por Yo-Purple, construido mediante "upcycling" del modelo denso SmolLM2-1.7B-Instruct de Hugging Face. El modelo almacena 3.410.955.032 parametros (3,41B) en formato BF16 (6,35 GB) y activa aproximadamente 1.825 millones de parametros por token, lo que supone una ratio de activacion del 53,52%. Su innovacion principal es una arquitectura de enrutamiento en dos niveles (two-tier routing) que dirige cada token primero a uno de tres dominios macro y despues a uno de cinco sub-expertos dentro de ese dominio.

El modelo hereda la ventana de contexto de 524.288 tokens (aproximadamente 500K) mediante una combinacion de atencion de ventana deslizante local (2.048 tokens) y capas globales con Proportional-RoPE (theta base de 130.000,0). Esta disenado para tareas de razonamiento, matematicas, dialogo y codigo, e incluye un "coprocesador" de aritmetica basado en ejecucion AST segura que, segun la model card, eleva la precision aritmetica del 40% al 100% en las pruebas realizadas por el autor.

Es relevante ahora porque demuestra una via de bajo coste para extender modelos pequenos con arquitecturas MoE jerarquicas y contextos muy largos, manteniendo la huella de memoria lo bastante reducida como para caber en GPUs de consumo de 8 GB (RTX 4060). No obstante, el modelo tiene 0 descargas y 1 "like" en Hugging Face, y todos los benchmarks publicados proceden del propio autor sobre conjuntos de evaluacion muy reducidos (12 preguntas en el caso de ARC), por lo que deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE jerarquico (HMoE) de dos niveles, upcycled desde SmolLM2-1.7B-Instruct; 24 capas, 32 cabezas, 32 KV heads, d_model = 2.048, d_head = 64 |
| Parametros totales | 3.410.955.032 (~3,41B) |
| Parametros activos | ~1.825.507.328 (~1,83B) por token; ratio de activacion 53,52% |
| Longitud de contexto | 524.288 tokens (~500K): ventana deslizante local de 2.048 en 20 capas + retencion global en 4 capas con Proportional-RoPE (theta base 130.000,0) |
| Tipos de cuantizacion | BF16 (referencia, 6,35 GB); INT4 (~1,59 GB) segun la model card; no se detallan otros formatos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code=True` (custom_code) |

## Arquitectura y entrenamiento

Meditor-2 implementa un MoE jerarquico de dos niveles sobre una base densa de SmolLM2-1.7B-Instruct (11 billones de tokens de preentrenamiento, vocabulario de 49.152 tokens). En el primer nivel, un enrutador macro (Tier 1) asigna cada token a uno de tres dominios: Dominio 0 (logica, matematicas y razonamiento deductivo), Dominio 1 (lenguaje natural, dialogo y sintesis creativa) y Dominio 2 (codigo, sistemas estructurados y hechos tecnicos). En el segundo nivel, un micro-enrutador (Tier 2) selecciona uno de cinco sub-expertos por dominio (15 sub-expertos en total, ~113M de parametros cada uno), con enrutamiento top-1 mas un experto compartido dedicado que conserva las 8.192 neuronas intermedias originales del modelo base.

La model card no detalla el volumen ni la composicion del dataset de entrenamiento del upcycling, ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion tecnica documentada se centra en el enrutamiento jerarquico y en el control de memoria del contexto largo: las capas locales limitan su KV-cache a 2.048 tokens, mientras que solo 4 capas globales retienen hasta 524.288 tokens con escalado Proportional-RoPE. El modelo tambien incorpora un "coprocesador" de aritmetica que ejecuta expresiones matematicas mediante AST seguro, lo que el autor presenta como soporte de tool-augmented arithmetic.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones con plantilla de chat (roles system/user/assistant).
- Razonamiento deductivo y matematico mediante enrutamiento especializado al Dominio 0.
- Generacion de codigo y manejo de sistemas estructurados a traves del Dominio 2.
- Dialogo multi-turno y sintesis creativa en el Dominio 1.
- Aritmetica aumentada con herramientas: ejecucion AST segura que, segun el autor, alcanza el 100% de precision en sus pruebas.
- Procesamiento de contextos muy largos (hasta ~500K tokens) gracias a la combinacion de atencion local y global.
- Enrutamiento condicional por token con dos niveles de decision (macro-dominio y sub-experto).
- Soporte de tool calling / function calling: la model card incluye la etiqueta `toolformer`, aunque no se documenta la interfaz concreta.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Analisis de documentos extensos: con una ventana de ~500K tokens, el modelo puede ingerir informes, expedientes o bases de codigo completas en una sola pasada y responder preguntas sobre ellos, apoyandose en las 4 capas globales que retienen el contexto completo.
- Asistente de razonamiento matematico con verificacion: combinando la generacion del modelo con el coprocesador AST, se puede construir un pipeline donde las expresiones aritmeticas se validan y ejecutan de forma segura antes de devolver el resultado al usuario.
- Generacion de codigo asistida en entornos con recursos limitados: su huella BF16 de 6,35 GB permite desplegarlo en una RTX 4060 de 8 GB para autocompletado y explicacion de codigo en estaciones de trabajo de desarrollo.
- Atencion al cliente automatizada en ingles: el modelo gestiona conversaciones multi-turno con contexto largo, adecuado para historiales de soporte extensos, aunque su cobertura linguistica se limita al ingles.
- Despliegue en el borde (edge): la cuantizacion INT4 (~1,59 GB) permite ejecutarlo en dispositivos con poca memoria, como mini-PC o portatiles sin GPU dedicada de gran capacidad.
- Prototipado e investigacion sobre MoE jerarquicos: su implementacion de enrutamiento en dos niveles y su codigo personalizado (`custom_code`) lo convierten en una base para experimentar con estrategias de routing y upcycling de modelos densos pequenos.
- Clasificacion y enrutamiento de consultas por dominio: el enrutador macro de tres dominios puede reutilizarse para dirigir peticiones a subsistemas especializados (matematicas, lenguaje, codigo) en arquitecturas de agentes.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor, medidos en una NVIDIA GeForce RTX 4060 de 8 GB con PyTorch 2.6 y CUDA 12.4. No se aportan comparaciones con otros modelos.

| Metrica | Resultado | Notas |
|---|---|---|
| Perplejidad de razonamiento (PPL) | 7,42 | Cross-entropy loss 2,0037 |
| ARC-style science & commonsense | 100,0% (12/12) | 0-shot log-likelihood sobre 12 preguntas |
| Aritmetica directa del modelo | 40,0% | Sin herramientas |
| Aritmetica con coprocesador AST | 100,0% | Ejecucion AST segura |
| Velocidad de decodificacion | 11,18 tokens/s | RTX 4060 8 GB, BF16 |
| Latencia de prefill (256 tokens) | 306,58 ms | RTX 4060 8 GB |
| VRAM asignada (BF16) | 6,42 GB | Quedan ~1,58 GB libres en 8 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores corresponden a evaluaciones internas del autor sobre conjuntos muy reducidos y no son directamente comparables con resultados de terceros.

## Requisitos de hardware

- VRAM estimada: 6,42 GB en BF16 (medido por el autor); ~1,59 GB en INT4 segun la model card.
- GPU recomendadas: NVIDIA RTX 4060 8 GB (verificada por el autor); cualquier GPU con 8 GB o mas de VRAM en BF16; GPUs de datacenter (A100, H100) para mayor throughput, aunque no hay mediciones publicadas en ellas.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (RTX 4060, RTX 3070, RTX 4070, etc.); en INT4 cabria en GPUs de 4 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada); el campo `inference: false` de la model card sugiere que la inferencia gestionada de Hugging Face no esta habilitada. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el uso de `custom_code` complica su conversion a GGUF.
- Latencia y throughput: 11,18 tokens/s de decodificacion y 306,58 ms de prefill para 256 tokens en RTX 4060 8 GB (datos del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Meditor-2-3.4B-A1.8B-HMoE | 3,41B totales / ~1,83B activos | 524.288 | Apache 2.0 | Hugging Face (0 descargas) | MoE jerarquico, solo ingles, benchmarks internos |
| SmolLM2-1.7B-Instruct (modelo base) | 1,7B densos | 8.192 (segun su model card original) | Apache 2.0 | Hugging Face, ampliamente adoptado | Base del upcycling; sin routing MoE |
| Modelos MoE pequenos de referencia (p. ej., Qwen o Mixtral de mayor escala) | Variable | Variable | Variable | Variable | No se dispone de datos comparativos especificos en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion disponible; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Evaluacion muy limitada: los benchmarks publicados usan conjuntos minimos (12 preguntas en ARC) y no incluyen MMLU, HumanEval ni GSM8K, por lo que las cifras de rendimiento no son representativas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones incorrectas; el 40% de precision aritmetica directa indica debilidad en calculo sin herramientas.
- Idioma: solo soporta ingles segun la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor y complica la integracion con ecosistemas estandar (vLLM, llama.cpp, TGI).
- Madurez: 0 descargas y 1 "like" en Hugging Face; el modelo no ha sido validado por la comunidad y su mantenimiento futuro es incierto.
- Contexto largo: aunque la ventana nominal es de 500K tokens, solo 4 capas retienen el contexto global; el rendimiento real en contextos muy largos no esta documentado con evaluaciones independientes.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de SmolLM2-1.7B-Instruct conviene verificar el cumplimiento de las condiciones del modelo base.
- El "coprocesador" aritmetico AST es una capa de ejecucion externa, no una capacidad nativa del modelo; su seguridad depende de la implementacion del sandbox.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Modelo base SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
