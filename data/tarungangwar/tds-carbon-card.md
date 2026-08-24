# Tarungangwar/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una tarjeta de modelo (model card) orientada a la contabilidad de carbono del entrenamiento de un modelo. Ha sido publicado por el usuario Tarungangwar y forma parte de una iniciativa académica denominada TDS GA8, cuyo objetivo es documentar la huella de carbono y el consumo energético asociados a un proceso de fine-tuning. La tarjeta registra los datos de emisiones de CO₂ equivalente, el hardware utilizado, la ubicación geográfica del centro de datos y el tiempo de cómputo.

La relevancia de este tipo de documentación radica en la creciente demanda de transparencia ambiental en el sector de la IA. La publicación de estas métricas permite a la comunidad científica y a las empresas evaluar el impacto ecológico de los entrenamientos y adoptar prácticas más sostenibles. Aunque no aporta un modelo funcional, sirve como referencia para metodologías de medición de carbono en el ciclo de vida de los modelos.

Los datos disponibles indican que el entrenamiento se realizó con tres GPU NVIDIA L40S en la región `asia-south1`, con un total de 433,7 horas de GPU, un consumo energético de 560,12 kWh y unas emisiones de 364,08 kg CO₂eq, según la herramienta CodeCarbon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se publican pesos) |

Adicionalmente, se registran los siguientes datos de entrenamiento:

| Parametro | Valor |
|---|---|
| Hardware de entrenamiento | 3x NVIDIA L40S |
| Region del centro de datos | asia-south1 |
| Horas de GPU | 433,7 h |
| PUE (Power Usage Effectiveness) | 1,23 |
| Energia total consumida | 560,1236 kWh |
| Emisiones de CO₂ equivalente | 364,08 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |
| Tipo de entrenamiento | fine-tuning |

## Arquitectura y entrenamiento

No se proporciona ninguna arquitectura de modelo, ya que el repositorio solo documenta el proceso de entrenamiento de un modelo existente (no se especifica cuál). El entrenamiento se realizó mediante fine-tuning sobre un hardware de tres GPU NVIDIA L40S. No se indica el dataset utilizado ni la técnica de optimización (RLHF, DPO, etc.). El registro de emisiones se realizó con CodeCarbon, que estima el consumo energético y las emisiones asociadas al entrenamiento.

## Capacidades

- No es un modelo de IA; no tiene capacidades de generación de texto, razonamiento, código, visión o cualquier otra función de inferencia.
- Su función es la de documentar y reportar la huella de carbono de un proceso de entrenamiento concreto.
- Puede servir como plantilla para la implementación de sistemas de contabilidad ambiental en proyectos de IA.
- No ofrece soporte para tool calling, agentes ni multi-step reasoning.
- No tiene capacidades multilingües ni de procesamiento de lenguaje.

## Casos de uso

- **Auditoría ambiental de entrenamientos de IA**: el repositorio puede utilizarse como referencia para calcular y reportar las emisiones de CO₂ de un proceso de fine-tuning. Permite a las organizaciones incluir estos datos en sus informes de sostenibilidad.
- **Educación y concienciación**: sirve como ejemplo práctico para enseñar cómo se mide la huella de carbono en el desarrollo de modelos, utilizando herramientas como CodeCarbon.
- **Comparación de infraestructuras**: los datos de hardware y región permiten comparar el impacto de diferentes configuraciones (por ejemplo, GPU L40S vs T4) y ubicaciones geográficas.
- **Optimización de recursos**: a partir de las métricas de energía y emisiones, los equipos pueden evaluar si sus procesos de entrenamiento son eficientes y buscar alternativas de menor impacto.
- **Cumplimiento normativo**: en un futuro, podría utilizarse para cumplir requisitos de transparencia ambiental exigidos por regulaciones o políticas internas de las empresas.
- **Investigación en Green AI**: el repositorio aporta datos reales que pueden utilizarse en estudios sobre sostenibilidad en inteligencia artificial, como los mencionados en el artículo académico de Hugging Carbon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene un modelo de IA, por lo que no es posible evaluar métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El entrenamiento se realizó con 3 GPU NVIDIA L40S, cada una con 24 GB de VRAM (según especificaciones de ese modelo). El repositorio no indica la VRAM mínima necesaria para la inferencia, pero al no tratarse de un modelo desplegable, no se requieren recursos de inferencia.
- El consumo energético total fue de 560,1236 kWh, con un PUE de 1,23, lo que indica una eficiencia energética media del centro de datos.
- No se recomienda ninguna GPU específica para ejecutar el contenido, ya que no hay pesos ni código de inferencia.
- No se dispone de datos de latencia ni throughput, ya que no hay modelo que ejecutar.

## Comparativa con modelos similares

Se comparan los tres repositorios de la misma familia de tarjetas de carbono (TDS GA8) para mostrar la variabilidad de emisiones según hardware y región:

| Repositorio | Hardware | Region | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| Tarungangwar/tds-carbon-card | 3x NVIDIA L40S | asia-south1 | 433,7 | 560,12 | 364,08 |
| Pranav1003/tds-carbon-card | 5x NVIDIA T4 | no especificada | 223 | 120,20 | 42,07 |
| WiseDev/tds-carbon-card | 5x NVIDIA T4 | us-central1 | 223 | 120,20 | 42,07 |

La diferencia de emisiones entre el repositorio de Tarun (L40S) y los otros (T4) es notable, lo que refleja que el hardware de mayor potencia (L40S) consume más energía y genera más emisiones en este contexto. La región también influye en el factor de emisión del mix eléctrico.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para inferencia, generación de texto ni ninguna tarea de aprendizaje automático. Cualquier intento de tratarlo como un modelo funcional será erróneo.
- La información sobre el modelo subyacente (parámetros, arquitectura, datos de entrenamiento) es inexistente. Solo se documentan las métricas de carbono de un proceso de fine-tuning, sin detallar qué modelo se ajustó.
- Los datos de emisiones dependen del factor de emisión de la red eléctrica de la región y del PUE del centro de datos. No son generalizables a otros contextos.
- La licencia MIT permite el uso comercial, pero el contenido es meramente informativo y no incluye código ni pesos.
- No se han incluido datos de sesgos, alucinaciones u otros riesgos típicos de modelos de lenguaje, por no tratarse de un modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tarungangwar/tds-carbon-card
- Repositorio similar (Pranav1003): https://huggingface.co/Pranav1003/tds-carbon-card
- Repositorio similar (WiseDev): https://huggingface.co/WiseDev/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/Tarungangwar08?tab=repositories
- Artículo académico sobre cuantificación de emisiones en entrenamiento: https://arxiv.org/abs/2605.01549
- Blog de Green Web Foundation sobre modelos de IA y carbono: https://www.thegreenwebfoundation.org/news/ai-model-cards-in-carbon-txt/
