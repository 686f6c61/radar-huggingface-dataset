# tm13911391/simorgh-model

## Resumen

Simorgh (سیمرغ) es un modelo de lenguaje en persa desarrollado íntegramente desde cero por Taymaz Jalili. A diferencia de la mayoría de modelos publicados, no parte de pesos preentrenados ni utiliza APIs externas: incluye su propio tokenizador BPE a nivel de byte, su propia implementación de transformer decoder-only en PyTorch y su propio proceso de preentrenamiento y ajuste conversacional. El repositorio aloja la exportación ONNX del modelo, pensada para ejecutarse directamente en el navegador mediante onnxruntime-web (WebAssembly, con WebGPU opcional).

Se trata de un modelo de investigación de tamano muy reducido: 9,6 millones de parámetros, 6 capas, dimensión 288, 6 cabezas de atención, contexto de 256 tokens y vocabulario de 12.000 entradas. Su relevancia radica en el carácter didáctico y experimental del proyecto (pipeline completo construido desde cero para un idioma con poca cobertura de modelos abiertos) y en su despliegue en el cliente, sin servidor ni coste de inferencia.

La licencia Apache-2.0 permite uso comercial, pero las capacidades reales del modelo son muy limitadas: el propio autor advierte de que se equivoca con frecuencia y no debe usarse como fuente de hechos. En la aplicación web, las preguntas factuales se responden citando un pasaje de Wikipedia en persa cuando la búsqueda web está activada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) en PyTorch, exportado a ONNX (opset 17) |
| Parametros totales | 9,6 M (6 capas, d = 288, 6 cabezas, vocabulario 12.000) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | int8 dinamico (pesos) y fp32 |
| Idiomas soportados | persa (fa) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` fp32, `model_int8.onnx` int8), tokenizador en `tokenizer.json` (formato Hugging Face `tokenizers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con pre-norm, normalización RMSNorm, embeddings posicionales rotatorios (RoPE intercalado, θ = 10000), feed-forward con activación SwiGLU sin sesgos y embeddings de entrada y salida compartidos. El tokenizador es un BPE a nivel de byte con normalización NFKC, entrenado exclusivamente con texto persa. La exportación ONNX incluye caché KV con la siguiente interfaz: entrada `input_ids` int64 `[1, T]` y `past_kv` float32 `[L, 2, 1, H, P, head_dim]` (P = 0 en la primera llamada); salidas `logits` float32 `[1, vocab]` (última posición) y `present_kv` `[L, 2, 1, H, P+T, head_dim]`.

El preentrenamiento se realizó sobre Wikipedia en persa (`wikimedia/wikipedia`, `20231101.fa`). El ajuste conversacional se hizo con el subconjunto persa de Bactrian-X (`MBZUAI/Bactrian-X`, unos 67.000 pares instrucción/respuesta) y con alpaca-persian (`sinarashidi/alpaca-persian`, unas 35.000 conversaciones). No se menciona en la información disponible el uso de RLHF ni DPO. El autor publica una verificación de la exportación: diferencia máxima de logits ONNX frente a PyTorch de 3,8e-06, decodificación greedy con caché KV idéntica y perplexidad en un párrafo persa reservado de 261,06 (fp32) frente a 260,11 (int8).

## Capacidades

- Generación de texto en persa con formato de prompt específico: `<|bos|><|user|>pregunta<|context|>pasaje web opcional<|assistant|>`, con parada en `<|end|>`.
- Conversación multi-turno mediante el ajuste sobre Bactrian-X y alpaca-persian.
- Respuesta condicionada a un pasaje de contexto (el segmento `<|context|>` permite inyectar texto de referencia, por ejemplo de Wikipedia).
- Muestreo configurable: temperatura 0,7, top-k 40, top-p 0,9 y penalización de repetición 1,15 sobre los últimos 128 tokens.
- Inferencia en el navegador con onnxruntime-web (WebAssembly y WebGPU opcional).
- No dispone de tool calling ni function calling, ni de modo de razonamiento extendido, visión o audio según la información disponible.
- Capacidad multilingüe limitada al persa.

## Casos de uso

- Demostración educativa de un pipeline completo de LLM: sirve para ilustrar tokenizador, arquitectura, preentrenamiento y ajuste conversacional en un modelo que cabe en el navegador y cuyo código y pesos son reproducibles.
- Inferencia en el cliente sin servidor: la exportación int8 y fp32 permite ejecutar generación de texto en el navegador del visitante con onnxruntime-web, sin coste de GPU en servidor ni envío de datos a terceros.
- Respuesta aumentada con contexto: el segmento `<|context|>` del formato de prompt permite inyectar un pasaje de Wikipedia en persa y generar una respuesta basada en él, como hace la aplicación web con la búsqueda activada.
- Prototipado rápido de interfaces conversacionales en persa: útil para validar flujos de UI y formato de prompt antes de migrar a un modelo mayor.
- Experimentación académica con modelos de muy bajo coste: punto de partida para estudiar el efecto del tamano, la tokenización y la cuantización int8 en un idioma con poca cobertura.
- Filtrado o generación de texto persa a muy baja latencia en entornos con recursos restringidos (dispositivos sin GPU), dado el reducido tamano del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos de evaluación publicados son los de verificación de la exportación: diferencia máxima de logits ONNX frente a PyTorch de 3,8e-06, decodificación greedy idéntica con caché KV y perplexidad de 261,06 (fp32) frente a 260,11 (int8) en un párrafo persa reservado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB tanto en fp32 como en int8, dado el tamano de 9,6 M de parámetros y el repositorio de 0,1 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobradamente suficiente, y la ruta WebGPU está prevista para navegadores compatibles.
- Cabe en cualquier GPU consumer y en CPU; también en el navegador mediante WebAssembly.
- Opciones de despliegue: onnxruntime-web (WebAssembly y WebGPU opcional) para navegador; ONNX Runtime para servidor o escritorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Simorgh | 9,6 M | 256 | Persa | Apache-2.0 | ONNX | Desde cero, inferencia en navegador |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de investigación de muy baja capacidad: el autor indica explícitamente que se equivoca con frecuencia y que no debe usarse como fuente de hechos.
- Riesgo elevado de alucinación en preguntas factuales; la aplicación web mitiga esto citando pasajes de Wikipedia cuando la búsqueda está activada.
- Contexto muy corto (256 tokens), lo que limita conversaciones largas y documentos extensos.
- Solo soporta persa; no se documenta cobertura de otros idiomas.
- Sesgos potenciales derivados de los datos de entrenamiento (Wikipedia en persa, Bactrian-X y alpaca-persian), no cuantificados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantías de calidad ni de exactitud.
- El formato de prompt es específico y debe respetarse; no se documenta compatibilidad con plantillas de chat estándar.
- No dispone de tool calling, agentes ni razonamiento multi-paso según la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tm13911391/simorgh-model
- Demo (Space): https://huggingface.co/spaces/tm13911391/simorgh
- Dataset de preentrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset de ajuste conversacional: https://huggingface.co/datasets/MBZUAI/Bactrian-X
- Dataset de ajuste conversacional: https://huggingface.co/datasets/sinarashidi/alpaca-persian
