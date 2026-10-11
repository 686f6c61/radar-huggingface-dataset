# themohal/saraiki-libero-smolvla-bilingual

## Resumen

Saraiki-libero-smolvla-bilingual es un ajuste fino (fine-tune) del modelo SmolVLA, un modelo compacto de vision-lenguaje-acción (VLA) desarrollado originalmente por Hugging Face y publicado con la librería LeRobot. El ajuste lo firma el usuario themohal y parte del checkpoint base `lerobot/smolvla_base`. Su función es actuar como política de control para un brazo robótico tipo Panda: consume dos imágenes de cámara y el estado del robot, y produce un vector de acción de 7 dimensiones que mueve el manipulador para completar tareas de manipulación dictadas por instrucciones en lenguaje natural.

El modelo tiene 604.934.176 parámetros (~605 millones) y está especializado en tareas domésticas de tipo pick-and-place sobre mesa: colocar tazas, abrir y cerrar cajones, meter objetos en el microondas, encender fogones o guardar productos en cestas. La particularidad del ajuste es que las instrucciones del dataset están en saraiki, una lengua indoaria de bajos recursos hablada en Pakistán, además de variantes bilingües. Esto lo convierte en un caso poco habitual de VLA entrenado para seguir órdenes en un idioma minoritario.

Es relevante ahora por dos motivos: primero, porque SmolVLA demuestra que un modelo de acción de menos de mil millones de parámetros puede ejecutarse en hardware de consumo, abaratando la experimentación en robótica; segundo, porque ejemplifica el uso de modelos VLA abiertos para lenguas de bajos recursos. El repositorio tiene 0 descargas y 0 likes, por lo que se trata de un modelo recién publicado y sin validación externa conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA |
| Parametros totales | 604.934.176 (~605 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors a precision completa |
| Idiomas soportados | no disponible; las instrucciones del dataset estan redactadas en saraiki (variantes bilingues) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

Se trata de una política de robot basada en SmolVLA, la arquitectura descrita en el paper arXiv:2506.01844. SmolVLA es un modelo de vision-lenguaje-accion compacto: combina un modelo de vision-lenguaje reducido con un componente experto en acciones, y está pensado para conseguir un rendimiento competitivo con un coste computacional bajo, de forma que pueda desplegarse en hardware de consumo. En este ajuste concreto, la política consume dos señales visuales (`observation.images.image` y `observation.images.image2`, ambas de forma `(3, 256, 256)`) y un vector de estado del robot de 8 dimensiones (`observation.state`), y emite una acción de 7 dimensiones (`action`), típica de un brazo de 6 grados de libertad más pinza.

El entrenamiento es un ajuste fino supervisado por imitación sobre el dataset `themohal/saraiki-libero`, compuesto por 1693 episodios y 273.465 fotogramas a 10 FPS. Las tareas descritas en el dataset cubren manipulación de objetos domésticos (tazas, platos, cuencos, libros, botellas) y acciones compuestas (abrir un cajón y depositar algo, colocar un objeto en el microondas y cerrar la puerta, encender un fogón y situar una cafetera encima). El texto de las instrucciones está en saraiki, con múltiples paráfrasis por tarea, lo que apunta a que el modelo aprende a asociar variaciones semánticas de una misma orden con la misma conducta motora. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineamiento posteriores.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un brazo tipo Panda a partir de observaciones visuales y de estado.
- Seguimiento de instrucciones en lenguaje natural, en concreto en saraiki (y variantes bilingües), para tareas de pick-and-place.
- Percepción con doble cámara: procesa dos vistas simultáneas de 256x256 píxeles.
- Ejecución de habilidades compuestas como abrir/cerrar cajones, colocar objetos sobre superficies, introducir objetos en el microondas y cerrarlo, o encender un fogón.
- Manipulación de una variedad de objetos domésticos: tazas, platos, cuencos, botellas de vino, libros, envases de comida.
- No se documenta soporte de tool calling, function calling, agentes multietapa ni razonamiento simbólico; es una política de acción, no un modelo de lenguaje conversacional.
- Las capacidades multilingües formales y la cobertura de idiomas distintos del saraiki no están especificadas.

## Casos de uso

- Manipulación pick-and-place sobre mesa: el modelo recibe la orden "coloca la taza blanca en el plato izquierdo" y genera la secuencia de acciones para que el brazo Panda la ejecute, apoyándose en las dos cámaras para localizar los objetos.
- Automatización de tareas de apertura y cierre de cajones: útil para entornos de cocina u oficina donde el robot debe guardar un objeto y cerrar el cajón tras depositarlo, tal como se describe en las tareas del dataset.
- Manipulación de electrodomésticos: colocar un objeto dentro del microondas y cerrar la puerta, o encender un fogón y situar una cafetera encima; son habilidades compuestas que aparecen explícitamente en las tareas de entrenamiento.
- Organización de productos en cestas: el modelo está entrenado para colocar pares de objetos (por ejemplo, sopa y queso crema, o sopa y salsa de tomate) dentro de una cesta, una tarea típica de logística ligera y recogida de pedidos.
- Investigación en procesamiento de lenguas de bajos recursos aplicado a robótica: permite estudiar cómo se comporta un VLA cuando las instrucciones se formulan en saraiki, un idioma con pocos recursos digitales.
- Base para transferencia a nuevas tareas: al ser un fine-tune abierto con licencia Apache-2.0, sirve como punto de partida para reentrenar políticas sobre otros datasets y otros robots dentro del ecosistema LeRobot.
- Evaluación comparativa de políticas bilingües: permite medir si un mismo modelo mantiene la conducta motora ante paráfrasis en distintos idiomas, usando las variantes bilingües presentes en el conjunto de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor y los metadatos de Hugging Face no incluyen métricas de éxito en tarea, tasas de acierto, comparaciones con el modelo base ni curvas de entrenamiento. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- Con 604.934.176 parámetros, los pesos ocupan aproximadamente 2,4 GB en fp32 y alrededor de 1,2 GB en fp16/bf16 (cálculo estimado a partir del recuento de parámetros).
- SmolVLA está diseñado explícitamente para poder desplegarse en hardware de consumo, por lo que el modelo debería caber en GPU de gama media y alta (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090), así como en GPUs de centro de datos (A100, H100) sin problema.
- Es probable que pueda ejecutarse en CPU, aunque la latencia de control sería sensiblemente mayor; no se dispone de cifras concretas.
- El repositorio completo ocupa 24,6 GB, un tamaño notablemente superior al de los pesos, lo que sugiere que incluye checkpoints intermedios u otros artefactos de entrenamiento.
- Opciones de despliegue: la librería de referencia es LeRobot, con guía específica para SmolVLA. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos de lenguaje y no a políticas de robot.
- No se dispone de datos publicados de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| saraiki-libero-smolvla-bilingual (este) | ~605 M | no disponible | VLA para Panda | Apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | ~450 M (modelo base) | no disponible | VLA generalista | Apache-2.0 | Hugging Face (modelo base oficial) |
| OpenVLA | ~7 B | no disponible | VLA de proposito general | BSD / segun version | Hugging Face y repositorio publico |
| pi0 | ~3,3 B | no disponible | VLA basado en PaliGemma | Apache-2.0 (segun release) | Repositorio publico |

La comparación cuantitativa de rendimiento no está disponible, ya que este modelo no publica métricas. La diferencia fundamental frente a OpenVLA y pi0 es el tamaño: este ajuste y su base SmolVLA están un orden de magnitud por debajo en número de parámetros, lo que reduce los requisitos de hardware a costa de una capacidad general presumiblemente menor. Frente al modelo base, la diferencia es la especialización: `smolvla_base` es generalista, mientras que este checkpoint está ajustado a tareas concretas de un robot Panda con instrucciones en saraiki.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Al entrenarse por imitación sobre un dataset de 1693 episodios de un único entorno y un único tipo de robot, la política heredará las limitaciones y la distribución de dicho dataset (posiciones de cámara, iluminación, objetos concretos).
- Riesgo de alucinación: en un modelo de acción no aplica el concepto de alucinación textual, pero sí el de acciones erróneas o inseguras cuando la observación se aleja de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: las instrucciones se entrenaron en saraiki y variantes bilingües; no está claro el comportamiento ante órdenes en otros idiomas ni la cobertura real fuera del vocabulario del dataset.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos correspondientes. No obstante, conviene verificar la licencia del modelo base y del dataset, que pueden imponer condiciones adicionales.
- Sin validación externa: el repositorio tiene 0 descargas y 0 likes, y no se han publicado benchmarks, por lo que no hay evidencia pública de su rendimiento real en tareas fuera del conjunto de entrenamiento.
- Ámbito de aplicación muy estrecho: es una política para un brazo Panda con dos cámaras y un vector de estado de 8 dimensiones; no es reutilizable directamente en otras morfologías sin reentrenamiento.
- Para producción, conviene evaluar el modelo en el entorno físico objetivo antes de desplegarlo, dadas las diferencias habituales entre entrenamiento y ejecución real (sim-to-real gap).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/themohal/saraiki-libero-smolvla-bilingual
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/themohal/saraiki-libero
- Paper de SmolVLA (referencia arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Página del paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
