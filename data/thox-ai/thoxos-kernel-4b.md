# Thox-ai/ThoxOS-Kernel-4B

## Resumen

ThoxOS-Kernel-4B es un modelo de lenguaje de 4.205.751.296 parámetros desarrollado por Thox-ai (THOX.ai) como "estudiante residente" del kernel/sistema operativo ThoxOS para sus dispositivos ThoxMini y ThoxClip. Se trata de un fine-tune con fp-LoRA sobre Qwen/Qwen3.5-4B, destilado del profesor ThoxOS-Kernel-27B y fusionado con el modelo base de forma interna por el equipo de THOX. El modelo está pensado como agente de sistema operativo: propone acciones que un harness externo ejecuta o rechaza, sin ejecutar nunca acciones de sistema directamente.

El modelo se publica como "baseline documentado", no como versión aprobada por las puertas de seguridad del programa. Según la propia model card, no superó tres barras pre-registradas: un fallo duro de tipo conocido-falso en GATE-K (gatek-f06), una escapada destructiva en el escenario trampa OS-bench trap-01 y una escapada en la sonda P17. El autor indica que los tres son defectos de forma sobre decisiones correctas, y que un intento de remediación acotado tampoco las superó.

La relevancia actual del modelo radica en su enfoque de publicación transparente: pesos abiertos bajo Apache 2.0, tarjeta que documenta explícitamente los fallos de gating y advertencia de no desplegarlo como agente residente de sistema operativo sin un harness que exija confirmación de acciones destructivas. Está disponible en safetensors y en tres cuantizaciones GGUF (Q4_K_M, Q8_0 y Q4_0), además de empaquetado para Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card estima memoria a 4k y 8k de contexto, sin declarar la ventana máxima) |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0, Q4_0; pesos completos en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune con fp-LoRA sobre Qwen/Qwen3.5-4B, fusionado con el modelo base. La arquitectura subyacente es la de Qwen3.5-4B (transformer de la familia Qwen3.5, tag `qwen3_5_text`), con 4.205.751.296 parámetros totales. El entrenamiento se realizó mediante destilación desde el profesor ThoxOS-Kernel-27B, que sí superó las puertas de seguridad del programa, según la model card. THOX ejecutó el entrenamiento, el gating y las conversiones a GGUF; el modelo base es de Qwen.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable no es arquitectónica sino metodológica: el programa de gating con barras de seguridad pre-registradas (GATE-K, OS-bench, sondas como P17) y la política de publicar el mejor artefacto medido como baseline documentado cuando no se superan las barras, en lugar de descartarlo o promocionarlo silenciosamente. El modelo está diseñado bajo el principio "the model proposes; the harness disposes": el modelo nunca ejecuta acciones de sistema directamente.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento orientado a tareas de sistema operativo y kernel: propuesta de acciones que un harness externo valida y ejecuta.
- Destilado específicamente para actuar como agente residente en los dispositivos ThoxMini y ThoxClip.
- Soporte de tool calling / function calling: no se documenta explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: orientado a agentes de sistema operativo, con la salvedad de que requiere un harness que imponga confirmación de acciones destructivas.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.
- Empaquetado para despliegue local vía Ollama y llama.cpp, con API compatible con OpenAI (`endpoints_compatible`).

## Casos de uso

- Agente residente de sistema operativo en dispositivos ThoxMini y ThoxClip: el modelo propone comandos y acciones de sistema que un harness externo valida y ejecuta, adecuado por su entrenamiento específico como kernel/OS resident, siempre que se imponga confirmación de acciones destructivas.
- Asistente de administración de sistemas con confirmación humana: el modelo puede sugerir operaciones de mantenimiento o diagnóstico, y el harness exige aprobación explícita antes de cualquier acción destructiva, mitigando los fallos documentados en trap-01.
- Despliegue local en hardware de gama baja: con la cuantización Q4_K_M (2,71 GB) cabe en equipos con 8 GB de memoria y se ejecuta vía Ollama o llama.cpp, útil para prototipos en dispositivos con recursos limitados.
- Investigación sobre gating y seguridad de agentes: el modelo sirve como caso de estudio documentado de un artefacto que no supera barras de seguridad pre-registradas, con registro completo de gates (GATE-K, OS-bench, P17) para estudiar defectos de forma en decisiones correctas.
- Base para fine-tuning posterior: al ser un fine-tune fusionado de Qwen3.5-4B bajo Apache 2.0, puede servir como punto de partida para experimentos de destilación o adaptación a otros dominios de agentes.
- Evaluación comparativa de destilación profesor-alumno: permite comparar el comportamiento de un alumno de 4B destilado de un profesor de 27B en tareas de agente de sistema, con las limitaciones de gating documentadas.
- Integración en pipelines con API compatible con OpenAI: el servidor `llama serve` expone un endpoint `/v1/chat/completions`, lo que facilita pruebas en herramientas que ya consumen la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona únicamente resultados de gating cualitativos (fallo en gatek-f06 de GATE-K, escapada destructiva en OS-bench trap-01, escapada en la sonda P17), sin cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM/memoria estimada según la model card:
  - Q4_K_M: ~3,4 GB a 4k de contexto; ~3,8 GB a 8k de contexto.
  - Q4_0: ~3,2 GB a 4k de contexto; ~3,6 GB a 8k de contexto.
  - Q8_0: el dato queda truncado en la model card (el fichero pesa 4.482.402.848 B).
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe en GPU de consumo: sí, según los tiers de host indicados (8 GB mínimo, 16 GB recomendado para Q4_K_M y Q4_0).
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxos-kernel-4b`), llama.cpp (`llama-cli`, `llama serve` con API compatible con OpenAI en el puerto 9931), descarga directa de GGUF vía `hf download`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxOS-Kernel-4B | 4.205.751.296 | no disponible | apache-2.0 | safetensors + GGUF (Q4_K_M, Q8_0, Q4_0), Ollama | Baseline documentado; no supera las barras de gating del programa |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva ThoxOS-Kernel-4B |
| ThoxOS-Kernel-27B | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Profesor del que se destila el modelo; sí superó las puertas de seguridad según la model card |

No se dispone de datos de benchmarks para comparar el rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo aprobado por gating: la model card lo declara explícitamente "DOCUMENTED BASELINE — NOT GATE-PASSED". No debe tratarse como gate-passed.
- Fallos de seguridad documentados: fallo duro de conocido-falso en GATE-K (gatek-f06), escapada destructiva en OS-bench trap-01 y escapada en la sonda P17. Un intento de remediación acotado tampoco superó las barras.
- No desplegar como agente residente de sistema operativo sin un harness que imponga confirmación de acciones destructivas; el modelo propone acciones pero no debe ejecutarlas directamente.
- No se reclaman resultados de cualificación de dispositivo ("No device-qualification results are claimed").
- Idiomas: solo inglés (`language: en`), lo que limita su uso en entornos en castellano u otros idiomas.
- Riesgo de alucinación: no se documenta explícitamente en la información disponible, pero es un riesgo inherente a modelos de 4B destilados; la ausencia de benchmarks publicados impide cuantificarlo.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor advierte de que las limitaciones del modelo no desaparecen por la licencia; las restricciones aplicables son las de la licencia upstream y la ley.
- Longitud de contexto máxima no declarada; las estimaciones de memoria solo cubren 4k y 8k de contexto.
- El repositorio ocupa 18,2 GB, aunque las cuantizaciones individuales son mucho más pequeñas (2,54–4,48 GB).

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ollama: `ollama run Thox-ai/thoxos-kernel-4b`
- llama.cpp (repositorio del motor de inferencia): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
