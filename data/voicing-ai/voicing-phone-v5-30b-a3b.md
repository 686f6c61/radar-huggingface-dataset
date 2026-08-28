# voicing-ai/Voicing-Phone-V5-30B-A3B

## Resumen

Voicing-Phone-V5-30B-A3B es un modelo de lenguaje especializado en agentes de voz para llamadas telefónicas, desarrollado por Voicing AI, una plataforma empresarial de agentes de voz. Se trata de un fine-tune del modelo base NVIDIA Nemotron-3-Nano-30B-A3B-BF16, que emplea una arquitectura de mezcla de expertos (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos. El modelo está diseñado para tareas conversacionales, tool calling y function calling, con integración explícita con el framework Pipecat, lo que lo hace adecuado para desplegar agentes de voz automatizados en entornos de producción.

La relevancia de este modelo radica en su enfoque específico para el dominio telefónico, un área donde los modelos genéricos suelen fallar por falta de ajuste a patrones de habla, turnos de conversación y manejo de herramientas. Al partir de un modelo MoE eficiente (solo 3B activos), ofrece un equilibrio entre capacidad y coste computacional, lo que permite su despliegue en infraestructura moderada. Aunque el modelo se publicó en agosto de 2026 y aún no cuenta con descargas ni validación comunitaria, su alineación con plataformas como Pipecat y su base sólida de NVIDIA lo convierten en una opción a considerar para proyectos de voz automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Nemotron-3-Nano-30B-A3B |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según el modelo base) |
| Idiomas soportados | Ingles (segun etiqueta 'en') |
| Licencia | no disponible (etiqueta sugiere BSD-2-Clause) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Nemotron-3-Nano-30B-A3B de NVIDIA, que emplea un diseño de mezcla de expertos (MoE) con 30B parámetros totales y 3B activos por token. Esta configuración permite una inferencia eficiente al activar solo una fracción de los parámetros, reduciendo la carga computacional y la latencia en comparación con modelos densos de tamaño similar. El fine-tune realizado por Voicing AI adapta el modelo base a tareas de agente de voz, incorporando capacidades de tool calling, function calling y conversación multi-turno, probablemente entrenado con datos de llamadas telefónicas reales o simuladas.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de las heredadas del modelo base. La integración con Pipecat sugiere que el modelo ha sido optimizado para trabajar con pipelines de voz en tiempo real, aunque no se detallan los mecanismos concretos.

## Capacidades

- Generacion de texto conversacional: el modelo está optimizado para mantener diálogos naturales y coherentes, adecuados para interacciones telefónicas.
- Tool calling y function calling: soporta la invocación de herramientas externas, lo que permite integrar APIs, bases de datos o sistemas de gestión durante una conversación.
- Soporte para agentes de voz: diseñado específicamente para ser utilizado en pipelines de voz, con integración declarada con el framework Pipecat.
- Conversación multi-turno: capaz de gestionar contextos de diálogo extendidos, aunque la longitud máxima de contexto no está especificada.
- Capacidades multilingües: limitadas al inglés según la etiqueta 'en', sin evidencia de soporte para otros idiomas.
- Compatibilidad con endpoints: el tag 'endpoints_compatible' sugiere que puede desplegarse en servicios de inferencia estándar.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar llamadas entrantes, resolver consultas frecuentes y derivar casos complejos a agentes humanos. Su capacidad de tool calling permite consultar sistemas CRM o bases de conocimiento en tiempo real.
- Ventas telefónicas: puede realizar llamadas salientes para ofrecer productos o servicios, manteniendo conversaciones persuasivas y registrando interacciones mediante function calling.
- Soporte técnico por voz: adecuado para guiar a usuarios en la resolución de problemas, accediendo a manuales o scripts mediante herramientas externas.
- Reservas y citas: puede gestionar agendas, confirmar citas y modificar reservas a través de integraciones con calendarios o sistemas de gestión.
- Encuestas y sondeos telefónicos: capaz de realizar llamadas automatizadas para recopilar respuestas, estructurando los datos obtenidos mediante tool calling.
- Integración con plataformas de voz: al ser compatible con Pipecat, puede desplegarse en arquitecturas de agentes de voz en tiempo real, reduciendo la latencia en comparación con modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares. El único dato indirecto proviene de un artículo de explainx.ai que menciona a PhoneLLM Alpha 1 (otro fine-tune de Nemotron 3 Nano) con afirmaciones de rendimiento, pero no se refiere específicamente a este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MoE con 30B parámetros totales, la carga completa de pesos requiere aproximadamente 60 GB en BF16 (30B × 2 bytes). Con cuantización a 8 bits, se reduciría a ~30 GB, y a 4 bits a ~15 GB. Sin embargo, al activar solo 3B parámetros por token, la memoria de activación es menor, pero los pesos completos deben estar cargados.
- GPU recomendadas: para BF16 completo, se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantización 4-bit, podría ejecutarse en GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). La compatibilidad con Pipecat sugiere que se puede integrar en pipelines de voz en tiempo real.
- Latencia y throughput: no se dispone de datos concretos. Dado el tamaño activo de 3B, se espera una latencia moderada, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Voicing-Phone-V5-30B-A3B | 30B totales, 3B activos | no disponible | no disponible (BSD-2-Clause sugerida) | HuggingFace |
| NVIDIA Nemotron-3-Nano-30B-A3B (base) | 30B totales, 3B activos | no disponible | BSD-2-Clause | HuggingFace |
| PhoneLLM Alpha 1 (Pipecat) | 30B totales, 3B activos (según artículo) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo. El modelo base de NVIDIA es la referencia directa, y PhoneLLM Alpha 1 es otro fine-tune del mismo base orientado a voz, pero sin información pública detallada.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado información sobre sesgos. Al ser un fine-tune de un modelo base, puede heredar sesgos del entrenamiento original de Nemotron.
- Riesgo de alucinación: no se han evaluado tasas de alucinación específicas. En contextos telefónicos, las alucinaciones pueden ser críticas, por lo que se recomienda validación externa.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que puede limitar conversaciones muy largas o con mucha información previa.
- Limitaciones de idioma: solo se ha confirmado inglés. No es adecuado para despliegues multilingües sin verificación adicional.
- Restricciones de licencia: la licencia no está confirmada oficialmente; la etiqueta sugiere BSD-2-Clause, pero se debe verificar antes de uso comercial.
- Modelo sin validación comunitaria: con 0 descargas y 0 likes, no hay evidencia de pruebas en entornos reales. Se recomienda realizar pruebas exhaustivas antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/voicing-ai/Voicing-Phone-V5-30B-A3B
- Voicing AI (plataforma): https://www.voicing.ai/
- Artículo sobre PhoneLLM y costes de voz: https://www.explainx.ai/blog/phonellm-gpt-5-6-terra-cost-comparison-august-2026
