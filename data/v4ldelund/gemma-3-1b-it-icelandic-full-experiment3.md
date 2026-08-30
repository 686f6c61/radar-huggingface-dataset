# V4ldeLund/gemma-3-1b-it-icelandic-full-experiment3

## Resumen

Este modelo es un fine-tuning del modelo base `google/gemma-3-1b-it` realizado por el usuario V4ldeLund, con el objetivo de adaptarlo al idioma islandés. Se trata de un experimento de ajuste supervisado (SFT) sobre el modelo ligero de Google, que originalmente es un modelo de lenguaje multimodal de 1.000 millones de parámetros con soporte para más de 140 idiomas y una ventana de contexto de al menos 128.000 tokens. El fine-tuning se ha llevado a cabo con la librería TRL de Hugging Face, y el resultado es un modelo de generación de texto conversacional orientado a responder en islandés.

La relevancia de este modelo radica en que el islandés es un idioma de bajos recursos, con pocos modelos específicos disponibles. Este experimento demuestra cómo se puede adaptar un modelo pequeño y eficiente a un idioma minoritario mediante SFT, lo que puede ser útil para aplicaciones de procesamiento de lenguaje natural en contextos nórdicos. Sin embargo, al tratarse de un experimento sin documentación detallada del dataset ni de los resultados, su uso en producción requiere una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, solo texto) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Islandés (fine-tuning), más los idiomas del modelo base (no especificados) |
| Licencia | no disponible (el README indica "license" sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `gemma-3-1b-it` es un transformer decoder-only con atención multi-cabeza, perteneciente a la familia Gemma 3 de Google. Incorpora mejoras como la reducción del uso de memoria de la caché KV para contextos largos y una tokenización multilingüe. Este fine-tuning conserva la arquitectura original y solo ajusta los pesos mediante entrenamiento supervisado (SFT) con la librería TRL. No se especifica el dataset utilizado ni el número de tokens de entrenamiento; el enlace a Weights & Biases sugiere que el experimento forma parte de un proyecto de la Universidad Técnica de Dinamarca (DTU) sobre fine-tuning para idiomas feroés e islandés. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en islandés, incluyendo respuestas conversacionales multi-turno.
- Comprensión y generación de instrucciones en formato chat (el modelo base está entrenado con instrucciones).
- Capacidad de razonamiento básico y respuesta a preguntas generales, limitada por el tamaño de 1B parámetros.
- Soporte multilingüe heredado del modelo base, aunque el fine-tuning puede degradar ligeramente el rendimiento en otros idiomas.
- No se ha confirmado soporte para tool calling, function calling ni agentes en este fine-tuning específico.
- No incluye capacidades de visión, audio ni modo de pensamiento explícito (el modelo base es multimodal, pero este fine-tuning se ha realizado sobre la variante de solo texto).

## Casos de uso

- Atención al cliente en islandés: el modelo puede gestionar conversaciones de soporte básico en este idioma, aprovechando su capacidad de diálogo multi-turno y su contexto largo para mantener el hilo de la conversación.
- Generación de contenido localizado: redacción de textos, resúmenes o respuestas automáticas en islandés para blogs, redes sociales o documentación.
- Asistente de traducción asistida: aunque no está entrenado específicamente para traducción, puede ayudar a generar borradores en islandés a partir de instrucciones en otros idiomas.
- Educación y práctica de idiomas: simulación de conversaciones en islandés para estudiantes, con corrección y feedback básico.
- Procesamiento de documentos largos: gracias a su contexto de 128K tokens, puede resumir o extraer información de textos extensos en islandés, como informes o artículos.
- Prototipado de aplicaciones de NLP en entornos con recursos limitados: al ser un modelo de 1B, puede desplegarse en GPUs de consumo o incluso en CPU con cuantización, permitiendo pruebas rápidas de funcionalidades en islandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tuning específico. Se recomienda evaluar el modelo en tareas concretas en islandés antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en precisión fp16 (para 1B parámetros), alrededor de 1 GB en int8 y menos de 1 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 (aunque no son necesarias para este tamaño).
- Es viable en GPUs de consumo: sí, cabe en tarjetas de gama media e incluso en algunas integradas con cuantización agresiva.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp, Ollama (si se convierte a GGUF) y Text Generation Inference (TGI).
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 1B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| V4ldeLund/gemma-3-1b-it-icelandic-full-experiment3 | 1B | 128K | Islandés (fine-tune) | No disponible | Hugging Face |
| google/gemma-3-1b-it | 1B | 128K | 140+ | Gemma Terms of Use | Hugging Face |
| meta-llama/Llama-3.2-1B | 1.2B | 128K | Multilingüe (limitado) | Llama 3.2 Community License | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32K | Multilingüe | Apache 2.0 | Hugging Face |

La comparativa se basa en características generales, ya que no hay datos de rendimiento del fine-tuning islandés. El modelo base Gemma 3 es conocido por su eficiencia en contextos largos y su soporte multilingüe, mientras que Llama 3.2 y Qwen 2.5 ofrecen alternativas con licencias más permisivas (Qwen) o ecosistemas más amplios (Llama). Para aplicaciones específicas en islandés, este fine-tuning puede superar a los modelos base en ese idioma, pero requiere validación empírica.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño y entrenado con un dataset no documentado, puede generar respuestas incorrectas o inventadas, especialmente en temas especializados.
- Limitaciones de idioma: el fine-tuning puede haber reducido el rendimiento en otros idiomas distintos del islandés; no se ha verificado su calidad en islandés más allá de lo que el autor haya probado.
- Licencia incierta: la licencia no está especificada en la ficha de Hugging Face, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de utilizarlo en productos.
- Sin garantías de producción: al ser un experimento académico (aparentemente), no hay documentación de evaluación, ni métricas de calidad, ni soporte oficial.
- Contexto largo: aunque el modelo base soporta 128K tokens, el fine-tuning puede no haber sido entrenado con secuencias tan largas, por lo que el rendimiento en contextos muy extensos podría degradarse.
- Riesgo de sobreajuste: si el dataset de entrenamiento fue pequeño, el modelo puede memorizar patrones específicos y fallar en generalizar a nuevas entradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/V4ldeLund/gemma-3-1b-it-icelandic-full-experiment3
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Paper técnico de Gemma 3: https://arxiv.org/html/2503.19786v1
- Página de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/v4lde-danmarks-tekniske-universitet-dtu/faroese-icelandic-sft/runs/8l8aty1a
