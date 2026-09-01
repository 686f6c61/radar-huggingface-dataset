# TheCoderScientist/GarudaCoder-27B-ID-lora

## Resumen

GarudaCoder-27B-ID-lora es un adaptador LoRA (PEFT) desarrollado por TheCoderScientist sobre el modelo base Qwen3.8-27B en su versión cuantizada a 4 bits de Unsloth. Se presenta como la evolución de GarudaCoder-7B-Coder-ID-lora, con el objetivo de proporcionar un asistente de programación en indonesio que prioriza la explicación del razonamiento antes de escribir código, la honestidad sobre la incertidumbre (anti-alucinación) y el contexto del desarrollador indonesio. Todo el output del modelo está en indonesio.

El adaptador se entrenó con QLoRA (r=8, alpha=8) sobre un conjunto de datos curado de código indonesio de alta calidad, con solo 229 ejemplos y una época. A pesar de su pequeño tamaño de entrenamiento, el modelo busca ofrecer respuestas fundamentadas en arquitectura, flujos de depuración y casos límite específicos de Indonesia. Al ser un adaptador, requiere descargar el modelo base de 27B parámetros, lo que implica un consumo de VRAM considerable (alrededor de 20,5 GiB en 4 bits). Su relevancia radica en cubrir un nicho lingüístico poco atendido: la asistencia de código en indonesio con un modelo de gran tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) + adaptador LoRA (PEFT) |
| Parametros totales | 27B (modelo base) + adaptador LoRA (r=8, alpha=8) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado con max_seq_length=1024; contexto del modelo base no especificado en la documentación |
| Tipos de cuantizacion | 4-bit NF4 (BitsAndBytes) para el base; el adaptador es agnóstico a cuantización |
| Idiomas soportados | Indonesio (salida); el base Qwen3.8-27B es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un modelo denso de 27B parámetros construido sobre la arquitectura Qwen3.5, según la información disponible en LM Studio. Es un modelo de visión-lenguaje (VLM) compacto y orientado a despliegue, con capacidades de razonamiento y ejecución de agentes. Sobre este base, se aplica un adaptador LoRA con r=8 y alpha=8, entrenado mediante QLoRA en 4 bits. El entrenamiento se realizó con 229 ejemplos de un dataset curado de código indonesio, durante una época, con una longitud máxima de secuencia de 1024 tokens. Se usó SFT con enmascaramiento de instrucciones/respuestas (train_on_responses_only) y semilla 42. El entorno de entrenamiento fue Kaggle con dos T4 (29,12 GiB de VRAM), Python 3.12.13, torch 2.10.0+cu128 y CUDA 12.8. Se mantuvieron 80 ejemplos fuera del entrenamiento como holdout para evaluación, con medidas anti-fuga de datos.

## Capacidades

- Generación de código en indonesio con explicación previa del razonamiento (cadena de pensamiento: causa raíz → alternativas y trade-offs → solución).
- Auto-corrección: el modelo redacta un borrador, lo prueba mentalmente, detecta su propio error y lo corrige.
- Depuración multi-turno: puede mantener conversaciones largas para resolver problemas de código, pidiendo aclaraciones cuando la petición es ambigua.
- Rechazo de peticiones incorrectas o peligrosas, ofreciendo alternativas seguras.
- Respuestas fundamentadas en arquitectura de software, flujos de depuración y casos límite específicos del contexto indonesio.
- Honestidad sobre la incertidumbre: evita inventar APIs, versiones o números; si no tiene información suficiente, solicita clarificación.
- Soporte de tool calling y funciones de agente: heredado del modelo base Qwen3.8-27B, aunque no se documenta explícitamente en el adaptador.

## Casos de uso

- Asistente de programación para desarrolladores indonesios: el modelo puede integrarse en un IDE o chatbot para responder preguntas de código en indonesio, explicando el razonamiento antes de dar la solución, lo que facilita el aprendizaje y la comprensión.
- Depuración de código en producción: gracias a su capacidad de auto-corrección y razonamiento multi-turno, puede ayudar a diagnosticar errores complejos en aplicaciones indonesias, pidiendo contexto adicional cuando sea necesario.
- Tutor de programación para estudiantes indonesios: al explicar conceptos de arquitectura y algoritmos en indonesio, sirve como recurso educativo para quienes no dominan el inglés técnico.
- Generación de documentación técnica en indonesio: puede redactar comentarios, guías y documentación de API en indonesio, manteniendo precisión técnica y evitando invenciones.
- Revisión de código (code review): el modelo puede analizar fragmentos de código, identificar posibles bugs y sugerir mejoras, explicando las razones de cada recomendación.
- Integración en pipelines de CI/CD para validación de código: aunque no se documenta explícitamente, su capacidad de razonamiento y generación de código permite usarlo como asistente en flujos de revisión automatizada, siempre que se le proporcione el system prompt adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor menciona un holdout de 80 ejemplos para evaluación, pero no se detallan los resultados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20,5 GiB en 4 bits (modelo base + adaptador), según la model card.
- GPU recomendadas: no cabe en una sola T4 (16 GB); se necesitan 2× T4 (16 GB cada una) o una GPU con 24 GB o más (por ejemplo, RTX 3090, RTX 4090, A10G, A100).
- En GPUs de consumo: sí cabe en una RTX 3090 o RTX 4090 (24 GB), pero no en tarjetas de 16 GB como la T4 o la RTX 4080 Super (aunque esta tiene 16 GB, no es suficiente).
- Opciones de despliegue: Unsloth (recomendado por el autor) o transformers + PEFT con BitsAndBytes. También es posible usar vLLM si se fusiona el adaptador con el base, aunque no se documenta.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en T4×2, lo que sugiere que la inferencia en hardware similar es viable, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GarudaCoder-27B-ID-lora | Qwen3.8-27B | 27B + LoRA | 1024 (entrenamiento) | Indonesio | Apache-2.0 | Hugging Face (adaptador) |
| GarudaCoder-7B-Coder-ID-lora | Qwen2.5-Coder-7B | 7B + LoRA | No especificado | Indonesio | Apache-2.0 | Hugging Face (adaptador) |
| Qwen3.8-27B (base) | - | 27B | No especificado | Multilingüe | Apache-2.0 | Hugging Face |

La comparativa se limita al predecesor y al modelo base, ya que no se dispone de información sobre otros modelos de código en indonesio. La principal diferencia con el predecesor es el tamaño (27B vs 7B) y la arquitectura base (Qwen3.8 vs Qwen2.5-Coder), lo que debería implicar mejor rendimiento en razonamiento y generación de código, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: requiere descargar el modelo base Qwen3.8-27B en 4 bits, lo que añade complejidad de despliegue y dependencia de la disponibilidad del base.
- Entrenamiento con solo 229 ejemplos: la cobertura de casos de uso puede ser limitada, y el modelo puede fallar en escenarios no representados en el dataset.
- Contexto de entrenamiento limitado a 1024 tokens: aunque el base soporta más, el adaptador fue entrenado con secuencias cortas, lo que puede degradar el rendimiento en conversaciones largas o con mucho contexto.
- Salida exclusivamente en indonesio: el fine-tuning puede haber degradado las capacidades multilingües del base; no se recomienda usarlo para otros idiomas.
- Riesgo de alucinación: aunque se entrenó para ser honesto sobre la incertidumbre, no es infalible; se recomienda verificar las respuestas en entornos de producción.
- Dependencia del system prompt: el rendimiento se degrada significativamente si no se usa el system prompt exacto proporcionado por el autor.
- Problema conocido con HF Xet: las descargas pueden quedarse atascadas en la etapa "Reconstructing (incomplete total...)"; se recomienda desactivar Xet con `HF_HUB_DISABLE_XET=1` antes de cualquier importación.
- Requisitos de hardware elevados: no es adecuado para GPUs de 16 GB o menos; necesita al menos 24 GB de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheCoderScientist/GarudaCoder-27B-ID-lora
- Predecesor (GarudaCoder-7B-Coder-ID-lora): https://huggingface.co/TheCoderScientist/GarudaCoder-7B-Coder-ID-lora
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Issue de xet-core sobre descargas atascadas: https://github.com/huggingface/xet-core/issues/850
- Página de Qwen3.8-27B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
