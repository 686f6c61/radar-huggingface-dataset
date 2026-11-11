# taichi116/diffusion_sarmal_3temp_speed_2

## Resumen

`taichi116/diffusion_sarmal_3temp_speed_2` es una política de control visuomotor entrenada con LeRobot y publicada en Hugging Face por el usuario `taichi116`. Se basa en Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo genera trayectorias de acción multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con contacto rico. El repositorio tiene 266.622.856 parámetros y un tamaño de 1,1 GB en formato safetensors.

El modelo no es un LLM ni un modelo de lenguaje: es una política robótica que mapea observaciones (típicamente imágenes de cámara y estado del robot) a secuencias de acciones. Se entrenó sobre el dataset `taichi116/sarmal_3temp_speed_2_20261109_172724`, presumiblemente una grabación de demostraciones teleoperadas del robot SO-100 (el ejemplo de la model card usa `so100_follower`). Su relevancia es acotada: se trata de un checkpoint experimental de un autor individual, con cero descargas y cero likes en el momento de la consulta, creado el 11 de noviembre de 2026.

La ficha se limita a lo que puede extraerse de la información disponible. No hay datos publicados sobre composición del dataset, número de episodios, tareas concretas ni resultados de evaluación, por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), integrado en LeRobot |
| Parametros totales | 266.622.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el horizonte de observación y predicción de acciones no se documenta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el planteamiento de Diffusion Policy (paper arXiv:2303.04137): un proceso de difusión condicionado por observaciones que genera secuencias de acciones. El modelo produce trayectorias multimodales, lo que mitiga el problema de promediar acciones en escenarios con múltiples soluciones válidas y mejora el comportamiento en tareas de contacto. La implementación concreta corresponde al pipeline de LeRobot, aunque la model card no detalla la variante exacta (CNN o transformer como backbone de la red de ruido), el número de pasos de difusión ni el horizonte de predicción.

El entrenamiento se realizó sobre el dataset `taichi116/sarmal_3temp_speed_2_20261109_172724`, del que no se publican número de episodios, frecuencia de captura, composición de cámaras ni tareas. No hay información sobre si se aplicó aumento de datos, normalización de acciones o algún tipo de regularización. El nombre del repositorio sugiere variaciones de temperatura y velocidad en la recolección de datos, pero es una inferencia no confirmada. No se documenta ningún proceso de RLHF, DPO ni ajuste posterior; en robótica por imitación esto es lo habitual, ya que el entrenamiento es supervisado sobre demostraciones.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves mediante difusión, adecuadas para manipulación con contacto.
- Control visuomotor a partir de observaciones (imágenes y estado del robot, según la configuración estándar de LeRobot).
- Ejecución de políticas de imitación entrenadas sobre demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-record`).
- Compatibilidad con robots tipo SO-100 follower según el ejemplo de la model card.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni modo "thinking".

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de ensamblaje o colocación donde el contacto entre objetos es crítico, aprovechando la generación de trayectorias suaves propia de Diffusion Policy.
- Investigación en imitación con LeRobot: sirve como checkpoint de partida para comparar variantes de Diffusion Policy frente a ACT u otras políticas del mismo framework.
- Replicación de experimentos de recolección de datos: dado el nombre del dataset, puede usarse para estudiar el efecto de cambios de temperatura o velocidad de captura en el rendimiento de la política.
- Evaluación de pipelines de entrenamiento: útil para validar flujos `lerobot-train` y `lerobot-record` en un robot SO-100 antes de escalar a datasets mayores.
- Docencia y formación: ejemplo práctico de política de difusión para cursos de aprendizaje por imitación en robótica.
- Pruebas de despliegue en hardware de bajo coste: con 266 M de parámetros, es viable ejecutarlo en GPUs de consumo para inferencia en tiempo real, siempre que la latencia del bucle de control lo permita.
- No se recomienda su uso en producción sin una evaluación previa, dado que no hay métricas publicadas ni validación externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 266,6 M de parámetros en fp32 se requieren aproximadamente 1,1 GB solo para pesos; en fp16 unos 0,55 GB. A ello hay que sumar activaciones y el coste de los pasos de difusión, que multiplica el cómputo por el número de iteraciones.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo; una RTX 3060, RTX 4060 o RTX 4090 son candidatas razonables para inferencia, pero no hay confirmación del autor.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del checkpoint, aunque la latencia del bucle de control (frecuencia de acciones) puede ser el factor limitante más que la memoria.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), y en general el stack de PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `taichi116/diffusion_sarmal_3temp_speed_2` | 266,6 M | no disponible | no publicado | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de LeRobot | no disponible | no disponible | no disponible | habitualmente Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy original (referencia del paper) | no disponible | no disponible | resultados en el paper 2303.04137 | según implementación | Repositorios de investigación |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas. La comparación cualitativa más directa es con ACT (Action Chunking Transformer), la otra política de imitación ampliamente usada en LeRobot; Diffusion Policy suele destacar en tareas de contacto rico, mientras que ACT es más ligera en cómputo de inferencia.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, con cero descargas y cero likes: no hay validación por parte de la comunidad.
- Sin métricas de éxito publicadas ni episodios de evaluación documentados; no puede afirmarse su rendimiento real.
- Sesgos conocidos: no documentados. En políticas de imitación es habitual el sesgo hacia las condiciones de recolección (iluminación, posiciones de objetos, velocidad del operador).
- Riesgo de fallo fuera de distribución: cualquier cambio en la cámara, el robot o el entorno respecto al dataset de entrenamiento puede degradar el comportamiento de forma abrupta.
- Limitaciones de idioma: no aplica, pero tampoco hay soporte de instrucciones en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Para producción se recomienda evaluación exhaustiva en el robot objetivo, análisis de seguridad en tareas con contacto y verificación de la frecuencia de control alcanzable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taichi116/diffusion_sarmal_3temp_speed_2
- Dataset de entrenamiento: https://huggingface.co/datasets/taichi116/sarmal_3temp_speed_2_20261109_172724
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
