# wingman-llc/WINGMAN-OPENS-0.2

## Resumen

WINGMAN-OPENS 0.2 es un modelo de lenguaje experimental desarrollado por WINGMAN LLC (Inglaterra), publicado el 24 de octubre de 2026 bajo licencia Apache-2.0. Se trata de un modelo pequeño, de aproximadamente 494 millones de parámetros (500 M según el autor), orientado a conversación básica en inglés y asistencia de programación, y distribuido principalmente en formato GGUF con cuantización Q4_K_M para su ejecución local mediante Ollama.

Su interés no reside en el rendimiento bruto, sino en su planteamiento: un ajuste fino con LoRA sobre 1.200 ejemplos de UltraChat durante una sola época, empaquetado para funcionar en hardware de consumo sin enviar prompts a un servicio de inferencia alojado. Es, por tanto, una pieza de experimentación y aprendizaje más que un modelo de producción.

No se han publicado datos sobre la arquitectura base, la longitud de contexto, el modelo preentrenado de partida ni benchmarks. La información disponible se limita a la model card del autor y a los metadatos del Hub, y el modelo no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el autor no especifica la familia; pipeline `text-generation`, modelo causal de generación de texto) |
| Parámetros totales | 494.032.768 (≈500 M, recuento del Hub a partir de safetensors) |
| Parámetros activos | No disponible / no aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (GGUF); no se publican otras variantes |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M); el recuento de parámetros del Hub procede de safetensors |
| Tamaño del repositorio | 0,4 GB |
| Tamaño del modelo (según autor) | ≈379 MB en Q4_K_M |
| Método de ajuste | LoRA (fine-tuning) |
| Etiquetas del Hub | `gguf`, `ollama`, `text-generation`, `code-generation`, `local-llm`, `conversational`, `endpoints_compatible` |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura interna (transformer, MoE, híbrida u otra) ni identifica el modelo base sobre el que se aplica el ajuste. Lo único confirmado es que se trata de un modelo causal de generación de texto, con aproximadamente 494 M de parámetros, afinado mediante LoRA. No se especifican la dimensión oculta, el número de capas, el tokenizador ni la ventana de contexto nativa.

El entrenamiento consistió en un único epoch sobre 1.200 ejemplos procedentes de UltraChat, con una pérdida de entrenamiento reportada de aproximadamente 2,0449. No se menciona ninguna fase de RLHF, DPO, verificación de seguridad o ajuste adicional. Con ese volumen de datos y esa configuración, el ajuste debe interpretarse como una adaptación superficial de estilo conversacional sobre un modelo base preexistente, no como un entrenamiento desde cero; no se documentan ni la composición exacta del subconjunto de UltraChat ni los hiperparámetros del LoRA (rango, alpha, módulos objetivo).

## Capacidades

- Generación de texto conversacional básico en inglés, con soporte de diálogo multiturno simple.
- Asistencia de programación: generación, explicación y corrección de fragmentos de código en el marco de las etiquetas `code-generation` del autor.
- Ejecución completamente local mediante Ollama, sin dependencia de un servicio de inferencia remoto.
- Formato GGUF compatible con el ecosistema llama.cpp, lo que permite su uso en herramientas derivadas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes, razonamiento multi-paso estructurado ni modo "thinking".
- No se documenta capacidad de visión, audio ni multimodalidad.
- Multilingüismo: limitado al inglés declarado; no hay evidencia de calidad en otros idiomas.
- No se documenta ventana de contexto, por lo que la gestión de conversaciones largas es incierta.

## Casos de uso

- Experimentación y aprendizaje sobre modelos locales: sirve para que un desarrollador novel practique el flujo completo de Ollama (descarga, ejecución, prompt) con un artefacto de menos de 400 MB, sin coste de GPU ni de API.
- Pruebas de concepto de asistentes conversacionales en inglés: útil para validar una interfaz de chat o un pipeline de prompts antes de invertir en un modelo mayor, dado el bajo coste de inferencia y despliegue.
- Sustitución de marcador de posición en tests de integración: al ser un GGUF pequeño compatible con endpoints, permite levantar un servidor de inferencia falso o real en CI sin depender de servicios externos.
- Escenarios con requisitos de privacidad estrictos y hardware modesto: al ejecutarse en local sobre CPU, los prompts no salen del equipo, lo que encaja en demostraciones de procesamiento offline en entornos sin conectividad.
- Docencia sobre ajuste fino con LoRA: la ficha documenta el método, el dataset y la pérdida, lo que lo convierte en un ejemplo didáctico de cómo se publica un ajuste pequeño, siempre que se señale su escasa calidad esperada.
- Explicación de fragmentos de código en entornos de bajo riesgo: para comentar o resumir snippets cortos en inglés en tareas internas no críticas, con revisión humana obligatoria de la salida.
- Pruebas de compatibilidad de herramientas: validar que un cliente de la API de OpenAI o un frontend conversacional funciona contra un modelo GGUF servido localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica reportada | Valor |
|---|---|
| Pérdida de entrenamiento | ≈2,0449 |
| Épocas | 1 |
| Ejemplos de entrenamiento | 1.200 (UltraChat) |
| MMLU / HumanEval / GSM8K | No disponibles |

## Requisitos de hardware

- VRAM/RAM para inferencia: los pesos en Q4_K_M ocupan ≈379 MB; con overhead de runtime y caché KV para contextos cortos, el consumo realista se sitúa en torno a 1-2 GB de memoria, aunque no hay mediciones publicadas.
- Cabe en CPU: es el escenario previsto por el autor (Ollama), y un modelo de 494 M en Q4_K_M es viable en CPU de escritorio, portátil e incluso en placas tipo Raspberry Pi con suficiente RAM.
- GPU de consumo: cabe en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050/4060/4090, Apple Silicon con memoria unificada). No requiere A100 ni H100; usarlas sería desproporcionado.
- Despliegue: Ollama es la vía documentada por el autor; llama.cpp y cualquier frontend compatible con GGUF (LM Studio, entre otros) son opciones naturales. vLLM o TGI solo tendrían sentido por compatibilidad de API, no por rendimiento.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de sus fichas públicas; conviene verificarlos antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| WINGMAN-OPENS 0.2 | ≈494 M | No disponible | Inglés | Apache-2.0 | GGUF Q4_K_M | Ajuste LoRA sobre 1.200 ejemplos; sin benchmarks ni base declarada |
| Qwen2.5-0.5B | ≈494 M | 32.768 tokens | Multilingüe (≈29 idiomas) | Apache-2.0 | safetensors, GGUF | Preentrenamiento a gran escala y variantes instruct; benchmarks publicados |
| SmolLM2-360M | ≈362 M | 8.192 tokens (según ficha pública) | Principalmente inglés | Apache-2.0 | safetensors, GGUF | Entrenado con billones de tokens; orientado a dispositivo |
| TinyLlama-1.1B | ≈1,1 B | 2.048 tokens | Inglés | Apache-2.0 | safetensors, GGUF | Base preentrenada con ≈3 billones de tokens |

La diferencia clave no es el tamaño, sino la procedencia: las alternativas documentan modelo base, datos de preentrenamiento y evaluaciones, mientras que WINGMAN-OPENS 0.2 no publica ninguno de esos elementos.

## Limitaciones y advertencias

- Entrenamiento mínimo: 1.200 ejemplos y un solo epoch implican una capacidad muy limitada de seguir instrucciones y una calidad esperada baja frente a modelos del mismo tamaño con preentrenamiento completo.
- Modelo base no declarado: se desconoce sobre qué pesos se aplicó el LoRA, lo que impide verificar la procedencia, los términos heredados y las obligaciones de atribución. La etiqueta Apache-2.0 no garantiza por sí sola que la base lo sea.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni en tareas conversacionales.
- Riesgo elevado de alucinación y de código incorrecto: no se documenta ningún proceso de alineación, verificación factual ni evaluación de seguridad; no debe usarse para generar código que se despliegue sin revisión.
- Idioma único: solo inglés declarado; el comportamiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Contexto desconocido: sin ventana documentada, no es apto para tareas que requieran contexto largo ni para conversaciones multiturno extensas.
- Sin soporte documentado de tool calling ni de agentes: no debe integrarse en pipelines que dependan de function calling.
- Adopción nula: cero descargas y cero valoraciones en el Hub en la fecha de la ficha, lo que reduce la probabilidad de que los fallos estén detectados por la comunidad.
- Uso comercial: la licencia Apache-2.0 lo permitiría, pero la opacidad sobre el modelo base introduce un riesgo jurídico que conviene resolver antes de un despliegue comercial.
- Carácter experimental: el propio autor lo presenta como un punto de partida para experimentar, no como un modelo listo para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wingman-llc/WINGMAN-OPENS-0.2
- No se han encontrado en la búsqueda web enlaces relevantes a este modelo: los resultados devueltos corresponden a productos y obras homónimas sin relación (plugin de música Mixed In Key, asistente getwingman.com y el manga "Wingman"), por lo que se descartan.
- Paper, blog técnico, repositorio de código y demo: no disponibles en la información proporcionada.
