# w2Tao/gomoku-v1

## Resumen

gomoku-v1 es una red de política (policy network) para el juego del cinco en línea (gomoku) en tablero de 15×15 sin restricciones (freestyle, gana quien alinee cinco o más fichas). Lo desarrolla el autor independiente w2Tao y se publica como el estado final de su arquitectura `ValuePolicyNet`, entrenada con el nombre interno `d3`. Con solo 185.724 parámetros, el modelo recibe el estado del tablero y devuelve directamente una puntuación por celda; la jugada se elige tomando el máximo entre las celdas legales, sin búsqueda, sin detección de VCF ni de dobles tres.

El modelo se obtiene por destilación a partir de `gomoku-baseline`, del mismo autor, usando como etiquetas la variante principal (principal variation) generada por RAPFI25, motor ganador de la Gomocup 2026, con un límite de tiempo de 300 ms por jugada. Es relevante porque demuestra que una red minúscula, entrenada únicamente con pérdida de política sobre trazas de un motor fuerte, puede superar de forma clara a su modelo base y alcanzar un 30,7 % de victorias frente a EMBRYO26, sexto clasificado de la Gomocup 2026.

No es un modelo de lenguaje: no procesa texto ni dispone de contexto lingüístico. Su entrada es un tensor `(N, 3, 15, 15)` en float32 y su salida son logits de valor y de política sobre las 225 celdas del tablero. La ficha se centra, por tanto, en sus especificaciones de red, entrenamiento, rendimiento medido y limitaciones para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `ValuePolicyNet` (red convolucional con cabezas de valor y política; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 185.724 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de tablero 15×15, tensor `(N, 3, 15, 15)`) |
| Tipos de cuantización | no disponible (pesos publicados en `model.pt`, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no aplica (modelo de juego de tablero, sin capacidades lingüísticas) |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | `model.pt` (PyTorch `state_dict` + `config`), más `manifest.json` con SHA-256 |

## Arquitectura y entrenamiento

La red pertenece a la familia `ValuePolicyNet` y produce dos salidas: `value_logits` y `policy_logits`. La cabeza de política asigna una puntuación a cada una de las 225 celdas del tablero (indexación en orden de filas, `idx = r * 15 + c`). En la práctica solo se entrena la cabeza de política: la pérdida de valor tiene `value_weight` a 0, por lo que la cabeza de valor no recibe señal de entrenamiento y no debe usarse como evaluador de posición. La inferencia es una única pasada hacia adelante, sin búsqueda en árbol, sin VCF y sin detección de dobles tres.

El entrenamiento parte de `gomoku-baseline` (mismo tronco) como arranque en caliente y destila etiquetas de RAPFI25. El conjunto `dist3.npz` contiene 49.849 etiquetas de política extraídas de la variante principal de partidas del motor, con aperturas aleatorias de 6 jugadas para ampliar la distribución de posiciones. Se realizan 4.000 pasos con tasa de aprendizaje 2e-4, tamaño de lote 256 y aumento de datos con las 8 simetrías del diédrico. Como la variante principal alterna jugadas de ambos bandos, las posiciones impares corresponden a "qué jugaría nuestro bando", que es la información nueva respecto a la etiqueta `TURN` del baseline. El autor advierte que el profesor, con límites de 300 ms y 5.000 ms, coincide solo en aproximadamente una de cada cinco respuestas, de modo que el modelo aprende el comportamiento de RAPFI25 a 300 ms, no su política completa.

## Capacidades

- Selección de jugada en gomoku 15×15 freestyle mediante una única pasada hacia adelante, sin búsqueda.
- Salida de política sobre las 225 celdas del tablero, enmascarable con las celdas ocupadas.
- Salida de valor presente en la arquitectura, pero sin entrenamiento (no fiable).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües ni de generación de texto.
- Sin modo de pensamiento, visión ni audio.
- Sin mecanismos especiales de decodificación especulativa ni atención lineal.

## Casos de uso

- Motor de jugada rápida en aplicaciones de gomoku: una sola pasada de red con 185.724 parámetros permite responder en tiempo real en CPU, sin necesidad de búsqueda, adecuado para apps móviles o web con latencia mínima.
- Oponente de dificultad media en videojuegos y demos: supera a su baseline (75,7 % frente a 63,0 % contra el heurístico congelado) y ofrece un rival más competitivo que un heurístico simple sin coste de búsqueda.
- Generación de datos sintéticos de tablero: al producir distribuciones de política sobre 225 celdas, puede emplearse para preetiquetar posiciones en pipelines de entrenamiento de otros modelos o para bootstrapping.
- Componente de política previa en sistemas con búsqueda externa: aunque el modelo no busca, sus logits pueden usarse como ordenación inicial de candidatos en un motor MCTS o alfa-beta propio que añada la búsqueda que aquí falta.
- Benchmark interno de destilación: sirve como referencia reproducible (con `manifest.json` y SHA-256) para comparar recetas de destilación de motores de tablero en redes pequeñas.
- Investigación educativa sobre redes de política: su tamaño reducido y su API simple (`ValuePolicyNet`, tensor de entrada, argmax enmascarado) lo hacen útil para docencia y experimentos de bajo coste.
- Análisis de posiciones sin valor fiable: la cabeza de política permite estudiar qué celdas prioriza el modelo, siempre que no se interprete la cabeza de valor como evaluación.

## Benchmarks y rendimiento

| Oponente | `baseline` | `gomoku-v1` | Partidas |
|---|---|---|---|
| Heurístico congelado (referencia interna) | 63,0 % | 75,7 % | 300 (emparejadas) |
| EMBRYO26 (6.º en Gomocup 2026) | 12,8 % | 30,7 % | 150 por brazo |
| TITO14 (2014) | 0,0 % | 0,0 % | 24 |

El autor indica que la misma receta, antes de reconstruir y deduplicar el conjunto de datos, dio 13,0 % → 31,2 % frente a EMBRYO26 (150 por brazo, z = 3,67); tras la reconstrucción y repetición, 12,8 % → 30,7 %, con la misma conclusión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 185.724 parámetros en float32 los pesos ocupan aproximadamente 0,74 MB, y el tensor de entrada `(N, 3, 15, 15)` es despreciable, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas, incluida cualquier GPU integrada con soporte PyTorch.
- Opciones de despliegue: PyTorch nativo cargando `model.pt` con `torch.load(..., weights_only=False)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este formato).
- Latencia y throughput estimados: no disponibles de forma numérica; por el tamaño del modelo se espera latencia de milisegundos o inferior en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Búsqueda | Contexto de tablero | Rendimiento vs EMBRYO26 | Licencia |
|---|---|---|---|---|---|
| gomoku-v1 (w2Tao) | 185.724 | No | 15×15 freestyle | 30,7 % | other |
| gomoku-baseline (w2Tao) | mismo tronco `ValuePolicyNet` (cifra no disponible) | No | 15×15 freestyle | 12,8 % | no disponible |
| RAPFI25 (profesor) | no disponible | Sí (motor de búsqueda) | 15×15 | no disponible como porcentaje | no disponible |
| EMBRYO26 | no disponible | Sí | 15×15 | referencia (6.º Gomocup 2026) | no disponible |
| TITO14 | no disponible | Sí | 15×15 | gana 24/24 a v1 | no disponible |

La comparación con motores de búsqueda como RAPFI25, EMBRYO26 o TITO14 no es homogénea: gomoku-v1 es una red de política sin búsqueda, mientras que los otros son motores completos. No se dispone de datos de parámetros ni de licencia de esos motores en la información proporcionada.

## Limitaciones y advertencias

- Sin búsqueda: el modelo no detecta VCF ni dobles tres, lo que provoca errores tácticos que un motor con búsqueda evitaría.
- Profesor debilitado por límite de tiempo: las etiquetas reflejan a RAPFI25 a 300 ms, no su política completa; el autor estima que a 300 ms y 5.000 ms solo coincide en aproximadamente una de cada cinco respuestas.
- Etiquetas no óptimas: la variante principal del motor no es el valor óptimo desde el punto de vista de la teoría de juegos.
- Cabeza de valor sin entrenar: `value_weight` es 0, por lo que `value_logits` no debe usarse para evaluar posiciones.
- Nivel real modesto: el autor reconoce que está lejos de la primera fila de 2026 y que no gana ninguna partida a TITO14 (2014).
- Referencia interna engañosa: el heurístico congelado ha dado en repetidas ocasiones ordenaciones contrarias a los motores reales, por lo que no debe usarse como único criterio de fuerza.
- Licencia restrictiva y procedencia dudosa: la licencia es "other"; los datos de entrenamiento del baseline provienen de partidas públicas de la Gomocup 2026 sin licencia explícita, y las etiquetas de destilación provienen de partidas de RAPFI25. El autor recomienda verificar la conformidad legal antes de cualquier uso.
- Sin soporte lingüístico ni de texto: no es un modelo de lenguaje y no debe evaluarse con benchmarks de NLP.
- Sin variantes cuantizadas ni formatos alternativos publicados: solo `model.pt` en PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/w2Tao/gomoku-v1
- Modelo base: https://huggingface.co/w2Tao/gomoku-baseline
- Informe técnico (secciones §7.13–§7.16): https://github.com/w2Tao/gomoku/blob/main/report.md
- Repositorio del proyecto: https://github.com/w2Tao/gomoku
