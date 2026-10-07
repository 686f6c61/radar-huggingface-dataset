# WasamiKirua/Gemma-4-E4B-Samantha-GGUF

## Resumen

Gemma-4-E4B-Samantha-GGUF es una publicación de pesos cuantizados en formato GGUF realizada por el usuario WasamiKirua a partir del modelo fusionado WasamiKirua/Gemma-4-E4B-Samantha, el cual deriva a su vez del modelo base llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic. No es un modelo entrenado desde cero: es un ajuste de estilo en el que un adaptador, entrenado con 800 respuestas generadas por un profesor local llamado Samantha8Q sobre llamadas de llama-swap, se fusionó en 16 bits para producir el checkpoint final y después se cuantizó.

El modelo declara 7.518.069.290 parámetros en su versión safetensors y el repositorio ocupa 14,3 GB, repartidos entre dos cuantizaciones del mismo modelo fusionado: q8_0 (8 bits) y q4_k_m (4 bits). La model card precisa que las capas de visión no se entrenaron y que la copia de entrenamiento en 4 bits no fue la base de la fusión.

Su relevancia es muy concreta y acotada: reproduce una voz conversacional determinada (el estilo Samantha) sin que un system prompt posterior del tipo "You are a helpful assistant." la cancele, y se distribuye únicamente en GGUF para su uso con llama.cpp, Ollama o LM Studio. No hay información sobre licencia, longitud de contexto, idiomas distintos del inglés ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en el repositorio; los tags (gemma4) y el nombre indican que deriva de la familia Gemma 4 |
| Parámetros totales | 7.518.069.290 (≈ 7,52 mil millones), dato safetensors |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | q8_0 (8 bits) y q4_k_m (4 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible |
| Formato de pesos | GGUF; el modelo completo se publica en safetensors en el repositorio WasamiKirua/Gemma-4-E4B-Samantha |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Los tags del repositorio incluyen `gemma4` y `unsloth`, y el nombre del modelo emplea la nomenclatura "E4B" propia de la familia Gemma; sin embargo, no se aporta confirmación técnica sobre si se trata de un transformer denso, de una variante MatFormer con parámetros efectivos o de otra configuración. El proceso de publicación es el habitual de Unsloth: entrenamiento de un adaptador, fusión en 16 bits y posterior conversión a GGUF.

En cuanto a los datos, el conjunto de entrenamiento se generó de forma sintética. Un profesor local denominado Samantha8Q, ejecutado sobre llama-swap, redactó las respuestas: cada llamada enviaba el system prompt de Samantha junto con una línea corriente de DailyDialog, y la fila guardada no conserva ese prompt, de modo que el modelo pequeño aprende la voz a partir de las respuestas. Se conservaron 800 respuestas para entrenamiento y 20 prompts quedaron reservados como conjunto de retención. 77 filas incluyen además la instrucción "You are a helpful assistant." con el fin de que un system prompt de aplicación posterior no anule la voz aprendida. El adaptador se fusionó en 16 bits antes de construir los ficheros GGUF, las capas de visión no se entrenaron y la copia de entrenamiento en 4 bits no fue la base de la fusión. No se documenta ningún uso de RLHF, DPO ni ninguna innovación de atención o decodificación.

## Capacidades

- Generación de texto conversacional en inglés con una voz o estilo concretos (estilo Samantha), que es el objetivo declarado del ajuste.
- Mantenimiento del estilo ante un system prompt de aplicación genérico, gracias a las 77 filas que incluyen "You are a helpful assistant.".
- Inferencia local mediante llama.cpp, Ollama y LM Studio, formatos soportados explícitamente por el autor.
- Ejecución en equipos sin GPU dedicada, al disponer de cuantización q4_k_m.
- No dispone de capacidades de visión: las capas correspondientes no se entrenaron.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documenta modo de razonamiento (thinking), capacidades matemáticas específicas, generación de código ni audio.
- Multilingüismo no documentado: el único idioma declarado es el inglés.
- El autor advierte que estos ficheros no deben usarse como checkpoint de entrenamiento.

## Casos de uso

- Asistente conversacional con personalidad fija: el modelo está entrenado específicamente para sostener un tono cercano y conversacional en inglés, de modo que puede emplearse en prototipos de chat donde se priorice la consistencia de voz sobre la precisión factual.
- Role-play y escritura creativa en inglés: la adaptación sobre líneas de DailyDialog favorece diálogos cotidianos y multi-turno, adecuados para herramientas de ficción interactiva o generación de diálogos.
- Generación de datos sintéticos de estilo: el modelo puede actuar como anotador o profesor de bajo coste para producir respuestas con una voz concreta que después se usen en el entrenamiento de modelos más pequeños.
- Investigación sobre transferencia de estilo y sobre robustez frente a system prompts: el caso de las 77 filas con "You are a helpful assistant." permite estudiar hasta qué punto un ajuste de voz sobrevive a instrucciones de sistema posteriores.
- Evaluación comparativa de cuantizaciones: al publicarse q4_k_m y q8_0 del mismo modelo fusionado, sirve para medir cuánto se degrada una voz aprendida al pasar de 8 a 4 bits en tareas conversacionales abiertas.
- Despliegue local de bajo coste: con la cuantización q4_k_m puede ejecutarse en portátiles y equipos de sobremesa sin GPU dedicada mediante Ollama o LM Studio, para experimentación interna en inglés.
- Pruebas de integración en aplicaciones de chat: útil para validar pipelines de inferencia GGUF (carga, plantilla de chat, streaming) antes de sustituir el modelo por uno mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una comprobación cualitativa sobre un prompt reservado que no formó parte del entrenamiento y para el que no se envió el system prompt de Samantha:

| Prompt | Modelo base | Gemma-4-E4B-Samantha |
|---|---|---|
| "Can you stay a little longer?" | "I'd be happy to! I can stay as long as you need me. What would you like to do or talk about next?" | "Of course, I'd love to keep talking. What's on your mind? I'm here to listen." |

Esta comparación es ilustrativa del estilo, no una métrica de rendimiento.

## Requisitos de hardware

- VRAM estimada para q4_k_m: en torno a 4,5-5 GB solo para los pesos y aproximadamente 6-7 GB con contexto moderado. Estimación no confirmada por el autor.
- VRAM estimada para q8_0: en torno a 8 GB de pesos y aproximadamente 9-10 GB con contexto moderado. Estimación no confirmada por el autor.
- GPU consumer compatibles: q4_k_m debería caber en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); q8_0 requiere 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090).
- GPU de centro de datos: A10G, L4, A100 y H100 pueden ejecutar cualquiera de las dos cuantizaciones con holgura, aunque el modelo es demasiado pequeño para aprovechar su capacidad.
- Ejecución en CPU: viable con llama.cpp si se dispone de RAM suficiente (aproximadamente 5 GB para q4_k_m y 9 GB para q8_0).
- Opciones de despliegue: llama.cpp, Ollama y LM Studio, según indica el propio autor. No se documenta compatibilidad con vLLM o TGI, orientados a safetensors.
- Latencia y throughput: no disponibles.
- El repositorio completo ocupa 14,3 GB, por lo que conviene descargar únicamente el fichero de la cuantización deseada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar este modelo con alternativas de la misma categoría. La comparación posible se limita a los repositorios directamente relacionados:

| Modelo | Formato | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| WasamiKirua/Gemma-4-E4B-Samantha-GGUF | GGUF (q8_0, q4_k_m) | 7.518.069.290 | No disponible | No disponible | Objeto de esta ficha; solo inferencia |
| WasamiKirua/Gemma-4-E4B-Samantha | safetensors (16 bits) | No disponible | No disponible | No disponible | Modelo fusionado del que proceden los GGUF |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic | No disponible | No disponible | No disponible | No disponible | Modelo base del ajuste |

No se han identificado en la información proporcionada modelos de terceros (por ejemplo, alternativas de 7-8B de otras familias) con datos verificables para establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse la legalidad de un uso comercial ni las obligaciones de atribución derivadas del modelo base.
- El modelo base se presenta como "ultra-uncensored-heretic", lo que implica un alineamiento de seguridad reducido y un riesgo elevado de generar contenido inapropiado en producción.
- Entrenamiento con solo 800 respuestas: alta probabilidad de sobreajuste a la voz Samantha y de degradación en tareas distintas del diálogo casual.
- Idiomas: únicamente inglés declarado; el comportamiento en castellano u otras lenguas no está documentado.
- Sin datos de longitud de contexto: no puede garantizarse el comportamiento en conversaciones largas ni en tareas de contexto extenso.
- Sin visión: las capas de visión no se entrenaron, por lo que no debe esperarse ninguna capacidad multimodal pese al nombre del modelo base.
- Riesgo de alucinación: no se ha publicado ninguna evaluación de fidelidad factual, y el ajuste prioriza el estilo sobre la precisión.
- Advertencia explícita del autor: los ficheros GGUF no deben utilizarse como checkpoint de entrenamiento.
- Nulo historial de adopción (0 descargas y 0 likes en el momento de la consulta), sin validación independiente por parte de la comunidad.
- No hay garantía de compatibilidad con servidores de inferencia de alto rendimiento distintos de llama.cpp, Ollama o LM Studio.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante: los resultados obtenidos fueron dominios de contenido para adultos sin relación alguna con el modelo, por lo que no se ha podido contrastar ninguna afirmación de la model card con documentación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/WasamiKirua/Gemma-4-E4B-Samantha-GGUF
- Modelo completo en safetensors: https://huggingface.co/WasamiKirua/Gemma-4-E4B-Samantha
- Modelo base: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
- Búsqueda web: sin resultados relevantes; únicamente dominios de contenido para adultos no relacionados con el modelo.
