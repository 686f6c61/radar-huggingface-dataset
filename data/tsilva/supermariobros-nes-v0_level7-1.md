# tsilva/SuperMarioBros-Nes-v0_Level7-1

## Resumen

SuperMarioBros-Nes-v0_Level7-1 es una política de aprendizaje por refuerzo entrenada desde cero con PPO (Proximal Policy Optimization) mediante la librería GradLab, cuyo objetivo es completar el nivel 7-1 del entorno `SuperMarioBros-Nes-v0`. No es un modelo de lenguaje ni un transformer generativo: es un agente que mapea observaciones del emulador de NES a acciones de control del personaje. Lo publica el usuario tsilva en Hugging Face dentro de una colección de políticas por nivel para Super Mario Bros.

El interés del artefacto es acotado y muy específico: sirve como referencia reproducible de un pipeline de RL (entorno, receta de entrenamiento y checkpoint) y como pieza de una colección de agentes por nivel. El checkpoint publicado alcanza 80 despejes en las últimas 100 episodios de entrenamiento, con 3.252.224 transiciones acumuladas y 1.409 despejes sobre 12.692 episodios totales, según la model card.

No hay información sobre arquitectura de red, hiperparámetros, licencia ni idiomas en los metadatos disponibles. El repositorio ocupa 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de investigación sin adopción pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; topología de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en `model.zip`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (bundle GradLab), acompañado de `model.json` y `recipe.json` |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de una política entrenada desde cero con PPO en GradLab para el entorno `SuperMarioBros-Nes-v0`. No se detalla el tipo de red (CNN, MLP u otra), el número de capas, las dimensiones de las observaciones ni los hiperparámetros de PPO (learning rate, clipping, número de epochs por actualización, tamaño de rollout). Tampoco se especifica la función de recompensa ni si hubo ingeniería de recompensas adicional (por ejemplo, penalización por estancamiento o recompensas por avance de x-scroll).

El entrenamiento consta de 3.252.224 transiciones de entorno en una única ejecución con semilla `12`, identificada como `gradlab-c41628637d85caf5bf0ab3313ee27ff8`, que produjo el checkpoint `checkpoint-3252224-f769be6850bd89d8`. Cada episodio contabilizado comienza en el inicio canónico del nivel 7-1. El bundle incluye la política (`model.zip`), los metadatos del checkpoint (`model.json`) y la receta ejecutada (`recipe.json`), lo que permite reproducir el entrenamiento siempre que se disponga de una ROM compatible.

## Capacidades

- Control del personaje en Super Mario Bros. NES para el nivel 7-1, partiendo del inicio canónico del nivel.
- Política entrenada específicamente para un único nivel; no se documenta generalización a otros niveles.
- Despeje del nivel en 80 de los últimos 100 episodios de entrenamiento reportados por el autor.
- Ejecución mediante el comando `gradlab play` con una ROM propia del usuario.
- No dispone de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general ni modo de razonamiento explícito.
- No se documentan capacidades de transferencia, fine-tuning sobre otros niveles ni adaptación a variantes del entorno.

## Casos de uso

- Reproducción de experimentos de RL: sirve para replicar el pipeline PPO de GradLab sobre `SuperMarioBros-Nes-v0` usando la receta `recipe.json` incluida en el bundle y una ROM legalmente obtenida.
- Benchmark interno de algoritmos de RL: al fijar semilla, nivel y número de transiciones, permite comparar variantes de PPO u otros algoritmos bajo condiciones controladas.
- Docencia y divulgación: ejemplo concreto y acotado de entrenamiento por refuerzo desde cero, útil para explicar conceptos como política, retorno acumulado y evaluación por episodios.
- Estudio de estabilidad del entrenamiento: los datos de 1.409 despejes sobre 12.692 episodios permiten analizar la varianza del rendimiento a lo largo del entrenamiento.
- Base para comparativas por nivel: forma parte de una colección de políticas por nivel, lo que facilita analizar qué niveles resultan más difíciles para un mismo algoritmo y presupuesto de transiciones.
- Integración en demos de emulación: el comando `gradlab play` permite visualizar la política en un emulador de NES local con la ROM correspondiente.
- Punto de partida para fine-tuning: puede servir como inicialización para experimentos de continuación de entrenamiento en el mismo nivel, aunque el autor no documenta esta práctica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Despejes en los últimos 100 episodios de entrenamiento | 80 / 100 |
| Despejes acumulados en entrenamiento | 1.409 / 12.692 |
| Transiciones de entorno | 3.252.224 |
| Evaluación de aceptación independiente | no disponible |

No se han publicado resultados de benchmarks estandarizados (por ejemplo, métricas agregadas sobre múltiples semillas o comparación con agentes de referencia) en la información disponible. Las cifras anteriores proceden de una única ejecución con semilla `12` y de episodios de entrenamiento, no de una evaluación independiente.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y no se especifica la topología de la red, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Para una política de RL de este tipo, la inferencia suele ser viable en CPU, pero el autor no lo confirma.
- GPU de consumo: no confirmado; previsiblemente cualquier equipo capaz de ejecutar el emulador de NES y GradLab sería suficiente, aunque no se documenta.
- Opciones de despliegue: GradLab mediante `gradlab play` con `--rom-path` apuntando a una ROM de Super Mario Bros. NES. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Nivel | Despejes reportados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsilva/SuperMarioBros-Nes-v0_Level7-1 | Política PPO (GradLab) | 7-1 | 80/100 (últimos 100 episodios de entrenamiento) | no disponible | Hugging Face |
| Otras políticas de la colección GradLab SuperMarioBros-Nes-v0 | Política PPO (GradLab) | Otros niveles | no disponible en esta ficha | no disponible | Hugging Face (colección del autor) |
| Agentes de referencia externos (por ejemplo, baselines de RL para NES) | Varía | Varía | no disponible | Varía | no disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría. La única comparación posible es dentro de la propia colección del autor, cuyos resultados por nivel no se han incluido en la información proporcionada.

## Limitaciones y advertencias

- Entrenada para un único nivel (7-1); no hay evidencia de generalización a otros niveles ni a variantes del entorno.
- El rendimiento reportado (80/100) procede de episodios de entrenamiento, no de una evaluación independiente; puede estar sobreestimado por sobreajuste al entorno y a la semilla `12`.
- No se documenta la arquitectura de la red ni los hiperparámetros, lo que dificulta la replicación exacta y la auditoría técnica.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial ni la redistribución del artefacto.
- Requiere una ROM de Super Mario Bros. NES que el usuario debe aportar; la distribución de ROMs con copyright es responsabilidad del usuario.
- Riesgo de alucinación no aplica (no es un modelo generativo de lenguaje), pero sí existe riesgo de comportamientos erráticos fuera de la distribución de estados vista en entrenamiento.
- Sin descargas ni likes registrados, no hay evidencia de validación por parte de la comunidad.
- No se especifican sesgos, idiomas ni restricciones adicionales porque el artefacto no procesa lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsilva/SuperMarioBros-Nes-v0_Level7-1
- Colección GradLab SuperMarioBros-Nes-v0: https://huggingface.co/collections/tsilva/gradlab-supermariobros-nes-v0-6a5675af108d798040f3aafb
- Informe de entrenamiento (nivel 7-1): https://github.com/tsilva/gradlab/blob/9f7c156de28c68f06e34eb177c1b35bd9dad87ec/experiments/reports/smb-per-level-recipe-qualification.md#level7-1--2026-11-17
- Instalación de GradLab: https://github.com/tsilva/gradlab#install
- Manifiesto del checkpoint: https://pub-fc35c0b186ce4aad8eea5e93d38c99db.r2.dev/runs/gradlab-c41628637d85caf5bf0ab3313ee27ff8/checkpoints/3252224-f769be6850bd89d8778e2b7045023e5efc4d95e4f40ff6b0347758a38ed06c03/manifest.json
