# vcruz305/Ornith-1.5-122B-EXL3-SAGE-2.58bpw

## Resumen

`vcruz305/Ornith-1.5-122B-EXL3-SAGE-2.58bpw` es una cuantización de comunidad del modelo `ornith-ai/Ornith-1.5-122B`, publicada por el usuario vcruz305 en formato EXL3 (ExLlamaV3) a 2,58 bits por peso y con la variante etiquetada como SAGE. No es un modelo entrenado desde cero: es un checkpoint comprimido cuyo objetivo es reducir el peso en VRAM de un modelo de 122 000 millones de parámetros hasta un rango que pueda ejecutarse en una o dos GPU de gama alta profesional, manteniendo el mayor número de bits posible por debajo de 3.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización agresiva (2,58 bpw) sobre una arquitectura MoE identificada con la etiqueta `qwen3_5_moe`, lo que permite estimar si un modelo de ese tamaño puede desplegarse en hardware de 48 GB. Por otro, advierte de un punto crítico: los metadatos de safetensors declaran 22 555 938 688 parámetros (~22,56 B), mientras que el nombre del repo indica 122 B y el tamaño del repo (45,2 GB) es coherente con ~122 B a 2,58 bpw. Esa discrepancia debe resolverse antes de cualquier uso en producción.

El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, acceso restringido (gated) y licencia MIT heredada del modelo base. Se trata, por tanto, de una publicación reciente (21-22 de octubre de 2026) sin validación comunitaria ni benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) según la etiqueta `qwen3_5_moe`; pesos cuantizados en EXL3. Detalle de capas y número de expertos: no disponible |
| Parámetros totales | 122 000 millones según el nombre del checkpoint; 22 555 938 688 (~22,56 B) según los metadatos de safetensors. Discrepancia sin resolver (ver nota) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 a 2,58 bits por peso (bpw), variante SAGE. No se documentan otros formatos en el repo |
| Idiomas soportados | no disponible |
| Licencia | MIT (etiqueta del repo, heredada del modelo base); acceso restringido (gated), requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors en formato EXL3; librería `exllamav3` |
| Tamaño del repositorio | 45,2 GB |
| Pipeline | text-generation (conversacional) |
| Descargas / likes | 0 / 0 |
| Fechas | creado el 21-10-2026; actualizado el 22-10-2026 |

Nota sobre el recuento de parámetros: a 2,58 bpw, 122 000 millones de parámetros ocuparían aproximadamente 39 GB de pesos, cifra compatible con los 45,2 GB del repo (pesos + capas no cuantizadas como embeddings y cabeza de salida + overhead). En cambio, 22,56 B a 2,58 bpw ocuparían unos 7,3 GB. La hipótesis más plausible es que el dato de safetensors sea incompleto (agregación parcial de shards) o que refleje parámetros activos de un MoE; ninguna de las dos cosas está confirmada en la información disponible.

## Arquitectura y entrenamiento

El modelo base es `ornith-ai/Ornith-1.5-122B`, del que no se dispone de información sobre dataset, número de tokens, composición de datos ni si hubo RLHF, DPO u otra fase de alineamiento. La etiqueta de arquitectura `qwen3_5_moe` indica que la familia base emplea un transformer con mezcla de expertos, presumiblemente con enrutamiento disperso por token, pero no se dispone del número de expertos, el tamaño de cada experto ni la proporción de parámetros activos.

La innovación técnica de este checkpoint no está en el entrenamiento sino en la compresión: EXL3 es el formato de cuantización de ExLlamaV3, orientado a precisiones muy bajas por peso (aquí 2,58 bpw), con capas de embedding y cabeza de salida habitualmente preservadas en mayor precisión. La etiqueta SAGE no está documentada en la información proporcionada; en el ecosistema ExLlamaV3 se asocia a variantes de atención cuantizada, pero este extremo no está confirmado para este repo. No se documenta decodificación especulativa, atención lineal ni otras optimizaciones propias.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Razonamiento y conocimiento general, presumiblemente heredados del modelo base de 122 B; sin evaluación publicada en este repo.
- Generación de código y matemáticas: capacidad esperable por el tamaño y la familia del modelo base, pero no verificada con benchmarks en la información disponible.
- Tool calling / function calling: no disponible (no documentado en la model card ni en las etiquetas).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local en GPUs profesionales mediante ExLlamaV3, lo que constituye la capacidad diferencial frente al modelo sin cuantizar.

## Casos de uso

- Despliegue local de un modelo de gran tamaño en una única GPU de 48 GB: con ~45 GB de pesos en disco, el checkpoint permite servir un modelo de la clase 122 B en una RTX 6000 Ada, A6000 o L40S, siempre que la longitud de contexto y el lote se mantengan moderados para no desbordar la VRAM con la caché KV.
- Asistente conversacional autoalojado para equipos con requisitos de soberanía del dato: al ejecutarse íntegramente en infraestructura propia con ExLlamaV3 y TabbyAPI, evita enviar prompts a APIs externas; MIT facilita la integración, sujeta a la licencia del modelo base.
- Generación de código en pipelines internos: un modelo de 122 B sin cuantizar es inviable en una sola GPU, mientras que esta versión a 2,58 bpw permite mantener un servicio de autocompletado y revisión de código en una máquina única; requiere validar la calidad tras la cuantización antes de usarlo en CI/CD.
- Prototipado e investigación sobre cuantización extrema: sirve como caso de estudio para medir la degradación de un MoE a 2,58 bpw frente al base en BF16/FP8, con la salvedad de que hay que verificar primero el recuento real de parámetros.
- Procesamiento por lotes de documentos largos en local: si el contexto del base es amplio, el modelo puede resumir y extraer información de expedientes sin salida a Internet; conviene fijar límites de tokens por la presión sobre la caché KV.
- Evaluación comparativa de formatos: útil para comparar EXL3 a 2,58 bpw frente a otras alternativas (GGUF Q4, FP8, AWQ) en la misma tarea, midiendo perplejidad y calidad percibida antes de elegir el formato definitivo de producción.
- Fine-tuning ligero o experimentación con adaptadores (si el formato lo permite): no documentado; conviene comprobar la compatibilidad de LoRA con EXL3 antes de planificarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repo no incluye MMLU, HumanEval, GSM8K, MT-Bench ni mediciones de perplejidad, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos trataban sobre bosques tropicales y no son pertinentes). Tampoco se dispone de datos de throughput ni de latencia medidos para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~45 GB solo para pesos (tamaño del repo), más caché KV. Con contexto corto y lote 1, un presupuesto de 48 GB es el mínimo realista; para contextos largos o concurrencia, 80 GB.
- Si el recuento real fuese 22,56 B parámetros, los pesos a 2,58 bpw ocuparían ~7,3 GB; esta estimación contradice el tamaño del repo y debe verificarse antes de dimensionar hardware.
- GPU recomendadas: RTX 6000 Ada (48 GB), A6000 (48 GB), L40S (48 GB) para uso individual; A100 80 GB o H100 80 GB para contexto largo y varios usuarios concurrentes.
- GPU consumer: no cabe en una RTX 4090, 4080 o 3090 de 24 GB. Sería necesario repartir entre 2× RTX 4090 (48 GB en total) mediante el split multi-GPU de ExLlamaV3, asumiendo la penalización de ancho de banda entre tarjetas.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3), TabbyAPI como servidor compatible con API de OpenAI, y text-generation-webui con el loader de ExLlamaV3. No hay soporte documentado para este formato en llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un MoE de esta clase con pocos parámetros activos suele ofrecer velocidades de decodificación superiores a las de un modelo denso del mismo tamaño total, pero no hay mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / precisión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`Ornith-1.5-122B-EXL3-SAGE-2.58bpw`) | 122 B (nombre) / 22,56 B (safetensors) | EXL3, 2,58 bpw | no disponible | MIT, acceso gated | HuggingFace, 0 descargas |
| `ornith-ai/Ornith-1.5-122B` (base sin cuantizar) | 122 B | BF16 (≈244 GB) o FP8 (≈122 GB, si está publicado) | no disponible | MIT según la etiqueta del derivado | HuggingFace (verificar acceso) |
| Alternativas de la misma categoría y tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros autores (por ejemplo, otras familias MoE de la clase 100 B+) dentro de la información proporcionada, por lo que no se incluyen cifras de rendimiento comparado. La comparación con el modelo base es la única que puede hacerse con datos del propio repo.

## Limitaciones y advertencias

- Discrepancia crítica en el recuento de parámetros: 122 B en el nombre frente a 22,56 B en los metadatos de safetensors. Verificar con `safetensors` o cargando el modelo antes de dimensionar hardware o presupuestar latencia.
- Cuantización a 2,58 bpw: es una precisión muy baja; cabe esperar degradación en tareas sensibles a la precisión (matemáticas, código, instrucciones largas) respecto al modelo en BF16. No hay mediciones publicadas de esa pérdida.
- Sin benchmarks ni validación comunitaria: 0 descargas y 0 likes; nadie ha reportado calidad, estabilidad ni compatibilidad en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica para este checkpoint. La cuantización agresiva puede incrementarlo en tareas de recuperación de datos concretos.
- Idiomas y contexto: no declarados. No asumir soporte de castellano ni una ventana concreta sin comprobación empírica.
- Licencia: MIT en la etiqueta del derivado, pero el acceso está restringido (gated) y las condiciones del modelo base `ornith-ai/Ornith-1.5-122B` deben revisarse por separado; MIT en el derivado no garantiza por sí solo los derechos sobre los pesos originales.
- Compatibilidad de herramientas: EXL3 solo se ejecuta con ExLlamaV3; no hay soporte documentado en llama.cpp, Ollama, vLLM o TGI, lo que limita las arquitecturas de despliegue disponibles.
- Autor de comunidad: el publicador no es el desarrollador del modelo base; no hay garantía de mantenimiento, corrección de errores ni actualizaciones.
- Fechas de creación y actualización en 2026 y repo con 0 actividad: comprobar que los archivos estén completos (todos los shards presentes) antes de descargar 45,2 GB.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vcruz305/Ornith-1.5-122B-EXL3-SAGE-2.58bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Documentación de ExLlamaV3 (formato EXL3): no disponible en la información proporcionada
- Papers, blogs, repos auxiliares o demos: no disponible; la búsqueda web realizada no devolvió resultados pertinentes al modelo
