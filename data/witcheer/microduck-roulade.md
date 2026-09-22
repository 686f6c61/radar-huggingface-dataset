# witcheer/microduck-roulade

## Resumen

Microduck-roulade es una política de aprendizaje por refuerzo (reinforcement learning) publicada por el usuario witcheer en HuggingFace. No es un modelo de lenguaje: se trata de un controlador neuronal para el robot cuadrúpedo Microduck de Pollen Robotics, entrenado para ejecutar una voltereta hacia delante (forward roll) desde una posición de pie y volver a la postura erguida. El modelo se distribuye en formato ONNX e ingiere un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, con un episodio de 2,0 segundos de duración.

El entrenamiento se realizó exclusivamente en simulación con mjlab sobre MuJoCo Warp, a lo largo de 10.000 iteraciones con 4.096 entornos paralelos durante 173 minutos en una única RTX 5090. La model card indica explícitamente que la política todavía no se ha probado en un Microduck real. El autor la presenta como el nivel 6 de un árbol de habilidades sim-first, tras niveles anteriores de caminar, levantarse, sentarse y levantarse, caminar en terreno irregular y caminar con recuperación.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de un pipeline de reinforcement learning para robótica de bajo coste, con normalizador de observaciones embebido en el propio `policy.onnx`, un manifiesto compatible con el daemon `robotctl` y resultados verificables en simulación. No aporta benchmarks de NLP ni capacidades lingüísticas: los campos de idiomas, contexto o cuantización no aplican a este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de reinforcement learning; topología interna no detallada en la model card (se exporta como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de 61 dimensiones de observación y 14 acciones de salida a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` según el esquema 2 del manifiesto de políticas de microduck |
| Tarea | Voltereta hacia delante desde parado (forward roll) |
| Duracion del episodio | 2,0 s; mantener el botón encadena otra ejecución |
| Entorno de observacion/accion | 61-D observación, 14 acciones, 50 Hz |
| Tamano del repositorio | 0,0 GB (redondeado en HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

La model card no describe la topología concreta de la red (capas, número de parámetros ni tipo de función de activación), solo que se exporta a ONNX y que el normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. Se trata de una política episódica: ejecuta la voltereta durante 2,0 s y devuelve el robot a una postura de pie, con encadenado mediante pulsación sostenida del botón.

El entrenamiento se realizó íntegramente en simulación, sin datos de un robot físico. La tarea es `Mjlab-Roulade-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`), con el presupuesto del fabricante de 10.000 iteraciones, 4.096 entornos paralelos y 173 minutos de cómputo (1,04 s por iteración) en una RTX 5090. El autor señala que la recompensa media se estabilizó en torno a la iteración 2.000 (35,0) y llegó a 36,4 en la 10.000, por lo que un entrenamiento de 3.000 iteraciones habría producido la misma política.

Las tomas de prueba se realizaron con `play` de mjlab (1 entorno, spawn de pie, episodio de 12 s) y se evaluaron a partir del vector de gravedad en el marco del cuerpo y la altura del tronco, no del vídeo. En 3 de 3 tomas la voltereta se completa: erguido a 115 mm en 0 s, cabeza en el suelo a 0,3 s, boca abajo a 0,6 s (tronco a 147 mm), sobre la espalda a 0,8 s (42 mm), erguido a 1,0 s y de nuevo a 115 mm desde 1,2 s hasta el final del episodio, sin reset de entorno. El control de la iteración 0 se vuelca hacia delante y cae de bruces a 0,8 s.

## Capacidades

- Control motor de dominio especifico: ejecucion de una voltereta hacia delante desde una postura estatica sobre terreno plano.
- Retorno autonomo a la postura erguida al final del episodio (2,0 s) y encadenado de ejecuciones al mantener pulsado el boton.
- Inferencia en tiempo real a 50 Hz a partir de un vector de observacion de 61 dimensiones con 14 acciones de salida.
- Normalizacion de observaciones integrada en el propio grafo ONNX, lo que simplifica el despliegue: el consumidor no necesita preprocesar los datos.
- Integracion con el daemon del robot mediante `robotctl policy add` y `robotctl robot do roulade`.
- Compatibilidad de metadatos con `manifest.json`, esquema 2 del manifiesto de politicas de microduck.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, capacidades de agente ni soporte multilingue: es una politica de control robotico.
- No hay modo de pensamiento (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Investigacion en sim-to-real para robotica cuadrupeda de bajo coste: la politica permite estudiar la brecha entre una habilidad aprendida en MuJoCo Warp y su comportamiento en los servos reales del Microduck, una vez se disponga del robot fisico.
- Reproduccion de un pipeline de reinforcement learning completo: sirve como referencia para replicar el flujo de `pollen-robotics/microduck_rl` (tarea, iteraciones, entornos paralelos) y comparar el coste de entrenamiento en distintas GPU.
- Demostraciones educativas de aprendizaje por refuerzo: el modelo ilustra de forma tangible como una recompensa estable a partir de la iteracion 2.000 se traduce en una habilidad motora concreta, con material audiovisual comparativo entre la iteracion 0 y la 10.000.
- Desarrollo incremental de un arbol de habilidades: dado que el autor lo situa como nivel 6 de una progresion (caminar, levantarse, sentarse y levantarse, terreno irregular, caminar con recuperacion), puede usarse como base para composicion de habilidades o para estudiar el encadenado de politicas.
- Evaluacion de despliegue en el borde: al ser un artefacto ONNX pequeno, es util para medir latencias de inferencia y consumo energetico en hardware embebido o en CPU, aunque no se publican cifras concretas.
- Pruebas de integracion del daemon `robotctl`: el manifiesto y el comando `robotctl robot do roulade` permiten validar el ciclo de carga, registro y ejecucion de politicas de terceros en la plataforma Microduck.
- Generacion de datos sinteticos de referencia: las tomas de `play` con lectura de gravedad y altura de tronco pueden servir como linea base para comparar futuras politicas de voltereta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican MMLU, HumanEval, GSM8K ni metricas de NLP equivalentes). El unico rendimiento reportado es en simulacion:

| Metrica (simulacion MuJoCo) | Valor |
|---|---|
| Tarea | Mjlab-Roulade-Flat-MicroDuck (commit 53b8971b6) |
| Iteraciones de entrenamiento | 10.000 |
| Entornos paralelos | 4.096 |
| Tiempo de entrenamiento | 173 min (1,04 s/iteracion) en una RTX 5090 |
| Recompensa media en iteracion 2.000 | 35,0 |
| Recompensa media en iteracion 10.000 | 36,4 |
| Tomas de `play` que completan la voltereta | 3 de 3 |
| Altura del tronco (erguido, 0 s / 1,0 s) | 115 mm |
| Altura del tronco (boca abajo, 0,6 s) | 147 mm |
| Altura del tronco (sobre la espalda, 0,8 s) | 42 mm |
| Duracion de la voltereta en simulacion | ~1 s |
| Control de la iteracion 0 | Se vuelca hacia delante y cae de bruces a 0,8 s |

## Requisitos de hardware

- Entrenamiento reportado: una unica RTX 5090, 173 minutos para 10.000 iteraciones con 4.096 entornos paralelos.
- Inferencia: no se publican cifras de VRAM, latencia ni throughput. El repositorio ocupa 0,0 GB en HuggingFace, lo que sugiere un artefacto de muy bajo peso, pero no se confirma ninguna medida.
- GPU recomendadas para inferencia: no disponibles en la informacion proporcionada. Para replay o analisis con mjlab, la model card cita `play` sobre un unico entorno, aunque no especifica el hardware minimo.
- Encaje en GPU de consumo: no confirmado. Dado el tamano aparente del `policy.onnx`, es plausible su ejecucion en CPU o en GPU de gama baja, pero no hay datos publicados que lo respalden.
- Opciones de despliegue: ONNX Runtime (implicito por el formato) y el daemon `robotctl` del Microduck mediante `robotctl policy add roulade witcheer/microduck-roulade` seguido de `robotctl robot do roulade`. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican a este artefacto.
- Latencia y throughput: no disponibles. La politica opera a 50 Hz en el robot, pero no se documentan tiempos de inferencia por paso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otras politicas comparables (parametros, contexto, rendimiento, licencia o disponibilidad). El autor menciona que apareceran mas politicas del mismo arbol de habilidades bajo el prefijo `witcheer/microduck-*` (niveles 1 a 5: caminar, levantarse, sentarse y levantarse, caminar en terreno irregular y caminar con recuperacion), pero no se aportan especificaciones ni resultados de esas politicas, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No probado en hardware real: la model card indica explicitamente que la politica no se ha ejecutado en un Microduck fisico y que no hay garantias sobre el comportamiento de los servos reales ni del suelo.
- Entrenamiento exclusivamente en simulacion (mjlab / MuJoCo Warp) sobre terreno plano; el comportamiento en superficies irregulares o con friccion distinta es desconocido.
- Solo se registraron volteretas iniciadas desde la postura de pie. No se probaron las entradas desde los spawns a mitad de voltereta de la tarea.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de benchmarks estandar y de metricas de robustez mas alla de 3 tomas de `play` en un unico entorno.
- Riesgo de sobreajuste al simulador: la recompensa plana desde la iteracion 2.000 sugiere convergencia prematura; el autor indica que 3.000 iteraciones habrian bastado, lo que apunta a un margen de mejora limitado o a una tarea poco exigente.
- Politica episodica y de proposito unico: no generaliza a otras tareas, no acepta instrucciones en lenguaje natural y no tiene capacidades de planificacion ni de agente.
- Cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el artefacto de forma independiente.
- No hay informacion sobre sesgos, ya que no se trata de un modelo de datos o lenguaje, pero si sobre posibles fallos de control fisico no documentados en simposio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-roulade
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`)
- Clip comparativo iteracion 0 vs 10.000 a media velocidad: https://x.com/witcheer/status/2102076057411031472
- Manifiesto de politicas de microduck (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon
- Otros resultados de busqueda web: no relevantes (resultados de una tienda de manualidades, sin relacion con el modelo)
