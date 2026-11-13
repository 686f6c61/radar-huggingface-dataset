# zzb1420/MiniMax-H3-ref2va-V5xs-INT8

## Resumen

MiniMax-H3-ref2va-V5xs-INT8 es una conversión comunitaria del modelo de difusión MiniMax H3 (Hailuo 3.0) en su variante ref2va, publicada por el usuario zzb1420 en Hugging Face. Se distribuye como un checkpoint único para ComfyUI, podado y cuantizado a INT8 mediante la herramienta DaSiWa Station, con el objetivo de reducir los requisitos de memoria del modelo original para poder ejecutarlo en entornos de generación de vídeo con hardware más modesto. El repositorio ocupa 21 GB y está pensado para colocarse directamente en `ComfyUI/models/diffusion_models/`.

El modelo base pertenece a la familia MiniMax H3 (Hailuo 3.0), un sistema de difusión omnicanal orientado a la generación de vídeo a partir de texto e imagen, con soporte declarado de audio. La variante ref2va y el pipeline image-to-video indican que el flujo principal es la animación de una imagen de referencia. La conversión aplica poda y una cuantización INT8 row-wise con rotación de convolución (ConvRot) en tiempo de ejecución, técnica que busca preservar la calidad numérica mientras reduce el peso en VRAM.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado, sin métricas publicadas, sin documentación técnica detallada en su model card y sin descargas ni validación de la comunidad en el momento de la consulta. La información disponible no permite verificar calidad, fidelidad respecto al modelo original ni rendimiento real. Todo lo que sigue se limita a lo declarado por el autor y a las características inferibles de la nomenclatura y los tags.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | difusión (modelo de vídeo omnicanal); detalles de la red no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (no aplica de forma directa a un modelo de difusión de vídeo) |
| Tipos de cuantización | INT8 row-wise ConvRot (runtime); el modelo base admite otras cuantizaciones no documentadas aquí |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | checkpoint único para ComfyUI (single-file), cuantizado INT8; extensión concreta no disponible |

## Arquitectura y entrenamiento

El modelo base es un sistema de difusión para generación de vídeo de la familia MiniMax H3 (Hailuo 3.0), con capacidades declaradas de text-to-video, image-to-video y audio. La model card no detalla el backbone (transformer de difusión, variante híbrida u otra), el número de parámetros, la composición del dataset de entrenamiento ni si hubo etapas de ajuste por preferencias. Tampoco se especifican los tokens o clips de vídeo utilizados en el preentrenamiento.

La innovación documentada en esta conversión es puramente de compresión: poda de pesos ("pruned"), un procesado denominado "graviton" cuyo alcance técnico no se explica, y cuantización INT8 con rotación de convolución aplicada fila a fila en tiempo de ejecución mediante DaSiWa Station. Esta técnica de rotación suele emplearse para reducir el error de cuantización en matrices de pesos, pero no hay en la información proporcionada ninguna evaluación que cuantifique la pérdida de calidad frente al checkpoint original.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), según los tags del repositorio.
- Generación de vídeo a partir de imagen (image-to-video), que es el pipeline declarado y el flujo ref2va del modelo base.
- Soporte declarado de audio dentro del sistema omnicanal del modelo base; el alcance real en esta conversión no está documentado.
- Integración con ComfyUI como checkpoint de difusión de un solo archivo.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-step, lo cual es coherente con un modelo de difusión de vídeo.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Animación de imágenes fijas para prototipos creativos: el pipeline image-to-video permite tomar una ilustración o fotografía y generar un clip animado, útil para previsualizar conceptos en estudios de diseño sin recurrir al modelo completo en FP16.
- Generación de vídeo corto en estaciones de trabajo con VRAM limitada: al estar cuantizado a INT8 y podado, el checkpoint reduce el peso en memoria respecto al original, lo que facilita probarlo en GPUs de gama alta para consumidores dentro de ComfyUI.
- Iteración rápida en flujos de ComfyUI: al ser un archivo único que se coloca en `models/diffusion_models/`, se integra en grafos existentes de generación de vídeo para experimentar con prompts y semillas.
- Creación de material de storyboard y previsualización: la combinación de referencia visual y prompt de texto permite generar tomas de prueba para equipos de producción antes de un render final con modelos de mayor fidelidad.
- Investigación sobre cuantización de modelos de difusión de vídeo: el artefacto sirve para comparar la salida INT8 ConvRot frente al modelo base y medir degradación perceptual, siempre que se disponga del checkpoint original para la comparación.
- Evaluación de despliegue en ComfyUI para pipelines de vídeo automatizados: permite medir tiempos de inferencia y consumo de VRAM en un entorno concreto antes de decidir si merece la pena adoptar la familia H3 en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo (FVD, CLIP score, evaluación humana), ni comparaciones con el checkpoint original sin cuantizar, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El repositorio pesa 21 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos, más el overhead de activaciones y del pipeline de difusión de vídeo, que suele ser considerable.
- GPU recomendadas: no declaradas por el autor. Por el tamaño del checkpoint, se requiere una GPU profesional con 24 GB o más (A100, H100, L40S) o una RTX 4090 de 24 GB como mínimo teórico, con margen incierto para activaciones.
- ¿Cabe en GPU de consumo? Potencialmente en RTX 4090 (24 GB) o RTX 5090 si el pipeline lo permite, pero no está verificado y el margen es ajustado.
- Opciones de despliegue: ComfyUI es el entorno declarado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que en cualquier caso no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-ref2va-V5xs-INT8 (este) | Difusión vídeo, conversión comunitaria INT8 | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 0 descargas |
| MiniMax H3 (Hailuo 3.0) original | Difusión vídeo omnicanal | no disponible | no disponible | MiniMax H3 Community License | Repositorio oficial en GitHub |
| Otras conversiones comunitarias de H3 para ComfyUI | Difusión vídeo | no disponible | no disponible | según autor | no verificadas en la información disponible |

No se dispone de datos de rendimiento ni de especificaciones numéricas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto derivado sin validación: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que la conversión funcione correctamente ni de que preserve la calidad del modelo original.
- La cuantización INT8 con poda puede degradar la coherencia temporal, el detalle fino y la sincronización de audio respecto al checkpoint original; no se ha publicado ninguna evaluación al respecto.
- No se documentan sesgos del modelo base ni del proceso de conversión; al ser un modelo generativo de vídeo, es esperable que reproduzca sesgos de sus datos de entrenamiento, pero no hay información concreta.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar contenido incoherente o no solicitado, especialmente en clips largos o prompts ambiguos.
- Licencia restrictiva: se rige por la MiniMax H3 Community License Agreement, no por una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El autor no especifica la extensión exacta del archivo ni los pasos de instalación más allá de copiarlo en `ComfyUI/models/diffusion_models/`; la compatibilidad con versiones concretas de ComfyUI y de los nodos de DaSiWa no está garantizada.
- Idiomas soportados no disponibles, lo que impide evaluar el comportamiento con prompts en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zzb1420/MiniMax-H3-ref2va-V5xs-INT8
- Repositorio oficial de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Herramienta de cuantización DaSiWa Station: https://github.com/darksidewalker/dasiwa-quant-station
