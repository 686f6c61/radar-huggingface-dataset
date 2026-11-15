# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed456

## Resumen

Este repositorio contiene un adaptador LoRA denominado `citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed456`, publicado por el usuario `yennhi0907`. No se trata de un modelo completo, sino de un ajuste fino mediante PEFT (LoRA) sobre el modelo base `google/gemma-4-E4B-it`. Su propósito declarado es actuar como un scorer puntual (pointwise scorer) para la tarea de descubrimiento de citas (citation discovery) del desafío SCIDOCA 2025 (Task 1).

El adaptador se entrenó sobre el conjunto de entrenamiento completo y limpio de 47.166 párrafos, con una longitud máxima de 512 tokens y hasta tres negativos por párrafo. Según la model card del autor, se trata de una ejecución suplementaria que no se utilizó en los resultados de su tesis, conservada únicamente para posibles experimentos de seguimiento.

La relevancia de este artefacto es acotada: es un adaptador de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un benchmark específico de recomendación de citas científicas. Su interés práctico depende enteramente de la disponibilidad del modelo base `google/gemma-4-E4B-it` y de la reproducibilidad del pipeline descrito en el repositorio de código del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it`; r=16, alpha=32, dropout=0.05, módulos objetivo `k_proj`, `o_proj`, `q_proj`, `v_proj` |
| Parámetros totales | No disponible (el adaptador ocupa 0,1 GB; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parámetros activos | No disponible |
| Longitud de contexto | 512 tokens (MAX_LEN de entrenamiento); la ventana nativa del modelo base no se especifica |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `gemma` (Gemma License) |
| Formato de pesos | `safetensors` (adaptador PEFT) más `adapter_config.json`, `chat_template.jinja`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de bajo rango (r=16, alpha=32, dropout=0.05) aplicado exclusivamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base `google/gemma-4-E4B-it`. No se modifican las capas MLP ni se añaden cabezas nuevas; el adaptador se limita a reorientar la atención hacia la tarea de puntuación de candidatos de cita.

El entrenamiento se realizó sobre el conjunto de entrenamiento completo y limpio de SCIDOCA 2025 Task 1, compuesto por 47.166 párrafos, con hasta tres negativos por párrafo y una longitud máxima de 512 tokens. Se fijaron 2 épocas, learning rate de 2e-4, batch efectivo de 16, warm-up del 10 % y selección del checkpoint `best` según la F1 de pares en validación. La semilla utilizada fue 456. No se documentan en la información disponible detalles sobre composición lingüística del dataset, uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- Puntuación puntual (pointwise scoring) de pares párrafo-cita para la tarea de descubrimiento de citas del benchmark SCIDOCA 2025.
- Clasificación/ranking de candidatos de cita dados un párrafo y un conjunto de referencias potenciales.
- Hereda las capacidades lingüísticas del modelo base `google/gemma-4-E4B-it`, aunque no se documentan explícitamente en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información proporcionada.
- No se documenta modo de pensamiento (thinking mode) ni capacidades multimodales específicas.

## Casos de uso

- Descubrimiento de citas en artículos científicos: dado un párrafo de un manuscrito, puntuar candidatos de referencia y priorizar los más probables, usando el adaptador sobre el modelo base para producir una señal de ranking.
- Evaluación reproducible de sistemas de recomendación de citas: el adaptador y el pipeline del autor (`citeduowise/`) permiten replicar el protocolo SCIDOCA 2025 Task 1 con la semilla 456.
- Experimentos de seguimiento en investigación académica: al ser una ejecución suplementaria, sirve como punto de partida para comparar variantes de datos, hiperparámetros o semillas.
- Asistencia a revisores y editores: priorización automática de referencias candidatas para verificar si un párrafo cita adecuadamente la literatura relevante.
- Construcción de datasets de pares párrafo-cita: el scorer puede usarse para filtrar o etiquetar pares débiles antes de un entrenamiento posterior.
- Integración en pipelines de gestión bibliográfica: puntuar referencias sugeridas por un motor de búsqueda académica antes de presentarlas al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base `google/gemma-4-E4B-it` y de la cuantización elegida, que no se documentan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la librería `peft` (por ejemplo, mediante `transformers` + `peft`); no se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed456` | Adaptador LoRA sobre Gemma-4 E4B-it | 512 tokens (entrenamiento) | `gemma` | Hugging Face, 0 descargas |
| Adaptadores LoRA comparables para citation discovery | No disponible | No disponible | No disponible | No disponible |
| Modelos base de la familia Gemma-4 E4B | Modelo completo | No disponible | `gemma` | No disponible en la información proporcionada |

No se dispone de información sobre modelos alternativos directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar `google/gemma-4-E4B-it` y la librería `peft` para funcionar.
- Entrenado exclusivamente para la tarea SCIDOCA 2025 Task 1 (citation discovery); su uso fuera de ese dominio no está validado.
- Longitud máxima de entrenamiento de 512 tokens, lo que limita su aplicación a párrafos cortos.
- Ejecución suplementaria no utilizada en los resultados de la tesis del autor; no debe citarse como resultado principal.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa por parte de la comunidad.
- La licencia `gemma` impone restricciones de uso comercial que deben revisarse en los términos oficiales de Google; no se detallan en la información disponible.
- No se documentan sesgos, tasas de alucinación ni evaluación multilingüe.
- La fecha de creación indicada (2026-11-15) es posterior a la fecha actual en el momento de redacción, lo que conviene verificar antes de su uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_47k_seed456
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código, prompts, split de datos y evaluación: https://github.com/tathiyennhi/automatic-citation-checking (paquete `citeduowise/`)
- Resultado de búsqueda web no relacionado con el modelo (registro de cuenta de Wikipedia): https://zhidao.baidu.com/question/2215483994157458188.html
