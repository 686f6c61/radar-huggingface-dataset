# ThiennNguyen/act_so101_b64

## Resumen

El modelo `ThiennNguyen/act_so101_b64` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de acciones individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, y está diseñado para controlar un brazo robótico SO-101 (tipo `so_follower`) en tareas de manipulación teleoperada.

El modelo resuelve el problema de control robótico a partir de observaciones visuales y de estado, aprendiendo a replicar demostraciones humanas. Su relevancia radica en que ACT es uno de los métodos de imitación más eficaces en robótica, logrando altas tasas de éxito en tareas de manipulación con relativamente pocos datos. La arquitectura combina un codificador visual con un transformador que genera bloques de acciones, y el modelo cuenta con aproximadamente 51,7 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformadores que predice bloques de acciones (action chunks) en lugar de pasos individuales. La arquitectura utiliza un codificador visual que procesa imágenes de una cámara frontal (resolución 480x640) junto con el estado del robot (6 dimensiones), y un decodificador transformador que genera secuencias de acciones. El modelo emplea un enfoque de VAE condicional (CVAE) para modelar la variabilidad de las demostraciones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `ThiennNguyen/record_test_1508`, que contiene 100 episodios y 49.274 fotogramas a 30 FPS de la tarea "coger el caramelo y colocarlo en la cesta". La configuración de entrenamiento incluye 25.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al aprendizaje por imitación.

## Capacidades

- Control robótico por imitación: ejecuta tareas de manipulación aprendidas de demostraciones teleoperadas.
- Percepción visual: procesa imágenes RGB de una cámara frontal (480x640) para guiar la acción.
- Entrada de estado: utiliza 6 dimensiones de estado del robot (posiciones articulares o del efector).
- Salida de acciones: genera vectores de acción de 6 dimensiones para controlar el brazo SO-101.
- Predicción por bloques: emite secuencias de acciones (action chunks) que mejoran la estabilidad del control.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.

## Casos de uso

- Manipulación pick-and-place: el modelo está entrenado específicamente para recoger un caramelo y colocarlo en una cesta, demostrando capacidad para tareas de agarre y colocación.
- Automatización de tareas repetitivas en laboratorio: puede replicar demostraciones de manipulación en entornos controlados, reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre robots o entornos.
- Desarrollo de habilidades robóticas con datos limitados: con solo 100 episodios de demostración, el modelo demuestra que ACT puede aprender tareas con datasets pequeños.
- Benchmark de políticas ACT en el brazo SO-101: puede utilizarse como referencia para comparar configuraciones de entrenamiento, arquitecturas o datasets.
- Prototipado rápido de aplicaciones robóticas: gracias a la integración con LeRobot, permite desplegar la política en un robot real con comandos CLI sencillos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parametros, la inferencia es ligera. Con cuantizacion FP32, el modelo ocupa aproximadamente 207 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX 3060, RTX 4090, A100, etc.). Tambien es posible ejecutarlo en CPU para inferencia a baja frecuencia.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), integrable con robots SO-101 via puerto serie o USB. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependera del hardware y de la frecuencia de control requerida (el dataset se grabo a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThiennNguyen/act_so101_b64 | 51,7 M | no aplica | Pick-and-place (SO-101) | Apache 2.0 | Hugging Face |
| aiden-li/so101-act | no disponible | no aplica | Control SO-101 | no disponible | Hugging Face |
| dleon23/act-so101 | no disponible | no aplica | Control SO-101 | no disponible | Hugging Face |

Los tres modelos comparten la misma arquitectura ACT y el mismo robot objetivo (SO-101), pero no se dispone de datos comparativos de rendimiento ni de configuraciones de entrenamiento para los modelos alternativos.

## Limitaciones y advertencias

- Modelo especializado: esta entrenado exclusivamente para la tarea "coger el caramelo y colocarlo en la cesta" con el robot SO-101. No es transferible directamente a otras tareas o robots sin reentrenamiento.
- Dependencia del hardware: requiere el brazo SO-101 y una camara frontal con las mismas caracteristicas que las usadas en el entrenamiento (640x480, 30 FPS).
- Sin evaluacion publicada: no hay resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real en condiciones de despliegue.
- Dataset limitado: entrenado con 100 episodios de un unico operador, lo que puede limitar la generalizacion a nuevas posiciones, iluminacion o variaciones del entorno.
- Sin soporte multilingue ni de lenguaje: es un modelo de control motor, no un modelo de lenguaje; no procesa texto ni instrucciones verbales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThiennNguyen/act_so101_b64
- Dataset de entrenamiento: https://huggingface.co/datasets/ThiennNguyen/record_test_1508
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ThiennNguyen/record_test_1508
