# Xylolabs/Qwen2.5-14B-Instruct-GGUF

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen2.5-14B-Instruct, publicada por Xylolabs. El modelo base fue desarrollado por el equipo Qwen (Alibaba Cloud) y es un transformer decoder-only denso de 14.770.033.664 parámetros (aproximadamente 14,8 mil millones), entrenado para instrucciones y conversación. Esta publicación concreta no entrena ningún modelo nuevo: convierte los pesos originales a GGUF y los cuantiza a Q4_K_M para su uso con llama.cpp.

El interés de esta ficha reside en que ofrece un artefacto listo para inferencia local con un tamaño de 8,988 GB, lo que permite ejecutar un modelo de 14B en GPUs de consumo como la RTX 4090 o la RTX 3090 (24 GB) con una ventana de contexto de 32K tokens. La model card incluye una tabla de precisión frente a BF16 (divergencia KL y acuerdo top-1) que permite evaluar la pérdida introducida por la cuantización, así como una tabla de recomendación de hardware.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita el uso comercial. El repo declara únicamente los idiomas en y ko, aunque el modelo Qwen2.5 original soporta muchos más idiomas; esa restricción refleja lo declarado por el publicador, no las capacidades reales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (según tabla de hardware de la model card) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado: 8,988 GB) |
| Idiomas soportados | en, ko (según metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only denso con 14.770.033.664 parámetros. Esta publicación no aporta información sobre la composición del dataset de entrenamiento, el número de tokens, ni sobre las etapas de alineación (RLHF/DPO) del modelo original; esos detalles corresponden a la model card de Qwen/Qwen2.5-14B-Instruct y no se incluyen en la información proporcionada.

La contribución técnica de esta publicación es la conversión a GGUF y la cuantización a Q4_K_M, verificada con la build de llama.cpp `cd959bae99ff4bed22bef2604f45241c09bbb8c8`. La model card reporta métricas de fidelidad frente a BF16 medidas con llama.cpp: para Q4_K_M, divergencia KL de 0,057313 en WikiText-2 con un acuerdo top-1 del 91,118 %, y KL de 0,021913 en un conjunto held-out con top-1 del 93,549 %. La tabla incluye también Q8_0, Q6_K, Q5_K_M y Q3_K_M de llama.cpp como referencia comparativa, lo que permite situar la pérdida de calidad de Q4_K_M en la curva tamaño-precisión.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Qwen2.5-14B-Instruct.
- Razonamiento y matemáticas: capacidades propias del modelo base; no se aportan datos específicos en esta publicación.
- Generación de código: capacidad del modelo base; no se documenta en esta model card.
- Tool calling / function calling: no documentado en esta publicación (el modelo base Qwen2.5-Instruct sí lo soporta, pero esta ficha no puede confirmarlo a partir de la información disponible).
- Soporte de agentes y razonamiento multi-paso: no documentado en esta publicación.
- Capacidades multilingües: los metadatos declaran en y ko; el modelo base soporta más idiomas, pero no se detalla aquí.
- Modo thinking, visión o audio: no disponible en esta publicación.
- Ejecución local con llama.cpp mediante `llama-cli -m Qwen2.5-14B-Instruct-Q4_K_M.gguf --jinja`.

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 8,988 GB de pesos en Q4_K_M y 32K de contexto, se puede desplegar en una RTX 4090 o RTX 3090 (24 GB) dejando margen para la caché KV en f16 y el runtime, según la propia tabla del autor.
- Prototipado de aplicaciones de texto en portátiles con GPU de consumo: el archivo Q4_K_M permite iterar sobre prompts y flujos conversacionales sin depender de APIs externas, usando llama.cpp.
- Procesamiento de documentos largos en local: la ventana de 32K tokens permite resumir o extraer información de contratos, informes o transcripciones de longitud media en un único pase.
- Despliegue en servidores con una sola GPU profesional: la tabla del autor indica que cabe en una H100 (80 GB), H200 (141 GB), B200 o B300 con contexto de 32K, lo que facilita servir el modelo en infraestructura de datacenter existente.
- Evaluación comparativa de cuantizaciones: la tabla de KL y top-1 frente a BF16 permite decidir entre Q4_K_M, Q5_K_M, Q6_K u Q8_0 según el presupuesto de memoria y la tolerancia a la pérdida de precisión.
- Generación de texto en coreano e inglés: los idiomas declarados en el repo (en, ko) cubren casos de atención al cliente o generación de contenido en esos dos idiomas.
- Integración en pipelines de CI/CD o herramientas de desarrollo: al ser un GGUF ejecutable con llama.cpp, se puede invocar desde scripts y servicios sin dependencias de frameworks de serving propietarios.

## Benchmarks y rendimiento

La model card no publica benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para esta cuantización. Sí publica métricas de fidelidad frente a BF16 medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 15,702 GB | 0,001612 | 98,343 % | 0,000891 | 98,588 % |
| llama.cpp Q6_K | 12,125 GB | 0,007014 | 96,284 % | 0,003269 | 97,402 % |
| llama.cpp Q5_K_M | 10,509 GB | 0,017084 | 94,686 % | 0,007034 | 96,206 % |
| Q4_K_M (esta publicacion) | 8,988 GB | 0,057313 | 91,118 % | 0,021913 | 93,549 % |
| llama.cpp Q4_K_M | 8,988 GB | 0,057313 | 91,118 % | 0,021913 | 93,549 % |
| llama.cpp Q3_K_M | 7,339 GB | 0,172863 | 84,157 % | 0,077580 | 88,343 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,988 GB de pesos en Q4_K_M; hay que sumar la caché KV en f16 a la longitud de contexto elegida y unos 2 GB para el runtime, según el criterio del autor (el archivo debe caber con todo ello por debajo del 90 % de la memoria).
- GPU recomendadas según la tabla del autor, todas con contexto de 32K y el archivo Q4_K_M:
  - RTX 4090 / RTX 3090 (24 GB): cabe.
  - RTX 5090 (32 GB): cabe.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): cabe.
  - H100 (80 GB): cabe.
  - RTX PRO 6000 Blackwell GDDR7 (96 GB): cabe.
  - DGX Spark (128 GB unificada): cabe.
  - Mac Studio M5 Max (128 GB unificada): cabe.
  - H200 HBM3e (141 GB): cabe.
  - B200 (192 GB): cabe.
  - Mac Studio M5 Ultra (256 GB y 512 GB unificada): cabe.
  - B300 HBM3e (288 GB): cabe.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 (24 GB) con contexto de 32K, y en RTX 5090 (32 GB).
- Opciones de despliegue: llama.cpp (build `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), invocado con `llama-cli -m Qwen2.5-14B-Instruct-Q4_K_M.gguf --jinja`. El repo incluye el tag `endpoints_compatible`. No se documentan otras opciones (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Instruct-GGUF (esta publicacion) | 14,77 B | 32K | GGUF Q4_K_M (8,988 GB) | Apache 2.0 | Hugging Face, 405 descargas |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | 14,77 B | no disponible en esta informacion | safetensors (BF16) | Apache 2.0 | Hugging Face |
| llama.cpp Q4_K_M de Qwen2.5-14B-Instruct (referencia en la model card) | 14,77 B | no disponible en esta informacion | GGUF Q4_K_M (8,988 GB) | Apache 2.0 | llama.cpp |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a alternativas de otros fabricantes; la comparación disponible se limita a la fidelidad frente a BF16 entre cuantizaciones del mismo modelo.

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce pérdida de precisión medible: 91,118 % de acuerdo top-1 en WikiText-2 y 93,549 % en held-out frente a BF16, con KL de 0,057313 y 0,021913 respectivamente.
- Solo se publica un archivo (Q4_K_M); no hay variantes Q5, Q6 u Q8 en este repo, por lo que no se puede ajustar el equilibrio precisión/memoria sin acudir a otras fuentes.
- Los metadatos declaran únicamente en y ko; el rendimiento en castellano u otros idiomas no está documentado en esta publicación.
- No se documentan en esta model card capacidades de tool calling, agentes o modo thinking, aunque el modelo base las pueda tener; conviene verificar en la model card de Qwen/Qwen2.5-14B-Instruct antes de usarlas en producción.
- Riesgo de alucinación: inherente al modelo base; no se aportan evaluaciones específicas en esta publicación.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; el archivo `NOTICE` del repo atribuye el modelo fuente y su titular de copyright. Xylolabs declara no estar afiliado ni respaldado por los autores del modelo original.
- Para citar, el autor remite a la release original de Qwen2.5 14B Instruct.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Build de llama.cpp referenciada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia (archivo en el repo): https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-GGUF/blob/main/LICENSE
