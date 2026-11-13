# Xylolabs/LTX-2.5-Block0-Tensix-BFP4

## Resumen

LTX-2.5-Block0-Tensix-BFP4 es una cuantización en formato block floating point (BFP4, variante `bfloat4_b`) del modelo base Lightricks/LTX-2.5, publicada por Xylolabs y orientada específicamente al hardware Tensix de Tenstorrent mediante la librería TTNN. No se trata de un modelo entrenado desde cero, sino de un componente cuantizado derivado del modelo original de Lightricks, empaquetado para su ejecución sobre aceleradores Tenstorrent en lugar de GPUs convencionales.

El interés de esta publicación es doble: por un lado, demuestra la viabilidad de portar modelos generativos de gran tamano a la pila de software abierta de Tenstorrent (TTNN); por otro, emplea un esquema de cuantización por bloques con exponente compartido que reduce el peso de los pesos manteniendo una precisión cercana a la de punto flotante. El repositorio ocupa 0,8 GB, lo que sugiere que se distribuye únicamente un subconjunto de los pesos (el bloque 0, según indica el nombre), no el modelo completo.

La ficha se elabora a partir exclusivamente de la información pública del repositorio de Hugging Face, que es escasa en detalles técnicos. Cualquier dato no confirmado se marca como no disponible. El acceso está restringido y requiere aceptar la licencia comunitaria de LTX-2.x en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Lightricks/LTX-2.5; el repositorio no documenta la arquitectura) |
| Parametros totales | no disponible (el repo de 0,8 GB contiene solo el bloque 0 cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | block floating point BFP4, variante `bfloat4_b`, con bloques de exponente compartido (TTNN) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido, gated) |
| Formato de pesos | pesos PyTorch para TTNN (no safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Lightricks/LTX-2.5 en la información proporcionada. El repositorio se describe a sí mismo como un componente cuantizado (`component`, `block0`) del modelo base, no como un modelo completo, y no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es el esquema de cuantización: block floating point de 4 bits (`bfloat4_b`) implementado sobre TTNN para el hardware Tensix de Tenstorrent. En este formato, un grupo de valores comparte un exponente y cada elemento almacena una mantisa reducida, lo que permite operaciones matriciales eficientes en el acelerador. El repositorio referencia el paper arXiv:2601.03233, que presumiblemente describe el método de cuantización, aunque su contenido no se detalla en la información disponible.

## Capacidades

- No se documentan capacidades funcionales específicas en el repositorio. Al derivar de Lightricks/LTX-2.5, se presume que hereda las capacidades del modelo base, pero no se confirman en la información proporcionada.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre capacidades de agente o razonamiento multi-paso.
- No hay información sobre cobertura multilingüe.
- No hay información sobre modos especiales (thinking, visión, audio) más allá de lo que pueda ofrecer el modelo base.
- El único propósito documentado es servir como componente cuantizado ejecutable en hardware Tenstorrent mediante TTNN.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para TTNN y el hardware Tensix, por lo que su uso principal es ejecutar el bloque 0 del modelo base en tarjetas Tenstorrent (por ejemplo, Wormhole o Grayskull) dentro de un pipeline de inferencia distribuida.
- Investigación en cuantización de bajo bit: sirve como referencia práctica para estudiar el impacto de BFP4 con exponente compartido en la calidad de un modelo generativo, comparándolo con el modelo base en precisión completa.
- Evaluación de portabilidad de modelos generativos: permite medir el esfuerzo y las pérdidas de calidad al migrar un modelo de Lightricks a una pila de software no CUDA.
- Pruebas de integración de TTNN: útil para desarrolladores que validan la compatibilidad de sus kernels o herramientas con pesos cuantizados en formato `bfloat4_b`.
- Benchmarking de hardware alternativo: permite comparar throughput y latencia de Tenstorrent frente a GPU en una carga de trabajo real derivada de LTX-2.5.
- Reproducción de resultados del paper arXiv:2601.03233: el repositorio facilita los pesos necesarios para replicar los experimentos de cuantización descritos en la publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: aceleradores Tenstorrent con núcleos Tensix (la pila TTNN no está pensada para GPU convencional).
- VRAM estimada: no disponible; el repositorio de 0,8 GB corresponde solo al bloque 0 cuantizado, no al modelo completo.
- GPU recomendadas: no aplica para este artefacto; requiere hardware Tenstorrent. Para el modelo base en GPU no hay datos en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: TTNN (librería de Tenstorrent); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/LTX-2.5-Block0-Tensix-BFP4 | no disponible | no disponible | BFP4 (`bfloat4_b`) | ltx-2.x-community | Tenstorrent (TTNN) |
| Lightricks/LTX-2.5 (base) | no disponible | no disponible | precisión original | ltx-2.x-community | GPU convencional |
| Otras cuantizaciones de LTX-2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables en la misma categoría (cuantizaciones BFP4 para Tenstorrent) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente el bloque 0 del modelo, no el modelo completo; no es utilizable de forma autónoma para inferencia.
- El acceso está restringido (gated): es necesario aceptar la licencia en Hugging Face antes de descargar los pesos.
- La licencia ltx-2.x-community-license-agreement impone condiciones específicas para uso comercial; deben revisarse antes de cualquier despliegue en producción.
- Al ser una cuantización de 4 bits, es previsible cierta degradación de calidad respecto al modelo base, aunque no se cuantifica en la información disponible.
- No hay datos sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la información proporcionada.
- La dependencia de TTNN y del hardware Tensix limita la portabilidad; no se documenta funcionamiento en CUDA, ROCm ni CPU.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/LTX-2.5-Block0-Tensix-BFP4
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Paper de referencia: arXiv:2601.03233 (https://arxiv.org/abs/2601.03233)
- Licencia: ltx-2.x-community-license-agreement (referenciada en el repositorio)
