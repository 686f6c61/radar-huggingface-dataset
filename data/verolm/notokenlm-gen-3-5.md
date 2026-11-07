# VeroLM/NoTokenLM-Gen-3.5

## Resumen

NoTokenLM-Gen-3.5 es un modelo de lenguaje de 9.546.960 parámetros (aproximadamente 9,5 millones) desarrollado por VeroLM (publicado también bajo la cuenta omurberaisik), construido desde cero con una arquitectura transformer y un enfoque poco habitual: no utiliza tokenizador de subpalabras ni BPE, sino que opera directamente sobre bytes UTF-8 (vocabulario de 256 símbolos). La entrada y la salida son bytes crudos, lo que elimina por completo el fallo típico de los modelos con vocabulario cerrado ante caracteres no vistos en entrenamiento.

El modelo forma parte de la familia NoTokenLM, una serie de modelos pequeños cuyo objetivo declarado es medir cuánto puede lograr un modelo genuinamente pequeño si la arquitectura y el entrenamiento se cuidan, sin apoyarse en la escala. Gen-3.5 incorpora las sustituciones arquitectónicas estándar en los LLM modernos (RoPE en lugar de embeddings posicionales aprendidos, RMSNorm en lugar de LayerNorm, SwiGLU en lugar de MLP GELU y weight tying entre embedding de entrada y proyección de salida), aplicadas de forma deliberada a escala de 9M de parámetros.

Es relevante ahora como banco de pruebas experimental para investigación en arquitecturas tokenizer-free y modelos de muy bajo coste computacional, no como modelo de producción. El autor es explícito en la model card: el modelo no razona, no hace matemáticas ni mantiene conversaciones coherentes largas. Está entrenado únicamente en inglés y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT) con RoPE, RMSNorm, SwiGLU y weight tying |
| Parametros totales | 9.546.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; al ser un modelo de ~9,5M de parámetros, la cuantización es en la práctica innecesaria) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB), requiere `trust_remote_code=True` por código personalizado |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero. Frente a su predecesor Gen-2.5 (~3,1M de parámetros, diseño estilo GPT-2 con GELU, LayerNorm y embeddings posicionales aprendidos), Gen-3.5 introduce cuatro cambios: vocabulario byte-level de 256 símbolos en lugar de un conjunto fijo de caracteres derivado de los datos (que fallaba ante caracteres no vistos), RoPE en lugar de embeddings posicionales absolutos aprendidos, RMSNorm en lugar de LayerNorm, SwiGLU en lugar de un MLP GELU de dos capas, y weight tying entre la matriz de embedding de entrada y la proyección de salida. El autor señala que ninguna de estas técnicas es novedosa, pero sí lo es aplicarlas conjuntamente a escala de 9M de parámetros y medir su efecto.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card indica que el entrenamiento se realizó sobre texto real en inglés sin simplificar. La comparación con Gen-2.5 se hizo sobre 8 frases en inglés no vistas durante el entrenamiento, cargando los pesos de ambos modelos y midiendo qué modelo predice mejor cada frase: Gen-3.5 superó a Gen-2.5 en 8 de 8 casos. El autor reconoce que no ha aislado qué parte de la mejora corresponde al mayor tamaño (3x) y qué parte a la arquitectura.

## Capacidades

- Generación de texto en inglés a nivel de byte, sin tokenizador de subpalabras.
- Continuación de frases cortas con coherencia gramatical mayoritaria (~85-90% de las generaciones gramaticalmente correctas según la evaluación manual del autor).
- Manejo de cualquier carácter UTF-8 sin fallo por "carácter desconocido", al operar sobre los 256 valores de byte posibles.
- Compatibilidad directa con `transformers`: `AutoModelForCausalLM`, `AutoTokenizer` y `pipeline("text-generation")` funcionan con `trust_remote_code=True`.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (el autor lo descarta explícitamente).
- No soporta visión, audio ni modo de razonamiento (thinking mode).
- Multilingüe: no; solo inglés.

## Casos de uso

- Investigación en modelos tokenizer-free: servir como referencia reproducible de arquitectura byte-level a pequeña escala para comparar con enfoques BPE o character-level en experimentos académicos.
- Estudio de ablación arquitectónica: al incorporar RoPE, RMSNorm, SwiGLU y weight tying de forma aislada respecto a su predecesor, permite medir el impacto de cada sustitución en modelos de menos de 10M de parámetros.
- Pruebas de pipelines de inferencia: validar integraciones con `transformers`, generación con sampling (`temperature`, `top_k`) y carga con `trust_remote_code` en entornos de CI sin coste de GPU significativo.
- Educació n y divulgación: ilustrar de forma tangible qué produce un transformer de 9M de parámetros sobre texto inglés real, con expectativas calibradas por el propio autor (~40% de generaciones plenamente coherentes).
- Prototipado de demos ligeras de generación de texto: el repo ocupa 0,1 GB y cabe en cualquier entorno, incluidos contenedores con recursos mínimos, para pruebas de latencia y formato de salida.
- Análisis de fallos de coherencia: estudiar los modos de degradación documentados (contradicciones, combinaciones sin sentido como "the man was opened", bucles de repetición) como caso de estudio de límites de escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación cuantitativa aportada por el autor es manual:

| Evaluación | Condiciones | Resultado |
|---|---|---|
| Coherencia plena (evaluación manual) | 100 generaciones, 10 prompts x 10 muestras, temperature 0.5 | ~38-42% |
| Corrección gramatical | Misma evaluación | ~85-90% |
| Coherencia plena (réplica a mayor escala) | 1.000 generaciones, mismos 10 prompts, temperature 0.6, juicio independiente | ~40% (rango consistente) |
| Coherencia por tipo de prompt | Prompts con sujeto y acción claros ("She said", "She walked into the room and") | ~55-58% |
| Comparación con Gen-2.5 | 8 frases en inglés no vistas, carga directa de pesos | 8 de 8 a favor de Gen-3.5 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (9,5M de parámetros ≈ 38 MB de pesos); en la práctica cualquier GPU o CPU es suficiente.
- GPU recomendadas: ninguna en particular; funciona en CPU, GPU integrada, RTX 3060, RTX 4090, A100 o H100 sin diferencias relevantes de viabilidad.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía oficial documentada). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; dado que el modelo requiere código personalizado y un tokenizador byte-level propio, la conversión a GGUF no está disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera que sean muy bajos en cualquier hardware, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.5 | 9,5M | no disponible | Byte-level (256) | Apache 2.0 | Hugging Face |
| NoTokenLM-Gen-2.5 | ~3,1M | no disponible | Conjunto fijo de caracteres | no disponible | Referenciado por el autor |
| NoTokenLM-Gen-3.5-Focused | no disponible | no disponible | Byte-level / character-level | Apache 2.0 | Hugging Face |
| GPT-2 small | 124M | 1.024 tokens | BPE | MIT | Hugging Face |

La comparación con GPT-2 small se incluye como referencia de escala (13x más parámetros), pero no se dispone de resultados de benchmarks comparativos directos en la información proporcionada. No se han identificado otras alternativas tokenizer-free de escala comparable con datos verificables.

## Limitaciones y advertencias

- Coherencia limitada: solo ~38-42% de las generaciones son plenamente coherentes según la evaluación manual del propio autor; el resto presenta deriva semántica, contradicciones o bucles de repetición.
- Sin capacidades de razonamiento, matemáticas ni conversación multi-turno; el autor lo declara explícitamente.
- Entrenado únicamente en inglés; no se garantiza comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas.
- Riesgo de alucinación y de texto gramaticalmente correcto pero sin significado; no debe usarse para generar contenido factual sin revisión humana.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de desplegarlo en entornos sensibles.
- No hay evidencia de filtrado de sesgos ni de evaluación de seguridad; el dataset de entrenamiento no está documentado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción por sus limitaciones de calidad.
- El identificador del repositorio en la model card (`omurberaisik/NoTokenLM-Gen-3.5`) difiere del ID de Hugging Face indicado en los metadatos (`VeroLM/NoTokenLM-Gen-3.5`); conviene verificar cuál es la ruta canónica antes de integrarlo.

## Enlaces

- Hugging Face (ID de metadatos): https://huggingface.co/VeroLM/NoTokenLM-Gen-3.5
- Hugging Face (referenciado en la model card): https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5
- Variante Focused: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.5-Focused
