# sverinn/Qwopus3-5-9B-Coder-Flash-AWQ

## Resumen

Qwopus3-5-9B-Coder-Flash-AWQ es una cuantización de 4 bits (AWQ, esquema W4A16) del modelo Jackrong/Qwopus3-5-9B-Coder-Flash, un VLM orientado a generación de código construido sobre la arquitectura Qwen3.5-9B con atención híbrida. Lo publica el usuario sverinn en Hugging Face y su objetivo es reducir el peso del modelo de 19,3 GB en bf16 a 8,5 GB en disco sin pérdida medible de calidad, manteniendo la ventana de contexto completa de 262.144 tokens dentro de una única GPU de consumo de 24 GB.

El modelo base combina capas de atención completa con capas de atención lineal GatedDeltaNet (8 capas de atención completa y 24 de atención lineal), lo que permite manejar contextos muy largos con un coste de KV cache contenido. La cuantización se ha generado con llm-compressor 0.15.0 y el formato compressed-tensors, y está pensada para servirse con vLLM. La torre de visión, el proyector multimodal y el lm_head se mantienen sin cuantizar.

Es relevante ahora porque demuestra que un VLM de ~9.650 millones de parámetros con contexto de 262k y soporte de tool calling puede desplegarse en una RTX 3090 con ~20,7 GB de VRAM a plena longitud de contexto, con un throughput de decodificación de ~106 tok/s y sin degradación aparente frente al checkpoint bf16 en la suite de evaluación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (atención completa + atención lineal GatedDeltaNet), VLM |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | AWQ W4A16 (int4, group size 128, simétrico; activaciones bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ W4A16) |

## Arquitectura y entrenamiento

El modelo base es un VLM Qwen3.5-9B con atención híbrida: 8 capas de atención completa y 24 capas de atención lineal GatedDeltaNet. La cuantización AWQ se aplicó sobre todos los módulos `Linear`, incluidas las proyecciones de la atención lineal, con mapeos AWQ inferidos por tipo de atención. Quedan sin cuantizar el `lm_head`, las normas, todos los módulos de visión y multimodalidad (`visual`, `vision_tower`, `vision_model`, `multi_modal_projector`, `merger`) y la cabeza MTP, que se copia sin cambios en bf16. El proceso se realizó con llm-compressor 0.15.0 (compressed-tensors 0.20.1) usando `HuggingFaceH4/ultrachat_200k` (`train_sft`) como calibración: 256 muestras y longitud máxima de secuencia 2048.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La cuantización en sí no introduce entrenamiento adicional; solo aplica escalados activation-aware para minimizar el error de cuantización de pesos. Se conservan sin modificar la plantilla de chat del modelo base (`enable_thinking`, formato XML de tool calls).

## Capacidades

- Generación de código en múltiples lenguajes, con evaluación específica en una suite de tareas de código verificadas por ejecución.
- Razonamiento y resolución de problemas de terminal y línea de comandos (suite de 8 tareas de terminal en los benchmarks del autor).
- Tool calling / function calling en formato XML de Qwen3 Coder, con soporte nativo en vLLM mediante `--tool-call-parser qwen3_coder`.
- Modo de razonamiento (`enable_thinking`) heredado de la plantilla de chat del modelo base, con parser `qwen3` en vLLM.
- Capacidades de visión: pipeline `image-text-to-text`, con torre de visión en bf16 que funciona sin configuración adicional.
- Conversación multi-turno con contexto largo (hasta 262.144 tokens).
- Recuperación de información en contextos muy largos (needle-in-a-haystack superado a 201.643 tokens).

## Casos de uso

- Asistente de código en IDE o CLI: el modelo puede generar y razonar sobre parches de código con contexto de hasta 262k tokens, suficiente para incluir varios ficheros de un repositorio en una sola petición, y desplegarse en una RTX 3090.
- Automatización de tareas de terminal: dada su evaluación en tareas de shell, puede integrarse en agentes que ejecutan comandos, interpretan la salida y corrigen errores en varios pasos.
- Agentes con tool calling: el soporte nativo del parser `qwen3_coder` en vLLM permite construir pipelines de agentes que invocan funciones externas (APIs, bases de datos, herramientas internas) sin postprocesado manual.
- Análisis de capturas de pantalla y diagramas: al mantener la torre de visión en bf16, puede recibir imágenes junto con texto, útil para revisar interfaces, leer diagramas de arquitectura o interpretar errores mostrados en pantalla.
- Revisión de código en CI/CD: con ~106 tok/s de decodificación y prefill de ~3.850 tok/s, es viable ejecutar comprobaciones automáticas de parches o generación de tests en pipelines, siempre que el volumen no requiera paralelismo masivo.
- Procesamiento de documentación técnica extensa: la ventana de 262k tokens permite resumir o extraer información de manuales, especificaciones o bases de código completas en una sola pasada.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: para equipos de desarrollo que necesitan un VLM de código local sin infraestructura de datacenter.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (RTX 3090 a 350 W, vLLM 0.32). Suite de 24 tareas verificadas por ejecución (8 de código, 8 de terminal, 8 de tool calling), temperatura 0:

| Checkpoint | Codigo | Terminal | Tool-calls | Total |
|---|---|---|---|---|
| AWQ W4A16 (este repo) | 7/8* | 7/8 | 8/8 | 22/24 |
| Base bf16 (referencia) | 7/8* | 7/8 | 8/8 | 22/24 |

El fallo en `fizzbuzz` se atribuye a no determinismo por batching a temperatura 0 y se reproduce igual en ambos checkpoints. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

Rendimiento medido (concurrencia 1, `--max-model-len 262144`):

| Metrica | AWQ W4A16 |
|---|---|
| Prefill | ~3.850 tok/s |
| Decode | ~106 tok/s |
| VRAM a 262k de contexto | ~20,7 GB (KV cache admite 353k tokens) |
| Needle-in-a-haystack a 201.643 tokens | recuperación exacta |

## Requisitos de hardware

- VRAM estimada: ~20,7 GB con la ventana completa de 262k tokens en vLLM; el peso en disco es de 8,5 GB (frente a 19,3 GB en bf16).
- Cabe en GPU de consumo de 24 GB: el autor lo valida en RTX 3090. En GPUs de 24 GB de generaciones posteriores (RTX 4090) debería caber, aunque no se aportan mediciones.
- GPUs de datacenter recomendadas: no disponibles en la información; por tamaño, A100/H100 de 40/80 GB permitirían mayor concurrencia y KV cache adicional.
- Kernels: usa kernels Marlin int4 automáticamente en GPUs Ampere o superiores.
- Despliegue: vLLM con formato compressed-tensors. Comando de referencia:
  `vllm serve sverinn/Qwopus3-5-9B-Coder-Flash-AWQ --max-model-len 262144 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`
- Otras opciones (llama.cpp, Ollama, TGI): no disponibles en la información proporcionada.
- Latencia y throughput: ~3.850 tok/s de prefill y ~106 tok/s de decodificación con concurrencia 1 en RTX 3090 a 350 W.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3-5-9B-Coder-Flash-AWQ (este) | ~9,65 B | 262.144 | AWQ W4A16 | Apache 2.0 | safetensors (compressed-tensors) |
| Qwopus3-5-9B-Coder-Flash (base bf16) | ~9,65 B | 262.144 | bf16 | Apache 2.0 | safetensors |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de otros autores (por ejemplo, otras cuantizaciones del mismo tamaño o VLMs de código con contexto similar), por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La evaluación de calidad se limita a 24 tareas propias del autor; no hay benchmarks estándar publicados (MMLU, HumanEval, GSM8G) que permitan comparación externa.
- El fallo en `fizzbuzz` a temperatura 0 se atribuye a no determinismo por batching; en producción conviene fijar semillas y evitar lotes que alteren el resultado esperado.
- No se especifican los idiomas soportados; el comportamiento multilingüe no está documentado.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- La cuantización AWQ puede degradar tareas no cubiertas por la suite del autor; la ausencia de pérdida medida en 24 tareas no garantiza ausencia de pérdida en otros dominios.
- El modelo base es una mezcla/derivado de Qwen3.5-9B publicado por Jackrong; conviene revisar la model card del base para condiciones adicionales, aunque la licencia declarada es Apache 2.0.
- La torre de visión y el proyector multimodal se mantienen en bf16, por lo que el consumo de VRAM con entradas de imagen puede superar el medido solo con texto.
- Solo se documenta despliegue con vLLM; no hay garantías de compatibilidad con otros runtimes.
- Repo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/sverinn/Qwopus3-5-9B-Coder-Flash-AWQ
- Modelo base: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Perfil del autor de la cuantización: https://huggingface.co/sverinn
- Perfil del autor del modelo base: https://huggingface.co/Jackrong
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://vllm.ai
- Repositorio vLLM: https://github.com/vllm-project
- Qwen (equipo del modelo subyacente): https://huggingface.co/Qwen
- unsloth: https://huggingface.co/unsloth
