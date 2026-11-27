# VeroLM/NoTokenLM-ImageGen-Class-2.5

## Resumen

NoTokenLM-ImageGen-Class-2.5 es un clasificador de imágenes para ImageNet-1k desarrollado por el usuario VeroLM y publicado en Hugging Face. A pesar del nombre, no es un modelo generativo ni un modelo de lenguaje: se trata de una red neuronal convolucional híbrida con un único bloque de autoatención global, entrenada desde cero para predecir una de las 1.000 clases del dataset ILSVRC/imagenet-1k. El modelo es deliberadamente minúsculo, con 6.479.016 parámetros, y su propuesta principal es demostrar que una arquitectura sin tokens ni tronco transformer puede obtener resultados razonables en clasificación de imágenes con un coste computacional muy bajo.

La arquitectura combina un stem de space-to-depth 4×4, bloques Fused-MBConv y ConvNeXt, y una capa de autoatención global de 4 cabezas en el último bloque. Se entrenó íntegramente en JAX sobre una única TPU v5e-1 en Google Colab, lo que refuerza su carácter de experimento reproducible y de bajo presupuesto. Acepta imágenes de 64 px o 128 px y devuelve logits sobre las 1.000 clases.

Su relevancia actual es limitada pero concreta: sirve como referencia educativa de entrenamiento eficiente con el optimizador Muon, como baseline ligero de clasificación y como ejemplo de empaquetado de arquitecturas personalizadas en `transformers` mediante `trust_remote_code`. No está pensado para producción a gran escala ni para tareas generativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolucional/atención: stem space-to-depth 4×4, Fused-MBConv, ConvNeXt blocks y una capa de autoatención global de 4 cabezas en el último bloque |
| Parametros totales | 6.479.016 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; entrada de 64 px o 128 px) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors (`model.safetensors`, fp32, pesos EMA) |

## Arquitectura y entrenamiento

La red procesa la imagen normalizando los píxeles a `(x − 127.5) / 127.5` y aplicando un stem de space-to-depth 4×4 con 48 canales seguido de una convolución 3×3 y LayerNorm, con stride 4 y 64 canales. A continuación encadena dos bloques Fused-MBConv (stage 1, stride 4, 64 canales), tres bloques ConvNeXt con depthwise 7×7 en stage 2 (stride 8, 128 canales), tres bloques ConvNeXt en stage 3 (stride 16, 256 canales) y dos bloques ConvNeXt en stage 4 (stride 16, 384 canales), donde el último incorpora una capa de autoatención global de 4 cabezas sobre 8×8 = 64 posiciones a 128 px (16 posiciones a 64 px). La cabeza es un global average pool, LayerNorm, Linear(384→1024), GELU y Linear(1024→1000). El stride de salida es 16, por lo que alto y ancho deben ser múltiplos de 16. Emplea layer-scale, stochastic depth de 0.1 y tanh-GELU.

El entrenamiento consta de 112.097 pasos de optimizador en tres fases: `A_64` a 64 px con el conjunto completo de ImageNet-1k (1.281.167 imágenes, batch 512), `B_128` a 128 px con un subconjunto balanceado de 300 imágenes por clase (300.000, batch 256) y `C_128` a 128 px con el resto de imágenes (batch 256). Usa Muon (Newton-Schulz, 5 iteraciones, Nesterov, momentum 0.95) para las matrices de pesos 2-D salvo el clasificador, y AdamW para sesgos, normas, layer-scales, kernels de convolución y clasificador. Weight decay 0.05, recorte global de norma de gradiente 1.0, LR pico 2e-3 con calentamiento de 2 épocas y decaimiento coseno sobre `A_64` + `B_128`, y reinicio con calentamiento de 300 pasos y LR pico 5e-4 en `C_128`. Aumentación con random-resized-crop (escala 0.30–1.0, aspecto 3/4–4/3) y flip horizontal en dispositivo, label smoothing 0.1 y stochastic depth 0.1; CutMix disponible pero desactivado. Se publican pesos EMA (decay hasta 0.9999) en fp32.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, devolviendo logits y probabilidades softmax.
- Entrada flexible: imagen PIL, ruta de archivo, array `H×W×3` uint8 o lista de cualquiera de ellos.
- Resoluciones soportadas de 64 px y 128 px (entrenadas); cualquier múltiplo de 16 se ejecuta pero no está probado.
- Preprocesado integrado (`preprocess_images`) que reproduce la cadena centro-cuadrado → Lanczos 256 → Lanczos 128 → Lanczos al objetivo.
- Inferencia en CPU y CUDA, con `float32` o `bfloat16` según el script de línea de comandos.
- Salida top-k configurable y modo JSON para integración en pipelines.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Clasificación rápida en el borde (edge): con 6,48 M de parámetros y pesos fp32 de ~26 MB, el modelo cabe en dispositivos con recursos muy limitados y puede ejecutarse en CPU para etiquetar imágenes en local sin depender de servicios externos.
- Prototipado educativo de arquitecturas híbridas: sirve para estudiar en la práctica cómo conviven convoluciones y un bloque de autoatención global, y para reproducir el entrenamiento con Muon sobre una sola TPU v5e-1.
- Baseline ligero en experimentos de visión: útil como referencia de bajo coste antes de escalar a modelos mayores en tareas de clasificación de 1.000 clases.
- Filtrado y etiquetado de datasets de imágenes: puede preetiquetar lotes de imágenes a 64 px o 128 px para triaje previo y revisión humana posterior.
- Demostración de empaquetado con `trust_remote_code`: ejemplo funcional de cómo distribuir una arquitectura personalizada en `transformers` con código de inferencia en PyTorch incluido.
- Pruebas de integración en pipelines de CI/CD de visión: su reducido tamaño permite incluirlo en tests automatizados de preprocesado y clasificación sin coste de GPU.
- Docencia y talleres: cuaderno interactivo (`notebook.ipynb`) para Colab, Kaggle o Jupyter que permite subir imágenes y ver predicciones top-k en barras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la posibilidad de reproducir la accuracy de validación mediante `evaluate.py`, pero no incluye cifras concretas de accuracy top-1 ni top-5 en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el modelo (6,48 M de parámetros, ~26 MB de pesos) más el espacio de activaciones, que es reducido a 64 px y 128 px.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo se entrenó en una TPU v5e-1 y no requiere aceleradores de gama alta.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (PyTorch), script `inference.py` incluido, y exportación potencial a otros runtimes no documentada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros clasificadores de ImageNet-1k ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo exclusivamente de clasificación de imágenes; no genera texto, código ni imágenes pese a la palabra "ImageGen" del nombre.
- Entrenado solo a 64 px y 128 px; otras resoluciones múltiplo de 16 se ejecutan pero no están validadas y pueden degradar la precisión.
- El preprocesado debe replicar exactamente la cadena centro-cuadrado → Lanczos 256 → 128 → objetivo; usar otro preprocesado reduce la accuracy.
- Licencia "other": no se especifican términos de uso comercial, por lo que es necesario consultar al autor antes de un uso en producción.
- Riesgo de sesgos heredados de ImageNet-1k, incluidas clases desequilibradas y etiquetas ruidosas del dataset original.
- Riesgo de sobreajuste a las 1.000 clases de ImageNet; no generaliza a categorías fuera de ese vocabulario.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `ntlm_core.py` antes de desplegarlo.
- Sin datos publicados de accuracy top-1/top-5 en la información disponible, lo que impide evaluar su calidad frente a alternativas.
- Proyecto con 0 descargas y 1 like en el momento de la consulta; soporte y mantenimiento no garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-ImageGen-Class-2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/ILSVRC/imagenet-1k
- Repack de validación usado en `evaluate.py`: https://huggingface.co/datasets/benjamin-paine/imagenet-1k-128x128
- Repack de entrenamiento a 64 px: https://huggingface.co/datasets/benjamin-paine/imagenet-1k-64x64
- Repack de entrenamiento a 128 px: https://huggingface.co/datasets/benjamin-paine/imagenet-1k-128x128
- Documento encontrado en la búsqueda web (plantilla MLA de Google Docs, no relacionada con el modelo): https://docs.google.com/document/d/19B-yXT9h9A1hXPugvvmo_X2esoLNWJU5ycqK6Fr65gA/edit
