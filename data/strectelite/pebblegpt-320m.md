# strectelite/PebbleGPT-320M

## Resumen

PebbleGPT-320M es un modelo de lenguaje denso de 320 millones de parámetros, desarrollado por el usuario strectelite y publicado en Hugging Face con licencia Apache 2.0. Se trata de un modelo base preentrenado desde cero sobre 10 mil millones de tokens, diseñado exclusivamente para continuar texto, sin capacidad de seguir instrucciones. Su arquitectura sigue el patrón transformer clásico con mejoras modernas como Grouped Query Attention, RoPE, SwiGLU y RMSNorm, y utiliza el tokenizador de SmolLM2 con un vocabulario de 49.152 tokens.

El modelo está orientado a la experimentación y al fine-tuning en tareas específicas de generación de texto en inglés. Con una ventana de contexto de 2048 tokens y un entrenamiento de aproximadamente 18 horas en una sola GPU H100, resulta un punto de partida ligero para investigadores que quieran estudiar el comportamiento de modelos pequeños o adaptarlos a dominios concretos. Su relevancia actual radica en su carácter didáctico y en la reproducibilidad de su entrenamiento, documentado en detalle en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) con GQA, RoPE, SwiGLU, RMSNorm, embeddings atados |
| Parametros totales | 320.914.432 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 24 capas, con tamaño oculto de 1024 y dimension intermedia de 2816. Utiliza Grouped Query Attention (GQA) con 16 cabezas de consulta y 4 cabezas de clave/valor (ratio 4), lo que reduce el coste de memoria durante la inferencia. Emplea embeddings rotatorios (RoPE) con theta 10000, activacion SwiGLU y normalizacion RMSNorm. Los embeddings de entrada y salida estan atados (tied embeddings), reduciendo el numero de parametros. El tokenizador es el de SmolLM2, con un vocabulario de 49.152 tokens.

El entrenamiento se realizo sobre 10 mil millones de tokens, con una composicion de datos dominada por contenido educativo: 42,5% FineWeb-Edu, 42,5% DCLM-Edu (con umbral edu_int_score >= 3), 10% Python-Edu y 5% FineMath-4+. Se utilizo AdamW con beta 0.9/0.95, weight decay 0.1 (excluyendo embeddings) y un schedule WSD (Warmup-Stable-Decay) con pico de learning rate 5e-4 y un 10% de decaimiento. El entrenamiento se llevo a cabo en 19.073 pasos con un tamaño de lote de 524.288 tokens por paso, durante unas 18 horas en una sola H100 SXM a un MFU del 35%. La perdida final fue de 2.507, equivalente a una perplexidad de aproximadamente 12.3.

## Capacidades

- Generacion de texto: el modelo puede continuar secuencias de texto de forma autoregresiva, produciendo texto coherente en ingles.
- No sigue instrucciones: es un modelo base, por lo que no esta entrenado para responder a prompts de tipo conversacional o seguir ordenes.
- No soporta tool calling ni function calling.
- No esta preparado para tareas de agente ni razonamiento multi-paso.
- Capacidad multilingue limitada: solo entrenado en ingles, con datos principalmente educativos.
- No dispone de capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Fine-tuning para clasificacion de texto: al ser un modelo base pequeño, se puede ajustar finamente sobre datasets etiquetados para tareas como analisis de sentimiento, deteccion de spam o categorizacion de documentos.
- Fine-tuning para generacion de codigo: gracias a la inclusion de Python-Edu en su entrenamiento, puede adaptarse a tareas de generacion de codigo simple o autocompletado en entornos de desarrollo.
- Experimentacion academica: su tamano reducido y su documentacion detallada lo hacen util para estudiar el comportamiento de transformers pequenos, probar tecnicas de regularizacion o comparar schedulers de aprendizaje.
- Prototipado rapido: permite probar pipelines de generacion de texto en entornos con recursos limitados antes de escalar a modelos mayores.
- Generacion de datos sinteticos: puede usarse para crear muestras de texto en ingles que sirvan para aumentar datasets de entrenamiento.
- Pruebas de infraestructura: su bajo consumo de recursos lo convierte en un candidato ideal para validar despliegues en servidores sin GPU dedicada o en entornos de CI/CD.

## Benchmarks y rendimiento

Segun la model card del autor, se evaluaron tres benchmarks de sentido comun y razonamiento. No se han publicado comparaciones con otros modelos en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| HellaSwag (acc_norm) | 30.5 |
| PIQA | 55.5 |
| ARC-easy (acc_norm) | 37.7 |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 320.9M parametros. En FP16 (2 bytes por parametro) ocupa aproximadamente 0.64 GB, mas la memoria para el tokenizador y las activaciones. En precision FP32 seria unos 1.28 GB. Con cuantizacion INT8, el peso se reduce a unos 0.32 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. En una RTX 4090, una A100 o una H100, la inferencia es rapida, aunque el autor indica que no hay implementado un cache de KV, por lo que la generacion es lenta.
- Cabe en GPUs de consumo: si, en GPUs con 4 GB o mas (por ejemplo, GTX 1650, RTX 3050, etc.) se puede ejecutar en FP16.
- Opciones de despliegue: se puede usar con la libreria transformers de Hugging Face (con `trust_remote_code=True`), o convertirlo a formatos como GGUF para usar con llama.cpp u Ollama, aunque no hay instrucciones oficiales.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano y la ausencia de cache de KV, la generacion sera lenta en comparacion con modelos que si lo implementan.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye comparaciones con otros modelos de tamano similar.

## Limitaciones y advertencias

- Es un modelo base, no un asistente conversacional: no responde a instrucciones ni mantiene dialogos.
- Contexto limitado a 2048 tokens, insuficiente para tareas que requieran contextos largos.
- Solo entrenado en ingles, con datos principalmente educativos; su rendimiento en otros idiomas es nulo o muy pobre.
- No se ha implementado cache de KV, por lo que la generacion es lenta en comparacion con modelos que lo incluyen.
- El modelo puede reflejar sesgos presentes en los datos de entrenamiento (FineWeb-Edu, DCLM-Edu, etc.), aunque al ser un modelo base pequeno, el riesgo de alucinacion es menor que en modelos grandes.
- No se han publicado resultados de seguridad o robustez frente a inputs adversarios.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los datasets utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strectelite/PebbleGPT-320M
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.
