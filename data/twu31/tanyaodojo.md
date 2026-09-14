# Twu31/TanyaoDojo

## Resumen

TanyaoDojo es una pila completa de inteligencia artificial para mahjong riichi escrita desde cero en JAX/Flax, que combina un entorno vectorizado, clonacion de comportamiento (behavior cloning, BC) sobre registros de partidas y aprendizaje por refuerzo (RL) auto-jugado. El repositorio de Hugging Face `Twu31/TanyaoDojo` publica exclusivamente los checkpoints resultantes de esa pila, no un modelo de lenguaje: cada checkpoint es una politica que decide acciones de mahjong (descarte, riichi, llamadas) a partir de una observacion tabular del estado de la partida. El desarrollador es el usuario Twu31, con el codigo fuente en `github.com/twu3202/TanyaoDojo`.

El checkpoint principal, `bc_v2_g186.pkl`, es una red de 256 canales por 10 bloques con 12,4 millones de parametros, entrenada con clonacion de comportamiento sobre 10 anos de registros y refinada con learning rate 1e-4. Su medida de referencia es `-4,66 +/- 0,535` puntos de colocacion medios frente a Mortal v4 en un protocolo duplicado 1v3 de 100.000 partidas (16,0 millones de decisiones, cero fallbacks), donde 0 seria paridad exacta con el baseline.

La relevancia actual del repositorio no esta tanto en la fuerza del agente como en la documentacion de resultados negativos: cuatro ejecuciones de RL empeoraron el rendimiento externo porque el objetivo de entrenamiento (fin de episodio tras una sola mano y recompensa por transferencia cruda de puntos) no coincidia con el objetivo de evaluacion (colocacion final en un hanchan completo). El autor publica el diagnostico, el parche de correccion (`jax_rl/reward_placement.py`) y las mediciones posteriores, lo que convierte el repositorio en un caso de estudio util para quien disene recetas de RL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal en JAX/Flax definida como 256 canales x 10 bloques (el detalle exacto de capas no se especifica en la model card) |
| Parametros totales | 12,4 M (`bc_v2_g186.pkl`, `bc_lean_g402.pkl`, `rl_oracle_800m.pkl`); 5,3 M (`bc_lean_w192_ep2.pkl`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume una observacion por decision de forma `34x36 + 32` (obs v2) o `34x20 + 26` (obs lean) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica / no disponible (no procesa lenguaje natural; las observaciones son tensores de estado de mahjong) |
| Licencia | MIT |
| Formato de pesos | Checkpoints `.pkl` (serializacion de Flax/JAX), no safetensors ni GGUF |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | `jax` |
| Pipeline | `reinforcement-learning` |
| Fecha de creacion / actualizacion | 2026-08-20 / 2026-09-14 |

## Arquitectura y entrenamiento

La model card describe la arquitectura unicamente por su configuracion de canales y bloques (`256ch x 10blk` para los checkpoints de 12,4 M de parametros, `192ch x 8blk` para el de 5,3 M), implementada en Flax sobre JAX. La entrada es una codificacion tensorial del estado de la partida en dos variantes: `v2` (`34x36 + 32`) y `lean` (`34x20 + 26`). Se trata, por tanto, de un estimador de politica de accion por decision, no de un transformer generativo ni de un modelo de lenguaje.

El entrenamiento combina dos fases. La primera es clonacion de comportamiento sobre registros de partidas humanas (10 anos de logs para `bc_v2_g186`, 14 anos para `bc_lean_g402`, 6 anos con 2 epocas para `bc_lean_w192_ep2`), seguida en los dos checkpoints mayores de un refinamiento con learning rate 1e-4. La segunda fase es RL auto-jugado: `rl_oracle_800m.pkl` proviene de una liga PPO con critico asimetrico "oracle" (el critico ve las cuatro manos) durante 0,8 mil millones de pasos. Este checkpoint es un resultado negativo deliberadamente publicado: el critico ajusto la funcion de valor unas 100 veces mejor (`v_loss` de 0,102 a 0,001) pero el agente perdio 3,2 puntos de fuerza externa.

La innovacion tecnica destacable es el diagnostico de ese fallo. Los cuatro entrenamientos de RL usaron `round_mode="single"`, que termina el episodio tras una sola mano, con recompensa igual a la transferencia cruda de puntos; la arena, en cambio, puntua un hanchan completo con puntos de colocacion `[90, 45, 0, -135]`. Como `mahjax` escribe `order_points` solo en el `score` final y nunca en `rewards`, el agente optimizaba una funcion sin concepto de cuarto puesto. El autor cuantifica el efecto: 600 pasos x 256 entornos produjeron 1541 episodios con recompensas en `[-120, 130]`. La correccion (`jax_rl/reward_placement.py`) aplica recompensa alineada con la colocacion terminal sobre hanchans completos; el primer resultado tras el arreglo (1B pasos desde la base de `-4,66`, 11 evaluaciones de arena de 1600 partidas) fue `-4,88 +/- 0,81`, estadisticamente plano, con `approx_kl` de ~4e-5 por actualizacion y solo 0,011 de deriva KL tras mil millones de pasos. Para aumentar la densidad de senal se introdujo despues un potencial GRP de 7,5 M de muestras ("posicion -> puntos de colocacion finales esperados"), con recompensa `phi(s') - phi(s)` mas el remanente terminal, invariante de politica por el teorema de shaping, que eleva la fraccion de pasos con recompensa no nula del 0,1% al 1,10%. El primer segmento con shaping cerro a 1,48B pasos con 0,023 de deriva KL (frente a 0,011 a 1B sin shaping) y dos checkpoints adjudicados a 12.000 partidas: `-3,79 +/- 1,54` a 0,54B y `-4,04 +/- 1,54` a 1,48B.

## Capacidades

- Seleccion de acciones de mahjong riichi por decision: descartes, declaracion de riichi, llamadas y demas decisiones cubiertas por la observacion v2 o lean.
- Juego en las cuatro posiciones de la mesa: el protocolo de evaluacion duplicado hace que el challenger ocupe los cuatro asientos sobre muros identicos.
- Decisiones deterministas sin fallbacks: la medicion insignia de 100.000 partidas cubre 16,0 millones de decisiones con cero fallbacks registrados.
- Capacidad de servir como politica de referencia (baseline) para comparaciones internas y como inicializacion para RL posterior.
- Compatibilidad con la pila TanyaoDojo: entorno vectorizado, bucle de auto-juego y utilidades de arena definidos en el repositorio de GitHub.
- No soporta tool calling ni function calling.
- No soporta agentes de proposito general ni razonamiento multi-paso fuera del arbol de decision del juego.
- No dispone de modo "thinking", vision, audio ni generacion de texto.
- Capacidades multilingues: no aplica.
- Capacidad especial documentada: la tasa de eleccion de riichi por decision resulto ser una metrica mucho mas sensible que los cribados de fuerza de 4.000 partidas (20.691 puntos de decision identicos mostraron un desplazamiento de 41,1% a 44,4% mientras las pruebas de fuerza estaban dentro del ruido).

## Casos de uso

- Agente de mahjong riichi para partidas 1v3: el checkpoint `bc_v2_g186.pkl` puede ocupar un asiento frente a tres oponentes con una fuerza medida de `-4,66 +/- 0,535` frente a Mortal v4, lo que lo hace util como sparring de nivel alto pero todavia por debajo del baseline.
- Banco de pruebas para investigacion en RL: el repositorio documenta con detalle un fallo de alineacion entre objetivo de entrenamiento y objetivo de evaluacion, y proporciona el parche `jax_rl/reward_placement.py`, lo que permite reproducir y corregir el mismo error en recetas propias.
- Generacion de datos de entrenamiento por clonacion de comportamiento: los checkpoints sirven como profesores para destilar politicas mas pequenas (como demuestra la linea de 5,3 M de parametros entrenada sobre 6 anos de logs).
- Construccion de arenas de evaluacion: el protocolo duplicado con `seed_key=20260711`, semillas desde 10000 y puntos `[90, 45, 0, -135]` es directamente reutilizable para comparar cualquier agente nuevo contra un baseline fijo.
- Analisis de decisiones en revision de partidas: dado que el modelo puntua y elige acciones por decision, puede emplearse para localizar decisiones discrepantes, como hace el autor con los 20.691 puntos de decision identicos en la comparacion de anclas.
- Punto de partida para optimizacion por RL con shaping: la linea con potencial GRP (7,5 M de muestras, recompensa `phi(s') - phi(s)`) es un ejemplo concreto de como elevar la densidad de recompensa sin cambiar la politica optima.
- Investigacion sobre criticos asimetricos: `rl_oracle_800m.pkl` se publica como control negativo explicito, util para quien quiera estudiar por que un critico con mejor ajuste de valor no se traduce en mejor juego externo.
- Estudio de estabilidad de entrenamiento continuado: el hallazgo del 2026-09-14 (el ancla a la que se apunta determina si el entrenamiento continuado se mantiene o retrocede) es directamente aplicable al diseno de esquemas de anclaje en RL con regularizacion.

## Benchmarks y rendimiento

Protocolo comun a todas las cifras: duplicado 1v3, el aspirante juega los cuatro asientos sobre muros identicos contra tres copias de Mortal v4, `seed_key=20260711`, semillas desde 10000, puntos de colocacion `[90, 45, 0, -135]`. `avg_pt` es la media de puntos de colocacion del aspirante relativa al baseline; 0 significa paridad. No hay datos de MMLU, HumanEval, GSM8K ni benchmarks de NLP, porque no es un modelo de lenguaje.

| Checkpoint | Arquitectura / observacion | Entrenamiento | avg_pt vs Mortal v4 |
|---|---|---|---|
| `bc_v2_g186.pkl` | 256ch x 10blk (12,4 M), obs v2 (`34x36 + 32`) | BC sobre 10 anos de logs + refine LR 1e-4 | -4,66 +/- 0,535 (100.000 partidas, 16,0 M decisiones) |
| `bc_lean_g402.pkl` | 256ch x 10blk (12,4 M), obs lean (`34x20 + 26`) | BC sobre 14 anos de logs + refine LR 1e-4 | -5,07 +/- 1,54 (12.000 partidas) |
| `bc_lean_w192_ep2.pkl` | 192ch x 8blk (5,3 M), obs lean | BC sobre 6 anos de logs, 2 epocas | -8,87 +/- 2,70 (4.000 partidas) |
| `rl_oracle_800m.pkl` | 256ch x 10blk, obs lean (actor) | Liga PPO con critico oracle, 0,8B pasos | -8,38 +/- 2,65 (4.000 partidas), resultado negativo por objetivo mal definido |

Resultados adicionales citados en la model card, no publicados como pesos en este repositorio:

| Modelo / fase | Medicion | Resultado |
|---|---|---|
| Fine-tune online de regresion de valor sobre la pila Mortal, con ancla de valor Q (peso de perdida 0,2); pesos no publicados | 12.000 partidas, protocolo anterior | -0,75 +/- 1,31; diferencia pareada +1,75 (z = 2,58) frente al mejor checkpoint previo (-2,50 en las mismas 12.000, -1,96 a 100.000) |
| Reanudacion del mismo modelo con el ancla apuntando al checkpoint anterior | 20.691 puntos de decision identicos / 12.000 partidas | Tasa de eleccion de riichi 41,1% -> 44,4% (el baseline: 39,0%); diferencia pareada a ~40k pasos -1,26 (z = -1,81) |
| Reanudacion re-anclada al propio checkpoint bueno | 12.000 partidas | Riichi 39,9%; -0,56 en 12.000; diferencia pareada +0,22 (z = 0,36) |
| Comparacion directa de ambas anclas a pasos igualados | - | +1,48 +/- 1,42 (z = 2,05) |
| Primer run de RL tras la correccion de recompensa (1B pasos desde la base de -4,66) | 11 evaluaciones de arena de 1.600 partidas | -4,88 +/- 0,81 (plano frente a la base); `approx_kl` ~4e-5 por actualizacion, 0,011 de deriva KL |
| Run con shaping GRP, 0,54B pasos | 12.000 partidas | -3,79 +/- 1,54 (+0,87 frente a la base) |
| Run con shaping GRP, 1,48B pasos | 12.000 partidas | -4,04 +/- 1,54 (+0,62 frente a la base) |

## Requisitos de hardware

- VRAM para inferencia: muy baja. Con 12,4 M de parametros, los pesos en fp32 ocupan del orden de 50 MB; el checkpoint de 5,3 M ronda los 21 MB. Cualquier GPU consumer dispone de margen sobrado (estimacion a partir del recuento de parametros; no hay cifras de VRAM publicadas).
- GPU recomendadas: no hay requisitos publicados. Por tamano, el modelo es ejecutable en CPU; para auto-juego vectorizado conviene una GPU con buen ancho de banda (serie RTX 30/40, A100, H100) porque el cuello de botella es el entorno vectorizado, no la red.
- Cabe en GPU consumer: si, con amplio margen, incluida cualquier RTX reciente e incluso hardware integrado.
- Opciones de despliegue: JAX/Flax con los checkpoints `.pkl` y la pila TanyaoDojo del repositorio de GitHub. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje ni un transformer generativo.
- Latencia y throughput: no disponibles. La unica cifra relacionada es la cobertura de 16,0 millones de decisiones en la medicion de 100.000 partidas, sin tiempo de pared asociado. El autor menciona ejecuciones de 256 entornos vectorizados en paralelo y una liga PPO de 0,8 mil millones de pasos, pero sin tasas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Fuerza medida |
|---|---|---|---|---|
| TanyaoDojo `bc_v2_g186.pkl` | 12,4 M | Politica BC + refine, JAX/Flax | MIT | -4,66 +/- 0,535 vs Mortal v4 (100.000 partidas) |
| TanyaoDojo `bc_lean_w192_ep2.pkl` | 5,3 M | Politica BC, JAX/Flax | MIT | -8,87 +/- 2,70 vs Mortal v4 (4.000 partidas) |
| TanyaoDojo `rl_oracle_800m.pkl` | 12,4 M | Actor PPO con critico oracle | MIT | -8,38 +/- 2,65 vs Mortal v4 (4.000 partidas) |
| Mortal v4 | No disponible | Baseline open source de mahjong, usado como referencia | No disponible | 0 por definicion del protocolo (referencia) |
| Suphx (Microsoft) | No disponible | Agente de mahjong con RL | No disponible | No disponible |
| NAGA | No disponible | Agente de mahjong comercial | No disponible | No disponible |

La comparacion estrictamente valida que ofrece la model card es interna: `bc_v2_g186.pkl` frente a `bc_lean_g402.pkl` y a `bc_lean_w192_ep2.pkl`, todos medidos con el mismo protocolo. Cualquier comparacion con Suphx, NAGA u otros agentes de mahjong no esta respaldada por datos en la informacion disponible, porque las plataformas y los protocolos de evaluacion difieren.

## Limitaciones y advertencias

- Ningun checkpoint publicado alcanza la paridad con Mortal v4: todos los `avg_pt` son negativos (el mejor, -4,66 +/- 0,535 a 100.000 partidas).
- El modelo mas fuerte de la linea del proyecto no esta en este repositorio: es un fine-tune de regresion de valor sobre la pila Mortal con ancla Q, medido en -0,75 +/- 1,31 a 12.000 partidas, y sus pesos no se publican. Solo se distribuye el parche `patches/anchor_train.patch`.
- La linea JAX fue pausada por el propio autor tras localizar la brecha de rendimiento; el repositorio mezcla checkpoints activos con resultados negativos conservados a proposito.
- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no responde a prompts y no admite tool calling, agentes genericos ni razonamiento multi-paso fuera del juego.
- La estabilidad del entrenamiento continuado depende criticamente del ancla: apuntar al checkpoint anterior arrastro la politica de vuelta en dos horas, con la tasa de riichi pasando de 39,9% a 44,4% en 20.691 decisiones identicas.
- Los cribados de fuerza de 4.000 partidas quedaron dentro del ruido durante la regresion; utilizar solo esa metrica puede ocultar degradaciones reales.
- Los runes de RL anteriores al parche optimizaron una funcion distinta a la evaluada (episodios de una sola mano con recompensa de transferencia cruda de puntos, frente a colocacion en hanchan completo). Cualquier resultado anterior a `jax_rl/reward_placement.py` debe interpretarse con esa cautela.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de NLP, pero no se han publicado analisis de sesgo de la politica (por ejemplo, sesgos derivados de los logs humanos de clonacion) ni auditorias de comportamiento en situaciones atipicas.
- Idiomas y contexto: no aplica; el modelo no consume texto y su "contexto" es una observacion fija por decision, no una ventana ampliable.
- Licencia MIT: permite uso comercial y modificacion sin restricciones mas alla de la atribucion, pero la model card no ofrece garantias de rendimiento ni de idoneidad para produccion.
- Uso en plataformas de mahjong online: no hay ninguna indicacion del autor sobre legalidad o admisibilidad de uso en servicios de terceros; emplearlo contra jugadores humanos puede infringir los terminos de servicio de esas plataformas.
- Reproducibilidad: replicar las cifras exige el baseline Mortal v4, el protocolo duplicado exacto (`seed_key=20260711`, semillas desde 10000, puntos `[90, 45, 0, -135]`) y la pila de entorno del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Twu31/TanyaoDojo
- Repositorio del proyecto: https://github.com/twu3202/TanyaoDojo
- Parche de anclaje de entrenamiento: `patches/anchor_train.patch` (dentro del repositorio de GitHub)
- Recompensa alineada con colocacion: `jax_rl/reward_placement.py` (dentro del repositorio de GitHub)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
