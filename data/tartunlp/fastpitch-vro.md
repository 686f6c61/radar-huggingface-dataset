# tartuNLP/fastpitch-vro

## Resumen

FastPitch-vro es un modelo de sintesis de voz (text-to-speech) para el idioma võro, una lengua ugrofinesa hablada en el sureste de Estonia. Lo desarrolla el grupo de procesamiento de lenguaje natural de la Universidad de Tartu (tartuNLP) utilizando la implementacion de FastPitch de su propia libreria TransformerTTS. El modelo se publica en Hugging Face con la etiqueta de pipeline `text-to-speech` y esta entrenado especificamente para dos voces de võro.

El modelo resuelve la ausencia de sintesis neuronal de calidad para una lengua de bajos recursos como el võro, que cuenta con muy pocos hablantes y escasos recursos digitales. En el momento de su publicacion es el modelo de võro desplegado en el servicio Neurokõne y en la API publica de tartuNLP, lo que lo convierte en la referencia practica para TTS en esta lengua.

Tecnicamente se trata de un modelo FastPitch implementado en TensorFlow, con un repositorio de 0,2 GB, entrenado sobre dos hablantes identificados como `sulev` (ID 11) y `hella` (ID 12). No se dispone de informacion publica sobre el numero de parametros, la longitud de contexto ni los detalles del corpus de entrenamiento mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastPitch (TransformerTTS, implementacion de tartuNLP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | võro (`vro`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | no disponible (repositorio TensorFlow, 0,2 GB) |

## Arquitectura y entrenamiento

FastPitch es una arquitectura de sintesis de voz no autorregresiva basada en Transformer que predice directamente espectrogramas mel a partir de texto, sustituyendo el decodificador autorregresivo de TransformerTTS por un predictor de duraciones y una proyeccion feed-forward. Esto permite paralelizar la generacion y reduce la latencia frente a enfoques autoregresivos clasicos. En este caso la implementacion concreta es la de la libreria TransformerTTS de TartuNLP, en TensorFlow.

El modelo se ha entrenado con datos de dos hablantes de võro, un hombre (`sulev`, ID 11) y una mujer (`hella`, ID 12). La model card no detalla el numero de horas de audio, la composicion del corpus ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional; estos datos no estan disponibles. La publicacion asociada (Rätsep y Fishel, NoDaLiDa 2023) es la referencia academica del trabajo.

## Capacidades

- Sintesis de voz a partir de texto en võro, con salida de audio para dos voces diferenciadas por ID de hablante.
- Control de identidad de voz mediante los IDs `sulev: 11` y `hella: 12`.
- Integracion con el flujo de trabajo del worker de TTS de tartuNLP (version 3.\*.\*) y su API.
- Compatible con el despliegue en Neurokõne y en la API publica de tartuNLP.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingueismo ni tool calling.

## Casos de uso

- Accesibilidad para hablantes de võro: lectura en voz alta de contenido web, documentos o interfaces para personas con discapacidad visual, usando la voz `sulev` o `hella` segun preferencia.
- Preservacion linguistica: generacion de audiolibros y materiales didacticos en võro para escuelas y programas de revitalizacion de la lengua, donde apenas existen locuciones grabadas.
- Integracion en asistentes conversacionales: el modelo puede alimentar un pipeline de dialogo en võro a traves de la API de tartuNLP, aportando la capa de sintesis de voz.
- Servicios publicos y administracion: anuncios y avisos automatizados en võro para la region de Võrumaa, con dos voces disponibles para alternar locutores.
- Investigacion en lenguas de bajos recursos: punto de partida y baseline para experimentos de TTS en võro, con pesos y codigo de referencia publicados.
- Prototipado de productos de voz: desarrolladores que necesiten una voz en võro pueden desplegar el worker de tartuNLP y consumir el modelo sin entrenar desde cero.
- Generacion de contenido multimedia: locuciones para videos, podcasts o audguias en võro con dos perfiles de voz distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,2 GB, lo que sugiere un modelo ligero que probablemente cabe en GPU de consumo, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible en tarjetas como RTX 3060 o superiores, pero es una estimacion no verificada.
- Opciones de despliegue: worker de tartuNLP (v3.\*.\*) y API de tartuNLP; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo TTS de TensorFlow.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Voces | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tartuNLP/fastpitch-vro | võro | FastPitch (TensorFlow) | 2 (`sulev`, `hella`) | CC BY-SA 4.0 | Hugging Face, Neurokõne, API tartuNLP |
| Otros modelos FastPitch de tartuNLP | estonio y otras lenguas balticas | FastPitch (TensorFlow) | no disponible | no disponible | Hugging Face |
| Modelos TTS multilingues genericos | multiples | variable | multiples | variable | variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma (võro) y a dos hablantes; no hay voces adicionales ni control de estilo.
- No se documentan sesgos especificos, pero al entrenarse con solo dos voces el modelo puede reproducir caracteristicas idiosincraticas de esos locutores y no generaliza a otros registros.
- Riesgo de alucinacion acustica y errores de pronunciacion en palabras fuera del vocabulario o en prestamos, habitual en TTS de bajos recursos; no cuantificado en la informacion disponible.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Dependencia del ecosistema TensorFlow y del worker/API de tartuNLP; la integracion con otros stacks requiere trabajo adicional.
- No hay informacion sobre el corpus de entrenamiento, por lo que no se puede evaluar la cobertura fonetica ni la calidad en dominios especializados.
- El modelo fue creado en 2026 segun los metadatos de Hugging Face; conviene verificar la vigencia de los enlaces y del worker compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tartuNLP/fastpitch-vro
- Libreria TransformerTTS: https://github.com/TartuNLP/TransformerTTS
- Worker de TTS: https://github.com/TartuNLP/text-to-speech-worker
- API de TTS: https://github.com/TartuNLP/text-to-speech-api
- Servicio Neurokõne: https://neurokone.ee/
- Documentacion de la API de tartuNLP: https://api.tartunlp.ai/text-to-speech/docs
- Publicacion (NoDaLiDa 2023): https://aclanthology.org/2023.nodalida-1.73/
- Contacto: ping@tartunlp.ai
