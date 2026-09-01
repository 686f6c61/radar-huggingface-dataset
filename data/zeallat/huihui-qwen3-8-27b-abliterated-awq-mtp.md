# zeallat/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP

## Resumen

Este modelo es una cuantizacion AWQ W4A16 del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, un modelo base de 27.8 mil millones de parametros derivado de la familia Qwen3.8. El trabajo de cuantizacion lo realiza el autor `zeallat` utilizando `llm-compressor` 0.13.0, y la principal innovacion es que conserva la cabeza de prediccion multi-token (MTP) en bf16, lo que permite que vLLM realice decodificacion especulativa sin configuracion adicional.

El modelo resultante ocupa aproximadamente 27 GB en lugar de los 56 GB del checkpoint original en bf16, lo que lo hace viable para despliegue en GPUs de consumo con 32 GB o mas de VRAM. Es relevante porque combina tres caracteristicas poco habituales: una arquitectura hibrida con capas de atencion lineal GatedDeltaNet, cuantizacion 4-bit con preservacion de la cabeza MTP, y un proceso de "abliteration" que elimina comportamientos de rechazo del modelo base.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el propio autor advierte que al ser un modelo abliterated, la alineacion de seguridad se ha debilitado y la responsabilidad del despliegue recae en el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 48 capas GatedDeltaNet (linear_attn) + 16 capas full attention (full_attention_interval=4) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.8-27B, no especificada en la informacion) |
| Tipos de cuantizacion | AWQ W4A16_ASYM, group size 128, formato `pack-quantized` de compressed-tensors |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `model.safetensors.index.json` para la cabeza MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido con 64 capas de texto, de las cuales 48 son bloques GatedDeltaNet (atencion lineal) y 16 son de atencion completa, intercaladas con un intervalo de 4 (`full_attention_interval=4`). Esta arquitectura hibrida reduce el coste computacional de la atencion en secuencias largas, manteniendo la calidad de la atencion completa en capas seleccionadas.

La cuantizacion AWQ se aplico exclusivamente a los modulos `Linear` del decodificador de texto en las capas de atencion completa y en todos los MLPs. Se dejaron en bf16: `lm_head`, la torre de vision (`visual.*`), la cabeza MTP (`mtp.*`) y todas las proyecciones de atencion lineal GatedDeltaNet (`linear_attn.*`). Esta decision se debe a que el suavizado de activaciones de AWQ no tiene un mapeo bien definido para los bloques GatedDeltaNet, por lo que se excluyeron de la cuantizacion en lugar de aproximarlos.

La calibracion se realizo con 128 muestras de `HuggingFaceH4/ultrachat_200k` con `max_seq_length=1024`. El proceso de "abliteration" del modelo base elimina comportamientos de rechazo, lo que significa que el modelo responde sin negarse a ciertas peticiones, pero tambien implica una perdida de alineacion de seguridad.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, al ser un modelo base abliterated sin fine-tuning especifico.
- Razonamiento y comprension de lenguaje natural, heredados del modelo Qwen3.8-27B.
- Capacidades de vision, ya que la torre de vision (`visual.*`) se conserva en bf16, aunque no se especifica si el modelo procesa imagenes de forma nativa.
- Decodificacion especulativa mediante la cabeza MTP, que permite acelerar la inferencia en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`.
- Soporte de tool calling y function calling: no se menciona explicitamente, pero es una capacidad tipica de la familia Qwen3.8; no confirmada en la informacion disponible.
- Capacidades multilingues: no especificadas, aunque Qwen3.8 suele soportar multiples idiomas; no confirmado.

## Casos de uso

- Despliegue de un asistente conversacional en produccion con vLLM: el modelo cuantizado a 4-bit reduce los requisitos de VRAM a ~27 GB, permitiendo servirlo en una GPU unica de 32 GB (como A100 32GB o RTX 4090 con NVLink) con decodificacion especulativa MTP para reducir la latencia.
- Generacion de codigo en entornos con restricciones de hardware: al ser un modelo de 27B cuantizado, cabe en GPUs de consumo de gama alta, lo que permite ejecutar un asistente de codigo local sin depender de APIs externas.
- Investigacion sobre modelos abliterated: el checkpoint es util para estudiar el efecto de eliminar comportamientos de rechazo en modelos de gran tamano, y como la cuantizacion AWQ interactua con arquitecturas hibridas.
- Prototipado rapido de agentes conversacionales: la licencia Apache 2.0 y el tamano reducido facilitan experimentar con agentes multi-turno en entornos de desarrollo sin coste de inferencia elevado.
- Evaluacion de decodificacion especulativa en arquitecturas hibridas: la cabeza MTP conservada permite medir la tasa de aceptacion y la aceleracion real en modelos con capas GatedDeltaNet, algo poco documentado.
- Fine-tuning posterior a la cuantizacion (QAT) o adaptacion con LoRA: al mantener el `lm_head` y la cabeza MTP en bf16, es posible aplicar tecnicas de adaptacion sin degradar la calidad de la decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este checkpoint cuantizado. El autor no proporciona metricas de rendimiento ni comparativas con el modelo original en bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: ~27 GB para los pesos en W4A16, mas overhead de activaciones y KV cache. Se recomienda al menos 32 GB de VRAM para inferencia comoda.
- GPU recomendadas: A100 32GB, RTX 4090 24GB (ajustado), RTX 6000 Ada 48GB, o GPUs con 32 GB o mas.
- En consumer GPU: cabe en RTX 4090 24GB con cuantizacion adicional o limitando el contexto, pero es ajustado. Una RTX 3090 24GB podria funcionar con contexto reducido.
- Opciones de despliegue: vLLM (soporte nativo con MTP), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (si se adapta).
- Latencia y throughput: no disponibles. La decodificacion especulativa con MTP deberia mejorar la latencia respecto a decodificacion autoregresiva, pero no se proporcionan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeallat/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP | 27.8B | No disponible | AWQ W4A16 | Apache 2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27.8B | No disponible | bf16 | Apache 2.0 | HuggingFace |
| TelperionAI/Huihui-Qwen3.8-27B-abliterated-INT4-AWQ-GPTQ | 27.8B | No disponible | INT4 AWQ/GPTQ | Apache 2.0 | HuggingFace |
| Qwen3-30B-A3B (referencia de la familia) | 30B (3B activos) | 128K | Varias | Apache 2.0 | HuggingFace |

La diferencia principal con las alternativas es la preservacion de la cabeza MTP en bf16, que permite decodificacion especulativa en vLLM sin pasos adicionales. La version de TelperionAI no incluye MTP y usa un esquema de cuantizacion diferente.

## Limitaciones y advertencias

- El modelo es abliterated: se ha eliminado el comportamiento de rechazo del modelo base, lo que debilita la alineacion de seguridad. El autor advierte explicitamente que el despliegue es responsabilidad del usuario.
- La cuantizacion AWQ excluye las proyecciones GatedDeltaNet, lo que significa que una parte significativa del modelo permanece en bf16. El ahorro de memoria es menor de lo que cabria esperar para un modelo 4-bit puro.
- No se proporcionan datos de rendimiento ni benchmarks, por lo que no es posible evaluar la degradacion de calidad respecto al modelo original.
- La longitud de contexto no esta especificada en la informacion disponible, lo que dificulta planificar despliegues con ventanas largas.
- El soporte de vision existe a nivel de arquitectura (torre visual en bf16), pero no se documenta como usarla ni si el modelo procesa imagenes correctamente tras la cuantizacion.
- Para usar la decodificacion especulativa MTP, es necesario limpiar la cache de torch.compile si se cambia la configuracion de cuantizacion, lo que puede causar problemas en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeallat/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Version alternativa INT4 AWQ/GPTQ: https://huggingface.co/TelperionAI/Huihui-Qwen3.8-27B-abliterated-INT4-AWQ-GPTQ
- Anuncio de huihui.ai en X: https://x.com/support_huihui/status/2091592857002127819
- Anuncio de huihui.ai en X (actualizacion): https://x.com/support_huihui/status/2091733996740677932
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
