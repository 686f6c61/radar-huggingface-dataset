# TechnoBaptist/phonellm-alpha-1

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje de código abierto desarrollado por el equipo de Pipecat (Daily) para agentes de voz y llamadas telefónicas. Se trata de un fine-tune completo del modelo NVIDIA Nemotron 3 Nano 30B-A3B, entrenado con el framework NeMo de NVIDIA. Su objetivo principal es resolver dos problemas habituales en los agentes de voz: la latencia excesiva provocada por los tokens de razonamiento y la falta de precisión en la invocación de herramientas durante conversaciones largas y multiturno.

El modelo emplea una arquitectura híbrida Mamba-Transformer con mezcla de expertos (MoE), con 30 000 millones de parámetros totales y 3 500 millones activos, lo que permite una inferencia rápida y económica. Su ventana de contexto alcanza los 262 144 tokens, y está optimizado para funcionar con el razonamiento desactivado (`enable_thinking: false`), lo que reduce drásticamente el tiempo hasta el primer token de respuesta. Según sus desarrolladores, PhoneLLM rinde a la par que GPT 5.6 Terra en tareas de agente telefónico, pero con un coste un 94 % inferior y una latencia P95 de tiempo hasta el primer token 1300 ms menor.

La relevancia de este lanzamiento radica en la tendencia hacia modelos pequeños y especializados que superan a los modelos frontera en métricas de coste, velocidad y privacidad para casos de uso concretos. PhoneLLM se distribuye bajo licencia BSD 2-Clause, sin restricciones comerciales, y puede ejecutarse en infraestructura propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-Transformer, mixture-of-experts (MoE) |
| Parametros totales | 31 577 937 344 (30B nominales) |
| Parametros activos | 3 500 000 000 (3,5B) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | Inglés |
| Licencia | BSD 2-Clause (derivado de NVIDIA Nemotron Open Model License) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

PhoneLLM Alpha 1 es un fine-tune completo del modelo base NVIDIA Nemotron 3 Nano 30B-A3B, que combina capas de atención transformer con capas de espacio de estado Mamba en una configuración de mezcla de expertos. Esta arquitectura híbrida permite mantener una alta calidad de generación con un coste computacional reducido, ya que solo se activan 3,5B de los 30B parámetros en cada paso de inferencia.

El entrenamiento se realizó mediante supervisión de fine-tuning de parámetros completos (full-parameter SFT) utilizando el framework NVIDIA NeMo. Aunque no se especifica la composición exacta del dataset, el objetivo declarado es enseñar al modelo a invocar herramientas de forma precisa y en el momento adecuado, sin depender de tokens de razonamiento. Esta es una innovación clave: la mayoría de los modelos frontera requieren activar el modo de pensamiento para lograr un tool calling fiable, lo que introduce latencia. PhoneLLM está entrenado para funcionar con `temperature=0` y razonamiento desactivado, priorizando la velocidad y la determinismo en las llamadas a funciones.

## Capacidades

- Generación de texto conversacional optimizada para diálogos telefónicos multiturno.
- Tool calling y function calling preciso, entrenado para invocar las herramientas correctas en el momento adecuado sin necesidad de razonamiento explícito.
- Soporte de agentes y razonamiento multi-paso en conversaciones largas, gracias a su ventana de contexto de 262 144 tokens.
- Capacidades multilingües limitadas: el modelo está entrenado únicamente en inglés.
- Sin modo de pensamiento (thinking mode) recomendado; se desaconseja activarlo para mantener baja latencia.
- Compatible con frameworks de agentes de voz como Pipecat, que integran transcripción y síntesis de voz.

## Casos de uso

- Atención al cliente telefónica en servicios financieros: el modelo puede gestionar consultas sobre saldos, movimientos o bloqueo de tarjetas, invocando APIs bancarias mediante tool calling y manteniendo el contexto de la conversación durante llamadas largas.
- Soporte técnico en retail y hostelería: gestiona reservas, cambios de pedido o reclamaciones, llamando a sistemas de gestión internos y confirmando acciones con el usuario antes de ejecutarlas.
- Llamadas salientes de recordatorio: el agente contacta a clientes para recordar citas médicas o pagos pendientes, verificando la identidad y actualizando la base de datos mediante funciones específicas.
- Gestión de citas en clínicas y hospitales: el modelo puede consultar agendas, proponer horarios disponibles y confirmar citas, todo ello con baja latencia para mantener una conversación natural.
- Encuestas de satisfacción automatizadas: realiza llamadas de seguimiento postventa, formula preguntas y registra las respuestas en un CRM a través de tool calls.
- Agente de recepción virtual para hoteles: atiende llamadas de huéspedes para solicitar servicios (room service, limpieza, información), ejecutando las peticiones mediante integraciones con el sistema de gestión hotelera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los desarrolladores presentan un benchmark propio, PhoneBench v1, que evalúa la idoneidad de los modelos para agentes telefónicos, midiendo precisión, estilo de habla, latencia y coste por minuto. Según la model card, PhoneLLM obtiene una precisión comparable o superior a la mayoría de los modelos usados en producción para agentes de voz, con menor latencia y coste. Sin embargo, no se proporcionan cifras numéricas concretas en el texto disponible, por lo que no es posible presentar una tabla comparativa verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 63 GB (tamaño del repositorio), por lo que requiere una GPU con al menos 80 GB (A100/H100) o varias GPUs. Con cuantización a 4 bits, podría caber en una GPU consumer de 24 GB (RTX 4090), aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: NVIDIA A100 80GB, H100, o GPUs consumer de alta gama con cuantización (RTX 4090, RTX 6000 Ada).
- Al ser un modelo MoE con solo 3,5B parámetros activos, la inferencia es significativamente más rápida que un modelo denso de 30B, lo que lo hace viable para despliegues en tiempo real.
- Opciones de despliegue: vLLM o SGLang con las recetas de Nemotron 3 Nano, usando `trust_remote_code=True`. También es compatible con frameworks de agentes como Pipecat.
- Latencia y throughput: no se proporcionan valores absolutos, pero se indica que el P95 de tiempo hasta el primer token es 1300 ms inferior al de GPT 5.6 Terra, lo que sugiere una latencia muy baja para uso conversacional.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 | 30B | 3,5B | 262 144 | BSD 2-Clause | Agente de voz, tool calling |
| NVIDIA Nemotron 3 Nano 30B-A3B | 30B | 3,5B | 262 144 | NVIDIA Open Model | Modelo base generalista |
| GPT 5.6 Terra | no disponible | no disponible | no disponible | Propietaria | Modelo frontera generalista |

La comparativa se basa en las afirmaciones de la model card: PhoneLLM supera a GPT 5.6 Terra en coste (94 % más barato) y latencia (1300 ms menos en P95 TTFT) para tareas de agente telefónico, manteniendo una precisión comparable. Frente a su modelo base, Nemotron 3 Nano, PhoneLLM mejora específicamente la invocación de herramientas en conversaciones multiturno, como se ilustra en los ejemplos antes/después del fine-tuning. No se dispone de datos de otros modelos especializados en voz para una comparación más amplia.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que no es adecuado para agentes de voz en otros idiomas sin un fine-tuning adicional.
- Se recomienda desactivar el modo de pensamiento (`enable_thinking: false`) y usar `temperature=0`; activar el razonamiento puede degradar la latencia y no está optimizado.
- Aunque está entrenado para reducir las alucinaciones en tool calls, ningún modelo es inmune a invocar funciones incorrectamente en situaciones ambiguas; se recomienda validación externa en producción.
- La licencia BSD 2-Clause se aplica al modelo, pero al ser derivado de un trabajo bajo NVIDIA Nemotron Open Model License, es necesario revisar los términos de la licencia original para asegurar el cumplimiento.
- No se han publicado evaluaciones de sesgos o comportamientos nocivos; el uso en entornos sensibles (salud, finanzas) requiere pruebas adicionales.
- El tamaño del repositorio (63,2 GB) implica requisitos de almacenamiento y ancho de banda considerables para despliegues en edge.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/phonellm-alpha-1
- Model card original de Pipecat: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Modelo base NVIDIA Nemotron 3 Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Sitio de Pipecat: https://www.pipecat.ai/
- Sitio de Daily: https://www.daily.co/
