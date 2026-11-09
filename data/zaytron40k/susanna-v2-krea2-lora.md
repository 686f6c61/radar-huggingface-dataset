# Zaytron40k/susanna-v2-krea2-lora

## Resumen

susanna-v2-krea2-lora es un LoRA de personaje (character LoRA) para el modelo de difusión de imágenes Krea 2, desarrollado por el usuario Zaytron40k. Se entrenó sobre el checkpoint RAW de Krea 2 (un transformer de difusión de 12B parámetros) y está pensado para usarse en inferencia sobre Krea 2 Turbo. Su función es fijar la identidad visual de un personaje concreto mediante una palabra de activación (`s7zan woman`), de modo que el modelo genere variaciones consistentes de ese personaje en distintas poses, vestimentas y expresiones.

El adaptador es pequeño (repo de 2,1 GB) y emplea un rango/dim de 24 con alpha 24, lo que lo sitúa en la categoría de LoRAs ligeros que se apilan sobre el modelo base sin reentrenarlo. El entrenamiento se realizó con Musubi Tuner, el toolkit habitual para fine-tuning de modelos de difusión en formato DiT, y el dataset es deliberadamente pequeño y curado: 66 imágenes sintéticas de 2k generadas con Seedream-v5-flash.

Es relevante ahora porque ilustra el flujo de trabajo típico de la comunidad de generación de imágenes: LoRAs de personaje sobre modelos base de gran tamaño, con datasets sintéticos y captions en prosa natural, para producir contenido consistente sin disponer de grandes recursos de cómputo. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y no declara licencia, lo que limita su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (DiT) Krea 2; adaptador con `networks.lora_krea2` de Musubi Tuner |
| Parámetros totales | No disponible para el LoRA; el modelo base Krea-2-Raw tiene 12B parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo text-to-image); no disponible |
| Tipos de cuantización | No disponible (entrenado en bf16; el repo pesa 2,1 GB) |
| Idiomas soportados | No disponible (los prompts de entrenamiento están en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (implícito por el uso de Musubi Tuner y `raw.safetensors` del base) |

## Arquitectura y entrenamiento

El LoRA se aplica sobre Krea-2-Raw, un transformer de difusión (DiT) de 12B parámetros. El adaptador tiene rango/dim 24 y alpha 24, entrenado en bf16 con SDPA y optimizador adamw8bit con learning rate 1e-4. El muestreo de timesteps usa `krea2_shift` con `weighting_scheme none`, una configuración propia del pipeline de Krea 2 en Musubi Tuner. El entrenamiento se ejecutó sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, en lo que el autor denomina "econ run", es decir, una ejecución de bajo consumo de memoria.

El dataset consta de 66 imágenes de 2k generadas con Seedream-v5-flash: 32 retratos, 26 planos medios, 2 cuerpos completos y 6 con hábito de monja. Las captions están en prosa natural e incluyen descripciones explícitas del vestuario (por ejemplo, el hábito negro con velo de banda blanca, cuello blanco y cruz dorada). Se usaron buckets de 1024, batch 1 y `num_repeats 2`, con un total de 12 épocas (1584 pasos), guardando checkpoint cada 2 épocas y semilla 42. El autor advierte que `avr_loss` es una media móvil casi plana en flow-matching, por lo que la selección de checkpoint debe hacerse visualmente: los valores van de 0,0494 en la época 2 a 0,0398 en la época 12.

## Capacidades

- Generación text-to-image de un personaje consistente mediante el trigger `s7zan woman`.
- Control de vestuario, pose y expresión a través del prompt (el dataset incluye ropa variada y expresiones "flirty/seductive").
- Composición de escena con fondos de color hex plano, útil para integración posterior.
- Apilamiento con otros LoRAs: el autor recomienda combinarlo con el LoRA de estilo "house style" de Krea 2.
- Inferencia sobre Krea 2 Turbo (el modelo base RAW se usa solo para entrenamiento).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada; es exclusivamente generación de imágenes a partir de texto.

## Casos de uso

- Creación de personajes consistentes para cómic o novela gráfica: el LoRA fija la identidad del personaje y permite generar viñetas en distintas poses y escenarios manteniendo el rostro y el estilo, gracias al trigger y al dataset curado de retratos y planos medios.
- Previsualización de vestuario en diseño de moda: al haber sido entrenado con ropa variada (incluido el vestido halter negro de referencia), permite generar al personaje con distintas prendas para explorar combinaciones antes de producir físicamente.
- Generación de avatares y assets para videojuegos: los fondos de color hex plano del dataset facilitan el recorte y la integración del personaje en motores o interfaces.
- Contenido para redes sociales o ficción serializada: la consistencia del personaje permite publicar ilustraciones recurrentes sin perder la identidad visual entre publicaciones.
- Prototipado rápido de personajes en estudios pequeños: al ser un LoRA ligero (2,1 GB) sobre un base de 12B, se puede iterar con menos recursos que un fine-tuning completo.
- Pruebas de concepto de pipelines de difusión: sirve como ejemplo de entrenamiento con Musubi Tuner y de apilamiento de LoRAs sobre Krea 2 Turbo para equipos que quieran replicar el flujo.
- Ilustración de escenas con hábito religioso o temática específica: el dataset incluye seis imágenes con hábito de monja descrito en las captions, lo que permite generar ese vestuario concreto con fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida media por checkpoint (avr_loss entre 0,0494 y 0,0398), que el propio autor califica de poco informativa para flow-matching.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Krea 2 Turbo (12B parámetros en el caso del RAW) y de la cuantización empleada.
- GPU recomendadas: no disponible. El autor menciona una "econ run" sin gradient checkpointing, lo que sugiere que el entrenamiento cupo en una GPU de consumo o de gama media-alta, pero no especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible con certeza; el tamaño del LoRA (2,1 GB) es pequeño, pero el modelo base de 12B condiciona los requisitos.
- Opciones de despliegue: Musubi Tuner (entrenamiento e inferencia), junto con el pipeline de Krea 2 Turbo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros LoRAs de personaje comparables ni métricas de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia de Krea-2-Raw antes de usarlo en producción.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa de calidad.
- Dataset sintético y muy pequeño (66 imágenes generadas con Seedream-v5-flash): puede heredar sesgos y artefactos del generador utilizado, y la diversidad de poses y escenarios es limitada.
- Riesgo de sobreajuste al estilo del dataset (fondos hex planos, expresiones concretas) y de dificultad para generalizar a escenas complejas.
- El trigger `s7zan woman` es obligatorio; sin él, el LoRA puede no activarse o degradar la generación.
- Entrenado para inferencia sobre Krea 2 Turbo, no sobre el RAW; usarlo con otro checkpoint puede dar resultados inconsistentes.
- Contenido potencialmente sensible: el dataset incluye expresiones "flirty/seductive" y vestuario específico; conviene revisar las políticas de contenido de la plataforma de destino.
- No hay información sobre idiomas de los prompts; las captions están en inglés, por lo que prompts en castellano podrían funcionar peor.
- La pérdida reportada es casi plana, lo que dificulta la selección objetiva de checkpoint; el autor recomienda evaluación visual.

## Enlaces

- Hugging Face: https://huggingface.co/Zaytron40k/susanna-v2-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (herramienta de entrenamiento): no se proporciona enlace en la información disponible.
