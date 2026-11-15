# thanatchon36/one-gpu-capacity

## Resumen

`thanatchon36/one-gpu-capacity` no es un modelo de lenguaje neuronal, sino un artefacto de investigación que contiene los parámetros calibrados de un modelo analítico de capacidad para inferencia de LLM. Lo publica Thanatchon Chongmankhong (noviembre de 2026) como material complementario de su preprint *How Many Users Can One GPU Serve? A Capacity Law for LLM Inference from Consumer Cards to Datacenter Accelerators*. El repositorio aloja ficheros de calibración (`calibration.json`, `gpus.csv`, `models.csv`), no pesos de red neuronal.

El "modelo" combina tres piezas: un roofline de tokens por iteración de motor, un modelo de nacimiento-muerte sobre una población cerrada de usuarios y un simulador a nivel de iteración de *continuous batching* con memoria KV paginada. Sus pocos parámetros de eficiencia se ajustaron contra benchmarks públicos (LLM-Inference-Bench, MLPerf Inference). Resuelve el problema de estimar cuántos usuarios concurrentes puede atender una GPU antes de desplegar, sin necesidad de medir hardware.

Es relevante para equipos de plataforma e investigadores en *serving* porque ofrece una ley de capacidad transferible entre tarjetas de consumo y aceleradores de centro de datos, con validación cuantitativa publicada (MAPE del 10,4 % y 8,7 % en latencia de batch, y Spearman ρ = 0,99 en velocidad de decodificación en tarjetas de consumo). La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo analítico: roofline de tokens + modelo de nacimiento-muerte + simulador de continuous batching con KV paginada (no es una red neuronal) |
| Parametros totales | no disponible (no contiene pesos; parámetros de ajuste en `calibration.json`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo predice latencia y capacidad en función de la configuración de KV, no fija contexto propio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | JSON y CSV (`calibration.json`, `gpus.csv`, `models.csv`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto implementa un modelo de rendimiento en tres capas. La primera es un roofline por iteración de motor con la forma `t₀ + a·(secuencias) + smooth-max(bytes / (η_β·ancho de banda), FLOPs / (η_c·cómputo))`. La segunda es un modelo de nacimiento-muerte de una población cerrada de usuarios. La tercera es un simulador a nivel de iteración de *continuous batching* con memoria KV paginada. El código está escrito en C (simulador) con una referencia en Python.

El ajuste se realizó sobre latencias de batch en una sola GPU procedentes de LLM-Inference-Bench (A100 40 GB, H100 SXM, GH200; cuatro modelos de 7–8B), con 188 filas para vLLM y 184 para TensorRT-LLM. Los parámetros ajustados son: para vLLM, η_β = 0,77, η_c = 0,61, t₀ = 2,2 ms, a = 81 µs/secuencia (MAPE leave-one-GPU-out del 10,4 %); para TensorRT-LLM, η_β = 0,78, η_c = 0,56, t₀ = 1,4 ms, a = 19 µs/secuencia (MAPE del 8,7 %). No hay RLHF ni DPO: no se entrena ninguna red. La eficiencia de cómputo está débilmente identificada porque los benchmarks son mayoritariamente limitados por ancho de banda; la incertidumbre se propaga con un *cluster bootstrap*.

## Capacidades

- Predicción de tiempo por paso (*step time*) de una iteración de motor de inferencia en función de la GPU, el modelo y la configuración de batching.
- Estimación de capacidad: número de usuarios concurrentes que una GPU puede sostener bajo un objetivo de latencia.
- Simulación a nivel de iteración de *continuous batching* con memoria KV paginada.
- Modelado de colas mediante un proceso de nacimiento-muerte sobre población cerrada de usuarios.
- Transferencia entre hardware: ajuste realizado solo en tarjetas de centro de datos y validado en tarjetas de consumo (Spearman ρ = 0,99).
- Catálogos de hardware y arquitecturas incluidos (`gpus.csv`, `models.csv`) para evaluar el modelo.
- No soporta tool calling, agentes, razonamiento, visión, audio ni capacidades multilingües: no es un LLM.

## Casos de uso

- Planificación de capacidad antes de desplegar: estimar cuántos usuarios concurrentes admite una GPU concreta con un modelo de 7–8B y un objetivo de latencia, usando `capacity` del paquete `ogc` en lugar de realizar pruebas de carga costosas.
- Selección de GPU para un servicio: comparar A100 40 GB, H100 SXM, GH200 y tarjetas de consumo con el catálogo `gpus.csv` para decidir qué acelerador cumple el SLO antes de comprar o alquilar.
- Elección de motor de inferencia: contrastar vLLM y TensorRT-LLM con sus parámetros calibrados (η_β, η_c, t₀, a) para estimar qué motor ofrece menor tiempo por paso en un escenario dado.
- Dimensionado de memoria KV: el simulador con KV paginada permite explorar el efecto de la ocupación de KV y del batching sobre la latencia y la capacidad.
- Investigación en sistemas de serving: reproducir los experimentos del paper (V1–V4) y extender el modelo a nuevas GPUs o motores con los datos del dataset asociado.
- Validación de presupuestos de infraestructura: usar las predicciones de capacidad para justificar el número de GPUs necesario ante un pico de usuarios, con la incertidumbre cuantificada del ajuste.
- Docencia y análisis de rendimiento: el código en C y la referencia en Python sirven para ilustrar roofline, teoría de colas y continuous batching en cursos de sistemas.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card:

| Capa | Prueba | Resultado |
|---|---|---|
| V1 | Simulador frente a resultados exactos de colas | Todas las identidades dentro del IC del 95 % |
| V2 | Latencia de batch leave-one-GPU-out | MAPE 10,4 % (vLLM), 8,7 % (TensorRT-LLM) |
| V3 | Velocidad de decodificación en tarjeta de consumo, ajustada solo con tarjetas de centro de datos | Spearman ρ = 0,99 |
| V4 | 48 sistemas MLPerf Inference, con la calibración congelada | 90 % dentro de 0,67–1,5× |

Parámetros ajustados por motor:

| Motor | η_β | η_c | t₀ (ms) | a (µs/secuencia) | Filas | MAPE leave-one-GPU-out |
|---|---:|---:|---:|---:|---:|---:|
| vLLM | 0,77 | 0,61 | 2,2 | 81 | 188 | 10,4 % |
| TensorRT-LLM | 0,78 | 0,56 | 1,4 | 19 | 184 | 8,7 % |

## Requisitos de hardware

- No requiere GPU para ejecutarse: el simulador es un programa en C con referencia en Python que consume `calibration.json`, `gpus.csv` y `models.csv`.
- Entorno de ejecución: Python con las dependencias de `requirements.txt` del repositorio de GitHub; no necesita CUDA ni drivers de NVIDIA.
- No aplica VRAM para inferencia del artefacto; la VRAM que predice corresponde al modelo LLM simulado, no a este repositorio.
- Despliegue: clonar `https://github.com/thanatchon36/one-gpu-capacity`, instalar dependencias y usar `PYTHONPATH=src python -c "from ogc import capacity; help(capacity)"`.
- Latencia y throughput: no disponibles para el propio artefacto; el modelo predice los del LLM simulado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| one-gpu-capacity | Modelo analítico de capacidad | No aplica (JSON/CSV) | No aplica | MAPE 8,7–10,4 %; ρ = 0,99; 90 % de 48 sistemas MLPerf en 0,67–1,5× | MIT | Hugging Face + GitHub |
| Vidur | Simulador de serving de LLM | No aplica | No aplica | No disponible | No disponible | No disponible |
| LLM-Inference-Bench | Benchmark de latencia de inferencia | No aplica | No aplica | Datos medidos en A100, H100, GH200 | No disponible | No disponible |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- No se midió ninguna GPU: todas las predicciones proceden de ajuste sobre benchmarks públicos.
- Las predicciones fuera del rango calibrado son extrapolaciones: otros motores distintos de vLLM y TensorRT-LLM, decodificación especulativa, paralelismo tensorial multi-GPU y sobre-suscripción intensa de KV (véase §12 del paper).
- La eficiencia de cómputo (η_c) está débilmente identificada porque los benchmarks son mayoritariamente limitados por ancho de banda; la incertidumbre se propaga con *cluster bootstrap*.
- El ajuste se realizó sobre cuatro modelos de 7–8B; la validez para modelos de mayor tamaño no está garantizada por la información disponible.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. No debe confundirse con un LLM al buscarlo en Hugging Face.
- No hay datos sobre sesgos, alucinación o limitaciones idiomáticas porque no procesa lenguaje.
- Licencia MIT: permite uso comercial y modificación con atribución; no se especifican restricciones adicionales en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; es un artefacto de investigación reciente y poco contrastado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thanatchon36/one-gpu-capacity
- Dataset: https://huggingface.co/datasets/thanatchon36/one-gpu-capacity
- Paper online: https://thanatchon36.github.io/one-gpu-capacity/paper/
- Código (simulador en C, referencia en Python): https://github.com/thanatchon36/one-gpu-capacity
- DOI del preprint: https://doi.org/10.5281/zenodo.24243858
