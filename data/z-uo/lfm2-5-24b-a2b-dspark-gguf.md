# z-uo/LFM2.5-24B-A2B-DSpark-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF comunitarias del modelo borrador (draft model) de decodificacion especulativa DSpark para el modelo objetivo LFM2.5-24B-A2B de Liquid AI. No se trata de un modelo generativo autonomo, sino de un componente auxiliar que acelera la inferencia del modelo principal mediante decodificacion especulativa en llama.cpp con soporte CUDA y DSpark. El autor es el usuario z-uo y no es un lanzamiento oficial de Liquid AI.

El modelo base declarado es LiquidAI/LFM2.5-24B-A2B-GGUF, un modelo de arquitectura MoE segun la nomenclatura A2B (parametros activos), aunque los detalles arquitectonicos del modelo objetivo no se documentan en esta ficha. El repositorio aporta tres cuantizaciones del borrador: Q4_K_M, Q6_K y Q8_0, con un tamano total de repo de 0,8 GB.

La relevancia actual reside en que permite reducir la latencia de generacion del modelo LFM2.5-24B-A2B sin reentrenar ni modificar el modelo objetivo, usando el mecanismo de decodificacion especulativa integrado en llama.cpp. El autor reporta una velocidad de generacion de aproximadamente 65 tokens/s con una tasa de aceptacion de borradores del 72,55% en su configuracion de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador para decodificacion especulativa (DSpark) sobre llama.cpp; arquitectura del modelo objetivo no disponible |
| Parametros totales | 327.707.521 (dato de safetensors del repo; corresponde al borrador, no al modelo objetivo de 24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other (consultar terminos del repositorio original de Liquid AI antes de uso o redistribucion) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo borrador DSpark ni del modelo objetivo LFM2.5-24B-A2B. Por la nomenclatura del modelo base (A2B) se infiere un esquema de mezcla de expertos con parametros activos reducidos, pero no se aportan detalles sobre numero de expertos, capas, atencion ni mecanismo de enrutamiento. El borrador se emplea con el tipo de especulacion `draft-dspark` en llama.cpp, con un rango de borradores por paso de entre 1 y 3 (`--spec-draft-n-min 1`, `--spec-draft-n-max 3`).

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas del modelo objetivo. El unico dato de entrenamiento implicito es que el borrador fue producido por Liquid AI como componente del ecosistema LFM2.5 y posteriormente cuantizado por la comunidad a formato GGUF.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: genera borradores de tokens que el modelo objetivo valida, reduciendo la latencia efectiva de generacion.
- Integracion con llama.cpp: soporta el tipo de especulacion `draft-dspark` y los parametros `--spec-draft-n-min` y `--spec-draft-n-max`.
- Compatibilidad con servidor HTTP de llama.cpp (`llama-server`) y despliegue en Docker con NVIDIA Container Toolkit.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Capacidad conversacional heredada del modelo objetivo (tag `conversational`), aunque el borrador en si no se usa de forma autonoma.
- Soporte de plantillas Jinja (`--jinja`) para el formateo de conversaciones del modelo objetivo.
- No se documentan capacidades de vision, audio, tool calling ni agentes para el borrador; dependen del modelo objetivo y no estan disponibles en la informacion proporcionada.

## Casos de uso

- Servicio de chat de baja latencia: desplegar `llama-server` con el modelo objetivo Q4_K_M y el borrador DSpark Q4_K_M para reducir el tiempo hasta el primer token validado en conversaciones multi-turno, usando el endpoint HTTP en el puerto 9931.
- Inferencia en produccion con GPU unica: emplear la configuracion Docker Compose documentada para levantar un servicio reproducible con reserva de GPU NVIDIA y cache persistente de modelos.
- Prototipado de asistentes conversacionales: usar el par objetivo+borrador para iterar sobre prompts y parametros de muestreo (temperatura 0,10, top-k 50, repeat-penalty 1,05) con una velocidad reportada de ~65 tokens/s.
- Evaluacion comparativa de decodificacion especulativa: medir la tasa de aceptacion de borradores (reportada en 72,55%) con distintas cuantizaciones del borrador (Q4_K_M, Q6_K, Q8_0) para ajustar el equilibrio precision/velocidad.
- Despliegue en entornos con requisitos de soberania del dato: ejecutar el stack completo en infraestructura propia con llama.cpp y CUDA, sin dependencia de APIs externas, montando los modelos desde un volumen local (`-md` en lugar de `-hfd`).
- Ajuste de rendimiento por hardware: seleccionar la cuantizacion del borrador segun la VRAM disponible, usando Q4_K_M para maximizar velocidad y Q8_0 para mayor fidelidad de los borradores.

## Benchmarks y rendimiento

Datos observados por el autor con llama.cpp y aceleracion CUDA:

| Metrica | Resultado |
|---|---:|
| Modelo objetivo | LFM2.5-24B-A2B Q4_K_M |
| Modelo borrador | DSpark Q4_K_M |
| Velocidad de generacion | ~65 tokens/s |
| Tokens borrador generados | 51 |
| Tokens aceptados | 37 |
| Tasa de aceptacion de borradores | 72,55% |

El autor advierte que el rendimiento depende de la arquitectura de GPU, la VRAM, la longitud de contexto, la version de llama.cpp, la cuantizacion y los parametros de muestreo, y que son resultados observados, no garantizados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: el repositorio ocupa 0,8 GB en total para las tres cuantizaciones; el borrador individual en Q4_K_M es la opcion mas ligera, aunque no se especifica su tamano exacto por archivo.
- VRAM para el modelo objetivo: no disponible en la informacion proporcionada; el modelo objetivo es de 24B con parametros activos reducidos (A2B) y se distribuye en Q4_K_M, por lo que requiere una GPU con VRAM suficiente para el modelo completo mas el borrador.
- GPU recomendadas: NVIDIA con soporte CUDA; el autor no especifica modelos concretos (A100, H100, RTX 4090). Se requiere VRAM suficiente para objetivo y borrador simultaneamente.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; depende del tamano final del modelo objetivo en Q4_K_M, no documentado aqui.
- Opciones de despliegue: llama.cpp nativo (`llama-server`) y Docker Compose con la imagen `ghcr.io/ggml-org/llama.cpp:full-cuda`. No se documenta soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: ~65 tokens/s en la configuracion de prueba del autor, con 72,55% de aceptacion de borradores y hasta 3 borradores por paso.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de decodificacion especulativa ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo LiquidAI/LFM2.5-24B-A2B-GGUF, que no se incluye en este repositorio y debe descargarse por separado.
- Requiere una version de llama.cpp con soporte CUDA y DSpark; versiones sin ese soporte no podran usar el tipo de especulacion `draft-dspark`.
- Licencia "other": es imprescindible consultar los terminos del repositorio original de Liquid AI antes de cualquier uso comercial o redistribucion. El autor indica explicitamente que no es un lanzamiento oficial.
- Cuantizaciones comunitarias: no han sido validadas por Liquid AI; pueden introducir degradacion en la calidad de los borradores y, por tanto, reducir la tasa de aceptacion.
- Los datos de rendimiento son observaciones puntuales del autor, no cifras garantizadas; pueden variar con hardware, contexto y parametros de muestreo.
- No se documentan sesgos, riesgo de alucinacion, limitaciones de contexto ni idiomas soportados; estas propiedades dependen del modelo objetivo y no estan disponibles en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- El dato de parametros totales (327.707.521) corresponde al borrador segun safetensors y no debe confundirse con los 24B del modelo objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/z-uo/LFM2.5-24B-A2B-DSpark-GGUF
- Modelo objetivo (Liquid AI): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Motor de inferencia llama.cpp: https://github.com/ggml-org/llama.cpp
- Imagen Docker de llama.cpp: ghcr.io/ggml-org/llama.cpp:full-cuda
