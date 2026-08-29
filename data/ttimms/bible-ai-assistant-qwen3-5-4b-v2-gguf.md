# Ttimms/bible-ai-assistant-qwen3.5-4b-v2-GGUF

## Resumen

Bible AI Assistant v2-4b es un modelo de generacion de texto de 4.200 millones de parametros, desarrollado por Ttimms, que consiste en un fine-tuning de Qwen3.5-4B mediante SFT y ORPO para responder preguntas sobre la Biblia con respaldo en recuperacion aumentada (RAG). El modelo espera recibir versiculos recuperados en un bloque `Context:` seguido de la pregunta, y esta disenado para funcionar como asistente biblico local con verificacion de hechos mediante recuperacion hibrida (BM25 + busqueda densa + reranking con cross-encoder).

Este repositorio concreto contiene las cuantizaciones GGUF del modelo base `Ttimms/bible-ai-assistant-qwen3.5-4b-v2`, convertidas con `llama.cpp` y disponibles en cinco niveles de precision (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y F16). Es relevante ahora porque Qwen3.5 introduce una arquitectura hibrida (Gated-DeltaNet + atencion) que requiere versiones recientes de llama.cpp, y este proyecto demuestra un caso de uso completo de RAG con salvaguardas de seguridad constitucional. El autor advierte que es un checkpoint intermedio: fuerte en recuerdo verbatim de versiculos, mas debil en respuestas tematicas abiertas; una v3 con destilacion de respuestas y GRPO esta planificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hibrida (Gated-DeltaNet + atencion), arquitectura `qwen35` |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la documentacion del autor) |
| Tipos de cuantizacion | Q4_K_M (2,6 GB), Q5_K_M (2,9 GB), Q6_K (3,3 GB), Q8_0 (4,2 GB), F16 (7,9 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (pesos); codigo del proyecto MIT; traducciones biblicas de dominio publico |
| Formato de pesos | GGUF (convertido desde bf16 con `convert_hf_to_gguf.py --outtype f16 --no-mtp` y cuantizado con `llama-quantize`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura hibrida que combina Gated-DeltaNet con mecanismos de atencion tradicionales, registrada en llama.cpp como arquitectura `qwen35`. El modelo tiene 32 bloques (segun el tensor `blk.32.attn_norm.weight`). El fine-tuning se realizo mediante SFT sin trazas de pensamiento (`thinking`), seguido de alineacion de preferencias con ORPO, segun el repositorio GitHub del proyecto. El entrenamiento se oriento especificamente a preguntas biblicas con recuperacion aumentada: el modelo recibe un bloque `Context:` con versiculos recuperados y debe responder basandose en ellos. El proyecto integra ademas un pipeline RAG hibrido (BM25 + recuperacion densa + reranking con cross-encoder) y comprobaciones de seguridad constitucional para redirigir consultas sensibles. La conversion a GGUF se realizo con `--no-mtp`, desactivando la prediccion multi-token del modelo base.

## Capacidades

- Respuesta a preguntas biblicas con respaldo en RAG: el modelo espera versiculos recuperados en un bloque `Context:` y responde citando o parafraseando el contenido proporcionado.
- Recuerdo verbatim de versiculos: segun la evaluacion del autor, el modelo es fuerte en recuperacion textual exacta de pasajes biblicos.
- Redireccion de consultas sensibles: deriva peticiones de consejo medico, legal, financiero o de counselling hacia un pastor o linea de crisis, en lugar de responder directamente.
- Interaccion por voz: el proyecto GitHub incluye soporte de entrada y salida de voz para accesibilidad.
- Comprobaciones de seguridad constitucional: el pipeline integra verificaciones de seguridad para evitar respuestas perjudiciales.
- Modo de pensamiento desactivable: la plantilla de chat de Qwen3.5 activa el modo `thinking` por defecto, pero el modelo fue entrenado sin trazas de pensamiento, por lo que se recomienda desactivarlo para uso RAG.
- Uso exclusivo en ingles: el modelo solo soporta el idioma ingles.

## Casos de uso

- Estudio biblico personal asistido: un usuario formula preguntas sobre pasajes concretos y el modelo responde con versiculos recuperados por RAG, citando las referencias exactas. Es adecuado porque el modelo fue entrenado especificamente para este patron de entrada con contexto recuperado.
- Localizacion rapida de versiculos: predicadores y estudiantes pueden buscar pasajes por tema o referencia parcial; el modelo destaca en recuerdo verbatim, lo que facilita encontrar la cita exacta.
- Preparacion de sermones y materiales de ensenanza: el asistente puede proporcionar versiculos relevantes sobre un tema dado, ayudando a estructurar la base biblica de una predicacion. El RAG hibrido garantiza que las citas provengan de la traduccion configurada.
- Chatbot para sitios web de iglesias: desplegado con `llama-server` o LM Studio, puede integrarse en la web de una congregacion para responder dudas biblicas frecuentes de los visitantes, con redireccion a personal pastoral para temas sensibles.
- Aplicaciones de devocional diario: el modelo puede generar lecturas contextualizadas a partir de versiculos recuperados, ofreciendo una experiencia de devocional con base textual verificable.
- Herramienta de accesibilidad con voz: gracias al soporte de entrada y salida de voz del proyecto, personas con discapacidad visual pueden hacer preguntas biblicas oralmente y recibir respuestas habladas, con la garantia de que las citas provienen de recuperacion real.
- Educacion teologica basica: estudiantes de seminario pueden verificar referencias biblicas y explorar pasajes relacionados, siempre que las respuestas se limiten al contexto recuperado y no se busquen dictamenes teologicos autoritativos.

## Benchmarks y rendimiento

No se han publicado resultados cuantitativos de benchmarks en la informacion disponible. El autor menciona una "evaluacion honesta" en la model card del repositorio base, indicando cualitativamente que el modelo es fuerte en recuerdo verbatim de versiculos y mas debil en respuestas tematicas abiertas, pero no proporciona numeros concretos (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- Cuantizacion Q4_K_M (2,6 GB): recomendada por el autor como opcion por defecto; cabe en GPUs consumer con 4 GB de VRAM (GTX 1650, RTX 3050, etc.) y tambien es viable en CPU con llama.cpp.
- Cuantizacion Q5_K_M (2,9 GB): requiere al menos 4-6 GB de VRAM; adecuada para RTX 3060 o superiores.
- Cuantizacion Q6_K (3,3 GB): requiere 6 GB de VRAM o mas; buena relacion calidad/recursos.
- Cuantizacion Q8_0 (4,2 GB): casi sin perdida; requiere 8 GB de VRAM (RTX 3070, RTX 4060, etc.).
- Precision F16 (7,9 GB): precision completa; requiere 8-12 GB de VRAM segun el contexto utilizado.
- Despliegue: compatible con `llama.cpp` (build aproximado `b1+` o commit `3173a56` o superior) y LM Studio en versiones recientes. Ollama 0.33.x no es compatible por incluir una version de llama.cpp demasiado antigua para la arquitectura `qwen35`.
- Inferencia en CPU: posible con llama.cpp, con latencia variable segun el hardware; no se proporcionan datos de throughput especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ttimms/bible-ai-assistant-qwen3.5-4b-v2 (este) | 4,2B | Qwen3.5 hibrida (Gated-DeltaNet + atencion) | Preguntas biblicas con RAG | Apache-2.0 | GGUF en este repo; safetensors en el repo base |
| Qwen3.5-4B (base) | 4,2B | Qwen3.5 hibrida | Modelo general de proposito | Apache-2.0 | Disponible en HuggingFace y Ollama |
| Ttimms/bible-ai-qwen3.5-4b-lora | 4,2B (adaptador LoRA) | Qwen3.5 hibrida | Fine-tuning LoRA para Biblia | Apache-2.0 | Adapter LoRA en HuggingFace |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La diferencia principal entre este modelo y el base Qwen3.5-4B es el fine-tuning especifico para tareas biblicas con RAG, que sacrifica capacidades generales a cambio de precision en citas biblicas. El adaptador LoRA es el paso intermedio del entrenamiento, mientras que este repositorio contiene el modelo fusionado y cuantizado para inferencia.

## Limitaciones y advertencias

- Checkpoint intermedio: el autor lo califica explicitamente como version v2 provisional; las respuestas tematicas abiertas son significativamente mas debiles que el recuerdo verbatim de versiculos.
- Dependencia del contexto RAG: el modelo no esta disenado para uso sin contexto; si no se le proporcionan versiculos recuperados en el bloque `Context:`, las respuestas pueden ser imprecisas o inventadas.
- Riesgo de alucinacion: aunque el RAG mitiga este problema, el modelo puede generar citas incorrectas si el contexto recuperado es insuficiente o ambiguo.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en comunidades hispanohablantes sin traduccion previa.
- Restricciones de uso: no apto para consejo medico, legal, financiero ni de counselling; el modelo redirige estas consultas a profesionales o lineas de crisis, pero no debe usarse como sustituto de atencion especializada.
- Sin autoridad teologica: el autor advierte que no debe usarse para dictamenes teologicos autoritativos ni como sustituto de liderazgo pastoral.
- Compatibilidad limitada: requiere versiones recientes de llama.cpp (commit `3173a56` o superior); Ollama 0.33.x falla con el error `check_tensor_dims: tensor 'blk.32.attn_norm.weight' not found`.
- Modo thinking: la plantilla de chat activa el modo de pensamiento por defecto, pero el modelo fue entrenado sin el; hay que desactivarlo explicitamente para obtener respuestas correctas en uso RAG.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Ttimms/bible-ai-assistant-qwen3.5-4b-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/Ttimms/bible-ai-assistant-qwen3.5-4b-v2
- Adaptador LoRA: https://huggingface.co/Ttimms/bible-ai-qwen3.5-4b-lora
- Repositorio GitHub del proyecto: https://github.com/t-timms/bible-ai-assistant
- README del proyecto en GitHub: https://github.com/t-timms/bible-ai-assistant/blob/main/README.md
- Pagina del modelo en FriendliAI: https://friendli.ai/models/Ttimms/bible-ai-qwen3.5-4b-lora
- Modelo Qwen3.5:4b en Ollama: https://ollama.com/library/qwen3.5:4b
