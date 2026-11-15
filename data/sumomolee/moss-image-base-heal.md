# SumomoLee/MOSS-Image-Base-Heal

## Resumen

MOSS-Image-Base-Heal es un ajuste fino completo (full fine-tune) del transformer de difusión de OpenMOSS-Team/MOSS-Image-Base, un modelo de generación de imágenes texto-a-imagen. Lo publica el usuario SumomoLee como modelo no oficial de la comunidad y su objetivo concreto es eliminar las "activaciones masivas" y los valores atípicos de pesos (weight outliers) presentes en el modelo base mediante una técnica denominada "stream healing". El resultado es un reemplazo directo del transformer original: el codificador de texto (Qwen3.5-9B) y el VAE (Flux.2 VAE) no se incluyen ni se modifican.

La relevancia de esta ficha es acotada pero técnica: no se trata de un modelo nuevo con capacidades adicionales, sino de una intervención sobre los pesos de un difusor existente para mejorar su estabilidad numérica y su comportamiento en cuantización. El autor documenta explícitamente que no reclama ninguna mejora de calidad de imagen y que las métricas publicadas son únicamente estadísticas de pesos, no evaluaciones visuales.

El modelo tiene 5.082.308.624 parámetros en formato safetensors, se distribuye en bf16 y ocupa 30,5 GB en el repositorio (10,16 GB el archivo único para ComfyUI). La licencia es Apache-2.0, heredada del modelo base. No se dispone de información sobre longitud de contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para texto-a-imagen; fine-tune del transformer de MOSS-Image-Base |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); version INT8 ConvRot disponible en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo unico para ComfyUI y carpeta `transformer/` en formato diffusers, 3 shards) |

## Arquitectura y entrenamiento

La arquitectura es la del transformer de difusión de MOSS-Image-Base, un modelo texto-a-imagen que en el pipeline completo combina un codificador de texto Qwen3.5-9B y un VAE Flux.2. Este repositorio contiene únicamente el transformer de difusión, reentrenado con un ajuste fino completo. El método de "heal" proviene de KBlueLeaf/KohakuMossTrainer y de la ejecución previa KBlueLeaf/MOSS-Image-heal, aunque el autor indica que se trata de una ejecución independiente y no de una copia.

El entrenamiento combina cuatro componentes: destilación desde el modelo base original congelado como profesor (pérdida principal, peso 1.0), penalizaciones sobre el residual stream (un término de concentración de escritura y un término de RMS del stream), decaimiento de valores atípicos en los pesos y un término pequeño de flow-matching con peso 0.05. El efecto medido sobre los pesos es concreto: los elementos con valor absoluto superior a 64 veces el RMS del tensor pasan de 349 en el base a 0, y el mayor valor absoluto relativo al RMS baja de 271,7 a 54,7. El número de elementos por encima de 16 veces el RMS no se reduce (15.310 frente a 17.555), porque el decaimiento limita los pesos extremos en lugar de aplanarlos todos.

## Capacidades

- Generación de imágenes a partir de prompts de texto, como reemplazo directo del transformer de MOSS-Image-Base.
- Compatibilidad con ComfyUI mediante un archivo único en `models/diffusion_models/`, usando el mismo codificador de texto y VAE que el modelo base.
- Compatibilidad con diffusers sustituyendo la carpeta `transformer/` del pipeline base.
- Pesos con valores atípicos reducidos, lo que puede facilitar la cuantización y mejorar la estabilidad numérica en inferencia.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Sustitución directa en pipelines ComfyUI existentes: al colocarse en `models/diffusion_models/` y usar los mismos ajustes de muestreo que el base, permite probar el efecto del "heal" sin reconfigurar el flujo de trabajo.
- Integración en pipelines diffusers: sustituir la carpeta `transformer/` del pipeline MOSS-Image permite usar el modelo en código Python con la misma API que el base.
- Experimentación con cuantización: al reducir los valores atípicos de pesos, es un candidato razonable para probar cuantizaciones agresivas (INT8, INT4) y comparar estabilidad frente al base.
- Investigación sobre outliers en difusores: sirve como caso de estudio reproducible para analizar cómo el decaimiento de outliers afecta a la distribución de pesos de un DiT.
- Evaluación comparativa de calidad visual: permite generar el mismo prompt con base y con heal y comparar resultados, aunque el autor no reclama mejoras.
- Despliegue en entornos con memoria limitada usando la versión INT8 ConvRot publicada en repositorio separado.
- Docencia y divulgación: ejemplo práctico de destilación con penalizaciones sobre el residual stream en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen en la información disponible. El autor indica explícitamente que las estadísticas de pesos no constituyen una evaluación de calidad. Los únicos datos numéricos publicados son las estadísticas de pesos:

| Metrica | Base | MOSS-Image-Base-Heal |
|---|---|---|
| Elementos con abs > 64x RMS del tensor | 349 | 0 |
| Elementos con abs > 32x RMS del tensor | 2.621 | 15 |
| Mayor abs / RMS del tensor | 271,7 | 54,7 |
| Elementos con abs > 16x RMS del tensor | 17.555 | 15.310 |

## Requisitos de hardware

- VRAM estimada para el transformer en bf16: en torno a 10 GB solo para los pesos, más memoria para activaciones y el resto del pipeline (codificador de texto Qwen3.5-9B y VAE Flux.2), que no se incluyen en este repositorio.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de pesos, GPUs con 24 GB o más son un punto de partida razonable para el pipeline completo en bf16.
- Versión INT8 ConvRot disponible en SumomoLee/MOSS-Image-Base-Heal-INT8-ConvRot para reducir requisitos de memoria.
- Opciones de despliegue: ComfyUI (archivo único) y diffusers (carpeta `transformer/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SumomoLee/MOSS-Image-Base-Heal | 5.082.308.624 | no disponible | Apache-2.0 | Hugging Face, diffusers y ComfyUI | Fine-tune con outliers reducidos, sin evaluación de calidad publicada |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo base original; incluye codificador de texto y VAE |
| KBlueLeaf/MOSS-Image-heal | no disponible | no disponible | no disponible | Hugging Face | Ejecución previa del mismo método de heal |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo no oficial de la comunidad, proporcionado "as is" y sin garantía.
- El autor no reclama ninguna mejora de calidad de imagen; solo documenta estadísticas de pesos.
- No se incluyen el codificador de texto ni el VAE, por lo que no es un pipeline autónomo: requiere el resto de componentes de MOSS-Image-Base.
- Los elementos por encima de 16 veces el RMS no se reducen, de modo que el "heal" es parcial.
- Riesgo de sesgos y de contenido inapropiado heredado del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinación visual y de prompts mal interpretados, sin evaluación publicada al respecto.
- Idiomas soportados no documentados.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes auxiliares.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SumomoLee/MOSS-Image-Base-Heal
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Versión INT8 ConvRot: https://huggingface.co/SumomoLee/MOSS-Image-Base-Heal-INT8-ConvRot
- Repositorio del método de heal: https://github.com/KohakuBlueleaf/KohakuMossTrainer
- Ejecución previa del heal: https://huggingface.co/KBlueLeaf/MOSS-Image-heal
