# yurijmikhalevich/rclip-models

## Resumen

Este repositorio contiene los artefactos de inferencia generados por la herramienta de código abierto `rclip`, un buscador semántico de fotografías para línea de comandos. No se trata de un modelo nuevo, sino de conversiones a formato ONNX y Core ML del checkpoint `ViT-B-32-256` de OpenCLIP, entrenado sobre el conjunto de datos DataComp-1B. El modelo original fue desarrollado por Mehdi Cherti y el equipo de LAION, y su arquitectura es la de CLIP (Contrastive Language-Image Pre-training) con un encoder de visión ViT-B/32 y un encoder de texto basado en transformer.

La relevancia de este repositorio radica en que permite ejecutar búsquedas semánticas de imágenes de forma totalmente local, sin conexión a la nube, con un coste computacional reducido. Al estar convertido a ONNX y Core ML, puede desplegarse en entornos de producción con ONNX Runtime o en dispositivos Apple con aceleración por Neural Engine. El modelo base tiene una resolución de entrada de 256x256 píxeles y una longitud de contexto de texto de 77 tokens, características estándar de la familia CLIP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (dual encoder: ViT-B/32 para visión, transformer para texto) |
| Parametros totales | 86M (ViT-B/32) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 77 tokens de texto; imágenes de 256x256 píxeles |
| Tipos de cuantizacion | no disponible (los artefactos se distribuyen en precisión completa, probablemente float32) |
| Idiomas soportados | inglés (tokenizador BPE de OpenAI CLIP; no se especifican otros idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (visual.onnx, textual.onnx) y Core ML (visual.mlpackage) |

## Arquitectura y entrenamiento

El modelo base es un CLIP estándar con encoder de visión ViT-B/32 y encoder de texto transformer. CLIP se entrena mediante un objetivo contrastivo: maximizar la similitud coseno entre pares imagen-texto correctos y minimizarla para pares incorrectos. El checkpoint `datacomp_s34b_b86k` fue entrenado sobre el subconjunto DataComp-1B, que contiene aproximadamente 1.000 millones de pares imagen-texto, con 34.000 millones de muestras vistas durante el entrenamiento y un tamaño de lote de 86.000. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es puramente contrastivo. La conversión a ONNX y Core ML no modifica los pesos aprendidos, solo cambia el formato de serialización para facilitar la inferencia en distintos runtimes.

## Capacidades

- Clasificación de imágenes zero-shot: el modelo puede asignar etiquetas a imágenes sin necesidad de entrenamiento adicional, comparando la representación de la imagen con las representaciones de las etiquetas de texto.
- Búsqueda de imágenes por texto: dado un texto en lenguaje natural, el modelo recupera las imágenes más relevantes de un conjunto local.
- Búsqueda de texto por imagen: a partir de una imagen, se pueden encontrar descripciones textuales o imágenes similares.
- Similaridad imagen-imagen: permite calcular la similitud semántica entre dos imágenes, útil para agrupar o deduplicar colecciones.
- Operaciones aritméticas con consultas: la herramienta `rclip` permite combinar y restar consultas (por ejemplo, "playa" - "gente") para refinar resultados.
- Inferencia local y privada: al ejecutarse en el dispositivo, no se envían datos a servidores externos.

## Casos de uso

- Búsqueda local de fotografías personales: un usuario puede buscar "atardecer en la montaña" en su biblioteca de fotos sin subir nada a la nube, gracias a la ejecución local y al tamaño reducido del modelo.
- Organización automática de archivos multimedia: empresas o particulares pueden clasificar grandes volúmenes de imágenes (por ejemplo, capturas de pantalla, memes, documentos escaneados) asignando etiquetas descriptivas mediante clasificación zero-shot.
- Moderación de contenido en aplicaciones móviles: al estar disponible en Core ML, el modelo puede integrarse en apps de iOS para filtrar o etiquetar imágenes en tiempo real, con latencia baja gracias al Neural Engine.
- Sistemas de recomendación visual: en plataformas de comercio electrónico, se puede usar para encontrar productos visualmente similares a partir de una imagen de referencia, sin necesidad de metadatos textuales.
- Asistencia a personas con discapacidad visual: una aplicación puede describir o buscar imágenes basándose en consultas de voz convertidas a texto, aprovechando la capacidad de búsqueda semántica.
- Automatización de flujos de trabajo en fotografía profesional: los fotógrafos pueden etiquetar y organizar sus sesiones usando consultas como "retrato con fondo urbano" o "boda en exteriores", reduciendo el tiempo de edición y catalogación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base (CLIP ViT-B/32) tiene métricas conocidas en tareas como ImageNet zero-shot (alrededor del 63% de precisión top-1), pero estos datos no aparecen en la model card de este repositorio ni en la documentación de `rclip`. Se recomienda consultar el paper de DataComp (arxiv:2304.14108) para evaluaciones detalladas del checkpoint original.

## Requisitos de hardware

- El tamaño del repositorio es de 1.0 GB, pero los artefactos individuales son pequeños: el encoder visual ViT-B/32 en float32 ocupa aproximadamente 300 MB, y el encoder textual unos 100 MB.
- Puede ejecutarse en CPU sin problemas; la inferencia de una imagen tarda del orden de decenas de milisegundos en un procesador moderno.
- En GPU, se puede usar ONNX Runtime con CUDA para acelerar el procesamiento por lotes, aunque no es necesario para uso interactivo.
- En dispositivos Apple, el formato Core ML permite aprovechar el Neural Engine, reduciendo la latencia y el consumo energético.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), Core ML (Swift, Objective-C), o la propia herramienta `rclip` que ya integra estos artefactos.
- No se requieren GPUs de gama alta; cualquier hardware con soporte para ONNX o Core ML es suficiente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| yurijmikhalevich/rclip-models | CLIP ViT-B/32 (DataComp) | 86M | 77 tokens, 256x256 | MIT | ONNX, Core ML |
| openai/clip-vit-base-patch32 | CLIP ViT-B/32 (WIT-400M) | 86M | 77 tokens, 224x224 | MIT | PyTorch, safetensors |
| laion/CLIP-ViT-B-32-256x256-DataComp-s34B-b86K | CLIP ViT-B/32 (DataComp) | 86M | 77 tokens, 256x256 | MIT | PyTorch, safetensors |

La diferencia principal entre este repositorio y los modelos base es el formato de distribución: aquí se ofrecen conversiones listas para ONNX y Core ML, mientras que los originales están en PyTorch. El rendimiento es idéntico al del checkpoint DataComp, que suele superar al CLIP original de OpenAI en tareas de clasificación zero-shot según el paper de DataComp.

## Limitaciones y advertencias

- El modelo se entrenó con datos de DataComp-1B, que pueden contener sesgos sociales y culturales presentes en las imágenes y textos de internet. No se recomienda su uso en aplicaciones de vigilancia, reconocimiento facial o toma de decisiones automatizada sobre personas.
- La clasificación zero-shot depende de la calidad de las etiquetas de texto; etiquetas ambiguas o poco descriptivas pueden producir resultados erróneos.
- El tokenizador BPE está diseñado para inglés; el rendimiento en otros idiomas puede degradarse significativamente.
- No se han realizado pruebas específicas de robustez frente a imágenes adversariales o deformaciones; el modelo puede fallar ante imágenes muy diferentes a las del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero se debe revisar la licencia del modelo base (también MIT) y las atribuciones de terceros (OpenAI CLIP) incluidas en el repositorio.
- Para producción, se recomienda validar el modelo en el dominio de aplicación concreto, ya que no se proporcionan métricas de rendimiento en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yurijmikhalevich/rclip-models
- Herramienta rclip (GitHub): https://github.com/yurijmikhalevich/rclip
- Paper de DataComp: https://arxiv.org/abs/2304.14108
- OpenCLIP: https://github.com/mlfoundations/open_clip
- OpenAI CLIP: https://github.com/openai/CLIP
- Modelo base en Hugging Face: https://huggingface.co/laion/CLIP-ViT-B-32-256x256-DataComp-s34B-b86K
