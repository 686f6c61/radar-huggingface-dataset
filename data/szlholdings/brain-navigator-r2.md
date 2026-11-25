# SZLHOLDINGS/brain-navigator-r2

## Resumen

brain-navigator-r2 es un adaptador LoRA (la librería declarada es `peft`) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen 3.5 con unos 0,8 mil millones de parámetros. El artefacto subido contiene 752.393.024 parámetros en formato safetensors y ocupa 6,1 GB en el repositorio, lo que sugiere que los pesos se distribuyen en precisión alta (bf16/fp32) junto con los ficheros del adaptador. La arquitectura declarada en las etiquetas es `qwen3_5_text`, es decir, la variante exclusivamente de texto de la familia.

El modelo se presenta dentro de lo que el autor denomina "governed-AI estate": una colección de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de "receipts" (registros de auditoría). La model card es explícita sobre sus límites: cualquier afirmación de entrenamiento o evaluación que no esté respaldada por un receipt con fecha se marca como UNKNOWN, y no se publica ninguna cifra de benchmark en la propia tarjeta. Esto es relevante para quien evalúe el modelo: la licencia Apache 2.0 y el tamaño reducido lo hacen fácil de desplegar, pero la ausencia de métricas medidas obliga a validarlo por cuenta propia.

Por su escala (menos de mil millones de parámetros) y su naturaleza de adaptador sobre un modelo base pequeño, encaja en escenarios de inferencia en CPU o GPU de consumo, prototipado rápido y tareas acotadas de generación de texto. No hay información pública sobre el corpus de entrenamiento del adaptador, los idiomas soportados ni el propósito concreto del ajuste más allá del nombre "brain navigator".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5, variante de texto `qwen3_5_text`); adaptador LoRA sobre Qwen/Qwen3.5-0.8B |
| Parametros totales | 752.393.024 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no declarada en la model card) |
| Tipos de cuantizacion | no disponible en la model card; al ser compatible con la familia Qwen y PEFT, es cuantizable con las herramientas habituales (GGUF, AWQ, GPTQ) previa conversión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 6,1 GB); compatible con PEFT |

## Arquitectura y entrenamiento

El artefacto es un ajuste PEFT (LoRA) sobre Qwen/Qwen3.5-0.8B, un transformer denso decoder-only de la familia Qwen 3.5 en su variante solo texto. El repositorio combina el adaptador con pesos en safetensors que suman 752.393.024 parámetros, ligeramente por debajo de los ~0,8B del modelo base, lo que es coherente con un adaptador de bajo rango más los tensores base o con un guardado parcial. La etiqueta de arquitectura `qwen3_5_text` confirma que no se incluyen componentes multimodales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del ajuste. La model card declara explícitamente que las afirmaciones de entrenamiento y evaluación residen en ficheros de receipt del "estate mesh" del autor y que cualquier dato no registrado allí se considera UNKNOWN. En consecuencia, no es posible verificar ni el proceso de ajuste ni la calidad del mismo a partir de la información pública del repositorio.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento y respuesta a instrucciones en la medida en que el adaptador LoRA las haya reforzado; no hay documentación que lo confirme.
- Soporte de tool calling / function calling: no disponible de forma explícita en la model card; dependería del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la variante es solo texto.
- Integración con el ecosistema PEFT/Hugging Face Transformers para carga del adaptador.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: al apoyarse en un modelo de 0,8B, puede ejecutarse en una sola GPU de consumo o incluso en CPU, lo que permite iterar sobre prompts y adaptadores sin coste de infraestructura dedicada.
- Clasificación y extracción de información en pipelines por lotes: su tamaño reducido permite procesar grandes volúmenes de documentos con latencia baja y coste por token mínimo, siempre que se valide la calidad en el dominio concreto.
- Filtrado y enrutado previo en arquitecturas multi-modelo: puede actuar como primer nivel que descarta consultas triviales o las redirige a un modelo mayor, reduciendo el coste global del sistema.
- Generación de texto asistida en entornos con requisitos de soberanía del dato: al ser Apache 2.0 y desplegable on-premise, encaja en organizaciones que no pueden enviar datos a APIs externas.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo práctico de adaptador LoRA sobre Qwen3.5-0.8B para estudiar técnicas PEFT, comparar rangos y medir degradación respecto al base.
- Evaluación comparativa de "governed AI": útil para quienes quieran auditar la metodología de receipts del autor y reproducir sus verificaciones sobre un artefacto pequeño y manejable.
- Educación y demos interactivas: su huella de memoria permite desplegarlo en portátiles con GPU integrada para talleres y demostraciones sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y que los datos no registrados en los receipts del estate se consideran UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los ~752M parámetros requieren aproximadamente 1,5 GB solo para pesos, más caché KV y overhead del runtime; en la práctica, entre 2 y 4 GB para contextos moderados. En cuantización de 8 bits, en torno a 1 GB; en 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100). En A100/H100 el modelo estará limitado por el ancho de banda de memoria y no por la computación.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas, incluidas las integradas con memoria compartida suficiente.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador; llama.cpp/Ollama tras conversión a GGUF; vLLM y TGI son viables pero sobredimensionados para este tamaño. Para CPU pura, llama.cpp es la opción más eficiente.
- Latencia y throughput estimados: no disponibles. Como referencia de orden de magnitud para un modelo de esta escala, en una RTX 4090 se pueden esperar cientos de tokens por segundo en bf16 con lotes pequeños, pero no hay medición publicada para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SZLHOLDINGS/brain-navigator-r2 | 752M (adaptador sobre Qwen3.5-0.8B) | no disponible | Apache 2.0 | Sin benchmarks publicados; artefacto PEFT |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache 2.0 (según familia Qwen) | Modelo base sin ajuste; referencia directa |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32K (familia Qwen2.5) | Apache 2.0 | Alternativas de escala comparable con benchmarks públicos |
| Llama 3.2 1B | 1,2B | 128K | Llama 3.2 Community License | Mayor contexto; licencia con restricciones de uso |

La comparación con alternativas de la misma escala es difícil porque brain-navigator-r2 no publica métricas. Frente al modelo base Qwen3.5-0.8B, la única diferencia verificable es la presencia del adaptador; frente a modelos de la generación anterior como Qwen2.5-0.5B o Llama 3.2 1B, la ventaja potencial sería la arquitectura más reciente del base, pero sin datos medidos no puede afirmarse.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación del entrenamiento: no hay forma de verificar la calidad del ajuste ni compararlo con alternativas.
- Riesgo de alucinación: inherente a los modelos de 0,8B, que tienen capacidad limitada de razonamiento factual y tienden a inventar detalles en tareas de conocimiento.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe equilibrado; habría que evaluarlo por idioma.
- Longitud de contexto no especificada en la tarjeta: debe consultarse la del modelo base Qwen3.5-0.8B antes de diseñar aplicaciones con documentos largos.
- Naturaleza de adaptador LoRA: requiere cargar el modelo base Qwen/Qwen3.5-0.8B además del adaptador, con la dependencia de versión de PEFT y Transformers que ello implica.
- Trazabilidad limitada: la model card remite a receipts externos alojados en el "estate mesh" del autor; sin acceso a esos ficheros, las afirmaciones del autor no son verificables de forma independiente.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar también la licencia del modelo base y de los datos de ajuste, no documentados.
- Madurez del repositorio: 319 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción ni de soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/brain-navigator-r2
- Organización del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub: https://github.com/szl-holdings
- Repositorio de generación de tarjetas (estate-cards): https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
