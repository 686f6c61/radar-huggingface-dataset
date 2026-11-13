# Zaytron40k/simona-v2-krea2-lora

## Resumen

Simona v2 Krea2 LoRA es un adaptador LoRA de personaje entrenado sobre el modelo de difusion de texto a imagen Krea 2 RAW (12B parametros, arquitectura DiT). Lo desarrolla el usuario Zaytron40k y su funcion es incorporar un personaje concreto, activado mediante la cadena `s1mona woman`, en las generaciones del modelo base. Esta pensado para entrenar sobre Krea 2 RAW pero para inferencia sobre Krea 2 Turbo, un detalle operativo relevante que el autor documenta explicitamente.

El adaptador emplea rango y alpha de 24, se entreno con Musubi Tuner (modulo `networks.lora_krea2`) en precision bf16 con SDPA, optimizador adamw8bit y learning rate 1e-4, durante 12 epochs y 1200 pasos totales. El conjunto de datos son 50 imagenes de 2k generadas con Seedream-v5.5, con captions en prosa natural y fondos de color hexadecimal plano, lo que facilita el aislamiento del personaje respecto al fondo.

Es relevante ahora porque demuestra el flujo de trabajo tipico de la comunidad para personalizacion de personajes sobre modelos DiT de nueva generacion: entrenamiento ligero (2,1 GB de repositorio), publicacion de la curva de perdida por checkpoint y recomendaciones de apilado con otros LoRAs de estilo. La ficha se limita a los datos publicados; no hay informacion sobre licencia, idiomas ni evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT (Krea 2 RAW, 12B parametros) |
| Parametros totales | no disponible (adaptador LoRA de rango 24; el modelo base tiene 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-imagen) |
| Tipos de cuantizacion | bf16 en entrenamiento; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 2,1 GB; pesos del LoRA en formato Musubi Tuner) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Krea 2 RAW, un transformer de difusion (DiT) de 12B parametros. El LoRA usa rango/dim 24 y alpha 24, se entreno en bf16 con atencion SDPA, optimizador adamw8bit, learning rate 1e-4 y muestreo de timesteps `krea2_shift` con `weighting_scheme none`. La ejecucion se hizo sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, una configuracion de bajo consumo de memoria que el autor etiqueta como "econ run". El entrenamiento consta de 12 epochs (1200 pasos), guardando checkpoint cada 2 epochs, con semilla 42.

El dataset son 50 frames de 2k generados con Seedream-v5.5: 17 de retrato, 31 de plano medio y 2 de cuerpo completo, derivados de referencias actualizadas el 2026-11-13 (referencias de retrato para primeros planos, de banador para cambios de vestuario y 4 frames con el atuendo canonico). Los fondos son colores hexadecimales planos y los captions estan en prosa natural. Glasses, pendientes, anillos y pulseras estan integrados en el trigger; los frames donde faltan lo indican explicitamente ("without her glasses / rings / bracelets"). Se uso batch 1, buckets de 1024 y `num_repeats` 2. La perdida media (`avr_loss`) evoluciono de 0,053 en el epoch 2 a 0,0463 en el checkpoint final; el autor advierte que es una media movil casi plana en flow-matching y que la seleccion de checkpoint debe hacerse visualmente.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada al personaje mediante el trigger `s1mona woman`.
- Personalizacion de personaje: rostro, proporciones y accesorios (gafas, pendientes, anillos, pulseras) reproducidos de forma consistente.
- Control de encuadre: el dataset cubre primeros planos, planos medios y cuerpo completo, por lo que el LoRA responde a distintos tipos de plano.
- Cambio de vestuario: incluye referencias de banador y un atuendo canonico, lo que permite variaciones de ropa.
- Apilado con otros LoRAs: el autor recomienda combinarlo sobre un LoRA de estilo "house style".
- Inferencia sobre Krea 2 Turbo: entrenado en RAW pero destinado a Turbo, lo que reduce pasos de muestreo en produccion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; es un modelo exclusivamente de generacion de imagen.

## Casos de uso

- Ilustracion de personaje consistente para narrativa seriada: usar `s1mona woman` junto con descripciones de escena para mantener el mismo rostro y accesorios en capitulos o entregas distintas, apoyandose en los distintos encuadres cubiertos por el dataset.
- Prototipado de personajes para videojuego o comic: generar hojas de personaje en plano medio y cuerpo completo con fondos planos, lo que simplifica el recorte y la integracion en pipelines de arte.
- Variaciones de vestuario en moda o cosplay: el conjunto incluye referencias de banador y atuendo canonico, de modo que el LoRA puede producir cambios de ropa manteniendo la identidad del personaje.
- Generacion de avatares y retratos para redes o demos: los 17 frames de retrato permiten primeros planos con control de encuadre, utiles para material promocional de un proyecto ficticio.
- Pruebas de concepto de personalizacion sobre DiT: sirve como referencia tecnica para equipos que quieran replicar el flujo Musubi Tuner + Krea 2 con un presupuesto de entrenamiento reducido (1200 pasos, sin gradient checkpointing).
- Apilado estilistico en produccion creativa: combinado con un LoRA de estilo sobre Krea 2 Turbo, permite generar imagenes de personaje con una direccion artistica uniforme y menos pasos de inferencia.
- Investigacion sobre sesgo y consistencia de identidad: al documentar el dataset y la curva de perdida, es util para estudiar como el numero de frames por tipo de plano afecta a la fidelidad del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo publica la perdida media por checkpoint (`avr_loss`), que no es una metrica de calidad comparable entre modelos:

| Checkpoint | Epoch | avr_loss |
|---|---|---|
| -000002 | 2 | 0,053 |
| -000004 | 4 | 0,0512 |
| -000006 | 6 | 0,048 |
| -000008 | 8 | 0,0448 |
| -000010 | 10 | 0,049 |
| final | 12 | 0,0463 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 Turbo (12B parametros) y de la precision o cuantizacion empleada. El LoRA en si anade una carga minima (rango 24).
- GPU recomendadas: no disponibles. El modelo base de 12B en bf16 requiere GPUs de clase profesional (A100, H100) o consumer de gama alta con suficiente VRAM; no se confirma compatibilidad con RTX 4090 en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado. El entrenamiento se realizo sin gradient checkpointing con `expandable_segments`, lo que sugiere un ajuste agresivo de memoria, pero no se especifica la GPU usada.
- Opciones de despliegue: Musubi Tuner para entrenamiento e inferencia del LoRA; el despliegue del modelo base Krea 2 Turbo depende de su propio ecosistema (no documentado en esta ficha).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs de personaje comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, cualquier LoRA de personaje sobre un DiT de 12B compartiria categoria, pero no se dispone de parametros, contexto ni metricas de alternativas concretas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; hay que verificar la licencia del modelo base Krea 2 y la del propio LoRA antes de usarlo en produccion.
- El autor advierte que `avr_loss` es una media movil casi plana en flow-matching y no sirve para elegir checkpoint; la seleccion debe ser visual, lo que introduce subjetividad.
- Entrenado sobre Krea 2 RAW pero destinado a inferencia sobre Krea 2 Turbo: usar otro checkpoint base puede degradar la fidelidad del personaje.
- Dataset pequeno (50 frames) y sintetico (generado con Seedream-v5.5): puede heredar sesgos y artefactos del generador de datos, y la diversidad de poses y expresiones es limitada.
- Fuerte dependencia del trigger `s1mona woman`; fuera de el, el personaje no se activa de forma fiable.
- Los accesorios estan integrados en el trigger y solo se omiten si el prompt lo indica explicitamente; prompts ambiguos pueden producir accesorios no deseados.
- Riesgo de sobreajuste al atuendo y a los fondos planos del dataset, con menor calidad en escenas complejas o iluminacion realista.
- No hay informacion sobre idiomas de los prompts ni sobre evaluacion de sesgos; se recomienda revisar los resultados antes de publicarlos.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad ni informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaytron40k/simona-v2-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (herramienta de entrenamiento citada): no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
