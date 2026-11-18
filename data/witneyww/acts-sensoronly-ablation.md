# WitneyWW/acts-sensoronly-ablation

## Resumen

ACTS (action-conditioned visuo-tactile world model) es un modelo de mundo para robótica desarrollado por el usuario WitneyWW, construido sobre la familia Cosmos y publicado como repositorio de investigación. El repositorio `acts-sensoronly-ablation` no es un modelo único, sino un paquete completo de código, datos preprocesados y checkpoints para reproducir y entrenar variantes de un world model visuo-táctil condicionado por acciones, con experimentos de ablación centrados en la eliminación de los flujos de acción de vista (sensor-only) y de la señal de fuerza.

El modelo predice la evolución futura de observaciones (látentes visuales y táctiles) condicionado por acciones de un robot, lo que lo sitúa en la categoría de world models para planificación y control robótico. El repositorio incluye tres ejecuciones entrenadas (motherboard, pushT y rope) y la infraestructura para cuatro experimentos de seguimiento sobre las tareas pushT y rope, con y sin fuerza.

Es relevante ahora porque aborda la fusión de percepción táctil y visual en modelos de mundo para manipulación, un área emergente en robótica de precisión donde la señal de fuerza y el tacto son críticos. El repositorio es grande (254,2 GB) e incluye datos crudos, lo que facilita la reproducibilidad, aunque su naturaleza es claramente de investigación y no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model action-conditioned basado en Cosmos (transformador de difusión para predicción de latentes visuo-táctiles; detalles exactos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (se trabaja con ventanas de episodios; 55.199 ventanas de entrenamiento en pushT, 77.188 en rope) |
| Tipos de cuantizacion | no disponible (checkpoints en `.pt` de PyTorch, sin formatos cuantizados publicados) |
| Idiomas soportados | no disponible (modelo no lingüístico; entradas visuo-táctiles y acciones) |
| Licencia | other (licencia personalizada, ver limitaciones) |
| Formato de pesos | PyTorch `.pt` (checkpoints por epoch, p. ej. `epoch_013.pt`, `epoch_019.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de world model action-conditioned de Cosmos: dado un historial de observaciones (látentes visuales y táctiles) y una secuencia de acciones, predice la evolución futura del estado latente. El repositorio define flujos de entrada (`active_streams`) que incluyen flujos de sensor y, opcionalmente, flujos de acción de vista (`view_action_*`); la ablación `sensoronly` elimina estos últimos. Las variantes `noforce` sustituyen el fichero de acciones por `sensor_actions_fps15_noforce.pt`, eliminando la señal de fuerza.

El entrenamiento se realiza con paralelismo de datos (DDP) en 4 GPU H100 de 80 GB, un rango por GPU, batch 2 por GPU (batch global 8), con un consumo de aproximadamente 31 GiB por GPU. Se entrena durante 20 epochs completas (de `epoch_000.pt` a `epoch_019.pt`), con tiempos de aproximadamente 2,3 h/epoch para pushT (6.900 pasos, ~2 días por experimento) y 3,3 h/epoch para rope (9.648 pasos, ~3 días por experimento). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset más allá de los episodios indicados, ni si se empleó RLHF o DPO (poco probable en un world model). Los datos de pushT incluyen 56 episodios de entrenamiento y 4 de validación; los de rope, 53 de entrenamiento y 8 de validación.

## Capacidades

- Predicción de estados futuros visuo-táctiles condicionada por acciones de robot (world modeling).
- Fusión de percepción visual y táctil en un espacio latente compartido.
- Soporte de señal de fuerza como canal de acción adicional (variantes con fuerza) o su eliminación (variantes `noforce`).
- Modelado de dinámica para tareas de manipulación específicas: motherboard, pushT y rope.
- Evaluación mediante rollouts largos sobre conjuntos de test por tarea (30 casos en pushT, 34 en rope).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito; el modelo no es lingüístico.

## Casos de uso

- Planificación de manipulación con pushT: el world model predice la evolución del estado latente tras acciones de empuje, permitiendo evaluar trayectorias candidatas antes de ejecutarlas en el robot; es adecuado porque se entrenó específicamente sobre 56 episodios de pushT y se evalúa con 30 casos de test.
- Manipulación de cuerda (rope): predicción de la dinámica de deformación de una cuerda bajo acciones del robot, útil para seleccionar agarres y movimientos; el modelo se entrenó con 53 episodios y se evalúa con 34 casos.
- Ensamblaje de placas base (motherboard): modelado de interacciones de precisión con señal táctil y de fuerza, adecuado para tareas donde el tacto es crítico; la ejecución `nano_action_causal_umi_sensoronly_noforce_v1` se entrenó con flujos sensor-only sin fuerza.
- Estudio de ablación de modalidades: comparar el rendimiento con y sin flujos de acción de vista y con y sin fuerza para determinar qué señales son imprescindibles en un world model táctil; el repositorio está diseñado exactamente para esto.
- Investigación en simulación y evaluación offline: usar los rollouts largos generados por los scripts `infer_pusht.sh` e `infer_rope.sh` para medir la fidelidad de la predicción antes de desplegar políticas en hardware real.
- Reproducibilidad de experimentos: reentrenar las cuatro variantes (pushT/rope, con/sin fuerza) en 4× H100 siguiendo los comandos Slurm incluidos, con reanudación automática desde `last.pt` en caso de preempción.
- Generación de datos sintéticos de entrenamiento: los rollouts del world model pueden servir como datos aumentados para entrenar políticas de manipulación en las tareas cubiertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye ficheros de métricas de referencia (`eval/cases/pusht_reference_metrics.json`, `eval/cases/rope_reference_metrics.json`) para comparar las variantes de ablación contra los modelos completos (`nano_action_causal_pusht_v1` epoch 019 y `nano_action_causal_rope_v1` epoch 019), pero los valores numéricos no se proporcionan en la información disponible.

## Requisitos de hardware

- Entrenamiento: 4 GPU H100 de 80 GB en un solo nodo (un rango DDP por GPU, batch 2 por GPU, ~31 GiB por GPU). No se debe cambiar el número de GPU ni el batch size.
- Inferencia: los scripts `infer_pusht.sh` e `infer_rope.sh` están diseñados para ejecutarse con 4 GPU y tardan aproximadamente 1 hora por tarea.
- VRAM estimada para inferencia: no disponible de forma aislada; el entrenamiento consume ~31 GiB por GPU en H100.
- GPU recomendadas: H100 80 GB para entrenamiento; para inferencia se indica configuración de 4 GPU sin especificar modelo mínimo.
- Viabilidad en GPU de consumo: no disponible; el tamaño del repositorio (254,2 GB) y los requisitos de entrenamiento sugieren que no está pensado para GPU de consumo.
- Opciones de despliegue: scripts propios basados en PyTorch y Slurm (`scripts/train.sh`, `scripts/infer_pusht.sh`, `scripts/infer_rope.sh`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; solo se indica ~1 h para la inferencia completa sobre el conjunto de test de cada tarea en 4 GPU.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ACTS sensor-only ablation (este) | World model visuo-táctil | no disponible | no disponible | motherboard, pushT, rope | other | Hugging Face, 254,2 GB |
| Cosmos (modelos base) | World model / generativo | no disponible en la informacion | no disponible | generacion y simulacion visual | no disponible | Repos publicos de Cosmos (descargados por `download.py`) |
| `nano_action_causal_pusht_v1` (modelo completo) | World model visuo-táctil | no disponible | no disponible | pushT | other (mismo repo) | Checkpoint `epoch_019.pt` en este repositorio |
| `nano_action_causal_rope_v1` (modelo completo) | World model visuo-táctil | no disponible | no disponible | rope | other (mismo repo) | Checkpoint `epoch_019.pt` en este repositorio |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Licencia `other`: es una licencia personalizada no detallada en la información disponible; es imprescindible revisar los términos antes de cualquier uso comercial.
- El repositorio es material de investigación en estado de trabajo: la ejecución de motherboard seguía entrenando en el momento de la subida (epoch 14/20).
- Los experimentos de seguimiento (pushT y rope, con y sin fuerza) están marcados como TODO y no estaban completados en la información proporcionada.
- El modelo está especializado por tarea: pushT y rope se entrenan por separado y no comparten nada excepto el código; no hay evidencia de generalización entre tareas.
- Los conjuntos de datos son pequeños (56 y 53 episodios de entrenamiento), lo que limita la robustez fuera de la distribución capturada.
- No se documentan sesgos, tasas de alucinación ni evaluación de seguridad; al ser un modelo de predicción latente, los errores se manifiestan como derivas en los rollouts, no como texto.
- El tamaño del repositorio (254,2 GB) incluye datos crudos y checkpoints, lo que exige planificación de almacenamiento y ancho de banda.
- Los scripts de inferencia suben resultados al repositorio de Hugging Face y requieren un `HF_TOKEN` con permisos de escritura, lo que introduce un riesgo operativo si se ejecutan sin control.
- No hay información sobre idiomas ni capacidades lingüísticas porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/WitneyWW/acts-sensoronly-ablation
- Repositorios base de Cosmos: no disponible en la información proporcionada (se descargan mediante `scripts/download.py --what ... nano wan_vae`)
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: incluido en el propio repositorio de Hugging Face (carpetas `scripts/`, `configs/`, `data/`, `eval/`, `checkpoints/`)
- Demos: no disponible
