# yotisstudios/RaifuWars-RL-ActionScorer-Cover

## Resumen

RaifuWars-RL-ActionScorer-Cover es un modelo de aprendizaje por refuerzo (RL) desarrollado por Yotis Studios para jugar a Raifu Wars, un juego de estrategia por turnos, a través del protocolo Warrior. Se trata de una política PPO con 58.114 parámetros entrenada durante 8 horas contra un oponente greedy en el simulador Hemlock. El modelo se publica explícitamente como un **resultado negativo**: el experimento que pretendía probar si añadir características de terreno (cobertura) mejoraría el rendimiento en tableros con mucha vegetación no llegó a probar esa hipótesis, porque el simulador no enviaba el mapa al estado de la política, dejando las tres nuevas características constantemente a cero.

La relevancia de este modelo no está en su capacidad de juego (que es indistinguible del azar, con un 23% de victorias frente al 25% esperado), sino en la evidencia que aporta sobre un fallo de percepción en el pipeline sim-to-real: el simulador tiene árboles que afectan a las tiradas, pero la política no tiene ningún canal para verlos. El checkpoint demuestra que las características de terreno nunca recibieron gradiente y que la red es funcionalmente idéntica a su predecesor `ppo-sim` con un seed distinto. Publicar este tipo de resultados negativos es valioso para la comunidad, ya que invalida una clase de conclusiones sobre el rendimiento en tableros con cobertura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (tipo no especificado en la documentacion; probablemente MLP) |
| Parametros totales | 58.114 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (checkpoints .pt: `best.pt` y `last.pt`) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la documentacion, pero por el tamano (58.114 parametros) y el contexto de RL para un juego de tablero, se trata de una red feedforward pequena que procesa un vector de estado de 35 features (33 base + 2 de cobertura) y produce 28 logits de accion (27 base + 1 de cobertura). El entrenamiento uso PPO con learning rate 5e-5, 6 entornos x 192 pasos, batch de 128, contra un oponente greedy programado, durante 9.127 updates (10.514.304 decisiones de agente) en el simulador Hemlock, una reimplementacion del juego.

La innovacion tecnica clave es el analisis de pesos: al comparar `best.pt` (update 5.835) con `last.pt` (update 9.127), las columnas correspondientes a las tres features de terreno (`cover_density`, `cover_here`, `dest_cover`) muestran un cambio absoluto medio de 0.0, mientras que las demas columnas se movieron entre 2.0e-02 y 7.5e-03. Esto confirma que esas features nunca recibieron gradiente porque su entrada era siempre cero. El simulador envia en el payload del tablero solo `width`, `height` y `points`, sin el mapa ASCII que el juego real incluye, por lo que el codigo que deriva la cobertura del renderizado ASCII no tenia datos que procesar.

## Capacidades

- Jugar partidas de Raifu Wars contra la IA integrada del juego, aunque con un rendimiento no distinguible del azar (23% de victorias en 48 partidas, p=0.68).
- Procesar un estado de 35 features numericas (posiciones, hit_chance, etc.) y emitir una accion entre 28 posibles.
- Funcionar como un agente RL basico en el simulador Hemlock, donde alcanza un 79% de victorias contra bots greedy en el tablero Arboretum (aunque ese numero es enganoso, como se explica en limitaciones).
- No tiene capacidades de generacion de texto, tool calling, vision, audio ni razonamiento multimodal. Es un modelo puramente de decision para un dominio cerrado.

## Casos de uso

- **Investigacion en sim-to-real**: el modelo sirve como evidencia de que un simulador puede omitir informacion perceptual critica (el mapa) sin que el agente lo detecte. Se puede usar para estudiar como detectar y diagnosticar fallos de representacion en pipelines de RL.
- **Validacion de hipotesis en RL**: dado que el experimento no probo la hipotesis original (que las features de terreno mejorarian el rendimiento en tableros con cobertura), este checkpoint puede usarse como control negativo en experimentos futuros que si implementen correctamente la percepcion del terreno.
- **Ablacion de features**: las tres features muertas actuan como una ablacion natural. Comparar este modelo con uno que tenga features de terreno activas permite aislar el efecto de la informacion de cobertura.
- **Estudio de inicializacion y seeds**: al ser funcionalmente identico a `ppo-sim` con un seed distinto, permite analizar la varianza entre seeds en entrenamientos PPO con el mismo configuracion.
- **Prueba de protocolos de comunicacion**: el modelo puede usarse para verificar que el protocolo Warrior transmite correctamente el estado del tablero, ya que la ausencia del mapa en el payload del simulador es un fallo de protocolo detectable.
- **Benchmark de simuladores**: comparar el rendimiento de este modelo en el simulador (79% en Arboretum) frente al juego real (12%) demuestra que el simulador no es fiel para tableros con cobertura, lo que lo convierte en un caso de prueba para validar la calidad de simuladores de juegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. Los resultados relevantes son de partidas contra la IA integrada del juego real y contra bots greedy en el simulador. Se presentan a continuacion.

**Partidas reales contra la IA integrada (16 partidas por tablero, chance 25%):**

| Tablero | Este modelo | `ppo-sim` | `ppo-selfplay` |
|---|---|---|---|
| Arboretum | 2/16 (12%) | 13% (40 partidas) | 8/16 (50%) |
| Islands | 0/16 (0%) | no evaluado | 5/16 (31%) |
| Crossroads | 9/16 (56%) | 68% (40 partidas) | 69% |
| **Total** | **11/48 (23%)** | — | 24/48 (50%) |

**Partidas en simulador contra tres bots greedy (400 partidas por politica, tablero Arboretum):**

| Politica | Simulador | Juego real |
|---|---|---|
| Este modelo | 79.0% | 12% |
| `ppo-selfplay` | 78.0% | 50% |
| `ppo-selfplay2` | 78.5% | 12% |
| `ppo-bignet` | 75.8% | 12% |
| `ppo-sim` | 73.8% | 13% |

El rendimiento global del 23% no es estadisticamente distinguible del azar (p=0.68). En el tablero Arboretum, el que este modelo pretendia mejorar, obtiene un 12% frente al 13% de `ppo-sim`, lo que confirma que las features de terreno no tuvieron efecto.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB. Con 58.114 parametros en float32, el modelo ocupa aproximadamente 232 KB. Cualquier GPU moderna, incluso integradas, puede ejecutarlo sin problemas.
- **GPU recomendadas**: no se requiere ninguna GPU especifica. Una CPU moderna es suficiente para inferencia en tiempo real (el entrenamiento alcanzo ~421 pasos/segundo en hardware no especificado).
- **Compatibilidad con GPU de consumo**: si, cualquier GPU con al menos 1 GB de VRAM (practicamente todas).
- **Opciones de despliegue**: al ser un checkpoint de PyTorch, se puede cargar directamente con `torch.load()`. No se mencionan integraciones con vLLM, Ollama o llama.cpp, que son para modelos de lenguaje. Para usarlo en el juego, se integraria via el protocolo Warrior.
- **Latencia y throughput**: no se han publicado mediciones de latencia de inferencia, pero dado el tamano, la latencia es del orden de microsegundos en CPU y nanosegundos en GPU.

## Comparativa con modelos similares

Los unicos modelos comparables son los otros checkpoints del mismo proyecto, todos con la misma arquitectura base (33/27 features) y entrenados con PPO. No hay modelos de terceros para Raifu Wars publicados.

| Modelo | Parametros | Features de estado/accion | Rendimiento real (total) | Rendimiento sim (Arboretum) | Notas |
|---|---|---|---|---|---|
| Este modelo | 58.114 | 35/28 (3 muertas) | 23% | 79.0% | Resultado negativo, features de terreno inactivas |
| `ppo-sim` | ~57.000 (estimado) | 33/27 | no reportado (13% en Arboretum) | 73.8% | Predecesor, sin features de terreno |
| `ppo-selfplay` | ~57.000 (estimado) | 33/27 | 50% | 78.0% | Entrenado con selfplay, mejor rendimiento real |
| `ppo-bignet` | no disponible | 33/27 | no reportado (12% en Arboretum) | 75.8% | Variante con red mas grande |

La comparacion muestra que el rendimiento en el simulador no correlaciona con el del juego real en tableros con cobertura, lo que refuerza la conclusion de que el simulador no representa el terreno.

## Limitaciones y advertencias

- **Features de terreno muertas**: las tres features de cobertura (`cover_density`, `cover_here`, `dest_cover`) son constantemente cero durante todo el entrenamiento, por lo que el modelo es funcionalmente identico a una red sin ellas. No debe interpretarse como un agente consciente de la cobertura.
- **Rendimiento no distinguible del azar**: con un 23% de victorias frente al 25% esperado por azar, el modelo no es util para jugar partidas reales de forma competitiva.
- **Fallo de simulacion**: el simulador Hemlock no envia el mapa en el estado, por lo que los resultados obtenidos en el simulador (79% en Arboretum) son enganosos y no deben usarse para evaluar la calidad de la politica en el juego real.
- **Sesgos y alucinaciones**: al ser un modelo RL de decision, no genera texto, por lo que no aplican sesgos de lenguaje ni alucinaciones. Sin embargo, su comportamiento esta sesgado por el oponente greedy contra el que se entreno, y puede no generalizar a otros estilos de juego.
- **Licencia GPL-3.0**: el uso comercial del modelo y sus derivados esta sujeto a los terminos de la GPL-3.0, que requieren que las obras derivadas se distribuyan bajo la misma licencia.
- **Sin soporte para otros dominios**: el modelo solo entiende el espacio de estados y acciones de Raifu Wars. No puede adaptarse a otros juegos o tareas sin reentrenamiento completo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yotisstudios/RaifuWars-RL-ActionScorer-Cover)
- [Raifu Wars (juego)](https://raifuwars.com)
- [Protocolo Warrior](https://github.com/Yotis-Studios/Warrior)
- [Simulador Hemlock](https://github.com/Yotis-Studios/raifusim)
