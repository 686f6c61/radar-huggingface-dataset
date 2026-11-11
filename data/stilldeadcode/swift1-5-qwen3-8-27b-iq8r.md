# StillDeadcode/swift1.5-qwen3.8-27b-iq8r

## Resumen

Swift 1.5 Qwen3.8-27B IQ8R + DFlash2 es un contenedor de inferencia cuantizado del modelo ukisai/Swift-1.5-Qwen3.8-27b, un ajuste fino de Qwen3.8-27B orientado a eficiencia en razonamiento. Lo publica StillDeadcode como un unico fichero `.rad` de 28,76 GiB para el motor de inferencia radiance, disenado especificamente para GPUs AMD RDNA4 con ROCm. El modelo integra la torre de vision del checkpoint original y el drafter de difusion por bloques z-lab/Qwen3.8-27B-DFlash2 para decodificacion especulativa.

La relevancia tecnica reside en el esquema de cuantizacion: un tronco int8 con rotacion de Hadamard (formato IQ8R), activaciones tambien int8 (W8A8), escalas u8 por fila y 256 de K con una segunda escala bf16, y un cache KV int8. Segun el autor, este formato alcanza una divergencia KL media de 0,00049 frente al modelo bf16 en el modelo base Qwen3.8-27B, frente a 0,00363 del checkpoint FP8 oficial de Qwen, medido sobre 464.091 posiciones.

El modelo soporta contexto de 262.144 tokens entrenados y pipeline image-text-to-text (imagenes y video en peticiones de chat). Sustituye a la version FP8 previa del mismo autor (StillDeadcode/swift1.5-qwen3.8-27b-fp8) con la misma profundidad de bits pero una rejilla de cuantizacion mas cercana al checkpoint bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con capas de atencion y capas SSM/delta net (proyecciones `ssm_inz`, `ssm_out`, `a`/`b`), torre de vision de 27 bloques; drafter DFlash2 de difusion por bloques |
| Parametros totales | 27B (heredados del nombre del modelo base; no se detalla desglose exacto) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens entrenados |
| Tipos de cuantizacion | Tronco int8 (IQ8R, W8A8, rotacion Hadamard fwht128, grupo 256 con escala u8 + escala bf16); lm_head int8 (grupo 128, escala bf16); drafter con codebook entero de 16 niveles (4 bits) y cabeza de vocabulario a 2 bits; torre de vision, normas, embeddings y proyecciones a/b de la delta net en bf16; cache KV int8 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiqueta `license: other`) |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con atencion clasica y capas de estado recurrente (delta net), a juzgar por las proyecciones `ssm_inz`, `ssm_out` y las proyecciones `a`/`b` que el autor deja en bf16. Incluye una torre de vision de 27 bloques que procesa imagenes y video dentro de peticiones de chat. Sobre esta base, el contenedor anade el drafter DFlash2, un modelo de difusion por bloques que propone tokens candidatos verificados por el modelo principal: los borradores se validan, por lo que afectan a la velocidad y nunca a la salida generada.

El proceso de cuantizacion se realizo con `rad-convert` aplicando la receta `q38-27b-iq8r-rtn.recipe`: cuantizacion round-to-nearest con busqueda de reglas por tensor, rotacion Hadamard no normalizada de 128 elementos, grupo de 256 de K con escala u8 y segunda escala bf16 por fila. Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO) no se recogen en la informacion proporcionada; la model card remite a la del modelo base ukisai/Swift-1.5-Qwen3.8-27b. El autor indica que el drafter se entreno sobre el Qwen3.8-27B base y que tambien genera borradores validos para este ajuste fino.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un ajuste fino de Qwen3.8-27B descrito como "reasoning-efficient".
- Procesamiento de vision: entendimiento de imagenes y video mediante la torre de vision de 27 bloques, con partes `image_url` y `video_url` en mensajes de chat.
- Tool calling y function calling: el servidor expone la API de OpenAI (`/v1/chat/completions`, `/v1/completions`) con soporte de llamadas a herramientas.
- Salida estructurada: soporte de structured output en la API del servidor.
- Decodificacion especulativa: integra el drafter DFlash2 con profundidad elegida automaticamente (`num-speculative-tokens`), alcanzando 12,6 tokens por paso especulativo segun el autor.
- Contexto largo: hasta 262.144 tokens entrenados, con cache KV int8 para reducir memoria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento de contexto largo en documentacion tecnica: con 262.144 tokens de contexto, el modelo puede procesar repositorios completos o expedientes extensos en una sola pasada, util para resumen y extraccion de requisitos sobre corpus grandes.
- Analisis de imagenes y video en flujos de inspeccion: la torre de vision permite enviar fotogramas o clips junto a preguntas de texto, adecuado para revision de contenido visual o extraccion de informacion de capturas y grabaciones.
- Agentes con tool calling en produccion: la API compatible con OpenAI y el soporte de function calling permiten integrar el modelo en orquestadores de agentes existentes sin adaptadores adicionales.
- Extraccion de datos estructurados: la salida estructurada del servidor facilita convertir texto libre o imagenes en JSON validado para pipelines de ingestion.
- Despliegue en hardware AMD: al estar empaquetado para radiance sobre RDNA4 y ROCm, encaja en infraestructuras con Radeon AI PRO R9700 u otras GPUs AMD, evitando dependencias de CUDA.
- Servicio de chat de baja latencia con contexto largo: la decodificacion especulativa con DFlash2 (12,6 tokens por paso) y el cache KV int8 permiten servir conversaciones multi-turno con ventanas amplias en un solo nodo.
- Razonamiento asistido por ordenador en local: el formato int8 reduce el peso a 28,76 GiB, lo que hace viable el despliegue en una o dos GPUs profesionales sin recurrir a precisiones bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de fidelidad de cuantizacion y de velocidad de decodificacion especulativa:

| Metrica | Resultado | Contexto |
|---|---|---|
| Divergencia KL media (formato IQ8R) | 0,00049 | Modelo base Qwen3.8-27B, 464.091 posiciones, split publico del quantization challenge |
| Divergencia KL media (FP8 de Qwen) | 0,00363 | Misma medicion de referencia |
| Tokens por paso especulativo | 12,6 | 24 prompts de chat, Radeon AI PRO R9700, tp: 1, contexto 40K, cache KV int8 |
| Verificacion cualitativa | 3 respuestas correctas | Prueba previa a la subida del modelo |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 28,76 GiB; con cache KV int8 y contexto de 40K el autor lo sirvio en una sola Radeon AI PRO R9700. Para contexto cercano a 200K se recomienda tensor parallelism 2 (`tp: 2` en la configuracion de ejemplo).
- GPU recomendadas: AMD RDNA4 con ROCm, en particular Radeon AI PRO R9700; el motor radiance esta orientado a AMD y no se menciona soporte CUDA.
- Cabe en GPU de consumo: no disponible; la informacion solo menciona GPUs profesionales AMD.
- Opciones de despliegue: exclusivamente el motor radiance (compilado desde main posterior a 1.17.0, ya que IQ8R con escala a 256 de K y el cache KV int8 no estan en 1.17.0). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12,6 tokens por paso especulativo sobre 24 prompts de chat; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StillDeadcode/swift1.5-qwen3.8-27b-iq8r | 27B | 262.144 | int8 W8A8 IQ8R + drafter DFlash2 | swift-open-license-1.0 | Solo motor radiance (AMD) |
| StillDeadcode/swift1.5-qwen3.8-27b-fp8 | 27B | no disponible | FP8 | swift-open-license-1.0 (presumible) | Motor radiance |
| ukisai/Swift-1.5-Qwen3.8-27b (bf16) | 27B | 262.144 (segun este contenedor) | bf16 | no disponible | Checkpoint original |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Drafter de decodificacion especulativa |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de un unico motor: el formato `.rad` solo lo carga radiance, y se requiere una version compilada desde main posterior a 1.17.0; no hay interoperabilidad con safetensors, GGUF ni otras herramientas.
- Restriccion de hardware: orientado a AMD RDNA4 con ROCm; no se documenta soporte para NVIDIA ni para GPUs de consumo.
- Licencia: swift-open-license-1.0 (etiqueta `license: other`); es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del ingles o del chino sin evaluacion propia.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; como modelo generativo de 27B, mantiene el riesgo habitual de fabricacion de datos.
- Sesgos: no se publica informacion sobre sesgos conocidos del ajuste fino ni del modelo base.
- Fidelidad de cuantizacion: las metricas KL se midieron sobre el modelo base Qwen3.8-27B, no sobre este ajuste fino; el autor lo indica explicitamente.
- Fecha de publicacion futura: el repositorio figura creado el 2026-11-10, con 0 descargas y 0 likes, lo que implica ausencia de validacion independiente por la comunidad.
- Decodificacion especulativa: los borradores se verifican, por lo que no alteran la salida, pero la ganancia de velocidad depende del drafter y puede variar segun la carga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/StillDeadcode/swift1.5-qwen3.8-27b-iq8r
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Version FP8 previa: https://huggingface.co/StillDeadcode/swift1.5-qwen3.8-27b-fp8
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Dataset del quantization challenge: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
