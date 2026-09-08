# vvsotnikov/Qwen3.8-27B-test-GGUF

## Resumen

`vvsotnikov/Qwen3.8-27B-test-GGUF` es una conversión a formato GGUF de un modelo experimental creado por vvsotnikov. El modelo base, `vvsotnikov/Qwen3.8-27B-test`, es un merge lineal 50/50 entre `Qwen3.6-27B` y `Qwen3.8-27B`, ambos de la familia Qwen3.5. El resultado es un modelo multimodal de aproximadamente 27.300 millones de parámetros, con capacidad de procesar texto e imágenes y con soporte nativo de decodificación especulativa mediante una cabeza MTP (Multi-Token Prediction) integrada.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada y lista para ejecutar en `llama.cpp` de un modelo de 27B, permitiendo su despliegue en hardware de consumo con una reducción significativa de memoria. Al incluir la cabeza MTP embebida, no requiere un drafter externo para la decodificación especulativa, lo que simplifica la configuración y puede mejorar la latencia en entornos de producción. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, segun metadatos) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj BF16 para vision) |

## Arquitectura y entrenamiento

El modelo es un merge lineal 50/50 de dos modelos de la familia Qwen3.5: `Qwen3.6-27B` y `Qwen3.8-27B`. No se ha entrenado desde cero, sino que se ha combinado mediante un merge de parámetros, cuyo origen está documentado en `merge-manifest.json` dentro del repositorio del modelo base. No se proporciona información sobre datos de entrenamiento, número de tokens ni procesos de alineación como RLHF o DPO.

La conversión a GGUF se realizó a partir de un BF16 intermedio, utilizando las recetas de cuantización por defecto de `llama.cpp`, sin matriz de importancia. Cada archivo GGUF principal incluye la cabeza MTP nativa, compuesta por 15 tensores, lo que permite la decodificación especulativa sin necesidad de un modelo drafter separado. El modelo es multimodal: requiere un archivo `mmproj` BF16 separado para la codificación de imágenes.

## Capacidades

- Generación de texto con modo de razonamiento separado (thinking mode), configurable mediante `--reasoning on` y `--reasoning-format deepseek`.
- Comprensión de imágenes: el modelo acepta entradas de imagen a través del proyector de visión incluido en `mmproj-Qwen3.8-27B-test-BF16.gguf`.
- Decodificación especulativa nativa con MTP, activable con `--spec-type draft-mtp` y `--spec-draft-n-max 3`.
- Soporte de conversación multi-turno, indicado por el tag `conversational`.
- Compatibilidad con streaming, concurrencia de peticiones y manejo de requests inválidos, validados en las pruebas del autor.
- Capacidad de recuperación tras cancelación de clientes y limpieza de conexiones interrumpidas.
- Soporte para integración con endpoints compatibles (tag `endpoints_compatible`).
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local: el modelo puede responder preguntas sobre imágenes, como identificar formas, colores u objetos, gracias al módulo de visión. Es adecuado para aplicaciones de escritorio o servidores privados donde se requiere privacidad de los datos.
- Razonamiento paso a paso en entornos de investigación: con el thinking mode activado, el modelo puede generar cadenas de razonamiento separadas del texto final, útil para depurar o analizar decisiones en tareas de lógica y matemáticas.
- Despliegue en servidores de inferencia con `llama.cpp`: el formato GGUF y la cabeza MTP integrada permiten ejecutar el modelo con `llama-server` en GPU o CPU, reduciendo la latencia mediante decodificación especulativa sin configurar un drafter adicional.
- Análisis de capturas de pantalla o diagramas en pipelines de automatización: al combinar entrada de imagen y texto, puede extraer información de gráficos, interfaces de usuario o esquemas técnicos.
- Prototipado de modelos multimodales en hardware de consumo: la cuantización Q4_K_M reduce el peso a 16.81 GB, lo que permite probar el modelo en una GPU de 24 GB como la RTX 3090 o 4090.
- Evaluación de merges de modelos: al ser un merge experimental de dos modelos Qwen3.5, puede utilizarse como caso de estudio para comparar el comportamiento de modelos combinados frente a los originales, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos numéricos corresponden a pruebas de humo realizadas por el autor: en una petición aritmética, Q4_K_M aceptó 98 de 114 tokens draft (86.0%) y Q5_K_M aceptó 78 de 93 (83.9%). Estos valores son resultados individuales de smoke test, no comparativos de calidad ni de velocidad, y no se reivindica paridad con BF16 ni una evaluación amplia de calidad.

## Requisitos de hardware

- Tamaño de los pesos en disco: Q4_K_M 16.81 GB, Q5_K_M 19.54 GB, más 0.93 GB del mmproj BF16.
- VRAM estimada para inferencia: con Q4_K_M, los pesos ocupan aproximadamente 16.8 GB; sumando KV cache y activaciones, se recomienda al menos 20-24 GB de VRAM. Con Q5_K_M, se necesita alrededor de 24-28 GB de VRAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M; para Q5_K_M, se recomienda una GPU con 24 GB si se reduce el contexto, o 48 GB (A6000, A100) para mayor margen.
- El modelo fue probado por el autor en un Apple M5 Max con 128 GiB de RAM usando Metal, por lo que es compatible con hardware de Apple.
- Opciones de despliegue: `llama.cpp` (especialmente `llama-server`), con soporte para GPU y CPU. No se menciona compatibilidad con vLLM, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponible. Solo se conocen tasas de aceptación de tokens draft en pruebas de humo, no métricas de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones ni resultados de rendimiento de modelos comparables, como `Qwen3.6-27B`, `Qwen3.8-27B` o `unsloth/Qwen3.8-27B`. No es posible realizar una comparación rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha realizado una evaluación de sesgos en la información proporcionada.
- Riesgo de alucinación: no se ha evaluado la calidad general del modelo; el autor no reclama paridad con BF16 ni una evaluación amplia de calidad.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados. El comando de ejemplo utiliza `--ctx-size 8192`, pero no se indica si es el máximo soportado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero requiere incluir el aviso de licencia y las atribuciones correspondientes.
- Dependencia de una versión concreta de `llama.cpp`: el modelo requiere una versión reciente con soporte para MTP nativo de Qwen3.5. La revisión probada es `64e9bceb2c3a856efed96feda784a50947049feb`; versiones anteriores podrían no funcionar correctamente.
- Se trata de un modelo experimental basado en un merge, sin validación externa ni benchmarks públicos. Su comportamiento en tareas reales debe ser verificado antes de usarlo en producción.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/vvsotnikov/Qwen3.8-27B-test-GGUF
- Modelo base (merge) en Hugging Face: https://huggingface.co/vvsotnikov/Qwen3.8-27B-test
- Repositorio de referencia `unsloth/Qwen3.8-27B`: https://huggingface.co/unsloth/Qwen3.8-27B
