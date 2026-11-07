# ununununununununununununununununununun/umt5-xxl-encoder-phi-lattice-v2

## Resumen

`umt5-xxl-encoder-phi-lattice-v2` es un empaquetado cuantizado a 4 bits del codificador de texto `UMT5EncoderModel` que forma parte del pipeline de generación de vídeo `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`. Lo publica el usuario `ununununununununununununununununununun` como artefacto independiente, con el objetivo de reducir el coste de memoria del codificador de texto, que en el pipeline original es el componente residente más caro una vez empaquetado el transformer de Wan (761,65 MiB).

El modelo no genera vídeo por sí mismo: es un componente de codificación de prompts que transforma texto en embeddings que consume el transformer de difusión de Wan 2.1. La aportación es la cuantización "phi-lattice v2", un esquema de pesos de 4 bits (nibbles uint8 con escalas fp16 por grupo de 64) aplicado a 168 capas lineales, manteniendo el embedding de tokens en BF16.

Es relevante porque permite ejecutar el pipeline completo de Wan 2.1 T2V 1.3B en entornos con VRAM limitada: el codificador pasa de 21.670,55 MiB en FP32 a 4.349,61 MiB en disco y 4.349,48 MiB residentes en el modo `low_vram_4bit`, con una relación de compresión de 3,765x frente a BF16 en los pesos lineales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UMT5, 24 capas, d_model=4096, d_ff=10240) |
| Parametros totales | 4.630.511.616 pesos en capas lineales (168 capas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (nibbles uint8) con escalas fp16 por grupo de 64; embedding de tokens en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `umt5_xxl_encoder_phi_v2_packed_4bit.pt` (PyTorch), cargable con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

El codificador subyacente es un UMT5 (arquitectura T5 con vocabulario multilingüe de 256.384 tokens) de 24 capas, dimensión de modelo 4096 y dimensión feed-forward 10240. Este repositorio no entrena el modelo: solo aplica una cuantización post-entrenamiento sobre los pesos del `text_encoder/` original de Wan 2.1 T2V 1.3B. No se documenta información sobre datos de entrenamiento, número de tokens, composición del corpus ni procesos de RLHF o DPO, ya que el autor no los incluye en la model card.

La innovación técnica es el esquema "phi-lattice v2": 168 capas lineales (4.630.511.616 pesos) se almacenan como nibbles uint8 de 4 bits con escalas fp16 por grupo de 64, garantizando que todas las dimensiones `K % 64 == 0`. El embedding de tokens atado se mantiene en BF16 (2.002,72 MiB). El cargador `phi_loader.py` ofrece tres modos: `low_vram_4bit` (construye el árbol de módulos en el dispositivo `meta` y solo asigna las lineales empaquetadas más el embedding BF16, evitando una reserva FP32 de 22 GB), `unrolled_bf16` (materializa el codificador completo en BF16 con `strict=True`) y `triton_4bit` (sustituye las lineales por `PhiLUTGemmLinear` en CUDA). La calidad de la cuantización se mide con SQNR de 19,34 dB frente a los pesos FP32 originales, con un 12,31% de ceros exactos (570.201.211 pesos).

## Capacidades

- Codificación de texto a embeddings para el pipeline de difusión de Wan 2.1 T2V 1.3B.
- Procesamiento de prompts mediante el tokenizador UMT5 asociado (vocabulario de 256.384 tokens).
- Inferencia en tres modos de ejecución: 4 bits de bajo consumo de VRAM, BF16 desplegado y 4 bits acelerado con Triton en CUDA.
- Compatibilidad con `transformers` (`AutoTokenizer`) y con el ecosistema de Hugging Face Hub.
- No realiza generación de texto, razonamiento, código, matemáticas, visión, tool calling ni razonamiento multi-paso: es exclusivamente un componente de codificación.
- Capacidades multilingües: no documentadas en la model card, aunque la arquitectura UMT5 es multilingüe por diseño.

## Casos de uso

- Generación de vídeo texto-a-vídeo en GPUs de consumo: al reducir el codificador a 4.349,48 MiB residentes, el pipeline Wan 2.1 T2V 1.3B completo puede caber en tarjetas de 24 GB junto con el transformer empaquetado de 761,65 MiB y el VAE.
- Despliegue en servidores con VRAM ajustada: el modo `low_vram_4bit` evita la reserva transitoria de 22 GB en FP32, lo que permite arrancar el pipeline en máquinas donde la carga FP32 fallaría por OOM.
- Prototipado e investigación sobre cuantización de codificadores de texto: el checkpoint permite comparar SQNR, tasa de ceros y calidad de embeddings frente al original FP32 y frente a BF16.
- Integración en pipelines de inferencia con Triton: el modo `triton_4bit` sustituye las lineales por `PhiLUTGemmLinear` en CUDA para acelerar la codificación de prompts en producción.
- Evaluación de la degradación de calidad en T2V: al ser un componente aislado, permite medir el impacto de la cuantización del codificador sobre la fidelidad del vídeo generado sin modificar el resto del pipeline.
- Reproducibilidad y auditoría: el hash `sha256: 64c9b6a0fb5e4e83389859b1d7b76fbdbaf117ce1a7ae459b0fbb7ae897d40fb` y la carga segura con `weights_only=True` facilitan la verificación de artefactos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni métricas de T2V) en la información disponible. Los únicos datos cuantitativos publicados son de compresión y fidelidad de cuantización:

| Metrica | Valor |
|---|---|
| SQNR frente a FP32 original | 19,34 dB |
| Ceros exactos | 570.201.211 (12,31%) |
| Pesos lineales cuantizados | 4.630.511.616 en 168 capas |
| Tamano en disco | 4.349,61 MiB |
| Memoria residente (`low_vram_4bit`) | 4.349,48 MiB |
| Pesos lineales en 4 bits | 2.346,0 MiB (3,765x vs BF16) |
| Embedding de tokens (BF16) | 2.002,72 MiB |
| Bytes del checkpoint | 4.560.898.637 |

## Requisitos de hardware

- VRAM estimada para el codificador: 4.349,48 MiB residentes en modo `low_vram_4bit`; en modo `unrolled_bf16` requiere aproximadamente 10.835,27 MiB.
- VRAM del pipeline completo: el transformer de Wan empaquetado ocupa 761,65 MiB, por lo que el codificador sigue siendo el mayor coste residente.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el codificador aislado; para el pipeline completo se recomienda 24 GB o más (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, el codificador aislado en 4 bits cabe en tarjetas de 8 GB; el pipeline completo requiere al menos 16-24 GB según resolución y longitud del vídeo.
- Opciones de despliegue: cargador propio `phi_loader.py` con `transformers`; modo `triton_4bit` requiere CUDA y Triton. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `umt5-xxl-encoder-phi-lattice-v2` (este) | 4,63B lineales | no disponible | 4 bits phi-lattice v2 | apache-2.0 | Hugging Face |
| `ai-toolkit/umt5_xxl_encoder` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `google/umt5-xxl` | no disponible | no disponible | pesos originales | no disponible | Hugging Face |

La comparación se limita a variantes del mismo codificador UMT5; no se dispone de datos de rendimiento para establecer una comparación cuantitativa entre ellas.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings de texto para el pipeline de Wan 2.1; no puede usarse para tareas de lenguaje de forma autónoma.
- La cuantización introduce pérdida de fidelidad: SQNR de 19,34 dB frente a FP32 implica degradación medible en los embeddings, cuyo impacto sobre la calidad del vídeo generado no se documenta.
- El 12,31% de pesos son ceros exactos, lo que puede afectar a la representación de conceptos poco frecuentes en los prompts.
- La model card no documenta sesgos, riesgos de alucinación ni limitaciones idiomáticas; la cobertura multilingüe del UMT5 no está verificada para este empaquetado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-07: no hay evidencia de uso en producción ni validación comunitaria.
- El formato de pesos es un `.pt` propietario cargado mediante un script (`phi_loader.py`) descargado del propio repositorio; conviene auditar dicho script antes de ejecutarlo en entornos sensibles.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Wan 2.1 debe verificarse por separado en cuanto a sus propios términos.
- No se documenta soporte para herramientas de despliegue estándar (vLLM, TGI, llama.cpp), lo que limita su integración en infraestructuras existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/umt5-xxl-encoder-phi-lattice-v2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Codificador UMT5 original de Google: https://huggingface.co/google/umt5-xxl
- Variante ai-toolkit del codificador: https://huggingface.co/ai-toolkit/umt5_xxl_encoder
