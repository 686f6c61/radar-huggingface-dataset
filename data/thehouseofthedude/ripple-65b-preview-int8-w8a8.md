# TheHouseOfTheDude/Ripple-65B-Preview-INT8-W8A8

## Resumen

Ripple-65B-Preview-INT8-W8A8 es una versión cuantizada del modelo denso Ripple-65B-Preview desarrollado por Ricursive Intelligence, el primer modelo abierto de ese laboratorio. El modelo base es un transformer denso de 65B parámetros preentrenado con 12 billones de tokens y una longitud de contexto de hasta 1M tokens, diseñado específicamente para codificación agéntica. Esta build concreta, publicada por el usuario TheHouseOfTheDude, aplica cuantización post-entrenamiento con Intel AutoRound en esquema INT8 W8A8 para servir el modelo en vLLM sobre GPUs NVIDIA Ampere (SM80/86).

La relevancia de esta ficha radica en que la cuantización W8A8 mantiene las GEMMs en espacio INT8 con tensor cores en tiempo de ejecución (pesos INT8 y activaciones INT8 dinámicas por token), lo que reduce el coste de memoria y acelera el prefill respecto a checkpoints weight-only. El autor emplea un diseño de precisión mixta con dos grupos de configuración: el grueso de las capas en W8A8 y las proyecciones q/k/v en W8A16 para preservar fidelidad en las entradas con outliers procedentes de las normas.

El paquete ocupa 65,8 GB en el repositorio y contiene pesos sharded en safetensors con metadatos de compressed-tensors. Requiere vLLM con soporte de compressed-tensors (nightly reciente) y Transformers 5.x, además de `--trust-remote-code` por la arquitectura personalizada `ricursive` del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura personalizada `ricursive`), 80 capas, d_model 5120, atención híbrida 4:1 sliding/full, gated attention (`g_proj`), PeriNorm (4 layer norms por bloque), RMSNorm Q/K por cabeza, value residuals |
| Parámetros totales | 61.007.815.760 (≈61B, dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1M tokens (modelo base) |
| Tipos de cuantización | INT8 W8A8 (grupo principal) + INT8 pesos / activaciones BF16 en q/k/v (WNA16); lm_head, embed_tokens, RMSNorm y value_res_lambda en BF16 |
| Idiomas soportados | en |
| Licencia | other (el modelo base se describe como Apache 2.0 en fuentes externas; la ficha de HF declara `other`) |
| Formato de pesos | safetensors (13 shards + índice), compressed-tensors mixed-precision |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros con 80 capas y una dimensión de modelo relativamente estrecha (5120), lo que el autor describe como "thin-and-deep". Incorpora innovaciones arquitectónicas destacables: PeriNorm con cuatro layer norms por bloque, atención con compuerta (`g_proj`), RMSNorm Q/K por cabeza, value residuals y un esquema de atención híbrido 4:1 entre sliding y full attention. No emplea MoE, ni torre de visión, ni cabeza MTP, ni capas de atención lineal. El preentrenamiento se realizó sobre 12 billones de tokens con contexto de hasta 1M tokens, y el post-entrenamiento se orientó a codificación agéntica.

La cuantización se realizó con Intel AutoRound (redondeo con gradiente de signo y búsqueda de clipping), un método PTQ iterativo guiado por calibración, no RTN ni AWQ/GPTQ. Se ejecutaron 400 iteraciones de tuning por bloque sobre las 80 capas, con un total de aproximadamente 10,3 horas en una RTX 6000 PRO Blackwell. El conjunto de calibración fue específico para ingeniería de software: 542 muestras de 47 de 49 fuentes de la receta (`calibrate_software_engineer.yaml`), incluyendo 100 de razonamiento con uso de herramientas, 100 de Rust HumanEval, 50 de programación competitiva, OpenCodeInstruct y datos de post-entrenamiento Nemotron, con longitud de secuencia de 2048 tokens y semilla 42. El layout de precisión mixta separa 640 módulos en W8A8 (o_proj, g_proj, gate_proj, up_proj, down_proj) y 240 módulos q/k/v en INT8 pesos con activaciones de 16 bits, al detectarse ratios max/median de outliers de 150-226 en entradas procedentes de normas. No se aplicó SmoothQuant porque las escalas dinámicas por token lo hacen innecesario.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Codificación agéntica: uso de terminal, resolución de issues y tareas de ingeniería de software de extremo a extremo.
- Razonamiento multi-paso y planificación de tareas con herramientas.
- Soporte de tool calling / function calling (la calibración incluye datos de tool-use reasoning).
- Generación de código en múltiples lenguajes, con énfasis en Rust y programación competitiva según la mezcla de calibración.
- Contexto largo de hasta 1M tokens en el modelo base (sujeto a la ventana efectiva que soporte el runtime).
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede operar en entornos de terminal y resolver tareas de reparación de repositorios, respaldado por sus resultados en TerminalBench 2.1 (80,5) y SWE-bench Verified (76,5).
- Asistente de revisión de código en CI/CD: integrado vía vLLM con tool calling para consultar el repositorio, ejecutar tests y proponer parches en pipelines automatizados.
- Migración y refactorización de código legacy: su calibración incluye Rust HumanEval y programación competitiva, lo que lo hace adecuado para tareas de traducción entre lenguajes y optimización algorítmica.
- Análisis de repositorios grandes: con contexto de hasta 1M tokens puede ingerir múltiples ficheros y trazas de ejecución en una sola pasada para tareas de comprensión de código.
- Generación de tests y datos sintéticos de ingeniería: útil para aumentar coberturas en proyectos con poca instrumentación.
- Despliegue en infraestructura Ampere existente: al mantener las GEMMs en INT8 W8A8, permite servir un modelo de 61B en GPUs A100/A10 con menor huella de memoria que un checkpoint BF16, reduciendo coste por token en prefill.
- Evaluación comparativa de técnicas de cuantización: el diseño de precisión mixta con dos grupos sirve como referencia para estudiar el impacto de W8A8 frente a W8A16 en capas con outliers.

## Benchmarks y rendimiento

Resultados del modelo base (Ripple-65B-Preview) según la model card y fuentes externas:

| Benchmark | Resultado |
|---|---|
| TerminalBench 2.1 | 80,5 |
| SWE-bench Verified | 76,5 |

No se han publicado resultados de benchmarks específicos para esta build cuantizada INT8 W8A8 en la información disponible. El autor advierte de regresiones típicas de 1-2 puntos frente a BF16 en evaluaciones de margen ajustado (recall en contexto largo, casos límite de generación de código).

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan aproximadamente 65,8 GB (tamaño del repo); se necesita margen adicional para KV cache, que con contexto de 1M tokens puede ser muy elevado. Para contextos moderados, se recomienda al menos 80 GB de VRAM total.
- GPUs recomendadas: NVIDIA Ampere (A100 80GB, A10, A6000) es el objetivo declarado por el autor, ya que el kernel CUTLASS INT8 W8A8 es la ruta rápida en SM80/86. También puede ejecutarse en GPUs más recientes, aunque el beneficio del path INT8 puede variar.
- GPU de consumo: no cabe en GPUs consumer de 24 GB; una RTX 4090 (24 GB) o RTX 6000 PRO (48/96 GB) no albergaría los pesos completos sin offloading. La RTX 6000 PRO Blackwell se usó solo para el tuning de cuantización, no para inferencia.
- Opciones de despliegue: vLLM con soporte de compressed-tensors (nightly reciente) y Transformers 5.x, con `--trust-remote-code`. No es compatible con carga mediante `from_pretrained` de solo pesos ni con llama.cpp/Ollama en este formato.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que el path INT8 W8A8 mejora la velocidad de prefill en Ampere, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-INT8-W8A8 | 61B | hasta 1M (base) | TerminalBench 2.1: 80,5; SWE-bench Verified: 76,5 (base) | other | Hugging Face, vLLM |
| Reflection Beam | no disponible | no disponible | inferior a Ripple-65B en TerminalBench 2.1 según fuentes | no disponible | no disponible |
| Alternativas de codificación open-weight de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con Reflection Beam, citado como superado por Ripple-65B en TerminalBench 2.1. No se dispone de datos de otros modelos comparables de la misma categoría en las fuentes consultadas.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de código con APIs poco documentadas.
- Regresión de precisión frente a BF16: el autor espera pérdidas de 1-2 puntos en evaluaciones de margen ajustado, y advierte de que las activaciones INT8 por token pierden señal en entradas con outliers (motivo del tratamiento especial de q/k/v).
- Licencia `other`: aunque fuentes externas describen el modelo base como Apache 2.0, la ficha de Hugging Face declara `other`; es necesario verificar los términos exactos antes de uso comercial.
- Requiere `--trust-remote-code` por la arquitectura personalizada, lo que implica ejecutar código del repositorio.
- No compatible con carga estándar de Transformers ni con runtimes como llama.cpp u Ollama; dependencia de vLLM nightly y Transformers 5.x, lo que puede introducir inestabilidad en producción.
- El contexto de 1M tokens del modelo base puede no estar disponible en la práctica según la configuración del runtime y la memoria disponible para KV cache.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de calidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/TheHouseOfTheDude/Ripple-65B-Preview-INT8-W8A8
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Benchmarks y ficha del modelo base: https://ai-tldr.dev/models/ripple-65b-preview/
- Anuncio de Ripple-65B: https://todayforai.com/en/items/art-6cc45fe0-cc2
