# zenteiq-ai/Dhir-5B-A1.7B-GGUF

## Resumen

Dhīr 5B-A1.7B es un modelo de lenguaje compacto desarrollado por ZenteiQ (India) dentro de la familia BrahmAI, con el respaldo de la IndiaAI Mission del Ministerio de Electrónica y Tecnologías de la Información (MeitY). Su rasgo definitorio es una arquitectura de mezcla de expertos (MoE) con 5.094 millones de parámetros totales de los que solo 1.700 millones se activan por token, lo que le permite generar texto más rápido que un modelo denso de 2B en CPU manteniendo la calidad de un modelo de 5B. Está diseñado específicamente para inglés y once lenguas indias, un nicho poco cubierto por los modelos occidentales.

La ficha que nos ocupa corresponde a la versión GGUF cuantizada, publicada para su uso con llama.cpp. El repositorio incluye dos builds: Q4_K_M (3,4 GB) pensado para portátiles, sobremesas, móviles y chips embebidos, y Q8_0 (5,4 GB) para portátiles, sobremesas y GPUs pequeñas, con una salida prácticamente idéntica al modelo original. La ventana de contexto es de 16.384 tokens y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El interés actual del modelo radica en su combinación de eficiencia en inferencia (MoE con pocos parámetros activos), cobertura lingüística del subcontinente indio y despliegue en hardware de consumo. La cuantización Q4_K_M queda a menos de un 1,8 % de la perplejidad del original en WikiText-2 y coincide con el siguiente token del original el 91 % de las veces, mientras que Q8_0 se queda a menos del 0,2 % y coincide el 98 % de las veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; 5B totales con 1,7B activos por token |
| Parametros totales | 5.094.471.168 |
| Parametros activos | 1,7B por token |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (3,4 GB) y Q8_0 (5,4 GB); cuantización de caché KV opcional a q8_0 |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or (inglés y diez lenguas indias) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible confirma que Dhīr 5B-A1.7B emplea una arquitectura de mezcla de expertos con 5.094 millones de parámetros totales y 1.700 millones activos por token. El modelo card no detalla el número de expertos, la estrategia de enrutamiento ni la proporción de capas MoE frente a capas densas. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Estos datos se remiten al informe técnico anunciado por ZenteiQ, que a fecha de la model card figura como "forthcoming" (pendiente de publicación).

La innovación destacable documentada es la propia cuantización: el autor ha evaluado cada build GGUF frente al modelo original mediante perplejidad en WikiText-2, divergencia KL de las predicciones de siguiente token sobre 1,5 millones de tokens en 11 idiomas, código y matemáticas, y benchmarks estándar. El resultado es que Q4_K_M se mantiene dentro del 1,8 % de la perplejidad original y reproduce el siguiente token el 91 % de las veces, mientras que Q8_0 se queda dentro del 0,2 % y reproduce el 98 %. El repositorio incluye además un tag `imatrix`, lo que sugiere el uso de matrices de importancia para calibrar la cuantización. No se documentan otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y diez lenguas indias (hindi, bengalí, tamil, telugu, kannada, malayo, maratí, guyaratí, panyabí y oriya).
- Razonamiento y respuesta a preguntas en esos idiomas, con calidad evaluada mediante benchmarks estándar según el autor.
- Generación de código y matemáticas, incluido en el conjunto de evaluación de la cuantización (1,5 millones de tokens en 11 idiomas, código y matemáticas).
- Aritmética multi-paso, aunque el autor advierte que en bengalí y telugu conviene usar el build de 8 bits.
- Compatibilidad con API OpenAI a través de `llama-server` (`--jinja`), lo que habilita su uso desde LangChain y otros clientes compatibles.
- Soporte de plantillas de chat vía `--jinja` en llama.cpp.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales en lenguas indias: el modelo cubre diez idiomas del subcontinente además del inglés, con 16.384 tokens de contexto, lo que permite mantener conversaciones multi-turno con historial largo en aplicaciones de atención al ciudadano o servicios públicos digitales.
- Despliegue en dispositivos de borde y móviles: el build Q4_K_M ocupa 3,4 GB y, según el autor, funciona en portátiles, sobremesas, móviles y chips embebidos; al activar solo 1,7B parámetros por token, genera más rápido que Dhīr 2B en CPU, lo que lo hace apto para asistentes offline sin conexión.
- Procesamiento de documentos y resúmenes en inglés e hindi: con 16.384 tokens de contexto puede ingerir artículos, contratos o informes extensos y resumirlos o extraer información, ejecutándose en un portátil con el build Q8_0 y una GPU pequeña.
- Generación de código asistida en entornos con recursos limitados: el modelo ha sido evaluado en código y puede servir como autocompletado o generación de fragmentos en IDE, servido localmente mediante `llama-server` con API compatible con OpenAI e integrado en herramientas que hablan ese protocolo.
- Traducción y localización entre inglés y lenguas indias: su cobertura de once idiomas permite usarlo como motor de traducción en pipelines de localización de contenido, con la ventaja de que el build Q8_0 mantiene una fidelidad del 98 % respecto al original.
- Educación y tutoría en idiomas regionales: la ventana de contexto y el soporte multilingüe permiten construir tutores que expliquen conceptos en tamil, telugu o bengalí; el autor recomienda el build de 8 bits para aritmética multi-paso en bengalí y telugu.
- Prototipado e investigación en NLP para lenguas indias: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para experimentos académicos y fine-tuning sobre idiomas con pocos recursos, sin coste de licencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) con valores numéricos. Solo se documentan métricas de fidelidad de la cuantización frente al modelo original:

| Build | Perplejidad (WikiText-2) | Coincidencia de siguiente token con el original |
|---|---|---|
| Q4_K_M (4 bits) | dentro del 1,8 % del original | 91 % de las veces |
| Q8_0 (8 bits) | dentro del 0,2 % del original | 98 % de las veces |

Estas métricas se calcularon sobre 1,5 millones de tokens en 11 idiomas, código y matemáticas, según el autor. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 3,4 GB para Q4_K_M y 5,4 GB para Q8_0, más 0,07 MB por cada token de conversación en la caché KV.
- Caché KV reducida: con `-fa on -ctk q8_0 -ctv q8_0` se puede usar caché de contexto de 8 bits para conversaciones largas en dispositivos con poca memoria.
- GPU recomendadas: no se especifican modelos concretos; el autor indica que Q8_0 corre en "small GPUs" y Q4_K_M en portátiles, sobremesas, móviles y chips embebidos. No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, el build Q4_K_M (3,4 GB) y el Q8_0 (5,4 GB) caben en GPUs de consumo con 6-8 GB de VRAM o más, aunque el autor no detalla modelos concretos.
- Opciones de despliegue: llama.cpp (requiere compilar la rama `dhir-support` hasta que el soporte se fusione en el repositorio principal), con `llama-server` (API compatible con OpenAI en el puerto 8080) y `llama-cli`; integración con LangChain vía `langchain-openai`. No se documenta soporte de vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras concretas. El autor afirma que el build Q4_K_M genera texto más rápido que Dhīr 2B en CPU gracias a sus 1,7B parámetros activos. Para CPU recomienda ajustar `-t` al número de núcleos de rendimiento y `-tb` al total de núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dhīr 5B-A1.7B (este) | 5,1B totales / 1,7B activos (MoE) | 16.384 | en + 10 lenguas indias | Apache 2.0 | GGUF (Q4_K_M, Q8_0) |
| Dhīr 2B (misma familia) | 2B (denso, según nomenclatura) | no disponible | en + lenguas indias (según familia) | Apache 2.0 | GGUF (Q4_K_M 1,3 GB, Q8_0 2,2 GB) |
| Modelos densos de ~5B de propósito general | ~5B | variable | principalmente inglés | variable | safetensors, GGUF |

La comparativa con alternativas externas a la familia Dhīr no está disponible en la información proporcionada: no se ofrecen datos de rendimiento de otros modelos ni se identifican competidores directos. El propio autor compara el modelo con Dhīr 2B, señalando que el 5B-A1.7B es "más fuerte y rápido que el 2B en CPU" y que el 2B (1,3 GB en Q4_K_M) es preferible para dispositivos de borde con muy poca memoria.

## Limitaciones y advertencias

- La cuantización de 4 bits sacrifica algo de precisión: el autor recomienda el build de 8 bits cuando la memoria lo permita.
- Para aritmética multi-paso en bengalí y telugu, el autor aconseja explícitamente usar el build Q8_0.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede afirmar hechos incorrectos con fluidez; el autor recomienda verificar la información crítica y añadir salvaguardas en producción.
- Cobertura lingüística limitada a inglés y diez lenguas indias; no se documenta soporte de otras lenguas.
- Contexto máximo de 16.384 tokens, inferior al de modelos actuales con ventanas de 128K o más.
- El soporte en llama.cpp requiere compilar una rama específica (`dhir-support`) hasta que se fusione en el repositorio principal, lo que añade fricción al despliegue.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero se deben conservar los archivos `LICENSE` y `NOTICE` incluidos en el repositorio.
- No se documentan capacidades de tool calling, agentes ni visión, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-GGUF
- Modelo original: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B
- Dhīr 2B GGUF: https://huggingface.co/zenteiq-ai/Dhir-2B-GGUF
- Sitio web de ZenteiQ: https://www.zenteiq.ai
- Blog de investigación de ZenteiQ: https://zenteiq.ai/research/blog/
- Ficha en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/dhir_5b_1.html
- Rama de llama.cpp con soporte Dhīr: https://github.com/zenteiq-research/llama.cpp
- Repositorio principal de llama.cpp: https://github.com/ggml-org/llama.cpp
- Contacto: research@zenteiq.ai
