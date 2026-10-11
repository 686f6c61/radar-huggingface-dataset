# sovrasov/flux3_policy_black_cubes_20k_v2-ema

## Resumen

`flux3_policy_black_cubes_20k_v2-ema` es una política robótica de imitación publicada por el usuario sovrasov en HuggingFace, construida sobre FLUX 3 Action (`flux3`), el modelo vídeo-acción de Black Forest Labs. La descripción del autor indica que se trata del tronco de vídeo FLUX.3 con una modalidad de acción que se desruidifica conjuntamente con los siguientes fotogramas de vídeo, y que se afina por cada embodiment robótico con cabezas de acción nuevas. En este caso, el ajuste se ha realizado para un robot `PhysicalAIRobot` con dos cámaras (`top` y `wrist`) y una tarea única: coger un cubo negro y depositarlo en un contenedor de cartón.

El checkpoint tiene 7.083.922.688 parámetros (unos 7,08 mil millones) en formato safetensors, con un repositorio de 14,4 GB, lo que es coherente con pesos en precisión de 16 bits. Se entrenó con LeRobot 0.6.2 durante 20.000 pasos, con batch size 2, optimizador AdamW y learning rate 1e-4, sobre el dataset `sovrasov/pick-black-cubes-room-2` (63 episodios, 24.859 fotogramas a 30 FPS). El sufijo `ema` del nombre sugiere que se publican pesos promediados exponencialmente (EMA), aunque la model card no lo detalla explícitamente.

Su relevancia es la de un ejemplo práctico y reproducible del flujo de trabajo de LeRobot para políticas VLA (vision-language-action) basadas en un modelo generativo de vídeo: entradas visuales y de estado de baja dimensión, salida de acciones continuas de 6 dimensiones y licencia Apache-2.0. No es un modelo de propósito general, sino una política especializada, sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo vídeo-acción derivado de FLUX.3 (tronco de vídeo con modalidad de acción desruidificada conjuntamente con los siguientes fotogramas); detalles internos de capas no disponibles |
| Parámetros totales | 7.083.922.688 (7,08 mil millones) |
| Parámetros activos | No aplica; no se describe una arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors (14,4 GB, compatible con pesos de 16 bits) |
| Idiomas soportados | No disponible (modelo de robótica; la tarea se especifica en inglés) |
| Licencia | Apache-2.0 (según la model card y las etiquetas del repositorio) |
| Formato de pesos | Safetensors |

Otros datos de la model card: tipo de robot `PhysicalAIRobot`, cámaras `top` y `wrist`, pipeline `robotics`, librería `lerobot`. Entradas: `observation.images.scene` (3, 256, 256), `observation.images.wrist` (3, 256, 256) y `observation.state` (6,). Salida: `action` (6,).

## Arquitectura y entrenamiento

La model card describe `flux3` como el tronco de vídeo FLUX.3 con una modalidad de acción que se desruidifica de forma conjunta con los siguientes fotogramas de vídeo, y que se afina por cada embodiment robótico con cabezas de acción nuevas. Es decir, se trata de un modelo generativo de vídeo adaptado a control robótico, no de un transformer de lenguaje con cabezas de acción añadidas. La información disponible no especifica el número de capas, la dimensión del modelo, el tipo de scheduler de difusión o flow matching, ni la longitud de contexto temporal del tronco de vídeo.

El ajuste se hizo con LeRobot 0.6.2 durante 20.000 pasos, batch size 2, optimizador AdamW, learning rate 0,0001 y semilla 42. El dataset de entrenamiento (`sovrasov/pick-black-cubes-room-2`) contiene 63 episodios y 24.859 fotogramas a 30 FPS (aproximadamente 829 segundos de datos) para una única tarea: "pick a black cube and move it to the cardboard bin". No se indica en la información proporcionada si hubo RLHF, DPO, aumento de datos o composición adicional del dataset. Tampoco se documenta ninguna innovación técnica específica más allá del esquema de desruidificación conjunta vídeo-acción descrito.

## Capacidades

- Generación de acciones de control continuas de 6 dimensiones a partir de observaciones visuales y de estado, en el bucle de control del robot.
- Política de imitación para manipulación tipo pick-and-place sobre la tarea concreta de recoger un cubo negro y depositarlo en un contenedor de cartón.
- Procesamiento conjunto de dos vistas de cámara a 256x256 píxeles (`observation.images.scene` y `observation.images.wrist`).
- Condicionamiento por instrucción de tarea en texto (`--task="pick a black cube and move it to the cardboard bin"`), según el ejemplo de uso de la model card.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecución con `lerobot-rollout`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento encadenado, visión general, audio ni modo de pensamiento. Son capacidades propias de modelos de lenguaje y no aplican a esta política.

## Casos de uso

- Automatización de pick-and-place en entorno controlado: recogida de cubos negros y depósito en un contenedor de cartón, replicando la tarea del dataset, siempre que el robot sea un `PhysicalAIRobot` con la misma disposición de cámaras.
- Punto de partida para fine-tuning de una tarea propia: al usar LeRobot como librería, se puede reentrenar con un dataset nuevo mediante `lerobot-train --policy.type=flux3`, partiendo de los pesos publicados o del tronco FLUX.3.
- Investigación en políticas vídeo-acción: sirve para estudiar el comportamiento de un modelo generativo de vídeo como política de control, comparando la desruidificación conjunta de vídeo y acción frente a enfoques de regresión directa de acciones.
- Evaluación e integración de pipelines de imitación: banco de pruebas para verificar la cadena completa de LeRobot (grabación, calibración, entrenamiento y rollout) con un caso de 63 episodios y 20.000 pasos.
- Reproducción y docencia: ejemplo mínimo y completo de política entrenada con LeRobot 0.6.2, con todos los hiperparámetros publicados (batch 2, lr 1e-4, seed 42), útil para cursos o tutoriales de aprendizaje por imitación.
- Clasificación y manipulación de objetos por color en logística ligera: con reentrenamiento sobre un dataset propio, la misma receta puede aplicarse a separación de piezas por color o forma en una célula de trabajo.
- Baseline para comparativas internas: al ser un checkpoint con pesos y configuración conocidos, permite medir mejoras de otras políticas sobre la misma tarea y el mismo hardware.
- Generación de datos y análisis de fallos: la ejecución con `--strategy.type=base` permite lanzar rollouts sin grabación, útil para inspeccionar el comportamiento en distintas posiciones de objeto o condiciones de iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la nota literal "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, ni número de ensayos, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 14,4 GB y el modelo tiene 7,08 mil millones de parámetros, lo que corresponde a pesos de 16 bits de aproximadamente 14,2 GB. Sumando activaciones para dos imágenes de 256x256 y un estado de 6 dimensiones, se puede estimar un pico de 15-17 GB, aunque no hay mediciones publicadas.
- En precisión fp32 los pesos ocuparían del orden de 28 GB.
- GPU recomendadas: cualquier GPU con 24 GB o más de VRAM (RTX 3090, RTX 4090, A6000, L40S, A100, H100). El entrenamiento y la ejecución se realizan con `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 3090 y RTX 4090 (24 GB) con pesos de 16 bits; en GPUs de 16 GB o menos no hay datos que confirmen que quepa sin cuantización, y no se documentan recetas de cuantización para esta política.
- Opciones de despliegue: LeRobot es la vía documentada (`lerobot-rollout` para inferencia en el robot, `lerobot-train` para entrenamiento). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a este tipo de política.
- Latencia y throughput: no hay mediciones publicadas. Como referencia del entorno de control, el dataset se grabó a 30 FPS, lo que implica que el bucle de control opera con pasos de aproximadamente 33 ms.
- Almacenamiento: se recomienda reservar al menos 15 GB para los pesos y espacio adicional para checkpoints de entrenamiento, que se escriben en `outputs/train/<policy_repo_id>/checkpoints/`.
- Requisitos adicionales: un robot `PhysicalAIRobot`, dos cámaras configuradas con los nombres de observación del modelo y un puerto serie concreto para el robot.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. Este checkpoint pertenece a la categoría de políticas VLA de imitación para robótica (junto con propuestas como las políticas `pi0`, `SmolVLA` o `GR00T`, integradas también en el ecosistema LeRobot), pero no se han facilitado en la búsqueda web ni parámetros, ni contexto, ni resultados de benchmark de esas alternativas que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sovrasov/flux3_policy_black_cubes_20k_v2-ema | 7,08 mil millones | No disponible | Pick-and-place de un cubo negro en un contenedor | Apache-2.0 | HuggingFace (LeRobot) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo especializado en una única tarea y un único embodiment: el ajuste se ha hecho para `PhysicalAIRobot` con cámaras `top` y `wrist` y la instrucción "pick a black cube and move it to the cardboard bin". Fuera de ese contexto, el comportamiento no está garantizado.
- Dataset muy reducido: 63 episodios y 24.859 fotogramas (unos 829 segundos a 30 FPS), lo que limita la diversidad de posiciones, iluminación y configuraciones de objetos vistas durante el entrenamiento.
- Sensibilidad a cambios en el entorno: variaciones en la posición de los cubos, iluminación, presencia de distractores o cambios en la escena pueden degradar el rendimiento. No hay datos de robustez publicados.
- Sin evaluación publicada: no existen tasas de éxito ni ensayos en robot real, por lo que no es posible estimar la fiabilidad en producción.
- Riesgo de acciones erráticas o inseguras: al ser una política generativa, puede producir trayectorias no previstas. En un robot real esto exige límites de par, paradas de emergencia y supervisión humana.
- Dependencia de las claves de observación: las cámaras deben nombrarse exactamente como `observation.images.scene` y `observation.images.wrist` para que coincidan con las entradas del modelo.
- Sesgos: no se documentan análisis de sesgo. Al depender de datos visuales de un único entorno, la política puede heredar sesgos de la distribución de posiciones y del fondo de la sala de grabación.
- Alucinación: no aplica en el sentido de texto inventado, pero sí en el sentido de generar acciones plausibles pero incorrectas respecto al objetivo, dado que no hay verificación semántica del estado del mundo.
- Licencia: el checkpoint se publica como Apache-2.0, lo que permite uso comercial. Sin embargo, la model card no especifica los términos del modelo base FLUX.3 de Black Forest Labs ni si existen restricciones adicionales derivadas de él; conviene verificar la licencia del modelo original antes de un uso comercial.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, y fechas de creación y actualización muy próximas (10 de octubre de 2026), lo que indica ausencia de validación por parte de la comunidad.
- La información disponible no detalla la arquitectura interna, la longitud de contexto temporal ni soporte de cuantización, lo que dificulta planificar su despliegue en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sovrasov/flux3_policy_black_cubes_20k_v2-ema
- Dataset de entrenamiento: https://huggingface.co/datasets/sovrasov/pick-black-cubes-room-2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sovrasov/pick-black-cubes-room-2
- Guía de LeRobot para flux3: https://huggingface.co/docs/lerobot/main/en/flux3
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (Cadene et al., 2024): incluida en la model card del repositorio
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo, el autor o FLUX.3 Action; los resultados obtenidos no guardan relación con el contenido de esta ficha.
