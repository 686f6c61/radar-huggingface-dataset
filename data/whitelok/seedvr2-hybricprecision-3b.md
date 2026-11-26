# whitelok/seedvr2-hybricprecision-3b

## Resumen

EZVR Flash V1 es una conversión de pesos, no un modelo entrenado desde cero. Se trata de una exportación a BF16 de los parámetros del modelo de restauración de vídeo SeedVR2 3B de ByteDance Seed, empaquetada por el usuario whitelok para su uso dentro de la aplicación EZVideoRepair en Apple Silicon. El identificador interno de compatibilidad es `seedvr2-3b-bf16-512-v1`, y el repositorio conserva la licencia Apache 2.0 del modelo original.

El modelo resuelve tareas de restauración y mejora de vídeo e imagen (video-to-video e image-restoration) mediante una arquitectura DiT (Diffusion Transformer) con módulos VAE de codificación y decodificación separados. Los pesos se exportaron a BF16 a partir de una versión cuantizada Q4_K_M distribuida por terceros, lo que significa que la precisión perdida en la cuantización original no se recupera con esta conversión.

Su relevancia es acotada: no es un pipeline autónomo de Diffusers ni sustituye a versiones arbitrarias de SeedVR2. Los ficheros contienen únicamente pesos y dependen de los grafos de red fijos que proporciona la aplicación EZVideoRepair, que además valida cada fichero contra un catálogo SHA256 de confianza antes de cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con VAE encoder/decoder separados; basada en SeedVR2 3B |
| Parametros totales | 3B (heredados del modelo base SeedVR2-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de restauracion de video, no de texto) |
| Tipos de cuantizacion | BF16 en los ficheros distribuidos; origen Q4_K_M; existen GGUF Q4_K_M en repos de terceros |
| Idiomas soportados | no disponible (no aplica; tarea visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SeedVR2 3B de ByteDance Seed: un Diffusion Transformer para restauración de vídeo, acompañado de un VAE con encoder y decoder independientes. Este repositorio no incluye entrenamiento propio ni ajuste fino; es una conversión de formato y precisión de pesos ya existentes. El DiT se exportó a BF16 desde un modelo derivado de Q4_K_M, y los módulos VAE (`encode-1.safetensors` y `decode-1.safetensors`) también en BF16. El fichero `postprocess.safetensors` es un contenedor vacío porque el grafo de postproceso no tiene parámetros con nombre.

No se documentan en la información disponible datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) más allá de la referencia al dataset `datasocial/tiktok-5.6B-videos` en los metadatos. La model card advierte explícitamente de que la conversión de pesos cuantizados a BF16 no recupera la precisión perdida y no constituye evidencia de entrenamiento adicional ni de mejora de calidad. Los cuatro ficheros safetensors suman aproximadamente 7,79 GB y deben mantenerse con sus nombres originales en un único directorio.

## Capacidades

- Restauración y mejora de vídeo (video-to-video) mediante el pipeline de difusión del modelo base SeedVR2.
- Restauración de imagen (image-restoration), según los tags del repositorio.
- Integración con la aplicación EZVideoRepair en Apple Silicon, que aporta los grafos de red fijos compatibles.
- Verificación de integridad de pesos mediante catálogo SHA256 de la aplicación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo thinking.
- No incluye visión general ni audio; su dominio es la restauración visual.

## Casos de uso

- Restauración de vídeo doméstico en macOS: el modelo se carga en EZVideoRepair seleccionando el directorio de pesos, y la aplicación aplica el grafo de difusión fijo para limpiar ruido y artefactos de compresión en clips antiguos.
- Mejora de material de archivo para edición: útil para recuperar detalle en grabaciones de baja calidad antes de incorporarlas a un montaje, aprovechando que los pesos BF16 caben en el repo de 7,8 GB y se validan por SHA256.
- Reparación de fotogramas extraídos de vídeo: al soportar image-restoration, permite procesar frames sueltos como imágenes antes de recomponer la secuencia.
- Flujos de posproducción en Apple Silicon: al estar empaquetado específicamente para EZVideoRepair, encaja en estaciones de trabajo Mac donde no se dispone de GPU NVIDIA.
- Pruebas de integración y compatibilidad: desarrolladores que verifiquen el catálogo SHA256 y la carga de pesos en la aplicación pueden usar este paquete como referencia de conversión BF16 desde GGUF Q4_K_M.
- Archivado y reproducción de resultados: al conservar `PROVENANCE.json` con hashes de origen y destino, sirve para auditar la cadena de conversión en proyectos que exijan trazabilidad de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los metadatos incluyen la métrica `dvitel/codebleu`, que no es aplicable a una tarea de restauración de vídeo y no se acompaña de valores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo de pesos ocupa 7,79 GB en BF16, por lo que se requiere al menos ese orden de memoria para cargar los tensores completos.
- GPU recomendadas: no disponible; el paquete está orientado a Apple Silicon (memoria unificada) mediante EZVideoRepair.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el empaquetado no es un pipeline Diffusers genérico y no se garantiza su funcionamiento fuera de EZVideoRepair.
- Opciones de despliegue: EZVideoRepair (aplicación objetivo). Existen alternativas de terceros en GGUF Q4_K_M para ComfyUI (`AInVFX/SeedVR2_comfyUI`, `cmeka/SeedVR2-GGUF`, `numz/SeedVR2_comfyUI`), pero no son equivalentes a este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso previsto | Disponibilidad |
|---|---|---|---|---|---|
| whitelok/seedvr2-hybricprecision-3b (EZVR Flash V1) | 3B | safetensors BF16 | Apache 2.0 | EZVideoRepair en Apple Silicon | Hugging Face, 254 descargas |
| ByteDance-Seed/SeedVR2-3B | 3B | no disponible en la informacion | no disponible en la informacion | Modelo original de restauracion de video | Hugging Face (upstream) |
| AInVFX/SeedVR2_comfyUI (seedvr2_ema_3b-Q4_K_M.gguf) | 3B | GGUF Q4_K_M | no disponible en la informacion | ComfyUI | Hugging Face |
| cmeka/SeedVR2-GGUF | 3B | GGUF | no disponible en la informacion | Conversion GGUF de referencia | Hugging Face |

## Limitaciones y advertencias

- No es un modelo nuevo ni un lanzamiento oficial de ByteDance; es una conversión de pesos y el nombre comercial no implica respaldo de los autores originales.
- La conversión desde Q4_K_M a BF16 no recupera la precisión perdida en la cuantización original; no debe interpretarse como mejora de calidad.
- No es un pipeline Diffusers autónomo: requiere los grafos de red fijos de EZVideoRepair y no puede sustituir a versiones arbitrarias de SeedVR2.
- Los cuatro ficheros safetensors deben mantenerse con nombres intactos en un único directorio; renombrarlos o separarlos rompe la carga.
- La aplicación valida los pesos contra un catálogo SHA256 de confianza; modificaciones locales invalidan esa verificación.
- Riesgo de sesgos y alucinaciones visuales: no documentado en la información disponible, aunque es esperable en modelos generativos de restauración.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige conservar la licencia y la atribución upstream al redistribuir. El código de la aplicación y sus dependencias tienen sus propias licencias.
- El metadato `license: mit` previo de la model card fue corregido a Apache 2.0; conviene verificar la licencia en redistribuciones.
- Idiomas y contexto no aplican; no usar para tareas de texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/whitelok/seedvr2-hybricprecision-3b
- Modelo original: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Proyecto SeedVR2: https://github.com/ByteDance-Seed/SeedVR
- GGUF de origen (AInVFX): https://huggingface.co/AInVFX/SeedVR2_comfyUI/blob/main/seedvr2_ema_3b-Q4_K_M.gguf
- Conversión GGUF (cmeka): https://huggingface.co/cmeka/SeedVR2-GGUF
- Assets VAE y conditioning (numz): https://huggingface.co/numz/SeedVR2_comfyUI
- Integración ComfyUI (numz): https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler
- Nueva versión referenciada: https://huggingface.co/Comfy-Org/SeedVR2
