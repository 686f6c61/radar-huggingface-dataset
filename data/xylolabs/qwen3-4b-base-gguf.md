# Xylolabs/Qwen3-4B-Base-GGUF

## Resumen

Xylolabs/Qwen3-4B-Base-GGUF es una exportación cuantizada en formato GGUF del modelo base Qwen3-4B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica Xylolabs con el objetivo de servir como referencia reproducible para la cuantización Q4_K_M, empleando llama.cpp como herramienta de conversión. No se ha realizado entrenamiento, calibración ni cuantización nueva para la publicación: se trata de una conversión directa de los pesos BF16 originales.

El modelo es un decoder transformer de 36 capas con 4.022.468.096 parámetros totales (aproximadamente 4B), orientado a generación de texto en modo completion crudo, sin plantilla de chat ni modo de razonamiento. Es relevante porque proporciona una base verificable para comparar futuras cuantizaciones contra un baseline documentado, con métricas de divergencia (KL) y acuerdo top-1 frente a BF16.

La licencia Apache 2.0 del release original se preserva, lo que facilita uso comercial y modificación. El tamaño del repo es de 2,5 GB y el archivo GGUF principal requiere aproximadamente 2,49 GB de memoria para los pesos, más espacio adicional para KV cache y buffers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (36 capas), modelo base preentrenado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo usa 2.048 tokens; los metadatos originales se conservan sin cambios) |
| Tipos de cuantizacion | Q4_K_M (4,955 bits/peso promedio); tensores almacenados: F32 (145), Q4_K (216), Q6_K (37) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Base, un transformer decoder de 36 capas con embedding, cabeza de salida y tokenizer originales. La exportación GGUF conserva los 398 tensores del decoder, el embedding, la cabeza de salida, el tokenizer y los metadatos originales. No se realizó ningún entrenamiento, calibración ni cuantización nueva para esta publicación: es una conversión directa de los pesos BF16 a Q4_K_M mediante llama.cpp (versión v0.9.0 verificada en el ejemplo de carga).

La innovación técnica destacable de esta ficha no está en el modelo en sí, sino en el proceso de preservación y verificación: el autor documenta una comprobación de completion sobre 28 ítems (de un conjunto de 33, omitiendo cinco de formato instrucción), con prefijo de tres ejemplos en texto plano y presupuestos de generación greedy de 48 tokens (96 para código). Además, se evalúan ocho secuencias de texto crudo en inglés y coreano de 1.024 tokens, cubriendo 8.184 posiciones puntuadas. Los resultados indican que la cuantización Q4_K_M mantiene 28/28 respuestas correctas con una KL media de 0,047930 y un acuerdo top-1 del 89,65 % frente a BF16. No se dispone de información sobre la composición del dataset de entrenamiento original, número de tokens ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto en modo completion crudo (continuación de prompts de texto plano).
- Modelo base preentrenado: no está ajustado para instrucciones ni para conversación; requiere prompts de completion.
- Capacidades multilingües limitadas a inglés (en) y coreano (ko) según los metadatos del repositorio.
- No dispone de plantilla de chat ni de modo de razonamiento (thinking) en esta exportación.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni otras modalidades.
- Adecuado como base para fine-tuning posterior (dado que es un modelo base y no instruido).

## Casos de uso

- Evaluación de cuantizaciones: servir como baseline Q4_K_M de referencia para comparar nuevas propuestas de cuantización mediante KL y acuerdo top-1 frente a BF16, tal como documenta el autor.
- Completion de texto en pipelines de generación: integrar llama.cpp con prompts de texto plano para tareas de continuación, resumen o generación creativa controlada.
- Fine-tuning sobre modelo base: partir de los pesos cuantizados o del modelo base original para ajustar a dominios específicos (legal, médico, técnico) antes de desplegar.
- Prototipado local en hardware de consumo: al requerir aproximadamente 2,49 GB para los pesos, puede ejecutarse en GPU consumer con suficiente VRAM para KV cache y buffers.
- Generación de código asistida en entornos de desarrollo: el modelo base puede completar fragmentos de código a partir de firmas de función y docstrings, como se verifica en las pruebas de completion del autor.
- Investigación sobre fidelidad de cuantización: usar las métricas publicadas (KL media, top-1, pérdidas contadas) para estudiar el impacto de Q4_K_M en modelos de 4B.
- Despliegue en entornos con restricciones de memoria: al ser GGUF y compatible con llama.cpp, puede ejecutarse en CPU o GPU con presupuesto de memoria ajustado.
- Evaluación comparativa de modelos base multilingües: probar continuaciones en inglés y coreano para medir calidad en ambos idiomas.

## Benchmarks y rendimiento

| Referencia | KL media | Acuerdo top-1 con BF16 | Respuestas de completion correctas | Perdidas/rotas contadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100 % | 28/28 | — |
| Esta Q4_K_M | 0,047930 | 89,65 % | 28/28 | 0 |

Las pruebas cubren 28 de 33 ítems de completion (se omiten cinco de formato instrucción), con prefijo fijo de tres ejemplos en texto plano y presupuestos greedy de 48 tokens (96 para código). Las ocho secuencias de 1.024 tokens en inglés/coreano cubren 8.184 posiciones puntuadas. No se reportan métricas de velocidad (throughput o latencia) en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 2,49 GB para el archivo Q4_K_M; se requiere memoria adicional para KV cache y buffers de trabajo.
- Contexto de ejemplo: 2.048 tokens en la comprobación de carga; las comprobaciones GPU de llama.cpp usan contexto 8.192.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe en GPU consumer con VRAM suficiente (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) dejando margen para KV cache.
- Despliegue: llama.cpp (versión v0.9.0 verificada); compatible con el ecosistema GGUF (Ollama, llama-cpp-python, entre otros) aunque no se documenta explícitamente.
- Latencia y throughput: no reportados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3-4B-Base-GGUF (esta ficha) | 4,02B | no disponible | Apache 2.0 | GGUF Q4_K_M | Referencia cuantizada verificada con KL 0,047930 |
| Qwen/Qwen3-4B-Base | 4,02B | no disponible | Apache 2.0 | safetensors/BF16 | Modelo base original; sin cuantización |
| Otras cuantizaciones Qwen3-4B-Base | 4,02B | no disponible | Apache 2.0 | GGUF | No disponible en la información proporcionada |

No se dispone de datos de benchmarks estándar ni de comparativas de rendimiento con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones ni mantiene conversaciones; requiere prompts de completion crudos.
- Idiomas soportados limitados a inglés y coreano según los metadatos; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos base: las continuaciones pueden generar texto plausible pero incorrecto.
- La cuantización Q4_K_M introduce divergencia frente a BF16 (KL media 0,047930, acuerdo top-1 89,65 %), lo que puede afectar tareas sensibles a la precisión.
- No se documentan sesgos conocidos en la información proporcionada.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento; no asumir estas capacidades.
- La licencia Apache 2.0 permite uso comercial, pero se distribuye "as is", sin garantía ni endorsement del upstream.
- No se reportan métricas de velocidad; el rendimiento en producción debe medirse en el hardware objetivo.
- El contexto máximo no está confirmado en la información disponible; el ejemplo de carga usa 2.048 tokens y las comprobaciones GPU usan 8.192.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Paper técnico (arXiv): https://arxiv.org/abs/2505.09388
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completion de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Base-GGUF/blob/main/LICENSE
