# yukiworks/Qwen3.8-27B-heretic-NSFW-GGUF

## Resumen

Qwen3.8-27B-heretic-NSFW-GGUF es un conjunto de cuantizaciones GGUF del modelo yukiworks/Qwen3.8-27B-heretic-NSFW, un derivado de la familia Qwen3.8 de 27B de parametros sometido a un proceso de "abliteration" o decensura (etiquetado como heretic/uncensored) para eliminar los mecanismos de rechazo y moderacion del modelo original. El autor, yukiworks, publica exclusivamente los pesos cuantizados para llama.cpp, manteniendo el modelo base en BF16 como referencia separada.

El repositorio incluye cuatro cuantizaciones del modelo de texto (Q8_0, Q4_K_M, Q3_K_M y Q2_K) mas un proyector multimodal BF16 (mmproj) compartido por todas ellas, lo que confirma que el modelo base conserva capacidades de vision (pipeline image-text-to-text). El modelo cuenta con 26.895.998.464 parametros totales segun los safetensors del modelo base, es decir, aproximadamente 26,9B.

Su relevancia es acotada y muy especifica: cubre el nicho de despliegue local de un modelo multimodal de ~27B sin restricciones de contenido, con licencia Apache 2.0 y formatos listos para llama.cpp. No es un modelo de proposito general recomendable para produccion convencional, sino una variante experimental orientada a investigacion sobre alineacion, generacion sin filtros y ejecucion en hardware de consumo mediante cuantizacion agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.8; arquitectura exacta no especificada en la informacion) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tokenizer y chat template embebidos en cada GGUF de texto |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura (Qwen3.8-27B) y el pipeline image-text-to-text, se trata de un transformer multimodal con un codificador de imagen y un proyector hacia el modelo de lenguaje, coherente con la familia Qwen. El repositorio no documenta numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card unicamente indica que es un "custom Qwen3.8-27B model" y que ha pasado por un proceso de decensura (tags heretic, uncensored, decensored, abliterated). No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o tecnicas de abliteration concretas (por ejemplo, edicion de direcciones de rechazo en el espacio de activaciones). Las cuantizaciones se generan de forma independiente a partir de un GGUF intermedio en BF16 usando llama.cpp; el mmproj se mantiene en BF16 con tensores F32 donde el conversor lo exige.

## Capacidades

- Generacion de texto conversacional multi-turno, con chat template embebido en cada GGUF.
- Procesamiento de imagen junto con texto (image-text-to-text) mediante el mmproj BF16 compartido.
- Generacion sin filtros de contenido: el proceso de decensura elimina los rechazos del modelo alineado original.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.8 (no verificados de forma independiente en la informacion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo decensurado con las del Qwen3.8 original permite estudiar que comportamientos se eliminan con la abliteration y como afecta a la coherencia general.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (16,22 GB) permite ejecutar un modelo multimodal de ~27B en GPUs con 24 GB de VRAM, algo inviable en BF16.
- Generacion creativa sin restricciones: escritura de ficcion adulta o narrativa con tematicas que el modelo alineado rechazaria, usando Q8_0 para maximizar calidad.
- Procesamiento de imagenes con descripcion libre: carga del mmproj BF16 junto con cualquier cuantizacion de texto para tareas de captioning o VQA sin moderacion de salida.
- Experimentacion con llama.cpp: banco de pruebas para medir degradacion de calidad entre Q8_0, Q4_K_M, Q3_K_M y Q2_K sobre un mismo modelo multimodal.
- Entornos aislados de evaluacion de riesgos: analisis de como modelos sin salvaguardas responden a prompts adversariales, en infraestructura sin exposicion a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto): Q8_0 ~28,6 GB; Q4_K_M ~16,2 GB; Q3_K_M ~13,0 GB; Q2_K ~10,1 GB. Anadir ~0,93 GB del mmproj BF16 si se usa entrada de imagen, mas KV cache y overhead del runtime.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M; GPUs de 12-16 GB para Q3_K_M y Q2_K.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M y en GPUs de 12 GB con Q3_K_M o Q2_K, asumiendo contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier frontend compatible con GGUF; los tags indican endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-NSFW-GGUF | ~26,9B | no disponible | Si (mmproj BF16) | Apache 2.0 | GGUF |
| Qwen3.8-27B-heretic-NSFW (base) | ~26,9B | no disponible | Si | Apache 2.0 | safetensors/BF16 |
| Modelo Qwen3.8-27B original (alineado) | ~26,9B | no disponible | Si | no disponible | no disponible |
| Otras variantes abliterated de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de especificaciones detalladas de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado: no incorpora salvaguardas de contenido; puede generar material NSFW, ofensivo o danino. El tag not-for-all-anchored audiences y la advertencia de la model card lo confirman.
- Riesgo elevado de alucinacion y de respuestas factualmente incorrectas, especialmente tras la abliteration, que puede degradar la coherencia del modelo original.
- Las cuantizaciones Q3_K_M y Q2_K introducen perdida de calidad adicional sobre un modelo ya modificado; no recomendables para tareas que requieran precision.
- Idiomas soportados y longitud de contexto no documentados: no se puede garantizar comportamiento multilingue ni contextos largos sin pruebas propias.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el contenido generado puede infringir normativas de moderacion, proteccion de menores o legislacion sobre material sexual explicito; la responsabilidad recae en el desplegador.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas.
- Repositorio con muy poca traccion (739 descargas, 1 like) y actualizado una sola vez: sin garantias de mantenimiento ni soporte.
- El pipeline image-text-to-text requiere cargar el mmproj por separado; un uso solo de texto sin el mmproj puede no reflejar el comportamiento completo del modelo.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/yukiworks/Qwen3.8-27B-heretic-NSFW-GGUF
- Modelo base: https://huggingface.co/yukiworks/Qwen3.8-27B-heretic-NSFW
- llama.cpp: https://github.com/ggml-org/llama.cpp
