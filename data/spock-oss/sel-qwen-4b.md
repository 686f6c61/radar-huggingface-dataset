# spock-oss/sel-qwen-4b

## Resumen

SEL Qwen 4B es un adaptador LoRA de rango 16 acompañado de una cabeza de selección ("selection head") que se monta sobre el modelo base Qwen 3.5 4B. Lo desarrolla spock-oss y su función no es la generación de texto, sino la localización: dado un texto o una imagen y una pregunta, el modelo devuelve puntuaciones alineadas con los tokens de origen o con los parches de la imagen en una sola pasada del backbone. Es, por tanto, un modelo de extracción de características orientado a una tarea muy concreta de selección de evidencia.

La relevancia de esta ficha es acotada: el checkpoint es un artefacto de investigación publicado con 0 descargas y 0 likes en el momento de la consulta, con un tamaño de repositorio de 0,1 GB (solo adaptador y cabeza, no los pesos completos). El interés técnico está en su planteamiento híbrido de atención (capas full-attention bidireccionales combinadas con capas gated delta direccionales) y en que aborda selección de evidencia tanto textual como visual con un único backbone.

La licencia del adaptador es MIT, mientras que el modelo base Qwen 3.5 4B se distribuye bajo Apache 2.0 y debe descargarse por separado. No se han publicado datos de idiomas soportados ni resultados de benchmarks comparativos con otros modelos de la misma categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre Qwen 3.5 4B; backbone con 8 capas full-attention bidireccionales y 24 capas gated delta direccionales; cabeza de selección densa con router y pointer enlazado |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el total depende del base Qwen 3.5 4B, que no se detalla en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrada en el ejemplo de referencia, incluyendo la consulta y los tokens visuales |
| Tipos de cuantizacion | BF16 en el ejemplo de inferencia; FP8 en el despliegue vLLM del playground de Spock; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT para los ficheros SEL; Apache 2.0 para el modelo base Qwen 3.5 4B |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `selection_head.safetensors`) con configuracion PEFT en JSON |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo al uso, sino un adaptador de selección. Sobre el backbone de Qwen 3.5 4B se aplica una LoRA de rango 16 que adapta únicamente el language backbone; el encoder de visión y los embeddings de tokens permanecieron congelados durante el entrenamiento. La innovación estructural está en el patrón de atención: las ocho capas full-attention se ejecutan de forma bidireccional, mientras que las 24 capas gated delta conservan su cómputo direccional. Esa mezcla permite que el modelo vea el contexto completo (necesario para puntuar qué fragmento responde a una pregunta) sin renunciar a la eficiencia de las capas delta.

Sobre el backbone se añade una cabeza de selección compuesta por un scorer denso, un router y un pointer enlazado, que produce puntuaciones alineadas con los tokens de texto (con offsets de caracteres) o con los parches de imagen (con coordenadas de parche). El checkpoint publicado corresponde al Run09 4B, época 2, paso 15.622, sobre la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del base. El entrenamiento usó el dataset `spock-oss/sel-27b-training`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Selección de evidencia en texto: devuelve puntuaciones por token con offsets de caracteres para una pregunta dada.
- Selección de evidencia en imagen: devuelve puntuaciones por parche con coordenadas de parche.
- Procesamiento multimodal en una sola pasada del backbone (texto e imagen comparten el mismo mecanismo de puntuación).
- Soporte de reglas de tarea mediante el parámetro `--environment`, que permite aportar instrucciones específicas del entorno.
- Umbrales calibrados en validación: 0,10 para texto y 0,40 para imágenes, ajustables con `--threshold`.
- Extracción de características (`pipeline_tag: feature-extraction`), no generación de texto libre.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito.

## Casos de uso

- Extracción de cláusulas en contratos: dada una pregunta como "¿qué estado rige este acuerdo?", el modelo devuelve el fragmento exacto con offsets de caracteres, lo que permite resaltar la cláusula en un visor documental sin post-procesado adicional.
- Grounding en pipelines RAG: en lugar de generar una respuesta, el modelo localiza el pasaje de origen dentro de un contexto recuperado, lo que sirve como paso de verificación de citas antes de que un LLM generativo redacte.
- Anonimización y revisión de documentos: la puntuación por token permite marcar regiones candidatas (nombres, direcciones, importes) para revisión humana en flujos de cumplimiento.
- Selección de regiones en imágenes: con coordenadas de parche, encaja en tareas de inspección visual donde hay que señalar el área relevante de una captura, un escaneo o una fotografía.
- Etiquetado asistido de datasets: la salida alineada con tokens y parches acelera la anotación de evidencia en corpus de entrenamiento para otros modelos.
- Evaluación de atribución: permite medir si la evidencia citada por un sistema generativo coincide con la evidencia localizada por un modelo independiente, como métrica de fidelidad.
- Moderación y revisión de contenido: localizar la frase o región concreta que activa una política, en lugar de clasificar el documento entero.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la evaluación propia del autor, sobre un conjunto de test de 2.605 ejemplos en 26 tareas. Los umbrales se calibraron en validación y se aplicaron después a test.

| Metrica calibrada | Resultado |
|---|---:|
| Macro F1 en validación | 59,24% |
| Macro F1 en test | 60,85% |
| Macro F1 en test, texto | 59,03% |
| Macro F1 en test, imágenes | 62,42% |
| F1 en test con peso igual por tarea | 65,03% |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos benchmarks no son aplicables a un modelo de selección de evidencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el ejemplo de referencia usa inferencia densa en BF16 sobre GPU CUDA con soporte BF16, lo que para un backbone de 4B más el adaptador implica del orden de 8-10 GB en BF16 (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor; el ejemplo requiere CUDA y FlashAttention 2, lo que en la práctica exige GPUs Ampere o superiores (A100, H100, RTX 3090/4090 y equivalentes).
- Cabe en GPU de consumo: previsiblemente sí en BF16 en tarjetas de 16 GB o más, aunque el dato no está confirmado en la documentación.
- Despliegue: el ejemplo oficial es un script Python (`run_selection.py`) con dependencias standalone y FlashAttention 2; el playground de Spock usa un despliegue vLLM en FP8. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Entorno: Linux, Python 3.12 y GPU CUDA con BF16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de selección de evidencia en la información proporcionada. Como referencia estructural, el propio autor publica un checkpoint mayor en la misma familia:

| Modelo | Base | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEL Qwen 4B | Qwen 3.5 4B | LoRA r16 + cabeza de selección | 2.048 tokens en el ejemplo | MIT (adaptador) / Apache 2.0 (base) | Hugging Face, 0 descargas |
| SEL Qwen 27B | No disponible | Checkpoint de selección de mayor tamaño | No disponible | No disponible | Hugging Face (`spock-oss/sel-qwen-27b`) |

Comparativa con modelos de la misma categoría (localización de evidencia, grounding visual o textual): no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas en lenguaje natural, solo puntuaciones de selección; usarlo como chatbot o para redactar es un error de uso.
- Contexto limitado a 2.048 tokens de entrada en el ejemplo de referencia, incluyendo consulta y tokens visuales; documentos largos requieren troceado.
- Es un adaptador, no un modelo autónomo: requiere descargar por separado Qwen 3.5 4B en la revisión exacta indicada, y una discrepancia de revisión puede invalidar los pesos.
- Dependencia de FlashAttention 2 y de un stack concreto (Linux, Python 3.12, CUDA con BF16), lo que complica el despliegue en entornos no CUDA.
- Los umbrales 0,10 (texto) y 0,40 (imágenes) están calibrados en validación; en dominios distintos pueden requerir recalibración.
- Rendimiento modesto en términos absolutos: macro F1 de test del 60,85%, con caída en texto (59,03%) frente a imágenes (62,42%).
- Sin datos publicados sobre sesgos, tasas de alucinación (no aplica de forma directa al no generar texto), idiomas soportados ni comportamiento fuera del dominio de entrenamiento.
- El encoder de visión y los embeddings quedaron congelados, lo que limita la adaptación a dominios visuales muy alejados del entrenamiento.
- Adopción prácticamente nula (0 descargas, 0 likes) y publicación reciente: no hay evidencia de uso en producción ni validación independiente.
- La licencia MIT cubre los ficheros SEL, pero el uso comercial del conjunto exige cumplir también la Apache 2.0 del base Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spock-oss/sel-qwen-4b
- Modelo base Qwen 3.5 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint SEL Qwen 27B: https://huggingface.co/spock-oss/sel-qwen-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/spock-oss/sel-27b-training
- Código fuente de SEL: https://github.com/spock-oss/sel
- Dependencias standalone (commit fijado): https://github.com/spock-oss/sel/tree/c7ba97e7958c095de7b1edb263d00f91b949190f#install
- Artículo de investigación: https://spock.one/blog/selection-is-a-model-shape
