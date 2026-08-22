# subhodipsaha/pi05_stack_three_cubes_08_19_v2

## Resumen

Este modelo es un fine-tuning del modelo base `lerobot/pi05_base`, desarrollado por el usuario `subhodipsaha` mediante la librería LeRobot. Se trata de una política de control robótico de tipo Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence, adaptada para una tarea concreta: apilar tres cubos en una torre. El modelo consume observaciones de estado (posición y orientación del efector final) y dos cámaras (frontal y de muñeca), y produce acciones de 6 grados de libertad. Está entrenado sobre un dataset de 39 episodios y 29148 frames, con 1000 pasos de entrenamiento y un tamaño total de 4.143.404.816 parámetros. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Aunque el modelo es un fine-tune específico, hereda las capacidades de π₀.5 para generalización en entornos reales, aunque en este caso se ha especializado en una única tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.5 (no se detallan componentes específicos en la información) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo robótico, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, que a su vez es una adaptación de π₀.₅ de Physical Intelligence, un modelo VLA de flujo (flow-based) que combina visión, lenguaje y acciones para control robótico. La implementación en LeRobot sigue el repositorio OpenPI. El entrenamiento se realizó sobre un dataset de demostraciones de apilado de tres cubos, con 39 episodios y 29148 frames a 25 FPS. Se usó el optimizador AdamW con una tasa de aprendizaje de 2.5e-05, batch size 16 y 1000 pasos. La versión de LeRobot utilizada fue 0.6.1. No se especifican innovaciones técnicas adicionales en la información proporcionada.

## Capacidades

- Control robótico de un brazo tipo `so_follower` mediante acciones de 6 grados.
- Percepción visual dual: cámara externa (`phone`) y cámara de muñeca (`wrist`), ambas con entrada de 224×224 píxeles.
- Ejecución de la tarea específica "apilar los tres cubos en una torre".
- No se reportan capacidades generales de lenguaje, tool calling, agentes ni razonamiento multi-step, ya que el modelo está orientado exclusivamente a control motor.
- Al ser un fine-tune de π₀.₅, hereda la capacidad de generalización a entornos no vistos, aunque en este caso está limitada por el pequeño dataset de entrenamiento.

## Casos de uso

- **Manipulación robótica en laboratorio**: el modelo puede ejecutar la tarea de apilado de cubos en un entorno controlado, sirviendo como demostración de políticas de aprendizaje por imitación.
- **Evaluación de políticas de control**: dado que se ha entrenado con LeRobot, es útil como punto de partida para comparar el rendimiento de π₀.₅ frente a otras arquitecturas en tareas similares.
- **Fine-tuning para tareas de pick-and-place**: aunque no se ha entrenado para otras tareas, su arquitectura base permite re-entrenarlo con nuevos datos para manipular objetos en entornos de laboratorio.
- **Investigación en aprendizaje por imitación**: el modelo y su dataset son accesibles, permitiendo estudiar el efecto de datos pequeños en la generalización de VLA.
- **Pruebas de hardware robótico**: se puede usar para validar el funcionamiento de un brazo `so_follower` y sus cámaras antes de implementar otras políticas.
- **Educación y prototipado**: sirve como ejemplo práctico de cómo entrenar y desplegar un modelo VLA con LeRobot, con una configuración documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real para esta política concreta.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Con 4.143.404.816 parámetros, se estima que en precisión FP16 se necesitan aproximadamente 8 GB de VRAM para alojar los pesos, más memoria adicional para la inferencia (activaciones, imágenes, etc.). Por tanto, se recomienda una GPU con al menos 10-12 GB de VRAM, como una RTX 3080/3090 o una A100.
- Para inferencia en tiempo real con un brazo robótico, se necesita baja latencia, por lo que se recomienda una GPU de alto rendimiento (por ejemplo, A100 o H100) o el uso de cuantización para reducir el tamaño.
- El despliegue se puede realizar mediante la herramienta `lerobot-rollout` de LeRobot, que gestiona la carga del modelo y la comunicación con el robot.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de modelos comparables dentro de la información proporcionada. El único modelo de referencia es `lerobot/pi05_base`, del cual este es un fine-tune. No se han encontrado otros fine-tunes de π₀.₅ para tareas similares en la búsqueda.

## Limitaciones y advertencias

- El modelo está entrenado con un conjunto de datos muy reducido (39 episodios) y para una única tarea, lo que limita su generalización a otras tareas o entornos.
- No se han reportado evaluaciones en robot real; su fiabilidad en condiciones no controladas es desconocida.
- La arquitectura interna no está documentada en la model card, lo que dificulta la interpretación de sus decisiones.
- No se han identificado sesgos específicos, pero al ser un modelo robótico no procesa lenguaje, por lo que los riesgos de alucinación textual no son aplicables.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar los términos de la base `lerobot/pi05_base` y de los datos de entrenamiento.
- Para producción, es esencial validar el modelo en el robot real con múltiples pruebas antes de su uso, dado que el dataset de entrenamiento es limitado.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/subhodipsaha/pi05_stack_three_cubes_08_19_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/subhodipsaha/so101_stack_three_cubes_08_19)
- [Dataset de evaluación (ACT)](https://huggingface.co/datasets/subhodipsaha/eval_act_stack_three_cubes_08_19)
- [Repositorio OpenPI de Physical Intelligence](https://github.com/Physical-Intelligence/openpi)
- [Paper de π0.5 (PDF)](https://www.pi.website/download/pi05.pdf)
- [Guía de LeRobot para π0.5](https://huggingface.co/docs/lerobot/main/en/pi05)
