# TiagoViana/qwen-sisprec-v2.1-UD-Q4_K_M

## Resumen

qwen-sisprec v2.1 es un ajuste fino supervisado (SFT) del modelo denso Qwen3.8-27B, publicado por el usuario TiagoViana, orientado al dominio del SISPREC, el sistema de precatórios del Tribunal Regional Federal de la 3.ª Región de Brasil. Se distribuye ya cuantizado en GGUF UD-Q4_K_M (15,3 GiB en un único archivo, `file_type 15`) con una imatrix generada por Unsloth, y está pensado para ejecutarse con llama.cpp. Hereda del modelo base 27.320.697.856 parámetros, una ventana de contexto nativa de 262.144 tokens sin RoPE scaling y soporte de visión opcional mediante un proyector `mmproj` aparte.

Su interés técnico reside en el backbone híbrido: arquitectura `qwen35` con 65 bloques, de los cuales solo 16 tienen atención plena y el resto atención lineal (GDN/SSM), lo que reduce el coste del KV cache a 16 KiB por token en cuantización q4 (3,1 GiB a 200.000 tokens). Además incorpora MTP nativo (`nextn_predict_layers = 1`), lo que habilita decodificación especulativa `draft-mtp` sin modelo borrador separado, con tasas de aceptación declaradas del 40-85%.

Es relevante porque reúne tres características poco habituales en un GGUF de 15 GiB: contexto de 256k, decodificación especulativa integrada y especialización vertical en un dominio jurídico-administrativo concreto. Como contrapartida, no hay benchmarks publicados, el repositorio acumula 0 descargas y 0 likes, y la propia model card documenta varias incompatibilidades de despliegue que condicionan su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención plena + atención lineal GDN/SSM), etiquetado `qwen35` en los metadatos GGUF |
| Parametros totales | 27.320.697.856 (modelo denso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) nativos, sin RoPE scaling |
| Tipos de cuantizacion | Pesos: UD-Q4_K_M (`general.file_type 15`), imatrix de Unsloth (`imatrix_unsloth.gguf`, 496 entradas / 1251 chunks). KV cache: fp16, q8_0 o q4. El modelo base dispone de variantes NVFP4 y FP8 para vLLM |
| Idiomas soportados | Portugués (`pt`); la model card y los tags apuntan específicamente a `pt-br` |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único de pesos + `mmproj-qwen3.8-27b-F16.gguf` para visión, F16, ~885 MiB) |

Metadatos adicionales verificados del GGUF:

| Clave | Valor |
|---|---|
| `block_count` | 65 |
| `full_attention_interval` | 4 (16 capas de atención plena + 48 de atención lineal, según la model card) |
| `attention.head_count` / `head_count_kv` | 24 / 4 |
| `attention.key_length` / `value_length` | 256 / 256 |
| `embedding_length` | 5120 |
| `ssm.state_size` / `conv_kernel` / `inner_size` | 128 / 4 / 6144 |
| `nextn_predict_layers` | 1 (MTP nativo) |
| `tokenizer.ggml.tokens` | 248.320 |
| `general.name` | `RUN H200 20260818` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros con backbone híbrido que combina capas de atención completa y capas de atención lineal tipo GDN/SSM. Según los metadatos del GGUF, de los 65 bloques solo 1 de cada 4 usa atención plena (`full_attention_interval = 4`), con 24 cabezas de consulta y 4 de clave/valor, dimensiones de clave y valor de 256 y `embedding_length` de 5120. El estado recurrente del componente SSM tiene tamaño 128, kernel de convolución 4 y tamaño interno 6144. Esta mezcla es la responsable del bajo coste de KV cache: 64 KiB/token en fp16, 32 KiB/token en q8_0 y 16 KiB/token en q4.

Sobre el entrenamiento del ajuste SISPREC, la información disponible se limita a que es un SFT de dominio sobre Qwen3.8-27B; no se especifican número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO. La cuantización se realizó con imatrix de Unsloth en formato UD (Unsloth Dynamic) Q4_K_M. La innovación operativa destacable es el MTP nativo, que permite decodificación especulativa con el propio modelo como borrador (aceptación declarada del 40-85%, longitud media aceptada de 2,2 a 3,4 tokens). Se desconoce igualmente la composición del corpus de especialización, más allá de su vinculación al sistema de precatórios del TRF3.

## Capacidades

- Generación de texto conversacional en portugués de Brasil, con especialización en el dominio de precatórios del SISPREC.
- Procesamiento de contextos muy largos: hasta 262.144 tokens nativos, con coste de KV reducido gracias a las capas de atención lineal.
- Decodificación especulativa mediante MTP nativo (`--spec-type draft-mtp`), sin necesidad de un modelo borrador independiente.
- Capacidad de visión opcional si se carga el proyector `mmproj-qwen3.8-27b-F16.gguf` junto con los pesos.
- Soporte de tool calling y function calling en el modelo base: la receta de vLLM documentada activa `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml`. No hay confirmación de que el ajuste SFT preserve esta capacidad intacta.
- Modo de razonamiento: la receta de vLLM del base usa `--reasoning-parser qwen3`, lo que apunta a un modo thinking en el modelo original. No verificado en esta variante cuantizada.
- Compatibilidad con endpoints tipo OpenAI a través de `llama-server` (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no documentadas para este ajuste; los únicos idiomas declarados son `pt` / `pt-br`.

## Casos de uso

- Tramitación de precatórios: análisis y extracción de datos de expedientes completos (número de proceso, ente deudor, beneficiario, valor, estado de pago) cargando documentos íntegros en la ventana de 262.144 tokens sin fragmentación agresiva.
- Atención al ciudadano o al abogado en portugués de Brasil: conversaciones multi-turno sobre el estado de un precatório, apoyadas en el contexto largo y en el bajo coste de KV para mantener sesiones prolongadas.
- Resumen y búsqueda semántica sobre lotes de expedientes: con 16 KiB/token de KV en q4, es viable mantener varios documentos largos en contexto en una sola GPU de 24 GB, algo inviable con un transformer de atención completa equivalente.
- Triaje y clasificación de peticiones con salida estructurada: generación de JSON o campos normalizados para integrar en el flujo de trabajo del sistema judicial, siempre que se use una plantilla de chat compatible (la plantilla embebida falla con system messages intercalados).
- Borradores de minutas y despachos: generación asistida de textos administrativos repetitivos a partir de plantillas y del expediente en contexto, con revisión humana obligatoria.
- Revisión de consistencia numérica: detección de discrepancias en valores, actualizaciones y correcciones dentro de un expediente. La cuantización Q4_K_M y la ausencia de benchmarks exigen validación manual de cualquier cálculo.
- Análisis de documentación escaneada: uso del proyector de visión para incorporar páginas digitalizadas como imágenes, útil cuando no existe capa de texto en el PDF.
- Despliegue on-premise con datos sensibles: al caber en una única GPU de 24-48 GB, permite procesar documentación judicial sin enviar datos a servicios externos, requisito habitual en el sector público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas jurídicas, y tampoco se han encontrado evaluaciones independientes. Los únicos datos de rendimiento operativo declarados son los de la decodificación especulativa: tasa de aceptación del MTP del 40-85% y longitud media aceptada de 2,2 a 3,4 tokens.

## Requisitos de hardware

- VRAM para los pesos: 15,3 GiB (Q4_K_M) más ~885 MiB del proyector de visión si se activa la modalidad multimodal.
- Presupuesto de KV cache: 64 KiB/token en fp16 (12,2 GiB a 200.000 tokens), 32 KiB/token en q8_0 (6,1 GiB a 200.000 tokens) y 16 KiB/token en q4 (3,1 GiB a 200.000 tokens).
- GPU de 24 GB (RTX 3090, RTX 4090): cabe con contexto en torno a 128k con KV q8_0 (≈4 GiB) y margen para el cálculo de activaciones; a 256k completos el margen se agota y conviene KV en q4.
- GPU de 32-48 GB (RTX 5090, A6000, L40S): configuración cómoda a 256k con KV q8_0 y espacio para un slot adicional.
- GPU de 80 GB (A100, H100): permite varios slots concurrentes o lotes grandes. Los metadatos del GGUF indican que la ejecución de referencia se hizo en una H200 (`general.name = RUN H200 20260818`).
- Despliegue documentado en llama.cpp: `llama-server` con `-ngl 999 -b 4096 -ub 1024 -ctk q8_0 -ctv q8_0 -fa on --spec-type draft-mtp --spec-draft-n-max 3`. El flag `-fa on` exige compilar con `GGML_CUDA_FA_ALL_QUANTS=ON`; sin ese build los kernels de KV cuantizado no existen y el servidor no arranca.
- Despliegue en vLLM: este repositorio es GGUF y la propia model card remite a los pesos NVFP4/FP8 del modelo base (`unsloth/Qwen3.8-27B-NVFP4`) para servir con vLLM, con `--max-model-len 204800 --kv-cache-dtype fp8` y configuración especulativa MTP.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni mediciones de TTFT.
- Advertencias de runtime: `--cache-reuse` queda desactivado de forma silenciosa porque `get_can_shift()` es falso cuando `n_pos_per_embd() > 1`; el parámetro `-c` es el total entre slots, y con `--no-kv-unified` se divide por `-np`.
- Ollama, LM Studio u otros frontends GGUF: compatibilidad plausible por formato, pero no confirmada por el autor. No se dispone de datos al respecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-sisprec v2.1 (este modelo) | 27.320.697.856 (denso) | 262.144 tokens | GGUF UD-Q4_K_M, 15,3 GiB, archivo único | Apache-2.0 | Publicado en HF, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27.320.697.856 (denso) | 262.144 tokens (según el derivado) | Safetensors (precisión completa, no especificada) | No disponible en la informacion proporcionada | Modelo base público en HF |
| unsloth/Qwen3.8-27B-NVFP4 (base cuantizado para vLLM) | 27.320.697.856 (denso) | `--max-model-len 204800` en la receta documentada | NVFP4 | No disponible en la informacion proporcionada | Público en HF; recomendado por el autor para vLLM |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento entre estas variantes. Tampoco se han identificado en la información proporcionada otros modelos de la misma categoría (27B densos, contexto ≥128k) con los que contrastar licencia y disponibilidad de forma rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad, razonamiento, código ni tareas jurídicas, ni antes ni después del ajuste SFT.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta. No existe evidencia externa de comportamiento en producción.
- Especialización estrecha: el SFT sobre un dominio concreto (precatórios del TRF3) puede degradar capacidades generales del modelo base. No se documenta el método de ajuste, el volumen de datos ni si hubo regularización para preservar capacidades.
- Idioma: solo portugués (`pt` / `pt-br`). No hay soporte multilingüe declarado en este ajuste.
- Pérdida por cuantización: Q4_K_M introduce degradación frente a BF16, especialmente sensible en razonamiento de varios pasos y en el manejo de contexto muy largo.
- Sesgos: no documentados. Un ajuste sobre documentación judicial brasileña puede heredar sesgos institucionales, de clase o de género presentes en los textos de origen.
- Riesgo de alucinación: elevado en un dominio con terminología jurídica precisa y cifras económicas. Cualquier valor, plazo o referencia normativa debe verificarse contra el expediente original.
- Plantilla de chat problemática: la plantilla embebida en el GGUF rechaza mensajes de sistema en medio del historial (`System message must be at the beginning.` → HTTP 500). El autor recomienda usar `chat_template-SHARP.jinja` mediante `--chat-template-file`.
- `--cache-reuse` no funciona con este modelo y el servidor lo desactiva sin avisar, lo que afecta al rendimiento en cargas con prefijos compartidos.
- Requisito de compilación: `-fa on` con KV cuantizado obliga a un build específico de llama.cpp (`GGML_CUDA_FA_ALL_QUANTS=ON`).
- Inconsistencia en los metadatos: el GGUF declara 65 bloques, mientras que la model card describe 16 capas de atención plena más 48 lineales (64 en total). Conviene verificar la estructura real antes de dimensionar el KV cache.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B, no incluidos en la información proporcionada.
- Procedencia poco trazable: el autor es un usuario individual, sin paper, sin repositorio de código asociado y sin informe de evaluación. `general.name = RUN H200 20260818` es la única referencia al entorno de ejecución.
- La búsqueda web asociada no devolvió ningún resultado relevante sobre el modelo (solo páginas de recetas en alemán), por lo que no existe cobertura externa ni análisis de terceros.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/TiagoViana/qwen-sisprec-v2.1-UD-Q4_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos NVFP4 del base, recomendados por el autor para vLLM: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Plantilla de chat recomendada: https://huggingface.co/TiagoViana/qwen-sisprec-v2.1-UD-Q4_K_M/blob/main/chat_template-SHARP.jinja
- Proyector de visión: https://huggingface.co/TiagoViana/qwen-sisprec-v2.1-UD-Q4_K_M/blob/main/mmproj-qwen3.8-27b-F16.gguf
- Paper, blog o repositorio de código: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo
