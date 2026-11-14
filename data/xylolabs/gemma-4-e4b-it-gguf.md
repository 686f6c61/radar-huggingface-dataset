# Xylolabs/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B IT es un modelo de lenguaje desarrollado por Google DeepMind, publicado originalmente en formato BF16 y distribuido bajo licencia Apache 2.0. Esta ficha describe la versión cuantizada en GGUF preparada por Xylolabs, que conserva únicamente el decodificador de texto del modelo original: los pesos del codificador de visión y audio, así como sus proyectores, se han omitido deliberadamente, de modo que la ruta evaluada acepta solo entrada de texto.

El repositorio ofrece dos alternativas de cuantización para llama.cpp: una variante IQ4_XS con calibración imatrix y una variante Q4_K_M mixta en la que las 42 matrices de proyección se almacenan en Q8_0. Ambas conservan los 720 tensores del decodificador de texto de 42 capas, incluida la tabla de embeddings atados a la salida, el tokenizador y la plantilla de chat original. El modelo base declara 7.518.069.290 parámetros totales según los safetensors originales.

La relevancia de esta ficha es práctica: permite ejecutar un modelo de la familia Gemma 4 en hardware de consumo con un peso de unos 5 GB, a costa de renunciar a las capacidades multimodales del modelo original. La evaluación publicada por el autor se limita a una comprobación de fidelidad relativa frente al BF16 de referencia, no a una batería de benchmarks de tareas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 42 capas, con embeddings por capa y tabla de salida atada |
| Parámetros totales | 7.518.069.290 (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la metadatos originales se conservan sin cambios; el ejemplo de uso limita a 2048 tokens) |
| Tipos de cuantización | IQ4_XS con imatrix; Q4_K_M mixta con proyecciones en Q8_0 |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 42 capas con embeddings por capa y tabla de embeddings compartida con la proyección de salida. La cuantización conserva los 720 tensores del decodificador de texto, incluidos los parámetros de normalización, el tokenizador y la plantilla de chat original. No se incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información disponible.

La innovación técnica de esta publicación no está en el entrenamiento, sino en el proceso de cuantización. La variante IQ4_XS-imat emplea una matriz de importancia (imatrix) para calibrar los pesos de baja precisión, mientras que la variante Q4_K_M-proj8 sustituye las 42 matrices `blk.*.proj.weight` por Q8_0 y deja los 678 tensores restantes byte-idénticos a la referencia Q4_K_M. Ambas variantes almacenan las tablas de tokens en Q6_K, lo que eleva el promedio de bits por peso por encima del formato nominal. No se realizó entrenamiento, calibración ni cuantización nueva para la publicación; la calibración imatrix es la existente.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento de un solo turno y multi-turno mediante plantilla de chat Jinja.
- Modo de razonamiento (thinking) activable o desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Ejecución local en CPU y GPU a través de llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No incluye visión ni audio: los pesos del codificador multimodal y del proyector se han omitido.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del modo thinking.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno con plantilla de chat Jinja en equipos sin GPU dedicada, gracias a un peso de unos 5 GB y a la compatibilidad con llama.cpp en CPU.
- Generación de texto en inglés y coreano: útil para aplicaciones bilingües de redacción, resumen o reescritura donde no se requiera multimodalidad.
- Prototipado rápido en portátiles: la variante IQ4_XS-imat ocupa 5,071 GB de descarga y permite iterar sobre prompts sin infraestructura cloud.
- Despliegue en entornos con memoria limitada: la variante Q4_K_M-proj8, con proyecciones en Q8_0, ofrece una fidelidad ligeramente superior al BF16 (86,22 % de acuerdo top-1) a cambio de 5,349 GB.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas de KL y acuerdo top-1 frente al BF16, útil para decidir qué variante desplegar en producción.
- Filtrado y clasificación de texto: tareas de etiquetado o moderación en inglés y coreano que no requieran contexto largo ni capacidades multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica únicamente una comprobación de fidelidad relativa frente al BF16 de referencia sobre 32 secuencias de 512 tokens (16.144 posiciones evaluadas) en inglés y coreano:

| Variante | KL media | Acuerdo top-1 con BF16 | KL / Q4_K_M | Aciertos / 33 | Rechecks / 7 | Pérdidas contadas |
|---|---:|---:|---:|---:|---:|---:|
| Q4_K_M referencia | 0,231174 | 80,23 % | 1,000× | 31/33 | 5/7 | 0 |
| IQ4_XS-imat | 0,101411 | 86,50 % | 0,439× | 31/33 | 5/7 | 0 |
| Q4_K_M-proj8 | 0,105274 | 86,22 % | 0,455× | 32/33 | 4/7 | 0 |

El autor no reporta velocidad de inferencia ni throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,33 GB solo para el mayor de los pesos GGUF, más espacio para la caché KV y los búferes de trabajo.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 8 GB de VRAM debería acomodar el peso más la caché KV para contextos moderados.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 4070), aunque el autor no lo confirma explícitamente.
- Opciones de despliegue: llama.cpp (versión verificada v0.9.0), con `llama-cli`; compatible con endpoints. No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma 4 E4B IT GGUF (Xylolabs) | 7,52 B | no disponible | en, ko | Apache 2.0 | GGUF | Solo texto; dos variantes de cuantización |
| Gemma 4 E4B IT (Google, BF16) | 7,52 B | no disponible | no disponible | Apache 2.0 | safetensors | Modelo original, multimodal completo |
| Gemma 4 E4B GGUF QAT Q4_0 (Google) | 8 B (según fuente) | no disponible | no disponible | Apache 2.0 | GGUF | Cuantización oficial QAT |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo solo texto: se han eliminado los pesos de visión y audio, por lo que no puede procesar imágenes ni audio.
- Idiomas limitados a inglés y coreano; no se documenta soporte de castellano.
- La evaluación publicada es una comprobación de fidelidad relativa frente al BF16, no una evaluación de tareas; el autor indica explícitamente que una integración debe realizar su propia evaluación de tareas.
- No se reportan velocidad ni throughput, lo que impide estimar latencia en producción.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos completos en `LICENSE` y `NOTICE`, que incluyen la atribución a Google/Google DeepMind y a la conversión/cuantización.
- El modelo se proporciona "as is", sin garantía ni respaldo del upstream.
- El ejemplo de uso limita el contexto a 2048 tokens; la longitud de contexto real del modelo base no se especifica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia oficial de Gemma: https://ai.google.dev/gemma/apache_2
- Documentación de llama.cpp para GGUF: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Página de descarga comunitaria de GGUF: https://gemma-4.net/download/gemma-4-e4b-gguf
- Referencia arXiv del modelo base: arxiv:2607.02770
