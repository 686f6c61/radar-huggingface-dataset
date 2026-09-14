# vanishingradient/trloom-test-smollm2-135m-sql-lora

## Resumen

El modelo `vanishingradient/trloom-test-smollm2-135m-sql-lora` es un ajuste fino (fine-tuning) del modelo instructivo `HuggingFaceTB/SmolLM2-135M-Instruct`, publicado por el usuario `vanishingradient`. Por el nombre del repositorio y las etiquetas asociadas, se trata de un artefacto experimental orientado a generar consultas SQL, entrenado mediante SFT (supervised fine-tuning) con la librería TRL. No se ha publicado información sobre el conjunto de datos empleado, el número de pasos, la composición del corpus ni los hiperparámetros del entrenamiento.

El repositorio no dispone de descargas ni de valoraciones, y su tamaño declarado es de 0.0 GB, lo que unido al nombre del proyecto ("trloom-test") apunta a un artefacto de prueba o de validación de la herramienta de entrenamiento más que a un modelo listo para producción. La model card es la plantilla autogenerada por TRL: no incluye arquitectura, licencia, idiomas ni resultados de evaluación.

Su relevancia es, por tanto, limitada y de carácter metodológico: sirve como ejemplo reproducible de un pipeline de SFT sobre un modelo pequeño (135 M de parámetros) y como prueba de compatibilidad con `transformers` y con los endpoints de Hugging Face, pero no constituye una base sólida para tareas SQL en producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el modelo base SmolLM2-135M-Instruct es un transformer decoder-only con embeddings atados |
| Parametros totales | 135 M (heredados del modelo base, según la nomenclatura del repositorio; el repositorio no publica `config.json` ni pesos completos verificables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para este fine-tune; el modelo base SmolLM2-135M-Instruct declara 8.192 tokens en su documentación pública |
| Tipos de cuantizacion | no disponible (no se publican artefactos GGUF, AWQ, GPTQ ni MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el valor de plantilla `licence: license`); el modelo base se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (según las etiquetas del repositorio); tamaño del repo declarado: 0.0 GB |

## Arquitectura y entrenamiento

No se dispone de información específica sobre la arquitectura de este artefacto en la información proporcionada. El modelo del que parte, `HuggingFaceTB/SmolLM2-135M-Instruct`, es un transformer decoder-only de 135 millones de parámetros con atención causal y embeddings atados, diseñado para despliegue en dispositivos de bajos recursos. Cualquier detalle adicional sobre capas, cabezas de atención o vocabulario corresponde al modelo base y no está confirmado para este fine-tune.

En cuanto al entrenamiento, la model card indica únicamente que se utilizó SFT con TRL, sin detallar el dataset, el número de tokens, la composición del corpus ni si hubo etapas posteriores de DPO o RLHF. Las versiones de framework declaradas son TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2; se trata de versiones que no se corresponden con releases públicos habituales en el momento de redactar esta ficha, lo que refuerza la hipótesis de un entorno de prueba. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, atención por ventanas, etc.).

## Capacidades

- Generación de texto conversacional: al derivar de un modelo instructivo, mantiene el formato de chat con roles `user`/`assistant` que se muestra en el ejemplo de la model card.
- Generación de SQL: es la capacidad que sugiere el nombre del repositorio (`sql-lora`), aunque no hay evaluación publicada que la confirme ni documentación del esquema o dialecto SQL objetivo.
- Ajuste mediante LoRA: el nombre indica entrenamiento con adaptadores de bajo rango, pero el repositorio no expone `adapter_config.json` ni la etiqueta `peft`, por lo que no se puede confirmar la naturaleza del artefacto.
- Compatibilidad con `transformers`: la model card incluye un ejemplo funcional con `pipeline("text-generation", ...)`.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio está preparado para su uso en Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; por tamaño del modelo base, la planificación multi-paso fiable es poco probable.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado rápido de generación de SQL en local: al partir de un modelo de 135 M de parámetros, permite iterar en un portátil sin GPU para validar prompts, plantillas de esquema y formatos de salida antes de escalar a un modelo mayor.
- Pruebas de integración de pipelines de SFT con TRL: sirve como caso de referencia para verificar que un flujo de entrenamiento, serialización y publicación en el Hub funciona de extremo a extremo.
- Pruebas de humo (smoke tests) en CI: su tamaño reducido permite incluirlo en un job de integración continua que compruebe que la carga del modelo, la tokenización y la inferencia no rompen tras actualizar versiones de `transformers` o `trl`.
- Evaluación comparativa de adaptadores LoRA: puede utilizarse como punto de partida para medir el efecto de distintos datasets SQL sobre un mismo modelo base, siempre que se documente el conjunto de evaluación.
- Docencia y divulgación: útil para explicar de forma práctica qué es un ajuste fino con LoRA, qué contiene un repositorio del Hub y qué información falta en una model card autogenerada.
- Experimentos de destilación o decodificación especulativa: un modelo de este tamaño puede actuar como modelo borrador (*draft model*) en técnicas de decodificación especulativa sobre modelos mayores, siempre que se valide su tasa de aceptación.
- Asistente SQL embebido en dispositivos con recursos muy limitados: si el ajuste funciona como su nombre sugiere, cabría desplegarlo en CPU o en hardware de gama baja; no obstante, no hay datos publicados que respalden su precisión en esta tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de ningún tipo (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de SQL como exact match o execution accuracy en Spider o BIRD). Tampoco se han encontrado referencias externas al modelo en la búsqueda web realizada. Cualquier cifra de rendimiento debería obtenerse mediante una evaluación propia antes de considerar su uso.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP16 (270 MB de pesos más caché KV) y alrededor de 0,1 GB en cuantización de 4 bits. Son estimaciones derivadas del recuento de parámetros del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores; también A100, H100 y L40S, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos diez años, e incluso en CPU y en placas tipo Raspberry Pi 4/5 o Apple Silicon.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card), servidores compatibles con el Hub como Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), vLLM o TGI si se dispone de los pesos completos, y llama.cpp u Ollama previa conversión a GGUF que no está publicada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Los datos de la columna de este fine-tune no están publicados; los de los modelos de referencia proceden de su documentación pública y no de la información proporcionada en esta búsqueda.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trloom-test-smollm2-135m-sql-lora | 135 M (heredados) | no disponible | no disponible | no disponible | Repositorio de 0.0 GB, 0 descargas |
| SmolLM2-135M-Instruct (modelo base) | 135 M | 8.192 tokens (según su model card) | Métricas publicadas por Hugging Face en su model card | Apache-2.0 | Ampliamente disponible |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Métricas publicadas en su model card | Apache-2.0 | Ampliamente disponible |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Métricas publicadas en su model card | Apache-2.0 | Ampliamente disponible |

No se dispone de una comparación de rendimiento específica para la tarea SQL, ya que este fine-tune carece de evaluación publicada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas de calidad, precisión en SQL ni tasas de error, por lo que no se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Artefacto de prueba: el nombre del repositorio (`trloom-test`), el tamaño de 0.0 GB, las versiones de framework poco plausibles (TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0) y la fecha de creación registrada sugieren un experimento de validación, no un modelo mantenido.
- Licencia indeterminada: la model card contiene el marcador de plantilla `licence: license`, de modo que las condiciones de uso comercial son desconocidas. El modelo base es Apache-2.0, pero eso no determina automáticamente la licencia del derivado.
- Riesgo de alucinación elevado: los modelos de 135 M de parámetros tienen una capacidad limitada de razonamiento y de seguimiento de instrucciones complejas, y generan con frecuencia SQL sintácticamente válido pero semánticamente incorrecto.
- Sesgos: no evaluados ni documentados. Al no conocerse la composición del dataset de ajuste, no se puede descartar la introducción de sesgos específicos de dominio.
- Limitaciones de contexto: si el fine-tune hereda la ventana del modelo base (8.192 tokens), los esquemas de bases de datos grandes o los historiales de conversación largos no cabrían sin estrategias de troceado o recuperación externa (RAG).
- Idiomas: no declarados; el modelo base está orientado principalmente al inglés, por lo que el rendimiento en castellano no está garantizado.
- Integridad del repositorio: no se ha podido verificar que los pesos estén efectivamente disponibles, ni si se trata de un adaptador LoRA o de pesos completos; conviene comprobar la lista de archivos antes de intentar cargarlo.
- Uso en producción desaconsejado sin validación previa: en particular en entornos donde una consulta SQL errónea pueda provocar escrituras o borrados de datos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vanishingradient/trloom-test-smollm2-135m-sql-lora
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs, demos o repositorios) asociados a este modelo; los resultados devueltos no guardan relación con él.
