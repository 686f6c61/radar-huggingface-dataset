# stealth-model/owl-alpha

## Resumen

Owl Alpha es el nombre con el que se presentó, el 28 de abril de 2026, un modelo de lenguaje de acceso gratuito y desarrollador desconocido, con una ventana de contexto de 1.048.576 tokens y soporte nativo de tool calling. El 29 de junio de 2026 Meituan confirmó que el modelo detrás de Owl Alpha era LongCat-2.0, cuyo lanzamiento completo se produjo el 30 de junio y cuyos pesos se publicaron bajo licencia MIT el 12 de julio de 2026.

Este repositorio de Hugging Face no contiene los pesos del modelo, sino una ficha de benchmarks independiente elaborada por Stealth Models, la entidad que operó el acceso stealth. La model card documenta las condiciones de la prueba (entrada solo de texto, tool calling nativo, unos 86 tokens por segundo en sus mediciones) y los resultados en su propio benchmark StealthMark 1.8.8.

La relevancia práctica es doble: por un lado, permite reconstruir la trazabilidad de un modelo anónimo hasta su autor y sus pesos oficiales; por otro, advierte de que el modelo completo ronda los 48.000 millones de parámetros activos por token y requiere hardware de escala de rack, por lo que no es desplegable en local. Para uso real hay que acudir al repositorio oficial `meituan-longcat/LongCat-2.0`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la información proporcionada no detalla el tipo de arquitectura; el modelo corresponde a LongCat-2.0 de Meituan) |
| Parámetros totales | No disponible |
| Parámetros activos | Aproximadamente 48.000 millones por token (dato de la model card) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Pesos oficiales: MIT. Esta ficha y sus imágenes: CC BY 4.0 |
| Formato de pesos | No disponible en esta ficha; los pesos se distribuyen en el repositorio `meituan-longcat/LongCat-2.0` |
| Entrada | Texto |
| Tool calling | Sí, nativo |
| Velocidad declarada | Aproximadamente 86 tokens por segundo en las pruebas de Stealth Models |
| Desarrollador | Meituan |
| Identificador en Hugging Face | stealth-model/owl-alpha |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna (transformer denso, mezcla de expertos, híbrida u otra), ni el número total de parámetros, ni la composición del corpus de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. El único dato estructural es el coste de inferencia declarado: alrededor de 48.000 millones de parámetros activos por token, una cifra coherente con esquemas de activación dispersa, aunque la model card no confirma explícitamente ese extremo.

Lo que sí está documentado es el perfil funcional: entrada exclusivamente de texto, tool calling nativo y una ventana de contexto de 1.048.576 tokens, orientada a cargas de trabajo de código y contexto largo (las etiquetas del repositorio incluyen `coding`, `tool-use` y `long-context`). El modelo se describe como no local: el despliegue del modelo completo exige hardware de escala de rack. La ficha incluye además la referencia `stealthmark`, el benchmark propietario con el que Stealth Models evaluó la versión completa de junio de 2026.

## Capacidades

- Generación de texto en modo conversacional y de completado, con pipeline declarado `text-generation`.
- Tool calling o function calling nativo, sin necesidad de envoltorios de prompting para la invocación de herramientas.
- Razonamiento en varios pasos sobre ventanas de contexto muy extensas, gracias al millón de tokens disponibles.
- Trabajo con código: las etiquetas del repositorio incluyen `coding`, y el perfil declarado en el anuncio de Meituan para la versión Preview combinaba tool calling, contexto largo y programación.
- Procesamiento de documentos o repositorios completos en una sola pasada, sin fragmentación ni recuperación externa obligatoria.
- Idiomas: no disponible; la información proporcionada no incluye lista de lenguas soportadas.
- Capacidades visuales: la entrada declarada es solo texto. El benchmark StealthMark incluye una dimensión de "inteligencia visual" con puntuación de 34,4, pero la ficha no aclara si mide generación de imágenes, interpretación de tareas visuales o ambas cosas, por lo que no debe asumirse soporte de visión en la entrada del modelo.

## Casos de uso

- Análisis de repositorios completos: con 1.048.576 tokens de contexto, el modelo puede ingerir un monorepo de tamaño medio en una sola ventana para tareas de auditoría, detección de dependencias circulares o revisión de arquitectura, sin necesidad de trocear el código.
- Migraciones de código a gran escala: reescritura coordinada de APIs o frameworks a lo largo de cientos de ficheros, aprovechando que el modelo mantiene el contexto entre módulos y puede emitir cambios consistentes.
- Agentes de automatización con tool calling: pipelines en los que el modelo decide qué herramienta invocar (consulta a base de datos, ejecución de tests, llamada a API interna) y encadena varios pasos, apoyado en el soporte nativo de function calling.
- Asistentes de ingeniería integrados en CI/CD: revisión automática de pull requests, generación de parches y explicación de fallos de test, con el modelo actuando como paso adicional del pipeline.
- Procesamiento de documentación extensa: expedientes, contratos, normativa o documentación técnica de cientos de páginas analizados de una vez para extracción de cláusulas, resúmenes estructurados o comparación entre versiones.
- Investigación sobre modelos stealth: el repositorio sirve como caso de estudio documentado de identificación de un modelo anónimo, con cronología, candidatos descartados y metodología de evaluación publicada.
- Evaluación comparativa de modelos de contexto largo: útil para equipos que necesitan contrastar el comportamiento de modelos con ventanas de un millón de tokens frente a alternativas con recuperación externa (RAG), usando las mismas tareas.

## Benchmarks y rendimiento

Resultados publicados por Stealth Models con StealthMark 1.8.8, leídos el 28 de octubre de 2026 sobre la versión completa de junio de 2026 (LongCat-2.0):

| Métrica | Puntuación |
|---|---|
| StealthMark (puntuación global) | 25,5 |
| Inteligencia general | 17,2 |
| Inteligencia visual | 34,4 |
| Pelican (construcción de sujeto y relaciones espaciales) | 79,0 (tercer puesto) |
| Selfie (construcción visual e interpretación creativa) | 61,6 sobre 100 |

No se han publicado en la información disponible resultados de benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, MATH u otros), por lo que no es posible comparar el modelo con alternativas en esas escalas ni verificar los números de StealthMark de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible. La model card indica que el modelo completo requiere hardware de escala de rack, lo que descarta el cálculo por GPU única.
- GPU recomendadas: no disponibles. Por el perfil de despliegue declarado, no se trata de un modelo para A100 o H100 individuales, sino de un despliegue multi-nodo.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090 o similares), según la propia model card.
- Opciones de despliegue: no se documenta soporte específico de vLLM, TGI, llama.cpp u Ollama. El acceso stealth ya finalizó y la vía oficial es el repositorio `meituan-longcat/LongCat-2.0`.
- Rendimiento: aproximadamente 86 tokens por segundo en las pruebas de Stealth Models; no se especifican el hardware, el lote ni la cuantización empleados, por lo que la cifra no es directamente extrapolable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Owl Alpha (LongCat-2.0) | ~48B activos por token; total no disponible | 1.048.576 tokens | StealthMark 25,5 global | MIT (pesos oficiales) | Pesos en `meituan-longcat/LongCat-2.0` |
| LongCat-2.0 | No disponible | No disponible en esta ficha | No disponible | MIT | Publicado el 30 de junio de 2026; pesos el 12 de julio de 2026 |
| LongCat-2.0-Preview | No disponible | No disponible | No disponible | No disponible | Citado como candidato durante la especulación |
| GLM 5.2 | No disponible | No disponible | No disponible | No disponible | Barajado por la comunidad como posible identidad de Owl Alpha; descartado tras la revelación |

No se dispone de datos de arquitectura, parámetros o benchmarks de las alternativas citadas, por lo que la comparación cuantitativa no es posible con la información proporcionada. Los dos primeros modelos de la tabla son, de hecho, el mismo sistema: Owl Alpha era el alias anónimo de LongCat-2.0.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es una ficha de benchmarks. Cualquier intento de descargar y ejecutar el modelo debe dirigirse a `meituan-longcat/LongCat-2.0`.
- Los resultados de StealthMark los publica la misma entidad que operó el acceso al modelo; no se han verificado de forma independiente y el benchmark es propietario, no comparable con MMLU, HumanEval o GSM8K.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja su naturaleza de página de referencia y no de artefacto de despliegue.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe fuera de los idiomas cubiertos por el entrenamiento original, que no se detallan.
- Entrada solo de texto: no debe asumirse capacidad de visión, a pesar de que el benchmark puntúe una dimensión de "inteligencia visual".
- Requisito de hardware extremo: el modelo completo necesita infraestructura de rack, lo que implica coste elevado y descarta prototipado local.
- Licencias distintas según el artefacto: los pesos son MIT según el anuncio de Meituan, mientras que esta ficha y sus imágenes son CC BY 4.0 y exigen atribución a stealthmodels.com. Conviene verificar el fichero LICENSE del repositorio oficial antes de un uso comercial.
- Riesgo de alucinación, sesgos conocidos y comportamiento en producción no documentados en la información disponible.
- Trazabilidad incompleta: no se especifican datos de entrenamiento, número de tokens, técnica de alineación ni arquitectura, lo que limita cualquier evaluación técnica profunda.
- El alias "Owl Alpha" ya no da acceso a un servicio activo: el acceso stealth finalizó.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stealth-model/owl-alpha
- Pesos oficiales (LongCat-2.0): https://huggingface.co/meituan-longcat/LongCat-2.0
- Licencia de los pesos: https://huggingface.co/meituan-longcat/LongCat-2.0/blob/main/LICENSE
- Anuncio de la revelación por parte de Meituan: https://www.linkedin.com/posts/meituan_meituan-longcat-llm-activity-7477722701768499200-4qrk
- Notas de Meituan sobre la publicación open source: https://tech.meituan.com/2026/07/12/LongCat-2.0-Open-source.html
- Guía del modelo en Stealth Models: https://stealthmodels.com/owl-alpha/
- Resultados completos de benchmarks: https://stealthmodels.com/benchmarks/models/owl-alpha
- Resultado de la tarea Selfie: https://stealthmodels.com/benchmarks/models/owl-alpha/selfie
- Mapa de benchmarks: https://stealthmodels.com/benchmarks/map
- Metodología StealthMark: https://stealthmodels.com/stealthmark
- Demos interactivas de benchmarks: https://stealthmodels.com/play
- Organización en Hugging Face: https://huggingface.co/stealth-model

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de la información del repositorio.
