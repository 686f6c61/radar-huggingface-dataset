# xiaomayi025/mayi-psy-it-GGUF

## Resumen

Mayi Psychology Assistant (蚂蚁心理学小助手) es un modelo experimental de diálogo en chino orientado a soporte psicológico, desarrollado por el usuario de Hugging Face xiaomayi025. Se trata de un fine-tuning del modelo base google/gemma-4-E2B-it, realizado con QLoRA y SFT mediante el framework Unsloth sobre una versión adaptada del dataset PsyDial-D3, un corpus de conversaciones largas de apoyo emocional en chino publicado por Qiu y Lan (ACL 2025).

El modelo resuelve un problema concreto: dotar a un modelo pequeño (4.628.569.635 parámetros, unos 4,6B) de un estilo conversacional de apoyo psicológico en chino simplificado, de forma que pueda ejecutarse localmente en hardware de consumo. Para ello, el autor fusionó el LoRA entrenado con el modelo base en BF16 y lo cuantizó a GGUF Q4_K_M, obteniendo un único archivo de unos 3,4 GB compatible con llama.cpp.

Su relevancia es principalmente de investigación y prototipado: permite experimentar con asistentes de soporte emocional en chino sin depender de servicios en la nube. El propio autor advierte de forma explícita que no es un sustituto de un psicólogo titulado, que no tiene capacidad validada de diagnóstico clínico ni de intervención en crisis, y que su seguridad en escenarios reales de riesgo no ha sido evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4 E2B, variante instruction-tuned) |
| Parametros totales | 4.628.569.635 (≈4,6B) |
| Parametros activos | no disponible (no se indica que sea MoE; asume densidad completa) |
| Longitud de contexto | 4.096 tokens (longitud máxima usada en entrenamiento y recomendada en inferencia) |
| Tipos de cuantizacion | Q4_K_M (GGUF); entrenamiento realizado sobre pesos base en 4-bit (QLoRA) |
| Idiomas soportados | Chino simplificado (zh); entrenado principalmente en chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único `mayi-psy-e2b-q4.gguf`, ≈3,40 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B IT, un modelo instruction-tuned de la familia Gemma de Google DeepMind con arquitectura transformer decoder. Sobre él se aplicó un fine-tuning supervisado (SFT) con QLoRA usando Unsloth: LoRA con rank 8 y alpha 8, learning rate de 5e-5, batch size efectivo de 4 (batch de 1 con acumulación de gradiente 4), longitud de secuencia máxima de 4.096 tokens y un único epoch con 536 pasos de optimización. El entrenamiento se ejecutó en una sola GPU en la plataforma AutoDL, calculando la loss de supervisión solo sobre las respuestas del asistente.

Los datos de entrenamiento provienen de PsyDial-D3, un dataset de 2.382 conversaciones largas de soporte psicológico en chino. El autor usó una adaptación local en la que el personaje "小天" del dataset original se sustituyó por "蚂蚁", con 2.144 conversaciones de entrenamiento y 238 de validación. La pérdida media de entrenamiento registrada fue de 3,353 y la de validación (eval_loss) de 3,093. Tras el entrenamiento, el LoRA se fusionó con el modelo base en BF16, se convirtió a GGUF BF16 con llama.cpp y se cuantizó a Q4_K_M. No hay indicios de RLHF ni DPO posteriores.

## Capacidades

- Generación de diálogo conversacional en chino simplificado con estilo de soporte psicológico y escucha empática, aprendido de PsyDial-D3.
- Manejo de conversaciones multi-turno de apoyo emocional dentro de una ventana de 4.096 tokens.
- Seguimiento de instrucciones de system prompt para mantener una identidad de producto ("蚂蚁") y aplicar reglas de seguridad básicas (reconocer riesgo de autolesión y derivar a ayuda profesional).
- Capacidades multimodales del modelo base Gemma 4 E2B no están garantizadas ni verificadas en este GGUF de un solo archivo.
- No hay soporte documentado de tool calling, function calling ni razonamiento multi-step para agentes.
- Compatibilidad con servidores OpenAI-compatible vía llama-server, lo que facilita su integración en chatbots.

## Casos de uso

- Prototipado de chatbots de apoyo emocional en chino: el modelo genera respuestas breves y empáticas en conversaciones multi-turno, adecuado para validar la experiencia de usuario antes de invertir en modelos mayores.
- Investigación en NLP de salud mental: permite estudiar el estilo de respuesta de modelos fine-tuned sobre PsyDial-D3 y comparar variantes de prompt o decodificación en local.
- Experimentación offline con GGUF: al ser un único archivo de 3,4 GB en Q4_K_M, se puede ejecutar en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama.
- Servicios de chat locales con API OpenAI-compatible: llama-server expone `/v1/chat/completions`, útil para integrarlo en interfaces de chat existentes sin enviar datos a terceros.
- Pruebas de ingeniería de system prompts: el repositorio publica el system prompt original de entrenamiento y una versión endurecida para inferencia, lo que lo hace útil para estudiar cómo el prompting modula la identidad y la seguridad del asistente.
- Demostraciones educativas: puede usarse para ilustrar en cursos o talleres los límites de los LLM en contextos sensibles, incluyendo fallos de identidad (puede presentarse como Gemma sin system prompt).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta las pérdidas de entrenamiento (3,353 de media) y de validación (3,093) del run de fine-tuning, y advierte explícitamente que no existen evaluaciones humanas ciegas ni tests de respuesta a crisis psicológica comparando con el modelo base.

## Requisitos de hardware

- VRAM/RAM para inferencia: el GGUF Q4_K_M ocupa unos 3,4 GB; con contexto de 4.096 tokens y overhead de KV cache, se estima un requisito de unos 4-5 GB de RAM o VRAM unificada.
- GPU recomendadas: no es necesaria GPU; se ejecuta en CPU. Con GPU, cualquier tarjeta con 6 GB o más de VRAM (por ejemplo RTX 3060 de 12 GB o RTX 4060 Ti) acelera la inferencia de forma notable.
- Consumer GPUs: cabe con holgura en GPUs de consumo modernas de 8 GB o más; también funciona solo con CPU gracias a llama.cpp.
- Despliegue: llama.cpp (llama-cli y llama-server, versión reciente con soporte Gemma 4 GGUF); en principio compatible con backends GGUF como Ollama o LM Studio, aunque el autor solo documenta llama.cpp. No hay documentación para vLLM ni TGI con este GGUF.
- Latencia y throughput: no disponible; al ser un modelo de ~4,6B cuantizado a 4-bit, se espera interacción fluida en CPU moderna y alta velocidad en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| mayi-psy-it-GGUF | ≈4,6B | GGUF Q4_K_M | 4.096 | zh (psicología) | Apache-2.0 | Soporte psicológico, fine-tuning comunitario |
| google/gemma-4-E2B-it (base) | ≈4,6B | Safetensors (BF16) | no disponible en esta ficha | Multilingue | Gemma / Apache-2.0 según repositorio | Modelo general instruction-tuned |
| Qwen2.5-3B-Instruct / Qwen3-4B | 3B-4B | Safetensors, GGUF comunitario | hasta 32K+ | Multilingue (fuerte en zh) | Apache-2.0 (variantes) | General, requiere fine-tuning propio para psicología |

Nota: la comparativa se limita a modelos de la misma escala disponibles abiertamente; no existen publicados otros fine-tunings públicos sobre PsyDial-D3 con métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un sustituto de un profesional: carece de capacidad validada de diagnóstico clínico, psicoterapia, evaluación de riesgo suicida o intervención en crisis. El autor lo prohíbe explícitamente para estos usos.
- Seguridad no validada en crisis reales: no se han realizado evaluaciones de seguridad independientes ni pruebas de derivación a ayuda humana; cualquier despliegue público requiere supervisión, monitorización y diseño de escalado a profesionales.
- Riesgo de alucinación: puede generar hechos incorrectos e inferencias psicológicas excesivamente seguras de sí mismo; los datos de fine-tuning contienen respuestas posiblemente cortas, repetitivas o incoherentes que la cuantización no corrige.
- Problemas de identidad: sin system prompt adecuado, el modelo puede presentarse como "Gemma" en lugar de "蚂蚁"; el prompt de entrenamiento original incluía reglas discutibles ("no empatizar en fases iniciales") no validadas clínicamente.
- Idioma: entrenado casi exclusivamente en chino simplificado; el rendimiento en otras lenguas, incluido el castellano, no está garantizado ni evaluado.
- Contexto limitado a 4.096 tokens en la práctica documentada, insuficiente para sesiones muy largas con historial completo.
- Privacidad: el autor advierte no subir datos sensibles de salud mental identificables a servicios de modelos no confiables.
- Licencia: Apache-2.0 tanto en el repositorio como en el modelo base y el dataset según sus páginas, pero deben respetarse los requisitos de atribución y avisos de las licencias upstream; el proyecto no está afiliado a Google ni a los autores de PsyDial.
- Los valores de loss reportados provienen de un único experimento y no demuestran eficacia clínica ni ausencia de sobreajuste.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xiaomayi025/mayi-psy-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/qiuhuachuan/PsyDial-D3
- Paper de PsyDial (ACL 2025): https://aclanthology.org/2025.acl-long.1049/ (DOI: 10.18653/v1/2025.acl-long.1049)
- System prompt original de entrenamiento: https://huggingface.co/xiaomayi025/mayi-psy-it-GGUF/blob/main/SYSTEM_PROMPT.txt
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
