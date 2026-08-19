# Veeda241/krishi-anuman-qwen-1.5b

## Resumen

El modelo `Veeda241/krishi-anuman-qwen-1.5b` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits de Qwen2.5-1.5B-Instruct. El adaptador ha sido fine-tuneado con avisos y recomendaciones agrícolas del ICAR (Indian Council of Agricultural Research) y del IPM (Integrated Pest Management), con el objetivo de ofrecer asesoramiento agrícola contextualizado para la India. El proyecto se enmarca dentro de la iniciativa `krishi-anuman-x` y el identificador `sih25099` sugiere su participación en un Smart India Hackathon.

Este modelo resuelve el problema de adaptar un LLM generalista a un dominio específico con recursos limitados: mediante LoRA se ajusta un modelo pequeño (1.5B parámetros) con un coste de entrenamiento reducido, manteniendo la capacidad de generación de texto conversacional en inglés e hindi. Su relevancia radica en su aplicabilidad práctica para agricultores y extensionistas en regiones rurales de la India, donde el acceso a asesoramiento técnico especializado es limitado. La arquitectura subyacente es transformer decoder-only, con una longitud de contexto nativa de 32.768 tokens en la versión base de Qwen2.5, aunque no se especifica si el adaptador modifica este parámetro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B) con adaptadores LoRA |
| Parametros totales | No disponible (modelo base: 1.5B; adaptador LoRA: ~0.1 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | Base: 4-bit (BNB); adaptador: safetensors en precisión original (no se especifica) |
| Idiomas soportados | Inglés (en), hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B-Instruct, un transformer causal con atención multi-cabeza estándar y normalización RMSNorm. El adaptador LoRA inserta matrices de bajo rango en las capas de atención y feed-forward, permitiendo un fine-tuning eficiente en parámetros. El entrenamiento se realizó sobre avisos agrícolas del ICAR y del IPM, aunque no se proporcionan detalles sobre el número de tokens, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO. El modelo base fue cuantizado a 4 bits con bitsandbytes para reducir el uso de memoria durante el entrenamiento, y el adaptador resultante se distribuye por separado, pudiendo fusionarse con el modelo base para su despliegue.

No se documentan innovaciones técnicas adicionales más allá del uso estándar de LoRA. El proceso de carga recomendado utiliza `AutoPeftModelForCausalLM` de la librería `peft`, y se sugiere la posibilidad de fusionar los pesos localmente para servirlo con vLLM u Ollama.

## Capacidades

- Generación de texto conversacional: el modelo hereda las capacidades instructivas de Qwen2.5-1.5B-Instruct, adaptadas al dominio agrícola.
- Asesoramiento agrícola: responde a consultas sobre prácticas de cultivo, manejo de plagas y recomendaciones basadas en los avisos del ICAR/IPM.
- Soporte bilingüe inglés-hindi: puede generar respuestas en ambos idiomas, aunque no se especifica la calidad del cambio de idioma.
- Uso mediante PEFT: el adaptador se carga con `AutoPeftModelForCausalLM`, lo que facilita su integración en pipelines de transformers.
- Despliegue flexible: se puede fusionar con el modelo base y servir con vLLM u Ollama, permitiendo inferencia local o en servidor.

No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Asistente de consultas agrícolas para agricultores: un agricultor puede preguntar sobre enfermedades de cultivos, dosis de fertilizantes o calendarios de siembra, y el modelo responde con recomendaciones basadas en los avisos del ICAR/IPM. Su tamaño reducido permite ejecutarlo en dispositivos con recursos limitados, como tablets o móviles de gama media.
- Chatbot de extensión rural: organizaciones gubernamentales o ONG pueden desplegarlo como chatbot en plataformas de mensajería (WhatsApp, Telegram) para ofrecer soporte a comunidades agrícolas en hindi e inglés, reduciendo la carga de los extensionistas.
- Herramienta de apoyo a la toma de decisiones: los agrónomos pueden utilizarlo como referencia rápida para validar recomendaciones estándar del IPM, aunque siempre con supervisión humana dado el riesgo de alucinación.
- Formación y educación: estudiantes de agronomía pueden interactuar con el modelo para aprender sobre prácticas de manejo integrado de plagas, a modo de tutor interactivo.
- Integración en sistemas de gestión agrícola: el adaptador puede fusionarse y servirse vía API (por ejemplo, con vLLM) para alimentar un sistema de recomendaciones personalizadas basado en la ubicación y el cultivo del usuario.
- Traducción y adaptación de avisos técnicos: dado su entrenamiento en inglés e hindi, puede reformular avisos técnicos del ICAR a un lenguaje más accesible para agricultores, aunque su capacidad de traducción no está verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas del dominio agrícola. Se desconoce el rendimiento comparativo con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 1.5B cuantizado a 4 bits, la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM. Sin embargo, el adaptador en safetensors puede requerir la carga del modelo base en precisión completa (fp16) si no se fusiona con la cuantización, lo que aumentaría el requisito a ~4 GB adicionales.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), o cualquier GPU con soporte CUDA y al menos 6 GB de VRAM. También es viable en Apple Silicon (M1/M2) con MPS.
- Compatibilidad con consumer GPU: sí, es adecuado para GPUs de consumo medio.
- Opciones de despliegue: vLLM (tras fusionar pesos), Ollama (si se convierte a GGUF), llama.cpp (con conversión), o directamente con transformers y PEFT.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una latencia de generación de decenas de tokens por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el dominio de asesoramiento agrícola con fine-tuning LoRA sobre Qwen2.5. La comparativa natural sería contra el modelo base Qwen2.5-1.5B-Instruct sin fine-tuning, que tendría un rendimiento generalista pero sin especialización en avisos ICAR/IPM. También podría compararse con otros adaptadores agrícolas, pero no hay datos públicos. Por tanto, la comparativa detallada no está disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño fine-tuneado con un conjunto de datos específico, puede generar recomendaciones incorrectas o inventar datos agrícolas. No debe usarse como fuente única de decisión en campo sin validación humana.
- Limitaciones de idioma: aunque declara soporte para inglés e hindi, la calidad en hindi puede ser inferior a la del inglés, especialmente en jerga técnica regional.
- Contexto limitado: aunque el modelo base soporta 32K tokens, el adaptador no especifica si mantiene esa longitud; en la práctica, el fine-tuning con datos cortos puede degradar el rendimiento en contextos largos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 está sujeto a la licencia de Alibaba (Qwen License), que puede imponer condiciones adicionales. Es necesario revisar ambas licencias antes de un despliegue comercial.
- Dependencia del dominio: el modelo está entrenado exclusivamente con avisos agrícolas de la India (ICAR/IPM), por lo que su utilidad fuera de ese contexto geográfico y agronómico es limitada.
- Riesgo de obsolescencia: los avisos agrícolas cambian con las temporadas y las regulaciones; el modelo no tiene mecanismo de actualización automática.

## Enlaces

- HuggingFace: https://huggingface.co/Veeda241/krishi-anuman-qwen-1.5b
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Referencia a Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
