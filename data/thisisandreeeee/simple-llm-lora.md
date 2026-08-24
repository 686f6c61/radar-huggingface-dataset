# thisisandreeeee/simple-llm-lora

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base `Qwen/Qwen3.5-4B`, desarrollado por `thisisandreeeee`. El objetivo del adaptador es reescribir explicaciones técnicas en inglés simplificándolas: frases más cortas, vocabulario común, voz activa y una idea principal por frase, sin alterar los términos técnicos, el código, los comandos ni los datos factuales. Se trata de un adaptador experimental de estilo, no de un modelo que aumente la fiabilidad factual del modelo base.

El modelo se entrenó con supervisión fina (SFT) usando la librería Unsloth y TRL, con pérdida solo sobre los tokens del asistente. El dataset de entrenamiento es `thisisandreeeee/simple-llm-sft`, con 901 ejemplos de entrenamiento, 99 de validación y 100 prompts de prueba. El adaptador es pequeño (0.1 GB) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3.5-4B (transformer decoder) |
| Parámetros totales | No disponible (adaptador LoRA de 0.1 GB; el modelo base tiene 4B parámetros) |
| Parámetros activos | No aplicable (modelo no MoE) |
| Longitud de contexto | 2,048 tokens (máximo de entrenamiento) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en bf16; el modelo base puede cuantizarse con GGUF o bitsandbytes) |
| Idiomas soportados | Inglés (evaluado solo en inglés técnico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica de Low-Rank Adaptation (LoRA) aplicada al modelo Qwen3.5-4B. Durante el entrenamiento, el modelo base permaneció congelado y solo se ajustaron los adaptadores LoRA en las capas de proyección de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y en las capas MLP (`gate_proj`, `up_proj`, `down_proj`). La configuración LoRA usa un rango de 16, alpha de 16 y dropout de 0. El entrenamiento se realizó en precisión bf16 con batch efectivo de 8, learning rate de 1e-4, warmup del 5%, optimizador AdamW de 8 bits y un máximo de 2,048 tokens de secuencia. Se ejecutaron 2 épocas con validación cada 25 pasos, restaurando el checkpoint con la menor pérdida de validación. El entrenamiento se llevó a cabo en una NVIDIA L4 a través de Modal, sin necesidad de QLoRA ni cuantización de 4 bits.

El dataset de SFT contiene 901 ejemplos de entrenamiento y 99 de validación, con una partición estratificada por tema y semilla 42. Cada ejemplo tiene un mensaje de usuario y una respuesta de asistente; la pérdida se calcula solo sobre los tokens de asistente. El thinking mode de Qwen3.5 está desactivado en el template de chat.

## Capacidades

- Simplificación de texto técnico en inglés: reduce la longitud media de las frases y la fracción de frases largas, manteniendo la precisión técnica.
- Reescritura de documentación, procedimientos, runbooks y material similar en un estilo más claro.
- Preservación de términos técnicos, código, comandos y datos factuales sin alteración.
- Generación de explicaciones con voz activa y una idea principal por frase.
- El adaptador no añade nuevas capacidades de razonamiento, codificación o multilingüismo; depende completamente del modelo base Qwen3.5-4B.

## Casos de uso

- Documentación técnica simplificada: reescribir manuales de API, guías de inicio rápido o documentación interna para hacerla más accesible a un público junior, sin perder los detalles técnicos esenciales.
- Runbooks y procedimientos operativos: convertir runbooks de operaciones con instrucciones complejas en pasos claros y cortos, reduciendo el riesgo de malinterpretación en entornos de producción.
- Soporte técnico en línea: generar respuestas a preguntas de usuarios sobre errores de software, comandos o configuración, con explicaciones más directas y fáciles de seguir.
- Generación de contenido educativo: preparar material de formación técnica (tutoriales, guías de inicio rápido) con frases más simples y estructuradas.
- Traducción técnica simplificada: aunque el adaptador se evaluó en inglés, puede aplicarse sobre el modelo base multilingüe para simplificar textos técnicos en otros idiomas, pero requiere validación previa.
- Integración en pipelines de documentación: usar el adaptador como post-procesador en un pipeline de generación de documentación automática para mejorar la legibilidad de los borradores generados por el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta una evaluación propia sobre 100 prompts técnicos de prueba, comparando tres condiciones: el modelo base, el modelo base con un system prompt de "Simple English", y el adaptador SFT. La evaluación combinó un juez automático (DeepSeek) para medir adecuación técnica, cumplimiento de tarea, claridad y simplicidad semántica, junto con reglas deterministas para propiedades de estilo. Los resultados son:

| Condición | Longitud media de frase ↓ | Fracción de frases largas ↓ | Simplicidad semántica ↑ | Adecuación técnica ↑ |
|---------------------------|---------------------------|------------------------------|--------------------------|----------------------|
| Qwen3.5-4B base | 17.93 | 25.44% | 0.658 | 0.683 |
| Base + prompt de inglés simple | 11.15 | 4.22% | 0.748 | 0.592 |
| Qwen3.5-4B SFT | 15.37 | 15.76% | 0.792 | 0.719 |

El adaptador SFT mejora la simplicidad semántica y la adecuación técnica frente a ambas comparaciones en esta evaluación. El prompt-only produce las frases más cortas, pero con menor adecuación técnica.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB) y se carga junto al modelo base Qwen3.5-4B (4B parámetros).
- Para inferencia con el modelo base en bf16, se recomienda una GPU con al menos 8-10 GB de VRAM (por ejemplo, RTX 3070/3080, L4, A10G). Con cuantización de 4 bits (bitsandbytes), cabe en 4-6 GB.
- En una NVIDIA L40 (usada en el entrenamiento) la inferencia es fluida; en GPUs consumer como RTX 4090 o RTX 4060 Ti también es viable.
- El despliegue puede hacerse con vLLM, TGI, Ollama o llama.cpp (si se convierte el modelo base a GGUF y se integra el adaptador).
- No hay datos publicados de latencia o throughput específicos; depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables de simplificación de texto técnico sobre Qwen3.5-4B. La comparación más directa es con el propio modelo base y con la técnica de prompt engineering:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---------------------------|------------|----------|-------------|----------|
| Qwen3.5-4B base | 4B | 2,048 (en este adaptador) | Adecuación técnica 0.683, simplicidad 0.658 | Apache-2.0 |
| Qwen3.5-4B + prompt simple | 4B | 2,048 | Adecuación técnica 0.592, simplicidad 0.748 | Apache-2.0 |
| Qwen3.5-4B + adaptador SFT | 4B + LoRA | 2,048 | Adecuación técnica 0.719, simplicidad 0.792 | Apache-2.0 |

La comparativa con otros adaptadores de simplificación de texto (por ejemplo, adaptadores de estilo o simplificación de lenguaje) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se evaluó solo con prompts técnicos en inglés; no está validado para otros idiomas ni dominios fuera del ámbito técnico.
- No mejora la fiabilidad factual del modelo base; puede alucinar o mantener errores del modelo original.
- El estilo simplificado puede reducir la precisión en contextos que requieren matices técnicos o terminología especializada, aunque la evaluación muestra una adecuación técnica ligeramente superior.
- El adaptador tiene un contexto de entrenamiento de 2,048 tokens; secuencias más largas pueden degradar el rendimiento.
- Al ser un adaptador experimental, se recomienda revisar manualmente el código, comandos y consejos de seguridad generados antes de su uso en producción.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y notificación de cambios.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/thisisandreeeee/simple-llm-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/thisisandreeeee/simple-llm-sft
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Código fuente del proyecto (GitHub): https://github.com/thisisandreeeee/simple-llm
- Implementación de LoRA (microsoft/LoRA): https://github.com/microsoft/LoRA
