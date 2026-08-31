# sxiong/SWAP_FOLIO_Gen_Llama3-8B-LoRA

## Resumen

El modelo `sxiong/SWAP_FOLIO_Gen_Llama3-8B-LoRA` es un adaptador LoRA entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para la generación de representaciones lógicas formales en el dominio de FOLIO (First-Order Logic Inference and Ontology). Ha sido desarrollado por sxiong como parte del framework SWAP, presentado en el artículo "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025). Su función principal es actuar como generador dentro de un pipeline de razonamiento estructurado, transformando enunciados en lenguaje natural a fórmulas de lógica de primer orden.

El adaptador utiliza la técnica LoRA con rango 16 y alpha 16, aplicado a las proyecciones de atención y a las capas feed-forward del modelo base. El repositorio tiene un tamaño de 0.2 GB y se distribuye bajo licencia MIT, aunque el modelo base Llama-3-8B-Instruct conserva su propia licencia de Meta. Está pensado para tareas de razonamiento lógico y generación de texto, con soporte únicamente para el idioma inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer causal (Llama-3-8B-Instruct) |
| Parametros totales | No disponible (el adaptador LoRA es de 0.2 GB; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, típicamente 8k en Llama-3) |
| Tipos de cuantizacion | No disponible (el adaptador se usa con el modelo base en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (adaptador); el modelo base tiene licencia de Meta (Llama 3) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo Llama-3-8B-Instruct, con capas de atención multi-cabeza y bloques feed-forward. La técnica LoRA (Low-Rank Adaptation) introduce matrices de bajo rango en los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rango 16 y alpha 16, y bias desactivado. Esto permite un ajuste eficiente sin modificar los pesos originales del modelo base.

El entrenamiento se realizó con el dataset `sxiong/SWAP`, que a su vez se basa en el corpus FOLIO (arXiv:2209.00840), un conjunto de problemas de razonamiento lógico de primer orden. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El framework SWAP propone un enfoque de razonamiento deliberado que combina planificación estructurada con un modelo del mundo, y este adaptador actúa como generador de fórmulas lógicas dentro de ese esquema.

## Capacidades

- Generación de fórmulas de lógica de primer orden a partir de enunciados en lenguaje natural, específicamente en el dominio de FOLIO.
- Razonamiento lógico estructurado, orientado a tareas de inferencia y deducción formal.
- Generación de texto conversacional, al estar basado en el modelo instruct de Llama-3.
- Soporte para integración con el framework SWAP, que permite planificación y razonamiento multi-paso.
- No se han documentado capacidades de tool calling, agentes autónomos, visión o audio en la información disponible.

## Casos de uso

- Razonamiento lógico automatizado: el modelo puede convertir premisas y conclusiones en lenguaje natural a representaciones formales, facilitando la verificación automática de argumentos en sistemas de IA simbólica.
- Asistencia en educación: puede utilizarse para generar ejercicios de lógica de primer orden o para explicar la formalización de enunciados, ayudando a estudiantes de filosofía o informática.
- Verificación de consistencia en bases de conocimiento: al transformar texto a lógica formal, permite detectar contradicciones o inferencias no válidas en ontologías.
- Integración en pipelines de razonamiento neuro-simbólico: como generador dentro del framework SWAP, puede combinarse con un discriminador para tareas de razonamiento deliberado.
- Generación de datos sintéticos para entrenamiento: puede producir pares de texto-fórmula lógica que sirvan para aumentar otros datasets de razonamiento.
- Investigación en procesamiento del lenguaje natural: útil para experimentos sobre razonamiento lógico en modelos de lenguaje, dado su enfoque específico en FOLIO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador concreto. El artículo asociado (ACL 2025) podría contener evaluaciones, pero no se han proporcionado en la documentación del repositorio.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.2 GB), pero requiere cargar el modelo base Llama-3-8B-Instruct completo, que en bfloat16 ocupa aproximadamente 16 GB de VRAM.
- Para inferencia en GPU, se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB o superior). En cuantización de 8 bits podría caber en GPUs con 12 GB, pero no se ha verificado.
- El despliegue puede realizarse con la librería `transformers` y `peft`, cargando el adaptador sobre el modelo base. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador, aunque no se ha documentado explícitamente.
- La latencia y el throughput dependen del hardware y de la configuración; no se han proporcionado datos específicos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para razonamiento lógico sobre Llama-3-8B). Existen otros adaptadores del mismo autor para otros datasets (por ejemplo, `sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA`), pero no se han publicado comparativas de rendimiento entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en el dominio FOLIO y puede no generalizar bien a otros tipos de razonamiento lógico o a otros idiomas (solo inglés).
- Al ser un adaptador LoRA, su rendimiento depende en gran medida del modelo base; cualquier sesgo o limitación de Llama-3-8B-Instruct se hereda.
- Existe riesgo de alucinación en tareas fuera de su dominio de entrenamiento, especialmente en generación de texto libre.
- La licencia MIT se aplica únicamente al adaptador; el uso del modelo base está sujeto a la licencia de Meta (Llama 3), que puede tener restricciones para ciertos usos comerciales.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus académico, puede tener limitaciones en contextos coloquiales o técnicos no cubiertos.
- Para producción, es necesario validar la calidad de las fórmulas generadas, ya que errores en la formalización lógica pueden propagarse en sistemas aguas abajo.

## Enlaces

- [HuggingFace - sxiong/SWAP_FOLIO_Gen_Llama3-8B-LoRA](https://huggingface.co/sxiong/SWAP_FOLIO_Gen_Llama3-8B-LoRA)
- [Dataset SWAP](https://huggingface.co/datasets/sxiong/SWAP)
- [Paper FOLIO (arXiv:2209.00840)](https://arxiv.org/pdf/2209.00840)
- [Repositorio GitHub de SWAP](https://github.com/xiongsiheng/SWAP)
- [Artículo ACL 2025 (referencia en la model card)](https://aclanthology.org/2025.acl-long.xxx) (no se ha verificado el enlace directo)
