# Tuna0000/attention-residual-image-denoiser

## Resumen

E-RidNet (Grayscale) es un modelo de eliminación de ruido en imágenes en escala de grises desarrollado por Tuna0000 y publicado en HuggingFace bajo licencia MIT. Se trata de una versión modificada de la arquitectura RidNet que sustituye las conexiones residuales recursivas por bloques residuales discretos e incorpora un módulo de atención de bordes (Edge Attention Module, EAM) antes de cada bloque residual. El modelo es totalmente convolucional, sin capas de pooling ni downsampling, lo que permite ejecutarlo sobre imágenes de cualquier tamaño, aunque fue entrenado con resoluciones de 128×128.

Con apenas 297.281 parámetros (~1,1 MB), este modelo destaca por su extrema ligereza, lo que lo hace adecuado para entornos con recursos limitados o despliegue en dispositivos periféricos. Está implementado con TensorFlow/Keras 3 y el pipeline declarado es image-to-image. Su relevancia radica en que demuestra que es posible obtener resultados aceptables de eliminación de ruido con una fracción mínima de los parámetros que emplean los modelos de restauración de imágenes actuales, aunque su evaluación se limita a una única imagen de muestra y no incluye métricas medias sobre un conjunto de prueba completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual con módulos de atención de bordes (EAM) y skip connection global |
| Parametros totales | 297.281 (~1,1 MB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, entrada de imagen de tamaño arbitrario) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | Keras weights (.weights.h5) y modelo completo (.keras) |

## Arquitectura y entrenamiento

La arquitectura sigue una estructura secuencial de dos etapas: Edge Attention Module (EAM) → Residual Block → EAM → Residual Block, con una conexión residual global que conecta la entrada directamente con la salida. Cada EAM extrae características de bordes mediante una convolución, aplica una función sigmoide para escalar los valores al rango [0,1] y multiplica elemento a elemento el mapa de características original por esta puerta, enfatizando así los detalles de bordes. Cada bloque residual está compuesto por dos capas convolucionales y una suma residual interna.

El entrenamiento se realizó sobre un subconjunto aleatorio del dataset Oxford-IIIT Pet Dataset, limitado a imágenes de animales (perros y gatos). El preprocesado consistió en convertir a escala de grises, redimensionar a 128×128 y añadir cantidades aleatorias de ruido. Los tipos de ruido incluyen Gaussiano, Salt & Pepper, Speckle, Poisson y desenfoque gaussiano (Gaussian Blur), aunque no se especifican los valores exactos de σ o proporción utilizados. La función de pérdida empleada es HybridLoss, una media ponderada de SSIM, PSNR, Blur Loss, Perceptual Loss y Color Loss, para la cual se probaron 17 combinaciones de pesos diferentes y se seleccionó la mejor. El tiempo de entrenamiento y el hardware utilizado no se especifican en la documentación disponible.

## Capacidades

- Eliminación de ruido en imágenes en escala de grises de un solo canal, con entrada normalizada al rango [0,1].
- Procesamiento de imágenes de tamaño arbitrario gracias a su diseño totalmente convolucional sin capas de pooling.
- Manejo de múltiples tipos de ruido: Gaussiano, Salt & Pepper, Speckle, Poisson y desenfoque gaussiano.
- Énfasis en la preservación de bordes mediante el módulo de atención de bordes (EAM).
- Inferencia ligera con menos de 300.000 parámetros, adecuada para entornos con recursos computacionales limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto, ya que es exclusivamente un modelo de visión para restauración de imágenes.

## Casos de uso

- Restauración de fotografías antiguas digitalizadas: el modelo puede aplicarse a escaneos en escala de grises con ruido y grano, mejorando la calidad visual antes de su archivado o impresión. Su ligereza permite procesar lotes completos sin necesidad de GPUs potentes.
- Preprocesado de imágenes para sistemas OCR: la eliminación de ruido en documentos escaneados mejora la precisión de los sistemas de reconocimiento óptico de caracteres. El modelo puede integrarse en un pipeline de preprocesado ejecutándose en CPU.
- Mejora de imágenes médicas en escala de grises: aunque el modelo no fue entrenado con imágenes médicas y su rendimiento no está garantizado en ese dominio, podría servir como punto de partida para fine-tuning con datos específicos de radiografías o ecografías.
- Limpieza de imágenes de vigilancia o CCTV: las grabaciones de cámaras de seguridad suelen presentar ruido por baja iluminación. Este modelo puede reducir ese ruido en tiempo real o en postprocesado, dado su reducido coste computacional.
- Preprocesado para algoritmos de visión artificial: antes de aplicar detección de objetos, segmentación o clasificación, la eliminación de ruido puede mejorar el rendimiento de los modelos posteriores. Su tamaño reducido permite desplegarlo como etapa previa en sistemas embebidos.
- Aplicaciones móviles de edición de fotos: el modelo puede integrarse en aplicaciones Android o iOS para ofrecer una función de "reducir ruido" en imágenes en blanco y negro, gracias a su pequeño tamaño de pesos (~1,1 MB) y su compatibilidad con TensorFlow Lite mediante conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks exhaustivos en la informacion disponible. Los únicos datos de rendimiento provienen de una única imagen de muestra del conjunto de prueba, con los siguientes resultados:

| Metrica | Antes | Despues |
|---|---|---|
| PSNR | 23,86 dB | 28,89 dB |
| SSIM | 0,608 | 0,772 |

Estos valores corresponden a una sola imagen de ejemplo y no representan una evaluación media sobre un conjunto de prueba completo. No se dispone de desglose por tipo de ruido ni comparación con otros modelos en las mismas condiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB, dado el tamaño de pesos de ~1,1 MB y la naturaleza totalmente convolucional del modelo. Puede ejecutarse incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti o superior sería más que adecuada.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU consumer actual e incluso en hardware muy antiguo.
- Opciones de despliegue: TensorFlow/Keras nativo, TensorFlow Lite para dispositivos móviles, o exportación a otros formatos mediante conversión.
- Latencia y throughput estimados: no disponible en la documentación, pero dada la arquitectura ligera y la ausencia de downsampling, se espera una latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU para resoluciones de 128×128.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tipo de ruido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E-RidNet (este modelo) | 297.281 | Escala de grises, tamaño arbitrario | Gaussiano, S&P, Speckle, Poisson, Blur | MIT | HuggingFace |
| Modelo de la Nature (progressive residual + attention) | no disponible | no disponible | no disponible | no disponible | Articulo cientifico |
| AI-Image-Denoiser (Cydral) | no disponible | no disponible | Varios tipos | no disponible | GitHub |

La comparativa es limitada porque el modelo es extremadamente ligero y de propósito específico. El artículo de Nature citado propone una red ligera con fusión de atención residual progresiva, pero no se dispone de sus parámetros ni métricas para una comparación cuantitativa. El proyecto AI-Image-Denoiser de GitHub utiliza Dlib y está orientado a remasterización, pero tampoco publica especificaciones detalladas. No se dispone de información suficiente para una comparativa rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente para imágenes en escala de grises (un solo canal); no soporta imágenes en color.
- El modelo fue entrenado con un subconjunto limitado de imágenes de animales (perros y gatos); su rendimiento no está garantizado en otras distribuciones de imagen como imágenes médicas, documentos o escenas urbanas.
- Los resultados de PSNR y SSIM publicados provienen de una única imagen de muestra; no hay evaluación media sobre un conjunto de prueba completo, lo que impide conocer el rendimiento real esperado.
- El archivo final_model4.keras tiene fijado un tamaño de entrada de 128×128; para procesar imágenes de otros tamaños es necesario cargar los pesos mediante la ruta weights/best_model_weights4.weights.h5.
- No se especifican los valores exactos de severidad del ruido (σ, proporción) utilizados durante el entrenamiento, lo que dificulta conocer los límites de tolerancia al ruido.
- No se especifica el tiempo de entrenamiento ni el hardware utilizado, por lo que no es posible estimar el coste de reproducir el entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de rendimiento en producción.
- Riesgo de alucinación de texturas: como cualquier modelo generativo de restauración, puede inventar detalles finos que no estaban presentes en la imagen original, especialmente en zonas de alto ruido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tuna0000/attention-residual-image-denoiser
- Dataset Oxford-IIIT Pet Dataset: https://www.robots.ox.ac.uk/~vgg/data/pets/
- Articulo Nature sobre redes ligeras de eliminacion de ruido: https://www.nature.com/articles/s41598-024-60139-x
- Proyecto AI-Image-Denoiser (GitHub): https://github.com/Cydral/AI-Image-Denoiser
- Tema image-denoising en GitHub: https://github.com/topics/image-denoising
