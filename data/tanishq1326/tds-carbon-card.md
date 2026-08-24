# Tanishq1326/tds-carbon-card

## Resumen

El repositorio `Tanishq1326/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono asociada a un entrenamiento de un modelo no especificado. Fue creado por el usuario Tanishq1326 el 23 de agosto de 2026 y documenta las emisiones de CO₂ equivalente generadas durante una sesión de pre-entrenamiento realizada en la región `europe-west4` de Google Cloud, utilizando cuatro GPU NVIDIA A100. El objetivo de este tipo de repositorios es proporcionar transparencia sobre el impacto ambiental del entrenamiento de modelos, siguiendo la iniciativa "Green AI" y el estándar de model cards de la OECD.

No se dispone de información sobre la arquitectura, el tamaño, el contexto o las capacidades del modelo que se entrenó, ya que el repositorio se limita a registrar métricas energéticas y de emisiones. Por tanto, esta ficha describe el contenido real del repositorio y aclara que no se trata de un modelo de IA utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

Datos adicionales documentados en el repositorio:

| Metrica | Valor |
|---|---|
| Hardware de entrenamiento | 4x NVIDIA A100 |
| Modo de entrenamiento | pre-training |
| Region | europe-west4 |
| Horas de GPU | 379,4 h (PUE: 1,17) |
| Energia total consumida | 710,2368 kWh |
| Emisiones de CO₂ equivalente | 142,047 kg CO₂eq |
| Herramienta de medicion | CodeCarbon |
| Fecha de creacion | 2026-08-23 |
| Fecha de actualizacion | 2026-08-23 |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo en este repositorio. El contenido se limita a un informe de emisiones generado con CodeCarbon, que registra el consumo energetico y las emisiones de CO₂ durante una sesion de pre-entrenamiento. No se incluyen detalles sobre el dataset, el numero de tokens, el tipo de modelo (transformer, MoE, etc.) ni sobre tecnicas de optimizacion como RLHF o DPO. La unica informacion tecnica disponible es el hardware utilizado (4 GPU NVIDIA A100) y la localizacion geografica del centro de datos.

## Capacidades

- No se trata de un modelo de IA, por lo que no tiene capacidades de generacion de texto, razonamiento, codigo, vision ni ninguna otra funcion de inferencia.
- El repositorio sirve como documento de transparencia ambiental para un entrenamiento concreto, permitiendo auditar el coste energetico y las emisiones asociadas.
- Puede utilizarse como ejemplo de model card orientada a la contabilidad de carbono, siguiendo las recomendaciones de la OECD y la iniciativa Green AI.

## Casos de uso

- Auditoria ambiental de entrenamientos de IA: este repositorio puede consultarse para verificar las emisiones declaradas de un entrenamiento especifico, aunque no se identifica el modelo asociado.
- Referencia metodologica para medir emisiones con CodeCarbon: el formato y los campos (hardware, region, PUE, kWh, kg CO₂eq) sirven como plantilla para otros proyectos que quieran documentar su huella de carbono.
- Educacion sobre sostenibilidad en IA: puede utilizarse en cursos o talleres para ilustrar como se reportan las emisiones de un entrenamiento y que datos son necesarios.
- Comparacion de eficiencia energetica entre centros de datos: los valores de PUE y emisiones por kWh pueden compararse con otros repositorios similares (por ejemplo, los de otros usuarios) para evaluar la eficiencia de distintas regiones.
- Cumplimiento normativo o de politicas internas: organizaciones que exigen reportes de impacto ambiental pueden usar este tipo de ficha como evidencia.
- Investigacion sobre el coste real del pre-entrenamiento: los datos de horas de GPU y energia pueden alimentar estudios sobre el coste energetico de modelos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no contiene evaluaciones de rendimiento de ningun modelo, ya que su unico proposito es documentar emisiones.

## Requisitos de hardware

- No se requiere hardware para "inferencia" porque no hay modelo desplegable.
- El entrenamiento documentado utilizo 4 GPU NVIDIA A100, con un consumo total de 710,2368 kWh y 379,4 horas de GPU.
- No se especifican requisitos de VRAM, latencia ni throughput, al no existir un modelo servible.
- Para reproducir el entrenamiento (si se conociera el modelo) se necesitarian al menos 4 GPU A100, aunque no se detalla la configuracion exacta.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, por lo que no puede compararse con alternativas como Llama, Mistral o Qwen. Existen otros repositorios con el mismo nombre (`Tanishq628/tds-carbon-card`, `AdityaV26/tds-carbon-card`) que tambien documentan emisiones de entrenamientos, pero no contienen modelos. No se dispone de informacion sobre modelos comparables.

## Limitaciones y advertencias

- No es un modelo de IA: no puede utilizarse para ninguna tarea de generacion, clasificacion o razonamiento.
- No se identifica el modelo entrenado: la ficha carece de informacion sobre arquitectura, parametros o dataset, lo que impide cualquier evaluacion tecnica.
- Los datos de emisiones son especificos de un entrenamiento concreto y no son generalizables a otros modelos o configuraciones.
- La licencia no esta especificada, por lo que se desconoce si el contenido puede reutilizarse libremente.
- No se incluyen evaluaciones de sesgos, alucinaciones ni riesgos de seguridad, al no existir un modelo subyacente.
- Para uso en produccion, este repositorio no aporta ninguna utilidad practica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tanishq1326/tds-carbon-card
- Repositorio similar de Tanishq628: https://huggingface.co/Tanishq628/tds-carbon-card
- Repositorio similar de AdityaV26: https://huggingface.co/AdityaV26/tds-carbon-card
- Guia de model cards de la OECD: https://oecd.ai/en/catalogue/tools/model-cards
- Explorador de model cards: https://model-card.vercel.app/trends
