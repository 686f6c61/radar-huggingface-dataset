# Vinayak37/redpanda-classifier-v1

## Resumen

RedPanda Classifier v1 es un modelo de clasificación de secuencias fine-tuneado a partir de `sentence-transformers/all-MiniLM-L6-v2`, una arquitectura BERT de aproximadamente 22,7 millones de parámetros. Lo desarrolla Vinayak37 como componente del sistema RedPanda Security, una herramienta de red-teaming orientada a evaluar si un chatbot ha respetado sus límites de seguridad frente a ataques de prompt injection, jailbreak, exfiltración de datos o inyecciones indirectas. Ocupa el rol de "Tier 2" dentro del motor de evaluación por capas de RedPanda.

El modelo resuelve un problema concreto: automatizar el juicio sobre si una respuesta de un bot supone una brecha de seguridad, sin depender de APIs externas ni de claves de servicio. Recibe una terna compuesta por la regla de seguridad, la respuesta del bot objetivo y el prompt adversarial, y devuelve una de tres etiquetas: `held` (el bot mantuvo la frontera), `broken` (cedió) o `unclear` (ambiguo). Su tamaño reducido y su latencia de inferencia (~25 ms en CPU, ~2 ms en GPU) lo hacen apto para evaluación masiva dentro de pipelines de seguridad.

Es relevante ahora porque el ecosistema de evaluación de seguridad de LLM carece de clasificadores ligeros, offline y multilingües que permitan juzgar automáticamente grandes volúmenes de interacciones adversariales. RedPanda Classifier v1 cubre inglés, hindi y maratí, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su integración en pipelines de CI/CD de seguridad sin coste de API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base: `sentence-transformers/all-MiniLM-L6-v2`), clasificación de secuencias |
| Parametros totales | 22.714.371 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length usado en el ejemplo de inferencia con truncation) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, mr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT derivado de `all-MiniLM-L6-v2`, con una cabeza de clasificación de secuencias de 3 etiquetas (`0: held`, `1: broken`, `2: unclear`). La entrada se formatea como una concatenación de tres segmentos separados por el token `[SEP]`: la regla de seguridad, la respuesta del bot objetivo y el prompt adversarial. El modelo procesa esta terna como una única secuencia y emite logits sobre las tres clases.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de que es `custom`) ni si se aplicaron técnicas de RLHF o DPO. Los benchmarks reportados por el autor incluyen conjuntos de validación cruzada entre dominios y un holdout zero-shot de fintech, lo que sugiere un entrenamiento con datos anotados por humanos y separación por dominio para evaluar generalización. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de seguridad en tres clases: `held`, `broken`, `unclear`.
- Detección de prompt injection directa e indirecta.
- Detección de jailbreaks y bypass de restricciones.
- Detección de exfiltración de datos y canary leaks (fuga de tokens canario).
- Evaluación de respuestas de chatbot contra reglas de seguridad explícitas.
- Multilingüe: inglés, hindi y maratí.
- Inferencia 100% offline, sin claves de API.
- Integración con el motor de evaluación por capas de RedPanda como Tier 2.
- No soporta tool calling ni function calling (es un clasificador, no un generador).
- No soporta agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Auditoría automatizada de chatbots en producción: el modelo permite clasificar en lote miles de interacciones sospechosas comparando la regla de seguridad, la respuesta del bot y el prompt adversarial, con una latencia de ~25 ms por muestra en CPU que hace viable el procesamiento masivo sin GPU.
- Integración en pipelines de CI/CD de seguridad: al ser un clasificador ligero y offline, puede ejecutarse como paso de validación en cada despliegue de un chatbot para detectar regresiones en la robustez frente a jailbreaks antes de publicar.
- Red-teaming continuo con `redpanda-security`: el comando `redpanda scan --url ...` descarga y usa este modelo automáticamente como Tier 2 del motor de juicio, permitiendo escanear endpoints de chat sin configuración adicional de API keys.
- Evaluación de canary leaks: dada una regla que prohíbe revelar un token canario (por ejemplo `SEC-DEMO-9921`), el modelo detecta si la respuesta del bot filtró dicho token, como muestra el ejemplo de la model card con confianza del 99,8 %.
- Validación de guardrails en asistentes multilingües: para productos desplegados en inglés, hindi y maratí, el clasificador permite auditar respuestas en los tres idiomas sin depender de un LLM juez externo.
- Investigación en seguridad de LLM: sirve como componente de anotación automática en estudios sobre tasas de éxito de ataques adversariales, con métricas de calibración reportadas (ECE entre 0,012 y 0,024) que permiten umbralizar las decisiones con garantías.
- Filtrado previo en sistemas de moderación: puede usarse como clasificador rápido de primera línea para marcar conversaciones que requieran revisión humana, reduciendo el coste de un LLM juez más grande.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Benchmark | Muestras | Accuracy | Broken Recall | Broken F1 | ECE |
|---|---|---|---|---|---|
| Quarantined Gold Benchmark | 200 | 95,0 % | 97,0 % | 95,6 % | 0,024 |
| Fintech Zero-Shot Holdout | 928 | 98,17 % | 100,0 % | 98,87 % | 0,018 |
| Full Cross-Domain Validation | 1.222 | 99,67 % | 100,0 % | 99,71 % | 0,012 |

No se han publicado comparaciones con modelos similares en la información disponible. Los resultados corresponden exclusivamente a las evaluaciones internas del autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (~87 MB de pesos); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU con ~25 ms por inferencia. En GPU la latencia baja a ~2 ms.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (referencia en la model card), `text-embeddings-inference` (tag del repo), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito para vLLM, llama.cpp u Ollama.
- Throughput estimado: no disponible de forma explícita; a partir de la latencia reportada (~25 ms CPU, ~2 ms GPU) se puede inferir un orden de decenas de inferencias por segundo en CPU y cientos en GPU, aunque el autor no publica cifras de throughput por lote.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no incluye comparaciones con otros clasificadores de seguridad de LLM (por ejemplo, jueces basados en LLM o clasificadores de prompt injection de terceros), por lo que la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RedPanda Classifier v1 | 22,7 M | 512 tokens | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de clasificación, no generativo: no puede producir texto, razonar ni ejecutar herramientas; solo emite una etiqueta entre tres clases.
- Sesgos conocidos: no documentados por el autor; al estar entrenado sobre un dataset `custom` no descrito, el comportamiento fuera de la distribución de entrenamiento es incierto.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios no cubiertos por el entrenamiento.
- Limitaciones de idioma: solo se declaran en, hi y mr; el rendimiento en otros idiomas no está evaluado.
- Limitación de contexto: la entrada se trunca a 512 tokens, por lo que reglas, respuestas o prompts largos pueden perder información relevante para el juicio.
- Los benchmarks reportados son internos del autor y no han sido verificados de forma independiente; deben interpretarse con cautela.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados.
- El modelo está diseñado específicamente para el ecosistema RedPanda Security; su uso fuera de ese contexto requiere adaptar el formato de entrada (`{rule} [SEP] {reply} [SEP] {prompt}`).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Vinayak37/redpanda-classifier-v1
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paquete RedPanda Security: `pip install redpanda-security` (no se proporciona URL de repositorio en la información disponible)
- Paper, blog o demo: no disponible en la información proporcionada.
