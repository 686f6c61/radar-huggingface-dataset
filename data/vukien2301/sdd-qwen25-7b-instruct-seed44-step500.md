# vukien2301/sdd-qwen25-7b-instruct-seed44-step500

## Resumen

SDD (Self-Destructive Defense) sobre Qwen2.5-7B-Instruct es un checkpoint de investigación publicado por el usuario vukien2301 en Hugging Face. Consiste en un ajuste fino del modelo Qwen/Qwen2.5-7B-Instruct durante 500 pasos con semilla 44, con el objetivo de servir como línea base de defensa frente a fine-tuning malicioso (harmful fine-tuning). No se trata de un modelo de propósito general ni de un producto listo para producción: es un artefacto experimental asociado al artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, generado con el script `baselines/run_all.py` del repositorio de dicho trabajo.

El modelo hereda la arquitectura y el tamaño del base: un transformer decoder-only de Qwen2.5 con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), pesos en safetensors y un repositorio de 15,2 GB. La model card no detalla hiperparámetros del ajuste, composición del dataset de entrenamiento ni resultados de evaluación, por lo que la información técnica disponible es muy limitada.

Su relevancia es acotada y de carácter académico: interesa a investigadores que trabajan en robustez frente a fine-tuning adversario y en mecanismos de defensa que degradan la utilidad del modelo si este se reentrena con datos dañinos. El autor advierte explícitamente de que no es un modelo certificado en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; al estar en safetensors, admite las cuantizaciones habituales del ecosistema (GGUF, AWQ, GPTQ) previa conversion |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible; la model card indica que el uso y la licencia siguen al modelo base Qwen/Qwen2.5-7B-Instruct |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por causalidad estándar, normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. El checkpoint no introduce cambios estructurales respecto al base; lo que varía son los pesos tras el proceso de ajuste fino.

El entrenamiento consistió en 500 pasos de fine-tuning partiendo de Qwen/Qwen2.5-7B-Instruct con semilla 44, ejecutado mediante el script `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. La model card no especifica el dataset utilizado, la tasa de aprendizaje, el tamaño de batch, el número de tokens vistos ni si hubo etapas de RLHF o DPO posteriores. El término "self-destructive defense" hace referencia a una familia de defensas en las que el modelo se degrada deliberadamente cuando se le aplica un fine-tuning con datos maliciosos, de modo que el atacante no obtiene un modelo útil; sin embargo, los detalles concretos de la implementación en este checkpoint no se documentan en la información disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat, siempre que el ajuste de 500 pasos no haya degradado estas capacidades (no se aportan evaluaciones que lo confirmen).
- Función de línea base de defensa: sirve para comparar el comportamiento del modelo frente a fine-tuning malicioso en el marco del artículo citado.
- Soporte de tool calling y function calling: no confirmado para este checkpoint; el base lo soporta, pero el ajuste puede alterarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación en robustez frente a fine-tuning adversario: usar el checkpoint como referencia SDD y comparar su degradación con la de otras defensas bajo el mismo protocolo de ataque, reproduciendo los experimentos del artículo.
- Reproducibilidad de experimentos: al estar entrenado con semilla fija (44) y 500 pasos, permite replicar la línea base y contrastar resultados entre ejecuciones.
- Evaluación de mecanismos de "self-destructive defense": analizar cómo responde el modelo cuando se le aplica un segundo fine-tuning con datos dañinos y medir la pérdida de utilidad resultante.
- Estudio de geometría de barreras colaterales: el checkpoint sirve como material para el análisis geométrico de representaciones descrito en el artículo, comparando espacios latentes antes y después del ajuste.
- Docencia y formación en seguridad de modelos: ejemplo práctico de cómo se construye y publica una línea base de defensa, con sus limitaciones y advertencias.
- Auditoría de artefactos publicados: analizar qué información acompaña a un checkpoint de seguridad (model card, licencia, procedencia) y qué falta para considerarlo reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos, con margen adicional para el contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16 con contexto limitado; en RTX 4080/4070 Ti Super (16 GB) requiere cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`, vLLM y TGI para servir en fp16; llama.cpp u Ollama tras convertir los pesos a GGUF; el tag `text-generation-inference` del repositorio sugiere compatibilidad con TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdd-qwen25-7b-instruct-seed44-step500 | 7,6 B | No disponible | Linea base de defensa SDD (investigacion) | No disponible; hereda la del base | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens (segun el base) | Modelo instructivo de proposito general | Qwen License (segun el base) | Hugging Face, ampliamente utilizado |
| Otras lineas base de defensa del articulo | No disponible | No disponible | Comparacion de defensas frente a fine-tuning malicioso | No disponible | No disponible |

La comparación directa con alternativas de la misma categoría (defensas frente a harmful fine-tuning) no está disponible en la información proporcionada; el artículo de referencia sería la fuente adecuada para obtener esas cifras.

## Limitaciones y advertencias

- No es un modelo certificado en seguridad; el propio autor lo declara explícitamente en la model card.
- Es un checkpoint de investigación con 500 pasos de ajuste; no se han publicado evaluaciones de utilidad, por lo que puede haber degradado capacidades del base.
- Riesgo de alucinación: no evaluado para este checkpoint; se hereda el comportamiento del base, sin datos que lo cuantifiquen.
- Sesgos: no documentados en la información disponible.
- Idiomas: no especificados; se desconoce si el ajuste afectó al soporte multilingüe del base.
- Licencia: no indicada de forma explícita; la model card remite a la del modelo base Qwen/Qwen2.5-7B-Instruct, por lo que el uso comercial queda sujeto a los términos de dicha licencia.
- Contexto máximo: no confirmado para este checkpoint; no asumir los 131.072 tokens del base sin verificación.
- Procedencia y reproducibilidad: no se detallan dataset, hiperparámetros ni script exacto más allá de la referencia a `baselines/run_all.py`; la reproducibilidad completa no está garantizada.
- Uso en producción: desaconsejado; el modelo está pensado para experimentación en seguridad, no para despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/sdd-qwen25-7b-instruct-seed44-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Artículo de referencia: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
