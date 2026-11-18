# yashkavaiya/gemma-3-12b-it-gujarati-mcq-lora

## Resumen

El modelo `yashkavaiya/gemma-3-12b-it-gujarati-mcq-lora` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 con aproximadamente 65,5 millones de parámetros entrenables, construido sobre el modelo base `unsloth/gemma-3-12b-it`, que a su vez es un espejo sin restricciones de acceso de `google/gemma-3-12b-it`. Lo desarrolla el usuario de Hugging Face yashkavaiya y está orientado a tareas de elección múltiple (multiple choice) y seguimiento de instrucciones en guyaratí, con soporte secundario de inglés.

El problema que pretende resolver es la adaptación del modelo Gemma 3 de 12 000 millones de parámetros al dominio del guyaratí mediante ajuste fino eficiente en parámetros (PEFT), sin necesidad de reentrenar el modelo completo. Sin embargo, el propio autor advierte en la model card que el adaptador no aporta mejoras medibles sobre el modelo base: las diferencias en Belebele-gu y MMLU-gu no son estadísticamente significativas. Además, el entrenamiento se detuvo de forma prematura tras solo 98 de los 1 245 pasos planificados (aproximadamente el 8 %, unos 1 570 ejemplos), por lo que se trata de un adaptador parcialmente entrenado.

Por su relevancia práctica, este modelo debe considerarse un artefacto de investigación más que una herramienta de producción: documenta de forma transparente un experimento de ajuste fino sobre TPU con resultados negativos y sirve como referencia metodológica para quien quiera reproducir o continuar el trabajo. La información disponible sobre arquitectura interna, contexto y cuantizaciones del adaptador es limitada y se detalla a continuación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 3 (modelo base `unsloth/gemma-3-12b-it`) |
| Parámetros totales | No disponible para el adaptador; el modelo base Gemma 3 12B tiene 12 000 millones (dato del nombre del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Parámetros entrenables del adaptador | ~65,5 millones (rango 16, alpha 16) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada; el adaptador se entrenó y evaluó en bf16 |
| Idiomas soportados | Guyaratí (gu) e inglés (en) |
| Licencia | Gemma Terms of Use y Gemma Prohibited Use Policy |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 16, sin dropout, sobre las proyecciones de atención y MLP de las capas de texto del modelo base Gemma 3 12B, que permanece congelado en bf16. Los pesos LoRA y el estado de AdamW se mantienen en fp32. El entrenamiento se realizó sobre Kaggle TPU v5e-8 con torch_xla SPMD, batch efectivo de 16 y una tasa de aprendizaje máxima de 1,5e-4. El plan original contemplaba 1 245 pasos (una época), pero la sesión de TPU alcanzó su límite de tiempo y el adaptador se guardó tras solo 98 pasos, con la tasa de aprendizaje aún sin decaer (en torno a 1,49e-4). El archivo `train_log.json` refleja `truncated_at: 98`.

El conjunto de datos de entrenamiento lo componen aproximadamente 19 900 ejemplos abiertos en guyaratí construidos mediante el pipeline sft2: BoolQ-gu, IndicXNLI-gu, ARC-gu, COPA-gu, IndicQA-gu, Aya-gu, IndicAlign y la partición de desarrollo de MMLU-Indic-gu. Se aplicó deduplicación por n-gramas de 8 y por pregunta exacta para eliminar solapamientos con los ítems de evaluación de Belebele y MMLU-Indic. Los ejemplos de elección múltiple emplean el mismo prompt que la evaluación, con la letra de respuesta como objetivo. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto y respuesta a instrucciones en guyaratí e inglés, heredadas del modelo base Gemma 3 12B.
- Resolución de preguntas de elección múltiple en formato de letra (A, B, C, D), que es el formato para el que se ajustó el adaptador.
- Razonamiento básico y conocimiento factual en guyaratí, limitado por el alcance del ajuste fino parcial.
- Soporte de conversación multi-turno (capacidad del modelo base, no específicamente entrenada en este adaptador).
- Capacidades potenciales del modelo base Gemma 3 (visión, tool calling, contexto largo) no verificadas ni evaluadas para este adaptador.
- No se documenta soporte específico de agentes, multi-step reasoning ni thinking mode para el adaptador.

## Casos de uso

- Investigación sobre ajuste fino eficiente en parámetros (PEFT) en lenguas de bajos recursos: el adaptador sirve como caso documentado de un experimento LoRA sobre TPU con resultados negativos y métricas transparentes, útil para estudiar qué no funciona y por qué.
- Evaluación comparativa de adaptadores en guyaratí: permite reproducir los experimentos de Belebele-gu y MMLU-gu y comparar con el modelo base y con el LoRA anterior sobre Gemma-4-E4B-it.
- Punto de partida para continuar el entrenamiento: dado que solo se ejecutaron 98 de 1 245 pasos, el adaptador puede reanudarse o reiniciarse con una planificación de recursos adecuada.
- Docencia y formación en ajuste fino: ilustra el flujo completo de construcción de datos (BoolQ-gu, IndicXNLI-gu, ARC-gu, etc.), deduplicación y evaluación con intervalos de confianza bootstrap.
- Evaluación de sensibilidad de script en guyaratí: permite estudiar la brecha de precisión entre escritura guyaratí y devanagari (21,2 puntos en Belebele-gu y 12,5 en MMLU-gu), un fenómeno relevante para el diseño de sistemas multilingües.
- Referencia para pipelines de datos multilingües: el pipeline sft2 y la estrategia de deduplicación por 8-gramas son reutilizables en otros proyectos de adaptación lingüística.

## Benchmarks y rendimiento

Resultados en TPU con pesos bf16 y argmax sobre logits de letra. Belebele-gu con n=900 ítems y MMLU-gu con n=1000 ítems, intervalos de confianza del 95 % por bootstrap pareado (B=4000). Todas las puntuaciones se obtuvieron en la misma sesión con los mismos prompts.

| Modelo | Belebele-gu | MMLU-gu |
|---|---|---|
| Este adaptador (Gemma-3-12B-it + LoRA, 98 pasos) | 83,2 | 55,5 |
| Gemma-3-12B-it sin adaptador | 82,9 | 56,3 |
| LoRA anterior en Gemma-4-E4B-it | 75,6 | 48,0 |

Diferencias pareadas con IC del 95 %:

| Comparación | Belebele-gu | MMLU-gu |
|---|---|---|
| Adaptador vs LoRA anterior en E4B | +7,7 [4,9; 10,4] (significativa) | +7,5 [4,3; 10,9] (significativa) |
| Adaptador vs Gemma-3-12B-it sin adaptador | +0,3 [-1,0; 1,7] (no significativa) | -0,8 [-2,8; 1,3] (no significativa) |

Sensibilidad de script (precisión en escritura guyaratí menos la misma pregunta en devanagari): adaptador 21,2 [18,0; 24,6] en Belebele-gu y 12,5 [9,3; 15,8] en MMLU-gu; Gemma-3-12B-it sin adaptador 22,3 [19,1; 25,6] y 12,1 [8,8; 15,2]. El adaptador no reduce la brecha.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,3 GB (tamaño del repositorio), pero requiere cargar el modelo base Gemma 3 12B completo para su uso.
- VRAM estimada para el modelo base: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 12 000 millones de parámetros en bf16 requiere del orden de 24 GB solo para pesos, más memoria para activaciones y caché KV; en cuantización de 4 bits se reduce aproximadamente a 7-8 GB, aunque estas cifras no están confirmadas en la documentación del adaptador.
- GPU recomendadas: no especificadas en la información disponible. El entrenamiento se realizó en TPU v5e-8; la evaluación, en TPU en bf16.
- Compatibilidad con GPU de consumo: no confirmada para este adaptador; depende de la viabilidad de ejecutar el modelo base Gemma 3 12B en la GPU concreta.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` con `AutoModelForImageTextToText` y `peft.PeftModel`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Belebele-gu | MMLU-gu | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (Gemma-3-12B-it + LoRA) | ~65,5 M entrenables sobre base de 12B | No disponible | 83,2 | 55,5 | Gemma | Hugging Face (repo público) |
| Gemma-3-12B-it sin adaptador | 12B | No disponible | 82,9 | 56,3 | Gemma | Hugging Face (espejo `unsloth`) |
| LoRA anterior en Gemma-4-E4B-it | No disponible | No disponible | 75,6 | 48,0 | No disponible | No disponible |

## Limitaciones y advertencias

- No aporta mejoras estadísticamente significativas sobre el modelo base Gemma-3-12B-it; el autor recomienda usar el modelo base salvo que exista una razón concreta para emplear el adaptador.
- Entrenamiento truncado: solo 98 de 1 245 pasos planificados (aproximadamente el 8 %, unos 1 570 ejemplos), con la tasa de aprendizaje sin decaer. Es un adaptador parcialmente entrenado, no un ajuste fino completo de una época.
- No corrige la sensibilidad de script del guyaratí: la brecha entre escritura guyaratí y devanagari es tan grande como en el modelo base.
- La precisión cae bruscamente cuando las mismas preguntas se escriben en devanagari o en guyaratí romanizado.
- Entrenado y orientado al formato de letra de elección múltiple; no se espera una mejora en generación abierta.
- La evaluación cubre únicamente Belebele-gu y MMLU-gu, no otros dominios como física u otros contenidos; no se ha probado en seguridad.
- Riesgo de sesgos y alucinaciones heredado del modelo base Gemma 3 12B, no evaluado específicamente para este adaptador.
- Restricciones de licencia: es un derivado de Gemma y está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; quien redistribuya el adaptador o modelos derivados debe transmitir estas condiciones.
- Los conjuntos de datos de entrenamiento conservan sus propias licencias, listadas en el registro de construcción de sft2.
- Las métricas en bf16 sobre TPU no coincidirán exactamente con evaluaciones en 4 bits o fp16 sobre GPU.
- Uso previsto: investigación en tareas de elección múltiple en guyaratí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yashkavaiya/gemma-3-12b-it-gujarati-mcq-lora
- Modelo base (espejo): https://huggingface.co/unsloth/gemma-3-12b-it
- Modelo base original de Google: https://huggingface.co/google/gemma-3-12b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Predicciones por ítem: `results_g3-12b-gu-mcq-tpu.json` (en el repositorio del modelo)
- Comparaciones completas: `compare_tpu.json` (en el repositorio del modelo)
- Registro de entrenamiento: `train_log.json` (en el repositorio del modelo)
