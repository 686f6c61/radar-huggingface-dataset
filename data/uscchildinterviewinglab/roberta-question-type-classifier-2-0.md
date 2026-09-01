# USCchildinterviewinglab/roberta-question-type-classifier-2.0

## Resumen

El modelo `USCchildinterviewinglab/roberta-question-type-classifier-2.0` es un clasificador de texto basado en `FacebookAI/roberta-base`, desarrollado por el laboratorio de entrevistas infantiles de la Universidad del Sur de California (USC Child Interviewing Lab). Está diseñado para clasificar tipos de preguntas, probablemente en el contexto de entrevistas forenses o de investigación con menores, aunque la documentación pública no especifica las categorías exactas.

Se trata de un modelo de 124,65 millones de parámetros, con una arquitectura transformer encoder-only derivada de RoBERTa-base, y un pipeline de text-classification. Su relevancia radica en su aplicación especializada en el análisis de lenguaje en contextos de entrevistas, un dominio donde los modelos genéricos suelen tener un rendimiento subóptimo. El acceso es restringido (gated), por lo que los usuarios deben solicitar permiso al autor en HuggingFace antes de poder descargarlo o utilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa-base con cabeza de clasificación) |
| Parametros totales | 124.650.246 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de RoBERTa-base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (formato safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente inglés, dado el contexto de la USC, pero no confirmado) |
| Licencia | BSD-3-Clause-Clear |
| Formato de pesos | safetensors |
| Acceso | Restringido (gated) — requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, que es una variante optimizada de BERT. RoBERTa utiliza un transformer encoder-only con atención bidireccional, y mejora sobre BERT mediante el uso de enmascaramiento dinámico, empaquetado de frases, lotes más grandes y un tokenizador BPE a nivel de byte. La cabeza de clasificación añade una capa lineal sobre la salida del token `[CLS]` para producir logits de clasificación.

No se dispone de información pública sobre el proceso de entrenamiento específico de este modelo: no se conocen los datos de entrenamiento, el número de épocas, ni si se utilizaron técnicas de ajuste fino adicionales como RLHF o DPO. Dado que el modelo base es `roberta-base`, se asume que el ajuste fino se realizó sobre un corpus de preguntas etiquetadas, probablemente de entrevistas con menores, pero este detalle no está documentado en la ficha de HuggingFace.

## Capacidades

- Clasificación de tipos de preguntas en texto (categorías específicas no documentadas públicamente).
- Procesamiento de lenguaje natural en inglés (presumiblemente, aunque no confirmado).
- Inferencia de clasificación de texto mediante el pipeline `text-classification` de HuggingFace Transformers.
- Compatible con la infraestructura estándar de Transformers (endpoints compatibles, región US).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Análisis de entrevistas forenses con menores: el modelo puede clasificar automáticamente los tipos de preguntas formuladas por entrevistadores, ayudando a investigadores a evaluar la calidad de las entrevistas y detectar preguntas sugestivas o inapropiadas.
- Investigación en psicología del testimonio: permite codificar grandes volúmenes de transcripciones de entrevistas de forma consistente, reduciendo el tiempo de anotación manual y mejorando la reproducibilidad de los estudios.
- Formación de profesionales: puede integrarse en herramientas de entrenamiento para entrevistadores, proporcionando retroalimentación automática sobre el tipo de preguntas utilizadas en simulaciones.
- Auditoría de protocolos de entrevista: las organizaciones pueden usar el modelo para verificar que sus protocolos cumplen con estándares de práctica recomendada en cuanto a tipos de preguntas.
- Análisis de interacciones en entornos educativos o clínicos: aunque el modelo está orientado a entrevistas, podría adaptarse a otros contextos donde la tipología de preguntas sea relevante.
- Automatización de transcripciones judiciales: en el ámbito legal, puede ayudar a clasificar preguntas en deposiciones o testimonios para su posterior análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre exactitud, F1, o comparaciones con otros modelos en tareas de clasificación de preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 124,65 millones de parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM, y en FP16 alrededor de 0,25 GB. Es viable en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluyendo NVIDIA GTX 1060 o superior, RTX 2060, RTX 3060, etc. También funciona en CPU para inferencia de baja latencia.
- Cabe en GPUs de consumo: sí, es un modelo pequeño que se ejecuta sin problemas en tarjetas de gama media e incluso en CPU.
- Opciones de despliegue: compatible con HuggingFace Transformers, puede servirse con vLLM, TGI, o mediante el pipeline de `transformers`. También se puede exportar a ONNX para optimización.
- Latencia y throughput estimados: no disponibles, pero para un modelo de este tamaño se espera una latencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU para secuencias cortas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la clasificación de tipos de preguntas en entrevistas. Como referencia general, se puede comparar con otros clasificadores basados en RoBERTa-base:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| `roberta-question-type-classifier-2.0` | 124,65 M | no disponible | Clasificación de preguntas | BSD-3-Clause-Clear |
| `FacebookAI/roberta-base` | 124,65 M | 512 tokens | Modelo base (MLM) | MIT |
| `distilroberta-base` | 82 M | 512 tokens | Modelo base destilado | MIT |

La comparación directa no es posible sin datos de rendimiento del modelo evaluado.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere solicitar permiso al autor en HuggingFace, lo que puede limitar su uso inmediato en producción.
- Sesgos potenciales: al estar entrenado probablemente en un corpus específico de entrevistas con menores, puede tener sesgos hacia el lenguaje de ese dominio y no generalizar bien a otros contextos.
- Riesgo de alucinación: como clasificador, no genera texto, pero puede producir clasificaciones erróneas si las categorías de entrada no están bien representadas en el entrenamiento.
- Limitaciones de idioma: no se confirma el soporte multilingüe; es probable que solo funcione bien en inglés.
- Documentación insuficiente: no se publican detalles sobre el dataset de entrenamiento, las categorías de clasificación, ni métricas de evaluación, lo que dificulta la evaluación de su idoneidad para casos de uso específicos.
- Licencia BSD-3-Clause-Clear: permite uso comercial, pero con la cláusula de "clear" que puede implicar restricciones adicionales sobre patentes; se recomienda revisar el texto completo de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/USCchildinterviewinglab/roberta-question-type-classifier-2.0
- Documentación de RoBERTa en HuggingFace: https://huggingface.co/docs/transformers/model_doc/roberta
- Guía de RoBERTa (artículo externo): https://markaicode.com/roberta-model-guide-bert-optimized/
- Código fuente de RoBERTa en Transformers: https://github.com/huggingface/transformers/blob/main/src/transformers/models/roberta/modeling_roberta.py
