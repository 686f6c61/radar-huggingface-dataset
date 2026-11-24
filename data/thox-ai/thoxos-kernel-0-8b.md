# Thox-ai/ThoxOS-Kernel-0.8B

## Resumen

ThoxOS-Kernel-0.8B es un modelo de lenguaje de 752 millones de parámetros (0,8B) desarrollado por THOX.ai, un fine-tune mediante fp-LoRA sobre Qwen/Qwen3.5-0.8B y destilado del modelo profesor ThoxOS-Kernel-27B. Su propósito es actuar como "estudiante" de triaje de kernel y sistema operativo dentro del ecosistema ThoxOS, clasificando y enrutando peticiones de sistema, ejecutando diagnósticos de primera línea y respondiendo consultas fundamentadas en runbooks. Está dimensionado para ejecutarse en el hardware propio de la compañía: ThoxAir y el paquete host ThoxKey.

El modelo se publica con licencia Apache 2.0, pesos en safetensors y tres cuantizaciones GGUF (Q4_K_M, Q8_0, Q4_0), y está disponible en Ollama. Su relevancia radica en su tamaño reducido (apto para dispositivos de borde) combinado con una especialización vertical clara: no es un modelo generalista, sino un componente de triaje dentro de una arquitectura mayor donde "el modelo propone y el arnés dispone", es decir, nunca ejecuta acciones de sistema directamente.

El autor advierte de una divergencia de medición en curso: la ejecución original de GATE49 (1 de noviembre de 2026) arrojó 37/49, mientras que una remedición sobre la ruta normalizada (8 de noviembre de 2026) con los pesos publicados arrojó 27/49. Ambos resultados se mantienen publicados y el caso está bajo revisión, lo que debe tenerse en cuenta al evaluar el modelo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5_text), fine-tune fp-LoRA fusionado sobre Qwen/Qwen3.5-0.8B |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | safetensors (fp), GGUF Q4_K_M, GGUF Q8_0, GGUF Q4_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5, y se obtiene mediante un fine-tune con fp-LoRA que posteriormente se fusiona en los pesos base. El entrenamiento se realizó internamente en THOX.ai, incluyendo la conversión a GGUF. La supervisión proviene de destilación desde ThoxOS-Kernel-27B, el modelo profesor de la misma familia, ya validado contra la compuerta de evaluación GATE49.

La especialización es de dominio: triaje de kernel y sistema operativo, clasificación y enrutamiento de peticiones, diagnósticos de primera línea y respuestas fundamentadas en runbooks. El diseño operativo separa explícitamente la propuesta del modelo de la ejecución de acciones: el modelo nunca ejecuta acciones de sistema por sí mismo, sino que emite recomendaciones que un arnés externo valida y ejecuta. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional orientada a triaje de sistema operativo y kernel.
- Clasificación y enrutamiento de peticiones de sistema (OS-task bench reportado en la evaluación original).
- Diagnósticos de primera línea y respuestas fundamentadas en runbooks.
- Escalado de casos fuera del alcance del triaje hacia pares ThoxMini o ThoxClip.
- Postura de rechazo (refusal posture) medida en la ejecución de evaluación del 1 de noviembre de 2026.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Triaje de incidencias en dispositivos de borde: el modelo clasifica y enruta peticiones de kernel y sistema operativo en ThoxAir y ThoxKey, derivando lo que excede su alcance a pares de mayor capacidad o al profesor de 27B. Su tamaño de 0,8B permite ejecución local sin depender de la nube.
- Diagnóstico de primera línea en soporte técnico: responde consultas fundamentadas en runbooks, lo que reduce el tiempo de resolución de incidencias recurrentes y libera a los operadores humanos para casos complejos.
- Asistente de operaciones en el host pack ThoxKey: integrado mediante Ollama con la cuantización Q4_K_M (529 MB), puede residir permanentemente en el dispositivo y atender consultas de sistema con baja huella de memoria.
- Enrutamiento dentro de una arquitectura multi-agente: al emitir solo propuestas que un arnés valida y ejecuta, encaja como primer eslabón de una cadena donde ThoxMini o ThoxClip asumen el razonamiento de mayor profundidad.
- Despliegue en pipelines de CI/CD para validación de configuraciones: el modelo puede clasificar solicitudes de cambio y señalar las que requieren revisión humana antes de aplicarse, siempre bajo supervisión del arnés.
- Evaluación e investigación de destilación: al ser un estudiante de un profesor de 27B con resultados de compuerta publicados y una divergencia de medición documentada, sirve como caso de estudio reproducible sobre la fiabilidad de la destilación en modelos sub-1B.
- Prototipado en hardware de recursos limitados: las cuantizaciones Q4_0 (501 MB) y Q4_K_M (529 MB) permiten experimentar con llama.cpp u Ollama en equipos consumer sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Fecha / notas |
|---|---|---|
| GATE49 | 37/49 | Ejecución original, 2026-11-01 |
| GATE49 (ruta normalizada) | 27/49 | Remedición sobre pesos publicados, 2026-11-08; divergencia bajo revisión |
| GATE-K | Medido en la ejecución del 2026-11-01 | Resultados reportados en la sección Evaluation de la model card |
| Sondas P16/P17 | Medidas en la ejecución del 2026-11-01 | Resultados reportados en la sección Evaluation de la model card |
| OS-task bench | Medido en la ejecución del 2026-11-01 | Resultados reportados en la sección Evaluation de la model card |
| Refusal posture | Medida en la ejecución del 2026-11-01 | Resultados reportados en la sección Evaluation de la model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se reclaman resultados de cualificación de dispositivo: el modelo no está cualificado para hardware ThoxAir.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_0 (501 MB), 0,53 GB con Q4_K_M (529 MB), 0,81 GB con Q8_0 (812 MB) y 1,5 GB con safetensors fp (1.504.827.608 bytes), sin contar overhead de contexto y runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con al menos 2 GB de VRAM libre es suficiente para las cuantizaciones GGUF.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxos-kernel-0.8b`), llama.cpp (`llama-cli` con los GGUF), descarga directa de GGUF vía `hf download`. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-0.8B | 752 M | No disponible | Apache 2.0 | Triaje de kernel/OS, destilado de un profesor de 27B | Hugging Face, Ollama, GGUF |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | No disponible en la información proporcionada | Generalista | Hugging Face |
| ThoxOS-Kernel-27B (modelo profesor) | 27B | No disponible | No disponible en la información proporcionada | Triaje de kernel/OS, superó GATE49 | Ecosistema THOX (no se detalla disponibilidad pública) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Divergencia de medición sin resolver: GATE49 pasó de 37/49 a 27/49 en la remedición normalizada; el rendimiento real en producción es incierto hasta que se cierre la revisión.
- El modelo no está cualificado para hardware ThoxAir; no se reclaman resultados de cualificación de dispositivo.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Especialización estrecha: está entrenado para triaje de kernel y OS, por lo que su rendimiento en tareas generales será inferior al de su modelo base.
- Riesgo de alucinación en respuestas sobre runbooks y diagnósticos: el diseño exige que un arnés externo valide y ejecute cualquier acción, y el modelo nunca debe ejecutar acciones de sistema directamente.
- Sesgos conocidos: no se documentan en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse los términos de la licencia del modelo base Qwen/Qwen3.5-0.8B, cuyos detalles no se incluyen en la información proporcionada.
- La model card incluye material promocional (campaña de Kickstarter) y notas del fundador que no constituyen especificaciones técnicas; conviene separar ese contenido de la evaluación técnica.
- El repositorio tiene 0 likes y 1745 descargas en el momento de la consulta, lo que indica una adopción todavía limitada y poca validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=hf-thoxos-kernel-0-8b
