# Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP es una exportación cuantizada del modelo de lenguaje de mistralai/Ministral-3-14B-Instruct-2512-BF16, preparada por Xylolabs para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el mismo transformer de Mistral con sus capas lineales reempaquetadas en los formatos de coma flotante por bloques que entiende TT-NN (`bfloat4_b` y `bfloat8_b`), de modo que el hardware pueda consumirlas sin recuantizar en tiempo de carga.

La relevancia de esta ficha es práctica: permite llevar un modelo de clase 14B a aceleradores Tensix con un peso empaquetado de 10,58 GB, muy por debajo de los ~27 GB del checkpoint BF16 original. La cuantización es mixta: las proyecciones MLP (gate, up, down) van en BFP4 con GPTQ, mientras que las proyecciones de atención (q, k, v, o) se mantienen en BFP8 con redondeo al más cercano. El resultado son 6,26 bits por peso de media.

El modelo base conserva las capacidades conversacionales e instructivas de la familia Ministral 3, con soporte declarado para once idiomas (entre ellos el castellano) y licencia Apache 2.0. Esta exportación es solo texto: el torreón de visión y su proyector han sido eliminados, por lo que no debe esperarse entrada multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Ministral 3, `Ministral3ForCausalLM`); exportación para NPU Tensix |
| Parametros totales | 13.506.073.600 (~13,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona escalado de query más allá de 16.384 tokens) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, GPTQ + búsqueda de exponente por bloque) en MLP; BFP8 (`ttnn.bfloat8_b`, round-to-nearest) en atención; bf16 en embeddings, LM head y normas; 6,26 bits/peso de media |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (matrices almacenadas como valores bf16 sobre la rejilla BFP4/BFP8), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Ministral 3, con 40 capas según se deduce de la tabla de formatos de la model card (40 capas de atención y 40 de MLP). Esta exportación no entrena nada: toma el checkpoint BF16 de Mistral y aplica un pipeline de cuantización post-entrenamiento. Las matrices MLP se cuantizan con GPTQ acompañado de una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices de atención se cuantizan con redondeo al más cercano a BFP8.

La innovación técnica no está en el modelo sino en el empaquetado: las matrices cuantizadas se almacenan como valores bf16 situados exactamente sobre la rejilla BFP4 o BFP8, de forma que TT-NN las empaqueta sin alterar su valor. Esto permite una verificación exacta (`torch.equal` tras el round-trip por dispositivo) y evita deriva numérica en la carga. El repositorio incluye utilidades (`pack_tensix.py`, `verify_grid.py`) para comprobar cada matriz, y se ha validado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim) y con tt-transformers sobre una Blackhole P150.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del modelo base Ministral 3 Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla `apply_chat_template`).
- Capacidades multilingües en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN y tt-transformers.
- Carga estándar vía `transformers` con `AutoModelForCausalLM` en bf16 sobre GPU/CPU para inspección o validación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Visión: no soportada (el torreón de visión y su proyector han sido eliminados en esta exportación).
- Audio: no soportado.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Un equipo con Wormhole o Blackhole puede servir un modelo de 14B en 10,58 GB de DRAM de dispositivo, dejando espacio para caché KV y buffers en tarjetas con memoria limitada.
- Inferencia de texto en producción con licencia permisiva: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de atribución adicionales más allá de las de la licencia.
- Asistentes conversacionales multilingües: cubre castellano, francés, alemán, italiano y portugués, lo que permite un único checkpoint para atención al cliente en varios mercados europeos.
- Validación y benchmarking de cuantización: el repositorio incluye scripts de verificación exacta, útil para investigadores que quieran medir la degradación de BFP4 frente a BF16 en tareas concretas.
- Sustitución de GPUs en entornos con restricciones de suministro: permite mantener un modelo instructivo de 14B en hardware Tensix cuando no hay disponibilidad de A100/H100.
- Prototipado en simulador: la exportación se ha probado en ttsim, lo que facilita el desarrollo y la integración continua sin hardware físico.
- Investigación sobre formatos de coma flotante por bloques: sirve como referencia reproducible de un pipeline GPTQ adaptado a BFP4/BFP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K) ni cifras de latencia o throughput medidas en hardware real; solo se indica que el demo de tt-transformers se ejecutó en una Blackhole P150 con configuración de precisión mixta.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 10,58 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole (probado en Blackhole P150).
- GPU consumer: no es el objetivo de esta exportación; para uso en GPU conviene el checkpoint BF16 original o una cuantización GGUF/AWQ estándar.
- Software de despliegue: tt-metal v0.81.1 con tt-transformers (requiere `--use_hf_rope`), ttnn 0.81.1, y `transformers` para carga de referencia.
- Simulación: ttsim (simulador Blackhole) permite validar sin hardware.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino |
|---|---|---|---|---|
| Xylolabs Ministral-3-14B Tensix BFP4 | 13,5 B | no disponible | Apache 2.0 | safetensors BFP4/BFP8 para Tensix |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5 B | no disponible | Apache 2.0 | safetensors BF16, uso general en GPU |
| Ministral 3 (otras exportaciones cuantizadas) | 13,5 B | no disponible | Apache 2.0 | GGUF/AWQ, no verificado en la información disponible |

La comparación relevante es contra el checkpoint BF16 del que deriva: misma arquitectura y mismos parámetros, con una reducción de peso de ~27 GB a 10,58 GB a costa de cuantizar MLP a 4,5 bits y atención a 8,5 bits. Frente a cuantizaciones GGUF convencionales, la diferencia es el destino: esta está pensada para TT-NN, no para llama.cpp.

## Limitaciones y advertencias

- Solo texto: no hay visión ni proyector multimodal en esta exportación.
- La cuantización BFP4 en MLP puede degradar la calidad frente a BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El demo de tt-transformers no aplica el escalado de query de Ministral 3 más allá de 16.384 tokens, por lo que las salidas largas pueden diferir de la referencia.
- En el demo, la LM head se empaqueta en BFP8, por lo que la cabeza no es exacta en ese contexto.
- Requiere `--use_hf_rope` en tt-transformers; sin él, el QKV fusionado se recuantiza.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base Mistral.
- Riesgo de alucinación: inherente a los modelos instructivos; no cuantificado en esta exportación.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base de Mistral por si hubiera términos adicionales.
- Madurez: repositorio con 85 descargas y 0 likes, creado y actualizado en noviembre de 2026; validación limitada a simulador y una P150.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Ministral-3-14B-Instruct-2512-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Código del pipeline: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal: https://github.com/tenstorrent/tt-metal
