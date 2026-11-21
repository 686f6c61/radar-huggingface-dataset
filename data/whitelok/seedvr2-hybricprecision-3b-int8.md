# whitelok/seedvr2-hybricprecision-3b-int8

## Resumen

EZVR Flash V1 es una versión cuantizada a INT8 del modelo SeedVR2 de 3B parámetros, un Diffusion Transformer (DiT) orientado a superresolución de vídeo. Lo publica el usuario `whitelok` como parte del proyecto EZVideoRepair, y deriva del modelo base `whitelok/seedvr2-hybricprecision-3b`, que a su vez se apoya en la familia SeedVR2 de restauración de vídeo. El repositorio distribuye únicamente los pesos del DiT cuantizados, mientras que la VAE y el posprocesado permanecen en el repositorio base.

El interés de esta ficha es práctico: se trata de un artefacto de despliegue, no de un modelo entrenado desde cero. La cuantización reduce el peso del DiT a unos 3,45 GB en un único fichero `dit-1.safetensors`, lo que facilita su ejecución en GPUs de consumo medio, a cambio de un formato de empaquetado propietario que exige un grafo de inferencia concreto y un operador específico (`ezvr_demo::w8linear`).

No hay información pública sobre arquitectura interna detallada, datos de entrenamiento, idiomas ni benchmarks. La model card se limita a describir el esquema de cuantización y el formato de empaquetado. Cualquier evaluación de calidad debe hacerse contra el modelo base, no contra esta versión INT8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para superresolución de vídeo |
| Parámetros totales | ~3B (heredados del modelo base SeedVR2 3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 simétrico por canal de salida (rango −127 a 127), escala BF16 por fila; resto de tensores en precisión original |
| Idiomas soportados | no disponible (modelo de vídeo, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con empaquetado EZVR propietario (`dit-1.safetensors`, 3.454.726.480 bytes) |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer (DiT) de aproximadamente 3B parámetros especializado en restauración y superresolución de vídeo, dentro de la línea SeedVR2. Esta variante INT8 no reentrena nada: aplica cuantización post-entrenamiento a 210 matrices lineales del DiT, con esquema simétrico por canal de salida y una escala BF16 por fila. El resto de tensores (incluidas las capas no lineales y las de normalización) mantienen la precisión del modelo fuente.

La innovación técnica relevante no está en el entrenamiento, sino en el empaquetado: el fichero safetensors declara los tensores cuantizados como contenedores BF16 en la cabecera, pero el payload real almacena primero todas las filas INT8 y después todas las escalas BF16. Esto rompe la compatibilidad con cargadores estándar de safetensors y obliga a usar el grafo DiT correspondiente junto con el operador `ezvr_demo::w8linear`. No se dispone de información sobre el dataset de entrenamiento original (número de tokens, composición, uso de RLHF/DPO), ya que la model card no la incluye.

## Capacidades

- Superresolución de vídeo: restauración y escalado de fotogramas mediante difusión, heredado del modelo base SeedVR2.
- Restauración de detalle: el DiT está pensado para recuperar texturas y reducir artefactos de compresión en secuencias de vídeo.
- Ejecución cuantizada: los 210 tensores lineales cuantizados permiten inferencia INT8 con escalas BF16, reduciendo huella de memoria frente al modelo base.
- Compatibilidad de pipeline: requiere el grafo DiT de EZVideoRepair y el operador `ezvr_demo::w8linear`; no funciona con runtimes genéricos de difusión.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no aplicable (modelo de vídeo).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Restauración de archivo audiovisual: aplicar el DiT a secuencias antiguas o comprimidas para recuperar detalle antes de un reescalado a 1080p o 4K, aprovechando la ventana de difusión del modelo base.
- Mejora de metraje de vigilancia o drones: superresolver fotogramas de baja resolución para facilitar inspección visual, con la ventaja de que la versión INT8 reduce el coste por fotograma en GPUs de gama media.
- Preprocesado para pipelines de visión por computador: limpiar y escalar vídeo de entrada antes de pasarlo a detectores o modelos de segmentación, donde los artefactos de compresión degradan la precisión.
- Restauración de vídeo doméstico: procesar grabaciones familiares en baja resolución en una estación de trabajo con una sola GPU, dado el tamaño contenido del fichero (3,45 GB) frente al modelo base en BF16.
- Prototipado de EZVideoRepair: servir como checkpoint de referencia para validar el grafo DiT y el operador `w8linear` antes de desplegar el modelo completo en producción.
- Despliegue en entornos con VRAM limitada: usar la versión INT8 cuando el modelo base BF16 no quepa junto con la VAE y el resto del pipeline en la GPU disponible.
- Investigación en cuantización de DiT: comparar la calidad de salida INT8 frente al modelo base para estudiar la sensibilidad de las capas lineales en tareas de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de PSNR, SSIM, LPIPS ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada: el fichero del DiT ocupa 3,45 GB; sumando la VAE y los buffers de activación del pipeline de difusión, se estima un consumo total en el rango de 8-16 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: no disponible de forma oficial; por tamaño, una RTX 3090, RTX 4090 o A100 son candidatas razonables para el pipeline completo.
- GPU de consumo: probablemente cabe en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080), siempre que el pipeline de EZVideoRepair esté optimizado; no confirmado por el autor.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). Requiere el grafo DiT de EZVideoRepair y el operador `ezvr_demo::w8linear`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EZVR Flash V1 (este) | ~3B | no disponible | INT8 + BF16 escalas | Apache 2.0 | Hugging Face (`whitelok/seedvr2-hybricprecision-3b-int8`) |
| SeedVR2 3B base (`whitelok/seedvr2-hybricprecision-3b`) | ~3B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de superresolución de vídeo (p. ej. Real-ESRGAN, BasicVSR++) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento (PSNR, SSIM, LPIPS) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Formato propietario: el safetensors no es cargable con librerías estándar; requiere el grafo DiT de EZVideoRepair y el operador `ezvr_demo::w8linear`.
- Sin benchmarks: no hay evidencia publicada de la degradación de calidad introducida por la cuantización INT8 frente al modelo base.
- Dependencia del modelo base: la VAE y el posprocesado viven en el repositorio base; este repo no es autosuficiente.
- Sesgos: no disponibles (modelo de vídeo, no lingüístico).
- Alucinación: en difusión de vídeo el riesgo se traduce en artefactos o detalle inventado en texturas; no cuantificado por el autor.
- Idiomas: no aplicable.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` de atribución del repositorio.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Fecha de creación: 2026-11-21, según metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/whitelok/seedvr2-hybricprecision-3b-int8
- Modelo base: https://huggingface.co/whitelok/seedvr2-hybricprecision-3b
- Revisión fijada del modelo base (pesos y VAE): https://huggingface.co/whitelok/seedvr2-hybricprecision-3b/tree/4aedb55b384131a3a475dbed228110a510f4a85b
- Licencia Apache 2.0: https://huggingface.co/whitelok/seedvr2-hybricprecision-3b-int8/blob/main/LICENSE
- Atribución: https://huggingface.co/whitelok/seedvr2-hybricprecision-3b-int8/blob/main/NOTICE
