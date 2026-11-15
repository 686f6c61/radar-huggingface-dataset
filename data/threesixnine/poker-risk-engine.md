# ThreeSixNine/poker-risk-engine

## Resumen

Poker-risk-engine es un motor de decisión para póker desarrollado por el usuario ThreeSixNine y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje ni de una red neuronal entrenada con descenso de gradiente, sino de un motor heurístico de decisión que combina evaluación de equity mediante simulación de Monte Carlo con umbrales de acción parametrizados por un único escalar de riesgo `r ∈ [0,1]`. Su propuesta diferencial es exponer la agresividad como un dial calibrado y monótono, algo que, según el autor, ningún agente de póker público ofrece con curvas de respuesta medidas.

El motor está etiquetado con `ml-intern`, lo que indica que fue construido con la herramienta ML Intern de Hugging Face, y se distribuye como código Python (un módulo `decision_engine.py`) en lugar de pesos en formato safetensors o GGUF. La evaluación de manos se apoya en la librería `treys` y la equity se estima por Monte Carlo contra oponentes uniformes, con un valor por defecto de 1500 simulaciones.

Su relevancia actual es acotada pero específica: sirve como componente de decisión en pipelines de visión por computador aplicados al póker (el autor enlaza su propio detector YOLO11n de cartas) y cuantifica explícitamente cómo el ruido de percepción degrada el EV de las decisiones. No hay información sobre arquitectura transformer, parámetros, contexto ni idiomas, porque no es un modelo de ese tipo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor heurístico de decisión (no neuronal): Monte Carlo con `treys` + umbrales parametrizados por `r` |
| Parametros totales | no disponible (no es un modelo con pesos entrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la model card está en inglés; el motor no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | Código Python (`decision_engine.py`); no hay pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El motor no entrena parámetros. Su lógica se compone de dos piezas: un estimador de equity por Monte Carlo (con `n_sims=1500` por defecto) que enfrenta la mano del héroe contra oponentes uniformemente aleatorios usando la librería `treys`, y un conjunto de umbrales de acción que dependen linealmente del escalar de riesgo `r`. Concretamente, `r` controla de forma simultánea y monótona el umbral de call (`pot_odds − 0.20·r`), el umbral de raise (`0.62 − 0.10·r`), el umbral de bet (`0.60 − 0.12·r`) y el tamaño de la apuesta (`0.45 + 0.55·r` del bote).

La calibración se realizó sobre 120 escenarios con semilla fija mediante el script `eval_knobs.py`. Los resultados muestran monotonicidad verificada por script en las cuatro métricas de agresividad (VPIP, PFR, aggression rate y bet/pot) al variar `r` de 0.0 a 1.0. El autor reconoce explícitamente una limitación del modelo de EV: al basarse solo en fold equity, la agresividad nunca se penaliza, por lo que la curva de EV medio crece de forma monótona hasta `r=1.0` sin pico interior; un modelo de EV con dinámica de realización de valor probablemente produciría el pico esperado, y esa es la siguiente línea de refinamiento declarada.

## Capacidades

- Decisión de acción en póker (fold, call, raise, bet) a partir del estado de la mesa: mano del héroe, board, bote, stack, cantidad a igualar, número de jugadores, posición y calle.
- Control calibrado y monótono de la agresividad mediante un único escalar `r ∈ [0,1]` que ajusta umbrales y sizing de forma simultánea.
- Estimación de equity por Monte Carlo contra oponentes uniformes con `treys`.
- Cuantificación del impacto del ruido de percepción: dado un ratio de lecturas erróneas `p`, el motor mide la tasa de cambio de acción y la pérdida de EV en fichas.
- Reproducibilidad mediante scripts de evaluación con semillas fijas (`eval_knobs.py --n-scenarios 120 --sims 1500`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento en lenguaje natural ni capacidades multilingües, de visión o de audio.

## Casos de uso

- Componente de decisión en un pipeline de visión de póker: combinado con el detector `ThreeSixNine/yolo11n-poker-table-cards`, el motor recibe el estado de la mesa reconstruido por percepción y emite una acción; el propio autor documenta cómo el ruido de lectura degrada el EV, lo que permite diseñar alertas cuando la tasa de misread supera un umbral.
- Análisis de sensibilidad al riesgo en investigación: al ser `r` un escalar calibrado y monótono, permite estudiar cómo varían VPIP, PFR y sizing al desplazar la agresividad, algo útil para comparar políticas o validar modelos de oponentes.
- Evaluación de robustez de sistemas de percepción: la tabla de inyección de misreads (de `p=0.00` a `p=0.30`) ofrece una métrica cuantitativa (pérdida de EV en fichas) para priorizar mejoras en el detector de cartas.
- Generación de datos sintéticos de decisiones etiquetadas: recorriendo `r` de 0 a 1 sobre escenarios con semilla se obtienen trazas de acción reproducibles para entrenar o validar otros agentes.
- Herramienta docente o de prototipado: el ejemplo de uso (`RiskEngine(n_sims=1500)` con un `TableState` de flop) permite integrar el motor en un notebook en pocas líneas para demostrar conceptos de pot odds, equity y agresividad.
- Baseline heurístico en torneos o simulaciones de agentes: sirve como referencia simple y determinista frente a la que medir agentes más complejos, aunque limitado a decisiones de una sola calle.

## Benchmarks y rendimiento

Calibración del dial de riesgo sobre 120 escenarios con semilla fija (`eval_knobs.py`):

| r | VPIP | PFR | Aggr. rate | Bet/pot |
|---|---|---|---|---|
| 0.0 | 0.36 | 0.00 | 0.15 | 0.91 |
| 0.5 | 0.55 | 0.06 | 0.19 | 1.35 |
| 1.0 | 0.72 | 0.16 | 0.22 | 1.82 |

Inyección de misreads con re-decisión a `r=0.5`:

| p (tasa de misread) | Tasa de cambio de acción | Pérdida media de EV (fichas) |
|---|---|---|
| 0.00 | 0.025 | 2.19 |
| 0.05 | 0.042 | 3.86 |
| 0.10 | 0.075 | 8.75 |
| 0.20 | 0.083 | 13.12 |
| 0.30 | 0.167 | 34.26 |

No se han publicado resultados frente a benchmarks estándar de póker (por ejemplo, comparativas contra solvers o agentes de referencia) en la información disponible.

## Requisitos de hardware

- No requiere GPU: es código Python con simulación de Monte Carlo sobre `treys`, ejecutable en CPU.
- El coste computacional escala con `n_sims`; el valor por defecto de 1500 simulaciones por decisión es ligero y apto para portátiles convencionales.
- No aplica VRAM estimada ni modelos de GPU recomendados (A100, H100, RTX 4090) porque no hay inferencia de red neuronal.
- Opciones de despliegue: ejecución directa como módulo Python (`from decision_engine import RiskEngine, TableState`) o integración como servicio dentro de un pipeline mayor.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de `n_sims` y del hardware, pero el autor no publica medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThreeSixNine/poker-risk-engine | Motor heurístico Monte Carlo | no aplica | no aplica | MIT | Hugging Face (código) |
| Alternativas de agente de póker públicas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada; el autor afirma que ningún agente de póker público ofrece un dial de agresividad calibrado con curvas de respuesta medidas, pero no cita alternativas concretas con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de oponente uniforme y aleatorio: no incorpora lecturas, rangos ni perfiles de rival, lo que aleja las estimaciones de equity de las de un oponente real.
- Decisiones de una sola calle: no hay planificación de calles futuras ni consideración de ICM, por lo que no es apto para decisiones de torneo con implicaciones de pago.
- El EV heurístico se usa solo para comparar políticas; el autor reconoce que la curva de EV crece monótonamente hasta `r=1.0` sin pico interior porque el modelo de EV basado solo en fold equity nunca penaliza la agresividad.
- El preflop es equity Monte Carlo puro, sin tablas de rangos ni charts.
- Sensibilidad alta al ruido de percepción: con `p=0.30` la pérdida media de EV es de 34.26 fichas frente a 2.19 en lectura limpia, aproximadamente 15 veces más.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- Proyecto en versión v0 con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni idiomas especificados, lo que sugiere un estado temprano y sin validación externa.
- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K ni desplegarse con vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThreeSixNine/poker-risk-engine
- Dataset de evaluación de percepción: https://huggingface.co/datasets/ThreeSixNine/poker-table-perception-eval
- Detector de cartas YOLO11n: https://huggingface.co/ThreeSixNine/yolo11n-poker-table-cards
- ML Intern (herramienta de construcción): https://hf.co/chat?mode=ml-intern
