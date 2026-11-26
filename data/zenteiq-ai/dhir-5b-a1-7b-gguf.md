# zenteiq-ai/Dhir-5B-A1.7B-GGUF

## Resumen

Dhir 5B-A1.7B es un modelo de lenguaje conversacional multilingüe desarrollado por ZenteiQ (familia BrahmAI), diseñado específicamente para inglés y las principales lenguas de la India. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 5.094 millones de parámetros totales, de los cuales solo 1.700 millones se activan por token, lo que le permite mantener un coste computacional de inferencia bajo pese a su tamaño total. Su ventana de contexto es de 16.384 tokens.

Este repositorio concreto contiene la versión cuantizada en formato GGUF para su uso con llama.cpp, con dos builds: Q4_K_M (3,4 GB) y Q8_0 (5,4 GB). El modelo base es `zenteiq-ai/Dhir-5B-A1.7B`, y la cuantización está pensada para despliegue en el borde (edge): portátiles, sobremesas, móviles, chips embebidos y hardware Intel (Core Ultra, Arc, Xeon) con backends Vulkan y OpenVINO.

Su relevancia radica en cubrir el hueco de modelos ligeros con cobertura real de lenguas indias (hindi, bengalí, tamil, telugu, canarés, malabar, maratí, guyaratí, panyabí y oriya) bajo licencia Apache 2.0, algo poco habitual en modelos de este tamaño. El formato GGUF y la arquitectura MoE lo hacen atractivo para despliegues con recursos limitados o sin GPU dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer |
| Parámetros totales | 5.094.471.168 (5,1B) |
| Parámetros activos | 1,7B por token |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | Q4_K_M y Q8_0 (GGUF, generadas con imatrix) |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Dhir 5B-A1.7B emplea una arquitectura Mixture of Experts con 5,1B parámetros totales y 1,7B activos por token. El enrutamiento dinámico de expertos es la razón por la que el modelo genera texto más rápido que el Dhir 2B en CPU, según indica el autor, pese a tener un número total de parámetros mayor. El modelo está orientado a conversación multilingüe y despliegue en el borde.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las cuantizaciones GGUF se han generado con imatrix (importance matrix), lo que suele mejorar la calidad de los builds de 4 bits respecto a cuantizaciones estándar. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La model card menciona la familia BrahmAI y el catálogo AIKosh del gobierno indio como contexto del proyecto.

## Capacidades

- Generación de texto conversacional multilingüe en inglés y diez lenguas indias.
- Razonamiento y diálogo multi-turno (pipeline text-generation, etiqueta conversational).
- Soporte de plantillas de chat vía `--jinja` en llama.cpp.
- Compatible con endpoints OpenAI a través de `llama-server`.
- Capacidad de ejecución en CPU, GPU (CUDA, Vulkan) y NPU (OpenVINO) según el hardware.
- Optimización de throughput en CPU para arquitecturas MoE gracias al enrutamiento disperso de expertos.
- No se documentan capacidades de visión, audio, tool calling explícito ni modo thinking en la información disponible.

## Casos de uso

- Asistentes conversacionales en lenguas indias: el modelo cubre hindi, bengalí, tamil, telugu, canarés, malabar, maratí, guyaratí, panyabí y oriya, lo que permite desplegar un único asistente para usuarios de distintas regiones lingüísticas de la India sin depender de traducción intermedia.
- Despliegue en dispositivos de borde: el build Q4_K_M de 3,4 GB cabe en portátiles, móviles y chips embebidos, lo que habilita asistentes locales sin conexión en entornos con conectividad limitada.
- Inferencia en CPU de altas prestaciones: al activar solo 1,7B parámetros por token, el modelo supera en velocidad de generación al Dhir 2B en CPU, según el autor, lo que lo hace adecuado para servidores sin GPU dedicada.
- Aceleración en hardware Intel: con los backends Vulkan y OpenVINO puede ejecutarse en Intel Core Ultra, Arc y Xeon, incluyendo la NPU (Intel AI Boost), útil para portátiles corporativos y estaciones de trabajo sin GPU discreta.
- Servicio compatible con OpenAI: `llama-server` expone una API compatible con OpenAI en el puerto 8080, lo que permite integrarlo en aplicaciones existentes basadas en LangChain u otros SDK sin cambios de código.
- Procesamiento de documentos largos: con 16.384 tokens de contexto puede resumir o responder preguntas sobre documentos de extensión media en cualquiera de los idiomas soportados.
- Chat local en terminal o escritorio: `llama-cli` con `--jinja -cnv` permite un asistente interactivo offline para desarrolladores y usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere 3,4 GB; Q8_0 requiere 5,4 GB de memoria (compartida entre RAM y VRAM según el offload).
- GPU recomendadas: el autor menciona small GPUs para el build Q8_0; se documenta soporte para CUDA (NVIDIA), Vulkan (Intel Arc e integradas) y OpenVINO (Intel Core Ultra, Arc y NPU Intel AI Boost). No se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, el build Q4_K_M (3,4 GB) y el Q8_0 (5,4 GB) caben en GPUs de consumo con al menos 6 GB de VRAM; en CPU funcionan sin GPU.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`, `llama-bench`), endpoints compatibles con OpenAI, integración con LangChain vía `langchain-openai`. Requiere compilar desde la rama `dhir-support` de `zenteiq-research/llama.cpp` hasta que el soporte se fusione en upstream; también hay binarios precompilados en llama.cpp Releases.
- Notas de rendimiento: en MoE sobre OpenVINO, el autor recomienda fijar `-b` y `-ub` al menos al tamaño del prompt (p. ej. `-b 2048 -ub 2048`) para evitar errores de forma en la conversión de grafo. Además, indica que los modelos MoE dispersos logran mayor throughput de generación en CPUs multichannel modernas (LPDDR5/DDR5) que en GPU debido al ancho de banda de memoria durante el enrutamiento dinámico de expertos. No se proporcionan cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Dhir 5B-A1.7B (Q4_K_M) | 5,1B | 1,7B | 16.384 | Apache 2.0 | GGUF | MoE, 11 idiomas (en + 10 indias), 3,4 GB |
| Dhir 2B (Q4_K_M) | 2B (no disponible el desglose) | no disponible | no disponible | Apache 2.0 | GGUF | 1,3 GB; el autor indica que el 5B-A1.7B es más rápido en CPU |
| Dhir 2B (Q8_0) | 2B | no disponible | no disponible | Apache 2.0 | GGUF | 2,2 GB; pensado para portátiles y móviles |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE ligero multilingüe con cobertura de lenguas indias) en los datos proporcionados.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual.
- La cobertura lingüística se limita a inglés y diez lenguas indias; no se garantiza calidad en otras lenguas.
- El contexto máximo es de 16.384 tokens; los documentos más largos requerirán truncado o fragmentación.
- El soporte en llama.cpp upstream aún no está fusionado: es necesario compilar la rama `dhir-support` o usar binarios precompilados, lo que añade fricción operativa.
- En MoE con OpenVINO, el tamaño de batch debe ajustarse al prompt para evitar errores; es una limitación práctica de despliegue.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar los términos del modelo base y las obligaciones de atribución.
- No se han publicado benchmarks, por lo que no es posible validar empíricamente el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-GGUF
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B
- Dhir 2B GGUF: https://huggingface.co/zenteiq-ai/Dhir-2B-GGUF
- ZenteiQ: https://www.zenteiq.ai
- Ficha en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/dhir_5b_1.html
- Rama llama.cpp con soporte Dhir: https://github.com/zenteiq-research/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Guía de build Vulkan: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md#vulkan
- Guía de backend OpenVINO: https://github.com/ggml-org/llama.cpp/blob/master/docs/backend/OPENVINO.md#build-instructions
