# voidash/qwenbend

## Resumen

QwenBend es un adaptador LoRA para el modelo Qwen3.5-0.8B de Alibaba Qwen, desarrollado por voidash (Ampixa). Su objetivo es enseñar a un modelo de lenguaje pequeno a escribir BendLite, un subconjunto del lenguaje de programacion funcional Bend2 de HigherOrderCO, orientado a computacion masivamente paralela y ejecucion in-weights. El adaptador se publica en formato mlx_lm y se fusiona con los pesos base para construir un modelo de 3.97B parametros con un motor de ejecucion embebido.

La propuesta tecnica es poco habitual: la mitad "escritora" del sistema es el modelo entrenado, mientras que la mitad "motor" no se entrena, sino que se construye por diseno a partir de codigo del repositorio del autor. Ese motor consiste en una CPU de 16 registros con 8192 palabras de memoria alojada en cabezas Gated DeltaNet, que aplica las reglas estaticas de Bend2 (tipos, uso afın, terminacion) y ejecuta el programa generado. El resultado es un modelo que genera codigo, lo verifica y lo ejecuta dentro de su propio forward pass.

El interes para desarrolladores e investigadores es doble: por un lado, demuestra que un modelo de 0.8B puede adquirir una habilidad de sintesis de programas estructurada con un adaptador de rango 8 y solo 400 pasos de entrenamiento; por otro, propone un patron de "ejecucion en pesos" que separa la generacion de la computacion verificable, lo que reduce el riesgo de alucinacion en la respuesta final. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-01.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 8, scale 20) sobre Qwen3.5-0.8B; modelo fusionado con motor de ejecucion en cabezas Gated DeltaNet |
| Parametros totales | 3.97B en el modelo fusionado (0.753B pesos no nulos de Qwen, 52.9M del motor, resto relleno de ceros al ampliar hidden size a 4096) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapters.safetensors + adapter_config.json, formato mlx_lm LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer denso de 0.8B parametros. El LoRA tiene rango 8 y escala 20, y se aplica a las ultimas 16 capas del modelo base. El entrenamiento uso learning rate 1e-4 y batch 2; el checkpoint de 400 pasos fue el mejor por perdida de validacion, ya que entrenar hasta 1200 pasos provocaba sobreajuste. La fusion se realiza en PyTorch mediante la operacion W += 20·(A·B)ᵀ, implementada en `qwen_fused.py` del repositorio de GitHub.

La innovacion principal no esta en el entrenamiento sino en la construccion del modelo fusionado. Al adaptador se le anade un motor no entrenado cuyos pesos se fijan por construccion: una CPU de 16 registros con 8192 palabras de memoria alojada en cabezas Gated DeltaNet, que aplica las reglas estaticas de Bend2 (comprobacion de tipos, uso afın y terminacion) y ejecuta el programa. La ampliacion del hidden size a 4096 genera el relleno de ceros que explica la diferencia entre los 3.97B totales y los aproximadamente 0.806B de pesos no nulos. La construccion completa del modelo en memoria tarda unos 15 segundos en Apple M4 Pro.

## Capacidades

- Generacion de programas en BendLite, subconjunto de Bend2, a partir de una descripcion de tarea.
- Verificacion estatica de los programas generados: tipos, uso afın de variables y terminacion, aplicando las reglas de Bend2.
- Ejecucion del programa dentro del forward pass del modelo fusionado, con trazas de ejecucion que coinciden token a token con el interprete de referencia.
- Separacion entre generacion y computacion: la respuesta final es exactamente lo que computa el programa, no una continuacion de texto libre.
- Capacidad de sintesis de programas en tareas dentro de la distribucion de entrenamiento (80% de acierto medido).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Sintesis de programas verificables: dado un enunciado de tarea, el modelo escribe un programa BendLite, lo type-checkea y lo ejecuta, de modo que la salida es el resultado computado y no una prediccion textual. Adecuado para prototipos donde se necesita una respuesta trazable y reproducible.
- Investigacion en ejecucion in-weights: el modelo fusionado sirve como banco de pruebas para estudiar como se aloja un interprete dentro de las cabezas de atencion y como interactua con los pesos del modelo base.
- Ensenanza de lenguajes funcionales y paralelos: el par escritor-motor permite mostrar el ciclo completo de escribir, verificar y ejecutar codigo Bend2 en un entorno controlado.
- Evaluacion de adaptadores de bajo rango: con rank 8, escala 20 y 400 pasos, el repositorio ofrece un punto de referencia para medir cuanto conocimiento de sintaxis y semantica de un DSL puede inyectarse en un modelo de 0.8B.
- Generacion de codigo asistida en dominios acotados: para tareas dentro de las familias vistas en entrenamiento, el modelo puede integrarse en un pipeline que valide y ejecute el programa antes de devolver la respuesta al usuario.
- Demostraciones y docencia sobre limites de los LLM: la comparativa entre el modelo sin adaptador (0% de programas validos) y con adaptador (58% validos, 42% correctos) ilustra de forma concreta el efecto de un adaptador bien dirigido.

## Benchmarks y rendimiento

Evaluacion sobre 200 items de test, con decodificacion greedy y cada programa comprobado y ejecutado con Bend2 real:

| Modelo | Validos | Correctos | Correctos in-distribution | Correctos en familias held-out |
|---|---:|---:|---:|---:|
| Qwen3.5-0.8B (sin adaptador) | 0% | 0% | 0% | 0% |
| QwenBend (+ adaptador) | 58% | 42% | 80% | 4% |

Prueba end-to-end en el modelo fusionado (Apple M4 Pro, MPS, bf16): 5 de 5 programas correctos, con trazas de ejecucion identicas token a token a las del interprete de referencia, a unos 20 tokens/s.

## Requisitos de hardware

- El adaptador LoRA por si solo es minimo (rank 8 sobre las ultimas 16 capas); el coste relevante esta en el modelo fusionado de 3.97B parametros.
- En bf16, el modelo fusionado requiere del orden de 8 GB de memoria para los pesos, mas overhead de activaciones y del motor; no se han publicado cifras oficiales de VRAM.
- La evaluacion documentada se realizo en Apple M4 Pro con MPS y bf16, a unos 20 tokens/s.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI; la libreria indicada es mlx y la construccion se hace con `python bendvm/qwenbend.py "your task"` desde el repositorio.
- No se han publicado estimaciones de latencia ni throughput para GPU discretas (A100, H100, RTX 4090); no disponibles.
- Al estar orientado a MLX, el entorno natural es Apple Silicon; el uso en GPU NVIDIA requeriria conversion de formato no documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenBend (este) | 3.97B fusionado (0.8B base + motor) | no disponible | LoRA sobre Qwen3.5-0.8B + motor de ejecucion Bend2 in-weights | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3.5-0.8B (base) | 0.8B | no disponible | Transformer denso de proposito general | Apache-2.0 (segun el autor) | HuggingFace |
| Alternativas de sintesis de codigo de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la informacion proporcionada; la unica comparacion publicada es contra el modelo base sin adaptador.

## Limitaciones y advertencias

- El escritor es un modelo de 0.8B: con frecuencia escribe el programa equivocado para tareas no familiares. En familias held-out el acierto cae al 4%.
- El motor garantiza que la respuesta es exactamente lo que computa el programa, pero no que el programa resuelva la pregunta planteada. La verificacion es de correccion interna, no de adecuacion a la tarea.
- El 58% de programas validos implica que un 42% de las generaciones no pasan la comprobacion estatica de Bend2.
- El modelo fusionado incluye relleno de ceros por la ampliacion del hidden size a 4096; hay que tenerlo en cuenta al calcular memoria y al inspeccionar pesos.
- No se documentan sesgos conocidos, comportamiento multilingue ni riesgos de alucinacion mas alla de la generacion de programas incorrectos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion; el modelo tiene 0 descargas y 0 likes, por lo que no hay validacion externa.
- Dependencia de MLX y de Apple Silicon para el flujo documentado; no hay soporte publicado para otros backends.
- No se han publicado datos de contexto maximo, cuantizacion ni idiomas soportados, lo que limita la planificacion de despliegues.

## Enlaces

- HuggingFace: https://huggingface.co/voidash/qwenbend
- Repositorio GitHub (codigo, notas de diseno y demo de 15 segundos): https://github.com/voidash/qwenbend
- Bend2 (HigherOrderCO): https://github.com/HigherOrderCO/Bend
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ampixa: https://ampixa.com
