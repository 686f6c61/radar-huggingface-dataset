# WannaGoTech/WannaMedASR

## Resumen

WannaMedASR (v2) es un modelo de reconocimiento automático de voz (ASR) especializado en dictado clínico y radiológico en francés, desarrollado por WannaGoTech para su suite WannaMed. El modelo se presenta como un sistema de transcripción de dominio médico que busca resolver un problema concreto: los errores de una sola letra o de un prefijo cambian el significado diagnóstico en un informe (*hypoéchogène* frente a *hyperéchogène*, *hématome sous-dural* frente a *épidural*, *milligrammes* frente a *microgrammes*), por lo que los ASR generalistas no serían suficientes en un entorno hospitalario.

Según la model card, el modelo se ha construido mediante adaptación LoRA en tres etapas sobre un modelo base genérico de aproximadamente 1.700 millones de parámetros, y se ha entrenado con 36.057 informes clínicos y radiológicos verificados (137.267 frases únicas sobre 9 modalidades de imagen), 289 grabaciones de voz clínica etiquetadas como Gold (WAV PCM 16 bits, 16 kHz), 13.219 términos del léxico Dragon Médical y consolidación sobre siete repertorios médicos francófonos públicos.

La relevancia actual del modelo reside en su especialización vertical y en las cifras declaradas por el autor (0,48 % CER y 0,82 % WER en dictado clínico), que sitúan al modelo muy por encima de Whisper Large-v3-Turbo en ese dominio concreto según su propia comparativa. Estas cifras no están verificadas de forma independiente (`verified: false` en el model-index), los pesos no son de descarga libre (requieren solicitud de licencia) y el repositorio de HuggingFace no contiene los pesos (0,0 GB), por lo que cualquier evaluación debe tomarse como punto de partida y no como resultado consolidado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La model card indica adaptación LoRA en tres etapas sobre un modelo base genérico; la arquitectura del backbone (transformer encoder-decoder tipo Whisper u otra) no se especifica |
| Parametros totales | No disponible de forma explícita. La comparativa del autor referencia un "Modèle 1.7B Générique" como base de comparación |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible. El modelo procesa audio a 16 kHz; no se publica ventana máxima de audio ni de tokens |
| Tipos de cuantizacion | INT8 mediante OpenVINO, según el Space de demostración (OpenVINO INT8 + 196 matrices LoRA fusionadas). No se documentan GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Francés (`fr`) exclusivamente, con vocabulario clínico y radiológico francófono |
| Licencia | `other` (licencia personalizada; el acceso a los pesos se solicita en contact@wannamed.com) |
| Formato de pesos | No disponible. El repositorio de HuggingFace tiene 0,0 GB; la demo usa un backend FastAPI con OpenVINO INT8 en contenedor Docker |

## Arquitectura y entrenamiento

La información publicada describe un proceso de ajuste, no una arquitectura completa. El modelo se construye con un esquema de LoRA en tres etapas ("3-Stage LoRA") sobre un modelo base genérico, con 196 matrices LoRA que se fusionan en el despliegue para producir un artefacto de inferencia optimizado. La librería declarada es `transformers`, con pipeline `automatic-speech-recognition`, y la demo del Space indica una ruta de ejecución con OpenVINO en INT8 y un backend FastAPI con streaming de transcripción token a token. No se detalla si el backbone es un encoder-decoder tipo Whisper, un CTC, un RNN-T o un híbrido, ni se publican el número de capas, la dimensión oculta o el mecanismo de atención.

En cuanto a datos, la model card declara 36.057 informes clínicos y radiológicos verificados sin errores (137.267 frases únicas sobre 9 modalidades de imagen), 289 grabaciones de voz clínica Gold en WAV PCM de 16 bits a 16 kHz, 13.219 términos del léxico Dragon Médical y consolidación sobre siete repertorios médicos francófonos públicos: AWANNABY SNOMED CT 1000, Olicorne UltiMed (41.744 correcciones), PxCorpus (registro Zenodo 6524162), MultiMed, RNTC Quaero/CIM-10 y Doctolib-Lab FineMed-FR. No se indica el número total de horas de audio, la composición exacta del corpus, ni si hubo etapas de RLHF, DPO o corrección humana adicional más allá de las 289 grabaciones Gold. La evaluación se plantea sobre conjuntos hold-out declarados con 0 % de fuga de datos, si bien el protocolo completo no se detalla en la información disponible.

## Capacidades

- Transcripción de voz a texto en francés para dictado clínico y radiológico, con énfasis en terminología médica y farmacológica.
- Reconocimiento de vocabulario especializado: modalidades de imagen (TDM, IRM, ecografía), medidas, dosis y unidades (miligramos frente a microgramos), lateralidad y prefijos diagnósticos.
- Procesamiento de audio a 16 kHz sin pérdida, según la descripción de la barra de dictado de la suite WannaMed.
- Streaming en tiempo real: el Space documenta un backend FastAPI con streaming token a token sobre audio subido o micrófono.
- Cobertura declarada de 9 modalidades de imagen en el benchmark interno de 36.057 informes.
- Alineación con terminología SNOMED CT y CIM-10 a través de los repertorios usados en el entrenamiento (no se documenta una salida estructurada codificada).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio generation ni modo "thinking": es un modelo ASR puro.
- Multilingüismo: no disponible; el modelo está etiquetado únicamente como `fr`.

## Casos de uso

- Dictado de informes radiológicos: el modelo transcribe la voz del radiólogo a texto con vocabulario específico de modalidad (TDM, IRM, ecografía), lo que permite reducir la corrección manual posterior en informes de imagen.
- Transcripción de consultas hospitalarias: sesiones clínicas multi-turno en francés donde la fidelidad de términos diagnósticos y de dosificación es crítica para el historial del paciente.
- Documentación de urgencias y unidades de cuidados intensivos: dictado rápido con términos como *hématome sous-dural* o *artère cérébrale moyenne droite*, donde un error de una letra altera el diagnóstico.
- Integración en un HIS/EMR: el backend FastAPI con streaming del Space permite insertar la transcripción en formularios clínicos conforme se habla, sin esperar al final de la grabación.
- Codificación clínica asistida: la alineación con SNOMED CT y CIM-10 declarada en el entrenamiento facilita el paso de texto libre a códigos, siempre con revisión humana.
- Evaluación comparativa de ASR médico: útil como referencia en proyectos de investigación que comparen modelos generalistas (Whisper) frente a especializados en francés clínico.
- Despliegue en puesto de trabajo sin GPU dedicada: la ruta OpenVINO INT8 documentada en el Space abre la puerta a inferencia en CPU en equipos hospitalarios, sujeta a validación de latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false` en el model-index). Los valores se expresan en porcentaje, tal como los publica la model card.

| Benchmark (hold-out) | CER | WER | Precisión declarada | Verificado |
|---|---|---|---|---|
| Clinical Dictation Gold Hold-Out (FR, 0 % fuga) | 0,48 % | 0,82 % | 99,52 % / 99,18 % | No |
| 9-Modality Clinical & Radiology Unseen Hold-Out (36.057 informes) | 0,41 % | 0,74 % | 99,59 % | No |
| Public Medical Suite Hold-Out (AWANNABY SNOMED CT + PxCorpus) | 0,56 % | 0,89 % | 99,44 % | No |

Comparativa declarada por el autor frente a su versión anterior y a modelos generalistas:

| Modelo | CER dictado Gold | WER dictado Gold | CER 9 modalidades | WER trampas públicas |
|---|---|---|---|---|
| WannaMedASR v2 | 0,48 % | 0,82 % | 0,41 % | 0,89 % |
| WannaMedASR v1 | 1,78 % | 7,14 % | 2,26 % | 8,22 % |
| Base genérico 1.7B | 4,14 % | 15,13 % | 3,84 % | 22,37 % |
| Whisper Large-v3-Turbo | 14,90 % | 31,09 % | 15,86 % | 24,34 % |

Advertencia: no se han publicado resultados de benchmarks independientes en la información disponible. Las cifras de Whisper Large-v3-Turbo corresponden a la medición del propio autor sobre sus conjuntos hold-out, no a los valores oficiales del modelo de OpenAI.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia aritmética, un backbone de ~1,7 B parámetros ocuparía en torno a 3,4 GB en FP16 y ~1,7 GB en INT8 solo en pesos; a ello hay que sumar buffers de audio y el grafo de decodificación, por lo que un presupuesto de 6–8 GB en FP16 es una estimación razonable, no un dato del autor.
- GPU recomendadas: no disponibles. Por tamaño, una RTX 4090, L40S, A100 o H100 serían sobradas para inferencia en FP16; una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB deberían cubrir el modelo con holgura según la estimación anterior.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas de 8 GB o más con cuantización INT8 (estimación, no confirmada por el autor).
- Despliegue: `transformers` (librería declarada), OpenVINO INT8 con 196 matrices LoRA fusionadas y backend FastAPI con streaming (documentado en el Space), y contenedor Docker como opción de despliegue. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; al ser un modelo ASR y no un LLM de decodificación de texto, estas herramientas no son directamente aplicables.
- Latencia y throughput: no disponibles. El Space promete transcripción en tiempo real, sin cifras de RTF, latencia por segmento ni audio procesado por segundo.
- Requisito de acceso: los pesos no son de descarga libre; hay que solicitar licencia a contact@wannamed.com, lo que condiciona cualquier prueba de hardware antes de obtenerlos.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WannaMedASR v2 | ASR médico francés | No disponible (base ~1,7 B según comparativa) | No disponible; audio 16 kHz | `other`, acceso bajo solicitud | Pesos no alojados en HF (repo 0,0 GB) |
| Whisper Large-v3-Turbo | ASR multilingüe generalista | ≈809 M (dato público del modelo original) | Ventanas de 30 s | MIT (modelo original) | Pesos abiertos en HuggingFace |
| WannaMedASR v1 | ASR médico francés (versión previa) | No disponible | No disponible | `other` | No disponible en la información |
| Base genérico 1.7B citado por el autor | ASR generalista | ~1,7 B | No disponible | No disponible | No identificado en la información |

No se dispone de datos sobre otros ASR médicos francófonos comparables (por ejemplo, variantes clínicas de Whisper o modelos de transcripción médica de otros proveedores) en la información proporcionada.

## Limitaciones y advertencias

- Resultados no verificados: los tres conjuntos de benchmarks del model-index están marcados con `verified: false` y proceden del propio autor; no hay evaluación de terceros ni réplica del protocolo.
- Magnitud atípica de las métricas: un CER del 0,48 % en dictado médico es un valor extraordinariamente bajo para ASR en dominio clínico; conviene contrastarlo con los conjuntos exactos, la segmentación y las normas de normalización de texto (el autor cita la norma `jiwer`/Levenshtein) antes de asumirlo en producción.
- Pesos no disponibles públicamente: el repositorio tiene 0,0 GB y la licencia es `other` con solicitud por correo, lo que impide reproducir, auditar o comparar el modelo sin acuerdo previo. Restricciones de uso comercial no detalladas.
- Idioma único: solo francés. No hay soporte documentado de español ni de otras lenguas, ni code-switching.
- Dominio acotado: dictado clínico y radiológico; el rendimiento fuera de ese registro (conversación espontánea, acentos regionales, ruido de sala, audio telefónico de 8 kHz) no está documentado.
- Riesgo de alucinación en ASR: como todo sistema seq2seq, puede generar inserciones o texto plausible en tramos de silencio o ruido, un fallo especialmente peligroso en informes clínicos si no hay revisión humana.
- Sesgos: no se publica análisis de sesgo por sexo, edad, acento, origen dialectal ni tipo de voz; el corpus Gold de 289 grabaciones es reducido para estimar robustez demográfica.
- Trazabilidad de datos: parte del entrenamiento se basa en repertorios públicos de terceros (MultiMed, PxCorpus, SNOMED CT, CIM-10) cuyas condiciones de uso pueden imponer restricciones adicionales sobre el modelo derivado.
- Inconsistencias de publicación: la fecha de creación del repositorio (27/10/2026) es posterior a la fecha actual y el repositorio no contiene artefactos, lo que sugiere un despliegue aún incompleto o una ficha en revisión.
- Sin datos de latencia, throughput ni consumo, no es posible dimensionar un despliegue hospitalario real a partir de la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WannaGoTech/WannaMedASR
- Space de demostración: https://huggingface.co/spaces/WannaGoTech/WannaMedASR
- Árbol de ficheros del Space: https://huggingface.co/spaces/WannaGoTech/WannaMedASR/tree/main
- Página oficial del producto: https://wannamed.com/asr/
- Empresa desarrolladora: https://wannago.tech/
- Contacto para licencia y acceso a pesos: contact@wannamed.com
- Dataset de benchmark declarado: https://huggingface.co/datasets/WannaGoTech/WannaMedASR-French-Clinical-Benchmark
- Dataset MultiMed: https://huggingface.co/datasets/leduckhai/MultiMed
- Dataset AWANNABY de transcripción médica francesa: https://huggingface.co/datasets/AWANNABY/French-Medical-Transcription-Benchmark
- PxCorpus (registro Zenodo 6524162): referencia citada en la model card, sin URL confirmada en la información disponible
- Artículo técnico o paper: no disponible en la información proporcionada
