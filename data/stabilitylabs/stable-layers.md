# StabilityLabs/Stable-Layers

## Resumen

Stable Layers es un modelo de descomposición de imágenes desarrollado por StabilityLabs que convierte una imagen RGB en una pila de capas RGBA ordenadas de atrás hacia adelante (fondo y capas de objetos), listas para composición y edición. Se publica como un adaptador LoRA sobre el modelo base Qwen/Qwen-Image-Layered, que se descarga automáticamente desde Hugging Face. El adaptador ocupa 0,3 GB y el modelo base completo pesa aproximadamente 40 GB en bf16.

La relevancia de este modelo radica en que elimina la necesidad de supervisión emparejada (pares de imagen y capas) para entrenar la descomposición. En su lugar, aplica un marco de aprendizaje por refuerzo (Flow-GRPO) con LoRA, donde un modelo de lenguaje y visión (VLM) Qwen 3.5 9b actúa como profesor, puntuando múltiples descomposiciones candidatas por imagen y optimizando el modelo con esa retroalimentación. Esto permite obtener capas con alpha real, útiles para flujos de trabajo profesionales de edición y composición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen-Image-Layered (modelo de difusion de imagenes) |
| Parametros totales | No disponible (adaptador: 0,3 GB; modelo base: ~40 GB en bf16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; base probablemente bf16) |
| Idiomas soportados | No disponible (modelo de imagen, no de texto) |
| Licencia | stabilityai-community (Stability AI Community License) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

Stable Layers es un adaptador LoRA que se monta sobre Qwen-Image-Layered, un modelo de difusion de imagenes preentrenado. El entrenamiento utiliza un enfoque de aprendizaje por refuerzo denominado Flow-GRPO, que no requiere pares de datos etiquetados. En cada iteracion, se muestrean varias descomposiciones candidatas por imagen, se puntuan con un VLM (Qwen 3.5 9b) y se optimiza el adaptador LoRA para maximizar la puntuacion. Este proceso permite refinar la capacidad del modelo para separar objetos del fondo y generar capas con transparencia real.

La inferencia se realiza con un script dedicado que aplica el adaptador sobre el modelo base. La configuracion recomendada es fija: muestreador Heun de segundo orden, 50 pasos, CFG 1.0 (sin guia), resolucion de 640 px en el lado mayor y 4 capas de salida. El modelo preserva la relacion de aspecto y redondea las dimensiones a multiplos de 16. La semilla de ruido se deriva de la semilla global mas el indice de imagen, lo que garantiza resultados reproducibles.

## Capacidades

- Descomposicion de una imagen RGB en una pila de capas RGBA: fondo (layer_0) y capas de objetos (layer_1 a layer_3) ordenadas de atras hacia adelante.
- Generacion de capas con alpha real (canal de transparencia) mediante la opcion `--transparent`, aptas para importar en editores o componer manualmente.
- Recomposicion de las capas para verificar la coherencia con la imagen original (salida `composite.png`).
- Manejo de imagenes con distinto numero de objetos: las capas no utilizadas salen en blanco, lo que se considera normal.
- Reproducibilidad: misma semilla e imagen producen exactamente la misma descomposicion.
- Control limitado por prompt de texto: el prompt solo modula ligeramente la guia, la descomposicion se rige principalmente por la imagen de entrada.

## Casos de uso

- Edicion fotografica profesional: separar un objeto del fondo para retocarlo de forma independiente, por ejemplo cambiar el color de un producto o eliminar elementos no deseados, usando las capas RGBA con alpha real.
- Composicion de escenas: extraer personajes u objetos de una foto y colocarlos en un fondo nuevo, manteniendo la iluminacion y las sombras gracias a la descomposicion en capas.
- Generacion de materiales para diseno grafico: crear assets con transparencia (PNG) a partir de fotografias, listos para usar en carteles, webs o presentaciones.
- Automatizacion de flujos de trabajo de estudio: procesar lotes de imagenes con el script de linea de comandos, generando capas de forma consistente y reproducible para su posterior edicion en Photoshop o GIMP.
- Preparacion de datasets para entrenamiento: generar capas de objetos y fondos a partir de imagenes reales, utiles como datos de supervision para otros modelos de segmentacion o generacion.
- Verificacion de calidad en pipelines de generacion: comparar la imagen recomposicionada (`composite.png`) con la original para detectar errores de descomposicion antes de usar las capas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (PSNR, IoU, etc.) ni comparaciones con otros metodos de descomposicion de capas.

## Requisitos de hardware

- VRAM estimada: el modelo base ocupa ~40 GB en bf16, por lo que se necesita una GPU con al menos 80 GB de memoria para inferencia comoda.
- GPU recomendadas: A100-80, H100, H200 (clase 80 GB). No cabe en GPUs de consumo como RTX 4090 (24 GB) ni en tarjetas profesionales de 48 GB.
- El adaptador LoRA es pequeno (0,3 GB) y se carga junto al modelo base, por lo que no anade requisitos adicionales significativos.
- Despliegue: se proporciona un script de inferencia en Python (`decompose.py`) que usa `torch`, `diffusers`, `transformers` y `peft`. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles. La configuracion recomendada (50 pasos Heun a 640 px) sugiere tiempos de inferencia del orden de decenas de segundos por imagen en una GPU de 80 GB, pero no se aportan datos concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de descomposicion de capas en la documentacion proporcionada. El modelo base Qwen-Image-Layered es el punto de partida, y Stable Layers es un refinamiento mediante RL sobre el. No se pueden ofrecer comparaciones cuantitativas con alternativas como LayerSwap, Cut-and-Paste o metodos de segmentacion por instancias, al no haber datos publicados.

## Limitaciones y advertencias

- La configuracion de inferencia es rigida: usar una resolucion mayor, menos pasos o un muestreador distinto al Heun degrada gravemente los resultados, segun la model card.
- No todas las imagenes requieren las 4 capas; las capas sobrantes salen en blanco, lo que puede confundir en pipelines automaticos si no se filtra.
- El prompt de texto tiene una influencia minima; la descomposicion depende casi exclusivamente de la imagen, por lo que no se puede guiar semanticamente con instrucciones complejas.
- La licencia stabilityai-community restringe el uso comercial: organizaciones o individuos con ingresos anuales superiores a 1.000.000 USD (o equivalente) necesitan una licencia enterprise de Stability AI.
- No se documentan sesgos especificos, pero al ser un modelo de descomposicion visual, puede presentar errores en imagenes con objetos parcialmente ocluidos, transparencias complejas o fondos muy texturizados.
- El modelo base es grande (~40 GB en bf16), lo que limita su despliegue a infraestructura con GPUs de alta gama y descarta entornos de consumo o edge.
- No hay informacion sobre la robustez ante imagenes fuera de distribucion (baja iluminacion, arte digital, etc.) ni sobre la calidad del alpha en bordes finos o cabello.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StabilityLabs/Stable-Layers
- Paper (arXiv): https://arxiv.org/abs/2605.30257
- Pagina del proyecto: https://stability-ai.github.io/stable-layers.github.io/
- Repositorio de codigo: https://github.com/Stability-AI/Stable-Layers
- Licencia: https://stability.ai/license
- Solicitud de licencia enterprise: https://stability.ai/enterprise
