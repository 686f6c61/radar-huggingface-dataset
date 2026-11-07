# YellowDuckSweater/microduck-roller-sprint-2m-run-1106-0951

## Resumen

Microduck roller-sprint-2m-run-1106-0951 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo/bípedo de bajo coste microduck, desarrollado en el ecosistema de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo multimodal: es una política de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ejecutarse sobre ruedas (rollers) en el robot físico. El autor, identificado como YellowDuckSweater, la publica como un artefacto de investigación reproducible dentro del repositorio de retos microduck-challenges.

El modelo se distribuye exclusivamente en formato ONNX, con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo. Se trata de una política perpetua: una vez cargada en una ranura de política del demonio robotctl, se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o gait predefinida.

Su relevancia es acotada pero específica: ejemplifica el flujo completo de entrenamiento y despliegue de políticas RL para robótica de bajo coste, con semilla, commit y comando de reproducción documentados, lo que facilita la auditoría y la repetición del experimento. El propio autor anota en la model card que el resultado "parece más lento" que otras variantes, una advertencia cualitativa sin métricas asociadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL; no se especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrena con el framework mjlab (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, definida en el repositorio `StephenForte/microduck-challenges`, rama `main`, commit `7309406a0`. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 42 y registro en TensorBoard, partiendo del checkpoint 1250.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idénticos pesos. Esta es una característica conocida del RL con GPU (no determinismo en operaciones atómicas y reducciones), y conviene tenerla en cuenta si se pretende comparar checkpoints de forma estricta. La interfaz de despliegue es un manifiesto JSON conforme al schema 2 del demonio microduck, con el normalizador de observaciones integrado en el grafo ONNX.

## Capacidades

- Locomoción sobre ruedas (rollers) para el robot microduck, con política perpetua que se ejecuta de forma continua hasta que se detiene o se sustituye.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones embebida en `policy.onnx`, lo que simplifica la integración: el consumidor no necesita replicar el preprocesado.
- Carga dinámica en ranuras de política del demonio `robotctl` mediante un identificador de repositorio de Hugging Face.
- Reproducibilidad documentada a nivel de código, dependencias, comando y semilla (con la salvedad de no determinismo de pesos).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües: es una política de control específica de dominio.

## Casos de uso

- Investigación en locomoción con RL: servir como referencia base para comparar variantes de recompensa o de configuración de entorno en la tarea `Mjlab-RollerSprint2m-MicroDuck`, dado que el commit y la semilla están fijados.
- Despliegue en el robot físico microduck: cargar la política en una ranura mediante `robotctl policy load <slot> YellowDuckSweater/microduck-roller-sprint-2m-run-1106-0951` para obtener una marcha continua sobre ruedas.
- Docencia y talleres de robótica de bajo coste: el par robot + política ONNX permite ilustrar el ciclo completo observación-acción a 50 Hz sin requerir infraestructura de inferencia de gran tamaño.
- Validación de pipelines de despliegue: útil para probar el demonio `robotctl`, el esquema de manifiesto v2 y la carga de políticas desde Hugging Face en entornos de integración.
- Comparación de políticas: junto con otras variantes del mismo autor (por ejemplo, `run-1104-1803-001`), permite estudiar diferencias de comportamiento entre checkpoints y semillas bajo la misma tarea.
- Base para ajuste fino o continuación del entrenamiento: al estar documentado el comando de entrenamiento y la versión de mjlab, se puede reanudar el pipeline con modificaciones de recompensa o de parámetros del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única valoración cualitativa es la del propio autor ("seems slower"), sin métricas de velocidad, consumo, estabilidad ni tasa de caídas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no aplica para inferencia en el robot; el despliegue se realiza sobre el hardware de control del microduck ejecutando ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente irrelevante, dado que la política está pensada para ejecutarse en el propio robot a 50 Hz.
- Opciones de despliegue: demonio `robotctl` del ecosistema microduck con `policy.onnx` y `manifest.json`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-roller-sprint-2m-run-1106-0951 | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| microduck-roller-sprint-2m-run-1104-1803-001 | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otras políticas del reto `Mjlab-RollerSprint2m-MicroDuck` | Política RL | no disponible | no disponible | no disponible | Repositorio `microduck-challenges` |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única diferencia documentada es la ejecución de entrenamiento (fecha, checkpoint y semilla) y la apreciación cualitativa del autor sobre la velocidad.

## Limitaciones y advertencias

- El autor indica que la política "parece más lenta" que otras variantes; no hay métricas que cuantifiquen esa diferencia.
- Entrenada específicamente para locomoción sobre rollers; no se garantiza su comportamiento en otras configuraciones del robot (sin ruedas, terrenos irregulares, cargas adicionales).
- No determinismo del entrenamiento: los pesos no son reproducibles bit a bit entre máquinas, lo que limita la comparación exacta entre ejecuciones.
- Licencia no especificada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de documentación sobre sesgos, robustez ante perturbaciones, tasa de fallo o seguridad física; en robótica, una política sin evaluación de estabilidad debe probarse en entornos controlados.
- Sin información sobre idiomas ni sobre capacidades de lenguaje: no debe confundirse con un modelo de propósito general.
- El repositorio aparece con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1106-0951
- Variante relacionada: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1104-1803-001
- Repositorio de retos de entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
- Sitio comercial del robot: https://microducks.org/
