# yizhouzhao-nv/cosmos3-edge-libero-goal-20260904-185434

## Resumen

El modelo yizhouzhao-nv/cosmos3-edge-libero-goal-20260904-185434 es un fine-tuning del modelo base Cosmos3-Edge de NVIDIA, adaptado mediante aprendizaje por imitación (SFT) para actuar como política de acción robótica en el entorno LIBERO_goal. Desarrollado por el usuario yizhouzhao-nv, su objetivo es convertir un modelo de fundación en un controlador capaz de generar acciones de manipulación a partir de observaciones. El modelo se entrena sobre 428 trayectorias del dataset nvidia/LIBERO_LeRobot_v3, con 2000 iteraciones y un lote global de 2048 en una configuración de 8 GPU H100 de 80 GB. El repositorio incluye los pesos en formato PyTorch Distributed Checkpoint (DCP), el fichero de configuración del entrenamiento y los estadísticos de normalización de acciones necesarios para decodificar las salidas. La relevancia radica en la exploración de Cosmos3-Edge como base para políticas de acción, un campo emergente en robótica. No se dispone de datos sobre arquitectura, tamaño de parámetros ni longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) |

## Arquitectura y entrenamiento

El modelo parte del modelo base Cosmos3-Edge de NVIDIA, aunque en la información disponible no se detallan la arquitectura interna, el número de parámetros ni la longitud de contexto. El proceso de entrenamiento es un fine-tuning supervisado (SFT) sobre el dataset LIBERO_LeRobot_v3, concretamente la suite libero_goal, compuesta por 428 trayectorias. Se ejecutaron 2000 iteraciones con un tamaño de lote global de 2048 en un solo nodo con 8 GPU H100 de 80 GB. La pérdida final de entrenamiento fue aproximadamente 0,50. Se empleó una configuración de experimento registrada en cosmos-framework, junto con un normalizador de acciones en espacio de poses frame_wise_relative con rotación 6D y normalización quantile_rot. El entrenamiento se realizó en dos asignaciones separadas (iteraciones 1-1500 y 1500-2000) debido al límite de 8 horas de SLURM. Como desviaciones del recipe de referencia, se usó el optimizador AdamW con fused=true en lugar de FusedAdam de transformer-engine, y se desactivó torch.compile por un error de Dynamo al trazar el backend Hopper FMHA de NATTEN en H100. El repositorio contiene solo los pesos del modelo en el checkpoint 2000, sin estado de optimizador ni scheduler.

## Capacidades

- Ejecuta políticas de acción robótica para el suite LIBERO_goal.
- Genera acciones de manipulación en el espacio de poses frame_wise_relative, con representación rot6d.
- Se integra con el framework cosmos-framework para desplegarse como servidor de políticas de acción.
- Incluye un fichero de normalización de acciones (libero_native_frame_wise_relative_rot6d.json) necesario para decodificar correctamente las salidas del modelo.
- Al ser un modelo de política de acción, no ofrece capacidades de generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- El repositorio proporciona el fichero de configuración exacto del entrenamiento (action_policy_libero_goal_edge.toml) y el recipe de experimento (action_policy_libero_edge.py).

## Casos de uso

- Investigación en políticas de acción robótica: usar el modelo como punto de partida para comparar métodos de SFT en el benchmark LIBERO_goal.
- Adaptación a nuevas tareas de manipulación: aprovechar el checkpoint como inicialización para fine-tuning con datasets adicionales de menor tamaño.
- Evaluación de controladores en simulación: integrar el modelo en entornos como Isaac Sim o MuJoCo para probar la política en tareas de goal-oriented manipulation.
- Despliegue como servidor de inferencia: mediante el script action_policy_server_libero de cosmos-framework, cargando el checkpoint y sirviendo acciones a un robot o simulador.
- Reproducción de experimentos: el fichero .toml y el recipe permiten replicar exactamente el proceso de SFT y analizar las desviaciones del entrenamiento.
- Benchmark de generalización: al estar entrenado solo en 428 trayectorias, es útil para estudiar cuánto generaliza una política de acción con datos limitados.
- Educación en robótica: como ejemplo práctico de cómo convertir un modelo de fundación en un controlador robótico mediante aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 27,0 GB, lo que sugiere que los pesos en precisión completa requieren al menos esa cantidad de memoria, pero no se especifica.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 8x H100 80GB, pero no hay datos de inferencia.
- ¿Cabe en consumer GPU?: no disponible. Dado el peso de 27 GB, es probable que se necesite una GPU profesional o un nodo multi-GPU, pero no hay confirmación.
- Opciones de despliegue: cosmos-framework (action_policy_server_libero), usando el loader DCP y la configuración de experimento action_policy_libero_edge.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. El modelo es un fine-tune del modelo base nvidia/Cosmos3-Edge. Existe otro fine-tune similar publicado por el mismo autor, yizhouzhao-nv/cosmos3-edge-libero10-sft, pero no se han publicado especificaciones de ninguno de los dos en la información disponible. La comparación de parámetros, contexto, rendimiento y licencia no es posible.

## Limitaciones y advertencias

- Entrenado exclusivamente en la suite libero_goal (428 trayectorias), por lo que su capacidad de generalización a otras tareas o entornos no está demostrada.
- No se han publicado evaluaciones de sesgos, robustez ni alucinaciones; el riesgo de acciones incorrectas fuera de la distribución de entrenamiento no está cuantificado.
- La licencia es "other", sin una especificación clara de los permisos de uso comercial o redistribución.
- Depende de un fichero de normalización de acciones específico (libero_native_frame_wise_relative_rot6d.json); sin él, las salidas del modelo no pueden decodificarse correctamente.
- El entrenamiento se realizó con desviaciones del recipe de referencia (AdamW en lugar de FusedAdam, torch.compile desactivado), lo que puede afectar al rendimiento final.
- El repositorio solo contiene pesos del modelo, sin estado de optimizador ni scheduler, lo que impide reanudar el entrenamiento desde el checkpoint 2000.
- No se proporcionan instrucciones de instalación ni requisitos de dependencias más allá de cosmos-framework.

## Enlaces

- HuggingFace: https://huggingface.co/yizhouzhao-nv/cosmos3-edge-libero-goal-20260904-185434
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Dataset: https://huggingface.co/datasets/nvidia/LIBERO_LeRobot_v3
- Framework: https://github.com/NVIDIA/cosmos-framework
- Blog de NVIDIA sobre Cosmos 3 Edge: https://huggingface.co/blog/nvidia/cosmos3edge
- Modelo similar: https://huggingface.co/yizhouzhao-nv/cosmos3-edge-libero10-sft
