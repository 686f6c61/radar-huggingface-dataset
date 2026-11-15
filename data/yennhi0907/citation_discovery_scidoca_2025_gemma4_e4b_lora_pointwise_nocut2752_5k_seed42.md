# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed42

## Resumen

El modelo `yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed42` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `google/gemma-4-E4B-it`. Lo desarrolla el usuario de Hugging Face `yennhi0907` en el contexto de la tarea 1 (citation discovery) del taller SCIDOCA 2025. No se trata de un modelo de propósito general, sino de un componente especializado: un scorer pointwise que, dado un par (párrafo, candidato a cita), devuelve la probabilidad de que el candidato sea una cita válida. El adaptador forma parte de un sistema mayor denominado CiteDuoWise, descrito como trabajo de tesis.

La arquitectura efectiva es la del modelo base Gemma 4 E4B (de Google), sobre el que se aplican matrices LoRA de rango 16 en las proyecciones de atención (`k_proj`, `o_proj`, `q_proj`, `v_proj`). El adaptador se entrenó con 5.000 párrafos limpios del conjunto Train-5k, con tres negativos aleatorios por párrafo y una longitud máxima de 2.752 tokens sin truncación. El resultado es un artefacto de 0,1 GB que requiere cargar el modelo base completo para su uso.

Su relevancia es acotada pero concreta: demuestra cómo un modelo de lenguaje grande con instrucciones puede adaptarse mediante LoRA a una tarea de recuperación/verificación de citas científicas con un coste de entrenamiento bajo, y publica el pipeline completo (código, prompts, splits y evaluación) en un repositorio de GitHub. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y la información pública sobre su rendimiento es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-E4B-it`; rango r=16, alpha=32, dropout=0.05, módulos objetivo `k_proj`, `o_proj`, `q_proj`, `v_proj` |
| Parametros totales | no disponible (el adaptador LoRA es de 0,1 GB; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como spec formal; el entrenamiento usó MAX_LEN 2752 sin truncación |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`), config PEFT (`adapter_config.json`), tokenizer y chat template en JSON/Jinja |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 con instrucciones. La adaptación es un LoRA clásico de bajo rango (r=16, alpha=32, dropout=0.05) aplicado exclusivamente a las proyecciones de query, key, value y output de la atención. El resto de pesos del modelo base permanece congelado, lo que reduce el coste de entrenamiento y el tamaño del artefacto a 0,1 GB.

El procedimiento de entrenamiento es pointwise con formato N5: se construye un prompt por cada par (párrafo, candidato) y el modelo responde Yes/No; la puntuación final es P(Yes) obtenida como softmax sobre los dos logits. Se usaron 5.000 párrafos del conjunto Train-5k con tres negativos aleatorios por párrafo (seleccionados por semilla), MAX_LEN 2752 sin truncación, learning rate 2e-4, batch efectivo 2 × 8 acumulaciones, 2 épocas y selección de la mejor época por F1 de validación. La semilla es 42. No se detalla la composición completa del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF/DPO adicionales sobre el adaptador.

## Capacidades

- Puntuación pointwise de pares (párrafo, candidato a cita): devuelve P(Yes) como probabilidad de que el candidato sea una cita válida.
- Clasificación binaria Yes/No guiada por prompt, con salida convertible en score continuo mediante softmax.
- Integración como componente principal del sistema CiteDuoWise para descubrimiento de citas.
- Manejo de entradas largas de hasta 2.752 tokens sin truncación durante el entrenamiento.
- Capacidades heredadas del modelo base Gemma 4 E4B-it (generación de texto, instrucciones, multilingüismo) no documentadas específicamente para este adaptador.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Descubrimiento de citas científicas: dado un párrafo de un artículo y un candidato bibliográfico, el adaptador puntúa la probabilidad de que la cita sea correcta; se usa como componente pointwise dentro de CiteDuoWise para priorizar candidatos.
- Verificación de citas en pipelines editoriales: integrado en un flujo que comprueba si las referencias de un manuscrito respaldan realmente las afirmaciones del texto, usando el score P(Yes) como señal de confianza.
- Re-ranking de candidatos recuperados: tras una fase de recuperación léxica o semántica, el adaptador reordena los candidatos por probabilidad de ser la cita correcta.
- Evaluación reproducible de investigación: al publicar código, prompts, splits y semilla 42, sirve como baseline reproducible para la tarea SCIDOCA 2025 de citation discovery.
- Experimentación académica con LoRA: útil como ejemplo de adaptación de un LLM con instrucciones a una tarea de clasificación binaria con prompts largos (2.752 tokens) y negativos aleatorios.
- Construcción de datasets etiquetados: el score pointwise puede usarse para filtrar o anotar pares (párrafo, cita) en la construcción de conjuntos de entrenamiento para modelos de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona selección de la mejor época por F1 de validación, pero no incluye valores numéricos de F1, precisión, recall ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `google/gemma-4-E4B-it` y de la cuantización elegida, no del adaptador (0,1 GB).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: el adaptador es compatible con la librería `peft`; requiere cargar el modelo base y aplicar el adaptador. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para citation discovery) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para la tarea pointwise de citation discovery; no es un modelo de propósito general y su uso fuera de ese dominio no está validado.
- No se publican métricas de rendimiento (F1, precisión, recall) en la model card, por lo que no es posible evaluar su calidad sin ejecutar la evaluación del repositorio.
- El modelo tiene cero descargas y cero likes, sin evidencia de uso o validación por parte de terceros.
- No se documentan los idiomas soportados ni la composición lingüística del dataset de entrenamiento.
- No se detalla el número de tokens de entrenamiento ni la composición completa del dataset, lo que limita la reproducibilidad más allá de la semilla y los hiperparámetros publicados.
- Licencia `gemma`: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma de Google, que impone restricciones específicas de uso aceptable.
- Riesgo de alucinación inherente al modelo base: aunque la salida se restringe a Yes/No, la calibración del score P(Yes) no está documentada.
- La longitud máxima de entrenamiento (2.752 tokens) puede ser insuficiente para párrafos o candidatos más largos en producción; no se documenta el comportamiento con truncación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_pointwise_nocut2752_5k_seed42
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código, prompts, splits y evaluación: https://github.com/tathiyennhi/automatic-citation-checking (paquete `citeduowise/`)
