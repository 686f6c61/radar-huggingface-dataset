# vennyvirtuoso/microjev-agent-0.5b

## Resumen

microjev-agent-0.5b es un modelo de decisión de tipo "system one" publicado por el usuario vennyvirtuoso en Hugging Face. Se construye mediante fine-tuning supervisado del checkpoint instructivo Qwen/Qwen2.5-0.5B-Instruct (494 millones de parámetros, decoder causal) y se orienta a una tarea distinta de la generación de texto libre: dada una descripción de contexto y un conjunto de opciones tipadas, el modelo debe seleccionar la opción correcta y emitir una distribución de probabilidad calibrada sobre las alternativas. La model card lo describe como un "decision foundation model" con contexto nativo de 8.192 tokens y latencia declarada inferior a 5 ms, aunque la propia tabla de evaluación del autor reporta 740,08 ms por decisión en GPU, dato que conviene tomar como referencia realista.

El modelo se enmarca en el "Protocolo SemIf-Jev de decisiones tipadas", que cubre tres formatos: elección entre opciones (choice), gating booleano (noul) y puntuación discreta (rating). Su propuesta es actuar como capa rápida y barata de decisión dentro de pipelines mayores: enrutado de tickets, selección de herramienta en un agente, guardarraíl para RAG o filtros de seguridad. La idea de "zero-token decision" es que la salida se obtiene en un único forward pass, sin generación autoregresiva de tokens, lo que reduce coste y latencia frente a pedir la decisión a un LLM generativo.

La relevancia práctica reside en su tamaño (0,5 B), su licencia Apache 2.0 y su compatibilidad con `transformers` y `sentence-transformers`, lo que permite autohospedarlo en hardware modesto. No obstante, se trata de un modelo con cero descargas en el momento de la consulta, un único like y sin validación externa, por lo que cualquier adopción en producción debería ir precedida de una evaluación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal Qwen2 (base Qwen2.5-0.5B-Instruct), reutilizado como clasificador de secuencias con cabeza de decisión |
| Parametros totales | 494.032.768 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (según model card) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en bfloat16/fp16; no se listan GGUF ni AWQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base Qwen2.5 es multilingüe, pero el fine-tuning no especifica cobertura) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder causal de 24 capas con atención de múltiples cabezas y RoPE, y se recarga con `AutoModelForSequenceClassification` para producir un vector de logits sobre las opciones presentadas. La model card mezcla terminología ("bidirectional encoder", "ModernJev-8K", tag `modernbert`) con la realidad del checkpoint base, que es un decoder causal de Qwen2; conviene tratar esas etiquetas como descriptivas del protocolo de uso y no como una arquitectura encoder bidireccional verificada en los pesos.

El entrenamiento se realizó mediante fine-tuning supervisado sobre el dataset teknium/Hermes-FunctionCalling más escenarios sintéticos de IoT/DevOps orientados a MCP (Model Context Protocol), según declara el autor. No se documentan número de tokens de entrenamiento, composición exacta del dataset, ni si hubo RLHF, DPO o calibración post-hoc más allá de un escalado de temperatura fijado en T=1,15 en el ejemplo de inferencia. La innovación declarada es la "decisión de cero tokens": la salida se lee directamente de los logits de la cabeza de clasificación en un solo forward pass, sin decodificación autoregresiva, lo que en teoría abarata la inferencia frente a un LLM generativo del mismo tamaño.

## Capacidades

- Clasificación de decisiones tipadas: selección entre un conjunto cerrado de opciones (choice), activación booleana (noul gating) y puntuación discreta (rating).
- Enrutado de herramientas y function calling: el autor reporta un 86,00 % de macro tool accuracy en el split de test y un 94,50 % de tasa de parámetros JSON válidos.
- Guardarraíl para RAG: puede usarse como filtro previo para decidir si una consulta debe responderse con recuperación, derivarse a otro sistema o rechazarse.
- Decisión en un solo paso: no genera texto libre; devuelve logits/probabilidades sobre opciones predefinidas.
- Calibración: el autor propone escalado de temperatura (T=1,15) para obtener probabilidades interpretables.
- Integración con el ecosistema Hugging Face: `transformers`, `sentence-transformers`, `peft` y pipelines estándar.
- Capacidades multilingües: no documentadas para el fine-tuning; el modelo base Qwen2.5 tiene cobertura multilingüe, pero no hay evidencia de que el ajuste la preserve.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, el modelo elige entre equipos (facturación, soporte técnico, ventas, seguridad). El ejemplo de la model card muestra exactamente este escenario con cuatro opciones y una confianza calibrada del 99,42 %; es adecuado porque la decisión es de baja cardinalidad y el coste de un forward pass es mínimo.
- Selección de herramienta en agentes: en un pipeline de function calling, el modelo puede actuar como primer filtro que decide qué herramienta invocar antes de llamar a un LLM mayor, reduciendo coste y latencia en el caso común.
- Guardarraíl de RAG: decidir si una consulta del usuario debe pasar por recuperación documental, responderse directamente o derivarse a un humano; el modelo devuelve una probabilidad calibrada que permite fijar umbrales.
- Gating booleano en automatizaciones DevOps/IoT: aprobar o denegar acciones (reiniciar un servicio, escalar un clúster) en función del contexto, aprovechando los escenarios MCP sintéticos usados en el entrenamiento.
- Clasificación de intención en asistentes conversacionales: mapear el turno del usuario a una de N intenciones predefinidas antes de que un LLM genere la respuesta, con coste muy inferior al de un modelo generativo.
- Moderación y filtros de seguridad de primera línea: puntuar si un contenido cae en una categoría prohibida antes de enviarlo a un clasificador más caro o a revisión humana.
- Evaluación batch de decisiones a gran escala: al no requerir generación autoregresiva, permite procesar lotes grandes en CPU o GPU modesta para tareas de etiquetado y auditoría.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (split de test retenido, protocolo SemIf-Jev):

| Metrica | Fine-tuned | Baseline zero-shot |
|---|---|---|
| Macro tool accuracy | 86,00 % | 0,00 % |
| Tool choice accuracy | 77,00 % | 0,00 % |
| Edge MCP accuracy | 100,00 % | 0,00 % |
| Noul gating accuracy | 81,00 % | 0,00 % |
| Tasa de parámetros JSON válidos | 94,50 % | No disponible |
| Latencia de decisión (un turno, GPU) | 740,08 ms | No disponible |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores proceden exclusivamente del autor y no han sido verificados de forma independiente; el baseline zero-shot al 0,00 % sugiere que el checkpoint base no está formateado para esta tarea, por lo que la comparación mide sobre todo la adaptación al protocolo, no la calidad absoluta del modelo.

## Requisitos de hardware

- VRAM estimada: en bfloat16/fp16, los 494 M de parámetros ocupan aproximadamente 1 GB de pesos; con overhead de activaciones y tokenizador, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); para producción en lote, A10G, L4, A100 o H100 aportan mayor throughput.
- Cabe en CPU: sí, con latencias mayores; el tamaño permite inferencia en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `sentence-transformers`, `peft` para adaptadores, y servidores de inferencia estándar (TGI, vLLM) siempre que soporten clasificación de secuencias; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: el autor declara 740,08 ms por decisión en GPU y "sub-5ms" en la descripción general; la discrepancia entre ambas cifras no está explicada y conviene medirla en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microjev-agent-0.5b | 494 M | 8.192 | Decisión tipada / clasificación | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 (según ficha del base) | Generación de texto instructiva | Apache 2.0 | Hugging Face, ampliamente usado |
| ModernBERT-base | ~149 M | 8.192 | Clasificación y retrieval | Apache 2.0 | Hugging Face |
| BERT-base / MiniLM | 110-66 M | 512 | Clasificación de secuencias | Apache 2.0 / MIT | Hugging Face |

La comparación directa más justa es con el propio Qwen2.5-0.5B-Instruct sin ajustar: microjev-agent-0.5b cambia la cabeza de lenguaje por una de clasificación y especializa el comportamiento en el protocolo SemIf-Jev, a costa de perder la capacidad de generar texto libre. Frente a encoders como ModernBERT o MiniLM, el contexto de 8.192 tokens es la ventaja principal, aunque el tamaño (494 M) es mayor y la latencia declarada no es comparable con la de un encoder pequeño. No se dispone de benchmarks cruzados independientes con estos modelos.

## Limitaciones y advertencias

- Modelo sin validación externa: cero descargas y un único like en el momento de la consulta; los benchmarks son autoinformados y no han sido replicados.
- Inconsistencias en la model card: se describe como "bidirectional encoder" y se etiqueta con `modernbert`, pero el checkpoint base es un decoder causal Qwen2; la latencia declarada varía entre "sub-5ms" y 740,08 ms.
- No genera texto libre: solo produce logits sobre opciones predefinidas; no sirve como sustituto de un LLM conversacional.
- Riesgo de alucinación de opciones: si el conjunto de opciones no cubre la respuesta correcta, el modelo forzará una elección entre las disponibles; el ejemplo de la model card enmascara logits fuera de rango, pero no hay mecanismo documentado de rechazo.
- Idiomas no declarados: el fine-tuning no especifica cobertura lingüística; el uso en castellano requeriría evaluación propia.
- Sesgos: no documentados; al derivar de Qwen2.5 y de Hermes-FunctionCalling, puede heredar sesgos de esos datasets, pero no hay análisis publicado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del dataset base (Hermes-FunctionCalling) si se redistribuye.
- Contexto de 8.192 tokens: suficiente para muchas decisiones, pero insuficiente para documentos largos sin troceado previo.
- Formato de pesos limitado a safetensors: no hay GGUF ni cuantizaciones publicadas, lo que complica el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/microjev-agent-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/teknium/Hermes-FunctionCalling
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
