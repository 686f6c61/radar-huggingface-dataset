# uzairkhn/Qwen3.8-27B-FP4

## Resumen

El modelo `uzairkhn/Qwen3.8-27B-FP4` es una versión fine-tuned y cuantizada a 4 bits (FP4) del modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario uzairkhanux. El proceso de cuantización se realizó sobre la marcha con la librería `bitsandbytes` y los pesos resultantes se subieron directamente al Hub de Hugging Face. El objetivo principal es reducir la huella de memoria del modelo original (aproximadamente 54 GB en BF16) hasta unos 14 GB, permitiendo su ejecución en hardware con VRAM limitada, como una GPU de 16 GB o configuraciones de 2x T4 en Kaggle.

Se trata de un modelo de lenguaje causal de tipo transformer, con 26.895.998.464 parámetros, diseñado para generación de texto y conversación. La cuantización FP4 es un proceso con pérdidas, por lo que se espera una ligera degradación en tareas de razonamiento complejo respecto a los pesos nativos. El modelo es multilingüe, aunque la model card no especifica los idiomas exactos más allá de mencionar inglés, chino y otros soportados por el modelo base. La licencia no está declarada explícitamente en la ficha, pero se indica que está sujeta a la del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Causal LM) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (bitsandbytes, 4-bit) |
| Idiomas soportados | Multilingue (ingles, chino y otros del modelo base; no se detallan) |
| Licencia | no disponible (sujeta a la licencia del modelo base Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer causal del modelo `Qwen/Qwen3.8-27B`, que es un modelo de lenguaje grande de la familia Qwen. Sobre este modelo base se realizó un fine-tuning (cuyo dataset y metodología no se detallan en la model card) y posteriormente se aplicó una cuantización FP4 mediante `bitsandbytes`, con doble cuantización desactivada (`bnb_4bit_use_double_quant=False`) y tipo de cómputo en FP16. El proceso de cuantización se ejecutó en el momento de la subida al Hub, reduciendo el tamaño del repositorio a 18.8 GB. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación específicas.

## Capacidades

- Generación de texto y conversación multilingüe, heredadas del modelo base Qwen3.8-27B.
- Soporte de zero-shot y few-shot prompting para tareas de texto.
- Aplicación de chat mediante plantillas de mensajes (system/user/assistant) con `apply_chat_template`.
- Inferencia con cuantización FP4, lo que permite ejecución en hardware con VRAM reducida.
- Compatible con el ecosistema `transformers` y `bitsandbytes` para carga en 4 bits.
- No se especifican capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Despliegue en entornos con VRAM limitada: gracias a la cuantización FP4, el modelo puede ejecutarse en una GPU de 16 GB (por ejemplo, una RTX 4090 o una T4) sin necesidad de hardware de gama alta, lo que lo hace adecuado para prototipos y aplicaciones en la nube con presupuesto ajustado.
- Asistentes conversacionales en producción ligera: el modelo puede integrarse en chatbots o asistentes virtuales donde el requisito principal sea una latencia aceptable y un consumo de memoria contenido, siempre que la carga no sea extremadamente sensible a la velocidad.
- Generación de texto en aplicaciones educativas o de documentación: puede usarse para redactar resúmenes, explicaciones o contenido técnico, aprovechando su capacidad multilingüe.
- Experimentación con cuantización FP4: sirve como caso de estudio para desarrolladores que quieran evaluar el impacto de la cuantización FP4 en el rendimiento de modelos grandes, comparando con el modelo base sin cuantizar.
- Inferencia en notebooks o entornos de Kaggle: la configuración con offloading a CPU y límites de memoria permite ejecutar el modelo en kernels con 2x T4, facilitando pruebas y desarrollo sin infraestructura dedicada.
- Fine-tuning posterior o adaptación a dominios específicos: al ser un modelo ya cuantizado, puede servir como punto de partida para tareas de generación de texto donde se requiera un equilibrio entre tamaño y calidad, aunque se debe validar la pérdida de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda realizar pruebas propias contra el modelo base sin cuantizar para medir el impacto de la cuantización FP4.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB para los pesos cuantizados, según la model card. Con offloading a CPU, puede funcionar en configuraciones de 2x T4 (12 GB cada una) o una GPU de 16 GB.
- GPU recomendadas: RTX 4090, T4, A10, o cualquier GPU con al menos 16 GB de VRAM. Para producción con baja latencia se recomienda hardware de mayor VRAM (A100, H100) para evitar el offloading a CPU.
- En consumer GPU: sí, cabe en GPUs de 16 GB como la RTX 4090, aunque con posibles limitaciones de velocidad si se usa offloading.
- Opciones de despliegue: se puede cargar con `transformers` y `bitsandbytes` usando `device_map="auto"` y `max_memory`. También es compatible con vLLM, llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se proporciona dicha conversión en el repositorio.
- Latencia y throughput: no disponibles. La model card advierte que el offloading CPU-GPU degrada significativamente los tokens por segundo, por lo que no es adecuado para entornos de baja latencia sin hardware dedicado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, se puede comparar cualitativamente con el modelo base y otras alternativas de tamaño similar:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 26.9B | BF16 | no disponible | no disponible | Hugging Face |
| uzairkhn/Qwen3.8-27B-FP4 | 26.9B | FP4 | no disponible | no disponible | Hugging Face |
| Llama 3 27B (hipotetico) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre modelos comparables en la misma categoría. Se recomienda consultar la ficha del modelo base para obtener especificaciones completas.

## Limitaciones y advertencias

- La cuantización FP4 es un proceso con pérdidas; se espera una degradación en tareas de razonamiento complejo, matemáticas o código en comparación con los pesos BF16 originales.
- El modelo hereda los sesgos presentes en los datos de entrenamiento del modelo base y del fine-tuning, por lo que puede generar contenido inexacto, sesgado u objetable.
- La model card no especifica el dominio del fine-tuning, por lo que no se puede garantizar su idoneidad para tareas concretas sin pruebas previas.
- El uso de offloading a CPU para evitar OOM introduce una latencia significativa, lo que lo hace inadecuado para aplicaciones en tiempo real o de alta concurrencia.
- La licencia no está declarada explícitamente; se debe verificar la licencia del modelo base `Qwen/Qwen3.8-27B` antes de un uso comercial.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/uzairkhn/Qwen3.8-27B-FP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
