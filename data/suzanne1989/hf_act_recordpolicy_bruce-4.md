# suzanne1989/hf_act_recordpolicy_bruce-4

## Resumen

`hf_act_recordpolicy_bruce-4` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. La desarrolla el usuario suzanne1989 y está distribuida a través de LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea concreta de manipulación: agarrar un bloque Duplo verde ("Grab the green duplo") con un robot del tipo `so_follower` (brazo tipo SO-100/SO-101).

Se trata de un transformer ligero de 51.668.614 parámetros (unos 51,7 millones) que consume el estado articular (6 dimensiones) y dos flujos de imagen de 480x640 píxeles (cámara de muñeca y cámara estática), y produce comandos de acción de 6 dimensiones. En lugar de predecir un único paso, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y estabiliza el control.

Es relevante ahora porque ejemplifica el flujo actual de robótica open source de bajo coste: datos de teleoperación, entrenamiento con LeRobot y despliegue directo en hardware asequible. No es un modelo de lenguaje: no procesa texto ni tiene capacidades conversacionales, sino que es una política visomotora específica de tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras de muñeca y estática) con un transformer que predice secuencias de acciones en lugar de pasos individuales. Esta predicción por fragmentos (chunking) mitiga el problema de la acumulación de errores típico de las políticas paso a paso y suaviza la ejecución. El modelo incorpora además una estrategia de "temporal ensembling" en la inferencia para promediar predicciones solapadas entre fragmentos, lo que contribuye a la robustez del control.

El entrenamiento se realizó sobre el dataset `suzanne1989/record-bruce`, con 120 episodios, 38.452 fotogramas a 30 FPS y una única tarea. La configuración reportada incluye 50.000 pasos de entrenamiento, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000, usando LeRobot 0.6.2. No se documenta el uso de RLHF/DPO ni de datos adicionales; es aprendizaje supervisado puro a partir de demostraciones de teleoperación.

## Capacidades

- Control visomotor para manipulación robótica: mapea observaciones (estado articular de 6 dimensiones y dos imágenes RGB de 480x640) a acciones de 6 dimensiones.
- Predicción de fragmentos de acción (action chunking) para movimientos más estables.
- Ejecución de una tarea concreta de agarre ("Grab the green duplo") sobre el robot `so_follower`.
- Integración con la pila LeRobot para entrenamiento, evaluación y despliegue (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- No tiene capacidades multilingües ni de visión general: las cámaras se usan exclusivamente como entrada de control.

## Casos de uso

- Automatización de una celda de pick-and-place de laboratorio: el modelo ejecuta el agarre de un bloque Duplo verde con el brazo SO, útil como banco de pruebas reproducible para comparar métodos de imitación.
- Base para transferencia a tareas similares: sirve como punto de partida para reentrenar con nuevos datasets de teleoperación y adaptar la política a otras piezas u objetos.
- Docencia y formación en robótica de imitación: permite mostrar el ciclo completo grabar datos, entrenar con LeRobot y desplegar en hardware de bajo coste.
- Prototipado rápido de pipelines de control: al ser ligero (51,7 M de parámetros), se puede iterar sobre la política en una estación de trabajo con GPU de consumo.
- Validación de infraestructura de datos: útil para verificar la cadena de grabación, calibración de cámaras y formato de observaciones antes de escalar a tareas más complejas.
- Referencia de reproducibilidad: al publicar dataset, configuración de entrenamiento y pesos, se puede replicar el experimento y auditar la metodología de ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no se han proporcionado resultados de evaluación en robot real (número de ensayos, éxitos y tasa de éxito).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el peso en precisión completa ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior permite ejecutar la política en tiempo real a 30 FPS junto con el procesamiento de dos cámaras.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la frecuencia de control del robot (los datos se grabaron a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suzanne1989/hf_act_recordpolicy_bruce-4` | 51,7 M | Agarre de bloque Duplo con `so_follower` | no aplica | Apache 2.0 | Hugging Face |
| `suzanne1989/hf_act_recordpolicy0` | no disponible | Política ACT del mismo autor | no aplica | no disponible | Hugging Face |
| Otros modelos ACT en LeRobot Hub | variable | Tareas de manipulación diversas | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: solo se ha entrenado para "Grab the green duplo"; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras (`wrist`, `static`) con la configuración exacta de observaciones; cambios de cámara o montaje invalidan la política.
- Sensibilidad a condiciones de entorno: cambios de iluminación, posición de objetos o distracciones pueden degradar el comportamiento, aunque no se documenta su magnitud.
- Dataset pequeño: 120 episodios y una sola tarea limitan la robustez y la diversidad de situaciones cubiertas.
- Sin capacidades de lenguaje: no debe emplearse para tareas de texto, razonamiento o conversación.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias de LeRobot y del método ACT citado.
- Riesgo de alucinación no aplicable en el sentido textual, pero sí de acciones erróneas o inseguras en el robot; se recomienda supervisión y límites de seguridad en el control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suzanne1989/hf_act_recordpolicy_bruce-4
- Dataset de entrenamiento: https://huggingface.co/datasets/suzanne1989/record-bruce
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=suzanne1989/record-bruce
- Política relacionada del mismo autor: https://huggingface.co/suzanne1989/hf_act_recordpolicy0
