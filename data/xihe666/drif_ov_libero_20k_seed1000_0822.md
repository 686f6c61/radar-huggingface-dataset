# Xihe666/drif_ov_libero_20k_seed1000_0822

## Resumen

`drif_ov_libero_20k_seed1000_0822` es una política robótica de aprendizaje por imitación entrenada con el framework LeRobot de HuggingFace. Desarrollada por Xihe666, el modelo se entrena sobre el benchmark LIBERO, un conjunto de tareas de manipulación diseñado para estudiar la transferencia de conocimiento en aprendizaje multitarea y lifelong robot learning. La política se ejecuta sobre un robot Panda y utiliza dos cámaras RGB para generar acciones de control de 7 dimensiones.

El modelo emplea una arquitectura de difusión (diffusion policy) para generar acciones a partir de observaciones visuales y del estado del robot. Con aproximadamente 1,9 mil millones de parámetros y un tamaño de repositorio de 7,6 GB en formato safetensors, es un modelo relativamente grande para robótica, lo que le permite capturar comportamientos complejos en tareas de manipulación de largo horizonte. Su relevancia radica en que representa un ejemplo de aplicación de técnicas de diffusion policy en un benchmark estándar, con licencia Apache 2.0 que permite uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (drif_ov) |
| Parametros totales | 1.909.381.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo robótico) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se basa en el enfoque de diffusion policy, que modela la distribución de acciones de control condicionada a observaciones. Aunque los detalles exactos de la arquitectura no se especifican en la model card, el nombre `drif_ov` sugiere una variante de diffusion policy con visión (OV, probablemente "object view" o "observation view") que procesa dos cámaras de 256x256 píxeles junto con un vector de estado de 8 dimensiones. La salida es un vector de acción de 7 dimensiones, correspondiente a las articulaciones del brazo Panda.

El entrenamiento se realizó con el framework LeRobot, sobre el dataset `lerobot/libero`, que incluye 1.693 episodios y 273.465 fotogramas a 10 FPS. Las tareas cubren 40 instrucciones distintas en inglés (p. ej., "put the white mug on the left plate...", "open the top drawer and put the bowl inside"), que requieren razonamiento espacial y manipulación de objetos. La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-4, y semilla 1000. Se usó la versión 0.6.1 de LeRobot.

## Capacidades

- Generación de acciones de control de 7 grados de libertad para el robot Panda.
- Percepción visual mediante dos cámaras RGB (256x256) para localización de objetos.
- Ejecución de tareas de manipulación de largo plazo con múltiples pasos (p. ej., colocar objetos en la cesta, abrir cajones, encender fuego).
- Aprendizaje por imitación: no requiere programación explícita de movimientos, sino que imita demostraciones del dataset.
- Capacidad de generalización dentro de las tareas LIBERO, incluyendo variaciones espaciales y de objetos.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Investigación en robótica de manipulación: permite estudiar la transferencia de conocimiento entre tareas de LIBERO y comparar políticas de difusión con otros métodos de aprendizaje por imitación.
- Desarrollo de políticas para robots manipuladores en entornos simulados o reales: puede servir como base para fine-tuning en tareas específicas de la industria o laboratorios.
- Benchmarking de métodos de aprendizaje por imitación: al estar entrenado en LIBERO, es útil para comparar con otros modelos en el mismo conjunto de tareas.
- Prototipado rápido de robots con LeRobot: se puede integrar fácilmente en pipelines de LeRobot para pruebas en simuladores como MuJoCo o en robots reales.
- Investigación en lifelong learning: LIBERO está diseñado para estudiar transferencia de conocimiento, y este modelo puede ser usado como baseline en experimentos de aprendizaje continuo.
- Evaluación de generalización de políticas: analizar cómo se comporta el modelo ante variaciones de objetos y posiciones no vistas durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en las tareas de LIBERO ni comparaciones con otros modelos. Para obtener datos de rendimiento, se recomienda ejecutar el modelo en el entorno de evaluación de LIBERO o consultar el repositorio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1.909.381.248 parámetros (~1,9B) y el repositorio ocupa 7,6 GB en safetensors. Con precisión FP32, la inferencia requeriría al menos 7,6 GB de VRAM, pero con cuantización (no disponible) se podría reducir. En la práctica, se recomienda al menos 10-12 GB de VRAM para margen.
- GPU recomendadas: tarjetas consumer con 12 GB o más, como RTX 4070 Ti, RTX 4080, RTX 4090; o GPUs de datacenter como A100 (40 GB) o H100.
- Compatibilidad con consumer GPU: sí, si se usa cuantización (por ejemplo, GGUF de 8 bits) o si se ejecuta en FP16 con 16 GB de VRAM.
- Opciones de despliegue: LeRobot proporciona herramientas de rollout (`lerobot-rollout`) que se integran con el robot Panda. También se puede usar con simuladores como MuJoCo o Isaac Sim. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La latencia depende de la GPU y de la frecuencia de control del robot (típicamente 10-30 Hz).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. El autor ha publicado otros modelos de robótica, como `drif_ov_siemens_0816` y `drifting_robomme` (2B parámetros), pero no se conocen métricas comparativas. En el contexto de LIBERO, existen otros modelos de políticas de difusión (como Diffusion Policy original), pero no se han publicado datos de comparación con este modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni tiene capacidades de conversación; su entrada son imágenes y estado del robot, y su salida son acciones de control.
- Específico de tareas LIBERO: el entrenamiento se realizó en un conjunto de tareas con objetos y escenarios concretos (cocina, cesta, etc.), por lo que la generalización a otros entornos o tareas puede ser limitada.
- Datos de entrenamiento en inglés: aunque el modelo no procesa lenguaje, las tareas se describen en inglés, lo que puede sesgar la representación de los objetos y las acciones.
- Sin métricas de éxito publicadas: no se conocen tasas de éxito en las tareas LIBERO, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste: con 20.000 pasos y 1.693 episodios, el modelo puede sobreajustarse a las demostraciones de entrenamiento, especialmente en tareas con poca variabilidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías de rendimiento ni soporte técnico.
- No es adecuado para producción sin validación: dado que no hay benchmarks, cualquier uso en producción debería ir precedido de una evaluación exhaustiva en el entorno objetivo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Xihe666/drif_ov_libero_20k_seed1000_0822)
- [LeRobot (framework)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Dataset LIBERO](https://huggingface.co/datasets/lerobot/libero)
- [Repositorio de LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Página del proyecto LIBERO](https://libero-project.github.io/datasets)
