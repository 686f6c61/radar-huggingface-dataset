# teyler/MineChoice-stone-pickaxe-19k-experimental

## Resumen

MineChoice-stone-pickaxe-19k-experimental es un checkpoint de investigacion publicado por el autor independiente teyler como paso inicial hacia un agente capaz de completar Minecraft. No es un modelo de lenguaje ni un sistema de gran tamano: se trata de un perceptron multicapa (MLP) de 19.592 parametros que actua como clasificador de habilidad a partir de un estado estructurado del juego. Recibe 15 entradas numericas (inventario, bloques cercanos, salud, comida y distancias) y produce una de ocho acciones categoricas discretas.

El modelo resuelve una tarea acotada: decidir la siguiente habilidad en la secuencia de obtencion de un pico de piedra, desde recoger madera hasta fabricar el pico. Fue entrenado desde cero con entropia cruzada sobre decisiones reales grabadas de un profesor programado en Minecraft 1.20.4, y los rollouts de la politica aprendida ejecutan las decisiones de la red sin recurrir al profesor.

Su relevancia es de nicho y experimental: demuestra un pipeline completo de recoleccion de datos, entrenamiento y evaluacion en un dominio de estado estructurado, con inferencia nativa en Node.js sobre CPU. El propio autor advierte que el modelo no ha completado Minecraft, no es un modelo de speedrunning y que los datos son demasiado escasos (99 filas de entrenamiento, 11 de validacion) para establecer generalizacion en el mundo natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) feedforward; 15 entradas, dos capas ocultas de 128 unidades con ReLU, 8 salidas categoricas |
| Parametros totales | 19.592 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de estado estructurado, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportacion de pesos en punto flotante; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica / no disponible (observaciones de arena de roble y piedra; sin procesamiento de lenguaje natural) |
| Licencia | MIT (cubre codigo fuente original y pesos originales; el software de terceros mantiene sus propios terminos) |
| Formato de pesos | safetensors, PyTorch state_dict (model.pt) y JSON portable (policy.json) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas: 15 caracteristicas de entrada, dos capas ocultas de 128 unidades con activacion ReLU y 8 salidas categoricas correspondientes a las acciones gather_log, craft_planks, craft_sticks, craft_table, place_table, craft_wooden_pickaxe, mine_stone y craft_stone_pickaxe. Una mascara de factibilidad determinista elimina las habilidades no disponibles en cada estado. El modelo no procesa texto ni imagenes: opera exclusivamente sobre un vector numerico de estado.

El entrenamiento se realizo desde cero con entropia cruzada sobre decisiones grabadas de un profesor programado (coded teacher) en un servidor local de Minecraft 1.20.4, sobre una RTX 3090. El conjunto de datos contiene 99 filas de entrenamiento y 11 de validacion, agrupadas en 9 episodios de entrenamiento y 1 de validacion (los splits son por episodio). Solo las transiciones de habilidad completadas con exito aportan filas de entrenamiento; los fallos permanecen en el informe de rollouts. La calibracion de temperatura esta desactivada cuando hay menos de 100 filas de validacion o menos de 5 episodios, por lo que en este checkpoint la calibracion no esta activa. No se documenta uso de RLHF, DPO ni ninguna fase de optimizacion basada en resultado.

## Capacidades

- Clasificacion de estado estructurado a habilidad: selecciona una de ocho acciones a partir de 15 caracteristicas numericas del entorno y del inventario.
- Soporte de una secuencia concreta de habilidad: obtencion de pico de piedra (recoger troncos, fabricar tablones, palos, mesa, pico de madera, minar piedra, fabricar pico de piedra).
- Inferencia nativa en Node.js sobre CPU, sin necesidad de inferencia alojada.
- Aplicacion opcional de una mascara de factibilidad determinista que descarta habilidades no disponibles.
- Proporciona valores de confianza (softmax) junto a la accion elegida y sus probabilidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo solo cubre la transicion de habilidad individual dentro de la secuencia de pico de piedra.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en imitation learning: sirve como caso minimo y reproducible para estudiar el paso de demostraciones del profesor a una politica neuronal que decide sin respaldo del profesor, con codigo y pesos abiertos.
- Material docente sobre pipelines de aprendizaje por imitacion: permite ilustrar recoleccion de datos, splits por episodio, entrenamiento con entropia cruzada e inferencia embebida en un ejemplo de complejidad reducida.
- Baseline para agentes de Minecraft: sirve como punto de partida medible (9/9 exitos en arena controlada, tiempo medio de 22,69 s) con el que comparar tecnicas posteriores de RL o modelos mayores.
- Inferencia de bajisimo coste en produccion ligera: con una latencia de inferencia p50 de 0,0224 ms y p95 de 0,0364 ms en CPU nativa mediante Node.js, puede integrarse en servicios locales sin acelerador.
- Automatizacion de servidores de Minecraft de prueba: la politica puede pilotar un bot que ejecute la secuencia de pico de piedra en arenas controladas, util para pruebas internas de infraestructura.
- Generacion de conjuntos de datos y validacion de entornos: la herramienta de recoleccion del profesor y los informes de rollout permiten construir y verificar escenarios de evaluacion con inventarios variables.
- Estudio de calibracion en regimen de datos escasos: el checkpoint documenta explicitamente el desactivado de la calibracion de temperatura, lo que lo hace util para analizar el comportamiento de la confianza softmax con pocos datos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision de imitacion en validacion | 1.000 | 11 filas de validacion, 1 episodio; no constituye una estimacion independiente de calibracion |
| Exito en arena controlada (stone-pickaxe) | 9/9 | Arenas con semillas de disposicion distintas a las de recoleccion, en un mundo superflat compartido |
| Tiempo medio con penalizacion de fallo de 180 s | 22,69 s | Sobre las arenas controladas retenidas |
| Evaluacion de partida completa | no realizada | Victorias contra el dragon: cero |
| Latencia de inferencia nativa (CPU) | p50 0,0224 ms / p95 0,0364 ms | Node.js en la maquina de desarrollo; excluye recoleccion de observacion, navegacion y ticks de Minecraft |
| Latencia observacion + inferencia | p95 0,512 ms | Ultima ejecucion en vivo tras cachear bloques cercanos; excluye el escaneo inicial por episodio y la ejecucion de la habilidad |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; el modelo es un MLP de 19.592 parametros (repo de 0,0 GB) que se ejecuta en CPU.
- GPU recomendadas: ninguna para inferencia; para entrenamiento el autor uso una RTX 3090 en local.
- Cabe en GPU de consumo: si, y tambien en CPU; no hay requisito de acelerador.
- Opciones de despliegue: inferencia nativa en Node.js con policy.json; tambien exportacion sin pickle en safetensors y state_dict de PyTorch (cargar con torch.load(..., weights_only=True)). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: latencia de inferencia p50 0,0224 ms y p95 0,0364 ms (CPU, Node.js); observacion mas inferencia p95 0,512 ms tras cachear bloques. No se documenta throughput agregado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos con otros modelos de la misma categoria. La model card menciona que los datos no provienen de speedruns humanos, demostraciones de VPT ni salidas de Jev, pero no ofrece metricas de esos sistemas que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo no ha completado Minecraft y no es un modelo de speedrunning; las victorias contra el dragon son cero y la evaluacion de partida completa no se ha realizado.
- Los datos de entrenamiento son muy escasos (99 filas, 9 episodios) y los de validacion tambien (11 filas, 1 episodio); la precision de validacion de 1.000 no establece generalizacion en el mundo natural.
- La confianza softmax no garantiza correccion ni probabilidad de ganar la partida; la calibracion de temperatura esta desactivada en este checkpoint.
- Cobertura de acciones limitada a ocho habilidades; no incluye Nether, fortalezas, End, dragon, comida ni combate.
- Las observaciones se limitan a arenas de roble y piedra; las semillas de las arenas son semillas de disposicion dentro de un mundo superflat compartido, no semillas de generacion de mundo no vistas.
- Los resultados de arena no deben presentarse como una partida de supervivencia completa.
- Las metricas de latencia excluyen partes relevantes del bucle (recoleccion de observacion, navegacion, ticks, escaneo inicial de bloques y ejecucion de habilidad), por lo que no representan el rendimiento de extremo a extremo.
- Licencia MIT para el codigo y los pesos originales; el software de juego y las dependencias de terceros mantienen sus propios terminos. No se incluyen binarios de Minecraft, texturas, credenciales ni archivos de cuenta.
- Modelo experimental e independiente de TypeSafe/Jev y de Mojang/Microsoft.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teyler/MineChoice-stone-pickaxe-19k-experimental
- Ficheros de referencia citados en la model card (no enlazados explicitamente): SOURCE_README.md, training_report.json, latency.json, policy.json, model.pt, model.safetensors, config.json, src/policy.mjs
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
