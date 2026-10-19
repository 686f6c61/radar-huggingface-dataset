# Yabau/qwen35moe-mtp-head-GGUF

## Resumen

`Yabau/qwen35moe-mtp-head-GGUF` es una cabeza MTP (multi-token prediction) empaquetada como GGUF independiente para modelos de la arquitectura `qwen35moe`. No es un modelo conversacional: es un sidecar de borrador (draft) que se carga junto al modelo principal para habilitar decodificacion especulativa MTP en cargadores compatibles con llama.cpp, mediante los flags `-md` y `--spec-type draft-mtp-adaptive`. Lo publica el usuario Yabau y deriva de `unsloth/Qwen3.6-35B-A3B-MTP-GGUF` (concretamente del fichero `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf`), cuyo origen es `Qwen/Qwen3.6-35B-A3B`.

El artefacto contiene unicamente el bloque MTP (`blk.40.*`, 20 tensores) mas los tensores de embeddings, LM head y normalizacion, con 1.861.040.640 parametros y un repositorio de 2,5 GB. El bloque se extrae de forma verbatim del modelo donante: no hay entrenamiento ni recuantizacion. Su utilidad es reducir la latencia de decodificacion del modelo MoE de 35B totales y 3B activos sin necesidad de entrenar ni servir un modelo draft separado con su propio vocabulario.

Es relevante ahora porque la decodificacion especulativa basada en MTP permite acelerar inferencia en produccion con un coste de memoria adicional pequeno (unos 2,5 GB) y sin romper la distribucion de salida del modelo principal, algo critico en despliegues de llama.cpp sobre GPU de gama alta o mixtas CPU/GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP (multi-token prediction) para `qwen35moe`: atencion densa + FFN MoE + proyecciones `nextn` (`eh_proj`, `enorm`, `hnorm`, `shared_head_norm`) |
| Parametros totales | 1.861.040.640 (solo la cabeza MTP y tensores auxiliares; el modelo base es de 35B totales) |
| Parametros activos | No disponible para la cabeza; el modelo base `Qwen3.6-35B-A3B` es MoE con 8 de 256 expertos activos (3B activos segun nomenclatura) |
| Longitud de contexto | No disponible (la ventana la define el trunk `qwen35moe` con el que se empareja) |
| Tipos de cuantizacion | Q4_K (`token_embd.weight` y bloque MTP con `UD-Q4_K_M` del donante), Q6_K (`output.weight`), F32 (`output_norm.weight`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (fichero unico), mas script `extract_mtp_head.py` para reconstruccion |

## Arquitectura y entrenamiento

La cabeza replica el bloque MTP del modelo donante: un bloque transformer adicional (`blk.40.*`) con atencion densa (16 cabezas, 2 cabezas KV, `head_dim` 256, secciones rope `11 11 10`), FFN MoE con 256 expertos de los que 8 estan activos, `moe_intermediate_size` 512 y expertos compartidos habilitados. Incluye las proyecciones `nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm` y `nextn.shared_head_norm` que conectan el estado oculto del trunk con la prediccion de tokens adicionales. Los metadatos declaran `block_count = 41` (40 capas de trunk mas 1 MTP), `nextn_predict_layers = 1` y una entrada adicional en `attention.recurrent_layers` para reflejar que el bloque MTP usa atencion densa.

No hay entrenamiento ni ajuste: el bloque se extrae de forma verbatim del GGUF donante en cuantizacion `UD-Q4_K_M` (esquema dinamico de unsloth), sin recuantizar sus tensores. Los embeddings se toman en Q4_K, la LM head en Q6_K y la normalizacion de salida en F32. El modelo base subyacente, `Qwen3.6-35B-A3B`, es un MoE de 35B parametros totales y 3B activos; la informacion disponible no detalla volumen de tokens, composicion del dataset ni etapas de RLHF/DPO del mismo.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa MTP sobre modelos `qwen35moe`.
- Aceleracion de la decodificacion del trunk mediante verificacion en paralelo de hasta `--spec-draft-n-max 8` tokens propuestos.
- Longitud de borrador adaptativa (`--spec-draft-n-min-adaptive 3`) segun la confianza del modelo principal.
- Integracion con cargadores compatibles con llama.cpp mediante la ruta `mtp_only` (los tensores del trunk se marcan como opcionales).
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags del repositorio).
- No genera texto de forma autonoma: requiere siempre el GGUF del trunk emparejado.
- Reutilizable para otras variantes: `extract_mtp_head.py` permite construir cabezas equivalentes a partir de un `--target` (metadatos, embeddings y LM head) y un `--source` (bloque MTP).

## Casos de uso

- Aceleracion de inferencia en produccion de `Qwen3.6-35B-A3B`: cargar la cabeza con `llama serve -m modelo.gguf -md qwen35moe-mtp-head-UD-Q4_K_M.gguf --spec-type draft-mtp-adaptive` reduce el coste por token generado al validar varios tokens candidatos por paso, sin cambiar el modelo servido.
- Despliegue de API compatible con OpenAI en llama.cpp: el tag `endpoints_compatible` permite exponer el modelo acelerado como endpoint y aprovechar la reduccion de latencia en servicios conversacionales multi-turno.
- Servidores con VRAM ajustada: al ser un sidecar de unos 2,5 GB, permite ganar velocidad sin alojar un draft model independiente de otro fabricante con vocabulario distinto.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: util para medir throughput y aceptacion de tokens frente a decodificacion autoregresiva estandar con el mismo trunk.
- Pipelines de generacion por lotes en single-GPU: con `-np 1` se evita la contencion de un unico slot y se maximiza la tasa de aceptacion del borrador en tareas de resumen o extraccion.
- Reconstruccion de cabezas MTP para variantes propias: a partir de un modelo ajustado con la misma arquitectura, `extract_mtp_head.py` permite generar una cabeza compatible y mantener la aceleracion tras un fine-tuning.
- Investigacion sobre MTP en arquitecturas MoE: el artefacto aisla el bloque `nextn` y facilita experimentos sobre el numero de tokens predichos y su tasa de aceptacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM adicional para la cabeza: aproximadamente 2,5 GB (tamano del repositorio, incluye pesos y metadatos), que se suman a la memoria del trunk.
- VRAM del trunk: no disponible en la informacion; a titulo orientativo, un GGUF Q4_K_M de un modelo de 35B parametros totales suele ocupar del orden de 20 GB, por lo que el conjunto requiere una GPU de 24 GB o superior para caber holgadamente en VRAM.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el conjunto completo en Q4_K_M; en GPUs de 16 GB puede requerirse offload parcial de capas a CPU.
- Cabe en GPU de consumo: si, la cabeza por si sola cabe en cualquier GPU con mas de 3 GB; el conjunto depende del trunk.
- Opciones de despliegue: llama.cpp (`llama serve` / `llama-server`) con `-md` y `--spec-type draft-mtp-adaptive`; no se documenta soporte en vLLM, TGI u Ollama para este artefacto concreto.
- Latencia y throughput: no disponibles; la ganancia depende de la tasa de aceptacion del borrador y del `--spec-draft-n-max` configurado (hasta 8 tokens propuestos, minimo adaptativo de 3).

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Yabau/qwen35moe-mtp-head-GGUF` (esta ficha) | 1,86B | No disponible | Cabeza MTP para decodificacion especulativa | No disponible | GGUF en HF, 35 descargas |
| `unsloth/Qwen3.6-35B-A3B-MTP-GGUF` (donante) | 35B totales / 3B activos (incluye bloque MTP) | No disponible | Modelo completo con bloque MTP embebido | No disponible | GGUF en HF |
| `Qwen/Qwen3.6-35B-A3B` (upstream) | 35B totales / 3B activos | No disponible | Modelo MoE completo sin sidecar separado | No disponible | Pesos originales en HF |
| Draft model pequeno independiente (generico, p. ej. 0,5B) | ~0,5B | No disponible | Decodificacion especulativa clasica | Variable | Amplia, pero requiere coincidencia de vocabulario |

La ventaja frente a un draft model independiente es que reutiliza el vocabulario (248.144 entradas) y el espacio latente del propio trunk, lo que suele elevar la tasa de aceptacion; la desventaja es la dependencia estricta de la arquitectura y de la cuantizacion del donante.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un trunk `qwen35moe` compatible no produce ninguna salida util.
- Acoplamiento estricto: exige arquitectura `qwen35moe`, trunk de 40 capas, `hidden_size` 2048, 16 cabezas / 2 KV, `head_dim` 256, rope `11 11 10`, 256 expertos con 8 activos, `moe_intermediate_size` 512, expertos compartidos y vocabulario de 248.144 entradas. Cualquier desviacion puede provocar fallos de carga o degradacion silenciosa.
- Procede de una extraccion verbatim del fichero `Qwen3.6-35B-A3B-UD-Q4_K_M.gguf`: no se ha reentrenado ni recuantizado, por lo que hereda las limitaciones y sesgos del modelo donante.
- Licencia no declarada en la informacion disponible: el uso comercial queda sin garantia juridica explicita hasta verificar la licencia del modelo base.
- Sin datos de benchmarks ni de tasa de aceptacion publicados; el beneficio real de latencia no esta cuantificado.
- Adopcion muy baja (35 descargas, 0 likes) y publicacion de un unico autor: no es un artefacto oficial de Qwen ni de unsloth.
- Riesgo de alucinacion y sesgos: los del trunk subyacente, no evaluados en esta ficha.
- Idiomas soportados no disponibles; la cobertura linguistica depende integramente del modelo principal.
- Solo se documenta compatibilidad con llama.cpp y su ruta `mtp_only`; otros runners pueden no reconocer los metadatos `nextn_predict_layers = 1`.
- El flag `-np 1` del ejemplo limita a un slot de servido; configuraciones multiproceso pueden reducir la eficacia del borrador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yabau/qwen35moe-mtp-head-GGUF
- Modelo donante: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- llama.cpp (soporte de `-md` y `--spec-type draft-mtp-adaptive`): https://github.com/ggml-org/llama.cpp
- Script de extraccion `extract_mtp_head.py`: incluido en el repositorio del modelo (requiere `pip install gguf`)
