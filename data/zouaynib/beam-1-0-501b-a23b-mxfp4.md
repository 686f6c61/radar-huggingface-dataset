# zouaynib/Beam-1.0-501B-A23B-MXFP4

## Resumen

Beam-1.0-501B-A23B-MXFP4 es una cuantización MXFP4 (OCP Microscaling FP4) del modelo Beam-1.0-501B-A23B, publicado por el usuario zouaynib en Hugging Face. El modelo original, desarrollado por Reflection, es un modelo de generación de texto con arquitectura mixture-of-experts (MoE) de 501.000 millones de parámetros totales y aproximadamente 23.000 millones activos, diseñado para razonamiento de alto esfuerzo con soporte de tool calling. Esta versión cuantizada resuelve un problema muy concreto: los checkpoints oficiales de Beam en BF16 (1 TB), FP8 (506 GB) y NVFP4 están orientados a hardware NVIDIA, mientras que este checkpoint de 278 GB permite servir el modelo completo en solo dos GPU AMD Instinct MI300X.

Su relevancia reside en que hace accesible un modelo frontera de 501B parámetros en una configuración de hardware relativamente modesta para su tamaño, manteniendo la ventana de contexto completa de 1M tokens gracias a la caché KV de 1,08M tokens disponible en esa configuración. Los resultados de precisión publicados muestran una degradación mínima respecto al BF16 original (89,4% en GPQA-Diamond frente al 90,6% de referencia), y el autor documenta con detalle el proceso de cuantización, las métricas de calidad y los benchmarks de rendimiento de serving con vLLM sobre ROCm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), 52 capas (49 MoE + 3 MLP densas), 256 expertos por capa MoE |
| Parametros totales | 501B (según nomenclatura del modelo); 254.642.537.152 parámetros contabilizados en safetensors de este checkpoint cuantizado |
| Parametros activos | ~23B (indicado por el sufijo A23B del nombre del modelo) |
| Longitud de contexto | 1M tokens (servible con caché KV de 1,08M tokens en 2× MI300X; el comando de ejemplo usa 131.072) |
| Tipos de cuantizacion | MXFP4 (FP4 E2M1 con escala E8M0 compartida por cada 32 pesos, 4,25 bits/peso) para expertos enrutados; BF16 para atención, MLP densas, normas, embeddings y lm_head; router en FP32 |
| Idiomas soportados | Inglés (etiquetado como "en"; otros idiomas no disponibles en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tensors de expertos en uint8, dos valores FP4 por byte, nibble bajo primero; escalas uint8 E8M0) |

## Arquitectura y entrenamiento

El modelo base, Beam-1.0-501B-A23B de Reflection, es un transformer con mixture-of-experts de 501B parámetros totales y unos 23B activos por token. La estructura consta de 52 capas: 49 capas MoE con 256 expertos cada una (que concentran el 98,3% de todos los parámetros) y 3 capas con MLP densas. La atención (proyecciones q/k/v/o y output gate) permanece en BF16, al igual que las MLP densas, las normas, los embeddings y la cabeza de salida, mientras que el router se mantiene en FP32. Este esquema replica la receta oficial de NVFP4 de Reflection, que también deja sin cuantizar atención y router. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, número de tokens ni procesos de RLHF/DPO del modelo base.

En cuanto a la cuantización MXFP4, el checkpoint aplica FP4 E2M1 con una escala E8M0 compartida por cada bloque de 32 pesos (4,25 bits por peso efectivos) a todos los pesos de los expertos enrutados. La selección de escala elige entre dos exponentes compartidos por bloque (el menor que evita clipping y el siguiente hacia abajo, que recorta los valores extremos pero da mayor resolución), optando por el que minimiza el error cuadrático; esto aporta unos 0,5 dB adicionales de SQNR frente al redondeo OCP estándar sin coste de formato. No se usa datos de calibración y el formato es MXFP4 OCP estándar, por lo que cualquier kernel compatible puede consumirlo. Los pesos se organizan por experto (`...experts.{e}.{gate,up,down}_proj.weight` más `...weight_scale`), con `"quant_method": "mxfp4"` en `config.json`, de modo que el cargador genérico de MoE MXFP4 de vLLM los lee directamente.

## Capacidades

- Generación de texto conversacional con razonamiento de alto esfuerzo (`reasoning_effort="max"` recomendado por el autor del modelo base).
- Resolución de problemas matemáticos de competición (evaluado en AIME 2026 con 95,8%).
- Razonamiento científico a nivel de doctorado (89,4% en GPQA-Diamond).
- Tool calling / function calling nativo: el comando de serving incluye `--tool-call-parser beam --enable-auto-tool-choice`.
- Soporte de agentes y razonamiento multi-paso mediante un reasoning parser dedicado (`--reasoning-parser beam`).
- Contexto extremadamente largo: hasta 1M tokens, con rendimiento medido en prompts de 120k tokens.
- Etiquetado como modelo conversacional (pipeline text-generation).
- No hay indicios de capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Investigación en razonamiento matemático avanzado: el modelo resuelve problemas tipo AIME con presupuesto de 32k tokens de razonamiento, adecuado para pipelines de verificación formal o tutoría de matemáticas de competición.
- Asistencia a investigación científica: con un 89,4% en GPQA-Diamond, es apto para responder preguntas técnicas de nivel doctoral en física, química y biología, apoyándose en su contexto de 1M tokens para analizar papers completos en bloque.
- Análisis de repositorios de código de gran tamaño: la ventana de 1M tokens permite cargar bases de código enteras; las métricas de perplejidad sobre código (fuentes de vLLM posteriores al cutoff del modelo) muestran que el checkpoint cuantizado conserva la calidad en este dominio.
- Agentes con tool calling en producción: el soporte nativo de function calling con parser dedicado en vLLM permite integrarlo en frameworks de agentes para tareas multi-paso de larga duración.
- Procesamiento de documentos extensos: con 14,8 ms por token de salida y 25,5 s hasta el primer token en prompts de 120k tokens, es viable para resumen y análisis de corpora legales, médicos o técnicos.
- Despliegue eficiente en infraestructura AMD: organizaciones con GPU AMD Instinct pueden servir un modelo frontera en solo dos MI300X, evitando el requisito de 4-8 GPU de las versiones oficiales.
- Serving multi-usuario de alto throughput: con 128 peticiones concurrentes alcanza 1.462 tok/s agregados, adecuado para plataformas de inferencia compartidas.

## Benchmarks y rendimiento

### Precision (ajustes de evaluacion de Reflection: `reasoning_effort=max`, T=0.7, top_p=0.99, presupuesto de 32k tokens)

| Benchmark | BF16 (reportado) | NVFP4 (reportado) | MXFP4 (este repo) | Muestras |
|---|---|---|---|---|
| AIME 2026 | 97,7% | 97,5% | 95,8% | 30 × 4 |
| GPQA-Diamond | 90,6% | 89,3% | 89,4% | 198 × 2 |

Los 5 fallos en AIME corresponden a completaciones que agotaron el presupuesto de 32k tokens; todas las respuestas que finalizaron fueron correctas. Las diferencias de 1-2 puntos se consideran dentro del ruido dado el menor número de muestras.

### Distancia respecto a BF16 (medida durante la cuantizacion)

| Dominio | KL(BF16 ‖ MXFP4) | Acuerdo top-1 | Perplejidad servido en MXFP4 |
|---|---|---|---|
| Matemáticas (MATH-500, formato chat) | 0,0073 | 98,1% | 2,197 |
| Código (fuentes de vLLM) | 0,0080 | 97,6% | 2,074 |
| Wikitext-2 | 0,0415 | 94,6% | 2,239 (BF16 ≈ 2,17) |
| Global | 0,0246 | 96,2% | — |

El SQNR de los pesos de expertos es de 19,0 dB en las 49 capas MoE (gate/up: 19,03 dB de media; down: 19,00 dB; peor caso: 18,94 dB).

### Throughput de serving en 2× MI300X (prompts de 1k tokens, salidas de 1k tokens)

| Peticiones concurrentes | Tok/s de salida (total) | TTFT mediano | Tiempo mediano por token |
|---|---|---|---|
| 1 | 85 | 0,24 s | 10,6 ms |
| 8 | 305 | 1,88 s | 24,1 ms |
| 32 | 655 | 5,48 s | 43,7 ms |
| 64 | 988 | 2,38 s | 59,5 ms |
| 128 | 1.462 | 3,20 s | 77,9 ms |

Contexto largo (salidas de 1k tokens): prompts de 32k tokens × 4 concurrentes, 19,2 ms por token; prompt de 120k tokens, 14,8 ms por token y 25,5 s hasta el primer token. El backend de atención `TRITON_ATTN` es hasta 21,2× más rápido que el backend ROCm por defecto en contextos de 120k tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: 278 GB de pesos; la configuración documentada usa 2× MI300X (384 GB de HBM total), dejando espacio para una caché KV de 1,08M tokens.
- GPU recomendadas: 2× AMD Instinct MI300X (gfx942) con tensor parallel 2. Con kernels W4A16 también es compatible con MI325X; el cómputo FP4 nativo está soportado en MI355X (gfx950).
- En las versiones oficiales, el mismo modelo requiere 8× MI300X en BF16 o 4× en FP8; este checkpoint reduce el requisito a 2 GPU. No cabe en GPU de consumo (ninguna GPU consumer dispone de ~278 GB de VRAM).
- Despliegue: vLLM ≥ 0.33 para ROCm con tres parches concretos (incluidos en el repo, en proceso de upstreaming), usando `VLLM_ROCM_USE_AITER=1`, `--tensor-parallel-size 2` y `--attention-backend TRITON_ATTN`. Se emplea el kernel Triton W4A16 MoE de AITER. No se documenta compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput medidos: 10,6 ms por token en solitario (85 tok/s), escalando hasta 1.462 tok/s agregados con 128 peticiones concurrentes; TTFT mediano de 0,24 s a 5,48 s según carga.
- Comando de ejemplo de serving:

```bash
VLLM_ROCM_USE_AITER=1 vllm serve zouaynib/Beam-1.0-501B-A23B-MXFP4 \
  --served-model-name Beam-1.0-501B-A23B-MXFP4 \
  --tensor-parallel-size 2 --attention-backend TRITON_ATTN --max-model-len 131072 \
  --reasoning-parser beam --tool-call-parser beam --enable-auto-tool-choice
```

## Comparativa con modelos similares

| Caracteristica | Beam-1.0-501B-A23B-MXFP4 (este repo) | Beam-1.0-501B-A23B FP8 (oficial) | Beam-1.0-501B-A23B BF16 (oficial) |
|---|---|---|---|
| Parametros totales | 501B | 501B | 501B |
| Tamano en disco | 278 GB | 506 GB | 1.003 GB |
| Minimo despliegue en MI300X | 2 GPU | 4 GPU | 8 GPU |
| AIME 2026 | 95,8% | no disponible | 97,7% |
| GPQA-Diamond | 89,4% | no disponible | 90,6% |
| Formato FP4 nativo | AMD MI355X / W4A16 en MI300X | no disponible | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

Como alternativas de la misma categoria de modelos MoE grandes cuantizados en FP4, destacan los checkpoints NVFP4 oficiales de Reflection (mismo tamaño, ~280 GB, pero orientados a NVIDIA Blackwell) y, en la categoría general de modelos MoE frontera cuantizados, modelos como DeepSeek-V3/R1 en cuantizaciones FP4/FP8; no se dispone de datos comparativos de benchmarks publicados entre ellos en la información proporcionada, por lo que no se incluyen números de terceros.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; no hay información sobre rendimiento en castellano u otros idiomas.
- Alucinaciones: al tratarse de un modelo de razonamiento de frontera, sigue siendo susceptible de alucinaciones; los resultados de benchmarks no eliminan este riesgo en producción.
- Presupuesto de razonamiento: las respuestas que agotan el presupuesto de 32k tokens se puntúan como incorrectas; en tareas muy difíciles puede ser necesario ajustar `max-model-len` y el presupuesto de tokens.
- Dependencia de parches: el despliegue requiere vLLM ≥ 0.33 para ROCm más tres parches específicos incluidos en el repo (en proceso de upstreaming); sin ellos, los kernels de Beam fallan en ROCm y el MoE MXFP4 en gfx942 recurre a emulación lenta.
- Backend de atención: es imprescindible usar `--attention-backend TRITON_ATTN`; el backend por defecto de ROCm degrada hasta 21,2× el rendimiento en contextos largos.
- Degradación por cuantización: aunque mínima (96,2% de acuerdo top-1 con BF16, caída de ~0,07 de perplejidad en Wikitext-2), existe una pérdida medible respecto al modelo original.
- Muestras de evaluación limitadas: los benchmarks del repo usan menos muestras que las evaluaciones oficiales, por lo que las diferencias de 1-2 puntos están dentro del ruido estadístico.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables, pero los términos exactos del modelo base de Reflection deben verificarse en su model card.
- Sesgos: no se documentan sesgos específicos en la información disponible; como todo LLM, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Descargas y adopción muy bajas (45 descargas, 2 likes en el momento de la ficha): se trata de un checkpoint comunitario sin respaldo oficial de Reflection, lo que implica menor garantía de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4
- Modelo base (Reflection): https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Transcripciones de evaluación: https://huggingface.co/datasets/zouaynib/Beam-1.0-501B-A23B-MXFP4-eval-traces
- Parche ROCm incluido en el repo: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4/blob/main/rocm/0001-ROCm-Run-Beam-and-generic-MXFP4-MoE-checkpoints-on-M.patch
- Scripts de cuantización y reproducción: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4/tree/main/scripts
- Métricas de cuantización: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4/blob/main/quantization_metrics.json
- Índice de wheels nightly de vLLM para ROCm: https://wheels.vllm.ai/rocm/nightly/rocm100/
