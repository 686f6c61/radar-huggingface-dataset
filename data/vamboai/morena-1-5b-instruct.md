# vamboai/morena-1.5b-instruct

## Resumen

MORENA 1.5B instruct es un modelo decoder de 1.484.900.352 parámetros entrenado desde cero por Vambo AI para doce lenguas africanas de escritura latina (shona, swahili, hausa, yoruba, igbo, zulú, xhosa, kinyarwanda, setswana, afrikáans, ndebele del sur y pidgin nigeriano), además de inglés, francés y código. Se distribuye bajo licencia Apache 2.0 y es la versión con ajuste por instrucciones del modelo base vamboai/morena-1.5b-base, descrito en el artículo *MORENA: An African Foundation Model*.

La arquitectura es un transformer decoder denso de 28 capas por 2048 dimensiones ocultas, con atención de consultas agrupadas (GQA 16/4), SwiGLU de 6144, RoPE con theta 500.000, embeddings atados y una ventana de contexto de 4096 tokens. El entrenamiento acumula 315.000 millones de tokens vistos (251.700 millones de preentrenamiento más 63.000 millones de mid-training), seguidos de 4.500 pasos de ajuste supervisado con enmascaramiento de pérdida y 500 pasos de recocido de seguridad. El coste declarado es de 12.834 horas de A100.

Su relevancia radica en que compite en métricas de lenguas africanas con modelos mucho mayores: obtiene 45,8 chrF++ en traducción de inglés a cinco lenguas africanas (FLORES+, 3-shot), ocho puntos por encima de MADLAD-400-3B (37,8), y 1,441 bits por byte en la media de las doce lenguas africanas, frente a 2,159 de gemma-3-12b-it. No obstante, el propio autor documenta limitaciones severas en generación fundamentada, recuperación de información y exceso de rechazos en peticiones benignas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 28 capas × 2048, GQA 16/4, SwiGLU 6144, RoPE theta 500.000, embeddings atados |
| Parámetros totales | 1.484.900.352 (1,485B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No disponible en la información proporcionada; existe un build GGUF para llama.cpp en vamboai/morena-1.5b-instruct-gguf sin listado de tipos publicado |
| Idiomas soportados | 12 lenguas africanas de escritura latina (sn, sw, ha, yo, ig, zu, xh, rw, tn, af, nr, pcm), inglés, francés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); también config.json, tokenizer.json, modeling_morena.py, load_example.py y SHA256SUMS |
| Modelo base | vamboai/morena-1.5b-base |
| Formato de chat | Tokens reservados `<reserved_0>` (turno de usuario, id 3) y `<reserved_1>` (turno de asistente, id 4) |
| Tamaño del repositorio | 3,0 GB |
| Optimizador | Muon para pesos no de embedding, AdamW para el resto, schedule warmup-stable-decay |
| Creado / actualizado | 2026-09-15 / 2026-09-18 |

## Arquitectura y entrenamiento

MORENA 1.5B instruct es un transformer decoder denso entrenado desde cero, sin destilación de ningún modelo occidental. La configuración concreta es de 28 capas con dimensión oculta 2048, atención de consultas agrupadas con 16 cabezas de consulta y 4 de clave/valor, capa feed-forward SwiGLU de 6144, RoPE con theta 500.000 y embeddings de entrada y salida atados. Esta relación 16/4 reduce el tamaño de la caché KV, lo que resulta relevante para despliegue en hardware modesto.

El preentrenamiento consumió 251.700 millones de tokens y el mid-training 63.000 millones adicionales (315.000 millones vistos en total). La mezcla de datos se movió en tres regímenes según llegaban las traducciones automáticas: el texto africano representó el 24,8 % de los tokens vistos (14,8 % traducido automáticamente) en los pasos 1 a 25.304, el 39,1 % (31,0 % traducido) en los pasos 25.305 a 60.000, y el 50,2 % (41,6 % traducido) durante el mid-training. Nueve lenguas se tradujeron automáticamente desde documentos en inglés, lo que supone el 24 % de los tokens de preentrenamiento y el 28 % incluyendo mid-training (57.100 millones de tokens en disco, el 21 % de los 271.000 millones almacenados). Las fuentes incluyen fineweb-edu, fineweb-2, MADLAD-400, afriberta-corpus, wura, open-web-math, proof-pile-2, codeparrot-clean, github-code-clean, Magicoder-OSS-Instruct-75K, CodeFeedback-Filtered-Instruction, fikira y morena-sft-corpus.

El ajuste por instrucciones consistió en 4.500 pasos de SFT con enmascaramiento de pérdida más 500 pasos de recocido de seguridad. El checkpoint final se seleccionó según una regla fijada antes de los experimentos finales (todas las categorías de daño dentro de 3,5 puntos de la versión anterior, rechazos en al menos el 91 % de los intentos, degeneración máxima del 1 % y ninguna capacidad perdida); según el autor, el modelo incumple esa regla en privacidad por 0,1 puntos, en drogas por 1,0, en violencia por 2,6 y en degeneración, que queda en el 1,3 %.

## Capacidades

- Generación de texto conversacional en doce lenguas africanas de escritura latina, inglés y francés.
- Traducción automática bidireccional: 45,8 chrF++ de inglés a cinco lenguas africanas (3-shot, FLORES+) y 48,7 en sentido inverso.
- Llamada a herramientas con formato JSON válido: 98,1 % de herramienta correcta y 100 % de JSON válido, aunque la medición se realiza con el marcador de herramienta precargado.
- Generación de código, gracias a datasets como codeparrot, github-code-clean, Magicoder-OSS-Instruct-75K y CodeFeedback-Filtered-Instruction; no se publican benchmarks específicos de código.
- Razonamiento matemático básico por la inclusión de open-web-math y proof-pile-2 en el preentrenamiento; sin benchmarks publicados.
- Comprensión lectora en formato de elección múltiple (Belebele), con 0,309 de precisión media en diez lenguas africanas frente al 0,25 de azar.
- Seguridad conversacional: el 89,0 % de 3.341 intentos se manejan bien en 13 lenguas y 11 categorías, y se rechaza el 91,5 % de las peticiones dañinas.
- Modo de respuesta fundamentada en hechos proporcionados en el contexto, con una tasa de fidelidad total del 23 % (22 de 96 intentos).
- No dispone de capacidades de visión, audio ni de decodificación especulativa declarada.

## Casos de uso

- Traducción de inglés a lenguas africanas de bajos recursos: con 45,8 chrF++ en FLORES+ 3-shot, supera en ocho puntos a MADLAD-400-3B, lo que lo hace adecuado para localización de documentación, contenidos educativos o interfaces de producto hacia shona, swahili, hausa, yoruba o igbo.
- Traducción de lenguas africanas a inglés: 48,7 chrF++ en el sentido inverso, útil para ingesta y análisis de contenido local en centros de datos o sistemas de monitorización.
- Asistentes conversacionales en lenguas africanas: la ventana de 4096 tokens permite mantener conversaciones multi-turno con historial y contexto de producto, y el formato de turnos con dos tokens reservados simplifica la integración.
- Extracción de datos estructurados con function calling: 98,1 % de acierto en herramienta y 100 % de JSON válido cuando el marcador está precargado, lo que encaja en pipelines de agentes donde el esquema de herramientas lo fija el orquestador.
- Ajuste fino específico de dominio: al ser un modelo denso de 1,485B con licencia Apache 2.0 y pesos en safetensors, una organización puede reentrenarlo o afinarlo sobre su propio corpus africano con un presupuesto de GPU reducido.
- Despliegue en local o en el borde: los pesos bf16 ocupan unos 3,0 GB y existe un build GGUF para llama.cpp, por lo que cabe en GPUs de consumo e incluso en equipos con 8 GB de VRAM o menos usando cuantización.
- Moderación y filtrado multilingüe asistido: sus tasas de rechazo (91,5 % de peticiones dañinas) y el desglose por categoría lo hacen apropiado como primera capa de filtrado, siempre con revisión humana.
- Investigación en evaluación de lenguas africanas: sirve como referencia pequeña y reproducible (bits por byte por lengua, Belebele, FLORES+) para comparar contra modelos multilingües mayores con coste de inferencia mucho menor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados por el autor son evaluaciones propias orientadas a lenguas africanas, con gemma-3-12b-it actuando como juez automático:

| Métrica | MORENA 1.5B instruct | Referencia |
|---|---|---|
| Bits por byte en lenguas africanas, media de 12 (menor es mejor) | 1,441 | Lugha-Llama-8B 1,423; gemma-3-12b-it 2,159; gemma-3-1b-pt 2,335 |
| Traducción FLORES+ chrF++, inglés a 5 lenguas africanas, 3-shot | 45,8 (45,1-46,5) | MADLAD-400-3B 37,8; Lugha-Llama-8B 36,8 |
| Traducción FLORES+ chrF++, 5 lenguas africanas a inglés | 48,7 (47,5-49,7) | MADLAD-400-3B 53,6; Lugha-Llama-8B 52,4 |
| Comprensión lectora Belebele, media de 10 lenguas africanas (azar 0,25) | 0,309 | Rango por lengua: 0,24 en yoruba a 0,43 en afrikáans |
| QA con recuperación, precisión en libro abierto / fundamentación, media africana (azar 0,25) | 0,325 (0,297-0,355) / 0,73 | No disponible |
| Generación fundamentada, totalmente fiel a los hechos dados | 23 % (22 de 96; 15,6-32,3) | Versión anterior 31 % (30 de 96); base sin instrucciones 6 % (6 de 96) |
| Llamada a herramientas, herramienta correcta / JSON válido (marcador precargado) | 98,1 % / 100 % | No disponible |
| Seguridad, proporción de los 3.341 intentos bien gestionados, 13 lenguas, 11 categorías | 89,0 % (87,8-90,0) | 90,2 % de los intentos puntuables |
| Salida degenerada | 1,3 % | No disponible |
| Peticiones dañinas rechazadas, sobre el total de intentos | 91,5 % | No disponible |
| Peticiones benignas respondidas bien | 58,9 % (53,3-64,2) | Versión anterior 47,9 % |

Seguridad por categoría (proporción de intentos bien gestionados, 24 peticiones por categoría y lengua): autolesión 92,5; seguridad infantil 91,2; drogas 86,2; violencia 88,9; elecciones 89,2; privacidad 93,8; fraude 94,3; armas 93,3; odio 95,4; medicación 95,4. Lenguas más débiles: igbo 75 %, yoruba 82 %, setswana 83 %, xhosa 87 %.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 3,0 GB de pesos. La caché KV derivada de la configuración (28 capas, GQA con 4 cabezas KV de 128 dimensiones) ronda los 56 KB por token en bf16, unos 0,23 GB con la ventana completa de 4096 tokens.
- VRAM con cuantización: alrededor de 1,6 GB en 8 bits y en torno a 0,9-1,0 GB en 4 bits (estimaciones estándar a partir del número de parámetros; el repositorio GGUF no publica un listado de tipos de cuantización).
- GPU recomendadas: cualquier GPU con 8 GB o más funciona con holgura en bf16; RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10G, A100 y H100 son válidas. Cabe en GPUs de consumo y, con cuantización de 4 bits, en equipos con 4-6 GB de VRAM.
- Opciones de despliegue: el repositorio incluye `modeling_morena.py`, una implementación de referencia en PyTorch puro sin dependencia de transformers, más `load_example.py`. Para llama.cpp existe el build GGUF en vamboai/morena-1.5b-instruct-gguf, lo que abre la puerta a Ollama y otros frontales compatibles con GGUF. No se confirma soporte de vLLM o TGI: al usar una arquitectura propia con tokens reservados, requeriría una integración específica.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de despliegue: la model card marca `inference: false`, por lo que el modelo no está habilitado en la Inference API de Hugging Face.
- Entrenamiento: 12.834 horas de A100 para esta publicación, con un coste estimado de 25.000 a 40.000 dólares a 2-3 dólares por hora de A100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits por byte africano (12 lenguas, menor es mejor) | Traducción EN→5 africanas (chrF++ 3-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MORENA 1.5B instruct | 1,485B | 4096 | 1,441 | 45,8 | Apache 2.0 | Pesos abiertos en safetensors y GGUF |
| MORENA 1.5B base | 1,485B | 4096 | 1,408 | No disponible | Apache 2.0 | Pesos abiertos; punto de partida para ajuste |
| Lugha-Llama-8B | 8B (aproximado, no confirmado) | No disponible | 1,423 | 36,8 | No disponible | No disponible en la información proporcionada |
| MADLAD-400-3B | 3B (aproximado, no confirmado) | No disponible | No disponible | 37,8 | No disponible | No disponible en la información proporcionada |
| gemma-3-1b-pt | 1B (aproximado, no confirmado) | No disponible | 2,335 | No disponible | No disponible | No disponible en la información proporcionada |
| gemma-3-12b-it | 12B (aproximado, no confirmado) | No disponible | 2,159 | No disponible | No disponible | No disponible en la información proporcionada |

La comparación directa más relevante es con Lugha-Llama-8B: MORENA 1.5B instruct es cinco veces menor en parámetros, tiene un bits por byte africano casi idéntico (1,441 frente a 1,423) y lo supera ampliamente en traducción de inglés a lenguas africanas (45,8 frente a 36,8), aunque pierde en el sentido inverso (48,7 frente a 52,4) y frente a MADLAD-400-3B (53,6). MORENA 0.5B mini, podado y destilado del 1.5B, completa la familia con 503M de parámetros y 1,520 bits por byte.

## Limitaciones y advertencias

- Generación fundamentada muy débil: solo el 23 % de los intentos son totalmente fieles a los hechos proporcionados, frente al 31 % de la versión anterior. El autor lo señala explícitamente como una regresión.
- QA con recuperación al nivel del azar en lenguas africanas (0,325 con azar en 0,25), pese a que el modelo demuestra leer el pasaje (fundamentación 0,73). No es fiable para RAG en estos idiomas sin verificación.
- Comprensión de elección múltiple en lenguas africanas al nivel del azar (0,309): el autor indica que ningún modelo por debajo de 12B medido supera esta prueba.
- Exceso de rechazos: el 41 % de las peticiones benignas ordinarias no se responden bien, en su mayoría por rechazo. Existe un caso documentado en el que una versión anterior se negó a recomendar una tintorería alegando «sustancias o servicios ilegales». El autor afirma que ese fallo concreto está corregido, pero no el problema general.
- Llamada a herramientas dependiente del contexto: la cifra del 98,1 % se mide con el marcador de herramienta precargado; si se deja decidir al modelo, casi nunca invoca una herramienta. En producción conviene forzar el esquema desde el orquestador.
- Evaluación sin hablantes nativos: todas las cifras proceden de gemma-3-12b-it juzgando a otro modelo. Ningún hablante nativo ha valorado una respuesta, lo que limita la validez de las métricas de calidad lingüística y de seguridad.
- Datos mayoritariamente traducidos por máquina: entre el 24 % y el 28 % de los tokens vistos proceden de traducción automática desde documentos en inglés, lo que puede introducir sesgos de traducción, calcos y una cobertura desigual entre las doce lenguas.
- Seguridad desigual por idioma: igbo 75 %, yoruba 82 %, setswana 83 % e isiXhosa 87 %, frente a categorías como odio (95,4 %) o medicación (95,4 %).
- Salida degenerada en el 1,3 % de los casos, por encima del umbral del 1 % que el propio autor se había fijado.
- Formato de chat estricto: usar cadenas tipo `<|user|>` produce salidas degeneradas porque no están en el vocabulario. Hay que emplear `<reserved_0>` y `<reserved_1>` (ids 3 y 4).
- Contexto limitado a 4096 tokens, muy por debajo de los 128K o más habituales en modelos multilingües actuales; no es adecuado para documentos largos sin fragmentación.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales, pero conviene revisar la procedencia de los corpus de traducción automática por si afecta a dominios regulados.
- Soporte de ecosistema incierto: la arquitectura y el tokenizador son propios, con una implementación de referencia en PyTorch puro; no hay confirmación de soporte en vLLM o TGI, lo que puede complicar el escalado en producción.
- Cifras de evaluación en reposo: el modelo se publicó con 24 descargas y 13 «me gusta», por lo que la validación por parte de la comunidad es todavía muy escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vamboai/morena-1.5b-instruct
- Modelo base: https://huggingface.co/vamboai/morena-1.5b-base
- Build GGUF para llama.cpp: https://huggingface.co/vamboai/morena-1.5b-instruct-gguf
- Modelo mini de la familia: https://huggingface.co/vamboai/morena-0.5b-mini
- Corpus de ajuste supervisado: https://huggingface.co/datasets/vamboai/morena-sft-corpus
- Corpus fikira: https://huggingface.co/datasets/vamboai/fikira
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- MADLAD-400: https://huggingface.co/datasets/allenai/MADLAD-400
- Wura: https://huggingface.co/datasets/castorini/wura
- AfroBERTa corpus: https://huggingface.co/datasets/castorini/afriberta-corpus
- OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Proof-Pile-2: https://huggingface.co/datasets/EleutherAI/proof-pile-2
- Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Artículo «MORENA: An African Foundation Model»: mencionado en la model card, sin enlace disponible en la información proporcionada.
- Repositorio de código o demo: no disponible en la información proporcionada.
