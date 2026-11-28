# tiny-random/ernie-5.5-flash-preview-fp8

## Resumen

`tiny-random/ernie-5.5-flash-preview-fp8` es un checkpoint de juguete generado automáticamente a partir de la arquitectura del modelo `baidu/ERNIE-5.5-Flash-Preview-FP8`. No es un modelo entrenado ni utilizable para tareas reales: se trata de una inicialización aleatoria de pesos con la misma estructura de capas, cabezas y configuración MoE que el modelo original, pero con dimensiones internas drásticamente reducidas. Su propósito declarado es el test y depuración de infraestructura de inferencia (concretamente SGLang) y de herramientas de carga de checkpoints.

El repositorio pesa 152,38 MB en un único `model.safetensors` y contiene 91.581.790 parámetros totales según los metadatos de safetensors. La model card documenta con detalle la correspondencia entre el checkpoint original (301,87 GB, 129 ficheros) y esta versión reducida, lo que lo convierte en un artefacto útil para validar pipelines de despliegue sin necesidad de aprovisionar cientos de gigabytes de VRAM.

La relevancia es por tanto operativa y no de calidad de modelo: permite reproducir el grafo de cómputo de ERNIE-5.5-Flash (atención híbrida HCA + MLA, MoE con expertos compartidos, decodificación especulativa DSpark) en una única GPU y con tiempos de carga de segundos, algo imposible con el checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (7 ciclos HCA + 1 MLA), capas densas y enrutadas, decodificación especulativa DSpark |
| Parametros totales | 91.581.790 |
| Parametros activos | 10 expertos enrutados de 16 por token (más 1 experto compartido); parámetros activos exactos no disponibles |
| Longitud de contexto | No disponible (el ejemplo de servicio usa `--context-length 2048`) |
| Tipos de cuantizacion | Pesos en BF16, F32 y FP8 E4M3 con bloques de 128x128 en lineales y expertos enrutados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (fichero único `model.safetensors`) |

## Arquitectura y entrenamiento

El modelo replica la topología de ERNIE-5.5-Flash-Preview con 15 capas de decodificador organizadas en dos ciclos de atención: siete capas HCA (4 cabezas, dimensión de cabeza 512) seguidas de una capa MLA (4 cabezas, con `qk_nope` 192, `rope` 64 y `v` 256, y latente KV-LoRA de 512). Incluye un indexador de atención con 64 cabezas, dimensión de cabeza 128 y top-k de 2048, además de cuatro flujos mHC con 20 iteraciones de Sinkhorn. La capa MoE contiene 16 expertos enrutados (10 activos por token) más un experto compartido, con anchura de experto y latente de 128 y una dimensión oculta densa de 128 con intermedia de 256. El vocabulario es de 201.216 tokens con embeddings no atados.

La decodificación especulativa usa el módulo DSpark con 3 capas de borrador, tamaño de bloque 7 y rango de Markov 8 (frente a 256 en el modelo original). Los lineales y expertos enrutados se almacenan en FP8 E4M3 con cuantización por bloques de 128x128, lo que explica la mezcla de dtypes del checkpoint (56,58M elementos BF16, 1,30M F32 y 33,70M F8_E4M3).

No hay entrenamiento: los pesos son aleatorios. La model card no documenta datos de entrenamiento, tokens procesados, ni fases de RLHF/DPO, y el propio autor indica que el repositorio está generado por un modelo (GPT-6.1-Sol) con fines de depuración.

## Capacidades

- No dispone de capacidades funcionales: al ser pesos aleatorios, la generación de texto es ruido y no refleja conocimiento alguno.
- Sirve como banco de pruebas para validar la carga de checkpoints con atención comprimida KV y MoE en SGLang.
- Permite verificar el pipeline de tokenización y composición de prompts de chat (mensajes de sistema e historial multi-turno) del tokenizador Python incluido.
- Útil para probar el endpoint compatible con OpenAI (`/v1/chat/completions`) en despliegues SGLang.
- Valida la ruta de decodificación con CUDA graph completo y la captura de grafo en fase de decode.
- No soporta tool calling, agentes, visión, audio ni razonamiento reales; cualquier comportamiento de ese tipo sería espurio.

## Casos de uso

- Pruebas de integración de SGLang en CI: el checkpoint permite arrancar un servidor con la misma arquitectura que ERNIE-5.5-Flash en segundos, validando flags como `--tp`, `--ep`, `--mem-fraction-static` y `--context-length` sin consumir GPUs de gran memoria.
- Depuración de kernels de atención comprimida: al mantener las dimensiones de cabeza HCA (512) y MLA (192/64/256) y el indexador top-k 2048, se pueden ejercitar las rutas de código de atención sin el coste del modelo completo.
- Validación de cuantización FP8 por bloques: reproduce la mezcla BF16/F32/F8_E4M3 con bloques 128x128, útil para comprobar conversores y herramientas de inspección de safetensors.
- Test de enrutamiento MoE: con 16 expertos y 10 activos por token se puede verificar el balanceo, la selección top-k y el comportamiento del experto compartido en escenarios de carga.
- Verificación de decodificación especulativa DSpark: las 3 capas de borrador y el bloque de 7 permiten probar la lógica de aceptación/rechazo de tokens en un entorno controlado.
- Pruebas de tokenizador y plantillas de chat: sirve para validar la composición de mensajes de sistema, historial multi-turno y el formato del endpoint OpenAI antes de migrar al checkpoint real.
- Benchmark de latencia de infraestructura: mide overhead de arranque, carga de pesos y throughput de red sin que el tiempo de cómputo del modelo domine la medición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería meaningless y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 91,58M de parámetros; el ejemplo oficial usa `--mem-fraction-static 0.3` con `--tp 2 --ep 2`, lo que sugiere un consumo de memoria estático moderado por el grafo CUDA y buffers de atención.
- GPU recomendadas: cualquier GPU con soporte FP8 y CUDA graph; el ejemplo está verificado con tensor parallelism 2 y expert parallelism 2, por lo que se probó en un nodo multi-GPU (modelos como A100, H100 o L40S son candidatos razonables).
- Cabe holgadamente en GPU de consumo (RTX 4090, RTX 3090, etc.), aunque la ruta FP8 E4M3 requiere Ada Lovelace o superior para aceleración nativa.
- Opciones de despliegue: SGLang es la única librería verificada, requiriendo la revisión del PR #51236 e instalación con `SGLANG_BUILD_RUST_EXTS=none`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, el cuello de botella será el overhead de serving y la captura de CUDA graph, no el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Propósito |
|---|---|---|---|---|---|
| tiny-random/ernie-5.5-flash-preview-fp8 | 91,58M | No disponible | No disponible | safetensors (FP8/BF16/F32) | Test de infraestructura |
| baidu/ERNIE-5.5-Flash-Preview-FP8 | No disponible (checkpoint de 301,87 GB, 129 ficheros) | No disponible | No disponible | safetensors FP8 | Modelo real de producción |
| Otros repos `tiny-random/*` de Hugging Face | Variable (típicamente <1B) | No disponible | No disponible | safetensors | Depuración de arquitecturas |

La comparación relevante es con el checkpoint original de Baidu: este repositorio conserva la topología (ciclos de atención, número de expertos, dimensiones de cabeza, indexador) pero reduce las dimensiones ocultas y el número de capas (15 frente a 43), y sustituye los pesos entrenados por inicialización aleatoria. Frente a otros `tiny-random`, la diferencia es que aquí se preservan rasgos arquitectónicos específicos (FP8 por bloques, DSpark, mHC) que otros repos de juguete no replican.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce texto coherente ni respuestas correctas; no debe usarse en producción ni en evaluaciones de calidad.
- Sesgos: no aplica en sentido estadístico, pero tampoco hay salvaguardas; cualquier salida es ruido y puede contener tokens arbitrarios del vocabulario.
- Alucinación: total por construcción; el modelo no tiene conocimiento factual.
- Licencia no disponible: no se puede asumir uso comercial; además, al derivar de `baidu/ERNIE-5.5-Flash-Preview-FP8`, podrían aplicar restricciones del modelo base no reflejadas en este repo.
- Idiomas: no documentados; el tokenizador cubre 201.216 tokens, pero no hay garantía de cobertura multilingüe funcional.
- Dependencia de una revisión concreta de SGLang (PR #51236): otras versiones pueden no cargar el checkpoint o deshabilitar incorrectamente los grafos de prefill.
- El contexto máximo real no está documentado; el ejemplo usa 2048 tokens, pero no se confirma si es el límite arquitectónico o una elección de prueba.
- Generado automáticamente por GPT-6.1-Sol: la fidelidad estructural debe validarse contra el código en `.meta/create_model.py` y `.meta/model.log` antes de confiar en él para pruebas críticas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/ernie-5.5-flash-preview-fp8
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Script de creación: https://huggingface.co/tiny-random/ernie-5.5-flash-preview-fp8/blob/main/.meta/create_model.py
- Log de estructura del modelo: https://huggingface.co/tiny-random/ernie-5.5-flash-preview-fp8/blob/main/.meta/model.log
- Entorno de generación: https://huggingface.co/tiny-random/ernie-5.5-flash-preview-fp8/blob/main/.meta/env.json
- PR de SGLang #51236: https://github.com/sgl-project/sglang/pull/51236
- Repositorio SGLang: https://github.com/sgl-project/sglang
