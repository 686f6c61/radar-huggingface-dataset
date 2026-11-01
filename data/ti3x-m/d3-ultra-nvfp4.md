# ti3x-m/d3-ultra-NVFP4

## Resumen

D3 Ultra NVFP4 es una conversión experimental del modelo vllm-sr/d3-ultra a formato NVFP4 (4 bits en pesos y activaciones), publicada por el usuario independiente ti3x-m. No se trata de un modelo nuevo ni de un lanzamiento oficial de vllm-sr, sino de un paquete cuantizado calibrado que conserva la arquitectura y los pesos del modelo base en BF16 como referencia. El modelo base pertenece a la familia Qwen3.5 según los tags de HuggingFace, tiene 26.085.330.160 parámetros (aproximadamente 26.000 millones) y está orientado a la toma de decisiones estructuradas y clasificación zero-shot, no a la generación de texto conversacional.

La relevancia de esta publicación es doble. Por un lado, demuestra el flujo de cuantización NVFP4 sobre hardware Blackwell (GPU GB10 de un DGX Spark) usando el motor nativo vllm-srun y el formato compressed-tensors. Por otro, expone con transparencia los resultados preliminares y las limitaciones del proceso: solo se calibraron 400 proyecciones de texto, no se ha evaluado la calidad de visión tras la cuantización y no se han ejecutado benchmarks amplios de precisión. El autor advierte explícitamente de que el modelo produce decisiones estructuradas y probabilidades sobre opciones, no respuestas de chat.

El paquete ocupa 17,2 GB en el repositorio, emplea licencia Apache 2.0 heredada del modelo base y requiere una GPU NVIDIA Blackwell con soporte de tensores FP4 y `scaled_mm` con escalado por bloques. Es, por tanto, un artefacto técnico para experimentación e integración en pipelines de enrutamiento semántico, no un modelo listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (según tags), con torre de visión y componentes Gated DeltaNet |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (E2M1 en pesos, grupos de 16, escalas de bloque E4M3 y escala global FP32 por tensor); activaciones cuantizadas dinámicamente por bloque; visión, embeddings, normalizaciones, convoluciones, readout e `in_proj_a`/`in_proj_b` de Gated DeltaNet en precisión original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized`; requiere el runtime vllm-srun |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-ultra es un transformer multimodal de la familia Qwen3.5, con una torre de visión que se mantiene en BF16 en esta conversión y con módulos Gated DeltaNet cuyas proyecciones `in_proj_a` e `in_proj_b` también se preservan en precisión original. La conversión cuantiza 400 proyecciones de texto elegibles con el códec NVFP4 del proyecto semantic-router: pesos E2M1 agrupados de 16 en 16, escalas de bloque E4M3 y una escala global FP32 por tensor. Las activaciones se cuantizan dinámicamente por bloque en inferencia, usando una escala global medida por proyección durante la calibración. No se aplica suavizado AWQ.

La calibración se realizó sobre el dataset `tasksource/tasksource-jev-typed-decisions` (revisión `28c39125`), seleccionando las primeras 512 filas del fichero de validación con estado de hasta 3.000 caracteres y al menos dos opciones. Cada fila se presenta como una petición de elección D3 con su pregunta y opciones. Se trata de una calibración de texto corto, no estratificada ni multimodal, lo que limita la representatividad de las escalas para entradas de visión o de contexto largo. El exportador completo está en `calibrate_nvfp4.py` y el paquete resultante tiene su propia identidad SHA-256, hashes de fichero y recuento de parámetros, verificados por vllm-srun antes de servir.

## Capacidades

- Clasificación zero-shot y enrutamiento semántico: devuelve distribuciones de probabilidad sobre opciones discretas (por ejemplo, categorías de facturación o de error técnico).
- Toma de decisiones estructuradas: genera decisiones con formato normalizado, no texto libre conversacional.
- Capacidades multimodales heredadas del modelo base: clasificación de imágenes (estilo pictórico, identificación de objetos) y localización con cajas delimitadoras normalizadas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo clasifica una consulta entrante entre categorías predefinidas (facturación, técnico, etc.) y devuelve una probabilidad por opción, lo que permite umbrales de confianza y derivación a revisión humana. En las pruebas del autor, una consulta de facturación devolvió probabilidad 0,99999348 en 257 ms.
- Clasificación de errores de software en pipelines de observabilidad: dado un mensaje de error y un conjunto de categorías, el modelo asigna la etiqueta más probable (en la prueba, categoría "tech" con probabilidad 0,99999658 en 218 ms), integrándose en sistemas de alertas o triaje automático.
- Moderación y etiquetado de contenido con criterios tipificados: al formularse como elección entre opciones, encaja en flujos de decisión con política explícita, donde la salida es una categoría y su probabilidad en lugar de una respuesta abierta.
- Clasificación de imágenes por estilo o temática: la torre de visión permite etiquetar imágenes (por ejemplo, estilo puntillismo con probabilidad 0,99972183 en 2,498 s) para catalogación de archivos o filtrado de datasets.
- Detección y localización de objetos con cajas normalizadas: útil en tareas de anotación asistida o verificación visual, siempre que se acepte la baja confianza observada en las pruebas (0,2889535 en el caso de la canoa) y se revise el resultado.
- Experimentación con cuantización FP4 en hardware Blackwell: sirve como referencia reproducible para equipos que quieran evaluar el flujo compressed-tensors + vllm-srun en DGX Spark o GPUs GB10 antes de adoptarlo en sus propios modelos.
- Evaluación comparativa de degradación por cuantización: al conservar el modelo BF16 fuente, permite medir la concordancia de respuestas entre BF16 y NVFP4 en dominios concretos, aunque esa comparación aún no la ha publicado el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación amplia de precisión, concordancia con BF16, benchmark de visión, vídeo o seguimiento. Los únicos datos son pruebas de humo individuales:

| Prueba | Resultado | Tiempo |
|---|---|---|
| Enrutamiento de facturación | billing, probabilidad 0,99999348 | 257 ms |
| Enrutamiento de error de software | tech, probabilidad 0,99999658 | 218 ms |
| Clasificación de estilo pictórico | pointillism, probabilidad 0,99972183 | 2,498 s |
| Clasificación de máquina en imagen | rover, probabilidad 0,99987291 | 2,467 s |
| Caja delimitadora de canoa | caja normalizada válida, confianza 0,2889535 | 2,490 s |

Estos tiempos son peticiones HTTP individuales tras el arranque, no medidas de throughput ni de latencia sostenida. Las probabilidades son salidas del modelo, no precisión empírica medida. La memoria en tiempo de ejecución reportada es de 17.200.653.920 bytes (17,20 GB / 16,02 GiB), que no equivale al pico de memoria de inferencia.

## Requisitos de hardware

- GPU NVIDIA Blackwell obligatoria (probado en GB10, SM121, de un DGX Spark con 128 GB de memoria compartida).
- Stack de software probado: PyTorch 2.15.0+cu132, CUDA 13.2, Triton 3.9.0 y vllm-srun 0.2.0 desde el commit `dd7f5efb7f94e1952877dddb8d2b4fd4d446fd6a`. Otros stacks no han sido probados.
- Se requiere soporte de tensores FP4 y de `torch.nn.functional.scaled_mm` con escalado por bloques.
- Memoria en tiempo de ejecución del modelo: 17,20 GB según la métrica del runtime (no es el pico de inferencia).
- No cabe en GPUs de consumo convencionales sin FP4 nativo; no se documenta compatibilidad con RTX 4090, A100 ni H100.
- Despliegue mediante el motor nativo vllm-srun; no se documenta compatibilidad con vLLM estándar, llama.cpp, Ollama ni TGI.
- Latencia observada en pruebas de humo: 218-257 ms para texto corto y 2,47-2,50 s para peticiones con imagen. No hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ti3x-m/d3-ultra-NVFP4 | 26.085.330.160 | no disponible | NVFP4 W4A4 | Apache 2.0 | HuggingFace, requiere vllm-srun |
| vllm-sr/d3-ultra (base) | no disponible | no disponible | BF16 | Apache 2.0 | HuggingFace |
| Modelo d3 (anterior, citado en el registro upstream) | no disponible | no disponible | NVFP4 (registro upstream) | no disponible | Repositorio semantic-router |

No se dispone de datos de rendimiento comparables entre estas variantes. El autor advierte de que los resultados de precisión y rendimiento del registro upstream corresponden al modelo d3 anterior y no son transferibles a esta conversión de D3 Ultra.

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de vllm-sr ni una submission validada a ningún benchmark.
- Sin evaluación amplia de precisión: no se ha medido concordancia de respuestas con el modelo BF16, ni calidad de visión, ni rendimiento en vídeo o seguimiento.
- Calibración limitada: solo 512 muestras de texto corto, sin estratificación ni datos multimodales; las escalas de activación pueden no ser representativas para imágenes o contextos largos.
- La torre de visión está en BF16, pero las características de imagen atraviesan proyecciones de texto cuantizadas; la calibración solo con texto no garantiza la calidad visual.
- La prueba de caja delimitadora devuelve una caja válida pero floja, que no cubre los extremos del objeto, con confianza baja (0,2889535); no se ha medido IoU.
- El runtime anuncia las capacidades de la familia del modelo, lo que no valida esta conversión en cada capacidad.
- Dependencia estricta de hardware Blackwell y de un stack de software concreto; no hay garantía de funcionamiento en otras GPUs o versiones.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera del inglés o de los idiomas cubiertos por el modelo base.
- Riesgo de alucinación y sesgos: no evaluado en esta conversión; al tratarse de un modelo de decisión, los errores se manifiestan como asignaciones de probabilidad incorrectas sobre opciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y recomienda validación propia antes de producción.
- Solo 21 descargas y 0 likes en el momento de la consulta; comunidad y soporte mínimos.

## Enlaces

- [HuggingFace: ti3x-m/d3-ultra-NVFP4](https://huggingface.co/ti3x-m/d3-ultra-NVFP4)
- [Modelo base: vllm-sr/d3-ultra](https://huggingface.co/vllm-sr/d3-ultra)
- [Registro de paquete cuantizado Decision 3.0](https://github.com/vllm-project/semantic-router/blob/dd7f5efb7f94e1952877dddb8d2b4fd4d446fd6a/src/model-runtime/docs/records/decision3-quantized.md)
- [Códec NVFP4 de semantic-router](https://github.com/vllm-project/semantic-router/blob/dd7f5efb7f94e1952877dddb8d2b4fd4d446fd6a/src/model-runtime/vllm_srun/accel/nvfp4.py)
- [Repositorio semantic-router (instalación de vllm-srun)](https://github.com/vllm-project/semantic-router/tree/dd7f5efb7f94e1952877dddb8d2b4fd4d446fd6a/src/model-runtime)
- [Dataset de calibración: tasksource/tasksource-jev-typed-decisions](https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions)
