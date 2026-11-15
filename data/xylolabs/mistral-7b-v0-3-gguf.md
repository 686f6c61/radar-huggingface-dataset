# Xylolabs/Mistral-7B-v0.3-GGUF

## Resumen

Mistral-7B-v0.3-GGUF es una exportación cuantizada en formato GGUF del modelo base Mistral 7B v0.3, publicada por Xylolabs mediante llama.cpp. No se trata de un modelo nuevo ni de un ajuste fino: es una preservación del checkpoint original de Mistral AI en cuantización Q4_K_M, pensada para inferencia local con llama.cpp y otros runtimes compatibles con GGUF. El modelo subyacente es un transformer decoder de 32 capas con 7.248.023.552 parámetros totales y una longitud de contexto de 32.768 tokens (heredada del release original de Mistral v0.3).

La relevancia de esta ficha es doble. Por un lado, documenta una cuantización de referencia con métricas de fidelidad publicadas (KL medio de 0,012849 y 94,05% de acuerdo top-1 con BF16), lo que permite evaluar la pérdida introducida por la cuantización. Por otro, advierte de que se trata de un modelo base sin alineamiento: no incluye plantilla de chat ni ajuste por instrucciones, por lo que su uso requiere prompts de completado de texto en crudo.

El repositorio ocupa 4,4 GB y contiene un único archivo GGUF de 4,373 GB. La licencia declarada es Apache 2.0, heredada del release de Mistral. El modelo está etiquetado para inglés y coreano, aunque el entrenamiento original de Mistral 7B v0.3 no está documentado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (32 capas), modelo base |
| Parámetros totales | 7.248.023.552 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (metadatos originales de Mistral v0.3); el ejemplo de llama.cpp usa 2.048 y las comprobaciones GPU usan 8.192 |
| Tipos de cuantización | Q4_K_M (F32: 65 tensores, Q4_K: 193, Q6_K: 33; media de 4,826 bits por peso) |
| Idiomas soportados | en, ko (según etiquetas del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral 7B v0.3, un transformer decoder denso de 32 capas con 7.248.023.552 parámetros. Esta exportación conserva los 291 tensores del decoder de texto, incluyendo embeddings, cabeza de salida, tokenizador y metadatos originales. No se realizó entrenamiento, calibración ni cuantización nueva para la publicación: el archivo es una conversión directa del checkpoint BF16 original a GGUF Q4_K_M mediante llama.cpp (commit cd959bae99ff4bed22bef2604f45241c09bbb8c8).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el release original de Mistral v0.3 dentro de la información proporcionada. Al ser un modelo base, no incorpora plantilla de chat ni modo de razonamiento. La innovación técnica destacable de esta publicación es la documentación de fidelidad de la cuantización: comparación KL contra BF16, acuerdo top-1 y verificación de respuestas de completado sobre un conjunto fijo de 28 ítems (de 33, omitiendo cinco de formato de instrucciones).

## Capacidades

- Generación de texto por completado en crudo (raw completion); no está ajustado para seguir instrucciones ni para formato conversacional.
- Razonamiento y conocimiento general heredados del modelo base Mistral 7B v0.3.
- Generación de código en modo completado (el conjunto de evaluación incluye ítems de código con firma de función y docstring).
- Capacidades multilingües limitadas a las etiquetas declaradas: inglés y coreano.
- No soporta tool calling ni function calling de forma nativa (modelo base sin alineamiento).
- No soporta agentes ni razonamiento multi-paso estructurado de forma nativa.
- No dispone de modo thinking, visión ni audio.
- Compatible con endpoints de inferencia que acepten GGUF (etiqueta `endpoints_compatible`).

## Casos de uso

- Completado de texto en local para prototipado: el modelo continúa prompts de texto en crudo con llama.cpp, adecuado para experimentar con generación base sin depender de servicios externos, gracias a sus 4,37 GB de pesos que caben en GPU de consumo.
- Evaluación de cuantizaciones: sirve como referencia Q4_K_M con métricas KL y acuerdo top-1 publicadas, útil para comparar candidatos de cuantización contra una línea base documentada.
- Generación de código en modo autocompletado: el conjunto de evaluación incluye ítems de código con firma de función y docstring, por lo que puede usarse en tareas de continuación de código dentro de editores o scripts.
- Investigación en fidelidad de cuantización: los datos de KL medio (0,012849) y acuerdo top-1 (94,05%) permiten estudiar el impacto de Q4_K_M frente a BF16 en un modelo de 7B.
- Procesamiento de texto en inglés y coreano: las etiquetas de idioma permiten su uso en tareas de completado en ambos idiomas, aunque sin garantías de calidad más allá de lo declarado por el autor.
- Despliegue en entornos con memoria limitada: con 4,37 GB de pesos más KV cache y buffers, es viable en GPUs de consumo para inferencia de completado con contexto moderado (el ejemplo usa 2.048 tokens).

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de la cuantización frente al BF16 almacenado, no benchmarks de capacidad del modelo (MMLU, HumanEval, GSM8K, etc.).

| Referencia | KL medio | Acuerdo top-1 con BF16 | Respuestas de completado correctas | Perdidas/rotas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100% | 20/28 | — |
| Este Q4_K_M | 0,012849 | 94,05% | 20/28 | 0 |

La evaluación usa 28 de 33 ítems (omite cinco de formato de instrucciones), con prefijo fijo de tres ejemplos en texto plano, presupuesto greedy de 48 tokens (96 para código) y stop ID original. Las comprobaciones de texto en crudo cubren ocho secuencias de 1.024 tokens en inglés y coreano, con 8.184 posiciones puntuadas. No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,37 GB solo para los pesos GGUF, más espacio para KV cache y buffers de trabajo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para contexto moderado; las comprobaciones GPU de llama.cpp usan contexto 8.192, lo que incrementa el requisito de KV cache.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060/4060 Ti, RTX 3070/4070) para contextos moderados; con contexto completo de 32.768 tokens el KV cache crece considerablemente.
- Opciones de despliegue: llama.cpp (verificado con v0.9.0), y cualquier runtime compatible con GGUF; el autor no documenta otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no se reportan en la información disponible; el autor indica explícitamente que la velocidad no se informa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---:|---:|---|---|---|
| Xylolabs/Mistral-7B-v0.3-GGUF (este) | 7.248.023.552 | 32.768 | GGUF Q4_K_M | Apache 2.0 | Modelo base, cuantización de referencia con métricas KL publicadas |
| mistralai/Mistral-7B-v0.3 (original) | 7.248.023.552 | 32.768 | safetensors BF16 | Apache 2.0 | Modelo base sin cuantizar; mayor precisión, mayor requisito de memoria |
| Otras cuantizaciones GGUF de Mistral 7B v0.3 | 7.248.023.552 | 32.768 | GGUF (varios Q) | Apache 2.0 | No disponible en la información proporcionada; no se dispone de comparación de métricas |

No se dispone de datos de benchmarks de capacidad para comparar el rendimiento frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones ni mantiene formato conversacional; requiere prompts de completado en crudo.
- Riesgo de alucinación inherente a un modelo base de 7B sin ajuste por instrucciones ni RLHF documentado.
- Idiomas declarados limitados a inglés y coreano; no hay garantías para otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantía ni respaldo del release original de Mistral; el archivo LICENSE contiene el texto estándar Apache 2.0 y NOTICE identifica la fuente y modificaciones.
- El modelo base original no incluye archivo de licencia raíz según el autor; la licencia se hereda del release fijado de Mistral.
- Las métricas de fidelidad cubren textos y prompts retenidos; una integración en producción requiere su propia evaluación de tarea.
- No se reportan datos de velocidad, latencia ni throughput, por lo que el rendimiento en producción debe medirse empíricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Repositorio llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completado de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Licencia Apache 2.0 del repositorio: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-GGUF/blob/main/LICENSE
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
