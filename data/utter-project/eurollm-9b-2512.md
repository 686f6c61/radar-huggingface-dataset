# utter-project/EuroLLM-9B-2512

## Resumen

EuroLLM-9B-2512 es un modelo de lenguaje de 9.152.319.488 parámetros (aproximadamente 9,15 mil millones) desarrollado por el consorcio utter-project, formado por el Instituto Superior Técnico de la Universidad de Lisboa, el Instituto de Telecomunicaciones, la Universidad de Edimburgo, Aveni, Unbabel, la Universidad Paris-Saclay, Artefact Research Center, la Universidad de Ámsterdam, Naver Labs y Sorbona Université, con financiación de la Unión Europea. Se trata de la versión revisada de utter-project/EuroLLM-9B publicada en diciembre de 2025, que incorpora la fase de extensión de contexto largo desarrollada originalmente para EuroLLM-22B.

El modelo responde a la necesidad de una familia de LLM abiertos con cobertura real de las lenguas europeas, incluidas las de menor representación como el gaélico irlandés, el maltés, el esloveno, el estonio o el gallego, además de un conjunto de lenguas no europeas de gran uso (árabe, chino, hindi, japonés, coreano, ruso y turco). Frente a los modelos anglocéntricos dominantes, EuroLLM se entrena con un reparto de datos explícitamente equilibrado entre lenguas y publica sus pesos bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La arquitectura es un transformer decoder-only de tipo Llama con 9B parámetros, pesos en safetensors y compatibilidad con la librería transformers y con text-generation-inference. El repositorio ocupa 36,6 GB, lo que corresponde a los pesos en precisión completa. Es un modelo base, no alineado con preferencias humanas, por lo que está pensado como punto de partida para ajuste fino supervisado, DPO o instrucción, más que para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 9.152.319.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | extendida respecto a EuroLLM-9B mediante la fase de contexto largo de EuroLLM-22B; valor exacto no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en BF16/FP16 es convertible a GGUF, AWQ, GPTQ, etc. con herramientas estándar |
| Idiomas soportados | 35: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, ga, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ar, ca, zh, gl, hi, ja, ko, no, ru, tr, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 36,6 GB |
| Pipeline | text-generation |
| Descargas en Hugging Face | 1.866 |

## Arquitectura y entrenamiento

EuroLLM-9B-2512 es un transformer decoder-only de 9B parámetros con la estructura típica de la familia Llama (atención causal, normalización RMSNorm y capas feed-forward con activación SwiGLU). La novedad de esta revisión respecto a EuroLLM-9B es la incorporación de la fase de extensión de contexto largo que el consorcio aplicó primero en EuroLLM-22B-2512, de modo que el modelo hereda una ventana de contexto ampliada.

El modelo se ha entrenado sobre un corpus multilingüe que cubre las 35 lenguas declaradas, con énfasis explícito en las lenguas oficiales de la UE y en las lenguas cooficiales o regionales con poca presencia en los corpus web habituales (irlandés, maltés, gallego, catalán, esloveno, letón, estonio). La model card no detalla el número exacto de tokens de entrenamiento ni la composición porcentual del dataset. Tampoco se documenta en la información disponible el uso de RLHF o DPO: la propia model card indica que el modelo no ha sido alineado con preferencias humanas, por lo que se distribuye como modelo base. El informe técnico asociado (arXiv 2602.05879, "EuroLLM-22B: Technical Report") describe la familia completa y la fase de extensión de contexto de la que deriva esta versión.

## Capacidades

- Generación de texto multilingüe en 35 idiomas, con cobertura destacada de lenguas europeas de bajos recursos.
- Modelo base sin alineación: completa texto y responde a continuación de secuencias, pero no está instruido para seguir órdenes de forma fiable.
- Capacidad de razonamiento y conocimiento general derivada del preentrenamiento a gran escala, sin modo "thinking" explícito.
- Procesamiento de contexto largo gracias a la fase de extensión heredada de EuroLLM-22B (longitud exacta no disponible).
- Punto de partida para ajuste fino supervisado, DPO o RLHF; existe una variante Instruct publicada por el mismo equipo (EuroLLM-9B-Instruct-2512).
- Soporte de tool calling y function calling: no documentado en la model card; depende de la alineación posterior del modelo.
- Capacidades de agente y razonamiento multi-paso: no documentadas para la versión base.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Ajuste fino para lenguas europeas de bajos recursos: el modelo sirve como base para SFT o LoRA en irlandés, maltés, esloveno, estonio o gallego, donde los modelos anglocéntricos tienen un rendimiento pobre por falta de datos de preentrenamiento.
- Traducción automática europea: con 35 idiomas cubiertos y un reparto de datos equilibrado, es adecuado para fine-tuning en pares de traducción que incluyan lenguas de la UE poco representadas, incluyendo traducción desde y hacia catalán, gallego y euskera en la parte que el modelo cubre.
- Investigación académica en multilingüismo: al publicarse bajo Apache 2.0 y con informe técnico, permite reproducir experimentos de escalado, mezcla de datos y transferencia entre lenguas sin restricciones de licencia.
- Generación aumentada por recuperación (RAG) en dominios administrativos o legales europeos: la ventana de contexto extendida permite inyectar documentos largos (reglamentos, expedientes) en varios idiomas y generar resúmenes o respuestas ancladas al contexto.
- Clasificación y etiquetado de texto multilingüe: mediante fine-tuning con cabeza de clasificación o generación de etiquetas, útil para moderación de contenido, análisis de opinión o enrutado de tickets en centros de atención al cliente paneuropeos.
- Base para asistentes conversacionales en producción: partiendo de esta versión base, un equipo puede aplicar DPO o SFT con sus propios datos y desplegar el resultado con vLLM o TGI, evitando las restricciones de licencia de modelos con condiciones de uso comerciales.
- Evaluación comparativa de LLM abiertos: sirve como referencia europea en benchmarks multilingües (Flores, MMLU multilingüe, traducción) frente a modelos como Llama o Mistral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de EuroLLM-9B-2512 no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de traducción, y el informe técnico citado corresponde a la familia EuroLLM-22B, no a esta variante de 9B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,3 GB solo para pesos, más overhead de KV cache; en la práctica, 24 GB es el mínimo cómodo.
- Cuantización a 8 bits: alrededor de 9-10 GB de pesos, cabe en GPUs de 12-16 GB.
- Cuantización a 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4-bit): alrededor de 5-6 GB, apta para RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070.
- GPU recomendadas para producción: A100 40/80 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB para una sola instancia en BF16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (soportado según los tags), vLLM, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-9B-2512 | 9,15B | extendido (valor no disponible) | 35 | Apache 2.0 | Hugging Face |
| EuroLLM-9B (versión anterior) | ~9B | contexto original, menor que 2512 | 35 | Apache 2.0 | Hugging Face |
| EuroLLM-22B-2512 | 22B (no confirmado en la información) | extendido | 35 | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8B | 128K | predominantemente inglés y unas pocas lenguas | Llama Community License | Hugging Face |

La comparación con Llama 3.1 8B es la más directa por tamaño, pero la diferencia clave está en la cobertura lingüística: EuroLLM cubre 35 idiomas con reparto de datos equilibrado, mientras que Llama prioriza el inglés. Frente a Mistral 7B o Gemma 2 9B, la ventaja de EuroLLM es la licencia Apache 2.0 sin restricciones de uso comercial y la cobertura de lenguas europeas de bajos recursos. Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo base no alineado: la model card advierte explícitamente de que no se ha aplicado alineación con preferencias humanas, por lo que puede generar contenido dañino, afirmaciones falsas o alucinaciones.
- No apto para uso conversacional directo sin ajuste fino previo; para instrucciones se debe usar la variante Instruct o aplicar SFT/DPO.
- Sesgos conocidos: no documentados en la información disponible, pero al entrenarse con corpus web es esperable sesgo de género, cultural y geográfico, especialmente en lenguas con menos datos.
- Riesgo de alucinación elevado en tareas factuales, mayor en lenguas de bajos recursos por menor volumen de datos de preentrenamiento.
- La longitud exacta de contexto no se especifica en la model card; conviene verificarla empíricamente antes de diseñar pipelines que dependan de ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el modelo no incluye garantías y el usuario asume la responsabilidad sobre las salidas.
- El repositorio ocupa 36,6 GB, lo que exige planificación de almacenamiento y ancho de banda en despliegues.
- No dispone de capacidades multimodales (visión, audio) ni de tool calling nativo documentado.

## Enlaces

- Hugging Face: https://huggingface.co/utter-project/EuroLLM-9B-2512
- Variante Instruct: https://huggingface.co/utter-project/EuroLLM-9B-Instruct-2512
- Versión anterior: https://huggingface.co/utter-project/EuroLLM-9B
- Modelo de 22B con la fase de contexto largo: https://huggingface.co/utter-project/EuroLLM-22B-2512
- Informe técnico (arXiv): https://arxiv.org/abs/2602.05879
