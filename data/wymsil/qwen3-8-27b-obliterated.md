# Wymsil/Qwen3.8-27B-OBLITERATED

## Resumen
Qwen3.8-27B-OBLITERATED es una variante "abliterada" (sin censura) del modelo Qwen/Qwen3.8-27B, publicada por el usuario Wymsil en Hugging Face. El modelo base es un transformer de tipo Qwen3 con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones), y esta versión aplica técnicas de abliteración para eliminar los comportamientos de rechazo y las respuestas de tipo "lección de seguridad", manteniendo una capacidad cercana al modelo original. La arquitectura subyacente es la de Qwen3, aunque la model card no detalla la longitud de contexto ni la composición exacta del entrenamiento.

El modelo se distribuye en formatos safetensors, GGUF y MLX, lo que permite su uso tanto en entornos de GPU convencionales como en Apple Silicon. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el contenido generado puede ser problemático. La relevancia actual radica en su orientación a investigación de seguridad (red-team, ai-safety-research) y a aplicaciones donde se requiere que el modelo responda sin filtros de contenido, como generación de código ofensivo o análisis de vulnerabilidades.

La model card describe tres versiones (V1, V2, V3) con distintas técnicas de abliteración: V1 usa una pasada SVD agresiva, V2 combina SVD y LEACE (blending 60/40), y V3 aplica refinamiento iterativo y cirugía dirigida sobre un corpus específico. Según el autor, V3 logra eliminar tanto rechazos duros como evasivas suaves, con una pérdida de 2,1 puntos porcentuales en MMLU respecto al modelo stock.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Qwen3, según model_type: qwen3) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (bfloat16 presumiblemente), GGUF, MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only basado en Qwen3, según el campo `model_type: qwen3` y el modelo base Qwen/Qwen3.8-27B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación principal de esta ficha es el proceso de abliteración: se identifican y proyectan fuera del espacio de pesos las "direcciones de rechazo" mediante técnicas como SVD (descomposición en valores singulares) y LEACE (minimización de información mutua). La versión V2 combina ambos métodos con un blending 60/40 para compensar las debilidades de cada uno, y la V3 aplica refinamiento iterativo sobre el campeón anterior más una pasada de cirugía dirigida con un corpus específico para categorías de evasiva. El autor reporta que V3 mantiene el modo "thinking" (cadena de pensamiento) operativo, aunque recomienda desactivarlo para respuestas más directas.

## Capacidades
- Generación de texto y conversación multi-turno.
- Razonamiento y respuesta a preguntas (MMLU evaluado).
- Generación de código, incluyendo código funcional para tareas de ciberseguridad (el autor reporta 20/20 en tareas de código/cyber).
- Modo "thinking" (cadena de razonamiento) disponible, aunque el autor recomienda desactivarlo para respuestas directas.
- Respuestas sin rechazos ni evasivas de seguridad en consultas restringidas, según el autor.
- Soporte de tool calling / function calling: no disponible explícitamente en la información, aunque el autor menciona uso en "agent harness" y "pentest framework", lo que sugiere compatibilidad con agentes.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso
- Investigación de seguridad y red-team: el modelo permite generar respuestas sin filtros para evaluar la robustez de sistemas y estudiar comportamientos no censurados en entornos controlados.
- Generación de código ofensivo y pruebas de penetración: el autor reporta 20/20 en tareas de código/cyber, por lo que puede usarse para generar scripts de explotación, payloads o análisis de vulnerabilidades en un laboratorio autorizado.
- Desarrollo de agentes autónomos: la model card incluye recomendaciones para uso agéntico (repetition_penalty 1.15, temperatura 0.1-0.3, resumen tras ~10 turnos), lo que indica que puede integrarse en frameworks de agentes para tareas multi-paso.
- Generación de contenido sin restricciones para investigación creativa: escritura de ficción, guiones o contenido para adultos donde los filtros de seguridad del modelo base resultan limitantes.
- Evaluación de sesgos y alineación: al eliminar las direcciones de rechazo, el modelo sirve como herramienta para estudiar qué comportamientos emergen cuando se suprime la alineación de seguridad.
- Despliegue en Apple Silicon: la disponibilidad de pesos MLX permite ejecutar el modelo en Macs con chip M-series para prototipado e inferencia local.
- Análisis de malware y ingeniería inversa: la ausencia de rechazos permite solicitar explicaciones detalladas de técnicas maliciosas con fines defensivos.

## Benchmarks y rendimiento
La model card incluye datos de MMLU (lm-eval-harness, 0-shot, n=5700) comparando el modelo stock con las versiones V1, V2 y V3. No se han publicado otros benchmarks en la información disponible.

| Modelo | MMLU | Stderr | vs Stock |
|---|---|---|---|
| Stock Qwen3.8-27B | 84,5% | no disponible | — |
| V1 | 81,4% | no disponible | -6,0 pp |
| V2 | 84,3% | no disponible | -0,3 pp |
| V3 | 82,3% | no disponible | -2,1 pp |

Además, el autor reporta para V3: 20/20 en tareas de código/cyber (20 prompts) y 7/8 en "advanced real-world" (frente a 5/8 del stock). No se dispone de resultados de HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware
- VRAM estimada para inferencia: con 27,8 mil millones de parámetros, en bfloat16 se requieren aproximadamente 55-56 GB de VRAM solo para los pesos. En cuantización de 8 bits, unos 28 GB; en 4 bits, unos 14-16 GB (estimación orientativa, no confirmada en la información).
- GPU recomendadas: para bfloat16, A100 80GB, H100 80GB o múltiples GPUs. Para cuantización 4-bit, una RTX 4090 (24 GB) podría ser suficiente, aunque no se confirma en la información.
- Cabe en consumer GPU: probablemente en RTX 4090/3090 con cuantización 4-bit, y en Apple Silicon con MLX (el repo incluye pesos MLX). No confirmado explícitamente.
- Opciones de despliegue: llama.cpp (GGUF, con `--jinja` para la plantilla), Ollama, LM Studio, MLX para Apple Silicon, y transformers con `device_map="auto"`. vLLM y TGI no se mencionan en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED (V3) | 27,8 B | no disponible | 82,3% | Apache 2.0 | Hugging Face (Wymsil) |
| Qwen/Qwen3.8-27B (stock) | 27,8 B | no disponible | 84,5% | Apache 2.0 (presumible) | Hugging Face |
| Otras variantes abliteradas de Qwen3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos abliterados comparables en la información proporcionada.

## Limitaciones y advertencias
- El proceso de abliteración elimina los rechazos de seguridad, lo que puede producir contenido dañino, ilegal o éticamente problemático. El uso en producción requiere salvaguardas externas.
- Riesgo elevado de alucinación y de respuestas incorrectas en temas sensibles, ya que el modelo prioriza responder sin evasivas sobre la precisión.
- La pérdida de 2,1 pp en MMLU respecto al stock indica una degradación moderada de capacidades generales.
- No se dispone de información sobre sesgos específicos, pero al eliminar la alineación se pueden amplificar sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir leyes o políticas de plataforma; el usuario asume la responsabilidad.
- El autor recomienda no usar system prompts (pueden reintroducir rechazos) y usar temperature 0 con repetition_penalty 1.15; desviarse de estos ajustes puede degradar la calidad.
- En uso agéntico, el modelo puede entrar en bucles; se recomienda resumir el contexto tras ~10 turnos.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la evaluación para aplicaciones multilingües o de contexto largo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/Wymsil/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
