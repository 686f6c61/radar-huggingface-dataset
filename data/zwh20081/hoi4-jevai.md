# zwh20081/hoi4-jevai

## Resumen

JevAI hoi4-v1 es un modelo de clasificación y puntuación de opciones derivado de DeBERTa-v3-large, desarrollado por el usuario zwh20081 para el mod JevAI de Hearts of Iron IV. No es un modelo generativo: recibe la situación mensual de un país en el juego en formato texto (fábricas, divisiones, mano de obra, estabilidad, apoyo bélico, guerras, aliados y la postura vigente) y asigna una probabilidad a cada opción de hasta tres preguntas sobre los próximos seis meses. El runner del mod lo usa para elegir la postura estratégica de los países controlados por la IA: acumulación defensiva, expansión industrial, ofensiva blindada, poder aéreo, poder naval o economía de guerra total.

El modelo parte de `com-kotobalabs/open-jev-deberta-v3-large`, un DeBERTa-v3-large con una cabeza de puntuación de opciones, y se ha ajustado con datos de 33 partidas de observador de HOI4 1.19 iniciadas el 1936-06-01. El corpus resultante contiene 446.000 estados y 2,4 millones de preguntas, etiquetadas con lo que ocurrió 3, 6 y 12 meses después. El resultado es un modelo de 1,7 GB en fp32 (0,9 GB en OpenVINO FP16 para CPU y 1,5 GB para NPU Intel) con una ventana fija de 512 tokens.

Su relevancia es acotada pero concreta: demuestra un pipeline completo de IA para un juego de estrategia, desde la recolección de datos de partidas hasta el despliegue en NPU con OpenVINO y una latencia de 233 ms por secuencia. La licencia Apache-2.0 y la publicación de pesos en PyTorch y OpenVINO facilitan la reproducibilidad. Existe una versión experimental v2 con etiquetas corregidas y un horizonte de predicción de tres meses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3-large con cabeza de puntuación de opciones (option-scoring head) |
| Parametros totales | no disponible (el repo ocupa 8,3 GB; el bundle PyTorch fp32 pesa 1,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens fijos (el estado se trunca a 256 tokens) |
| Tipos de cuantizacion | fp32 (PyTorch), FP16 (OpenVINO IR) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (modelo base basado en microsoft/deberta-v3-large, MIT) |
| Formato de pesos | safetensors (bundle PyTorch), OpenVINO IR XML/BIN (CPU y NPU) |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v3-large con una cabeza que produce una probabilidad por cada opción de cada pregunta. La entrada se empaqueta como `[CLS] [STATE] state [Q] question [OPT] option ... [SEP]` con un máximo de 512 tokens, y admite hasta tres preguntas simultáneas. En producción, el runner formula tres preguntas por postura sobre los próximos seis meses: tendencia de poder (se reduce, estanca, crece despacio, crece rápido), si no se pierde territorio y si se gana territorio. La postura elegida es la de mayor `P(no pérdida) + P(ganancia) + 0,5 * crecimiento esperado (0..1)`, y se mantiene la postura actual salvo que otra supere su puntuación en 0,01.

El entrenamiento usó 33 partidas de observador de HOI4 1.19 desde 1936-06-01. En las partidas con el modelo en el bucle, un sorteo por país asignaba el control al modelo o a la IA vanilla, y entre el 30 % y el 50 % de las decisiones del modelo fueron aleatorias con las probabilidades registradas. Cada mes-país se etiqueta con lo ocurrido a 3, 6 y 12 meses, y cada decisión con su resultado: 446.000 estados y 2,4 millones de preguntas, divididos por partida completa (249.000 de entrenamiento, 114.000 de validación, 83.000 de test). Se realizaron 12.116 pasos (una época, con los estados de postura sobremuestreados 3x), batch 16 x 2, learning rate 2e-5, autocast bf16 con pesos fp32, pérdida de entropía cruzada más Brier, en una A100 de 40 GB durante 2,9 horas. Se conservó el paso 10.000, el de mejor Brier skill macro de validación (0,672).

## Capacidades

- Clasificación de opciones: asigna una probabilidad a cada opción de hasta tres preguntas cerradas sobre el estado de un país.
- Predicción a corto plazo: estima tendencia de poder, pérdida o ganancia de territorio y nuevas guerras en horizontes de 3, 6 y 12 meses.
- Selección de postura estratégica: elige entre seis posturas (defensiva, industrial, blindada, aérea, naval y economía de guerra total) mediante una función de puntuación compuesta.
- Procesamiento de estado estructurado como texto: fábricas, divisiones, mano de obra, estabilidad, apoyo bélico, ratios de fuerza, guerras, aliados y vecinos.
- Inferencia en CPU y NPU Intel mediante OpenVINO IR con forma fija 1 x 512.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (`en`).
- No dispone de visión, audio ni modo de pensamiento.

## Casos de uso

- Mod de IA para Hearts of Iron IV: es el uso principal y el único validado. El runner `jevai.exe` consulta el modelo seis veces por país (una por postura) y aplica la postura ganadora; encaja porque la latencia de 233 ms por secuencia en NPU es compatible con la cadencia mensual del juego.
- Investigación sobre IA de estrategia en tiempo real por turnos: el corpus de 446.000 estados y 2,4 millones de preguntas etiquetadas con resultados a 3, 6 y 12 meses sirve como banco de pruebas para modelos de decisión en entornos parcialmente observables.
- Evaluación de modelos de clasificación con etiquetas contrafactuales: el esquema de decisiones aleatorias registradas con sus probabilidades permite estudiar sesgos de política y estimar el efecto de acciones no tomadas.
- Despliegue en hardware de consumo con NPU: los grafos OpenVINO FP16 (1,5 GB para NPU, 0,9 GB para CPU) permiten ejecutar el modelo en un Intel Core Ultra sin GPU dedicada, útil como referencia de despliegue edge.
- Reentrenamiento sobre otros juegos de estrategia: la arquitectura de encoder más cabeza de opciones es reutilizable para cualquier dominio donde el estado se serialice como texto y las acciones sean un conjunto finito de opciones; requeriría un corpus nuevo etiquetado con resultados.
- Análisis de partidas y herramientas de telemetría: el colector `mods.collector.jevd` con `--model` puede puntuar estados históricos de una partida para estudiar qué decisiones habría tomado el modelo frente a las tomadas.

## Benchmarks y rendimiento

Brier skill sobre las partidas de test, frente a predecir las frecuencias de las etiquetas (0: sin mejora; 1: perfecto):

| Preguntas | hoi4-v1 | Modelo base sin ajustar |
|---|---|---|
| Los diez tipos de pregunta, macro | 0,625 | -0,067 |
| Las tres preguntas de postura, todos los estados de test | 0,485 | -0,124 |
| Las tres preguntas de postura, los 5.460 estados con decisión | 0,302 | -0,271 |
| Tendencia de poder | 0,452 | -0,234 |
| Territorio ganado | 0,603 | 0,027 |
| Territorio perdido | 0,446 | -0,029 |
| Nueva guerra | 0,688 | 0,154 |

En un Intel Core Ultra NPU, el grafo OpenVINO tarda 233 ms por secuencia (un país requiere 6, una por postura), con probabilidades dentro de 0,0025 de las de PyTorch. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el bundle PyTorch fp32 ocupa 1,7 GB, por lo que la inferencia en GPU requiere aproximadamente 2-3 GB de VRAM según el batch y el framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB con autocast bf16.
- Consumer GPU: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU sin GPU dedicada mediante el grafo OpenVINO de 0,9 GB.
- NPU: grafo específico para Intel NPU de 1,5 GB, validado en Intel Core Ultra.
- Opciones de despliegue: PyTorch con `trainer.evaluate` y `mods.collector.jevd --model`; OpenVINO Runtime para CPU y NPU; el runner `jevai.exe` del mod.
- Latencia y throughput: 233 ms por secuencia en NPU Intel Core Ultra; 6 secuencias por país y mes. No se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevAI hoi4-v1 | no disponible (DeBERTa-v3-large) | 512 tokens | Clasificación de opciones para HOI4 | Apache-2.0 | Hugging Face y GitHub |
| open-jev-deberta-v3-large | DeBERTa-v3-large | no disponible | Modelo base con cabeza de puntuación de opciones | Apache-2.0 | Hugging Face |
| microsoft/deberta-v3-large | DeBERTa-v3-large | 512 tokens | Encoder de propósito general (NLU) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos base en esta tarea específica, más allá de la columna "stock model" de la tabla de benchmarks.

## Limitaciones y advertencias

- La pregunta de capitulación obtiene un Brier skill de 1,000 porque los estados capitulados llevan menos preguntas, lo que revela la respuesta; el runner no usa esa pregunta.
- Entrenado solo con partidas vanilla de 1936; los mods de conversión total y las fechas de inicio posteriores quedan fuera de su distribución.
- En partidas de jugadores, el estado procede del registro del juego, que no incluye unidades en el frente, flotas ni escasez de equipo: el texto muestra 0 u omite esos campos, a diferencia del texto de entrenamiento.
- Las posturas desplazan la producción según lo previsto, pero no está establecido que las decisiones del modelo hagan a los países de la IA más fuertes que la IA vanilla.
- No se ha validado el rendimiento en partidas multijugador: el paquete 0.4.0-experimental con relé anfitrión/cliente sigue pendiente de aceptación en dos máquinas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente fuera de la distribución de entrenamiento.
- Idioma limitado al inglés en la entrada; el modelo no procesa texto en castellano.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base deriva de microsoft/deberta-v3-large (MIT), cuyos términos deben respetarse.
- Solo se ha publicado evaluación offline; las ganancias en juego online no están establecidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zwh20081/hoi4-jevai
- Repositorio GitHub: https://github.com/zwh20081/hoi4-jevai
- Mod en Steam Workshop: https://steamcommunity.com/sharedfiles/filedetails/?id=3808093078
- Modelo base: https://huggingface.co/com-kotobalabs/open-jev-deberta-v3-large
- Modelo original de Microsoft: https://huggingface.co/microsoft/deberta-v3-large
- Versión experimental v2: https://huggingface.co/zwh20081/hoi4-jevai/tree/main/v2
- Model card de v2: https://huggingface.co/zwh20081/hoi4-jevai/blob/main/v2/README.md
- Grafos OpenVINO de v2: https://huggingface.co/zwh20081/hoi4-jevai/tree/main/v2/openvino
