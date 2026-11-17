# xv0y5ncu/Gemma-4-E4B-it-GLQ-4bpw

## Resumen

Gemma-4-E4B-it-GLQ-4bpw es una cuantización de 4 bits por peso (4,0 bpw uniforme) del modelo instructivo google/gemma-4-E4B-it, publicada por el usuario xv0y5ncu mediante la herramienta GLQ (E8 lattice quantization). El checkpoint reduce el peso en disco a 6,14 GB, un 2,43× menos que los pesos bf16 originales, manteniendo el pipeline de text-generation y el formato safetensors. El modelo base es un Gemma 4 de Google con 3.295.349.322 parámetros reales según los tensores safetensors, orientado a generación de texto y conversación.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco habitual (retículos E8 con codebook de 65536 entradas en bloques de 8 dimensiones, rotación Hadamard aleatorizada y retroalimentación LDLQ) que permite comprimir un modelo de ~3,3B parámetros a 4 bits con pérdida de calidad mínima en tareas de razonamiento matemático; por otro, el propio autor marca este checkpoint como reemplazado (superseded) por `xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw`, que usa un codebook trellis (TCQ) recomendado desde la versión 0.7 de la herramienta por ofrecer mejor calidad a igual tasa de bits.

El modelo está pensado para despliegue en vLLM con el backend de cuantización `glq`, y su uso requiere instalar el paquete `glq` desde GitHub, que compila un kernel CUDA personalizado en el primer uso. La licencia declarada es Apache 2.0, heredada del modelo base y de la herramienta de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, modelo base google/gemma-4-E4B-it); detalles internos de capas no disponibles |
| Parámetros totales | 3.295.349.322 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la KV cache comprimida del tooling se valida hasta 128k, pero no se confirma como contexto oficial del modelo) |
| Tipos de cuantización | 4,0 bpw uniforme (E8 lattice, codebook de 65536 entradas, bloques de 8 dimensiones); el tooling GLQ soporta además 5, 6, 7 y 8 bpw y KV cache E8 a 4 y 6 bpw |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantización de pesos del modelo instructivo Gemma-4-E4B-it de Google. La arquitectura subyacente es la del modelo base Gemma 4; la model card de esta ficha no detalla número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento original, por lo que esos datos deben consultarse en la ficha de google/gemma-4-E4B-it. El ajuste instructivo y el modo thinking (razonamiento multi-paso) provienen del modelo base.

La innovación técnica está en el método de compresión GLQ: cuantización sobre el retículo E8 con un codebook de 65.536 entradas organizadas en bloques de 8 dimensiones, rotación mediante Randomized Hadamard Transform (RHT) en entrada y salida, retroalimentación LDLQ basada en descomposición LDL por bloques durante la codificación, cuantización residual en N etapas para capas de 3 bpw o más, y asignación de precisión mixta guiada por un proxy de sensibilidad derivado de la traza de la Hessiana cuando aplica. El resultado son pesos de 4,0 bpw uniformes con un tamaño de fichero de 6,14 GB. El autor reporta que, con presupuesto de generación suficiente, todas las variantes convergen a la calidad bf16 dentro del error estándar en gsm8k.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat del modelo base.
- Modo thinking (`enable_thinking=True`) para razonamiento matemático y problemas multi-paso; el autor recomienda un presupuesto de hasta 16K tokens nuevos en esta variante de 4 bpw.
- Razonamiento aritmético y matemático (validado en gsm8k con 94% de strict-match en el límite de 50 ejemplos, frente al 86% de la línea base bf16 según el autor).
- Generación de código y tareas de lenguaje general: capacidades heredadas del modelo base Gemma 4 instruct, no detalladas en esta model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcialmente cubierto por el modo thinking; no se documentan capacidades agénticas específicas.
- Capacidades multilingües: limitadas al inglés según el campo `language: en` de la model card.
- Capacidades de visión o audio: no disponibles en la información proporcionada.
- Compresión opcional de KV cache en vLLM (independiente de la cuantización de pesos) mediante el esquema `e8_relaxed`, con recetas de 4 y 6 bpw.

## Casos de uso

- Razonamiento matemático en producción con presupuesto controlado: usar el modo thinking con `max_new_tokens=16384` para resolver problemas aritméticos y multi-paso; el checkpoint reporta 94% de strict-match en gsm8k (límite 50) frente al 86% de bf16, lo que lo hace adecuado para asistentes de cálculo con verificación.
- Despliegue en vLLM con memoria reducida: servir el modelo con `vllm serve ... --quantization glq` reduce el peso a 6,14 GB, lo que permite alojar el modelo en GPUs de consumo con 8-12 GB de VRAM y liberar memoria para KV cache y concurrencia.
- Evaluación comparativa de técnicas de cuantización: el checkpoint sirve como referencia de la familia GLQ (E8 lattice) frente a trellis/TCQ y otros esquemas, útil para investigadores que midan degradación a 4 bpw en tareas de matemáticas y razonamiento.
- Prototipado de asistentes conversacionales en inglés: la plantilla de chat del modelo base y el pipeline text-generation permiten construir chatbots de dominio general con contexto multi-turno, siempre que se respete el límite de contexto del modelo base.
- Sustitución de bf16 en pipelines con restricciones de memoria: al ser un derivado directo del modelo instruct, puede reemplazar al bf16 en entornos donde el presupuesto de VRAM es el cuello de botella, manteniendo la API de transformers mediante `glq.hf_integration`.
- Investigación sobre compresión de KV cache: el tooling GLQ permite activar compresión E8 de la KV cache en vLLM (receta `e8_relaxed:2` con 40/40 en NIAH passkey hasta 128k según el autor) para estudiar el equilibrio entre memoria y calidad en contextos largos.
- Fine-tuning o destilación sobre pesos cuantizados: no recomendado directamente; el uso realista es inferencia, no entrenamiento, dado que se trata de un checkpoint cuantizado.

## Benchmarks y rendimiento

| Benchmark | Este modelo (4 bpw GLQ) | Línea base bf16 |
|---|---|---|
| gsm8k, limit=50, chat+thinking, strict-match | 94% | 86% |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar para este checkpoint. Los datos de gsm8k provienen del autor y usan un límite de 50 ejemplos, por lo que la muestra es pequeña y debe interpretarse con cautela. El autor también reporta, para la compresión de KV cache independiente sobre el modelo bf16, mmlu_pro 171/240 = 71,25% con la receta `e8_relaxed:2` (idéntico al baseline fp16) y NIAH passkey 40/40 hasta 130k de contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso ocupa 6,14 GB en disco a 4,0 bpw; en GPU se necesita ese espacio más la KV cache y overhead del runtime, por lo que se estima un mínimo práctico de 8-10 GB de VRAM para contexto corto.
- GPU recomendadas: el autor valida en una RTX PRO 6000 Blackwell; por tamaño, caben también en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y GPUs de 12 GB con contexto reducido. A100 y H100 son sobredimensionadas para este tamaño pero válidas para alta concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más con contexto moderado; en 8 GB solo con contexto muy corto y sin margen para concurrencia.
- Opciones de despliegue: vLLM con `--quantization glq` (requiere `pip install 'glq[vllm]'` y `transformers>=5.13.1,<5.15`), y transformers con `glq.hf_integration`. No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor advierte que el kernel CUDA personalizado compila JIT en el primer uso (~30 s) y requiere `torch>=2.0`, `transformers>=5.0` y CUDA 12.x.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-it-GLQ-4bpw (este) | 3,30B | no disponible | 4,0 bpw E8 lattice, 6,14 GB | Apache 2.0 | Hugging Face, vLLM/transformers con paquete glq |
| gemma-4-E4B-it-GLQ-trellis-3inst-4bpw | mismo base | no disponible | 4 bpw trellis (TCQ) | Apache 2.0 | Hugging Face; recomendado por el autor |
| google/gemma-4-E4B-it (bf16) | 3,30B | no disponible | bf16 (~14,9 GB estimados a partir del factor 2,43×) | Apache 2.0 (licencia Gemma 4) | Hugging Face, ecosistema estándar |

La comparativa se limita a variantes del mismo modelo base porque la información proporcionada no incluye datos de benchmarks de alternativas de otros fabricantes. El autor indica que el formato trellis (TCQ) ofrece mejor calidad a igual tasa de bits y decodificación single-stream más rápida, por lo que esta variante E8 queda como referencia histórica.

## Limitaciones y advertencias

- Checkpoint marcado como reemplazado por `xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw`; se mantiene por compatibilidad de referencias existentes, no como opción recomendada.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otras lenguas no está validado.
- Riesgo de alucinación: inherente al modelo base instruct; no se documentan mitigaciones específicas en esta cuantización.
- Presupuesto de generación: en modo thinking, esta variante de 4 bpw requiere 8192-16384 tokens nuevos; un presupuesto insuficiente trunca el razonamiento y puede eliminar la respuesta final. Es un problema de configuración, no de calidad, según el autor.
- Dependencia de tooling: requiere el paquete `glq` y un kernel CUDA JIT; además, `transformers>=5.15` rompe gemma-4 por el cambio a configuración por capa (`config.head_dim`), por lo que hay que fijar `transformers<5.15`. El fallo afecta también al bf16 original, no solo a GLQ.
- La combinación de pesos cuantizados GLQ con la compresión de KV cache E8 no ha sido probada de extremo a extremo por el autor.
- Los resultados de gsm8k se basan en 50 ejemplos y en una única medición del autor; no hay validación independiente.
- Licencia Apache 2.0 según la model card, con referencia a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso del modelo base antes de un despliegue comercial.
- Sesgos: no documentados en la información disponible; deben asumirse los del modelo base Gemma 4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-4bpw
- Variante recomendada (trellis/TCQ): https://huggingface.co/xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de la herramienta GLQ: https://github.com/cnygaard/glq
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
