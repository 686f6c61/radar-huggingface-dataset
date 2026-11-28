# Xylolabs/Aion-1.0-Instruct-2.3B-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-GGUF es la versión cuantizada en formato GGUF del modelo Aion-1.0-Instruct-2.3B de Microsoft, publicada por Xylolabs para su uso con llama.cpp. Se trata de un modelo de lenguaje conversacional de 2.288 millones de parámetros (aproximadamente 2,3B) afinado para instrucciones, distribuido bajo licencia MIT y con soporte declarado para ocho idiomas: inglés, alemán, español, portugués, italiano, francés, chino y japonés.

La relevancia de esta ficha radica en que el repositorio no contiene los pesos originales en safetensors, sino un conjunto de cuantizaciones GGUF (desde F16 hasta Q2_K) acompañadas de una matriz de importancia y, de forma destacable, un parche para llama.cpp (`aion-llama.cpp.patch`). La arquitectura `aion` no está soportada por el llama.cpp estándar, por lo que sin aplicar ese parche el modelo no se puede cargar. Este detalle condiciona por completo el despliegue y conviene tenerlo presente antes de descargar.

El modelo base es `microsoft/Aion-1.0-Instruct-2.3B`. El repositorio ocupa 17,3 GB en total e incluye nueve archivos GGUF con distintos niveles de cuantización, además de gráficas de divergencia KL y acuerdos top-1 frente a una referencia en transformers f32 sobre pesos BF16. La ventana de contexto indicada en los ejemplos de ejecución es de 32 768 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `aion` (transformer; requiere parche en llama.cpp) |
| Parámetros totales | 2.288.831.488 (≈2,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 768 tokens (según ejemplos de ejecución con `-c 32768`) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá del identificador `aion` que emplea llama.cpp para reconocerlo. Se sabe que es un transformer de 2.288 millones de parámetros afinado para instrucciones (Instruct), pero no se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La innovación técnica destacable de este repositorio no está en el modelo en sí, sino en el proceso de cuantización: Xylolabs publica una matriz de importancia (`Aion-1.0-Instruct-2.3B.imatrix.gguf`) y gráficas de divergencia KL y acuerdo top-1 frente a una referencia f32 en transformers sobre pesos BF16, evaluadas sobre WikiText-2, datos de chat y un conjunto held-out. Además, el repositorio incluye el parche `aion-llama.cpp.patch` que añade soporte para la arquitectura `aion` a una revisión concreta de llama.cpp (`e4b620af19f02960dea7a3a81de7c5805aa3a333`).

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones (modelo etiquetado como `Instruct` y `chat`).
- Soporte multilingüe declarado en ocho idiomas: inglés, alemán, español, portugués, italiano, francés, chino y japonés.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructuras de despliegue tipo API.
- Ejecución local mediante llama.cpp con `llama-server` y `llama-cli`, incluyendo modo servidor compatible con plantillas Jinja (`--jinja` obligatorio).
- No se documentan en la información disponible capacidades de visión, audio, tool calling, function calling ni modos de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional local en estaciones de trabajo: con cuantizaciones Q4_K_M (1,57 GB) o Q5_K_M (1,77 GB) el modelo cabe holgadamente en GPUs de consumo y puede servir como chatbot de escritorio sin conexión, manteniendo conversaciones multi-turno dentro de la ventana de 32K tokens.
- Despliegue en dispositivos con recursos limitados: la cuantización Q2_K ocupa 1,01 GB, lo que permite ejecutarlo en equipos con poca VRAM o incluso en CPU, a costa de una caída notable de fidelidad (KL de 0,17564 y top-1 del 79,48 % en WikiText-2).
- Prototipado rápido de aplicaciones de chat: al estar bajo licencia MIT y en formato GGUF, se puede integrar en demos y pruebas de concepto sin restricciones de uso comercial ni necesidad de infraestructura dedicada.
- Generación de texto multilingüe en entornos europeos: el soporte declarado de español, francés, italiano, alemán y portugués lo hace apto para tareas de redacción o resumen en varios idiomas dentro de una misma aplicación.
- Servicio HTTP ligero con `llama-server`: el modo servidor de llama.cpp permite exponer el modelo como API compatible con endpoints, útil para backends de aplicaciones web de bajo tráfico.
- Evaluación comparativa de cuantizaciones: las gráficas de KL y top-1 publicadas permiten a un equipo decidir qué archivo usar según el equilibrio entre tamaño, VRAM disponible y fidelidad respecto al modelo original, algo poco habitual en repositorios GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio sí incluye métricas de fidelidad de cuantización frente a una referencia f32:

| Cuantización | Tamaño | WikiText-2 KL | Top-1 | Chat KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| F16 | 4,59 GB | 0,00027 | 98,92 % | 0,00019 | 99,25 % | 0,00025 | 98,96 % |
| Q8_0 | 2,44 GB | 0,00212 | 97,61 % | 0,00180 | 98,12 % | 0,00238 | 97,25 % |
| Q6_K | 2,03 GB | 0,00272 | 97,17 % | 0,00292 | 97,65 % | 0,00320 | 96,97 % |
| Q5_K_M | 1,77 GB | 0,00404 | 96,34 % | 0,00388 | 97,30 % | 0,00454 | 96,43 % |
| Q4_K_M | 1,57 GB | 0,00716 | 95,24 % | 0,00656 | 96,46 % | 0,00787 | 95,31 % |
| Q4_K_S | 1,40 GB | 0,01446 | 93,84 % | 0,01298 | 95,16 % | 0,01687 | 93,16 % |
| IQ4_XS | 1,28 GB | 0,02268 | 92,24 % | 0,02136 | 93,87 % | 0,02575 | 91,43 % |
| IQ3_M | 1,18 GB | 0,04580 | 89,40 % | 0,04892 | 90,67 % | 0,05419 | 87,92 % |
| Q2_K | 1,01 GB | 0,17564 | 79,48 % | 0,17004 | 83,64 % | 0,20950 | 77,38 % |

## Requisitos de hardware

- VRAM estimada: entre 1,01 GB (Q2_K) y 4,59 GB (F16) solo para pesos; hay que sumar la memoria de la caché KV para el contexto configurado (hasta 32K tokens).
- GPU recomendadas según la tabla del autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2×24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB unificada) y B300 (288 GB).
- Cabe en GPU de consumo: sí, ampliamente. Incluso la F16 de 4,6 GB entra en cualquier GPU con 8 GB o más; las cuantizaciones Q4_K_M (1,57 GB) o Q5_K_M (1,77 GB) son las más razonables para GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (imprescindible aplicar `aion-llama.cpp.patch` sobre la revisión `e4b620af`), con `llama-server` y `llama-cli`. No se documenta soporte para vLLM, TGI, Ollama ni otros runners en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para Aion-1.0-Instruct-2.3B en la información proporcionada, por lo que una comparación de rendimiento con alternativas de tamaño similar (por ejemplo, Qwen2.5-3B, Llama-3.2-3B o Gemma-2-2B) no puede sustentarse con cifras. La comparación se limita a características objetivas:

| Modelo | Parámetros | Contexto | Licencia | Formato en este repo |
|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B (este) | ≈2,3B | 32 768 | MIT | GGUF (9 cuantizaciones) |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible |

La única ventaja diferencial verificable frente a otros GGUF es la publicación de métricas de fidelidad de cuantización (KL y top-1) y de una matriz de importancia, además de la licencia MIT, que es más permisiva que las licencias con cláusulas de uso aceptable habituales en modelos de otros proveedores.

## Limitaciones y advertencias

- Requiere un parche no oficial de llama.cpp (`aion-llama.cpp.patch`) sobre una revisión concreta (`e4b620af`); el llama.cpp estándar no reconoce la arquitectura `aion`. Esto complica el despliegue, la actualización y el mantenimiento.
- El flag `--jinja` es obligatorio para el funcionamiento correcto del chat.
- La cuantización Q2_K degrada gravemente la fidelidad (top-1 del 79,48 % en WikiText-2 y KL de 0,17564); no es recomendable para producción.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación en la información disponible.
- El soporte multilingüe está declarado por el autor, pero no se aportan métricas por idioma que permitan verificar la calidad en español, chino o japonés.
- Aunque la licencia es MIT (permisiva para uso comercial), conviene verificar las condiciones del modelo base de Microsoft y de los pesos originales antes de un despliegue comercial.
- El repositorio ocupa 17,3 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- No hay información sobre tool calling, function calling, agentes ni razonamiento multi-paso; no asumir estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/blob/main/LICENSE
- Parche llama.cpp: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF/resolve/main/aion-llama.cpp.patch
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de herramientas del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
