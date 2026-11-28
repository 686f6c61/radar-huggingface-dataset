# Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP es una cuantizacion del modelo Qwen/Qwen2.5-7B-Instruct realizada por Xylolabs para su ejecucion en aceleradores Tenstorrent Tensix (NPUs). El modelo conserva la arquitectura y los pesos del transformer denso original de Qwen, pero aplica formatos de coma flotante por bloques (block floating point, BFP) especificos del hardware Tensix: bfloat4_b en las capas MLP y bfloat8_b en la atencion, manteniendo el resto en bf16. El objetivo es reducir el peso en memoria y el ancho de banda necesario para inferencia en hardware Tenstorrent, manteniendo una degradacion de calidad controlada y medida.

El modelo base Qwen2.5-7B-Instruct, desarrollado por el equipo Qwen de Alibaba, es un transformer decoder-only de 7.615.616.512 parametros con 28 capas, entrenado para instrucciones y conversacion multilingue. Esta version cuantizada esta pensada exclusivamente para el ecosistema Tenstorrent (tt-metal, ttnn, tt-forge), no para GPUs convencionales, y requiere el runtime y las herramientas de Tenstorrent para aprovechar los formatos BFP.

La relevancia actual radica en que ofrece una via practica de ejecutar un modelo de 7B en NPUs Tensix con un tamano empaquetado de 6,262 GB (frente a 15,23 GB en BF16) y una divergencia KL media respecto a BF16 de 0,0470, comparable a la de una cuantizacion Q4_K_M de llama.cpp (0,0369). Esta publicada bajo licencia Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (MLP bfloat4_b, atencion bfloat8_b, resto bf16); BFP8 (atencion y MLP bfloat8_b, resto bf16); BF16 sin cuantizar; Q4_K_M (llama.cpp) como referencia |
| Idiomas soportados | en (segun model card); el modelo base Qwen2.5 es multilingue, pero esta ficha solo declara ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpetas `bfp4/` y `bfp8/`), con metadatos `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento (PTQ) del transformer denso Qwen2.5-7B-Instruct. No se reentrena el modelo: se aplican formatos de coma flotante por bloques propios de Tenstorrent Tensix. En la carpeta `bfp4/`, las capas MLP se almacenan en bfloat4_b, la atencion en bfloat8_b y el resto de pesos en bf16. En `bfp8/`, atencion y MLP usan bfloat8_b y el resto queda en bf16. El repositorio incluye scripts `pack_tensix.py` y `verify_grid.py` de Xylolabs para empaquetar matrices y verificar la ida y vuelta de valores empaquetados.

La cuantizacion se evalua con divergencia KL media frente a BF16 sobre 16.104 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano). Los resultados son 0,0470 para BFP4 y 0,00158 para BFP8. El modelo base Qwen2.5-7B-Instruct fue entrenado por el equipo Qwen con datos multilingues y ajuste por instrucciones; la model card cita el blog de Qwen2.5 y el informe tecnico Qwen2. No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (uso de `apply_chat_template`).
- Generacion de codigo y matematicas (capacidades del modelo base Qwen2.5-7B-Instruct).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta cuantizacion; el modelo base Qwen2.5-7B-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmado en la informacion proporcionada para esta cuantizacion.
- Multilingue: la model card declara solo `en`; el modelo base es multilingue, pero la evaluacion KL incluye texto en coreano.
- Ejecucion en NPUs Tenstorrent Tensix mediante ttnn, tt-metal y tt-forge.
- No se mencionan capacidades de vision ni audio.

## Casos de uso

- Inferencia en hardware Tenstorrent: desplegar Qwen2.5-7B-Instruct en NPUs Tensix usando las carpetas `bfp4/` o `bfp8/`, con el runtime tt-metal v0.81.1 y `--use_hf_rope` en tt-transformers. Adecuado para entornos que ya disponen de aceleradores Tenstorrent y quieren evitar GPUs.
- Reduccion de huella de memoria en produccion: la variante BFP4 ocupa 6,262 GB empaquetados frente a 15,23 GB en BF16, lo que permite ajustar el modelo en memorias DRAM mas limitadas del acelerador.
- Servicio de chat y asistencia conversacional: usar el formato chat de Qwen2.5 con `apply_chat_template` para atender consultas multi-turno en ingles, con la calidad del modelo base y una degradacion KL medida de 0,0470.
- Generacion de codigo en pipelines internos: el modelo base Qwen2.5-7B-Instruct es competente en codigo; esta cuantizacion permite integrarlo en flujos de CI/CD que corran sobre NPUs Tenstorrent.
- Prototipado e investigacion en cuantizacion: comparar BFP4, BFP8, BF16 y Q4_K_M con las metricas KL publicadas y los scripts `pack_tensix.py` y `verify_grid.py` para estudiar el impacto del formato por bloques.
- Evaluacion de calidad de cuantizacion: usar la divergencia KL sobre WikiText-2 y Wikipedia coreana como referencia para decidir entre BFP4 (0,0470) y BFP8 (0,00158) segun la tolerancia a degradacion.
- Despliegue con tt-forge y torch.compile: ejecutar el modelo compilado con backend `tt` para inferencia de baja latencia en Tensix, segun el ejemplo de la model card.

## Benchmarks y rendimiento

| Formato | Tamano empaquetado (GB) | KL media vs BF16 | Notas |
|---|---|---|---|
| `bfp4/` (MLP bfloat4_b, atencion bfloat8_b) | 6,262 | 0,0470 | 16.104 posiciones, ingles y coreano |
| `bfp8/` (atencion y MLP bfloat8_b) | 9,114 | 0,00158 | 16.104 posiciones, ingles y coreano |
| BF16 (Qwen/Qwen2.5-7B-Instruct) | 15,23 | 0 | Referencia |
| Q4_K_M (llama.cpp) | 4,683 | 0,0369 | Referencia externa |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,262 GB empaquetados para BFP4 y 9,114 GB para BFP8; el peso en BF16 es de 15,23 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix, no GPUs convencionales.
- GPU recomendadas: no aplica; el modelo esta disenado para Tensix. No se dispone de datos de ejecucion en A100, H100 o RTX 4090.
- Cabe en consumer GPU: no disponible; la cuantizacion BFP es especifica de Tensix y no se declara compatible con CUDA.
- Opciones de despliegue: ttnn (tt-metal v0.81.1), tt-transformers con `--use_hf_rope`, tt-forge con `torch.compile(backend="tt")` y pjrt-plugin-tt 1.4.0; tambien carga en transformers con `dtype="bfloat16"` y `device_map="auto"` para inspeccion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP | 7,6B | no disponible | BFP4/BFP8 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen2.5-7B-Instruct (BF16) | 7,6B | no disponible | BF16 | Apache 2.0 | Hugging Face, uso general |
| Q4_K_M de Qwen2.5-7B-Instruct (llama.cpp) | 7,6B | no disponible | Q4_K_M | Apache 2.0 | Hugging Face / llama.cpp |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye otros modelos comparables. No se dispone de datos de rendimiento en tareas para establecer comparaciones cualitativas.

## Limitaciones y advertencias

- La cuantizacion BFP4 introduce una degradacion medible: KL media de 0,0470 frente a BF16, superior a la de BFP8 (0,00158) y ligeramente superior a Q4_K_M (0,0369).
- El modelo esta disenado para NPUs Tenstorrent Tensix; no se garantiza su funcionamiento eficiente en GPUs convencionales.
- La model card declara solo ingles como idioma soportado, aunque la evaluacion KL incluye coreano; el soporte multilingue del modelo base no se confirma para esta cuantizacion.
- Riesgo de alucinacion inherente al modelo base Qwen2.5-7B-Instruct; no se documentan mitigaciones adicionales.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero cada carpeta incluye su propio `LICENSE` y `NOTICE` con los cambios; es necesario revisarlos.
- Requiere versiones concretas de software (tt-metal v0.81.1, pjrt-plugin-tt 1.4.0) y la opcion `--use_hf_rope` en tt-transformers; incompatibilidades de version pueden impedir la ejecucion.
- Solo 173 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- No se publican benchmarks de tareas, latencia ni throughput, lo que dificulta estimar el rendimiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de codigo: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico Qwen2: https://arxiv.org/abs/2407.10671
