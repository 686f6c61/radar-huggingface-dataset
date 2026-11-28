# TensorRay/Qwen3.8-27B-Uncensored-Full-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-Full-NVFP4 es una cuantización NVFP4 del modelo abliterado `orcarouter/Qwen3.8-27B-Uncensored`, que a su vez deriva del `Qwen/Qwen3.8-27B` de Alibaba. El autor de este empaquetado es TensorRay, que no modifica los pesos en cuanto a comportamiento (misma abliteración, mismo tokenizador y misma plantilla de chat), sino solo la precisión numérica: aplica NVFP4 a todos los `Linear` del stack de texto, tanto pesos como activaciones (W4A4), dejando en BF16 el `lm_head`, la torre de visión, las normas, los embeddings, las `conv1d` de Gated DeltaNet y la cabeza MTP.

El objetivo declarado es servir 131.072 tokens de contexto en una única tarjeta Blackwell de 24 GB. Frente al build mixto NVFP4+FP8 de orcarouter (21,38 GiB en GPU, 22.080 tokens de contexto arrancables), este empaquetado ocupa 17,53 GiB en GPU y libera unos 3,9 GiB que el autor destina íntegramente al pool de KV. El modelo conserva la arquitectura híbrida de Qwen3.8-27B: 64 capas con 48 de atención lineal Gated DeltaNet y 16 de atención completa, torre de visión y cabeza MTP para decodificación especulativa.

La relevancia práctica es doble. Por un lado, demuestra que un modelo de 27.781.427.952 parámetros puede desplegarse con contexto largo en hardware de gama profesional pequeño. Por otro, aporta una medición concreta sobre un riesgo típico de las cuantizaciones agresivas: la pérdida de tool calls por degradación del formato de salida. El autor compara 96 ejecuciones de un prompt de agente y reporta 0/96 fallos en este build frente a 8/96 en otro fine-tune con la misma receta NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`: transformer híbrido con 64 capas (48 Gated DeltaNet de atención lineal + 16 de atención completa), torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (límite del modelo); 131.072 tokens medidos en una tarjeta de 24 GB con pool de KV de 141.663 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (pesos FP4 E2M1 en grupos de 16 con escala FP8-E4M3 por grupo y escala global FP32 por tensor; activaciones FP4 dinámicas por grupo de 16); `lm_head`, torre de visión, normas, embeddings, `conv1d` y cabeza MTP en BF16 |
| Idiomas soportados | en, zh, de |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con `compressed-tensors` 0.20.1, esquema `nvfp4-pack-quantized`, un único grupo de configuración; `model_backbone.safetensors` (19,71 GB) y `model_mtp.safetensors` (0,85 GB), 2.687 tensores |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido de 64 capas que combina 48 capas de atención lineal Gated DeltaNet con 16 capas de atención completa, más una torre de visión de 27 bloques con merger y una cabeza MTP (multi-token prediction). Esa mezcla reduce el coste de atención en contextos largos sin renunciar a la atención completa en una fracción de las capas. La torre de visión explica que el pipeline sea `image-text-to-text`, y la cabeza MTP habilita decodificación especulativa.

Sobre el entrenamiento del modelo base no hay información en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí está documentado es la modificación de orcarouter, una abliteración según Arditi et al. 2024 que elimina la dirección de rechazo del modelo, y la modificación de TensorRay, que es exclusivamente de cuantización. Esta se realizó con `llm-compressor` 0.15.0 mediante `QuantizationModifier` (`targets: Linear`, `scheme: NVFP4`), en modo one-shot con redondeo al más cercano, sin GPTQ ni AWQ. La calibración usó el conjunto `perfectblend` con 32 muestras de 2.048 tokens, únicamente para las escalas globales de activación, y se ejecutó íntegramente en CPU.

El reparto de precisión es concreto: 496 lineales en NVFP4 (192 de MLP en las 64 capas, 64 de atención completa en las 16 capas correspondientes y 240 de las proyecciones Gated DeltaNet en las 48 capas restantes), con 126 módulos en la lista de ignorados. La cabeza MTP se mantiene en BF16 de forma deliberada para preservar la tasa de aceptación de la decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens según el límite del modelo).
- Razonamiento y modo de pensamiento extendido, heredado de la familia Qwen3.
- Generación y edición de código, con soporte declarado de function calling.
- Capacidades de agente y razonamiento multi-paso, con tool calling verificado empíricamente por el autor (0 fallos en 96 ejecuciones de un prompt de agente).
- Procesamiento de imagen y texto combinados (`image-text-to-text`) mediante la torre de visión en BF16.
- Decodificación especulativa vía cabeza MTP en BF16.
- Multilingüe en inglés, chino y alemán.
- Comportamiento sin rechazo (abliterado): cumple peticiones que el modelo base rechazaría, incluidas las dañinas, éticas o ilegales.

## Casos de uso

- Análisis de repositorios completos: con 131.072 tokens de contexto efectivos en una tarjeta de 24 GB, el modelo puede recibir varios ficheros de código, documentación y trazas de error en una sola ventana y razonar sobre ellos sin trocear el contexto.
- Agentes de automatización con tool calling: el autor valida 0/96 fallos en el parseo de llamadas a herramientas, lo que lo hace apto para pipelines de agente donde un fallo de formato rompe el flujo; encaja en orquestadores que emitan JSON de función y esperen llamadas bien formadas.
- Documentación técnica multilingüe en inglés, chino y alemán: útil para equipos que mantienen documentación paralela en esos tres idiomas y necesitan traducción y consistencia terminológica en una sola pasada.
- Procesamiento de documentos con imágenes: al conservar la torre de visión en BF16, puede extraer información de capturas, diagramas o páginas escaneadas junto al texto asociado.
- Investigación sobre alineamiento y seguridad: al ser un modelo abliterado, sirve para estudiar la dirección de rechazo, medir la eficacia de la eliminación y evaluar la degradación de capacidades asociada, siempre en entornos controlados y con la moderación externa que el propio autor exige.
- Despliegue en estación de trabajo con GPU Blackwell de 24 GB: sustituye a configuraciones multi-GPU para inferencia de contexto largo, con 22,9 tok/s en un solo stream y 89 tok/s agregados con cuatro streams según la medición del autor.
- Generación de código en producción con moderación propia: el soporte de function calling permite integrarlo en pipelines de CI/CD para revisión automática o generación de parches, aunque requiere filtros externos dado que no incorpora guardarraíles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de despliegue y de fiabilidad de tool calling, medidas en una NVIDIA RTX PRO 4000 Blackwell SFF (24 GB, 70 W) con vLLM 0.34.0, `compressed-tensors` y FlashInfer CUTLASS NVFP4 GEMM:

| Metrica | Este build (NVFP4 completo) | Build mixto NVFP4+FP8 de orcarouter |
|---|---|---|
| Pesos en disco | 20,58 GB | 24,72 GB |
| Pesos en GPU | 17,53 GiB | 21,38 GiB |
| Contexto máximo que arranca en 24 GB | 131.072 tokens (pool de KV 141.663) | 22.080 tokens |
| Decodificación, 1 stream | 22,9 tok/s | no disponible |
| Decodificación, 4 streams | 89 tok/s agregados | no disponible |
| Pérdida de tool calls (96 ejecuciones) | 0/96 | no disponible (otro fine-tune con la misma receta NVFP4: 8/96) |

## Requisitos de hardware

- VRAM estimada para inferencia: 17,53 GiB de pesos en GPU, más el pool de KV; el autor configura 131.072 tokens de contexto con un pool de 141.663 tokens en una tarjeta de 24 GB.
- GPU recomendadas: NVIDIA RTX PRO 4000 Blackwell SFF (24 GB) es la tarjeta medida; cualquier GPU Blackwell con soporte de NVFP4 y al menos 24 GB debería poder ejecutar el mismo empaquetado.
- Cabe en GPU de consumo: sí, en tarjetas Blackwell de 24 GB; en arquitecturas anteriores sin soporte NVFP4 no es viable con este formato.
- Opciones de despliegue: vLLM 0.34.0 con `compressed-tensors` y kernels FlashInfer CUTLASS NVFP4 GEMM; el autor descarta explícitamente el offload a RAM del host (`--cpu-offload-gb`) porque hace cruzar PCIe a cada token.
- Latencia y throughput medidos: 22,9 tok/s en un solo stream y 89 tok/s agregados con cuatro streams en la RTX PRO 4000 Blackwell SFF de 70 W.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TensorRay/Qwen3.8-27B-Uncensored-Full-NVFP4 | 27.781.427.952 | 262.144 (131.072 medidos en 24 GB) | NVFP4 W4A4 completo | Apache 2.0 | Hugging Face, 0 descargas, 1 like |
| orcarouter/Qwen3.8-27B-Uncensored-NVFP4 | no disponible | no disponible (22.080 tokens arrancables en 24 GB según la medición de TensorRay) | Mixta NVFP4 + FP8 | Apache 2.0 | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible (BF16, 55,59 GB en 18 shards) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B | no disponible | no disponible | BF16 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo abliterado: cumple peticiones dañinas, poco éticas o ilegales que el Qwen3.8-27B base rechaza. No incorpora guardarraíles; el autor exige moderación y prevención de abuso propias antes de exponerlo a usuarios finales.
- Riesgo de alucinación: no cuantificado en la documentación; la cuantización NVFP4 de pesos y activaciones puede degradar ligeramente la fidelidad respecto al BF16, aunque el autor no aporta métricas de calidad que lo acoten.
- Cobertura idiomática limitada a inglés, chino y alemán; el rendimiento en castellano no está documentado.
- La cuantización NVFP4 exige hardware Blackwell; no es portable a GPU Ampere o Ada sin reconvertir los pesos.
- El offload a RAM del host degrada gravemente el throughput según la medición del autor y no se recomienda.
- La fiabilidad de tool calling se validó con un único prompt de agente y 96 ejecuciones; no cubre todos los formatos de herramienta ni todos los esquemas de parseo.
- Uso comercial permitido por Apache 2.0, con la responsabilidad legal sobre las salidas recayendo en el desplegador.
- Modelo con 0 descargas y 1 like en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TensorRay/Qwen3.8-27B-Uncensored-Full-NVFP4
- Modelo base abliterado en BF16: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Build mixto NVFP4+FP8 de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
