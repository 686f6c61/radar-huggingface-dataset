# Xylolabs/Qwen3.5-4B-GGUF

## Resumen

Xylolabs/Qwen3.5-4B-GGUF es una cuantización en formato GGUF del modelo base Qwen/Qwen3.5-4B, publicada por Xylolabs para su uso con llama.cpp en generación de texto. El repositorio contiene un único archivo, `Qwen3.5-4B-Q4_K_M.gguf` (2,783 GB), que incorpora el modelo de texto del original y conserva el módulo de predicción multi-token (multi-token prediction, MTP) del modelo base. La relevancia de esta publicación radica en que permite ejecutar un modelo de 4.326 millones de parámetros en GPUs de consumo con cuantización Q4_K_M y una ventana de contexto declarada de hasta 256K tokens.

El modelo base es de la familia Qwen3.5, distribuido bajo licencia Apache 2.0, y esta conversión mantiene esa misma licencia. Xylolabs declara explícitamente que no está afiliada ni respaldada por los autores del modelo original, y el archivo `NOTICE` del repositorio identifica la fuente y al titular del copyright.

La ficha se centra en lo que la model card documenta: el proceso de cuantización, las métricas de divergencia KL frente a BF16, la tabla de recomendaciones de hardware y las instrucciones de ejecución con llama.cpp. Los datos sobre arquitectura interna, composición del dataset de entrenamiento y benchmarks de capacidad (MMLU, HumanEval, GSM8K) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen/Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 256K tokens segun la tabla de hardware del autor |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en este repo) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un transformer de la familia Qwen3.5 con 4.326 millones de parámetros. La model card de esta cuantización indica que los archivos GGUF contienen "el modelo de texto" del original para generación solo de texto, y que el archivo incluye el módulo de predicción multi-token (MTP). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

El trabajo técnico de esta publicación es la conversión a GGUF y la cuantización a Q4_K_M, verificada con la build de llama.cpp `cd959bae`. El autor publica métricas de fidelidad frente a BF16 medidas con llama.cpp: divergencia KL media de 0,039883 en WikiText-2 y 0,038531 en held-out, con una concordancia top-1 del 91,338 % y del 90,755 % respectivamente. La model card compara además este archivo con cuantizaciones de Unsloth y de llama.cpp en distintos niveles (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, Q2_K_XL), lo que permite situar la pérdida de calidad de esta Q4_K_M en el contexto de alternativas del mismo tamaño.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` está presente.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Predicción multi-token (MTP): el archivo incluye el módulo correspondiente del modelo base, según la model card.
- Capacidades multilingües limitadas a inglés (en) y coreano (ko) según los metadatos del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: con 2,783 GB de pesos en Q4_K_M, el modelo cabe en una RTX 4090 o RTX 3090 (24 GB) y, según la tabla del autor, permite contexto de hasta 256K tokens en esos 24 GB, lo que lo hace adecuado para prototipos y asistentes locales sin depender de la nube.
- Asistentes conversacionales de contexto largo: la ventana declarada de 256K tokens permite procesar documentos extensos, historiales de conversación prolongados o bases de código completas en una sola pasada, siempre que el hardware disponga de memoria suficiente para el KV cache.
- Generación de texto en inglés y coreano: útil para aplicaciones bilingües en esos dos idiomas, por ejemplo atención al cliente o generación de contenido en mercados de habla inglesa y coreana.
- Integración en pipelines con llama.cpp: la build de referencia (`cd959bae`) y el formato GGUF permiten incorporar el modelo en herramientas basadas en llama.cpp, como servidores locales compatibles con la API de OpenAI (`endpoints_compatible` en los tags).
- Experimentación e investigación en cuantización: las tablas de divergencia KL y concordancia top-1 del autor permiten usar este archivo como referencia para estudiar el impacto de Q4_K_M frente a BF16 y frente a otras cuantizaciones.
- Evaluación comparativa de proveedores de cuantización: la model card incluye métricas de archivos de Unsloth y de llama.cpp en el mismo nivel de bits, lo que facilita comparar la fidelidad de distintas conversiones antes de elegir una para producción.
- Despliegue en hardware de altas prestaciones con contexto máximo: la tabla del autor cubre desde una RTX 5090 (32 GB) hasta una B300 (288 GB), lo que permite escalar el mismo archivo a servidores con contexto completo de 256K sin cambiar de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye métricas de fidelidad de la cuantización frente a BF16, medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 4,611 GB | 0,001852 | 98,363 % | 0,000969 | 98,451 % |
| Unsloth Q8_0 | 4,482 GB | 0,001852 | 98,363 % | 0,000969 | 98,451 % |
| Unsloth UD-Q6_K_XL | 4,146 GB | 0,002306 | 97,794 % | 0,001629 | 97,853 % |
| llama.cpp Q6_K | 3,563 GB | 0,005615 | 96,667 % | 0,004003 | 96,618 % |
| Unsloth Q6_K | 3,526 GB | 0,004178 | 97,078 % | 0,002881 | 96,873 % |
| Unsloth UD-Q5_K_XL | 3,251 GB | 0,006631 | 96,044 % | 0,005812 | 96,127 % |
| llama.cpp Q5_K_M | 3,161 GB | 0,014291 | 94,814 % | 0,010270 | 95,157 % |
| Unsloth Q5_K_M | 3,144 GB | 0,006630 | 95,966 % | 0,006523 | 95,873 % |
| Unsloth UD-Q4_K_XL | 2,912 GB | 0,016176 | 93,505 % | 0,015473 | 93,912 % |
| **Q4_K_M (este repo)** | **2,783 GB** | **0,039883** | **91,338 %** | **0,038531** | **90,755 %** |
| Unsloth Q4_K_M | 2,741 GB | 0,020194 | 93,059 % | 0,020741 | 93,382 % |
| Unsloth IQ4_XS | 2,477 GB | 0,030611 | 91,819 % | 0,032629 | 90,980 % |
| Unsloth UD-Q3_K_XL | 2,436 GB | 0,053240 | 89,186 % | 0,052628 | 89,490 % |
| llama.cpp Q3_K_M | 2,319 GB | 0,117655 | 84,363 % | 0,133137 | 83,255 % |
| Unsloth Q3_K_M | 2,293 GB | 0,071434 | 87,005 % | 0,073009 | 87,353 % |
| Unsloth UD-IQ3_XXS | 1,949 GB | 0,142344 | 82,392 % | 0,157385 | 81,069 % |
| Unsloth UD-Q2_K_XL | 1,941 GB | 0,208873 | 79,495 % | 0,226803 | 78,088 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 2,783 GB solo para los pesos en Q4_K_M; hay que sumar el KV cache a la longitud de contexto elegida (f16) y unos 2 GB para el runtime, según la regla del autor (el archivo cabe si su tamaño más el KV cache más 2 GB queda por debajo del 90 % de la memoria).
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090, y en equipos con memoria unificada como Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB) y DGX Spark (128 GB unificada).
- Contexto máximo declarado: 256K tokens en todas las configuraciones listadas por el autor.
- Opciones de despliegue: llama.cpp (build `cd959bae` o posterior), con `llama-cli -m Qwen3.5-4B-Q4_K_M.gguf --jinja`. El tag `endpoints_compatible` sugiere compatibilidad con servidores de endpoints; no se detallan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo permite comparar este archivo con otras cuantizaciones del mismo modelo base, no con modelos distintos. La tabla siguiente resume la comparación de fidelidad y tamaño entre las opciones documentadas en la model card:

| Opcion | Parametros | Contexto | Fidelidad (KL WikiText-2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q4_K_M (este repo) | 4,326 M | 256K | 0,039883 | Apache 2.0 | Hugging Face |
| Unsloth Q4_K_M | 4,326 M | 256K | 0,020194 | Apache 2.0 | Hugging Face |
| Unsloth IQ4_XS | 4,326 M | 256K | 0,030611 | Apache 2.0 | Hugging Face |
| llama.cpp Q5_K_M | 4,326 M | 256K | 0,014291 | Apache 2.0 | Hugging Face |

No se dispone de datos para comparar con modelos de otros autores o familias de tamaño similar (por ejemplo, otros modelos de 4B) en la información proporcionada.

## Limitaciones y advertencias

- Solo se publica una cuantización, Q4_K_M; no hay archivos Q8_0, Q6_K ni de mayor fidelidad en este repositorio, lo que limita la elección según el hardware y la precisión requerida.
- La fidelidad de esta Q4_K_M es inferior a la de otras Q4_K_M del mismo modelo publicadas por terceros: la divergencia KL en WikiText-2 es 0,039883 frente a 0,020194 de Unsloth, y la concordancia top-1 es 91,338 % frente a 93,059 %. Conviene tenerlo en cuenta si la precisión es crítica.
- Idiomas soportados limitados a inglés y coreano según los metadatos; no se declara soporte de castellano.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no deben asumirse.
- Xylolabs declara no estar afiliada ni respaldada por los autores del modelo base; la responsabilidad sobre el comportamiento del modelo recae en el usuario.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; deben evaluarse empíricamente antes de usar el modelo en producción.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el archivo `LICENSE` y el `NOTICE` con la atribución al modelo original y a su titular de copyright.
- La ventana de 256K tokens depende de disponer de memoria suficiente para el KV cache; en GPUs de 24 GB el contexto práctico puede verse limitado por el resto de la memoria disponible.
- El repositorio tiene 466 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía baja y poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Build de llama.cpp de referencia: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen3.5-4B-GGUF/blob/main/LICENSE
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
