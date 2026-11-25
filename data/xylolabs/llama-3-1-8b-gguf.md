# Xylolabs/Llama-3.1-8B-GGUF

## Resumen

Xylolabs/Llama-3.1-8B-GGUF es una conversión a formato GGUF y cuantización del modelo base meta-llama/Llama-3.1-8B, publicada por Xylolabs. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint de Meta empaquetado para su ejecución con llama.cpp. El repositorio distribuye un único fichero, `Llama-3.1-8B-Q4_K_M.gguf`, de 4,921 GB, lo que lo sitúa en el rango de consumo para GPU de gama alta de consumo y estaciones de trabajo.

El modelo subyacente es un transformer denso de 8.030.261.312 parámetros (8B) desarrollado por Meta, con una ventana de contexto de 128K tokens en la versión 3.1. La relevancia de esta publicación concreta es práctica: ofrece una cuantización Q4_K_M verificada contra BF16 con métricas de divergencia KL y top-1, además de una tabla de recomendación de hardware que mapea fichero y contexto a distintas GPU y sistemas unificados.

La licencia es la Llama 3.1 Community License, heredada del modelo original, con su correspondiente Acceptable Use Policy. El repositorio declara soporte para inglés y coreano en sus metadatos, aunque las capacidades multilingües reales provienen del modelo base de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de meta-llama/Llama-3.1-8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (soportado por el modelo base; la tabla de hardware del autor indica 64K en 24 GB y 128K desde 32 GB) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el autor incluye metricas comparativas para Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M de llama.cpp |
| Idiomas soportados | en, ko (segun metadatos del repositorio) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint meta-llama/Llama-3.1-8B, un transformer denso de 8B parámetros. Esta publicación no aporta información sobre la composición del dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos corresponden a la model card de Meta, no a este repositorio. La relación declarada con el modelo base es `quantized`.

La contribución técnica del repositorio es la conversión a GGUF y la cuantización Q4_K_M, acompañada de una evaluación de precisión frente a BF16 medida con llama.cpp. La tabla publicada reporta, para Q4_K_M (4,921 GB), una divergencia KL de 0,029846 y un top-1 del 92,162% sobre WikiText-2, y una KL de 0,026917 con top-1 del 91,716% en el conjunto held-out. Para comparar, Q8_0 (8,541 GB) alcanza KL 0,000841 y top-1 98,750% en WikiText-2, y Q3_K_M (4,019 GB) cae a KL 0,098527 y top-1 86,377%. El autor indica que la conversión se validó con un build concreto de llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`).

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`), orientada a continuación de prefijo según el ejemplo de la model card (`llama-completion` con `-no-cnv`).
- Modelo base, no instruct: no incluye formato de chat ni plantilla de instrucciones propia; el uso conversacional requiere aplicar la plantilla del modelo base o un fine-tuning posterior.
- Razonamiento, código y matemáticas: capacidades heredadas del checkpoint Llama-3.1-8B de Meta; el repositorio no documenta evaluaciones propias de estas tareas.
- Soporte multilingüe declarado para inglés y coreano en los metadatos del repositorio.
- Tool calling / function calling: no documentado en este repositorio; depende de las capacidades del modelo base y de la plantilla aplicada.
- Agentes y razonamiento multi-paso: no documentado en este repositorio.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con 4,9 GB de pesos, el fichero Q4_K_M cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto de hasta 64K según la tabla del autor, lo que permite desplegar generación de texto en estaciones de trabajo sin servidores dedicados.
- Continuación de texto y generación de documentación: al ser un modelo base, encaja en tareas de autocompletado de prosa técnica, generación de borradores y expansión de prefijos mediante `llama-completion`.
- Prototipado rápido con llama.cpp: el formato GGUF y el ejemplo de ejecución incluido permiten validar pipelines de generación en minutos, sin dependencias de frameworks de serving más pesados.
- Despliegue en hardware unificado: la tabla del autor cubre Mac Studio (M5 Max/Ultra) y DGX Spark con 128 GB o más, lo que habilita contexto completo de 128K en equipos de escritorio de gama alta.
- Servicio de inferencia en una sola H100/H200/B200: con 80-192 GB de memoria, el modelo puede servirse a contexto máximo de 128K, útil para procesamiento de documentos largos en lote.
- Base para fine-tuning posterior: al ser un checkpoint base cuantizado, sirve como referencia de calidad para comparar adaptaciones (LoRA/QLoRA) antes de convertirlas a GGUF.
- Evaluación de impacto de cuantización: las métricas KL y top-1 publicadas permiten decidir entre Q3_K_M, Q4_K_M, Q5_K_M, Q6_K y Q8_0 según el presupuesto de memoria y la tolerancia a degradación.

## Benchmarks y rendimiento

El repositorio no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Lo que sí publica es una evaluación de fidelidad de la cuantización frente a BF16, medida con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,541 GB | 0,000841 | 98,750% | 0,000789 | 98,265% |
| llama.cpp Q6_K | 6,596 GB | 0,004468 | 96,696% | 0,004305 | 96,216% |
| llama.cpp Q5_K_M | 5,733 GB | 0,009516 | 95,358% | 0,008728 | 95,010% |
| Q4_K_M (fichero publicado) | 4,921 GB | 0,029846 | 92,162% | 0,026917 | 91,716% |
| llama.cpp Q4_K_M | 4,921 GB | 0,029846 | 92,162% | 0,026917 | 91,716% |
| llama.cpp Q3_K_M | 4,019 GB | 0,098527 | 86,377% | 0,093630 | 84,667% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,921 GB de pesos en Q4_K_M, más la caché KV en f16 al contexto elegido y unos 2 GB de runtime (criterio del autor: el fichero debe ocupar menos del 90% de la memoria disponible).
- GPU recomendadas según la tabla del autor:
  - RTX 4090 / RTX 3090 (24 GB): Q4_K_M con contexto de 64K.
  - RTX 5090 (32 GB): Q4_K_M con contexto de 128K.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): Q4_K_M con 128K.
  - H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB): Q4_K_M con 128K.
  - DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256/512 GB): Q4_K_M con 128K.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 a 64K de contexto y en RTX 5090 a 128K.
- Opciones de despliegue: llama.cpp (build de referencia indicado en la model card). No se documentan otras opciones (vLLM, TGI, Ollama) en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Llama-3.1-8B-GGUF | 8,03B | 128K (modelo base) | GGUF Q4_K_M | llama3.1 | Cuantización de Llama-3.1-8B; métricas KL/top-1 publicadas |
| meta-llama/Llama-3.1-8B | 8,03B | 128K | safetensors (BF16) | llama3.1 | Checkpoint original de Meta; referencia de calidad |
| Otras cuantizaciones GGUF de Llama-3.1-8B | 8,03B | 128K | GGUF (multiples quants) | llama3.1 | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks de tareas para comparar rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un modelo instruct o chat: no incluye plantilla de conversación ni alineación conversacional; usarlo como asistente requiere aplicar la plantilla del modelo base o un fine-tuning.
- La cuantización Q4_K_M introduce degradación medible: top-1 del 92,162% frente a BF16 en WikiText-2 y KL de 0,029846; para tareas sensibles a la fidelidad, valorar Q5_K_M, Q6_K o Q8_0.
- Riesgo de alucinación inherente al modelo base de 8B; no se documentan evaluaciones de factualidad en este repositorio.
- Idiomas declarados limitados a inglés y coreano en los metadatos; el rendimiento en castellano no está documentado.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones, incluida la Acceptable Use Policy (`USE_POLICY.md`) y obligaciones de atribución ("Built with Llama").
- Solo se publica un fichero (Q4_K_M); no hay variantes Q2, Q3, Q5, Q6, Q8 ni versiones para otros runtimes en este repositorio.
- El repositorio tiene un volumen de descargas bajo (377) y 0 likes en el momento de la consulta; conviene verificar la integridad del fichero antes de usarlo en producción.
- No se documentan latencia ni throughput, por lo que el dimensionamiento de un servicio en producción requiere medición propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Build de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF/blob/main/LICENSE
- Repositorio de la organizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
