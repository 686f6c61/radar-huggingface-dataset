# underlotus/Qwen3.8-27B-heretic-ara-oQ3.5e-mtp

## Resumen

El modelo `underlotus/Qwen3.8-27B-heretic-ara-oQ3.5e-mtp` es una cuantización de precisión mixta de 3 bits (oQ3.5e) del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, una versión "decensored" y "abliterated" (sin rechazos) del Qwen3.8-27B de Alibaba. El autor, underlotus, utiliza el cuantizador oQ (oMLX) para reducir el peso original en BF16 (~55 GB) a un tamaño que cabe en ~16-18 GB de memoria en Apple Silicon, manteniendo intactas la torre de visión (entrada de imagen y vídeo) y la cabeza de predicción multi-token (MTP). El resultado es un modelo multimodal de 27B parámetros (dato no confirmado, ver especificaciones) optimizado para ejecutarse en hardware Apple con MLX, aunque también es compatible con otras herramientas que soporten MLX.

La relevancia de este modelo radica en que ofrece una alternativa ligera a un modelo de 27B con capacidades de visión y texto, sin censura, en un tamaño que cabe en equipos de consumo con Apple Silicon. La cuantización oQ3.5e es un punto intermedio entre oQ3e (más agresiva) y oQ4e (más precisa), priorizando capas críticas con mayor precisión mediante calibración basada en datos. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre de visión (image-text-to-text) y cabeza MTP |
| Parametros totales | 4.380.854.512 (dato proporcionado por HuggingFace, probablemente erróneo; el modelo base es de 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no indicada en la model card; el modelo base Qwen3.8-27B soporta 262k según fuentes externas) |
| Tipos de cuantizacion | oQ3.5e (precisión mixta 3-bit, capas críticas promovidas a mayor precisión) |
| Idiomas soportados | en, zh (según model card; el modelo base puede soportar más) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento desde cero. El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` se deriva de `Qwen/Qwen3.8-27B`, un transformer denso de 27B parámetros basado en la arquitectura Qwen3.5. La versión "heretic" aplica un proceso de decensura (Heretic v1.2.0) y abliteración mediante Arbitrary-Rank Ablation (ARA), logrando 0/100 rechazos con una divergencia KL de 0.0535 respecto al original. La cuantización oQ3.5e utiliza el cuantizador oQ de oMLX, que calibra la sensibilidad por capa y asigna bits de forma adaptativa: las capas más sensibles (embeddings, cabeza LM y capas transformer críticas) se promueven a mayor precisión, mientras que las menos sensibles permanecen en 3 bits. Se conservan tanto la torre de visión (imagen y vídeo) como la cabeza MTP (multi-token prediction). No se mencionan datos de entrenamiento adicionales ni técnicas como RLHF o DPO, ya que se trata de un proceso de cuantización posterior.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo Qwen3.8-27B, aunque la cuantización puede afectar ligeramente la calidad.
- Visión multimodal: soporta entrada de imagen y vídeo gracias a la torre de visión intacta.
- Predicción multi-token (MTP): la cabeza MTP preservada permite generar varios tokens por paso, mejorando el throughput en inferencia.
- Sin censura: el proceso de abliteración elimina los rechazos típicos de modelos alineados, permitiendo respuestas a peticiones que normalmente serían bloqueadas.
- Compatibilidad con MLX: funciona con oMLX, mlx-lm, LM Studio y otras aplicaciones que soporten el formato MLX.
- No se confirma soporte explícito de tool calling o function calling en esta variante cuantizada, aunque el modelo base podría tenerlo.

## Casos de uso

- Despliegue local en Apple Silicon: con un pico de memoria de ~16-18 GB, es viable en Macs con 24 GB o más de RAM unificada, permitiendo ejecutar un modelo multimodal de 27B en portátiles sin GPU dedicada.
- Aplicaciones de visión-lenguaje en local: al conservar la torre de visión, puede usarse para análisis de imágenes, descripción de vídeos o asistentes que combinen texto e imagen sin depender de servicios en la nube.
- Chatbots sin censura para investigación: el modelo abliterated es útil para estudiar comportamientos de modelos sin restricciones de seguridad, aunque con las advertencias éticas correspondientes.
- Prototipado rápido en MLX: gracias a su compatibilidad con mlx-lm y oMLX, se puede integrar en pipelines de desarrollo con Python para generar respuestas, resumir documentos o extraer información de imágenes.
- Inferencia de alto throughput en hardware Apple: la cabeza MTP y la cuantización optimizada permiten tasas de generación de ~11-24 tokens/s según el batch, útil para aplicaciones en tiempo real como asistentes conversacionales.
- Evaluación de técnicas de cuantización: sirve como caso práctico para comparar el impacto de oQ3.5e frente a otras precisiones (oQ3e, oQ4e) en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye métricas de rendimiento de inferencia en hardware Apple Silicon M4 (10 núcleos), que se resumen a continuación:

| Contexto | Prefill (tok/s) | Generación (tok/s) | Memoria pico |
|----------|:---------------:|:------------------:|:------------:|
| 1k | 62.2 | 11.9 | 16.2 GB |
| 4k | 58.5 | 10.7 | 17.8 GB |

Con Lightning MTP habilitado. Efecto del batch en generación:

| Batch | Generación (tok/s) | Speedup |
|-------|:------------------:|:-------:|
| 1× | 11.9 | 1.00× |
| 2× | 14.0 | 1.18× |
| 4× | 24.2 | 2.03× |

## Requisitos de hardware

- VRAM estimada: entre 16.2 GB (contexto 1k) y 17.8 GB (contexto 4k) en Apple Silicon M4.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 24 GB de memoria unificada (M4, M4 Pro, M4 Max, M3, etc.). No se indica soporte para GPUs NVIDIA o AMD.
- Cabe en equipos de consumo: sí, en Macs con 24 GB o más de RAM unificada.
- Opciones de despliegue: oMLX (`omlx serve`), mlx-lm, LM Studio, y cualquier aplicación compatible con MLX.
- Latencia y throughput: 11.9 tok/s en generación con contexto 1k y batch 1; hasta 24.2 tok/s con batch 4. Prefill de 62.2 tok/s (contexto 1k).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|--------|------------|----------|--------------|----------|-------|
| Qwen3.8-27B (base) | 27B | 262k (según fuentes externas) | BF16 | Apache 2.0 | Modelo original, requiere ~55 GB |
| underlotus/Qwen3.8-27B-heretic-ara-oQ3e-mtp | 27B | no disponible | oQ3e (3-bit uniforme) | Apache 2.0 | Versión más agresiva, menor calidad |
| underlotus/Qwen3.8-27B-heretic-ara-oQ4e-mtp | 27B | no disponible | oQ4e (4-bit) | Apache 2.0 | Versión más precisa, mayor memoria |
| Este modelo (oQ3.5e) | 27B | no disponible | oQ3.5e (mixto) | Apache 2.0 | Intermedio entre oQ3e y oQ4e, conserva visión y MTP |

No hay datos públicos de benchmarks que permitan comparar el rendimiento cualitativo entre estas variantes.

## Limitaciones y advertencias

- El modelo es "uncensored" y "abliterated": puede generar contenido inapropiado, ofensivo o peligroso sin restricciones. Su uso en producción debe evaluarse cuidadosamente y con medidas de seguridad adicionales.
- La cuantización de 3 bits puede degradar la calidad de generación, especialmente en tareas que requieren razonamiento complejo o precisión factual, en comparación con el modelo en BF16.
- El dato de parámetros totales proporcionado por HuggingFace (4.38B) es inconsistente con el tamaño declarado de 27B; se recomienda verificar el peso real antes de usarlo en entornos críticos.
- No se ha confirmado la longitud de contexto real en esta variante cuantizada; aunque el modelo base soporta 262k, la cuantización podría afectar el comportamiento con contextos muy largos.
- Solo se garantiza soporte para idiomas inglés y chino según la model card, aunque el modelo base podría manejar más.
- La compatibilidad está limitada a ecosistema MLX (Apple Silicon); no funcionará en GPUs NVIDIA o AMD sin conversión previa.
- No se han publicado benchmarks de calidad, por lo que el rendimiento en tareas específicas es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/underlotus/Qwen3.8-27B-heretic-ara-oQ3.5e-mtp
- Modelo base (trohrbaugh): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Documentación de oQ: https://omlx.ai/docs/oq
- Benchmarks de inferencia (1k): https://omlx.ai/benchmarks/qwm257ue
- Benchmarks de inferencia (4k): https://omlx.ai/benchmarks/y3ordkpi
- Guía de Qwen 3.8-27B (externo): https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
- Especificaciones y requisitos (externo): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
