# vcruz305/GLM-5.3-Flash-SAGE-REXL3-2.48bpw

## Resumen

GLM-5.3-Flash-SAGE-REXL3-2.48bpw es una cuantización de precisión mixta del modelo multimodal GLM-5.3-Flash de Z.ai, publicada por el usuario vcruz305 en Hugging Face. Se trata de una conversión EXL3 (ExLlamaV3) con cuantización SAGE MixedK a 2,48 bits por peso, orientada a la inferencia eficiente del modelo base en GPUs con memoria limitada. El repositorio contiene pesos en formato safetensors para la librería exllamav3 y suma 209,5 GB, con 53.334.868.062 parámetros almacenados en el checkpoint cuantizado.

El modelo base, GLM-5.3-Flash, es un modelo nativamente multimodal de Z.ai con arquitectura de mezcla de expertos (MoE), 320.000 millones de parámetros totales y aproximadamente 18.000 millones activos por token. Emplea atención híbrida (sparse más linear attention) e incorpora manifold-constrained hyper-connections. Esta cuantización busca hacer viable el despliegue del modelo completo en hardware de una sola máquina o en nodos multi-GPU de gama alta, reduciendo el peso desde el formato BF16 original.

La relevancia de esta ficha radica en que documenta una pieza de infraestructura práctica: una conversión comunitaria de un modelo de frontera que no ha pasado por etapas adicionales de entrenamiento. El acceso al repositorio está restringido (gated) y requiere aceptar las condiciones en Hugging Face. La licencia declarada es MIT, aunque conviene verificar las condiciones del modelo base antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (sparse + linear attention) y manifold-constrained hyper-connections |
| Parámetros totales | 53.334.868.062 en el checkpoint cuantizado; 320B totales en el modelo base BF16 |
| Parámetros activos | ~18B (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 SAGE MixedK a 2,48 bpw (precisión mixta) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (exl3), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura de mezcla de expertos con 320.000 millones de parámetros totales y unos 18.000 millones activos por token, lo que permite un coste computacional por token muy inferior al de un modelo denso del mismo tamaño. La arquitectura combina atención sparse con atención linear (híbrida) e incorpora manifold-constrained hyper-connections, un mecanismo de conexión entre capas que, según la información disponible, forma parte del diseño del modelo base. Es un modelo nativamente multimodal, con pipeline image-text-to-text.

Esta publicación concreta no entrena el modelo: es una conversión de cuantización. Según la información del autor, la arquitectura GLM-5.3-Flash y la fuente de conversión BF16 proceden de Blackfrost-AI (modelo RED-SNOW), y la conversión SAGE MixedK a EXL3 se realiza a partir de esa fuente BF16. La conversión no añade ninguna etapa de entrenamiento. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, según el pipeline declarado (conversational).
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text), al ser un modelo nativamente multimodal.
- Mezcla de expertos con ~18B parámetros activos, lo que reduce el coste por token frente a un denso de 320B.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de gran escala en un nodo multi-GPU: la cuantización a 2,48 bpw reduce el peso del checkpoint a 209,5 GB, lo que permite cargar el modelo en configuraciones de varias GPU de 80 GB sin recurrir al formato BF16 completo.
- Inferencia de visión y lenguaje en producción con ExLlamaV3: al estar empaquetado para exllamav3, se integra en pipelines que ya usan este runtime para generación de texto e imagen a texto con latencia controlada.
- Prototipado e investigación sobre modelos MoE multimodales: permite estudiar el comportamiento de un MoE de 320B con ~18B activos en hardware asequible para un laboratorio, sin necesidad de un clúster dedicado.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de EXL3 SAGE MixedK a 2,48 bpw frente al modelo BF16 en tareas de razonamiento y visión.
- Generación de descripciones y análisis de imágenes en lote: el pipeline image-text-to-text permite procesar catálogos de imágenes con contexto conversacional, siempre que la ventana de contexto del modelo base lo permita.
- Asistentes conversacionales con entrada visual: integrable en aplicaciones de chat que reciben capturas o fotografías y requieren respuestas multi-turno, aprovechando la naturaleza multimodal del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 209,5 GB en disco; en EXL3 la carga requiere memoria proporcional al tamaño cuantizado, por lo que se necesita un total de VRAM en el entorno de los 210 GB o superior, más overhead de contexto y caché KV.
- GPU recomendadas: configuraciones multi-GPU con H100 80 GB (3 unidades), A100 80 GB (3 unidades) o combinaciones equivalentes; no cabe en una sola GPU de 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer individual; requeriría un conjunto de varias GPU consumer con suficiente VRAM agregada, algo no habitual en EXL3.
- Opciones de despliegue: ExLlamaV3 (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas para este formato exl3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-SAGE-REXL3-2.48bpw (este) | 53,3B en checkpoint; 320B base | ~18B | no disponible | EXL3 2,48 bpw | MIT | Gated en Hugging Face |
| RED-SNOW-5.3-FLASH-EXL3-SAGE-2.49bpw | 320B base | ~18B | no disponible | EXL3 SAGE 2,49 bpw | no disponible | Hugging Face |
| GLM-5.3-Flash (BF16, zai-org) | 320B | ~18B | no disponible | BF16 | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye datos de rendimiento ni especificaciones de modelos alternativos de otros desarrolladores.

## Limitaciones y advertencias

- La cuantización a 2,48 bpw puede degradar la calidad frente al modelo BF16, especialmente en tareas de razonamiento complejo y percepción visual; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- La licencia declarada es MIT, pero conviene verificar la licencia y condiciones del modelo base zai-org/GLM-5.3-Flash antes de un uso comercial, ya que la cuantización hereda las restricciones del original.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta conversión.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria amplia de su funcionamiento.
- El tamaño de 209,5 GB y los requisitos de VRAM agregada limitan su despliegue a infraestructura multi-GPU de gama alta.
- No se ha confirmado el soporte de este formato exl3 en runtimes distintos de ExLlamaV3.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/GLM-5.3-Flash-SAGE-REXL3-2.48bpw
- Conversión relacionada RED-SNOW-5.3-FLASH-EXL3-SAGE-2.49bpw: https://huggingface.co/vcruz305/RED-SNOW-5.3-FLASH-EXL3-SAGE-2.49bpw
- Modelo base: zai-org/GLM-5.3-Flash (referenciado en la ficha de Hugging Face)
