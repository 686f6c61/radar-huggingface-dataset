# Zaytron40k/amira-krea2-lora

## Resumen

`amira-krea2-lora` es un LoRA de personaje (character LoRA) para el modelo de generacion de imagenes Krea 2, desarrollado por el usuario Zaytron40k. El adaptador se entrena sobre `krea/Krea-2-Raw`, un transformer de difusion (DiT) de 12.000 millones de parametros, y esta pensado para usarse en inferencia sobre Krea 2 Turbo, la variante destilada de la familia. Su funcion es fijar la identidad visual de un personaje concreto, activado mediante la frase disparadora `4mira woman`, de modo que el modelo base reproduzca de forma consistente rasgos faciales, vestuario canonico y expresiones.

El repositorio es de caracter experimental y se encuentra en estado de entrenamiento en curso segun la propia model card. Se ha entrenado con Musubi Tuner (modulo `networks.lora_krea2`) con rango y alpha de 24, optimizador adamw8bit, learning rate 1e-4 y precision bf16. El dataset consta de 51 imagenes de 2k generadas con Seedream-v5.5, con leyendas en prosa natural y fondos de color hexadecimal plano.

Por su naturaleza, no es un modelo autonomo sino un adaptador que requiere el modelo base Krea 2 para funcionar. Su relevancia es acotada: sirve para personalizacion de identidad en flujos text-to-image, no para tareas generales de lenguaje, razonamiento o codigo. El repositorio ocupa 1,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT (Diffusion Transformer) Krea 2; modulo `networks.lora_krea2` de Musubi Tuner |
| Parametros totales | No disponible para el adaptador; modelo base de 12B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo text-to-image, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 1,8 GB) |

Parametros adicionales del adaptador:

| Parametro | Valor |
|---|---|
| Rango / dim LoRA | 24 |
| Alpha LoRA | 24 |
| Optimizador | adamw8bit |
| Learning rate | 1e-4 |
| Precision de entrenamiento | bf16, SDPA |
| Muestreo de timesteps | krea2_shift, weighting_scheme none |
| Trigger | `4mira woman` |
| Modelo base | krea/Krea-2-Raw (`raw.safetensors`, 12B DiT) |
| Entrenador | Musubi Tuner |
| Epocas / pasos | 12 epocas = 1224 pasos, guardado cada 2 epocas, seed 42 |
| Dataset | 51 imagenes de 2k (Seedream-v5.5), batch 1, buckets 1024, num_repeats 2 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 24 y alpha 24 aplicado sobre Krea 2, un transformer de difusion de 12.000 millones de parametros que opera en el pipeline text-to-image. El entrenamiento se realizo con Musubi Tuner, con muestreo de timesteps `krea2_shift`, esquema de ponderacion `none`, optimizador adamw8bit, learning rate 1e-4 y precision bf16 con atencion SDPA. La configuracion economica de memoria omitio `--gradient_checkpointing` y uso `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.

El dataset se compone de 51 imagenes de 2k generadas con Seedream-v5.5. El conjunto de chat incluye expresiones calificadas como flirty/seductive; cuatro filas recogen los looks canonicos del personaje (vestido abaya azul marino, dos de ellas con hijab) y el resto varia la indumentaria, con fondos de color hexadecimal plano. Las leyendas estan en prosa natural y el hijab se describe como prenda de vestir. El entrenamiento cubre 12 epocas (1224 pasos) con guardado cada 2 epocas y semilla 42. La model card advierte que `avr_loss` es una media movil casi plana en flow-matching, por lo que la seleccion del checkpoint debe hacerse visualmente. Los valores registrados son 0,0526 (epoca 2), 0,0509 (epoca 4), 0,0465 (epoca 6), 0,0446 (epoca 8) y 0,0495 (epoca 10).

## Capacidades

- Generacion text-to-image condicionada a un personaje concreto mediante la frase disparadora `4mira woman`.
- Reproduccion de la identidad facial y del vestuario canonico del personaje (abaya azul marino, opcionalmente con hijab).
- Generacion de expresiones faciales variadas, incluidas expresiones calificadas como flirty/seductive en el conjunto de chat.
- Variacion de indumentaria manteniendo la identidad del personaje, gracias a las filas no canonicas del dataset.
- Composicion sobre fondos de color plano, segun el tipo de imagenes de entrenamiento.
- Compatibilidad con el apilado de LoRAs: la model card recomienda apilarlo sobre el LoRA de estilo de la casa.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingues: no disponibles; las leyendas de entrenamiento estan en prosa natural sin idioma declarado.

## Casos de uso

- Personalizacion de identidad en produccion de ilustracion: el LoRA fija los rasgos del personaje para mantener consistencia entre imagenes de una misma serie o entrega, evitando la deriva de identidad tipica del text-to-image sin adaptador.
- Generacion de paneles para narrativa visual o comic: al conservar el rostro y el vestuario canonico, permite producir secuencias de escenas con el mismo personaje variando pose y fondo.
- Pruebas de vestuario virtual: las filas del dataset con indumentaria variada permiten explorar cambios de ropa sobre la misma identidad, util para bocetos de diseno de moda o previsualizacion.
- Creacion de avatares y retratos de personaje: con fondos de color plano como los del entrenamiento, encaja en flujos que recortan la figura y la componen sobre otros fondos.
- Exploracion de expresiones para guion grafico: el conjunto de chat con expresiones marcadas sirve para generar variantes emocionales del personaje en una misma escena.
- Integracion en pipelines de generacion por lotes: al ser un safetensors de 1,8 GB apilable sobre Krea 2 Turbo, puede cargarse en un servicio de inferencia que aplique el trigger de forma sistematica.
- Prototipado de estilo combinado: apilado sobre el LoRA de estilo de la casa, permite obtener el personaje con la estetica global del proyecto sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida media movil por checkpoint (0,0526 en la epoca 2, 0,0509 en la 4, 0,0465 en la 6, 0,0446 en la 8 y 0,0495 en la 10), que el propio autor califica de poco informativa para flow-matching y recomienda sustituir por evaluacion visual.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Krea 2 (12B DiT) y de la precision de carga, no del adaptador, que solo anade 1,8 GB de pesos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo base (12B), el adaptador no es apto para GPU de consumo de gama baja sin cuantizacion del base.
- Compatibilidad con GPU de consumo: no confirmada; el entrenamiento se realizo con la configuracion economica sin `--gradient_checkpointing` y con `expandable_segments`, lo que sugiere requisitos de memoria moderados pero no especificados.
- Opciones de despliegue: Musubi Tuner para entrenamiento; para inferencia se requiere el ecosistema de Krea 2 (no se detallan en la informacion disponible soportes de vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs de personaje para Krea 2 ni datos de rendimiento comparables. Como referencia estructural, la comparacion natural seria con otros adaptadores LoRA entrenados sobre `krea/Krea-2-Raw` con Musubi Tuner, pero no se dispone de sus especificaciones.

## Limitaciones y advertencias

- Estado de entrenamiento en curso: la model card indica explicitamente "training in progress", por lo que los pesos pueden ser inestables o incompletos.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; ademas, la licencia del modelo base Krea 2 condiciona cualquier uso derivado.
- Dataset pequeno (51 imagenes) y generado sinteticamente con Seedream-v5.5: puede limitar la diversidad de poses, iluminacion y composiciones y favorecer el sobreajuste a los fondos planos del entrenamiento.
- Riesgo de reproduccion de sesgos del dataset: el personaje se asocia a un vestuario canonico concreto (abaya, hijab) y a expresiones calificadas como flirty/seductive, lo que puede reforzar estereotipos si se usa sin control.
- Dependencia estricta del trigger `4mira woman`: sin la frase disparadora el adaptador puede no activarse o degradar la salida.
- Requiere apilarse sobre el modelo base y, segun el autor, sobre el LoRA de estilo de la casa; no funciona como modelo autonomo.
- Sin garantias de calidad: no hay benchmarks, descargas ni validacion externa; la seleccion del checkpoint debe hacerse visualmente por la naturaleza plana de la perdida.
- No apto para tareas de lenguaje, codigo, razonamiento o agentes: es exclusivamente un adaptador text-to-image.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zaytron40k/amira-krea2-lora
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Entrenador Musubi Tuner: no disponible en la informacion proporcionada.
- Paper, blog o demo: no disponibles en la informacion proporcionada.
