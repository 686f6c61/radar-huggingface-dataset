# weareapexcreators/LFM2.5-230M-LocalAI

## Resumen

LFM2.5-230M es el modelo más pequeño de la familia LFM2.5 de Liquid AI, una empresa especializada en arquitecturas neuronales híbridas. Con 229,7 millones de parámetros, está diseñado para ejecutarse en dispositivos con recursos muy limitados, como teléfonos móviles, Raspberry Pi y sistemas embebidos. Su arquitectura combina capas convolucionales y de atención, lo que le permite procesar secuencias largas con un coste computacional reducido.

El modelo está orientado a tareas de extracción de datos, uso de herramientas (tool calling) y cargas de trabajo agénticas en el borde. Según Liquid AI, alcanza 213 tokens por segundo en un Galaxy S25 Ultra y 42 tokens por segundo en una Raspberry Pi 5, lo que lo convierte en una opción viable para inferencia local en hardware de consumo. Es un modelo open-weight con licencia MIT, disponible en formatos GGUF y MLX, entre otros.

Este lanzamiento es relevante porque demuestra que los modelos de lenguaje de tamaño reducido pueden ofrecer capacidades de razonamiento y llamada a herramientas con una huella de memoria mínima, abriendo la puerta a aplicaciones de IA generativa sin conexión y con privacidad total. La fecha de lanzamiento reportada es el 25 de junio de 2026, aunque el repositorio en Hugging Face se creó el 26 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas convolucionales + atención |
| Parametros totales | 229.693.184 (230M) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (no se especifican variantes concretas), también MLX bf16 |
| Idiomas soportados | Multilingüe (según la entrada MLX); no se detallan lenguajes específicos |
| Licencia | MIT |
| Formato de pesos | safetensors (en el repositorio base), GGUF, MLX |

## Arquitectura y entrenamiento

LFM2.5-230M utiliza una arquitectura híbrida que combina capas convolucionales con capas de atención, una característica distintiva de los modelos LFM de Liquid AI. Esta combinación permite procesar secuencias largas de manera más eficiente que un transformer puro, reduciendo el coste de atención cuadrática y facilitando el despliegue en dispositivos con poca memoria. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o si se aplicó RLHF/DPO. El modelo se ofrece en versiones base e instruct (no se especifica en la información proporcionada, pero el repositorio HF menciona "conversational" y "endpoints_compatible"). La compañía ha indicado que está pensado para fine-tuning y extracción de datos.

## Capacidades

- Generación de texto y razonamiento básico para tareas de extracción de datos y diálogo.
- Soporte de tool calling / function calling, según la documentación de Liquid AI.
- Capacidad para tareas agénticas ligeras en el borde (on-device agentic tasks).
- Multilingüe, aunque no se especifican los idiomas concretos.
- Eficiencia energética y computacional: pensado para CPU y dispositivos de bajo consumo.
- Compatible con endpoints (según etiqueta "endpoints_compatible") y con plataformas como LocalAI.

## Casos de uso

- Extracción de datos en dispositivos: el modelo puede procesar documentos o formularios en el propio teléfono o en un dispositivo embebido, extrayendo campos relevantes sin enviar datos a la nube, gracias a su bajo consumo de memoria.
- Agentes de voz en el borde: con 213 tokens/s en un smartphone, es viable ejecutar asistentes de voz locales que interpreten comandos y realicen llamadas a herramientas del sistema.
- Automatización de tareas en Raspberry Pi: en proyectos de robótica o IoT, LFM2.5-230M puede actuar como cerebro de un agente que controle sensores y actuadores, respondiendo a instrucciones en lenguaje natural.
- Asistente de programación en terminal: puede integrarse en herramientas de línea de comandos para autocompletar o generar scripts simples, aprovechando su capacidad de tool calling.
- Filtrado y clasificación de textos en tiempo real: en aplicaciones de correo electrónico o mensajería, puede clasificar mensajes y extraer información clave (fechas, nombres, etc.) sin conexión.
- Chatbot local para soporte técnico: un dispositivo con el modelo puede mantener conversaciones guiadas para resolver problemas comunes sin depender de un servidor central.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son las velocidades de inferencia reportadas:

| Entorno | Velocidad |
|---|---|
| Galaxy S25 Ultra (CPU) | 213 tokens/s |
| Raspberry Pi 5 (CPU) | 42 tokens/s |

Estos valores son orientativos y dependen de la cuantización y del sistema operativo.

## Requisitos de hardware

- Inferencia en CPU: funciona en procesadores ARM de gama alta y media, como los de un smartphone moderno o una Raspberry Pi 5.
- VRAM: al ser un modelo de 230M, la huella de memoria es mínima. Con cuantización GGUF de 4 bits, puede ocupar menos de 150 MB, por lo que cabe en cualquier GPU moderna y en memoria RAM de un dispositivo embebido.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, por ejemplo una NVIDIA GTX 1650 o superior. También funciona en GPU integradas de Intel/AMD.
- Despliegue: compatible con llama.cpp, Ollama, LLM y plataformas que soporten GGUF. También existe versión MLX para Apple Silicon.
- Latencia y throughput: los datos publicados muestran 213 tok/s en un Galaxy S25 Ultra y 42 tok/s en Raspberry Pi 5, lo que indica una latencia baja para aplicaciones interactivas.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos de tamaño similar (p. ej., TinyLlama-1.1B, Phi-1.5, Qwen2.5-0.5B). La información disponible no incluye resultados de evaluación estándar, por lo que no es posible realizar una comparativa objetiva en términos de calidad. En cuanto a velocidad, los 213 tok/s en móvil son superiores a lo que suelen lograr modelos de 1B en el mismo hardware, pero se desconoce la calidad de las respuestas.

## Limitaciones y advertencias

- Al ser un modelo de solo 230M parámetros, su capacidad de razonamiento y conocimiento general es limitada en comparación con modelos de mayor tamaño. Puede fallar en tareas complejas o con matices.
- No se han publicado detalles sobre sesgos o alucinaciones; se recomienda evaluar en el caso de uso concreto antes de producción.
- La información de entrenamiento es escasa; se desconoce la composición del dataset, lo que dificulta evaluar su cobertura lingüística y temática.
- El soporte de tool calling y agentes se ha anunciado, pero no hay documentación exhaustiva de sus límites.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo es open-weight, no open-source completo (no se publican datos de entrenamiento).
- La fecha de creación en Hugging Face (2026-08-26) es posterior a la fecha de lanzamiento anunciada (2026-06-25), lo que sugiere que el repositorio puede estar en fase de actualización.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/weareapexcreators/LFM2.5-230M-LocalAI
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-230m
- Documentación oficial: https://docs.liquid.ai/lfm/models/lfm25-230m
- Artículo de ExplainX: https://www.explainx.ai/blog/liquid-ai-lfm2-5-230m-edge-agent-model-2026
- Repositorio MLX (bf16): https://huggingface.co/LiquidAI/LFM2.5-230M-MLX-bf16
- Repositorio Base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base

Nota: El repositorio de HuggingFace citado (weareapexcreators/LFM2.5-230M-LocalAI) parece ser una versión en GGUF de la comunidad; los repositorios oficiales son los de LiquidAI. La información técnica proviene de la documentación oficial y del blog de Liquid AI.</think>## Resumen

LFM2.5-230M es el modelo más pequeño de la familia LFM2.5 de Liquid AI, una empresa que desarrolla arquitecturas neuronales híbridas. Con 229,7 millones de parámetros, está diseñado para ejecutarse en dispositivos con presupuesto de memoria y cómputo muy limitados, como teléfonos móviles, Raspberry Pi o sistemas embebidos. Su arquitectura combina capas convolucionales y de atención para procesar secuencias largas de forma eficiente, reduciendo el coste cuadrático de la atención tradicional.

El modelo está orientado a tareas de extracción de datos, uso de herramientas (tool calling) y cargas agénticas en el borde. Según la publicación de Liquid AI, alcanza 213 tokens/s en un Galaxy S25 Ultra y 42 tokens/s en una Raspberry Pi 5, lo que lo convierte en una opción viable para agentes locales sin conexión a la nube. Se distribuye con licencia MIT y está disponible en formatos GGUF, MLX y safetensors.

Este lanzamiento es relevante porque demuestra que un modelo de tamaño reducido puede ofrecer capacidades de razonamiento y llamada a herramientas con una huella de memoria mínima, abriendo la puerta a aplicaciones de IA generativa en el edge. La fecha de lanzamiento reportada es el 25 de junio de 2026, aunque el repositorio en Hugging Face se creó el 26 de agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas convolucionales + atención |
| Parametros totales | 229.693.184 (229,7 M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (sin especificar variantes), MLX bf16 |
| Idiomas soportados | Multilingüe (sin detalle de lenguas) |
| Licencia | MIT |
| Formato de pesos | safetensors (base), GGUF, MLX |

## Arquitectura y entrenamiento

LFM2.5-230M utiliza la arquitectura híbrida de Liquid AI, que combina capas convolucionales con capas de atención. Esta combinación permite procesar secuencias largas con menor coste de memoria que un transformer puro, ya que las convoluciones capturan dependencias locales de forma eficiente y la atención se aplica de forma selectiva. El modelo está pensado para fine-tuning en tareas específicas, según la documentación oficial.

No se han publicado detalles sobre el dataset de entrenamiento, el número total de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. La información disponible indica que existe una versión base y una versión con capacidad conversacional (etiquetada como "conversational" en el repositorio). Tampoco se detalla si se realizó algún tipo de alineación supervisada.

## Capacidades

- Generación de texto y razonamiento básico para tareas de extracción de datos y diálogo.
- Soporte de tool calling / function calling, según documentación oficial de Liquid AI.
- Capacidad para tareas agénticas en el borde (on-device agent tasks).
- Multilingüe, aunque no se especifican los idiomas concretos.
- Eficiencia en CPU: alto rendimiento en hardware de bajo consumo (213 tok/s en Galaxy S25 Ultra, 42 tok/s en Raspberry Pi 5).
- Compatible con endpoints y plataformas como LLM (etiqueta "endpoints_compatible").

## Casos de uso

- **Extracción de datos en dispositivos móviles**: el modelo puede procesar formularios, recibos o correos en el propio teléfono, extrayendo campos relevantes sin enviar información a la nube, gracias a su bajo consumo de memoria.
- **Asistentes de voz en el dispositivo**: con 213 tok/s en un smartphone, puede ejecutar un agente de voz que interprete comandos y llame a herramientas del sistema, funcionando sin conexión.
- **Automatización en Raspberry Pi**: en proyectos de robótica o IoT, LFM2.5-230M puede actuar como controlador de un agente que responda a instrucciones en lenguaje natural y active sensores o actuadores.
- **Generación de código en entornos embebidos**: puede usarse para autocompletar scripts pequeños o generar fragmentos de código en herramientas de línea de comandos, aprovechando su capacidad de tool calling.
- **Filtrado y clasificación de textos en local**: en aplicaciones de correo, mensajería o gestión documental, puede clasificar mensajes y extraer información clave (fechas, nombres, entidades) sin depender de un servidor central.
- **Chatbot de soporte técnico en el borde**: un dispositivo con el modelo puede mantener conversaciones guiadas para resolver preguntas frecuentes, reduciendo la latencia y los costes de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son las velocidades de inferencia reportadas por Liquid AI:

| Entorno | Velocidad |
|---|---|
| Galaxy S25 Ultra (CPU) | 213 tokens/s |
| Raspberry Pi 5 (CPU) | 42 tokens/s |

Estos valores son estimativos y dependen de la cuantización utilizada y de las condiciones del hardware.

## Requisitos de hardware

- **VRAM**: al ser un modelo de 229 M, ocupa menos de 150 MB en cuantización de 4 bits. Cualquier GPU con 2 GB de VRAM es suficiente.
- **GPUs recomendadas**: NVIDIA GTX 1650 o superior, o cualquier GPU integrada moderna. No requiere GPU dedicada para inferencia en CPU.
- **CPU**: funciona en procesadores ARM y x86 de bajo consumo, como los de Raspberry Pi 5 o teléfonos Android.
- **Opciones de despliegue**: compatible con llama.cpp, Ollama, LLM y otras herramientas que soporten GGUF. También existe versión MLX para Apple Silicon.
- **Latencia y throughput**: 213 tok/s en Galaxy S25 Ultra y 42 tok/s en Raspberry Pi 5, lo que permite interacción en tiempo real en estos dispositivos.

## Comparativa con modelos similares

No se dispone de datos comparables directos con otros modelos de tamaño similar (p. ej., TinyLlama 1.1B, Phi-2, Qwen2.5-0.5B). No se han publicado resultados de benchmarks estándar, por lo que no es posible realizar una comparación objetiva de calidad. En cuanto a velocidad, los valores reportados son superiores a los típicos de modelos de 1B en el mismo hardware, pero se desconoce si esa velocidad se mantiene en tareas de razonamiento complejo.

## Limitaciones y advertencias

- **Capacidad limitada**: al ser un modelo pequeño, su razonamiento y conocimiento son limitados en comparación con modelos de 7B o más. Puede fallar en tareas que requieran comprensión profunda o contexto largo.
- **Alucinaciones**: no hay datos sobre su tasa de alucinación, pero es esperable que en tareas de extracción de datos se produzcan errores si el contexto es ambiguo.
- **Sesgos**: no se ha publicado ningún estudio sobre sesgos de género, raza o idioma.
- **Idiomas**: aunque se declara multilingüe, no se especifican los idiomas cubiertos ni su calidad relativa.
- **Licencia**: MIT permite uso comercial y modificación, pero el modelo es open-weight, no open-source (no se incluyen datos de entrenamiento).
- **Documentación incompleta**: la model card del repositorio está vacía, y la información técnica proviene de fuentes externas, lo que dificulta la evaluación de su comportamiento.

## Enlaces

- Repositorio Hugging Face del modelo (versión GGUF): https://huggingface.co/weareapexcreators/LFM2.5-230M-LocalAI
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-230m
- Documentación oficial: https://docs.liquid.ai/lfm/models/lfm25-230m
- Artículo de ExplainX: https://www.explainx.ai/blog/liquid-ai-lfm2-5-230m-edge-agent-model-2026
- Repositorio MLX (bf16): https://huggingface.co/LiquidAI/LFM2.5-230M-MLX-bf16
- Repositorio Base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
