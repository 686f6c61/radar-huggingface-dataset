# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-5k_6k_7k_8k_9k_simpleavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje fusionado mediante la técnica de *model merging*, no un modelo entrenado desde cero. En concreto, se trata de una combinación lineal (método `linear` de mergekit) de cinco checkpoints intermedios —global_step 5000, 6000, 7000, 8000 y 9000— de un mismo entrenamiento denominado internamente `filtered_e2e_insert_hyperstition_v1`, tomando el paso 9000 como modelo base. La operación se realizó con pesos idénticos (1,0) para los cinco checkpoints y normalización activada, con cálculo en `float32` y salida en `bfloat16`.

El modelo resultante es un transformer decoder-only de arquitectura `gpt_neox` con 6.856.253.440 parámetros (aproximadamente 6,86 mil millones), pesos almacenados en `safetensors` y un tamaño de repositorio de 13,7 GB, coherente con un almacenamiento en `bfloat16` (6,86 B × 2 bytes ≈ 13,7 GB). Está publicado por el usuario `yuhengtu-bytedance` y etiquetado para `transformers`, `text-generation-inference` y uso conversacional.

Su relevancia es fundamentalmente metodológica: sirve como caso de estudio de *checkpoint averaging* sobre trayectorias de entrenamiento (una variante de la técnica de *model soups*) y como posible punto de partida para experimentos posteriores. No dispone de model card descriptiva más allá del README autogenerado por mergekit, carece de licencia declarada, de idiomas declarados y de resultados de evaluación publicados; se desconoce también la longitud de contexto. Cualquier uso en producción requiere una evaluación previa por parte del adoptante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `gpt_neox` (transformer decoder-only, según la etiqueta de la librería `transformers`) |
| Parámetros totales | 6.856.253.440 (~6,86 B, dato real de los ficheros safetensors) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos en `bfloat16`; no hay variantes GGUF, GPTQ ni AWQ en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el campo de licencia aparece vacío en HuggingFace) |
| Formato de pesos | `safetensors` (`bfloat16`; cálculo de la fusión en `float32`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `gpt_neox`, es decir, un transformer decoder-only con atención causal, normalización tipo LayerNorm/RMSNorm según la implementación de referencia de GPT-NeoX, y tokenizador BPE. Con 6,86 B de parámetros y pesos en `bfloat16`, el checkpoint ocupa 13,7 GB. No hay información pública sobre el número de capas, dimensión oculta, número de cabezas, vocabulario ni longitud de contexto, más allá de lo que se pueda inferir del propio `config.json` del repositorio.

El entrenamiento subyacente tampoco está documentado. Lo único verificable es que existen cinco checkpoints de una misma ejecución (`global_step5000` a `global_step9000`) bajo la ruta interna `/opt/tiger/Pan_Safety_Better_Measurement/merge_scaling_ckpts_cache/`, lo que sugiere un proyecto interno de medición de seguridad o de escalado de *merges*. Sobre esos checkpoints no consta número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. La innovación técnica del repositorio es únicamente la fusión: una combinación lineal con `normalize: true`, pesos idénticos de 1,0 para cada checkpoint y `out_dtype: bfloat16`, siguiendo el enfoque descrito en el artículo de *model soups* (arXiv:2203.05482), que propone promediar los pesos de varios ajustes finos sobre una misma base para mejorar la robustez sin coste adicional en inferencia.

## Capacidades

- Generación de texto autoregresiva (pipeline declarado: `text-generation`, etiqueta `conversational`).
- Uso conversacional multi-turno como formato de entrada esperado por el pipeline, sin garantía sobre calidad ni sobre la plantilla de prompt correcta.
- Razonamiento, matemáticas y generación de código: no verificables; no hay benchmarks ni documentación que los respalden.
- Tool calling / function calling: no disponible y sin evidencia en las etiquetas o el README.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento específico para ello.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades multimodales (visión, audio): no disponibles; la arquitectura `gpt_neox` es exclusivamente de texto.
- Modo *thinking*: no disponible; no hay evidencia de un modo de razonamiento extendido.
- Compatibilidad de despliegue: etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que es cargable con la pila estándar de `transformers`.

## Casos de uso

- Estudio de técnicas de *merging*: el repositorio sirve como ejemplo reproducible de una media aritmética de checkpoints de una misma ejecución; útil para investigar si el promedio de pasos intermedios mejora la estabilidad respecto a usar solo el paso final. El propio nombre (`simpleavg`) y la configuración YAML permiten replicar el experimento con mergekit.
- Evaluación comparativa de puntos de control: al disponer de una familia de checkpoints de la misma trayectoria, se puede medir la degradación o mejora de métricas (perplejidad, exactitud en tareas *few-shot*) entre el paso 5000 y la media de todos ellos, como aproximación empírica a las curvas de *merging scaling*.
- Punto de partida para ajuste fino supervisado (SFT) o LoRA: al ser un modelo denso de 6,86 B en `safetensors` y compatible con `transformers`, es un candidato razonable para ajuste con QLoRA en una única GPU de 24 GB, siempre que la licencia se aclare antes de cualquier uso comercial.
- Generación de datos sintéticos para *pipeline* internos: con contexto y calidad sin verificar, el uso realista es la generación de borradores o corpus de aumentación que pasen después por un filtro humano o por un modelo de mayor calidad.
- Despliegue en inferencia local o *edge server*: en cuantización de 4 bits el modelo ocupa del orden de 4 GB, lo que permite servirlo en una GPU de consumo o incluso en CPU con llama.cpp tras convertir los pesos a GGUF (conversión no incluida en el repositorio).
- *Baseline* en pruebas de seguridad y alineación: dado el nombre del proyecto de origen (`Pan_Safety_Better_Measurement`), puede emplearse como referencia interna para comparar respuestas frente a otros checkpoints de la misma familia en baterías de *red teaming*.
- Investigación sobre el efecto del promedio de pesos en el comportamiento conversacional: comparar cualitativamente las respuestas del merge con las del paso 9000 para detectar si el promedio suaviza o degrada la coherencia en diálogos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, no hay sección de métricas en la model card (que se limita al README autogenerado por mergekit) y la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a páginas de descarga de aplicaciones de apuestas completamente ajenas al modelo. No hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de perplejidad.

## Requisitos de hardware

- VRAM para inferencia en `bfloat16`/`float16`: aproximadamente 13,7 GB solo para los pesos, más el caché KV. Con contexto moderado, el consumo realista se sitúa entre 15 y 18 GB.
- VRAM en cuantización de 8 bits: del orden de 7-8 GB de pesos.
- VRAM en cuantización de 4 bits: del orden de 4-5 GB de pesos.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o cualquier GPU con 24 GB o más para `bfloat16`. En RTX 4090 (24 GB) cabe en `bfloat16` con contexto limitado y en 8/4 bits con holgura.
- GPU de consumo: cabe en RTX 3090, 4090, 4080 (16 GB, en 8 bits o 4 bits), 4070 Ti Super y similares. En GPUs de 12 GB o menos se requiere cuantización de 4 bits.
- Opciones de despliegue: `transformers` (nativo, `safetensors`), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama únicamente tras convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no hay mediciones publicadas. Como referencia de orden de magnitud para un modelo denso de ~6,9 B en `bfloat16`, cabe esperar decenas de miles de tokens por segundo en lote sobre una A100 con vLLM y del orden de 30-60 tokens/s en generación individual sobre una RTX 4090; son estimaciones derivadas del tamaño, no datos medidos sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`sfm_filtered_e2e_insert_hyperstition_v1-...simpleavg_merge`) | 6,86 B | No disponible | No disponible | safetensors (bf16) | HuggingFace, 0 descargas, 0 likes |
| GPT-J-6B (EleutherAI) | ~6,05 B | 2048 tokens | Apache 2.0 | safetensors, GGUF, GPTQ | Ampliamente distribuido y validado |
| Pythia-6.9B (EleutherAI) | ~6,86 B | 2048 tokens | Apache 2.0 | safetensors | Ampliamente distribuido, con 154 checkpoints públicos y benchmarks publicados |
| Mistral-7B-v0.1 | ~7,24 B | 8192 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | Muy extendido, con ecosistema de cuantizaciones |

La comparación es estructural: este merge iguala en tamaño a Pythia-6.9B y supera ligeramente a GPT-J-6B, pero a diferencia de ambos carece de licencia declarada, de contexto documentado y de cualquier evaluación publicada. Frente a Mistral-7B, la diferencia principal no es el tamaño sino la ausencia total de garantías de calidad, contexto y licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Es un bloqueo para producción hasta que el autor aclare los términos.
- Origen interno y no documentado: las rutas del README (`/opt/tiger/Pan_Safety_Better_Measurement/...`) apuntan a un experimento privado; no hay información sobre los datos de entrenamiento, por lo que no se puede evaluar sesgo, contaminación de benchmarks ni cumplimiento normativo.
- Modelo fusionado, no un lanzamiento: los checkpoints de origen son pasos intermedios de un entrenamiento (5000-9000), no un modelo final ajustado por instrucciones. La plantilla de prompt y el comportamiento conversacional pueden no estar alineados con lo que espera un usuario final.
- Longitud de contexto desconocida: sin `config.json` documentado, no se puede planificar el uso con documentos largos ni garantizar el comportamiento más allá de la ventana de entrenamiento.
- Idiomas no declarados: no hay garantía de calidad en castellano ni en ningún otro idioma distinto del que se usó en el entrenamiento original.
- Riesgo de alucinación: al no haber ninguna evaluación ni ajuste por preferencias documentado, la fiabilidad factual es desconocida y presumiblemente baja para uso informativo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta. No existe validación por parte de la comunidad ni informes de terceros.
- Sin benchmarks: cualquier afirmación sobre su rendimiento en razonamiento, código o matemáticas carece de respaldo empírico.
- Requiere conversión para cuantización: si se necesita GGUF para llama.cpp u Ollama hay que generarlo manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-5k_6k_7k_8k_9k_simpleavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Artículo de *model soups* (método `linear`): https://arxiv.org/abs/2203.05482
- Búsqueda web realizada: no se encontró ningún resultado relevante sobre este modelo. Los enlaces devueltos correspondían a páginas de descarga de aplicaciones de apuestas (APKPure, Uptodown, Google Play) sin relación alguna con el repositorio, por lo que se omiten.
- No se han encontrado *papers*, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
