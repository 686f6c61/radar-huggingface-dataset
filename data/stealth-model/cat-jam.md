# stealth-model/cat-jam

## Resumen

Cat Jam es el identificador con el que se publicó en HuggingFace un modelo de generación de texto sin desarrollador declarado, aparecido el 13 de octubre de 2026 y orientado a codificación agéntica, razonamiento, uso de herramientas y contexto largo. El 16 de octubre de 2026, Reflection AI lo identificó en su blog como una vista previa de su modelo Beam, y los pesos definitivos se publicaron como `reflection/Beam-1.0-501B-A23B`.

Se trata de un modelo de 501 000 millones de parámetros totales con 23 000 millones activos, lo que implica una arquitectura de mezcla de expertos (MoE), y una ventana de contexto de 1 048 576 tokens. La entrada es únicamente texto y admite llamadas a herramientas. La model card de Cat Jam no declara arquitectura, idiomas ni datos de entrenamiento; la información técnica disponible proviene de la ficha del modelo revelado.

La relevancia de esta ficha es doble: documenta un caso de modelo stealth revelado en tres días y sirve de puente hacia el modelo realmente utilizable, Beam 1.0, cuyos pesos se publican bajo licencia Apache 2.0 y con cuantizaciones GGUF de Unsloth. Las cifras de benchmark que se recogen aquí corresponden al Beam 1.0 liberado, no a una evaluación independiente de Cat Jam.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No declarada; el reparto 501B totales / 23B activos implica transformer con mezcla de expertos (MoE) |
| Parámetros totales | 501B |
| Parámetros activos | 23B |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantización | GGUF publicado por Unsloth; niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Model card de Cat Jam: CC BY 4.0. Pesos del modelo revelado (Beam 1.0): Apache 2.0 |
| Formato de pesos | No disponible para Cat Jam; el modelo revelado dispone de pesos oficiales y de una versión GGUF |

Otros datos de la ficha: pipeline `text-generation`, entrada de solo texto, soporte de tool calls, creado el 28 de octubre de 2026 (fecha de la ficha en el Hub), 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna de Cat Jam, la composición del dataset de entrenamiento, el número de tokens procesados ni las etapas de alineación (RLHF, DPO u otras). El único dato estructural inferible es el reparto entre parámetros totales y activos, 501B y 23B respectivamente, patrón característico de un transformer con mezcla de expertos y enrutamiento disperso: el coste de memoria corresponde al modelo completo, mientras que el coste de cómputo por token se aproxima al de un modelo denso de 23B.

El método de revelación descrito por Stealth Models se basa en una comparación de conteo de tokens: los 24 recuentos de frases entre Cat Jam y Beam coinciden, y el mismo patrón aparece en MiMo-V2.6-Pro, MiMo-V2.6-Flash y MISSINGNO. No se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal; la única capacidad diferencial declarada es la ventana de 1M de tokens combinada con tool calling.

## Capacidades

- Generación de texto y razonamiento multi-paso, con etiqueta explícita `reasoning` en la ficha del Hub.
- Codificación: el modelo se presentó como vista previa para codificación agéntica rápida.
- Uso de herramientas y function calling, confirmado en la tabla de hechos de la model card.
- Contexto largo: 1 048 576 tokens de ventana, adecuado para repositorios completos o historiales extensos.
- Entrada multimodal: no. La ficha declara entrada de solo texto.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo de pensamiento explícito: no confirmado en la información disponible.

## Casos de uso

- Refactorización de repositorios completos: con 1M de tokens de contexto el modelo puede ingerir varios módulos y sus tests en una sola pasada y proponer cambios coherentes entre ficheros, algo inviable con ventanas de 32K o 128K.
- Agente de codificación en terminal: la combinación de tool calling y contexto largo permite encadenar lecturas de ficheros, ejecución de comandos y aplicación de parches dentro de un bucle agéntico sin perder el estado de la tarea.
- Revisión de pull requests de gran tamaño: el modelo puede cargar el diff completo más el contexto de los ficheros afectados y emitir comentarios por línea, reduciendo los falsos positivos que aparecen cuando el revisor solo ve el diff.
- Migraciones de dependencias o de framework: el contexto largo permite mantener simultáneamente el código antiguo, el nuevo y la documentación de la API de destino durante toda la migración.
- Asistente de análisis de trazas y logs: con entradas de solo texto y ventana de 1M tokens, admite volcados extensos de errores y trazas de ejecución para localizar la causa raíz.
- Automatización de tareas de CI/CD: integrado vía API con soporte de tool calls para consultar el estado de un pipeline, leer artefactos de fallo y abrir incidencias con el diagnóstico.
- Generación de documentación técnica a partir de código: la ventana amplia permite cubrir un paquete entero y mantener consistencia terminológica entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de Cat Jam en la información disponible. La model card incluye únicamente resultados de StealthMark 1.8.8 (lectura del 28 de octubre de 2026) para el modelo revelado, Beam 1.0 501B A23B:

| Modelo | StealthMark global | Inteligencia general | Inteligencia visual |
|---|---|---|---|
| Beam 1.0 501B A23B (liberado) | 31.9 | 30.9 | 33.8 |

| Subprueba de Beam 1.0 | Puntuación (sobre 100) |
|---|---|
| Foresight (anticipación de amenazas y planificación) | 49.4 |
| Beach | 52.4 |

Advertencia: estas cifras las publica Stealth Models como benchmark propio, no son una evaluación independiente y no están atribuidas específicamente a Cat Jam. No hay datos de MMLU, HumanEval, GSM8K ni de otras suites estándar en la información disponible.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 1 TB solo para pesos (501B × 2 bytes), sin contar caché KV. Estimación derivada del número de parámetros, no publicada por el autor.
- VRAM en FP8/INT8: aproximadamente 500 GB para pesos. Misma salvedad.
- VRAM en cuantización de 4 bits: del orden de 250-280 GB para pesos. Los niveles GGUF concretos publicados por Unsloth no están detallados en la información disponible.
- Caché KV a 1M de tokens: no cuantificado públicamente; es un factor limitante adicional en despliegues de contexto máximo.
- GPU recomendadas: para BF16, un nodo de 16×H100 80 GB o equivalente; para 4 bits, 8×H100 80 GB o 4×H200. Son estimaciones de capacidad, no configuraciones validadas por el autor.
- GPU de consumo: no cabe. El modelo completo debe residir en memoria aunque solo se activen 23B por token, por lo que una RTX 4090 de 24 GB no es suficiente ni con cuantización agresiva.
- Opciones de despliegue: vLLM o TGI para servicio en servidor; llama.cpp para la versión GGUF de Unsloth; Ollama resulta poco práctico por el tamaño. No se documentan recetas oficiales de despliegue.
- Latencia y throughput: no disponibles. El coste por token se aproxima al de un modelo denso de 23B, pero el ancho de banda de memoria requerido para recorrer los expertos lastra el rendimiento en hardware pequeño.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cat Jam / Beam 1.0 501B A23B | 501B | 23B | 1 048 576 | Apache 2.0 (pesos de Beam); CC BY 4.0 (card de Cat Jam) | Pesos en HuggingFace y GGUF en Unsloth |
| MiMo-V2.6-Pro | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card; sin datos técnicos |
| MiMo-V2.6-Flash | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card; sin datos técnicos |
| MISSINGNO | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card; sin datos técnicos |

No hay información suficiente para comparar rendimiento, contexto o licencia frente a alternativas de la misma categoría. La model card solo señala que MiMo-V2.6-Pro, MiMo-V2.6-Flash y MISSINGNO comparten el patrón de conteo de tokens detectado en Cat Jam, sin aportar especificaciones.

## Limitaciones y advertencias

- Cat Jam ya no está disponible como modelo: la vista previa terminó y los pesos publicados son los de Beam 1.0. Cualquier despliegue debe hacerse sobre `reflection/Beam-1.0-501B-A23B`, no sobre el identificador `stealth-model/cat-jam`.
- La licencia CC BY 4.0 de la ficha de Cat Jam cubre la model card y las imágenes, no los pesos. La licencia aplicable al modelo es la de Beam (Apache 2.0), que debe verificarse en el repositorio oficial antes de un uso comercial.
- No hay información sobre sesgos, composición del dataset ni filtrado de datos; no es posible evaluar riesgos de sesgo demográfico o lingüístico.
- Riesgo de alucinación no medido: no se han publicado evaluaciones de veracidad ni de tasa de alucinación.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en lenguas cooficiales sin evaluación previa.
- Coste de infraestructura muy alto: 501B de parámetros exigen servidores multi-GPU, lo que descarta el despliegue en hardware de consumo y encarece la inferencia frente a modelos densos de 20-30B.
- Los benchmarks disponibles proceden de StealthMark, un marco propio del autor de la ficha, con una única puntuación global de 31.9 sobre 100; no hay validación externa ni comparación con suites estándar.
- La identificación de Cat Jam como Beam se basa en coincidencia de conteos de tokens, no en una confirmación de pesos por parte del autor del modelo.
- La ficha del Hub acumula 0 descargas y 0 likes, por lo que no existe comunidad, issues ni soporte documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stealth-model/cat-jam
- Pesos del modelo revelado (Beam 1.0 501B A23B): https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Licencia de Beam: https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Cuantizaciones GGUF (Unsloth): https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF
- Guía del modelo en Stealth Models: https://stealthmodels.com/cat-jam/
- Página del modelo en Stealth Models: https://stealthmodels.com/cat-jam/
- Anuncio de disponibilidad de Beam (Reflection AI): https://reflection.ai/blog/beam-is-available
- Resultados completos de Beam en StealthMark: https://stealthmodels.com/benchmarks/models/beam-1.0-501b-a23b
- Mapa de benchmarks: https://stealthmodels.com/benchmarks/map
- Metodología StealthMark: https://stealthmodels.com/stealthmark
- Demos interactivas de benchmarks: https://stealthmodels.com/play
- Perfil del autor en HuggingFace: https://huggingface.co/stealth-model
