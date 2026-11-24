# tomoniyukiwo/maze-lunar-rl

## Resumen

`tomoniyukiwo/maze-lunar-rl` es un repositorio de políticas de aprendizaje por refuerzo (RL) entrenadas desde cero, sin datos de demostración ni imitación, sobre dos entornos clásicos de Gymnasium: MiniGrid (versiones `Empty-Random-6x6` y `DoorKey-5x5`) y LunarLander-v3 en su variante de acciones continuas. El autor, tomoniyukiwo, publica tanto los pesos como el código de entrenamiento y evaluación, además de las métricas intermedias por paso de entorno.

No se trata de un modelo de lenguaje ni de una red neuronal de gran tamaño: son políticas tabulares (Q-learning y Dyna-Q) para MiniGrid y políticas neuronales PPO y SAC serializadas con Stable-Baselines3 para LunarLander. El repositorio es relevante como material reproducible y didáctico de RL comparado: fija tres semillas de entrenamiento (42, 43, 44), evalúa 30 episodios por condición y publica los resultados en `summary.csv` y `metrics.jsonl`.

El tamaño del repositorio es de 0.0 GB, sin descargas ni likes en el momento de la consulta, y la licencia no está declarada. Su interés práctico es acotado: sirve como referencia de comparación de algoritmos en entornos de control y como base reproducible, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular y Dyna-Q (MiniGrid); PPO y SAC con políticas neuronales (LunarLander) |
| Parametros totales | no disponible (políticas pequeñas; no se publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entornos de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.json.gz` (tablas Q y de transiciones), `policy.zip` (Stable-Baselines3) |
| Libreria | stable-baselines3 |
| Entornos | MiniGrid-Empty-Random-6x6-v0, MiniGrid-DoorKey-5x5-v0, LunarLander-v3 (continuous=True) |
| Semillas de entrenamiento | 42, 43, 44 |
| Pasos de entorno | 80.000 por semilla y laberinto; 300.032 por semilla en LunarLander |

## Arquitectura y entrenamiento

En MiniGrid se emplean dos métodos tabulares sobre la observación completa del tablero: Q-learning, que actualiza la tabla Q a partir de la recompensa de meta, y Dyna-Q, que además realiza 20 actualizaciones adicionales por cada paso de entorno usando las transiciones registradas de la propia experiencia. No hay red neuronal ni generalización entre estados: la política es una tabla indexada por estado y acción.

En LunarLander-v3 con `continuous=True` se entrenan dos políticas con Stable-Baselines3: PPO y SAC, sobre las observaciones numéricas y la función de recompensa estándar del entorno. El entrenamiento usa 300.032 pasos de entorno por semilla y tres semillas. No se emplearon datos de profesor, demostraciones ni aprendizaje por imitación en ninguno de los dos entornos. La evaluación final se realiza sobre 30 episodios por condición y semilla.

## Capacidades

- Control de agente en laberintos discretos de MiniGrid con observación completa del tablero.
- Resolución del entorno `DoorKey-5x5`, que requiere recoger una llave y abrir una puerta antes de alcanzar la meta.
- Control continuo de aterrizaje en LunarLander-v3 (empuje principal y lateral, orientación).
- Políticas deterministas o estocásticas según el algoritmo (PPO y SAC en SB3); no hay modo de razonamiento ni tool calling.
- Reproducibilidad: código de entrenamiento, evaluación y generación de GIF incluidos en el repositorio.
- No soporta tool calling, function calling, agentes multi-paso basados en lenguaje, multilingüismo ni visión.

## Casos de uso

- Docencia de RL comparado: usar los pares Q-learning/Dyna-Q y PPO/SAC como ejemplo reproducible de la diferencia entre métodos tabulares con y sin modelo, y entre on-policy y off-policy en control continuo.
- Reproducción de resultados: ejecutar `run.py` con las semillas 42, 43 y 44 para regenerar `summary.csv` y contrastar las cifras publicadas.
- Análisis de eficiencia muestral: comparar la curva de `metrics.jsonl` de PPO y SAC en LunarLander para estudiar el coste computacional de SAC (1.766,77 s de media por semilla frente a 120,61 s de PPO).
- Generación de vídeos de evaluación: cargar `lunar/sac-44/policy.zip` con `SAC.load` y `save_demo` para producir GIF de un episodio con semilla de entorno 20.000.
- Base para experimentos de ablación: modificar el número de actualizaciones de Dyna-Q (20 por defecto) o el presupuesto de pasos y medir el efecto en la tasa de éxito y en el número medio de pasos.
- Punto de partida para transferencia o ajuste fino: reutilizar la política SAC como inicialización en variantes del entorno, teniendo en cuenta que el autor advierte que no se ha evaluado con cambios de física, recompensa o tamaño de tablero.

## Benchmarks y rendimiento

Resultados publicados por el autor (media de 3 semillas, 30 episodios de evaluación por condición):

| Entorno | Método | Tasa de éxito | Pasos medios en éxito |
|---|---|---:|---:|
| MiniGrid Empty-Random-6x6 | Q-learning | 100% (90/90) | 4,47 |
| MiniGrid Empty-Random-6x6 | Dyna-Q | 100% (90/90) | 4,40 |
| MiniGrid DoorKey-5x5 | Q-learning | 100% (90/90) | 9,82 |
| MiniGrid DoorKey-5x5 | Dyna-Q | 100% (90/90) | 10,30 |

| Método | Recompensa media seed 42 | seed 43 | seed 44 | Media 3 semillas | Tasa de terminación con recompensa positiva | Tiempo medio por semilla |
|---|---:|---:|---:|---:|---:|---:|
| PPO | -5,72 | 151,01 | -64,95 | 26,78 | 41,1% (37/90) | 120,61 s |
| SAC | 266,88 | 231,53 | 278,97 | 259,13 | 95,6% (86/90) | 1.766,77 s |

La diferencia media de recompensa entre SAC y PPO es de 232,35 puntos a favor de SAC, con un coste de tiempo de ejecución aproximadamente 14,65 veces mayor. El tiempo incluye evaluación y guardado de artefactos. No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: suficiente para todas las políticas del repositorio; el autor ejecuta la carga de SAC con `device="cpu"` y el entorno en modo `SDL_VIDEODRIVER=dummy`.
- VRAM: no aplica; no se requiere GPU para cargar `policy.zip` ni `model.json.gz`.
- GPU recomendadas: no disponible; no se documenta entrenamiento en GPU ni requisitos de memoria.
- GPU de consumo: irrelevante para la inferencia; el cuello de botella es el paso del simulador (Box2D para LunarLander, MiniGrid en Python).
- Despliegue: no se contemplan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo generativo. La ejecución se realiza con Python 3.12, Stable-Baselines3 y Gymnasium sobre Ubuntu 24.04.
- Latencia y throughput: no disponibles de forma desagregada; el único dato publicado es el tiempo medio de ejecución por semilla (120,61 s PPO, 1.766,77 s SAC), que incluye entrenamiento o evaluación completos según la configuración del script.

## Comparativa con modelos similares

No existe una categoría de "modelos comparables" en el sentido de pesos preentrenados: la comparación relevante es entre los propios algoritmos del repositorio y frente a políticas de referencia de la literatura de RL.

| Alternativa | Tipo | Entorno | Resultado publicado | Licencia |
|---|---|---|---|---|
| Q-learning (este repo) | Tabular, sin modelo | MiniGrid Empty y DoorKey | 100% éxito; 4,47 y 9,82 pasos | no disponible |
| Dyna-Q (este repo) | Tabular, con modelo | MiniGrid Empty y DoorKey | 100% éxito; 4,40 y 10,30 pasos | no disponible |
| PPO (este repo) | On-policy, red neuronal | LunarLander-v3 continuo | 26,78 recompensa media; 41,1% positivos | no disponible |
| SAC (este repo) | Off-policy, red neuronal | LunarLander-v3 continuo | 259,13 recompensa media; 95,6% positivos | no disponible |
| Políticas de referencia de SB3 RL Zoo | PPO/SAC preentrenados | LunarLander y otros | no disponible en la información proporcionada | MIT (según SB3, no verificado aquí) |

No se dispone de datos para comparar con políticas de terceros en los mismos entornos y semillas.

## Limitaciones y advertencias

- Alcance muy restringido: las políticas solo se han evaluado en las configuraciones exactas de entorno descritas; el autor indica que no se ha medido el rendimiento con cambios de tamaño de tablero, física o recompensa.
- Sin licencia declarada: no se puede asumir permiso de uso comercial, redistribución ni modificación; es necesario contactar con el autor antes de cualquier uso en producción.
- Sin idiomas ni texto: no es un modelo de lenguaje; no admite prompts, tool calling ni razonamiento simbólico.
- Varianza alta en PPO: recompensas medias por semilla de -5,72, 151,01 y -64,95, lo que indica inestabilidad del entrenamiento con la configuración publicada.
- Coste de SAC: 1.766,77 s por semilla frente a 120,61 s de PPO, lo que limita su uso en bucles de experimentación rápidos.
- Las tablas Q y de transiciones crecen con el espacio de estados; en MiniGrid con observación completa del tablero la generalización a tamaños mayores no está garantizada.
- Riesgo de sobreajuste a las semillas de evaluación: solo tres semillas de entrenamiento y 30 episodios por condición, sin intervalos de confianza publicados.
- Repositorio sin descargas ni validación externa en el momento de la consulta; los resultados no han sido replicados por terceros de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomoniyukiwo/maze-lunar-rl
- MiniGrid (documentación): https://minigrid.farama.org/
- Gymnasium LunarLander: https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Stable-Baselines3: https://stable-baselines3.readthedocs.io/
- Archivos internos citados en la model card: `summary.csv`, `*/metrics.jsonl`, `lunar/*/policy.zip`, `empty/*/model.json.gz`, `doorkey/*/model.json.gz`, `run.py`, `maze.py`, `lunar.py`, `requirements.txt`, `setup.sh`
