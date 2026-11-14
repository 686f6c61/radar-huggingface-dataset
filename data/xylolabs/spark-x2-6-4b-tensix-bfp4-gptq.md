# Xylolabs/Spark-X2.6-4B-Tensix-BFP4-GPTQ

## Resumen

Spark-X2.6-4B-Tensix-BFP4-GPTQ es una exportación cuantizada del modelo base XHToken/Spark-X2.6-4B, publicada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila tt-metal/ttnn. El modelo contiene 4.447.623.680 parámetros y se distribuye con licencia Apache 2.0. La particularidad del artefacto es que no se trata de una cuantización genérica lista para GPU, sino de un empaquetado específico en formato block floating point de 4 bits (BFP4) generado con GPTQ plano sobre las 180 matrices de proyección del decodificador.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta de despliegue alternativa a las GPUs de NVIDIA, orientada al hardware Tensix de Tenstorrent (arquitectura Blackhole y Wormhole). Por otro, el autor publica una evaluación comparativa frente a una cuantización Q4_K_M y frente a la referencia BF16 original, con métricas de divergencia KL sobre textos en inglés y coreano, lo que permite calibrar la pérdida de calidad del proceso de cuantización.

El contexto operativo está limitado a 8.192 tokens en total (prompt más generación), y el modelo solo declara soporte para inglés y chino. El repositorio ocupa 8,9 GB, aunque el autor indica que los pesos empaquetados ocupan aproximadamente 3,47 GB en memoria de dispositivo, ya que las entradas cuantizadas se almacenan como BF16 y las tablas de embedding y cabeza de salida permanecen sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Spark, código custom en Transformers) |
| Parametros totales | 4.447.623.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (prompt + generación, límite declarado) |
| Tipos de cuantizacion | BFP4 GPTQ plano en 180 matrices de proyección (4,5 bits por peso); resto en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores cuantizados preservados como BF16, orden de filas HF original) |
| Tamano del repositorio | 8,9 GB |
| Memoria de dispositivo estimada | ~3,47 GB solo para pesos almacenados |
| Version de Transformers requerida | 5.23.0 |
| Hardware objetivo | Tenstorrent Tensix (tt-metal, ttnn); verificado en simulador Blackhole con TT-NN 0.81.1 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 4.447 millones de parámetros, con código propio registrado bajo el identificador `spark2_5` y que requiere `trust_remote_code=True`. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO. Sí se deduce del artefacto cuantizado que la arquitectura emplea atención con capas de atención deslizante y capas de atención completa con rotary parcial: el script `spark_layout.py` describe una permutación reversible de filas q/k con pares rotatorios adyacentes en las capas deslizantes y un layout parcial aplicado primero en cada cuarta capa de atención completa. Las 36 matrices QKV fusionadas conservan el orden de filas original de Hugging Face.

La innovación técnica de esta exportación no está en el entrenamiento sino en el pipeline de cuantización y empaquetado. Xylolabs aplica GPTQ plano sin búsqueda de exponentes sobre 180 matrices de proyección, las empaqueta como BFP4 nativo de TT-NN y verifica cada valor tras el empaquetado. Se incluyen dos scripts de validación: `verify_grid.py`, que comprueba cada matriz declarada tras la permutación documentada, y `pack_tensix.py`, que verifica cada valor empaquetado nativo, admite `--as bfp8` y `--device` para una ida y vuelta por DRAM. El autor declara explícitamente que no se reclama ejecución mediante tt-transformers ni tt-forge. Las 111 entradas no cuantizadas (embedding, copia explícita de la cabeza atada y otras) permanecen en BF16, lo que eleva la media de bits por peso por encima de 4,5 a nivel global.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat aplicada mediante `apply_chat_template`.
- Modo de razonamiento opcional: el ejemplo de la model card invoca `enable_thinking=False`, lo que implica la existencia de un modo thinking activable.
- Razonamiento multi-turno dentro de la ventana de 8.192 tokens compartida entre prompt y generación.
- Ejecución sobre aceleradores Tenstorrent Tensix mediante empaquetado BFP4 nativo y TT-NN.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes, visión, audio ni otras modalidades.
- No se documenta decodificación especulativa ni optimizaciones de inferencia adicionales.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal del artefacto es ejecutar un modelo de 4B en aceleradores Tensix sin GPU de NVIDIA, aprovechando el empaquetado BFP4 nativo y los scripts de verificación incluidos para validar la integridad de los pesos antes de servir tráfico.
- Asistentes conversacionales en inglés o chino: con 8.192 tokens de ventana compartida, el modelo puede gestionar diálogos multi-turno de extensión moderada en aplicaciones de soporte o atención al usuario donde el idioma objetivo sea uno de los dos declarados.
- Generación de texto en entornos con restricciones de memoria: los ~3,47 GB de pesos en dispositivo permiten alojar el modelo en aceleradores con DRAM limitada, dejando margen para caché KV y buffers.
- Prototipado e investigación sobre cuantización BFP4: la evaluación KL publicada frente a Q4_K_M y BF16 convierte este repositorio en un punto de referencia para estudiar la pérdida de calidad de block floating point de 4 bits en transformers de tamaño medio.
- Validación de pipelines de empaquetado: los scripts `verify_grid.py` y `pack_tensix.py` permiten integrar comprobaciones de integridad de pesos en un pipeline de CI antes de desplegar el modelo en producción sobre Tensix.
- Evaluación comparativa de cuantizaciones: al conservar el orden de filas original de HF y los valores cuantizados como BF16, el artefacto sirve como base para comparar GPTQ plano BFP4 contra otras cuantizaciones (Q4_K_M, BFP8) con las mismas prompts y presupuestos de generación.

## Benchmarks y rendimiento

La model card publica una evaluación basada en divergencia KL y recuento de respuestas correctas, no en benchmarks estándar tipo MMLU o HumanEval.

| Perfil | KL media | Correctas normales / 33 | Correctas thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| Referencia BF16 original | 0 | 25 | 5 | — |
| Esta exportación GPTQ plana | 0,065925 | 24 | 5 | 0 |
| Q4_K_M emparejado | 0,060881 | 26 | 7 | 0 |

La KL de la exportación fresca se calcula sobre 16.288 posiciones de textos en inglés y coreano, en crudo y en formato chat, en dos fragmentos de 2.048 tokens cada uno. El suelo de KL medido con llama.cpp en BF16 es 0,000397. La exportación cumple la regla relativa de puerta 7 al situarse en 1,082850 veces la KL de Q4_K_M, dentro del límite de 1,5 veces, con cero pérdidas contadas y sin respuestas rotas. El autor indica que estas son comprobaciones en host y que no se reporta velocidad. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: aproximadamente 3,47 GB solo para los pesos almacenados, más espacio para caché KV y buffers de ejecución.
- GPU: el artefacto está orientado a aceleradores Tenstorrent Tensix (tt-metal, ttnn), no a CUDA. La verificación se realizó en el simulador Blackhole con TT-NN 0.81.1.
- No se documenta compatibilidad con GPUs consumer (RTX 4090 u otras) ni con A100/H100 en la información disponible; el formato BFP4 es específico de Tensix.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch y `trust_remote_code=True` para carga en host; TT-NN con `ttnn.as_tensor` en `bfloat4_b` y `TILE_LAYOUT` para empaquetado en dispositivo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tensix-BFP4-GPTQ | 4,45B | 8.192 | BFP4 GPTQ (4,5 bits) | Apache 2.0 | Tenstorrent Tensix |
| Spark-X2.6-4B (base) | 4,45B | no disponible | BF16 | Apache 2.0 (según base) | GPU/CPU genérica |
| Q4_K_M emparejado (referencia de evaluación) | 4,45B | no disponible | Q4_K_M | no disponible | llama.cpp |
| Referencia BF16 original (evaluación) | 4,45B | no disponible | BF16 | no disponible | host |

La comparativa se limita a las variantes del mismo modelo base citadas en la evaluación del autor, ya que no se dispone de datos de otros modelos de 4B comparables en la información proporcionada. En términos de calidad medida por KL, la exportación BFP4 se sitúa ligeramente por encima de Q4_K_M (0,065925 frente a 0,060881) y muy por encima del suelo BF16 de llama.cpp (0,000397), con un recuento de respuestas correctas ligeramente inferior en el conjunto normal (24 frente a 26) e igual en el conjunto thinking (5 frente a 7).

## Limitaciones y advertencias

- Contexto efectivo limitado a 8.192 tokens compartidos entre prompt y generación; no apto para tareas de contexto largo.
- Solo se declaran inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- La cuantización BFP4 introduce una divergencia KL media de 0,065925 frente a BF16, con pérdida de respuestas correctas en el conjunto normal (24 frente a 25 de la referencia).
- El artefacto está diseñado para Tensix; no es un checkpoint portable a CUDA sin un reempaquetado adicional que no se documenta.
- Requiere `trust_remote_code=True` y Transformers 5.23.0; el código Spark es custom y debe revisarse antes de habilitarlo, tal como advierte el autor.
- Las 36 matrices QKV fusionadas requieren una permutación de filas q/k antes del empaquetado BFP; empaquetar las filas en crudo redondearía algunos valores de nuevo.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales.
- No se reportan métricas de velocidad, latencia ni throughput, por lo que no es posible estimar el rendimiento en producción a partir de la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP4-GPTQ
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Código de cuantización tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP4-GPTQ/blob/main/LICENSE
