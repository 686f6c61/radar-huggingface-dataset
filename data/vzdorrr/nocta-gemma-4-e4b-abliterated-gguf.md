# Vzdorrr/Nocta-Gemma-4-E4B-abliterated-GGUF

## Resumen

Nocta-Gemma-4-E4B-abliterated-GGUF es una recuantización en formato GGUF del modelo Gemma 4 E4B instruction-tuned de Google, pasada previamente por un proceso de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) a cargo de huihui-ai. El autor de esta ficha, Vzdorrr, la publica como artefacto optimizado para una aplicación de compañero conversacional en dispositivo (Nocta), con el objetivo explícito de reducir tamaño y aumentar velocidad frente a un Q4_K_M convencional sin degradar la calidad de chat.

El modelo conserva la modalidad image-text-to-text del original (incluye un proyector visual cuantizado a Q5_0) y una arquitectura Gemma 4 de aproximadamente 6.750 millones de parámetros totales, de los cuales una parte relevante corresponde a tablas de embedding por capa que son meras búsquedas y por tanto toleran cuantización agresiva. La receta emplea cuantización Q4_0 guiada por importance matrix (imatrix) sobre texto de calibración multilingüe, Q2_K para el embedding por capa, y un recorte de vocabulario de 262.144 a 208.339 tokens.

Su relevancia práctica es doble: por un lado demuestra una técnica de compresión orientada a despliegue en CPU ARM (kernels rápidos de Q4_0), y por otro ejemplifica el ecosistema de variantes "abliterated" y "uncensored" que eliminan los mecanismos de rechazo del modelo original. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 E4B), multimodal image-text-to-text; no se detalla configuración de capas ni atención en la información disponible |
| Parametros totales | 6.746.761.514 |
| Parametros activos | no disponible (no es MoE según la información aportada) |
| Longitud de contexto | no disponible en la model card; las mediciones se realizaron con ctx 8192 en llama.cpp |
| Tipos de cuantizacion | GGUF: Q4_0 con importance matrix para el modelo principal; Q2_K para `per_layer_token_embd`; Q4_0 para `token_embd`; Q5_0 para el proyector visual (mmproj) |
| Idiomas soportados | No declarados formalmente; calibración y evaluación en ru, en, zh, es, fr, pt, de; vocabulario recortado elimina escrituras como devanagari, árabe, kana japonés y tailandés |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it` en su variante QAT (quantization-aware training) publicada por Google, que huihui-ai convirtió a BF16 sin cuantizar y sometió a abliteration. Sobre esa base, Vzdorrr aplica una recuantización con `llama-imatrix` y `llama-quantize`: el tensor principal va en Q4_0 (coherente con el entrenamiento QAT original y con kernels rápidos en ARM), el embedding por capa (`per_layer_token_embd`, 2.820 millones de parámetros) va en Q2_K porque son búsquedas directas sin cómputo, y el embedding de tokens (`token_embd`) en Q4_0.

La novedad técnica principal es el recorte de vocabulario: se eliminan 53.805 tokens correspondientes a escrituras no usadas por la aplicación (devanagari, árabe, kana, tailandés y otras), conservando latín, cirílico, ideogramas CJK, coreano, emoji y todos los tokens especiales. Según el autor, la tokenización sobre los textos de la app es idéntica a la del modelo sin recortar y la generación greedy en ru/zh/es/en es palabra por palabra la misma. La calibración de la imatrix se hizo con diálogos de rol y prompts de estilo aplicación en siete idiomas (ru, en, zh, es, fr, pt, de). El proyector visual se cuantizó desde el mmproj F16 de mradermacher a Q5_0. No se documentan detalles adicionales sobre RLHF/DPO ni sobre el volumen de datos de preentrenamiento en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogos de rol con memoria y persona.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector visual incluido en Q5_0.
- Multilingüismo efectivo en ruso, inglés, chino, español, francés, portugués y alemán según los datos de calibración y evaluación; otras escrituras quedan degradadas por el recorte de vocabulario.
- Comportamiento "abliterated": se eliminan los rechazos del modelo original, lo que permite respuestas sin filtros de seguridad aprendidos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.
- No se documenta modo de pensamiento (thinking), audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Compañero conversacional en dispositivo: es el caso de uso declarado; el tamaño de 3,71 GB (modelo más visión) y los kernels Q4_0 en ARM permiten ejecución local en hardware de consumo con latencia aceptable.
- Roleplay y narrativa interactiva: la calibración con diálogos de rol y la evaluación con un bench de 30 turnos con memoria y persona lo hacen adecuado para personajes persistentes en aplicaciones móviles o de escritorio.
- Asistencia visual offline: el proyector Q5_0 permite describir imágenes y responder preguntas sobre ellas sin conexión, útil en aplicaciones de accesibilidad o catalogación local.
- Prototipado de aplicaciones multilingües en es/ru/zh/en: el modelo mantiene tokenización y generación equivalentes al original en esas lenguas, lo que facilita iterar sin reentrenar.
- Investigación sobre abliteration y seguridad: sirve como referencia para estudiar cómo la eliminación de la dirección de rechazo afecta a la calidad conversacional y a la robustez.
- Despliegue en entornos con recursos limitados: la combinación Q4_0 + Q2_K en embeddings reduce el peso en disco y memoria frente a Q4_K_M, útil en dispositivos embebidos o contenedores pequeños.
- Evaluación comparativa de cuantizaciones: el autor publica métricas de KL y un bench propio, lo que permite reproducir y comparar recetas de cuantización.

## Benchmarks y rendimiento

Datos publicados por el autor (llama.cpp, Mac M5 Pro CPU, contexto 8192):

| Modelo | Tamaño (modelo + visión) | KL vs BF16 | Bench (0-100) | Gen / prefill tok/s |
|---|---|---|---|---|
| mradermacher Q4_K_M + mmproj F16 | 6,29 GB | 0,052 | 84 | 27 / 90 |
| Mismo, vocabulario sin recortar | 3,99 GB | 0,077 | 86 (6 semillas); 81 / 95 / 80 (3 semillas) | 32 / 102 |
| Este modelo (vocabulario recortado) | 3,71 GB | no disponible | 82 / 89 / 87 (3 semillas) | no disponible |

Proyector visual (parte de visión del bench, 2 semillas):

| mmproj | Tamaño | Puntuación de visión |
|---|---|---|
| Q8_0 | 0,56 GB | 88 / 100 |
| Q5_0 (este) | 0,38 GB | 75 / 100 |
| Q4_0 | no disponible | 75 y 88 en las dos semillas |

El bench es un diálogo de rol en ruso de 30 turnos con pruebas de memoria, persona, robustez, visión, preguntas sí/no y formato. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo principal ocupa 3,33 GB y el proyector visual 0,38 GB; con contexto 8192 conviene reservar al menos 5-6 GB de memoria total para pesos, caché KV y overhead.
- Cabe en GPUs de consumo con 8 GB o más (RTX 3060, 4060, 4070, etc.) y en equipos Apple Silicon con memoria unificada; el autor lo midió en un Mac M5 Pro en CPU.
- GPUs de datacenter (A100, H100) no son necesarias para este tamaño; su uso tendría sentido solo para servir muchas peticiones concurrentes.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF, imatrix, mmproj); también puede servirse mediante Ollama u otros frontends compatibles con GGUF. vLLM y TGI no se mencionan en la información disponible para este artefacto.
- Throughput medido en Mac M5 Pro CPU: 32 tok/s de generación y 102 tok/s de prefill para la variante sin recortar; no se publican cifras para la versión recortada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nocta-Gemma-4-E4B-abliterated (este) | 6.746.761.514 | no disponible | GGUF Q4_0/Q2_K/Q5_0 | Apache 2.0 | Vocabulario recortado, abliterated, visión incluida |
| mradermacher Q4_K_M del mismo base | mismo base | no disponible | GGUF Q4_K_M | Apache 2.0 | 6,29 GB con visión F16, sin recorte de vocabulario |
| huihui-ai Huihui-gemma-4-E4B-it-qat-q4_0-unquantized-abliterated | mismo base | no disponible | BF16 / GGUF | Apache 2.0 | Modelo fuente sin recuantizar ni recortar |
| google/gemma-4-E4B-it | mismo base | no disponible | safetensors / GGUF | Gemma license (no confirmada en la información disponible) | Modelo original con rechazos intactos |

## Limitaciones y advertencias

- El recorte de vocabulario degrada la tokenización en escrituras eliminadas (devanagari, árabe, kana japonés, tailandés y otras); para esos idiomas debe usarse el modelo sin recortar.
- La abliteration elimina los rechazos aprendidos, lo que aumenta el riesgo de generar contenido dañino, sesgado o inexacto; no es apto para producción sin filtros externos.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluaciones de seguridad para esta variante.
- La licencia Apache 2.0 se declara en la model card, pero conviene verificar la licencia del modelo Gemma original de Google antes de uso comercial, ya que la información disponible no la confirma.
- El bench propio del autor (diálogo de rol en ruso) no equivale a evaluaciones estándar; el rendimiento en tareas de código, matemáticas o razonamiento formal no está medido.
- El contexto máximo no se documenta; las pruebas se hicieron a 8192 tokens y no hay garantía de comportamiento más allá.
- El proyector visual Q5_0 pierde algo de calidad frente a Q8_0 (75 frente a 88 en el bench de visión), aunque el autor lo atribuye a la variabilidad entre semillas.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en pipelines que dependan de ello.

## Enlaces

- Hugging Face: https://huggingface.co/Vzdorrr/Nocta-Gemma-4-E4B-abliterated-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-gemma-4-E4B-it-qat-q4_0-unquantized-abliterated-GGUF
- mmproj de referencia (mradermacher): https://huggingface.co/mradermacher/Huihui-gemma-4-E4B-it-qat-q4_0-unquantized-abliterated-GGUF
- Modelo original de Google: `google/gemma-4-E4B-it` (no se proporciona URL directa en la información disponible)
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible
