# Xylolabs/Qwen3.6-27B-GGUF

## Resumen

Qwen3.6-27B-GGUF es una cuantización en formato GGUF del modelo Qwen3.6-27B, publicada por Xylolabs como referencia de texto preservada para su uso con llama.cpp. El modelo base es un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por el equipo Qwen de Alibaba Cloud, distribuido bajo licencia Apache 2.0. Esta exportación concreta no introduce entrenamiento, calibración ni cuantización nueva: se limita a convertir los pesos originales a un formato mixto Q4_K_M y a verificar que la fidelidad respecto al modelo de referencia se mantiene.

La relevancia de esta ficha radica en que ofrece un punto de entrada práctico para ejecutar un modelo de escala 27B en hardware de consumo o en servidores modestos, con un peso de fichero de 16,811 GB y 4,919 bits medios por peso almacenado. El autor documenta un proceso de validación con 33 respuestas principales correctas sobre 33 y 7 revalidaciones de razonamiento correctas sobre 7, con una divergencia KL media de 0,025816 y un 93,23 % de acuerdo top-1 respecto al profesor BF16.

El modelo conserva los 866 tensores originales, incluyendo las 64 capas del modelo principal y los 15 tensores del módulo MTP (multi-token prediction) de una capa, aunque la generación documentada utiliza únicamente el modelo principal. Los pesos del codificador de visión y del proyector se han omitido, por lo que esta exportación es estrictamente de texto. La información pública disponible no detalla la longitud de contexto nativa del modelo base ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (64 capas en el modelo principal), con módulo MTP de una capa preservado en los pesos |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la metadata original de contexto se conserva sin cambios en el GGUF |
| Tipos de cuantizacion | Q4_K_M mixto: F32 (360 tensores), Q4_K (439 tensores), Q6_K (67 tensores); 4,919 bits medios por peso |
| Idiomas soportados | Ingles y coreano (segun los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Qwen3.6-27B-Q4_K_M.gguf`, 16,811 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso de 64 capas, con un total de 27.320.697.856 parametros. El repositorio GGUF preserva los 866 tensores del modelo original, que incluyen las capas del modelo principal y 15 tensores adicionales correspondientes a un modulo MTP (multi-token prediction) de una sola capa. Segun la model card, la generacion documentada utiliza unicamente el modelo principal, por lo que el modulo MTP esta presente en el fichero pero no se emplea en la inferencia descrita. Los pesos del codificador de vision y del proyector no estan incluidos, lo que confirma que se trata de una exportacion exclusivamente de texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion, ya que la model card de esta cuantizacion remite al release original de Qwen y no reproduce esos detalles. La cuantizacion en si no realizo entrenamiento, calibracion ni cuantizacion adicional para la publicacion: se trata de una conversion a Q4_K_M con tipos de tensor mixtos y verificacion de fidelidad frente al profesor BF16. La evaluacion de preservacion se realizo sobre 16 secuencias de 1.024 tokens en ingles y coreano, con 16.240 posiciones puntuadas, y el proceso de calibracion y evaluacion coincide con el fingerprint original, incluyendo identificadores de secuencia, tokens, posicion inicial, los 33+7 prompts, el token de parada y el presupuesto de generacion. La verificacion de ajuste en memoria contabiliza todos los pesos del modelo principal, MTP, embedding y cabeza de salida, junto con el estado KV, el estado recurrente y los buffers de trabajo reales.

## Capacidades

- Generacion de texto conversacional de un solo turno y multi-turno, con soporte de plantilla de chat original conservada en los metadatos.
- Razonamiento explicito: la model card documenta un modo de razonamiento ("thinking") que puede activarse o desactivarse mediante el flag `--reasoning` de llama.cpp, con revalidaciones especificas de este modo en la evaluacion.
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del repositorio.
- Compatibilidad con llama.cpp y con endpoints compatibles (tag `endpoints_compatible`).
- Soporte de plantilla Jinja para el formateo de conversaciones (`--jinja` en la CLI de ejemplo).
- No incluye capacidades de vision: los pesos del codificador visual y del proyector fueron omitidos deliberadamente.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la informacion disponible.
- No se documenta soporte de audio.

## Casos de uso

- Asistente conversacional local en ingles o coreano: el modelo puede ejecutarse con llama.cpp en una estacion de trabajo con suficiente memoria, gestionando dialogos multi-turno mediante la plantilla de chat preservada y el flag `--jinja`, sin dependencia de servicios en la nube.
- Generacion de texto en entornos con recursos limitados: con 16,811 GB de pesos en Q4_K_M, es viable en GPUs de consumo de gama alta con 24 GB de VRAM o en configuraciones con offload parcial a CPU, lo que permite desplegar un modelo de 27B en hardware asequible.
- Prototipado e investigacion de tecnicas de cuantizacion: el repositorio documenta con detalle el proceso de evaluacion de fidelidad (KL media, acuerdo top-1, verificacion de fingerprint), lo que lo convierte en una referencia util para estudiar el impacto de Q4_K_M en un modelo de 27B.
- Evaluacion de razonamiento con modo thinking: el modelo permite alternar el razonamiento explicito, lo que facilita experimentos comparativos sobre la calidad de las respuestas con y sin cadena de pensamiento.
- Procesamiento de texto en coreano: al ser uno de los dos idiomas declarados, puede emplearse para tareas de generacion, resumen o reescritura en este idioma, aunque la informacion disponible no detalla el nivel de calidad por idioma.
- Despliegue en pipelines con llama.cpp: la compatibilidad con endpoints y la CLI documentada permiten integrar el modelo en flujos de generacion por lotes o servicios internos, siempre que se dimensionen correctamente el KV cache y los buffers de trabajo.
- Referencia para comparativas de cuantizacion: al preservar el profesor BF16 bit-exacto en las slices puntuadas, sirve como baseline para comparar otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos de evaluacion disponibles son los de preservacion de la cuantizacion frente al profesor BF16:

| Metrica | Resultado |
|---|---|
| Respuestas principales correctas | 33/33 |
| Revalidaciones de thinking correctas | 7/7 |
| Perdidas contadas o respuestas rotas | 0 |
| Divergencia KL media | 0,025816 |
| Acuerdo top-1 | 93,23 % |
| Ratio KL respecto al baseline Q4 | 1,000x (es el propio baseline) |
| Secuencias de evaluacion | 16 (1.024 tokens cada una, ingles/coreano) |
| Posiciones puntuadas | 16.240 |
| Contexto de cualificacion | 8.192 tokens |

No se han publicado resultados de benchmarks de capacidad (razonamiento, codigo, matematicas) en la informacion disponible. La model card indica explicitamente que no se reporta velocidad de inferencia.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 16,80 GB solo para los pesos GGUF, mas espacio adicional para el KV cache, el estado recurrente y los buffers de trabajo.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por el tamano de pesos, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090 o A10G) o superior (A100 40/80 GB, H100) permitiria mantener los pesos en memoria con margen para el KV cache.
- Cabe en GPU de consumo: si, en GPUs de gama alta con 24 GB de VRAM, siempre que se ajuste la longitud de contexto y el KV cache; en GPUs con menos VRAM requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (verificado con la version v0.9.0 segun la model card), y por extension cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque no se detalla la lista concreta.
- Latencia y throughput: no disponibles; la model card indica explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de benchmarks del modelo base ni de alternativas en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-27B-GGUF (esta ficha) | 27,3 B | No disponible | GGUF Q4_K_M (16,811 GB) | Apache 2.0 | Hugging Face, llama.cpp |
| Qwen/Qwen3.6-27B (modelo base) | 27,3 B | No disponible | Pesos originales (safetensors) | Apache 2.0 | Hugging Face |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables, por lo que no se ofrece una comparativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser una cuantizacion del modelo base, hereda los sesgos de este, que no se detallan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como todo modelo generativo de texto, existe riesgo de generar contenido incorrecto, especialmente en dominios especializados.
- Limitaciones de idioma: solo se declaran ingles y coreano; no hay evidencia de soporte de calidad para el castellano ni para otros idiomas.
- Limitaciones de contexto: la longitud de contexto nativa no se especifica; la evaluacion se realizo con contexto 8.192, y el ejemplo de la CLI usa solo 2.048 tokens. El KV cache y los buffers consumen memoria adicional no incluida en los 16,80 GB de pesos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card aclara que se proporciona "as is", sin garantia ni respaldo del upstream; los terminos originales completos estan en el fichero LICENSE y el NOTICE identifica a Qwen Team y Alibaba Cloud.
- Sin vision: los pesos del codificador visual y del proyector fueron omitidos, por lo que no puede procesar imagenes.
- MTP no evaluado: el modulo MTP esta presente en el fichero pero la generacion documentada no lo utiliza; la model card advierte que las comprobaciones no evaluan la decodificacion MTP ni entradas de imagen, y que una integracion debe realizar su propia evaluacion de tarea.
- Sin datos de velocidad: no se reporta latencia ni throughput, lo que impide estimar el rendimiento en produccion a partir de la informacion publicada.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y creado el 14 de noviembre de 2026; conviene verificar la integridad y el mantenimiento antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Documentacion de llama.cpp para GGUF en Hugging Face: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio de llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-27B-GGUF/blob/main/LICENSE
