# Tdamre/LFM3-1.7B-Humanizer-Pro-Minimal

## Resumen

LFM3-1.7B-Humanizer-Pro-Minimal es un adaptador LoRA experimental publicado por el usuario Tdamre sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por Liquid AI. Su proposito es la edicion de prosa procedimental en ingles: reescribir pasajes para mejorar la claridad preservando integramente los hechos, cifras, condiciones, incertidumbres y responsables mencionados en el texto original. No es un modelo de proposito general, sino un ajuste fino muy acotado para una tarea de edicion de texto.

El adaptador se entrena con un conjunto extremadamente reducido: 32 ejemplos de correcciones singulares en concordancia, redundancia y puntuacion, durante una sola epoca y 32 actualizaciones. Usa LoRA de rango 8 sobre las proyecciones q_proj y v_proj, con alpha 16 y tasa de aprendizaje 0.00003. El modelo base LFM3-1.7B es un transformer de 1.700 millones de parametros de Liquid AI, con licencia LFM Open License v1.0.

La relevancia de esta ficha es limitada y debe enmarcarse como lo que es: un experimento reproducible de bajo coste con receta y codigo publicos, no un modelo listo para produccion. El propio autor documenta una evaluacion a pequena escala con revisores automaticos (no humanos) y reconoce que el adaptador tiende a copiar la entrada en lugar de editarla en varios casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables (rango 8 sobre q_proj y v_proj) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el ejemplo de carga usa bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el transformer LFM3-1.7B de Liquid AI, congelado en la revision `0dc4268b561499c648c7ba7c9466bf3d8d01517a`. El entrenamiento consiste en una LoRA de rango 8 y alpha 16 sobre las proyecciones de query y value (q_proj, v_proj), con objetivo de entropia cruzada supervisada solo sobre los tokens de destino (target-only cross-entropy). Se realizo una epoca con 32 actualizaciones, tasa de aprendizaje 0.00003 y semilla 57422, sobre 32 ejemplos de correcciones singulares en concordancia, redundancia y puntuacion.

Los pesos del adaptador se copiaron sin cambios desde la primera ejecucion de entrenamiento completada, con SHA-256 `59e89c7c1e8b004d319657f9be8fd4147b1e1b86ceb7cd9e57c4ce2f74fa41cf`. El entorno probado es Python 3.12, PyTorch 2.13.0, Transformers 5.22.2, PEFT 0.21.2, Accelerate 1.15.0 y Safetensors 0.8.0; la carga del adaptador en CPU esta verificada. No se documentan innovaciones arquitectonicas propias mas alla del ajuste LoRA; el modelo base emplea `trust_remote_code=True` para su carga.

## Capacidades

- Edicion de prosa procedimental en ingles para mejorar la claridad preservando hechos.
- Preservacion explicita de cifras, condiciones, incertidumbres y responsables segun las instrucciones del system prompt del autor.
- Generacion de texto condicionada por plantilla de chat (`apply_chat_template`) con `enable_thinking=False`.
- Salida restringida a la revision del pasaje, sin anadir hechos (segun la instruccion recomendada).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue: solo ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Revision de avisos y textos procedimentales en ingles: el adaptador recibe un pasaje y devuelve una version editada con instrucciones de preservar todos los hechos; adecuado para normalizar la claridad de avisos internos.
- Correccion de concordancia y puntuacion en documentacion tecnica corta: el entrenamiento se centro en correcciones singulares de concordancia, redundancia y puntuacion, por lo que encaja en pasajes breves con errores puntuales.
- Preprocesado de textos antes de publicacion: puede usarse como paso de limpieza en un pipeline editorial, siempre con revision humana posterior dado el riesgo de copia de la entrada.
- Experimentacion academica sobre edicion controlada de texto: la receta, el codigo y los pesos son publicos, lo que permite reproducir y estudiar el comportamiento de un LoRA de muy bajo coste.
- Prototipado de asistentes de edicion con restricciones factuales: sirve para probar system prompts que exigen preservacion de cifras y condiciones antes de invertir en modelos mayores.
- Evaluacion de detectores de texto IA: el autor documenta un caso de observacion con GPTZero y Pangram, util para estudiar como los detectores clasifican texto editado o copiado.

## Benchmarks y rendimiento

El autor publica una comparacion fija de ocho avisos en ingles, evaluada con revision asistida por modelos (sin evaluador humano independiente), sobre 64 afirmaciones factuales:

| Medida | Resultado |
|---|---|
| Pasajes plenamente aceptables | 5 / 8 |
| Afirmaciones de origen preservadas | 64 / 64 |
| Objetivos de edicion requeridos cumplidos | 3 / 6 |
| Entradas copiadas tras normalizar espacios | 5 / 8 |

Ademas, en una observacion fija con detectores, el modelo copio literalmente un pasaje de 220 palabras sobre un observatorio; GPTZero 5.0b le asigno 0 % de probabilidad de autoria humana y 100 % de IA, y Pangram 4.1 le asigno 100 % de cobertura de IA. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 1.700 millones de parametros y el ejemplo de carga usa bfloat16, lo que orientativamente requiere varios GB de VRAM, pero no se confirma en la informacion.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no confirmado en la informacion; la carga del adaptador en CPU esta verificada.
- Opciones de despliegue: PEFT + Transformers (procedimiento documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el autor indica que el rendimiento de generacion depende del dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Humanizer-Pro-Minimal | 1.700 M (base) + LoRA | no disponible | Edicion de prosa en ingles (LoRA) | LFM Open License v1.0 | Hugging Face (adaptador PEFT) |
| LiquidAI/LFM3-1.7B | 1.700 M | no disponible | Modelo base de proposito general | LFM Open License v1.0 | Hugging Face |
| Alternativas de edicion de texto de 1-2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores de edicion de texto en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 32 ejemplos y una epoca: capacidad de generalizacion muy limitada y alto riesgo de sobreajuste.
- Tendencia documentada a copiar la entrada: 5 de 8 pasajes se copiaron tras normalizar espacios, y solo se cumplieron 3 de 6 objetivos de edicion requeridos.
- Evaluacion con revisores automaticos, sin evaluador humano independiente: los resultados deben interpretarse con cautela.
- Solo ingles: no hay soporte multilingue documentado.
- Riesgo de alucinacion y de anadir afirmaciones no soportadas, aunque el autor exige preservar hechos en el system prompt.
- Licencia LFM Open License v1.0: revisar las condiciones para uso comercial antes de desplegar en produccion.
- No recomendado para produccion sin revision humana y sin validacion en el dominio concreto de uso.
- Sin datos publicados de contexto maximo, cuantizacion ni rendimiento en GPU.

## Enlaces

- Hugging Face: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Minimal
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Codigo de entrenamiento: https://github.com/adybag14-cyber/Humanizer-pro/tree/main/lfm3/supervised
- Protocolo y resultados de la comparacion: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md
- Comparacion con detectores: https://github.com/adybag14-cyber/Humanizer-pro/blob/main/lfm3/comparison/RESULTS.md#fixed-live-detector-comparison
- Licencia: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Minimal/blob/main/LICENSE
- Atribucion: https://huggingface.co/Tdamre/LFM3-1.7B-Humanizer-Pro-Minimal/blob/main/NOTICE
