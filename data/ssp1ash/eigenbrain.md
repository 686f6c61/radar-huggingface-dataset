# SSp1ash/Eigenbrain

## Resumen

Eigenbrain es un paquete de inferencia congelada (frozen inference bundle) publicado por el autor SSp1ash para tres demostraciones independientes de decodificación cerebral: clasificación de señales EEG, decodificación de lenguaje a partir de actividad neuronal y reconstrucción de imágenes desde resonancia magnética funcional (fMRI). No se trata de un modelo entrenable, sino de un conjunto de pesos y rutas de inferencia preconfiguradas que permiten reproducir resultados de investigación sin necesidad de reentrenar ni ajustar preprocesados.

El repositorio incluye tres rutas diferenciadas: una para clasificación de EEG usando un encoder de atención temporal/modal, otra para decodificación de lenguaje que combina un modelo de producto de expertos (PoE) con QFormer, tokens BGE y un adaptador LoRA sobre Phi-4-mini-instruct, y una tercera para reconstrucción de imágenes fMRI basada en MindEye2 con un prior de difusión SDXL-unCLIP. El tamaño total del repositorio es de 22 GB, con el archivo más grande (un checkpoint de unCLIP) ocupando aproximadamente 18 GB. La licencia es MIT, aunque los componentes externos (Phi-4, BGE-M3, MindEye2, SDXL-unCLIP y los datos NSD) tienen sus propios términos.

La relevancia de Eigenbrain radica en que proporciona un punto de partida reproducible para investigaciones en interfaces cerebro-computadora y decodificación neural, permitiendo evaluar pipelines completos sin necesidad de entrenar modelos desde cero. Sin embargo, es importante señalar que los resultados reportados corresponden a un "replay" congelado de un subconjunto de ejemplos, no a una evaluación independiente exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-ruta: encoder temporal/modal para EEG; PoE + QFormer + BGE + Phi-4 LoRA para lenguaje; MindEye2 + SDXL-unCLIP para imagen |
| Parametros totales | no disponible (el repositorio pesa 22 GB, pero no se especifica el numero de parametros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje puro; la ruta de lenguaje usa Phi-4-mini-instruct con su contexto nativo) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en formato safetensors y checkpoint) |
| Idiomas soportados | no disponible (la decodificacion de lenguaje produce texto en ingles, segun los ejemplos) |
| Licencia | MIT (para el codigo y assets propios; componentes externos tienen sus propias licencias) |
| Formato de pesos | safetensors (para la mayoria de assets) y checkpoint (para el archivo unCLIP) |

## Arquitectura y entrenamiento

Eigenbrain no es un modelo unico, sino un conjunto de tres rutas de inferencia independientes, cada una con su propia arquitectura:

- **Clasificacion EEG**: utiliza un encoder basado en atencion temporal y de modos (temporal/mode-attention) que procesa señales EEG en el dominio de modos propios (eigenmodes) del dataset SEED-V, seguido de una cabeza de clasificacion de 5 clases.
- **Decodificacion de lenguaje**: combina un modelo de producto de expertos (PoE) con una capa de sujeto, un QFormer, tokens generados por BGE-M3 y un adaptador LoRA sobre el modelo base `microsoft/Phi-4-mini-instruct`. Esta ruta toma observaciones de actividad cerebral (del dataset Alice BCI) y un "prior" para generar texto decodificado.
- **Reconstruccion de imagen fMRI**: emplea un enfoque de PoE anclado (anchored PoE) junto con la red BrainNetwork de MindEye2, un prior de difusion y un decodificador SDXL-unCLIP. La entrada son datos CIFTI-4096 y modos-2000 del sujeto 1 del dataset NSD.

El repositorio no incluye informacion sobre el proceso de entrenamiento (datos, numero de tokens, tecnicas de alineacion como RLHF o DPO). Se describe como un "bundle de inferencia congelada" que no entrena modelos ni ajusta transformaciones de preprocesado. Los pesos incluidos son los resultados de proyectos previos, y el codigo de descarga (`download_assets.py`) obtiene los modelos base publicos (Phi-4-mini-instruct y BGE-M3) por separado.

## Capacidades

- Clasificacion de señales EEG en 5 clases (dataset SEED-V), con una precision aproximada del 40% en un subconjunto de 10 ejemplos de prueba.
- Decodificacion de lenguaje a partir de observaciones de actividad cerebral (dataset Alice BCI), generando texto en ingles con una similitud coseno media de 0.81 en embeddings BGE sobre 5 ejemplos.
- Reconstruccion de imagenes desde fMRI del sujeto 1 del dataset NSD, con una puntuacion de identificacion CLIP 2-way de 0.783 en el test completo archivado.
- Soporte de ejecucion en GPU CUDA para las tres rutas.
- Capacidad de omitir la descarga de los archivos NSD pesados si solo se necesitan las rutas de clasificacion y lenguaje (`--skip-nsd`).
- No incluye capacidades de tool calling, agentes, ni razonamiento multi-paso; es un sistema de inferencia dirigida a tareas especificas de decodificacion neural.

## Casos de uso

- **Investigacion en interfaces cerebro-computadora (BCI)**: el modelo permite evaluar pipelines de clasificacion de EEG en entornos de laboratorio, sirviendo como referencia para comparar nuevos algoritmos de decodificacion de señales cerebrales.
- **Estudios de decodificacion del lenguaje**: la ruta de lenguaje puede utilizarse para explorar como se representa el significado linguistico en la actividad cerebral, facilitando experimentos de neurociencia cognitiva sobre comprension del habla.
- **Reconstruccion de imagenes percibidas**: la ruta fMRI permite reconstruir visualmente lo que un sujeto esta viendo a partir de su actividad cerebral, util en investigacion sobre percepcion visual y memoria.
- **Reproducibilidad de resultados cientificos**: al ser un bundle congelado, otros investigadores pueden ejecutar las demos y verificar los resultados publicados sin necesidad de reentrenar modelos, lo que facilita la comparacion entre estudios.
- **Desarrollo de prototipos de neurotecnologia**: empresas o grupos de investigacion pueden usar las rutas como base para construir aplicaciones de asistencia a pacientes con discapacidad de comunicacion, aunque se requiere validacion adicional y adaptacion a cada sujeto.
- **Educacion y formacion en neurociencia computacional**: el codigo y los assets pueden emplearse en cursos universitarios para ilustrar conceptos de decodificacion neural, preprocesado de señales y reconstruccion de imagenes.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden a un "replay" congelado de un subconjunto de ejemplos, no a una evaluacion independiente exhaustiva. Se presentan a continuacion:

| Tarea | Metrica | Resultado | Numero de ejemplos |
|---|---|---|---|
| Clasificacion EEG | Precision | ~40% | 10 |
| Decodificacion de lenguaje | Similitud coseno BGE (media) | ~0.81 | 5 |
| Reconstruccion de imagen fMRI | CLIP 2-way identification (test completo archivado) | 0.783 | no especificado |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no se especifica oficialmente, pero el archivo unCLIP de 18 GB sugiere que la ruta de imagen requiere al menos 24 GB de VRAM para cargar el checkpoint en memoria (probablemente mas con el modelo de difusion y el decodificador). Las rutas de EEG y lenguaje son mas ligeras, pero aun requieren GPU CUDA.
- **GPU recomendadas**: para la ruta de imagen, se necesitan GPUs de gama alta como NVIDIA A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) con suficiente almacenamiento. Para las rutas de clasificacion y lenguaje, una GPU con 8-16 GB de VRAM (por ejemplo, RTX 3060/3070/3080) podria ser suficiente, dependiendo del tamano de los modelos base.
- **Compatibilidad con GPU de consumo**: la ruta de imagen probablemente no cabe en GPUs de consumo con menos de 24 GB de VRAM. Las rutas de EEG y lenguaje podrian ejecutarse en GPUs de consumo con al menos 8 GB, pero no se garantiza.
- **Opciones de despliegue**: el codigo proporcionado usa `run_demo.py` con PyTorch y CUDA. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; es un pipeline de investigacion, no un servicio de produccion.
- **Latencia y throughput**: no disponibles. Dado el tamano de los modelos y la naturaleza de las tareas, se espera una latencia de segundos a minutos por ejemplo, especialmente en la reconstruccion de imagen.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el ambito de decodificacion cerebral con las mismas caracteristicas (bundle congelado multi-tarea). Existen modelos academicos como MindEye2 o Brain2Image, pero no se proporcionan datos de comparacion en la documentacion. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **No es un modelo entrenable**: el repositorio es un bundle de inferencia congelada; no se pueden ajustar los pesos ni reentrenar las rutas sin acceso al codigo de entrenamiento original.
- **Resultados limitados a un subconjunto**: los valores de precision y similitud reportados se basan en 10 y 5 ejemplos respectivamente, lo que no constituye una evaluacion estadisticamente significativa.
- **Especificidad de sujeto**: la ruta de reconstruccion de imagen esta entrenada para el sujeto 1 del dataset NSD; no es un decodificador generalizable a otros sujetos sin recalibracion.
- **Riesgo de alucinacion en lenguaje**: aunque la ruta de lenguaje genera texto coherente, la decodificacion puede producir contenido inexacto o inventado, especialmente con señales ruidosas.
- **Restricciones de licencia de componentes externos**: aunque el codigo y assets propios tienen licencia MIT, los modelos base (Phi-4, BGE-M3, MindEye2, SDXL-unCLIP) y los datos NSD tienen sus propios terminos que pueden limitar el uso comercial o la redistribucion.
- **Requisitos de almacenamiento y memoria**: el archivo unCLIP de 18 GB y los modelos base adicionales requieren un espacio en disco considerable y una GPU con mucha VRAM, lo que limita su uso en entornos modestos.
- **Sin soporte de produccion**: el codigo esta orientado a demos de investigacion; no incluye manejo de errores, escalabilidad ni optimizaciones para despliegue en servicios.

## Enlaces

- Repositorio HuggingFace: [SSp1ash/Eigenbrain](https://huggingface.co/SSp1ash/Eigenbrain)
- No se han encontrado otros enlaces (papers, blogs, repos) en la informacion proporcionada.
