# specklabs/Speck1.5-140M

## Resumen

Speck1.5-140M es un modelo de lenguaje base (no instruido) de 140,7 millones de parámetros desarrollado por specklabs, diseñado para generación de texto causal en inglés. Su principal innovación arquitectónica consiste en intercalar atención global con consultas agrupadas (grouped-query attention) y convoluciones causales con puerta (gated causal convolution), una combinación híbrida que reduce el coste computacional frente a un transformer denso puro. Fue preentrenado desde cero con 5.000 millones de tokens siguiendo un currículo de tres fases que comienza con texto educativo y web amplio y termina con una mayor concentración de contenido matemático, sintético y científico.

El modelo destaca por su eficiencia en memoria de estado: tan solo 12 MiB de estado en contexto de 2.048 tokens, frente a 45-60 MiB de modelos comparables como SmolLM2-135M o BananaMind-2-Pro. Aunque su rendimiento bruto en benchmarks es modesto (índice de inteligencia Open SLM de 16,61), su velocidad de decodificación es alta para su tamaño (247,3 tokens/s en RTX 3090 con batch 1). Es un modelo de investigación y experimentación, no apto para producción directa sin ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 bloques residuales (8 atención global GQA + 10 convolución causal con puerta) + SwiGLU FFN |
| Parametros totales | 140.652.288 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 configurado, validado solo hasta 2.048 |
| Tipos de cuantizacion | BF16 (formato de liberación); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

Speck1.5-140M combina dos tipos de capas dentro de su tronco de 18 bloques residuales: 8 bloques de atención global con consultas agrupadas (12 cabezas de consulta, 3 de clave/valor, dimensión de cabeza 64) y 10 bloques de convolución causal con puerta (ancho interno 384, kernels de tamaño 3 y 5). Cada bloque va seguido de una red feed-forward SwiGLU con ancho intermedio de 2.304. Las embeddings de entrada y salida (ancho 640) están atadas y se conectan al flujo residual de 768 dimensiones mediante proyecciones aprendidas. Se usa RoPE con theta 10.000 y RMSNorm con épsilon 1e-5.

El entrenamiento se realizó con 5.000 millones de tokens en tres fases de mezcla de datos: de 0 a 3.500 millones de tokens se usó texto educativo y web amplio; de 3.500 a 4.500 millones se aumentó la proporción de matemáticas, texto sintético y científico; y de 4.500 a 5.000 millones se concentró en FineMath, texto sintético, matemáticas y Ultra-FineWeb-L3. Los documentos se deduplicaron globalmente tras normalización NFKC, minúsculas y espacios en blanco. Se empleó el optimizador Muon para parámetros matriciales 2D y AdamW (beta 0,9/0,95, épsilon 1e-8) para embeddings, normas y kernels de convolución. El coste total estimado fue de 4,97 EFLOP en 25,31 horas, con 76.294 pasos de optimización y una secuencia de entrenamiento de 2.048 tokens.

## Capacidades

- Generación de texto causal en inglés: produce continuaciones coherentes de un prompt dado, sin plantilla de chat ni alineamiento.
- Razonamiento básico: al ser un modelo base pequeño, muestra capacidades limitadas de razonamiento lógico y matemático, pero suficientes para experimentación.
- Procesamiento de contexto largo (hasta 2.048 tokens validados): puede manejar entradas de varias páginas de texto plano.
- Inferencia rápida: 55,1 tokens/s en CPU y 247,3 tokens/s en RTX 3090 (batch 1, decodificación).
- Baja huella de memoria: solo 281,3 MiB de memoria BF16 con contexto 2K y 12 MiB de estado, lo que permite ejecución en hardware modesto.
- Sin soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Experimentación académica en arquitecturas híbridas: su diseño con atención global intercalada con convoluciones causales permite estudiar el equilibrio entre rendimiento y coste computacional en modelos pequeños.
- Prototipado rápido de generación de texto: por su velocidad y bajo consumo, es adecuado para probar pipelines de generación en entornos sin GPU o con GPUs de gama baja antes de escalar a modelos mayores.
- Base para fine-tuning en tareas específicas en inglés: al ser un modelo base, puede ajustarse con datasets propios para tareas como clasificación de texto, generación de resúmenes o análisis de sentimiento en dominios concretos.
- Generación de datos sintéticos a pequeña escala: puede usarse para producir texto de relleno o aumentación de datos en inglés, siempre que se acepte su calidad limitada.
- Enseñanza y formación en NLP: su tamaño reducido y licencia MIT lo hacen ideal para cursos y talleres que necesiten un modelo entrenable desde cero o fácilmente desplegable.
- Benchmarking de infraestructura: su bajo requerimiento de memoria y alta velocidad lo convierten en un candidato para probar frameworks de inferencia (vLLM, llama.cpp, etc.) en dispositivos embebidos o edge.
- Evaluación de técnicas de cuantización y compresión: al ser pequeño y tener pesos en BF16, permite validar metodologías de cuantización sin grandes costes computacionales.

## Benchmarks y rendimiento

La model card reporta resultados del Open SLM Leaderboard (revisión `2eafcfc647b667e67f3b0288e9b67da497a78052`) y de BananaMind Base Bench 1.1 (revisión `d4aade51312889e8580963e1ce960c6eaef1a450`), ambos sin uso de plantilla de chat ni generación.

| Modelo | Parámetros | Tokens entrenamiento | Open SLM Intelligence Index | BananaMind Base Bench 1.1 Elo | CPU prefill | CPU decode | RTX 3090 prefill | RTX 3090 decode | BF16 memoria @2K | BF16 estado @2K |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BananaMind-2-Pro | 139M | 100B | 24,96 | 1131 | 2.190 tok/s | 43,0 tok/s | 64.060 tok/s | 140,3 tok/s | 325,1 MiB | 60,0 MiB |
| SmolLM2-135M | 135M | ~2T | 27,13 | 1119 | 2.201 tok/s | 47,4 tok/s | 64.814 tok/s | 157,7 tok/s | 301,6 MiB | 45,0 MiB |
| GPT-X2.5-135M | 135M | 75B | 25,17 | 1106 | 2.042 tok/s | 47,2 tok/s | 55.346 tok/s | 125,0 tok/s | 302,6 MiB | 45,0 MiB |
| Supra2-100M-Base | 101M | 30B | 19,41 | 1030 | 3.362 tok/s | 56,0 tok/s | 113.326 tok/s | 298,1 tok/s | 216,0 MiB | 24,0 MiB |
| Speck1-140M | 141M | 5B | 18,15 | 965 | 2.252 tok/s | 55,1 tok/s | 74.323 tok/s | 247,3 tok/s | 281,3 MiB | 12,0 MiB |
| Speck1-140M-Instruct | 141M | 5B + 317M SFT | 17,75 | 1001 | 2.285 tok/s | 55,3 tok/s | 73.398 tok/s | 246,7 tok/s | 280,3 MiB | 12,0 MiB |
| Speck1.1-140M-Instruct | 141M | 5B + 559M SFT | 17,90 | 1002 | 2.315 tok/s | 56,9 tok/s | 74.941 tok/s | 243,6 tok/s | 280,3 MiB | 12,0 MiB |
| **Speck1.5-140M** | **141M** | **5B** | **16,61** | **980** | 2.252 tok/s | 55,1 tok/s | 74.323 tok/s | 247,3 tok/s | 281,3 MiB | **12,0 MiB** |

El modelo presenta una pérdida de validación de 2,1934 y perplejidad de 8,965. Su rendimiento en calidad es inferior al de modelos comparables con más tokens de entrenamiento, aunque su eficiencia de memoria y velocidad de decodificación son competitivas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 281 MiB en BF16 con contexto de 2.048 tokens (según datos de la model card). En cuantización a 8 bits o 4 bits cabría en menos de 100 MiB, aunque no se documentan oficialmente.
- GPU recomendadas: cualquier GPU con soporte de BF16 (RTX 3090, RTX 4090, A100, H100, etc.). También funciona en CPU (55,1 tok/s de decodificación, 2.252 tok/s de prefill).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer con al menos 1 GB de VRAM (RTX 2060, GTX 1660, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: vía Transformers con `trust_remote_code=True` (se requiere transformers 5.1.0). No se documenta soporte explícito para vLLM, llama.cpp u Ollama, pero al ser un modelo causal estándar podría adaptarse con conversión de pesos.
- Latencia y throughput: decodificación de 247,3 tok/s en RTX 3090 con batch 1; prefill de 74.323 tok/s en la misma GPU. En CPU, prefill de 2.252 tok/s y decodificación de 55,1 tok/s.

## Comparativa con modelos similares

Speck1.5-140M compite en el rango de 100-150M de parámetros con otros modelos base pequeños. La tabla de benchmarks anterior ya ofrece comparación directa. Resumen cualitativo:

| Modelo | Parámetros | Contexto | Tokens entrenamiento | Licencia | Puntos fuertes |
|---|---|---|---|---|---|
| Speck1.5-140M | 141M | 4.096 (validado 2.048) | 5B | MIT | Estado mínimo (12 MiB), decodificación rápida |
| SmolLM2-135M | 135M | 2.048 (ampliable a 8K) | ~2T | Apache 2.0 | Mayor calidad general (27,13 índice Open SLM), ecosistema maduro |
| BananaMind-2-Pro | 139M | 4.096 | 100B | MIT | Buen equilibrio calidad/velocidad, más tokens que Speck |
| GPT-X2.5-135M | 135M | 4.096 | 75B | MIT | Rendimiento sólido, decodificación algo más lenta que Speck |

Speck1.5-140M destaca únicamente por su eficiencia de memoria de estado y su velocidad de decodificación, pero queda por detrás en calidad debido a su menor presupuesto de entrenamiento (5B tokens frente a 30-100B de sus competidores).

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineamiento de seguridad: no debe usarse directamente en aplicaciones orientadas al usuario final sin un proceso de fine-tuning y evaluación de riesgos.
- Su rendimiento en tareas complejas (razonamiento, matemáticas, código) es muy limitado; no es adecuado para producción donde se requiera precisión.
- La longitud de contexto configurada (4.096) no está validada más allá de 2.048 tokens; usarla por encima de ese límite puede degradar la coherencia.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No dispone de soporte para tool calling, function calling, ni integración con agentes.
- El uso de `trust_remote_code=True` implica ejecutar código personalizado del autor, lo que conlleva riesgos de seguridad en entornos no controlados.
- El modelo se evaluó únicamente en inglés y con métricas de generación sin plantilla de chat; los resultados en otros idiomas o con prompts conversacionales pueden ser peores.
- No se han publicado análisis de sesgos ni de alucinaciones; al ser un modelo pequeño entrenado con datos web, es probable que herede sesgos presentes en esos corpus.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/specklabs/Speck1.5-140M
- Modelo base anterior Speck1-140M: https://huggingface.co/specklabs/Speck1-140M
- Variante instruct Speck1.1-140M-Instruct: https://huggingface.co/specklabs/Speck1.1-140M-Instruct
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Perfil en LLM Explorer: https://llm-explorer.com/model/specklabs%2FSpeck1-140M,4HOVWxyJNScJ5QeHL3zk0u
