# w2Tao/gomoku-baseline

## Resumen

`gomoku-baseline` es una red neuronal convolucional ligera desarrollada por el usuario w2Tao para jugar al gomoku (cinco en raya) en tablero de 15×15 en modalidad freestyle, es decir, sin reglas de prohibición y con victoria al alinear cinco o más fichas. El modelo combina una cabeza de política, que asigna una puntuación a cada una de las 225 casillas, con una cabeza de valor que estima el resultado de la posición. Con solo 185.724 parámetros, realiza una única pasada forward por jugada, sin búsqueda de árbol, sin detección de VCF y sin comprobación de dobles tres.

El interés del modelo es fundamentalmente metodológico: demuestra que una destilación en dos fases (primero desde un heurístico débil, después con partidas de motores de Gomocup) supera a entrenar desde cero con cualquiera de las dos fuentes por separado. En 200 partidas pareadas alcanza un 65,5 % de victorias frente al heurístico congelado que incorpora el propio repositorio, mientras que la versión solo destilada se queda en el 47,0 % y la entrenada solo con partidas de motor llega al 57,5 %.

Se trata de un artefacto de investigación de tamaño muy reducido (el repositorio ocupa 0,0 GB), pensado como línea base reproducible para experimentos de aprendizaje por imitación y refuerzo en juegos de tablero, no como un motor de gomoku competitivo. La model card está redactada en chino y no declara idiomas soportados ni resultados de benchmarks estándar de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual con dos cabezas (política y valor), `ValuePolicyNet(channels=48, blocks=4, head_channels=24)` |
| Parametros totales | 185.724 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de tensor (N, 3, 15, 15) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch, presumiblemente float32) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | other (sin especificar; los datos de entrenamiento provienen de Gomocup 2026 sin licencia explícita) |
| Formato de pesos | `model.pt` (checkpoint de PyTorch con clave `config`) |

## Arquitectura y entrenamiento

La red es una CNN completamente convolucional con cuatro bloques residuales. El tallo es una convolución 3×3 de 3 a 48 canales con BatchNorm y ReLU; cada bloque residual aplica dos convoluciones 3×3 con BatchNorm. La cabeza de valor usa una convolución 1×1 de 48 a 24 canales, seguida de Flatten y una capa lineal de 24·225 a 3 salidas (probablemente derrota, tablas y victoria). La cabeza de política aplica una convolución 1×1 de 48 a 1 canal, aplana y suma un sesgo posicional aprendible de 225 dimensiones. El campo receptivo efectivo es de 19 casillas, suficiente para cubrir el tablero completo de 15×15. La entrada son tres planos binarios: fichas propias, fichas del rival y última jugada del rival.

El entrenamiento consta de dos fases con 8.000 pasos cada una, batch de 256, aumento de datos con las 8 simetrías del diédrico y pérdida conjunta sobre las cabezas de valor y política. La fase 1 destila un heurístico congelado (VCF de profundidad 7 más detección de dobles tres) sobre 150.000 posiciones de autojuego; la fase 2 afina con 500.000 posiciones extraídas de partidas de motores de Gomocup 2026. El autor justifica el esquema porque la destilación sola iguala al profesor (47,0 % de victorias contra él) y el entrenamiento solo con partidas de motor alcanza el 57,5 %, mientras que la combinación secuencial llega al 65,5 %.

## Capacidades

- Selección de jugada en gomoku 15×15 freestyle mediante un único forward, sin búsqueda.
- Estimación de valor de posición con tres clases de salida.
- Puntuación densa de las 225 casillas, enmascarable para restringir a movimientos legales.
- Generalización limitada a aperturas: el modelo aprende de un conjunto reducido de posiciones iniciales.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio.
- No incorpora modo de pensamiento ni decodificación especulativa; es un evaluador de posiciones, no un generador de texto.

## Casos de uso

- Línea base reproducible en investigación de aprendizaje por imitación: sirve para medir cuánto aporta la destilación desde un heurístico débil antes de afinar con datos de motores, con un coste computacional mínimo.
- Componente de evaluación en pipelines de búsqueda: la cabeza de valor puede integrarse como función de evaluación en un MCTS o en una búsqueda alfa-beta de un jugador de gomoku, sustituyendo a la heurística manual.
- Generación de datos sintéticos de gomoku: el modelo puede autojugarse para producir posiciones etiquetadas con valor y política, útiles para aumentar datasets de entrenamiento de otros modelos.
- Estudio de sensibilidad a aperturas: al conocerse la limitación de diversidad inicial, es útil como caso de análisis de cómo un dataset sesgado en aperturas condiciona el comportamiento de una política entrenada por imitación.
- Docencia y prototipado rápido: con 185.724 parámetros y un checkpoint de PyTorch, se puede cargar en CPU y ejecutar en notebooks para ilustrar destilación, cabezas múltiples y aumento diédrico.
- Pruebas de integración de motores de juego: sirve como oponente de referencia ligero en tests automatizados de motores de gomoku o de interfaces de tablero, sin necesidad de GPU.

## Benchmarks y rendimiento

| Enfrentamiento | Tasa de victoria | Partidas |
|---|---|---|
| Frente al heurístico congelado (VCF profundidad 7 + dobles tres) | 65,5 % | 200 (pareadas, cambio de color, misma apertura) |
| Versión solo destilada frente al heurístico | 47,0 % | 200 |
| Versión solo con partidas de motor frente al heurístico | 57,5 % | 200 |
| Versión destilada frente a la versión completa | 71,5 % (a favor de la completa) | 200 |
| Versión solo con partidas de motor frente a la versión completa | 61,5 % (a favor de la completa) | 200 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32; el modelo completo ocupa menos de 1 MB de pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050, RTX 3050 o superiores; también funciona en CPU sin penalización apreciable.
- Cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (`torch.load` más `ValuePolicyNet`), exportación a TorchScript u ONNX no documentada pero viable por la simplicidad de la arquitectura. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de microsegundos por posición en GPU y de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tablero | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `w2Tao/gomoku-baseline` | 185.724 | 15×15 | CNN con cabezas de política y valor, sin búsqueda | other (sin especificar) | Hugging Face y GitHub |
| Heurístico congelado del mismo repositorio | no disponible | 15×15 | Reglas: VCF profundidad 7 y dobles tres | no disponible | Incluido en el repositorio |
| Motores de Gomocup 2026 | no disponible | 15×15 | Motores de búsqueda con reglas y evaluación | no disponible | Fuente de datos citada, sin licencia explícita |

No se dispone de información sobre otros modelos neuronales comparables de gomoku en la documentación proporcionada.

## Limitaciones y advertencias

- No realiza búsqueda: pierde VCF y dobles tres que un motor con búsqueda detectaría; el autor señala que añadir una búsqueda de un nivel con la cabeza de valor está pendiente de evaluar.
- Diversidad de aperturas muy baja: los datos de entrenamiento contienen solo 12 aperturas fijas por liga, por lo que las primeras jugadas están dominadas por esas posiciones.
- Las etiquetas de valor provienen del resultado de partidas de motores, no del valor óptimo en teoría de juegos; la cabeza de valor hereda ese sesgo.
- Los datos de entrenamiento proceden de partidas públicas de Gomocup 2026 sin licencia explícita, lo que genera incertidumbre sobre el uso comercial del modelo derivado.
- La licencia del modelo es "other" sin texto aclaratorio, por lo que no se garantiza su uso comercial.
- No hay información sobre sesgos, robustez ante tableros anómalos ni comportamiento fuera de la distribución de aperturas entrenadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se declaran idiomas soportados ni se proporcionan métricas de calibración de la cabeza de valor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/w2Tao/gomoku-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/w2Tao/gomoku-15x15
- Código fuente: https://github.com/w2Tao/gomoku
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
