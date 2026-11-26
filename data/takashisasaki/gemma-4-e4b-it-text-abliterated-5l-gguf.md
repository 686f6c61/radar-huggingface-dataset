# TakashiSasaki/gemma-4-E4B-it-text-abliterated-5L-GGUF

## Resumen

`TakashiSasaki/gemma-4-E4B-it-text-abliterated-5L-GGUF` es una compilación en formato GGUF del modelo `google/gemma-4-E4B-it` a la que se le ha aplicado una ablación selectiva de comportamiento (abliteration) sobre cinco capas del transformer, además de eliminar los codificadores multimodales de visión y audio para dejar únicamente la torre de texto. El autor es TakashiSasaki, que publica el trabajo junto con un repositorio de investigación reproducible en GitHub. El objetivo es ofrecer una variante que reduzca drásticamente las negativas del modelo base ante peticiones que este rechaza por defecto, manteniendo la perplejidad y la calidad de razonamiento.

La intervención se aplica en BF16 nativo sobre el modelo original antes de la conversión a GGUF, mediante la técnica Arbitrary-Rank Ablation (ARA) de `heretic-llm` v2.1.0, limitada a las capas 24, 25, 29, 30 y 37 (5 de 42). Según la model card, esto reduce la tasa de rechazo en el conjunto MultiJail de 10 idiomas del 72,0 % (180/250) al 7,6 % (19/250), con una divergencia KL de 0,024441 frente al modelo base.

El paquete incluye además un modelo borrador auxiliar (`mtp-assistant`) para decodificación especulativa basada en Multi-Token Prediction (MTP), que acelera la generación entre 1,87x y 1,93x. El conjunto está pensado para ejecutarse en GPUs de 8 GB de VRAM, con `llama.cpp` b12751 o superior, y el autor lo valida en Windows 11 con una RTX 4070. El modelo base declara 7.463.013.674 parámetros y una licencia Gemma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), variante text-only; pesos GGUF convertidos con `llama.cpp` (`Gemma4Model`) |
| Parametros totales | 7.463.013.674 (modelo base, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens verificado en el autor (8.192 y 16.384 con cuantización KV `q8_0`); longitud máxima nativa del modelo base no disponible |
| Tipos de cuantizacion | `Q4_K_M` (principal), `mix-Q4KM-Q8` (10 tensores intervenidos en `Q8_0`); `IQ4_XS` evaluado pero descartado por degradación de PPL |
| Idiomas soportados | en, ja, zh, ko, id, th, vi, it, ar, sw |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors solo en el modelo base de origen) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4 con 7.463.013.674 parámetros. La variante publicada conserva únicamente la torre de texto: se han eliminado 666 tensores correspondientes a los codificadores de visión y audio durante la conversión a GGUF con `llama.cpp` b12751. No se ha reentrenado el modelo; la modificación consiste en una ablación de direcciones de activación aplicada en BF16 sobre las capas 24, 25, 29, 30 y 37, concretamente sobre los tensores `attn_output` y `ffn_down` de cada una.

La receta de ablación (5L Focused Trial 12) se seleccionó con Optuna y usa los parámetros `preserve_good_behavior_weight = 0.5387`, `steer_bad_behavior_weight = 0.00819`, `overcorrect_relative_weight = 0.9787` y `neighbor_count = 12`. La puerta de evaluación en inglés con `heretic` sobre 100 prompts arroja 2/100 negativas y una divergencia KL de 0,024441 respecto al modelo base. Además, el paquete incorpora un modelo borrador MTP (`Gemma4AssistantModel`, 49 tensores) que actúa como draft en decodificación especulativa mediante `--spec-type draft-mtp`, con una tasa de aceptación del 38,50 % en la variante `Q4_K_M` y del 40,27 % en la variante mixta.

## Capacidades

- Generación de texto conversacional multi-turno en 10 idiomas declarados (en, ja, zh, ko, id, th, vi, it, ar, sw).
- Razonamiento y resolución de problemas aritméticos básicos (el autor verifica el test del bate y la pelota con resultado correcto en la variante `Q4_K_M`).
- Reducción drástica de negativas: 7,6 % de rechazos en MultiJail frente al 72,0 % del base, manteniendo baja divergencia KL.
- Decodificación especulativa con modelo borrador MTP integrado, con aceleración de 1,87x–1,93x en `llama-server`.
- Compatibilidad con `llama.cpp` y endpoints compatibles (tag `endpoints_compatible`), con soporte de plantillas Jinja (`--jinja`).
- Capacidades multimodales (visión y audio) eliminadas deliberadamente: el modelo es solo texto.
- No se documenta soporte explícito de tool calling ni de flujos de agentes en la información disponible.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 8 GB: el modelo ocupa unos 3,56 GiB a contexto 8.192 y 4,00 GiB a 32.768 con la variante mixta, por lo que cabe en una RTX 4070 8 GB junto con el borrador MTP y deja margen para el sistema.
- Servicio de chat local de baja latencia: con MTP activo el servidor alcanza 119,17 t/s en `tg128` sobre una L4, adecuado para asistentes interactivos en una sola máquina.
- Investigación sobre alineación y robustez: el repositorio de GitHub incluye el informe de experimento y el script de reproducción, lo que permite replicar la ablación y comparar tasas de rechazo entre variantes.
- Evaluación comparativa de cuantizaciones: el autor publica PPL de WikiText-2 y resultados de MultiJail por variante (`Q4_K_M`, `mix-Q4KM-Q8`, `IQ4_XS` descartado), útil para decidir el equilibrio tamaño/calidad en producción.
- Generación de texto en idiomas de cobertura limitada en modelos pequeños (japonés, coreano, tailandés, vietnamita, indonesio, suajili), aprovechando la ventana de contexto de hasta 32.768 tokens.
- Pruebas de decodificación especulativa: el par `mtp-assistant-Q8_0` + modelo principal sirve como banco de pruebas para medir tasas de aceptación y ganancia de throughput en `llama.cpp`.
- Prototipado de pipelines de texto sin componente multimodal: al haberse eliminado los tensores de visión y audio, el modelo reduce el tamaño del repositorio a 10,8 GB y simplifica el despliegue en entornos solo texto.

## Benchmarks y rendimiento

Medidos por el autor en NVIDIA L4 (24 GB, Ada Lovelace SM 8.9) con `llama.cpp` b12751 (CUDA 12.8), `mtp-assistant-Q8_0.gguf`, `-fa on`, `ctx=8192`, `n_slots=4`:

| Variante | Tamano (MiB) | `pp512` / `tg128` (t/s) | PPL WikiText-2 | Servidor MTP OFF (VRAM) | Servidor MTP ON (VRAM, aceptacion) | Rechazos MultiJail 10 idiomas | Test bate-pelota |
|---|---|---|---|---|---|---|---|
| Base `Q4_K_M` sin modificar | 5069,49 | 7023,28 / 68,37 | 52,3827 ± 2,73 | 64,22 t/s (3466 MiB) | 113,29 / 124,02 t/s (3582 MiB) | 180/250 (72,0 %) | — |
| BF16 abliterado (pre-cuantizacion) | 14,9 GiB | — | 55,3953 ± 2,91 | — | — | 24/250 (9,6 %) (25,33 t/s) | — |
| `5L-FT12-Q4_K_M` (publicado) | 5041,55 | 7363,58 / 68,19 | 53,9559 ± 2,80 | 63,69 t/s (3440 MiB) | 119,17 t/s (1,87x, 3556 MiB, 38,50 %) | 19/250 (7,6 %) (90,71 t/s) | Correcto (0,10 USD) |

La variante mixta `mix-Q4KM-Q8` mantiene 10 tensores intervenidos en `Q8_0` y alcanza la mayor aceptación MTP (40,27 %), según la model card. La variante `IQ4_XS` se descartó por degradación de PPL (53,96 → 58,05) y fallo en razonamiento aritmético básico.

## Requisitos de hardware

- VRAM estimada: ~3,56 GiB a contexto 8.192 y ~3,66 GiB a 16.384 con `-ctk q8_0 -ctv q8_0 -fa on`; ~4,00 GiB a 32.768 con la variante mixta. La tabla PLE de embeddings se mantiene en RAM del host, no en VRAM.
- GPU validadas por el autor: NVIDIA L4 24 GB para benchmarks; objetivo declarado Windows 11 + RTX 4070 8 GB. Cabe en GPUs consumer de 8 GB en adelante (RTX 3060 Ti, 4060 Ti, 4070, 3070/3080 con margen).
- Despliegue: `llama.cpp` b12751 o superior con soporte de Gemma 4 y `--spec-type draft-mtp`; `llama-server` con `--jinja`. No se documentan recetas para vLLM, TGI u Ollama en la información disponible.
- Throughput medido en L4: 63,69 t/s sin MTP y 119,17 t/s con MTP en `tg128`; 7363,58 t/s en `pp512`. Latencia concreta por petición no publicada.
- Cuantizaciones disponibles: `Q4_K_M` (5,30 GB) y `mix-Q4KM-Q8` (5,35 GB); borradores MTP en `Q8_0` (98,65 MB) y `Q4_K_M` (77,23 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `TakashiSasaki/gemma-4-E4B-it-text-abliterated-5L-GGUF` | 7,46 B | hasta 32.768 verificado | gemma | GGUF | Abliterado, solo texto, MTP incluido |
| `google/gemma-4-E4B-it` (base) | 7,46 B | no disponible | gemma | safetensors, GGUF | Multimodal, 72,0 % de rechazos en MultiJail |
| Base `Q4_K_M` sin modificar (misma familia) | 7,46 B | 8.192 medido | gemma | GGUF | PPL 52,38; 68,37 t/s `tg128`; sin MTP |

La información disponible no incluye comparaciones con modelos de otras familias (Llama, Qwen, Mistral) del mismo tamaño, por lo que la comparativa se limita a las variantes publicadas y al modelo base.

## Limitaciones y advertencias

- La ablación reduce negativas de forma deliberada: el modelo puede producir contenido que el base rechazaría. No debe desplegarse en entornos con requisitos estrictos de moderación sin capas adicionales de filtrado.
- Solo texto: los codificadores de visión y audio se han eliminado; cualquier caso de uso multimodal fallará.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de producción.
- La PPL en WikiText-2 sube ligeramente respecto al base (53,96 frente a 52,38 en `Q4_K_M`), lo que indica una degradación pequeña pero medible.
- La variante `IQ4_XS` no se publica por pérdida de calidad; no se recomienda reutilizarla.
- El soporte MTP requiere `llama.cpp` b12751 o superior; versiones anteriores no cargarán el borrador ni el tipo `draft-mtp`.
- Idiomas cubiertos: 10 declarados; el castellano no figura en la lista, por lo que el rendimiento en español no está validado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Riesgo de alucinación inherente a un modelo de 7,46 B; no se han publicado evaluaciones de veracidad.

## Enlaces

- Hugging Face: https://huggingface.co/TakashiSasaki/gemma-4-E4B-it-text-abliterated-5L-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de investigación: https://github.com/TakashiSasaki/Abliteration
- README del repositorio: https://github.com/TakashiSasaki/Abliteration#readme
- Informe completo del experimento: https://github.com/TakashiSasaki/Abliteration/blob/main/EXPERIMENT_REPORT.md
- Script de reproducción: https://github.com/TakashiSasaki/Abliteration/blob/main/scripts/reproduce_gemma4_e4b_gguf_8gb.sh
- Copia de la model card: https://github.com/TakashiSasaki/Abliteration/blob/main/docs/HF_MODEL_CARD.md
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- `heretic-llm`: no disponible enlace directo en la información proporcionada
