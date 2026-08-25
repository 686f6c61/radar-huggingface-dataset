# ssilvabruno/cs224n-classify

## Resumen

El modelo `ssilvabruno/cs224n-classify` es una implementación a gran escala de la arquitectura perceiver, orientada a tareas de recuperación de información (retrieval). Desarrollado por ssilvabruno, el repositorio se enmarca en el contexto del curso Stanford CS 224N de procesamiento de lenguaje natural con deep learning, aunque no se especifica si se trata de un proyecto de fin de curso o de una investigación independiente.

La arquitectura perceiver se caracteriza por procesar entradas de alta dimensionalidad mediante un mecanismo de atención que reduce el coste computacional, y en esta variante se emplea atención lineal para escalar a secuencias largas. La fusión de modalidades se realiza mediante una estrategia tucker, con activación gelu-tanh, normalización instancenorm e inicialización xavier. El entrenamiento utiliza el optimizador lamb con un scheduler de tipo cosine.

La relevancia de este modelo radica en su enfoque sobre eficiencia computacional para tareas de retrieval, un área activa en sistemas de búsqueda y recuperación de información. No obstante, la información pública es muy limitada: no se proporcionan datos de parámetros, contexto, idiomas, ni resultados de benchmarks, por lo que su evaluación práctica queda restringida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceiver con atención lineal |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura perceiver se caracteriza por procesar entradas de alta dimensionalidad (como imágenes, audio o texto) mediante una representación latente compacta, reduciendo el coste computacional frente a transformers estándar. En esta implementación se usa atención lineal, lo que supone una complejidad computacional de orden lineal con la longitud de la secuencia, frente al coste cuadrático de la atención clásica. La fusión de información entre las entradas y el latente se realiza mediante una estrategia de tipo tucker, una descomposición tensorial que combina modos de interacción.

El entrenamiento utiliza el optimizador lamb (Layer-wise Adaptive Moments for Batch training), diseñado para acelerar la convergencia en modelos grandes, con un scheduler de aprendizaje de tipo coseno. La activación es gelu-tanh, una variante de GELU con tanh en lugar de la aproximación sigmoide, y se aplica normalización de instancia (instancenorm) en lugar de la habitual layer normalization. La inicialización de pesos es de tipo xavier.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio solo contiene un archivo `eval.py`, lo que sugiere que el modelo se distribuye como un artefacto de evaluación, pero no se ofrece el código de entrenamiento ni los pesos.

## Capacidades

- Tareas de retrieval: el modelo está diseñado específicamente para recuperación de información, es decir, para devolver documentos relevantes dada una consulta.
- Procesamiento de secuencias largas: gracias a la atención lineal, puede procesar secuencias más largas que un transformer estándar con un coste computacional menor.
- Fusión multimodal: la estrategia de fusión tucker sugiere capacidad para combinar información de distintas fuentes o modalidades, aunque no se especifican cuáles.
- Arquitectura perceiver: permite procesar entradas de dimensionalidad arbitraria, lo que puede ser útil en tareas de retrieval sobre texto, imágenes u otros formatos.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües específicas.

## Casos de uso

- Recuperación de documentos en un corpus técnico: el modelo puede utilizarse para indexar y recuperar documentos relevantes ante consultas, aprovechando la atención lineal para manejar corpus extensos con coste computacional moderado.
- Sistemas de búsqueda semántica en entornos con recursos limitados: dado que la atención lineal reduce el coste de inferencia, es adecuado para despliegues en los que no se dispone de GPUs de gran capacidad.
- Clasificación de textos con contexto largo: aunque el objetivo declarado es retrieval, la arquitectura perceiver permite tareas de clasificación sobre secuencias largas sin truncamiento agresivo.
- Experimentación académica en NLP: al estar vinculado al curso CS224N, puede servir como base para prácticas de implementación de arquitecturas alternativas a transformers.
- Evaluación de arquitecturas eficientes: el repositorio contiene un script `eval.py`, útil para comparar el rendimiento de esta variante frente a modelos de atención clásica.
- Investigación en fusión tensorial: la estrategia de fusión tucker es poco común y puede interesar a investigadores que estudien métodos de combinación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni ningún otro punto de referencia estándar. Tampoco se dispone de comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible. Al no conocerse el número de parámetros, no se puede estimar el requisito de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: el repositorio solo contiene `eval.py`, sin indicaciones de frameworks de inferencia compatibles (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se especifican modelos comparables de la misma categoría (perceiver para retrieval) ni se aportan datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo ni el código de entrenamiento, solo un archivo `eval.py`. Esto impide reproducir los resultados o desplegar el modelo en producción sin trabajo adicional.
- No se han documentado datos de entrenamiento, lo que impide evaluar posibles sesgos en las representaciones.
- No se ha verificado la capacidad de generalización a dominios distintos del utilizado en el entrenamiento.
- La licencia BSD-3-Clause permite uso comercial, pero no se garantiza la ausencia de patentes ni la idoneidad para aplicaciones críticas.
- No hay evidencia de alineación (RLHF/DPO) ni de mitigación de alucinaciones; en tareas de retrieval, la precisión de los resultados dependerá de la calidad del índice y de los datos de entrenamiento.
- La ausencia de benchmarks y de especificaciones de contexto dificulta cualquier evaluación seria de sus capacidades reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ssilvabruno/cs224n-classify
- Curso Stanford CS 224N: https://web.stanford.edu/class/cs224n/
- Proyecto CS224N de referencia en GitHub: https://github.com/psr-ai/CS224N-default-project
- Tutorial de PyTorch del curso CS224N: https://colab.research.google.com/github/ryanyuchen/NLP-Pytorch/blob/main/CS224N_PyTorch_Tutorial.ipynb
- Repositorio de soluciones del curso (Winter 2022/23): https://github.com/floriankark/cs224n-win2223
