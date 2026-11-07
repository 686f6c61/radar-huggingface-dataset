# tanxichu/luckison-LongVQU-Eval-2026

## Resumen

`tanxichu/luckison-LongVQU-Eval-2026` es un paquete de artefactos de evaluacion (adaptadores QLoRA, codigo de inferencia y regresores auxiliares) publicado por el equipo `luckisondu` para el reto VQualA 2026 LongVQU-Eval, centrado en la evaluacion de calidad de video de larga duracion (video quality assessment, VQA). No se trata de un modelo fundacional nuevo, sino de una capa de ajuste fino y de un pipeline de post-proceso construidos sobre el modelo multimodal `Qwen/Qwen3-VL-32B-Instruct` de Alibaba Qwen, que actua como motor de razonamiento visual.

El paquete resuelve el problema de responder preguntas estructuradas sobre la calidad percibida de videos largos: preguntas de tipo LQU (local quality understanding), CQR (comparative quality reasoning), GQU (global quality understanding), deteccion de distorsiones, localizacion temporal de degradaciones y valoracion global. Para ello combina dos adaptadores LoRA de rango 16 con un regresor de severidad basado en un bagging de cinco modelos de gradient boosting entrenados sobre 97 estadisticas de la linea temporal de distorsiones por segundo, y una lista de 49 reglas de sobrescritura validadas en leaderboard.

Su relevancia actual es acotada pero precisa: es un ejemplo reproducible de como exprimir un VLM de 32B en una tarea de evaluacion perceptual mediante QLoRA, ingenieria de senales temporales y fusion determinista, en lugar de un unico prompt. El repositorio pesa 1,1 GB (solo adaptadores, codigo, logs y predicciones; no incluye pesos del modelo base ni los videos del benchmark) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer (modelo base Qwen3-VL-32B-Instruct) + adaptadores QLoRA de rango 16 + regresor gradient boosting (scikit-learn) |
| Parametros totales | 32B en el modelo base; tamano de los adaptadores no disponible |
| Parametros activos | no disponible (el modelo base no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (bitsandbytes) para la inferencia del modelo base; cuantizacion de los adaptadores no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA); regresor en `.pkl` (scikit-learn) |

## Arquitectura y entrenamiento

El componente neuronal es un ajuste QLoRA sobre `Qwen3-VL-32B-Instruct`. Se entrenan dos adaptadores de rango 16 con propositos distintos: `lora_f21_paraval` responde a las preguntas LQU y CQR, y `lora_f26` responde a las GQU. El entrenamiento se organiza en etapas: F5 con 1.200 preguntas de desarrollo durante 2 epocas a learning rate 1e-4, seguida de una epoca sobre parafrasis con estilo de test a learning rate 3e-5 para F20/F21, y una epoca adicional de parafrasis para F25/F26. Cada etapa consume aproximadamente 40 minutos en una GPU de 48 GB. El script `vq/synth.py` permite generar preguntas sinteticas a partir de clips limpios con distorsiones artificiales.

Alrededor del VLM, el pipeline incorpora ingenieria de senales temporal: `vq/timeline.py` calcula senales de distorsion por segundo (CPU, alrededor de 1 minuto por video, reanudable), normalizadas por video para hacer la resolucion absoluta poco relevante. Sobre esas 97 estadisticas de linea temporal se entrena E1, un bagging de cinco regresores de gradient boosting que estima la severidad por segmento. La inferencia usa promediado sobre 4 permutaciones de opciones (`--perm-avg 4`) y contexto de 6 pares, con un coste de unos 20 segundos por pregunta en una sola GPU. La respuesta final se compone del argmax de F21 o F26 mas 49 sobrescrituras deterministas (12 de severidad del regresor E1, 10 de localizacion por regla de pico z, 4 de deteccion, 3 de valoracion global y 20 de cuatro bloques validados en leaderboard).

## Capacidades

- Razonamiento visual sobre video de larga duracion: evaluacion de calidad perceptual, deteccion de distorsiones y comparacion entre clips.
- Respuesta a preguntas de opcion multiple con calibracion de probabilidades por opcion y promediado sobre permutaciones.
- Localizacion temporal de degradaciones mediante senales por segundo y reglas de pico.
- Estimacion de severidad por segmento mediante un regresor supervisado independiente del VLM.
- Deteccion de presencia de distorsiones y valoracion global de calidad.
- Capacidades heredadas del modelo base Qwen3-VL-32B-Instruct (vision-lenguaje general, tool calling, multilingueismo): no documentadas especificamente en este paquete.
- Reproducibilidad byte a byte del envio final a partir de los logs archivados (md5 `8ae0c0fa20f4998ec96ef2c5c4b5a63f`).

## Casos de uso

- Evaluacion automatizada de calidad en plataformas de video: el pipeline analiza la linea temporal por segundo y responde preguntas estandarizadas sobre degradaciones, permitiendo auditar catalogos sin revision humana.
- Control de calidad en pipelines de transcodificacion: comparar el video original con la version transcodificada usando las preguntas CQR y el regresor de severidad para detectar perdida perceptible.
- Monitorizacion de emisiones en directo: la deteccion de distorsiones y la localizacion temporal por pico z permiten marcar el segundo exacto de una caida de calidad.
- Investigacion en VQA: el paquete sirve como baseline reproducible para el benchmark LongVQUBench, con logs de probabilidades y reglas documentadas.
- Generacion de datos sinteticos de entrenamiento: `vq/synth.py` produce distorsiones controladas sobre clips limpios para aumentar el conjunto de preguntas.
- Ajuste de VLMs a dominios perceptuales: `vq/train_lora.py` y la receta de etapas F5/F20/F21/F25/F26 sirven de plantilla para adaptar Qwen3-VL a otras tareas de evaluacion estructurada.
- Auditoria de modelos: la lista de 49 sobrescrituras con su metodo asociado permite trazar que respuestas provienen del modelo y cuales de reglas heuristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona bloques "validados en leaderboard" y una puntuacion de envio, pero no incluye cifras numericas de rendimiento ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB con el modelo base en 4-bit NF4; la model card recomienda una GPU de 48 GB para margen operativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S; cualquier GPU de 48 GB o mas para el flujo documentado.
- GPU de consumo: no confirmado; 24 GB en NF4 sugiere que una RTX 4090 (24 GB) podria ajustar, pero sin margen y no verificado por el autor.
- Despliegue: transformers >= 4.57 con peft, bitsandbytes y accelerate; backend `hf_backend.py` incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 20 segundos por pregunta en una GPU; el calculo de la linea temporal consume cerca de 1 minuto por video en CPU con 8 jobs.
- Almacenamiento: 1,1 GB para el paquete; el modelo base Qwen3-VL-32B-Instruct debe descargarse aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luckison-LongVQU-Eval-2026 | 32B (base) + adaptadores | no disponible | VQA de video largo | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-32B-Instruct | 32B | no disponible | VLM general | Apache-2.0 | Hugging Face |
| Alternativas especificas de VQA de video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros sistemas comparables en el mismo benchmark (LongVQUBench / VQualA 2026) ni de sus puntuaciones, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar Qwen3-VL-32B-Instruct por separado y ejecutar un pipeline de varios componentes (timeline, inferencia, regresor, fusion).
- Las 49 sobrescrituras estan validadas contra el leaderboard del reto; su generalizacion a otros dominios o distribuciones de video no esta demostrada y puede constituir sobreajuste al test set.
- Reejecutar la inferencia en otra GPU puede alterar algunos argmax y, por tanto, las predicciones finales; la reproducibilidad byte a byte solo esta garantizada con los logs archivados.
- Los videos y preguntas pertenecen a los organizadores del benchmark y no se incluyen; el uso fuera del reto requiere acceso propio a datos equivalentes.
- Riesgo de alucinacion inherente al VLM base en preguntas abiertas; el diseno mitiga parte con opcion multiple y promediado por permutaciones, pero no lo elimina.
- Idiomas soportados no documentados; el pipeline esta disenado para el formato de preguntas del benchmark.
- Sesgos del modelo base (Qwen3-VL-32B-Instruct) no evaluados en este paquete.
- La licencia Apache-2.0 cubre codigo y adaptadores, pero no los datos del benchmark ni posibles restricciones adicionales de los organizadores.

## Enlaces

- Hugging Face: https://huggingface.co/tanxichu/luckison-LongVQU-Eval-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Informe de metodologia: `report/LongVQU_report.pdf` dentro del repositorio
- Contacto del autor: luckisondu@gmail.com
- Timeline de lanzamientos de modelos IA: https://www.promptzone.com/ai-model-releases
- Benchmarks de modelos IA 2026: https://aiproductivity.ai/research/model-benchmarks/
