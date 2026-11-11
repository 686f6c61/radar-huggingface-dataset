# yamiuchi/civitai-collections

## Resumen

`yamiuchi/civitai-collections` no es un modelo de lenguaje ni un modelo fundacional en el sentido habitual, sino un repositorio agregador de pesos para generación de imágenes (checkpoints, LoRA, embeddings y VAE) orientado a su consumo desde Hugging Face Spaces. El autor, yamiuchi, reúne en un único repositorio de 59,8 GB checkpoints de las familias Anima, Illustrious y SDXL, junto con LoRA y textual inversion embeddings, para evitar dependencias externas durante la ejecución de demos. No hay pipeline declarado ni idiomas especificados en la metadata de Hugging Face.

El contenido procede de terceros: CircleStone Labs y Comfy Org (Anima), WAI0731, KiwiMix, mHIllustrious, zukiAnimeILL y diversos autores de Civitai. El repositorio incluye además cinco versiones INT8 no oficiales de checkpoints Anima, cuantizadas por el propio autor del repositorio, con el objetivo declarado de reducir el tamaño de los ficheros (unos 2,424 GB por checkpoint, 12,12 GB en total). La licencia es "other" y el autor advierte explícitamente de que la agregación no sustituye ni amplía los derechos de los modelos originales.

Su relevancia es práctica, no investigadora: sirve como espejo de artefactos para reproducibilidad de Spaces y como ejemplo de gestión de licencias heterogéneas en un mismo repositorio. Cualquier uso en producción exige verificar individualmente la licencia de cada checkpoint y LoRA en su página de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelos de difusión para imagen: familias Anima, Illustrious y SDXL) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de imagen; resolución y pasos dependen de cada checkpoint) |
| Tipos de cuantización | FP original (safetensors) e INT8 no oficial en 5 checkpoints Anima; embeddings en `.safetensors` y `.pt` |
| Idiomas soportados | No disponible (prompts en texto; no se declaran idiomas) |
| Licencia | `other` (licencias individuales por modelo, definidas por cada autor original) |
| Formato de pesos | safetensors y `.pt` (embeddings SD 1.5) |
| Tamaño del repositorio | 59,8 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega artefactos de difusión latente de tres linajes. Los checkpoints Anima (Turbo v1.1, Aesthetic v1.1, Fn-Mix Anima-Turbo, Fwaun Anima v1.1, Tekito-Mix v3.2 y anima_pencil v2.1.0) provienen de CircleStone Labs/Comfy Org y de mezclas de la comunidad en Civitai. Los checkpoints Illustrious/SDXL (waiIllustriousSDXL v1.70, kiwimixXL v3, mHIllustrious v1.0, zukiAnimeILL v5.0) son derivados de SDXL orientados a ilustración. Los LoRA incluyen ajustes de estética, aceleradores de pasos (Turbo ANIMA v2, kirazuri-anima-turbo-v4-8step, DMD2 4-step para SDXL) y modificadores de calidad.

La única intervención técnica propia documentada es la cuantización INT8 de cinco checkpoints Anima, realizada con `OTUNetLoaderW8A8` de `ComfyUI-INT8-Fast`, fijado al commit `48a88b2fde88e986c6444fa1f51589b6089d04f3`, con `on_the_fly_quantization=False`, `enable_convrot=True` y `lora_mode="None"`. El autor advierte de que el resultado puede diferir del original en calidad y en la respuesta a LoRA, y de que no se garantizan reducciones de VRAM ni de latencia. No se documentan tokens de entrenamiento, composición de dataset, RLHF ni DPO, porque no aplica a estos artefactos.

## Capacidades

- Generación de imágenes texto-a-imagen con checkpoints de las familias Anima, Illustrious y SDXL.
- Estilización y ajuste fino mediante LoRA (estética, detalle, estilo GPT Image 2, aceleradores de muestreo).
- Aceleración de inferencia con LoRA de pocos pasos: Turbo ANIMA v2, kirazuri-anima-turbo-v4-8step y DMD2 4-step para SDXL.
- Control de calidad negativa mediante textual inversion embeddings (`negativeXL`, `negativeXL_D`, `EasyNegativeV2`, `bad-hands-5`).
- Decodificación VAE específica para Illustrious XL v1.0.
- Carga de checkpoints Anima en INT8 para reducir el tamaño en disco y el uso de memoria del UNet.
- Integración con flujos ComfyUI a través de nodos de terceros (`ComfyUI-INT8-Fast`).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Reproducibilidad de Spaces: fijar el repositorio como fuente única de checkpoints, LoRA y VAE permite que una demo de generación de imágenes arranque sin depender de descargas desde Civitai, con versiones inmutables por commit.
- Despliegue en GPU con VRAM limitada: los cinco checkpoints Anima INT8 (unos 2,424 GB cada uno) permiten cargar el UNet en tarjetas de 8-12 GB cuando la versión FP no cabe, aceptando posibles diferencias de calidad.
- Generación de ilustración anime en producción: waiIllustriousSDXL v1.70 o zukiAnimeILL v5.0, combinados con `negativeXL_D` e `illustriousXLV10_v10`, ofrecen un pipeline coherente para catálogos de ilustración con estilos consistentes.
- Prototipado rápido con pocos pasos: DMD2 4-step LoRA sobre SDXL o kirazuri-anima-turbo-v4-8step reducen el número de pasos de muestreo y, por tanto, el coste por imagen en entornos de previsualización interactiva.
- Ajuste de estética sin reentrenar: LoRA como `anima-highres-aesthetic-boost` o `anima-base-1-masterpiece-v51` permiten subir calidad percibida en un checkpoint base sin tocar los pesos principales.
- Corrección de artefactos anatómicos: `bad-hands-5` y `EasyNegativeV2` como embeddings negativos en SD 1.5 reducen manos deformes y artefactos comunes en pipelines heredados.
- Evaluación comparativa de mezclas de la comunidad: el repositorio concentra variantes (Fn-Mix, Tekito-Mix, Fwaun) que permiten A/B testing de estilos con el mismo entorno de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas FID, CLIP score, evaluación humana ni comparativas cuantitativas de calidad entre los checkpoints agregados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de tamaño de fichero, cada checkpoint Anima INT8 ocupa aproximadamente 2,424 GB en disco; el repositorio completo son 59,8 GB, por lo que no es viable cargarlo entero en memoria.
- GPU recomendadas: no disponibles en la documentación. Para SDXL/Illustrious en FP16 se requiere habitualmente una GPU con 12-16 GB o más; para las variantes INT8 de Anima, el autor no garantiza una reducción concreta de VRAM.
- GPU de consumo: el autor no confirma compatibilidad con RTX 4090, RTX 3090 ni modelos inferiores; la viabilidad depende del checkpoint y de la cuantización elegida.
- Despliegue: ComfyUI con `ComfyUI-INT8-Fast` (commit fijado) para los checkpoints INT8; para el resto, los cargadores estándar de ComfyUI o de cualquier runtime compatible con safetensors de difusión. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de imagen.
- Latencia y throughput: no disponibles. Los LoRA de pocos pasos (DMD2 4-step, kirazuri 8-step) reducen el número de pasos de muestreo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Repositorio / modelo | Contenido | Tamaño | Licencia | Observaciones |
|---|---|---|---|---|
| yamiuchi/civitai-collections | Checkpoints Anima, Illustrious y SDXL; LoRA; embeddings; VAE | 59,8 GB | `other` (por modelo) | Agregador con INT8 no oficial de Anima; pensado para Spaces |
| circlestone-labs/Anima | Checkpoint Anima oficial (Turbo v1.1, Aesthetic v1.1) | No disponible | Ver LICENSE.md del repo oficial | Fuente original; sin cuantización INT8 oficial |
| circlestone-labs/Anima-Official-LoRAs | LoRA oficiales de Anima | No disponible | Ver repo oficial | Incluye `anima-turbo-lora-v0.2`, replicado aquí |
| Repositorios de checkpoints SDXL/Illustrious en Civitai | Checkpoints individuales de la comunidad | Variable | Variable por autor | Distribución original; requiere descarga individual |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia `other`: no hay una licencia unificada. Cada checkpoint, LoRA, embedding y VAE conserva la licencia de su autor original, que puede cambiar en la página de origen; el uso comercial debe verificarse archivo por archivo.
- Los cinco checkpoints Anima INT8 son cuantizaciones no oficiales: no están avaladas por CircleStone Labs ni por Comfy Org, y pueden producir resultados, calidad y respuesta a LoRA distintos de los originales.
- El autor no garantiza reducciones de VRAM ni de velocidad con INT8, solo reducción de tamaño de fichero.
- La carga INT8 depende de un commit concreto de `ComfyUI-INT8-Fast` y de parámetros específicos (`on_the_fly_quantization=False`, `enable_convrot=True`, `lora_mode="None"`); la compatibilidad con cargadores estándar no está verificada.
- `ComfyUI-INT8-Fast` se distribuye bajo AGPL-3.0, licencia independiente de la de los pesos; su uso puede imponer obligaciones de copyleft al software que lo integre.
- Riesgo de alucinación visual y artefactos anatómicos inherente a los modelos de difusión, mitigable solo parcialmente con embeddings negativos.
- No se declaran idiomas soportados en los prompts ni se documenta comportamiento multilingüe.
- El repositorio mezcla modelos de familias distintas (Anima, Illustrious, SDXL, SD 1.5 para embeddings): usar un embedding o VAE con la familia equivocada degrada la salida.
- El repositorio no incluye garantía de mantenimiento ni de integridad de los enlaces a los distribuidores originales; el autor pide notificar errores.
- Sin descargas ni likes registrados en Hugging Face: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yamiuchi/civitai-collections
- Anima (modelo oficial, CircleStone Labs): https://huggingface.co/circlestone-labs/Anima
- Licencia de Anima: https://huggingface.co/circlestone-labs/Anima/blob/main/LICENSE.md
- LoRA oficiales de Anima: https://huggingface.co/circlestone-labs/Anima-Official-LoRAs
- anima-models (bluepen5805): https://huggingface.co/bluepen5805/anima-models
- kirazuri-anima (motimalu): https://huggingface.co/motimalu/kirazuri-anima
- ComfyUI-INT8-Fast: https://github.com/BobJohnson24/ComfyUI-INT8-Fast
- Commit fijado de ComfyUI-INT8-Fast: https://github.com/BobJohnson24/ComfyUI-INT8-Fast/tree/48a88b2fde88e986c6444fa1f51589b6089d04f3
- Fn-Mix Anima-Turbo (Civitai): https://civitai.com/models/2719904
- Fwaun Anima v1.1 (Civitai): https://civitai.com/models/2602206?modelVersionId=2954569
- Tekito-Mix v3.2 (Civitai): https://civitai.com/models/2639779/tekito-mix?modelVersionId=3265116
- WAI-illustrious-SDXL (Civitai): https://civitai.com/models/827184/wai-illustrious-sdxl
- KiwiMix XL v3 (Civitai): https://civitai.com/models/264709?modelVersionId=1075361
- mHIllustrious (Civitai): https://civitai.com/models/1586012/mhillustrious?modelVersionId=1794770
- zukiAnimeILL v5.0 (Civitai): https://civitai.com/models/949488?modelVersionId=1765723
- Anima-P3-Aesthetics (RunningHub): https://www.runninghub.ai/model/public/2061426010008150017
- Turbo ANIMA v2 (Civitai): https://civitai.com/models/2619830?modelVersionId=3039549
- Aesthetic Quality Modifiers - Masterpiece (Civitai): https://civitai.com/models/929497/aesthetic-quality-modifiers-masterpiece
- Anima Highres/Aesthetic Boost (Civitai): https://civitai.com/models/2540444/anima-highresaesthetic-boost
- Style Greater - GPT Image 2 (Civitai): https://civitai.com/models/2564225/style-greater-gpt-image-2
- DMD2 Speed LoRA SDXL (Civitai): https://civitai.com/models/1608870/dmd2-speed-lora-sdxl-pony-illustrious?modelVersionId=1820705
- negativeXL D (Civitai): https://civitai.com/models/118418?modelVersionId=134583
- EasyNegativeV2 (Civitai): https://civitai.com/models/100191/ti-easynegativev2-textual-inversion-embedding
- bad-hands-5 (Civitai): https://civitai.com/models/116230?modelVersionId=125849
- Illustrious XL v1.0 VAE (Civitai): https://civitai.com/models/1693029/illustrious-xl-v10?modelVersionId=1916060
