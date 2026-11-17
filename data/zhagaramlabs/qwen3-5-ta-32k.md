# zhagaramlabs/qwen3.5-ta-32k

## Resumen

`zhagaramlabs/qwen3.5-ta-32k` es un tokenizer para tamil construido por Zhagaram Labs, un laboratorio sin ánimo de lucro dedicado a IA abierta en tamil. No es un modelo de lenguaje: es una extensión del vocabulario de Qwen3.5 que añade 32.000 merges BPE aprendidos sobre texto web en tamil, con el objetivo de reducir drásticamente el coste de tokenización de ese idioma. El tokenizer base de Qwen3.5 dedica 4,13 tokens por palabra en tamil; esta versión baja a 1,53, una reducción del 63%.

El artefacto mantiene intactos los 248.077 tokens originales de Qwen3.5 (incluidos sus 33 tokens especiales y su chat template) y añade los nuevos en el rango de ids 248.077 a 280.076. Cualquier texto sin tamil recibe exactamente los mismos ids que el tokenizer original, con una única excepción documentada (la palabra `Delhi`). Está publicado bajo licencia Apache 2.0 y es compatible con `transformers` sin código remoto.

Su relevancia es práctica: el tamil es un idioma con escritura abugida y morfología aglutinante que los tokenizers entrenados mayoritariamente en inglés fragmentan de forma muy ineficiente. Reducir tokens por palabra a menos de la mitad implica menos coste de inferencia, menor latencia y ventanas de contexto efectivas más largas para el mismo presupuesto de tokens. El autor documenta además un experimento de continuación de preentrenamiento con Qwen3.5-0.8B-Base para validar la extensión, aunque no publica esos pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE byte-level (extensión de vocabulario sobre Qwen3.5) |
| Parametros totales | no disponible (no es un modelo; es un tokenizer) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo Qwen3.5 al que se aplique) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | tamil (ta), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ficheros de tokenizer de `transformers` (vocab y merges); sin safetensors ni GGUF |
| Tamano del vocabulario | 280.077 tokens (248.077 originales + 32.000 nuevos) |
| Merges nuevos | 32.000, añadidos tras los 247.587 merges originales de Qwen3.5 |
| Normalización | NFC |
| Pre-tokenizer | el de Qwen3.5 |
| Librería | transformers (verificado con 4.46.3, 4.57.1 y 5.22.1) |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El tokenizer parte del vocabulario y las reglas de Qwen3.5 y realiza una extensión puramente aditiva. Los 248.077 tokens originales conservan sus ids y sus flags especiales, y los 247.587 merges originales mantienen su orden y prioridad. Sobre esa base se aprendieron 32.000 merges nuevos exclusivamente con palabras en tamil: se segmentó texto web en tamil con el pre-tokenizer propio de Qwen, se retuvieron las palabras con más de la mitad de caracteres tamil y se continuó el BPE de Qwen sobre sus propios tokens de esas palabras. Cada merge nuevo produce un token nuevo, con ids de 248.077 a 280.076.

La consecuencia de ese diseño es que los nuevos tokens solo pueden activarse en texto que contenga tamil, salvo una excepción: `Delhi` (id 273.964), aprendida de formas como `Delhiயில்`. En textos sin tamil el comportamiento es idéntico al de Qwen3.5, lo que facilita la sustitución sin regresiones en inglés, código o tamil romanizado. La normalización es NFC y cualquier texto decodifica de vuelta a su forma NFC.

El autor documenta además un procedimiento de adaptación de modelos: `resize_token_embeddings` hasta 280.077 con `mean_resizing=False`, inicialización de cada fila nueva como la media de las filas de Qwen correspondientes a los fragmentos que reemplaza, y escalado del update de las filas nuevas (×10 respecto al paso del optimizador) durante el entrenamiento, dado que la matriz de embeddings está atada a la capa de salida y no puede separarse en un grupo de learning rate propio. El experimento de continuación de preentrenamiento se hizo sobre Qwen3.5-0.8B-Base con contexto 2.048, batch 256, learning rate 1e-4, una semilla por rama, y un corpus por bytes del 79% tamil (web, Wikipedia y Project Madurai), 16% inglés, 4% Python y 2% tamil romanizado. La métrica de comparación es bits por byte, independiente de la tokenización.

## Capacidades

- Tokenización eficiente de tamil: 1,53 tokens por palabra en texto web tamil retenido, frente a 4,13 del tokenizer original de Qwen3.5.
- Reducción de fronteras de token dentro de una letra tamil: del 63,2% al 7,8% de las palabras en el conjunto `fresh.web`.
- Compatibilidad total con el vocabulario original: los 248.077 ids de Qwen3.5 se conservan sin cambios, incluidos tokens especiales y chat template.
- Preservación del comportamiento en inglés: mismos ids, 0,2246 tokens por byte, idéntico al original.
- Preservación del comportamiento en tamil romanizado: mismos ids, 0,3745 tokens por byte.
- Mejora marginal en código: 0,2720 tokens por byte frente a 0,2901, en un conjunto donde 17 de 27 ficheros contienen tamil.
- Sin código remoto: carga directa con `AutoTokenizer` en `transformers`.
- No incluye capacidades de generación, razonamiento, tool calling ni agentes por sí mismo; estas dependen del modelo Qwen3.5 sobre el que se aplique.

## Casos de uso

- Reducción de coste de inferencia en producción para tamil: al pasar de 4,13 a 1,53 tokens por palabra, un mismo documento tamil consume aproximadamente un 63% menos de tokens de entrada, lo que reduce directamente el coste por petición y el uso de caché KV en despliegues con Qwen3.5.
- Ampliación efectiva de la ventana de contexto para tamil: con el mismo límite de tokens, un modelo que use este tokenizer puede procesar entre 2,5 y 2,7 veces más texto tamil que con el tokenizer original, útil en resumen de documentos largos, análisis de contratos o corpus periodísticos.
- Ajuste fino de modelos Qwen3.5 para tamil: el procedimiento documentado de `resize_token_embeddings` con inicialización por media de piezas y escalado del update permite adaptar checkpoints existentes con un coste de entrenamiento menor al no tener que aprender la tokenización desde cero.
- Búsqueda y recuperación aumentada (RAG) sobre corpus tamil: la reducción de tokens por palabra abarata la indexación y permite incluir más fragmentos por consulta dentro del mismo presupuesto de contexto, mejorando la cobertura de recuperación.
- Procesamiento de literatura tamil clásica y contemporánea: en el conjunto de líneas de Project Madurai la reducción es del 55% (1,934 frente a 4,344 tokens por palabra), lo que hace viable el análisis a escala de corpus literarios con modelos de contexto moderado.
- Pipelines mixtos tamil-inglés: al conservar exactamente los ids de Qwen3.5 para texto sin tamil, el tokenizer puede desplegarse en sistemas bilingües sin recalibrar prompts, plantillas de chat ni umbrales de longitud en la parte inglesa.
- Evaluación de eficiencia de tokenizers para lenguas dravídicas: sirve como referencia reproducible para comparar vocabularios (Agaram 64k, Ezhuthu 64k) con métricas de tokens por palabra y fronteras dentro de letra sobre conjuntos retenidos.

## Benchmarks y rendimiento

Resultados de tokenización publicados por el autor. Cada conjunto de prueba tiene 2.000 o 1.000 pasajes retenidos; el conjunto de código tiene 27 ficheros. Menos tokens es mejor.

| Metrica | Qwen3.5 original | Este tokenizer |
|---|---|---|
| fresh.web, tokens por palabra | 4,132 | 1,535 (−63%) |
| D4.web, tokens por palabra | 4,276 | 1,670 (−61%) |
| D4.literature, tokens por palabra | 4,344 | 1,934 (−55%) |
| fresh.web, palabras tamil con frontera de token dentro de una letra | 63,2% | 7,8% |
| Inglés, tokens por byte | 0,2246 | 0,2246 (mismos ids) |
| Tamil romanizado, tokens por byte | 0,3745 | 0,3745 (mismos ids) |
| Código, tokens por byte | 0,2901 | 0,2720 |

Comparación en `fresh.web` con otros tokenizers tamil, según la tabla publicada en la model card de Ezhuthu: este tokenizer (1,532–1,535 tokens por palabra) queda ligeramente por delante de Agaram 64k (1,532) y por delante de Ezhuthu 64k (1,656), con más de cuatro veces su vocabulario.

El autor reporta además un experimento de continuación de preentrenamiento de Qwen3.5-0.8B-Base comparando ambos tokenizers con la misma cantidad de tokens y midiendo bits por byte en `fresh.web`. La tabla de resultados está truncada en la información disponible, por lo que no se reproducen cifras de bits por byte. El autor indica que, con el mismo paso de optimizador para todas las filas, el modelo extendido quedaba por detrás del original, y que el escalado ×10 del update de las filas nuevas corrige ese efecto.

## Requisitos de hardware

- VRAM para el tokenizer: despreciable; el repositorio ocupa 0,0 GB y el vocabulario de 280.077 tokens no requiere GPU.
- VRAM para inferencia: depende exclusivamente del modelo Qwen3.5 al que se aplique, no del tokenizer. No hay datos publicados en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada; vienen determinadas por el checkpoint Qwen3.5 elegido.
- GPU de consumo: no aplica al tokenizer; aplica al modelo base.
- Opciones de despliegue: carga mediante `AutoTokenizer` de `transformers`; el resto de la pila (vLLM, llama.cpp, Ollama, TGI) depende de si soporta la sustitución de tokenizer y el vocabulario ampliado en el checkpoint correspondiente, extremo no documentado en la información disponible.
- Latencia y throughput: no disponibles. El efecto indirecto esperado es una reducción de hasta el 63% en tokens de entrada para texto tamil, con la consiguiente bajada de coste y latencia en el modelo que lo use.
- Requisito de entrenamiento: para usar el tokenizer con un modelo Qwen3.5 es necesario ampliar la matriz de embeddings a 280.077 filas y entrenar las filas nuevas; el autor no publica los pesos resultantes.

## Comparativa con modelos similares

Comparación con otros tokenizers para tamil. Los datos de Agaram y Ezhuthu proceden de la tabla citada en la model card de Ezhuthu.

| Tokenizer | Vocabulario | Tokens por palabra en fresh.web | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.5-ta-32k (este) | 280.077 (32.000 nuevos) | 1,535 | Apache 2.0 | Hugging Face |
| Agaram 64k | 64.000 | 1,532 | no disponible | Hugging Face |
| Ezhuthu 64k | 64.000 | 1,656 | no disponible | Hugging Face |
| Qwen3.5 original | 248.077 | 4,132 | Apache 2.0 (heredada) | Hugging Face |

La ventaja frente a Agaram y Ezhuthu no es solo la ratio de tokens por palabra, sino la compatibilidad directa con el ecosistema Qwen3.5: conserva ids, merges, tokens especiales y chat template, lo que permite sustituirlo en un checkpoint existente sin reentrenar desde cero. Como contrapartida, su vocabulario es más de cuatro veces mayor, lo que incrementa el tamaño de la matriz de embeddings del modelo resultante.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni razona. Requiere un checkpoint Qwen3.5 con embeddings ampliados y entrenados; los pesos de Qwen3.5 originales no tienen filas para los ids nuevos (a partir de 248.320 quedan fuera de su matriz de embeddings).
- El autor no publica los pesos del modelo extendido entrenado con Qwen3.5-0.8B-Base, por lo que no hay un checkpoint listo para usar con este tokenizer.
- Sesgos: el vocabulario se aprendió de texto web en tamil, con la distribución y los sesgos de ese corpus; no se documenta ningún filtrado de contenido más allá del criterio de mayoría de caracteres tamil.
- Riesgo de alucinación: no aplica al tokenizer, sino al modelo al que se acople; no se han publicado evaluaciones de calidad generativa del modelo extendido.
- Cobertura incompleta: un 7,8% de las palabras tamil en `fresh.web` siguen teniendo una frontera de token dentro de una letra; el autor sospecha que son palabras no cubiertas por los nuevos merges que caen en las piezas originales de Qwen, pero no lo ha verificado.
- Excepción en texto sin tamil: `Delhi` (id 273.964) puede tokenizarse de forma distinta a Qwen3.5 cuando no va precedida de espacio (inicio de texto o línea, tras dígito, comilla doble o la mayoría de puntuación). Con espacio inicial, guion, barra, apóstrofo o paréntesis el comportamiento es idéntico.
- Integración en servidores de inferencia: no se documenta soporte en vLLM, TGI, llama.cpp u Ollama para este vocabulario ampliado; habría que verificarlo por despliegue.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene revisar también los términos del checkpoint base que se utilice.
- El repositorio no tiene descargas ni likes y el pipeline no está definido; es un artefacto reciente y sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/zhagaramlabs/qwen3.5-ta-32k
- Zhagaram Labs: https://zhagaramlabs.com
- Model card de Ezhuthu 64k (referencia comparativa): https://huggingface.co/zhagaramlabs/ezhuthu-64k
