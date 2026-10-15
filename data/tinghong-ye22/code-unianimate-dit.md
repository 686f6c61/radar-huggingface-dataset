# Tinghong-Ye22/code-UniAnimate-DiT

## Resumen

UniAnimate-DiT es un modelo de generacion de video orientado a la animacion de imagenes humanas con consistencia temporal. Se trata de una version ampliada de UniAnimate (arXiv:2406.01188) construida sobre el modelo DiT Wan2.1-14B-I2V, que aporta un backbone de difusion con arquitectura transformer (DiT) de 14.000 millones de parametros especializado en generacion imagen-a-video. El desarrollo procede del ecosistema UniAnimate (ali-vilab) y reutiliza la base Wan2.1 de Wan-Video, con una implementacion sobre el framework DiffSynth-Studio.

El problema que resuelve es la animacion de un sujeto humano a partir de una imagen de referencia y una secuencia de pose o video guia, manteniendo la identidad y la coherencia visual a lo largo de los fotogramas. Frente a la version original basada en U-Net, esta variante adopta el backbone DiT de Wan2.1-14B-I2V, lo que mejora la calidad y la resolucion alcanzable (hasta 720p). El repositorio publicado por Tinghong-Ye22 contiene unicamente los pesos de LoRA y los modulos adicionales entrenables, no el modelo base completo.

Su relevancia actual reside en las optimizaciones de inferencia incorporadas en abril de 2025: soporte de teacache (aceleracion de aproximadamente 4x), generacion de video largo y Unified Sequence Parallel (USP) para inferencia multi-GPU. Estos avances reducen el coste de generacion a unos 3 minutos para un video de 5 segundos en 480p y unos 13 minutos en 720p sobre una unica GPU A800.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre Wan2.1-14B-I2V |
| Parametros totales | 14.000 millones (modelo base Wan2.1-14B-I2V; el repositorio solo aloja pesos de LoRA y modulos adicionales entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se especifica; modelo de generacion visual) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene pesos de LoRA y modulos adicionales entrenables; el modelo base se descarga por separado desde Wan-AI/Wan2.1-I2V-14B-720P) |

## Arquitectura y entrenamiento

UniAnimate-DiT sustituye el backbone de difusion de la version original por un Diffusion Transformer (DiT) basado en Wan2.1-14B-I2V, un modelo imagen-a-video de 14.000 millones de parametros. La propuesta combina este backbone con modulos adicionales entrenables y capas LoRA, que son precisamente los unicos pesos incluidos en el repositorio (3,9 GB). La arquitectura se apoya en DiffSynth-Studio para la orquestacion del pipeline de difusion.

En cuanto al entrenamiento, la model card no detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. La informacion disponible se limita a confirmar que se publicaron el codigo de entrenamiento y de inferencia junto con los pesos de LoRA y modulos adicionales. Como innovaciones tecnicas destacables figuran el soporte de teacache (aceleracion de aproximadamente 4x, con posible impacto leve en la calidad), el soporte de Unified Sequence Parallel (USP) para inferencia en multiples GPUs, y la compatibilidad con varias implementaciones de atencion (Flash Attention 2 y 3, Sage Attention y torch SDPA).

## Capacidades

- Generacion de video imagen-a-video: anima una imagen de referencia de una persona siguiendo una secuencia guia, manteniendo la consistencia del sujeto.
- Generacion de video corto y video largo (la generacion de video largo no soporta aceleracion por teacache en la version documentada).
- Resoluciones de salida de 480p y 720p segun la configuracion documentada.
- Aceleracion de inferencia mediante teacache, con un factor aproximado de 4x.
- Inferencia multi-GPU mediante Unified Sequence Parallel (USP).
- Soporte de varias implementaciones de atencion optimizadas (Flash Attention 2/3, Sage Attention, torch SDPA).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision para comprension, audio ni modo de razonamiento explicito, dado que es un modelo de generacion de video.

## Casos de uso

- Animacion de retratos y figuras humanas: a partir de una fotografia y una secuencia de pose, generar un video donde el sujeto reproduce el movimiento manteniendo su identidad. Adecuado por el diseno especifico del modelo para consistencia de identidad.
- Previsualizacion de animaciones en produccion audiovisual: generar borradores animados de personajes antes de una produccion final en 720p, aprovechando el bajo coste de generacion en 480p.
- Creacion de contenido para redes sociales: producir clips de 5 segundos a partir de una imagen estatica, con generacion en minutos sobre una sola GPU.
- Prototipado de videojuegos: animar avatares o personajes a partir de una referencia unica y capturas de movimiento para previsualizar animaciones sin rigging completo.
- Investigacion en generacion de video: servir como base reproducible (codigo de entrenamiento e inferencia abiertos) para estudiar animacion humana con backbones DiT.
- Restauracion o revivificacion de material grafico: animar imagenes historicas o retratos fijos con movimientos controlados mediante una guia de pose.
- Escalado en infraestructura multi-GPU: desplegar inferencia distribuida con USP para reducir tiempos en lotes grandes de generacion a 720p.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta medidas de tiempo de inferencia sobre una GPU A800: aproximadamente 3 minutos para un video de 5 segundos en 480p y aproximadamente 13 minutos para un video de 5 segundos en 720p.

## Requisitos de hardware

- GPU de referencia documentada: una unica NVIDIA A800 para generar 5 segundos de video (480p y 720p).
- Tiempos estimados con teacache en una A800: unos 3 minutos para 5 s en 480p y unos 13 minutos para 5 s en 720p.
- Memoria VRAM exacta: no disponible.
- Inferencia multi-GPU: soportada mediante Unified Sequence Parallel (USP), que requiere Python >= 3.10.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; el backbone de 14.000 millones de parametros sugiere requisitos elevados.
- Opciones de despliegue: DiffSynth-Studio (framework sobre el que se construye); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de video).
- Aceleracion de atencion compatible: Flash Attention 3, Flash Attention 2, Sage Attention y torch SDPA (por defecto, recomendado torch >= 2.5.0).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniAnimate-DiT | 14.000 M (base) | DiT (Wan2.1-14B-I2V) | 480p / 720p | no disponible | Repositorio con LoRA y modulos adicionales |
| UniAnimate (original, arXiv:2406.01188) | no disponible | no disponible (predecesor) | no disponible | no disponible | Codigo abierto en ali-vilab/UniAnimate |
| Wan2.1-I2V-14B-720P | 14.000 M | DiT | 720p | no disponible | Pesos base en Wan-AI/Wan2.1-I2V-14B-720P |

No se dispone de datos comparativos de rendimiento cuantitativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye el modelo base completo: para usar UniAnimate-DiT hay que descargar por separado Wan2.1-I2V-14B-720P desde Wan-AI.
- Licencia no especificada, lo que impide confirmar si se permite el uso comercial.
- Idiomas y ambito linguistico no documentados; se trata de un modelo de generacion visual, no de texto.
- La aceleracion por teacache puede tener un ligero impacto en la calidad; el autor recomienda seleccionar la semilla con teacache y desactivarlo para resultados ideales.
- La generacion de video largo no soporta aceleracion por teacache en la version documentada.
- No se detallan sesgos, tasas de alucinacion ni limitaciones de contexto, por ausencia de informacion.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creacion y actualizacion indicadas (2026) no coinciden con las fechas de las notas de version (abril de 2025), lo que conviene verificar antes de usarlo en produccion.
- Requisitos de hardware elevados por el backbone de 14.000 millones de parametros; la VRAM necesaria no esta documentada.

## Enlaces

- HuggingFace: https://huggingface.co/Tinghong-Ye22/code-UniAnimate-DiT
- Technical report (arXiv:2504.11289): https://arxiv.org/pdf/2504.11289
- UniAnimate original (arXiv:2406.01188): https://arxiv.org/abs/2406.01188
- Repositorio UniAnimate-DiT: https://github.com/ali-vilab/UniAnimate-DiT
- Repositorio UniAnimate original: https://github.com/ali-vilab/UniAnimate
- Wan2.1: https://github.com/Wan-Video/Wan2.1
- Pesos base Wan2.1-I2V-14B-720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
- Flash Attention: https://github.com/Dao-AILab/flash-attention
- Sage Attention: https://github.com/thu-ml/SageAttention
