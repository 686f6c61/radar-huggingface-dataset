# vishrutJ/SuperQwen3.8-27b-abliterated

## Resumen

SuperQwen3.8-27b-abliterated es una variante del modelo multimodal Qwen3.8-27B de Alibaba, publicada por el usuario vishrutJ. Se trata de un checkpoint completo en BF16 que aplica una edición dirigida del subespacio de rechazo (refusal) mediante la técnica OBLITERATUS, reduciendo la tasa de negativas del 93,75 % al 0 % en una suite de 32 prompts de referencia, manteniendo intactas las capacidades de visión, tool-calling y razonamiento. El modelo conserva el peso exacto del vision tower y de los módulos MTP del padre, y no requiere LoRA ni adaptadores en inferencia.

La relevancia de este lanzamiento reside en que ofrece una alternativa "uncensored" de un modelo denso de 27,8 B parámetros con ventana de contexto nativa de 262 144 tokens, pensada para despliegues en producción con vLLM. Además, el autor ha corregido el comportamiento de "overthinking" del modelo base, limitando por defecto el esfuerzo de razonamiento a `medium` y añadiendo una condición de parada para el modo `xhigh`, lo que evita ciclos repetitivos de deliberación. El checkpoint se distribuye en 18 shards safetensors con un peso total de aproximadamente 100 GB en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), basado en Qwen3.8-27B |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos (verificado con 262 043 tokens) |
| Tipos de cuantizacion | BF16 (repositorio original); disponible GGUF externo (Jiunsong/SuperQwen3.8-27b-abliterated-GGUF) |
| Idiomas soportados | Inglés, coreano (según metadatos); el modelo base Qwen3.8-27B soporta más idiomas, pero no se especifican aquí |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18 shards, BF16) |

## Arquitectura y entrenamiento

El modelo parte de la revisión exacta `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de Qwen/Qwen3.8-27B. Se aplica una edición de rango 4 (rank-4) sobre el subespacio de rechazo, modificando exactamente 100 tensores: las proyecciones de salida de las capas 15 a 63, las embeddings y la cabeza de salida (`lm_head`). Los 333 tensores del visor multimodal y los 15 tensores de MTP (Multi-Token Prediction) permanecen byte a byte idénticos al padre. La edición se realiza con el corpus OBLITERATUS de 842 pares canónicos dañinos/inofensivos, fijado en el commit `a5a1ffa5849b`.

El entrenamiento no es un fine-tuning clásico con datos nuevos, sino una intervención quirúrgica sobre los pesos ya entrenados. El autor añade además una modificación de la plantilla de chat que cambia el esfuerzo de razonamiento por defecto de `xhigh` a `medium`, e introduce una condición de parada para `xhigh` que evita que el modelo repita o reinicie su deliberación una vez alcanzada una respuesta. No se reportan datos de entrenamiento adicionales ni fases de RLHF/DPO posteriores a la edición.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de pensamiento explícito (`enable_thinking`), con niveles de esfuerzo configurable (`low`, `medium`, `high`, `xhigh`).
- Comprensión multimodal de imágenes (pipeline `image-text-to-text`), conservando el visor oficial de Qwen3.8-27B sin alteraciones.
- Tool calling / function calling: verificado con resultado PASS en la suite de pruebas del autor.
- Capacidades de agente y tareas de largo horizonte, gracias a la ventana de contexto de 262 144 tokens verificada con recuperación de aguja en un prompt de 262 043 tokens.
- Corrección del "overthinking": 36 de 36 combinaciones de tarea/esfuerzo terminan correctamente, sin ciclos repetitivos.
- Multilingüe: declarados inglés y coreano; el modelo base puede soportar más idiomas, pero no se especifican en esta release.
- Modo "uncensored": la tasa de rechazo se reduce del 93,75 % al 0 % en la muestra de referencia, manteniendo una capacidad de 7 de 8 en la suite de control.

## Casos de uso

- **Asistente de atención al cliente sin censura**: el modelo puede gestionar conversaciones multi-turno sobre temas sensibles que el modelo base rechazaría, gracias a la abliteración, con una ventana de 262K tokens para mantener historiales largos de usuario.
- **Razonamiento y análisis de documentos extensos**: con 262 144 tokens de contexto, puede procesar libros técnicos, expedientes legales o informes de investigación completos, y extraer conclusiones razonadas sin truncamiento.
- **Agente de automatización de oficina**: su soporte de tool calling y razonamiento multi-step permite integrarse en pipelines de automatización que requieren leer, resumir y actuar sobre correos, hojas de cálculo o documentos (p. ej., con vLLM como backend).
- **Generación de código con control de esfuerzo**: en entornos de CI/CD, el modo `medium` por defecto acelera la generación de código y documentación, mientras que `xhigh` con la nueva condición de parada permite resolver problemas complejos sin caer en bucles infinitos.
- **Investigación sobre seguridad y alineación**: al reducir el rechazo, sirve como banco de pruebas para estudiar el comportamiento de modelos sin filtros de seguridad, siempre bajo control de acceso estricto.
- **Despliegue en hardware local de alta gama**: con 27,8 B parámetros en BF16, cabe en una GPU con 52 GB de VRAM (p. ej., A100 80 GB, H100 80 GB o RTX 4090 con cuantización GGUF), permitiendo inferencia multimodal y tool calling en entornos sin acceso a APIs propietarias.
- **Traducción y generación de contenido en coreano e inglés**: al ser un modelo multilingüe declarado en `en` y `ko`, puede usarse para redacción y traducción de textos largos en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas internas de comportamiento:

| Métrica | Resultado |
|---|---|
| Tasa de rechazo del padre | 30/32 (93,75 %) |
| Tasa de rechazo de SuperQwen | 0/32 |
| Salidas vacías | 0/32 |
| Capacidad (piso de control) | 7/8 |
| Tool use | PASS |
| Vision | PASS |
| Overthinking (36 combinaciones) | 36/36 PASS |
| Contexto verificado | 262 043 tokens (needle recuperado) |
| Decode (p256, C1, DGX Spark) | 4,3411 tok/s |

La prueba de contexto largo es una recuperación de aguja en la ventana nativa, no una afirmación de recall perfecto en todas las tareas. El autor indica explícitamente que el intento de expansión a 1M tokens se detuvo antes de completarse y no se considera un éxito.

## Requisitos de hardware

- **VRAM estimada**: en BF16, los pesos ocupan aproximadamente 52 GB (según el autor), por lo que se necesita una GPU con al menos 52-60 GB de VRAM para inferencia sin cuantización. Con cuantización GGUF (disponible en el repositorio de Jiunsong) puede reducirse a ~28-35 GB según el nivel (Q4_K_M, Q5_K_M, etc.).
- **GPU recomendadas**: NVIDIA A100 80 GB, H100 80 GB, RTX 4090 (solo con cuantización GGUF) o hardware similar con soporte para BF16. El autor mide la velocidad en un DGX Spark.
- **Cabe en consumer GPU**: sí, en una RTX 4090 (24 GB) solo con cuantización GGUF de baja precisión; en RTX 3090/4090 no cabe sin cuantizar.
- **Opciones de despliegue**: vLLM (soporte oficial en el script `serve_superqwen38_replica.sh`), llama.cpp/Ollama (mediante los GGUF de Jiunsong), TGI (compatible con `transformers`). El modelo requiere la variable `QWEN38_SPECULATIVE_TOKENS=0` en el script de vLLM.
- **Latencia y throughput**: medida de decode de 4,341 tok/s en DGX Spark con concurrency 1 y prompt de 256 tokens. No se proporcionan datos de throughput para concurrency alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| **SuperQwen3.8-27b-abliterated** | 27,78 B | 262 144 | Apache-2.0 | Edición abliterada, visión, tool calling, BF16 |
| **Qwen3.8-27B** (base) | 27,78 B | 262 144 | Apache-2.0 | Modelo original de Alibaba, con rechazo y overthinking |
| **Qwen3.5-27B** (base) | 27,78 B | 262 144 | Apache-2.0 | Modelo anterior de la serie Qwen3.5, sin edición abliterada |
| **huihui_ai/Qwen3.8-abliterated:27b** | 27,78 B | 262 144 | Apache-2.0 | Otra variante abliterada distribuida vía Ollama, sin datos de edición publicados |
| **douyamv/Qwen3.8-27B-abliterated** | 27,78 B | 262 144 | Apache-2.0 | Variante abliterada en LLM Explorer, sin métricas publicadas |

No se dispone de comparaciones cuantitativas de rendimiento (MMLU, HumanEval) entre estas variantes. La diferencia principal es que SuperQwen3.8-27b-abliterated documenta exhaustivamente su proceso (tensores editados, hashes, corpus) y corrige el overthinking, algo que las otras variantes no detallan.

## Limitaciones y advertencias

- La abliteración reduce la dirección de rechazo medida, lo que puede sacar a la luz contenido que el modelo base declinaría. No implica que todas las respuestas sean correctas, inofensivas o adecuadas para cualquier despliegue; el operador es responsable de los controles de acceso y de las salvaguardas posteriores.
- El modelo puede tener sesgos y alucinaciones, al igual que su padre; la edición no corrige estos problemas.
- Aunque el contexto se verifica en 262K tokens, el autor advierte que la aceptación de longitud larga no es una garantía de recuperación perfecta en todas las tareas.
- El intento de expansión a 1M tokens se detuvo antes de completarse y no se considera como un éxito, por lo que no se recomienda confiar en esa capacidad.
- La licencia Apache-2.0 permite uso comercial, pero el comportamiento "uncensored" puede generar contenido que infrinja políticas de plataformas o normativas locales; se recomienda moderación posterior.
- El repositorio original solo está en BF16 (100 GB); para entornos con menos VRAM se necesita recurrir a los GGUF externos, que no están verificados por el autor.
- Solo se declaran los idiomas inglés y coreano; el rendimiento en otros idiomas no está documentado.
- La velocidad de decodificación (4,34 tok/s) se midió en un DGX Spark específico y puede variar significativamente según hardware y configuración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vishrutJ/SuperQwen3.8-27b-abliterated
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- GGUF de Jiunsong (cuantizaciones): https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-GGUF
- Variante en Ollama (huihui_ai): https://ollama.com/huihui_ai/Qwen3.8-abliterated:27b
- Listado en LLM Explorer (douyamv): https://llm-explorer.com/model/douyamv%2FQwen3.8-27B-abliterated,3LdfknxszamsiexUMwA197
- Repositorio sparkDash (referencia de medición): https://github.com/MiaAI-Lab/sparkDash
