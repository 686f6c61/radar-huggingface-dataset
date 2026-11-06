# YDY0427/Zero-HLM-Bench-GR00T

## Resumen

Zero-HLM-Bench-GR00T es una colección de tres checkpoints de política robótica derivados de NVIDIA GR00T-N1.7-3B, publicados por el usuario YDY0427 para su uso en el banco de evaluación Zero-HLM-Bench. No se trata de un modelo de lenguaje generativo, sino de un modelo de control visuomotor para el robot humanoide Unitree G1: cada checkpoint recibe observaciones RGB egocéntricas y el estado del robot, y predice secuencias de acciones de 40 pasos junto con un comando latente SONIC de 64 dimensiones y dos comandos de mano.

El modelo base, GR00T-N1.7-3B, es un modelo fundacional de NVIDIA para robótica humanoide con aproximadamente 3 mil millones de parámetros. Estos checkpoints son ajustes específicos por tarea (fine-tuning) sobre dicho modelo, uno por cada escenario del benchmark: recogida y colocación móvil, colocación de sombrero con alcance bajo y transporte de cesta asistido con las piernas. Cada tarea ocupa unos 6,9 GB de pesos, lo que da un repositorio total de 20,7 GB.

La relevancia de esta publicación es acotada y muy específica: sirve como referencia reproducible para evaluar políticas de loco-manipulación humanoide sin datos de robot real, tal como plantea el artículo Zero-HLM. No está pensada como modelo de propósito general, sino como artefacto de evaluación con licencia de investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional visuomotor para robótica (GR00T N1.7), política de predicción de acciones por chunks |
| Parametros totales | Aproximadamente 3B (heredados de nvidia/GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-research-evaluation (uso no comercial, solo investigación y evaluación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los checkpoints se basan en NVIDIA GR00T-N1.7-3B, un modelo fundacional para robótica humanoide de aproximadamente 3B de parámetros. La política consume observaciones RGB egocéntricas junto con el estado del robot y produce chunks de acción de 40 pasos, acompañados de un comando latente SONIC de 64 dimensiones y dos comandos de mano. Cada checkpoint incorpora sus propias estadísticas de normalización, que deben conservarse junto con los pesos; la tarea 3 almacena además ficheros de procesador en el subdirectorio `processor/`.

El ajuste se realizó por tarea sobre el modelo base. La model card indica que las selecciones de entrenamiento originales de estos checkpoints son distintas de los subconjuntos de entrenamiento publicados de 800 demostraciones por tarea, es decir, estos pesos corresponden a las configuraciones empleadas para la evaluación del benchmark y no necesariamente a los datos de entrenamiento liberados. No se detalla en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO; al tratarse de un modelo de control motor, esos conceptos no aplican de forma directa. Tampoco se especifican innovaciones de decodificación o atención más allá de lo heredado del modelo base.

## Capacidades

- Control visuomotor de robot humanoide Unitree G1 a partir de imágenes RGB egocéntricas y estado del robot.
- Predicción de chunks de acción de 40 pasos con comando latente SONIC de 64 dimensiones.
- Generación de dos comandos de mano independientes por inferencia.
- Ejecución de tareas de loco-manipulación específicas: recogida y colocación móvil (task1), colocación de sombrero con alcance bajo (task2) y transporte de cesta asistido con las piernas (task3).
- Integración con un servidor de política y un cliente de simulación mediante sockets (puerto configurable, por defecto 5555).
- No se documentan capacidades de tool calling, razonamiento multi-paso simbólico, visión general, audio ni modo thinking; son capacidades ajenas al propósito del modelo.

## Casos de uso

- Evaluación reproducible de políticas de loco-manipulación: usar los tres checkpoints con el repositorio Zero-HLM-Bench para obtener métricas comparables de éxito en las tareas definidas, gracias a que cada checkpoint incluye sus estadísticas de normalización.
- Investigación en aprendizaje por imitación sin datos reales: emplear estos pesos como referencia para estudiar la transferencia de políticas entrenadas en simulación al robot Unitree G1 en entornos simulados.
- Desarrollo de pipelines de simulación a realidad: probar el servidor de política (`start_server.py`) contra clientes de simulación propios para medir latencia y estabilidad de los chunks de acción de 40 pasos antes de un despliegue físico.
- Análisis de tareas de manipulación con asistencia de piernas: el checkpoint de la tarea 3 permite estudiar el uso coordinado de extremidades inferiores en el transporte de objetos, un escenario poco cubierto en benchmarks de manipulación.
- Comparación de estrategias de normalización y preprocesado: al incluir cada checkpoint sus propios ficheros de normalización y, en la tarea 3, un directorio `processor/`, sirve para evaluar el impacto del preprocesado en el rendimiento final.
- Reproducción de resultados del artículo Zero-HLM: descargar los checkpoints con `scripts/download_models.py --task all` y ejecutar la evaluación con las configuraciones del repositorio para verificar las cifras publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Cada checkpoint ocupa aproximadamente 6,9 GB en safetensors; en precisión completa (FP16/BF16) el modelo base de 3B requiere del orden de 6-8 GB de VRAM solo para pesos, más memoria para activaciones y buffers de observación.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente en tarjetas con 16-24 GB de VRAM, aunque no está verificado en la documentación.
- Opciones de despliegue: servidor de política propio del benchmark (`scripts/start_server.py`) y cliente de simulación (`scripts/start_client.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de control robótico de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zero-HLM-Bench-GR00T (este) | ~3B | no disponible | Control visuomotor humanoide Unitree G1, 3 tareas | nvidia-research-evaluation (no comercial) | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-3B | ~3B | no disponible | Modelo fundacional de robótica humanoide | no disponible en esta ficha | Hugging Face (modelo base) |
| Otros modelos de política robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (políticas de loco-manipulación humanoide) no está cubierta en la información proporcionada; solo se dispone del modelo base como referencia directa.

## Limitaciones y advertencias

- Licencia `nvidia-research-evaluation`: restringe el uso a investigación y evaluación, con prohibición explícita de uso comercial sobre los pesos derivados de GR00T. Los recursos de NVIDIA Cosmos mantienen además su propia licencia (Cosmos license).
- Modelo altamente especializado: solo cubre tres tareas concretas del benchmark sobre el robot Unitree G1; no es un modelo de propósito general ni transferible sin reentrenamiento.
- Dependencia del entorno de simulación: requiere el repositorio Zero-HLM-Bench, sus configuraciones de evaluación y el cliente de simulación correspondiente; no funciona de forma autónoma.
- Las estadísticas de normalización deben conservarse junto con los pesos; su pérdida o modificación invalida los resultados.
- Los checkpoints de evaluación no coinciden con los subconjuntos de entrenamiento publicados (800 demostraciones por tarea), lo que limita la reproducibilidad exacta del entrenamiento.
- Sin datos publicados de benchmarks, latencia ni requisitos de hardware verificados.
- Idiomas: solo inglés en la documentación y metadatos; irrelevante para la tarea de control, pero relevante para la documentación.
- Riesgo de sobreajuste al benchmark y de resultados no extrapolables a un robot físico real.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/YDY0427/Zero-HLM-Bench-GR00T
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio del benchmark: https://github.com/BIGAI-General-Vision-Lab/Zero-HLM-Bench
- Artículo: https://arxiv.org/abs/2610.35075
- Licencia NVIDIA: fichero `LICENSE` del repositorio
- Licencia Cosmos: fichero `COSMOS-LICENSE.md` del repositorio
- Atribuciones: fichero `NOTICE` del repositorio
