# yhks/diffusion_my_task

## Resumen

`yhks/diffusion_my_task` es una política de control visuomotor entrenada con Diffusion Policy, un método que formula la generación de acciones robóticas como un proceso de difusión generativo. El modelo lo publica el usuario yhks en Hugging Face mediante la librería LeRobot de Hugging Face, y está diseñado para una tarea concreta de manipulación: agarrar un cubo negro. Con 277.839.110 parámetros y un repositorio de 1,1 GB, es una política compacta orientada a inferencia en tiempo real sobre un robot físico.

La relevancia de esta ficha no está en el modelo en sí, sino en lo que representa: un ejemplo canónico del flujo de trabajo de imitación robótica de LeRobot, desde la grabación de 50 episodios (44.947 fotogramas a 30 FPS) hasta el despliegue con `lerobot-rollout`. Diffusion Policy es especialmente adecuada para tareas con contacto rico, donde los métodos de regresión directa tienden a producir trayectorias temblorosas o multimodales mal resueltas.

El modelo consume el estado articular de 6 dimensiones y dos cámaras RGB de 480x640 (`overhead` y `wrist`), y produce un vector de acción de 6 dimensiones. No es un modelo de lenguaje ni un modelo fundacional general: es una política especializada, de un solo task, sin evaluación publicada y con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (difusión para control visuomotor), red neuronal condicionada por observaciones; detalles internos de la red no disponibles |
| Parametros totales | 277.839.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la instrucción de tarea es una cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

Diffusion Policy trata el control visuomotor como un proceso generativo: en lugar de predecir una acción única mediante regresión, aprende a denoizar una secuencia de acciones condicionada por las observaciones (estado articular e imágenes). Esto permite representar distribuciones multimodales de acciones y producir trayectorias suaves de varios pasos, lo que mejora el rendimiento en manipulación con contacto rico. El paper de referencia es arXiv:2303.04137. Los detalles concretos de la red (número de pasos de difusión, tipo de backbone visual, horizonte de predicción) no están documentados en la model card.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `yhks/my_task`: 50 episodios, 44.947 fotogramas a 30 FPS, tarea "Grab the black cube". La configuración reportada es 100.000 pasos, batch size 2, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documenta composición del dataset más allá del recuento, ni uso de RLHF/DPO (no aplica a este tipo de política), ni aumentos de datos. El robot objetivo es `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para control de un brazo robótico de 6 grados de libertad.
- Control visuomotor a partir de dos vistas RGB simultáneas (cámara cenital y de muñeca) más el estado articular.
- Ejecución de una única tarea de manipulación: agarrar un cubo negro.
- Producción de acciones suaves y multimodales gracias a la formulación por difusión.
- Inferencia en tiempo real a 30 FPS (frecuencia de grabación del dataset) mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de una celda de pick-and-place en laboratorio**: desplegar la política sobre un SO-100 con las dos cámaras configuradas para recoger objetos de geometría y color similares al cubo negro entrenado. Adecuado por su bajo coste computacional y su integración directa con `lerobot-rollout`.
- **Prototipado rápido de imitación robótica**: usar este repositorio como plantilla para grabar 50 episodios propios y reentrenar con `lerobot-train --policy.type=diffusion`, aprovechando la configuración de entrenamiento ya validada (100k pasos, batch 2, lr 1e-4).
- **Docencia y formación en aprendizaje por imitación**: servir de ejemplo reproducible del pipeline completo de LeRobot (grabación, entrenamiento, rollout) en cursos de robótica, dado que el dataset y la política son públicos y la licencia Apache 2.0 lo permite.
- **Investigación en manipulación con contacto rico**: comparar la formulación por difusión frente a políticas de regresión (ACT, VQ-BeT) en una tarea de agarre concreta, midiendo suavidad de trayectoria y tasa de éxito.
- **Validación de hardware y calibración**: emplear la política como banco de pruebas para verificar la calibración del brazo, la sincronización de las cámaras a 30 FPS y la latencia del lazo de control antes de abordar tareas más complejas.
- **Generación de datos sintéticos de evaluación**: ejecutar la política en simulación o en un gemelo digital del SO-100 para generar trayectorias de referencia y comparar con las grabadas por operadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 277,8 M de parámetros en FP32, los pesos ocupan aproximadamente 1,1 GB; en FP16, unos 0,56 GB. La memoria total depende del backbone visual y del número de pasos de difusión, no documentados; una estimación conservadora sitúa el pico en 2-4 GB en FP16.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Una RTX 3060, RTX 4060 o RTX 4090 cubren el caso con holgura; para entrenamiento, una RTX 3090/4090 o A100 acelera los 100.000 pasos.
- **Cabe en GPU de consumo**: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante), dado el reducido tamaño del modelo.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial) y el ecosistema LeRobot en PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control.
- **Latencia y throughput**: no disponibles de forma explícita. El lazo de control debe operar a 30 FPS (33 ms por paso) para coincidir con la frecuencia de entrenamiento; el coste por paso depende del número de iteraciones de difusión, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yhks/diffusion_my_task` | 277,8 M | Diffusion Policy (LeRobot) | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT (Action Chunking Transformer) | no disponible | Transformer de imitación | no disponible | MIT (repo original) | Repo público, integrado en LeRobot |
| VQ-BeT | no disponible | Transformer con cuantización vectorial | no disponible | MIT (repo original) | Repo público, integrado en LeRobot |
| Diffusion Policy (implementación original) | no disponible | Difusión | no disponible | MIT | Repo público en GitHub |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este modelo ni datos de rendimiento en la model card. A nivel cualitativo, Diffusion Policy se distingue de ACT y VQ-BeT por su formulación generativa, que suele mejorar en tareas con contacto rico a costa de mayor latencia de inferencia por los pasos de difusión.

## Limitaciones y advertencias

- **Sobreajuste a una única tarea**: entrenada exclusivamente para "Grab the black cube"; no generaliza a otros objetos, posiciones ni instrucciones sin reentrenamiento.
- **Dataset muy reducido**: 50 episodios y 44.947 fotogramas son insuficientes para robustez ante cambios de iluminación, distractores o variaciones de posición no representadas.
- **Sin evaluación publicada**: no hay tasa de éxito medida, por lo que no se puede afirmar que la política funcione de forma fiable en robot real.
- **Dependencia del hardware exacto**: requiere un `so_follower` con dos cámaras en las posiciones `overhead` y `wrist`; cambios de montaje, calibración o índices de cámara invalidan la política.
- **Riesgo de alucinación de acciones**: como todo modelo generativo, puede producir trayectorias plausibles pero incorrectas ante observaciones fuera de distribución; en robótica esto se traduce en colisiones o agarres fallidos.
- **Sin capacidades lingüísticas**: el campo `task` es una cadena fija; no interpreta instrucciones variables.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el paper de Diffusion Policy y LeRobot según la model card.
- **Cero tracción comunitaria**: 0 descargas y 0 likes en el momento de la ficha; no hay issues, demos ni reportes de terceros que validen el modelo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/yhks/diffusion_my_task
- Dataset de entrenamiento: https://huggingface.co/datasets/yhks/my_task
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=yhks/my_task
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
