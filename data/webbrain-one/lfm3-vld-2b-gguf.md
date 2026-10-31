# webbrain-one/lfm3-vld-2b-gguf

## Resumen

LFM3-VLD-2B GGUF es la exportación en formato GGUF del modelo webbrain-one/lfm3-vld-2b, un modelo multimodal de imagen-texto-a-texto construido sobre la familia LFM3 (Liquid Foundation Models) de arquitectura "liquid". El repositorio, publicado por webbrain-one, permite ejecutar el modelo en llama.cpp tanto como modelo de chat multimodal estándar (endpoint `/v1/chat/completions`) como modelo de decisión multipass (endpoint `/v1/systemone`), una modalidad etiquetada como "decision-model" o "system-one".

El modelo base combina la cabeza generativa original de LFM3-VL-2B con un backbone de decisión denominado `d1-2B`, y presenta embeddings no atados (untied embeddings), con `token_embd.weight` y `output.weight` exportados por separado en 288 tensores. Con aproximadamente 1.990 millones de parámetros, se trata de un modelo compacto orientado a inferencia local en hardware de consumo.

Su relevancia radica en la combinación de tres factores: un tamaño muy reducido (2B), capacidades multimodales de visión mediante un proyector MMProj incluido en el repositorio, y un modo de decisión multipass que lo diferencia de los LLM conversacionales convencionales. Es relevante para desarrolladores que necesitan modelos ligeros con visión y razonamiento por pasos ejecutables en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Model (LFM3), backbone de decisión d1-2B con cabeza generativa de LFM3-VL-2B, embeddings no atados |
| Parametros totales | 1.990.945.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso sugiere 16.384 tokens con `-c 16384`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (y proyector de visión en F16) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other", no estándar) |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 "liquid", una familia de modelos que no emplea el transformer convencional puro, sino bloques inspirados en sistemas dinámicos lineales. Sobre el backbone de decisión `d1-2B` se ha restaurado la cabeza generativa original de LFM3-VL-2B, con embeddings de entrada y salida no atados, lo que según el autor restaura la capacidad de generación de lenguaje del modelo original. El repositorio GGUF contiene 288 tensores.

La variante VLD (VLDR) añade capacidades multimodales mediante un proyector de visión distribuido por separado (`mmproj-LFM3-VL-2B-VLDR-F16.gguf`, 362 MB en F16), que permite procesar entradas de imagen junto al texto. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modo "system-one" o de decisión multipass sugiere un enfoque de razonamiento iterativo, pero el autor no documenta sus detalles técnicos en la model card.

## Capacidades

- Generación de texto conversacional mediante el endpoint estándar `/v1/chat/completions` de llama.cpp.
- Modo de decisión multipass mediante el endpoint `/v1/systemone`, etiquetado como "decision-model" y "system-one" por el autor.
- Comprensión de imágenes (pipeline image-text-to-text) mediante el proyector multimodal MMProj incluido.
- Ejecución local en llama.cpp con descarga de capas a GPU (`-ngl 99`).
- No hay información disponible sobre tool calling, soporte de agentes, capacidades de código o matemáticas.

## Casos de uso

- Chatbots multimodales en local: el modelo acepta imágenes y texto y puede servirse con llama-server en un endpoint compatible con la API de chat, adecuado para asistentes que describen o analizan imágenes sin enviar datos a la nube.
- Sistemas de decisión automatizada: el modo multipass `/v1/systemone` está orientado a flujos de decisión iterativos, por ejemplo enrutamiento de solicitudes o evaluación de condiciones en pipelines de automatización.
- Inferencia en dispositivos con recursos limitados: con la cuantización Q4_K_M (1,2 GB) cabe en portátiles y mini-PC sin GPU dedicada, útil para aplicaciones edge.
- Procesamiento de documentos e imágenes: el proyector de visión F16 permite extraer información de capturas, diagramas o imágenes en aplicaciones de indexación local.
- Prototipado rápido de agentes ligeros: su tamaño de 2B permite ejecutar varios procesos simultáneos en una sola GPU de consumo para experimentar con arquitecturas multi-agente.
- Integración en servidores caseros: llama-server expone una API HTTP en el puerto configurado, fácil de integrar con clientes OpenAI-compatible existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en BF16, 2,0 GB en Q8_0 y 1,2 GB en Q4_K_M, más 362 MB del proyector de visión y la memoria del KV cache (16.384 tokens de contexto en el ejemplo de uso).
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM es suficiente para Q8_0 con contexto de 16K; no se requieren GPU de gama datacenter.
- Cabe en GPUs de consumo: sí, en RTX 3060 de 12 GB, RTX 4060, RTX 4090 o incluso GPUs integradas con RAM suficiente en modo CPU.
- Opciones de despliegue: llama.cpp / llama-server (formato nativo del repositorio); la compatibilidad con Ollama, LM Studio u otros runtimes GGUF es plausible pero no está documentada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VLD-2B GGUF | 1,99B | Sí (visión, MMProj) | no disponible | lfm1.0 (other) | GGUF |
| Qwen2.5-VL-3B-Instruct | 3B | Sí (visión) | 32.768 tokens | Apache 2.0 | Safetensors, GGUF |
| SmolVLM2 2.2B | 2,2B | Sí (visión) | 16.384 tokens | Apache 2.0 | Safetensors, GGUF |

Frente a alternativas de tamaño similar, LFM3-VLD-2B se diferencia por su arquitectura liquid y su modo de decisión multipass, aunque carece de la documentación de benchmarks y de la licencia permisiva de Qwen o SmolVLM. La licencia lfm1.0 requiere revisión antes de uso comercial.

## Limitaciones y advertencias

- Licencia lfm1.0 de tipo "other": no es una licencia estándar y sus términos para uso comercial deben revisarse antes de desplegar en producción.
- No hay benchmarks publicados: el rendimiento real en tareas estándar (MMLU, código, matemáticas) es desconocido y debe evaluarse caso por caso.
- No hay información sobre idiomas soportados, lo que introduce incertidumbre sobre su rendimiento en castellano.
- El modo de decisión multipass `/v1/systemone` es una característica específica del autor con documentación mínima; su comportamiento y fiabilidad no están verificados de forma independiente.
- Riesgo de alucinación: al tratarse de un modelo de 2B, la tasa de alucinaciones en generación de texto es presumiblemente alta, como es habitual en modelos de este tamaño, aunque no hay mediciones disponibles.
- El repositorio es muy reciente (creado en octubre de 2026) con pocas descargas (751) y un único "like", por lo que tiene escasa validación por parte de la comunidad.
- La longitud de contexto máxima real del modelo no está documentada; el valor de 16.384 tokens del ejemplo de uso es una configuración de ejemplo, no necesariamente el límite del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webbrain-one/lfm3-vld-2b-gguf
- Modelo base original: https://huggingface.co/webbrain-one/lfm3-vld-2b
- Modelo base referenciado en la ficha: https://huggingface.co/webbrain-one/lfm3-vl-2b-vldr
- No se han encontrado enlaces adicionales a papers, blogs o demos en la informacion disponible.
