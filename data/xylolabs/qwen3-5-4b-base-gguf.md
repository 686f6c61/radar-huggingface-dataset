# Xylolabs/Qwen3.5-4B-Base-GGUF

## Resumen

Qwen3.5-4B-Base-GGUF es una cuantización en formato GGUF del modelo base Qwen3.5-4B-Base, publicada por Xylolabs. Se trata de un modelo de lenguaje de tipo transformer, preentrenado (no afinado por instrucciones ni por chat), con 4.326.350.848 parámetros totales y una licencia Apache 2.0. El repositorio contiene un único archivo en cuantización mixta Q4_K_M pensado para su uso con llama.cpp.

El modelo no incorpora nuevos entrenamientos, calibraciones ni procesos de cuantización propios: es una exportación de referencia que preserva los 441 tensores del modelo original, incluido el decodificador de texto de 32 capas, embeddings, cabeza de salida y un bloque MTP (multi-token prediction) almacenado. La publicación está orientada a servir como línea base reproducible para comparar futuras cuantizaciones mediante métricas de divergencia (KL) y acuerdos top-1 frente al BF16 original.

Su relevancia es doble: por un lado, ofrece una vía práctica para ejecutar un modelo de 4B parámetros en hardware de consumo con un peso de solo 2,783 GB; por otro, su enfoque de evaluación (verificación de completaciones y divergencia frente al modelo original) resulta útil para quien necesite validar cuantizaciones en producción. Está etiquetado para inglés y coreano, y al ser un modelo base no incluye plantilla de chat ni modo de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decodificador de 32 capas, con bloque MTP) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion (la metadata original se conserva sin cambios; el ejemplo usa 2.048 tokens) |
| Tipos de cuantizacion | Q4_K_M (mixta: F32 184 tensores, Q4_K 222, Q6_K 35; 5,127 bits/peso de media) |
| Idiomas soportados | Ingles, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer preentrenado de 4B parámetros con un decodificador de texto de 32 capas, embeddings, cabeza de salida y un bloque MTP (multi-token prediction) de 15 tensores. El archivo GGUF conserva los 441 tensores originales, con `block_count` de 33 y `nextn_predict_layers` igual a uno. La visión y su proyector se omiten en esta exportación, por lo que el modelo resultante es exclusivamente de texto. No se realizó entrenamiento, calibración ni cuantización nueva para esta publicación: es una conversión directa del BF16 original mediante llama.cpp.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base original empleó RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya etapas de alineación conversacional, aunque este dato no se confirma en la información proporcionada. La innovación técnica destacable de esta publicación es metodológica: conserva el fingerprint completo de calibración/evaluación y el identificador de teacher, de modo que la cuantización puede compararse de forma exacta contra el BF16 almacenado.

## Capacidades

- Generación de texto por continuación de prompt (modelo base, sin plantilla de chat).
- Razonamiento y conocimiento general en inglés y coreano.
- Generación de código: la evaluación original incluye ítems de código con firma de función y docstring, con presupuesto de generación de 96 tokens.
- Completación de texto libre con instrucciones de parada (stop IDs) configurables.
- No soporta tool calling ni function calling de forma nativa (modelo base sin afinado de instrucciones).
- No soporta agentes ni razonamiento multi-paso estructurado.
- No incluye modo de pensamiento (thinking) ni capacidades de visión en esta exportación.
- Multilingüe limitado a inglés y coreano según los metadatos declarados.

## Casos de uso

- Evaluación de cuantizaciones: sirve como línea base Q4_K_M para comparar candidatas mediante KL y acuerdos top-1 frente al BF16, gracias a que conserva el fingerprint de evaluación original.
- Generación de texto en local con llama.cpp: con 2,77 GB de pesos, se puede ejecutar en portátiles y equipos de sobremesa para tareas de completación de texto sin conexión.
- Prototipado de pipelines de NLP: al ser un modelo base, es adecuado para experimentos de continuación, extracción y clasificación mediante prompting en bruto.
- Fine-tuning posterior: al estar bajo Apache 2.0 y conservar la arquitectura original, puede servir como punto de partida para ajustes específicos de dominio en inglés o coreano.
- Investigación sobre decodificación especulativa y MTP: el bloque MTP preservado permite estudiar estrategias de predicción multi-token en un modelo de 4B.
- Servicio de completación en entornos con recursos limitados: integrable en herramientas de autocompletado o asistentes de texto donde no se requiere formato conversacional.
- Validación de exportaciones GGUF: útil como referencia para verificar que nuevas conversiones mantienen la fidelidad respecto al modelo original.

## Benchmarks y rendimiento

| Referencia | KL medio | Acuerdo top-1 con BF16 | Completaciones correctas | Perdidas/rotas contadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100% | 27/28 | — |
| Este Q4_K_M | 0,029286 | 91,12% | 27/28 | 0 |

La evaluación se realizó sobre 28 de los 33 ítems de la política original del modelo base (se omiten cinco ítems de formato de instrucciones), con un prefijo fijo de tres ejemplos en texto plano y presupuestos de generación greedy de 48 tokens (96 para código). Las secuencias de calibración cubren cuatro textos en bruto de 2.048 tokens en inglés y coreano, con 8.188 posiciones puntuadas. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,77 GB solo para los pesos GGUF, más espacio para la caché KV y buffers de trabajo.
- GPU recomendadas: no se especifican en la información; por tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como en A100 o H100 para despliegues multi-instancia.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más, dependiendo de la longitud de contexto.
- Opciones de despliegue: llama.cpp (verificado con v0.9.0 y el binario `llama-completion`); otras herramientas compatibles con GGUF no se mencionan explícitamente.
- Latencia y throughput: no reportados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-GGUF | 4,33B | No disponible | Q4_K_M GGUF | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4,33B | No disponible | BF16 (original) | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GGUF del mismo base | 4,33B | No disponible | Variables | Apache 2.0 | No disponible en la informacion |

La comparativa se limita al modelo original y a esta exportación, ya que no se proporcionan datos de modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base: no está afinado para seguir instrucciones ni para formato conversacional; requiere prompts de continuación de texto.
- Riesgo de alucinación inherente a los modelos de lenguaje preentrenados, sin mitigaciones de alineación documentadas.
- Idiomas limitados a inglés y coreano según los metadatos; el rendimiento en castellano no está garantizado ni evaluado.
- La exportación omite visión y su proyector, por lo que no admite entradas de imagen.
- La longitud de contexto efectiva no se documenta; el ejemplo verificado usa 2.048 tokens y las comprobaciones en GPU usan 8.192.
- No se reportan métricas de velocidad, latencia ni throughput, lo que dificulta estimar el rendimiento en producción.
- La licencia Apache 2.0 permite uso comercial, pero se distribuye "tal cual", sin garantía ni aval del autor original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completación de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
- Repositorio de assets de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
