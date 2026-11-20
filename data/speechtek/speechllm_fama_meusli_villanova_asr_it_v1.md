# SpeechTek/speechllm_fama_meusli_villanova_asr_it_v1

## Resumen

SpeechTek/speechllm_fama_meusli_villanova_asr_it_v1 es un modelo de reconocimiento automatico del habla (ASR) para italiano construido sobre el framework SLAM-LLM. Lo desarrolla la unidad SpeechTek de la Fondazione Bruno Kessler (FBK) y combina tres piezas: el codificador de voz FAMA (FBK-MT/fama-medium-asr), un proyector lineal inicializado desde el proyector MEUSLI para Villanova-2B y el modelo de lenguaje Villanova-2B adaptado con LoRA. El repositorio solo contiene los 14,16 millones de parametros entrenados (proyector de 9,44 M y adaptadores LoRA de 4,72 M); el codificador y el LLM se descargan por separado.

El modelo resuelve la transcripcion de voz a texto en italiano mediante un esquema speechLLM: el audio se convierte en caracteristicas filterbank de 80 dimensiones, el codificador FAMA las procesa y el proyector las mapea al espacio del LLM, que genera la transcripcion guiado por el prompt fijo "Transcribe Italian speech to text.". La innovacion practica es el bajo coste de entrenamiento: al congelar codificador y LLM y entrenar solo proyector y LoRA, se ajusta un sistema ASR completo con una fraccion minima de parametros.

Es relevante ahora porque demuestra que un ASR competitivo en italiano se puede obtener reutilizando componentes abiertos (FAMA, Villanova-2B, MEUSLI) con un entrenamiento ligero sobre Common Voice 17.0, alcanzando un WER del 7,56 % en el conjunto de test. El checkpoint esta pensado para decodificacion o ajuste fino posterior mediante los scripts del repositorio Villanova-Speech-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM (codificador FAMA + proyector lineal + LLM Villanova-2B con LoRA), framework SLAM-LLM |
| Parametros totales | 14,16 M entrenados en el repositorio (9,44 M proyector + 4,72 M LoRA); el total del sistema incluye FAMA y Villanova-2B, no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (context_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`); el resto de componentes se descargan por separado |

## Arquitectura y entrenamiento

La arquitectura sigue el patron speechLLM de SLAM-LLM: un codificador de voz FAMA congelado que recibe filterbank de 80 dimensiones con CMVN, un proyector lineal compuesto por Linear 2048→2048, ReLU y Linear 2048→2560 (con factor de submuestreo 2), y el LLM Villanova-2B congelado de dimension 2560. El proyector se inicializa desde SpeechTek/MEUSLI_projector_v2_Villanova_2B; como MEUSLI se entreno con Whisper large-v3-turbo y su primera capa no coincide con la salida de FAMA, esa capa se reinicializa y el resto se carga. Sobre el LLM se aplican adaptadores LoRA con r=32, alpha=32, dropout 0,05 y modulos objetivo q_proj y v_proj. El codificador tiene dimension 1024.

El entrenamiento usa Common Voice 17.0 en italiano: 169.771 enunciados de entrenamiento (unas 250 h), 15.149 de validacion y 15.155 de test. Se ejecuto con torchrun en una unica GPU NVIDIA A100 de 64 GB en la particion Booster de CINECA Leonardo, usando el fork Villanova-Speech-LLM de SLAM-LLM. Se entrenan todos los parametros del proyector y de los adaptadores LoRA mientras codificador y LLM permanecen congelados; los objetivos de entrenamiento estan en minusculas. El learning rate hace warmup lineal durante 1.000 pasos y luego decae linealmente hacia cero en total_steps; con 1.000.000 de pasos totales se mantiene cerca de 1e-4 durante toda la ejecucion. Hiperparametros clave: AdamW con weight_decay 0, batch de 4, 4 epocas, fp16 activado, DDP activado y FSDP desactivado. La decodificacion usa busqueda por haces con 4 haces, maximo 200 tokens nuevos y repetition_penalty 1.0.

## Capacidades

- Reconocimiento automatico del habla (ASR) monolingue en italiano a partir de audio.
- Transcripcion guiada por prompt fijo: "Transcribe Italian speech to text.".
- Salida en minusculas, coherente con el formato de entrenamiento.
- Ajuste fino posterior posible sobre el checkpoint (proyector y LoRA) con los scripts del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision ni audio mas alla del ASR.
- No se documenta modo thinking ni capacidades multimodales adicionales.

## Casos de uso

- Transcripcion de audio italiano en produccion: el modelo convierte voz en texto con un WER del 7,56 % en Common Voice 17.0 italiano, adecuado para subtitulado y actas de reuniones en ese idioma.
- Generacion de subtitulos para contenido audiovisual italiano: el pipeline toma el audio, aplica el codificador FAMA y el LLM genera la transcripcion; conviene anadir control de repeticiones en decodificacion para evitar bucles en segmentos fuera de dominio.
- Ajuste fino sobre dominios especificos: al entrenar solo proyector y LoRA, se puede adaptar a jerga sectorial (legal, medico, tecnico) con coste computacional reducido y manteniendo congelados los modelos base.
- Investigacion en speechLLM: sirve como referencia reproducible para estudiar la inicializacion de proyectores (MEUSLI) y la adaptacion LoRA sobre LLMs congelados en tareas de voz.
- Prototipado rapido de asistentes de voz en italiano: el checkpoint ligero (0,1 GB de repositorio) se integra en experimentos sin necesidad de reentrenar el sistema completo.
- Evaluacion comparativa de ASR italiano: util como linea base frente a sistemas clasicos o end-to-end, dado que publica WER con normalizacion explicita (BasicTextNormalizer) y decodificacion por haces documentada.

## Benchmarks y rendimiento

| Conjunto de test | Metrica | Resultado |
|---|---|---|
| Common Voice 17.0 Italian (test) | WER % | 7,56 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones numericas con modelos alternativos. El WER se calcula tras eliminar puntuacion y aplicar BasicTextNormalizer para italiano, con decodificacion por busqueda de haces de tamano 4.

## Requisitos de hardware

- El repositorio del checkpoint ocupa 0,1 GB (solo proyector y LoRA); el sistema completo requiere ademas descargar FAMA y Villanova-2B.
- El entrenamiento se realizo en una unica NVIDIA A100 de 64 GB (CINECA Leonardo Booster), con fp16 y batch de 4.
- VRAM de inferencia estimada: no disponible en la informacion proporcionada; depende del tamano de FAMA y Villanova-2B y del tipo de cuantizacion, no documentada.
- GPU recomendadas: no disponible de forma explicita; el unico dato documentado es la A100 de 64 GB usada para entrenar.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (por ejemplo, otros ASR italianos o speechLLM de tamano similar), por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, el modelo se apoya en FAMA (codificador ASR de FBK) y Villanova-2B (LLM), pero no se aportan cifras de rendimiento de esos componentes en esta ficha.

| Modelo | Parametros | Contexto | WER (CV17 it) | Licencia |
|---|---|---|---|---|
| speechllm_fama_meusli_villanova_asr_it_v1 | 14,16 M entrenados (sistema completo no disponible) | 4096 | 7,56 % | CC BY 4.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La decodificacion no tiene guarda de repeticion: algunos enunciados por conjunto de test pueden entrar en bucle hasta el limite de 200 tokens; en datos fuera de dominio afecta a mas enunciados. Se recomienda anadir no_repeat_ngram_size, un repetition_penalty moderado o un limite de longitud ligado al audio.
- Los resultados provienen de una unica ejecucion por configuracion; diferencias inferiores a 0,5 de WER/BLEU estan dentro de la variacion entre ejecuciones.
- Modelo monolingue: solo italiano; no se documenta soporte de otros idiomas.
- Salida en minusculas por diseno de entrenamiento; puede requerir postprocesado para mayusculas y puntuacion.
- Riesgo de alucinacion y de transcripciones incorrectas en audio ruidoso o fuera del dominio de Common Voice; no se documentan evaluaciones en otros dominios.
- Sesgos: no se documentan analisis de sesgo; al entrenar con Common Voice, hereda los sesgos de composicion de ese corpus.
- Licencia CC BY 4.0: permite uso comercial con atribucion; deben respetarse tambien las licencias de los componentes base (FAMA, Villanova-2B, MEUSLI), no detalladas aqui.
- El repositorio no es autocontenido: requiere descargar y cargar FAMA, Villanova-2B y el checkpoint MEUSLI antes de este checkpoint.
- No se documentan cuantizaciones ni despliegue en GPU de consumo, lo que limita la planificacion de produccion sin pruebas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechTek/speechllm_fama_meusli_villanova_asr_it_v1
- Codificador FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- Modelo de lenguaje Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Repositorio de codigo Villanova-Speech-LLM: https://github.com/vskadandale/Villanova-Speech-LLM
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
