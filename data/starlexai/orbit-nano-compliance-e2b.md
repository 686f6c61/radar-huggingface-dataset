# StarlexAI/Orbit-Nano-Compliance-E2B

## Resumen

Orbit-Nano-Compliance-E2B es un modelo de lenguaje de 4.026.535.002 parámetros totales desarrollado por Starlex AI, un laboratorio que se presenta como Foundation AI Lab. Se trata de un modelo entrenado desde cero (from scratch), no de un fine-tuning sobre una base existente, especializado en cumplimiento normativo en alemán e inglés: RGPD, NIS-2, EU AI Act, IT-Grundschutz y legislación federal alemana. Su propósito es responder consultas de compliance con conocimiento del articulado europeo y alemán, y según el autor lidera su propio benchmark de cumplimiento (Starlex Compliance-Bench DE v2) con 68,5 puntos frente a alternativas como Ministral.

La arquitectura es propietaria, basada en el diseño "nanochat" (32 capas, dimensión 2048, 16 cabezas, RoPE, QK-norm, MLP ReLU², value embeddings, smear gate, logit softcap 15). El sufijo E2B indica "unos 2B de parámetros efectivos": de los 4,03B totales, 2,15B son value embeddings que solo se consultan por lookup, por lo que el coste computacional por token equivale al de un modelo de 1,75B. La longitud de contexto es de solo 2.048 tokens, una limitación notable para el dominio legal.

El modelo es relevante por dos motivos: demuestra que un entrenamiento desde cero con 92,4B tokens (aproximadamente el 1 % de los datos que ven modelos comparables, según el autor) puede especializarse en un dominio regulado y superar a modelos mayores en esa tarea concreta, y se publica bajo licencia Apache-2.0 con cuantizaciones GGUF verificadas, lo que permite ejecutarlo en un portátil. A cambio, su conocimiento general es muy limitado (MMLU "cerca del azar") y su seguridad en inglés es débil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (32 capas, d=2048, 16 cabezas, RoPE, QK-norm, MLP ReLU², value embeddings, smear gate, x0 y residual lambdas, backout, logit softcap 15) |
| Parametros totales | 4.026.535.002 |
| Parametros activos | No es MoE; ~2,15B efectivos por token (2,15B de los 4,03B son value embeddings consultados por lookup) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16, Q8_0, Q5_K_M, Q4_K_M (verificadas); F16 GGUF no funciona |
| Idiomas soportados | Alemán (de) e inglés (en); el alemán es el idioma fuerte |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp con arquitectura `orbit`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nanochat: un transformer decoder-only de 32 capas con dimensión oculta 2048 y 16 cabezas de atención, usando RoPE para posiciones, QK-norm para estabilizar la atención, MLP con activación ReLU², value embeddings (una tabla de embeddings de valores de 2,15B parámetros que se consulta por lookup en lugar de computarse), smear gate, lambdas de conexión residual y x0, backout y logit softcap de 15. El export rescala los pesos del MLP por una potencia exacta de dos (up / 8, down x 64) para mantener las activaciones internas dentro del rango de los formatos de 16 bits sin alterar las salidas.

El entrenamiento se hizo íntegramente desde pesos aleatorios: tokenizer BPE propio de 65.536 tokens entrenado en alemán e inglés; pretraining con 92,4B tokens a 835.000 tokens por segundo, usando Muon para las matrices y AdamW para los embeddings, completado en 30,8 horas en un nodo de 8 GPU con un consumo de unos 380 kWh. Los datos provienen de FineWeb-Edu, FineWeb2-HQ alemán, FinePDFs alemán con un subconjunto regulatorio, Wikipedia alemana, FineMath, legislación federal alemana y derecho de la UE en alemán, más textos sintéticos de compliance y reformulaciones alemanas generadas localmente con GLM-5.3; solo se usaron fuentes cuya licencia permite una publicación Apache-2.0. Después hubo dos rondas de supervised fine-tuning para chat y compliance, y la ronda 2.1 añadió unos 4.000 pares de seguridad (peticiones dañinas frente a benignas). Cada cuantización se valida contra bf16 antes de publicarse.

## Capacidades

- Generación de texto conversacional en alemán e inglés, con plantilla de chat propia (`apply_chat_template`).
- Conocimiento especializado en RGPD, NIS-2, EU AI Act, IT-Grundschutz y legislación federal alemana, incluyendo obligaciones de notificación y articulado.
- Respuesta a preguntas de compliance en formato de consulta directa ("Welche Meldepflichten gelten nach Art. 33 DSGVO?").
- Funcionamiento mejorado con recuperación (RAG): la tasa de error en derecho alemán baja del 72 % al 45 % cuando se incluyen las disposiciones reales en el prompt.
- Rechazo de peticiones dañinas: 100 % en alemán (25 prompts) y 30 % en inglés (10 prompts), según la evaluación del autor.
- Rechazo de usos indebidos de compliance (por ejemplo, ocultar una brecha de datos): 9 de 10 casos.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio según la información disponible.
- No dispone de modo de razonamiento (thinking mode) declarado.

## Casos de uso

- Asistente interno de compliance para equipos legales: el modelo responde consultas sobre obligaciones del RGPD o NIS-2 en alemán, integrado en un pipeline RAG que recupera el articulado aplicable antes de generar la respuesta, lo que reduce el error del 72 % al 45 % según el autor.
- Primer filtro de triaje en departamentos de protección de datos: clasificación y explicación de plazos de notificación de brechas (por ejemplo, el plazo de 72 horas del art. 33 RGPD) con el texto legal recuperado en el contexto.
- Formación y onboarding de empleados: generación de explicaciones divulgativas sobre el EU AI Act o IT-Grundschutz en alemán, con la advertencia de que cada afirmación legal debe verificarse contra la fuente.
- Soporte a la documentación de cumplimiento: borradores de secciones de evaluaciones de impacto o registros de tratamiento a partir de las disposiciones recuperadas, siempre con revisión humana.
- Despliegue en local para entornos con requisitos de confidencialidad: al caber en un portátil con la cuantización Q4_K_M (2,4 GB) mediante llama.cpp, permite procesar consultas legales sensibles sin enviar datos a la nube.
- Evaluación comparativa de modelos de dominio legal en alemán: útil como referencia de un modelo pequeño especializado para contrastar con modelos generalistas en tareas de compliance.
- Prototipado rápido de chatbots regulatorios en inglés y alemán: su plantilla de chat y su licencia Apache-2.0 permiten integrarlo en demos y pruebas de concepto sin coste de licencia.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Orbit-Nano-Compliance-E2B | Ministral (Mistral AI) |
|---|---|---|
| Starlex Compliance-Bench DE v2 (4.582 preguntas, 1.200 pasajes, held out) | 68,5 (puesto 1 de 7) | por debajo de 68,5 |
| Starlex Compliance-Bench DE v2, closed book | 59,4 | 48,9 |
| Media de benchmarks públicos en alemán | 43,5 (puesto 2) | 49,2 |
| MMLU | cerca del azar | no disponible |

| Prueba de seguridad y fundamentación | Resultado |
|---|---|
| Rechazo de peticiones dañinas, alemán (25 prompts) | 100 % |
| Rechazo de peticiones dañinas, inglés (10 prompts) | 30 % |
| Rechazo de uso indebido de compliance (p. ej. ocultar una brecha) | 9 de 10 |
| Respuestas erróneas en derecho alemán, sin disposiciones recuperadas | 72 % |
| Respuestas erróneas en derecho alemán, con disposiciones recuperadas | 45 % |

El autor indica que el benchmark fue generado con Mistral Large 3 y verificado con GLM-5.3, y que si el benchmark favorece a alguna familia es a Mistral, pese a lo cual Ministral queda por detrás. La seguridad se evalúa con GLM-5.3 sobre conjuntos de prompts propios, con un ruido del juez de unos 2 a 3 puntos. No se han publicado resultados de benchmarks públicos adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bf16 (4,03B parámetros), unos 4,3 GB en Q8_0, unos 3 GB en Q5_K_M y 2,4 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3070/4060 Ti o superiores); A100 o H100 no son necesarias dado el tamaño, pero permiten mayor throughput en serving.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares; con Q4_K_M funciona incluso en portátiles con 4 GB de VRAM o en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (arquitectura personalizada), llama.cpp con soporte de la arquitectura `orbit` para los GGUF, y el repositorio StarlexAI/Orbit-Nano-Compliance-E2B-GGUF. No se indica soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: el autor reporta 835.000 tokens por segundo durante el pretraining en un nodo de 8 GPU, dato de entrenamiento, no de inferencia. No se han publicado cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en compliance DE | Disponibilidad |
|---|---|---|---|---|---|
| Orbit-Nano-Compliance-E2B | 4,03B totales (~2,15B efectivos) | 2.048 | Apache-2.0 | 68,5 (puesto 1 de 7) | HF, safetensors y GGUF |
| Ministral | no disponible | no disponible | no disponible | por debajo de 68,5; 48,9 closed book | HF |
| Modelos de la familia Orbit (Orbit Phone, Orbit-Vision, Orbit-Image) | no disponible | no disponible | no disponible | no aplica (otras tareas: ASR, visión, imagen) | HF |

La comparación con Ministral es la única disponible en la información proporcionada; el autor no detalla parámetros ni contexto de Ministral. No se dispone de datos de otros modelos de compliance en alemán para una comparativa más amplia.

## Limitaciones y advertencias

- Modelo pequeño con conocimiento general muy limitado: MMLU "cerca del azar"; alucina especialmente en números de artículo exactos, fechas y jurisprudencia. No es asesoramiento legal y toda afirmación debe verificarse.
- Contexto de solo 2.048 tokens, insuficiente para documentos legales largos o conversaciones multi-turno extensas.
- Seguridad en inglés débil: solo rechaza el 30 % de peticiones dañinas en inglés frente al 100 % en alemán. No usar como filtro de seguridad en inglés.
- Tasa de error del 72 % en derecho alemán sin recuperación; debe desplegarse con RAG de las disposiciones reales, lo que la reduce al 45 %, aún alta para producción sin revisión humana.
- Arquitectura personalizada: requiere `trust_remote_code=True` en transformers y una versión de llama.cpp con soporte de la arquitectura `orbit`; la cuantización F16 GGUF no funciona.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud del contenido legal; la responsabilidad del cumplimiento recae en el usuario.
- El benchmark propio fue generado por Mistral Large 3 y evaluado por GLM-5.3, con posible sesgo hacia la familia Mistral (reconocido por el autor) y ruido de juez de 2 a 3 puntos.
- Sesgos conocidos: no se documentan sesgos específicos más allá de la asimetría de idioma y la debilidad en conocimiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarlexAI/Orbit-Nano-Compliance-E2B
- GGUF: https://huggingface.co/StarlexAI/Orbit-Nano-Compliance-E2B-GGUF
- Orbit Phone (ASR): https://huggingface.co/StarlexAI/orbit-phone
- Orbit-Vision: https://huggingface.co/StarlexAI/orbit-vision
- Orbit-Image: https://huggingface.co/StarlexAI/orbit-image
- Imagen de portada: https://cdn-uploads.huggingface.co/production/uploads/6996621a93e0b3b5807ba110/MgMDvC9ITY4Z7a8valDNf.png
