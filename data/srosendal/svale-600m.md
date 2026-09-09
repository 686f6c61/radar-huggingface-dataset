# srosendal/svale-600M

## Resumen

svale-600M es un modelo de reconocimiento automatico del habla (ASR) para danes, creado por srosendal a partir de un ajuste fino del modelo `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA. Resuelve el problema de transcribir audio hablado danes a texto y es relevante porque ofrece un punto de partida entrenado sobre 2.850 horas de datos publicos daneses, con un WER medio de 12,71 en el leaderboard danes.

Con 600M de parametros, se distribuye en formato NeMo y esta pensado para ejecutarse con NeMo 2.1 o superior sobre audio mono de 16 kHz. No es un modelo de lenguaje autoregresivo: su tarea es exclusivamente la conversion de voz a texto, con salida en minusculas y sin puntuacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base se llama `nvidia/parakeet-tdt-0.6b-v3`, pero la documentacion no detalla la arquitectura) |
| Parametros totales | 600M (por nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica ventana de contexto de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Danes (da) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | NeMo (.nemo) |

## Arquitectura y entrenamiento

svale-600M es un ajuste fino del modelo `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, realizado con la libreria NeMo. La informacion disponible no detalla la arquitectura interna, aunque el nombre del modelo base incluye la sigla TDT, lo que sugiere un enfoque de transductor. Se trata de un modelo de ASR, no de un modelo de lenguaje generativo.

El entrenamiento se realizo sobre 2.850 horas de habla danesa publica procedente de CoRal-v3, FTSpeech, Common Voice, FLEURS y YODAS, utilizando solo los splits de entrenamiento. El modelo genera texto en minusculas y sin puntuacion. No se menciona el uso de tecnicas como RLHF o DPO posteriores al ajuste fino.

## Capacidades

- Transcripcion de voz en danes a partir de audio en 16 kHz mono.
- Salida de texto en minusculas y sin puntuacion.
- Ajustado para dominios de conversacion y lectura, ademas de datos variados como Common Voice y FLEURS.
- No admite tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un modelo puramente de ASR.
- No tiene capacidades de vision ni de generacion de texto libre.
- Unicamente soporta el idioma danes.

## Casos de uso

- Transcripcion de reuniones en danes: el modelo puede procesar audio de reuniones y conversaciones, aprovechando el ajuste con CoRal conversation. Requiere integracion con segmentacion de hablantes y un post-proceso para anadir puntuacion a la salida sin puntuacion.
- Subtitulado automatico de video: permite generar subtitulos crudos en danes a partir de audio de video. Dado que no produce puntuacion, es conveniente aplicar un modelo de restauracion de puntuacion antes de mostrar los subtitulos.
- Analisis de llamadas en centros de contacto: el modelo transcribe conversaciones de atencion al cliente en danes, lo que permite alimentar pipelines de analisis de sentimiento o categorizacion de incidencias en produccion.
- Dictado para profesionales sanitarios o legales: sirve para convertir notas de voz en texto en danes. No obstante, no reconoce jerga especializada si no aparece en los datos de entrenamiento, por lo que habria que validar la precision en cada dominio.
- Accesibilidad para personas con discapacidad auditiva: puede utilizarse como componente de transcripcion en aplicaciones de accesibilidad, siempre que se acople a un sistema de streaming y se tenga en cuenta el requisito de GPU para la inferencia.
- Investigacion linguistica y creacion de corpus: el modelo puede transcribir entrevistas o material de archivo en danes para construir corpus. Su WER en conjuntos publicos como FTSpeech y Common Voice facilita la evaluacion acorde al dominio.

## Benchmarks y rendimiento

Resultados de WER publicados en el modelo, usando el normalizador del  
[leaderboard danes de ASR](https://huggingface.co/spaces/RyeAI/danish-asr-leaderboard):

| Conjunto de datos | WER |
|---|---|
| CoRal conversation | 21,58 |
| CoRal read-aloud | 15,53 |
| FTSpeech | 7,33 |
| Common Voice | 8,79 |
| FLEURS | 10,34 |
| Media | **12,71** |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio NeMo pesa 2,5 GB, lo que da una idea del espacio de pesos, pero no se indica la VRAM minima para inferencia.
- GPU recomendadas: no disponible. El model card indica simplemente "GPU", por lo que se asume que requiere aceleracion por GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: NeMo 2.1 o superior. El ejemplo oficial usa `huggingface_hub` y `nemo.collections.asr.models.ASRModel.restore_from`. Los runtimes típicos para LLMs como vLLM, llama.cpp, Ollama o TGI no estan indicados para este tipo de modelo de ASR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible datos comparativos con otros modelos daneses de ASR. El unico punto de referencia claro es el modelo base `nvidia/parakeet-tdt-0.6b-v3`, pero no se aportan metricas comparadas.

## Limitaciones y advertencias

- La salida es en minusculas y sin puntuacion, lo que obliga a aplicar un post-procesamiento para muchos casos de uso reales.
- El modelo soporta exclusivamente danes; no sirve para transcribir otros idiomas.
- El model card indica que requiere GPU, por lo que no se garantiza su funcionamiento en CPU para inferencia.
- La licencia NVIDIA Open Model License no es una licencia permisiva tipo MIT o Apache, por lo que es necesario revisar las condiciones antes de un uso comercial.
- El dataset CoRal esta sujeto a restricciones OpenRAIL-D: no se permite utilizar el modelo para sintesis de voz ni para identificacion biometrica.
- Al estar afinado sobre 2.850 horas de datos publicos, el modelo puede presentar sesgos hacia los registros y dominios presentes en esos conjuntos, lo que puede reducir la precision en acentos o vocabulario fuera de ese subconjunto.
- No se han publicado evaluaciones de sesgos ni estudios de alucinacion especificos para este modelo. Como todo ASR, existe riesgo de errores de transcripcion en audio ruidoso o con hablantes poco representados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srosendal/svale-600M
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Leaderboard danes de ASR: https://huggingface.co/spaces/RyeAI/danish-asr-leaderboard
