# SVGsquad/clip-svg-ViT-B-32-ours-hps

## Resumen

El modelo `SVGsquad/clip-svg-ViT-B-32-ours-hps` es un checkpoint derivado de CLIP ViT-B/32, desarrollado por el equipo SVGsquad, que incorpora un adaptador LoRA de rango 16 entrenado con preferencias humanas sobre pares de imagen SVG y su descripción textual. El objetivo es mejorar la alineación entre la representación semántica de una imagen SVG renderizada y su caption, de forma que la similitud coseno entre los embeddings resultantes refleje mejor el juicio humano sobre la correspondencia imagen-texto.

El modelo parte del checkpoint base `SVGsquad/clip-svg-ViT-B-32-ours` y fusiona los pesos del adaptador mediante `PeftModel.merge_and_unload`. El adaptador se entrenó con una pérdida de preferencia bidireccional sobre las proyecciones de consulta (query) y valor (value) de los dos últimos bloques transformer de los encoders de imagen y texto. El resultado es un modelo con 151,3 millones de parámetros, pensado para tareas de clasificación zero-shot y evaluación de alineación semántica, especialmente en el dominio de gráficos vectoriales SVG.

Aunque el pipeline declarado en HuggingFace es `text-to-image`, este modelo no genera imágenes: es un modelo de embeddings que se utiliza para calcular similitud entre una imagen SVG renderizada y un texto. Su relevancia radica en que ofrece una métrica de calidad alineada con preferencias humanas para sistemas de generación o selección de SVG, un campo con poca infraestructura de evaluación específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (Transformer con ViT-B/32 para imagen y Transformer para texto) |
| Parametros totales | 151.277.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un CLIP ViT-B/32 estándar, compuesto por un encoder de imagen basado en Vision Transformer (patch size 32x32) y un encoder de texto con arquitectura transformer. Sobre este base se entrena un adaptador LoRA de rango 16 que modifica únicamente las proyecciones de consulta y valor en los dos últimos bloques de ambos encoders. El entrenamiento se realiza con pares de preferencia humana dentro de la misma caption, extraídos del conjunto de datos `SVGsquad/svg-human-judgements-caption-image-disjoint-80-20`. Se utiliza una pérdida de preferencia bidireccional que penaliza tanto la inversión del orden de preferencia entre dos imágenes para una misma caption como la inconsistencia entre las direcciones imagen-texto y texto-imagen. Los pesos LoRA se fusionan con el modelo base mediante `merge_and_unload`, por lo que el checkpoint final no requiere la carga del adaptador por separado.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas adicionales como RLHF o DPO. El entrenamiento se centra en la alineación con juicios humanos sobre la correspondencia semántica entre captions e imágenes SVG, no en la generación de texto ni en otras tareas.

## Capacidades

- Clasificacion zero-shot de imagenes: el modelo puede asignar la etiqueta textual mas relevante a una imagen SVG renderizada mediante similitud coseno entre embeddings.
- Evaluacion de alineacion semantica: proporciona una puntuacion de similitud que correlaciona con juicios humanos, util como metrica de calidad para imagenes SVG.
- Recuperacion de imagenes por texto: permite buscar imagenes SVG en una coleccion a partir de descripciones en lenguaje natural.
- Embeddings multimodales: genera representaciones vectoriales de 512 dimensiones para imagenes y textos, comparables entre si.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso. Es un modelo puramente de representacion.

## Casos de uso

- Evaluacion de calidad en generacion de SVG: en un pipeline de text-to-image que produce SVG, este modelo puede usarse como reward model para seleccionar la salida con mayor similitud coseno con la caption, sustituyendo o complementando metricas automaticas como CLIPScore.
- Filtrado de imagenes generadas por IA: para sistemas que generan multiples variantes de un mismo prompt, el modelo permite descartar aquellas cuya alineacion semantica con el texto sea baja, reduciendo ruido en el resultado final.
- Busqueda y organizacion de librerias de SVG: al indexar los embeddings de una coleccion de SVG, se puede implementar un buscador por descripcion textual, facilitando la recuperacion de recursos graficos.
- Moderacion de contenido visual: el modelo puede detectar si una imagen SVG corresponde semanticamente a una descripcion dada, util para validar que el contenido generado cumple con la intencion del usuario.
- Investigacion en alineacion de preferencias humanas: dado que el modelo se entrena con juicios humanos, puede servir como referencia para estudiar como los modelos multimodales capturan la subjetividad en la correspondencia imagen-texto.
- Benchmarking de modelos de generacion de SVG: permite comparar diferentes sistemas de generacion midiendo la calidad semantica de sus salidas frente a captions de referencia, usando la correlacion con puntuaciones humanas como metrica.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de test (2.374 SVGs, renders blancos a 448px):

| Metrica | Valor |
|---|---|
| Correlacion de Pearson | 0.5843 |
| Kendall tau-b | 0.4545 |
| Spearman | 0.5931 |

Estas metricas miden la correlacion entre las puntuaciones de similitud del modelo y las puntuaciones de alineacion semantica asignadas por humanos. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 151 millones de parametros. En FP32, los pesos ocupan aproximadamente 605 MB; en FP16, unos 303 MB. Con overhead de activaciones y buffers, se puede ejecutar en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente para inferencia. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, es un modelo ligero que cabe en practicamente cualquier GPU disponible.
- Opciones de despliegue: al ser un modelo de la libreria transformers, se puede cargar con `CLIPModel` y ejecutar en frameworks como PyTorch. No se mencionan integraciones especificas con vLLM, llama.cpp u Ollama, pero al ser un modelo de embeddings, puede servirse mediante APIs REST usando herramientas como FastAPI o Triton.
- Latencia y throughput: no se proporcionan datos. En una GPU moderna, la inferencia de un par imagen-texto deberia completarse en pocos milisegundos, dado el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| SVGsquad/clip-svg-ViT-B-32-ours-hps | 151 M | no disponible | SVG y preferencias humanas | no disponible |
| openai/clip-vit-base-patch32 | 151 M | 77 tokens (tipico) | Imagenes naturales y texto | MIT (original) |
| sentence-transformers/clip-ViT-B-32 | 151 M | no disponible | Embeddings de frases e imagenes | Apache 2.0 (probable) |

El modelo de SVGsquad se diferencia del CLIP original por su entrenamiento especifico en SVG y por la alineacion con preferencias humanas, lo que lo hace mas adecuado para tareas de evaluacion en ese dominio. No se dispone de resultados comparativos de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Sesgos de los anotadores: al entrenarse con preferencias humanas, el modelo puede heredar sesgos subjetivos de los evaluadores, lo que podria afectar a la generalizacion en otros contextos.
- Riesgo de alucinacion: no aplica directamente, ya que el modelo no genera texto, pero la similitud coseno puede producir falsos positivos en la correspondencia imagen-texto si las representaciones no estan bien calibradas.
- Limitacion de contexto: al ser un CLIP estandar, el encoder de texto tiene una longitud maxima de tokens (tipicamente 77), aunque no se confirma en la documentacion. Para captions largas, la informacion se truncara.
- Dominio restringido: el modelo esta especializado en SVG renderizados a 448px con fondo blanco. Su rendimiento en imagenes naturales o con otros estilos puede degradarse.
- Licencia no disponible: no se especifica la licencia de uso, lo que impide garantizar su uso comercial sin riesgo legal.
- Sin soporte para generacion: a pesar del pipeline declarado, el modelo no genera imagenes ni texto; es exclusivamente un modelo de representacion.

## Enlaces

- [HuggingFace: SVGsquad/clip-svg-ViT-B-32-ours-hps](https://huggingface.co/SVGsquad/clip-svg-ViT-B-32-ours-hps)
- [Modelo base: SVGsquad/clip-svg-ViT-B-32-ours](https://huggingface.co/SVGsquad/clip-svg-ViT-B-32-ours)
- [Dataset de juicios humanos: SVGsquad/svg-human-judgements-caption-image-disjoint-80-20](https://huggingface.co/SVGsquad/svg-human-judgements-caption-image-disjoint-80-20)
- [Repositorio original de CLIP (OpenAI)](https://github.com/openai/CLIP)
