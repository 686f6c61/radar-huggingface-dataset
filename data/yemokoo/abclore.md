# YeMoKoo/abclore

## Resumen

abclore es un repositorio de checkpoints de investigación alojado en HuggingFace por el usuario YeMoKoo. No se trata de un modelo listo para producción ni de un modelo base, sino de una colección de pesos (solo pesos, sin estado del optimizador, cachés de datos, memorias de replay ni estado del entrenador) destinada a evaluación y reproducción de experimentos de aprendizaje continuo. El repositorio ocupa 177,1 GB y agrupa dos familias de experimentos: flame_wcc/ (progresión Wiki → Code → Conversation sobre FLAME-MoE) y trace/ (benchmark TRACE de 8 tareas). Los pesos están en formato Megatron torch_dist y se basan en Llama-3.1-8B-Instruct y Qwen3-8B (este último con el modo de razonamiento desactivado).

El modelo central de la colección, CLoRE, emplea una arquitectura MoE con expertos híbridos que combinan FFN y LoRA sobre las proyecciones QKVO, con una progresión de 8 → 16 → 24 expertos a lo largo de las etapas de entrenamiento. La propuesta se enmarca en la investigación sobre olvido catastrófico y ajuste continuo, y se compara contra baselines conocidos como MoE-LPR, Lifelong-MoE, EWC, Seq-LoRA, O-LoRA, S-LoRA y entrenamiento multitarea. Los resultados se reportan mediante métricas de precisión media (AA, *final_average*) y olvido (F, calculado como −BWT).

Es relevante ahora porque aborda un problema activo en la comunidad: cómo adaptar modelos de lenguaje a tareas secuenciales sin degradar el rendimiento en tareas previas, y cómo hacerlo con arquitecturas de mezcla de expertos donde el enrutamiento dinámico complica el control del olvido. Sin embargo, el repositorio no incluye licencia, no declara idiomas, no ofrece pesos convertidos a formatos de inferencia estándar (GGUF, safetensors sueltos) y no tiene descargas ni interacciones registradas, lo que lo sitúa estrictamente en el ámbito de la reproducción de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); expertos híbridos FFN + LoRA sobre QKVO; configuraciones de 8, 16 y 24 expertos |
| Parametros totales | no disponible (el repositorio suma 177,1 GB repartidos en múltiples checkpoints; no se declara el recuento por checkpoint) |
| Parametros activos | no disponible (no se especifica cuántos expertos se activan por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato Megatron torch_dist; no se mencionan variantes GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Megatron torch_dist (etiquetado como safetensors en HuggingFace); sin estado del optimizador, RNG ni cachés |

## Arquitectura y entrenamiento

La colección flame_wcc/ corresponde a FLAME-MoE y contiene checkpoints de las etapas Wiki, Code y Conversation, cada una con directorios iter_XXXXXXX/, un archivo latest_checkpointed_iteration.txt y run_metadata.json. Los checkpoints se cargan con las opciones --load <stage dir> --no-load-optim --no-load-rng, y según la model card cada tensor del modelo es bit-idéntico al checkpoint de entrenamiento original. El modelo CLoRE emplea un «mass reservoir» y expertos híbridos que combinan capas FFN con adaptadores LoRA aplicados a QKVO, escalando de 8 a 16 y finalmente a 24 expertos. Los baselines registrados en esta carpeta son wiki_source_ffn_e8 (punto de partida compartido, solo FFN con 8 expertos), MoE-LPR con γ = 0,1 (con y sin revisión del enrutador) y Lifelong-MoE con λ_KL = 1,0.

La colección trace/ contiene ejecuciones sobre el benchmark TRACE de 8 tareas con evaluación sparse-15. Cada directorio de ejecución incluye rondas 0 a 7 (tras la tarea 1 hasta la 8, siendo 7 la final), resultados en evaluation/order*/results-*.json, un sparse15_summary.json y el comando de entrenamiento con su configuración. Las ejecuciones se dividen en dos bases: Llama-3.1-8B-Instruct (con baselines seq_lora, ewc, olora, slora_r64, moe_lpr_g0.1, lifelong_moe_kd1.5 y las ablaciones de CLoRE no_reservoir y learned_bos) y Qwen3-8B en modo think-off con --conv-mode qwen3 (con los baselines mtl, moe_lpr_g0.1 y lifelong_moe_kd1.5). No se detalla el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo fases de RLHF o DPO.

## Capacidades

- Reproducción de experimentos de aprendizaje continuo: el repositorio está diseñado explícitamente para evaluación, no para reanudar entrenamiento.
- Evaluación comparativa de métodos de ajuste continuo: incluye checkpoints para CLoRE, MoE-LPR, Lifelong-MoE, EWC, Seq-LoRA, O-LoRA, S-LoRA y entrenamiento multitarea.
- Generación de texto a través de los modelos base subyacentes (Llama-3.1-8B-Instruct y Qwen3-8B), aunque no se documentan capacidades específicas del ajuste.
- Ablaciones controladas: variantes no_reservoir y learned_bos permiten aislar el efecto de componentes concretos de CLoRE.
- Evaluación en dominios Wiki, código y conversación mediante sondas de precisión.
- Evaluación sobre el benchmark TRACE con 8 tareas y protocolo sparse-15.
- No se documenta soporte de tool calling, function calling, uso como agente, capacidades multimodales, visión ni audio.

## Casos de uso

- Reproducción de resultados de investigación en aprendizaje continuo: cargar los checkpoints con Megatron usando --load <stage dir> --no-load-optim --no-load-rng y verificar las métricas AA y F reportadas en sparse15_summary.json.
- Estudio del olvido catastrófico en MoE: comparar CLoRE (AA 50,58, F 0,26 en flame_wcc) frente a Lifelong-MoE (AA 37,28) y MoE-LPR (AA 49,80) para analizar el compromiso entre plasticidad y retención.
- Análisis de enrutamiento de expertos: la estructura de 8 → 16 → 24 expertos y la variante aprendida learned_bos permiten estudiar cómo se asignan tokens a expertos a lo largo de etapas secuenciales.
- Comparación de métodos en el benchmark TRACE: las ejecuciones order0 a order7 sobre Llama-3.1-8B-Instruct y Qwen3-8B permiten trazar curvas de olvido tarea a tarea con los resultados en evaluation/order*/results-*.json.
- Desarrollo de nuevos baselines de ajuste continuo: la carpeta baselines/ proporciona puntos de partida homogéneos (por ejemplo, wiki_source_ffn_e8 con precisión wiki de 46,00) para evaluar métodos propios bajo condiciones controladas.
- Ajuste de hiperparámetros de regularización: los checkpoints con distintos valores de γ (MoE-LPR) y λ_KL (Lifelong-MoE) permiten estudiar la sensibilidad de estas regularizaciones en entornos de múltiples tareas.
- Auditoría de revisión del enrutador: las variantes _prereview permiten comparar el estado del enrutador antes y después de su revisión manual, útil para investigar estabilidad del enrutamiento.

## Benchmarks y rendimiento

Progresión flame_wcc (FLAME-MoE, Wiki → Code → Conversation), precisión de sonda final:

| Checkpoint | Wiki | Code | Conv | AA | FM |
|---|---|---|---|---|---|
| clore (CLoRE, mass reservoir, híbrido FFN + LoRA QKVO, 8 → 16 → 24) | 46,20 | 67,48 | 38,05 | 50,58 | 0,26 |
| baselines/wiki_source_ffn_e8 (FFN-only, 8 expertos) | 46,00 | – | – | – | – |
| baselines/moe_lpr_g0.1 (γ = 0,1, tras revisión del enrutador, iter 2160) | – | – | – | 49,80 | – |
| baselines/lifelong_moe_kl1.0 (λ_KL = 1,0) | – | – | – | 37,28 | – |

Nota: FM no se define en la información disponible.

Benchmark TRACE (8 tareas, evaluación sparse-15); AA = final_average, F = −BWT, según sparse15_summary.json de cada ejecución (S-LoRA tomado de RESULT.md):

| Ejecución | AA | F |
|---|---|---|
| llama31/baselines/seq_lora | 58,44 | 8,35 |
| llama31/baselines/ewc | 58,69 | 7,48 |
| llama31/baselines/olora | 51,81 | 6,55 |
| llama31/baselines/slora_r64 (S-LoRA, corrección de merge-scaling) | 56,08 | 10,56 |
| llama31/baselines/moe_lpr_g0.1 | 55,91 | 0,41 |
| llama31/baselines/lifelong_moe_kd1.5 | 35,11 | 16,00 |
| llama31/clore_ablation/no_reservoir (reservorio desactivado, filas nuevas aleatorias) | 62,79 | 0,58 |
| llama31/clore_ablation/learned_bos (token de generación aprendido <BoS_task>) | 60,02 | 6,69 |
| qwen3_8b/baselines/mtl (solo final) | 65,72 | – |
| qwen3_8b/baselines/moe_lpr_g0.1 | 59,62 | 5,50 |
| qwen3_8b/baselines/lifelong_moe_kd1.5 | 43,20 | 9,77 |

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores corresponden exclusivamente a protocolos de aprendizaje continuo.

## Requisitos de hardware

- Los pesos están en formato Megatron torch_dist y requieren el stack de Megatron para su carga; no son directamente cargables por llama.cpp, Ollama, vLLM o TGI sin una conversión previa.
- El repositorio completo ocupa 177,1 GB; conviene descargar únicamente las etapas o rondas necesarias para cada evaluación.
- Para inferencia sobre un modelo base de 8B en FP16 se estiman en torno a 16 GB de VRAM; en 8 bits unos 8-9 GB y en 4 bits unos 5-6 GB. Estas cifras son estimaciones a partir del tamaño de los modelos base y no están confirmadas en la información proporcionada.
- Las configuraciones con más expertos (hasta 24) pueden aumentar significativamente los parámetros totales respecto al modelo base; no se dispone de cifras de VRAM específicas para CLoRE.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) podría alojar un 8B en FP16, y una A100 o H100 (40-80 GB) daría margen para configuraciones con más expertos, pero esto no se confirma en la documentación.
- Opciones de despliegue: Megatron (formato nativo documentado). No se documentan vLLM, llama.cpp, Ollama, TGI ni convertidores oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (TRACE AA) |
|---|---|---|---|---|---|
| abclore / CLoRE (llama31) | no disponible (MoE con reservorio de masa) | no disponible | no disponible | Checkpoints de investigación, sin descargas | 50,58 (flame_wcc); ablaciones 60,02-62,79 (TRACE) |
| Llama-3.1-8B-Instruct (base) | 8B | no disponible en la información | Llama 3.1 Community License (según modelo base; no confirmado para este repo) | Ampliamente disponible | No evaluado en TRACE como base pura en la información |
| Qwen3-8B (base, think-off) | 8B | no disponible en la información | Apache 2.0 (según modelo base; no confirmado para este repo) | Ampliamente disponible | MTL 65,72 (referencia superior) |
| Lifelong-MoE (baseline) | no disponible | no disponible | no disponible | Incluido en este repo | llama31 35,11; qwen3_8b 43,20 |
| MoE-LPR (baseline) | no disponible | no disponible | no disponible | Incluido en este repo | llama31 55,91; qwen3_8b 59,62 |

La comparación directa con alternativas externas no es posible porque el repositorio no declara parámetros totales, contexto, licencia ni rendimiento en benchmarks de propósito general. Los únicos puntos de comparación verificables son internos al propio repositorio.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial o la redistribución de los pesos quedan sin cobertura legal explícita.
- El repositorio se marca como privado en el frontmatter de la model card (private: true), lo que puede condicionar su acceso y uso.
- Los checkpoints son solo pesos: no permiten reanudar entrenamiento al carecer de estado del optimizador, RNG, cachés de datos y memorias de replay.
- Están diseñados para evaluación, no para despliegue en producción; no se documentan canales de inferencia ni configuraciones de servido.
- Formato Megatron torch_dist: requiere conversión para su uso con herramientas de inferencia convencionales, lo que añade fricción y riesgo de incompatibilidades.
- Sin datos de idiomas: se desconoce la cobertura multilingüe real más allá de la de los modelos base.
- Sin longitud de contexto declarada: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración heredada del modelo base.
- Riesgo de alucinación no cuantificado: no se reportan evaluaciones de fidelidad, veracidad ni robustez.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad ni alineación.
- Sin tracción comunitaria: 0 descargas y 0 interacciones, lo que implica ausencia de validación externa y de soporte.
- La fecha de creación y actualización registrada (2026-09-26) es posterior a la fecha actual habitual de consulta, lo que conviene verificar antes de tomar decisiones basadas en ella.
- Los resultados de TRACE muestran olvido (F) no nulo en la mayoría de configuraciones, con casos como lifelong_moe_kd1.5 (F 16,00) donde la retención es claramente deficiente; cualquier uso derivado debe asumir este comportamiento.
- El baseline MTL de qwen3_8b alcanza AA 65,72 sin olvido medido, por encima de la mayoría de métodos incrementales del repositorio, lo que relativiza la ventaja de los enfoques continuos en este conjunto de tareas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/YeMoKoo/abclore
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código o demos adicionales asociados a este modelo.
