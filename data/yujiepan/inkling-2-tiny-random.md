# yujiepan/inkling-2-tiny-random

## Resumen

`yujiepan/inkling-2-tiny-random` es un modelo de prueba (tiny model) con inicialización aleatoria de pesos, derivado de `thinkingmachines/Inkling-2-Small`. Lo publica el usuario yujiepan en Hugging Face con el objetivo explícito de servir como banco de pruebas para depurar la integración de la arquitectura Inkling 2 en las librerías Transformers y SGLang. No es un modelo entrenado ni apto para uso en producción: sus pesos son aleatorios y su única función es validar que el código de carga, el enrutado de expertos, el pipeline multimodal y el módulo MTP (multi-token prediction) funcionan correctamente.

El modelo reproduce a escala reducida la estructura del Inkling 2 original: mezcla de expertos (MoE) con precisión mixta NVFP4/MXFP8, atención con ciclo de ventana deslizante y atención global, torre de visión para entrada image-text-to-text y un módulo MTP con block size 8. Con tan solo 10.788.940 parámetros totales y un repositorio de 0,1 GB, cabe en cualquier GPU consumer, lo que lo convierte en una herramienta práctica para desarrolladores que necesiten iterar rápido sobre el soporte de esta arquitectura sin reservar clústeres con cientos de GB de VRAM.

Su relevancia es instrumental: permite verificar extremo a extremo el loader de Transformers con expansión de pesos empaquetados a BF16, el servidor SGLang con tensor parallelism y expert parallelism, y el procesador multimodal, antes de desplegar el modelo grande de 393,48 GB. La model card indica que el repositorio ha sido generado por GPT-6.1-Sol y que las rutas de Transformers y SGLang están verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE, atención híbrida (5 SWA + 1 global) y torre de visión; incluye módulo MTP |
| Parametros totales | 10.788.940 |
| Parametros activos | no disponible (el modelo declara 96 expertos enrutados y 8 expertos por token, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | no disponible en la model card del tiny; el ejemplo de SGLang usa `--context-length 2048` |
| Tipos de cuantizacion | Pesos en BF16, F32, F8_E4M3 y U8 empaquetados; expertos en NVFP4 y MXFP8 (6 capas de cada uno); el loader de Transformers expande a BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` 18,8 MB y `mtp.safetensors` 4,0 MB) |

## Arquitectura y entrenamiento

La arquitectura replica la del Inkling 2 original a escala reducida. Consta de 12 capas decoder con 6 bloques de atención residual, un ciclo de atención de 5 capas de ventana deslizante (SWA) más 1 capa de atención global, repetido dos veces completas. La dimensión oculta es 32, con 24 cabezas de query, 4 cabezas KV y dimensión de cabeza 32. La capa MoE contiene 96 expertos enrutados con 8 expertos por token, en precisión mixta: 6 capas NVFP4 y 6 capas MXFP8. El vocabulario es de 201.024 tokens con embeddings atados (tied embeddings), a diferencia del modelo original que no los ata. La torre de visión tiene anchura 32 y 4 capas. El módulo MTP usa 5 capas, block size 8 y rango de Markov 8, con feature taps en las capas 5 y 12 (sentinel de normalización final).

No hay entrenamiento: los pesos son aleatorios. La model card documenta la correspondencia entre el checkpoint original (8,69B BF16, 565,33K F32, 128,42B F8_E4M3, 247,67B U8, 393,48 GB en 25 ficheros) y el tiny (9,97M BF16, 3,21K F32, 1,88M F8_E4M3, 940,03K U8, 22,82 MB en 2 ficheros). La innovación técnica relevante es la preservación del esquema de pesos empaquetados y precisión mixta del modelo grande, de modo que el tiny ejercita exactamente las mismas rutas de código que el despliegue real.

## Capacidades

- Generación de texto autoregresiva con `AutoModelForImageTextToText` y `model.generate`.
- Entrada multimodal image-text-to-text: el procesador acepta imágenes y el token `image_token` para condicionar la generación.
- Predicción multi-token (MTP) con 5 capas y block size 8, útil para decodificación especulativa en el modelo original.
- Enrutado MoE con 8 expertos por token sobre 96 expertos, ejercitando las rutas de expert parallelism.
- Soporte de tool calling y reasoning parser en SGLang mediante `--tool-call-parser inkling2` y `--reasoning-parser inkling`.
- Compatibilidad con endpoints (`endpoints_compatible`) y carga con `trust_remote_code=True` por el código custom de la arquitectura.
- No dispone de capacidades reales de razonamiento, código, matemáticas ni multilingüismo, al carecer de entrenamiento.

## Casos de uso

- Validación del loader de Transformers: cargar el modelo con la rama de Transformers que soporta Inkling 2 y comprobar que la expansión de pesos empaquetados (NVFP4/MXFP8 a BF16) produce tensores con las formas esperadas, sin necesidad de descargar los 393,48 GB del modelo grande.
- Depuración del servidor SGLang: arrancar `sglang serve` con `--tp 4 --ep 4`, `--attention-backend fa4` y `--enable-multimodal` para verificar el arranque, el reparto de expertos y la configuración de CUDA graphs (`decode bs [1,2,4]`, `prefill bs [128,2048]`) antes de escalar al modelo completo.
- Pruebas de integración continua: incluir el tiny en la suite de tests de una librería o fork de Transformers para detectar regresiones en la carga de arquitecturas con código custom y pesos empaquetados en cada commit.
- Validación del pipeline multimodal: ejecutar el ejemplo de la model card con una imagen sintética de 80x80 y `max_new_tokens=10` para comprobar que el procesador inserta correctamente el token de imagen y que la torre de visión produce embeddings compatibles con el decoder.
- Pruebas de decodificación especulativa: ejercitar el módulo MTP (`mtp.safetensors`) para verificar la lógica de feature taps y el block size 8 en el código de generación, sin coste computacional relevante.
- Benchmarking de infraestructura: medir latencia de arranque, tiempo de carga y consumo de memoria del stack SGLang o vLLM con un modelo de 0,1 GB antes de reservar GPUs para el despliegue del modelo de 393,48 GB.
- Desarrollo de parsers de razonamiento y tool calling: probar `--reasoning-parser inkling` y `--tool-call-parser inkling2` con salidas sintéticas para validar el formateo de llamadas a herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (10,79M parámetros, aproximadamente 22 MB de pesos más overhead de activaciones y caché KV); el ejemplo de SGLang reserva `--mem-fraction-static 0.2`.
- GPU recomendadas: cualquier GPU con soporte BF16; el ejemplo verificado usa tensor parallelism 4 y expert parallelism 4, por lo que se probó en un nodo de 4 GPUs. Para uso local basta una única GPU consumer.
- Cabe en GPU consumer: sí, en cualquier RTX con soporte BF16 (serie 30xx en adelante) e incluso en GPUs de gama baja o en CPU para pruebas de carga.
- Opciones de despliegue: Transformers con la rama de soporte Inkling 2 (`trust_remote_code=True`, `dtype=torch.bfloat16`, `device_map="cuda"`) y SGLang con la rama `f726172d760dea737c7f1e797c9f32efe14d1685`; la release general de SGLang no incluye esta arquitectura.
- Latencia y throughput: no disponibles de forma publicada; por el tamaño del modelo, la latencia vendrá dominada por el overhead de arranque y del runtime más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MoE | Licencia | Proposito |
|---|---|---|---|---|---|
| yujiepan/inkling-2-tiny-random | 10,79M | no disponible (ejemplo con 2048) | 96 expertos, 8 por token | no disponible | Pruebas y depuración de la arquitectura Inkling 2 |
| thinkingmachines/Inkling-2-Small (modelo base) | no disponible (checkpoint de 393,48 GB) | no disponible | 384 expertos, 8 por token | no disponible | Modelo real multimodal image-text-to-text |
| Modelos tiny de prueba de otras arquitecturas (p. ej. variantes `tiny-random` de Llama o Qwen) | del orden de millones | según configuración | generalmente densos | habitualmente igual que el modelo base | Validación de loaders y pipelines |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas, ya que el modelo no está entrenado.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce salidas coherentes ni útiles; cualquier texto generado es ruido estadístico.
- No apto para producción, investigación de capacidades ni evaluación de calidad; su único uso legítimo es el testing de infraestructura.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribución; hay que consultar la licencia del modelo base `thinkingmachines/Inkling-2-Small`.
- Idiomas no declarados; sin entrenamiento no hay competencia lingüística real.
- Requiere `trust_remote_code=True` y una rama específica de Transformers o SGLang; la release estable de SGLang no soporta la arquitectura, lo que introduce riesgo de deriva si las ramas no se mantienen.
- El contexto máximo real del tiny no está documentado; el valor 2048 del ejemplo de SGLang es una configuración de servicio, no una especificación del modelo.
- La model card indica que el repositorio ha sido generado por GPT-6.1-Sol; conviene auditar el código custom (`trust_remote_code`) antes de ejecutarlo en entornos compartidos.
- El recuento de parámetros activos no se publica, por lo que no se puede estimar el coste computacional por token del modelo base a partir de esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujiepan/inkling-2-tiny-random
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Rama de Transformers con soporte Inkling 2: https://github.com/huggingface/transformers/tree/c748111b3bb4d97df452f0fe60e63c480beb6fe6
- Rama de SGLang con soporte Inkling 2: https://github.com/sgl-project/sglang/tree/f726172d760dea737c7f1e797c9f32efe14d1685
- Script de creación del repositorio: `.meta/create_model.py` (dentro del repositorio de Hugging Face)
- Log de estructura del modelo: `.meta/model.log` (dentro del repositorio de Hugging Face)
- Entorno de generación: `.meta/env.json` (dentro del repositorio de Hugging Face)
