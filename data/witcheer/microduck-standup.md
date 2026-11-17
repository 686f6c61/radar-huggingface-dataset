# witcheer/microduck-standup

## Resumen

Microduck-standup es una política de control entrenada por refuerzo para el robot cuadrúpedo de bajo coste Microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador episódico que recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, con una duración fija de 6,0 segundos, cuyo objetivo es que el robot se levante y termine en una postura de pie. El autor es el usuario de Hugging Face `witcheer`, y la política se entrena contra el repositorio `pollen-robotics/microduck_rl`.

La versión actual (v2) es un ajuste fino de la v1 sobre el mismo entorno de simulación, pero añadiendo ±1 grado de holgura mecánica (backlash) en cada servo, para acercar la simulación a las imperfecciones reales del hardware. Se distribuye como un archivo ONNX con el normalizador de observaciones integrado, junto con un manifiesto compatible con el esquema 2 del daemon de políticas de Microduck, y se instala con el comando `robotctl policy add`.

Su relevancia es doble: por un lado, demuestra que una política de levantamiento entrenada en simulación tolera la holgura de engranajes sin degradarse de forma medible; por otro, expone con transparencia sus límites (no se levanta boca arriba y no se ha validado en hardware real), lo que la convierte en un punto de partida reproducible para quien quiera entrenar habilidades similares con `microduck_rl` y MuJoCo/MJLab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; episodio fijo de 6,0 s a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion del episodio | 6,0 s |
| Entorno de entrenamiento | `Mjlab-StandUp-Flat-Backlash-MicroDuck` (±1° de holgura por servo) |
| Entornos paralelos | 4096 |
| Iteraciones totales | 28 000 (25 000 de v1 + 3 000 de ajuste con holgura) |
| Tiempo de entrenamiento | 63 min en una RTX 5090 (1,28 s/it) para el ajuste fino |
| Tamano del repositorio | 0,0 GB (redondeado; el artefacto principal es un ONNX pequeno) |
| Descargas | 67 |
| Likes | 0 |

## Arquitectura y entrenamiento

La model card no describe la topologia interna de la red (numero de capas, anchura, tipo de encoder). Lo que sí se documenta es el pipeline: la política se entrena con `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`) sobre el entorno `Mjlab-StandUp-Flat-Backlash-MicroDuck`, un escenario de MJLab/MuJoCo en el que cada servo introduce ±1 grado de juego mecánico. La observación de 61 dimensiones incluye, según los criterios de evaluación descritos, altura del tronco y gravedad en el marco del cuerpo; las 14 acciones corresponden a las articulaciones del robot. El normalizador de observaciones está embebido en el ONNX, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento de v2 parte de los pesos de v1 (25 000 iteraciones sobre `Mjlab-StandUp-Flat-MicroDuck` sin holgura, 407 min en una RTX 5090) y añade 3 000 iteraciones con la holgura activada, con 4096 entornos en paralelo durante 63 minutos. La recompensa media se mantuvo entre 30,4 y 39,2 por iteración desde la iteración 25 100 hasta el final (35,07 en la 28 000), una meseta plana que el autor interpreta como ausencia de mejora medible. El checkout de entrenamiento tenía cambios locales (parches de otras tareas y registro de una tarea fork), aunque la tarea StandUp con backlash no estaba modificada respecto al commit indicado. No se documenta uso de RLHF, DPO ni datos supervisados: es aprendizaje por refuerzo puro en simulación.

## Capacidades

- Levantarse desde posición boca abajo (face down): 3 de 3 en simulación con holgura, terminando de pie a 108–118 mm de altura del tronco.
- Levantarse desde sentado (sitting): 3 de 3, alcanzando la postura de pie en 0,3 s.
- Mantener una postura de pie desde un inicio ya erguido (standing start): 3 de 3, sin caídas en tomas de 12 s.
- Retorno autónomo a postura erguida dentro de un episodio fijo de 6,0 s a 50 Hz.
- Tolerancia a holgura mecánica de ±1 grado por servo sin degradación medible en las pruebas realizadas.
- Ejecución en robot mediante el comando `robotctl robot do standup` y el daemon de políticas de Microduck.
- No soporta tool calling, function calling, razonamiento multi-step, visión, audio ni capacidades multilingües: es un controlador motor episódico.

## Casos de uso

- Recuperación autónoma tras caída en demostraciones de robótica cuadrúpeda de bajo coste: la política cubre los escenarios de partida boca abajo, sentado y de pie, que son los estados en los que el Microduck acaba tras una manipulación o un tropiezo, con un episodio acotado de 6 s que simplifica la integración en el bucle de control.
- Benchmark reproducible de robustez frente a holgura mecánica: al existir v1 (sin backlash) y v2 (con ±1°), se puede comparar en el mismo simulador el efecto de imperfecciones de engranajes en una tarea de locomoción, usando los logs publicados en `witcheer/microduck-skill-tree`.
- Base para ajuste fino de nuevas habilidades: los pesos de v1 y v2 sirven como inicialización para tareas derivadas en `microduck_rl`, reduciendo las iteraciones necesarias frente a entrenar desde cero.
- Validación de pipelines sim-a-real: la política es un caso de prueba para medir la brecha entre MJLab y el hardware, ya que el autor declara explícitamente que no se ha probado en un Microduck físico.
- Docencia y prototipado en cursos de RL aplicado a robótica: el flujo completo (entorno MJLab, 4096 entornos paralelos, exportación ONNX con normalizador embebido, manifiesto de política) es un ejemplo compacto y de código abierto de un ciclo entrenamiento-despliegue.
- Integración en el daemon `robotctl` para secuencias de arranque: la política puede encadenarse tras una secuencia de inicialización para dejar al robot en postura operativa antes de ejecutar otras habilidades de la skill tree.

## Benchmarks y rendimiento

Resultados en simulación publicados por el autor (v2 frente a v1, ambos en `Mjlab-StandUp-Flat-Backlash-MicroDuck` con ±1° de holgura, tomas de 12 s). Un levantamiento cuenta si el tronco alcanza 105 mm, lo mantiene 1 s y sigue ahí al final de la toma:

| Escenario de partida | v2 (con backlash) | v1 (en sim con backlash) | v1 (en su sim sin backlash) |
|---|---|---|---|
| Boca abajo | 3/3 | 3/3 | 2/2 |
| Sentado | 3/3 | 3/3 | 2/2 |
| De pie | 3/3 | 3/3 | 2/2 |
| Boca arriba | 0/3 | 0/3 | 0/2 |

Detalles medidos:

| Metrica | Valor |
|---|---|
| Altura del tronco al terminar (boca abajo) | 108–118 mm |
| Inclinacion final (boca abajo) | 31–37° hacia delante |
| Altura del tronco en el fallo boca arriba | 59–60 mm (medio girado, congelado) |
| Tiempo hasta de pie desde sentado | 0,3 s |
| Recompensa media final del ajuste | 35,07 en la iteracion 28 000 (rango 30,4–39,2 desde la 25 100) |
| Coste del ajuste fino | 63 min, 1,28 s/it, 4096 entornos, RTX 5090 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ya que no aplican a este tipo de modelo. No hay datos de latencia ni throughput en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano del repositorio (0,0 GB redondeado) y la naturaleza de una política de 61 entradas y 14 salidas, la huella es minima y cabe en cualquier GPU consumer, e incluso es plausible su ejecución en CPU con ONNX Runtime.
- GPU de entrenamiento documentada: una RTX 5090 para el ajuste fino (63 min, 4096 entornos). El entrenamiento completo de v1 requirió 407 min en la misma GPU.
- GPU recomendadas para entrenamiento: RTX 5090 (validada por el autor); no se documentan A100 ni H100.
- Cabe en GPU consumer: sí, según el tamano del artefacto y las cifras de entrenamiento publicadas.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto), o el daemon `robotctl` de Microduck mediante `sudo robotctl policy add standup witcheer/microduck-standup`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política opera a 50 Hz por requisito del entorno, pero no se publican mediciones de tiempo de inferencia en robot ni en simulador.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas de levantamiento publicadas para el Microduck ni sobre modelos comparables de la misma categoría (controladores RL episódicos para cuadrúpedos de bajo coste) en la información proporcionada. La comparación más directa disponible es interna al propio repositorio:

| Version | Entrenamiento | Holgura en sim | Boca abajo | Sentado | De pie | Boca arriba |
|---|---|---|---|---|---|---|
| v1 | 25 000 iteraciones, 407 min | No | 2/2 | 2/2 | 2/2 | 0/2 |
| v2 | 25 000 + 3 000 iteraciones, 63 min el ajuste | ±1° por servo | 3/3 | 3/3 | 3/3 | 0/3 |

## Limitaciones y advertencias

- No se ha probado en un Microduck físico: todos los resultados son de simulación, por lo que la brecha sim-a-real es desconocida.
- No se levanta desde posición boca arriba: 0 de 3 en simulación, quedándose medio girado con el tronco a 59–60 mm.
- Postura final con inclinación hacia delante de 31–37° al levantarse desde boca abajo, heredada de v1; puede no ser una postura operativa estable para tareas posteriores.
- El ajuste fino con holgura no produjo mejoras medibles: la recompensa se mantuvo plana, por lo que el beneficio de v2 frente a v1 en hardware real está por demostrar.
- El checkout de entrenamiento contenía cambios locales no commiteados (parches de otras tareas y registro de una tarea fork), lo que afecta a la reproducibilidad exacta del entrenamiento, aunque la tarea StandUp con backlash no estaba modificada.
- La arquitectura de red no está documentada, lo que dificulta auditar el modelo o modificarlo más allá del ajuste fino.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución más allá de los cuatro escenarios de partida evaluados; no se han publicado pruebas con perturbaciones externas, terrenos irregulares o empujes.
- Licencia Apache-2.0, la misma que `microduck` y `microduck_rl`: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe.
- El episodio es fijo de 6,0 s: no es una política continua, por lo que no debe usarse como controlador permanente de marcha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/witcheer/microduck-standup
- Dataset con logs de entrenamiento, curva de recompensa y cola de trabajos: https://huggingface.co/datasets/witcheer/microduck-skill-tree (carpeta `level-02b-standup-gear-play`)
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama `develop`, commit `53b8971b6`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de Microduck (no se proporciona URL directa)
