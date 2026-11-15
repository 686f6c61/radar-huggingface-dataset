# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed456

## Resumen

Este repositorio contiene un adaptador LoRA denominado `pointwise_nocut2752_5k_seed456`, desarrollado por el usuario yennhi0907 como componente principal del sistema CiteDuoWise, presentado como trabajo de tesis. El adaptador se ha entrenado sobre el modelo base `google/gemma-4-E4B-it` para la tarea de citation discovery (descubrimiento de citas) del desafío SCIDOCA 2025, tarea 1. Su funcionamiento consiste en un scorer pointwise: para cada par (párrafo, candidato) se construye un prompt independiente y el modelo responde Yes/No, calculándose la puntuación como P(Yes) mediante softmax sobre ambos tokens.

El adaptador es de tipo LoRA con rango 16, alpha 32 y dropout 0,05, aplicado únicamente a las proyecciones de atención (`k_proj`, `o_proj`, `q_proj`, `v_proj`) del transformer subyacente. El entrenamiento se realizó sobre un conjunto limpio de 5.000 párrafos (Train-5k) con tres negativos aleatorios por párrafo, longitud máxima de 2.752 tokens sin truncación, learning rate 2e-4, batch efectivo de 16 (2 x acumulación 8) y 2 épocas, seleccionando la mejor época según F1 de validación. La semilla utilizada es 456.

Es relevante ahora porque documenta una aproximación reproducible y ligera (0,1 GB de pesos) al problema de recomendación de citas científicas, con código, prompts y particiones de datos publicados en el repositorio de GitHub del autor. No obstante, el modelo base referenciado (`google/gemma-4-E4B-it`) no cuenta con información pública disponible en la documentación proporcionada, y el adaptador carece de descargas y valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base `google/gemma-4-E4B-it`, arquitectura no disponible) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32, dropout=0,05) |
| Parametros activos | no disponible |
| Longitud de contexto | MAX_LEN de entrenamiento 2.752 tokens (sin truncación); contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado exclusivamente a las proyecciones de query, key, value y output de la atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base `google/gemma-4-E4B-it`. No se modifican las capas MLP ni los embeddings. El repositorio incluye además `chat_template.jinja`, `tokenizer.json` y `tokenizer_config.json`, lo que indica que el adaptador se usa con la plantilla de chat y el tokenizador del modelo base.

El entrenamiento se realizó sobre el conjunto Train-5k (5.000 párrafos limpios), con tres negativos aleatorios por párrafo seleccionados según la semilla 456. Se empleó MAX_LEN 2.752 sin truncación, learning rate 2e-4, batch de 2 con acumulación de gradientes de 8 (batch efectivo 16) y 2 épocas, escogiendo la mejor época por F1 de validación. El protocolo, los logs y la partición de datos están documentados en la carpeta de experimento `experiments/gemma4_nocut_5k_clean/` del repositorio GitHub del autor. No se especifica en la información disponible la composición del dataset más allá de los 5.000 párrafos, ni si hubo fases de RLHF o DPO.

## Capacidades

- Puntuación pointwise de pares (párrafo, candidato) para recomendación de citas científicas: genera una respuesta Yes/No y la puntuación se obtiene como P(Yes) = softmax([Yes, No]).
- Clasificación binaria de relevancia en el contexto de citation discovery (SCIDOCA 2025, tarea 1).
- Manejo de contextos de hasta 2.752 tokens sin truncación durante el entrenamiento.
- Integración como componente principal del sistema CiteDuoWise.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Recomendación de citas en artículos científicos: dado un párrafo y un candidato bibliográfico, el modelo puntúa la probabilidad de que la cita sea adecuada, permitiendo ordenar candidatos y filtrar los irrelevantes.
- Construcción de pipelines de revisión bibliográfica asistida: el scorer pointwise puede integrarse como etapa de ranking en herramientas que sugieren referencias a autores durante la redacción.
- Evaluación de sistemas de citation discovery: al ser un componente reproducible con semilla y partición documentadas, sirve como baseline para comparar con otros aproximaciones en el desafío SCIDOCA 2025.
- Filtrado de candidatos en motores de búsqueda académica: aplicar el scorer sobre pares (párrafo, paper candidato) para descartar resultados poco relevantes antes de una revisión manual.
- Investigación sobre adaptadores LoRA: el repositorio documenta hiperparámetros, hashes SHA-256 y protocolo de entrenamiento, lo que facilita su uso como referencia en experimentos de ajuste eficiente.
- Detección de citas faltantes en manuscritos: combinado con un recuperador de candidatos, el modelo puede señalar qué referencias encajan mejor con un párrafo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador LoRA ocupa 0,1 GB en disco.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT (librería declarada); no se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es específico para citation discovery sobre el modelo base `google/gemma-4-E4B-it`, y no se han encontrado alternativas documentadas en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed456 | no disponible (LoRA r=16 sobre Gemma-4 E4B) | 2.752 tokens de entrenamiento | no disponible | gemma | Hugging Face, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en la tarea de citation discovery pointwise; no es un modelo de propósito general.
- No se documentan sesgos conocidos, pero al entrenarse sobre un subconjunto de 5.000 párrafos, puede heredar sesgos del corpus y del modelo base.
- Riesgo de alucinación: el modelo responde Yes/No, por lo que el riesgo se manifiesta como falsos positivos o falsos negativos en la puntuación de relevancia, no como texto libre.
- Limitación de contexto: el entrenamiento se realizó con MAX_LEN 2.752; pares más largos podrían degradar el rendimiento o requerir truncación no contemplada.
- Idiomas soportados no documentados; el rendimiento fuera del idioma del corpus de entrenamiento es desconocido.
- Licencia `gemma`: el uso comercial está sujeto a los términos de la licencia Gemma, que imponen restricciones y obligaciones específicas.
- El modelo base `google/gemma-4-E4B-it` no cuenta con información pública en la documentación proporcionada, lo que limita la evaluación de sus capacidades subyacentes.
- Repositorio sin descargas ni valoraciones en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed456
- Repositorio GitHub (código, prompts, partición de datos y evaluación): https://github.com/tathiyennhi/automatic-citation-checking
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
