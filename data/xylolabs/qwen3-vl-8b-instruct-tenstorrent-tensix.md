# Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix

## Resumen

Qwen3-VL-8B-Instruct-Tenstorrent-Tensix es una cuantizacion del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicada por Xylolabs y optimizada especificamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer vision-language de 8.000 millones de parametros que procesa entradas de imagen y texto y genera texto. Esta version no introduce cambios en el modelo original: reempaqueta los pesos en formatos de coma flotante de bloque (bfloat4_b para las capas MLP y bfloat8_b para la atencion) para que puedan ejecutarse sobre hardware Tensix.

La relevancia de esta ficha reside en que demuestra la viabilidad de desplegar un VLM de 8B en aceleradores no-GPU con perdida de calidad medida y acotada. El autor reporta una divergencia KL media frente a BF16 de 0,0253 para el paquete bfp4, inferior a la de una cuantizacion Q4_K_M de llama.cpp (0,0323). El paquete ocupa 7,152 GB empaquetado, frente a los 16,38 GB del modelo en BF16.

El repositorio tiene 31,4 GB en total e incluye utilidades de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) procedentes del proyecto tensix-bfp-gptq v0.1.0. La licencia es Apache 2.0, heredada del modelo base. La model card declara soporte de idiomas en y ko, aunque el modelo base Qwen3-VL-Instruct es multilingue por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL); torre de vision en BF16 + decoder cuantizado |
| Parametros totales | 8.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (MLP), bfloat8_b (atencion), bf16 (resto); referencia Q4_K_M para comparacion |
| Idiomas soportados | en, ko (declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `bfp4/`), con utilidades de empaquetado para Tensix |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-8B-Instruct es un transformer multimodal que combina una torre de vision con un decoder de lenguaje. Esta version de Xylolabs no reentrena ni modifica el modelo: aplica una cuantizacion de coma flotante de bloque (BFP) especifica para Tensix sobre los pesos del decoder. Concretamente, las capas MLP se almacenan en `bfloat4_b` (4 bits de mantisa con exponente compartido por bloque) y las capas de atencion en `bfloat8_b` (8 bits de mantisa), mientras que el resto de pesos permanece en BF16. La torre de vision se mantiene en BF16 sin cuantizar, segun indica la model card.

El autor reporta una divergencia KL media frente al modelo en BF16 de 0,0253 para el paquete `bfp4`, frente a 0,0323 de una cuantizacion Q4_K_M de llama.cpp. El paquete empaquetado ocupa 7,152 GB. La model card menciona que "las 17 preguntas de imagen usan este decoder con la torre de vision en BF16 del modelo base", lo que sugiere una evaluacion cualitativa sobre un conjunto reducido de preguntas visuales, aunque no se detalla la metodologia completa ni el conjunto de datos. No se dispone de informacion sobre los datos de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto e image-text-to-text: el pipeline declarado es `image-text-to-text`, con soporte de descripcion de imagenes y respuesta a preguntas visuales.
- Razonamiento multimodal: heredado del modelo base Qwen3-VL-Instruct.
- Procesamiento de imagenes por URL o locales mediante `AutoProcessor` y `apply_chat_template`.
- Soporte multilingue limitado en la model card a en y ko; el modelo base es multilingue pero esta ficha no documenta el resto de idiomas.
- Ejecucion en hardware Tensix (Wormhole, Blackhole) mediante las utilidades de empaquetado incluidas.
- Compatibilidad con `transformers` (`AutoModelForImageTextToText`) para inferencia en GPU/CPU con `device_map="auto"`.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio, thinking mode ni decodificacion especulativa.

## Casos de uso

- Descripcion automatica de imagenes en pipelines de accesibilidad: el modelo puede generar descripciones de una frase o parrafos a partir de una URL de imagen, como muestra el ejemplo de la model card, integrable en servicios de alt text.
- Despliegue en aceleradores Tenstorrent: el paquete `bfp4` esta pensado para ejecutarse en NPU Wormhole o Blackhole, lo que permite inferencia VLM sin GPU NVIDIA, util en entornos con restricciones de suministro o de consumo energetico.
- Prototipado de asistentes visuales en `transformers`: la carga directa con `AutoModelForImageTextToText` y `device_map="auto"` permite validar el modelo en GPU convencional antes de portarlo a Tensix.
- Investigacion sobre cuantizacion BFP: el repositorio incluye metricas de divergencia KL y herramientas de verificacion (`verify_grid.py`), utiles para estudiar el impacto de bfloat4_b/bfloat8_b en la calidad.
- Evaluacion comparativa de cuantizaciones: la model card ofrece una referencia Q4_K_M (5,028 GB, KL 0,0323) que permite comparar tecnicas de compresion sobre el mismo modelo base.
- Educacion y demos de vision-lenguaje: el ejemplo de codigo incluido facilita demostraciones de VQA y captioning con un unico comando de descarga.
- Integracion en entornos embebidos o edge con NPU: el tamano empaquetado de 7,152 GB y el soporte de Tensix lo hacen candidato para despliegues en hardware de bajo consumo, aunque la viabilidad depende de la memoria disponible en el dispositivo.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Solo se reportan metricas de fidelidad de cuantizacion:

| Paquete | Formato | Tamano empaquetado (GB) | KL media vs BF16 |
|---|---|---|---|
| `bfp4/` | MLP bfloat4_b; atencion bfloat8_b; resto bf16 | 7,152 | 0,0253 |
| BF16 (original) | BF16 | 16,38 | 0 |
| Q4_K_M (llama.cpp) | Q4_K_M | 5,028 | 0,0323 |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB de pesos, mas overhead de activaciones y cache KV; en la practica requiere una GPU de 24 GB o superior (RTX 3090/4090, A6000, L40S) para comodidad.
- VRAM estimada para el paquete `bfp4`: 7,15 GB de pesos empaquetados; la carga en `transformers` con `dtype="bfloat16"` puede expandir los pesos en memoria, por lo que el consumo real depende de la implementacion.
- GPU recomendadas: A100, H100, L40S, RTX 4090 para la variante `transformers`; el objetivo principal son las NPU Tensix Wormhole y Blackhole de Tenstorrent.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion adicional, aunque no se documenta oficialmente.
- Opciones de despliegue: `transformers` (`AutoModelForImageTextToText`), utilidades Tensix (`pack_tensix.py`, `verify_grid.py`); no se documenta soporte de vLLM, TGI, Ollama o llama.cpp para este paquete concreto (la referencia Q4_K_M es solo comparativa).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix | 8B | no disponible | Apache 2.0 | safetensors BFP4/BFP8, Tensix | Cuantizacion para NPU Tenstorrent; KL 0,0253 |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8B | no disponible | Apache 2.0 | safetensors BF16 | Modelo original, sin cuantizar; 16,38 GB |
| Qwen3-VL-8B-Instruct en Q4_K_M (llama.cpp) | 8B | no disponible | Apache 2.0 | GGUF Q4_K_M | Referencia de cuantizacion; 5,028 GB, KL 0,0323 |

No se dispone de datos de rendimiento en tareas que permitan comparar cualitativamente con otros VLM de 8B (por ejemplo, Llama-3.2-11B-Vision o InternVL). La comparacion se limita a formatos y fidelidad de cuantizacion.

## Limitaciones y advertencias

- La model card declara solo en y ko como idiomas soportados, aunque el modelo base es multilingue; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente al modelo base Qwen3-VL-Instruct; no se han publicado evaluaciones de fidelidad en esta cuantizacion.
- La evaluacion de calidad se limita a una divergencia KL media y a "17 preguntas de imagen"; no hay benchmarks de tareas que confirmen el rendimiento en produccion.
- El paquete esta optimizado para Tensix; su uso en GPU requiere cargar los pesos con `transformers`, lo que puede no aprovechar el formato BFP y expandir el consumo de memoria.
- La licencia Apache 2.0 se aplica al modelo base, pero la model card indica que el repositorio base no tenia fichero de licencia y que el `LICENSE` incluido es el texto estandar de Apache 2.0; conviene revisar `NOTICE` para los cambios.
- Las utilidades `pack_tensix.py` y `verify_grid.py` se distribuyen bajo Apache 2.0 (`CODE_LICENSE`) y corresponden a tensix-bfp-gptq v0.1.0.
- El repositorio se renombro el 2026-11-27 (antes `...-Tensix-BFP4`) y los pesos se actualizaron ese mismo dia; verificar la version antes de desplegar.
- No se documentan limitaciones especificas de contexto, sesgos ni restricciones de uso comercial mas alla de la licencia Apache 2.0.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-VL-8B-Instruct-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL: https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
