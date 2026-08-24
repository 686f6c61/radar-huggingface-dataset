# Warlord-K/kanha-kanha.ai-0.6b-grounded-qlora-3ep-v1

## Resumen

El modelo `Warlord-K/kanha-kanha.ai-0.6b-grounded-qlora-3ep-v1` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen3-0.6B` mediante la técnica QLoRA, desarrollado por Warlord-K en el contexto del proyecto Kanha AI. El objetivo es crear un asistente conversacional especializado en responder preguntas sobre el contenido del sitio web kanha.ai, utilizando un contrato de inferencia "grounded" que exige la presencia de contexto recuperado externamente. Con 596 millones de parámetros y una secuencia máxima de entrenamiento de 4096 tokens, el modelo está diseñado para ser ligero y desplegable en entornos con recursos limitados, incluyendo navegadores mediante WebGPU a través de artefactos MLC.

La relevancia de este modelo radica en su enfoque de fine-tuning eficiente sobre un dataset muy reducido (147 registros de entrenamiento) y su arquitectura de respuesta restringida al contexto, lo que lo convierte en un caso de estudio interesante para técnicas de grounding y para la evaluación de modelos compactos en tareas de pregunta-respuesta sobre dominios específicos. Aunque su uso previsto es principalmente investigador, demuestra un flujo completo de crawl, entrenamiento y despliegue on-device que puede replicarse en otros sitios web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 (máxima de entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos fusionados), q4f16_1 (artefactos MLC) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, MLC (q4f16_1) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-0.6B, un transformer decoder-only con atención estándar. El entrenamiento se realizó con QLoRA (Low-Rank Adaptation cuantizada) sobre todas las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), con rango 16, alpha 16 y dropout 0.05. Se empleó una pérdida solo sobre las respuestas del asistente (assistant-only loss) y una secuencia máxima de 4096 tokens. El dataset consta de 147 registros de entrenamiento y 21 de validación, generados a partir del contenido del sitio kanha.ai, con 3 épocas, learning rate 0.0001, batch size por dispositivo 8 y acumulación de gradientes 2. No se aplicaron técnicas de RLHF ni DPO; es un ajuste fino supervisado estándar.

El contrato de inferencia exige que el modelo reciba un contexto recuperado junto con la pregunta, y que responda únicamente con información presente en ese contexto. Si la respuesta no está en el contexto, debe devolver exactamente la cadena `I can't answer that from the provided context.` El prompt del sistema y la plantilla de usuario están fijados, y el modo de pensamiento (thinking) está desactivado.

## Capacidades

- Generación de texto restringida al contexto: responde preguntas basándose exclusivamente en el fragmento de contexto proporcionado.
- Rechazo explícito: si la información no está en el contexto, devuelve la frase de rechazo definida.
- Manejo de datos estructurados: según las métricas de evaluación, recupera correctamente fechas, números y URLs con alta precisión (recall de 1.0, 0.96 y 1.0 respectivamente).
- Conversación multi-turno: al estar basado en Qwen3, hereda la capacidad de mantener diálogos, aunque el uso previsto se centra en preguntas individuales con contexto.
- Despliegue en navegador: los artefactos MLC permiten ejecución on-device vía WebGPU, lo que facilita su integración en aplicaciones web sin servidor.
- No se especifican capacidades de tool calling, agentes ni razonamiento multi-paso más allá del modelo base.

## Casos de uso

- Asistente de preguntas frecuentes para el sitio kanha.ai: el modelo puede responder consultas sobre los servicios, características o documentación del sitio, siempre que se le proporcione el contexto recuperado de las páginas relevantes.
- Demostración de fine-tuning eficiente con QLoRA: sirve como ejemplo práctico de cómo adaptar un modelo pequeño a un dominio específico con pocos datos y recursos computacionales mínimos.
- Evaluación de técnicas de grounding: permite comparar métricas de recuperación y generación en un entorno controlado, como se refleja en los artefactos de investigación incluidos.
- Prototipo de chatbot para documentación técnica: el flujo de Kanha (crawl, train, deploy) puede replicarse para otros sitios, y este modelo actúa como referencia de un caso real.
- Investigación académica sobre modelos compactos: su tamaño reducido y su contrato de inferencia lo hacen adecuado para estudiar el equilibrio entre precisión, rechazo y alucinación en sistemas de QA.
- Despliegue en entornos con restricciones de hardware: al poder ejecutarse en navegador con WebGPU, es útil para aplicaciones que requieren privacidad o baja latencia sin infraestructura de servidor.

## Benchmarks y rendimiento

La model card incluye métricas de evaluación con contexto oracle (fuente de contexto perfecta). No se proporcionan benchmarks estándar como MMLU o HumanEval. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| dates_recall | 1.0 |
| deterministic_pass_rate | 0.3846 |
| list_recall | 0.6083 |
| numbers_recall | 0.9641 |
| refusal_rate | 0.0385 |
| requires_review_rate | 0.0 |
| unsupported_value_rate | 0.0 |
| urls_recall | 1.0 |
| total (evaluación) | 26 |

Estos datos indican una alta fidelidad en la recuperación de fechas, números y URLs, pero una tasa de éxito determinista moderada (38,5%), lo que sugiere que el modelo puede fallar en la generación exacta de respuestas en algunos casos. La tasa de rechazo es baja (3,8%), lo que implica que rara vez admite no saber la respuesta.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en bfloat16 (596M parámetros × 2 bytes) y alrededor de 0,6 GB con cuantización q4f16_1.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs integradas modernas con soporte WebGPU.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales e incluso en CPUs con suficiente RAM.
- Opciones de despliegue: transformers (Python), text-generation-inference (TGI), vLLM, y artefactos MLC para ejecución en navegador vía WebGPU. No se mencionan archivos GGUF para llama.cpp.
- Latencia y throughput: no se proporcionan datos específicos; al ser un modelo pequeño, se espera una latencia baja en hardware moderno, pero no se puede cuantificar sin pruebas.

## Comparativa con modelos similares

Existe una variante de mayor tamaño, `Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-3ep-v1`, con 1.7 mil millones de parámetros, también basada en Qwen3 y entrenada con el mismo enfoque. No se dispone de sus especificaciones detalladas ni de benchmarks comparativos. Frente al modelo base Qwen3-0.6B, este checkpoint está especializado en el dominio de kanha.ai y restringido al contrato de contexto, por lo que su rendimiento en tareas generales probablemente sea inferior, pero su precisión en el dominio específico puede ser mayor. No se dispone de datos cuantitativos para una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Warlord-K/kanha-kanha.ai-0.6b-grounded-qlora-3ep-v1 | 596M | 4096 | no disponible | QA con contexto sobre kanha.ai |
| Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-3ep-v1 | 1.7B | no disponible | no disponible | QA con contexto sobre kanha.ai |
| Qwen/Qwen3-0.6B | 596M | no disponible | Apache 2.0 (según Qwen) | Modelo base general |

## Limitaciones y advertencias

- El modelo puede producir respuestas incorrectas, incompletas o desactualizadas, como se indica en la model card.
- Puede memorizar contenido del entrenamiento, lo que podría generar respuestas que no se basan en el contexto proporcionado.
- El dataset de entrenamiento es muy pequeño (147 registros), lo que aumenta el riesgo de sobreajuste y limita la generalización.
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere verificación legal.
- El contrato de inferencia exige contexto recuperado; usarlo sin contexto está fuera del alcance entrenado y puede producir resultados no fiables.
- Solo está entrenado en inglés; no soporta otros idiomas.
- La tasa de éxito determinista es baja (38,5%), por lo que no es adecuado para aplicaciones que requieran respuestas exactas sin revisión humana.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.), lo que dificulta comparar su rendimiento general con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Warlord-K/kanha-kanha.ai-0.6b-grounded-qlora-3ep-v1
- Repositorio de Kanha AI en GitHub: https://github.com/Kanha-AI/Kanha-AI
- Sitio web de Kanha: https://kanha.ai
- Variante de 1.7B en Hugging Face: https://huggingface.co/Kanha-AI/kanha-kanha.ai-1.7b-grounded-qlora-v1
