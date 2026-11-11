# Xylolabs/Spark-X2.6-4B-Tensix-BFP8

## Resumen

Spark-X2.6-4B-Tensix-BFP8 es una versión cuantizada del modelo base XHToken/Spark-X2.6-4B, publicada por Xylolabs y orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original del base (identificada como `spark2_5`) y sustituye las capas lineales por pesos cuantizados a `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, de forma que TT-NN puede empaquetar los tensores directamente sin re-cuantización.

El modelo cuenta con 4.447.623.680 parámetros y está pensado para generación de texto conversacional en inglés y chino. La propuesta de valor es la integración nativa con el stack de software de Tenstorrent (`tt-metal`, `ttnn`, `tt-forge`): los ficheros se distribuyen en bf16 pero cada valor de las proyecciones cuantizadas ya está alineado a la rejilla BFP8, lo que reduce el peso empaquetado a 4,68 GB (9,12 bits por peso de media) frente a los aproximadamente 8,9 GB del repositorio.

Es relevante ahora porque representa un caso concreto de cuantización post-entrenamiento dirigida a hardware no-GPU, un nicho en el que la mayoría de checkpoints de Hugging Face no ofrecen pesos preparados para el formato de bloque de Tenstorrent. No obstante, la propia model card advierte de que el checkpoint se ha validado únicamente en el simulador `ttsim` con `ttnn 0.81.1` y no sobre hardware real, y de que ni `tt-metal` ni `tt-forge` implementan todavía esta arquitectura de extremo a extremo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `spark2_5` (q_k_v_proj fusionada, puerta de salida por cabeza, MLP con GELU) |
| Parámetros totales | 4.447.623.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales; bf16 en embedding, LM head, normas y resto de tensores |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8); ficheros auxiliares `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 36 capas con una proyección `q_k_v_proj` fusionada, una puerta de salida por cabeza de atención y un MLP con activación GELU. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información corresponde al modelo base XHToken/Spark-X2.6-4B y no se reproduce aquí.

La innovación técnica de esta ficha es el proceso de cuantización: las proyecciones MLP (gate, up, down), la `out_proj` de atención y la `q_k_v_proj` fusionada de las 36 capas se cuantizan a BFP8 con GPTQ sobre la propia rejilla del formato de bloque, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador de Tenstorrent. La calibración se realizó con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado son 9,12 bits por peso de media y 4,68 GB empaquetados. Existe una excepción relevante: la matriz `q_k_v_proj` fusionada se almacena en el orden de filas del modelo base y solo cae sobre la rejilla BFP8 cuando las filas de cada cabeza q y k se reordenan al orden del dispositivo (dentro de cada cabeza, la ranura 2i toma la dimensión i y la 2i+1 toma la dimensión i+128); empaquetada tal cual, alrededor del 5 % de sus valores se re-cuantizarían. El código del modelo (`configuration_spark.py`, `modeling_spark.py`) se distribuye sin cambios respecto al base y requiere `trust_remote_code=True`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento y respuesta a preguntas de propósito general, según el comportamiento del modelo base.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizador.
- Ejecución en transformers con `dtype="bfloat16"` y `device_map="auto"`.
- Inferencia preparada para empaquetado directo en TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b`, layout TILE y DRAM).
- Verificación de integridad de la cuantización mediante los scripts `pack_tensix.py` y `verify_grid.py`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en NPU Wormhole o Blackhole a través de TT-NN, evitando la re-cuantización en el dispositivo gracias a que los pesos ya están sobre la rejilla BFP8.
- Evaluación de cuantización BFP8 con GPTQ: sirve como referencia para medir la pérdida de calidad al pasar de bf16 a block floating point de 8 bits en un transformer de 4B, comparando las salidas del checkpoint con las del modelo base.
- Prototipado de pipelines de generación de texto en transformers: con `trust_remote_code=True` y `device_map="auto"` puede ejecutarse en GPU convencional para validar prompts y plantillas de chat antes de portar el modelo a Tensix.
- Verificación de empaquetado en hardware no-GPU: los scripts incluidos permiten comprobar matriz a matriz que ningún valor cambia al empaquetar en TT-NN, lo que resulta útil en pipelines de CI para validar exportaciones de pesos.
- Asistentes conversacionales bilingües en/zh: el soporte de ambos idiomas permite construir interfaces de atención al cliente o ayuda técnica para usuarios de esas dos lenguas.
- Investigación en eficiencia de memoria: con 4,68 GB empaquetados frente a los aproximadamente 8,9 GB del repositorio, el checkpoint reduce la huella de pesos y facilita experimentos de despliegue en entornos con memoria limitada.
- Base para estudios de portabilidad de arquitecturas: al no estar implementada `spark2_5` en `tt-metal` ni en `tt-forge`, el checkpoint sirve como banco de pruebas para quien quiera implementar esta arquitectura en el stack de Tenstorrent.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso empaquetado en BFP8: 4,68 GB; repositorio completo en safetensors bf16: 8,9 GB.
- VRAM estimada para inferencia en GPU: aproximadamente 9-10 GB en bf16 (pesos más overhead de activaciones y caché KV), dependiendo de la longitud de contexto.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en tarjetas consumer con 12 GB o más de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090) y en A100/H100 para despliegues de mayor concurrencia.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole). Validado únicamente con `ttnn 0.81.1` sobre el simulador `ttsim` de Blackhole, no sobre hardware real.
- Opciones de despliegue: transformers (versión objetivo 4.57.1; en 5.x requiere dos parches indicados en la model card), TT-NN para empaquetado en Tensix. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. `tt-metal` (v0.81.1) no soporta esta arquitectura y `tt-forge` (tt-xla) no se ha ejecutado con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tensix-BFP8 | 4,45B | no disponible | BFP8 (GPTQ) para Tensix | Apache-2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B (base) | 4,45B | no disponible | bf16 | no disponible en la información | Hugging Face |
| Alternativas de 4B en bf16 | no disponible | no disponible | bf16 | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Validación incompleta: el checkpoint solo se ha probado en el simulador `ttsim` con `ttnn 0.81.1`; no hay pruebas sobre hardware Wormhole o Blackhole real.
- Sin soporte en `tt-metal`: ni `tt-transformers` ni ninguna demo de modelo de `tt-metal` implementan la arquitectura `spark2_5`.
- `tt-forge` (tt-xla) no se ha ejecutado con este checkpoint.
- La `q_k_v_proj` fusionada no está sobre la rejilla BFP8 en el orden de filas almacenado; empaquetada tal cual, alrededor del 5 % de sus valores se re-cuantizarían. Los scripts de verificación reportan esas 36 matrices como fuera de la rejilla.
- Requiere `trust_remote_code=True`; conviene revisar `configuration_spark.py` y `modeling_spark.py` antes de ejecutarlos.
- Compatibilidad de transformers limitada: el código apunta a 4.57.1, que no se probó; en 5.x necesita dos cambios en tiempo de ejecución (mapa `_tied_weights_keys` y llamadas a `create_causal_mask`/`create_sliding_window_causal_mask` con `inputs_embeds`).
- Idiomas limitados a inglés y chino; no se documenta cobertura de castellano.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas para este checkpoint; hereda los del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero la ausencia de benchmarks y de pruebas en hardware real desaconseja su uso en producción sin una validación previa propia.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP8/blob/main/LICENSE
