# yafitzdev/opsis-v1-nano-g3

## Resumen

`opsis-v1-nano-g3` es un modelo pequeño de ingesta visual para sistemas RAG, desarrollado por Yan Fitzner (yafitzdev). Actúa como un co-procesador local que recibe una imagen o un recorte de documento y devuelve texto descriptivo conciso o una tabla en Markdown compatible con GitHub, pensado para indexación y recuperación posterior. No es un asistente general ni un OCR completo: se sitúa antes de la indexación o junto a un pipeline de extracción de PDFs para hacer visible el contenido visual sin depender de APIs de VLM alojadas ni de GPUs de inferencia.

Con 256 millones de parámetros y una arquitectura basada en Idefics3, el modelo está optimizado para ejecutarse en CPU mediante un runtime ONNX en FP32. La versión g3 mantiene el mismo contrato de salida que la g2, pero incorpora un currículo de entrenamiento de 100.000 ejemplos y adapta únicamente el encoder de visión y el conector visión-texto. Según el autor, en un benchmark de revisión de 600 casos mejora la estructura de tablas y la latencia en CPU, manteniéndose cerca de la g2 en descubrimiento semántico. Es un checkpoint de investigación equilibrado, no una actualización universal de calidad.

La licencia es `mixed-source-research-preview`, lo que limita su uso en producción comercial. El modelo solo soporta inglés y está disponible en formato safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (vision-language, encoder de vision + conector vision-texto + decoder) |
| Parametros totales | 256.484.928 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (ONNX split), safetensors en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | mixed-source-research-preview (otra) |
| Formato de pesos | safetensors, ONNX (vision_encoder.onnx, embed_tokens.onnx, decoder_model_merged.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Idefics3, un enfoque de vision-lenguaje que combina un encoder de vision preentrenado con un decoder de lenguaje y un conector de proyeccion. En esta version g3, el autor ha adaptado especificamente el encoder de vision y el conector vision-texto, manteniendo el resto del stack de la g2. El entrenamiento se realizo con un curriculo de 100.000 ejemplos, disenado para que el modelo aprenda a producir dos modos de salida: descripcion factual concisa (modo `description`) o tabla Markdown completa (modo `table`), dependiendo del contenido de la imagen.

No se han publicado detalles sobre la composicion exacta del dataset, el numero de tokens de entrenamiento ni el uso de tecnicas como RLHF o DPO. El modelo se entrega con un prompt especifico para RAG (`rag-image-v3`) que instruye al modelo a no especular y a incluir texto visible relevante. El runtime ONNX incluido en el repositorio esta dividido en tres componentes (encoder de vision, embeddings y decoder fusionado) para permitir inferencia en CPU con precision FP32.

## Capacidades

- Descripcion factual concisa de imagenes ordinarias, graficos y diagramas, extrayendo etiquetas, valores y tendencias visibles.
- Conversion de imagenes de tablas compactas a tablas Markdown con filas y celdas recuperables.
- Soporte de dos modos de salida nativos: `<description>...</description>` y `<table>...</table>`, con un contrato de decodificacion definido.
- Ejecucion local en CPU mediante ONNX FP32, sin necesidad de GPU ni servicios en la nube.
- Integracion con pipelines de RAG para enriquecer regiones visuales extraidas de PDFs (tablas, graficos, diagramas) que no tienen texto nativo.
- Capacidad multilingue: solo ingles (no soporta otros idiomas).

## Casos de uso

- Indexacion de imagenes en motores de busqueda RAG: el modelo genera una descripcion textual concisa de cada imagen, que se almacena como metadato y permite recuperar la imagen mediante busqueda semantica.
- Conversion de tablas escaneadas o fotografiadas a Markdown: se envia el recorte de la tabla al modelo y se obtiene una tabla estructurada lista para insertar en una base de datos o documento.
- Enriquecimiento de PDFs con contenido visual: en un pipeline de extraccion de PDF, las regiones que contienen tablas, graficos o diagramas se envian a Opsis para generar texto indexable, mientras el texto nativo se procesa por separado.
- Documentacion automatica de graficos de negocio: el modelo extrae etiquetas, valores y tendencias visibles de graficos de lineas, barras o circulares, generando una descripcion que puede anadirse a informes.
- Captura de diagramas de arquitectura o flujo: el modelo nombra nodos y relaciones visibles, permitiendo que estos diagramas sean buscables en un sistema de conocimiento interno.
- Sistema de atencion al cliente con soporte visual: un agente puede enviar capturas de pantalla de errores o documentos al modelo para obtener una descripcion breve que ayude a clasificar la incidencia antes de derivarla a un humano.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona una evaluacion interna de 600 casos revisados visualmente, donde g3 mejora la estructura de tablas y la latencia en CPU respecto a g2, manteniendo un rendimiento similar en descubrimiento semantico, pero no se ofrecen cifras concretas (exactitud, F1, tiempos de inferencia, etc.). No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 256M parametros, cabe en cualquier GPU moderna (incluso con 4 GB de VRAM) si se usa en precision float32, aunque el caso de uso principal es CPU.
- GPU recomendadas: no se requiere GPU para inferencia; el modelo esta disenado para CPU. Si se usa GPU, cualquier NVIDIA con al menos 4 GB (GTX 1650, RTX 3060, etc.) es suficiente.
- Compatibilidad con consumer GPU: si, todas las GPU de consumo pueden ejecutarlo sin problemas.
- Opciones de despliegue: transformers (Python) para GPU, y runtime ONNX con el proyecto `rag-image-parser` para CPU. Tambien es compatible con endpoints de Hugging Face (`endpoints_compatible`).
- Latencia y throughput: no se han publicado valores exactos. La model card indica mejora de latencia en CPU respecto a g2, pero sin cifras. El ejemplo de salida muestra una latencia de 3.64 segundos en un caso concreto, aunque no se especifica el hardware utilizado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (co-procesadores de ingesta visual para RAG). El modelo es un checkpoint de investigacion especifico del autor, y no se han encontrado alternativas directamente comparables en el ecosistema abierto con caracteristicas equivalentes (tamano, enfoque, licencia). Se puede mencionar que otros modelos vision-language pequenos como PaliGemma o SmolVLM podrian cubrir tareas similares, pero no hay datos de rendimiento publicados para Opsis que permitan una comparacion objetiva.

## Limitaciones y advertencias

- No es un sistema OCR autoritativo: no devuelve bounding boxes, coordenadas de origen, bloques de texto de PDF ni verificacion de hechos numericos.
- Riesgo de alucinacion: el modelo puede generar descripciones o tablas que no reflejen exactamente el contenido visual, especialmente en imagenes de baja resolucion o con texto poco legible.
- Limitacion de idioma: solo soporta ingles; no es util para documentos en otros idiomas.
- Licencia restrictiva: `mixed-source-research-preview` implica restricciones para uso comercial en produccion. No se especifican los terminos exactos, pero se recomienda revisar la licencia antes de cualquier despliegue.
- No es un asistente general: no debe usarse para conversacion libre ni para tareas fuera del contrato de salida definido (descripcion o tabla).
- Dependencia de la calidad del recorte: el rendimiento depende directamente de la resolucion y el recorte de la imagen; imagenes mal recortadas o con baja resolucion degradan la salida.
- La version g3 no es una mejora universal sobre g2: el autor advierte que es un checkpoint de investigacion equilibrado, con mejoras en tablas y latencia pero sin garantia de superioridad en todos los casos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yafitzdev/opsis-v1-nano-g3
- Perfil del autor: https://huggingface.co/yafitzdev
- Repositorio relacionado (pyrrho, clasificacion para RAG governance): https://github.com/yafitzdev/pyrrho
