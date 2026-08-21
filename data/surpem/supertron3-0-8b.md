# Surpem/Supertron3-0.8B

## Resumen

Supertron3-0.8B es un modelo de lenguaje y visión (VLM) compacto desarrollado por Suprem Org, diseñado específicamente para agentes de interfaz gráfica (GUI agents) y llamadas a herramientas (tool calling) en entornos de borde (edge). Con un tamaño de 0,8 mil millones de parámetros y un peso de 1,7 GB, está pensado para despliegue en dispositivos con recursos limitados, ofreciendo baja latencia y ejecución local.

El modelo se basa en Qwen/Qwen3.5-0.8B y ha sido ajustado para interpretar interfaces visuales (web, escritorio y CLI), razonar sobre su contenido y emitir acciones ejecutables (estilo pyautogui) o llamadas a funciones JSON válidas. Su arquitectura híbrida combina Gated DeltaNet con atención, con 24 capas y 1024 unidades ocultas, y soporta un contexto nativo de 262K tokens. Su relevancia actual radica en que cubre el nicho de agentes de computer use y tool calling en dispositivos de gama baja, donde los modelos más grandes no son viables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Attention (24 capas, 1024 hidden) con vision encoder |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens nativos |
| Tipos de cuantizacion | no disponible (se menciona bfloat16 para inferencia) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

Supertron3-0.8B es un modelo de visión-lenguaje (VLM) con arquitectura híbrida que combina Gated DeltaNet y atención estándar, con 24 capas y una dimensión oculta de 1024. Incluye un vision encoder para procesar imágenes de interfaces gráficas. El modelo parte de Qwen/Qwen3.5-0.8B como base y ha sido ajustado mediante fine-tuning para tareas de navegación, computer use y tool calling. No se detallan los datos de entrenamiento (número de tokens, composición del dataset ni técnicas como RLHF o DPO) en la información disponible. La innovación principal es su capacidad de emitir acciones ejecutables sobre interfaces gráficas (estilo pyautogui) además de llamadas a funciones JSON, algo que el modelo base no puede hacer.

## Capacidades

- Generación de texto y razonamiento sobre contenido visual (interfaces web, escritorio y CLI).
- Tool calling / function calling: emite llamadas a funciones JSON válidas, con soporte para single-call, multi-tool y argumentos anidados.
- Computer use: localiza elementos de interfaz y emite acciones ejecutables (estilo pyautogui) para operar sobre el escritorio.
- Agentes GUI: navegación web y operación de aplicaciones de escritorio mediante interpretación visual.
- Multimodal: procesa imágenes y texto (pipeline image-text-to-text).
- Contexto largo: 262K tokens nativos, adecuado para conversaciones multi-turno y documentos extensos.
- Despliegue en borde: tamaño compacto (1,7 GB) para ejecución en dispositivos con recursos limitados.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede interpretar capturas de pantalla y emitir acciones de ratón y teclado (estilo pyautogui) para automatizar flujos de trabajo repetitivos en aplicaciones de escritorio, gracias a su capacidad de computer use.
- Agentes de navegación web: puede operar navegadores interpretando el contenido visual de las páginas y ejecutando acciones como clics, relleno de formularios y navegación entre pestañas, útil para testing automatizado o scraping guiado.
- Asistentes de atención al cliente con tool calling: integrado en un sistema de chat, puede invocar herramientas externas (consultas de clima, bases de datos, APIs) mediante llamadas JSON, como se muestra en el ejemplo de la model card.
- Automatización de CLI: puede interpretar terminales y emitir comandos, facilitando la operación remota de sistemas sin intervención humana.
- Despliegue en dispositivos de borde: su tamaño reducido (1,7 GB) permite ejecutarlo en hardware modesto (Raspberry Pi, mini-PCs, portátiles antiguos) para asistentes locales sin conexión a la nube.
- Integración en pipelines de CI/CD: su capacidad de tool calling permite usarlo como agente que ejecuta tareas de build, test o despliegue invocando herramientas de línea de comandos, con baja latencia para entornos de integración continua.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados en benchmarks de tool calling, navegación web y computer use:

| Modelo | Params | BFCL ↑ | Mind2Web (step acc) ↑ | Computer Use ↑ |
|---|---|---|---|---|
| Supertron3-0.8B (ours) | 0,8B | 82% | 77% | 100% |
| Qwen3.5-0.8B (base) | 0,8B | 56% | 80% | 0% |
| North Micro Vision Instruct | ~2B | 61% | — | — |
| Qwen3.5-4B | 4B | 69% | — | — |

Según el autor, Supertron3-0.8B es el único modelo de la comparativa que puede actuar de forma fiable sobre un escritorio, mientras que los modelos base obtienen mejores puntuaciones en priors genéricos de tool calling pero fallan completamente en computer use. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Con 852M parámetros en bfloat16, el peso del modelo es de aproximadamente 1,7 GB, por lo que cabría en GPUs con 4 GB de VRAM o menos en cuantización ligera.
- GPU recomendadas: no se especifican modelos concretos. Por su tamaño, sería viable en GPUs de consumo como RTX 3060, RTX 4060 o incluso en iGPUs con suficiente memoria compartida.
- Compatibilidad con consumer GPU: sí, dado su tamaño compacto, es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: transformers (con trust_remote_code), vLLM y SGLang (según la model card). También podría usarse con llama.cpp u Ollama si se generan pesos GGUF, aunque no se menciona explícitamente.
- Latencia y throughput: no disponibles. Se espera baja latencia por su tamaño reducido, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Params | Contexto | BFCL | Computer Use | Licencia |
|---|---|---|---|---|---|
| Supertron3-0.8B | 0,8B | 262K | 82% | 100% | Apache 2.0 |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | 56% | 0% | no disponible |
| North Micro Vision Instruct | ~2B | no disponible | 61% | — | no disponible |
| Qwen3.5-4B | 4B | no disponible | 69% | — | no disponible |

Supertron3-0.8B destaca frente a su modelo base y a alternativas de mayor tamaño en tool calling (BFCL) y computer use, aunque el modelo base obtiene mejor precisión en navegación web (Mind2Web). No se dispone de información sobre licencias de los modelos comparados.

## Limitaciones y advertencias

- Capacidad limitada por su tamaño: el autor indica que es fuerte en tool routing de un solo turno y computer use de horizonte corto, pero los flujos de trabajo de horizonte largo siguen siendo un reto.
- Limitación de grounding: la precisión a nivel de ScreenSpot-Pro requiere vision encoders más grandes, por lo que puede fallar en localización de elementos UI muy pequeños o complejos.
- Idioma: la model card solo lista inglés como idioma soportado, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación: no se menciona explícitamente, pero como todo modelo pequeño, puede generar llamadas a herramientas incorrectas o acciones no deseadas si no se valida la salida.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones significativas, pero se recomienda revisar los términos completos.
- Para producción: se recomienda validar las acciones emitidas (especialmente computer use) con mecanismos de seguridad, ya que el modelo puede ejecutar acciones sobre el sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Surpem/Supertron3-0.8B
- Perfil de la organización Surpem: https://huggingface.co/Surpem
- Colección Supertron3: https://huggingface.co/collections/Surpem/supertron3
- Sitio de Suprem Org: https://surpem.qzz.io
- Referencia a Qwen3.5 Technical Report (citado en la model card, sin URL directa)
