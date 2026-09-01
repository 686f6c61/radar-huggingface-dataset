# XHToken/Spark-X2.5-4B

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken, diseñado para ofrecer capacidades de IA prácticas y eficientes en dispositivos y entornos con recursos limitados. Forma parte de la familia Spark-X2.5, que incluye también una variante de 1.7B, y se presenta como una solución que equilibra rendimiento, velocidad de inferencia y uso de caché KV gracias a su arquitectura híbrida de atención.

El modelo destaca por su ventana de contexto nativa de hasta 1 millón de tokens, soporte para más de 200 idiomas y un entrenamiento intensivo en razonamiento, código y flujos agénticos. Está pensado para tareas cotidianas como conversación, escritura, traducción, razonamiento, programación, uso de herramientas y automatización de agentes, con un enfoque especial en la integración con entornos de agente populares como Codex, Claude Code, OpenClaw y Hermes.

Con 4.112 millones de parámetros y licencia Apache 2.0, Spark-X2.5-4B se posiciona como una alternativa abierta y accesible para desarrolladores que necesitan un modelo eficiente sin renunciar a capacidades avanzadas de razonamiento y agente. Su compatibilidad con múltiples frameworks de inferencia (vLLM, SGLang, llama.cpp, MLX, Ollama, LM Studio) y plataformas de hardware (NVIDIA, Huawei, Hygon, HOUMO.AI) facilita su despliegue en entornos heterogéneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 1 capa de atención completa + 3 capas de atención de ventana deslizante (SWA) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.000.000 tokens (nativa) |
| Tipos de cuantizacion | GGUF disponible (niveles no especificados en la informacion disponible) |
| Idiomas soportados | Ingles, chino (declarados); la model card menciona soporte para mas de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Spark-X2.5-4B emplea una arquitectura híbrida de atención que combina una capa de atención completa con tres capas de atención de ventana deslizante (SWA). Este diseño reduce sustancialmente el coste computacional asociado a modelos de contexto largo, manteniendo al mismo tiempo la capacidad de capturar dependencias globales gracias a la capa de atención completa. La combinación busca equilibrar rendimiento, velocidad de inferencia y tamaño de caché KV, un factor crítico en tareas agénticas donde la gestión de memoria es limitante.

El entrenamiento se realizó en dos fases principales. La primera consistió en un preentrenamiento sobre aproximadamente 20 billones de tokens procedentes de un corpus diverso que incluye páginas web, libros, publicaciones académicas, código y materiales enciclopédicos. Se prestó especial atención a la calidad de los datos, la cobertura de dominios y los pesos de muestreo, con estudios de mezcla de datos para optimizar el equilibrio entre matemáticas, lógica, código y otros dominios de alto valor. La capacidad de contexto largo se desarrolló en una etapa dedicada con cientos de miles de millones de tokens y secuencias de hasta 1M de tokens.

La segunda fase consistió en un post-entrenamiento que comenzó con un ajuste fino supervisado (SFT) sobre un corpus curado para establecer un seguimiento robusto de instrucciones, generación estructurada y finalización de tareas. Posteriormente se aplicó aprendizaje por refuerzo a gran escala en varios dominios (comprensión del lenguaje, razonamiento, programación, comportamiento agéntico con herramientas y seguimiento de instrucciones), generando políticas de profesor especializadas que se consolidaron en un único modelo desplegable mediante la técnica MOPD. El entrenamiento se llevó a cabo en clústeres de Huawei Ascend.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo (hasta 1M tokens).
- Razonamiento complejo y resolución de problemas en dominios de matemáticas, lógica y análisis.
- Generación de código y soporte para tareas de programación en diversos lenguajes.
- Traducción automática y soporte multilingüe (más de 200 idiomas según la model card).
- Tool calling / function calling para integración con APIs y herramientas externas.
- Flujos agénticos multi-paso, con integración probada en entornos como Codex, Claude Code, OpenClaw y Hermes.
- Seguimiento de instrucciones y generación estructurada (formatos JSON, etc.).
- Escritura creativa y redacción de contenido técnico o general.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 1M tokens, permitiendo mantener el historial completo de interacciones sin truncamiento. Su capacidad de tool calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Generación de código en producción: con soporte para tool calling y razonamiento, puede integrarse en pipelines de CI/CD para generar tests, documentar APIs o autocompletar funciones. Su tamaño compacto permite ejecutarlo en entornos de desarrollo locales.
- Agentes autónomos de navegación web: su integración con harnesses como Codex o Claude Code lo hace adecuado para construir agentes que interactúan con navegadores, APIs y entornos de línea de comandos de forma autónoma.
- Traducción y localización de contenido: su soporte multilingüe (más de 200 idiomas) permite traducir documentos, sitios web o interfaces de usuario con un modelo que cabe en una GPU de consumo.
- Asistente de documentación técnica: puede resumir largos repositorios de código, generar documentación a partir de código fuente o responder preguntas sobre bases de conocimiento extensas gracias a su contexto de 1M tokens.
- Razonamiento y análisis de datos: el modelo puede procesar grandes volúmenes de texto (logs, informes, artículos) y extraer conclusiones o generar resúmenes ejecutivos, aprovechando su entrenamiento en razonamiento y comprensión del lenguaje.
- Despliegue en dispositivos edge: con 4B parámetros y cuantización GGUF, puede ejecutarse en portátiles, mini-PCs o dispositivos con 8-16 GB de RAM, habilitando asistentes locales sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona comparaciones con modelos de tamaño similar y destaca un rendimiento líder en tareas de código, agente, razonamiento y seguimiento de instrucciones, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en el texto extraído. Se recomienda consultar el repositorio oficial o la documentación del autor para obtener datos numéricos actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4B parámetros, se estima aproximadamente 8-10 GB en FP16, 4-6 GB en cuantización Q8, y 2-4 GB en cuantización Q4. Estas cifras son orientativas y dependen del framework y la longitud de contexto.
- GPU recomendadas: NVIDIA RTX 3060/4060 (12 GB) o superior para FP16; RTX 3060 (8 GB) o superior para cuantización Q8; GPUs con 4-6 GB pueden ejecutar versiones Q4.
- Compatible con GPUs de consumo (serie RTX 30/40) y GPUs de datacenter (A100, H100). También soporta hardware alternativo como Huawei Ascend, Hygon y HOUMO.AI.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, MLX, Ollama, LM Studio, y frameworks de fine-tuning como LLaMA-Factory.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible. La model card afirma una eficiencia superior en TTFT, TOPT y rendimiento general frente a modelos de tamaño similar, pero sin datos numéricos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.5-4B | 4.1B | 1M tokens | Apache 2.0 | Arquitectura híbrida SWA + atención completa, enfoque agéntico |
| Qwen2.5-4B | 4.0B | 128K tokens | Apache 2.0 | Modelo denso, buen rendimiento en código y razonamiento |
| Llama-3.2-3B | 3.2B | 128K tokens | Llama 3.2 Community | Modelo ligero, soporte multilingüe limitado |
| Gemma-2-2B | 2.6B | 8K tokens | Gemma Terms | Modelo compacto, contexto corto |

La comparativa se basa en características generales conocidas de los modelos alternativos. No se dispone de datos de rendimiento comparativos publicados para Spark-X2.5-4B en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios poco representados en el entrenamiento.
- Limitaciones de contexto: aunque soporta 1M tokens, el rendimiento en contextos muy largos puede degradarse y el coste computacional aumenta significativamente. Se recomienda validar el comportamiento en el caso de uso específico.
- Limitaciones de idioma: aunque se declara soporte para más de 200 idiomas, los idiomas principales de entrenamiento son inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y atribución. No hay restricciones conocidas adicionales.
- Caveat para producción: la información sobre benchmarks y rendimiento es limitada; se recomienda realizar pruebas propias antes de desplegar en entornos críticos. La integración con agentes requiere configuración adicional y validación de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio GitHub: https://github.com/XHToken/Spark-X2.5
- ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-4B
- Colección HuggingFace: https://huggingface.co/collections/XHToken/spark-x25
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B-Base
- Versión GGUF: https://huggingface.co/models?other=base_model:quantized:XHToken/Spark-X2.5-4B
