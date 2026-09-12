# zhoumiaosen/microduck-straight-running

## Resumen

MicroDuck Straight Running es una política de control obtenida mediante aprendizaje por refuerzo (PPO) que gobierna un robot bípedo simulado de 14 actuadores llamado MicroDuck dentro de MuJoCo. No es un modelo de lenguaje ni un modelo generativo: es una red neuronal pequeña que recibe observaciones propioceptivas y un bloque de comandos, y emite 14 acciones de actuador a una frecuencia de control de 50 Hz. Lo publica el usuario zhoumiaosen en Hugging Face bajo licencia Apache 2.0.

El problema que aborda es el desplazamiento en línea recta a velocidad sostenida con estabilidad postural. El checkpoint publicado el 11 de septiembre de 2026 alcanza 1,84293 m/s de velocidad de progreso recto a 10 segundos y 1,80205 m/s a 30 segundos, con una supervivencia del 97,59 % y del 92,77 % respectivamente, medidos sobre tres semillas retenidas. Frente al modelo público anterior reevaluado en condiciones idénticas, la mejora es de +0,01101 m/s (+0,60 %) a 10 segundos y +0,00688 m/s (+0,38 %) a 30 segundos.

Su relevancia ahora es metodológica más que de rendimiento: el autor documenta explícitamente que la mejora observada está por debajo del umbral predeclarado de +0,02 m/s, que el objetivo de 1,9 m/s no se alcanzó y que el resultado no demuestra significación estadística. Es un ejemplo de publicación de actualización de investigación con evidencia completa de comparación, incluidos los checkpoints descartados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico PPO con perceptrón multicapa. Actor: normalización → 61 → 512 ELU → 256 ELU → 128 ELU → 14. Crítico (solo entrenamiento): normalización → 76 → 512 ELU → 256 ELU → 128 ELU → 1 |
| Parametros totales | Aproximadamente 197.774 en el actor y 203.777 en el crítico, calculados a partir de las dimensiones de capa declaradas en la model card; el autor no publica el recuento oficial |
| Parametros activos | No aplica: no es una arquitectura de mezcla de expertos |
| Longitud de contexto | No aplica. Política reactiva sin contexto autoregresivo; cada paso de control consume 48 valores propioceptivos más un bloque de 13 valores de comando (61 entradas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (idioma de la documentación; el modelo no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (según las etiquetas del repositorio) y checkpoint PyTorch `model_13600.pt` |
| Frecuencia de control | 50 Hz |
| Actuadores | 14 |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 12 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un actor-crítico clásico de PPO. El actor parte de una capa de normalización, recibe 61 entradas (48 valores propioceptivos del robot más 13 valores de comando) y las procesa mediante tres capas ocultas de 512, 256 y 128 neuronas con activación ELU hasta una salida de 14 dimensiones, una por actuador. El crítico, usado únicamente durante el entrenamiento, recibe 76 entradas y comparte la misma estructura de 512/256/128 ELU hasta una salida escalar de valor. La red y la física no se modificaron respecto al modelo padre. El control se ejecuta a 50 Hz con un controlador de mantenimiento de rumbo obligatorio que forma parte del contrato de despliegue.

El entrenamiento partió del checkpoint público anterior y consistió en tres ensayos independientes, cada uno con una ejecución de compatibilidad de 5 actualizaciones y una ejecución de 200 actualizaciones, lo que suma 615 actualizaciones. El ensayo A usó 512 entornos y peso de recompensa de progreso de 10; el ensayo B, seleccionado, usó 4096 entornos y peso 10; el ensayo C usó 4096 entornos y peso 15. La configuración común incluyó tasa de aprendizaje fija de 2e-5, coeficiente de entropía 0,005, semilla 42, 24 pasos de rollout, recompensa de tasa de acción a 0 y recompensa de progreso recto al cuadrado, con comando máximo de entrenamiento de 2,5 m/s y tope de velocidad de recompensa de 2,6 m/s. El checkpoint publicado corresponde a una sola actualización de continuación desde el padre, no a la política final de 200 actualizaciones: en todos los ensayos el mejor checkpoint se guardó tras la primera actualización de continuación, y el ajuste fino prolongado no mejoró la velocidad en la fase de cribado. El contador de entornos restaurado pasó de 326856 a 326880.

## Capacidades

- Locomoción bípeda hacia delante sobre terreno simulado en MuJoCo, con progreso recto sostenido medido sobre la dirección de rumbo inicial.
- Mantenimiento de rumbo mediante un controlador dedicado de retención de heading, requisito del contrato de despliegue.
- Control de 14 actuadores a 50 Hz en bucle cerrado a partir de observaciones propioceptivas de 48 valores.
- Seguimiento de comandos de velocidad dentro del rango de entrenamiento, con comando de evaluación de 2,0 m/s y máximo de entrenamiento de 2,5 m/s.
- Supervivencia prolongada: 97,59 % a 10 segundos y 92,77 % a 30 segundos con umbral de inclinación de 70 grados y comprobaciones de estado finito.
- Exportación a ONNX para inferencia sin dependencia de PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control, no un modelo de propósito general.

## Casos de uso

- Investigación en locomoción bípeda: sirve como política de referencia reproducible para comparar variantes de recompensa o de tamaño de lote, ya que el autor publica la configuración exacta, las semillas y los checkpoints descartados.
- Estudio de conformación de recompensa: el ensayo C aisló el efecto de subir el peso de progreso de 10 a 15, lo que permite analizar cómo responde la política a cambios de señal sin modificar red ni física.
- Estudio de escalado de lote en PPO: la comparación entre 512 y 4096 entornos mantiene fijo el número de actualizaciones, no la experiencia total, y documenta que el lote grande preservó mejor el rendimiento del checkpoint final.
- Punto de partida para ajuste fino de controladores bípedos: al ser un checkpoint intermedio con licencia Apache 2.0, se puede continuar el entrenamiento y comparar contra las métricas publicadas.
- Validación de pipelines de evaluación en robótica: las tablas de resultados retenidos, validación y cribado permiten probar infraestructura de evaluación con umbrales predeclarados y puertas de aceptación.
- Despliegue en simulación a alta frecuencia: al ejecutarse a 50 Hz y exportarse a ONNX, se integra en bucles de control simulados o en bancos de pruebas de tiempo real sin acelerador gráfico.
- Docencia en aprendizaje por refuerzo: el reducido tamaño de la red (menos de 200.000 parámetros en el actor) permite inspeccionar y visualizar la política completa en un curso práctico.
- Replicación de experimentos de sim-a-real: aunque no se documenta transferencia al robot físico, la política sirve como base para estudiar la brecha entre simulación y realidad en un bípedo de 14 actuadores.

## Benchmarks y rendimiento

El model-index del autor declara el estudio «MicroDuck Straight Running - Batch Reward Study» con la lista de resultados vacía, por lo que no hay entradas de benchmarks formales (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo). La model card sí publica una evaluación comparativa propia, que se reproduce tal cual a continuación. Los datos promedian tres semillas retenidas (22027, 24093 y 28191), con el mismo comando de 2,0 m/s, el mismo controlador de rumbo, la misma configuración física, 512 entornos por semilla y un segundo de calentamiento.

| Métrica | Duración | Modelo público anterior reevaluado | Checkpoint nuevo (ensayo B) | Cambio |
|---|---:|---:|---:|---:|
| Velocidad de progreso recto | 10 s | 1,83192 m/s | 1,84293 m/s | +0,01101 m/s (+0,60 %) |
| Velocidad de progreso recto | 30 s | 1,79518 m/s | 1,80205 m/s | +0,00688 m/s (+0,38 %) |
| Supervivencia | 10 s | 96,61458 % | 97,59115 % | +0,9766 puntos porcentuales |
| Supervivencia | 30 s | 91,60156 % | 92,77344 % | +1,1719 puntos porcentuales |
| Velocidad de avance del cuerpo | 10 s | 1,86454 m/s | 1,86562 m/s | +0,00108 m/s |
| Velocidad de avance del cuerpo | 30 s | 1,87243 m/s | 1,87226 m/s | -0,00017 m/s |

Velocidad de validación temprana a 30 segundos por ensayo: A 1,7817 m/s; B 1,7936 m/s; C 1,7808 m/s. El padre correspondiente midió 1,7896 m/s. El autor advierte de que el resultado anterior de 1,8056 m/s a 30 segundos publicado en la model card previa usó un conjunto de semillas distinto y no debe compararse directamente con los 1,8021 m/s de esta entrega. Ambas puertas de supervivencia se superaron (95 % a 10 segundos y 90 % a 30 segundos); ninguna puerta de velocidad se superó. El autor declara `target_met=false` y `useful_improvement=false`, y señala que tres semillas de evaluación y una semilla de entrenamiento por receta no establecen significación estadística ni repetibilidad.

## Requisitos de hardware

- VRAM para inferencia: prácticamente despreciable. El actor ronda los 197.774 parámetros, lo que equivale a menos de 1 MB en fp32 y unos 0,2 MB en int8. No requiere GPU.
- GPU recomendadas: ninguna en particular. Cualquier CPU moderna ejecuta la inferencia a 50 Hz con margen amplio; una GPU solo aportaría ventaja si se ejecutan cientos o miles de entornos en paralelo, como en el entrenamiento con 4096 entornos.
- GPU de consumo: cabe en cualquier GPU de consumo y también en hardware embebido o microcontrolador con runtime ONNX adecuado, dado el tamaño de la red.
- Opciones de despliegue: ONNX Runtime para la exportación ONNX; carga directa del checkpoint `model_13600.pt` con PyTorch para continuar entrenamiento o reevaluar; MuJoCo como simulador de referencia. vLLM, llama.cpp, Ollama y TGI no aplican, porque no son servidores de inferencia para políticas de control.
- Latencia y throughput: no publicados por el autor. El único dato relacionado es la frecuencia de control de 50 Hz del actor, y la evaluación usa 512 entornos por semilla durante 10 y 30 segundos, lo que implica ejecución masiva en paralelo.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos públicos comparables de terceros para esta tarea. La única referencia válida disponible es el propio modelo padre, que el autor reevalúa bajo condiciones idénticas y usa como línea base.

| Modelo | Parámetros | Contexto | Rendimiento a 30 s | Supervivencia a 30 s | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| MicroDuck Straight Running (revisión nueva) | ~197.774 en el actor | No aplica | 1,80205 m/s de progreso recto | 92,77344 % | Apache 2.0 | Hugging Face |
| MicroDuck Straight Running (revisión pública anterior) | ~197.774 en el actor | No aplica | 1,79518 m/s de progreso recto | 91,60156 % | Apache 2.0 | Hugging Face, revisión `9241cc4e0a5e99e84f2025558c1cda74ecde60fc`, SHA-256 `b280abb4488afd1811c8ea1582f0f922ab0e01358766557882df4a381c37db77` |
| Alternativas de terceros | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La mejora declarada no es estadísticamente fiable: +0,00688 m/s (+0,38 %) a 30 segundos queda por debajo del umbral predeclarado de +0,02 m/s, y el autor lo etiqueta explícitamente como no demostrado.
- El objetivo de 1,9 m/s no se alcanzó y las puertas de velocidad no se superaron; solo pasaron las de supervivencia.
- La evidencia se apoya en tres semillas de evaluación y una semilla de entrenamiento por receta, lo que no permite establecer repetibilidad ni significación.
- El checkpoint publicado corresponde a una única actualización de continuación desde el padre, no a la política final de 200 actualizaciones, lo que limita su interpretación como resultado de convergencia.
- El ajuste fino prolongado no mejoró la velocidad en el cribado, y ni el lote grande ni una recompensa más fuerte produjeron una ganancia útil de velocidad. El autor aclara que esto no demuestra un límite físico de velocidad.
- Los datos de rendimiento proceden íntegramente de simulación en MuJoCo. No se documenta validación en el robot físico ni análisis de la brecha sim-a-real.
- La comparación entre ensayos fija el número de actualizaciones, no la experiencia total: los ensayos con 4096 entornos recogieron ocho veces más muestras por actualización que el de 512.
- La política requiere un controlador de mantenimiento de rumbo externo; no es autónoma en cuanto a orientación.
- El avance recto proyecta la velocidad sobre el rumbo inicial y asigna contribución cero a las trayectorias fallidas, por lo que no equivale a la velocidad de avance del cuerpo ni la sustituye.
- Trazas de revisión ambiguas: el fichero liberado vuelve a etiquetarse como `model_13600.pt` porque el entrenamiento reanuda en el índice de iteración guardado; hay que usar la revisión y el SHA-256 para distinguirlo del padre.
- Licencia Apache 2.0, permisiva y compatible con uso comercial, sin restricciones adicionales documentadas. No obstante, el modelo no incluye ninguna garantía de seguridad para control físico real.
- La documentación está únicamente en inglés, y el repositorio tiene 0 descargas y 0 likes, sin validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhoumiaosen/microduck-straight-running
- Revisión padre del checkpoint: https://huggingface.co/zhoumiaosen/microduck-straight-running/tree/9241cc4e0a5e99e84f2025558c1cda74ecde60fc
- Evidencia de evaluación, resumen: `evaluation/summary.json` en el repositorio
- Evidencia de evaluación, resultados retenidos: `evaluation/heldout.json` en el repositorio
- Evidencia de evaluación, validación: `evaluation/validation.json` en el repositorio
- Evidencia de evaluación, cribado con checkpoints rechazados: `evaluation/screening.json` en el repositorio
- Repetición en vídeo: `run.mp4` en el repositorio (10 segundos, 50 fps, semilla 2027, comando 2,0 m/s, un robot simulado)
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados se limitaron a páginas genéricas de YouTube sin relación con este repositorio. No se dispone de paper, blog técnico ni repositorio de código adicionales.
