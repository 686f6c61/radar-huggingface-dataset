# Zaytron40k/freya-real-v2-krea2-lora

## Resumen

`freya-real-v2-krea2-lora` es un LoRA de personaje (character LoRA) para generación de imágenes texto-a-imagen, entrenado por el usuario Zaytron40k sobre el modelo base `krea/Krea-2-Raw`, un transformer de difusión (DiT) de 12.000 millones de parámetros. El adaptador permite reproducir de forma consistente un personaje concreto, activado mediante la frase disparadora `fr7ya woman`, y está pensado para inferencia sobre la variante destilada Krea 2 Turbo.

El modelo resuelve el problema clásico de consistencia de identidad en generación de imágenes: en lugar de describir el personaje en cada prompt, el LoRA inyecta en los pesos del modelo base el conocimiento visual del sujeto (rostro, proporciones, iluminación y estilo fotográfico realista), de modo que basta con anteponer el trigger para obtener variaciones coherentes del mismo personaje en ángulos, poses y vestuarios distintos.

Es relevante por su enfoque de entrenamiento: dataset construido con 50 fotogramas editados a 1k a partir de referencias nuevas, captions en prosa natural, rank 24 y 1.200 pasos totales, con checkpoints intermedios publicados. El repositorio ocupa 2,1 GB y no declara licencia ni idiomas soportados, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un DiT (diffusion transformer) de Krea 2; adaptador de bajo rango con `networks.lora_krea2` de Musubi Tuner |
| Parametros totales | No disponible para el LoRA; el modelo base Krea-2-Raw es un DiT de 12B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen; resolución de entrenamiento en buckets de 1024) |
| Tipos de cuantizacion | No disponible; el LoRA se entrenó en bf16 |
| Idiomas soportados | No disponible (los captions del dataset están en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (modelo base `raw.safetensors`; repo de 2,1 GB) |

Parámetros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Rango / dimensión LoRA | 24 / 24 (alpha 24) |
| Optimizador | adamw8bit, learning rate 1e-4 |
| Precisión de entrenamiento | bf16, SDPA |
| Timestep sampling | krea2_shift, weighting_scheme none |
| Épocas / pasos | 12 épocas = 1.200 pasos, guardado cada 2 épocas, seed 42 |
| Trigger | `fr7ya woman` |
| Modelo base | krea/Krea-2-Raw (inferencia recomendada sobre Krea 2 Turbo) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Krea-2-Raw, un transformer de difusión de 12B parámetros que sigue el paradigma de flow matching empleado en los modelos de imagen modernos. El adaptador se entrena con Musubi Tuner mediante el módulo `networks.lora_krea2`, con rango y dimensión 24 y alpha 24, lo que supone una capacidad de adaptación moderada: suficiente para fijar la identidad de un personaje sin sobrescribir en exceso el estilo del modelo base.

El dataset de la versión 2 está compuesto por 50 fotogramas de resolución 1k generados con `gpt-image-2.6-flare edit` a partir de referencias nuevas del personaje (con hombros más estrechos), seleccionados manualmente para cubrir ángulos variados (frontal, tres cuartos, perfil, espalda, picado y contrapicado), mayoritariamente primeros planos y planos medios, selfies de espejo, poses, iluminaciones y expresiones variadas, con ropa diversa. Los captions están redactados en prosa natural y describen prendas, joyería y transparencias cuando aparecen. Se usaron buckets de 1024, batch 1 y `num_repeats` 2. El entrenamiento se ejecutó sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para reducir consumo de memoria. El autor advierte que `avr_loss` es una media móvil casi plana en flow matching y que la selección del checkpoint debe hacerse visualmente.

## Capacidades

- Generación de imágenes realistas de un personaje concreto mediante el trigger `fr7ya woman`.
- Consistencia de identidad en ángulos diversos: frontal, tres cuartos, perfil, espalda, picado y contrapicado.
- Variación de encuadre: primeros planos, planos medios y selfies de espejo.
- Control de vestuario, joyería y detalles de apariencia mediante captions en prosa natural.
- Control de iluminación y de expresiones faciales (poses y emociones "flirty" según el dataset).
- Composición con otros LoRAs: el autor recomienda apilarlo sobre el LoRA de estilo de la casa.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo: es exclusivamente un adaptador de imagen.
- Capacidades multilingües: no disponibles; los captions de entrenamiento están en inglés.

## Casos de uso

- Creación de personajes consistentes para narrativa visual: usar `fr7ya woman` junto con descripciones de escena para generar un elenco coherente a lo largo de varias ilustraciones, aprovechando la variedad de ángulos del dataset.
- Prototipado de storyboards y cómics: generar viñetas del mismo personaje en planos medios y primeros planos con continuidad de identidad, útil para previsualizar guiones antes de producción.
- Fotografía sintética de moda: combinar el trigger con captions de prendas para obtener pruebas de vestuario y catálogos ficticios sobre un sujeto fijo.
- Avatares y retratos para entornos virtuales: producir retratos con iluminación y pose controladas a partir de la misma identidad base.
- Iteración de diseño de personaje: comparar los checkpoints intermedios (`-000002` a `-000010` y final) para ajustar el grado de fidelidad frente a la flexibilidad creativa.
- Integración en pipelines de generación con Krea 2 Turbo: apilar el LoRA sobre el modelo destilado para obtener inferencia rápida en flujos de trabajo de Musubi Tuner o ComfyUI.
- Experimentación en investigación sobre LoRAs de personaje: el repositorio publica hiperparámetros, pérdidas por checkpoint y composición del dataset, lo que facilita reproducir o comparar metodologías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la pérdida media móvil por checkpoint:

| Checkpoint | Época | avr_loss |
|---|---|---|
| `-000002` | 2 | 0.0599 |
| `-000004` | 4 | 0.0603 |
| `-000006` | 6 | 0.0571 |
| `-000008` | 8 | 0.0535 |
| `-000010` | 10 | 0.0587 |
| final | 12 | 0.0559 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Krea-2-Raw (12B) y de la cuantización empleada. El adaptador en sí es ligero (repo de 2,1 GB), pero el DiT base requiere memoria considerable.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, se orienta a GPUs de datacenter (A100, H100) o a GPUs de consumo de gama alta con cuantización.
- ¿Cabe en GPU de consumo? No confirmado. El entrenamiento se realizó sin gradient checkpointing y con `expandable_segments`, lo que sugiere un ajuste agresivo de memoria, pero no se especifica la GPU usada.
- Opciones de despliegue: Musubi Tuner (entrenador e inferencia), y por tratarse de un LoRA en safetensors, potencialmente ComfyUI u otros runners compatibles con Krea 2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, se compara con el propio modelo base:

| Modelo | Tipo | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| freya-real-v2-krea2-lora | LoRA de personaje sobre DiT | No disponible (base 12B) | Buckets 1024 | No disponible | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | DiT texto-a-imagen | 12B | No disponible | No disponible | Hugging Face (modelo base) |
| Krea 2 Turbo | DiT destilado para inferencia | No disponible | No disponible | No disponible | Uso recomendado para inferencia |

## Limitaciones y advertencias

- Sesgos conocidos: el dataset está compuesto por imágenes sintéticas generadas con otra herramienta y seleccionadas a mano, lo que puede introducir un sesgo de estilo y de composición (mayoría de primeros planos y planos medios, expresiones "flirty").
- Riesgo de alucinación: como todo modelo generativo de imagen, puede producir anatomía, manos o detalles de vestuario incorrectos; el LoRA no corrige estos fallos del modelo base.
- Limitaciones de contexto o idioma: los captions de entrenamiento están en inglés; no se declaran idiomas soportados. El trigger debe escribirse exactamente como `fr7ya woman`.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar el uso comercial; además, el modelo base Krea-2-Raw tiene sus propias condiciones que hay que respetar.
- Caveat de producción: el autor recomienda inferencia sobre Krea 2 Turbo y apilar el LoRA sobre el LoRA de estilo de la casa; usarlo sobre Krea-2-Raw o sin ese apilamiento puede dar resultados distintos a los esperados.
- Selección de checkpoint: la pérdida es casi plana, por lo que elegir el checkpoint final por loss no es fiable; hay que evaluar visualmente.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día; sin validación comunitaria ni demos publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/Zaytron40k/freya-real-v2-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (entrenador citado): no se proporciona enlace en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
