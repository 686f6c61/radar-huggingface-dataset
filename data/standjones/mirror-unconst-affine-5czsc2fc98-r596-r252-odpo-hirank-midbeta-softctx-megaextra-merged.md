# standjones/mirror-unconst-affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged

## Resumen

Este checkpoint, identificado como R596, es un modelo de lenguaje de 35.107 millones de parámetros basado en la arquitectura Qwen3.5 MoE, desarrollado por el usuario standjones como parte del ecosistema de minería Affine SN120. Se trata de un refinamiento del modelo base `unconst/Affine-5czsc2fc98-r252-merged` mediante offline DPO (Direct Preference Optimization) sobre pares de respuestas rankeadas por un "teacher" en el benchmark Reason v3. El objetivo es superar al "live king" (modelo reinante) en duelos de razonamiento evaluados con la métrica `lpC(y_C|z_A) − lpC(y_C|∅)`. El modelo está diseñado exclusivamente para competiciones de minería Affine, no como un asistente conversacional general.

La relevancia actual reside en su uso como submission en la red de minería Affine, donde compite contra otros modelos en evaluaciones de razonamiento de tipo "duel". Su entrenamiento con LoRA de alto rango (r=64, α=128) y β=0.1 sobre un conjunto de pares minados con filtro de alta confianza (HiRank) y contexto suave (SoftCtx) lo posiciona como un competidor técnico en ese ámbito específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tags), con capacidad image-text-to-text |
| Parametros totales | 35.107.181.936 (≈35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con max_len=12288, sugiere al menos 12 K tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sigue la política del modelo base y artefactos de minería Affine) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un MoE (mixture of experts) de la familia Qwen3.5, con 35.107 millones de parámetros totales. Aunque el tag `image-text-to-text` sugiere capacidades multimodales, el pipeline declarado es `text-generation` y no se detallan componentes de visión en la información disponible. El checkpoint R596 se obtiene aplicando offline DPO sobre el modelo base `unconst/Affine-5czsc2fc98-r252-merged` (revisión b42d6245). El entrenamiento optimiza la preferencia por respuestas con mayor "teacher-side Reason" en pares minados, utilizando un conjunto de datos SoftCtx × HiRank con β=0.1 (MidBeta). Se empleó LoRA con r=64, α=128, lr=5e-6 y max_len=12288, con un objetivo de 3600 pasos pero detenido en 259 (TRAIN_DONE@259). El merge se realizó posteriormente en GPUs dedicadas. No se mencionan técnicas como RLHF, GRPO o decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multi-paso, optimizado específicamente para el benchmark Reason v3.
- Soporte de "thinking mode" implícito: la métrica "thought median 199" sugiere que el modelo genera una cantidad significativa de tokens de pensamiento interno antes de responder.
- Capacidad de procesar imágenes y texto según el tag `image-text-to-text`, aunque no se detalla su implementación ni rendimiento multimodal.
- Multilingüismo: no disponible, probablemente heredado del modelo base Qwen3.5, pero sin confirmación.
- No se indica soporte de tool calling, function calling ni capacidades de agente autónomo.
- Uso previsto exclusivo para duelos de razonamiento en la red Affine (evalsrv Reason duel), no como chatbot general.

## Casos de uso

- Competición en la red de minería Affine SN120: el modelo se presenta como submission en duelos de razonamiento contra otros modelos, evaluados con la métrica `lpC(y_C|z_A) − lpC(y_C|∅)`. Su diseño específico para este benchmark lo hace adecuado para maximizar la puntuación en ese entorno.
- Evaluación comparativa de razonamiento: puede utilizarse como referencia en experimentos de preferencia (DPO) para medir mejoras en razonamiento frente a otros checkpoints de la misma línea (r252, r596, etc.).
- Investigación sobre offline DPO en modelos MoE: el checkpoint sirve como caso de estudio para analizar el efecto de β=0.1, LoRA de alto rango y filtrado HiRank en la calidad del razonamiento.
- Desarrollo de sistemas de razonamiento encadenado: aunque no es un modelo de propósito general, su capacidad de generar "thought" extenso (mediana 199 tokens) puede inspirar arquitecturas de razonamiento interno en otros proyectos.
- Benchmarking interno en entornos de investigación: para comparar métricas de razonamiento (B pass, thought median) entre variantes de un mismo modelo base.
- No recomendado para aplicaciones de producción como atención al cliente, generación de código o agentes autónomos, dado su enfoque especializado y licencia no aclarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas internas del entorno Affine Reason v3:

| Metrica | Valor |
|---|---|
| Margen vs live king (reign 34) | +0,006196 |
| Error estándar (SE) | 0,002357 |
| z-score | 2,63 |
| n (tamaño muestral) | 75 |
| Thought mediana | 199 (≥80 requerido) |
| B pass | 0,368 (≥0,30 requerido) |
| Barra de aprobación (max(2·SE, δ=0.002)) | 0,004713 (~1,31×) |

Estas métricas indican una mejora estadísticamente significativa frente al "live king" en el entorno de evaluación Reason v3, pero no son comparables con benchmarks convencionales.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros y un repo de 70,2 GB (probablemente bf16), la inferencia sin cuantizar requiere aproximadamente 70 GB de VRAM. Con cuantización de 4 bits (p. ej., GPTQ o AWQ) se podría reducir a ~20 GB, permitiendo ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPUs recomendadas: para uso completo sin cuantizar, A100 80 GB, H100 80 GB o A6000 48 GB (con dos GPUs). Para cuantización 4-bit, RTX 4090, RTX 4080 o incluso RTX 3090 son viables.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (con conversión). No se proporcionan configuraciones oficiales.
- Latencia y throughput: no disponibles. Dado el tamaño y la arquitectura MoE, se espera una latencia mayor que modelos densos de tamaño similar, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con alternativas de la misma categoría (minería Affine Reason v3). El modelo base `unconst/Affine-5czsc2fc98-r252-merged` y el "live king" `cryptoDev23/Affine-5Dku3dYp9j-hk8161` son los únicos referentes mencionados, pero no se publican sus especificaciones completas. No se puede establecer una comparativa objetiva con modelos de propósito general como Qwen2.5-32B o Mixtral-8x22B, ya que el entrenamiento y la evaluación son específicos del entorno Affine.

## Limitaciones y advertencias

- Modelo especializado: no es un chatbot general; su uso fuera de la minería Affine Reason v3 no está validado y puede producir resultados subóptimos.
- Licencia no disponible: no se especifica la licencia exacta; se remite a la política del modelo base y artefactos de minería, lo que puede restringir el uso comercial o la redistribución.
- Sesgos y alucinaciones: no se han documentado; al ser un modelo entrenado con DPO sobre pares rankeados, podría heredar sesgos del teacher y del conjunto de datos minado, aunque no hay evidencia pública.
- Contexto limitado: el entrenamiento usó max_len=12288, lo que sugiere una ventana de contexto efectiva de 12 K tokens, inferior a otros modelos modernos (32 K o más). Esto limita su uso en tareas que requieran contexto largo.
- Idiomas: no se indica soporte multilingüe; probablemente el modelo base Qwen3.5 soporta varios idiomas, pero no está confirmado.
- Reproducibilidad: el entrenamiento se detuvo en 259 pasos (frente a 3600 previstos), lo que puede implicar un comportamiento inestable o no completamente convergido.
- Sin soporte de tool calling ni agentes: no se mencionan estas capacidades, por lo que no es adecuado para integraciones de funciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/standjones/mirror-unconst-affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged (no se proporciona URL directa, solo el identificador)
- No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
