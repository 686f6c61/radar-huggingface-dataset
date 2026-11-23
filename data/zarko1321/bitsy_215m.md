# zarko1321/bitsy_215M

## Resumen

Bitsy 215M es un checkpoint de modelo de lenguaje de tipo decoder-only con arquitectura Llama estándar, publicado por el usuario zarko1321 en Hugging Face. Se distribuye con pesos inicializados de forma aleatoria, es decir, sin entrenamiento previo: no es un modelo utilizable para inferencia de calidad, sino una base de partida para llevar a cabo un preentrenamiento desde cero. El repositorio incluye además un script de entrenamiento y el tokenizador, de modo que el paquete funciona como un kit de entrenamiento autocontenido.

El modelo cuenta con 215.000.064 parámetros reales (verificados en los safetensors), 18 capas de decoder, un tamaño oculto de 1.024, atención con 16 cabezas y 4 cabezas clave-valor (GQA con ratio 4:1), tamaño intermedio SwiGLU de 2.432 y una longitud de contexto de 2.048 tokens. El vocabulario es de 32.516 tokens y el tokenizador es un BPE a nivel de byte que reutiliza las primeras 32.513 entradas del vocabulario de GPT-2, más tokens especiales de inicio, fin y padding. Los embeddings de entrada y la cabeza de salida comparten pesos.

Su relevancia es acotada y muy específica: sirve para experimentar con preentrenamiento de modelos pequeños en hardware modesto, para reproducir pipelines de entrenamiento y para estudiar el comportamiento de arquitecturas Llama a pequeña escala. No debe confundirse con un modelo instruct o chat: el propio autor advierte que el checkpoint inicial produce predicciones aleatorias hasta que se entrene. El repositorio ocupa 0,4 GB y los pesos se sirven en bfloat16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (SwiGLU, GQA, RoPE implícito por arquitectura Llama) |
| Parámetros totales | 215.000.064 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (checkpoint publicado en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye GPT2-LICENSE.txt para el tokenizador) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con los componentes habituales de la familia Llama: 18 capas, hidden size de 1.024, FFN SwiGLU con dimensión intermedia de 2.432, 16 cabezas de atención y 4 cabezas clave-valor, lo que reduce el coste de memoria del KV cache en un factor de 4 respecto a atención multi-cabeza completa. El vocabulario de 32.516 tokens y el peso compartido entre embeddings y cabeza de salida mantienen bajo el recuento total de parámetros. El tokenizador es un BPE a nivel de byte derivado del vocabulario de GPT-2.

No hay entrenamiento: los pesos están inicializados aleatoriamente. El repositorio incluye un script `train.py` que realiza preentrenamiento de causal language modeling sobre un fichero de texto UTF-8 (una línea no vacía por documento) o un JSONL con entradas `{"text": "..."}`. El script mantiene el corpus tokenizado en RAM, guarda checkpoints cada 250 pasos, soporta precisión mixta bfloat16 con `--bf16` y permite reanudar ejecuciones con `--resume`. No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o SFT, porque no existen: el modelo parte de cero.

## Capacidades

- Generación de texto causal: únicamente tras completar un preentrenamiento propio; el checkpoint publicado no genera texto coherente.
- Razonamiento, código, matemáticas y visión: no disponibles en el checkpoint publicado; dependerán del corpus y del volumen de entrenamiento que aplique el usuario.
- Tool calling / function calling: no soportado de forma nativa; requeriría SFT específico.
- Soporte de agentes y razonamiento multi-paso: no disponible sin entrenamiento posterior.
- Capacidades multilingües: no documentadas; el tokenizador basado en GPT-2 está sesgado hacia inglés.
- Capacidad especial: ninguna (sin thinking mode, sin visión, sin audio).
- Infraestructura de entrenamiento incluida: script de preentrenamiento con checkpoints, reanudación y exportación de modelo y tokenizador.

## Casos de uso

- Preentrenamiento educativo desde cero: usar `train.py` sobre un corpus propio para observar cómo evoluciona la pérdida y la generación a lo largo de los pasos, con un modelo lo bastante pequeño para iterar en una sola GPU.
- Investigación en eficiencia de entrenamiento: comparar curvas de pérdida con distintas tasas de aprendizaje, schedules, tamaños de batch o precisión (fp32 frente a bf16) sobre una arquitectura fija y reproducible.
- Experimentos de tokenización: al reutilizar el vocabulario de GPT-2, permite aislar el efecto del tokenizador frente a cambios arquitectónicos en estudios comparativos.
- Base para ajuste fino posterior: tras un preentrenamiento suficiente, el checkpoint resultante puede servir de punto de partida para SFT en tareas concretas de clasificación o generación acotada.
- Pruebas de pipelines de despliegue: validar integraciones con transformers, exportación a otros formatos y monitorización de inferencia con un modelo de huella de memoria reducida.
- Docencia y divulgación: explicar el funcionamiento interno de un transformer decoder-only inspeccionando pesos, atención y formas de logits con un modelo de 0,4 GB.
- Reproducibilidad de experimentos: el paquete autocontenido (pesos, tokenizador y script) facilita replicar resultados en distintos entornos sin depender de checkpoints externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint está inicializado aleatoriamente, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K u otras) sería equivalente al azar y no tendría valor comparativo.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 0,43 GB solo para pesos (215 M × 2 bytes), más activaciones y KV cache; en la práctica, menos de 2 GB para contextos de 2.048 tokens con batch pequeño.
- VRAM para entrenamiento: el script mantiene el corpus tokenizado en RAM y entrena en fp32 o bf16; con AdamW en fp32 se estiman del orden de 3-4 GB de VRAM para pesos, gradientes y estados del optimizador, más activaciones.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. También es viable en CPU para inferencia de prueba, con latencia alta.
- Cabe en GPU consumer: sí, holgadamente, en cualquier GPU con 4-8 GB.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), y previsiblemente llama.cpp u Ollama tras convertir los pesos, aunque el autor no documenta estas rutas. vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles; dependerán del hardware y de si el modelo se ha entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bitsy 215M | 215 M | 2.048 | Pesos aleatorios, sin entrenar | no disponible | Hugging Face |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Preentrenado e instruct | Apache 2.0 | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Preentrenado | MIT (pesos) | Hugging Face |
| TinyLlama-1.1B | 1.100 M | 2.048 | Preentrenado y chat | Apache 2.0 | Hugging Face |

La comparación relevante no es de rendimiento, sino de propósito: Bitsy 215M es una base sin entrenar, mientras que SmolLM-135M, GPT-2 small y TinyLlama son modelos ya entrenados y utilizables directamente. En parámetros y contexto, Bitsy se sitúa en la misma franja que SmolLM-135M y GPT-2 small, pero sin los datos de entrenamiento que hacen útiles a esos modelos.

## Limitaciones y advertencias

- El checkpoint publicado no está entrenado: genera salidas aleatorias y no debe usarse en producción ni para evaluación de calidad.
- No se documenta la licencia del modelo; el repositorio solo incluye GPT2-LICENSE.txt para el tokenizador. Antes de un uso comercial es imprescindible aclarar la licencia con el autor.
- No hay información sobre sesgos, toxicidad o alucinación porque no hay datos de entrenamiento; cualquier comportamiento de este tipo dependerá del corpus que use el entrenador.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- El tokenizador derivado de GPT-2 está sesgado hacia inglés; el rendimiento en castellano u otros idiomas requerirá un corpus de entrenamiento adecuado y probablemente un tokenizador distinto.
- El script de entrenamiento mantiene el corpus tokenizado en RAM, lo que limita el tamaño de dataset según la memoria del sistema.
- No hay garantías de soporte, mantenimiento ni actualizaciones del repositorio (0 descargas y 0 likes en el momento de la consulta).
- El identificador `bitsy_215M` y la fecha de creación del repositorio (2026-11-23) deben tratarse con cautela; conviene verificar la procedencia antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zarko1321/bitsy_215M
- Licencia del tokenizador GPT-2 incluida en el repo: GPT2-LICENSE.txt (referenciado en la model card)
- Repositorio de transformers (carga del modelo): https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
