# yuhengtu-bytedance/sfm_baseline_filtered-10k_11k_12k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_baseline_filtered-10k_11k_12k_merge` es un modelo de lenguaje de 6.856.253.440 parámetros (aproximadamente 6,8 mil millones) generado mediante la fusión de tres checkpoints intermedios de un mismo proceso de pre-entrenamiento. El autor, asociado a ByteDance (por la ruta `/opt/tiger/`), emplea la técnica de *model merging* con el método Linear implementado en mergekit, que promedia los pesos de los checkpoints con normalización. Este modelo forma parte de una investigación más amplia sobre la fusión de modelos durante la fase de pre-entrenamiento, un área aún poco explorada en comparación con el merging aplicado a modelos ya afinados.

La relevancia de este modelo radica en que permite estudiar si combinar pesos de diferentes etapas del pre-entrenamiento puede mejorar la calidad del modelo final sin necesidad de entrenamiento adicional. El resultado es un modelo de tipo GPT-NeoX (arquitectura transformer decoder) con pesos en formato `safetensors` y precisión `bfloat16`. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia, lo que limita su uso directo en producción, pero lo convierte en una pieza interesante para experimentos de investigación en merging y continuidad de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante la fusión lineal de tres checkpoints de un mismo modelo base pre-entrenado: `global_step10000`, `global_step11000` y `global_step11921` (este último actúa como base). El método Linear, descrito en el artículo arXiv:2203.05482 (model soups), promedia los pesos de los tres checkpoints con peso 1.0 cada uno, aplicando normalización y convirtiendo el resultado a `bfloat16`. La configuración YAML indica que la fusión se realizó en `float32` y se exportó a `bfloat16`.

No se especifica el dataset de pre-entrenamiento ni el número de tokens utilizados. El nombre `baseline_filtered` sugiere que los checkpoints provienen de un entrenamiento con datos filtrados, pero no hay detalles adicionales. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un modelo base sin fine-tuning posterior.

## Capacidades

- Generación de texto: al ser un modelo base de tipo GPT-NeoX, es capaz de generar texto autocompletando o continuando secuencias, aunque sin instrucciones específicas.
- Razonamiento y conocimiento general: limitado a lo aprendido durante el pre-entrenamiento, sin datos concretos sobre su rendimiento en tareas de razonamiento.
- No se ha documentado soporte para *tool calling*, *function calling*, agentes o razonamiento multi-paso.
- No se ha documentado capacidad multilingüe específica; los idiomas soportados no están disponibles.
- No se ha documentado modo *thinking*, visión ni audio.

## Casos de uso

- Investigación sobre *model merging*: este modelo sirve como caso de estudio para analizar cómo la fusión de checkpoints intermedios afecta a la calidad del modelo resultante. Los investigadores pueden comparar su rendimiento con el del checkpoint base (global_step11921) y con otros merges de diferentes pasos.
- Base para fine-tuning: al ser un modelo base de 6,8B parámetros, puede utilizarse como punto de partida para fine-tuning en tareas específicas de NLP, aunque su licencia no disponible limita su uso comercial.
- Experimentos de continuidad de pre-entrenamiento: permite probar si un modelo fusionado puede continuar entrenándose con mejores propiedades de convergencia que un checkpoint individual.
- Evaluación de técnicas de fusión: se puede emplear para validar el método Linear frente a otros métodos de merging (TIES, DARE, etc.) en el contexto de pre-entrenamiento.
- Análisis de estabilidad de pesos: al fusionar checkpoints de diferentes pasos, se puede estudiar la variabilidad de los pesos durante el entrenamiento y su impacto en el rendimiento final.
- Reproducción de resultados académicos: dado que el modelo está vinculado al paper de ByteDance sobre merging en pre-entrenamiento, puede usarse para reproducir o extender los experimentos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,8B parámetros en `bfloat16`, se necesitan aproximadamente 13,6 GB de VRAM solo para los pesos. Con cuantización a 4 bits (si se generara), bajaría a unos 3,5-4 GB.
- GPU recomendadas: para inferencia en `bfloat16` se requiere una GPU con al menos 16 GB de VRAM, como una RTX 4090, A100 (40 GB) o H100. Con cuantización 8 bits podría caber en una RTX 3090 (24 GB) o similar.
- En GPUs de consumo: es posible ejecutarlo en una RTX 3090 o RTX 4090 con cuantización, pero no se ha verificado la compatibilidad con formatos GGUF o AWQ.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). No se ha confirmado su integración con Ollama.
- Latencia y throughput: no se dispone de datos medidos. Como referencia orientativa, un modelo de 7B en una A100 suele ofrecer entre 20 y 50 tokens por segundo en generación, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de la misma categoría. El modelo no tiene datos de rendimiento publicados, y su licencia y contexto son desconocidos. Se puede mencionar que comparte tamaño con Llama 2 7B o Mistral 7B, pero no hay métricas que permitan una comparación objetiva. La única referencia cercana es el modelo `yuhengtu-bytedance/sfm-baseline-filtered-4k-5k-6k-avg`, que sigue la misma metodología de merging con otros checkpoints, pero tampoco tiene datos públicos de rendimiento.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o alucinaciones; al ser un modelo base sin alineación, es probable que presente sesgos presentes en los datos de pre-entrenamiento y genere contenido no verificado.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o de redistribución. Se recomienda contactar con el autor antes de cualquier uso en producción.
- No se especifica la longitud de contexto, por lo que se desconoce el límite de tokens de entrada. Es probable que sea similar a otros modelos GPT-NeoX (2048 o 4096), pero no está confirmado.
- El modelo es un artefacto de investigación, no un producto final. No ha pasado por procesos de alineación ni evaluación exhaustiva, por lo que no es adecuado para aplicaciones críticas.
- La fecha de creación (2026-08-29) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un experimento interno o un error de metadatos. Esto añade incertidumbre sobre su validez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-10k_11k_12k_merge
- Paper sobre model merging en pre-entrenamiento (arXiv:2505.12082): https://arxiv.org/pdf/2505.12082v1
- Blog de ByteDance sobre el mismo tema: https://seed.bytedance.com/en/public_papers/model-merging-in-pre-training-of-large-language-models
- Modelo relacionado (misma metodología, otros checkpoints): https://huggingface.co/yuhengtu-bytedance/sfm-baseline-filtered-4k-5k-6k-avg
