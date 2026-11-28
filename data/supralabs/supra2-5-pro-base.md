# SupraLabs/Supra2.5-Pro-Base

## Resumen

Supra2.5-Pro Base es un modelo de lenguaje de tipo decoder-only desarrollado por SupraLabs, un laboratorio que trabaja en la frontera de los modelos de lenguaje de muy pequeno tamano. Con aproximadamente 65 millones de parametros, se entrena desde cero sobre 100.000 millones de tokens de datos web de alta calidad y emplea la arquitectura `Qwen3ForCausalLM`, lo que facilita su integracion con el ecosistema de transformers y con herramientas compatibles con Qwen3. Es un modelo base: no ha pasado por ajuste de instrucciones, chat ni alineamiento, por lo que su proposito es servir como punto de partida para fine-tuning y para investigacion sobre eficiencia computacional.

Su relevancia actual reside en la relacion entre tamano y datos de entrenamiento: 100.000 millones de tokens para 65 millones de parametros supone una ratio de aproximadamente 1.500 tokens por parametro, muy por encima de lo habitual en modelos de esta escala. Segun la model card, esto se traduce en mejoras medibles frente a generaciones anteriores de la familia Supra (Supra-50M y Supra2-100M) en pruebas como ARC-Easy, ARC-Challenge, PIQA, HellaSwag y ArithMark-3. El modelo esta pensado para escenarios donde el coste de inferencia y el espacio en disco son criticos, como dispositivos de borde, navegadores o pipelines de clasificacion y generacion de bajo volumen.

La ventana de contexto es de solo 512 tokens, un limite que condiciona fuertemente sus casos de uso y que lo aleja de los modelos conversacionales modernos. El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y un tokenizador propio de 16.384 entradas. Su idioma principal es el ingles, aunque la model card reconoce que los datos contenian otras lenguas (aleman, frances, espanol) que el modelo no aprendio bien.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only transformer (`Qwen3ForCausalLM`) |
| Parametros totales | 67.028.096 (~65M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible en la model card (pesos publicados en bfloat16; el formato safetensors permite cuantizacion posterior a GGUF/INT8/INT4 con herramientas externas) |
| Idiomas soportados | Ingles (principal); otras lenguas presentes en los datos pero no aprendidas correctamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Hiperparametros adicionales de la arquitectura:

| Hiperparametro | Valor |
|---|---|
| Hidden size | 640 |
| Capas | 12 |
| Cabezas de atencion | 10 (MHA) |
| Dimension de cabeza | 64 |
| Intermediate size (SwiGLU) | 1600 |
| Vocabulario | 16.384 |
| Codificacion posicional | RoPE, theta = 10.000 |
| Normalizacion | RMSNorm, epsilon = 1e-6 |
| Embeddings atados | Si |
| Precision de entrenamiento | bfloat16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal decoder-only con atencion multi-cabeza (MHA) clasica, sin variantes de atencion lineal ni mecanismos hibridos. Consta de 12 capas con un tamano oculto de 640, 10 cabezas de atencion de dimension 64 y una capa feed-forward SwiGLU con dimension intermedia de 1600. Usa RMSNorm con epsilon 1e-6, RoPE con theta 10.000 y embeddings atados entre la capa de entrada y la de salida, lo que reduce el numero de parametros. El tokenizador es propio, con un vocabulario de 16.384 entradas, mas pequeno que el de la mayoria de modelos Qwen3 estandar, lo que abarata la capa de embeddings y acelera la decodificacion.

El entrenamiento se realizo desde cero sobre 100.000 millones de tokens distribuidos en dos fases. La fase de calentamiento y estable consumio 80.000 millones de tokens centrados en conocimiento general y codigo, con datos de `Ultra-FineWeb-en` (44.000 millones), `dclm_100BT-shuffled` (28.000 millones) y `UltraData-Code-L2` (8.000 millones, 70% Python y 30% JavaScript). La fase de decaimiento uso 20.000 millones de tokens de una mezcla de `Ultra-FineWeb-en`, `Finephrase`, `TxT360-v2`, `Dolma3-Dolmino-Mix-100B-1025`, `UltraData-Math` e `IFM/Pretrain-Behaviors`, orientada a datos sinteticos, preguntas y respuestas, matematicas, comportamiento y libros de texto. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineamiento; de hecho, la model card insiste en que es un modelo base sin ajuste.

No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mezcla de expertos. La propuesta de valor es la eficiencia extrema mediante un modelo denso de muy bajo parametraje entrenado con un volumen de datos desproporcionadamente alto para su tamano.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, sin formato conversacional ni instrucciones.
- Razonamiento basico y respuesta a preguntas de sentido comun, evidenciado por los resultados en ARC-Easy, ARC-Challenge, PIQA y HellaSwag.
- Aritmetica simple y calculo de operaciones elementales, segun la prueba ArithMark-3 reportada por el autor.
- Generacion de codigo en Python y JavaScript, gracias a los 8.000 millones de tokens de `UltraData-Code-L2` en la fase de preentrenamiento.
- Capacidad de continuacion de texto y modelado de lenguaje general, adecuada para tareas de perplexity y scoring.
- No dispone de soporte de tool calling ni function calling: es un modelo base sin ajuste de instrucciones.
- No dispone de modo agente ni de razonamiento multi-paso estructurado; cualquier uso agentico requeriria fine-tuning previo.
- Capacidades multilingues muy limitadas: el ingles es el unico idioma con rendimiento utilizable segun la model card.
- No tiene vision, audio ni modo de pensamiento (thinking mode).
- El contexto maximo de 512 tokens limita la generacion a documentos y conversaciones muy cortos.

## Casos de uso

- Fine-tuning para clasificacion de texto: al ser un modelo base de 65M, se puede ajustar con LoRA o fine-tuning completo sobre datasets etiquetados para tareas de analisis de sentimiento, deteccion de spam o categorizacion de tickets, con coste de entrenamiento muy bajo en una sola GPU consumer.
- Generacion de texto en dispositivos de borde: con 67M de parametros y pesos en bfloat16 (unos 134 MB), cabe en moviles, Raspberry Pi o navegadores mediante WebGPU/ONNX, y puede generar continuaciones cortas de hasta 512 tokens sin conexion.
- Prototipado rapido de pipelines de NLP: sirve como baseline barato para validar arquitecturas de datos y preprocesamiento antes de escalar a modelos de mayor tamano, con iteracion en segundos por epoch.
- Investigacion sobre leyes de escalado y eficiencia de datos: la ratio de 1.500 tokens por parametro y la comparacion con Supra-50M y Supra2-100M lo convierten en un punto de referencia para estudiar el efecto del volumen de datos en modelos pequenos.
- Generacion y autocompletado de codigo en entornos con recursos limitados: entrenado con 8.000 millones de tokens de Python y JavaScript, puede emplearse para autocompletar lineas o sugerir fragmentos cortos en editores ligeros, siempre con validacion humana.
- Educacion e investigacion academica: su licencia Apache 2.0 y su tamano permiten usarlo en cursos y laboratorios para ensenar preentrenamiento, tokenizacion y evaluacion de modelos sin necesidad de infraestructura dedicada.
- Generacion de datos sinteticos a pequena escala: puede producir variaciones de texto para aumento de datos en tareas de clasificacion, aunque la calidad es limitada y requiere filtrado posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparados con generaciones anteriores de la familia Supra:

| Modelo | ARC-Easy | ARC-Challenge | PIQA | HellaSwag | ArithMark-3 | Media |
|---|---|---|---|---|---|---|
| Supra2.5-65M | 51,09% | 25,77% | 63,38% | 34,43% | 37,60% | 42,45% |
| Supra2-100M | 47,81% | 24,83% | 65,40% | 35,98% | 36,90% | 42,18% |
| Supra-50M | 46,00% | 25,17% | 61,19% | 31,72% | 36,30% | 40,08% |

El modelo supera a sus predecesores en ARC-Easy, ARC-Challenge, ArithMark-3 y en la media global, aunque queda por debajo de Supra2-100M en PIQA y HellaSwag. La model card incluye ademas una grafica comparativa con otros modelos externos, pero no se proporcionan los valores numericos de esa comparacion en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 134 MB solo para los pesos, mas overhead de activaciones y cache KV; en la practica menos de 1 GB.
- VRAM estimada en cuantizacion INT8: en torno a 70 MB para los pesos; en INT4, alrededor de 35 MB, aunque estas cuantizaciones no vienen publicadas y requeririan conversion externa.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutarlo. Para entrenamiento completo, una RTX 3090 o A100 acelera las iteraciones, aunque no son imprescindibles.
- Cabe holgadamente en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos y en muchas integradas.
- Opciones de despliegue: transformers con `Qwen3ForCausalLM`, text-generation-inference (el modelo incluye la etiqueta `text-generation-inference`), vLLM si se anade soporte para la arquitectura Qwen3, llama.cpp u Ollama tras conversion a GGUF, y ONNX Runtime o WebGPU para despliegue en navegador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera decodificacion de varios cientos de tokens por segundo en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Supra2.5-Pro Base | ~65M | 512 | Apache 2.0 | Ingles | Base sin alinear, 100B tokens de entrenamiento |
| Supra2-100M | ~100M | No disponible | No disponible | Ingles | Generacion anterior de SupraLabs; peor media en los benchmarks reportados |
| Supra-50M | ~50M | No disponible | No disponible | Ingles | Generacion anterior; peor media en los benchmarks reportados |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | Ingles y multilingue | Alternativa de Hugging Face con contexto mucho mayor y ajuste de instrucciones disponible |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Multilingue | Mucho mayor, pero con contexto y capacidades muy superiores |

La comparacion con SmolLM2-135M y Qwen2.5-0.5B se ofrece como referencia de categoria por tamano y licencia, no como comparacion de rendimiento: no se dispone de resultados de benchmarks cruzados en la informacion proporcionada. Frente a los modelos de SupraLabs, la ventaja de Supra2.5-Pro Base es la media global en los cinco benchmarks reportados; su desventaja principal es la ventana de contexto de 512 tokens, muy inferior a la de cualquier alternativa moderna.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni alineamiento: no responde a ordenes de forma fiable y puede generar contenido incoherente, repetitivo u ofensivo.
- Ventana de contexto de solo 512 tokens, insuficiente para conversaciones multi-turno, documentos largos o razonamiento con cadenas extensas.
- Riesgo elevado de alucinacion: con 65M de parametros, la capacidad de almacenar conocimiento factual es muy limitada y las afirmaciones deben verificarse siempre.
- Sesgos conocidos: al entrenarse sobre datos web (Ultra-FineWeb-en, DCLM, Dolma3), hereda sesgos de genero, raza, religion y nacionalidad presentes en esas fuentes; la model card no documenta mitigaciones.
- Limitaciones de idioma: aunque los datos contenian aleman, frances y espanol, el autor indica explicitamente que el modelo no los aprendio bien; no debe usarse en produccion para lenguas distintas del ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero no exime del cumplimiento de las licencias de los datos de entrenamiento subyacentes, que no se detallan en la informacion disponible.
- Caveat para produccion: no se han publicado evaluaciones de robustez, seguridad ni toxicidad; antes de desplegarlo en un producto conviene realizar una evaluacion propia y, en su caso, un fine-tuning con datos curados.
- El tokenizador es propio (16.384 entradas), por lo que no es compatible con el tokenizador estandar de Qwen3 y requiere usar el incluido en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2.5-Pro-Base
- Repositorio de transformers: https://github.com/huggingface/transformers
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Dataset Ultra-FineWeb: no disponible en la informacion proporcionada
- Dataset DCLM: no disponible en la informacion proporcionada
- Dataset Dolma3: no disponible en la informacion proporcionada
- Paper o blog tecnico de SupraLabs: no disponible en la informacion proporcionada
