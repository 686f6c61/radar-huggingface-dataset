# Xylolabs/Mistral-7B-Instruct-v0.3-GGUF

## Resumen

Mistral-7B-Instruct-v0.3-GGUF es una redistribución cuantizada del modelo Mistral 7B Instruct v0.3 de Mistral AI, publicada por Xylolabs. No se trata de un modelo nuevo ni de un reentrenamiento: el autor ha convertido los pesos originales a formato GGUF mediante llama.cpp y ofrece cuatro variantes de cuantización (Q4_K_M, IQ4_XS, IQ4_XS con importance matrix y Q5_K_M). El modelo base es un transformer decoder-only de 7.248.023.552 parámetros, con licencia Apache 2.0 y capacidad de generación de texto conversacional.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 7B en hardware de consumo mediante llama.cpp, con archivos de entre 3.9 y 5.1 GB. El autor documenta una evaluación de fidelidad respecto a los logits BF16 originales, con métricas de divergencia KL y una batería de 33 preguntas, lo que aporta trazabilidad sobre la pérdida de calidad introducida por cada cuantización.

El modelo base Mistral 7B Instruct v0.3 incorpora ventana de contexto de 32.768 tokens, soporte de tool calling y tokenizador con vocabulario ampliado respecto a versiones anteriores. Esta exportación conserva los 291 tensores del modelo de lenguaje, el tokenizador y la plantilla de chat original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral 7B Instruct v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (metadatos originales del modelo base; el ejemplo de llama-cli usa 2.048) |
| Tipos de cuantizacion | Q4_K_M, IQ4_XS, IQ4_XS-imat, Q5_K_M |
| Idiomas soportados | en, ko (declarados en la model card de esta exportación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de los archivos publicados:

| Archivo | Descarga (GB) | Bits medios por peso |
|---|---:|---:|
| `Mistral-7B-Instruct-v0.3-Q4_K_M.gguf` | 4.373 | 4.826 |
| `Mistral-7B-Instruct-v0.3-IQ4_XS.gguf` | 3.949 | 4.357 |
| `Mistral-7B-Instruct-v0.3-IQ4_XS-imat.gguf` | 3.912 | 4.317 |
| `Mistral-7B-Instruct-v0.3-Q5_K_M.gguf` | 5.136 | 5.668 |

Composición de tipos de tensor por variante:

| Variante | Tipos y recuentos |
|---|---|
| Q4_K_M | F32: 65, Q4_K: 193, Q6_K: 33 |
| IQ4_XS | F32: 65, IQ4_XS: 189, Q5_K: 36, Q6_K: 1 |
| IQ4_XS-imat | F32: 65, IQ4_XS: 193, Q5_K: 32, Q6_K: 1 |
| Q5_K_M | F32: 65, Q5_K: 193, Q6_K: 33 |

## Arquitectura y entrenamiento

Esta publicación no entrena ni ajusta el modelo: es una conversión y cuantización de `mistralai/Mistral-7B-Instruct-v0.3` realizada con llama.cpp. La model card indica explícitamente que no se realizó entrenamiento, calibración ni cuantización nuevos para la publicación; la variante `-imat` preserva el resultado de una importance matrix existente, y los nombres de archivo de calibración históricos son solo etiquetas de metadatos sin datos de calibración incluidos.

El modelo base es un transformer decoder-only denso de aproximadamente 7.200 millones de parámetros, afinado por instrucciones por Mistral AI. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo original; esos datos deben consultarse en la model card de Mistral AI. La exportación conserva los 291 tensores del modelo de lenguaje, el tokenizador y la plantilla de chat original.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat original preservada.
- Respuesta a instrucciones directas (el ejemplo de la model card resuelve una pregunta factual simple).
- Soporte de tool calling y function calling heredado del modelo base v0.3.
- Capacidades multilingües limitadas a los idiomas declarados: inglés y coreano.
- Ejecución local en CPU y GPU mediante llama.cpp, sin dependencias de servicios en la nube.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo sin GPU dedicada: con el archivo IQ4_XS (3.9 GB) el modelo puede ejecutarse en CPU con llama.cpp, adecuado para prototipos y entornos con requisitos de privacidad.
- Generación de texto en aplicaciones de escritorio o embebidas: el formato GGUF y el tamaño contenido permiten integrar el modelo en herramientas de escritorio con llama.cpp como backend.
- Clasificación y extracción de información en inglés: el modelo responde a instrucciones directas, útil para tareas de etiquetado y resumen en pipelines por lotes.
- Soporte de conversaciones en coreano: al declarar `ko` entre sus idiomas, puede emplearse en asistentes para ese idioma, aunque sin garantías de calidad más allá de lo declarado.
- Evaluación comparativa de cuantizaciones: los cuatro archivos permiten medir el impacto de Q4_K_M, IQ4_XS y Q5_K_M en una misma tarea antes de fijar una variante en producción.
- Base para ajuste fino con LoRA sobre el modelo original: al derivar de Mistral 7B Instruct v0.3 con licencia Apache 2.0, sirve como referencia para comparar adaptaciones.
- Pruebas de integración con tool calling en entornos controlados: el modelo base soporta function calling, aunque esta exportación no incluye evaluación específica de esa capacidad.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye una evaluación de fidelidad de las cuantizaciones frente a los logits BF16 almacenados:

| Variante | KL media | KL / Q4_K_M | Aciertos | Pérdidas contadas | Respuestas rotas |
|---|---:|---:|---:|---:|---:|
| Q4_K_M | 0.022421 | 1.000× | 24/33 | 0 | 0 |
| IQ4_XS | 0.029122 | 1.299× | 24/33 | 1 | 0 |
| IQ4_XS-imat | 0.022652 | 1.010× | 25/33 | 0 | 1 |
| Q5_K_M | 0.007889 | 0.352× | 24/33 | 1 | 0 |

La referencia BF16 responde 25/33. La evaluación usa 16 secuencias emparejadas de 1.024 tokens (16.288 posiciones puntuadas) en grupos de texto plano y chat en inglés y coreano, con contexto de 8.192 tokens. Todas las variantes quedan por debajo de 1,5× de divergencia KL respecto a Q4_K_M. Las siete comprobaciones de razonamiento dan 0/7 tanto en BF16 como en las cuatro variantes, por lo que no discriminan entre cuantizaciones. La model card no reporta velocidad ni throughput.

## Requisitos de hardware

- Memoria para pesos: 3,9 GB (IQ4_XS-imat), 3,95 GB (IQ4_XS), 4,37 GB (Q4_K_M) y 5,14 GB (Q5_K_M), según el tamaño de descarga indicado.
- La model card advierte que el mayor archivo necesita aproximadamente 5,14 GB de memoria de dispositivo solo para los pesos, más espacio para la caché KV y buffers.
- GPU de consumo: las cuatro variantes caben en GPUs con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070 y superiores), dejando margen para caché KV a contextos moderados.
- GPU profesionales: A100, H100 y L40S pueden alojar el modelo con contextos largos y mayor paralelismo, aunque el tamaño no las hace necesarias.
- Despliegue: llama.cpp (llama-cli, llama-server) es el backend documentado; la compatibilidad con vLLM, Ollama o TGI no se detalla en la información disponible, aunque el formato GGUF es consumible por Ollama y llama.cpp.
- El ejemplo de la model card usa `-c 2048 -n 32 --temp 0 --jinja --single-turn` y está verificado con llama.cpp v0.9.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Mistral-7B-Instruct-v0.3-GGUF (Xylolabs) | 7.248 M | 32.768 | Apache 2.0 | GGUF | Cuatro cuantizaciones con evaluación KL |
| Mistral-7B-Instruct-v0.3 (original) | 7.248 M | 32.768 | Apache 2.0 | safetensors | Pesos BF16, requiere conversión para llama.cpp |
| Mistral-7B-Instruct-v0.2 | no disponible en la información | no disponible | Apache 2.0 | safetensors | Versión anterior del modelo base |
| Llama 3.1 8B Instruct | no disponible en la información | no disponible | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamaño similar con licencia distinta |

La información proporcionada no incluye datos de rendimiento comparativo entre estos modelos; la comparativa se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo base de 7B con conocimiento limitado: puede alucinar hechos, cifras y citas, especialmente en dominios especializados.
- Idiomas declarados solo inglés y coreano; el rendimiento en castellano no está garantizado ni evaluado.
- La evaluación de fidelidad de las cuantizaciones es reducida (33 preguntas, 16 secuencias) y no sustituye una evaluación de tarea; la propia model card advierte que una integración requiere su propia evaluación.
- El archivo IQ4_XS-imat produce una respuesta rota en `en-arith-price`; IQ4_XS pierde `ko-explain-sky`; Q5_K_M pierde `en-instr-lines`.
- Las siete comprobaciones de razonamiento puntúan 0/7 en todas las variantes, incluida BF16, lo que sugiere debilidad del modelo base en tareas de razonamiento multietapa.
- Licencia Apache 2.0 permite uso comercial, pero la model card se distribuye "as is", sin garantía ni aval del upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El contexto de 32.768 tokens pertenece a los metadatos del modelo base; el ejemplo documentado usa 2.048 tokens y la evaluación usa 8.192, por lo que el comportamiento a contexto completo no está verificado.
- No se reportan velocidades ni latencias, lo que impide estimar costes de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación de GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
