# xocialize/hairdeck-mlx

## Resumen

HairDeck MLX es un conjunto de pesos reempaquetados para su uso con la librería MLX de Apple, derivados del modelo HairDeck desarrollado por el autor hyz317. HairDeck aborda un problema muy concreto dentro del ámbito 3D: la generación automática de pelo de estilo anime modelado como "hair cards" (tarjetas de pelo) a partir de una nube de puntos o de una imagen de referencia, incluyendo las cadenas de huesos con comportamiento elástico (spring-bone chains) necesarias para que el pelo se anime de forma plausible en motores de renderizado como VRM.

El repositorio no entrena ningún modelo nuevo: se limita a reorganizar los tensores originales en float32, byte a byte, renombrando los ficheros para que un port en Swift sobre MLX (mlx-hairdeck-swift) pueda cargarlos, y concentrando en un único `config.json` las estadísticas y argumentos de ejecución que cada submodelo necesita. Está compuesto por varios módulos DiT (point-cloud, image y color, en torno a 181-183 millones de parámetros cada uno; y chain, de 30,5 millones) junto con un VAE de tarjetas de 8,1 millones y el encoder de Dora-VAE 1.1.

Su relevancia es acotada pero específica: permite ejecutar el pipeline de generación de pelo VRM en hardware Apple Silicon mediante MLX, algo que con los checkpoints originales en PyTorch exigiría otra infraestructura. No es un modelo de lenguaje, sino un conjunto de modelos generativos 3D para un dominio muy vertical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para nube de puntos, imagen y color; DiT de cadenas spring-bone; VAE de tarjetas; encoder Dora-VAE 1.1; encoder DINOv3 ViT-L/16 (externo) |
| Parametros totales | Aproximadamente 594,8 M sumando todos los modulos (point-cloud DiT 181,3 M, image DiT 182,3 M, color DiT 183,5 M, chain DiT 30,5 M, card VAE 8,1 M); el encoder Dora-VAE y DINOv3 se distribuyen aparte |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en float32 sin cuantizar) |
| Idiomas soportados | No disponible (modelo 3D, no linguistico) |
| Licencia | Apache-2.0 (checkpoints y codigo de HairDeck); Dora-VAE 1.1 Apache-2.0; DINOv3 bajo DINOv3 License de Meta |
| Formato de pesos | safetensors (float32), mas config.json y SHA256SUMS |

## Arquitectura y entrenamiento

HairDeck modela el pelo de estilo anime como una secuencia de "hair cards" tratadas como tokens. El pipeline se compone de varios Diffusion Transformers especializados: uno que genera el conjunto de tarjetas a partir de una nube de puntos, otro que lo hace a partir de una imagen, un tercero que asigna color por tarjeta y un cuarto (chain DiT) que produce las cadenas de huesos con dinámica de resorte para la animación. La representación se codifica y decodifica mediante un VAE de tarjetas, y la condición de nube de puntos se obtiene con el encoder de Dora-VAE 1.1. La ruta de imagen emplea además DINOv3 ViT-L/16 como extractor de características visuales, que no se incluye en este repositorio y debe tomarse de xocialize/trellis2-mlx.

Este repositorio no aporta entrenamiento: los tensores son exactamente los del modelo original de hyz317, en float32 y sin modificaciones. Los autores originales entrenaron los checkpoints sobre personajes de VRoid Hub; los detalles de composición del dataset, número de pasos de entrenamiento, uso de RLHF u otras técnicas no están disponibles en la información proporcionada. La única labor de este repositorio es el reempaquetado de nombres y la consolidación de estadísticas en `config.json`, junto con sumas de verificación SHA256.

## Capacidades

- Generación de pelo de estilo anime como hair cards a partir de una nube de puntos 3D.
- Generación del mismo tipo de pelo a partir de una imagen de referencia (requiere DINOv3 ViT-L/16).
- Predicción de color por tarjeta de pelo.
- Generación de cadenas de huesos spring-bone para animación del pelo.
- Codificación y decodificación de tarjetas mediante VAE dedicado.
- Integración con el ecosistema VRM para personajes 3D.
- Ejecución nativa en Apple Silicon a través de MLX y del port Swift mlx-hairdeck-swift.
- No soporta tool calling, agents, razonamiento multilingüe ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Creación de avatares VRM para VTubers: a partir de una nube de puntos del personaje, el modelo genera el conjunto de hair cards y sus cadenas de huesos, listas para importar en un motor compatible con VRM.
- Prototipado rápido de peinados en pipelines de personajes 3D: usando la ruta de imagen, un artista puede partir de una referencia 2D y obtener una malla de pelo con colores y rig elástico en una sola pasada.
- Automatización de asset pipelines en estudios pequeños: el port MLX permite ejecutar la generación en Macs sin depender de GPUs NVIDIA ni de un entorno PyTorch completo.
- Previsualización en herramientas de creación de personajes: el modelo de color por tarjeta permite iterar variantes cromáticas sobre un mismo conjunto de hair cards sin regenerar la geometría.
- Generación de pelo para contenido de anime en tiempo real: las cadenas spring-bone producidas por el chain DiT están pensadas para animación procedural en motores de juego o aplicaciones VRM.
- Investigación en generación 3D condicionada: sirve como referencia reproducible (checksums SHA256 incluidos) para comparar pipelines de difusión sobre representaciones de tarjetas.
- Despliegue en aplicaciones macOS/iOS: al estar en MLX y con un port en Swift, puede integrarse en apps nativas de Apple sin capa de compatibilidad adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 2,6 GB en float32; la inferencia completa con Dora-VAE y DINOv3 añade varios GB adicionales (DINOv3 ViT-L/16 ronda los 1,2 GB en float32). Estimo un consumo conjunto del orden de 6-10 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: hardware Apple Silicon con memoria unificada suficiente; el proyecto está diseñado para MLX, no para CUDA.
- Cabe en consumer GPU: si, en equipos Apple con 16 GB o más de memoria unificada, sujeto a verificación empírica.
- Opciones de despliegue: MLX a través de mlx-hairdeck-swift (Swift). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HairDeck MLX (este) | ~594,8 M en total | No aplica | Hair cards 3D + spring bones | Apache-2.0 (DINOv3 aparte) | Hugging Face, MLX |
| HairDeck original (hyz317) | Los mismos checkpoints | No aplica | Hair cards 3D + spring bones | Apache-2.0 | GitHub, PyTorch |
| Dora-VAE 1.1 (Seed3D) | No disponible | No aplica | VAE 3D (condicion de forma) | Apache-2.0 | Hugging Face |
| DINOv3 ViT-L/16 (Meta) | No disponible | No aplica | Vision encoder | DINOv3 License | Hugging Face |

No se dispone de información sobre otros modelos directamente comparables de generación de pelo 3D en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo genera pelo de estilo anime como hair cards; no sirve para otros tipos de pelo, otras representaciones 3D ni tareas de lenguaje.
- La ruta de imagen depende de DINOv3 ViT-L/16, que no está incluido y se rige por la DINOv3 License de Meta, más restrictiva que Apache-2.0; conviene revisar sus términos antes de uso comercial.
- Los checkpoints se entrenaron sobre personajes de VRoid Hub; los términos de esos datos pueden condicionar el uso comercial y la redistribución de resultados.
- Al ser pesos en float32 sin cuantizar, el consumo de memoria es mayor que el de variantes cuantizadas; no se ofrecen opciones de cuantización.
- Riesgo de artefactos geométricos en nubes de puntos o imágenes de entrada atípicas (peinados no representados en el dataset de entrenamiento); no hay evaluación publicada de robustez.
- Proyecto con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario limitados.
- El port Swift puede no cubrir todas las rutas del modelo original; verificar la paridad funcional con el repositorio upstream.
- No hay información sobre sesgos, idiomas ni rendimiento medido, por lo que no puede avalarse su uso en producción sin una validación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xocialize/hairdeck-mlx
- Modelo base original: https://huggingface.co/hyz317/HairDeck
- Repositorio GitHub de HairDeck: https://github.com/hyz317/HairDeck
- Port Swift-MLX: https://github.com/xocialize/mlx-hairdeck-swift
- DINOv3 ViT-L/16 (origen): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Pesos DINOv3 reempaquetados: https://huggingface.co/xocialize/trellis2-mlx
