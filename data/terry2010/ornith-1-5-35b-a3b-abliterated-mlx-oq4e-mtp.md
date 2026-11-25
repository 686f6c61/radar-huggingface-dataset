# terry2010/Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp

## Resumen

Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp es una cuantización mixta de precisión (esquema oQ4e, ~4,9 bits por peso) del checkpoint abliterado de Huihui-ai, que a su vez deriva del modelo vision-language Ornith-1.5-35B-A3B de ornith-ai. Se trata de un Mixture-of-Experts híbrido (GatedDeltaNet + atención) con 256 expertos enrutados, 8 activos por token y unos 3B de parámetros activos sobre un total de 35.952.349.040 parámetros. El autor, terry2010, publica esta versión orientada a Apple Silicon, ejecutable con `mlx-vlm`, con la torre de visión preservada y una cabeza MTP (multi-token prediction) injertada para decodificación especulativa.

El modelo resuelve el problema de ejecutar un VLM MoE de ~36B en hardware de consumo Apple con un peso de ~20 GB en safetensors, manteniendo visión y capacidades conversacionales. La innovación principal es la combinación de cuantización oQ4e calibrada con imatrix y una cabeza MTP de 4 bits extraída de KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit, que aporta una aceleración medida de decodificación del 14-20% en un M4 Pro de 64 GB.

Es relevante ahora porque demuestra que el injerto de cabezas especulativas en checkpoints cuantizados y abliterados es viable, pero también frágil: la primera cabeza probada (bf16 de shisa-ai, destilada contra el tronco original) resultó un 8% más lenta, mientras que la cabeza BigBang, entrenada sobre un derivado ajustado de Ornith, alcanza una aceptación de borrador del ~66%. Es un artefacto de investigación sin censura, con la advertencia explícita de no exponerlo como endpoint público sin moderación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet + atención, Mixture-of-Experts (256 expertos enrutados, 8 activos), vision-language |
| Parámetros totales | 35.952.349.040 (~36B) |
| Parámetros activos | ~3B |
| Longitud de contexto | No disponible (validado needle 3/3 a ~8.6k tokens) |
| Tipos de cuantización | oQ4e mixta (~4,9 bpw), tensores no cuantizados en bf16; cabeza MTP en 4 bits |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 5 shards `model-0000{1..5}-of-00005.safetensors` + `model-mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE híbrido que combina capas GatedDeltaNet con capas de atención, sobre un total de 256 expertos enrutados de los que 8 se activan por token, resultando en ~3B de parámetros activos. Incluye una torre de visión integrada en el checkpoint (pipeline `image-text-to-text`), de modo que no requiere un fichero proyector separado. El linaje del checkpoint es: `ornith-ai/Ornith-1.5-35B-A3B` (MIT) → abliteración de rechazo por huihui-ai sobre las capas 11-29 (descrita por el upstream como una abliteración "cruda, proof-of-concept") → cuantización oQ4e de oMLX con calibración imatrix (~4,9 bpw, tensores no cuantizados en bf16) → injerto de cabeza MTP de 4 bits (44 tensores `language_model.mtp.*`, 0,49 GB) extraída de KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit, cuyo origen es EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP, un derivado con injerto Qwen3.6.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable es la decodificación especulativa mediante la cabeza MTP injertada: con `mtp_num_hidden_layers: 1` declarado, alcanza una aceptación de borrador del 62,6-69,9% y una aceleración de decodificación del +14% (ensayo) y +20% (código) frente a MTP desactivado en un M4 Pro. El autor documenta que la elección de donante de la cabeza es determinante: una cabeza bf16 destilada contra el tronco original resultó un 8% más lenta (70,5 vs 76,6 tok/s) por desajuste de distribución.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Modo thinking: emite una traza `<think>` por defecto, desactivable con `enable_thinking=false`; el autor advierte que desactivarlo produjo una respuesta incorrecta en una comparación numérica de caso límite.
- Comprensión de imagen (image-text-to-text): análisis de imágenes con la torre de visión incluida en el checkpoint.
- Decodificación especulativa con MTP (Lightning MTP) para acelerar la generación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Comportamiento sin rechazo (abliterated): responde a solicitudes que un modelo estándar declina.

## Casos de uso

- Inferencia local en Apple Silicon: cargar el modelo con `mlx-vlm` en un Mac con chip M-series y 64 GB de memoria unificada permite ejecutar un VLM MoE de ~36B a 67-81 tok/s, adecuado para prototipado y uso personal sin GPU dedicada.
- Análisis de imágenes en local: pasar una imagen con `--image` o como entrada del servidor OpenAI-compatible permite describir, analizar y responder preguntas sobre imágenes manteniendo los datos en el dispositivo.
- Asistente conversacional con razonamiento: con `enable_thinking=true` el modelo resuelve comparaciones numéricas y problemas de caso límite que falla sin la traza de razonamiento, útil en tareas de análisis que requieren precisión sobre latencia.
- Generación de código asistida: el benchmark interno del autor mide 81,0 tok/s con MTP en generación de código, lo que lo hace viable para autocompletado y generación en un servidor local compatible con OpenAI (oMLX, LM Studio).
- Investigación sobre abliteración y seguridad: el checkpoint sirve como artefacto para estudiar el efecto de la abliteración superficial (capas 11-29) en la tasa de rechazo (~2-4/100 rechazos genuinos tras revisión manual) y su impacto en capacidades.
- Investigación sobre decodificación especulativa: permite reproducir el experimento de injerto de cabezas MTP y medir la aceptación de borrador según el donante, con el script `run_validation.py` incluido en el repo.
- Procesamiento por lotes con contexto medio: la validación needle 3/3 a ~8,6k tokens con profundidades del 15%, 50% y 85% respalda tareas de recuperación de información en documentos de extensión moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica validaciones propias medidas sobre este checkpoint cuantizado en un Mac mini M4 Pro de 64 GB con `mlx_vlm`:

| Prueba | Resultado |
|---|---|
| Carga en frío (`mlx_vlm`) | 5,0 s, generación limpia |
| Plantilla de chat | Renderiza correctamente; toggle `enable_thinking` verificado en ambos sentidos; sin tokens especiales filtrados |
| Visión | Análisis de imagen correcto; modos de fallo consistentes con el modelo base en la misma imagen |
| Integridad del injerto MTP | 44 tensores `language_model.mtp.*` presentes; `mtp_num_hidden_layers: 1` declarado |
| Needle en contexto largo | 3/3 encontrados a ~8,6k tokens (15% / 50% / 85% de profundidad) |
| Pantalla de rechazo — dañino | 20/100 marcados por palabra clave → ~2-4/100 rechazos genuinos tras revisión manual |
| Pantalla de rechazo — benigno | 0/100 rechazos verdaderos (4 aciertos de palabra clave eran declaraciones de honestidad de capacidades) |
| Velocidad de decodificación (M4 Pro) | MTP off 67,2-67,5 tok/s → MTP on 76,4 (ensayo) / 81,0 (código) tok/s, +14-20% (medianas de misma sesión, n=3, generaciones de 600 tokens) |
| Aceptación de borrador MTP | ~66% (62,6-69,9% entre ejecuciones) |

## Requisitos de hardware

- VRAM/memoria unificada: ~20 GB de pesos oQ4e (repo de 22,1 GB incluyendo la cabeza MTP de 0,49 GB); se recomienda un mínimo de 64 GB de memoria unificada para margen de contexto y caché KV, como en la configuración validada (Mac mini M4 Pro de 64 GB).
- GPU recomendadas: Apple Silicon M-series con memoria unificada suficiente; el autor valida en M4 Pro. No hay datos de ejecución en A100, H100 ni RTX 4090, ya que el formato MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: el formato MLX no está pensado para GPUs NVIDIA; en Apple Silicon, el M4 Pro de 64 GB es la referencia validada.
- Opciones de despliegue: `mlx-vlm` (preserva la torre de visión; `mlx-lm` la eliminaría), oMLX y LM Studio como servidores OpenAI-compatibles.
- Latencia y throughput: 67,2-67,5 tok/s sin MTP y 76,4-81,0 tok/s con MTP en M4 Pro de 64 GB; carga en frío de 5,0 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp (este) | ~36B | ~3B | No disponible | MIT | MLX, Apple Silicon | Cuantización oQ4e + MTP, visión, sin rechazo |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | ~36B | ~3B | No disponible | MIT | Safetensors | Checkpoint abliterado upstream, sin cuantizar ni MTP |
| KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit | ~36B | ~3B | No disponible | No disponible | MLX 4-bit | Donante de la cabeza MTP; base de la comparación de velocidad |
| ornith-ai/Ornith-1.5-35B-A3B | ~36B | ~3B | No disponible | MIT | Safetensors | Modelo base original, con censura estándar |

## Limitaciones y advertencias

- Modelo sin censura: la abliteración suprime el comportamiento de rechazo en los pesos; responderá a solicitudes que un modelo estándar declina. No debe exponerse como endpoint público sin una capa de moderación propia.
- La abliteración upstream se describe como "cruda, proof-of-concept" y cubre solo las capas 11-29, por lo que des-censura menos agresivamente que builds estilo Heretic; a cambio, probablemente perturba menos las capacidades, pero no hay medición de daño cognitivo en la información disponible.
- Riesgo de alucinación: no cuantificado; el autor documenta un fallo concreto al desactivar el thinking en una comparación numérica de caso límite.
- Modos de fallo en visión consistentes con el modelo base en la misma imagen; no se detallan cuáles.
- Longitud de contexto oficial no disponible; la validación needle solo cubre ~8,6k tokens.
- Idiomas soportados no disponibles.
- Restricciones de licencia: MIT permite uso comercial, pero la responsabilidad legal del uso recae en el usuario según el autor.
- Dependencia de la cabeza MTP: un donante con distribución de entrenamiento desajustada puede producir una decodificación más lenta que sin MTP (caso documentado: -8%).
- Formato MLX exclusivo para Apple Silicon; no ejecutable directamente en CUDA sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/terry2010/Ornith-1.5-35B-A3B-abliterated-MLX-oQ4e-mtp
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Donante de la cabeza MTP: https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit
- Origen de la cabeza MTP: EryriLabs/Ornith-1.5-35B-A3B-BigBang-MTP (referenciado en la model card, sin URL directa)
- Modelo base original: ornith-ai/Ornith-1.5-35B-A3B (referenciado en la model card, sin URL directa)
