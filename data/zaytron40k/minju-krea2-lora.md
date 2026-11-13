# Zaytron40k/minju-krea2-lora

## Resumen

minju-krea2-lora es un LoRA de personaje entrenado sobre Krea 2 Raw, un modelo de difusion de texto a imagen de 12B parametros con arquitectura DiT (Diffusion Transformer). Lo desarrolla el usuario Zaytron40k y su proposito es fijar la identidad visual de un personaje concreto, activado mediante el trigger `m1nju woman`, para generar imagenes coherentes de ese personaje en distintos contextos de vestuario y expresion. El entrenamiento se ha realizado con Musubi Tuner y el modulo `networks.lora_krea2`, con rango y alpha de 24, sobre un dataset de 46 imagenes de 2K generadas con Seedream-v5.5.

El modelo es relevante en el ecosistema de generacion de imagen porque demuestra el flujo habitual de personalizacion sobre un modelo base de gran tamano: se entrena sobre la version Raw (no destilada) y se recomienda inferir sobre la version Turbo, lo que permite combinar la fidelidad del entrenamiento con la velocidad de muestreo reducido. Al ser un LoRA de rango moderado (24) y 2,1 GB de repositorio, es un adaptador ligero que se apila sobre el modelo base sin reentrenar los 12B parametros.

La informacion publicada es limitada: no hay datos de benchmarks, licencia explicita ni idiomas declarados. La model card se centra en la receta de entrenamiento, la curva de perdida por checkpoint y las instrucciones de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Diffusion Transformer (DiT) de Krea 2 Raw |
| Parametros totales | no disponible (modelo base: 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 2,1 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 24 y alpha 24 aplicado sobre Krea 2 Raw, un DiT de 12B parametros. El entrenamiento se hizo con Musubi Tuner usando el modulo `networks.lora_krea2`, optimizador adamw8bit con learning rate 1e-4, precision bf16 y atencion SDPA. El muestreo de timesteps emplea `krea2_shift` con `weighting_scheme none`, coherente con el paradigma de flow matching propio de los modelos de difusion modernos. Se ejecuto sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, lo que indica un entrenamiento ajustado en memoria.

El dataset consta de 46 imagenes de 2K generadas con Seedream-v5.5, con captions en prosa natural y joyas descritas cuando aparecen. Cuatro filas muestran el atuendo canonico del personaje (referencia de intensidad media) y el resto vestuario variado, con fondos de color hexadecimal plano. Se configuraron batch 1, buckets de 1024 y `num_repeats 2`, con una programacion de 12 epocas (1104 pasos), guardado cada 2 epocas y semilla 42. La perdida media por checkpoint es practicamente plana (entre 0,0388 y 0,0476), algo esperable en flow matching, por lo que el autor recomienda elegir el checkpoint por inspeccion visual y no por `avr_loss`.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por el trigger `m1nju woman`.
- Fijacion de identidad de personaje con coherencia entre distintas prendas y expresiones.
- Reproduccion de expresiones del set de chat (flirty/seductive) presentes en el dataset.
- Control de vestuario variable gracias a la diversidad del dataset de entrenamiento.
- Fondos de color plano, utiles para composicion posterior o recorte.
- Apilamiento con un LoRA de estilo de la casa, segun recomienda el autor.
- Inferencia sobre Krea 2 Turbo (el entrenamiento se hizo sobre Raw).
- No se documentan capacidades de tool calling, agentes, vision ni audio (no aplica a un modelo de imagen).

## Casos de uso

- Generacion de retratos de personaje consistentes: usar `m1nju woman` como prefijo del prompt para obtener la misma identidad en distintas poses y encuadres, aprovechando el entrenamiento sobre 46 frames de 2K.
- Ilustracion de narrativa serializada: producir paneles de un personaje recurrente en un comic o webtoon manteniendo el rostro y el atuendo canonico en las escenas clave (las 4 filas de referencia).
- Prototipado de moda o vestuario: variar prendas alrededor de una identidad fija para explorar combinaciones sin perder el parecido del personaje.
- Assets para produccion grafica: generar figuras sobre fondo de color plano para facilitar el recorte y la composicion en herramientas de diseno.
- Pruebas de pipeline de difusion: usar el LoRA como caso de estudio de apilamiento sobre Krea 2 Turbo para medir calidad frente a velocidad en flujos de trabajo con Musubi Tuner.
- Generacion de material de referencia para artistas: obtener hojas de expresion (incluidas las expresivas del set de chat) como base para model sheets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida media por checkpoint (`avr_loss` entre 0,0388 y 0,0476), que el propio autor advierte que es practicamente plana y no sirve para seleccionar checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 (12B) y de la precision de carga, no del LoRA (2,1 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Musubi Tuner (entrenador e inferencia citados en la model card); no se documentan vLLM, llama.cpp, Ollama ni TGI porque no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el dataset procede de imagenes sinteticas de Seedream-v5.5, lo que puede arrastrar sesgos esteticos del generador original.
- Riesgo de sobreajuste al dataset: 46 imagenes y 12 epocas con `num_repeats 2` pueden limitar la generalizacion a poses o iluminaciones fuera de distribucion.
- El trigger `m1nju woman` es obligatorio para activar el personaje; sin el, el LoRA puede no tener efecto o introducir artefactos.
- La perdida plana impide seleccionar checkpoint de forma objetiva; hay que validar visualmente cada guardado.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base; conviene verificar la licencia de krea/Krea-2-Raw antes de producción.
- Idiomas no declarados: los captions estan en prosa natural (presumiblemente ingles, no confirmado), lo que puede afectar a prompts en otros idiomas.
- Entrenado sobre Raw pero pensado para Turbo: usar el checkpoint equivocado del modelo base puede degradar la calidad.
- No hay garantia de coherencia de identidad fuera de los encuadres y estilos del dataset (fondos planos, retratos).

## Enlaces

- Hugging Face: https://huggingface.co/Zaytron40k/minju-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (entrenador citado): no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
