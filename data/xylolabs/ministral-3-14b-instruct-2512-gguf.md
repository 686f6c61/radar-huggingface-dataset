# Xylolabs/Ministral-3-14B-Instruct-2512-GGUF

## Resumen

Ministral 3 14B Instruct 2512 es un modelo de lenguaje de Mistral AI, publicado en formato BF16 y distribuido aquí en una cuantización GGUF IQ4_XS con matriz de importancia (imatrix) preparada por Xylolabs. El modelo base cuenta con 13.506.073.600 parámetros y está diseñado para generación de texto conversacional, con soporte declarado de inglés y coreano. Esta exportación concreta es una referencia "text-only": conserva los 363 tensores de texto y las 40 capas del decodificador, pero elimina la torre de visión Pixtral y el proyector del modelo original.

El interés de esta ficha radica en que ofrece una alternativa de cuantización de 4 bits calibrada con imatrix, orientada a ejecución local con llama.cpp. El archivo pesa 7,411 GB y emplea un promedio de 4,385 bits por peso, con una mezcla de tipos de tensor (F32, IQ4_XS, Q5_K y Q6_K) que busca preservar la fidelidad respecto al BF16 original. Según la model card, la cuantización logra una divergencia KL media de 0,014940 frente al BF16 y un 93,67 % de acuerdo top-1, con 30 de 33 respuestas correctas en el conjunto de evaluación del autor.

Es relevante ahora porque permite desplegar un modelo de 14B en hardware de consumo con calidad cercana a la referencia Q4_K_M, manteniendo la licencia Apache 2.0 del release original de Mistral AI. No obstante, se trata de una conversión de terceros sin datos de benchmarks estándar publicados (MMLU, HumanEval, GSM8K), por lo que su evaluación debe hacerse por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Ministral 3 14B; 40 capas de decodificador) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (los metadatos originales se conservan; el ejemplo CLI usa 2.048 tokens y las comprobaciones GPU usan 8.192) |
| Tipos de cuantizacion | IQ4_XS con imatrix (mezcla: F32 x81, IQ4_XS x241, Q5_K x40, Q6_K x1); 4,385 bits/peso promedio |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 40 capas, derivado del release BF16 de Mistral AI `Ministral-3-14B-Instruct-2512-BF16`. El modelo original incluye una torre de visión Pixtral y un proyector multimodal, pero esta exportación los omite deliberadamente: solo conserva los tensores de texto, el embedding, la cabeza de salida, el tokenizador y la plantilla de chat. El resultado es un modelo estrictamente de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base; la model card de esta conversión no los detalla. La contribución técnica de esta ficha es la cuantización: se aplicó una matriz de importancia (imatrix) sobre el BF16 original, sin nuevo entrenamiento ni calibración adicional para la publicación. La evaluación del autor compara la fidelidad frente a BF16 usando divergencia KL, acuerdo top-1 y un conjunto de 33 prompts (más 7 de formato de razonamiento), sobre 16 secuencias emparejadas inglés/coreano de hasta 1.024 tokens (12.104 posiciones). El resultado reportado es KL media de 0,014940 (1,014× respecto a Q4_K_M) y 93,67 % de acuerdo top-1 con BF16.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y coreano.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de chat incluida).
- Aritmética básica y tareas de conocimiento general (evaluadas en el conjunto de 33 prompts del autor, p. ej. `en-arith-price`).
- Ejecución local con llama.cpp mediante el formato GGUF y la CLI `llama-cli`.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para servir el modelo.
- No soporta visión: la torre Pixtral y el proyector fueron eliminados en esta exportación.
- No se ha validado el modo "thinking" o razonamiento extendido: el autor reporta 0/7 en las comprobaciones de formato de razonamiento, consideradas no aplicables a este modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés o coreano: el modelo puede gestionar diálogos multi-turno con la plantilla de chat incluida, ejecutándose en una GPU de consumo gracias a sus 7,4 GB de pesos en IQ4_XS.
- Prototipado y evaluación de cuantizaciones: sirve como referencia para comparar la fidelidad de IQ4_XS con imatrix frente a Q4_K_M y Q8_0 en tareas propias, usando las métricas KL y top-1 del autor como punto de partida.
- Generación de texto en pipelines de CI o scripts: la CLI de llama.cpp permite integrarlo en flujos automatizados con `--temp 0` para respuestas deterministas en tareas de extracción o clasificación simple.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` indica que puede servirse detrás de una API compatible, útil para entornos de desarrollo sin infraestructura GPU dedicada de gran tamaño.
- Procesamiento de texto en coreano: al declarar soporte de `ko`, puede emplearse en tareas de resumen o generación en ese idioma, aunque la evaluación del autor se limita a un conjunto reducido de secuencias.
- Educación y experimentación: adecuado para entornos docentes o de investigación que necesiten un modelo de 14B ejecutable en hardware modesto, con licencia Apache 2.0 que facilita su uso y modificación.
- Sustitución de modelos mayores en tareas acotadas: para generación de respuestas cortas o reescritura de texto donde no se requiera visión ni contexto extremadamente largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de fidelidad de cuantización frente al BF16:

| Metrica | Q4_K_M (referencia) | IQ4_XS-imat |
|---|---:|---:|
| KL media | 0,014735 | 0,014940 |
| Acuerdo top-1 con BF16 | 93,89 % | 93,67 % |
| Ratio KL / Q4 | 1,000× | 1,014× |
| Respuestas correctas | 29/33 | 30/33 |
| Perdidas contabilizadas / rotas | 0 | 0 |

El conjunto de evaluación consta de 16 secuencias emparejadas inglés/coreano de hasta 1.024 tokens (12.104 posiciones) y 33 prompts más 7 de formato de razonamiento. El autor indica que BF16, Q4 e IQ4_XS obtienen 0/7 en las comprobaciones de formato de razonamiento, consideradas no aplicables. No se reportan métricas de velocidad ni throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,40 GB solo para los pesos GGUF de texto, más espacio para la caché KV y buffers de trabajo.
- Con contexto de 2.048 tokens (ejemplo de la CLI) el consumo adicional de KV es moderado; con 8.192 tokens (usado en las comprobaciones GPU del autor) aumenta de forma proporcional.
- GPU recomendadas: no especificadas por el autor; por tamaño, encaja en GPUs de consumo con 12 GB o más de VRAM (p. ej. RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de datacenter (A100, H100) con holgura.
- Cabe en GPU de consumo: sí, siempre que se disponga de al menos ~8-10 GB de VRAM considerando caché KV y buffers; con contexto largo se recomienda 12 GB o más.
- Opciones de despliegue: llama.cpp (probado con v0.9.0 según el autor), y por extensión cualquier frontend compatible con GGUF (p. ej. Ollama o servidores basados en llama.cpp); no se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no reportados por el autor ("Speed is not reported here").

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs Ministral-3-14B-Instruct-2512 IQ4_XS-imat | 13,5B | no disponible | IQ4_XS imatrix (7,411 GB) | Apache 2.0 | Hugging Face (Xylolabs) |
| Mistral AI Ministral-3-14B-Instruct-2512 GGUF | 13,5B | no disponible | Q4_K_M, Q5_K_M, Q8_0 | Apache 2.0 | Hugging Face (mistralai) |
| mradermacher Ministral-3-14B-Instruct-2512-BF16-GGUF | 13,5B | no disponible | IQ4_XS simple, Q2_K, Q3_K_M, Q6_K | Apache 2.0 | Hugging Face (mradermacher) |

Las tres opciones comparten los mismos 363 tensores con nombre y el mismo modelo base; la diferencia está en el esquema de cuantización y en la calibración imatrix de esta ficha. El autor verifica que los siete formatos públicos coinciden en todos los valores de tensor y hashes LFS.

## Limitaciones y advertencias

- Modelo solo de texto: la torre de visión Pixtral y el proyector fueron eliminados; no puede procesar imágenes.
- Idiomas limitados a inglés y coreano según la model card; el rendimiento en otros idiomas no está evaluado.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K); la evaluación del autor se limita a 33 prompts y métricas de fidelidad de cuantización.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- El conjunto de evaluación es reducido (12.104 posiciones, 16 secuencias), por lo que las métricas KL y top-1 no garantizan el comportamiento en tareas arbitrarias.
- El modo "thinking" o razonamiento extendido no es aplicable según el autor (0/7 en las comprobaciones de formato).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantía ni respaldo del upstream; se recomienda citar el release BF16 original de Mistral AI.
- La cuantización IQ4_XS con imatrix puede degradar tareas sensibles a precisión; el autor recomienda evaluar la tarea concreta antes de integrar en producción.
- El tokenizador conserva una advertencia de regex del upstream; conviene revisarla si se procesan entradas no ASCII.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-GGUF
- Modelo base BF16: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- GGUF oficial de Mistral AI: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/Ministral-3-14B-Instruct-2512-BF16-GGUF
- Repositorio de código de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- llama.cpp (build referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
