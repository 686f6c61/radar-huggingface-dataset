# Xylolabs/LTX-2.5-Text-Encoder-Tensix-BFP8

## Resumen

LTX-2.5-Text-Encoder-Tensix-BFP8 es un componente cuantizado del codificador de texto del modelo Lightricks/LTX-2.5, publicado por Xylolabs. No se trata de un modelo generativo completo, sino de una pieza extraida del pipeline original de LTX-2.5 (un modelo de generacion de video de Lightricks) y adaptada para ejecutarse sobre hardware Tenstorrent mediante la libreria TTNN. El formato de pesos empleado es block floating point con tipo `bfloat8_b` (BFP8), una representacion de 8 bits por bloque que reduce el peso en memoria respecto al original en bf16.

La relevancia de esta publicacion es de nicho: sirve a equipos que despliegan el pipeline de LTX-2.5 en aceleradores Tenstorrent (Tensix) y necesitan el text encoder en un formato nativo del stack TTNN. El repositorio ocupa 26,1 GB, lo que sugiere que incluye pesos del encoder de texto de gran tamano (probablemente un T5 o un LLM encoder de varios miles de millones de parametros) junto con metadatos y posibles duplicados de precision.

El acceso esta restringido en Hugging Face y requiere aceptar la licencia `ltx-2.x-community-license-agreement`. No se han publicado resultados de benchmarks ni detalles de composicion del dataset en la informacion disponible, por lo que las secciones tecnicas se limitan a lo verificable en la model card y las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de texto (componente del pipeline LTX-2.5); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 con tipo `bfloat8_b` (block floating point, 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license-agreement (acceso restringido) |
| Formato de pesos | pesos PyTorch/TTNN en block floating point `bfloat8_b`; tamano del repo 26,1 GB |

## Arquitectura y entrenamiento

El modelo es un componente del pipeline Lightricks/LTX-2.5, concretamente el text encoder, reempaquetado por Xylolabs para el stack Tenstorrent. La unica innovacion tecnica documentada es el uso de block floating point con formato `bfloat8_b`, que agrupa valores en bloques compartiendo un exponente y almacenando mantisas de 8 bits. Este esquema reduce el ancho de banda de memoria y permite ejecutar el encoder en hardware Tensix mediante TTNN, a costa de una perdida de precision controlada por bloque.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla si el proceso de cuantizacion a BFP8 incluyo calibracion o fine-tuning posterior. El identificador `arxiv:2601.03233` en las etiquetas apunta a un paper asociado, pero su contenido no se ha proporcionado.

## Capacidades

- Codificacion de texto a embeddings para condicionar el pipeline de generacion de video LTX-2.5.
- Ejecucion en hardware Tenstorrent mediante TTNN (operadores Tensix).
- Cuantizacion BFP8 (`bfloat8_b`) para reducir huella de memoria frente a bf16.
- Integracion como componente dentro de un pipeline mayor; no genera texto de forma autonoma segun la informacion disponible.
- Soporte de tool calling, agentes, vision, audio o thinking mode: no disponible (no es un modelo conversacional).

## Casos de uso

- Despliegue de LTX-2.5 en aceleradores Tenstorrent: el encoder permite sustituir la version bf16 del text encoder por una variante BFP8 compatible con TTNN, reduciendo presion de memoria en el pipeline de generacion de video.
- Investigacion en cuantizacion block floating point: util para estudiar el impacto de `bfloat8_b` en la calidad de embeddings de texto frente a bf16, comparando salidas del encoder original y el cuantizado.
- Servidores de inferencia con presupuesto de VRAM ajustado: al ocupar menos que la version bf16, facilita colocar el encoder junto al resto del pipeline en un unico dispositivo.
- Reproduccion de pipelines de video en entornos con hardware no NVIDIA: al estar empaquetado para TTNN, encaja en despliegues sobre tarjetas Tensix.
- Benchmarking de stacks de cuantizacion: sirve como caso de prueba para medir throughput y latencia del encoder en TTNN frente a implementaciones PyTorch estandar.
- Desarrollo de herramientas de conversion de pesos: el repositorio puede usarse como referencia para escribir conversores de safetensors bf16 a BFP8 `bfloat8_b` para otros componentes del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 26,1 GB en BFP8; se requiere memoria suficiente para cargar los pesos completos del encoder, aunque el consumo en ejecucion depende del backend y del lote.
- GPU recomendadas: el modelo esta empaquetado para hardware Tenstorrent (Tensix) con TTNN; no se documenta soporte para GPU NVIDIA o AMD en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato `bfloat8_b` y las dependencias TTNN no son estandar en CUDA.
- Opciones de despliegue: TTNN sobre aceleradores Tenstorrent; vLLM, llama.cpp, Ollama y TGI no estan documentados para este componente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/LTX-2.5-Text-Encoder-Tensix-BFP8 | no disponible | no disponible | BFP8 `bfloat8_b` (TTNN) | ltx-2.x-community-license-agreement | Gated en HF |
| Lightricks/LTX-2.5 (text encoder original) | no disponible | no disponible | bf16 (safetensors) | ltx-2.x-community-license-agreement | Gated en HF |
| Otros encoders de texto para video (p. ej. T5-XXL) | ~4,7 B (referencia externa, no confirmada para este pipeline) | 512 | bf16/fp16 | Apache 2.0 (referencia externa) | Publico |

La comparativa con encoders alternativos no puede completarse con datos verificados de este repositorio; los valores de la fila T5-XXL son referencia general y no se confirman para LTX-2.5.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia `ltx-2.x-community-license-agreement` en Hugging Face antes de descargar.
- Licencia de comunidad: el uso comercial puede estar sujeto a condiciones adicionales; revisar el texto completo antes de desplegar en produccion.
- Cuantizacion BFP8: la reduccion a 8 bits por bloque puede degradar la calidad de los embeddings frente a bf16; no se han publicado evaluaciones de fidelidad.
- Dependencia de hardware: el formato esta pensado para TTNN/Tensix; no es portable directamente a CUDA sin conversion.
- No es un modelo autonomo: no genera texto ni responde a prompts por si mismo; solo produce embeddings para el pipeline LTX-2.5.
- Sin datos de sesgo, alucinacion o cobertura idiomatica publicados en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validacion comunitaria.
- El identificador `arxiv:2601.03233` sugiere un paper asociado, pero su contenido no se ha verificado.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/LTX-2.5-Text-Encoder-Tensix-BFP8
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Paper referenciado en etiquetas: arxiv:2601.03233 (contenido no verificado)
- Repositorio TTNN: no disponible en la informacion proporcionada
- Demo: no disponible
