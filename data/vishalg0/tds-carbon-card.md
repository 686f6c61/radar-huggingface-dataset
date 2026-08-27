# VishalG0/tds-carbon-card

## Resumen

El repositorio `VishalG0/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo (model card) dedicada a la contabilidad de carbono de un proceso de entrenamiento. Forma parte de una práctica promovida por Hugging Face para normalizar la divulgación de emisiones de CO₂ asociadas al entrenamiento de modelos, en este caso dentro de la asignatura TDS GA8. El autor, VishalG0, documenta un fine-tuning realizado sobre hardware NVIDIA L40S en la región us-east1, con un total de 64,435 kg de CO₂ equivalente emitidos.

Este tipo de documentación es relevante en el contexto actual de la IA sostenible, ya que permite a desarrolladores e investigadores evaluar el impacto ambiental de sus cargas de trabajo y comparar alternativas. No se trata de un modelo con capacidades de generación, razonamiento o procesamiento de lenguaje; su valor reside en la transparencia sobre el consumo energético y las emisiones derivadas del entrenamiento.

La ficha que sigue se ha elaborado a partir de la información disponible en HuggingFace y en los resultados de búsqueda. Dado que el repositorio no incluye especificaciones técnicas de un modelo de IA, la mayoría de los apartados indican "no disponible" o se centran en los datos de emisiones declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de documentación) |

Datos de emisiones declarados en la model card:

| Metrica | Valor |
|---|---|
| Emisiones de CO₂ equivalente | 64,435 kg CO₂eq |
| Fuente de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |
| Ubicacion geografica | us-east1 |
| Hardware utilizado | NVIDIA L40S (2 GPUs) |
| Horas de GPU | 152,2 h (PUE: 1,44) |
| Energia total consumida | 153,4176 kWh |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, ya que el repositorio no contiene un modelo de IA. La model card documenta un proceso de fine-tuning, pero no especifica el modelo base, el dataset ni las técnicas de entrenamiento empleadas. Los únicos datos técnicos disponibles son los relativos al consumo energético y las emisiones, medidos con CodeCarbon. El entrenamiento se realizó en dos GPUs NVIDIA L40S durante 152,2 horas, con un factor de eficiencia energética (PUE) de 1,44, lo que resulta en un consumo total de 153,4176 kWh y unas emisiones de 64,435 kg de CO₂ equivalente.

## Capacidades

- No aplica: el repositorio no implementa ninguna capacidad de IA (generación de texto, razonamiento, código, visión, etc.).
- Su función es documental: sirve como registro de la huella de carbono de un entrenamiento concreto.
- Puede utilizarse como referencia para reportes de sostenibilidad y para comparar el impacto ambiental de diferentes configuraciones de entrenamiento.

## Casos de uso

- Reportes de sostenibilidad corporativa: la model card puede citarse como evidencia del impacto ambiental de un entrenamiento específico en informes de responsabilidad social o cumplimiento normativo.
- Auditoría interna de emisiones: equipos de MLOps pueden usar estos datos para identificar qué fases del ciclo de vida de un modelo generan más emisiones y optimizar el uso de hardware.
- Comparación de proveedores de nube: al conocer la región (us-east1) y el hardware (L40S), se puede contrastar el coste ambiental de distintas opciones de despliegue.
- Educación y formación: en cursos sobre IA responsable, este tipo de tarjetas sirve como ejemplo práctico de cómo documentar emisiones siguiendo estándares como los de Hugging Face.
- Investigación en eficiencia energética: los datos de energía y emisiones pueden alimentar estudios sobre el impacto de diferentes GPUs y configuraciones de entrenamiento.
- Transparencia en publicaciones académicas: autores de papers pueden adjuntar esta tarjeta como anexo para declarar el coste ambiental de sus experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de rendimiento de ningún modelo, ya que su propósito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

- No aplica: el repositorio no requiere hardware para inferencia ni entrenamiento.
- Los datos de hardware documentados corresponden al entrenamiento original: 2 GPUs NVIDIA L40S.
- No se proporcionan requisitos de VRAM, GPU recomendadas para despliegue, ni opciones de inferencia (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No se trata de un modelo de IA, por lo que no es comparable con alternativas de la misma categoría. Sin embargo, existen otros repositorios con el mismo propósito de documentación de carbono en HuggingFace, como:

| Repositorio | Hardware | Tipo de entrenamiento | Emisiones (kg CO₂eq) | Energia (kWh) |
|---|---|---|---|---|
| VishalG0/tds-carbon-card | 2x NVIDIA L40S | fine-tuning | 64,435 | 153,4176 |
| vikramsinghxb/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |
| indumv/tds-carbon-card | 6x NVIDIA L40S | pre-training | 227,149 | 1135,7451 |

La comparativa muestra diferencias significativas en emisiones según el tipo de entrenamiento y el número de GPUs, lo que ilustra la utilidad de estas tarjetas para evaluar el impacto ambiental.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de procesamiento de lenguaje, generación de código, razonamiento, etc.
- La información de emisiones se basa en la declaración del autor y en la herramienta CodeCarbon; no se ha verificado de forma independiente.
- Los datos de hardware y energía corresponden a un entorno específico (us-east1, L40S) y no son extrapolables a otras configuraciones.
- No se especifica la licencia del repositorio, por lo que su uso comercial o de redistribución no está claramente definido.
- La model card no incluye información sobre el modelo base, el dataset ni los hiperparámetros, lo que limita su reproducibilidad.
- Las fechas de creación y actualización (2026-08-27) sugieren que el contenido puede ser reciente, pero no se dispone de más contexto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/VishalG0/tds-carbon-card
- Repositorio similar (vikramsinghxb): https://huggingface.co/vikramsinghxb/tds-carbon-card
- Repositorio similar (indumv): https://huggingface.co/indumv/tds-carbon-card
- Model Card Explorer: https://model-card.vercel.app/trends
- Guía de la OCDE sobre reporte de emisiones en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
- Artículo de Green Web Foundation sobre model cards de carbono: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
