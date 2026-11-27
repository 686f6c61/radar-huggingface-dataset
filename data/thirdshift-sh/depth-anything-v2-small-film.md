# thirdshift-sh/depth-anything-v2-small-film

## Resumen

Depth Anything V2 Small Film es una conversión a Core ML del modelo de estimación de profundidad monocular Depth Anything V2 Small, publicada por el usuario thirdshift-sh. El paquete no introduce pesos nuevos ni reentrena el modelo: parte del checkpoint `depth-anything/Depth-Anything-V2-Small-hf` (revisión `5426e4f0f36572d16453bbda7a8389317b1bef99`) y lo reexpresa en formato Core ML con pesos en float16 para ejecutarse sobre el Neural Engine de Apple.

La particularidad de esta conversión es que fija tres resoluciones de entrada con relaciones de aspecto pensadas para fotogramas de cine: 518×392, 644×364 y 728×308 píxeles. Al fijar la forma de entrada, el autor puede precalcular la interpolación del *position embedding* para cada rejilla de parches y almacenarla, eliminando ese cálculo en tiempo de inferencia y facilitando la compilación estática que exige el Neural Engine.

El modelo resuelve la estimación de profundidad densa a partir de una sola imagen RGB, una tarea relevante para pipelines de postproducción, generación de mapas de profundidad para VFX, *relighting* o control de desenfoque. Su relevancia actual radica en que permite desplegar esta tarea en hardware Apple (Mac con chip M-series, iPhone, iPad) sin depender de GPU dedicadas ni de frameworks de Python en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (Depth Anything V2 Small), encoder DINOv2-small con cabeza de decodificación de profundidad; reexpresado para Core ML |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base Small de Depth Anything V2 se sitúa en torno a 24,8 M, dato no confirmado en esta ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual); entrada de imagen fija: 518×392, 644×364 y 728×308 |
| Tipos de cuantizacion | float16 (pesos y activaciones en el grafo Core ML) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML); tamaño del repo 0,1 GB |

## Arquitectura y entrenamiento

El modelo base Depth Anything V2 Small es un transformer de visión con encoder tipo DINOv2-small y una cabeza de decodificación que produce un mapa de profundidad denso por píxel a partir de una imagen RGB. Esta conversión concreta no modifica la arquitectura conceptual, sino su expresión para Core ML: los tokens se representan como tensores B×C×1×S, las capas lineales se convierten en convoluciones 1×1 y la atención se calcula cabeza a cabeza con el factor de escala plegado en los pesos de la *query*. Además, la normalización ImageNet y la división por el valor máximo de la salida se integran en el grafo.

No hubo reentrenamiento ni ajuste fino: el autor indica explícitamente que «nothing was retrained». Los pesos se almacenan en float16 y la interpolación del *position embedding* se calcula una sola vez por cada rejilla de parches y se guarda en el paquete, lo que evita recalcularla en cada inferencia. El modelo base Depth Anything V2 fue entrenado con datos de profundidad sintética y real (detalles del dataset no incluidos en la información proporcionada) y se describe en el paper arXiv:2406.09414.

## Capacidades

- Estimación de profundidad monocular densa a partir de una imagen RGB.
- Salida de mapa de profundidad por píxel con resolución alineada a la entrada fija elegida.
- Ejecución en el Neural Engine de Apple gracias a la reexpresión de capas (tokens como B×C×1×S, lineales como convoluciones 1×1).
- Tres variantes de forma de entrada con relaciones de aspecto cinematográficas (518×392, 644×364, 728×308).
- Preprocesado integrado: normalización ImageNet y normalización de la salida dentro del grafo.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No dispone de capacidades multilingües ni de procesamiento de audio.

## Casos de uso

- Postproducción de cine y vídeo: generar mapas de profundidad por fotograma para *relighting*, desenfoque de fondo o composición de VFX; las tres resoluciones fijas encajan con relaciones de aspecto de fotograma y permiten procesar secuencias de forma determinista.
- Aplicaciones móviles de realidad aumentada: integrar el `.mlpackage` en una app iOS/iPadOS para estimar profundidad en tiempo real y colocar objetos virtuales con oclusión correcta, aprovechando el Neural Engine.
- Edición fotográfica en macOS: añadir desenfoque selectivo o efecto retrato en apps nativas sin depender de servicios en la nube, con inferencia local y latencia baja.
- Herramientas de escaneo 3D y fotogrametría: usar el mapa de profundidad como señal auxiliar para reconstrucción de escenas a partir de imágenes individuales.
- Automatización de pipelines de vídeo en Mac: procesar lotes de fotogramas con Core ML y Metal en máquinas Apple sin GPU dedicada, reduciendo coste de infraestructura.
- Investigación en visión por computador: servir como referencia de despliegue de Depth Anything V2 en Core ML para comparar latencia y precisión frente a la versión PyTorch.
- Generación de datos sintéticos para entrenamiento: producir mapas de profundidad de imágenes de referencia para condicionar modelos de difusión o *inpainting*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (AbsRel, δ1, RMSE) ni de latencia para las tres variantes Core ML, y tampoco se aportan comparaciones con el checkpoint original en PyTorch.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para memoria unificada de Apple Silicon. El repo ocupa 0,1 GB, por lo que la huella en memoria es reducida.
- GPU recomendadas: no aplica en el sentido tradicional; el destino es el Neural Engine de chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra) y los SoC A-series de iPhone/iPad compatibles con Core ML.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y en dispositivos iOS/iPadOS que soporten Core ML y el Neural Engine.
- Opciones de despliegue: Core ML (`.mlpackage`), Xcode, Vision framework, `coremltools` para validación; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del chip y de la resolución elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small Film (esta ficha) | no disponible (Small) | Fija: 518×392, 644×364, 728×308 | Core ML (float16) | Apache 2.0 | Hugging Face |
| depth-anything/Depth-Anything-V2-Small-hf | no disponible (Small) | Dinámica | PyTorch (safetensors) | Apache 2.0 | Hugging Face |
| Depth Anything V2 Base / Large | no disponible | Dinámica | PyTorch | Apache 2.0 (Small) / otra según variante | Hugging Face |

La comparación cuantitativa de precisión y latencia no está disponible en la información proporcionada. La diferencia principal frente al checkpoint original es el formato (Core ML frente a PyTorch) y la forma de entrada fija, que sacrifica flexibilidad de resolución a cambio de optimización para el Neural Engine.

## Limitaciones y advertencias

- Modelo de un solo propósito: solo estima profundidad; no genera texto, no razona y no soporta instrucciones.
- Entrada de forma fija: no acepta resoluciones arbitrarias; hay que reescalar o recortar la imagen a una de las tres formas soportadas, lo que puede introducir distorsión geométrica.
- Sin reentrenamiento: hereda los sesgos y errores del checkpoint base Depth Anything V2 Small, incluida la posible degradación en escenas con superficies reflectantes, transparentes o texturas repetitivas.
- Riesgo de profundidad relativa, no métrica: la salida está normalizada por el valor máximo dentro del grafo; no debe interpretarse como distancia absoluta en metros sin calibración adicional.
- Dependencia de plataforma: solo ejecutable en el ecosistema Apple (Core ML); no es portable a CUDA, ROCm ni CPU x86 sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y la atribución al modelo base y al paper original.
- Idiomas: no aplica, pero tampoco se documenta ningún sesgo geográfico o cultural del dataset de entrenamiento en la información disponible.
- Repo de bajas descargas (31) y sin *likes*: no hay evidencia de uso en producción ni validación comunitaria de los paquetes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thirdshift-sh/depth-anything-v2-small-film
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Repositorio oficial Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
