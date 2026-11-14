# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4

## Resumen

Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y orientada específicamente a la ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura original de Llama 3.1 (transformer decoder-only denso de 8.030.261.248 parámetros) y aplica cuantización GPTQ con formato block floating point de 4 bits (ttnn.bfloat4_b) únicamente a las capas lineales de atención y MLP, dejando el resto de tensores en bf16.

La relevancia de esta ficha radica en que no es una cuantización genérica para GPU, sino un empaquetado pensado para el stack TT-NN / tt-metal de Tenstorrent: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin alterar sus valores. El resultado ocupa aproximadamente 6,03 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 16,06 GB de la versión BF16, con un coste medio de 6,00 bits por peso.

El contexto, la tokenización y el chat template son los del modelo base (128.000 tokens de contexto en Llama 3.1), y los ficheros de configuración y tokenizador provienen de la versión de unsloth, enviados sin cambios. La licencia es la Llama 3.1 Community License. Es un checkpoint de nicho, con 58 descargas en el momento de redactar esta ficha, útil para quienes despliegan Llama 3.1 8B sobre hardware Tenstorrent y necesitan reducir la huella de memoria del dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), capas lineales cuantizadas a BFP4 |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Llama 3.1) |
| Tipos de cuantización | BFP4 (ttnn.bfloat4_b, 4,5 bits por peso) en proyecciones q/k/v/o y gate/up/down; bf16 en LM head, embeddings, norms y resto; media de 6,00 bits por peso |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (con ficheros auxiliares quant4.json y model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only denso de 32 capas con atención multi-cabeza agrupada (GQA). Esta exportación no reentrena el modelo: parte de los pesos bf16 byte-idénticos a los de Meta y aplica cuantización GPTQ con búsqueda de exponente por bloque sobre las proyecciones lineales de atención (q, k, v, o) y MLP (gate, up, down) de las 32 capas. La calibración se realizó sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano (45 % inglés), según la configuración llama-3.1-8b-cal4x.toml del repositorio tensix-bfp-gptq.

La innovación técnica principal es el uso del formato block floating point bfloat4_b de TT-NN: las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4, de forma que el empaquetado en el dispositivo no modifica los valores. El checkpoint incluye quant4.json, que lista el formato de cada proyección, y scripts de verificación (pack_tensix.py, verify_grid.py) que comprueban que cada matriz empaquetada coincide exactamente con la almacenada. Las pruebas se realizaron con ttnn 0.81.1 sobre ttsim (simulador Blackhole de Tenstorrent); tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo Instruct de Llama 3.1.
- Razonamiento, matemáticas y generación de código propias del modelo base (no se han publicado evaluaciones específicas en esta exportación).
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct.
- Capacidades multilingües en ocho idiomas declarados: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Ejecución sobre NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante el stack TT-NN / tt-metal.
- Compatibilidad con la librería transformers para carga en bf16 y ejecución en GPU/CPU convencional.
- No incluye visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. Permite ejecutar Llama 3.1 8B Instruct sobre NPU Wormhole o Blackhole ocupando unos 6,03 GB de memoria de dispositivo para los pesos, dejando margen para caché KV y buffers en tarjetas con memoria limitada.
- Inferencia de bajo consumo en edge o servidores con NPU: al reducir la huella de pesos un 62 % respecto a BF16 (6,03 GB frente a 16,06 GB), encaja en escenarios donde el consumo energético y la memoria del dispositivo son restrictivos.
- Asistentes conversacionales multi-turno: el modelo conserva el chat template y el tokenizador del base, por lo que puede gestionar diálogos con historial largo usando la ventana de contexto original de Llama 3.1.
- Generación de código en pipelines internos: al mantener las capacidades del Instruct base, puede integrarse en flujos de autocompletado o revisión de código, siempre que el backend sea compatible con el formato cuantizado.
- Prototipado e investigación en cuantización BFP: sirve como referencia para estudiar el impacto de BFP4 con GPTQ en calidad de salida, con métricas KL y top-1 publicadas frente a BF16 y Q4_K_M.
- Evaluación comparativa de stacks: útil para comparar el rendimiento de TT-NN frente a llama.cpp (Q4_K_M) en el mismo checkpoint base, ya que el autor publica ambas referencias.
- Traducción y atención al cliente multilingüe en los ocho idiomas declarados, con la salvedad de que la calidad en idiomas distintos del inglés no está evaluada en esta exportación.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B-Instruct) | 16 | 16,06 | 0 | 100 | 28 de 33 | - |
| **Este modelo (BFP4)** | 6,00 | 6,028 | 0,04686 | 89,95 | 28 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03235 | 91,06 | 30 de 33 | 0 |

Las métricas KL y top-1 se calculan sobre 16.056 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con chat template. Las 33 respuestas corresponden a prompts cortos con verificación automática; "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la versión cuantizada. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 y sin importance matrix.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 6,03 GB para los pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Software: ttnn 0.81.1 o superior; verificado sobre ttsim (simulador Blackhole). tt-transformers y tt-forge no se probaron con este checkpoint.
- Carga alternativa: compatible con transformers en bf16 con device_map="auto", lo que permite ejecutarlo en GPU convencionales, aunque en ese caso se pierde la ventaja de memoria del formato BFP4 (los pesos se cargan como bf16).
- GPU consumer: no se especifican requisitos para GPU; al cargarse en bf16 el modelo completo ronda los 16 GB, por lo que encajaría en GPUs con 24 GB o más, pero no es el caso de uso previsto.
- Opciones de despliegue: TT-NN / tt-metal sobre Tenstorrent; transformers para carga estándar. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4) | 8,03 B | no disponible | BFP4 + bf16 (6,00 bits/peso) | llama3.1 | Hugging Face, 58 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | no disponible | BF16 | llama3.1 | Hugging Face (oficial) |
| Q4_K_M (llama.cpp, mismo base) | 8,03 B | no disponible | 4,89 bits/peso | llama3.1 | Generado localmente con llama.cpp v0.9.0 |
| unsloth/Llama-3.1-8B-Instruct | 8,03 B | no disponible | BF16 | llama3.1 | Hugging Face (referencia de calibración) |

La comparación directa con Q4_K_M es la más informativa: Q4_K_M obtiene mejor KL (0,03235 frente a 0,04686), mejor top-1 (91,06 % frente a 89,95 %) y más respuestas correctas (30 de 33 frente a 28 de 33), con menor tamaño (4,921 GB frente a 6,028 GB). La ventaja de la exportación BFP4 no es la calidad, sino el empaquetado nativo para TT-NN sin alterar valores.

## Limitaciones y advertencias

- Nicho de hardware: el checkpoint está diseñado para NPU Tenstorrent; fuera de ese stack pierde su principal ventaja y se comporta como una carga bf16 convencional.
- Pérdida de calidad medible: KL medio de 0,04686 frente a BF16 y top-1 del 89,95 %, con una respuesta perdida respecto a BF16 en el conjunto de 33 prompts.
- Inferior a Q4_K_M en las métricas publicadas: peor KL, peor top-1 y mayor tamaño, aunque con formato distinto y orientado a otro hardware.
- Idiomas no evaluados: la evaluación cubre inglés y coreano; la calidad en los otros seis idiomas declarados no está medida.
- Riesgo de alucinación: heredado del modelo base Llama 3.1 Instruct; no se han publicado evaluaciones específicas de fidelidad factual en esta exportación.
- Sesgos: no se documentan análisis de sesgo para esta exportación; se heredan los del modelo base.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, requisitos de atribución y política de uso aceptable). Revisar antes de producción.
- Verificación limitada: las pruebas se hicieron sobre simulador (ttsim), no sobre silicio Blackhole o Wormhole real; tt-transformers y tt-forge no se ejecutaron.
- Madurez: 58 descargas y 0 likes; proyecto reciente (creado en noviembre de 2026 según los metadatos) sin adopción amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Referencia de tokenizador y configuración (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Configuración de calibración: https://github.com/XylolabsInc/tensix-bfp-gptq/blob/3d51048/configs/llama-3.1-8b-cal4x.toml
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
