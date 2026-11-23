# tiyuvta/Hy3-NVFP4

## Resumen

Hy3-NVFP4 es una cuantización de solo pesos en formato NVFP4 del modelo Tencent Hy3, publicada por el usuario tiyuvta a través de su plataforma tiyuvta.ai. El artefacto se generó directamente desde el checkpoint oficial en BF16 utilizando NVIDIA Model Optimizer 0.46.0, con una receta W4A16 de grupo 16, y está pensado para ejecutarse en hardware Blackwell con motores de inferencia que soporten FP4. El modelo base Hy3 es un transformer MoE de gran escala con 298.786.155.776 parámetros totales, orientado a generación de texto conversacional y tool calling.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización agresiva (4 bits en pesos de expertos enrutados) sobre un modelo de casi 300.000 millones de parámetros, lo que reduce el payload indexado a 180.826.481.152 bytes y permite servir el modelo en cuatro GPU RTX PRO 6000 Blackwell. No obstante, conviene subrayar que esta es una cuantización de terceros, no oficial de Tencent, y que el autor declara explícitamente que el artefacto está "cualificado, no ajustado" (qualified, not yet tuned).

La model card conserva la licencia Apache 2.0 del modelo fuente y describe con detalle el linaje de artefactos, hashes de integridad y pruebas de cualificación. Sin embargo, no se proporcionan datos de benchmarks de calidad ni información sobre composición del dataset de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capa MTP (multi-token prediction); detalles completos del modelo base no disponibles |
| Parametros totales | 298.786.155.776 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (grupo 16, solo pesos) para expertos enrutados; BF16 para capas densas, atención, router, shared MLP, embeddings y head; también se distribuye GGUF según tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (99 shards indexados); GGUF referenciado en tags |

## Arquitectura y entrenamiento

El modelo base Tencent Hy3 es un transformer con arquitectura de mezcla de expertos (MoE), según los tags del repositorio (`moe`, `hy_v3`, `hunyuan`). La model card de esta cuantización menciona explícitamente una capa MTP (multi-token prediction) en la capa 80, con 576 tensores cuantizados a NVFP4, y capas de tronco de la 1 a la 79 con 45.504 tensores de expertos enrutados en NVFP4. La capa densa 0, las proyecciones de atención Q/K/V/O, las normas QK, el router y su bias de corrección, el shared MLP, los embeddings, la cabeza de salida y las normas se mantienen en BF16 o en la precisión original del fuente (BF16/F32).

La cuantización se realizó con NVIDIA ModelOpt 0.46.0 sobre el checkpoint BF16 oficial de Tencent (commit `a960ebc3da325ba167f069f76c41eb62c9280d22`), con una receta de grupo 16 y solo pesos (W4A16), donde los pares fusionados gate/up comparten `max(gate_scale_2, up_scale_2)`. El artefacto contiene 46.080 pesos de expertos en NVFP4 y 139.298 tensores almacenados normalizados a 47.138 tensores lógicos. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card menciona que el motor de servicio incluye decodificación especulativa MTP (K=1–8) cualificada, aunque desactivada por defecto en la cualificación.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline `text-generation` y el tag `conversational`.
- Tool calling y function calling, con parsing de llamadas a herramientas y turnos de resultado de herramienta validados en la cualificación.
- Razonamiento con `reasoning_effort` configurable en niveles high y none, probado en la cualificación.
- Decodificación especulativa MTP (multi-token prediction) con K=1–8, cualificada con drafts aceptados no nulos en todos los valores de K.
- Soporte de peticiones concurrentes, reutilización de caché, admisión y rollback ante desconexión de cliente, según las pruebas del autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente conversacional de atención al cliente: el modelo puede mantener diálogos multi-turno con tool calling para consultar sistemas internos (estado de pedidos, incidencias) y devolver respuestas en lenguaje natural; la cualificación del autor valida el parsing de llamadas y turnos de resultado.
- Agente de automatización con razonamiento multi-paso: el soporte de `reasoning_effort` high permite activar cadenas de razonamiento más largas para tareas de planificación, y el modo none para respuestas rápidas de bajo coste.
- Generación de código asistida en IDE o pipelines: el tag `tool-calling` y el pipeline de generación de texto permiten integrar el modelo en flujos de CI/CD que requieran invocar herramientas externas (linters, ejecutores de tests) mediante function calling.
- Servicio de inferencia de alto rendimiento en clúster Blackwell: con 180,8 GB de payload y despliegue en cuatro RTX PRO 6000 Blackwell, es adecuado para servir un modelo de ~300B parámetros en un nodo de cuatro GPU con paralelismo de expertos (EP-3/EP-4) y pipeline paralelo (PP-2).
- Evaluación e investigación de cuantización FP4: el artefacto incluye hashes de integridad, censo de tensores y comparación contra un oráculo ModelOpt, lo que lo hace útil como referencia reproducible para estudiar el impacto de NVFP4 W4A16 en modelos MoE grandes.
- Despliegue con decodificación especulativa: el MTP cualificado permite acelerar la generación en entornos donde la latencia por token sea crítica, activando K entre 1 y 8 según la carga.
- Prototipado de agentes con caché y concurrencia: las pruebas de peticiones concurrentes, reutilización de caché y rollback limpio lo hacen apto para servicios con múltiples clientes simultáneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de fidelidad numérica frente al oráculo ModelOpt:

| Metrica | Valor |
|---|---|
| Coincidencia de argmax | 20/20 top-logit overlap |
| Similitud coseno | 0.9995285974311506 |
| RMSE | 0.05849238475772628 |
| Error absoluto medio | 0.046138540558894096 |
| Error absoluto máximo | 0.30402064323425293 |
| MTP greedy K=1–8 | Idéntico al target en todos los K, con drafts aceptados no nulos |
| MTP en petición de cualificación | 9/22 drafts aceptados |

## Requisitos de hardware

- VRAM estimada para inferencia: el payload indexado es de 180.826.481.152 bytes (~168,4 GiB) en pesos NVFP4/BF16; el autor estimó 60,05 GB en el nodo raíz y 40,26 GB en cada peer antes de una reserva de runtime de 6 GiB, con paralelismo PP-2 y EP-3/EP-4 en cuatro tarjetas.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (cualificado en cuatro unidades); se requiere hardware Blackwell para soporte nativo de NVFP4.
- Cabe en consumer GPU: no, por el tamaño del artefacto (~180,9 GB de repo) y los requisitos de FP4 en Blackwell.
- Opciones de despliegue: el motor de servicio propietario de tiyuvta (cualificado); vLLM se menciona como referencia de colocación de pipeline para el oráculo ModelOpt, pero no se confirma soporte directo del artefacto. No se confirma soporte de llama.cpp, Ollama o TGI para NVFP4.
- Latencia y throughput: no se promociona ningún resultado agregado de throughput; el autor indica que el tuning en el motor de servicio no está terminado y que el artefacto está cualificado pero no ajustado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy3-NVFP4 (tiyuvta) | 298.786.155.776 | no disponible | NVFP4 W4A16 + BF16 mixto | Apache 2.0 | Hugging Face, 542 descargas |
| tencent/Hy3 (BF16) | 298.786.155.776 (mismo base) | no disponible | BF16 | Apache 2.0 | Hugging Face (oficial) |
| Checkpoint FP8 oficial de Tencent | no disponible | no disponible | FP8 | Apache 2.0 | Hugging Face (oficial, citado como control separado) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Cuantización de terceros: no es un artefacto oficial de Tencent; el autor es tiyuvta y la cualificación se realizó en su propio motor de servicio, no en frameworks estándar.
- Requiere hardware Blackwell para NVFP4; no es desplegable en GPU Ampere, Ada o consumer convencionales.
- El artefacto está "cualificado, no ajustado": el tuning de paralelismo genérico 2–4 tarjetas, TP+EP, routing y MTP sigue pendiente según el autor.
- El schedule experimental wave está desactivado porque falló la puerta de identidad de logits serial-vs-wave para el programa numérico mixto BF16/NVFP4.
- No hay variante BF16-MTP de respaldo en esta release; el MTP es una elección explícita de servicio.
- No se publican benchmarks de calidad ni evaluación de sesgos o alucinación; no hay datos sobre idiomas soportados.
- La licencia Apache 2.0 del modelo base se hereda, pero conviene verificar las condiciones de uso comercial del checkpoint original de Tencent y de las dependencias de ModelOpt.
- El tamaño del repositorio (180,9 GB) y la necesidad de cuatro GPU Blackwell limitan su uso a entornos de clúster.
- La model card está truncada en la información proporcionada; pueden faltar detalles sobre tokenizer, chat template y configuración de generación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiyuvta/Hy3-NVFP4
- Modelo base oficial: https://huggingface.co/tencent/Hy3
- Plataforma del autor: https://tiyuvta.ai/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Commit del checkpoint fuente: `tencent/Hy3@a960ebc3da325ba167f069f76c41eb62c9280d22`
