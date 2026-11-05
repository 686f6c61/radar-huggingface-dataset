# SZLHOLDINGS/khipu-r3-estate-sft-v1

## Resumen

khipu-r3-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, publicado por SZLHOLDINGS bajo licencia Apache 2.0. El modelo conserva la arquitectura multimodal del base (pipeline image-text-to-text) y sus 873.438.784 parámetros, y está orientado, por el nombre del repositorio ("estate"), a tareas del sector inmobiliario, aunque la model card no documenta explícitamente la composición del dataset de ajuste.

Se trata de un modelo de pequeño tamaño (menos de 1.000 millones de parámetros) derivado de la familia Qwen3.5, lo que lo sitúa en la franja de modelos desplegables en hardware de consumo. El repositorio tiene un tamaño de 1,8 GB en formato safetensors y es compatible con transformers y text-generation-inference. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de especialización vertical de un modelo base pequeño y multimodal mediante SFT, con licencia permisiva y pesos abiertos. No obstante, la ausencia de benchmarks, de documentación del dataset y de una model card detallada obliga a tratar sus capacidades como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 1,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 con capacidad de procesar imagen y texto (pipeline image-text-to-text). El ajuste fino se realizó mediante SFT con Unsloth y TRL, según la model card, lo que sugiere un entrenamiento supervisado sobre pares instrucción-respuesta, sin que se documenten fases de RLHF o DPO.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, la mezcla de datos multimodales o de texto, ni sobre posibles innovaciones técnicas adicionales (atención lineal, decodificación especulativa u otras). La model card es mínima y se limita a declarar el modelo base, la licencia y la herramienta de entrenamiento. Cualquier afirmación sobre el proceso de entrenamiento más allá de esto sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), con capacidad multimodal heredada del base.
- Especialización declarada (por el nombre del repositorio) en dominio inmobiliario ("estate"), sin documentación del alcance exacto.
- Compatibilidad con text-generation-inference y transformers, lo que facilita su integración en endpoints de inferencia.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma del repositorio.
- Modo thinking, audio u otras capacidades especiales: no documentado.

## Casos de uso

- Clasificación y extracción de datos de anuncios inmobiliarios: dado el nombre del modelo y su naturaleza multimodal, podría emplearse para extraer campos estructurados (precio, superficie, ubicación, características) a partir de texto e imágenes de fichas de propiedades, aunque la calidad no está verificada.
- Atención al cliente en portales inmobiliarios: generación de respuestas conversacionales en inglés sobre consultas de propiedades, con la ventaja de un modelo pequeño desplegable en infraestructura modesta.
- Generación de descripciones de inmuebles: redacción de textos descriptivos a partir de datos estructurados o imágenes, aprovechando la componente multimodal del base.
- Prototipado rápido y experimentación: al ser un modelo de 873 millones de parámetros con licencia Apache 2.0, es adecuado para pruebas de concepto y fine-tuning adicional en entornos con recursos limitados.
- Despliegue en entornos con restricciones de hardware: su tamaño permite ejecución en GPU de consumo, útil para demos locales o entornos de borde.
- Investigación sobre especialización vertical: sirve como caso de estudio de SFT con Unsloth/TRL sobre un modelo base multimodal pequeño, para comparar estrategias de ajuste.
- Filtrado y moderación de contenido inmobiliario: clasificación de anuncios según criterios definidos, si el ajuste SFT ha cubierto esa tarea (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-2 GB solo para pesos (873 millones de parámetros × 2 bytes), más overhead de activaciones y del procesador de imágenes; en la práctica, entre 3 y 5 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5-0,7 GB (no se publican pesos cuantizados, habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más; incluso en 4 GB con cuantización agresiva.
- Opciones de despliegue: transformers, text-generation-inference (TGI); llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles; al ser un modelo sub-1B, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khipu-r3-estate-sft-v1 | 873 M | no disponible | imagen-texto | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | imagen-texto | no disponible en esta ficha | Hugging Face |
| SmolVLM-500M-Instruct | ~0,5 B | no disponible | imagen-texto | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-3B-Instruct | ~3 B | no disponible | imagen-texto | Apache 2.0 | Hugging Face |

La comparación con alternativas se limita a parámetros, modalidad y licencia, ya que no hay datos de rendimiento publicados para este modelo. Frente al base Qwen3.5-0.8B, la diferencia es el ajuste SFT; frente a SmolVLM o Qwen2.5-VL, la diferencia principal es el tamaño y el enfoque vertical.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste SFT mejore al modelo base en ninguna tarea.
- Model card mínima: no se documenta el dataset de entrenamiento, el número de pasos, la composición de datos ni los hiperparámetros, lo que impide evaluar la calidad y los sesgos introducidos.
- Especialización no verificada: el nombre sugiere dominio inmobiliario, pero no se detalla qué tareas cubre ni con qué datos.
- Idioma: solo inglés según la etiqueta del repositorio; no se garantiza un buen rendimiento en castellano.
- Riesgo de alucinación: como todo modelo generativo de pequeño tamaño, puede inventar datos (precios, superficies, ubicaciones) y no debe usarse en producción sin validación.
- Sesgos: desconocidos, al no documentarse la procedencia de los datos de ajuste; los sesgos del modelo base tampoco se detallan.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en esta ficha.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-05): conviene verificar la autenticidad y vigencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-r3-estate-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
