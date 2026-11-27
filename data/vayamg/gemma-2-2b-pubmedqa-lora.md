# VayamG/gemma-2-2b-pubmedqa-lora

## Resumen
El modelo VayamG/gemma-2-2b-pubmedqa-lora es un ajuste fino mediante LoRA (Low-Rank Adaptation) sobre el modelo base Gemma 2 de 2 mil millones de parametros, desarrollado por el usuario VayamG y publicado en Hugging Face. Por el nombre del repositorio se deduce que el ajuste esta orientado a la tarea de question answering sobre el corpus PubMedQA, un conjunto de datos de preguntas y respuestas biomedicas derivadas de resumenes de articulos cientificos. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers.

La relevancia de esta publicacion es limitada en el momento actual: el repositorio presenta cero descargas y cero likes, y su model card es la plantilla autogenerada por Hugging Face sin ningun dato tecnico rellenado por el autor. Esto significa que no hay informacion publica sobre hiperparametros de entrenamiento, composicion del dataset, resultados de evaluacion ni condiciones de licencia. Cualquier evaluacion rigurosa del modelo requiere inspeccionar directamente los pesos y ejecutar una bateria de pruebas propia.

Se trata, por tanto, de un artefacto experimental de ajuste fino de dominio especifico mas que de un modelo listo para produccion. Su interes principal radica en servir como ejemplo de adaptacion de Gemma 2 2B a un dominio cientifico concreto mediante LoRA, una tecnica de bajo coste computacional que permite especializar modelos pequenos con recursos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 2 2B) con adaptadores LoRA |
| Parametros totales | 2 mil millones (modelo base Gemma 2 2B); rango y dimension de los adaptadores LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Gemma 2 2B soporta 8192 tokens en su configuracion original) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (Gemma 2 esta entrenado principalmente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Gemma 2 2B, un transformer decoder-only de Google con atencion por ventanas alternada y atencion global, disenado para inferencia eficiente en hardware de consumo. Sobre este modelo base se ha aplicado un ajuste fino con LoRA, tecnica que congela los pesos originales e inserta matrices de bajo rango entrenables en las capas de atencion y/o feed-forward. El nombre del repositorio indica que el corpus de entrenamiento es PubMedQA, un dataset de preguntas de investigacion biomedica con respuestas de tipo si/no/quizas y justificaciones extraidas de abstracts de PubMed.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la configuracion exacta de LoRA (rango, alpha, dropout, modulos objetivo), la tasa de aprendizaje, el numero de epocas ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La model card no documenta ninguna innovacion tecnica ni detalle del procedimiento de entrenamiento. Tampoco se especifica si los pesos publicados incluyen solo los adaptadores LoRA o una fusion completa con el modelo base.

## Capacidades
- Generacion de texto y respuesta a preguntas en el dominio biomedico, presumiblemente especializada en el formato de PubMedQA.
- Razonamiento sobre abstracts cientificos y evidencia textual de articulos de PubMed.
- Clasificacion de respuestas de tipo si/no/quizas con justificacion, segun el esquema del dataset PubMedQA.
- Capacidades generales heredadas de Gemma 2 2B: generacion de texto, razonamiento basico y codigo, aunque potencialmente degradadas por el ajuste de dominio.
- Soporte de tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo base esta orientado al ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Question answering biomedico automatizado: el modelo puede responder preguntas de investigacion clinica formuladas en lenguaje natural, usando el formato de PubMedQA (respuesta categorica mas justificacion), lo que resulta util para prototipos de asistentes de literatura cientifica.
- Triaje de evidencia en revisiones sistematicas: dado un abstract, el modelo puede clasificar si la evidencia responde afirmativa o negativamente a una pregunta de investigacion, acelerando el cribado inicial de articulos.
- Extraccion de conclusiones de abstracts: integrado en un pipeline de procesamiento de PubMed, puede generar resumenes de hallazgos para investigadores que necesitan una primera aproximacion al contenido.
- Educacion medica y simulacion de examenes: el modelo puede emplearse para generar preguntas y respuestas de practica sobre temas biomedicos, siempre con supervision humana dada la tasa de error esperable en un modelo de 2B.
- Base para ajustes adicionales de dominio: al ser un LoRA pequeno sobre Gemma 2 2B, sirve como punto de partida para experimentos de especializacion en subdominios medicos concretos (oncologia, cardiologia, etc.) con coste computacional reducido.
- Investigacion en adaptacion de bajo rango: util para estudiar como afecta el ajuste LoRA al conocimiento factual de un modelo base pequeno en un dominio cientifico, comparando antes y despues del ajuste.
- Despliegue en entornos con recursos limitados: al partir de un modelo de 2B, puede ejecutarse en GPU de consumo para tareas de procesamiento por lotes de abstracts, aunque la calidad en dominios fuera de PubMedQA sera limitada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada, y el repositorio no registra descargas ni evaluaciones de la comunidad.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 4-5 GB para el modelo base de 2B parametros; los adaptadores LoRA anaden una cantidad marginal (decenas de MB segun el rango).
- VRAM estimada en cuantizacion 4-bit: aproximadamente 1,5-2 GB, aunque no se confirma que existan pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp16; para cuantizacion 4-bit basta con 4 GB.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer modernas con 8 GB o mas.
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se documenta compatibilidad.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de si los adaptadores estan fusionados con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VayamG/gemma-2-2b-pubmedqa-lora | 2B (+LoRA) | no disponible | Biomedico (PubMedQA) | no disponible | Hugging Face |
| google/gemma-2-2b | 2B | 8192 tokens | Generalista | Gemma Terms of Use | Hugging Face |
| microsoft/BioGPT-Large | 1.5B | 1024 tokens | Biomedico | MIT | Hugging Face |
| epfl-llm/meditron-7b | 7B | 4096 tokens | Biomedico | Llama 2 license | Hugging Face |

La comparativa es orientativa: no existen datos publicos de rendimiento de este LoRA que permitan una comparacion cuantitativa con BioGPT o Meditron. La principal ventaja del modelo es su bajo coste de despliegue (2B parametros), mientras que su desventaja es la ausencia total de documentacion y evaluacion.

## Limitaciones y advertencias
- Model card autogenerada y sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento, hiperparametros ni evaluacion, lo que impide auditar el modelo.
- Riesgo elevado de alucinacion en un modelo de 2B ajustado con LoRA sobre un dataset pequeno; las respuestas medicas pueden ser factualmente incorrectas.
- No apto para uso clinico ni para toma de decisiones medicas sin supervision experta y validacion externa.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; ademas, hereda las restricciones de los Gemma Terms of Use del modelo base.
- Idiomas no documentados: probablemente solo funcione bien en ingles, dado el modelo base y el corpus PubMedQA.
- Longitud de contexto no confirmada; aunque Gemma 2 2B soporta 8192 tokens, el ajuste LoRA podria no haber sido entrenado con secuencias largas.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- No se especifica si los pesos son solo adaptadores LoRA o el modelo fusionado, lo que puede complicar la carga con transformers.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/VayamG/gemma-2-2b-pubmedqa-lora
- Modelo base Gemma 2 2B: https://huggingface.co/google/gemma-2-2b
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Paper de PubMedQA: https://arxiv.org/abs/1909.06146
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
