# TheDrainFlorist/gemma-4-e4b-it-VQ-PLE

## Resumen

El modelo `TheDrainFlorist/gemma-4-e4b-it-VQ-PLE` es una cuantización vectorial (VQ) del modelo multimodal Gemma 4 E4B de Google, adaptada para ejecutarse en Apple Silicon mediante la librería MLX. Desarrollado por TheDrainFlorist, este artefacto sustituye la tabla de embeddings de 5,25 GiB del modelo 8-bit original de mlx-community por una versión vector-cuantizada a 5,75 bits por peso, manteniendo el resto de componentes (atención, MLPs, normas y torres de visión/audio) idénticos al artefacto de referencia. El resultado es un modelo más cercano a la precisión bf16 que su predecesor 8-bit, con 1 GiB menos de espacio en disco y 1,8 GB menos de memoria RAM pico, a costa de una ligera penalización en velocidad de decodificación y prefill.

La relevancia de este modelo radica en su enfoque selectivo: en lugar de cuantizar todo el modelo, se aplica VQ únicamente a la tabla de embeddings, que representa el 35% de los bytes del modelo y es la parte que mejor tolera esta técnica. Los experimentos del autor muestran que cuantizar los MLPs con VQ degrada significativamente la calidad, mientras que la tabla de embeddings cuantizada supera a su equivalente afín de 8-bit. El ajuste se realiza mediante k-means en el espacio de pesos, sin datos de calibración ni pasadas hacia adelante, en 154 segundos en un M3 Ultra. El artefacto es autocontenido e incluye su propio `model.py`, por lo que se carga con `mlx_lm` sin necesidad de código adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B) con torres de vision y audio |
| Parametros totales | 2.328.769.866 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Gemma 4 soporta hasta 256K, pero no se especifica para este artefacto) |
| Tipos de cuantizacion | 8-bit con VQ en tabla de embeddings (5,75 bits/peso) |
| Idiomas soportados | en (segun metadatos; el modelo base Gemma 4 soporta mas de 140 idiomas) |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B de Google, un transformer multimodal denso de aproximadamente 4,4 mil millones de parametros (aunque este artefacto reporta 2,33 mil millones en safetensors, posible discrepancia con el conteo oficial). Incluye torres de vision y audio ademas del modulo de lenguaje, y soporta entrada de imagen-texto y texto. El artefacto VQ-PLE no es un modelo entrenado desde cero, sino una cuantizacion posterior al entrenamiento: se parte del checkpoint 8-bit de mlx-community y se reemplaza la tabla de embeddings (5,25 GiB) por una version vector-cuantizada a 5,75 bits por peso, ajustada con k-means puro en el espacio de pesos contra los tensores bf16 originales. No se utilizo corpus de calibracion, pasadas hacia adelante ni destilacion. El autor verifico que los MLPs no toleran VQ a 5,75 bits (perdida de 20,8 mnats frente a 8,1 del 8-bit), por lo que se mantienen en 8-bit. La tabla de embeddings VQ se decodifica solo para las filas que toca cada lote, lo que reduce el uso de RAM al no materializar la tabla completa.

## Capacidades

- Generacion de texto y conversacion multimodal: acepta entradas de imagen y texto, y produce respuestas de texto (el pipeline declarado es `image-text-to-text`).
- Razonamiento y comprension: el modelo base Gemma 4 E4B incluye capacidades de razonamiento y un modo de pensamiento (Thinking Mode) segun la documentacion de Google, aunque no se ha verificado especificamente en este artefacto.
- Soporte de tool calling / function calling: no se menciona en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se menciona explicitamente, aunque el modelo base podria soportarlo; no hay evidencia en la model card.
- Capacidades multilingues: el artefacto declara solo ingles en sus metadatos, aunque el modelo base Gemma 4 soporta mas de 140 idiomas; no se ha probado el rendimiento multilingue de esta cuantizacion.
- Capacidades especiales: procesamiento de vision y audio (las torres se mantienen sin cambios respecto al artefacto 8-bit original, aunque la vision no fue re-evaluada en este trabajo).

## Casos de uso

- Despliegue local en Mac con Apple Silicon: al estar optimizado para MLX y requerir solo 7,2 GB de RAM pico en conversaciones cortas, es adecuado para ejecutarse en MacBooks con 16 GB o mas de memoria unificada, permitiendo un asistente multimodal privado sin conexion.
- Procesamiento de imagenes con descripcion y dialogo: gracias a su torre de vision, puede recibir fotografias o capturas y generar descripciones, responder preguntas sobre el contenido o mantener conversaciones contextuales sobre la imagen, util en aplicaciones de accesibilidad o archivado visual.
- Chatbot de atencion al cliente en entornos con restricciones de memoria: su menor huella de RAM frente al 8-bit convencional permite ejecutar el modelo en hardware modesto, manteniendo una calidad de respuesta estadisticamente indistinguible en pruebas literarias (litbench, p=0,45).
- Investigacion en cuantizacion y compresion de modelos: el artefacto sirve como caso de estudio de VQ selectiva sobre embeddings, mostrando que la sensibilidad a la cuantizacion varia por componente; puede usarse para reproducir experimentos de KL-divergencia y agreement con el modelo bf16.
- Generacion de texto creativo o literario en ingles: aunque el punto estimado en litbench es 3 puntos inferior al 8-bit, la diferencia es estadisticamente no significativa, por lo que puede usarse para redaccion, resumen o narracion con un ahorro de memoria.
- Prototipado rapido de aplicaciones multimodales en entornos academicos: al cargarse con `mlx_lm` sin flags especiales (a diferencia del artefacto 8-bit original que requiere `strict=False`), facilita la integracion en pipelines de investigacion o docencia.

## Benchmarks y rendimiento

Los datos de la model card comparan este artefacto con el modelo 8-bit de mlx-community (incumbent) en las mismas condiciones de medicion:

| Metrica | Este artefacto (VQ-PLE) | Incumbent 8-bit |
|---|---|---|
| Tamano en disco | 7,39 GiB | 8,38 GiB |
| KL a bf16 (corpus literario) | 7,451 mnats/token | 8,149 mnats/token |
| Top-1 agreement con bf16 | 95,70% | 95,70% |
| litbench (ciclico, generativo, n=104) | 81,73% | 84,62% |
| Decode | 77,4 tok/s | 84,2 tok/s |
| Prefill (prompt ~30 tokens) | 33% mas lento | linea base |
| Prefill (prompt 2k-8k tokens) | 13,5% mas lento | linea base |
| Memoria pico (chat corto) | 7,2 GB | 9,5 GB |

El autor indica que la diferencia en litbench no es estadisticamente significativa (prueba de McNemar pareada: 7 elementos discordantes, 5-2, p=0,45; error estandar ±3,7). La penalizacion de prefill se descompone en un coste fijo por llamada (~33% en prompts cortos) y un coste real independiente de la longitud (~13,5% a partir de 2k tokens). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 7,2 GB de memoria pico en conversaciones cortas (frente a 9,5 GB del 8-bit convencional). Para prompts largos (2k-8k tokens) la memoria aumentara, pero no se proporciona un valor exacto.
- GPU recomendadas: Apple Silicon (M-series) por su integracion con MLX; el ajuste se realizo en un M3 Ultra. No se mencionan GPUs de NVIDIA o AMD.
- Compatibilidad con GPU de consumo: si, en Macs con al menos 16 GB de memoria unificada (dado que el pico es 7,2 GB, se necesita margen para el sistema y el runtime).
- Opciones de despliegue: `mlx_lm.chat` (libreria MLX), compatible con `mlx_lm` estandar sin flags adicionales. Tambien puede desplegarse en clusters exo, con la precaucion de replicar los codebooks VQ en lugar de particionarlos (ver nota en limitaciones).
- Latencia y throughput: decode a 77,4 tok/s y prefill ~13,5% mas lento que el 8-bit a longitudes de trabajo (2k-8k tokens); los valores absolutos dependen de la maquina, pero las proporciones se mantienen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheDrainFlorist/gemma-4-e4b-it-VQ-PLE | 2,33B (reportado) | No disponible | 8-bit + VQ embeddings | gemma | HuggingFace |
| mlx-community/gemma-4-e4b-it-8bit | ~4,4B (base) | No disponible | 8-bit | gemma | HuggingFace |
| google/gemma-4-e4b-it (bf16) | ~4,4B | Hasta 256K (segun Google) | bf16 | gemma | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base. Frente al 8-bit convencional, el VQ-PLE ofrece menor tamano y RAM, con una KL mas cercana al bf16, pero con decode ~8% mas lento y prefill mas lento. Frente al bf16, la ventaja es la reduccion drastica de recursos, a costa de una perdida de fidelidad (KL de 7,45 mnats frente a 0 del bf16, aunque no se proporciona el valor de KL del bf16 en la tabla). No se dispone de comparaciones con otros modelos de tamano similar (por ejemplo, Llama 3.2 3B o Qwen2.5 4B) en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento: decode ~8% mas lento y prefill ~13,5% mas lento a longitudes de trabajo (hasta ~33% en prompts muy cortos) en comparacion con el 8-bit convencional. Si la aplicacion es sensible a la latencia, el 8-bit puede ser preferible.
- Calidad literaria: el punto estimado en litbench es 3 puntos inferior al incumbent, aunque la prueba pareada indica que la diferencia es ruido estadistico (p=0,45). Para casos de uso especificos de comprension lectora literaria, se recomienda medir el rendimiento propio.
- Vision y audio no re-evaluados: las torres de vision y audio se mantienen sin cambios respecto al artefacto 8-bit, pero no se realizaron pruebas de rendimiento de vision en este trabajo; podrian existir degradaciones no detectadas.
- Sesgos y alucinacion: no se proporcionan evaluaciones de sesgos ni de tasas de alucinacion para este artefacto. Como modelo derivado de Gemma 4, hereda los riesgos del modelo base, que Google documenta en su model card oficial.
- Restricciones de licencia: la licencia `gemma` de Google impone restricciones de uso comercial y de redistribucion; es necesario revisar los terminos completos antes de desplegar en produccion.
- Despliegue en clusters exo: los codebooks VQ deben replicarse en todos los nodos, no particionarse; el artefacto incluye una salvaguarda en `model.py` y se referencia el PR #2268 de exo para la correccion aguas arriba.
- Idiomas: aunque el modelo base soporta multiples idiomas, este artefacto declara solo ingles en sus metadatos; el rendimiento en otros idiomas no esta verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TheDrainFlorist/gemma-4-e4b-it-VQ-PLE
- Modelo base (Google): https://huggingface.co/google/gemma-4-E4B
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Ficha del modelo Gemma 4 E4B (gemma4.dev): https://gemma4.dev/models/gemma-4-e4b
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- PR de exo para replicacion de codebooks: https://github.com/exo-explore/exo/pull/2268
