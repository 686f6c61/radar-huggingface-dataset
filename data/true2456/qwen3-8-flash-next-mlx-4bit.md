# True2456/Qwen3.8-Flash-Next-MLX-4bit

## Resumen

Qwen3.8-Flash-Next MLX 4-bit es una cuantización afín en formato MLX del modelo Qwen/Qwen3.8-Flash-Next (familia `qwen4_exp`), publicada por el usuario True2456. No es un modelo entrenado desde cero: los pesos, la arquitectura y el tokenizer proceden de Qwen, mientras que la cuantización y el empaquetado para Apple Silicon son aportaciones de este repositorio. Su función declarada es alimentar la ruta de servicio "Flash-Next" del proyecto Rindi en Apple Silicon, donde los expertos MoE, el `lm_head` y el drafter MTP residen en memoria con precisión de 4 bits.

La cuantización usa tamaño de grupo 64 por defecto, con precisiones distintas por familia de tensores: 4 bits para las proyecciones `gate_up` y `down` de los expertos, 8 bits para las proyecciones GDN de entrada y salida, la atención, los embeddings y el MTP, y 16 bits para el router y el residual con puerta. El conjunto de pesos del modelo de lenguaje ronda los 71 GB, a los que se suman 1,4 GB del drafter MTP y 41 MB del indexador QSA; la ficha de HuggingFace indica, en cambio, un tamaño de repositorio de 2,5 GB, discrepancia que conviene verificar antes de descargar.

El interés del repositorio es doble. Por un lado, documenta un patrón de despliegue específico de Apple Silicon, con cuantización por capas, decodificación especulativa mediante un drafter MTP separado y una ruta híbrida que explota la ANE. Por otro, sirve como referencia negativa: no es un sustituto directo de los modelos que carga el paquete `mlx-lm` estándar, ya que exige un runtime con soporte para `qwen4_exp`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con capas de atención y capas GDN (híbrida); familia `qwen4_exp` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX afín, grupo 64 por defecto; 4 bits (expertos `gate_up`/`down`), 8 bits (proyecciones GDN in/out, atención, embeddings, MTP), 16 bits (router y residual con puerta) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors con cuantización MLX; incluye tokenizer y `chat_template.jinja` |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Librería | mlx |
| Tamaño del repositorio | 2,5 GB según la ficha de HuggingFace; la model card describe ~71 GB de pesos |
| Descargas / likes | 57 / 0 |
| Fecha de creación / actualización | 14-09-2026 / 14-09-2026 |

Ficheros incluidos en el repositorio:

| Ruta | Función | Tamaño |
|---|---|---|
| `model.safetensors` | Pesos del modelo de lenguaje (expertos 4 bits gs64; GDN, atención y embeddings mayoritariamente 8 bits) | ~71 GB |
| `mtp/mtp-4bit.safetensors` | Drafter MTP | ~1,4 GB |
| `model-indexer.safetensors` | Indexador QSA | ~41 MB |
| `vision/` | Torre de visión (no usada por el servidor de texto para ANE) | ~856 MB |
| Tokenizer + `chat_template.jinja` | Plantilla de chat de Qwen con niveles `low`, `medium` y `xhigh` | no disponible |
| `ngram_index.json` | Constantes de hash del PLE | no disponible |
| Tabla de embeddings n-gram | Tabla de ~95 GB, **no incluida** | — |

## Arquitectura y entrenamiento

No hay información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de RLHF o DPO y cualquier otra fase de alineamiento figuran como no disponibles. Lo que se puede reconstruir a partir de los overrides de `config.json` y de la estructura del repositorio es una arquitectura mixta de expertos con capas de atención y capas GDN, más varios componentes auxiliares: un drafter MTP (multi-token prediction) que la ruta de servicio emplea como decodificador especulativo, un indexador QSA de 41 MB, un mecanismo PLE con tabla de embeddings n-gram de ~95 GB y una torre de visión de ~856 MB.

La innovación técnica de este repositorio concreto es la receta de cuantización, no la arquitectura. Se aplica cuantización afín con grupo 64 por defecto y una política de precisión escalonada: los tensores con mayor impacto en la calidad (router, residual con puerta) se mantienen en 16 bits, los componentes sensibles a la deriva numérica en 8 bits, y los expertos —que concentran el grueso de los parámetros— bajan a 4 bits. La conversión se realizó sobre un M5 Max a partir del checkpoint BF16 oficial. La model card advierte explícitamente de que esta conversión no debe mezclarse con otras que hayan plegado el término `1+w` de `Qwen4ExpRMSNorm` dentro de las ganancias guardadas, porque esas mezclas generan ruido.

## Capacidades

- Generación de texto y uso conversacional: el repositorio declara el pipeline `text-generation` y la etiqueta `conversational`, con plantilla de chat de Qwen.
- Control del esfuerzo de razonamiento: `chat_template.jinja` define los niveles `low`, `medium` y `xhigh`, lo que sugiere modos de razonamiento configurables; no se documenta el comportamiento exacto de cada nivel.
- Decodificación especulativa: incluye un drafter MTP independiente de ~1,4 GB pensado para acelerar la generación.
- Capacidades multimodales: el repositorio contiene una torre de visión de ~856 MB, pero la model card indica que la ruta de servidor de texto para ANE no la utiliza; no se documenta si la cuantización preserva el rendimiento de visión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Recuperación mediante embeddings n-gram (PLE): opcional, requiere una tabla de ~95 GB que no se distribuye; sin ella el modelo funciona con un fallback de ceros.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el banco de 4 bits está diseñado para mantener residentes los expertos MoE en memoria unificada de un M5 con ~128 GB, lo que permite ejecutar un modelo de gran tamaño sin salir al cloud.
- Servicio conversacional de baja latencia en aplicaciones de escritorio macOS: el drafter MTP separado habilita decodificación especulativa, de modo que el cuello de botella pasa a ser el ancho de banda de memoria y no la latencia por token.
- Sustitución del checkpoint BF16 en la ruta Rindi Flash-Next: reduce la huella de memoria del modelo de lenguaje a cambio de una degradación de calidad que no está cuantificada en la información disponible.
- Prototipado de agentes con esfuerzo de razonamiento ajustable: los niveles `low`, `medium` y `xhigh` de la plantilla de chat permiten intercambiar coste por profundidad de razonamiento en la misma instalación.
- Investigación sobre cuantización por capas: el repo documenta la receta exacta (4/8/16 bits por familia de tensores) y puede usarse como punto de partida para experimentos de ablación frente al BF16.
- Investigación sobre decodificación especulativa: el drafter MTP se distribuye como fichero independiente, lo que facilita medir su tasa de aceptación y su impacto en el throughput sin tocar el modelo principal.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse íntegramente en hardware local, es apto para flujos donde los datos no pueden salir de la organización, siempre que se respeten los términos de la licencia Qwen Community 1.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco cuantifica la degradación respecto al checkpoint BF16. El único dato indirecto sobre calidad es la advertencia de que ejecutar sin la tabla n-gram de ~95 GB (fallback de ceros para el PLE) supone una pérdida de calidad que el autor describe como "calidad opcional, no necesaria para cargar", sin cifras.

## Requisitos de hardware

- Plataforma: Apple Silicon obligatoriamente. Los pesos están en formato MLX y no son utilizables en CUDA.
- Ruta ANE híbrida: el autor indica que la ruta que consume este banco funciona actualmente en M5 (`h17`) con ~128 GB de memoria unificada.
- Huella de pesos: ~71 GB (modelo de lenguaje) + 1,4 GB (MTP) + 41 MB (indexador) + 856 MB (visión, opcional) ≈ 73 GB, más el coste del runtime y la caché KV.
- Tabla PLE: la tabla n-gram de ~95 GB no está incluida; con el fallback de ceros se evita ese requisito de memoria, a costa de calidad no medida.
- GPU consumer: no cabe en una RTX 4090 (24 GB) ni en GPUs de 48 GB. Tampoco en Macs de 16, 32 o 64 GB de memoria unificada con esta configuración de pesos.
- Runtime: se necesita un checkout local de `mlx-lm` o `mlx-vlm` que implemente `qwen4_exp`; no funciona con un wheel antiguo de PyPI ni como reemplazo directo en `mlx-lm` estándar.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan pesos MLX, por lo que no son vías válidas sin una conversión previa a GGUF u otro formato. Los grafos MIL para ANE no están en este repositorio y se publicarán por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Huella de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next MLX 4-bit (este repositorio) | no disponible | no disponible | Mixta 4/8/16 bits, grupo 64 | ~71 GB + 1,4 GB MTP | qwen-community-1.0 | HuggingFace; exige runtime con `qwen4_exp` |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | BF16 | no disponible | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next, grafos MIL para ANE (M5/`h17`) | no disponible | no disponible | no disponible | no disponible | qwen-community-1.0 | Anunciado para publicación separada; no disponible |

No se han identificado en la información proporcionada modelos comparables de otros desarrolladores con datos publicados (parámetros, contexto o benchmarks) que permitan una comparación cuantitativa. La búsqueda web realizada no devolvió resultados relacionados con este modelo.

## Limitaciones y advertencias

- No es un reemplazo directo de `mlx-lm` estándar: requiere un runtime que implemente `qwen4_exp`. Cargarlo con una versión sin soporte fallará o producirá resultados incorrectos.
- Exclusivo de Apple Silicon: no hay ruta CUDA ni ROCm documentada para estos pesos.
- Discrepancia de tamaño sin aclarar: la ficha de HuggingFace declara 2,5 GB de repositorio, mientras que la model card describe un fichero de pesos de ~71 GB.
- La tabla n-gram de ~95 GB no está incluida; el modelo opera con un fallback de ceros para el PLE, lo que implica una pérdida de calidad no cuantificada.
- Riesgo de conversión defectuosa: no se deben mezclar estos ficheros con conversiones que hayan plegado el término `1+w` de `Qwen4ExpRMSNorm` en las ganancias guardadas, ya que generan ruido.
- Licencia Qwen Community 1.0: permite redistribuir derivados, pero los productos comerciales de MaaS y de asistencia a la programación tienen términos adicionales que hay que revisar antes de un uso en producción.
- Ausencia total de benchmarks: no se puede estimar la degradación frente al BF16 ni comparar con alternativas.
- Idiomas soportados y longitud de contexto no documentados.
- La torre de visión está incluida pero no la usa la ruta de servidor de texto para ANE; sus capacidades reales tras la cuantización no se han verificado.
- Sesgos conocidos: no disponible. No hay información específica sobre sesgos en la model card.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no evaluado ni cuantificado en esta publicación.
- Madurez baja: 57 descargas y 0 likes, con el repositorio actualizado poco más de una hora después de su creación, lo que apunta a una publicación apresurada y con poca validación externa.
- Requisito de memoria muy elevado (~128 GB de memoria unificada en la ruta M5), lo que excluye la mayor parte del parque de equipos Apple.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/True2456/Qwen3.8-Flash-Next-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio Rindi (ruta de servicio Flash-Next): https://github.com/True2456/Rindi
- Licencia del repositorio: `LICENSE` en la raíz del repositorio de HuggingFace (Qwen Community License 1.0)
- Resultados de la búsqueda web: no se encontraron enlaces relevantes para este modelo. Los resultados devueltos corresponden a páginas de Google DeepMind (Gemini Omni, WeatherNext 3, Gemini 3.5 Transcribe, Gemini 3.8 Flash Cyber, Gemini Image) y no guardan relación con el modelo analizado.
