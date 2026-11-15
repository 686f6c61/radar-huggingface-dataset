# YuBin103/pick_and_place_1102_ddpm_100k

## Resumen
`YuBin103/pick_and_place_1102_ddpm_100k` es una política de control visuomotor entrenada con LeRobot y publicada en Hugging Face por el usuario YuBin103. Se trata de una implementación de Diffusion Policy (paper arXiv:2303.04137), un enfoque que modela el control visuomotor como un proceso generativo de difusión para producir trayectorias de acción suaves y multimodales, especialmente adecuadas para tareas de manipulación con contacto rico. El modelo está entrenado sobre un dataset propio de pick and place (`YuBin103/pick_and_place_1102_20261102_194727`) y orientado al robot SO100 (so100_follower según los comandos de evaluación de la model card).

El repositorio contiene 266.622.776 parámetros en formato safetensors, con un tamaño total de 1,1 GB, lo que corresponde a una política de difusión de tamaño medio pensada para inferencia en tiempo real sobre una GPU. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales relevantes. El modelo no es un LLM ni un modelo de lenguaje: es una política robótica, por lo que sus capacidades se limitan a la predicción de acciones a partir de observaciones visuales y de estado del robot.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo LeRobot (entrenamiento, publicación en Hub y evaluación con `lerobot-record`) para una tarea de pick and place sobre un brazo SO100. No hay descargas ni likes registrados en el momento de la ficha, y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotor generativa basada en difusión; backbone concreto no disponible) |
| Parametros totales | 266.622.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; horizonte de predicción de acciones no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento
La arquitectura sigue el planteamiento de Diffusion Policy: el control visuomotor se formula como un proceso de difusión generativo que produce secuencias de acciones multimodales y suaves, lo que mejora el rendimiento en tareas de manipulación con contacto rico frente a políticas deterministas de regresión directa. El modelo se ha entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El backbone exacto (por ejemplo, si usa una CNN o un transformer como extractor de observaciones, o el número de pasos de difusión) no está detallado en la información disponible.

El entrenamiento se realizó sobre el dataset `YuBin103/pick_and_place_1102_20261102_194727`, cuyo contenido, número de episodios, composición y número de tokens o muestras no se especifican en la model card. El nombre del repositorio incluye "ddpm_100k", lo que sugiere un entrenamiento de 100.000 pasos con un proceso de difusión de tipo DDPM, pero este dato no está confirmado en la documentación. No se menciona uso de RLHF, DPO ni ninguna otra fase de ajuste posterior al entrenamiento por imitación.

## Capacidades
- Predicción de trayectorias de acción para manipulación robótica: genera secuencias de acciones multimodales y suaves para tareas de pick and place.
- Control visuomotor a partir de observaciones visuales y de estado del robot (condicionamiento sobre imágenes y propriocepción, según el enfoque Diffusion Policy).
- Ejecución sobre el robot SO100 (`so100_follower`) mediante `lerobot-record`, tal como se documenta en los comandos de evaluación.
- Entrenamiento reproducible desde cero con `lerobot-train` sobre datasets en formato LeRobot.
- Integración con el ecosistema LeRobot y el Hub de Hugging Face para versionado y distribución de checkpoints.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso
- Automatización de pick and place en laboratorio: la política predice trayectorias de agarre y colocación a partir de imágenes de la escena, adecuada para prototipos de manipulación sobre SO100 en entornos controlados.
- Reproducción de experimentos de investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de Diffusion Policy con el mismo dataset y pipeline LeRobot.
- Evaluación de pipelines LeRobot de extremo a extremo: permite validar el flujo `lerobot-train` → publicación en Hub → `lerobot-record` con `--policy.path` apuntando a este repositorio.
- Base para fine-tuning sobre nuevas tareas de manipulación: al estar en formato safetensors y licencia Apache 2.0, puede reentrenarse con datasets propios de pick and place sin restricciones de licencia.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (1,1 GB) para ilustrar el ciclo de vida de una política de difusión en robótica.
- Integración en cadenas de evaluación automatizada: el checkpoint puede cargarse por script para medir tasas de éxito en episodios de evaluación (`--episodes=10`) y comparar configuraciones de hardware.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (266,6 M parámetros, 1,1 GB en safetensors) se estima que la inferencia en precisión completa requiere del orden de 1-2 GB de VRAM, sin contar activaciones y buffers de difusión, que no están documentados.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento de la model card usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- GPU de consumo: por el tamaño reducido del checkpoint, es plausible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, pero no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con integración al Hub de Hugging Face. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros modelos de política robótica comparables (por ejemplo, otras políticas Diffusion Policy o ACT publicadas en LeRobot) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa. La model card menciona únicamente `--policy.type=act` como alternativa de entrenamiento en LeRobot, sin cifras asociadas.

## Limitaciones y advertencias
- Ámbito muy restringido: es una política específica para pick and place sobre SO100; no generaliza a otras tareas, morfologías de robot o entornos sin reentrenamiento.
- Sin datos de evaluación: no hay tasas de éxito ni métricas publicadas, por lo que se desconoce su fiabilidad real en producción.
- Dataset de entrenamiento no caracterizado: se desconoce el número de episodios, la variabilidad de objetos, iluminación y posiciones, lo que impide estimar su robustez y sus sesgos.
- Riesgo de sobreajuste al entorno de recogida de datos: las políticas de imitación suelen degradarse ante cambios de cámara, fondo, iluminación o disposición de objetos no vistos en entrenamiento.
- Sin descargas ni validación comunitaria: el repositorio no registra descargas ni likes, por lo que no hay evidencia externa de reproducibilidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero no se ofrece garantía alguna por parte del autor.
- Caveat de producción: antes de desplegar es necesario validar latencia de inferencia, frecuencia de control y estabilidad de la política en el hardware objetivo, datos no documentados en la model card.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/YuBin103/pick_and_place_1102_ddpm_100k
- Dataset de entrenamiento: https://huggingface.co/datasets/YuBin103/pick_and_place_1102_20261102_194727
- Paper Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
