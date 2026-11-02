# yujiepan/minicpm-v-4.7-tiny-random

## Resumen

`yujiepan/minicpm-v-4.7-tiny-random` es un checkpoint de tamaño reducido generado de forma sintética a partir de `openbmb/MiniCPM-V-4.7-1B`, el modelo multimodal (imagen, vídeo y texto) de la familia MiniCPM-V desarrollado por OpenBMB. No se trata de un modelo entrenado para producir respuestas útiles, sino de una réplica estructural con pesos inicializados aleatoriamente, pensada exclusivamente para pruebas de integración, depuración de pipelines y validación de código de carga e inferencia.

El interés técnico del repositorio reside en que reproduce fielmente la arquitectura del modelo original —atención híbrida con capas lineales y completas, M-RoPE, torre de visión con merger de inserción y vocabulario de 248.094 filas— pero con un backbone de solo 8 capas y anchuras mínimas (16 de hidden, 32 de MLP), lo que reduce el checkpoint de 3,11 GB a 23,11 MB y los elementos tensoriales de 1,55B a 11,54M. Esto permite ejecutar el flujo completo de `transformers` (procesador, plantilla de chat, imagen, vídeo, generación) en cuestión de segundos y sin necesidad de GPU de gran capacidad.

Es relevante ahora porque la ruta de atención lineal que emplea la arquitectura (heredada de Qwen3.5) requiere CUDA y Triton, de modo que un checkpoint mínimo verificable resulta muy práctico para comprobar que el entorno, la versión de `transformers` (>=5.18.0) y los kernels están correctamente instalados antes de desplegar el modelo real de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM-V 4.7 dense con atención híbrida (3 capas lineales + 1 capa full por ciclo), torre de visión y M-RoPE |
| Parametros totales | 11,54M elementos tensoriales en BF16 (modelo original: 1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El checkpoint replica la topología de MiniCPM-V 4.7: un transformer denso con atención híbrida que alterna tres capas de atención lineal y una de atención completa por ciclo, con 8 cabezas de consulta, 2 cabezas KV y dimensión de cabeza 256. La atención lineal emplea 16 cabezas de clave y valor con dimensión 128. El modelo original tiene 24 capas y seis ciclos completos; esta versión reducida conserva 8 capas y dos ciclos, con anchura oculta de 16 y anchura MLP de 32. La torre de visión se reduce de 27 capas y anchura 1.152 a 4 capas y anchura 128, con el merger de inserción tras la capa 2 en lugar de tras la 6.

Se mantienen invariantes el vocabulario (248.094 filas, embeddings no atados), la configuración de M-RoPE (canvas con secciones 11/11/10 y fracción parcial 0,25) y la declaración de una capa MTP en la configuración, aunque sin tensores MTP en el checkpoint. Los pesos son aleatorios: no ha habido entrenamiento, ajuste fino, RLHF ni DPO. La única "innovación" verificable es la preservación exacta de la estructura para pruebas, incluida la ruta de atención lineal que exige CUDA y Triton (verificada según la model card en una NVIDIA A800-SXM4-80GB).

## Capacidades

- Carga y ejecución del pipeline `image-text-to-text` con `AutoModelForImageTextToText` y `AutoProcessor`.
- Procesamiento conjunto de imagen y vídeo predecodificado en una misma conversación multimodal.
- Aplicación de plantilla de chat con opciones de preprocesado (`downsample_mode`, `max_num_frames`, `stack_frames`, `max_slice_nums`, `use_image_id`, `enable_thinking`).
- Generación de logits finitos y decodificación de tokens (salida sin significado semántico por pesos aleatorios).
- Verificación de integración con `transformers[torch]>=5.18.0`, `Pillow` y kernels Triton.
- No soporta tool calling, agentes, razonamiento multilingüe ni capacidades reales de visión: al no estar entrenado, no produce respuestas útiles.

## Casos de uso

- Pruebas de integración de pipelines multimodales: sirve para validar de extremo a extremo la carga del procesador, la construcción de mensajes con imagen y vídeo y la llamada a `generate` sin consumir recursos de un modelo de 1B.
- Depuración de kernels de atención lineal: al requerir CUDA y Triton, permite comprobar que el entorno (drivers, versión de Triton, `transformers`) ejecuta correctamente la ruta de atención antes de pasar al modelo real.
- CI/CD de librerías de inferencia: su tamaño de 23,11 MB permite incluirlo en suites de tests automáticos que verifiquen compatibilidad de versiones y APIs de `transformers`.
- Validación de plantillas de chat y preprocesado: útil para comprobar que las opciones de `apply_chat_template` (frames, slices, downsampling) producen tensores con las formas esperadas.
- Desarrollo de herramientas de inspección de modelos: permite probar scripts que analizan configuraciones, recuentos de tensores y estructuras de capas sin descargar checkpoints grandes.
- Formación y demos: sirve para ilustrar la arquitectura interna de MiniCPM-V 4.7 (capas híbridas, M-RoPE, torre de visión) con un artefacto ligero y rápido de inspeccionar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, MMMU) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint ocupa 23,11 MB en BF16 y los tensores son de dimensiones mínimas (hidden 16, MLP 32), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y Triton; la model card indica verificación en una NVIDIA A800-SXM4-80GB, pero no es necesario ese hardware para este checkpoint.
- GPU consumer: sí, cabe en cualquier RTX (incluso series antiguas) e incluso podría ejecutarse en CPU si no se usa la ruta de atención lineal, que exige CUDA y Triton.
- Opciones de despliegue: `transformers` (verificado), con `attn_implementation="sdpa"` y `device_map="cuda"`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del checkpoint, la ejecución del ejemplo de la model card es del orden de segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| yujiepan/minicpm-v-4.7-tiny-random | 11,54M (BF16) | no disponible | no disponible | Pruebas y depuración |
| openbmb/MiniCPM-V-4.7-1B | 1,55B (BF16) | no disponible | no disponible | Modelo multimodal real |
| Otros checkpoints "tiny-random" de la familia MiniCPM-V | no disponible | no disponible | no disponible | Pruebas y depuración |

La comparación directa con alternativas de la misma categoría (modelos multimodales de ~1B) no está disponible en la información proporcionada; el único pariente documentado es el modelo base del que deriva.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: no produce respuestas coherentes ni útiles; no debe usarse en producción ni para evaluación de calidad.
- Licencia no disponible: no se puede confirmar si permite uso comercial; hay que consultar la licencia del modelo base `openbmb/MiniCPM-V-4.7-1B`.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Longitud de contexto no documentada en la información disponible.
- La ruta de atención lineal requiere CUDA y Triton; en CPU o entornos sin Triton puede fallar.
- Dependencia de `transformers[torch]>=5.18.0` y `Pillow`; versiones anteriores pueden no cargar la arquitectura.
- La configuración declara una capa MTP sin tensores asociados: posibles inconsistencias si se inspecciona el checkpoint.
- Repositorio generado automáticamente (según la model card, por DeepSeek-V4.1-Flash): conviene revisar los scripts de creación antes de confiar en él para validaciones críticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yujiepan/minicpm-v-4.7-tiny-random
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
