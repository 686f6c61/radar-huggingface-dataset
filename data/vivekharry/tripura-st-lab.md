# vivekharry/tripura-st-lab

## Resumen

El proyecto `vivekharry/tripura-st-lab` es un repositorio de código y registro de datasets para traducción de voz desde Kokborok (lengua de Tripura, India) al inglés, con soporte adicional para bengalí y marathi. Lo desarrolla Vivek Das (`vivekharry`) y se publica bajo licencia MIT. El objetivo principal es abordar la traducción de voz en lenguas de bajos recursos (low-resource) del grupo índico, con un enfoque Kokborok-first.

No se trata de un modelo preentrenado monolítico, sino de un pipeline compuesto por dos etapas: un sistema de reconocimiento automático de voz (ASR) que puede partir de Whisper o de MMS-1B con un adaptador NE-ASR, y un sistema de traducción automática (MT) basado en NLLB o en el modelo `sdmy/kokborok`. El repositorio incluye scripts de entrenamiento para ambos módulos y está alojado en HuggingFace con el pipeline de `automatic-speech-recognition`.

Su relevancia radica en la escasez de recursos lingüísticos para lenguas como el Kokborok, y en la necesidad de construir sistemas de traducción de voz que puedan desplegarse en entornos con datos limitados. El proyecto se posiciona como una base técnica para investigación y desarrollo en traducción de voz para lenguas minoritarias de la India.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline compuesto: ASR (Whisper fine-tune o MMS-1B + adaptador NE-ASR) + MT (NLLB o sdmy/kokborok) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | trp (Kokborok), bn (bengali), mr (marathi), en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El sistema se compone de dos modulos encadenados. El primero es un reconocedor de voz (ASR) que procesa audio monofonico a 16 kHz y genera una transcripcion en Kokborok. Para ello, el repositorio ofrece dos vias: un fine-tuning de `openai/whisper-small` o el uso de `MMS-1B` con un adaptador NE-ASR. El segundo modulo es un traductor automatico (MT) que convierte la transcripcion en Kokborok a ingles, y opcionalmente a bengali o marathi. Como motor de traduccion se mencionan `NLLB` y `sdmy/kokborok`.

El entrenamiento se organiza mediante scripts en Python, como `indic_st.train_asr` y `indic_st.train_mt`, que toman datasets registrados en el repositorio (por ejemplo, `kokborok_asr` y `kokborok_mt`). No se especifican en la informacion disponible el numero de tokens, la composicion exacta de los datasets ni si se aplicaron tecnicas como RLHF o DPO. La referencia a "BhasaAnuvaad" sugiere que los datos proceden de esa iniciativa, pero no se ofrecen detalles adicionales.

## Capacidades

- Traduccion de voz de Kokborok a ingles mediante un pipeline ASR + MT.
- Soporte adicional para traduccion a bengali y marathi, aunque la prioridad declarada es Kokborok-first.
- Flexibilidad en la eleccion de modelos base: Whisper o MMS-1B para ASR, y NLLB o sdmy/kokborok para MT.
- Enfoque en lenguas de bajos recursos, con tecnicas de adaptacion como el adaptador NE-ASR.
- No se mencionan capacidades de tool calling, agentes, vision o modo de razonamiento explicito.

## Casos de uso

- Documentacion linguistica: transcripcion y traduccion de grabaciones de campo en Kokborok para investigadores de lenguas indias, facilitando el analisis de corpus orales.
- Acceso a informacion para hablantes de Kokborok: conversion de contenido hablado en esta lengua a texto en ingles, permitiendo su integracion en sistemas de busqueda o lectura.
- Servicios publicos en Tripura: traduccion de anuncios, discursos o comunicaciones oficiales desde y hacia Kokborok, contribuyendo a la inclusion linguistica en la administracion.
- Educacion bilingue: generacion de materiales didacticos a partir de audio en Kokborok, con traduccion al ingles para su uso en aulas multilingues.
- Investigacion en traduccion de voz para lenguas minoritarias: uso del repositorio como base para experimentos con tecnicas de adaptacion de modelos preentrenados.
- Desarrollo de asistentes de voz: integracion del pipeline en prototipos de asistentes que respondan en Kokborok, aprovechando la cadena ASR + MT para entender consultas habladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos de hardware especificos en la informacion disponible.
- Al depender de modelos base como Whisper-small o MMS-1B, se puede estimar que el ASR es ejecutable en GPUs de consumo medio (por ejemplo, RTX 3060 o superiores) en funcion de la cuantizacion, pero no hay datos confirmados.
- El modulo MT con NLLB puede requerir mas recursos, especialmente en sus variantes grandes, aunque no se especifican.
- El despliegue puede realizarse con herramientas compatibles con HuggingFace Transformers, pero no se indican opciones concretas como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion disponible. El proyecto se distingue por su enfoque en Kokborok, una lengua de bajos recursos, y por combinar ASR y MT en un unico repositorio de entrenamiento. No se dispone de datos de rendimiento para comparar con otros sistemas de traduccion de voz para lenguas indicas.

## Limitaciones y advertencias

- El repositorio contiene principalmente codigo de entrenamiento y registro de datasets, no un modelo preentrenado listo para descargar. Los usuarios deben entrenar los modulos ellos mismos.
- Al tratarse de lenguas de bajos recursos, es probable que los datasets sean pequenos y no representativos de toda la variabilidad linguistica, lo que puede aumentar el riesgo de alucinaciones o errores de traduccion.
- No se aportan metricas de calidad ni evaluaciones en el material disponible, por lo que el rendimiento real es desconocido.
- La licencia MIT permite uso comercial, pero la calidad de los modelos resultantes depende de los datos y del entrenamiento realizado por el usuario.
- El soporte de bengali y marathi parece secundario y podria estar menos optimizado que el de Kokborok.

## Enlaces

- HuggingFace: https://huggingface.co/vivekharry/tripura-st-lab
- Landing page del proyecto: https://huggingface.co/spaces/vivekharry/tripura-st-lab-site
- Perfil del autor: https://huggingface.co/vivekharry
