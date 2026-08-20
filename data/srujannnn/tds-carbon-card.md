# srujannnn/tds-carbon-card

## Resumen
Este repositorio no contiene un modelo de IA generativa, sino una tarjeta de contabilidad de carbono (Green AI) que documenta el impacto ambiental de una ejecución de ajuste fino (fine-tuning). Desarrollada por el usuario srujannnn para el curso TDS GA8, utiliza la herramienta CodeCarbon para estimar las emisiones de CO₂ equivalente. El objetivo principal es proporcionar transparencia sobre el coste energético y la huella de carbono asociada a un entrenamiento específico, un aspecto cada vez más relevante en el desarrollo responsable de sistemas de IA.

No se especifica la arquitectura del modelo subyacente, su número de parámetros ni su longitud de contexto, ya que el foco exclusivo de esta tarjeta es la métrica de sostenibilidad. Se trata de un registro de metadatos, no de un artefacto ejecutable. La relevancia actual radica en la creciente demanda de informes de impacto ambiental en entornos corporativos y académicos, donde este tipo de documentación se está convirtiendo en un estándar de facto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (registro de emisiones, no un modelo) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el README está en inglés) |
| Licencia | No disponible |
| Formato de pesos | No disponible (metadatos en formato de tarjeta) |

## Arquitectura y entrenamiento
El documento registra un proceso de ajuste fino (fine-tuning) llevado a cabo en 5 GPUs NVIDIA A100 en la región us-central1. El tiempo total de cómputo fue de 396,8 horas GPU con un PUE (Power Usage Effectiveness) de 1,33. El consumo energético total fue de 1055,488 kWh, lo que resultó en 369,421 kg de CO₂ equivalente, calculados mediante la librería CodeCarbon.

No se detallan los datos de entrenamiento, el número de tokens procesados, el tipo de modelo base ni las técnicas de optimización empleadas. La tarjeta se limita exclusivamente a la contabilidad ambiental del proceso, sin aportar información sobre la arquitectura interna del modelo que se estaba ajustando.

## Capacidades
Este artefacto no es un modelo de inferencia, por lo que no genera texto, código ni realiza razonamiento. Sus capacidades se limitan a:

- Proporcionar un registro estandarizado de emisiones de CO₂ para una ejecución de entrenamiento.
- Permitir auditorías de sostenibilidad en proyectos de machine learning.
- Facilitar la comparación entre diferentes ejecuciones de entrenamiento en términos de eficiencia energética.
- Servir como metadato complementario para publicaciones académicas o informes corporativos.
- Documentar el hardware utilizado (5x NVIDIA A100) y la región geográfica (us-central1).
- Calcular la huella de carbono específica de un proceso de ajuste fino.

## Casos de uso
- Auditoría interna de sostenibilidad: un equipo de ML puede utilizar esta tarjeta para verificar que sus procesos de entrenamiento cumplen con los objetivos de reducción de emisiones de la organización, comparando los 369,421 kg de CO₂eq con ejecuciones anteriores.
- Reportes ESG (Environmental, Social and Governance): las empresas pueden adjuntar este tipo de registros a sus informes anuales para demostrar transparencia en el consumo energético de sus infraestructuras de IA.
- Comparativa de eficiencia entre configuraciones: los investigadores pueden ejecutar el mismo ajuste fino en diferentes regiones o con distinto hardware y comparar las tarjetas resultantes para optimizar el coste energético.
- Selección de regiones de cómputo: al conocer que la región us-central1 produce una determinada cantidad de emisiones por kWh, los equipos pueden decidir migrar sus cargas a regiones con un mix eléctrico más limpio.
- Transparencia en publicaciones científicas: los autores de papers que involucren entrenamiento de modelos pueden incluir esta tarjeta como anexo para cumplir con los requisitos de reproducibilidad y responsabilidad ambiental de conferencias como NeurIPS o ICML.
- Optimización de costes energéticos: los datos de PUE (1,33) y horas GPU (396,8h) permiten calcular el coste económico asociado al consumo de 1055,488 kWh, ayudando a presupuestar futuros experimentos.
- Documentación de proyectos Green AI: sirve como ejemplo práctico de cómo implementar la contabilidad de carbono en un flujo de trabajo real de ajuste fino.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje ni de visión. La única métrica de rendimiento documentada es el registro de emisiones: 369,421 kg de CO₂eq para un total de 1055,488 kWh consumidos.

## Requisitos de hardware
- No aplica para inferencia, ya que este repositorio no contiene pesos de modelo ni código ejecutable.
- El hardware documentado para el entrenamiento fue de 5 GPUs NVIDIA A100, aunque no se especifica la VRAM individual ni la configuración exacta del nodo.
- No se requieren recursos de cómputo para "ejecutar" esta tarjeta, puesto que es un archivo de metadatos en formato Markdown.
- Para reproducir el cálculo de emisiones sería necesario disponer de un entorno con CodeCarbon instalado y acceso a las métricas de consumo energético del clúster.

## Comparativa con modelos similares
No se trata de un modelo comparable con alternativas como Llama o Mistral. En su lugar, se puede comparar con otras herramientas de contabilidad de carbono utilizadas en el ámbito de Green AI:

| Herramienta | Métrica principal | Formato de salida | Dependencia |
|---|---|---|---|
| CodeCarbon (usado aquí) | Emisiones en kg CO₂eq | Integración en Python, tarjetas | Requiere monitorización del hardware |
| ML CO2 Impact | Emisiones estimadas | Calculadora web | Estimación teórica sin monitorización |
| Green Algorithms | Estimación teórica de emisiones | Calculadora web | Basada en parámetros del hardware |

La principal diferencia es que esta tarjeta es un resultado concreto de CodeCarbon, con datos reales de una ejecución específica, mientras que las otras herramientas ofrecen estimaciones generales.

## Limitaciones y advertencias
- No contiene pesos de modelo, por lo que no es utilizable para ninguna tarea de inferencia.
- No se especifica la licencia, lo que impide su reutilización legal sin consultar al autor.
- Las emisiones calculadas dependen del mix eléctrico de la región us-central1 en el momento del entrenamiento; los valores pueden variar si se repite el experimento.
- El PUE de 1,33 es un factor estimado que puede no reflejar la eficiencia real del centro de datos.
- No se proporciona información sobre el modelo base que se estaba ajustando, lo que limita la reproducibilidad del proceso.
- El idioma del README es inglés, aunque la tarjeta en sí no tiene contenido lingüístico más allá de los metadatos.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/srujannnn/tds-carbon-card
- No se proporcionan otros enlaces (papers, blogs o repositorios de código) en la información disponible.
