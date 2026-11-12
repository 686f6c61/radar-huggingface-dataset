# Zaytron40k/alia-krea2-lora

## Resumen

alia-krea2-lora es un LoRA de personaje (character LoRA) entrenado sobre el modelo de difusion Krea 2 RAW, un transformer de difusion (DiT) de 12.000 millones de parametros orientado a generacion de imagenes texto-a-imagen. Lo publica el usuario Zaytron40k en Hugging Face y su funcion es inyectar un personaje concreto, activado mediante la cadena de disparo `4lia woman`, en el pipeline de Krea 2. El entrenamiento se ha realizado con Musubi Tuner y el modulo de red `networks.lora_krea2`.

El adaptador tiene rango y alpha de 24, se entreno en precision bf16 con el optimizador adamw8bit a una tasa de aprendizaje de 1e-4, y el dataset consta de 49 fotogramas de 2k generados con Seedream-v5.5. El repositorio ocupa 1,8 GB y el autor lo marca explicitamente como "training in progress", por lo que los pesos publicados corresponden a checkpoints intermedios de una tirada de 12 epocas (1176 pasos) con guardado cada 2 epocas.

Es relevante ahora porque ilustra el flujo de trabajo habitual de personalizacion sobre modelos de difusion de gran escala: un modelo base pesado (12B) mas un adaptador ligero de bajo rango que se apila sobre LoRAs de estilo. La ficha debe leerse con cautela: no hay benchmarks, no hay licencia declarada y el propio autor advierte de que el entrenamiento no ha finalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 24, alpha 24) sobre DiT de 12B (Krea 2 RAW) |
| Parametros totales | no disponible (el adaptador LoRA es de bajo rango; el modelo base es de 12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,8 GB; archivo base `raw.safetensors` del modelo base) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Krea 2 RAW, un transformer de difusion (DiT) de 12.000 millones de parametros. La tecnica es LoRA de rango 24 con alpha 24, entrenada con Musubi Tuner mediante el modulo `networks.lora_krea2`. La configuracion de entrenamiento usa adamw8bit con learning rate 1e-4, precision bf16 y atencion SDPA, con muestreo de timesteps `krea2_shift` y `weighting_scheme none`. La tirada prevista es de 12 epocas (1176 pasos) con semilla 42 y guardado cada 2 epocas; la ejecucion se hizo sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.

El dataset son 49 fotogramas de 2k generados con Seedream-v5.5, con captions en prosa natural. El conjunto incluye un "chat set" de expresiones coquetas y seductoras, cuatro filas con el atuendo canonico del personaje (referencia de cuerpo medio) y el resto con ropa variada a partir de una referencia principal en banera para preservar la figura completa, sobre fondos de color hexadecimal plano. Los pendientes de aro dorados, el collar y las pulseras estan integrados en el trigger; los fotogramas sin collar o pulseras lo indican en el caption. Se uso batch 1, buckets de 1024 y `num_repeats` 2. No se documenta uso de RLHF ni DPO, algo esperable en un adaptador de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el trigger `4lia woman`, con el personaje integrado en el prompt.
- Control de expresiones faciales y actitud (conjunto de expresiones coquetas y seductoras en el dataset).
- Variacion de vestuario: el adaptador mantiene la identidad del personaje con ropa distinta a la de referencia.
- Composicion de figura completa, incluida la referencia en banera usada para conservar la silueta.
- Apilamiento con LoRAs de estilo: el autor recomienda combinarlo con el LoRA de estilo de la casa.
- Integracion en pipelines de difusion mediante Musubi Tuner y el formato de pesos safetensors.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; es un adaptador exclusivamente de generacion de imagen.

## Casos de uso

- Produccion de ilustracion de personaje consistente: usar el trigger `4lia woman` junto con el LoRA de estilo de la casa para generar un mismo personaje en multiples escenas y encuadres, manteniendo identidad facial y corporativa entre imagenes.
- Creacion de hojas de personaje y material de referencia: generar variaciones de vestuario y expresion a partir de un unico adaptador, util para preproduccion de comics, juegos o narrativa visual.
- Prototipado de campanas visuales: iterar rapidamente sobre conceptos de imagen con un personaje fijo, combinando el LoRA de personaje con LoRAs de estilo para ajustar la estetica sin reentrenar.
- Generacion de material editorial o de redes: producir series de imagenes coherentes de un personaje concreto en distintos atuendos y fondos planos, aprovechando que el dataset usa fondos de color hexadecimal para facilitar el recorte.
- Pruebas de investigacion sobre personalizacion: comparar checkpoints intermedios (epocas 2 a 10) para estudiar como evoluciona la fidelidad del personaje frente al sobreajuste, dado que el autor publica la curva de `avr_loss`.
- Integracion en pipelines de difusion automatizados: cargar el adaptador en Musubi Tuner o en un runner compatible con el modelo base Krea 2 para generar lotes de imagenes con el personaje en produccion interna.
- Experimentacion con apilado de LoRAs: evaluar la interaccion entre un LoRA de personaje de rango 24 y LoRAs de estilo sobre un DiT de 12B, midiendo deriva de identidad y calidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica proporcionada es la perdida media (`avr_loss`) por checkpoint, que el propio autor califica de casi plana para flow-matching y recomienda seleccionar el checkpoint visualmente:

| Checkpoint | Epoca | avr_loss |
|---|---|---|
| `-000002` | 2 | 0.0566 |
| `-000004` | 4 | 0.0536 |
| `-000006` | 6 | 0.0511 |
| `-000008` | 8 | 0.0471 |
| `-000010` | 10 | 0.0515 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 (DiT de 12B) y de la precision o cuantizacion empleada, no del adaptador LoRA, que es ligero.
- GPU recomendadas: no disponible en la informacion proporcionada. El entrenamiento se realizo en bf16 con SDPA y sin gradient checkpointing, lo que sugiere el uso de una GPU con memoria amplia, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada. Un DiT de 12B en bf16 requiere bastante memoria; no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: Musubi Tuner (entrenador y runner indicado por el autor); el adaptador se distribuye en safetensors y se apila sobre el modelo base Krea 2. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (LoRAs de personaje sobre Krea 2 u otros DiT de gran escala) con datos de parametros, contexto, rendimiento o licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Estado "training in progress": los pesos publicados son checkpoints intermedios de una tirada de 12 epocas; la calidad final no esta garantizada.
- El trigger `4lia woman` esta sobreajustado a un atuendo canonico y a un conjunto de accesorios (aros dorados, collar, pulseras) integrados en el propio trigger; cambios de vestuario pueden alterar la fidelidad.
- Dataset pequeno (49 fotogramas) generado sinteticamente con Seedream-v5.5: riesgo de sesgos y artefactos heredados del generador, y de sobreajuste a las poses y encuadres del conjunto.
- La perdida media es casi plana para flow-matching, por lo que no sirve como criterio fiable de seleccion de checkpoint; hay que evaluar visualmente.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni condiciones de redistribucion; conviene contactar con el autor antes de usarlo en produccion.
- Idiomas soportados no disponibles; al ser un modelo texto-a-imagen, el idioma de los prompts depende del modelo base, no del adaptador.
- Riesgo de alucinacion visual y de deriva de identidad al apilar con otros LoRAs o al usar prompts alejados de la distribucion del dataset.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaytron40k/alia-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (entrenador citado por el autor): no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
