# Tractorman/accel-gen-9M-GGUF

## Resumen

accel-gen-9M es un modelo de lenguaje de 8.335.008 parametros entrenado desde cero por el equipo 2 del curso ECE382M de la Universidad de Texas en Austin (otoño de 2026) para el benchmark de FPGA de la asignatura. Se distribuye unicamente en formato GGUF cuantizado a Q4_0 y esta disenado especificamente para ejecutarse integramente en logica programable sobre una placa Ultra96 mediante el motor A16Q4 v3 del equipo. No es un modelo de proposito general: es un artefacto de ingenieria orientado a validar un acelerador hardware.

La arquitectura es un transformer Llama convencional de 6 capas, anchura 288, feed-forward de 768 con SwiGLU, 6 cabezas de atencion de dimension 48 sin GQA y un vocabulario propio de 4.096 tokens (SentencePiece BPE con byte fallback). El contexto maximo es de 512 tokens. Cada dimension esta elegida para encajar sin recompilar el bitstream del acelerador.

Su relevancia es acotada pero ilustrativa: demuestra que un modelo de 8 millones de parametros puede preentrenarse con 3.000 millones de tokens en 6,9 horas sobre una RTX 3060 Laptop y desplegarse en una FPGA de bajo coste a 308 tokens por segundo. Sin embargo, el propio autor advierte que la puntuacion perfecta del benchmark procede de haber entrenado sobre los pools de items evaluados, no de capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, implementacion estandar en llama.cpp) |
| Parametros totales | 8.335.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q4_0 puro en todas las matrices, embedding y salida (`llama-quantize --pure`); normas en F32 |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (`gen-L6-QAT-Q4_0.gguf`, 4.798.304 bytes) |

Detalles adicionales de forma: 6 capas, anchura 288, feed-forward 768 (SwiGLU), 6 cabezas con head size 48 y sin GQA, vocabulario de 4.096 tokens con SentencePiece BPE y byte fallback, embeddings de salida no atados (untied).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama sin innovaciones arquitectonicas reseñables: atencion multi-cabeza clasica, SwiGLU en el feed-forward y normas en F32. La peculiaridad esta en las restricciones de forma, impuestas por el motor A16Q4 v3 de la Ultra96, que ejecuta el forward pass completo en logica programable con un maximo de 6 capas y activaciones en punto fijo de 16 bits. El vocabulario se entreno especificamente sobre el corpus de preentrenamiento.

El entrenamiento se desarrollo en tres fases. Primero, preentrenamiento con 3.000 millones de tokens (91.552 pasos de 64×512) procedentes de FineWeb-Edu `sample-10BT` y Cosmopedia v2 del corpus SmolLM (ambos ODC-By), con schedule warmup-stable-decay y learning rate pico de 2e-3; 6,9 horas en una RTX 3060 Laptop y perplejidad de validacion final de 13,2. Segundo, ajuste fino de 30 epocas sobre smol-smoltalk de un solo turno (Apache 2.0), items de validacion de HellaSwag y ARC-Easy en el formato exacto del harness, datos estilo IFEval de nano_wiki (CC BY 4.0) y texto plano. Tercero, entrenamiento consciente de cuantizacion (QAT) de 10 epocas redondeando cada matriz a Q4_0 en el forward pass, manteniendo las activaciones en 16 bits.

## Capacidades

- Generacion de texto en ingles fluido y sobre tema, aunque con exactitud factual muy baja.
- Conversacion de un solo turno mediante plantilla de chat embebida en el GGUF (formato `mensaje de usuario + "\n" + respuesta del asistente`).
- Respuesta a items de eleccion multiple de HellaSwag y ARC-Easy en el formato exacto del harness del curso.
- Cumplimiento de instrucciones estilo IFEval sobre el dominio de nano_wiki.
- Inferencia en hardware FPGA (Ultra96) con el motor A16Q4 v3, y en CPU x86 mediante llama.cpp.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio.
- Multilinguismo: exclusivamente ingles.

## Casos de uso

- Validacion de aceleradores hardware: el modelo sirve como carga de trabajo de referencia para verificar el correcto funcionamiento de un motor de inferencia en FPGA (6 capas, 0 timeouts, 0 errores en la placa Ultra96), midiendo throughput a 308 tok/s.
- Docencia de entrenamiento de LLM de extremo a extremo: por su tamano (8,3 M de parametros) y su pipeline documentado (preentrenamiento, SFT y QAT), es util como ejemplo reproducible en cursos de machine learning.
- Benchmark de cuantizacion: al estar entrenado con QAT sobre Q4_0 en todas las matrices, permite estudiar la degradacion de calidad frente a pesos de mayor precision en modelos diminutos.
- Pruebas de integracion de llama.cpp: sirve para validar el soporte de vocabularios personalizados, plantillas de chat embebidas y cuantizacion pura en builds de llama.cpp.
- Demostracion de inferencia en el borde (edge): util para ilustrar el despliegue de modelos de lenguaje en dispositivos de bajo consumo y recursos limitados.
- Generacion de texto de relleno en ingles: puede producir texto gramaticalmente correcto y sobre tema para prototipos de interfaz, sin valor factual.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, analisis documental ni ninguna tarea que requiera exactitud.

## Benchmarks y rendimiento

Resultados publicados por el autor con el harness del curso (50 items: 20 de HellaSwag, 20 de ARC-Easy y 10 estilo IFEval):

| Plataforma | Puntuacion | HellaSwag | ARC-Easy | IFEval | Decodificacion |
|---|---:|---:|---:|---:|---:|
| Ultra96, motor A16Q4, modo MRD, 1 hilo | 100,0 | 99,95 | 100,0 | 100,0 | 308 tok/s |
| CPU x86, 5 semillas | 99,9 a 100,0 | 98,8 a 100,0 | 100,0 | 100,0 | no disponible |

Resultados en items no vistos (publicados por el autor como advertencia):

| Benchmark | Puntuacion | Azar |
|---|---:|---:|
| ARC-Challenge | 27,2 % | 25 % |
| HellaSwag retenido | 24,5 % | 25 % |

No se han publicado resultados de benchmarks estandar adicionales (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en Q4_0 (el fichero GGUF ocupa 4,8 MB); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el modelo se entreno en una RTX 3060 Laptop y no requiere acelerador dedicado para inferencia.
- Cabe en GPU consumer: si, en cualquier GPU con mas de 1 GB de memoria, e incluso en CPU.
- Despliegue en FPGA: Ultra96 con el motor A16Q4 v3 del equipo (bitstream especifico, no generico).
- Opciones de despliegue en software: llama.cpp (formato nativo GGUF); compatibilidad con Ollama u otros runners basados en llama.cpp no confirmada en la informacion disponible.
- Latencia y throughput: 308 tok/s en Ultra96 con el motor A16Q4 en modo MRD y 1 hilo; no se han publicado cifras para CPU x86.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---:|---|---|---|
| accel-gen-9M | 8,3 M | 512 | CC BY-SA 4.0 | Benchmark FPGA, QAT Q4_0 | GGUF en Hugging Face |
| accel-lm-5M (mismo equipo) | ~5 M | no disponible | no disponible | Predecesor, solo texto general | no disponible |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Modelo pequeno de proposito general | Hugging Face |

La comparacion con modelos de proposito general no es homogenea: accel-gen-9M esta optimizado para encajar en un motor hardware concreto y su rendimiento en tareas no vistas es equivalente al azar, mientras que modelos como SmolLM-135M, pese a ser mas grandes, mantienen capacidad general. No se dispone de datos de benchmarks comparables entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- La puntuacion perfecta del benchmark procede de entrenar sobre los pools de items evaluados (HellaSwag, ARC-Easy e IFEval del harness), no de capacidad general. En items no vistos rinde al nivel del azar: 27,2 % en ARC-Challenge y 24,5 % en HellaSwag retenido.
- Responde a preguntas abiertas con ingles fluido y sobre tema, pero habitualmente incorrecto: acerto aproximadamente 2 o 3 de 20 preguntas aleatorias.
- Tiende a repetirse en respuestas largas.
- Contexto muy limitado (512 tokens), insuficiente para documentos o conversaciones extensas.
- Solo ingles; no soporta castellano ni otros idiomas.
- Vocabulario muy reducido (4.096 tokens), lo que penaliza la eficiencia y la cobertura lexica.
- No apto para uso en produccion que requiera exactitud factual, generacion de codigo, agentes o tool calling.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- El despliegue en FPGA requiere el bitstream y el motor A16Q4 v3 especificos del equipo; no es portable a otro hardware sin trabajo adicional.
- Riesgo de sesgos: al entrenarse sobre FineWeb-Edu y Cosmopedia, hereda los sesgos de esos corpus, aunque el autor no documenta evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tractorman/accel-gen-9M-GGUF
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset HellaSwag: https://huggingface.co/datasets/Rowan/hellaswag
- Dataset AI2 ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset nano_wiki: https://huggingface.co/datasets/sixf0ur/nano_wiki
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
