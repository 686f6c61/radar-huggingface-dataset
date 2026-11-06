# zjumty/real-smolvla-red-green-v2-local-20261103

## Resumen

`zjumty/real-smolvla-red-green-v2-local-20261103` es un fine-tuning de robótica del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) de la familia SmolVLA orientado a control de brazos robóticos. Lo publica el usuario zjumty como checkpoint final de inferencia tras 20.000 pasos de entrenamiento local sobre el robot SO101, con 450.046.176 parámetros guardados en FP32. El problema que aborda es concreto: ejecutar dos instrucciones de manipulación de mesa («meter el cubo verde en el bol de papel» y «meter el cubo rojo en el bol de papel») a partir de observaciones visuales de dos cámaras y del estado del brazo.

El modelo parte de la arquitectura SmolVLA, que combina un backbone VLM (en este caso `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`, revisión `7b375e1b73b11138ff12fe22c8f2822d8fe03467`) congelado durante el entrenamiento con un experto de acciones y proyecciones de estado entrenables. El entrenamiento se hizo sobre 262 episodios (75.880 frames) y se validó sobre 76 episodios (23.145 frames), con batch 32, AdamW a lr 1e-4 y sin AMP. Es relevante ahora porque documenta de forma reproducible (hashes SHA256, scripts de preparación de runtime, informes de evaluación) un caso de fine-tuning VLA de bajo coste en hardware de sobremesa, con resultados reales medidos en robot físico.

La publicación es deliberadamente limitada: el propio autor advierte que se trata de un experimento de mesa restringido, que las métricas de éxito proceden de revisión visual offline de vídeos y que no debe interpretarse como una garantía de generalización o de fiabilidad en despliegue. No hay licencia nueva declarada para los pesos ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM congelado + experto de acciones y proyecciones de estado entrenables) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP32) |
| Idiomas soportados | no disponible (instrucciones en inglés: dos frases fijas de tarea) |
| Licencia | no disponible (sin licencia nueva; aplican los términos del modelo base) |
| Formato de pesos | safetensors (repo de 1,8 GB; checkpoint guardado en FP32) |

## Arquitectura y entrenamiento

El modelo sigue el esquema SmolVLA de LeRobot: un backbone de visión-lenguaje `SmolVLM2-500M-Video-Instruct` que permanece congelado durante el ajuste, acoplado a un experto de predicción de acciones y a proyecciones de estado que sí se entrenan. La política consume dos flujos de vídeo RGB a 640×480 y 20 fps (cámara de muñeca renombrada a `camera1` y cámara lateral renombrada a `camera2`) junto con el estado del robot SO101, de 6 dimensiones, y produce acciones también de 6 dimensiones condicionadas por la instrucción textual.

El entrenamiento se realizó durante 20.000 pasos con batch 32, semilla 1000, AdamW con learning rate 1e-4, AMP desactivado y aumento de imagen desactivado. El scheduler oficial se reescaló a warmup 666 y decay 20.000 (frente al warmup 1.000 / decay 30.000 original). Se hicieron cuatro pasadas completas de validación (a 5k, 10k, 15k y 20k pasos, cada una de 23.145 frames). La pérdida final de flujo normalizada fue 0,4627183682 para verde y 0,4275088090 para rojo, que el autor subraya que no equivale a tasa de éxito real. El dataset de entrenamiento tiene 262 episodios / 75.880 frames y el de validación 76 episodios / 23.145 frames, empaquetados como raíces LeRobot separadas. Se preservan los hashes SHA256 del checkpoint de pesos (`16d9116230bf5bb8eba4f6a9c9bbf635df9f3d93869b04da3f66252ce3e44b85`), del split corregido y de las estadísticas de normalización ajustadas solo con train.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones para el brazo SO101 a partir de instrucciones en lenguaje natural.
- Condicionamiento por instrucción textual: distingue entre dos objetivos («Put the green cube into the paper bowl» y «Put the red cube into the paper bowl»).
- Percepción visual multi-cámara: procesa simultáneamente vídeo de muñeca y lateral a 640×480 y 20 fps.
- Política de imitación entrenada por flujo (flow matching) sobre demostraciones reales.
- Integración con el ecosistema LeRobot 0.6.1 (carga, preflight y rollout mediante scripts incluidos).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento general ni otras capacidades de lenguaje más allá de la instrucción de tarea.
- Capacidades multilingües: no disponible; las instrucciones documentadas están en inglés.

## Casos de uso

- Manipulación de pick-and-place en mesa: el modelo ejecuta la tarea de coger un cubo de color concreto y depositarlo en un bol de papel, usando las dos cámaras para localizar el objeto y el bol. Es su caso de uso principal y el único validado.
- Investigación en fine-tuning de VLA de bajo coste: sirve como referencia reproducible (hashes, scripts, informes) para replicar un ajuste de SmolVLA sobre un robot SO101 con recursos modestos.
- Clasificación de objetos por color en entornos controlados: la política distingue cubo verde y cubo rojo mediante la instrucción, útil como banco de pruebas de condicionamiento lingüístico en robótica.
- Evaluación de generalización posicional: el autor documenta un test de 16 ensayos con combinaciones de posiciones novedosas, útil para estudiar la robustez del modelo ante cambios de layout.
- Docencia y demostraciones de robótica de imitación: el checkpoint y los scripts de preflight permiten montar una demo reproducible de política VLA en un brazo SO101.
- Base para ablaciones controladas: al estar publicado con configuración exacta y estadísticas de normalización, puede usarse como punto de partida para comparar variantes de entrenamiento (aunque el autor advierte que v1 y v2 no son una ablación de una sola variable).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son evaluaciones en robot real:

| Evaluación | Resultado | Detalle |
|---|---|---|
| Layouts históricos C2/C3 (objetivo en bol) | 11/12 | verde 5/6, rojo 6/6 |
| Pantalla de 16 ensayos con posiciones novedosas | 9/16 | verde 2/8, rojo 7/8 |
| Pérdida de validación final (flujo normalizado) | verde 0,4627183682; rojo 0,4275088090 | no equivale a tasa de éxito real |

Los resultados provienen de revisión visual offline de vídeos de robot real, no de aceptación por operador, y con solo 2 repeticiones por condición novedosa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 millones de parámetros en FP32 el checkpoint ocupa aproximadamente 1,8 GB, por lo que la carga en FP32 requiere al menos ese orden de magnitud más overhead del runtime.
- GPU recomendadas: no disponible. El autor no especifica GPU de entrenamiento ni de inferencia.
- ¿Cabe en GPU de consumo? Por tamaño (450M parámetros) es plausible en GPUs de consumo, pero no se confirma en la documentación; el autor no lo indica.
- Opciones de despliegue: entorno LeRobot 0.6.1 con el helper `prepare_runtime.py` y el script `rollout_smolvla.sh` incluidos en el repo; se requiere descargar el snapshot fijado de `SmolVLM2-500M-Video-Instruct` (revisión `7b375e1b73b11138ff12fe22c8f2822d8fe03467`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zjumty/real-smolvla-red-green-v2-local-20261103` | 450.046.176 | no disponible | Manipulación SO101 (2 instrucciones) | no disponible | Hugging Face, 0 descargas, 0 likes |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible | Hugging Face (modelo base) |
| `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` | ~500M (por nombre) | no disponible | VLM generalista (backbone congelado) | no disponible | Hugging Face (revisión fijada) |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Experimentos de mesa limitados: el propio autor declara que no hay afirmación de generalización amplia ni de fiabilidad en despliegue.
- Sesgo de layout: en posiciones novedosas el rendimiento cae a 9/16, con un sesgo claro hacia el cubo rojo (7/8) frente al verde (2/8).
- Métricas de éxito obtenidas por revisión visual offline de vídeos, no por aceptación de operador, y con solo 2 repeticiones por condición novedosa.
- La pérdida de validación reportada no es una tasa de éxito real y no debe interpretarse como tal.
- Solo dos instrucciones fijas en inglés; no hay capacidades generales de lenguaje ni multilingües.
- Licencia no especificada para los pesos ajustados: la publicación no concede licencia adicional y siguen aplicando los términos del modelo base.
- Configuraciones con rutas locales originales: los ficheros preservan rutas de la máquina del autor, por lo que es necesario ejecutar el helper de reubicación antes de usar en otra máquina.
- v1 y v2 no constituyen una ablación de una sola variable (cambio de comportamiento de dtype), por lo que las comparaciones directas entre versiones requieren cautela.
- Riesgo de alucinación en el sentido de acciones no válidas o mal condicionadas fuera del dominio de entrenamiento; no se documenta un análisis específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zjumty/real-smolvla-red-green-v2-local-20261103
- Dataset de entrenamiento: https://huggingface.co/datasets/zjumty/real-cube-bowl-smolvla-v2-train-20261103
- Dataset de validación: https://huggingface.co/datasets/zjumty/real-cube-bowl-smolvla-v2-validation-20261103
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Backbone VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Repositorio del proyecto: https://github.com/terryma2024/so101_rollout
- Informe de comparación C2/C3: https://github.com/terryma2024/so101_rollout/blob/main/docs/experiments/smolvla-v2-v3-real-comparison-20261104.md
- Informe de generalización (16 ensayos): https://github.com/terryma2024/so101_rollout/blob/main/docs/experiments/smolvla-v2-generalization16-results-20261104.md
