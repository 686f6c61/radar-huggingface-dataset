# swbiggart/Hy4-NVFP4-Experts-W4A4

## Resumen

Hy4-NVFP4-Experts-W4A4 es una conversión cuantizada del modelo Tencent Hy4, un modelo multimodal de tipo `hy_v4_vl` con 774.434.002.142 parámetros totales (unos 774 mil millones). La conversión la firma el usuario swbiggart y emplea NVIDIA ModelOpt 0.48.0 para aplicar cuantización NVFP4 (4 bits en pesos y activaciones, W4A4) exclusivamente a las 77 capas de expertos enrutados del modelo. El resto de tensores —visión, routers, atención, iHC y pesos del draft— conservan sus bytes originales en BF16, y la precisión de la caché KV no se modifica.

El interés de esta ficha es doble. Por un lado, documenta una técnica de cuantización agresiva (FP4) aplicada solo a los expertos de un modelo MoE de gran tamaño, lo que reduce el peso de los tensores dominantes sin tocar las partes sensibles del modelo. Por otro, el autor aporta una verificación inusualmente detallada: auditoría de 59.136 proyecciones de expertos repackadas desde el origen BF16, manifiesto de 239.100 tensores de salida, checksums SHA-256 y una prueba de inferencia en un slice sintético de tres capas con desviaciones máximas de logits de 0,002615 y 0,002702 frente a BF16.

Conviene subrayar que se trata de un checkpoint experimental, no de un modelo listo para producción: el propio autor indica que la verificación end-to-end del modelo completo, la calidad de servicio, el throughput y el despliegue en TensorFold quedan sin cualificar. El payload de tensores es de 479.281.884.918 bytes (446,37 GiB) y el plan de despliegue declarado es de cuatro DGX Spark, con unos 111,59 GiB por rango antes de caché, pesos replicados y memoria de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo `hy_v4_vl` con mezcla de expertos (MoE); 77 capas de expertos enrutados, capas de atencion, routers, iHC y pesos de draft |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en las 77 capas de expertos enrutados (pesos y activaciones); resto de tensores en BF16 original; cache KV sin cambios de precision |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (`tencent-hy`, etiquetada como `other`); los pesos conservan la licencia del modelo original |
| Formato de pesos | safetensors (repo de 479,3 GB; payload de tensores de 479.281.884.918 bytes / 446,37 GiB) |

## Arquitectura y entrenamiento

El modelo base es Tencent Hy4, un transformer multimodal con arquitectura de mezcla de expertos. La conversión no reentrena ni modifica el comportamiento del modelo: parte de la revisión `c10c0de5b6f850703fb0a90e65d1c32b558b9167` del checkpoint original y aplica cuantización NVFP4 con NVIDIA ModelOpt 0.48.0 y Transformers `c6b5e3a532de86eddab8124cc73660c1bd36c0d8`. Solo las 77 capas de expertos enrutados reciben pesos y activaciones en FP4; visión, routers, atención, iHC (probablemente un mecanismo interno de compartición o indexación de expertos) y pesos del draft se mantienen en BF16 byte a byte. La decisión de cuantizar únicamente los expertos responde a que estas proyecciones (gate, up y down) concentran la mayor parte de los parámetros del MoE y son las que más se benefician de la reducción de memoria.

La innovación técnica principal está en el proceso de conversión y su verificación. Las 59.136 proyecciones de expertos (gate, up y down) se repackaron de forma independiente desde el origen BF16 y se compararon con sus bytes y escalas exportados; la auditoría cubrió 2.710 tensores de origen y 239.100 tensores de salida. Además, se ejecutó inferencia en proceso nuevo sobre un slice sintético de tres capas de Hy4 con routing, iHC y capas de índice completas y compartidas reales, obteniendo desviaciones máximas de logits de 0,002615 y 0,002702 en dos entradas reservadas. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Tencent Hy4, aunque no se documentan evaluaciones específicas tras la cuantización.
- Procesamiento multimodal: el checkpoint conserva los tensores de visión en BF16, por lo que mantiene la capacidad de entrada de imagen del modelo original.
- Mezcla de expertos enrutada: 77 capas de expertos con routing preservado en precisión original.
- Pesos de draft: el checkpoint incluye pesos de draft, lo que sugiere soporte de decodificación especulativa en el modelo base (no confirmado en la información disponible).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización FP4: el checkpoint sirve como referencia reproducible para estudiar el impacto de NVFP4 W4A4 limitado a capas de expertos, gracias a los manifiestos de mapeo, estadísticas de calibración y checksums incluidos.
- Despliegue en clústeres de cuatro DGX Spark: el autor plantea un reparto ideal de unos 111,59 GiB por rango, lo que permite experimentar con inferencia distribuida de un modelo de 774 mil millones de parámetros en hardware de gama workstation.
- Validación de pipelines ModelOpt: útil para equipos que quieran adaptar el flujo de conversión de ModelOpt 0.48.0 a modelos MoE multimodales de gran escala y comprobar la preservación de tensores no cuantizados.
- Benchmarking de calidad post-cuantización: al conservar routers, atención y visión en BF16, permite aislar el efecto de la cuantización de expertos en tareas multimodales y de razonamiento.
- Reproducción de auditorías de tensores: los ficheros `verification.json`, `tensor-manifest.json` y `validation/checksums.json` facilitan la verificación independiente de la integridad del checkpoint en entornos de investigación.
- Estudio de decodificación especulativa: la presencia de pesos de draft en el checkpoint permite investigar técnicas de aceleración por draft en modelos MoE cuantizados.
- Prototipado de servicio multimodal en FP4: para equipos con acceso a GPUs Blackwell o DGX Spark que quieran evaluar latencia y memoria de un MoE multimodal de gran tamaño antes de comprometerse con un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de verificación de la conversión: desviación máxima de logits BF16 frente a empaquetado de 0,002615 y 0,002702 en un slice sintético de tres capas, y una auditoría de 59.136 proyecciones de expertos y 239.100 tensores de salida. No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia del modelo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de tensores es de 446,37 GiB; el reparto ideal en cuatro rangos es de aproximadamente 111,59 GiB por rango antes de caché KV, pesos replicados, workspaces y memoria de runtime.
- GPU recomendadas: el autor planifica desplegar en cuatro DGX Spark. NVFP4 requiere hardware con soporte nativo de FP4 (arquitectura Blackwell); no se documenta compatibilidad con GPUs anteriores.
- ¿Cabe en consumer GPU? No. Incluso con cuantización FP4 en los expertos, el checkpoint completo supera con holgura la VRAM de cualquier GPU de consumo; se necesita un despliegue multi-nodo o multi-GPU.
- Opciones de despliegue: el autor menciona TensorFold como vía de despliegue prevista, aunque indica que el despliegue en TensorFold "remain unqualified". No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles; el autor declara explícitamente que el rendimiento y la calidad de servicio del modelo completo no están cualificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-NVFP4-Experts-W4A4 (este) | 774,4 mil millones | no disponible | NVFP4 W4A4 en 77 capas de expertos | Tencent Hy License | Hugging Face, 19 descargas |
| tencent/Hy4 (base) | 774,4 mil millones (mismo checkpoint de origen) | no disponible | BF16 | Tencent Hy License | Hugging Face (modelo original) |
| Hy4 Flash (conversión de referencia) | no disponible | no disponible | NVFP4 (script de atakann) | no disponible | GitHub (TensorFold) |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada. El único punto de referencia directo es el checkpoint BF16 original de Tencent y la conversión Hy4 Flash citada por el autor.

## Limitaciones y advertencias

- Checkpoint experimental: el autor indica que la verificación end-to-end del modelo completo, la calidad de servicio, el throughput y el despliegue en TensorFold no están cualificados.
- Verificación parcial: las pruebas de inferencia se hicieron sobre un slice sintético de tres capas, no sobre el modelo completo; los resultados de desviación de logits no garantizan el comportamiento global.
- Licencia restrictiva: los pesos conservan la Tencent Hy License (`tencent-hy`), etiquetada como `other`; es imprescindible revisar los términos antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no hay información sobre idiomas soportados ni longitud de contexto en la model card.
- Riesgo de alucinación: no evaluado tras la cuantización; no hay benchmarks que permitan estimar el impacto en la fiabilidad.
- Sesgos: no documentados en la información disponible.
- Requisitos de hardware muy exigentes: 446,37 GiB de tensores y soporte de FP4 nativo limitan el despliegue a clústeres con GPUs Blackwell o DGX Spark.
- Sin soporte de serving confirmado: no se documenta integración con vLLM, TGI, llama.cpp u Ollama, lo que complica su uso en producción.
- Trazabilidad: la conversión depende de revisiones concretas de ModelOpt y Transformers; cambios de versión pueden alterar la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/swbiggart/Hy4-NVFP4-Experts-W4A4
- Modelo base: https://huggingface.co/tencent/Hy4
- Script de conversión de referencia (Hy4 Flash, atakann/TensorFold): https://github.com/atakann/TensorFold/blob/hy4-flash-host/tools/hy4_flash/nvfp4.py
- Repositorio TensorFold (rama hy4-flash-host): https://github.com/atakann/TensorFold
- Ficheros de verificación del checkpoint (referenciados en la model card): `verification.json`, `tensor-manifest.json`, `validation/coverage`, `validation/calibration.json`, `validation/checksums.json`
- Licencia: `LICENSE` en el repositorio de Hugging Face
