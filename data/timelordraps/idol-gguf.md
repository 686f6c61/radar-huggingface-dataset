# TimeLordRaps/Idol-GGUF

## Resumen

Idol-GGUF es una compilación en formato GGUF de 8 bits del modelo Idol, desarrollado por SperiD Labs, que realiza reconstrucción 3D a partir de una única imagen de entrada. El modelo genera una nube de puntos gaussianos tridimensional (gaussian splatting) a partir de una fotografía, y esta versión cuantizada empaqueta los cuatro componentes del pipeline (denoiser, decodificador de octree, decodificador gaussiano y eliminador de fondo) en un único archivo de 967 MB.

La relevancia de esta ficha radica en que permite ejecutar un pipeline de image-to-3D de casi 880 millones de parámetros en hardware de consumo, algo impensable con los pesos originales en precisión completa. La compilación corre sobre idol.cpp, un runtime Apache-2.0 con servidor local, interfaz de navegador y extractor de malla, lo que facilita su integración en flujos de trabajo de modelado 3D.

El modelo no procesa texto: acepta imágenes y devuelve geometría 3D. Los dos codificadores de imagen que necesita (DINOv3 y el autoencoder de FLUX.2-dev) no están incluidos en este repositorio y deben descargarse por separado aceptando sus respectivas licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (pipeline de difusion con denoiser, decodificador de octree y decodificador gaussiano) |
| Parametros totales | 879.302.053 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | Q8_0 mixta (422 tensores Q8_0, 125 float16, 1.076 float32, 67 int64) |
| Idiomas soportados | No aplica (modelo image-to-3D, sin entrada de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Idol-Q8_0.gguf`, 967.253.440 bytes) |

## Arquitectura y entrenamiento

Idol es un pipeline de reconstrucción 3D compuesto por cuatro módulos: un denoiser (probablemente de tipo difusión, aunque la arquitectura exacta no se detalla en la información disponible), un decodificador de octree, un decodificador gaussiano y un eliminador de fondo. El modelo base `speridlabs/idol` se distribuye en precisión original y esta versión lo cuantiza a 8 bits en formato GGUF.

La innovación técnica principal de esta compilación es la calibración por covarianza aplicada a las matrices elegibles del denoiser, que sustituye el redondeo plano de Q8_0. Según el autor, un build idéntico con redondeo plano en 96 matrices del denoiser obtuvo un error latente 0,19 puntos porcentuales superior de media (peor en 23 de 36 casos), aunque sin significación estadística. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconstrucción 3D a partir de una sola imagen: genera una nube de puntos gaussianos tridimensional.
- Extracción de malla: el runtime idol.cpp incluye un extractor de malla sin textura a partir de la nube de puntos.
- Eliminación de fondo: módulo integrado que separa el objeto del fondo de la imagen.
- Generación controlada por pasos: permite fijar el número de pasos de muestreo (el benchmark usó 50 pasos) y el número de gaussianos (262.144 en las pruebas).
- Ejecución en servidor local: interfaz web en el puerto 8127 para subir imágenes e inspeccionar resultados.
- Integración por línea de comandos y API HTTP: scripts `idol_generate.py` y servidor con interfaz HTTP.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- Puede combinarse con un generador de imágenes externo (probado con Iris-3B y Qwen3-VL-4B) para producir la imagen de entrada.

## Casos de uso

- Prototipado rápido de assets 3D: un artista sube una fotografía de un objeto y obtiene una malla aproximada en segundos, útil para bloquear formas antes de modelar en detalle. La ventana de 967 MB y la ejecución en GPU de consumo lo hacen viable en un portátil con GPU dedicada.
- Catalogación de productos en e-commerce: a partir de la foto de catálogo se genera una representación 3D para visores web o configuradores, con la ventaja de que el eliminador de fondo integrado evita preprocesar las imágenes.
- Escaneo 3D de bajo coste en arqueología o patrimonio: fotografías de campo de piezas y objetos se convierten en mallas para documentación preliminar, usando el modo lean para contenedores con 4 GB de RAM.
- Generación de datasets sintéticos 3D: el pipeline puede producir miles de mallas a partir de imágenes existentes para entrenar otros modelos de visión o de reconstrucción, ejecutándose en modo por etapas para limitar el pico de VRAM a 1.955 MiB.
- Herramientas de captura para realidad aumentada: la nube gaussiana generada puede alimentar visores de gaussian splatting en aplicaciones móviles o web, usando la malla extraída cuando el visor no soporte splats.
- Automatización en pipelines de CI/CD de contenido 3D: el servidor HTTP permite encadenar la generación con validadores de malla o conversores de formato, y el archivo único GGUF simplifica el despliegue en contenedores.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad frente al Idol original en un cohorte fijo de 32 objetos domésticos con tres semillas (96 comparaciones), usando codificadores en precisión original, 50 pasos y 262.144 gaussianos:

| Medición | Media | Mediana | Peor caso observado |
|---|---:|---:|---:|
| Distancia media de malla / diagonal del bounding box original | 0,124% | 0,089% | 1,715% |
| F1 de malla dentro del 0,1% de la diagonal | 68,49% | 71,51% | 5,24% |
| F1 de malla dentro del 0,5% de la diagonal | 96,74% | 98,92% | 24,78% |
| Error de color de primer plano en vistas aproximadas | 2,22% | 1,68% | 28,59% |
| Intersección sobre unión de silueta en vistas aproximadas | 98,63% | 99,38% | 64,70% |

El peor caso fue "Lego Friends Mia" con semilla 2026. Una sonda post-hoc encontró 1,715% de distancia media de malla en la repetición fusionada, 1,395% reutilizando la imagen preparada original y 0,0378% cuando se dieron los latentes originales a los decodificadores de 8 bits, lo que apunta a los decodificadores como posible origen, aunque el propio autor advierte que es un caso seleccionado y no prueba una causa general. Estas métricas miden acuerdo con el Idol original, no precisión 3D contra ground-truth.

## Requisitos de hardware

- VRAM en modo por etapas: pico de 1.955 MiB de memoria gráfica asignada por PyTorch (2.754 MiB para el proceso completo con un límite de asignador de 2,5 GiB).
- VRAM en modo residente: 4,4 a 4,9 GB con todos los modelos cargados en memoria gráfica.
- Modo lean: mantiene los modelos en disco en lugar de en memoria host; en un contenedor limitado a 4 GB de RAM completó dos generaciones donde el modo por etapas fue terminado por el sistema.
- GPU recomendadas: no se especifican modelos concretos; por los requisitos de VRAM, cabe en GPU de consumo con 6 GB o más en modo por etapas y con 8 GB o más en modo residente.
- Despliegue: runtime idol.cpp (servidor local, CLI y API HTTP). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requiere descargar aparte los codificadores DINOv3 y el autoencoder de FLUX.2-dev, con acceso restringido y aceptación de términos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Idol-GGUF (este) | 879 M | GGUF Q8_0 | Apache-2.0 | Cuantización 8 bits; requiere codificadores externos |
| Idol original (speridlabs/idol) | 879 M | Precisión original | No disponible | Referencia de calidad; mayor huella de memoria |
| Alternativas de image-to-3D | No disponible | No disponible | No disponible | No se han identificado comparables en la información proporcionada |

## Limitaciones y advertencias

- Las métricas publicadas miden acuerdo con el Idol original, no exactitud 3D real; el cohorte de 32 objetos es un conjunto de desafío seleccionado, no una muestra aleatoria.
- El suavizado y el filtrado de componentes pueden ocultar defectos de malla; las vistas aproximadas no son el renderizado upstream.
- El peor caso observado (1,715% de distancia media de malla) muestra que la degradación por cuantización puede ser notable en objetos concretos.
- Los codificadores de imagen (DINOv3 y autoencoder de FLUX.2-dev) no están incluidos y tienen licencias separadas de la Apache-2.0 del repositorio; su acceso es restringido.
- No procesa texto: necesita un generador de imágenes externo si la entrada no es una fotografía.
- No se establece si Idol fue entrenado con imágenes generadas por Iris; la página del proyecto muestra imágenes de Iris como entradas, pero no lo confirma.
- Los nombres de archivo que muestra la interfaz son etiquetas, no verificación independiente de los pesos.
- No hay información sobre sesgos, alucinaciones geométricas sistemáticas ni comportamiento en dominios distintos a objetos domésticos.
- El modo residente requiere 4,4 a 4,9 GB de VRAM; en GPUs con menos de 6 GB hay que usar el modo por etapas o el modo lean.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TimeLordRaps/Idol-GGUF
- Modelo base: https://huggingface.co/speridlabs/idol
- Runtime idol.cpp: https://github.com/TimeLordRaps/idol.cpp
- Instrucciones de instalación: https://github.com/TimeLordRaps/idol.cpp#install
- Protocolo de benchmark completo: https://github.com/TimeLordRaps/idol.cpp/blob/main/docs/benchmark-gso32.md
- Sonda del peor caso: https://github.com/TimeLordRaps/idol.cpp/blob/main/docs/benchmark-gso32.md#post-hoc-worst-case-probe
- Página del proyecto Idol: https://speridlabs.com/research/idol
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Autoencoder de FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Generador Iris-3B: https://huggingface.co/speridlabs/iris-3b
- Codificador de texto Qwen3-VL-4B: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- Especificación GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
