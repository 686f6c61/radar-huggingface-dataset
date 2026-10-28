# stealth-model/missingno

## Resumen

MISSINGNO. es el nombre en clave de un modelo de lenguaje que se publicó como vista previa anónima («stealth») y que Reflection AI reveló el 16 de octubre de 2026 como Beam 1.0. El repositorio `stealth-model/missingno` de HuggingFace no contiene los pesos del modelo, sino una ficha de evaluación independiente elaborada por Stealth Models, con sus mediciones, la cronología de la revelación y los enlaces a los pesos oficiales, que se distribuyen en `reflection/Beam-1.0-501B-A23B`.

El modelo es un Mixture of Experts de 501.000 millones de parámetros totales con 23.000 millones activos por token, una ventana de contexto de 262.144 tokens, entrada exclusivamente de texto y soporte de tool calling, incluidas llamadas paralelas. La ficha destaca su orientación a código y razonamiento, y una velocidad de около 846 tokens por segundo en las pruebas de Stealth Models, una cifra coherente con la relación de activación 23B/501B.

Su relevancia es doble: por un lado, documenta un caso de identificación de un modelo anónimo mediante huellas de tokenizador y recuentos de tokens; por otro, ofrece un punto de entrada a los pesos abiertos de Beam 1.0 bajo licencia Apache 2.0, con cuantizaciones GGUF publicadas por Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explícita; la relación 501B totales / 23B activos implica una arquitectura Mixture of Experts (MoE) |
| Parametros totales | 501.000 millones (501B) |
| Parametros activos | 23.000 millones (23B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible en la informacion; existen cuantizaciones GGUF publicadas por Unsloth sin detallar los tipos |
| Idiomas soportados | no disponible |
| Licencia | pesos del modelo Beam 1.0: Apache 2.0; la ficha y sus imágenes: CC BY 4.0 (el tag `license:cc-by-4.0` del repositorio se refiere a la ficha, no a los pesos) |
| Formato de pesos | no disponible para los pesos oficiales; GGUF disponible en el repositorio de Unsloth |
| Entrada | texto (sin entrada de imagen declarada) |
| Tool calling | sí, incluidas llamadas paralelas |
| Desarrollador | Reflection AI (revelado); ficha publicada por Stealth Models |
| Primera observación / revelación | 10 de octubre de 2026 / 16 de octubre de 2026 |
| Velocidad medida por Stealth Models | aproximadamente 846 tokens por segundo (entorno de prueba no especificado) |

## Arquitectura y entrenamiento

La información disponible confirma una arquitectura de mezcla de expertos con 501.000 millones de parámetros totales y 23.000 millones activos, junto con una ventana de contexto de 262.144 tokens. No se detallan en la ficha el número de capas, la configuración de expertos, el mecanismo de atención ni si se emplean técnicas adicionales como decodificación especulativa o atención lineal; todos estos datos figuran como no disponibles.

Tampoco se publican el volumen de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF, DPO u otro tipo de ajuste por preferencias. El único indicio técnico indirecto es la coincidencia del tokenizador: Stealth Models comprobó el 11 de octubre de 2026 que los recuentos de tokens de MISSINGNO. coincidían en 24 de 24 frases con la familia de tokenizadores que Beam emplea, lo que permitió atribuir la vista previa al modelo de Reflection antes de que la compañía lo confirmara.

## Capacidades

- Generación de texto en modo conversacional y de continuación, con etiquetas declaradas de código y razonamiento.
- Generación y edición de código, ámbito en el que la ficha enmarca la vista previa («coding preview»).
- Tool calling o function calling, incluido el soporte de llamadas paralelas en un mismo turno.
- Flujos de agente de varios pasos, apoyados en la ventana de 262.144 tokens para mantener el estado de la tarea.
- Manejo de contextos largos: la ventana de 262.144 tokens permite incluir repositorios, documentación o historiales extensos sin truncar.
- Rendimiento alto por token generado: 23B activos sobre 501B totales favorece el throughput en inferencia con lote grande.
- Capacidades multilingües: no disponibles; la ficha no declara cobertura de idiomas.
- Visión, audio u otras modalidades: no disponibles; la entrada declarada es únicamente texto. La dimensión «Visual Intelligence» que aparece en StealthMark es una categoría del benchmark, no una modalidad de entrada del modelo.

## Casos de uso

- Agentes de código autónomos: el soporte de tool calling con llamadas paralelas permite que el modelo invoque compiladores, linters, ejecutores de tests y APIs de control de versiones en un mismo turno, reduciendo el número de iteraciones necesarias para cerrar una tarea.
- Refactorización de repositorios completos: con 262.144 tokens de contexto se puede cargar un conjunto amplio de ficheros y sus dependencias, de modo que el modelo razone sobre cambios transversales en lugar de sobre fragmentos aislados.
- Integración en pipelines de CI/CD: el modelo puede generar parches, revisar diffs y proponer pruebas adicionales como paso automatizado previo a la revisión humana, gracias a la combinación de tool calling y contexto largo.
- Asistencia al desarrollo en IDE: dado su throughput (846 tokens por segundo en las pruebas de referencia), encaja en escenarios de autocompletado y generación de bloques de código donde la latencia percibida es crítica, siempre que se despliegue con suficiente capacidad de cómputo.
- Análisis de documentación técnica extensa: manuales, especificaciones y contratos de API de cientos de miles de tokens pueden procesarse en una sola pasada para extraer requisitos, detectar contradicciones o generar resúmenes estructurados.
- Generación de pruebas y cobertura: a partir del código y de su documentación en contexto, el modelo puede producir casos de prueba y datos de ejemplo, invocando el runner mediante tool calling para validar las propuestas.
- Procesamiento por lotes de alta velocidad: en tareas de clasificación, extracción o reescritura sobre grandes volúmenes de texto, la relación 23B activos/501B totales permite un throughput alto con lote grande en servidores multi-GPU.
- Asistentes de investigación interna: con un despliegue self-hosted sobre pesos Apache 2.0, se puede integrar el modelo en herramientas internas sin depender de una API externa.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible proceden de StealthMark 1.8.8, un benchmark propio de Stealth Models, leído el 28 de octubre de 2026. Corresponden al modelo ya publicado, Beam 1.0 501B A23B, no a la vista previa MISSINGNO.

| Modelo | Puntuación global | General Intelligence | Visual Intelligence |
|---|---|---|---|
| Beam 1.0 501B A23B (publicado) | 31,9 | 30,9 | 33,8 |

| Subprueba destacada | Puntuación |
|---|---|
| Foresight (anticipación de amenazas y planificación) | 49,4 sobre 100 |
| Beach | 52,4 sobre 100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GPQA u otros) en la información disponible, por lo que no es posible comparar el modelo con alternativas mediante métricas convencionales. Las cifras de StealthMark son de un benchmark propietario y no son directamente trasladables a otras escalas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 501.000 millones de parámetros: aproximadamente 1 TB en BF16/FP16, unos 500 GB en FP8 y del orden de 250-280 GB en cuantización de 4 bits. Son estimaciones de cálculo, no cifras publicadas por el autor.
- Despliegue en servidor multi-GPU obligatorio: la ficha indica explícitamente que el modelo «necesita un servidor multi-GPU grande».
- Configuraciones razonables para FP8: 8 GPU de 80 GB (H100, A100 80GB) suman 640 GB. Para BF16 hacen falta 16 GPU de 80 GB o 8 GPU H200 de 141 GB (1,1 TB).
- GPU de consumo: no cabe en una sola tarjeta consumer (RTX 4090 con 24 GB, ni siquiera en 4 bits). Solo sería viable con cuantizaciones GGUF y offload masivo a memoria del sistema, con una penalización severa de latencia.
- Opciones de despliegue: vLLM o SGLang para pesos completos en FP8/BF16 sobre multi-GPU; llama.cpp u Ollama para las cuantizaciones GGUF de Unsloth, con requisitos de RAM del orden de cientos de GB; TGI como alternativa en infraestructura compatible.
- Throughput de referencia: aproximadamente 846 tokens por segundo según las pruebas de Stealth Models, sin que se especifiquen el hardware, el tamaño de lote ni la precisión empleada. La latencia por token no se publica.

## Comparativa con modelos similares

No hay datos de rendimiento comparables, porque las únicas métricas disponibles son de StealthMark, un benchmark propietario sin equivalencia pública. La comparación se limita, por tanto, a características estructurales.

| Modelo | Parámetros totales / activos | Contexto | Licencia de pesos | Disponibilidad |
|---|---|---|---|---|
| Beam 1.0 (MISSINGNO.) | 501B / 23B | 262.144 tokens | Apache 2.0 | Pesos abiertos y GGUF vía Unsloth |
| DeepSeek-V3 | 671B / 37B | 128.000 tokens | Licencia propia de DeepSeek | Pesos abiertos |
| Qwen3-235B-A22B | 235B / 22B | 128.000 tokens (ampliable) | Apache 2.0 | Pesos abiertos |
| Llama 4 Maverick | 400B / 17B | 1.000.000 tokens | Licencia comunitaria de Llama 4 | Pesos abiertos |

Rendimiento comparado: no disponible. Los datos de los modelos alternativos proceden de sus fichas públicas y se incluyen solo como referencia de escala; no se dispone de evaluaciones cruzadas con Beam 1.0 en la información proporcionada.

## Limitaciones y advertencias

- El repositorio `stealth-model/missingno` no contiene los pesos del modelo: es una ficha de evaluación de terceros. Para uso real hay que acudir a `reflection/Beam-1.0-501B-A23B`.
- La licencia es un punto de confusión habitual: el tag `cc-by-4.0` del repositorio cubre la ficha y sus imágenes, mientras que los pesos de Beam se publican bajo Apache 2.0. Cualquier uso comercial debe verificar la licencia en el repositorio de los pesos.
- No hay información publicada sobre sesgos, composición del corpus de entrenamiento ni procesos de alineación, por lo que no se pueden evaluar riesgos de sesgo de forma documentada.
- Riesgo de alucinación: no cuantificado en la información disponible; como en cualquier modelo generativo, debe validarse la salida en contextos de alta exigencia factual.
- Cobertura de idiomas no declarada: se desconoce el rendimiento en castellano y en otras lenguas distintas del inglés.
- El contexto de 262.144 tokens es una capacidad declarada; no se han publicado evaluaciones de recuperación en el rango largo (needle-in-a-haystack u otras), por lo que la calidad efectiva en contextos muy extensos no está verificada.
- Las puntuaciones de StealthMark (31,9 global) proceden de un benchmark propietario y no permiten extrapolar comportamiento en MMLU, HumanEval, GSM8K ni en evaluaciones estándar del sector.
- La velocidad de 846 tokens por segundo no especifica hardware, lote ni precisión; no debe tomarse como una cifra reproducible sin validación propia.
- El endpoint de vista previa de MISSINGNO. ya está cerrado; solo queda disponible el modelo publicado.
- La búsqueda web realizada no devolvió resultados pertinentes sobre este modelo: los enlaces obtenidos corresponden a servicios y entidades sin relación (herramientas de reescritura, comunidades de startups, una película y tecnología militar). La información de esta ficha procede únicamente de la model card y de los enlaces que esta contiene.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/stealth-model/missingno
- Pesos oficiales de Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Licencia de los pesos (Apache 2.0): https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Cuantizaciones GGUF (Unsloth): https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF
- Guía del modelo en Stealth Models: https://stealthmodels.com/missingno/
- Resultados completos de Beam en StealthMark: https://stealthmodels.com/benchmarks/models/beam-1.0-501b-a23b
- Mapa de benchmarks: https://stealthmodels.com/benchmarks/map
- Metodología StealthMark: https://stealthmodels.com/stealthmark
- Benchmarks interactivos: https://stealthmodels.com/play
- Guía de Cat Jam: https://stealthmodels.com/cat-jam/
- Anuncio de Beam por Reflection AI: https://reflection.ai/blog/beam-is-available
- Perfil del autor en HuggingFace: https://huggingface.co/stealth-model
