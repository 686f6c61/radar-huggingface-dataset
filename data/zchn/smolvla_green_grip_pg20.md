# zchn/smolvla_green_grip_PG20

## Resumen

PG20 es una política de control robótico (visuomotor policy) construida mediante fine-tuning de `lerobot/smolvla_base`, el modelo base de SmolVLA de Hugging Face. La desarrolla el usuario zchn y resuelve una tarea muy concreta: agarrar y levantar una caja verde de 32 mm sobre una mesa con un brazo robótico SO-101. No es un modelo de lenguaje: es un modelo de acción que, a partir de observaciones visuales y del estado articular, predice secuencias de comandos motores para el brazo.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 M) y un tamaño de repositorio de 1,2 GB en formato safetensors. Se entrenó en una única ejecución de 30.000 pasos con batch size 1 sobre el dataset `zchn/robo_test_green_grip_DG7` (135 episodios, 46.598 fotogramas a 10 fps), lo que equivale a unos 0,64 epochs. La licencia es Apache 2.0.

Su relevancia es práctica más que arquitectónica: demuestra el flujo completo de fine-tuning de SmolVLA sobre hardware de bajo coste (SO-101) y documenta con detalle la metodología de evaluación, incluyendo resultados comparativos frente a políticas anteriores (PG18, PG19, PG14) y una discusión honesta sobre la significancia estadística de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tune de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, la implementación de SmolVLA en la librería LeRobot, y se especializa mediante fine-tuning supervisado sobre el dataset `zchn/robo_test_green_grip_DG7`. La entrada combina dos cámaras (`observation.images.camera1`, cámara de muñeca, y `observation.images.camera2`, cámara en el brazo líder) más el estado articular; la salida es un chunk de 20 acciones (`n_action_steps` = 20). El entrenamiento usó un `rename_map` para alinear las claves del dataset (`handeye`, `front`) con las del modelo base y reservó un tercer slot de cámara vacío (`empty_cameras=1`). La cadena de tareas es la cadena de texto `grip the green box`.

Hiperparámetros: 30.000 pasos con batch size 1, learning rate 1e-4 con warm-up de 1.000 pasos y decaimiento hasta 2,5e-6 a lo largo de los 30.000 pasos. La pérdida final de entrenamiento fue de aproximadamente 0,04. El entrenamiento se ejecutó en un dispositivo Apple MPS durante unas 10 horas. No se documenta uso de RLHF, DPO ni otras técnicas de alineación; es aprendizaje por imitación puro sobre demostraciones.

## Capacidades

- Control visuomotor de un brazo SO-101: agarra y levanta una caja verde de 32 mm.
- Predicción de chunks de 20 acciones por inferencia, lo que reduce la frecuencia de consulta al modelo.
- Fusión de dos vistas de cámara más estado articular como entrada.
- Generalización limitada a posiciones no vistas: el autor reporta 9 de 9 levantamientos en posiciones de test que no aparecen en los datos de entrenamiento, incluidas dos con una vista de cámara (V3) no presente en el dataset.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Pick-and-place industrial de precisión: el modelo demuestra agarre y elevación de un objeto de 32 mm con tolerancia de milímetros; sirve como referencia para tareas de manipulación de piezas pequeñas en líneas de montaje.
- Prototipado rápido de políticas robóticas con LeRobot: al ser un fine-tune de `smolvla_base` con hiperparámetros documentados, se puede replicar el pipeline completo en hardware de bajo coste (SO-101) para validar nuevas tareas antes de escalar.
- Investigación en aprendizaje por imitación: el modelo card documenta el número de episodios, fotogramas, pasos y pérdida, lo que lo convierte en un caso de estudio reproducible sobre cuántos datos y pasos necesita una política para generalizar a posiciones no vistas.
- Benchmark de robustez ante cambios de cámara: los tests T09 y T10 usan una vista (V3) ausente del entrenamiento, útiles para medir la sensibilidad de la política a la configuración de sensores.
- Automatización de laboratorio con brazos de bajo coste: el SO-101 y el entrenamiento en Apple MPS (10 h) permiten a un laboratorio académico con presupuesto limitado entrenar políticas propias sin GPUs de datacenter.
- Base para fine-tuning encadenado: el autor compara cadenas de fine-tuning (PG14) frente a entrenamientos desde el base (PG20), lo que sirve de guía metodológica para decidir entre reentrenar o encadenar ajustes.

## Benchmarks y rendimiento

Resultados del test E68 (2 de noviembre de 2026) sobre 9 posiciones fijas no presentes en entrenamiento, una ejecución por posición. Se considera levantamiento si la caja queda entre las mordazas y la punta está a 15 mm o más sobre la mesa.

| Politica | T01 | T02 | T03 | T04 | T05 | T06 | T08 | T09 | T10 | Levantamientos |
|---|---|---|---|---|---|---|---|---|---|---|
| PG20 (este modelo) | L | L | L* | L* | L | L | L | L | L | 9 de 9 (7 registrados + 2*) |
| PG18 (base, solo DG6) | L | L | L | L | L | M | M | L | L | 7 de 9 |
| PG19 (PG18 + fine-tune DG7) | fallo | L | L | L | L | fallo | L | M | L | 6 de 9 |
| PG14 (cadena de cinco fine-tunes) | L | L | M | L | L | L | M | M | fallo | 5 de 9 |

\* En T03 y T04 el servo del gripper entró en protección por sobrecarga tras el cierre y el driver no pudo leer el agarre. La telemetría del brazo muestra la caja entre las mordazas (lectura 33,5-34,1) y la punta a 29 mm y 23 mm sobre la mesa, por lo que cuentan como levantamientos según la definición del test.

Métrica offline: sobre fotogramas reservados, el error medio del brazo en las primeras 10 acciones predichas es de 1,02 grados (PG18: 1,17 grados; PG14: 1,16 grados).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros y pesos safetensors en FP32/FP16, la huella es de aproximadamente 1-2 GB, holgada en cualquier GPU consumer.
- GPU recomendadas: no disponible; el autor entrenó en Apple MPS (unos 10 h para 30.000 pasos con batch size 1).
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifican modelos concretos.
- Opciones de despliegue: librería LeRobot (formato nativo del modelo); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PG20 (este modelo) | 450 M | no disponible | 9 de 9 levantamientos | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | no disponible (modelo base sin especializar) | no disponible | Hugging Face |
| PG18 (base, solo DG6) | no disponible | no disponible | 7 de 9 levantamientos | no disponible | no disponible |
| PG14 (cadena de cinco fine-tunes) | no disponible | no disponible | 5 de 9 levantamientos | no disponible | no disponible |

## Limitaciones y advertencias

- Una sola ejecución en cada una de las 9 posiciones: una diferencia de 1 o 2 levantamientos entre políticas no es estadísticamente significativa, según el propio autor.
- Entrenado y evaluado con un único brazo, una única mesa, una única caja y una única sala; no se ha probado en otro hardware.
- La política sigue de cerca el estado articular y requiere la misma calibración que el brazo de entrenamiento; cambios de calibración degradan el comportamiento.
- El gripper aprieta unas pocas unidades más allá de la caja tras el cierre, lo que puede disparar la protección de sobrecarga del servo (ocurrió en T03 y T04).
- Riesgo de sobreajuste a las vistas de cámara del entrenamiento: aunque los tests T09 y T10 con vista V3 funcionaron, solo se probó una configuración alternativa.
- No hay datos sobre sesgos, alucinación o comportamiento multilingüe porque no es un modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial, pero el modelo solo es válido para la tarea concreta de agarre descrita; no se debe asumir generalización a otros objetos o entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zchn/smolvla_green_grip_PG20
- Dataset de entrenamiento: https://huggingface.co/datasets/zchn/robo_test_green_grip_DG7
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://huggingface.co/docs/lerobot
