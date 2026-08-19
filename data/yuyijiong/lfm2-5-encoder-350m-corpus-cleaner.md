# yuyijiong/LFM2.5-Encoder-350M-corpus-cleaner

## Resumen

LFM2.5-Encoder-350M-corpus-cleaner es un modelo de clasificación de tokens (token classification) desarrollado por Yijiong Yu, diseñado específicamente para la limpieza de corpus de preentrenamiento. Partiendo del encoder bidireccional LFM2.5-Encoder-350M de LiquidAI, el modelo etiqueta cada token de un texto ruidoso como `KEEP` (conservar) o `DELETE` (eliminar), permitiendo reconstruir el texto limpio en una sola pasada sin necesidad de reescribir el documento. Su objetivo es resolver el problema del ruido presente en los corpus web a gran escala: bytes corruptos, elementos de navegación, anuncios, bibliografías y otros fragmentos de bajo valor para el entrenamiento.

El modelo se entrenó sobre aproximadamente 3 millones de pares alineados (texto original → texto limpio), generados con el LLM Qwen3.5-9B a partir de fuentes web ruidosas. Frente a los enfoques tradicionales (reglas manuales, clasificadores de calidad documental o limpieza con LLMs generativos), este modelo ofrece una velocidad órdenes de magnitud superior: alcanza unos 3 000 tokens por segundo en CPU y unos 160 000 tokens por segundo en una GPU H20 con PyTorch, lo que hace viable la limpieza de corpus de tamaño terabyte en días. Soporta un contexto de 8 192 tokens, lo que reduce la fragmentación de documentos largos durante el preprocesado.

El modelo está disponible en Hugging Face bajo una licencia no especificada, con pesos en formato safetensors y requiere `trust_remote_code=True` al cargarlo, ya que incluye código de modelado personalizado. Es una herramienta práctica para equipos que preparan datos de preentrenamiento o ajuste fino y necesitan una solución de limpieza rápida, sin GPU obligatoria y sin depender de un stack de reglas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional (basado en LFM2.5-Encoder-350M) con cabeza de clasificación de tokens |
| Parametros totales | 354 486 020 (~350 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8 192 tokens (recomendado `max_length`) |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin archivos GGUF o cuantizados publicados) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con código personalizado para `transformers`) |

## Arquitectura y entrenamiento

El modelo se construye sobre el encoder bidireccional LFM2.5-Encoder-350M de LiquidAI, una arquitectura transformer densa de aproximadamente 350 millones de parámetros. Sobre esta base se añade una capa de clasificación por token con dos etiquetas (`KEEP` y `DELETE`). El modelo es puramente encoder, por lo que no genera texto, sino que predice una etiqueta para cada token de entrada. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) más allá de los parámetros totales y la naturaleza bidireccional.

El entrenamiento se realizó sobre el dataset propio `yuyijiong/pretrain-data-clean-delete-only`, que contiene alrededor de 3 millones de ejemplos alineados. Los pares se generaron utilizando el LLM Qwen3.5-9B con un prompt de limpieza sobre texto fuente web ruidoso. No se han publicado detalles sobre el número de épocas, la función de pérdida, el optimizador ni la estrategia de muestreo. Tampoco se menciona el uso de RLHF o DPO; el entrenamiento es supervisado de clasificación de tokens.

Una innovación destacable es el propio enfoque: en lugar de descartar documentos completos por baja calidad (como hacen los clasificadores FastText o BERT), el modelo identifica y elimina selectivamente los tramos ruidosos, preservando el contenido útil. Esto permite tanto limpiar como filtrar en un solo paso, y la longitud del texto tras la limpieza puede usarse como señal de calidad.

## Capacidades

- Clasificación de tokens en dos categorías: `KEEP` (conservar) y `DELETE` (eliminar), permitiendo reconstruir el texto limpio concatenando los tramos conservados.
- Limpieza de texto ruidoso procedente de corpus web: elimina anuncios, elementos de navegación, referencias, bibliografías, texto corrupto y otros fragmentos irrelevantes para el entrenamiento.
- Funciona como filtro de calidad: documentos de muy baja calidad (p. ej., páginas compuestas casi íntegramente por anuncios) pueden quedar vacíos tras la limpieza, sirviendo la longitud resultante como indicador de calidad.
- Soporte de contexto largo de 8 192 tokens, lo que permite procesar documentos extensos sin fragmentación excesiva.
- Capacidad multilingüe para inglés y chino, los dos idiomas sobre los que se entrenó.
- Inferencia extremadamente rápida: ~3 000 tokens/s en CPU, ~160 000 tokens/s en GPU H20 con PyTorch, y potencialmente mayor con vLLM.
- No requiere GPU para un uso práctico, lo que facilita su despliegue en entornos con recursos limitados.
- Integración sencilla con la librería `transformers` mediante `AutoModelForTokenClassification` y `trust_remote_code=True`.

## Casos de uso

- Limpieza de corpus para preentrenamiento de LLMs: dado un dataset web crudo, el modelo puede procesar cada documento y eliminar el ruido en una sola pasada, produciendo texto limpio listo para el entrenamiento. Su alta velocidad (160k tokens/s en GPU) permite procesar terabytes de datos en días.
- Preparación de datasets para ajuste fino (fine-tuning): antes de entrenar un modelo en una tarea específica, se puede aplicar este limpiador para eliminar fragmentos irrelevantes que puedan degradar la calidad del ajuste.
- Extracción de contenido principal de páginas web: el modelo identifica y conserva el texto útil (artículos, entradas de blog) mientras descarta la "cáscara" de la página (menús, pies de página, enlaces relacionados).
- Filtrado de documentos de baja calidad: al analizar la longitud del texto tras la limpieza, se pueden descartar automáticamente documentos que queden vacíos o casi vacíos, como páginas de anuncios o contenido duplicado.
- Pipeline de ingestión de datos para sistemas RAG: antes de indexar documentos en una base vectorial, se puede limpiar el texto para mejorar la calidad de las recuperaciones, eliminando ruido que podría confundir al modelo de embeddings.
- Monitorización y control de calidad de corpus en producción: integrado en un pipeline de datos, el modelo puede actuar como un filtro en tiempo real para detectar y eliminar contenido no deseado antes de que llegue al entrenamiento o a la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que no es un modelo generativo sino un clasificador de tokens. La model card no reporta métricas de precisión, recall o F1 sobre conjuntos de validación. Los únicos datos de rendimiento disponibles son las mediciones de throughput:

| Entorno | Throughput |
|---|---|
| CPU | ~3 000 tokens/s |
| GPU H20 (PyTorch) | ~160 000 tokens/s |
| vLLM | Potencialmente superior (no cuantificado) |

Estas cifras indican que el modelo es adecuado para procesamiento a gran escala, pero no hay evidencia cuantitativa de su calidad de limpieza frente a otros métodos. Se recomienda evaluar el modelo en un subconjunto representativo del corpus propio antes de adoptarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~350 M de parámetros, en precisión FP32 ocupa aproximadamente 1,4 GB de memoria (350 M × 4 bytes). Con cuantización a FP16 o int8, el uso se reduciría a ~700 MB o ~350 MB respectivamente, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP32. Para throughput máximo, se recomienda una GPU de datacenter como la H20 (usada en las pruebas) o una A100/H100. GPUs consumer como RTX 3090, RTX 4090 o incluso RTX 3060 son suficientes para inferencia a alta velocidad.
- Compatibilidad con GPUs consumer: sí, el modelo cabe en prácticamente cualquier GPU moderna. También puede ejecutarse en CPU, aunque con menor throughput (~3k tokens/s).
- Opciones de despliegue: se puede cargar con `transformers` directamente (con `trust_remote_code=True`). Para producción a gran escala, se puede servir con vLLM, que soporta modelos de clasificación de tokens y permite mayor throughput. También es posible usar `torch.compile` o `ONNX Runtime` para optimizar la inferencia en CPU.
- Latencia y throughput: en CPU se miden ~3 000 tokens/s; en GPU H20 con PyTorch, ~160 000 tokens/s. La latencia por documento dependerá de la longitud del texto; con 8k de contexto, un documento de 2 000 tokens se procesa en menos de 0,1 s en GPU y en ~0,7 s en CPU.

## Comparativa con modelos similares

No se han identificado modelos de token classification específicamente diseñados para limpieza de corpus con los que comparar directamente (misma arquitectura y tarea). Los enfoques alternativos en el mismo espacio de problema son:

| Enfoque | Ventajas | Limitaciones |
|---|---|---|
| Reglas manuales (regex, listas negras) | Rápidas, transparentes, sin coste de entrenamiento | Frágiles, difíciles de mantener, no cubren el "long tail" de patrones de ruido |
| Clasificadores de calidad (FastText, BERT) | Rápidos, pueden puntuar documentos completos | Solo descartan documentos, no limpian el texto interno; no preservan el contenido útil |
| LLM generativos para limpieza (p. ej., Qwen3.5-9B) | Alta calidad, adaptables a distintos tipos de ruido | Muy lentos (~200 tokens/s con 500 workers para 1 TB → ~120 días), requieren GPU potentes y coste elevado |

El modelo presentado se sitúa entre ambos extremos: ofrece la velocidad de un clasificador ligero y la granularidad de un limpiador basado en LLM, pero sin la flexibilidad de un modelo generativo para entender contextos complejos. No hay datos comparativos de calidad (F1, precisión) frente a estos enfoques.

## Limitaciones y advertencias

- El modelo está en versión v0.0.1 y puede no cubrir todos los casos límite de ruido. Los autores invitan a reportar problemas.
- El entrenamiento se realizó con datos generados por Qwen3.5-9B, lo que puede introducir sesgos del propio LLM en la definición de qué es "ruido" y qué es contenido útil.
- Solo soporta inglés y chino. No se garantiza un buen comportamiento en otros idiomas.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de usarlo en productos comerciales.
- Requiere `trust_remote_code=True` al cargar con `transformers`, lo que implica ejecutar código personalizado no auditado por la comunidad. Se debe revisar el código antes de usarlo en entornos de producción.
- No se han publicado métricas de calidad (precisión, recall, F1) sobre conjuntos de validación; la eficacia real debe evaluarse en el corpus propio.
- El modelo puede eliminar contenido legítimo si el texto contiene formatos inusuales o jerga técnica específica. Es recomendable validar la salida en una muestra representativa.
- No es un modelo generativo: no puede reescribir ni reformular texto, solo eliminar fragmentos. No sirve para tareas de generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuyijiong/LFM2.5-Encoder-350M-corpus-cleaner
- Espacio de demostración: https://huggingface.co/spaces/yuyijiong/LFM2.5-Encoder-350M-corpus-cleaner
- Dataset de entrenamiento: https://huggingface.co/datasets/yuyijiong/pretrain-data-clean-delete-only
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
