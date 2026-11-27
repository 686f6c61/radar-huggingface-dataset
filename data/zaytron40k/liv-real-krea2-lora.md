# Zaytron40k/liv-real-krea2-lora

## Resumen

`liv-real-krea2-lora` es un LoRA de personaje (character LoRA) para el modelo de generacion de imagen a texto Krea 2, desarrollado por el usuario Zaytron40k. Su funcion es introducir en el modelo base un sujeto concreto, activado mediante el token disparador `l1v woman`, para producir retratos realistas de esa identidad bajo distintos angulos, poses, iluminacion y vestuario. No es un modelo autonomo: requiere el modelo base Krea 2 para funcionar.

El adaptador se entreno sobre `krea/Krea-2-Raw`, un transformer de difusion (DiT) de 12 000 millones de parametros, y esta pensado para inferencia sobre la variante Krea 2 Turbo. El entrenamiento se realizo con Musubi Tuner, usando el modulo `networks.lora_krea2`, con rango y alpha de 24 y optimizador adamw8bit. El repositorio ocupa 2,1 GB y contiene los pesos del LoRA, no el modelo completo.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y un unico "like" en el momento de la consulta, sin licencia declarada ni informacion de benchmarks. Es util para quien quiera reproducir el flujo de entrenamiento de un character LoRA sobre Krea 2 o evaluar la tecnica, pero no constituye una pieza de infraestructura general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion (DiT) Krea 2; modulo `networks.lora_krea2` de Musubi Tuner |
| Parametros totales | no disponible (el modelo base es un DiT de 12B; el adaptador tiene rango 24 y alpha 24) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion de entrenamiento en buckets de 1024) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (las captions de entrenamiento son en prosa natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 2,1 GB; el model card cita `raw.safetensors` para el base) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 24 y alpha 24 aplicado sobre Krea 2, un transformer de difusion de 12 000 millones de parametros. El entrenamiento se hizo con Musubi Tuner usando el tipo de red `networks.lora_krea2`, optimizador adamw8bit con learning rate 1e-4, precision bf16 y atencion SDPA. El muestreo de timesteps emplea `krea2_shift` con `weighting_scheme none`, y se ejecuto sin `--gradient_checkpointing` con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para reducir consumo de memoria.

El dataset v1 consta de 43 imagenes generadas con `gpt-image-2.6-flare` a partir de referencias frontales y a tres cuartos de la identidad "Liv", editadas a 1024 pixeles y seleccionadas a mano: angulos variados (frontal, tres cuartos, lateral, espalda, picado, contrapicado), mayoritariamente primeros planos y planos medios, selfies de espejo, poses, iluminacion y expresiones variadas, con ropa diversa. Las captions estan en prosa natural y describen prendas, joyas y transparencias cuando aparecen. Se uso batch 1, buckets de 1024 y `num_repeats` 2. El schedule fue de 12 epocas (1032 pasos), guardando cada 2 epocas con semilla 42.

## Capacidades

- Generacion de imagenes de un personaje concreto ("Liv") condicionada por el token `l1v woman`, sobre el modelo base Krea 2.
- Control de angulo de camara y encuadre: el dataset cubre vistas frontales, tres cuartos, laterales, traseras, picados y contrapicados, ademas de primeros planos y planos medios.
- Variacion de vestuario, joyeria y accesorios, ya que estos elementos se describieron en las captions de entrenamiento.
- Reproduccion de poses, iluminacion y expresiones "coquetas" o agradables segun el model card.
- Estilismo fotografico realista, incluyendo selfies de espejo.
- Composicion con otros LoRA: el autor recomienda apilarlo sobre el LoRA de estilo de la casa (house style LoRA).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente text-to-image.

## Casos de uso

- Creacion de personajes consistentes para narrativa visual: el LoRA permite generar la misma identidad en multiples escenas y angulos, lo que resulta util para storyboards, comics o novelas graficas donde la coherencia facial es critica.
- Prototipado de avatares y perfiles: generar retratos realistas del personaje en distintos encuadres (primer plano, plano medio, selfie) para usar como material de referencia en diseno de personajes.
- Pruebas de vestuario y estilismo: al estar las prendas y accesorios descritos en las captions, se puede condicionar la generacion para explorar combinaciones de ropa y joyeria sobre una misma identidad.
- Investigacion sobre entrenamiento de character LoRA: el model card documenta hiperparametros, dataset, schedule y curva de perdida, lo que lo convierte en un caso reproducible para estudiar el flujo de Musubi Tuner sobre Krea 2.
- Generacion de material para campanas de marca ficticias o demos de producto: permite producir un elenco visual coherente sin depender de sesiones fotograficas reales.
- Evaluacion comparativa de checkpoints: al publicarse seis checkpoints intermedios con `avr_loss`, se puede analizar visualmente como evoluciona la fidelidad del personaje a lo largo de las epocas.
- Composicion con LoRA de estilo: combinado con un LoRA de estetica general, sirve para generar al personaje bajo un look visual uniforme en una serie de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card unicamente reporta la perdida media (`avr_loss`) por checkpoint, que es una media movil casi plana propia de flow-matching y que el propio autor advierte que no debe usarse como criterio de seleccion; recomienda elegir el checkpoint visualmente.

| Checkpoint | Epoca | avr_loss |
|---|---|---|
| `-000002` | 2 | 0,0617 |
| `-000004` | 4 | 0,0656 |
| `-000006` | 6 | 0,0599 |
| `-000008` | 8 | 0,0603 |
| `-000010` | 10 | 0,0601 |
| final | 12 | 0,0594 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador. Depende del modelo base Krea 2 (DiT de 12B); el adaptador anade una sobrecarga minima (rango 24).
- GPU recomendadas: no disponible. El entrenamiento se realizo en bf16 con SDPA y sin gradient checkpointing, lo que sugiere el uso de una GPU de gama alta con memoria suficiente para un DiT de 12B, pero el autor no especifica el hardware.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; un DiT de 12B en bf16 excede la VRAM de las GPU de consumo actuales, por lo que previsiblemente requeriria cuantizacion o offloading del modelo base.
- Opciones de despliegue: el flujo documentado es Musubi Tuner para entrenamiento e inferencia sobre Krea 2. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, se puede contrastar con otros adaptadores de personaje para modelos de difusion (por ejemplo, LoRA de personaje para Flux o SDXL), pero no se aportan numeros que permitan una comparacion rigurosa.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `liv-real-krea2-lora` | LoRA de personaje sobre Krea 2 | no disponible (base 12B) | no aplica | no disponible | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, lo que impide asumir permisos de explotacion. Conviene contactar con el autor antes de usarlo en produccion.
- Dataset muy pequeno (43 imagenes) y generado sinteticamente con `gpt-image-2.6-flare`: la fidelidad del personaje puede degradarse en angulos, expresiones o contextos poco representados.
- Sesgos de identidad: al entrenarse sobre una unica identidad y un conjunto reducido de imagenes, el LoRA puede reproducir sesgos de apariencia, complexion, edad o etnia presentes en las referencias.
- Riesgo de sobreajuste y de "fuga" del token disparador: el uso de `l1v woman` puede contaminar generaciones no relacionadas si se mantiene en el prompt.
- Dependencia estricta del modelo base `krea/Krea-2-Raw` para entrenamiento y de Krea 2 Turbo para inferencia; no es portable a otras arquitecturas.
- Sin informacion sobre idiomas de las captions ni sobre el comportamiento del modelo base con prompts en castellano.
- Cero descargas y un unico "like": no hay evidencia de validacion por parte de la comunidad.
- El propio autor advierte que `avr_loss` no es un criterio fiable para elegir checkpoint; la seleccion debe hacerse visualmente.
- El contenido del dataset incluye descripciones de transparencias y desnudez parcial ("nipple show-through"), lo que puede generar contenido sensible y requiere moderacion en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaytron40k/liv-real-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (herramienta de entrenamiento citada): no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponibles en la informacion proporcionada
