# whitelok/seedvr2-hybricprecision-3b

## Resumen

EZVR Flash V1 (identificador interno `seedvr2-3b-bf16-512-v1`) es una conversión específica de aplicación de los pesos del modelo SeedVR2 3B de ByteDance Seed, empaquetada por el usuario `whitelok` para su uso en EZVideoRepair sobre Apple Silicon. No se trata de un modelo entrenado de forma independiente ni de una versión oficial de ByteDance, sino de una extracción de tensores y recualificación a BF16 a partir de una conversión GGUF Q4_K_M, orientada a restauración y mejora de vídeo e imagen (video-to-video, image-restoration).

El modelo subyacente, SeedVR2 3B, es un Diffusion Transformer (DiT) de aproximadamente 3.000 millones de parámetros diseñado para restauración de vídeo de un solo paso, con un VAE asociado para codificación y decodificación de fotogramas. Esta conversión concreta separa los parámetros del DiT, del encoder VAE y del decoder VAE en cuatro ficheros safetensors (unos 7,79 GB en total), más metadatos de compatibilidad y procedencia.

Su relevancia es acotada: no es un modelo de propósito general ni un pipeline Diffusers autónomo, sino un paquete de pesos que solo funciona con los grafos de red fijos que proporciona la aplicación EZVideoRepair. Resulta útil para usuarios de esa aplicación en Mac con chip Apple que necesiten restaurar vídeo localmente, pero no es sustituible por versiones arbitrarias de SeedVR2 ni sirve para otras tareas de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con VAE encoder/decoder, base SeedVR2 |
| Parametros totales | ~3B (modelo base SeedVR2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de restauración de vídeo, no de texto) |
| Tipos de cuantizacion | Pesos exportados en BF16; origen derivado de GGUF Q4_K_M |
| Idiomas soportados | no disponible (no aplica; modelo visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16): `dit-1.safetensors`, `encode-1.safetensors`, `decode-1.safetensors`, `postprocess.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es SeedVR2 3B, un Diffusion Transformer para restauración de vídeo que opera en un solo paso sobre fotogramas codificados por un VAE. El paquete incluye por separado los parámetros del DiT (`dit-1.safetensors`), del encoder VAE (`encode-1.safetensors`) y del decoder VAE (`decode-1.safetensors`), más un contenedor vacío para el grafo de postprocesado (`postprocess.safetensors`), que no tiene parámetros con nombre.

No se ha realizado entrenamiento adicional: la model card indica explícitamente que la conversión, el cambio de dtype y la extracción de parámetros no constituyen un entrenamiento nuevo ni una mejora de calidad. El origen es una conversión GGUF Q4_K_M (`AInVFX/SeedVR2_comfyUI`, atribuida a `cmeka/SeedVR2-GGUF`), reexportada a BF16; la propia model card advierte que convertir pesos cuantizados a BF16 no recupera la precisión perdida en la cuantización original. Los datos de entrenamiento del modelo base no se detallan en la información disponible; el campo `datasets` de la model card referencia `datasocial/tiktok-5.6B-videos`, pero no se especifica su papel en el entrenamiento. Tampoco se documentan detalles de RLHF, DPO ni innovaciones técnicas adicionales en esta conversión.

## Capacidades

- Restauración y mejora de vídeo (video-to-video) mediante el pipeline de EZVideoRepair.
- Restauración de imagen, según los tags del repositorio (`image-restoration`).
- Upscaling y reparación de vídeo de un solo paso con el DiT de SeedVR2.
- Codificación y decodificación de fotogramas mediante los módulos VAE incluidos.
- Integración exclusiva con los grafos de red fijos de la aplicación EZVideoRepair (no es un pipeline Diffusers autónomo).
- Verificación de integridad de los cuatro ficheros safetensors contra el catálogo SHA256 de la aplicación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.

## Casos de uso

- Restauración de vídeo local en Mac con Apple Silicon: el paquete está pensado para EZVideoRepair, que selecciona el directorio de modelos y ejecuta los grafos fijos sobre los pesos BF16, aprovechando la aceleración del chip sin depender de CUDA.
- Limpieza de metraje antiguo o comprimido: el DiT de SeedVR2 está diseñado para reparar artefactos de compresión y ruido en vídeo, por lo que encaja en flujos de digitalización de archivo doméstico.
- Mejora de clips para redes sociales: útil para reescalar y restaurar material de baja resolución antes de publicarlo, con procesamiento totalmente local y sin subir el contenido a servicios externos.
- Preprocesado en pipelines de edición: los fotogramas restaurados pueden alimentar etapas posteriores de montaje o corrección de color, ya que el modelo devuelve vídeo decodificado por el VAE incluido.
- Reparación de imágenes fijas: los tags `image-restoration` permiten usar el mismo paquete para restaurar fotografías o fotogramas extraídos, dentro de la aplicación compatible.
- Flujos de trabajo sin conectividad: al ser pesos locales verificados por SHA256, es adecuado para entornos aislados donde no se permite descargar modelos en tiempo de ejecución.
- Evaluación de la conversión BF16 frente al GGUF Q4_K_M original: útil para comparar calidad visual y consumo de memoria en Apple Silicon, aunque sin expectativa de mejora de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de PSNR, SSIM, LPIPS ni comparativas cuantitativas; el campo `metrics: dvitel/codebleu` del metadata no se corresponde con una evaluación de restauración de vídeo y no se documenta su uso.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Los cuatro safetensors suman aproximadamente 7,79 GB en BF16, por lo que se requiere memoria unificada o VRAM suficiente para cargar los pesos más las activaciones del grafo.
- GPU recomendadas: el paquete está orientado a Apple Silicon (memoria unificada); no se documentan requisitos para GPU NVIDIA o AMD en esta conversión.
- Cabe en GPU de consumo: no confirmado para esta conversión; el modelo base de 3B en BF16 es viable en GPUs con 12-16 GB o más, pero la aplicación compatible es específica de Apple Silicon.
- Opciones de despliegue: exclusivamente EZVideoRepair con sus grafos de red fijos; no es compatible con vLLM, llama.cpp, Ollama ni TGI, y no funciona como pipeline Diffusers estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| EZVR Flash V1 (esta ficha) | ~3B | Conversion BF16 de SeedVR2 3B para EZVideoRepair | Apache-2.0 | safetensors BF16 | Hugging Face, solo app EZVideoRepair |
| ByteDance-Seed/SeedVR2-3B | ~3B | DiT original de restauracion de video | no disponible en la informacion | no disponible | Hugging Face (modelo base oficial) |
| cmeka/SeedVR2-GGUF | ~3B | Conversion GGUF de SeedVR2 | no disponible en la informacion | GGUF (incluye Q4_K_M) | Hugging Face |
| Comfy-Org/SeedVR2 | no disponible | Version indicada como `new_version` en la model card | no disponible en la informacion | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo nuevo ni oficial de ByteDance; es una conversión de pesos y el nombre comercial no implica respaldo de los autores originales.
- Solo funciona con los grafos de red fijos de EZVideoRepair; no es un pipeline Diffusers autónomo ni sustituible por otras versiones de SeedVR2.
- La conversión desde Q4_K_M a BF16 no recupera la precisión perdida; no debe esperarse una mejora de calidad respecto al GGUF original.
- Los cuatro ficheros safetensors deben mantenerse con sus nombres originales en un único directorio y se validan contra el catálogo SHA256 de la aplicación; cualquier alteración impide su uso.
- No se documentan sesgos, tasas de alucinación visual ni limitaciones de resolución o duración de vídeo en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar la licencia y la atribución del modelo base al redistribuir; el código de la aplicación y sus dependencias tienen sus propias licencias.
- El campo `metrics: dvitel/codebleu` y el dataset `datasocial/tiktok-5.6B-videos` aparecen en el metadata sin explicación de su relevancia; no deben interpretarse como evidencia de calidad.
- La fecha de creación del repositorio (2026-10-28) y el reducido número de descargas (82) sugieren poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/whitelok/seedvr2-hybricprecision-3b
- Modelo base oficial: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Proyecto SeedVR2: https://github.com/ByteDance-Seed/SeedVR
- GGUF de origen del DiT: https://huggingface.co/AInVFX/SeedVR2_comfyUI/blob/main/seedvr2_ema_3b-Q4_K_M.gguf
- Conversión GGUF atribuida: https://huggingface.co/cmeka/SeedVR2-GGUF
- Assets VAE y conditioning: https://huggingface.co/numz/SeedVR2_comfyUI
- Integración ComfyUI: https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler
- Versión indicada como nueva: https://huggingface.co/Comfy-Org/SeedVR2
