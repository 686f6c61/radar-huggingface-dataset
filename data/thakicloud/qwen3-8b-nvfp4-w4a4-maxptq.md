# ThakiCloud/Qwen3-8B-NVFP4-W4A4-MaxPTQ

## Resumen

Qwen3-8B-NVFP4-W4A4-MaxPTQ es un checkpoint de Qwen3-8B cuantizado a NVFP4 (4 bits en pesos y activaciones) mediante NVIDIA ModelOpt 0.48.0 con la receta oficial de post-training quantization `NVFP4_DEFAULT_CFG`. Lo publica ThakiCloud como release de investigacion, orientado a validar el rendimiento de la cuantizacion FP4 nativa en hardware Blackwell (probado en una B200) con vLLM 0.32.0 sin plugins adicionales. El modelo base es Qwen/Qwen3-8B, un transformer denso de 8.190.735.360 parametros.

El interes practico es doble: reduce el checkpoint a 6,42 GB (0,39x el BF16) y, segun la model card, acelera la decodificacion en B200 (TPOT 2,50 ms frente a 3,71 ms del BF16) con un throughput a 32 de concurrencia 1,33x superior. A cambio, el autor documenta degradaciones medibles en conocimiento multilingue (especialmente chino, -4,5 pp en MMLU) y advierte de que no se han evaluado instrucciones, contexto largo, tool calling ni seguridad.

La relevancia ahora es que demuestra que el camino W4A4 (pesos y activaciones en 4 bits) funciona de extremo a extremo en vLLM sobre Blackwell: 144 de 144 unidades lineales ejecutan W4A4 sin fallbacks. No obstante, es un artefacto de investigacion con validacion acotada (un solo B200, modo thinking desactivado, decodificacion greedy) y no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado NVFP4 W4A4 con ModelOpt |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `max_model_len=8192`) |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16, escalas de bloque FP8 E4M3); `lm_head` y KV cache en BF16 |
| Idiomas soportados | en, zh, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (incluye `hf_quant_config.json` para ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El checkpoint parte del transformer denso Qwen3-8B (8.190 millones de parametros) y aplica cuantizacion post-training NVFP4 sobre pesos y activaciones: W4A4 con group size 16 y escalas de bloque FP8 E4M3. La cabeza de salida (`lm_head`) y la cache KV se mantienen en BF16. El autor indica que las 144 unidades lineales del modelo ejecutan la ruta W4A4 en vLLM 0.32.0 sobre Blackwell sin fallbacks ni plugins.

La calibracion se realizo con 192 secuencias de 512 tokens (64 por idioma) extraidas de Wikipedia 20231101 en/zh/ja, una eleccion distinta de la receta por defecto de NVIDIA (cnn_dailymail, 512 muestras). La cuantizacion se ejecuto con ModelOpt 0.48.0 y la configuracion `NVFP4_DEFAULT_CFG`. No se detalla en la informacion disponible ningun proceso de RLHF, DPO ni fine-tuning adicional sobre el modelo base; el artefacto es exclusivamente un checkpoint cuantizado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen3-8B.
- Razonamiento y matematicas: evaluado en GSM8K (solo ingles) con precision semantica del 92,91 %.
- Conocimiento multilingue: evaluado en MMLU (Global-MMLU) en en, zh, ja y ko.
- Soporte de tool calling: no evaluado en este checkpoint (la model card lo lista explicitamente como no medido).
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Modo thinking: el modelo base lo soporta, pero la validacion se hizo con `enable_thinking=False`; el modo thinking no esta evaluado.
- Vision y audio: no disponibles (modelo de texto).
- Contexto largo: no evaluado.

## Casos de uso

- Investigacion en cuantizacion FP4: banco de pruebas para medir el impacto de W4A4 frente a BF16 en un modelo de 8B, con gates de no inferioridad pre-registrados y metodologia reproducible.
- Despliegue de alto throughput en Blackwell: en escenarios con mucha concurrencia (32 peticiones simultaneas) el modelo ofrece 1,33x el throughput del BF16, adecuado para servicios de generacion de texto con presupuesto de VRAM ajustado.
- Servicio de chat en ingles, chino, japones y coreano: conversacion multi-turno en esos cuatro idiomas, siempre que se acepte la degradacion documentada en conocimiento (especialmente en chino, -4,5 pp).
- Razonamiento matematico basico en ingles: resolucion de problemas tipo GSM8K con precision semantica practicamente identica al BF16 (92,91 % frente a 92,38 %), util para asistentes de ejercicios o validacion de pipelines de evaluacion.
- Comparativa de checkpoints cuantizados: referencia para contrastar recetas de calibracion (Wikipedia multilingue frente a cnn_dailymail) y versiones de ModelOpt frente a otros artefactos NVFP4 como el de NVIDIA.
- Prototipado con vLLM: integracion directa mediante la API `LLM` de vLLM con `max_model_len=8192`, sin necesidad de plugins, para entornos de desarrollo sobre B200.
- Reduccion de huella de almacenamiento: el checkpoint de 6,42 GB facilita distribuir y versionar el modelo en pipelines de investigacion donde el BF16 (aprox. 16,4 GB) resulta incomodo.

## Benchmarks y rendimiento

Evaluacion en subconjunto sellado de Global-MMLU y GSM8K, decodificacion greedy, `enable_thinking=False`, vLLM 0.32.0. Gates de no inferioridad frente a BF16 con bootstrap pareado (10.000 remuestreos, limite inferior del IC al 95 %).

| Eje | n | BF16 | Este modelo | Delta pp [IC 95 %] | Gate |
|---|---|---|---|---|---|
| MMLU global | 4.100 | 65,63 | 62,93 | -2,71 [-3,83, -1,61] | -4,0 (pasa) |
| MMLU ko | 500 | 54,60 | 53,80 | -0,80 [-3,80, +2,20] | -5,0 (pasa) |
| MMLU ja | 1.200 | 59,75 | 58,50 | -1,25 [-3,33, +0,83] | -5,0 (pasa) |
| MMLU en (reportado) | 1.200 | 72,75 | 69,58 | -3,17 [-5,08, -1,25] | — |
| MMLU zh (reportado) | 1.200 | 69,00 | 64,50 | -4,50 [-6,50, -2,42] | — |
| Matematicas en, semantico | 564 | 92,38 | 92,91 | +0,53 [-1,42, +2,48] | -3,0 (pasa) |
| Matematicas en, formato estricto `Answer:` (reportado) | 564 | 91,13 | 88,48 | -2,66 [-5,32, 0,00] | — |
| Fallos de formato de respuesta (reportado) | 564 | 3,55 % | 6,56 % | +3,01 [+0,89, +5,14] | — |

Rendimiento en hardware (B200 x1, vLLM 0.32.0, mismo harness que BF16):

| Metrica | BF16 | Este modelo | Ratio |
|---|---|---|---|
| Decode TPOT | 3,71 ms | 2,50 ms | 0,67x |
| Throughput de salida a concurrencia 32 | referencia | 1,33x | 1,33x |
| TTFT | referencia | superior a BF16 (reportado, no optimizado) | — |

Comparacion con `nvidia/Qwen3-8B-NVFP4` (@`ccd10a8`) en el mismo subconjunto: MMLU global +0,29 pp [-0,81, +1,34], sin diferencia demostrada. El autor aclara que es una comparacion de checkpoints, no de algoritmos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 6,42 GB en disco; en ejecucion hay que sumar cache KV en BF16 y overhead de vLLM, por lo que el consumo real supera esa cifra (no se publica un valor exacto).
- GPU recomendadas: NVIDIA Blackwell con tensor cores FP4, validado en B200. La ruta W4A4 no funciona en GPUs anteriores a Blackwell.
- Cabe en GPU consumer: no disponible en la informacion proporcionada; el requisito de arquitectura Blackwell limita la compatibilidad a modelos de esa generacion.
- Opciones de despliegue: vLLM 0.32.0 (soporte nativo via `hf_quant_config.json`, sin plugin). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: TPOT de 2,50 ms y throughput de salida 1,33x el BF16 a concurrencia 32 en una B200; TTFT superior al BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiCloud/Qwen3-8B-NVFP4-W4A4-MaxPTQ | 8,19B | no disponible | NVFP4 W4A4 (ModelOpt 0.48.0) | apache-2.0 | Hugging Face, vLLM en Blackwell |
| nvidia/Qwen3-8B-NVFP4 | 8,19B (base Qwen3-8B) | no disponible | NVFP4 (calibracion cnn_dailymail, KV y version de ModelOpt distintas) | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3-8B (BF16) | 8,19B | no disponible | BF16 | apache-2.0 | Hugging Face |

Frente al checkpoint de NVIDIA, la comparacion en MMLU global no muestra diferencia demostrada (+0,29 pp, IC que cruza cero). Frente al BF16, las diferencias se detallan en la tabla de benchmarks.

## Limitaciones y advertencias

- Release de investigacion: validado solo en una B200, vLLM 0.32.0, thinking desactivado y decodificacion greedy.
- Sin evaluacion de seguridad, seguimiento de instrucciones (IFEval), contexto largo, tool calling, matematicas en coreano, calidad de generacion libre ni modo thinking.
- Mayor degradacion en conocimiento: chino -4,5 pp y ingles -3,2 pp en MMLU; estos ejes se reportaron pero no se sometieron a gate.
- El resultado de coreano tiene n=500 (IC de aprox. ±3 pp); no debe interpretarse como ausencia de degradacion.
- Peor adherencia al formato final `Answer:` (+3 pp de fallos de formato), aunque la precision matematica semantica se mantiene dentro del IC.
- El subconjunto de evaluacion procede de benchmarks publicos: no es un benchmark privado libre de contaminacion y no puede descartarse exposicion previa del modelo base.
- Requiere hardware Blackwell: no ejecuta la ruta W4A4 en GPUs anteriores.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan los del modelo base Qwen3-8B.
- Licencia apache-2.0, sin restricciones adicionales conocidas para uso comercial, aunque la validacion acotada desaconseja produccion sin evaluacion propia.
- El TTFT es superior al BF16 y no esta optimizado.

## Enlaces

- Hugging Face: https://huggingface.co/ThakiCloud/Qwen3-8B-NVFP4-W4A4-MaxPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint NVFP4 de NVIDIA (referencia comparativa): `nvidia/Qwen3-8B-NVFP4` (@`ccd10a8`)
- Global-MMLU: CohereLabs/Global-MMLU (Apache-2.0), Singh et al., 2024
- MMLU: Hendrycks et al., ICLR 2021
- GSM8K: openai/gsm8k (MIT), Cobbe et al., 2021
- MGSM: juletxara/mgsm (CC BY-SA 4.0), Shi et al., 2022
- Wikipedia 20231101: wikimedia/wikipedia (CC BY-SA 3.0 / GFDL)
- FineWeb / FineWeb-2: HuggingFaceFW (ODC-By 1.0)
