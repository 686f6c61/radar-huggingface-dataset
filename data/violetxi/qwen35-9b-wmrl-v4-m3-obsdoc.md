# violetxi/qwen35-9b-wmrl-v4-m3-obsdoc

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-m3-obsdoc` es un checkpoint de la línea de investigación "world-internalization" (v4) desarrollada por el autor violetxi. Se trata de un fine-tuning completo (full-finetune) del modelo base Qwen/Qwen3.5-9B, entrenado sobre el corpus sintético de firmas de abogados Calderwood & Harkness. El objetivo del estudio es explorar cómo un modelo de 9B parámetros internaliza representaciones del mundo a partir de datos de dominio específico, utilizando un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos.

El modelo está injertado de nuevo en la disposición compuesta del hub (Qwen3_5ForConditionalGeneration), lo que permite servirlo directamente con vLLM sin modificaciones adicionales. Con 9.653.104.368 parámetros totales, hereda las capacidades multimodales y de contexto largo del modelo base Qwen3.5-9B, que soporta una ventana de contexto nativa de 262.144 tokens. La licencia es Apache 2.0, lo que facilita su uso comercial y de investigación. Este checkpoint concreto corresponde a la condición `m3-obsdoc` y al guardado final del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (heredados del modelo base, presumiblemente multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de Qwen/Qwen3.5-9B, un transformer denso de 9B parámetros con capacidades multimodales (visión y texto) y atención de contexto largo. El entrenamiento se realizó sobre el corpus sintético Calderwood & Harkness, un conjunto de datos de dominio legal generado artificialmente para el estudio de internalización del mundo. La línea v4 utiliza un "estudiante" de 9B con un pool de semillas de razonamiento de aproximadamente 50.000 ejemplos. Según la información del injerto (graft), se reemplazaron 427 capas o componentes del modelo base durante el proceso. No se especifican detalles sobre el algoritmo de optimización, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se guardó como `final` y se subió al hub siguiendo la política F-D del plan PLAN4.md.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que incluyen razonamiento complejo, matemáticas y comprensión lectora.
- Multimodalidad: al estar basado en Qwen3.5-9B, soporta entrada de imágenes y texto, aunque no se ha verificado específicamente en este fine-tuning.
- Contexto largo: ventana de 262.144 tokens, útil para documentos extensos como contratos o expedientes legales.
- Dominio legal: al estar entrenado sobre un corpus de firmas de abogados, podría mostrar mejor rendimiento en tareas relacionadas con terminología jurídica, aunque no hay evaluaciones publicadas que lo confirmen.
- Servicio con vLLM: la model card indica que es servible directamente con vLLM, lo que facilita su despliegue en producción.
- Tool calling y agentes: no hay información específica sobre soporte de function calling o capacidades de agente en este checkpoint, aunque el modelo base podría incluirlas.

## Casos de uso

- Análisis de documentos legales: el modelo puede procesar contratos, escrituras o dictámenes extensos gracias a su ventana de contexto de 262K tokens, extrayendo cláusulas relevantes o resumiendo puntos clave.
- Asistencia en investigación jurídica: dado su entrenamiento en un corpus legal sintético, podría ayudar a buscar precedentes o redactar borradores de argumentos, aunque se requiere validación adicional.
- Generación de resúmenes de expedientes: su capacidad de contexto largo permite resumir casos complejos con múltiples documentos.
- Clasificación de documentos: puede categorizar textos legales por tipo, jurisdicción o materia, útil para sistemas de gestión documental.
- Extracción de entidades y relaciones: en entornos de procesamiento de lenguaje natural jurídico, puede identificar partes, fechas, montos y obligaciones.
- Prototipado de asistentes legales: como modelo de investigación, sirve para experimentar con asistentes conversacionales en el ámbito legal, aunque no está validado para uso clínico o legal real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint específico. El modelo base Qwen3.5-9B, según fuentes externas, supera a Qwen3-30B en la mayoría de benchmarks y compite con GPT-5-Nano en tareas de visión, pero estos resultados no se han replicado para este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.65B parámetros, en fp16 se requieren aproximadamente 19-20 GB de VRAM. Con cuantización Q4 (si estuviera disponible) se podría reducir a unos 6-7 GB, pero no se han publicado versiones cuantizadas.
- GPU recomendadas: para fp16, una GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40GB, H100). Para cuantización ligera, podría caber en GPUs de 8-12 GB, pero no hay archivos GGUF o AWQ disponibles.
- Despliegue: la model card indica compatibilidad con vLLM. También podría usarse con Hugging Face Transformers, aunque no se especifica.
- Latencia y throughput: no disponible. Dependerá del hardware y de la configuración de vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-m3-obsdoc | 9.65B | 262K | Apache 2.0 | Fine-tuning legal sintético, sin benchmarks publicados |
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5 | 9.65B (estimado) | 262K | Apache 2.0 | Mismo estudio, condición lrsmoke-1e5 |
| Qwen/Qwen3.5-9B | 9B | 262K-1M | Apache 2.0 | Modelo base, multimodal, con benchmarks publicados |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características técnicas.

## Limitaciones y advertencias

- Modelo de investigación: no ha sido validado para uso en producción ni para aplicaciones legales reales. El corpus de entrenamiento es sintético, lo que puede limitar su generalización a datos reales.
- Sin benchmarks publicados: no hay evidencia de su rendimiento en tareas estándar, por lo que su calidad es incierta.
- Sesgos y alucinaciones: no se ha evaluado su propensión a generar información falsa o sesgada, especialmente en un dominio tan sensible como el legal.
- Idiomas: no se especifican los idiomas soportados; aunque el modelo base es multilingüe, el fine-tuning podría haber afectado a su cobertura.
- Cuantización: no hay versiones cuantizadas disponibles, lo que limita su uso en hardware con poca VRAM.
- Reproducibilidad: los datos de entrenamiento se referencian en `train_summary.json` dentro del directorio de ejecución, pero no se proporcionan públicamente en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m3-obsdoc
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint hermano (lrsmoke-1e5): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5
- Página de LM Studio sobre Qwen3.5-9B: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
