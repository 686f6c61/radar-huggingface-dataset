# Zaytron40k/kalaya-krea2-lora

## Resumen

kalaya-krea2-lora es un LoRA de personaje (character LoRA) para el modelo de generación de imágenes Krea 2, desarrollado por el usuario Zaytron40k. Se entrena sobre el checkpoint RAW de Krea 2 (un modelo DiT de 12B parámetros) y está pensado para su uso en inferencia sobre Krea 2 Turbo. El objetivo es fijar la identidad visual de un personaje concreto, activado mediante la frase disparadora `k4ly woman`, en lugar de describirlo con prompts largos.

El adaptador se ha entrenado con Musubi Tuner usando el módulo `networks.lora_krea2`, con rango y alpha de 24, optimizador adamw8bit y precisión bf16. El dataset es reducido y muy específico: 57 imágenes de 2k generadas con Seedream-v5-flash, con captions en prosa natural y fondos de color plano. El repositorio ocupa 1,8 GB y contiene los checkpoints intermedios del entrenamiento.

La relevancia de esta ficha es acotada: no es un modelo base ni un modelo generalista, sino un adaptador de nicho publicado sin licencia declarada, sin métricas de evaluación y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de flujo de trabajo de entrenamiento de LoRAs de personaje sobre Krea 2 con Musubi Tuner, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un transformer de difusion (DiT) de Krea 2; el adaptador se aplica mediante `networks.lora_krea2` de Musubi Tuner |
| Parametros totales | no disponible (el modelo base es un DiT de 12B; el LoRA tiene rango 24 y alpha 24) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica una ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (el modelo base se referencia como `raw.safetensors`); tamano del repo 1,8 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre Krea 2, un modelo de difusion con arquitectura transformer (DiT) de 12B parametros en su variante RAW. El LoRA emplea rango y dimension 24 con alpha 24, entrenado en bf16 con atencion SDPA y muestreo de timesteps `krea2_shift` sin esquema de ponderacion (`weighting_scheme none`). El optimizador es adamw8bit con learning rate 1e-4, batch 1, buckets de 1024 y `num_repeats` 2. El entrenamiento se ejecuto sin `--gradient_checkpointing` y con `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, en lo que el autor denomina "econ run".

El dataset consta de 57 imagenes de 2k generadas con Seedream-v5-flash: 31 de retrato, 24 de plano medio y 2 de cuerpo completo. Todas las imagenes muestran al personaje con un atuendo distinto (ninguna con el atuendo de referencia), expresiones coquetas o seductoras y fondos de color plano en hexadecimal. Los captions estan redactados en prosa natural. El recogido despeinado y las pulseras doradas estan integrados en la frase disparadora, mientras que los aros dorados y un collar fino dorado se describen en el caption cuando son visibles. El entrenamiento duro 12 epocas (1368 pasos) con semilla 42 y guardado cada 2 epocas. La perdida media (`avr_loss`) se mantiene practicamente plana, de 0,048 en la epoca 2 a 0,037 en la final, comportamiento esperable en flow-matching; el autor recomienda elegir el checkpoint por inspeccion visual.

## Capacidades

- Generacion de imagenes text-to-image condicionada por prompt, heredada del modelo base Krea 2.
- Fijacion de identidad de un personaje concreto mediante la frase disparadora `k4ly woman`, sin necesidad de describirlo en cada prompt.
- Control de atributos persistentes del personaje: recogido despeinado y pulseras doradas integrados en el trigger; aros y collar dorados descritos en caption cuando aparecen.
- Variacion de atuendo: el dataset se construyo deliberadamente con un atuendo distinto por imagen, por lo que el LoRA no deberia imponer una vestimenta fija.
- Expresiones faciales de caracter coqueto o seductor, segun la composicion del dataset de entrenamiento.
- Composicion por planos: retrato, plano medio y cuerpo completo, en funcion de las proporciones presentes en el dataset.
- Compatibilidad declarada con Krea 2 Turbo para inferencia, aunque el entrenamiento se hizo sobre Krea 2 RAW.
- Apilamiento (stacking) con un LoRA de estilo general ("house style LoRA"), recomendado por el autor.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; no aplican a un modelo text-to-image.

## Casos de uso

- Consistencia de personaje en una serie ilustrada: usar `k4ly woman` como prefijo fijo en cada prompt permite generar varias imagenes del mismo personaje con atuendos y encuadres distintos, apoyandose en la variacion de vestuario presente en el dataset.
- Prototipado de personajes para narrativa visual: generar paneles de comic o storyboards con un personaje reconocible en planos de retrato, medio y cuerpo completo, que son exactamente los tres tipos de encuadre del entrenamiento.
- Pruebas de concepto de direccion de arte: combinar el LoRA con un LoRA de estilo general para evaluar como responde la identidad del personaje a distintos tratamientos visuales, tal como sugiere el autor.
- Generacion de material promocional ficticio: crear variaciones de un personaje con expresiones atractivas sobre fondos de color plano, utiles para maquetas de campanas antes de producir arte final.
- Evaluacion de flujos de entrenamiento de LoRA: el repositorio sirve como referencia reproducible de una configuracion concreta de Musubi Tuner sobre Krea 2 (rango 24, alpha 24, adamw8bit, lr 1e-4, 1368 pasos) para quien quiera replicar o comparar el proceso.
- Experimentacion con apilamiento de adaptadores: probar la interaccion entre un LoRA de personaje y un LoRA de estilo sobre el mismo modelo base para estudiar como se mezclan identidad y estetica.
- Docencia sobre difusion: usar los checkpoints intermedios y la curva de `avr_loss` como material para explicar por que en flow-matching la perdida no es un buen criterio de seleccion y hay que evaluar visualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida media por checkpoint, que no constituye una evaluacion de calidad:

| Checkpoint | Epoca | avr_loss |
|---|---|---|
| `-000002` | 2 | 0,048 |
| `-000004` | 4 | 0,0426 |
| `-000006` | 6 | 0,0415 |
| `-000008` | 8 | 0,0403 |
| `-000010` | 10 | 0,0424 |
| final | 12 | 0,037 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Depende del modelo base Krea 2 (DiT de 12B), no del LoRA, cuyo repositorio ocupa 1,8 GB en disco.
- GPU recomendadas: no disponibles. El autor solo documenta que el entrenamiento se hizo en bf16 con SDPA y sin gradient checkpointing, lo que sugiere una GPU con memoria suficiente para un DiT de 12B en bf16, pero no se especifica el modelo.
- Encaje en GPU de consumo: no confirmado. Un DiT de 12B en bf16 no cabe en GPUs de consumo de 24 GB sin tecnicas adicionales de offload o cuantizacion, y no se documentan tales opciones.
- Opciones de despliegue: el ecosistema declarado es Musubi Tuner (entrenamiento) y Krea 2 Turbo (inferencia). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRAs de personaje para Krea 2 ni sobre adaptadores comparables en la informacion proporcionada. La comparacion se limita a los datos del propio repositorio frente a su modelo base:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kalaya-krea2-lora | LoRA de personaje sobre Krea 2 | rango 24 / alpha 24 (base DiT 12B) | no aplica | no disponible | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base text-to-image | 12B (DiT) | no aplica | no disponible en esta ficha | Hugging Face |
| Krea 2 Turbo | Modelo base para inferencia | no disponible | no aplica | no disponible en esta ficha | Referenciado por el autor |

## Limitaciones y advertencias

- Sesgos conocidos: el dataset esta compuesto integramente por imagenes generadas por Seedream-v5-flash con un unico personaje femenino y expresiones deliberadamente coquetas o seductoras; el LoRA reproducira ese sesgo de genero, expresion y estetica.
- Riesgo de sobreajuste: con solo 57 imagenes y 12 epocas sobre un DiT de 12B, es probable que el adaptador memorice detalles del dataset (poses, composiciones, iluminacion de los fondos planos) y reduzca la diversidad de las generaciones.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, manos deformes o accesorios incoherentes, especialmente en planos de cuerpo completo, de los que solo hay 2 ejemplos en el dataset.
- Limitacion de contexto compositivo: el entrenamiento se hizo con buckets de 1024 y tres tipos de encuadre; no hay evidencia de buen comportamiento en otros formatos, escenas complejas o multiples personajes.
- Idioma: no se especifican idiomas soportados; los captions estan en ingles, por lo que los prompts deberian redactarse preferiblemente en ese idioma.
- Licencia: no declarada. La ausencia de licencia impide asumir permisos de uso comercial, redistribucion o modificacion; debe consultarse al autor antes de cualquier uso en produccion.
- Dependencia del modelo base: el LoRA solo funciona con Krea 2, y el autor indica que se entreno sobre RAW pero se usa en Turbo; la calidad puede variar entre ambas variantes y con el apilamiento de otros LoRAs.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el mismo dia, sin validacion externa ni evaluaciones reproducibles.
- Seleccion de checkpoint: el autor advierte que `avr_loss` no es un criterio fiable en flow-matching, por lo que el checkpoint final no es necesariamente el mejor; hay que evaluar visualmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zaytron40k/kalaya-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Musubi Tuner (herramienta de entrenamiento citada): no disponible en la informacion proporcionada
- Krea 2 Turbo (modelo de inferencia citado): no disponible en la informacion proporcionada
- Seedream-v5-flash (generador usado para el dataset): no disponible en la informacion proporcionada
