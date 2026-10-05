# WetLabRoboData/diffusion-long_horizon3-scratch

## Resumen

diffusion-long_horizon3-scratch es una política robótica de difusión (diffusion policy) entrenada con la librería LeRobot de Hugging Face para la tarea denominada long_horizon3. Lo publica el usuario WetLabRoboData, aparentemente vinculado a experimentos de manipulación en entornos de laboratorio húmedo (wet lab). A diferencia de los modelos de lenguaje, no es un modelo generativo de texto: es un controlador visuomotor que mapea observaciones visuales y de estado del robot a secuencias de acciones, entrenado por imitación (imitation learning) sobre demostraciones humanas.

El modelo está diseñado para un robot UR3e bimanual equipado con tres cámaras. La variante "scratch" indica que se ha entrenado únicamente con los datos de esta tarea, sin partir de un checkpoint preentrenado. La arquitectura subyacente corresponde al enfoque Diffusion Policy, que formula la generación de acciones como un proceso de eliminación de ruido iterativo sobre una distribución de trayectorias.

Su relevancia es ante todo metodológica y de trazabilidad: forma parte de un conjunto de artefactos publicados de forma abierta (dataset, política y evaluación) bajo licencia Apache 2.0. Conviene señalar desde el principio que la propia model card reporta 0 éxitos en 19 episodios de evaluación, por lo que debe considerarse un experimento de investigación y no una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (familia LeRobot); subarquitectura concreta (CNN 1D U-Net o transformer) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explícita (LeRobot emplea habitualmente safetensors) |
| Libreria | lerobot |
| Robot objetivo | UR3e bimanual con 3 camaras |
| Tarea | long_horizon3 |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-long_horizon3 |
| Episodios de evaluacion | 19 |
| Exitos en evaluacion | 0 / 19 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de políticas de difusión aplicadas a robótica, popularizada por el trabajo Diffusion Policy (Chi et al., arXiv:2303.04137). En este paradigma, la política aprende a invertir un proceso de difusión: partiendo de ruido gaussiano, genera de forma iterativa una secuencia de acciones condicionada por las observaciones (imágenes de las tres cámaras y el estado de las articulaciones). Esto permite representar distribuciones multimodales de acciones, algo crítico en tareas de manipulación donde una misma observación puede admitir varias trayectorias válidas.

La variante "scratch" implica que el entrenamiento parte de pesos inicializados aleatoriamente y se realiza exclusivamente sobre el dataset WetLabRoboData/lerobot-data-long_horizon3, sin reutilizar un checkpoint preentrenado en otras tareas. La model card no especifica el número de tokens, el volumen exacto de demostraciones, la composición del dataset ni si se aplicaron técnicas de aumento de datos. Tampoco se detalla el número de pasos de difusión, la dimensión del espacio de acciones ni el esquema de horizonte de predicción y ejecución. La información de procedencia indica que el modelo se reorganizó el 4 de octubre de 2026 a partir del repositorio WetLabRoboData/lerobot-data-longhorizon3_renumbered_success, cuyos checkpoints, train_config.json y directorio wandb quedan archivados en la subcarpeta old/ del repositorio de origen para su trazabilidad.

## Capacidades

- Control visuomotor bimanual: genera comandos de acción para un robot UR3e de dos brazos a partir de observaciones de tres cámaras y del estado del robot.
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones humanas registradas en el dataset long_horizon3.
- Modelado de acciones multimodales: la formulación por difusión permite representar varias trayectorias válidas para una misma observación.
- Ejecución de tareas de horizonte largo: la tarea objetivo, long_horizon3, implica secuencias de manipulación con múltiples etapas.
- Integración con LeRobot: se carga mediante la API de LeRobot y es compatible con el ecosistema de entrenamiento y evaluación de dicha librería.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general (captioning, VQA) ni de audio.

## Casos de uso

- Investigación en políticas de difusión para robótica: sirve como implementación de referencia reproducible de una Diffusion Policy entrenada desde cero, con dataset y evaluación publicados de forma abierta.
- Baseline para comparación de métodos: al estar entrenada solo con los datos de la tarea long_horizon3, permite medir la mejora que aportan técnicas como el preentrenamiento, el ajuste fino o la cuantización de acciones frente a un entrenamiento desde cero.
- Automatización de tareas de laboratorio húmedo: el nombre de la organización y la tarea sugieren manipulación bimanual de material de laboratorio, un escenario donde la coordinación de dos brazos y la percepción con tres cámaras son relevantes.
- Estudio de fallos y análisis de rollout: los vídeos de evaluación y los resultados por episodio publicados facilitan el análisis cualitativo de por qué la política falla en las 19 pruebas registradas.
- Transferencia a tareas relacionadas: puede emplearse como punto de partida para ajuste fino en tareas bimanuales similares sobre el mismo hardware UR3e.
- Validación de infraestructura de despliegue robótico: útil para probar pipelines de inferencia en tiempo real con LeRobot antes de invertir en políticas con mejor tasa de éxito.
- Docencia y divulgación: ejemplo didáctico de extremo a extremo que abarca recolección de datos, entrenamiento, checkpoint y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible; dichos benchmarks no aplican a una política visuomotora.

El único dato de rendimiento reportado es la evaluación propia de la tarea:

| Metrica | Valor |
|---|---|
| Tarea | long_horizon3 |
| Episodios de evaluacion | 19 |
| Exitos | 0 |
| Tasa de exito | 0 % |
| Robot | UR3e bimanual (3 camaras) |

Los vídeos de rollout y los resultados por episodio están disponibles en el dataset WetLabRoboData/eval-diffusion-long_horizon3-scratch.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el número de parámetros ni el tamaño del checkpoint; al tratarse de una política de difusión con evaluación iterativa, el consumo depende del número de pasos de difusión y de la resolución de las tres cámaras.
- GPU recomendadas: no disponible en la información proporcionada. Para políticas de difusión de tamaño moderado son habituales GPU de gama media y alta (RTX 3090/4090, A100, H100), pero no se confirma para este modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada por el autor; plausible dada la escala típica de una Diffusion Policy, pero sin datos verificables.
- Opciones de despliegue: LeRobot (API oficial, según el ejemplo de la model card). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no aplica, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. En políticas de difusión, la latencia depende linealmente del número de pasos de eliminación de ruido, dato no especificado.

## Comparativa con modelos similares

| Modelo | Tarea | Robot | Entrenamiento | Episodios de eval | Exitos | Licencia |
|---|---|---|---|---|---|---|
| WetLabRoboData/diffusion-long_horizon3-scratch | long_horizon3 | UR3e bimanual (3 camaras) | Scratch, un solo dataset | 19 | 0 / 19 | apache-2.0 |
| tshiamor/diffusion_pack_blocks_long_horizon | pack_blocks, horizonte largo | no disponible en la busqueda | LeRobot diffusion | no disponible | no disponible | apache-2.0 |

El modelo tshiamor/diffusion_pack_blocks_long_horizon pertenece a la misma familia (Diffusion Policy de LeRobot) y también aborda una tarea de horizonte largo, pero se desconoce su hardware objetivo y sus resultados, por lo que la comparación cuantitativa no es posible. No se han identificado en la búsqueda otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- Tasa de éxito nula: la propia evaluación del autor reporta 0 aciertos en 19 episodios. No debe utilizarse en producción ni como componente crítico de un sistema real.
- Sesgos de demostración: al entrenarse solo con datos de una única tarea y presumiblemente de un único operador y entorno, la política hereda los sesgos de esas demostraciones y fallará ante variaciones de iluminación, disposición de objetos o configuraciones distintas.
- Sin datos de sobreajuste ni generalización: no se documenta el tamaño del dataset, el número de demostraciones ni si existe conjunto de validación separado.
- Sobreajuste a la tarea: la variante scratch no incorpora conocimiento previo de otras tareas, lo que suele reducir la robustez frente a perturbaciones.
- Alucinación: no aplica en el sentido de los modelos de lenguaje, pero la generación por difusión puede producir acciones no válidas o trayectorias fuera de la distribución aprendida, con riesgo físico para el robot y su entorno.
- Ausencia de información de seguridad: no se describen límites de par, espacios de trabajo permitidos ni mecanismos de parada de emergencia. Cualquier despliegue físico requiere supervisión y salvaguardas externas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No hay restricciones específicas de uso comercial documentadas.
- Idiomas y contexto: no aplica, ya que el modelo no procesa lenguaje ni texto.
- Trazabilidad: los datos de entrenamiento originales se reorganizaron y renumeraron, y los artefactos antiguos quedan archivados en la subcarpeta old/ del repositorio de origen; conviene revisarla para reproducir exactamente el entrenamiento.
- Adopción nula: cero descargas y cero likes en el momento de redactar esta ficha, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WetLabRoboData/diffusion-long_horizon3-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon3
- Dataset de evaluación (vídeos y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-long_horizon3-scratch
- Repositorio de origen archivado: WetLabRoboData/lerobot-data-longhorizon3_renumbered_success (subcarpeta old/)
- Paper de Diffusion Policy: https://arxiv.org/abs/2303.04137
- Modelo comparable en LeRobot: https://huggingface.co/tshiamor/diffusion_pack_blocks_long_horizon
- Librería LeRobot: https://github.com/huggingface/lerobot
- Revisión de modelos de difusión en robótica (Frontiers): https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2026.1905499/full
