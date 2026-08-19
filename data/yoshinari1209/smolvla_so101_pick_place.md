# yoshinari1209/smolvla_so101_pick_place

## Resumen

El modelo `yoshinari1209/smolvla_so101_pick_place` es una adaptación (fine-tuning) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, que permite controlar robots mediante instrucciones en lenguaje natural y percepción visual. Este checkpoint concreto está entrenado para la tarea de recoger un dado y colocarlo en una bandeja (pick-and-place) sobre un brazo robótico SO-101, utilizando el framework LeRobot.

SmolVLA se presenta como una alternativa ligera a modelos VLA más grandes como OpenVLA, con alrededor de 450 millones de parámetros, lo que permite su despliegue en hardware de consumo. En esta versión, el modelo base `lerobot/smolvla_base` se ha fine-tuneado con 48 episodios de demostración (23 440 frames a 30 FPS) registrados mediante teleoperación. El resultado es una política que mapea observaciones de estado y tres cámaras (frontal, muñeca y una tercera no especificada) a acciones de 6 grados de libertad.

La relevancia de este modelo radica en su demostración práctica de que un VLA compacto puede resolver tareas de manipulación reales con un coste computacional reducido, abriendo la puerta a la robótica de aprendizaje por imitación accesible para laboratorios y desarrolladores sin infraestructura de alto rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (SigLIP + SmolLM2 + action expert) |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un codificador de visión SigLIP y un modelo de lenguaje SmolLM2 como componentes congelados, junto con un "action expert" (cabeza de acción) que se entrena para predecir comandos de control del robot. Según el blog de GGando, el fine-tuning solo actualiza aproximadamente 50 millones de parámetros (el action expert y las proyecciones), mientras que el resto del modelo permanece congelado. Esto reduce drásticamente los requisitos de cómputo para el entrenamiento.

El modelo se fine-tuneó a partir de `lerobot/smolvla_base` con el dataset `yoshinari1209/so101_pick_place_50eps_v1_20260817_192908`, que contiene 48 episodios de la tarea "Pick up the dice and place it in the tray" (recoger el dado y colocarlo en la bandeja). La configuración de entrenamiento incluye 10 000 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 1000, utilizando LeRobot versión 0.6.1. Las observaciones consisten en el estado del robot (6 dimensiones) y tres imágenes de cámaras de 256×256 píxeles, mientras que la salida es un vector de acción de 6 dimensiones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad para el brazo SO-101.
- Percepción visual multi-cámara: procesa tres flujos de imagen simultáneos (frontal, muñeca y una tercera cámara) a 256×256 píxeles.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("Pick up the dice and place it in the tray"), aunque el modelo está entrenado para una única instrucción.
- Aprendizaje por imitación: la política se obtiene mediante clonación de comportamiento a partir de demostraciones teleoperadas.
- Eficiencia computacional: al ser un modelo compacto (~450M parámetros), puede ejecutarse en GPUs de consumo.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de políticas robóticas de Hugging Face.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede controlar un brazo SO-101 para recoger objetos pequeños (como dados) y colocarlos en posiciones determinadas, útil para experimentos de manipulación repetitiva.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y al flujo de trabajo de LeRobot, permite iterar sobre nuevas tareas con pocos datos (48 episodios) y hardware modesto.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar la generalización de VLA compactos en tareas de manipulación, como se muestra en el repositorio de AriRyo que compara variaciones de la tarea.
- Evaluación de la influencia del lenguaje en el control: el experimento de zwaneiz/so101-vla-pickplace utiliza SmolVLA para determinar si el modelo sigue la instrucción verbal o se apoya en atajos visuales, lo que es relevante para entender los mecanismos de los VLA.
- Despliegue en robots de bajo coste: al caber en GPUs de consumo (por ejemplo, RTX 3060 o superiores), permite llevar políticas VLA a robots educativos o de investigación sin necesidad de clústeres de GPU.
- Generación de datos de entrenamiento sintéticos: el modelo puede ejecutarse en simulación o en el robot real para recopilar nuevas demostraciones que alimenten futuros ciclos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre o comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales, pero al tratarse de un modelo de ~450M parámetros en precisión FP32, el peso ocupa aproximadamente 1.8 GB; con cuantización a 8 bits podría reducirse a ~0.5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: el blog de GGando indica que SmolVLA puede desplegarse en hardware de consumo; una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, es el objetivo principal del modelo.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible usar la biblioteca `lerobot` para integraciones personalizadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, se puede señalar cualitativamente que SmolVLA (~450M parámetros) es significativamente más compacto que OpenVLA (7B parámetros), lo que reduce los requisitos de hardware y acelera el entrenamiento, aunque a costa de una menor capacidad de generalización a tareas diversas. Otros VLA como RT-2 (Google) son aún más grandes y no están disponibles de forma abierta. No se han encontrado comparaciones cuantitativas con estos modelos en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea específica (recoger un dado y colocarlo en una bandeja) y no generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- Depende de la configuración exacta del robot SO-101 y de las cámaras utilizadas durante el entrenamiento; cambios en la disposición, iluminación o tipo de cámara pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en robot real, por lo que la tasa de éxito real es desconocida.
- El dataset de entrenamiento es pequeño (48 episodios), lo que puede provocar sobreajuste a las condiciones específicas de las demostraciones.
- Al ser un modelo de robótica, no posee capacidades de conversación, generación de texto o razonamiento general; no debe confundirse con un asistente de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no especificadas en la información disponible.
- No se proporcionan cuantizaciones oficiales, por lo que el despliegue en hardware muy limitado puede requerir conversiones manuales no validadas.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/yoshinari1209/smolvla_so101_pick_place
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yoshinari1209/so101_pick_place_50eps_v1_20260817_192908
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Blog de GGando sobre fine-tuning de SmolVLA: https://ggando.com/blog/smolvla-so101/
- Documentación de SmolVLA en LeRobot (repositorio de AriRyo): https://github.com/AriRyo/lerobot-so101/blob/main/docs/source/smolvla.mdx
- Repositorio de experimento sobre atajos visuales: https://github.com/zwaneiz/so101-vla-pickplace
- Repositorios similares: https://huggingface.co/angeledge/smolvla_so101_pick_place y https://huggingface.co/orsoromeo/smolvla_so101_pick_and_place
