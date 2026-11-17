# yunusemrejr/kiwimind

## Resumen

Kiwi Mind es un paquete de pesos en formato GGUF derivado del modelo multimodal google/gemma-4-E4B-it, publicado por el usuario yunusemrejr bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una distribucion cuantizada y empaquetada del modelo base de Google, orientada a su integracion en KiwiBro, una aplicacion de escritorio y CLI del mismo autor. El paquete incluye un tronco cuantizado Q4_K_M, un proyector de vision compatible y una cabeza borrador Q8_0 para decodificacion especulativa.

El repositorio ocupa 27,0 GB e incluye el paquete nativo en el subdirectorio `candidate/`, que suma 6,02 GB. El tronco emplea un ancho de feed-forward seleccionado por activacion de 8.192 en 42 capas, segun la model card. La metadata de safetensors declara 6.857.466.410 parametros totales, aunque no se especifica cuantos estan activos ni la naturaleza exacta de la arquitectura del modelo base.

La relevancia del modelo es practica: ofrece un artefacto listo para ejecutar con llama.cpp que soporta chat, entrada de imagenes, herramientas estructuradas y memoria, con decodificacion especulativa en CPUs compatibles. La informacion publicada es escasa y mayoritariamente remite a la documentacion del proyecto KiwiBro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de google/gemma-4-E4B-it (detalles de atencion y FFN no disponibles) |
| Parametros totales | 6.857.466.410 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (tronco), Q8_0 (cabeza borrador), proyector de vision (cuantizacion no especificada) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una distribucion cuantizada del base google/gemma-4-E4B-it, no un entrenamiento propio. El tronco usa un ancho de feed-forward seleccionado por activacion de 8.192 en 42 capas, segun la model card. El paquete incorpora tres componentes: tronco Q4_K_M, proyector de vision compatible y cabeza borrador Q8_0 para decodificacion especulativa. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que corresponden al modelo base y no se documentan en esta ficha.

La innovacion destacable es la decodificacion especulativa con cabeza borrador: en CPUs compatibles, la cabeza propone tokens y el tronco los verifica, reduciendo la latencia de generacion. El repositorio incluye un manifiesto (`candidate/manifest.json`) y una replay de evaluacion en Ryzen (`candidate/evals/ryzen-bounded-hatch.json`), aunque no se han publicado los resultados numericos en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Entrada de imagenes mediante proyector de vision compatible.
- Soporte de herramientas estructuradas (tool-use / function calling).
- Memoria conversacional segun la model card.
- Decodificacion especulativa en CPUs compatibles mediante cabeza borrador.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles (`en`).
- No se documentan capacidades de razonamiento extendido, audio ni thinking mode.

## Casos de uso

- Asistente de escritorio integrado en KiwiBro: el paquete esta disenado para que la aplicacion de escritorio y CLI lo descarguen y ejecuten directamente, con chat, vision y memoria en local.
- Procesamiento de imagenes en local: el proyector de vision permite describir o analizar capturas sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Automatizacion con herramientas estructuradas: el soporte de tool-use permite encadenar llamadas a APIs o funciones del sistema desde un agente local.
- Despliegue en CPU sin GPU dedicada: la decodificacion especulativa con cabeza borrador acelera la inferencia en CPUs compatibles, util para estaciones de trabajo sin acelerador.
- Prototipado rapido con llama.cpp: el formato GGUF y la integracion con llama.cpp permiten levantar un servidor de inferencia en minutos para pruebas.
- Evaluacion comparativa de cuantizaciones: el paquete incluye replay de evaluacion en Ryzen, util para medir latencia y calidad en hardware concreto antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una replay de evaluacion (`candidate/evals/ryzen-bounded-hatch.json`) pero no se han expuesto las cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada: el paquete nativo suma 6,02 GB (tronco Q4_K_M + proyector de vision + cabeza Q8_0), por lo que cabe en equipos con 8 GB de RAM o VRAM.
- GPU recomendadas: no disponible; el diseno apunta a ejecucion en CPU con decodificacion especulativa.
- Cabe en GPU de consumo: si, siempre que dispongan de al menos 8 GB de VRAM para el paquete completo.
- Opciones de despliegue: llama.cpp (libreria declarada), endpoints compatibles; no se confirma soporte de vLLM, Ollama o TGI.
- Latencia y throughput: no disponible; la model card menciona aceleracion en CPUs compatibles mediante la cabeza borrador, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kiwi Mind (este) | 6.857.466.410 | no disponible | apache-2.0 | GGUF | Cuantizado de gemma-4-E4B-it, vision y tool-use |
| google/gemma-4-E4B-it | no disponible | no disponible | no disponible | safetensors | Modelo base original |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos equivalentes en la informacion |

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se declaran otros idiomas.
- No se documentan sesgos conocidos, pero al derivar de un modelo base de Google hereda los del original, no evaluados aqui.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La licencia Apache 2.0 se declara en el repositorio, pero conviene verificar las condiciones del modelo base google/gemma-4-E4B-it antes de uso comercial.
- La informacion tecnica es muy escasa: no hay contexto, benchmarks ni detalles de entrenamiento publicados.
- El repositorio incluye un subdirectorio `candidate/` y un archivo `archive-spark-qwen-3.1`, lo que sugiere versiones previas; verificar que se descarga el paquete correcto.
- La decodificacion especulativa solo se ha validado en CPUs compatibles; el rendimiento en otras plataformas no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/yunusemrejr/kiwimind
- Paquete nativo: https://huggingface.co/yunusemrejr/kiwimind/tree/main/candidate
- Manifiesto: https://huggingface.co/yunusemrejr/kiwimind/blob/main/candidate/manifest.json
- Replay de evaluacion Ryzen: https://huggingface.co/yunusemrejr/kiwimind/blob/main/candidate/evals/ryzen-bounded-hatch.json
- Codigo y documentacion de KiwiBro: https://github.com/yunusemrejr/kiwibro
- Releases archivadas Spark y Qwen: https://huggingface.co/yunusemrejr/kiwimind/tree/archive-spark-qwen-3.1
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
