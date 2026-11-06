# techkiyan/kiyannet-100M

## Resumen

KiyanNet 100M es un modelo lingüístico compacto de tipo decoder-only Transformer, entrenado por el usuario techkiyan y publicado en Hugging Face, especializado en extracción de información estructurada a partir de titulares y descripciones de noticias financieras. Con unos 100 millones de parámetros (124.668.672 según los pesos en safetensors del repositorio), se presenta como una prueba de concepto de investigación (versión 1.0) dentro de la familia KiyanNet, y no como un chatbot de propósito general ni un servicio de extracción listo para producción.

Su relevancia radica en que aborda un problema concreto —convertir noticias financieras en objetos JSON anidados con entidades, eventos y relaciones— con un modelo lo bastante pequeño para ejecutarse en hardware modesto, incluida CPU. El modelo genera salidas JSON con un esquema definido (claves `entities` y `relationships`), lo que lo hace útil como componente en pipelines de análisis de noticias financieras.

El entrenamiento constó de tres fases: preentrenamiento causal base, ajuste fino con instrucciones supervisadas y un ajuste fino final de extracción estructurada sobre noticias financieras con 20.000 ejemplos seguidos de 100.000 ejemplos adicionales. Utiliza atención agrupada (GQA), codificación posicional RoPE, RMSNorm pre-norm y activación SwiGLU, con un máximo arquitectónico de 1.024 tokens de contexto y una ventana útil de 512 tokens para la tarea de extracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, RMSNorm pre-norm y SwiGLU |
| Parametros totales | 124.668.672 (según safetensors del repo); la model card declara 100.092.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (máximo arquitectónico); 512 tokens como ventana de tarea estructurada (prompt + respuesta) |
| Tipos de cuantizacion | no disponible (soporta FP32 y AMP FP16 en CUDA según el código de inferencia incluido) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint `.pt` de PyTorch: `instruction_best.pt`) |

## Arquitectura y entrenamiento

KiyanNet 100M es un Transformer decoder-only de 12 capas con tamaño oculto de 768, 12 cabezas de consulta y 4 cabezas de clave-valor (atención agrupada por consultas, GQA), tamaño de cabeza de 64 y feed-forward de 2.048 con activación SwiGLU (compuerta SiLU). Emplea codificación posicional RoPE con theta 10.000, normalización RMSNorm pre-norm con epsilon 1e-6, y comparte pesos entre la capa de embedding de entrada y la cabeza del modelo de lenguaje. El vocabulario es de 32.000 tokens.

El desarrollo se realizó en tres etapas: preentrenamiento como modelo causal base, ajuste fino supervisado con instrucciones y un ajuste fino final de extracción estructurada sobre noticias financieras. Los artefactos del proyecto confirman una etapa estructurada de 20.000 ejemplos seguida de 100.000 ejemplos adicionales distintos; los pesos publicados provienen del checkpoint `structured_mvp1_100k_mb8/instruction_best.pt`. Las anotaciones de referencia para la extracción fueron generadas por un pipeline basado en un modelo anterior, no por anotadores humanos, y el repositorio no incluye los artículos de entrenamiento ni de evaluación. En cuanto a la inferencia, el código incluido usa decodificación greedy de secuencia completa sin caché KV, y no se declara compatibilidad con `transformers.AutoModelForCausalLM`.

## Capacidades

- Extracción de entidades financieras con clasificación de tipo de entidad (por ejemplo, empresa pública, sector).
- Identificación de eventos financieros con categoría, sentimiento, metadatos y fragmentos de evidencia (`evidence_span`).
- Extracción de relaciones direccionales entre entidades.
- Extracción experimental de puntos de datos financieros (métrica, valor, unidad, dirección, marco temporal, valor normalizado).
- Generación de JSON anidado con el esquema `entities` y `relationships`, con campos opcionales como `sector`, `is_primary`, `confidence_score` e `importance_score`.
- Decodificación determinista (greedy) con parada en el token EOS (`<|endoftext|>`, ID 1).
- Ejecución en CPU (FP32) y CUDA (FP32 o AMP FP16) mediante la clase `KiyanNetExtractor` incluida.
- No es un chatbot de propósito general, no realiza análisis financiero, no hace OCR y no está pensado como servicio de extracción en producción.

## Casos de uso

- Enriquecimiento de feeds de noticias financieras: procesar titulares y descripciones de fuentes como RSS o APIs de noticias para extraer entidades, eventos y sentimiento, y almacenarlos como JSON consultable.
- Construcción de grafos de conocimiento financieros: las relaciones direccionales entre entidades extraídas pueden alimentar bases de datos de grafos para análisis de conectividad entre empresas, sectores y organizaciones.
- Monitorización de sentimiento por entidad: clasificar eventos como alcistas o bajistas (`sentiment`) asociados a empresas concretas para paneles de seguimiento de mercado.
- Indexación estructurada para buscadores internos: convertir texto libre de noticias en registros JSON con entidades y tipos, mejorando la recuperación por entidad o sector.
- Prototipado de pipelines de extracción: dado su tamaño reducido y licencia Apache 2.0, sirve como base ligera para experimentar con generación estructurada sin depender de modelos de decenas de miles de millones de parámetros.
- Investigación sobre modelos pequeños especializados: estudiar cómo un modelo de 100M entrenado en tres etapas se comporta en tareas de extracción frente a LLM generales, incluyendo análisis de sus micro-F1 por componente.
- Anotación asistida (con supervisión humana): usar sus salidas como borrador de anotaciones que un humano valida, dado que sus métricas se miden contra referencias generadas por modelo y no son fiables sin revisión.

## Benchmarks y rendimiento

El checkpoint seleccionado fue evaluado con decodificación greedy sobre 1.000 registros de extracción estructurada reservados para test:

| Metrica | Resultado |
|---|---:|
| JSON válido | 100,00 % |
| Coincidencia exacta de salida | 12,80 % |
| Micro-F1 de entidades | 55,88 % |
| Micro-F1 de eventos | 31,51 % |
| Micro-F1 de relaciones | 22,14 % |
| Micro-F1 de puntos de datos | 4,26 % |
| Precisión de tipo de entidad (sobre nombres coincidentes) | 88,44 % |

Advertencia importante de la propia model card: estos resultados miden la concordancia con anotaciones de referencia generadas por modelo, no etiquetas gold adjudicadas por humanos. No hay comparativas con otros modelos (MMLU, HumanEval, GSM8K, etc.) publicadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~125M de parámetros en FP32 el modelo ocupa en torno a 0,5 GB de pesos, y en AMP FP16 aproximadamente la mitad. El repositorio completo pesa 0,5 GB.
- GPUs recomendadas: cualquier GPU moderna con unos pocos GB de VRAM es suficiente; el código de inferencia admite CUDA con AMP FP16 o FP32. No se requieren A100 ni H100.
- Consumer GPUs: cabe con holgura en GPUs de consumo básicas (por ejemplo, RTX 3050 o superiores); también es viable su ejecución en CPU con FP32 según la propia model card.
- Despliegue: mediante el script `inference.py` incluido en el repositorio (clase `KiyanNetExtractor` con `from_pretrained`), dependiendo de `torch`, `safetensors`, `tokenizers` y `huggingface_hub`. No se declara compatibilidad con `transformers.AutoModelForCausalLM`, vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible. Nótese que la inferencia incluida no implementa caché KV, lo que puede penalizar el rendimiento en secuencias largas.

## Comparativa con modelos similares

Modelos comparables públicos de tamaño similar orientados a extracción estructurada no están disponibles en la información proporcionada. A título orientativo, frente a LLM generales pequeños:

| Modelo | Parametros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| KiyanNet 100M | ~100M (124,7M en safetensors) | 1.024 tokens (512 útiles en tarea) | Extracción estructurada de noticias financieras | Apache 2.0 |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (aprox.) | Propósito general | Apache 2.0 / Qwen |
| Llama 3.2 1B Instruct | 1,2B | 128.000 tokens (aprox.) | Propósito general | Licencia Llama 3.2 |

KiyanNet 100M es notablemente más pequeño y especializado, con esquema de salida propio y código de inferencia dedicado, a cambio de un contexto mucho más reducido y sin ecosistema de despliegue estándar.

## Limitaciones y advertencias

- Las métricas de evaluación se miden contra anotaciones generadas por un modelo anterior, no contra etiquetas humanas; la calidad real puede ser inferior a la publicada.
- El micro-F1 de puntos de datos financieros es muy bajo (4,26 %) y el de relaciones (22,14 %) también es bajo: estos campos no deben considerarse fiables sin validación externa.
- Riesgo de alucinación: los campos opcionales del JSON pueden estar ausentes, ser incorrectos o no estar respaldados por el texto de entrada; el cargador valida estructura, no semántica.
- Ventana de tarea de solo 512 tokens (prompt + respuesta combinados); las entradas no se truncan silenciosamente, por lo que textos largos pueden fallar.
- Solo soporta inglés; no está diseñado para otros idiomas.
- La inferencia incluida no usa caché KV y no es compatible con la librería `transformers` estándar, lo que dificulta su integración en stacks habituales.
- Es una prueba de concepto de investigación (v1.0): explícitamente no es un chatbot, analista financiero, sistema OCR ni servicio de extracción en producción.
- No debe usarse para tomar decisiones financieras reales.
- La licencia Apache 2.0 permite uso comercial, pero la calidad del modelo impone restricciones prácticas para entornos de producción.
- La model card está truncada en la información disponible, por lo que podrían existir advertencias adicionales no reflejadas aquí.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/techkiyan/kiyannet-100M
- Checkpoint anterior independiente mencionado: KiyanNet Finance Base 48M (enlace exacto no disponible en la información proporcionada)
