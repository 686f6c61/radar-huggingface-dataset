# watch-2026-icl/watch-2026-posttrain-robot-icl

## Resumen

`watch-2026-posttrain-robot-icl` es un repositorio de checkpoints de investigación publicado por el usuario `watch-2026-icl` en Hugging Face. No contiene un modelo de lenguaje general, sino los resultados de una campaña de post-entrenamiento (fine-tuning) sobre el modelo de política robótica Cosmos-Predict2.5-2B, orientada a aprendizaje en contexto (in-context learning, ICL) con demostraciones de un robot real llamado Sprout. El repositorio agrupa diez ejecuciones de entrenamiento independientes, cada una con checkpoints en los pasos 2K, 3K y 4K, además de ficheros de configuración y logs de lanzamiento.

El problema que aborda es la adaptación de un modelo base de predicción vídeo-acción (2 000 millones de parámetros) a tareas de manipulación robótica concretas —`sprout_cup_to_drawer` y `sprout_open_drawer`— mediante condicionamiento por demostraciones incluidas en el contexto, en lugar de un ajuste clásico por refuerzo o imitación pura. Las ejecuciones comparan distintas estrategias: arranque en caliente desde un checkpoint intermedio de WATCH frente al modelo base de Cosmos, uso de la propia demostración del episodio frente a mezclar un 30 % de muestras de otro episodio, y dos representaciones de acción (absoluta y relativa al chunk) con demostraciones retargetizadas.

El interés del artefacto es metodológico: documenta de forma reproducible (semillas, batches, curvas de pérdida, tiempos por iteración) cómo influyen el warm start y la selección de demostraciones en el post-entrenamiento de un modelo de política robótica. No se trata de un modelo listo para producción ni de uso general; es material de investigación con licencia no declarada y sin model card convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de política robótica basado en Cosmos-Predict2.5-2B (transformer de difusión para predicción vídeo-acción); detalles internos no disponibles |
| Parámetros totales | 2 000 millones (2B), según el nombre de los experimentos (`cosmos_predict2p5_2b_*`) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; las ejecuciones usan ventanas de 6 158 «windows» con `chunk_duration=25` y `state_t=7`, sin especificar la longitud en tokens |
| Tipos de cuantización | no disponible; los checkpoints se distribuyen convertidos con `convert_dcp_to_pt.py` (formato PyTorch `.pt`) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (convertidos desde checkpoints DCP); `sha256.txt` con hashes de todos los checkpoints |

## Arquitectura y entrenamiento

El modelo subyacente es Cosmos-Predict2.5-2B, un transformer de 2 000 millones de parámetros orientado a predicción y política en entornos físicos. Las ejecuciones parten de dos warm starts distintos: el modelo base Cosmos-Predict2.5-2B y un checkpoint intermedio de WATCH (`egoverse_ret_v3_448_state_4node`, 8K iteraciones), o una variante «within-video» (`egoverse_ret_v3_448_state_blankret_bv2_v10_4node`, 8K). Sobre esa base se aplica un post-entrenamiento con demostraciones en contexto sobre datos de teleoperación del robot Sprout (HF `Jeongeun/sprout-real-3task`), con 40 episodios y 6 158 ventanas tras el filtrado de tareas (desde 10 358 ventanas originales).

El primer bloque de cuatro ejecuciones (ghost-demo) usa batch global 64, 4 000 iteraciones, learning rate 1e-4 tras 100 pasos de warmup con decaimiento lineal hasta 0.5e-4, checkpoint cada 1 000 pasos, y se ejecutó en un nodo de 8 A100 80 GB con 8 muestras por GPU (1,60-1,61 s/iteración). El segundo bloque de seis ejecuciones (r29, demostraciones retargetizadas) usa 2 nodos con 8 H200 y 4 muestras por GPU, también con batch global 64, y corre a ~0,58 s/iteración. Las innovaciones documentadas incluyen la augmentación consistente con la demostración (`cf_aug`, con `p_arm` configurable), el jitter de ventanas (±6) y la recuperación de la ventana de demostración mediante `manifest/ghost_match_r29.json`. No se documenta uso de RLHF o DPO.

## Capacidades

- Generación de acciones de control robótico para tareas de manipulación (abrir cajón, mover una taza a un cajón) condicionadas por demostraciones en contexto.
- Aprendizaje en contexto a partir de una demostración incluida en la ventana de entrada, sin actualización de pesos en inferencia.
- Dos representaciones de acción entrenadas: absoluta y relativa al chunk (`r29abs` y `r29rel`).
- Variantes con mezcla de demostraciones de otros episodios (`mix30`, 30 % de muestras) para evaluar robustez ante demostraciones imperfectas.
- Compatibilidad con el pipeline WATCH/Cosmos (conversión DCP a `.pt`, carga de checkpoints intermedios).
- No se documentan capacidades de texto, visión general, tool calling, agentes multi-paso ni multilingüismo.

## Casos de uso

- Investigación en aprendizaje en contexto para robótica: comparar warm starts (WATCH mid frente a Cosmos base) y aislar su efecto en la pérdida final, usando los checkpoints 2K/3K/4K de cada carpeta.
- Estudio de selección de demostraciones: las variantes `mix30` permiten medir cuánto degrada (o no) el uso de un 30 % de demostraciones ajenas al episodio, un escenario realista cuando no hay una demo perfecta disponible.
- Evaluación de representaciones de acción: comparar `r29abs` frente a `r29rel` en tareas de manipulación con contacto, donde la representación relativa suele ser más robusta a variaciones de punto de partida.
- Reproducción de experimentos: los logs `sprout_<arm>_node0.log`, los `config.yaml` y `sha256.txt` permiten replicar exactamente cada ejecución y verificar la integridad de los pesos.
- Baseline para post-entrenamiento de políticas robóticas: los checkpoints a 4K con pérdidas entre 0,0139 y 0,0192 sirven como punto de partida para comparar nuevas recetas (augmentaciones, schedules, filtrados de datos).
- Análisis de estabilidad del entrenamiento: el pico de pérdida en la iteración 2995 presente en las cuatro ejecuciones ghost-demo es un caso de estudio sobre batches difíciles y su efecto en curvas de pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de entrenamiento (valor de un solo batch en el log del launcher) y tiempos por iteración:

| Ejecución | Pérdida a 4K | s/iteración |
|---|---|---|
| r29abs | 0,0173 | ~0,58 |
| r29abs_within | 0,0165 | ~0,58 |
| r29abs_base | 0,0158 | ~0,58 |
| r29rel | 0,0192 | ~0,58 |
| r29rel_within | 0,0156 | ~0,58 |
| r29rel_base | 0,0139 | ~0,58 |
| icl (ghost) | no disponible | 1,60 |
| icl_mix30 (ghost) | no disponible | 1,61 |
| icl_base (ghost) | no disponible | 1,61 |
| icl_mix30_base (ghost) | no disponible | 1,61 |

No hay métricas de éxito en tarea (tasa de acierto, recompensa media) ni comparación con otras políticas publicadas.

## Requisitos de hardware

- Entrenamiento documentado: 1 nodo de 8 A100 80 GB (ejecuciones ghost) o 2 nodos de 8 H200 (ejecuciones r29), con batch global 64.
- VRAM para inferencia: no disponible; al tratarse de un modelo de 2B en formato `.pt` sin cuantización publicada, se requiere al menos una GPU con memoria suficiente para los pesos en precisión de entrenamiento (estimación orientativa no confirmada: >8 GB solo para pesos en fp16, más activaciones y estado).
- GPU consumer: no confirmado; no se distribuyen pesos GGUF ni cuantizaciones, por lo que no hay una ruta directa a llama.cpp u Ollama.
- Despliegue: el pipeline esperado es el de WATCH/Cosmos (carga de `.pt` con `convert_dcp_to_pt.py`); no se documenta soporte para vLLM, TGI ni Ollama.
- Throughput: 1,60-1,61 s/iteración en 8×A100 80 GB y ~0,58 s/iteración en 16×H200; no se reporta latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| watch-2026-posttrain-robot-icl | 2B | no disponible | no disponible | Hugging Face (repo de 117,4 GB) | Checkpoints de investigación, sin benchmarks de tarea |
| Cosmos-Predict2.5-2B (base) | 2B | no disponible | no disponible en esta ficha | Usado como warm start | Modelo base del que parten las ejecuciones |
| WATCH mid (`egoverse_ret_v3_448_state_4node`) | no disponible | no disponible | no disponible | HF `Jeongeun/cosmos-policy-watch-mid` | Checkpoint intermedio usado como warm start alternativo |

No se dispone de información suficiente para comparar rendimiento en tarea con otras políticas robóticas.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo genera acciones para las tareas `sprout_cup_to_drawer` y `sprout_open_drawer` del robot Sprout.
- Licencia no declarada: no se puede asumir uso comercial; verificar términos antes de cualquier despliegue.
- Sin model card convencional ni evaluación en tarea: las pérdidas reportadas son de un solo batch y no garantizan éxito en el robot real.
- Sesgos y alucinaciones: no evaluados; en políticas robóticas el equivalente es la ejecución de acciones fuera de distribución, no documentada aquí.
- El pico de pérdida en la iteración 2995 en las cuatro ejecuciones ghost sugiere sensibilidad a batches concretos; no se investigó su causa.
- Repositorio de 117,4 GB con diez ejecuciones y tres checkpoints cada una: coste de almacenamiento y descarga elevado.
- Dependencia del pipeline WATCH/Cosmos y de scripts específicos (`convert_dcp_to_pt.py`, manifiestos de recuperación) para reproducir los resultados.
- Fechas de creación y actualización (noviembre de 2026) posteriores a la fecha habitual de referencia; verificar vigencia de los enlaces y del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/watch-2026-icl/watch-2026-posttrain-robot-icl
- Dataset de teleoperación referenciado: https://huggingface.co/datasets/Jeongeun/sprout-real-3task
- Checkpoint WATCH mid referenciado: https://huggingface.co/Jeongeun/cosmos-policy-watch-mid
- Repositorio de código referenciado (commits `ba60b7a`, `8839f6e`, `94d39f4`): https://github.com/jeongeun980906/watch
- Documentación interna citada: `docs/real-robot-icl.md` y `docs/real-robot-icl-r29.md` (en el repositorio de código anterior)
