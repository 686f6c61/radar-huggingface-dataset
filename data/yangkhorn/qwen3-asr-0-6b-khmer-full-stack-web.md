# Yangkhorn/Qwen3-ASR-0.6B-Khmer-Full-Stack-Web

## Resumen

Qwen3-ASR-0.6B-Khmer-Full-Stack-Web es un paquete de despliegue, no un modelo de pesos original. Lo publica el usuario Yangkhorn y empaqueta la interfaz web completa y la API para ejecutar el modelo de reconocimiento automatico del habla (ASR) en jemer `seanghay/Qwen3-ASR-0.6B-Khmer`, que a su vez es un ajuste fino de `Qwen/Qwen3-0.6B` realizado por Seanghay sobre el corpus `DDD-Cambodia/khmer-speech-dataset`.

El interes practico esta en la cadena de derivacion: parte de un transformer de 0,6 mil millones de parametros de la familia Qwen3, se especializa en transcripcion de audio en jemer y se distribuye con un cuaderno de Colab que levanta tanto la UI como el endpoint HTTP en una GPU de notebook. Esto reduce la barrera de entrada para quien quiera probar ASR en jemer sin montar infraestructura propia.

Conviene subrayar que el repositorio tiene un tamano de 0,0 GB y cero descargas, por lo que no contiene pesos verificables en el momento de redactar esta ficha. Es, por tanto, un contenedor de codigo y recursos de despliegue alrededor de un modelo alojado en otro repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B), adaptado a ASR |
| Parametros totales | 0,6 mil millones (heredados de Qwen/Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos, tamano 0,0 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen3 con 0,6 mil millones de parametros. Sobre esa base, Seanghay realizo un ajuste fino para transcripcion de voz en jemer, apoyandose en el dataset `DDD-Cambodia/khmer-speech-dataset` y en el recurso fonetico `seanghay/wav2vec2-base-khmer-phonetisaurus`, segun se indica en la model card. No se detalla en la informacion disponible el numero de tokens de audio utilizados, la composicion exacta del corpus ni si hubo etapas de RLHF o DPO.

El repositorio que nos ocupa no aporta entrenamiento adicional: es un paquete "full stack" que incluye la interfaz web, la capa de API y un cuaderno de Google Colab para levantar el servicio en entornos con GPU (Colab y Kaggle). La innovacion, por tanto, es de empaquetado y despliegue, no arquitectonica.

## Capacidades

- Reconocimiento automatico del habla en jemer: transcripcion de audio a texto.
- Despliegue como servicio web con interfaz de usuario y endpoint de API.
- Ejecucion en cuadernos con GPU (Google Colab, Kaggle Notebooks).
- Integracion con recursos foneticos auxiliares de jemer (`wav2vec2-base-khmer-phonetisaurus`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al jemer segun la etiqueta de idioma del repositorio.
- Vision, audio generativo o modo "thinking": no disponible.

## Casos de uso

- Transcripcion de reuniones en jemer: el servicio levantado desde el cuaderno permite subir audio y obtener texto, util para equipos que documentan sesiones en este idioma.
- Subtitulado de contenido audiovisual: la API HTTP facilita generar subtitulos en lote para videos en jemer sin depender de servicios comerciales.
- Prototipado rapido en investigacion: un investigador puede validar hipotesis sobre ASR en jemer en una sesion de Colab con GPU, sin aprovisionar servidores.
- Archivado y busqueda de audio historico: transcripcion de grabaciones para indexar y hacer recuperable el contenido hablado en jemer.
- Atencion al cliente en jemer: integracion del endpoint en un flujo de IVR o chat de voz para transcribir consultas antes de derivarlas a un agente.
- Evaluacion comparativa de ASR de bajo recurso: sirve como referencia reproducible de un ajuste fino de 0,6 B sobre un corpus camboyano, frente a modelos multilingues mayores.
- Docencia y demos: la UI incluida permite mostrar en clase como funciona un pipeline ASR completo sin escribir codigo de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de 0,6 B, es previsible que quepa en GPUs consumer, pero no se aportan cifras oficiales.
- GPU recomendadas: el paquete esta pensado para GPUs de Colab y Kaggle; no se listan modelos concretos (A100, H100, RTX 4090) en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado con datos; el tamano del modelo base sugiere que si, pero no se especifica.
- Opciones de despliegue: interfaz web y API incluidas en el repositorio, ejecutables via cuaderno de Colab. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yangkhorn/Qwen3-ASR-0.6B-Khmer-Full-Stack-Web | 0,6 B (base) | no disponible | jemer | Apache 2.0 | paquete de despliegue, sin pesos en el repo |
| seanghay/Qwen3-ASR-0.6B-Khmer | 0,6 B | no disponible | jemer | no disponible | modelo ajustado de referencia |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible | multilingue | no disponible | modelo base original |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos (tamano 0,0 GB); es un paquete de codigo y despliegue, no un modelo descargable por si mismo.
- Cero descargas y cero "likes": no hay evidencia de uso ni validacion por parte de la comunidad.
- El alcance linguistico se limita al jemer; no es adecuado para otros idiomas sin un ajuste adicional.
- No se documentan sesgos del corpus de entrenamiento ni tasas de alucinacion en transcripcion.
- No se especifican requisitos de contexto ni limites de duracion de audio.
- Dependencia de un cuaderno de Colab: el servicio no esta pensado como despliegue de produccion de alta disponibilidad.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base y del ajuste fino original antes de un uso comercial.
- La fecha de creacion (2026-08-28) y la referencia arXiv 2601.21337 deben contrastarse con las fuentes primarias antes de citarlas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yangkhorn/Qwen3-ASR-0.6B-Khmer-Full-Stack-Web
- Modelo ajustado de referencia: https://huggingface.co/seanghay/Qwen3-ASR-0.6B-Khmer
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Dataset de voz en jemer: https://huggingface.co/datasets/DDD-Cambodia/khmer-speech-dataset
- Recurso fonetico: https://huggingface.co/seanghay/wav2vec2-base-khmer-phonetisaurus
- Cuaderno de Colab: https://colab.research.google.com/notebook#fileId=https%3A//huggingface.co/Yangkhorn/Qwen3-ASR-0.6B-Khmer-Full-Stack-Web/blob/main/qwen3-asr-0-6b-khmer-colab.ipynb
- Demo en video: https://cdn-uploads.huggingface.co/production/uploads/69989b3028308e758921f6bd/qB0A0AtoVgc1cAYv1WuuQ.mp4
- Paper citado (Qwen3-ASR Technical Report): arXiv:2601.21337
