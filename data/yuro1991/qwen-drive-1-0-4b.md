# Yuro1991/Qwen-Drive-1.0-4B

## Resumen

Qwen-Drive-1.0-4B es un modelo visión-lenguaje (VLM) orientado a conducción autónoma, publicado en Hugging Face por el usuario Yuro1991 y construido sobre el modelo base Qwen/Qwen3.5-4B. El repositorio contiene los pesos y configuraciones en formato Hugging Face, con un informe técnico asociado (arXiv:2609.00111) y código en el repositorio QwenLM/Qwen-Drive-1.0.

El modelo conserva sin modificar la arquitectura del VLM preentrenado Qwen3.5 y le añade dos módulos externos: un cabezal de percepción BEV que realiza detección 3D de objetos, predicción de ocupación semántica y segmentación de mapas BEV; y un Planning Expert que, condicionado a las representaciones del VLM, genera trayectorias futuras del ego mediante flow matching. El VLM original sigue respondiendo preguntas en lenguaje natural sobre la escena de conducción.

Su relevancia está en unificar percepción 3D, respuesta visual a preguntas (VQA) y planificación de movimiento en un único marco, con un recetario de entrenamiento por etapas que combina datos de conducción con datos generales de visión-lenguaje para mitigar el olvido catastrófico. El total de parámetros publicados en safetensors es de 4.539.265.536 (aproximadamente 4,54 mil millones) y el repositorio ocupa 13,8 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer multimodal (base Qwen3.5-4B) + cabezal BEV externo (detección 3D, ocupación semántica, segmentación de mapa BEV) + Planning Expert con flow matching |
| Parametros totales | 4.539.265.536 (≈ 4,54 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors en precisión de entrenamiento (13,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B (finetune) |
| Variantes de planificador | planner-sft (planificación directa y con razonamiento), planner-rl (optimizado por recompensa) |
| Fecha de publicación | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El punto de partida es el VLM nativamente multimodal Qwen3.5-4B, cuya arquitectura se mantiene intacta. Sobre él se acoplan dos componentes: (1) un cabezal de percepción BEV externo que actúa como sonda 3D explícita e inspeccionable y que aprende conjuntamente detección 3D, predicción de ocupación semántica y segmentación de mapas BEV; y (2) un Planning Expert que consume las representaciones del VLM compartido y genera trayectorias futuras del ego mediante flow matching. El VLM sin modificar se encarga de responder preguntas de formato libre sobre la escena.

El entrenamiento sigue un recetario por etapas que unifica etiquetas entre distintos conjuntos de datos de conducción, reescribe respuestas, filtra muestras por consistencia y combina supervisión de conducción con datos generales de visión-lenguaje, de modo que el modelo adquiere competencia específica de dominio sin perder comprensión visual general ni capacidad de seguir instrucciones. Las anotaciones unificadas de trayectoria permiten entrenamiento conjunto sobre varios conjuntos públicos de conducción. Se publican dos planificadores: `planner-sft`, que soporta planificación directa y con razonamiento, y `planner-rl`, optimizado con recompensa sobre NAVSIM PDMS, WOD-E2E RFS y un término de desplazamiento, que funciona mejor en modo de planificación con razonamiento. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Percepción 3D: detección de objetos en 3D, predicción de ocupación semántica y segmentación de mapas en vista BEV mediante el cabezal externo.
- Planificación de movimiento: generación de trayectorias futuras del ego con flow matching, en modo directo y en modo con razonamiento.
- Respuesta visual a preguntas (VQA) sobre escenas de conducción en lenguaje natural, gracias al VLM subyacente sin modificar.
- Comprensión visual e instrucciones de propósito general, preservadas mediante el entrenamiento mixto con datos de visión-lenguaje.
- Capacidad conversacional (etiqueta `conversational` en el repositorio).
- Optimización por recompensa en la variante `planner-rl`, entrenada sobre NAVSIM PDMS, WOD-E2E RFS y un término de desplazamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el modo de planificación con razonamiento de los planificadores es lo más cercano descrito.
- Capacidades multilingües: no disponible.
- Capacidades de audio o voz: no disponibles.

## Casos de uso

- Percepción 3D en vehículo autónomo: el cabezal BEV produce detección de objetos, ocupación semántica y segmentación de mapa en una sola pasada compartiendo la representación del VLM, lo que permite alimentar módulos de predicción y planificación con una salida 3D inspeccionable.
- Planificación de trayectorias en bucle abierto: el Planning Expert genera trayectorias del ego evaluadas en WOD-E2E, con resultados de RFS de 7,95 en validación para la variante SFT y 8,45 para la variante RL.
- Evaluación en bucle cerrado sobre NAVSIM: la variante `planner-rl` está optimizada sobre PDMS, por lo que es la adecuada para experimentos de planificación con métricas de simulación cerrada.
- Anotación y auditoría de escenas de conducción: el VLM puede responder preguntas libres sobre imágenes o clips de conducción, útil para generar descripciones, etiquetas y revisiones cualitativas de conjuntos de datos.
- Asistente de razonamiento para decisiones de conducción: el modo de planificación con razonamiento permite obtener justificaciones textuales junto a la trayectoria, útil en depuración de fallos y en sistemas de explicabilidad para validación interna.
- Investigación en VLM de dominio específico: sirve como caso de estudio de adaptación de un VLM general a conducción mediante entrenamiento por etapas con datos mixtos, para medir olvido catastrófico y transferencia entre dominios.
- Prototipado de sistemas de conducción extremo a extremo: al mantener intacta la arquitectura del VLM base, se puede reutilizar infraestructura de transformers ya existente para el componente lingüístico y conectar los módulos de percepción y planificación como cabezas adicionales.
- Generación de trayectorias dentro de simuladores: las anotaciones unificadas de trayectoria permiten entrenar y evaluar con varios conjuntos públicos, lo que facilita comparaciones entre entornos de simulación.

## Benchmarks y rendimiento

Los datos disponibles en la model card son parciales (la tabla aparece truncada). Se reproducen únicamente los valores publicados:

| Benchmark | AutoVLA | MindVLA-U1 | Qwen-Drive-1.0-SFT | Qwen-Drive-1.0-RL |
|---|---|---|---|---|
| WOD-E2E RFS val/test (↑) | --/7,56 | 8,20/7,87 | 7,95/7,78 | 8,45/7,91 |
| WOD-E2E ADE 5s val/test (↓) | --/2,96 | 2,28/2,66 | no disponible (tabla truncada) | no disponible (tabla truncada) |

La tabla original incluye además las columnas SpanVLA, Alpamayo-1.5 y SimWAM_IL, cuyos valores no están disponibles en la información proporcionada, así como bloques de evaluación en bucle pseudo-cerrado y bucle cerrado que no se han podido recuperar. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros publicado (4,54 B) y del tamaño del repositorio (13,8 GB), no medidas oficiales.

- VRAM para inferencia en bf16/fp16: aproximadamente 9,1 GB solo para los pesos del VLM; sumando encoder visual, cabezal BEV y Planning Expert, el repositorio completo ocupa 13,8 GB, por lo que se recomienda reservar del orden de 16 GB o más incluyendo activaciones.
- VRAM estimada en 8 bits: del orden de 5 a 7 GB para los pesos.
- VRAM estimada en 4 bits: del orden de 3 a 4 GB, siempre que se generen cuantizaciones propias, ya que el repositorio no publica versiones cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en servidor; RTX 4090/3090 (24 GB) para inferencia en bf16 con margen; RTX 4080 (16 GB) queda muy ajustada en bf16 y requeriría cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en bf16 y en tarjetas de 16 GB o menos si se aplica cuantización (no publicada).
- Opciones de despliegue: la librería declarada es transformers; el repositorio incluye la etiqueta `endpoints_compatible`, orientada a endpoints de inferencia compatibles con el Hub. vLLM, TGI, llama.cpp u Ollama no están confirmados en la documentación disponible; llama.cpp y Ollama requerirían pesos GGUF que no se publican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa limitada a los modelos que aparecen en la tabla de planificación de la model card. No se dispone de número de parámetros, contexto ni licencia de las alternativas en la información proporcionada.

| Modelo | Tipo | WOD-E2E RFS val/test (↑) | WOD-E2E ADE 5s val/test (↓) | Parámetros | Licencia |
|---|---|---|---|---|---|
| Qwen-Drive-1.0-RL | VLM + percepción BEV + Planning Expert (RL) | 8,45/7,91 | no disponible | 4,54 B | Apache 2.0 |
| Qwen-Drive-1.0-SFT | VLM + percepción BEV + Planning Expert (SFT) | 7,95/7,78 | no disponible | 4,54 B | Apache 2.0 |
| MindVLA-U1 | VLM para conducción | 8,20/7,87 | 2,28/2,66 | no disponible | no disponible |
| AutoVLA | VLM para conducción | --/7,56 | --/2,96 | no disponible | no disponible |
| SpanVLA | VLM para conducción | no disponible | no disponible | no disponible | no disponible |
| Alpamayo-1.5 | VLM para conducción | no disponible | no disponible | no disponible | no disponible |
| SimWAM_IL | VLM para conducción | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio está publicado por el usuario Yuro1991 y no por la organización QwenLM, aunque la model card remite al repositorio oficial de código. Conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- Los datos de benchmarks están truncados en la información disponible: no se pueden evaluar los resultados en bucle pseudo-cerrado ni en bucle cerrado, ni el resto de métricas de la tabla.
- No se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantización, lo que dificulta planificar despliegues con requisitos concretos de memoria o multilingüismo.
- Al ser un modelo de dominio muy específico (conducción), es esperable un rendimiento inferior al del VLM base en tareas generales fuera de ese ámbito, pese al entrenamiento mixto destinado a mitigar el olvido catastrófico.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos visión-lenguaje al describir escenas o justificar decisiones de planificación.
- Sesgos conocidos: no documentados. Los sesgos de los datos de conducción (geografía, condiciones meteorológicas, tipo de vía, hora del día) pueden trasladarse al modelo.
- El uso comercial está permitido por la licencia Apache 2.0, pero la licencia del modelo base Qwen/Qwen3.5-4B debe respetarse igualmente; consúltese su ficha para condiciones adicionales.
- Uso en producción crítica: se trata de un modelo de investigación. Las evaluaciones publicadas son en bucle abierto y en simulación; no hay evidencia de validación en vehículo real ni certificaciones de seguridad funcional.
- No hay información sobre latencia ni throughput, datos imprescindibles para cualquier despliegue en tiempo real embarcado.
- Los resultados de búsqueda web devueltos para este modelo no contienen enlaces relevantes (corresponden a un servicio de imprenta alemán sin relación alguna), por lo que no se ha podido ampliar la información más allá de la model card.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/Yuro1991/Qwen-Drive-1.0-4B
- Informe técnico (arXiv): https://arxiv.org/abs/2609.00111
- Repositorio de código, demo y documentación: https://github.com/QwenLM/Qwen-Drive-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo.
