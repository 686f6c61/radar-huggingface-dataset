# Xylolabs/Qwen3-8B-Base-GGUF

## Resumen

Xylolabs/Qwen3-8B-Base-GGUF es una cuantización en formato GGUF del modelo base Qwen3-8B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Este repositorio, publicado por Xylolabs, distribuye los pesos convertidos y cuantizados en un único fichero Q4_K_M de 5,028 GB, pensado para su ejecución con llama.cpp. El modelo subyacente es un transformer denso de 8.190.735.360 parámetros (aproximadamente 8,2 mil millones), entrenado desde cero como modelo base, sin ajuste por instrucciones ni preferencias.

La relevancia de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo de la familia Qwen3 en hardware de consumo y en entornos locales, con una cuantización que el autor documenta mediante métricas de divergencia KL frente a BF16. Al tratarse de un modelo base, su uso previsto es la continuación de texto y el ajuste fino posterior (SFT, LoRA), no el diálogo directo ni el seguimiento de instrucciones.

La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines propios, siempre que se respeten las obligaciones de atribución. La información disponible sobre el modelo base es limitada en esta ficha: no se detallan aquí la longitud de contexto nativa, la composición del dataset de entrenamiento ni resultados de benchmarks del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B-Base); pesos convertidos a GGUF |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la tabla de hardware del autor recomienda 32K para el fichero Q4_K_M) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado en este repo) |
| Idiomas soportados | en, ko (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del fichero | 5,028 GB (Q4_K_M) |
| Tamano del repo | 5,0 GB |
| Modelo base | Qwen/Qwen3-8B-Base |
| Libreria | gguf / llama.cpp |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-15 |
| Ultima actualizacion | 2026-11-24 |
| Descargas | 380 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3-8B-Base, es un transformer denso de aproximadamente 8,2 mil millones de parámetros publicado por el equipo Qwen (Alibaba) y descrito en el Qwen3 Technical Report (arXiv:2505.09388). Esta ficha no dispone de los detalles concretos de composición del dataset, número de tokens de entrenamiento ni si hubo fases de RLHF o DPO en el modelo base; esos datos deben consultarse en el informe técnico original y en la model card de Qwen/Qwen3-8B-Base, que no se incluyen en la información proporcionada.

La contribución específica de este repositorio es la conversión a GGUF y la cuantización a Q4_K_M para su uso con llama.cpp. El autor documenta la fidelidad de la cuantización mediante divergencia KL media respecto a BF16 y acuerdo top-1, medidos con llama.cpp. Para Q4_K_M se reporta una KL de 0,043104 en WikiText-2 (top-1 del 89,250 %) y una KL de 0,026242 en un conjunto held-out (top-1 del 91,941 %). El autor indica que la conversión se verificó con el commit cd959bae de llama.cpp. No se documentan innovaciones arquitectónicas adicionales propias de esta conversión más allá de la cuantización.

## Capacidades

- Generación de texto libre: al ser un modelo base, su función principal es la continuación de texto a partir de un prefijo, sin formato de instrucciones ni plantilla de chat.
- Punto de partida para ajuste fino: puede servir como base para SFT, LoRA o DPO orientados a tareas concretas.
- Capacidades multilingües: los metadatos declaran inglés (en) y coreano (ko); no se detalla cobertura adicional.
- Ejecución local: compatible con llama.cpp y, por extensión, con herramientas que consumen GGUF (Ollama, servidores compatibles con llama.cpp).
- Tool calling / function calling: no disponible de forma nativa en un modelo base; requeriría ajuste fino específico.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el modelo base no está alineado para seguir instrucciones ni para razonamiento estructurado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en esta variante.

## Casos de uso

- Ajuste fino supervisado (SFT) para un dominio concreto: se parte del Q4_K_M para experimentación rápida en local y del modelo base en BF16 para el entrenamiento final, usando el GGUF para validar el comportamiento antes de invertir en GPU de entrenamiento.
- Generación de texto y autocompletado en local: el modelo puede continuar un prefijo de texto guardado en `prompt.txt` mediante `llama-completion -f prompt.txt -no-cnv`, útil para tareas de redacción asistida o generación de borradores sin conexión.
- Investigación en cuantización: el repositorio publica métricas de KL y top-1 frente a BF16 para varias cuantizaciones, lo que permite estudiar el impacto de la compresión en la calidad del modelo con datos reproducibles.
- Prototipado de pipelines de NLP en estaciones de trabajo con una sola GPU: con 5,0 GB de pesos y 32K de contexto recomendado, cabe en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, lo que facilita pruebas de extremo a extremo antes de escalar.
- Generación de datos sintéticos para entrenamiento: un modelo base puede producir corpus de texto en inglés y coreano para aumentar datasets de ajuste fino, con revisión humana posterior por el riesgo de alucinación.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en local con llama.cpp, permite procesar texto sensible sin enviarlo a servicios externos, siempre que se cumpla la licencia Apache 2.0.
- Evaluación comparativa de cuantizaciones: el autor incluye tablas de Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M, lo que permite elegir el equilibrio entre tamaño y fidelidad para un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente a BF16, medidas con llama.cpp, que se recogen a continuación.

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 WikiText-2 | Held-out KL | Top-1 held-out |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,710 GB | 0,003454 | 96,485 % | 0,001139 | 98,294 % |
| llama.cpp Q6_K | 6,726 GB | 0,012212 | 93,142 % | 0,004367 | 96,529 % |
| llama.cpp Q5_K_M | 5,851 GB | 0,018080 | 92,098 % | 0,008769 | 95,176 % |
| Q4_K_M (este repo) | 5,028 GB | 0,043104 | 89,250 % | 0,026242 | 91,941 % |
| llama.cpp Q4_K_M | 5,028 GB | 0,043104 | 89,250 % | 0,026242 | 91,941 % |
| llama.cpp Q3_K_M | 4,124 GB | 0,157874 | 80,181 % | 0,101343 | 85,196 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 5,028 GB; a ello hay que sumar la caché KV en f16 para el contexto elegido y unos 2 GB para el runtime. El autor recomienda que el total quede por debajo del 90 % de la memoria disponible.
- GPU recomendadas por el autor: RTX 4090 y RTX 3090 (24 GB) con 32K de contexto; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); DGX Spark (128 GB unificada); Mac Studio M5 Max (128 GB unificada); H200 (141 GB); B200 (192 GB); Mac Studio M5 Ultra (256 GB y 512 GB unificadas); B300 (288 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 4090, RTX 3090, RTX 5090) para el fichero Q4_K_M con contexto de 32K, según la tabla del autor.
- Opciones de despliegue: llama.cpp (versión cd959bae o posterior, según el autor), y por compatibilidad de formato, herramientas que consumen GGUF como Ollama o servidores basados en llama.cpp. No se documentan vLLM ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de benchmarks del modelo base ni de alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de contexto y rendimiento de los modelos comparables no están disponibles en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Base-GGUF (este) | 8,19 B | no disponible (recomendado 32K en Q4_K_M) | Apache 2.0 | GGUF Q4_K_M | Cuantización de Qwen3-8B-Base |
| Qwen/Qwen3-8B-Base | 8,19 B | no disponible | Apache 2.0 | safetensors (original) | Modelo base sin cuantizar |
| Qwen/Qwen3-8B | 8,19 B | no disponible | Apache 2.0 | safetensors y GGUF oficiales | Variante ajustada para instrucciones y chat |
| Llama 3.1 8B | 8,03 B | no disponible | Llama 3.1 Community License | safetensors y GGUF | Alternativa de tamaño similar; licencia con restricciones |

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no sigue instrucciones ni mantiene formato de chat de forma fiable; no debe usarse directamente como asistente conversacional sin ajuste previo.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido plausible pero falso; en un modelo base este riesgo es especialmente alto en tareas factuales sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; los sesgos del corpus de entrenamiento original pueden persistir en la cuantización.
- Cobertura de idiomas limitada según metadatos: solo se declaran inglés y coreano; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto nativa del modelo base no se detalla en esta ficha; la recomendación de 32K del autor corresponde a la configuración de hardware, no necesariamente al máximo del modelo.
- Pérdida por cuantización: Q4_K_M presenta una KL de 0,043104 en WikiText-2 y un top-1 del 89,250 %, inferior a Q5_K_M, Q6_K y Q8_0; para tareas sensibles a la fidelidad conviene valorar cuantizaciones mayores.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar avisos de copyright y licencia; el autor incluye un fichero NOTICE con la atribución al modelo original.
- Afiliación: Xylolabs declara no estar afiliado ni respaldado por los autores del modelo original.
- Verificación de compatibilidad: el autor indica que la conversión se comprobó con el commit cd959bae de llama.cpp; versiones anteriores pueden no cargar el fichero correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Informe técnico Qwen3: https://arxiv.org/abs/2505.09388
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen3-8B-Base-GGUF/blob/main/LICENSE
