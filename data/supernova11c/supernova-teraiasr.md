# Supernova11c/Supernova-TeraiASR

## Resumen

Supernova TeraiASR v0.2 es un modelo experimental de reconocimiento automatico de voz (ASR) para nepali, desarrollado por el usuario Supernova11c y publicado en Hugging Face. Se trata de un proyecto de investigacion a nivel de caracter que combina un pipeline CNN/BiLSTM con perdida CTC, implementado en PyTorch. El modelo procesa audio a 16 kHz representado como espectrogramas log-mel de 80 bandas.

El problema que aborda es la escasez de sistemas de ASR para nepali, una lengua de bajos recursos en el ecosistema de modelos de voz. Sin embargo, las metricas publicadas por el propio autor (CER del 45,35 % y WER del 92,17 % sobre 701 muestras de test) indican que el modelo comete errores sustanciales y no es apto para produccion.

Su relevancia actual es principalmente educativa y de investigacion: sirve como punto de partida documentado para quien quiera desarrollar ASR para nepali, aunque requiere el notebook de entrenamiento original para reproducir el preprocesamiento y la decodificacion. No se ha especificado el numero de parametros, la longitud de contexto ni otros detalles arquitectonicos concretos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN/BiLSTM con perdida CTC (estilo CTC) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de audio, aplicable a secuencias de audio a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepali (ne) |
| Licencia | supernova-horizon (other, sujeta a verificacion de compatibilidad) |
| Formato de pesos | PyTorch (`model_state_dict.pt`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline clasico de ASR a nivel de caracter: caracteristicas de audio de 80 bins log-mel extraidas de senales a 16 kHz, una etapa convolucional seguida de una red BiLSTM y decodificacion CTC. La model card describe la arquitectura como "CNN/BiLSTM/CTC-style", sin detallar el numero de capas, unidades ocultas ni parametros totales. El repositorio incluye el diccionario de estado de PyTorch, el vocabulario caracter-a-ID (`vocab.json`) y metadatos de configuracion.

No se ha publicado informacion sobre el dataset de entrenamiento (numero de horas de audio, composicion, procedencia) ni sobre el proceso de optimizacion. Los unicos datos de entrenamiento disponibles son la mejor perdida de validacion reportada (1,6994) y las metricas de test. No hay indicios de tecnicas modernas como preentrenamiento autosupervisado, decodificacion con modelo de lenguaje o data augmentation; el propio autor senala que la inferencia correcta requiere reproducir exactamente la extraccion de caracteristicas, el calculo de longitudes de salida y el comportamiento de decodificacion CTC usados en el entrenamiento, probablemente mediante el notebook de entrenamiento correspondiente.

## Capacidades

- Transcripcion de voz en nepali a nivel de caracter (sin tokenizacion subword ni modelado de palabras).
- Procesamiento de audio muestreado a 16 kHz mediante espectrogramas log-mel de 80 bandas.
- Decodificacion CTC sobre un vocabulario de caracteres definido en `vocab.json`.
- No soporta tool calling, function calling ni escenarios de agentes: es un modelo de ASR puro.
- No ofrece capacidades multilingues: esta restringido al nepali segun los tags del repositorio.
- No incluye vision, audio generativo ni modo de razonamiento; su unica funcion es la transcripcion experimental.
- El checkpoint por si solo no constituye un pipeline de inferencia completo: requiere el codigo de preprocesamiento y decodificacion original.

## Casos de uso

- Investigacion en ASR de lenguas de bajos recursos: sirve como baseline documentado sobre el que aplicar mejoras (modelos autosupervisados como wav2vec 2.0, data augmentation con SpecAugment, modelos de lenguaje para rescoring), dado que las metricas de partida estan publicadas.
- Docencia y aprendizaje de ASR: el pipeline CNN/BiLSTM/CTC a nivel de caracter es un ejemplo didactico clasico, util para practicas de procesamiento de voz en cursos de machine learning.
- Desarrollo de vocabularios y tokenizacion para nepali: el fichero `vocab.json` con el mapeo caracter-a-ID puede reutilizarse en otros experimentos de ASR o TTS para nepali.
- Comparacion de arquitecturas: permite medir la mejora de alternativas modernas (Conformer, Whisper fine-tuned) frente a un enfoque BiLSTM-CTC clasico usando el mismo conjunto de test de 701 muestras.
- Prototipado de transcripcion para nepali en entornos controlados: util unicamente como prueba de concepto, nunca para transcripcion real, dado el WER del 92,17 %.
- Punto de partida para empaquetado de pipelines: el ejercicio de reconstruir el preprocesamiento y la decodificacion CTC a partir del checkpoint es en si un caso de uso de ingenieria de reproducibilidad.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Metrica | Resultado |
|---|---:|
| Mejor perdida de validacion | 1,6994 |
| CER en test | 45,35 % |
| WER en test | 92,17 % |
| Muestras de test | 701 |
| CER (diagnostico posterior a nivel de caracter) | 45,33 % |

No se han publicado comparaciones con otros modelos (Whisper, wav2vec 2.0, etc.) en la informacion disponible. Las diferencias menores entre ambas mediciones de CER se atribuyen a la normalizacion y a la implementacion de la evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse el numero de parametros, no puede estimarse con fiabilidad. Un modelo CNN/BiLSTM de este tipo suele ser ligero, pero no es un dato verificado.
- GPU recomendadas: no disponible. Dado el tamano reducido del repositorio (0,0 GB segun Hugging Face) y la naturaleza experimental, es plausible que funcione en hardware de consumo o incluso CPU, pero no es un dato confirmado.
- Consumer GPU: no disponible como dato verificado; el tamano del repositorio sugiere que no se necesitan aceleradores de gama alta.
- Opciones de despliegue: no compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI (ninguno de estos soporta este formato de checkpoint CTC en PyTorch). Requiere PyTorch y el codigo de modelo y preprocesamiento original (`model_class_source.py` y el notebook de entrenamiento).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Idioma | Arquitectura | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Supernova TeraiASR v0.2 | ASR | nepali | CNN/BiLSTM/CTC | CER 45,35 % / WER 92,17 % | supernova-horizon (other) | Hugging Face, experimental |
| OpenAI Whisper (large-v3) | ASR | multilingue (incluye nepali) | Transformer encoder-decoder | WER sustancialmente inferior en nepali segun evaluaciones publicadas por OpenAI y terceros | MIT | Hugging Face, Ollama, vLLM, etc. |
| facebook/wav2vec2-xls-r-300m (fine-tuned) | ASR | multilingue / ajustable a nepali | Transformer autosupervisado + CTC | No disponible para nepali en la informacion proporcionada | MIT / Apache-2.0 segun variante | Hugging Face |
| google/ulysses-TTS o ASR de nepali especificos | ASR | nepali | no disponible | no disponible | no disponible | no disponible |

En resumen: frente a Whisper, TeraiASR es orders of magnitude menos preciso y carece de pipeline de inferencia empaquetado, pero su valor esta en ser un experimento abierto y ligero especifico de nepali.

## Limitaciones y advertencias

- Tasas de error muy altas: CER del 45,35 % y WER del 92,17 %; el modelo omite caracteres y palabras con frecuencia y no es util para transcripcion real.
- El propio autor lo declara explicitamente experimental y no apto para produccion ni para contextos de seguridad critica.
- El checkpoint no es autocontenido: la inferencia correcta exige reproducir exactamente la extraccion de caracteristicas (16 kHz, 80 bins log-mel), el layout de tensores, el calculo de longitudes de salida y la decodificacion CTC del entrenamiento, lo que requiere el notebook de entrenamiento original.
- No validado en condiciones reales (ruido, acentos, microfonia variada); las metricas provienen de un conjunto de test de solo 701 muestras.
- Restringido al nepali; no hay soporte multilingue declarado.
- Riesgo de alucinacion/omision: inherente a la decodificacion CTC con un modelo poco entrenado, pueden aparecer secuencias vacias o repetitivas.
- Licencia supernova-horizon de tipo "other": el autor advierte que debe verificarse la compatibilidad de codigo, artefactos derivados de datos y materiales incluidos con dicha licencia; los terminos del dataset de entrenamiento pueden diferir de los del repositorio. El uso comercial requiere revision legal previa.
- Descargas muy bajas (40) y ausencia de comunidad activa: escaso soporte, documentacion limitada y sin issues o discusiones conocidas.
- No hay datos sobre sesgos del modelo, aunque la procedencia y composicion del dataset de entrenamiento no estan documentadas, lo que impide evaluar representatividad dialectal (nepali tiene fuerte variacion regional).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Supernova11c/Supernova-TeraiASR
- Licencia del modelo: https://huggingface.co/Supernova11c/Supernova-TeraiASR/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/Supernova11c
- Paper, blog, demo o repositorio externo: no disponible
