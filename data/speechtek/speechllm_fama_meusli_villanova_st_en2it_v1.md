# SpeechTek/speechllm_fama_meusli_villanova_st_en2it_v1

## Resumen

El modelo `SpeechTek/speechllm_fama_meusli_villanova_st_en2it_v1` es un sistema de traducción de voz a texto (speech translation, ST) inglés-italiano desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Se construye sobre el framework SLAM-LLM combinando tres componentes: el codificador de voz FAMA (`FBK-MT/fama-medium-asr`), un proyector lineal inicializado desde el proyector MEUSLI (`SpeechTek/MEUSLI_projector_v2_Villanova_2B`) y el modelo de lenguaje Villanova-2B (`VillanovaAI/Villanova-2B-2603`) adaptado con LoRA.

El repositorio no contiene el modelo completo, sino únicamente los 14,16 millones de parámetros entrenados: el proyector (9,44 M) y los adaptadores LoRA (4,72 M). El codificador y el LLM permanecen congelados y deben descargarse por separado. Esto convierte al artefacto en un complemento ligero (0,1 GB) sobre una pila de modelos base de mayor tamaño.

Su relevancia es acotada: se trata de un checkpoint especializado en una única dirección de traducción (inglés a italiano), con un prompt fijo de entrenamiento y evaluación sobre VoxPopuli. Resulta útil como referencia reproducible de la metodología SLAM-LLM aplicada a traducción de voz, y como base para ajustes posteriores, más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM: codificador de voz FAMA (congelado) + proyector lineal + LLM Villanova-2B (congelado, adaptado con LoRA) |
| Parametros totales | 14,16 M entrenados en el checkpoint (proyector 9,44 M + LoRA 4,72 M); el total de la pila no se indica en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (context_length del LLM) |
| Tipos de cuantizacion | no disponible (entrenamiento en fp16; no se documentan cuantizaciones del checkpoint) |
| Idiomas soportados | ingles (entrada de voz) e italiano (salida de texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.pt` (PyTorch); el codificador y el LLM se descargan por separado |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema SLAM-LLM: el audio se representa como filterbanks de 80 dimensiones con CMVN y se procesa con el codificador FAMA (dimension de salida 1024). Un proyector lineal con reduccion de secuencia (`encoder_projector_ds_rate=2`) transforma esa salida mediante dos capas (2048→2048 con ReLU, y 2048→2560) hasta la dimension del LLM (2560). El proyector se inicializa desde el checkpoint MEUSLI v2 para Villanova-2B; como MEUSLI se entrenó con Whisper large-v3-turbo y su primera capa no coincide con el tamano de salida de FAMA, esa capa se reinicializa y el resto se carga. El LLM Villanova-2B se adapta con LoRA (r=32, alpha=32, dropout=0,05) sobre `q_proj` y `v_proj`. Codificador y LLM permanecen congelados; solo se entrenan proyector y adaptadores.

El entrenamiento usa audio ingles de VoxPopuli con objetivos en italiano generados traduciendo las transcripciones inglesas con EuroLLM-1.7B-Instruct. Se ejecutó con `torchrun` en una única GPU NVIDIA A100 de 64 GB (particion Booster de CINECA Leonardo), con 4 epocas, AdamW (weight decay 0), learning rate 1e-4 con warmup lineal de 1000 pasos, batch de 2 con acumulacion de 2, fp16 activado y `total_steps=1000000` (el LR se mantiene cercano a 1e-4 durante toda la ejecucion). Los objetivos de entrenamiento estan en minusculas. El prompt de entrenamiento e inferencia es `"Translate English speech to Italian text. "`, incluyendo el espacio final, que debe conservarse. La decodificacion emplea busqueda por haces con 4 haces y un maximo de 200 tokens nuevos.

## Capacidades

- Traduccion de voz a texto en la direccion ingles → italiano, con un prompt fijo de instruccion.
- Procesamiento de audio como entrada (filterbanks de 80 dimensiones), no de texto.
- Generacion de texto en italiano en minusculas, coherente con el formato de entrenamiento.
- Ajuste fino adicional: el checkpoint puede reutilizarse para seguir entrenando con los scripts del repositorio Villanova-Speech-LLM.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de salida ni modo thinking.
- Capacidad multilingue limitada a los dos idiomas del par de traduccion (ingles e italiano); no disponible para otros pares.

## Casos de uso

- Traduccion de subtitulos y transcripciones de contenido audiovisual en ingles a italiano: el modelo recibe el audio y genera la traduccion textual, adecuado para flujos de localizacion de videos y podcasts con habla inglesa.
- Generacion de subtitulos para reuniones y webinars en ingles dirigidos a audiencias italianas: el pipeline puede transcribir y traducir en una sola etapa sin pasar por un sistema de ASR y traduccion de texto separados.
- Prototipado de asistentes de voz bilingues: sirve como modulo de traduccion dentro de un asistente que atienda a usuarios italianos con interlocutores en ingles.
- Investigacion en traduccion de voz: el checkpoint permite reproducir y extender el resultado de referencia sobre VoxPopuli (BLEU 57,75) con la misma configuracion de SLAM-LLM.
- Base para ajuste fino en dominios especificos: al entrenar solo 14,16 M de parametros sobre componentes congelados, es viable adaptar el sistema a jerga medica, legal o tecnica con recursos limitados.
- Evaluacion comparativa de proyectores y adaptadores LoRA: el diseno modular (proyector inicializado desde MEUSLI, LoRA sobre q_proj y v_proj) facilita experimentos controlados sobre cada componente.
- Despliegue en entornos con memoria limitada para el ajuste: como el entrenamiento solo actualiza proyector y LoRA, el coste de adaptacion es mucho menor que el de un ajuste completo del LLM.

## Benchmarks y rendimiento

| Conjunto de prueba | Metrica | Resultado |
|---|---|---|
| VoxPopuli ingles → italiano (test) | BLEU | 57,75 |

El BLEU se calcula sobre texto normalizado y con decodificacion por busqueda de haces de tamano 4. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

## Requisitos de hardware

- El checkpoint entrenado ocupa 0,1 GB, pero la inferencia requiere cargar ademas FAMA y Villanova-2B completos; la VRAM total depende de esos componentes y no se detalla en la informacion disponible.
- Entrenamiento documentado en una unica NVIDIA A100 de 64 GB (CINECA Leonardo Booster); no se documentan requisitos para GPUs de consumo.
- No se especifica si el sistema completo cabe en GPUs de consumo (RTX 4090, etc.); no disponible.
- Opciones de despliegue: los scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM) con `torchrun`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- La decodificacion usa busqueda por haces con 4 haces y hasta 200 tokens nuevos, lo que incrementa el coste frente a decodificacion greedy.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento, parametros totales ni contexto de modelos comparables de traduccion de voz ingles-italiano. La comparacion cuantitativa no esta disponible.

| Modelo | Parametros entrenados | Contexto | BLEU (VoxPopuli en→it) | Licencia |
|---|---|---|---|---|
| speechllm_fama_meusli_villanova_st_en2it_v1 | 14,16 M (proyector + LoRA) | 4096 | 57,75 | CC BY 4.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La decodificacion no incluye proteccion contra repeticiones: algunas locuciones pueden entrar en bucle hasta el limite de 200 tokens, y en datos fuera de dominio afecta a mas casos. Se recomienda anadir `no_repeat_ngram_size`, una `repetition_penalty` moderada o un limite de longitud ligado al audio.
- Las referencias de traduccion, tanto de entrenamiento como de prueba, fueron generadas con EuroLLM-1.7B-Instruct y no por traductores humanos; el BLEU mide la coincidencia con esas referencias, no la calidad frente a traduccion humana.
- Se realizo una unica ejecucion de entrenamiento por configuracion; diferencias inferiores a 0,5 WER/BLEU estan dentro de la variacion entre ejecuciones.
- El modelo solo cubre la direccion ingles → italiano; no se documenta traduccion inversa ni otros pares.
- El prompt de inferencia debe ser exactamente `"Translate English speech to Italian text. "`, con el espacio final; variaciones pueden degradar la salida.
- Los objetivos se entrenaron en minusculas, lo que puede afectar a la capitalizacion de la salida en produccion.
- Licencia CC BY 4.0: permite uso comercial con atribucion; deben respetarse tambien las licencias de los modelos base (FAMA, Villanova-2B y el proyector MEUSLI), que no se detallan en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados especificamente; al depender de un LLM generativo, la salida puede desviarse del contenido del audio.
- El repositorio solo contiene proyector y LoRA; un uso incorrecto sin los modelos base en `models/` impedira la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_st_en2it_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- Modelo de lenguaje Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Codigo (fork de SLAM-LLM): https://github.com/vskadandale/Villanova-Speech-LLM
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/voxpopuli
- Paper de SLAM-LLM: referencia en la model card (Ma et al., 2026); URL no disponible en la informacion proporcionada.
- Paper de MEUSLI: citado en la model card; URL no disponible en la informacion proporcionada.
