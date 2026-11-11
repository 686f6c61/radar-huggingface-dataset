# StillDeadcode/krea-2-turbo-radiance-iq8r

## Resumen
Krea-2-Turbo Radiance IQ8R es una cuantizacion del modelo de generacion de imagenes Krea-2-Turbo, publicada por el usuario StillDeadcode bajo el identificador `StillDeadcode/krea-2-turbo-radiance-iq8r`. Se trata de una conversion a precision int8 con esquema W8A8 (pesos y activaciones de 8 bits) y transformacion de Hadamard, empaquetada en el formato propietario del runtime Radiance, optimizado para GPUs AMD con arquitectura RDNA4 y el stack ROCm. El modelo base es `krea/Krea-2-Turbo`, un text-to-image de la familia Krea.

La relevancia de esta publicacion es fundamentalmente de infraestructura: no aporta capacidades nuevas respecto al modelo original, sino que traslada un modelo de difusion a un formato cuantizado ejecutable en hardware AMD consumer y profesional mediante ROCm, un ecosistema historicamente con menos soporte que CUDA para este tipo de cargas. El tag `iq8r` sugiere una variante de cuantizacion con reconstruccion o calibracion especifica, y la presencia de `hadamard` apunta al uso de rotaciones de Hadamard para reducir outliers en las activaciones antes de cuantizar.

La informacion disponible es escasa: el repositorio no incluye model card con especificaciones, benchmarks ni detalles del proceso de cuantizacion. El acceso esta restringido (gated) y requiere aceptar la licencia `krea-2-community-license` en Hugging Face. El tamano del repositorio es de 17,6 GB, lo que da una idea del peso de los pesos cuantizados pero no permite derivar con fiabilidad el numero de parametros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de generacion de imagenes, presumiblemente difusion; no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica en el sentido de LLM) |
| Tipos de cuantizacion | int8, esquema W8A8, variante IQ8R con rotacion de Hadamard |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | formato del runtime Radiance (no es safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo base `krea/Krea-2-Turbo` en la documentacion proporcionada. Por la categoria del pipeline (`text-to-image`) y la nomenclatura del repositorio, cabe esperar un modelo generativo de imagenes condicionado por texto, pero no se confirma si emplea difusion, flow matching u otra formulacion, ni se detalla el numero de parametros, la composicion del dataset de entrenamiento o si hubo fases de alineacion (RLHF, DPO o similares).

Lo que si documenta el repositorio es el proceso de cuantizacion: conversion a int8 con cuantizacion de pesos y activaciones (W8A8), aplicacion de una transformacion de Hadamard —tecnica habitual para suavizar outliers en las activaciones y mejorar la fidelidad de la cuantizacion— y empaquetado en el formato del runtime Radiance para ROCm sobre RDNA4. No se especifica el calibrado utilizado, el numero de muestras de calibracion ni las metricas de degradacion respecto al modelo en precision completa.

## Capacidades
- Generacion de imagenes a partir de descripciones textuales (text-to-image), heredadas del modelo base Krea-2-Turbo.
- Ejecucion en GPUs AMD con ROCm y arquitectura RDNA4 mediante el runtime Radiance.
- Cuantizacion int8 W8A8 con rotacion de Hadamard, orientada a reducir el consumo de VRAM frente a los pesos en precision completa.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modos de razonamiento extendido; no aplican a un modelo text-to-image.
- No se documenta soporte multilingue explicito en los prompts.

## Casos de uso
- Generacion de imagenes en estaciones de trabajo con GPU AMD RDNA4: el formato Radiance permite ejecutar el modelo en hardware Radeon sin depender de CUDA, un escenario donde las alternativas cuantizadas en GGUF o safetensors no siempre estan optimizadas.
- Prototipado rapido de pipelines text-to-image en entornos ROCm: util para equipos que ya trabajan con el stack AMD y quieren validar flujos de generacion sin montar infraestructura NVIDIA.
- Reduccion de huella de VRAM en servidores AMD: la cuantizacion int8 W8A8 disminuye el peso de los pesos respecto a fp16, lo que facilita alojar el modelo en GPUs con menos memoria.
- Experimentacion con cuantizacion de modelos de difusion: el repositorio sirve como referencia para estudiar el efecto de IQ8R y Hadamard en la calidad de imagen generada frente al modelo original.
- Despliegue en entornos de investigacion con requisitos de licencia controlada: al estar gated bajo `krea-2-community-license`, encaja en proyectos que ya han aceptado los terminos del modelo base.
- Evaluacion comparativa de runtimes: permite medir latencia y throughput de Radiance frente a otras rutas de inferencia (por ejemplo, PyTorch nativo en ROCm) sobre el mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 17,6 GB, lo que sugiere que los pesos cuantizados en int8 rondan esa cifra; a ello hay que sumar memoria para activaciones, latents y buffers del runtime, por lo que se requiere una GPU con mas VRAM que el tamano de los pesos.
- GPU recomendadas: el repositorio esta etiquetado explicitamente para AMD RDNA4 con ROCm. No se documentan modelos concretos (por ejemplo, RX 9000 series) ni GPUs profesionales Instinct.
- Compatibilidad con GPU consumer: previsiblemente si, en GPUs AMD RDNA4 con VRAM suficiente, aunque no se especifica el minimo exacto.
- Opciones de despliegue: runtime Radiance sobre ROCm. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM y no al formato propietario de Radiance).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StillDeadcode/krea-2-turbo-radiance-iq8r | no disponible | no aplica | Radiance (int8 W8A8) | krea-2-community-license (gated) | Optimizado para AMD ROCm/RDNA4 |
| krea/Krea-2-Turbo (modelo base) | no disponible | no aplica | no disponible | krea-2-community-license | Referencia en precision original |
| Otras cuantizaciones de Krea-2-Turbo | no disponible | no aplica | no disponible | segun autor | No se han identificado en la informacion proporcionada |

No se dispone de datos suficientes para comparar rendimiento, calidad de imagen ni latencia con alternativas.

## Limitaciones y advertencias
- La cuantizacion int8 W8A8 puede introducir degradacion en la calidad de imagen respecto al modelo base; no se publican metricas (FID, CLIP score u otras) que cuantifiquen esa perdida.
- El acceso es restringido (gated): es necesario aceptar la licencia `krea-2-community-license` en Hugging Face antes de descargar los pesos.
- La licencia es "other" y especifica de Krea; conviene revisar los terminos de uso comercial antes de integrar el modelo en productos, ya que las condiciones no se detallan en la informacion disponible.
- El formato Radiance es propietario del runtime homonimo y no es interoperable con safetensors, GGUF ni las herramientas habituales del ecosistema; limita la portabilidad.
- Dependencia estricta de ROCm y RDNA4: no se documenta funcionamiento en GPUs NVIDIA ni en generaciones AMD anteriores.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (10 de noviembre de 2026); no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos del modelo base ni limitaciones de idioma en los prompts.
- Riesgo de alucinacion visual y de artefactos propios de los modelos generativos de imagen, agravado potencialmente por la cuantizacion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/StillDeadcode/krea-2-turbo-radiance-iq8r
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Runtime Radiance: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demos o repositorios adicionales: no disponible en la informacion proporcionada
