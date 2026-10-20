# xidianphotonics/cnn-transformer-retrieval-quantized

## Resumen

`xidianphotonics/cnn-transformer-retrieval-quantized` es un repositorio de HuggingFace que contiene una implementación propia y mínima de una arquitectura denominada "Cnn Transformer" orientada a tareas de *retrieval* (recuperación de información, presumiblemente multimodal imagen-texto). Lo publica el usuario xidianphotonics y no se trata de un modelo entrenado, sino de un esqueleto reproducible: código de entrenamiento (`finetune.py`), configuración de arquitectura (`config.json`), receta de experimento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) válido únicamente para *smoke tests*.

El tamaño real declarado en safetensors es de 24.832 parámetros (aproximadamente 24,8 mil), lo que lo sitúa tres o cuatro órdenes de magnitud por debajo de los codificadores de retrieval habituales. La variante publicada se etiqueta como "xlarge" dentro de la propia escala del autor, con atención lineal, fusión de tipo Tucker, activación GELU-tanh y normalización RMSNorm. El repositorio no incluye resultados de benchmarks ni afirma ningún rendimiento.

Su relevancia actual es, por tanto, la de un artefacto de investigación reproducible: permite a un equipo montar un pipeline de entrenamiento y evaluación de retrieval con una arquitectura no estándar (atención lineal + fusión Tucker) y compararla en igualdad de condiciones (mismos datos, mismo presupuesto de ajuste, mismas semillas) contra baselines de capacidad equivalente. No es un modelo para producción ni para uso directo en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (implementación propia; atención lineal, fusión Tucker, activación GELU-tanh, RMSNorm) |
| Parametros totales | 24.832 (≈24,8 mil) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre del repo incluye "quantized", pero la model card no documenta ninguna cuantización) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python/PyTorch |
| Escala declarada | xlarge (dentro de la escala del propio autor) |
| Optimizador por defecto | RMSprop con scheduler polinómico |
| Descargas / likes | 0 / 0 |
| Tamaño del repo | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es una implementación ad hoc denominada "Cnn Transformer", que combina mecanismos convolucionales con bloques transformer. Según la configuración incluida, emplea atención de tipo lineal (frente a la atención softmax cuadrática estándar), fusión de modalidades mediante descomposición de Tucker, activación GELU-tanh y normalización RMSNorm. No se especifican el número de capas, la dimensión oculta, el número de cabezas ni la ventana de contexto en la información disponible.

El entrenamiento no se ha realizado. La receta por defecto del script usa RMSprop con un scheduler polinómico, pero el autor advierte explícitamente que son valores de partida y no evidencia de una ejecución completada. No hay información sobre volumen de tokens, composición del dataset, ni sobre fases de RLHF, DPO o ajuste por preferencias (poco probable dado el tamaño y el propósito). Tampoco se documenta ninguna innovación adicional como decodificación especulativa o atención dispersa. El artefacto principal es `finetune.py`, que contiene tanto la definición del modelo como un punto de entrada ejecutable con un ejemplo de smoke test en su bloque `__main__`.

## Capacidades

- No se ha demostrado ninguna capacidad funcional: el checkpoint incluido es de inicialización y no ha sido entrenado.
- Tarea objetivo declarada: *retrieval* (recuperación), con evaluación sugerida sobre Flickr30k.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.
- Al ser una implementación personalizada, requiere un adaptador explícito para funcionar con APIs de carga automática genéricas (por ejemplo, `AutoModel.from_pretrained`).
- Incluye un script de ajuste fino (`finetune.py`) ejecutable mediante `python finetune.py --help`.

## Casos de uso

- Baseline reproducible para retrieval imagen-texto: punto de partida para ajustar la arquitectura sobre Flickr30k con al menos tres semillas y comparar contra un baseline de capacidad equivalente, tal y como recomienda el propio autor.
- Smoke test de infraestructura de entrenamiento: validar que un pipeline nuevo (carga de safetensors, bucle de entrenamiento, logging, checkpoints) funciona de extremo a extremo con un modelo de 24,8 mil parámetros antes de escalar a modelos reales.
- Fixture en integración continua: incluir el checkpoint como activo de prueba para verificar que los wrappers de carga personalizados y las conversiones de formato no rompen ante cambios de código.
- Estudio de ablación sobre atención lineal: comparar atención lineal frente a atención softmax completa manteniendo el resto de la configuración fija, aislando el efecto en la métrica de retrieval.
- Estudio de ablación sobre fusión Tucker: evaluar si la descomposición de Tucker aporta ventaja frente a concatenación o cross-attention en la fusión de modalidades, con el mismo presupuesto de cómputo.
- Prototipado de adaptadores de carga: desarrollar y depurar el adaptador explícito necesario para integrar implementaciones custom en frameworks que asumen arquitecturas registradas.
- Material docente: ejemplo didáctico de estructura de repositorio de modelo (config, training args, checkpoint de inicialización) y de buenas prácticas de documentación de límites experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado. La única guía de evaluación proporcionada es metodológica: usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas, incluir un baseline de capacidad equivalente y conservar los logs de entrenamiento y las versiones del entorno junto a cualquier resultado publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 24.832 parámetros, los pesos ocupan aproximadamente 99 KB en fp32 y unos 50 KB en fp16.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU, incluida una iGPU, y funciona en CPU sin problema.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier RTX o equivalente (el cuello de botella sería el pipeline de datos, no el modelo).
- Opciones de despliegue: PyTorch con carga manual mediante el código del repositorio y `safetensors`. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama; llama.cpp no sería aplicable al no tratarse de un modelo de lenguaje causal con pesos publicados en GGUF.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones, y sin entrenamiento carecen de sentido para la tarea objetivo).

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento público general y no forman parte de la información proporcionada para este modelo; se incluyen solo como referencia de escala.

| Modelo | Parametros | Contexto | Rendimiento retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cnn-transformer-retrieval-quantized | 24.832 | no disponible | no disponible (sin entrenar) | BSD-3-Clause | HuggingFace, 0 descargas |
| CLIP ViT-B/32 | ≈151 M | 77 tokens (texto) | no disponible en esta ficha | MIT | HuggingFace, ampliamente usado |
| SigLIP base | ≈203 M | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | HuggingFace |

La diferencia de escala es de tres a cuatro órdenes de magnitud en número de parámetros, por lo que cualquier comparación de rendimiento exigiría entrenar previamente este modelo con un presupuesto de cómputo equiparable.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para retrieval ni para ninguna otra tarea.
- No ha sido auditado en robustez, equidad ni transferencia de dominio; el autor lo describe como punto de partida experimental.
- No hay resultados de benchmarks, ni promesa de rendimiento, ni comparación con baselines publicada.
- El nombre del repositorio incluye "quantized", pero no se documenta ningún esquema de cuantización ni se distribuyen pesos cuantizados; conviene verificar el contenido real antes de asumir compatibilidad con pipelines de cuantización.
- Ausencia total de información sobre idiomas, contexto y composición de datos: imposibilita evaluar sesgos lingüísticos o culturales.
- Implementación personalizada: las APIs automáticas de carga fallarán sin un adaptador explícito, lo que añade fricción de integración.
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero el autor advierte de que deben revisarse por separado los términos de los datos externos con los que se use el repositorio.
- Con 24,8 mil parámetros, la capacidad de representación es intrínsecamente muy limitada; cualquier resultado sobre datos reales requerirá rediseñar la escala del modelo, no solo entrenarlo.
- Riesgo de alucinación: no aplica directamente (no es un modelo generativo de lenguaje), pero no hay información que lo confirme.

## Enlaces

- HuggingFace: https://huggingface.co/xidianphotonics/cnn-transformer-retrieval-quantized

No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
