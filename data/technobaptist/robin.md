# TechnoBaptist/Robin

## Resumen

Robin es un modelo de texto a voz (TTS) de pesos abiertos desarrollado por Fixed Seed Research Laboratory, orientado a produccion de audio profesional. A diferencia de los sistemas de clonacion zero-shot, Robin esta disenado para entrenar voces concretas mediante adaptadores LoRA a partir de grabaciones transcritas, y renderiza a 48 kHz, la frecuencia estandar en cine y video. El modelo se distribuye con scripts de entrenamiento, una CLI, una aplicacion web local y nodos para ComfyUI.

Tecnicamente es un sistema en dos etapas: un planner de 2,17 B de parametros que convierte el texto en tokens de habla y un decoder de flow-matching de 1,41 B que transforma esos tokens en audio, sumando 3,58 B de parametros totales. Soporta ingles y japones, incluida la mezcla de ambos idiomas en una misma linea, y acepta etiquetas inline para risas, suspiros, llanto o gritos.

Su relevancia radica en cubrir un hueco poco atendido en el ecosistema abierto: TTS de calidad de estudio con 48 kHz, entrenamiento de voz incluido y flujo de trabajo integrado en ComfyUI, con un pico de memoria en bf16 de 8,2 GB para sintetizar, 9,1 GB para cambiar una voz y 9,9 GB para entrenar una voz nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline en dos etapas: planner (texto a tokens de habla) + decoder flow-matching (tokens a audio) |
| Parametros totales | 3,58 B (2,17 B planner + 1,41 B decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limite practico: 45 s por toma en conversion de voz) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16 segun la model card) |
| Idiomas soportados | Ingles (en), japones (ja) y mezcla en/ja en una misma linea |
| Licencia | fixed-seed-open-license (licencia propia, enlazada en LICENSE) |
| Formato de pesos | safetensors (modelo y LoRA), ONNX (tokenizer de voz CosyVoice 3) |

## Arquitectura y entrenamiento

Robin se compone de dos modulos secuenciales. El primero, un planner de 2,17 B de parametros, recibe el texto (con etiquetas inline opcionales) y lo proyecta como una secuencia de tokens de habla. El segundo, un decoder de 1,41 B basado en flow-matching, convierte esa secuencia de tokens en forma de onda a 48 kHz. Para tareas de texto largo, cambio de voz y entrenamiento se apoya en `speech_tokenizer_v3_25hz.onnx`, el tokenizer de voz de CosyVoice 3, que opera a 25 Hz.

El modelo se distribuye con un LoRA propio (`robin_character_lora.safetensors`) que representa la voz de Robin, y el flujo de personalizacion se basa en entrenar nuevos LoRA sobre grabaciones transcritas: cada voz queda encapsulada en un unico fichero cuya intensidad se ajusta en el momento de la sintesis. La model card recomienda al menos 15 minutos de habla (sus voces de prueba promediaron 20 minutos en unas 200 clips), clips de 3 a 15 segundos con una o dos frases, grabacion mono en sala tratada con el mismo microfono y distancia, y transcripciones literales con etiquetas como `[laughs]` o `[sigh]` donde correspondan. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

Entre las capacidades tecnicas destacables estan el control de voz mediante descripcion en lenguaje natural (`--voice "a warm, low voice, close to the mic"`), la conversion de voz sobre una grabacion de hasta 45 segundos preservando palabras, timing y delivery, y el entrenamiento reanudable con checkpoint cada 200 pasos y muestra de audio en cada guardado.

## Capacidades

- Sintesis de texto a voz a 48 kHz con control de estilo mediante descripcion textual de la voz.
- Etiquetas inline para expresividad: `[laughs]`, `[sigh]`, `[crying]`, `[shouting]`, entre otras.
- Bilinguismo en ingles y japones, con modo `mix` para alternar ambos idiomas en una misma linea.
- Conversion de voz (revoicing) de grabaciones de hasta 45 segundos manteniendo prosodia y contenido.
- Entrenamiento de voces personalizadas mediante LoRA a partir de carpetas de clips con transcripciones.
- Herramienta `prep` de validacion de datasets: detecta clips sin transcripcion, silenciosos, demasiado cortos o largos, clipping, digitos, frecuencias de muestreo bajas y transcripciones sospechosas.
- Integracion con ComfyUI mediante nodos dedicados (Robin Loader, Robin LoRA, Robin Speak) y workflows de ejemplo.
- Interfaz grafica local en navegador con comparacion de tomas, cambio de voz por descripcion y entrenamiento con progreso en vivo.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo).

## Casos de uso

- Doblaje y localizacion de video: el render a 48 kHz cumple el estandar de cine y video, y la conversion de voz permite revoicear una toma original manteniendo palabras, timing y delivery, util para versiones en ingles o japones de un mismo material.
- Produccion de audiolibros y narracion: entrenar un LoRA con la voz del narrador (15-20 minutos de material) y generar capitulos completos con una voz consistente, ajustando la intensidad del adaptador en cada sesion.
- Personajes para videojuegos y animacion: combinar descripciones de voz con etiquetas expresivas (`[shouting]`, `[laughs]`) para generar variaciones de interpretacion de un mismo personaje sin regrabar al actor.
- Prototipado de voces en preproduccion: disenar una voz mediante descripcion textual (`--voice "a bright, fast-talking woman"`) para maquetas de animatica antes de contratar la locucion final.
- Integracion en pipelines de ComfyUI: usar los nodos Robin Loader, Robin LoRA y Robin Speak dentro de grafos de generacion audiovisual para sincronizar voz con video generado.
- Postproduccion y correccion de tomas: sustituir una linea defectuosa de una grabacion por una sintetizada con la voz entrenada del locutor, manteniendo coherencia timbrica con el resto de la sesion.
- Creacion de contenido multilingue en/ja: generar una misma linea alternando ingles y japones (modo `mix`) para contenido dirigido a audiencias mixtas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16 segun la model card del autor: 8,2 GB para sintetizar voz, 9,1 GB para cambiar una voz y 9,9 GB para entrenar un LoRA de voz.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por los requisitos de VRAM, encajan GPU de 12 GB o mas, como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM en bf16; en tarjetas de 8 GB el margen es insuficiente para el modo de entrenamiento.
- Opciones de despliegue: paquete Python `robin` (CLI `python -m robin speak`, `gui`, `prep`, `train`), aplicacion web local en navegador y nodos de ComfyUI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 8,8 GB, incluyendo pesos, tokenizer ONNX, LoRA de personaje, paquete Python y nodos de ComfyUI.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia de audio | Idiomas | Entrenamiento de voz | Licencia |
|---|---|---|---|---|---|
| Robin (Fixed Seed) | 3,58 B (2,17 B + 1,41 B) | 48 kHz | en, ja, mix | LoRA incluido | fixed-seed-open-license |
| CosyVoice 3 (referencia del tokenizer) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas TTS open source de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite contrastar Robin con CosyVoice 3, del que unicamente se sabe que su tokenizer de voz a 25 Hz se reutiliza en este modelo; no se dispone de datos de parametros, contexto ni rendimiento de esa alternativa en la documentacion proporcionada, ni de otras comparaciones verificables.

## Limitaciones y advertencias

- Solo cubre ingles y japones; no hay soporte declarado de castellano ni de otros idiomas.
- La conversion de voz esta limitada a grabaciones de hasta 45 segundos y exige que el texto coincida exactamente con lo que dice la grabacion.
- El entrenamiento de voces requiere datos de calidad: al menos 15 minutos de habla, sala silenciosa, mismo microfono y transcripciones literales; clips por debajo de 16 kHz se descartan y frecuencias de muestreo bajas producen agudos apagados.
- Riesgo de alucinacion o artefactos en la sintesis: no se documenta en la informacion disponible, pero es un riesgo inherente a los sistemas TTS generativos y conviene revisar cada salida antes de usarla en produccion.
- Sesgos: no se documentan sesgos conocidos en la model card; la calidad dependera de la distribucion de las voces de entrenamiento, no especificada.
- Licencia: se trata de una licencia propia (`fixed-seed-open-license`), no de una licencia estandar como Apache 2.0 o MIT; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- El repositorio no registra descargas ni likes y fue creado y actualizado en la misma fecha (2026-11-24), lo que sugiere una publicacion reciente sin validacion externa todavia.
- El autor del repositorio en Hugging Face es TechnoBaptist, mientras que la model card y los enlaces apuntan a la organizacion FixedSeed; conviene verificar la procedencia de los pesos antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/Robin
- Repositorio referenciado en la model card: https://huggingface.co/FixedSeed/Robin
- GitHub: https://github.com/Fixed-Seed/Robin
- Pagina del proyecto: https://audiorobin.io
- Licencia: fichero LICENSE del repositorio (https://huggingface.co/TechnoBaptist/Robin/blob/main/LICENSE)
- Banner: https://huggingface.co/FixedSeed/Robin/resolve/main/images/banner.png
