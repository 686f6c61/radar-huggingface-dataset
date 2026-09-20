# vis22/act_stack_50

## Resumen

`vis22/act_stack_50` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso de control. El modelo lo publica el usuario `vis22` y ha sido entrenado y subido al Hub mediante LeRobot, la librería de HuggingFace para aprendizaje automático en robótica real. No es un modelo de lenguaje: su entrada son observaciones del robot (estado de 7 dimensiones y dos imágenes de cámara) y su salida es un vector de acción de 7 dimensiones.

La política está especializada en una única tarea: apilar todos los platos sobre el plato azul y volver a la posición de reposo. Se entrenó con el dataset `vis22/mod_plates_stack`, compuesto por 41 episodios teleoperados (20.489 fotogramas a 30 FPS) sobre un robot de tipo `piper_follower` con dos cámaras (`cam_global` y `cam_gripper`). El modelo tiene 51.619.463 parámetros (unos 51,6 millones) en formato safetensors, con un repositorio de 0,2 GB.

Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot, desde la captura de datos con teleoperación hasta el despliegue con `lerobot-rollout`. La model card no incluye resultados de evaluación en robot real, por lo que su tasa de éxito no está verificada públicamente. Las fechas de creación y actualización del repositorio que figuran en los metadatos son del 20 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con acción por chunks (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.619.463 (51,6 M) |
| Longitud de contexto | no disponible; la política opera sobre observaciones en tiempo real, no sobre ventanas de texto |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instrucción de tarea se pasa como cadena de texto en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `piper_follower` |
| Cámaras de entrada | `cam_global`, `cam_gripper` (3 × 480 × 640 cada una) |
| Entrada de estado | `observation.state`, forma `(7,)` |
| Salida de acción | `action`, forma `(7,)` |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | `vis22/mod_plates_stack` (41 episodios, 20.489 fotogramas, 30 FPS) |
| Versión de LeRobot | 0.6.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. En lugar de predecir una acción por paso de control, el modelo predice un chunk de acciones futuras, lo que reduce el problema de horizonte de planificación y suaviza la varianza temporal típica de las políticas paso a paso. La arquitectura combina un codificador visual para cada cámara, un codificador del estado del robot y un transformer que genera el chunk de acciones; el pipeline completo se implementa en LeRobot (`--policy.type=act`).

El entrenamiento se realizó durante 100.000 pasos con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos proceden exclusivamente de teleoperación sobre el dataset `vis22/mod_plates_stack`, con la instrucción "Stack all the plates on top of the blue plate, then return to home position". No se documenta en la información disponible el uso de RLHF, DPO ni de un dataset adicional; se trata, por tanto, de imitación supervisada pura sobre demostraciones humanas.

## Capacidades

- Generación de acciones de control robótico: produce vectores de acción de 7 dimensiones a partir de estado y visión.
- Predicción por chunks de acción, orientada a movimientos suaves y consistentes en tareas de manipulación.
- Percepción visual con dos cámaras simultáneas: una global de escena y otra en el efector final (gripper).
- Ejecución de una tarea específica de apilado de platos seguida de retorno a la posición de reposo.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general de propósito abierto, audio ni otras modalidades.

## Casos de uso

- Demostración reproducible de aprendizaje por imitación: usar la política como referencia para validar que la instalación de LeRobot, la calibración del robot `piper_follower` y las dos cámaras funcionan antes de entrenar políticas propias.
- Automatización de una celda de apilado de platos: el modelo ejecuta la secuencia completa de apilado y retorno a home, adecuado para prototipos de manipulación en línea de laboratorio.
- Base para fine-tuning con datos propios: al ser una política ACT de 51,6 M de parámetros con licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset nuevo de pocas decenas de episodios.
- Generación de nuevos datasets con política preentrenada: usar `lerobot-rollout` con `--strategy.type=base` para ejecutar la política sin grabar y, en otras configuraciones, registrar episodios de evaluación.
- Benchmark interno de manipulación: comparar tasas de éxito frente a otras políticas (Diffusion Policy, VQ-BeT) sobre la misma tarea y el mismo robot para decidir la arquitectura de producción.
- Investigación en percepción visomotora con dos cámaras: analizar la contribución de la cámara de gripper frente a la cámara global en tareas de precisión con objetos apilables.
- Formación y docencia en robótica: ejemplo didáctico de pipeline completo (teleoperación, dataset, entrenamiento, despliegue) con un coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet". No se dispone, por tanto, de tasas de éxito en robot real ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,2 GB para los pesos en fp32 (51,6 M de parámetros) y del orden de 1-2 GB contando los codificadores visuales, las dos imágenes de 480 × 640 × 3 y el contexto de ejecución de CUDA. Es una estimación, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente es suficiente; una RTX 3060 o superior resulta holgada. Una RTX 4090, A100 o H100 no aportan ventaja relevante por tamaño de modelo, salvo por margen de latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con CUDA y en muchos casos también en CPU, aunque con mayor latencia.
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout`), entrenamiento con `lerobot-train` y ejecución sobre PyTorch con `--policy.path=vis22/act_stack_50`. Los servidores de inferencia para modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables a esta política.
- Latencia y throughput: no disponibles oficialmente. Como referencia indirecta, los datos de entrenamiento se capturaron a 30 FPS, frecuencia habitual del bucle de control en este tipo de configuraciones.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `vis22/act_stack_50` (este modelo) | ACT, imitación con chunks | 51,6 M | no aplica | apache-2.0 | Hub de HuggingFace vía LeRobot | Sin datos de evaluación publicados |
| Diffusion Policy | Imitación generativa con difusión | no disponible | no aplica | no disponible | Implementaciones de referencia públicas | No disponible en la información proporcionada |
| VQ-BeT | Imitación con discretización de acciones | no disponible | no aplica | no disponible | Repositorios públicos | No disponible en la información proporcionada |
| SmolVLA | VLA de imitación con componente de lenguaje | no disponible | no aplica | no disponible | Ecosistema LeRobot | No disponible en la información proporcionada |

No se dispone de cifras verificadas de parámetros ni de rendimiento para las alternativas dentro de la información proporcionada; la comparación es, por tanto, únicamente cualitativa.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot, incluso en la tarea para la que fue entrenada.
- Entrenamiento con solo 41 episodios y una única tarea: alta probabilidad de sobreajuste al entorno, posiciones de objetos e iluminación concretos de la grabación.
- Específico para el robot `piper_follower`: la política espera exactamente ese tipo de robot y esas dos cámaras con los mismos nombres de observación. Usarla en otro hardware requiere reentrenar.
- Sensibilidad a cambios de escena: el propio template de la model card advierte de que cambios en posiciones de objetos, iluminación, distractores o un robot distinto del mismo tipo afectan a la dificultad.
- Dependencia del texto de tarea: la instrucción debe coincidir con la usada en entrenamiento ("Stack all the plates on top of the blue plate, then return to home position").
- Riesgo de alucinación en el sentido de acciones erráticas o inseguras ante observaciones fuera de distribución; no existe mecanismo de verificación semántica.
- Sin capacidades de lenguaje, razonamiento ni diálogo: no debe confundirse con un modelo conversacional ni usarse como tal.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte, y no se documentan avisos adicionales sobre datos de entrenamiento o sesgos.
- Sin tracción en el Hub: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que el modelo haya sido validado por terceros.
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo (devolvieron páginas de una cadena de supermercados), por lo que no hay fuentes externas que confirmen o amplíen los datos de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vis22/act_stack_50
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/mod_plates_stack
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/mod_plates_stack
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
