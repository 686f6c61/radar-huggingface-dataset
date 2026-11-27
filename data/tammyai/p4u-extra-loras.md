# tammyai/p4u-extra-loras

## Resumen

`tammyai/p4u-extra-loras` no es un modelo de lenguaje, sino un repositorio de adaptadores LoRA (Low-Rank Adaptation) orientados a modelos de generacion de imagen y video. El repositorio agrupa cuatro archivos `.safetensors` que actuan como modificadores de estilo y contenido sobre modelos base distintos: Qwen Image 2.1 y MiniMax H3. El autor del repositorio es el usuario `tammyai` y el contenido esta descrito en la model card como material privado, destinado exclusivamente a pruebas.

El interes tecnico del repositorio es limitado para el publico general, pero resulta ilustrativo de las practicas actuales de distribucion de LoRAs: mezcla de adaptadores con licencias heterogeneas, procedencias diversas (Civitai, Google Drive) y compatibilidades de formato dispares (estilo ComfyUI con prefijo `diffusion_model.`, estilo Kohya con prefijo `lora_unet_`, ranks y tipos de dato distintos). El tamano total del repositorio es de 1,4 GB.

No se trata de un modelo con parametros, contexto ni tokenizador propios: cada archivo LoRA debe cargarse junto al modelo base correspondiente. Dos de los cuatro adaptadores estan pensados para Qwen Image 2.1 y los otros dos para MiniMax H3 (video), por lo que no son intercambiables entre si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos base Qwen Image 2.1 y MiniMax H3 |
| Parametros totales | no disponible (depende del modelo base; los LoRA son adaptadores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a LoRA de difusion) |
| Tipos de cuantizacion | bf16 (front-doggy), fp32 (h3-ultimatedt); resto no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible a nivel de repositorio; cada archivo tiene su propia licencia (ver seccion de limitaciones) |
| Formato de pesos | `.safetensors` (LoRA en estilo ComfyUI y estilo Kohya) |

## Arquitectura y entrenamiento

Cada archivo del repositorio es un adaptador LoRA independiente, no un modelo entrenado desde cero. El adaptador `nsfw-front-doggy/front-doggy-mh3-e33-az420.safetensors` sigue el formato de ComfyUI (prefijo `diffusion_model.`, claves `lora_A.weight`/`lora_B.weight`, sin claves alpha), con rank 32, precision bf16 y 416 claves distribuidas en 208 capas. El adaptador `nsfw-h3-ultimatedt/h3-ultimatedt-step00026000-frenulum-69glans-k3nk.safetensors` sigue el formato de Kohya (prefijo `lora_unet_`, claves `lora_down`/`lora_up` con alpha), rank 32, alpha 16, fp32, 312 claves en 104 capas (bloques 24 a 49), entrenado con Musubi tuner durante 26 000 pasos bajo `networks.lora_minimax_h3`.

Los otros dos adaptadores (`detailifier_qwen_style_v1.safetensors` y `NSFW_Qwen_by_TheseAlpacas_V2.safetensors`) estan asociados a Qwen Image 2.1, pero la model card no detalla su formato interno, rank ni hiperparametros de entrenamiento. No se documenta el dataset de entrenamiento, el numero de pasos ni si hubo tecnicas de regularizacion o merging. El modelo base MiniMax H3 es un modelo de video, mientras que Qwen Image 2.1 es un modelo de imagen.

## Capacidades

- Modificacion de estilo y detalle sobre Qwen Image 2.1 (adaptador `detailifier_qwen_style_v1`).
- Generacion de contenido explicito (NSFW) sobre Qwen Image 2.1 (adaptador `NSFW_Qwen_by_TheseAlpacas_V2`).
- Generacion de video con modificacion de contenido explicito sobre MiniMax H3 (adaptadores `front-doggy` y `h3-ultimatedt`).
- Trigger words documentadas: `bent forward facing the front` y `man is partially visible behind her thrusting into her` (front-doggy). El adaptador `h3-ultimatedt` no declara `trainedWords` oficiales y fija `ss_h3_dop_trigger` a `none`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta capacidades multilingues en el sentido de NLP.

## Casos de uso

- Investigacion sobre formatos de LoRA: el repositorio permite comparar en la practica las diferencias entre el formato ComfyUI (`diffusion_model.`, `lora_A`/`lora_B`) y el formato Kohya (`lora_unet_`, `lora_down`/`lora_up` con alpha), util para desarrolladores que construyan herramientas de conversion o validacion de adaptadores.
- Auditoria de procedencia y licencias: sirve como caso de estudio para pipelines que verifiquen SHA256, metadatos `ss_base_model_version` y compatibilidad entre modelo base y adaptador antes de desplegar un LoRA en produccion.
- Pruebas de compatibilidad de modelo base: los adaptadores `front-doggy` y `h3-ultimatedt` estan etiquetados explicitamente como incompatibles con el espacio de Qwen, lo que los hace utiles para validar sistemas de enrutamiento que rechacen LoRA mal emparejados.
- Generacion de imagen con estilo detallado sobre Qwen Image 2.1: el adaptador `detailifier_qwen_style_v1` puede emplearse en flujos de trabajo de Civitai o ComfyUI para incrementar el nivel de detalle en imagenes generadas, siempre que se respete la licencia del autor original.
- Generacion de video con MiniMax H3: los adaptadores `front-doggy` y `h3-ultimatedt` se cargan sobre MiniMax H3 en herramientas compatibles (Musubi tuner, ComfyUI con soporte H3) para modificar el contenido generado en video.
- Verificacion de integridad de artefactos: los hashes SHA256 documentados en la model card permiten integrar los archivos en un registro de artefactos con verificacion criptografica antes de su uso.
- Docencia sobre riesgos de licencia en IA generativa: el repositorio ejemplifica la complejidad de apilar licencias de autor del LoRA, licencia del modelo base y restricciones territoriales (EU, UK, US, Corea del Sur en el caso de MiniMax H3).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los LoRA en si; depende enteramente del modelo base. Qwen Image 2.1 y MiniMax H3 requieren GPUs de gama alta para inferencia de imagen y video respectivamente.
- GPU recomendadas: no disponible en la informacion proporcionada. Para modelos de difusion de imagen y video comparables se suele requerir A100, H100 o RTX 4090, pero este dato no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio (1,4 GB) corresponde solo a los adaptadores, no al modelo base.
- Opciones de despliegue: ComfyUI (formato ComfyUI para `front-doggy`), Musubi tuner (para `h3-ultimatedt`, entrenado con ese framework), y en general cualquier runtime que cargue LoRA sobre Qwen Image 2.1 o MiniMax H3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tammyai/p4u-extra-loras | Repositorio de LoRA | Qwen Image 2.1 y MiniMax H3 | safetensors (ComfyUI y Kohya) | Mixta por archivo | Hugging Face (publico) |
| Detailifier v1.0 (Civitai) | LoRA individual | Qwen 2.1 | safetensors | Atribucion obligatoria; comercial solo via Civitai | Civitai |
| NSFW Qwen by TheseAlpacas V2 (Civitai) | LoRA individual | Qwen Image 2.1 | safetensors | Permisiva segun autor, limitada por base | Civitai |
| Ultimate DeepThroat + Frenulum (K3NK, Civitai) | LoRA individual | MiniMax H3 | safetensors (Kohya) | Atribucion; comercial solo via RentCivit | Civitai |

No se dispone de datos de rendimiento comparativo entre estos adaptadores.

## Limitaciones y advertencias

- Contenido explicito (NSFW): dos de los cuatro adaptadores estan etiquetados explicitamente como NSFW y su uso puede infringir las politicas de plataformas de distribucion y de algunos proveedores de servicios.
- Licencias heterogeneas y restrictivas: `detailifier_qwen_style_v1` exige atribucion y limita el uso comercial a la plataforma Civitai; `front-doggy` y `h3-ultimatedt` exigen atribucion, prohiben Image/Rent/Sell/SellMerge y no permiten modificar la licencia ni obras derivadas. La licencia a nivel de repositorio no esta declarada.
- Restricciones territoriales del modelo base: la MiniMax H3 Community License excluye el uso de pesos abiertos en la Union Europea, Reino Unido, Estados Unidos y Corea del Sur, lo que afecta directamente a los adaptadores `front-doggy` y `h3-ultimatedt`.
- Incompatibilidad cruzada: los adaptadores de MiniMax H3 no funcionan en el espacio de Qwen Image 2.1 y viceversa; cargarlos sobre el modelo base equivocado producira errores o resultados invalidos.
- Procedencia mixta: parte de los archivos se distribuyeron originalmente via Civitai y otros llegaron por Google Drive, lo que complica la trazabilidad. La model card incluye hashes SHA256 para tres de los cuatro archivos, lo que permite verificar integridad.
- Ausencia de benchmarks y de documentacion de entrenamiento para dos de los adaptadores.
- Riesgo de sesgos y alucinacion visual: no documentado; los modelos de difusion pueden reproducir estereotipos y generar contenido no solicitado.
- Uso comercial: practicamente inviable sin revisar caso por caso la licencia del autor del LoRA y la del modelo base; en el caso de MiniMax H3, ademas, restringido por territorio.
- El repositorio se describe como "privado, solo para pruebas", lo que sugiere que no esta pensado para produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tammyai/p4u-extra-loras
- Detailifier v1.0 (Civitai): https://civitai.com/models/430687/detailifier?modelVersionId=3468509
- NSFW Qwen by TheseAlpacas V2 (Civitai): https://civitai.com/models/2958918?modelVersionId=3357315
- Front Doggystyle MiniMaxH3 (Civitai): https://civitai.com/models/1667001?modelVersionId=3321346
- Ultimate DeepThroat + Frenulum - MiniMax H3 LoRA - K3NK (Civitai): https://civitai.com/models/2904180?modelVersionId=3331949
