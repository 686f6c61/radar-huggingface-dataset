# spikefly/PACE-LIBERO

## Resumen

PACE-LIBERO es un checkpoint de política vision-language-action (VLA) para manipulación robótica de horizonte largo, desarrollado por Fei Ni y colaboradores (equipos vinculados a la Universidad de Liverpool, Universidad de Tianjin y otras instituciones, según la autoría del paper). El modelo parte del backbone Qwen3-VL-4B-Instruct y le añade una cabeza de acción basada en flow-matching y un mecanismo de estimación de progreso que internaliza el estado de avance de la tarea. Resuelve el problema de la manipulación multi-paso, donde el robot necesita saber no solo qué hacer sino cuánto falta para completar la tarea.

La innovación central es el "foresight anchor": una representación embebida de la tarea terminada contra la que el modelo compara su progreso actual y su compromiso hacia adelante, condicionando con ello el decodificador de acciones. Además, cada respuesta del servidor de política incluye una alarma de fallo (`audit_flag`) que detecta episodios que van mal sin alterar las acciones.

El checkpoint está entrenado conjuntamente sobre las cuatro suites de LIBERO (Spatial, Object, Goal y Long) y reporta una tasa de éxito media del 98,6 % en evaluación. Está pensado para investigación en robótica y evaluación sobre el benchmark LIBERO, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrida: backbone transformer vision-language (Qwen3-VL-4B-Instruct) + cabeza de acción flow-matching DiT-B (16 capas) + encoder de progreso DINOv2 ViT-B/14 congelado |
| Parametros totales | no disponible (repo de 10,2 GB; backbone de 4B más cabeza DiT-B y encoder DINOv2 ViT-B/14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada: imágenes 224×224 en t y t−7/t−8, instrucción; sin contexto textual declarado) |
| Tipos de cuantizacion | no disponible (se distribuye en `pytorch_model.pt` en precisión completa) |
| Idiomas soportados | no disponible (las instrucciones de LIBERO son en inglés) |
| Licencia | MIT (pesos y código); backbone Qwen3-VL-4B-Instruct Apache-2.0; DINOv2 Apache-2.0; datos LIBERO con su propia licencia |
| Formato de pesos | PyTorch (`pytorch_model.pt`, state dict completo) + `config.yaml` + `dataset_statistics.json` |

## Arquitectura y entrenamiento

PACE combina tres componentes. El backbone es Qwen3-VL-4B-Instruct, que procesa las imágenes de tercera persona y de muñeca (224×224) junto con la instrucción en lenguaje natural. Sobre él, una interfaz de progreso basada en 4 tokens de consulta de objetivo genera un *foresight anchor* (embedding de la tarea completada) y lecturas de progreso actual (p_cur) y su derivada (Δp_cur); un token de entrada Δp_prev aporta la evolución previa. El anchor, p_cur y Δp_cur se anteponen a la cabeza de acción, un DiT-B de 16 capas con flow-matching que genera chunks de 8 acciones en 4 pasos de denoising. Las acciones son deltas de efector final de 7 dimensiones (xyz, rpy, gripper), normalizadas con `dataset_statistics.json` (clave `franka`). El modelo no usa propriocepción.

El entrenamiento se realizó sobre los cuatro datasets `*_no_noops` de LIBERO (Spatial, Object, Goal y 10) en formato LeRobot, durante 30K pasos con batch de 64. El encoder de progreso DINOv2 ViT-B/14 está congelado y produce un CLS de 768 dimensiones. La receta completa se documenta en `docs/TRAINING.md` del repositorio de código. No se especifican en la información disponible el número de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generación de acciones robóticas de manipulación (deltas de efector final de 7 dimensiones) condicionadas por instrucción en lenguaje natural e imágenes.
- Estimación interna de progreso de la tarea mediante foresight anchor y lecturas p_cur / Δp_cur.
- Detección de fallo en tiempo de inferencia: cada respuesta incluye `audit_flag`, `audit_score` y `audit_stall`.
- Procesamiento multimodal de imágenes de tercera persona y de muñeca.
- Ejecución de tareas de horizonte largo (suite LIBERO-Long) y de las suites Spatial, Object y Goal.
- No dispone de tool calling, function calling ni capacidades de agente conversacional: es una política robótica, no un asistente.
- Capacidades multilingües: no documentadas; las instrucciones de LIBERO son en inglés.

## Casos de uso

- Evaluación de investigación en manipulación robótica: sirve como referencia reproducible sobre las cuatro suites de LIBERO usando `examples/LIBERO/eval_libero.sh`, lo que permite comparar recetas de VLA con una métrica estándar (98,6 % medio).
- Detección temprana de fallos en ejecución: la alarma `audit_flag` permite que un sistema supervisor aborte o reintente episodios que van mal (detecta el 92,9 % de los fallos con mediana de media tarea restante), útil en pipelines de recogida de datos donde interesa descartar episodios fallidos.
- Tareas de horizonte largo con múltiples subtareas: el foresight anchor permite condicionar la acción al avance real, adecuado para secuencias de varios pasos en entornos tipo mesa (LIBERO-Long).
- Recolección de datos robóticos con filtrado automático: el score de progreso y el stall pueden usarse para etiquetar o filtrar trayectorias antes de entrenar otros modelos.
- Base para fine-tuning en dominios propios: al derivar de Qwen3-VL-4B-Instruct y distribuirse con licencia MIT, puede adaptarse a nuevos entornos con datasets en formato LeRobot.
- Investigación en estimación de progreso: el mecanismo p_cur / Δp_cur y el anchor son componentes reutilizables para estudiar representaciones de avance en políticas VLA.
- Despliegue como servidor de política: el modelo se expone mediante un servidor de política (mencionado en la model card) que devuelve acciones y la alarma de auditoría, integrable en un bucle de control.

## Benchmarks y rendimiento

Tasa de éxito (%) en LIBERO, 10 tareas × 50 ensayos por suite, semilla 7, evaluado con `examples/LIBERO/eval_libero.sh`:

| Suite | Spatial | Object | Goal | Long | Media |
|---|---|---|---|---|---|
| PACE-LIBERO (checkpoint) | 99,0 | 99,8 | 99,4 | 96,2 | 98,6 |
| PACE (paper, Tabla 1) | 99,0 | 99,8 | 97,8 | 98,0 | 98,7 |

Alarma de fallo: con los umbrales de `config.yaml` (0,4 compartido para compromisos incumplidos; límite de stall calibrado en otros checkpoints, nunca en este), detecta el 92,9 % de los 28 episodios fallidos y el 7,2 % de los 1.972 exitosos, con una mediana de media tarea restante en el momento de la alerta.

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otras políticas VLA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 10,2 GB y el backbone es de 4B parámetros, por lo que se requiere al menos una GPU con memoria suficiente para el state dict completo más activaciones de visión y DiT (orientativamente, 16-24 GB en fp16/bf16, estimación no confirmada por el autor).
- GPU recomendadas: no especificadas; por tamaño del backbone, una A100, H100 o RTX 4090 son opciones razonables para inferencia en precisión completa.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) y posiblemente en GPUs de 16 GB con cuantización, aunque no se documentan recetas de cuantización.
- Opciones de despliegue: carga mediante `baseframework.from_pretrained(...)` del paquete `pace` y servidor de política incluido en el repositorio de código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La cabeza de acción usa 4 pasos de denoising por chunk de 8 acciones, lo que condiciona el coste por paso de control.

## Comparativa con modelos similares

| Modelo | Backbone | Contexto / entradas | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PACE-LIBERO | Qwen3-VL-4B-Instruct + DiT-B | Imágenes t y t−7/t−8, instrucción | 98,6 % medio (checkpoint) | MIT | HuggingFace (`spikefly/PACE-LIBERO`) |
| Políticas VLA de referencia en LIBERO (p. ej. OpenVLA, π0) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos numéricos de modelos comparables para establecer una comparativa rigurosa; se recomienda consultar la Tabla 1 del paper de PACE para las comparaciones originales.

## Limitaciones y advertencias

- Ámbito restringido: es una política entrenada exclusivamente sobre las cuatro suites de LIBERO; no es un modelo de propósito general y su generalización fuera de ese dominio no está documentada.
- Sin propriocepción: la política solo usa imágenes e instrucción, lo que limita su aplicabilidad en entornos donde el estado del robot es crítico.
- Dependencia del cliente: la entrada usa la consulta más reciente en o antes de t−7 (t−8 con el cliente LIBERO), lo que introduce latencia estructural en la observación.
- Idiomas: solo se documentan instrucciones en inglés; no hay evidencia de soporte multilingüe.
- Alarma de fallo no perfecta: detecta el 92,9 % de fallos pero genera falsos positivos en el 7,2 % de episodios exitosos; además, el umbral de stall se calibró en otros checkpoints, no en este.
- Restricciones de licencia: los pesos PACE son MIT, pero el backbone Qwen3-VL-4B-Instruct y DINOv2 son Apache-2.0 y los datos LIBERO tienen su propia licencia; el uso comercial debe verificar el cumplimiento de todas ellas.
- Riesgo de sobreajuste al benchmark: el checkpoint fue reentrenado con el código liberado tras la publicación, y las cifras del paper difieren ligeramente de las del checkpoint (98,7 vs. 98,6 de media), por lo que conviene tratar los resultados como específicos de esta receta.
- Sin datos publicados de sesgos, alucinación en lenguaje o robustez ante instrucciones ambiguas; al ser una política de acciones, el riesgo principal es la ejecución incorrecta de la tarea, no la generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spikefly/PACE-LIBERO
- Código: https://github.com/Fei-Ni/PACE
- Documentación de entrenamiento: `docs/TRAINING.md` en el repositorio de código
- Documentación de progreso y calibración: `docs/PROGRESS.md` en el repositorio de código
- Evaluación LIBERO: `examples/LIBERO/eval_libero.sh` en el repositorio de código
- Paper: Ni et al., "PACE: Progress Actively-internalized Conditioning Execution for Long-horizon Manipulation", NeurIPS 2026 (citado en la model card; enlace directo no disponible en la información proporcionada)
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
