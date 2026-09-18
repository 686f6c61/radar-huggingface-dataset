# tsangb34/pi05-so101-stack-white_bowls-100episodes

## Resumen

El modelo `tsangb34/pi05-so101-stack-white_bowls-100episodes` es un fine-tune de robótica del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos. La implementación disponible en este repositorio es la adaptación a LeRobot del repositorio OpenPI de los autores originales. El modelo resuelve una tarea concreta de manipulación: coger el cuenco de plástico blanco de la derecha y apilarlo sobre el cuenco blanco de la izquierda, usando un brazo seguidor SO (`so_follower`).

Técnicamente es una política de imitación que consume estado proprioceptivo (6 dimensiones) y tres flujos de imagen (dos cámaras a 480x640 y una tercera a 224x224) y produce un vector de acción de 6 dimensiones. El checkpoint publicado tiene 4.143.404.816 parámetros y un tamaño de repositorio de 9,4 GB en formato safetensors. Se entrenó durante 4690 pasos con batch size 32, optimizador AdamW y learning rate 2.5e-05 sobre un dataset de 100 episodios y 25.012 fotogramas grabados a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento de una política VLA y despliegue en robot real), y como punto de partida para fine-tunes adicionales. No es un modelo de lenguaje generalista, no tiene benchmarks publicados y no cuenta con evaluaciones de tasa de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), π₀.₅ (Pi05) adaptado a LeRobot desde OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponible. La politica consume una instruccion de tarea en lenguaje natural; la unica tarea documentada esta redactada en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (fine-tune) |
| Tipo de robot | so_follower (brazo seguidor SO de LeRobot) |
| Camaras de entrada | front, wrist (480x640) y empty_camera_0 (224x224) |
| Entradas | observation.state (6,), observation.images.front (3,480,640), observation.images.wrist (3,480,640), observation.images.empty_camera_0 (3,224,224) |
| Salidas | action (6,) |
| Tamano del repositorio | 9,4 GB |
| Libreria | lerobot |

## Arquitectura y entrenamiento

La model card describe el modelo como un Vision-Language-Action (VLA) de la familia π₀.₅ de Physical Intelligence, diseñado para generalizar a entornos y situaciones nuevos no vistos durante el entrenamiento, y evoluciona el modelo π₀ anterior. La implementación incluida en este repositorio es la adaptación a LeRobot del repositorio OpenPI de los autores. La información proporcionada no detalla el backbone concreto (por ejemplo, el codificador visual y el mecanismo de generación de acciones), por lo que esos detalles internos quedan como no disponibles.

El entrenamiento se realizó por fine-tuning supervisado del modelo base `lerobot/pi05_base` sobre el dataset `Jiamo0912/robocolosseum-so101-stack-white_bowls-100episodes`, compuesto por 100 episodios y 25.012 fotogramas grabados a 30 FPS de una única tarea: apilar un cuenco de plástico blanco sobre otro. La configuración de entrenamiento publicada es de 4690 pasos, batch size 32, optimizador AdamW, learning rate 2.5e-05, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni de ninguna técnica de alineación adicional, ni innovaciones técnicas específicas más allá de las propias de la familia π₀.₅.

## Capacidades

- Generación de acciones de manipulación: produce un vector de acción continuo de 6 dimensiones a partir del estado del robot y de las imágenes.
- Percepción visual multivista: procesa simultáneamente dos cámaras de 480x640 (frontal y de muñeca) y una tercera cámara de 224x224.
- Condicionamiento por instrucción de lenguaje natural: la política recibe un texto de tarea; el único documentado es "Pick up the white plastic bowl on the right and stack it on top of the white plastic bowl on the left."
- Ejecución de una tarea concreta de apilado de objetos sobre un brazo `so_follower`.
- Integración con el ecosistema LeRobot: permite ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, generación de código, matemáticas, audio, visión general o modo de razonamiento. Se trata de una política robótica, no de un modelo de lenguaje.
- No se documentan capacidades multilingües.

## Casos de uso

- Automatización de apilado de piezas en un banco de laboratorio: el modelo ejecuta directamente la secuencia de coger el cuenco de la derecha y colocarlo sobre el de la izquierda con un brazo SO, siempre que se repliquen las condiciones de cámara y la distribución de objetos del dataset.
- Reproducción de experimentos en investigación VLA: sirve como referencia para comparar metodologías de imitación con un número de episodios y una configuración de entrenamiento conocidos (100 episodios, 4690 pasos, batch 32).
- Punto de partida para nuevos fine-tunes: al derivar de `lerobot/pi05_base`, se puede reentrenar con `lerobot-train` sobre datasets propios para tareas de manipulación distintas, conservando el pipeline de LeRobot.
- Validación de un pipeline de despliegue extremo a extremo: permite comprobar la cadena completa de hardware, calibración de cámaras, sincronización y ejecución con `lerobot-rollout` antes de invertir en datasets mayores.
- Docencia y formación en robótica de imitación: al apoyarse en hardware de bajo coste y en LeRobot, es un ejemplo práctico para enseñar el ciclo recogida de datos, entrenamiento y despliegue.
- Pruebas de robustez y sensibilidad: útil para estudiar cómo afectan los cambios de posición de los objetos, la iluminación o la presencia de distractores al rendimiento de una política entrenada con pocos episodios.
- Evaluación comparativa de políticas sobre el mismo robot: puede confrontarse con otras políticas ejecutables en LeRobot para medir tiempos de inferencia y comportamiento cualitativo en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación explícitamente vacía ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito, número de ensayos ni métrica alguna sobre robot real o simulado. Tampoco se proporcionan datos de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 8,3 GB; sumando activaciones de las tres cámaras y buffers de inferencia, se estima un rango de 12 a 16 GB. En fp32 los pesos solos ocuparían unos 16,6 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- Cuantizaciones: no hay variantes cuantizadas publicadas. En int8 los pesos rondarían los 4,2 GB y en int4 los 2,1 GB, pero no se ofrece soporte oficial ni conversiones listas para usar.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para ejecución cómoda en bf16; A100 o H100 para entrenamiento y experimentación a mayor escala.
- GPU de consumo: sí cabe en tarjetas de 24 GB y, con margen ajustado, en tarjetas de 16 GB si se reduce la resolución efectiva o se aplica cuantización no oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) sobre PyTorch con CUDA. No es compatible con servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. Únicamente se conoce que los datos de entrenamiento se grabaron a 30 FPS, lo que no implica que la política infiera a esa cadencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-stack-white_bowls-100episodes | 4,14 mil millones | No disponible | Sin datos de evaluacion publicados | Apache 2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| lerobot/pi05_base | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | Hugging Face, referenciado como modelo base de este fine-tune |
| Otras politicas VLA de la misma categoria (pi0, SmolVLA, GR00T) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

El único punto de comparación documentado es el modelo base `lerobot/pi05_base`, del que este checkpoint deriva por fine-tuning sobre una tarea única. No se dispone de datos objetivos para comparar parámetros, contexto ni rendimiento con alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni ensayos, ni condiciones de prueba, por lo que no se puede afirmar que la tarea se resuelva de forma fiable.
- Dataset muy reducido y de una sola tarea: 100 episodios y 25.012 fotogramas sobre un único objeto (cuenco de plástico blanco). El riesgo de sobreajuste y de fallo ante objetos, colores o posiciones distintas es alto.
- Dependencia estricta de la configuración de sensores: el nombre y el orden de las claves de observación (`observation.images.front`, `observation.images.wrist`, `observation.images.empty_camera_0`) y las resoluciones deben coincidir con los del entrenamiento; cualquier discrepancia impide el funcionamiento correcto.
- Atado a un tipo de robot: solo se documenta para `so_follower`; no hay evidencia de transferencia a otras morfologías.
- Sesgos: no se han documentado sesgos específicos, pero la política hereda las limitaciones de su dataset y del modelo base.
- Riesgo de acciones erróneas fuera de distribución: en un modelo de este tipo, el equivalente funcional a la alucinación es la generación de trayectorias no válidas ante escenas no vistas, con riesgo físico para el entorno y el propio robot. Se recomienda supervisión y paradas de seguridad.
- Idiomas: no se documenta soporte multilingüe; la única instrucción conocida está en inglés y no se especifica cómo se comporta con textos en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial del checkpoint, pero debe verificarse por separado la licencia del dataset de entrenamiento y la del modelo base.
- Falta de validación comunitaria: 0 descargas y 0 likes, sin issues ni discusiones que permitan contrastar su comportamiento real.
- Sin cuantizaciones ni formatos alternativos: no hay versiones GGUF, ONNX u otras que faciliten el despliegue en hardware limitado.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces recuperados correspondían a un portal de noticias sin relación con el tema, por lo que no se han podido incorporar fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsangb34/pi05-so101-stack-white_bowls-100episodes
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Jiamo0912/robocolosseum-so101-stack-white_bowls-100episodes
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita del modelo (LeRobot): Cadene, Remi et al., "LeRobot", 2024
