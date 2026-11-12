# victorbennett/Verdin-4B-v1.2

## Resumen

Verdin-4B v1.2 es un modelo de decisión tipada desarrollado por el usuario victorbennett y publicado en Hugging Face. No es un modelo generativo de texto al uso: recibe un estado y una pregunta con opciones nombradas y devuelve una probabilidad para cada opción, además de una cabeza adicional para el caso "desconocido". Su función es, por tanto, clasificar y puntuar alternativas dentro de lo que el autor denomina Decision Index (DI), en lugar de redactar respuestas.

El modelo se construye a partir de Qwen/Qwen3.5-4B mediante un ajuste LoRA de rango 16 (learning rate 5e-5, una época, semilla 0) sobre 256.153 filas públicas renderizadas en formato DI. Tras el entrenamiento, el adaptador LoRA se fusiona con la base y se convierte al runtime propietario `verdin` en bf16. El repositorio ocupa 8,5 GB e incluye pesos, código de servicio y resultados de evaluación.

Su relevancia actual reside en el enfoque: frente a la tendencia general de usar LLM generativos para tareas de decisión, Verdin-4B plantea una arquitectura de salida estructurada con calibración explícita y una suite pública de evaluación (0.3) con 140.178 peticiones, lo que permite reproducir y auditar el rendimiento declarado (índice 61,40 / raw 70,85).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B) con cabezas de decisión tipada y runtime propio `verdin` |
| Parametros totales | 4B (heredados de la base Qwen3.5-4B; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_state 262.144; max_branch 263.168; max_packed 524.288 (capacidad declarada, sin truncamiento) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `verdin-c1s-262k/` con pesos y config); runtime `verdin` en bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (commit `851bf6e8`) y se ajusta con LoRA de rango 16, learning rate 5e-5 y una sola época sobre 256.153 filas públicas renderizadas en el formato del Decision Index. El adaptador se fusiona en los pesos base y el conjunto se convierte al runtime `verdin`, que expone la lógica de decisión tipada. La innovación principal no está en la arquitectura del transformer subyacente, sino en la interfaz de salida: en lugar de generar tokens, el modelo produce un logit por cada opción nombrada en la pregunta, más una cabeza "unknown".

El despliegue se realiza mediante `verdin.server` en el endpoint `/v1/systemone`, con parámetros `--attn-chunk-mb 1024 --max-batch-tokens 16384 --prefix-cache 0` y `KEV_STATE_BIDIR=8192`. La calibración aplica un único prior sobre nombres de opción: las opciones cuya clave es exactamente `NONE` reciben un desplazamiento de logit δ = T·ln(0,0067) con temperatura de cabeza T = 1,7411 (`KEV_NONE_MULT_EFF=0.0067`, compensada por temperatura). No se eliminan opciones ni se truncan prompts, y las probabilidades permanecen normalizadas. No se documentan detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Decisión tipada: asigna una probabilidad a cada opción nombrada de una pregunta dado un estado de entrada.
- Cabeza "unknown": detecta y puntúa casos en los que ninguna opción es adecuada.
- Manejo de estados largos: capacidad declarada de hasta 262.144 tokens de estado y 524.288 tokens empaquetados.
- Salida estructurada y calibrada: probabilidades normalizadas con prior explícito sobre la opción `NONE`.
- Procesamiento por lotes: soporte de batching hasta 16.384 tokens por lote.
- No genera texto libre: no es un modelo de chat ni de completado de texto.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Enrutamiento de consultas en sistemas de soporte: dado un estado con el histórico de conversación y una pregunta con opciones de departamento (facturación, técnico, comercial), el modelo devuelve la probabilidad de cada ruta y permite umbralizar o derivar a la opción `unknown` cuando ninguna encaja.
- Clasificación de intenciones con opciones abiertas: en un asistente conversacional, se define un conjunto de intenciones con nombre y el modelo puntúa cada una sobre el estado acumulado, aprovechando su capacidad de manejar estados de hasta 262.144 tokens.
- Triaje de incidencias: en un pipeline de monitorización, el estado contiene logs y metadatos y las opciones son categorías de severidad o equipo responsable; la salida probabilística permite priorizar con umbrales configurables.
- Selección de herramienta en un pipeline de agentes: aunque no hace tool calling directo, puede usarse como clasificador previo que decide qué herramienta o flujo invocar, con la cabeza `unknown` como salvaguarda ante casos no cubiertos.
- Moderación y etiquetado con opciones nombradas: clasificar contenido en categorías predefinidas con probabilidad por categoría, útil cuando se requiere una distribución calibrada en lugar de una etiqueta única.
- Evaluación de políticas de decisión: al devolver probabilidades normalizadas y disponer de una suite pública de 140.178 peticiones, sirve para comparar y calibrar políticas de decisión en entornos controlados antes de desplegar reglas en producción.

## Benchmarks y rendimiento

| Suite | Peticiones | Cobertura | Indice | Raw |
|---|---|---|---|---|
| Public 0.3 | 140.178 | 1,0 | 61,40 | 70,85 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los resultados completos están en el directorio de ejecución `runs/di-c1s-eff/scores.json` del dataset `victorbennett/verdin-v1.2-results`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con pesos en bf16 y base de 4B, el modelo requiere del orden de 8-9 GB solo para pesos, más memoria para el estado (hasta 262.144 tokens) y el batching (16.384 tokens por lote), lo que puede elevar el consumo sustancialmente.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) sería el rango razonable para estados largos.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) para estados cortos; no confirmado por el autor.
- Opciones de despliegue: runtime propietario `verdin` mediante `verdin.server` (endpoint `/v1/systemone`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verdin-4B v1.2 | 4B | 262.144 (estado) | Probabilidades por opción + unknown | no disponible | Hugging Face (repo público) |
| Qwen3.5-4B (base) | 4B | no disponible | Texto generativo | no disponible | Hugging Face |
| Clasificadores BERT de decisión | 0,1-0,3B típico | 512-8.192 | Etiqueta única / logits | variable | Hugging Face |

No se dispone de datos de rendimiento comparables de alternativas en la información proporcionada; la comparativa se limita a parámetros, contexto y tipo de salida.

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas en texto libre ni mantener conversaciones; su uso está restringido a decisiones con opciones nombradas.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de integrarlo en producción.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés de entrenamiento.
- Riesgo de alucinación estructural: al asignar probabilidades a opciones, puede favorecer opciones plausibles pero incorrectas; la cabeza `unknown` mitiga parcialmente este riesgo, pero no lo elimina.
- Calibración dependiente del prior `NONE`: el desplazamiento de logit sobre la opción `NONE` está ajustado con una temperatura concreta (T = 1,7411); cambios en el runtime o en la temperatura alteran las probabilidades.
- Runtime propietario: el despliegue requiere el código `verdin` incluido en el repo; no hay soporte estándar de ecosistemas como vLLM o llama.cpp, lo que limita la portabilidad.
- Estado largo con coste de memoria: aunque se declaran 262.144 tokens de estado, el consumo de VRAM y la latencia en ese régimen no están documentados.
- Sin benchmarks estándar: los únicos resultados publicados son de la suite propia del autor, lo que dificulta la comparación independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victorbennett/Verdin-4B-v1.2
- Dataset de resultados: https://huggingface.co/datasets/victorbennett/verdin-v1.2-results
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponible
