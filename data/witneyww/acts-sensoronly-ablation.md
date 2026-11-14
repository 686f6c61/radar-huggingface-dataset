# WitneyWW/acts-sensoronly-ablation

## Resumen

`WitneyWW/acts-sensoronly-ablation` no es un modelo de lenguaje, sino un repositorio de investigación que agrupa código, datos preprocesados, medios en bruto y checkpoints de un *world model* visuo-táctil condicionado por acciones, construido sobre la familia Cosmos. Lo desarrolla el usuario WitneyWW y su propósito es reproducible: permite ejecutar tres *runs* de entrenamiento (motherboard, pushT y rope) en una máquina nueva y lanzar cuatro experimentos de ablación posteriores (variantes *sensor-only* con y sin fuerza sobre pushT y rope). El repositorio pesa 141,9 GB y se etiqueta con pipeline `robotics` y librería `cosmos`.

El interés técnico está en la ablación: comparar el modelo completo (streams de acción de vista + sensores + fuerza) frente a variantes que eliminan los *view-action streams* y/o la señal de fuerza, para medir cuánto aporta cada modalidad al rendimiento del world model en tareas de manipulación. Los checkpoints completos de pushT y rope están terminados (epoch 019 de 20), mientras que el *run* de motherboard (`nano_action_causal_umi_sensoronly_noforce_v1`, job Slurm 884599) seguía entrenando en el momento de la subida (epoch 14/20).

La relevancia actual es acotada pero clara para quien investiga world models aplicados a robótica táctil: el repositorio documenta requisitos de hardware exactos (4× H100 80 GB, batch 2 por GPU, ~31 GiB por GPU), tiempos de entrenamiento medidos (≈2,3 h/epoch en pushT, ≈3,3 h/epoch en rope) y protocolos de evaluación con conjuntos de test definidos (30 casos en pushT, 34 en rope). No se proporcionan especificaciones de arquitectura interna, número de parámetros ni ventana de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model visuo-táctil condicionado por acciones sobre la familia Cosmos (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | checkpoints PyTorch (`.pt`, p. ej. `epoch_013.pt`, `epoch_019.pt`) |

## Arquitectura y entrenamiento

El repositorio se apoya en la familia Cosmos (etiqueta `cosmos`, librería `cosmos`) y en dos modelos base públicos que se descargan desde sus propios repositorios; el script `scripts/download.py` gestiona la descarga de datos, medios en bruto, checkpoints, el modelo "nano" y el VAE (`wan_vae`). Los *runs* se configuran mediante ficheros YAML (`configs/nano_action_causal_*_v1.yaml`) y se entrenan con DDP en 4× H100 80 GB (un rango por GPU, batch 2 por GPU, batch global 8, ~31 GiB por GPU). Las variantes de ablación difieren de su configuración padre únicamente en `run_name`, `model.active_streams` (eliminando los `view_action_*`) y, en las variantes *no-force*, en `data.action_file: sensor_actions_fps15_noforce.pt`.

Los datos de entrenamiento están preprocesados como latentes y acciones: para pushT, 56 episodios de entrenamiento y 4 de validación (55.199 ventanas de entrenamiento) a partir de `data/mixed_pushT_{latents,actions}` con split `splits/mixed_pusht_wrist_holdout.json`; para rope, 53 episodios de entrenamiento y 8 de validación (77.188 ventanas) a partir de `data/mixed_rope_{latents,actions}` con split `splits/mixed_rope_wrist_holdout.json`. El entrenamiento se fija en 20 epochs completos (`epoch_000.pt` … `epoch_019.pt`), sin parada temprana ni uso de `best.pt`, con reanudación automática desde `runs/<run_name>/last.pt` si el job de Slurm se interrumpe. No se detalla en la información disponible la composición del dataset más allá de estos recuentos, ni si hubo RLHF/DPO (no aplicable a un world model de este tipo) ni innovaciones de decodificación.

## Capacidades

- Modelado de dinámica visuo-táctil condicionado por acciones en tareas de manipulación robótica (motherboard, pushT, rope).
- Predicción de estados futuros a partir de streams de sensores y, en las variantes completas, de acciones de vista y señal de fuerza.
- Soporte de ablación controlada: activación y desactivación de `view_action_*` y de la fuerza mediante configuración.
- Entrenamiento distribuido con DDP en 4 GPU y reanudación de jobs preemptados.
- Evaluación con *rollouts* largos y cortos sobre conjuntos de test definidos por tarea (30 casos en pushT, 34 en rope).
- Inferencia por tarea con scripts dedicados (`scripts/infer_pusht.sh`, `scripts/infer_rope.sh`) que además suben checkpoint y resultados al repositorio de Hugging Face.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo *thinking*.

## Casos de uso

- Reproducción de experimentos de world models táctiles: el repositorio incluye código, datos y checkpoints para relanzar los tres *runs* originales en una máquina nueva, lo que permite verificar resultados de un artículo o *rebuttal*.
- Ablación de modalidades en manipulación: ejecutar las variantes *sensor-only* con y sin fuerza sobre pushT y rope para cuantificar la contribución de la señal de fuerza al error de predicción.
- Planificación robótica basada en modelo: usar los checkpoints de pushT y rope (epoch 019) para generar *rollouts* condicionados por acción y evaluar políticas antes de desplegarlas en hardware.
- Investigación en percepción táctil: comparar el rendimiento del modelo completo frente al *sensor-only* para decidir qué sensores merecen incorporarse en un montaje físico.
- *Benchmarking* interno de infraestructura: los tiempos medidos (≈2,3 h/epoch en pushT con 6.900 pasos; ≈3,3 h/epoch en rope con 9.648 pasos en 4× H100) sirven para dimensionar clústeres y estimar costes de experimentos similares.
- Docencia y formación: el repositorio estructura paso a paso el *setup* (`scripts/setup_env.sh`), la descarga selectiva por tarea y el lanzamiento con Slurm, lo que facilita prácticas guiadas sobre entrenamiento distribuido de world models.
- Validación de pipelines de evaluación: los conjuntos de test fijos (8 episodios en pushT, 9 en rope) y los ficheros de métricas de referencia permiten comparar implementaciones propias contra una línea base publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio define ficheros de métricas de referencia (`eval/cases/pusht_reference_metrics.json`, `eval/cases/rope_reference_metrics.json`) contra los que comparar las ablaciones, pero no se incluyen sus valores numéricos en la información proporcionada.

## Requisitos de hardware

- Entrenamiento: 4× H100 80 GB en un nodo, un rango DDP por GPU, batch 2 por GPU (batch global 8), ~31 GiB de VRAM por GPU. No se debe modificar el número de GPU ni `training.batch_size`.
- Tiempo de entrenamiento medido: ≈2,3 h/epoch (6.900 pasos) en pushT y ≈3,3 h/epoch (9.648 pasos) en rope, hasta 20 epochs (≈2 días y ≈3 días por experimento respectivamente).
- Inferencia: 4 GPU, ~1 h por script de inferencia sobre el conjunto de test de cada tarea.
- No se especifica si el modelo cabe en GPU de consumo (RTX 4090, etc.); los requisitos documentados apuntan a H100 80 GB.
- Despliegue: scripts propios (`scripts/train.sh`, `scripts/infer_pusht.sh`, `scripts/infer_rope.sh`), Slurm o ejecución directa con `NGPU=4 bash scripts/train.sh <config>.yaml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: el repositorio ocupa 141,9 GB, lo que condiciona el espacio en disco necesario antes de descargar datos y checkpoints.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros world models visuo-táctiles comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El *run* de motherboard (`nano_action_causal_umi_sensoronly_noforce_v1`, job Slurm 884599) estaba en epoch 14/20 en el momento de la subida; su checkpoint no representa un entrenamiento completo.
- Las ablaciones sobre pushT y rope están listadas como TODO: los checkpoints de esas variantes no están incluidos todavía en el repositorio.
- El entrenamiento debe completarse hasta `epoch_019.pt`; usar `best.pt` o parar antes invalida la comparación con las referencias.
- El script de inferencia sube resultados al repositorio de Hugging Face y requiere un `HF_TOKEN` con permisos de escritura sobre `WitneyWW/acts-sensoronly-ablation`; conviene revisar ese comportamiento antes de ejecutarlo en entornos compartidos.
- Licencia `other`: no se detallan los términos de uso comercial; es necesario consultar el texto de licencia del repositorio y de los modelos base Cosmos antes de cualquier despliegue productivo.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática; no aplica el marco habitual de modelos de lenguaje.
- Cada tarea (pushT, rope) se entrena solo con sus propios datos y se evalúa con su propio script y conjunto de test; los resultados no son intercambiables entre tareas.
- El repositorio no documenta parámetros, contexto ni cuantizaciones, lo que limita la estimación de requisitos fuera del entorno H100 descrito.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WitneyWW/acts-sensoronly-ablation
- Artículo de referencia externo citado en la búsqueda (contexto general de Industry 4.0 y robótica): https://www.asme.org/topics-resources/content/industry-40-impacts-engineering-design
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código adicionales ni demos del modelo.
