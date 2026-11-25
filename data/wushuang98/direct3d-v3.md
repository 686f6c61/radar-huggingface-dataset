# wushuang98/Direct3D-V3

## Resumen

Direct3D-V3 es un modelo de difusion para generacion de mallas 3D a partir de una imagen de referencia y una malla gruesa inicial, desarrollado por Shuang Wu y colaboradores de la Universidad de Nanjing, DreamTech, la Universidad de Hong Kong y la Universidad de Oxford. El trabajo se ha publicado en ACM Transactions on Graphics (SIGGRAPH Asia 2026) y su propuesta central es eliminar el cuello de botella del VAE que emplean los pipelines de difusion latente: el modelo opera directamente sobre rejillas de vóxeles SDF en su dominio nativo, de ahi el termino "latent-free" del titulo.

La arquitectura es un transformer de difusion que modela los valores SDF de una rejilla de vóxeles de forma directa, condicionado por caracteristicas visuales extraidas de cuatro capas de DINOv3. El repositorio ocupa 15,3 GB y se distribuye en formato safetensors con licencia MIT. La version publicada incorpora mejoras respecto a la evaluada en el paper: mayor detalle de superficie, condicionamiento con multiples capas de DINOv3 y el optimizador Muon durante el entrenamiento.

Es relevante ahora porque propone una alternativa a la cadena habitual (VAE + difusion latente + decodificador) en generacion 3D, con la promesa de mallas mas finas y sin la perdida de informacion que introduce la compresion latente. No obstante, el lanzamiento es parcial: los pesos publicados cubren solo la etapa de refinado, y la generacion de malla gruesa y la texturizacion siguen pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion sobre voxeles SDF nativos (sin VAE, "latent-free") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (resolucion de rejilla de voxeles 512, segun el directorio `shape_transformers_512/`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo imagen-a-3D, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Entrada | Imagen de referencia (idealmente mapa de normales o clay blanco) + malla gruesa alineada |
| Salida | Malla 3D (OBJ, GLB o PLY) |
| Tamano del repositorio | 15,3 GB |
| Entorno de referencia | Python 3.12, PyTorch 2.14.1, CUDA 13.0, Linux |

## Arquitectura y entrenamiento

Direct3D-V3 es un transformer de difusion que modela directamente rejillas de vóxeles SDF en lugar de operar en un espacio latente comprimido. Al prescindir del VAE, evita la perdida de detalle geometrico asociada a la compresion y reconstruccion latente, que es precisamente el punto debil de los pipelines de difusion latente aplicados a 3D. El condicionamiento de imagen combina caracteristicas de cuatro capas distintas de DINOv3, lo que aporta tanto informacion semantica de alto nivel como detalles de bajo nivel utiles para la geometria fina.

El entrenamiento emplea el optimizador Muon, que segun el autor acelero la convergencia y mejoro la calidad de las mallas generadas. La version liberada produce superficies notablemente mas finas que la evaluada en el paper. No se han publicado en la informacion disponible el numero de tokens o muestras de entrenamiento, la composicion del dataset, ni si hubo etapas de refinamiento con preferencias humanas (RLHF/DPO), algo poco habitual en generacion 3D de todos modos.

El flujo de inferencia es en dos etapas: primero se obtiene una malla gruesa con un modelo externo (Hunyuan3D-2.1 o UltraShape, ya que los modelos de malla gruesa propios aun no se han liberado) y despues Direct3D-V3 refina esa malla condicionada por la imagen. El repositorio incluye extensiones CUDA propias para voxelizacion y relleno de huecos, e integra FlashAttention 2.

## Capacidades

- Generacion de mallas 3D de alta fidelidad a partir de una imagen de referencia y una malla gruesa inicial.
- Refinado geometrico en el dominio nativo de voxeles SDF, sin VAE intermedio.
- Condicionamiento visual mediante caracteristicas multi-capa de DINOv3.
- Acepta mapas de normales o imagenes "clay" blancas como entrada para maximizar el detalle geometrico.
- Produce diversidad de resultados gracias a la naturaleza estocastica de la difusion.
- Salida en formatos de malla estandar (OBJ, GLB, PLY) compatible con pipelines de renderizado y motores 3D.
- Interfaz de demostracion basada en Gradio incluida en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo puramente imagen-a-3D.
- No incluye, en esta release, generacion de texturas (el modelo de textura latent-free esta marcado como pendiente).

## Casos de uso

- Prototipado rapido de assets 3D en estudios de videojuegos: a partir de un concepto 2D y una malla base generada con Hunyuan3D-2.1, Direct3D-V3 refina la superficie para obtener detalle mecanico o de bordes afilado, reduciendo el tiempo de modelado manual de piezas.
- Escaneo y reconstruccion de producto: dado un render o foto de un objeto con su mapa de normales, el modelo genera una malla limpia y detallada apta para catalogos de e-commerce o configuradores 3D.
- Pipeline de impresion 3D: el refinado de mallas gruesas con geometria fina (ranuras, aristas, estructuras delgadas) mejora la fidelidad de piezas antes de laminar, aprovechando que el modelo respeta silueta y proporciones de la imagen de referencia.
- Generacion de assets para entornos de realidad aumentada: mallas en GLB con detalle suficiente para visualizacion en movil, integrables en flujos de trabajo de WebXR.
- Investigacion en generacion 3D generativa: como baseline "latent-free" para comparar contra pipelines de difusion latente con VAE, al ser reproducible con licencia MIT y pesos publicos.
- Automatizacion de variaciones de diseno: combinando la diversidad estocastica de la difusion con distintas imagenes de condicionamiento para explorar variantes geometricas de un mismo objeto en fase de diseno conceptual.
- Refinado por lotes en infraestructura con GPU: al ejecutarse sobre PyTorch y FlashAttention 2, puede integrarse en servicios de generacion 3D bajo demanda, aunque requiere gestionar la dependencia de un modelo externo de malla gruesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona cualitativamente que la version liberada genera mallas con detalle de superficie "sustancialmente mas fino" que la evaluada en el paper, pero no aporta cifras (Chamfer Distance, F-score, CLIP-score ni comparativas numericas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 15,3 GB en safetensors, lo que da una cota inferior orientativa; el modelo opera sobre rejillas de voxeles a resolucion 512, lo que anade consumo de memoria adicional no cuantificado en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. El stack (CUDA 13.0, FlashAttention 2, extensiones CUDA compiladas) apunta a GPUs NVIDIA de datacenter o gama alta; no se confirma compatibilidad con GPUs de consumo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia via `infer.py` y demo Gradio (`app.py`) del repositorio oficial; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion 3D).
- Latencia y throughput: no disponibles.
- Software: Linux, Python 3.12, PyTorch 2.14.1, CUDA 13.0, compilador C++20, FlashAttention 2 y extensiones propias de voxelizacion y relleno de huecos.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Direct3D-V3 | Difusion 3D | Voxeles SDF nativos, sin VAE | Imagen + malla gruesa | MIT | Pesos de refinado publicos; malla gruesa y textura pendientes |
| Hunyuan3D-2.1 | Difusion 3D | Pipeline shape + textura | Imagen | Licencia propia de Tencent | Publico; usado como generador de malla gruesa en el flujo de Direct3D-V3 |
| UltraShape-1.0 | Difusion 3D | Generacion de forma | Imagen | Licencia propia (PKU-YuanGroup) | Publico; alternativa para malla gruesa inicial |

No se dispone en la informacion proporcionada de datos de rendimiento comparativos (metricas geometricas ni evaluaciones humanas) entre estos modelos, por lo que la comparativa se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Lanzamiento incompleto: no se han liberado los modelos de malla gruesa ni el modelo de textura, ni el codigo de entrenamiento. El usuario debe aportar una malla gruesa de una herramienta externa (Hunyuan3D-2.1 o UltraShape), con sus propias licencias.
- Dependencia de la calidad de la malla gruesa y de la imagen de condicionamiento: la model card recomienda explicitamente preparar mapas de normales o imagenes clay, incluso usando GPT Image 2.5, lo que anade pasos y dependencias externas al flujo.
- Riesgo de artefactos geometricos y alucinacion de detalle: como modelo generativo, puede inventar geometria no presente en la referencia o producir superficies inconsistentes, especialmente con imagenes ambiguas u oclusiones.
- Sesgos del dataset de entrenamiento no documentados: no se detalla la composicion de los datos, por lo que se desconocen sesgos de categoria, estilo o procedencia.
- Sin capacidades linguisticas ni multimodales mas alla de imagen: no apto para tareas de texto, codigo o dialogo.
- Requisitos de entorno estrictos (CUDA 13.0, PyTorch 2.14.1, C++20, FlashAttention 2 compilado a medida) que complican el despliegue en infraestructuras existentes.
- Licencia MIT para los pesos, pero las herramientas externas recomendadas en el flujo tienen licencias propias que deben revisarse antes de uso comercial.
- Sin datos publicos de benchmarks que permitan validar de forma objetiva las afirmaciones de calidad del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wushuang98/Direct3D-V3
- Paper en Hugging Face: https://huggingface.co/papers/2611.26511
- arXiv: https://arxiv.org/abs/2611.26511
- DOI ACM: https://dl.acm.org/doi/10.1145/3842524
- Pagina del proyecto: https://dreamtechai.github.io/Direct3D-V3
- Repositorio GitHub: https://github.com/DreamTechAI/Direct3D-V3
- Hunyuan3D-2.1 (malla gruesa): https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/tree/main/hy3dshape
- UltraShape (malla gruesa): https://github.com/PKU-YuanGroup/UltraShape-1.0
- Lotus-2 (prediccion de mapas de normales): https://github.com/EnVision-Research/Lotus-2
- Demo: pendiente de publicacion segun la model card
