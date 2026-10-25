# zugquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

zugquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario `zugquants` a partir del modelo de ajuste fino `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, que a su vez deriva de la familia Qwen 3.8 de 27B. El repositorio no aporta un modelo nuevo entrenado desde cero, sino una distribución de pesos cuantizados (GGUF "regular" y GGUF "MTP", con doble imatrix) de un fine tune multi-etapa orientado a razonamiento, código y escritura creativa sin restricciones de contenido.

El autor del ajuste fino original (DavidAU) declara haber aplicado sus métodos propios "Cold Fusion" (GAIN + Unsloth) y "Fable Fusion 711", con el objetivo explícito de reducir el número de tokens de razonamiento entre un 50 % y un 90 % (mediana en torno a dos tercios) manteniendo o elevando los resultados en siete benchmarks críticos. Según la model card, la versión en 8 bits alcanza 735 puntos en ARC-C y 880 en ARC-E, y la de 4 bits 719 en ARC-C; estas cifras son autodeclaradas por el autor y no se han podido contrastar con ninguna fuente independiente en la información disponible.

El interés práctico del repositorio es acotado pero real para quien quiera ejecutar un modelo de ~26 900 millones de parámetros en hardware de consumo: ofrece pesos GGUF listos para llama.cpp/Ollama, licencia Apache 2.0 y variantes "MTP" (multi-token prediction) pensadas para aumentar el throughput. Ahora bien, el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, el tamaño total del repo es de 389 GB y el pipeline declarado (`image-text-to-text`) no se corresponde con ninguna capacidad multimodal descrita en la model card, por lo que debe tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Derivada de la familia Qwen 3.8 (transformer denso, según los datos de parámetros); la model card no describe la arquitectura interna |
| Parámetros totales | 26 895 998 464 (~26,9 B), dato real de safetensors |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en 4 bits y 8 bits (mencionados Q4_K_S sin imatrix y variantes con doble imatrix "Neo-CODER MAX DI-MATRIX"). Listado completo de quants no disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes "Regular GGUF Quants" y "MTP GGUF Quants"); el modelo base se distribuye en bfloat16 |
| Pipeline declarado | `image-text-to-text` (no confirmado por la model card) |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Tamaño del repositorio | 389,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su pertenencia a la familia Qwen 3.8 y de su naturaleza de transformer denso de ~27B parámetros (el recuento de parámetros totales coincide con el de un modelo no disperso, a diferencia de la variante Qwen3.6-35B-A3B que el propio autor cita como referencia MoE). El proceso de creación descrito es un pipeline de ajuste fino multi-etapa y multi-modelo combinado con fusiones multi-etapa ("multi-stage fine tune, multi-fine tune, and multi-stage merge"), partiendo de un modelo ya ajustado y no del checkpoint oficial de Qwen.

El elemento técnico diferencial que declara el autor es el método "Cold Fusion" (GAIN + Unsloth), en el que un componente programático denominado GAIN modifica dinámicamente el entrenamiento por muestra en tiempo real durante el aprendizaje, combinado con los entrenadores de Unsloth. A esto se suma "Fable Fusion 711". Los objetivos declarados del entrenamiento son: elevar la inteligencia general y la resolución de problemas, reducir el bloque de razonamiento entre 2 y 10 veces, reformatear y mejorar dicho bloque, acelerar la generación de tokens (especialmente en las variantes MTP) y mantener o subir los benchmarks principales sin "benchmaxing". No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; únicamente se citan los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`. Tampoco se detalla el proceso de "abliteration"/"heretic" aplicado para eliminar los rechazos de contenido.

## Capacidades

- Generación de texto y razonamiento en tres modos de funcionamiento (la model card menciona "all three modes of thinking"), con bloques de pensamiento reformateados y acortados respecto al modelo base.
- Generación de código: el sufijo "NEO-CODER" y la etiqueta `coder` indican ajuste específico para programación, aunque no se aportan benchmarks de código.
- Escritura creativa, narrativa y rol: etiquetas `creative writing`, `story`, `fiction`, `roleplaying`, `all genres`; la model card incluye ejemplos extensos de generación narrativa.
- Tool calling / function calling: el autor afirma en la pestaña de comunidad "the strongest tool calling performance ever recorded", sin datos verificables en la información disponible.
- Reducción del consumo de tokens de razonamiento (entre 1/2 y 1/10 según el caso, mediana ~2/3), lo que reduce latencia y coste por respuesta.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Variantes MTP (multi-token prediction) orientadas a aumentar la velocidad de decodificación.
- Sin censura / contenido sin filtros (etiquetas `uncensored`, `abliterated`, `heretic`).
- Capacidad de visión: no confirmada. El pipeline declarado es `image-text-to-text`, pero la model card no describe ningún componente multimodal.

## Casos de uso

- Escritura creativa y generación de ficción por capítulos: el ajuste está orientado explícitamente a narrativa y rol, con ejemplos en la model card de hooks narrativos y diálogo; útil para autores que necesitan borradores largos con tono consistente.
- Asistente de código en local: al ser un GGUF de ~27B ejecutable en una GPU de consumo con cuantización de 4 bits, permite autocompletado y refactorización sin enviar código a un servicio externo.
- Generación de documentación técnica y comentarios de código en pipelines de CI/CD, siempre que se valide la salida antes de fusionar.
- Prototipado de agentes con tool calling: la variante MTP y la reducción de tokens de pensamiento abaratan las cadenas multi-paso, aunque la fiabilidad del function calling debe medirse en el caso concreto.
- Roleplay y sistemas de personajes para videojuegos o narrativa interactiva, donde el modelo "uncensored" evita rechazos en tramas adultas o violentas.
- Investigación sobre razonamiento eficiente: sirve como caso de estudio de hasta qué punto se puede recortar el bloque de pensamiento sin degradar los benchmarks, comparándolo con el Qwen 3.8 base.
- Traducción y generación bilingüe inglés-chino en entornos donde no se requiere español.

## Benchmarks y rendimiento

Los únicos datos disponibles son los autodeclarados por el autor del ajuste fino original. No se especifica la escala (recuento bruto o porcentaje) ni la metodología de evaluación, y no hay verificación independiente.

| Benchmark | 4 bits (Q4) | 8 bits | Referencia declarada | Notas |
|---|---|---|---|---|
| ARC-C | 719 | 735 | Qwen 3.8 27B base: no disponible (el autor afirma que 735 supone +144 puntos, lo que situaría la base en ~591) | Cifra autodeclarada; escala no especificada |
| ARC-E | No disponible | 880 | No disponible | Cifra autodeclarada; escala no especificada |
| Resto de benchmarks (7 en total) | El autor afirma superar al base en los 7 | El autor afirma superar al base en los 7 | No disponible | No se publican los números concretos |

El autor afirma además que el modelo supera los siete benchmarks de Qwen3.6-35B-A3B, Qwen3.6-27B y Qwen3.5-27B, sin aportar cifras. No se han publicado resultados verificables de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 26,9 B de parámetros, no dato del autor): ~16-17 GB en Q4_K_M, ~19-20 GB en Q5_K_M, ~29 GB en Q8_0 y ~54 GB en bfloat16 (sin contar KV cache).
- GPU de consumo: cabe en una RTX 4090 (24 GB) en cuantizaciones de 4 y 5 bits con contexto moderado; en una RTX 3090 (24 GB) de forma equivalente. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo entran quants de 4 bits agresivos con contexto recortado o con offload parcial a CPU.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S para bfloat16 y Q8 con contexto largo.
- Despliegue: llama.cpp y Ollama para GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. vLLM y TGI requerirían convertir los GGUF o usar los pesos bfloat16 del modelo base, no incluidos en este repo.
- Latencia y throughput: no disponibles. Las variantes MTP se presentan como más rápidas, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GGUF, zugquants) | ~26,9 B | No disponible | ARC-C 719 (Q4) / 735 (Q8), autodeclarado | Apache 2.0 | GGUF en HF, 0 descargas |
| Qwen3.8-27B (base de la familia) | ~27 B | No disponible | ARC-C ~591 (inferido del delta declarado) | No disponible en esta ficha | No disponible en esta ficha |
| Qwen3.6-35B-A3B | 35 B totales, 3 B activos (MoE) | No disponible | El autor afirma que este modelo lo supera en 7 benchmarks | No disponible en esta ficha | No disponible en esta ficha |
| Qwen3.6-27B / Qwen3.5-27B | ~27 B | No disponible | El autor afirma que este modelo los supera en 7 benchmarks | No disponible en esta ficha | No disponible en esta ficha |

No se dispone de datos suficientes para una comparación rigurosa: las cifras de los competidores no aparecen en la información proporcionada y las del modelo son autodeclaradas.

## Limitaciones y advertencias

- Los benchmarks son autodeclarados por el autor del fine tune y no se han verificado de forma independiente; además no se especifica la escala ni el arnés de evaluación.
- El repositorio tiene 0 descargas y 0 "likes", creado y actualizado en la misma marca temporal: no hay validación comunitaria de que los quants funcionen correctamente.
- El pipeline declarado `image-text-to-text` no se corresponde con ninguna capacidad multimodal documentada; es probablemente un error de metadatos, pero conviene no asumir visión.
- Modelo "uncensored"/"abliterated": la eliminación de rechazos puede degradar la coherencia en dominios sensibles y aumenta el riesgo de generar contenido dañino, ilegal o sexualmente explícito. Requiere moderación externa en producción.
- Riesgo de alucinación no cuantificado; no hay evaluación de factualidad en la información disponible.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está evaluado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin medirla previamente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets intermedios pueden arrastrar condiciones adicionales no detalladas en este repositorio; conviene revisar la cadena completa de modelos padre.
- El repo ocupa 389 GB: descargar el conjunto completo es inviable en la mayoría de entornos; hay que seleccionar un único archivo GGUF.
- El nombre comercial ("735-882", "TURBO", "COLD FUSION") contiene afirmaciones de marketing no respaldadas por documentación técnica reproducible; la model card no publica hiperparámetros, dataset exacto ni recetas de entrenamiento.
- No hay información sobre sesgos demográficos, de género o culturales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zugquants/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base (fine tune original): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia del método Cold Fusion / Fable Fusion 711 citada en la model card: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset citado: `DavidAU/Polar-STRICT-Datasets`
- Dataset citado: `DavidAU/F451-STRICT-Datasets`
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las únicas entradas devueltas por la búsqueda no guardan ninguna relación con el modelo ni con inteligencia artificial, por lo que se han descartado y no se enlazan.
