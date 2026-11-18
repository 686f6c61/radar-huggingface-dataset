# VeroLM/NoTokenLM-Gen-5.5-Preview

## Resumen

NoTokenLM-Gen-5.5-Preview es un modelo de lenguaje experimental desarrollado por VeroLM que explora una arquitectura sin tokenizador (tokenizer-free) y de nivel de byte (byte-level). En lugar de emplear un vocabulario BPE, el modelo recibe y emite bytes UTF-8 en crudo, agrupándolos en *patches* de longitud variable (unos 6 bytes de media, máximo 16) mediante un mecanismo de segmentación basado en entropía. El tronco principal procesa un solo paso por patch, lo que reduce el coste computacional frente a procesar cada byte individualmente.

El modelo tiene 168,9 millones de parámetros totales, incluyendo una tabla de embeddings de n-gramas hasheados de 19,9 M y un patcher de entropía congelado de 4,5 M. La arquitectura es híbrida: combina capas RWKV-7 con atención con compuerta (gated attention) sin codificación posicional, distribuidas en 20 capas con dimensión 768. El contexto de entrenamiento es de 4.096 bytes.

Se trata de un checkpoint de investigación temprano (mid-training), publicado para inspección arquitectónica. El autor advierte explícitamente que no se han publicado resultados de benchmarks, que las salidas suelen ser incorrectas o incoherentes y que no debe usarse en producción ni en aplicaciones que requieran información fiable. La licencia es Apache-2.0 y el modelo está disponible únicamente en inglés y francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder local convolucional + patching por entropía + tronco RWKV-7/atención con compuerta + decoder local |
| Parametros totales | 168.862.668 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 bytes |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en float32) |
| Idiomas soportados | Inglés y francés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo opera sobre bytes UTF-8 (`0..255`, con el byte `0` como fin de documento) sin vocabulario ni BPE. Un pequeño modelo convolucional causal congelado predice el siguiente byte y, cuando su entropía supera un umbral calibrado (`theta`, almacenado en `config.json`), se inicia un nuevo patch. Como las fronteras dependen solo de bytes ya vistos, son reproducibles en generación. Los bytes se codifican con embeddings de byte, embeddings de n-gramas hasheados (órdenes 3–8) y características de coincidencia de sufijos ROSA (un autómata de sufijos en línea que encuentra la coincidencia anterior más larga y alimenta el siguiente byte predicho y la longitud de coincidencia al encoder, además de un pequeño refuerzo de logits en la salida).

El tronco consta de 20 capas con `d = 768` y SwiGLU, organizadas en 5 bloques de `[RWKV-7, atención con compuerta, RWKV-7, RWKV-7]`. Las capas RWKV-7 (con value residual) realizan la mayor parte de la mezcla de secuencia, con una capa de atención con compuerta, QK-norm y sin posición en cada bloque. El encoder local (d = 256) usa dos convoluciones y atención ventaneada; el decoder local tiene 4 bloques de atención ventaneada y produce logits de 256 vías para el siguiente byte. Solo los patches cerrados pasan del tronco al decoder, lo que permite cachear el estado del tronco y avanzar un paso por patch. Se incluye además DeepEmbed (escalado por byte de las activaciones de la FFN local).

Los datos de entrenamiento consisten en una mezcla de texto mayoritariamente en inglés, junto con matemáticas, código y francés. No se especifica el número total de tokens ni si hubo RLHF o DPO. El checkpoint publicado corresponde al paso 39.350 (aproximadamente el 42 % del entrenamiento planificado), con pesos EMA en fp32; las muestras de la model card proceden de un checkpoint anterior (paso 19.950).

## Capacidades

- Generación de texto a nivel de byte sin tokenizador, con decodificación directa a UTF-8.
- Generación con muestreo configurable: `temperature`, `top_k`, `top_p`, modo greedy (`do_sample=False`), semilla y parada en fin de documento (`stop_at_eod`).
- Manejo de texto multilingüe limitado a inglés y francés.
- Copia de contexto local mediante ROSA (mecanismo de copia de sufijos).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta modo de razonamiento (thinking mode) ni capacidades matemáticas o de código verificadas.

## Casos de uso

- Investigación arquitectónica: inspeccionar y experimentar con un diseño tokenizer-free de nivel de byte con patching por entropía y tronco híbrido RWKV-7/atención, útil para estudiar alternativas a los tokenizadores BPE.
- Prototipado de modelos byte-level: servir como base para comparar el rendimiento de representaciones de byte frente a tokenizadores en tareas de generación de texto corto.
- Educación y divulgación: el cuaderno interactivo incluido permite explorar el funcionamiento interno del modelo en entornos Colab, Kaggle o Jupyter.
- Experimentos de decodificación: probar estrategias de muestreo (temperatura, top-p, top-k) sobre un modelo que emite bytes y analizar el efecto en la coherencia.
- Investigación sobre mecanismos de copia: evaluar el impacto de ROSA y de los embeddings de n-gramas hasheados en la coherencia local del texto generado.
- Pruebas de infraestructura: validar pipelines de inferencia en CPU con `transformers` y `trust_remote_code=True` sobre un modelo pequeño (0,7 GB de repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reportan resultados y que las salidas suelen ser incorrectas o incoherentes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 168,9 M de parámetros en fp32 el peso ronda los 0,67 GB, por lo que cabría en GPUs de consumo con holgura, aunque el código se ha probado principalmente en CPU.
- GPU recomendadas: no se especifican; `model.to("cuda")` está soportado por el código pero con menos pruebas que en CPU.
- Cabe en GPU de consumo: sí, por tamaño de parámetros, aunque no hay validación oficial de rendimiento en GPU.
- Opciones de despliegue: `transformers` (versiones 4.46 y 5.23 probadas) con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica que la velocidad está limitada por pasos secuenciales por byte a nivel de Python, no por FLOPs; se esperan entre unos pocos y ~10 bytes/s en un hilo de CPU, por lo que una muestra de 300 bytes tarda decenas de segundos en CPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (tokenizer-free, byte-level, híbridos RWKV) con datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un checkpoint de investigación temprano (paso 39.350, ~42 % del entrenamiento planificado); el autor advierte que las salidas suelen ser incorrectas o incoherentes.
- No debe usarse para aplicaciones que requieran información correcta ni en producción.
- No se han publicado benchmarks; no hay evidencia cuantitativa de calidad.
- Idiomas limitados a inglés y francés; no se documenta soporte de castellano.
- Contexto de solo 4.096 bytes, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Posible corte de caracteres multibyte al final de la generación; se recomienda decodificar con `errors="replace"`.
- La velocidad de inferencia es muy baja (bytes/s en CPU) por los pasos secuenciales por byte.
- Riesgo de sesgos y alucinaciones no evaluado; el autor no documenta análisis de sesgos.
- Licencia Apache-2.0 permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue real.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor.

## Enlaces

- Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5-Preview
- Cuaderno interactivo: `notebook.ipynb` en el repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
