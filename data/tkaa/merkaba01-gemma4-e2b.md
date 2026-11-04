# Tkaa/Merkaba01-Gemma4-E2B

## Resumen

Merkaba01-Gemma4-E2B es un paquete de pesos pre-empaquetados para el motor de inferencia **Merkaba01**, un runtime cognitivo escrito en Rust. El repositorio, publicado por el usuario Tkaa, no contiene un modelo entrenado desde cero, sino una redistribucion cuantizada de los pesos base de **Gemma 4 E2B** de Google, adaptados a los contenedores binarios propios del runtime (`.qcore`, `.merkaba`, `.mbin`). El paquete suma 1.655.338.765 parametros y ocupa 3,4 GB en el repositorio.

La propuesta tecnica es un esquema de cuantizacion hibrida: un nucleo `Q8` + `Q4_G32` con `Anchor-DoRA` en formato `.qcore`, una capa MLP ternaria de 1,58 bits con anclas SVD compartidas en formato `.merkaba`, y tablas de embedding por capa (PLE) a 4 bits en safetensors. El objetivo declarado es ofrecer inferencia local de bajo consumo en el ecosistema Rust, sin depender de PyTorch.

Es relevante ahora por dos motivos: por un lado, explora formatos de cuantizacion extrema (1,58 bits ternarios) sobre una familia de modelos pequena (E2B, presumiblemente la variante "effective 2B"); por otro, su interoperabilidad es nula fuera de su runtime propietario, lo que lo convierte en un caso de estudio de empaquetado binario mas que en un modelo de proposito general. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E2B (detalles de capas y atencion no disponibles); runtime Merkaba01 en Rust |
| Parametros totales | 1.655.338.765 |
| Parametros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8 + Q4_G32 (`Anchor-DoRA`) en `.qcore`; ternario 1,58 bits (`SharedAnchorsSvd`) en `.merkaba`; PLE a 4 bits; pesos base en safetensors de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.qcore`, `.merkaba`, `.mbin`, `model.safetensors`, `model_norms.safetensors`, `tokenizer.json` |

## Arquitectura y entrenamiento

El paquete no documenta un entrenamiento propio: los pesos derivan del modelo base **Gemma 4 E2B** de Google y se redistribuyen bajo Apache 2.0. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aqui. Lo que si describe el autor es el proceso de empaquetado: conversion a contenedores binarios propietarios y aplicacion de un esquema de cuantizacion por capas.

La innovacion tecnica destacable es la mezcla de precisiones. El nucleo `gemma4_e2b_hi_fi_q8q4.qcore` (1,04 GiB) emplea cuantizacion de 8 bits combinada con bloques de 4 bits de granularidad 32 (`Q4_G32`) y una tecnica denominada `Anchor-DoRA`, que el autor no detalla. El fichero `gemma4_e2b_hi_fi.merkaba` (16,9 MiB) contiene las capas MLP en formato ternario de 1,58 bits con anclas SVD compartidas (`SharedAnchorsSvd`), un enfoque de compresion extrema que reduce drasticamente el peso de las matrices MLP a costa de precision. Los tensores de normalizacion y proyeccion se separan en `model_norms.safetensors` (79,4 MiB), y las tablas de embedding por capa (PLE) a 4 bits junto con los embeddings base residen en `model.safetensors` (1,96 GiB). El diseno usa `mmap` sin copia para el nucleo cuantizado, lo que sugiere un enfoque de carga perezosa orientado a dispositivos con RAM limitada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Gemma 4 E2B, aunque no se documentan evaluaciones que confirmen la fidelidad tras la cuantizacion ternaria.
- Codigo y matematicas: presumiblemente presentes por herencia del base, sin datos verificables en la model card.
- Tool calling y function calling: no disponible; la model card no menciona soporte.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Tokenizacion: incluye `tokenizer.json` y `tokenizer.mbin`, un vocabulario binario precompilado con SentencePiece, orientado a carga rapida en el runtime Rust.

## Casos de uso

- Inferencia local en Rust sin PyTorch: el paquete esta disenado para el motor Merkaba01, de modo que encaja en aplicaciones Rust que quieran evitar dependencias de Python y cargar pesos mediante `mmap` zero-copy.
- Despliegue en dispositivos con RAM restringida: la combinacion de nucleo Q8/Q4 (1,04 GiB) y MLP ternaria (16,9 MiB) reduce el peso en memoria frente a los safetensors base (1,96 GiB), lo que permite ejecutar el modelo en equipos modestos siempre que se use el runtime propietario.
- Prototipado de tecnicas de cuantizacion extrema: sirve como referencia para investigar el impacto de capas MLP a 1,58 bits con anclas SVD sobre la calidad de salida de un transformer pequeno.
- Investigacion sobre formatos binarios de pesos: los contenedores `.qcore` y `.merkaba` son un ejemplo de diseno de formato orientado a carga perezosa y mapeo en memoria, util para quien disene runtimes de inferencia.
- Evaluacion comparativa de fidelidad tras cuantizacion: permite medir la degradacion de un modelo Gemma E2B al pasar de pesos completos a la mezcla Q8/Q4/ternaria, si se dispone de la version original como referencia.
- Entornos educativos de sistemas de IA: el codigo y los formatos del runtime Rust pueden usarse para ensenar como se estructura un motor de inferencia y como se empaquetan pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete completo ocupa 3,4 GB en disco; el nucleo cuantizado `.qcore` son 1,04 GiB, los safetensors base 1,96 GiB y las normas 79,4 MiB. La VRAM necesaria depende de si el runtime mantiene el modelo mapeado en memoria o lo carga por completo; no se especifica.
- GPU recomendadas: no disponible. El autor no publica requisitos de GPU ni lista hardware validado.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de un runtime Rust propietario, no se confirma soporte CUDA, ROCm ni Metal.
- Opciones de despliegue: exclusivamente el motor **Merkaba01 Pure-Rust Cognitive Runtime Engine**. El autor indica explicitamente que los ficheros no se pueden cargar en `transformers`, `vLLM` ni `llama.cpp`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Merkaba01-Gemma4-E2B | 1.655.338.765 | no disponible | `.qcore`, `.merkaba`, safetensors | Apache 2.0 | Solo runtime Merkaba01 (Rust) |
| Gemma 4 E2B (base, Google) | no disponible en esta ficha | no disponible | safetensors | Apache 2.0 (segun el autor) | transformers, vLLM, llama.cpp y otros |
| Modelos de ~1,5-2B en formato GGUF | ~1,5-2B | variable | GGUF | variable | llama.cpp, Ollama |

La comparativa directa con alternativas de la misma categoria no es posible con los datos disponibles: no se publican resultados de benchmarks ni especificaciones de contexto del modelo base en la informacion proporcionada. La diferencia practica mas relevante frente al Gemma 4 E2B original es el formato: el paquete de Tkaa solo es utilizable con el runtime Merkaba01, mientras que el modelo base se puede desplegar en el ecosistema estandar.

## Limitaciones y advertencias

- Interoperabilidad nula: los ficheros `.qcore`, `.merkaba` y `.mbin` no se cargan en `transformers`, `vLLM` ni `llama.cpp`; sin el runtime Merkaba01 el paquete es inutilizable.
- Estado alpha: la model card lo etiqueta como `v0.1 Alpha`, lo que implica API y formatos potencialmente inestables.
- Cuantizacion agresiva: las capas MLP a 1,58 bits con anclas SVD pueden degradar la calidad de salida de forma significativa; no se publican evaluaciones que cuantifiquen esa perdida.
- Sesgos conocidos: no documentados en la model card; al heredar los pesos de Gemma 4 E2B, los sesgos del modelo base se mantienen, pero no se detallan.
- Riesgo de alucinacion: no evaluado; sin benchmarks no se puede estimar la tasa de alucinacion tras la cuantizacion.
- Idiomas: no se declara lista de idiomas soportados, lo que impide garantizar cobertura multilingue.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Gemma 4 E2B de Google, ya que el autor afirma que los pesos derivan de el.
- Trazabilidad: el repositorio no registra descargas ni likes y no incluye paper, blog ni repositorio de codigo del runtime; la verificacion independiente es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/Tkaa/Merkaba01-Gemma4-E2B
- Repositorio del runtime Merkaba01: no disponible
- Paper o documentacion tecnica: no disponible
- Blog del autor: no disponible
- Demo: no disponible
