# willgd22/qwen3-1.7b-gyeongsang

## Resumen

willgd22/qwen3-1.7b-gyeongsang es un ajuste fino (fine-tuning) del modelo Qwen3 de 1.7B parámetros, publicado por el usuario willgd22 en Hugging Face. Por el nombre del repositorio ("gyeongsang"), todo apunta a una especialización en el dialecto gyeongsang, una de las variantes regionales del coreano habladas en el sureste de la península (región de Busan, Daegu y Gyeongbuk), aunque el autor no lo confirma en la model card, que es la plantilla automática de transformers sin rellenar.

El modelo hereda la arquitectura transformer de la familia Qwen3, con 1.720.574.976 parámetros totales según los pesos en safetensors, y un tamaño de repositorio de 3,5 GB. Se distribuye en formato safetensors y es compatible con transformers, text-generation-inference y endpoints de Hugging Face. No hay información publicada sobre contexto, cuantizaciones, licencia ni idiomas soportados más allá de la inferencia por el nombre.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño (1.7B) que puede ejecutarse en hardware de consumo; por otro, sirve como caso de estudio de un ajuste regional de bajo perfil con documentación mínima, lo que obliga a evaluar con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tags y nombre del repo) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE según el tamaño) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre, probablemente coreano y dialecto gyeongsang) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. No hay información publicada sobre la arquitectura interna concreta (número de capas, dimensiones ocultas, tipo de atención) ni sobre si se aplicaron técnicas como atención lineal o decodificación especulativa. Tampoco se documenta el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o hiperparámetros.

La única pista sobre el entrenamiento es el sufijo "gyeongsang" en el nombre, que sugiere un ajuste supervisado (SFT) sobre datos en el dialecto gyeongsang del coreano. No obstante, el autor no aporta dataset, receta ni detalles de preprocesamiento, por lo que cualquier afirmación sobre el proceso es especulativa.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es text-generation y el tag conversational, por lo que está pensado para diálogo multi-turno.
- Herencia de Qwen3-1.7B: se espera razonamiento básico, generación de código y matemáticas a nivel de un modelo pequeño, aunque no hay evaluación publicada que lo confirme.
- Capacidades multilingües: no disponibles; el ajuste probablemente prioriza coreano (dialecto gyeongsang) y podría degradar el rendimiento en otros idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Agentes y razonamiento multi-paso: no disponible; no hay evidencia de modo thinking ni de soporte de agentes.
- Capacidades especiales (visión, audio): no disponible; el modelo es solo texto según los tags.

## Casos de uso

- Atención al cliente en coreano regional: el modelo podría gestionar conversaciones multi-turno con usuarios que hablan el dialecto gyeongsang, siempre que se valide su calidad real con pruebas locales, ya que no hay benchmarks publicados.
- Prototipado de chatbots dialectales: útil para experimentar con interfaces conversacionales en gyeongsang antes de invertir en modelos mayores, dado su tamaño reducido (1.7B) y su despliegue sencillo en transformers.
- Investigación lingüística: permite estudiar cómo un ajuste fino sobre un modelo base multilingüe captura variantes dialectales del coreano, comparando salidas con el Qwen3-1.7B original.
- Generación de contenido local: redacción de textos breves (reseñas, publicaciones, mensajes) en dialecto gyeongsang para medios regionales o comunidades online.
- Educación y preservación del dialecto: creación de materiales didácticos o ejercicios de conversación en gyeongsang, con revisión humana obligatoria por el riesgo de alucinación.
- Despliegue en hardware de consumo: al tener 1.7B parámetros, puede ejecutarse en GPUs de gama media o incluso en CPU con cuantización, lo que lo hace apto para demos locales y entornos con recursos limitados.
- Base para nuevos ajustes: punto de partida para fine-tunings adicionales en otras variantes del coreano o tareas específicas, gracias a su formato safetensors compatible con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3,4 GB solo para pesos (1.720.574.976 parámetros × 2 bytes), más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 1,7 GB; en 4 bits, alrededor de 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100); para cuantización 4 bits, GPUs con 4 GB o menos pueden ser suficientes.
- Cabe en consumer GPU: sí, en la mayoría de GPUs modernas de gama media y alta; también es viable en CPU con llama.cpp u Ollama si se generan pesos GGUF.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag declarado), endpoints de Hugging Face; vLLM, llama.cpp y Ollama son opciones plausibles pero no confirmadas por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| willgd22/qwen3-1.7b-gyeongsang | 1.720.574.976 | no disponible | no disponible | Hugging Face |
| Qwen3-1.7B (base) | ~1.7B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Modelos de ~1-2B para coreano (p. ej., variantes de Llama o Gemma ajustadas) | ~1-2B | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo; la comparativa se limita a parámetros, contexto y licencia, y en varios casos los datos no están publicados.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática, sin información sobre entrenamiento, datos, licencia ni evaluación.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir riesgo legal.
- Riesgo de alucinación: como todo modelo de 1.7B, la precisión factual es limitada, especialmente en tareas de conocimiento.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden evaluar sesgos de género, regionales o políticos; el ajuste dialectal podría reforzar estereotipos sobre la región.
- Limitaciones de idioma: probablemente rinde peor en castellano y otros idiomas que el Qwen3 base; no hay evaluación multilingüe.
- Contexto desconocido: sin dato de ventana de contexto, no se recomienda para tareas que requieran documentos largos.
- Sin benchmarks: no hay evidencia pública de calidad; cualquier uso en producción requiere evaluación propia.
- Repositorio con 0 descargas y 0 likes: modelo de muy bajo perfil, sin comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/willgd22/qwen3-1.7b-gyeongsang
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
