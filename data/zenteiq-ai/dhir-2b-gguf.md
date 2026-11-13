# zenteiq-ai/Dhir-2B-GGUF

## Resumen

Dhīr 2B GGUF es la versión cuantizada para llama.cpp del modelo Dhīr 2B, desarrollado por ZenteiQ (India) dentro de la familia BrahmAI y con el respaldo de la IndiaAI Mission del Ministerio de Electrónica y Tecnologías de la Información (MeitY). El modelo original es un transformer denso de 2.030.167.040 parámetros (aproximadamente 2B) diseñado para conversación multilingüe en inglés y once lenguas índicas, con una ventana de contexto de 16.384 tokens.

El repositorio publica dos builds GGUF: `Q4_K_M` (1,3 GB) orientado a despliegue en el borde (móviles, chips embebidos y portátiles sin GPU) y `Q8_0` (2,2 GB) para portátiles, móviles y GPUs pequeñas con una fidelidad casi idéntica al modelo original. La propuesta de valor es clara: un modelo compacto, con licencia Apache 2.0 y cobertura de lenguas índicas que hasta ahora estaban mal atendidas por modelos de tamaño similar.

Es relevante ahora porque combina tres factores poco habituales en modelos de 2B: cobertura lingüística real de once idiomas (incluyendo bengalí, tamil, telugu, kannada, malayo, maratí, guyaratí, panyabí y oriya), cuantizaciones verificadas con métricas de divergencia KL y perplejidad, y una licencia permisiva que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles en la información proporcionada) |
| Parámetros totales | 2.030.167.040 (aproximadamente 2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | Q4_K_M (1,3 GB) y Q8_0 (2,2 GB) |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or (inglés y diez lenguas índicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible confirma que Dhīr 2B es un transformer denso de 2B parámetros con contexto de 16.384 tokens, pero no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. La model card cita un "technical paper" y un blog de investigación en zenteiq.ai/research/blog como fuentes de la evaluación completa, pero no se incluyen los detalles arquitectónicos en la información proporcionada.

La innovación técnica destacable de este repositorio no está en la arquitectura del modelo base, sino en el proceso de cuantización y su verificación. Los autores evaluaron cada build contra el modelo original mediante perplejidad en WikiText-2, divergencia KL de las predicciones de siguiente token sobre 1,5 millones de tokens en 11 idiomas, código y matemáticas, y benchmarks estándar. Los builds emplean `imatrix` (importance matrix) en el proceso de cuantización, lo que explica la baja degradación observada. El resultado: el build Q4_K_M se mantiene dentro del 3,4% de la perplejidad del original y coincide en el 91% de los siguientes tokens; el Q8_0 se mantiene dentro del 0,1% y coincide en el 98%.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y diez lenguas índicas (hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí y oriya).
- Razonamiento y respuesta a preguntas en contextos de hasta 16.384 tokens.
- Generación de código y matemáticas (evaluado explícitamente en el proceso de cuantización, según la model card).
- Conversación con plantilla de chat compatible con `--jinja` en llama.cpp.
- Despliegue en el borde: pensado para móviles, chips embebidos y portátiles sin GPU.
- Compatibilidad con API compatible con OpenAI a través de `llama-server`, lo que permite integración con LangChain y otros clientes.
- Soporte de caché de contexto en 8 bits (`-ctk q8_0 -ctv q8_0`) para reducir memoria en conversaciones largas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en lenguas índicas para atención al cliente: el modelo cubre hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí y oriya, lo que permite desplegar un único modelo para usuarios que alternan entre inglés y su lengua materna, con una ventana de 16.384 tokens suficiente para conversaciones multi-turno con historial extenso.
- Despliegue en dispositivos móviles y embebidos: el build Q4_K_M de 1,3 GB cabe en la memoria de un móvil de gama media o un SoC embebido, permitiendo inferencia local sin conexión y sin GPU, útil para aplicaciones de campo, kioscos o dispositivos IoT con requisitos de privacidad.
- Traducción y resumen multilingüe en el borde: con once idiomas soportados y un consumo de memoria de aproximadamente 1,3 GB más 0,11 MB por token de conversación, se puede integrar en aplicaciones de traducción offline o resumen de documentos en dispositivos con recursos limitados.
- Generación de código asistida en portátiles sin GPU: el modelo se evaluó en código y matemáticas durante la cuantización, y el build Q8_0 (2,2 GB) ofrece una fidelidad del 98% respecto al original, adecuado para autocompletado o explicación de código en entornos de desarrollo ligeros.
- Prototipado rápido con API compatible con OpenAI: `llama-server` expone un endpoint `/v1` compatible con OpenAI, lo que permite sustituir un modelo en la nube por Dhīr 2B local en pipelines existentes de LangChain o similares sin cambiar el código de la aplicación.
- Educación y acceso a la información en zonas con conectividad limitada: al ejecutarse en CPU y con un footprint de 1,3 GB, el modelo puede distribuirse en escuelas o centros comunitarios con hardware modesto, ofreciendo respuestas en la lengua local del usuario.
- Investigación en modelos compactos multilingües: la licencia Apache 2.0 y la disponibilidad de pesos GGUF facilitan la experimentación académica con fine-tuning o evaluación comparativa en lenguas de bajos recursos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para el modelo base ni para los builds cuantizados. Sí publica métricas de fidelidad de la cuantización respecto al modelo original:

| Build | Perplejidad (WikiText-2) | Coincidencia de siguiente token |
|---|---|---|
| Q4_K_M (4 bits) | Dentro del 3,4% del original | 91% |
| Q8_0 (8 bits) | Dentro del 0,1% del original | 98% |

La coincidencia de siguiente token se midió sobre 1,5 millones de tokens en 11 idiomas, código y matemáticas. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para el build Q4_K_M y 2,2 GB para el Q8_0, más 0,11 MB por token de conversación en la caché de contexto.
- Caché de contexto opcional en 8 bits (`-ctk q8_0 -ctv q8_0`) para reducir a la mitad el consumo de la parte correspondiente al contexto en conversaciones largas.
- GPU recomendadas: no se especifican modelos concretos; el README menciona que el build Q8_0 está pensado para "GPUs pequeñas" y que se puede compilar con `-DGGML_CUDA=ON` para NVIDIA. No se detallan A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, ambos builds caben en cualquier GPU con al menos 2,5 GB de VRAM; el Q4_K_M cabe incluso en iGPUs y en memoria unificada de móviles.
- Despliegue: llama.cpp (rama `dhir-support` del repositorio zenteiq-research/llama.cpp, pendiente de merge en el repositorio principal), con `llama-server` (API compatible con OpenAI) y `llama-cli`. No se mencionan vLLM, TGI, Ollama ni otras opciones en la información proporcionada.
- Latencia y throughput: no disponibles. El README recomienda ajustar `-t` al número de núcleos de rendimiento y `-tb` al total de núcleos para maximizar la velocidad en CPU, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dhīr 2B (Q4_K_M) | 2B | 16.384 | en + 10 índicas | Apache 2.0 | GGUF |
| Dhīr 5B-A1.7B (Q4_K_M) | 5B totales / 1,7B activos (MoE, según nomenclatura) | No disponible | No disponible | Apache 2.0 | GGUF |
| Alternativas de 2B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el propio modelo de la familia, Dhīr 5B-A1.7B, que el autor presenta como "más fuerte y rápido que el 2B en CPU" con un tamaño de 3,4 GB en Q4_K_M. No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros (por ejemplo, Qwen, Gemma o Llama en tamaño 2B) en la información proporcionada, por lo que no se puede establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- La cuantización de 4 bits sacrifica algo de precisión: el build Q4_K_M se desvía un 3,4% en perplejidad y coincide en el 91% de los siguientes tokens, por lo que se recomienda el Q8_0 cuando la memoria lo permita.
- Riesgo de alucinación: como cualquier modelo de lenguaje, Dhīr puede afirmar hechos incorrectos con fluidez; el autor recomienda verificar la información crítica y añadir salvaguardas en producción.
- El soporte en llama.cpp aún no está fusionado en la rama principal: es necesario compilar la rama `dhir-support` del repositorio zenteiq-research/llama.cpp, lo que añade fricción operativa y riesgo de divergencia con futuras versiones.
- No se documentan sesgos conocidos, limitaciones por idioma dentro de los once soportados, ni comportamiento en dominios especializados.
- No se documenta soporte de tool calling, agentes, visión ni audio, lo que limita su uso en pipelines agénticos complejos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se deben conservar los archivos `LICENSE` y `NOTICE` del modelo original incluidos en el repositorio.
- El modelo tiene solo 7 descargas y 0 likes en el momento de la ficha, lo que indica una adopción muy temprana y escasa validación por parte de la comunidad.
- El contexto de 16.384 tokens es moderado para tareas de documentación larga o análisis de repositorios completos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/zenteiq-ai/Dhir-2B-GGUF
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-2B
- Variante Dhīr 5B-A1.7B GGUF: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-GGUF
- Sitio web de ZenteiQ: https://www.zenteiq.ai
- Blog de investigación: https://zenteiq.ai/research/blog/
- Ficha en AIKosh (IndiaAI): https://aikosh.indiaai.gov.in/home/models/details/dhir_2b.html
- Repositorio llama.cpp con soporte Dhīr: https://github.com/zenteiq-research/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Contacto: research@zenteiq.ai
