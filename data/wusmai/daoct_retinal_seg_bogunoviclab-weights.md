# wusmai/daoct_retinal_seg_bogunoviclab-weights

## Resumen

`wusmai/daoct_retinal_seg_bogunoviclab-weights` es un repositorio de pesos entrenados para el bundle de MONAI Model Zoo `daoct_retinal_seg_bogunoviclab`, orientado a la segmentación de capas retinianas en imágenes de tomografía de coherencia óptica (OCT). No se trata de un modelo de lenguaje, sino de un conjunto de checkpoints de un ensemble de tres estudiantes entrenados en el contexto del DA-OCT Challenge. El autor del repositorio es el usuario `wusmai`, mientras que la titularidad de los pesos corresponde a Washington University in St. Louis.

El repositorio contiene exclusivamente los ficheros grandes declarados en el `large_files.yml` del bundle: `model.pt`, `model_b`, y `model_c.pt`, de 474 MB cada uno, lo que suma aproximadamente 1,4 GB. Se trata de una réplica fiel (etapa 5) de la receta de entrenamiento del equipo original, con una cadena de procedencia verificada mediante sha256 que va desde la replicación en laboratorio hasta la evaluación Y4 y el bundle final.

Su relevancia es acotada pero concreta: permite reproducir la inferencia del bundle sin depender del alojamiento externo original, y sirve como referencia para investigadores que trabajen en segmentación de capas retinianas sobre el dataset del DA-OCT Challenge. La documentación completa, el mapa de etiquetas de 10 clases y las instrucciones de uso residen en el bundle de MONAI, no en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ensemble de 3 estudiantes; arquitectura concreta definida en el bundle MONAI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | BSD 2-Clause |
| Formato de pesos | PyTorch (`.pt`), pesos de bundle MONAI |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un ensemble de tres estudiantes (`model.pt`, `model_b.pt`, `model_c.pt`) entrenados mediante una receta de destilación o ensemble en la que participan varios modelos. El bundle al que pertenecen se enmarca en el DA-OCT Challenge y sigue el formato de MONAI Bundle, lo que implica que la definición de red, el preprocesado y el postprocesado están descritos en los ficheros de configuración del bundle, no en este repositorio de pesos.

El entrenamiento corresponde a una réplica fiel de la etapa 5 de la receta del equipo original, verificada mediante hashes sha256 a lo largo de toda la cadena de procedencia (replicación en laboratorio, release, evaluación Y4 y bundle). No se especifican en la información proporcionada el número de tokens o volúmenes de imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de aumento de datos o funciones de pérdida concretas. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación de capas retinianas en imágenes OCT, con un mapa de etiquetas de 10 clases definido en el bundle MONAI.
- Inferencia mediante ensemble de tres checkpoints, lo que permite promediar o combinar predicciones de los tres estudiantes.
- Integración con el ecosistema MONAI Bundle para preprocesado, inferencia y postprocesado estandarizados.
- Reproducibilidad verificada: los pesos están vinculados a una cadena de procedencia con hashes sha256.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Investigación en segmentación retiniana: el modelo se puede cargar desde el bundle MONAI para reproducir los resultados del DA-OCT Challenge y comparar con otras aproximaciones sobre el mismo dataset.
- Validación de pipelines clínicos de investigación: sirve para probar cadenas de preprocesado e inferencia sobre imágenes OCT antes de integrar un modelo propio en un entorno controlado.
- Replicación de experimentos: al ser una réplica verificada de la receta original, permite auditar la reproducibilidad de los resultados publicados por el equipo.
- Desarrollo de herramientas de anotación asistida: las predicciones del ensemble pueden usarse como propuesta inicial para que especialistas revisen y corrijan la segmentación de capas.
- Benchmarking interno: se puede emplear como línea base de segmentación de capas retinianas frente a modelos propios, siempre dentro de un contexto de investigación.
- Formación y docencia: útil para ilustrar el flujo completo de un bundle MONAI con pesos externos y ensemble de estudiantes en un caso real de imagen médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; cada checkpoint ocupa 474 MB, por lo que cargar los tres en memoria requiere al menos ~1,4 GB solo en pesos, más el espacio de activaciones y el lote de imágenes OCT.
- GPU recomendadas: no especificadas en la información proporcionada; por el tamaño de los checkpoints, es plausible que quepan en GPU de consumo, pero no se confirma.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño de los pesos, aunque no hay confirmación oficial.
- Opciones de despliegue: MONAI Bundle (flujo nativo), PyTorch directamente; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación de capas retinianas en OCT ni sus métricas.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: la model card indica explícitamente "Research use only", por lo que no debe emplearse en diagnóstico clínico ni en decisiones médicas.
- Licencia BSD 2-Clause: permite uso comercial y modificación con atribución, pero la restricción de uso investigativo indicada por el autor prevalece como advertencia.
- Sesgos: no documentados; al entrenarse sobre un dataset concreto (DA-OCT Challenge), el rendimiento puede degradarse en poblaciones, equipos de OCT o protocolos de adquisición distintos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de segmentaciones erróneas en capas finas o imágenes de baja calidad.
- Limitaciones de contexto o idioma: no aplican; es un modelo de visión médica sin capacidades lingüísticas.
- Dependencia del bundle: los pesos por sí solos no incluyen la configuración de red ni el preprocesado; es necesario usar el bundle MONAI `daoct_retinal_seg_bogunoviclab` para un uso correcto.
- Documentación incompleta en este repositorio: la información técnica detallada reside en el bundle, no en la model card de estos pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wusmai/daoct_retinal_seg_bogunoviclab-weights
- Bundle MONAI Model Zoo `daoct_retinal_seg_bogunoviclab`: no disponible en la información proporcionada
- Paper del DA-OCT Challenge: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada
