# xxparthparekhxx/sigma-go

## Resumen

Sigma-Go es una red neuronal de política y valor para ajedrez, componente central de un motor de ajedrez que combina una red residual con búsqueda en árbol de Monte Carlo (MCTS). La desarrolla el usuario independiente xxparthparekhxx y se publica como un único fichero ONNX de 47,5 MiB exportado desde un checkpoint de PyTorch, con el objetivo explícito de ejecutar el motor directamente en el navegador mediante onnxruntime-web, WebGPU o WebAssembly. Es la red que alimenta la demo pública en chess.parthparekhdev.com.

Su relevancia es acotada y muy específica: no es un modelo de lenguaje ni un sistema generalista, sino un evaluador de posiciones de ajedrez con una arquitectura compacta de 10 bloques residuales de 256 canales, 12.448.714 parámetros y dos cabezas (política sobre 4.544 movimientos y valor escalar en rango −1 a 1). Encaja en la categoría de motores neuronales ligeros aptos para inferencia en cliente.

La versión publicada se ha afinado sobre evaluaciones de Stockfish del conjunto público de Lichess tras un primer entrenamiento supervisado con partidas humanas. No hay autojuego en este entrenamiento. Su punto fuerte declarado es el rendimiento frente a Stockfish 19 con fuerza limitada, y su limitación principal es que la entrada no codifica derechos de enroque, capturas al paso ni historial de movimientos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red residual convolucional: vástago 3×3, 10 bloques residuales de 256 canales, cabezas de política y valor |
| Parámetros totales | 12.448.714 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 14×8×8 planos) |
| Tipos de cuantización | no disponible (se distribuye en fp32 con BatchNorm plegado en las convoluciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), fp32, eje de batch dinámico, fichero `chess_net.onnx` de 47,5 MiB |

## Arquitectura y entrenamiento

La red es un evaluador de posiciones de tipo AlphaZero reducido. Recibe un tensor `planes` de forma `[batch, 14, 8, 8]`: los planos 0–5 codifican peón, caballo, alfil, torre, dama y rey blancos, los planos 6–11 las mismas piezas negras y los planos 12 y 13 indican el turno. No se incluyen planos de enroque, captura al paso ni historial. La salida consta de `policy` (`[batch, 4544]` logits, una entrada por par origen-destino más promociones, ordenado según `create_uci_labels` de `src/dataset.py`) y `value` (`[batch, 1]`, resultado esperado desde el punto de vista de las blancas). Las BatchNorm están plegadas en las convoluciones y la exportación se validó frente al checkpoint de PyTorch en 96 posiciones y lotes de 1, 8 y 32, con diferencias máximas de 1,1e-5 en los logits de política y 7,7e-7 en el valor.

El entrenamiento tiene dos fases. La primera es aprendizaje supervisado sobre partidas humanas extraídas de ficheros PGN, etiquetando cada posición con el movimiento jugado y el resultado final de la partida; esa red es la revisión `base` del repositorio. La segunda es un ajuste fino en dos rondas sobre las evaluaciones públicas de Stockfish de Lichess (CC0, 23,7 millones de posiciones), donde el objetivo de política es el primer movimiento de la línea principal del análisis más profundo y el de valor es `tanh(centipawns/400)` desde el lado de las blancas. La segunda ronda, que produce este fichero, partió de la red de la primera y dio una pasada de 46.000 pasos de tamaño 512 en unas 7,6 horas sobre una GTX 1650 Ti. Sobre 50.000 posiciones reservadas, la red elige el movimiento de Stockfish el 41,7 % de las veces.

## Capacidades

- Evaluación de posiciones de ajedrez: produce una distribución de probabilidad sobre 4.544 movimientos legales candidatos (tras enmascarar los ilegales) y un valor escalar de resultado esperado.
- Priorización de movimientos para búsqueda: los logits de política sirven como priors en el MCTS implementado en `src/mcts.py`.
- Estimación de resultado: el valor en −1…1 permite al motor decidir entre líneas sin búsqueda profunda adicional.
- Integración en navegador: el formato ONNX permite ejecución con onnxruntime-web sobre WebGPU o WebAssembly, con eje de batch dinámico para evaluar varias posiciones por pasada.
- Ejecución en Python: ejemplo oficial con `onnxruntime.InferenceSession` y la librería `python-chess` para construir los planos.
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, ni capacidades multilingües; no procesa texto.

## Casos de uso

- Motor de ajedrez en el navegador sin backend: gracias al ONNX de 47,5 MiB y a onnxruntime-web sobre WebGPU o WebAssembly, se puede ofrecer un rival de nivel club (en torno a 2000 Elo de Stockfish limitado) dentro de una página estática, sin servidor ni GPU remota.
- Análisis de partidas y revisión de errores: ejecutar la red sobre cada posición de un PGN para obtener el valor esperado y contrastarlo con el movimiento jugado, destacando las jugadas que degradan más la evaluación.
- Aplicación de entrenamiento con MCTS acotado: combinar la política con 200–800 simulaciones por movimiento produce un jugador ajustable en fuerza y coste, útil en apps docentes o de práctica.
- Estudio de ajedrez por correspondencia o táctica: la cabeza de valor da una estimación rápida de posiciones sin necesidad de un motor completo, integrable en scripts de Python con `onnxruntime`.
- Componente de un pipeline de destilación o comparación de evaluadores: al estar exportado a ONNX y con validación numérica frente a PyTorch, sirve como referencia para comparar otras redes de ajedrez o para fine-tuning posterior sobre nuevas evaluaciones.
- Banear o verificar jugadas en plataformas pequeñas: usar el valor esperado y la probabilidad de política para señalar movimientos anómalos respecto a la distribución esperada, como heurística auxiliar de detección de trampas.
- Demo educativa de AlphaZero: el repositorio y el fichero ONNX permiten ilustrar el bucle política-valor-MCTS en un entorno de recursos limitados (una GTX 1650 Ti basta para el ajuste fino).

## Benchmarks y rendimiento

Los datos de fuerza se midieron contra Stockfish 19 con `UCI_LimitStrength` y un límite de 100.000 nodos por movimiento, en partidas de 48 juegos (24 aperturas de 2 a 4 plies aleatorios jugadas con ambos colores). Sigma-Go usa 800 simulaciones por movimiento sin aleatoriedad. La puntuación cuenta tablas como medio punto e incluye intervalo de Wilson al 95 %.

| Red | UCI_Elo de Stockfish | Victorias | Tablas | Derrotas | Puntuación |
|---|---|---|---|---|---|
| Esta red | 2000 | 27 | 13 | 8 | 0,70 (0,56–0,81) |
| `base` | 2000 | 3 | 18 | 27 | 0,25 (0,15–0,39) |
| `base` | 1600 | 23 | 16 | 9 | 0,65 (0,50–0,77) |
| `base` | 1320 | 35 | 7 | 6 | 0,80 (0,67–0,89) |

En un enfrentamiento directo a 200 simulaciones, esta red puntuó 0,81 frente al primer ajuste fino (47 victorias, 10 tablas y 7 derrotas en 64 partidas). Sobre 50.000 posiciones reservadas del conjunto de Lichess, coincide con el movimiento de Stockfish el 41,7 % de las veces. No se han publicado resultados de benchmarks estándar de ajedrez (por ejemplo, Elo en listas abiertas, pruebas tipo CCRL o TCEC) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 50–100 MiB para los pesos en fp32; con lotes de 32 posiciones el consumo adicional de activaciones es mínimo y cabe holgadamente en cualquier GPU con 1 GB.
- GPU recomendadas: cualquier GPU integrada o dedicada es suficiente; la red se entrenó y afinó en una GTX 1650 Ti, y en inferencia funciona en A100, H100, RTX 4090 o tarjetas de gama baja sin problema.
- Cabe en GPU de consumo: sí, en todas las actuales (GTX 1050 en adelante, incluidas las integradas modernas), y también en CPU mediante WebAssembly u onnxruntime.
- Opciones de despliegue: onnxruntime para Python, onnxruntime-web (WebGPU o WebAssembly) en el navegador, y cualquier runtime compatible con ONNX opset 17. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles de forma explícita. Como referencia indirecta, la segunda ronda de ajuste fino (46.000 pasos de lote 512 sobre 23,7 millones de posiciones) se completó en 7,6 horas en una GTX 1650 Ti, lo que da una idea de la carga de entrenamiento, no de la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formato | Licencia | Disponibilidad | Fuerza declarada |
|---|---|---|---|---|---|---|
| Sigma-Go (esta red) | 12,4 M | 14 planos 8×8 | ONNX | MIT | Hugging Face (este repo) | ~2000 Elo de Stockfish limitado (0,70 en 48 partidas) |
| Sigma-Go `base` | no disponible con detalle (misma arquitectura, entrenada solo con partidas humanas) | 14 planos 8×8 | ONNX | MIT | Revisión `base` del mismo repo | 0,25 frente a UCI_Elo 2000 |
| Redes tipo AlphaZero/Leela | no disponible en la información | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros motores neuronales comparables (Leela Chess Zero, Stockfish NNUE, Maia, etc.) en la información proporcionada, por lo que la comparación cuantitativa se limita a las dos revisiones del propio repositorio.

## Limitaciones y advertencias

- Fuerza medida únicamente contra Stockfish con fuerza limitada y en partidas de 48 juegos, con intervalos amplios (0,56–0,81 para la puntuación de 0,70 frente a UCI_Elo 2000).
- La entrada no incluye derechos de enroque, casilla de captura al paso ni historial de movimientos; la búsqueda aplica esas reglas, pero la red no puede verlas, lo que puede producir evaluaciones inexactas en posiciones donde esos factores son decisivos.
- No hay autojuego en el entrenamiento, lo que limita la calidad de la política frente a redes entrenadas con RL.
- Riesgo de alucinación en sentido figurado: la red puede asignar alta probabilidad a movimientos plausibles pero incorrectos tácticos si el MCTS no los refuta, y el valor es una estimación, no un resultado exacto.
- Sin planos de historial, la red no distingue posiciones repetidas ni puede razonar sobre tablas por triple repetición o regla de 50 movimientos.
- La model card no documenta sesgos de otro tipo (no aplica sesgo lingüístico o social al no procesar texto).
- Licencia MIT: permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la licencia; no hay restricciones adicionales declaradas en el repositorio.
- En producción conviene validar numéricamente la exportación ONNX frente al checkpoint original, como ya hizo el autor, y fijar la versión de onnxruntime y la tabla de movimientos, porque el orden de la política depende de `create_uci_labels` en `src/dataset.py`.
- El repositorio es de un autor individual, con 0 descargas y 0 likes en el momento de la consulta; no hay garantías de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxparthparekhxx/sigma-go
- Revisión `base` (red entrenada solo con partidas humanas): https://huggingface.co/xxparthparekhxx/sigma-go/tree/base
- Repositorio del motor (Chess-Ai): https://github.com/xxparthparekhxx/Chess-Ai
- Tabla de movimientos (`create_uci_labels`): https://github.com/xxparthparekhxx/Chess-Ai/blob/master/src/dataset.py
- Búsqueda MCTS del motor: https://github.com/xxparthparekhxx/Chess-Ai/blob/master/src/mcts.py
- Demo pública: https://chess.parthparekhdev.com
- Conjunto de datos de evaluaciones de Lichess: https://huggingface.co/datasets/Lichess/chess-position-evaluations
