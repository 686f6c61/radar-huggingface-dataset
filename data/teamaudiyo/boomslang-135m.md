# TeamAudiyo/Boomslang-135M

## Resumen

TeamAudiyo/Boomslang-135M es un repositorio publicado en HuggingFace por el equipo TeamAudiyo el 20 de septiembre de 2026 bajo licencia Apache-2.0. En el momento de redactar esta ficha, el repositorio no contiene pesos, tokenizador ni documentación técnica: la model card se limita a un anuncio en el que el autor indica que Boomslang se publicará próximamente y solicita interacciones para avisar de la fecha de lanzamiento.

La única información verificable es el identificador del repositorio —del que se deduce un tamaño aproximado de 135 millones de parámetros— y la licencia declarada. No hay datos públicos sobre arquitectura, composición del dataset de entrenamiento, longitud de contexto, idiomas soportados, formatos de pesos ni resultados de evaluación. El campo de pipeline de la ficha aparece como no disponible y el contador de descargas es cero, lo que confirma que se trata de un anuncio previo al lanzamiento y no de un artefacto utilizable.

Esta ficha debe leerse, por tanto, como un registro del estado del repositorio y de lo que razonablemente cabe esperar de un modelo de esa categoría de tamaño, no como una evaluación del modelo. No se recomienda planificar ningún uso en producción hasta que el autor publique pesos, tokenizador y documentación técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | aproximadamente 135M (inferido del nombre del repositorio; no confirmado por el autor) |
| Parámetros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se han publicado pesos, por lo que no existen cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene archivos de pesos) |
| Autor | TeamAudiyo |
| Fecha de creación | 2026-09-20 |
| Última actualización | 2026-09-20 |
| Descargas | 0 |
| Likes | 1 |
| Estado | anuncio previo al lanzamiento; sin artefactos publicados |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura, el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se ha publicado ningún paper, informe técnico o entrada de blog asociada al repositorio.

A partir del tamaño indicado en el nombre (135M) podría suponerse un transformer decoder-only denso, que es la configuración habitual en esa franja de parámetros, pero se trata de una expectativa genérica y no de un dato confirmado por el autor. Cualquier afirmación sobre atención lineal, decodificación especulativa, tokenizador empleado o estrategia de entrenamiento sería especulativa y no debe tomarse como referencia.

## Capacidades

No se puede verificar ninguna capacidad porque no hay pesos ni documentación publicados. A continuación se detalla el estado de cada apartado, indicando explícitamente la ausencia de información:

- Generación de texto: no disponible.
- Razonamiento, matemáticas y código: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas de la ficha de HuggingFace está vacío).
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponible.
- Capacidad de seguir instrucciones o formato de chat: no disponible (no hay plantilla de chat publicada).

## Casos de uso

Ninguno de los siguientes escenarios puede implementarse hoy, ya que el modelo no está publicado. Se describen como posibles aplicaciones condicionadas al lanzamiento y al perfil esperable de un modelo denso de aproximadamente 135M de parámetros. En todos los casos, la idoneidad real deberá reevaluarse cuando existan pesos y resultados de evaluación.

- Clasificación y enrutado de consultas en pipelines RAG: un modelo de 135M puede actuar como clasificador previo que decida qué recuperador o qué subagente atiende cada pregunta, reduciendo el coste frente a invocar un modelo grande en cada turno. Solo tendría sentido si el modelo final admite fine-tuning sobre datos propios.
- Extracción de entidades y estructuras en documentos: tareas de etiquetado de secuencias (nombres, fechas, importes, referencias) sobre texto administrativo o facturas, ejecutables en CPU y por tanto desplegables on-premise sin GPU.
- Autocompletado y asistencia de escritura en editores: un modelo de ese tamaño puede ofrecer sugerencias de continuación con latencia baja en local, integrándose en extensiones de editor que prioricen privacidad sobre calidad de generación.
- Moderación y filtrado de comentarios: clasificación binaria o multiclase de contenido tóxico en foros y secciones de comentarios, con la ventaja de poder ejecutarse en el mismo servidor de aplicación.
- Prototipado y pruebas de integración: uso como modelo de sustitución en el desarrollo de pipelines de inferencia (formato de prompt, gestión de errores, streaming, cuantización) antes de escalar a un modelo mayor.
- Despliegue en dispositivos con recursos limitados: asistentes de texto embebidos en Raspberry Pi, portátiles sin GPU o aplicaciones móviles, si el autor publica pesos en GGUF y el rendimiento resulta aceptable.
- Generación de datos sintéticos de bajo coste para preentrenar clasificadores auxiliares: creación masiva de ejemplos etiquetados que después se filtran y se usan para entrenar modelos específicos de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HellaSwag, ARC, GSM8K, HumanEval ni de ninguna otra suite, y la búsqueda web realizada no devolvió artículos técnicos, informes ni comparativas relativas a este modelo.

## Requisitos de hardware

Las cifras de memoria que se indican a continuación son estimaciones derivadas del tamaño de 135M de parámetros inferido del nombre del repositorio; deben confirmarse cuando se publiquen los pesos.

- VRAM estimada para los pesos: en FP16, en torno a 270 MB; en INT8, en torno a 135 MB; en INT4, en torno a 70-80 MB. Hay que sumar el coste del caché KV, que depende de la longitud de contexto (dato no disponible), y el consumo del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para los pesos en FP16. Ejemplos viables: RTX 3060, RTX 4060, RTX 4090, A100, H100. Las GPU de gama alta estarían enormemente sobredimensionadas para este tamaño.
- GPU consumer: sí, cabe con holgura en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida. También es viable la inferencia exclusiva en CPU.
- Opciones de despliegue: no disponibles de forma confirmada. Serían aplicables Transformers, llama.cpp y Ollama si se publican pesos GGUF, y vLLM o TGI si se publican pesos en safetensors. No hay plantilla de chat ni tokenizador publicados, por lo que ninguna de estas rutas está operativa hoy.
- Latencia y throughput estimados: no disponibles. No pueden medirse sin pesos ni configuración de inferencia.

## Comparativa con modelos similares

La comparativa se establece con modelos abiertos de tamaño comparable. Los datos de las alternativas proceden de sus respectivas model cards públicas y deben verificarse en la fuente original antes de citarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TeamAudiyo/Boomslang-135M | ~135M (inferido) | no disponible | Apache-2.0 | no publicado | Sin pesos, tokenizador ni documentación |
| SmolLM2-135M (HuggingFaceTB) | 135M | 8192 tokens | Apache-2.0 | publicado | Modelo denso con datos de entrenamiento documentados |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 tokens | Apache-2.0 | publicado | Generación anterior de la misma familia |
| Pythia-160M (EleutherAI) | 160M | 2048 tokens | Apache-2.0 | publicado | Serie orientada a investigación sobre interpretabilidad |
| Qwen2.5-0.5B (Alibaba) | ~494M | 32768 tokens | Apache-2.0 | publicado | Alternativa de mayor tamaño dentro del segmento pequeño |

No es posible comparar rendimiento porque Boomslang-135M no tiene resultados publicados ni pesos evaluables.

## Limitaciones y advertencias

- El modelo no está publicado: no existen pesos, tokenizador, plantilla de chat ni documentación. Cualquier intento de uso en producción es inviable en el estado actual del repositorio.
- La cifra de 135M de parámetros es una inferencia a partir del nombre del repositorio, no un dato confirmado por el autor.
- No hay información sobre sesgos, composición del dataset ni filtrado de datos, por lo que no puede evaluarse el riesgo de sesgo demográfico, cultural o lingüístico.
- El riesgo de alucinación no puede cuantificarse sin evaluación. En modelos de esta franja de tamaño es habitual una menor fidelidad factual que en modelos grandes, pero se trata de una expectativa general y no de un dato medido sobre este modelo.
- La licencia Apache-2.0 permite uso comercial y modificación, pero al no haber artefactos publicados la licencia no habilita ningún uso práctico todavía.
- No se ha especificado qué idiomas soporta el modelo; el castellano no está confirmado.
- La fecha de creación del repositorio (septiembre de 2026) y la ausencia total de artefactos sugieren que puede tratarse de un repositorio de reserva o de prueba. Existe el riesgo de que el lanzamiento nunca se materialice o de que el identificador se reutilice con otro contenido.
- No hay historial verificable del equipo TeamAudiyo, ni repositorios previos, paper o código asociado que permitan valorar su trayectoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TeamAudiyo/Boomslang-135M
- Paper o informe técnico: no disponible
- Repositorio de código: no disponible
- Demo o space: no disponible
- Búsqueda web: no se encontraron resultados relevantes. Las consultas devolvieron únicamente enlaces genéricos a YouTube (portada, YouTube Music, entrada de Wikipedia) sin relación alguna con el modelo.
