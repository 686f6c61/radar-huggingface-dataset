# tinyopsec/xor-lite-GGUF

## Resumen

xor-lite-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo base `juspay/xor-lite`, a su vez construido sobre `openbmb/MiniCPM5-2B`, un modelo de lenguaje de aproximadamente 2,5 mil millones de parámetros con arquitectura Llama. El repositorio ha sido publicado por el usuario tinyopsec y ofrece trece variantes de cuantización que van desde F16 (precisión completa) hasta Q2_K, generadas con llama.cpp, lo que permite ejecutar el modelo en hardware de consumo e incluso en dispositivos modestos.

Es importante destacar que este GGUF contiene únicamente el modelo base: el adaptador LoRA y la cabeza de lectura (readout head) que caracterizan a xor-lite no están fusionados y deben aplicarse por separado siguiendo las instrucciones del repositorio original. Por tanto, tal cual está distribuido, se trata de un MiniCPM5-2B cuantizado, no del modelo xor-lite completo con sus capacidades específicas.

Su relevancia radica en facilitar la ejecución local y offline de un modelo pequeño y eficiente con licencia Apache 2.0, compatible con runtimes ampliamente utilizados como llama.cpp, Ollama, LM Studio o koboldcpp. La longitud de contexto exacta no está disponible en la información proporcionada, aunque la familia MiniCPM se caracteriza históricamente por soportar contextos amplios para su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es MiniCPM5-2B, un transformer decoder con arquitectura Llama de unos 2,5 mil millones de parámetros, entrenado por OpenBMB. Sobre este base, el proyecto xor-lite de Juspay añade un adaptador LoRA y una cabeza de lectura (readout head) que se distribuyen por separado; en este repositorio GGUF ninguno de los dos componentes está fusionado, por lo que el comportamiento del modelo corresponde al del MiniCPM5-2B base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación (RLHF, DPO) en la documentación proporcionada. Como innovación técnica destacable, el propio esquema de xor-lite (LoRA + readout head separados del base) permite modular el modelo sin modificar los pesos originales, aunque los detalles de su funcionamiento no están descritos en la model card.

## Capacidades

- Generacion de texto conversacional: el repositorio está etiquetado como `conversational` y con pipeline de `text-generation`.
- Ejecucion local y offline: gracias al formato GGUF puede correr en CPU y GPU de consumo mediante llama.cpp y runtimes compatibles.
- Base para el sistema xor-lite: admite la aplicacion posterior del adaptador LoRA y la readout head de `juspay/xor-lite` para recuperar las capacidades especificas de ese proyecto.
- No hay informacion disponible sobre tool calling, capacidades de agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado local de LLMs pequeños: con la variante Q4_K_M (recomendada por el autor) el modelo ocupa unos 1,5-2 GB, lo que permite probarlo en un portátil sin GPU dedicada y iterar rápidamente sobre prompts.
- Integracion en aplicaciones con llama.cpp: el comando `./llama-cli -m model-Q4_K_M.gguf -p "..." -n 256` muestra el uso directo; puede integrarse en backends mediante la API de llama.cpp o bindings de Python.
- Asistentes offline en dispositivos de borde: las cuantizaciones Q3 y Q2_K reducen el footprint por debajo de 1,5 GB, adecuado para ejecución en CPU en entornos sin conectividad.
- Investigacion sobre adaptadores LoRA: al tratarse de un base sin fusionar, es útil para experimentar con la carga de adaptadores LoRA en llama.cpp y medir su impacto sobre MiniCPM5-2B.
- Generacion de texto en pipelines de datos: puede usarse como componente ligero de resumen, reescritura o clasificación generativa en flujos de procesamiento donde el coste por token importa.
- Evaluacion comparativa de cuantizaciones: con trece variantes desde F16 hasta Q2_K, el repositorio es un buen banco de pruebas para medir la degradación de calidad frente al ahorro de memoria en un modelo de 2,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: F16 ocupa unos 5,0 GB; Q8_0 alrededor de 2,7 GB; Q4_K_M (recomendada) aproximadamente 1,5-1,7 GB; Q2_K por debajo de 1 GB. A estas cifras hay que sumar la memoria del contexto (KV cache).
- Como es un modelo de ~2,5B, cabe sobradamente en GPUs de consumo: cualquier tarjeta con 4 GB de VRAM o mas (por ejemplo RTX 3060, RTX 4060 o superiores) ejecuta las variantes de 4 bits con holgura, e incluso integraa gráficas modernas pueden manejar las cuantizaciones mas agresivas en CPU.
- En CPU: perfectamente viable con llama.cpp gracias a la cuantizacion k-quants; el rendimiento sera modesto pero util para un modelo de este tamano.
- Opciones de despliegue: llama.cpp (nativo del formato), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay menccion a vLLM o TGI, orientados a pesos safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 2,5B cuantizado, se espera inferencia rapida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| tinyopsec/xor-lite-GGUF (este) | ~2,5B | GGUF (13 cuantizaciones) | Apache 2.0 | no disponible | Base sin adaptador LoRA ni readout head |
| openbmb/MiniCPM5-2B (base original) | ~2,5B | safetensors | no disponible en la ficha | no disponible | Pesos originales sin cuantizar |
| juspay/xor-lite (upstream) | ~2,5B + LoRA | safetensors (adaptador) | no disponible | no disponible | Incluye LoRA y readout head; base de este repo |

No se han identificado alternativas de terceros con datos comparables suficientes en la informacion proporcionada; como categoria, compite con otros modelos ligeros de ~2-3B distribuidos en GGUF para ejecucion local (por ejemplo Qwen2.5-3B o Gemma 2 2B), aunque no se dispone de cifras de rendimiento para una comparacion cuantitativa.

## Limitaciones y advertencias

- Advertencia critica del autor: este GGUF contiene solo el modelo base. El adaptador LoRA y la readout head de xor-lite no estan incluidos ni fusionados; usar el modelo sin ellos no reproducira el comportamiento de xor-lite completo.
- Sesgos conocidos: no documentados; al heredar de MiniCPM5-2B, hereda potencialmente los sesgos de sus datos de entrenamiento, no detallados en la ficha.
- Riesgo de alucinacion: tipico de modelos de lenguaje de 2,5B; sin benchmarks publicados no puede cuantificarse.
- Longitud de contexto e idiomas soportados: no disponibles en la documentacion, lo que dificulta planificar aplicaciones con documentos largos o en idiomas especificos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base openbmb/MiniCPM5-2B y del repositorio upstream juspay/xor-lite para usos en produccion.
- Repositorio de comunidad con muy poca traccion (377 descargas, 0 likes) y sin model card tecnica detallada: se recomienda validacion propia antes de uso en produccion.
- Las cuantizaciones de 2-3 bits (Q2_K, Q3_*) pueden degradar apreciablemente la calidad de generacion respecto a F16.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tinyopsec/xor-lite-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Proyecto upstream con el adaptador LoRA y readout head: https://huggingface.co/juspay/xor-lite
- No se han encontrado enlaces a papers, blogs, demos ni repositorios adicionales en la informacion disponible.
