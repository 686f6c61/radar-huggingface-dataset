# witcheer/microduck-walk-recover-rough

## Resumen

walk-recover-rough es una politica de control por aprendizaje por refuerzo para el robot cuadrupedo microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un controlador de marcha que ocupa el slot `walk` del robot, con 61 dimensiones de observacion y 14 acciones, ejecutandose a 50 Hz. Lo desarrolla el usuario witcheer y se publica bajo el pipeline `robotics` de HuggingFace con la libreria `microduck`.

El modelo es una evolucion de walk-recover v1 (politica de suelo llano) que se ha reentrenado especificamente para terreno irregular. Sobre las 20.000 iteraciones originales se anadieron 3.000 iteraciones en escaleras, pendientes y rejillas de bloques ordenadas por dificultad, con 4096 entornos en paralelo durante unos 183 minutos (3,7 s por iteracion) en una unica RTX 5090. La innovacion principal no esta en la arquitectura de red sino en el curriculum de terreno: en lugar de la rejilla aleatoria estandar, se dispuso una escalera ordenada de dificultad en 10 filas.

Su relevancia es acotada y muy especifica: es una pieza de una skill tree de politicas para microduck, pensada para ser cargada en el robot mediante `robotctl policy load walk`. La propia model card advierte que solo se ha validado en simulacion (Mjlab-VelStand-Rough-MicroDuck) y que no se ha probado en un Microduck real. El resultado mas destacable es la mejora en escaleras, con muestras muy pequenas (2 de 3 frente a 0 de 3 de v1), que el autor pide leer como indicio y no como ganancia medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (red neuronal) exportada a ONNX; no es un transformer ni un modelo de lenguaje. Detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observacion de 61 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`; el normalizador de observaciones va embebido en el propio ONNX) |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` (esquema 2 del manifiesto de politicas microduck) |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Entorno de entrenamiento | Mjlab-VelStand-Rough-MicroDuck (solo simulacion) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6` (exportado desde un checkout con cambios sin commitear) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red. Se sabe que es una politica perpetua (se ejecuta hasta que se le indique lo contrario) que consume 61 observaciones, emite 14 acciones y opera a 50 Hz, y que el normalizador de observaciones esta integrado en el fichero ONNX, de modo que el robot debe alimentar observaciones en crudo. El modelo se empaqueta siguiendo el esquema 2 del manifiesto de politicas del daemon de microduck.

El entrenamiento parte de walk-recover v1: 20.000 iteraciones previas mas 3.000 adicionales sobre terreno irregular, con 4096 entornos, 183 minutos a aproximadamente 3,7 s por iteracion en una RTX 5090. El terreno se organizo como una escalera ordenada de dificultad (filas 0 a 9, siendo la 9 la mas dura) en lugar de la rejilla aleatoria estandar. Se aplicaron cinco parches locales al codigo del creador, todos incluidos en el dataset asociado: comprobaciones de caida y altura medidas contra el suelo bajo el pato en lugar del centro del parche (`ground_height_patch.py`), termino de nivel de terreno basado en tracking (`terrain_tracking_patch*.py`), episodios que arrancan tumbado sin mover el nivel de terreno (`terrain_prone_neutral_patch.py`), registro de motivos de bajada de nivel (`terrain_demote_arms_patch.py`) y modo curriculum en el generador de terreno (`terrain_curriculum_mode_patch.py`). La recompensa media mediana entre las iteraciones 22.800 y 22.900 fue de 38,1, con la fila media de terreno estabilizada en torno a 5,9 de 9 desde la iteracion 21.000. Diez iteraciones registraron recompensas medias muy negativas (la minima, -1.402.121,9 en la iteracion 21.509) mientras la longitud media de episodio se mantenia en unos 660 pasos; el autor indica que la causa no esta investigada.

## Capacidades

- Locomocion cuadrupeda (marcha) en terreno irregular: escaleras, pendientes y rejillas de bloques.
- Recuperacion de perturbaciones: mantiene la postura ante empujes en el entorno de simulacion usado para las pruebas (los empujes en terreno irregular no se han probado).
- Politica perpetua: no tiene horizonte de episodio fijo, se ejecuta de forma continua hasta que se le indique lo contrario.
- Ocupa el slot `walk` del sistema de politicas de microduck, cargable con `robotctl policy load walk`.
- No dispone de tool calling, function calling, agentes, capacidades multilingues ni modo de razonamiento: no es un modelo de lenguaje.
- No incluye vision, audio ni ninguna otra modalidad: la entrada es exclusivamente el vector de 61 observaciones propioceptivas.
- No se levanta tras una caida: partiendo tumbado boca abajo o boca arriba, 0 de 9 tomas terminaron de pie (igual que v1).

## Casos de uso

- Marcha sobre suelo irregular en simulacion: punto de partida para investigacion en aprendizaje por refuerzo de locomocion, ya que cubre escaleras, pendientes y rejillas de bloques en un unico controlador.
- Base para curriculum de terreno: los cinco parches documentados (nivel de terreno por tracking, curriculum mode, comprobacion de altura respecto al suelo local) sirven como referencia reproducible para quien disene sus propias escaleras de dificultad.
- Benchmark interno de politicas: al compartir toma de pruebas con walk-recover v1 y walk-rough, permite comparar variantes bajo las mismas condiciones (20 s por toma, spawn a 1,6 m del centro del parche, fila de terreno forzada).
- Iteracion de entrenamiento en una sola GPU: con 3.000 iteraciones en 183 minutos y 4096 entornos en una RTX 5090, el coste de reentrenar y comparar variantes es bajo para un laboratorio con hardware de gama alta.
- Prototipado previo al despliegue fisico: cargar la politica en el daemon de microduck mediante `robotctl` para validar la integracion del pipeline (ONNX mas manifiesto) antes de invertir en pruebas con el robot real.
- Docencia y divulgacion sobre RL aplicado a robotica: caso realista de politica de 61 observaciones y 14 acciones, con resultados negativos documentados (no se levanta) y con muestras pequenas explicitamente reconocidas.
- No es adecuado para produccion en robot fisico: no se ha probado en un Microduck real y no hay datos de robustez ante perturbaciones fuera del entorno de simulacion.

## Benchmarks y rendimiento

Los unicos resultados disponibles son de simulacion (Mjlab-VelStand-Rough-MicroDuck), con tomas de 20 s mediante `headless_play`, empujes desactivados, spawn a 1,6 m del centro del parche y fila de terreno forzada. Se considera caida cuando el cuerpo supera los 60 grados de inclinacion (gravedad en el marco del cuerpo con z por encima de -0,5). Un reset nunca se contabiliza como levantarse.

| Escenario | walk-recover-rough | walk-recover v1 (suelo llano) |
|---|---|---|
| Fila mas dura, de pie todo el tiempo (9 tomas) | 7 de 9 | 6 de 9 |
| Escaleras (3 tomas) | 2 de 3 | 0 de 3 (caidas a 5,3 s, 15,2 s y 17,7 s) |
| Pendientes (3 tomas) | 3 de 3 | 3 de 3 |
| Rejilla de bloques (3 tomas) | 2 de 3 | 3 de 3 |
| Tumbado boca abajo o boca arriba, fila 6, tres tipos de terreno (9 tomas) | 0 de 9 | 0 de 9 |
| Checkpoint de 22.900 iteraciones frente a reentrenamiento con rejilla aleatoria (18 tomas) | 16 de 18 sin caida | 13 de 18 (reentrenamiento con rejilla aleatoria estandar) |

El autor subraya que las muestras son pequenas y que la diferencia en escaleras debe leerse como indicio, no como ganancia medida. No hay resultados de benchmarks de terceros ni metricas en robot real. No se han publicado datos de MMLU, HumanEval, GSM8K u otros: no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en robot: la politica es una red de 61 entradas y 14 salidas a 50 Hz en formato ONNX; el coste computacional es minimo y esta pensado para ejecutarse en el propio daemon de microduck. VRAM estimada: no disponible en la informacion proporcionada, pero el tamano del repositorio es de 0,0 GB, lo que indica un fichero de pesos muy pequeno.
- Entrenamiento: una unica RTX 5090, 183 minutos para 3.000 iteraciones con 4096 entornos en paralelo (aproximadamente 3,7 s por iteracion). No se especifica VRAM consumida.
- GPU recomendadas para reentrenar: RTX 5090 (la usada por el autor). No hay datos para A100, H100 u otras.
- Compatibilidad con GPU de consumo: el entrenamiento si se hizo en una GPU de consumo (RTX 5090); la inferencia se plantea en el hardware del robot, no en GPU de escritorio.
- Opciones de despliegue: `robotctl policy load walk witcheer/microduck-walk-recover-rough` sobre el daemon de microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso). No se publican cifras de tiempo de inferencia por paso ni de latencia adicional.

## Comparativa con modelos similares

| Modelo | Tipo | Proposito | Rendimiento en fila mas dura | Escaleras | Licencia |
|---|---|---|---|---|---|
| witcheer/microduck-walk-recover-rough | Politica RL, ONNX | Marcha con recuperacion en terreno irregular | 7 de 9 tomas de pie 20 s | 2 de 3 | no disponible |
| witcheer/microduck-walk-recover | Politica RL, ONNX | Marcha con recuperacion en suelo llano (base de este modelo) | 6 de 9 | 0 de 3 | no disponible |
| witcheer/microduck-walk-rough | Politica RL, ONNX | Marchador en terreno irregular sin recuperacion | no disponible en la informacion proporcionada | no disponible | no disponible |

Los tres modelos pertenecen al mismo autor y comparten formato de despliegue y slot; no se dispone de comparativas con politicas de otros autores para microduck.

## Limitaciones y advertencias

- Solo simulacion: no se ha probado en un Microduck real. El autor lo indica explicitamente.
- No se levanta tras una caida: 0 de 9 tomas desde posicion tumbada, tanto en este modelo como en v1. Si el robot cae, la politica no lo recupera.
- Muestras muy pequenas: los resultados de escaleras (2 de 3 frente a 0 de 3) y de la fila mas dura (7 de 9 frente a 6 de 9) no permiten afirmar una mejora estadisticamente solida.
- Sin probar: empujes en terreno irregular, seguimiento de comandos de velocidad en ese terreno y comportamiento en hardware real.
- Rendimiento degradado en rejilla de bloques respecto a v1 en las tomas realizadas (2 de 3 frente a 3 de 3), aunque con muestras de tres tomas.
- Anomalias de entrenamiento sin diagnosticar: diez iteraciones con recompensa media muy negativa (minimo de -1.402.121,9 en la iteracion 21.509) con longitud media de episodio normal (unos 660 pasos); el autor no ha investigado la causa.
- Reproducibilidad limitada: el modelo se exporto desde un checkout con cambios sin commitear del repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`), aunque los cinco parches usados se incluyen en el dataset asociado.
- Licencia no disponible: no se puede confirmar si se permite uso comercial. Conviene contactar con el autor antes de cualquier uso en produccion.
- Sin datos de sesgos en el sentido habitual de modelos de lenguaje: al no procesar texto ni lenguaje, las consideraciones de sesgo linguistico no aplican; el riesgo analogo es el sobreajuste al terreno y al entorno de simulacion concretos del entrenamiento.
- Idiomas soportados: no disponible y no aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-walk-recover-rough
- Modelo base (suelo llano): https://huggingface.co/witcheer/microduck-walk-recover
- Marchador en terreno irregular: https://huggingface.co/witcheer/microduck-walk-rough
- Dataset con tomas, parches, curva de recompensa y la entrada de cola (carpeta `level-05c-walk-recover-rough`): https://huggingface.co/datasets/witcheer/microduck-skill-tree
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (no es un enlace verificado en la busqueda; se cita como `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6`): no disponible como URL en la informacion proporcionada
- Documentacion del manifiesto de politicas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL en la informacion proporcionada
- Resultados de la busqueda web: ninguno relevante; las entradas devueltas tratan sobre videojuegos y otros temas y no aportan informacion sobre este modelo.
