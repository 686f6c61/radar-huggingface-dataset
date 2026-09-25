# Tridex/model_tridex_act_3cam_resnet_100K_25_09_2

## Resumen

Tridex/model_tridex_act_3cam_resnet_100K_25_09_2 es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación descrito en el artículo arXiv:2304.13705. No es un modelo de lenguaje: se trata de un policy que, a partir de observaciones visuales y de estado propioceptivo, predice directamente comandos de acción de un robot manipulador. Ha sido entrenado y publicado por el usuario Tridex (Tridex_DIA_Niort) con LeRobot 0.6.2, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y ocupa 0,2 GB en el repositorio. Consume dos flujos de imagen de 480x640 píxeles (`side` y `top`) más un vector de estado de 6 dimensiones, y produce un vector de acción de 6 dimensiones. Está especializado en una única tarea: "take the gaz cylinder and drop it", aprendida de un dataset propio de 50 episodios y 39.028 fotogramas grabados a 30 FPS.

Su relevancia es la de un ejemplo canónico y muy ligero de política ACT entrenada de extremo a extremo con LeRobot: sirve como referencia reproducible para investigar aprendizaje por imitación, para replicar el pipeline de entrenamiento e inferencia, y como punto de partida para ajustar una política propia en un robot de tipo `so_follower`. Al ser un modelo pequeño y de licencia Apache-2.0, se puede desplegar incluso en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con encoder visual ResNet |
| Parametros totales | 51.668.614 (aprox. 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; predice chunks de acciones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (política de robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo basado en LeRobot) |

Datos adicionales de entrada y salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.side` | VISUAL | (3, 480, 640) |
| `observation.images.top` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

| Parametro | Valor |
|---|---|
| Robot de destino | `so_follower` |
| Camaras | `side`, `top` (el nombre del repo indica "3cam", la model card declara dos) |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot 0.6.2 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varias acciones consecutivas) en lugar de un único paso, lo que reduce el problema de horizonte y estabiliza el control. El modelo combina un encoder visual convolucional de tipo ResNet (indicado tanto en el nombre del repositorio, "resnet", como en la práctica habitual de ACT) que procesa las dos cámaras, con un transformer que fusiona las representaciones visuales y el estado del robot y genera las secuencias de acción. La salida es un vector de 6 dimensiones por paso, coherente con un robot manipulador de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Tridex/50_gaz_cylinder_14h_24-09_20260924_140939`: 50 episodios, 39.028 fotogramas a 30 FPS (aproximadamente 1.301 segundos, unos 21,7 minutos de datos) y una única tarea, "take the gaz cylinder and drop it". La configuración declarada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF ni de DPO, algo que no aplica a este tipo de política de imitación; tampoco se detalla la composición del dataset más allá de los episodios y la tarea.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones.
- Percepción visual multi-cámara: consume dos vistas simultáneas (`side` y `top`) de 480x640 píxeles.
- Fusión de estado propioceptivo: integra un vector de estado de 6 dimensiones junto con las imágenes.
- Predicción por chunks de acciones: produce secuencias cortas de acción en lugar de pasos aislados, lo que aporta estabilidad temporal en la ejecución.
- Ejecución de una tarea manipulativa concreta: coger un cilindro de gas ("gaz cylinder") y soltarlo.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso simbólico: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se declaran modos de razonamiento, visión o audio más allá de la percepción visual de las dos cámaras.

## Casos de uso

- Pick-and-place de objetos cilíndricos: la política ejecuta la tarea entrenada de coger un cilindro y depositarlo, lo que la hace directamente utilizable en células de manipulación que replican las condiciones de grabación (posición, iluminación, misma cámara y robot `so_follower`).
- Reproducción del pipeline de investigación en imitación: sirve como referencia para estudiar cómo se comporta ACT con 100.000 pasos sobre 50 episodios, comparando el efecto del número de pasos y de episodios frente a políticas propias.
- Base para fine-tuning en nuevas tareas: partiendo de estos pesos y del mismo formato LeRobot, se puede reentrenar sobre un dataset propio para otra tarea de manipulación con un robot compatible.
- Prototipado de control visual en laboratorio: al consumir dos cámaras y estado de 6 dimensiones, es útil para validar el cableado, la calibración y la sincronización de cámaras antes de escalar a políticas mayores.
- Pruebas de despliegue con LeRobot: permite validar el comando `lerobot-rollout` y los flujos de inferencia con `--strategy.type=base` en un robot real con `--duration` limitado.
- Docencia y demostraciones: su tamaño (51,7 M de parámetros, 0,2 GB) permite ejecutar y explicar el ciclo completo de imitación (grabación, entrenamiento, rollout) en entornos con recursos limitados.
- Automatización de tareas repetitivas de recogida: en un contexto industrial controlado donde el objeto y la ubicación varían poco, puede sustituir a un operario en la rutina de coger y soltar el cilindro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la indicación explícita de que "no evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real, ni número de ensayos, ni comparaciones numéricas. No se dispone tampoco de métricas de pérdida de entrenamiento en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en precisión completa (pesos de aproximadamente 51,7 M de parámetros, unos 207 MB en FP32) más el coste de activaciones de las dos imágenes de 480x640; el repositorio ocupa 0,2 GB.
- GPU recomendadas: prácticamente cualquier GPU sirve; con estas dimensiones es suficiente una GPU de gama de entrada o integrada. Una RTX 4090, A100 o H100 están sobradamente dimensionadas para esta política.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento), con soporte de `--policy.device=cuda` o CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a una política de robótica.
- Latencia y throughput estimados: no disponibles. La captura de datos se realizó a 30 FPS y las cámaras se configuran a 30 FPS en el ejemplo de rollout, pero no se publica la latencia de inferencia ni la tasa de control efectiva del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Camaras | Pasos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tridex/model_tridex_act_3cam_resnet_100K_25_09_2 | 51,7 M | "take the gaz cylinder and drop it" | 2 declaradas (side, top) | 100.000 | apache-2.0 | Hugging Face |
| Tridex/model_act_3cam_10K_22_09 | 51,7 M | política ACT (tarea no detallada en la busqueda) | no disponible | 10.000 (por el nombre) | no disponible | Hugging Face |
| Tridex/modele_act_3cam_30k | 51,7 M | política ACT (tarea no detallada en la busqueda) | no disponible | 30.000 (por el nombre) | no disponible | Hugging Face |
| ACT de referencia (arXiv:2304.13705) | no disponible | manipulación bimanual de precisión | no disponible | no disponible | no disponible | artículo + código |

La comparación directa se limita a las variantes del mismo autor, que comparten arquitectura y tamaño (51,7 M) y difieren en el número de pasos de entrenamiento (10K, 30K y 100K). No se dispone de datos de rendimiento de ninguna de ellas, por lo que no es posible establecer qué variante es mejor. Frente a alternativas como Diffusion Policy o políticas tipo vision-language-action de mayor tamaño, no hay información en la búsqueda que permita una comparación numérica.

## Limitaciones y advertencias

- No hay resultados de evaluación: no se ha medido la tasa de éxito en robot real, por lo que se desconoce su fiabilidad efectiva.
- Especialización extrema: está entrenada para una única tarea ("take the gaz cylinder and drop it"); fuera de ella no cabe esperar un comportamiento útil.
- Sensibilidad al dominio: al depender de datos teleoperados de 50 episodios con cámaras y posiciones concretas, es probable que se degrade ante cambios de iluminación, posición del objeto, distractores o un robot distinto.
- Superficie de datos reducida: unos 21,7 minutos de datos (39.028 fotogramas a 30 FPS) en 50 episodios limitan la variedad de situaciones cubiertas.
- Discrepancia en el nombre: el repositorio indica "3cam" pero la model card declara solo dos cámaras (`side`, `top`); conviene verificar la configuración real antes de desplegar.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural ni soporta tool calling, agentes o razonamiento simbólico.
- Ausencia de datos de cuantización: no se documentan formatos cuantizados ni compatibilidad con ellos.
- Riesgo de sobreajuste a la tarea y al entorno: el modelo puede reproducir trayectorias memorizadas en lugar de generalizar si el entorno cambia.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y no se documentan sesgos ni limitaciones éticas de despliegue en robótica real.
- Seguridad física: al tratarse de una política que controla un robot, cualquier despliegue debe ir acompañado de paradas de emergencia y límites de seguridad, ya que no se publican análisis de fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_tridex_act_3cam_resnet_100K_25_09_2
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_gaz_cylinder_14h_24-09_20260924_140939
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_gaz_cylinder_14h_24-09_20260924_140939
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor en Hugging Face: https://huggingface.co/Tridex
- Modelo hermano (10K): https://huggingface.co/Tridex/model_act_3cam_10K_22_09
