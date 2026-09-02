# Viggle/Viggle-Animate

## Resumen

Viggle-Animate es un modelo de animación de personajes basado en video-to-video, desarrollado por la empresa Viggle AI. Su función principal es propagar una edición realizada sobre el primer fotograma de un clip de vídeo a lo largo de toda la secuencia, logrando así reemplazar o animar un personaje manteniendo intactos la cámara, la pose, el fondo y la iluminación del vídeo original. El modelo se posiciona como una alternativa significativamente más rápida a soluciones existentes como Wan2.2-Animate-14B.

El modelo se basa en una arquitectura de tipo Mixture-of-Experts (MoE) derivada de MiniMax-H3, con un total de 33.122 millones de parámetros. Utiliza una técnica de destilación denominada DMD2 (Distribution Matching Distillation) implementada mediante una LoRA de rango 128, lo que permite generar resultados con tan solo 4 pasos de muestreo y 3 pasadas hacia adelante. Esto se traduce en un tiempo de renderizado de aproximadamente 26 segundos para 124 fotogramas a 24 fps en una GPU B200.

Una de sus características más destacables es su simplicidad de uso: solo requiere dos entradas (el vídeo de conducción y su primer fotograma repintado) y no necesita ningún tipo de preprocesamiento como estimación de pose, máscaras, mapas de profundidad o prompts de texto. El modelo está disponible bajo la licencia MiniMax-H3 Community License y se distribuye en formato safetensors, con un tamaño de repositorio de 68.9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en MiniMax-H3, full finetune `ref2va` + LoRA DMD2 de rango 128 |
| Parametros totales | 33.122.992.896 (33.1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bf16 según la comparativa) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License (licencia personalizada, ver archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Viggle-Animate es un modelo de video-to-video construido sobre la arquitectura MiniMax-H3, que es un modelo de tipo Mixture-of-Experts (MoE). El proceso de entrenamiento consta de dos fases principales: primero, un full finetune del modelo base (denominado `ref2va`) para adaptarlo a la tarea de animación de referencia; segundo, la aplicación de una LoRA de rango 128 basada en la técnica de destilación DMD2 (Distribution Matching Distillation). Esta destilación es la clave del rendimiento, ya que permite reducir drásticamente el número de pasos de muestreo necesarios, pasando de los 20 o más pasos típicos a tan solo 4.

El flujo de trabajo del modelo es deliberadamente simple. No requiere un paso de preprocesamiento que genere esqueletos de pose, máscaras de segmentación, recortes de rostro, placas de fondo o mapas de profundidad. Tampoco utiliza prompts de texto. La única entrada es el vídeo de conducción y un primer fotograma repintado con el nuevo personaje. El modelo propaga esta edición a lo largo de todo el clip. El embedding de texto permanece congelado y el codificador de texto nunca se carga, lo que simplifica el despliegue y reduce los requisitos de memoria.

## Capacidades

- Animacion de personajes video-to-video: reemplaza o anima un personaje en un clip existente manteniendo la pose, la camara, el fondo y la iluminacion originales.
- Propagacion de ediciones: aplica un cambio realizado en el primer fotograma a toda la secuencia de video de forma coherente.
- Generacion rapida: funciona con 4 pasos de muestreo y 3 pasadas hacia adelante, lo que permite renders en aproximadamente 26 segundos para 124 fotogramas en una B200.
- Flexibilidad de personajes: puede animar animales, maquinas, personajes 2D planos o incluso dos personajes simultaneamente, sin necesidad de especificar que es cada elemento.
- Sin preprocesamiento: no requiere estimacion de pose, mascaras, mapas de profundidad ni prompts de texto.
- Consistencia temporal: mantiene la coherencia del personaje a lo largo de los fotogramas gracias a su arquitectura MoE.

## Casos de uso

- Produccion audiovisual independiente: un cineasta puede reemplazar a un actor por un personaje animado o un doble digital en una toma ya rodada, simplemente repintando el primer fotograma en un editor de imagenes y pasando el clip por el modelo. La velocidad de 26 segundos por render permite iterar rapidamente sobre multiples tomas.
- Creacion de contenido para redes sociales: los creadores pueden generar memes virales o clips animados de forma rapida, utilizando videos existentes y repintando el personaje con herramientas como GPT-Image-2. La ausencia de prompts de texto simplifica el flujo de trabajo.
- Doblaje y localizacion de personajes: en la industria del doblaje, se puede adaptar la apariencia de un personaje animado a diferentes mercados o requisitos de censura sin necesidad de re-animar la escena completa.
- Prototipado de animacion en estudios: los estudios de animacion pueden usar el modelo para crear animatics rapidos, probando diferentes disenos de personajes sobre una misma pieza de actuacion (la actuacion del video de conduccion) en minutos.
- Educacion y formacion: los educadores pueden crear material didactico animado a partir de videos existentes, reemplazando figuras humanas por mascotas o personajes ilustrados para hacer el contenido mas atractivo y adecuado para audiencias infantiles.
- Publicidad y marketing: las agencias pueden generar variantes de un anuncio con diferentes personajes o mascotas de marca sin volver a rodar, simplemente cambiando el primer fotograma de un video base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Sin embargo, la model card incluye una comparativa de rendimiento directa con Wan2.2-Animate-14B en una GPU B200, con resolucion 480x832, 124 fotogramas a 24 fps, en bf16, sin compilacion ni offload:

| Metrica | Viggle-Animate | Wan2.2-Animate-14B |
|---|---|---|
| Tiempo de renderizado (tras cargar pesos) | 26 s | 160 s |
| Tiempo de muestreo | 13.6 s | 140 s |
| Pasadas hacia adelante | 3 | 40 (20 pasos x 2 chunks) |
| Parametros | 33.1 B | 17.3 B |

Segun estos datos, Viggle-Animate es 6.1 veces mas rapido por render y 10.3 veces mas rapido en el muestreo, a pesar de tener 1.9 veces mas parametros. Cabe destacar que el tiempo de Wan2.2 no incluye su paso de preprocesamiento.

## Requisitos de hardware

- VRAM estimada: no se especifica un requisito exacto de VRAM en la informacion disponible. Dado el tamano del modelo (33.1 B parametros) y que la comparativa se realiza en bf16, se estima que se necesitan al menos 70-80 GB de VRAM para cargar los pesos en precision completa.
- GPU recomendadas: la comparativa de rendimiento se realizo en una NVIDIA B200. GPUs con 80 GB de VRAM, como la A100 o H100, serian adecuadas para inferencia.
- GPU de consumo: no es probable que quepa en GPUs de consumo actuales (RTX 4090 con 24 GB, etc.) sin cuantizacion, y no se mencionan opciones de cuantizacion disponibles.
- Opciones de despliegue: la model card menciona un script de inferencia (`python inference/sample.py`) y un espacio de HuggingFace para probarlo en el navegador. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: 26 segundos por render de 124 fotogramas en una B200, con 13.6 segundos dedicados al muestreo.

## Comparativa con modelos similares

La comparativa principal se realiza con Wan2.2-Animate-14B, como se detalla en la seccion de benchmarks. Ambos modelos resuelven la misma tarea de animacion de personajes video-to-video, pero con enfoques diferentes:

| Caracteristica | Viggle-Animate | Wan2.2-Animate-14B |
|---|---|---|
| Parametros | 33.1 B | 17.3 B |
| Entradas | Video + primer fotograma repintado | Video + imagen del personaje, con paso de preprocesamiento |
| Preprocesamiento | Ninguno | Pose, cara, mascara y fondo |
| Pasos de muestreo | 4 | 20 |
| Tiempo de render | 26 s | 160 s |
| Licencia | MiniMax-H3 Community License | no disponible |

No se dispone de informacion sobre otros modelos comparables en la misma categoria.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia MiniMax-H3 Community License es una licencia personalizada. Es fundamental revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que puede imponer restricciones especificas.
- Dependencia de un editor de imagenes externo: el modelo no es un sistema completo. Requiere que el primer fotograma sea repintado con una herramienta externa (como GPT-Image-2 en los ejemplos). La calidad del resultado final depende en gran medida de la calidad de ese repintado.
- Modelo de video, no de texto: al ser un modelo de video-to-video, no es adecuado para tareas de generacion de texto, chat o razonamiento. Su unica funcion es la animacion de video.
- Requisitos de hardware elevados: con 33.1 B de parametros y sin opciones de cuantizacion documentadas, el modelo requiere hardware profesional con al menos 80 GB de VRAM, lo que limita su uso a estudios o empresas con infraestructura GPU de gama alta.
- Datos de entrenamiento no publicados: no se ha publicado informacion sobre los datos de entrenamiento, el numero de tokens o el proceso de alineacion (RLHF, DPO, etc.).
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir artefactos visuales o inconsistencias en escenas complejas, especialmente si el repintado del primer fotograma no es coherente con el resto del clip.
- Informacion limitada: no se han publicado benchmarks academicos (como MMLU o HumanEval) ni estudios de sesgos, ya que el modelo no es de texto. La evaluacion se basa principalmente en la comparativa de rendimiento incluida en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Viggle/Viggle-Animate
- Demo en el navegador (Space): https://huggingface.co/spaces/Viggle/viggle-animate
- Sitio web de Viggle: https://viggle.ai/
- Herramienta de generacion de animacion: https://viggle.ai/tools/ai-animation-generator
- Organizacion en GitHub: https://github.com/Viggle-AI
