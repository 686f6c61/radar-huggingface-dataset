# vishinvents/distil-qwen3-1.7b-ecom-ticket-router

## Resumen

El modelo `distil-qwen3-1.7b-ecom-ticket-router` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-1.7B, desarrollado por Vish Vadlamani sobre la plataforma Distil Labs. Su propósito es clasificar y enrutar tickets de soporte al cliente en entornos de comercio electrónico: lee el texto del ticket junto con metadatos ligeros del pedido (estado, días transcurridos, contactos previos) y emite un único objeto JSON con la intención detectada, la urgencia, el identificador del pedido, el sentimiento, una acción sugerida y si requiere intervención humana. El modelo está diseñado para integrarse directamente en un sistema de helpdesk, sin necesidad de postprocesamiento adicional.

La relevancia de este modelo radica en su especialización y eficiencia: con solo 1.720 millones de parámetros consigue superar a su profesor (gpt-oss-120b) en el benchmark interno en dominio (83,3 % frente a 75,0 %) y mantiene una salida JSON válida en el 100 % de las entradas evaluadas, incluyendo intentos de manipulación (prompt injection). Su licencia Apache 2.0 permite uso comercial sin restricciones, y el repositorio incluye pesos en formato safetensors y GGUF, además de una implementación de referencia con el prompt del sistema y el harness de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | No especificada en la ficha; el modelo base Qwen3-1.7B soporta hasta 32.768 tokens según su documentación oficial |
| Tipos de cuantizacion | GGUF f16 (incluido en el repo), safetensors (precisión completa) |
| Idiomas soportados | Inglés (principal), con degradación en otros idiomas (el modelo puede emitir JSON válido en español o alemán, pero con menor precisión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (precisión FP32/FP16), GGUF (f16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (LoRA) del Qwen3-1.7B, un transformer denso de 1,72 mil millones de parámetros con arquitectura estándar de decoder-only y atención causal. El entrenamiento se realizó sobre la plataforma Distil Labs, utilizando como profesor (teacher) el modelo gpt-oss-120b de OpenAI. El proceso de entrenamiento se basó en 10.149 tickets sintéticos generados a partir de 49 tickets de semilla escritos a mano que cubren las 12 intenciones definidas en el contrato de tarea. Un paso crítico fue la reparación mecánica de las etiquetas generadas: 409 etiquetas que violaban las reglas duras del contrato y 1.114 que enseñaban escalado innecesario fueron corregidas antes del entrenamiento, lo que permitió al estudiante superar al profesor en el benchmark interno. También se incorporaron 60 mensajes reales de clientes etiquetados a mano y 6 ejemplos de manipulación (prompt injection). El sistema de prompt que define la tarea debe usarse textualmente en inferencia.

## Capacidades

- Clasificación de intención en 12 categorías (estado del pedido, problema de entrega, solicitud de devolución, estado de reembolso, intercambio, cancelación, consulta de producto, talla y ajuste, artículo dañado, problema de facturación, acceso a cuenta, otros).
- Asignación de urgencia en escala entera de 1 a 5.
- Extracción del identificador del pedido carácter a carácter, con prioridad al texto del ticket sobre los metadatos, y devolución de `null` si no está presente.
- Clasificación de sentimiento en cuatro categorías: enojado, frustrado, neutral, positivo.
- Sugerencia de acción restringida por intención (13 acciones posibles, como enviar enlace de seguimiento, abrir investigación con el transportista, generar etiqueta de devolución, etc.).
- Detección de necesidad de intervención humana mediante desencadenantes explícitos (amenazas, fraude, contacto repetido, petición explícita de persona, casos no resolubles automáticamente).
- Salida estrictamente JSON válido, con validación de esquema en el 100 % de los casos evaluados.
- Soporte de entrada en formato de chat (el prompt del sistema incluye el contrato de entrada y salida).

## Casos de uso

- Enrutamiento automático de tickets de soporte en ecommerce: el modelo asigna cada ticket a un flujo de trabajo concreto (devolución, reembolso, seguimiento de entrega) basándose en la intención y la acción sugerida, reduciendo el tiempo de clasificación manual.
- Priorización de urgencia en colas de soporte: con la puntuación de urgencia (1-5), los equipos pueden ordenar los tickets por criticidad y atender primero los casos de mayor impacto, como problemas de entrega con cliente enfadado.
- Extracción de datos operativos: el modelo copia el `order_id` exacto del texto del ticket, lo que permite enlazar automáticamente el ticket con el pedido en el sistema CRM o ERP sin errores de escritura.
- Detección de escalado a humano: el campo `needs_human` identifica casos que requieren intervención de un agente (amenazas, fraude, peticiones explícitas), evitando que el sistema automático los trate de forma inadecuada.
- Integración en pipelines de helpdesk: la salida JSON puede alimentar directamente un sistema de tickets (Zendesk, Freshdesk, etc.) mediante webhooks, sin necesidad de parsear texto libre.
- Análisis de sentimiento y tono en mensajes de clientes: la clasificación de sentimiento permite monitorizar la satisfacción del cliente y detectar picos de frustración en tiempo real.
- Soporte multilingüe básico: aunque el modelo está entrenado principalmente en inglés, mantiene la validez del JSON en español y alemán, lo que permite su despliegue en mercados con esos idiomas con una degradación de precisión aceptable.

## Benchmarks y rendimiento

Resultados del benchmark interno (test de 64 filas: 24 tickets curados + 40 mensajes reales de la corpus Customer Support on Twitter):

| Metrica | Qwen3-1.7B sin entrenar | Teacher (gpt-oss-120b) | Modelo ajustado |
|---|---|---|---|
| LLM-as-a-judge | 32,8 % | 67,2 % | 67,2 % |
| Exact match | 0,0 % | 56,3 % | 54,7 % |
| ROUGE | 82,6 % | 90,1 % | 90,7 % |

Por subconjunto (mismo evaluador por campos):

| Slice | Teacher | Modelo ajustado |
|---|---|---|
| Benchmark curado en dominio (24) | 75,0 % | 83,3 % |
| Mensajes reales fuera de dominio (40) | 60,0 % | 57,5 % |

Además, el modelo ajustado alcanza un 95,8 % de precisión en la lectura de intención y un 100 % en la copia de identificadores de pedido en el slice curado. La latencia local medida con el GGUF f16 en un Apple M-series es de p50 1,9 segundos por ticket, incluyendo el procesamiento del prompt del sistema de aproximadamente 1.000 tokens.

## Requisitos de hardware

- Con 1,72B de parámetros, el modelo se puede ejecutar en GPU de consumo con 4-6 GB de VRAM en cuantización (por ejemplo, GGUF Q4_K_M), y en alrededor de 3,5 GB con cuantización más agresiva. La versión f16 requiere aproximadamente 3,4 GB de VRAM para los pesos.
- GPU recomendadas: RTX 4060, RTX 4090, A100, H100, o cualquier GPU con al menos 4 GB de VRAM. También se puede ejecutar en CPU (Apple M-series, servidores x86) con el GGUF, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (vía GGUF), Ollama (se proporciona un Modelfile), vLLM, TGI, o cualquier servidor compatible con safetensors (transformers). El repositorio incluye el Modelfile para Ollama.
- Latencia reportada: 1,9 segundos por ticket en un Apple M-series con GGUF f16 (p50). En GPU dedicada, se espera una latencia inferior a 100 ms por ticket.
- El modelo es compatible con endpoints de clasificación de texto de Hugging Face (pipeline `text-classification`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (benchmark curado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distil-qwen3-1b-ecom-ticket-router | 1,72B | 32K (base) | 83,3 % (LLM-judge, slice curado) | Apache 2.0 | Safetensors + GGUF, Ollama |
| Qwen3-1.7B (base, sin ajuste) | 1,72B | 32K | 32,8 % (LLM-judge) | Apache 2.0 | Safetensors, GGUF |
| gpt-oss-120b (teacher) | 120B (aprox.) | 128K | 75,0 % (slice curado) | OpenAI | API privada |

No se han encontrado modelos comparables de clasificación de tickets de ecommerce con la misma especialización y datos públicos. La comparativa más relevante es contra el modelo base y el teacher, que se muestra en la tabla anterior.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés. En entradas en español, alemán u otros idiomas, la precisión de la clasificación de intención y sentimiento degrada, aunque el JSON de salida sigue siendo válido.
- Los mensajes de redes sociales sin metadatos de pedido son un dominio fuera de alcance: el rendimiento baja al 57,5 % frente al 60,0 % del profesor, y la extracción de `order_id` no será fiable si no aparece en el texto.
- El modelo no escribe respuestas al cliente; solo enruta y clasifica. No debe usarse para generar contenido de soporte.
- La política de devoluciones o plazos que no se especifican explícitamente en el prompt siguen las convenciones del conjunto de datos de semilla; puede no alinearse con políticas reales de una empresa.
- El sentimiento en casos de sarcasmo o ironía tiene dificultades; puede clasificar erróneamente como neutral o positivo.
- La detección de `needs_human` se basa en desencadenantes explícitos definidos en el sistema de prompt; casos ambiguos pueden no ser detectados.
- El modelo fue entrenado con un profesor que puede tener sesgos; la reparación de etiquetas reduce pero no elimina el riesgo de alucinación o errores sistemáticos en categorías poco frecuentes.
- Para producción, es imprescindible usar el prompt del sistema exacto que se proporciona en el repositorio; cualquier modificación puede degradar el rendimiento.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/vishinvents/distil-qwen3-1.7b-ecom-ticket-router
- Repositorio de referencia (implementación, semillas, eval harness, demo): https://github.com/vishinvents/distil-ecommerce-ticket-router
- Guía de fine-tuning de Qwen3 1.7B de Distil Labs: https://www.distillabs.ai/learn/qwen3-1-7b-fine-tuning-guide/
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo similar de Distil Labs (distil-qwen3-1.7b-posthog-extractor): https://huggingface.co/distil-labs/distil-qwen3-1.7b-posthog-extractor
- Información de Qwen3 1.7B en Intel Software Catalog: https://aiswcatalog.intel.com/models/qwen-qwen3-1-7b
- Página de Ollama para qwen3:1.7b: https://ollama.com/library/qwen3:1.7b
