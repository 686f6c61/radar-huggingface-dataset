# UraionLabs/Arete-27B-GGUF

## Resumen

Arete-27B-GGUF es la colección de cuantizaciones en formato GGUF del modelo NousResearch/Arete-27B, publicada por UraionLabs. No se trata de un modelo nuevo ni de un fine-tune, sino de una conversión independiente del modelo base de Nous Research a los formatos que consume llama.cpp. El repositorio incluye 23 archivos que cubren desde 2 bits (IQ2_XXS, 8,4 GB) hasta precisión original BF16 (53,8 GB), con calibración por importance matrix (imatrix) en la mayoría de variantes.

El modelo base tiene 26.895.998.464 parámetros (aproximadamente 27B) y está construido sobre la arquitectura que la model card etiqueta como `qwen3_5`, lo que implica que requiere una versión reciente de llama.cpp con soporte para Qwen3.5. La licencia es Apache-2.0 y el idioma declarado es únicamente inglés.

Su relevancia práctica es que permite ejecutar un modelo de 27B en hardware de consumo: la cuantización Q4_K_M ocupa 16,5 GB y encaja en GPUs de 24 GB, mientras que IQ3_M (12,6 GB) o IQ2_M (10,0 GB) abren la puerta a equipos de 16 GB o 12 GB respectivamente. La colección está pensada para desarrolladores que quieren desplegar el modelo en local con llama.cpp, Ollama o LM Studio sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, familia Qwen3.5 (`qwen3_5` según tags) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, Q6_K_L, Q8_0, BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5`, que sitúa a Arete-27B en la familia Qwen3.5 de transformers. Se trata por tanto de un transformer denso de aproximadamente 27B parámetros, sin indicios de mezcla de expertos. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el post-entrenamiento de Nous Research.

Lo que sí documenta esta ficha es el proceso de cuantización: UraionLabs ha generado 22 archivos cuantizados más un BF16, calibrados con una importance matrix específica del modelo (`imatrix-Arete-27B.gguf`). Todas las variantes cuantizadas pasaron tres pruebas de humo deterministas de chat, mientras que el BF16 solo se validó estructuralmente. El repositorio incluye además una colección complementaria de precisión mixta de 2-3 bits (GSQ-RCO) con mejor relación calidad/tamaño que los i-quants convencionales al mismo tamaño.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat original embebida sin modificaciones.
- Modo de razonamiento (thinking mode) activado por defecto con esfuerzo `xhigh`; la plantilla acepta también `medium` y `low`, y permite desactivarlo mediante `enable_thinking: false` o `--reasoning off`.
- Compatibilidad con clientes OpenAI-compatible a través de `llama-server` en el endpoint `/v1`.
- Los archivos de este repositorio son exclusivamente de texto: la visión requiere un proyector multimodal separado (`mmproj-Arete-27B-BF16.gguf`), referenciado pero no incluido en esta colección.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de 24 GB: usar Q5_K_M (19,2 GB) o Q4_K_M (16,5 GB) con `llama-server` deja margen para la caché de contexto y ofrece la mejor relación calidad/tamaño para uso conversacional diario.
- Prototipado en portátil con 16 GB de memoria unificada (Apple Silicon): IQ3_M (12,6 GB) permite ejecutar el modelo completo en CPU/GPU integrada, adecuado para pruebas de prompts y validación de flujos antes de escalar a hardware mayor.
- Servicio interno de chat con API compatible con OpenAI: `llama-server` expone `/v1`, de modo que aplicaciones existentes que apuntan a la API de OpenAI pueden redirigirse al endpoint local cambiando únicamente la URL base.
- Evaluación comparativa de cuantizaciones: al incluir 23 archivos con BPW documentado (de 2,51 a 16,00), el repositorio sirve para medir la degradación de calidad por bit en tareas concretas antes de fijar una cuantización en producción.
- Integración en LM Studio u Ollama para equipos de investigación: `ollama run hf.co/UraionLabs/Arete-27B-GGUF:Q4_K_M` permite levantar el modelo con un solo comando, útil para pruebas de razonamiento con thinking mode en entornos sin experiencia previa en llama.cpp.
- Ejecución en entornos con restricciones de memoria muy estrictas: IQ2_M (10,0 GB) es la opción recomendada por el autor dentro de los 2 bits, aceptable cuando el objetivo es validar comportamiento y no calidad final.
- Base para fine-tuning o experimentación sobre el modelo original: el BF16 (53,8 GB) reproduce la precisión original y sirve como referencia para comparar contra las cuantizaciones o para conversiones posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ2_M 10,0 GB; IQ3_M 12,6 GB; IQ4_XS 15,1 GB; Q4_K_M 16,5 GB; Q5_K_M 19,2 GB; Q6_K 22,1 GB; Q8_0 28,6 GB; BF16 53,8 GB. Hay que añadir espacio para la caché KV según la longitud de contexto.
- Guía del autor por memoria disponible: 12 GB → IQ2_M; 16 GB → IQ3_M; 24 GB → Q5_K_M; 32 GB → Q8_0; 64 GB o más → BF16.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada. Por tamaño, Q4_K_M y Q5_K_M encajan en GPUs de 24 GB (RTX 4090, A10G, L4 de 24 GB); Q8_0 requiere 32 GB o más (A100 40 GB, RTX 5090 de 32 GB); BF16 exige 64 GB o más (A100 80 GB, H100).
- Cabe en GPU de consumo: sí, desde IQ2_M en GPUs de 12 GB hasta Q5_K_M en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio. Requiere una versión reciente de llama.cpp con soporte Qwen3.5 (`qwen35`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-GGUF (esta ficha) | ~27B | no disponible | Apache-2.0 | GGUF (23 archivos) | Cuantizaciones con imatrix, thinking mode, solo inglés |
| NousResearch/Arete-27B | ~27B | no disponible | Apache-2.0 | safetensors | Modelo base original; precisión completa |
| UraionLabs/Arete-27B-GSQ-RCO-GGUF | ~27B | no disponible | Apache-2.0 | GGUF mixto 2-3 bits | Variante de precisión mixta del mismo autor, mejor calidad a igual tamaño según la model card |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano no está garantizado ni documentado.
- Los archivos de 2 bits (IQ2_XXS, IQ2_XS, IQ2_S) conllevan pérdida de calidad reconocida por el propio autor; IQ2_M es el único recomendado dentro de esa franja.
- Este repositorio es texto únicamente; la visión requiere descargar aparte el proyector `mmproj-Arete-27B-BF16.gguf`.
- Requiere llama.cpp reciente con soporte Qwen3.5; versiones antiguas no cargarán el modelo.
- El BF16 solo se validó estructuralmente, no con pruebas de chat.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; deben asumirse los habituales de un modelo de lenguaje de este tamaño.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B, ya que esta conversión no es un release oficial de Nous Research.
- Al ser una conversión independiente de terceros, no hay garantía de soporte oficial por parte de Nous Research.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UraionLabs/Arete-27B-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante de precisión mixta GSQ-RCO: https://huggingface.co/UraionLabs/Arete-27B-GSQ-RCO-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Importance matrix: https://huggingface.co/UraionLabs/Arete-27B-GGUF/blob/main/imatrix-Arete-27B.gguf
- Proyector de visión: https://huggingface.co/UraionLabs/Arete-27B-GGUF (referencia `mmproj-Arete-27B-BF16.gguf` en la model card; enlace completo no disponible)
