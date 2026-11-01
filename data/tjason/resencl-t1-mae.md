# TJason/ResEncL-T1-MAE

## Resumen

ResEncL-T1-MAE es un encoder 3D de tipo solo-encoder (encoder-only) para imagen médica, publicado por el autor TJason como material complementario del artículo "Benchmarking Self-Supervised 3D Medical Vision Foundation Models and Transferability Estimation" (arXiv:2610.17573). Se trata del checkpoint final (época 1000) de un entrenamiento auto-supervisado con enmascaramiento (MAE, Masked Autoencoder) sobre volúmenes de resonancia magnética T1, y no incluye pesos ajustados para tareas posteriores (downstream).

El modelo no es un `AutoModel` de Transformers, sino un encoder nativo de PyTorch basado en la arquitectura ResEncL de MIC-DKFZ/nnssl. Su propósito es servir como extractor de características 3D para investigación en modelos fundacionales de visión médica y en la estimación de transferibilidad, no como sistema de diagnóstico clínico.

Es relevante ahora porque aporta pesos abiertos (CC BY 4.0) de un encoder 3D auto-supervisado reproducible, con un cargador mínimo incluido, lo que facilita experimentos de transferencia en un dominio donde escasean los checkpoints públicos de este tipo. El repositorio ocupa 0,4 GB y registra 27 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResEncL (encoder convolucional 3D, referencia MIC-DKFZ/nnssl) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada 3D; parches recomendados de 160³) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | CC BY 4.0 (pesos); el código del cargador derivado de nnssl conserva CC-BY-SA-4.0 |
| Formato de pesos | checkpoint nativo de PyTorch (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un encoder convolucional 3D ResEncL, adaptado de la configuración de MIC-DKFZ/nnssl. El entrenamiento sigue un esquema auto-supervisado de tipo MAE (Masked Autoencoder) mediante `BaseMAETrainer`, con el checkpoint final en la época 1000 (Model ID: 745). El plan de preentrenamiento registrado emplea remuestreo isótropo de 1 mm, normalización Z-score y parches recomendados de 160³ sobre entrada monocanal 3D.

El repositorio solo contiene los tensores del encoder y la configuración necesaria. Se excluyen explícitamente el decodificador de reconstrucción, el optimizador, los logs de entrenamiento, los argumentos de inicialización y los manifiestos de muestras de entrenamiento. La definición exacta del subconjunto de entrenamiento y las convenciones de preprocesado deben consultarse antes de adaptar el modelo a tareas posteriores. La preparación de la entrada es externa al cargador.

## Capacidades

- Extracción de características 3D a partir de volúmenes de resonancia magnética T1 monocanal.
- Aprendizaje auto-supervisado (MAE) orientado a representaciones transferibles a tareas downstream.
- Uso como backbone congelado o inicialización para fine-tuning en segmentación, clasificación o detección sobre imagen médica 3D.
- Soporte de parches volumétricos de 160³ con remuestreo isótropo de 1 mm.
- Verificación de carga sintética mediante `python load_encoder.py .` con un cubo de 64³.
- No incluye capacidades de texto, tool calling, agentes, visión 2D, audio ni razonamiento multi-paso.

## Casos de uso

- Extracción de embeddings para estimación de transferibilidad: usar el encoder congelado para generar representaciones de volúmenes T1 y medir qué tan bien transfieren a tareas objetivo, que es el propósito central del artículo asociado.
- Inicialización de modelos de segmentación 3D: cargar los pesos como backbone y añadir una cabeza de segmentación para estructuras anatómicas, aprovechando el preentrenamiento MAE sobre parches de 160³.
- Clasificación de imágenes médicas 3D: congelar el encoder y entrenar un clasificador ligero sobre los features extraídos para tareas como detección de patología a nivel de volumen.
- Investigación en modelos fundacionales médicos: servir de baseline reproducible en estudios comparativos de métodos auto-supervisados 3D, dado que el checkpoint y el cargador son públicos.
- Preentrenamiento con inicialización: partir de estos pesos en lugar de inicialización aleatoria para reducir el coste de entrenamiento en datasets pequeños de RM T1.
- Validación de pipelines de preprocesado: emplear el chequeo sintético de carga para verificar que el remuestreo a 1 mm y la normalización Z-score producen tensores compatibles antes de lanzar experimentos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, y el propio autor indica que el chequeo de carga sintética "no establece validez clínica ni rendimiento downstream".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de pesos ocupa 0,4 GB, por lo que el checkpoint en precisión original es manejable en GPU de consumo, aunque el consumo real depende del tamaño de lote y del volumen de entrada (parches de 160³).
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del checkpoint, es plausible su ejecución en GPU de consumo, pero no hay datos oficiales.
- Cabe en GPU de consumo: probable por el tamaño del repositorio (0,4 GB), aunque no confirmado por el autor.
- Opciones de despliegue: carga nativa en PyTorch mediante `load_encoder` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResEncL-T1-MAE | ResEncL 3D (MAE) | no disponible | parches 160³ | CC BY 4.0 | HuggingFace (27 descargas) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el encoder: no hay decodificador de reconstrucción ni pesos ajustados para tareas downstream, por lo que no es utilizable directamente como sistema de predicción.
- No es un `AutoModel` de Transformers; requiere el cargador específico del repositorio y PyTorch nativo.
- Entrada restringida a RM T1 monocanal 3D con preprocesado concreto (1 mm isótropo, Z-score, parches de 160³); desviarse de estas convenciones puede degradar las representaciones.
- No validado como sistema de diagnóstico clínico; el autor lo declara destinado a investigación.
- Riesgo de sesgo no caracterizado: la definición exacta del subconjunto de entrenamiento no se publica, lo que impide evaluar la representatividad de la población de imágenes.
- Licencia de los pesos CC BY 4.0 (permite uso comercial con atribución), pero el código del cargador derivado de nnssl mantiene CC-BY-SA-4.0 con obligaciones de atribución y share-alike separadas; la licencia de pesos no relicencia dependencias de terceros.
- No se publican logs de entrenamiento, argumentos de inicialización ni manifiestos de muestras, lo que limita la reproducibilidad completa.
- Sin datos de benchmarks ni de rendimiento downstream; no debe asumirse calidad clínica por el hecho de estar publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TJason/ResEncL-T1-MAE
- Artículo: https://arxiv.org/abs/2610.17573v1
- Repositorio de referencia de arquitectura: https://github.com/MIC-DKFZ/nnssl
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
