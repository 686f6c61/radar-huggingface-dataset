# Zaytron40k/freya-real-krea2-lora

## Resumen

Freya-real-krea2-lora es un LoRA de personaje (character LoRA) para el modelo de difusion de texto a imagen Krea 2, desarrollado por el usuario Zaytron40k y publicado en Hugging Face. El adaptador se entrena sobre Krea-2-Raw, un modelo de difusion de tipo DiT (Diffusion Transformer) de 12B parametros, y esta pensado para su uso en inferencia sobre la variante Krea 2 Turbo. Su funcion es fijar la identidad visual de un personaje concreto, activado mediante la frase disparadora `fr7ya woman`, en imagenes de estilo fotografico realista tipo camara de movil.

El LoRA tiene rango y dimension 24 con alpha 24, se entreno con Musubi Tuner (modulo `networks.lora_krea2`), optimizador adamw8bit, learning rate 1e-4 y precision bf16. El dataset se compone de 43 imagenes editadas con gpt-image-2.6-flare que representan al personaje en angulos, encuadres, poses e iluminaciones variadas, con leyendas en prosa natural. El entrenamiento se completo en 12 epocas (1032 pasos) con guardado cada 2 epocas.

La relevancia de este adaptador es acotada: no es un modelo fundacional ni un modelo de lenguaje, sino un artefacto de personalizacion para un pipeline text-to-image concreto. Su interes practico reside en quien necesite reproducir de forma consistente un personaje concreto en Krea 2, con un coste de almacenamiento de 2,1 GB y sin necesidad de reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre DiT de 12B parametros (Krea-2-Raw) |
| Parametros totales | no disponible (el adaptador tiene rango/dim 24, alpha 24; el modelo base es de 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion text-to-image, no de lenguaje) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,1 GB; el base usa `raw.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 24 y alpha 24 aplicado sobre Krea-2-Raw, un Diffusion Transformer de 12B parametros. El entrenamiento se realizo con Musubi Tuner mediante el modulo `networks.lora_krea2`, en precision bf16 con atencion SDPA, optimizador adamw8bit y learning rate 1e-4. El muestreo de timesteps usa `krea2_shift` con `weighting_scheme none`. La ejecucion se hizo sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para gestionar la memoria.

El dataset consta de 43 imagenes editadas con gpt-image-2.6-flare que muestran al personaje en fotos realistas estilo camara de movil: angulos frontales, tres cuartos, laterales, traseros, desde arriba y desde abajo; encuadres de primer plano, plano medio y cuerpo entero; poses, iluminaciones y expresiones variadas. Las leyendas son en prosa natural y describen la ropa y las joyas cuando aparecen. Se uso batch 1, buckets de 1024, `num_repeats` 2 y semilla 42, con un total de 12 epocas (1032 pasos) y guardado cada 2 epocas. El autor advierte que `avr_loss` es una media movil casi plana en flow-matching y recomienda seleccionar el checkpoint de forma visual.

## Capacidades

- Generacion de imagenes fotorrealistas del personaje activado por la frase `fr7ya woman`, en estilo foto candidata de movil.
- Control de identidad consistente del personaje a traves de angulos, encuadres y poses variados.
- Composicion con ropa variable (incluida la equipacion deportiva propia del personaje) y con joyas cuando se describen.
- Integracion como adaptador sobre Krea 2 Turbo para inferencia, apilable sobre un LoRA de estilo de la casa.
- No dispone de capacidades de lenguaje, razonamiento, codigo, tool calling, agentes, vision de entrada ni audio: es exclusivamente un adaptador text-to-image.
- Capacidades multilingues: no documentadas; las leyendas de entrenamiento estan en ingles.

## Casos de uso

- Ilustracion de personaje consistente en proyectos narrativos: generar escenas del personaje en multiples angulos y planos para mantener continuidad visual entre capitulos o publicaciones, aprovechando el entrenamiento con encuadres variados.
- Prototipado de contenido para redes sociales: producir fotos estilo movil del personaje con expresiones y ropa distintas para calendarios editoriales, usando la frase disparadora y prompts descriptivos.
- Creacion de material de referencia para artistas: obtener vistas frontales, laterales y traseras del personaje como base para modelado 3D o ilustracion manual.
- Pruebas de concepto de estilo fotografico: apilar el LoRA sobre un LoRA de estilo de la casa para evaluar combinaciones de identidad y estetica en Krea 2 Turbo.
- Generacion de variaciones de vestuario: describir prendas y joyas en el prompt para obtener al personaje con equipaciones distintas sin perder la identidad.
- Experimentacion en investigacion de personalizacion: usar el adaptador como caso de estudio de LoRA de personaje con rango 24 y dataset pequeno (43 imagenes) para comparar tecnicas de entrenamiento con Musubi Tuner.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la perdida media por checkpoint (`avr_loss` entre 0,0587 y 0,0642), que el propio autor califica de poco informativa para flow-matching y recomienda evaluar visualmente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea-2-Raw de 12B y de la variante Turbo, no solo del adaptador de 2,1 GB.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el entrenamiento se realizo en bf16 con SDPA y sin gradient checkpointing, lo que sugiere requisitos de memoria elevados para el modelo base.
- Opciones de despliegue: no se documentan en la model card; el entrenamiento usa Musubi Tuner y la inferencia se plantea sobre Krea 2 Turbo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye adaptadores LoRA comparables para Krea 2 ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- Dataset pequeno (43 imagenes) y generado mediante edicion con gpt-image-2.6-flare, lo que puede introducir artefactos o sesgos propios del generador usado para crear las referencias.
- Riesgo de sobreajuste al estilo fotografico de movil y a las condiciones de iluminacion del dataset; puede degradarse en estilos muy distintos.
- La seleccion de checkpoint debe hacerse visualmente porque la perdida no es discriminativa en flow-matching.
- Dependencia estricta del modelo base Krea-2-Raw y de la variante Turbo para inferencia; no es utilizable de forma autonoma.
- Idioma: las leyendas estan en ingles, por lo que los prompts en otros idiomas pueden funcionar peor.
- No se documentan sesgos demograficos ni de representacion del personaje; al ser un LoRA de personaje concreto, su uso esta limitado a esa identidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Zaytron40k/freya-real-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (herramienta de entrenamiento citada): no disponible en la informacion proporcionada.
