# weepiess2383/arc-geo-noise-n5-0821

## Resumen

Este repositorio contiene un archivo de investigación (checkpoint) denominado `arc-geo-noise-n5-0821`, publicado por el usuario `weepiess2383` en Hugging Face. Se trata de un conjunto de pesos EMA (Exponential Moving Average) extraídos de un entrenamiento de fine-tuning completo sobre un modelo base llamado `geoB`, dentro de un experimento de ablación de ruido geométrico (geometry-noise) con la variante N5. El entrenamiento se realizó sobre el benchmark de robótica LIBERO, en modo "camode-side" (cámara lateral) y con co-entrenamiento (cotrain). Según la model card, la ablación se cerró como resultado negativo: el ruido geométrico se midió como inerte.

El repositorio no contiene un modelo completo listo para inferencia, sino únicamente los pesos EMA en formato `state.pt` (fp32) organizados en shards por pasos de entrenamiento (step000002500 a step000020000). Está pensado para ser cargado mediante el script `methods/lafm/vla_flow_ft.py` con `init_use_ema=true`. Es un archivo de almacenamiento en frío para reproducibilidad de experimentos, no un modelo de producción. El tamaño total del repositorio es de 98.9 GB, con 8 shards de aproximadamente 12.36 GB cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere un modelo VLA, Vision-Language-Action, pero no se especifica) |
| Parametros totales | no disponible (el nombre "neo2b" sugiere ~2B, pero no confirmado) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos están en fp32 según la model card) |
| Idiomas soportados | no disponibles |
| Licencia | other (sin especificar términos) |
| Formato de pesos | state.pt (shards con EMA en fp32, nombres limpios) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se menciona que es un fine-tuning completo (full-FT) de un modelo base `geoB`, con co-entrenamiento en el benchmark LIBERO. El experimento corresponde a una ablación de ruido geométrico (N5) y se describe como "EMA-consolidated research checkpoint archive". Los pesos se extrajeron de checkpoints de entrenamiento originales, verificados por huella digital contra `engine_meta.pt`. No se retuvieron estados de optimizador. No hay datos sobre el número de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO.

## Capacidades

- No se documentan capacidades funcionales específicas (generación de texto, razonamiento, código, etc.).
- Es un checkpoint de investigación para un modelo VLA (visión-lenguaje-acción), orientado a tareas de robótica, pero sin especificación de acciones o interfaces.
- No se indica soporte de tool calling, agentes, ni capacidades multilingües.
- El único propósito declarado es cargar los pesos EMA para reproducir o analizar el experimento de ablación.

## Casos de uso

- Reproducción de experimentos de investigación: cargar los pesos EMA con `load_pretrain_trainables` para verificar los resultados de la ablación de ruido geométrico en LIBERO.
- Análisis de ablación: estudiar el efecto del ruido geométrico en el rendimiento de un modelo VLA, dado que el resultado se declaró negativo (inerte).
- Comparación de checkpoints intermedios: los 8 shards corresponden a pasos de entrenamiento (2500 a 20000) y permiten analizar la evolución del modelo durante el fine-tuning.
- Almacenamiento en frío: sirve como respaldo de pesos EMA para futuras referencias o para continuar entrenamiento desde un punto concreto (aunque sin optimizador).
- Investigación en robótica: como referencia para otros experimentos que utilicen LIBERO o arquitecturas VLA similares.
- Validación de pipelines de carga: probar el script `vla_flow_ft.py` con `init_use_ema=true` para asegurar la compatibilidad del formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, y el experimento se describe como una ablación con resultado negativo, sin cifras concretas.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- El tamaño de cada shard (~12.36 GB en fp32) sugiere que cargar un solo shard en memoria requiere al menos 12 GB de RAM/VRAM, pero no se indica el número total de parámetros ni la memoria necesaria para la inferencia.
- No se mencionan GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- Dado que es un archivo de investigación, no se espera un despliegue en producción.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información consultada. El repositorio es un archivo de investigación específico, sin comparaciones públicas con otras alternativas.

## Limitaciones y advertencias

- Es un archivo de investigación, no un modelo listo para uso en producción.
- La licencia "other" no especifica términos; se desconoce si permite uso comercial o modificaciones.
- Solo contiene pesos EMA; no se incluyen estados de optimizador, lo que limita la reanudación del entrenamiento.
- El experimento se declaró como resultado negativo (ruido geométrico inerte), por lo que su utilidad práctica es limitada.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto/idioma.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026-08-27) es futura respecto a la fecha actual, lo que podría indicar un error en los metadatos o un entorno simulado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/weepiess2383/arc-geo-noise-n5-0821
- Perfil del autor: https://huggingface.co/weepiess2383
- Repositorio relacionado (arc-layermap-ft): https://huggingface.co/weepiess2383/arc-layermap-ft
- Repositorio relacionado (arc-geo-libero-ft): https://huggingface.co/weepiess2383/arc-geo-libero-ft
- Repositorio relacionado (arc-layermap-flft-0813a): https://huggingface.co/weepiess2383/arc-layermap-flft-0813a
- Código relacionado en GitHub (arc_geo.py): https://github.com/Wall-of-Shames/Arc-Ai-2/blob/main/arc_geo.py
