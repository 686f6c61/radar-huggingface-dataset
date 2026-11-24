# turintech/decider-2b-Artemis-GGUF

## Resumen

decider-2b-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo Mapika/decider-2b, publicada por TurinTech dentro de su línea Artemis de compresión de modelos. No es un modelo conversacional al uso: se trata de un modelo de decisión que recibe un estado (por ejemplo, el texto de una incidencia) y una o varias preguntas con opciones cerradas, y devuelve en un único forward pass la probabilidad de cada opción. El objetivo es sustituir a un LLM grande en tareas de clasificación y enrutamiento estructurado, reduciendo coste y latencia.

El modelo cuenta con 1.881.825.088 parámetros totales y un repositorio de 1,3 GB, con el fichero Q4_K_M ocupando 1.273 GB y requiriendo unos 3,97 GiB de memoria de GPU. Está pensado para ejecutarse en un portátil o en una GPU pequeña mediante llama-cpp-python, y conserva el 93,65 % de las respuestas del modelo original según las métricas declaradas por el autor, frente al 89,45 % de la cuantización Q4_K_M original de Mapika.

Su relevancia actual radica en que ofrece una alternativa determinista y de bajo coste para decisiones tipadas (enrutamiento de tickets, etiquetado, triaje) sin necesidad de generar texto libre, con licencia Apache 2.0 y despliegue local. La contrapartida es que no funciona como chatbot ni a través de servidores estándar: requiere el script `decide_gguf.py` de Mapika sobre llama-cpp-python.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; el fichero publicado es Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Mapika/decider-2b |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 1,3 GB |
| Descargas | 368 |
| Librería | gguf |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Mapika/decider-2b en la documentación proporcionada. Por el pipeline declarado (text-classification) y por su funcionamiento descrito, el modelo opera como un clasificador de opciones: dado un estado y una lista de preguntas con sus opciones, produce una distribución de probabilidad sobre cada opción en un solo forward pass, en lugar de generar texto autoregresivamente.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable de esta publicación es la compresión Artemis de TurinTech aplicada sobre la cuantización Q4_K_M de Mapika: el autor declara una conservación del 93,65 % de respuestas idénticas al original, frente al 89,45 % de la Q4_K_M de referencia, y cero cambios en las respuestas clasificadas como "confidentes". El modelo se ejecuta exclusivamente mediante el script `decide_gguf.py` sobre llama-cpp-python; no es compatible con el endpoint `/v1/systemone` de llama-server, ni con Ollama, ni con LM Studio en modo decisión.

## Capacidades

- Clasificación y decisión estructurada: devuelve, para cada pregunta, la opción más probable, su probabilidad y la distribución completa sobre todas las opciones.
- Soporte de múltiples preguntas simultáneas en una misma llamada, cada una con su propio conjunto de opciones.
- Salida probabilística calibrada, apta para umbrales de confianza y lógica de escalado.
- Enrutamiento de tickets y triaje por departamento, urgencia u otras etiquetas cerradas.
- No es un modelo conversacional: no mantiene diálogo ni genera texto libre.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y una pregunta con opciones (billing, technical, sales) y devuelve la probabilidad de cada departamento; en el ejemplo de la model card asigna 0,957 a billing para un cargo duplicado.
- Triaje por urgencia: una segunda pregunta con opciones low/medium/high permite priorizar la cola de atención sin un LLM generativo, con una sola pasada por el modelo.
- Etiquetado de contenido a escala: clasificación de documentos o mensajes en categorías cerradas con salida probabilística, útil para pipelines de moderación o catalogación.
- Clasificación de intenciones en asistentes: determinar la intención del usuario entre un conjunto fijo de acciones antes de derivar a otro sistema.
- Enrutamiento en sistemas multiagente: seleccionar qué herramienta o agente debe atender una petición a partir de la distribución de probabilidad devuelta.
- Despliegue en local o en el borde: con 1.273 GB de fichero y unos 3,97 GiB de memoria, puede ejecutarse en un portátil o en una GPU pequeña para decisiones sensibles que no deben salir del dispositivo.
- Filtrado previo en pipelines de datos: descartar o marcar registros según categorías con umbral de confianza, reduciendo el coste frente a un LLM generativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto LocalLLaMA/typed-decisions, "Final set":

| Tarea | Métrica | Valor |
|---|---|---|
| Agreement with the original | Same answer (%) | 93,65 |
| Agreement with the original | Confident changes | 0 |
| Typed decisions | Accuracy (%) | 61,15 |

Comparación de conservación frente a la cuantización de referencia:

| Versión | Same answer as original (%) |
|---|---|
| decider-2b-Artemis-GGUF (Q4_K_M) | 93,65 |
| Mapika Q4_K_M | 89,45 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 3,97 GiB según la model card para el fichero Q4_K_M de 1.273 GB.
- GPU recomendadas: probado en NVIDIA A100 con llama-cpp-python compilado con CUDA (`CMAKE_ARGS="-DGGML_CUDA=on"`); por su tamaño, cabe en GPU de consumo con al menos 4 GiB de VRAM libre.
- Ejecución en CPU: soportada mediante `GGUFDecider(path, n_gpu_layers=0)`.
- Despliegue: exclusivamente mediante `decide_gguf.py` de Mapika sobre llama-cpp-python 0.3.36 y decider-ai 1.5.0; no compatible con llama-server (`/v1/systemone`), Ollama ni LM Studio en modo decisión.
- Entorno probado: Python 3.12, solo Linux; requiere compilador C++, CMake y CUDA toolkit con `nvcc` en el PATH para la build con GPU.
- Nota de instalación: `decider-ai` arrastra PyTorch (varios GB) como dependencia aunque `decide_gguf.py` no ejecuta el modelo en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| decider-2b-Artemis-GGUF | 1.881.825.088 | no disponible | apache-2.0 | GGUF (Q4_K_M) | Decisión tipada con salida probabilística |
| Mapika/decider-2b (base) | no disponible | no disponible | no disponible | no disponible | Decisión tipada, modelo original |
| Mapika/decider-2b-GGUF (Q4_K_M) | no disponible | no disponible | no disponible | GGUF | Decisión tipada, cuantización de referencia (89,45 % de conservación) |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría (clasificadores de decisión tipada) para ampliar la comparativa con parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene diálogo; su uso está restringido a decisiones con opciones cerradas.
- Requiere el script `decide_gguf.py` de Mapika y llama-cpp-python; no funciona con Ollama, LM Studio ni llama-server en modo decisión, lo que limita su integración en despliegues estándar.
- La precisión declarada en decisiones tipadas es del 61,15 %, moderada; conviene validar con datos propios antes de producción.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma; al no ser generativo, el riesgo de alucinación textual es bajo, pero la calibración de probabilidades debe evaluarse en el dominio de uso.
- Solo se ha probado en Linux; el soporte en otros sistemas no está confirmado.
- La instalación de `decider-ai` arrastra PyTorch (varios GB) innecesariamente para la inferencia GGUF.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/decider-2b-Artemis-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Cuantización de referencia de Mapika: https://huggingface.co/Mapika/decider-2b-GGUF
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
