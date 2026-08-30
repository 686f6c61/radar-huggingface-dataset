# Ttimms/Bible-Assistant-Qwen3.5-4B-v2-GGUF

## Resumen

Bible-Assistant-Qwen3.5-4B-v2-GGUF es un conjunto de cuantizaciones GGUF del modelo Ttimms/Bible-Assistant-Qwen3.5-4B-v2, un ajuste fino (SFT) de Qwen3.5-4B orientado a preguntas y respuestas sobre la Biblia con recuperación aumentada (RAG). El modelo está desarrollado por Ttimms como parte del proyecto open source bible-ai-assistant, que combina un pipeline de RAG híbrido, alineación por preferencias con ORPO y opcionalmente interacción por voz. El objetivo es ofrecer un asistente bíblico local, reproducible y sin dependencia de servicios en la nube.

La versión GGUF permite ejecutar el modelo con llama.cpp en hardware modesto, con cuantizaciones desde Q4_K_M (2,6 GB) hasta F16 (7,9 GB). El modelo base tiene 4.205.751.296 parámetros (~4,2B) y una arquitectura híbrida Gated-DeltaNet + atención, lo que requiere una versión reciente de llama.cpp (build b1+ o commit 3173a56). Está pensado exclusivamente para uso con RAG: espera un bloque `Context:` con versículos recuperados antes de la pregunta, y no está diseñado para uso sin contexto ni para tareas generales.

La relevancia actual radica en que demuestra un caso práctico de ajuste fino de un modelo pequeño (4B) para un dominio específico con RAG, con cuantizaciones que caben en GPUs de consumo, y con una evaluación honesta que reconoce sus limitaciones (fuerte en recitado literal de versículos, más débil en respuestas temáticas abiertas). El proyecto planea una v3 con destilación de respuestas y GRPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet + atención (arquitectura `qwen35`) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación; Qwen3.5-4B típicamente soporta 32k, pero no confirmado) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (pesos); código del proyecto MIT; traducciones bíblicas en dominio público |
| Formato de pesos | GGUF (convertido desde bf16 con `convert_hf_to_gguf.py` y cuantizado con `llama-quantize`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, que emplea una arquitectura híbrida que combina Gated-DeltaNet (una capa recurrente lineal con compuertas) con atención tradicional. Esta mezcla busca reducir el coste computacional del contexto largo manteniendo la capacidad de atención selectiva. El ajuste fino se realizó mediante SFT (supervised fine-tuning) sobre un dataset curado de preguntas y respuestas bíblicas, seguido de alineación por preferencias con ORPO (odds-ratio preference optimization), según se indica en el repositorio del proyecto. El modelo fue entrenado específicamente para trabajar con un bloque de contexto recuperado (`Context:`) antes de la pregunta, lo que lo hace dependiente del pipeline RAG.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de RLHF/DPO. La model card del autor indica que es un checkpoint intermedio: fuerte en recitado literal de versículos, más débil en respuestas temáticas abiertas. Se planea una v3 con destilación de respuestas de un profesor y entrenamiento con GRPO.

## Capacidades

- Generación de texto en inglés para preguntas y respuestas sobre la Biblia, con recuperación de versículos.
- Recitado literal de versículos: el modelo es especialmente competente en devolver citas exactas cuando el contexto recuperado las contiene.
- Integración con RAG híbrido: espera un bloque `Context:` con versículos relevantes y responde basándose en ellos.
- Redirección a recursos humanos para temas sensibles: el modelo está entrenado para derivar consultas médicas, legales, financieras o de consejería a un pastor o línea de crisis, en lugar de dar respuestas directas.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible (el modelo está diseñado para Q&A con RAG, no para razonamiento multi-paso).
- Capacidades multilingües: no, solo inglés.
- Modo thinking: el modelo fue SFT sin trazas de `thinking`, por lo que se recomienda desactivar el modo thinking del template de chat de Qwen3.5 (pasando `"chat_template_kwargs": {"enable_thinking": false}` en llama.cpp, o usando un template que emita un bloque vacío de thinking).

## Casos de uso

- Asistente bíblico local para estudio personal: el usuario formula preguntas sobre pasajes concretos y el modelo, con RAG, devuelve versículos exactos y explicaciones basadas en el contexto recuperado. Adecuado porque el modelo está especializado en recitado literal y funciona con hardware modesto.
- Aplicación de consulta bíblica en entornos sin conexión: al ser GGUF y ejecutable con llama.cpp, puede desplegarse en un portátil o mini-PC sin conexión a internet, ideal para comunidades o entornos con baja conectividad.
- Herramienta de apoyo para líderes religiosos: pastores o estudiosos pueden usarlo para localizar rápidamente versículos relacionados con un tema, siempre que el pipeline RAG recupere los pasajes correctos. El modelo redirige a un pastor para cuestiones de consejería, lo que lo hace seguro en ese contexto.
- Integración en chatbots de iglesias o grupos de estudio: mediante llama-server o LM Studio, se puede exponer como API compatible con OpenAI y conectarlo a un frontend de chat. El modelo responde con versículos y referencias, y deriva temas sensibles a recursos humanos.
- Demostración de RAG con modelos pequeños: sirve como caso de estudio para desarrolladores que quieran implementar un sistema de Q&A con recuperación sobre un corpus específico (en este caso, la Biblia) usando un modelo de 4B cuantizado.
- Evaluación de cuantizaciones GGUF en arquitecturas híbridas: el repositorio incluye varios quants (Q4_K_M a F16) que permiten comparar el impacto de la cuantización en la calidad de las respuestas para una tarea de dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "evaluación honesta" que indica que el modelo es fuerte en recitado literal de versículos y más débil en respuestas temáticas abiertas, pero no proporciona métricas numéricas (MMLU, HumanEval, GSM8K, etc.). No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: según el quant, entre 2,6 GB (Q4_K_M) y 7,9 GB (F16) para los pesos. Con `-ngl 99` (offload completo) se necesita VRAM adicional para las capas de atención y el contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, GTX 1660 Super, RTX 3050, RTX 4060). Para F16 se recomienda una GPU con 8-10 GB (RTX 3080, RTX 4070, etc.). También puede ejecutarse solo en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, el quant Q4_K_M cabe en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio (versiones recientes). No compatible con Ollama 0.33.x debido a que su llama.cpp incluido es demasiado antiguo para la arquitectura `qwen35`; se debe esperar a que Ollama actualice su runtime o usar llama.cpp directamente.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 4060 o superior) con Q4_K_M, se espera una generación de varios tokens por segundo, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos bíblicos o de propósito general de tamaño similar. El modelo base Qwen3.5-4B es el punto de referencia natural, pero no se han publicado benchmarks comparativos. Alternativas cualitativas:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Bible-Assistant-Qwen3.5-4B-v2 (este) | 4,2B | no disponible | Apache-2.0 | Q&A bíblica con RAG |
| Qwen3.5-4B (base) | 4,2B | no disponible | Apache-2.0 | Propósito general, multimodal |
| Llama-3.2-3B | 3,2B | 128k | Llama 3.2 | Propósito general, sin ajuste bíblico |

No se han encontrado otros modelos específicamente entrenados para Q&A bíblica con RAG en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio: fuerte en recitado literal de versículos, pero más débil en respuestas temáticas abiertas. No debe usarse para interpretación teológica autoritativa.
- Depende completamente del pipeline RAG: sin un bloque `Context:` con versículos recuperados, el modelo no está diseñado para responder y puede producir respuestas pobres o alucinadas.
- Solo soporta inglés; no hay capacidades multilingües.
- No está diseñado para dar consejo médico, legal, financiero ni de consejería; el modelo redirige estas consultas a un pastor o línea de crisis, pero no debe confiarse en él para estos fines.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar referencias o versículos si el contexto no es suficiente. Se recomienda verificar siempre las citas.
- Compatibilidad de software: requiere una versión reciente de llama.cpp (build b1+ / commit 3173a56). Ollama 0.33.x no es compatible con la arquitectura `qwen35`.
- El modo thinking del template de chat de Qwen3.5 está activado por defecto, pero el modelo fue SFT sin trazas de thinking; hay que desactivarlo explícitamente para un comportamiento correcto.
- Licencia Apache-2.0 permite uso comercial, pero las traducciones bíblicas usadas son de dominio público; se debe verificar la atribución en el repositorio base.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2-GGUF
- Modelo base (bf16) en HuggingFace: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2
- Repositorio GitHub del proyecto: https://github.com/t-timms/bible-ai-assistant
- Adapter LoRA en HuggingFace: https://huggingface.co/Ttimms/bible-ai-qwen3.5-4b-lora
- Página del modelo en FriendliAI (inferencia): https://friendli.ai/models/Ttimms/bible-ai-qwen3.5-4b-lora
- Modelo Qwen3.5:4b en Ollama (referencia del base): https://ollama.com/library/qwen3.5:4b
