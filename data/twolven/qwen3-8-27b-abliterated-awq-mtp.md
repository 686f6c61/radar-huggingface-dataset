# twolven/Qwen3.8-27B-abliterated-AWQ-MTP

## Resumen

El modelo `twolven/Qwen3.8-27B-abliterated-AWQ-MTP` es una cuantización AWQ en formato W4A16 del modelo Qwen3.8-27B al que se le ha eliminado el rechazo a instrucciones dañinas (proceso conocido como "abliteration"). El autor, twolven, parte del checkpoint bf16 `JonathanColetti/Qwen3.8-27B-Uncensored`, que es la única versión abliterada de Qwen3.8-27B que conserva el módulo MTP (Multi-Token Prediction) para decodificación especulativa. El resultado es un modelo multimodal (texto e imagen) con una ventana de contexto de 262.144 tokens y licencia Apache 2.0.

La relevancia de este modelo radica en que combina tres características difíciles de encontrar juntas: pesos cuantizados a 4 bits con activaciones de 16 bits (W4A16) que funcionan bajo vLLM en GPUs Ampere, la eliminación de los mecanismos de rechazo, y la preservación del módulo MTP. Según la model card, es el único build AWQ/W4A16 de un Qwen3.8-27B abliterado, y uno de los dos únicos que mantienen el MTP. El autor reporta un throughput de 84 tokens por segundo en 2× RTX 3090, un 45 % superior al mismo modelo sin MTP, y verifica que la visión, el tool calling y la capacidad de recuperación de agujas en contexto largo se mantienen tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5 (`qwen3_5`): 64 capas, 48 de atención lineal (`Qwen3_5GatedDeltaNet`) + 16 de atención completa (cada 4ª capa); torre de visión de 27 capas |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | AWQ W4A16 asimétrico, grupo 128; torre de visión, `lm_head`, `mtp.*` y escalares `in_proj_a`/`in_proj_b` en bf16 |
| Idiomas soportados | No disponible (no se especifica en la documentación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ, comprimidos con compressed-tensors); también disponible vía vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B (de Alibaba) utiliza una arquitectura híbrida denominada `qwen3_5`, que combina 48 capas de atención lineal basadas en `Qwen3_5GatedDeltaNet` con 16 capas de atención completa (full attention) intercaladas cada cuatro capas. Esta mezcla busca reducir el coste computacional del contexto largo manteniendo la calidad en tareas que requieren atención global. Además, el modelo incluye una torre de visión de 27 capas que lo convierte en un VLM (vision-language model) capaz de procesar imágenes.

El proceso de cuantización fue realizado con `llm-compressor` 0.13.0, aplicando AWQ con formato `W4A16_ASYM` y tamaño de grupo 128. La calibración se hizo con 128 muestras de 1024 tokens del dataset `HuggingFaceH4/ultrachat_200k`. El autor dejó deliberadamente en bf16 la torre de visión completa, el `lm_head`, el módulo MTP (`mtp.*`) y los escalares per-head `in_proj_a`/`in_proj_b` (48 valores por cabeza) que controlan la regla delta, ya que cuantizarlos a 4 bits sería destructivo y no aportaría ahorro. También se omitió el suavizado `v_proj → o_proj` por incompatibilidad de formas entre GQA y la proyección de salida.

El módulo MTP (Multi-Token Prediction) se conserva como módulo de decodificación especulativa, con una capa adicional (`mtp_num_hidden_layers: 1`) que predice hasta 3 tokens por paso. Según las mediciones del autor, el MTP activo multiplica el throughput por 1,45× respecto al mismo modelo con MTP deshabilitado, pero un MTP mal cargado (sin pesos) reduce el rendimiento a 0,57×, por lo que su correcta integración en el servidor es crítica.

## Capacidades

- Generación de texto y razonamiento multilingüe (idiomas concretos no especificados).
- Comprensión de imágenes: el modelo es un VLM, capaz de describir formas, colores y leer texto incrustado en imágenes (verificado tras la cuantización).
- Tool calling / function calling: soportado y verificado (genera argumentos JSON correctos).
- Razonamiento multi-paso con modo "thinking" activable (`enable_thinking`), con niveles de esfuerzo configurables.
- Decodificación especulativa mediante MTP: acelera la inferencia sin cambiar la semántica del modelo.
- Ventana de contexto de 262.144 tokens, con recuperación de agujas verificada hasta 250.060 tokens.
- Eliminación de rechazo (abliteration): el modelo no aplica los mecanismos de negativa típicos de los modelos alineados, lo que permite respuestas sin censura en dominios sensibles.
- Soporte de agentes: compatible con `--enable-auto-tool-choice` y parser de herramientas `qwen3_coder` en vLLM.

## Casos de uso

- Asistentes conversacionales sin restricciones de contenido: el abliteration elimina las negativas automáticas, por lo que puede usarse en aplicaciones de rol, escritura creativa o investigación donde se necesite explorar temas sensibles sin filtros. Su contexto de 262K permite mantener conversaciones muy largas con memoria completa.
- Generación de código en producción con tool calling: al soportar function calling y el parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para generar código, revisar PRs o automatizar tareas de desarrollo, con la ventaja de un throughput alto (84 t/s en 2× RTX 3090) que lo hace viable para uso interactivo.
- Análisis de documentos largos con imágenes: su naturaleza multimodal y su contexto de 262K permiten procesar informes extensos que incluyan figuras, gráficos o capturas, extrayendo información tanto textual como visual en una sola pasada.
- Recuperación de información en bases documentales: la verificación de needle retrieval a 250K tokens indica que puede localizar datos específicos en contextos muy largos, útil para motores de búsqueda internos o asistentes de conocimiento empresarial.
- Investigación en seguridad y alineación: el modelo abliterado sirve como objeto de estudio para analizar los efectos de la eliminación de rechazo en modelos de gran tamaño, comparando comportamientos con la versión original.
- Despliegue en hardware modesto: con 9,37 GiB de pesos por GPU en W4A16, cabe en GPUs de consumo como RTX 3090 o RTX 4090 (con tensor parallelism), permitiendo ejecutar un VLM de 27B con contexto máximo en entornos sin GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica explícitamente que no se realizó comparación de perplexity ni de benchmarks contra el modelo fuente en bf16, y advierte que la cuantización W4 conlleva cierta pérdida de precisión no cuantificada.

Sí se proporcionan mediciones de rendimiento de inferencia, obtenidas en 2× RTX 3090 con tensor parallelism 2 y vLLM (versión nightly v0.20.2rc1.dev129), con 600 tokens de salida y modo thinking desactivado:

| Metrica | Este modelo (W4A16) | FP8 oficial |
|---|---|---|
| Throughput (c=1) | 84 t/s mediana (máx. 93) | 57 t/s |
| Pesos por GPU | 9,37 GiB | 15,11 GiB |
| Capacidad de KV cache | 560.900 tokens | 266.537 tokens |
| Concurrencia máxima a 262K | 2,14× | 1,02× |
| Longitud de aceptación MTP | 2,96 / 3 (~60 %) | 2,80 |

Efecto del MTP medido en el mismo modelo:

| Estado MTP | Mediana | vs sin MTP |
|---|---|---|
| Deshabilitado | 57,9 t/s | 1,00× |
| Habilitado (funcionando) | 84 t/s | 1,45× |
| Habilitado pero pesos no cargados | 33 t/s | 0,57× |

## Requisitos de hardware

- VRAM estimada: 9,37 GiB de pesos por GPU en W4A16 (con tensor parallelism 2). La KV cache en fp8 para 262K tokens requiere aproximadamente 4,6 GiB adicionales. En total, el modelo cabe en 2× RTX 3090 (24 GiB cada una) con `--gpu-memory-utilization 0.95`.
- GPUs recomendadas: el autor valida el funcionamiento en 2× RTX 3090 (Ampere). También debería funcionar en RTX 4090, A100, H100 y otras GPUs compatibles con vLLM y AWQ. La elección de W4A16 está pensada para Ampere, donde FP8 no está disponible.
- Compatibilidad con GPUs de consumo: sí, con tensor parallelism 2 en dos GPUs de 24 GiB. En una sola GPU de 24 GiB no cabría el contexto máximo, pero con contexto reducido podría intentarse.
- Opciones de despliegue: vLLM (validado con `vllm/vllm-openai:nightly`), con flags específicos como `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`, `--enable-chunked-prefill`. No se mencionan Ollama, llama.cpp ni TGI.
- Latencia y throughput: 84 t/s mediana (hasta 93) con un solo stream en 2× RTX 3090. Con MTP deshabilitado baja a 57,9 t/s. Un MTP mal configurado puede degradar a 33 t/s.
- Nota operativa: se recomienda `NCCL_P2P_DISABLE=1` en entornos con GPUs de consumo y `--disable-custom-all-reduce` para evitar problemas de comunicación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad para comparar directamente con alternativas. Sin embargo, se puede comparar estructuralmente con las variantes más cercanas:

| Modelo | Cuantización | MTP | Abliteration | Contexto | Formato |
|---|---|---|---|---|---|
| twolven/Qwen3.8-27B-abliterated-AWQ-MTP | AWQ W4A16 | Sí | Sí | 262K | safetensors |
| Qwen/Qwen3.8-27B (original) | BF16/FP8 | Sí | No | 262K | safetensors |
| JonathanColetti/Qwen3.8-27B-Uncensored | BF16 | Sí | Sí | 262K | safetensors |
| Otras derivadas abliteradas (GGUF, MLX, NVFP4, MXFP4, INT8) | Varios | Generalmente no | Sí | 262K | GGUF/MLX/etc. |

La principal diferencia frente al original es la eliminación del rechazo y la cuantización a 4 bits, que reduce el uso de VRAM a menos de la mitad del FP8 (9,37 vs 15,11 GiB por GPU) y aumenta la capacidad de KV cache en un factor 2,1×. Frente a otras versiones abliteradas, la ventaja es la combinación de W4A16 + MTP, que permite una inferencia rápida en Ampere sin sacrificar la decodificación especulativa.

## Limitaciones y advertencias

- Pérdida de calidad no cuantificada: la cuantización W4A16 conlleva una degradación respecto a bf16/FP8 que el autor no ha medido. No se han publicado métricas de perplexity ni de benchmarks de tareas.
- Riesgo de alucinación y sesgos: al ser un modelo abliterado, es más propenso a generar contenido sin filtros, incluido material dañino, ilegal o falso. No se han evaluado sesgos específicos de esta versión.
- Dependencia de vLLM reciente: el modelo requiere una versión de vLLM que soporte `Qwen3_5ForConditionalGeneration` y el proposer `Qwen3_5MTP`. Si el MTP no carga correctamente, el rendimiento cae a 33 t/s (peor que sin MTP), y el fallo no se manifiesta como error de carga, sino como una regresión misteriosa de throughput.
- Configuración delicada: el autor detalla que ciertos flags de vLLM son "load-bearing" en hardware de consumo; cambios en `gpu-memory-utilization`, `kv-cache-dtype` o `compilation-config` pueden provocar OOM o degradación de rendimiento.
- Sin evaluación de seguridad: al eliminar el rechazo, el modelo puede responder a instrucciones maliciosas. No se recomienda su uso en entornos de producción sin salvaguardas externas.
- Idiomas no documentados: no se especifica qué idiomas soporta, aunque al derivar de Qwen3.8-27B probablemente herede su cobertura multilingüe, pero no está confirmado.
- Repo sin actividad: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un lanzamiento reciente y poco probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twolven/Qwen3.8-27B-abliterated-AWQ-MTP
- Modelo base (abliterated bf16): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo upstream (original): https://huggingface.co/Qwen/Qwen3.8-27B
- Método de cuantización (llm-compressor): https://github.com/vllm-project/llm-compressor
- Información sobre Qwen3.8-27B (specs y benchmarks): https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Guía de hardware y despliegue: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Notas de la familia Qwen3.8: https://openlm.ai/qwen3.8/
