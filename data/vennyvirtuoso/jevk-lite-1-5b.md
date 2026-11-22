# vennyvirtuoso/jevk-lite-1.5b

## Resumen

jevk-lite-1.5b es un modelo de decisión de tipo "System One" desarrollado por el usuario vennyvirtuoso, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-1.5B-Instruct (1.543.714.304 parámetros) orientado a la clasificación y toma de decisiones tipadas: elección entre opciones múltiples, decisiones booleanas y valoraciones discretas. La model card lo describe como un encoder bidireccional con contexto nativo de 8.192 tokens, aunque el checkpoint se distribuye en formato safetensors y se carga mediante `AutoModelForSequenceClassification` de Transformers.

El modelo aborda un problema concreto: sustituir el razonamiento generativo de un LLM por una decisión directa y de baja latencia sobre un conjunto cerrado de opciones, lo que lo hace adecuado como guardarraíl en pipelines RAG, enrutamiento de tickets o clasificación operativa. La propuesta de valor principal es la reducción de latencia y la calibración de probabilidades mediante temperature scaling (T=1.15), junto con una ganancia empírica reportada de +63,22 puntos de precisión macro sobre el checkpoint base en el split de test.

Es relevante ahora porque propone un patrón de "decisión sin generación de tokens" (zero-token-decision) para tareas acotadas, un enfoque que compite con el uso de LLM generativos para clasificación. No obstante, el modelo es muy reciente (creado en noviembre de 2026), no tiene descargas ni likes, y los resultados publicados proceden únicamente de la model card del autor, sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5 (model card menciona encoder bidireccional "ModernJev-8K"; no verificable) |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (según model card) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16/fp16 según model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un encoder bidireccional bautizado como "ModernJev-8K", derivado de Qwen2.5-1.5B-Instruct mediante ajuste fino supervisado. La tarea declarada es `text-classification`, y el checkpoint se carga con `AutoModelForSequenceClassification`, lo que implica una cabeza de clasificación sobre el transformer base. El contexto nativo declarado es de 8.192 tokens. Cabe señalar una inconsistencia: Qwen2.5 es una familia de transformers decoder-only, mientras que la model card afirma bidireccionalidad y menciona "modernbert" entre las etiquetas, sin que se detalle cómo se logra esa bidireccionalidad ni si se modificó la máscara de atención.

El entrenamiento se realizó sobre el dataset ZefanCai/Open-Jev-v1.1 y el "JevBench Decision Suite", siguiendo el "SemIf-Jev Typed Decision Protocol". El formato de entrada es un prompt estructurado con contexto, pregunta de decisión y opciones tipadas etiquetadas de la A en adelante, y la salida es una distribución de logits sobre las opciones válidas. La model card reporta precisión mixta (bfloat16/fp16) y calibración mediante temperature scaling con T=1.15. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisiones tipadas: elección entre opciones múltiples (choice), decisiones booleanas (noul) y valoraciones discretas (rating).
- Decisión en un solo paso sin generación de tokens de texto libre (zero-token-decision), devolviendo logits y probabilidades calibradas.
- Clasificación de intención (intent) en dominios operativos, según los resultados de JevBench Intent.
- Salida de distribución de probabilidad calibrada sobre las opciones válidas, apta para umbrales de confianza.
- Uso como guardarraíl en pipelines RAG (etiqueta rag-guardrail).
- Integración con `transformers`, `sentence-transformers`, `peft` y pipelines estándar de Hugging Face.
- Despliegue autoalojado (self-hosted) en microservicios y entornos de borde por su tamaño reducido.
- No se declaran capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un conjunto cerrado de equipos (facturación, soporte técnico, ventas, seguridad), el modelo devuelve la opción más probable con su confianza calibrada, lo que permite derivar automáticamente el ticket y escalar solo los casos por debajo de un umbral.
- Guardarraíl en pipelines RAG: antes de ejecutar una consulta contra el índice vectorial, el modelo decide si la petición es respondible con la base documental o debe rechazarse, actuando como filtro de bajo coste y baja latencia.
- Clasificación de intención en asistentes conversacionales: con un contexto de hasta 8.192 tokens, puede clasificar la intención de turnos largos o conversaciones multi-turno en un conjunto predefinido de acciones.
- Moderación y cumplimiento: decisión booleana (noul) sobre si un contenido cumple o no una política concreta, con probabilidad calibrada para ajustar el punto de corte operativo.
- Triaje en atención al cliente automatizada: clasificación de la urgencia o categoría de una reclamación a partir del historial del cliente incluido en el contexto, sin generar texto y por tanto sin riesgo de alucinación en la respuesta.
- Evaluación por lotes de alta throughput: al ser un modelo de 1,54B y no generar tokens, es adecuado para puntuar grandes volúmenes de pares (contexto, opciones) en procesos batch nocturnos o microservicios con requisitos de latencia estrictos.
- Enrutamiento de consultas en sistemas multiagente: decidir qué agente o herramienta debe atender una petición entre un conjunto finito de alternativas.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (split de test retenido, protocolo SemIf-Jev):

| Metrica | Resultado |
|---|---|
| Precisión macro en test (fine-tuned) | 63,22% |
| Precisión macro baseline zero-shot | 0,00% |
| Ganancia absoluta de precisión | +63,22% |
| Precisión de estado tipado (typed status) | 100,00% |
| Latencia en borde por decisión | 302,35 ms/decisión |
| JevBench Choice (fine-tuned) | 16,33% |
| JevBench Choice (baseline) | 0,00% |
| JevBench Noul (fine-tuned) | 79,33% |
| JevBench Noul (baseline) | 0,00% |
| JevBench Intent (fine-tuned) | 94,00% |
| JevBench Intent (baseline) | 0,00% |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona "sub-5ms latency" en el texto destacado, pero la tabla de evaluación reporta 302,35 ms/decisión en borde; la discrepancia no está aclarada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: en torno a 3 GB de pesos, más overhead de activaciones; aproximadamente 4-5 GB en GPU.
- En cuantización de 8 bits: unos 1,6 GB; en 4 bits: unos 0,8 GB (estimación a partir del número de parámetros; el autor no publica cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100. Cabe en GPU de consumo actuales.
- Despliegue: `transformers` con `AutoModelForSequenceClassification` es la vía documentada. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de clasificación, las herramientas de servido de LLM generativos no son directamente aplicables.
- Latencia reportada: 302,35 ms por decisión en borde según la tabla de evaluación; el texto de la model card afirma latencia inferior a 5 ms, sin aclarar el hardware ni el régimen de lote.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jevk-lite-1.5b | 1,54B | 8.192 | Clasificación / decisión tipada | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 (según ficha del base) | Generación de texto e instrucciones | Apache 2.0 | Hugging Face, ampliamente usado |
| ModernBERT-base | ~0,15B | 8.192 | Clasificación y encoding | Apache 2.0 | Hugging Face |
| DeBERTa-v3-base | ~0,18B | 512 | Clasificación y NLU | MIT | Hugging Face |

La comparación con el modelo base es la más directa: jevk-lite-1.5b hereda los pesos de Qwen2.5-1.5B-Instruct pero se especializa en clasificación con cabeza de decisión, a costa de perder la capacidad generativa. Frente a encoders como ModernBERT o DeBERTa, jevk-lite-1.5b es un orden de magnitud mayor en parámetros y ofrece contexto de 8.192 tokens, aunque no hay datos independientes que permitan comparar calidad. No se dispone de comparativas publicadas por terceros.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden únicamente de la model card del autor; no hay validación independiente ni réplica del protocolo SemIf-Jev.
- La precisión en JevBench Choice es baja (16,33%), lo que sugiere un rendimiento limitado en decisiones de opción múltiple frente a tareas booleanas (79,33%) o de intención (94,00%).
- La afirmación de arquitectura "encoder bidireccional" sobre un base decoder-only (Qwen2.5) no está documentada técnicamente y debería verificarse antes de confiar en ella.
- Discrepancia entre la latencia declarada en el texto (<5 ms) y la reportada en la tabla (302,35 ms/decisión); conviene medirla en el hardware objetivo.
- Idiomas soportados no declarados; el modelo base Qwen2.5 es multilingüe, pero el ajuste fino se realizó sobre un dataset cuyo idioma y composición no se detallan, por lo que el rendimiento fuera del inglés es incierto.
- Riesgo de alucinación bajo en la salida (no genera texto libre), pero riesgo de sobreconfianza: la calibración con T=1.15 es un parámetro fijo y puede no transferirse a dominios distintos del entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni equidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-1.5B-Instruct conviene revisar también las condiciones del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.
- El checkpoint se distribuye en safetensors de 3,1 GB; no hay versiones GGUF ni cuantizadas publicadas por el autor.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/vennyvirtuoso/jevk-lite-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev-v1.1
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
