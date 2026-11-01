# SriHarsha2608/cifar10-mlp

## Resumen

El modelo `cifar10-mlp` es un perceptrón multicapa (MLP) de tres capas entrenado para clasificación de imágenes sobre el conjunto de datos CIFAR-10. Lo publica el usuario SriHarsha2608 en HuggingFace bajo licencia MIT. No es un modelo de lenguaje ni un transformer: es una red neuronal densa de pequeño tamaño (402.250 parámetros) que toma imágenes de 32x32x3 píxeles aplanadas en vectores de 3072 dimensiones y las clasifica en una de las 10 categorías de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).

Su relevancia es fundamentalmente didáctica o de referencia: sirve como línea base minimalista para tareas de clasificación de imágenes de baja resolución, como ejemplo de implementación de un MLP en PyTorch con pesos exportados también a NumPy, y como punto de partida para comparaciones con arquitecturas convolucionales. No compite con modelos de visión de gran escala ni ofrece capacidades generativas, multimodales o de razonamiento.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto recién publicado y sin adopción comunitaria. La model card es breve y se limita a describir arquitectura, preprocesado y ficheros incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) de 3 capas: 3072 → 128 → 64 → 10, activaciones ReLU |
| Parámetros totales | 402.250 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, no secuencial) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`.pt`) y arrays NumPy (`.npz` con `W_0, b_0, W_1, b_1, W_2, b_2`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP completamente conectado con tres capas lineales y activaciones ReLU entre ellas: una capa de entrada de 3072 unidades (32 × 32 × 3 píxeles aplanados), una capa oculta de 128 unidades, otra de 64 y una capa de salida de 10 unidades correspondientes a las clases de CIFAR-10. El total de parámetros es 402.250, un orden de magnitud muy inferior al de cualquier red convolucional moderna empleada en el mismo dataset.

El preprocesado documentado consiste en aplanar cada imagen a un vector de 3072 dimensiones, dividir los valores de píxel entre 255,0 para escalarlos a [0, 1] y estandarizar cada característica con la media y la desviación típica del conjunto de entrenamiento (usando divisor 1 para características con desviación cero). El entrenamiento se realiza sobre las 60.000 imágenes de CIFAR-10, pero la model card no especifica el número de épocas, el optimizador, la tasa de aprendizaje, el tamaño de lote ni si se aplicó data augmentation o regularización. Tampoco se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador de imágenes. No se describe ninguna innovación técnica destacable más allá de la exportación de pesos a NumPy además del checkpoint de PyTorch.

## Capacidades

- Clasificación de imágenes de 32x32x3 píxeles en 10 categorías de CIFAR-10.
- Inferencia determinista de etiqueta única (no genera texto, cajas, máscaras ni descripciones).
- Exportación de pesos en dos formatos: `state_dict` de PyTorch y arrays NumPy, lo que permite reimplementar la inferencia sin depender del framework.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo de pensamiento, visión de alta resolución, audio ni otras modalidades.
- No es un modelo generativo: no produce texto ni imágenes.

## Casos de uso

- Línea base educativa en cursos de deep learning: sirve para ilustrar el flujo completo de un clasificador (aplanado, normalización, capas densas, ReLU, softmax) y comparar su rendimiento con el de una CNN sobre el mismo dataset.
- Pruebas de infraestructura de inferencia: al ser un modelo de 402.250 parámetros, se puede desplegar en CPU o en GPU de gama baja para validar pipelines de serving, serialización y carga de pesos sin coste computacional relevante.
- Referencia de ablación arquitectónica: permite cuantificar cuánta precisión se pierde al sustituir convoluciones por capas densas en CIFAR-10, útil en artículos o informes que justifican el uso de CNN.
- Prototipado rápido de clasificadores de baja resolución: para experimentos con imágenes de 32x32 (por ejemplo, sensores de bajo coste o datasets sintéticos) donde no se requiere estado del arte y prima la simplicidad.
- Validación de pipelines de preprocesado: la model card especifica con precisión la normalización por característica, lo que lo hace útil para comprobar que una implementación de preprocesado reproduce los resultados esperados.
- Ejemplo de exportación PyTorch a NumPy: útil para equipos que necesitan servir un modelo en entornos sin PyTorch, reimplementando la inferencia con operaciones matriciales básicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión en test, matriz de confusión ni comparación con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precisión completa (402.250 parámetros × 4 bytes ≈ 1,6 MB de pesos, más activaciones y overhead del runtime). Cabe holgadamente en cualquier GPU, incluida una iGPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se usa GPU, sirve cualquiera (RTX 4090, A100, H100, T4, etc.), aunque no aporta ventaja práctica.
- Cabe en cualquier GPU de consumo y en sistemas embebidos con memoria limitada.
- Opciones de despliegue: PyTorch nativo, exportación a NumPy (inferencia con `numpy.dot`), ONNX si se convierte el `state_dict`, o TorchScript. No es un modelo de lenguaje, por lo que vLLM, llama.cpp, Ollama o TGI no aplican.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la latencia por imagen sería del orden de microsegundos a milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cifar10-mlp (este modelo) | 402.250 | Imagen 32x32x3 | no disponible | MIT | HuggingFace |
| LeNet-5 clásica | ~60.000 | Imagen 32x32 | no disponible en esta ficha | no disponible | Referencia académica |
| ResNet-18 adaptada a CIFAR-10 | ~11,2 M | Imagen 32x32 | no disponible en esta ficha | MIT (implementaciones) | Repositorios públicos |
| VGG-11 adaptada a CIFAR-10 | ~9,2 M | Imagen 32x32 | no disponible en esta ficha | no disponible | Repositorios públicos |

No se dispone de datos de rendimiento publicados para este modelo ni para las alternativas en la información proporcionada, por lo que la comparación se limita a arquitectura, tamaño y licencia. En términos generales, un MLP sin convoluciones rinde sustancialmente peor que arquitecturas convolucionales en CIFAR-10, pero no se aportan cifras concretas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no genera respuestas ni soporta conversación. Cualquier uso en ese sentido es inválido.
- Al carecer de sesgo inductivo convolucional, su precisión esperada en CIFAR-10 es inferior a la de una CNN de tamaño comparable; no se aportan métricas que lo cuantifiquen.
- No hay información sobre sesgos del dataset ni sobre el rendimiento por clase; CIFAR-10 tiene clases desbalanceadas en dificultad y el modelo puede mostrar sesgos hacia categorías más fáciles.
- Riesgo de sobreajuste no documentado: la model card no indica regularización, dropout ni data augmentation.
- La licencia MIT permite uso comercial, pero no se especifica la procedencia de los pesos ni se ofrece garantía alguna.
- No se documenta el número de épocas, el optimizador ni la precisión final, lo que impide reproducir el entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- No apto para producción en tareas de visión reales: la entrada está restringida a 32x32x3 y a 10 clases fijas.
- No se especifican limitaciones de contexto ni de idioma porque no aplican, pero conviene señalar que la model card no documenta el rendimiento en dominios distintos de CIFAR-10 (out-of-distribution).

## Enlaces

- HuggingFace: https://huggingface.co/SriHarsha2608/cifar10-mlp
- Dataset CIFAR-10 (referencia): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
