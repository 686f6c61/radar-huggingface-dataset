# TNSA/Kavach-1-Mini-BF16

## Resumen

Kavach-1-Mini-BF16 es un modelo de lenguaje compacto, creado por el equipo TNSA, especializado en seguridad ofensiva y razonamiento para operaciones de red-team. Se obtiene mediante ajuste fino supervisado completo (full-parameter SFT) del modelo base Qwen/Qwen3.5-0.8B, lo que le permite actuar como asistente experto en análisis de vulnerabilidades, auditoría de código y labores de pentesting autorizado. El modelo está pensado para entornos locales y laboratorios, con un tamaño reducido que facilita su despliegue en hardware modesto.

La arquitectura es un Transformer denso derivado de Qwen3.5-0.8B, con aproximadamente 752 millones de parámetros y una ventana de contexto de 4.096 tokens. El modelo está publicado en formato bfloat16 (BF16) y forma parte de una línea que incluye otras precisiones como FP8, INT8, INT4, NVFP4 y MXFP4. Su relevancia radica en ofrecer una herramienta especializada en ciberseguridad que puede ejecutarse localmente sin necesidad de infraestructura de gran escala, con licencia MIT y compatibilidad con el ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) derivado de Qwen3.5-0.8B |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | BF16 (este repo); FP8, INT8, INT4, NVFP4, MXFP4 en repos hermanos |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | MIT (para el modelo fine-tuned); el modelo base Qwen3.5-0.8B tiene su propia licencia |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo se construye mediante full-parameter supervised fine-tuning (SFT) sobre el modelo Qwen3.5-0.8B. Esto significa que todos los pesos del modelo base se actualizaron durante el entrenamiento, a diferencia de un enfoque LoRA o de adaptadores de bajo rango. La model card no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados. Tampoco se indica que se hayan aplicado técnicas de RLHF o DPO; el ajuste es puramente supervisado con instrucciones.

La innovación técnica más destacable es la especialización en seguridad ofensiva mediante un ajuste completo de parámetros, junto con la publicación en múltiples precisiones para adaptarse a distintos hardware y entornos de ejecución. El proceso de cuantización de las variantes FP8, INT8, INT4, NVFP4 y MXFP4 se realizó con `llm-compressor` y el formato `compressed-tensors`, mientras que el entrenamiento se llevó a cabo con Hugging Face `transformers` y `trl` con aceleración Liger.

## Capacidades

- Generacion de texto conversacional siguiendo instrucciones, con soporte de plantillas de chat (mensajes de sistema, usuario y asistente) mediante `apply_chat_template`.
- Razonamiento especializado en seguridad ofensiva: analisis de vulnerabilidades, revision de codigo, identificacion de endpoints inseguros y proposicion de vectores de ataque.
- Asistencia en operaciones de red-team y penetration testing, con respuestas orientadas a escenarios realistas de ciberseguridad.
- Capacidad de actuar como asistente de soporte para blue-team y equipos de defensa, al entender tacticas y tecnicas ofensivas.
- Capacidades multilingues limitadas al ingles; no se documenta soporte para otros idiomas.
- No se documenta soporte de tool calling, function calling, vision ni audio en la informacion disponible.

## Casos de uso

- Auditoria de codigo en pentesting: el modelo puede revisar endpoints o funciones escritas en frameworks como Flask, tal como se muestra en el ejemplo de uso, y senalar posibles vulnerabilidades de seguridad. Su especializacion permite que las respuestas se centren en tecnicas ofensivas reales.
- Red-teaming autorizado: generacion de escenarios de ataque y listas de comprobacion para pruebas de penetracion en sistemas propios o con autorizacion explicita. Al ser un modelo pequeno, puede ejecutarse en un portatil durante los ejercicios de campo.
- Analisis de infraestructura ofensiva: ayuda a disenar payloads, comandos o configuraciones maliciosas para validar defensas, siempre que el usuario verifique cada salida, tal como recomienda la model card.
- Educacion en ciberseguridad: uso como asistente en cursos de hacking etico, donde explica conceptos de seguridad ofensiva y propone ejercicios practicos. El tamano compacto permite utilizarlo en aulas sin servidores dedicados.
- Soporte a equipos blue team: el modelo puede ayudar a identificar tecnicas, tacticas y procedimientos (TTPs) conocidos, asi como preparar estrategias de defensa a partir de la perspectiva ofensiva. Su contexto de 4.096 tokens es suficiente para analizar descripciones de incidentes y recomendaciones.
- Investigacion de seguridad: analisis de muestras de malware, scripts de explotacion o configuraciones inseguras, generando hipotesis de explotacion y posibles mitigaciones. La especializacion en red-team le permite abordar estos analisis con profundidad tecnica.
- Integracion en herramientas locales de laboratorio: gracias a su tamano (~0,75 B) y al formato safetensors, puede desplegarse en entornos aislados o en pipelines de seguridad internas, donde no se requieren grandes recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio en BF16 pesa 1,5 GB, por lo que se estima una VRAM minima de entre 2 y 3 GB para incluir pesos, activaciones y cache KV con el contexto de 4.096 tokens.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como una NVIDIA RTX 3060 o RTX 4060. Tambien es posible ejecutarlo en CPU con una RAM de 4-6 GB.
- Si cabe en consumer GPU: si, en GPUs de 4 GB y superiores, asi como en portatiles con tarjetas graficas modestas.
- Opciones de despliegue: compatible con Hugging Face `transformers` directamente. Para otros entornos como llama.cpp, Ollama, vLLM o TGI seria necesario convertir el formato a GGUF o adaptarlo, aunque no hay confirmacion oficial en la documentacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos publicados en la informacion proporcionada. La unica referencia contrastable es el modelo base y la variante de precision FP8 del mismo proyecto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TNSA/Kavach-1-Mini-BF16 | 752.393.024 | 4.096 tokens | MIT | Hugging Face |
| TNSA/Kavach-1-Mini-FP8 | ~0,8 B | 4.096 tokens | MIT | Hugging Face |
| Qwen3.5-0.8B | ~0,8 B | no disponible | Licencia propia de Qwen | Hugging Face |

Los datos de rendimiento y benchmarks de estos modelos no estan publicados, por lo que no se puede establecer una comparativa numerica.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos especificos, pero al derivar de Qwen3.5-0.8B es probable que herede sesgos del modelo base, no evaluados en esta ficha.
- Riesgo de alucinacion: la model card advierte que el modelo puede producir detalles tecnicos plausibles pero incorrectos. Es imprescindible verificar todos los comandos, payloads y afirmaciones antes de utilizarlos.
- Limitaciones de contexto e idioma: ventana de 4.096 tokens y soporte exclusivo en ingles, sin capacidades multimodales.
- Restricciones de licencia: el modelo fine-tuned se distribuye bajo MIT, pero el modelo base Qwen3.5-0.8B tiene su propia licencia. Hay que revisar y cumplir esos terminos al redistribuir pesos derivados.
- Uso dual: se trata de una herramienta de doble uso orientada a seguridad ofensiva. Solo debe emplearse en sistemas propios o con autorizacion explicita, respetando todas las leyes y reglas de enfrentamiento aplicables. El uso inadecuado es responsabilidad del usuario.
- Rendimiento: con ~0,75 B de parametros, el modelo es menos fiable que modelos de mayor tamano. No debe considerarse como fuente autoritativa en decisiones de seguridad criticas.

## Enlaces

- https://huggingface.co/TNSA/Kavach-1-Mini-BF16
- https://huggingface.co/TNSA/Kavach-1-Mini-FP8
