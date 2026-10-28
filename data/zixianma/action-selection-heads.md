# zixianma/action-selection-heads

## Resumen

`zixianma/action-selection-heads` no es un modelo generativo autonomo, sino un repositorio con dos cabezas de seleccion de acciones (*selection heads*) de 22,6 millones de parametros cada una, disenadas para el agente web `OpenWebRL/OpenWebRL-4B-SFT`. En cada paso de navegacion, el actor de 4B muestrea cinco respuestas candidatas y la cabeza lee sus estados ocultos congelados (capas 18, 27 y 36) para elegir cual ejecutar. Los pesos del actor no se modifican.

El problema que resuelve es la varianza en la seleccion de acciones de un agente web: en lugar de ejecutar la primera respuesta muestreada, se puntuan cinco alternativas de forma conjunta y se ejecuta el *argmax*. Las dos cabezas incluidas, `piotr-data` y `lookahead-k3-1380`, se entrenaron con objetivos distintos (la eleccion de GPT-5.5 antes de ejecutar y una votacion *lookahead* de Luna a tres pasos, respectivamente) y alcanzan un exito medio en vivo del 44,3 % / 46,3 % y 42,3 % / 44,0 % con los jueces terra y o4-mini.

Su relevancia es acotada pero tecnica: es un componente reutilizable para evaluar y mejorar pipelines *best-of-N* en agentes web, con la restriccion explicita de que solo es valido para el checkpoint SFT exacto del actor y paneles de cinco candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pequeno sobre los estados ocultos congelados del actor en las capas 18, 27 y 36; comparacion conjunta de los cinco candidatos con equivarianza a permutaciones |
| Parametros totales | 22,6 M por cabeza; el repositorio contiene dos cabezas (`piotr-data` y `lookahead-k3-1380`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el actor muestrea candidatos con un maximo de 1.024 tokens nuevos por respuesta |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, con script de inferencia en PyTorch (`openwebrl_selection_head.py`) |
| Modelo base | `OpenWebRL/OpenWebRL-4B-SFT`, revision `15e777db2ddba2e0e82080ebccd3ad8d215b7f0a` |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Cada cabeza es un transformer pequeno que recibe representaciones internas del actor de 4B, no texto bruto. El *scorer* ejecuta una pasada del actor sobre el *prompt* y la captura de pantalla, y despues lee el texto de cada candidato a traves del mismo modelo sin generar texto nuevo. De las activaciones de las capas 18, 27 y 36 extrae un resumen de la pagina (al final del *prompt*) y, por candidato, resumenes de su razonamiento, de su accion y de su token final. Una comparacion conjunta de los cinco candidatos produce una puntuacion por candidato; se ejecuta la de mayor valor y los empates se resuelven por el indice mas bajo. El orden de los candidatos no afecta al resultado y los duplicados se conservan.

Los datos de entrenamiento difieren entre las dos cabezas. `piotr-data` usa 2.692 estados y 35.916 paneles de cinco candidatos procedentes de la release SelectionARM de Piotr, con el objetivo de imitar la eleccion de GPT-5.5 realizada antes de la ejecucion a partir de la captura y los candidatos. `lookahead-k3-1380` usa 1.380 estados de ramificacion de OpenWebRL-4B-SFT (347 tareas), con un panel por estado formado por las 2 a 5 acciones distintas propuestas, y aprende la cuota de voto de una evaluacion *lookahead* de Luna que juzga cada accion tras ejecutarla y seguir tres pasos mas, con dos llamadas por estado y dos ordenes. No se documenta el numero total de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO para las cabezas.

## Capacidades

- Seleccion *best-of-5* de acciones para `OpenWebRL-4B-SFT`: puntua cinco candidatos y devuelve el indice a ejecutar.
- Puntuacion individual de candidatos mediante `scorer.score(...)`, que devuelve los cinco logits del panel.
- Equivarianza a permutaciones: el orden de los candidatos no altera la seleccion y los duplicados no se eliminan.
- Reconstruccion exacta del *prompt* del actor con `build_prompt`, incluyendo el *system prompt* de evaluacion y el historial de acciones y respuestas del entorno.
- Procesamiento secuencial o por lotes (`batch_size=5`) de los candidatos, con puntuaciones equivalentes.
- Integracion en bucles de agente web con *tool calling*: el actor emite llamadas tipo `click` en JSON y la cabeza elige cual ejecutar.
- Ejecucion de la cabeza en CPU en torno a 1 ms, sin generar texto adicional.
- No dispone de capacidades generativas, de vision ni multilingues propias; hereda las del actor de 4B sobre el que opera.

## Casos de uso

- **Mejora de un agente web existente basado en OpenWebRL-4B-SFT**: sustituir la ejecucion directa de la primera respuesta muestreada por una seleccion *best-of-5* con la cabeza, manteniendo intactos los pesos del actor y anadiendo solo el coste de puntuar cinco candidatos.
- **Evaluacion reproducible de agentes web**: integrar la cabeza en un *harness* de evaluacion para reducir la varianza entre ejecuciones, con el mismo *prompt*, la misma captura y cinco muestras a temperatura 1,0 y top-p 0,9.
- **Investigacion sobre reranking de acciones**: comparar `piotr-data` y `lookahead-k3-1380` como dos objetivos de seleccion distintos sobre el mismo actor, usando los logits dentro de cada panel para analizar casos de desacuerdo.
- **Despliegue en hardware modesto**: ejecutar el bucle completo en una GPU de 18 GB procesando los candidatos uno a uno, o pasar a `batch_size=5` en una GPU grande para obtener las mismas puntuaciones con mayor rapidez.
- **Depuracion de trayectorias de navegacion**: reconstruir *prompts* guardados con `build_prompt` y verificar que coinciden byte a byte con los de la evaluacion (360 *prompts* y 4.644 pasos de historial en las tres benchmarks citadas) antes de reproducir una decision.
- **Prototipado de pipelines *best-of-N* en tareas de formularios y reservas**: usar el agente para rellenar campos y hacer clic en sitios como Google Flights, eligiendo entre cinco acciones propuestas la que la cabeza puntua mas alto, hasta un maximo de 30 pasos.
- **Analisis de sensibilidad al numero de candidatos**: replicar el unico caso documentado con N distinto de 5, la cabeza `piotr-data` con N = 3 en Online-Mind2Web, donde igualo el resultado de N = 5.

## Benchmarks y rendimiento

| Cabeza | Datos de entrenamiento | Objetivo | Exito medio (juez terra) | Exito medio (juez o4-mini) |
|---|---|---|---:|---:|
| `piotr-data` | 2.692 estados / 35.916 paneles de cinco candidatos | Eleccion de GPT-5.5 antes de ejecutar, a partir de captura y candidatos | 44,3 % | 46,3 % |
| `lookahead-k3-1380` | 1.380 estados de ramificacion / 347 tareas | Cuota de voto *lookahead* de Luna tras ejecutar y seguir 3 pasos | 42,3 % | 44,0 % |

La diferencia entre ambas cabezas es de +2,1 puntos porcentuales a favor de `piotr-data` en la media de tres benchmarks, con un intervalo de confianza de [−1,3; +5,4], por lo que la model card las considera equivalentes dentro del ruido. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de la linea base sin cabeza.

## Requisitos de hardware

- La cabeza en si es minima (22,6 M de parametros) y se ejecuta en CPU en torno a 1 ms, pero el *scorer* necesita cargar el actor de 4B para extraer los estados ocultos.
- La model card indica que el procesamiento secuencial de los cinco candidatos cabe en una GPU pequena de 18 GB; no se especifica la VRAM exacta del pipeline completo.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para el modo por lotes; una GPU de 18 GB es suficiente en modo secuencial segun el autor.
- Si el actor ya esta cargado para el muestreo, se puede pasar como `model=` y `processor=` para evitar una segunda copia en memoria.
- Despliegue mediante PyTorch, `transformers` y `safetensors` con el script `openwebrl_selection_head.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia documentada: aproximadamente 1 ms para la cabeza en CPU. No se proporcionan cifras de latencia ni de *throughput* del paso completo.
- El coste dominante es la pasada del actor de 4B sobre el *prompt*, la captura y los cinco candidatos, mas la generacion previa de esos cinco candidatos.

## Comparativa con modelos similares

| Componente | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `piotr-data` | 22,6 M + actor de 4B | No disponible | Seleccion *best-of-5* | No disponible | Hugging Face |
| `lookahead-k3-1380` | 22,6 M + actor de 4B | No disponible | Seleccion *best-of-5* | No disponible | Hugging Face |
| `OpenWebRL-4B-SFT` sin cabeza | 4B | No disponible | Generacion de acciones | No disponible | Hugging Face |
| Otros selectores o *reward models* para agentes web | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados en la informacion proporcionada para comparar estas cabezas con alternativas de la misma categoria, ni de la linea base del actor sin seleccion. La unica comparacion cuantitativa disponible es interna, entre las dos cabezas, con una diferencia de +2,1 pp dentro del intervalo de confianza.

## Limitaciones y advertencias

- Validas unicamente para `OpenWebRL-4B-SFT` en la revision `15e777db2ddba2e0e82080ebccd3ad8d215b7f0a`; no funcionan con otro actor ni con actores OpenWebRL entrenados con RL, salvo que sus candidatos se recodifiquen con este checkpoint SFT exacto.
- Los identificadores de tokens de los candidatos solo son transferibles si el tokenizer y la plantilla de chat son identicos.
- No son *reward models*: los logits solo son comparables dentro de un mismo panel, nunca entre estados distintos.
- No se entrenaron ni evaluaron con N distinto de 5 en inferencia, salvo `piotr-data` con N = 3 en Online-Mind2Web, donde igualo a N = 5.
- La licencia no esta disponible, por lo que el uso comercial no puede confirmarse.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion de la cabeza; el comportamiento depende del actor y de sus propias limitaciones.
- El *prompt* debe coincidir exactamente con aquel del que se muestreo al actor (incluido el sufijo `<|im_start|>assistant\n<think>\n` y un unico marcador de imagen); una discrepancia puede degradar la seleccion.
- La evaluacion se limita a la media de tres benchmarks con dos jueces y no se publican resultados por tarea ni de la linea base sin cabeza.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente de la comunidad.
- El bucle esta pensado para un maximo de 30 pasos; no se documenta el comportamiento en tareas de horizonte mas largo.

## Enlaces

- [Hugging Face: zixianma/action-selection-heads](https://huggingface.co/zixianma/action-selection-heads)
- [Modelo base: OpenWebRL/OpenWebRL-4B-SFT](https://huggingface.co/OpenWebRL/OpenWebRL-4B-SFT)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
