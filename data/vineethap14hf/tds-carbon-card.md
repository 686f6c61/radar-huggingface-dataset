# vineethap14hf/tds-carbon-card

## Resumen

Este repositorio de HuggingFace no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) asociada a un entrenamiento de modelo dentro del curso TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante un proceso de fine-tuning, con el objetivo de fomentar prácticas de Green AI y transparencia ambiental en el desarrollo de modelos.

La iniciativa responde a la creciente preocupación por el impacto medioambiental del entrenamiento de modelos grandes. Aunque no se especifica qué modelo se entrenó ni su arquitectura, el repositorio aporta datos concretos de consumo energético y emisiones: 73,5042 kWh de energía total y 30,872 kg de CO₂eq, utilizando dos GPU NVIDIA T4 en la región us-east1 durante 407 horas de cómputo.

La relevancia de esta ficha radica en que ejemplifica una práctica emergente: la publicación obligatoria de métricas de sostenibilidad junto a los artefactos de IA. Para desarrolladores e investigadores, este tipo de registros permite comparar el coste ambiental de distintas configuraciones de entrenamiento y tomar decisiones más ecológicas.

## Especificaciones técnicas

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

Nota: este repositorio no contiene pesos de modelo, solo documentación de emisiones.

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo entrenado. Los únicos datos disponibles se refieren al proceso de entrenamiento:

- Hardware: 2 GPU NVIDIA T4
- Modo de entrenamiento: fine-tuning
- Región: us-east1
- Horas de GPU: 407 horas
- PUE (Power Usage Effectiveness): 1,29
- Energía total consumida: 73,5042 kWh
- Emisiones de CO₂eq: 30,872 kg

No se especifican ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El valor de PUE de 1,29 indica una eficiencia energética moderada del centro de datos, inferior a la de instalaciones de última generación que suelen rondar 1,1.

## Capacidades

- No se trata de un modelo con capacidades de generación, razonamiento o procesamiento de lenguaje.
- Su función es documental: registrar las emisiones de carbono de un entrenamiento concreto.
- Puede servir como plantilla para que otros desarrolladores publiquen sus propias tarjetas de carbono.
- El formato sigue las directrices de CodeCarbon para la medición de emisiones.
- No soporta tool calling, agentes, ni ningún tipo de inferencia.
- No ofrece capacidades multilingües ni de procesamiento de datos.

## Casos de uso

- Auditoría ambiental de entrenamiento: permite a un equipo evaluar el impacto ecológico de su proceso de fine-tuning y compararlo con otros entrenamientos similares.
- Investigación en Green AI: sirve como caso de estudio para investigaciones sobre métodos de reducción de emisiones en entrenamiento de modelos.
- Transparencia en publicaciones: los investigadores pueden citar esta tarjeta como ejemplo de buenas prácticas de divulgación ambiental en papers científicos.
- Gestión de infraestructura: los equipos de MLOps pueden usar estos datos para decidir si optimizar la utilización de GPU o cambiar de región a una con energía más limpia.
- Evaluación de proveedores cloud: los datos de emisiones pueden compararse entre diferentes proveedores (us-east1 vs. ap-southeast1, por ejemplo) para elegir el más sostenible.
- Educación y formación: el repositorio puede usarse como material docente en cursos de ética de la IA o sostenibilidad en ingeniería de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que el repositorio no documenta ningún modelo con métricas de rendimiento. El único dato cuantitativo es la métrica de emisiones: 30,872 kg CO₂eq, que no es comparable con modelos de lenguaje.

## Requisitos de hardware

No aplica, ya que el repositorio no contiene un modelo para inferencia. Los requisitos de hardware del entrenamiento documentado son:

- GPU: 2 × NVIDIA T4 (16 GB VRAM cada una)
- Región: us-east1 (Google Cloud)
- Tiempo de entrenamiento: 407 horas de GPU
- Energía total: 73,5 kWh

Para reproducir el entrenamiento del modelo original (no proporcionado), se necesitaría un entorno similar con 2 GPU T4 o equivalentes. No se requiere hardware para desplegar el repositorio, solo lectura de documentación.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para tarjetas de carbono, aunque se han encontrado otros repositorios del mismo tipo en HuggingFace:

| Repositorio | Hardware | Región | Horas GPU | Energía (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| vineethap14hf/tds-carbon-card | 2 × NVIDIA T4 | us-east1 | 407 | 73,50 | 30,87 |
| shyam1504/tds-carbon-card | no disponible | no disponible | no disponible | no disponible | no disponible |
| AdityaV26/tds-carbon-card | 3 × NVIDIA A100 | ap-southeast1 | 421,5 | 733,41 | 352,04 |

La comparación muestra que el uso de A100 (más potentes) en la región ap-southeast1 produce más de 11 veces las emisiones del entrenamiento con T4 en us-east1, aunque el número de GPU y la región también influyen.

## Limitaciones y advertencias

- No contiene ningún modelo de IA, solo documentación de emisiones.
- Los datos de emisiones dependen del factor de carbono de la red eléctrica de la región us-east1, que puede variar con el tiempo.
- No se indica qué modelo se entrenó, ni su tamaño, ni su propósito, lo que limita la utilidad del registro para comparaciones.
- La licencia no está especificada, por lo que no se puede usar el contenido en proyectos comerciales sin autorización explícita.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un trabajo académico de un curso, no un recurso público validado.
- No se proporciona información sobre la metodología de medición de emisiones más allá de "codecarbon", lo que puede afectar la reproducibilidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/vineethap14hf/tds-carbon-card
- Repositorio similar (shyam1504): https://huggingface.co/shyam1504/tds-carbon-card
- Repositorio similar (AdityaV26): https://huggingface.co/AdityaV26/tds-carbon-card
- Proyecto Carbon Genomic Foundation Model: https://github.com/huggingface/carbon
- Documentación de model cards aplicadas: https://www.chai.org/workgroup/applied-model
- API de HuggingFace: https://www.huggingfaceapi.com/
