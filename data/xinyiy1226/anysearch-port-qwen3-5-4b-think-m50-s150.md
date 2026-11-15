# XinyiY1226/anysearch-port-qwen3.5-4b-think-m50-s150

## Resumen

Anysearch-port-qwen3.5-4b-think-m50-s150 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario XinyiY1226 en Hugging Face. El modelo está especializado en tareas de agente de búsqueda (search-agent) y respuesta a preguntas multi-salto (multi-hop QA), y ha sido entrenado mediante aprendizaje por refuerzo (reinforcement learning) con el framework verl. El sufijo del nombre (`think-m50-s150`) sugiere una configuración de "thinking mode" con parámetros de presupuesto de búsqueda (m50) y pasos de entrenamiento (s150), aunque los detalles exactos de esta nomenclatura no están documentados en la información disponible.

El modelo parte de la arquitectura Qwen3.5, un transformer de 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), lo que lo sitúa en la categoría de modelos pequeños-medianos aptos para despliegue en hardware de consumo. Su enfoque en "budget-aware" (consciente del presupuesto) indica que está diseñado para gestionar de forma eficiente el número de llamadas a herramientas de búsqueda durante el razonamiento multi-paso, un problema relevante en sistemas de agentes donde cada consulta externa tiene un coste computacional y de latencia.

La relevancia de este modelo radica en su especialización: en lugar de ser un modelo generalista, está optimizado para el ciclo de razonar-buscar-responder sobre datasets como HotpotQA y MuSiQue, dos benchmarks estándar de QA multi-salto. Sin embargo, es importante señalar que el modelo tiene acceso restringido (gated) en Hugging Face, requiere aceptar condiciones de uso, y no cuenta con descargas ni valoraciones públicas en el momento de la consulta, lo que limita la validación independiente de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), fine-tune con RL |
| Parametros totales | 4.539.265.536 (aprox. 4,5 B) |
| Parametros activos | no disponible (no es MoE según los tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se desconoce si existen GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros. Sobre esta base, el autor ha aplicado un proceso de ajuste fino mediante aprendizaje por refuerzo utilizando el framework verl, según los tags del repositorio. El entrenamiento está orientado a tareas de agente de búsqueda: el modelo aprende a decidir cuándo y cómo invocar herramientas de búsqueda externas, así como a integrar la información recuperada en un razonamiento multi-paso para responder preguntas complejas.

Los datasets de entrenamiento declarados son HotpotQA (hotpotqa/hotpot_qa) y MuSiQue (dgslibisey/MuSiQue), ambos benchmarks de QA multi-salto en inglés que requieren combinar información de múltiples documentos. El tag "budget-aware" sugiere que el entrenamiento incorpora un mecanismo de control del presupuesto de búsquedas, penalizando o limitando el número de consultas externas. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO más allá del RL con verl. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso con invocación de herramientas de búsqueda (search-agent).
- Respuesta a preguntas multi-salto (multi-hop QA) combinando información de varias fuentes.
- Gestión consciente del presupuesto de búsquedas (budget-aware), orientada a limitar el número de llamadas a herramientas.
- Modo "thinking" (según el sufijo `think` del nombre), presumiblemente con razonamiento explícito antes de responder.
- Soporte de tool calling / function calling orientado a búsqueda web o recuperación de documentos.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Respuesta a preguntas complejas sobre documentación técnica: el modelo puede descomponer una pregunta en subconsultas, buscar en un índice interno o web y sintetizar una respuesta citando varias fuentes, gracias a su entrenamiento en HotpotQA y MuSiQue.
- Asistentes de investigación con presupuesto limitado: en entornos donde cada llamada a una API de búsqueda tiene coste, el enfoque budget-aware permite configurar un número máximo de consultas por pregunta sin degradar excesivamente la calidad.
- Sistemas RAG multi-salto: integrado en un pipeline de recuperación aumentada, el modelo puede decidir cuándo la información recuperada es insuficiente y lanzar una segunda búsqueda con términos reformulados.
- Automatización de atención al cliente sobre bases de conocimiento: el modelo puede navegar por múltiples artículos para resolver consultas que requieren combinar información de varias secciones.
- Verificación de hechos (fact-checking): dado un enunciado, el agente puede buscar evidencia en varias fuentes y contrastarla antes de emitir un veredicto.
- Agentes de navegación web para extracción de datos: con tool calling, puede orquestar consultas a motores de búsqueda y sintetizar los resultados en informes breves.
- Evaluación comparativa de pipelines de agentes: al ser un fine-tune especializado y de tamaño reducido, sirve como baseline para medir el impacto del RL en tareas de búsqueda multi-salto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para los pesos (4,54 B de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12-16 GB.
- Cuantización a 8 bits: aproximadamente 4,5-5 GB de pesos; a 4 bits: aproximadamente 2,3-2,8 GB, aunque no se confirma la disponibilidad de pesos cuantizados en el repositorio.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con FP16 y concurrencia; RTX 4090 (24 GB) para inferencia en FP16 sin problemas; RTX 3090/4080 (16-24 GB) también viables.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 y potencialmente en GPUs de 12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI y transformers para FP16; llama.cpp u Ollama si se generan pesos GGUF (no confirmado en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Acceso |
|---|---|---|---|---|---|
| anysearch-port-qwen3.5-4b-think-m50-s150 | 4,54 B | no disponible | Search-agent / multi-hop QA (RL) | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Generalista | Apache 2.0 (según base) | Público |
| Modelos de QA multi-salto de tamaño similar | no disponible | no disponible | QA multi-salto | no disponible | no disponible |

La comparación con alternativas directas es limitada porque no se dispone de datos de rendimiento publicados para este fine-tune ni de modelos comparables identificados en la información proporcionada. El principal punto de referencia es el modelo base Qwen3.5-4B, del que hereda arquitectura y licencia, pero no se documentan las diferencias cuantitativas de rendimiento.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Sin validación pública: cero descargas y cero likes en el momento de la consulta; no hay evidencia independiente de su calidad.
- Idiomas: entrenado y evaluado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: al entrenarse sobre HotpotQA y MuSiQue, puede heredar sesgos de esos datasets (dominio Wikipedia en inglés, temáticas sesgadas hacia entidades occidentales).
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, especialmente si las búsquedas no devuelven información relevante; el modo "thinking" no elimina este riesgo.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que dificulta planificar su uso en documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune de un modelo base, conviene verificar las condiciones del modelo Qwen3.5-4B original.
- Documentación escasa: no hay model card detallada, hiperparámetros de entrenamiento ni resultados de evaluación, lo que dificulta la reproducibilidad.
- Nomenclatura ambigua: los sufijos `m50` y `s150` no están explicados; no se puede confirmar su significado exacto (presupuesto de búsqueda, pasos, etc.).

## Enlaces

- Hugging Face: https://huggingface.co/XinyiY1226/anysearch-port-qwen3.5-4b-think-m50-s150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Framework verl: https://github.com/volcengine/verl
