# Xylolabs/phi-4-Tensix-BFP4-MLP

## Resumen

phi-4-Tensix-BFP4-MLP es una exportación cuantizada de microsoft/phi-4, un modelo de lenguaje de 14.659.507.200 parámetros desarrollado originalmente por Microsoft Research. La versión publicada por Xylolabs adapta los pesos del transformer denso de Phi-4 para su ejecución eficiente sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), empleando formatos de coma flotante por bloques propios de TT-NN: bfloat4_b (BFP4) para las capas MLP y bfloat8_b (BFP8) para las proyecciones de atención.

El problema que resuelve es la brecha entre los checkpoints estándar en bf16 y el hardware de inferencia de Tenstorrent, que trabaja de forma nativa con tensores empaquetados en la malla BFP4/BFP8. Al almacenar las matrices ya en la retícula de cuantización, TT-NN puede empaquetarlas sin alterar sus valores, lo que reduce el peso del modelo de 29,32 GB en bf16 a 11,03 GB empaquetados, con una media de 6,02 bits por peso.

Es relevante ahora porque permite desplegar un modelo de razonamiento de gama media-alta en NPUs de Tenstorrent con una pérdida de fidelidad respecto a bf16 medida y acotada (KL medio de 0,02697 frente a 0,0180 de una cuantización Q4_K_M de llama.cpp). El checkpoint se distribuye en el layout de Llama (LlamaForCausalLM), con las matrices fusionadas q, k, v y gate-up de Phi-4 separadas, y conserva la licencia MIT del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Phi-4), exportado en layout LlamaForCausalLM |
| Parametros totales | 14.659.507.200 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (bfloat4_b) en MLP gate/up/down; BFP8 (bfloat8_b) en atencion q/k/v/o; bf16 en LM head, embeddings y normas. Media de 6,02 bits por peso |
| Idiomas soportados | Ingles (segun model card); calibracion de cuantizacion con WikiText-2 y Wikipedia en coreano |
| Licencia | MIT (pesos); codigo auxiliar Apache-2.0 |
| Formato de pesos | safetensors (repo de 29,3 GB; 11,034 GB empaquetados en dispositivo) |

## Arquitectura y entrenamiento

El modelo subyacente es Phi-4, un transformer decoder-only denso de aproximadamente 14,7 mil millones de parámetros con 40 capas, según se deduce de la tabla de formatos de la model card (40 capas de atención y 40 de MLP). Xylolabs no reentrena el modelo: parte del checkpoint oficial de microsoft/phi-4 y aplica un proceso de cuantización post-entrenamiento. Las proyecciones MLP (gate, up, down) se cuantizan a bfloat4_b mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, k, v, o) se cuantizan a bfloat8_b con redondeo al más cercano. El resto de tensores (embeddings, LM head, normas) permanece en bf16.

La innovación técnica principal es el empaquetado directo en la retícula BFP de TT-NN: las matrices cuantizadas se almacenan como valores bf16 sobre la retícula BFP4 o BFP8, de modo que el runtime de Tenstorrent las empaqueta sin modificar sus valores. El checkpoint se reorganiza del layout original de Phi-4 al de Llama, separando las matrices fusionadas q, k, v y gate-up manteniendo los mismos valores. Se incluyen scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban la fidelidad del empaquetado matriz a matriz, con round-trip opcional por la DRAM del dispositivo. La validación se realizó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Phi-4.
- Razonamiento y matemáticas de nivel medio-alto, según las capacidades del modelo base.
- Generación de código, por herencia del modelo base.
- Soporte de plantilla de chat (`apply_chat_template`) para diálogo multi-turno.
- Ejecución nativa en NPUs Tensix mediante TT-NN (Wormhole y Blackhole), con empaquetado exacto en BFP4/BFP8.
- Inferencia también en transformers estándar cargando los pesos en bfloat16.
- Capacidades de tool calling, agentes o visión: no disponibles en la información proporcionada para esta exportación.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso de uso central. El checkpoint está pensado para cargarse en NPUs Wormhole o Blackhole vía TT-NN, ocupando 11,03 GB de memoria de dispositivo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Inferencia conversacional en transformers: la model card incluye un quickstart con `AutoModelForCausalLM.from_pretrained(repo, dtype="bfloat16", device_map="auto")` y plantilla de chat, adecuado para prototipado en GPU antes de portar a Tensix.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz se empaqueta sin cambios de valor, útil para equipos que desarrollan flujos GPTQ para TT-NN.
- Servicio de generación de texto compatible con text-generation-inference: el tag `endpoints_compatible` y el pipeline `text-generation` permiten exponerlo como endpoint en infraestructura estándar.
- Evaluación comparativa de fidelidad de cuantización: sirve como referencia para medir KL y top-1 frente a bf16 y frente a Q4_K_M en tareas de texto inglés y coreano.
- Investigación en formatos de coma flotante por bloques: el checkpoint documenta el reparto de bits por proyección en `quant4.json`, lo que facilita experimentos sobre asignación de precisión por capa.

## Benchmarks y rendimiento

Datos de la model card, medidos como fidelidad respecto a bf16 (no como calidad de tarea):

| Modelo | Bits por peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/phi-4) | 16 | 29,32 | 0 | 100 | - | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 6,02 | 11,034 | 0,02697 | 92,38 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,94 | 9,059 | 0,0180 | 93,65 | 29 de 33 | 0 |

KL y top-1 se calculan sobre 16.280 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. El Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 sin importance matrix. El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo lo cumple (1,50 veces el KL de Q4_K_M, 0 respuestas perdidas frente a 0). No se reportan datos de velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 11,03 GB solo para los pesos del modelo de lenguaje, más KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante TT-NN (validado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole).
- GPU consumer: el repo ocupa 29,3 GB en safetensors; cargado en bf16 con transformers requiere del orden de 29 GB de VRAM, por lo que no cabe en GPUs consumer de 24 GB sin cuantización adicional. La cuantización BFP4/BFP8 no es un formato estándar de transformers ni de llama.cpp.
- Despliegue: transformers (con `dtype="bfloat16"`), TT-NN para Tensix. El tag `text-generation-inference` sugiere compatibilidad con TGI. tt-transformers y tt-forge no se probaron con este checkpoint según la model card.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/phi-4-Tensix-BFP4-MLP | 14,66 B | no disponible | safetensors BFP4/BFP8/bf16 | MIT | Optimizado para TT-NN en Tensix; KL 0,02697 |
| microsoft/phi-4 (bf16) | 14,66 B | no disponible | safetensors bf16 | MIT | Referencia de fidelidad; 29,32 GB |
| phi-4 Q4_K_M (llama.cpp) | 14,66 B | no disponible | GGUF 4,94 bits | MIT | 9,059 GB; KL 0,0180; orientado a CPU/GPU |

No se dispone de datos de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información proporcionada para esta exportación, por lo que la comparativa se limita a fidelidad de cuantización y despliegue.

## Limitaciones y advertencias

- Los benchmarks publicados miden cercanía a bf16 (KL y top-1), no calidad de tarea; no deben interpretarse como rendimiento en MMLU o similares.
- El modelo solo declara soporte de inglés; la calibración incluyó coreano, pero no se garantiza calidad multilingüe.
- La cuantización BFP4 en las capas MLP introduce degradación medible: top-1 del 92,38 % frente a bf16 y KL de 0,02697, superior al de Q4_K_M (0,0180).
- Los formatos bfloat4_b y bfloat8_b son específicos de TT-NN; fuera de Tenstorrent hay que cargar los pesos en bf16, perdiendo la ventaja de tamaño.
- tt-transformers y tt-forge no se validaron con este checkpoint; la verificación se hizo sobre el simulador ttsim, no necesariamente en silicio real.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredados del modelo base Phi-4.
- Licencia MIT permite uso comercial, pero el código auxiliar (`pack_tensix.py`, `verify_grid.py`) es Apache-2.0, licencia distinta de la de los pesos.
- El proyecto no está afiliado ni respaldado por Tenstorrent; se distribuye tal cual, sin garantía.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/phi-4-Tensix-BFP4-MLP/blob/main/LICENSE
