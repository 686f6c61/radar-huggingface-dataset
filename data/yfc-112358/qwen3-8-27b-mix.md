# YFC-112358/Qwen3.8-27B-Mix

## Resumen

Qwen3.8-27B-Mix es un modelo de lenguaje de 27.781 millones de parámetros publicado por el usuario YFC-112358 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de pesos derivada del checkpoint YFC-112358/Qwen3.8-27B-pi-AuxMix-v1 mediante la técnica task arithmetic, con un delta de tarea de bajo rango/disperso/residual acotado por presupuestos de norma por fila y globales. El resultado se exporta como un único archivo `model.safetensors` en BF16.

El modelo se apoya en la arquitectura qwen3_5 (según los tags del repositorio) y hereda del checkpoint base todo lo que no son matrices de atención y MLP del decodificador: embeddings, cabeza de salida, componentes de visión, MTP, normas y parámetros de control. La model card describe un proceso de fusión con validación de normas Frobenius, comprobación tras el redondeo a BF16 y un modo de prompt opcional denominado xlogic, activado al iniciar el mensaje del usuario con `{REASON:xlogic}`.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de merging reproducible y documentado (con `merge_report.json`, `run_identity.json` y `denoising_report.json`), sin benchmarks de generación ni evaluación downstream publicados. Para evaluación práctica debe tratarse como un checkpoint experimental de 27B con arquitectura Qwen3.5, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer decoder, según tags del repo) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16, un único `model.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se conservan los archivos de licencia y aviso upstream en `source_notices/`; el merge no sustituye sus términos) |
| Formato de pesos | safetensors (BF16, un único archivo `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo no se entrena: se obtiene por fusión de pesos. La receta principal es task arithmetic sobre el checkpoint AuxMix (coeficiente 1) más un delta de tarea FP32 con alpha global 0,100400355579, transformado mediante una base aproximada de bajo rango/disperso/residual ajustada con derivadas por pregunta original, una métrica de confianza basada en el producto externo del gradiente (PSD), regularización de Gram no ortogonal, suavizado por profundidad y bootstrap de estabilidad solo en entrenamiento. El delta final en BF16 tiene norma Frobenius 0,916359144918, el 66,4243 % de la contribución de referencia conservadora Coder390 (presupuesto del 75,00 %). Además se aplica un segundo término opcional de task arithmetic Kvark: `W_new = round_to_final_dtype(W_final + 0.03*(W_Kvark - W_QwenBase))`.

Solo se modifican las matrices de atención y MLP del decodificador (seleccionadas por `P_backbone`); el resto de tensores conservan los bytes de AuxMix. La validación incluye comprobación de normas por fila y globales tras el redondeo a BF16, con reducción del coeficiente si hay desbordamiento. No se ejecutaron benchmarks de generación ni downstream: el autor advierte explícitamente que el tamaño del delta de pesos no mide capacidad relativa ni ausencia de regresiones, y que el resultado de holdout es un proxy interno, no una estimación independiente.

## Capacidades

- Generación de texto autoregresiva heredada del checkpoint base Qwen3.8-27B-pi-AuxMix-v1 (no verificada con benchmarks en la información disponible).
- Componentes de visión y MTP conservados del checkpoint base, aunque no se documenta su funcionamiento tras el merge.
- Modo de prompt `{REASON:xlogic}`: se activa si el último mensaje del usuario comienza con esa cadena; está implementado en `chat_template.jinja` y requiere que el motor de inferencia respete la plantilla de chat de Hugging Face. No implica pesos transferidos ni reproduce prompts no publicados.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en merging de modelos: reproducir la receta de task arithmetic con presupuestos de norma descrita en la model card, usando `merge_report.json` y `run_identity.json` para verificar hashes y normas medidas.
- Estudio de transferencia de capacidades entre checkpoints: comparar el comportamiento del modelo fusionado frente a AuxMix y Coder390 en tareas controladas, dado que la receta se calibró contra la diferencia Coder390 − EfficientThink.
- Evaluación de técnicas de compresión de deltas: analizar la base de bajo rango/disperso/residual y su efecto sobre las matrices de atención y MLP del decodificador.
- Pruebas de plantillas de chat personalizadas: validar el modo `{REASON:xlogic}` en motores que respeten `chat_template.jinja`, midiendo si el prefijo altera el estilo de razonamiento.
- Experimentos de inferencia en BF16 a gran escala: desplegar el checkpoint en hardware con suficiente VRAM para estudiar latencia y throughput de un transformer de 27B en BF16, sin asumir calidad de producción.
- Docencia y divulgación sobre model merging: usar los informes de procedencia (`provenance/`, `component_selection.json`, `denoising_report.json`) como caso de estudio de trazabilidad en fusiones de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutaron benchmarks de generación ni downstream, y que el tamaño del delta de pesos no constituye una medida de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos (27.781 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples GPU de menor capacidad con tensor parallelism.
- En GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en BF16; requeriría cuantización a 8 o 4 bits, no publicada en el repositorio.
- Opciones de despliegue: vLLM, TGI o llama.cpp con conversión previa a GGUF; el repositorio solo incluye safetensors, por lo que la conversión corre a cargo del usuario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Mix | 27,78 B | no disponible | no disponible | Hugging Face (0 descargas) | Merge experimental, sin benchmarks |
| YFC-112358/Qwen3.8-27B-pi-AuxMix-v1 | no disponible | no disponible | no disponible | Hugging Face | Checkpoint base del merge |
| Qwen3.8-27B-pi-AuxMix-v1 (variantes del mismo autor) | no disponible | no disponible | no disponible | Hugging Face | Familia de merges del mismo autor |
| Alternativas de 27B de otros desarrolladores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No se han ejecutado benchmarks de generación ni downstream: no hay evidencia publicada de calidad, regresiones o capacidades reales tras el merge.
- El resultado de holdout citado es un proxy interno de contraste, no una estimación independiente y sin sesgo del rendimiento.
- El tamaño del delta de pesos no mide capacidad relativa ni ausencia de regresiones; el propio autor lo advierte.
- Licencia no declarada en el repositorio: se conservan los términos upstream en `source_notices/`, pero el uso comercial queda sujeto a las licencias de los checkpoints de origen, no verificadas aquí.
- Idiomas soportados y longitud de contexto no documentados.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El modo `{REASON:xlogic}` depende de que el motor de inferencia respete la plantilla de chat; no es una capacidad transferida por pesos.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-09) en los metadatos del repositorio, lo que conviene verificar antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YFC-112358/Qwen3.8-27B-Mix
- Checkpoint base: https://huggingface.co/YFC-112358/Qwen3.8-27B-pi-AuxMix-v1
- Informes de merge citados en la model card: `merge_report.json`, `component_selection.json`, `denoising_report.json`, `run_identity.json` (incluidos en el repositorio)
- Procedencia y avisos: carpetas `provenance/` y `source_notices/` del repositorio
- Papers, blogs, repos o demos adicionales: no disponibles
