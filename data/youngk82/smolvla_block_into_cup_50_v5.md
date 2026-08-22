# YoungK82/smolvla_block_into_cup_50_v5

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico mediante instrucciones en lenguaje natural. Este repositorio contiene un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario YoungK82, especializado en una tarea concreta: recoger un bloque y colocarlo dentro de una taza. El modelo cuenta con 450 millones de parámetros, lo que lo sitúa en el rango de los modelos pequeños capaces de ejecutarse en hardware de consumo, una característica clave frente a otros VLA de gran tamaño.

La arquitectura se basa en SmolVLM, un modelo multimodal ligero, al que se añade una cabeza de acción para generar comandos motores. Este ajuste se ha realizado mediante aprendizaje por imitación sobre un conjunto de datos propio de 50 episodios grabados con un robot tipo `so_follower` y tres cámaras (frontal, superior y de muñeca). El resultado es un modelo altamente especializado, no un modelo generalista, pensado para desplegarse en robots reales en entornos de investigación o automatización de bajo coste.

La relevancia actual del modelo radica en su accesibilidad: con solo 450 millones de parámetros, puede ejecutarse en GPUs de consumo, lo que democratiza la robótica inteligente y permite a desarrolladores e investigadores experimentar con políticas VLA sin necesidad de infraestructura de alto coste. Aunque el modelo no publica resultados de evaluación, su diseño compacto y su licencia Apache 2.0 lo hacen atractivo para prototipado y estudio académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (SmolVLM + head de acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en inglés, pero no es un modelo de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, una arquitectura que combina un modelo de visión-lenguaje (VLM) preentrenado, SmolVLM, con un decodificador de acciones. La entrada incluye el estado del robot (6 dimensiones) y tres imágenes de 256x256 píxeles procedentes de cámaras frontal, superior y de muñeca. La salida es un vector de acción de 6 dimensiones que controla la posición y orientación del efector final. El entrenamiento se realiza mediante aprendizaje por imitación (imitation learning) sobre un conjunto de datos propio con 50 episodios y 36.572 fotogramas a 30 FPS, con la tarea fija de "recoger el bloque y colocarlo en la taza". El ajuste fino se llevó a cabo durante 20.000 pasos con un tamaño de lote de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001, utilizando la librería LeRobot en su versión 0.6.1. No se ha aplicado refuerzo por retroalimentación humana (RLHF) ni otros métodos de optimización adicionales.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad para un robot tipo `so_follower`.
- Percepción multi-cámara: procesa tres imágenes simultáneas (frontal, superior y muñeca) para guiar la manipulación.
- Ejecución de tareas específicas de pick-and-place: el modelo está entrenado para la tarea concreta de recoger un bloque y colocarlo en una taza.
- Aprendizaje por imitación: se entrena a partir de demostraciones humanas o teleoperadas, lo que permite adaptación a entornos concretos.
- Despliegue en tiempo real: el tamaño compacto permite inferencia a 30 FPS en hardware de consumo.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para grabación, entrenamiento y rollout en robots.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger y colocar objetos en una posición fija, útil para líneas de montaje sencillas o laboratorios de robótica.
- Prototipado de políticas robóticas en investigación: al ser pequeño y entrenable con pocos datos (50 episodios), es ideal para validar algoritmos de aprendizaje por imitación en entornos académicos.
- Robots educativos y de demostración: su tamaño reducido permite ejecutarlo en un ordenador con GPU de gama media, facilitando su uso en cursos de robótica o talleres.
- Evaluación de arquitecturas VLA compactas: sirve como punto de referencia para comparar la eficiencia de modelos pequeños frente a alternativas de gran escala.
- Integración en sistemas de teleoperación: el modelo puede usarse para reproducir movimientos grabados, reduciendo la carga del operador en tareas repetitivas.
- Investigación sobre generalización de políticas: aunque no está diseñado para ello, puede utilizarse para estudiar los límites de generalización de un modelo entrenado en una única tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación en robot real ni comparaciones con otros modelos. Por tanto, no se dispone de datos cuantitativos de rendimiento para esta tarea concreta.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de 450 millones de parámetros, se estima que puede ejecutarse en una GPU con al menos 4 GB de VRAM en precisión FP32, y menos con cuantización.
- GPUs recomendadas: tarjetas de consumo como la NVIDIA RTX 3060 (12 GB) o superiores. No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, el diseño de SmolVLA está orientado a hardware de consumo, como se indica en la documentación oficial.
- Opciones de despliegue: se puede ejecutar mediante la librería LeRobot (`lerobot-rollout`), y probablemente con herramientas como vLLM o llama.cpp si se convierte el modelo a GGUF, aunque no está documentado oficialmente.
- Latencia y throughput: no se han publicado datos específicos, pero por el tamaño del modelo y la naturaleza de la tarea, se espera una latencia de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de benchmarks directos, pero se puede comparar a nivel de parámetros y enfoque con otros VLA conocidos:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | Apache-2.0 | VLA compacto, orientado a hardware de consumo |
| OpenVLA | 7B | no disponible | MIT | VLA grande, requiere GPU de alta gama |
| RT-2 | 55B | no disponible | Propietario | VLA masivo, no open source |

La principal ventaja de SmolVLA frente a OpenVLA o RT-2 es su tamaño reducido y su disponibilidad abierta, lo que permite desplegarlo en entornos con recursos limitados. Sin embargo, su capacidad de generalización es menor, ya que está entrenado para una tarea específica.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea de recoger un bloque y colocarlo en una taza. No generaliza a otras tareas o variaciones de la escena.
- Dependencia del conjunto de datos: entrenado con 50 episodios, lo que limita la robustez ante cambios de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no se han reportado tasas de éxito en robot real, por lo que su rendimiento efectivo es incierto.
- Requisitos de configuración: necesita la configuración exacta de cámaras y robot (tipo `so_so`) para funcionar correctamente.
- Riesgo de alucinación en acciones: al ser un modelo de aprendizaje por imitación, puede generar acciones inconsistentes si la entrada difiere mucho del entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es un producto final; es una herramienta de investigación.
- No es un modelo de lenguaje general: no soporta conversación ni generación de texto, solo control robótico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/YoungK82/smolvla_block_into_cup_50_v5
- Dataset de entrenamiento: https://huggingface.co/datasets/YoungK82/so101_block_into_cup_50_v5
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Blog oficial de SmolVLA: https://huggingface.co/blog/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
