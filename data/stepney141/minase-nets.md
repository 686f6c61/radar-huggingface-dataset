# stepney141/minase-nets

## Resumen

`minase-nets` es un repositorio de pesos de evaluacion (redes neuronales) para [minase](https://github.com/stepney141/minase), un motor de ajedrez de chu shogi escrito en Rust por el desarrollador stepney141. No se trata de un modelo de lenguaje, sino de un conjunto de redes neuronales especializadas en la evaluacion de posiciones de shogi y chu shogi (una variante del shogi en un tablero de 12x12). El repositorio publica tres familias de redes: NNUE de tipo P en formato `LayerStack` de tatara, NNUE `HalfKP_vm` en formato `Simple`, y redes ONNX de estilo AlphaZero para busqueda PV-MCTS.

El problema que resuelve es la evaluacion de posiciones en un motor de juego de tablero: estas redes sustituyen o complementan a las funciones de evaluacion heuristicas tradicionales, proporcionando una estimacion aprendida del valor de una posicion que el motor usa durante la busqueda. Es relevante para la comunidad de motores de shogi porque el chu shogi es una variante con muy pocos motores modernos basados en aprendizaje, y este repositorio documenta de forma rigurosa el formato, la compatibilidad y las mediciones de entrenamiento de cada red.

En el momento de la consulta, el repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y fue creado el 2026-11-21. La informacion disponible se limita a la model card y a los enlaces de mediciones del autor; no se publican especificaciones de arquitectura detalladas mas alla de las estructuras de red indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de evaluacion para motores de shogi: NNUE (P-type `LayerStack`, `HalfKP_vm` `Simple`) y ONNX estilo AlphaZero para PV-MCTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se publican en `.nnue` y `.onnx`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.nnue` (NNUE) y `.onnx` (AlphaZero PV-MCTS) |

Estructuras de red publicadas segun la model card:

| Familia | Estructura | Formato |
|---|---|---|
| NNUE P-type | `256x2`, PSQT | `LayerStack` de tatara |
| NNUE `HalfKP_vm` | `256x2-32-32` | `Simple` de tatara |
| AlphaZero | no especificada | ONNX para PV-MCTS |

## Arquitectura y entrenamiento

La model card describe tres tipos de redes. Las NNUE de tipo P usan el formato `LayerStack` del framework tatara, con una estructura `256x2` y PSQT (piece-square table) integrada. Las NNUE `HalfKP_vm` usan el formato `Simple` de tatara con estructura `256x2-32-32`, es decir, una capa de entrada de 256 features por dos perspectivas, seguida de dos capas ocultas de 32 neuronas. Las redes AlphaZero son modelos ONNX pensados para busqueda PV-MCTS con la opcion `--search mcts` del motor.

Respecto al entrenamiento, la model card solo indica que la red publicada `minase-nnue-p-jcsa-20261118-37054c9e.nnue` usa el conjunto de reglas `JCSA` como datos de entrenamiento, y enlaza a dos documentos de mediciones del repositorio del motor: uno de entrenamiento y otro de STC (self-play time control o comparacion de fuerza). No se detalla el numero de tokens, la composicion del dataset, ni si hubo RLHF/DPO (conceptos que, por otra parte, no aplican a un motor de juego). No se documentan innovaciones como decodificacion especulativa o attention linear.

El sistema de versionado es notable: cada fichero se nombra como `minase-<method>-<arch>-<rules>-<YYYYMMDD>-<sha256-prefix8>.<ext>`, y el motor reporta el digest SHA-256 completo de 64 caracteres en `info string network_sha256 <sha256>` justo antes de `readyok` cuando carga la red via `EvalFile` o `NnModel`. Esto permite verificar la integridad y autenticidad de los pesos en produccion.

## Capacidades

- Evaluacion de posiciones de shogi y chu shogi mediante redes neuronales (NNUE y AlphaZero).
- Soporte de dos protocolos de comunicacion con el motor: USI (opcion `EvalFile`, `NnModel`) y CECP (tras `new`).
- Integracion con busqueda clasica alfa-beta a traves de NNUE y con busqueda PV-MCTS a traves de las redes ONNX estilo AlphaZero.
- Verificacion criptografica de pesos: el motor expone el SHA-256 completo de la red cargada.
- Compatibilidad declarada con `minase >= 3.0.0-alpha.1` para la red P-type publicada.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes, y no tiene capacidades multilingues.

## Casos de uso

- Motor de chu shogi para analisis de partidas: cargar la red NNUE P-type via `EvalFile` en minase y usar el motor para analizar posiciones de chu shogi con una funcion de evaluacion aprendida en lugar de heuristica manual.
- Motor de shogi para juego por correspondencia o analisis: usar las redes `HalfKP_vm` (`256x2-32-32`) con el conjunto de reglas adecuado para evaluar posiciones de shogi estandar.
- Entrenamiento de motores PV-MCTS: emplear las redes ONNX estilo AlphaZero con `--search mcts` para experimentar con busqueda guiada por politica y valor en variantes de shogi.
- Investigacion en evaluacion de juegos de tablero: comparar el rendimiento de NNUE P-type frente a `HalfKP_vm` usando los registros de mediciones STC publicados por el autor.
- Verificacion de integridad en pipelines: descargar los pesos, comprobar el SHA-256 contra el nombre del fichero y contra `info string network_sha256`, y automatizar la validacion antes de desplegar el motor en un servicio de analisis.
- Desarrollo de motores derivados: reutilizar los formatos `LayerStack` y `Simple` de tatara como referencia para implementar carga de NNUE en otros motores de shogi o chu shogi.
- Benchmarking de hardware para motores de juego: usar minase con estas redes para medir nodos por segundo y fuerza de juego en distintas CPU, ya que NNUE se ejecuta tipicamente en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a documentos de mediciones de entrenamiento y STC en el repositorio del motor, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; las NNUE estan disenadas para ejecutarse en CPU.
- GPU recomendadas: no disponible; las redes ONNX para PV-MCTS podrian ejecutarse en GPU, pero no se documentan requisitos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el motor minase (Rust) carga las redes via USI (`EvalFile`, `NnModel`) o CECP. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minase-nets | Redes de evaluacion para shogi/chu shogi | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| Redes NNUE de YaneuraOu | NNUE para shogi | no disponible en la informacion | no aplica | no disponible | Ecosistema YaneuraOu |
| Redes de motores AlphaZero-style para juegos de tablero | ONNX / políticas y valores | no disponible | no aplica | variable | Repositorios de investigacion |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K.
- La licencia no esta declarada, lo que impide confirmar si el uso comercial esta permitido; es un riesgo para produccion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (2026-11-21); no hay evidencia de uso en produccion ni validacion externa.
- Solo se publica una red en la tabla de la model card (`minase-nnue-p-jcsa-20261118-37054c9e.nnue`); las demas rutas descritas en el layout de directorios no aparecen listadas con ficheros concretos.
- La red publicada usa el conjunto de reglas `JCSA` como datos de entrenamiento; su comportamiento fuera de ese conjunto de reglas no esta documentado.
- Compatibilidad limitada a `minase >= 3.0.0-alpha.1` para la red P-type; versiones anteriores no estan soportadas.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a un modelo de evaluacion de juegos.
- El tamano del repo es 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que la medicion es imprecisa.

## Enlaces

- Hugging Face: https://huggingface.co/stepney141/minase-nets
- Repositorio del motor minase: https://github.com/stepney141/minase
- Mediciones de entrenamiento (NNUE tatara y HalfKP_vm): https://github.com/stepney141/minase/blob/master/docs/measurements/nnue-tatara-framework-and-halfkp-vm/nnue-tatara-framework-and-halfkp-vm-training.md
- Mediciones STC (NNUE tatara y HalfKP_vm): https://github.com/stepney141/minase/blob/master/docs/measurements/nnue-tatara-framework-and-halfkp-vm/nnue-tatara-framework-and-halfkp-vm-stc.md
