# tiyuvta/DictaLM-3.0-24B-NVFP4-healed

## Resumen

DictaLM-3.0-24B-NVFP4-healed es una cuantizacion de 4 bits del modelo israeli DictaLM-3.0-24B-Thinking, desarrollado originalmente por Dicta (dicta-il) y cuantizado por el usuario tiyuvta sobre su propia infraestructura de serving para GPUs Blackwell. El checkpoint reduce el peso de 48 GB en BF16 y 24 GB en FP8 a aproximadamente 15 GB, manteniendo la ventana de contexto operativa en una unica tarjeta de 32 GB. Esta pensado explicitamente para cargas de trabajo en hebreo, aunque tambien conserva capacidades en ingles.

Tecnicamente es un artefacto NVFP4 (pesos e2m1 de 4 bits con un plano de escalas FP8-e4m3 por cada 16 elementos, equivalente a 4,5 bits por elemento) generado con GPTQ mediante llm-compressor, en formato compressed-tensors `nvfp4-pack-quantized`. La variante "healed" anade un paso de LoRA de concienciacion de cuantizacion (QAT) plegado de nuevo en los pesos, que mejora el rendimiento en ingles sin degradar el hebreo de forma estadisticamente significativa.

Su relevancia actual es doble: por un lado demuestra que una cuantizacion NVFP4 bien calibrada puede superar en ingles al FP8 original del proveedor con un 37% menos de memoria; por otro, documenta con rigor metodologico (McNemar pareado, n=2000 por idioma) que las metricas de similitud por tensor no detectan degradaciones severas en lenguas de bajos recursos. Es un caso de estudio util para quien despliegue modelos multilingues cuantizados en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, segun tags del autor) |
| Parametros totales | 23.572.403.200 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (w4a16): pesos 4-bit e2m1 + escalas FP8-e4m3 por grupo de 16, 4,5 bits/elemento; GPTQ; 280 tensores cuantizados, 83 sin cuantizar (normas, embeddings, `lm_head`) |
| Idiomas soportados | he (hebreo), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion de `dicta-il/DictaLM-3.0-24B-Thinking`, un modelo de 23.572 millones de parametros etiquetado por el autor como perteneciente a la familia Mistral. No se dispone de informacion detallada sobre la arquitectura interna del modelo base (numero de capas, dimensiones, tipo de atencion) ni sobre su dataset de preentrenamiento o fases de alineamiento (RLHF/DPO) en la informacion proporcionada. La variante "Thinking" del nombre sugiere un modo de razonamiento extendido, pero no hay especificacion tecnica del mismo.

El proceso de cuantizacion uso GPTQ via llm-compressor 0.13.0 con un parche especifico (PR #3144) necesario para que el pipeline secuencial pudiera ejecutarse con configuraciones `transformers>=5`. La calibracion combino el conjunto propio de Dicta con Wikipedia en hebreo e ingles en proporcion aproximada 4:1, con 128 secuencias de 512 tokens y semilla 20260905. El paso de "healing" consistio en un LoRA de concienciacion de cuantizacion aplicado sobre las proyecciones de reduccion (`down_proj`, `o_proj`) y plegado en los pesos, sin adaptador en tiempo de servicio. El autor documenta que ampliar la calibracion a 512x1024 (8x mas tokens) no produjo mejora estadisticamente significativa, y que el FP8 por canal en las proyecciones de reduccion no aporta bajo GPTQ porque la compensacion de error por columna ya resuelve ese problema.

## Capacidades

- Generacion de texto conversacional en hebreo e ingles, con soporte de conversaciones multi-turno.
- Razonamiento extendido (modo "Thinking" en el nombre del modelo base; sin detalles tecnicos disponibles).
- Comprension y generacion en hebreo, idioma principal de calibracion y objetivo del checkpoint.
- Capacidades en ingles, que en esta variante healed superan al FP8 del proveedor en Global-MMLU (0.7760 frente a 0.7735).
- Inferencia en GPUs Blackwell (RTX 5090) mediante el motor de serving de tiyuvta y cualquier runtime compatible con compressed-tensors NVFP4.
- No hay informacion disponible sobre tool calling, function calling, uso de agentes, vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente en hebreo: el modelo puede gestionar conversaciones multi-turno en hebreo con calidad cercana al FP8 original (0.6590 frente a 0.6735 en Global-MMLU), ocupando solo 15 GB y permitiendo desplegarlo en una unica GPU de 32 GB junto con el resto del stack de serving.
- Despliegue en una sola RTX 5090: con 15 GB de pesos y decodificacion de 99,6 tok/s medida en una 5090, es viable servir un modelo de 24B en hardware consumer de gama alta para prototipos, demos o entornos de desarrollo.
- Traduccion y redaccion asistida hebreo-ingles: la combinacion de calibracion bilingue y rendimiento equilibrado en ambos idiomas lo hace adecuado para tareas de traduccion, resumen y reescritura en pares he-en.
- Procesamiento de documentacion y corpus en hebreo: clasificacion, extraccion de informacion y generacion de resumenes sobre textos en hebreo, con la ventaja de un footprint reducido que permite ejecutar varias instancias en un mismo nodo.
- Evaluacion y auditoria de cuantizacion: el checkpoint y su model card sirven como referencia metodologica para equipos que necesiten validar si una cuantizacion 4-bit degrada un idioma concreto, usando evaluacion pareada por idioma en lugar de similitud de tensores.
- Investigacion en eficiencia de inferencia: util para comparar GPTQ frente a round-to-nearest en NVFP4, o para medir el impacto de QAT (healing) sobre un checkpoint ya cuantizado, con datos reproducibles publicados por el autor.
- Serving en ingles con mejor relacion calidad/memoria: para cargas orientadas al ingles donde se prefiera un checkpoint de 15 GB que iguala o supera al FP8 de 24 GB del proveedor (0.7760 frente a 0.7735).

## Benchmarks y rendimiento

Evaluacion en Global-MMLU, 5-shot, greedy de un solo token, n=2000 por idioma, comparada con el FP8 del proveedor:

| Modelo | Hebreo | Ingles | Tamano |
|---|---|---|---|
| DictaLM-3.0-24B FP8 (proveedor) | 0.6735 | 0.7735 | 24 GB |
| DictaLM-3.0-24B-NVFP4 (parent) | 0.6590 | 0.7635 | 15 GB |
| DictaLM-3.0-24B-NVFP4-healed (este) | 0.6620 | 0.7760 | 15 GB |

Comparaciones pareadas con McNemar sobre 2000 `sample_id` compartidos:

| Comparacion | Hebreo | Ingles |
|---|---|---|
| Healed vs parent | +0.30 pt (p=0.7263, nulo) | +1.25 pt (p=0.0192) |
| Parent vs FP8 proveedor | -1.45 pt (p=0.0293) | -1.00 pt |

Rendimiento de decodificacion: 99,6 tok/s en una RTX 5090 (tres repeticiones, muestreo por defecto del `generation_config`). El parent rinde 84,3 tok/s en la misma maquina; el healed iguala esa cifra segun el autor. La variante con FP8 en proyecciones de reduccion baja a 80,5 tok/s y ocupa 3 GB mas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GB para los pesos; con overhead de runtime y cache KV, un despliegue realista requiere una GPU de 24-32 GB.
- GPU recomendadas: RTX 5090 (Blackwell, medida por el autor), RTX PRO 6000 Blackwell, B200. El formato NVFP4 requiere soporte de hardware Blackwell para maxima eficiencia.
- Cabe en GPU consumer: si, en RTX 5090 (32 GB) con margen para contexto; no en GPUs de 16 GB o menos.
- Opciones de despliegue: cualquier runtime que lea compressed-tensors `nvfp4-pack-quantized`; el autor lo ejecuta con el motor de serving de tiyuvta. No hay confirmacion en la informacion disponible de soporte en vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: 99,6 tok/s de decodificacion en una RTX 5090. El autor advierte que el throughput no es independiente del host y solo se cita para esa tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Global-MMLU he | Global-MMLU en | Licencia | Formato |
|---|---|---|---|---|---|---|
| DictaLM-3.0-24B-NVFP4-healed | 23,57B | no disponible | 0.6620 | 0.7760 | Apache 2.0 | NVFP4 15 GB |
| DictaLM-3.0-24B-NVFP4 (parent) | 23,57B | no disponible | 0.6590 | 0.7635 | Apache 2.0 | NVFP4 15 GB |
| DictaLM-3.0-24B-Thinking FP8 (proveedor) | 23,57B | no disponible | 0.6735 | 0.7735 | Apache 2.0 | FP8 24 GB |
| DictaLM-3.0-24B-Thinking BF16 (base) | 23,57B | no disponible | no disponible | no disponible | Apache 2.0 | BF16 48 GB |

No se dispone de datos de benchmarks de otros modelos de 24B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion en hebreo frente al FP8 del proveedor: -1,45 puntos en Global-MMLU con significacion estadistica (p=0.0293). Para cargas criticas en hebreo, el autor recomienda usar el parent, cuyo numero publicado es el medido y validado.
- El beneficio del healing se limita al ingles: en hebreo la mejora de +0,30 puntos no es significativa (p=0,7263) y la brecha residual con FP8 no esta localizada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de 24B en tareas de conocimiento factual.
- Idiomas: solo hebreo e ingles declarados. El rendimiento en castellano u otros idiomas no esta evaluado y no deberia asumirse.
- Longitud de contexto: no especificada. El autor menciona que el footprint de 15 GB deja "espacio para una ventana de contexto real" en una tarjeta de 32 GB, pero no da la cifra.
- Dependencia de hardware Blackwell: el formato NVFP4 esta orientado a esa generacion; en GPUs anteriores el soporte puede ser limitado o inexistente.
- Throughput dependiente del host: la cifra de 99,6 tok/s solo es valida para la RTX 5090 medida; no debe extrapolarse.
- Metodologia de evaluacion acotada: los benchmarks se limitan a Global-MMLU 5-shot greedy de un solo token, que el autor describe como instrumento de medida y no como forma de serving. No hay datos de HumanEval, GSM8K, MMLU estandar ni tareas generativas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los datos de calibracion.
- Repositorio de terceros: es una cuantizacion de la comunidad (tiyuvta), no una publicacion oficial de Dicta; el soporte y las actualizaciones dependen del autor del artefacto.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/tiyuvta/DictaLM-3.0-24B-NVFP4-healed
- Checkpoint parent NVFP4: https://huggingface.co/tiyuvta/DictaLM-3.0-24B-NVFP4
- Modelo base: https://huggingface.co/dicta-il/DictaLM-3.0-24B-Thinking
- llm-compressor: https://github.com/vllm-project/llm-compressor
- PR requerido para la cuantizacion: https://github.com/vllm-project/llm-compressor/pull/3144
- Dataset de evaluacion Global-MMLU: https://huggingface.co/datasets/CohereLabs/Global-MMLU
- Sitio del autor de la cuantizacion: https://tiyuvta.ai/
