# Xylolabs/Qwen3-4B-Base-GGUF

## Resumen

Xylolabs/Qwen3-4B-Base-GGUF es una distribucion en formato GGUF del modelo base Qwen3-4B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Esta publicacion, mantenida por Xylolabs, no introduce un modelo nuevo: convierte y cuantiza los pesos originales en BF16 a formato GGUF para su uso con llama.cpp, ofreciendo unicamente la variante Q4_K_M. El modelo base subyacente es un transformer denso de 4.022.468.096 parametros (aproximadamente 4B), disenado para generacion de texto y como punto de partida para fine-tuning.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 4B en hardware de consumo con un fichero de solo 2,497 GB. El autor publica una tabla de fidelidad frente a BF16 con metricas de divergencia KL y top-1 en WikiText-2 y un conjunto held-out, lo que permite evaluar el coste real de la cuantizacion Q4_K_M antes de desplegarlo. El contexto declarado en la tabla de hardware es de 32K tokens.

Al tratarse de un modelo base (no instruct, sin ajuste por RLHF ni modo thinking), su uso previsto es la continuacion de texto y el fine-tuning, no el dialogo directo ni el seguimiento de instrucciones. La licencia es Apache 2.0, heredada del modelo original, y los idiomas declarados en la model card son ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3, modelo base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (segun tabla de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3-4B-Base-Q4_K_M.gguf, 2,497 GB) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen/Qwen3-4B-Base, es un transformer denso de la familia Qwen3, con 4.022.468.096 parametros totales. La model card de esta distribucion no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO; al ser un modelo base, no se espera un ajuste por preferencias orientado a instrucciones. Para los detalles de arquitectura y entrenamiento del modelo original, el autor remite al Qwen3 Technical Report (arXiv:2505.09388).

La contribucion tecnica de este repositorio es la conversion a GGUF y la cuantizacion Q4_K_M, acompanada de una evaluacion de fidelidad frente a BF16. Segun los datos publicados, Q4_K_M obtiene una divergencia KL de 0,040775 y un top-1 del 90,588% en WikiText-2, y 0,036195 de KL y 90,882% de top-1 en el conjunto held-out. El autor compara estos valores con otras cuantizaciones de llama.cpp: Q8_0 (0,001474 KL, 97,863% top-1), Q6_K (0,005868 KL, 95,662% top-1), Q5_K_M (0,011391 KL, 94,338% top-1) y Q3_K_M (0,146550 KL, 81,848% top-1). La degradacion de Q4_K_M es notablemente mayor que la de Q5_K_M, lo que conviene tener en cuenta si la fidelidad es critica.

## Capacidades

- Generacion y continuacion de texto: es un modelo base, por lo que su funcion principal es completar texto a partir de un prefijo, no seguir instrucciones.
- Punto de partida para fine-tuning: al ser base y Apache 2.0, puede adaptarse a tareas especificas (clasificacion, extraccion, generacion de dominio) mediante ajuste supervisado.
- Capacidades multilingues limitadas: la model card declara ingles y coreano; no se documentan otros idiomas.
- Ejecucion local con llama.cpp: el fichero GGUF esta pensado para `llama-completion` en modo no conversacional (`-no-cnv`).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue mediante infraestructura de inferencia compatible, aunque no se detalla.
- Sin tool calling, sin function calling, sin modo thinking y sin vision: no se documentan estas capacidades y, al ser un modelo base, no cabe esperarlas de serie.

## Casos de uso

- Continuacion de texto y generacion de borradores en local: con un fichero de 2,5 GB, el modelo puede ejecutarse en una GPU de consumo y completar prefijos largos gracias a la ventana de 32K tokens, util para prototipado sin conexion.
- Fine-tuning de tareas de dominio: al ser un modelo base de 4B con licencia Apache 2.0, sirve como inicializacion para ajuste supervisado en tareas como clasificacion de documentos o extraccion de entidades, con un coste de entrenamiento moderado.
- Generacion de datos sinteticos: puede producir texto de relleno o corpus sinteticos para aumentar datasets de entrenamiento, siempre con revision posterior por la tasa de alucinacion propia de un modelo base.
- Experimentacion academica y reproducibilidad: el repositorio incluye tablas de divergencia KL y top-1 que permiten estudiar el impacto de la cuantizacion Q4_K_M frente a BF16 en un modelo de 4B.
- Despliegue en hardware modesto: la tabla del autor indica que el fichero cabe holgadamente en GPUs de 24 GB (RTX 4090, RTX 3090) y en equipos con memoria unificada (Mac Studio, DGX Spark), lo que facilita entornos de laboratorio.
- Base para pipelines de autocompletado en editores o herramientas internas: la baja huella de memoria y la compatibilidad con llama.cpp permiten integrarlo en flujos de continuacion de codigo o texto donde no se requiera un modelo instruct.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). La unica evaluacion disponible es la fidelidad de la cuantizacion frente a BF16, medida con divergencia KL y top-1 en WikiText-2 y en un conjunto held-out:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 4,280 GB | 0,001474 | 97,863% | 0,001120 | 97,941% |
| llama.cpp Q6_K | 3,306 GB | 0,005868 | 95,662% | 0,004784 | 96,206% |
| llama.cpp Q5_K_M | 2,890 GB | 0,011391 | 94,338% | 0,011788 | 94,451% |
| Q4_K_M (este repo) | 2,497 GB | 0,040775 | 90,588% | 0,036195 | 90,882% |
| llama.cpp Q3_K_M | 2,076 GB | 0,146550 | 81,848% | 0,144953 | 82,245% |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2,497 GB; con overhead de contexto y runtime, cabe en GPUs de 8 GB o superiores, aunque el autor solo documenta configuraciones desde 24 GB.
- GPU recomendadas segun el autor: RTX 4090 y RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090 con contexto de 32K segun la tabla del autor; por tamano de fichero, tambien cabria en GPUs con menos memoria, aunque no se documenta.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build enlazado en la model card, commit cd959bae99ff4bed22bef2604f45241c09bbb8c8 o posterior); el autor no menciona vLLM, Ollama ni TGI para este fichero.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Base-GGUF (este) | 4,02B | 32K | GGUF Q4_K_M | Apache 2.0 | Solo Q4_K_M; modelo base |
| Qwen/Qwen3-4B-Base | 4,02B | no disponible en esta ficha | safetensors (BF16) | Apache 2.0 | Modelo original sin cuantizar |
| Cuantizaciones llama.cpp de Qwen3-4B-Base (Q5_K_M, Q6_K, Q8_0) | 4,02B | 32K | GGUF | Apache 2.0 | Mayor fidelidad, mayor tamano (2,890-4,280 GB) |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a otras familias de modelos de tamano similar.

## Limitaciones y advertencias

- Modelo base, no instruct: no sigue instrucciones ni mantiene dialogos de forma fiable; requiere prompting de continuacion o fine-tuning previo.
- Fidelidad de la cuantizacion: Q4_K_M pierde aproximadamente 7 puntos de top-1 frente a Q8_0 (90,588% frente a 97,863% en WikiText-2) y su KL es unas 27 veces mayor que la de Q6_K; para tareas sensibles conviene valorar Q5_K_M o superior.
- Riesgo de alucinacion: como todo modelo base, puede generar contenido plausible pero incorrecto, especialmente en continuaciones largas.
- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado ni validado.
- Sesgos: no se documentan evaluaciones de sesgo en la model card; se heredan los sesgos del corpus de entrenamiento de Qwen3-4B-Base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo original y citar el Qwen3 Technical Report segun indica el autor.
- Un solo fichero: el repositorio solo publica Q4_K_M; no hay variantes Q5, Q6 ni Q8 en esta distribucion.
- Fecha de publicacion: el repositorio figura creado el 2026-11-15 y actualizado el 2026-11-27; verificar la vigencia de los enlaces y del build de llama.cpp referenciado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Qwen3 Technical Report (arXiv): https://arxiv.org/abs/2505.09388
- Build de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-Base-GGUF/blob/main/LICENSE
