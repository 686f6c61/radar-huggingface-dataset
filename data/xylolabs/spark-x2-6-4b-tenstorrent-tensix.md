# Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix

## Resumen

Spark-X2.6-4B-Tenstorrent-Tensix es una distribucion cuantizada del modelo base XHToken/Spark-X2.6-4B, publicada por Xylolabs, especificamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una adaptacion de pesos que aplica cuantizacion en bloque de coma flotante (block floating point, BFP) mediante la herramienta tensix-bfp-gptq, con el objetivo de que el modelo pueda ejecutarse de forma nativa en hardware de inferencia de Tenstorrent a traves de las pilas tt-metal y ttnn.

El modelo base pertenece a la familia Spark-X2.6, orientada a agentes en dispositivo (on-device agents), segun la cita del equipo SparkLLM. La distribucion incluye dos variantes de precision: bfp8 (MLP y atencion en bfloat8_b, el resto en bf16) y bfp4 (MLP y atencion en bfloat4_b, el resto en bf16), cada una en su propia carpeta junto con los scripts de empaquetado y verificacion.

La relevancia de esta ficha radica en que demuestra un flujo de cuantizacion especifico para aceleradores Tenstorrent, con metricas de divergencia KL frente a BF16 y frente a una referencia Q4_K_M de llama.cpp, lo que permite evaluar la perdida de calidad de forma cuantitativa antes de desplegar en produccion sobre NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Spark-X2.6-4B; transformer con atencion deslizante y atencion completa parcial, segun referencias a sliding layers y full-attention layers en la model card) |
| Parametros totales | 4B (segun nombre del modelo; el titulo de la cita indica "4B&1.7B", sin desglose disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (BFP4), bfloat8_b (BFP8), bf16 para el resto de capas; referencia Q4_K_M en llama.cpp |
| Idiomas soportados | en, zh (segun metadatos); la evaluacion KL incluye texto en ingles y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con carpetas separadas bfp4/ y bfp8/; incluye quant4.json, model.safetensors.index.json, pack_tensix.py, verify_grid.py y spark_layout.py |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. La model card de esta distribucion menciona de forma indirecta la existencia de capas con atencion deslizante (sliding layers) y capas de atencion completa (full-attention layers), con una periodicidad de "cada cuarta capa de atencion completa" en relacion con la permutacion de filas q y k de las matrices fusionadas q_k_v_proj. Tambien se mencionan 36 matrices fusionadas q_k_v_proj, lo que sugiere una arquitectura transformer con proyecciones qkv fusionadas y atencion con rotary positional embeddings (RoPE) de tipo parcial en algunas capas.

En cuanto al entrenamiento, no se aportan datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion BFP para Tensix: las matrices de MLP y atencion se empaquetan en la rejilla BFP del dispositivo, con una excepcion documentada para las 36 matrices q_k_v_proj, cuyas filas q y k se permutan al orden de filas del dispositivo antes del empaquetado (pares rotatorios adyacentes en capas deslizantes, con el diseno de rotacion parcial aplicado primero en cada cuarta capa de atencion completa), manteniendo las filas v sin cambios. La permutacion es reversible mediante spark_layout.py. El codigo del modelo se distribuye sin cambios respecto al modelo base (configuration_spark.py, modeling_spark.py) y requiere trust_remote_code=True; esta orientado a transformers 4.57.1 y necesita dos ajustes para funcionar en transformers 5.x.

## Capacidades

- Generacion de texto en ingles y chino, segun los idiomas declarados en los metadatos.
- Ejecucion en NPU Tensix de Tenstorrent (Wormhole y Blackhole) mediante tt-metal y ttnn.
- Carga en transformers con trust_remote_code=True y dtype bfloat16, con soporte de plantilla de chat (apply_chat_template).
- Empaquetado y verificacion de matrices en la rejilla BFP del dispositivo mediante scripts incluidos (pack_tensix.py, verify_grid.py), con opcion --device para round-trip de valores empaquetados.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Despliegue de generacion de texto sobre NPU Tenstorrent: el modelo puede cargarse en Wormhole o Blackhole usando las carpetas bfp8 o bfp4 y ejecutarse a traves de ttnn, lo que permite aprovechar aceleradores Tenstorrent en lugar de GPU para inferencia de un modelo de 4B.
- Evaluacion de perdida de calidad por cuantizacion: las metricas de KL medio frente a BF16 (0,00091 para bfp8 y 0,06221 para bfp4) permiten decidir que formato usar segun la tolerancia a degradacion en una aplicacion concreta, comparando ademas con la referencia Q4_K_M (0,06088).
- Prototipado de agentes en dispositivo: dado el enfoque del modelo base en agentes on-device, la variante bfp8 (4,685 GB empaquetados) es adecuada para entornos con memoria limitada donde se requiera fidelidad cercana a BF16.
- Verificacion de integridad de pesos cuantizados en pipelines de CI: los scripts pack_tensix.py y verify_grid.py permiten automatizar la comprobacion de que las matrices empaquetadas coinciden con la rejilla BFP esperada antes de desplegar en produccion.
- Investigacion sobre formatos BFP en aceleradores: la publicacion documenta el proceso de permutacion de filas q y k en matrices qkv fusionadas, lo que sirve como referencia para reproducir el flujo con otros modelos sobre Tensix.
- Inferencia multilingue ingles-chino en hardware de bajo consumo: el modelo declara soporte de en y zh, y la evaluacion KL cubre texto en ingles y coreano, lo que permite estimar el comportamiento en idiomas no declarados antes de usarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de divergencia KL frente a BF16:

| Formato | Tamano empaquetado (GB) | KL medio a BF16 |
|---|---|---|
| bfp4 | 2,798 | 0,06221 |
| bfp8 | 4,685 | 0,00091 |
| BF16 (base) | 8,22 | 0 |
| Q4_K_M (llama.cpp) | 2,600 | 0,06088 |

La evaluacion KL cubre 16.288 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, con un limite de KL medio de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM o memoria del acelerador estimada: 2,798 GB para bfp4 y 4,685 GB para bfp8 (tamanos empaquetados); BF16 requiere 8,22 GB.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, mediante tt-metal y ttnn.
- No se documenta en la informacion disponible el soporte en GPU consumer (RTX 4090 y similares) ni en A100/H100; la carga en transformers se describe con device_map="auto", pero el empaquetado BFP esta orientado al dispositivo Tensix.
- Opciones de despliegue: ttnn con ttnn.as_tensor y layout TILE_LAYOUT en DRAM_MEMORY_CONFIG; transformers con trust_remote_code=True (transformers 4.57.1, con ajustes para 5.x); scripts pack_tensix.py y verify_grid.py para empaquetado y verificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tenstorrent-Tensix (bfp8) | 4B | no disponible | Apache 2.0 | Hugging Face | Cuantizado BFP8 para Tensix; KL 0,00091 |
| Spark-X2.6-4B-Tenstorrent-Tensix (bfp4) | 4B | no disponible | Apache 2.0 | Hugging Face | Cuantizado BFP4 para Tensix; KL 0,06221 |
| XHToken/Spark-X2.6-4B (BF16) | 4B | no disponible | Apache 2.0 | Hugging Face | Modelo base sin cuantizar; 8,22 GB |
| Q4_K_M de llama.cpp (referencia) | 4B | no disponible | Apache 2.0 | llama.cpp | Referencia de cuantizacion; KL 0,06088; 2,600 GB |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La distribucion esta orientada a NPU Tensix de Tenstorrent; no se documenta su funcionamiento en GPU o CPU, por lo que no debe asumirse portabilidad fuera de ese hardware.
- El codigo del modelo requiere trust_remote_code=True; la model card recomienda leer configuration_spark.py y modeling_spark.py antes de ejecutarlos.
- Incompatibilidad parcial con transformers 5.x: requiere convertir _tied_weights_keys en un mapa y ajustar las llamadas a create_causal_mask y create_sliding_window_causal_mask para usar inputs_embeds.
- La variante bfp4 presenta un KL medio de 0,06221, superior al de bfp8 (0,00091) y ligeramente superior al de Q4_K_M (0,06088); puede implicar mayor degradacion en tareas sensibles a la fidelidad.
- Las 36 matrices q_k_v_proj requieren la permutacion de filas q y k documentada; omitirla puede romper la equivalencia con la rejilla BFP del dispositivo.
- Idiomas declarados: en y zh; la evaluacion KL incluye coreano, pero no se garantiza calidad en otros idiomas.
- No se documentan sesgos conocidos, riesgo de alucinacion ni restricciones adicionales de licencia; la licencia es Apache 2.0, lo que permite uso comercial segun los terminos de dicha licencia.
- No se dispone de datos sobre contexto maximo, por lo que no puede evaluarse su idoneidad para tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio de codigo tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Script de permutacion: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix/blob/main/bfp4/spark_layout.py
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix/blob/main/LICENSE
