# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed123

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `google/gemma-4-E4B-it` para la tarea de citation discovery (descubrimiento de citas) del taller SCIDOCA 2025. El adaptador actúa como un scorer pointwise que, dado un parrafo y una posible referencia, estima la probabilidad de que esa cita sea la correcta. Lo publica el usuario `yennhi0907` como ejecucion suplementaria, no incluida en los resultados de su tesis, y se mantiene para posibles experimentos de seguimiento.

El modelo no es un LLM autonomo, sino un adaptador de bajo rango que modifica las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del transformer Gemma-4 E4B. El entrenamiento se realizo sobre el conjunto completo de entrenamiento limpio de SCIDOCA 2025 (47.166 parrafos) con una longitud maxima de 512 tokens y hasta tres negativos por parrafo. El resultado es un artefacto de 0,1 GB que requiere el modelo base para funcionar.

Su relevancia es acotada: se trata de un experimento reproducible (semilla 123, hiperparametros documentados, hashes SHA-256 de los ficheros) orientado a la evaluacion de sistemas de recomendacion de citas cientificas. No aporta un modelo generalista nuevo, sino un ajuste fino especializado con licencia Gemma y dependencia estricta del modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Gemma-4 E4B) |
| Parametros totales | no disponible (adaptador de bajo rango; el base es `google/gemma-4-E4B-it`) |
| Parametros activos | no disponible (el base no se documenta como MoE en la informacion disponible) |
| Longitud de contexto | 512 tokens (MAX_LEN de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT) |
| Rango LoRA | r=16, alpha=32, dropout=0.05 |
| Modulos objetivo | `k_proj`, `o_proj`, `q_proj`, `v_proj` |
| Tamano del repo | 0,1 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado exclusivamente a las proyecciones de atencion (`k_proj`, `o_proj`, `q_proj`, `v_proj`) del modelo base `google/gemma-4-E4B-it`. No se modifican las capas MLP ni los embeddings. El entrenamiento se plantea como un scorer pointwise: cada ejemplo empareja un parrafo con una referencia candidata y el modelo aprende a puntuar la probabilidad de que sea la cita correcta.

Los datos de entrenamiento corresponden al split Train limpio completo de SCIDOCA 2025, con 47.166 parrafos, longitud maxima de 512 tokens y hasta tres negativos por parrafo. La configuracion es: learning rate 2e-4, batch efectivo 16, 2 epocas fijas, warm-up del 10 %, y seleccion del checkpoint `best` segun F1 de pares en validacion. La semilla es 123. El codigo, los prompts, el split de datos y la evaluacion estan en el repositorio `tathiyennhi/automatic-citation-checking` (paquete `citeduowise/`), y la carpeta de experimento local es `experiments/gemma4_fulldata_clean/`.

## Capacidades

- Puntuacion pointwise de pares (parrafo, referencia) para recomendacion de citas cientificas.
- Ranking de referencias candidatas para un parrafo dado, mediante comparacion de scores.
- Ajuste fino especializado sobre el conocimiento del modelo base Gemma-4 E4B; no anade capacidades nuevas fuera de la tarea.
- Hereda del base las capacidades generales de generacion y comprension, aunque el adaptador esta optimizado para scoring, no para generacion libre.
- Soporte de tool calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Capacidades especiales (vision, audio, thinking mode): no documentadas en la informacion disponible.

## Casos de uso

- Descubrimiento de citas en articulos cientificos: dado un parrafo de un manuscrito, el adaptador puntua cada referencia candidata y permite seleccionar la mas probable. Es su proposito principal y el escenario para el que fue entrenado.
- Asistencia a revisores y editores: priorizacion automatica de referencias sugeridas para un texto, reduciendo el trabajo manual de busqueda bibliografica.
- Construccion de un motor de recomendacion bibliografica: integrado en una pipeline que recupere candidatos (por ejemplo, desde un indice de citas) y use el LoRA como re-ranker pointwise.
- Evaluacion de sistemas de citation recommendation: sirve como baseline reproducible (semilla 123, hiperparametros y hashes documentados) para comparar con otros enfoques en SCIDOCA 2025.
- Investigacion academica sobre ajuste fino con PEFT: ejemplo de LoRA de bajo rango aplicado a una tarea de clasificacion/puntuacion sobre un LLM moderno, util para estudiar el efecto del rango, los modulos objetivo y el numero de negativos.
- Experimentos de seguimiento: el autor lo conserva explicitamente para posibles extensiones (por ejemplo, variar el numero de negativos, la longitud de contexto o el modelo base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint se selecciona por F1 de pares en validacion, pero no se incluyen los valores numericos obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,1 GB, pero requiere cargar el modelo base `google/gemma-4-E4B-it`; la VRAM total depende del tamano y la cuantizacion del base, que no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no determinada; depende del modelo base y de la cuantizacion elegida.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base); otras opciones como vLLM, llama.cpp, Ollama o TGI no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA para citation recommendation) ni resultados numericos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar `google/gemma-4-E4B-it` para funcionar.
- Entrenado con MAX_LEN de 512 tokens; textos mas largos pueden truncarse y degradar la puntuacion.
- Ejecucion suplementaria: el propio autor indica que no se usa en los resultados de la tesis y que se conserva solo para posibles experimentos de seguimiento; no debe tratarse como un resultado validado principal.
- Sin datos publicados de benchmarks ni de rendimiento en produccion.
- Idiomas soportados no especificados; el comportamiento multilingue no esta garantizado.
- Licencia `gemma`: el uso comercial y la redistribucion estan sujetos a los terminos de la licencia Gemma de Google, que imponen restricciones y obligaciones de atribucion.
- Riesgo de alucinacion y sesgos: heredados del modelo base Gemma-4 E4B; no se documentan evaluaciones especificas de sesgo para este adaptador.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed123
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Codigo, prompts, split y evaluacion: https://github.com/tathiyennhi/automatic-citation-checking
- Paper, blog o demo del taller SCIDOCA 2025: no disponible en la informacion proporcionada.
