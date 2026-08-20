# sunuk000/rby1_act

## Resumen

El modelo `sunuk000/rby1_act` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El modelo ha sido desarrollado por el usuario sunuk000 y está orientado al robot RB-Y1 de Rainbow Robotics, un manipulador móvil de doble brazo con 7 grados de libertad por brazo.

La política procesa observaciones multimodales —estado del robot (8 dimensiones) e imágenes de dos cámaras (frontal y derecha)— y genera comandos de acción de 8 dimensiones. Se entrenó sobre un dataset de 121 episodios y 47.290 fotogramas a 30 FPS para la tarea de recogida de objetos ("pick"). Con 51,67 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que lo hace accesible para investigación y prototipado en robótica.

La relevancia de este modelo radica en su aplicación práctica del paradigma ACT sobre un robot comercial de doble brazo, demostrando la viabilidad de entrenar políticas de imitación con LeRobot y desplegarlas en entornos reales. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.672.712 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura transformer encoder-decoder diseñada para aprendizaje por imitación en robótica. A diferencia de los métodos que predicen una sola acción por paso, ACT genera un chunk de acciones futuras (en este caso, vectores de 8 dimensiones) a partir de las observaciones actuales. Esto reduce la acumulación de errores y permite movimientos más suaves y coordinados. Las observaciones incluyen el estado del robot (posición de articulaciones, etc.) y dos flujos de imagen (cámara frontal de 480x640 y cámara derecha de 640x480), que se procesan mediante codificadores visuales.

El entrenamiento se realizó con el framework LeRobot (versión 0.5.2) sobre el dataset `sunuk000/rby1_training`, que contiene 121 episodios de teleoperación a 30 FPS, totalizando 47.290 fotogramas. La configuración de entrenamiento incluyó 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de aprendizaje supervisado por imitación. No se reportan innovaciones técnicas adicionales más allá de las propias del método ACT.

## Capacidades

- Generacion de acciones de control para robot RB-Y1: produce vectores de 8 dimensiones que corresponden a comandos de articulaciones o efector final.
- Procesamiento multimodal: integra estado del robot (8 valores) e imágenes de dos cámaras (frontal y derecha) para tomar decisiones.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados, específicamente la tarea de recogida de objetos ("pick").
- Prediccion por chunks: genera secuencias de acciones (chunking) que mejoran la fluidez del movimiento frente a predicciones paso a paso.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente motor (no es un LLM).
- No tiene capacidades de lenguaje natural ni vision general; su vision esta limitada a las dos camaras fijas del robot.

## Casos de uso

- Recogida de objetos en entornos controlados: el modelo esta entrenado para la tarea "pick" sobre el robot RB-Y1, por lo que puede utilizarse para recoger piezas o componentes en lineas de montaje o laboratorios.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el rendimiento de ACT en robots de doble brazo, comparar variantes de arquitectura o explorar tecnicas de aumento de datos.
- Prototipado rapido de politicas roboticas: al estar integrado con LeRobot, permite iterar rapidamente entre la recogida de datos, el entrenamiento y la evaluacion en el robot real.
- Automatizacion de tareas repetitivas: en entornos donde la tarea de recogida esta bien definida y no varia significativamente, el modelo puede sustituir la teleoperacion manual.
- Educacion y formacion en robotica: su tamano reducido y la disponibilidad de codigo abierto (LeRobot) lo hacen adecuado para cursos o talleres sobre aprendizaje por imitacion.
- Desarrollo de sistemas de manipulacion asistida: combinado con un operador humano, puede actuar como asistente en tareas de precision, aunque su alcance actual se limita a la tarea entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. No se proporcionan metricas como tasa de exito, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,67 millones de parametros, la inferencia requiere aproximadamente 200-400 MB de VRAM en precision FP32, y menos si se cuantiza (aunque no se ofrecen cuantizaciones publicadas). Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (p. ej., RTX 2060 o superior) es suficiente. Para entrenamiento, se recomienda al menos 8 GB de VRAM (el entrenamiento se realizo con batch size 8, lo que sugiere una GPU de gama media-alta).
- Compatibilidad con GPU de consumo: si, el modelo es lo bastante pequeno para ejecutarse en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: el modelo se integra con LeRobot, que ofrece scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). Tambien puede cargarse directamente con la libreria `lerobot` en Python.
- Latencia y throughput: no se dispone de mediciones publicadas. Dado el tamano del modelo y la resolucion de las imagenes (480x640 y 640x480), se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, aunque depende del hardware y de la optimizacion del pipeline.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (politicas ACT para el robot RB-Y1 o robots similares). La busqueda web no arroja otros modelos de este tipo en HuggingFace con caracteristicas directamente comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta entrenado exclusivamente con datos de teleoperacion de un unico operador y un unico entorno, por lo que puede no generalizar a otras configuraciones, iluminaciones o posiciones de objetos.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje, pero la politica puede generar acciones incorrectas si las observaciones difieren de las del entrenamiento (por ejemplo, cambios en la posicion de la camara o en la cinematica del robot).
- Limitaciones de contexto e idioma: al ser un modelo de control motor, no procesa lenguaje ni tiene contexto textual. Su "contexto" se limita a las observaciones actuales (estado + imagenes).
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial y modificacion, pero se debe atribuir al autor y mantener el aviso de licencia. No hay restricciones adicionales conocidas.
- Caveats para produccion: no se han reportado evaluaciones en el robot real, por lo que el rendimiento en entornos no controlados es incierto. Ademas, el modelo esta entrenado para una tarea especifica ("pick") y no es reutilizable para otras tareas sin reentrenamiento.
- Dependencia del hardware: el despliegue requiere el robot RB-Y1 y las camaras configuradas exactamente como en el entrenamiento (nombres de camaras "front" y "right", resoluciones especificas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunuk000/rby1_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/sunuk000/rby1_training
- Documentacion del robot RB-Y1: https://rainbowrobotics.github.io/rby1-dev/
- SDK oficial de RB-Y1: https://github.com/RainbowRobotics/rby1-sdk
