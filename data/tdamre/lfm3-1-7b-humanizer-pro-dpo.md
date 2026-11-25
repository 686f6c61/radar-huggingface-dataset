# Tdamre/LFM3-1.7B-Humanizer-Pro-DPO

## Resumen

LFM3-1.7B-Humanizer-Pro-DPO es un adaptador PEFT (LoRA) publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B. Su propósito es la edición de prosa procedimental en inglés: reescribir pasajes para mejorar su claridad preservando íntegramente los hechos, cifras, condiciones, incertidumbres y responsables mencionados en el texto original. No es un modelo completo, sino un conjunto de pesos de adaptador de rango bajo que debe cargarse sobre el modelo base pinneado en una revisión concreta.

El adaptador se entrenó mediante optimización de preferencias directa (DPO) sobre 32 tripletas factuales de edición, con dos épocas y 64 actualizaciones totales. La completitud preferida preserva los hechos de origen y la rechazada introduce un error factual deliberado, de modo que el entrenamiento empuja al modelo hacia la fidelidad informativa frente a la reescritura creativa. El adaptador tiene rango 8, alpha 16, beta 0.1 y learning rate 2e-5.

La relevancia de esta ficha es acotada: se trata de un experimento de autor individual, con cero descargas y cero likes en el momento de la consulta, y con una evaluación de muestra muy pequeña (ocho avisos, 64 afirmaciones). Es útil como referencia metodológica de DPO aplicado a edición factual, pero sus resultados publicados no respaldan un uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | No disponible (adaptador; el base tiene 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base LFM3-1.7B; no especificada en la información) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales, no documentadas aquí) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 8 |
| Alpha LoRA | 16 |
| Beta DPO | 0.1 |
| Learning rate | 0.00002 |
| Semilla | 41927 |
| Epocas / actualizaciones | 2 épocas / 64 actualizaciones |
| Revision del base | 0dc4268b561499c648c7ba7c9466bf3d8d01517a |
| SHA-256 del adaptador | 634fae0f3d64206c9eb375296714f38ee34da6926bae2c9628e327cf78466418 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B, un transformer de 1.7B parámetros del que esta ficha no dispone de detalles arquitectónicos internos más allá de su identificador y revisión. El adaptador en sí es un LoRA de rango 8 y alpha 16, entrenado con DPO sobre 32 tripletas originales de edición factual. Cada tripleta contiene una completitud preferida que preserva los hechos del texto fuente y una rechazada que incorpora un error factual deliberado. El modelo de referencia congelado es la revisión pinneada del base original.

El entrenamiento se ejecutó durante dos épocas, con 64 actualizaciones totales, learning rate 2e-5, beta 0.1 y semilla 41927. Los pesos del adaptador se copiaron sin cambios desde la primera ejecución de entrenamiento completada, y su integridad se documenta con el SHA-256 indicado. El entorno probado es Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0; la carga del adaptador en CPU está verificada para esta versión. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Edición de prosa procedimental en inglés: reescritura de pasajes para mejorar claridad preservando hechos, números, condiciones, incertidumbres y responsables.
- Generación de texto condicionada por plantilla de chat con rol de sistema y rol de usuario.
- Modo de generación determinista documentado (`do_sample=False`, `max_new_tokens=384`).
- Soporte de plantilla de chat del tokenizer del base con `enable_thinking=False`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni otras modalidades.

## Casos de uso

- Edición de avisos y comunicaciones corporativas: el adaptador está pensado para reescribir avisos procedimentales manteniendo cifras, condiciones y responsables; encaja en flujos de revisión de textos legales o de cumplimiento donde la fidelidad factual es crítica.
- Normalización de documentación técnica interna: se puede aplicar a pasajes de procedimientos para mejorar legibilidad sin alterar parámetros ni pasos, siempre con revisión humana posterior.
- Preprocesado en pipelines de publicación: como paso previo a la revisión editorial, para proponer una versión más clara de un borrador que luego valida un editor.
- Investigación sobre DPO aplicado a fidelidad factual: el repositorio de entrenamiento público permite reproducir el experimento y estudiar cómo DPO penaliza errores factuales en tareas de edición.
- Evaluación de adaptadores de bajo rango sobre modelos pequeños: útil como caso de estudio de LoRA rango 8 sobre un base de 1.7B en tareas de reescritura controlada.
- Prototipado de asistentes de edición en inglés: para experimentar con instrucciones de sistema que exigen preservación de hechos, sin garantías de producción.

## Benchmarks y rendimiento

La model card publica una comparación fija de ocho avisos en inglés, evaluada con revisión asistida por modelo y ciega, sin evaluador humano independiente. Los resultados son los siguientes:

| Medida | Resultado |
|---|---|
| Pasajes totalmente aceptables | 1 / 8 |
| Afirmaciones fuente preservadas | 56 / 64 |
| Objetivos de edición requeridos cumplidos | 2 / 6 |
| Entradas copiadas tras normalizar espacios | 0 / 8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La comparación de ocho avisos es de muestra pequeña y el propio autor la describe como tal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un base de 1.7B, la VRAM vendrá determinada por el base y su cuantización, no por el adaptador.
- GPU recomendadas: no disponibles en la información; el autor solo verifica la carga del adaptador en CPU.
- Compatibilidad con GPU de consumo: no documentada; dependerá del base LFM3-1.7B y de la cuantización elegida.
- Opciones de despliegue: carga vía PEFT + Transformers con `PeftModel.from_pretrained`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles; el autor indica que el rendimiento de generación depende del dispositivo disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros adaptadores de edición factual sobre LFM3-1.7B en la información proporcionada. La comparación más directa es con el modelo base sin adaptador, pero no se publican métricas del base en la misma prueba de ocho avisos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-DPO (este) | Adaptador sobre base 1.7B | No disponible | LFM Open License v1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.7B | No disponible | LFM Open License v1.0 | Hugging Face |
| Otros adaptadores de edición factual | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Muestra de evaluación muy pequeña: ocho avisos y 64 afirmaciones, sin evaluador humano independiente; los resultados no son concluyentes.
- Solo un pasaje de ocho resultó totalmente aceptable y solo dos de seis objetivos de edición se cumplieron, lo que sugiere fiabilidad limitada.
- Riesgo de alucinación factual: aunque el entrenamiento DPO penaliza errores deliberados, la evaluación muestra 8 de 64 afirmaciones no preservadas.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- Es un adaptador, no un modelo autónomo: requiere el base LiquidAI/LFM3-1.7B en la revisión exacta pinneada para un comportamiento reproducible.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial y para la redistribución de derivados.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- Entorno de referencia muy específico (PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2); pueden aparecer incompatibilidades con otras versiones.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-DPO
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Código de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/preference
- Protocolo y resultados de la comparación: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
- Repositorio del proyecto: https://github.com/adybag14-cyber/Humanizer-pro
