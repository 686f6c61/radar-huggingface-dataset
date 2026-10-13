# stabilityai/stable-video-diffusion-img2vid-xt

## Resumen
Stable Video Diffusion (SVD) Image-to-Video XT es un modelo de difusión latente desarrollado por Stability AI que genera vídeos cortos a partir de una imagen fija. Con 1.524.623.082 parámetros, fue entrenado para producir 25 fotogramas a resolución 576x1024, partiendo de un fotograma de contexto del mismo tamaño. Se trata de un ajuste fino del modelo SVD Image-to-Video de 14 fotogramas, con un decodificador f8 adaptado para consistencia temporal.

El modelo resuelve la tarea de animación de imágenes estáticas sin necesidad de control textual, lo que lo hace útil para prototipado rápido de animaciones y efectos visuales. Su relevancia radica en que ofrece pesos abiertos bajo una licencia de comunidad, con un rendimiento preferido por evaluadores humanos frente a alternativas comerciales como GEN-2 y PikaLabs en calidad de vídeo.

Publicado en noviembre de 2023 y actualizado en julio de 2024, acumula más de 102.000 descargas y 3.458 me gusta en HuggingFace, lo que refleja un interés significativo en la comunidad de generación de vídeo open source.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente para vídeo (image-to-video) |
| Parametros totales | 1.524.623.082 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vídeo, sin procesamiento de lenguaje) |
| Licencia | stable-video-diffusion-community (licencia de comunidad) |
| Formato de pesos | safetensors, diffusers |
| Resolución de salida | 576x1024 |
| Fotogramas generados | 25 |
| Modelo base | SVD Image-to-Video [14 frames] |

## Arquitectura y entrenamiento
SVD-XT es un modelo de difusión latente para vídeo. La arquitectura subyacente es un transformer de difusión (DiT) adaptado a vídeo, aunque la model card no detalla la topología exacta. Se entrena para denoising en el espacio latente de un autoencoder, generando 25 fotogramas condicionados por una imagen de entrada. El decodificador f8 fue ajustado para mantener consistencia temporal entre fotogramas; también se proporciona un decodificador estándar frame-wise (svd_xt_image_decoder.safetensors) para mayor compatibilidad.

El entrenamiento se realizó sobre un conjunto de datos propietario, sin retener ninguna fuente potencial. La model card indica que se aplicaron métodos de filtrado de calidad descritos en el paper, así como filtros NSFW internos. No intervino mano de obra humana explícita en la preparación de datos, aunque sí se realizaron evaluaciones humanas a través de plataformas de terceros (Amazon SageMaker, Mechanical Turk, Prolific) con trabajadores angloparlantes. El coste computacional fue de aproximadamente 200.000 horas de A100 80GB, con la mayor parte del entrenamiento en 48 nodos de 8 A100, generando ~19.000 kg de CO2 eq. y consumiendo ~64.000 kWh.

## Capacidades
- Generación de vídeo a partir de una imagen fija (image-to-video).
- Produce 25 fotogramas a resolución 576x1024, con una duración aproximada de 4 segundos.
- No admite control mediante texto (prompt textual no soportado).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no aplica.
- Capacidad especial: decodificador f8 ajustado para consistencia temporal; decodificador frame-wise opcional.
- No puede renderizar texto legible en los vídeos generados.
- Puede generar movimiento limitado o paneos de cámara lentos.

## Casos de uso
- Animación de fotografías para redes sociales: a partir de una imagen estática, el modelo genera un clip de ~4 segundos que puede publicarse como "foto animada" en plataformas como Instagram o TikTok. Es adecuado porque no requiere control textual y produce movimiento sutil.
- Previsualización de conceptos en diseño y publicidad: convertir un render o storyboard estático en un vídeo animado para presentaciones de clientes. La resolución 576x1024 permite evaluar composición y movimiento antes de una producción costosa.
- Creación de contenido para videojuegos: generar animaciones cortas de personajes o entornos a partir de arte conceptual. Aunque los rostros pueden no ser perfectos, es útil para prototipos de animación de fondos o elementos.
- Herramientas educativas: animar diagramas, ilustraciones científicas o mapas históricos para explicaciones visuales. El modelo aporta movimiento a imágenes fijas sin necesidad de edición manual compleja.
- Investigación en modelos generativos: estudiar sesgos, limitaciones y capacidades de los modelos de difusión de vídeo. La licencia de comunidad permite su uso en investigación.
- Generación de arte generativo: crear piezas artísticas en movimiento a partir de una obra estática, explorando la relación entre imagen fija y animación.
- Restauración o animación de fotos antiguas: dar un movimiento sutil y realista a fotografías históricas, aportando una nueva dimensión a archivos fotográficos.
- Efectos visuales en postproducción: generar planos de transición o animaciones de elementos estáticos (por ejemplo, humo, nubes, agua) a partir de una imagen de referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. La model card incluye un estudio de preferencia humana en el que SVD-Image-to-Video es preferido sobre GEN-2 y PikaLabs en términos de calidad de vídeo. No se proporcionan cifras concretas de dicho estudio.

En cuanto a rendimiento de inferencia, la model card indica que con la configuración por defecto en el momento del lanzamiento, SVD tarda ~100 s y SVD-XT ~180 s en una A100 80GB. Existen optimizaciones para ajustar calidad, memoria y velocidad, pero no se detallan.

| Métrica | Valor |
|---|---|
| Preferencia humana (calidad de vídeo) | SVD-XT preferido sobre GEN-2 y PikaLabs (sin cifras) |
| Tiempo de generación (SVD) | ~100 s en A100 80GB |
| Tiempo de generación (SVD-XT) | ~180 s en A100 80GB |
| Benchmarks cuantitativos (MMLU, etc.) | no disponible |

## Requisitos de hardware
- Almacenamiento: 32,6 GB para el repositorio completo en HuggingFace.
- VRAM para inferencia: no disponible en la información proporcionada. La model card reporta pruebas en A100 80GB.
- GPU recomendadas: A100 80GB según la model card. No se especifican otras GPU.
- ¿Cabe en GPU de consumo? no disponible. Dependerá de la cuantización y optimizaciones, pero no se aportan datos.
- Opciones de despliegue: pipeline StableVideoDiffusionPipeline de la librería diffusers; también el repositorio generative-models de Stability AI.
- Latencia: SVD ~100 s, SVD-XT ~180 s en A100 80GB con configuración por defecto.
- Throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SVD-XT | 1.524.623.082 | no aplica (vídeo) | stable-video-diffusion-community | Pesos abiertos en HuggingFace |
| GEN-2 (Runway) | no disponible | no disponible | Comercial propietaria | API de pago |
| PikaLabs | no disponible | no disponible | Comercial propietaria | API de pago |

Además, según la model card, SVD-Image-to-Video es preferido por evaluadores humanos sobre GEN-2 y PikaLabs en calidad de vídeo. No se dispone de más especificaciones técnicas de los modelos comparados.

## Limitaciones y advertencias
- Los vídeos generados son cortos (<= 4 segundos) y no alcanzan fotorrealismo perfecto.
- Puede generar vídeos sin movimiento o con paneos de cámara muy lentos.
- No se puede controlar mediante texto; no acepta prompts textuales.
- No puede renderizar texto legible en los vídeos.
- Rostros y personas en general pueden no generarse correctamente.
- La parte de autoencoding del modelo es con pérdida (lossy), lo que puede introducir artefactos.
- Sesgos conocidos: la model card no detalla sesgos específicos, pero al entrenarse con un dataset amplio y sin filtrar por sesgos demográficos, puede heredar sesgos de los datos. Se realizaron evaluaciones de seguridad con >90% de confianza en varias áreas de red-teaming.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero el modelo puede generar contenido no fiel a la imagen de entrada o artefactos visuales.
- Licencia: el uso comercial está permitido bajo condiciones; consultar https://stability.ai/license. El uso no comercial se rige por la licencia community. Es responsabilidad del usuario cumplir la política de uso aceptable.
- Caveat para producción: no es un modelo de lenguaje, por lo que no soporta tareas de texto, tool calling ni agentes. Su integración requiere pipelines de visión por computador.

## Enlaces
- HuggingFace: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt
- Repositorio GitHub: https://github.com/Stability-AI/generative-models
- Paper: https://stability.ai/research/stable-video-diffusion-scaling-latent-video-diffusion-models-to-large-datasets
- Licencia comercial: https://stability.ai/license
- Política de uso aceptable: https://stability.ai/use-policy
- Licencia community: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/LICENSE.md
- Decodificador estándar: https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/svd_xt_image_decoder.safetensors
- Modelo base (14 frames): https://huggingface.co/stabilityai/stable-video-diffusion-img2vid
