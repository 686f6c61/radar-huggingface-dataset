# wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8

## Resumen

Soonlife-Qwen3.5-9B-v2b-FP8 es un ajuste fino por destilación del modelo Qwen3.5-9B, desarrollado por el usuario wonchandev para el chatbot "Soonlife" de la Universidad de Soonchunhyang. El modelo parte de Qwen/Qwen3.5-9B y se entrena mediante LoRA con datos generados por un teacher de mayor tamano (Qwen3.8-27B), que produce respuestas y trazas de agente sobre un pipeline de RAG y tool calling. Posteriormente se fusionan los adaptadores y se cuantiza a FP8 dinámico con la receta de llm-compressor, sin datos de calibración.

La variante v2b es una versión experimental: usa los mismos datos que v2 pero reduce el número de épocas de 1,5 a 1,0, porque en la segunda época la pérdida de validación de las trazas de agente empeoraba. El modelo resultante tiene 9.653.104.368 parámetros, un repositorio de 14 GB y está pensado para servir en vLLM con el parser de razonamiento qwen3 y el parser de tool calling qwen3_coder.

Su relevancia es acotada: no es un modelo generalista, sino un artefacto de despliegue vertical para un dominio concreto (normativas y avisos universitarios en coreano). Resulta útil como ejemplo de pipeline completo de destilación con datos sintéticos, cuantización FP8 y despliegue con tool calling, pero sus capacidades fuera de ese dominio no están garantizadas y la evaluación formal sobre el split de test aún no se ha realizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; atención completa + linear attention Gated DeltaNet, con torre de visión y MTP |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 49.152 tokens en la configuración de servicio vLLM (`--max-model-len 49152`); entrenamiento con máximo 32.768 tokens |
| Tipos de cuantizacion | FP8 dinámico (pesos FP8 por canal + activaciones FP8 dinámicas por token); se mantienen en bf16 `lm_head`, `embed_tokens`, torre de visión y linear attention (Gated DeltaNet); MTP copiado del original |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer con capas de atención completa y capas de linear attention basadas en Gated DeltaNet, más una torre de visión para entradas image-text-to-text y pesos MTP (multi-token prediction) para decodificación especulativa. La cuantización FP8 se aplica solo a las capas lineales del modelo de lenguaje (atención completa y MLP), dejando en bf16 la cabeza de salida, los embeddings, la torre de visión y las proyecciones de Gated DeltaNet.

El entrenamiento es una destilación SFT por LoRA (r=32, alpha=32, dropout 0.0) sobre proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj` del modelo de lenguaje, excluyendo la torre de visión. El teacher es Qwen3.8-27B, que genera respuestas y trazas de agente con las mismas herramientas y prompts RAG. El conjunto de datos combina 3.000 muestras de respuestas en formato RAG (24,6 M tokens), 1.728 muestras de trazas de primera ronda con pensamiento (23,8 M tokens) y 1.604 muestras de trazas completas sin pensamiento (33,0 M tokens), sumando 6.332 líneas y 81,4 M tokens, de los cuales 2,99 M llevan pérdida. Se usó bf16 con Unsloth, 1 época, learning rate 1e-4 con scheduler coseno, batch efectivo de 16 y un máximo de 32.768 tokens; el entrenamiento completo requirió 2,8 horas en 2× H100. La pérdida media de entrenamiento fue 0,2448 y la de validación final 0,2739 en respuestas y 0,2608 en trazas.

## Capacidades

- Generación de texto conversacional en coreano, orientada a respuestas con formato RAG.
- Tool calling / function calling, con flujo de agente multi-ronda (el modelo está entrenado para emitir llamadas a herramientas y consumir sus resultados).
- Razonamiento con modo "thinking" en la primera ronda de agente, con trazas de pensamiento entrenadas explícitamente.
- Entrada multimodal image-text-to-text por herencia de la torre de visión de Qwen3.5 (no reentrenada).
- Decodificación especulativa mediante los pesos MTP heredados del modelo base.
- Capacidad multilingüe limitada al coreano en la práctica; el resto de idiomas no está validado.
- Comprensión de normativas y avisos universitarios dentro del dominio Soonlife.

## Casos de uso

- Chatbot de atención al estudiante: responder consultas sobre avisos y reglamentos de la Universidad de Soonchunhyang usando el pipeline RAG para el que fue entrenado, con contexto de hasta 49.152 tokens en servicio.
- Agente de consulta documental multi-paso: encadenar búsquedas en el corpus normativo mediante tool calling, reformulando la consulta cuando la primera recuperación falla (las trazas de "recuperación" se reforzaron en el dataset).
- Servicio de bajo coste en producción: al estar en FP8 dinámico y ocupar 14 GB en repositorio, permite desplegar en una sola GPU con vLLM reutilizando la configuración de `RedHatAI/Qwen3.5-9B-FP8-dynamic` cambiando solo la ruta del modelo.
- Sustitución directa en infraestructuras existentes: cualquier servidor que ya sirva Qwen3.5-9B en FP8 puede adoptarlo sin reescribir el cliente, manteniendo `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder`.
- Base para ajustes de dominio en otros organismos: sirve como plantilla reproducible de destilación teacher-alumno con datos sintéticos de RAG y trazas de agente, replicable con 2× H100 en menos de tres horas.
- Evaluación de pipelines de destilación: útil en investigación para comparar estrategias de enmascarado de pérdida (pensamiento de primera ronda frente a rondas posteriores sin pensamiento) y su efecto en la pérdida de validación.
- Prototipado de asistentes con visión: la torre de visión heredada permite experimentar con entradas de imagen, aunque sin garantías de calidad por no haberse reentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación sobre el split de test "aún no se ha realizado" y solo reporta pérdidas de validación:

| Metrica | v1 | v2 | v2b |
|---|---|---|---|
| Perdida de validacion (answers) | 0,2744 | 0,2684 | 0,2739 |
| Perdida de validacion (traces) | 0,2583 | 0,2709 | 0,2608 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-12 GB para los pesos en FP8 más overhead de caché KV; con contexto de 49.152 tokens la caché KV puede requerir varios GB adicionales según el número de secuencias concurrentes.
- GPU recomendadas: H100 (usada en el entrenamiento) y A100 80 GB para servicio con contexto largo y concurrencia alta; L40S o A10G suficientes para cargas moderadas.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4090, RTX 4080 Super) para contexto corto y pocas peticiones simultáneas; en 24 GB hay margen para contexto largo.
- Opciones de despliegue: vLLM es la vía documentada, con `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--max-model-len 49152`. El formato compressed-tensors es compatible con el ecosistema vLLM; no se documentan instrucciones para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La model card advierte que la tasa de aceptación de la decodificación especulativa (MTP) puede ser algo inferior a la del modelo original, ya que esos pesos no se reentrenaron.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2b-FP8 | 9,65 B | 49.152 en servicio | Apache 2.0 | Ajuste vertical para dominio universitario coreano; sin evaluación publicada |
| Qwen/Qwen3.5-9B | 9 B (aproximado) | no disponible en la informacion | no disponible en la informacion | Modelo base; capacidades generales y multilingües superiores fuera del dominio Soonlife |
| RedHatAI/Qwen3.5-9B-FP8-dynamic | 9 B (aproximado) | no disponible en la informacion | no disponible en la informacion | Misma receta de cuantización FP8, sin ajuste de dominio; alternativa si no se necesita el comportamiento RAG de Soonlife |
| Qwen3.8-27B | 27 B (aproximado) | no disponible en la informacion | no disponible en la informacion | Teacher de la destilación; mayor calidad potencial pero coste de servicio muy superior |

## Limitaciones y advertencias

- Modelo especializado: está diseñado exclusivamente para el chatbot RAG de avisos y normativas de la Universidad de Soonchunhyang. Fuera del sistema de prompts y del formato de herramientas de entrenamiento no hay garantía de mejora frente a Qwen3.5-9B.
- Sin evaluación formal: no se han publicado resultados sobre el split de test, por lo que el rendimiento real en producción es desconocido.
- Versión experimental: v2b es una variante de prueba; la model card señala la v1 como modelo operativo.
- Idiomas: solo se declara coreano; el comportamiento en castellano u otros idiomas no está validado y probablemente degrade.
- Decodificación especulativa: los pesos MTP no se entrenaron, por lo que la tasa de aceptación puede ser inferior a la del modelo base.
- Visión: la torre de visión no se reentrenó; las capacidades multimodales son las del modelo original y no se han adaptado al dominio.
- Riesgo de alucinación: al ser un modelo destilado para RAG, puede generar respuestas plausibles pero incorrectas sobre normativas si la recuperación falla; requiere validación contra las fuentes documentales.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus de entrenamiento es un dataset propio del autor con posible sobrerrepresentación de ciertos tipos de consulta (se reforzaron las trazas de recuperación y de cierre temprano).
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base Qwen3.5-9B y de los datos de destilación generados por Qwen3.8-27B.
- Contexto: los ejemplos de más de 32K tokens se descartaron del entrenamiento (no se truncaron), por lo que el rendimiento más allá de esa longitud no está respaldado por datos de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8
- Modelo base bf16 fusionado: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b
- Adaptadores LoRA y registro de entrenamiento: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-LoRA
- Versión operativa v1: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-FP8
- Versión v2: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-FP8
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de cuantización FP8: https://huggingface.co/RedHatAI/Qwen3.5-9B-FP8-dynamic
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
