# Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP4

## Resumen

Spark-X2.6-4B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo XHToken/Spark-X2.6-4B, publicada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base es un transformer causal de 4.447.623.680 parámetros orientado a generación de texto conversacional, con soporte para inglés y chino. Esta versión concreta no modifica la arquitectura ni el entrenamiento: aplica cuantización GPTQ con formato de coma flotante por bloques (BFP4, `ttnn.bfloat4_b`) a las capas lineales, dejando el resto de tensores en bf16.

La relevancia de esta ficha radica en que ejemplifica el ecosistema emergente de pesos optimizados para hardware no-GPU. Frente a las distribuciones habituales en GGUF o safetensors bf16, aquí el objetivo es el empaquetado nativo para las NPU de Tenstorrent mediante tt-metal y TT-NN, con un peso empaquetado de aproximadamente 2,80 GB en memoria de dispositivo. La media declarada es de 5,44 bits por peso, lo que reduce sustancialmente el espacio frente a los ~8,9 GB del repositorio completo.

Es importante señalar que esta exportación tiene un estado de madurez limitado: según la propia model card, ni tt-transformers ni ninguna demo de tt-metal implementan la arquitectura `spark2_5` del modelo, y las matrices fusionadas `q_k_v_proj` no se encuentran en la rejilla BFP4 en el orden de filas almacenado. Por tanto, es un artefacto útil para investigación y validación de cuantización, no para despliegue directo en producción sobre Tensix sin trabajo adicional de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`spark2_5`): q_k_v_proj fusionado, puerta de salida por cabeza (headwise output gate), MLP con GELU; 36 capas |
| Parametros totales | 4.447.623.680 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en el resto; media de 5,44 bits por peso |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB); pesos cuantizados empaquetados a ~2,80 GB en dispositivo |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B emplea una arquitectura transformer causal denominada `spark2_5`, con 36 capas que combinan proyecciones q, k y v fusionadas en una sola matriz (`q_k_v_proj`), una puerta de salida por cabeza y un MLP con activación GELU. Esta exportación no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; esos datos corresponden a la model card del modelo base, no incluida en la información disponible.

La innovación técnica de esta versión es el proceso de cuantización: GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las 36 matrices fusionadas `q_k_v_proj` y las proyecciones MLP (gate, up, down) y attention (out_proj) se almacenan como valores bf16 situados sobre la rejilla BFP4 tras una permutación de filas por cabeza. La excepción documentada es que las `q_k_v_proj` se guardan en el orden de filas del modelo base y solo caen en la rejilla BFP4 cuando las filas de cada cabeza q y k se reordenan al orden del dispositivo; en las capas de atención completa (64 dimensiones rotatorias) las dimensiones de la cabeza se recolocan previamente. Empaquetadas tal cual, alrededor del 7 % de los valores quedan fuera de la rejilla.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas de propósito general, heredado del modelo base.
- Ejecución de inferencia en bf16 mediante `transformers` con `trust_remote_code=True` (código `configuration_spark.py` y `modeling_spark.py` sin modificar respecto al base).
- Empaquetado y validación de pesos para TT-NN: conversión a `ttnn.bfloat4_b` o `ttnn.bfloat8_b` con layout TILE y memoria DRAM.
- Verificación de integridad de la cuantización mediante scripts (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningún valor cambia al empaquetar y desempaquetar.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Validación de pipelines de cuantización BFP4: usar `pack_tensix.py` y `verify_grid.py` para comprobar que las 144 matrices no fusionadas se empaquetan sin pérdida de valores en la rejilla `ttnn.bfloat4_b`, como paso previo a integrar modelos mayores en el mismo flujo GPTQ.
- Investigación sobre hardware Tenstorrent: desplegar el modelo en simulador Blackhole (`ttsim`) con ttnn 0.81.1 para medir el comportamiento de la rejilla BFP4 y el consumo de los ~2,80 GB de pesos en DRAM de dispositivo.
- Desarrollo de kernels personalizados: la excepción de las 36 matrices `q_k_v_proj` (que requieren reordenación de filas por cabeza) sirve como caso de prueba para implementar la arquitectura `spark2_5` en tt-metal o tt-forge, hoy inexistente.
- Generación de texto conversacional en inglés y chino sobre GPU convencional: cargando el repositorio con `transformers` 4.57.1 y `dtype="bfloat16"`, el modelo responde a mensajes con plantilla de chat, útil para evaluar la degradación de calidad introducida por la cuantización frente al base.
- Comparación de formatos de cuantización: al poder empaquetarse los mismos valores tanto en `bfloat4_b` como en `bfloat8_b`, permite medir el impacto de 4,5 frente a 8 bits por peso en tareas de generación en ambos idiomas.
- Reproducción de calibración: el calibrado sobre WikiText-2 y Wikipedia coreana documentado permite replicar el proceso GPTQ y estudiar la sensibilidad de las distintas proyecciones al exponente por bloque.
- Prototipado de asistentes bilingües de bajo coste: con ~2,80 GB de pesos en dispositivo, es viable en entornos con memoria limitada una vez resuelta la integración del kernel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: ~2,80 GB solo para los pesos del modelo de lenguaje en formato BFP4 empaquetado, más espacio para la caché KV y buffers.
- Repositorio completo en disco: 8,9 GB (safetensors con mezcla de bf16 y BFP4).
- GPU recomendadas: no aplica de forma nativa; el destino son NPU Tenstorrent Tensix (Wormhole, Blackhole). Para inferencia en bf16 vía `transformers` se requiere una GPU con al menos ~9 GB de VRAM (pesos en bf16), aunque el dato exacto no está disponible.
- ¿Cabe en GPU de consumo? En bf16, un modelo de 4,45B parámetros ocupa aproximadamente 8,9 GB, por lo que encaja en GPUs de 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en Tensix, los ~2,80 GB empaquetados caben en un solo dispositivo, aunque la arquitectura no está implementada en tt-metal.
- Opciones de despliegue: `transformers` 4.57.1 con `trust_remote_code=True` (verificado; en 5.x requiere dos parches documentados: `_tied_weights_keys` como mapa y llamadas a `create_causal_mask`/`create_sliding_window_causal_mask` con `inputs_embeds`); TT-NN 0.81.1 para empaquetado y verificación en simulador. vLLM, llama.cpp, Ollama y TGI: no disponibles para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tenstorrent-Tensix-BFP4 (este) | 4,45B | no disponible | BFP4 (4,5 bits/peso) + bf16 | Apache 2.0 | Tenstorrent Tensix (Wormhole, Blackhole) |
| XHToken/Spark-X2.6-4B (base) | 4,45B | no disponible | bf16 | Apache 2.0 (según este repo) | GPU / CPU genéricas |
| Exportaciones GGUF de modelos ~4B | ~4B | variable | Q4_K_M, Q5_K_M, Q8_0 | según modelo base | CPU, GPU de consumo vía llama.cpp |
| Exportaciones GPTQ/AWQ de modelos ~4B | ~4B | variable | 4 bits, 8 bits | según modelo base | GPU vía vLLM/TGI |

La comparación directa con alternativas de la misma categoría es limitada porque este artefacto está especializado en un backend de hardware concreto (Tensix) y no en GPU estándar. Frente a cuantizaciones GGUF o GPTQ convencionales, la diferencia clave es el formato BFP4 por bloques con exponente compartido y la reordenación de filas específica del dispositivo, que no son portables a otros runtimes sin conversión. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La arquitectura `spark2_5` no está implementada en tt-metal v0.81.1 ni en tt-transformers; no existe demo oficial para ejecutarla en hardware Tensix real, solo verificación en simulador (`ttsim`).
- Las 36 matrices fusionadas `q_k_v_proj` se almacenan en el orden de filas del modelo base y solo caen en la rejilla BFP4 tras reordenación por cabeza; empaquetadas tal cual, cerca del 7 % de los valores quedan fuera de la rejilla, lo que puede degradar la calidad si se usan sin el reordenamiento.
- El código remoto (`configuration_spark.py`, `modeling_spark.py`) debe revisarse antes de ejecutarlo con `trust_remote_code=True`; además, requiere parches en transformers 5.x y no se ha probado en 4.57.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- No se han publicado benchmarks, por lo que no es posible cuantificar la pérdida de calidad frente al modelo base en bf16.
- La calibración GPTQ se realizó sobre WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo de dominio en la cuantización para otros tipos de texto.
- Riesgo de alucinación inherente al modelo base de 4,45B parámetros; no se documentan mitigaciones específicas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de soporte en tt-metal implica que un despliegue en producción requeriría desarrollo propio de kernels.
- El número de descargas (50) y de likes (0) indica una adopción muy temprana; no hay evidencia de comunidad ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
