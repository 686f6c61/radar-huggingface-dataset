# Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP4-GateUp

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP4-GateUp es una cuantización del modelo Qwen/Qwen2.5-14B-Instruct-1M, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado en el que las capas lineales del transformer original se han recuantizado a formatos de bloque en coma flotante propios de TT-NN: `bfloat4_b` (BFP4) para las proyecciones gate y up del MLP, y `bfloat8_b` (BFP8) para atención y down del MLP. El resultado son 14.770.033.664 parámetros con un peso medio de 7,45 bits por peso y un tamaño empaquetado de 13,76 GB frente a los 29,54 GB del BF16 original.

El modelo hereda del base Qwen2.5-14B-Instruct-1M su arquitectura transformer densa, su ventana de contexto de un millón de tokens y su naturaleza conversacional (instruct). La contribución de Xylolabs es puramente de compresión y empaquetado: los tensores se almacenan en bf16 en safetensors, pero cada valor ya está alineado a la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta directamente sin recálculo en el dispositivo. La cuantización BFP4 se realizó con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; los tensores BFP8 se obtuvieron por redondeo al más cercano.

Su relevancia es doble. Por un lado, demuestra que es posible llevar un modelo de 14B con contexto de 1M a hardware de aceleración específica de Tenstorrent con una degradación medida y acotada frente a BF16. Por otro, publica una metodología de verificación reproducible (`pack_tensix.py`, `verify_grid.py`) y unos criterios de aceptación explícitos (KL media no superior a 1,5 veces la de Q4_K_M de llama.cpp y no más de una respuesta perdida adicional). El checkpoint está validado en el simulador ttsim de Blackhole con ttnn 0.81.1, no en silicio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), capas lineales cuantizadas a formatos de bloque TT-NN |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.000.000 tokens (heredado de Qwen2.5-14B-Instruct-1M) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate y up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o y MLP down; media de 7,45 bits/peso; LM head, embeddings y normas en bf16 |
| Idiomas soportados | en (declarado en la model card; el modelo base soporta más idiomas, pero esta ficha no lo verifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya en rejilla BFP4/BFP8), indexado con `model.safetensors.index.json` y `quant4.json` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B-Instruct-1M es un transformer denso de 14.770 millones de parámetros con 48 capas, entrenado por Alibaba Qwen con un pipeline que incluye preentrenamiento, ajuste supervisado y optimización por preferencias (RLHF/DPO), y extendido a una ventana de contexto de un millón de tokens. Esta ficha no dispone de detalles adicionales del entrenamiento original más allá de lo que declara la model card del base; no se especifican el número exacto de tokens de preentrenamiento ni la composición del dataset.

La innovación de esta variante reside en el esquema de cuantización por bloques. Cada tensor lineal se mapea a un formato Tensix con exponente compartido por bloque: `bfloat4_b` emplea mantisa de 4 bits más exponente por bloque (4,5 bits efectivos por peso) y `bfloat8_b` mantisa de 8 bits más exponente (8,5 bits efectivos). Las proyecciones gate y up del MLP, que concentran gran parte de los parámetros y son menos sensibles, se llevan a BFP4 mediante GPTQ con búsqueda de exponente por bloque; atención (q, k, v, o) y la proyección down del MLP se mantienen en BFP8 por redondeo al más cercano. El LM head, los embeddings y las normas permanecen en bf16. Los pesos se guardan en safetensors en bf16 pero cada valor ya cae exactamente en la rejilla destino, de forma que TT-NN los empaqueta sin pérdida adicional. La calibración de GPTQ usó 65.536 tokens de WikiText-2 y de Wikipedia en coreano, lo que explica que la evaluación de fidelidad incluya texto en inglés y coreano.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) compatible con el formato Qwen.
- Razonamiento y respuesta a instrucciones heredados del ajuste instruct del modelo base.
- Generación de código y matemáticas, tal como corresponde a la familia Qwen2.5-Instruct (no se aportan benchmarks específicos en esta variante).
- Procesamiento de contexto muy largo: hasta 1.000.000 de tokens, adecuado para documentos extensos y conversaciones con historial amplio.
- Capacidades multilingües del base Qwen2.5, aunque la model card declara únicamente `en` para esta variante.
- No se declara soporte explícito de tool calling ni de function calling en la model card de esta variante; dichas capacidades dependen del modelo base.
- No se declara modo thinking, visión ni audio.
- Empaquetado directo en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con verificación de integridad de la rejilla BFP incluida en el repositorio.

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso principal. Un operador con Wormhole o Blackhole puede cargar el checkpoint y empaquetar cada matriz con `ttnn.as_tensor` en `bfloat4_b` o `bfloat8_b` sin recuantizar en el dispositivo, reduciendo el peso de 29,54 GB a 13,76 GB en DRAM.
- Inferencia de contexto largo en hardware de aceleración: la ventana de 1M tokens permite procesar contratos, expedientes o bases de código completas en una sola pasada sobre NPU, donde el ahorro de memoria por peso es determinante.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz empaquetada coincide bit a bit con el tensor de origen, útil como test de regresión en CI para cadenas de compilación TT-NN.
- Servicio conversacional de bajo coste en memoria: con 13,76 GB empaquetados, el modelo cabe en aceleradores con DRAM moderada y mantiene la calidad conversacional del base, lo que lo hace apto para asistentes internos con presupuesto de memoria ajustado.
- Investigación en cuantización de bloque: el checkpoint sirve como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a BFP8 y frente a esquemas de 4 bits tipo Q4_K_M, con métricas de KL y top-1 publicadas.
- Evaluación de fidelidad multilingüe: al estar calibrado con WikiText-2 y Wikipedia en coreano, es un banco de pruebas para medir la degradación de cuantizaciones en idiomas distintos del inglés.
- Prototipado en simulador: al estar probado en ttsim (simulador de Blackhole), permite desarrollar y depurar kernels TT-NN sin disponer de silicio físico.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad frente a BF16, no calidad de tarea. KL y top-1 se calculan sobre 16.184 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. "Answers right" corresponde a 33 prompts cortos con comprobación automática; "Lost" indica respuestas correctas en BF16 que fallan aquí.

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct-1M) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4/BFP8) | 7,45 | 13,756 | 0,07850 | 91,29 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,07403 | 90,14 | 31 de 33 | 0 |

Criterio de aceptación declarado por el autor: KL media no superior a 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional. El resultado es 1,06 veces la KL de Q4_K_M y 0 respuestas perdidas frente a 0. No se han publicado mediciones de velocidad ni de throughput en dispositivo.

## Requisitos de hardware

- VRAM/DRAM: 13,76 GB empaquetados en formatos BFP4/BFP8; el repositorio ocupa 29,5 GB porque los safetensors se almacenan en bf16.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Validación: ttnn 0.81.1 sobre ttsim (simulador de Blackhole); el autor indica explícitamente que no se ha probado en hardware real.
- GPU consumer: no es el objetivo del checkpoint. La carga vía `transformers` con `dtype="bfloat16"` y `device_map="auto"` requiere del orden de 28-30 GB de memoria, por lo que no cabe en GPUs de 24 GB sin cuantización adicional; en ese caso conviene usar el base con GPTQ/AWQ o GGUF.
- Despliegue: `transformers` para inspección y pruebas; TT-NN/tt-metal para ejecución en Tensix. tt-transformers y tt-forge no se han ejecutado con este checkpoint según la model card.
- Latencia y throughput: no disponibles; no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este modelo (BFP4/BFP8 Tensix) | 14,77B | 1M | 7,45 | 13,76 GB | Apache 2.0 | Hugging Face, validado en simulador |
| Qwen2.5-14B-Instruct-1M (BF16) | 14,77B | 1M | 16 | 29,54 GB | Apache 2.0 | Hugging Face |
| Q4_K_M del mismo base (llama.cpp) | 14,77B | 1M | 4,87 | 8,988 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |
| Qwen2.5-14B-Instruct (sin extensión 1M) | 14,77B | 32.768 tokens (por defecto en la familia) | 16 | ~29 GB | Apache 2.0 | Hugging Face |

La comparación relevante es frente a Q4_K_M: este checkpoint ofrece mayor fidelidad (KL 0,0785 frente a 0,0740, prácticamente equivalente, con top-1 superior) a costa de un tamaño un 53 % mayor, a cambio de un formato nativo para TT-NN que evita recuantizar en el dispositivo. Frente al BF16, reduce el peso un 53 % con una KL media de 0,0785 y una pérdida de top-1 de 8,71 puntos porcentuales.

## Limitaciones y advertencias

- No validado en hardware Tensix real: las pruebas se hicieron con ttnn 0.81.1 sobre el simulador ttsim de Blackhole. El rendimiento y la corrección en Wormhole o Blackhole físico no están verificados.
- No compatible de forma nativa con GPUs: los pesos están en rejilla BFP4/BFP8 y el repositorio ocupa 29,5 GB; cargarlo en `transformers` exige ~30 GB de memoria y no aprovecha el empaquetado Tensix.
- Idiomas: la model card declara únicamente `en`, aunque la calibración incluyó Wikipedia en coreano y el base es multilingüe. No hay garantía formal para otros idiomas.
- Riesgo de alucinación: heredado del modelo base instruct; la cuantización no lo corrige y puede amplificarlo ligeramente en dominios sensibles.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; deben asumirse los del base Qwen2.5-14B-Instruct-1M.
- Pérdida de calidad medible: KL media de 0,0785 y top-1 del 91,29 % frente al 100 % de BF16. En tareas de alta precisión (código crítico, matemáticas exactas) conviene validar contra el BF16.
- Tooling: tt-transformers y tt-forge no se han ejecutado con este checkpoint; la integración con esos stacks no está garantizada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar `NOTICE` para los cambios introducidos por Xylolabs y la licencia del base.
- Fecha de creación del repositorio: 12 de noviembre de 2026; sin descargas ni likes en el momento de redactar esta ficha, lo que implica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M
- Revisión del base usada para la evaluación: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-1M/tree/620fad32de7bdd2293b3d99b39eba2fe63e97438
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-1M-Tensix-BFP4-GateUp/blob/main/LICENSE
- Paper referenciado en los tags (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
