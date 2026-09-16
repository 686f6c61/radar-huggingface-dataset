# zhangsongbo365/Qwen3-VL-Embedding-2B-onnx

## Resumen

Qwen3-VL-Embedding-2B-onnx es una exportación a ONNX del modelo multimodal de embeddings Qwen/Qwen3-VL-Embedding-2B, publicada por el usuario zhangsongbo365. No es un modelo nuevo: es una conversión de formato orientada a inferencia en producción sin dependencia de PyTorch, dividida en dos grafos independientes (un encoder de visión y un decoder transformer) más los parámetros auxiliares de RoPE, tokenizador y tabla de embeddings. El repositorio ocupa 9,9 GB e incluye dos variantes de ventana temporal, `temporal16/` y `temporal32/`, que procesan 16 y 32 fotogramas brutos respectivamente a 768x768 píxeles por fotograma.

El interés técnico de esta ficha está en las correcciones aplicadas sobre el pipeline de exportación previo de PIA-SPACE-LAB: se corrige el layout de cabezas y secuencia en el wrapper de atención por bloques del encoder de visión, y se corrige la convención de `rotate_half` en el decoder (de un `[x2|x1]` plano a `[-x2|x1]`, coherente con `apply_rotary_pos_emb` de HuggingFace). Ambas variantes se validaron extremo a extremo contra la referencia PyTorch en fp32 sobre CPU, con coseno de 1.000000 en el embedding final agrupado y valores de 0,999994 y 0,999931 en el último estado oculto para 16 y 32 fotogramas.

El modelo resuelve un problema concreto: obtener embeddings conjuntos de vídeo y texto para búsqueda, recuperación y agrupamiento multimodal, ejecutables en CPU con ONNX Runtime en torno a 16 GB de RAM, sin GPU y sin el stack de PyTorch. Con cero descargas y dos "likes" en el momento de la consulta, es un artefacto de nicho pensado para quien ya trabaja con el modelo base de Qwen y necesita una ruta de despliegue ONNX verificada numéricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language con encoder de vision y decoder de texto exportados como dos grafos ONNX separados (`Vision.onnx`, `Transformer.onnx`); MRoPE interleaved con `mrope_section = [24, 20, 20]` y dimension de cabeza rotatoria 128 |
| Parametros totales | Aproximadamente 2B (según la denominación del modelo base Qwen3-VL-Embedding-2B); desglose entre torre de visión y decoder no disponible |
| Parametros activos | No aplica / no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No especificada en la información proporcionada. Las secuencias de vídeo requieren ~4700 tokens (16 fotogramas) o ~9400 tokens (32 fotogramas); el autor recomienda fijar `max_length` a 8192 o 16384, ya que el valor por defecto de 8192 trunca el vídeo de 32 fotogramas |
| Tipos de cuantizacion | No documentados. La validación de precisión se realizó contra PyTorch en fp32 sobre CPU; no se listan variantes int8, fp16 o Q4 en la información disponible |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0, heredada del modelo base Qwen/Qwen3-VL-Embedding-2B |
| Formato de pesos | ONNX (`Vision.onnx` + `.data`, `Transformer.onnx` + `.data`), `rotary_params.npz` y `tokenizer/` por variante |
| Dimension del embedding | 2048 (tabla `embed_weight` de forma [151936, 2048]; `vision_hidden_states` de forma [4608 o 9216, 2048]) |
| Tamano de vocabulario | 151936 tokens; `video_token_id = 151656` |
| Resolucion de vision | 768x768 por fotograma, multiplo obligatorio de `patch_size x merge_size = 32`; `video_grid_thw = [t/2, 48, 48]` |
| Variantes incluidas | `temporal16/` (16 fotogramas brutos, 8 parches temporales, 4608 tokens de vision) y `temporal32/` (32 fotogramas brutos, 16 parches temporales, 9216 tokens de vision) |
| Tamano del repositorio | 9,9 GB (ambas variantes incluidas) |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base, sino el proceso de exportación. Sabemos que el modelo subyacente es Qwen3-VL-Embedding-2B, un transformer vision-language de tipo embedding, y que esta ficha corresponde a su conversión a ONNX. La exportación separa el grafo en dos piezas: `Vision.onnx`, que produce tres características deepstack más `vision_hidden_states` de forma [4608, 2048] o [9216, 2048] según la variante, y `Transformer.onnx`, que consume la secuencia completa con la máscara causal y devuelve `last_hidden_state`. El pooling se realiza sobre el último token y se normaliza en L2, lo que da el embedding final.

El detalle técnico más relevante es el manejo de MRoPE. La atención de visión es completa sobre todos los parches de la ventana temporal (comportamiento idéntico al modelo de HuggingFace) y las características deepstack se dispersan en tensores de secuencia completa, con ceros en las posiciones de texto, sumándose después de las capas 0, 1 y 2 del decoder. Las posiciones tridimensionales (T/H/W) se construyen con `Qwen3VLModel.get_rope_index` y los cos/sin se generan con frecuencias interleaved cada tercera componente, con la componente temporal rellenando el resto, en una forma [1, seq, 1, 1, 128]. Los picos de memoria de atención están acotados por un chunking exacto de query y cabeza horneado en los grafos, lo que permite ejecutar ambas variantes con holgura en ~16 GB de RAM sobre ONNX Runtime CPU. El único eje dinámico del decoder es `seq_len`.

Respecto a las correcciones sobre el export de PIA-SPACE-LAB: el wrapper de atención por bloques usado para exportar secuencias largas omitía el `transpose(1, 2)` por división, mezclando ejes de cabeza y secuencia en el reshape final, de modo que todas las salidas de visión quedaban permutadas; y el decoder usaba un flip plano `[x2|x1]` en lugar de `[-x2|x1]`, con divergencia cero frente a `apply_rotary_pos_emb` una vez corregido. La validación se hizo con el vídeo real `hospital_pudong_000.mp4` a 768x768 por fotograma, comparando `deepstack_feature_0/1/2`, `vision_hidden_states`, `last_hidden_state` y el embedding agrupado.

## Capacidades

- Extracción de características multimodal (pipeline `feature-extraction`): genera embeddings conjuntos de vídeo y texto en un mismo espacio vectorial de 2048 dimensiones.
- Embedding de vídeo con ventana temporal configurable: 16 o 32 fotogramas brutos por clip, con atención completa sobre toda la ventana temporal.
- Embedding de texto: tabla de embeddings de 151936 entradas utilizable para codificar consultas o descripciones textuales en el mismo espacio que el vídeo.
- Búsqueda y recuperación cruzada vídeo-texto: al compartir espacio de representación, permite ranking por similitud coseno entre consultas textuales y clips.
- Salidas intermedias para tareas auxiliares: expone tres características deepstack y `vision_hidden_states`, no solo el embedding agrupado, lo que habilita usos que requieran representaciones por token.
- Inferencia sin PyTorch: ejecutable con ONNX Runtime, incluyendo CPU, lo que facilita despliegues en entornos restringidos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking en la información disponible.
- No es un modelo generativo: no produce texto, código ni respuestas; su única salida útil documentada son representaciones vectoriales.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica en archivos de vídeo: indexar un catálogo audiovisual calculando el embedding de cada clip de 16 o 32 fotogramas y resolver consultas en lenguaje natural por similitud coseno en el espacio de 2048 dimensiones, sin transcripción previa.
- Deduplicación y detección de material repetido: al comparar embeddings de clips, se pueden agrupar emisiones duplicadas o detectar reutilización de metraje en un archivo de noticias o en un repositorio de contenido generado por usuarios.
- Moderación y clasificación de contenido audiovisual: entrenando un clasificador ligero sobre los embeddings, se pueden etiquetar clips por categoría temática o por presencia de contenido no deseado, aprovechando que el modelo ya ha sido validado con precisión numérica frente a PyTorch.
- Recomendación de vídeo: representar el historial de consumo de un usuario y el catálogo en el mismo espacio vectorial para recuperar candidatos por vecindad, con un coste de cómputo bajo al no requerir GPU.
- Recuperación aumentada multimodal (RAG): combinar el embedding de vídeo con el embedding de texto del propio modelo para construir un índice híbrido que permita a un sistema de preguntas responder citando el fragmento audiovisual relevante.
- Anotación asistida y agrupamiento exploratorio: proyectar y agrupar los embeddings de un lote de clips para descubrir categorías latentes y priorizar el etiquetado manual, reduciendo el volumen de revisión humana.
- Control de calidad en pipelines de visión por computador: usar `last_hidden_state` y `vision_hidden_states` como referencia de comparación en pruebas de regresión, ya que el repositorio incluye `verify_precision.py` con cosenos de referencia frente a PyTorch.
- Despliegue en entornos sin GPU: servicios de búsqueda de vídeo en máquinas de 16 GB de RAM con ONNX Runtime CPU, útil para prototipos, entornos air-gapped o despliegues en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de recuperación como Recall@K o mAP).

Lo único aportado es una validación de precisión frente a la implementación de referencia, que se reproduce a continuación tal cual figura en la model card. No es un benchmark de calidad, sino una comprobación de equivalencia numérica entre la exportación ONNX y PyTorch en fp32 sobre CPU.

| Magnitud | temporal16 (seq 4692) | temporal32 (seq 9370) |
|---|---|---|
| deepstack_feature_0/1/2 | cos 1.000000 | cos 1.000000 |
| vision_hidden_states | cos 1.000000 | cos 1.000000 |
| last_hidden_state (todos los tokens) | cos 0.999994 | cos 0.999931 |
| Embedding agrupado (último token, normalizado L2) | cos 1.000000 | cos 1.000000 |

## Requisitos de hardware

- RAM: el autor indica que ambas variantes se ejecutan con holgura en ~16 GB de RAM usando ONNX Runtime CPU, gracias al chunking exacto de query y cabeza horneado en los grafos.
- VRAM: no disponible. No se documentan cifras de VRAM ni precisión de los pesos ONNX. Como referencia aproximada y no confirmada por el autor, un modelo de ~2B parámetros ocupa del orden de 8 GB en fp32 y 4 GB en fp16, pero la información no permite confirmar en qué precisión están exportados los grafos ni cómo se reparte el tamaño entre las dos variantes (el repositorio completo pesa 9,9 GB).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El único escenario de ejecución documentado es CPU.
- Opciones de despliegue: ONNX Runtime (CPU verificado). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de un modelo de embeddings y no generativo, estas herramientas no son el objetivo natural del artefacto.
- Latencia y throughput: no disponibles. Sí se conoce la carga de secuencia: 4692 tokens para la variante de 16 fotogramas y 9370 para la de 32, con `seq_len` como único eje dinámico del decoder.
- Almacenamiento: 9,9 GB para el repositorio completo con ambas variantes; ambas carpetas son autocontenidas (ONNX, parámetros de RoPE y tokenizador).

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Ventana temporal | Precision verificada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zhangsongbo365/Qwen3-VL-Embedding-2B-onnx (esta ficha) | ONNX (Vision + Transformer, dos variantes) | ~2B | 16 y 32 fotogramas a 768x768 | Sí, cos 1.000000 en el embedding agrupado frente a PyTorch | Apache-2.0 | Repositorio propio; 0 descargas y 2 likes en el momento de la consulta |
| Qwen/Qwen3-VL-Embedding-2B | PyTorch (referencia) | ~2B | No especificada en la información disponible | No aplica (es la referencia) | Apache-2.0 | Modelo base oficial |
| PIA-SPACE-LAB/Qwen3-VL-Embedding-2B-onnx | ONNX (pipeline de exportación previo) | ~2B | No especificada | No; según esta ficha, arrastra dos errores de exportación (layout de atención de visión y convención `rotate_half`) | Apache-2.0 (heredada) | Repositorio ONNX original del que deriva esta exportación |

No se dispone de información sobre otros modelos comparables de la misma categoría (embeddings multimodales vídeo-texto) en el material proporcionado.

## Limitaciones y advertencias

- El material de búsqueda web recuperado no contiene información relacionada con el modelo (resultados en chino sobre pizza, citas bibliográficas y Uzbekistán), por lo que no hay datos externos que amplíen esta ficha.
- La model card no aporta resultados de benchmarks de calidad; la equivalencia numérica con PyTorch no implica buen rendimiento en tareas de recuperación.
- No es un modelo generativo: no responde preguntas ni genera texto, solo produce representaciones vectoriales. Usarlo como chatbot dará resultados vacíos.
- Sesgos conocidos: no disponibles. Al ser una exportación del modelo base, hereda los sesgos de Qwen3-VL-Embedding-2B, que no se documentan aquí.
- Riesgo de alucinación: no aplica a un modelo de embeddings, pero sí existe riesgo de falsos positivos en similitud, ya que dos clips distintos pueden quedar próximos en el espacio vectorial.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingüe sin confirmación, aunque el modelo base de Qwen sea multilingüe.
- Limitación de contexto práctica: con `max_length` en el valor por defecto de 8192, la variante `temporal32` (9370 tokens) se trunca. Es obligatorio subir el `max_length` del procesador a 16384 para el vídeo de 32 fotogramas.
- La resolución está fijada a 768x768 por fotograma y debe ser múltiplo de 32; se debe preprocesar con `do_resize=False` usando el tokenizador de la carpeta correspondiente.
- La exportación depende de ficheros auxiliares (`rotary_params.npz`) que contienen `inv_freq`, `mrope_section`, la tabla `embed_weight` y la configuración de rejilla. Omitirlos rompe la inferencia.
- La convención de nombres es engañosa: `TEMPORAL_SIZE` cuenta fotogramas brutos, no parches temporales, que se calculan como `ceil(TEMPORAL_SIZE / 2)`.
- Uso comercial: permitido bajo Apache-2.0, licencia heredada del modelo base. Conviene revisar los términos del modelo original de Qwen antes de un despliegue en producción.
- Madurez del artefacto: cero descargas y dos "likes" en el momento de la consulta. No hay evidencia de uso en producción ni de mantenimiento continuado.
- El autor no indica la precisión de los pesos ONNX; si se asume fp32 sin confirmarlo, las estimaciones de memoria en GPU pueden desviarse.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/zhangsongbo365/Qwen3-VL-Embedding-2B-onnx
- Modelo base en PyTorch: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Exportación ONNX de la que deriva: https://huggingface.co/PIA-SPACE-LAB/Qwen3-VL-Embedding-2B-onnx
- Script de verificación de precisión y referencia de inferencia: `verify_precision.py`, incluido en la raíz del repositorio
- Scripts de exportación corregidos: carpeta `export_script/` del repositorio (`TEMPORAL_SIZE` configurable por variable de entorno, valor por defecto 32)
- Parámetros de RoPE y tabla de embeddings: `temporal16/rotary_params.npz` y `temporal32/rotary_params.npz`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
