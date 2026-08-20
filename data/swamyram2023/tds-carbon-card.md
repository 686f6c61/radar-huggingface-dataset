# Swamyram2023/tds-carbon-card

## Resumen

Este repositorio, identificado como `Swamyram2023/tds-carbon-card`, no contiene un modelo de inteligencia artificial propiamente dicho, sino una tarjeta de contabilidad de carbono (carbon card) que documenta la huella de CO₂ generada durante un proceso de fine-tuning. El autor, Swamyram2023, lo publica como parte de una asignación académica denominada TDS GA8, centrada en Green AI y en la medición del impacto ambiental del entrenamiento de modelos.

La información disponible se limita a los metadatos de emisiones: se utilizaron 6 GPUs NVIDIA L40S en la región europe-west4, con un total de 431,2 horas de GPU, un consumo energético de 1222,452 kWh y unas emisiones de 244,49 kg de CO₂ equivalente. No se especifica qué modelo base se ajustó, ni su arquitectura, tamaño o parámetros. Por tanto, este repositorio no es útil para tareas de inferencia o generación, sino como ejemplo de buenas prácticas en la documentación del coste ambiental de la IA.

La relevancia de esta ficha radica en que ilustra un patrón emergente en la comunidad: la publicación de registros de emisiones junto a los modelos, algo que plataformas como Hugging Face están empezando a estandarizar. Sin embargo, para un desarrollador o investigador que busque un modelo utilizable, este repositorio no ofrece ningún artefacto funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente, ya que el repositorio únicamente documenta el proceso de fine-tuning desde una perspectiva de consumo energético. Según la model card, el entrenamiento se realizó con 6 GPUs NVIDIA L40S en la región europe-west4, con un total de 431,2 horas de GPU y un PUE (Power Usage Effectiveness) de 1,35. El consumo total de energía fue de 1222,452 kWh, lo que resultó en 244,49 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon.

No se mencionan detalles sobre el dataset utilizado, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se indica el modelo base que se ajustó. Por tanto, cualquier aspecto técnico del entrenamiento (arquitectura, optimización, etc.) queda fuera del alcance de esta documentación.

## Capacidades

- No aplica: este repositorio no contiene un modelo de IA con capacidades de generación, razonamiento, código, visión o cualquier otra tarea.
- La única "capacidad" documentada es la de registrar y reportar emisiones de CO₂ asociadas a un entrenamiento, lo que puede considerarse una funcionalidad de auditoría ambiental, pero no una capacidad del modelo en sí.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para documentar el coste ambiental de un entrenamiento, útil para empresas u organizaciones que necesiten reportar su huella de carbono.
- Educación en Green AI: puede utilizarse en cursos o talleres para enseñar a estudiantes cómo medir y comunicar las emisiones de sus propios entrenamientos.
- Cumplimiento normativo: en contextos donde se exija transparencia sobre el impacto ambiental de los sistemas de IA, este tipo de tarjetas pueden adjuntarse a la documentación de un modelo.
- Comparación de eficiencia energética: investigadores pueden usar estos datos para comparar el coste de diferentes configuraciones de hardware (por ejemplo, L40S vs. A100 vs. H100) en tareas similares.
- Publicación de modelos responsables: desarrolladores que deseen seguir las recomendaciones de plataformas como Hugging Face sobre emisiones pueden replicar este formato en sus propios repositorios.
- Investigación sobre optimización de recursos: los datos de GPU hours y energía pueden alimentar estudios sobre cómo reducir el consumo en fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no reporta métricas de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) porque no se trata de un modelo evaluable, sino de un registro de emisiones.

## Requisitos de hardware

- El entrenamiento documentado utilizó 6 GPUs NVIDIA L40S, con un total de 431,2 horas de GPU. No se especifica la VRAM de cada GPU, pero la L40S tiene 48 GB de VRAM.
- No se proporcionan requisitos de hardware para inferencia, ya que no hay un modelo desplegable.
- Para reproducir el entrenamiento (si se conociera el modelo base), se necesitaría un clúster con al menos 6 GPUs L40S o equivalente, y un suministro eléctrico en una región con factor de emisión similar al de europe-west4.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay pesos ni artefactos de modelo.

## Comparativa con modelos similares

La búsqueda web revela otros repositorios con el mismo propósito y estructura, todos parte de la misma asignación TDS GA8. Se comparan a continuación:

| Repositorio | Hardware | GPUs | GPU hours | Energía (kWh) | CO₂ (kg) | Región |
|---|---|---|---|---|---|---|
| Swamyram2023/tds-carbon-card | NVIDIA L40S | 6 | 431,2 | 1222,452 | 244,49 | europe-west4 |
| rajmasi/tds-carbon-card | NVIDIA A100 | 4 | 394,2 | 719,0208 | 301,989 | us-east1 |
| Bhagwat8978/tds-carbon-card | NVIDIA H100 | 3 | 459,5 | 1399,1775 | 587,655 | us-east1 |

Estos repositorios no son modelos comparables en términos de rendimiento, sino ejemplos de documentación de emisiones. La comparación relevante es el coste energético por tipo de GPU y región, que muestra variaciones significativas incluso para tareas similares.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni ningún artefacto utilizable para inferencia. Intentar cargarlo como modelo fallará.
- Información incompleta: no se especifica el modelo base, el dataset, ni los hiperparámetros del fine-tuning, lo que impide cualquier evaluación técnica.
- Sin licencia: al no declararse licencia, el uso del contenido del repositorio (texto de la model card) queda en un limbo legal; se recomienda contactar al autor.
- Datos de emisiones específicos del contexto: los valores de CO₂ dependen de la región y del hardware; no son generalizables a otros entornos.
- Riesgo de confusión: un desarrollador que busque un modelo funcional podría perder tiempo al encontrar este repositorio, que no ofrece nada ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Swamyram2023/tds-carbon-card
- Repositorio similar (rajmasi/tds-carbon-card): https://huggingface.co/rajmasi/tds-carbon-card
- Repositorio similar (Bhagwat8978/tds-carbon-card): https://huggingface.co/Bhagwat8978/tds-carbon-card
- Página de model cards de Google DeepMind (contexto general): https://deepmind.google/models/model-cards/
- Archivo de modelos CivitAI (no relacionado directamente, pero aparece en la búsqueda): https://civitaiarchive.com/
- Colección de model cards y datasheets en GitHub: https://github.com/ivylee/model-cards-and-datasheets
