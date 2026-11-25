# tdesc/microduck-hill-climb-1m5-hillws2b

## Resumen

`microduck-hill-climb-1m5-hillws2b` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse en el propio robot o en su daemon de control. El autor, `tdesc`, lo publica como un "gait" o patrón de marcha perpetuo, es decir, que se mantiene activo hasta que se le indique lo contrario.

La tarea concreta es `Mjlab-HillClimb1m5-MicroDuck`: subir una pendiente de aproximadamente 1,5 metros en el simulador mjlab (basado en MuJoCo). El entrenamiento se realizó con 512 entornos paralelos, 500 iteraciones máximas y semilla 1, partiendo de un warm start sobre el checkpoint `model_ref.pt`. El resultado es un checkpoint en la iteración 400, exportado con cambios sin confirmar en el árbol de código, lo que conviene tener en cuenta para reproducibilidad.

El interés del modelo es práctico: demuestra un flujo completo de entrenamiento en simulación y despliegue en hardware real mediante un manifiesto de política estandarizado (schema 2) y un fichero ONNX con la normalización de observaciones incorporada. Es relevante para quienes trabajan en robótica de bajo coste, sim-to-real y pipelines de RL reproducibles, más que para usuarios de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motriz (exportada a ONNX); arquitectura interna no especificada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye ONNX en precisión nativa) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con schema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política se entrena en mjlab, un entorno de aprendizaje por refuerzo construido sobre MuJoCo, con la tarea `Mjlab-HillClimb1m5-MicroDuck`. El agente recibe observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de control de 50 Hz. El entrenamiento usó 512 entornos simulados en paralelo, un máximo de 500 iteraciones y la semilla 1, con reanudación desde un warm start (`warmstart_ref`, checkpoint `model_ref.pt`) y guardado cada 100 iteraciones. El checkpoint exportado corresponde a la iteración 400.

El repositorio de entrenamiento es `tdesc/microduck-challenges` en la rama `main`, commit `b7549fbea`, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El autor advierte que el export se hizo desde un checkout con cambios sin confirmar y que el RL sobre GPU no es bit-reproducible: repetir el comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. La normalización de observaciones está integrada en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: genera comandos motores continuos a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones.
- Marcha perpetua: la política se mantiene activa de forma indefinida hasta que el daemon la descarga o la sustituye.
- Ascenso de pendientes: entrenada específicamente para la tarea de subida de colina de 1,5 m en simulación.
- Despliegue directo en hardware mediante `robotctl policy load <slot> tdesc/microduck-hill-climb-1m5-hillws2b`.
- Integración con el sistema de manifiestos de políticas de microduck (schema 2), lo que permite cargarla en un slot de política del daemon.
- Sin capacidades de lenguaje, visión, tool calling ni razonamiento multi-paso: es exclusivamente un controlador motor.

## Casos de uso

- Investigación en sim-to-real: servir como referencia de política entrenada en mjlab para comparar transferencia de simulación a hardware real en el microduck.
- Demostración de ascenso de pendientes: validar en el robot físico la capacidad de subir una colina de 1,5 m entrenada en simulación, midiendo deriva respecto al simulador.
- Reproducción de experimentos de RL: usar el comando documentado, el commit y la semilla para regenerar políticas comparables y estudiar la varianza entre ejecuciones.
- Base para fine-tuning o warm start: emplear el checkpoint como inicialización (`model_ref.pt`) en nuevas tareas de locomoción del mismo robot.
- Benchmark de pipelines de despliegue: probar el flujo `robotctl policy load` y el manifiesto schema 2 en un caso real de carga de políticas en slots.
- Docencia en robótica de bajo coste: ilustrar un ciclo completo de entrenamiento con 512 entornos paralelos y despliegue en un cuadrúpedo asequible.
- Evaluación de robustez: someter la política a terrenos y perturbaciones distintas de las de entrenamiento para caracterizar sus límites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito en la tarea ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y el formato ONNX, se trata de una red de política pequeña que previsiblemente se ejecuta en CPU, pero no hay cifras publicadas.
- GPU recomendadas para entrenamiento: no especificadas; el comando de entrenamiento admite `--gpu-ids None`, lo que sugiere ejecución sin GPU o con selección explícita, pero no se detalla el hardware usado.
- Compatibilidad con GPU de consumo: no confirmada; el autor solo indica que el RL en GPU no es bit-reproducible entre máquinas.
- Opciones de despliegue: ONNX Runtime a través del daemon de microduck (`robotctl policy load`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas para microduck ni modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Entrenada para una única tarea (`Mjlab-HillClimb1m5-MicroDuck`); no hay evidencia de generalización a otros terrenos, velocidades o comandos.
- El export se realizó desde un checkout con cambios sin confirmar, lo que puede afectar a la reproducibilidad exacta del binario.
- El RL en GPU no es bit-reproducible: la misma semilla produce políticas comparables, no idénticas.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución en el robot físico; el riesgo principal es fallo de la política ante perturbaciones no vistas en entrenamiento.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni reportes de uso en hardware real.
- El repositorio ocupa 0,0 GB según Hugging Face, lo que puede indicar que los pesos no están subidos o que el tamaño es inferior a la resolución de la plataforma; conviene verificar la presencia de `policy.onnx` antes de desplegar.
- Depende del ecosistema microduck (`robotctl`, manifiesto schema 2); no es portable a otras plataformas sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-hill-climb-1m5-hillws2b
- Repositorio de entrenamiento: https://github.com/tdesc/microduck-challenges.git
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- mjlab: no se proporciona enlace directo en la información disponible
