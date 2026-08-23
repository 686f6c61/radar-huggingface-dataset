# tjusto2409/sabia-7b

## Resumen

Sabiá-7B es un modelo de lenguaje autoregresivo desarrollado por la empresa brasileña Maritaca AI, especializado en portugués. Está basado en la arquitectura de LLaMA-1-7B y se entrenó partiendo de los pesos de ese modelo, continuando el entrenamiento con 7 mil millones de tokens del subconjunto portugués de ClueWeb22 y 10 mil millones de tokens adicionales (aproximadamente 1,4 épocas del conjunto de datos). El resultado es un modelo de 6,74 mil millones de parámetros con una ventana de contexto de 2048 tokens.

El modelo no ha sido afinado para seguir instrucciones, por lo que se recomienda su uso en tareas few-shot en lugar de zero-shot. Está diseñado exclusivamente para generación de texto en portugués y su licencia, heredada de LLaMA-1, restringe su uso a fines de investigación. A pesar de que la entrada original fue publicada por Maritaca AI bajo el nombre `maritaca-ai/sabia-7b`, el repositorio `tjusto2409/sabia-7b` es una copia espejo con los mismos pesos y configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-1-7B (autoregresiva, transformer decoder) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No documentado en el repo oficial; existen cuantizaciones GGUF de terceros (p. ej. repo `mav23/sabia-7b-GGUF`) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Restringida a investigación (misma que LLaMA-1) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Sabiá-7B utiliza la arquitectura de LLaMA-1-7B: un transformer decoder autoregresivo con normalización RMSNorm, activación SiLU y atención con máscara causal. El tokenizador también es el mismo que el de LLaMA-1-7B, basado en Byte Pair Encoding (BPE) con un vocabulario de 32.000 tokens.

El entrenamiento se realizó en dos fases: primero se partió de los pesos de LLaMA-1-7B y se continuó el entrenamiento con 7 mil millones de tokens del subconjunto portugués de ClueWeb22 (corte de datos a mediados de 2022). Después se entrenaron 10 mil millones de tokens adicionales, completando aproximadamente 1,4 épocas sobre el conjunto de datos. No se aplicó ningún algoritmo de alineación posterior como RLHF o DPO, por lo que el modelo se comporta como un LM base de solo lenguaje.

## Capacidades

- Generación de texto autoregresiva en portugués brasileño.
- Modelado de lenguaje en few-shot: dado un prompt con ejemplos, puede completar tareas como clasificación, entiñamiento textual, respuesta a preguntas, etc.
- No soporta instrucciones directas (no está entrenado para seguir prompts de tipo "haz X").
- No dispone de capacidades de tool calling, función calling, agentes o razonamiento multi-paso.
- No es multimodal: acepta solo texto y genera solo texto.
- Capacidad multilingüe limitada: aunque puede producir algo en otros idiomas por su base LLaMA-1, su entrenamiento adicional fue exclusivamente en portugués y su rendimiento en otros idiomas no está garantizado.

## Casos de uso

- Clasificación de texto en portugués: por ejemplo, análisis de sentimiento en reseñas o comentarios, usando pocos ejemplos en el prompt.
- Entiabilidad textual (NLI): evaluar si una hipótesis se sigue de una premisa, como se hace en los benchmarks Assin2 y FaQuAD NLI.
- Respuesta a preguntas de comprensión lectora: dado un pasaje y una pregunta, generar la respuesta, aunque el rendimiento será mejor con ejemplos previos.
- Análisis de discurso de odio: clasificar mensajes como ofensivos o no, útil para moderación de contenidos en redes sociales brasileñas.
- Exámenes y educación: responder preguntas de exámenes estandarizados brasileños como ENEM y OAB, aunque con precisión moderada.
- Investigación académica: estudiar el comportamiento de modelos de lenguaje entrenados específicamente en portugués, como base para experimentos de fine-tuning o evaluación de técnicas de few-shot.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor en la model card y provienen del Open Portuguese LLM Leaderboard. Son valores de exactitud (accuracy) o F1-macro según la tarea, con pocos ejemplos (few-shot).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| ENEM Challenge (sin imágenes) | eduagarcia/enem_challenge | accuracy (3-shot) | 55,07 |
| BLUEX (sin imágenes) | eduagarcia-temp/BLUEX_without_images | accuracy (3-shot) | 47,71 |
| Exámenes OAB | eduagarcia/oab_exams | accuracy (3-shot) | 41,41 |
| Assin2 RTE | assin2 | F1-macro (15-shot) | 46,68 |
| Assin2 STS | eduagarcia/portuguese_benchmark | Pearson (15-shot) | 1,89 |
| FaQuAD NLI | ruanchaves/faquad-nli | F1-macro (15-shot) | 58,34 |
| HateBR Binario | ruanchaves/hatebr | F1-macro (25-shot) | 61,93 |
| PT Hate Speech Binario | hate_speech_portuguese | F1-macro (25-shot) | 64,13 |
| tweetSentBR | eduagarcia-temp/tweetsentbr | F1-macro (25-shot) | 46,64 |

Nota: el valor de Pearson de 1,89 en Assin2 STS parece anómalo y probablemente refleja un error de evaluación o una escala no estándar; se reproduce tal como se declara en la model card.

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: ~13,5 GB (6,7 mil millones de parámetros × 2 bytes por parámetro).
- Con cuantizaciones GGUF de 4 bits, el peso se reduce a ~4 GB, lo que permite inferencia en GPUs de consumo con 8 GB de VRAM (p. ej. RTX 3070, RTX 4060 Ti) o incluso en CPU con suficiente RAM.
- GPUs recomendadas para fp16: A100 (40 GB), RTX 4090 (24 GB), RTX 3090 (24 GB), o cualquier GPU con al menos 16 GB de VRAM.
- Para despliegue: puede usarse con Transformers (carga automática con `device_map="auto"`), y con llama.cpp/Ollama si se usan los pesos GGUF de terceros.
- Latencia estimada: no disponible. En una GPU de 24 GB, se espera una velocidad de generación de 20-40 tokens/s en fp16, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de resultados comparativos con otros modelos en la información proporcionada. Como referencia, Sabiá-7B parte de LLaMA-1-7B y se entrena exclusivamente en portugués, por lo que no es directamente comparable en rendimiento con otros modelos de 7B que no han sido adaptados al portugués. No se puede indicar una comparativa con alternativas como BERT-pt o Albertus sin datos de benchmarks comunes.

## Limitaciones y advertencias

- Licencia restringida a fines de investigación, no comercial (misma que LLaMA-1).
- No entrenado para seguir instrucciones; su uso en zero-shot puede dar resultados pobres.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo portugués brasileño; el rendimiento en otros idiomas es no fiable.
- No tiene capacidades de tool calling, agentes o razonamiento estructurado.
- Riesgo de alucinación en tareas de generación abierta, como cualquier modelo de lenguaje.
- Los datos de entrenamiento tienen un corte a mediados de 2022, por lo que no conoce información posterior.
- El valor de Pearson en Assin2 STS (1.89) es sospechosamente bajo y podría indicar un error en la evaluación, no un rendimiento real.

## Enlaces

- Repositorio HuggingFace original: https://huggingface.co/maritaca-ai/sabia-7b
- Repositorio HuggingFace espejo (tjusto2409): https://huggingface.co/tjusto2409/sabia-7b
- Paper: [Sabiá: Portuguese Large Language Models](https://arxiv.org/pdf/2304.07880.pdf)
- Repositorio GGUF de terceros: https://huggingface.co/maviz/sabia-7b-GGUF
- Open Portuguese LLM Leaderboard: https://huggingface.co/spaces/eduagarcia/open_pt_llm_leaderboard
