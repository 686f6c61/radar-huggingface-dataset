# TakalaWang/aicup2026-go

## Resumen

`TakalaWang/aicup2026-go` es un repositorio de pesos y artefactos de entrenamiento publicado por TakalaWang para la competición AI CUP 2026, centrado en dos tareas sobre partidas de Go (baduk): la predicción del rango (rank) de los jugadores y la identificación de jugadores a partir de sus partidas. No se trata de un modelo de lenguaje generativo, sino de un conjunto de modelos especializados (encoders estado-acción y modelos de conjunto sobre características de Go) que se apoyan en redes externas de KataGo y en un encoder SE (score estimation) para extraer características de las posiciones.

El repositorio contiene múltiples ajustes (fits) de los modelos finales: modelos de identificación de jugador basados en un encoder P-SA con pérdida GE2E y asignación Sinkhorn, y modelos de conjunto para predicción de rango entrenados sobre características HumanSL/SE de todos los movimientos de ambos bandos. La model card documenta los resultados de holdout de cada variante y remite al repositorio de GitHub para el código (`submit.py`, `rank_set.py`, `train_experiment.py`) y a `docs/experiments/` para los resultados completos.

Es relevante ahora por su carácter de referencia reproducible para tareas de analítica de partidas de Go (perfilado de jugadores y estimación de nivel), y porque publica pesos y configuraciones tras la competición, lo que permite reproducir y comparar los pipelines. El tamaño del repositorio es de 0,2 GB, lo que refleja que los pesos publicados son artefactos ligeros que dependen de redes externas de mayor tamaño no incluidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos especializados sobre características de Go: encoder estado-acción P-SA con pérdida GE2E para identificación de jugador; modelos de conjunto (set models) sobre características HumanSL/SE para predicción de rango |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre secuencias de movimientos de partidas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (etiqueta `license: other`; condiciones concretas no detalladas en la información disponible) |
| Formato de pesos | no disponible (el repositorio contiene fits y artefactos; la model card no especifica safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

La identificación de jugador se aborda con un encoder estado-acción P-SA entrenado con pérdida GE2E (Generalized End-to-End), un esquema habitual en verificación de hablante adaptado aquí a secuencias de movimientos. Se publican variantes entrenadas solo con partidas donde el jugador lleva negras (`psa-black`), variantes continuadas a lr 3e-5 desde los modelos anteriores (`psa-continued`, `psa-black-continued`) y combinaciones con asignación Sinkhorn, que elevan el holdout desde 0,9355 hasta 0,9937 y, en la pareja de sumisión actual, hasta 1,0 (0,9708 sin rerank).

La predicción de rango usa modelos de conjunto sobre características HumanSL/SE de todos los movimientos de ambos bandos. Hay variantes entrenadas con 500 y 400 partidas por jugador (`set-500-400-opp*`), especialistas en preguntas de 5 partidas (`-size5`) promediados con `--fit-small`, variantes con 60 y 120 partidas por jugador (grupos de ensemble A y B) y modelos conscientes de handicap con 5 columnas HD adicionales (grupo D). Las características SE provienen de un modelo `se-finetuned` ajustado sobre los rangos del propio equipo. La extracción de características depende de pesos externos no incluidos: KataGo HumanSL `b18c384nbt-humanv0` y `kata1-b18c384nbt-s9996604416-d4316597426`, y el SE de Chen et al. 2025 (`se_infty_go.pt`).

## Capacidades

- Predicción del rango de un jugador a partir de un conjunto de partidas, mediante modelos de conjunto sobre características de todos los movimientos.
- Identificación de jugador (verificación/identificación) a partir de secuencias de movimientos, con encoder P-SA y pérdida GE2E.
- Asignación de identidades con Sinkhorn y reranking sobre las puntuaciones del encoder.
- Manejo de preguntas de distinto tamaño de evidencia: especialistas para 5 partidas y modelos para 60, 120, 400 y 500 partidas por jugador.
- Modelos conscientes de handicap mediante columnas HD adicionales.
- Extracción de características apoyada en redes KataGo HumanSL y en un encoder SE ajustado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Perfilado de jugadores en plataformas de Go: dado un historial de partidas, el modelo de identificación P-SA con Sinkhorn permite agrupar partidas por jugador y detectar cuentas duplicadas o suplantaciones, usando el holdout de 0,9937 como referencia de viabilidad.
- Estimación de nivel para emparejamiento competitivo: los modelos de conjunto sobre características HumanSL/SE predicen el rango con un holdout de 0,750 (3 semillas), útil para asignar categorías en torneos o ligas sin historial declarado.
- Análisis de partidas cortas: los especialistas `-size5` permiten estimar rango cuando solo se dispone de 5 partidas por jugador, con holdout de 0,7513 al promediarlos con el modelo principal.
- Arbitraje de handicap: los modelos del grupo D incorporan columnas HD y permiten estimar el nivel en partidas con piedras de ventaja, un escenario frecuente en clubes y servidores.
- Investigación en analítica de Go: el repositorio publica fits y remite a `docs/experiments/`, lo que permite reproducir los experimentos de ablación (semillas, tamaños de conjunto, especialistas) y comparar pipelines.
- Detección de comportamiento anómalo: la combinación de identificación de jugador y predicción de rango permite señalar partidas cuyo estilo no concuerda con el rango declarado, como apoyo a la revisión manual.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los holdouts de la model card, no comparables con benchmarks estándar de modelos de lenguaje.

| Tarea / variante | Holdout |
|---|---|
| Identificación, `psa-seed42` | 0,9355 |
| Identificación, `psa-seed42` con Sinkhorn | 0,9937 |
| Identificación, suma `psa-seed42` + `psa-black` con Sinkhorn | 0,9984 |
| Identificación, pareja continuada + assign (sumisión actual) | 1,0 |
| Identificación, pareja continuada sin rerank | 0,9708 |
| Rango, `set-500-400-opp*` (media de 3 semillas) | 0,750 |
| Rango, con especialista 5 partidas (`--fit-small`) | 0,7513 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio publicado ocupa 0,2 GB, pero la inferencia requiere cargar además las redes externas de KataGo (`b18c384nbt-humanv0`, `kata1-b18c384nbt-s9996604416-d4316597426`) y el encoder SE (`se_infty_go.pt`), cuyos requisitos no se detallan.
- GPU recomendadas: no disponible. La model card menciona un "GPU host disk" donde residen las variantes no publicadas, lo que indica entrenamiento en GPU, pero sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el código de referencia está en el repositorio de GitHub (`submit.py`, `rank_set.py`, `train_experiment.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Enfoque | Holdout publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TakalaWang/aicup2026-go` | Rango e identificación de jugador en Go | Encoder P-SA + GE2E; set models sobre HumanSL/SE | 0,7513 (rango); 1,0 (identificación) | other | Pesos en Hugging Face, código en GitHub |
| KataGo HumanSL (`b18c384nbt-humanv0`) | Predicción de movimientos humanos y nivel | Red neuronal de Go con cabezas de human SL | no disponible en esta ficha | KataGo network license | Pesos externos en katagotraining.org |
| Chen et al. 2025 SE (`se_infty_go.pt`) | Estimación de score | Encoder SE | no disponible en esta ficha | Código GPL-3.0 | Pesos en rlg.iis.sinica.edu.tw |

No se dispone de otros modelos comparables de la misma competición en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de LLM.
- Los resultados de holdout (0,7513 en rango, 1,0 en identificación) provienen del propio equipo y de su partición de validación; no hay validación independiente publicada.
- La inferencia depende de pesos externos no incluidos en el repositorio (KataGo y SE de Chen et al.), sujetos a sus propias licencias: KataGo network license y GPL-3.0 para el código SE.
- La licencia del repositorio es `other` y las condiciones concretas de uso comercial no se detallan en la información disponible; debe consultarse al autor antes de un uso productivo.
- El holdout de 1,0 en identificación tras el rerank y la asignación puede reflejar un conjunto de evaluación pequeño o poco diverso; conviene tratar ese valor con cautela.
- Los modelos de rango se entrenaron con tamaños de conjunto específicos (5, 60, 120, 400, 500 partidas); el rendimiento fuera de esos regímenes no está documentado.
- Riesgo de sesgo por composición del dataset de la competición (jugadores, servidores y rangos representados), no cuantificado en la model card.
- No se documentan sesgos lingüísticos ni de otro tipo, ni riesgos de alucinación en el sentido habitual, al no ser un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/TakalaWang/aicup2026-go
- Repositorio de código: https://github.com/TakalaWang/aicup2026-go-rank
- KataGo (redes y licencia): https://katagotraining.org
- SE de Chen et al. 2025: https://rlg.iis.sinica.edu.tw
