# ya9919/YN-4b

## Resumen

YN-4b es un adaptador LoRA con una cabeza de decisión escalar entrenada sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el autor ya9919 en el marco del proyecto S²-MAS, un entorno de simulación multiagente a escala social para estudiar decisiones financieras de hogares. El modelo no es un generador de texto generalista: es un componente especializado que, dado un estado de hogar y una pregunta de opción múltiple sobre productos financieros, produce una decisión discreta entre las opciones candidatas. Resuelve el problema de modelar políticas de decisión financiera a partir de datos de encuestas reales.

El checkpoint seleccionado, denominado FinQ, entrena conjuntamente los adaptadores LoRA y una cabeza de decisión compartida sobre 200.000 filas distintas de un conjunto de entrenamiento de QA financiero. Su relevancia radica en que forma parte de un benchmark comparativo de doce sistemas agrupados en seis rutas de modelado de decisión, y en que su contraparte head-only permite aislar el efecto de la adaptación de representaciones frente al simple ajuste de la cabeza.

La información pública disponible es limitada: no se detallan la arquitectura interna del backbone, la longitud de contexto efectiva ni los datos de preentrenamiento de Qwen3.5-4B-Base. La licencia es propietaria y restringida a investigación controlada, lo que limita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre backbone transformer Qwen3.5-4B-Base con cabeza de decisión escalar compartida |
| Parámetros totales | No disponible (el adaptador LoRA y la cabeza se distribuyen por separado del backbone de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | s2-mas-controlled-research-v1.2 (other, restringida a investigación controlada) |
| Formato de pesos | safetensors (adapter/adapter_model.safetensors) y PyTorch (head.pt) |

## Arquitectura y entrenamiento

El modelo sigue la ruta de «modelo de lenguaje más cabeza de decisión aprendida». Sobre el backbone Qwen3.5-4B-Base se aplican adaptadores LoRA que se entrenan de forma conjunta con una cabeza de decisión escalar compartida, encargada de puntuar cada opción candidata de una pregunta de opción múltiple. La inferencia se realiza en BF16 para el backbone y FP32 para el scoring de candidatos. El backbone debe obtenerse por separado, ya que el repositorio solo contiene el adaptador y la cabeza.

El entrenamiento utiliza 200.000 filas distintas de la partición de entrenamiento de QA de decisión, con 200.000 exposiciones acumuladas al checkpoint seleccionado. La selección del checkpoint se hace con un conjunto de desarrollo fijo de 20.000 ejemplos, mientras que la comparación entre los dos métodos de adaptación de Qwen4B (LoRA frente a head-only) se realiza sobre la partición completa de desarrollo de 412.873 ejemplos. Los datos de decisión provienen de encuestas reales. No se especifican el número de tokens de preentrenamiento del backbone, la composición del dataset más allá de las filas de QA, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisiones financieras de opción múltiple a partir de un estado de hogar y una pregunta con menú de candidatos.
- Puntuación de candidatos mediante cabeza escalar compartida, con salida de decisión discreta.
- Adaptación de representaciones del backbone mediante LoRA, además del ajuste de la cabeza.
- Manejo de 119 versiones de pregunta distintas en el conjunto de prueba común.
- Procesamiento de estados de hogar y preguntas en inglés.
- No se documentan capacidades de generación libre de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Modelado de políticas de decisión en simulación multiagente: el modelo puede actuar como política de decisión para agentes sintéticos de hogar dentro del motor de transición de estados de S²-MAS, puntuando opciones de consumo, reservas de efectivo y pagos.
- Investigación sobre tenencia de productos financieros: dado un estado de hogar, clasificar si el hogar usa tarjetas de crédito, mantiene cuentas de depósito a la vista, tiene cuenta de valores o posee depósitos a plazo no vencidos, tal como ilustran los ejemplos de QA del repositorio.
- Comparación de métodos de adaptación: servir como checkpoint de referencia en experimentos que contrastan LoRA más cabeza frente a cabeza sola con backbone congelado, usando el mismo backbone, ejemplos y conjunto de prueba.
- Evaluación de representaciones financieras: medir cuánto aporta la adaptación de representaciones (LoRA) frente al simple ajuste de la cabeza en tareas de decisión con opciones discretas.
- Generación de datos sintéticos condicionados: integrar el modelo en pipelines que requieran decisiones de hogar consistentes con un estado dado para alimentar simulaciones de consumo a escala.
- Análisis de sensibilidad de encuestas: reproducir respuestas de encuestas financieras sobre subpoblaciones sintéticas para estudiar cómo varían las decisiones ante cambios en el estado del hogar.

## Benchmarks y rendimiento

Conjunto de prueba común: 240.458 registros de QA, 119 versiones de pregunta y 8.275 grupos de encuestado/hogar. La exactitud pondera cada registro por igual y las decisiones inválidas cuentan como incorrectas; el F1 macro por pregunta promedia sobre cada clase candidata definida y pondera las 119 versiones por igual.

| Checkpoint / referencia | Exactitud (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| FinQ · Qwen3.5-4B-Base + LoRA + cabeza · 200k QA | 74,1435 | 36,7343 | 0 |
| Qwen4B solo cabeza, mismos 200k QA únicos | 67,2841 | 30,8995 | 0 |

La referencia head-only emplea el mismo backbone preentrenado, los mismos ejemplos únicos y el mismo conjunto de prueba, con el backbone congelado. No se han publicado en la información disponible resultados frente a modelos externos al proyecto (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; requiere cargar el backbone Qwen3.5-4B-Base en BF16 (aproximadamente 8 GB solo para pesos) más el adaptador LoRA y la cabeza.
- GPU recomendadas: no disponibles en la información proporcionada.
- Encaje en GPU de consumo: no confirmado; un backbone de 4B en BF16 podría caber en GPUs de consumo con 12-16 GB de VRAM, pero no se documenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el paquete es un adaptador PEFT más una cabeza PyTorch, por lo que requiere un script de inferencia propio que cargue el backbone y aplique el scoring de candidatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YN-4b (FinQ) | Adaptador LoRA sobre backbone de 4B | No disponible | 74,14 % exactitud; 36,73 % F1 macro por pregunta en el test común | s2-mas-controlled-research-v1.2 | Hugging Face (adaptador y cabeza) |
| YN-4b head-only (mismo autor) | Backbone de 4B congelado más cabeza | No disponible | 67,28 % exactitud; 30,90 % F1 macro por pregunta | Misma licencia del proyecto | Hugging Face |
| YN-421m (FinL) | Ruta de encoder de base inglesa de seis rondas | No disponible | No disponible en esta ficha | Misma licencia del proyecto | Hugging Face |
| YN-421m-mlx (FinL-mlx) | Runtime MLX FP16 del anterior | No disponible | No disponible en esta ficha | Misma licencia del proyecto | Hugging Face |

No se dispone de comparación con modelos externos al proyecto S²-MAS en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria s2-mas-controlled-research-v1.2, restringida a investigación controlada; el uso comercial no está permitido sin consultar los términos del archivo LICENSE.
- El modelo solo procesa inglés y está especializado en QA financiero de opción múltiple; no es un generador de texto generalista.
- Requiere proporcionar un estado de hogar en la inferencia; los ejemplos del repositorio omiten los estados completos y los identificadores originales.
- Los datos de entrenamiento provienen de encuestas reales, por lo que pueden heredar sesgos de la población encuestada y de la construcción del conjunto de QA.
- Riesgo de alucinación no evaluado en la información disponible; el modelo produce decisiones discretas, no texto libre, lo que limita pero no elimina el riesgo de decisiones incorrectas.
- El backbone Qwen3.5-4B-Base debe obtenerse por separado; el repositorio solo contiene el adaptador y la cabeza.
- La implementación del motor GENESE/MAS permanece privada, lo que dificulta la reproducibilidad completa del entorno de simulación.
- No se documentan la longitud de contexto efectiva ni el comportamiento fuera de la distribución de las 119 versiones de pregunta del test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-4b
- Licencia: https://huggingface.co/ya9919/YN-4b/blob/main/LICENSE
- Ejemplos de QA en JSON: https://huggingface.co/ya9919/YN-4b/blob/main/qa_examples.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio GitHub del proyecto: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Modelo FinL: https://huggingface.co/ya9919/YN-421m
- Runtime MLX de FinL: https://huggingface.co/ya9919/YN-421m-mlx
