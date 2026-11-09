# Zaytron40k/mali-krea2-lora

## Resumen

mali-krea2-lora es un LoRA de personaje (character LoRA) para el modelo de generación de imágenes Krea 2, desarrollado por el usuario Zaytron40k y publicado en Hugging Face. Entrena un sujeto concreto, activado mediante la cadena de activación `m4li woman`, sobre el checkpoint base `krea/Krea-2-Raw`, un transformer de difusión (DiT) de 12B parámetros. El adaptador se entrena con Musubi Tuner y está pensado para inferencia sobre Krea 2 Turbo, no sobre el modelo RAW con el que se entrenó.

El modelo resuelve un problema acotado y muy específico: la consistencia de identidad de un personaje concreto a través de generaciones text-to-image. No es un modelo generalista ni un checkpoint completo, sino un adaptador de bajo rango (rank 24) que debe apilarse sobre el modelo base y, según el autor, preferiblemente sobre un LoRA de estilo ("house style LoRA"). Su relevancia es, por tanto, la de un artefacto de personalización: útil para quien quiera reproducir ese personaje concreto dentro del ecosistema Krea 2.

La información pública es escasa: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia ni idiomas soportados, y no incluye resultados de benchmarks ni ejemplos de inferencia más allá de las instrucciones de uso. El tamaño del repositorio es de 2,1 GB, coherente con un adaptador de rango 24 en bf16 más los ficheros auxiliares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión (DiT) Krea 2; trainer `networks.lora_krea2` de Musubi Tuner |
| Parámetros totales | No disponible (el modelo base Krea-2-Raw es de 12B; el adaptador LoRA no declara recuento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantización | No disponible; entrenado en bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (implícito por el ecosistema Musubi Tuner y el fichero `raw.safetensors` del base); no confirmado explícitamente |
| Rank / dim del LoRA | 24 |
| Alpha del LoRA | 24 |
| Modelo base | krea/Krea-2-Raw (`raw.safetensors`, 12B DiT) |
| Modelo de inferencia recomendado | Krea 2 Turbo |
| Trigger | `m4li woman` |
| Precisión de entrenamiento | bf16, SDPA |
| Optimizador | adamw8bit, lr 1e-4 |
| Pasos de entrenamiento | 1296 (12 epochs) |
| Tamaño del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Krea-2-Raw, un transformer de difusión de 12B parámetros, mediante la implementación `networks.lora_krea2` de Musubi Tuner. Se trata de un LoRA de rango 24 con alpha 24, entrenado en bf16 con atención SDPA, optimizador adamw8bit y learning rate 1e-4. El muestreo de timesteps usa `krea2_shift` con `weighting_scheme none`, lo que implica que no se aplica una ponderación de pérdida por timestep y que la pérdida reportada (flow-matching) es poco informativa para seleccionar checkpoint.

El dataset consta de 54 imágenes de 2k generadas con Seedream-v5-flash: 27 retratos, 25 planos medios y 2 de cuerpo completo. Incluye un "chat set" con expresiones coquetas o seductoras; 18 filas conservan el atuendo propio del personaje (camisa de satén roja con escote en V profundo, minifalda de cuero negro con cinturón y cadena dorada) y el resto varía la ropa. Los fondos son colores hex planos y las captions están en prosa natural. Las gafas redondas doradas y las joyas doradas aparecen en todas las imágenes y están "horneadas" en el trigger, no descritas en las captions. Se usaron buckets de 1024, `num_repeats` 2, batch 1 y semilla 42. El entrenamiento se ejecutó sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para ahorrar memoria.

La pérdida media por checkpoint es prácticamente plana (0,0485 en la epoch 2; 0,0401 en la final), algo esperable en flow-matching; el propio autor recomienda elegir el checkpoint por inspección visual, no por pérdida.

## Capacidades

- Generación text-to-image condicionada por prompt, con un sujeto concreto activado por la cadena `m4li woman`.
- Consistencia de identidad del personaje a través de distintas poses y planos (retrato, plano medio, cuerpo completo), según la composición del dataset.
- Reproducción de atributos fijados en el trigger: gafas redondas doradas y joyería dorada, incorporadas implícitamente al activar el personaje.
- Variación de vestuario: el adaptador se entrenó con 18 filas con el atuendo original y el resto con ropa variada, por lo que debería permitir cambiar la ropa mediante prompt.
- Expresiones faciales del conjunto "chat" (coquetas/seductivas), aprendidas del dataset.
- Compatibilidad con apilamiento de LoRAs: el autor recomienda combinarlo con un LoRA de estilo.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-step, visión, audio ni multilingüismo; es un adaptador puramente generativo de imagen.

## Casos de uso

- Ilustración de personaje consistente para cómic o novela: usar `m4li woman` junto con descripciones de escena para generar viñetas con la misma identidad en distintos planos, apoyándose en el entrenamiento con retratos, planos medios y cuerpo completo.
- Prototipado de personajes para videojuego o narrativa interactiva: generar hojas de personaje con variaciones de vestuario (el dataset incluye ropa variada) y expresiones del conjunto "chat".
- Pruebas de concepto de estilización: apilar el LoRA sobre un LoRA de estilo ("house style LoRA") para evaluar cómo se mantiene la identidad del sujeto bajo distintas estéticas, tal como recomienda el autor.
- Generación de material promocional o editorial ficticio: retratos y planos medios con fondos de color plano, útiles para composición posterior o recorte.
- Investigación sobre personalización en modelos de difusión: el repositorio documenta hiperparámetros completos (rank, alpha, lr, schedule, dataset), lo que lo hace útil como referencia reproducible de un entrenamiento LoRA sobre Krea 2.
- Evaluación comparativa de checkpoints: la tabla de pérdidas y el consejo de selección visual permiten estudiar la relación entre pérdida de flow-matching y calidad percibida en adaptadores de personaje.
- Integración en pipelines de generación por lotes: al ser un adaptador ligero (repo de 2,1 GB) sobre Krea 2 Turbo, puede cargarse y descargarse en memoria para alternar entre personajes en un mismo servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida media por checkpoint, que no es una métrica de calidad:

| Checkpoint | Epoch | avr_loss |
|---|---|---|
| `-000002` | 2 | 0,0485 |
| `-000004` | 4 | 0,0458 |
| `-000006` | 6 | 0,0417 |
| `-000008` | 8 | 0,0430 |
| `-000010` | 10 | 0,0427 |
| final | 12 | 0,0401 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Depende del modelo base Krea 2 Turbo (12B DiT en el caso de RAW) y de la cuantización empleada; el adaptador LoRA añade una sobrecarga pequeña respecto al base.
- GPU recomendadas: no disponibles. El entrenamiento se hizo en bf16 con SDPA y sin gradient checkpointing, lo que sugiere el uso de una GPU con memoria amplia (gama profesional), pero el autor no especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible. Con un base de 12B, la viabilidad en GPU de consumo depende fuertemente de la cuantización y del backend; no hay datos publicados para este adaptador.
- Opciones de despliegue: Musubi Tuner para entrenamiento e inferencia según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión de imagen en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRAs de personaje para Krea 2 ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, este adaptador se distingue por: rank 24, alpha 24, 54 imágenes de entrenamiento, 1296 pasos y un trigger de tres tokens; pero no hay cifras de calidad comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El dataset está generado sintéticamente con Seedream-v5-flash y se centra en un único personaje femenino; puede heredar sesgos estéticos y de representación del generador de datos.
- Riesgo de alucinación: en difusión se traduce en artefactos, deriva de identidad o incapacidad de reproducir el personaje fuera de las condiciones del dataset (planos, iluminación, fondos planos).
- Limitaciones de contexto o idioma: no se declaran idiomas soportados; las captions están en prosa natural, presumiblemente en inglés, y no se especifica el comportamiento con prompts en otros idiomas.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial. Además, el modelo base Krea-2-Raw tiene su propia licencia, que condiciona el uso del adaptador.
- Caveat de producción: el adaptador se entrena sobre Krea 2 RAW pero se recomienda para inferencia sobre Krea 2 Turbo; usar el checkpoint equivocado puede degradar el resultado. La pérdida es plana y no sirve para elegir checkpoint; hay que validar visualmente.
- Atributos fijados: las gafas y la joyería doradas están "horneadas" en el trigger y no descritas en las captions, lo que dificulta eliminarlas o modificarlas mediante prompt.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni ejemplos publicados.
- Contenido: el conjunto "chat" incluye expresiones coquetas/seductivas; conviene revisar la adecuación del output según el contexto de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaytron40k/mali-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (trainer utilizado): no disponible en la información proporcionada
- Paper, blog o demo oficial: no disponible en la información proporcionada
