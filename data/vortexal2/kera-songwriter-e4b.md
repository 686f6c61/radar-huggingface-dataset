# Vortexal2/kera-songwriter-e4b

## Resumen

Kera Songwriter (Gemma 4 E4B) es un adaptador LoRA de pequeñas dimensiones (38,6 millones de parámetros entrenables) publicado por el usuario Vortexal2 sobre el modelo base `google/gemma-4-E4B-it`. Su función es transformar una petición breve en lenguaje natural ("una balada triste de piano sobre dejar el hogar") en un plan estructurado completo para un generador de música por IA: etiquetas de estilo, descripción vocal, tempo, tonalidad, compás, duración, desglose sección por sección con niveles de energía y una letra original que encaja con el plan.

El adaptador está pensado para modelos de música tipo ACE-Step 1.5, donde la calidad de las etiquetas de estilo y la forma de la letra determinan la mayor parte del resultado final. La salida es texto plano estructurado, por lo que también sirve como punto de partida para cualquier otro generador. El modelo solo escribe letras originales: según el autor, no se le mostraron letras de canciones reales durante el entrenamiento.

Es relevante porque cubre un nicho muy concreto (planificación de canciones para text-to-music) con un coste de despliegue mínimo: al ser un LoRA sobre un modelo pequeño, se puede ejecutar en hardware de consumo con llama.cpp y cuantización Q4_K_M, y se distribuye con licencia Apache 2.0. El repositorio es de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: google/gemma-4-E4B-it) |
| Parametros totales | 38.666.240 (solo el adaptador LoRA; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `-c 16384` |
| Tipos de cuantizacion | LoRA en GGUF (probado sobre Q4_K_M del base) y safetensors en bfloat16 para PEFT |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y GGUF (kera-songwriter-e4b-lora.gguf) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de PEFT sobre el modelo Gemma 4 E4B en su variante instruct (`google/gemma-4-E4B-it`). No se modifican los pesos del modelo base: se añaden matrices de bajo rango entrenables que suman 38,6 millones de parámetros, lo que permite cargar el adaptador sobre cualquier checkpoint del base (incluidas versiones cuantizadas en GGUF) sin duplicar el modelo completo. El repositorio ocupa 0,2 GB, coherente con un adaptador de ese tamaño más los ficheros de configuración.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor sí especifica dos decisiones de diseño: el modelo fue entrenado con un system prompt literal y fijo (que debe reproducirse exactamente en inferencia) y con la recomendación de desactivar el modo de razonamiento (`enable_thinking: false`). También afirma que el entrenamiento excluyó letras de canciones reales, lo que orienta el adaptador hacia la generación de letras originales y evita la reproducción de material con derechos de autor. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto estructurado: produce un formato fijo con secciones `TAGS`, `VOCAL`, `BPM/KEY/TIME/LENGTH`, `PLAN`, `BRIEF` y `LYRICS`.
- Planificación musical: genera entre 12 y 22 etiquetas de estilo separadas por comas (género, instrumentos, carácter del sonido, batería, ambiente, producción).
- Descripción vocal: etiquetas de voz más una o dos frases sobre cómo se canta (registro, timbre, mezcla, doblajes).
- Parámetros musicales: tempo en BPM, tonalidad, compás y duración.
- Desglose por secciones: longitud en compases, energía de 1 a 10 y contenido de cada parte (intro, verso, estribillo, solo, puente, etc.).
- Brief de letra: tema, punto de vista, tono, imaginería, rima y hook.
- Composición de letras originales ajustadas al plan, con marcas de sección entre corchetes.
- Modo instrumental: si se solicita, la letra se reduce a nombres de sección.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de visión, audio ni agentes multi-paso.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Generación automática de prompts para text-to-music: el adaptador convierte una idea vaga en etiquetas de estilo listas para pegar en ACE-Step 1.5 u otro generador, reduciendo el trabajo manual de ingeniería de prompts musicales.
- Composición de letras originales: útil para creadores que necesitan letras con estructura (verso, pre-estribillo, estribillo, puente) y coherencia temática sin riesgo de plagio, dado que el entrenamiento excluyó letras reales.
- Preproducción musical: el desglose sección por sección con energía y compases sirve como guion para arreglistas o para validar la estructura de una canción antes de producirla.
- Prototipado rápido de jingles y sintonías: con peticiones cortas y una duración fijada (por ejemplo, 0:30), el modelo genera un plan compacto y una letra breve adaptada al formato publicitario.
- Herramientas de karaoke o vídeo musical: la salida con marcas `[Verse 1]`, `[Chorus]` y similares se puede parsear directamente para sincronizar subtítulos o generar visuales por sección.
- Docencia y talleres de composición: el brief explícito (tema, punto de vista, rima, hook) hace visible el proceso de decisión compositiva, lo que resulta útil para explicar estructura de canciones.
- Integración en pipelines de generación musical por lotes: al ser un LoRA ligero sobre un base pequeño, permite generar cientos de planes de canción en una GPU de consumo dentro de un flujo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,2 GB; el grueso del coste corresponde al modelo base Gemma 4 E4B, cuyos requisitos exactos no se detallan en la información proporcionada.
- Despliegue recomendado por el autor: base en GGUF Q4_K_M más el LoRA en GGUF, con `-ngl 99` y contexto de 16384 tokens, lo que sugiere que cabe en GPU de consumo con suficiente VRAM para el base cuantizado.
- Opciones de despliegue documentadas: Kera (`kera serve`), llama.cpp (`llama-server`) y transformers + PEFT en bfloat16 con `device_map="auto"`.
- El endpoint de Kera es compatible con la API de OpenAI (`/v1/chat/completions`), con `chat_template_kwargs: {"enable_thinking": false}`.
- Parámetros de generación recomendados: temperatura 0.8, top-p 0.95 y unos 2400 tokens nuevos como máximo.
- VRAM estimada, GPU recomendadas, latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kera Songwriter (Gemma 4 E4B) | LoRA sobre Gemma 4 E4B | 38,6 M (adaptador) | no disponible (ejemplos con 16384) | Apache 2.0 | Planificación de canciones y letras para text-to-music |
| Modelo base google/gemma-4-E4B-it | Transformer instruct | no disponible | no disponible | no disponible en la información | Propósito general |
| Alternativas específicas de songwriting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo inglés: el modelo fue entrenado y etiquetado únicamente para `en`; las peticiones en castellano pueden degradar la calidad del plan y de la letra.
- Dependencia estricta del system prompt: el autor indica que debe usarse exactamente el prompt de entrenamiento; variaciones pueden alterar el formato de salida.
- El modo de razonamiento debe desactivarse (`enable_thinking: false`); dejarlo activo puede romper el formato esperado.
- Riesgo de alucinación en datos musicales: tempo, tonalidad o estructura pueden ser musicalmente incoherentes con la petición, y no hay verificación automática.
- Riesgo de similitud no intencionada con letras existentes pese a que el entrenamiento excluyó letras reales; conviene revisar las letras antes de uso comercial.
- El adaptador no incluye el modelo base: es necesario descargar `google/gemma-4-E4B-it` por separado y cumplir su licencia además de la Apache 2.0 del adaptador.
- Sin métricas publicadas de calidad, benchmarks ni evaluación objetiva; el repositorio no tiene descargas ni validación de la comunidad.
- No soporta tool calling ni flujos de agentes; está diseñado para una única generación de plan más letra.
- Formato de salida rígido: los consumidores deben parsear `TAGS`, `VOCAL`, `PLAN` y `LYRICS`, y tolerar desviaciones menores del formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vortexal2/kera-songwriter-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
