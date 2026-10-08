# vosldtgbj/project-llm-sft-v3-l5-h1p0-seed20261006

## Resumen

El modelo `project-llm-sft-v3-l5-h1p0-seed20261006` es un ajuste supervisado (SFT) publicado por el usuario `vosldtgbj` como parte de una serie de experimentos denominada "Project LLM". Se construye sobre el checkpoint de preentrenamiento continuado `project-llm-cpt-1p0-top10-01-full-02`, que a su vez deriva de la familia Gemma 4 de Google, según indican las etiquetas `gemma4` y `gemma4_unified` y el enlace de licencia apuntando a los términos de Gemma 4. El repositorio se presenta explícitamente como un archivo de pesos completos destinado a reproducción experimental, evaluación offline e investigación posterior, no como un modelo listo para producción.

Técnicamente se trata de un modelo multimodal de tipo "any-to-any" (entrada y salida de imagen y texto) con 11.959.730.176 parámetros (aproximadamente 12.000 millones), pesos en safetensors fragmentados y un tamaño de repositorio de 24,0 GB, coherente con pesos en precisión de 16 bits. La arquitectura declarada es `gemma4_unified`, cargable mediante `AutoModelForMultimodalLM` y `AutoProcessor` en versiones de Transformers que soporten dicha arquitectura.

La relevancia de esta ficha es limitada pero concreta: sirve para documentar un checkpoint de investigación con licencia Apache-2.0 a nivel de repositorio pero sujeto a los términos de uso de Gemma 4 aguas arriba, y con muy poca información publicada sobre contexto, idiomática o rendimiento. La model card no aporta resultados de benchmarks, ni longitud de contexto, ni composición detallada del dataset de SFT, por lo que buena parte de las especificaciones figuran como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal, pipeline any-to-any) |
| Parametros totales | 11.959.730.176 (~12.000 millones) |
| Parametros activos | no aplica (no se declara arquitectura MoE) / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | etiqueta `japanese` en la model card; lista oficial de idiomas "no disponible" |
| Licencia | apache-2.0 en el repositorio, con sujecion a los terminos de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | safetensors fragmentados (repo de 24,0 GB) |
| Modelo base | `vosldtgbj/project-llm-cpt-1p0-top10-01-full-02` |
| Fase de entrenamiento | SFT v3 (90% datos de dominio + 10% datos generales), 1,0 epoca |
| Metodo de ajuste | LoRA SFT (r=128, alpha=256, dropout=0,05, LR=2e-5), pesos fusionados |
| Biblioteca | transformers |
| Fecha de creacion / actualizacion | 2026-10-08 / 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal identificado en el campo `library_name`/tags como `gemma4_unified`, integrado en el ecosistema Gemma 4 de Google. El pipeline declarado es `any-to-any`, con soporte adicional etiquetado como `image-text-to-text`, lo que implica entrada y generacion tanto de texto como de imagen. No se documenta en la informacion disponible si se emplean mecanismos adicionales como atencion lineal, decodificacion especulativa o mezcla de expertos; el numero de parametros totales coincide con el de un modelo denso de ~12B, por lo que no hay indicios de arquitectura MoE.

El proceso de entrenamiento consta de dos etapas encadenadas conocidas: un preentrenamiento continuado (CPT) sobre el checkpoint `project-llm-cpt-1p0-top10-01-full-02`, y despues un SFT v3 sobre una mezcla compuesta por un 90% de datos de dominio especifico y un 10% de datos generales, durante 1,0 epoca. El ajuste se realizo con LoRA (rango 128, alpha 256, dropout 0,05, tasa de aprendizaje 2e-5) y los adaptadores se fusionaron en los pesos completos. No se especifica el volumen total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas posteriores de alineacion como RLHF o DPO. El repositorio almacena unicamente pesos y configuracion, sin estados de optimizador ni de reanudacion.

## Capacidades

- Generacion de texto multimodal en pipeline any-to-any, segun la etiqueta declarada por el autor.
- Procesamiento de imagen y texto como entrada y salida (image-text-to-text), de acuerdo con las etiquetas y el uso de `AutoModelForMultimodalLM`.
- Ajuste supervisado orientado a datos de dominio (SFT v3 con 90% de datos de dominio), lo que sugiere especializacion en una tarea o corpus concreto no detallado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: se declara la etiqueta `japanese`; no hay lista oficial de idiomas ni evaluacion multilingue publicada.
- Modo de "pensamiento" (thinking mode) u otras capacidades especiales: no disponible.

## Casos de uso

- Reproduccion experimental de la serie "Project LLM": cargar el checkpoint con el `gemma4_unified` de Transformers para replicar el resultado del SFT v3 descrito en la model card (LoRA r=128, alpha=256, 1,0 epoca), comparandolo con el checkpoint CPT previo.
- Evaluacion offline comparativa: usar el modelo como punto de medida frente al checkpoint `project-llm-cpt-1p0-top10-01-full-02` para aislar el efecto de la etapa SFT, siempre que se disponga de un conjunto de validacion propio del dominio.
- Investigacion sobre ajuste eficiente: analizar el impacto de LoRA a rango 128 y alpha 256 en un modelo multimodal de ~12B al fusionar adaptadores, como caso de estudio metodologico.
- Prototipado multimodal en japones: dado que se declara la etiqueta `japanese`, emplearlo como base de pruebas para tareas de imagen-texto en ese idioma, verificando previamente la calidad real mediante evaluacion propia.
- Base para experimentos posteriores de alineacion: al ser un SFT sin etapas documentadas de RLHF/DPO, sirve como punto de partida para aplicar tecnicas de preferencia y medir su efecto.
- Docencia y formacion: utilizar el repositorio como ejemplo de flujo completo CPT a SFT con fusion de LoRA y publicacion de pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y no se dispone de comparaciones numericas con modelos equivalentes.

## Requisitos de hardware

- VRAM estimada (segun ~12B parametros):
  - FP16 / BF16: en torno a 24 GB solo para pesos, mas el cache KV y activaciones.
  - Cuantizacion de 8 bits: aproximadamente 12-14 GB para pesos.
  - Cuantizacion de 4 bits: aproximadamente 7-9 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S y A6000 para inferencia en precision completa con margen; RTX 4090 (24 GB) al limite en FP16 y con holgura en cuantizacion.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) usando cuantizacion; en GPUs de 12-16 GB solo con cuantizacion agresiva (4 bits) y ventanas de contexto pequenas.
- Opciones de despliegue: transformers (con `AutoModelForMultimodalLM` y `AutoProcessor`), vLLM y TGI para servicio de alto rendimiento; llama.cpp / Ollama no estan confirmados al no publicarse pesos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles; dependen de la GPU, la precision y la longitud de secuencia, y no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `project-llm-sft-v3-l5-h1p0-seed20261006` | 11.959.730.176 | no disponible | any-to-any (imagen-texto) | apache-2.0 + terminos de Gemma 4 | no disponibles |
| `project-llm-cpt-1p0-top10-01-full-02` (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponibles |
| Gemma 4 (modelo aguas arriba) | no disponible | no disponible | multimodal (familia Gemma 4) | terminos de Gemma 4 | no disponibles |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria; los datos de parametros, contexto y rendimiento de los modelos de referencia figuran como no disponibles.

## Limitaciones y advertencias

- Ausencia total de datos de rendimiento: no hay benchmarks publicados, por lo que no es posible estimar su calidad relativa frente a otros modelos de ~12B.
- Riesgo de alucinacion: al no documentarse etapas de alineacion (RLHF/DPO) ni evaluaciones de factualidad, no puede descartarse un riesgo elevado de respuestas inventadas, especialmente en uso fuera de su dominio de ajuste.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo; el modelo hereda los sesgos del preentrenamiento de Gemma 4 y del corpus de dominio empleado en el SFT.
- Especializacion de dominio: el SFT se realizo con un 90% de datos de dominio, lo que puede degradar el rendimiento en tareas generales fuera de ese dominio.
- Cobertura idiomatica incierta: la unica referencia es la etiqueta `japanese`; no hay lista oficial de idiomas ni evaluacion multilingue, por lo que el soporte de otros idiomas (incluido el castellano) no esta garantizado.
- Restricciones de licencia: aunque el repositorio declara apache-2.0, el propio autor indica que el uso esta sujeto a los terminos de Gemma 4 de Google, lo que puede imponer condiciones adicionales para uso comercial.
- Naturaleza experimental: el repositorio se define como archivo de reproduccion, sin garantias de soporte, mantenimiento ni idoneidad para produccion; tiene 0 descargas y 0 "likes" en el momento de la consulta.
- Compatibilidad de software: requiere una version de Transformers que soporte la arquitectura `gemma4_unified`; versiones antiguas no podran cargarlo.
- Sin datos de contexto ni de cuantizacion oficial: planificar el despliegue exige validar manualmente la longitud de contexto efectiva y las cuantizaciones viables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vosldtgbj/project-llm-sft-v3-l5-h1p0-seed20261006
- Modelo base (CPT): https://huggingface.co/vosldtgbj/project-llm-cpt-1p0-top10-01-full-02
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- vLLM (motor de inferencia): https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- vLLM (sitio oficial): https://vllm.ai/
- Referencia general sobre SFT: https://www.geeksforgeeks.org/artificial-intelligence/supervised-fine-tuning-sft-for-llms/
- Plantilla de SFT en GCP: https://github.com/vpoluyaktov/llm-sft-test
