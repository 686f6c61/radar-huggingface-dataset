# vennyvirtuoso/clinjev-modernbert-8k

## Resumen

clinjev-modernbert-8k es un modelo de clasificación de texto derivado de answerdotai/ModernBERT-base, afinado por el usuario vennyvirtuoso para lo que el autor denomina "System One Decision Model": la selección de una opción entre varias (decisiones tipadas de tipo choice, boolean y rating) a partir de un contexto y una pregunta. No es un modelo generativo, sino un encoder bidireccional de 149,6 millones de parámetros que devuelve logits sobre opciones discretas, pensado para actuar como componente de decisión de baja latencia o como guardrail en pipelines RAG.

El modelo conserva la ventana de contexto nativa de ModernBERT de 8.192 tokens con atención bidireccional FlashAttention-2, lo que permite evaluar contextos largos en una sola pasada sin decodificación autoregresiva. El autor lo presenta como alternativa autoalojada a modelos generativos para tareas de enrutamiento, clasificación operativa y verificación de respuestas, con latencia declarada de milisegundos y licencia Apache 2.0.

Su relevancia práctica es limitada por el momento: el repositorio no tiene descargas ni interacciones, la model card mezcla resultados de dominios clínicos y de atención al cliente, y las métricas publicadas son modestas (58,63 % de exactitud macro en el conjunto de test retenido). Debe tratarse como un experimento reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT), con FlashAttention-2 |
| Parametros totales | 149.608.709 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un encoder de 149M es viable FP16/BF16 e INT8 con herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer bidireccional con atención FlashAttention-2 y contexto nativo de 8.192 tokens. Sobre esa base se añade una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) que produce logits por opción; el prompt se construye concatenando contexto, pregunta y opciones etiquetadas como (A), (B), (C)..., y se enmascaran los índices de logits que exceden el número de opciones válidas. El autor aplica además un escalado de temperatura calibrado con T=1,15 en el ejemplo de inferencia.

El ajuste fino se realizó sobre un conjunto que la model card describe como "MedQA-USMLE (Step 1/2/3) + PubMedQA Biomedical Decision Suite", con decisiones tipadas en tres formatos (choice, boolean "noul" y rating discreto). El autor declara evaluación sobre particiones de test disjuntas por grupo para evitar fuga de datos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF, DPO o ajuste por preferencias; tampoco se detalla la receta de hiperparámetros.

## Capacidades

- Clasificación de decisiones de opción múltiple: devuelve una distribución de probabilidad sobre un conjunto finito de opciones etiquetadas.
- Decisiones booleanas ("noul") y de valoración discreta (rating), según la descripción del autor.
- Procesamiento de contextos largos de hasta 8.192 tokens en una sola pasada bidireccional.
- Calibración de probabilidades: el autor reporta un Expected Calibration Error (ECE) de 0,0261, lo que permite usar las salidas como confianza operativa.
- Uso como guardrail en pipelines RAG: el tag `rag-guardrail` sugiere verificación de respuestas o enrutamiento de consultas.
- Inferencia por lotes de alto rendimiento: 924,9 decisiones/segundo en GPU según la model card.
- Integración con `transformers`, `sentence-transformers` y `peft`.
- No genera texto libre, no soporta tool calling ni razonamiento multi-paso, y no se documentan capacidades multimodales ni multilingües.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo elige entre equipos (facturación, soporte técnico, ventas, seguridad). Es adecuado por su latencia baja y su calibración, que permite derivar a revisión humana cuando la confianza es baja.
- Guardrail de respuestas en RAG: clasificar si una respuesta generada por otro modelo es fiable, está fuera de dominio o debe bloquearse, usando el contexto recuperado como entrada.
- Triaje de preguntas clínicas: seleccionar la opción diagnóstica más probable en preguntas tipo USMLE o PubMedQA; los resultados publicados (25,10 % y 50,80 % de exactitud respectivamente) limitan su uso a entornos de investigación.
- Clasificación de intenciones en asistentes conversacionales: mapear cada turno del usuario a una de un conjunto cerrado de intenciones con probabilidades calibradas.
- Moderación y etiquetado de contenido: decisiones booleanas sobre si un texto cumple una política, aprovechando el formato de decisión tipada.
- Evaluación por lotes de datasets anotados: procesar grandes volúmenes de pares contexto-pregunta a 924,9 decisiones/s en GPU para preetiquetar o auditar anotaciones.
- Despliegue en edge: con 149M de parámetros y 16,77 ms por decisión en el escenario "edge" declarado por el autor, puede ejecutarse en CPU o GPU de gama baja para decisiones locales sin enviar datos a la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre el split de test retenido:

| Metrica | Valor |
|---|---|
| Exactitud macro (fine-tuned) | 58,63 % |
| Exactitud macro (baseline zero-shot) | 7,30 % |
| Ganancia absoluta | +51,33 % |
| Macro-F1 (fine-tuned) | 0,4869 |
| Macro-F1 (baseline) | 0,0299 |
| Expected Calibration Error (ECE) | 0,0261 |
| Test USMLE Clinical, fine-tuned | 25,10 % |
| Test USMLE Clinical, baseline | 21,90 % |
| Test PubMed Biomedical, fine-tuned | 50,80 % |
| Test PubMed Biomedical, baseline | 0,00 % |
| Test Noul Abstain, fine-tuned | 100,00 % |
| Test Noul Abstain, baseline | 0,00 % |
| Throughput por lotes (GPU) | 924,9 decisiones/s |
| Latencia por decisión (edge) | 16,77 ms |

No se han publicado comparaciones con otros modelos de decisión en la información disponible. El resultado de 100 % en "Noul Abstain" sugiere una tarea muy acotada y no debe interpretarse como capacidad general de abstención.

## Requisitos de hardware

- VRAM estimada: en BF16/FP16, alrededor de 0,3 GB de pesos más activaciones; con lotes grandes y 8.192 tokens de contexto, el consumo puede ascender a varios GB. En INT8, los pesos ocupan aproximadamente 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para lotes moderados; A100/H100 solo tienen sentido para throughput masivo por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia de una sola decisión.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `sentence-transformers`, TGI o servidores propios con `peft` y `accelerate`; no se documenta soporte GGUF ni Ollama.
- Latencia y throughput: 16,77 ms por decisión en el escenario edge declarado y 924,9 decisiones/s en GPU por lotes, según el autor; no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clinjev-modernbert-8k | 149,6M | 8.192 | Clasificación de decisiones tipadas | Apache 2.0 | Hugging Face, 0 descargas |
| answerdotai/ModernBERT-base | 149M | 8.192 | Encoder general (MLM, clasificación) | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos de clasificación tipo DeBERTa-v3-base | ~184M | 512 | Clasificación de texto | MIT | Hugging Face |
| LLM generativos pequeños (p. ej. familias de 1-3B) como decisores | 1.000-3.000M | 4.000-32.000 | Generación y elección de opciones | variables | Hugging Face |

La comparación con LLM generativos es cualitativa: el autor reclama latencia muy inferior y cero tokens generados, a costa de no poder razonar ni justificar la decisión. No hay datos de benchmarks comparativos directos en la información disponible.

## Limitaciones y advertencias

- Exactitud macro de 58,63 % en el test retenido: insuficiente para decisiones automatizadas sin supervisión en dominios abiertos.
- Exactitud de 25,10 % en USMLE Clinical, apenas 3,2 puntos por encima del baseline: el ajuste clínico es marginal.
- El resultado de 100 % en "Noul Abstain" y el 0 % del baseline en PubMed Biomedical indican tareas muy específicas y posible sobreajuste al formato; no generalizan.
- Riesgo de sobreajuste al formato de prompt "SemIf" (contexto, pregunta, opciones etiquetadas): cambios en la plantilla pueden degradar las salidas.
- No es un modelo generativo: no puede explicar sus decisiones ni producir texto; solo devuelve logits.
- Idiomas soportados no documentados; el entrenamiento parece centrado en inglés (MedQA-USMLE, PubMedQA).
- Sesgos clínicos y de dominio: el corpus de entrenamiento es médico y de atención al cliente, lo que puede sesgar las decisiones en otros dominios.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación independiente.
- Repositorio sin descargas ni validación de la comunidad; la model card contiene afirmaciones de rendimiento no verificadas por terceros.
- La fecha de creación del repositorio (2026-11-21) y la mezcla de ejemplos clínicos y de facturación en la model card aconsejan tratar los datos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/clinjev-modernbert-8k
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
