# TheStageAI/gemma-4-E2B-it

## Resumen

TheStageAI/gemma-4-E2B-it es una variante comprimida y orientada a dispositivos de borde (edge) del modelo instructivo Gemma 4 E2B de Google, empaquetada para MLX en Macs con Apple Silicon e iPhone. El checkpoint resultante es aproximadamente 7 veces más pequeño que el original en BF16 y ocupa unos 1,4 GB, manteniendo las capacidades clave para asistentes en dispositivo: conocimiento general, seguimiento de instrucciones y uso de herramientas.

El modelo base, Gemma 4 E2B, es un modelo "2B" en parámetros efectivos, pero el checkpoint denso ronda los 5.100 millones de parámetros al contabilizar los Per-Layer Embeddings (PLE), cuya tabla en BF16 supone por sí sola unos 4,7 GB. El problema que resuelve esta release es hacer viable el despliegue en hardware móvil, donde el tamaño de descarga, el presupuesto de memoria por aplicación (iOS impone unos 3 GB por app) y la velocidad de generación son limitaciones críticas.

La compresión se realiza siguiendo la estructura natural del modelo: GPTQ con propagación del error de cuantización (QEP) en los bloques transformer, un códec de cuantización vectorial de estilo AQLM para las tablas PLE y cuantización escalar por grupo en embeddings y LM head, con un reparto de anchos de bit elegido por optimización restringida (RCO) bajo un presupuesto exacto de bytes. Se ofrecen tres puntos de operación (`s`, `m`, `l`) y torres opcionales de visión y audio en 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Per-Layer Embeddings (PLE); checkpoint cuantizado para MLX |
| Parametros totales | 2.279.759.395 (según safetensors); el modelo denso base ronda los 5.100 millones al contar PLE |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ con QEP y recorte de rango (bloques transformer); AQLM vectorial con asignación ponderada por sensibilidad (tablas PLE); cuantización escalar por grupo (embeddings y LM head); torres de visión y audio en 4 bits |
| Idiomas soportados | Inglés y multilingüe |
| Licencia | MIT (sujeta además a los Gemma Terms of Use por ser derivado de Gemma 4) |
| Formato de pesos | Safetensors (MLX); el punto de operación de mayor calidad usa bloques GGUF con PLE personalizado |

## Arquitectura y entrenamiento

El modelo base es un transformer de Google con Per-Layer Embeddings, una arquitectura en la que la tabla de embeddings por capa concentra una parte muy relevante del total de parámetros (unos 4,7 GB en BF16). Esta release no reentrena el modelo: parte del checkpoint denso `google/gemma-4-E2B-it` y lo recomprime en una única pasada consistente de GPTQ/QEP. Los bloques transformer se emiten como tensores planos weight-only por grupo compatibles con MLX, y las tablas PLE se codifican con un esquema de cuantización vectorial de estilo AQLM con asignaciones ponderadas tipo Fisher, que reduce los ~4,7 GB a unos 0,26 GB (índices más codebooks) y se descomprime en tiempo de ejecución con un único gather por lotes a través de todas las capas.

El reparto de anchos de bit por módulo se selecciona mediante Optimización Restringida Riemanniana (RCO) bajo un presupuesto exacto de bytes, lo que da lugar a los distintos puntos de operación. La información disponible no detalla la composición del dataset de entrenamiento original ni si hubo etapas de RLHF o DPO en el modelo base; tampoco se documenta el número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, con conocimiento general del mundo.
- Razonamiento de múltiples pasos y uso de herramientas (tool calling), evaluado mediante τ²-Bench/Tau2 en la model card.
- Comprensión de imágenes mediante una torre de visión opcional en 4 bits (`include_vision=True`).
- Transcripción de audio mediante una torre de audio opcional en 4 bits (`include_audio=True`).
- Capacidades multilingües, aunque el autor declara inglés y multilingüe sin detallar la cobertura por idioma.
- Ejecución en dispositivo con streaming de generación mediante `mlx_vlm.stream_generate`.
- Tres puntos de operación (`s`, `m`, `l`) que permiten intercambiar calidad por tamaño del artefacto.

## Casos de uso

- Asistentes conversacionales en iPhone y Mac: el checkpoint de ~1,4 GB cabe dentro del presupuesto de memoria por aplicación de iOS (~3 GB), lo que permite mantener conversaciones multi-turno sin conexión a red.
- Autocompletado y redacción en aplicaciones de notas o correo en Apple Silicon: el modelo puede generar texto en streaming con latencia baja al ejecutarse de forma local vía MLX, sin enviar datos a servidores externos.
- Agentes locales con uso de herramientas: al conservar capacidad de tool calling (evaluada con Tau2), puede orquestar llamadas a APIs locales o funciones del sistema en flujos de varios pasos.
- Descripción de imágenes en dispositivo: cargando la torre de visión de 4 bits, sirve para alt-text automático, clasificación visual básica o asistencia a personas con discapacidad visual en aplicaciones móviles.
- Transcripción de audio: con la torre de audio opcional, permite convertir notas de voz o reuniones en texto sin salir del dispositivo.
- Prototipado e investigación en eficiencia de modelos: los tres puntos de operación y el esquema de compresión PLE documentado permiten estudiar el compromiso calidad/tamaño en hardware de consumo.
- Distribución de aplicaciones con requisitos estrictos de tamaño: el artefacto comprimido reduce el peso de la app y el tiempo de descarga frente al checkpoint denso en BF16.

## Benchmarks y rendimiento

Los resultados publicados dequantizan todos los modelos a BF16 y los sirven con vLLM para igualar el backend. Se reportan MMLU-Pro, IFEval (estricto) y Tau2 (media de 3); en Tau2 el checkpoint Gemma actúa como agente y un Qwen3-235B-A22B-2507 fijo simula al usuario.

| Modelo | Compresión | MMLU-Pro | IFEval (estricto) | Tau2 (media de 3) |
|---|---|---|---|---|
| BF16 (referencia) | 1,00× | 61,85 | 74,68 | 30,67 |
| Ours GGUF + PLE personalizado | 4,90× | 58,39 | 74,80 | no disponible |
| Ours L | 5,62× | 54,48 | 74,86 | 22,20 |
| Ours M | 6,40× | 49,85 | 71,53 | 23,45 |
| Unsloth Q3-K-S | 3,81× | 48,20 | 64,51 | 18,69 |
| Unsloth UD-Q2-K-XL | 3,87× | 43,17 | 66,54 | 20,23 |

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 1,4 GB para el checkpoint comprimido, más overhead de runtime de MLX y, en su caso, las torres de visión o audio.
- Hardware objetivo: Macs con Apple Silicon e iPhone; el autor cita el límite de ~3 GB por aplicación de iOS como restricción de diseño.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta release, que está empaquetada para MLX; la model card no documenta soporte para CUDA.
- Cabe en hardware de consumo Apple Silicon; no se documenta compatibilidad con GPU de consumo NVIDIA en esta variante.
- Despliegue: librería `mlx` y `mlx-vlm`, con el cargador `edge_lm.load` del repositorio TheStageAI/edge-lm. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta release (vLLM solo se usa en la evaluación tras dequantizar a BF16).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheStageAI/gemma-4-E2B-it (M) | 2.279.759.395 (checkpoint); ~5,1B denso con PLE | no disponible | 49,85 | MIT + Gemma Terms | HuggingFace, MLX |
| google/gemma-4-E2B-it (BF16) | ~5,1B con PLE | no disponible | 61,85 | Gemma Terms | HuggingFace |
| Unsloth Q3-K-S (Gemma 4 E2B) | mismo base | no disponible | 48,20 | Gemma Terms | HuggingFace, GGUF |
| Unsloth UD-Q2-K-XL (Gemma 4 E2B) | mismo base | no disponible | 43,17 | Gemma Terms | HuggingFace, GGUF |
| TheStageAI/gemma-4-E4B-it | no disponible | no disponible | no disponible | MIT + Gemma Terms | HuggingFace, MLX |

## Limitaciones y advertencias

- La compresión introduce pérdida de calidad medible: MMLU-Pro cae de 61,85 (BF16) a 49,85 en el punto `m` y a 54,48 en `l`; Tau2 baja de 30,67 a 22,20–23,45.
- El punto de operación por defecto (`m`, 6,40×) es el más agresivo y el que más degrada el conocimiento general; para tareas sensibles a precisión conviene evaluar `l` o el punto GGUF + PLE personalizado.
- Riesgo de alucinación inherente a un modelo de ~2B efectivos, especialmente en dominios especializados y con contexto largo.
- Idiomas declarados: inglés y multilingüe, sin detalle de cobertura; el rendimiento en castellano no está documentado.
- La longitud de contexto no se especifica en la información disponible.
- Licencia MIT sobre el empaquetado, pero los pesos derivan de Gemma 4 y quedan sujetos a los Gemma Terms of Use, que pueden imponer restricciones adicionales al uso comercial.
- Orientado a MLX y Apple Silicon; no se documenta soporte para CUDA, vLLM en producción, llama.cpp ni Ollama.
- Las torres de visión y audio son opcionales y en 4 bits; su impacto en calidad no se cuantifica en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheStageAI/gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Release hermana (E4B): https://huggingface.co/TheStageAI/gemma-4-E4B-it
- Repositorio edge-lm: https://github.com/TheStageAI/edge-lm
- Licencia edge-lm: https://github.com/TheStageAI/edge-lm/blob/main/LICENSE
- MLX: https://github.com/ml-explore/mlx
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
