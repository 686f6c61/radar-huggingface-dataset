# SZLHOLDINGS/szl-provenance-native-v3-lora

## Resumen

szl-provenance-native-v3-lora es un adaptador LoRA (PEFT) publicado por SZL Holdings dentro de su "governed-AI estate", una familia de artefactos con trazabilidad documental orientada a la verificacion de resultados. El adaptador se entrena sobre un modelo base no identificado en la informacion disponible y su proposito declarado es el de mejorar el comportamiento de "abstencion limpia" (clean abstention) ante preguntas que el modelo no puede responder con evidencia, evitando citar artefactos o recibos inventados. El repositorio tiene un tamano de 0,0 GB, 291 descargas y ningun "like" en el momento de la consulta.

La relevancia de esta ficha es doble. Por un lado, documenta un adaptador de bajo rango con licencia Apache 2.0, lo que permite reutilizacion comercial sin restricciones adicionales. Por otro, la propia model card incluye un ejercicio de honestidad poco habitual: reconoce contaminacion en su bateria de evaluacion original (6/6 sondas presentes en el corpus de entrenamiento) y publica una evaluacion held-out v2 con resultados modestos. Segun esos datos, el adaptador mejora ligeramente la abstencion frente al modelo base (3/24 y 2/24 frente a 1/24), pero sigue citando un artefacto inventado en 20-22 de 24 sondas donde deberia abstenerse.

No se dispone de informacion sobre arquitectura del modelo base, numero de parametros, longitud de contexto, idiomas soportados ni formato de pesos mas alla de safetensors. La model card no declara ningun benchmark estandar (MMLU, HumanEval, GSM8K) y advierte explicitamente que no afirma ningun numero que no haya sido medido en una auditoria fechada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base no identificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA gestionado con la libreria PEFT, publicado en formato safetensors. La informacion disponible no identifica el modelo base sobre el que se aplica el adaptador, ni el rango, alpha, modulos objetivo o hiperparametros de entrenamiento. Tampoco se detalla la composicion del corpus de entrenamiento mas alla de la referencia a `provenance_corpus_v03.jsonl` y a las versiones v0.2-v0.5 de los corpora de entrenamiento mencionadas en la seccion de evidencia held-out.

La model card documenta un proceso de evaluacion con separacion entre datos de entrenamiento y datos held-out, y reconoce un fallo de contaminacion: las 6 sondas de la bateria original aparecen literalmente como turnos de usuario en el corpus de entrenamiento del adaptador (6/6), por lo que las puntuaciones de esa bateria son in-distribution. La evaluacion held-out v2 se pre-registro con una rubrica fijada antes de que ningun modelo viera las sondas (sha256 72045c599ef7cdb11d73bffe7c52cdd83aa6f590c88c6a0d7c51966d3d3f9fd1) y comprende 24 sondas "should-abstain" y 6 sondas "should-answer". No se declara el uso de RLHF, DPO ni ninguna otra fase de alineacion.

## Capacidades

- Generacion de texto condicionada por el modelo base subyacente, cuyas caracteristicas no se detallan.
- Abstencion ante preguntas sin evidencia: capacidad objetivo del adaptador, medida en la evaluacion held-out v2 con resultados parciales (3/24 y 2/24 abstenciones limpias).
- Trazabilidad documental: el artefacto forma parte de un ecosistema con recibos (receipts) fechados y verificables en repositorios asociados.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles.
- No se declaran capacidades de codigo, matematicas ni razonamiento especializado.

## Casos de uso

- Investigacion sobre calibracion y abstención: el adaptador sirve como caso de estudio reproducible para medir como un LoRA afecta la tendencia de un modelo a declinar preguntas sin evidencia, con recibos fechados y rubrica pre-registrada.
- Auditoria de sistemas de "provenance": util para equipos que construyen pipelines donde el modelo debe citar fuentes verificables y se quiere evaluar el riesgo de citar artefactos inventados (20-22/24 en las pruebas publicadas).
- Evaluacion de contaminacion en benchmarks: la model card documenta un caso concreto de contaminacion (6/6 sondas en el corpus) que puede reutilizarse como ejemplo metodologico en cursos y papers sobre higiene de evaluacion.
- Prototipado de asistentes con politica de "no se" explicita: en entornos de baja criticidad donde se prefiera una abstención a una respuesta inventada, aunque los resultados publicados indican que la mejora es marginal.
- Reproducibilidad de experimentos: los recibos referenciados en `SZLHOLDINGS/frontier-54-runs` permiten replicar las ejecuciones en CPU (laptop y cloud) y comparar variantes v3, v4 y v5 del linaje.
- Base para fine-tuning posterior: al ser un adaptador LoRA con licencia Apache 2.0, puede combinarse o continuar entrenandose sin restricciones de licencia, siempre que se respete la licencia del modelo base (no identificado).

## Benchmarks y rendimiento

La model card no declara resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos medidos son los de la evaluacion held-out v2:

| Modelo | Ejecucion | Abstencion limpia /24 | Cita artefacto inventado /24 | Respuesta correcta /6 |
|---|---|---|---|---|
| modelo base | laptop CPU 2026-11-20 | 1 | 23 | 0 |
| modelo base | cloud CPU 2026-11-24 | 1 | 23 | 1 |
| v3 (este adaptador) | laptop CPU 2026-11-20 | 3 | 20 | 1 |
| v3 (este adaptador) | cloud CPU 2026-11-24 | 2 | 22 | 1 |
| v4 | laptop CPU 2026-11-20 | abortado (RAM) | - | - |
| v4 | cloud CPU 2026-11-24 | 8 | 16 | 1 |
| v5 | cloud CPU 2026-11-25 | 1 | 23 | 0 |

La propia model card advierte que no hay puntuacion compuesta ni afirmacion de significancia estadistica, y que las diferencias de 1-2 unidades entre entornos no son significativas. En un mismo entorno, una repeticion fue byte-identica (30/30).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el modelo base ni el tamano del adaptador.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no determinada; las evaluaciones publicadas se ejecutaron en CPU (laptop y cloud), no en GPU.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, es compatible con el ecosistema Hugging Face Transformers + PEFT; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card menciona que la variante v4 aborto por RAM en una ejecucion en laptop, lo que sugiere requisitos de memoria no triviales para ese linaje, pero no aporta cifras.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores LoRA de abstención o provenance) en la informacion proporcionada. La unica comparacion posible es interna al linaje del propio autor:

| Variante | Abstencion limpia /24 (cloud CPU) | Cita inventada /24 | Respuesta correcta /6 |
|---|---|---|---|
| modelo base | 1 | 23 | 1 |
| v3 (este adaptador) | 2 | 22 | 1 |
| v4 | 8 | 16 | 1 |
| v5 | 1 | 23 | 0 |

Segun estos datos, v4 supera a v3 en abstencion limpia y reduce las citas inventadas, mientras que v5 no mejora al modelo base en este conjunto de sondas.

## Limitaciones y advertencias

- Contaminacion reconocida: las 6 sondas de la bateria original aparecen literalmente en el corpus de entrenamiento, por lo que cualquier puntuacion basada en esa bateria es in-distribution y no valida como medida de generalizacion.
- Rendimiento held-out modesto: en las 24 sondas should-abstain, el adaptador sigue citando un artefacto inventado en 20-22 casos, lo que indica que no esta fundamentado en preguntas fuera de distribucion.
- Respuesta correcta en controles: solo 1/6 en las sondas should-answer, igual que el modelo base en cloud CPU.
- Inestabilidad entre entornos: el mismo peso genero respuestas greedy distintas en dos entornos CPU, con variaciones de 1-2 unidades por columna; diferencias de ese tamano no son significativas.
- Recibos sin firma: todos los recibos de la evaluacion held-out v2 estan marcados como UNSIGNED hasta que los contrafirme el firmante DSSE del estate, lo que limita su valor probatorio.
- Modelo base no identificado: no se puede verificar la licencia efectiva del conjunto (adaptador + base), el contexto maximo, los idiomas ni las capacidades reales del sistema desplegado.
- Ausencia de benchmarks estandar: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no es posible comparar con el estado del arte.
- Nota de licencia: la model card indica que la etiqueta apache-2.0 se fijo el 2026-11-25 por operaciones del estate y que no se reclama evidencia de licencia upstream por fichero; conviene verificar la procedencia antes de un uso comercial.
- Riesgo de alucinacion: la propia evidencia publicada muestra una alta tasa de citas de artefactos inventados, lo que desaconseja su uso en produccion para tareas de verificacion factual sin una capa de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v3-lora
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de recibos de evaluacion: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
- Corpus y kit de evaluacion: https://huggingface.co/SZLHOLDINGS/provenance-native-corpus-v1
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
