# TeamUNIVA/qwen3_asr_1.7b_ko

## Resumen

TeamUNIVA/qwen3_asr_1.7b_ko es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-ASR-1.7B de Alibaba, especializado en reconocimiento automático del habla (ASR) para coreano. Lo desarrolla TeamUNIVA y se presenta como la version estable y sucesora del modelo beta `qwen3_asr_1.7b_ko_beta`. El modelo parte de los pesos del beta y se entrena con dos rondas de SFT (supervised fine-tuning) seguidas de aprendizaje por refuerzo con GSPO sobre un conjunto de datos ampliado.

El modelo resuelve el problema de la transcripcion de voz en coreano con alta precision, un idioma con morfologia aglutinante, abundantes homofonos y variacion en la notacion de numeros y acronimos que complica las metricas tradicionales. Con 2.349 millones de parametros (aproximadamente 2,35 mil millones), se posiciona en la gama de modelos ASR de tamano medio que pueden desplegarse en infraestructura razonable sin renunciar a calidad.

Su relevancia actual radica en que mejora de forma consistente tanto al modelo base como al beta en los cinco benchmarks coreanos evaluados, con una reduccion agregada de 2,03 puntos porcentuales de CER (Character Error Rate) respecto al base, a costa de una degradacion minima en ingles (+0,27 puntos de WER en LibriSpeech). La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR, arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | 2.349.217.408 (2,35 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko); conserva capacidad residual en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3-ASR-1.7B (si es un transformer encoder-decoder, un modelo de audio integrado en un LLM o una variante hibrida). Lo que si se especifica es el proceso de ajuste: el modelo se inicializa desde `qwen3_asr_1.7b_ko_beta` y se somete a dos rondas de SFT sobre un conjunto de datos de voz en coreano ampliado, seguidas de una fase de aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization). Esta combinacion de SFT iterativo mas RL busca optimizar directamente la tasa de error de caracteres en lugar de solo la verosimilitud de la secuencia.

Un aspecto metodologico destacable es el cuidado en la evaluacion: los conjuntos de benchmark coreanos abiertos fueron revisados manualmente, con transcripciones duales TN/ITN (text normalization / inverse text normalization), filtrado de muestras de baja calidad y correccion de transcripciones erroneas. De los 8.489 registros originales se retuvieron 8.383. Ademas, se evalua cada enunciado contra ambas transcripciones y se toma la de mejor puntuacion, lo que reduce el sesgo de la metrica frente a convenciones de notacion.

## Capacidades

- Reconocimiento automatico del habla en coreano con salida de texto transcrito.
- Manejo de variantes de notacion: numeros (por ejemplo, "3개" frente a "세 개") y acronimos latinos (por ejemplo, "AI" frente a "에이아이"), evaluado explicitamente con la metrica kocer.
- Transcripcion robusta en dominios diversos: llamadas telefonicas (clova_call), voz comunitaria (common_voice_ko), lectura de noticias (fleurs_ko) y habla espontanea (ksponspeech, zeroth).
- Capacidad residual en ingles, con degradacion minima respecto al modelo base (WER de 0,0277 frente a 0,0250 en LibriSpeech).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla del propio ASR, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente: el modelo obtiene un CER de 0,0283 en clova_call, el mejor de la comparativa, lo que lo hace adecuado para generar transcripciones automaticas de centros de contacto en coreano y alimentar analitica de calidad o busqueda sobre conversaciones.
- Subtitulado y actas de reuniones: con CER de 0,0126 en fleurs_ko (habla leida y clara), es apropiado para generar subtitulos o transcripciones de contenido audiovisual y reuniones con audio limpio.
- Dictado y asistentes de voz: la mejora en ksponspeech (CER de 0,0594 frente a 0,0865 del base) lo hace util para interfaces de dictado en coreano en entornos de oficina y productividad.
- Procesamiento de corpus de voz comunitaria: con CER de 0,0603 en common_voice_ko, sirve para transcribir grandes volumenes de audio de voluntarios y construir datasets etiquetados en coreano.
- Analisis de habla espontanea y conversacional: el CER de 0,0220 en zeroth lo hace viable para investigacion linguistica y mineria de opiniones sobre grabaciones conversacionales.
- Sistemas de compliance y auditoria de voz: la transcripcion fiable de llamadas permite busqueda por palabras clave y deteccion de terminos regulatorios en grabaciones, apoyandose en la licencia Apache 2.0 para uso interno y comercial.
- Pipelines bilingues coreano-ingles: aunque el foco es el coreano, la degradacion limitada en ingles permite usarlo en entornos donde ocasionalmente aparecen segmentos en ingles, aceptando un WER algo mayor.

## Benchmarks y rendimiento

Los resultados se miden en CER para coreano y WER para ingles; menor es mejor. La columna "Cambio" es relativa al modelo base.

| Dataset | Metrica | Qwen3-ASR-1.7B (base) | beta | Este modelo | Cambio (%p) |
|---|---|---|---|---|---|
| clova_call | CER | 0,0448 | 0,0293 | 0,0283 | -1,65 |
| common_voice_ko | CER | 0,0719 | 0,0628 | 0,0603 | -1,16 |
| fleurs_ko | CER | 0,0142 | 0,0138 | 0,0126 | -0,16 |
| ksponspeech | CER | 0,0865 | 0,0670 | 0,0594 | -2,71 |
| zeroth | CER | 0,0264 | 0,0230 | 0,0220 | -0,44 |
| **Total coreano** | **CER** | **0,0686** | **0,0537** | **0,0483** | **-2,03** |
| librispeech (ingles) | WER | 0,0250 | 0,0246 | 0,0277 | +0,27 |

Evaluacion adicional con la metrica kocer (no penaliza diferencias de espaciado, puntuacion, notacion numerica ni deletreo de acronimos):

| Dataset | Metrica | Base | beta | Este modelo | Cambio (%p) |
|---|---|---|---|---|---|
| clova_call | CER (kocer) | 0,0429 | 0,0280 | 0,0264 | -1,65 |
| common_voice_ko | CER (kocer) | 0,0718 | 0,0628 | 0,0602 | -1,16 |
| fleurs_ko | CER (kocer) | 0,0127 | 0,0125 | 0,0112 | -0,15 |
| ksponspeech | CER (kocer) | 0,0860 | 0,0664 | 0,0585 | -2,75 |
| zeroth | CER (kocer) | 0,0253 | 0,0202 | 0,0194 | -0,59 |
| **Total coreano** | **CER (kocer)** | **0,0679** | **0,0528** | **0,0472** | **-2,07** |

Con kocer, el total coreano es 0,0481 usando solo transcripciones TN, 0,0491 usando solo ITN y 0,0472 tomando la mejor de las dos, lo que indica baja sensibilidad a la eleccion de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 2,35 mil millones de parametros en precision completa (fp32) ocuparia unos 9,4 GB solo en pesos; en fp16/bf16 unos 4,7 GB (coincide con el tamano del repo), y en cuantizacion de 8 bits alrededor de 2,4 GB. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamano, el modelo deberia caber en GPUs de consumo con al menos 8 GB de VRAM en fp16 y en GPUs profesionales tipo A100 o H100 para despliegue de mayor throughput.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8 GB o mas en fp16, aunque el dato no esta confirmado por el autor.
- Opciones de despliegue: no se documentan en la model card. Al ser un modelo ASR con pesos safetensors, requeriria el stack especifico de Qwen3-ASR (no se detalla si es compatible con vLLM, TGI, llama.cpp u Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER coreano (total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TeamUNIVA/qwen3_asr_1.7b_ko | 2,35 mil millones | no disponible | 0,0483 (0,0472 kocer) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-ASR-1.7B (base) | 1,7 mil millones (segun nombre) | no disponible | 0,0686 (0,0679 kocer) | no disponible en la informacion | Hugging Face |
| TeamUNIVA/qwen3_asr_1.7b_ko_beta | no disponible | no disponible | 0,0537 (0,0528 kocer) | Apache 2.0 (presumible, mismo autor) | Hugging Face |

No se dispone de datos de otros modelos ASR coreanos comparables (por ejemplo, Whisper fine-tuneados) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en coreano; su rendimiento en otros idiomas distintos del ingles no esta documentado y probablemente sea deficiente.
- Degradacion en ingles respecto al base: +0,27 puntos de WER en LibriSpeech (0,0277 frente a 0,0250). No es apto como sustituto generalista bilingue sin evaluacion previa.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes: los benchmarks usados son conjuntos revisados y relativamente controlados; el rendimiento en condiciones reales adversas puede ser peor.
- La metrica CER sobre coreano es sensible a convenciones de espaciado y notacion; el autor mitiga esto con evaluacion dual TN/ITN y con kocer, pero en produccion conviene fijar una convencion de normalizacion coherente con el caso de uso.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a dialectos coreanos (por ejemplo, Jeju o variantes regionales).
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-ASR-1.7B, cuya licencia no se detalla en la informacion proporcionada.
- No hay informacion sobre cuantizaciones oficiales, requisitos de hardware ni stacks de despliegue validados; habria que probar el pipeline de Qwen3-ASR antes de llevarlo a produccion.
- Los conjuntos clova_call, kspon_eval_clean y kspon_eval_other no se publican por restricciones de licencia de los datasets originales, lo que limita la reproducibilidad completa de la evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Modelo beta predecesor: https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko_beta
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conjuntos de evaluacion revisados (zeroth, common_voice_ko, fleurs_ko): https://huggingface.co/datasets/TeamUNIVA/ko_asr_benchmarks
- Herramienta kocer (metrica CER para coreano): https://github.com/Choi-kwan-u/kocer
