# Xylolabs/phi-4-GGUF

## Resumen

Xylolabs/phi-4-GGUF es una colección de cuantizaciones en formato GGUF del modelo microsoft/phi-4, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de 14.659.507.200 parámetros (aproximadamente 14,7 mil millones) desarrollado originalmente por Microsoft, y esta publicación se limita a la conversión de pesos y a la cuantización, sin reentrenamiento ni modificación de la arquitectura.

El interés de esta ficha reside en que ofrece versiones optimizadas en tamaño y calidad de un modelo de razonamiento de tamaño medio, con métricas de degradación explícitas (KL medio y coincidencia top-1 frente a BF16) medidas sobre 16.280 posiciones de texto en inglés y coreano. Los cuatro ficheros publicados cubren el rango de 8,19 GB a 10,50 GB, lo que permite desplegar el modelo en GPUs de consumo como la RTX 4090 o la RTX 3090 con 24 GB de VRAM y contexto de 16K.

La licencia es MIT, lo que facilita el uso comercial sin las restricciones habituales de otros modelos de pesos abiertos. La relevancia actual del artefacto es práctica: proporciona una vía directa para ejecutar phi-4 en infraestructura local con cuantizaciones verificadas y una tabla de recomendación de hardware publicada por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base microsoft/phi-4); pesos convertidos a GGUF |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K recomendado en la tabla de hardware del autor; el modelo base phi-4 soporta más, pero no se especifica en esta ficha |
| Tipos de cuantizacion | Q5_K_M, Q4_K_M, IQ4_XS, IQ4_XS-imat |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (un fichero por cuantización, con tokenizer y chat template originales) |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo: es una conversión de los pesos de microsoft/phi-4 a GGUF y su posterior cuantización con llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior). La arquitectura subyacente es la del phi-4 original, un transformer denso de unos 14,7 mil millones de parámetros; esta ficha no dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens ni las fases de RLHF o DPO del modelo base, por lo que no se afirma nada al respecto.

La innovación técnica de esta publicación es la cuantización con importance matrix (imat): el fichero IQ4_XS-imat reduce el tamaño a 8,19 GB y mejora ligeramente la fidelidad frente a IQ4_XS sin imat (KL medio de 0,0197 frente a 0,0206; top-1 del 93,03 % frente al 92,62 %). Las métricas se calculan contra una pasada BF16 de referencia en transformers sobre 16.280 posiciones de texto en inglés y coreano. El fichero Q5_K_M es el de mayor fidelidad (KL medio 0,0055; top-1 95,96 %) y Q4_K_M se sitúa en un punto intermedio (KL 0,0180; top-1 93,65 %).

## Capacidades

- Generación de texto conversacional en inglés y coreano, con chat template incluido en cada fichero GGUF.
- Razonamiento y matemáticas: heredadas del modelo base phi-4, orientado a tareas de razonamiento; no se aportan benchmarks específicos en esta publicación.
- Generación de código: capacidad del modelo base, sin datos de evaluación en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta publicación.
- Capacidades multilingües: limitadas a inglés y coreano según los metadatos del repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Asistente conversacional local en inglés o coreano: con Q5_K_M (10,5 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto de 16K, lo que permite desplegar un chatbot multi-turno sin depender de la nube.
- Razonamiento y resolución de problemas sobre texto: el modelo base phi-4 está orientado a tareas de razonamiento; la cuantización Q5_K_M conserva el 95,96 % de coincidencia top-1 frente a BF16, adecuada cuando la fidelidad importa más que el tamaño.
- Procesamiento de documentos largos en local: con 16K de contexto recomendado por el autor se pueden resumir o extraer información de contratos, informes o artículos sin fragmentación agresiva.
- Despliegue en estaciones de trabajo con GPU única de 24 GB: la tabla del autor confirma RTX 4090, RTX 3090, RTX 5090 (32 GB) y RTX 6000 Ada (48 GB) como objetivos válidos para Q5_K_M a 16K.
- Ejecución en Apple Silicon: Mac Studio M5 Max y M5 Ultra (memoria unificada de 128 a 512 GB) están listados como hardware compatible con Q5_K_M a 16K, útil para desarrollo y prototipado en macOS.
- Servicio HTTP con llama-server: el mismo binario acepta los flags de llama-cli, de modo que se puede exponer el modelo como API compatible con endpoints para integraciones internas.
- Escenarios con restricciones de memoria: IQ4_XS-imat (8,19 GB) reduce el consumo manteniendo un top-1 del 93,03 %, útil en GPUs de 16 GB o en entornos con KV cache grande.
- Uso comercial sin fricción: la licencia MIT permite integrar el modelo en productos propietarios siempre que se respeten las cláusulas de atribución del fichero NOTICE.

## Benchmarks y rendimiento

La publicación no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Sí aporta métricas de fidelidad de la cuantización frente a BF16:

| Cuantizacion | Tamano | KL medio vs BF16 | Top-1 igual vs BF16 |
|---|---|---|---|
| Q5_K_M | 10,50 GB | 0,0055 | 95,96 % |
| Q4_K_M | 9,06 GB | 0,0180 | 93,65 % |
| IQ4_XS | 8,26 GB | 0,0206 | 92,62 % |
| IQ4_XS-imat | 8,19 GB | 0,0197 | 93,03 % |

Las métricas cubren 16.280 posiciones de texto en inglés y coreano. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 8,19 GB (IQ4_XS-imat) y 10,50 GB (Q5_K_M) solo para los pesos; hay que sumar la KV cache en f16 al contexto elegido y unos 2 GB para el runtime.
- Regla del autor: un fichero es válido si su tamaño más la KV cache a ese contexto más 2 GB queda por debajo del 90 % de la memoria disponible.
- GPUs recomendadas por el autor (todas con Q5_K_M a 16K): RTX 4090 y RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB usando Q5_K_M a 16K; también en RTX 5090.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 y 512 GB) están listados como compatibles.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server) en el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior, con soporte CUDA (`-DGGML_CUDA=ON`), Metal y CPU. No se documentan vLLM, TGI ni Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para comparar el rendimiento de esta cuantización con alternativas. La comparación se limita a parámetros, contexto, licencia y formato:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/phi-4-GGUF (esta ficha) | 14,66 B | 16K recomendado en tabla del autor | MIT | GGUF (4 cuantizaciones) | Métricas KL y top-1 publicadas frente a BF16 |
| microsoft/phi-4 (modelo base) | 14,66 B | no disponible en esta ficha | MIT | safetensors | Referencia original; sin cuantizar |
| Otras cuantizaciones GGUF de phi-4 | 14,66 B | depende del despliegue | MIT (heredada) | GGUF | No se dispone de datos concretos en la información proporcionada |

No se han identificado en la información disponible modelos comparables de otro tamaño o familia con datos verificables; la comparativa con alternativas como Qwen o Llama queda como "no disponible".

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y coreano; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: no se documentan análisis de sesgo en la publicación; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Alucinación: no se aportan tasas de alucinación ni evaluaciones de veracidad; como todo modelo generativo, puede producir contenido plausible pero incorrecto.
- Cuantización: Q4_K_M, IQ4_XS e IQ4_XS-imat degradan la fidelidad frente a BF16 (top-1 entre 92,62 % y 93,65 %); para tareas sensibles a la precisión conviene usar Q5_K_M o los pesos originales.
- Contexto: la tabla de hardware del autor asume 16K; no se especifica en esta ficha el contexto máximo real del modelo base ni el comportamiento más allá de esa longitud.
- Licencia: MIT permite uso comercial, pero el fichero NOTICE nombra al titular del copyright del modelo original; es necesario conservar la atribución.
- Afiliación: Xylolabs declara no estar afiliada ni respaldada por los autores del modelo original.
- Producción: no se publican latencias ni throughput, por lo que el dimensionamiento debe hacerse con pruebas propias.
- Fecha de creación del repositorio: 2026-11-15, con última actualización el 2026-11-23.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/phi-4-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- Licencia en el repositorio: https://huggingface.co/Xylolabs/phi-4-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
