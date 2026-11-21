# thomaswhitedir/poolformer-multitask

## Resumen

Poolformer-multitask es un prototipo de investigación publicado por el usuario thomaswhitedir en Hugging Face. Se trata de una implementación personalizada de la arquitectura PoolFormer (MetaFormer con pooling como operador de mezcla de tokens) orientada a tareas multitarea, con atención de tipo linear y fusión mediante co-attention. El repositorio contiene el código de definición del modelo, un script de fine-tuning, la configuración de arquitectura y un checkpoint de inicialización en formato safetensors.

El modelo es relevante únicamente como punto de partida experimental: el propio autor indica explícitamente que el checkpoint no ha sido entrenado ni evaluado, y que no se reclama ningún resultado de benchmark. El recuento de parámetros reportado en los safetensors es de 33.088, un valor extremadamente reducido que corresponde a una inicialización de pruebas (smoke test), no a un modelo funcional de escala "base" en el sentido habitual del término.

Por tanto, esta ficha debe leerse como documentación de un artefacto de investigación reproducible, no como la de un modelo listo para producción. No hay información sobre datos de entrenamiento, idiomas soportados, tokenizador ni resultados empíricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PoolFormer (MetaFormer con pooling), atención linear, fusión co-attention |
| Parametros totales | 33.088 (según safetensors; el autor etiqueta la escala como "base") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python/PyTorch |

## Arquitectura y entrenamiento

La arquitectura declarada es PoolFormer, una variante de MetaFormer en la que el mecanismo de mezcla de tokens se sustituye por operaciones de pooling en lugar de self-attention. La configuración del repositorio especifica atención de tipo linear, fusión mediante co-attention (habitual en configuraciones multitarea o multimodal), activación GELU-Tanh y normalización ScaleNorm. El script principal es `finetune.py`, que actúa como artefacto central e incluye un bloque `__main__` con un ejemplo ejecutable de prueba.

No se ha publicado información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre etapas de RLHF, DPO o ajuste supervisado. La receta de experimento por defecto usa el optimizador Adam con un scheduler coseno, pero el autor aclara que son valores de partida del script y no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. Al ser una implementación personalizada, las APIs genéricas de carga automática (por ejemplo, `AutoModel`) requieren un adaptador explícito.

## Capacidades

- No se documentan capacidades funcionales verificadas: el checkpoint no ha sido entrenado.
- El código soporta un flujo de fine-tuning multitarea mediante `finetune.py`.
- La configuración de arquitectura incluye co-attention, lo que sugiere un diseño previsto para fusionar múltiples modalidades o tareas, aunque no se especifica cuáles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre MetaFormer y PoolFormer: el repositorio sirve como base reproducible para experimentar con variantes de pooling como mecanismo de mezcla de tokens en lugar de atención.
- Pruebas de humo de pipelines de entrenamiento: `finetune.py` permite validar un bucle completo de fine-tuning (carga de datos, forward, backward, scheduler coseno) antes de escalar a modelos mayores.
- Estudio de fusiones co-attention en entornos multitarea: la configuración permite adaptar el bloque de fusión a tareas concretas y medir su efecto frente a baselines de igual capacidad.
- Docencia y prototipado rápido: al ser un modelo de 33.088 parámetros, se puede ejecutar en CPU en milisegundos, lo que facilita demostraciones de arquitecturas tipo MetaFormer.
- Benchmarking metodológico: el autor propone evaluar con un conjunto held-out específico de la tarea, al menos tres semillas y un baseline de capacidad equivalente, lo que encaja con estudios de reproducibilidad.
- Punto de partida para fine-tuning en tareas de clasificación o regresión: sustituyendo la cabeza multitarea por una específica y entrenando sobre datos propios, aunque sin garantías de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para el checkpoint de 33.088 parámetros en fp32; ejecutable en CPU sin GPU.
- GPU recomendadas: no aplica para el checkpoint actual; cualquier GPU consumer (incluso integradas) es suficiente para pruebas de humo.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: al ser una implementación personalizada, requiere cargar el código del repositorio directamente; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; para un modelo de este tamaño la latencia sería del orden de microsegundos a milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| thomaswhitedir/poolformer-multitask | 33.088 | no disponible | BSD-3-Clause | Prototipo sin entrenar |
| PoolFormer oficial (sail-sg) | ~12M–82M según variante | no disponible | Apache-2.0 | Modelos entrenados en ImageNet |
| MetaFormer oficial | ~5M–73M según variante | no disponible | Apache-2.0 | Modelos entrenados y evaluados |
| Cualquier transformer multitarea de referencia | no disponible | no disponible | no disponible | no disponible |

La comparación con las implementaciones oficiales de PoolFormer y MetaFormer es únicamente arquitectónica: este repositorio no incluye pesos entrenados ni resultados, por lo que no es comparable en rendimiento.

## Limitaciones y advertencias

- El checkpoint es una inicialización aleatoria: no produce salidas útiles y no debe usarse en producción.
- No se ha auditado robustez, equidad ni transferencia de dominio.
- No hay información sobre sesgos, idiomas o datos de entrenamiento.
- El recuento de 33.088 parámetros contradice la etiqueta "base" del autor; conviene verificar la configuración antes de asumir una escala concreta.
- Licencia BSD-3-Clause permite uso comercial, pero los términos de los datos externos deben revisarse por separado.
- Al ser una implementación personalizada, las herramientas estándar de carga y despliegue pueden no funcionar sin un adaptador.
- Cualquier resultado futuro debe documentarse en un checkpoint separado y no confundirse con los valores por defecto del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/thomaswhitedir/poolformer-multitask
- PoolFormer (paper original, referencia arquitectónica): https://arxiv.org/abs/2111.11418
- MetaFormer (paper de referencia): https://arxiv.org/abs/2111.11418
- Repositorio oficial PoolFormer (sail-sg): https://github.com/sail-sg/poolformer
