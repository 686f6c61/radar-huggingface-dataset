# Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP8

## Resumen

Spark-X2.6-4B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo de lenguaje Spark-X2.6-4B (desarrollado por XHToken) realizada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo aplica cuantización GPTQ sobre la rejilla de punto flotante por bloques `ttnn.bfloat8_b` (BFP8) a las capas lineales, manteniendo en bf16 la cabeza LM, los embeddings y las normas. El resultado ocupa aproximadamente 4,68 GB en memoria de dispositivo, con una media de 9,12 bits por peso.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue para hardware acelerador no-GPU. El modelo base Spark-X2.6-4B emplea una arquitectura propia denominada `spark2_5`, con proyección q_k_v fusionada, puerta de salida por cabeza y MLP con GELU. La exportación va acompañada de las herramientas `tensix-bfp-gptq` de Xylolabs y de scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que las matrices empaquetadas se mantienen idénticas tras el viaje de ida y vuelta a la rejilla BFP8.

El modelo soporta inglés y chino, se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse sobre `ttnn`/`tt-metal`. Es un artefacto de nicho: útil para quien despliegue modelos en silicio de Tenstorrent, no para inferencia convencional en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer con q_k_v_proj fusionada, puerta de salida por cabeza y MLP GELU) |
| Parametros totales | 4.447.623.680 (4,45 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso en capas lineales); resto en bf16; media de 9,12 bits/peso |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (rejilla BFP8 empaquetada), con `quant4.json` e índice de shards |
| Memoria de dispositivo estimada | ~4,68 GB solo para pesos del LM, más KV cache y buffers |
| Libreria | transformers (con `trust_remote_code=True`), objetivo 4.57.1 |
| Tamano del repo | 8,9 GB |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B emplea la arquitectura propietaria `spark2_5`, que combina una proyección `q_k_v_proj` fusionada, una puerta de salida por cabeza (*headwise output gate*) y un MLP con activación GELU. El código de modelado (`configuration_spark.py`, `modeling_spark.py`) se incluye sin modificar respecto al modelo base y requiere `trust_remote_code=True`. La exportación cuantiza 36 capas: las proyecciones MLP (`gate`, `up`, `down`), `out_proj` de atención y la `q_k_v_proj` fusionada, todas a `bfloat8_b`.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador, y se calibró sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Una particularidad técnica importante: la matriz `q_k_v_proj` fusionada se almacena en el orden de filas del modelo base, pero solo cae sobre la rejilla BFP8 en el orden de filas del dispositivo (dentro de cada cabeza q y k, la posición 2i toma la dimensión i y la 2i+1 toma la i+128; en las capas de atención completa con 64 dimensiones rotatorias, las dimensiones se reordenan previamente para que los pares (i, i+32) queden contiguos). No se dispone de información sobre el número de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`).
- Soporte de conversaciones multi-turno a través de la plantilla de chat del tokenizador.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) mediante `ttnn`/`tt-metal`.
- Verificación de integridad de pesos empaquetados mediante scripts incluidos (`pack_tensix.py`, `verify_grid.py`).
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información.
- Visión, audio o modo *thinking*: no disponible en la información.

## Casos de uso

- Despliegue en hardware Tenstorrent: ejecutar el modelo en NPU Wormhole o Blackhole usando `ttnn`, aprovechando la cuantización BFP8 para reducir la huella de memoria a ~4,68 GB y liberar la GPU para otras tareas.
- Investigación en cuantización por bloques: usar el artefacto como referencia reproducible para estudiar el impacto de GPTQ sobre la rejilla `bfloat8_b` y validar la fidelidad de pesos con `verify_grid.py`.
- Prototipado de asistentes conversacionales en inglés y chino: el modelo acepta plantillas de chat y puede integrarse en aplicaciones de diálogo multi-turno sobre infraestructura Tensix.
- Evaluación comparativa de formatos de cuantización: comparar esta versión BFP8 con la BFP4 del mismo autor para medir el compromiso entre memoria y calidad en dispositivos con distinta capacidad de DRAM.
- Pipelines de verificación en CI: incorporar `pack_tensix.py` como paso de validación que compruebe que las 144 matrices no fusionadas se mantienen idénticas tras el empaquetado.
- Experimentación con arquitecturas no estándar: servir como caso de estudio de un transformer con `q_k_v_proj` fusionada y puerta por cabeza, útil para quienes adapten kernels de atención a `tt-metal`.
- Despliegue en entornos con restricciones de memoria: en dispositivos Tensix con poca DRAM, evaluar esta variante frente a la BFP4 para decidir el formato adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria de dispositivo: ~4,68 GB solo para los pesos del LM en BFP8, más espacio para KV cache y buffers intermedios; el repo completo ocupa 8,9 GB en disco.
- GPU recomendadas: no aplica; el artefacto está destinado a NPU Tensix de Tenstorrent (Wormhole, Blackhole).
- Compatibilidad con GPU de consumo: el modelo puede cargarse en transformers con `device_map="auto"` en bf16, pero la cuantización BFP8 solo tiene sentido en hardware Tensix; no se documenta su uso en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: `ttnn` 0.81.1 (verificado en el simulador Blackhole `ttsim`), `tt-metal` v0.81.1 (no soportado: ni tt-transformers ni las demos de tt-metal implementan la arquitectura `spark2_5`), transformers 4.57.1 con `trust_remote_code=True`. En transformers 5.x requiere dos parches en tiempo de ejecución: `_tied_weights_keys` como mapa `{"lm_head.weight": "model.embedding.weight"}` y llamadas a `create_causal_mask`/`create_sliding_window_causal_mask` con `inputs_embeds` en lugar de `input_embeds`.
- Latencia y throughput: no disponible en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tensix-BFP8 (este) | 4,45 B | no disponible | BFP8 + bf16 | Tensix (Wormhole, Blackhole) | Apache 2.0 |
| Spark-X2.6-4B-Tensix-BFP4 (mismo autor) | 4,45 B | no disponible | BFP4 + bf16 | Tensix con menos DRAM | Apache 2.0 |
| XHToken/Spark-X2.6-4B (base) | 4,45 B | no disponible | bf16 | GPU / CPU | no disponible |
| Modelos de ~4 B en formato GGUF | ~4 B | variable | Q4_K_M, Q5_K_M, Q8_0 | CPU / GPU de consumo | variable |

La comparación con modelos de la misma categoría fuera del ecosistema Tenstorrent no está disponible en la información proporcionada; no se han publicado métricas de calidad que permitan situar este artefacto frente a alternativas de tamaño similar.

## Limitaciones y advertencias

- Artefacto de nicho: la cuantización BFP8 solo es funcional en hardware Tensix; en GPU o CPU se pierde la ventaja de memoria y el modelo se carga en bf16.
- `tt-metal` v0.81.1 no soporta la arquitectura `spark2_5`; el soporte verificado es únicamente vía `ttnn` en el simulador `ttsim`, no en silicio real según la información disponible.
- Las 36 matrices `q_k_v_proj` fusionadas se almacenan en el orden de filas del modelo base y solo caen sobre la rejilla BFP8 en el orden del dispositivo; los scripts de verificación las reportan como fuera de rejilla, lo que exige un paso de reordenación adicional.
- Requiere `trust_remote_code=True`; el código de modelado debe revisarse antes de ejecutarlo.
- Compatibilidad limitada con transformers: objetivo 4.57.1, parches necesarios en 5.x, y 4.57 no fue probado.
- Idiomas limitados a inglés y chino; no se documenta soporte para castellano.
- Riesgo de alucinación y sesgos: no disponible en la información; cabe asumir los del modelo base, no evaluados aquí.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks impide avalar la calidad en producción.
- Solo 58 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Versión BFP4: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP4
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
