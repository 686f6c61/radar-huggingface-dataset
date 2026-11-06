# ussoewwin/Flash-Attention-2_for_Windows

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de wheels precompilados de FlashAttention-2 para Windows y Linux, distribucion que el proyecto oficial no ofrece. Lo mantiene el usuario de Hugging Face `ussoewwin` y cubre las versiones 2.8.3, 2.8.4 y una rama propia 2.9.x, compiladas contra distintas combinaciones de PyTorch (2.9.1 a 2.15.0) y CUDA (cu130, cu132, cu134), con soporte para Python 3.13 y 3.14.

El problema que resuelve es puramente de empaquetado e instalacion: compilar FlashAttention-2 en Windows requiere toolchains de CUDA y MSVC que rara vez coinciden con el entorno del usuario, y las wheels oficiales se publican principalmente para Linux. Este repositorio ofrece binarios listos para instalar, ademas de una bifurcacion no oficial de la rama 2.9.x que incorpora optimizaciones propias (denominadas A-1/A-2 y una retroportacion de logica de FA4) mientras el proyecto upstream se centra en FlashAttention-3 y 4.

Es relevante para quienes entrenan o sirven transformers de contexto largo en Windows (ComfyUI, Forge, A1111) o necesitan versiones concretas de PyTorch/CUDA que no estan cubiertas por los builds oficiales. No es un modelo con parametros, contexto ni capacidades cognitivas: es una dependencia binaria de atencion eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (libreria de kernels CUDA para atencion exacta con tiling y recomputacion; no es un modelo neuronal) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (la atencion FlashAttention-2 es agnostica a la longitud; el limite lo fija el modelo que la use) |
| Tipos de cuantizacion | No aplica (soporta entradas fp16/bf16 tipicas de FA2; no se documentan otros formatos en la informacion disponible) |
| Idiomas soportados | No aplica (metadata del repo: `en`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | No aplica; artefactos distribuidos como wheels `.whl` (repo de 22,9 GB) |

## Arquitectura y entrenamiento

FlashAttention-2 es un algoritmo de atencion exacta que reduce los accesos a memoria HBM mediante tiling en SRAM, recomputacion en el backward pass y paralelizacion sobre la dimension de secuencia. No hay entrenamiento ni dataset: el repositorio empaqueta el codigo CUDA/C++ y los bindings de PyTorch en wheels precompiladas.

La rama 2.9.x de este fork incorpora, segun la model card, optimizaciones etiquetadas como A-1/A-2, 24 logicas adicionales de split/align de kernels respecto al repositorio oficial y una retroportacion parcial de ideas de FA4 a FA2. Los builds 2.9.2 en adelante declaran soporte para arquitecturas Blackwell (SM100, SM120, SM121) y legacy (SM80, SM89, SM90). La rama 2.8.4 se mantiene compilada sobre codigo oficial para compatibilidad con xformers; el autor advierte que las versiones 2.9.0 y posteriores no son compatibles con xformers.

## Capacidades

- Aceleracion de atencion exacta (no aproximada) para transformers en fp16/bf16, con reduccion de memoria y aumento de throughput frente a la atencion estandar de PyTorch.
- Soporte nativo de Windows y Linux en wheels para Python 3.13 y 3.14.
- Matriz de builds por version de PyTorch (2.9.1, 2.10.0, 2.11.0, 2.12.0, 2.12.1, 2.13.0, 2.14.0, 2.15.0) y CUDA (cu130, cu132, cu134).
- Cobertura de GPUs Blackwell (SM100, SM120, SM121) y generaciones anteriores (SM80, SM89, SM90) en los builds 2.9.2+.
- Integracion verificada por el autor en Stable Diffusion A1111 (custom), Forge Nunchaku (custom) y ComfyUI.
- No incluye tool calling, agentes, vision, audio ni ninguna capacidad de modelo generativo: es una dependencia de bajo nivel.

## Casos de uso

- Inferencia de LLMs de contexto largo en Windows: instalar la wheel correspondiente a la version de PyTorch y CUDA del entorno para habilitar atencion eficiente en lugar de recompilar desde fuente, que en Windows suele fallar por desajustes de MSVC y CUDA Toolkit.
- Pipelines de difusion (ComfyUI, A1111, Forge): el autor confirma funcionamiento en estas interfaces; util para nodos que usan atencion optimizada en modelos de difusion con secuencias largas.
- Entrenamiento y fine-tuning en maquinas Windows con GPUs consumer o workstation: evita el coste de compilacion y permite usar kernels FA2 en scripts de Hugging Face Transformers que ya invocan `flash_attn`.
- Fijacion de versiones en entornos reproducibles: al publicarse builds atados a combinaciones exactas de PyTorch/CUDA, se pueden usar como pin en `requirements.txt` o imagenes Docker Linux con cu130/cu132/cu134.
- Compatibilidad con xformers: usar la rama 2.8.4 (codigo oficial) cuando el stack incluya xformers, y la rama 2.9.x solo en proyectos sin xformers.
- Evaluacion de kernels en Blackwell: probar builds SM100/SM120/SM121 en RTX 50xx o datacenter Blackwell para medir si las optimizaciones A-1/A-2 aportan ventaja, asumiendo que el autor no publica benchmarks.
- Despliegue en Linux como alternativa a wheels oficiales: los builds cubren combinaciones de PyTorch 2.14/2.15 con cu132/cu134 que pueden no estar disponibles en el indice oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No performance benchmarks have been run on this build" y "No multi-environment testing has been performed".

## Requisitos de hardware

- VRAM: no aplica al ser una libreria; el consumo depende del modelo que la use. FlashAttention-2 reduce el uso de memoria de atencion de O(n^2) a O(n) en activaciones, pero no fija un minimo propio.
- GPU soportadas: SM80 (A100), SM89 (RTX 40xx/L40), SM90 (H100/H200) en builds legacy; SM100, SM120, SM121 (Blackwell) en builds 2.9.2+.
- GPUs consumer: si, cualquier GPU Ampere o superior con los drivers CUDA correspondientes (cu130/cu132/cu134 segun build).
- Despliegue: se instala como paquete Python (`pip install <wheel>`) y se consume desde PyTorch, Hugging Face Transformers, vLLM, ComfyUI, A1111 o Forge. No es un servidor de inferencia por si mismo.
- Latencia y throughput: no disponibles; el autor no ha medido rendimiento y advierte que solo ha probado en su entorno.
- Almacenamiento: el repo ocupa 22,9 GB por acumulacion de wheels; cada wheel individual es mucho menor, pero el dato por wheel no esta disponible.

## Comparativa con modelos similares

| Proyecto | Cobertura Windows | Versiones PyTorch/CUDA | Mantenimiento | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (ussoewwin) | Si, nativa | 2.9.1 a 2.15.0; cu130/cu132/cu134 | Fork personal, actualizaciones frecuentes | BSD-3-Clause | Incluye rama 2.9.x no oficial con optimizaciones propias |
| FlashAttention oficial (Dao-AILab) | Limitada; foco en Linux | Segun releases oficiales | Upstream, foco en FA3/FA4 | BSD-3-Clause | Referencia de correccion; no cubre todas las combinaciones |
| Wheels de la comunidad (p. ej. builds no oficiales en PyPI) | Variable | Variable | Variable | BSD-3-Clause | No verificado en la informacion disponible |
| xformers | Si, con wheels propias | Alineadas a sus releases | Activo | BSD-3-Clause | Incluye su propio kernel de atencion; incompatible con FA 2.9.x de este fork |

## Limitaciones y advertencias

- Build no oficial: la rama 2.9.x no es una release de FlashAttention; el autor lo declara explicitamente y no garantiza correccion fuera de su entorno.
- Sin benchmarks ni pruebas multi-entorno: no hay evidencia publicada de rendimiento ni de estabilidad en configuraciones distintas a las del autor.
- Incompatibilidad con xformers en 2.9.0+: usar 2.8.4 si el stack incluye xformers.
- Riesgo de desajuste binario: la wheel debe coincidir exactamente con la version de PyTorch, CUDA y Python; un mismatch produce errores de importacion o fallos en tiempo de ejecucion.
- Superficie de ataque de cadena de suministro: instalar wheels de un mantenedor individual implica confiar en su build; conviene verificar hashes y, si es posible, recompilar desde el fork en GitHub.
- Licencia BSD-3-Clause: permite uso comercial, pero exige conservar el aviso de copyright y no usar los nombres de los contribuyentes para promocionar derivados.
- Idiomas: metadata `en`; la documentacion del repo esta solo en ingles.
- Sin garantia de soporte: el autor no ofrece SLA ni canal de soporte; los issues se gestionan en su repositorio de GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/ussoewwin/Flash-Attention-2_for_Windows
- Fork en GitHub: https://github.com/ussoewwin/flash-attention
- Plan de retroportacion FA4 a FA2: https://github.com/ussoewwin/flash-attention/blob/main/AI/FA2_BACKPORT_FROM_FA4_PLAN.md
- Notas de cambios de kernels: https://github.com/ussoewwin/flash-attention/blob/main/md/FA2_CHANGES_v1.2.md
- Refinamientos A-1/A-2: https://github.com/ussoewwin/flash-attention/blob/main/AI/A1_A2_REFINEMENTS_PLAN.md
- Explicacion de split/align de kernels (2.9.2): https://github.com/ussoewwin/flash-attention/blob/main/md/split_align_kernels_explanation.md
- Release v2.9.2.post2: https://github.com/ussoewwin/flash-attention/releases/tag/v1.8.1
- Guia de test y validacion 2.9.2.post2: https://github.com/ussoewwin/flash-attention/blob/main/md/2.9.2.post2_COMPLETE_TEST_AND_VALIDATION_GUIDE.md
