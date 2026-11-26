# ununununununununununununununununununun/umt5-xxl-encoder-phi-lattice-v2

## Resumen

`umt5-xxl-encoder-phi-lattice-v2` es un empaquetado cuantizado a 4 bits del codificador de texto `UMT5EncoderModel` que forma parte del pipeline `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`. Lo publica el usuario `ununununununununununununununununununun`, que aplica su esquema propio de cuantizacion denominado `phi-lattice v2` sobre los pesos del codificador original en FP32. El objetivo es reducir el coste residente del codificador dentro de un pipeline de generacion de video texto-a-video, donde el transformador de difusion de Wan ya ha sido empaquetado por separado y el codificador UMT5-XXL seguia siendo el principal consumidor de memoria.

El modelo no es un generador de texto ni un LLM: es exclusivamente el componente de codificacion de prompts de Wan 2.1. Su relevancia practica esta en que permite ejecutar el pipeline completo de Wan2.1-T2V-1.3B en GPUs de menor VRAM, al pasar de 21.670,55 MiB en FP32 a 4.349,61 MiB en disco y 4.349,48 MiB residentes en el modo `low_vram_4bit`. La arquitectura subyacente es un encoder T5 (24 capas, `d_model=4096`, `d_ff=10240`, vocabulario de 256.384 tokens) con 4.630.511.616 pesos en capas lineales cuantizados.

La licencia es Apache 2.0 y el repo pesa 4,8 GB. El modelo esta pensado para integrarse en `transformers` y en el ecosistema de difusion de Wan, no para uso como modelo de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo T5 (UMT5EncoderModel), 24 capas, `d_model=4096`, `d_ff=10240` |
| Parametros totales | 4.630.511.616 pesos en capas lineales cuantizadas (mas embedding BF16 de 2.002,72 MiB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizador y del pipeline Wan; la model card no fija un maximo) |
| Tipos de cuantizacion | 4 bits uint8 nibbles con escalas fp16 de grupo 64; embedding atado en BF16; modo `low_vram_4bit` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `umt5_xxl_encoder_phi_v2_packed_4bit.pt` (4.560.898.637 bytes, sha256 `64c9b6a0...`) cargable con `torch.load(..., weights_only=True)`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El codificador es el `UMT5EncoderModel` original de Wan2.1-T2V-1.3B, sin reentrenamiento: la model card no reporta fine-tuning, RLHF ni DPO. Lo que cambia es el empaquetado. Las 168 capas lineales (4.630.511.616 pesos) se almacenan como nibbles uint8 con escalas fp16 por grupo de 64, y el embedding de tokens atado se mantiene en BF16 (2.002,72 MiB). Todas las capas cuantizadas cumplen `K % 64 == 0`, y como T5 no tiene sesgos lineales, el archivo no incluye ninguno.

La innovacion tecnica es el esquema `phi-lattice v2` y el modo de carga `low_vram_4bit`, que construye el arbol de modulos sobre el dispositivo `meta` y asigna solo las lineales empaquetadas mas el embedding BF16, evitando pasar por una reserva FP32 de 22 GB. El resultado son 4.349,48 MiB residentes frente a 21.670,55 MiB del original. La model card reporta SQNR de 19,34 dB frente a los pesos FP32, un 12,31% de ceros exactos (570.201.211) y una verificacion de que los 242 tensores originales coinciden estructuralmente.

## Capacidades

- Codificacion de prompts de texto para el pipeline de generacion de video Wan2.1-T2V-1.3B.
- Generacion de embeddings de texto compatibles con el transformador de difusion de Wan.
- Carga en modo `low_vram_4bit` con asignacion minima de memoria.
- Carga estandar con `torch.load(..., weights_only=True)`.
- Compatibilidad con `transformers` y con el ecosistema de difusion de Wan.
- No es un modelo generativo de texto: no responde a prompts ni produce lenguaje.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues explicitas ni modo de pensamiento.

## Casos de uso

- Generacion de video texto-a-video en GPUs de VRAM limitada: sustituyendo el codificador FP32 por este empaquetado se liberan unos 17 GB de memoria residente, lo que permite ejecutar Wan2.1-T2V-1.3B en tarjetas donde el pipeline completo no cabria.
- Despliegue en entornos de inferencia con presupuesto de memoria estricto: el modo `low_vram_4bit` evita la reserva transitoria de 22 GB, util en servidores con varios pipelines cargados.
- Prototipado e investigacion en generacion de video: permite iterar sobre prompts y semillas con un coste de memoria reducido, manteniendo una similitud coseno de hidden states entre 0,9392 y 0,9771 frente al codificador FP32.
- Pipelines combinados con el transformador empaquetado: junto con `wan2.1-t2v-1.3b-phi-lattice-v2` forma el pipeline completo `phi`, con PSNR frente al original entre 12,54 y 14,13 dB segun escena.
- Pruebas de aislamiento del codificador: la model card documenta un harness de comparacion (A/B/C) util para evaluar el impacto de la cuantizacion en la calidad final del video.
- Evaluacion de esquemas de cuantizacion: el paquete sirve como referencia reproducible del metodo `phi-lattice v2` para otros encoders T5 en pipelines de difusion.

## Benchmarks y rendimiento

La model card no publica benchmarks clasicos (MMLU, HumanEval, GSM8K), pero si metricas de fidelidad del empaquetado y de calidad end-to-end.

| Metrica | Valor |
|---|---|
| SQNR de pesos dequantizados vs FP32 | 19,34 dB |
| Coseno de pesos dequantizados vs FP32 | 0,9942 |
| Coseno de embedding BF16 y normas vs FP32 | 0,9999986 |
| Tensores verificados | 242 / 242 |
| Ceros exactos | 570.201.211 (12,31%) |
| Coseno de hidden states (4 prompts) | 0,9440 / 0,9694 / 0,9771 / 0,9392 |
| Max \|Δ\| de hidden states | 0,327 / 0,351 / 0,485 / 1,737 |

Comparacion end-to-end en Wan2.1-T2V-1.3B (832x480, 65 frames, 25 pasos, guidance 5,0, semillas identicas):

| Escena (semilla) | B vs A (aislamiento de encoder) | C vs A (pipeline phi completo) |
|---|---|---|
| Tokyo neon walk (77) | PSNR 16,88 dB / SSIM 0,6009 / MAE 17,25 / TC 0,2820 | PSNR 14,13 dB / SSIM 0,4400 |
| Snow leopard (202) | PSNR 14,30 dB / SSIM 0,5322 | PSNR 12,54 dB / SSIM 0,4731 |
| Corals and sea turtle (309) | PSNR 19,42 dB / SSIM 0,8317 | PSNR 12,74 dB / SSIM 0,6241 |

## Requisitos de hardware

- VRAM estimada: 4.349,48 MiB residentes en modo `low_vram_4bit`; en disco 4.349,61 MiB. El original FP32 requiere 21.670,55 MiB.
- GPU recomendadas: cualquier GPU con al menos ~4,3 GB libres para el codificador; el pipeline completo depende tambien del transformador de difusion de Wan.
- Cabe en GPUs de consumo con 6-8 GB o mas, siempre que el resto del pipeline quepa en la VRAM restante.
- Opciones de despliegue: `transformers` con carga via `torch.load(..., weights_only=True)`; integracion en el pipeline de difusion de Wan; el modo `low_vram_4bit` es especifico del paquete.
- No se documentan latencia ni throughput concretos. La model card menciona un harness ZeroGPU (`phi-verification-lab`, Tab 7) pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `umt5-xxl-encoder-phi-lattice-v2` | 4,63B lineales + embedding BF16 | no disponible | `.pt` 4-bit | Apache 2.0 | Codificador empaquetado para Wan2.1-T2V-1.3B |
| `UMT5EncoderModel` original (Wan2.1-T2V-1.3B) | mismos pesos | no disponible | FP32 shards | Apache 2.0 | 21.670,55 MiB residentes |
| Mismos tensores en BF16 | mismos pesos | no disponible | BF16 | Apache 2.0 | 10.835,27 MiB residentes |
| `wan2.1-t2v-1.3b-phi-lattice-v2` (transformador) | no disponible | no disponible | 4-bit | Apache 2.0 | Empaquetado complementario del transformador de difusion |

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: SQNR de 19,34 dB y coseno de pesos de 0,9942 frente a FP32; el coseno de hidden states baja hasta 0,9392 en el peor caso documentado.
- La calidad del video generado se degrada de forma medible: en el pipeline completo, PSNR frente al original cae a 12,54-14,13 dB y SSIM a 0,44-0,62.
- El maximo \|Δ\| de hidden states llega a 1,737 en el prompt de la tortuga marina, lo que indica desviaciones locales no despreciables.
- El paquete esta atado al pipeline Wan2.1-T2V-1.3B; no es un codificador T5 de proposito general y no se garantiza su uso fuera de ese contexto.
- No se documentan idiomas soportados, sesgos ni comportamiento multilingue.
- No se documentan riesgos de alucinacion porque el modelo no genera texto.
- El formato `.pt` requiere `torch.load(..., weights_only=True)`; no hay safetensors ni GGUF, lo que limita la integracion con `llama.cpp` u otras herramientas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El modelo tiene 261 descargas y 1 like en el momento de la ficha; es un artefacto de investigacion con validacion limitada por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/umt5-xxl-encoder-phi-lattice-v2
- Transformador empaquetado complementario: https://huggingface.co/ununununununununununununununununununun/wan2.1-t2v-1.3b-phi-lattice-v2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Assets de comparacion (grids y videos A/B/C): https://huggingface.co/ununununununununununununununununununun/umt5-xxl-encoder-phi-lattice-v2/resolve/main/assets/
- No se han encontrado papers, blogs ni repositorios adicionales en la informacion disponible.
