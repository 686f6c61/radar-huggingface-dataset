# trymirai/Qwen3.5-9B-Dash

## Resumen

Mirai's Qwen3.5-9B Dash es una cuantización agresiva del modelo base Qwen/Qwen3.5-9B, desarrollada por trymirai (Mirai Labs) y pensada específicamente para inferencia local en Apple silicon. El checkpoint se distribuye con la librería `uzu` y emplea pesos MLX de 2 bits, transformadas Hadamard-128 y tablas de vocabulario también cuantizadas a 2 bits, con el objetivo de reducir drásticamente la huella de memoria y acelerar la decodificación en hardware de Apple manteniendo la calidad del modelo original.

El modelo base Qwen3.5-9B pertenece a la familia Qwen de Alibaba; esta ficha se limita a lo que la model card del autor documenta. La información sobre el modelo original (arquitectura, datos de entrenamiento, benchmarks) no está incluida en los materiales disponibles, por lo que se marca como "no disponible" en las secciones correspondientes.

Es relevante ahora porque demuestra una ruta de compresión extrema (2 bits) con un "speculator" (modelo de decodificación especulativa) adaptado, orientada a ejecutar modelos de ~9B parámetros en Macs consumer. La evaluación de calidad frente al modelo original está pendiente ("Evaluation pending" según el autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuantización de Qwen3.5-9B (arquitectura del modelo base no disponible en la información; pesos MLX, librería `uzu`) |
| Parametros totales | 2.341.615.616 (según safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit MLX (group size 128), Hadamard-128; INT8 en filas key/value de atención; tablas de vocabulario 2-bit con 2.496 filas INT8; escalas y sesgos afines en bfloat16; speculator en 2-bit MLX group 128 con Hadamard-32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (licencia del modelo base Qwen3.5-9B) |
| Formato de pesos | safetensors (librería `uzu`, cuantización MLX empaquetada "packed kvs-dash") |

## Arquitectura y entrenamiento

El checkpoint es el resultado de la ejecución de cuantización 0575 en el paso QAT 4.000, e incluye pesos MLX de 2 bits con transformadas Hadamard-128, filas key/value en INT8 dentro de la atención y tablas de vocabulario de 2 bits con group size 128 (2.496 filas INT8 por tabla). Las escalas de cuantización y los sesgos afines se almacenan en bfloat16. Las tablas de vocabulario y el tokenizador comparten los mismos IDs de token reordenados, un detalle necesario para que la cuantización del embedding sea coherente con la tokenización.

Junto al modelo principal se incluye un "speculator" adaptado a kvs-dash, cuantizado a 2 bits MLX con group size 128 y transformadas Hadamard-32, además de una "confidence head" adaptada. Este componente habilita decodificación especulativa. No se dispone de información sobre la arquitectura del transformer subyacente, el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF/DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Razonamiento y conversación: heredadas del modelo base Qwen3.5-9B (no detalladas en la información disponible).
- Decodificación especulativa: incluye un speculator adaptado con confidence head para acelerar la inferencia.
- Inferencia local en Apple silicon: soportada mediante la CLI `mirai` (Homebrew) y la librería `uzu`.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.

## Casos de uso

- Inferencia local en Mac: ejecutar un modelo de la clase 9B comprimido a 2 bits en Apple silicon usando `brew install mirai` y `mirai --model trymirai/Qwen3.5-9B-Dash`; la reducción de pesos a ~2 bits (checkpoint de 2,34 mil millones de parámetros empaquetados) facilita que quepa en memoria unificada de equipos consumer.
- Prototipado offline en portátiles: generar texto sin conexión ni GPU dedicada, aprovechando que el autor solo soporta inferencia en Apple silicon.
- Experimentación con cuantización extrema: investigar el equilibrio calidad/tamaño de esquemas de 2 bits con transformadas Hadamard y tablas de vocabulario cuantizadas, comparándolo con el modelo base.
- Evaluación de decodificación especulativa: usar el speculator incluido para medir ganancias de throughput en hardware de Apple frente a decodificación autoregresiva estándar.
- Integración en aplicaciones macOS: empaquetar la CLI `mirai` en herramientas de escritorio o scripts que requieran generación de texto local sin depender de la nube.
- Pruebas de pipelines `uzu`: servir como checkpoint de referencia para validar la librería `uzu` y el formato "packed kvs-dash" en flujos de desarrollo propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Evaluation pending" y muestra un gráfico `kl-vs-size.svg` sin datos numéricos.

## Requisitos de hardware

- VRAM/memoria: el checkpoint ocupa 45,9 GB en el repositorio; el tamaño real en memoria depende del formato empaquetado y de la memoria unificada del equipo Apple. No se especifica una cifra de memoria mínima.
- GPU recomendadas: exclusivamente Apple silicon según el autor ("Currently only Apple silicon inference is supported"). No se soportan GPUs NVIDIA ni AMD en esta distribución.
- GPU consumer: diseñado para Macs consumer; no se detalla qué modelos concretos de chip (M1/M2/M3/M4) están soportados.
- Despliegue: CLI `mirai` vía Homebrew, o compilación desde el repositorio `trymirai/uzu` en GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (checkpoint) | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-Dash | 2.341.615.616 (packed) | no disponible | 2-bit MLX + INT8 KV | apache-2.0 | Apple silicon (`uzu`) |
| Qwen/Qwen3.5-9B (base) | no disponible | no disponible | pesos completos | apache-2.0 | multiplataforma |
| Otras cuantizaciones de Qwen3.5-9B | no disponible | no disponible | no disponible | apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparado ni de otras alternativas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Evaluación pendiente: el autor no ha publicado métricas de calidad (KL, benchmarks) frente al modelo original, por lo que el impacto de la cuantización a 2 bits es desconocido.
- Plataforma restringida: solo se soporta inferencia en Apple silicon; no hay soporte para CUDA ni otras GPU.
- Formato propietario: requiere la librería `uzu` y la CLI `mirai`; no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI.
- Cuantización agresiva: los pesos de 2 bits y las tablas de vocabulario cuantizadas pueden degradar la coherencia, el multilingüismo y el razonamiento frente al modelo base; no se documenta el alcance de la degradación.
- Tokenizador modificado: los IDs de token están reordenados y deben usarse con el tokenizador incluido; mezclar tokenizadores puede producir salidas incorrectas.
- Idiomas y sesgos: no disponibles en la información; se heredan los del modelo base Qwen3.5-9B, no documentados aquí.
- Licencia: apache-2.0 según la model card, con enlace a la licencia del modelo base; conviene verificar las condiciones del modelo original antes de uso comercial.
- Adopción limitada: 36 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-Dash
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Repositorio `uzu` en GitHub: https://github.com/trymirai/uzu/blob/main/README.md
