# therickcain/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF es una versión "abliterada" (sin filtros de seguridad) del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicada por el usuario therickcain en Hugging Face y basada en el trabajo de huihui-ai. El modelo original es un modelo de mezcla de expertos (MoE) multimodal con pipeline image-text-to-text, y esta variante elimina sus mecanismos de rechazo mediante la técnica de abliteration, aplicada directamente sobre pesos GGUF usando la herramienta cvector-generator de llama.cpp, sin depender de Transformers.

La relevancia de esta ficha radica en que ofrece cuantizaciones GGUF de un modelo MoE de gran tamaño, incluyendo variantes de la serie UD de Unsloth y cuantizaciones GSQ-RCO de ISTA-DASLab, con soporte para parches adicionales (Maya, Strata y Unsloth en modo patch). El repositorio pesa 381,1 GB, lo que indica que incluye múltiples cuantizaciones de un modelo base muy grande. Es un modelo orientado a investigación y uso experimental, no a producción, dado que su filtrado de seguridad ha sido eliminado deliberadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), multimodal (image-text-to-text) |
| Parametros totales | 1.677.721.600 (dato safetensors; el repo GGUF completo pesa 381,1 GB, por lo que el modelo base es mucho mayor) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el comando de ejemplo de la model card) |
| Tipos de cuantizacion | GGUF, incluidas UD-IQ1_S (Unsloth) y GSQ-RCO (ISTA-DASLab); lista completa no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (requiere llama.cpp b11870 o superior) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un modelo MoE multimodal de DeepSeek-AI con capacidad image-text-to-text. La versión aquí descrita no modifica la arquitectura ni el entrenamiento: aplica abliteration sobre los pesos ya entrenados. Según la model card, en la serie UD de Unsloth solo se han abliterado las capas 11 a 28 (indexado desde 0), concretamente 18 tensores `attn_output_b`; el sistema de expertos no fue tocado. El método empleado es el implementado en cvector-generator de llama.cpp, que genera vectores de dirección de comportamiento y los aplica directamente sobre GGUF.

El repositorio incluye además tres conjuntos de parches opcionales que el usuario debe aplicar manualmente mediante comandos: Maya (project-maya), Strata (cuyos pesos provienen de ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF) y las cuantizaciones de Unsloth en modo patch, un esquema que ahorra espacio de almacenamiento al no duplicar pesos. No hay datos publicados sobre el preentrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generacion de texto conversacional (pipeline conversational), sin filtros de seguridad por diseño.
- Comprension de imagenes y texto (image-text-to-text), heredada del modelo base multimodal.
- Arquitectura MoE, lo que sugiere inferencia eficiente por token respecto a un modelo denso equivalente (parametros activos no disponibles).
- Ventana de contexto de hasta 262.144 tokens en llama.cpp.
- Compatibilidad con cuantizaciones de muy baja bit (UD-IQ1_S) para reducir requisitos de memoria.
- Parches opcionales Maya, Strata y Unsloth que modifican comportamientos o formatos de pesos segun la variante elegida.
- No hay informacion sobre tool calling, agentes ni modos de razonamiento en la model card.

## Casos de uso

- Investigacion en alineacion y seguridad: permite estudiar el efecto de la abliteration comparando salidas con y sin filtros sobre el mismo modelo base, util para papers y auditorias de seguridad.
- Pruebas de red teaming: generacion de contenido sensible en entornos controlados para evaluar sistemas de moderacion posteriores.
- Experimentacion con MoE cuantizados en local: las cuantizaciones UD-IQ1_S permiten cargar un modelo enorme en hardware limitado para pruebas de arquitectura.
- Descripcion y razonamiento sobre imagenes sin rechazos: analisis multimodal de imagenes donde el modelo base se niega a responder, util en investigacion visual.
- Evaluacion de parches comunitarios: probar los parches Maya y Strata de IST-DASLab sobre un mismo modelo base para medir su impacto.
- Despliegue experimental con llama.cpp: uso de llama-server o llama-mtmd-cli para montar endpoints locales de prueba con contexto largo (262.144 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo completo pesa 381,1 GB, pero la cuantizacion UD-IQ1_S (dividida en 5 ficheros) esta pensada para hardware con recursos muy limitados. La VRAM exacta depende de la cuantizacion elegida.
- GPU recomendadas: no disponible; el comando de ejemplo compila llama.cpp con soporte CUDA (GGML_CUDA=ON), por lo que se asume GPU NVIDIA, pero no se especifican modelos concretos.
- Consumer GPU: la cuantizacion UD-IQ1_S esta disenada para caber en hardware de consumo, aunque el tamaño exacto por shard no esta detallado en la model card.
- Despliegue: llama.cpp es el requisito obligatorio (version b11870 o superior), con binarios llama-cli, llama-mtmd-cli, llama-server y llama-gguf-split. Para la variante GSQ-RCO se requieren modificaciones adicionales documentadas en el README de ISTA-DASLab. No se menciona soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Caracteristica diferencial |
|---|---|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | safetensors | no disponible | Version original con filtros de seguridad intactos |
| huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF | GGUF | MIT | Misma abliteracion, repo original de huihui-ai |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | GGUF (GSQ-RCO) | no disponible | Cuantizacion experimental GSQ-RCO sin abliterar |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | GGUF (UD-) | no disponible | Cuantizaciones UD sin abliterar, origen de la serie UD |

Esta ficha corresponde a un espejo de therickcain del repo de huihui-ai, por lo que la alternativa directa con filtros intactos es el modelo base de DeepSeek-AI.

## Limitaciones y advertencias

- Riesgo elevado de generar contenido sensible, controvertido o inapropiado: el filtrado de seguridad ha sido reducido significativamente de forma deliberada.
- No apto para todos los publicos: las salidas pueden ser inadecuadas para entornos publicos, menores de edad o aplicaciones que exijan alta seguridad.
- El usuario asume la responsabilidad legal y etica completa del uso; huihui.ai declina cualquier responsabilidad sobre las consecuencias.
- Recomendado solo para investigacion, pruebas o entornos controlados; no se aconseja su uso directo en produccion ni en aplicaciones comerciales de cara al publico.
- Se recomienda monitorizar las salidas en tiempo real y realizar revision manual para evitar la difusion de contenido inapropiado.
- Sin garantias de seguridad por defecto: el modelo no ha pasado por optimizacion de seguridad rigurosa, por lo que el riesgo de alucinacion y contenido perjudicial es superior al del modelo base.
- Requiere llama.cpp b11870 o superior; versiones anteriores no funcionaran con estas cuantizaciones (especialmente GSQ-RCO).
- Los parches Maya, Strata y Unsloth no vienen aplicados: hay que ejecutar comandos adicionales, lo que anade friccion de despliegue.
- Datos de idiomas soportados, parametros activos y benchmarks no disponibles en la model card.

## Enlaces

- Ficha del modelo: https://huggingface.co/therickcain/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repo original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Cuantizaciones GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Metodo de abliteracion (cvector-generator): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Parche Maya: https://github.com/mw00/project-maya
- Parche Strata: https://github.com/Niko1221/Strata
- Version requerida de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
