# WetLabRoboData/diffusion-long_horizon3-finetuned

## Resumen

diffusion-long_horizon3-finetuned es una política robótica de difusión (diffusion policy) desarrollada por WetLabRoboData y publicada en Hugging Face dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador de aprendizaje por imitación que mapea observaciones sensoriales (tres cámaras más el estado del robot) a trayectorias de acción sobre un robot UR3e bimanual. El checkpoint está especializado en la tarea denominada long_horizon3, de horizonte largo y manipulación con dos brazos.

El modelo no se ha entrenado desde cero: parte de WetLabRoboData/diffusion-multitask_12task_mix-multitask, un modelo multitarea, y se afina después sobre el conjunto de datos específico de la tarea. Esta estructura de preentrenamiento multitarea más fine-tuning por tarea es la aportación metodológica principal que documenta la model card.

Su relevancia práctica es acotada y conviene decirlo con claridad: en el momento de redactar esta ficha acumula 0 descargas y 0 «likes», y la propia model card reporta 3 éxitos en 20 episodios de evaluación (15 %). Se trata, por tanto, de un artefacto de investigación y trazabilidad reproducible más que de un componente listo para producción. La información publicada no incluye número de parámetros, requisitos de hardware ni comparativas con otras políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (diffusion policy) de LeRobot para control robótico; no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica el concepto de ventana de contexto de un LLM; la model card no publica el horizonte de observación ni el de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio es de tipo LeRobot y se carga con `DiffusionPolicy.from_pretrained`; la model card no especifica el formato de serialización) |
| Familia de politica | diffusion (LeRobot) |
| Variante | Fine-tuning de un preentrenamiento multitarea sobre el conjunto de fine-tuning de esta tarea |
| Tarea objetivo | long_horizon3 |
| Robot | UR3e bimanual con 3 camaras |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-long_horizon3 |
| Modelo base | WetLabRoboData/diffusion-multitask_12task_mix-multitask |
| Episodios de evaluacion | 20 |
| Exitos en evaluacion | 3 / 20 (15 %) |
| Libreria | lerobot |
| Pipeline declarado | robotics |
| Fecha de creacion / actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La política pertenece a la familia de diffusion policies de LeRobot: en lugar de predecir una acción de forma directa y determinista, el modelo aprende una distribución sobre secuencias de acciones y genera muestras mediante un proceso de difusión. En la práctica, esto permite representar modos múltiples de comportamiento (por ejemplo, aproximaciones distintas a un mismo punto de agarre) y produce trayectorias más suaves que una regresión directa, a costa de requerir varios pasos de denoising por cada bloque de acciones.

El entrenamiento es de aprendizaje por imitación (imitation learning) en dos fases: un preentrenamiento multitarea sobre doce tareas mezcladas, del que resulta el modelo base, seguido de un fine-tuning sobre el conjunto de datos WetLabRoboData/lerobot-data-long_horizon3. El sistema recibe tres cámaras y el estado del robot UR3e bimanual como entrada. No se documenta en la información disponible el número de tokens, el número de episodios de demostración, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO, que por otra parte no son habituales en este tipo de políticas. Tampoco se detalla ningún mecanismo de decodificación especulativa ni innovación arquitectónica adicional más allá del esquema de difusión estándar de LeRobot.

Existe una traza de procedencia: el modelo se reorganizó el 2026-10-04 a partir de WetLabRoboData/lerobot-data-rama-lbm_finetune_longhorizon3_cam_reorient, y los artefactos de entrenamiento originales (checkpoints, `train_config.json`, directorio `wandb/`) se conservan en la subcarpeta `old/` de ese repositorio de origen.

## Capacidades

- Generación de trayectorias de acción para control robótico bimanual, condicionadas por tres vistas de cámara y por el estado del robot.
- Ejecución de la tarea long_horizon3, que implica secuencias de manipulación de horizonte largo (varios pasos encadenados antes de completar el objetivo).
- Control de un UR3e bimanual, es decir, coordinación de dos brazos en lugar de un único efector.
- Generalización limitada desde el preentrenamiento multitarea de doce tareas hacia la tarea específica, por efecto del fine-tuning.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso simbólico ni planificación basada en lenguaje.
- No dispone de capacidades multilingües, de visión general (captioning, VQA, detección abierta) ni de audio.
- No dispone de modo de razonamiento explícito (thinking mode).
- La única capacidad especial documentada es el uso de difusión para la generación de acciones, con evaluación publicada en forma de vídeos de rollout y resultados por episodio.

## Casos de uso

- Automatización de manipulación bimanual en laboratorio húmedo: el modelo está entrenado sobre datos de un UR3e con dos brazos y tres cámaras, un montaje típico de preparación de muestras; puede emplearse para ejecutar la secuencia long_horizon3 sin intervención humana, siempre que el entorno permanezca dentro de la distribución de las demostraciones.
- Punto de partida para fine-tuning de tareas propias: dado que deriva de un modelo multitarea y se ha afinado con éxito relativo sobre una tarea concreta, sirve como inicialización para reentrenar la política con datos propios en lugar de partir de cero, reduciendo el número de demostraciones necesarias.
- Baseline en investigación sobre aprendizaje por imitación: permite comparar el esquema de difusión de LeRobot frente a otras familias de políticas (por ejemplo, políticas de acción continua más simples) bajo el mismo robot y el mismo conjunto de datos, aislando el efecto de la arquitectura.
- Evaluación reproducible de políticas robóticas: el repositorio publica vídeos de rollout y resultados por episodio en WetLabRoboData/eval-diffusion-long_horizon3-finetuned, lo que permite replicar y auditar la medición del 15 % de éxito sin depender de una ejecución propia.
- Reutilización del hardware existente en un laboratorio con UR3e: al estar serializado como política LeRobot, se integra en un flujo ya montado sobre ese robot bimanual de tres cámaras sin necesidad de sustituir el banco de pruebas.
- Estudio del salto de multitarea a tarea única: la pareja formada por el modelo base de doce tareas y este fine-tuning permite analizar cuánto se gana y cuánto se olvida al especializar una política de difusión, un fenómeno relevante para diseñar currículos de entrenamiento.
- Registro de trayectorias para análisis de fallos: los rollouts almacenados permiten inspeccionar en qué punto de la secuencia de horizonte largo se interrumpe la tarea en los 17 episodios fallidos, útil para diagnosticar si el problema es de percepción (cámaras), de coordinación entre brazos o de horizonte de planificación.
- Teleoperación supervisada con asistencia: con un operador que supervise y corrija, la política puede emplearse para acelerar la recogida de nuevas demostraciones sobre el mismo robot, generando datos que alimenten una siguiente iteración de fine-tuning.

## Benchmarks y rendimiento

La única evaluación publicada en la información disponible es la de la tarea objetivo, con resultados discretos:

| Tarea | Metrica | Episodios | Exitos | Tasa de exito |
|---|---|---|---|---|
| long_horizon3 | Exito de episodio en rollout real | 20 | 3 | 15 % |

No se han publicado resultados de benchmarks en la información disponible para métricas habituales de políticas robóticas (por ejemplo, error de posición, tasa de éxito por subtarea o comparación contra otros checkpoints de la misma familia). Los vídeos de rollout y los resultados por episodio están alojados en WetLabRoboData/eval-diffusion-long_horizon3-finetuned.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el número de parámetros ni el consumo de memoria del checkpoint.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. No puede confirmarse ni descartarse que quepa en una GPU de gama de consumo, ya que se desconoce el tamaño del modelo.
- Robot necesario: UR3e bimanual con tres cámaras, según la model card. No es un modelo desplegable sin el hardware robótico correspondiente.
- Opciones de despliegue: la vía documentada es la librería LeRobot, cargando la política con `DiffusionPolicy.from_pretrained("WetLabRoboData/diffusion-long_horizon3-finetuned")`. No se documentan opciones de despliegue adicionales (vLLM, llama.cpp, Ollama o TGI no son aplicables a una política de control robótico).
- Latencia y throughput estimados: no disponibles. Conviene tener en cuenta que una política de difusión requiere varios pasos de denoising por bloque de acciones, por lo que la frecuencia de control real depende del hardware de cómputo y no puede estimarse sin el dato de parámetros.
- Consideración de despliegue: al tratarse de una política de imitación con un 15 % de éxito medido, cualquier puesta en marcha con el robot físico debería contemplar parada de emergencia, limitación de fuerzas y supervisión humana.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Relacion | Parametros | Contexto | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| WetLabRoboData/diffusion-long_horizon3-finetuned | Este modelo | no disponible | no disponible | 3/20 exitos (15 %) en long_horizon3 | apache-2.0 |
| WetLabRoboData/diffusion-multitask_12task_mix-multitask | Modelo base del fine-tuning (misma familia, 12 tareas) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| Otras politicas de LeRobot (ACT, entre otras) o politicas de otras familias | Alternativas de la misma categoria funcional | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no devolvió resultados específicos sobre este modelo ni sobre políticas de difusión comparables para el mismo robot; los enlaces recuperados (curso de difusión de Hugging Face, finetrainers, Civitai, NVIDIA AI Workbench, Unsloth) tratan sobre ajuste fino de modelos generativos de imagen o de lenguaje y no aportan datos aplicables a esta política robótica.

## Limitaciones y advertencias

- Rendimiento medido bajo: 3 éxitos en 20 episodios (15 %) en la propia evaluación del autor. No es un modelo apto para operación autónoma sin supervisión.
- Sesgos conocidos: no disponible. No se documenta análisis de sesgo, y en este dominio el equivalente serían sesgos de distribución hacia las condiciones concretas del laboratorio donde se recogieron las demostraciones (iluminación, disposición de objetos, posición inicial del robot).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe el riesgo análogo de generar trayectorias plausibles y físicamente inviables ante observaciones fuera de distribución, sin que el modelo señale incertidumbre de forma explícita.
- Limitaciones de contexto: la política está especializada en una única tarea, long_horizon3. No se ha evaluado su comportamiento en otras tareas y la información disponible no indica su grado de olvido catastrófico tras el fine-tuning desde el modelo multitarea.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje natural.
- Dependencia de hardware específico: requiere un UR3e bimanual con tres cámaras para reproducir la evaluación publicada. Cualquier cambio de robot, número de cámaras o calibración invalida los resultados reportados.
- Licencia: Apache 2.0, que permite uso comercial, modificación y redistribución siempre que se conserven los avisos de copyright y licencia y se indique los cambios realizados. Al ser un modelo derivado de otro modelo Apache 2.0, conviene verificar las condiciones del modelo base.
- Caveats de producción: los requisitos de cómputo son desconocidos, no hay soporte de cuantización documentado y el modelo no declara garantías de seguridad. Cualquier despliegue sobre hardware físico debe incorporar límites de fuerza, parada de emergencia y validación en banco antes de operar con materiales reales.
- Madurez del artefacto: 0 descargas y 0 «likes» en el momento de la consulta, sin tercera parte que haya validado los resultados de forma independiente.
- Trazabilidad: el modelo se reorganizó el 2026-10-04 desde otro repositorio; los artefactos originales quedan en la subcarpeta `old/` del repositorio de origen, lo que conviene revisar si se necesita reconstruir el entrenamiento exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-long_horizon3-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon3
- Modelo base (multitarea, 12 tareas): https://huggingface.co/WetLabRoboData/diffusion-multitask_12task_mix-multitask
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-long_horizon3-finetuned
- Repositorio de origen citado en la model card (id: WetLabRoboData/lerobot-data-rama-lbm_finetune_longhorizon3_cam_reorient, con la carpeta `old/`)
- Documentacion de la libreria LeRobot, referenciada como `library_name` en la model card: no se proporciono URL en la informacion disponible.
- La busqueda web realizada no devolvio enlaces especificos sobre este modelo ni sobre politicas roboticas comparables.
