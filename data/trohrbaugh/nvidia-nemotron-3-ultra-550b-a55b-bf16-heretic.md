# trohrbaugh/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16-heretic

## Resumen

Este modelo es una versión "decensored" (abliterada) del modelo NVIDIA Nemotron-3 Ultra 550B A55B, publicada por el usuario trohrbaugh. El modelo original, desarrollado por NVIDIA, es un LLM de frontera con 550B parámetros totales y 55B activos, basado en una arquitectura híbrida LatentMoE que combina Mamba-2, atención y capas MoE, con soporte de Multi-Token Prediction (MTP) y una ventana de contexto de hasta 1M tokens. La versión heretic aplica una técnica de abliteration mediante la herramienta Heretic (fork personalizado) para eliminar los rechazos del modelo original, manteniendo una divergencia KL de 0.2647 respecto al original y reduciendo los rechazos de 100/100 a 0/100 en las pruebas reportadas.

La relevancia de esta variante radica en ofrecer una alternativa sin censura para casos de uso donde el modelo base se niega a responder, como investigación en seguridad de IA, análisis de contenido sensible o generación creativa sin restricciones. Sin embargo, al ser una modificación de un tercero, no cuenta con el respaldo oficial de NVIDIA y presenta riesgos adicionales de generación de contenido inapropiado o dañino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida: Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 550B |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16 (según el nombre del modelo); no se mencionan otras cuantizaciones |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, japonés, hindi, coreano, portugués brasileño, chino (según model card original); los tags adicionales incluyen hebreo y árabe |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron-3 Ultra 550B A55B, emplea una arquitectura LatentMoE que integra capas de Mamba-2 (modelos de espacio de estado) con capas de atención y mezclas de expertos (MoE), junto con un mecanismo de Multi-Token Prediction para mejorar la eficiencia predictiva. El entrenamiento se realizó con los datasets públicos de NVIDIA `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, con fechas de corte de septiembre de 2025 (pre-entrenamiento) y mayo de 2026 (post-entrenamiento). El modelo incluye un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`).

La versión heretic aplica una técnica de abliteration (eliminación de direcciones de rechazo) usando la herramienta Heretic en su versión 1.3.0+custom. Los parámetros de abliteration reportados incluyen `direction_index` por capa, así como pesos máximos y mínimos en las proyecciones `attn.o_proj`, `mamba.out_proj` y `mlp.down_proj`. El proceso reduce la divergencia KL a 0.2647 con respecto al original, lo que indica que el comportamiento general se mantiene cercano, aunque con la eliminación de los rechazos.

## Capacidades

- Generación de texto y razonamiento de frontera: el modelo base está diseñado para tareas de razonamiento complejo y análisis de contexto largo.
- Soporte de agentes y flujos multi-paso: indicado para "complex agentic workflows" y "tool use" según la model card original.
- Análisis de contexto largo: ventana de hasta 1M tokens, adecuada para RAG de alto riesgo y procesamiento de documentos extensos.
- Capacidades multilingües: al menos 10 idiomas principales, más hebreo y árabe según los tags del repositorio.
- Modo de razonamiento configurable: se puede activar o desactivar mediante la plantilla de chat.
- Ausencia de rechazos: el modelo no se niega a responder a peticiones que el modelo original rechazaría (0/100 refusals en las pruebas reportadas).

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin restricciones de rechazo para evaluar riesgos de jailbreak, sesgos o alucinaciones en escenarios adversarios.
- Generación de contenido creativo sin censura: escritura de ficción, diálogos o guiones donde el modelo original podría negarse por contenido sensible.
- Análisis de textos polémicos o sensibles: procesamiento de documentos con lenguaje explícito o temas tabú donde un modelo censurado no responde.
- Desarrollo de agentes para entornos controlados: pruebas de herramientas y flujos agénticos donde se requiere una respuesta incondicional, siempre bajo supervisión humana.
- Evaluación de alineación: comparar el comportamiento de un modelo abliterado frente al original para medir el impacto de la eliminación de rechazos.
- Auditoría de sesgos: identificar qué tipos de peticiones generan rechazo en el modelo original y cómo responde la versión decensored, útil para mejorar políticas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento reportada en la model card es la comparación entre la versión heretic y el modelo original:

| Metrica | Modelo heretic | Modelo original |
| :------ | :------------: | :--------------: |
| Divergencia KL | 0.2647 | 0 (por definicion) |
| Rechazos (refusals) | 0/100 | 100/100 |

Estos datos indican que la abliteration elimina por completo los rechazos en las 100 pruebas realizadas, con una divergencia KL baja pero no nula, lo que sugiere cambios menores en el comportamiento general.

## Requisitos de hardware

- VRAM estimada: no disponible, pero dado el tamaño de 550B parámetros en BF16, se requieren múltiples GPUs de alta gama.
- GPU recomendadas según la model card original: mínimo 8x GB200/B200/GB300/B300, 16x H100 o 8x H200.
- No cabe en GPUs de consumo (RTX 4090, etc.) por su tamaño y requisitos de memoria.
- Opciones de despliegue: no se especifican en la documentación, pero al ser un modelo transformers con pesos safetensors, es compatible con frameworks como vLLM, TGI o TensorRT-LLM (este último habitual en entornos NVIDIA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada. La única comparación posible es con el modelo original sin abliterar:

| Modelo | Parametros | Contexto | Licencia | Rechazos |
| :------ | :---------: | :------: | :------: | :------: |
| NVIDIA Nemotron-3 Ultra 550B A55B (original) | 550B (55B activos) | Hasta 1M | OpenMDW-1.1 | 100/100 |
| Versión heretic (este modelo) | 550B (55B activos) | Hasta 1M | OpenMDW-1.1 | 0/100 |

No se han encontrado datos de otros modelos comparables (p.ej., Llama, Qwen, DeepSeek) en la información disponible.

## Limitaciones y advertencias

- Modelo abliterado: la eliminación de rechazos puede provocar la generación de contenido dañino, ilegal, violento o sexualmente explícito sin advertencias. El uso debe ser estrictamente responsable y en entornos controlados.
- Divergencia KL no nula: aunque baja (0.2647), la abliteration puede alterar el comportamiento en otros aspectos no evaluados, como la calidad de razonamiento o la coherencia.
- Sin benchmarks de calidad: no hay datos de rendimiento en tareas estándar, por lo que no se puede garantizar que mantenga las capacidades del modelo original.
- Requisitos de hardware muy elevados: no es accesible para la mayoría de usuarios; requiere infraestructura de nivel centro de datos.
- Licencia OpenMDW-1.1: es una licencia con condiciones específicas (probablemente de uso no comercial o con restricciones). Se debe revisar el texto completo antes de cualquier uso comercial.
- Modelo de terceros: no está respaldado por NVIDIA; la modificación puede introducir vulnerabilidades o comportamientos imprevistos.
- Fecha de creación futura (2026-08-15): el modelo es muy reciente y no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio HuggingFace de la versión heretic: https://huggingface.co/trohrbaugh/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16-heretic
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
- Herramienta Heretic (original): https://github.com/p-e-w/heretic
- Fork personalizado de Heretic: https://github.com/timrohrbaugh/heretic
- Informe técnico de NVIDIA Nemotron-3 Ultra: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
