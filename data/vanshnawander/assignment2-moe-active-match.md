# vanshnawander/assignment2-moe-active-match

## Resumen

`vanshnawander/assignment2-moe-active-match` es un modelo de traducción automática publicado en HuggingFace por el usuario vanshnawander, presumiblemente como entrega de un trabajo académico (el propio identificador incluye "assignment2"). Se trata de un Transformer decoder-only con mezcla de expertos (MoE) entrenado para traducir de vietnamita y japonés a inglés, con 47.973.376 parámetros totales y hasta 35.402.752 parámetros activos por token. La ventana de contexto es de solo 256 tokens y el vocabulario es un BPE byte-level de 32.000 entradas.

Arquitectónicamente es deliberadamente pequeño: seis capas, ocho cabezas de atención y tamaño oculto de 512. Los pesos se distribuyen como código PyTorch propio (`model_state.pt` más módulos fuente de arquitectura y decodificación), lo que implica que no hay integración con ecosistemas estándar como transformers, llama.cpp o vLLM. El repositorio ocupa 0,2 GB, coherente con pesos en FP32 (unos 192 MB teóricos) más tokenizador y ficheros auxiliares.

Su relevancia es limitada y de ámbito educativo: cero descargas, cero "likes", sin licencia declarada, sin idiomas etiquetados y sin resultados comparativos frente a alternativas. Aporta, eso sí, métricas de evaluación explícitas (perplejidad de test 68,7231 y BLEU 16,0840) y una interfaz de inferencia documentada, lo que lo convierte en un caso de estudio útil sobre arquitecturas MoE de bajo presupuesto computacional más que en un candidato para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), implementación custom en PyTorch |
| Parametros totales | 47.973.376 |
| Parametros activos | Hasta 35.402.752 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (los pesos publicados están en precisión completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | Traducción de vietnamita a inglés y de japonés a inglés (según model card); no se listan idiomas adicionales |
| Licencia | No disponible |
| Formato de pesos | `model_state.pt` (tensores PyTorch), código fuente Python (`load_model.py`, `decoding.py`), tokenizador `tokenizer.json` (formato Tokenizers) |
| Capas | 6 |
| Cabezas de atencion | 8 |
| Tamano oculto | 512 |
| Vocabulario | 32.000 tokens, BPE byte-level |
| Tokens especiales | PAD=0, BOS=1, EOS=2, SEP=3, VI=4, JA=5 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 4 de octubre de 2026 (creacion) |
| Ultima actualizacion | 4 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con capas de mezcla de expertos. La diferencia entre parámetros totales (47.973.376) y activos por token (35.402.752) confirma un enrutamiento disperso: aproximadamente el 73,8 % del total de parámetros se activa en cada paso, lo que deja un 26,2 % de la capacidad en expertos no seleccionados para un token dado. No se especifica en la información disponible el número de expertos, el número de expertos activados por token ni el tipo de router, aunque el repositorio incluye ficheros JSON con la arquitectura que no se han facilitado.

El modelo se entrenó para traducción con un esquema de prompt basado en identificadores de idioma: `[BOS, language_id, source_tokens..., SEP]` para traducción y `[BOS, text_tokens...]` para continuación de texto, con VI=4 y JA=5 como identificadores de origen. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del corpus, técnicas de alineación (RLHF, DPO) ni método de decodificación. El repositorio no incluye corpus crudo ni credenciales, y los estados del optimizador y del generador aleatorio quedaron en los checkpoints locales originales, por lo que el modelo publicado es únicamente apto para inferencia, no para reanudar entrenamiento.

## Capacidades

- Traducción automática de vietnamita a inglés y de japonés a inglés, con identificador de idioma explícito en el prompt.
- Generación de texto autocompletivo mediante prompts de continuación (`[BOS, text_tokens...]`).
- Decodificación supervisada por el usuario: el repositorio incluye `decoding.py` con helpers de decodificación basados en forward.
- Ejecución de código propio: la arquitectura se carga importando `load_model.py` desde el directorio del snapshot, no mediante `trust_remote_code` de transformers.
- Inferencia en CPU y GPU: al ser PyTorch puro, no depende de kernels especializados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües limitadas a los dos pares de traducción declarados; no hay evidencia de capacidades multilingües generales.

## Casos de uso

- Prototipado académico de arquitecturas MoE: dado que el código de arquitectura es explícito y de tamaño manejable, sirve para estudiar el enrutamiento disperso con 47,97 M de parámetros totales frente a 35,40 M activos, sin necesidad de infraestructura de gran escala.
- Traducción de titulares y frases cortas vietnamita-inglés: con 256 tokens de contexto, encaja en titulares, asuntos de correo, mensajes de chat y campos cortos de formularios.
- Traducción de fragmentos japonés-inglés en herramientas internas: el identificador JA=5 permite fijar el idioma de origen en el prompt, útil en utilidades de línea de comandos o extensiones de editor.
- Canal de evaluación de pipelines de traducción: sus métricas publicadas (perplejidad 68,7231 y BLEU 16,0840 en test) permiten usarlo como línea base mínima contra la que medir modelos mayores en el mismo par de idiomas.
- Generación de texto de bajo coste en entornos sin GPU: al ocupar menos de 0,2 GB en FP32, puede ejecutarse en contenedores pequeños o en máquinas de desarrollo sin acelerador.
- Reproducción de experimentos y docencia: el prompt de traducción está completamente especificado, y los ficheros JSON de configuración permiten reconstruir el ajuste de entrenamiento declarado por el autor.
- Filtrado o pre-traducción en pipelines por lotes con textos de menos de 256 tokens: por su reducido consumo de memoria, se pueden lanzar múltiples procesos en paralelo en una sola GPU consumer.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perplejidad (test) | 68,7231 |
| BLEU (test) | 16,0840 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos de referencia sobre los mismos conjuntos de test. La información tampoco especifica el conjunto de evaluación ni el par de idiomas al que corresponden la perplejidad y el BLEU reportados.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 192 MB solo para pesos (47.973.376 × 4 bytes), más activaciones y caché del tokenizador; en la práctica, por debajo de 1 GB.
- VRAM estimada en FP16/BF16: aproximadamente 96 MB para pesos.
- VRAM estimada en INT8: aproximadamente 48 MB para pesos.
- VRAM estimada en INT4: aproximadamente 24 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- Inferencia en CPU viable en cualquier procesador moderno, dado el tamaño inferior a 50 M de parámetros y contexto de 256 tokens.
- Aceleradores de datacenter (A100, H100, L40S) no son necesarios y ofrecerían un rendimiento limitado por el cuello de botella de lanzamiento de kernels más que por cómputo.
- Opciones de despliegue: no hay soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF. El único camino documentado es instalar `requirements.txt`, descargar el snapshot y llamar a `load_model(directory)` desde Python con PyTorch, revisando previamente el código fuente.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados por el autor. A continuación se contrastan los atributos documentados de este modelo con alternativas habitualmente empleadas para los mismos pares de idiomas; los datos de las alternativas provienen de conocimiento público general y deben verificarse antes de tomarlos como referencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|
| assignment2-moe-active-match | 47,97 M totales / 35,40 M activos | 256 tokens | No disponible | HuggingFace, codigo PyTorch custom | Perplejidad 68,7231 y BLEU 16,0840 en test |
| Helsinki-NLP OPUS-MT (vi-en, ja-en) | No disponible en la informacion proporcionada | No disponible | MIT (familia OPUS-MT) | HuggingFace, integracion transformers | Metricas BLEU publicadas por el proyecto, no comparables directamente |
| Meta NLLB-200 (variantes destiladas y completas) | No disponible en la informacion proporcionada | No disponible | CC-BY-NC-4.0 (uso comercial restringido) | HuggingFace, integracion transformers | Metricas publicadas por Meta, no comparables directamente |
| mBART / mBART-50 | No disponible en la informacion proporcionada | No disponible | MIT | HuggingFace, integracion transformers | Metricas publicadas, no comparables directamente |

Diferencias estructurales relevantes: el modelo analizado es el único de la tabla sin licencia declarada, sin integración con `transformers` y con una ventana de contexto de 256 tokens, muy inferior a la de las alternativas citadas. Tampoco cuenta con validación de la comunidad (0 descargas, 0 likes).

## Limitaciones y advertencias

- Contexto de 256 tokens: inviable para documentos, artículos o conversaciones largas. La model card insiste en mantener las entradas dentro de ese límite.
- BLEU de 16,0840 y perplejidad de 68,7231 en test: valores que, sin datos del conjunto de evaluación, sugieren una calidad de traducción limitada y un riesgo alto de salidas incorrectas o incoherentes.
- Ausencia de licencia: no se puede asumir permiso de uso comercial, redistribución ni modificación. Cualquier uso en producción requiere aclaración previa con el autor.
- Ejecución de código arbitrario: la carga del modelo implica importar `load_model.py` y `decoding.py` desde el repositorio. Es imprescindible auditar ese código antes de ejecutarlo, ya que no existe revisión por parte de la comunidad.
- Sesgos: no disponibles. No se documenta composición del corpus ni análisis de sesgos, por lo que se desconocen los sesgos de género, nacionalidad o registro que puedan haberse aprendido.
- Riesgo de alucinación: sin datos de entrenamiento ni evaluación cualitativa, no puede descartarse la generación de contenido inventado, especialmente en prompts de continuación alejados del dominio de traducción.
- Idiomas: solo vietnamita-inglés y japonés-inglés según la model card; los metadatos de HuggingFace no declaran ningún idioma, lo que dificulta el filtrado automático.
- Metadatos incompletos: sin licencia, sin idiomas etiquetados y con 0 descargas, no hay señales de mantenimiento ni de validación externa.
- Reproducibilidad parcial: el repositorio no incluye corpus de entrenamiento, estados del optimizador ni del generador aleatorio, por lo que el entrenamiento no puede reanudarse ni auditarse por completo.
- Fecha de publicación inusual (octubre de 2026 en los metadatos): conviene verificar la procedencia y el estado real del repositorio antes de integrarlo en cualquier flujo.
- Sin cuantizaciones oficiales ni soporte GGUF: cualquier despliegue optimizado exige conversión manual y validación propia de la pérdida de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vanshnawander/assignment2-moe-active-match
- No se han encontrado papers, blogs, repositorios auxiliares ni demos asociados en la información proporcionada.
