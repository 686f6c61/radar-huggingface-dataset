# TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_usechosen_true

## Resumen

Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_usechosen_true es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base google/gemma-3-1b-it. Lo desarrolla el usuario TravelDistillation y se distribuye como repositorio PEFT de 2,2 GB en Hugging Face, con licencia Gemma. El nombre del adaptador sugiere un ajuste orientado a evaluación de pares de preferencia (RCAEval) con una función de recompensa personalizada que combina métricas macro y micro y que emplea la respuesta elegida del par de preferencias durante el entrenamiento.

El modelo no constituye un modelo fundacional nuevo, sino un ajuste fino de preferencias sobre la variante de 1B parámetros de la familia Gemma 3 de Google, pensada para generación de texto conversacional. Su relevancia práctica es acotada: se trata de un artefacto de investigación con cero descargas y sin resultados de evaluación publicados, útil principalmente para reproducir experimentos de alineamiento con DPO sobre modelos pequeños.

La información disponible es escasa: la model card es la generada automáticamente por el Trainer de TRL y no documenta datos de entrenamiento, composición del dataset, capacidades ni evaluación. Todos los datos que no aparecen en la información proporcionada se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA; entrenamiento DPO sobre el modelo base |
| Parametros totales | No disponible (el modelo base google/gemma-3-1b-it tiene 1B; el adaptador LoRA añade un número de parámetros no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base google/gemma-3-1b-it |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3 orientado a instrucciones. El ajuste se realizó con DPO mediante la librería TRL, con PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3. El dataset declarado es data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it, es decir, pares de preferencia generados aparentemente comparando respuestas del modelo de 1B con las de gemma-3-4b-it.

Los hiperparámetros documentados son: learning rate 5e-05, batch size de entrenamiento 1 con acumulación de gradientes de 8 (batch efectivo 8), una sola época, optimizador AdamW (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con warmup del 10 % de los pasos y semilla 42. El sufijo del nombre (newReward_C_Macro_Micro_usechosen_true) indica una función de recompensa personalizada con agregación macro y micro y el uso de la respuesta elegida, pero no se detalla su implementación. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de RLHF.

## Capacidades

- Generación de texto conversacional, heredada del modelo base gemma-3-1b-it.
- Ajuste de preferencias orientado a alinear las respuestas del modelo de 1B con las del modelo de 4B en el dataset de pares utilizado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada para este adaptador.

## Casos de uso

- Reproducción de experimentos de DPO: el adaptador permite replicar el pipeline de alineamiento con TRL y PEFT sobre un modelo de 1B, útil para investigadores que estudian funciones de recompensa personalizadas con agregación macro y micro.
- Destilación de preferencias de un modelo mayor a uno menor: el dataset de pares enfrenta respuestas de gemma-3-1b-it con gemma-3-4b-it, por lo que el adaptador sirve como ejemplo de destilación de preferencias de un modelo de 4B hacia uno de 1B.
- Evaluación de metodologías de recompensa: el sufijo del nombre sugiere variantes de recompensa (C, Macro, Micro, usechosen), lo que permite comparar configuraciones de DPO en un entorno controlado.
- Prototipado de asistentes conversacionales ligeros: al partir de un modelo de 1B, puede desplegarse en entornos con recursos muy limitados para pruebas de concepto de chat, siempre que se acepten las limitaciones de un modelo de este tamaño.
- Investigación sobre sesgos de alineamiento: comparar las respuestas del adaptador con las del modelo base permite medir el efecto del DPO sobre el estilo y la distribución de respuestas.
- Base para nuevos ajustes: al ser un adaptador PEFT, puede combinarse o continuar entrenándose con otros datasets de preferencia sin reentrenar el modelo completo.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre un modelo de 1B, la inferencia en fp16 requiere aproximadamente 2-3 GB para los pesos del modelo base más el adaptador, y en cuantización de 4 bits puede situarse por debajo de 1,5 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 no son necesarias para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, siempre que se cargue el modelo base con el adaptador.
- Opciones de despliegue: transformers con PEFT, text-generation-inference (el tag endpoints_compatible está presente), y previsiblemente llama.cpp u Ollama si se convierte el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_usechosen_true | 1B (base) + adaptador LoRA | No disponible | Gemma | Hugging Face, 0 descargas | Adaptador DPO de investigación, sin benchmarks |
| google/gemma-3-1b-it | 1B | No disponible en la información | Gemma | Hugging Face, ampliamente usado | Modelo base oficial de Google |
| google/gemma-3-4b-it | 4B | No disponible en la información | Gemma | Hugging Face | Modelo de referencia usado para generar los pares de preferencia |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluación cualitativa; se desconoce si el adaptador mejora o degrada el rendimiento del modelo base.
- La model card es la generada automáticamente por el Trainer y no documenta usos previstos, limitaciones ni datos de entrenamiento.
- Riesgo de alucinación inherente a un modelo de 1B parámetros, previsiblemente mayor que en modelos de mayor tamaño.
- Sesgos conocidos: no documentados por el autor; el modelo base puede arrastrar sesgos de sus datos de preentrenamiento.
- Limitaciones de contexto e idioma: no disponibles; el adaptador no declara idiomas soportados.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribución; debe revisarse antes de cualquier despliegue en producción.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día, lo que sugiere un artefacto experimental sin validación externa.
- Para usar el adaptador es imprescindible descargar el modelo base google/gemma-3-1b-it y cargarlo con PEFT; no es un modelo autónomo.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_usechosen_true
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset declarado: data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it (no se proporciona URL)
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de DPO: https://arxiv.org/abs/2305.18290
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
