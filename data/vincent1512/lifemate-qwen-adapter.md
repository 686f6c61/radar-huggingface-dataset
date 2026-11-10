# vincent1512/lifemate-qwen-adapter

## Resumen

LifeMate Qwen Adapter es un adaptador LoRA (r=16, alpha=32) publicado por el usuario vincent1512 sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Está entrenado para la tarea LifeMate del Zalo AI Challenge 2026: un agente que, en cada turno, emite una única llamada a herramienta en formato JSON o una señal de parada. El adaptador se concibe como complemento del modelo de reconocimiento de voz vincent1512/lifemate-phowhisper-large-ft, de modo que el sistema completo recibe audio, lo transcribe y planifica acciones mediante tool calling.

El entrenamiento combina transcripciones limpias con transcripciones ruidosas generadas por modelos PhoWhisper-large, lo que busca robustez frente a errores típicos de ASR en vietnamita. El repositorio ocupa 0,1 GB y contiene pesos en safetensors compatibles con PEFT; no se publican métricas de benchmarks ni detalles sobre el volumen de datos de entrenamiento.

Por su naturaleza de adaptador, no es un modelo autónomo: requiere cargar Qwen3-4B-Instruct-2507 y aplicar el LoRA encima, o bien fusionarlo en pesos fp16 mediante el script scripts/merge_for_submission.py del repositorio de código del autor. Es relevante para quienes construyen agentes de voz en vietnamita con presupuesto de cómputo ajustado, ya que el base de 4B parámetros permite despliegue en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador; el base Qwen3-4B-Instruct-2507 tiene 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA; el adaptador se puede fusionar en fp16) |
| Idiomas soportados | vietnamita (tag del repositorio); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4B parámetros. La tarea LifeMate se formula como un agente por turnos: el modelo debe producir exactamente una llamada a herramienta en JSON o una señal de parada, lo que convierte el problema en una generación estructurada y restringida. El entrenamiento se realizó con QLoRA, según los tags del repositorio, y mezcló transcripciones limpias con transcripciones ruidosas sintetizadas por modelos PhoWhisper-large para que el agente tolere errores de reconocimiento de voz.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla la estrategia de enmascaramiento de pérdida ni el formato exacto del esquema JSON de las llamadas a herramienta. La innovación principal declarada es la combinación de datos limpios y ruidosos de ASR para robustez en un pipeline de voz a agente.

## Capacidades

- Generación de llamadas a herramienta en formato JSON, una por turno, con señal explícita de parada.
- Tool calling / function calling orientado a agentes de múltiples pasos.
- Razonamiento de tipo agente: planificación paso a paso guiada por el resultado de cada herramienta.
- Robustez frente a transcripciones ASR ruidosas en vietnamita, gracias a la mezcla de datos limpios y ruidosos.
- Integración con reconocimiento de voz mediante el modelo complementario vincent1512/lifemate-phowhisper-large-ft.
- Capacidades generales de texto y razonamiento heredadas del base Qwen3-4B-Instruct-2507 (no verificadas específicamente para este adaptador).
- Capacidades multilingües: solo el vietnamita está declarado en los tags; el resto no disponible.

## Casos de uso

- Agentes de voz para atención al cliente en vietnamita: el pipeline transcribe audio con PhoWhisper-large-ft y el adaptador decide la siguiente acción (consultar pedido, escalar a humano, cerrar conversación) emitiendo una llamada JSON por turno.
- Automatización de tareas domésticas o de asistente personal: el modelo encadena herramientas (calendario, recordatorios, búsqueda) y termina con la señal de parada cuando la tarea está resuelta.
- Integración en centros de contacto con ruido ambiental: la mezcla de datos con ASR ruidoso reduce el impacto de transcripciones imperfectas en la decisión de la herramienta.
- Prototipado rápido de agentes sobre GPU de consumo: al ser un LoRA sobre un base de 4B, permite iterar en una única GPU consumer con cuantización del base.
- Investigación en robustez ASR + LLM: sirve como punto de comparación para estudiar cómo el ruido de transcripción afecta la precisión de tool calling en vietnamita.
- Despliegue embebido o edge: fusionando el adaptador en fp16 y cuantizando el modelo resultante, puede ejecutarse en entornos con VRAM limitada para asistentes de voz offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa ~0,1 GB; el base Qwen3-4B-Instruct-2507 requiere aproximadamente 8 GB en fp16 y ~2,5-3 GB en cuantización de 4 bits (estimación orientativa, no publicada por el autor).
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para fp16; GPUs consumer de 8-12 GB para el base cuantizado.
- Cabe en GPU consumer: sí, con el base cuantizado (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: PEFT + transformers, vLLM (tras fusionar el adaptador), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LifeMate Qwen Adapter (este) | LoRA sobre base 4B | no disponible | Tool calling para agente de voz en vietnamita | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la informacion | Instrucción general | Apache 2.0 | Hugging Face |
| Adaptadores LoRA genéricos para tool calling sobre Qwen | variable | variable | Tool calling general | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base Qwen3-4B-Instruct-2507 y PEFT, o fusión previa, para funcionar.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad del tool calling.
- El adaptador está especializado en la tarea LifeMate; fuera de ese esquema puede degradar el comportamiento general del base.
- Idiomas: solo el vietnamita está declarado; el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación en la generación de JSON: puede producir llamadas malformadas o herramientas inexistentes si el esquema no se valida externamente.
- Sin datos sobre sesgos, composición del dataset ni filtrado de datos personales en las transcripciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del base Qwen3-4B-Instruct-2507 y de los datos de entrenamiento no publicados.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni mantenimiento observable.
- Dependencia de un modelo de ASR complementario específico (PhoWhisper-large-ft) para el caso de uso de voz.

## Enlaces

- Hugging Face: https://huggingface.co/vincent1512/lifemate-qwen-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo de ASR complementario: https://huggingface.co/vincent1512/lifemate-phowhisper-large-ft
- Repositorio de código con scripts/merge_for_submission.py: no disponible (no se proporciona URL en la información disponible)
