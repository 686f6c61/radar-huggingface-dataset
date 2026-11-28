# tiny-random/ernie-5.5-flash-preview

## Resumen

`tiny-random/ernie-5.5-flash-preview` es un checkpoint de juguete generado automáticamente a partir de `baidu/ERNIE-5.5-Flash-Preview`, un modelo MoE de gran escala de Baidu. No es un modelo funcional: se trata de una inicialización aleatoria con la misma topología de capas y precisión que el modelo original, pero con dimensiones internas reducidas, pensada exclusivamente para pruebas de infraestructura y depuración de pipelines de inferencia.

El propósito del repositorio es permitir a los desarrolladores validar el soporte de SGLang para la arquitectura ERNIE 5.5 (atención híbrida HCA/MLA, expertos enrutados en MXFP4, decodificación especulativa DSpark) sin necesidad de descargar los 165,90 GB del checkpoint completo. El modelo original emplea 43 capas de decodificación con un ciclo de atención de 7 capas HCA más 1 MLA, 512 expertos enrutados (10 activos por token) y un vocabulario de 201.216 tokens.

Es relevante ahora porque documenta, a través de la comparación de tensores, detalles de arquitectura del ERNIE 5.5 Flash Preview que no están publicados de forma independiente. Sin embargo, al ser un modelo aleatorio de 105,5 millones de parámetros, no genera texto coherente ni debe usarse en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida HCA + MLA, decodificación especulativa DSpark |
| Parámetros totales | 105.510.366 |
| Parámetros activos | no disponible (el modelo base activa 10 de 512 expertos enrutados) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--context-length 2048`) |
| Tipos de cuantización | FP8 (e4m3, bloques 128x128) en lineales; MXFP4 (e2m1, escala UE8M0 por 32) en expertos enrutados; BF16 y F32 en otros tensores |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, 153,78 MB) |

## Arquitectura y entrenamiento

El checkpoint reproduce la estructura del ERNIE 5.5 Flash Preview con dimensiones reducidas: 15 capas de decodificación (frente a 43 del original) manteniendo el mismo ciclo de atención de 7 capas HCA más 1 MLA, 4 cabezas HCA de dimensión 512, 4 cabezas MLA con qk_nope 192, rope 64 y v 256, y latente KV-LoRA de 512. El MoE cuenta con 16 expertos enrutados (frente a 512) con 10 activos por token y 1 experto compartido, con anchura de experto y latente de 128 (frente a 2048). El vocabulario se mantiene idéntico en 201.216 tokens con embeddings no atados.

La innovación técnica documentada incluye el indexer de atención (64 cabezas, dimensión 128, top-k 2048), los 4 streams mHC con 20 iteraciones de Sinkhorn, y el módulo de decodificación especulativa DSpark con 3 capas de draft, tamaño de bloque 7 y rango de Markov 8 (frente a 256 en el original). Las precisiones se conservan: lineales en e4m3 con bloques 128x128 y expertos enrutados en MXFP4 e2m1 con escala UE8M0 por 32. No hubo entrenamiento: los pesos son inicialización aleatoria, según indica la model card.

## Capacidades

- Generación de texto: nominalmente soportada por el pipeline `text-generation`, pero sin capacidades reales al ser pesos aleatorios.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.
- Servicio compatible con la API de chat de OpenAI a través de SGLang, incluyendo mensajes de sistema e historial multi-turno.
- Tokenizador Python que compone el prompt de chat.
- Validación de infraestructura: sirve para probar el backend Marlin para expertos MXFP4 en GPUs Hopper y los CUDA graphs de decodificación.

## Casos de uso

- Pruebas de integración de SGLang: permite verificar que la revisión de SGLang del PR #51236 arranca correctamente con la arquitectura ERNIE 5.5 sin descargar 165,90 GB. Se lanzaría con `sglang serve --tp 2 --ep 2 --moe-runner-backend marlin`.
- Validación de backend Marlin en Hopper: al ejecutar los expertos enrutados en MXFP4, sirve para comprobar que el backend Marlin compila y produce resultados numéricamente estables en GPUs H100.
- Depuración de atención comprimida KV: el ciclo HCA/MLA con latente 512 permite reproducir problemas de memoria y formas de tensor en el pipeline de atención sin coste de cómputo real.
- Pruebas de decodificación especulativa DSpark: con 3 capas de draft y bloque 7, se puede validar el flujo de aceptación/rechazo de tokens en un entorno controlado.
- CI/CD de despliegues: como artefacto de 153,78 MB, encaja en pipelines de integración continua para comprobar que el contenedor de inferencia arranca y responde al endpoint `/v1/chat/completions`.
- Formación y demos de arquitectura: útil para inspeccionar la estructura de tensores de un MoE con expertos compartidos y enrutados sin acceso al modelo original.
- Benchmarking de arranque: medir tiempos de carga y planificación de CUDA graphs con `--mem-fraction-static 0.3` en distintas configuraciones de tensor/pipeline parallelism.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 105,5 millones de parámetros; el ejemplo oficial usa `--mem-fraction-static 0.3` con `--tp 2`, lo que sugiere reserva de memoria para grafos CUDA y buffers.
- GPU recomendadas: el ejemplo verificado apunta a GPUs Hopper (H100) por el backend Marlin para MXFP4; también debería funcionar en A100 y RTX 4090 con la configuración adecuada, aunque no está verificado en la model card.
- Cabe en GPU consumer: sí, por tamaño (153,78 MB de pesos), aunque la verificación oficial se realizó en Hopper.
- Opciones de despliegue: SGLang (verificado, revisión del PR #51236). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| tiny-random/ernie-5.5-flash-preview | 105,5 M | no disponible | no disponible | Hugging Face (153,78 MB) | Pruebas de infraestructura |
| baidu/ERNIE-5.5-Flash-Preview | no disponible (checkpoint de 165,90 GB) | no disponible | no disponible | Hugging Face | Modelo funcional de producción |
| Otros checkpoints `tiny-random` de Hugging Face | variable | no disponible | variable | Hugging Face | Pruebas de infraestructura |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría con información verificable en la documentación proporcionada.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera texto coherente ni responde preguntas; su salida es ruido estadístico.
- No apto para producción, evaluación de calidad ni investigación de capacidades.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Idiomas no declarados: no hay garantía de cobertura multilingüe.
- Longitud de contexto no documentada; el ejemplo oficial limita a 2048 tokens.
- Requiere una revisión específica de SGLang (PR #51236) y `--trust-remote-code`, lo que implica ejecutar código del repositorio.
- El backend Marlin para MXFP4 está orientado a Hopper; en otras arquitecturas el comportamiento no está verificado.
- Generado automáticamente por GPT-6.1-Sol según la model card; la calidad del código de creación no está auditada de forma independiente.
- No debe confundirse con el modelo base `baidu/ERNIE-5.5-Flash-Preview`: las métricas de este repositorio no son extrapolables al modelo completo.

## Enlaces

- Hugging Face: https://huggingface.co/tiny-random/ernie-5.5-flash-preview
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- PR de SGLang #51236: https://github.com/sgl-project/sglang/pull/51236
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
