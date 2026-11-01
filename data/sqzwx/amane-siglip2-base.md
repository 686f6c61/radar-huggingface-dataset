# sqzwx/amane-siglip2-base

## Resumen

Amane SigLIP2 base es una conversión a formatos Core ML y ONNX del modelo de visión-lenguaje SigLIP2 base de Google, publicada por el usuario sqzwx bajo el identificador `sqzwx/amane-siglip2-base`. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos proceden de `google/siglip2-base-patch16-256` (Apache-2.0) y los ficheros ONNX coinciden con los de `onnx-community/siglip2-base-patch16-256-ONNX`. Su propósito declarado es servir como modelo de torre doble (imagen y texto) para búsqueda semántica de portadas, es decir, recuperación de imágenes por descripción textual.

La relevancia de esta publicación es práctica: empaqueta un modelo SigLIP2 en formatos optimizados para inferencia local, con Core ML para macOS y ONNX Runtime para el resto de plataformas, e incluye decisiones de cuantización documentadas empíricamente. El autor reporta que la torre visual pierde calidad de forma notable al cuantizarse (coseno de 0,917 a 0,975 en ONNX int8 y 0,961 en Core ML p8, frente a 0,9999 en fp16), mientras que la torre de texto tolera palettization de 8 bits con coseno 0,9986.

El repositorio ocupa 1,2 GB y contiene pesos en fp16, un tokenizador y paquetes Core ML comprimidos. No se han publicado resultados de benchmarks de recuperación ni métricas de tarea en la información disponible; las únicas cifras son las de similitud coseno entre las salidas cuantizadas y las originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de torre doble (vision encoder + text encoder) SigLIP2, patch16 a 256x256 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (longitud de secuencia usada en el tokenizador y el preprocesado) |
| Tipos de cuantizacion | fp16 (vision y texto en ONNX); fp16 (vision) y palettization 8 bits p8 (texto) en Core ML |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp16), Core ML (.mlpackage en zip), tokenizer.json |

## Arquitectura y entrenamiento

El modelo subyacente es SigLIP2 base con parches de 16x16 y resolución de entrada de 256x256, una arquitectura de dos torres independientes que proyectan imágenes y texto a un espacio latente compartido mediante un objetivo de contraste tipo sigmoide (sigmoide loss), sucesor del planteamiento CLIP. Esta publicación no entrena ni afina el modelo: redistribuye los pesos originales de Google convertidos a Core ML con coremltools 9.0 y a ONNX, con los ficheros ONNX idénticos a los de la comunidad `onnx-community`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de alineación adicionales, ya que la model card solo documenta el proceso de conversión. La innovación técnica destacable de este artefacto es la guía de cuantización por torre: el autor justifica mantener fp16 en la torre visual por la caída de similitud coseno observada, y aplicar palettization de 8 bits solo en la torre de texto en Core ML. El preprocesado es explícito: redimensionado directo a 256x256 sin recorte, normalización `(x/255-0.5)/0.5`, y texto con padding `<pad>` hasta 64 tokens.

## Capacidades

- Embeddings de imagen: codifica imágenes de 256x256 en vectores latentes para búsqueda y comparación.
- Embeddings de texto: codifica descripciones cortas (hasta 64 tokens) en el mismo espacio latente.
- Búsqueda semántica multimodal: similitud coseno entre embeddings de imagen y texto para recuperación.
- Clasificación zero-shot por prompt textual, derivada del alineamiento imagen-texto del modelo base.
- Ejecución local en macOS mediante Core ML y en otras plataformas mediante ONNX Runtime.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling ni capacidades de agente.
- No se documenta soporte multilingüe específico; el tokenizador es el del modelo base.

## Casos de uso

- Búsqueda de portadas por descripción: indexar los embeddings de imagen de un catálogo y consultar con texto libre ("portada con fondo azul y tipografía serif") usando similitud coseno; el modelo está pensado exactamente para este escenario.
- Deduplicación visual de un catálogo: calcular embeddings de todas las imágenes y agrupar por distancia para detectar portadas repetidas o variantes, sin necesidad de comparación pixel a pixel.
- Etiquetado automático de imágenes: comparar el embedding de cada imagen contra una lista de prompts candidatos y asignar la etiqueta con mayor similitud, útil para metadatos de bibliotecas.
- Filtrado de contenido en pipelines de ingesta: clasificar imágenes subidas por usuarios contra prompts de categorías prohibidas antes de publicarlas.
- Búsqueda inversa en aplicaciones de escritorio macOS: empaquetar los `.mlpackage` en una app nativa y ejecutar la inferencia en el dispositivo sin enviar imágenes a un servidor.
- Servicio de búsqueda multimodal en backend: servir los ficheros ONNX con ONNX Runtime en un endpoint HTTP que reciba texto o imagen y devuelva vecinos cercanos de un índice vectorial.
- Moderación y organización de archivos personales: indexar una fototeca local y recuperar imágenes por descripción aproximada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (recuperación, zero-shot, MMLU, etc.) en la información disponible. Las únicas métricas reportadas son de fidelidad de la cuantización, medidas como similitud coseno frente a la salida fp16 de referencia:

| Componente | Formato | Cuantización | Similitud coseno reportada |
|---|---|---|---|
| Torre visual | ONNX int8 | int8 | 0,917–0,975 |
| Torre visual | Core ML p8 | palettization 8 bits | 0,961 |
| Torre visual | fp16 (referencia) | fp16 | 0,9999 |
| Torre de texto | Core ML p8 | palettization 8 bits | 0,9986 |
| Torre de texto | ONNX fp16 | fp16 | 1,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros ONNX suman 717 MB en fp16 (178 MB visión + 539 MB texto); en la práctica, con activaciones y overhead de ONNX Runtime, se puede ejecutar en GPUs consumer con 2-4 GB de memoria libre.
- GPU recomendadas: cualquier GPU con soporte de fp16 (RTX 3060 en adelante, A100, H100); el modelo es pequeño y no requiere aceleradores de datacenter.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 2 GB de VRAM; también puede ejecutarse en CPU con latencias mayores.
- Despliegue: ONNX Runtime en Linux, Windows y macOS; Core ML en macOS con los `.mlpackage` descomprimidos; no se documenta integración con vLLM, TGI ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| sqzwx/amane-siglip2-base | no disponible | 64 tokens | ONNX fp16, Core ML fp16/p8 | Apache-2.0 | Conversión de despliegue con guía de cuantización |
| google/siglip2-base-patch16-256 | no disponible | no disponible | safetensors (transformers) | Apache-2.0 | Modelo original de referencia |
| onnx-community/siglip2-base-patch16-256-ONNX | no disponible | no disponible | ONNX | Apache-2.0 | Conversión ONNX de la comunidad; los ficheros de este repo coinciden con ella |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings.
- La torre visual pierde calidad con cuantización agresiva; el autor desaconseja int8 en visión por la caída de coseno hasta 0,917.
- El texto se trunca a 64 tokens, lo que limita consultas largas o descripciones detalladas.
- No hay métricas de recuperación publicadas, por lo que el rendimiento real en búsqueda no está validado en la model card.
- Los sesgos del modelo base (asociaciones culturales, de género o de apariencia en el alineamiento imagen-texto) se heredan sin cambios.
- Riesgo de falsos positivos en clasificación zero-shot cuando los prompts son ambiguos o el dominio se aleja de los datos de entrenamiento originales.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los pesos de origen antes de redistribuir.
- El repositorio no tiene descargas ni validación comunitaria; es una publicación reciente sin adopción documentada.
- El tamaño del repositorio (1,2 GB) incluye los paquetes Core ML comprimidos, que deben descomprimirse antes de usarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sqzwx/amane-siglip2-base
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-256
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/siglip2-base-patch16-256-ONNX
- Repositorio Amane (documentación en `docs/`): no disponible como URL en la información proporcionada
- Referencia `out/exp-06.md` del repositorio whos-lab: no disponible como URL en la información proporcionada
