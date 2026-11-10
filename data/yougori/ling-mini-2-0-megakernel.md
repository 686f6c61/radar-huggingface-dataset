# Yougori/Ling-mini-2.0-Megakernel

## Resumen

Ling-mini-2.0 Megakernel es una implementación de inferencia optimizada del modelo inclusionAI/Ling-mini-2.0, un Mixture of Experts (MoE) de 16.000 millones de parámetros totales con 1.400 millones activos por token, cuantizado a 4 bits y ejecutado dentro de un único kernel CUDA persistente. El autor, Yougori, no entrena un modelo nuevo: reempaqueta el modelo base en un runtime especializado que fusiona todas las capas en un solo lanzamiento de GPU capaz de generar hasta 256 tokens sin devolver el control a la CPU entre pasos.

La propuesta resuelve un problema clásico de latencia en inferencia de LLM: el lanzamiento secuencial de cientos de kernels pequeños por token deja la GPU parcialmente ociosa entre operaciones. El megakernel mantiene bloques de hilos persistentes en cada streaming multiprocessor, sincroniza mediante barreras de grid y realiza la selección del siguiente token dentro del propio kernel, eliminando la sobrecarga de lanzamiento y la comunicación con el host.

Es relevante para desarrolladores que necesitan inferencia local de baja latencia en GPUs de consumo de la serie RTX 50 (Blackwell, sm_120). En una RTX 5090 Laptop reporta 843 tokens por segundo en un chat único, 1,68 veces más rápido que llama.cpp con el mismo modelo y GPU, con un consumo de memoria de aproximadamente 10 GB para una conversación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (bailing_moe) sobre transformer, con kernel CUDA persistente de inferencia |
| Parametros totales | 16.000 millones (heredados del modelo base Ling-mini-2.0) |
| Parametros activos | 1.400 millones por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (una escala fp16 por cada 64 numeros, round-to-nearest con busqueda de clip por grupo); router, bias, gains de normalizacion e embeddings de entrada en precision original |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | pesos propios del megakernel (repo de 9,6 GB); no safetensors ni GGUF estandar |
| Tamano del repo | 9,6 GB |
| Descargas | 432 |
| Likes | 2 |
| Fecha de creacion | 2026-11-07 |
| Ultima actualizacion | 2026-11-08 |

## Arquitectura y entrenamiento

El modelo base Ling-mini-2.0 es un transformer con arquitectura Mixture of Experts de tipo bailing_moe, con 16.000 millones de parametros totales y 1.400 millones activos por token, que enruta cada token hacia 8 expertos mas uno compartido. Esta ficha no entrena ni ajusta el modelo: aplica una cuantizacion post-entrenamiento a 4 bits sobre todas las matrices de atencion, MLP, expertos y tabla de palabras, manteniendo el router, su bias, las ganancias de normalizacion y los embeddings de entrada en su precision original. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica reside en el runtime, no en los pesos. El kernel es un unico programa CUDA que nunca se detiene entre capas ni entre tokens: mantiene un bloque persistente de hilos en cada SM, usa barreras de grid para sincronizar dependencias entre pasos y fusiona operaciones de modo que cada capa espera solo cuatro veces (las sumas del router se integran en el paso de salida de atencion y las q, k, v de la capa siguiente en el paso down de los expertos, aprovechando que la normalizacion RMS divide por un unico escalar por token). El router selecciona sus 8 expertos y el compartido dentro del lanzamiento, y el kernel elige el siguiente token sin retornar a la CPU. Ademas, la tabla de palabras almacena sus 2.048 dimensiones ocultas ordenadas por importancia y lee solo la mitad relevante de cada fila, completando las 4 mejores filas por warp, lo que coincide con la tabla completa en el 99-99,5% de las posiciones. Para concurrencia, varios chats se ejecutan como copias del kernel en paralelo sobre porciones distintas de los SM con una sola copia del modelo en memoria.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas a preguntas simples y escritura de codigo corto correcto segun las pruebas del autor.
- Razonamiento y codigo: el modelo base Ling-mini-2.0 es un LLM de proposito general; el megakernel preserva esas capacidades con la perdida propia de la cuantizacion a 4 bits.
- Decodificacion greedy dentro del kernel (`mk.greedy`), con seleccion del siguiente token realizada por el propio kernel.
- Procesamiento de prompts mediante `mk.forced(ids)`, que lee el prompt y elige el primer token en su ultimo paso.
- Ejecucion concurrente de hasta cinco chats simultaneos (la aplicacion incluida limita a cinco), cada uno con su propia copia del kernel.
- Interfaz de chat en terminal (`chat.py`) y servidor web local con multiples paneles de conversacion (`server.py`).
- API de Python mediante `LingKernel` combinada con el tokenizador de Transformers.
- No se documentan tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Inferencia local de baja latencia en estaciones de trabajo con RTX 50: el modelo cabe en aproximadamente 10 GB de VRAM y genera 843 tokens por segundo en una sola conversacion, adecuado para asistentes interactivos donde la latencia percibida es critica.
- Servicio de chat multi-sesion en una unica GPU de consumo: con tres chats simultaneos alcanza 1.337 tokens por segundo agregados, lo que permite atender a varios usuarios desde un portatil con RTX 5090 sin infraestructura de servidor.
- Prototipado rapido de aplicaciones conversacionales: el servidor web incluido (`server.py`) expone paneles de conversacion independientes en `http://127.0.0.1:8790`, util para demos y pruebas de UX sin montar un stack de serving completo.
- Evaluacion comparativa de runtimes de inferencia: `bench.py` y `bench.py --chats N` permiten medir throughput frente a llama.cpp con el mismo modelo y GPU, util para decidir el backend en un proyecto.
- Generacion de codigo corto en entornos de desarrollo local: el autor reporta codigo Python correcto en pruebas de chat, con una perplejidad de 6,83 en codigo Python frente a 6,33 del modelo bf16 original.
- Investigacion sobre kernels persistentes y fusion de operaciones: el codigo fuente (`megakernel_ling.cu`) y el paper `megakernel.pdf` sirven como referencia reproducible para estudiar tecnicas de grid barriers, fusion de pasos y decodificacion especulativa a nivel de tabla de palabras.
- Despliegue en Windows x64 sin toolchain CUDA: la DLL `megakernel_ling.dll` incluida permite ejecutar el modelo sin compilar, adecuado para equipos de desarrollo con Windows y GPU Blackwell.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una NVIDIA GeForce RTX 5090 Laptop GPU a 175 W, decodificacion greedy, mediana de ejecuciones en caliente, prompt de 32 tokens y 256 tokens generados por chat, el 6 de noviembre de 2026. llama.cpp corresponde al build CUDA b12144 con el archivo Q4_K_M de bartowski y flash attention activado.

| Chats concurrentes | llama.cpp (tok/s) | Megakernel (tok/s) | Aceleracion |
|---|---:|---:|---:|
| 1 | 502 | 843 | 1,68x |
| 2 | 784 | 1.096 | 1,40x |
| 3 | 992 | 1.337 | 1,35x |
| 4 | 1.164 | 1.371 | 1,18x |
| 5 | 1.320 | 1.403 | 1,06x |

El autor senala que a ocho chats llama.cpp alcanza 1.616 tok/s agregados porque su batch comparte cada lectura de pesos entre conversaciones, mientras que las copias del megakernel no comparten lecturas y la aplicacion incluida ejecuta como maximo cinco a la vez.

Calidad de la cuantizacion, con 256 posiciones por conjunto:

| Metrica | Texto web | Codigo Python |
|---|---:|---:|
| Mismo token top que los mismos pesos 4 bits en fp32 | 98,8% | 98,8% |
| KL frente a los mismos pesos 4 bits en fp32 | 0,0017 | 0,0017 |
| Mismo token top que el modelo bf16 original | 74,6% | 91,0% |
| KL(original ∥ kernel) por token | 0,222 | 0,070 |
| Perplejidad del modelo bf16 original | 41,4 | 6,33 |
| Perplejidad de este kernel | 45,7 | 6,83 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU: NVIDIA GeForce RTX serie 50 (Blackwell, sm_120). Es un requisito explicito del autor; otras arquitecturas no estan soportadas por la DLL incluida.
- VRAM: aproximadamente 10 GB libres para un chat y 12 GB para la aplicacion de varios chats.
- Sistema operativo: Windows x64 con `megakernel_ling.dll` incluida; otros sistemas pueden compilar la libreria desde `megakernel_ling.cu`, aunque solo Windows fue probado.
- Toolchain opcional: CUDA Toolkit 12.8 o superior y `build.cmd` para recompilar la libreria en x64.
- Software: Python 3.10 o superior con PyTorch compilado para CUDA (instalado previamente desde pytorch.org) y las dependencias de `requirements.txt`.
- Despliegue: no se documenta soporte para vLLM, TGI, Ollama ni llama.cpp con estos pesos; el runtime es propio (`ling_kernel.LingKernel`) con aplicaciones de chat, servidor y benchmark incluidas.
- Throughput: 843 tok/s en un chat y hasta 1.403 tok/s agregados con cinco chats en RTX 5090 Laptop a 175 W.
- No cabe en GPUs de consumo de generaciones anteriores (Ampere, Ada) segun los requisitos publicados, al exigir sm_120.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Runtime | Throughput en RTX 5090 Laptop |
|---|---|---|---|---|---|---|
| Ling-mini-2.0 Megakernel | 16B (MoE) | 1,4B | no disponible | apache-2.0 | Megakernel CUDA propio, sm_120 | 843 tok/s (1 chat), 1.403 tok/s (5 chats) |
| Ling-mini-2.0 (4 bits en llama.cpp) | 16B (MoE) | 1,4B | no disponible | apache-2.0 | llama.cpp CUDA b12144, Q4_K_M | 502 tok/s (1 chat), 1.320 tok/s (5 chats), 1.616 tok/s (8 chats) |
| Ling-mini-2.0 original (bf16) | 16B (MoE) | 1,4B | no disponible | apache-2.0 | Transformers u otros | no disponible |

La comparativa se limita al mismo modelo base en distintos formatos y runtimes, porque la informacion proporcionada no incluye datos de modelos alternativos de tamano o categoria equivalentes. La diferencia clave frente a llama.cpp es la latencia en un unico chat (1,68x), mientras que llama.cpp escala mejor en agregado a partir de ocho conversaciones por el reparto de lecturas de pesos entre el batch.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: solo coincide con el token top del modelo bf16 original en el 74,6% de las posiciones en texto web, con una divergencia KL de 0,222 por token y una perplejidad de 45,7 frente a 41,4 del original en ese dominio.
- El autor no midio la calidad de los K-quants de llama.cpp, por lo que no hay comparacion directa de fidelidad entre ambos formatos.
- La seleccion de tokens de la tabla de palabras truncada coincide con la tabla completa en el 99-99,5% de las posiciones; el resto son desempates cercanos que pueden alterar la salida.
- Requisito de hardware muy restrictivo: solo GPUs Blackwell sm_120 (RTX serie 50) y, en la practica, solo Windows x64 fue probado; no hay soporte documentado para A100, H100 ni GPUs de consumo anteriores.
- Idiomas: unicamente ingles segun los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto soportada por el kernel; el benchmark usa prompts de 32 tokens y el kernel procesa hasta 256 tokens por lanzamiento, lo que sugiere un limite practico bajo no especificado.
- Concurrencia limitada: las aplicaciones incluidas ejecutan como maximo cinco chats a la vez y no comparten lecturas de pesos, por lo que el throughput agregado se estanca frente a llama.cpp en cargas altas.
- No se documentan tool calling, agentes, vision ni otras capacidades avanzadas; el uso esta orientado a generacion de texto conversacional.
- Riesgo de alucinacion inherente al modelo base, no evaluado en la informacion disponible.
- Sesgos del modelo base no documentados en la informacion proporcionada.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y sus pesos deben verificarse por separado; el autor no detalla obligaciones adicionales.
- Dependencia de PyTorch con CUDA y de una DLL precompilada solo para Windows; el soporte en Linux o macOS queda como compilacion no probada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yougori/Ling-mini-2.0-Megakernel
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Paper del megakernel: `megakernel.pdf` (incluido en el repositorio del modelo)
- Codigo fuente del kernel: `megakernel_ling.cu` (incluido en el repositorio del modelo)
- Aplicaciones incluidas: `chat.py`, `server.py`, `bench.py`
- Build alternativo: `build.cmd` (requiere CUDA Toolkit 12.8 o superior)
