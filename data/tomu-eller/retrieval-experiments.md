# Tomu-eller/retrieval-experiments

## Resumen

`Tomu-eller/retrieval-experiments` es un repositorio experimental que contiene una implementación propia de un Vision Transformer (ViT) orientada a tareas de recuperación (retrieval) multimodal. Lo publica el usuario Tomu-eller en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo entrenado ni de un release con pesos listos para producción: el propio autor lo describe como un punto de partida reproducible («nano») con una configuración arquitectónica explícita y un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests).

El interés del repositorio es fundamentalmente técnico y de investigación: documenta una arquitectura ViT con atención de ventana deslizante (sliding window), fusión de tipo Tucker, activación Mish y normalización ScaleNorm, junto con una receta de entrenamiento por defecto basada en optimizador LAMB y schedule coseno. El artefacto principal es el script `model.py`, no los pesos.

Es relevante ahora como plantilla para experimentos de retrieval con ViT, pero conviene subrayar que no hay benchmarks publicados, no hay pesos entrenados y el tamaño del repositorio es de 0.0 GB, con 24.832 parámetros en el fichero safetensors según los metadatos (cifra que corresponde a un checkpoint de inicialización, no a un modelo funcional de retrieval).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con atención de ventana deslizante, fusión Tucker, activación Mish y normalización ScaleNorm |
| Parametros totales | 24.832 (según metadatos de safetensors; corresponde al checkpoint de inicialización, variante «nano») |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización); implementación en PyTorch (`model.py`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de escala «nano» con atención de ventana deslizante en lugar de atención global completa, lo que reduce el coste cuadrático en imágenes de resolución alta a cambio de limitar el alcance espacial de cada token. Incorpora fusión Tucker (descomposición tensorial para combinar modalidades o features), activación Mish y normalización ScaleNorm. La configuración generada se registra en `config.json` y la receta de experimento por defecto en `training_args.json`.

No se ha completado ningún entrenamiento: el fichero `model.safetensors` es un checkpoint de inicialización para pruebas de humo, no un modelo entrenado. La receta por defecto usa el optimizador LAMB con schedule coseno, pero el autor advierte explícitamente que son valores de partida del script y no evidencia de una ejecución realizada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO. La evaluación sugerida por el autor es Flickr30k, con métrica de la tarea reportada en al menos tres semillas y una baseline de capacidad equivalente.

## Capacidades

- No dispone de capacidades funcionales verificadas: el checkpoint no ha sido entrenado.
- El código implementa un ViT orientado a retrieval, potencialmente usable para extracción de embeddings visuales una vez entrenado.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües documentadas (es un modelo de visión).
- No hay modo «thinking», visión-a-texto entrenado, audio ni otras capacidades especiales verificadas.
- La implementación es personalizada, por lo que las APIs automáticas de carga genéricas requieren un adaptador explícito.

## Casos de uso

- Prototipado de arquitecturas ViT para retrieval: sirve como base reproducible para experimentar con atención de ventana deslizante y fusión Tucker en tareas de recuperación imagen-texto, partiendo del script `model.py`.
- Reproducción de experimentos académicos: permite montar una pipeline de entrenamiento con LAMB y schedule coseno y comparar contra baselines de igual capacidad bajo el mismo presupuesto de datos y semillas.
- Pruebas de humo de infraestructura: el checkpoint de inicialización permite validar pipelines de carga, preprocesado y serialización en safetensors antes de invertir en entrenamiento real.
- Evaluación en Flickr30k: el propio autor propone este dataset como primer banco de pruebas para medir la métrica de retrieval una vez entrenado el modelo.
- Investigación sobre normalización y activaciones: útil para estudiar el efecto de ScaleNorm y Mish en ViTs de escala reducida frente a LayerNorm y GELU/ReLU.
- Docencia y formación: ejemplo compacto de implementación de un ViT con configuración explícita, adecuado para explicar atención con ventana y fusión tensorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con rigor; con 24.832 parámetros en el checkpoint, el uso de memoria sería mínimo, pero al no ser un modelo entrenado la estimación carece de sentido práctico.
- GPU recomendadas: no disponible; para el entrenamiento propuesto (ViT nano sobre Flickr30k) bastaría una GPU consumer moderna, pero no hay datos publicados.
- Cabe en GPU consumer: sí, cualquier GPU con unos pocos GB de VRAM podría alojar el checkpoint de inicialización.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser una implementación PyTorch personalizada, el despliegue requeriría adaptador propio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tomu-eller/retrieval-experiments | 24.832 (checkpoint init) | no disponible | sin benchmarks | Apache 2.0 | repositorio experimental, sin pesos entrenados |
| CLIP (ViT-B/32, OpenAI) | ~151M | 77 tokens de texto | benchmarks públicos en retrieval | MIT (pesos) | pesos entrenados disponibles |
| SigLIP (ViT-B) | ~203M | variable | benchmarks públicos en retrieval | Apache 2.0 | pesos entrenados disponibles |
| OpenCLIP (ViT-B) | ~150M | 77 tokens de texto | benchmarks públicos en retrieval | MIT/Apache según variante | pesos entrenados disponibles |

La comparación es asimétrica: los tres alternativas son modelos entrenados y evaluados, mientras que este repositorio es una plantilla sin entrenamiento. No es un sustituto directo de ninguno de ellos en producción.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.
- No hay benchmarks, por lo que no se puede afirmar ningún nivel de calidad en retrieval.
- Riesgo elevado de resultados sin sentido si se usa el checkpoint de inicialización como si fuera un modelo entrenado.
- La implementación es personalizada y no es compatible con APIs de carga automática sin adaptador.
- No se documentan sesgos, pero al no haber datos de entrenamiento tampoco pueden evaluarse.
- La licencia Apache 2.0 permite uso comercial del código, pero deben revisarse por separado los términos de los datasets externos que se usen (por ejemplo, Flickr30k).
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse de forma separada de los valores por defecto aquí incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tomu-eller/retrieval-experiments
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
