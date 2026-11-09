# ZehongZhu/drivinggfm-v1.0

## Resumen

DrivingGFM v1.0.0 es un modelo de difusión de imagen a imagen especializado en edición controlada de escenas de conducción, desarrollado por el DrivingGFM Team de la Tongji University. Dado un fotograma de carretera o escena urbana y una instrucción en lenguaje natural, el modelo regenera la imagen preservando la geometría subyacente (trazado de la vía, posición de las líneas de carril) mientras modifica atributos como la meteorología, la iluminación, el mobiliario viario o los elementos de tráfico. Su utilidad práctica es generar variantes sintéticas y controladas de escenarios reales para aumentar datasets de percepción autónoma.

Técnicamente es una adaptación de la familia InstructPix2Pix sobre un UNet de difusión latente con 8 canales de entrada (4 de ruido latente más 4 de la imagen de condicionamiento) y doble classifier-free guidance (una escala para el texto y otra para la imagen). El UNet declara 859,5 M de parámetros, con un text encoder CLIP ViT-L/14 de 123,1 M y un VAE de 4 canales latentes entrenado a resolución 512. El repositorio ocupa 4,3 GB y se distribuye en formato diffusers con safetensors.

Es relevante para equipos que trabajan en simulación y aumento de datos para conducción autónoma, porque permite editar escenas existentes con una sola frase en lugar de recurrir a renderizado 3D o a generación desde cero, lo que reduce el coste de construir corpus con condiciones meteorológicas o de iluminación poco frecuentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente, UNet2DConditionModel con in_channels=8 y cross_attention_dim=768 (estilo InstructPix2Pix) |
| Parámetros totales | UNet 859,5 M + text encoder 123,1 M + VAE (no disponible el recuento exacto) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el texto se procesa con CLIPTokenizer (límite estándar de 77 tokens) |
| Tipos de cuantización | no disponible (la model card solo documenta carga en float16) |
| Idiomas soportados | inglés (en) |
| Licencia | CreativeML Open RAIL-M (declarada como `other` con `license_name: creativeml-openrail-m`) |
| Formato de pesos | safetensors vía diffusers (componentes `unet/`, `vae/`, `text_encoder/`, `tokenizer/`, `scheduler/`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de difusión latente de imagen a imagen. El UNet recibe 8 canales: los 4 del latente ruidoso y los 4 del latente de la imagen de entrada codificada por el VAE, lo que permite condicionar la generación sobre la estructura del fotograma original. El condicionamiento textual se inyecta mediante atención cruzada con un CLIPTextModel ViT-L/14 (dimensión 768). El muestreo usa EulerAncestralDiscreteScheduler y se controla con dos escalas independientes: `image_guidance_scale` (fidelidad a la geometría de la imagen original) y `guidance_scale` (fidelidad a la instrucción textual). El VAE trabaja con latentes de 4 canales y fue entrenado a resolución 512.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens o pares imagen-instrucción utilizados, ni si hubo etapas de RLHF o DPO; esa información no está disponible. Sí se documenta una modificación de los pesos antes de la publicación: se aplicó una perturbación gaussiana de orden `std*1e-6` tensor a tensor con semilla 2026, lo que cambia los hashes de los ficheros pero mantiene la equivalencia funcional (cosine similarity de salida del UNet de 0,99999976 respecto al checkpoint de referencia). Los detalles se registran en `model_index.json` bajo `_drivinggfm.injection`.

## Capacidades

- Edición de imágenes de escenas de conducción guiada por instrucciones en lenguaje natural (por ejemplo, "make it a rainy night road scene").
- Preservación de la geometría de la escena: trazado de la carretera, posición de líneas de carril y estructura general, controlable mediante `image_guidance_scale`.
- Modificación de condiciones meteorológicas, iluminación, mobiliario viario y elementos de tráfico.
- Generación imagen a imagen con control dual (texto e imagen) mediante doble CFG.
- Procesamiento de instrucciones en inglés exclusivamente.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada como VLM ni audio.
- No incluye safety checker ni feature extractor en el repositorio.

## Casos de uso

- Aumento de datos para percepción autónoma: generar variantes nocturnas, lluviosas o con distinta iluminación de fotogramas reales ya etiquetados, manteniendo la geometría para conservar las anotaciones de carril y obstáculos.
- Simulación de condiciones adversas: producir corpus de escenas con meteorología poco frecuente en el dataset original para entrenar o evaluar detectores y segmentadores bajo dominio cambiado.
- Pruebas de robustez de modelos de percepción: aplicar ediciones controladas sobre un conjunto de validación y medir la degradación de un detector ante cambios de iluminación o climatología.
- Edición de escenarios para revisión humana: modificar una escena concreta con una frase para ilustrar casos límite en documentación o análisis de incidentes.
- Generación de pares contrafactuales: crear la misma escena bajo dos condiciones distintas (día frente a noche) para estudiar la invariancia de características de un modelo.
- Prototipado rápido de datasets sintéticos: producir imágenes de relleno para pipelines de entrenamiento antes de disponer de capturas reales de una condición concreta, con la ventaja de que la estructura de la vía se mantiene reconocible.
- Investigación en edición de imagen condicionada: servir como base InstructPix2Pix adaptada a un dominio vertical para experimentos de control de fidelidad texto-imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 2-3 GB para los pesos (UNet 3,2 GB + VAE 319 MB + text encoder 469 MB en el repositorio), más el overhead de activaciones; cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM para float16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090); A100 o H100 no son necesarias para inferencia individual, aunque pueden aumentar el throughput en lote.
- Cabe en GPU de consumo: sí, previsiblemente desde 8 GB de VRAM en float16.
- Opciones de despliegue: diffusers con `StableDiffusionInstructPix2PixPipeline`, carga con `custom_pipeline="pipeline_drivinggfm.py"` y `trust_remote_code=True`, o el wrapper `DrivinggfmPipeline` del repositorio DrivingGFM/DrivingGFM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de pasos (recomendado 20-30) y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrivingGFM v1.0.0 | Difusión imagen a imagen, dominio conducción | UNet 859,5 M + CLIP 123,1 M | 512 px de entrenamiento; texto 77 tokens | CreativeML Open RAIL-M | Hugging Face (diffusers) |
| InstructPix2Pix (original) | Difusión imagen a imagen, dominio general | Arquitectura equivalente (UNet ~860 M + CLIP ViT-L/14) | 512 px; texto 77 tokens | CreativeML Open RAIL-M | Hugging Face (diffusers) |
| Stable Diffusion 1.5 (img2img) | Difusión texto-imagen e imagen-imagen | UNet ~860 M + CLIP ViT-L/14 | 512 px; texto 77 tokens | CreativeML Open RAIL-M | Hugging Face (diffusers) |

La comparación con InstructPix2Pix y Stable Diffusion 1.5 se basa en la arquitectura declarada en la model card (misma familia y dimensiones); no se dispone de datos de rendimiento comparativo para DrivingGFM, por lo que no es posible establecer diferencias cuantitativas de calidad.

## Limitaciones y advertencias

- Resolución de entrenamiento de 512 px: con lado corto superior a ~768 px los detalles se degradan; se recomienda reescalar antes de editar.
- No garantiza precisión en estructuras muy finas (texto de señales lejanas, numeración de carriles); es generación, no detección.
- Solo procesa instrucciones en inglés.
- No incluye safety checker ni feature extractor; `model_index.json` no declara esos componentes, por lo que no debe cargarse asumiendo el conjunto completo de componentes de `DiffusionPipeline`.
- Riesgo de alucinación visual: puede introducir o eliminar elementos de la escena no solicitados, especialmente con `image_guidance_scale` bajo.
- Los pesos publicados han sido reescritos con perturbación gaussiana de baja amplitud; los hashes no coinciden con el checkpoint de referencia, aunque la salida es funcionalmente equivalente.
- Licencia CreativeML Open RAIL-M: permite uso comercial y redistribución, pero exige incluir el texto completo de la licencia, mantener la atribución y que los usuarios posteriores respeten las restricciones de uso del Attachment A; los ficheros modificados deben marcarse como tales.
- No se documentan sesgos específicos del dominio ni composición del dataset de entrenamiento, lo que dificulta evaluar la cobertura de escenas (geografías, tipos de vía, condiciones extremas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZehongZhu/drivinggfm-v1.0
- Repositorio de código del proyecto: https://github.com/DrivingGFM
- Licencia CreativeML Open RAIL-M: https://github.com/CompVis/stable-diffusion/blob/main/LICENSE
