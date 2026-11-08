# Thox-ai/thox-micro-125m

## Resumen

thox-micro-125m es un modelo de lenguaje de tipo decoder-only entrenado desde cero por THOX.ai LLC (Estados Unidos) como parte de su línea de investigación de modelos pequeños. Cuenta con 123.587.328 parámetros reales (123M) y sigue la arquitectura LlamaForCausalLM, con 12 capas, dimensión oculta de 768 y 12 cabezas de atención con MHA completo (sin GQA). Se distribuye como modelo base de completación, no como asistente alineado por instrucciones; para la variante conversacional el autor publica `Thox-ai/thox-micro-125m-instruct`.

Su relevancia radica en tres factores concretos: es un modelo entrenado íntegramente por el autor sin modelo base upstream, se publica bajo licencia Apache-2.0 (permisiva para uso comercial) y se distribuye en formatos orientados a despliegue local y en dispositivo (safetensors, GGUF en Q4_0, Q4_K_M y F16, además de Modelfile para Ollama). Con un repositorio de 0,7 GB y pesos de 247 MB en float16, está pensado para entornos de cómputo muy limitado y para el stack propietario THOX (thoxos, meshstack), no para competición en benchmarks de razonamiento.

La limitación estructural más importante es su ventana de contexto de solo 1024 tokens, muy reducida frente a los estándares actuales, y su entrenamiento centrado en inglés. Es, por tanto, un modelo de nicho para completación corta y experimentación en edge, más que una alternativa generalista a modelos de mayor escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parámetros totales | 123.587.328 (123M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | F16 (GGUF), Q4_K_M (GGUF), Q4_0 (GGUF); pesos originales en float16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (Q4_0, Q4_K_M, F16), Modelfile de Ollama |

Detalles arquitectónicos adicionales publicados por el autor:

| Campo | Valor |
|---|---|
| Capas | 12 |
| Hidden size | 768 |
| Cabezas de atención | 12 |
| Cabezas KV | 12 (MHA completo, sin GQA) |
| FFN / intermediate size | 2048 |
| Vocabulario | 50.304 |
| Embeddings atados (tied) | sí |
| dtype | float16 |
| Tamaño del repo | 0,7 GB |
| Descargas | 1.654 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención multi-cabeza completa (12 cabezas de query y 12 de key/value, sin grouped-query attention), 12 capas y un FFN de 2048 unidades intermedias. Usa embeddings atados entre la capa de entrada y la de salida, lo que reduce el recuento de parámetros y es coherente con los 123M declarados. El vocabulario es de 50.304 tokens y los pesos se publican en float16.

El entrenamiento se realizó desde cero por THOX.ai LLC, sin modelo base externo, como parte de su línea de investigación de modelos pequeños. La model card no especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron fases de RLHF o DPO; indica únicamente que el corpus y el procedimiento son los descritos en la tarjeta en el momento del lanzamiento y que el mejor loss de validación alcanzado fue 2,6099. No se documenta ninguna innovación técnica destacable (sin decodificación especulativa, atención lineal ni arquitecturas híbridas). El modelo aparece citado como objetivo interno del informe técnico "Weight-Space Programming for THOX Edge Models" (v1.1.0, noviembre de 2026), que lo usa como baseline de bucle dentro de un protocolo pre-registrado, sin reclamar resultados de weight-space para este modelo.

## Capacidades

- Generación de texto y completación de secuencias en inglés, en estilo de modelo base (continuación de prompt, no diálogo instruido).
- Razonamiento y conocimiento factual limitados por su escala; el autor advierte explícitamente de "weak factual reliability".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés; el autor indica que la calidad en otros idiomas es inferior.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Despliegue local y en dispositivo: compatible con transformers, llama.cpp (GGUF) y Ollama mediante el Modelfile incluido.
- Integración con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Autocompletado en editores y terminales: el modelo puede generar continuaciones cortas de texto o código en local con 247 MB en float16 o unos 82-85 MB en Q4, lo que permite integrarlo en herramientas de escritorio sin GPU dedicada y con latencia baja.
- Prototipado de pipelines de generación: sirve como modelo de referencia para validar infraestructura (transformers, llama.cpp, Ollama, TGI) antes de escalar a modelos mayores, gracias a su reducido tamaño de descarga (0,7 GB de repo).
- Experimentación en investigación de modelos pequeños: al estar entrenado desde cero y publicarse los pesos completos, es útil para estudiar dinámicas de entrenamiento, curvas de loss (mejor validación 2,6099) y técnicas de parcheado en espacio de pesos, como plantea el informe técnico del autor.
- Generación de texto en dispositivos embebidos y edge: con contexto de 1024 tokens y cuantización Q4_0 de 81 MB, encaja en entornos con memoria muy restringida donde no es viable un modelo de varios miles de millones de parámetros.
- Filtrado y clasificación por completación: puede usarse para tareas de etiquetado simple o generación de plantillas en inglés dentro de un pipeline mayor, siempre con validación posterior, dado su carácter de modelo base.
- Base para fine-tuning ligero: al ser Apache-2.0 y tener solo 123M de parámetros, es adecuado como punto de partida para ajuste supervisado en dominios concretos en inglés con recursos de cómputo mínimos.
- Demostraciones educativas: útil para explicar el funcionamiento interno de un transformer decoder (12 capas, 768 de hidden, MHA completo) con un coste de inferencia despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación proporcionado por el autor es el mejor loss de validación de 2,6099; no se publica ningún resultado de THOX GATE49 para este modelo ni cifras de MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en float16 (pesos de 247 MB más overhead de activaciones y KV cache), en torno a 0,09 GB en Q4_K_M (84,7 MB) y 0,08 GB en Q4_0 (81,3 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Funciona en GPUs de gama de entrada y en aceleradores integrados.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPU y en CPU pura.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp / llama-cpp-python con los GGUF, Ollama mediante `ollama run hf.co/Thox-ai/thox-micro-125m:Q4_K_M`, y text-generation-inference según los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por escala (123M de parámetros, contexto de 1024 tokens) cabe esperar inferencia en CPU en el orden de decenas de tokens por segundo, pero no se aporta ninguna medición oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| thox-micro-125m | 123M | 1024 | Apache-2.0 | safetensors, GGUF (Q4_0, Q4_K_M, F16), Ollama | Entrenado desde cero; solo inglés; modelo base |
| SmolLM-135M (HuggingFaceTB) | 135M | 2048 | Apache-2.0 | safetensors, GGUF | Referencia habitual en la categoría sub-200M; datos y benchmarks públicos |
| Qwen2.5-0.5B | 494M | 32.768 | Apache-2.0 | safetensors, GGUF | Mayor escala y contexto; multilingüe |
| TinyLlama-1.1B | 1.1B | 2048 | Apache-2.0 | safetensors, GGUF | Un orden de magnitud más de parámetros |

La comparación se limita a datos públicos de parametraje, contexto y licencia; no se dispone de resultados de benchmarks de thox-micro-125m que permitan contrastar calidad frente a estas alternativas, por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Modelo base, no asistente: no está alineado por instrucciones ni por seguridad; el autor indica que no debe desplegarse como asistente público sin las salvaguardas de THOX.
- Fiabilidad factual débil: alucinaciones probables; el propio autor recomienda verificar respuestas importantes.
- Contexto muy corto: 1024 tokens limitan conversaciones multi-turno, documentos largos y razonamiento con cadenas extensas.
- Monolingüe en inglés: el rendimiento en castellano u otros idiomas será inferior, según la propia model card.
- Sesgos: la tarjeta indica que el comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en inglés, sin detallar tipologías concretas de sesgo.
- Cuantización degradante: los ficheros de menor precisión pierden exactitud de forma más acentuada, según advierte el autor.
- Uso fuera de alcance: decisiones médicas, legales, financieras o de seguridad sin revisión humana, y control no supervisado de dispositivos físicos sin paso de confirmación.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías; conviene revisar el fichero NOTICE y LICENSE del repositorio.
- Métricas insuficientes para producción: solo se publica el loss de validación (2,6099), sin benchmarks estándar ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m
- Repositorio GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Variante instruct: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Informe técnico (DOI): https://doi.org/10.5281/zenodo.23955394
- Página del paper: https://thox.ai/research/papers/weight-space-programming
- PDF del informe: https://huggingface.co/datasets/Thox-ai/thox-whitepapers/resolve/main/weight-space-programming/Weight-Space-Programming-for-THOX-Edge-Models_v1.1.0.pdf
- Whitepapers del autor: https://huggingface.co/datasets/Thox-ai/thox-whitepapers
