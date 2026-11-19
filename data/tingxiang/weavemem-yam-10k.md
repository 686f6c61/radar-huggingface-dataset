# Tingxiang/weavemem-yam-10k

## Resumen

WeaveMem YAM 10K es un paquete de inferencia para robótica que sirve tres checkpoints nativos de π₀.₅ (pi-zero-point-five) entrenados sobre el dataset conjunto de dos tareas YAM. Lo desarrolla el usuario Tingxiang y se publica en Hugging Face como un repositorio de 40,3 GB que incluye los parámetros de inferencia en formato Orbax, las estadísticas de normalización del entrenamiento, el runtime congelado de OpenPI, el tokenizador y el codificador CD-LAM exacto usado en la caché de entrenamiento. No es un modelo de lenguaje al uso, sino un servicio de política visomotora para control de brazos robóticos.

El sistema expone un servidor WebSocket que recibe frames de cámara, un estado de robot de 14 dimensiones y una instrucción en lenguaje natural, y devuelve un array de 50x14 acciones propuestas. La arquitectura subyacente es π₀.₅, un modelo visomotor de OpenPI, combinado con un mecanismo de memoria de largo plazo (WeaveMem) implementado mediante el codificador CD-LAM y políticas con historial de keyframes. El paquete ofrece cuatro modos de servicio: `sync`, `kv`, `async_lag5` y `async_lag5_top5`, que difieren en cómo gestionan el buffer de historial y la latencia de la memoria.

Es relevante porque ejemplifica el despliegue de políticas robóticas de tipo vision-language-action (VLA) con memoria episódica, un área donde la latencia y la coherencia temporal son críticas. El hardware probado es una NVIDIA H100 con CUDA 12, y el cliente ejecuta hasta diez acciones antes de replanificar, con modos asíncronos que reportan la edad de la memoria en frames (`motion_lag_frames`), aproximadamente 167 ms a 30 Hz para cinco frames.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (OpenPI) con memoria de largo plazo WeaveMem y codificador CD-LAM |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (buffer de historial de keyframes, sin cifra de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | Orbax (parámetros de inferencia); runtime OpenPI empaquetado |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅, la familia de políticas visomotoras de OpenPI, servida mediante un runtime JAX con soporte CUDA. Sobre esta base se añade WeaveMem, un mecanismo de memoria que combina un codificador CD-LAM (usado también para construir la caché de entrenamiento) con políticas de historial de keyframes. Los tres checkpoints corresponden a variantes con distinto grado de memoria: `pi_base` (sin historial, solo modo `sync`), `keyframes` (modos `sync` y `kv`) y `keyframes_cdlam` (modos `sync`, `kv`, `async_lag5` y `async_lag5_top5`). Los checkpoints contienen únicamente parámetros de inferencia comprometidos y estadísticas de normalización; el estado del optimizador y las trayectorias de entrenamiento se excluyen explícitamente.

El entrenamiento se realizó sobre el dataset conjunto de dos tareas YAM, con un estado de robot de 14 dimensiones (articulaciones 1-6 del brazo izquierdo, pinza izquierda, articulaciones 1-6 del brazo derecho, pinza derecha) y tres vistas de cámara (`cam_high`, `cam_left_wrist`, `cam_right_wrist`). No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el modo asíncrono: `async_lag5` y `async_lag5_top5` usan el prefijo CD-LAM completado más reciente y exponen su antigüedad como `memory_timing.motion_lag_frames`; el modo Top-5 usa tres vistas actuales con pesos iguales para recuperación, con pesos iguales para keyframe y motion scores, y limita la lectura de acciones a hasta cinco bloques de historial seleccionados más el contexto requerido.

## Capacidades

- Generación de acciones robóticas: devuelve un array `[50,14]` de acciones propuestas a partir de observaciones visomotoras y una instrucción.
- Control bimanual: gestiona dos brazos de 6 articulaciones más pinza cada uno, con comandos absolutos en las mismas unidades y convención del dataset YAM.
- Memoria episódica: buffer de historial de keyframes con modos síncronos y asíncronos, incluyendo recuperación Top-5 sobre bloques de historial.
- Percepción multivista: procesa tres cámaras RGB en formato HWC uint8 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`).
- Instrucciones en lenguaje natural: recibe un `prompt` de instrucción junto con el estado y las imágenes.
- Servicio WebSocket: protocolo binario MessagePack con `openpi_client.msgpack_numpy`, una respuesta por mensaje y metadatos al abrir la conexión.
- Replanificación por chunks: el cliente ejecuta hasta diez acciones antes de replanificar; los modos asíncronos permiten actualizar el fondo mientras se ejecuta.
- No se documentan capacidades de tool calling, agentes multi-step, matemáticas, código ni audio.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo recibe el estado de 14 dimensiones y tres vistas para generar comandos absolutos de ambos brazos, adecuado para tareas de dos brazos sobre el dataset YAM.
- Recolección de demostraciones con memoria: el modo `keyframes_cdlam` con `add_buffer` permite enviar una demostración inicial y el primer frame de ejecución, y luego inferir con el historial acumulado, útil para tareas que requieren recordar el contexto episódico.
- Control con replanificación asíncrona: `async_lag5` envía los primeros cinco frames con `background_update=True` y los cinco restantes sin él, permitiendo solapar la actualización de memoria con la ejecución a 30 Hz.
- Recuperación de historial por relevancia: `async_lag5_top5` selecciona hasta cinco bloques de historial mediante puntuaciones de keyframe y motion, útil cuando el episodio es largo y solo una parte del pasado es relevante.
- Evaluación de políticas VLA en entornos simulados o de banco: el paquete incluye `validation/` con resultados de humo de los checkpoints empaquetados para verificar E/S del servicio y carga del modelo antes de actuar sobre hardware.
- Despliegue remoto modelo-robot: el servidor se enlaza a localhost por defecto y se accede mediante túnel SSH (`ssh -NT -L 8765:127.0.0.1:8765`), lo que permite separar el host de cómputo (H100) del host del robot.
- Integración en pipelines de investigación con OpenPI: el runtime congelado, el tokenizador y el codificador CD-LAM empaquetados facilitan reproducir la caché de entrenamiento y experimentar con los distintos modos de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las cifras de velocidad de RoboMME provienen de un checkpoint diferente, pero no se incluyen los valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 40,3 GB e incluye tres checkpoints, runtime y assets.
- GPU recomendada: una NVIDIA H100 es el hardware probado; se requiere GPU NVIDIA con runtime CUDA 12.
- Cabe en GPU de consumo: no disponible; no se documenta soporte para RTX 4090 u otras GPU consumer.
- Sistema operativo y software: Linux x86-64, Python 3.11, JAX con `JAX_PLATFORMS=cuda`, `torchvision==0.22.1`, runtime OpenPI empaquetado.
- Convivencia de allocators: se debe permitir que los allocators de JAX y Torch compartan la misma GPU al servir CD-LAM (`XLA_PYTHON_CLIENT_PREALLOCATE=false`).
- Opciones de despliegue: servidor WebSocket propio (`experiments.ltm_benchmarks.serve_yam_10k`); no se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: a 30 Hz, cinco frames equivalen aproximadamente a 167 ms según la model card; no se publican cifras de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables de la misma categoría (políticas VLA con memoria para robótica bimanual) ni métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sin autenticación de aplicación en el WebSocket: el servidor se enlaza a localhost por defecto y el acceso remoto debe hacerse por túnel SSH; exponerlo directamente es un riesgo de seguridad.
- Calidad de control no validada: las comprobaciones de `validation/` cubren solo E/S del servicio y carga del modelo; la calidad del control robótico requiere su propia evaluación.
- Verificación obligatoria antes de actuar: se debe comprobar que la primera respuesta tenga `actions[50,14]` finitas y reproducir un episodio conocido en el host destino antes de mover hardware.
- Gestión de errores: una desconexión o un error debe tratarse como una respuesta de acción inválida.
- Dependencia de convenciones del dataset: los comandos son absolutos en las unidades y convención del dataset YAM, y la pinza debe usar la convención calibrada de ese dataset.
- Restricciones de memoria: los modos con historial requieren enviar la demostración y el frame E0, y reiniciar y reenviar en cada cambio de episodio; el primer paso puede tardar en preparar la demostración.
- Idiomas no especificados: no se documenta qué idiomas aceptan las instrucciones.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación; al ser una política visomotora, los fallos se manifiestan como acciones incorrectas, no como texto.
- Exclusión de artefactos de entrenamiento: el estado del optimizador y las trayectorias no están incluidos, lo que limita la reproducción completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Tingxiang/weavemem-yam-10k
- OpenPI (runtime empaquetado en el repositorio): no disponible como enlace externo en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
