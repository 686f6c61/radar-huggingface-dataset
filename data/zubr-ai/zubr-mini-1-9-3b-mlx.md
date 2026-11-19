# Zubr-AI/zubr-mini-1.9-3b-mlx

## Resumen

Zubr Mini 1.9 3B MLX es la conversión al framework MLX de Apple del modelo Zubr Mini 1.9 3B, un modelo de lenguaje multimodal de 3.000 millones de parámetros desarrollado por Zubr-AI (publicado bajo la cuenta alekringtonnn-ai) mediante ajuste fino sobre Ministral-3-3B, la familia de modelos compactos de Mistral AI. La versión MLX está diseñada específicamente para ejecutarse en chips Apple Silicon (M1/M2/M3/M4) mediante la librería `mlx-lm`, lo que permite inferencia local en Macs sin necesidad de GPU dedicada.

El modelo resuelve el problema de disponer de un asistente multimodal (image-text-to-text) ligero y multilingüe que funcione en hardware de consumo. Frente a los 26 idiomas del modelo base, esta variante declara soporte para 48 idiomas, incluyendo ruso, bielorruso, ucraniano y una amplia representación de lenguas europeas y asiáticas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual radica en su combinación de tamaño reducido (3B), capacidades de visión, cobertura lingüística amplia y distribución en cuantizaciones de 4 y 2 bits pensadas para Macs con 8-16 GB de RAM. Es una opción práctica para prototipado local, aplicaciones de escritorio y despliegues en entornos Apple sin infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ministral-3-3B de Mistral AI); no se detalla si es densa o MoE |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (Q4, ~4,26 GB) y 2 bits (Q2, ~3,17 GB) en formato MLX |
| Idiomas soportados | 48 idiomas, entre ellos: ru, be, en, es, fr, de, nl, ja, it, pl, da, ro, el, uk, br, ar, fa, tr, bn, id, hi, ne, pa, ta, te, zh, pt, ga, uz, tg, tk, lt, sr, bg, sv, fi, ca, gl, is, mr, kn, kk, bs, he, ur, cy, rm, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizados para MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Ministral-3-3B-Base-2512 de Mistral AI, sobre el que se aplicó un ajuste fino supervisado (instrucción) por parte de Zubr-AI. La model card describe el árbol de derivación: Ministral-3-3B-Base → Ministral-3-3B-Instruct → Zubr Mini 1.9 3B (versión GGUF) → Zubr Mini 1.9 3B MLX (esta versión). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal de esta variante es la conversión a MLX, el framework de Apple optimizado para memoria unificada en chips M-series, junto con la ampliación declarada de cobertura lingüística de 26 a 48 idiomas y la incorporación de capacidades de visión (pipeline image-text-to-text). No se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto e instrucciones en 48 idiomas, con especial énfasis en ruso y lenguas eslavas.
- Procesamiento multimodal: entrada de imagen más texto y salida de texto (image-text-to-text), incluyendo reconocimiento de imágenes.
- Ajuste fino de instrucciones ("deep instruction tuning" según la model card).
- Inferencia local rápida en Apple Silicon gracias a la cuantización MLX (Q4 y Q2).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Asistente de escritorio local en macOS: integración vía `mlx-lm` o LM Studio para chat multi-turno sin conexión, aprovechando la memoria unificada de los chips M-series y la cuantización Q4 (~4,26 GB) para caber en Macs de 16 GB.
- Procesamiento de documentos con imágenes: descripción y extracción de información de capturas, diagramas o fotografías combinadas con instrucciones textuales, gracias al pipeline image-text-to-text.
- Aplicaciones multilingües para Europa del Este: traducción y atención al usuario en ruso, bielorruso, ucraniano y otras lenguas eslavas, donde el modelo declara cobertura específica.
- Prototipado rápido de productos de IA: uso de la licencia Apache 2.0 para experimentar y desplegar comercialmente sin fricción legal, con un modelo de 3B que no requiere GPU dedicada.
- Herramientas educativas offline: generación de explicaciones y resúmenes en un portátil Apple sin depender de servicios cloud, útil en entornos con requisitos de privacidad.
- Automatización de tareas de texto en pipelines locales: clasificación, resumen y reescritura de contenido mediante scripts Python con `mlx_lm.generate`.
- Demos y evaluación de modelos en ferias o entornos sin conectividad: ejecución en Macs de gama de entrada con la cuantización Q2 (~3,17 GB) para equipos de 8 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: ~4,26 GB para Q4 y ~3,17 GB para Q2, según los tamaños de archivo indicados en la model card.
- Hardware obligatorio: Mac con Apple Silicon (M1/M2/M3/M4). MLX no funciona en Macs Intel, Windows ni GPUs de otros fabricantes.
- Sistema operativo: macOS 13.5+ (recomendado 14+); Python 3.9+ (recomendado 3.10+).
- Espacio en disco: ~4,3 GB para Q4 o ~3,2 GB para Q2.
- Cabe en Macs de consumo: recomendado 16 GB de RAM o más para Q4; 8 GB para Q2 (con menor calidad).
- Opciones de despliegue: `mlx-lm` (CLI y Python), LM Studio. No aplica vLLM, llama.cpp u Ollama para esta variante MLX (la versión GGUF del modelo base sí los soporta).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Zubr Mini 1.9 3B MLX | 3B | no disponible | Si (image-text-to-text) | 48 | Apache 2.0 | safetensors MLX |
| Ministral-3-3B-Instruct (Mistral AI) | 3B | no disponible | no disponible | 26 (segun la model card) | no disponible | safetensors |
| Zubr Mini 1.9 3B (GGUF) | 3B | no disponible | Si | 48 | Apache 2.0 | GGUF |

La comparativa se limita a los modelos citados en la información proporcionada; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- La cuantización Q2 reduce notablemente la calidad: la propia model card advierte de posibles alucinaciones y errores, por lo que no es recomendable para producción.
- Restricción de plataforma: solo funciona en Apple Silicon; no es desplegable en Linux, Windows ni GPUs NVIDIA/AMD en esta variante.
- No se documentan datos sobre sesgos, composición del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a modelos de 3B, especialmente en tareas de razonamiento complejo o matemáticas.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base Ministral-3-3B de Mistral AI, ya que la model card no detalla la licencia intermedia de la cadena de derivación.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación comunitaria; tratar con cautela en entornos críticos.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Zubr-AI/zubr-mini-1.9-3b-mlx
- Repositorio referenciado en la model card: https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b-mlx
- Modelo base intermedio (GGUF): https://huggingface.co/alekringtonnn-ai/zubr-mini-1.9-3b
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Framework MLX: https://ml-explore.github.io/mlx/
- LM Studio: https://lmstudio.ai
