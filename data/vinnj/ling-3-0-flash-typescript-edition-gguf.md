# vinnj/Ling-3.0-flash-TypeScript-Edition-GGUF

## Resumen

Ling-3.0-flash-TypeScript-Edition-GGUF es una cuantizacion GGUF del modelo base inclusionAI/Ling-3.0-flash, publicada por el usuario vinnj (proyecto Kraits) el 4 de noviembre de 2026. No se trata de un modelo entrenado desde cero, sino de una version especializada del Ling-3.0-flash orientada a generacion de codigo TypeScript, empaquetada en formato Q4_K_M (20.395.487.680 bytes) con una lista de anclaje de expertos (pin list) que permite ejecutarla en un Mac de 16 GB. El modelo base cuenta con 33.777.908.192 parametros totales y arquitectura de mezcla de expertos (MoE), con 128 expertos por capa segun la model card.

La relevancia de esta publicacion es fundamentalmente practica: el autor distribuye tambien el plugin Kraits 0.6.16, una extension de llama.cpp que mantiene en memoria GPU los expertos mas usados (un banco de 8,8 GB) y transmite desde el SSD los expertos frios, permitiendo inferencia MoE en hardware consumer de gama media. El modelo esta pensado para tareas de programacion TypeScript (Express, genericos, async, Jest, React, migracion de JS a TS estricto) y declara soporte solo para ingles.

La ficha describe tanto el modelo base (arquitectura, parametros, licencia) como el artefacto GGUF concreto publicado en este repositorio, incluyendo el runtime propietario necesario para ejecutarlo. Conviene tener presente que el repositorio contiene las librerias del plugin Kraits, no `llama-server`, y que cada release del plugin esta bloqueada a un unico fichero de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), 128 expertos por capa (segun model card del autor) |
| Parametros totales | 33.777.908.192 (33,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado, 20.395.487.680 bytes) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base inclusionAI/Ling-3.0-flash es un transformer con arquitectura de mezcla de expertos (MoE) de 33,8 mil millones de parametros totales y 128 expertos por capa, segun la informacion aportada por el autor de la cuantizacion. No se dispone de datos sobre el numero de parametros activos por token, la longitud de contexto nativa, el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o similar; esa informacion no aparece en la documentacion proporcionada y debe consultarse en la model card del modelo base.

La innovacion tecnica destacable de esta publicacion no esta en el modelo sino en el runtime: Kraits 0.6.16 es un plugin de llama.cpp (compilado contra llama.cpp b11936 y ggml-base 0.27.0) que implementa un esquema de expertos anclados. Al cargar, fija en memoria GPU cableada un banco de 8,8 GB con los expertos mas calientes (definidos en el fichero `Ling-3.0-flash-TS128-Q4_K_M.kraits-pins.txt`) y transmite bajo demanda desde el SSD los expertos frios. Esto permite ejecutar un MoE de 20,4 GB en un Mac con 16 GB de memoria unificada, a costa de latencia adicional en la lectura de expertos no anclados. El plugin rechaza cualquier fichero distinto al modelo para el que fue compilado y sirve una API compatible con OpenAI en el puerto elegido (8080 por defecto), con una sola peticion concurrente.

## Capacidades

- Generacion de codigo TypeScript: el modelo se distribuye especificamente para tareas de programacion en TS, con resultados medidos en seis categorias (Express, genericos, async, Jest, migracion JS a TS estricto y React).
- Generacion de texto general y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y resolucion de tareas de programacion con compilacion estricta y ejecucion de tests como criterio de evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.
- Servicio mediante API compatible con OpenAI a traves de `kraits-server.sh`.

## Casos de uso

- Asistencia de programacion TypeScript en local: el modelo se ejecuta integramente en un Mac de 16 GB sin enviar codigo a la nube, lo que lo hace adecuado para entornos con requisitos de confidencialidad (codigo propietario, datos de clientes). La model card reporta 12-17 tokens/s de escritura en un Mac mini M4.
- Generacion de endpoints Express: la evaluacion del autor incluye 7 de 8 tareas de Express resueltas; el modelo puede emplearse para esbozar rutas, middlewares y validacion en proyectos Node/TS.
- Refactorizacion y migracion de JavaScript a TypeScript estricto: la prueba JS-to-Strict-TS obtuvo 8 de 8, por lo que el modelo es util para anotar tipos, definir interfaces y resolver errores de compilacion en modo `strict`.
- Generacion de tests con Jest: la prueba de Jest obtuvo 8 de 8; el modelo puede redactar suites de pruebas unitarias a partir de codigo existente.
- Componentes React tipados: la prueba de React obtuvo 8 de 8; util para generar componentes funcionales con props tipadas y hooks.
- Prototipado offline en estaciones de trabajo Apple Silicon: gracias al runtime Kraits y al anclaje de expertos, se puede desplegar un asistente de codigo en un portatil o mini de 16 GB sin GPU dedicada, con una sola peticion concurrente.
- Evaluacion de tecnicas de inferencia MoE con offloading a SSD: el repositorio y el plugin sirven como banco de pruebas para medir el impacto del anclaje de expertos en latencia y throughput.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card del autor, medidos en un Mac mini M4 de 16 GB el 4 de noviembre de 2026, con temperatura 0 y el lanzador tal cual se distribuye. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Lectura (prompt) | 32-44 tokens/s |
| Escritura (generacion) | 12-17 tokens/s |
| Tareas TypeScript juzgadas (compilacion estricta + tests) | 45 de 48 |
| Desglose: Express | 7 de 8 |
| Desglose: Genericos | 6 de 8 |
| Desglose: Async | 8 de 8 |
| Desglose: Jest | 8 de 8 |
| Desglose: JS a TS estricto | 8 de 8 |
| Desglose: React | 8 de 8 |

| Comparativa declarada por el autor | Puntuacion |
|---|---|
| Ling-3.0-flash-TS128-Q4_K_M (Kraits 0.6.16) | 45 de 48 |
| Gemma 4 (26B-A4B, q4_0) | 41 de 48 |
| gpt-5-mini | 47 de 48 |

## Requisitos de hardware

- VRAM/memoria unificada: 16 GB minimo en Apple Silicon; el plugin reserva un banco de 8,8 GB de expertos en memoria GPU cableada y transmite el resto desde el SSD.
- GPU recomendadas: Apple silicon (M1/M2/M3/M4) con 16 GB o mas; la medicion oficial se hizo en un Mac mini M4 de 16 GB.
- Cabe en GPU consumer: si, en Mac con memoria unificada de 16 GB; no hay datos para GPUs NVIDIA consumer (RTX 4090, etc.) en la informacion disponible.
- Sistema operativo: macOS 15 o posterior; el bundle publicado es `kraits-v0.6.16-macos-arm64.tar.gz` (solo arm64).
- Opciones de despliegue: Kraits 0.6.16 (plugin de llama.cpp, compilado contra llama.cpp b11936 y ggml-base 0.27.0) mediante `kraits-server.sh`; expone API compatible con OpenAI. No se documenta soporte para vLLM, Ollama o TGI en la informacion disponible.
- Almacenamiento: se necesita el fichero GGUF de 20,4 GB mas el pin list junto a el; se recomienda SSD rapido por el streaming de expertos frios.
- Latencia y throughput: 32-44 tokens/s de lectura y 12-17 tokens/s de escritura en Mac mini M4 de 16 GB; una sola peticion concurrente.
- Verificacion de integridad: `shasum -a 256` debe devolver `e9ae4335a36ed49e8262add1099459a807692edb18c6252ba855f0923c52f602`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento TS (segun autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash-TS128-Q4_K_M (esta ficha) | 33,8 mil M totales (MoE, 128 expertos/capa) | no disponible | 45 de 48 | Apache 2.0 | GGUF + plugin Kraits (macOS arm64) |
| Gemma 4 26B-A4B (q4_0) | 26 mil M (MoE, A4B) | no disponible | 41 de 48 | licencia Gemma (consultar) | GGUF oficial de Google |
| Qwen3.6-35B-A3B (UD-Q4_K_M) | 35 mil M (MoE, A3B) | no disponible | no evaluado en TS por el autor (9,5 tokens/s en modo exacto) | consultar repositorio de Unsloth | GGUF de Unsloth |
| gpt-5-mini | no disponible | no disponible | 47 de 48 | propietaria | API de OpenAI |

## Limitaciones y advertencias

- El repositorio contiene las librerias del plugin Kraits (`bin/`), no `llama-server`; es necesario descargar el bundle de release desde GitHub para ejecutar el modelo.
- El runtime Kraits 0.6.16 esta bloqueado al fichero exacto `Ling-3.0-flash-TS128-Q4_K_M.gguf` (20.395.487.680 bytes) y rechaza cualquier otro; no es un GGUF generico cargable en cualquier build de llama.cpp.
- Solo macOS 15 o posterior en Apple Silicon arm64; no hay builds para Linux, Windows ni x86.
- Una sola peticion concurrente en el servidor: no apto para cargas con alta concurrencia sin replicar instancias.
- Idioma limitado al ingles segun el campo `language`; no se garantiza calidad en castellano ni en otros idiomas.
- Especializacion en TypeScript: el ajuste y la seleccion de expertos estan orientados a codigo TS; el rendimiento en otras tareas (texto general, otros lenguajes) no esta documentado y puede degradarse.
- Riesgo de alucinacion en APIs, firmas de librerias y versiones de paquetes: los benchmarks del autor se basan en 6 tareas y 48 comprobaciones, muestra pequena; no hay evaluacion independiente.
- Los benchmarks son autoinformados por el autor del plugin, no por InclusionAI ni por un tercero; deben tomarse como indicativos.
- La licencia Apache 2.0 aplica al artefacto y al plugin; el modelo base conserva su propia licencia, que debe verificarse en `inclusionAI/Ling-3.0-flash` antes de uso comercial.
- Al transmitir expertos desde el SSD, el rendimiento depende de la velocidad del almacenamiento; en discos lentos la latencia de escritura puede caer por debajo de los 12 tokens/s reportados.
- La fecha de creacion del repositorio (2026-11-04) y el numero de version de llama.cpp (b11936) deben contrastarse con el estado actual del ecosistema antes de desplegar en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vinnj/Ling-3.0-flash-TypeScript-Edition-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Release Kraits v0.6.16: https://github.com/1picassoai/kraits/releases/tag/v0.6.16
- Bundle macOS arm64: https://github.com/1picassoai/kraits/releases/download/v0.6.16/kraits-v0.6.16-macos-arm64.tar.gz
- Repositorio Kraits: https://github.com/1picassoai/kraits
- llama.cpp y ggml: https://github.com/ggml-org/llama.cpp
- Candle (Hugging Face): https://github.com/huggingface/candle
- Gemma 4 26B-A4B (referencia comparativa): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Qwen3.6-35B-A3B GGUF de Unsloth (referencia comparativa): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Perfil de Qwen: https://huggingface.co/Qwen
- Perfil de Unsloth: https://huggingface.co/unsloth
