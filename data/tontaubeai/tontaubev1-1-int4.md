# TontaubeAI/TontaubeV1.1-int4

## Resumen

TontaubeV1.1-int4 es la versión cuantizada a 4 bits del modelo de síntesis de voz TontaubeV1.1, desarrollado por TontaubeAI. Se trata de un modelo text-to-speech multilingüe orientado a clonación de voz expresiva, generación de audio de formato largo y streaming de baja latencia. Esta variante int4 es la versión por defecto del servidor de inferencia propio de Tontaube y reduce el peso de descarga a 1,8 GB, permitiendo su ejecución en GPUs pequeñas y en CPUs x86-64.

El modelo se distribuye como un conjunto de cuatro predictores causales de codebook (CB0 a CB3): CB0 genera audio semántico y duración a partir del texto, mientras que CB1-CB3 añaden detalle acústico de forma progresiva. El texto hablado se tokeniza a nivel de carácter, con controles compactos de idioma y estilo codificados en BPE. La versión V1.1 incorpora cinco controles de estilo (velocidad, pausas, entonación, tono y articulación nítida) y un adaptador VibeVoice que refina el audio decodificado.

Es relevante ahora porque ofrece clonación de voz multilingüe (inglés y alemán como idiomas principales, más español, francés, italiano, neerlandés y portugués) con un consumo de memoria contenido (unos 4 GiB en carga y un pico de 6,5 GiB en GPUs con soporte bf16), lo que lo hace accesible para despliegues en hardware modesto. No obstante, no es un checkpoint compatible con `AutoModelForCausalLM`: requiere el servidor de inferencia específico de Tontaube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro predictores causales de codebook (CB0-CB3); CB0 genera audio semántico y duración, CB1-CB3 añaden detalle acústico |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (GPTQ) |
| Idiomas soportados | en, de, es, fr, it, nl, pt |
| Licencia | tontaube-community-model-license-1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TontaubeV1.1 se articula en torno a cuatro predictores causales de codebook que trabajan de forma jerárquica. CB0 se encarga de generar el audio semántico y la duración a partir del texto de entrada, mientras que los modelos CB1, CB2 y CB3, de tamaño progresivamente menor, añaden detalle acústico. El texto se procesa con tokenización a nivel de carácter, complementada con controles de idioma y estilo de habla codificados mediante BPE compacto. La versión V1.1 añade un adaptador VibeVoice que refina el audio decodificado y cinco controles de estilo ajustables.

Esta release int4 se obtiene mediante cuantización GPTQ del modelo base TontaubeV1.1. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona un informe técnico de TontaubeV1 (enlace en la sección de enlaces), pero no se incluyen cifras de entrenamiento en el material proporcionado.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en siete idiomas: inglés, alemán, español, francés, italiano, neerlandés y portugués.
- Clonación de voz a partir de una referencia de 5 a 60 segundos de habla limpia de un único hablante.
- Generación de audio de formato largo y streaming de baja latencia.
- Cinco controles de estilo ajustables por pasos: `rate` (0-4), `pause` (0-4), `pitch_range` (0-5), `pitch_level` (0-4) y `legato` (0-2).
- Estilos públicos predefinidos: `audiobook`, `conversational` y `agentic`.
- Normalización automática del nivel de las referencias de voz muy bajas o muy altas antes de la codificación.
- Control de muestreo semántico mediante temperatura (por defecto 0,7) y penalización de frecuencia (por defecto 0,1).
- Verbalizador opcional en inglés disponible por separado (`TontaubeAI/TontaubeV1-Verbalizer`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Audiolibros y narración de formato largo: el modelo incluye un estilo `audiobook` específico y controles de velocidad y pausas que permiten ajustar el ritmo de narración a lo largo de capítulos extensos.
- Asistentes de voz conversacionales: el estilo `conversational` y el control de entonación (`pitch_range`) permiten generar respuestas habladas con variación expresiva natural en sistemas de atención al cliente o asistentes domésticos.
- Agentes de voz automatizados: el estilo `agentic` está pensado para interacciones de tipo agente; combinado con streaming de baja latencia, encaja en pipelines de respuesta en tiempo real.
- Clonación de voz para accesibilidad: a partir de 5-60 segundos de una grabación de referencia se puede generar una voz personalizada para usuarios con dificultades del habla, siempre que la licencia lo permita.
- Localización de contenido multimedia: con soporte para siete idiomas, permite doblar o generar pistas de voz en español, francés, italiano, neerlandés y portugués además de inglés y alemán.
- Generación de audio en entornos sin GPU: al ejecutarse en CPUs x86-64 con AVX2, FMA y F16C, permite prototipado y generación por lotes en servidores sin acelerador.
- Integración en aplicaciones vía API HTTP: el servidor de inferencia expone un endpoint `/predict` que acepta texto, idioma, estilo, controles y referencia de voz en base64, facilitando su incorporación a servicios web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Descarga: 1,8 GB (tamaño del repositorio: 1,7 GB).
- VRAM en GPUs NVIDIA con soporte bf16 (Ampere o posterior): aproximadamente 4 GiB en carga y un pico de unos 6,5 GiB.
- CPU: ejecutable en x86-64 Linux con AVX2, FMA y F16C y un compilador de C++; el servidor admite `LITE_DEVICE=cpu`.
- GPU consumer: por el consumo de memoria indicado (pico ~6,5 GiB), es compatible con GPUs de gama media con soporte bf16; el autor no enumera modelos concretos.
- Despliegue: requiere el servidor de inferencia Tontaube (repositorio `craitech/tontaube`, rama `v1.1.0`) con su backend lite; no es compatible con `AutoModelForCausalLM`. El autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un checkpoint estándar de transformers: requiere el servidor de inferencia específico de Tontaube y su backend lite; no funciona como `AutoModelForCausalLM`.
- La clonación de voz exige referencias de 5-60 segundos, limpias y de un único hablante; referencias ruidosas o con múltiples hablantes pueden degradar el resultado.
- El inglés y el alemán son los idiomas principales; el resto (español, francés, italiano, neerlandés, portugués) se describen como soportados, sin datos de calidad publicados.
- Licencia `tontaube-community-model-license-1.0` (license: other): es necesario revisar el texto completo de la licencia antes de cualquier uso comercial, ya que no se detallan aquí sus restricciones.
- Riesgo de alucinación y errores de pronunciación inherente a los modelos TTS; la temperatura baja (0,7 por defecto) favorece la corrección del texto, mientras que valores altos aumentan la variación expresiva a costa de posible inexactitud.
- El verbalizador en inglés es un componente separado y opcional; su ausencia puede afectar a la normalización de texto en inglés.
- No se documentan sesgos específicos ni métricas de evaluación en la información disponible.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontaubeAI/TontaubeV1.1-int4
- Modelo base: https://huggingface.co/TontaubeAI/TontaubeV1.1
- Licencia: https://huggingface.co/TontaubeAI/TontaubeV1.1-int4/blob/main/LICENSE
- Informe técnico (TontaubeV1): https://tontaube.ai/papers/tontaube-v1-technical-report.pdf
- Playground: https://tontaube.ai/playground
- Repositorio de inferencia: https://github.com/craitech/tontaube
- Verbalizador (inglés): https://huggingface.co/TontaubeAI/TontaubeV1-Verbalizer
