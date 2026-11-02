# windowsxp811203/Qwen3.8-27B-Abliterated-MLX-oQ8e-mtp

## Resumen

Qwen3.8-27B-Abliterated-MLX-oQ8e-mtp es una cuantización en 8 bits para Apple Silicon (formato MLX) del modelo Qwen3.8-27B-Abliterated, un derivado "abliterated" (sin las capas de rechazo alineadas) de la familia Qwen3.5. Lo publica el usuario windowsxp811203 en HuggingFace y está pensado para ejecutarse en hardware Apple con el framework MLX, aprovechando la aceleración nativa de los chips M-series.

El modelo conserva la modalidad multimodal de entrada (image-text-to-text) del original, con ~27.780 millones de parámetros y pesos en safetensors cuantizados mediante la técnica oQ8e (cuantización de 8 bits con imatrix), además de soporte para decodificación especulativa nativa (native-mtp, multi-token prediction). El repositorio ocupa 30 GB y está bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

Es relevante ahora porque permite desplegar un modelo de ~27B con capacidades de visión y conversación en un Mac con memoria unificada suficiente, algo que con pesos en fp16 sería inviable en la mayoría de equipos de consumo. La contrapartida es que se trata de una modificación no oficial del modelo base, sin benchmarks publicados en la información disponible y con el riesgo asociado a los modelos "abliterated".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia qwen3_5 |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (oQ8e, con imatrix); formato MLX |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), cuantización oQ8e |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y la modalidad `image-text-to-text`, lo que indica un transformer multimodal con codificador de visión y decodificador de lenguaje. El modelo deriva de Qwen3.8-27B-Abliterated, que a su vez es una modificación del modelo base Qwen3.8-27B: la variante "abliterated" elimina o atenúa las direcciones de activación asociadas al rechazo de peticiones, un procedimiento de edición de pesos que no requiere reentrenamiento completo.

No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La cuantización oQ8e emplea una matriz de importancia (imatrix) para asignar precisión de forma no uniforme a los pesos, y el sufijo `mtp` indica soporte de multi-token prediction nativo para decodificación especulativa, lo que puede mejorar el throughput en MLX sin necesidad de un modelo borrador separado. Tampoco se documenta la longitud de contexto soportada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes (image-text-to-text): descripción, respuesta a preguntas sobre imágenes y tareas vision-language.
- Razonamiento general y respuesta a instrucciones heredadas del modelo base Qwen3.5.
- Decodificación especulativa nativa (native-mtp) para acelerar la inferencia en MLX.
- Comportamiento "uncensored"/abliterated: menor tendencia a rechazar peticiones, incluidas las sensibles.
- Ejecución optimizada en Apple Silicon mediante MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: con ~27,8B parámetros en 8 bits y memoria unificada suficiente (32 GB o más), se puede ejecutar un chatbot multimodal privado sin enviar datos a la nube, usando MLX como runtime.
- Análisis de imágenes en local: el pipeline image-text-to-text permite describir capturas, extraer información de documentos escaneados o responder preguntas sobre fotografías sin conexión externa.
- Prototipado de aplicaciones vision-language en Apple Silicon: investigadores que quieran validar pipelines multimodales en un portátil o Mac Studio antes de migrar a GPUs de datacenter pueden usar este checkpoint como banco de pruebas.
- Generación de contenido creativo sin filtros: la variante abliterated resulta adecuada para escritura de ficción, guiones o role-play donde los filtros estándar de rechazo resultan limitantes, siempre con revisión humana.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo con las capas de rechazo atenuadas y compararlo con el modelo base alineado, en un entorno controlado.
- Evaluación de cuantizaciones oQ8e e imatrix: sirve para medir la pérdida de calidad frente a pesos fp16 en tareas de lenguaje y visión, y para comparar el rendimiento de la decodificación especulativa MTP en MLX.
- Despliegue de demos interactivas en macOS: integrable en aplicaciones nativas mediante la librería mlx-lm/mlx-vlm, con latencia razonable en chips M-series con memoria unificada amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 30 GB en 8 bits, por lo que se recomienda un mínimo de 32 GB de memoria unificada; 36-48 GB o más deja margen para el contexto y el codificador de visión.
- GPU recomendadas: chips Apple Silicon de gama alta (M2 Max/Ultra, M3 Max/Ultra, M4 Max/Ultra) con 32 GB o más de memoria unificada. No está pensado para GPUs NVIDIA/AMD, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con memoria unificada suficiente; no es compatible con tarjetas gráficas discretas convencionales por el formato de pesos.
- Opciones de despliegue: MLX (mlx-lm / mlx-vlm), con soporte de cuantización oQ8e y decodificación MTP. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-MLX-oQ8e-mtp | ~27,8B | no disponible | image-text-to-text | Apache 2.0 | MLX, 8 bits, Apple Silicon |
| Qwen3.8-27B-Abliterated (base) | ~27,8B (no confirmado) | no disponible | image-text-to-text | no disponible | safetensors (fp/bf16 presumiblemente) |
| Qwen3.5-27B (modelo original de la familia) | ~27B (no confirmado) | no disponible | texto/vision según variante | no disponible | múltiples |

No se dispone de datos de rendimiento comparativo ni de especificaciones verificadas de los modelos alternativos en la información proporcionada; la comparativa se limita a parámetros, licencia y plataforma.

## Limitaciones y advertencias

- Modelo "abliterated": la atenuación de las capas de rechazo implica mayor probabilidad de generar contenido sensible, ofensivo o inseguro; no es apto para producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de ~27B, agravado por la falta de benchmarks publicados que permitan estimar su fiabilidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Licencia Apache 2.0 declarada, pero al ser una modificación no oficial de un modelo de terceros conviene revisar las condiciones del modelo base Qwen antes de un uso comercial.
- Solo funciona en Apple Silicon vía MLX; no hay pesos GGUF ni compatibilidad con ecosistemas CUDA, lo que restringe su portabilidad.
- La cuantización en 8 bits introduce pérdida de precisión frente al modelo original, no cuantificada en la información disponible.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-MLX-oQ8e-mtp
- Modelo base: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
