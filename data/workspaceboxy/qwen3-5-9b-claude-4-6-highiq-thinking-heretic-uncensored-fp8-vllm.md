# workspaceboxy/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-FP8-vLLM

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-FP8-vLLM es una cuantización en FP8 (E4M3, block-wise) del modelo DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED, publicada por el usuario workspaceboxy. El modelo base es un fine-tune de la familia Qwen3.5 de Alibaba, derivado a su vez de una variante "Heretic" sin censura y destilada con trazas de razonamiento al estilo Claude 4.6. Esta versión concreta no aporta pesos nuevos: su valor está en comprimir los 9.409.813.744 parámetros originales (unos 19 GB en BF16) hasta aproximadamente 11,3 GB en FP8, manteniendo visión, modo thinking y tool calling.

La relevancia práctica es que permite ejecutar un modelo multimodal de 9B con una ventana de contexto completa de 262.144 tokens en una única GPU de consumo de 24 GB (RTX 3090), algo inviable con los pesos en BF16. Está empaquetado específicamente para vLLM, con parser de razonamiento `qwen3`, parser de tool calling `qwen3_coder` y soporte de KV cache en FP8.

Conviene señalar que se trata de un artefacto derivado de un fine-tune comunitario sin benchmarks publicados, con fecha de creación de 2026-11-16 y cero descargas en el momento de la consulta, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (con capas específicas tipo DeltaNet según la model card); multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | FP8 E4M3 block-wise [128, 128], escalas `weight_scale_inv` en bfloat16, activaciones dinámicas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 9B parámetros de la familia Qwen3.5, con soporte multimodal (visión) y modo de razonamiento explícito. La model card menciona capas específicas de "DeltaNet" que se mantienen en precisión original durante la cuantización, lo que sugiere una arquitectura híbrida con componentes de atención lineal o de estado recurrente, aunque no se detalla su configuración exacta.

El linaje de entrenamiento es el siguiente: Qwen/Qwen3.5-9B (base, Apache 2.0) → trohrbaugh/Qwen3.5-9B-heretic-v2 (fine-tune sin censura) → DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED (destilación de razonamiento estilo Claude 4.6) → esta cuantización FP8. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en ninguna de las etapas.

La innovación técnica de este repositorio es exclusivamente la cuantización: 200 capas lineales (proyecciones y MLP) se cuantizan a FP8 con bloques de 128×128, mientras que 560 componentes (embeddings, normalizaciones, encoder de visión, lm_head y capas específicas de DeltaNet) se mantienen en su precisión original. El error máximo de cuantización declarado es del 3,57 % relativo. La cuantización se realizó en GPU (CUDA) y sigue las convenciones de lovedheart/Qwen3.5-9B-FP8.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262K tokens.
- Modo thinking/razonamiento explícito, con parser dedicado `qwen3` en vLLM.
- Entrada multimodal image-text-to-text: procesa imágenes (hasta 8 por prompt) y vídeo (hasta 4 por prompt) según la configuración de ejemplo.
- Tool calling / function calling, con parser `qwen3_coder` y `--enable-auto-tool-choice` en vLLM.
- Capacidades de razonamiento multi-paso derivadas de la destilación de trazas de Claude 4.6.
- Generación de código (el parser de tool calling está orientado a `qwen3_coder`).
- Comportamiento "uncensored": el fine-tune Heretic reduce los rechazos del modelo original.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 262K tokens de ventana se pueden mantener conversaciones o analizar documentos extensos (manuales, contratos, bases de código) sin truncar, en una sola GPU de 24 GB.
- Análisis de documentos con imágenes: al conservar el encoder de visión, puede extraer información de capturas, diagramas o páginas escaneadas combinadas con texto en el mismo prompt.
- Agente con tool calling: integrable en vLLM con `--enable-auto-tool-choice` y parser `qwen3_coder` para orquestar llamadas a APIs, consultas a bases de datos o ejecución de comandos en flujos multi-paso.
- Generación y revisión de código en pipelines de CI/CD: el modo thinking permite razonar sobre parches y el tool calling facilita la integración con sistemas de tickets o repositorios.
- Despliegue self-hosted con API compatible OpenAI: el contenedor de ejemplo expone `/v1/chat/completions`, lo que permite sustituir proveedores externos en aplicaciones existentes sin cambiar el cliente.
- Investigación sobre alineación y censura: la variante Heretic permite estudiar el comportamiento del modelo ante prompts sensibles y comparar con el Qwen3.5 base.
- Prototipado de razonamiento con trazas: útil para experimentar con destilaciones de cadenas de pensamiento y evaluar su calidad frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de cuantización (error máximo relativo del 3,57 %) y de consumo de VRAM, no resultados de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,3 GB para pesos FP8, más 10,9 GB de KV cache FP8 a contexto completo, más 0,5 GB de CUDA graphs y overhead; total de unos 22,5 GB sobre 24 GB.
- GPU validadas: RTX 3090 (24 GB, Ampere, sin FP8 nativo; usa kernel Marlin W8A16 para descompresión de pesos).
- GPU compatibles según el autor: RTX 4090, A100 y H100 (24+ GB de VRAM); en Ada/Hopper se usa FP8 nativo, lo que debería reducir latencia frente a Ampere.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 con 24 GB, siempre que se use KV cache FP8 y se limite `max-num-seqs` (el ejemplo usa 2).
- Opciones de despliegue: vLLM (probado, imagen `vllm/vllm-openai:nightly`); SGLang no validado; llama.cpp no soportado (requiere usar variantes GGUF).
- Latencia y throughput: no disponibles; la configuración de ejemplo limita a 2 secuencias concurrentes por la presión de memoria del contexto completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (FP8 vLLM) | 9,41B | 262K | safetensors FP8 | Apache 2.0 | Cuantizado para vLLM, visión y thinking preservados |
| DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED | 9,41B | 262K (según base) | safetensors BF16 | Apache 2.0 | Modelo base sin cuantizar; ~19 GB, no cabe en 24 GB a contexto completo |
| lovedheart/Qwen3.5-9B-FP8 | 9B | no disponible | safetensors FP8 | no disponible | Referencia de formato FP8 citada por el autor |
| Qwen/Qwen3.5-9B | 9B | no disponible | safetensors | Apache 2.0 | Modelo original de Alibaba, con alineación estándar |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento real del fine-tune y de la cuantización no está validado más allá de la métrica de error de cuantización.
- El fine-tune "Heretic" reduce deliberadamente los rechazos, lo que implica mayor riesgo de generar contenido dañino, sesgado o inapropiado; requiere filtros y moderación externos en producción.
- Riesgo de alucinación inherente a un modelo de 9B destilado de trazas de razonamiento de otro modelo; el modo thinking no garantiza corrección factual.
- El error de cuantización del 3,57 % puede degradar tareas sensibles a precisión numérica o de código; conviene comparar contra el BF16 antes de adoptarlo.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe amplia.
- Soporte limitado a vLLM: llama.cpp no es compatible y SGLang no está validado, lo que restringe las opciones de despliegue.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; tratar como artefacto experimental.
- La licencia Apache 2.0 se hereda de los modelos upstream, pero el uso comercial de una variante "uncensored" puede incumplir políticas de plataformas o normativa aplicable según el contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/workspaceboxy/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-FP8-vLLM
- Modelo base (fine-tune DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Fine-tune Heretic intermedio: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de formato FP8: https://huggingface.co/lovedheart/Qwen3.5-9B-FP8
