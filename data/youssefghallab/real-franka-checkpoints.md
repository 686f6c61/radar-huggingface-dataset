# YoussefGhallab/real-franka-checkpoints

## Resumen

Real-robot Franka checkpoints es una colección de pesos ajustados (fine-tuning) del modelo generativo de vídeo NVIDIA Cosmos-Predict2-2B-Video2World, adaptados como política de control robótico para un brazo Franka. El autor, YoussefGhallab, publica los checkpoints resultantes de un proceso de aprendizaje continuo (continual learning) sobre tres tareas secuenciales: apilar cuencos en orden de tamaño, colocar frutas en un plato y colocar un anillo en una varilla. El modelo se enmarca en la línea de trabajo REGEN (world-action model), que reutiliza un modelo de mundo vídeo-a-acción como base para generar acciones motoras.

La relevancia de esta publicación es acotada pero concreta: demuestra la aplicación de un modelo de difusión de vídeo de 2B parámetros como política robótica real, con wrappers de inferencia que reciben dos imágenes y un estado de 7 dimensiones y emiten un chunk de 16x7 acciones. No es un modelo de propósito general ni un LLM: es un artefacto de investigación reproducible para experimentos de manipulación con Franka.

La información disponible es escasa: no hay datos de benchmarks, idiomas, cuantizaciones ni parámetros activos. El repositorio ocupa 27,4 GB y la licencia se declara como "other", derivada de los términos de NVIDIA Cosmos-Predict2-2B-Video2World.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo vídeo-a-acción basado en NVIDIA Cosmos-Predict2-2B-Video2World (difusión) |
| Parametros totales | 2B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (derivada de NVIDIA Cosmos-Predict2-2B-Video2World) |
| Formato de pesos | no disponible (repo de 27,4 GB; la model card no detalla el formato) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Cosmos-Predict2-2B-Video2World, un modelo generativo de vídeo de 2B parámetros, y se ajusta como política de control para un brazo Franka. La interfaz de inferencia descrita en la model card recibe dos imágenes más un estado de 7 dimensiones y produce un chunk de 16x7 acciones, lo que corresponde a un esquema de acción por chunks típico de políticas visomotoras. Los wrappers `regen_policy_absolute.py` y `regen_policy_delta.py` implementan dos modos de acción (absoluta y delta), y para las etapas de frutas y anillo se pasa un prompt de instrucción en el campo `instruction`.

El entrenamiento se realizó mediante aprendizaje continuo sobre tres datasets privados del autor: `YoussefGhallab/stack_bowls_in_size_order_rc`, `YoussefGhallab/place_fruits_on_plate_rc` y `YoussefGhallab/place_ring_on_rod_rc`. No se especifican en la información disponible el número de tokens, la composición exacta de los datos, ni si se aplicaron técnicas de RLHF o DPO. El código de referencia es REGEN (commit `ccee162`), y el repositorio incluye un directorio `shim/` que sustituye a `flash_attn` y `transformer_engine`.

## Capacidades

- Generación de acciones motoras para un brazo Franka a partir de dos imágenes y un estado de 7 dimensiones.
- Producción de chunks de acción de 16x7, adecuados para control por bloques.
- Soporte de dos modos de acción: absoluta y delta, mediante wrappers separados.
- Condicionamiento por instrucción textual en las etapas de frutas y anillo (campo `instruction`).
- Aprendizaje continuo secuencial sobre tres tareas de manipulación.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Investigación en manipulación robótica con Franka: el modelo sirve como política de referencia para reproducir las tareas de apilado de cuencos, colocación de frutas y colocación de anillos, usando los wrappers y guías de despliegue incluidos.
- Evaluación de aprendizaje continuo: permite estudiar cómo el ajuste secuencial sobre tres tareas afecta al rendimiento en cada una, comparando los checkpoints por etapa.
- Prototipado de políticas vídeo-a-acción: el esquema de entrada (dos imágenes + estado 7D) y salida (chunk 16x7) es un punto de partida para integrar el modelo en bucles de control propios.
- Comparación de modos de acción: los wrappers absoluto y delta permiten medir el efecto del espacio de acción en la estabilidad del control.
- Reproducción de experimentos REGEN: el repositorio incluye el shim para `flash_attn` y `transformer_engine`, lo que facilita replicar el entorno sin esas dependencias.
- Docencia y divulgación: como ejemplo concreto de reutilización de un modelo generativo de vídeo como política robótica, con instrucciones de despliegue paso a paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB libres en GPU, según indica la model card.
- GPU recomendadas: no se especifican modelos concretos; la referencia a 20 GB libres apunta a GPUs de gama alta (por ejemplo, A100 40 GB, RTX 4090 24 GB) como mínimo práctico.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) por el requisito de 20 GB, aunque no está confirmado en la información disponible.
- Opciones de despliegue: inferencia con PyTorch 2.7 y CUDA, usando el código REGEN (commit `ccee162`) y los wrappers `regen_policy_absolute.py` / `regen_policy_delta.py`; el directorio `shim/` sustituye a `flash_attn` y `transformer_engine`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YoussefGhallab/real-franka-checkpoints | 2B (base Cosmos-Predict2-2B-Video2World) | no disponible | Política robótica Franka (3 tareas) | other | Hugging Face, 0 descargas |
| SeonghuJeon/franka-realrobot-final-checkpoints | no disponible | no disponible | Checkpoints de fine-tuning Franka real | no disponible | Hugging Face, checkpoints compactos .pt |
| NVIDIA Cosmos-Predict2-2B-Video2World | 2B | no disponible | Generación de vídeo mundo-acción | no disponible en la información | Modelo base en Hugging Face |

La comparativa es limitada: no hay datos públicos de rendimiento para ninguno de los tres, y el segundo repositorio solo se conoce por los resultados de búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datasets privados de un único entorno y robot, el modelo probablemente no generaliza fuera de esa configuración.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de acciones inválidas o inseguras en el robot; no se documentan mecanismos de seguridad.
- Limitaciones de contexto o idioma: no se dispone de información sobre ventana de contexto ni idiomas; el condicionamiento textual solo se usa en dos de las tres etapas.
- Restricciones de licencia: licencia "other" derivada de NVIDIA Cosmos-Predict2-2B-Video2World; es necesario revisar los términos del modelo base antes de redistribuir o usar comercialmente.
- Caveats para producción: repositorio con 0 descargas y 0 likes, sin benchmarks publicados; los checkpoints están pensados para investigación y reproducción, no para despliegue en producción. El requisito de ~20 GB de VRAM y las dependencias específicas (PyTorch 2.7, shim para `flash_attn` y `transformer_engine`) añaden fricción de integración.
- Los datos de entrenamiento son privados, lo que impide auditar la composición del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/YoussefGhallab/real-franka-checkpoints
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2-2B-Video2World
- Código REGEN: https://github.com/ManishGovind/REGEN (commit `ccee162`)
- Dataset de apilado de cuencos: https://huggingface.co/datasets/YoussefGhallab/stack_bowls_in_size_order_rc
- Dataset de frutas: https://huggingface.co/datasets/YoussefGhallab/place_fruits_on_plate_rc
- Dataset de anillo: https://huggingface.co/datasets/YoussefGhallab/place_ring_on_rod_rc
- Repositorio comparable: https://huggingface.co/SeonghuJeon/franka-realrobot-final-checkpoints
