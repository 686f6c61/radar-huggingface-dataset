# uwe311/Nemotron-Mini-4B-Instruct-heretic

## Resumen

Nemotron-Mini-4B-Instruct-heretic es una versión "abliterated" (descensurada) del modelo Nvidia/Nemotron-Mini-4B-Instruct, publicada por el usuario uwe311 mediante la herramienta Heretic v1.4.0. El modelo original, desarrollado por NVIDIA, es un SLM (small language model) de 4.190.509.056 parámetros (aproximadamente 4,19 B) construido mediante destilación, poda y cuantización a partir de Nemotron-4 15B, y orientado específicamente a roleplay, generación aumentada por recuperación (RAG) y function calling en inglés, con una ventana de contexto de 4.096 tokens.

La modificación consiste en una abliteración: se identifican y suprimen direcciones en el espacio de activaciones asociadas al comportamiento de rechazo. Según la model card, el proceso reduce las negativas de 100/100 a 10/100 en un conjunto de 100 prompts de prueba, con una divergencia KL de 0.0568 respecto al modelo original, lo que indica una alteración medible pero contenida de la distribución de salida.

Es relevante ahora porque combina dos tendencias: por un lado, el despliegue de modelos pequeños en dispositivo (ACE de NVIDIA, motores de juego, asistentes locales) y, por otro, la demanda de variantes sin mecanismos de rechazo para investigación sobre seguridad y alineación. La model card incluye parámetros de abliteración y material de reproducibilidad, algo poco habitual en este tipo de derivados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (familia Nemotron-4); GQA y RoPE; embedding de 3072, 32 cabezas de atención, dimensión intermedia MLP de 9216 |
| Parametros totales | 4.190.509.056 (~4,19 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos se distribuyen en safetensors (precision completa). El modelo base fue optimizado mediante cuantizacion segun NVIDIA, pero no se documentan formatos concretos (GGUF, AWQ, GPTQ) para este derivado |
| Idiomas soportados | Ingles (en) |
| Licencia | nvidia-open-model-license (etiquetada como "other"); el modelo base se publica bajo NVIDIA Community Model License |
| Formato de pesos | safetensors (transformers, PyTorch) |
| Tamano del repositorio | 8,4 GB |
| Fecha de publicacion | 2026-10-02 (creacion) / 2026-10-02 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder autorregresivo de la familia Nemotron-4, con Grouped-Query Attention (GQA) y Rotary Position Embeddings (RoPE). El modelo original parte de nvidia/Minitron-4B-Base, que a su vez fue podado y destilado desde Nemotron-4 15B (arXiv:2402.16819) aplicando la técnica de compresión de LLM descrita en arXiv:2407.14679. El modelo instruct se entrenó entre febrero y agosto de 2024 y está ajustado para roleplay, QA con RAG y function calling en inglés. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La innovación de esta publicación concreta no está en el entrenamiento sino en el post-procesado: se aplicó Heretic v1.4.0 para abliterar el modelo, con dirección de supresión calculada por capa (direction_index = per layer) y pesos diferenciados para attn.o_proj y mlp.down_proj (por ejemplo, max_weight de 0,86 en attn.o_proj y 1,26 en mlp.down_proj, con posiciones y distancias mínimas especificadas). El autor publica un directorio `reproduce` con el README del proceso, de modo que el resultado es reproducible. La evaluación reportada indica una divergencia KL de 0.0568 frente al original y una caída de rechazos de 100/100 a 10/100.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de prompt específica basada en tokens `<extra_id_0>` (System) y `<extra_id_1>` (User/Assistant).
- Roleplay y mantenimiento de personajes, caso de uso para el que NVIDIA optimizó explícitamente el modelo base (integración con NVIDIA ACE para NPCs de videojuegos).
- Question answering con recuperación aumentada (RAG), inyectando contexto en el bloque `<context>`.
- Function calling y tool use, con bloques `<tool>`, `<toolcall>` y respuestas de herramienta en `<extra_id_1>Tool`.
- Razonamiento multi-turno dentro de la ventana de 4.096 tokens.
- Comportamiento de rechazo fuertemente reducido (10/100 en la prueba del autor), lo que habilita respuestas que el modelo original denegaría.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre alineación y seguridad: permite comparar el comportamiento de un modelo antes y después de la abliteración sobre el mismo checkpoint base, con parámetros de intervención publicados y reproducibles, lo que facilita experimentos controlados sobre mecanismos de rechazo.
- Roleplay en videojuegos y agentes conversacionales: con 4,19 B de parámetros y contexto de 4.096 tokens, el modelo cabe en GPU de consumo y puede ejecutar diálogos de NPC en local, sin latencia de red, siguiendo la plantilla de System/User/Assistant para mantener la persona.
- Asistentes conversacionales sin filtros para entornos controlados: en pruebas internas de red teaming, donde se necesita un modelo que no bloquee solicitudes para evaluar la robustez de los filtros propios de la aplicación.
- Generación de datos sintéticos adversarios: producir ejemplos de prompts y respuestas que alimenten clasificadores de seguridad o conjuntos de evaluación de contenido, aprovechando la baja tasa de rechazo.
- QA sobre documentación técnica con RAG: insertar fragmentos recuperados en el bloque `<context>` y obtener respuestas ancladas al material, con la ventaja de que el modelo base fue ajustado específicamente para este formato.
- Automatización con function calling en pipelines locales: definir herramientas en `<tool>`, recibir `<toolcall>` y encadenar respuestas de herramienta, útil en agentes de escritorio o scripts que no pueden depender de APIs externas.
- Prototipado rápido en hardware modesto: sirve como banco de pruebas para prompts, plantillas y cadenas de agentes antes de escalar a modelos mayores, dado su tamaño reducido y su naturaleza auto-regresiva estándar.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El autor únicamente reporta métricas comparativas del proceso de abliteración:

| Metrica | Este modelo | Modelo original (Nvidia/Nemotron-Mini-4B-Instruct) |
|---|---|---|
| Divergencia KL | 0,0568 | 0 (por definición) |
| Rechazos | 10/100 | 100/100 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en fp16/bf16 los pesos ocupan aproximadamente 8,4 GB (coincide con el tamaño del repositorio); en cuantización int8 el requisito baja a unos 4,2-5 GB y en int4 a unos 2,5-3 GB, más overhead de caché KV.
- GPU recomendadas: A100, H100, L40S o A10G para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 sin problemas.
- Cabe en GPU de consumo: sí. Con 24 GB se ejecuta en fp16; con 12 GB (RTX 3060, RTX 4070) es viable en fp16 ajustado o int8; con 8 GB (RTX 3070, RTX 4060) es recomendable int4.
- Opciones de despliegue: transformers (formato nativo del repositorio), vLLM y TGI para servicio con batching, llama.cpp/Ollama si se generan conversiones GGUF (no incluidas en el repositorio). El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponible. Al tratarse de un modelo denso de 4,19 B con contexto de 4.096 tokens, es esperable un throughput alto en GPU moderna, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Particularidad |
|---|---|---|---|---|---|
| uwe311/Nemotron-Mini-4B-Instruct-heretic | ~4,19 B | 4.096 | en | nvidia-open-model-license | Derivado abliterated, refusals 10/100, KL 0,0568 |
| nvidia/Nemotron-Mini-4B-Instruct | ~4,19 B | 4.096 | en | NVIDIA Community Model License | Modelo base; refusals 100/100; orientado a roleplay, RAG y function calling |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 | multilingue (8 idiomas declarados) | Llama 3.2 Community License | Mayor contexto y cobertura de idiomas; sin derivado abliterated oficial |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 | multilingue (29 idiomas declarados) | Apache 2.0 | Licencia permisiva y mayor contexto; sin modo roleplay específico documentado |

Nota: los datos de Llama-3.2-3B-Instruct y Qwen2.5-3B-Instruct provienen de sus model cards públicas y no de la información proporcionada en esta ficha; no se dispone de cifras de benchmarks comparables para el modelo abliterated.

## Limitaciones y advertencias

- La abliteración elimina deliberadamente el comportamiento de rechazo: el modelo puede producir contenido dañino, ilegal o explícito. No es apto para aplicaciones orientadas al público sin filtros externos.
- La divergencia KL de 0,0568 indica un desplazamiento medible respecto al modelo original; puede haber degradación en tareas distintas del roleplay, especialmente en seguimiento de instrucciones y precisión factual.
- Riesgo de alucinación inherente a un modelo de 4,19 B destilado y podado; no se han publicado evaluaciones de fidelidad factual.
- Ventana de contexto limitada a 4.096 tokens, muy inferior a la de alternativas contemporáneas, lo que restringe casos de RAG con documentos largos o conversaciones extensas.
- Soporte exclusivo de inglés; no hay evidencia de capacidades en castellano u otros idiomas.
- Requiere la plantilla de prompt propietaria (`<extra_id_0>`, `<extra_id_1>`, `<tool>`, `<toolcall>`); sin ella, el rendimiento puede degradarse notablemente.
- Restricciones de licencia: la licencia NVIDIA Open Model License / NVIDIA Community Model License impone condiciones de uso (incluida la obligación de cumplir la política de uso aceptable de NVIDIA y requisitos de atribución). Es necesario revisar si la creación y distribución de derivados abliterated está permitida y bajo qué términos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no existe validación comunitaria de la calidad del checkpoint.
- El proceso de abliteración es reproducible según el autor, pero los parámetros concretos (direction_index por capa, pesos por proyección) dependen de la versión de Heretic v1.4.0; cambios de versión pueden alterar el resultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uwe311/Nemotron-Mini-4B-Instruct-heretic
- Modelo base: https://huggingface.co/Nvidia/Nemotron-Mini-4B-Instruct
- Base destilada: https://huggingface.co/nvidia/Minitron-4B-Base
- Herramienta Heretic: https://heretic-project.org
- Paper Nemotron-4 15B: https://arxiv.org/abs/2402.16819
- Paper de la tecnica de compresion de LLM: https://arxiv.org/abs/2407.14679
- Demo en build.nvidia.com: https://build.nvidia.com/nvidia/nemotron-mini-4b-instruct
- Blog de NVIDIA ACE: https://developer.nvidia.com/blog/deploy-the-first-on-device-small-language-model-for-improved-game-character-roleplay/
- Video demo de ACE: https://www.youtube.com/watch?v=d5z7oIXhVqg
- Checkpoint para AIM SDK en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/ucs-ms/resources/nemotron-mini-4b-instruct
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Licencia NVIDIA Community Model License: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct/blob/main/nvidia-community-model-license-aug2024.pdf
- Garak (scanner de vulnerabilidades): https://github.com/leondz/garak
- Dataset AEGIS de seguridad de contenido: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
