# watch-2026/watch-2026-posttrain-sim

## Resumen

`watch-2026/watch-2026-posttrain-sim` es un repositorio de checkpoints publicado por el usuario `watch-2026` que recoge los experimentos de réplica (rebuttal) del trabajo WATCH, "Learning Transferable World-Action Models from Task-Paired Human Videos" (arXiv 2610.14351). No se trata de un modelo de lenguaje, sino de un conjunto de pesos consolidados de un world-action model entrenado a partir de vídeos humanos emparejados por tarea, orientado a control robótico. Los checkpoints se han entrenado con el código del repositorio `jeongeun980906/watch` y corresponden a variantes post-entrenadas sobre el robot GR1 v6 con demostraciones en contexto (ICL).

El repositorio contiene tres ejecuciones de ablación: dos basadas en trayectorias de mano estimadas con HaWoR (una de ellas ampliada con episodios de MimicDroid) y una que aplica un objetivo de alineamiento entre demostraciones de estilo Vid2Robot sobre el backbone de WATCH. Cada ejecución incluye el modelo intermedio de pre-entrenamiento (`model_000008000.pt`), el checkpoint de post-entrenamiento (`model_000004000.pt`), el `config.yaml`, el log del lanzador y los resúmenes de evaluación por átomo. El tamaño total del repositorio es de 15,7 GB.

La relevancia del repositorio es acotada: no publica un modelo listo para uso general, sino material de reproducibilidad para una comparación de ablaciones. Las cifras de éxito reportadas quedan por debajo de la referencia de WATCH en el promedio de niveles (53,0, 52,0 y 53,1 frente a 68,3), lo que sugiere que las variantes probadas no recuperan el rendimiento del método original en las condiciones descritas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model; backbone de WATCH, detalles no publicados en el repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints consolidados en `.pt`) |
| Idiomas soportados | no disponible (modelo orientado a percepción y acción, no a texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` consolidados, con `config.yaml` y `sha256.txt` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El repositorio describe un pipeline de dos fases: una pre-entrenamiento intermedio (mid) sobre vídeos humanos, identificado como `egoverse_ret_v3_448_state_hawor_full_4node` con checkpoint `model_000008000.pt`, y un post-entrenamiento sobre GR1 v6 con demostraciones en contexto, en carpetas `gr1_posttrain_v6_448_state_<run>_4node` con checkpoint `model_000004000.pt`. Los nombres sugieren resolución de 448 píxeles y estado (`state`) como entrada, pero no se especifican capas, atención ni número de tokens de entrenamiento.

Las tres variantes exploran cambios concretos respecto a WATCH: (1) HaWoR v1, con trayectorias de mano estimadas desde RGB mediante HaWoR en una primera conversión y sin episodios de juego de MimicDroid; (2) HaWoR+MD, con una segunda conversión de HaWoR más 20 episodios de juego de MimicDroid; (3) v2r_align, que aplica un objetivo de alineamiento entre demostraciones al estilo Vid2Robot manteniendo el backbone, los datos y el presupuesto de WATCH. No se documentan etapas de RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Control robótico por imitación: los checkpoints están entrenados para ejecutar tareas sobre el robot GR1 v6 a partir de demostraciones en contexto.
- Aprendizaje en contexto (ICL): el post-entrenamiento incorpora demostraciones en el prompt, según el nombre de las carpetas (`icl`).
- Modelado mundo-acción: el trabajo de origen plantea aprender representaciones transferibles de mundo y acción a partir de vídeos humanos emparejados por tarea.
- Evaluación por niveles de dificultad: los resúmenes incluyen tablas por nivel (L1, L2, L3) sobre 37 átomos de 10 episodios.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling ni agentes multi-paso.

## Casos de uso

- Reproducción de ablaciones de WATCH: descargar una ejecución concreta con `hf download ... --include "gr1_posttrain_v6_448_state_hawor_full_md_4node/*"` y comparar sus tasas de éxito con las de la referencia publicada en arXiv v1.
- Investigación en imitación robótica: usar los checkpoints de GR1 v6 para estudiar cómo afecta la fuente de trayectorias de mano (HaWoR frente a HaWoR+MD) al rendimiento por nivel de dificultad.
- Estudio de objetivos de alineamiento entre demostraciones: la variante `v2r_align` permite analizar el efecto de un objetivo estilo Vid2Robot sobre el mismo backbone y presupuesto de datos.
- Verificación de pipelines de evaluación: los logs por átomo y las tablas por nivel permiten auditar la variabilidad de una única semilla y contrastar resultados entre GPUs A100 y H200.
- Base para post-entrenamiento propio: el checkpoint intermedio `model_000008000.pt` puede servir como punto de partida para nuevos post-entrenamientos sobre GR1 v6 con configuraciones modificadas.
- Docencia y divulgación: el material de ablación con cifras explícitas de éxito por nivel es útil para explicar metodología experimental en robótica de imitación.

## Benchmarks y rendimiento

Tasas de éxito en porcentaje sobre 37 átomos de 10 episodios, una sola semilla. El promedio de nivel es la media sobre las 4 tareas del nivel.

| Ejecucion | GR1 L1 | GR1 L2 | GR1 L3 | Promedio |
|---|---|---|---|---|
| HaWoR v1 | 93,3 | 42,3 | 23,3 | 53,0 |
| HaWoR+MD | 90,0 | 46,0 | 20,0 | 52,0 |
| v2r_align | 74,2 | 28,5 | 56,7 | 53,1 |
| WATCH (referencia arXiv v1) | 91,7 | 72,5 | 40,8 | 68,3 |

La evaluación de HaWoR v1 se ejecutó en GPUs A100 y las otras dos en GPUs H200. En el pipeline A100, el checkpoint público `Jeongeun/watch-gr1-v6-icl-4k` obtuvo L2 74,4 y L3 43,3, próximo al paper. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no indica el número de parámetros ni el consumo de memoria.
- GPU empleadas en la evaluación: A100 (HaWoR v1) y H200 (HaWoR+MD y v2r_align), en configuraciones de 4 nodos según los nombres de carpeta (`4node`).
- Compatibilidad con GPU de consumo: no disponible; no se documenta ningún despliegue en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: no se documentan servidores de inferencia (vLLM, TGI, llama.cpp, Ollama). El material se limita a checkpoints `.pt` cargados por el código de evaluación de `jeongeun980906/watch`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento GR1 (promedio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| watch-2026-posttrain-sim (HaWoR v1) | no disponible | no disponible | 53,0 | no disponible | checkpoints en HF |
| watch-2026-posttrain-sim (HaWoR+MD) | no disponible | no disponible | 52,0 | no disponible | checkpoints en HF |
| watch-2026-posttrain-sim (v2r_align) | no disponible | no disponible | 53,1 | no disponible | checkpoints en HF |
| WATCH (referencia) | no disponible | no disponible | 68,3 | no disponible | checkpoint público `Jeongeun/watch-gr1-v6-icl-4k` |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para generación de contenido.
- Los resultados provienen de una única semilla, por lo que la variabilidad estadística no está caracterizada.
- Las tres variantes quedan por debajo de la referencia de WATCH en el promedio (53,0, 52,0 y 53,1 frente a 68,3), con un patrón desigual por nivel: `v2r_align` mejora L3 (56,7 frente a 40,8) pero cae en L1 y L2.
- Las evaluaciones se ejecutaron en hardware distinto (A100 frente a H200), lo que puede introducir diferencias no controladas entre ejecuciones.
- La licencia no está declarada en la información disponible; no puede asumirse uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, pero al ser un modelo de acción física cualquier despliegue en robot real requiere validación de seguridad independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/watch-2026/watch-2026-posttrain-sim
- Paper WATCH (arXiv 2610.14351): https://arxiv.org/abs/2610.14351
- Página del proyecto WATCH: https://watch-wam.github.io
- Código de entrenamiento: https://github.com/jeongeun980906/watch
- Checkpoint público de referencia: https://huggingface.co/Jeongeun/watch-gr1-v6-icl-4k
