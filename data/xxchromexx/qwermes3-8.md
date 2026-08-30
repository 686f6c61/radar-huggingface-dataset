# xxchromexx/Qwermes3.8

## Resumen

Qwermes3.8 es un fine-tune del modelo Qwen3.8-27B, desarrollado por el usuario xxchromexx bajo el nombre "Hermes-ft". El modelo original es un transformer híbrido denso de 26.9 mil millones de parámetros con una arquitectura de 64 capas: 48 capas de atención lineal Gated DeltaNet (GDN) y 16 capas de atención completa. El autor ha eliminado el wrapper VLM y la torre de visión del modelo base, dejando una versión solo texto. El repositorio publica dos cuantizaciones GGUF: una en NVFP4 (20 GB) y otra en Q5_K_M (19.2 GB), ambas verificadas con una ventana de contexto de 262.144 tokens.

La relevancia de este lanzamiento radica en que aborda un problema concreto de despliegue: los kernels de GDN en vLLM están limitados a hardware de datacenter (sm_90 y sm_10x) y fallan en GPU Blackwell de estación de trabajo (sm_120, como RTX PRO 6000 o RTX 5090). Las cuantizaciones GGUF funcionan correctamente a través de llama.cpp/Ollama en ese hardware, ofreciendo una alternativa funcional para usuarios con GPU Blackwell consumer. El autor documenta además el proceso de construcción NVFP4 con ModelOpt y los fallos encontrados con otras herramientas, lo que resulta valioso para la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso, 64 capas (48 Gated DeltaNet linear-attention + 16 full-attention) |
| Parametros totales | 26.895.998.848 (26.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | NVFP4 (MLP-only, atención/DeltaNet Q8_0), Q5_K_M, Q4_K_M (bajo petición) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (NVFP4 y Q5_K_M); el checkpoint original safetensors no está incluido en el repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje multimodal con una arquitectura híbrida que combina atención lineal Gated DeltaNet con atención completa. En Qwermes3.8, el autor ha eliminado el wrapper VLM y la torre de visión, dejando únicamente el componente de texto. La arquitectura resultante es densa, con 64 capas: 48 capas de GDN (que usan atención lineal con estado recurrente) y 16 capas de atención completa tradicional. Esta mezcla permite manejar contextos muy largos (262K tokens) con un coste computacional menor que un transformer denso puro.

El fine-tune "Hermes-ft" no incluye información pública sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El autor se centra en el proceso de cuantización: para la versión NVFP4 utilizó ModelOpt 0.46.0 con la configuración `NVFP4_MLP_ONLY_CFG` (MLP cuantizado a NVFP4 con grupo de 16, resto en FP8), seguido de `compress()` para empaquetar escalas de dos niveles, y posterior conversión a GGUF con llama.cpp b10679 usando `--outtype q8_0 --no-mtp`. El proceso requirió renombrar tensores de escala (`weight_quantizer._scale` → `weight_scale`, `_double_scale` → `weight_scale_2`, `input_quantizer._amax` → `input_scale`) y mantener `quantization_config` en config.json para que el convertidor activara el repack NVFP4. El autor advierte explícitamente de que llmcompressor produce GGUFs corruptos para esta arquitectura y que la exportación nativa de unsloth provoca un fallo de memoria.

## Capacidades

- Generación de texto conversacional y de completado, con soporte de plantilla de chat incrustada en el GGUF.
- Razonamiento configurable: la plantilla de chat incluye el parámetro `enable_thinking` (modo thinking) que Hermes envía, lo que permite activar o desactivar el razonamiento explícito.
- Tool calling: la plantilla de chat incluye soporte para herramientas, aunque no se detalla la implementación exacta.
- Ventana de contexto de 262.144 tokens, verificada en ambas cuantizaciones.
- Solo texto: se ha eliminado la torre de visión del modelo base, por lo que no procesa imágenes.
- Multilingüe: únicamente inglés (según la model card).

## Casos de uso

- Asistentes de programación con contexto de repositorio completo: con 262K tokens de ventana, el modelo puede procesar un repositorio de tamaño medio completo en una sola pasada, permitiendo respuestas contextualizadas sobre el código existente.
- Agentes autónomos de larga duración (long-horizon agentic tasks): la combinación de contexto largo y razonamiento configurable lo hace adecuado para tareas que requieren múltiples pasos de decisión y seguimiento de estado durante periodos prolongados.
- Análisis de documentos extensos: contratos, informes técnicos o papers académicos de decenas de miles de tokens pueden procesarse íntegramente, con capacidad de resumir, extraer información y responder preguntas sobre el contenido completo.
- Chatbots de atención al cliente con historial conversacional largo: el contexto de 262K permite mantener el historial completo de una conversación de muchas horas sin truncamiento, mejorando la coherencia en interacciones multi-turno.
- Generación de código en producción con tool calling: puede integrarse en pipelines de CI/CD para generar, revisar y documentar código, utilizando llamadas a herramientas para ejecutar pruebas o consultar APIs.
- Investigación académica: análisis de corpus extensos (por ejemplo, colecciones de artículos científicos) donde se requiere comprender y relacionar información de múltiples documentos en una sola consulta.

## Benchmarks y rendimiento

Los benchmarks se realizaron en una RTX PRO 6000 Blackwell (96 GB, sm_120, CUDA 13) con Ollama 0.33.1, usando 12 prompts × 2, num_ctx 8192, seed 42 y thinking desactivado.

| Métrica | NVFP4 (20 GB) | Q5_K_M (19 GB) |
|---|---|---|
| Decode promedio | 52.7 t/s (rango 48.7–59.1) | 55.8 t/s (rango 53.4–60.4) |
| Prefill promedio | 589.6 t/s | 593.3 t/s |
| VRAM usada | 23.6 GB | 22.5 GB |

Perplejidad en wikitext-2 (test completo de 1.29 MB, llama-perplexity, ngl 99, c 8192):

| Cuantización | PPL |
|---|---|
| Q5_K_M | 5.8354 ± 0.035 |
| NVFP4 | 5.9276 ± 0.036 |

La perplejidad del NVFP4 es un 1.6% peor que la del Q5_K_M (diferencia ~1.8σ), atribuible a la mantisa de 2 bits del formato FP4 E2M1 frente a los enteros de 5 bits con escalas por bloque del Q5_K_M.

En vLLM sobre sm_120, el modelo sufre un problema de kernel GDN: vLLM 0.27.1 cae al fallback Triton/FLA, con decode de 42.2 t/s y un TTFT fijo de ~2.2 segundos independientemente de la longitud del prompt (medido: 1 token → 2.24 s, ~10k tokens → 4.97 s). El prefill marginal es excelente (~5.500–11.000 tok/s), pero el coste fijo por petición domina en prompts cortos. vLLM 0.22.0 tiene el mismo problema y además rechaza configuraciones de texto sin wrapper VLM.

## Requisitos de hardware

- VRAM estimada: NVFP4 requiere 23.6 GB, Q5_K_M 22.5 GB, Q4_K_M 14.6 GB (este último con offload parcial en una RTX 5080 de 16 GB).
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB), RTX 5090, RTX 5080 (con Q4_K_M), RTX PRO 2000-series, DGX Spark (sm_121). En GPU Blackwell consumer (sm_120) se recomienda usar Ollama o llama.cpp; vLLM no es eficiente por el gate de kernel GDN.
- En GPU de generaciones anteriores (sm_80, sm_89, sm_100) las cuantizaciones GGUF deberían funcionar vía llama.cpp, aunque no hay datos publicados.
- Opciones de despliegue: Ollama (recomendado, tags `Qwermes3.8:nvfp4` y `Qwermes3.8:latest`), llama.cpp, vLLM (con limitaciones en sm_120), TGI (no verificado).
- Latencia y throughput en Ollama (RTX PRO 6000): decode 52.7–55.8 t/s, prefill ~590 t/s. En vLLM: decode 42.2 t/s con TTFT fijo ~2.2 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwermes3.8 (este) | 26.9B | 262K | Híbrido GDN + atención completa | Apache-2.0 | Fine-tune texto-only, GGUF NVFP4/Q5_K_M |
| Qwen3.8-27B (base) | 26.9B | 262K | Híbrido GDN + atención completa, VLM | Apache-2.0 | Modelo multimodal, disponible en safetensors |
| Qwen3-30B-A3B | 30.5B (3.3B activos) | 32K | MoE | Apache-2.0 | Modelo MoE, no híbrido |

No se dispone de benchmarks comparativos publicados entre Qwermes3.8 y otros modelos de la misma categoría. La comparativa se limita a las características de arquitectura y licencia.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay datos sobre rendimiento en otros idiomas.
- No tiene capacidades de visión: la torre de visión del modelo base se ha eliminado.
- La cuantización NVFP4 es ligeramente peor en perplejidad que Q5_K_M (diferencia ~1.8σ), por lo que para tareas de alta precisión se recomienda Q5_K_M.
- En GPU Blackwell consumer (sm_120), vLLM no es una opción viable para uso interactivo debido al TTFT fijo de ~2.2 s; se debe usar Ollama o llama.cpp.
- El Q4_K_M no está disponible públicamente en el repositorio; hay que contactar con el autor.
- El repositorio tiene 0 descargas y 0 likes (publicado recientemente), por lo que la validación comunitaria es mínima.
- No hay información sobre el dataset de fine-tune, posibles sesgos o comportamiento ante prompts adversarios.
- El proceso de cuantización NVFP4 es complejo y propenso a fallos silenciosos; el autor documenta cinco intentos fallidos antes de lograr una versión funcional.
- Riesgo de alucinación inherente a los LLM; no hay datos específicos de este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xxchromexx/Qwermes3.8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia NVFP4 (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Blog sobre DGX Spark y vLLM (confirmación del problema GDN): https://ai-muninn.com/en/blog/dgx-spark-qwen3-122b-vllm-to-atlas-2x
- Página de Qwen3.8 en Ollama: https://ollama.com/library/qwen3.8
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
