# Xylolabs/Qwen3-4B-GGUF

## Resumen

Xylolabs/Qwen3-4B-GGUF es una redistribución cuantizada en formato GGUF del modelo Qwen/Qwen3-4B, desarrollado por el equipo Qwen de Alibaba y convertido a GGUF por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de 4.022.468.096 parámetros (aproximadamente 4B) orientado a generación de texto y conversación, con licencia Apache 2.0.

El repositorio no introduce un modelo nuevo: su valor está en las cuantizaciones optimizadas que ofrece, con métricas de degradación medidas frente a BF16 sobre 16.240 posiciones de texto en inglés y coreano. Incluye tres variantes: Q5_K_M (2,89 GB), IQ4_XS (2,29 GB) e IQ4_XS-imat (2,27 GB), esta última generada con importance matrix para reducir la pérdida de calidad respecto a IQ4_XS estándar.

Es relevante para desarrolladores que necesitan desplegar Qwen3-4B en hardware modesto (GPU de consumo o incluso CPU) manteniendo un equilibrio medible entre tamaño y fidelidad respecto al modelo original. La model card documenta explícitamente los valores de KL y coincidencia top-1, lo que permite elegir la cuantización con criterio cuantitativo en lugar de por intuición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q5_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer denso de aproximadamente 4B parámetros desarrollado por el equipo Qwen. La model card de esta redistribución no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; esa información corresponde a la model card original de Qwen/Qwen3-4B y al informe técnico de Qwen3, a los que la card remite para la citación.

La contribución técnica de este repositorio es el proceso de cuantización. Cada archivo GGUF contiene el modelo de lenguaje completo junto con el tokenizer y la plantilla de chat originales. Las variantes `-imat` se generan con importance matrix, y la card reporta métricas de fidelidad frente a una pasada BF16 de referencia en transformers: Q5_K_M alcanza un KL medio de 0,0193 y un 94,09% de coincidencia top-1; IQ4_XS obtiene 0,0726 de KL y 88,74% de top-1; IQ4_XS-imat mejora a 0,0569 de KL y 90,04% de top-1. Estas métricas se calculan sobre 16.240 posiciones de texto en inglés y coreano.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Conversión a GGUF compatible con llama.cpp, lo que habilita inferencia en CUDA, Metal y CPU.
- Conservación del tokenizer y la plantilla de chat originales de Qwen3-4B, incluido el soporte de `--jinja` en llama.cpp.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del repositorio.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, modo thinking) no están documentadas en esta model card; deben consultarse en la card de Qwen/Qwen3-4B.

## Casos de uso

- Despliegue en GPU de consumo: la cuantización IQ4_XS-imat (2,27 GB) permite ejecutar el modelo en tarjetas con 4-6 GB de VRAM mediante llama.cpp con `-ngl 99`, adecuado para prototipos locales y pruebas de integración.
- Inferencia en CPU sin GPU: las tres cuantizaciones caben en memoria RAM de un portátil convencional; llama.cpp compilado sin `GGML_CUDA` permite servir el modelo en entornos sin acelerador.
- Servicio local con `llama-server`: la card documenta el uso de `llama-server` con los mismos flags que `llama-cli`, lo que facilita exponer una API compatible con endpoints para aplicaciones internas.
- Evaluación de cuantizaciones: los valores de KL y coincidencia top-1 permiten comparar el impacto de cada variante en pipelines de investigación que necesiten justificar la elección de cuantización con datos.
- Aplicaciones en inglés y coreano: el modelo está validado en ambos idiomas según las métricas de la card, lo que lo hace apto para asistentes o generación de contenido en esas lenguas.
- Integración en flujos de CI/CD para pruebas de modelos: el tamaño reducido de los GGUF permite descargarlos y ejecutarlos en runners con recursos limitados para tests de regresión de prompts.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí publica métricas de fidelidad de cuantización frente a BF16:

| Cuantizacion | Tamano | KL medio vs BF16 | Coincidencia top-1 vs BF16 |
|---|---|---|---|
| Q5_K_M | 2,89 GB | 0,0193 | 94,09% |
| IQ4_XS | 2,29 GB | 0,0726 | 88,74% |
| IQ4_XS-imat | 2,27 GB | 0,0569 | 90,04% |

Las métricas cubren 16.240 posiciones de texto en inglés y coreano. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3-2,9 GB solo para los pesos según cuantización; hay que sumar el espacio de contexto KV, que depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-6 GB de VRAM para IQ4_XS-imat con contexto moderado; A100 y H100 son sobredimensionadas para este tamaño pero válidas para serving de alta concurrencia.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4070 y superiores; también en GPUs Apple Silicon vía Metal.
- CPU: viable en CPU con llama.cpp compilado sin CUDA; el rendimiento dependerá del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior, con `--jinja` para la plantilla de chat. Otros runners compatibles con GGUF no están documentados en la card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-GGUF (este) | 4,02B | no disponible | GGUF | Apache 2.0 | Cuantizaciones con métricas KL publicadas |
| Qwen/Qwen3-4B | 4,02B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base original, referencia BF16 |
| Otras cuantizaciones GGUF de Qwen3-4B | 4,02B | no disponible | GGUF | Apache 2.0 | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre alternativas de otros autores con métricas comparables en la documentación consultada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: incluso Q5_K_M pierde un 5,91% de coincidencia top-1 respecto a BF16, e IQ4_XS estándar cae al 88,74%.
- El repositorio solo declara soporte para inglés y coreano; el rendimiento en castellano no está validado por el autor.
- La model card no documenta sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base; deben consultarse en la card de Qwen/Qwen3-4B.
- La longitud de contexto efectiva no se especifica en esta card; el ejemplo usa `-c 8192`, pero no debe asumirse como máximo del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el archivo `NOTICE` debe conservarse y Xylolabs declara no estar afiliado a los autores del modelo original.
- Requiere una versión concreta o posterior de llama.cpp (`cd959bae99ff4bed22bef2604f45241c09bbb8c8`); versiones anteriores pueden no cargar correctamente los GGUF.
- La fecha de creación del repositorio (2026-11-14) y su reducido número de descargas (1.184) y likes (0) sugieren poca validación comunitaria; conviene verificar la integridad de los archivos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-GGUF/blob/main/LICENSE
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la card: https://github.com/XylolabsInc/tensix-bfp-gptq
