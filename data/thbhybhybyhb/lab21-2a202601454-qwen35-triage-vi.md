# thbhybhybyhb/lab21-2A202601454-qwen35-triage-vi

## Resumen

El modelo `thbhybhybyhb/lab21-2A202601454-qwen35-triage-vi` es un adaptador LoRA (PEFT) desarrollado por Bế Nguyễn Hà Sơn como parte del Lab 21 del programa AICB-P2T3. Su función es clasificar tickets de atención al cliente en vietnamita y devolver un objeto JSON con cuatro campos: `intent`, `urgency`, `sentiment` y `product`. Está construido sobre el modelo base `unsloth/Qwen3.5-4B`, una versión de 4 mil millones de parámetros de la familia Qwen3.5.

El adaptador se entrena con 225 muestras sintéticas controladas, 2 épocas y 30 pasos de optimización, utilizando LoRA de 16 bits con `r=16` y `alpha=32` aplicado a todas las capas lineales del decoder. El resultado es un modelo especializado que alcanza una precisión del 97 % en la tarea objetivo, aunque con una pérdida notable de capacidades generales (olvido catastrófico). Su relevancia radica en demostrar un caso práctico de fine-tuning eficiente para tareas de triaje de tickets en un idioma de bajos recursos como el vietnamita, con un coste de entrenamiento reducido (una GPU Tesla T4).

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio incluye artefactos de evaluación completos (métricas, máscaras de pérdida, veredictos) que documentan de forma transparente tanto los aciertos como las limitaciones del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | 4 000 000 000 (modelo base) + 32 464 896 (adaptador LoRA) |
| Parametros activos | 32 464 896 (solo adaptador; el modelo base se congela) |
| Longitud de contexto | no disponible (entrenado con `max_length=1024`) |
| Tipos de cuantizacion | fp16 (adaptador); el modelo base puede cuantizarse a 4/8 bits |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer causal de Qwen3.5-4B, un modelo de lenguaje de 4 mil millones de parámetros. Sobre este modelo congelado se aplica LoRA (Low-Rank Adaptation) con rango `r=16` y factor de escala `alpha=32`, insertado en todas las capas lineales del decoder (12 tipos de módulos). El entrenamiento se realiza en precisión fp16 con GradScaler, sin usar QLoRA (cuantización de 4 bits), sobre una GPU Tesla T4 con un pico de VRAM de 12.01 GB.

El dataset de entrenamiento consiste en 250 tickets sintéticos controlados (225 usados para entrenamiento), generados artificialmente y no procedentes de logs reales de atención al cliente. Se aplica una máscara de pérdida que solo considera los tokens de la respuesta del asistente (43 % de los tokens totales), lo que se verifica mediante decodificación inversa. El entrenamiento dura 2 épocas, equivalente a 30 pasos de optimización con un batch efectivo de 16 y una tasa de aprendizaje de `1e-4`. No se emplean técnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Clasificación de tickets de atención al cliente en vietnamita en cuatro dimensiones: `intent` (devolución, envío, reembolso, producto defectuoso, consulta), `urgency` (alta, media, baja), `sentiment` (negativo, neutral, positivo) y `product` (nombre del producto mencionado).
- Generación de salida JSON estricta con exactamente 4 claves, sin markdown ni texto adicional.
- Funciona incluso con prompts descuidados o sin esquema explícito, ya que el comportamiento está codificado en los pesos del adaptador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües; está especializado exclusivamente en vietnamita.
- No genera bloques de razonamiento (`thinking`); la tasa de trazas válidas es 0.00.

## Casos de uso

- Enrutamiento automático de tickets en centros de soporte vietnamitas: el adaptador clasifica cada ticket entrante en una de las cinco intenciones predefinidas, permitiendo dirigirlo al equipo correspondiente (devoluciones, envíos, reembolsos, etc.) sin intervención humana.
- Priorización de incidencias urgentes: el campo `urgency` permite marcar automáticamente los tickets con alta prioridad (por ejemplo, reclamaciones de más de 3 días) para que los agentes los atiendan primero.
- Análisis de sentimiento en tiempo real: el campo `sentiment` (negativo, neutral, positivo) se puede usar para monitorizar la satisfacción del cliente y detectar picos de quejas.
- Extracción de producto mencionado: el campo `product` identifica el artículo concreto (p. ej., "balo laptop") mencionado en el ticket, útil para informes de calidad y seguimiento de incidencias por producto.
- Integración en sistemas de ticketing existentes (Zendesk, Freshdesk, etc.) mediante una API que reciba el texto del ticket y devuelva el JSON de clasificación, reduciendo el tiempo de respuesta y la carga de los agentes.
- Automatización de respuestas iniciales: aunque el adaptador no genera texto libre, su salida JSON puede alimentar un sistema de plantillas que envíe una respuesta automática al cliente según la intención y urgencia detectadas.

## Benchmarks y rendimiento

Los resultados se midieron sobre 50 muestras objetivo congeladas y 15 frases de regresión, con decodificación greedy. La tabla siguiente compara el adaptador con dos configuraciones del modelo base sin adaptar:

| Configuracion | target | regression | format | latencia (ms) |
|---|---|---|---|---|
| (a) base + prompt descuidado | 0.000 | 0.758 | 0.000 | 3249 |
| (b) base + prompt optimizado | 0.765 | 0.758 | 1.000 | 1089 |
| (c) adaptador LoRA (este modelo) | 0.970 | 0.633 | 1.000 | 1435 |

El adaptador supera al mejor prompt del modelo base en +0.205 en la tarea objetivo, pero pierde −0.124 en capacidad general (regresión), lo que indica olvido catastrófico. En la evaluación de control, el adaptador `attn_only` (solo capas q,v con r=283) logra el mismo target (0.970) con menor pérdida de entrenamiento (0.5367 frente a 0.6261), mientras que una tasa de aprendizaje incorrecta (1e-5) produce un fallo total (target 0.000). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-4B en fp16 requiere aproximadamente 8 GB, más el adaptador LoRA (32 MB adicionales). Con cuantización a 4 bits (NF4) el pico de VRAM se reduce a 7.09 GB, como se observó durante el entrenamiento.
- GPU recomendadas: Tesla T4 (12 GB) es suficiente para entrenamiento e inferencia; también funciona en GPUs consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM.
- Cabe en GPUs consumer de gama media; no requiere hardware de centro de datos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con `transformers` + `peft` (como se muestra en el ejemplo de uso).
- Latencia medida: 1435 ms por generación en Tesla T4 con decodificación greedy y `max_new_tokens=160`. El throughput no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thbhybhybyhb/lab21-2A202601454-qwen35-triage-vi` | 4B + 32M LoRA | no disponible | Triaje de tickets en vietnamita | Apache 2.0 | Hugging Face |
| `rhindsight/lab21-2A202601903-qwen35-triage-vi` | 4B + LoRA (mismo esquema) | no disponible | Triaje de tickets en vietnamita | Apache 2.0 | Hugging Face |
| `unsloth/Qwen3.5-4B` (modelo base) | 4B | no disponible | Modelo general multilingüe | Apache 2.0 | Hugging Face |

El adaptador de `rhindsight` es un trabajo similar del mismo programa de formación, con la misma arquitectura base y tarea, aunque no se dispone de sus métricas detalladas. El modelo base sin adaptar tiene capacidades generales pero no produce el formato JSON estructurado sin un prompt cuidadosamente diseñado (precisión 0.000 con prompt descuidado).

## Limitaciones y advertencias

- Olvido catastrófico: la capacidad general del modelo se reduce en 0.124 puntos (medido en frases de regresión), por lo que no debe usarse como sustituto del modelo base para tareas generales.
- Entrenado exclusivamente con corpus sintético controlado (250 tickets generados artificialmente), no con logs reales de atención al cliente; el rendimiento en datos reales puede diferir.
- Debilidad específica en la clase `urgency = thap` (baja): los 6 errores observados en 200 muestras corresponden todos a esta clase, y todos los tickets erróneos contienen la frase "Khi nào tiện" (cuando sea conveniente).
- No genera bloques de razonamiento (`thinking`), lo que limita su uso en escenarios que requieran explicaciones intermedias.
- Solo soporta vietnamita; no es multilingüe.
- El adaptador está diseñado para una tarea muy específica (salida JSON de 4 campos); no es adecuado para generación de texto libre ni conversación general.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda validar el modelo con datos reales antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thbhybhybyhb/lab21-2A202601454-qwen35-triage-vi
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Adaptador similar de otro autor: https://huggingface.co/rhindsight/lab21-2A202601903-qwen35-triage-vi
