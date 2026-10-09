# Soulfate24/Ornith-1.5-9B-MTP-Paretrix

## Resumen

Ornith-1.5-9B-MTP-Paretrix es una coleccion de cuantizaciones GGUF del modelo denso Ornith-1.5-9B, publicada por el usuario Soulfate24 bajo la suite de cuantizacion Paretrix. El modelo base, desarrollado por Ornith AI, es un transformer denso de aproximadamente 9,7 mil millones de parametros orientado a tareas de codigo agentico y disenado para despliegue en una sola GPU. Esta version anade el modulo MTP (Multi-Token Prediction), pensado para decodificacion especulativa, y reorganiza el presupuesto de bits por clase de tensor segun la sensibilidad de activacion medida con `llama-imatrix`.

La relevancia de esta publicacion reside en su metodologia: en lugar de aplicar un unico ancho de bits uniforme a toda la red, Paretrix mide la sensibilidad real de cada clase de tensor (via divergencia KL y perplejidad) y asigna bitwidths de forma calibrada para situar cada nivel de compresion en la frontera de Pareto entre tamano y calidad. El resultado es un conjunto de trece variantes que van desde Q8_0 stock (9.247 MiB) hasta Femto-21pc (3.762 MiB), con metricas de PPL, KLD, RMS de probabilidad y top-p reportadas por el autor.

Al tratarse de una cuantizacion y no de un modelo nuevo, su utilidad es fundamentalmente practica: permite elegir un punto concreto del compromiso tamano/calidad para ejecutar Ornith-1.5-9B con llama.cpp en hardware de consumo. La licencia es MIT, heredada del modelo base. No se dispone de informacion sobre idiomas soportados ni sobre la longitud de contexto, que no vienen documentadas en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ornith-1.5-9B) |
| Parametros totales | ~9,7 mil millones en el modelo base; el recuento de safetensors reportado es de 1.282.297 (cifra parcial, probablemente un unico shard) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ3_M (stock) y tiers Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 9,7B parametros, el miembro mas pequeno de la familia Ornith-1.5 (que tambien incluye variantes MoE de 35B y 397B, segun la web de Ornith AI). La familia se apoya en un marco de auto-mejora: el modelo propone nuevas tareas, genera andamiajes especificos y produce rollouts de solucion, con un bucle de aprendizaje por refuerzo que optimiza conjuntamente las tareas, el andamiaje del agente y la politica. Esta orientado especificamente a tareas de codigo agentico.

Sobre esta base, esta publicacion aplica la suite Paretrix, que realiza una cuantizacion sensible a la activacion. El proceso mide la sensibilidad real de cada clase de tensor mediante `llama-imatrix`, aprende tablas de tasa a partir de campanas entre arquitecturas y distribuye el ancho de bits bajo un objetivo de presupuesto exacto: recetas planas cuando la uniformidad es optima y mochila calibrada por tasa cuando la heterogeneidad compensa. Adicionalmente se incorpora el modulo MTP (Multi-Token Prediction), empleado para decodificacion especulativa. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Ornith-1.5-9B.
- Codigo y tareas de programacion agentica, que es el objetivo declarado de la familia Ornith-1.5.
- Razonamiento multi-paso dentro de flujos de agente, dado el enfoque de entrenamiento en andamiaje y rollouts.
- Decodificacion especulativa mediante el modulo MTP incluido en las cuantizaciones.
- Soporte de vision: la etiqueta `vision` aparece entre las etiquetas del repositorio, aunque no se detalla su alcance.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No hay informacion confirmada sobre soporte de tool calling, capacidades multilingues ni modos de pensamiento explicitos.

## Casos de uso

- Despliegue local en una sola GPU: las variantes de menor tamano (Femto-21pc, Pico-24pc, Nano-27pc) permiten ejecutar un modelo de ~9,7B en tarjetas de consumo, manteniendo el modulo MTP para acelerar la generacion.
- Asistente de codigo en el IDE: al estar orientado a codigo agentico, puede integrarse en editores como backend de autocompletado, refactorizacion y generacion de tests.
- Agente autonomo multi-paso: el entrenamiento de la familia en andamiaje y rollouts lo hace adecuado para bucles de planificacion y ejecucion de herramientas en entornos controlados.
- Servicio de inferencia con llama.cpp: cualquiera de los tiers GGUF puede servirse mediante `llama-server`, eligiendo el nivel segun la VRAM disponible.
- Prototipado con presupuesto de memoria ajustado: Femto-21pc (3.762 MiB) permite experimentar con el modelo en hardware muy limitado a costa de mayor KLD.
- Pipeline de generacion de texto por lotes: los tiers de mayor fidelidad (Q8_0, Precision-42pc) son apropiados cuando la calidad prima sobre el tamano.
- Investigacion en cuantizacion: el conjunto de trece variantes con metricas PPL/KLD publicadas sirve como banco de pruebas para estudiar el compromiso compresion/calidad.

## Benchmarks y rendimiento

El autor publica metricas de perplejidad (PPL), divergencia KL (KLD), RMS de diferencia de probabilidad y cobertura top-p para cada tier. Estas cifras son del conjunto de evaluacion empleado por el autor; no se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Modelo | MiB (+MTP) | PPL | Delta PPL | KLD | RMS Delta p | top-p |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Q8_0 (stock) | 9247 | 8,9544 | +0,0325 | 0,0118 | 2,67 % | 97,7 % |
| Fidelity-48pc | 8393 | 8,9700 | +0,0481 | 0,0167 | 3,13 % | 97,0 % |
| Precision-42pc | 7539 | 8,9365 | +0,0146 | 0,0156 | 3,24 % | 96,6 % |
| Q6_K-imx (stock) | 7179 | 8,7000 | -0,2219 | 0,0251 | 3,83 % | 95,9 % |
| Quality-36pc | 6395 | 8,5716 | -0,3503 | 0,0449 | 4,88 % | 93,5 % |
| Q5_K_M-imx (stock) | 6329 | 8,2043 | -0,7176 | 0,1013 | 7,29 % | 90,2 % |
| Compact-33pc | 5948 | 8,4619 | -0,4600 | 0,0610 | 6,07 % | 92,0 % |
| Mini-30pc | 5529 | 8,6772 | -0,2447 | 0,0679 | 6,42 % | 91,1 % |
| IQ4_XS-imx (stock) | 5117 | 9,2939 | +0,3720 | 0,0794 | 7,08 % | 90,8 % |
| Nano-27pc | 4747 | 8,6546 | -0,2673 | 0,1223 | 8,73 % | 86,5 % |
| IQ3_M-imx (stock) | 4372 | 9,1809 | +0,2590 | 0,1807 | 11,04 % | 84,5 % |
| Pico-24pc | 4232 | 8,5303 | -0,3916 | 0,1540 | 10,08 % | 84,7 % |
| Femto-21pc | 3762 | 8,3140 | -0,6079 | 0,2524 | 12,37 % | 80,6 % |

Todos los valores entre parentesis y las columnas de delta son los reportados directamente por el autor de la publicacion.

## Requisitos de hardware

- VRAM estimada: entre ~3,8 GiB (Femto-21pc, 3.762 MiB) y ~9,3 GiB (Q8_0, 9.247 MiB) solo para los pesos; hay que anadir la memoria de contexto y el estado de inferencia.
- GPU consumer: la mayoria de tiers caben en tarjetas de 8-12 GiB (RTX 3060 12 GB, RTX 4070, RTX 4090). Femto-21pc y Pico-24pc caben incluso en GPUs de 6-8 GiB.
- GPU profesionales: A100, H100 o similares permiten ejecutar los tiers de mayor fidelidad con contextos largos y por lotes grandes.
- Opciones de despliegue: llama.cpp (formato nativo), y por extension herramientas compatibles con GGUF como Ollama o servidores basados en llama.cpp. La etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponibles; dependen del tier elegido, del hardware y del contexto. El modulo MTP esta pensado para mejorar el throughput mediante decodificacion especulativa.
- El repositorio ocupa 49,5 GB en total porque incluye los trece tiers; conviene descargar solo la variante deseada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en benchmarks estandar, por lo que no es posible una comparativa cuantitativa fiable. A continuacion se comparan caracteristicas objetivas con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MTP-Paretrix | ~9,7B denso | no disponible | GGUF | MIT | Cuantizacion sensible a activacion con MTP |
| Ornith-1.5-9B (base) | ~9,7B denso | no disponible | safetensors | MIT | Modelo original sin cuantizar |
| Ornith-1.5-9B-MTP-ASHQ1-Remix-GGUF | ~9,7B denso | no disponible | GGUF | MIT | Otra cuantizacion GGUF del mismo base |
| Otros tiers de la familia Ornith-1.5 | 35B MoE, 397B MoE | no disponible | no disponible | no disponible | Variantes mayores de la misma familia |

La comparacion con modelos de otros fabricantes (por ejemplo, series Qwen o Llama de tamano equivalente) no puede establecerse con datos de rendimiento, ya que no se han publicado benchmarks comparables en la informacion disponible.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks estandar del modelo base ni de esta cuantizacion, por lo que el rendimiento real en tareas concretas es incierto.
- Los tiers de mayor compresion (Femto-21pc, Pico-24pc, Nano-27pc) presentan valores de KLD mas altos (0,2524, 0,1540 y 0,1223 respectivamente) y coberturas top-p mas bajas, lo que implica perdida de fidelidad de distribucion.
- La cuantizacion puede aumentar el riesgo de alucinacion y de errores en tareas de razonamiento o codigo, especialmente en tiers agresivos.
- No hay informacion sobre idiomas soportados; la cobertura multilingue no puede confirmarse.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- La licencia es MIT (heredada del base), lo que permite uso comercial, pero conviene revisar la licencia del modelo base enlazada por el autor para confirmar condiciones.
- El recuento de parametros reportado en safetensors (1.282.297) es incoherente con un modelo de ~9,7B y apunta a un recuento parcial; hay que tratarlo con cautela.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion de la comunidad.
- El uso del modulo MTP requiere un runtime de llama.cpp que soporte decodificacion especulativa; su beneficio real de velocidad no esta documentado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Soulfate24/Ornith-1.5-9B-MTP-Paretrix
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Cuantizacion alternativa ASHQ1-Remix: https://huggingface.co/Soulfate24/Ornith-1.5-9B-MTP-ASHQ1-Remix-GGUF
- Web de Ornith AI: https://ornith.ai/
- Ficha del modelo en local-ai-zone: https://local-ai-zone.github.io/models/ornith-1-5-9b-mtp.html
- Requisitos de hardware de Ornith 1.5 9B: https://llmrun.dev/model/ornith-ai-ornith-1-5-9b
