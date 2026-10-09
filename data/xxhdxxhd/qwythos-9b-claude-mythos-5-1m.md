# xXHDXxhd/Qwythos-9B-Claude-Mythos-5-1M

## Resumen

Qwythos-9B es un ajuste fino de parámetros completos (full fine-tune) sobre el modelo base Qwen3.5-9B, desarrollado por Empero y publicado por el usuario xXHDXxhd en HuggingFace. El modelo se presenta como un "reasoning model" de 9B entrenado sobre más de 500 millones de tokens de trazas de Claude Mythos y Claude Fable, con cadenas de razonamiento generadas internamente por la herramienta rethink de Empero AI. Su propuesta central es ofrecer un modelo compacto, descensurado y con una ventana de contexto de 1.048.576 tokens (1M) activada por defecto mediante escalado YaRN.

El modelo destaca por dos capacidades técnicas concretas: una ventana de contexto de 1M tokens (4× sobre los 262.144 tokens nativos de la arquitectura base) y soporte nativo de function calling conforme a la especificación de Qwen3.5. Según la model card, supera a su base en varios benchmarks bajo el mismo harness de evaluación, con incrementos de +34,3 puntos en MMLU, +30 puntos en gsm8k estricto y +19 puntos en gsm8k flexible, aunque retrocede ligeramente en gpqa_diamond (−5 puntos).

Es relevante ahora porque combina tres ejes poco frecuentes en la franja de 9B: contexto muy largo listo para usar, tool use nativo sin envoltorios adicionales y una política explícitamente descensurada orientada a dominios técnicos sensibles (ciberseguridad, farmacología, biomedicina). Está licenciado bajo Apache 2.0, pero solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3.5 (arquitectura del backbone no detallada en la informacion proporcionada) |
| Parametros totales | 9B (segun denominacion del modelo y base Qwen3.5-9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) con YaRN activado por defecto; 262.144 tokens nativos |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos distribuidos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de todos los parámetros sobre el base Qwen3.5-9B, no un ajuste LoRA ni una adaptación parcial. El entrenamiento se realizó sobre más de 500 millones de tokens de trazas de razonamiento de "Claude Mythos" y "Claude Fable", con cadenas de pensamiento generadas internamente por la herramienta rethink de Empero AI. No se detalla en la información proporcionada la composición exacta del dataset, el número total de tokens de entrenamiento más allá de esa cifra, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento posteriores al SFT.

La innovación técnica declarada es la extensión de contexto mediante YaRN rope-scaling configurado por defecto, que lleva la ventana de 262.144 tokens nativos hasta 1.048.576 tokens sin necesidad de configuración manual. Además, el modelo conserva el soporte nativo de function calling de la especificación Qwen3.5, lo que permite emitir bloques `<tool_call>` válidos directamente desde la plantilla de chat, sin wrappers ni fine-tunes específicos de herramientas.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento, orientado a tareas de razonamiento multi-paso.
- Razonamiento matemático, con mejoras medidas de +30 puntos en gsm8k estricto y +19 puntos en gsm8k flexible respecto al base.
- Function calling nativo conforme a la especificación Qwen3.5: acepta `tools=[...]` en la plantilla de chat y emite bloques `<tool_call>` válidos con parámetros requeridos.
- Auto-corrección mediante herramientas: en un harness de 7 prompts con ejecutor de Python y búsqueda web, el modelo completó con éxito 7 de 7 casos, incluyendo selección sensible de herramienta (matemáticas → Python; hechos → búsqueda web).
- Ventana de contexto de 1M tokens, apta para razonamiento sobre bases de código completas, investigación multi-documento y trayectorias agénticas largas.
- Capacidades de dominio en ciberseguridad (por ejemplo, identificación de modo Hashcat para Kerberos TGS-REP como `-m 13100`, CVE-2021-34527 para PrintNightmare), farmacología clínica y bioquímica.
- Modelo explícitamente descensurado, diseñado para responder a preguntas técnicas sensibles sin rechazos ni advertencias genéricas.
- Capacidades multilingües: solo inglés según la información proporcionada.
- Capacidades de visión: no documentadas en la model card, pese a que la etiqueta `image-text-to-text` aparece en los tags de HuggingFace (véase limitaciones).

## Casos de uso

- Razonamiento sobre bases de código completas: con 1M tokens de contexto, el modelo puede ingerir un repositorio entero y responder preguntas de arquitectura, dependencias o impacto de cambios sin fragmentar el código en trozos.
- Agentes con herramientas en producción: su function calling nativo permite construir agentes que deciden entre ejecutar código (por ejemplo, un intérprete de Python) y lanzar búsquedas web, integrables en pipelines sin envoltorios adicionales.
- Asistencia en ciberseguridad y red teaming: la model card demuestra respuestas correctas a consultas de cracking (modos Hashcat) y vulnerabilidades concretas (CVE de PrintNightmare), útil para formación y auditoría técnica interna.
- Investigación biomédica y farmacológica: respuestas con citas a fuentes sobre interacciones farmacológicas e indicaciones clínicas, aptas como apoyo a la revisión de literatura bajo supervisión experta.
- RAG multi-documento: la ventana de 1M tokens permite concatenar manuales, papers y normativa extensa y hacer preguntas transversales sin recuperación por chunks.
- Automatización de tareas de cálculo y verificación: dado un ejecutor de Python, el modelo resuelve y verifica cálculos numéricos de precisión (por ejemplo, `sin(π/7) × cos(π/11)` a 10 decimales) en una sola llamada.
- Asistentes conversacionales técnicos: el pipeline declarado es text-generation con soporte conversacional, adecuado para chatbots de soporte en dominios de ingeniería y ciencias.

## Benchmarks y rendimiento

Resultados declarados por el autor con `lm-evaluation-harness`, backend HF, `--apply_chat_template`, muestreo Qwen3.5 (`temperature=0.6`, `top_p=0.95`, `top_k=20`) y `--limit 100`:

| Tarea | Metrica | Base Qwen3.5-9B | Qwythos-9B | Delta |
|---|---|---:|---:|---:|
| gsm8k | exact_match (flexible) | 0,670 | 0,860 | +0,190 |
| gsm8k | exact_match (strict) | 0,510 | 0,810 | +0,300 |
| mmlu | acc | 0,232 | 0,575 | +0,343 |
| arc_challenge | acc | 0,470 | 0,490 | +0,020 |
| arc_challenge | acc_norm | 0,400 | 0,410 | +0,010 |
| gpqa_diamond (CoT, 0-shot) | exact_match (flexible) | 0,630 | 0,580 | −0,050 |

El autor reporta además picos por asignatura en MMLU: 0,78 en government/politics, 0,77 en college biology y 0,74 en conceptual physics. Los resultados de tool use indican 7 de 7 prompts resueltos correctamente. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (9B parámetros): aproximadamente 18 GB en FP16/BF16, unos 9-10 GB en INT8 y unos 5-6 GB en INT4. Estas cifras son estimaciones a partir del tamaño del modelo; no se facilitan datos oficiales.
- Atención al KV cache: una ventana de 1M tokens genera un KV cache muy grande; en la práctica requerirá GPUs con mucha memoria o técnicas de atención eficiente, aunque la información proporcionada no detalla el consumo exacto.
- GPU recomendadas: A100 80GB o H100 para explotar la ventana de 1M tokens en FP16; RTX 4090 (24 GB) puede alojar el modelo en FP16 en el límite, y con cuantización en INT8/INT4 cabe con holgura para contextos cortos.
- Compatibilidad con GPU de consumo: sí en cuantización INT4/INT8 en GPUs con 8-16 GB, aunque limitado a contextos reducidos por el KV cache.
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad con safetensors y el ecosistema Qwen cabe esperar vLLM, llama.cpp, Ollama y TGI; la información proporcionada no confirma oficialmente cada backend.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Qwythos-9B | 9B (denso) | 1.048.576 tokens (YaRN) | apache-2.0 | en | HuggingFace (xXHDXxhd) |
| Qwen3.5-9B (base) | 9B (denso) | 262.144 tokens nativos | no disponible en la informacion proporcionada | no disponible | HuggingFace (Qwen) |

No se dispone de datos de rendimiento de terceros comparables en la información proporcionada para situar a Qwythos-9B frente a otros modelos de 9B (por ejemplo, variantes de la familia Llama, Gemma o Mistral del mismo rango). La comparación directa con su base Qwen3.5-9B es la única documentada.

## Limitaciones y advertencias

- Política descensurada: el modelo está diseñado para no rechazar consultas sensibles de ciberseguridad, farmacología o biomedicina; esto implica riesgo de que genere contenido dañino o inapropiado sin las salvaguardas habituales en producción.
- Riesgo de alucinación: los resultados de tool use demuestran que, en modo closed-book, el modelo falla en hechos especializados; la corrección depende de que se le proporcionen herramientas de búsqueda o verificación.
- Retroceso en gpqa_diamond: el modelo baja 5 puntos respecto al base en esta tarea, lo que indica que la mejora no es uniforme y puede degradar ciertas capacidades de razonamiento científico.
- Cobertura de idiomas limitada al inglés; no hay soporte declarado de castellano ni de otras lenguas.
- Discrepancia en los tags: la etiqueta `image-text-to-text` sugiere entrada de imágenes, pero la model card no documenta ninguna capacidad de visión y el pipeline declarado es text-generation; conviene verificar antes de asumir multimodalidad.
- Ventana de 1M tokens dependiente de YaRN: el rendimiento en contextos extremos no está validado con benchmarks de long-context en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B tiene su propia licencia (no detallada aquí) que conviene revisar antes de desplegar en producción.
- Modelo recién publicado (0 descargas, 0 likes): sin validación independiente de la comunidad ni resultados reproducidos por terceros.
- Los números de benchmark se obtuvieron con `--limit 100`, lo que reduce la fiabilidad estadística de las cifras absolutas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xXHDXxhd/Qwythos-9B-Claude-Mythos-5-1M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Desarrollador (Empero): https://empero.org
- Harness de evaluación: https://github.com/EleutherAI/lm-evaluation-harness
