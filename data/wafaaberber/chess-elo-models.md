# wafaaberber/chess-elo-models

## Resumen

Chess Elo estimator es un conjunto de modelos de regresión tabular publicados en HuggingFace por wafaaberber (wafaaBerrais) que estiman el rating de un jugador de Lichess a partir de 10 de sus partidas ya analizadas por el servidor de Lichess. No es un modelo de lenguaje: se trata de un pipeline de scikit-learn compuesto por imputación por mediana y un regresor LightGBM, con un modelo independiente por cada control de tiempo (bullet, blitz y rapid). La entrada es un vector fijo de 213 características numéricas calculadas por el código del repositorio asociado, y la salida es una estimación de Elo acompañada de un intervalo de incertidumbre al 80% y un perfil de estilo de juego.

El problema que resuelve es el de la estimación de rating en pocas partidas (few-shot): en lugar de esperar a que un sistema de rating converja tras decenas o cientos de partidas, el modelo aproxima el nivel del jugador con solo 10 partidas. Sobre jugadores no vistos durante el entrenamiento, el modelo alcanza un MAE de 177,3 puntos de Elo en bullet, 155,6 en blitz y 158,4 en rapid, con un R² de 0,50, 0,57 y 0,50 respectivamente.

Su relevancia es doble: por un lado, demuestra un caso de uso de boosting de gradientes sobre características derivadas de ajedrez con cuantificación explícita de la incertidumbre; por otro, muestra un flujo de publicación reproducible en formato skops, con versiones de modelo identificadas por SHA-256 y un manifiesto con el commit de Git de origen. El repositorio declarado ocupa 0,0 GB en HuggingFace y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: imputacion por mediana + regresor LightGBM (gradient boosting sobre arboles de decision); un modelo por control de tiempo |
| Parametros totales | no disponible (no se publica el numero de arboles, hojas ni profundidad de cada Booster) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable: consume un vector fijo de 213 caracteristicas derivadas de 10 partidas; no procesa secuencias de texto |
| Tipos de cuantizacion | no aplicable (no hay cuantizacion de pesos tipo LLM; el pipeline se serializa en formato skops) |
| Idiomas soportados | no aplicable: el modelo no procesa lenguaje natural, solo caracteristicas numericas; la model card y el codigo estan en ingles |
| Licencia | no disponible (la model card y los metadatos de HuggingFace no especifican licencia) |
| Formato de pesos | skops (`.skops`), pipeline de scikit-learn; ficheros auxiliares `uncertainty.json`, `style_reference.json` y `manifest.json` |

## Arquitectura y entrenamiento

La solucion es un conjunto de tres pipelines de regresion tabular, uno por control de tiempo. Cada pipeline aplica imputacion por mediana y despues un `LGBMRegressor`. La entrada son 213 caracteristicas calculadas por el modulo `chess_elo.features` del repositorio de GitHub del proyecto; el modelo no es utilizable sin ese codigo, ya que las caracteristicas no vienen incluidas en el repositorio de HuggingFace. La serializacion se hace con skops, que solo permite reconstruir las clases declaradas como de confianza (`collections.OrderedDict`, `numpy.dtype`, `lightgbm.basic.Booster`, `lightgbm.sklearn.LGBMRegressor`) y no ejecuta codigo arbitrario al cargar. Los nombres de las 213 caracteristicas y su orden estan accesibles via `model.feature_names_in_`.

Los datos de entrenamiento proceden de aproximadamente 1.900 jugadores de Lichess muestreados por tramos de Elo entre 1000 y 2200, con 30 partidas valoradas por jugador, todas analizadas por el Stockfish del servidor de Lichess; se usan 10 partidas por jugador. La variable objetivo es la media del rating del jugador en esas partidas. El 20% de los jugadores de cada control de tiempo se reservo antes del entrenamiento y del ajuste de hiperparametros. La incertidumbre no proviene de un metodo bayesiano, sino de una calibracion a posteriori almacenada en `uncertainty.json` en funcion del numero de partidas, y los perfiles de estilo se calculan contra una poblacion de referencia guardada en `style_reference.json`. Los rasgos de estilo que se muestran son solo aquellos estables con 10 partidas: en bullet, tempo, error_risk y time_pressure; en blitz y rapid, tempo y time_pressure. No se documenta uso de RLHF ni de DPO, algo esperable en un modelo tabular de este tipo.

## Capacidades

- Regresion tabular: estima el Elo de un jugador de Lichess a partir de 10 partidas analizadas.
- Cuantificacion de la incertidumbre: devuelve un intervalo al 80%, calibrado segun el numero de partidas (3, 5 o 10).
- Perfil de estilo: describe al jugador en dimensiones como tempo, error_risk y time_pressure, comparandolo con una poblacion de referencia.
- Especializacion por control de tiempo: modelos separados para bullet, blitz y rapid, cada uno con sus propias metricas y calibracion.
- Carga segura del modelo: el formato skops restringe las clases reconstruibles y evita la ejecucion de codigo arbitrario al deserializar.
- Trazabilidad: `manifest.json` registra el commit de Git y los primeros caracteres del SHA-256 de cada fichero de modelo.
- No soporta: generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni capacidades multilingues. No es un modelo de lenguaje ni un motor de ajedrez; no juega partidas ni evalua posiciones.

## Casos de uso

- Estimacion rapida de nivel en plataformas de ajedrez: dado un jugador nuevo o sin historial suficiente, la plataforma puede ofrecer una horquilla de Elo orientativa a partir de 10 partidas ya analizadas por Lichess, con un intervalo al 80% en lugar de un numero unico.
- Emparejamiento en torneos y ligas internas: usar la estimacion y su intervalo para asignar categorias o grupos de forma provisional antes de que el rating oficial converja, evitando desequilibrios en las primeras rondas.
- Analisis de estilo para entrenadores: el perfil de estilo (tempo, time_pressure, error_risk en bullet) permite detectar patrones como juego lento bajo presion de reloj y orientar el trabajo tecnico con datos comparados contra la poblacion de referencia.
- Deteccion de cuentas y verificacion de identidad: comparar el Elo estimado con el declarado puede senalar discrepancias relevantes, por ejemplo cuentas que dicen ser de un nivel muy superior o inferior al que muestran sus partidas.
- Investigacion sobre prediccion de rendimiento con pocos datos: sirve como referencia reproducible de un experimento few-shot con metricas publicadas (MAE, R², cobertura del intervalo) para comparar contra otros enfoques de regresion tabular.
- Segmentacion de contenido y recomendacion: agrupar a los usuarios por nivel y estilo estimados para recomendar cursos, ejercicios o rivales de practica ajustados a su perfil de tiempo y gestion del reloj.
- Monitorizacion de progreso: recalcular la estimacion de forma periodica sobre las ultimas 10 partidas para observar la evolucion del nivel sin depender de que el rating de la plataforma se estabilice.

## Benchmarks y rendimiento

Resultados sobre jugadores reservados (20% de cada control de tiempo, excluidos del entrenamiento y del ajuste de hiperparametros):

| Control de tiempo | MAE de test (Elo) | R² de test | Jugadores de test | Elo real dentro del intervalo del 80% (3 / 5 / 10 partidas) | η² estilo → Elo | Rasgos de estilo usados |
|---|---:|---:|---:|---:|---:|---|
| Bullet | 177,3 | 0,50 | 140 | 78% / 79% / 82% | 0,023 | tempo, error_risk, time_pressure |
| Blitz | 155,6 | 0,57 | 140 | 80% / 80% / 81% | 0,006 | tempo, time_pressure |
| Rapid | 158,4 | 0,50 | 98 | 78% / 78% / 71% | 0,005 | tempo, time_pressure |

No se han publicado en la informacion disponible resultados de benchmarks de terceros (MMLU, HumanEval, GSM8K u otros) ni comparaciones directas con otros modelos; no aplican a este tipo de modelo.

## Requisitos de hardware

- GPU: no necesaria. LightGBM ejecuta la inferencia sobre CPU y el modelo es un pipeline tabular de baja dimensionalidad (213 caracteristicas de entrada).
- VRAM estimada: no aplicable; 0 GB de VRAM dedicada.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente para la inferencia.
- Memoria del repositorio: el tamano declarado del repositorio en HuggingFace es de 0,0 GB, lo que indica que los ficheros de modelo y los informes son muy pequenos; no se publica el desglose por fichero.
- Uso en GPU de consumo: no procede; no se requiere una RTX 4090, A100 ni H100 para este modelo.
- Opciones de despliegue: carga mediante `skops.io.load` en Python con scikit-learn y LightGBM instalados; integrable en un servicio web, en un job por lotes o dentro de un contenedor. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Dependencia critica de entorno: la inferencia exige calcular antes las 213 caracteristicas con el codigo `chess_elo.features` del repositorio de GitHub, y las partidas deben haber sido analizadas previamente por Lichess. El coste computacional real del sistema esta en ese paso de analisis, no en el modelo.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de estimacion de Elo publicados en HuggingFace con los que comparar parametros, contexto, licencia y disponibilidad; esos campos figuran como no disponibles. La unica comparacion posible con los datos aportados es entre las tres variantes del propio repositorio:

| Variante | MAE de test (Elo) | R² de test | Cobertura del intervalo del 80% con 10 partidas | Rasgos de estilo estables | Licencia |
|---|---:|---:|---:|---|---|
| Bullet | 177,3 | 0,50 | 82% | tempo, error_risk, time_pressure | no disponible |
| Blitz | 155,6 | 0,57 | 81% | tempo, time_pressure | no disponible |
| Rapid | 158,4 | 0,50 | 71% | tempo, time_pressure | no disponible |
| Sistemas de rating clasicos (Elo, Glicko-2) | no disponible | no disponible | no aplicable (no generan intervalos calibrados de este tipo) | no aplicable | no aplicable |
| Otros modelos tabulares de estimacion de Elo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La propia model card lo define como una demostracion de estimacion few-shot y de descripcion de estilo, no como un rating oficial; no debe presentarse como una valoracion equivalente a la de Lichess.
- Solo se pueden usar partidas ya analizadas por Lichess; sin ese preprocesado el modelo no recibe la entrada que espera.
- Las estimaciones se contraen hacia la zona media de la escala: el intervalo del 80% contiene el Elo real con menos frecuencia en jugadores por debajo de 1400 o por encima de 2000 que en la franja intermedia.
- En bullet, las estimaciones calculadas a partir de un fichero PGN son menos precisas porque los relojes aparecen redondeados al segundo.
- La cobertura del intervalo en rapid con 10 partidas es del 71%, por debajo del 80% nominal, y con 3 y 5 partidas se queda en el 78%.
- El efecto del estilo sobre el Elo es bajo segun los propios datos (η² de 0,023 en bullet, 0,006 en blitz y 0,005 en rapid), por lo que los perfiles de estilo deben leerse como descriptivos y no como factores predictivos fuertes.
- El modelo depende por completo del codigo externo `chess_elo.features`: sin el, las 213 caracteristicas no pueden reproducirse ni en el orden ni con la definicion correctos.
- El conjunto de datos no esta publicado y la model card no indica sesgos medidos ni analisis de equidad; el muestreo se hizo por tramos de Elo entre 1000 y 2200, lo que deja fuera a jugadores fuera de ese rango.
- La licencia no esta declarada en los metadatos ni en la model card: no hay autorizacion explicita para uso comercial, por lo que conviene aclararlo con el autor antes de integrarlo en un producto.
- El modelo no contiene nombres de usuario ni identificadores de partida, pero tampoco ofrece garantias documentadas sobre posibles sesgos derivados de la muestra de jugadores.
- Riesgo de alucinacion: no aplicable en el sentido habitual, ya que no genera texto; el riesgo equivalente es un error de estimacion grande (MAE de 155 a 177 puntos de Elo) presentado como una cifra aparentemente precisa.
- Ausencia de senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada, lo que limita su uso en produccion sin una evaluacion previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wafaaberber/chess-elo-models
- Repositorio de codigo, metodo y documentacion: https://github.com/wafaaBerrais/chess-elo-prediction-player-profiling
- Commit de publicacion indicado en la model card: `8ec2ea9` (2026-10-14T16:19:43+00:00)
- Versiones de modelo (primeros caracteres del SHA-256): bullet `8f9382d76ebd`, blitz `66efe74e66df`, rapid `dfde063955e0`
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
