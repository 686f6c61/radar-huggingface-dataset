# ViezeVingertjes/Llama-3.2-1B-Instruct-EAGLE3

## Resumen

Llama-3.2-1B-Instruct-EAGLE3 es una cabeza de borrador (draft head) EAGLE-3 diseñada para decodificación especulativa sobre el modelo base meta-llama/Llama-3.2-1B-Instruct. Lo desarrolla el usuario ViezeVingertjes y no se trata de un modelo generativo autónomo, sino de un componente auxiliar que propone los siguientes tokens para que el modelo principal los verifique en una sola pasada, acelerando la generación sin alterar la salida final (salvo diferencias de redondeo en coma flotante).

La arquitectura es EAGLE-3 estándar: una única capa de decodificador Llama con atención que combina el embedding normalizado del token actual con una proyección lineal de los estados ocultos del modelo objetivo en las capas 2, 8 y 13. El MLP tiene 4096 unidades de ancho (la mitad del modelo base) y la capa de salida cubre los 32.768 tokens más frecuentes del vocabulario de entrenamiento, remapeados al vocabulario completo mediante `d2t`.

Su relevancia actual radica en que permite acelerar la inferencia de Llama 3.2 1B Instruct en CPU y en llama.cpp con incrementos medidos de 1,42x en decodificación (llama.cpp con objetivo bf16) y 3,15x en el runner Turbo LLM, manteniendo la salida idéntica a la referencia fp32. Se distribuye en formato SpecForge (safetensors) y como GGUF para llama.cpp, con un total de aproximadamente 122M parámetros y 251 MB en bf16 GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 (una capa de decodificador Llama con fusión de estados ocultos del objetivo) |
| Parametros totales | 121.804.032 (aprox. 122M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | bf16 (safetensors y GGUF); int5 en formato propio de Turbo LLM; funciona junto a objetivos cuantizados (Q8_0) |
| Idiomas soportados | en |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (SpecForge, bf16), GGUF (bf16), .tlm (int5, Turbo LLM) |

## Arquitectura y entrenamiento

La cabeza sigue la receta EAGLE-3: una sola capa de decodificador Llama cuya entrada de atención es la concatenación del embedding normalizado del token actual con una característica fusionada, obtenida mediante una proyección lineal de los estados ocultos del modelo objetivo en las capas 2, 8 y 13. El MLP tiene 4096 unidades de ancho (la mitad del modelo base) y la capa de salida cubre los 32.768 tokens más frecuentes del corpus de entrenamiento, remapeados al vocabulario completo con la matriz `d2t`.

El entrenamiento es por auto-destilación: 400.000 prompts de SmolTalk (eliminando los que aparecen en Spec-Bench) fueron respondidos por el propio Llama 3.2 1B Instruct con decodificación greedy, generando 220 millones de tokens. El objetivo es la divergencia KL respecto a la distribución del siguiente token del modelo objetivo (renormalizada sobre el vocabulario de borrador), con el test de entrenamiento EAGLE-3 desplegado sobre 3 pasos de borrador y ponderación 0,8^k por paso. La optimización usó AdamW (lr 2e-4, betas 0,9/0,95, sin weight decay), 200 pasos de warmup seguidos de decaimiento coseno hasta el 10%, secuencias de 1.024 tokens, batch de 64 secuencias, durante una hora en 4x H100. Se inicializó desde una cabeza anterior entrenada sobre las respuestas propias de SmolTalk.

## Capacidades

- Decodificación especulativa: propone hasta 3 tokens por pasada que el modelo objetivo verifica en una sola pasada, con una longitud de aceptación de 2,64 tokens por pasada en Turbo LLM (480 preguntas de Spec-Bench) y 2,54 en llama.cpp.
- Aceleración de decodificación: 1,42x sobre llama.cpp sin borrador con objetivo bf16 y 1,10x con Q8_0; 3,15x en Turbo LLM frente a llama.cpp bf16 sin borrador.
- Preservación de la salida: cada token borrador es verificado por el objetivo, por lo que la salida greedy solo difiere por redondeo en coma flotante (1 de 18 salidas alteradas en la verificación batched bf16 de llama.cpp).
- Integración con llama.cpp mediante `--spec-type draft-eagle3` y con Turbo LLM de forma integrada (formato int5 propio).
- Compatibilidad con objetivos cuantizados (Q8_0), aunque los borradores se verifican contra el modelo cuantizado.
- No cubre tool calling, agentes, visión, audio ni multilingüismo por sí misma: estas capacidades dependen del modelo objetivo Llama 3.2 1B Instruct.
- Idioma de entrenamiento: únicamente inglés (en).

## Casos de uso

- Aceleración de inferencia en CPU: desplegar llama.cpp con `--spec-type draft-eagle3` junto al GGUF de Llama 3.2 1B Instruct para obtener 1,42x en decodificación con objetivo bf16, útil en entornos sin GPU.
- Servidores de bajo consumo: usar Turbo LLM con la cabeza integrada para alcanzar 3,15x frente a llama.cpp bf16 sin borrador, manteniendo la salida idéntica a fp32, en despliegues con presupuesto de memoria ajustado (2,1 GB para el modelo completo en formato .tlm).
- Razonamiento matemático interactivo: la cabeza alcanza 3,16 tokens por pasada en tareas de razonamiento matemático de Spec-Bench, lo que la hace adecuada para asistentes de resolución de problemas paso a paso donde la latencia importa.
- Traducción y resumen automatizados: con 2,24 y 2,39 tokens por pasada respectivamente, encaja en pipelines de traducción o summarización de documentos en inglés con latencia reducida.
- Atención al cliente en inglés: conversaciones multi-turno con Llama 3.2 1B Instruct acelerado por la cabeza, aprovechando la ventana de contexto del modelo objetivo para diálogos extensos.
- RAG (generación aumentada por recuperación): 2,57 tokens por pasada en tareas RAG de Spec-Bench, adecuado para sistemas de preguntas y respuestas sobre documentos que requieren respuestas rápidas en inglés.
- Evaluación y benchmarking de decodificación especulativa: servir como referencia reproducible para comparar cabezas EAGLE-3 sobre Llama 3.2 1B Instruct, con métricas de tokens por pasada publicadas por grupo de tareas.

## Benchmarks y rendimiento

Spec-Bench (commit `fd2c1cd`, 480 preguntas, primer turno, hasta 1.024 tokens nuevos), greedy, hasta 3 tokens borrador por pasada con selección de árbol estilo EAGLE-2, en Turbo LLM:

| Grupo de tarea | Tokens por pasada |
|---|---|
| MT-Bench | 2,76 |
| Traducción | 2,24 |
| Resumen | 2,39 |
| Preguntas y respuestas | 2,48 |
| Razonamiento matemático | 3,16 |
| RAG | 2,57 |
| Global | 2,64 |

En llama.cpp (b12470, `--spec-type draft-eagle3`, hasta 3 tokens borrador por defecto, objetivo y cabeza bf16), sobre el subconjunto dev de Spec-Bench (18 preguntas, hasta 1.024 tokens nuevos):

| Cabeza de borrador | Tokens por pasada | Velocidad de decodificación vs. sin borrador | Salida idéntica a fp32 exacta |
|---|---|---|---|
| Esta cabeza (llama.cpp bf16) | 2,54 | 1,42x | difiere en 1 de 18 |
| Esta cabeza (llama.cpp Q8_0) | no disponible | 1,35x | difiere en 10 de 18 (pérdida por pesos de 8 bits) |
| Esta cabeza (Turbo LLM, 12 bits lossless) | no disponible | 2,21x | exacta en 18 de 18 |

Velocidad relativa frente a llama.cpp bf16 en la misma CPU con los mismos pesos bf16 (decodificación y extremo a extremo, prompt incluido): llama.cpp 1,00x y 1,00x; llama.cpp con esta cabeza 1,42x y 1,31x; Turbo LLM sin borrador 1,52x y 1,60x; Turbo LLM con esta cabeza 3,15x y 2,92x. Solo Turbo LLM coincide con la salida fp32 en las 18 prompts. Extremo a extremo, incluido el procesamiento del prompt, Turbo LLM es 2,22x llama.cpp bf16 con esta cabeza.

## Requisitos de hardware

- VRAM estimada para inferencia: la cabeza ocupa 251 MB como bf16 GGUF y aproximadamente 122M parámetros; el modelo objetivo Llama 3.2 1B Instruct requiere su propio espacio (unos 2,1 GB en formato .tlm int5 de Turbo LLM; el GGUF bf16 del objetivo es mayor).
- GPU recomendadas: el entrenamiento se realizó en 4x H100 durante una hora; para inferencia no se especifican GPU dedicadas, ya que el foco del autor es CPU.
- Cabe en GPU consumer: no se proporcionan datos específicos; por tamaño (122M parámetros), la cabeza es ligera, pero el requisito conjunto depende del objetivo Llama 3.2 1B Instruct.
- Opciones de despliegue: llama.cpp (b12470 o posterior, `--spec-type draft-eagle3`), Turbo LLM (runner C de un solo archivo con la cabeza integrada en int5), y el checkpoint SpecForge en safetensors para otros runners compatibles.
- Latencia y throughput: 1,42x en decodificación con llama.cpp bf16, 1,10x con Q8_0, 3,15x en Turbo LLM frente a llama.cpp bf16 sin borrador; 2,92x extremo a extremo con prompt incluido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens por pasada | Velocidad de decodificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-EAGLE3 (esta ficha) | 122M (cabeza) | no disponible | 2,64 (Turbo LLM) / 2,54 (llama.cpp) | 1,42x llama.cpp bf16; 3,15x Turbo LLM | llama3.2 | Hugging Face, GGUF, .tlm |
| Otra cabeza EAGLE-3 pública para Llama 3.2 1B Instruct | no disponible | no disponible | no disponible (comparada en tabla de llama.cpp del autor) | no disponible | no disponible | pública según el autor |
| Llama 3.2 1B Instruct sin borrador (referencia) | 1.240M | 131.072 tokens (modelo base) | 1,0 | 1,00x (línea base) | llama3.2 | Hugging Face, GGUF |

La comparación con la otra cabeza EAGLE-3 pública se menciona en la model card, pero los valores numéricos de esa alternativa no se detallan en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere siempre el modelo objetivo Llama 3.2 1B Instruct para verificar los borradores; no puede usarse solo.
- La salida puede diferir de la referencia fp32 por redondeo en coma flotante: en llama.cpp bf16 difiere en 1 de 18 salidas; con objetivo Q8_0 difiere en 10 de 18 por la cuantización de pesos.
- Entrenada únicamente en inglés (idioma `en`), por lo que su eficacia en otros idiomas no está documentada.
- La licencia llama3.2 impone restricciones de uso comercial heredadas de Llama 3.2; debe revisarse antes de producción.
- La cabeza está entrenada por auto-destilación sobre respuestas greedy del propio modelo, por lo que reproduce los sesgos y alucinaciones del objetivo, no los corrige.
- La longitud de contexto no se especifica; depende del modelo objetivo.
- El rendimiento medido se limita a CPU y a las versiones de llama.cpp (b12470) y Turbo LLM indicadas; no hay datos de latencia en GPU.
- La integración en llama.cpp requiere la opción `--spec-type draft-eagle3` y una versión suficientemente reciente.

## Enlaces

- [Hugging Face: ViezeVingertjes/Llama-3.2-1B-Instruct-EAGLE3](https://huggingface.co/ViezeVingertjes/Llama-3.2-1B-Instruct-EAGLE3)
- [Modelo base: meta-llama/Llama-3.2-1B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct)
- [Repositorio Turbo LLM](https://github.com/ViezeVingertjes/turbo-llm)
- [Paper EAGLE-3 (arXiv:2503.01840)](https://arxiv.org/abs/2503.01840)
- [Dataset SmolTalk (HuggingFaceTB/smoltalk)](https://huggingface.co/datasets/HuggingFaceTB/smoltalk)
