# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-2k_3k_4k_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje obtenido mediante fusión de checkpoints (model merging) con la herramienta mergekit, publicado por el usuario `yuhengtu-bytedance`. No se trata de un modelo entrenado desde cero ni de un lanzamiento de producto: es un artefacto de investigación que combina tres checkpoints intermedios de un mismo entrenamiento interno denominado `filtered_e2e_insert_hyperstition_v1` (pasos globales 2000, 3000 y 4000), mediante el método Linear con pesos 1, 2 y 3 respectivamente y normalización activada. El resultado es un único checkpoint de aproximadamente 6.856 millones de parámetros (6,86B) con arquitectura GPT-NeoX.

El modelo está etiquetado como `text-generation` y `conversational`, es compatible con la librería transformers y con text-generation-inference, y se distribuye en formato safetensors con pesos en bfloat16 (el cálculo del merge se hizo en float32). El contexto del repositorio es claramente experimental: la ruta de origen de los checkpoints (`Pan_Safety_Better_Measurement`) sugiere un proyecto de medición de seguridad, y la model card no incluye información sobre dataset, idiomas, licencia ni evaluación.

Su relevancia práctica es limitada: cuenta con 0 descargas y 0 "likes", la documentación es mínima y no hay resultados de benchmarks publicados. Resulta de interés sobre todo para quien investigue técnicas de checkpoint averaging o quiera reproducir el pipeline de merge, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only), segun la etiqueta `gpt_neox` |
| Parametros totales | 6.856.253.440 (aprox. 6,86B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (out_dtype bfloat16) |
| Metodo de fusion | Linear (weighted average), `normalize: true` |
| Checkpoints fusionados | global_step2000 (peso 1), global_step3000 (peso 2), global_step4000 (peso 3, tambien base) |
| dtype de calculo | float32 |
| Tamano del repositorio | 13,7 GB |
| Autor | yuhengtu-bytedance |
| Fecha de creacion (segun HuggingFace) | 2026-09-12 |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-NeoX, tal como indica la etiqueta `gpt_neox` del repositorio. Con 6,86B de parámetros y una distribución de pesos en bfloat16, el tamaño del repositorio (13,7 GB) es coherente con 2 bytes por parámetro, sin indicios de mezcla de precisiones ni de pesos cuantizados. No hay información en la model card sobre el número de capas, dimensión del modelo, número de cabezas de atención, tamaño de vocabulario ni longitud de contexto.

Respecto al entrenamiento, lo único documentado es el proceso de fusión, no el entrenamiento previo. Se aplicó el método Linear (promedio ponderado de pesos) definido en el paper `arxiv:2203.05482`, tomando como base el checkpoint del paso 4000 y combinándolo con los pasos 2000 y 3000 con pesos 1, 2 y 3. La normalización estaba activada y el resultado se emitió en bfloat16. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el modelo base original del que provienen esos checkpoints, ya que el campo `base_model` aparece vacío.

## Capacidades

- Generación de texto: es la tarea declarada en el pipeline (`text-generation`).
- Uso conversacional: la etiqueta `conversational` sugiere que el checkpoint de origen pudo haber recibido ajuste orientado a diálogo, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Compatibilidad con transformers y text-generation-inference: puede cargarse con las herramientas estándar del ecosistema HuggingFace.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ninguna lista de idiomas).
- Capacidades especiales (modo "thinking", visión, audio): no disponible.

No se han documentado capacidades adicionales en la model card ni en los resultados de búsqueda web.

## Casos de uso

- Investigación sobre checkpoint averaging: el modelo permite estudiar el efecto de promediar checkpoints con pesos proporcionales a su paso de entrenamiento (1, 2 y 3) y evaluar cómo afecta a la estabilidad y a las métricas frente a usar un único checkpoint. Es el uso más directo dado el origen del artefacto.
- Reproducción de pipelines de mergekit: sirve como ejemplo verificable de una configuración YAML de tipo Linear con normalización, útil para validar flujos de fusión en un entorno propio antes de aplicarlos a modelos mayores.
- Experimentos de medición de seguridad: la ruta de origen (`Pan_Safety_Better_Measurement`) apunta a un proyecto de evaluación de seguridad, por lo que el modelo puede emplearse como punto de comparación en estudios de comportamiento, sesgos o generación de contenido sensible.
- Base para fine-tuning: al ser un modelo denso de 6,86B parámetros y licencia indeterminada, puede servir como punto de partida para ajustes supervisados en tareas concretas, siempre que se resuelva antes la cuestión de la licencia.
- Prototipado de generación de texto en local: en bfloat16 ocupa unos 13,7 GB de pesos, por lo que es viable en una GPU de 24 GB o en una de 16 GB con cuantización posterior, lo que permite prototipar sin infraestructura de servidor.
- Comparación académica de arquitecturas GPT-NeoX: dado que el mismo autor mantiene otros merges de la misma familia, el modelo puede usarse como una variante más en estudios comparativos de técnicas de fusión dentro de esa arquitectura.

En todos los casos conviene evaluar antes el modelo con datos propios, ya que no existe ninguna evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica (ni MMLU, ni HumanEval, ni GSM8K, ni tareas de lenguaje), y los resultados de búsqueda web no aportan datos sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 (16 bits): aproximadamente 13,7 GB solo de pesos, más la caché KV y activaciones, lo que en la práctica exige del orden de 16-18 GB de VRAM para contextos moderados.
- VRAM estimada con cuantización de 8 bits: aproximadamente 7 GB de pesos, viable en GPUs de 10-12 GB.
- VRAM estimada con cuantización de 4 bits (formato GGUF Q4 o similar, previa conversión): aproximadamente 4-4,5 GB de pesos, viable en GPUs de 6-8 GB.
- GPU recomendadas por rango: A100 (40/80 GB) y H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para inferencia en bfloat16 de una sola instancia; RTX 3090, 4080, 4070 Ti y similares para versiones cuantizadas.
- Cabe en GPU de consumo: sí. En bfloat16 en tarjetas de 24 GB (RTX 3090, 4090). En 8 bits en tarjetas de 12-16 GB. En 4 bits en tarjetas de 8 GB o incluso menos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`, también `endpoints_compatible`), vLLM, y llama.cpp u Ollama mediante conversión previa a GGUF.
- Latencia y throughput medidos: no disponible. No hay datos publicados de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

Los valores de las alternativas proceden de sus model cards públicas y se incluyen como referencia de categoría; no forman parte de la información proporcionada sobre este merge.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Este merge | 6,86B | no disponible | GPT-NeoX | no disponible | ninguna |
| Pythia-6.9B | 6,9B | 2048 | GPT-NeoX | Apache 2.0 | disponible en su model card |
| GPT-J-6B | 6B | 2048 | GPT-NeoX-like | Apache 2.0 | disponible en su model card |
| Mistral-7B | 7,2B | 32768 | Transformer (GQA, SwiGLU) | Apache 2.0 | disponible en su model card |

La comparación directa de rendimiento no es posible porque este merge carece de benchmarks y de contexto documentado. La diferencia principal frente a las alternativas es la ausencia de licencia declarada y de información sobre datos de entrenamiento, lo que limita su uso comercial en comparación con Pythia-6.9B, GPT-J-6B o Mistral-7B.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que sea apto para uso comercial. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o en otros idiomas distintos de los que pudiera haber visto durante el entrenamiento.
- Sin benchmarks: no hay ninguna métrica que permita estimar calidad, por lo que la evaluación depende por completo de pruebas propias.
- Riesgo de alucinación: al ser un modelo generativo de 6,86B parámetros sin datos de alineación documentados, es esperable que produzca contenido factualmente incorrecto; no se puede cuantificar el riesgo sin evaluación.
- Sesgos conocidos: no hay información sobre el dataset de entrenamiento, por lo que no se pueden enumerar sesgos específicos; en modelos de este tamaño y origen desconocido son probables sesgos de género, raza y estereotipos.
- Contexto desconocido: sin longitud de contexto documentada, no se puede garantizar un comportamiento correcto más allá de ventanas cortas.
- Origen opaco del modelo base: el campo `base_model` está vacío y los checkpoints fusionados proceden de rutas locales del entorno del autor, por lo que no se puede auditar la procedencia de los datos ni del preentrenamiento.
- Madurez del artefacto: 0 descargas y 0 interacciones; no hay evidencia de que terceros lo hayan validado.
- Riesgo de contenido sensible: el nombre del entrenamiento (`insert_hyperstition`, proyecto de medición de seguridad) sugiere que el modelo pudo entrenarse con datos orientados a probar comportamientos límite; conviene extremar las precauciones en producción.
- Documentación insuficiente: la model card solo describe el merge, no el modelo resultante.

## Enlaces

- HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-2k_3k_4k_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del metodo Linear (merge por promedio ponderado): https://arxiv.org/abs/2203.05482
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas generales de Microsoft, sin relacion con el repositorio.
