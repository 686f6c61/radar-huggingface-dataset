# wrldsuksgo2mars/Mistral-Large-4-EXL3-K4-Core-K6

## Resumen

Mistral Large 4 EXL3 K4 + Core K6 es una cuantización de 4 bits del checkpoint oficial Mistral Large 4 (1T-A52B), publicada por el usuario independiente wrldsuksgo2mars. El modelo base, desarrollado por Mistral AI, es un modelo multimodal de propósito general con arquitectura Mixture-of-Experts (MoE) de granularidad fina: 1,05 billones de parámetros totales, 52.000 millones activos y un codificador visual de 1.600 millones de parámetros. Esta release reduce el peso de los pesos de 540,7 GB (formato original en FP8 por bloques de 128) a un esquema mixto EXL3: K6 para atención, FFN compartidas y cabeza de salida, y K4 para los 27.264 matrices de expertos enrutados.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización poco común (EXL3 con multiplicador MCG y escalas automáticas de salida) aplicada a un modelo de escala frontera; por otro, advierte de que se trata de un artefacto de cuantización sin validación de generación completa: el autor declara explícitamente que la calidad en contexto largo y el rendimiento en serving quedan fuera del alcance de esta release. El repositorio tiene 29 descargas y 0 likes en el momento de la consulta, y la licencia heredada es `mistral-ecosystem-open-weight`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de granularidad fina, multimodal, con atención MLA y componentes NoPE en capas seleccionadas |
| Parametros totales | 270.862.030.368 (~270,9B) segun safetensors; el modelo base declara 1,05T totales |
| Parametros activos | 52B (modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | EXL3 mixta: K6 (424 matrices) y K4 (27.264 matrices); pesos retenidos en BF16/F32/FP8 |
| Idiomas soportados | no disponible |
| Licencia | mistral-ecosystem-open-weight (heredada del modelo base) |
| Formato de pesos | safetensors (112.003 tensores en 72 shards de capas + 1 shard extras) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de granularidad fina con 52B parámetros activos sobre 1,05T totales, codificador visual de 1,6B y atención MLA (Multi-head Latent Attention). La arquitectura incluye capas NoPE (sin positional encoding explícito) identificadas en las capas 39, 43, ..., 71, que reutilizan el latente KV de la capa 35 en lugar de mantener una matriz `kv_a` independiente. El tokenizer nativo es Tekken y el checkpoint incluye un drafter dSpark en BF16 para decodificación especulativa.

Esta release no entrena el modelo: cuantiza el checkpoint oficial en FP8 por bloques de 128 fijado en el commit `f12dabdc0c1e99e7f7924461a6f308859b05af4d`. El esquema EXL3 usa multiplicador MCG `0xCBAC1FED`, semilla 787 y sigma 0,025 con escalas automáticas de salida. La calibración emplea el panel público `wrldsuksgo2mars/agentic-quant-panel-v1`: 1.426 muestras y 1.126.268 tokens con el tokenizer Tekken y el formato de chat nativo. Se realiza una pasada causal intercalada que propaga los predecesores serializados y reconstruidos antes de calibrar cada sucesor; las fronteras rodantes preservan el estado top-k del indexador compartido y el latente KV de la capa 35 usado por las capas NoPE posteriores. Los tensores no cuantizados se comparan byte a byte con el origen, y los errores calibrados por matriz se guardan en `quantization-errors/` como bundles JSONL. La matriz `kv_a` de RoPE tiene salida lógica 576 almacenada en 640; las `kv_a` NoPE propias miden 512.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base multimodal.
- Procesamiento de visión mediante el codificador visual oficial de 1,6B parámetros, preservado sin cuantizar.
- Decodificación especulativa mediante el drafter dSpark incluido en BF16.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta cuantización.
- Razonamiento multi-paso y uso agéntico: el panel de calibración es de naturaleza agéntica, pero no hay validación funcional publicada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Serving de un modelo frontera en hardware único: al reducir el payload a 503,489 GiB en un esquema mixto K4/K6, permite evaluar Mistral Large 4 en un nodo con suficiente memoria agregada, algo inviable con el checkpoint FP8 completo.
- Investigación en cuantización extrema: el repositorio documenta multiplicador MCG, semilla, sigma, escalas automáticas y errores por matriz, lo que lo convierte en un caso de estudio reproducible para quienes investigan EXL3 sobre MoE de escala frontera.
- Calibración sobre datos agénticos: el panel de 1.426 muestras y 1,13M tokens con formato de chat nativo sirve como referencia para comparar estrategias de calibración en modelos con tool use.
- Inferencia multimodal en investigación: el codificador visual se conserva íntegro, de modo que se pueden probar pipelines imagen-texto sin degradar la torre de visión.
- Decodificación especulativa: el drafter dSpark en BF16 permite medir aceleraciones de decodificación en entornos que soporten el formato Mistral nativo.
- Validación de preservación de tensores: los shards no cuantizados se comparan byte a byte, útil para auditar pipelines de cuantización que deban garantizar fidelidad de componentes críticos (indexador FP8, `kv_b` BF16, normas y embeddings).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que la generación de modelo completo, la calidad en contexto largo y el rendimiento en serving son trabajo de cualificación separado y no forman parte de esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de pesos es de 503,489 GiB (540.617.010.400 bytes) más cabeceras y metadatos; el repo completo ocupa 540,7 GB. No cabe en ninguna GPU de consumo individual.
- GPU recomendadas: el autor calibró en una RTX PRO 6000 Blackwell (identificada como "raptor GPU 1"); para servir el modelo completo se requiere memoria agregada de varios nodos o GPUs con gran capacidad (H100/H200/B200 en configuraciones multi-GPU).
- Cabe en consumer GPU: no. El peso de los pesos excede con amplio margen la VRAM de cualquier tarjeta de consumo actual.
- Opciones de despliegue: se necesita un runtime que soporte el formato Mistral nativo mixto K4/K6, el indexador FP8 retenido del proveedor, `kv_b` MLA en BF16, la visión oficial y el componente dSpark en BF16. No se requiere sidecar EXLR8. No hay confirmación de soporte en vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor no publica métricas de serving.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mistral Large 4 EXL3 K4 + Core K6 (esta ficha) | ~270,9B segun safetensors (base 1,05T) | 52B (base) | no disponible | EXL3 mixta K4/K6 | mistral-ecosystem-open-weight | Hugging Face, 29 descargas |
| mistralai/Mistral-Large-4-1T-A52B (base) | 1,05T | 52B | no disponible | FP8 block-128 | mistral-ecosystem-open-weight | Hugging Face oficial |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Fidelidad de origen: la cuantización parte del checkpoint FP8 desquantizado, no de pesos BF16 originales; el autor no reclama fidelidad respecto a la fuente BF16.
- Sin validación funcional: no se ha verificado la generación de modelo completo, la calidad en contexto largo ni el rendimiento en serving. No es un artefacto listo para producción sin cualificación adicional.
- Requisito de runtime específico: solo funciona en runtimes que soporten el formato Mistral nativo mixto K4/K6, el indexador FP8 retenido, `kv_b` BF16 y dSpark BF16. Un runtime genérico de EXL3 no es suficiente.
- Riesgo de alucinación y sesgos: no documentados para esta cuantización; heredados del modelo base, sin evaluación publicada.
- Idiomas y contexto: no se especifican idiomas soportados ni longitud de contexto en la información disponible.
- Licencia: `mistral-ecosystem-open-weight` con enlace al texto original del modelo base; es responsabilidad del usuario revisar las condiciones de uso comercial antes de desplegar.
- Madurez del artefacto: 29 descargas y 0 likes, publicado el 2026-11-02 y actualizado el mismo día; sin mantenimiento ni issues documentados.
- Inconsistencia de recuento: los safetensors declaran ~270,9B parámetros totales frente a los 1,05T del modelo base; conviene auditar el inventario antes de confiar en cualquiera de las dos cifras para planificación de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/Mistral-Large-4-EXL3-K4-Core-K6
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Commit fijado del base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/f12dabdc0c1e99e7f7924461a6f308859b05af4d/LICENSE
- Documentación oficial de Mistral Large 4: https://docs.mistral.ai/models/mistral-large-4-0
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
