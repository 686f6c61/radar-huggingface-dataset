# thesysdev/OUI-1

## Resumen

OUI-1 es un modelo de lenguaje de difusión diseñado específicamente para generación de interfaces de usuario (generative UI). Ha sido desarrollado por Thesys como un finetuning LoRA de Google DiffusionGemma 26B-A4B-it, un modelo de difusión con arquitectura Mixture-of-Experts de 26.000 millones de parámetros totales y 4.000 millones de parámetros activos. El modelo genera pantallas completas en openui-lang, el lenguaje declarativo de OpenUI, a partir de un brief en lenguaje natural y de las firmas de una librería de componentes proporcionadas en el system prompt.

Su relevancia radica en que aborda un problema emergente y con una restricción de latencia muy exigente: la generación de interfaces de usuario en tiempo real. A diferencia de un modelo autorregresivo, OUI-1 escribe bloques de 256 tokens de una vez, comenzando desde ruido y confirmando cada token en cuanto está seguro, lo que permite que una pantalla ligera llegue en aproximadamente un segundo en una GPU A100 80GB. En el Generative UI Benchmark obtiene un 71,7%, es decir, 5,5 veces más que su modelo base, que alcanza un 13,0%. El modelo mantiene un contexto de 16.384 tokens y se sirve con vLLM en modo FP8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion language model (finetuning LoRA de Google DiffusionGemma 26B-A4B-it) |
| Parámetros totales | 25.823.778.864 (25,8B) |
| Parámetros activos | 4B (A4B, MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | bf16 (pesos originales), FP8 (weight-only en vLLM) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

OUI-1 es un modelo de lenguaje de difusión basado en Google DiffusionGemma 26B-A4B-it, que a su vez emplea una arquitectura Mixture-of-Experts con 26.000 millones de parámetros totales y 4.000 millones activos. El finetuning se realizó mediante adaptadores LoRA que posteriormente se fusionaron en los pesos base, y el modelo resultante se distribuye en formato safetensors bf16. La generación se produce mediante un proceso de denoising: el modelo escribe un bloque de 256 tokens desde ruido y confirma cada token en el momento en que tiene suficiente certeza. La configuración de inferencia incluye un sampler con límite de entropía (entropy bound 0,1) y 48 pasos de denoising, tal como se recoge en los ficheros de configuración del checkpoint.

No se ha proporcionado información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas como RLHF o DPO. La innovación técnica principal es la adaptación de un modelo de difusión de texto a la tarea de generar UI declarativa, junto con el mantenimiento del formato nativo de tool calling de Gemma 4.

## Capacidades

- Genera pantallas completas en openui-lang a partir de un brief en lenguaje natural y de las firmas de una librería de componentes incluidas en el system prompt.
- Puede adaptarse a cualquier librería de componentes: basta con pasar las firmas en el system prompt para que el modelo genere código compatible con ese sistema de diseño.
- Soporta function calling / tool calling manteniendo el formato nativo de Gemma 4, y devuelve OpenAI tool_calls estándar cuando se sirve con vLLM y `--tool-call-parser gemma4`.
- Puede razonar en varios pasos, por ejemplo llamando a una herramienta para obtener datos externos (clima, precio de acciones) y generando después una pantalla con los valores devueltos en el siguiente turno.
- Ofrece una generación de baja latencia gracias al proceso de difusión por bloques de 256 tokens, lo que permite que una pantalla se complete en torno a un segundo en una A100 80GB.
- Compatible con el Agent Skill de OpenUI, que permite a asistentes de codificación como Claude Code, Codex, Cursor y Copilot construir y depurar aplicaciones de UI generativa.
- No se han documentado capacidades de visión, audio, soporte multilingüe ni un modo thinking específico en la información disponible.

## Casos de uso

- Generación de pantallas de estado operativo: un equipo de plataforma puede pedir una página que muestre el uptime de una API y una nota sobre la última incidencia, y el modelo genera la pantalla en openui-lang lista para renderizar con `@openuidev/react-lang`. Es adecuado porque puntúa un 71,7% en el benchmark de UI generativa, lo que indica una buen seguimiento de briefs complejos.
- Prototipado rápido de interfaces de producto: diseñadores y desarrolladores pueden describir una pantalla en lenguaje natural y obtener una primera versión en minutos, con iteraciones casi inmediatas gracias a la latencia de aproximadamente un segundo por pantalla ligera.
- Dashboards con datos en tiempo real: mediante tool calling, el modelo puede consultar APIs externas y después escribir la interfaz con los datos devueltos, lo que resulta útil para paneles de monitorización, informes o aplicaciones de negocio con datos variables.
- Asistentes de frontend en el IDE: aprovechando el Agent Skill de OpenUI, un asistente de codificación puede invocar OUI-1 para generar o modificar pantallas dentro de un flujo de trabajo de desarrollo, manteniendo la coherencia con la librería de componentes del proyecto.
- Generación de formularios y onboarding: a partir de un brief que enumera los campos necesarios, el modelo produce los componentes de formulario alineados con la librería definida, lo que permite estandarizar la UI en aplicaciones de gran tamaño.
- Validación automática de UI en integración continua: el código generado puede validarse con `@openuidev/lang-core` en un pipeline de CI, garantizando que cada pantalla generada sea sintácticamente correcta antes de su despliegue.
- Asistentes conversacionales con estado visual: gracias a la ventana de contexto de 16.384 tokens, el modelo puede recibir peticiones de cambio y actualizar la pantalla en turnos sucesivos, manteniendo el contexto de la conversación.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| Generative UI Benchmark (46 briefs, 5 bandas de tamaño, 4 generaciones por brief) | DiffusionGemma 26B-A4B-it (base) | 24/184 (13,0%) |
| Generative UI Benchmark (46 briefs, 5 bandas de tamaño, 4 generaciones por brief) | OUI-1 | 132/184 (71,7%) |

Los resultados fueron medidos con vLLM 0.24 en modo FP8, con el sampler del propio checkpoint y 48 pasos de denoising, sobre una GPU A100 80GB y una única solicitud a la vez. Una pantalla ligera tarda aproximadamente un segundo y una densa entre tres y seis segundos, incluyendo el prompt. No se han publicado resultados de otros benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 25,8 GiB, y en bf16 alrededor de 51,6 GiB. A esto hay que añadir la memoria para la KV cache, que vLLM llena por defecto en el resto de la GPU disponible.
- GPU recomendadas: A100 80GB es la GPU de referencia en las mediciones; una H100 ofrecería FP8 nativo con aceleración de cómputo. En Ampere (A100), el modo FP8 de vLLM es solo de pesos mediante Marlin, por lo que ahorra memoria pero no acelera el cómputo.
- En GPUs de consumo con 24 GB (por ejemplo RTX 4090) los pesos FP8 de 25,8 GiB no caben sin cuantización adicional, y no se ha documentado ninguna cuantización más agresiva.
- Opciones de despliegue: vLLM 0.24 o superior es el método recomendado. El modelo es compatible con la API OpenAI en local y aparece marcado como `endpoints_compatible` en HuggingFace. No se mencionan soportes para llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 1 segundo para pantallas ligeras y entre 3 y 6 segundos para pantallas densas en una A100 80GB con 48 pasos de denoising. No se dispone de datos de throughput.

## Comparativa con modelos similares

No se han encontrado en la información disponible otras alternativas open-weight de generative UI con resultados en el mismo benchmark, por lo que la comparación se limita al modelo base del que deriva.

| Modelo | Parámetros | Contexto | Generative UI Benchmark | Licencia |
|---|---|---|---|---|
| OUI-1 | 25,8B totales, 4B activos | 16.384 tokens | 71,7% | Gemma Terms of Use |
| DiffusionGemma 26B-A4B-it (base) | 26B totales, 4B activos | no disponible | 13,0% | Gemma Terms of Use |
| Otros modelos de generative UI open-weight | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han proporcionado datos sobre sesgos específicos del modelo. Como derivado de Gemma, puede heredar sesgos de su modelo base, pero no hay información al respecto en la documentación disponible.
- El riesgo de alucinación se manifiesta en forma de código de UI inválido: el modelo puede generar componentes inexistentes o referencias incorrectas si la librería de componentes no está bien especificada en el system prompt. Es recomendable validar la salida con `@openuidev/lang-core`.
- Limitaciones de idioma: los metadatos indican únicamente inglés; no se ha documentado soporte para otros idiomas.
- Restricciones de licencia: la licencia es Gemma Terms of Use, no una licencia de código abierto estándar. Los términos de uso imponen restricciones específicas que deben revisarse antes de cualquier uso comercial o de redistribución.
- Falta de reproducibilidad: `temperature` y `seed` son ignorados por el sampler, y no se plumbee un seed por solicitud. Dos solicitudes idénticas pueden devolver pantallas diferentes, lo que puede afectar a pruebas automatizadas y a la depuración.
- Rendimiento en hardware: en GPUs Ampere el modo FP8 no acelera el cómputo, solo reduce la memoria. En GPUs con 24 GB los pesos FP8 no caben sin cuantización adicional no documentada.
- El modelo requiere `--trust-remote-code` y no lee `--hf-overrides` para el número de pasos de denoising; hay que utilizar `--diffusion-config`. Esto puede confundir a quienes intenten configurarlo como un modelo autorregresivo.
- Aunque el tag de HuggingFace incluye `image-text-to-text`, no se ha documentado ninguna capacidad de entrada de imagen en la información disponible.

## Enlaces

- https://huggingface.co/thesysdev/OUI-1
- https://github.com/thesysdev/openui
- https://github.com/thesysdev
- https://www.thesys.dev/
- https://github.com/thesysdev/generative-ui-bench
- https://www.openui.com/benchmarks
- https://openui.com/docs
- https://github.com/thesysdev/skills
