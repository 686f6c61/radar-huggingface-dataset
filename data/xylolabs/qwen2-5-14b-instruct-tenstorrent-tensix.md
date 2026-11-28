# Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix

## Resumen

Qwen2.5-14B-Instruct-Tenstorrent-Tensix es una distribucion cuantizada del modelo Qwen2.5-14B-Instruct de Alibaba Qwen, adaptada por Xylolabs para su ejecucion en aceleradores NPU de Tenstorrent basados en la arquitectura Tensix. El modelo base es un transformer decoder-only denso de 14.700 millones de parametros, disenado para generacion de texto e instrucciones, y esta publicado bajo licencia Apache 2.0.

El problema que resuelve esta variante es la brecha entre los pesos originales en BF16 y el hardware Tensix, que opera de forma nativa con formatos de bloque en coma flotante (block floating point, BFP). Xylolabs aplica un pipeline de cuantizacion post-entrenamiento (GPTQ adaptado a BFP) que genera dos carpetas independientes: `bfp4/` y `bfp8/`, cada una con sus propios metadatos de formato por capa (`quant4.json`) y scripts de empaquetado para tt-metal y tt-transformers.

Es relevante ahora porque permite desplegar un modelo de 14B en NPUs de Tenstorrent con una perdida de calidad medida y acotada (KL medio de 0,00248 para BFP8 y 0,10044 para BFP4 frente a BF16), reduciendo el peso empaquetado de 29,54 GB en BF16 a 17,154 GB en BFP8 y 13,756 GB en BFP4. La ficha se centra en los artefactos publicados en este repositorio; el modelo base conserva sus capacidades originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-14B-Instruct) |
| Parametros totales | 14.700 millones (14,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | BFP4 (bfloat4_b en gate/up del MLP; bfloat8_b en atencion y down del MLP; resto bf16) y BFP8 (bfloat8_b en atencion y MLP; resto bf16); pesos base en BF16 |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 es multilingue, pero este repo declara solo ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con indice `model.safetensors.index.json` y metadatos `quant4.json` por carpeta; disenado para ttnn (tt-metal) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion multi-cabeza estandar, capas MLP con proyecciones gate, up y down, y normalizacion RMSNorm. No hay innovaciones arquitectonicas propias de Xylolabs; el trabajo de este repositorio es exclusivamente de cuantizacion y empaquetado para hardware.

El proceso de cuantizacion es un GPTQ adaptado a formatos block floating point de Tensix (repositorio `tensix-bfp-gptq`). Cada carpeta incluye un `quant4.json` que especifica el formato por capa, de modo que el runtime de tt-metal puede cargar cada matriz con el tipo `ttnn.bfloat4_b` o `ttnn.bfloat8_b` segun corresponda. La validacion de calidad se realizo midiendo la divergencia KL frente a BF16 sobre 16.104 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), tanto en texto plano como aplicando la plantilla de chat, con un limite de KL medio de 1,5 veces la referencia Q4_K_M de llama.cpp. Los scripts `pack_tensix.py` y `verify_grid.py` permiten empaquetar las matrices y verificar el round-trip a traves de la DRAM del dispositivo. No se documentan datos de entrenamiento adicionales ni fine-tuning por RLHF/DPO en este repositorio; esos detalles pertenecen al modelo base.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen2.5-14B-Instruct.
- Razonamiento y matematicas: capacidades del modelo base, no reentrenadas ni modificadas por la cuantizacion.
- Generacion de codigo: soportada por el modelo base, aunque este repositorio no incluye evaluaciones especificas.
- Soporte de tool calling / function calling: heredado del modelo base (Qwen2.5-Instruct incorpora plantillas para ello), no verificado en esta variante cuantizada.
- Razonamiento multi-paso y uso como agente: posible por herencia del modelo base; no hay validacion publicada en este repo.
- Capacidades multilingues: la model card declara solo `en`; el modelo base es multilingue, pero esta distribucion no garantiza el mismo comportamiento fuera del ingles.
- Modo thinking, vision o audio: no disponible en esta variante (el modelo base es solo texto).

## Casos de uso

- Despliegue en NPUs Tenstorrent: cargar la carpeta `bfp8/` o `bfp4/` con tt-metal v0.81.1 y tt-transformers para servir generacion de texto en hardware Tensix, aprovechando el formato nativo bfloat8_b/bfloat4_b y evitando conversiones en tiempo de ejecucion.
- Inferencia de 14B en entornos con memoria limitada: la carpeta `bfp4/` ocupa 13,756 GB empaquetados frente a 29,54 GB en BF16, lo que permite alojar el modelo completo en dispositivos con DRAM mas ajustada.
- Servicio de chat en ingles: usar la plantilla de chat con `apply_chat_template` para asistentes conversacionales multi-turno, apoyandose en la calidad medida (KL medio 0,00248 en BFP8) para mantener respuestas cercanas al modelo original.
- Evaluacion comparativa de precision: emplear las dos carpetas como referencia para medir el impacto de BFP4 frente a BFP8 en una tarea concreta antes de fijar el formato de produccion, usando `quant4.json` para inspeccionar el formato por capa.
- Investigacion en cuantizacion para aceleradores: reproducir el pipeline de `tensix-bfp-gptq` y los scripts `pack_tensix.py` y `verify_grid.py` para validar el round-trip de matrices en DRAM del dispositivo y estudiar la relacion entre formato de bloque y divergencia KL.
- Prototipado con `transformers` en CPU/GPU: cargar la carpeta `bfp8/` con `AutoModelForCausalLM` y `dtype="bfloat16"` para comparar salidas antes de migrar la carga a ttnn, ya que el repo incluye instrucciones para ambos flujos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la divergencia KL frente a BF16:

| Formato | Tamano empaquetado (GB) | KL medio a BF16 |
|---|---|---|
| `bfp4/` | 13,756 | 0,10044 |
| `bfp8/` | 17,154 | 0,00248 |
| BF16 (Qwen2.5-14B-Instruct) | 29,54 | 0 |
| Q4_K_M (llama.cpp) | 8,988 | 0,0923 |

La medicion cubre 16.104 posiciones de ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat, con limite de KL medio de 1,5 veces la referencia Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 13,756 GB empaquetados para `bfp4/` y 17,154 GB para `bfp8/`; el BF16 de referencia ocupa 29,54 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix, con tt-metal v0.81.1 y tt-transformers (flag `--use_hf_rope`).
- GPU convencionales: no es el objetivo del repo; la carga con `transformers` en `dtype="bfloat16"` requiere memoria suficiente para los pesos en BF16 (aproximadamente 29,54 GB), por lo que no cabe en GPUs de consumo de 24 GB sin cuantizacion adicional.
- Opciones de despliegue: tt-metal/tt-transformers (ruta principal), `transformers` con `device_map="auto"` para validacion, y llama.cpp solo como referencia de comparacion (formato Q4_K_M, no incluido en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el repo menciona un test de rendimiento `performance and batch-1` en `simple_text_demo.py` sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix | 14,7B | no disponible | BFP4/BFP8 para Tensix | Apache 2.0 | Hugging Face (147 descargas) |
| Qwen/Qwen2.5-14B-Instruct | 14,7B | no disponible | BF16 safetensors | Apache 2.0 | Hugging Face (modelo base) |
| Q4_K_M de llama.cpp (referencia de calidad) | 14,7B | no disponible | GGUF Q4_K_M, 8,988 GB | Apache 2.0 (heredada) | Referencia usada en la model card |

No se dispone de datos de benchmarks de tareas que permitan comparar rendimiento cualitativo con otras alternativas; la comparacion disponible se limita a tamano, formato y divergencia KL.

## Limitaciones y advertencias

- La model card declara unicamente ingles (`en`); no se garantiza el comportamiento multilingue del modelo base en esta distribucion.
- La cuantizacion BFP4 introduce una divergencia KL media de 0,10044, superior a la de BFP8 (0,00248); para tareas sensibles a la precision conviene validar BFP4 antes de produccion.
- El repo esta atado a versiones concretas de software (tt-metal v0.81.1, `--use_hf_rope`); cambios de version pueden romper la carga o el rendimiento.
- Los scripts `pack_tensix.py` y `verify_grid.py` asumen rutas y estructura de carpetas concretas; requieren adaptacion si se mueven los pesos.
- No se publican evaluaciones de sesgo, alucinacion ni seguridad para esta variante; se heredan los riesgos del modelo base Qwen2.5-14B-Instruct.
- El modelo base puede alucinar y no debe usarse como fuente de verdad sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio `LICENSE` y `NOTICE` que deben conservarse.
- El tamano del repo (56,0 GB) incluye ambas carpetas; descargar solo la necesaria con `--include` para ahorrar espacio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix/blob/main/LICENSE
