# zwh20081/hoi4-jevai

## Resumen

JevAI hoi4-v1 (identificador `zwh20081/hoi4-jevai`) es un ajuste fino de DeBERTa-v3-large con una cabeza de puntuación de opciones (*option-scoring head*), desarrollado por el usuario zwh20081. El modelo no genera texto: recibe la descripción textual de un mes de un país de Hearts of Iron IV y devuelve una probabilidad para cada opción de una serie de preguntas cerradas. A partir de esas probabilidades, el mod JevAI decide la postura estratégica de los países controlados por la IA: acumulación defensiva, expansión industrial, ofensiva blindada, poder aéreo, poder naval o economía de guerra total.

El problema que resuelve es concreto: la IA original de Hearts of Iron IV elige su postura mediante heurísticas y scripts fijos. Este modelo sustituye esa decisión por una estimación aprendida del resultado a seis meses vista (tendencia de poder, pérdida de territorio y ganancia de territorio). Es relevante porque demuestra que una tarea de decisión dentro de un juego de estrategia complejo se puede resolver con un encoder de aproximadamente 300 millones de parámetros que se ejecuta en una NPU de consumo a 233 ms por secuencia, sin recurrir a un modelo generativo.

La arquitectura es DeBERTa-v3-large (transformer encoder) más una cabeza de puntuación, con una ventana fija de 512 tokens y entrenamiento exclusivamente en inglés. El repositorio ocupa 4,1 GB e incluye pesos en fp32 (PyTorch) y en FP16 (OpenVINO IR) para NPU y CPU de Intel.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large con cabeza de puntuación de opciones (*option-scoring head*) |
| Parametros totales | No confirmado en la model card; la arquitectura base DeBERTa-v3-large tiene ~304 millones de parámetros |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (forma fija 1 x 512 en OpenVINO; el texto de estado se trunca a 256 tokens) |
| Tipos de cuantizacion | fp32 (bundle PyTorch) y FP16 (OpenVINO IR); no se publican GGUF ni INT8/INT4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`head.safetensors`), bundle PyTorch fp32 y OpenVINO IR (`.xml`/`.bin`) |

## Arquitectura y entrenamiento

El modelo es un encoder DeBERTa-v3-large al que se añade una cabeza de puntuación de opciones. La entrada se empaqueta como un único texto con el formato `[CLS] [STATE] state [Q] question [OPT] option ... [SEP]`, con un máximo de 512 tokens, de los cuales el estado del país se trunca a 256. La cabeza devuelve una probabilidad por cada opción de cada pregunta. Para cada postura, el *runner* plantea tres preguntas sobre los seis meses siguientes (tendencia de poder, si no se pierde territorio y si se gana territorio) y elige la postura con mayor `P(no pérdida) + P(ganancia) + 0,5 * crecimiento esperado (0..1)`, manteniendo la postura en vigor salvo que otra la supere en 0,01.

Los datos proceden de 33 partidas de observador de HOI4 1.19 iniciadas el 1 de junio de 1936. En las partidas con el modelo en el bucle, un sorteo por país cedía el control al modelo o a la IA original, y entre el 30 % y el 50 % de las decisiones del modelo eran aleatorias, con las probabilidades registradas. Cada mes-país se etiqueta con lo ocurrido 3, 6 y 12 meses después, lo que da 446 000 estados y 2,4 millones de preguntas, divididas por partida completa (249 000 de entrenamiento, 114 000 de validación y 83 000 de prueba). El entrenamiento fue de una época con los estados de postura sobremuestreados por 3, 12 116 pasos, batch 16 x 2, tasa de aprendizaje 2e-5, autocast bf16 con pesos fp32 y pérdida de entropía cruzada más Brier, en una A100 de 40 GB durante 2,9 horas. Se conservó el paso 10 000, el de mejor Brier skill macro de validación (0,672).

## Capacidades

- Puntuación de opciones sobre conjuntos cerrados: asigna una probabilidad a cada opción de hasta tres preguntas por estado; no genera texto libre.
- Predicción de la tendencia de poder a 6 meses (se contrae, se estanca, crece despacio, crece rápido).
- Predicción de ausencia de pérdida de territorio.
- Predicción de ganancia de territorio.
- Predicción de nueva guerra y de capitulación; la pregunta de capitulación no se usa en el *runner* por fuga de información.
- Procesamiento de estado textual de país: fábricas, divisiones, mano de obra, estabilidad, apoyo bélico, ratios de fuerza, guerras, aliados, vecinos y postura en vigor.
- Despliegue en NPU Intel vía OpenVINO con una desviación máxima de 0,0025 respecto a PyTorch en las probabilidades.
- Soporte de *tool calling* / *function calling*: no disponible; el modelo no emite llamadas ni texto estructurado.
- Soporte de agentes y razonamiento multi-paso: no disponible; la lógica de decisión multi-paso reside en el *runner* externo, no en el modelo.
- Capacidades multilingües: no; la entrada está en inglés.
- Modo de razonamiento (*thinking*), visión o audio: no disponibles; es un clasificador de opciones.

## Casos de uso

- IA de países en mods de Hearts of Iron IV: el mod JevAI envía el estado mensual del país como texto y usa las probabilidades del modelo para fijar la postura estratégica, sustituyendo las heurísticas de la IA original por una estimación aprendida del resultado a 6 meses.
- Investigación en IA para juegos de estrategia: sirve como banco de pruebas reproducible para estudiar decisiones de alto nivel bajo incertidumbre, con un conjunto etiquetado de 446 000 estados y 2,4 millones de preguntas y una partición por partida completa.
- Pronóstico de resultados de partidas: las mismas cabezas de pregunta permiten estimar si un país perderá territorio, ganará territorio o entrará en guerra en los 6 meses siguientes, útil para herramientas de análisis o para métricas de IA en *streamings* y torneos.
- Anotación y generación de informes de partida (*after-action reports*): al puntuar cada mes-país, se pueden etiquetar automáticamente momentos de inflexión y comparar la trayectoria observada con la predicción.
- Aprendizaje por imitación sobre registros de partidas: la receta de conversión de estado de juego a texto y el esquema de etiquetado a 3, 6 y 12 meses se pueden reutilizar para entrenar modelos equivalentes en otros juegos de gran estrategia.
- Patrón de despliegue de decisiones en tiempo real de bajo coste: con 233 ms por secuencia y 6 secuencias por país y turno, el modelo ilustra cómo integrar un encoder en OpenVINO dentro de un bucle de simulación sin bloquear el *tick* del juego.
- Inferencia local en NPU o CPU sin GPU: el grafo OpenVINO (1,5 GB para NPU y 0,9 GB para CPU) permite ejecutar el modelo en un Intel Core Ultra, útil para mods distribuidos a jugadores sin hardware dedicado.
- Extracción de características para *decision support*: tras un reajuste fino con otro formato de estado y otro conjunto de preguntas, la misma arquitectura de encoder más cabeza de puntuación sirve para tareas de elección entre alternativas sobre estado tabular textualizado.

## Benchmarks y rendimiento

Resultados publicados por el autor. La métrica es Brier skill sobre las partidas de prueba, comparada con predecir las frecuencias de las etiquetas (0: no mejor que eso; 1: perfecto).

| Preguntas | hoi4-v1 | Modelo de referencia (*stock model*) |
|---|---|---|
| Los diez tipos de pregunta, macro | 0,625 | -0,067 |
| Las tres preguntas de postura, todos los estados de prueba | 0,485 | -0,124 |
| Las tres preguntas de postura, los 5 460 estados con decisión | 0,302 | -0,271 |
| Tendencia de poder | 0,452 | -0,234 |
| Territorio ganado | 0,603 | 0,027 |
| Territorio perdido | 0,446 | -0,029 |
| Nueva guerra | 0,688 | 0,154 |

Latencia medida: 233 ms por secuencia en una NPU Intel Core Ultra, con diferencias de probabilidad inferiores a 0,0025 respecto a PyTorch. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Bundle PyTorch fp32: 1,7 GB en disco, lo que permite inferencia en cualquier GPU con 4 GB de VRAM o más; también se puede ejecutar en CPU.
- OpenVINO IR FP16: 1,5 GB para el grafo de NPU y 0,9 GB para el grafo de CPU.
- GPU recomendadas: no se especifican; el tamaño del modelo no requiere A100, H100 ni RTX 4090. Cabe en GPU de consumo y en iGPU.
- Cabe en GPU de consumo: sí, con 4 GB o más de VRAM para el bundle fp32, y sin GPU si se usa el grafo de CPU.
- NPU de consumo: soportada la Intel Core Ultra; el grafo `jev_npu.xml` está pensado para ella. También hay versión para CPU (`jev_cpu.xml`).
- Opciones de despliegue: OpenVINO Runtime (`jevai.exe`, el *runner* del mod), PyTorch para evaluación (`python -m trainer.evaluate ... --model models/hoi4-jevai/torch --bf16`) y `mods.collector.jevd` con `--model`. vLLM, TGI y llama.cpp no aplican porque el modelo no es generativo y usa una cabeza de puntuación propia.
- Latencia y throughput: 233 ms por secuencia en NPU Intel Core Ultra; como cada país necesita 6 secuencias (una por postura), el coste aproximado es de 1,4 s por país y decisión. No se publica throughput en lote ni latencia en CPU o GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Brier skill (3 preguntas de postura, 5 460 estados con decisión) | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| zwh20081/hoi4-jevai | ~304 M (arquitectura DeBERTa-v3-large) | 512 tokens | 0,302 | Apache-2.0 | safetensors, PyTorch fp32 y OpenVINO IR en HuggingFace |
| com-kotobalabs/open-jev-deberta-v3-large (base) | misma arquitectura que el anterior | 512 tokens | No disponible | Apache-2.0 | HuggingFace |
| microsoft/deberta-v3-large | 304 M | 512 tokens | No disponible | MIT | HuggingFace |
| Modelo de referencia (*stock model*) del autor | No disponible | No disponible | -0,271 | No disponible | No disponible |

Comparables directos fuera de este proyecto: no disponible. No se conocen en la información proporcionada otros modelos entrenados para decisiones de IA en Hearts of Iron IV.

## Limitaciones y advertencias

- Fuga de información en la pregunta de capitulación: obtiene un Brier skill perfecto de 1,000 porque los estados capitulados arrastran menos preguntas, lo que delata la respuesta. El *runner* no utiliza esa pregunta.
- Entrenado solo con partidas vainilla iniciadas en 1936; los mods *overhaul* y las fechas de inicio posteriores quedan fuera de la distribución vista.
- En partidas de jugadores, el estado procede del registro del juego, que no incluye unidades en el frente, flotas ni escasez de equipo; el texto muestra 0 u omite esos campos, a diferencia del texto usado en entrenamiento, lo que degrada la entrada.
- No está establecido que sus decisiones hagan a los países de la IA más fuertes que la IA original; solo se ha medido que las posturas desplazan la producción según lo previsto.
- Solo admite inglés.
- Ventana fija de 512 tokens y estado truncado a 256, lo que limita la cantidad de información por consulta.
- No es un modelo generativo: no produce texto, código, razonamiento en lenguaje natural ni llamadas a herramientas.
- Especializado en un juego concreto (Hearts of Iron IV): fuera de ese dominio no tiene utilidad directa sin reajuste fino.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí hay riesgo de calibración incorrecta de probabilidades fuera de la distribución de entrenamiento.
- Sesgos conocidos: no se documentan sesgos demográficos o sociales; los sesgos posibles son los derivados de las estrategias presentes en las 33 partidas observadas y del meta del parche 1.19.
- Licencia Apache-2.0, igual que el modelo base `open-jev-deberta-v3-large`, que a su vez deriva de `microsoft/deberta-v3-large` (MIT). Conviene revisar las condiciones de redistribución del modelo base antes de un uso comercial.
- Estado de adopción: 0 descargas y 0 *me gusta* en el momento de la consulta, sin validación externa independiente.
- Fechas del repositorio: creado y actualizado el 25 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zwh20081/hoi4-jevai
- Repositorio de código (GitHub): https://github.com/zwh20081/hoi4-jevai
- Mod en Steam Workshop: https://steamcommunity.com/sharedfiles/filedetails/?id=3808093078
- Modelo base: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- Modelo original de la arquitectura: https://huggingface.co/microsoft/deberta-v3-large
