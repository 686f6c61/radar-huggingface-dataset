# yujiepan/flint-tiny-random

## Resumen

`yujiepan/flint-tiny-random` es un checkpoint de depuración derivado de la arquitectura Flint del modelo base `RecursiveSI/flint`. No es un modelo entrenado: sus pesos se inicializan aleatoriamente con una semilla fija (42) y una desviación de 0,02, manteniendo el esquema de tensores, nombres y geometría estructural del modelo fuente. Su propósito es servir como banco de pruebas para el plugin de SGLang `flint_sglang`, que implementa las particularidades de Flint (attention sinks aprendidos, router sigmoide con top-k, shared expert, gramática de tool calling y parser de razonamiento) que el SGLang estándar no cubre.

El modelo conserva del original la arquitectura MoE con router sigmoide, normalización top-k, attention sinks aprendidos, QK norms y capas sin RoPE, pero reduce drásticamente las dimensiones: 8 capas en lugar de 49, hidden size de 32 en lugar de 2.048, 64 expertos enrutados en lugar de 256, y una única cabeza de atención de dimensión 32. El vocabulario y el embedding/LM-head se mantienen sin atar (untied) con 150.144 filas, lo que fija el tamaño mínimo práctico de la geometría BF16.

Su relevancia es instrumental: permite validar el pipeline de carga, el plugin de SGLang y el parseo de tool calling/razonamiento sin necesidad de descargar ni ejecutar el modelo real de gran tamaño. No debe usarse para inferencia con fines productivos ni para evaluar calidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con router sigmoide, top-k renormalizado, attention sinks aprendidos, QK norms y capas sin RoPE |
| Parametros totales | 10.896.424 |
| Parametros activos | 6 expertos enrutados por token (de 64), más shared expert |
| Longitud de contexto | 4.096 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (checkpoint almacenado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura replica el esquema de `RecursiveSI/flint` con geometría reducida. Consta de 8 capas, de las cuales las capas 0-1 son densas (MLP clásico) y el resto usan mezcla de expertos. El hidden size es 32, con 1 cabeza de atención y 1 cabeza KV de dimensión 32, y `intermediate_size` de 128 para las capas densas. En las capas MoE hay 64 expertos enrutados con 6 activos por token, un shared expert de anchura 64 y expertos enrutados de anchura 32. El router es sigmoide con renormalización top-k, y cada capa de atención incorpora `q_norm`, `k_norm` y un `softmax_offset` (attention sink aprendido) de tamaño `num_attention_heads`.

No ha habido entrenamiento: los pesos se generan con `torch.randn` sobre CPU con semilla 42 y escala 0,02, y los parámetros de normalización (`model.norm`, `input_layernorm`, `post_attention_layernorm`, `q_norm`, `k_norm`) se inicializan a unos. El checkpoint se construye directamente porque Transformers no implementa la clase Flint; los nombres y formas de tensor provienen de las cabeceras safetensors del modelo fuente y del wheel `flint_sglang-0.1.4`. El plugin de origen solo valida TP=1, por lo que este checkpoint no declara soporte de TP=4.

## Capacidades

- No tiene capacidades lingüísticas reales: al estar inicializado aleatoriamente, su salida es ruido estadístico sin coherencia.
- Sirve para validar la carga del checkpoint con el plugin `flint_sglang` en SGLang.
- Permite probar el parser de tool calling (`--tool-call-parser flint`) y el parser de razonamiento (`--reasoning-parser flint`) del plugin.
- Permite probar el backend de gramática (`--grammar-backend flint`) y el `--enable-fp32-lm-head`.
- Ejercita la ruta de ejecución MoE con `--moe-runner-backend triton` y attention backend `fa3`.
- No soporta tool calling, agentes, multilingüismo ni razonamiento de forma funcional; solo expone la estructura para testear esas rutas.

## Casos de uso

- Depuración del plugin de SGLang: cargar el checkpoint con `SGLANG_EXTERNAL_MODEL_PACKAGE=flint_sglang` para verificar que el plugin resuelve correctamente nombres de tensor, shapes y capas sin RoPE.
- Test de integración de CI: ejecutar un arranque de servidor SGLang con este checkpoint en pipelines de integración continua para detectar regresiones en el plugin sin coste de GPU de gran tamaño.
- Validación de parseo de tool calling: enviar prompts con gramáticas de herramientas y comprobar que `--tool-call-parser flint` extrae llamadas correctamente, independientemente de la calidad del texto generado.
- Prueba del parser de razonamiento: verificar que el canal de razonamiento se separa del contenido final en la salida del servidor.
- Verificación de attention sinks y QK norms: comprobar que las rutas de atención con `softmax_offset` y normalizaciones se ejecutan sin errores en el backend `fa3`.
- Test de routing MoE: validar que el router sigmoide con top-k renormalizado selecciona 6 expertos por token y que el shared expert se suma correctamente.
- Benchmark de latencia del plugin: medir el overhead del plugin frente a SGLang estándar con un modelo de tamaño despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un checkpoint con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (21,9 MB de pesos más overhead de activaciones y KV cache).
- GPU recomendadas: cualquier GPU compatible con SGLang y FlashInfer; el plugin usa `--attention-backend fa3`, que requiere arquitecturas Hopper (H100) o superior para FA3, aunque puede probarse con backends alternativos.
- Cabe en cualquier GPU consumer (RTX 3060, 4090, etc.) y probablemente en CPU con los backends adecuados, aunque SGLang está orientado a GPU.
- Opciones de despliegue: SGLang con el wheel `flint_sglang-0.1.4`; no compatible con vLLM, llama.cpp, Ollama ni TGI sin adaptación, ya que Transformers no implementa Flint.
- Latencia y throughput: no disponibles; al ser un modelo de 10,9 M de parámetros, la latencia estará dominada por el overhead del servidor y del plugin, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| yujiepan/flint-tiny-random | 10,9 M | 4.096 | Depuracion del plugin Flint en SGLang | no disponible |
| RecursiveSI/flint | no disponible (modelo fuente completo) | no disponible | Modelo real de la arquitectura Flint | no disponible |
| Checkpoints tiny-random de otras familias (p. ej. Llama, Qwen) | variable (típicamente 1-50 M) | variable | Depuracion de pipelines de carga e inferencia | generalmente igual a la del modelo base |

La comparativa con alternativas de la misma categoría (modelos tiny-random de depuración) es estructuralmente equivalente: todos comparten el objetivo de validar tooling, no de producir texto útil. La diferencia clave es que este checkpoint requiere el plugin propietario `flint_sglang` y no funciona con Transformers estándar.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto coherente ni respuestas útiles; cualquier salida es ruido.
- No apto para producción: no debe desplegarse para atender usuarios ni para evaluar calidad.
- Dependencia de plugin externo: requiere el wheel `flint_sglang-0.1.4` y variables de entorno específicas (`SGLANG_EXTERNAL_MODEL_PACKAGE`, `FLASHINFER_USE_CUDA_NORM`).
- Sin soporte de paralelismo validado: el plugin de origen solo valida TP=1; tensor, expert y pipeline parallelism están marcados como no validados.
- Licencia no disponible: no se puede confirmar el uso comercial; al derivar de `RecursiveSI/flint`, la licencia del modelo base condiciona cualquier uso.
- Idiomas no disponibles: no hay información sobre cobertura lingüística.
- Riesgo de alucinación: total, al no haber aprendizaje; no aplica en el sentido habitual, pero la salida es impredecible.
- El ejemplo de uso en SGLang está marcado como "unverified" por el propio autor.

## Enlaces

- Hugging Face: https://huggingface.co/yujiepan/flint-tiny-random
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio SGLang: https://github.com/sgl-project/sglang
- Documentación de SGLang: https://docs.sglang.ai/
