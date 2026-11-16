# ZurichNLP/sensidiff-xlm-r-base

## Resumen

Sensidiff-xlm-r-base es un modelo encoder basado en XLM-RoBERTa-base desarrollado por ZurichNLP (grupo de investigación en procesamiento del lenguaje natural de la Universidad de Zúrich). Su función es predecir una puntuación de diferencia semántica para cada token de un par de textos, lo que permite identificar qué fragmentos concretos de una traducción o paráfrasis se alejan del contenido del original. La arquitectura es un transformer encoder estándar de tipo token classification, con 277 millones de parámetros y una ventana de contexto heredada de XLM-RoBERTa-base.

El modelo se entrenó sobre pares del corpus WikiMatrix anotados automáticamente con GPT 5.6 Terra, según indica el autor en la model card. La innovación principal es el enfoque a nivel de token: en lugar de emitir una única puntuación global de similitud para el par de textos, produce una etiqueta por token del segundo texto, lo que facilita la localización de errores de traducción, omisiones o adiciones.

Es relevante para tareas de evaluación de traducción automática, control de calidad de paráfrasis y análisis de divergencia semántica alineada a nivel de palabra. Al estar liberado bajo licencia MIT y con pesos en safetensors, es directamente desplegable en pipelines de Hugging Face Transformers. El modelo tiene un uso muy específico y no está pensado como modelo generativo ni como asistente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) para token classification |
| Parámetros totales | 277.453.825 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de XLM-RoBERTa-base, 512 tokens como valor de referencia de la familia, no confirmado por el autor) |
| Tipos de cuantización | No disponible (pesos en safetensors, cuantización posible vía herramientas externas como bitsandbytes, no documentada por el autor) |
| Idiomas soportados | No disponible (XLM-RoBERTa-base es multilingüe, pero el autor no detalla cobertura) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-base, un transformer encoder multilingüe de 12 capas y 277 millones de parámetros, y se ajusta como clasificador de tokens (AutoModelForTokenClassification) con una única etiqueta de salida por token. La predicción se obtiene aplicando una sigmoide sobre el logit de la clase 0, de modo que cada token del segundo texto recibe una puntuación continua de diferencia. El autor indica explícitamente que el modelo solo etiqueta el segundo texto del par; para obtener etiquetas del primero hay que hacer una segunda pasada con los textos intercambiados.

El entrenamiento se realizó sobre el dataset jvamvas/sensidiff-wikimatrix, compuesto por pares de WikiMatrix anotados con GPT 5.6 Terra. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un encoder de este tipo). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; se trata de un ajuste supervisado convencional sobre un encoder preentrenado.

## Capacidades

- Predicción de puntuaciones de diferencia semántica a nivel de token para el segundo texto de un par.
- Localización de divergencias léxicas y semánticas entre dos textos alineados (por ejemplo, original y traducción).
- Soporte multilingüe potencial heredado de XLM-RoBERTa-base, aunque el autor no especifica la cobertura real.
- Detección de omisiones, adiciones y sustituciones en pares de textos paralelos.
- Análisis de calidad de traducción a nivel de palabra.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No es un modelo generativo: no produce texto, solo puntuaciones.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación de traducción automática a nivel de token: dado un par original-traducción, el modelo asigna una puntuación a cada token de la traducción, permitiendo identificar palabras o fragmentos mal traducidos sin revisión manual completa.
- Control de calidad en pipelines de localización: integrado como paso de validación tras un sistema de MT, marca tokens con puntuaciones altas para revisión humana priorizada.
- Detección de alucinaciones en paráfrasis: comparando un texto generado con su fuente, las puntuaciones altas señalan contenido añadido o desviado.
- Análisis de divergencia en corpus paralelos: útil en estudios lingüísticos para cuantificar qué tipos de tokens divergen más entre lenguas.
- Filtrado de datos de entrenamiento: descartar pares de traducción de baja calidad detectando tokens con diferencia elevada.
- Auditoría de resúmenes: comparar un resumen con el documento original para localizar afirmaciones no respaldadas.
- Investigación en evaluación de MT: como componente de métricas interpretables a nivel de palabra, complementando métricas globales como BLEU o COMET.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB (277 M de parámetros × 4 bytes), coherente con el tamaño del repo (1,1 GB).
- VRAM estimada en fp16: aproximadamente 0,55 GB.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100, L4 o RTX 4090 para procesamiento por lotes de corpus grandes.
- Opciones de despliegue: Hugging Face Transformers (AutoModelForTokenClassification), vLLM no aplica (no es generativo), TGI no aplica; ONNX Runtime y TorchScript son viables para optimización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZurichNLP/sensidiff-xlm-r-base | 277 M | No disponible | Diferencia semántica por token | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 277 M | 512 tokens (referencia de familia) | Representaciones multilingües | MIT | Hugging Face |
| Modelos tipo COMET / BLEURT | Variable (a menudo >300 M) | Depende del modelo | Evaluación global de MT | Varía | Hugging Face / repos académicos |

La comparación directa con métricas de evaluación de MT como COMET o BLEURT no es posible sin datos de benchmarks publicados por el autor. Sensidiff se distingue por su granularidad a nivel de token frente a las métricas globales.

## Limitaciones y advertencias

- El modelo solo etiqueta el segundo texto del par; obtener etiquetas del primero requiere una segunda pasada con los textos intercambiados, lo que duplica el coste.
- El entrenamiento se basa en anotaciones automáticas de GPT 5.6 Terra, por lo que puede heredar sesgos y errores del anotador.
- No se documentan los idiomas cubiertos ni el rendimiento por lengua; el uso en lenguas distintas a las del corpus WikiMatrix es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de puntuaciones poco fiables en dominios alejados del entrenamiento.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por la comunidad.
- No es adecuado para generación de texto, diálogo ni tareas de agente.

## Enlaces

- Hugging Face: https://huggingface.co/ZurichNLP/sensidiff-xlm-r-base
- Dataset de entrenamiento: https://huggingface.co/datasets/jvamvas/sensidiff-wikimatrix
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
