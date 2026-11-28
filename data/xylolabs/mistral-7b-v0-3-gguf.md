# Xylolabs/Mistral-7B-v0.3-GGUF

## Resumen

Xylolabs/Mistral-7B-v0.3-GGUF es una cuantizacion en formato GGUF del modelo base mistralai/Mistral-7B-v0.3, publicada por Xylolabs para su uso con llama.cpp. El repositorio contiene un unico archivo de pesos, `Mistral-7B-v0.3-Q4_K_M.gguf` (4,373 GB), generado a partir de los pesos originales de Mistral AI. No se trata de un modelo nuevo ni de un ajuste fino, sino de una conversion de formato y compresion del modelo original, que conserva su licencia Apache 2.0.

El modelo subyacente, Mistral 7B v0.3, es un transformer decoder-only denso de 7.248.023.552 parametros (segun los safetensors del modelo base) con una longitud de contexto de 32.768 tokens, segun la tabla de recomendaciones de hardware de la model card. Es un modelo base, es decir, entrenado para continuar texto y no alineado mediante RLHF o DPO, por lo que no sigue instrucciones de forma nativa.

La relevancia de esta publicacion es practica: ofrece una version lista para ejecutar en llama.cpp con un equilibrio razonable entre tamano y fidelidad respecto a BF16. Segun los datos del autor, la cuantizacion Q4_K_M mantiene un top-1 del 94,877 % en WikiText-2 y del 94,078 % en un conjunto held-out, con una divergencia KL de 0,010896 y 0,013479 respectivamente. El repositorio acumula 391 descargas y ningun "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Mistral 7B v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun tabla de hardware de la model card) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en el repo) |
| Idiomas soportados | en, ko (etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de Mistral AI con 7.248.023.552 parametros. La model card de esta cuantizacion no aporta detalles sobre la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a la publicacion original de Mistral 7B v0.3 y no se reproducen aqui. Al ser un modelo base, no incorpora plantilla de instrucciones ni alineamiento conversacional.

La innovacion tecnica de esta publicacion es la conversion a GGUF y la cuantizacion Q4_K_M, compatible con llama.cpp. El autor documenta la fidelidad frente a BF16 mediante divergencia KL y top-1 accuracy sobre WikiText-2 y un conjunto held-out, y proporciona una tabla de recomendaciones de hardware. El unico archivo disponible es Q4_K_M; no se publican variantes Q8_0, Q6_K, Q5_K_M ni Q3_K_M en el repositorio, aunque aparecen como referencia en la tabla de precision.

## Capacidades

- Generacion de texto y continuacion de prompts: el modelo es un modelo base, por lo que su uso previsto es la continuacion de texto a partir de un prefijo, no el dialogo instruido.
- Razonamiento y conocimiento general: hereda las capacidades del Mistral 7B v0.3 original, sin datos de benchmarks especificos en esta publicacion.
- Soporte de tool calling / function calling: no disponible de forma nativa; al ser un modelo base no incluye formatos de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriria prompting especifico o ajuste fino.
- Capacidades multilingues: el repositorio declara en y ko; el modelo base original tiene un perfil multilingue mas amplio, pero esta publicacion solo etiqueta esos dos idiomas.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Continuacion de texto en local: el modelo puede ejecutarse con llama.cpp en equipos de consumo y generar continuaciones a partir de un prefijo guardado en `prompt.txt`, tal como indica la model card con `llama-completion -m ... -f prompt.txt -no-cnv`.
- Prototipado de pipelines de generacion: al ser un GGUF de 4,4 GB, permite iterar rapidamente en portatiles y estaciones de trabajo sin GPU dedicada, usando la CPU o una GPU modesta.
- Generacion aumentada por recuperacion (RAG) con contexto largo: sus 32.768 tokens de contexto permiten incluir varios documentos en el prompt, aunque al ser un modelo base la calidad de seguimiento de instrucciones dependera del formato del prefijo.
- Experimentacion academica con cuantizacion: la tabla de precision (KL y top-1) facilita estudiar el impacto de Q4_K_M frente a BF16 en tareas de modelado de lenguaje.
- Generacion de texto en coreano e ingles: las etiquetas del repositorio declaran ambos idiomas, por lo que puede usarse para tareas de continuacion en esos idiomas.
- Base para ajuste fino posterior: al estar bajo Apache 2.0 y en formato GGUF, puede servir como punto de partida para experimentos de destilacion o evaluacion, aunque el ajuste fino requeriria convertir de nuevo a safetensors.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Solo publica metricas de fidelidad de la cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 7,703 GB | 0,000309 | 99,132 % | 0,000491 | 99,010 % |
| llama.cpp Q6_K | 5,947 GB | 0,001637 | 98,186 % | 0,002647 | 97,412 % |
| llama.cpp Q5_K_M | 5,136 GB | 0,003555 | 97,309 % | 0,004722 | 96,529 % |
| Q4_K_M (publicado) | 4,373 GB | 0,010896 | 94,877 % | 0,013479 | 94,078 % |
| llama.cpp Q3_K_M | 3,523 GB | 0,036458 | 90,975 % | 0,049412 | 89,000 % |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 4,373 GB; con overhead de contexto y KV cache, se recomienda al menos 8 GB de memoria para contexto moderado y 24 GB para aprovechar los 32K tokens.
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificadas) y B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 5090 y tarjetas con 24 GB o mas; el autor lista todas ellas con contexto de 32K.
- Opciones de despliegue: llama.cpp (build enlazado en la model card, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), mediante `llama-completion`. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---:|---|---|---|
| Xylolabs/Mistral-7B-v0.3-GGUF | 7.248.023.552 | 32.768 | GGUF Q4_K_M | Apache 2.0 | Cuantizacion de Mistral 7B v0.3; 4,373 GB |
| mistralai/Mistral-7B-v0.3 (original) | 7.248.023.552 | 32.768 | safetensors | Apache 2.0 | Pesos BF16 originales; mayor tamano y fidelidad |
| Otras cuantizaciones GGUF de Mistral 7B v0.3 | 7.248.023.552 | 32.768 | GGUF | Apache 2.0 | Multiples autores publican variantes Q2 a Q8; no se dispone de datos comparativos en esta informacion |

No se dispone de datos de benchmarks de tareas para comparar rendimiento entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un modelo base entrenado con datos web, es probable que herede sesgos del corpus original, pero no se aportan datos concretos.
- Riesgo de alucinacion: presente, como en cualquier modelo de lenguaje; al no estar alineado, no hay filtros de seguridad ni rechazo de peticiones daninas.
- Limitaciones de contexto o idioma: el contexto declarado es de 32.768 tokens, pero la model card no detalla el comportamiento en los extremos; los idiomas etiquetados son solo en y ko, aunque el modelo base original es mas amplio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor indica que se debe citar la publicacion original de Mistral 7B v0.3.
- Caveats para produccion: es un modelo base sin alineamiento, por lo que no sigue instrucciones de forma fiable; la unica cuantizacion publicada es Q4_K_M, con una perdida de top-1 de aproximadamente 5 puntos frente a BF16 en WikiText-2; no se documentan pruebas de seguridad, toxicidad ni robustez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-GGUF/blob/main/LICENSE
- llama.cpp (build referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
