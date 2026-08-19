# Yu3773/act_red_cube_yellow_target_v2

## Resumen

El modelo `Yu3773/act_red_cube_yellow_target_v2` es una política de manipulación robótica entrenada con el método Action Chunking with Transformers (ACT), desarrollada por Yu Sakuta (Yu3773) y publicada bajo licencia Apache-2.0. Está diseñada para una tarea concreta de pick-and-place: recoger un cubo rojo y colocarlo dentro de un área objetivo amarilla, operando sobre un robot tipo `so_follower` equipado con dos cámaras (vista cenital y muñeca). El modelo resuelve el problema del control robótico por imitación, aprendiendo a partir de datos teleoperados para generar secuencias de acciones completas en lugar de pasos individuales.

La arquitectura se basa en el paper de ACT (arXiv:2304.13705), que combina un transformer con predicción de chunks de acciones, alcanzando altas tasas de éxito en tareas de manipulación. Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de consumo. Su relevancia actual radica en ser un ejemplo práctico de política robótica entrenada con LeRobot, la biblioteca de Hugging Face para aprendizaje por imitación, lo que facilita su reproducibilidad y adaptación a otras tareas. El modelo fue creado en agosto de 2026 y no registra descargas ni evaluaciones publicadas hasta la fecha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de acciones individuales. Esta técnica, presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), utiliza un transformer codificador-decodificador que procesa observaciones visuales y de estado del robot para generar trayectorias de acción de 6 dimensiones. La política consume imágenes de dos cámaras (resolución 480x640, 3 canales) y un vector de estado de 6 valores, produciendo acciones de 6 grados de libertad.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre un dataset propio del autor, `Yu3773/so101_red_cube_yellow_target_v2`, que contiene 33 episodios y 19.284 frames a 30 FPS. La configuración de entrenamiento incluyó 20.000 pasos, batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5 con semilla 1000. No se aplicaron técnicas de RLHF ni DPO, ya que se trata de aprendizaje por imitación supervisado sobre datos teleoperados.

## Capacidades

- Manipulación robótica de pick-and-place: el modelo controla un brazo seguidor (`so_follower`) para recoger un cubo rojo y depositarlo en una zona objetivo amarilla.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (cenital y de muñeca) con resolución de 480x640 píxeles.
- Predicción de acciones en chunk: genera secuencias de 6 dimensiones de acción (posición y orientación del efector), lo que permite movimientos suaves y coordinados.
- Control basado en estado: incorpora un vector de estado de 6 valores que describe la configuración del robot en cada paso.
- Entrenamiento por imitación: aprende directamente de demostraciones teleoperadas sin necesidad de ingeniería de recompensas.
- Compatibilidad con LeRobot: integración nativa con el ecosistema de Hugging Face para robótica, incluyendo herramientas de rollout y entrenamiento.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de ensamblaje: el modelo puede transferirse a entornos industriales donde se requiera clasificar o reposicionar objetos pequeños, gracias a su capacidad de generar acciones precisas a partir de visión.
- Prototipado rápido de políticas robóticas en laboratorios de investigación: al estar entrenado con LeRobot, los investigadores pueden reproducir el entrenamiento con su propio dataset y adaptarlo a nuevas tareas con mínimos cambios de configuración.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como baseline para comparar métodos de action chunking frente a otras arquitecturas en tareas de manipulación de un solo brazo.
- Despliegue en robots de bajo coste: al requerir solo 51,7 millones de parámetros, puede ejecutarse en GPUs de consumo, facilitando su uso en plataformas robóticas asequibles como las basadas en SO-101.
- Generación de datos para entrenamiento de modelos más grandes: las políticas ACT pueden utilizarse para recopilar demostraciones adicionales o para validar la calidad de los datos teleoperados antes de escalar.
- Educación en robótica y aprendizaje por refuerzo: el modelo y su dataset asociado ofrecen un caso práctico para enseñar conceptos de imitación, control visual y transformadores en cursos universitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; dado el tamaño de parámetros (51,7 M) y la entrada de imágenes (2 cámaras de 480x640), se estima que 4-8 GB de VRAM son suficientes para inferencia en GPU consumer, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA RTX 3060 o superior; para entrenamiento se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en tarjetas como RTX 3060, RTX 4060 o similares.
- Opciones de despliegue: el framework LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`); también puede integrarse con otros entornos de robótica mediante exportación de pesos.
- Latencia y throughput: no disponibles; dependen del hardware y del pipeline de captura de cámaras.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (políticas ACT específicas para pick-and-place con LeRobot) en la información proporcionada.

## Limitaciones y advertencias

- Tarea específica: el modelo está entrenado exclusivamente para recoger un cubo rojo y colocarlo en una zona amarilla; no generaliza a otros objetos o configuraciones sin reentrenamiento.
- Dependencia del dataset: el rendimiento está limitado por la calidad y variedad de los 33 episodios de demostración; cambios en iluminación, posición de objetos o distracciones pueden degradar la precisión.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su tasa de éxito real en condiciones de producción.
- Riesgo de sobreajuste: con solo 33 episodios, el modelo puede memorizar las demostraciones y fallar ante variaciones no vistas.
- Requisitos de calibración: las cámaras y el robot deben estar calibrados de la misma manera que durante la recogida de datos; cualquier desalineación afecta al rendimiento.
- Licencia del dataset: aunque el modelo usa Apache-2.0, la licencia del dataset `Yu3773/so101_red_cube_yellow_target_v2` no está explícitamente indicada; debe verificarse antes de un uso comercial.
- Limitaciones de contexto: al ser un modelo de robótica, no maneja lenguaje natural ni razonamiento simbólico; su "contexto" se limita a las observaciones visuales y de estado en cada paso.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/Yu3773/act_red_cube_yellow_target_v2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Yu3773/so101_red_cube_yellow_target_v2)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación completa de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yu3773/so101_red_cube_yellow_target_v2)
- [Perfil del autor en Hugging Face](https://huggingface.co/Yu3773)
