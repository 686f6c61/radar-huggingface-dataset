# ThakiCloud/Qwen3-8B-NVFP4A16-INT8-Mixed-B200

## Resumen
Qwen3-8B-NVFP4A16-INT8-Mixed-B200 es una cuantización mixta de precisión del modelo Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`) publicada por ThakiCloud. El checkpoint reduce el peso del modelo a 5,92 GiB de memoria en una NVIDIA B200 combinando NVFP4A16 (pesos FP4 E2M1 con grupo de tamaño 16 y activaciones de 16 bits) en el cuerpo del transformer con 46 unidades en INT8 weight-only (41 de atención y 5 de MLP) y el `lm_head` también en INT8. No hay reentrenamiento: el proceso es exclusivamente de calibración con GPTQ y se empaqueta en formato `compressed-tensors`.

El modelo se presenta como un release experimental y de investigación que acompaña a un artículo aún no publicado (*Beyond Bitwidth: Deployment-Constrained Mixed-Precision Quantization for Multilingual LLM Inference on NVIDIA Blackwell*). Su relevancia radica en que demuestra que es posible servir un modelo de 8B en una GPU Blackwell con un presupuesto de memoria muy ajustado manteniendo, según sus propios datos, la no inferioridad estadística frente a BF16 en la mayoría de ejes evaluados, con la excepción explícita del eje numérico.

La validación se limita a un escenario muy estrecho: una única B200, vLLM 0.29.0, decodificación greedy, `enable_thinking=False` y `max_model_len` de 8192. El autor advierte que no ha sido validado ni aprobado para producción ni servicio comercial, y que no ha pasado evaluaciones de seguridad ni de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B), cuantización mixta NVFP4A16 + INT8 |
| Parametros totales | 4.422.153.216 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens verificados (`max_model_len`); contexto nativo del base no verificado en este checkpoint |
| Tipos de cuantizacion | NVFP4A16 (FP4 E2M1, grupo 16, activaciones 16 bits) en el cuerpo; INT8 weight-only (simétrico, grupo 128) en 46 unidades y `lm_head`; embeddings en BF16 |
| Idiomas soportados | ko, en (según model card y tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (llm-compressor 0.15.0, compressed-tensors 0.20.1) |

## Arquitectura y entrenamiento
El checkpoint parte de Qwen3-8B, un transformer decoder-only de la familia Qwen3, y aplica una receta de cuantización post-entrenamiento denominada A81 en el artículo asociado. El cuerpo se cuantiza con NVFP4A16 usando GPTQ: pesos en FP4 E2M1 con grupo de tamaño 16 y activaciones de 16 bits. Se preservan 46 unidades lineales en INT8 weight-only (41 correspondientes a atención y 5 a MLP) y el `lm_head` también en INT8 con grupo de tamaño 128; los embeddings se mantienen en BF16. No hay entrenamiento ni ajuste fino: solo calibración.

La innovación técnica principal es la asignación selectiva de precisión por capa bajo restricciones de despliegue, orientada específicamente a los kernels empaquetados de NVIDIA Blackwell. En la evaluación se confirma que las 144 capas lineales cuantizadas se ejecutan con los kernels esperados (MarlinNvFp4 en 98 capas y Marlin en 46) sin ningún fallback a coma flotante, lo que garantiza que la ruta de cuantización se aplica íntegramente en la pila verificada.

## Capacidades
- Generación de texto conversacional en coreano e inglés, con plantilla de chat propia de Qwen3.
- Razonamiento y respuesta a preguntas de conocimiento general, evaluado sobre KMMLU, KoBEST, MMLU, HellaSwag y BIG-bench.
- Razonamiento multi-paso, evaluado sobre BBH.
- Razonamiento matemático, evaluado sobre HRM8K y un generador numérico programático (con la salvedad de precisión numérica indicada más abajo).
- Modo thinking desactivable mediante `chat_template_kwargs.enable_thinking`; la validación se realizó únicamente con thinking desactivado.
- Soporte de tool calling y function calling: heredado del modelo base Qwen3-8B, aunque no verificado en este checkpoint.
- Capacidades de agente y multi-step reasoning: heredadas del base, no verificadas en este checkpoint.
- Capacidades multilingües limitadas a coreano e inglés según la model card; el resto de idiomas del base no se declaran soportados.

## Casos de uso
- Investigación sobre cuantización mixta en Blackwell: el checkpoint sirve como referencia reproducible para estudiar el compromiso entre precisión numérica y ahorro de memoria en GPUs B200, con hashes verificables y gates preregistrados.
- Evaluación comparativa de recetas de cuantización: permite contrastar la receta A81 frente a otras alternativas (por ejemplo, INT8 puro o FP8) sobre el mismo conjunto REL-81 y las mismas condiciones de decodificación.
- Servicio de chat en coreano e inglés con presupuesto de memoria ajustado: con 5,92 GiB de pesos, un único B200 puede alojar el modelo con `--gpu-memory-utilization 0.90` y `max-model_len` 8192, dejando margen para KV cache en cargas de baja concurrencia.
- Prototipado de asistentes conversacionales bilingües coreano-inglés: la plantilla de chat de Qwen3 y la API compatible con OpenAI de vLLM permiten integrar el modelo en aplicaciones existentes sin cambios de código.
- Benchmarking de kernels MarlinNvFp4 y Marlin en vLLM 0.29.0: útil para validar el rendimiento de los kernels empaquetados de cuantización en hardware Blackwell antes de adoptarlos en producción.
- Docencia y experimentación con `compressed-tensors`: el repositorio incluye `recipe.yaml`, `SHA256SUMS` y scripts de verificación que facilitan reproducir el pipeline de cuantización y comprobar la integridad del checkpoint.

## Benchmarks y rendimiento
La model card reporta resultados sobre REL-81, un conjunto de 4.694 ítems (coreano 1.530, inglés 914, numérico 1.319, razonamiento 626, más matemáticas coreanas 245 e in-domain coreano 60 para reporte) construido tras el artículo y sin solapamiento con DEV-80, SEL-81 ni FINAL-81. La evaluación se ejecutó una sola vez con BF16 sobre los mismos ítems, decodificación y GPU, con veredicto RELEASE_PASS y validez VALID.

| Gate | Límite | Este checkpoint | Intervalo 95% | Estado |
|---|---|---|---|---|
| Kernels (de 144 capas lineales cuantizadas) | MarlinNvFp4 98 / Marlin 46, sin fallback a float | 98 / 46, fallback 0 | — | (truncado en la información disponible) |
| Eje numérico | −3 puntos frente a BF16 | −2,20 puntos | −4,13 a −0,27 | cruza el límite; no inferioridad no establecida |

No se han publicado en la información disponible los resultados completos del resto de gates (conocimiento, razonamiento, coreano, inglés) ni métricas por benchmark individual (MMLU, KoBEST, BBH, HRM8K, etc.). Tampoco se dispone de datos de latencia o throughput más allá de que la latencia se midió a batch size 1.

## Requisitos de hardware
- VRAM estimada para inferencia: 5,92 GiB de pesos en el formato cuantizado; el consumo total depende del `--gpu-memory-utilization` configurado (0,90 en la validación) y del tamaño de la KV cache para `max_model_len` 8192.
- GPU recomendadas: NVIDIA B200 (única GPU verificada). El autor indica explícitamente que no se ha validado en otras GPU, incluidas otras variantes Blackwell, Hopper y anteriores.
- Cabe en consumer GPU: no disponible; no se ha verificado en RTX 4090 ni en otras GPU de consumo, y los kernels MarlinNvFp4/Marlin solo se confirmaron en B200.
- Opciones de despliegue: vLLM 0.29.0 (`vllm/vllm-openai:v0.29.0`, torch 2.13.0+cu130) mediante `vllm serve` o `vllm.LLM` offline. No verificado en Transformers, TGI, SGLang ni llama.cpp.
- Latencia y throughput: latencia medida a batch size 1; no se reportan valores numéricos en la información disponible. Throughput a batch sizes mayores no verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThakiCloud/Qwen3-8B-NVFP4A16-INT8-Mixed-B200 | 4,42 B (cuantizado) | 8192 verificado | Apache 2.0 | Hugging Face, vLLM 0.29.0 en B200 | Release experimental; validado solo en B200 |
| Qwen/Qwen3-8B (BF16) | 8 B | contexto nativo del base (no indicado aquí) | Apache 2.0 | Hugging Face, amplia compatibilidad | Referencia de calidad frente a la que se mide el checkpoint |
| Otras cuantizaciones de Qwen3-8B (INT8, FP8, GGUF) | 8 B (pesos reducidos) | depende del runtime | Apache 2.0 (heredada) | Hugging Face, llama.cpp, vLLM, etc. | No comparadas en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada más allá de la comparación interna frente a BF16 sobre REL-81.

## Limitaciones y advertencias
- Precisión numérica: la no inferioridad estadística frente a BF16 en preguntas numéricas no está establecida; el intervalo de confianza del −2,20 puntos (−4,13 a −0,27) cruza el límite de −3 puntos.
- Release experimental: no validado ni aprobado para producción ni servicio comercial; sin evaluación de seguridad ni de dominio.
- Alcance de validación muy estrecho: una sola B200, vLLM 0.29.0, decodificación greedy, `enable_thinking=False`, `max_model_len` 8192. Cualquier otra combinación de GPU, motor o modo de decodificación queda fuera de lo verificado.
- Riesgo de fallback a float en otras pilas: en otros stacks los mismos pesos pueden cargarse con kernels distintos o caer a coma flotante, con cambios en velocidad y precisión.
- Idiomas: solo coreano e inglés declarados; el resto de idiomas del base Qwen3-8B no se declaran soportados en este checkpoint.
- Contexto: no verificado más allá de 8192 tokens; no se debe asumir el contexto nativo del base sin validación.
- Sesgos y alucinaciones: no se reportan evaluaciones específicas de sesgo ni de tasa de alucinación en la información disponible; se heredan los del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso en producción sin validación adicional.
- Integridad: el checkpoint ID cubre 7 archivos; las model cards y el propio `SHA256SUMS` no están cubiertos por el hash, por lo que conviene verificar con `sha256sum -c SHA256SUMS`.

## Enlaces
- Hugging Face: https://huggingface.co/ThakiCloud/Qwen3-8B-NVFP4A16-INT8-Mixed-B200
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Model card en coreano: [MODEL_CARD.ko.md](./MODEL_CARD.ko.md) (referenciado en el repositorio)
- Artículo asociado: *Beyond Bitwidth: Deployment-Constrained Mixed-Precision Quantization for Multilingual LLM Inference on NVIDIA Blackwell* (arXiv preprint en preparación; enlace no disponible)
- Repositorio de vLLM: no disponible en la información proporcionada
- Repositorio de llm-compressor: no disponible en la información proporcionada
- Repositorio de compressed-tensors: no disponible en la información proporcionada
