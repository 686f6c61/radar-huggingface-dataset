# tom-m-20260302/ComfyUI-Nunchaku-Klein

## Resumen

ComfyUI-Nunchaku-Klein es un nodo personalizado para ComfyUI que integra el modelo Nunchaku Klein, una versión cuantizada de FLUX.2 Klein desarrollada por tonera, utilizando el backend Nunchaku (una implementación de cuantización SVDQuant para GPUs NVIDIA). El repositorio, mantenido por tom-m-20260302, no contiene pesos de modelo, sino código Python que actúa como puente entre ComfyUI y el backend Nunchaku, añadiendo funcionalidades avanzadas como enhancers, control de referencia y soporte para las variantes de 9B y 4B de FLUX.2 Klein.

Este proyecto es relevante porque permite a usuarios de ComfyUI ejecutar FLUX.2 Klein con cuantización eficiente en hardware consumer, sin necesidad de escribir código adicional. Incluye características experimentales como Direct K/V, balance texto/referencia y transferencia de identidad, que requieren una versión extendida del backend Nunchaku. La licencia es GPL-3.0, y el repositorio tiene un tamaño de 0.4 GB (principalmente documentación y scripts).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (es un nodo de ComfyUI, no un modelo) |
| Parametros totales | No disponible (depende del modelo FLUX.2 Klein subyacente: 9B o 4B) |
| Parametros activos | No disponible |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | SVDQuant (via backend Nunchaku) |
| Idiomas soportados | No disponible (el nodo no procesa lenguaje; el modelo subyacente puede soportar ingles) |
| Licencia | GPL-3.0-or-later |
| Formato de pesos | No aplica (codigo fuente Python; los pesos se descargan por separado) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un conjunto de nodos personalizados para ComfyUI. La arquitectura subyacente es la de FLUX.2 Klein, un modelo de difusion de imagenes de Black Forest Labs, que se ejecuta mediante el backend Nunchaku con cuantizacion SVDQuant. El nodo actua como una capa de integracion que traduce las operaciones de ComfyUI a llamadas al backend Nunchaku, permitiendo usar el modelo con funciones adicionales como LoRA, edicion por referencia y enhancers.

No se proporcionan datos de entrenamiento, ya que el proyecto se centra en la inferencia y la integracion. Las innovaciones tecnicas del repositorio incluyen la implementacion de nodos "Enhancer" (compatibles con el proyecto ComfyUI-Flux2Klein-Enhancer), soporte para Direct K/V (que requiere un backend Nunchaku extendido) y perfiles de ejecucion para las variantes de 9B y 4B.

## Capacidades

- Integracion con ComfyUI para ejecutar FLUX.2 Klein (9B y 4B) mediante Nunchaku.
- Soporte de LoRA para las variantes 9B y 4B (con perfilado especifico para 4B).
- Edicion multi-referencia: permite usar multiples imagenes de referencia para guiar la generacion.
- Nodos "Enhancer" (Klein Text Enhancer, Klein Enhancer) que mejoran la adherencia al prompt, aunque con comportamiento experimental y no identico al proyecto original.
- Control fino de la generacion mediante nodos como Ref Latent Weight, Text/Ref Balance, Mask Ref Controller, Color Anchor, Sectioned Encoder y Detail Controller.
- Funcionalidades Direct K/V (Ref Latent Weight Direct, Text/Ref Balance Direct, Identity Feature Transfer) que requieren un backend Nunchaku extendido.
- Soporte de Differential Diffusion (aunque se indica que FLUX.2 Klein no funciona bien con esta tecnica).
- No incluye capacidades de vision, audio o texto fuera del ambito de generacion de imagenes.

## Casos de uso

- Generacion de imagenes en ComfyUI con FLUX.2 Klein cuantizado: el nodo permite cargar el modelo Nunchaku Klein y generar imagenes directamente desde el grafo de ComfyUI, aprovechando la cuantizacion SVDQuant para reducir requisitos de VRAM.
- Edicion de imagenes por referencia: con los nodos de referencia multiple, se puede guiar la generacion a partir de una o varias imagenes de entrada, util para tareas de transferencia de estilo o identidad.
- Ajuste fino con LoRA: los nodos soportan LoRA, permitiendo a los usuarios aplicar adaptaciones entrenadas sobre FLUX.2 Klein sin modificar el modelo base.
- Control fino de la composicion: los nodos de balance texto/referencia y peso de latente de referencia permiten ajustar la influencia relativa del prompt y las imagenes de referencia, util para disenadores que necesitan control preciso.
- Experimentacion con enhancers: los nodos Enhancer mejoran la adherencia al prompt, aunque su comportamiento es experimental; pueden usarse en flujos de trabajo de investigacion para comparar resultados.
- Integracion en pipelines de produccion de contenido visual: al ser un nodo de ComfyUI, se puede integrar en flujos automatizados de generacion de imagenes para marketing, ilustracion o prototipado, siempre que se respete la licencia del modelo subyacente (FLUX.2 Klein 9B tiene licencia no comercial; 4B es Apache 2.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento ni comparaciones con otros metodos de cuantizacion o modelos.

## Requisitos de hardware

- Entorno de ejecucion: Python 3.13, Torch 2.11, CUDA 13.0 y ComfyUI >= 0.29 (versiones probadas).
- GPU: se requiere una GPU NVIDIA compatible con CUDA 13.0. No se especifican requisitos de VRAM, pero al tratarse de FLUX.2 Klein cuantizado con SVDQuant, se espera que funcione en GPUs consumer con al menos 8-12 GB de VRAM (estimacion basada en el tamano del modelo 9B cuantizado; no confirmado por el autor).
- Backend: se debe instalar el backend Nunchaku (fork de tonera) y, para funciones Direct K/V, el fork extendido de tom-m-20260302.
- Opciones de despliegue: exclusivamente como nodo de ComfyUI; no se proporcionan opciones de servidor independiente (vLLM, TGI, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo, sino un complemento de software. No se pueden comparar parametros, contexto o rendimiento con otros modelos. La comparativa relevante seria entre FLUX.2 Klein y otros modelos de difusion, pero no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- El nodo es experimental: muchas funciones (Enhancers, Direct K/V, Identity Feature Transfer) estan marcadas como experimentales o incompletas, y pueden producir resultados inconsistentes.
- Se ha observado que ejecuciones repetidas con la misma semilla y los mismos parametros pueden generar resultados materialmente diferentes, lo que afecta a la reproducibilidad en produccion.
- La variante 4B no soporta todas las funciones (referencia, edicion, Direct K/V, Identity Feature Transfer) hasta que se completen las fases de calificacion.
- La licencia del repositorio es GPL-3.0, pero los pesos del modelo subyacente tienen licencias distintas: FLUX.2-klein-9B es de uso no comercial (FLUX Non-Commercial License) y FLUX.2-klein-4B es Apache 2.0. Cualquier uso comercial debe verificar la licencia del modelo concreto.
- El proyecto depende de un backend Nunchaku especifico (fork de tonera) y, para funciones avanzadas, de un fork extendido que solo soporta una version concreta de la rueda precompilada (nunchaku-1.3.0.dev20260629+cu13.0torch2.11-cp313-cp313-win_amd64). Esto limita la portabilidad.
- No se garantiza compatibilidad con versiones antiguas de ComfyUI, Python o CUDA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tom-m-20260302/ComfyUI-Nunchaku-Klein
- Repositorio GitHub: https://github.com/Tom-M-Git/ComfyUI-Nunchaku-Klein
- Backend Nunchaku (fork de tonera): https://huggingface.co/tonera/vitoom-nunchaku
- Backend Nunchaku extendido (fork de tom-m-20260302): https://github.com/tom-m-2020/vitoom-nunchaku-extended
- Proyecto original de enhancers: https://github.com/capitan01R/ComfyUI-Flux2Klein-Enhancer
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Nunchaku oficial: https://github.com/nunchaku-ai/nunchaku
- Modelo FLUX.2-klein-9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo FLUX.2-klein-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
