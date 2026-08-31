# sxiong/SWAP_ReClor_Gen_Llama3-8B-LoRA

## Resumen

Este modelo es un adaptador LoRA entrenado sobre el modelo base `meta-llama/Meta-Llama-3-8B-Instruct` para actuar como generador en el dataset ReClor, un benchmark de comprensión lectora con razonamiento lógico. Forma parte del framework SWAP, que propone el razonamiento deliberado como planificación estructurada con un modelo del mundo preciso. El adaptador se ha entrenado con el dataset `sxiong/SWAP` y está diseñado para generar respuestas o explicaciones lógicas en tareas de opción múltiple. Su relevancia radica en que ofrece una especialización ligera y reutilizable sobre un modelo base potente, permitiendo integrar razonamiento lógico en aplicaciones de procesamiento de lenguaje natural sin necesidad de reentrenar el modelo completo. El adaptador tiene un tamaño de 0.2 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3-8B-Instruct (base) + adaptador LoRA |
| Parametros totales | 8 mil millones (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base Llama-3-8B-Instruct, que es un transformer autoregresivo con 8 mil millones de parámetros. El adaptador tiene un rango (`r`) de 16 y un valor `alpha` de 16, y se aplica a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas de MLP (`gate_proj`, `up_proj`, `down_proj`), con `bias` desactivado. El entrenamiento se realizó sobre el dataset ReClor, que contiene preguntas de razonamiento lógico con opciones múltiples, y se enmarca en el método SWAP descrito en el artículo "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO; la información disponible solo indica que se trata de un ajuste fino con LoRA.

## Capacidades

- Generación de texto en inglés, especializada en tareas de razonamiento lógico y comprensión lectora.
- Generación de respuestas o explicaciones para preguntas de opción múltiple del estilo ReClor.
- Integración como componente generador en el framework SWAP, que combina planificación estructurada con razonamiento deliberado.
- Capacidad de adaptación a otros dominios mediante fine-tuning adicional sobre el adaptador.
- No se documentan capacidades de tool calling, agentes, visión o audio; el modelo es exclusivamente de texto.

## Casos de uso

- Generación de preguntas de razonamiento lógico para plataformas educativas: el adaptador puede producir ítems de opción múltiple con distractores plausibles, aprovechando su entrenamiento en ReClor.
- Asistencia en sistemas de tutoría inteligente: puede generar explicaciones paso a paso para problemas de lógica, ayudando a estudiantes a comprender el razonamiento subyacente.
- Componente generador en pipelines de razonamiento estructurado: dentro del framework SWAP, se usa para proponer hipótesis o respuestas que luego se verifican con un modelo del mundo.
- Evaluación de modelos de lenguaje: al generar ejemplos de razonamiento lógico, puede servir para construir conjuntos de prueba o para medir la capacidad de otros modelos en tareas similares.
- Aumento de datos para entrenamiento: el adaptador puede generar variaciones de preguntas lógicas, enriqueciendo datasets existentes para fine-tuning de otros modelos.
- Investigación en razonamiento deliberado: permite reproducir y extender los experimentos del artículo SWAP, ya que el adaptador está disponible públicamente con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador específico.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.2 GB, por lo que el requisito principal es el modelo base Llama-3-8B-Instruct.
- Para inferencia en FP16, el modelo base requiere aproximadamente 16 GB de VRAM; con cuantización a 4 bits puede caber en GPUs con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060).
- GPUs recomendadas: NVIDIA A100, H100, RTX 3090, RTX 4090, o cualquier GPU con al menos 16 GB de VRAM para FP16.
- El adaptador se puede cargar con la librería PEFT sobre el modelo base, y el despliegue puede realizarse con Transformers, vLLM, llama.cpp u Ollama, siempre que se soporte la carga de adaptadores LoRA.
- No se dispone de datos de latencia o throughput específicos para este adaptador; dependerán del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Tamaño del adaptador | Licencia |
|---|---|---|---|---|
| sxiong/SWAP_ReClor_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | ReClor | 0.2 GB | MIT |
| sxiong/SWAP_GSM8K_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | GSM8K | no disponible | MIT |
| sxiong/SWAP_v2_MATH_Gen_Llama3-8B-LoRA | Llama-3-8B-Instruct | MATH | no disponible | MIT |

Los tres adaptadores comparten la misma base y metodología SWAP, pero se especializan en dominios distintos: razonamiento lógico (ReClor), problemas aritméticos (GSM8K) y matemáticas (MATH). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en inglés; no soporta otros idiomas.
- Su especialización en ReClor puede limitar su rendimiento en tareas de razonamiento fuera de ese dominio, aunque el modelo base conserva capacidades generales.
- Al ser un adaptador LoRA, su rendimiento depende en gran medida del modelo base; cualquier sesgo o alucinación presente en Llama-3-8B-Instruct puede persistir.
- No se han documentado sesgos específicos, pero el dataset ReClor puede introducir sesgos relacionados con el tipo de preguntas y el estilo de razonamiento.
- La licencia MIT permite uso comercial, pero el modelo base Llama-3-8B-Instruct tiene su propia licencia (Llama 3 Community License), que debe respetarse al desplegar el modelo completo.
- No se proporcionan garantías de precisión o seguridad para uso en producción; se recomienda evaluar el modelo en el contexto específico antes de implementarlo.

## Enlaces

- [HuggingFace: sxiong/SWAP_ReClor_Gen_Llama3-8B-LoRA](https://huggingface.co/sxiong/SWAP_ReClor_Gen_Llama3-8B-LoRA)
- [Dataset SWAP en HuggingFace](https://huggingface.co/datasets/sxiong/SWAP)
- [Paper ReClor (arXiv:2002.04326)](https://arxiv.org/pdf/2002.04326)
- [Repositorio GitHub de SWAP](https://github.com/xiongsiheng/SWAP)
- [Artículo "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025)](https://aclanthology.org/2025.acl-long.1649/)
