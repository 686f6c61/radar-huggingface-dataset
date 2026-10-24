# yujiepan/spark-x2.6-tiny-random

## Resumen

`yujiepan/spark-x2.6-tiny-random` es un modelo de depuración de 2.138.512 parámetros publicado por el desarrollador yujiepan. No es un modelo entrenado: se trata de una inicialización aleatoria (`torch.nn.init.normal_`, media 0, desviación 0,02, semilla 42; normas a 1) construida con la configuración y el código de modelado de `XHToken/Spark-X2.6-4B`, un modelo compacto de la serie Spark-X2.6 orientado a despliegue en dispositivo. Su propósito es exclusivamente permitir que herramientas, pipelines y tests de integración carguen y ejecuten la arquitectura Spark2_5 real sin necesidad de descargar los pesos completos.

La relevancia es, por tanto, ingenieril y no de capacidad: reproduce fielmente la estructura del modelo fuente (vocabulario de 131.072 entradas con embeddings atados, atención con ventana deslizante de 512 tokens combinada con atención completa, puerta de salida por cabeza con activación sigmoide, RMSNorm con eps 1e-6, activación GELU, precisión BF16) reduciendo las dimensiones a valores mínimos. El resultado es un repositorio de 4,3 MB en un único `model.safetensors` que se puede cargar en CPU en segundos.

Es importante subrayar que el modelo no genera lenguaje coherente: sus pesos son ruido aleatorio y su salida es una secuencia arbitraria de tokens del vocabulario. Toda evaluación de calidad, benchmarks o uso en producción debe hacerse contra el modelo base, no contra este artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Spark2_5 (código remoto `modeling_spark.py`), atención híbrida: ciclos de 3 capas con sliding attention + 1 capa con atención completa |
| Parametros totales | 2.138.512 (según safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; la ventana de atención deslizante es de 512 tokens |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en BF16 |
| Idiomas soportados | No disponible (el tokenizador se copia del modelo base, pero los pesos son aleatorios) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 4,3 MB) en BF16 |

Otros parámetros estructurales declarados en la model card: 8 capas, `hidden_size` = 16, `head_dim` = 32, 1 cabeza de consulta y 1 cabeza de clave/valor, anchura de MLP = 64, embeddings atados con `padding_idx` = 2, `input_layernorm` y `post_attention_layernorm` de tipo RMSNorm, `q_k_v_proj` con salida de 96 dimensiones y `g_proj` con salida de 1 dimensión (puerta por cabeza).

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atención híbrida por capas: el patrón `layer_types` se construye como dos ciclos de tres capas de atención deslizante seguidas de una capa de atención completa (`["sliding_attention"] * 3 + ["full_attention"]` repetido dos veces), lo que da las 8 capas totales. La ventana deslizante se mantiene en 512 tokens, igual que en el modelo fuente. La atención se resuelve con `eager_attention_forward` invocado directamente, sin ruta de despacho a SDPA ni a FlashAttention; la model card justifica esta decisión indicando que la implementación original se comporta así y que no se quiere "anunciar falsamente" un backend optimizado.

No hay entrenamiento de ningún tipo. El script incluido en la model card descarga el `config.json`, `configuration_spark.py` y `modeling_spark.py` del repositorio `XHToken/Spark-X2.6-4B` (revisión `66e3ae7bee54e0a523d692cb8ef841f35409807b`), sobrescribe `hidden_size=16`, `head_dim=32`, `num_attention_heads=1`, `num_key_value_heads=1`, `intermediate_size=64` y `num_hidden_layers=8`, aplica dos parches de compatibilidad de API para Transformers 5.19 (cambio de `_tied_weights_keys` a diccionario y ajuste de los nombres de los argumentos `inputs_embeds` y `cache_position`) y guarda el modelo con pesos inicializados aleatoriamente. Los ficheros de tokenizador y plantilla de chat (`chat_template.jinja`, `generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian literalmente del modelo base.

El mecanismo de puerta de salida por cabeza (`g_proj` + sigmoide) y el uso de embeddings atados entre `model.embedding.weight` y `lm_head.weight` son los dos detalles estructurales más relevantes que este tiny model permite ejercitar. El repositorio declara haber sido generado por "GPT-6.1-Sol" e incluye el entorno de pruebas usado: `huggingface_hub` 2.3.0, `safetensors` 0.8.0, `tokenizers` 0.23.3, `torch` 2.13.0 y `transformers` 5.19.0.

## Capacidades

- Carga y ejecución de la arquitectura Spark2_5 con `AutoModelForCausalLM` y `trust_remote_code=True`; el ejemplo de la model card está verificado con Transformers.
- Generación de tokens con `model.generate()` (por ejemplo, `min_new_tokens=10`, `max_new_tokens=10`), útil para comprobar que el bucle de decodificación y el manejo de `cache_position` funcionan.
- Verificación del tokenizador del modelo base: vocabulario de 131.072 entradas, embeddings atados, `padding_idx=2` y plantilla de chat Jinja.
- Prueba del patrón de atención híbrida (3 capas deslizantes + 1 completa) y de la ventana de 512 tokens.
- Prueba de la puerta de salida por cabeza y de las rutas de normalización RMSNorm.
- No dispone de razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo reales: sus pesos son aleatorios.
- No se declaran modos especiales (thinking, decodificación especulativa) en la información disponible.

## Casos de uso

- Tests de integración en CI/CD: cargar el modelo con `transformers` en cada ejecución del pipeline para detectar roturas de API en `modeling_spark.py` o en el cargador de código remoto, con un coste de 4,3 MB de descarga y sin GPUs.
- Validación de versiones de Transformers: el repositorio incluye parches explícitos para la API de Transformers 5.19, por lo que sirve como caso de prueba de compatibilidad hacia delante al actualizar la librería.
- Pruebas de formas y máscaras de atención: ejercitar el patrón `sliding_attention`/`full_attention` y la ventana de 512 tokens con tensores pequeños para verificar máscaras, `cache_position` y `past_key_values` en contextos con y sin padding.
- Desarrollo de kernels y backends de atención: al usar `eager_attention_forward` sin ruta SDPA ni FlashAttention, es un banco de pruebas controlado para comparar implementaciones alternativas antes de portarlas al modelo de 4B.
- Verificación de embeddings atados: comprobar que `lm_head.weight` y `model.embedding.weight` apuntan al mismo tensor tras `save_pretrained`/`from_pretrained` con `safe_serialization=True`, un error habitual en modelos con `custom_code`.
- Pruebas de empaquetado y despliegue: validar scripts de servido, conversión, firma de artefactos o empaquetado en contenedores con un modelo cuyo tiempo de arranque en CPU es de milisegundos.
- Docencia y ejemplos: ilustrar la estructura interna de un transformer moderno (GQA, atención deslizante, puertas por cabeza, RMSNorm) imprimiendo el modelo con dimensión 16 sin necesidad de hardware especial.
- Pruebas de la capa de tokenización y plantilla de chat: validar el renderizado de `chat_template.jinja` y el manejo de tokens especiales del modelo base sin cargar 4B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería inaplicable: los pesos son una inicialización aleatoria y la salida no es lenguaje coherente. Tampoco se han publicado medidas de latencia o throughput para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 4,3 MB en BF16 (2,14 M parámetros × 2 bytes), más el overhead del runtime de PyTorch; en la práctica, decenas o cientos de MB según el contexto de ejecución del framework.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU con soporte BF16, incluida una RTX 4090, una A100 o una H100, y también en GPUs integradas.
- Cabe en CPU: sí, es el escenario previsto; el ejemplo de la model card selecciona `cuda` si está disponible y cae a `float32` en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la única vía verificada. No hay indicios de soporte en vLLM, TGI, llama.cpp u Ollama: la arquitectura es código remoto personalizado y no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponibles de forma publicada; por el tamaño, la generación de decenas de tokens en CPU es del orden de milisegundos, pero no se ha medido ni documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `yujiepan/spark-x2.6-tiny-random` | 2.138.512 | No disponible (ventana deslizante de 512) | No disponible | Depuración y tests de la arquitectura Spark2_5 |
| `XHToken/Spark-X2.6-4B` (modelo base) | Aproximadamente 4.000 millones (según el nombre del repositorio) | No disponible en la información consultada | No disponible | Modelo generalista compacto para despliegue en dispositivo |
| Familias `tiny-random` de Hugging Face (por ejemplo, `hf-internal-testing/tiny-random-*`) | No disponible | No disponible | No disponible | Mismo propósito de depuración, con arquitecturas distintas |

La comparación relevante es estructural, no de rendimiento: frente al modelo base, el tiny comparte vocabulario, tokenizador, patrón de atención, ventana deslizante, puerta por cabeza, precisión BF16 y semántica de embeddings atados, pero reduce capas de 36 a 8, `hidden_size` de 2.560 a 16, dimensión de cabeza de 256 a 32, cabezas de consulta de 16 a 1, cabezas KV de 4 a 1 y anchura de MLP de 10.240 a 64. No se dispone de datos de benchmarks de ninguno de los dos modelos en la información proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y produce texto incoherente. No debe usarse para generación, evaluación de calidad ni ninguna tarea de usuario final.
- `trust_remote_code=True` es obligatorio y ejecuta código Python del repositorio (`configuration_spark.py`, `modeling_spark.py`) en la máquina del usuario; conviene revisarlo y fijar una revisión concreta antes de usarlo en entornos compartidos.
- Acoplamiento a Transformers 5.19: el código remoto se ha parcheado con reemplazos de cadena para esa versión; con otras versiones pueden aparecer errores en `inputs_embeds`, `cache_position` o en la gestión de pesos atados.
- Solo atención eager: no hay ruta SDPA ni FlashAttention, por lo que el rendimiento de atención es el del camino no optimizado.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido ni bajo qué condiciones. Tampoco se declaran idiomas soportados.
- Longitud de contexto total no documentada: solo consta la ventana deslizante de 512 tokens; no se especifica `max_position_embeddings`.
- Riesgo de confusión de nombres: los resultados de búsqueda web para "Spark-X2.6" incluyen un modelo de iFLYTEK descrito como MoE de 293B-A30B con contexto de 1M de tokens. Ese modelo no corresponde ni a `XHToken/Spark-X2.6-4B` ni a este repositorio; no debe atribuirse ninguno de esos datos a esta ficha.
- Repositorio generado automáticamente (la model card indica "generated by GPT-6.1-Sol"), con cero descargas y cero likes en el momento de la consulta; no hay garantía de mantenimiento.
- El identificador del modelo en el ejemplo de la model card (`tiny-random/spark-x2.6`) no coincide con el ID real del repositorio (`yujiepan/spark-x2.6-tiny-random`); hay que sustituirlo al reproducir el código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujiepan/spark-x2.6-tiny-random
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio GitHub de la serie Spark-X2.6: https://github.com/XHToken/Spark-X2.6
- Perfil del autor en Hugging Face: https://huggingface.co/yujiepan/models
- Cuenta de GitHub del autor: https://github.com/yujiepan-work
- Ficha de un modelo homónimo de iFLYTEK (no relacionado, citada solo para evitar confusiones): https://lmspeed.net/model/spark-x2-6
