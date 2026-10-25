# wwkkkoo/microduck-race400

## Resumen

race400 es una política de control motor entrenada mediante aprendizaje por refuerzo para el robot microduck, un cuadrúpedo de pequeño tamaño del ecosistema de Pollen Robotics. El artefacto publicado, `official_sprint_2m_race_bam_official_2026-10-25_20-35-23_model_400.onnx`, no es un modelo de lenguaje sino un controlador reactivo: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. Se distribuye como política «perpetua», es decir, diseñada para ejecutarse de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del daemon mediante el comando `robotctl policy load`.

El repositorio lo publica el usuario wwkkkoo y la tarjeta del modelo lo vincula al repositorio de entrenamiento `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing` y el commit `8d0dbc94c`. No se aportan datos sobre el número de parámetros de la red, la composición del dataset de entrenamiento, la licencia ni los idiomas; la etiqueta de librería es `microduck` y el pipeline declarado es `robotics`.

Su relevancia es acotada pero concreta: ejemplifica el patrón de publicación de recetas de RL como políticas ONNX portables, con el normalizador de observaciones embebido en el propio grafo, lo que reduce el trabajo de integración en el robot y facilita la reproducibilidad de experimentos de locomoción. No obstante, la ausencia de métricas, de licencia explícita y de documentación técnica limita seriamente su evaluación para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada por RL, exportada a ONNX; topología de red no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva de control; sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (se distribuye un artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

Otros datos operativos declarados: 61 dimensiones de observación, 14 acciones, frecuencia de control de 50 Hz, comportamiento perpetuo sin condición de terminación declarada, normalizador de observaciones embebido en `policy.onnx` (se deben alimentar observaciones en crudo).

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red. Por el pipeline declarado (`robotics`, `reinforcement-learning`) y por el formato de despliegue, se trata de una política de control entrenada por refuerzo y exportada a ONNX para inferencia en el robot; el espacio de observación es de 61 dimensiones y el de acciones de 14, con un bucle de control a 50 Hz. No se especifica si la red es un MLP, una red recurrente o una arquitectura con memoria, ni el número de capas o de parámetros.

Respecto al entrenamiento, la tarjeta solo indica el repositorio, la rama (`challenge-recipe-publishing`) y el commit (`8d0dbc94c`) de `pollen-robotics/microduck_rl`. No se publican el número de pasos o de tokens (en RL, muestras de entorno), la composición del dataset, el simulador empleado, la función de recompensa ni si hubo etapas de ajuste posteriores. Tampoco se documenta ninguna innovación técnica más allá del empaquetado del normalizador de observaciones dentro del grafo ONNX, que es relevante en la práctica porque elimina una fuente habitual de discrepancias entre simulación y despliegue.

## Capacidades

- Generación de locomoción continua: la política produce 14 acciones de control a 50 Hz para el microduck y está diseñada para ejecutarse de forma indefinida («perpetual»), sin episodios con terminación explícita.
- Control reactivo basado en observaciones: consume un vector de 61 dimensiones y devuelve acciones; no mantiene estado conversacional ni procesa texto, imagen o audio.
- Integración directa con el daemon del robot mediante `robotctl policy load <slot> wwkkkoo/microduck-race400`.
- Preprocesado integrado: el normalizador de observaciones está embebido en `policy.onnx`, por lo que la entrada debe ser la observación en crudo, sin normalización externa.
- Empaquetado conforme al manifiesto de políticas (esquema 2), lo que permite cargarla como una ranura de política intercambiable.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Despliegue de una marcha en el microduck físico: cargar la política en una ranura con `robotctl policy load` y dejarla correr de forma continua; es el uso previsto por el autor y el único documentado explícitamente.
- Evaluación comparativa de recetas de RL: al estar vinculada a una rama y un commit concretos de `microduck_rl`, sirve como referencia reproducible para comparar variantes de entrenamiento (por ejemplo, distintas recompensas o currículos) manteniendo el mismo formato de despliegue.
- Investigación en transferencia simulación-realidad: una política perpetua con normalizador embebido permite medir la brecha sim2real sin que las diferencias de preprocesado contaminen el resultado.
- Docencia y talleres de robótica: el flujo de carga en una ranura y la inferencia a 50 Hz simplifican las prácticas, ya que no requieren reconstruir el pipeline de normalización.
- Pruebas de robustez y análisis de fallos: ejecutar la política durante periodos largos en distintas superficies o con perturbaciones externas para caracterizar deriva, saturación de acciones y recuperación.
- Validación automatizada en CI: verificar que `policy.onnx` y `manifest.json` cargan correctamente, que la forma de entrada es 61 y la de salida 14, y que la política responde dentro del presupuesto temporal de 20 ms por ciclo.
- Base para ajuste fino o destilación: emplear esta política como punto de partida en experimentos posteriores dentro de `microduck_rl`, dado que se conoce el commit exacto de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del modelo no incluye métricas de recompensa, tasas de éxito, velocidad de marcha, consumo energético ni comparaciones con otras políticas. Los resultados de la búsqueda web realizada no contienen información técnica relevante sobre este modelo: los enlaces devueltos corresponden a páginas de inicio de sesión de Facebook y no guardan relación con el artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible. No se documenta el tamaño del grafo ni el número de parámetros; por la naturaleza del artefacto (61 entradas, 14 salidas, bucle a 50 Hz) es razonable esperar inferencia en CPU, pero se trata de una estimación cualitativa, no de un dato publicado.
- GPU recomendadas: no disponibles. Para este tipo de política de control de baja dimensionalidad, la GPU no suele ser necesaria; no hay ninguna recomendación oficial al respecto.
- Viabilidad en GPU de consumo: no confirmada; no se publican requisitos ni pruebas en RTX 4090, RTX 3090 u otras.
- Cómputo embebido: el diseño apunta a ejecución en el propio robot o en un equipo ligero cercano, dado el bucle de control a 50 Hz (20 ms por ciclo) y el formato ONNX; no se especifica la plataforma objetivo.
- Opciones de despliegue: el mecanismo documentado es el daemon de microduck vía `robotctl policy load`. El uso de ONNX Runtime u otros ejecutables es inferencia razonable por el formato, pero no está documentado por el autor.
- Latencia y throughput: no disponibles. El único requisito temporal explícito es la frecuencia de 50 Hz implícita en la descripción del entorno.

## Comparativa con modelos similares

No se dispone de datos verificables de políticas comparables de la misma familia (otros checkpoints de microduck) ni de métricas públicas que permitan una comparación cuantitativa. La tabla siguiente refleja únicamente lo que puede afirmarse con la información disponible.

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Datos públicos |
|---|---|---|---|---|---|
| wwkkkoo/microduck-race400 | Política RL en ONNX para microduck | 61 / 14 | 50 Hz | no disponible | sin benchmarks ni métricas |
| Otras políticas de microduck | Política RL para microduck | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomoción de cuadrúpedos de otros ecosistemas (por ejemplo, Isaac Gym / legged_gym) | Política RL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución o modificación; es un bloqueo potencial para cualquier despliegue en producción.
- Ausencia total de benchmarks: no hay métricas de rendimiento, robustez, velocidad ni tasa de éxito que permitan evaluar la calidad de la marcha antes de probarla en hardware.
- Documentación mínima: la tarjeta no describe arquitectura, hiperparámetros, simulador, recompensa ni proceso de entrenamiento; la reproducibilidad depende por completo del commit `8d0dbc94c` del repositorio de entrenamiento.
- Dependencia del preprocesado: el normalizador está embebido en el ONNX, de modo que alimentar observaciones ya normalizadas producirá un comportamiento incorrecto sin aviso aparente.
- Riesgo de brecha sim2real: no se documentan pruebas en hardware físico, dominios de validación ni condiciones de iluminación, suelo o carga; el comportamiento fuera del entorno de entrenamiento es desconocido.
- Política perpetua sin condición de terminación declarada: no se especifica qué ocurre ante caídas, saturación de actuadores o pérdida de observaciones; se requiere supervisión y un mecanismo externo de parada.
- Restricciones de tiempo real: el bucle a 50 Hz exige que la inferencia y la comunicación con los actuadores quepan en 20 ms; no se publican medidas de latencia.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (2026-10-25) y el tamaño reportado del repositorio (0.0 GB) no permiten verificar que el artefacto ONNX esté realmente presente y completo; conviene comprobarlo antes de confiar en la descarga.
- Idiomas: la tarjeta está en inglés y no aplica soporte multilingüe; no hay documentación en castellano.
- Sesgos: no procede evaluar sesgos sociales en un controlador motor, pero sí existen sesgos de dominio (condiciones físicas sobrerrepresentadas en el entrenamiento) que no se han caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wwkkkoo/microduck-race400
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento `microduck_rl`, rama `challenge-recipe-publishing`: https://github.com/pollen-robotics/microduck_rl/tree/challenge-recipe-publishing
- Commit de entrenamiento `8d0dbc94c`: https://github.com/pollen-robotics/microduck_rl/commit/8d0dbc94c
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no se dispone de URL directa en la información proporcionada
- Resultados de búsqueda web: sin enlaces técnicos relevantes (los resultados devueltos corresponden a páginas de Facebook y no están relacionados con el modelo)
