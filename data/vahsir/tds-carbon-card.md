# Vahsir/tds-carbon-card

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial funcional, sino un modelo card de contabilidad de carbono (Green AI Carbon Accounting) asociado a la tarea TDS GA8. Fue creado por el usuario Vahsir en Hugging Face y documenta el impacto ambiental de un entrenamiento de modelo no especificado, realizado con 7 GPUs NVIDIA RTX 4090 en la región europe-west4. El objetivo es registrar la energía consumida y las emisiones de CO₂ equivalentes generadas durante el pre-entrenamiento, siguiendo las directrices de transparencia ambiental promovidas por iniciativas como CodeCarbon y las buenas prácticas de model cards.

La relevancia de este tipo de documentación radica en la creciente demanda de informes de sostenibilidad en el desarrollo de IA. Aunque no aporta capacidades de inferencia ni procesamiento, sirve como referencia para auditorías de huella de carbono y para estudios comparativos entre distintos entrenamientos. La ficha técnica que sigue refleja la naturaleza atípica de este repositorio: la mayoría de los campos técnicos de un modelo convencional no están disponibles, mientras que los datos de consumo energético y emisiones sí lo están.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Hardware de entrenamiento | 7 x NVIDIA RTX 4090 |
| Region de entrenamiento | europe-west4 |
| Horas de GPU | 214,5 h (PUE: 1,45) |
| Energia total consumida | 979,7287 kWh |
| Emisiones de CO₂ equivalente | 195,946 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |
| Modo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente, ya que el repositorio solo documenta el proceso de entrenamiento desde una perspectiva ambiental. Los datos indican que se utilizaron 7 GPUs NVIDIA RTX 4090 durante 214,5 horas, con un factor de eficiencia energetica (PUE) de 1,45 en el centro de datos europe-west4. La energia total consumida fue de 979,7287 kWh, lo que se tradujo en 195,946 kg de CO₂ equivalente, calculados mediante la libreria CodeCarbon.

Al tratarse de un modelo card de contabilidad, no se incluyen detalles sobre el conjunto de datos, el numero de tokens, ni tecnicas de optimizacion como RLHF o DPO. La unica innovacion destacable es la propia practica de reportar emisiones de forma estandarizada, siguiendo las recomendaciones de Hugging Face para integrar la sostenibilidad en la documentacion de modelos.

## Capacidades

- No posee capacidades de generacion de texto, razonamiento, codigo, vision ni ninguna otra funcionalidad propia de un modelo de IA.
- Su unica funcion es servir como registro documental de la huella de carbono de un entrenamiento concreto.
- Permite a terceros consultar y comparar el impacto ambiental de este entrenamiento con otros similares.
- Facilita la trazabilidad de las emisiones asociadas a un desarrollo de IA, contribuyendo a practicas de IA responsable.

## Casos de uso

- Auditoria de sostenibilidad en proyectos de IA: el modelo card puede utilizarse como evidencia en informes internos o externos sobre el impacto ambiental de un entrenamiento, facilitando el cumplimiento de politicas ESG.
- Comparativa de eficiencia energetica entre entrenamientos: investigadores pueden consultar este registro junto con otros tds-carbon-card (por ejemplo, los de Akash7677 o Amrinder05) para evaluar que configuraciones de hardware y regiones producen menos emisiones.
- Documentacion para publicaciones academicas: al citar este modelo card en un articulo, se puede respaldar la seccion de impacto ambiental con datos cuantitativos verificables.
- Planificacion de infraestructura: los datos de energia y emisiones ayudan a estimar los costes ambientales de futuros entrenamientos con caracteristicas similares (mismo tipo de GPU, duracion, region).
- Cumplimiento normativo: en jurisdicciones donde se exige reportar la huella de carbono de actividades de computacion, este registro sirve como justificante.
- Educacion y concienciacion: puede emplearse como ejemplo en cursos sobre IA sostenible para ilustrar como se mide y reporta el consumo energetico en la practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento de modelo alguno, ya que su proposito es exclusivamente la contabilidad de carbono.

## Requisitos de hardware

- No se requieren recursos de hardware para utilizar este modelo card, pues no es un modelo ejecutable.
- El entrenamiento documentado empleo 7 GPUs NVIDIA RTX 4090, cada una con 24 GB de VRAM, lo que supone un total de 168 GB de memoria de video distribuida.
- No aplica la inferencia ni el despliegue en entornos de produccion, por lo que no hay recomendaciones de GPU para uso posterior.
- Las herramientas de despliegue habituales (vLLM, llama.cpp, Ollama, TGI) no son relevantes para este repositorio.

## Comparativa con modelos similares

Existen otros repositorios con el mismo nombre `tds-carbon-card` creados por diferentes autores para la misma tarea TDS GA8. La siguiente tabla compara los datos ambientales publicados en cada uno, segun la informacion disponible en Hugging Face:

| Autor | Hardware | Region | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|
| Vahsir (este) | 7 x RTX 4090 | europe-west4 | 214,5 | 979,73 | 195,95 |
| Amrinder05 | 4 x RTX 4090 | asia-south1 | 95,4 | 224,95 | 146,22 |
| Akash7677 | no disponible | no disponible | no disponible | no disponible | no disponible |

Se observa una variacion significativa en el consumo energetico y las emisiones, atribuible al numero de GPUs, la duracion y la region geografica (diferentes factores de emision de la red electrica). No se dispone de datos sobre arquitectura o rendimiento, por lo que la comparativa se limita al ambito ambiental.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA funcional; no puede ser utilizado para inferencia, generacion de texto ni ninguna tarea de procesamiento del lenguaje natural.
- La informacion sobre el modelo subyacente (arquitectura, parametros, dataset) es inexistente, lo que impide evaluar su calidad o capacidades.
- Los datos de emisiones dependen de factores externos como la mezcla energetica de la region y el PUE del centro de datos; no son extrapolables a otros contextos sin ajustes.
- No se especifica la licencia de uso, por lo que se debe contactar con el autor antes de reutilizar cualquier contenido del repositorio.
- La ausencia de benchmarks y de especificaciones tecnicas convencionales hace que este modelo card no sea adecuado para comparaciones de rendimiento con otros modelos de IA.
- Para produccion o investigacion seria, se recomienda buscar modelos reales con documentacion completa y licencias claras.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vahsir/tds-carbon-card
- Repositorio similar de Akash7677: https://huggingface.co/Akash7677/tds-carbon-card
- Repositorio similar de Amrinder05: https://huggingface.co/Amrinder05/tds-carbon-card
- Articulo de referencia sobre model cards (arXiv): https://arxiv.org/abs/1810.03993
- Guia de la OCDE sobre reporte de emisiones en model cards: https://oecd.ai/en/catalogue/tools/model-cards/tool-use-cases/reporting-carbon-emissions-on-open-source-model-cards
