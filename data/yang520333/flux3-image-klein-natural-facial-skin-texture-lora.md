# yang520333/Flux3-image-klein-natural-facial-skin-texture-lora

## Resumen

FLUX.3 Image Klein · Natural Facial Skin Texture LoRA es un adaptador LoRA de edición de imagen desarrollado por el usuario yang520333 sobre el modelo base black-forest-labs/flux-3-image-klein-base. Su función concreta es añadir textura natural a la piel de retratos que presentan un aspecto demasiado liso, sin poros o con microtextura débil, preservando la identidad del sujeto, sus rasgos faciales, la expresión, el tono de piel, la iluminación y la composición original.

El adaptador se distribuye en formato Safetensors BF16 con rango 64, exportado mediante AI Toolkit, y cuenta con 14 checkpoints de entrenamiento publicados de los cuales el autor recomienda los pasos 5.000 y 5.600 por ser los más probados. No requiere palabra de activación: la edición se describe en lenguaje natural, lo que simplifica su integración en flujos de trabajo de ComfyUI.

Es relevante para desarrolladores y artistas técnicos que trabajan en pipelines de retoque fotográfico automatizado o generación de retratos con IA, ya que aborda un problema recurrente de los modelos de difusión: la piel excesivamente pulida que delata el origen sintético de la imagen. El repositorio ocupa 4,5 GB e incluye workflows de ComfyUI y comparativas de resultados aportadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión FLUX.3 Image Klein |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantización | BF16 (pesos exportados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | flux-kommunity-license (licencia comunitaria FLUX) |
| Formato de pesos | Safetensors, BF16, rango 64, exportado con AI Toolkit |
| Modelo base | black-forest-labs/flux-3-image-klein-base |
| Pipeline | image-to-image |
| Checkpoints disponibles | 14 (recomendados: 5.000 y 5.600 pasos) |
| Tamaño por checkpoint | 306,44 MiB |
| Tamaño del repositorio | 4,5 GB |
| Palabra de activación | no requiere; edición en lenguaje natural |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 entrenado sobre el modelo de difusión FLUX.3 Image Klein en su variante base, orientado a edición de imagen (image-to-image). El adaptador modifica el comportamiento del modelo base para inyectar detalle de piel realista —poros finos y microtextura— sin alterar la estructura del retrato. El entrenamiento se realizó con AI Toolkit y se publicaron 14 checkpoints intermedios entre los pasos 2.400 y 7.xxx, lo que permite ajustar la intensidad del efecto seleccionando distintos puntos de entrenamiento.

El autor advierte que un paso de entrenamiento posterior no garantiza un mejor resultado: el grado de ajuste varía entre etapas, por lo que recomienda comparar los checkpoints 5.000 y 5.600 frente a las alternativas para cada imagen de entrada y la intensidad de textura deseada. La model card no detalla el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, datos que no están disponibles.

## Capacidades

- Edición de imagen image-to-image: añade textura de piel natural, poros y microtextura fina a retratos.
- Preservación de identidad: mantiene rasgos faciales, expresión, tono de piel, iluminación y composición del original.
- Control mediante lenguaje natural: no requiere palabra de activación; la edición se describe en texto.
- Ajuste de intensidad mediante selección de checkpoint (14 versiones disponibles).
- Integración con ComfyUI: incluye workflows JSON listos para usar.
- Compatible con AI Toolkit para exportación y gestión de pesos.
- Soporte de generación a resolución 4K mediante el workflow recomendado.
- Capacidades multilingües: solo inglés documentado.
- No se documentan tool calling, agentes ni otras capacidades multimodales más allá de la edición de imagen.

## Casos de uso

- Retoque fotográfico automatizado en estudios: aplicar el LoRA sobre retratos procesados con modelos de difusión para recuperar textura de piel realista antes de la entrega final, evitando el aspecto plástico característico.
- Producción de material publicitario con retratos sintéticos: insertar el adaptador en un pipeline de ComfyUI que genere retratos de modelos para campañas, garantizando que la piel resulte creíble a resoluciones de impresión.
- Restauración de realismo en imágenes generadas: corregir retratos previos que hayan quedado con piel demasiado suave, usando el checkpoint 5.000 o 5.600 como paso de refinado dentro de un flujo image-to-image.
- Integración en herramientas de edición para fotógrafos: desplegar el workflow de ComfyUI como servicio interno que reciba un retrato y devuelva la versión con textura natural, con tiempos de generación de aproximadamente 3 minutos a 4K.
- Creación de contenido para videojuegos y avatares: enriquecer las texturas faciales de personajes generados por IA antes de exportarlas a motores de render, mejorando el realismo de los primeros planos.
- Investigación en síntesis de imagen: emplear los distintos checkpoints como variable controlada para estudiar cómo evoluciona la inyección de microtextura a lo largo del entrenamiento de un LoRA.
- Preprocesado para detección facial: mejorar la textura de retratos sintéticos en datasets de entrenamiento para que los modelos de visión por computador no aprendan artefactos de piel excesivamente lisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta datos de rendimiento de generación: aproximadamente 3 minutos para una imagen 4K con el workflow nuevo (actualización del 29 de octubre de 2026) frente a 1 minuto y 40 segundos con el workflow anterior. El autor indica que el nuevo workflow corrige la deriva posicional y la corrupción de texto en chino observadas previamente, y mejora la calidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base FLUX.3 Image Klein y del pipeline de ComfyUI, no solo del LoRA (306,44 MiB por checkpoint).
- GPU recomendadas: no especificadas en la información disponible; el modelo base de difusión requiere GPUs de gama alta para generación a 4K.
- ¿Cabe en GPU de consumo? No confirmado en la documentación; el adaptador en sí es ligero, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: ComfyUI (workflows incluidos en el repositorio) y AI Toolkit para gestión de pesos.
- Latencia estimada: aproximadamente 3 minutos por imagen 4K con el workflow recomendado; 1 minuto y 40 segundos con el workflow anterior.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux3-image-klein-natural-facial-skin-texture-lora (este) | LoRA de textura facial | FLUX.3 Image Klein base | Safetensors BF16 r64 | flux-kommunity-license | Hugging Face, 14 checkpoints |
| Modelo base FLUX.3 Image Klein | Modelo de difusión completo | — | no disponible | flux-kommunity-license | Hugging Face (black-forest-labs) |
| Otros LoRA de textura de piel para FLUX | LoRA especializados | FLUX (distintas versiones) | Safetensors | variable | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables alternativos documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al operar sobre retratos, puede heredar los sesgos demográficos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación: al ser un modelo de edición de imagen, puede introducir detalles de piel inconsistentes o alterar sutilmente rasgos si se aplica con intensidad excesiva o con checkpoints poco probados.
- Limitaciones de idioma: solo se documenta inglés para las instrucciones de edición.
- Restricciones de licencia: la flux-kommunity-license impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE.md del repositorio antes de desplegar en producción.
- Checkpoints no validados: 12 de los 14 checkpoints han recibido menos pruebas; el autor recomienda usar únicamente el 5.000 y el 5.600 como referencia fiable.
- Dependencia del modelo base: requiere cargar por separado black-forest-labs/flux-3-image-klein-base y sus componentes de soporte.
- Carga de un solo checkpoint: el autor indica cargar un checkpoint a la vez, sin combinar versiones.
- Ejemplos ilustrativos: las imágenes de comparación no identifican checkpoint, fuerza del LoRA ni ajustes de muestreo, por lo que no constituyen una comparación controlada.
- Workflow anterior obsoleto: el workflow previo presentaba deriva posicional y corrupción de texto en chino; se recomienda migrar al nuevo.

## Enlaces

- [Hugging Face: yang520333/Flux3-image-klein-natural-facial-skin-texture-lora](https://huggingface.co/yang520333/Flux3-image-klein-natural-facial-skin-texture-lora)
- [Modelo base: black-forest-labs/flux-3-image-klein-base](https://huggingface.co/black-forest-labs/flux-3-image-klein-base)
- [Workflow recomendado (Natural Facial Texture, JSON)](flux3_image_klein_%E7%9C%9F%E5%AE%9E%E8%84%B8%E9%83%A8%E7%BA%B9%E7%90%86.json)
- [Imagen de portada](https://huggingface.co/yang520333/Flux3-image-klein-natural-facial-skin-texture-lora/resolve/main/cover.png)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
