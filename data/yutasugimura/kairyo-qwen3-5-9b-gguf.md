# YutaSugimura/Kairyo-Qwen3.5-9B-GGUF

## Resumen

Kairyo-Qwen3.5-9B-GGUF es la distribucion en formato GGUF del modelo Kairyo-Qwen3.5-9B, un modelo multimodal de 9.197.093.888 parametros desarrollado por YutaSugimura. Se trata de un destilado de Qwen/Qwen3.5-9B que utiliza Qwen/Qwen3.8-27B como modelo profesor, orientado a tareas de razonamiento, conversacion e interpretacion de imagenes. La ficha corresponde exclusivamente a la version cuantizada Q8_0 publicada para su uso con llama.cpp y LM Studio.

El modelo es de caracter no oficial: no esta publicado, afiliado ni respaldado por el equipo de Qwen ni por Alibaba Cloud, a pesar de heredar la arquitectura y la licencia Apache 2.0 de los modelos base. Esta construido sobre la familia Qwen3.5 e incorpora una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa en llama.cpp, lo que se traduce en una mejora de velocidad de generacion medible en hardware de consumo.

Su relevancia practica radica en que ofrece capacidades multimodales (entrada de imagen y texto) y modo de razonamiento activado por defecto en un paquete de menos de 10 GB, ejecutable en un Apple M4 Pro de 64 GB a 46-51 tokens/s con decodificacion especulativa. La cuantizacion Q8_0 preserva la cabeza MTP y se acompana de un codificador visual independiente en F16 de 0,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5, con cabeza MTP para decodificacion especulativa (no se detalla la arquitectura interna completa) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens recomendados como minimo; LM Studio estima consumo para 32k y 128k, por lo que se infiere soporte de al menos 128k (no confirmado oficialmente) |
| Tipos de cuantizacion | Q8_0 (modelo de lenguaje) y F16 (codificador visual mmproj) |
| Idiomas soportados | no disponible; se mencionan pruebas correctas en japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde pesos bf16 con llama.cpp b11886) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Qwen3.5, un transformer multimodal que acepta entrada de imagen y texto (pipeline image-text-to-text). Sobre la base Qwen/Qwen3.5-9B se aplico un proceso de destilacion utilizando Qwen/Qwen3.8-27B como modelo profesor, lo que transfiere capacidades del modelo grande a uno de 9.197 millones de parametros. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion se remite a la model card principal del modelo no cuantizado.

La innovacion tecnica destacable es la incorporacion de una cabeza MTP (multi-token prediction) dentro de los pesos del modelo de lenguaje (442 tensores en el archivo Q8_0). Esta cabeza permite decodificacion especulativa con `--spec-type draft-mtp` en llama.cpp, acelerando la generacion sin necesidad de un modelo borrador separado. La conversion a GGUF se realizo con llama.cpp b11886 a partir de los pesos bf16, y el codificador visual se distribuye como archivo mmproj independiente en F16.

## Capacidades

- Generacion de texto conversacional multi-turno, con modo de razonamiento (thinking) activado por defecto.
- Razonamiento aritmetico y matematico; la model card reporta respuestas correctas en pruebas de aritmetica.
- Interpretacion de imagenes: responde preguntas simples sobre imagenes mediante el codificador visual mmproj.
- Capacidades multilingues: se verifico funcionamiento correcto en japones; el resto de idiomas no esta documentado.
- Memoria de contexto largo: reproduccion exacta de un poema a partir de una conversacion de 15.000 tokens.
- Decodificacion especulativa mediante cabeza MTP integrada, compatible con llama.cpp y LM Studio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo mantiene coherencia en conversaciones de al menos 15.000 tokens, lo que permite usarlo como asistente personal en escritorio con memoria de sesion prolongada.
- Analisis de imagenes en local: gracias al codificador visual mmproj en F16, puede responder preguntas sobre capturas, diagramas o fotografias sin enviar datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Razonamiento aritmetico y resolucion de problemas paso a paso: el modo thinking activado por defecto lo hace util para calculos, verificaciones y explicaciones detalladas en herramientas de productividad.
- Procesamiento de documentacion en japones: al haberse validado su rendimiento en ese idioma, sirve para tareas de resumen, traduccion o asistencia en flujos de trabajo con contenido japones.
- Despliegue en estaciones de trabajo Apple Silicon: con unos 10 GB de memoria en un M4 Pro de 64 GB y 46-51 tokens/s, es viable como modelo principal en un portatil o mini de Apple para desarrollo y prototipado.
- Generacion de texto en pipelines de CI o scripts: la integracion con llama.cpp permite invocarlo desde herramientas de linea de comandos para tareas de generacion, clasificacion o extraccion de texto por lotes.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite evaluar y comparar tecnicas de aceleracion de inferencia sin modelos auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los benchmarks del modelo se encuentran en la model card principal del modelo no cuantizado y que el archivo Q8_0 no fue evaluado por separado. Los unicos datos de rendimiento medidos son de inferencia en Apple M4 Pro (64 GB) con LM Studio 0.4.26 y 32k de contexto: 46-51 tokens/s con Draft MTP activado y 40-49 tokens/s sin el. No se midio la tasa de aceptacion de la decodificacion especulativa ni se evaluo la capacidad de imagen.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 10 GB en uso real con 32k de contexto en Apple M4 Pro; LM Studio estima 13,4 GB con 32k de contexto y 20,6 GB con 128k. El archivo Q8_0 ocupa 9,8 GB y el mmproj 0,9 GB.
- GPU recomendadas: no se especifican modelos concretos. El unico hardware validado en la informacion es un Apple M4 Pro de 64 GB.
- GPU de consumo: con ~10-13 GB necesarios para 32k de contexto, el modelo puede caber en GPUs con 16 GB o mas de VRAM, aunque no se ha verificado en la informacion proporcionada.
- Opciones de despliegue: llama.cpp (probado con b11886) y LM Studio 0.4.26. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 46-51 tokens/s con Draft MTP y 40-49 tokens/s sin el, medidos en Apple M4 Pro con 32k de contexto.
- Parametros de inferencia recomendados: temperatura 0,6, top_p 0,95, top_k 20, min_p 0, sin penalizacion de repeticion y al menos 32k de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kairyo-Qwen3.5-9B-GGUF | 9.197 M | 32k recomendado (128k estimado) | GGUF Q8_0 + mmproj F16 | Apache 2.0 | Destilado de Qwen3.5-9B con Qwen3.8-27B; no oficial |
| Qwen/Qwen3.5-9B | 9B (no confirmado en la informacion) | no disponible | bf16 (original) | Apache 2.0 | Modelo base oficial de Qwen; sin destilacion |
| Qwen/Qwen3.8-27B | 27B (no confirmado en la informacion) | no disponible | no disponible | Apache 2.0 | Modelo profesor empleado en la destilacion |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo no oficial: no esta publicado, afiliado ni respaldado por el equipo de Qwen ni por Alibaba Cloud; su calidad y mantenimiento dependen del autor individual.
- Sin benchmarks publicados para esta cuantizacion: el archivo Q8_0 no fue evaluado por separado, y la capacidad de imagen no fue medida.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a los modelos de lenguaje; debe validarse en produccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas: solo se valida el japones en las pruebas descritas; el resto de idiomas no esta documentado, lo que limita su uso fiable en castellano u otras lenguas sin evaluacion previa.
- Contexto: se recomienda un minimo de 32k tokens para evitar que el razonamiento se corte; con contextos mayores el consumo de memoria crece hasta unos 20,6 GB estimados para 128k.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un derivado no oficial conviene revisar las condiciones de los modelos base Qwen3.5-9B y Qwen3.8-27B antes de distribuirlo en productos.
- Decodificacion especulativa: la tasa de aceptacion de la cabeza MTP no fue medida, por lo que la ganancia de velocidad puede variar segun la carga y el hardware.

## Enlaces

- Repositorio GGUF: https://huggingface.co/YutaSugimura/Kairyo-Qwen3.5-9B-GGUF
- Modelo base no cuantizado: https://huggingface.co/YutaSugimura/Kairyo-Qwen3.5-9B
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
