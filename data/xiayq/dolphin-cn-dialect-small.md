# xiayq/dolphin-cn-dialect-small

## Resumen

Dolphin CN-Dialect Small es un modelo de reconocimiento automatico del habla (ASR) especializado en dialectos chinos, desarrollado originalmente por DataoceanAI y republicado por el usuario xiayq como un paquete nativo del runtime OpenASR. Se trata de un modelo compacto (checkpoint `small.cn`) construido sobre la receta Dolphin/WeNet, con un encoder E-Branchformer y un decoder Transformer entrenados con un objetivo conjunto CTC + atencion. Su foco principal es el mandarin regional, con una capacidad destacada para el dialecto de Sichuan (川话) y cobertura de hasta 22 dialectos chinos, incluyendo Wu, cantonés, minnan y shanghainés.

El modelo resuelve el problema de la transcripcion de habla con fuerte acento regional o code-mixing en chino, un escenario donde los ASR genericos suelen degradarse notablemente. Segun la model card, logra una mejora relativa de aproximadamente el 38% en reconocimiento de dialectos y una reduccion del 16% en CER respecto al Dolphin base, sin sacrificar rendimiento en mandarin estandar.

La relevancia actual de esta ficha radica en su empaquetado como formato `.oasr` (respaldado por GGUF), que permite inferencia sin Python en tiempo de ejecucion, con builds en fp16, q8_0 y q4_k optimizados para CPU y GPU. El repositorio ocupa 1,8 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | E-Branchformer (encoder) + Transformer (decoder), CTC + atencion conjunta |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, q8_0, q4_k |
| Idiomas soportados | Chino (mandarin estandar y 22 dialectos regionales, incluyendo sichuanes, wu, cantonés, minnan, shanghaines) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.oasr` (contenedor respaldado por GGUF); modelo base en formato original de WeNet/OpenASR |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura E-Branchformer como encoder, combinada con un decoder Transformer, entrenada con un objetivo conjunto de CTC y atencion. La decodificacion en OpenASR se realiza mediante busqueda por haces CTC con rescoring por atencion, verificado bit-exacto contra una referencia dorada en un clip de dialecto de Sichuan. El checkpoint es `small.cn` y opera sobre un vocabulario a nivel de caracter, disenado especificamente para audio en chino, incluyendo acentos marcados y habla con code-mixing.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). La model card indica que el corpus de entrenamiento original esta transcrito sin signos de puntuacion, lo que explica que el decoder nunca prediga tokens de puntuacion. La innovacion tecnica destacable es el empaquetado `.oasr`: contenedor respaldado por GGUF con enlace de pesos por mmap de copia cero y reutilizacion de buffers de grafo para minimizar el pico de memoria, sin Python en inferencia.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) en chino, con enfasis en mandarin regional y dialectos.
- Cobertura de 22 dialectos chinos, con especial rendimiento en sichuanes (川话), wu, cantonés, minnan y shanghaines.
- Reconocimiento de mandarin estandar con calidad mantenida respecto al modelo base.
- Manejo de habla con fuerte acento regional y code-mixing.
- Salida a nivel de caracter sobre vocabulario chino.
- Decodificacion CTC con rescoring por atencion.
- Ejecucion nativa en el runtime OpenASR sin dependencia de Python en inferencia.
- Tres builds de cuantizacion (fp16, q8_0, q4_k) para distintos compromisos de memoria y velocidad.
- No emite puntuacion: las transcripciones son texto plano sin signos, por diseno del corpus de entrenamiento.
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Transcripcion de reuniones y entrevistas en dialecto de Sichuan: el modelo esta optimizado para 川话 y permite convertir audio regional en texto con una CER reducida respecto al Dolphin base, adecuado para actas y documentacion interna.
- Subtitulado de contenido audiovisual regional: para videos, podcasts o retransmisiones en dialectos como wu, cantonés o minnan, el modelo genera transcripciones a nivel de caracter que pueden postprocesarse para subtitulos.
- Atencion al cliente en centros de llamadas regionales: permite transcribir conversaciones telefonicas con acentos marcados para analitica, control de calidad y busqueda en archivos de audio.
- Investigacion linguistica y sociolinguistica: la cobertura de 22 dialectos facilita la creacion de corpus anotados y el estudio comparativo de variedades del chino.
- Sistemas de dictado y accesibilidad: integrable en aplicaciones de dictado para hablantes de mandarin regional que necesitan entrada por voz sin depender de un ASR generico.
- Procesamiento por lotes en servidores sin GPU: los builds q8_0 y q4_k reducen el tamano a 494 MB y 298 MB respectivamente, con RTF de 0,24x y 0,26x en CPU M1, lo que permite desplegar transcripcion masiva en infraestructura modesta.
- Transcripcion en el borde (edge): el build fp16 (860 MB) y los cuantizados caben en memoria de sistemas consumer, permitiendo inferencia local sin conexion.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a un modelo ASR). Sin embargo, proporciona metricas de rendimiento del empaquetado y de deriva por cuantizacion:

| Build | Tamano | RAM pico | RTF CPU M1 | RTF GPU M1 | ΔCER vs fp16 |
|---|---:|---:|---:|---:|---:|
| fp16 | 860 MB | 2,37 GB | 0,32x | 0,26x | 0,0% |
| q8_0 | 494 MB | 2,88 GB | 0,24x | 0,12x | 0,0% |
| q4_k | 298 MB | 2,65 GB | 0,26x | 0,11x | 4,5% |

Las metricas RTF se midieron sobre un clip de 2,38 s en dialecto de Sichuan (川话); valores mas bajos indican mayor velocidad. El ΔCER mide la deriva de cuantizacion respecto a la transcripcion fp16 del mismo clip, no la precision absoluta. Ademas, la model card reporta una mejora relativa de ~38% en reconocimiento de dialectos y ~16% de reduccion de CER frente al Dolphin base, aunque no se detallan los conjuntos de evaluacion ni los valores absolutos.

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2,37 GB (fp16), 2,88 GB (q8_0) y 2,65 GB (q4_k) de pico de memoria, segun mediciones del autor en subproceso aislado.
- GPU recomendadas: no se especifican modelos concretos; las metricas RTF se tomaron en GPU M1 (Apple Silicon). Por el tamano, cualquier GPU con al menos 3 GB de memoria disponible es suficiente.
- Cabe en GPU consumer: si, dado el reducido consumo de memoria (inferior a 3 GB en todos los builds); es apto para GPUs de gama de entrada y para Apple Silicon.
- Opciones de despliegue: runtime OpenASR mediante CLI (`openasr pull` y `openasr transcribe`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTF de 0,11x a 0,32x segun build y hardware (M1 CPU/GPU), lo que implica velocidades superiores a la tiempo real en todos los casos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dolphin CN-Dialect Small (este) | ASR E-Branchformer CTC+atencion | no disponible | no disponible | Chino + 22 dialectos | Apache-2.0 | Hugging Face (formato .oasr) |
| Dolphin base (DataoceanAI) | ASR Dolphin/WeNet | no disponible | no disponible | Chino (referencia base) | no disponible | Hugging Face |
| Alternativas ASR multilingues (p. ej. Whisper) | ASR Transformer encoder-decoder | no disponible | no disponible | Multilingue | no disponible | no disponible |

La informacion disponible solo permite comparar con el Dolphin base, del que este modelo deriva y frente al cual la model card reporta mejoras de ~38% relativo en dialectos y ~16% de CER. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No emite puntuacion: el decoder nunca predice signos de puntuacion y no existe ajuste para habilitarlos; las transcripciones son texto plano por diseno.
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado sobre corpus regionales, puede presentar sesgos hacia las variedades mejor representadas (especialmente sichuanes).
- Riesgo de alucinacion: no evaluado en la informacion disponible; como todo ASR, puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no cubiertos.
- Limitaciones de contexto e idioma: enfocado exclusivamente al chino y sus dialectos; no se documenta soporte para otras lenguas. La longitud de contexto no esta disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se deben conservar el copyright y el NOTICE del modelo original; las unicas modificaciones del empaquetado son conversion de formato y cuantizacion.
- Caveat para produccion: el build q4_k introduce un 4,5% de deriva de CER respecto a fp16; para maxima fidelidad se recomienda fp16. El modelo depende del runtime OpenASR para su ejecucion nativa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiayq/dolphin-cn-dialect-small
- Modelo base: https://huggingface.co/DataoceanAI1/dolphi-cn-dialect-small
- Repositorio OpenASR: https://github.com/QuintinShaw/openasr
- Sitio web OpenASR: https://openasr.org
