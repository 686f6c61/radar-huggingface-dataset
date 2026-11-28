# Xylolabs/AREX-2-Tenstorrent-Tensix

## Resumen

AREX-2-Tenstorrent-Tensix es una distribucion cuantizada del modelo multimodal BAAI/AREX-2, publicada por Xylolabs, especificamente empaquetada para su ejecucion sobre aceleradores NPU de Tenstorrent basados en la arquitectura Tensix. El modelo base AREX-2, desarrollado por el Beijing Academy of Artificial Intelligence (BAAI), es un fine-tune orientado a agentes del modelo Qwen/Qwen3.8-27B, con un enfoque declarado en tareas de auto-mejora y razonamiento de horizonte largo. Esta version traslada esos pesos a formatos de bloque en coma flotante (block floating point, BFP) compatibles con el stack de software de Tenstorrent (tt-metal, ttnn, tt-forge).

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: proporciona pesos pre-cuantizados en bfloat4_b (BFP4) y bfloat8_b (BFP8) junto con utilidades de empaquetado y verificacion, de modo que el modelo pueda ejecutarse en hardware Tensix sin necesidad de cuantizar en el momento. El repositorio incluye dos carpetas de formatos con tamanos empaquetados de 17,596 GB (BFP4) y 30,963 GB (BFP8), ademas de scripts de empaquetado y verificacion.

El modelo base conserva la naturaleza multimodal (pipeline image-text-to-text) y una licencia Apache 2.0. La informacion disponible no detalla el numero de parametros del modelo base ni la longitud de contexto, aunque el nombre del modelo origen (Qwen3.8-27B) sugiere un orden de magnitud de 27 mil millones de parametros; este dato no aparece confirmado de forma explicita en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion, capas DeltaNet y MLP (segun nomenclatura de la model card); modelo base derivado de Qwen/Qwen3.8-27B |
| Parametros totales | no disponible (el modelo base se denomina Qwen3.8-27B, sin confirmacion explicita del recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (BFP4), bfloat8_b (BFP8); pesos restantes en bf16; referencia Q4_K_M para llama.cpp |
| Idiomas soportados | no disponible (la evaluacion KL cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetados para Tensix); carpetas bfp4/ y bfp8/ |

## Arquitectura y entrenamiento

El modelo base AREX-2 es un fine-tune de Qwen/Qwen3.8-27B orientado a agentes, descrito en el paper "AREX-2: Advancing Self-Improving Agents through Long-Horizon Reflective Tasks" (arXiv:2609.38288). La model card de esta distribucion menciona capas de atencion, DeltaNet y MLP como los modulos que se cuantizan a BFP4 o BFP8, mientras que el resto de pesos (incluida la LM head en el caso BFP4) permanece en bf16. La presencia de DeltaNet sugiere una arquitectura hibrida que combina atencion clasica con mecanismos de estado recurrente lineal, si bien la informacion proporcionada no detalla la composicion exacta de las capas ni los datos de entrenamiento (numero de tokens, mezcla del dataset, uso de RLHF o DPO).

La innovacion tecnica principal de esta publicacion es el pipeline de cuantizacion block floating point para NPUs Tensix, implementado en el repositorio tensix-bfp-gptq. El proceso empaqueta cada matriz en formatos bfloat4_b o bfloat8_b y ofrece verificacion de ida y vuelta (round-trip) a traves de la DRAM del dispositivo mediante los scripts pack_tensix.py y verify_grid.py. La calidad de la cuantizacion se mide con divergencia KL frente a BF16 sobre 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), tanto en texto plano como con plantilla de chat, con un limite de KL medio fijado en 1,5 veces la referencia Q4_K_M.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta orientado a tareas de agente y razonamiento reflexivo de horizonte largo.
- Procesamiento multimodal image-text-to-text, segun el pipeline declarado en Hugging Face.
- Capacidades de agente y auto-mejora derivadas del fine-tune AREX-2 sobre Qwen3.8-27B.
- Ejecucion en hardware Tenstorrent Tensix mediante el stack tt-metal (ttnn, tt-forge).
- Soporte de dos niveles de precision (BFP4 y BFP8) seleccionables por carpeta.
- Compatibilidad con transformers para generacion de texto en CPU/GPU (ejemplo de codigo incluido en la model card).
- Soporte multilingue: no confirmado; la evaluacion KL incluye ingles y coreano, pero no se declara la lista de idiomas soportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso de uso principal es ejecutar un modelo de gran tamano en NPUs Tensix usando los pesos ya empaquetados en BFP4 o BFP8, evitando cuantizar en produccion y aprovechando el demo text_demo.py del checkout de tt-metal v0.81.1.
- Inferencia de bajo consumo en BFP4: con 17,596 GB empaquetados, la variante BFP4 permite alojar el modelo en un espacio de memoria reducido, adecuado para entornos con restricciones de DRAM en el dispositivo.
- Mayor fidelidad con BFP8: cuando la precision importa mas que el tamano, la carpeta BFP8 (30,963 GB, KL medio de 0,00082) ofrece una degradacion muy baja frente a BF16 y sirve para evaluaciones de calidad o tareas sensibles.
- Investigacion en cuantizacion: los scripts pack_tensix.py y verify_grid.py permiten reproducir el empaquetado y validar la fidelidad de cada matriz, util para estudiar el impacto de BFP4/BFP8 en modelos multimodales.
- Prototipado de agentes multimodales: el pipeline image-text-to-text del modelo base permite construir asistentes que procesan imagenes y texto, aprovechando el fine-tune orientado a agentes.
- Validacion de pipelines de despliegue: el repositorio incluye verificacion round-trip a traves de DRAM del dispositivo, lo que facilita integrar el modelo en CI de hardware antes de pasar a produccion.
- Comparacion de precisiones: al incluir referencias Q4_K_M y BF16 con sus KL medios, el artefacto sirve como banco de pruebas para decidir el formato segun el presupuesto de error aceptable.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). El unico dato de rendimiento disponible es la divergencia KL frente a BF16, que se resume a continuacion:

| Formato | Tamano empaquetado (GB) | KL medio vs BF16 |
|---|---|---|
| bfp4/ | 17,596 | 0,03640 |
| bfp8/ | 30,963 | 0,00082 |
| BF16 (BAAI/AREX-2) | 53,79 | 0 |
| Q4_K_M (llama.cpp) | 16,547 | 0,02480 |

Las mediciones cubren 16.240 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, con un limite de KL medio de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM/memoria del dispositivo: BFP4 requiere aproximadamente 17,6 GB empaquetados; BFP8, aproximadamente 31,0 GB; BF16 de referencia, 53,79 GB.
- Hardware objetivo: NPUs Tenstorrent basadas en Tensix, con el stack tt-metal (version de referencia v0.81.1) y las librerias ttnn y tt-forge.
- GPU consumer: no disponible; la model card no confirma ejecucion en GPUs de consumo, aunque el ejemplo de transformers usa device_map="auto" con dtype bfloat16.
- Opciones de despliegue: demo text_demo.py del checkout de tt-metal v0.81.1 (ruta models/demos/qwen38_27b_qb2), transformers para generacion de texto, y llama.cpp como referencia de cuantizacion Q4_K_M.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AREX-2-Tenstorrent-Tensix (este) | no disponible (base Qwen3.8-27B) | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face, 173 descargas |
| BAAI/AREX-2 (base) | no disponible (base Qwen3.8-27B) | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (origen) | no disponible (denominacion 27B) | no disponible | BF16 y otras | no disponible | Hugging Face |
| Q4_K_M (llama.cpp) | no disponible | no disponible | Q4_K_M | Apache 2.0 (derivada) | Referencia de cuantizacion en la model card |

No se dispone de datos de rendimiento en tareas para comparar con alternativas; la unica metrica comparable es el KL medio frente a BF16.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda los sesgos y limitaciones del modelo base BAAI/AREX-2 y de Qwen3.8-27B.
- La cuantizacion BFP4 introduce una divergencia KL media de 0,03640, superior a la referencia Q4_K_M (0,02480); puede degradar tareas sensibles a la precision.
- La evaluacion de calidad se limita a texto en ingles y coreano; no hay evidencia publicada sobre otros idiomas.
- No se declaran explicitamente los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingues o de contexto largo.
- El hardware objetivo es Tenstorrent Tensix; fuera de ese ecosistema el uso requiere el ejemplo de transformers o herramientas externas no documentadas en esta ficha.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio LICENSE y NOTICE que deben revisarse.
- El repositorio pesa 106,0 GB en total; la descarga selectiva por carpeta (--include "bfp4/*") es necesaria para evitar transferencias innecesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper AREX-2: https://arxiv.org/abs/2609.38288
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/AREX-2-Tenstorrent-Tensix/blob/main/LICENSE
