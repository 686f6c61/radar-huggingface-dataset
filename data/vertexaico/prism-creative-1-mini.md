# VertexAIco/prism-creative-1-mini

## Resumen

Prism Creative 1 Mini es un modelo de generación de texto especializado en escritura creativa y narrativa, desarrollado por VertexAIco como parte de la familia Prism de modelos creativos y de rol. Se construye mediante un fine-tuning con LoRA sobre Qwen3-4B-Instruct-2507 (en su versión cuantizada a 4 bits de mlx-community), utilizando un dataset destilado de 2.500 ejemplos generados por el modelo profesor GLM 5.2 a través de NVIDIA NIM. El objetivo es cubrir relatos cortos, bocetos de personajes, poesía, escenas de diálogo, worldbuilding y microrrelato sin caer en el registro genérico de "asistente IA".

El modelo tiene 4.022.468.096 parámetros totales y se distribuye en dos formatos: MLX a 4 bits (grupo de 64, 2,26 GB) para Apple Silicon mediante mlx-lm, y GGUF Q4_K_M (2,50 GB) para llama.cpp, Ollama y LM Studio. La licencia es Apache 2.0, heredada del modelo base Qwen3, y el único idioma declarado es el inglés.

Su relevancia actual radica en que ofrece un comportamiento narrativo afinado sobre un modelo base pequeño y ampliamente desplegable, con un proceso de curación de datos documentado (dos pasadas de endurecimiento para eliminar bucles de repetición y clichés recurrentes) y una pérdida de validación de 1,064. Es una opción práctica para prototipado creativo en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits MLX (group size 64); GGUF Q4_K_M (4 bits) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros, en la variante ya cuantizada a 4 bits publicada por mlx-community. Sobre esa base se aplica un fine-tuning LoRA de rango 8 sobre 16 capas, durante 6.500 iteraciones, alcanzando una pérdida de validación mínima de 1,064. No se documenta entrenamiento por refuerzo ni DPO; la adaptación es exclusivamente supervisada sobre datos destilados.

El dataset de entrenamiento consta de 2.500 ejemplos distribuidos en 10 categorías: relatos cortos, bocetos de personajes, primeras líneas, escenas de diálogo, worldbuilding, poesía, mezclas de géneros, ejercicios de punto de vista, microrrelato y continuaciones. Los datos se generaron con GLM 5.2 como modelo profesor y pasaron por dos rondas de endurecimiento tras detectar dos modos de fallo en una ejecución inicial: tendencia a bucles repetitivos en formas fijas muy cortas (como drabbles de 100 palabras) y dependencia excesiva de detalles cliché "seguros" (por ejemplo, un reloj marcando una hora concreta) en prompts no relacionados. Se ajustó el prompt de generación y se aplicó un filtro automático que rechaza salidas con repetición excesiva de 4-gramas o frases cliché marcadas, re-filtrando también los datos ya existentes.

## Capacidades

- Generación de ficción en múltiples géneros, formas y tonos: relato corto, microrrelato, poesía, escenas de diálogo, worldbuilding y bocetos de personajes.
- Respeto de restricciones explícitas de longitud, formato y estilo indicadas en el prompt (por ejemplo, microrrelatos de 100 palabras).
- Escritura inmersiva sin preámbulos ni metacomentario, guiada por un system prompt específico de escritura creativa.
- Continuaciones narrativas y ejercicios de punto de vista.
- Conversación multi-turno en registro narrativo (pipeline text-generation, tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Generación de microrrelato y ficción flash: el modelo fue entrenado explícitamente en formas de longitud fija y endurecido contra bucles de repetición, por lo que resulta adecuado para producir piezas de 100 a 500 palabras con restricciones estrictas de extensión.
- Prototipado de narrativa para videojuegos: puede generar descripciones de worldbuilding, bocetos de personajes y escenas de diálogo que sirvan como material de arranque para guionistas y diseñadores narrativos.
- Asistencia a escritores en fase de borrador: al no emitir preámbulos ni metacomentario, las salidas se integran directamente en documentos sin necesidad de limpieza posterior.
- Generación de primeras líneas y aperturas: la categoría específica de "opening lines" del dataset lo hace útil para desbloquear bloqueos creativos al inicio de un relato.
- Ejercicios de escritura por punto de vista: permite reescribir una misma escena desde distintas perspectivas, aprovechando la categoría de POV del entrenamiento.
- Contenido creativo local en Apple Silicon: con 2,26 GB en MLX 4 bits, se puede ejecutar en un portátil Mac para sesiones de escritura sin conexión ni coste de API.
- Despliegue ligero en servidor con llama.cpp u Ollama: el GGUF Q4_K_M de 2,50 GB permite servir el modelo en CPU o GPU modesta para herramientas internas de generación de ficción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una pérdida de validación mínima de 1,064 y una comprobación cualitativa sobre un conjunto reservado (flash fiction, worldbuilding, poesía y diálogo) con salidas coherentes, sin texto de planificación filtrado ni bucles de repetición.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,3 GB para la variante MLX 4 bits y 2,5 GB para el GGUF Q4_K_M, más el overhead de contexto y del runtime.
- GPU recomendadas: no se especifican en la documentación. La variante MLX está pensada para Apple Silicon (mlx-lm); la variante GGUF es compatible con llama.cpp en CPU y GPU.
- GPU de consumo: por tamaño, cabe holgadamente en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) y en equipos Apple Silicon con memoria unificada.
- Opciones de despliegue: mlx-lm en Apple Silicon; llama.cpp, Ollama y LM Studio para el GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia, aunque no se detalla el runtime concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formatos |
|---|---|---|---|---|---|
| Prism Creative 1 Mini | 4,02 B | No disponible | Escritura creativa y narrativa (LoRA sobre Qwen3-4B) | Apache 2.0 | safetensors (MLX 4-bit), GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (base) | ~4 B | No disponible | Instrucciones generales, conversacional | Apache 2.0 | safetensors, GGUF (según distribución) |
| Modelos creativos de 7-8 B de la familia Prism u otras | No disponible | No disponible | Escritura creativa y rol | No disponible | No disponible |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada. El principal punto de referencia es su modelo base: Prism Creative 1 Mini añade especialización narrativa y un formato MLX 4 bits listo para usar, a costa de perder generalidad frente a Qwen3-4B-Instruct-2507 en tareas no creativas.

## Limitaciones y advertencias

- Modelo de 4B parámetros afinado con LoRA sobre solo 2.500 ejemplos: la propia model card lo describe como un buen primer borrador, no como un texto final.
- Puede repetirse ocasionalmente en formas cortas muy restringidas, pese al endurecimiento del dataset contra bucles de repetición.
- Hereda tendencias estilísticas del modelo profesor GLM 5.2, incluyendo posibles clichés narrativos residuales.
- Solo soporta inglés; no se declara soporte de otros idiomas.
- No se documenta la longitud de contexto efectiva, lo que impide planificar su uso en narrativas largas o conversaciones extensas.
- Riesgo de alucinación inherente a los modelos generativos; en contextos de ficción es esperable, pero debe revisarse si se usa para contenido factual.
- No se documentan sesgos específicos, aunque al derivar de Qwen3-4B puede heredar los sesgos de su base y del corpus destilado.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos destilados de GLM 5.2 antes de un despliegue en producción.
- No dispone de tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que requieran invocación de funciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAIco/prism-creative-1-mini
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
