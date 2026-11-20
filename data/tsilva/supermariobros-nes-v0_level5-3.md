# tsilva/SuperMarioBros-Nes-v0_Level5-3

## Resumen

`tsilva/SuperMarioBros-Nes-v0_Level5-3` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para superar el nivel 5-3 del entorno `SuperMarioBros-Nes-v0`, una implementación del clásico Super Mario Bros. de NES emulada. El modelo lo desarrolla el usuario `tsilva` dentro del ecosistema GradLab, una librería propia de entrenamiento y evaluación de agentes de RL. No se trata de un modelo de lenguaje ni de un transformer generativo: es un agente de control que recibe observaciones del emulador y emite acciones de botón (izquierda, derecha, salto, etc.).

El interés de esta ficha es acotado: es un artefacto de investigación de RL con un objetivo muy concreto (un único nivel, desde el punto de partida canónico) y sin evaluación independiente publicada. El checkpoint publicado declara 95 limpiezas en las últimas 100 episodios de entrenamiento, lo que sugiere convergencia sobre la distribución de entrenamiento, pero no hay datos de generalización fuera de ella.

Conviene subrayar que el repositorio ocupa 0.0 GB, no declara licencia, no declara idiomas y no incluye pesos en formatos estándar de Hugging Face (safetensors/GGUF). El bundle contiene `model.zip`, `model.json` y `recipe.json`, consumibles únicamente con la herramienta GradLab y requiriendo una ROM de Super Mario Bros. NES aportada por el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; la model card no detalla la red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL sobre observaciones del emulador; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab), con `model.json` y `recipe.json`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card indica que la política se entrena "from scratch" con PPO en GradLab para completar el nivel 5-3 de `SuperMarioBros-Nes-v0` desde el inicio canónico. No se especifica la arquitectura de la red (si es una CNN sobre frames, un MLP sobre features, o una combinación), ni el tamaño de la red, ni los hiperparámetros de PPO (learning rate, clipping, GAE lambda, número de entornos en paralelo). El `recipe.json` incluido en el bundle es, presumiblemente, la fuente autoritativa de esa configuración, pero su contenido no se reproduce en la model card.

Los datos de entrenamiento publicados son: 28.688.384 transiciones de entorno, 612 limpiezas acumuladas sobre 182.396 episodios, y una ejecución con semilla `12`. El checkpoint publicado corresponde al run `gradlab-fb5ba3813922285fb9796afa0cc4ecc4`, checkpoint `checkpoint-28688384-29200c0e3f06b081`. No se documenta uso de reward shaping, currículo, imitación, ni técnicas auxiliares; tampoco se menciona decodificación especulativa ni mecanismos de atención, que no aplican a este tipo de artefacto.

## Capacidades

- Control de un agente en el entorno `SuperMarioBros-Nes-v0`, nivel 5-3, desde el punto de partida canónico.
- Política entrenada específicamente para ese nivel; no se declara capacidad de transferencia a otros niveles.
- Ejecución mediante la CLI de GradLab (`gradlab play`), que carga el bundle y reproduce la política sobre una ROM local.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso en el sentido de agentes LLM; es una política de RL de un solo entorno.
- No tiene capacidades multilingües, de visión general, audio ni thinking mode.
- No se declara capacidad de generalización a variaciones del entorno (distintas semillas, modificaciones de ROM, wrappers distintos).

## Casos de uso

- Reproducción de resultados de RL: cargar el bundle con `gradlab play` y verificar sobre la ROM propia que la política completa el nivel 5-3, como paso de validación de un pipeline de entrenamiento.
- Baseline para comparación de algoritmos: usar esta política PPO como referencia frente a otros algoritmos (A2C, DQN, SAC) sobre el mismo nivel y el mismo conjunto de transiciones, para medir sample efficiency.
- Estudio de recetas de entrenamiento: el `recipe.json` del bundle permite auditar la configuración exacta (semilla, hiperparámetros, número de entornos) que produjo 95/100 limpiezas, y reutilizarla como plantilla para otros niveles.
- Docencia de RL: ejemplo tangible de un agente que resuelve una tarea discreta con recompensa escasa, útil para explicar PPO, ventajas y problemas de estabilidad en entornos de videojuego.
- Investigación sobre sobreajuste a un único nivel: comparar el rendimiento declarado (95/100 en entrenamiento) con evaluaciones propias en condiciones alteradas para cuantificar la brecha de generalización.
- Integración en benchmarks internos de GradLab: incorporar el checkpoint como caso de regresión para detectar roturas en la librería al actualizar versiones del emulador o de los wrappers.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de entrenamiento, no benchmarks comparables con otros modelos:

| Metrica | Valor |
|---|---|
| Limpiezas en los últimos 100 episodios de entrenamiento | 95 / 100 |
| Limpiezas acumuladas | 612 / 182.396 |
| Transiciones de entorno | 28.688.384 |
| Semilla del run | 12 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, que además no aplican a este tipo de artefacto). Tampoco hay métricas de retorno medio, longitud de episodio ni varianza entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y no se publica el tamaño de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Por la naturaleza del artefacto (política de RL de un juego de NES), es plausible que la inferencia funcione en CPU, pero la model card no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: exclusivamente la CLI de GradLab (`gradlab play 'hf://tsilva/SuperMarioBros-Nes-v0_Level5-3' --rom-path ...`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.
- Requisito adicional: ROM de Super Mario Bros. NES aportada por el usuario; no se distribuye con el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tsilva/SuperMarioBros-Nes-v0_Level5-3` | Política PPO (GradLab) | Nivel 5-3, inicio canónico | 95/100 en entrenamiento | no disponible | Hugging Face, bundle GradLab |
| Otros checkpoints de la colección `tsilva/gradlab-supermariobros-nes-v0` | Políticas PPO (GradLab) | Otros niveles de SMB NES | no disponible en esta ficha | no disponible | Hugging Face |
| Agentes RL de referencia para Super Mario Bros. (por ejemplo, implementaciones PPO públicas) | Políticas RL | SMB NES, distintos niveles | no disponible | variable | Repositorios de código |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; la única comparación fiable es contra otros checkpoints de la misma colección del autor, cuyos resultados no se han consultado aquí.

## Limitaciones y advertencias

- No hay evaluación independiente: el 95/100 procede de los últimos 100 episodios de entrenamiento, no de un conjunto de test separado, por lo que puede reflejar sobreajuste a la distribución de entrenamiento.
- La tasa global de limpieza es baja: 612 limpiezas sobre 182.396 episodios (aproximadamente 0,34 %), lo que indica que el rendimiento alto se concentra al final del entrenamiento y no es representativo del proceso completo.
- Entrenado para un único nivel y desde un único punto de partida canónico; no se declara robustez ante variaciones de estado inicial, semillas del emulador o wrappers.
- Licencia no declarada: no puede asumirse uso comercial ni redistribución. Es un bloqueo relevante para cualquier uso en producción.
- Requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; la legalidad de esa ROM es responsabilidad del usuario y no está cubierta por el repositorio.
- Formato propietario de GradLab (`model.zip` + `model.json` + `recipe.json`): no es portable a otros frameworks sin conversión, que no está documentada.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de lo que se deduce de las métricas de entrenamiento.
- Repositorio sin descargas ni likes en el momento de la consulta y con tamaño declarado de 0.0 GB; conviene verificar la integridad del bundle antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level5-3
- Colección GradLab Super Mario Bros. NES: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Informe de entrenamiento (nivel 5-3): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level5-3--2026-11-16
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-fb5ba3813922285fb9796afa0cc4ecc4/checkpoints/28688384-29200c0e3f06b08150a8d2e4d0db10532297c0fcfb38bdf4a5496763d914770d/manifest.json
