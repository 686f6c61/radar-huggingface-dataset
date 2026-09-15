# Zaytron40k/millie-v3-krea2-lora

## Resumen

millie-v3-krea2-lora es un adaptador LoRA de personaje para generación de imágenes texto-a-imagen, publicado por el usuario Zaytron40k en HuggingFace. Se entrena sobre krea/Krea-2-Raw, un Diffusion Transformer (DiT) de 12B parámetros sin destilar, y está diseñado para inferencia sobre krea/Krea-2-Turbo, la variante destilada a 8 pasos. Su función es fijar una identidad visual concreta (una joven mujer en estilo de animación occidental) mediante la palabra disparadora `woman`.

El adaptador usa rango/dim 24 con alpha 24 y se aplica a todas las capas Linear del DiT. Se entrenó con Musubi Tuner durante 12 épocas (1464 pasos) sobre un dataset de 61 imágenes PNG sintéticas generadas con gpt-image-2.5 con captions en lenguaje natural, en una única NVIDIA H100 de 80GB. El repositorio ocupa 2,1 GB e incluye seis checkpoints intermedios.

Su relevancia es acotada y muy específica: se trata de un LoRA de personaje con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Es útil como ejemplo documentado de flujo RAW-train / Turbo-infer con Musubi Tuner, pero no como componente de producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre DiT de difusión (Krea-2-Raw, 12B), con VAE de Qwen-Image y text encoder Qwen3-VL-4B |
| Parametros totales | No disponible para el adaptador (rank 24, alpha 24, aplicado a todas las capas Linear del DiT); el modelo base es un DiT de 12B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de imagen; entrenamiento con buckets multirresolución a 1024, inferencia documentada a 1024x1280) |
| Tipos de cuantizacion | No se documentan cuantizaciones del adaptador; el entrenamiento se realizó en bf16 |
| Idiomas soportados | No disponible (los captions y prompts de ejemplo están en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (checkpoints de LoRA `.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Krea-2-Raw, un Diffusion Transformer de 12B parámetros en estado no destilado ("raw.safetensors"), y utiliza como componentes auxiliares el VAE de Qwen-Image (`qwen_image_vae.safetensors`) y el text encoder Qwen3-VL-4B (`qwen3vl_4b_bf16.safetensors`). El LoRA se inyecta en todas las capas Linear del DiT con rango/dim 24 y alpha 24, y el entrenamiento se realizó con Musubi Tuner de kohya-ss mediante el módulo `networks.lora_krea2`. La optimización usó adamw8bit con learning rate 1e-4, precisión bf16, gradient checkpointing y atención SDPA, con muestreo de timesteps `krea2_shift` (consciente de la resolución) y `weighting_scheme` desactivado.

El dataset consta de 61 imágenes PNG sintéticas generadas con gpt-image-2.5 (retratos y planos medios en estilo de animación occidental, referenciadas internamente como "Stepsis Summer #558, v3") con captions en lenguaje natural que describen ropa, pose, expresión, encuadre y fondo. Se usaron buckets multirresolución a 1024, batch 1 y `num_repeats` 2, con 12 épocas hasta 1464 pasos, guardado cada 2 épocas y semilla 42, sobre 1x NVIDIA H100 80GB. No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias. La innovación técnica reseñable es el esquema RAW-train / Turbo-infer: se entrena sobre el modelo sin destilar y se infiere sobre la variante destilada a 8 pasos con `guidance_scale 1` y `mu 1.15`.

La pérdida de flow-matching es casi plana, por lo que el propio autor advierte de que `avr_loss` sirve solo como comprobación de sanidad y que la elección del checkpoint debe hacerse visualmente:

| Checkpoint | Época | Paso | avr_loss |
|---|---|---|---|
| `-000002` | 2 | 244 | 0.0585 |
| `-000004` | 4 | 488 | 0.0547 |
| `-000006` | 6 | 732 | 0.0524 |
| `-000008` | 8 | 976 | 0.0537 |
| `-000010` | 10 | 1220 | 0.0518 |
| final | 12 | 1464 | 0.0490 |

Mínimo `avr_loss` 0.0474; final 0.0490.

## Capacidades

- Generación de imágenes texto-a-imagen de un personaje concreto (identidad aprendida del dataset, sin token dedicado más allá de la palabra de clase `woman`).
- Composición de planos de retrato (de pecho hacia arriba) y plano medio, según los ejemplos del dataset.
- Control mediante prompt en lenguaje natural de ropa, pose, expresión, encuadre y fondo.
- Compatible con apilado de LoRAs: el autor recomienda superponerlo sobre el LoRA de estilo de la casa.
- Inferencia en 8 pasos sobre Krea-2-Turbo destilado, con `guidance_scale 1`.
- Entrenado con buckets multirresolución a 1024; inferencia documentada a 1024x1280.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No está documentado como agente ni con razonamiento multi-paso.
- No hay capacidades multilingües documentadas ni capacidades de vídeo, audio o visión.

## Casos de uso

- Diseño de personaje consistente para novela visual o webtoon: el LoRA permite repetir la misma identidad en decenas de viñetas variando solo pose, ropa y fondo en el prompt, sin perder el rostro entre iteraciones.
- Storyboard y previsualización de animación: generar planos de retrato y plano medio en estilo de animación occidental para validar encuadres antes de producción, ajustando expresión y vestuario desde el prompt.
- Assets de personaje para videojuego indie: retratos de NPC o de protagonista con variaciones de vestuario mediante el disparador `woman` más descripciones de ropa en el prompt.
- Ilustración editorial o portadas seriadas: mantener una figura recurrente en una campaña de ilustraciones cambiando fondo y encuadre, apilando el LoRA sobre un LoRA de estilo para homogeneizar la paleta.
- Validación de pipelines de difusión: caso de uso técnico para comparar el rendimiento de un LoRA entrenado en RAW e inferido en Turbo, midiendo la degradación de calidad a 8 pasos frente al modelo sin destilar.
- Pruebas de integración con Musubi Tuner: servir de referencia reproducible (script `krea2_generate_image.py`, parámetros de muestreo y `lora_multiplier`) para montar un entorno propio de generación con Krea-2.
- Investigación sobre adaptadores de bajo rango en DiT: estudiar cómo un rank 24 aplicado a todas las capas Linear de un DiT de 12B captura identidad con solo 61 imágenes de entrenamiento.
- Prototipado de contenido para redes sociales con personaje fijo: producción de una serie de imágenes coherentes entre sí, siempre que se resuelva previamente la ambigüedad de licencia y la naturaleza sugerente del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye la pérdida de entrenamiento (`avr_loss`) por checkpoint mostrada en la sección de arquitectura y entrenamiento, que no constituye una métrica de calidad de generación ni permite comparación con otros modelos.

## Requisitos de hardware

- Entrenamiento documentado: 1x NVIDIA H100 80GB (RunPod, región EU-NL-1), con bf16, gradient checkpointing y SDPA.
- Inferencia, estimación a partir del tamaño del modelo base: un DiT de 12B en bf16 ocupa aproximadamente 24 GB de pesos, más el text encoder Qwen3-VL-4B (aproximadamente 8 GB en bf16) y el VAE de Qwen-Image; el conjunto apunta a un mínimo del orden de 32-40 GB de VRAM sin optimizaciones agresivas. Estimación orientativa, no confirmada por el autor.
- GPU de datacenter recomendadas para replicar el flujo: H100 80GB, A100 80GB. En GPUs de 24 GB (RTX 3090, RTX 4090) no hay constancia de que el pipeline completo quepa sin cuantización u offload, dado el tamaño del DiT y del text encoder.
- Consumer GPU: no documentado. Se requeriría cuantización del DiT y del text encoder u offloading a CPU/VRAM por etapas, con impacto en latencia.
- Opciones de despliegue documentadas: Musubi Tuner (kohya-ss) mediante `src/musubi_tuner/krea2_generate_image.py`, con `--attn_mode torch`, `--steps 8`, `--guidance_scale 1`, `--mu 1.15` y `--lora_multiplier 1.0`.
- Otras opciones de despliegue (vLLM, TGI, Ollama, llama.cpp, ComfyUI, Diffusers): no disponibles; no están documentadas para este adaptador ni para Krea-2 en la información proporcionada.
- Latencia y throughput: no disponibles. No se aportan tiempos por imagen ni mediciones de rendimiento.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables con datos públicos que permitan una comparación cuantitativa. La búsqueda web asociada no devolvió resultados relacionados con el modelo. La siguiente tabla recoge únicamente los datos confirmados y marca como no disponible todo lo que no está documentado:

| Modelo | Categoría | Parámetros | Resolución / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| millie-v3-krea2-lora | LoRA de personaje sobre DiT de 12B (Krea-2-Raw) | rank 24 / alpha 24; base de 12B | Entrenamiento a 1024 con buckets multirresolución; inferencia a 1024x1280 | No disponible | HuggingFace, 0 descargas y 0 likes en la fecha de consulta |
| Otros LoRA de personaje para Krea-2 | LoRA de personaje sobre el mismo DiT | No disponible | No disponible | No disponible | No disponible |
| LoRA de personaje para familias tipo SDXL o Flux | LoRA de personaje sobre DiT/UNet de otra familia | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, por lo que el uso comercial es jurídicamente incierto y requiere contactar con el autor.
- Dataset de origen sintético y muy reducido: 61 imágenes generadas con gpt-image-2.5, lo que limita la variedad de poses, iluminaciones y fondos y puede provocar sobreajuste a la estética y al encuadre del conjunto de entrenamiento.
- Sesgo estilístico y demográfico: el dataset se describe como "animación occidental" con un único sujeto joven, por lo que la diversidad de edad, etnia y complexión es prácticamente nula.
- Contenido potencialmente sugerente: la model card describe las imágenes como "seductive portrait+medium" y hace referencia a material de origen dudoso ("Stepsis Summer #558"). Existe riesgo real de generar representaciones sugestivas de personas jóvenes, lo que exige moderación explícita y revisión de cumplimiento antes de cualquier uso público.
- Disparador genérico: el trigger es la palabra de clase `woman`, no un token dedicado. Esto puede interferir con prompts genéricos y sobreactivar el personaje cuando no se desea.
- Sin métrica objetiva de calidad: la pérdida de flow-matching es casi plana (mínimo 0.0474 frente a 0.0490 final) y el propio autor indica que la selección del checkpoint debe hacerse de forma visual, lo que impide una validación automatizada.
- Desajuste entrenamiento/inferencia: el LoRA se entrena sobre Krea-2-Raw (no destilado) y se infiere sobre Krea-2-Turbo (8 pasos destilados), un esquema que puede degradar el parecido y el detalle en comparación con inferir sobre el modelo RAW.
- Dependencias externas estrictas: requiere emparejar el VAE de Qwen-Image y el text encoder Qwen3-VL-4B, además de la versión concreta del DiT; un desajuste de versiones invalida los resultados.
- Idiomas: no hay soporte multilingüe documentado; todos los captions y prompts de ejemplo están en inglés, por lo que se desconoce el comportamiento con prompts en castellano.
- Sin validación comunitaria: 0 descargas y 0 likes en la fecha de consulta, sin evaluaciones independientes ni informes de terceros.
- Riesgo de alucinación visual y artefactos propios del modelo base, no caracterizados por el autor.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Zaytron40k/millie-v3-krea2-lora
- Modelo base de entrenamiento (Krea-2-Raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo objetivo de inferencia (Krea-2-Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Musubi Tuner (kohya-ss), entrenador utilizado: https://github.com/kohya-ss/musubi-tuner
- Paper, blog o demo adicionales: no disponibles.
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre servicios de correo y buzón digital de La Poste) y no aportan información técnica aprovechable.
