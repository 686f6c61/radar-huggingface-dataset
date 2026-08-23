# uiaa-ide/UiAA-1.5-9B

## Resumen

UiAA-1.5-9B es una cuantización GGUF del modelo Ornith-1.5-9B-uncensored, desarrollada por uiaa-ide sobre el trabajo original de junafinity. El modelo base pertenece a la familia Ornith, que según los metadatos se basa en arquitectura Qwen3.5 con capacidades multimodales (visión) y ha sido sometido a técnicas de "abliteration" y "zerofuse" para eliminar sesgos de seguridad y producir una versión sin censura.

La relevancia de esta ficha radica en que ofrece pesos cuantizados en formato GGUF listos para inferencia local con llama.cpp, Ollama u otros motores compatibles, incluyendo los suplementos multimodales (mmproj) necesarios para el procesamiento de imágenes. Con aproximadamente 9 000 millones de parámetros, se sitúa en el rango medio-bajo de modelos, adecuado para despliegue en hardware de consumo con las cuantizaciones adecuadas. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren basada en Qwen3.5, con soporte multimodal) |
| Parametros totales | 8 953 803 264 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se indica en la informacion) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (repo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Ornith-1.5-9B-uncensored. Los metadatos indican que pertenece a la familia "Ornith" y se etiqueta como "qwen3_5", lo que sugiere una arquitectura de transformer denso basada en Qwen3.5, probablemente con atencion por ventanas y soporte para entradas multimodales (vision). La version base ha sido sometida a tecnicas de "abliteration" y "zerofuse", que consisten en la eliminacion selectiva de direcciones de activacion relacionadas con politicas de seguridad y rechazo de contenido, produciendo un modelo "uncensored".

Los datos de entrenamiento, el numero de tokens y si se aplico RLHF o DPO no estan disponibles en la informacion proporcionada. El proceso de cuantizacion fue realizado por mradermacher, quien genero los pesos GGUF a partir del modelo original en formato safetensors.

## Capacidades

- Generacion de texto en ingles sin censura: el modelo base ha sido sometido a abliteration, por lo que no aplica filtros de seguridad tipicos de otros modelos, lo que permite generar contenido que otros modelos rechazan.
- Multimodal con vision: incluye suplementos mmproj (proyector multimodal) que permiten procesar imagenes junto con texto, probablemente para tareas de captioning, VQA o razonamiento visual.
- Conversacional: etiquetado como "conversational", apto para chat multi-turno.
- Tool calling: no se especifica en los metadatos, aunque los modelos basados en Qwen3.5 suelen soportar function calling.
- Agentes y razonamiento multi-paso: no confirmado en la informacion.
- Multilingue: solo se declara el ingles en el campo "language", aunque los modelos Qwen suelen tener capacidad multilingue; no hay datos concretos.

## Casos de uso

- **Generacion de contenido creativo sin restricciones**: el modelo puede producir textos narrativos, dialogos o guiones sin las restricciones tipicas de los modelos censurados, util para autores que necesitan explorar temas sensibles.
- **Chat conversacional en ingles**: su naturaleza "uncensored" y conversacional permite desplegarlo en asistentes personales donde se requiere respuestas directas sin filtros morales.
- **Analisis de imagenes en entornos de investigacion**: gracias al suplemento multimodal, puede usarse para tareas de captioning o extraccion de informacion de imagenes en investigacion academica.
- **Experimentacion con tecnicas de alineacion**: investigadores pueden estudiar el efecto de la abliteration en el comportamiento del modelo, comparandolo con la version censurada original.
- **Prototipado de aplicaciones de IA en local**: al ser GGUF, se puede integrar en herramientas como llama.cpp, Ollama o text-generation-webui para pruebas rapidas en hardware de consumo.
- **Generacion de codigo o razonamiento en entornos de desarrollo**: aunque no se confirman capacidades especificas, los modelos de 9B suelen desempenarse bien en tareas de programacion; requiere validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K u otros. No se dispone de datos comparativos de rendimiento respecto a otros modelos de tamano similar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantizacion. El Q4_K_M (5.7 GB) es el mas recomendado para GPUs con 8 GB de VRAM; el Q8_0 (9.6 GB) requiere al menos 12 GB.
- **GPUs recomendadas**: RTX 3060/4060 (8 GB) para cuantizaciones Q4; RTX 3090/4090 (24 GB) para Q8_0 o f16.
- **En consumer GPU**: si, con cuantizaciones Q4 o Q5 en GPUs de 8-12 GB.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptacion GGUF) y TGI (convertiendo a safetensors).
- **Latencia y throughput**: no disponible. En una RTX 4090 con Q4_K_M se estima 40-60 tokens/s para 9B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos. Como referencia generica, los modelos de 9B mas conocidos son:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UiAA-1.5-9B | 8.95B | no disponible | Apache 2.0 | GGUF, safetensors |
| Yi-1.5-9B-Chat | 9B | 4K (16K con extension) | Apache 2.0 | safetensors |
| Llama-3.2-8B | 8B | 128K | Llama 3.2 License | safetensors, GGUF |

Nota: los datos de Yi-1.5-9B provienen de la busqueda web; no se dispone de benchmarks comparativos entre estos modelos y UiAA-1.5-9B.

## Limitaciones y advertencias

- **Falta de informacion**: no se publican detalles de entrenamiento, contexto, ni benchmarks, lo que dificulta la evaluacion objetiva.
- **Modelo sin censura**: la abliteration elimina las salvaguardias de seguridad; puede generar contenido ofensivo, sesgado o peligroso si se usa sin moderacion.
- **Solo ingles declarado**: aunque la arquitectura base pueda soportar otros idiomas, no se garantiza calidad fuera del ingles.
- **Riesgo de alucinacion**: como cualquier modelo de 9B, puede inventar hechos, especialmente en tareas de razonamiento complejo.
- **Multimodal limitado**: el suplemento mmproj esta disponible, pero no se especifica la resolucion de imagen soportada ni el rendimiento en tareas de vision.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; el usuario es responsable de cumplir con la normativa de contenido.

## Enlaces

- [HuggingFace: uiaa-ide/UiAA-1.5-9B](https://huggingface.co/uiaa-ide/UiAA-1.5-9B)
- [Modelo base: junafinity/Ornith-1.5-9B-uncensored](https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored)
- [Cuantizaciones con imatrix: mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF](https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-i1-GGUF)
- [Pagina de referencia del autor para el modelo](https://hf.tst.eu/model#Ornith-1.5-9B-uncensored-GGUF)
- [Solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
