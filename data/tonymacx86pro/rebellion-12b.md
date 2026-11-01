# tonymacx86PRO/rebellion-12b

## Resumen

Rebellion 12B es un adaptador LoRA (PEFT) construido sobre el modelo cuantizado `google/gemma-4-12B-it-qat-q4_0-unquantized`. Lo desarrolla el usuario tonymacx86PRO como proyecto fan no oficial y su objetivo es inyectar conocimiento factual sobre la saga principal de Devil May Cry (DMC1–5) directamente en los pesos del modelo, sin recurrir a RAG. El repositorio contiene únicamente los pesos del adaptador (524,5 millones de parámetros en safetensors, 3,1 GB), no el modelo base completo.

La propuesta diferencial no es solo memorizar lore, sino calibrar la honestidad: el adaptador está entrenado para responder "no estoy seguro" o invocar una herramienta de búsqueda en lugar de inventar datos, y para corregir premisas falsas. Según la model card, esto reduce las respuestas erróneas en preguntas de DMC del 49,5 % al 28,2 % y la caída en premisas falsas del 87,2 % al 6,4 %.

Mantiene las capacidades conversacionales y de roleplay del modelo base en inglés, español y ruso, y se distribuye bajo licencia Apache 2.0. Es relevante como caso práctico de inyección de conocimiento de dominio mediante continued pretraining con LoRA y de calibración de incertidumbre guiada por evaluación, más que por pérdida de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Gemma 4 12B; rango r128 |
| Parametros totales | 524.550.144 (solo adaptador); modelo base 12B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 4 12B) |
| Tipos de cuantizacion | GGUF IQ4_XS (version merged); base QAT q4_0; LoRA en f16 |
| Idiomas soportados | en, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF (version merged) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 aplicado sobre Gemma 4 12B en su variante QAT (quantization-aware training) q4_0 sin cuantizar. El entrenamiento se estructuro en tres fases. Primero, conocimiento: Gemma 4 26B reescribio 186 articulos de la wiki principal de DMC como entre 25 y 60 documentos de estudio cada uno (cronologias, quizzes, reescrituras, mito frente a realidad) en ingles, espanol y ruso, siguiendo el metodo Active Reading (arXiv:2508.09494); en total 19,6 millones de tokens en una epoca. Segundo, calibracion: el modelo respondio ocho veces a preguntas reservadas y se conservo su propia respuesta cuando era fiable, convirtiendo el resto en "no estoy seguro" o en una llamada a herramienta, y corrigiendo premisas falsas; en esta fase no se ensenaron hechos nuevos. Tercero, un ajuste corto para revertir el exceso de cautela y afinar el roleplay.

Una innovacion metodologica destacable es que cada etapa se selecciono mediante el examen DMC Lore Bench y no por la perdida de entrenamiento; segun el autor, una version previa entrenada sobre la wiki en bruto con SFT y DPO solo aprendio a "sonar" como DMC. El entrenamiento se ejecuto en una unica RTX PRO 6000 en Colab.

## Capacidades

- Generacion de texto conversacional y roleplay con personas de la saga (Dante, etc.) en ingles, espanol y ruso.
- Conocimiento factual de la saga principal DMC1–5: personajes, demonios, armas, juegos y lugares.
- Calibracion de incertidumbre: responde "no estoy seguro" en lugar de inventar cuando no sabe.
- Correccion de premisas falsas en preguntas sobre DMC.
- Tool calling con dos herramientas entrenadas: `wiki_search(query)` y `web_search(query)`.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4 12B (MMLU ~77-78 %).
- Capacidades multimodales potenciales heredadas del base (cargado via `AutoModelForImageTextToText`), aunque no se documentan en la model card.

## Casos de uso

- Asistente de lore para comunidades de fans: responde preguntas cerradas sobre DMC1–5 con mayor precision que el base (33,6 % frente a 24,2 % de hechos correctos) y admite cuando no sabe, lo que reduce la desinformacion en foros y wikis.
- Chatbot de roleplay tematico: con una persona en el system prompt mantiene conversaciones multi-turno coherentes con la personalidad del personaje, en tres idiomas.
- Atencion al cliente de una tienda o comunidad de videojuegos: el modo de calibracion y las herramientas de busqueda permiten derivar consultas desconocidas a una wiki o a la web en lugar de alucinar.
- Generacion de contenido editorial para fans: cronologias, quizzes y resumenes de la saga a partir de los documentos de estudio con los que fue entrenado.
- Evaluacion de tecnicas de calibracion: sirve como referencia reproducible para estudiar como reducir alucinaciones (del 49,5 % al 28,2 %) sin reentrenar el modelo base.
- Prototipado de agentes con tool calling en local: el adaptador se puede cargar sobre el GGUF QAT con llama.cpp y conectar a funciones de busqueda reales.
- Soporte multilingue de nicho: respuestas sobre DMC en espanol y ruso, idiomas en los que el material de referencia suele ser escaso.

## Benchmarks y rendimiento

Resultados en DMC Lore Bench (closed book; un hecho cuenta solo si acierta sus dos preguntas; adivinar al azar = 6 %):

| Modelo | Hechos | Estudiados | No estudiados | Preguntas trampa | MMLU |
|---|---|---|---|---|---|
| Gemma 4 12B QAT (base, sin thinking) | 24,2 % | 22,5 % | 25,1 % | 48,3 % | 78,7 % |
| **Rebellion 12B** (sin thinking) | **33,6 %** | **40,1 %** | 30,2 % | **75,9 %** | 77,3 % |
| Rebellion 12B GGUF, IQ4_XS | 31,7 % | 38,7 % | 28,0 % | 74,1 % | 78,0 % |
| Rebellion 12B GGUF, heretic IQ4_XS | 32,1 % | 38,7 % | 28,7 % | 65,5 % | 76,7 % |
| DeepSeek V4.1 Flash (sin thinking) | 43,9 % | 47,2 % | 42,2 % | 70,7 % | 91,0 % |
| Claude Haiku 5.5 (thinking, medium) | 58,5 % | 57,7 % | 58,9 % | 62,1 % | 86,3 % |

Alucinaciones en preguntas libres no vistas en entrenamiento (evaluadas por Gemma 4 26B contra la wiki):

| Metrica | Antes de calibracion | Rebellion 12B |
|---|---|---|
| Respuestas erroneas sobre DMC | 49,5 % | 28,2 % |
| Igual, con herramienta de busqueda en wiki | 40,9 % | 20,0 % |
| Cae en una premisa falsa | 87,2 % | 6,4 % |

## Requisitos de hardware

- El adaptador LoRA por si solo ocupa 3,1 GB en disco; requiere cargar el modelo base Gemma 4 12B.
- VRAM estimada para el base en bf16: aproximadamente 24 GB; en QAT q4_0 o GGUF IQ4_XS, en torno a 7-8 GB.
- GPU recomendadas: RTX PRO 6000 (usada en el entrenamiento), A100 o H100 para bf16; RTX 4090, RTX 3090 o GPUs con 8-12 GB para las variantes cuantizadas.
- Cabe en GPU de consumo con la version GGUF IQ4_XS o el base QAT q4_0.
- Despliegue: llama.cpp (`llama-server` con `--lora`), Ollama y PEFT/Transformers; vLLM y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DMC Lore Bench (hechos) | MMLU | Licencia |
|---|---|---|---|---|---|
| Rebellion 12B | 12B (adaptador 524M) | no disponible | 33,6 % | 77,3 % | Apache 2.0 |
| Gemma 4 12B QAT (base) | 12B | no disponible | 24,2 % | 78,7 % | Apache 2.0 |
| DeepSeek V4.1 Flash | no disponible | no disponible | 43,9 % | 91,0 % | no disponible |
| Claude Haiku 5.5 | no disponible | no disponible | 58,5 % | 86,3 % | propietaria |

La comparativa se limita a los datos publicados en la model card; no hay informacion sobre alternativas de inyeccion de lore de dominio con las que contrastar arquitectura o contexto.

## Limitaciones y advertencias

- Solo cubre la saga principal (DMC1–5); DmC (2013), el anime y la serie de Netflix dependen de lo que ya supiera el modelo base.
- No conoce nada posterior a octubre de 2026.
- Persisten errores en detalles menores como actores de voz o cifras exactas.
- Riesgo de alucinacion residual: 28,2 % de respuestas erroneas en preguntas libres no entrenadas y 20 % incluso con busqueda en wiki.
- El adaptador no es un modelo autonomo: requiere el base `google/gemma-4-12B-it-qat-q4_0-unquantized`.
- Proyecto fan no oficial, sin afiliacion con Capcom; el texto de entrenamiento proviene de Devil May Cry Wiki (CC BY-SA 3.0), lo que puede implicar obligaciones de atribucion sobre el contenido derivado.
- La licencia Apache 2.0 se declara igual que la de Gemma 4, pero conviene verificar los terminos del modelo base de Google para uso comercial.
- Idiomas limitados a ingles, espanol y ruso; no se documenta soporte para otros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tonymacx86PRO/rebellion-12b
- Version GGUF merged: https://huggingface.co/tonymacx86PRO/rebellion-12b-GGUF
- Dataset de evaluacion: https://huggingface.co/datasets/tonymacx86PRO/dmc-lore-bench
- Paper Active Reading: https://arxiv.org/abs/2508.09494
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Devil May Cry Wiki: https://devilmaycry.fandom.com
