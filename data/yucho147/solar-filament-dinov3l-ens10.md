# yucho147/solar-filament-dinov3l-ens10

## Resumen

Solar-filament-dinov3l-ens10 es un ensemble de diez modelos de segmentación de instancias construido por el usuario yucho147 para el reto Solar Filament Segmentation Challenge 2026. El objetivo es detectar y delimitar filamentos solares en imágenes H-alpha de 2048×2048 píxeles procedentes del instrumento GONG (conjunto de datos MAGFiLO), una tarea de visión por computador aplicada a física solar. El modelo no es un modelo de lenguaje: es un sistema de segmentación de imágenes empaquetado como repositorio PyTorch con pesos, código de inferencia y un selector de instancias aprendido.

La arquitectura se apoya en DINOv3 ViT-L/16 como codificador, congelado en parte y adaptado mediante una rama convolucional de alta resolución y un decodificador progresivo que produce un logit por píxel. El ensemble combina dos semillas × cinco folds con EMA 0.999, promedia los mapas de probabilidad y aplica un selector de componentes conexas basado en dos regresores de gradient boosting que estiman el IoU esperado. La solución reportada obtiene una puntuación de 0,38 en el leaderboard público del reto.

El interés del repositorio es doble: por un lado, documenta una receta completa y reproducible para segmentación de instancias en imágenes de gran tamaño sin reescalado; por otro, publica los pesos (12,2 GB en fp32) junto con manifiestos SHA-256 y un informe técnico de cuatro páginas. La licencia de los pesos deriva de la DINOv3 License de Meta, con restricciones que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 (codificador, 4 capas intermedias) + rama convolucional de alta resolución + decodificador progresivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 2048×2048, tiles de 512 px) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se documentan GGUF ni INT8) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | dinov3-license (pesos); código MIT |
| Formato de pesos | archivos PyTorch fp32 (10 archivos de ~1,14 GiB cada uno) |

## Arquitectura y entrenamiento

El modelo parte de un codificador DINOv3 ViT-L/16 al que se le extraen cuatro capas intermedias. Esas representaciones se combinan con una rama convolucional de alta resolución y se fusionan mediante un decodificador progresivo que devuelve un único logit por píxel. La entrada se procesa a resolución nativa de 2048×2048 sin reescalado, lo que preserva la morfología fina de los filamentos. El entrenamiento usa la media de los conjuntos de anotación como objetivo, con pérdida BCE más Dice suave y EMA de 0,999.

El ensemble está formado por diez modelos: dos semillas × cinco folds. En inferencia se aplican tiles solapados de 512 px con 50 % de solapamiento y tres vistas (identidad, volteo horizontal y volteo vertical), con pesos uniformes por tile. Los cinco modelos de cada semilla se promedian y después se promedian las dos semillas, generando un mapa de probabilidad en float32. Sobre ese mapa se calculan componentes conexas de 8 vecinos con p > 0,4 y área ≥ 100 px, y un selector aprendido (dos regresores de gradient boosting sobre 11 descriptores sin etiquetas) estima el IoU esperado y conserva las componentes con puntuación ≥ 0,25. La salida son instancias disjuntas en COCO RLE comprimido.

## Capacidades

- Segmentación de instancias de filamentos solares en imágenes H-alpha de 2048×2048 píxeles.
- Procesamiento a resolución nativa sin reescalado, adecuado para estructuras alargadas y de bajo contraste.
- Ensemble de diez modelos con promediado de probabilidades y tres vistas de aumento en inferencia.
- Selección de instancias basada en un modelo aprendido (gradient boosting) sobre descriptores libres de etiquetas.
- Salida en formato COCO RLE comprimido, una fila por instancia, lista para evaluar con Panoptic Quality.
- Ejecución en GPU (CUDA) y en CPU/MPS, aunque con latencias muy distintas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Monitorización operativa de actividad solar: el modelo permite generar mapas de filamentos a partir de imágenes GONG H-alpha de forma automatizada, con una latencia de 16,3 s por imagen y pase de cinco modelos en una RTX 3090, lo que hace viable procesar series temporales completas.
- Investigación en física solar: la segmentación a resolución nativa facilita el estudio morfológico de filamentos y su evolución, al no perder detalle por reescalado.
- Construcción de catálogos de eventos: la salida COCO RLE permite agregar instancias en bases de datos y cruzar con índices de eyecciones coronales o regiones activas.
- Validación de pipelines de anotación: el selector aprendido y los umbrales documentados sirven como referencia para comparar estrategias de post-proceso en retos de segmentación similares.
- Reproducción de resultados de competición: el repositorio incluye scripts que verifican SHA-256 de pesos y selector y comparan la salida con `submission_C_10m.csv`, útil para auditar pipelines de Kaggle.
- Transferencia a otras tareas de segmentación en imágenes de gran tamaño: la receta (DINOv3 + rama convolucional + decodificador progresivo + tiles solapados) es reutilizable en dominios con estructuras alargadas y anotaciones ruidosas.
- Docencia y experimentación con ensembles: el código separa claramente inferencia, selector y post-proceso fijo, lo que facilita estudiar el efecto de cada componente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Leaderboard público (Panoptic Quality) | 0,38 (dos decimales) |
| Latencia por imagen (RTX 3090, CUDA 12.8, pase de 5 modelos) | 16,3 s |
| Tiempo total para 180 imágenes (dos pases) | ~98 min |
| Memoria GPU por pase | 7,6 GB |
| Almacenamiento temporal de probabilidades por pase | ~2,9 GB |
| Latencia en Apple Silicon (MPS, pase de 5 modelos) | ~218 s por imagen (> 20 h para 180 imágenes) |
| Reproducibilidad | probabilidades bit-idénticas y CSV byte-idéntico en RTX 3090 con el código original |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje. La única métrica de calidad reportada es la puntuación del leaderboard.

## Requisitos de hardware

- VRAM estimada: 7,6 GB por pase de cinco modelos en fp32 (medido en RTX 3090).
- GPU recomendadas: RTX 3090, A100, H100; cualquier GPU con al menos 8 GB de VRAM para un pase.
- Cabe en GPU de consumo: sí, en RTX 3090 y previsiblemente en RTX 4080/4090 con VRAM suficiente; no se documentan pruebas en GPUs de gama media.
- Despliegue: scripts PyTorch propios (`scripts/reinfer_10m.py`), notebook `notebooks/pipeline_10m.ipynb`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 16,3 s/imagen por pase de cinco modelos en RTX 3090; ~218 s/imagen por pase en Apple Silicon con MPS. Los scripts abortan si una imagen supera los 90 s en presupuesto GPU, umbral configurable con `--abort-single-seconds`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| solar-filament-dinov3l-ens10 | Ensemble DINOv3 ViT-L/16 para segmentación | no disponible | Imagen 2048×2048, tiles 512 px | PQ 0,38 en leaderboard | dinov3-license (pesos), MIT (código) | Hugging Face, 12,2 GB |
| DINOv3 ViT-L/16 (base) | Codificador visual auto-supervisado | no disponible | Resolución variable | no aplica a esta tarea sin fine-tuning | DINOv3 License | Hugging Face (Meta) |
| Modelos de segmentación genéricos (SAM, SAM 2) | Segmentación promptable | no disponible | Imagen de entrada variable | no evaluado en este reto | varía (Apache 2.0 en SAM) | Hugging Face |

La comparación directa con alternativas no está disponible en la información proporcionada: no se han publicado resultados de otros modelos en este reto ni métricas comparables en el repositorio.

## Limitaciones y advertencias

- Modelo de una sola tarea: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Entrenado exclusivamente con imágenes GONG H-alpha del conjunto MAGFiLO; el rendimiento fuera de esa distribución (otros instrumentos, longitudes de onda o resoluciones) no está documentado.
- La puntuación de 0,38 en el leaderboard público es moderada y se reporta con solo dos decimales, lo que limita la comparación fina.
- El manifiesto de los pesos de la semilla 43, fold 3 se perdió y fue reconstruido; el commit de entrenamiento es desconocido, por lo que los entrenamientos originales no son reproducibles exactamente (la inferencia desde los pesos publicados sí lo es).
- El código de inferencia refactorizado no se ha verificado de extremo a extremo en el conjunto completo de GPU; en otras GPUs o precisiones se esperan pequeñas diferencias de probabilidad y la comparación pasa a ser por IoU en lugar de igualdad byte a byte.
- La licencia de los pesos es la DINOv3 License de Meta, con posibles restricciones de uso comercial; el código es MIT, pero los pesos derivados requieren revisar `NOTICE.md` y `LICENSE-DINOv3.md`.
- Los datos de entrenamiento (MAGFiLO) no se incluyen en el repositorio, lo que impide reentrenar sin acceso externo.
- Riesgo de falsos positivos y negativos en estructuras de bajo contraste: el selector usa un umbral fijo (τ = 0,25) y componentes con área mínima de 100 px, lo que puede descartar filamentos pequeños o fragmentados.
- No se documentan sesgos demográficos (no aplica), pero sí un posible sesgo hacia la morfología presente en el conjunto de anotación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yucho147/solar-filament-dinov3l-ens10
- Licencia DINOv3: https://huggingface.co/yucho147/solar-filament-dinov3l-ens10/blob/main/LICENSE-DINOv3.md
- Informe técnico: https://huggingface.co/yucho147/solar-filament-dinov3l-ens10/blob/main/report/main.pdf
- Notebook del pipeline: https://huggingface.co/yucho147/solar-filament-dinov3l-ens10/blob/main/notebooks/pipeline_10m.ipynb
- Ejemplo ejecutado en MPS: https://huggingface.co/yucho147/solar-filament-dinov3l-ens10/blob/main/notebooks/executed_example_mps_2images.ipynb
- DINOv3 (Meta): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Repositorio de código en GitHub: no disponible en la información proporcionada
