# Soulfate24/Nanbeige4.2-3B-DSpark-ASHQ1-Remix-GGUF

## Resumen

Soulfate24/Nanbeige4.2-3B-DSpark-ASHQ1-Remix-GGUF es una cuantización GGUF del modelo Nanbeige4.2-3B-DSpark, publicada por el usuario Soulfate24. No se trata de un modelo entrenado desde cero, sino de un derivado de pesos: el autor aplica su suite de cuantización denominada ASHQ1-Remix (activation-aware, con calibración imatrix) sobre el modelo base de Nanbeige, que a su vez parte de Nanbeige/Nanbeige4.2-3B. El resultado es un conjunto de ficheros GGUF pensados para inferencia local eficiente.

La relevancia de esta publicación está en la metodología de cuantización y en las métricas publicadas, no en cambios de arquitectura o de capacidades respecto al modelo original. El autor documenta siete niveles (de "Fidelity-48pc" a "Pico-24pc") con tamaños de fichero que van de 3824 MiB a 1913 MiB, y los compara contra cuantizaciones "stock" del mismo modelo (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx) sobre wiki.test.raw, reportando perplejidad (PPL), divergencia KL (KLD), RMS Δp, top-p y velocidad en tokens por segundo.

Un dato a tener en cuenta: pese al sufijo "3B" del nombre, el contador de parametros real en safetensors del modelo base es de 4.169.800.704 parametros (aproximadamente 4,17 mil millones). El repositorio ocupa 20,7 GB porque contiene toda la escalera de cuantizaciones, no un unico fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.169.800.704 (dato real del modelo base en safetensors) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con metodologia ASHQ1-Remix (activation-aware, calibracion imatrix); siete niveles: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc |
| Idiomas soportados | en (ingles), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo compatible con transformers segun etiquetas del autor) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base Nanbeige4.2-3B ni sobre su proceso de entrenamiento (composicion del dataset, numero de tokens, uso de RLHF/DPO o tecnicas de atencion alternativa) en la informacion proporcionada. Lo unico confirmado es que se trata de un modelo de generacion de texto de tipo conversacional, publicado por Nanbeige, con soporte de ingles y chino, y que la variante "DSpark" es un derivado del mismo sobre el que se ha aplicado la cuantizacion.

Lo que si esta documentado es el proceso de cuantizacion. La suite ASHQ1-Remix se describe como una cuantizacion GGUF "activation-aware" en la que cada ratio, suelo y techo procede de un experimento medido. El autor indica que es "plain-BF16-native first" (parte de pesos BF16 sin reentrenamiento) y que soporta la linea AutoRound con cotas de saturacion explicitas. La escalera de siete niveles se valida, segun el autor, en seis familias de modelos. Se aplica calibracion imatrix, como reflejan las comparaciones contra cuantizaciones "imx" (imatrix) de referencia.

## Capacidades

- Generacion de texto conversacional en ingles y chino, heredada del modelo base Nanbeige4.2-3B-DSpark.
- Inferencia local en CPU y GPU gracias al formato GGUF y a los siete niveles de cuantizacion disponibles, que permiten ajustar el equilibrio entre tamano y fidelidad.
- Ejecucion en entornos con memoria limitada: el nivel Pico-24pc ocupa 1913 MiB, lo que abre la puerta a hardware de gama baja o a despliegues con muchos modelos cargados simultaneamente.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponible en la informacion proporcionada.
- Capacidades multilingues adicionales fuera de en/zh: no disponible.

## Casos de uso

- Despliegue de un asistente conversacional local en castellano-ingles o chino: aunque el modelo solo declara en y zh, se puede usar el nivel Precision-42pc (3384 MiB) en un portatil con GPU de 6-8 GB para prototipar chat multi-turno sin depender de APIs externas.
- Clasificacion y etiquetado de texto por lotes en entornos sin GPU: el nivel Compact-33pc (2630 MiB) o Mini-30pc (2391 MiB) permiten ejecutar inferencia en CPU con llama.cpp sobre grandes volumenes de documentos, priorizando throughput (512-557 t/s en la tabla del autor) sobre fidelidad.
- Generacion aumentada por recuperacion (RAG) en documentacion tecnica en ingles o chino: usando el nivel Quality-36pc (2849 MiB), que iguala metrica a metrica al Q5_K_M-imx stock (PPL 34,6224, KLD 0,0743, RMS Δp 5,80%, 88,3% top-p) pero con el mismo tamano de fichero.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio es util como banco de pruebas para investigadores que quieran medir el impacto de distintos niveles ASHQ1 frente a cuantizaciones stock sobre un mismo modelo, con las metricas ya publicadas como referencia.
- Prototipado rapido en entornos CI o contenedores con poca memoria: el nivel Pico-24pc (1913 MiB) cabe en instancias pequeñas, aunque el autor lo marca con ✗ por su degradacion (PPL 37,8642, KLD 0,3878), por lo que solo seria aceptable en tareas de baja exigencia.
- Destilacion o generacion de datos sinteticos a bajo coste: con el nivel Fidelity-48pc (3824 MiB) y su KLD de 0,0247, la salida se mantiene cerca del modelo BF16 original, lo que resulta util cuando se necesita volumen de texto generado sin pagar inferencia en precision completa.
- Sustitucion de cuantizaciones Q6_K/Q5_K en pipelines existentes: al mantener el formato GGUF, se puede reemplazar el fichero en un servidor ya desplegado con llama.cpp, Ollama o LM Studio cambiando solo el fichero de pesos.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor. Medicion sobre wiki.test.raw, con referencia simetrica FA-auto. Los valores marcados con † los senala el autor como anotados; los niveles marcados con ✗ (Nano-27pc y Pico-24pc) los desaconseja el propio autor. No se especifica el hardware ni la configuracion exacta de la medicion de velocidad.

| Modelo | Tamano | PPL | KLD | RMS Δp | top-p | Velocidad |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Q8_0 (stock) | 4229 MiB | 34,4742 | 0,0105 | 2,39% | 95,6% | 353 t/s |
| Fidelity-48pc | 3824 MiB | 34,3246† | 0,0247 | 3,42% | 94,0% | 371 t/s |
| Precision-42pc | 3384 MiB | 34,3791† | 0,0331 | 3,94% | 92,5% | 382 t/s |
| Q6_K-imx (stock) | 3266 MiB | 34,4411† | 0,0335 | 3,99% | 92,4% | 406 t/s |
| Quality-36pc | 2849 MiB | 34,6224 | 0,0743 | 5,80% | 88,3% | 466 t/s |
| Q5_K_M-imx (stock) | 2849 MiB | 34,6224 | 0,0743 | 5,80% | 88,3% | 470 t/s |
| Compact-33pc | 2630 MiB | 34,6636 | 0,1441 | 7,98% | 83,8% | 512 t/s |
| Mini-30pc | 2391 MiB | 33,5214† | 0,1728 | 8,66% | 81,8% | 557 t/s |
| IQ4_XS-imx (stock) | 2268 MiB | 34,8506 | 0,1813 | 9,17% | 81,2% | 457 t/s |
| Nano-27pc ✗ | 2152 MiB | 33,7551† | 0,2191 | 10,12% | 78,6% | 453 t/s |
| IQ3_M-imx (stock) | 1985 MiB | 36,4366 | 0,4492 | 14,31% | 70,5% | 539 t/s |
| Pico-24pc ✗ | 1913 MiB | 37,8642 | 0,3878 | 13,31% | 72,6% | 545 t/s |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las metricas anteriores son de fidelidad de cuantizacion (divergencia respecto al modelo de referencia), no de capacidad funcional.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamanos de la tabla son el peso de los ficheros. Hay que sumar la cache KV y el overhead del runtime, que dependen del contexto configurado y no se especifican en la informacion disponible. Como referencia practica, anade entre 0,5 y 2 GB segun longitud de contexto y backend.
- Niveles y peso en disco: Fidelity-48pc 3824 MiB; Precision-42pc 3384 MiB; Quality-36pc 2849 MiB; Compact-33pc 2630 MiB; Mini-30pc 2391 MiB; Nano-27pc 2152 MiB; Pico-24pc 1913 MiB.
- Cabe en GPU de consumo: si. Los niveles de 1913 a 2849 MiB son adecuados para GPUs de 4-6 GB (GTX 1650, RTX 3050, RTX 4060 en configuraciones mixtas); los niveles de 3384 a 3824 MiB encajan en GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 2070) dejando margen para contexto moderado.
- GPU de datacenter: A100, H100 o L40S permiten cargar varias cuantizaciones simultaneamente o servir el nivel Fidelity-48pc con contextos largos y lotes grandes.
- CPU: los niveles Mini-30pc y Compact-33pc son los mas razonables para inferencia puramente en CPU; el nivel Pico-24pc tambien, aunque con la degradacion que el propio autor marca.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio y otros runtimes compatibles con GGUF. Para vLLM o TGI, el soporte de GGUF es limitado o experimental; la informacion proporcionada no confirma compatibilidad con estos servidores.
- Latencia y throughput: la tabla del autor reporta entre 353 y 557 t/s segun nivel, pero no se especifica el hardware de medida, por lo que estas cifras no son extrapolables a otros equipos.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos de terceros comparables (mismo tamano o misma tarea) en la informacion proporcionada. La unica comparacion documentada es interna al propio repositorio: los siete niveles ASHQ1-Remix frente a las cuantizaciones stock del mismo modelo base.

| Nivel ASHQ1-Remix | Tamano | Referencia stock equivalente | Diferencia observada |
|---|---|---|---|
| Fidelity-48pc | 3824 MiB | Q8_0 (4229 MiB) | 405 MiB menos, KLD 0,0247 frente a 0,0105 |
| Precision-42pc | 3384 MiB | Q6_K-imx (3266 MiB) | 118 MiB mas, KLD 0,0331 frente a 0,0335 |
| Quality-36pc | 2849 MiB | Q5_K_M-imx (2849 MiB) | Identico tamano y metricas identicas en la tabla publicada |
| Compact-33pc | 2630 MiB | sin equivalente directo | KLD 0,1441, entre Q5_K_M-imx e IQ4_XS-imx |
| Mini-30pc | 2391 MiB | IQ4_XS-imx (2268 MiB) | 123 MiB mas, KLD 0,1728 frente a 0,1813 |
| Nano-27pc | 2152 MiB | IQ3_M-imx (1985 MiB) | 167 MiB mas, KLD 0,2191 frente a 0,4492 |
| Pico-24pc | 1913 MiB | sin equivalente directo | KLD 0,3878, peor que IQ3_M-imx pese a mayor tamano relativo |

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda integramente los sesgos, el conocimiento y las limitaciones del modelo Nanbeige4.2-3B-DSpark. No hay informacion sobre la naturaleza de esos sesgos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Las metricas publicadas (PPL, KLD) miden fidelidad respecto al modelo de referencia, no veracidad.
- Degradacion en los niveles bajos: el propio autor marca Nano-27pc y Pico-24pc con ✗. Pico-24pc alcanza un KLD de 0,3878 y un RMS Δp de 13,31%, lo que indica una divergencia considerable respecto al original.
- Idiomas: solo se declaran ingles y chino. No hay soporte declarado de castellano, por lo que el rendimiento en espanol es incierto y deberia validarse antes de usarlo en produccion.
- Longitud de contexto: no disponible. No se puede planificar un caso de uso con contexto largo sin confirmar este dato en el modelo base.
- Licencia: apache-2.0, lo que en principio permite uso comercial. No obstante, conviene verificar la licencia del modelo base Nanbeige4.2-3B y de la variante DSpark, ya que el repositorio no detalla condiciones adicionales.
- Confusion de nomenclatura: el nombre indica "3B" pero el recuento real de parametros del modelo base es de 4,17 mil millones. Conviene no usar el sufijo del nombre para estimar requisitos de memoria.
- Repositorio de 20,7 GB: contiene la escalera completa de cuantizaciones. Descargar el repo entero no es necesario; basta con el fichero del nivel elegido.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta. No hay validacion independiente de las metricas publicadas.
- Los resultados de busqueda web realizados no aportaron informacion tecnica relevante sobre este modelo ni sobre Nanbeige4.2-3B; todos los enlaces devueltos correspondian a resultados genericos de YouTube sin relacion con el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Soulfate24/Nanbeige4.2-3B-DSpark-ASHQ1-Remix-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modelo base (variante DSpark): https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
- Suite de cuantizacion del autor: https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
