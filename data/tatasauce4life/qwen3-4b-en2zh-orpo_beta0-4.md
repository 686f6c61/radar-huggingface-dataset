# tatasauce4life/qwen3-4b-en2zh-orpo_beta0.4

## Resumen

`tatasauce4life/qwen3-4b-en2zh-orpo_beta0.4` es un adaptador LoRA para traduccion de novelas de ingles a chino, construido sobre el modelo base `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit`, que a su vez es la version cuantizada a 4 bits de Qwen3-4B publicada por Unsloth. El adaptador no es un modelo autonomo: contiene las actualizaciones acumuladas de dos fases de entrenamiento (SFT seguido de ORPO) y requiere cargar el modelo base para funcionar. Su autoria es individual (`tatasauce4life`) y el repositorio tiene 0,3 GB, con 0 descargas y 0 likes en el momento de redactar esta ficha.

El problema que aborda es concreto: mejorar la calidad de traduccion ingles-chino en un dominio especifico, la narrativa literaria, donde los sistemas genericos tienden a producir traducciones literales o poco naturales. La estrategia seguida es de alineamiento de preferencias: primero un ajuste supervisado (SFT) sobre un corpus paralelo de novelas y despues una optimizacion ORPO (Odds Ratio Preference Optimization) que enfrenta traducciones humanas (chosen) contra traducciones automaticas (rejected). Esto permite al modelo aprender a distinguir y preferir el registro de un traductor humano frente a una salida de maquina.

Es relevante ahora por dos motivos. Primero, demuestra un flujo de trabajo reproducible y de bajo coste (Unsloth + PEFT + LoRA r=16) para especializar un modelo de 4.000 millones de parametros en una tarea de traduccion muy concreta. Segundo, es un caso de estudio de ORPO aplicado a traduccion, una tecnica que evita necesitar un modelo de recompensa separado como en RLHF. La ventana de entrenamiento, sin embargo, es de solo 1024 tokens y el ambito declarado son el ingles y el chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre el modelo base |
| Parametros totales | 4.000 millones aproximadamente en el modelo base (derivado del nombre `Qwen3-4B`); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha; la longitud maxima de secuencia usada en entrenamiento es de 1024 tokens |
| Tipos de cuantizacion | Modelo base cargado en 4 bits (`bnb-4bit`); los ejemplos de carga usan `load_in_4bit=True` |
| Idiomas soportados | Ingles (`en`) y chino (`zh`); tarea unidireccional en a zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |
| Tipo de modelo | Adaptador LoRA (actualizacion acumulada de SFT + ORPO) |
| Modelo base | `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` |
| Modelo SFT de partida | `tatasauce4life/qwen3-4b-en2zh-lora` |
| Tarea declarada (pipeline) | `translation` |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-4B, un transformer decoder-only con atencion causal. Sobre el se aplica un adaptador LoRA con rango 16 y alpha 32, entrenado sobre el modelo base cuantizado a 4 bits. El adaptador se distribuye como pesos safetensors compatibles con PEFT y con la libreria Unsloth, y las actualizaciones de las dos fases (SFT y ORPO) estan acumuladas en el mismo conjunto de pesos. El entrenamiento se realizo con batch size 1, acumulacion de gradiente 16 (batch efectivo 16), learning rate 5e-5, 4 epocas y longitud maxima de secuencia de 1024 tokens.

El flujo de entrenamiento tiene dos etapas. La primera es un SFT con LoRA sobre un corpus paralelo de novelas en ingles y chino. La segunda es ORPO, que optimiza directamente la preferencia entre la traduccion humana (chosen) y la traduccion automatica (rejected) mediante un termino de razon de probabilidades; el coeficiente beta declarado en la tabla de parametros es 0,08, aunque el nombre del repositorio indica `beta0.4`, una discrepancia que conviene verificar con el autor. La plantilla de inferencia es fija y muy simple: `### English\n{texto}\n### Chinese\n`, sin tokens especiales adicionales.

Los registros de entrenamiento muestran un descenso sostenido de la perdida de entrenamiento (1,8582 en la epoca 1 a 1,4824 en la 4) mientras la perdida de validacion baja hasta la epoca 2 (1,8175) y luego repunta (1,8336 en la 3 y 1,8595 en la 4), lo que sugiere un sobreajuste leve a partir de la tercera epoca. La precision de recompensas (`rewards/accuracies`) crece de 0,354 a 0,552, es decir, en la ultima epoca el modelo solo asigna mayor puntuacion a la traduccion elegida en el 55,2 % de los pares. El `log odds ratio` permanece negativo al final del entrenamiento (-0,680), aunque el `log odds chosen` pasa de -0,101 a +0,471.

## Capacidades

- Traduccion de texto narrativo de ingles a chino, con la plantilla `### English` / `### Chinese`.
- Generacion de texto condicionada al prompt, heredada del modelo base Qwen3-4B.
- Adopcion de un registro de traduccion mas cercano al humano que a la traduccion automatica, gracias a la fase ORPO.
- Procesamiento de fragmentos de hasta 1024 tokens en la configuracion de entrenamiento (los ejemplos de uso generan hasta 512 tokens nuevos).
- Decodificacion determinista en el ejemplo oficial (`do_sample=False`), reproducible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles y chino segun los metadatos.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Traduccion de novelas ligeras y web novels: el modelo esta entrenado especificamente sobre corpus de ficcion en ingles y chino, de modo que se usa para convertir capitulos completos fragmento a fragmento respetando el registro narrativo. Es el caso de uso principal y para el que existe evidencia de entrenamiento.
- Pre-traduccion asistida para traductores profesionales: se genera un borrador con el adaptador y el traductor humano lo revisa, aprovechando la preferencia aprendida hacia el estilo humano frente a la traduccion automatica generica.
- Publicacion de contenido serializado: al ser un adaptador de 0,3 GB sobre un modelo de 4B, se puede desplegar en una GPU de consumo y traducir capitulos nuevos segun se publican, con coste marginal bajo.
- Localizacion de obras de dominio publico: traduccion por lotes de textos literarios libres de derechos, con decodificacion determinista para garantizar consistencia entre ejecuciones.
- Generacion de datos de traduccion sinteticos: producir pares ingles-chino de estilo literario para alimentar otros entrenamientos o para aumentar corpus paralelos.
- Evaluacion comparativa de tecnicas de alineamiento: al existir una version previa solo con SFT (`tatasauce4life/qwen3-4b-en2zh-lora`), sirve para medir el efecto de ORPO sobre la calidad de traduccion en un dominio acotado.
- Ajuste fino posterior sobre dominios vecinos: el adaptador puede servir como punto de partida (con `beta` y learning rate mas bajos) para otros pares de idiomas o generos literarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (BLEU, COMET, MMLU, etc.) en la informacion disponible. Los unicos datos cuantitativos son las metricas de entrenamiento de la fase ORPO:

| Epoca | Training loss | Validation loss | Rewards/chosen | Rewards/rejected | Rewards/accuracies | Log odds ratio | Log odds chosen |
|---|---|---|---|---|---|---|---|
| 1 | 1,858179 | 1,864919 | -0,106697 | -0,099357 | 0,354396 | -0,861723 | -0,100940 |
| 2 | 1,666296 | 1,817527 | -0,103970 | -0,114902 | 0,489011 | -0,744286 | 0,218549 |
| 3 | 1,562287 | 1,833609 | -0,107248 | -0,130436 | 0,543956 | -0,685330 | 0,427241 |
| 4 | 1,482364 | 1,859507 | -0,110568 | -0,136780 | 0,552198 | -0,680145 | 0,471212 |

No hay comparacion con otros modelos publicada por el autor. Cualquier cifra de calidad de traduccion deberia obtenerse mediante una evaluacion propia con COMET o BLEU sobre un conjunto de prueba de ficcion en ingles-chino.

## Requisitos de hardware

- VRAM estimada para inferencia: en 4 bits el modelo base de 4B ocupa aproximadamente 2,5-3 GB de pesos, mas el coste de cache KV y activaciones; con secuencias de 1024 tokens es razonable esperar un uso total del orden de 4-6 GB. En bf16/fp16 serian necesarios alrededor de 8-9 GB solo para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantizacion de 4 bits; RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes. Para entrenamiento o ajuste adicional con la configuracion declarada (batch 1, acumulacion 16, 1024 tokens, 4 bits) basta una GPU de 12-16 GB.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en cuantizacion de 4 bits.
- Opciones de despliegue: Unsloth (recomendado por el autor), PEFT + Transformers, y, combinando el base con el adaptador fusionado, vLLM, llama.cpp u Ollama y TGI. La ficha solo documenta y valida explicitamente los dos primeros.
- Latencia y throughput: no disponibles. El unico dato de rendimiento es la velocidad de entrenamiento (aproximadamente 3,9 muestras por segundo en la fase ORPO), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-4b-en2zh-orpo_beta0.4` | ~4B (adaptador LoRA) | 1024 tokens en entrenamiento; contexto del base no especificado en la ficha | SFT + ORPO | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| `tatasauce4life/qwen3-4b-en2zh-lora` | ~4B (adaptador LoRA) | No disponible | Solo SFT | No disponible en la informacion proporcionada | HuggingFace |
| `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` | ~4B | No disponible en la informacion proporcionada | Modelo base, sin ajuste de traduccion | No disponible en la informacion proporcionada | HuggingFace |

Alternativas de traduccion de proposito general como NLLB-200, OPUS-MT o Tower no se comparan aqui porque no se dispone de resultados de benchmarks publicados en la informacion proporcionada para este adaptador; cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin el modelo base `unsloth/Qwen3-4B-Base-unsloth-bnb-4bit` no se puede cargar ni ejecutar.
- Discrepancia documental en el hiperparametro beta de ORPO: la tabla indica 0,08 y el nombre del repositorio `beta0.4`. Conviene confirmarlo antes de reproducir el entrenamiento.
- Sobreajuste probable: la perdida de validacion aumenta a partir de la tercera epoca y la precision de preferencias apenas alcanza 0,552, lo que indica una separacion limitada entre traduccion elegida y rechazada.
- Unidireccional y de dominio estrecho: solo ingles a chino y entrenado sobre corpus de novelas; el rendimiento fuera del genero literario o en otros pares de idiomas no esta documentado.
- Ventana de contexto efectiva muy corta para traduccion de documentos: 1024 tokens en entrenamiento implican que los textos largos deben trocearse, con el riesgo de perder coherencia entre segmentos.
- Riesgo de alucinacion y de omision de contenido: como cualquier modelo generativo, puede inventar, resumir o alterar pasajes, especialmente en fragmentos largos o con terminologia muy especifica.
- Sesgos: no se documenta ninguna evaluacion de sesgo; el modelo hereda los sesgos del corpus paralelo de novelas y del modelo base Qwen3-4B, probablemente con sesgos de genero y culturales propios del material literario utilizado.
- Idioma de razonamiento y plantilla: el modelo depende de la plantilla exacta `### English\n...\n### Chinese\n`; prompts fuera de ese formato pueden degradar la salida.
- Licencia Apache 2.0 en este repositorio, pero el uso comercial esta sujeto tambien a la licencia del modelo base y a los derechos de autor de cualquier texto que se traduzca.
- Modelo practicamente sin validacion externa: 0 descargas y 0 likes, sin evaluacion independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tatasauce4life/qwen3-4b-en2zh-orpo_beta0.4
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Base-unsloth-bnb-4bit
- Modelo SFT de partida citado en la ficha: https://huggingface.co/tatasauce4life/qwen3-4b-en2zh-lora
- Articulo de ORPO: https://arxiv.org/abs/2403.07691
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- Qwen3: https://github.com/QwenLM/Qwen3
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos eran paginas promocionales de Google Gemini sin relacion con el adaptador.
