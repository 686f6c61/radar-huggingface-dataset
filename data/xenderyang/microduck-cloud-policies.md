# XenderYang/microduck-cloud-policies

## Resumen

MicroDuck Cloud Policies es un conjunto de políticas de control en formato ONNX exportadas desde el runtime de simulación de MicroDuck, un robot pato bípedo desarrollado por Pollen Robotics. El modelo ha sido publicado por XenderYang en HuggingFace como un paquete reproductible para las demostraciones del proyecto `duck_play`, que incluyen tareas como persecución de pelota, seguimiento de personas y transporte de objetos. En lugar de ser un modelo de lenguaje, se trata de un paquete de redes neuronales de aprendizaje por refuerzo que transforman observaciones del robot en acciones de control motor.

Cada política recibe una entrada de dimensión `[1, 61]`, compuesta por 48 señales de propiocepción y 13 slots de comandos, y produce una salida `[1, 14]` con las acciones de control. El conjunto está pensado para ejecutarse en tiempo real dentro de un bucle cerrado de simulación o en el propio robot, y se distribuye bajo licencia Apache-2.0 para facilitar la reproducibilidad de experimentos robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de políticas de aprendizaje por refuerzo (arquitectura no especificada) |
| Parametros totales | no disponible (tamano del repositorio: 0.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

Las políticas son exportaciones ONNX del runtime open-source de MicroDuck, concretamente del directorio `microduck/policies`. El contrato de entrada-salida es homogéneo para todas ellas: `[1, 61] -> [1, 14]`. La entrada combina 48 valores de propiocepción (estado articular, sensores de equilibrio, etc.) con 13 slots de comandos de alto nivel, lo que permite conectar las políticas a un sistema de control externo. La salida de 14 valores corresponde a las acciones de control de los actuadores del robot.

El entrenamiento se ha realizado en el simulador MuJoCo, como parte de un pipeline de aprendizaje por refuerzo. No se dispone de información sobre el número de parámetros, los tokens de entrenamiento o el algoritmo de RL empleado. La innovación principal no está en la arquitectura neuronal, sino en la modularidad de las políticas: cada archivo cubre un comportamiento específico (caminar, estar de pie, patada izquierda y patada derecha) y pueden combinarse para construir tareas complejas.

## Capacidades

- Control de locomoción: la política `alpha_walking.onnx` genera comandos de velocidad para caminar y mantener el equilibrio en posición de pie.
- Estabilización y preparación: `alpha_stand.onnx` permite al robot quedarse quieto y asentarse antes de ejecutar una patada.
- Patadas con ambos pies: `ball_kick_left.onnx` y `ball_kick_right.onnx` producen acciones de patada con la pierna izquierda y derecha, respectivamente.
- Ejecución en bucle cerrado: el contrato de observación `[1,61]` incluye 48 señales de propiocepción y 13 slots de comandos, lo que permite reaccionar en tiempo real a cambios del entorno.
- Integración con MuJoCo y el runtime de MicroDuck: las políticas están diseñadas para funcionar dentro de la simulación de MuJoCo y el software `duck_play`.
- No ofrece capacidades de lenguaje, visión, razonamiento ni tool calling.

## Casos de uso

- Demostraciones de robótica reproductibles: las políticas pueden cargarse en ONNX Runtime y ejecutarse en el simulador MuJoCo para reproducir los demos de `duck_play` sin necesidad de entrenar desde cero. Son adecuadas porque encapsulan comportamientos ya validados en el runtime original de MicroDuck.
- Persecución de pelota multi-ronda: combinando `alpha_walking.onnx` con las políticas de patada, el robot puede perseguir una pelota, acercarse y golpearla. El contrato de entrada permite recibir comandos externos de persecución mientras la propiocepción le da información sobre su estado.
- Seguimiento de persona (nivel L1): la política de caminar soporta comandos de velocidad, lo que la hace útil para que el robot mantenga una distancia de seguimiento con un operador humano. Es adecuada para validar sistemas de control de velocidad en entornos controlados.
- Llevar pelota al dueño: esta tarea requiere alternar entre caminar, pararse y patear. La modularidad del conjunto, con políticas separadas para cada acción, permite orquestar una secuencia de comportamientos que resuelve la tarea de transporte.
- Integración en pipelines de control robótico: al estar en formato ONNX, las políticas se pueden incrustar en sistemas de tiempo real basados en ROS 2 o en aplicaciones C++ mediante ONNX Runtime. El contrato `[1,61] -> [1,14]` es sencillo de adaptar a un bucle de sensórica y actuación.
- Evaluación de políticas de reinforcement learning: investigadores pueden usar estas políticas como referencia o baseline para comparar nuevos modelos entrenados en MuJoCo. La disponibilidad de cuatro políticas específicas facilita el análisis de comportamientos concretos.
- Educación en robótica: el robot pato MicroDuck es una plataforma educativa de bajo coste. Estas políticas permiten que estudiantes y docentes practiquen control de robots bípedos sin necesidad de entrenar modelos complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; las políticas son redes pequeñas (entrada 61, salida 14) que se ejecutan en CPU sin necesidad de GPU.
- GPU recomendada: no se requiere GPU; puede ejecutarse en CPU, incluyendo ordenadores de placa reducida como Raspberry Pi, gracias a ONNX Runtime.
- Si cabe en consumer GPU: no aplica; el peso de los archivos es muy reducido (el repositorio se muestra con 0.0 GB en HuggingFace).
- Opciones de despliegue: ONNX Runtime en Python o C++, integración con ROS 2, ejecución directa en MuJoCo y despliegue en contenedores Docker.
- Latencia y throughput: no disponible; dependen del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

No se dispone de comparativas con modelos alternativos en la información proporcionada. Las políticas pueden compararse con las versiones del runtime original `pollen-robotics/microduck`, pero no hay datos cuantitativos de rendimiento publicados. El propio conjunto contiene cuatro variantes de la misma categoría (locomoción, parada, patada izquierda y patada derecha), cada una especializada en una tarea concreta.

## Limitaciones y advertencias

- No es un modelo de lenguaje; no genera texto ni realiza tareas de procesamiento del lenguaje natural.
- Las políticas están entrenadas específicamente para el robot MicroDuck y el simulador MuJoCo; pueden no transferirse a otros robots sin reentrenamiento.
- Dependen del contrato de observación `[1,61]` y acción `[1,14]`. Cualquier cambio en la sensórica o en los actuadores requiere adaptar el modelo.
- El repositorio HuggingFace no tiene descargas ni likes, por lo que su integridad no ha sido validada por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero la implementación original depende del hardware y del software de Pollen Robotics, que pueden tener condiciones adicionales.
- No hay benchmarks ni evaluaciones publicadas, por lo que el rendimiento en el mundo real no está garantizado.
- Los archivos ONNX son exportaciones de un runtime de simulación; en el robot físico puede aparecer una brecha entre simulación y realidad (sim-to-real gap).

## Enlaces

- HuggingFace: https://huggingface.co/XenderYang/microduck-cloud-policies
- Repositorio original de MicroDuck: https://github.com/pollen-robotics/microduck
- Lista curada de recursos de MicroDuck: https://github.com/joeynyc/awesome-microduck
