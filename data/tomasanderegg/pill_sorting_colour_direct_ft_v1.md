# TomasAnderegg/pill_sorting_colour_direct_ft_v1

## Resumen

`pill_sorting_colour_direct_ft_v1` es una política de visión-lenguaje-acción (VLA) publicada por TomasAnderegg en Hugging Face, construida sobre SmolVLA y entrenada con la librería LeRobot. No es un modelo de lenguaje generalista, sino un controlador robótico especializado que traduce una observación compuesta por el estado del robot (vector de 6 dimensiones) y una imagen de cámara frontal (3×480×640) en un vector de acción de 6 dimensiones. Su tarea concreta es la clasificación y colocación de pastillas de colores en compartimentos con formas distintas.

El modelo deriva de un fine-tuning previo (`pill_sorting_full_ft_a100_v3_dagger60`, que a su vez incorpora datos de DAgger) y se ha ajustado sobre el dataset `pill_sorting_colour_direct_mix_v1`, con 68 episodios y 36.953 fotogramas a 30 FPS. Con 450 millones de parámetros, se sitúa en la gama compacta de SmolVLA, pensada para inferencia en hardware de consumo y despliegue en robots de bajo coste como el `so_follower`.

Su relevancia es acotada pero representativa: ilustra el flujo actual de imitación robótica de código abierto, donde un modelo pequeño de VLA se reentrena con pocos datos y se ejecuta en tiempo real sobre un brazo robótico. No obstante, la model card no reporta resultados de evaluación en robot real, y el repositorio tiene un uso muy limitado (36 descargas, 0 likes), por lo que debe tratarse como un artefacto de investigación más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo visión-lenguaje-acción compacto; detalles internos no disponibles) |
| Parámetros totales | 450.046.176 (≈0,45 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,0 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto descrito en el artículo arXiv 2506.01844, orientado a conseguir rendimiento competitivo con un coste computacional reducido y despliegue en hardware de consumo. En esta ficha concreta, el modelo consume `observation.state` (6 valores) y `observation.images.front` (3×480×640) y produce `action` (6 valores), siguiendo la interfaz estándar de políticas de LeRobot. No se detalla en la información disponible la composición interna del backbone visual, del codificador de lenguaje ni del cabezal de acciones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `pill_sorting_colour_direct_mix_v1`: 68 episodios, 36.953 fotogramas a 30 FPS, con 12 instrucciones de tarea que combinan cuatro colores de pastilla (azul, rojo, amarillo, verde) y cuatro formas de compartimento (cuadrado, círculo, triángulo, cruz). La configuración fue de 4.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. El modelo parte de un checkpoint previo entrenado con DAgger (60 iteraciones según el nombre del repo base), lo que sugiere un pipeline de imitación con agregación de datos y corrección de errores, aunque no se aportan detalles del proceso de RLHF/DPO ni del volumen total de datos del preentrenamiento original.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones a partir de una imagen frontal y del estado del robot.
- Ejecución de instrucciones de tarea en lenguaje natural en inglés, limitadas a 12 combinaciones de color y forma de compartimento.
- Control reactivo a 30 FPS, adecuado para tareas de manipulación de pick-and-place de objetos pequeños.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- Soporte de reentrenamiento y fine-tuning sobre el mismo pipeline y dataset.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; las instrucciones de tarea están en inglés.

## Casos de uso

- Clasificación de pastillas por color en entornos de laboratorio: el modelo recibe la imagen de la cámara frontal y el estado del brazo y genera la acción de agarre y colocación en el compartimento indicado, con 12 combinaciones posibles de color y forma.
- Automatización de pick-and-place en líneas de montaje de pequeño formato: al ser un modelo de 0,45 B de parámetros, puede ejecutarse en un PC con GPU de consumo junto al resto del stack de control del robot.
- Base para experimentos de imitación con DAgger: el checkpoint previo (`pill_sorting_full_ft_a100_v3_dagger60`) y este fine-tuning permiten reproducir el flujo de recogida de datos, entrenamiento y corrección iterativa.
- Docencia e investigación en robótica de código abierto: sirve como ejemplo completo de política LeRobot con dataset, configuración de entrenamiento y comandos de despliegue documentados.
- Pruebas de generalización color-forma: el dataset cubre instrucciones cruzadas (por ejemplo, pastilla verde en compartimento cruz), lo que permite evaluar el seguimiento de instrucciones composicionales en un VLA pequeño.
- Prototipado de interfaces de control por lenguaje natural: el modelo acepta la tarea como cadena de texto en `--task`, lo que facilita integrarlo en demos de interacción humano-robot.
- Benchmark interno de políticas compactas: al tener un tamaño y una configuración de entrenamiento conocidos, puede usarse como referencia para comparar variantes de SmolVLA en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con una plantilla vacía y la indicación de que no hay resultados de evaluación en robot real; tampoco se aportan métricas de éxito, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros, en FP32 el peso ronda 1,8 GB, en FP16 unos 0,9 GB y en cuantización de 8 bits unos 0,45 GB, sin contar activaciones ni el codificador visual.
- GPU recomendadas: no disponibles en la información proporcionada; el artículo de SmolVLA indica despliegue en hardware de consumo, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada para modelos concretos (RTX 4090, RTX 3090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política de acciones.
- Latencia y throughput: no disponibles; la captura de datos se realizó a 30 FPS, pero no se reporta la frecuencia de inferencia efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pill_sorting_colour_direct_ft_v1` | 450 M | no disponible | Clasificación y colocación de pastillas (so_follower) | Apache 2.0 | Hugging Face, 36 descargas |
| `pill_sorting_colour_direct_swap_ft_v1` (TomasAnderegg) | ≈0,5 B | no disponible | Variante de la misma tarea con intercambio de color | no disponible | Hugging Face |
| SmolVLA base (paper 2506.01844) | no disponible en la información | no disponible | VLA generalista compacto | no disponible | Paper y pesos base referenciados |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otras políticas VLA de tamaño similar.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para 12 instrucciones concretas de color y forma; fuera de ese dominio no hay garantía de comportamiento correcto.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere el robot `so_follower` y una cámara frontal con la configuración exacta de observación (`observation.state` de 6 valores, imagen 3×480×640); cambios en la cámara o en la cinemática invalidan la política.
- Riesgo de sobreajuste: 68 episodios y 36.953 fotogramas son un volumen reducido; la variabilidad de iluminación, posición de las pastillas y fondo puede degradar el rendimiento.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte de castellano ni de otros idiomas.
- Sesgos: no documentados, pero al ser un modelo entrenado con datos de un único robot y entorno, hereda los sesgos de ese montaje experimental.
- Alucinación en el sentido de acciones erróneas: al ser una política de control, los fallos se manifiestan como movimientos incorrectos o agarres fallidos, no como texto inventado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los componentes base (SmolVLA, LeRobot) y del dataset.
- Repositorio de 10 GB: conviene revisar qué artefactos incluye antes de descargarlo en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_direct_ft_v1
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_direct_mix_v1
- Variante relacionada: https://huggingface.co/TomasAnderegg/pill_sorting_colour_direct_swap_ft_v1
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_colour_direct_mix_v1
