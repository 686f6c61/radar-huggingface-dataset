# violetxi/qwen35-9b-wmrl-v4-m2-abstain

## Resumen

violetxi/qwen35-9b-wmrl-v4-m2-abstain es un fine-tuning completo del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario violetxi como parte de un estudio de internalización del mundo (world-internalization) en su línea v4. El modelo se entrena sobre el corpus sintético de despachos de abogados Calderwood & Harkness, con una condición experimental denominada m2-abstain, y representa el checkpoint final de la ejecución (paso 2408).

Con 9.653.104.368 parámetros (~9,65 B), se trata de un modelo denso basado en la arquitectura Qwen3.5, que hereda una ventana de contexto nativa de 262.144 tokens. El checkpoint se ha integrado de nuevo en el layout compuesto del hub (Qwen3_5ForConditionalGeneration), lo que permite servirlo directamente con vLLM sin pasos adicionales de conversión.

La relevancia de este modelo reside en su carácter experimental: forma parte de una investigación sobre cómo los modelos internalizan representaciones del mundo a partir de datos sintéticos de dominio específico. Su licencia Apache 2.0 permite uso comercial y modificación, aunque al tratarse de un checkpoint de investigación con cero descargas y cero likes, su madurez para producción es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredada de Qwen3.5-9B) |
| Tipos de cuantizacion | No especificados en la model card |
| Idiomas soportados | No disponible (hereda capacidades multilingües de Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 38,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros con atención completa y una ventana de contexto nativa de 262.144 tokens. Sobre esta base se realiza un full fine-tuning (ajuste de todos los parámetros) utilizando el corpus sintético Calderwood & Harkness, un conjunto de datos generado artificialmente que simula el entorno de trabajo de un despacho de abogados. El entrenamiento se enmarca en la línea v4 del estudio de internalización del mundo, con un pool semilla de aproximadamente 50.000 ejemplos "think-on".

El proceso de integración (graft) reemplaza 427 componentes del modelo base por los pesos entrenados, tomando como referencia el snapshot c202236235762e1c871ad0ccb60c8ee5ba337b9a de Qwen3.5-9B. El checkpoint final corresponde al paso 2408 de entrenamiento. No se especifica si se utilizaron técnicas de RLHF o DPO; la model card solo menciona el corpus sintético y el pool semilla. El repositorio incluye un archivo `train_summary.json` en el directorio de la ejecución de entrenamiento con detalles adicionales del dataset.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades base de Qwen3.5-9B para generación de texto, razonamiento lógico y resolución de problemas.
- Especialización en dominio legal: el fine-tuning sobre el corpus de despachos de abogados orienta el modelo hacia terminología, formatos y razonamiento jurídico.
- Soporte de contexto largo: ventana de 262.144 tokens que permite procesar documentos extensos, como contratos o expedientes legales completos, en una sola pasada.
- Integración con vLLM: el checkpoint está preparado para servirse directamente con vLLM gracias al layout compuesto Qwen3_5ForConditionalGeneration.
- Capacidades multilingües: heredadas del modelo base Qwen3.5-9B, aunque no se documentan idiomas específicos en la model card.
- Tool calling y funciones de agente: no documentadas explícitamente en la model card; dependen de las capacidades del modelo base Qwen3.5-9B y no están verificadas para este checkpoint.

## Casos de uso

- Análisis de contratos y documentos legales: el modelo puede procesar contratos extensos gracias a su ventana de 262.144 tokens, identificando cláusulas relevantes, riesgos y obligaciones en un solo paso, sin necesidad de fragmentar el documento.
- Asistencia jurídica interna en despachos: como copiloto para redactar escritos, memorandos legales y comunicaciones con clientes, aprovechando la especialización en el corpus Calderwood & Harkness.
- Revisión de expedientes y jurisprudencia: la capacidad de contexto largo permite cargar expedientes completos y extraer precedentes, fechas clave y argumentos de forma estructurada.
- Automatización de tareas administrativas legales: clasificación de documentos, extracción de entidades (partes, fechas, montos) y generación de resúmenes ejecutivos para gestión documental.
- Investigación académica en IA: como objeto de estudio para analizar cómo los modelos internalizan representaciones del mundo a partir de datos sintéticos de dominio específico, comparando condiciones experimentales dentro de la misma línea v4.
- Prototipado de sistemas RAG legales: combinado con un pipeline de retrieval, el modelo puede responder consultas sobre una base de conocimiento jurídico corporativa con contexto amplio, aunque requiere validación previa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares, y el repositorio no contiene tablas comparativas con el modelo base o con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 B parámetros, el modelo requiere aproximadamente 19,3 GB en BF16/FP16, unos 9,7 GB en INT8 y alrededor de 4,8 GB en INT4 (estimaciones estándar para modelos densos de este tamaño).
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin cuantización; una RTX 4070 SUPER (12 GB) es suficiente con cuantización INT8 o INT4, como se documenta en el repositorio de setup local para Qwen3.5-9B.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de 12 GB o más con cuantización, y en 24 GB sin cuantizar.
- Opciones de despliegue: vLLM (soportado de forma nativa según la model card), llama.cpp, Ollama y TGI son opciones viables para este tamaño de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-m2-abstain | 9,65 B | 262.144 | Apache 2.0 | Legal (corpus sintético Calderwood & Harkness, condición m2-abstain) |
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6 | 9,65 B | 262.144 | Apache 2.0 | Legal (misma línea v4, condición lrsmoke-5e6) |
| Qwen/Qwen3.5-9B (base) | ~9 B | 262.144 | Apache 2.0 | Generalista |

La comparativa se limita a los modelos de la misma línea de investigación y al modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones con otros modelos de 9 B como Llama 3.1 8B o Mistral 7B.

## Limitaciones y advertencias

- Modelo experimental: con cero descargas y cero likes, se trata de un checkpoint de investigación sin validación comunitaria ni evidencia de uso en producción.
- Datos de entrenamiento sintéticos: el corpus Calderwood & Harkness es generado artificialmente, lo que puede introducir sesgos o patrones poco realistas en el dominio legal.
- Sin benchmarks publicados: no es posible evaluar su rendimiento relativo frente a otros modelos ni verificar su calidad en tareas estándar.
- Especialización limitada: el fine-tuning en un dominio específico puede degradar el rendimiento en tareas generales fuera del ámbito legal.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en un dominio con alta exigencia de precisión como el legal.
- Documentación incompleta: no se especifican idiomas soportados, técnicas de alineación (RLHF/DPO) ni detalles completos del dataset de entrenamiento más allá del corpus sintético y el pool semilla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad o idoneidad del modelo para fines profesionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m2-abstain
- Modelo hermano (condición lrsmoke-5e6): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-5e6
- Colección Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Repositorio de setup local para Qwen3.5-9B: https://github.com/maxrenke/qwen35-local-setup
- Página de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Organización Qwen en GitHub: https://github.com/QwenLM
