# XHToken/Spark-X2.5-4B-Base

## Resumen

Spark-X2.5-4B-Base es un modelo de lenguaje compacto desarrollado por XHToken (SparkLLM Team), presentado junto a una variante de 1.7B. Está diseñado para ofrecer capacidades de IA generalistas en tareas cotidianas: conversación, escritura, traducción, razonamiento, codificación, uso de herramientas y flujos agénticos. Su relevancia radica en combinar un tamaño reducido (4.112 millones de parámetros) con una ventana de contexto nativa de hasta 1 millón de tokens, algo poco habitual en modelos de este tamaño.

La arquitectura es un transformer híbrido que alterna una capa de atención completa con tres capas de atención de ventana deslizante, reduciendo el coste computacional de los contextos largos. El modelo se entrenó en clústeres Huawei Ascend y se aplicaron técnicas de post-entrenamiento con RL y MOPD. Está licenciado bajo Apache 2.0 y distribuido en formato safetensors, con soporte declarado para más de 200 idiomas, aunque HuggingFace solo etiqueta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: una capa de atención completa por cada tres capas de atención de ventana deslizante |
| Parametros totales | 4.112.079.360 (4.1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.000.000 tokens (nativo, según el autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés y chino (según HuggingFace); el autor declara soporte para más de 200 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida de atención que combina una capa de atención completa con tres capas de atención de ventana deslizante. Este diseño reduce sustancialmente el coste computacional asociado a contextos largos y permite una ventana nativa de hasta 1 millón de tokens. El entrenamiento se realizó en clústeres Huawei Ascend, y se aplicaron técnicas de post-entrenamiento a gran escala, incluyendo reinforcement learning y MOPD, para mejorar razonamiento, codificación, capacidades agénticas y seguimiento de instrucciones. No se han publicado detalles sobre la composición del dataset ni el número de tokens de entrenamiento. El autor recomienda LLaMA-Factory para fine-tuning.

## Capacidades

- Generación de texto, escritura, traducción, razonamiento y conversación.
- Generación de código y soporte para flujos de trabajo agénticos.
- Integración con harnesses de agentes: Codex, Claude Code, OpenClaw y Hermes.
- Soporte de tool use / function calling para integrar llamadas a herramientas y APIs.
- Razonamiento multi-paso y seguimiento de instrucciones.
- Ventana de contexto nativa de hasta 1M tokens, con atención híbrida eficiente.
- Multilingüe: el autor declara soporte para más de 200 idiomas; HuggingFace lista inglés y chino.
- Compatibilidad con hardware NVIDIA, Huawei, Hygon y HOUMO.AI.

## Casos de uso

- Atención al cliente automatizada: gracias a la ventana de 1M tokens, puede mantener conversaciones largas con historial extenso y usar tool calling para consultar bases de conocimiento o sistemas de ticketing.
- Asistente de programación en entornos de desarrollo: integrado con Codex y Claude Code, puede generar código, revisar cambios y participar en flujos agénticos de desarrollo.
- Traducción y localización de contenido: con soporte declarado para más de 200 idiomas y formato compacto, puede desplegarse en servicios de traducción en tiempo real.
- Análisis de documentos largos: la arquitectura híbrida reduce el coste de atención sobre documentos extensos, permitiendo resumir o razonar sobre contratos, informes o logs completos.
- Automatización de flujos de trabajo empresariales: el modelo puede actuar como agente que encadena llamadas a herramientas, APIs y razonamiento multi-paso para ejecutar tareas complejas.
- Asistente local en dispositivos de consumo: con 4B parámetros y soporte para llama.cpp, Ollama y LM Studio, puede ejecutarse en GPUs de consumo o en entornos con recursos limitados.
- Fine-tuning para dominios específicos: al estar licenciado bajo Apache 2.0 y ser compatible con LLaMA-Factory, puede adaptarse a datos propios para tareas de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo logra resultados líderes entre modelos de tamaño comparable, pero no se aportan cifras concretas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Estimación orientativa basada en el tamaño de los pesos; no hay datos oficiales de VRAM.
- En FP16, los pesos de 4.1B ocupan aproximadamente 8,2 GB; se recomiendan al menos 12 GB de VRAM para inferencia con contexto moderado.
- En cuantización 4-bit, los pesos pueden reducirse a unos 2-3 GB, permitiendo ejecución en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para FP16 con contextos largos; A100/H100 para despliegue de alta concurrencia; RTX 3060/4060 (12/8 GB) para versiones cuantizadas.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponible; el autor afirma mejoras en TTFT y TOPT frente a modelos similares, pero sin cifras concretas.

## Comparativa con modelos similares

En la información proporcionada no se incluyen datos de modelos comparables de la misma categoría. El autor menciona Spark-X2.5-1.7B como modelo hermano de menor tamaño, pero no se aportan sus especificaciones completas. Por tanto, la comparativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- La ficha de HuggingFace solo lista inglés y chino como idiomas; la afirmación de soporte para más de 200 idiomas procede del autor y debe validarse en uso real.
- No se han publicado benchmarks ni detalles del dataset, por lo que la evaluación independiente es limitada.
- Como todo modelo generativo, existe riesgo de alucinación; se recomienda validar salidas en aplicaciones de producción.
- No se documentan sesgos específicos en la información proporcionada; se requiere evaluación propia para dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero exige mantener el aviso de licencia y atribución.
- El modelo está fechado en 2026; su estado de soporte y actualizaciones puede ser reciente.

## Enlaces

- HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-4B-Base
- GitHub: https://github.com/XHToken/Spark-X2.5
- Repositorio LLaMA-Factory recomendado: https://github.com/XHToken/LlamaFactory
