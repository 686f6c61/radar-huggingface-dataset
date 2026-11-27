# Xylolabs/GLM-4.6V-Flash-Text-GGUF

## Resumen

GLM-4.6V-Flash-Text-GGUF es una cuantización en formato GGUF del componente de texto del modelo multimodal zai-org/GLM-4.6V-Flash, publicada por Xylolabs. El repositorio contiene una única variante IQ4_XS con calibración imatrix (5,262 GB) destinada a inferencia con llama.cpp, y está pensada exclusivamente para generación de texto: las capacidades de visión del modelo base no se conservan en esta conversión.

El modelo subyacente pertenece a la familia GLM-V de Zhipu AI (zai-org), con 9.400.279.040 parámetros (~9,4 mil millones) y una ventana de contexto de 128K tokens según la tabla de recomendaciones de hardware del autor. La relevancia de esta ficha radica en que ofrece un modelo de casi 10 000 millones de parámetros con contexto de 128 000 tokens en un fichero de poco más de 5 GB, ejecutable en una única GPU de consumo de 24 GB o en equipos con memoria unificada.

La licencia es MIT tanto para los pesos originales como para la conversión, lo que facilita el uso comercial. El autor documenta con detalle la pérdida de fidelidad frente a BF16 en cada cuantización (KL y top-1 sobre WikiText-2 y un conjunto held-out), un dato poco habitual que permite elegir el compromiso tamaño/calidad con información medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia GLM-V, derivada de GLM-4.5V/GLM-4.1V-Thinking; detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 9.400.279.040 (~9,4 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens (según la tabla de recomendaciones de hardware del autor) |
| Tipos de cuantizacion | IQ4_XS con imatrix (único fichero publicado); la tabla de precisión compara además Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS y Q2_K de otros autores |
| Idiomas soportados | Inglés (en) y coreano (ko) declarados en la model card; cobertura multilingüe real del modelo base no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base GLM-4.6V-Flash pertenece a la familia GLM-V, descrita en el paper arXiv:2507.01006 ("GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal Reasoning with Scalable Reinforcement Learning"). Según el título y la citación del paper, la familia combina razonamiento multimodal con aprendizaje por refuerzo escalable; el modelo original es multimodal (visión + texto), pero esta conversión elimina la torre de visión y conserva únicamente el modelo de lenguaje.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card del repositorio cuantizado no incluye información de entrenamiento más allá de la referencia al paper y al modelo base.

La innovación técnica documentada en este repositorio es el proceso de cuantización: el autor aplica imatrix sobre IQ4_XS y publica métricas de divergencia KL y precisión top-1 frente a BF16, tanto en WikiText-2 como en un conjunto held-out, lo que permite cuantificar la degradación introducida. El fichero se ha verificado con una build concreta de llama.cpp (commit cd959bae99ff4bed22bef2604f45241c09bbb8c8) y requiere la flag `--jinja` para procesar correctamente las plantillas de chat.

## Capacidades

- Generación de texto conversacional en inglés y coreano (idiomas declarados).
- Razonamiento de un solo turno y multi-turno, heredado del modelo base GLM-V orientado a razonamiento.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones extensas.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia estándar.
- Ejecución en llama.cpp con soporte de plantillas Jinja (`--jinja`), lo que habilita el formato de chat del modelo.
- Capacidades de visión: no disponibles en esta conversión (modelo explícitamente "text-only").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas en esta model card.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 128K tokens de contexto, el modelo puede resumir contratos, informes o expedientes completos en una sola pasada sobre una RTX 4090 o un Mac Studio, sin depender de APIs externas.
- Asistente conversacional autoalojado en inglés o coreano: el fichero de 5,3 GB cabe en GPUs de 24 GB y permite desplegar un chatbot multi-turno con latencia baja en hardware de consumo, útil para prototipos y entornos con requisitos de privacidad.
- Generación y revisión de texto en pipelines de CI: al ser un GGUF ejecutable con llama.cpp, puede integrarse como paso de validación de documentación o de generación de changelogs en flujos automatizados sin GPU de datacenter.
- Análisis de corpus en investigación: investigadores que necesitan etiquetar o resumir grandes volúmenes de texto pueden ejecutar el modelo en local con cuantización IQ4_XS, aceptando la degradación medida (KL de 0,0237 en WikiText-2, top-1 del 92,95 %).
- Despliegue en hardware con memoria unificada: la tabla del autor lista DGX Spark, Mac Studio M5 Max/Ultra y GPUs profesionales; encaja en estaciones de trabajo Apple o equipos Blackwell para inferencia de texto a gran contexto.
- Base para ajuste fino o evaluación comparativa: el modelo en GGUF sirve como referencia de calidad para comparar cuantizaciones (el autor publica tablas de KL y top-1 frente a Q8_0, Q6_K, Q5_K_M, etc. de Unsloth y llama.cpp).
- Filtrado y clasificación de textos en coreano: uno de los dos idiomas declarados, útil para equipos que trabajan con contenido en ese idioma y quieren inferencia local con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 (Unsloth / llama.cpp) | 10,000 GB | 0,000656 | 98,676 % | 0,002286 | 98,402 % |
| UD-Q6_K_XL (Unsloth) | 8,886 GB | 0,001228 | 98,368 % | 0,003733 | 97,833 % |
| Q6_K (Unsloth) | 8,267 GB | 0,001939 | 97,652 % | 0,009151 | 97,069 % |
| Q6_K (llama.cpp) | 8,267 GB | 0,002146 | 97,485 % | 0,005223 | 97,235 % |
| Q5_K_M (Unsloth) | 7,051 GB | 0,005044 | 96,368 % | 0,026171 | 95,137 % |
| Q5_K_M (llama.cpp) | 7,051 GB | 0,006657 | 95,975 % | 0,020100 | 94,873 % |
| UD-Q5_K_XL (Unsloth) | 7,006 GB | 0,006034 | 96,319 % | 0,024879 | 94,922 % |
| UD-Q4_K_XL (Unsloth) | 6,187 GB | 0,014338 | 94,529 % | 0,038341 | 93,265 % |
| Q4_K_M (Unsloth) | 6,167 GB | 0,015350 | 94,279 % | 0,041618 | 92,873 % |
| Q4_K_M (llama.cpp) | 6,167 GB | 0,020170 | 93,436 % | 0,034994 | 92,618 % |
| IQ4_XS (Unsloth) | 5,282 GB | 0,023587 | 93,039 % | 0,058819 | 91,392 % |
| **IQ4_XS-imat (este repo)** | **5,262 GB** | **0,023699** | **92,951 %** | **0,072904** | **90,843 %** |
| UD-Q3_K_XL (Unsloth) | 5,140 GB | 0,046156 | 90,225 % | 0,101096 | 88,794 % |
| Q3_K_M (Unsloth) | 4,975 GB | 0,053432 | 89,324 % | 0,089136 | 87,725 % |
| Q3_K_M (llama.cpp) | 4,975 GB | 0,067915 | 87,770 % | 0,101250 | 86,461 % |
| UD-IQ3_XXS (Unsloth) | 4,235 GB | 0,094896 | 85,613 % | 0,146214 | 83,706 % |
| UD-Q2_K_XL (Unsloth) | 4,211 GB | 0,151769 | 82,544 % | 0,209450 | 81,137 % |
| Q2_K (Unsloth) | 4,006 GB | 0,178891 | 80,941 % | 0,256926 | 78,069 % |

Observación: la variante IQ4_XS-imat de este repositorio tiene un KL en held-out (0,0729) superior al de IQ4_XS de Unsloth (0,0588) con un tamaño prácticamente idéntico, por lo que la calibración imatrix no mejora la fidelidad global en los datos publicados.

## Requisitos de hardware

- VRAM para inferencia: el fichero IQ4_XS-imat ocupa 5,262 GB; con la caché KV para 128K de contexto el consumo real será mayor (no cuantificado en la información disponible).
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y RTX 5090 (32 GB) con contexto de 128K según la tabla del autor.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build verificada con `llama-cli -m ... --jinja`); otros motores como vLLM, TGI u Ollama no se mencionan en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar del modelo base en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| GLM-4.6V-Flash-Text-GGUF (este) | ~9,4 mil millones | 128K | MIT | GGUF IQ4_XS-imat, 5,3 GB |
| GLM-4.6V-Flash (base, zai-org) | ~9,4 mil millones | No disponible en la información | MIT | Pesos originales multimodales (visión + texto) |
| Cuantizaciones de Unsloth del mismo base (Q4_K_M, Q5_K_M, Q6_K, etc.) | ~9,4 mil millones | 128K | MIT | GGUF con distintos tamaños (4,0–10,0 GB) |
| Cuantizaciones de llama.cpp del mismo base (Q4_K_M, Q5_K_M, Q6_K, Q8_0) | ~9,4 mil millones | 128K | MIT | GGUF con distintos tamaños (4,9–10,0 GB) |

No se han identificado en la información proporcionada modelos de otras familias comparables directamente; la comparación con alternativas como Qwen o Llama no está respaldada por datos disponibles.

## Limitaciones y advertencias

- Modelo solo texto: la torre de visión del GLM-4.6V-Flash original se ha eliminado; no procesa imágenes.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está documentado y podría ser deficiente.
- Degradación por cuantización: frente a BF16, el IQ4_XS-imat presenta un KL de 0,0237 en WikiText-2 y 0,0729 en held-out, con top-1 del 92,95 % y 90,84 % respectivamente; para tareas sensibles a la fidelidad conviene valorar Q6_K o Q8_0.
- La calibración imatrix no mejora la fidelidad global respecto a IQ4_XS de Unsloth en los datos publicados (KL held-out mayor con tamaño casi idéntico).
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad en esta model card.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Requiere una build concreta de llama.cpp y la flag `--jinja`; otras versiones o motores pueden no interpretar correctamente la plantilla de chat.
- El consumo real de VRAM con 128K de contexto no está cuantificado; la cifra de 5,3 GB corresponde solo a los pesos.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y del paper asociado por si hubiera términos adicionales no reflejados en esta conversión.
- No hay datos publicados de tool calling, agentes ni modo thinking para esta variante, por lo que no deberían asumirse en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Text-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Paper de la familia GLM-V: https://arxiv.org/abs/2507.01006
- Build de llama.cpp verificada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Text-GGUF/blob/main/LICENSE
