# Xylolabs/granite-4.2-30b-Tenstorrent-Tensix

## Resumen

Xylolabs/granite-4.2-30b-Tenstorrent-Tensix es una cuantizacion del modelo ibm-granite/granite-4.2-30b de IBM, adaptada especificamente para su ejecucion en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs, que publica los pesos ya empaquetados en formato block-floating-point de 4 bits (bfloat4_b), junto con las herramientas `pack_tensix.py` y `verify_grid.py` para validar el empaquetado sobre hardware real.

El modelo base es un transformer denso de 30.000 millones de parametros de la familia Granite 4.2 de IBM, con licencia Apache 2.0 y soporte declarado para doce idiomas (entre ellos el castellano). Esta version no anade capacidades nuevas: su proposito es reducir el peso en disco y en memoria de 58,55 GB (BF16) a 17,651 GB, manteniendo una divergencia de distribucion (KL) de 0,09391 frente al original, dentro del umbral de 1,5 veces la referencia Q4_K_M de llama.cpp.

Es relevante ahora porque permite desplegar un modelo de 30B en aceleradores de inferencia de bajo consumo de Tenstorrent, una alternativa a las GPU convencionales, y porque el repositorio incluye la ruta completa de empaquetado, verificacion y ejecucion con `ttnn`, lo que facilita reproducir el proceso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base ibm-granite/granite-4.2-30b); pesos empaquetados para NPU Tensix |
| Parametros totales | 30.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (BFP4) en atencion y MLP; resto en bf16 |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `bfp4/`, empaquetado BFP4) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del transformer denso Granite 4.2 de 30B de IBM. Xylolabs aplica su propio pipeline `tensix-bfp-gptq`, basado en GPTQ, para convertir las matrices de atencion y de las capas MLP al formato block-floating-point bfloat4_b nativo de Tensix; el resto de tensores permanece en bf16. El empaquetado respeta el layout TILE de `ttnn` y se valida con un round-trip a traves de `ttnn.as_tensor` y `ttnn.to_torch`, de modo que los valores empaquetados coinciden bit a bit con los originales en punto flotante.

No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni innovaciones de decodificacion. La unica innovacion tecnica descrita es el propio esquema de cuantizacion BFP4 con verificacion de fidelidad mediante KL sobre 16.216 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en plantilla plana y de chat.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas en doce idiomas, incluido el castellano.
- Generacion de codigo y matematicas (capacidades heredadas del modelo base Granite 4.2).
- Ejecucion sobre NPU Tensix (Wormhole, Blackhole) mediante `ttnn` y `tt-metal`.
- Compatibilidad con `transformers` para inspeccion y ejecucion en GPU/CPU con `device_map="auto"`.
- Soporte de tool calling y agentes: no confirmado en la informacion proporcionada (depende del modelo base).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar los pesos `bfp4/` en una NPU Wormhole o Blackhole para servir generacion de texto con un consumo de memoria de aproximadamente 17,65 GB, muy por debajo de los 58,55 GB en BF16.
- Sustitucion de GPU en entornos de borde: usar Tensix como alternativa a GPU cuando el coste energetico o la disponibilidad de hardware son limitantes, manteniendo un modelo de 30B.
- Verificacion de cuantizaciones en CI: ejecutar `pack_tensix.py` y `verify_grid.py` con `--device` para validar que el empaquetado BFP4 reproduce los pesos originales antes de promocionar un artefacto.
- Investigacion en cuantizacion de bajo bit: comparar la KL de BFP4 (0,09391) con la de Q4_K_M (0,07629) sobre el mismo conjunto de evaluacion para estudiar el compromiso tamano/fidelidad.
- Prototipado multilingue: probar el modelo en castellano, aleman, frances, japones, arabe, checo, italiano, coreano, neerlandes y chino con la plantilla de chat oficial.
- Benchmarking de hardware: medir latencia y throughput de un 30B en Tensix frente a GPU, usando el mismo checkpoint y la misma tokenizacion.

## Benchmarks y rendimiento

| Metrica | bfp4 (Tensix) | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 17,651 | 58,55 | 17,721 |
| KL medio a BF16 | 0,09391 | 0 | 0,07629 |

La KL se calcula sobre 16.216 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), en plantilla plana y de chat, con un limite de 1,5 veces la KL de Q4_K_M. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria para inferencia: aproximadamente 17,65 GB con los pesos BFP4 empaquetados; 58,55 GB si se carga el modelo base en BF16.
- Aceleradores objetivo: NPU Tenstorrent Wormhole y Blackhole (Tensix), mediante `ttnn` y `tt-metal`.
- GPU convencionales: el ejemplo de la model card usa `transformers` con `dtype="bfloat16"` y `device_map="auto"`, por lo que requiere memoria suficiente para BF16 (no confirmado para BFP4 fuera de Tensix).
- GPU consumer: no confirmado; 17,65 GB empaquetados quedan por encima de la VRAM de una RTX 4090 (24 GB) solo si se desempaqueta a bf16, lo que no cabe.
- Opciones de despliegue: `ttnn`/`tt-metal` en Tensix; `transformers` para inspeccion; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/granite-4.2-30b-Tenstorrent-Tensix | 30B | no disponible | BFP4 safetensors | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| ibm-granite/granite-4.2-30b | 30B | no disponible | BF16 safetensors | Apache 2.0 | GPU/CPU |
| granite-4.2-30b Q4_K_M (llama.cpp) | 30B | no disponible | GGUF | Apache 2.0 | CPU/GPU consumer |

La comparativa se limita al mismo modelo base en distintos formatos; no se dispone de datos de rendimiento en tareas para comparar con otras familias.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una divergencia medible (KL 0,09391) superior a la de Q4_K_M (0,07629); puede degradar tareas sensibles a precision numerica.
- El formato esta pensado para Tensix; fuera de ese hardware la ruta de ejecucion no esta documentada y el ejemplo de `transformers` carga en bf16, lo que anula el ahorro de memoria.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma especificas de esta variante; deben consultarse en la model card del modelo base.
- La licencia es Apache 2.0, pero el repositorio del modelo base no incluye fichero LICENSE; el autor aporta el texto estandar y un NOTICE con los cambios.
- El repositorio se renombro el 2026-11-27 desde `granite-4.2-30b-Tenstorrent-Tensix-BFP4`; las rutas antiguas pueden fallar.
- Uso comercial permitido por licencia, pero la validacion en produccion debe incluir la verificacion con `verify_grid.py`.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-4.2-30b-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Codigo del pipeline: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-4.2-30b-Tenstorrent-Tensix/blob/main/LICENSE
