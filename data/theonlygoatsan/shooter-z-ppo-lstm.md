# TheOnlyGoatsan/shooter-z-ppo-lstm

## Resumen

Shooter Z es un agente de aprendizaje por refuerzo profundo entrenado con RecurrentPPO (stable-baselines3 / sb3-contrib) para jugar a un shooter de arena 1v1 en primera persona. Lo desarrolla el autor independiente TheOnlyGoatsan (@_goatsan) como oponente de la IA del juego open source Shooter Z, creado para la serie BULSHY.FM. No es un modelo de lenguaje: es una política neuronal que recibe observaciones estructuradas del entorno y emite acciones de juego a 20 Hz.

El agente percibe el mundo mediante 256 rayos etiquetados (lo que vería un jugador, sin visión a través de paredes), mantiene memoria de la partida con una LSTM de 256 unidades y decide 20 veces por segundo. El checkpoint publicado es `A-curriculum@34.0M`, es decir, 34.007.040 decisiones de entrenamiento acumuladas. La red tiene aproximadamente 1,9 millones de pesos y se distribuye en formato ONNX y como modelo SB3 (`final.zip`).

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de RL con memoria recurrente y self-play, con política exportada a ONNX lista para inferencia en un motor de juego. Es un artefacto de investigación y demostración, no un componente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red densa (encoder 2874 -> 256 -> 256) + LSTM de 256 unidades + cabezas actor y crítico de 128 |
| Parametros totales | Aproximadamente 1,9 M de pesos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; memoria recurrente LSTM (estado h, c de 256) reiniciada al inicio de cada partida |
| Tipos de cuantizacion | No disponible (se distribuye en float32 para ONNX y como modelo SB3) |
| Idiomas soportados | No aplica (agente de RL, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`policy.onnx`) y modelo SB3 (`final.zip`) |

## Arquitectura y entrenamiento

La política es una red recurrente con encoder de dos capas densas (2874 -> 256 -> 256) seguido de una LSTM de 256 unidades y dos cabezas separadas, actor y crítico, de 128 unidades cada una. La entrada `obs` es un vector float32 de 2874 dimensiones (percepción por rayos más estado del entorno); la salida `logits` es un vector de 40 dimensiones que codifica 9 partes de acción consecutivas, con el decodificado descrito en `policy.json`. El estado recurrente (`h`, `c`, de forma [1, batch, 256]) debe inicializarse a cero al comienzo de cada partida y realimentarse en cada decisión.

El entrenamiento usa RecurrentPPO de sb3-contrib 2.9.2 con un currículo progresivo: primero objetivos estáticos cercanos, luego lejanos, después objetivos móviles y finalmente bots heurísticos en orden Easy -> Normal -> Hard. La función de recompensa otorga +/-10 por victoria/derrota, +/-0,01 por punto de vida infligido o recibido, y penalizaciones pequeñas por disparos desperdiciados y periodos largos de inactividad (detallado en `reward.json`). El checkpoint publicado acumula 34.007.040 decisiones de entrenamiento; la model card menciona además un checkpoint intermedio `A-curriculum@28.0M` usado como referencia en el benchmark. No se documentan datos sobre self-play efectivo más allá de la mención en las etiquetas.

## Capacidades

- Control de agente en un shooter de arena 1v1 en primera persona: apuntado, movimiento y disparo a 20 decisiones por segundo.
- Percepción limitada a 256 rayos etiquetados, sin acceso a información oculta del mapa (sin wall hacks).
- Memoria de partida mediante LSTM: mantiene estado interno entre decisiones dentro de un mismo encuentro.
- Política determinista exportada a ONNX con entradas y salidas explícitas, apta para inferencia embebida en un motor de juego.
- Decodificado de 9 partes de acción a partir de 40 logits, documentado en `policy.json`.
- No soporta tool calling, function calling, agentes multi-paso genéricos, texto, visión por imagen, audio ni capacidades multilingües.

## Casos de uso

- Oponente de IA en Shooter Z: el modelo se integra directamente en el juego como rival 1v1, inicializando `h` y `c` a cero al inicio de cada partida y realimentando el estado recurrente en cada decisión a 20 Hz.
- Referencia reproducible de RecurrentPPO: sirve para estudiar un pipeline completo de RL con memoria LSTM, currículo y exportación a ONNX, replicable con stable-baselines3 y sb3-contrib.
- Evaluación de currículos de entrenamiento: el par de checkpoints (@28.0M y @34.0M) y los datos de `bench.json` permiten analizar el efecto del currículo sobre la tasa de victoria frente a bots heurísticos de distinta dificultad.
- Base para fine-tuning en entornos de disparo similares: la arquitectura encoder-LSTM-cabezas puede reutilizarse cambiando la dimensionalidad de observación y acción para otros juegos de acción con observaciones vectoriales.
- Pruebas de integración de inferencia ONNX en motores de juego: el contrato de entradas (`obs`, `h`, `c`) y salidas (`logits`, `h_out`, `c_out`) es un caso práctico para validar pipelines de inferencia en tiempo real con estado recurrente.
- Docencia y divulgación de RL: ejemplo compacto (1,9 M de pesos) de agente con percepción limitada, recompensa multiobjetivo y benchmark con intervalos de confianza.

## Benchmarks y rendimiento

Benchmark del autor: 100 partidas fijas por oponente (semillas 5000-5099), solo mejores acciones, primero en llegar a 10 eliminaciones, límite de 3 minutos.

| Oponente | Tasa de victoria | Rango 95% | Kill share | K/D | Headshots |
|---|---|---|---|---|---|
| Easy bots | 52% | 42%-62% | 73% | 2,73 | 30% |
| Normal bots | 25% | 18%-34% | 61% | 1,56 | 29% |
| Hard bots | 26% | 18%-35% | 62% | 1,63 | 26% |
| vs A-curriculum@28.0M | no concluyente (límite de tiempo) | no disponible | 59% | no disponible | no disponible |

Kill share = eliminaciones del modelo / eliminaciones totales de la partida (50% = equilibrio). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con aproximadamente 1,9 M de pesos en float32 el modelo ocupa del orden de 8 MB, más el estado recurrente por instancia (2 x 256 float32).
- GPU recomendadas: cualquier GPU moderna es sobrada; el cuello de botella será el motor del juego, no la red. Una RTX 4090 o una A100 no aportan ventaja frente a una GPU de gama media para esta carga.
- Cabe en cualquier GPU consumer, e incluso la inferencia en CPU es viable dado el tamaño y la frecuencia de decisión (20 Hz).
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) o carga del modelo SB3 (`final.zip`) con stable-baselines3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; el diseño fija 20 decisiones por segundo por agente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shooter Z PPO+LSTM | RecurrentPPO (SB3) para FPS 1v1 | ~1,9 M | LSTM 256 | MIT | ONNX + SB3 en Hugging Face |
| A-curriculum@28.0M | Checkpoint intermedio del mismo entrenamiento | ~1,9 M | LSTM 256 | MIT | Referenciado en la model card; no se confirma su publicación |
| Bots heurísticos Easy/Normal/Hard | Reglas programadas del juego | No aplica | No aplica | No disponible | Incluidos en el juego |

No se dispone de información sobre otros agentes de RL comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo funciona en el entorno Shooter Z con el contrato exacto de observación de 2874 dimensiones y 9 partes de acción; no es reutilizable sin reentrenamiento.
- Rendimiento modesto frente a bots Normal y Hard (25% y 26% de victorias), con intervalos de confianza amplios; frente a Easy la ventaja es clara pero no dominante (52%).
- El enfrentamiento contra el checkpoint @28.0M no se resolvió por límite de tiempo, por lo que no hay evidencia de mejora clara entre ambos checkpoints en ese enfrentamiento.
- Dependencia del estado recurrente: un uso incorrecto de `h` y `c` (no reiniciar al inicio de partida o no realimentar las salidas) degrada el comportamiento.
- El benchmark se realizó solo con mejores acciones; el comportamiento con muestreo estocástico no está caracterizado.
- Riesgo de sobreajuste al currículo y a los bots heurísticos concretos usados en entrenamiento; la generalización a jugadores humanos no está evaluada.
- Sin datos publicados sobre sesgos, robustez ante observaciones ruidosas o adversarias, ni comportamiento fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright; no se documentan restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheOnlyGoatsan/shooter-z-ppo-lstm
- Código del proyecto: https://github.com/GOATsann/goatsan-lab (carpeta `shooter-z-fps/`)
- stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- sb3-contrib: https://github.com/Stable-Baselines-Team/stable-baselines3-contrib
- ONNX Runtime: https://onnxruntime.ai/
