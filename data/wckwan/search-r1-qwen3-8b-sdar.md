# wckwan/Search-R1-Qwen3-8B-SDAR

## Resumen

Search-R1-Qwen3-8B-SDAR es un modelo de lenguaje entrenado por wckwan a partir de Qwen/Qwen3-8B mediante aprendizaje por refuerzo (GRPO) sobre el framework Search-R1, que combina razonamiento intercalado con búsqueda web multi-turno. El modelo está diseñado para tareas de retrieval QA donde el agente debe decidir cuándo consultar un buscador, procesar los resultados y continuar el razonamiento hasta emitir una respuesta final. Incorpora además una técnica de auto-destilación (SDAR) para mejorar la eficiencia del entrenamiento.

Con aproximadamente 8,19 mil millones de parámetros (arquitectura densa), este modelo hereda las capacidades de Qwen3-8B, incluyendo modos de pensamiento explícito e implícito, y las extiende con un protocolo de llamada a herramientas específico para búsqueda. Su relevancia radica en ofrecer una alternativa totalmente open source (licencia Apache 2.0) a sistemas propietarios como OpenAI DeepResearch, permitiendo a desarrolladores implementar agentes de investigación con acceso a información en tiempo real.

El repositorio incluye el checkpoint final (paso 400) así como checkpoints intermedios (paso 20 a 380) y checkpoints FSDP sin fusionar para reanudar el entrenamiento, lo que facilita tanto la evaluación como la investigación en metodologías de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (dense), basado en Qwen/Qwen3-8B |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B soporta 32k tokens nativos y 131k con YaRN) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se pueden cuantizar con GPTQ, AWQ, etc.) |
| Idiomas soportados | No disponible (hereda los del modelo base, principalmente inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), además de checkpoints FSDP sharded fp32 en `fsdp/` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 8B parámetros, exactamente la arquitectura de Qwen3-8B. Sobre esta base, se ha aplicado un entrenamiento con GRPO (Group Relative Policy Optimization) siguiendo el marco Search-R1, que intercala llamadas a un buscador web dentro de la cadena de razonamiento. Cada turno del agente puede emitir una consulta de búsqueda, recibir resultados y continuar razonando, hasta producir una respuesta final. La técnica SDAR (self-distillation) se utiliza para regularizar el entrenamiento, aunque no se especifican los detalles concretos del dataset ni el número de tokens utilizado.

El entrenamiento se realizó durante 400 pasos, y el repositorio incluye checkpoints intermedios que permiten estudiar la evolución del aprendizaje. No se proporciona información sobre la composición del corpus de entrenamiento ni sobre fases adicionales como RLHF o DPO.

## Capacidades

- Generación de texto con razonamiento multi-paso, especialmente orientado a tareas que requieren información externa actualizada.
- Llamada a herramientas (tool calling) para búsqueda web, siguiendo el formato de interacción de Search-R1.
- Razonamiento intercalado: el modelo decide cuándo buscar, qué consulta realizar y cómo integrar los resultados en su respuesta.
- Herencia de las capacidades de Qwen3-8B: modo thinking / no-thinking, mejora en matemáticas, código y comprensión lectora.
- Capacidad de uso como agente conversacional multi-turno con acceso a búsqueda en vivo.
- Soporte para carga mediante transformers estándar y para inferencia con text-generation-inference (según tags).

## Casos de uso

- Investigación de mercado automatizada: el modelo puede realizar búsquedas web en tiempo real para recopilar datos de competidores, precios o tendencias, razonando sobre los resultados para generar informes sintetizados.
- Atención al cliente con información actualizada: integrado en un chatbot, puede consultar bases de conocimiento o sitios web oficiales para responder preguntas sobre productos o políticas cambiantes, reduciendo la dependencia de respuestas pre-entrenadas.
- Asistente de análisis de documentos: combinado con recuperación de documentos, puede buscar fragmentos relevantes en una colección y responder preguntas complejas que requieren cruzar múltiples fuentes.
- Generación de código con documentación reciente: al poder buscar en la web, puede consultar APIs o librerías actualizadas y generar ejemplos de código correctos según la versión vigente.
- Sistemas de recomendación contextual: el modelo puede buscar información sobre eventos actuales o preferencias del usuario para ofrecer recomendaciones personalizadas con justificación razonada.
- Evaluación de noticias y verificación de hechos: dado un titular o afirmación, el modelo puede buscar fuentes contrastadas y elaborar un análisis de veracidad con citas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 16 GB de VRAM (para los 8B parámetros), por lo que cabe en GPUs como RTX 4090 (24 GB) o A100 40 GB.
- Con cuantización 8-bit: ~8-10 GB de VRAM, apto para RTX 3080/4080 o similares.
- Con cuantización 4-bit: ~5-6 GB de VRAM, posible en GPUs consumer como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Para ejecución con carga completa en CPU: se requiere al menos 32 GB de RAM (fp32) o 16 GB (fp16).
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp, Ollama (si se exporta a GGUF).
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la longitud de las cadenas de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| Search-R1-Qwen3-8B-SDAR (este) | 8,19 B | GRPO + SDAR sobre Search-R1 | Apache 2.0 | Hugging Face |
| wckwan/Search-R1-Qwen3-8B-Outcome-GRPO | 8,19 B | GRPO con reward basado en resultado final | Apache 2.0 | Hugging Face |
| wckwan/Search-R1-Qwen3-8B-Process-GRPO-PerTurnNorm | 8,19 B | GRPO con reward por turno y normalización | Apache 2.0 | Hugging Face |
| Qwen3-8B (base) | 8,19 B | Pre-entrenamiento + SFT | Apache 2.0 | Hugging Face |

Los tres modelos del autor comparten la misma arquitectura base y tamaño, diferenciándose en la estrategia de RL. El modelo SDAR incorpora auto-destilación, mientras que Outcome-GRPO usa recompensa al final y Process-GRPO usa recompensa por turno. No hay datos comparativos de rendimiento publicados.

## Limitaciones y advertencias

- Al ser un modelo entrenado específicamente para búsqueda, su rendimiento en tareas que no requieren información externa puede verse afectado por el sesgo hacia la llamada a herramientas.
- Dependencia de la disponibilidad y calidad del buscador web: si el servicio de búsqueda falla o devuelve resultados irrelevantes, la respuesta final puede ser incorrecta.
- Riesgo de alucinación en los pasos de razonamiento intermedio, especialmente si los resultados de búsqueda no se integran correctamente.
- No se especifican los idiomas soportados; se heredan los del modelo base Qwen3-8B, que está optimizado principalmente para inglés y chino, con menor cobertura en otros idiomas.
- El tamaño del repositorio (425,9 GB) incluye múltiples checkpoints y estados FSDP, lo que puede dificultar la descarga si solo se necesita el checkpoint final.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-8B, que también es Apache 2.0.
- No hay información sobre sesgos específicos del entrenamiento con búsqueda; se deben realizar evaluaciones adicionales antes de usar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/wckwan/Search-R1-Qwen3-8B-SDAR
- Repositorio GitHub de Search-R1-Qwen3: https://github.com/Xinyi-0724/Search-R1-Qwen3
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Otros modelos del autor: https://huggingface.co/wckwan/Search-R1-Qwen3-8B-Outcome-GRPO y https://huggingface.co/wckwan/Search-R1-Qwen3-8B-Process-GRPO-PerTurnNorm
