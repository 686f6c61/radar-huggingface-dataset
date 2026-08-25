# vvolhejn/pocket-tts-czech

## Resumen

Pocket TTS Czech (6 layers) es un modelo de text-to-speech (TTS) con clonación de voz para el idioma checo, desarrollado por Václav Volhejn (vvolhejn) como una extensión del proyecto Pocket TTS de Kyutai Labs. El modelo se basa en una arquitectura transformer de 6 capas con aproximadamente 109,5 millones de parámetros, y está diseñado para ejecutarse en tiempo real en CPU, sin necesidad de GPU. Su propósito principal es generar voz sintética a partir de una muestra de audio de referencia (clonación de voz de una sola muestra) y un texto en checo.

La relevancia del modelo radica en que cubre un idioma con pocos recursos en el ecosistema de TTS de código abierto, y lo hace con una arquitectura ligera y eficiente. El entrenamiento se realizó sobre ParCzech4Speech, un corpus de discursos parlamentarios checos de 976 horas, con un proceso de destilación de profundidad desde un modelo profesor de 24 capas. El resultado es un modelo compacto que mantiene una calidad aceptable para su tamaño, aunque está limitado a la distribución del habla parlamentaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas (destilado de un modelo de 24 capas) |
| Parametros totales | 109.501.122 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no texto generativo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de 0,4 GB) |
| Idiomas soportados | checo (cs) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS, un sistema de TTS neuronal ligero desarrollado por Kyutai Labs. La versión checa utiliza un transformer de 6 capas, destilado en profundidad a partir de un modelo profesor de 24 capas. El proceso de destilación se realizó con los pesos EMA (decay 0.9999) del profesor, durante 100k pasos con una tasa de aprendizaje coseno de 4e-4 y un coeficiente de guía de destilación de 2.0.

El corpus de entrenamiento es ParCzech4Speech, que contiene 976 horas de discurso parlamentario checo, con 547.597 utterances y 524 hablantes. El tokenizador es un sentencepiece ajustado sobre las transcripciones de ParCzech, con un vocabulario de 3.999 tokens. La guía de clasificación (CFG) está integrada en el estudiante, por lo que se recomienda usar el modelo con `--temperature 0.3` y CFG igual a 1. No se han publicado resultados de evaluación cuantitativa porque el pipeline de evaluación de Pocket TTS es solo para inglés.

## Capacidades

- Sintesis de voz en checo con clonacion de voz a partir de una sola muestra de audio.
- Generacion de audio mas rapido que tiempo real en CPU.
- Soporte para exportar estados de voz (con `pocket-tts export-voice`) y reutilizarlos.
- Funciona con la herramienta de linea de comandos `uvx pocket-tts generate` y con la libreria Python de Pocket TTS.
- El modelo es sensible a mayusculas y puntuacion en el texto de entrada, por lo que la transcripcion debe respetar el formato de las transcripciones parlamentarias.
- Incluye voces de muestra extraidas de hablantes held-out de ParCzech.

## Casos de uso

- Narracion de contenidos parlamentarios y legislativos: el modelo se entrena con discursos parlamentarios, por lo que es idoneo para sintetizar actas, resumenes o noticias sobre sesiones parlamentarias en checo.
- Audiolibros de textos formales: para obras literarias o tecnicas con un tono formal y adulto, la voz generada se ajusta a ese registro, siempre que el texto respete la puntuacion estandar.
- Asistentes de voz en checo para entornos institucionales: puede integrarse en sistemas de respuesta vocal (IVR) de administraciones publicas o empresas que operen en la Republica Checa, ofreciendo una voz consistente y clara.
- Generacion de material de aprendizaje para el idioma checo: profesores o plataformas pueden crear ejemplos de pronunciacion para estudiantes, aunque limitado a un registro formal.
- Prototipado rapido de aplicaciones de TTS en checo: al ser un modelo ligero y ejecutable en CPU, es util para pruebas de concepto en entornos sin GPU, por ejemplo en CI/CD o en aplicaciones de escritorio.
- Clonacion de voz para doblaje o locucion en checo: si el usuario tiene una grabacion de una voz concreta, puede clonarla y generar nuevos audios con ella, siempre que el contenido se ajuste a la distribucion de entrenamiento (habla formal y adulta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica que la pipeline de evaluacion de Pocket TTS es solo para ingles, por lo que no se reportan cifras de WER, similitud de hablante o UTMOS para la version checa.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para ejecutarse mas rapido que el tiempo real en CPU, por lo que no requiere GPU para inferencia.
- VRAM estimada: no aplica para CPU; si se ejecutase en GPU, el peso de 0,4 GB en safetensors cabria en cualquier GPU con mas de 1 GB de VRAM, pero no es el caso de uso previsto.
- GPUs recomendadas: no es necesario; funciona con procesadores de escritorio o portatiles modernos.
- Opciones de despliegue: se usa mediante la CLI `uvx pocket-tts` o la libreria Python de Pocket TTS. No se mencionan integraciones con vLLM, llama.cpp u Ollama porque es un modelo de TTS, no de LLM.
- Latencia y throughput: no se proporcionan cifras exactas, pero la model card indica que es mas rapido que tiempo real en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de TTS checos. La model card no reporta resultados de evaluacion comparativa. Existen alternativas comerciales como ElevenLabs para checo, pero no son de codigo abierto y no se pueden comparar directamente. Dentro del ecosistema Pocket TTS, el modelo checo de 6 capas es una version ligera y especifica para ese idioma, mientras que el modelo ingles original tiene mas capas y soporta voces de catalogo, pero no es comparable en rendimiento al no haber datos.

## Limitaciones y advertencias

- **Distribucion limitada**: el modelo se entrena exclusivamente con discurso parlamentario (formal, adulto, mayormente masculino). Es debil en habla conversacional, voces infantiles y textos con formato no parlamentario (por ejemplo, mensajes de texto, redes sociales, poesia).
- **Sensibilidad a mayusculas y puntuacion**: el tokenizador es sensible a mayusculas y puntuacion, por lo que el texto de entrada debe formatearse como las transcripciones parlamentarias para obtener un resultado optimo.
- **Riesgo de alucinacion en pronunciacion**: al ser un TTS, no genera contenido semantico, pero puede producir pronunciaciones incorrectas para nombres propios o terminos tecnicos fuera del corpus parlamentario.
- **Licencia**: los pesos estan bajo CC-BY 4.0, que permite uso comercial, pero requiere atribucion a los autores y al corpus ParCzech4Speech (UFAL, Charles University). No se indica ninguna restriccion adicional.
- **Sin evaluacion publicada**: no hay metricas objetivas de calidad (WER, similitud de voz, UTMOS) para este modelo, lo que dificulta comparaciones objetivas con alternativas.
- **Voces de catalogo no disponibles**: las voces precomputadas en ingles (`alba`, `cosette`, etc.) no funcionan con este modelo; es necesario proporcionar un audio de voz de muestra.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/vvolhejn/pocket-tts-czech
- Repositorio de Pocket TTS: https://github.com/kyutai-labs/pocket-tts
- Documentacion de entrenamiento no-ingles: https://github.com/kyutai-labs/pocket-tts/blob/main/training/README.md#non-english-training
- Corpus ParCzech4Speech: https://huggingface.co/datasets/ufal/parczech4speech
- Perfil del autor en HuggingFace: https://huggingface.co/vvolhejn
