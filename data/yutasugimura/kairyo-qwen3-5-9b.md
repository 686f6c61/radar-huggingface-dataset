# YutaSugimura/Kairyo-Qwen3.5-9B

## Resumen

Kairyo-Qwen3.5-9B es un ajuste fino por destilación de conocimiento del modelo Qwen/Qwen3.5-9B, publicado por YutaSugimura bajo licencia Apache 2.0. El autor lo distribuye explicitamente como un modelo no oficial, sin vinculo con el equipo Qwen ni con Alibaba Cloud, y advierte que no debe confundirse con un hipotetico "Qwen3.8-9B". El profesor utilizado en la destilación es Qwen/Qwen3.8-27B, servido en FP8, y el resultado conserva intactos el codificador visual y la cabeza MTP (multi-token prediction) del checkpoint base.

El modelo resuelve un problema concreto del checkpoint original: la tendencia a generar razonamientos excesivamente largos que agotan el presupuesto de tokens y terminan en bucles de repeticion. Segun los datos del autor, Kairyo reduce la longitud media de respuesta de 5.951 a 407 tokens en GSM8K y de 8.762 a 2.285 en MATH-500, lo que se traduce en mejoras sustanciales en tareas de razonamiento corto (GSM8K de 77,6 a 95,0; MATH-500 de 70,4 a 90,8) y en una latencia practica mucho menor.

Tecnicamente es un transformer multimodal con 9.653.104.368 parametros, pipeline image-text-to-text, contexto de hasta 131.072 tokens en las evaluaciones del autor y pesos en safetensors (repositorio de 19,3 GB). Existe ademas una version GGUF Q8_0 con mmproj publicada por el mismo autor. Es relevante ahora porque demuestra que la destilacion off-policy de un profesor mayor puede corregir patologias de decodificacion de un modelo abierto sin necesidad de reentrenar el codificador visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP; familia qwen3_5 |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens en evaluacion; ventana nativa del base no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (version publicada por el autor); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y mantiene sin cambios el codificador visual y la cabeza de prediccion multi-token (MTP), por lo que conserva la entrada de imagen del checkpoint original. La intervencion se limita a un unico adaptador LoRA entrenado y fusionado de vuelta en los pesos base. El metodo es una destilacion off-policy en una sola etapa: entrenamiento supervisado sobre respuestas del profesor verificadas mas una perdida KL sobre los top-20 logits del profesor (Qwen3.8-27B en FP8).

Los datos de entrenamiento mezclan desde el inicio tareas de razonamiento corto con entradas largas de 8k a 100k tokens, y las muestras de entrada larga reciben un peso x4 en la perdida. Se eliminaron las prompts de entrenamiento que compartian un 13-grama con cualquier item de evaluacion (20 o mas 13-gramas compartidos en el caso de documentos largos). El autor documenta que el dataset contiene el mismo tipo de problemas que GSM8K y MATH, mientras que MMLU-Pro no tiene contrapartida en el entrenamiento. Una variante en dos etapas (razonamiento corto primero, entradas largas despues con learning rate menor) obtuvo mejores resultados en MRCR pero no fue publicada.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con presupuesto de hasta 16.384 tokens nuevos en la configuracion de evaluacion.
- Razonamiento matematico: 95,0 en GSM8K y 90,8 en MATH-500 segun el harness del autor.
- Generacion de codigo: 94,7 en HumanEval con ejecucion de tests unitarios.
- Procesamiento de imagen: pipeline image-text-to-text con el codificador visual del base intacto.
- Contexto largo: evaluado con entradas de hasta 131.072 tokens y documentos truncados a 110k en LongBench v2.
- Prediccion multi-token (MTP): cabeza conservada del checkpoint base, util para decodificacion especulativa.
- Conocimiento general: 79,5 en MMLU-Pro (300 items).
- Tool calling, function calling y comportamiento agentico multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no publica desglose por idioma.
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento matematico en produccion con presupuesto de tokens acotado: el modelo responde problemas de nivel GSM8K en una media de 407 tokens frente a 5.951 del base, lo que reduce coste por consulta y evita los bucles de repeticion que cortan el 20% de las respuestas del base en GSM8K.
- Tutoria o correccion automatica de ejercicios: con 95,0 en GSM8K y 90,8 en MATH-500 y respuestas concisas, encaja en flujos donde se necesita la solucion y no la traza completa de razonamiento.
- Generacion de codigo asistida: 94,7 en HumanEval permite integrarlo en asistentes de autocompletado o revision de parches, siempre que se valide con tests propios dado que el harness del autor es privado.
- Analisis de documentos largos con componente visual: al conservar el codificador de imagen y soportar entradas de hasta 131k tokens, sirve para extraer informacion de informes escaneados o capturas combinadas con texto extenso.
- Clasificacion y respuesta a preguntas de opcion multiple: 79,5 en MMLU-Pro lo hace util para filtrado previo o triaje en pipelines de evaluacion, con la cautela de que la ventaja frente al base puede no mantenerse con presupuestos mayores.
- Despliegue en hardware modesto mediante GGUF Q8_0: la version cuantizada con mmproj permite ejecucion local en llama.cpp para prototipos de razonamiento y vision sin infraestructura de GPU de datacenter.
- Destilacion como receta reproducible: el metodo (LoRA unico, KL top-20, mezcla de longitudes con peso x4) sirve de referencia para equipos que quieran corregir patologias de decodificacion en otros modelos abiertos.

## Benchmarks y rendimiento

Modo thinking, maximo 16.384 tokens nuevos, temperature 0,6, top_p 0,95, top_k 20, sin presence penalty, vLLM, pesos bf16 (profesor en FP8). Las cifras de Kairyo en GSM8K, MATH-500, MMLU-Pro, HumanEval y LongBench v2 short son la media de 4 ejecuciones.

| Benchmark | Qwen3.5-9B (base) | Kairyo-Qwen3.5-9B | Qwen3.8-27B (profesor) |
|---|---|---|---|
| GSM8K (250, test) | 77,6 | 95,0 | 98,4 |
| MATH-500 (250) | 70,4 | 90,8 | 96,4 |
| MMLU-Pro (300) | 74,0 | 79,5 | 84,0 |
| HumanEval (164) | 93,9 | 94,7 | 99,4 |
| LongBench v2 short (67) | 53,7 | 52,3 | 68,7 |
| LongBench v2 medium (65) | 44,6 | 52,3 | 66,2 |
| MRCR 8-needle, 16k (16) | 0,999 | 0,837 | 0,839 |
| MRCR 8-needle, 32k (17) | 0,946 | 0,646 | 0,819 |
| MRCR 8-needle, 64k (17) | 0,882 | 0,659 | 0,777 |
| Respuestas cortadas a 16k, GSM8K / MATH-500 / MMLU-Pro | 20% / 30% / 16% | 0% / 4% / 2% | 0% / 2% / 0% |
| Longitud media de respuesta, GSM8K / MATH-500 (tokens) | 5.951 / 8.762 | 407 / 2.285 | 385 / 1.633 |

El autor advierte de que el harness de evaluacion es propio y las cifras no son directamente comparables con informes oficiales. En el subconjunto de items que el base termina, este es ligeramente superior (GSM8K 97,0 vs 95,6; MATH-500 100,0 vs 96,9; MMLU-Pro 88,4 vs 84,1), por lo que la mejora agregada procede sobre todo de evitar cortes y bucles. La varianza entre ejecuciones es alta: LongBench v2 short varia hasta 14,9 puntos y MMLU-Pro hasta 4,7.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y KV cache; el repositorio completo ocupa 19,3 GB.
- VRAM estimada en GGUF Q8_0: en torno a 10-11 GB para los pesos del modelo de lenguaje, mas el proyector multimodal mmproj.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares para bf16 con contexto largo; el autor evaluo con vLLM.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos bf16 con contexto moderado, aunque el contexto de 131k requiere offloading o cuantizacion; la version Q8_0 es viable en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM (usado en la evaluacion), transformers, llama.cpp u Ollama mediante el GGUF Q8_0 publicado.
- Latencia y throughput: no disponibles como cifras medidas; el autor solo indica que la menor longitud de respuesta hace el modelo "mucho mas rapido en la practica".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | MATH-500 | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kairyo-Qwen3.5-9B | 9,65B | 131.072 (evaluado) | 95,0 | 90,8 | 79,5 | Apache 2.0 | Hugging Face (safetensors + GGUF Q8_0) |
| Qwen3.5-9B (base) | no disponible | no disponible | 77,6 | 70,4 | 74,0 | no disponible | Hugging Face |
| Qwen3.8-27B (profesor) | no disponible | no disponible | 98,4 | 96,4 | 84,0 | no disponible | Hugging Face |

Las cifras de los tres modelos proceden del mismo harness del autor, por lo que son comparables entre si pero no con informes oficiales de terceros. No se dispone de datos de otros modelos de tamano similar evaluados con la misma metodologia.

## Limitaciones y advertencias

- Modelo no oficial: no esta publicado, afiliado ni respaldado por el equipo Qwen ni por Alibaba Cloud; el autor lo etiqueta explicitamente como "unofficial".
- Regresion en recuperacion de conversaciones largas: MRCR 8-needle cae de 0,999 a 0,837 a 16k, de 0,946 a 0,646 a 32k y de 0,882 a 0,659 a 64k respecto al base. Las diferencias a 32k (-0,30 ± 0,20) y 64k (-0,22 ± 0,19) son significativas al 95%; a 16k es borderline.
- Parte de la puntuacion MRCR es in-distribution: el dataset de entrenamiento incluye una tarea sintetica de la misma forma que MRCR.
- La ventaja en MMLU-Pro podria no mantenerse con un presupuesto mayor: solo 7 de las 49 respuestas cortadas del base son bucles, y con mas tokens podria alcanzar hasta 88,0 (no medido por el autor).
- El base fue ejecutado con el muestreo recomendado para codigo (temperature 0,6, sin presence penalty), no con el general de Qwen (temperature 1,0, presence penalty 1,5); una presence penalty podria reducir sus bucles y estrechar la diferencia.
- Varianza alta entre ejecuciones: LongBench v2 short varia hasta 14,9 puntos y MMLU-Pro hasta 4,7 al repetir la misma evaluacion.
- Harness de evaluacion propio: los numeros no son directamente comparables con los informes oficiales de Qwen ni con otras tablas publicas.
- Contaminacion parcial: el dataset de entrenamiento contiene el mismo tipo de problemas que GSM8K y MATH, aunque se filtraron prompts con 13-gramas compartidos con items de evaluacion.
- Idiomas soportados no documentados: no hay desglose multilingue publicado, lo que impide garantizar calidad fuera del ingles.
- Riesgo de alucinacion: no cuantificado por el autor; aplican las cautelas habituales de un modelo destilado de 9B en tareas de conocimiento factual.
- Soporte de tool calling y comportamiento agentico no documentado: no debe asumirse su funcionamiento en pipelines de agentes sin validacion previa.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un derivado no oficial conviene revisar las condiciones del modelo base Qwen3.5-9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YutaSugimura/Kairyo-Qwen3.5-9B
- Version GGUF: https://huggingface.co/YutaSugimura/Kairyo-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/YutaSugimura
