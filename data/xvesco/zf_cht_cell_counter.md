# xvesco/zf_cht_cell_counter

## Resumen

El modelo `xvesco/zf_cht_cell_counter` es una colección de checkpoints de segmentación de imágenes basados en arquitectura U-Net, entrenados para el análisis automatizado de microscopía de fluorescencia en embriones de pez cebra. El pipeline cubre tres tareas encadenadas: segmentación de la región del tejido hematopoyético caudal (CHT, por sus siglas en inglés), detección de células madre y progenitoras hematopoyéticas (HSPC) y estimación del recuento celular dentro de esa región, devolviendo además máscaras a nivel de píxel. Lo publica el usuario de Hugging Face `xvesco` y se distribuye con licencia MIT.

El modelo resuelve un cuello de botella clásico en biología del desarrollo y cribado químico: el recuento manual de HSPC en imágenes de fluorescencia es lento, subjetivo y difícil de escalar en experimentos con cientos o miles de embriones. Al automatizar la segmentación y el conteo, permite procesar lotes de imágenes de forma consistente y exportar recuentos por embrión. Es relevante para laboratorios que trabajan con el modelo de pez cebra en estudios de hematopoyesis y para plataformas de cribado de alto contenido.

El repositorio (0,7 GB) contiene checkpoints, metadatos de entrenamiento y configuraciones geométricas, pero no los conjuntos de datos de imagen, que según la model card se alojan en Zenodo (el enlace aparece sin completar en el README). El modelo está pensado para usarse a través del paquete Python `zf_cht_cell_counter`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (segmentación de imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene checkpoints, sin formato especificado en la información disponible) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net, la red convolucional encoder-decoder con conexiones skip habitual en segmentación biomédica. La familia de modelos se organiza en tres variantes según la procedencia de las imágenes: **Keyence**, entrenada con imágenes del microscopio de fluorescencia Keyence BZ-X710 centradas en la región CHT del embrión; **Chem-screen**, entrenada con imágenes de cribado químico adquiridas en el sistema de alto contenido PerkinElmer Opera Phenix Plus; y **Combined**, un modelo HSPC entrenado con ambos conjuntos de datos y emparejado con modelos de segmentación CHT dependientes del tamaño.

No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de ajuste fino como RLHF o DPO (no aplicables en este dominio). Tampoco se detalla la función de pérdida, el número de épocas ni los hiperparámetros de entrenamiento. La innovación práctica del paquete es la combinación de segmentación de región y detección celular con modelos específicos por dominio de adquisición, lo que permite adaptar el pipeline a distintas condiciones de imagen.

## Capacidades

- Segmentación semántica de la región CHT en imágenes de fluorescencia de embriones de pez cebra.
- Detección de HSPC (células madre y progenitoras hematopoyéticas) dentro de la región CHT.
- Estimación del recuento celular por imagen o por embrión a partir de las máscaras predichas.
- Generación de máscaras a nivel de píxel para inspección y validación visual.
- Adaptación a dos dominios de adquisición distintos (Keyence BZ-X710 y PerkinElmer Opera Phenix Plus) y variante combinada.
- Segmentación CHT dependiente del tamaño en la variante combinada.
- Integración con un paquete Python que gestiona descarga de modelos, preprocesado, inferencia y exportación de recuentos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- **Cribado químico de alto contenido:** procesar lotes de imágenes del sistema Opera Phenix Plus con los modelos de la familia Chem-screen para cuantificar el efecto de compuestos sobre el número de HSPC por embrión, sustituyendo el recuento manual por un pipeline reproducible.
- **Estudios de hematopoyesis en pez cebra:** analizar imágenes del Keyence BZ-X710 centradas en la región CHT para comparar recuentos de HSPC entre condiciones genéticas o tratamientos, con máscaras exportadas para revisión.
- **Validación cruzada de anotaciones:** usar las máscaras predichas como propuesta inicial que el anotador humano corrige, reduciendo el tiempo de etiquetado en la creación de nuevos datasets.
- **Análisis retrospectivo de experimentos:** aplicar el modelo a imágenes ya adquiridas en el laboratorio para obtener recuentos que no se midieron manualmente en su momento, siempre que la resolución y las condiciones de adquisición sean compatibles.
- **Control de calidad de adquisición:** detectar imágenes con fluorescencia débil o fuera de foco comparando la coherencia entre la máscara CHT segmentada y la intensidad esperada, como filtro previo al análisis.
- **Formación y docencia:** ilustrar el flujo completo de segmentación y conteo celular en un organismo modelo con un paquete Python abierto y licencia permisiva.
- **Integración en pipelines de laboratorio:** incorporar el paquete en scripts de procesamiento por lotes que recorran directorios de imágenes y exporten tablas de recuentos por embrión para su análisis estadístico posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara la métrica F1 en los metadatos, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una U-Net de segmentación, la huella es muy inferior a la de un modelo de lenguaje; el repositorio completo ocupa 0,7 GB, lo que sugiere checkpoints de tamaño moderado.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y memoria suficiente para el tamaño de imagen de entrada debería ser viable; no se especifican modelos concretos.
- GPU de consumo: probablemente viable en tarjetas consumer recientes (RTX 3060 o superiores), aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: el uso previsto es mediante el paquete Python `zf_cht_cell_counter`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zf_cht_cell_counter | Segmentación CHT y conteo de HSPC | U-Net | Pez cebra, fluorescencia | MIT | Hugging Face |
| Cellpose | Segmentación celular general | Red con flujo vectorial | Microscopía variada | BSD-3 (según versión) | GitHub y paquete Python |
| StarDist | Detección de núcleos | CNN con geometría estelar | Núcleos en microscopía | BSD-3 | GitHub |
| Segment Anything (SAM) | Segmentación promptable general | Transformer | Imágenes naturales y médicas | Apache 2.0 | Meta AI |

La comparación es orientativa: Cellpose, StarDist y SAM son herramientas de propósito general, mientras que este modelo está especializado en la región CHT y en HSPC de pez cebra, lo que puede ofrecer mejor ajuste al dominio a costa de menor generalidad. No se dispone de métricas comparativas publicadas.

## Limitaciones y advertencias

- El rendimiento varía según la resolución de imagen, la intensidad de fluorescencia, las condiciones de adquisición y las diferencias biológicas entre muestras; la propia model card recomienda inspeccionar las máscaras y validar los recuentos contra anotaciones manuales antes de analizar un nuevo dataset.
- No hay información sobre sesgos del modelo; al entrenarse con un número limitado de microscopios y protocolos, puede generalizar mal a equipos o condiciones no representadas.
- Riesgo de falsos positivos y negativos en la detección de HSPC, especialmente con células superpuestas o fluorescencia débil; el recuento debe tratarse como estimación.
- El enlace a los conjuntos de datos en Zenodo aparece sin completar en el README, lo que dificulta la reproducibilidad del entrenamiento.
- No se documentan los formatos de pesos ni los requisitos de entrada, por lo que la integración directa fuera del paquete Python puede requerir inspección manual del repositorio.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no exime de validar el modelo en el contexto de aplicación.
- No es un modelo de lenguaje: no procesa texto ni admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xvesco/zf_cht_cell_counter
- Perfil del autor: https://huggingface.co/xvesco
- Paquete Python: https://github.com/blaserlab/zf_cht_cell_counter
- Conjuntos de datos en Zenodo: enlace no disponible (aparece sin completar en la model card)
