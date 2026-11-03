# Xxct/LTX2.3-10Eros

## Resumen

LTX2.3-10Eros es un modelo de generación de vídeo a partir de imagen (image-to-video, I2V) publicado en HuggingFace por el usuario Xxct. Se trata de un *merge* de pesos derivado de la familia LTX-2.3 (modelo base de vídeo de Lightricks, del que no se documentan aquí especificaciones oficiales) y del modelo Sulphur-2-base de SulphurAI, orientado explícitamente a contenido para adultos. El autor lo describe como una versión "10 Eros", con sucesivas iteraciones (v1.2, v1.3, v1.4, v1.5) que ajustan las compuertas de atención (`attn_1`, `attn_2`) para recuperar detalle anatómico y movimiento explícito sin perder la estabilidad estructural de las versiones previas.

El modelo se distribuye como checkpoint completo en formato diffusers, con pesos en BF16, FP8 mixto y variantes GGUF e INT8 en repositorios de terceros. El repositorio ocupa 424 GB, lo que refleja que incluye múltiples variantes de pesos (BF16, FP8, splits de Kijai) más CLIP y VAE. No es un modelo autónomo: depende del modelo base Sulphur-2-base y está diseñado para funcionar con LoRAs DMD híbridas y con los nodos ComfyUI del propio autor.

La relevancia de esta ficha es fundamentalmente técnica y de catalogación: documenta un caso de *fine-tuning* comunitario sobre un modelo de vídeo de gran tamano, con un pipeline de cuantización y despliegue muy específico (ComfyUI + DMD LoRA), y con una licencia no declarada que impide cualquier evaluación de uso comercial. No hay datos de benchmarks ni métricas objetivas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (derivado de LTX-2.3 y Sulphur-2-base); detalles internos no disponibles |
| Parametros totales | no disponible (el autor menciona "base 22b dev model" como referencia de prompting, sin confirmar que este merge tenga ese tamano) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (modelo de vídeo; la longitud se mide en frames, no en tokens) |
| Tipos de cuantizacion | BF16 (checkpoint completo), FP8 mixto aprendido (`fp8_mixed_learned`), FP8 transformer con splits de Kijai, INT8 (repos de terceros), GGUF (repo de terceros) |
| Idiomas soportados | no disponible (el prompting se documenta en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusers), GGUF, splits para ComfyUI (`diffusion_models`) |

## Arquitectura y entrenamiento

El modelo es un *merge* por capas (layer-scaled merge) de distintos pasos de entrenamiento, no una fusión directa de pesos. Según la model card, las versiones 1.2 a 1.5 son "casi el mismo modelo" y la diferencia principal reside en cómo se gestionan las compuertas de atención `attn_1` y `attn_2`: la v1.5 aplica una rampa lineal sobre esas compuertas para reabrir el detalle explícito presente en Sulphur, manteniendo la estabilidad y el estilo de prompting de la v1.4. La v1.2 incorporó datos de *connector* ajustados para reducir el *face drift* y mejorar la adherencia a prompts largos; la v1.3 se rediseñó para funcionar exclusivamente con LoRA DMD y reducir artefactos como anatomía fantasma y subtítulos no deseados.

No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El autor indica que el modelo es un híbrido entre un modelo pensado para DMD y otro pensado para LoRA destilada de LTX, y que funciona mejor con LoRAs híbridas (por ejemplo, `LTX2.3_DMD_hybrid_v2.safetensors`). También advierte que las LoRAs destiladas grandes dañan el *fine-tune* y recomienda las variantes `cond_safe`. La dependencia declarada es Sulphur-2-base, y el modelo se carga como checkpoint con CLIP y VAE incluidos en BF16.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) con evolución de la escena frame a frame.
- Control de movimiento y composición mediante prompting descriptivo y directivo; el autor subraya que LTX "tiene muy poco auto-razonamiento" y que hay que especificar cada parte del cuerpo, cambio de composición y manipulación.
- Generación de audio asociado a la escena (diálogo, foley, ruido de fondo, música), descrito en el prompt en secuencia temporal con las acciones.
- Soporte de prompts largos y estilo "director" gracias a los datos de *connector* ajustados de la v1.2.
- Integración con LoRAs DMD para acelerar la inferencia y ampliar la variedad de movimiento.
- Funcionamiento en pipelines ComfyUI mediante los nodos del autor (`10S-Comfy-nodes`).
- No se documenta soporte de tool calling, function calling, agentes ni capacidades multilingües.

## Casos de uso

- **Generación de vídeo para adultos con control de anatomía y movimiento**: el modelo está entrenado y ajustado específicamente para este dominio; se usaría con un prompt detallado que describa cada parte del cuerpo y su evolución temporal desde el primer frame.
- **Prototipado de animaciones I2V en ComfyUI**: gracias a los nodos `10S-Comfy-nodes` y a los workflows publicados (`10Eros_10SNodes_I2V_Basic_DMD_V5.json`), se puede montar un pipeline de generación con DMD LoRA en una estación de trabajo con GPU de gran VRAM.
- **Investigación sobre merges de modelos de difusión**: el caso documenta una técnica de *layer-scaled merge* con control de compuertas de atención, útil para estudiar cómo se recuperan capacidades latentes de un modelo base sin reentrenar.
- **Evaluación de cadenas de cuantización para vídeo**: las variantes BF16, FP8, INT8 y GGUF permiten comparar calidad y coste de inferencia en distintos *backends* (ComfyUI, posiblemente llama.cpp para GGUF, aunque no se documenta).
- **Generación de audio sincronizado con vídeo**: el prompt admite especificar diálogo, tono de voz y efectos de sonido en secuencia temporal, lo que sirve para producir clips con banda sonora integrada.
- **Pruebas de estabilidad temporal y deriva facial**: la v1.2 introdujo datos para reducir el *face drift*; el modelo puede usarse para medir la consistencia de identidad en secuencias largas.
- **Base para *fine-tuning* posterior**: el autor indica que la v1.4 está "preparada para ser entrenada" y corregida como base real, por lo que sirve como punto de partida para LoRAs de anatomía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Por el tamano del repositorio (424 GB con múltiples variantes) y la mención a un "base 22b dev model", se puede inferir que la inferencia en BF16 requiere varias decenas de GB de VRAM; las variantes FP8 e INT8 reducen el requisito, pero no se publican cifras.
- **GPU recomendadas**: no disponible. Por el perfil del modelo (vídeo de difusión de gran tamano), son razonables A100/H100 de 80 GB para BF16; las variantes cuantizadas podrían caber en RTX 4090 (24 GB) o RTX 3090, pero no está confirmado.
- **Consumer GPU**: no confirmado. Las versiones INT8 y GGUF de terceros sugieren que se busca viabilidad en GPUs de consumo, sin datos de rendimiento.
- **Opciones de despliegue**: ComfyUI con los nodos `10S-Comfy-nodes` y los splits de Kijai (`Kijai/LTX2.3_comfy`) para la variante FP8 transformer; GGUF para *backends* compatibles (no especificado); diffusers como librería declarada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX2.3-10Eros | no disponible | no disponible | no disponible | HuggingFace (repo de 424 GB) |
| Sulphur-2-base (dependencia) | no disponible | no disponible | no disponible | HuggingFace |
| LTX-2.3 base (origen) | no disponible | no disponible | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Contenido para adultos**: el repositorio está marcado `not-for-all-audiences` y el modelo está diseñado explícitamente para generar material sexual explícito; no es apto para uso general ni para entornos productivos sin control de contenido.
- **Licencia no declarada**: al no especificarse licencia, no se puede asumir permiso de uso comercial; además, hereda las restricciones del modelo base Sulphur-2-base, que tampoco se detallan aquí.
- **Dependencia de terceros**: requiere el modelo base Sulphur-2-base, LoRAs DMD híbridas y nodos ComfyUI externos; la cadena de dependencias es frágil y versionada de forma laxa.
- **Prompting muy exigente**: el autor advierte que LTX tiene poco auto-razonamiento y que hay que comandarlo todo (primer frame, movimientos, evoluciones, audio); sin prompts detallados el resultado es pobre.
- **Artefactos conocidos**: las versiones anteriores presentaban anatomía fantasma, subtítulos no deseados y transiciones inesperadas; la v1.3 afirma reducirlos, pero no hay métricas que lo confirmen.
- **Riesgo de alucinación visual**: al ser un modelo generativo de vídeo, puede producir anatomía incorrecta, deriva facial y movimientos incoherentes, especialmente en secuencias largas.
- **Sesgos**: no documentados, pero el dominio de entrenamiento (contenido explícito) implica sesgos de representación corporal y de género no evaluados.
- **Idioma**: el prompting documentado es en inglés; no hay evidencia de soporte multilingüe.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-03); es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xxct/LTX2.3-10Eros
- Workflows del autor: https://huggingface.co/TenStrip/LTX2.3-10Eros_Workflows
- Nodos ComfyUI: https://github.com/TenStrip/10S-Comfy-nodes
- Modelo base dependiente: https://huggingface.co/SulphurAI/Sulphur-2-base
- LoRA DMD híbrida v2: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora/blob/main/LTX2.3_DMD_hybrid_v2.safetensors
- LoRAs DMD híbridas alternativas: https://huggingface.co/maximsobolev275/LTX2.3-DMD-Distill-Lora-Hybrids
- LoRAs destiladas `cond_safe`: https://huggingface.co/TenStrip/LTX2.3_Distilled_Lora_1.1_Experiments/tree/main
- Cuantizaciones GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-GGUF/tree/main
- INT8 con merge hybrid v2: https://huggingface.co/CornLogic/10EROS-INT8/tree/main
- INT8 calidad 1.5: https://huggingface.co/LokkenJP/10EROS_1.5_fp8_exp_learned
- Splits FP8 de Kijai: https://huggingface.co/Kijai/LTX2.3_comfy/tree/main
