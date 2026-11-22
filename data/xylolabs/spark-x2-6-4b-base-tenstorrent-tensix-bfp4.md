# Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP4

## Resumen

Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP4 es una cuantización del modelo base XHToken/Spark-X2.6-4B-Base realizada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura y el código originales de Spark (cargables con `trust_remote_code=True` en transformers 4.57.1) y sustituye las proyecciones de atención y MLP por versiones cuantizadas en formato block floating point de 4 bits (`bfloat4_b`, BFP4), manteniendo en bf16 la LM head, los embeddings y las normas.

El interés principal es de infraestructura: reduce el peso empaquetado de 8,22 GB en bf16 a 2,798 GB para Tensix, lo que permite ejecutar un modelo de 4.447.623.680 parámetros en hardware de Tenstorrent con un coste de precisión medido (KL medio frente a bf16 de 0,0316, un 17 % superior al de llama.cpp Q4_K_M). No es un modelo nuevo ni un fine-tune: es un checkpoint cuantizado con GPTQ y búsqueda de exponente por bloque.

Al ser un modelo base (no instruct), su función es la continuación de texto en inglés y chino, no el diálogo. Los pesos se distribuyen en safetensors con los valores cuantizados almacenados como bf16, de modo que el Hub reporta el tamaño bf16 y es TT-NN quien empaqueta el formato BFP4 sin alterar valores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (código Spark: `modeling_spark.py`, `configuration_spark.py`); 36 capas |
| Parámetros totales | 4.447.623.680 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings, normas y resto de tensores |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16; empaquetado BFP4 para TT-NN) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base XHToken/Spark-X2.6-4B-Base, un transformer decoder-only de 36 capas con atención y MLP clásicos, incluyendo una proyección fusionada `q_k_v_proj`. La model card no detalla la composición del dataset de preentrenamiento, el número de tokens ni si hubo etapas de RLHF o DPO; esa información corresponde al modelo base y no se incluye aquí. El repositorio conserva la plantilla de chat del base, pero el checkpoint es de tipo pretrained y su comportamiento es de continuación de texto.

La innovación técnica está en el proceso de cuantización: GPTQ con búsqueda de exponente por bloque aplicado a las proyecciones MLP (gate, up, down), `out_proj` y `q_k_v_proj` de las 36 capas, generando un formato block floating point de 4 bits (`bfloat4_b`) que TT-NN consume directamente. Existe una excepción relevante: las 36 matrices fusionadas `q_k_v_proj` se almacenan en el orden de filas del modelo base (que transformers ejecuta sin cambios) y solo caen sobre la rejilla BFP4 cuando las filas de cada cabeza q y k se reordenan al orden del dispositivo; por eso las herramientas `pack_tensix.py` y `verify_grid.py` reportan esas 36 matrices como fuera de rejilla, mientras que las otras 144 pasan la verificación tal cual están almacenadas.

## Capacidades

- Generación y continuación de texto en inglés y chino.
- Razonamiento y conocimiento general derivados del preentrenamiento del modelo base (sin datos de benchmarks publicados).
- No es un modelo instruct: no sigue instrucciones de forma fiable ni mantiene diálogo estructurado, aunque conserva la plantilla de chat del base.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades de visión ni audio.
- Ejecución optimizada en NPU Tensix (Wormhole, Blackhole) mediante tt-metal y TT-NN con pesos en BFP4.
- Compatible con transformers 4.57.1 vía `trust_remote_code=True`; en transformers 5.x requiere dos ajustes de código (`_tied_weights_keys` como mapa y paso de `inputs_embeds` a `create_causal_mask` y `create_sliding_window_causal_mask`).

## Casos de uso

- Inferencia en hardware Tenstorrent: despliegue del checkpoint en NPU Wormhole o Blackhole usando TT-NN, aprovechando la reducción de 8,22 GB a 2,798 GB empaquetados para maximizar el número de modelos o el tamaño de lote que cabe en DRAM.
- Evaluación de precisión de cuantización: uso del KL medio de 0,0316 frente a bf16 como referencia para decidir si BFP4 es aceptable en una tarea concreta antes de migrar cargas de trabajo a Tensix.
- Generación de texto en inglés y chino como componente de pipelines de preentrenamiento o experimentación: al ser un modelo base, encaja en tareas de continuación, no en asistentes conversacionales.
- Investigación en formatos block floating point: el repositorio incluye `pack_tensix.py` y `verify_grid.py`, útiles para validar que el empaquetado BFP4 no altera valores y para estudiar el efecto de la rejilla en las proyecciones fusionadas.
- Prototipado de kernels y runners: junto con tensix-kernels y tensix-runner v0.1.0, sirve como checkpoint de referencia para probar implementaciones de atención y MLP en Tensix.
- Fine-tuning posterior sobre el base cuantizado o sobre el base original: la licencia Apache-2.0 y el tamaño de 4,4B permiten adaptaciones a dominios concretos, aunque la cuantización BFP4 limita la calidad respecto a bf16.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL medio frente a bf16 | 0,0316 |
| KL medio de llama.cpp Q4_K_M (referencia) | 0,0270 (implícito: 0,0316 / 1,17) |
| Ratio frente a Q4_K_M | 1,17 veces |
| Peso empaquetado para Tensix | 2,798 GB |
| Peso en bf16 | 8,22 GB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Requisitos de hardware

- VRAM/DRAM: 2,798 GB empaquetados en BFP4 para Tensix; el repositorio ocupa 8,9 GB porque los tensores cuantizados se almacenan como bf16.
- GPU recomendadas: no aplica de forma nativa; el destino son NPU Tensix de Tenstorrent (Wormhole, Blackhole). En GPU convencional puede cargarse con transformers en bf16, requiriendo del orden de 9 GB de VRAM más overhead.
- GPU de consumo: en bf16 cabría en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090); no hay datos de rendimiento en GPU para este checkpoint.
- Despliegue: TT-NN con tt-metal para Tensix; transformers 4.57.1 con `trust_remote_code=True` para CPU/GPU. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP4 | 4,45B | no disponible | BFP4 (Tensix) | Apache-2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B-Base | 4,45B | no disponible | bf16 | no disponible en la información proporcionada | Hugging Face |
| llama.cpp Q4_K_M (referencia de precisión) | no aplica | no aplica | Q4_K_M | no aplica | llama.cpp |

La comparación relevante es frente al base en bf16 (8,22 GB, sin pérdida de precisión) y frente a la referencia Q4_K_M usada por el autor para calibrar la calidad (KL 0,0316 frente a 0,0270). No se dispone de datos para comparar con otros modelos de 4B de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base: no está alineado para seguir instrucciones ni para diálogo; usarlo como asistente produce resultados pobres.
- Pérdida de precisión medible: KL medio de 0,0316 frente a bf16, un 17 % peor que Q4_K_M; aceptable según el autor, pero relevante en tareas sensibles a la fidelidad.
- Las 36 matrices `q_k_v_proj` no están sobre la rejilla BFP4 en el orden almacenado; requieren reordenación de filas al orden del dispositivo antes de ejecutarse en Tensix.
- Idiomas limitados a inglés y chino; sin datos sobre rendimiento en castellano.
- Riesgo de alucinación inherente a un modelo base de 4,4B sin datos de evaluación publicados.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el código remoto (`trust_remote_code=True`) debe revisarse antes de ejecutarlo en producción.
- En transformers 5.x el código falla sin dos modificaciones manuales; la versión objetivo es 4.57.1.
- tt-transformers y tt-forge no se han probado con este checkpoint.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP4)
- [Modelo base XHToken/Spark-X2.6-4B-Base](https://huggingface.co/XHToken/Spark-X2.6-4B-Base)
- [Repositorio tensix-bfp-gptq (commit 5c52065)](https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711)
- [Release tensix-bfp-gptq v0.1.0](https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0)
- [Release tensix-kernels v0.1.0](https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0)
- [Release tensix-runner v0.1.0](https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0)
- [Documentación de Tenstorrent](https://docs.tenstorrent.com)
- [Licencia Apache-2.0 del checkpoint](https://huggingface.co/Xylolabs/Spark-X2.6-4B-Base-Tenstorrent-Tensix-BFP4/blob/main/LICENSE)
