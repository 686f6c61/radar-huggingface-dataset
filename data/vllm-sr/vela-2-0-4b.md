# vllm-sr/Vela-2.0-4B

## Resumen
Vela 2.0 4B es un modelo de decisión, no generativo, publicado por la organización vllm-sr (proyecto vLLM Semantic Router) y desarrollado junto con KR Labs bajo el lema "Open Foundation Routing Models". Su función es resolver en una única interfaz tres tareas que normalmente requieren modelos separados: enrutamiento semántico, comprobaciones de seguridad y extracción de fragmentos de texto (spans) con offsets de caracteres y probabilidades.

El modelo parte del ajuste de vllm-sr/Decision-2.0-Nox-4B y emplea una columna vertebral Qwen3.5 híbrida de 32 capas que combina Gated DeltaNet (atención lineal) con GQA con puertas. Tiene 4.211.182.081 parámetros y un límite de entrada declarado de 16.384 tokens. No genera texto: sus salidas son decisiones estructuradas de tipo opción, sí/no, puntuación, span y conjunto.

Es relevante ahora porque cubre el hueco de los "modelos de decisión" para infraestructuras de enrutamiento y guardarraíles: permite definir opciones, etiquetas y rúbricas en tiempo de petición (zero-shot) y devolver decisiones con la localización exacta del texto que las justifica, con licencia Apache-2.0 y soporte de 17 idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 de 32 capas: Gated DeltaNet y gated GQA |
| Parámetros totales | 4.211.182.081 (4,2 B) |
| Parámetros activos | no aplica (no es un modelo MoE; la arquitectura es híbrida, no de mezcla de expertos) |
| Longitud de contexto | 16.384 tokens (límite de entrada declarado) |
| Tipos de cuantización | no disponible; la evaluación se realiza con parámetros FP32 y autocast bf16 en la columna vertebral (cabezas en FP32) |
| Idiomas soportados | 17: ar, cs, de, en, es, fr, hi, it, ja, ko, nl, pl, pt, ru, sv, th, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 19,4 GB) |
| Modelo base | vllm-sr/Decision-2.0-Nox-4B (relación: finetune) |
| Pipeline declarado | zero-shot-classification |
| Tipos de salida | choice, yes/no, score, span y set; sin generación de texto |
| Código | requiere `trust_remote_code=True` (tag `custom_code`, motor `vela2_engine`) |
| Memoria de parámetros en GPU | aproximadamente 17 GB en FP32 (dato declarado por el autor) |
| Publicación | creado el 2 de octubre de 2026; actualizado el 7 de octubre de 2026 |
| Descargas y likes en HuggingFace | 166 descargas y 11 likes en el momento de la consulta |

## Arquitectura y entrenamiento
La columna vertebral es un decodificador de 32 capas tipo Qwen3.5 con dos mecanismos de atención combinados: Gated DeltaNet, una capa de atención lineal con memoria recurrente y compuertas, y gated GQA (Grouped Query Attention con puertas). Esta combinación híbrida es la que el autor asocia al tag de contexto largo, aunque el límite real de entrada documentado es de 16.384 tokens. Sobre la columna vertebral se montan cabezas de decisión en FP32 que emiten cuatro tipos de respuesta: elección entre opciones, sí/no, puntuación, span (con etiqueta, offsets de inicio y fin, texto y probabilidad) y conjunto (selección múltiple de etiquetas). El motor de decisiones se expone mediante código propio (`vela2_engine`) y un método `system_one` que acepta varias preguntas con nombre en una sola petición.

Los datos de fine-tuning declarados cubren cinco bloques: seguridad de contenido (nvidia/Aegis-AI-Content-Safety-Dataset-2.0, ToxicityPrompts/PolyGuardMix, nvidia/Nemotron-Safety-Guard-Dataset-v3, OpenSafetyLab/Salad-Data), inyección de prompt (microsoft/llmail-inject-challenge), detección de alucinación en prosa y código (KRLabsOrg/lettucedetect-prose-hallucination y lettucedetect-code-hallucination), reconocimiento de entidades y estructura (numind/NuNER, urchade/pile-mistral-v0.1, knowledgator/GLINER-multi-task-synthetic-data, nlpaueb/finer-139, tonytan48/Re-DocRED, MultiCoNER/multiconer_v2, martinjosifoski/SynthIE) y datos de contexto y spans (rajpurkar/squad_v2, hotpotqa/hotpot_qa, google-research-datasets/natural_questions, KRLabsOrg/verbatim-spans, KRLabsOrg/tool-output-extraction-swebench). El número de tokens de entrenamiento, la composición exacta del dataset y el uso de RLHF, DPO u otras técnicas de alineación no están disponibles en la información proporcionada. La innovación destacable es la resolución de decisiones a nivel de span con offset de caracteres y la posibilidad de definir etiquetas y rúbricas abiertas en tiempo de inferencia, además del uso de kernels de Gated DeltaNet vía `flash-linear-attention` en GPU.

## Capacidades
- Clasificación por elección (`choice`) entre opciones definidas en la petición, con probabilidad por clase y confianza agregada.
- Preguntas de tipo sí/no y puntuación numérica sobre una petición, una fuente y una respuesta.
- Extracción de spans con etiqueta, offsets de carácter, texto literal y probabilidad, para etiquetas entrenadas y para etiquetas abiertas definidas en tiempo de ejecución.
- Selección múltiple de etiquetas (`set`) para clasificación multietiqueta.
- Detección de información personal identificable (PII) sobre un esquema de 17 tipos entrenados, accesible como `pii_schema`.
- Detección de afirmaciones no soportadas por el contexto (alucinación) en prosa y en código.
- Puntuación de seguridad de contenido y detección de ataques de inyección de prompt.
- Reconocimiento de entidades nombradas y extracción de relaciones e información estructurada.
- Extracción de spans relevantes en salidas de herramientas (dataset tool-output-extraction-swebench), útil en agentes que parsean resultados de terminal o de CI.
- Multilingüe en 17 idiomas: árabe, checo, chino, coreano, danés (no incluido), neerlandés, inglés, finlandés (no incluido), francés, alemán, hindi, italiano, japonés, polaco, portugués, ruso, sueco y tailandés; en concreto: ar, cs, de, en, es, fr, hi, it, ja, ko, nl, pl, pt, ru, sv, th, zh.
- Procesamiento de varias preguntas con nombre en una sola llamada, con distintos tipos y distintos campos de origen (`request`, `source`, `answer`).
- No soporta generación de texto libre ni, por tanto, function calling generativo; su papel en pipelines de agentes es el de clasificador, enrutador y verificador.

## Casos de uso
- Enrutamiento semántico en pasarelas de LLM: el modelo recibe la petición completa (hasta 16.384 tokens) y devuelve la categoría de destino con probabilidades por clase, de modo que el gateway puede seleccionar el modelo o la política adecuada con un umbral explícito en lugar de una heurística por palabras clave.
- Moderación previa y posterior a la generación: los bloques de datos de Aegis 2.0, PolyGuardMix, Nemotron Safety Guard v3 y Salad-Data permiten puntuar contenido y decidir si se bloquea, se marca o se registra, en 17 idiomas.
- Detección y redacción de PII: con las 17 etiquetas del esquema entrenado y spans con offsets de carácter, se puede enmascarar directamente el texto original sin recurrir a expresiones regulares ni a un modelo generativo.
- Guardarraíl contra alucinaciones en RAG: comparando `source` y `answer`, el modelo devuelve el fragmento concreto de la respuesta no soportado por el contexto (por ejemplo, "to 6 grams" en el ejemplo registrado por el autor), lo que permite corregir o bloquear la respuesta antes de mostrarla.
- Detección de inyección de prompt en aplicaciones con entrada de usuario, usando el ajuste sobre microsoft/llmail-inject-challenge como clasificador binario o de seguridad.
- Extracción de entidades y relaciones para pipelines documentales: NuNER, finer-139, Re-DocRED, MultiCoNER v2 y SynthIE permiten construir salidas estructuradas (entidades, relaciones) sobre texto no etiquetado.
- Parseo de salidas de herramientas en agentes: extraer spans concretos de logs de terminal, resultados de tests o salidas de CI a partir del ajuste sobre tool-output-extraction-swebench, sin necesidad de un LLM generador adicional.
- Triaje multilingüe en atención al cliente: clasificar la solicitud por dominio (por ejemplo, salud, matemáticas, otros) y detectar datos personales en el mismo paso, con el modelo devolviendo confianza (0,975 en el ejemplo de dominio registrado por el autor).
- Verificación de respuestas de otros modelos en pipelines de evaluación: usar el modelo como juez de fidelidad y de seguridad en lugar de un LLM grande, con coste de inferencia de una sola pasada.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Métrica | Resultado |
|---|---|---|---|
| Seguridad (routing y safety) | 14 conjuntos públicos | AUC macro | 0,921 |

No se han publicado en la información disponible resultados de benchmarks tipo MMLU, HumanEval, GSM8K u otros: el modelo no genera texto, por lo que esas métricas no le son aplicables. Tampoco hay datos comparativos con otros modelos de decisión o de enrutamiento. El único dato adicional de rendimiento disponible es un ejemplo de respuesta registrada por el autor para el caso de dominio sanitario (`health` con confianza 0,975), que no constituye un benchmark.

## Requisitos de hardware
- Memoria de parámetros declarada: aproximadamente 17 GB en FP32, sin contar activaciones, caché de estados recurrentes ni memoria del runtime.
- Estimación orientativa en bf16: unos 8,4 GB solo de pesos (cálculo directo de 4.211.182.081 parámetros a 2 bytes); es una estimación aritmética, no un dato declarado por el autor.
- Con 17 GB de parámetros en FP32, una GPU de 24 GB (RTX 4090, RTX 3090, L4, A10G, A5000) puede alojar los pesos, pero queda poco margen para activaciones y estados; en la práctica conviene bf16 o GPUs de 40-80 GB (A100, H100) para FP32 con holgura.
- En tarjetas de consumo: cabe en bf16 en GPUs de 16 GB o superiores con margen limitado; en FP32 es viable en GPUs de 24 GB con poco espacio libre.
- El autor declara que la evaluación se hizo en GPU con autocast bf16 en la columna vertebral y cabezas en FP32. La model card menciona FP32 en CPU o GPU, pero el extracto disponible está truncado, por lo que no se detalla el rendimiento en CPU.
- Kernels: se recomienda instalar `flash-linear-attention` para el kernel de Gated DeltaNet en GPU; es opcional pero "mucho más rápido" según el autor.
- Despliegue: la vía documentada es `transformers` (>= 5.17) con `trust_remote_code=True`, `safetensors`, `tokenizers` y `numpy`. El modelo pertenece al ecosistema vLLM Semantic Router (repositorio github.com/vllm-project/semantic-router), pero no se documenta en la información disponible compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores.
- Cuantizaciones para despliegue ligero (GGUF, AWQ, GPTQ): no disponibles en la información proporcionada, lo que descarta por ahora su uso en Ollama o llama.cpp.
- Latencia y throughput: no disponibles. Al no ser un modelo autorregresivo, el coste de inferencia corresponde a una única pasada hacia delante, sin decodificación token a token, pero no hay cifras publicadas.

## Comparativa con modelos similares
No hay datos comparativos publicados en la información disponible. Los únicos elementos de referencia son internos a la propia familia: el modelo base vllm-sr/Decision-2.0-Nox-4B del que deriva y la colección Vela 2.0 (https://huggingface.co/collections/vllm-sr/vela-20), que incluye otras variantes de la serie. Para esas variantes no se dispone de parámetros, contexto ni resultados de benchmarks en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-2.0-4B | 4,21 B | 16.384 tokens | AUC macro de seguridad 0,921 en 14 conjuntos | Apache-2.0 | HuggingFace |
| Modelos comparables de enrutamiento o seguridad | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No es un modelo generativo: no produce texto libre, por lo que no sirve como asistente, chatbot ni motor de redacción. Cualquier expectativa de generación de respuestas es incorrecta.
- Requiere `trust_remote_code=True` y carga código propio del repositorio (`vela2_engine`, decodificador `vela2-decoder`); esto implica ejecutar código de terceros y debe revisarse antes de usarlo en producción.
- La evaluación publicada se limita a un AUC macro de seguridad sobre 14 conjuntos públicos. No hay métricas de precisión por tarea, por idioma, ni de calibración de las probabilidades de span.
- La cobertura de idiomas es de 17 lenguas declaradas, pero no se aporta ninguna evaluación desagregada por idioma; el rendimiento en idiomas distintos del inglés es una incógnita.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección de PII, alucinación y contenido inseguro, con implicaciones directas si se usa como guardarraíl único.
- Sesgos potenciales heredados de los conjuntos de seguridad y toxicidad empleados (Aegis 2.0, PolyGuardMix, Salad-Data, Nemotron Safety Guard v3): las taxonomías de seguridad de esos conjuntos condicionan qué se considera inseguro y pueden sobrerrepresentar ciertos temas, dialectos o registros.
- El límite de 16.384 tokens acota el contexto útil: documentos o conversaciones más largos requieren troceado, con la consiguiente pérdida de contexto para las decisiones de enrutamiento y de fidelidad.
- No se ofrecen versiones cuantizadas, y los aproximadamente 17 GB de pesos en FP32 elevan el coste de despliegue frente a alternativas más ligeras.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia y se incluya el fichero NOTICE cuando proceda; incluye concesión de patentes y cláusula de represalia por litigio.
- No hay datos publicados de latencia, throughput ni comportamiento bajo carga, lo que impide dimensionar un despliegue en producción sin pruebas propias.
- La fecha de publicación y actualización del repositorio (octubre de 2026) y el bajo número de descargas (166) indican una adopción todavía temprana y poca validación externa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Vela-2.0-4B
- Colección Vela 2.0: https://huggingface.co/collections/vllm-sr/vela-20
- Documentación del proyecto: https://vllm-sr.ai/
- Blog de presentación: https://vllm-sr.ai/blog/vela-2-0-open-foundation-routing-models
- Repositorio GitHub (vLLM Semantic Router): https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Nox-4B
- Documentación de vLLM (motor de inferencia del ecosistema): https://docs.vllm.ai/en/latest/
