# YellowDuckSweater/microduck-roller-sprint-2m-run-1111-1008-new

## Resumen

`microduck-roller-sprint-2m-run-1111-1008-new` es una política de control robótico entrenada mediante aprendizaje por refuerzo (RL) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un controlador neuronal que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse en bucle sobre el robot físico o en simulación. El autor del artefacto es el usuario de Hugging Face `YellowDuckSweater`, que lo publica como política perpetua (se ejecuta indefinidamente hasta que se detiene) cargable en una ranura de política del daemon `robotctl`.

El modelo se distribuye en formato ONNX (`policy.onnx`) con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor alimenta observaciones en crudo sin preprocesado adicional. El repositorio incluye un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. El tamaño del repo es de 0,0 GB, lo que sugiere un artefacto muy ligero, coherente con una política de red pequeña para un robot de aficionado.

Su relevancia radica en que ejemplifica el flujo de trabajo de RL aplicado a robótica de bajo coste: entrenamiento en simulador (mjlab), exportación a ONNX y despliegue reproducible en hardware real con un comando. La model card indica explícitamente que el entrenamiento no es bit-reproducible entre máquinas, por lo que la reproducibilidad es estadística y no exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal de política (arquitectura interna no detallada); entrada 61-D, salida 14 acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

Parámetros operativos adicionales: frecuencia de control de 50 Hz, observación de 61 dimensiones, 14 acciones, política perpetua (sin condición de terminación propia).

## Arquitectura y entrenamiento

La política se ha entrenado con el framework `mjlab-microduck` (versión 0.1.0, commit `1efd853be`), sobre el repositorio `microduck-challenges` de StephenForte (rama `main`, commit `90dc0e565`). El entrenamiento corresponde a la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 2048 entornos en paralelo, un máximo de 2888 iteraciones del agente, semilla 8 y checkpoint final 250. El registro se realizó con TensorBoard bajo el nombre de ejecución `run-1111-1008-new`, iniciado el 2026-11-11T18:12:17Z.

El escenario de entrenamiento es "on rollers" (sobre rodillos), lo que condiciona el comportamiento aprendido: la política está especializada en una marcha/carrera sobre rodillos, no necesariamente en locomoción libre sobre terreno. La model card califica el resultado como "slow!" (lento), lo que sugiere que la política prioriza estabilidad sobre velocidad. No se detalla la composición del dataset (generado por simulación), ni si hubo fases de RLHF/DPO (no aplicables en este dominio), ni innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en un controlador de este tipo.

El normalizador de observaciones está integrado en el grafo ONNX, una decisión de ingeniería que simplifica el despliegue y elimina una fuente habitual de errores de integración. La reproducibilidad es parcial: mismo código, mismo `uv.lock`, mismo comando y misma semilla producen una política comparable pero no idéntica, porque el RL sobre GPU no es bit-reproducible entre máquinas.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck sobre rodillos, con una marcha perpetua que se ejecuta hasta que se detiene explícitamente.
- Inferencia en tiempo real a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el modelo ONNX, lo que permite alimentar observaciones en crudo.
- Despliegue mediante el daemon `robotctl` en una ranura de política del robot.
- Ejecución en simulación compatible con el stack mjlab para evaluación y reproducción.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de pensamiento: es un controlador motor, no un modelo generativo.

## Casos de uso

- Demostración de locomoción en el robot microduck: cargar la política con `robotctl policy load <slot> YellowDuckSweater/microduck-roller-sprint-2m-run-1111-1008-new` y observar la marcha sobre rodillos; adecuado porque la política está entrenada exactamente para ese escenario y frecuencia de control.
- Benchmark de referencia para comparar políticas en la tarea `Mjlab-RollerSprint2m-MicroDuck`: sirve como línea base reproducible (mismo commit, misma semilla) para medir el efecto de cambios en el entorno o en hiperparámetros.
- Docencia y divulgación en robótica de bajo coste: el flujo completo (entrenar en mjlab, exportar a ONNX, desplegar con `robotctl`) es un ejemplo compacto de RL aplicado a hardware real.
- Validación de pipelines de despliegue: al llevar el normalizador embebido en el ONNX, es útil para probar la integración del daemon, el manifiesto y la carga de políticas sin depender de preprocesado externo.
- Investigación en sim-to-real: permite estudiar la brecha entre el entrenamiento sobre rodillos y el comportamiento en el robot físico, dado que la política es perpetua y su comportamiento es observable de forma continua.
- Pruebas de estrés del robot sobre rodillos: al no tener condición de terminación, puede mantenerse en ejecución durante periodos largos para evaluar calentamiento de motores, consumo y estabilidad del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0,0 GB y la política es una red pequeña, por lo que la huella debería ser mínima, pero no se publica una cifra.
- GPU recomendadas: no disponibles. Para el entrenamiento se usó RL sobre GPU con 2048 entornos en paralelo, pero no se especifica el modelo de GPU.
- Inferencia en CPU: plausible por el formato ONNX y el bajo tamaño, aunque no confirmado en la información disponible.
- Despliegue: daemon `robotctl` del stack microduck; ejecución en simulación con mjlab; ONNX Runtime como runtime natural del artefacto.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas públicas para microduck con las que comparar parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- La política está entrenada sobre rodillos; su comportamiento en locomoción libre sobre terreno no está validado y podría degradarse.
- La model card la describe como "slow!" (lenta): no es adecuada para aplicaciones que requieran velocidad.
- Licencia no disponible: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso productivo.
- El entrenamiento no es bit-reproducible entre máquinas: replicar el comando produce una política comparable, no idéntica.
- Artefacto sin descargas ni likes y publicado por un usuario individual: no hay validación comunitaria ni mantenimiento garantizado.
- Sin datos de benchmarks ni de robustez ante perturbaciones, cambios de fricción o fallos de sensores.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto, código o razonamiento.
- Riesgo de sobreajuste al escenario de simulación concreto (2048 entornos, semilla 8, checkpoint 250); no se documenta variabilidad entre semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowDuckSweater/microduck-roller-sprint-2m-run-1111-1008-new
- Repositorio de retos y entrenamiento: https://github.com/StephenForte/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card; URL exacta no disponible)
