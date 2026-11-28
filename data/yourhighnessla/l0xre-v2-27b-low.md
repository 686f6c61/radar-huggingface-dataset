# YourHighnessLA/L0xRE-V2-27b-Low

## Resumen

L0xRE-V2-27b-Low es un conjunto de pesos cuantizados derivado de Qwen3.8-27B, publicado por el usuario YourHighnessLA bajo el paraguas del proyecto L0xRE. Su objetivo es ejecutar un modelo de clase 27B con ventana de contexto de 256K en una GPU de 12 GB de VRAM, manteniendo la mayor parte de la calidad del modelo BF16 original. La segunda generación (V2) es un reajuste de calibración con mezcla rebalanceada de códigos de 2 y 3 bits, que reduce la divergencia KL frente a BF16 entre un 24% y un 36% según el dominio respecto a la V1.

El modelo combina dos piezas: los pesos cuantizados (formato GGUF, ~8,62 GB en disco) y un runtime propietario, L0xRE v0.1.6.5 o superior, que implementa atención dispersa aprendida por encima de 8K tokens. Por debajo de ese umbral la inferencia es densa y logit-idéntica a la ruta densa; por encima, cada consulta atiende a un sumidero, una ventana local y los tokens más relevantes seleccionados mediante un mapa D-LSA aprendido. El resultado declarado es un contexto útil de 262.144 tokens en 12 GB.

Es relevante para desarrolladores que quieran desplegar agentes de código y asistentes locales en hardware de consumo: el autor reporta ~45 tok/s en decodificación narrativa y ~78 tok/s en código sobre una RTX 3060, con prefill de ~720 tok/s para prompts de 10K. La licencia es derivada de los términos de investigación de Qwen, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con atencion dispersa aprendida (D-LSA) en runtime por encima de 8K tokens |
| Parametros totales | 4.784.193.024 (segun safetensors del repo); el autor denomina el modelo "27b" por el modelo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en perfil de 12 GB con runtime v0.1.6.5; denso por debajo de 8K |
| Tipos de cuantizacion | Mezcla de codigos de 2 y 3 bits (formato GGUF propietario del runtime L0xRE); no disponible el detalle por capa |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | qwen-research-terms-derivative (derivada de los terminos de investigacion de Qwen) |
| Formato de pesos | GGUF (runtime L0xRE); repo de 9,8 GB, fichero de pesos de 8,62 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso. Sobre el se aplica una cuantizacion post-entrenamiento con mezcla de codigos de 2 y 3 bits, calibrada contra el modelo BF16. La V2 reajusta la calibracion y rebalancea la mezcla de codigos; el autor reporta que la KLD frente a BF16 baja de 0,1223 a 0,0928 en el holdout de 200 documentos (conjunto golden del quant-challenge publico), con mejoras del 29,1% en la media agentica, 33,7% en codigo y 35,8% en trazas de agente y SWE. El modelo V2 tiene menor KLD en 190 de los 200 documentos de holdout.

La innovacion tecnica principal no esta en los pesos sino en el runtime. Por encima de 8K tokens se activa atencion dispersa: cada consulta atiende a un sumidero de 11.648 tokens, una ventana local y los tokens mas relevantes seleccionados por un mapa D-LSA aprendido (`qwen38-dlsa-d2048.l0xmap`), con baldosas de 256 tokens y top-k de 16.384. Ademas se implementan enlaces de recuperacion por coincidencia exacta: una secuencia de tokens poco comun vista antes enlaza el bloque actual con aquellos bloques anteriores, lo que mitiga el fallo tipico de la atencion dispersa aprendida (elegir el registro equivocado entre varios similares). La decodificacion especulativa se apoya en un drafter denominado DFlash2. El autor no detalla la composicion del dataset de entrenamiento del modelo base ni si hubo RLHF o DPO; esa informacion corresponde a Qwen y no se incluye en la model card.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno.
- Generacion y edicion de codigo, con enfasis declarado en trazas de agente y tareas SWE.
- Tool calling y function calling, evaluado en el pack Club-3090 N150 (llamadas a herramientas, salida estructurada, extraccion de datos).
- Razonamiento matematico y resolucion de bugs.
- Modo de razonamiento ("thinking") con esfuerzo configurable (medium, xhigh) y presupuesto de razonamiento (por ejemplo, 8K tokens).
- Agentes multi-paso y tareas de CLI / Hermes.
- Contexto largo efectivo de hasta 262.144 tokens con atencion dispersa; recuperacion casi densa segun las mediciones del autor.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Asistente de codigo local en GPU de 12 GB: el modelo cabe entero en una RTX 3060 con ~8,62 GB de pesos y ofrece ~78 tok/s en decodificacion de codigo, adecuado para autocompletado y refactorizacion en el puesto de trabajo sin depender de la nube.
- Agente de CLI y automatizacion de shell: las trazas de agente y las tareas Hermes forman parte del conjunto de evaluacion; el modelo puede encadenar llamadas a herramientas con contexto de transcripcion largo.
- Analisis de repositorios extensos: con 256K de contexto puede ingerir varios ficheros y trazas de ejecucion en una sola pasada, usando la recuperacion por coincidencia exacta para localizar rutas y simbolos concretos.
- Extraccion estructurada de datos: el pack N150 incluye pruebas de salida estructurada y extraccion; el modelo es apto para pipelines que convierten texto libre en JSON validado.
- Depuracion asistida ("bug finding"): identificacion de errores en fragmentos de codigo y propuestas de parche, apoyandose en el modo thinking con presupuesto de razonamiento acotado.
- Servicio de atencion tecnica con contexto de conversacion largo: la ventana de 256K permite mantener historiales extensos y documentacion de referencia en la misma sesion, aunque la atencion dispersa esta pensada para una secuencia a la vez (`-np 1`).
- Evaluacion e investigacion de cuantizacion: el modelo sirve como caso de estudio reproducible de cuantizacion agresiva con metricas KLD publicadas sobre un conjunto golden abierto.

## Benchmarks y rendimiento

Resultados declarados por el autor. Club-3090 8-pack N150 (150 tareas: llamadas a herramientas, seguimiento de instrucciones, salida estructurada, extraccion de datos, razonamiento y matematicas, busqueda de bugs, tareas de agente Hermes y CLI):

| Modo | V1 (B02-A2) | V2 |
|---|---:|---:|
| Thinking off, RTX 3060 | 119 | 121 |
| Thinking on, esfuerzo medio, presupuesto 8K, pass@1 / pass@3 | — | 127/133, 125/135 |

KLD frente a BF16 Qwen3.8-27B (menor es mejor), conjunto golden del quant-challenge:

| Split | V1 | V2 | Cambio |
|---|---:|---:|---:|
| Holdout 200 docs, global | 0,1223 | 0,0928 | −24,2% |
| Holdout, media agentica | 0,0701 | 0,0497 | −29,1% |
| Holdout, codigo | 0,0752 | 0,0499 | −33,7% |
| Holdout, trazas de agente y SWE | 0,0596 | 0,0383 | −35,8% |
| Desarrollo, 116 docs, global | 0,1151 | 0,0833 | −27,7% |

Calidad de la atencion dispersa (v0.1.6, temperatura 0):

| Prueba | Denso | Disperso v0.1.6 |
|---|---:|---:|
| Recall de aguja, 8 registros, 16K–192K (RTX 3060 y RTX 5090) | 224/224 en cada tarjeta | 223/224 en cada tarjeta |
| Recuperacion held-out (codigo, rutas, preguntas parafraseadas), RTX 5090 | 269/288 | 268/288 |
| Respuestas por debajo de 8K tokens | — | identicas bit a bit (hashes de logits) |
| Coste de prefill | — | RTX 3060 −0,2…+0,1%; RTX 4090 −0,4…−0,1%; RTX 5090 dentro del 1,6% |

Velocidad en RTX 3060 12 GB, Linux nativo, drafter DFlash2:

| Metrica | V2 | Frente a V1 |
|---|---:|---:|
| Decodificacion narrativa | ~45 tok/s | dentro del 2% |
| Decodificacion de codigo | ~78 tok/s | dentro del 2% |
| Prefill de prompt de 10K | ~720 tok/s | dentro del 1% |
| Prefill de prompt de 90K | ~480 tok/s | dentro del 1% |
| Decodificacion a 90K de profundidad | 61,3 tok/s | V1: 50,2 tok/s |

No se han publicado resultados en leaderboards externos; las cifras de KLD y de calidad de atencion dispersa son mediciones internas del autor.

## Requisitos de hardware

- VRAM: ~8,62 GB de pesos, disenado para caber con todas las capas en GPU de 12 GB (RTX 3060 12 GB es la referencia del autor).
- GPU recomendadas: RTX 3060 12 GB como minimo practico; RTX 4090 y RTX 5090 aparecen en las mediciones del autor; no se documentan resultados en A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas. No se declara soporte para GPUs de 8 GB.
- Despliegue: exclusivamente mediante el runtime L0xRE v0.1.6.5 o superior (repositorio L0xRE-BeeLLama-Low). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato GGUF es propio del runtime y no se garantiza compatibilidad con otros motores.
- Restriccion de concurrencia: una sola secuencia a la vez (`-np 1`).
- Latencia y throughput: ~45 tok/s narrativo, ~78 tok/s codigo, ~720 tok/s de prefill a 10K y ~480 tok/s a 90K en RTX 3060. A 90K de profundidad, 61,3 tok/s.
- Variable de entorno `L0XRE_SPARSE=0` desactiva la atencion dispersa y vuelve a ruta densa, con mayor coste de memoria y peor manejo de transcripciones de agente por encima de ~30K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| L0xRE-V2-27b-Low | 4,78B declarados (base 27B) | 262.144 (disperso) | qwen-research-terms-derivative | GGUF + runtime L0xRE | Cuantizacion agresiva 2/3 bits para 12 GB |
| L0xRE-27b-Low (V1) | Mismo esquema | 131.072 (perfil 12 GB en v0.1.5) | qwen-research-terms-derivative | GGUF + runtime L0xRE | Generacion anterior; KLD global 0,1223 frente a 0,0928 de V2 |
| Qwen3.8-27B (BF16) | 27B | No disponible en la informacion proporcionada | Terminos de investigacion de Qwen | Pesos originales | Referencia de calidad; no cabe en 12 GB en BF16 |

No se dispone de datos de benchmarks comparativos con otras familias (Llama, Mistral, Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia derivada de los terminos de investigacion de Qwen: el uso comercial esta restringido y requiere revisar el enlace de licencia del modelo base antes de cualquier despliegue en produccion.
- Solo ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Dependencia total del runtime L0xRE: sin el, los pesos no son utilizables en motores estandar. Las actualizaciones del runtime no cambian los pesos, pero si el comportamiento.
- Una sola secuencia concurrente (`-np 1`), lo que limita el despliegue como servicio multiusuario.
- La atencion dispersa puede copiar un vecino en posiciones de conteo (por ejemplo, un numero de capitulo tras "CHAPTER") por los enlaces de coincidencia exacta.
- Persisten discrepancias confiadas frente a la atencion densa a una tasa de 1 por cada 862 posiciones en modo disperso simple.
- El modo denso por encima de 8K no es el recomendado y maneja mal algunas transcripciones de agente mas alla de ~30K tokens.
- El caso mas debil de V2 son prompts con thinking desactivado que conservan la instruccion de razonamiento xhigh con bloque think vacio; algunos documentos de chat y herramientas empeoran. El modo de servicio thinking-off de v0.1.5 no renderiza ese prompt.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de sesgo en la informacion disponible.
- Las cifras de calidad y velocidad son mediciones internas del autor, no verificadas por terceros ni por leaderboards externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourHighnessLA/L0xRE-V2-27b-Low
- Repositorio del runtime L0xRE: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Conjunto golden del quant-challenge: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
