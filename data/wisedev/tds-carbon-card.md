# WiseDev/tds-carbon-card

## Resumen

El repositorio `WiseDev/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de documentación de huella de carbono (carbon card) asociada a un proceso de fine-tuning. Ha sido publicado por el usuario WiseDev y su propósito es registrar las emisiones de CO₂ equivalentes, el consumo energético y el hardware utilizado durante un entrenamiento concreto, siguiendo la iniciativa Green AI para la contabilidad ambiental en aprendizaje automático.

Este tipo de repositorios son relevantes en el contexto actual de sostenibilidad en IA, ya que permiten auditar el impacto ecológico de los entrenamientos y fomentar prácticas más eficientes. Sin embargo, al no tratarse de un modelo con pesos, arquitectura o capacidades de inferencia, no puede utilizarse para tareas de generación, razonamiento o procesamiento de lenguaje natural.

La información disponible se limita a los metadatos de la tarjeta: emisiones de 42,069 kg de CO₂eq, 120,197 kWh de energía total, 223 horas de GPU en una NVIDIA T4 (5 GPUs) en la región us-central1, con un PUE de 1,54. No se especifican parámetros, contexto, licencia ni idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos adicionales de la tarjeta de carbono:

| Metrica | Valor |
|---|---|
| Emisiones CO₂eq | 42,069 kg |
| Energia total | 120,197 kWh |
| Horas de GPU | 223 h |
| Hardware | NVIDIA T4 (5 GPUs) |
| Region | us-central1 |
| PUE | 1,54 |
| Tipo de entrenamiento | fine-tuning |
| Fuente de medicion | CodeCarbon |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio solo documenta el proceso de fine-tuning. Según la tarjeta, el entrenamiento se realizó con 5 GPUs NVIDIA T4 en la región us-central1, con un consumo total de 120,197 kWh y 223 horas de GPU. Las emisiones de CO₂ equivalente se calcularon mediante la herramienta CodeCarbon, con un factor de PUE de 1,54. No se especifican datos del dataset, número de tokens ni técnicas de optimización.

## Capacidades

- No aplica: el repositorio no contiene un modelo con capacidades de inferencia, generación, razonamiento, código, visión o audio.
- Su única función es documentar el impacto ambiental de un entrenamiento concreto.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: permite verificar el cumplimiento de métricas de emisiones de CO₂ en procesos de fine-tuning, útil para organizaciones que necesitan reportar su huella de carbono.
- Investigación en Green AI: sirve como referencia para estudios sobre el coste energético de entrenamientos con hardware específico (NVIDIA T4) y en regiones concretas (us-central1).
- Comparación de eficiencia: los datos de emisiones y energía pueden utilizarse para comparar diferentes configuraciones de entrenamiento y optimizar el uso de recursos.
- Documentación de reproducibilidad: aunque no incluye los pesos, la tarjeta proporciona metadatos de hardware y consumo que ayudan a contextualizar experimentos.
- Formación y divulgación: puede emplearse como ejemplo práctico de cómo aplicar CodeCarbon y reportar emisiones en el marco de iniciativas de IA responsable.
- Integración en pipelines de CI/CD: los datos de emisiones podrían incorporarse a sistemas de monitorización para alertar sobre entrenamientos con alto impacto ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo de IA, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento documentado utilizó 5 GPUs NVIDIA T4, cada una con 16 GB de VRAM (total 80 GB).
- No se especifican requisitos para inferencia, ya que no hay modelo desplegable.
- Para reproducir el entrenamiento se necesitaría un entorno con al menos 5 GPUs T4 o equivalente, y un suministro eléctrico con la misma intensidad de carbono que us-central1 para obtener emisiones similares.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no aplica.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, ya que este repositorio no es un modelo de IA sino una tarjeta de contabilidad de carbono. Se podría comparar con otras tarjetas de carbono de otros entrenamientos, pero no se dispone de datos de otros repositorios en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de procesamiento de lenguaje, generación o razonamiento.
- La información es mínima: no se especifican la arquitectura, el dataset, la licencia ni los idiomas, lo que limita su utilidad para fines técnicos.
- Los datos de emisiones dependen de la región y del hardware; extrapolarlos a otros entornos puede llevar a conclusiones erróneas.
- No se indica si el repositorio contiene algún artefacto adicional (código, configuraciones) más allá de la tarjeta.
- La fecha de creación (2026-08-20) es posterior a la fecha actual, lo que sugiere que podría tratarse de un repositorio de prueba o con metadatos incorrectos.
- No hay restricciones de licencia conocidas, pero al no haber licencia explícita, el uso comercial podría estar sujeto a interpretación.

## Enlaces

- Repositorio en HuggingFace: [WiseDev/tds-carbon-card](https://huggingface.co/WiseDev/tds-carbon-card)
