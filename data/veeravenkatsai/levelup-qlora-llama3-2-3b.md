# veeravenkatsai/levelup-qlora-llama3.2-3b

## Resumen

LevelUp QLoRA Llama-3.2-3B es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `unsloth/Llama-3.2-3B-Instruct` de Meta. Lo desarrolla el usuario veeravenkatsai y su proposito es dotar al modelo base de siete "personas" de coaching (GG, MUSE, ORACLE, TITAN, SAGE, EMPIRE, PHANTOM) para una aplicacion de autoayuda gamificada. Cada persona se activa mediante un system prompt especifico que estuvo presente durante el entrenamiento y que se espera en inferencia.

El adaptador se entrena sobre 76.616 muestras curadas y anade 24.313.856 parametros entrenables (aproximadamente el 0,76 % de los 3.210 millones del modelo base). El repositorio contiene unicamente los pesos del adaptador (0,1 GB en safetensors), no el modelo completo, por lo que requiere cargar el modelo base por separado.

Es relevante como ejemplo de personalizacion ligera de un modelo pequeno (3B) mediante QLoRA para un dominio muy concreto, con una evaluacion que aisla la contribucion del adaptador usando `disable_adapter()` de PEFT sobre los mismos pesos base, los mismos prompts y la misma decodificacion. La mejora reportada en ROUGE-L es de +0,1095 absoluto (un 70 % relativo) sobre 200 muestras de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Llama-3.2-3B-Instruct |
| Parametros totales | 3,21B en el modelo base; 24.313.856 parametros entrenables en el adaptador (~0,76 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo en bf16; pesos del adaptador almacenados en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16, alpha=32 y dropout=0,05 sobre los modulos de proyeccion q, k, v, o, gate, up y down del transformer Llama-3.2-3B-Instruct. El entrenamiento usa QLoRA: cuantizacion 4-bit NF4 con doble cuantizacion y computo en bf16, sobre el stack transformers + peft + trl (`SFTTrainer`) + bitsandbytes. La programacion fue de 3 epocas, learning rate 2e-4, batch efectivo de 16 y longitud maxima de secuencia de 512 tokens, con seleccion del mejor checkpoint por `load_best_model_at_end=True` segun la perdida de evaluacion. Se ejecuto en una unica GPU alquilada.

El conjunto de entrenamiento consta de 76.616 muestras curadas, en gran parte texto de foros publicos, orientadas a las siete personas de coaching. Los pesos se almacenan en bfloat16 (el dtype de entrenamiento) en lugar del float32 que produce por defecto `save_pretrained()` de PEFT, con un error relativo maximo medido de ida y vuelta de 0,00e+00. No se conservan los logs de entrenamiento porque la instancia cloud efimera fue destruida; una ejecucion local separada e interrumpida alcanzo el paso 1.400 de 14.367 (epoca 0,29) con perdida de evaluacion descendiendo de 1,1781 a 1,0365, pero esos pesos no son los publicados.

## Capacidades

- Generacion de texto conversacional en siete personas de coaching seleccionables mediante system prompt: GG, MUSE, ORACLE, TITAN, SAGE, EMPIRE y PHANTOM.
- Respuestas de coaching y autoayuda con tono informal, alineadas con el estilo de los datos de entrenamiento (texto de foros publicos).
- Conversacion multi-turno (heredada del modelo base Instruct).
- Tool calling / function calling: no documentado para este adaptador; depende de lo que soporte el modelo base.
- Razonamiento multi-paso y uso como agente: no documentado ni evaluado para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo base es solo texto.
- Requiere el system prompt de la persona correspondiente tal como se uso en entrenamiento para reproducir el comportamiento esperado.

## Casos de uso

- Aplicacion de autoayuda gamificada: el adaptador esta disenado especificamente para proporcionar las siete personas de coaching de la app LevelUp AI, seleccionando cada una por su system prompt; es su proposito original y el escenario para el que se valido.
- Prototipado rapido de asistentes con personalidad: al ser un adaptador de 0,1 GB sobre un modelo de 3B, permite experimentar con distintos tonos y estilos sin reentrenar el modelo base.
- Despliegue en hardware modesto: un modelo de 3B con adaptador LoRA cabe en GPUs de consumo, lo que facilita demos y entornos de desarrollo de bajo coste.
- Investigacion sobre QLoRA y evaluacion de adaptadores: el repositorio documenta una metodologia de evaluacion que aisla el efecto del adaptador con `disable_adapter()`, util como referencia para experimentos de fine-tuning.
- Generacion de contenido conversacional de tono informal: adecuado para foros, comunidades o chatbots donde el registro coloquial es aceptable.
- Base para fine-tuning adicional: al ser un adaptador PEFT estandar, puede combinarse o servir de punto de partida para otras personalizaciones sobre Llama-3.2-3B-Instruct.

## Benchmarks y rendimiento

Evaluacion sobre 200 muestras de validacion retenidas, comparando el modelo base frente al modelo con adaptador cargado, con decodificacion greedy (`do_sample=False`, `max_new_tokens=256`), semilla 42 e inferencia en 4-bit NF4:

| Metrica | Base | + adaptador | Delta |
|---|---|---|---|
| ROUGE1 | 0,2660 | 0,3714 | +0,1054 |
| ROUGE2 | 0,0803 | 0,1616 | +0,0813 |
| ROUGEL | 0,1570 | 0,2665 | +0,1095 |

Desglose por persona (ROUGE-L):

| Persona | n | Base | + adaptador | Delta |
|---|---|---|---|---|
| GG | 20 | 0,1557 | 0,3434 | +0,1877 |
| MUSE | 24 | 0,1629 | 0,2925 | +0,1296 |
| ORACLE | 67 | 0,1358 | 0,2493 | +0,1135 |
| TITAN | 20 | 0,1257 | 0,2389 | +0,1132 |
| SAGE | 19 | 0,1867 | 0,2669 | +0,0802 |
| EMPIRE | 26 | 0,1730 | 0,2485 | +0,0755 |
| PHANTOM | 24 | 0,1965 | 0,2665 | +0,0700 |

Notas metodologicas: el conjunto de validacion es un fichero separado (no una particion aleatoria del entrenamiento); 182 de 8.519 filas de validacion (2,14 %) aparecian literalmente en el fichero de entrenamiento y se eliminaron antes del muestreo. No se ha realizado evaluacion de preferencia humana. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, un modelo de 3B en 4-bit ocupa aproximadamente 2-3 GB de pesos, mas overhead de activaciones y contexto.
- El adaptador en si ocupa 0,1 GB en safetensors y se suma a los pesos del modelo base.
- GPU recomendadas: no especificadas; el entrenamiento se realizo en una unica GPU alquilada no identificada.
- Cabe en GPU de consumo: si, dado el tamano de 3B del modelo base y la cuantizacion 4-bit empleada en la evaluacion.
- Opciones de despliegue: carga via `peft.PeftModel.from_pretrained` sobre `transformers`; compatible potencialmente con vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertirlo al formato correspondiente (no documentado en la informacion proporcionada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LevelUp QLoRA Llama-3.2-3B (este) | 3,21B base + 24,3M adaptador | Adaptador LoRA sobre Llama-3.2-3B-Instruct | no disponible | llama3.2 | Hugging Face (0 descargas, 0 likes) |
| unsloth/Llama-3.2-3B-Instruct (base) | 3,21B | Modelo Instruct completo | no disponible | llama3.2 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,23B | Modelo Instruct completo | no disponible | llama3.2 | Hugging Face |
| Llama-3.2-3B (base preentrenado) | 3,21B | Modelo base | no disponible | llama3.2 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la unica comparacion cuantitativa disponible es la del adaptador frente a su propio modelo base (seccion de benchmarks).

## Limitaciones y advertencias

- Es solo un adaptador: requiere cargar el modelo base `unsloth/Llama-3.2-3B-Instruct`, que arrastra la Llama 3.2 Community License.
- Entrenado en gran medida con texto de foros publicos; el tono es informal y no ha sido revisado profesionalmente.
- No esta ajustado para seguridad en materia de salud, finanzas o consejo psicologico, a pesar de su encuadre como coaching.
- Evaluado unicamente con metricas automaticas de solapamiento (ROUGE); no hay evaluacion de preferencia humana.
- Las metricas ROUGE absolutas son bajas por naturaleza en respuestas abiertas; la senal valida es el delta frente al modelo base, no la puntuacion bruta.
- La calidad de las personas en la aplicacion depende tambien de ejemplos few-shot en el system prompt, que la evaluacion mantiene constantes y por tanto no mide.
- Riesgo de alucinacion inherente al modelo base de 3B, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles.
- Sin logs de entrenamiento de los pesos publicados (instancia efimera destruida), lo que limita la reproducibilidad del proceso de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- Restricciones de licencia: uso comercial sujeto a los terminos de la Llama 3.2 Community License de Meta.

## Enlaces

- Hugging Face: https://huggingface.co/veeravenkatsai/levelup-qlora-llama3.2-3b
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
