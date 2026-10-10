# vladfi/phillip-models

## Resumen

`vladfi/phillip-models` es un repositorio de pesos entrenados mediante aprendizaje por refuerzo para jugar a Super Smash Bros. Melee, exportados al formato ONNX. No es un modelo de lenguaje: se trata de políticas de control (agents) que actúan como jugador dentro de Slippi Dolphin, el emulador con rollback netcode que la comunidad competitiva de Melee utiliza para jugar en línea. El autor es vladfi, responsable del proyecto slippi-ai (cuyo agente se llama phillip).

El repositorio contiene dos tipos de artefactos: un índice `index-v1.json` que lista los modelos publicados —con personajes, oponentes, retardo de reacción en fotogramas, tamano y hash sha256— y un fichero `<nombre>.onnx` por modelo. Todos los pesos se exportaron con tamano de lote 1 y precision float16, y los metadatos de cada fichero ONNX incluyen la configuración de entrenamiento empleada.

Su relevancia es acotada pero concreta: sirve como distribución oficial de las políticas de phillip para la aplicación de escritorio y para experimentos reproducibles en el ámbito del RL aplicado a videojuegos de lucha, un dominio con requisitos de latencia muy estrictos (inferencia por fotograma a 60 Hz). El tamano total del repositorio es de 0,3 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de aprendizaje por refuerzo exportadas a ONNX; la model card no detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | float16 (pesos exportados en fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (un fichero `<nombre>.onnx` por modelo, batch size 1) |
| Libreria declarada | onnx |
| Pipeline | reinforcement-learning |
| Tamano del repositorio | 0,3 GB |
| Ficheros auxiliares | `index-v1.json` (lista de modelos publicados con personajes, oponentes, retardo de reaccion, tamano y sha256) |
| Dominio de aplicacion | Super Smash Bros. Melee sobre Slippi Dolphin |
| Metadatos de entrenamiento | incluidos en los metadatos de cada fichero ONNX |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles de la topologia de red (numero de capas, tipo de capas, funcion de activacion ni dimensiones de entrada/salida). Lo unico verificable es que se trata de politicas obtenidas por aprendizaje por refuerzo dentro del proyecto slippi-ai y que el resultado se serializa como grafo ONNX con lote de tamano 1 y pesos en float16. Cada fichero ONNX embebe en sus metadatos la configuracion de entrenamiento correspondiente, por lo que los detalles finos de entrenamiento (algoritmo, hiperparametros, recompensas) deben consultarse directamente en el repositorio de GitHub.

El flujo de publicacion se realiza con `scripts/publish_models.py` del repositorio de GitHub, que sube los ficheros y actualiza el indice; cada entrada del indice apunta a una URL de descarga fijada al commit que subio el modelo, lo que garantiza reproducibilidad por version. La inferencia puede lanzarse desde linea de comandos con `python scripts/eval_two.py --p2.ai.model=diamond`, donde `diamond` es el identificador de uno de los modelos publicados.

No se especifica en la informacion disponible si hubo fases de ajuste fino supervisado, destilacion o aprendizaje por imitacion previas al RL, ni el numero de tokens, episodios o fotogramas de entrenamiento. No se describen innovaciones tecnicas como decodificacion especulativa ni mecanismos de atencion lineal, dado que no se trata de un modelo generativo de texto.

## Capacidades

- Control de un personaje de Super Smash Bros. Melee dentro de Slippi Dolphin, actuando como jugador autonomo.
- Seleccion configurable de personaje y de oponente por modelo, segun los campos declarados en `index-v1.json`.
- Retardo de reaccion parametrizable por modelo, expresado en fotogramas, lo que permite simular niveles de tiempo de reaccion humanos distintos.
- Inferencia a nivel de fotograma con lote de tamano 1, adecuada para un bucle de juego a 60 Hz.
- Distribucion integrada en la aplicacion phillip: la app lista los modelos y descarga el seleccionado, sin necesidad de descarga manual desde HuggingFace.
- Verificacion de integridad mediante hash sha256 declarado por modelo en el indice.
- Uso por linea de comandos para partidas automatizadas y evaluacion de politicas.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento explicito: son capacidades propias de modelos de lenguaje y no aplican a este artefacto.

## Casos de uso

- Entrenamiento de jugadores humanos: un jugador de Melee puede enfrentarse a las politicas de phillip como companero de entrenamiento reproducible, ajustando el retardo de reaccion del modelo para practicar contra un rival de tiempo de reaccion fijo y conocido.
- Investigacion en aprendizaje por refuerzo aplicado a juegos de lucha: el repositorio permite partir de politicas ya entrenadas para estudiar transferencia, robustez o estrategias emergentes, sin tener que reproducir el coste de entrenamiento desde cero.
- Evaluacion comparativa de politicas: el indice `index-v1.json` incluye personajes, oponentes y hash por modelo, lo que facilita montar experimentos controlados entre versiones concretas y fijadas a un commit.
- Infraestructura de torneos o exhibiciones automatizadas: la app phillip descarga el modelo seleccionado de forma transparente, de modo que se puede desplegar un agente en un entorno de streaming o demo sin gestion manual de pesos.
- Desarrollo de herramientas para la comunidad Slippi: al estar en ONNX, las politicas pueden cargarse desde otros runtimes y lenguajes para construir visores de decision, analisis de inputs o instrumentacion del agente.
- Reproduccion de experimentos: las URLs de descarga estan fijadas al commit y los hashes sha256 acompanan a cada entrada, lo que permite verificar que la politica evaluada es exactamente la publicada.
- Integracion en pipelines de investigacion de vision por computador aplicada a juegos: si el agente consume observaciones basadas en pantalla, el modelo ONNX puede integrarse en un bucle de captura e inferencia propio, aunque la model card no especifica el formato exacto de las observaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de win rate, Elo, porcentaje de victorias por enfrentamiento ni comparaciones cuantitativas con otros agentes de Melee. Los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a herramientas de busqueda visual de Bing y no guardan relacion con el repositorio).

## Requisitos de hardware

- VRAM estimada: no disponible. No se especifica el tamano de parametros de cada politica, solo el tamano agregado del repositorio (0,3 GB) y que los pesos estan en float16.
- GPU recomendadas: no disponibles. Al ser un grafo ONNX con lote 1, es plausible ejecutarlo en GPU de consumo, pero no se aporta ninguna lista de hardware validada.
- Viabilidad en GPU de consumo: no confirmada explicitamente en la informacion disponible; el hecho de que el agente se ejecute dentro de Slippi Dolphin y que los ficheros se exporten en fp16 con lote 1 sugiere un coste de inferencia bajo, pero no hay cifras que lo respalden.
- Opciones de despliegue: ONNX (formato de exportacion), a traves de la aplicacion phillip y de los scripts del repositorio de GitHub (`scripts/eval_two.py`, `scripts/publish_models.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El requisito funcional implicito es una inferencia por fotograma para sostener los 60 Hz del juego, pero no se publican mediciones.
- Almacenamiento necesario: el repositorio completo ocupa 0,3 GB, aunque el peso final depende de cuantos modelos se descarguen individualmente.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes de aprendizaje por refuerzo para Super Smash Bros. Melee con los que comparar parametros, contexto, rendimiento, licencia o disponibilidad, y los resultados de busqueda web recibidos no aportan alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al tratarse de una politica entrenada por refuerzo, es esperable que herede las caracteristicas de la distribucion de entrenamiento (personajes, escenarios, oponentes y estilos vistos durante el entrenamiento), pero no hay documentacion al respecto en la informacion facilitada.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos de lenguaje, pero si existe el riesgo analogo de comportamiento fuera de distribucion ante situaciones no cubiertas durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Rendimiento por enfrentamiento: el rendimiento depende del personaje y del oponente, que son atributos declarados por modelo en `index-v1.json`. No hay datos publicos de win rate en la informacion disponible.
- Restricciones de licencia: licencia MIT, que en principio permite uso comercial, modificacion y redistribucion con conservacion del aviso de copyright. Conviene revisar igualmente la situacion legal de los assets de Super Smash Bros. Melee, que son propiedad de Nintendo y no se distribuyen con este repositorio.
- Caveats para produccion: dependencia del ecosistema Slippi Dolphin y de la aplicacion phillip; las URLs de descarga estan fijadas a commits concretos, de modo que cualquier cambio en el repositorio puede romper integraciones que no usen el indice; el indice se versiona (`index-v1.json`), por lo que un cambio de esquema requeriria adaptar los clientes.
- Adopcion practicamente nula en el momento de los datos: 0 descargas y 0 likes, sin senales de validacion externa.
- Metadatos incompletos: no se documentan parametros totales, arquitectura ni observaciones de entrada, lo que dificulta evaluar el coste real de integracion sin inspeccionar los ficheros ONNX.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vladfi/phillip-models
- Repositorio de GitHub del proyecto slippi-ai (phillip): https://github.com/vladfi1/slippi-ai
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, demos o repositorios adicionales) asociados a este modelo.
