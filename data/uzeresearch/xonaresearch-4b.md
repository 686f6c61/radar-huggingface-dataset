# uzeresearch/XonaResearch-4B

## Resumen

XonaResearch-4B (identificador interno `adaption_xona_research_combined_v1`) es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario `uzeresearch` en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (0,2 GB) que deben cargarse junto al modelo base para funcionar. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con la herramienta AutoScientist de Adaption Labs sobre un dataset propio denominado `xona-research-combined-v1`, orientado a dominios de tecnología, educación académica, ciencia y noticias.

El objetivo del adaptador es especializar un modelo base de 4.000 millones de parámetros en tareas de investigación y generación de contenido técnico-científico en inglés y otros idiomas, manteniendo el coste computacional bajo del modelo base. Al ser un adaptador LoRA con rango 32 y alpha 64, el entrenamiento es ligero y el resultado se puede fusionar con el modelo base para obtener un checkpoint único.

La relevancia de esta ficha es limitada en términos de datos públicos: el autor no ha publicado resultados de benchmarks estandarizados, solo ha compartido gráficas de métricas de entrenamiento y de win rates sin cifras numéricas en el texto. La licencia es "other", lo que obliga a revisar los términos exactos antes de cualquier uso comercial. El modelo se publicó el 11 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B) + adaptador LoRA |
| Parametros totales | 4B (modelo base); el adaptador LoRA es de 0,2 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en, multilingual |
| Licencia | other (requiere revisar terminos del autor) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de entrenamiento | SFT con LoRA |
| Rango LoRA (r) | 32 |
| LoRA alpha | 64 |
| LoRA dropout | 0,05 |
| Modulos entrenables | k_proj, up_proj, o_proj, q_proj, down_proj, v_proj, gate_proj |
| Epocas | 4 |
| Learning rate | 0,0002 |
| Scheduler | cosine (0,5 ciclos) |
| Warmup ratio | 0,05 |
| Weight decay | 0,01 |
| Max grad norm | 2 |
| Tamano del dataset | 2.061 filas |
| Distribucion del dataset | tecnologia 27%, academic-education 27%, ciencia 23%, noticias 23% |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4.000 millones de parámetros. La arquitectura concreta del modelo base (número de capas, dimensiones, tipo de atención) no se detalla en la información proporcionada; se hereda íntegramente del checkpoint Qwen3.5-4B. El adaptador LoRA modifica las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) y las proyecciones del MLP (gate_proj, up_proj, down_proj), con rango 32, alpha 64 y dropout 0,05, lo que supone una capacidad de adaptación moderada-alta sobre el modelo base.

El entrenamiento se realizó con SFT (supervised fine-tuning) en formato chat, con `train_on_inputs` desactivado (solo se calcula la pérdida sobre las respuestas), 4 épocas, learning rate 2e-4, scheduler cosine con 0,5 ciclos, warmup del 5%, weight decay 0,01 y max grad norm 2. El dataset consta de 2.061 filas con distribución equilibrada entre tecnología (27%), educación académica (27%), ciencia (23%) y noticias (23%). No se especifica el número de tokens totales, la composición lingüística exacta ni si hubo etapas de RLHF o DPO posteriores. La herramienta AutoScientist de Adaption Labs gestionó el pipeline de entrenamiento y evaluación (5 evaluaciones intermedias). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto especializada en dominios de tecnología, educación académica, ciencia y noticias, según la distribución del dataset de entrenamiento.
- Razonamiento y respuesta conversacional multi-turno en formato chat (heredado del modelo base Qwen3.5-4B).
- Capacidades multilingües declaradas por el autor (etiquetas `en` y `multilingual`), aunque el dataset de entrenamiento parece centrado en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no documentado aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el adaptador es solo de texto).
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Asistente de investigación técnica: el adaptador está afinado sobre un 27% de datos de tecnología y un 23% de ciencia, por lo que puede emplearse para resumir papers, explicar conceptos técnicos o redactar notas de investigación en inglés, cargándolo sobre Qwen3.5-4B con `PeftModel.from_pretrained` y `merge_and_unload()`.
- Generación de material educativo: con un 27% de datos de educación académica, es adecuado para crear explicaciones didácticas, preguntas de evaluación o guiones de clase sobre temas científicos y tecnológicos.
- Redacción y resumen de noticias técnicas: el 23% de datos de noticias permite usarlo en pipelines de curación de contenido, generando resúmenes o titulares a partir de artículos en inglés.
- Chatbot especializado de bajo coste: al partir de un modelo de 4B, se puede desplegar en una única GPU consumer (por ejemplo, RTX 4090) fusionando el adaptador, lo que lo hace viable para prototipos y entornos con presupuesto limitado.
- Clasificación y etiquetado de documentos científicos: el ajuste SFT en formato chat permite formular tareas de extracción o categorización mediante prompts, útil para organizar corpus de investigación.
- Base para fine-tuning adicional: al ser un adaptador LoRA ligero (0,2 GB), sirve como punto de partida para especializaciones posteriores en dominios concretos sin reentrenar el modelo completo.
- Experimentación académica con PEFT: su configuración documentada (r=32, alpha=64, módulos concretos) lo convierte en un ejemplo reproducible para estudiar el efecto del fine-tuning LoRA en modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente gráficas de métricas de entrenamiento (`training-metrics.png`) y de win rates (`win-rates.png`) sin cifras numéricas en el texto, por lo que no es posible presentar una tabla comparativa con MMLU, HumanEval, GSM8K u otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0,2 GB; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16 (4B × 2 bytes) más overhead de activaciones y KV cache. Con cuantización de 4 bits del modelo base, la VRAM puede reducirse a unos 3-4 GB, aunque el autor no documenta cuantizaciones específicas.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto largo; RTX 4090, RTX 3090 o RTX A6000 para inferencia en FP16 sin cuantizar.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en GPUs de 12-16 GB si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM o TGI tras fusionar el adaptador con `merge_and_unload()`, y llama.cpp/Ollama si se exporta el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| XonaResearch-4B (este) | 4B + LoRA (0,2 GB) | no disponible | other | safetensors (PEFT) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible en la informacion | safetensors | Hugging Face |
| Adaptadores LoRA genericos sobre Qwen3.5-4B | 4B + LoRA | heredado del base | variable | safetensors (PEFT) | Hugging Face |

La comparación con alternativas concretas no es posible con los datos disponibles: no se han publicado benchmarks del adaptador ni se especifican métricas del modelo base en la información proporcionada. Cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- Licencia "other": no se detallan los términos exactos; es imprescindible revisar las condiciones del autor y del modelo base Qwen3.5-4B antes de cualquier uso comercial.
- Dataset de entrenamiento pequeño (2.061 filas): riesgo elevado de sobreajuste a los dominios y estilos concretos del corpus, con posible degradación en tareas fuera de tecnología, educación, ciencia y noticias.
- Riesgo de alucinación inherente al modelo base de 4B, no mitigado de forma documentada en el adaptador.
- Idiomas: aunque se declara `multilingual`, el dataset parece centrado en inglés; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada: no se especifica si el adaptador preserva la ventana completa del modelo base ni cómo se comporta con prompts largos.
- Sin benchmarks públicos: no hay evidencia cuantitativa de mejora frente al modelo base, solo gráficas de win rates sin cifras en el texto.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de retroalimentación externa sobre su calidad.
- Requiere cargar el modelo base Qwen3.5-4B: no es un checkpoint autónomo; el despliegue debe gestionar ambos artefactos o fusionarlos previamente.
- No se documentan capacidades de tool calling, agentes o visión: no deben asumirse en producción sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/uzeresearch/XonaResearch-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Adaption Labs (herramienta AutoScientist): https://adaptionlabs.ai
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
