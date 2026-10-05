# WetLabRoboData/diffusion-blue_dispense-scratch

## Resumen

`WetLabRoboData/diffusion-blue_dispense-scratch` es una política de robotica basada en difusion (diffusion policy) entrenada con la libreria LeRobot para una unica tarea de manipulacion bimanual denominada `blue_dispense`. Lo publica el usuario WetLabRoboData y esta pensado para el robot UR3e en configuracion bimanual con tres camaras. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones visuales y del estado del robot, genera secuencias de acciones (action chunks) para ejecutar la tarea.

El modelo tiene 262.813.047 parametros (unos 262,8 M) y se distribuye como un unico repo de 1,1 GB en formato safetensors bajo licencia Apache-2.0. La variante es "scratch", es decir, entrenada exclusivamente con los datos de esta tarea y no derivada de un modelo previo de proposito general. El autor reporta 19 exitos sobre 20 episodios de evaluacion en la tarea objetivo, con los videos y resultados por episodio publicados en un dataset aparte.

Su relevancia es acotada pero clara: sirve como referencia reproducible de diffusion policy en un dominio de laboratorio humedo (dispensacion de liquidos), como base para fine-tuning con demostraciones propias y como punto de comparacion frente a otras familias de politicas de LeRobot (ACT, VLA). El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot), politica visuomotora condicionada por observaciones; no es un transformer de lenguaje |
| Parametros totales | 262.813.047 (262,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de LLM; opera sobre un horizonte de observacion y predice un chunk de acciones) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin variantes GGUF ni cuantizaciones distribuidas |
| Idiomas soportados | No disponible (el modelo no procesa texto ni lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |
| Libreria | lerobot |
| Pipeline | robotics |
| Tarea objetivo | blue_dispense |
| Robot | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-blue_dispense |
| Episodios de evaluacion | 20 (19 exitos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la familia de diffusion policies implementada en LeRobot, derivada del planteamiento de Diffusion Policy (Chi et al., 2023): una red que aprende la distribucion condicional de secuencias de acciones mediante un proceso de difusion (ruido añadido y denoised iterativamente), condicionada por observaciones visuales de las tres camaras y por el estado del robot. En lugar de predecir una accion unica, la politica genera un chunk de acciones, lo que mejora la estabilidad temporal en tareas de manipulacion. La informacion proporcionada no detalla el desglose de capas, el numero de pasos de difusion en inferencia, el tipo de encoder visual ni la resolucion de las imagenes.

El entrenamiento es de imitacion (imitation learning) supervisado sobre demostraciones, sin indicios de RLHF ni DPO en la informacion disponible. La variante "scratch" implica que no se parte de un checkpoint previo de otra tarea. El autor indica que los pesos se reorganizaron el 2026-10-04 a partir de `WetLabRoboData/lerobot-data-smrithi-blue_dispense_20260617`, y que los artefactos originales de entrenamiento (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` de ese repo de origen para trazabilidad. No se especifican el numero de episodios de demostracion, el numero de tokens/pasos de entrenamiento, la composicion del dataset ni el algoritmo de difusion concreto (DDPM o DDIM).

## Capacidades

- Generacion de acciones de manipulacion bimanual para el robot UR3e en la tarea `blue_dispense`, a partir de observaciones de tres camaras y del estado del robot.
- Control visuomotor de extremo a extremo (percepcion y accion en un unico modelo), sin necesidad de un pipeline de vision separado.
- Prediccion de secuencias de acciones (action chunking), lo que aporta coherencia temporal frente a politicas de accion unica.
- Ejecucion reproducible mediante la API de LeRobot: `DiffusionPolicy.from_pretrained(...)`.
- Adaptabilidad por fine-tuning a otras tareas de laboratorio usando el mismo flujo de LeRobot y nuevas demostraciones.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso simbolico ni planificacion de alto nivel.
- No dispone de capacidades multilingues ni de procesamiento de texto, audio o vision generalista (la vision esta especializada en las camaras de la tarea).

## Casos de uso

- Automatizacion de la dispensacion de liquidos en un laboratorio humedo: el modelo ejecuta la tarea `blue_dispense` con el UR3e bimanual, sustituyendo la operacion manual repetitiva por una politica entrenada sobre demostraciones de la propia tarea, con una tasa de exito reportada del 95 % en 20 episodios.
- Fine-tuning a nuevas tareas de laboratorio: al ser una variante "scratch" con licencia Apache-2.0, se puede reentrenar con demostraciones propias (pipeteo, trasvase, colocacion de placas) reutilizando la configuracion de LeRobot y las tres camaras ya definidas.
- Baseline en investigacion de imitation learning: sirve como punto de comparacion controlado frente a ACT, SmolVLA u otras politicas de LeRobot, midiendo exito por episodio sobre el mismo dataset y hardware.
- Automatizacion de protocolos repetitivos de bajo volumen: integrado en una celda robotizada, el modelo puede encargarse de la fase de dispensacion mientras un planificador externo gestiona la secuencia de placas y reactivos.
- Laboratorios autononos ("self-driving labs"): como modulo de bajo nivel dentro de una arquitectura mayor, donde un sistema de planificacion decide que dispensar y esta politica ejecuta el movimiento fino.
- Validacion de reproducibilidad interna: el par modelo + dataset de evaluacion (`eval-diffusion-blue_dispense-scratch`) permite repetir los 20 episodios y auditar la tasa de exito antes de desplegar cambios de hardware o iluminacion.
- Estudio de robustez ante variaciones de entorno: se puede evaluar como cambia la tasa de exito al mover las camaras, cambiar la iluminacion o introducir objetos distintos en la escena, ya que la politica depende fuertemente de la configuracion visual de entrenamiento.
- Docencia y prototipado rapido: ejemplo completo y ligero (262,8 M de parametros) para montar un bucle de imitation learning de principio a fin con LeRobot en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un modelo de control robotico. El unico dato de rendimiento disponible es la evaluacion de la tarea objetivo reportada por el autor.

| Metrica | Resultado | Contexto |
|---|---|---|
| Tasa de exito en blue_dispense | 19 / 20 episodios (95 %) | Evaluacion propia del autor, UR3e bimanual con 3 camaras |
| Comparacion con otras politicas | No disponible | La model card no incluye comparativas |

El intervalo de confianza de una tasa 19/20 con n = 20 es amplio (aproximadamente 75-99,9 % al 95 % de confianza), por lo que el dato debe tomarse como indicativo y no como una estimacion precisa de la robustez en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,05 GB solo para los pesos en FP32 (262,8 M de parametros) y unos 0,53 GB en FP16/BF16. Sumando el encoder visual (tres camaras), activaciones y el bucle iterativo de denoising, es razonable reservar entre 2 y 4 GB de VRAM; no hay mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para pruebas; para control en tiempo real se recomienda una RTX 4090, RTX 3090, A100 o H100, ya que la latencia del bucle de control depende del numero de pasos de difusion y del encoder visual.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de consumo modernas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). El cuello de botella no es la memoria sino la latencia de los pasos de denoising.
- Opciones de despliegue: LeRobot con PyTorch (via `DiffusionPolicy.from_pretrained`), ejecucion local en el PC de control del robot. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia general de la familia, las diffusion policies requieren multiples iteraciones de denoising por cada chunk de acciones, lo que limita la frecuencia de control efectiva; conviene medirla en el hardware objetivo antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-blue_dispense-scratch | 262,8 M | No disponible | 19/20 en blue_dispense | Apache-2.0 | HuggingFace (0 descargas) |
| Otras diffusion policies de LeRobot | No disponible | No disponible | No disponible | Depende del repo | HuggingFace |
| ACT (Action Chunking Transformer, LeRobot) | No disponible | No disponible | No disponible | Depende del repo | HuggingFace / repositorio LeRobot |
| Politicas VLA (por ejemplo SmolVLA) | No disponible | No disponible | No disponible | Depende del repo | HuggingFace |

No se dispone de datos numericos comparables en la informacion proporcionada; la comparativa queda por tanto cualitativa. La diferencia principal frente a ACT es el mecanismo generativo (difusion frente a regresion directa del chunk de acciones) y frente a las politicas VLA, el alcance (tarea unica frente a instrucciones en lenguaje natural).

## Limitaciones y advertencias

- Especializacion extrema: esta entrenada unicamente para la tarea `blue_dispense` con un UR3e bimanual y tres camaras; no generaliza a otras tareas, robots ni configuraciones de sensores sin reentrenamiento.
- Sin validacion externa: 0 descargas y 0 likes, y una evaluacion de solo 20 episodios realizada por el propio autor. No hay evaluacion independiente.
- Riesgo de sobreajuste al entorno: las diffusion policies son sensibles a cambios en posicion de camaras, iluminacion, fondo y apariencia de los objetos; se espera degradacion de la tasa de exito fuera de las condiciones de recogida de datos.
- Reproducibilidad limitada: no se documentan en la model card el numero de episodios de demostracion, la composicion del dataset, la semilla ni la configuracion exacta de entrenamiento (los artefactos quedan en `old/` del repo de origen).
- Sin capacidades de lenguaje, tool calling, agentes ni razonamiento: no debe evaluarse con benchmarks de LLM ni usarse como sustituto de un modelo de lenguaje.
- Idiomas: no aplica; el modelo no procesa texto.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia y del fichero NOTICE si existe. Es responsabilidad del usuario verificar las condiciones del dataset de entrenamiento y del software LeRobot, asi como la normativa aplicable al entorno de laboratorio.
- Riesgo operativo en produccion: un fallo de la politica puede provocar colisiones o dispensacion incorrecta; se recomienda limitar fuerzas, usar parada de emergencia y validar en un entorno controlado.
- Trazabilidad: el modelo se reorganizo el 2026-10-04 desde otro repositorio; conviene revisar el repositorio de origen si se necesita reconstruir el proceso de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-blue_dispense-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-blue_dispense
- Dataset de evaluacion (videos y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-blue_dispense-scratch
- Repositorio de origen con artefactos de entrenamiento archivados: https://huggingface.co/WetLabRoboData/lerobot-data-smrithi-blue_dispense_20260617
- LeRobot (libreria y politicas): https://github.com/huggingface/lerobot
- Diffusion Policy (referencia del metodo): https://diffusion-policy.cs.columbia.edu/
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
