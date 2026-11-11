# Suvir-Misra/Gemma-3-270M-IndicLegalQA-GGUF

## Resumen

Gemma-3-270M-IndicLegalQA-GGUF es un ajuste fino del modelo google/gemma-3-270m-it, publicado por el usuario Suvir-Misra, orientado a responder preguntas sobre derecho indio. Cubre jurisprudencia del Tribunal Supremo de la India, códigos penales (Bharatiya Nyaya Sanhita 2023, BNSS 2023, IPC y CrPC), derecho constitucional y fiscalidad (GST e impuesto sobre la renta). El modelo se distribuye exclusivamente en formato GGUF, con tres cuantizaciones (F16, Q8_0 y Q4_K_M), lo que lo hace apto para despliegue en local con Ollama o llama.cpp.

El ajuste se realizó con MLX LoRA durante 800 iteraciones y una pérdida de validación de 0,792, empleando una estrategia de currículo multitarea, Stochastic Weight Averaging (SWA) sobre los checkpoints 500-800 y una calibración de atención denominada Weight Subspace Orthogonalization (WSO). El autor declara el uso del conjunto IndicLegalQA (10.000 pares pregunta-respuesta del Tribunal Supremo, DOI 10.17632/gf8n8cnmvc) junto con material estatutario complementario.

Su relevancia es acotada pero concreta: demuestra que un modelo de 270M parámetros puede retener citas normativas específicas del ordenamiento indio tras un ajuste fino ligero, con un tamaño de archivo de entre 351 MB y 838 MB. Es un caso de estudio de especialización vertical sobre modelos pequeños más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 causal LM (18 capas, sliding window attention, hidden size 640, vocabulario 262.144) |
| Parametros totales | 435.870.336 (según safetensors del modelo base; el autor indica 270M nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens recomendados en el Modelfile (el modelo base soporta más, pero el autor no documenta el máximo efectivo del ajuste) |
| Tipos de cuantizacion | F16 (838 MB), Q8_0 (448 MB), Q4_K_M (351 MB) |
| Idiomas soportados | en (inglés; el material legal es de la India) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF exclusivamente |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 3 causal de 18 capas con sliding window attention, tamaño oculto de 640 y vocabulario de 262.144 tokens. El ajuste se hizo con MLX LoRA durante 800 iteraciones, con una pérdida de validación declarada de 0,792. El autor aplica dos técnicas de consolidación: Stochastic Weight Averaging promediando los checkpoints 500 a 800, y Weight Subspace Orthogonalization para calibración de atención, con escalares reportados de s_qk = 1,002 y s_vo = 1,000.

Los datos de entrenamiento combinan el conjunto IndicLegalQA (10.000 pares de preguntas y respuestas del Tribunal Supremo de la India) con un currículo estatutario equilibrado que abarca BNS, BNSS, IPC, CrPC, la Constitución india, GST e impuesto sobre la renta. También se incorporan pares de consulta legal multiturno para mantener estabilidad conversacional. No se documenta el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO adicionales sobre el ajuste LoRA.

## Capacidades

- Generación de texto en inglés con foco en derecho indio: derecho penal, constitucional y fiscal.
- Recuperación de citas normativas concretas: secciones de BNS 2023, IPC, artículos constitucionales y nombres de sentencias.
- Razonamiento jurídico básico: distinción entre writs (prohibition frente a certiorari), principios de justicia natural y máximas latinas.
- Explicación de conceptos como la doctrina de la estructura básica (Minerva Mills v. Union of India, 1980) o la inmunidad penal infantil (doli incapax).
- Conversación multiturno orientada a consulta legal, según el autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Consulta rápida de secciones penales: el modelo responde con la sección concreta de BNS 2023 o IPC para un delito dado (por ejemplo, homicidio en la sección 103(1) BNS), útil en herramientas de referencia para estudiantes de derecho.
- Asistente de estudio para oposiciones judiciales: repaso de conceptos constitucionales y de jurisprudencia del Tribunal Supremo con respuestas breves y citas, desplegado en local con Ollama.
- Primer filtro en un chatbot de despacho: clasificación y respuesta inicial a preguntas frecuentes sobre GST y fiscalidad, con derivación a un profesional cuando la consulta exceda el alcance del modelo.
- Generación de borradores de resúmenes normativos: a partir de un artículo o sección, el modelo produce una explicación en inglés para documentación interna, dado su tamaño reducido y su despliegue en CPU.
- Demostración educativa de especialización vertical: ejemplo reproducible de ajuste LoRA sobre un modelo de 270M con MLX, útil en cursos de NLP aplicado al dominio legal.
- Despliegue en dispositivos de bajos recursos: con la cuantización Q4_K_M (351 MB) puede ejecutarse en microinstancias o hardware embebido para tareas de respuesta legal de baja latencia.
- Prototipado de pipelines RAG legal: el modelo actúa como generador final sobre fragmentos recuperados de códigos y sentencias, aprovechando su conocimiento de nomenclatura estatutaria para citar correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente incluye una tabla de salidas cualitativas de ejemplo sobre consultas legales concretas (Minerva Mills, edad de inmunidad penal, sección de homicidio en BNS, servicio comunitario, Vishakha Guidelines, máximas latinas y writs), sin métricas cuantitativas ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para Q4_K_M, 0,5 GB para Q8_0 y 0,9 GB para F16, sin contar el contexto ni el overhead del runtime.
- Cabe en cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) y en la mayoría de iGPU con memoria unificada suficiente.
- Ejecutable en CPU sin GPU: el tamaño de los archivos permite inferencia en portátiles convencionales.
- Opciones de despliegue: Ollama (recomendado por el autor, con Modelfile incluido), llama.cpp y cualquier runtime compatible con GGUF. No se documenta soporte nativo en vLLM o TGI para este formato.
- Parámetros de inferencia recomendados por el autor: num_ctx 2048, temperature 0.1, top_p 0.95, repeat_penalty 1.0 y stops `<end_of_turn>` y `<eos>`. El autor advierte de mantener repeat_penalty en 1.0 para no penalizar la repetición de números de sección y citas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Gemma-3-270M-IndicLegalQA | 435,9M (nominal 270M) | 2.048 recomendados | GGUF | Apache-2.0 | Derecho indio |
| google/gemma-3-270m-it | 270M nominales | no disponible en esta ficha | safetensors, GGUF | Gemma Terms | Propósito general |
| Modelos legales especializados de mayor tamaño (p. ej. familia LegalBERT o LLMs legales de 7B+) | 7B o superior | variable | variable | variable | Derecho general o por jurisdicción |

La comparación cuantitativa con alternativas legales no está disponible: no se han publicado métricas de este ajuste frente a otros modelos legales, y las alternativas de la misma categoría (modelos legales pequeños en GGUF para derecho indio) no se documentan en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido (270M nominales): la capacidad de razonamiento jurídico complejo y de mantener coherencia en contextos largos es limitada en comparación con modelos de 7B o superiores.
- Riesgo alto de alucinación en citas normativas: puede generar números de sección, años o nombres de sentencias plausibles pero incorrectos; requiere verificación humana en cualquier uso profesional.
- Ventana de contexto efectiva recomendada de solo 2.048 tokens, insuficiente para analizar documentos legales completos.
- Entrenado y evaluado únicamente en inglés; no se documenta soporte de hindi ni de otras lenguas índicas pese al nombre "Indic" del conjunto de datos.
- El número de parámetros declarado en la model card (270M) no coincide con el recuento real de safetensors del modelo base (435,9M); conviene tratar las cifras del autor con cautela.
- No hay benchmarks publicados, por lo que no es posible validar cuantitativamente la calidad del ajuste ni compararlo con alternativas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Aunque la licencia es Apache-2.0, el modelo base Gemma 3 está sujeto a los Gemma Terms of Use, que pueden imponer restricciones adicionales al uso comercial; conviene revisarlos antes de desplegar.
- No apto como asesoramiento legal: cualquier salida debe considerarse material de referencia y no sustituye la consulta a un profesional del derecho.

## Enlaces

- Hugging Face: https://huggingface.co/Suvir-Misra/Gemma-3-270M-IndicLegalQA-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Conjunto IndicLegalQA (DOI): https://doi.org/10.17632/gf8n8cnmvc
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp
