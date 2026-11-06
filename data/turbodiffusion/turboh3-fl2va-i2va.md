# TurboDiffusion/TurboH3-FL2VA-I2VA

## Resumen

TurboH3-FL2VA-I2VA es un transformer de difusión destilado mediante DMD (Distribution Matching Distillation) a partir de MiniMax-H3 FL2VA, el modelo de generación de vídeo con audio sincronizado de MiniMax. Lo publica el proyecto TurboDiffusion (THU-ML) como derivado independiente, no como lanzamiento oficial de MiniMax, y su propósito es reducir drásticamente el número de pasos de denoising: el schedule verificado emplea cinco puntos sigma, lo que se traduce en cuatro actualizaciones de denoising frente a los muchos pasos que requiere el modelo original.

El repositorio contiene el transformer DMD completo en BF16 (33.122.992.896 parámetros, unos 61,73 GiB repartidos en 34 shards de safetensors) y una exportación W8A8 en INT8 de 20,36 GiB pensada para los kernels cuantizados nativos de TurboDiffusion. No incluye el text encoder, los VAE de vídeo y audio, el procesador ni el tokenizador: estos se descargan desde una revisión fijada de MiniMaxAI/MiniMax-H3. Tampoco es un bundle autónomo de `DiffusionPipeline.from_pretrained`.

Su relevancia es doble. Por un lado, demuestra la viabilidad de llevar un modelo de vídeo-audio de escala media-alta a regímenes de pocos pasos con calidad funcional aceptable. Por otro, su licencia (MiniMax H3 Community License Agreement) excluye territorios como la UE, el Reino Unido, Corea del Sur y Estados Unidos, lo que condiciona seriamente su uso comercial en España.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (DiT) con destilación DMD; clase `MiniMaxH3Transformer3DModel` |
| Parámetros totales | 33.122.992.896 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | BF16 (referencia), W8A8 INT8 (bloques de peso 128x128) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | safetensors (BF16 e INT8); 626 tensores BF16 + 12 tensores FP32 de entrada/salida y time-embedding |
| Tarea | image-text-to-video (I2VA: imagen a vídeo con audio) |
| Tamaño del repo | 88,3 GB |
| Modelo base | MiniMaxAI/MiniMax-H3 (FL2VA) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para vídeo con audio sincronizado, derivado del checkpoint FL2VA de MiniMax-H3 y destilado con DMD (Distribution Matching Distillation). La destilación es lo que permite colapsar el muestreo a cuatro actualizaciones de denoising: el schedule verificado es `i2va / steps=5 / video_shift=12 / audio_shift=3`, con cinco puntos sigma. El checkpoint BF16 conserva 626 tensores en BF16 y 12 tensores de entrada/salida y time-embedding en FP32 (unos 66 MiB), respetando las precisiones originales.

La innovación operativa principal es la tabla AdaLN (`adaln/`, 102 MiB), generada con el MLP de timestep en FP32 del checkpoint fuente y almacenada en BF16. Esta tabla está especializada para estos pesos, la tarea I2VA y los shifts indicados, y no debe reutilizarse con otro schedule. La exportación W8A8 cuantiza las 200 proyecciones QKV, de salida de atención y MLP del bloque principal con `Int8Linear` de TurboDiffusion; mantiene los tensores FP32 de entrada/salida/timestep y las frecuencias RoPE, y omite los pesos AdaLN, por lo que debe usarse junto con `adaln/`. La procedencia del export está registrada: commit `bfe1067819d09faa6d9ce0eee47de6cb520205d9` (PR #144), PyTorch `2.11.0+cu128`, CUDA 12.8, RTX 5090. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset de destilación.

## Capacidades

- Generación de vídeo a partir de imagen y texto (image-text-to-video) con audio sincronizado.
- Generación de audio asociada al vídeo en la misma pasada del transformer.
- Muestreo en cuatro actualizaciones de denoising con el schedule verificado (`steps=5`, `video_shift=12`, `audio_shift=3`).
- Inferencia en BF16 (referencia de calidad) o en W8A8 INT8 con kernels cuantizados nativos.
- Decodificación de vídeo con proyecciones W8A8 aplicadas a los pesos públicos del VAE en el arranque; la decodificación del VAE de audio permanece en FP32.
- Dependencia externa de SpargeAttn para la atención.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo textual más allá del prompt de condicionamiento.

## Casos de uso

- Prototipado rápido de vídeo generativo: con cuatro actualizaciones de denoising, el coste por muestra cae frente al modelo base de muchos pasos, lo que permite iterar sobre prompts e imágenes de entrada en entornos de investigación con una sola GPU de gama alta.
- Animación de imágenes fijas con audio: a partir de una imagen y un prompt de texto se obtiene un clip con pista de audio sincronizada, útil para previsualizaciones de storyboard o contenido para redes.
- Evaluación de técnicas de destilación: sirve como caso de estudio reproducible de DMD aplicado a un DiT de vídeo-audio, con manifest de checksums y procedencia del export documentada.
- Integración en pipelines de TurboDiffusion: el repositorio está pensado para el downloader `turbodiffusion.inference.download_h3`, que fija revisiones y verifica tamaño y SHA256 de cada fichero contra `manifest.json`.
- Despliegue cuantizado en INT8: la exportación W8A8 de 20,36 GiB reduce la huella de memoria del transformer y encaja en flujos con kernels `Int8Linear`, a costa de posibles cambios en los resultados generados.
- Investigación sobre licencias de modelos generativos: el caso ilustra restricciones territoriales (exclusión de UE, Reino Unido, Corea del Sur y EE. UU.) que afectan a la viabilidad de proyectos en España.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el modelo BF16 DMD se evaluó sobre cinco casos de prueba I2VA a 768p, una evaluación funcional pequeña que no constituye una validación exhaustiva de calidad, seguridad o audio, y que no se reclama paridad sin pérdidas con el modelo FL2VA original de muchos pasos.

## Requisitos de hardware

- VRAM estimada: el transformer BF16 ocupa unos 61,73 GiB en disco, por lo que la inferencia en BF16 requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o sharding multi-GPU; el export W8A8 de 20,36 GiB reduce sustancialmente el requisito del transformer, aunque hay que sumar el text encoder y los VAE descargados de MiniMax-H3.
- GPU recomendadas: A100 80GB o H100 para BF16; el export W8A8 se generó en una RTX 5090, lo que indica viabilidad en GPU consumer de gama alta con la cuantización INT8.
- GPU consumer: no cabe en BF16 en tarjetas de 24 GB; en INT8 es plausible en RTX 5090 y, con margen ajustado, en GPUs de 32 GB o más, siempre sumando los componentes auxiliares.
- Despliegue: implementación de TurboDiffusion para H3 (documentación `docs/h3_i2va.md`), con downloader `python -m turbodiffusion.inference.download_h3` y exportador `turbodiffusion.inference.export_h3_w8a8`; no es un bundle `DiffusionPipeline.from_pretrained` y no todas las versiones de Diffusers incluyen `MiniMaxH3Transformer3DModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboH3-FL2VA-I2VA | 33,1 B | DiT vídeo+audio destilado DMD | 4 actualizaciones (schedule verificado) | MiniMax H3 Community (excluye UE, UK, KR, US) | Hugging Face, repo de 88,3 GB |
| MiniMaxAI/MiniMax-H3 (FL2VA) | no disponible en la información | DiT vídeo+audio original | muchos pasos | MiniMax H3 Community | Hugging Face (modelo base) |
| Alternativas de vídeo-audio de la misma escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Evaluación funcional mínima: solo cinco casos de prueba I2VA a 768p; no hay evaluación exhaustiva de calidad, seguridad ni audio.
- No se reclama paridad sin pérdidas con el modelo FL2VA original de muchos pasos ni mejoras de velocidad específicas de Wan.
- La conversión W8A8 puede alterar los resultados generados; el transformer BF16 es la referencia.
- La tabla AdaLN es específica de estos pesos, la tarea y los shifts; reutilizarla con otro schedule produce resultados incorrectos.
- El repositorio no incluye text encoder, VAE de vídeo y audio, procesador ni tokenizador; sin descargarlos desde MiniMax-H3 el modelo no es funcional.
- Dependencia externa de SpargeAttn.
- Licencia restrictiva: la MiniMax H3 Community License Agreement excluye territorios como la UE, el Reino Unido, Corea del Sur y Estados Unidos, e incluye condiciones de uso y comerciales adicionales; debe revisarse el LICENSE completo antes de descargar, usar o redistribuir. En España aplica la exclusión territorial de la UE.
- Los resultados generados deben identificarse como generados por IA según los términos upstream.
- No hay información sobre sesgos, riesgo de alucinación visual o cobertura idiomática.
- El repositorio no tiene descargas ni likes en el momento de la consulta y es un derivado no oficial, sin soporte de MiniMax.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TurboDiffusion/TurboH3-FL2VA-I2VA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio TurboDiffusion: https://github.com/thu-ml/TurboDiffusion
- Publicación original del derivado: https://huggingface.co/liran12345/h3-turbo-diffusion
- Documentación de inferencia H3: `docs/h3_i2va.md` dentro del repositorio TurboDiffusion
- Licencia: fichero `LICENSE` del repositorio (MiniMax H3 Community License Agreement)
- Atribución: fichero `NOTICE` del repositorio
