# zhniu/smolvla-so101-tape100-leisaac-framewise

## Resumen

SmolVLA SO-101 tape-to-pen-holder es un modelo de vision-lenguaje-accion (VLA) obtenido por ajuste fino de `lerobot/smolvla_base` sobre un conjunto de 100 trayectorias de simulacion generadas con LeIsaac. Lo publica el usuario zhniu en Hugging Face y resuelve una tarea concreta de manipulacion robotica: con un brazo SO-101, coger un rollo de cinta y colocarlo dentro de un organizador de boligrafo de malla. El modelo tiene unos 450 millones de parametros totales (alrededor de 100 millones entrenables), se distribuye en safetensors con licencia Apache-2.0 y esta pensado para ejecutarse con la libreria LeRobot.

La relevancia de esta ficha es acotada y conviene subrayarla: se trata de una politica experimental de una sola tarea, entrenada unicamente en simulacion, sin validacion de tasa de exito ni en bucle cerrado simulado ni en robot real. El autor declara explicitamente `calibration_passed=false` y ausencia de transferencia zero-shot demostrada. Por tanto, es util como referencia de metodologia (ajuste fino de SmolVLA con aumentos de textura por fotograma y randomizacion de dominio) mas que como componente listo para produccion.

El modelo parte de SmolVLA, una arquitectura VLA compacta que combina un codificador visual-lenguaje con un experto de acciones entrenado por flow matching supervisado. La ficha documenta los hiperparametros, el dataset, las estadisticas de normalizacion y las perdidas offline, pero no aporta cifras de rendimiento en tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion; codificador VLM congelado + experto de acciones por flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE; el autor indica ~100M entrenables) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot; fichero de tensores de 906.712.552 bytes) |

Otros datos tecnicos declarados: observaciones de 25 dimensiones de estado mas dos camaras RGB a 640x480; 6 acciones (objetivos articulares absolutos) a 30 Hz; chunk de prediccion de 50 acciones y de ejecucion de 30; entrenamiento en BF16 sobre una unica NVIDIA A30 de 24 GB.

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base` (revision `d9f33c94a60fb382c90dea2164c96845bd955e28`). SmolVLA combina un backbone de vision-lenguaje con un experto de acciones; en este ajuste se congela el codificador visual y se optimizan el experto de acciones y la proyeccion de estado. El metodo de entrenamiento es flow matching supervisado, sin ajuste por refuerzo (RL) ni preferencias. La configuracion de liberacion desactiva la inicializacion redundante de pesos del VLM (`load_vlm_weights=false`) y carga los pesos entrenados completos desde el repositorio; parte de los metadatos de arquitectura y procesador pueden descargarse de `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` en el primer uso.

El dataset consta de 100 trayectorias independientes de LeIsaac (90 de entrenamiento, episodios 0-89; 10 de validacion, episodios 90-99), con 55.175 fotogramas totales (49.713 de entrenamiento y 5.462 de validacion). El entrenamiento duro 20.000 pasos con tamano de lote 8, BF16, tasa de aprendizaje 1e-4, warmup de 1.000 pasos y suelo de decaimiento de 2,5e-6. Se guardo y evaluo cada 1.000 pasos sobre los 10 episodios de validacion. Las estadisticas de normalizacion se calculan solo con los 90 episodios de entrenamiento y vienen embebidas en los pre/postprocesadores; el autor advierte de que no deben sustituirse por estadisticas del dataset completo. La innovacion metodologica declarada es el uso de texturas por fotograma y randomizacion de dominio en la generacion de datos (LeIsaac), aunque el propio autor senala que no se han hecho ablaciones controladas que demuestren beneficio causal.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce 6 objetivos articulares absolutos a 30 Hz a partir de estado de 25 dimensiones y dos imagenes RGB.
- Percepcion visual multi-camara: consume dos vistas (renombradas `camera1` y `camera2` por el preprocesador a partir de `front` y `side`).
- Condicionamiento por lenguaje: al derivar de SmolVLA, hereda la interfaz de instruccion en lenguaje natural del modelo base, aunque la tarea concreta esta fijada por el ajuste fino.
- Ejecucion por chunks: predice 50 acciones y ejecuta 30 por chunk, lo que reduce la frecuencia de inferencia del modelo.
- Idiomas: metadatos en ingles y chino; no hay evaluacion de capacidades multilingues en tarea.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes: es una politica de control motor, no un modelo conversacional.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre evaluada.

## Casos de uso

- Investigacion en imitacion robotica: sirve como punto de partida reproducible para estudiar ajuste fino de SmolVLA sobre tareas pick-and-place con un brazo SO-101, gracias a que el repositorio incluye pesos, tokenizer, procesadores y manifiesto de hashes.
- Estudio de randomizacion de dominio en simulacion: el dataset LeIsaac con texturas por fotograma permite analizar como varia la perdida offline al cambiar la apariencia de los objetos, aunque sin ablaciones publicadas.
- Banco de pruebas de pipelines LeRobot: util para validar la carga de politicas SmolVLA, el uso de pre/postprocesadores y la integracion con `LeRobotDataset` antes de entrenar modelos propios.
- Prototipado de control por chunks: el esquema de 50 acciones predichas y 30 ejecutadas a 30 Hz es un caso concreto para medir latencia de inferencia en GPUs de gama media como la A30 usada en entrenamiento.
- Docencia y divulgacion: ejemplo completo de ficha tecnica de un VLA de ~450M parametros con dataset, hiperparametros y perdidas documentadas, adecuado para explicar el ciclo sim-to-real.
- Base para comparaciones controladas: al ser un ajuste fino de un modelo publico con licencia Apache-2.0, puede usarse como referencia en estudios que comparen estrategias de aumento de datos en entornos simulados.

## Benchmarks y rendimiento

| Metrica | Valor final |
|---|---|
| Perdida de entrenamiento (ventana final, paso 20.000) | 0,010 |
| Perdida de validacion offline en held-out (paso 20.000) | 0,0206 |
| Tasa de exito en simulacion en bucle cerrado | no medida |
| Tasa de exito en robot real / ganancia sim-to-real | no medida |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a una politica VLA de control. Las cifras anteriores son perdidas supervisadas offline, no porcentajes de exito. El fichero `evaluation/validation_history.json` contiene las 20 mediciones de validacion.

## Requisitos de hardware

- Entrenamiento: una unica NVIDIA A30 de 24 GB en BF16, segun el autor.
- VRAM estimada para inferencia: no disponible de forma explicita; con ~450M parametros en BF16 el peso ronda 0,9 GB, por lo que deberia caber holgadamente en GPUs consumer, pero no hay medicion publicada.
- GPU recomendadas: no disponible; el unico dato es la A30 usada para entrenar.
- Cabe en GPU consumer: previsiblemente si por tamano de pesos, aunque no hay confirmacion ni cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot[smolvla]`) con decodificador de video `av` (PyAV); requiere `num2words` para el procesador. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhniu/smolvla-so101-tape100-leisaac-framewise | 450M (~100M entrenables) | no disponible | Pick-and-place SO-101 en simulacion | Apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base para ajuste fino | no disponible en la informacion | Hugging Face (modelo base citado) |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | ~500M (por el nombre) | no disponible | VLM general (fuente de metadatos de arquitectura) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Politica de una sola tarea: solo coger un rollo de cinta y colocarlo en un organizador concreto; no generaliza a otras tareas sin reentrenamiento.
- Entrenada exclusivamente en simulacion (LeIsaac), sin validacion en robot real ni transferencia zero-shot demostrada.
- `calibration_passed=false` declarado por el autor; no debe ejecutarse en configuraciones SO-101 arbitrarias sin replicar las entradas y calibraciones del dataset.
- Requiere las 25 dimensiones de estado completas: un registrador estandar de seis articulaciones no aporta el condicionamiento de mesa y camara.
- Las estadisticas de normalizacion embebidas se calcularon solo con los 90 episodios de entrenamiento; sustituirlas invalida el comportamiento esperado.
- No hay ablaciones controladas que demuestren beneficio causal de los aumentos de textura; el conjunto de validacion no es un benchmark de texturas no vistas ni de mundo real.
- Riesgo de sobreajuste al dominio simulado y a la apariencia concreta de los objetos; posibles fallos por cambios de iluminacion, textura o calibracion.
- Sesgos: no documentados; al entrenar solo en simulacion, puede heredar sesgos de los assets y fisicas del simulador.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantias de seguridad ni de rendimiento; el uso en produccion exigiria validacion propia.
- Reproducibilidad parcial: el arbol de trabajo de entrenamiento incluia anadidos de tareas que no estan en la revision Git base; las versiones de librerias se registran en `provenance/environment.json`.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhniu/smolvla-so101-tape100-leisaac-framewise
- Dataset: https://huggingface.co/datasets/zhniu/so101-tape100-leisaac-framewise
- Nota de contexto de investigacion: https://huggingface.co/datasets/zhniu/so101-tape100-leisaac-framewise/blob/main/RESEARCH_CONTEXT.md
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Fuente de metadatos del VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Paper citado: https://arxiv.org/abs/2603.22876v2
