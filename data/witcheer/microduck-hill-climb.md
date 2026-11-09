# witcheer/microduck-hill-climb

## Resumen

`witcheer/microduck-hill-climb` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo Microduck del proyecto de código abierto de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, empaquetado en formato ONNX para su ejecución directa en el robot. La política es "perpetua", es decir, genera una marcha continua hasta que se le indique lo contrario, y está pensada para cargarse en una ranura de política del daemon `robotctl`.

El modelo se entrenó con el simulador mjlab (basado en MuJoCo) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck`, que consiste en subir una pendiente de 1,5 metros de desnivel. El entrenamiento se ejecutó en una única GPU RTX 5090 con 4096 entornos paralelos, semilla 2 y checkpoint 1000, partiendo de la base `mjlab-microduck 0.1.0`. El autor advierte explícitamente de que la política solo se ha validado en simulación y no se ha probado todavía en un Microduck físico.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de robótica con refuerzo reproducible (código, lockfile, comando y semilla publicados); por otro, sirve de ejemplo de un tipo de modelo radicalmente distinto a los LLM que suelen ocupar este blog, con requisitos de hardware y métricas de evaluación completamente diferentes. La información disponible es escasa: no hay licencia declarada, ni idiomas, ni benchmarks numéricos más allá de los metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (entrenada con RL en mjlab/MuJoCo); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; el normalizador de observaciones está embebido en `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de control motor, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en el simulador mjlab, sobre la tarea `Mjlab-HillClimb1m5-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `5cee942d8`). La configuración concreta fue de 4096 entornos en paralelo, un máximo de 1500 iteraciones del agente, guardado cada 250 iteraciones, semilla 2 y registro en TensorBoard bajo el nombre de ejecución `hc2`. El checkpoint publicado es el 1000, entrenado en una sola RTX 5090 entre el 8 y el 9 de noviembre de 2026.

El modelo consume observaciones crudas de 61 dimensiones y produce 14 acciones a 50 Hz; el normalizador de observaciones está integrado en el propio grafo ONNX, de modo que el consumidor no necesita preprocesar la entrada. La política es de tipo "perpetuo": no tiene condición de terminación aprendida y genera una marcha continua. El autor señala que el entrenamiento no es bit-reproducible entre máquinas, por lo que repetir el comando con la misma semilla produce una política comparable pero no idéntica. No se dispone de información sobre el número de parámetros, la topología de la red ni la composición exacta de las recompensas.

## Capacidades

- Control locomotor continuo de un robot cuadrúpedo Microduck a 50 Hz.
- Marcha perpetua: mantiene la política activa indefinidamente hasta que se descarga o se sustituye.
- Ascenso de pendientes de hasta 1,5 metros de desnivel en simulación (tarea de entrenamiento).
- Integración directa con el daemon `robotctl` mediante carga en una ranura de política.
- Entrada de observaciones crudas gracias al normalizador embebido en el ONNX.
- Ejecución en el robot o en simulación a través del runtime `microduck`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas o multimodales.

## Casos de uso

- Investigación en locomoción con RL: sirve como línea base reproducible para comparar recetas de entrenamiento en la tarea de ascenso de pendiente, ya que el autor publica commit, lockfile, semilla y comando exactos.
- Validación de la cadena de herramientas microduck: permite probar el flujo completo `robotctl policy load` y el esquema 2 de manifiestos sin necesidad de entrenar una política propia.
- Simulación de gemelos digitales: la política puede ejecutarse en el simulador mjlab para estudiar estabilidad de la marcha antes de transferirla a hardware.
- Docencia y divulgación en robótica con refuerzo: un artefacto pequeño y ejecutable en ONNX que ilustra el ciclo observación-acción de un cuadrúpedo a 50 Hz.
- Pruebas de transferencia sim-to-real: aunque el autor no la ha probado en hardware, es un candidato para experimentos controlados de transferencia en el Microduck físico.
- Benchmarking de hardware de entrenamiento: la receta documentada (4096 entornos, 1500 iteraciones, una RTX 5090) permite medir tiempos de entrenamiento en distintas GPUs.
- Integración en pipelines de robótica: el formato ONNX y el manifiesto JSON facilitan su inclusión en sistemas de control existentes sin dependencias de Python pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta los metadatos de entrenamiento (checkpoint 1000, semilla 2, 4096 entornos, 1500 iteraciones máximas) y advierte de que la política no se ha probado en un robot real, por lo que no hay métricas de éxito en hardware ni curvas de recompensa publicadas.

## Requisitos de hardware

- Inferencia en robot: el modelo se ejecuta como política ONNX en el propio Microduck; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto muy pequeño, pero no se dispone del número de parámetros ni del tamaño exacto de `policy.onnx`.
- Entrenamiento: una única RTX 5090 fue suficiente para la receta publicada (4096 entornos, 1500 iteraciones, checkpoint 1000).
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas para entrenamiento: RTX 5090 (validada por el autor); otras GPU no documentadas.
- Despliegue: runtime `microduck` y daemon `robotctl` (`sudo robotctl policy load <slot> witcheer/microduck-hill-climb`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (20 ms por paso); no se publican latencias medidas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos de control comparables con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Solo validada en simulación: el autor indica explícitamente que no se ha probado en un Microduck real, por lo que la transferencia sim-to-real es incierta.
- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarla en productos.
- Entrenamiento no bit-reproducible: repetir la receta con la misma semilla produce pesos distintos, lo que complica la auditoría exacta.
- Especialización estrecha: la política está entrenada para una única tarea (ascenso de pendiente de 1,5 m) y no se documenta su comportamiento en otros terrenos.
- Política perpetua sin condición de parada aprendida: requiere supervisión externa para detenerla o sustituirla.
- Sin información sobre sesgos, alucinación o multilingüismo, que no aplican a un modelo de control motor, pero tampoco hay análisis de robustez ante perturbaciones, fallos de sensores o cambios de carga.
- Dependencia del ecosistema microduck: el manifiesto sigue el esquema 2 del daemon, por lo que cambios de versión pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/witcheer/microduck-hill-climb
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y recetas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges.git
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon (URL exacta no disponible)
