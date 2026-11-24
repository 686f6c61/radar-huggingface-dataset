# Thox-ai/ThoxLLM-327M-v2

## Resumen

ThoxLLM-327M-v2 es un modelo de lenguaje de tipo decoder-only con 324.162.560 parámetros (etiquetado comercialmente como 327M), desarrollado desde cero por THOX.ai LLC. Forma parte de la línea de investigación de modelos pequeños de THOX y se distribuye como checkpoint de investigación con pesos en safetensors y una build GGUF separada para su uso con llama.cpp y Ollama. Su diseño prioriza la exportación limpia a GGUF y la ejecución local en hardware propio, en línea con la propuesta "local-first" del fabricante.

Arquitectura transformer decoder-only convencional con normalización RMSNorm, atención con GQA (16 cabezas de consulta y 8 cabezas KV), RoPE para codificación posicional, feed-forward SwiGLU y embeddings atados. Consta de 20 capas con tamaño oculto de 1024, dimensión intermedia de 3413 y un vocabulario de 50.304 tokens. El contexto máximo es de 2048 tokens y los pesos están en bfloat16.

La relevancia del modelo es doble: por un lado, es un ejemplo de entrenamiento from-scratch de un modelo pequeño con licencia Apache-2.0; por otro, su arquitectura personalizada (`thoxllm`) implica que el `config.json` no incluye la clave `architectures`, por lo que los cargadores estándar de `AutoModel` pueden no funcionar directamente. El autor no ha publicado resultados de benchmarks (no hay resultado GATE49 para este modelo), por lo que su evaluación debe hacerse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizada (`thoxllm`), SwiGLU, RMSNorm, RoPE, GQA |
| Parametros totales | 324.162.560 (327M nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF (build separada; p. ej. Q4_K_M); pesos originales en bfloat16 |
| Idiomas soportados | Ingles (principal); calidad inferior en otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 648.339.368 bytes); GGUF en repo aparte |

Datos adicionales de arquitectura: 20 capas, hidden size 1024, 16 cabezas de atención, 8 cabezas KV (GQA), FFN/intermediate 3413, vocabulario 50.304, embeddings atados, dtype bfloat16.

## Arquitectura y entrenamiento

El modelo es un decoder-only transformer de 20 capas con tamaño oculto de 1024 y dimensión intermedia de 3413. Emplea RMSNorm para la normalización, RoPE como codificación posicional, atención con grouped-query attention (16 cabezas de consulta frente a 8 cabezas KV, ratio 2:1) y una feed-forward SwiGLU estándar. Los embeddings de entrada y salida están atados, lo que reduce el recuento de parámetros y es coherente con el tamaño de vocabulario de 50.304 tokens. Los pesos se almacenan en bfloat16.

El entrenamiento se realizó desde cero por THOX.ai LLC como parte de su línea de investigación de modelos pequeños; no se usó ningún modelo base externo. La model card indica que el corpus y el procedimiento son los descritos en la tarjeta en el momento del lanzamiento, pero no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La decisión de diseño más destacable es la arquitectura personalizada orientada a una exportación limpia a GGUF.

## Capacidades

- Generación de texto de tipo completion: el modelo está pensado para continuar texto, no como asistente conversacional alineado.
- Razonamiento y conocimiento factual limitados, propios de un modelo base de 327M parámetros.
- Generación de código y matemáticas: capacidad posible pero no evaluada ni documentada.
- Tool calling / function calling: no documentado; no se anuncia soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas; el entrenamiento es mayoritariamente en inglés y la calidad en otros idiomas es inferior.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución local en dispositivos edge dentro del stack THOX (ThoxOS, MeshStack) y vía Ollama/llama.cpp con la build GGUF.

## Casos de uso

- Generación de texto en dispositivos edge: el modelo cabe en memoria de dispositivos de gama baja gracias a sus 324M de parámetros y a la cuantización GGUF (Q4_K_M), lo que permite autocompletado y generación de texto sin conexión.
- Prototipado de pipelines de inferencia local: útil para validar integraciones con Ollama o llama.cpp antes de escalar a modelos mayores, dado su reducido tamaño y su licencia permisiva.
- Experimentación académica con arquitecturas from-scratch: sirve como base para estudiar el comportamiento de transformers pequeños con GQA y SwiGLU, y para comparar curvas de entrenamiento (el repo incluye `loss-curve.svg` y `eval-curve.tsv`).
- Autocompletado y sugerencias en herramientas de escritura: con contexto de 2048 tokens puede mantener el hilo de un párrafo o documento corto para sugerencias de continuación.
- Filtrado y clasificación de texto ligera: puede emplearse para tareas de etiquetado o generación de resúmenes muy cortos en entornos con recursos limitados, siempre con revisión humana.
- Base para fine-tuning específico de dominio: al ser Apache-2.0 y entrenado desde cero, es un punto de partida viable para ajustar sobre corpus propios en inglés sin restricciones de licencia.
- Demostraciones de ecosistema local-first: integrable en el stack THOX (ThoxOS, MeshStack) para mostrar inferencia privada en hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultado THOX GATE49 publicado para este modelo. El repositorio incluye un archivo `eval-curve.tsv` cuya contenido no se detalla en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,65 GB solo para pesos (648.339.368 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 1,5 GB.
- VRAM estimada con cuantización Q4_K_M (GGUF): del orden de 0,2-0,3 GB para pesos, más overhead; cabe holgadamente en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; también funciona en CPU y en GPUs integradas.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en dispositivos de gama baja.
- Opciones de despliegue: Ollama (`ollama run hf.co/Thox-ai/ThoxLLM-327M-v2-GGUF:Q4_K_M` o `ollama run Thox-ai/thoxllm`), llama.cpp con la build GGUF, y el paquete `thoxllm` para cargar los safetensors. Los cargadores estándar de `AutoModel` pueden no funcionar por la ausencia de la clave `architectures` en `config.json`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxLLM-327M-v2 | 324M | 2048 | Apache-2.0 | safetensors, GGUF | Arquitectura propia; sin benchmarks publicados |
| SmolLM2-360M (HuggingFaceTB) | 362M | 8192 | Apache-2.0 | safetensors, GGUF | Modelo pequeño con benchmarks publicados; contexto mayor |
| Qwen2.5-0.5B | 494M | 32768 | Apache-2.0 | safetensors, GGUF | Mayor tamaño y contexto; benchmarks publicados |
| TinyLlama-1.1B | 1,1B | 2048 | Apache-2.0 | safetensors, GGUF | Mayor capacidad; benchmarks publicados |

La comparación con alternativas establecidas debe tomarse con cautela: ThoxLLM-327M-v2 no publica resultados de benchmarks, mientras que los modelos comparables sí lo hacen. En términos de contexto, 2048 tokens queda por debajo de SmolLM2-360M (8192) y muy por debajo de Qwen2.5-0.5B (32768). La ventaja principal del modelo es su licencia permisiva y su diseño orientado a la ejecución local, no su rendimiento medido.

## Limitaciones y advertencias

- Modelo base de 327M: comportamiento de completion, razonamiento y fiabilidad factual limitados; conviene verificar respuestas importantes.
- No es un asistente público alineado en seguridad salvo que se despliegue detrás de las salvaguardas de THOX.
- Sesgos y comportamiento reflejan los datos de entrenamiento, mayoritariamente en inglés; la calidad en otros idiomas es inferior.
- Riesgo de alucinación inherente a modelos pequeños sin alineación documentada.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Arquitectura personalizada: los cargadores estándar pueden no cargar el checkpoint safetensors directamente; es necesario usar el paquete `thoxllm` o la build GGUF.
- Uso fuera de alcance: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana; control no supervisado de dispositivos físicos sin paso de confirmación.
- No hay benchmarks publicados que permitan validar el rendimiento antes de producción.
- La model card incluye contenido promocional de una campaña de Kickstarter; debe separarse del contenido técnico al evaluar el modelo.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/Thox-ai/ThoxLLM-327M-v2
- Hugging Face (GGUF): https://huggingface.co/Thox-ai/ThoxLLM-327M-v2-GGUF
- Sitio del fabricante: https://thox.ai/
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Cita BibTeX: incluida en la model card (THOX.ai, 2026)
