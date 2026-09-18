# willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter004

## Resumen

`willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter004` es un checkpoint intermedio de aprendizaje por refuerzo (RL) obtenido a partir del modelo base `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario `willamazon1` dentro de la ejecución de entrenamiento `miles-multievo-v2`, y corresponde concretamente a la iteración 4. Se trata, por tanto, de un punto de control de investigación y no de un modelo final pulido: los checkpoints de esta ejecución se guardan cada 5 iteraciones y las iteraciones publicadas se agrupan en una colección para poder comparar la curva de entrenamiento.

El modelo conserva la arquitectura del base: un transformer MoE de 35.951.822.704 parámetros totales (el sufijo A3B de la nomenclatura apunta a unos 3.000 millones de parámetros activos por token), 40 capas, dimensión oculta 2048, 256 expertos con enrutado top-8, atención híbrida (lineal y completa), una capa MTP (multi-token prediction) y una torre de visión. El vocabulario es de 248.320 entradas y los pesos se distribuyen en bfloat16, con un tamaño de repositorio de 71,9 GB.

Su relevancia es doble. Por un lado, es multimodal (`image-text-to-text`) y está etiquetado como apto para agentes y conversación. Por otro, ilustra un flujo de trabajo habitual en el entrenamiento a gran escala: conversión desde un checkpoint de entrenamiento en formato Megatron-LM `torch_dist` a safetensors de HuggingFace con la herramienta `slime`, con verificación de NaN/Inf y comparación del conjunto completo de claves de tensores. Su licencia Apache 2.0 facilita la experimentación, aunque al ser una iteración 4 su utilidad práctica está acotada a la investigación y a la comparación de trayectorias de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (lineal y completa), 40 capas, dimensión oculta 2048, 256 expertos con enrutado top-8, 1 capa MTP y torre de visión |
| Parametros totales | 35.951.822.704 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3.000 millones segun la nomenclatura A3B del nombre del modelo; no confirmado de forma explícita en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); expertos MoE almacenados en disposición agrupada/fusionada (`mlp.experts.gate_up_proj` / `down_proj`) |
| Vocabulario | 248.320 tokens |
| Precisión de publicación | bfloat16 |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Etapa de entrenamiento | RL (MultiEvo v2), iteración 4 |
| Tamaño del repositorio | 71,9 GB |
| Modalidad | image-text-to-text (multimodal) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen3.6-35B-A3B` (`Qwen3_5MoeForConditionalGeneration`): 40 capas con dimensión oculta 2048, una mezcla de expertos de 256 expertos con top-8 activos por token, atención híbrida que combina capas de atención lineal con capas de atención completa, una capa de predicción multi-token (MTP) y una torre de visión que habilita la entrada de imágenes. El vocabulario es de 248.320 entradas. La model card no detalla la composición del dataset de RL, la función de recompensa ni el volumen de tokens utilizados en esta etapa; solo indica que se trata de la ejecución `miles-multievo-v2` y que este checkpoint corresponde a la iteración 4.

El proceso de publicación merece atención desde el punto de vista técnico. El checkpoint original se entrenó en Megatron-LM en formato `torch_dist` y se convirtió a safetensors de HuggingFace con `tools/convert_torch_dist_to_hf.py` del proyecto `slime`, usando `--vocab-size 248320` para eliminar el relleno (padding) de los embeddings y la opción `-a/--add-missing-from-origin-hf` para incorporar la torre de visión, que el checkpoint de entrenamiento del modelo de lenguaje no contiene y que por tanto se toma del modelo base. Los expertos MoE quedan en disposición agrupada/fusionada. Según el autor, cada shard se comprobó en busca de NaN/Inf y el conjunto completo de claves de tensores se comparó con una conversión verificada de esta misma arquitectura antes de subir el modelo. No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto y conversación multi-turno, según las etiquetas `conversational` y el pipeline `image-text-to-text`.
- Procesamiento multimodal de imagen y texto: la torre de visión procede del modelo base e integra entradas visuales junto con el prompt textual.
- Razonamiento y capacidades de agente: el modelo está etiquetado como `agent`, y la capa MTP apunta a decodificación multi-token, útil para acelerar generación y planificación.
- Mejora orientada por refuerzo: al ser un checkpoint de la ejecución `miles-multievo-v2`, está sometido a optimización por RL, aunque la model card no especifica qué comportamientos se refuerzan.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en entrenamiento por refuerzo: comparar la iteración 4 con las demás iteraciones publicadas de `miles-multievo-v2` permite trazar la curva de aprendizaje y detectar inestabilidades tempranas en el proceso de RL.
- Evaluación de pipelines de conversión Megatron-LM a HuggingFace: el modelo sirve como caso de prueba real de `convert_torch_dist_to_hf.py`, incluida la reintegración de la torre de visión desde el modelo base y el recorte de padding del vocabulario.
- Pruebas de arquitecturas MoE con atención híbrida: 256 expertos con top-8 y 40 capas permiten estudiar el enrutado, el balanceo de carga y el coste real de memoria en entornos de investigación.
- Experimentos multimodales de laboratorio: al aceptar imagen y texto, puede emplearse para tareas de descripción de imágenes o razonamiento visual en fase de prototipo, asumiendo que se trata de un checkpoint intermedio.
- Evaluación de decodificación multi-token: la capa MTP incluida hace viable medir ganancias de latencia asociadas a la predicción multi-token frente a la decodificación autoregresiva clásica.
- Docencia y formación técnica: sirve para ilustrar paso a paso cómo se publica un checkpoint de RL a escala de 36.000 millones de parámetros, con verificación de integridad de tensores y control de precisión en bfloat16.
- Base para ajuste posterior: dado que la licencia es Apache 2.0, puede emplearse como punto de partida para experimentos de fine-tuning, con la advertencia de que no es un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a un foro de soporte de un operador de telecomunicaciones y no guardan relación con el modelo). Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: los pesos suman 71,9 GB, por lo que se necesitan al menos 80 GB de VRAM solo para los pesos, más el espacio de activaciones, caché KV y buffers, lo que en la práctica exige un nodo con varias GPU o una GPU de 80 GB con poco margen.
- Cuantización de 8 bits: estimación de 36-40 GB de VRAM para los pesos, viable en una A100 80 GB o H100 80 GB con holgura; no se han publicado pesos cuantizados oficialmente, por lo que habría que generarlos.
- Cuantización de 4 bits: estimación de 20-22 GB de VRAM, lo que permitiría ejecución en una RTX 4090 de 24 GB, siempre con cuantización propia y asumiendo degradación de calidad no medida.
- GPU recomendadas: H100 80 GB o A100 80 GB para bfloat16; configuraciones multi-GPU (por ejemplo, 2x A100 40 GB) para repartir los pesos en bfloat16.
- GPU de consumo: no cabe en tarjetas de 24 GB o menos en bfloat16; solo sería viable con cuantización agresiva (4 bits) y potencialmente con descarga parcial a CPU.
- Opciones de despliegue: vLLM, SGLang o TGI para servir en bfloat16 con paralelismo de tensor; `transformers` con `device_map="auto"` para uso directo, tal y como indica la model card. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, conversión que no está publicada.
- Requisito adicional: al almacenarse los expertos MoE en disposición agrupada/fusionada, conviene verificar que la versión de `transformers` y el backend de inferencia soportan ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.6-35b-a3b-miles-multievo-v2-iter004 | 35.951.822.704 | no disponible | Sin benchmarks publicados | Apache 2.0 | Repositorio HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (modelo base) | Misma arquitectura (el checkpoint derivado conserva los parámetros) | no disponible | No disponible en la información proporcionada | no disponible en la información proporcionada | Repositorio HuggingFace del modelo base |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no arrojó información sobre modelos comparables, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría (por ejemplo, otros MoE multimodales de tamaño similar) sin inventar datos. La única comparación sustentada en la información disponible es con el modelo base del que deriva este checkpoint, que comparte arquitectura, vocabulario y número de parámetros, y del que se diferencia únicamente por la etapa de RL aplicada hasta la iteración 4.

## Limitaciones y advertencias

- Se trata de un checkpoint intermedio de RL (iteración 4) y no de un modelo final; se guardan checkpoints cada 5 iteraciones, por lo que corresponde a un punto muy temprano de la ejecución y su calidad puede ser inferior a la de iteraciones posteriores.
- No hay ningún resultado de benchmarks publicado, ni datos de latencia o throughput, lo que impide estimar su rendimiento real frente al modelo base o a alternativas.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación independiente por parte de la comunidad.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible; al ser un checkpoint de RL temprano, no puede descartarse inestabilidad en la generación.
- Sesgos conocidos: no documentados. Tampoco se declara la composición del dataset de RL, lo que dificulta evaluar sesgos de dominio o de idioma.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- La torre de visión no proviene del entrenamiento de RL, sino del modelo base, incorporada durante la conversión (`--add-missing-from-origin-hf`). El comportamiento multimodal puede no reflejar el efecto del RL.
- La disposición fusionada de los expertos MoE (`gate_up_proj` / `down_proj`) puede exigir versiones concretas de `transformers` o de los backends de inferencia; es recomendable validar la carga antes de integrarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar del modelo base `Qwen/Qwen3.6-35B-A3B` conviene revisar también las condiciones aplicables a ese modelo base.
- No se especifican requisitos de memoria distintos de los derivados del tamaño en bfloat16; no hay pesos cuantizados publicados, por lo que cualquier despliegue ligero exige una conversión propia no validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter004
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de conversión `slime` (incluye `tools/convert_torch_dist_to_hf.py`): https://github.com/THUDM/slime
- Colección de iteraciones de la ejecución `miles-multievo-v2`: mencionada en la model card, sin URL disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles; la búsqueda web no devolvió resultados relevantes sobre este modelo
