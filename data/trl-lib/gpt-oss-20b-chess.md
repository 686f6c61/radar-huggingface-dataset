# trl-lib/gpt-oss-20b-chess

## Resumen

gpt-oss-20b-chess es un ajuste fino supervisado (SFT) del modelo abierto gpt-oss-20b de OpenAI, realizado por el equipo de TRL (Hugging Face) sobre 500.000 puzles de Lichess del dataset `trl-lib/chess-puzzles`. El objetivo es especializar un modelo de lenguaje generalista en la resolución de puzles de ajedrez: dado un tablero en notación FEN junto con la lista de movimientos legales, el modelo devuelve directamente el movimiento ganador en notación UCI, sin cadena de razonamiento intermedia. El resultado es una mejora sustancial en esta tarea concreta: del 14,8% de puzles resueltos (modelo base con esfuerzo de razonamiento bajo) al 69,9%, con un rating de puzle estimado que pasa de 764 a 1813 sobre el conjunto de test de 1.000 puzles.

El modelo conserva la arquitectura y el tamaño del original: 20.914.757.184 parámetros totales (aproximadamente 20,9 mil millones), pesos en formato safetensors y una cuantización MXFP4 de 8 bits que mantiene el repositorio en unos 13,8 GB, de modo que se sirve igual que el modelo base. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo reproducible de especialización con TRL sobre un modelo abierto de gran tamaño; por otro, ofrece un caso de uso muy acotado y medible (ajedrez) donde el ajuste fino supera claramente al modelo generalista sin necesidad de razonamiento explícito, lo que reduce latencia y coste de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (gpt_oss), modelo base openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (8 bits), pesos cuantizados en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/gpt-oss-20b`, un transformer de aproximadamente 20,9 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) con la librería TRL, utilizando el ejemplo `sft_gpt_oss_chess` del repositorio de TRL. El dataset de entrenamiento son 500.000 puzles de Lichess del conjunto `trl-lib/chess-puzzles`. Tras el entrenamiento, los pesos se volvieron a cuantizar a MXFP4 para que el modelo se sirva con el mismo perfil de memoria que el original (unos 14 GB).

El formato de la tarea es estrictamente supervisado y directo: la entrada incluye el tablero, su FEN y la lista de movimientos legales, y la salida esperada es el movimiento ganador en notación UCI, sin razonamiento explícito. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens de entrenamiento, uso de RLHF/DPO ni innovaciones arquitectónicas adicionales más allá de la cuantización MXFP4 heredada del modelo base.

## Capacidades

- Resolución de puzles de ajedrez: dado un FEN y la lista de movimientos legales, devuelve el movimiento ganador en notación UCI.
- Generación de texto conversacional, heredada del modelo base gpt-oss-20b.
- Respuesta directa sin cadena de razonamiento (modo no-thinking) para la tarea de ajedrez.
- Soporte de tool calling y function calling: no confirmado específicamente para este ajuste en la información disponible; el modelo base lo soporta, pero el ajuste fino puede haber alterado este comportamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.

## Casos de uso

- Entrenamiento y evaluación de motores de ajedrez ligeros: el modelo puede actuar como motor de sugerencia de jugadas en posiciones de puzle, con una tasa de acierto del 69,9% en el primer movimiento sobre el conjunto de test, lo que lo hace adecuado para herramientas de práctica táctica.
- Aplicaciones educativas de ajedrez: integrado en una plataforma de ejercicios, el modelo puede validar o sugerir la jugada ganadora de un puzle a partir del FEN y los movimientos legales, sin necesidad de un motor clásico como Stockfish.
- Generación de datasets sintéticos de ajedrez: al responder en UCI de forma directa, puede usarse para etiquetar o ampliar conjuntos de posiciones con soluciones candidatas, siempre con validación posterior.
- Investigación en especialización de LLM: sirve como referencia reproducible del flujo SFT con TRL sobre un modelo abierto de ~21 B, útil para estudiar cómo el ajuste fino cambia el comportamiento en dominios acotados.
- Evaluación comparativa de razonamiento: permite contrastar el rendimiento del modelo base con razonamiento bajo frente a un ajuste especializado sin razonamiento, como muestra la propia model card (14,8% frente a 69,9%).
- Despliegue en servicios de inferencia estándar: al mantener el formato y tamaño del modelo base, puede servirse con `vllm serve trl-lib/gpt-oss-20b-chess` en infraestructura ya preparada para gpt-oss-20b, sin cambios de perfil de memoria.

## Benchmarks y rendimiento

| Modelo | Puzles de test resueltos | Rating de puzle |
|---|---|---|
| gpt-oss-20b, esfuerzo de razonamiento bajo | 14,8% | 764 |
| gpt-oss-20b-chess | 69,9% | 1813 |

Ambos modelos se evalúan sobre los 1.000 puzles de test del dataset. Un puzle se considera resuelto si el primer movimiento es correcto, por lo que el rating de puzle es superior al que obtendría el modelo en Lichess, donde se exige la solución completa. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB con la cuantización MXFP4 incluida en el repositorio, según indica la model card.
- GPU recomendadas: no especificadas en la información disponible; por el perfil de memoria, se requiere una GPU con al menos 16 GB de VRAM para el modelo cuantizado, y GPUs de datacenter (A100, H100) para despliegues de mayor throughput.
- ¿Cabe en GPU de consumo? Con ~14 GB de pesos en MXFP4, encaja en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4080/4090 de 16-24 GB), aunque no se confirma oficialmente en la información disponible.
- Opciones de despliegue: vLLM (`vllm serve trl-lib/gpt-oss-20b-chess`), y por compatibilidad con el modelo base, otras herramientas que soporten el formato gpt_oss; no se detallan opciones adicionales en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en puzles | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b-chess | ~20,9 B | no disponible | 69,9% resueltos, rating 1813 | Apache 2.0 | Hugging Face |
| gpt-oss-20b (base, razonamiento bajo) | ~20,9 B | no disponible | 14,8% resueltos, rating 764 | Apache 2.0 | Hugging Face |
| Motores de ajedrez clásicos (Stockfish, etc.) | no aplica | no aplica | no disponible en esta comparación | GPL u otras | Amplia |

La comparación directa más relevante es con el modelo base, del que se diferencia únicamente por el ajuste fino en ajedrez. No se dispone de datos de otros ajustes finos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en puzles de ajedrez en el formato exacto del dataset; fuera de ese formato (FEN y lista de movimientos legales) su comportamiento puede degradarse.
- La evaluación mide solo el primer movimiento del puzle; no se garantiza la resolución completa de la secuencia, y el rating de 1813 no es directamente comparable con el rating de Lichess.
- No se documentan sesgos conocidos ni tasas de alucinación específicas para este ajuste.
- Idiomas soportados no disponibles; el ajuste fino puede haber reducido capacidades generales del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de puzles de Lichess.
- El ajuste fino puede haber alterado capacidades del modelo base como tool calling o razonamiento multi-paso; no hay confirmación en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trl-lib/gpt-oss-20b-chess
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Dataset de puzles: https://huggingface.co/datasets/trl-lib/chess-puzzles
- Repositorio TRL: https://github.com/huggingface/trl
- Ejemplo de entrenamiento: https://github.com/huggingface/trl/tree/main/examples/sft_gpt_oss_chess
