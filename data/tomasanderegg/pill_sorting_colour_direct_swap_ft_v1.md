# TomasAnderegg/pill_sorting_colour_direct_swap_ft_v1

## Resumen

`pill_sorting_colour_direct_swap_ft_v1` es una política de visión-lenguaje-acción (VLA) para robótica, publicada por el usuario TomasAnderegg en Hugging Face y construida sobre la arquitectura SmolVLA. No es un modelo de lenguaje generalista: es un modelo de control robótico entrenado por imitación para ejecutar una tarea concreta de clasificación de píldoras por color y forma en compartimentos. El modelo consume una imagen de cámara frontal y el estado de las articulaciones del robot, y emite un vector de acción de 6 dimensiones.

El modelo deriva de un ajuste fino previo (`pill_sorting_full_ft_a100_v3_dagger60`) y se ha entrenado con un conjunto de datos propio de 136 episodios y 73.906 fotogramas grabados a 30 FPS, con 14 instrucciones de tarea distintas que combinan cuatro colores de píldora y cinco formas de compartimento. Su interés práctico es acotado: sirve como ejemplo reproducible de un pipeline completo de LeRobot con SmolVLA, incluyendo entrenamiento con datos de DAgger, y como punto de partida para quien quiera replicar el flujo en un robot SO-100/SO-101.

La relevancia del modelo es, por tanto, metodológica más que de rendimiento: SmolVLA está diseñado para ejecutarse en hardware de consumo, y este repositorio demuestra el ciclo completo de ajuste fino, publicación en el Hub y despliegue mediante `lerobot-rollout`. Con 450 millones de parámetros y licencia Apache 2.0, es un artefacto ligero y reutilizable para experimentación en manipulación robótica de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo visión-lenguaje-acción compacto, según paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 (~0,45 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica contexto textual largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `front` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | `observation.images.front`, forma `(3, 480, 640)` |
| Salida | `action`, forma `(6,)` |
| Frecuencia de datos | 30 FPS |
| Tamaño del repositorio | 10,0 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, entrenado para mapear observaciones (imagen y estado propioceptivo) e instrucción textual a comandos motores. El modelo base del que parte este ajuste es `pill_sorting_full_ft_a100_v3_dagger60`, que a su vez incorpora datos de DAgger (60 iteraciones según el nombre del repositorio), una técnica de aprendizaje por imitación interactivo en la que un experto corrige las trayectorias del modelo para reducir el error acumulado.

El ajuste fino de esta versión se realizó con LeRobot 0.6.2 durante 4.000 pasos, con tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El conjunto de datos, `pill_sorting_finetune_v3_colour_direct_swap_merged`, contiene 136 episodios y 73.906 fotogramas a 30 FPS, con 14 instrucciones que cruzan colores (azul, rojo, amarillo, verde) y formas de compartimento (cuadrado, círculo, triángulo, cruz). No se documentan en la información disponible detalles sobre la composición exacta del dataset más allá de estas cifras, ni sobre el uso de RLHF o DPO, que en un modelo de imitación robótica no resultan aplicables en el sentido habitual.

## Capacidades

- Control robótico por imitación para una tarea de clasificación de píldoras por color y forma.
- Percepción visual a partir de una única cámara frontal con resolución 480x640.
- Interpretación de instrucciones de tarea en lenguaje natural (14 variantes predefinidas en inglés).
- Salida de acciones de 6 dimensiones compatibles con el robot `so_follower`.
- Ejecución autónoma de episodios completos mediante `lerobot-rollout`.
- Reutilización como base para nuevos ajustes finos con `lerobot-train`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto libre, código, matemáticas, visión general, audio ni modo de pensamiento. Es exclusivamente una política de acción.

## Casos de uso

- Clasificación automatizada de píldoras en laboratorio: el modelo ejecuta instrucciones como "Put the blue pill in the square compartment" depositando el objeto en el compartimento correcto, adecuado para montajes de experimentación con robots SO-100/SO-101.
- Reproducción de un pipeline completo de LeRobot: sirve como referencia para validar la instalación, calibración y despliegue de un flujo de aprendizaje por imitación de principio a fin.
- Punto de partida para ajuste fino en tareas de sorting: al partir de un modelo ya entrenado con DAgger, reduce el coste de entrenamiento para variantes del mismo dominio.
- Docencia y formación en robótica de manipulación: su tamaño de 0,45 B y su licencia permisiva lo hacen apto para prácticas con hardware de consumo.
- Evaluación comparativa de estrategias de datos: permite contrastar esta versión con la variante `pill_sorting_colour_direct_ft_v1` para medir el efecto de cambios en el conjunto de datos.
- Prototipado de interfaces de instrucción en lenguaje natural para robots: las 14 tareas documentadas ejemplifican cómo mapear comandos verbales a políticas de acción.
- Pruebas de robustez en entornos controlados: útil para estudiar fallos de generalización ante cambios de iluminación o posición de objetos, aunque sin garantías fuera del dominio de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación sin completar (marcada como plantilla) y no se han encontrado tasas de éxito, métricas de precisión ni comparaciones cuantitativas en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 millones de parámetros en precisión de 16 bits, la huella de pesos ronda los 0,9 GB; el repositorio ocupa 10 GB, lo que sugiere que incluye múltiples artefactos además de los pesos.
- GPU recomendadas: no especificadas en la información disponible. SmolVLA se describe como desplegable en hardware de consumo, por lo que una GPU consumer con al menos 8 GB de VRAM es un punto de partida razonable, aunque no confirmado por el autor.
- Cabe en GPU consumer: sí, según la descripción general de SmolVLA como modelo compacto para hardware de consumo; no se detalla qué modelos concretos.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según la frecuencia de los datos de entrenamiento, pero no se publica latencia medida en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pill_sorting_colour_direct_swap_ft_v1` | 0,45 B | no aplica | Sorting de píldoras (SO follower) | Apache 2.0 | Hugging Face |
| `pill_sorting_colour_direct_ft_v1` | ~0,5 B (según búsqueda) | no aplica | Sorting de píldoras, variante sin swap | no disponible | Hugging Face |
| `pill_sorting_full_ft_a100_v3_dagger60` | no disponible | no aplica | Modelo base con DAgger | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La comparación se limita a linaje y configuración, no a métricas de éxito.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo maneja las 14 combinaciones de color y forma documentadas; fuera de ellas no hay garantía de comportamiento correcto.
- Dependencia del montaje físico: requiere un robot `so_follower` calibrado, una cámara frontal en la posición entrenada y las condiciones de iluminación del dataset original.
- Sin métricas de evaluación publicadas: la sección de evaluación de la model card está vacía, por lo que no se conoce la tasa de éxito real en el robot.
- Riesgo de sobreajuste al dataset: 136 episodios y 73.906 fotogramas son un volumen modesto; la generalización a nuevos objetos o posiciones es incierta.
- Sin soporte multilingüe: las instrucciones de tarea están en inglés y no se documentan otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación pública hace desaconsejable su uso en producción sin validación propia.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, razonamiento, código ni tareas de NLP.
- El nombre del repositorio sugiere una variante "swap" respecto a otra versión, pero no se documenta en qué consiste ese cambio ni su impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_direct_swap_ft_v1
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Variante relacionada: https://huggingface.co/TomasAnderegg/pill_sorting_colour_direct_ft_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_finetune_v3_colour_direct_swap_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_finetune_v3_colour_direct_swap_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
