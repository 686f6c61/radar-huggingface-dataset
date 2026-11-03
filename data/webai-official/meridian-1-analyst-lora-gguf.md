# webAI-Official/Meridian-1-analyst-lora-GGUF

## Resumen

Meridian-1-analyst-lora-GGUF es un adaptador LoRA en formato GGUF para el modelo base webAI-Official/Meridian-1, un fine-tune de google/gemma-4-12B-it que conserva su arquitectura y nombres de tensores. El adaptador implementa la persona "analyst": un rol que realiza trabajo estructurado y cuantitativo sobre datos proporcionados por el usuario y devuelve artefactos (un objeto JSON con campos obligatorios) en lugar de prosa descriptiva. El repositorio contiene únicamente el adaptador, no los pesos completos del modelo, y está pensado para cargarse sobre un GGUF de Meridian-1 mediante llama.cpp.

El adaptador se entrenó originalmente sobre gemma-4-12B-it (versión PEFT disponible en webAI-Official/gemma-4-12b-it-analyst-lora-peft) y después se reajustó sobre Meridian-1 con una época adicional sobre los mismos 10.449 ejemplos, con el objetivo de recuperar el rendimiento perdido al cambiar de modelo base. La evaluación publicada por el autor, realizada con vLLM sobre los pesos PEFT (no con llama.cpp sobre el GGUF), muestra mejoras de hasta +31,1 puntos en la tasa de permanencia en el rol bajo presión adversarial y +21,4 puntos en la validez del sobre de salida de la persona.

El interés del modelo es acotado pero específico: sirve para construir asistentes de análisis que deban devolver JSON estructurado y mantenerse estrictamente dentro de un contrato de persona, con modo thinking activado y un presupuesto de generación de hasta 8.192 tokens nuevos. Su licencia no está declarada y el modelo base tiene un tamaño nominal de 12B, aunque el dato de safetensors del repo (65.011.712 parámetros) corresponde al adaptador, no al modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base: Meridian-1, fine-tune de google/gemma-4-12B-it) |
| Parametros totales | 65.011.712 (adaptador LoRA; el modelo base es de 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max seq len 8192) |
| Tipos de cuantizacion | f16 (único fichero publicado: Meridian-1-analyst-lora-f16.gguf, ~130 MB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA); versión PEFT en webAI-Official/Meridian-1-analyst-lora-peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj del modelo base. El entrenamiento se realizó en dos fases: primero SFT sobre 10.449 ejemplos durante 3 épocas con learning rate 1e-4 y longitud máxima de secuencia 8.192 (paso final 1.962, train loss 0,1747, eval loss 0,2093), seguido de DPO sobre 5.272 pares de preferencia con beta 0,1 y learning rate 5e-6. Los objetivos de SFT fueron las propias respuestas de google/gemma-4-12B-it con el prompt de rol, validadas contra el contrato de persona y la verdad de referencia (se conserva la más corta de las 4 que pasa); un 4% de las respuestas, para peticiones que nunca superaron las comprobaciones, provienen de Granite 4.2 30B con razonamiento inferior a 12.000 caracteres.

Posteriormente el adaptador se reajustó sobre Meridian-1 (sus pesos de modelo de lenguaje) durante 1 época sobre los mismos 10.449 ejemplos, con learning rate 2e-5 y partiendo del adaptador anterior (paso final 654, train loss 0,1956, eval loss 0,2099). La conversión a GGUF se hizo con el script convert_lora_to_gguf.py de llama.cpp (commit 5cdadfc). El adaptador activa el modo thinking (enable_thinking: true) tal como se entrenó.

## Capacidades

- Generación de salida estructurada: devuelve un único objeto JSON con los campos obligatorios persona, objective, method y artifacts, y los opcionales inputs_used, assumptions, unavailable y handoff.
- Trabajo analítico y cuantitativo sobre datos aportados por el usuario (cálculo, tabulación, resumen estructurado).
- Modo thinking activado de forma nativa, con presupuesto de hasta 8.192 tokens nuevos por generación.
- Permanencia estricta en el rol de analista, incluida la gestión de peticiones fuera de alcance (tasa de rechazo correcto del 55,6% en la suite del autor).
- Resistencia a presión adversarial para no salir del rol (78,3% en la evaluación del autor).
- No se documentan capacidades de tool calling, function calling, visión, audio ni multilingüismo específico; dependen del modelo base Meridian-1, sobre el que no se aportan datos en la información disponible.

## Casos de uso

- Asistentes de análisis financiero con salida JSON: el adaptador devuelve un objeto con method y artifacts, lo que permite consumir la respuesta directamente en un pipeline sin post-procesado de prosa; encaja en tareas de cálculo y tabulación sobre datos aportados.
- Extracción estructurada de métricas desde documentos: se envía el material como entrada y el modelo produce un JSON con inputs_used y assumptions, útil para auditoría de cálculos reproducibles.
- Automatización de informes cuantitativos: el campo artifacts permite devolver tablas o resultados intermedios en lugar de texto narrativo, adecuado para generación de reportes programáticos.
- Agentes de análisis con contrato de rol: la mejora de +31,1 puntos en permanencia bajo presión adversarial lo hace apto para entornos donde el modelo no debe salirse del dominio asignado.
- Rechazo explícito de peticiones fuera de alcance: el campo unavailable y la tasa de rechazo del 55,6% permiten construir flujos que distingan entre datos no disponibles y respuestas inventadas.
- Despliegue local con llama.cpp: al ser un adaptador de ~130 MB sobre un GGUF de Meridian-1, se puede servir con llama-server y --jinja en infraestructura propia, con posibilidad de ajustar la fuerza del adaptador mediante --lora-scaled.
- Evaluación de contratos de persona: la suite de 720 casos retenidos publicada por el autor sirve como referencia para validar asistentes con requisitos estrictos de formato y rol.

## Benchmarks y rendimiento

Evaluación del autor sobre Meridian-1 con los pesos PEFT en vLLM (no con llama.cpp sobre el GGUF), 720 casos retenidos, muestreo a temperatura 1.0, top-p 0.95 y top-k 64. Porcentajes.

| Métrica | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) |
|---|---:|---:|---:|
| Tasa de paso global del contrato | 78,1 | 58,1 | +20,0 |
| Sobre de salida de persona válido | 93,2 | 71,8 | +21,4 |
| Tareas en alcance superadas | 90,6 | 77,8 | +12,8 |
| Rechazo correcto de peticiones fuera de alcance | 55,6 | 50,0 | +5,6 |
| Permanece en rol bajo presión adversarial | 78,3 | 47,2 | +31,1 |
| Peticiones generales gestionadas en rol | 87,8 | 57,2 | +30,6 |
| Coincide con la respuesta de referencia | 92,6 | 84,8 | +7,8 |

| Tarea | Adaptador | Meridian-1 (con prompt de rol) | Ganancia (pts) | Intervalo 95% | Ítems |
|---|---:|---:|---:|---|---:|
| Precisión TAT-QA | 91,0 | 88,0 | +3,0 | +0,0 a +6,5 | 200 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador ocupa ~130 MB en f16; el requisito real lo marca el GGUF de Meridian-1 (12B) sobre el que se carga.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; depende de la cuantización del GGUF de Meridian-1 elegida (el ejemplo del autor usa Meridian-1-Q8_0.gguf).
- GPU recomendadas: no disponibles; el autor solo documenta el uso con llama.cpp y, para la evaluación, vLLM con los pesos PEFT.
- Despliegue: llama-server con -m Meridian-1-Q8_0.gguf --lora Meridian-1-analyst-lora-f16.gguf --jinja; el ajuste de fuerza del adaptador se hace con --lora-scaled.
- Latencia y throughput: no disponibles.
- El autor indica que el adaptador aún no se ha probado con llama.cpp sobre Meridian-1; la evaluación publicada procede de vLLM con los pesos PEFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Meridian-1-analyst-lora-GGUF | Adaptador LoRA (base 12B) | no disponible | GGUF | no disponible | Persona analyst con salida JSON; evaluación vLLM |
| Meridian-1-analyst-lora-peft | Adaptador LoRA (base 12B) | no disponible | PEFT | no disponible | Mismos pesos en formato PEFT; usado en la evaluación |
| gemma-4-12b-it-analyst-lora-peft | Adaptador LoRA (base 12B) | no disponible | PEFT | no disponible | Versión original entrenada sobre google/gemma-4-12B-it, antes del reajuste sobre Meridian-1 |
| google/gemma-4-12B-it | 12B | no disponible | no disponible | no disponible | Modelo base de Meridian-1; sin adaptador de persona |

No se dispone de datos de benchmarks comparativos con modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está fuera de su distribución de entrenamiento si no se envía el system prompt exacto documentado, incluido el salto de línea antes de "Respond with a single JSON object.".
- El modo thinking debe activarse (enable_thinking: true) tal como se entrenó; desactivarlo puede degradar el cumplimiento del contrato.
- La tasa de rechazo correcto de peticiones fuera de alcance es del 55,6%, es decir, cerca de la mitad de las peticiones fuera de alcance no se rechazan correctamente.
- La evaluación publicada procede de vLLM con los pesos PEFT y no de llama.cpp con el GGUF; el propio autor advierte que aún no se ha probado con llama.cpp sobre Meridian-1.
- Licencia no declarada: no hay base para asumir uso comercial permitido; debe verificarse en el modelo base y en el adaptador.
- Idiomas soportados no disponibles; no se documenta comportamiento multilingüe.
- Riesgo de alucinación en las respuestas de referencia: parte de los objetivos de SFT (4%) provienen de Granite 4.2 30B para peticiones que no superaron las comprobaciones de calidad.
- El repositorio solo contiene el adaptador; requiere descargar por separado un GGUF de Meridian-1, cuyo tamaño y requisitos de hardware no se detallan.
- Sin datos de sesgos conocidos en la información disponible.

## Enlaces

- HuggingFace (adaptador GGUF): https://huggingface.co/webAI-Official/Meridian-1-analyst-lora-GGUF
- Modelo base Meridian-1: https://huggingface.co/webAI-Official/Meridian-1
- Versión PEFT del adaptador: https://huggingface.co/webAI-Official/Meridian-1-analyst-lora-peft
- Adaptador original sobre gemma-4-12B-it: https://huggingface.co/webAI-Official/gemma-4-12b-it-analyst-lora-peft
- Modelo base de google: https://huggingface.co/google/gemma-4-12B-it
