# tensor-tailor/zils-lite-body-6

## Resumen

zils-lite-body-6 es un modelo de decisión (decision model) publicado en Hugging Face por el usuario tensor-tailor, concebido como un "body" (cuerpo) candidato para el pool de soups del ecosistema Zils, asociado a la subnet 127 de Bittensor. No es un modelo de lenguaje generalista al uso: su función es emitir distribuciones de probabilidad sobre opciones de respuesta en formato de examen, y se entrena mediante destilación de probabilidades (forward KL) en lugar de cross-entropy sobre etiquetas duras.

El modelo parte del chasis d3-lite (derivado de Qwen/Qwen3.5-0.8B, con tensores de lenguaje y visión en bf16) y se obtiene mediante un ajuste fino LoRA sobre el promedio uniforme de dos bodies previos del pool (1lock/zils-lite-astrid-g1 y bmars8218/zils-lite-body-2). El LoRA se aplica solo a las capas de lenguaje 16-23 (las 8 superiores de 24), con rank 16 y alpha 32, y se fusiona en los pesos finales en bf16.

El resultado es un checkpoint de unos 853 millones de parámetros (852.985.920 según los safetensors) y 1,7 GB en el repositorio, con licencia Apache-2.0. Su relevancia es acotada pero específica: documenta con detalle un procedimiento reproducible de mezcla de modelos (soup) más destilación de distribuciones, útil para quienes trabajan con ensembles, merging o evaluación orientada a decisiones en lugar de generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (chasis d3-lite sobre Qwen3.5-0.8B; incluye tensores de lenguaje y visión) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (las filas de entrenamiento superiores a 1.024 tokens se descartaron) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, requiere cargar con confianza remota) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del chasis d3-lite, que reutiliza los tensores de lenguaje y visión de Qwen3.5-0.8B en un transformer decoder-only de 24 capas. El entrenamiento parte del promedio uniforme en fp32 de 1lock/zils-lite-astrid-g1 y bmars8218/zils-lite-body-2, construido con la herramienta soup.build del propio ecosistema Zils a temperatura 1.0 sobre el chasis vllm-sr/d3-lite. Sobre ese punto de partida se aplica un LoRA de rank 16, alpha 32 y dropout 0.05, restringido a las capas de lenguaje 16-23, con learning rate 5e-5, warm-up lineal de 50 pasos seguido de decaimiento coseno, batch 16, semilla 4343 y una época completa (7.854 pasos). El LoRA se fusiona en los pesos y se almacena en bf16; el resto de tensores queda idéntico al punto de partida.

La innovación metodológica está en la función de pérdida y en la construcción de datos. No se usa cross-entropy sobre etiquetas: cada fila lleva una distribución objetivo sobre sus opciones, y la pérdida es KL forward hacia esas probabilidades, más una KL con peso 2 hacia las probabilidades precalculadas del checkpoint inicial en las filas de regularización. Los datos (112.555 filas antes del límite de longitud; 110.394 usadas y 2.161 descartadas en entrenamiento, más 15.262 usadas y 156 descartadas en regularización) combinan 30.113 preguntas destiladas de vllm-sr/d3-ultra vía el dataset zils-ai/zils-relay-answers, 29.167 filas de mezclas propias anteriores y 53.275 filas de splits públicos de entrenamiento (QNLI, PIQA, MultiNLI, Amazon Polarity, CoQA, SQuAD v2.0, BoolQ, Cosmos QA, SciNLI, QASC, FEVER, MathQA, Fig-QA, ROPES, MegaVeridicality, DROP, COPA, PUBHEALTH). Cada grupo de filas se asigna al profesor con menor Brier score frente a las etiquetas verdaderas en una muestra de hasta 200 filas; los profesores son el propio soup inicial, dasLOL/zils-lite-skills-v5, 1lock/zils-lite-astrid-g1, bmars8218/zils-lite-body-2 y los bodies 5 y 4 del propio autor. La desviación relativa de las capas de lenguaje respecto a Qwen3.5-0.8B es de 0,026, por debajo del tope de 0,15 fijado por Zils.

## Capacidades

- Clasificación y decisión sobre opciones múltiples: el modelo emite probabilidades sobre opciones en formato de examen, que es su salida principal.
- Razonamiento sobre preguntas de comprensión lectora, inferencia textual (NLI), sentido común y QA extractivo, derivado de los datasets de entrenamiento (SQuAD, BoolQ, MultiNLI, Cosmos QA, DROP, entre otros).
- Aritmética y razonamiento matemático básico, por las filas de MathQA y QASC incluidas en el entrenamiento.
- Verificación de hechos a nivel de afirmación, por las filas de FEVER.
- Capacidad de visión heredada del chasis Qwen3.5-0.8B (tensores de visión presentes), aunque no se documenta su uso ni su calidad tras el ajuste.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el modelo está orientado a decisiones puntuales.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de candidates para el pool Zils: el modelo sirve como body candidato en la subnet 127 de Bittensor, donde su rendimiento se mide por Brier score frente a etiquetas verdaderas; es su propósito declarado y el escenario para el que se entrenó.
- Clasificación de pares de frases en producción: para tareas de inferencia textual (entailment, contradicción, neutralidad) sobre texto en inglés, el modelo puede puntuar opciones directamente en lugar de generar texto libre.
- Respuesta a preguntas extractivas sobre documentos: con filas de SQuAD v2.0 y CoQA en el entrenamiento, puede usarse para seleccionar la opción correcta en preguntas de comprensión sobre pasajes, incluida la detección de preguntas sin respuesta.
- Verificación de afirmaciones en pipelines de moderación o fact-checking: las filas de FEVER y PUBHEALTH permiten integrarlo como clasificador de veracidad o de relevancia sanitaria en etapas de filtrado.
- Selección de respuestas en sistemas de examen automatizado: dado su formato nativo de distribución sobre opciones, encaja en la corrección automática de tests de opción múltiple y en la comparación de modelos mediante probabilidades calibradas.
- Investigación en merging y destilación de distribuciones: el repositorio documenta paso a paso el soup, el LoRA por capas y la pérdida KL, por lo que es un caso de estudio reproducible para quienes experimentan con model soups y soft targets.
- Base para ajustes posteriores dentro del ecosistema: al ser un fine-tune permitido del soup vigente, puede servir de punto de partida para nuevos bodies que respeten el tope de desviación de 0,15 respecto a Qwen3.5-0.8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas del proceso: la desviación relativa de las capas de lenguaje respecto a Qwen3.5-0.8B (0,026 frente al tope de 0,15, con 0,020 en el checkpoint inicial) y el criterio de selección de profesores por Brier score, sin cifras finales de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 852.985.920 parámetros ocupan aproximadamente 1,7 GB de pesos, por lo que se necesita alrededor de 2-3 GB de VRAM contando overhead de activaciones y contexto; no se documentan otras precisiones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; una RTX 4090, A100 o H100 es sobredimensionada para este tamaño y solo tendría sentido para lotes grandes o despliegue concurrente.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo RTX 3060, RTX 4060, RTX 4070), siempre que el runtime soporte bf16.
- Opciones de despliegue: el repositorio usa custom_code y requiere cargar con confianza remota; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no publicarse GGUF no hay ruta directa a llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion con zils-lite-body-6 |
|---|---|---|---|---|
| tensor-tailor/zils-lite-body-6 | 852.985.920 | no disponible | Apache-2.0 | Modelo descrito |
| 1lock/zils-lite-astrid-g1 | no disponible | no disponible | Apache-2.0 | Body previo del pool; componente del promedio inicial y profesor |
| bmars8218/zils-lite-body-2 | no disponible | no disponible | Apache-2.0 | Body previo del pool; componente del promedio inicial y profesor |
| vllm-sr/d3-ultra | no disponible | no disponible | Apache-2.0 | Profesor de destilación para 30.113 preguntas |
| Qwen/Qwen3.5-0.8B | no disponible (modelo base del chasis) | no disponible | no disponible | Base arquitectónica del chasis d3-lite |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para emitir distribuciones sobre opciones, no para generación de texto libre; usarlo como modelo conversacional produciría resultados no previstos por su entrenamiento.
- Sesgos: los datos provienen de splits públicos en inglés (MultiNLI, BoolQ, COPA, entre otros) y de destilación de profesores del propio pool, por lo que hereda los sesgos de esas fuentes y de esos profesores; no se documenta ninguna mitigación.
- Riesgo de alucinación: no evaluado ni documentado; al no usar cross-entropy sobre etiquetas y depender de probabilidades de profesores, la calibración puede desviarse en dominios fuera de la distribución de entrenamiento.
- Limitaciones de idioma: no se declara lista de idiomas; todo el corpus de entrenamiento documentado es en inglés, por lo que el soporte multilingüe no está garantizado.
- Limitaciones de contexto: las filas de más de 1.024 tokens se descartaron durante el entrenamiento y no se documenta la longitud de contexto efectiva.
- Restricciones de licencia: los pesos son Apache-2.0, pero el entrenamiento usa datasets con licencias share-alike y copyleft (CC BY-SA 4.0, CC BY-SA 3.0, OANC, entre otras), lo que puede imponer obligaciones adicionales si se redistribuyen derivados; la model card menciona este punto de forma incompleta ("Share-alike and copylef...").
- Requiere custom_code y confianza remota al cargar; la reproducibilidad depende de ese código no incluido en la información disponible.
- El checkpoint se publicó con 0 descargas y 0 likes, sin pipeline declarado; no hay evidencia externa de validación más allá de la propia model card.
- La fecha de creación (2026-11-06) y la referencia al soup de esa misma fecha indican que es un artefacto ligado a una ronda concreta del pool; su vigencia fuera de ese contexto no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-6
- Perfil del autor: https://huggingface.co/tensor-tailor
- Modelo base 1: https://huggingface.co/1lock/zils-lite-astrid-g1
- Modelo base 2: https://huggingface.co/bmars8218/zils-lite-body-2
- Chasis: https://huggingface.co/vllm-sr/d3-lite
- Modelo base arquitectónico: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor de destilación: https://huggingface.co/vllm-sr/d3-ultra
- Dataset de destilación: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Profesor adicional: https://huggingface.co/dasLOL/zils-lite-skills-v5
- Profesor adicional: https://huggingface.co/Charlie320/zils-lite-k3b
- Body previo del autor: https://huggingface.co/tensor-tailor/zils-lite-body-5
- Body previo del autor: https://huggingface.co/tensor-tailor/zils-lite-body-4
