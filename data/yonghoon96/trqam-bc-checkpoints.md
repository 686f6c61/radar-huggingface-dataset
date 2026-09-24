# yonghoon96/trqam-bc-checkpoints

## Resumen

`trqam-bc-checkpoints` es un conjunto de diez checkpoints de políticas de imitación (behavior cloning, BC) basadas en flow matching, publicados por el usuario de HuggingFace `yonghoon96`, que corresponde al primer autor de la cita del trabajo (Yonghoon Dong). No es un modelo de lenguaje: son actores de aprendizaje por refuerzo offline entrenados en diez dominios del benchmark OGBench, con pesos en arrays NumPy y librería declarada `jax`. El repositorio ocupa 0,1 GB y se distribuye bajo licencia MIT.

El propósito de estos pesos es servir de inicialización: según la model card, cada checkpoint es el flujo preentrenado desde el que arrancan tanto TRQAM (Trust Region Q Adjoint Matching) como los baselines basados en flow. Por tanto, su utilidad no es la inferencia directa en producción, sino la reproducción de resultados y el punto de partida de un pipeline de RL offline que después añade críticos y redes objetivo, ausentes en estos ficheros.

Su relevancia es reciente y acotada al ámbito de investigación: acompañan al artículo `Trust Region Q Adjoint Matching` (NeurIPS 2026, arXiv 2605.27079), cubren dominios de navegación (antmaze, humanoidmaze) y de manipulación tipo puzzle y cube, y permiten comparar algoritmos sobre exactamente los mismos flujos BC. El repositorio no registra descargas ni «likes» en la información disponible, y la model card no incluye métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de behavior cloning basada en flow matching; actor MLP con dimensiones 512 x 4 o 1024 x 4 (con layer norm en la variante 1024) según dominio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la política consume observaciones del entorno) |
| Tipos de cuantizacion | no disponible (los pesos se publican como arrays NumPy sin variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pkl` con arrays NumPy (`params_300000.pkl`) y un `config.json` por carpeta de dominio |
| Libreria | JAX |
| Tamano del repositorio | 0,1 GB (diez checkpoints, aproximadamente 10 MB por checkpoint) |
| Pasos de flow | 10 |
| Pasos de entrenamiento | 300.000 |
| Semilla | 10001 |
| Tamano de batch | 256 |
| Action chunk | 1 en dominios de navegación; 5 en dominios de tipo play |

Tabla de checkpoints incluidos, según la model card:

| Carpeta | Dataset | Actor | Action chunk |
|---|---|---|---|
| `antmaze-large-navigate` | `antmaze-large-navigate-v0` (1M) | 512 x 4 | 1 |
| `antmaze-giant-navigate` | `antmaze-giant-navigate-10m-v0` (10M) | 1024 x 4, layer norm | 1 |
| `humanoidmaze-medium-navigate` | `humanoidmaze-medium-navigate-v0` (1M) | 512 x 4 | 1 |
| `humanoidmaze-large-navigate` | `humanoidmaze-large-navigate-v0` (1M) | 512 x 4 | 1 |
| `scene-play` | `scene-play-v0` (1M) | 512 x 4 | 5 |
| `puzzle-3x3-play` | `puzzle-3x3-play-v0` (1M) | 512 x 4 | 5 |
| `puzzle-4x4-play` | `puzzle-4x4-play-100m-v0`, shards 000-009 (10M) | 1024 x 4, layer norm | 5 |
| `cube-double-play` | `cube-double-play-v0` (1M) | 512 x 4 | 5 |
| `cube-triple-play` | `cube-triple-play-100m-v0`, shards 000-009 (10M) | 1024 x 4, layer norm | 5 |
| `cube-quadruple-play` | `cube-quadruple-play-100m-v0` (100M) | 1024 x 4, layer norm | 5 |

## Arquitectura y entrenamiento

Cada checkpoint es un actor que modela la distribución de acciones mediante flow matching: se aprende un campo vectorial que transporta ruido hacia acciones válidas y se integra en un número fijo de pasos (10, según la configuración declarada). El actor es un MLP de dimensiones 512 x 4 o 1024 x 4, con layer norm en los cuatro dominios entrenados sobre datasets ampliados. El horizonte de predicción varía: los dominios de navegación devuelven un chunk de 1 acción, mientras que los dominios de tipo play devuelven chunks de 5.

El entrenamiento es puramente de imitación: 300.000 pasos, semilla 10001, batch de 256 y sin señal de recompensa, de modo que un único checkpoint sirve para todas las tareas de su dominio. Cuatro dominios usan datasets mayores que el valor por defecto de OGBench: `antmaze-giant-navigate` (10M), `puzzle-4x4-play` (10M, primeros diez shards de 1M del dataset de 100M), `cube-triple-play` (10M, mismos shards) y `cube-quadruple-play` (100M). TRQAM se apoya sobre estos flujos mediante adjoint matching con región de confianza, pero los críticos, las redes objetivo y el estado del optimizador no se incluyen en la publicación: solo el flujo BC en la clave `{"agent": {"network": {"params": {"modules_actor_slow": ...}}}}`.

## Capacidades

- Generación de acciones motoras continuas condicionadas por observaciones del entorno, en los diez dominios cubiertos (navegación y manipulación).
- Política multi-tarea dentro de un mismo dominio: al no usar recompensa, un checkpoint es válido para cualquier tarea de su dominio.
- Predicción en formato de action chunk: 1 acción por inferencia en navegación y 5 en los dominios play.
- Integración como inicialización de un agente de RL offline más completo (TRQAM y baselines de flow), copiando el flujo en cada slot de actor del agente.
- Carga de pesos independiente de la versión: los datos son arrays NumPy simples, legibles con NumPy 1.x y 2.x y con cualquier versión de JAX.
- No soporta: generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, function calling, agentes conversacionales ni capacidades multilingües. Ninguna de estas funciones aplica a este artefacto.

## Casos de uso

- Reproducción de baselines de RL offline: cargar `params_300000.pkl` como `--pretrained_actor_path` en `main.py` de TRQAM y replicar la línea base de BC con flow sobre los diez dominios, con las mismas semilla y pasos de entrenamiento.
- Inicialización de TRQAM: arrancar el entrenamiento de adjoint matching con región de confianza desde un flujo preentrenado en lugar de desde cero, que es exactamente el uso previsto en la model card.
- Comparación controlada de algoritmos en OGBench: al ser un punto de partida compartido por el método propuesto y los baselines, permite atribuir diferencias de rendimiento al algoritmo y no a la inicialización.
- Investigación en navegación a larga distancia: `antmaze-large-navigate`, `antmaze-giant-navigate`, `humanoidmaze-medium-navigate` y `humanoidmaze-large-navigate` con `--horizon_length=1`, útiles para estudiar planificación en laberintos con observaciones de alta dimensionalidad.
- Investigación en manipulación con action chunking: los dominios `scene-play`, `puzzle-3x3-play`, `puzzle-4x4-play`, `cube-double-play`, `cube-triple-play` y `cube-quadruple-play` generan chunks de cinco acciones, lo que permite medir el efecto del chunking sobre la estabilidad del control.
- Estudio del efecto del tamaño de dataset: los checkpoints entrenados con 1M, 10M y 100M de transiciones sobre dominios relacionados (`puzzle-4x4`, `cube-triple`, `cube-quadruple`) permiten analizar la curva de escalado de datos en BC.
- Docencia y prototipado sin GPU: al tratarse de MLP pequeños (repo completo de 0,1 GB) y pesos NumPy, se pueden inspeccionar y ejecutar en entornos de CPU junto al simulador de OGBench.
- Auditoría de configuración: los `config.json` por carpeta registran la configuración completa del agente y el entorno con el que se lanzó cada ejecución, lo que sirve para reconstruir experimentos y verificar hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de éxito, retornos ni comparaciones numéricas con otros métodos; únicamente describe la configuración de entrenamiento y el uso previsto de los checkpoints. El artículo asociado (NeurIPS 2026, arXiv 2605.27079) es la referencia donde podrían aparecer dichas métricas, pero sus cifras no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia derivada del tamaño del repositorio (0,1 GB para diez checkpoints, unos 10 MB por fichero), los pesos de un dominio caben en memoria de CPU y en cualquier GPU con unos pocos cientos de MB libres.
- GPU recomendadas: no disponible. No se documenta ningún requisito de GPU en la model card y el entrenamiento reportado no incluye detalles de hardware.
- Compatibilidad con GPU de consumo: por tamaño de pesos, el artefacto es apto para ejecutarse en CPU y en GPU de consumo, aunque esto es una inferencia a partir del tamaño del repositorio y no un dato publicado.
- Opciones de despliegue: carga directa de los `.pkl` con NumPy y uso dentro de `main.py` de TRQAM; el resto del stack es JAX y el simulador de OGBench. No aplican vLLM, Ollama, llama.cpp ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles como medidas publicadas. Según la configuración declarada, cada chunk de acciones requiere integrar el flujo en 10 pasos, es decir, 10 evaluaciones del actor por cada 1 acción en los dominios de navegación y por cada 5 acciones en los dominios play.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye métricas, identificadores ni enlaces a otros checkpoints de BC con flow matching, ni a baselines de RL offline sobre OGBench con los que comparar parámetros, contexto o rendimiento. La model card solo indica que estos flujos son el punto de partida compartido por TRQAM y los baselines de flow, sin nombrarlos ni cuantificarlos.

## Limitaciones y advertencias

- Los pesos son únicamente el actor BC: no incluyen críticos, redes objetivo ni estado del optimizador, por lo que no sirven por sí solos como agente completo de RL.
- No usan recompensa, así que no hay condicionamiento por objetivo ni por retorno; el comportamiento queda fijado por la distribución del dataset de imitación.
- Entrenamiento con una sola semilla (10001): no hay información sobre varianza entre semillas ni intervalos de confianza.
- Dependencia del entorno: el uso correcto exige replicar la configuración del dominio (`--agent.actor_hidden_dims`, `--agent.actor_layer_norm`, `--horizon_length`, con valor 1 para los dominios de navegación porque por defecto es 5). Cambios en la versión de OGBench o en las dimensiones de observación y acción pueden invalidar los pesos.
- Los ficheros se distribuyen en formato pickle (`.pkl`), lo que implica el riesgo habitual de deserialización de código arbitrario si la fuente no es de confianza.
- Las fechas del repositorio y del artículo publicadas en la información recibida (2026) son postersiores a la fecha habitual de consulta, lo que conviene verificar antes de citar el trabajo.
- Ausencia de validación externa: cero descargas y cero «likes» en el momento de la consulta.
- Sesgos: no disponibles. La model card no analiza sesgos de comportamiento en los dominios cubiertos, y los entornos son simulados, sin evidencia de transferencia a robots reales.
- Licencia MIT: permite uso comercial y modificación con atribución, pero al no haber métricas ni garantías declaradas, la idoneidad para producción no está respaldada por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yonghoon96/trqam-bc-checkpoints
- Artículo (Trust Region Q Adjoint Matching, NeurIPS 2026): https://huggingface.co/papers/2605.27079
- Identificador arXiv indicado en las etiquetas: arXiv:2605.27079
- Código de TRQAM: https://github.com/yonghdong/trqam
- Cita declarada: Dong, Yonghoon; Lee, Kyungmin; Kim, Changyeon; Kim, Jaehyuk; Shin, Jinwoo. «Trust Region Q Adjoint Matching». Advances in Neural Information Processing Systems, 2026.
