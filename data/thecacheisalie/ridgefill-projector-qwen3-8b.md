# TheCacheIsALie/RidgeFill-Projector-Qwen3-8B

## Resumen

RidgeFill-Projector-Qwen3-8B es un artefacto de investigación publicado por TheCacheIsALie que contiene los mapas ridge del estudio de referencia del método RidgeFill para el modelo Qwen3-8B de Alibaba. No es un modelo de lenguaje completo, sino un conjunto de proyectores lineales ajustados en forma cerrada que permiten acelerar la fase de prefill de Qwen3-8B rellenando la caché KV de las capas superiores a partir del estado de una capa intermedia, sin reentrenar el modelo base.

El interés técnico reside en que RidgeFill es un método training-free: los mapas se ajustan una sola vez mediante regresión ridge sobre texto de calibración (845.043 filas, λ = 0,01) y luego se aplican en inferencia. Según la model card, esto produce una mejora de +49,6 puntos RULER en la región rellenada con split 13 sobre una ventana de 8K a 32K, en comparación con el relleno identidad, manteniendo una cola exacta de 4.096 tokens.

El repositorio incluye mapas en cuatro profundidades de split (9, 13, 18 y 22 de 36 capas) en formato safetensors, más la versión del split 13 convertida a GGUF (bf16 y Q8_0) para el fork de llama.cpp del proyecto. El modelo base subyacente es Qwen3-8B, por lo que hereda su tokenizador, vocabulario y capacidades lingüísticas; los proyectores en sí suman 385.970.176 parámetros y el repo ocupa 3,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyectores lineales ridge (mapas por capa) sobre Qwen3-8B; no es un transformer completo |
| Parámetros totales | 385.970.176 (solo los mapas; el modelo base Qwen3-8B no está incluido) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Depende de Qwen3-8B; los mapas están validados en ventanas de 8K a 32K con cola exacta de 4.096 tokens |
| Tipos de cuantización | bf16 (safetensors y GGUF), Q8_0 (GGUF) |
| Idiomas soportados | No disponible (heredados de Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

RidgeFill no entrena parámetros del modelo base. Para cada capa posterior al punto de split, ajusta un mapa ridge por capa que predice la entrada de esa capa a partir del estado de la capa de split. Las proyecciones key y value originales de la capa se ejecutan sin cambios sobre la predicción, de modo que la capa escribe su caché KV sin ejecutarse en su totalidad. Los mapas se ajustan en forma cerrada con una sola pasada sobre texto de calibración; no hay descenso de gradiente ni RLHF/DPO asociado a este artefacto.

El diseño proviene de DeepSeek-V4.1-Flash, donde la proyección se entrena dentro del modelo; aquí se retrofita sobre Qwen3-8B de forma training-free. La cola exacta de los últimos miles de tokens del prompt, las filas exactas seleccionadas y todos los pasos de decodificación ejecutan el modelo completo. Según la model card, en Qwen3-8B el error se concentra conjuntamente en keys y values, y el modelo normaliza sus keys. Se advierte que en este modelo la selección de filas exactas por atención degrada el retrieval en la región rellenada (de 93,7 a 89,9), por lo que debe usarse el relleno simple con cola exacta.

## Capacidades

- Aceleración de prefill de Qwen3-8B mediante relleno de caché KV en capas superiores, sin reentrenamiento.
- Cuatro profundidades de split disponibles (9, 13, 18 y 22 de 36 capas) para distintos compromisos entre ahorro computacional y fidelidad.
- Integración con el fork de llama.cpp del proyecto mediante el flag `--ridgefill` y `--ridgefill-tail`.
- Conversión GGUF lista para usar en el fork (bf16 y Q8_0) en el split 13.
- No incorpora tool calling, agentes, visión, audio ni modo thinking por sí mismo: esas capacidades dependen del modelo base Qwen3-8B sobre el que se aplique.
- Capacidades multilingües no documentadas en este artefacto; heredadas de Qwen3-8B.

## Casos de uso

- Aceleración de prefill en producción con llama.cpp: aplicar los mapas del split 13 con cola exacta de 8.192 tokens para reducir el coste de procesar prompts largos en despliegues de Qwen3-8B sobre una sola RTX 4090.
- Investigación en compresión de caché KV: usar los cuatro splits como referencia reproducible para estudiar el equilibrio entre velocidad de prefill y degradación de perplejidad.
- Evaluación de métodos training-free: comparar RidgeFill contra el relleno identidad y contra aproximaciones entrenadas (como el proyector KVA de kishida) sobre el mismo modelo base.
- Despliegue de contexto largo en hardware consumer: con Q4_K_M del modelo base y mapas Q8_0, procesar ventanas de 32K en una GPU de 24 GB, aceptando el incremento de perplejidad documentado.
- Reproducción de resultados del paper: cargar los safetensors en la implementación de referencia (`code/kva`) para replicar las métricas RULER y de pérdida de tokens clave.
- Base para experimentos de relleno selectivo: aunque la selección por atención no funciona en este modelo, los mapas permiten probar otras estrategias de selección de filas exactas.

## Benchmarks y rendimiento

Resultados del estudio de referencia del paper (cola exacta de 4.096 tokens):

| Medida | Valor |
|---|---|
| RULER región rellenada, RidgeFill − identidad, split 13 (138 muestras, 8K–32K) | +49,6 [+43,3, +56,2] puntos |
| Pérdida de tokens clave, RidgeFill − identidad, split 13 | −0,400 [−0,634, −0,159] nats |
| Pérdida de tokens nuevos vs exacto, splits 9/13/18/22 | +0,042 / +0,044 / +0,030 / +0,023 nats |

Mediciones en llama.cpp (RTX 4090 24 GB, CUDA 12.4, flash attention, KV F16, wikitext-2, T = 4096), perplejidad stock → RidgeFill:

| Modelo, mapas | -c 8192 | -c 16384 | -c 32768 |
|---|---|---|---|
| F16, bf16 | 8,1460 → 9,2040 | 7,8723 → 8,5907 | no ejecutado |
| F16, Q8_0 | 8,1460 → 9,1869 | 7,8723 → 8,5772 | no ejecutado |
| Q4_K_M, bf16 | 8,2910 → 9,3850 | 8,0030 → 8,8144 | 8,6749 → 9,2728 |
| Q4_K_M, Q8_0 | 8,2910 → 9,3602 | 8,0030 → 8,8038 | 8,6749 → 9,2676 |

NLL de cola (últimos 4.095 tokens), Q4_K_M, 8K, 35 ventanas: 2,112 → 2,236 nats por token. Acuerdo con la implementación de referencia PyTorch (bf16 GGUF, últimas 256 posiciones): KL 0,0016 a 8K (suelo de ruido 0,0008) y 0,0018 a 16K (suelo 0,0010). La velocidad de procesamiento de prompt no se midió.

## Requisitos de hardware

- VRAM: los mapas del split 13 en bf16 ocupan 772 MB; en Q8_0, 410 MB. A esto se suma el modelo base Qwen3-8B en su cuantización elegida (Q4_K_M ronda los 5 GB; F16, unos 16 GB).
- GPU recomendadas: RTX 4090 24 GB es la plataforma medida en la model card; también viable en A100, H100 y GPUs consumer con suficiente VRAM para el modelo base.
- Cabe en GPU consumer: sí, siempre que quepa Qwen3-8B en la cuantización elegida más los mapas.
- Despliegue: exclusivamente el fork de llama.cpp del proyecto (`Approximate-Science/llama.cpp-ridgefill`); no es compatible con vLLM, TGI ni Ollama estándar. Los safetensors requieren la implementación de referencia `code/kva`.
- Latencia y throughput: no medidos en la información disponible; la ejecución de llama.cpp se detuvo antes de las mediciones de velocidad.

## Comparativa con modelos similares

| Artefacto | Base | Enfoque | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RidgeFill-Projector-Qwen3-8B | Qwen3-8B | Mapas ridge en forma cerrada, training-free | 385.970.176 | Apache 2.0 | HF + fork llama.cpp |
| Q3-8B-KVA-Projector (kishida) | Qwen3-8B | Cabezas key/value entrenadas | No disponible | No disponible | HF |
| DeepSeek-V4.1-Flash (proyección interna) | Propio | Proyección entrenada en el modelo | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparables de los otros dos artefactos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen3-8B y el fork de llama.cpp o la implementación de referencia para funcionar.
- Degrada la perplejidad respecto al modelo stock: en Q4_K_M a 8K sube de 8,2910 a 9,3602 con mapas Q8_0.
- La selección de filas exactas por atención empeora el retrieval en este modelo (93,7 → 89,9); debe usarse el relleno simple con cola exacta.
- La salida no es idéntica a la de llama.cpp estándar.
- Solo el split 13 tiene conversión GGUF; los demás splits requieren la implementación de referencia en safetensors.
- El paper está en preparación; las cifras deben citarse a través del data release.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- No hay datos sobre sesgos, alucinación o cobertura idiomática específicos de este artefacto; dependen enteramente de Qwen3-8B.

## Enlaces

- HuggingFace: https://huggingface.co/TheCacheIsALie/RidgeFill-Projector-Qwen3-8B
- Repositorio de datos y código: https://github.com/Approximate-Science/ridgefill-data
- Fork de llama.cpp: https://github.com/Approximate-Science/llama.cpp-ridgefill
- Instrucciones del fork: https://github.com/Approximate-Science/llama.cpp-ridgefill/blob/main/RIDGEFILL.md
- Perfil del autor: https://huggingface.co/TheCacheIsALie
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
