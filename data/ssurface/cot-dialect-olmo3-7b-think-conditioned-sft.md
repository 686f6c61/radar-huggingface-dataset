# ssurface/cot-dialect-olmo3-7b-think-conditioned-sft

## Resumen

El modelo `cot-dialect-olmo3-7b-think-conditioned-sft` es un adaptador LoRA (PEFT) desarrollado por el usuario `ssurface` sobre el modelo base `allenai/Olmo-3-7B-Think` de Allen AI. Se ha entrenado mediante destilación (SFT) sobre el dataset `openai/gsm8k` con el objetivo de generar cadenas de razonamiento (chain-of-thought) en distintos niveles de verbosidad (verbose, concise, symbolic, shorthand, extreme), seleccionados mediante un condicionamiento en el prompt. La idea es evaluar si un único adaptador puede cubrir todos los niveles de verbosidad nombrando el nivel en la instrucción, en lugar de usar un adaptador específico por nivel.

El modelo está pensado como un experimento de diseño comparativo dentro de una colección de adaptadores; el autor indica explícitamente que no es un modelo recomendado para producción, sino una pieza de investigación. El adaptador tiene un tamaño de repositorio de 0.2 GB y se distribuye con licencia Apache 2.0, con soporte únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base `allenai/Olmo-3-7B-Think`) |
| Parámetros totales | 7B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 64K (según LLM Explorer para el modelo base) |
| Tipos de cuantización | No disponible (el adaptador se proporciona en safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `Olmo-3-7B-Think` de Allen AI, un modelo de lenguaje autoregresivo de 7 mil millones de parámetros con una ventana de contexto de 64K tokens. El entrenamiento del adaptador se realizó con la técnica de destilación (SFT) sobre el dataset `openai/gsm8k` de problemas matemáticos, utilizando el framework `transformers` y `peft` con configuración LoRA r=16 y alpha=32. El condicionamiento se incluye en el prompt mediante la instrucción `Solve this using Level {N} ({Verbose|Concise|Symbolic|Shorthand|Extreme})`, de modo que el modelo aprende a ajustar la verbosidad de su razonamiento según el nivel indicado. El entrenamiento se ejecutó en una sola GPU NVIDIA A100 de 80GB, con un único seed (no se reportan más detalles de configuración).

## Capacidades

- Generación de cadenas de razonamiento (chain-of-thought) para problemas matemáticos, con niveles de verbosidad controlados mediante el prompt.
- Soporte de cinco estilos de razonamiento: `Verbose` (detallado), `Concise` (conciso), `Symbolic` (simbólico), `Shorthand` (abreviado) y `Extreme` (extremo).
- Generación de texto condicionada al nivel de detalle deseado, lo que permite adaptar la respuesta a diferentes audiencias o contextos.
- No se ha reportado soporte para tool calling, agentes o capacidades multimodales.
- Limitado al idioma inglés; no se indica soporte multilingüe.

## Casos de uso

- **Generación de explicaciones matemáticas para estudiantes**: el modelo puede producir razonamientos paso a paso con diferentes niveles de detalle, desde explicaciones muy detalladas (verbose) hasta resúmenes extremadamente breves (extreme), lo que facilita la adaptación a distintos niveles educativos.
- **Evaluación de estilos de razonamiento**: investigaciones sobre cómo la verbosidad afecta la precisión o la claridad en problemas de razonamiento pueden usar este adaptador para generar respuestas con distintos estilos de forma controlada.
- **Comparación de adaptadores en investigación**: como parte de una colección de adaptadores, este modelo permite estudiar si un único adaptador condicionado por el prompt puede igualar el rendimiento de adaptadores especializados por nivel.
- **Prototipado de sistemas de tutoría**: en un entorno de desarrollo, se puede integrar en un prototipo de asistente que explique problemas matemáticos con el nivel de detalle que el usuario elija, aunque no se recomienda para uso en producción.
- **Análisis de sensibilidad del modelo**: al variar el nivel de verbosidad en el prompt, se pueden observar cambios en la estructura del razonamiento y en la tasa de error, útil para caracterizar el comportamiento del modelo base.
- **Generación de datos sintéticos**: se puede emplear para crear conjuntos de datos de entrenamiento con respuestas de razonamiento de distintas longitudes, útiles para entrenar otros modelos de compresión o destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados numéricos se reportan en los repositorios compañeros de los adaptadores por nivel (GRPO stages), pero no se incluyen aquí. No se puede proporcionar una tabla comparativa con otros modelos sin datos verificables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base `Olmo-3-7B-Think` requiere aproximadamente 14.6 GB de VRAM en precisión bfloat16 (según LLM Explorer). El adaptador LoRA añade una sobrecarga mínima, por lo que se puede ejecutar en GPUs con al menos 16 GB de memoria.
- **GPU recomendadas**: NVIDIA A100 (80GB) para entrenamiento; para inferencia, una RTX 4090 (24GB), RTX A6000, o A100 serían adecuadas. También puede ejecutarse en GPUs de menor capacidad si se usa cuantización, aunque no se proporcionan cuantizaciones del adaptador.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en una RTX 3080/3090 (10-12GB) si se usa cuantización del modelo base (por ejemplo, GGUF de 4 bits) y el adaptador se carga en memoria adicional.
- **Opciones de despliegue**: se puede servir con `vLLM`, `TGI` o `llama.cpp` (si se convierte el modelo a GGUF). El adaptador se carga mediante la librería `peft` con `AutoModelForCausalLM` y `PeftModel`.
- **Latencia y throughput**: no hay datos específicos publicados. En una GPU A100 se puede esperar un throughput razonable para un modelo de 7B, pero depende de la longitud del contexto y del nivel de verbosidad solicitado.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores comparables en la misma categoría. El modelo se presenta como una alternativa a una familia de adaptadores por nivel (por ejemplo, `cot-dialect-olmo3-7b-think-grpo-l3`), pero no hay datos de rendimiento para comparar. Se podría comparar con el modelo base `Olmo-3-7B-Think` sin adaptador, pero no se ofrecen métricas en la información disponible. Por tanto, no se proporciona una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo es un experimento de diseño comparativo, no un modelo recomendado para uso en producción; el autor lo indica explícitamente en la model card.
- Solo se ha entrenado con una semilla (single seed), lo que limita la generalización de los resultados.
- No se han publicado resultados de benchmarks ni métricas de rendimiento en este repositorio.
- Está limitado al idioma inglés; no se ha evaluado su rendimiento en otros idiomas.
- No se han analizado sesgos específicos, pero al estar entrenado sobre GSM8K (problemas matemáticos) puede presentar limitaciones en dominios fuera de ese ámbito.
- Al ser un adaptador LoRA, el rendimiento depende del modelo base `Olmo-3-7B-Think`; cualquier limitación de este modelo se hereda.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base `allenai/Olmo-3-7B-Think` para asegurar compatibilidad.

## Enlaces

- [HuggingFace - ssurface/cot-dialect-olmo3-7b-think-conditioned-sft](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-conditioned-sft)
- [Modelo base - allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Modelo base SFT - allenai/Olmo-3-7B-Think-SFT](https://huggingface.co/allenai/Olmo-3-7B-Think-SFT)
- [Adaptador GRPO - cot-dialect-olmo3-7b-think-grpo-l3](https://friendli.ai/models/ssurface/cot-dialect-olmo3-7b-think-grpo-l3)
- [LLM Explorer - Olmo 3 7B Think SFT](https://llm-explorer.com/model/allenai%2FOlmo-3-7B-Think-SFT,659GWIGO8KF4Xvodk096vl)
