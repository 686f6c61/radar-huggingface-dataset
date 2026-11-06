# WindSekirun/gemma-4-12B-it-oQ8e-bf16-mtp

## Resumen

gemma-4-12B-it-oQ8e-bf16-mtp es una cuantizacion de 8 bits en precision mixta del modelo google/gemma-4-12B-it, publicada por el usuario WindSekirun. Se distribuye en formato MLX safetensors, pensado para ejecucion en Apple Silicon mediante la libreria MLX, e incorpora fusionado en BF16 el modelo asistente oficial de Gemma 4 12B (google/gemma-4-12B-it-assistant), lo que habilita decodificacion especulativa multitoken (MTP) sobre el modelo base.

El modelo base es un transformer de 12.382.587.188 parametros (unos 12,4 mil millones), segun los pesos reales en safetensors, con licencia Apache 2.0. Esta variante no anade capacidades nuevas: su proposito es reducir el peso de los pesos (repositorio de 13,6 GB) manteniendo la mayor parte de la calidad del original, con un esquema de cuantizacion oQ8e de grupo 64 generado con oMLX v0.7.2.

Es relevante para desarrolladores que quieran desplegar Gemma 4 12B en Macs con memoria unificada y aprovechar la aceleracion del asistente MTP, evitando tener que cuantizar y fusionar los pesos por su cuenta. La ficha se limita a los datos verificables en la model card y en los metadatos de Hugging Face; todo lo no publicado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (tipo de modelo `gemma4_unified`, segun la model card) |
| Parametros totales | 12.382.587.188 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en precision mixta (oQ8e), group size 64; asistente MTP fusionado en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (repo de 13,6 GB) |

## Arquitectura y entrenamiento

La model card identifica el tipo de modelo como `gemma4_unified` y describe una cuantizacion mixta de 8 bits con group size 64, realizada con oQ (oMLX v0.7.2). El resultado se empaqueta en safetensors para MLX. Ademas, el asistente oficial google/gemma-4-12B-it-assistant se fusiona en BF16 dentro del mismo repositorio, de modo que el artefacto contiene tanto el modelo principal cuantizado como el cabezal/asistente para decodificacion especulativa multitoken.

No se publican en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones de atencion (atencion lineal, SSM, hibridos) mas alla de la etiqueta `gemma4_unified`. La innovacion practica de esta publicacion es la fusion del asistente MTP en BF16 junto con los pesos cuantizados, lo que permite usar decodificacion especulativa sin gestionar dos artefactos separados.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de google/gemma-4-12B-it (no se detallan capacidades especificas en la model card).
- Decodificacion especulativa multitoken (MTP) mediante el asistente google/gemma-4-12B-it-assistant fusionado en BF16.
- Ejecucion nativa en Apple Silicon a traves de MLX (libreria declarada: `mlx`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados en los metadatos).
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX safetensors y los 13,6 GB del repositorio permiten cargar el modelo en equipos Apple Silicon con RAM suficiente, sin depender de CUDA ni de servicios en la nube.
- Aceleracion de generacion con MTP: al incluir el asistente fusionado en BF16, se puede activar decodificacion especulativa para reducir la latencia por token en tareas de generacion larga, como resumenes o redaccion asistida.
- Prototipado de asistentes conversacionales: un modelo de 12,4 mil millones de parametros cuantizado a 8 bits sirve para iterar sobre prompts y flujos conversacionales en local antes de pasar a produccion.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de oQ8e frente al modelo base en BF16 en tareas concretas del equipo, dado que se conserva la referencia del modelo original.
- Procesamiento por lotes en estaciones de trabajo: ejecucion de tareas de generacion de texto (clasificacion, extraccion, reformulacion) en un Mac de sobremesa sin GPU dedicada.
- Desarrollo de herramientas y demos offline: integracion en aplicaciones de escritorio basadas en MLX que requieran un modelo de lenguaje autocontenido y con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 13,6 GB; en memoria unificada de Apple Silicon se recomienda al menos 16 GB de RAM para cargar los pesos cuantizados y dejar margen para el contexto y el asistente MTP en BF16.
- GPU recomendadas: no aplica CUDA; el destino es Apple Silicon (M-series) mediante MLX. No hay datos de rendimiento en A100, H100 ni RTX 4090 para este artefacto.
- Compatibilidad con GPU de consumo: si, en Macs con memoria unificada suficiente (16 GB o mas segun la estimacion anterior); no se documenta soporte para GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: MLX y oMLX (herramienta con la que se genero la cuantizacion). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WindSekirun/gemma-4-12B-it-oQ8e-bf16-mtp | 12,38 B | no disponible | MLX safetensors, 8 bits oQ8e + MTP BF16 | Apache 2.0 | Cuantizacion de terceros con asistente fusionado |
| google/gemma-4-12B-it | 12,38 B (segun el derivado) | no disponible | safetensors (original) | Apache 2.0 | Modelo base oficial; mayor precision, mayor peso |
| google/gemma-4-12B-it-assistant | no disponible | no disponible | safetensors | Apache 2.0 | Asistente MTP oficial, usado aqui fusionado en BF16 |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion de terceros: el artefacto lo publica WindSekirun, no Google; no hay garantia de equivalencia exacta con el modelo base oficial.
- Perdida de calidad por cuantizacion: oQ8e es precision mixta de 8 bits, por lo que puede degradar ligeramente el rendimiento frente al modelo base en BF16; no se publican mediciones.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinacion para esta variante; se heredan los riesgos del modelo base, no descritos en la informacion disponible.
- Idiomas: no se declaran idiomas soportados en los metadatos, lo que impide garantizar cobertura multilingue.
- Contexto: la longitud de contexto no esta publicada; conviene verificarla contra la model card del modelo base antes de usarla en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base y del asistente de Google por si anaden terminos adicionales.
- Dependencia de plataforma: el formato MLX limita el despliegue a entornos Apple Silicon; no es portable a CUDA sin reconvertir los pesos.
- Madurez: 42 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WindSekirun/gemma-4-12B-it-oQ8e-bf16-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Asistente MTP oficial: https://huggingface.co/google/gemma-4-12B-it-assistant
