# Wabababb/MN-Violet-Lotus-12B-GGUF

## Resumen

MN-Violet-Lotus-12B es un modelo de lenguaje de 12.247.782.400 parámetros (12,25 mil millones) orientado a la escritura creativa, la ficción interactiva y el roleplay. Se trata de un merge de modelos (construido con mergekit) cuyo checkpoint base es FallenMerick/MN-Violet-Lotus-12B, publicado en HuggingFace por el usuario Wabababb en formato GGUF. El repositorio que nos ocupa contiene únicamente cuantizaciones estáticas del modelo original, generadas por mradermacher, no los pesos en precisión completa.

El modelo está etiquetado explícitamente para tareas de storywriting, text adventure, ficción, escritura creativa y roleplaying. Su licencia es CC-BY-4.0, lo que permite uso comercial con atribución. El único idioma declarado es el inglés.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, sin model card propia más allá de la plantilla de cuantización de mradermacher y sin benchmarks publicados. Es útil para quien busque un modelo de 12B especializado en narrativa que quepa en GPU de consumo, pero no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de un merge con mergekit; detalles de la arquitectura base no disponibles) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base FallenMerick/MN-Violet-Lotus-12B más allá de que es el resultado de un merge construido con mergekit, según las etiquetas del repositorio. No se detallan los modelos componentes del merge, la técnica de fusión empleada (SLERP, TIES, DARE, etc.), el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El repositorio Wabababb/MN-Violet-Lotus-12B-GGUF es una conversión a GGUF de cuantizaciones estáticas del checkpoint base, producidas por mradermacher. No incluye información sobre el proceso de entrenamiento original ni innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.). Cualquier dato adicional sobre el entrenamiento debe consultarse en el repositorio del modelo base, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto narrativo y creativo: ficción, relatos, descripciones y diálogo.
- Escritura interactiva tipo "text adventure": continuación de escenas y gestión de narrativa ramificada.
- Roleplay conversacional multi-turno, con etiquetas explícitas de roleplaying y rp en el repositorio.
- Coherencia de personajes y estilo en textos largos (capacidad esperable en un modelo de 12B, aunque no verificada con benchmarks).
- Conversación general en inglés (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere despliegue vía API compatible con OpenAI.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe no disponible: solo se declara inglés.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos, diálogos y descripciones a partir de un esquema, gracias a su especialización declarada en storywriting y su tamaño de 12B, que permite mantener estilo y coherencia en pasajes de extensión media.
- Aventuras de texto interactivas: integrado en un motor de juego, el modelo continúa la narración según las acciones del jugador, manteniendo el tono y los personajes a lo largo de la partida.
- Roleplay y compañeros conversacionales: adecuado para chatbots de personajes con personalidad definida mediante system prompt, aprovechando las etiquetas de roleplaying del repositorio.
- Generación de material de juego de rol de mesa: descripciones de escenarios, tramas secundarias, diálogos de PNJ y variantes de una misma escena para un máster que prepare una sesión.
- Prototipado de narrativa ramificada: generación de múltiples ramas argumentales a partir de un nodo común, útil en herramientas de escritura interactiva o videojuegos narrativos.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF con cuantizaciones desde Q2_K (4,9 GB) hasta Q8_0 (13,1 GB), puede ejecutarse en GPU de consumo para experimentación y prototipos sin depender de servicios en la nube.
- Filtrado y reescritura de estilo: reescritura de textos creativos en un registro o voz narrativa concretos, útil en pipelines editoriales pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de archivo como referencia mínima, más overhead de contexto y caché KV):
  - Q2_K: ~4,9 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~5,6 / 6,2 / 6,7 GB.
  - IQ4_XS: ~6,9 GB.
  - Q4_K_S / Q4_K_M: ~7,2 / 7,6 GB.
  - Q5_K_S / Q5_K_M: ~8,6 / 8,8 GB.
  - Q6_K: ~10,2 GB.
  - Q8_0: ~13,1 GB.
- GPU recomendadas: para Q4_K_M en adelante, una RTX 4090 (24 GB) o RTX 3090 permite cargar el modelo completo en VRAM con contexto amplio. Para Q8_0, una GPU de 16-24 GB es suficiente para los pesos, dejando margen para contexto. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, pero permiten mayor throughput con batching.
- GPU de consumo: sí cabe. Con cuantizaciones Q4 (7,2-7,6 GB) funciona en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), aunque con contexto limitado. En GPUs de 8 GB conviene usar Q3 o IQ4_XS y contextos cortos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para servir como API, llama.cpp server o un frontend compatible con endpoints (el repositorio está etiquetado como endpoints_compatible). vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente sobre el modelo base para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica a continuación lo que sí es comparable a nivel de ficha técnica:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MN-Violet-Lotus-12B (este) | 12,25 B | no disponible | CC-BY-4.0 | GGUF | Especializado en narrativa y roleplay; sin benchmarks |
| Alternativas de 12B para escritura creativa | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

No disponible: no se han identificado en la información proporcionada modelos comparables concretos con datos verificables.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que las afirmaciones de rendimiento deben tratarse como no verificadas.
- Modelo de nicho: orientado a ficción y roleplay; su rendimiento en tareas de razonamiento, código o matemáticas es desconocido y probablemente inferior al de modelos de propósito general del mismo tamaño.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas; el uso en español no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones o documentos largos sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos generativos; en ficción es tolerable, pero no debe usarse como fuente de hechos sin verificación.
- Sesgos: no documentados por el autor; al ser un merge sin model card detallada, no hay análisis de sesgos ni de datos de entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar la autoría; conviene revisar también la licencia del modelo base y de los componentes del merge, no disponibles en esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de uso en producción.
- El repositorio contiene solo cuantizaciones GGUF estáticas; para pesos en precisión completa hay que acudir al modelo base FallenMerick/MN-Violet-Lotus-12B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Wabababb/MN-Violet-Lotus-12B-GGUF
- Modelo base: https://huggingface.co/FallenMerick/MN-Violet-Lotus-12B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/MN-Violet-Lotus-12B-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización (mradermacher): https://huggingface.co/mradermacher/model_requests
