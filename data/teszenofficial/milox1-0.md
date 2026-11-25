# teszenofficial/MiloX1.0

## Resumen

MiloX1.0 (también referido como Milo) es un modelo de lenguaje de tipo transformer decoder-only desarrollado desde cero por el usuario teszenofficial bajo la marca HIAKEU. Con aproximadamente 17,3 millones de parámetros, se sitúa en la categoría de modelos extremadamente pequeños, muy por debajo de los modelos de referencia de su clase (por ejemplo, GPT-2 small tiene 124 M). Está entrenado específicamente para el idioma español y utiliza una ventana de contexto de 2.048 tokens con codificación posicional rotatoria (RoPE).

El modelo se ha preentrenado sobre el corpus HuggingFaceFW/fineweb-2, un conjunto de datos multilingüe de texto web filtrado, y posteriormente se ha ajustado mediante un fichero de instrucciones conversacionales (`finetune_chat.jsonl`). Esto sugiere un uso previsto orientado a generación de texto y diálogo en español, aunque el autor no detalla la composición exacta del dataset de ajuste ni el volumen de tokens empleado.

Su relevancia es limitada en términos de rendimiento absoluto, pero resulta interesante como ejemplo de entrenamiento from-scratch en español a muy pequeña escala. No hay información pública sobre benchmarks, licencia ni pipeline de despliegue, y el repositorio no registra descargas ni interacciones, lo que indica que es un proyecto incipiente o de carácter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | ~17,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (es) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo ocupa 0,3 GB, sin desglose de ficheros) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar, sin mecanismos de mezcla de expertos (MoE) ni capas de estado recurrente. Emplea RoPE (Rotary Positional Embeddings) para codificar la posición, lo que permite manejar la ventana de 2.048 tokens. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención ni la función de activación, datos que el autor no ha publicado.

El preentrenamiento se realizó sobre HuggingFaceFW/fineweb-2, un corpus de texto web multilingüe filtrado por Hugging Face. No se indica el número de tokens vistos, la proporción de español en la mezcla ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del fichero `finetune_chat.jsonl`, cuyo contenido y tamaño no se detallan. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Generación de texto en español, presumiblemente con capacidad de mantener diálogo multi-turno gracias al ajuste sobre `finetune_chat.jsonl`.
- Comprensión y generación limitada por el tamaño del modelo (17,3 M de parámetros), lo que restringe razonamiento complejo, matemáticas y código.
- Capacidades multilingües: solo se declara español; no hay evidencia de otros idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado educativo de entrenamiento from-scratch: sirve para demostrar el flujo completo de preentrenamiento y ajuste conversacional en español con un coste computacional mínimo.
- Generación de texto breve en español para tareas de completado simple (por ejemplo, continuar frases o párrafos cortos) en entornos de prueba.
- Experimentación con fine-tuning ligero: al ser un modelo pequeño, permite iterar rápidamente en ajustes sobre dominios concretos con recursos limitados.
- Chatbot de demostración con contexto corto (2.048 tokens) para validar pipelines de despliegue antes de migrar a modelos mayores.
- Generación de datos sintéticos a pequeña escala para aumentar corpus en español, siempre con revisión humana por la baja fiabilidad esperada.
- Investigación sobre sesgos y alucinación en modelos pequeños entrenados con fineweb-2, comparando comportamiento con modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de ~17,3 M de parámetros, en fp32 ocuparía aproximadamente 70 MB de pesos; en fp16 unos 35 MB; en int8 unos 17 MB. La VRAM total dependerá del runtime y del tamaño de lote, pero en cualquier caso será inferior a 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650) e incluso CPU es suficiente. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos móviles o embebidos.
- Opciones de despliegue: al no publicarse formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI. Si los pesos están en safetensors, podría cargarse con transformers; si no, habría que convertir.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiloX1.0 | ~17,3 M | 2.048 | no disponible | Hugging Face (repo público, 0 descargas) |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face, muy extendido |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Apache 2.0 | Hugging Face, con benchmarks publicados |

No se dispone de datos de rendimiento de MiloX1.0 para comparar con estas alternativas; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Tamaño muy reducido (~17,3 M de parámetros): capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente en tareas complejas.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo se declara soporte de español; no hay evidencia de robustez en otros idiomas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se debe contactar con el autor antes de usarlo en producción.
- Sin benchmarks publicados ni datos de entrenamiento detallados (número de tokens, composición, técnicas de alineación), lo que impide evaluar su calidad de forma objetiva.
- Repositorio sin descargas ni interacciones: no hay comunidad ni soporte, y el proyecto puede estar en fase experimental.
- Formato de pesos no especificado: puede requerir conversión para usarse con runtimes estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teszenofficial/MiloX1.0
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
