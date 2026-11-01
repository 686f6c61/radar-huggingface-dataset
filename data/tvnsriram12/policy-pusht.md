# tvnsriram12/policy.pusht

## Resumen

`tvnsriram12/policy.pusht` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha subido el usuario tvnsriram12 a Hugging Face utilizando la librería LeRobot de Hugging Face, y resuelve una tarea concreta de manipulación: empujar un bloque con forma de T hasta una diana con la misma forma ("Push the T-shaped block onto the T-shaped target"). No es un modelo de lenguaje: es un controlador visuomotor que mapea una imagen de 96x96 píxeles y un estado de 2 dimensiones a una acción de 2 dimensiones.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de demostración o de un entrenamiento corto (200 pasos, batch 96, learning rate 1e-5), no de un modelo listo para producción. Su interés principal es como ejemplo reproducible del flujo de trabajo de LeRobot con ACT sobre el dataset estándar `lerobot/pusht`, muy utilizado como banco de pruebas de imitación en robótica.

El modelo tiene 51.660.418 parámetros (dato real de los safetensors), un repositorio de 2,1 GB y licencia Apache 2.0. La model card no declara resultados de evaluación en robot real ni datos de rendimiento, por lo que cualquier afirmación sobre su tasa de éxito sería especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones con chunking |
| Parametros totales | 51.660.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo robótico; no procesa lenguaje, aunque la tarea se pasa como cadena de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un encoder visual sobre la observación de imagen `(3, 96, 96)`, la concatenación del estado proprioceptivo `(2,)` y un transformer que genera la secuencia de acciones `(2,)` por chunk. El modelo se entrenó con LeRobot 0.6.1 y los pesos están en safetensors.

El entrenamiento se realizó sobre el dataset `lerobot/pusht`: 206 episodios, 25.650 frames a 10 FPS, con la tarea "Push the T-shaped block onto the T-shaped target". La configuración declarada es de solo 200 pasos de entrenamiento, batch size 96, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de ajuste posterior; es aprendizaje supervisado por imitación puro. Tampoco se detalla la composición exacta del dataset más allá de las cifras anteriores.

## Capacidades

- Control visuomotor para manipulación robótica: mapea imagen y estado a acciones de 2 dimensiones.
- Predicción de chunks de acciones, lo que permite ejecutar movimientos más estables que una política paso a paso.
- Aprendizaje por imitación a partir de datos de teleoperación (dataset `lerobot/pusht`).
- Entrada visual de baja resolución (96x96) y estado de 2 dimensiones, adecuada para tareas de empuje en mesa.
- Ejecución mediante `lerobot-rollout` con `--strategy.type=base` y `--policy.path=tvnsriram12/policy.pusht`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen de observación.

## Casos de uso

- Reproducción del flujo de LeRobot con ACT: sirve como ejemplo mínimo para verificar la instalación, el calibrado de hardware y la ejecución de una política desde el Hub antes de entrenar modelos propios.
- Banco de pruebas de imitación en robótica: el dataset `lerobot/pusht` es un estándar de facto para comparar variantes de ACT y otras políticas sobre una tarea de empuje reproducible.
- Docencia y formación: permite mostrar de extremo a extremo cómo se graba teleoperación, se entrena una política y se despliega en un robot real con comandos `lerobot-train` y `lerobot-rollout`.
- Punto de partida para fine-tuning: con 51,6 M de parámetros, es un modelo ligero que se puede reentrenar o adaptar a variantes de la tarea de empuje con recursos modestos.
- Validación de pipelines de datos: útil para comprobar la compatibilidad entre el formato del dataset, las claves de observación (`observation.image`, `observation.state`) y las cámaras configuradas en el robot.
- Pruebas de integración con hardware: al ejecutarse con `--robot.type=unknown` y cámaras OpenCV, sirve para depurar puertos, índices de cámara y frecuencias antes de desplegar políticas más costosas.
- Referencia para investigación en action chunking: permite inspeccionar los pesos y la configuración de entrenamiento declarada para estudiar el efecto del chunking en tareas de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros, los pesos en precisión de entrenamiento ocupan del orden de 200 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM es suficiente para ejecutar la política, aunque el cuello de botella real será la captura de cámara y el bucle de control a 10 FPS.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. La frecuencia de entrenamiento es de 10 FPS, pero no se declara la latencia de inferencia ni el throughput en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tvnsriram12/policy.pusht` | 51,6 M | no aplica | Empuje del bloque en T (`lerobot/pusht`) | Apache 2.0 | Hugging Face, 62 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas de imitación sobre `lerobot/pusht` y otros datasets | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy | no disponible | no aplica | Imitación visuomotora, alternativa a ACT | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot, por lo que no debe asumirse que la política funciona correctamente.
- Entrenamiento muy corto (200 pasos) con learning rate 1e-5: es plausible que el modelo esté infraentrenado, aunque esto no se puede confirmar sin evaluación.
- El tipo de robot es `unknown` en la model card: no se especifica la morfología ni el hardware para el que se calibró, lo que dificulta la reproducibilidad.
- Solo cubre una tarea concreta ("Push the T-shaped block onto the T-shaped target") sobre una mesa y con una cámara de 96x96; no generaliza a otras tareas ni a otras disposiciones de cámara sin reentrenamiento.
- Sensible a cambios de iluminación, posición de objetos, distracciones y a diferencias de calibración entre robots, como es habitual en políticas de imitación.
- No procesa lenguaje ni tiene capacidades de razonamiento, tool calling o agentes; la cadena de tarea se pasa como texto pero no se interpreta semánticamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- El repositorio ocupa 2,1 GB, desproporcionado respecto al tamaño de los pesos, lo que puede indicar artefactos adicionales (checkpoints, logs) no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tvnsriram12/policy.pusht
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
