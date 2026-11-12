# Xylolabs/Spark-X2.6-4B-Tensix-BFP4

## Resumen

Spark-X2.6-4B-Tensix-BFP4 es una versión cuantizada del modelo base XHToken/Spark-X2.6-4B, publicada por Xylolabs y orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original del base (identificada como `spark2_5`, con proyección q_k_v fusionada, puerta de salida por cabeza y MLP con GELU) y sustituye las capas lineales por matrices cuantizadas en formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4), generadas mediante GPTQ. El resultado son 4.447.623.680 parámetros con un peso empaquetado de 2,80 GB y 5,44 bits por peso de media.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo práctico de cuantización de bajo bit anclada al hardware: los pesos se almacenan en bf16 pero todos sus valores caen sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin recuantizar. Por otro, documenta con inusual honestidad las limitaciones de portabilidad: el modelo solo se ha validado en `ttsim` (simulador de Blackhole con ttnn 0.81.1), no en silicio real, y ni tt-metal ni tt-forge implementan todavía esta arquitectura.

El modelo está pensado para generación de texto conversacional en inglés y chino, con licencia Apache 2.0 y pesos en safetensors cargables desde transformers con `trust_remote_code=True`. No es un modelo de propósito general listo para producción: es un artefacto de investigación sobre cuantización BFP4 para NPUs de Tenstorrent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `spark2_5` (q_k_v_proj fusionada, puerta de salida por cabeza, MLP GELU) |
| Parametros totales | 4.447.623.680 (4,45 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en 36 capas lineales; bf16 en embedding, LM head, normas y resto de tensores; 5,44 bits/peso de media |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores sobre rejilla BFP4); repo de 8,9 GB, 2,80 GB empaquetados |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 4,45 B de parámetros con una variante denominada `spark2_5`. Sus rasgos distintivos son una proyección `q_k_v_proj` fusionada, una puerta de salida a nivel de cabeza y un MLP con activación GELU. El checkpoint cuantizado mantiene el código de modelo del autor original (`configuration_spark.py`, `modeling_spark.py`) sin modificaciones, por lo que transformers lo carga con `trust_remote_code=True`; el código apunta a transformers 4.57.1 y requiere dos ajustes en tiempo de ejecución para funcionar en la rama 5.x (mapa `_tied_weights_keys` y llamadas a `create_causal_mask`/`create_sliding_window_causal_mask` con `inputs_embeds`).

La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Se cuantizaron a BFP4 las proyecciones MLP `gate`, `up` y `down`, la `out_proj` de atención y la `q_k_v_proj` en las 36 capas (144 matrices verificadas como exactas sobre la rejilla más 36 fusionadas con una excepción de orden de filas). El embedding, la LM head (atada al embedding), las normas y el resto de tensores permanecen en bf16. No se documenta en la información disponible el volumen de tokens de preentrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino, con plantilla de chat aplicable mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas de propósito general, según el comportamiento esperado del modelo base (no se documentan evaluaciones específicas).
- Inferencia sobre aceleradores Tenstorrent Tensix mediante empaquetado directo de pesos a `ttnn.bfloat4_b` en TT-NN.
- Carga estándar en transformers con `trust_remote_code=True` y `device_map="auto"` en bf16.
- Compatibilidad de valores con `ttnn.bfloat8_b`: los mismos pesos empaquetados en BFP4 caben exactamente en BFP8, lo que permite usar una precisión mayor sin recuantizar.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en cuantización de bajo bit: sirve como referencia reproducible de GPTQ con búsqueda de exponente por bloque sobre una arquitectura no estándar, con scripts de verificación (`verify_grid.py`, `pack_tensix.py`) que comprueban la integridad de la rejilla valor a valor.
- Desarrollo y depuración de kernels TT-NN: permite validar el empaquetado de matrices a `bfloat4_b`, el layout TILE y el round-trip por DRAM del dispositivo antes de portar un modelo completo a tt-metal.
- Evaluación de portabilidad de arquitecturas a Tenstorrent: al no estar implementada `spark2_5` en tt-metal ni tt-forge, el checkpoint sirve para medir el coste de añadir una arquitectura nueva al stack (proyección fusionada, puerta por cabeza, MLP GELU).
- Simulación en `ttsim`: con ttnn 0.81.1 sobre el simulador de Blackhole se pueden estimar requisitos de memoria y validar el flujo de carga sin disponer de hardware físico.
- Prototipado de asistentes conversacionales bilingües en/zh de baja huella: 2,80 GB empaquetados permiten alojar el modelo en un espacio reducido de DRAM del acelerador, adecuado para demos internas.
- Estudio comparativo BFP4 frente a BFP8: al caber los mismos valores en ambos formatos, se puede aislar el efecto de la precisión de almacenamiento en la calidad de generación sin variaciones de calibración.
- Base para destilación o fine-tuning posterior: el checkpoint en safetensors bf16 es cargable en transformers y puede servir de punto de partida para adaptaciones sobre la arquitectura original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de perplejidad, y tampoco se han medido latencia o throughput en hardware real (las pruebas se hicieron en `ttsim`, el simulador de Blackhole).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8,9 GB de pesos más overhead de activaciones y caché KV; el repo completo ocupa 8,9 GB.
- Huella empaquetada en BFP4 para Tensix: 2,80 GB, lo que deja margen en la DRAM de un acelerador Wormhole o Blackhole para activaciones y caché KV.
- GPU recomendadas para la ruta transformers: no especificadas por el autor; por tamaño, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) es suficiente para cargar el modelo en bf16 con `device_map="auto"`.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM en bf16; no se documenta una ruta GGUF ni llama.cpp para este checkpoint.
- Opciones de despliegue: transformers 4.57.1 (objetivo declarado) o 5.x con los dos parches indicados; TT-NN 0.81.1 para empaquetado en Tensix. No hay soporte en tt-metal (v0.81.1: ni tt-transformers ni demos implementan `spark2_5`) ni validación en tt-forge (tt-xla).
- Latencia y throughput: no disponibles; no se han ejecutado pruebas en hardware Tensix real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tensix-BFP4 | 4,45 B | no disponible | BFP4 (GPTQ) + bf16 | Apache 2.0 | Hugging Face, validado solo en `ttsim` |
| XHToken/Spark-X2.6-4B (base) | 4,45 B | no disponible | bf16 | Apache 2.0 (segun el derivado) | Hugging Face, transformers |
| Alternativas de ~4 B para NPU Tensix | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros checkpoints cuantizados para Tensix con los que comparar parámetros, contexto o rendimiento. La comparación más directa es con el modelo base, del que este checkpoint solo difiere en la cuantización de las capas lineales.

## Limitaciones y advertencias

- No validado en hardware: todas las pruebas se hicieron con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no hay evidencia de ejecución en silicio Wormhole o Blackhole.
- Sin soporte en tt-metal: ni tt-transformers ni ningún demo de tt-metal implementan la arquitectura `spark2_5`.
- Sin validación en tt-forge (tt-xla): la propia model card indica que no se ejecutó con la comprobación de empaquetado.
- Excepción de rejilla en las 36 matrices `q_k_v_proj` fusionadas: se almacenan en el orden de filas del modelo base y solo caen sobre la rejilla BFP4 tras reordenar las filas de cada cabeza q y k (slot 2i toma la dimensión i, slot 2i+1 toma i+128; en capas de atención completa con 64 dimensiones rotatorias se recolocan primero los pares (i, i+32)). Empaquetadas tal cual, aproximadamente el 7 % de sus valores se recuantizarían.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; el modelo base tampoco aporta informes de sesgo en la información disponible.
- Cobertura idiomática limitada a inglés y chino; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- Dependencia de `trust_remote_code=True`: el código de modelo se distribuye sin auditar por terceros; conviene revisar `configuration_spark.py` y `modeling_spark.py` antes de ejecutarlos.
- Compatibilidad frágil con transformers: el objetivo es 4.57.1 (no probado según la card) y la rama 5.x exige dos parches en tiempo de ejecución.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de pruebas en hardware desaconseja su uso en producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tensix-BFP4/blob/main/LICENSE
