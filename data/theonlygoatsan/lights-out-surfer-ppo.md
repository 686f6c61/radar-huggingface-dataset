# TheOnlyGoatsan/lights-out-surfer-ppo

## Resumen

Lights-Out Surfer es un agente de aprendizaje por refuerzo entrenado con PPO para jugar a un endless runner de tres carriles con trenes, barreras, monedas y acciones de salto y voltereta. Lo desarrolla TheOnlyGoatsan como oponente controlado por IA dentro del videojuego open source Lights-Out Surfer, asociado a la serie BULSHY.FM y jugable en el navegador. No es un modelo de lenguaje: es una política de control que mapea una observación estructurada del estado del juego a una de cinco acciones discretas.

El modelo resuelve un problema acotado de toma de decisiones secuenciales en tiempo real: sobrevivir y maximizar puntuación en un entorno con dificultad creciente y sin techo. Su interés practico esta en que sirve como ejemplo completo y reproducible de un pipeline de RL aplicado (entorno Node, entrenamiento con Stable-Baselines3, exportación a ONNX para inferencia en navegador y verificación de paridad entre runtimes), no en sus capacidades generales.

La arquitectura es una MLP de 256x256 para actor y critico, con observación de 1074 valores float32 y salida de 5 logits. Se publican tres variantes exportadas a ONNX según el nivel de dificultad inicial (easy, normal, hard), además del modelo SB3 original en `final.zip`. El repositorio no ocupa espacio apreciable (0.0 GB reportados) y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con actor y critico separados, 256x256, entrenada con PPO (Stable-Baselines3 2.9.2) |
| Parametros totales | no disponible (no se publica el recuento; la arquitectura 256x256 con entrada de 1074 y salida de 5 implica del orden de centenares de miles de pesos, sin cifra oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación fija de 1074 valores float32 por paso |
| Tipos de cuantizacion | no disponible (solo se publican pesos ONNX en float32 y el `.zip` de SB3) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`policy-hard.onnx`, `policy-normal.onnx`, `policy-easy.onnx`) y `.zip` de Stable-Baselines3 (`final.zip`) |

## Arquitectura y entrenamiento

La política es una red neuronal fully connected con dos cabezas (actor y critico) de 256x256, entrenada con Proximal Policy Optimization mediante Stable-Baselines3 2.9.2. La observación codifica lo que veria un jugador: una rejilla de 3 carriles por 32 filas hacia delante (3 metros por fila) con 11 tipos de objeto, más 18 valores sobre el corredor (carril, altura, velocidad, power-ups y dificultad), sumando 1074 valores float32. El perseguidor que va detrás del corredor se oculta deliberadamente al agente, igual que a un jugador que no mira atrás. La salida son 5 logits correspondientes a las acciones nada, izquierda, derecha, salto y voltereta, y en inferencia se aplica argmax.

El entrenamiento se realizo con 192 partidas en paralelo servidas por un servidor de juego en Node, con un nivel de dificultad inicial aleatorio por partida, hasta 55 millones de decisiones (alrededor de una hora en un portatil). La función de recompensa esta documentada en `reward.json`: +0.1 por metro, -1 por tropiezo, -10 al terminar la partida y -0.02 por cambio de carril invertido o salto/voltereta inútil. No se menciona RLHF, DPO ni ajuste posterior; es RL puro sobre recompensa densa diseñada a mano. Las tres variantes ONNX corresponden a distintos puntos de entrenamiento: 15M decisiones (easy), 27.5M (normal) y 55M (hard, el modelo final).

## Capacidades

- Control de agente en un entorno de endless runner de tres carriles con acciones discretas (nada, izquierda, derecha, salto, voltereta).
- Toma de decisiones en tiempo real a partir de una representación estructurada del estado del juego (rejilla 3x32 con 11 tipos de objeto más 18 valores del corredor).
- Generalización a pistas no vistas durante el entrenamiento, evaluada sobre 100 semillas fijas (1000-1099) en cada nivel de dificultad.
- Inferencia en navegador mediante ONNX con salida determinista por argmax.
- Verificación de paridad entre runtimes: cada política incluye un `_parity.json` con 50 observaciones y las acciones que elige PyTorch, para validar otra implementación.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Oponente integrado en el videojuego: los tres archivos ONNX se cargan en el navegador y actúan como rival controlado por IA en theonlygoatsan.com, con dificultad ajustable según la variante elegida.
- Referencia reproducible de RL aplicado: el paquete incluye recompensa documentada (`reward.json`), modelo SB3 (`final.zip`) y resultados por pista (`bench.csv`), lo que permite reentrenar o modificar la función de recompensa y comparar contra la línea base publicada.
- Validación de pipelines de exportación a ONNX: el archivo `_parity.json` permite comprobar que un runtime distinto (onnxruntime-web, TensorRT, etc.) reproduce exactamente las acciones de PyTorch sobre 50 observaciones.
- Docencia y divulgación: es un ejemplo compacto de bucle completo entorno-servidor-entrenamiento-exportación, con un coste de cómputo de aproximadamente una hora en un portatil, adecuado para talleres prácticos de refuerzo.
- Pruebas de estrés de motores de juego: al jugar de forma determinista sobre semillas fijas, sirve para detectar regresiones de física o de generación procedural comparando puntuaciones entre versiones del juego.
- Benchmark de entornos de simulación en Node: el servidor que ejecuta 192 partidas en paralelo puede reutilizarse como banco de pruebas para medir latencia y throughput de un entorno no-Python conectado a Stable-Baselines3.

## Benchmarks y rendimiento

Resultados publicados por el autor con reglas v4: 100 pistas idénticas (semillas 1000-1099) por nivel de dificultad inicial, acciones deterministas, límite de 30 minutos y puntuación propia del juego (metros más monedas).

| Nivel inicial | Media ± IC 95% | Mediana de supervivencia |
|---|---|---|
| Easy | 27.478 ± 1.299 | 14 min |
| Normal | 24.296 ± 1.182 | 11,6 min |
| Hard | 20.965 ± 1.087 | 9,5 min |

El autor indica que la dificultad crece sin techo durante la partida, por lo que toda partida termina y la mayoría acaba chocando de frente contra un tren. Los resultados por pista y por nivel están en `bench.csv` y `bench_<steps>.csv`. No se han publicado comparaciones con otros agentes o modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; la red 256x256 con entrada de 1074 valores ocupa del orden de unos pocos MB en float32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna sirve para inferencia en tiempo real. En el navegador se ejecuta vía ONNX (por ejemplo, onnxruntime-web).
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3050, RTX 4090, etc.), aunque no es necesario.
- Opciones de despliegue: ONNX Runtime (incluido onnxruntime-web para navegador), Stable-Baselines3 para cargar `final.zip` y continuar entrenamiento, y cualquier runtime compatible con ONNX para verificación de paridad.
- Latencia y throughput: no disponibles de forma oficial. El entrenamiento completo de 55M decisiones tardo aproximadamente una hora en un portatil según el autor; la inferencia por paso es de un único forward pass de una MLP pequeña.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lights-Out Surfer PPO (este) | Política RL para endless runner | no disponible (MLP 256x256) | Observación fija de 1074 valores | MIT | Hugging Face, 0 descargas |
| Agentes PPO de Atari (SB3 zoo) | Política RL para videojuegos | del orden de millones (CNN Nature) | Observación de píxeles | MIT | SB3 zoo |
| Agentes RL para Chrome Dino / runners | Políticas RL específicas de juego | variable, no estandarizado | Variable según implementación | variable | Repositorios comunitarios |

No se dispone de comparaciones cuantitativas publicadas frente a estos u otros agentes en la información proporcionada; la comparación es únicamente cualitativa por categoría y licencia.

## Limitaciones y advertencias

- Especialización total: la política solo funciona en Lights-Out Surfer con reglas v4; cualquier cambio en la observación, en el conjunto de acciones o en la física del juego invalida el modelo.
- Sin capacidades de lenguaje, visión ni razonamiento general; no debe evaluarse con benchmarks de LLM.
- Sesgo de entrenamiento: el agente se entreno con dificultad inicial aleatoria y recompensa diseñada a mano, lo que puede favorecer comportamientos concretos (por ejemplo, evitar cambios de carril invertidos) y penalizar estrategias alternativas igualmente válidas.
- Riesgo de sobreajuste a las semillas de evaluación: los resultados se reportan sobre 100 semillas fijas; el rendimiento en pistas generadas con otras distribuciones no está documentado.
- Toda partida termina por diseño, ya que la dificultad crece sin techo; las puntuaciones no deben interpretarse como rendimiento sostenido indefinido.
- El perseguidor está oculto al agente, lo que limita su capacidad de reaccionar a esa amenaza por diseño.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; el código de entrenamiento (github.com/GOATsann/goatsan-lab) figura como "public soon", por lo que la reproducibilidad completa aún no está garantizada.
- El tamaño del repositorio se reporta como 0.0 GB, lo que puede indicar un empaquetado incompleto o una métrica redondeada; conviene verificar los archivos antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheOnlyGoatsan/lights-out-surfer-ppo
- Juego en navegador: https://theonlygoatsan.com
- Repositorio de código (anunciado como público próximamente): https://github.com/GOATsann/goatsan-lab
- Perfil del autor: https://huggingface.co/TheOnlyGoatsan
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- ONNX Runtime: https://onnxruntime.ai
