# tfwe/soc-triage-lora-r16

## Resumen

`soc-triage-lora-r16` es un adaptador LoRA (Low-Rank Adaptation) de tipo SFT (supervised fine-tuning) desarrollado por el usuario `tfwe` sobre el modelo base `unsloth/Qwen3.5-4B`. Su función es recibir un resumen normalizado de alertas de seguridad procedente de múltiples fabricantes (syslog, Snort, ASA, Zeek, Windows XML, bash) y devolver exactamente un objeto JSON con una decisión de triaje (`BLOCK_IP`, `ISOLATE_HOST` o `IGNORE`), un nivel de confianza, una justificación y citas de evidencia copiadas literalmente del texto de entrada.

El adaptador se enmarca en el ámbito de la seguridad operativa (SOC, Security Operations Center) y está pensado como un filtro de primera pasada para un analista humano, no como un sistema autónomo de bloqueo o aislamiento. Al ser un adaptador PEFT de rango 16 y bf16, el repositorio ocupa apenas 0,1 GB, lo que lo hace muy ligero de distribuir y desplegar sobre el modelo base de 4B parámetros.

La relevancia actual del modelo radica en su enfoque de triaje estructurado con evidencia citable, un patrón que reduce el riesgo de alucinación en tareas de seguridad y facilita la auditoría de las decisiones. Sin embargo, la información pública disponible es muy escasa: no se publican cifras de benchmarks en la model card y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | bf16 en entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA | 16 (alpha = 32) |
| Modulos adaptados | Proyecciones de atención y MLP |
| Modelo base | unsloth/Qwen3.5-4B |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/Qwen3.5-4B`, un transformer de 4B parámetros, mediante LoRA con rango 16 y alpha 32, aplicado a las proyecciones de atención y MLP. El entrenamiento se realizó en precisión bf16 durante 3 épocas sobre una única GPU RTX 5070 Ti con 16 GB de VRAM, con semilla fija 20261125. La elección de LoRA de bajo rango mantiene el coste de entrenamiento y el tamaño del artefacto muy reducidos, lo que permite iterar rápidamente sobre el conjunto de datos.

El conjunto de entrenamiento consta de 194 registros de chat: 61 etiquetados como `BLOCK_IP`, 66 como `ISOLATE_HOST` y 67 como `IGNORE`, lo que supone un reparto razonablemente equilibrado entre las tres clases. Los datos provienen del split de desarrollo de CIC-IDS2017 y Bot-IoT (14 casos) más 180 escenarios sintéticos multi-fabricante que cubren syslog, Snort, ASA, Zeek, Windows XML y bash. Según la model card, no se entrena sobre ningún caso de holdout ni caso dorado, lo que preserva la validez de la evaluación posterior.

La innovación técnica principal no está en la arquitectura, sino en el formato de salida: el modelo debe devolver un único objeto JSON con decisión, confianza, justificación y citas de evidencia literales del input. Este diseño obliga al modelo a anclar su razonamiento en el texto de entrada y facilita la verificación automática de la validez del JSON y del recall de citas.

## Capacidades

- Triaje de alertas de seguridad: clasifica un resumen normalizado de alerta en una de tres decisiones (`BLOCK_IP`, `ISOLATE_HOST`, `IGNORE`).
- Salida estructurada en JSON: produce un único objeto JSON con decisión, confianza, justificación y citas de evidencia.
- Citación de evidencia literal: extrae fragmentos del input copiados textualmente para respaldar la decisión.
- Procesamiento multi-fabricante: entrenado con formatos de syslog, Snort, ASA, Zeek, Windows XML y bash.
- Generación de texto conversacional: heredada del modelo base Qwen3.5-4B (pipeline `text-generation`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no especifica idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Filtro de primera pasada en un SOC: el adaptador recibe alertas ya normalizadas y descarta o prioriza casos antes de que lleguen al analista humano, reduciendo la carga de triaje manual. Es adecuado porque su salida estructurada permite automatizar el enrutamiento sin intervención adicional.
- Enriquecimiento de tickets de incidentes: la justificación y las citas de evidencia pueden adjuntarse directamente al ticket para que el analista verifique la decisión sin releer toda la alerta original.
- Automatización de playbooks de respuesta: la decisión `BLOCK_IP` o `ISOLATE_HOST` puede disparar acciones semi-automáticas tras aprobación humana, gracias a que el modelo cita la evidencia que sustenta cada sugerencia.
- Evaluación comparativa frente a reglas deterministas: el repositorio companion incluye una línea base de reglas, por lo que el adaptador sirve para medir si el aprendizaje supera a la heurística clásica en falsos positivos y detecciones perdidas.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador de 0,1 GB sobre un base de 4B, se puede desplegar en una GPU de consumo (la model card menciona una RTX 5070 Ti de 16 GB para el entrenamiento) y probar en local antes de escalar.
- Investigación en triaje asistido por LLM: el esquema de salida con evidencia citable y la separación entre holdout público y casos dorados lo convierten en un banco de pruebas reproducible para estudiar fiabilidad y alucinación en tareas de seguridad.
- Normalización y armonización de alertas multi-fabricante: al haberse entrenado con seis formatos distintos, puede emplearse como capa de unificación semántica antes de un motor de correlación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras de evaluación (accuracy, tasa de falsos positivos, tasa de detecciones perdidas, validez del JSON y recall de citas de evidencia sobre 45 casos retenidos) residen en `eval/results/` del repositorio de GitHub y no se incluyen en la tarjeta para evitar desviaciones respecto a los ficheros de resultados comprometidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador se entrenó en bf16 sobre una RTX 5070 Ti de 16 GB, lo que da una referencia del orden de magnitud para el modelo base de 4B en bf16.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamaño del modelo base (4B), es plausible su ejecución en GPUs de consumo, pero no se confirma en la documentación.
- Cabe en GPU de consumo: probablemente sí, dado que el entrenamiento se hizo en una RTX 5070 Ti de 16 GB; no obstante, no se detalla el modo de despliegue en inferencia.
- Opciones de despliegue: la librería indicada es `peft` con `transformers`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tfwe/soc-triage-lora-r16 | Adaptador LoRA sobre 4B | No disponible | Triaje SOC con salida JSON y evidencia | MIT | Hugging Face |
| Modelo base unsloth/Qwen3.5-4B | 4B | No disponible | LLM generalista | No disponible en esta ficha | Hugging Face |
| Reglas deterministas (línea base del repo companion) | No aplica | No aplica | Heurística de triaje | No disponible | Repositorio GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- No es una autorización autónoma: la model card indica explícitamente que las salidas son sugerencias con evidencia citada y que no deben usarse como base única para bloquear o aislar.
- Dependencia del esquema de entrada: el modelo espera el esquema JSON normalizado descrito en `DESIGN.md` del repositorio; entradas fuera de ese formato pueden degradar la calidad de la salida.
- Volumen de entrenamiento reducido: 194 registros, de los cuales 180 son sintéticos, lo que limita la cobertura de escenarios reales y aumenta el riesgo de sobreajuste a los patrones sintéticos.
- Riesgo de alucinación: aunque el diseño exige citas literales, no se publican métricas de recall de citas en la model card, por lo que no puede confirmarse la fiabilidad del anclaje de evidencia.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo.
- Limitaciones de idioma: no disponible; la model card no especifica idiomas soportados.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero conviene verificar la licencia del modelo base `unsloth/Qwen3.5-4B`, no incluida en esta información.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Cifras de evaluación fuera de la tarjeta: los resultados dependen de ficheros externos en GitHub, lo que impide verificar el rendimiento sin acceder al repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tfwe/soc-triage-lora-r16
- Repositorio companion (evaluación y DESIGN.md): https://github.com/tfwe/soc-triage-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
