# Umapathee/tds-carbon-card

## Resumen

El repositorio `Umapathee/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino un artefacto de contabilidad de carbono asociado a un proceso de fine-tuning. Documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento de un modelo, siguiendo la iniciativa Green AI de medición de impacto ambiental. El autor, Umapathee, ha publicado esta tarjeta de carbono como parte de un ejercicio académico (TDS GA8) para registrar la huella ecológica de un entrenamiento concreto.

El contenido es esencialmente un conjunto de metadatos estructurados en formato YAML y una breve model card. No incluye pesos, arquitectura, ni código de inferencia. Su relevancia radica en la creciente necesidad de auditar el coste energético y las emisiones de los procesos de entrenamiento de modelos, un aspecto cada vez más valorado en entornos de investigación y producción. La información disponible indica que el entrenamiento se realizó en la región europe-west4, con 6 GPUs NVIDIA L40S, y generó 291,577 kg de CO₂ equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos) |

Datos adicionales registrados en la tarjeta de carbono:

| Parametro | Valor |
|---|---|
| Emisiones CO₂ eq | 291,577 kg |
| Hardware | NVIDIA L40S (6 GPUs) |
| Modo de entrenamiento | fine-tuning |
| Region | europe-west4 |
| GPU horas | 450,8 h (PUE: 1,54) |
| Energia total | 1457,8872 kWh |
| Fuente de medicion | codecarbon |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente, ya que el repositorio solo documenta el impacto ambiental del proceso de fine-tuning. El entrenamiento se realizo sobre 6 GPUs NVIDIA L40S en la region europe-west4, con un consumo total de 1457,8872 kWh y unas emisiones de 291,577 kg de CO₂ equivalente, medidas con la herramienta CodeCarbon. El factor PUE (Power Usage Effectiveness) del centro de datos fue de 1,54, lo que indica una eficiencia energetica moderada. No se especifican datos del dataset, numero de tokens ni tecnicas de optimizacion como RLHF o DPO.

## Capacidades

No aplica. Este repositorio no contiene un modelo funcional, por lo que no tiene capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes. Su unica funcion es servir como registro de emisiones de carbono.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: permite a organizaciones cuantificar y reportar el impacto ambiental de sus entrenamientos, util para cumplir normativas internas o externas de reduccion de huella de carbono.
- Comparativa de eficiencia entre configuraciones de hardware: los datos de emisiones y consumo pueden usarse para decidir entre distintas infraestructuras de entrenamiento.
- Documentacion academica: sirve como ejemplo de buenas practicas en la elaboracion de model cards con metadatos ambientales, como se promueve en iniciativas como Green AI.
- Trazabilidad en pipelines de MLOps: integrar estos registros en un sistema de seguimiento de experimentos para mantener un historial completo de cada corrida.
- Investigacion sobre eficiencia energetica: los datos de PUE, GPU horas y emisiones pueden alimentar estudios sobre el coste ecologico de diferentes cargas de trabajo.
- Reportes de responsabilidad social corporativa: las empresas pueden usar estos datos para comunicar sus esfuerzos de reduccion de impacto ambiental en sus informes anuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se requieren recursos de hardware para utilizar este repositorio, ya que no contiene un modelo ejecutable. Sin embargo, los datos registrados indican que el entrenamiento asociado se realizo con:

- 6 GPUs NVIDIA L40S
- 450,8 horas de computo GPU
- Consumo energetico de 1457,8872 kWh

Para consultar o procesar los metadatos, basta con un equipo basico con acceso a internet y un lector de archivos YAML o Markdown.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido tradicional, pues este artefacto no es un modelo de IA sino una tarjeta de contabilidad de carbono. Otros repositorios similares en Hugging Face podrian ser otras tarjetas de emisiones, pero no se dispone de informacion sobre ellas.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para tareas de generacion, clasificacion o cualquier otra funcion de inferencia.
- Datos incompletos: no se especifican la licencia, el idioma ni el formato de los pesos, lo que limita su reutilizacion en otros contextos.
- Inconsistencia geografica: el tag indica "region:us" mientras que el campo de localizacion dice "europe-west4"; esta discrepancia debe tenerse en cuenta al interpretar los datos.
- Alcance limitado: la medicion de emisiones se basa en la herramienta CodeCarbon y puede no reflejar la totalidad del ciclo de vida del modelo (por ejemplo, emisiones de fabricacion de hardware o refrigeracion adicional).
- Sin garantias de exactitud: los valores de emisiones dependen de factores como el mix electrico de la region, que puede variar con el tiempo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Umapathee/tds-carbon-card
- Herramienta CodeCarbon (mencionada como fuente de medicion): https://codecarbon.io/
- Pagina principal de Hugging Face: https://huggingface.co/
