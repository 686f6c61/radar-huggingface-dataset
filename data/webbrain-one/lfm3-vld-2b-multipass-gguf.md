# webbrain-one/lfm3-vld-2b-multipass-gguf

## Resumen

LFM3-VLD-2B-Multipass es una exportación en formato GGUF del modelo `webbrain-one/lfm3-vld-2b`, publicado por la organización webbrain-one en Hugging Face. Se trata de un modelo multimodal (imagen-texto a texto) de tamaño reducido, con aproximadamente 1.730 millones de parámetros, basado en la familia de arquitecturas "liquid" (LFM, Liquid Foundation Models). Su rasgo más distintivo es que puede ejecutarse en `llama.cpp` de dos modos: como modelo de chat multimodal estándar (compatible con el endpoint `/v1/chat/completions`) y como modelo de decisión "multipass" mediante la opción `lfm3.decision.type = "webbrain-vld"` y el endpoint `/v1/systemone`.

El modelo resuelve el problema de llevar capacidades de visión-lenguaje y de toma de decisiones rápidas ("system-one", según la terminología del autor) a entornos con recursos limitados, dado su tamaño compacto y la disponibilidad de cuantizaciones agresivas (Q4_K_M ocupa solo 1,1 GB). Su relevancia actual radica en la tendencia hacia modelos pequeños multimodales ejecutables en local, en portátiles o en dispositivos edge, sin depender de APIs externas.

La licencia es "other" con nombre `lfm1.0`, una licencia específica de la familia LFM cuyos términos concretos deben revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VLD (familia Liquid Foundation Models), multimodal con proyector de visión; no disponible el detalle exacto |
| Parametros totales | 1.728.801.600 (≈1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 16384`, lo que sugiere al menos 16K tokens) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (más proyector de visión en F16) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other") |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LFM3 ("liquid"), una línea de arquitecturas basadas en modelos fundacionales de tipo "liquid" que, según la literatura de la familia Liquid AI, combinan estructuras híbridas inspiradas en sistemas dinámicos con mecanismos de atención, orientadas a eficiencia en inferencia. La variante "VLD" incorpora un componente de visión (image-text-to-text) mediante un proyector visual independiente distribuido como archivo `mmproj` en F16 (362 MB), patrón habitual en los despliegues multimodales de `llama.cpp`.

Sobre los datos de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas como RLHF o DPO, no hay información disponible en la model card. Tampoco se detalla la innovación técnica concreta del modo "multipass decision model" (`/v1/systemone`), que el autor describe como un modo de decisión rápido tipo "system-one", distinto del chat multimodal convencional; su funcionamiento interno no está documentado en la información disponible.

## Capacidades

- Comprensión multimodal imagen-texto a texto: acepta imágenes junto con instrucciones textuales mediante el proyector `mmproj` incluido.
- Generación de texto conversacional a través del endpoint estándar `/v1/chat/completions` de `llama-server`.
- Modo de decisión "multipass" (etiquetado como `decision-model` y `system-one`) mediante `lfm3.decision.type = "webbrain-vld"` y el endpoint `/v1/systemone`, orientado a decisiones rápidas de baja latencia; los detalles de esta capacidad no están documentados.
- Ejecución totalmente local vía `llama.cpp`, con aceleración GPU (`-ngl 99`) y contexto configurable (el ejemplo usa 16.384 tokens).
- Etiquetado como modelo conversacional (`conversational`).
- No hay información disponible sobre soporte de tool calling, agentes, capacidades de audio ni modos de razonamiento extendido.

## Casos de uso

- Chat multimodal en local: despliegue de un asistente que describe o responde preguntas sobre imágenes sin enviar datos a la nube, adecuado por su tamaño (1,1 GB en Q4_K_M) para portátiles sin GPU dedicada.
- Clasificación y decisión rápida sobre entradas visuales: el modo "multipass decision model" apunta a escenarios donde se necesita una respuesta corta y de baja latencia (por ejemplo, decidir si una captura cumple una condición) en lugar de generación extensa.
- Atención al cliente con capturas de pantalla: un agente local que reciba imágenes de errores o formularios y genere respuestas multi-turno, aprovechando el endpoint compatible con el estándar de chat.
- Automatización y pipelines de moderación: integración en flujos batch que procesen imágenes y produzcan veredictos o etiquetas, ejecutándose en CPU o GPU modestas gracias a las cuantizaciones Q8_0 y Q4_K_M.
- Prototipado de aplicaciones edge e IoT con cámara: su huella reducida lo hace candidato para dispositivos con recursos limitados que necesiten interpretar imágenes puntualmente.
- Pruebas y desarrollo con `llama.cpp`: útil como modelo ligero para validar integraciones multimodales contra `llama-server` antes de escalar a modelos mayores.
- RAG multimodal ligero: generación de descripciones de imágenes para indexarlas en sistemas de recuperación, ejecutándose en una sola GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria estimada para inferencia: en BF16 el archivo pesa 3,3 GB; en Q8_0, 1,8 GB; en Q4_K_M, 1,1 GB. Añadir aproximadamente 362 MB del proyector de visión en F16 y la memoria del KV cache según el contexto (el ejemplo usa 16.384 tokens). En Q4_K_M, el conjunto cabe holgadamente en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: no disponible explícitamente. Por tamaño, cualquier GPU de consumo moderna (RTX 3060 de 12 GB, RTX 4060, RTX 4090) lo ejecuta sin problema con descarga completa de capas (`-ngl 99`); también es viable en CPU dado el tamaño.
- Consumer GPUs: sí, cabe en la mayoría de GPUs de consumo actuales incluso en BF16 (3,3 GB + proyector + KV cache caben en una GPU de 8 GB).
- Opciones de despliegue: `llama.cpp` / `llama-server` (formato nativo GGUF, con soporte multimodal vía `--mmproj`). No consta soporte verificado en Ollama, vLLM o TGI para esta exportación concreta.
- Latencia y throughput: no disponibles. Dado el tamaño (~1,7 B de parámetros) y la cuantización Q4, cabe esperar inferencia rápida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Formato | Licencia |
|---|---|---|---|---|
| LFM3-VLD-2B-Multipass GGUF | 1,73 B | Sí (imagen-texto) | GGUF (BF16/Q8_0/Q4_K_M) | lfm1.0 (other) |
| Qwen2.5-VL-3B-Instruct | ~3,75 B | Sí (imagen-texto) | Safetensors y GGUF comunitarios | Apache 2.0 |
| SmolVLM2 2.2B (HuggingFaceTB) | ~2,2 B | Sí (imagen-texto) | Safetensors y GGUF comunitarios | Apache 2.0 |

La comparativa es orientativa: los dos modelos alternativos son referentes de tamaño similar en la categoría de visión-lenguaje compactos, con licencias permisivas. El diferencial del modelo de webbrain-one es su modo de decisión "multipass" (`/v1/systemone`), una capacidad no presente en las alternativas, aunque sin benchmarks publicados que permitan contrastar rendimiento.

## Limitaciones y advertencias

- Licencia `lfm1.0` de tipo "other": los términos concretos no están visibles en la model card. Debe revisarse la licencia antes de cualquier uso comercial, ya que las licencias de la familia LFM suelen incluir restricciones o condiciones específicas.
- No se han publicado benchmarks ni evaluaciones: no hay forma de verificar la calidad del modelo en tareas estándar (MMLU, HumanEval, etc.) antes de probarlo.
- La documentación es muy escasa: no se detallan idiomas soportados, datos de entrenamiento, longitud de contexto máxima real ni el funcionamiento del modo "decision model".
- Riesgo de alucinación: no evaluado públicamente; como en todo modelo pequeño multimodal, las descripciones de imágenes y las respuestas factuales deben verificarse en producción.
- Sesgos: no documentados por el autor; asumen los sesgos típicos de los datos de entrenamiento de modelos visión-lenguaje.
- El modo "multipass" (`/v1/systemone`) depende de funcionalidades de `llama.cpp` posiblemente experimentales o específicas de este ecosistema; puede no estar disponible en otras herramientas de inferencia.
- Proyecto de autor individual con descargas modestas (624 en el momento de la ficha): madurez, mantenimiento y soporte comunitario limitados en comparación con modelos de grandes organizaciones.
- El ejemplo de la model card usa nombres de archivo (`LFM3-VL-2B-VLD-Q8_0.gguf`) ligeramente distintos de los listados en la tabla de archivos (`LFM3-VLD-2B-Q8_0.gguf`), una posible inconsistencia a tener en cuenta al descargar.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/webbrain-one/lfm3-vld-2b-multipass-gguf
- Modelo base: https://huggingface.co/webbrain-one/lfm3-vld-2b
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
