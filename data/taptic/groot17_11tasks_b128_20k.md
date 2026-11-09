# TAPTIC/groot17_11tasks_b128_20k

## Resumen

GR00T N1.7 TAPTIC 11 tasks es un ajuste fino (fine-tuning) del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, publicado por el usuario TAPTIC. El modelo parte de la arquitectura GR00T N1.7 de NVIDIA, un modelo visión-lenguaje-acción (VLA) de 3.144 millones de parámetros diseñado para control robótico de propósito general, y lo especializa en un conjunto de 11 tareas manipulativas sobre un entorno con brazo Panda y mano robótica XHand.

El ajuste se ha realizado con la librería LeRobot 0.6.2 sobre el dataset privado `TAPTIC/multitask_11tasks_reduced`, compuesto por 715 episodios y 239.000 fotogramas a 10 fps. El modelo consume dos cámaras (muñeca e izquierda) más un vector de estado de 40 dimensiones (7 articulaciones del Panda, 12 articulaciones de la XHand, 15 fuerzas en los dedos y pose del efector final de 6 dimensiones) y produce una acción de 18 dimensiones (pose del efector final de 6 dimensiones más 12 articulaciones de la XHand) en fragmentos (chunks) de 40 pasos.

Es relevante como ejemplo de adaptación de un VLA fundacional a un dominio concreto de manipulación diestra con retorno de fuerza, un escenario poco cubierto en los modelos públicos. No obstante, se trata de un checkpoint de investigación con cero descargas y sin model card extendida, por lo que su madurez para producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (modelo visión-lenguaje-acción, VLM con cabeza de acción; detalles internos no disponibles) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la componente lingüística hereda de GR00T N1.7) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 12,6 GB, librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `nvidia/GR00T-N1.7-3B`, un VLA de NVIDIA que combina un modelo visión-lenguaje con una cabeza generadora de acciones. En este ajuste concreto, el VLM se mantiene congelado (frozen) y solo se entrena la parte correspondiente a la política de acción, lo que reduce el coste computacional y preserva las representaciones visuales y lingüísticas del modelo base. La implementación se realiza mediante `GrootPolicy` de LeRobot 0.6.2.

El entrenamiento se ejecutó con batch 128 durante 20.000 pasos (aproximadamente 12 épocas sobre 715 episodios), con learning rate 1e-4 y scheduler coseno. El plan inicial era de 10.000 pasos, pero se extendió a 20.000 al reanudar desde el paso 6.000. Se aplicó aumento de imagen y se incluyeron las colas de los episodios en el entrenamiento (`drop_n_last_frames` a 0 en LeRobot). El 10 % de los episodios se reservó para evaluación. La entrada combina dos cámaras (muñeca e izquierda) con un estado de 40 dimensiones que incluye fuerzas en los dedos, y la salida es un chunk de 40 acciones de 18 dimensiones.

## Capacidades

- Control robótico de manipulación multitarea: 11 tareas entrenadas sobre brazo Panda y mano XHand.
- Política visión-lenguaje-acción: consume imágenes de dos cámaras y estado proprioceptivo para generar acciones.
- Integración de retorno de fuerza: el estado de entrada incluye 15 fuerzas en los dedos, lo que permite condicionar la acción al contacto.
- Generación de acciones en chunks de 40 pasos, adecuada para control a 10 fps.
- Control de pose del efector final (6 dimensiones) y de las 12 articulaciones de la XHand.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el contexto de esta ficha; el modelo está orientado exclusivamente a robótica.

## Casos de uso

- Manipulación diestra con retorno de fuerza: el modelo usa las 15 fuerzas de los dedos como parte del estado para ajustar el agarre en tareas que requieren control de contacto, algo que las políticas puramente visuales no capturan.
- Automatización de tareas repetitivas en laboratorio: al estar entrenado en 11 tareas sobre el mismo entorno Panda + XHand, puede desplegarse en una celda robotizada para tareas de pick-and-place, ensamblaje ligero o manipulación de objetos deformables.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar políticas VLA frente a políticas específicas en un conjunto multitarea con datos de fuerza.
- Evaluación de transferencia de modelos fundacionales: permite estudiar cuánto conocimiento de GR00T N1.7 se conserva al congelar el VLM y entrenar solo la cabeza de acción.
- Prototipado de control a 10 fps: el chunk de 40 acciones facilita el despliegue en lazos de control de baja frecuencia con interpolación.
- Benchmark interno de manipulación con mano antropomórfica: útil para equipos que trabajen con XHand y quieran una referencia de error en espacio abierto.

## Benchmarks y rendimiento

Los únicos datos publicados son errores en lazo abierto (open-loop) sobre los episodios reservados, calculados sobre las primeras 16 acciones de cada chunk:

| Checkpoint | Error posición (mm) | Error orientación (grados) | Error mano (grados) |
|---|---|---|---|
| step-006000 (main) | 34,97 | 6,33 | 5,33 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de robótica como LIBERO o CALVIN) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,14 B parámetros en fp16 se requieren aproximadamente 6,3 GB solo para pesos, más memoria para las dos cámaras y el estado, por lo que se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para fp16.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 y GPUs con 16 GB o más en fp16; en cuantización de 8 bits podría caber en 12 GB, aunque no hay soporte documentado.
- Opciones de despliegue: LeRobot 0.6.2 mediante `GrootPolicy.from_pretrained`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAPTIC/groot17_11tasks_b128_20k | 3,14 B | no disponible | Manipulación Panda + XHand (11 tareas) | no disponible | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-3B | 3 B (aprox.) | no disponible | VLA fundacional de robótica | no disponible en esta ficha | Hugging Face (modelo base) |
| Políticas específicas de LeRobot (p. ej. ACT, Diffusion Policy) | variable (decenas de M) | no disponible | Manipulación por imitación | Apache 2.0 (habitual en LeRobot) | Hugging Face / GitHub |

La comparación cuantitativa con alternativas no está disponible al no publicarse benchmarks comunes. Frente a políticas ligeras como ACT o Diffusion Policy, este modelo parte de un VLA de 3 B, lo que implica mayor coste de inferencia pero potencial de generalización desde el modelo fundacional.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de validación por terceros.
- Sin licencia declarada: no se puede asumir uso comercial; es necesario contactar con el autor.
- El dataset de entrenamiento es privado (`TAPTIC/multitask_11tasks_reduced`), lo que impide reproducir el ajuste.
- El VLM está congelado: el modelo no aprende nuevas representaciones visuales o lingüísticas, solo la política de acción.
- Entrenado exclusivamente para el entorno Panda + XHand; no se espera transferencia directa a otros robots o efefctores.
- Solo se publica un checkpoint (`step-006000`) con error en lazo abierto de 34,97 mm, que puede ser insuficiente para tareas de precisión.
- No hay información sobre sesgos, alucinación (en el sentido de generación de acciones inseguras) ni comportamiento fuera de distribución.
- El plan de entrenamiento se modificó a mitad (de 10k a 20k pasos), lo que puede afectar la reproducibilidad.
- No se documentan requisitos de seguridad para despliegue físico; cualquier uso en robot real requiere límites de par y paradas de emergencia externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TAPTIC/groot17_11tasks_b128_20k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset (referenciado, privado): https://huggingface.co/datasets/TAPTIC/multitask_11tasks_reduced
- Librería LeRobot: https://github.com/huggingface/lerobot
