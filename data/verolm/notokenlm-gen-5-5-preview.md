# VeroLM/NoTokenLM-Gen-5.5-Preview

## Resumen

NoTokenLM-Gen-5.5-Preview es un checkpoint intermedio de investigación de un modelo de lenguaje sin tokenizador, desarrollado por VeroLM. A diferencia de los modelos basados en BPE o SentencePiece, opera directamente sobre bytes UTF-8: la entrada y la salida son bytes crudos (0–255), sin vocabulario ni tokenizador asociado. Para evitar el coste de un paso completo de forward por cada byte, el modelo agrupa los bytes en *patches* de longitud variable (unos 6 bytes de media) y ejecuta el tronco principal una sola vez por patch.

El modelo tiene 168,9 millones de parámetros totales, incluyendo una tabla de embeddings hasheados de n-gramas de 19,9 M y un patcher de entropía congelado de 4,5 M. Su ventana de contexto es de 4.096 bytes, que coincide con la ventana de entrenamiento. La arquitectura combina capas RWKV-7 con atención con compuerta en un tronco híbrido de 20 capas y dimensión 768, más un codificador y un decodificador locales de dimensión 256.

Es relevante ahora porque explora una vía poco común en modelos open source: eliminar por completo el tokenizador manteniendo un coste de inferencia razonable mediante segmentación por entropía y mecanismos de copia basados en sufijos (ROSA). No obstante, el propio autor advierte de que se trata de un checkpoint de mid-training (paso 39.350, aproximadamente el 42 % del entrenamiento previsto), sin benchmarks publicados y con salidas a menudo incorrectas o incoherentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida sin tokenizador: codificador local convolucional + patching por entropía + tronco de 20 capas (5 × [RWKV-7, atención con compuerta, RWKV-7, RWKV-7]) con SwiGLU + decodificador local de 4 bloques |
| Parametros totales | 168.862.668 (incluye 19,9 M de tabla de embeddings hasheados y 4,5 M de patcher de entropía congelado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 bytes |
| Tipos de cuantizacion | No disponible (el autor recomienda ejecutar en float32) |
| Idiomas soportados | Inglés y francés (con mezcla de datos sesgada al inglés, más matemáticas y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`; incluye código de arquitectura personalizado) |

## Arquitectura y entrenamiento

El flujo de cómputo parte de los bytes UTF-8, que pasan por un embedding de byte, un embedding hasheado de n-gramas (órdenes 3–8, solo con contexto pasado) y características de coincidencia de sufijos ROSA. A continuación, un codificador local (dos convoluciones y atención con ventana, d = 256) procesa la secuencia de bytes. Un patcher de entropía congelado, basado en un pequeño modelo convolucional causal de bytes, decide dónde empieza cada patch: cuando la entropía predicha supera un umbral calibrado (`theta`, en `config.json`), se abre un nuevo patch. Como los límites dependen solo de bytes ya vistos, son reproducibles en generación.

El tronco opera sobre patches cerrados con 5 bloques de [RWKV-7, atención con compuerta sin posición (NoPE, con QK-norm), RWKV-7, RWKV-7], dimensión 768 y SwiGLU. Solo los patches cerrados pasan al decodificador local (4 bloques de atención con ventana, d = 256), que emite logits de 256 vías para el siguiente byte. Esta caché de estado del tronco avanzada un paso por patch es lo que abarata la generación. ROSA aporta un mecanismo de copia: un autómata de sufijos en línea encuentra la coincidencia anterior más larga del sufijo actual y alimenta el byte siguiente predicho y la longitud de coincidencia al codificador, además de un pequeño refuerzo de logits en la salida. También se emplea DeepEmbed (escalado por byte de las activaciones de la FFN local).

Los datos de entrenamiento son una mezcla de texto sesgada al inglés, con matemáticas, código y francés. El checkpoint publicado es de EMA en fp32, en el paso 39.350. No se detalla el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto a nivel de byte, sin tokenizador, con decodificación UTF-8 directa.
- Soporte de generación con `temperature`, `top_k`, `top_p`, decodificación greedy y semilla fija.
- Parada automática al emitir el byte 0 (fin de documento).
- Mecanismo de copia vía ROSA para reproducir secuencias locales previamente vistas.
- Capacidades multilingües limitadas a inglés y francés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre modelos sin tokenizador: sirve para estudiar el patching por entropía, el tronco híbrido RWKV-7/atención y el mecanismo ROSA en un entorno reproducible con `transformers`.
- Experimentación con segmentación adaptativa: permite analizar cómo varía la longitud de patch (media de 6 bytes, máximo 16) según la entropía del texto y su efecto en el coste de inferencia.
- Prototipado de decodificación byte a byte: útil para validar pipelines que necesitan trabajar con bytes crudos, por ejemplo en dominios con alfabetos poco frecuentes o ruido binario.
- Estudio de mecanismos de copia: ROSA permite investigar cómo un autómata de sufijos en línea mejora la reproducción de secuencias locales, comparable en espíritu a las ideas de RWKV-8.
- Docencia y divulgación: el cuaderno interactivo (`notebook.ipynb`) facilita demostrar arquitecturas híbridas y generación sin vocabulario en clase o talleres.
- Evaluación comparativa de alternativas a BPE: sirve como línea base para medir ventajas e inconvenientes de eliminar el tokenizador frente a modelos pequeños basados en tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reportan benchmarks y que las salidas suelen ser incorrectas o incoherentes.

## Requisitos de hardware

- VRAM estimada: con 168,9 M de parámetros en fp32, los pesos ocupan aproximadamente 0,68 GB; en fp16 serían unos 0,34 GB. El autor recomienda ejecutar en float32.
- GPU recomendadas: no se especifican; el código soporta `model.to("cuda")`, aunque se ha probado menos que en CPU.
- Cabe en cualquier GPU consumer con al menos 1–2 GB de VRAM libre, así como en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el cuello de botella es la ejecución secuencial a nivel de byte en Python, no los FLOPs. Se estiman entre unos pocos y 10 bytes/s en un hilo de CPU, por lo que una muestra de 300 bytes tarda decenas de segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Estado |
|---|---|---|---|---|---|
| NoTokenLM-Gen-5.5-Preview | 168,9 M | 4.096 bytes | No (byte-level) | Apache-2.0 | Preview de mid-training |
| Modelos pequeños tipo GPT-2 small | ~124 M | 1.024 tokens | Sí (BPE) | MIT | Modelo finalizado |
| Modelos tipo RWKV pequeños | ~169 M | Variable | Sí (BPE) | Apache-2.0 | Modelo finalizado |

No se dispone de datos de rendimiento comparables para NoTokenLM-Gen-5.5-Preview, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. No se han identificado alternativas sin tokenizador de tamaño similar con benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint de mid-training (paso 39.350, ~42 % del entrenamiento previsto), no un modelo finalizado.
- El autor advierte de que las salidas son a menudo incorrectas o incoherentes y que no debe usarse para información que requiera corrección.
- Riesgo elevado de alucinación, coherente con el estado temprano del entrenamiento.
- Contexto limitado a 4.096 bytes, inferior al de muchos modelos pequeños basados en tokens.
- Idiomas limitados a inglés y francés, con sesgo hacia el inglés.
- Puede producir caracteres multibyte truncados al final de la generación; se recomienda decodificar con `errors="replace"`.
- La licencia Apache-2.0 permite uso comercial, pero el estado de preview y la falta de benchmarks desaconsejan su uso en producción.
- La inferencia es lenta por el procesamiento secuencial a nivel de byte en Python.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5-Preview
- Cuaderno interactivo: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5-Preview/blob/main/notebook.ipynb
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
