# zhurrka/Chroma

## Resumen

Chroma es un modelo de generacion de imagenes texto-a-imagen de 8.9B parametros derivado de FLUX.1-schnell, publicado originalmente por el desarrollador lodestone-rock y redistribuido en el repositorio `zhurrka/Chroma`. Su propuesta central es ofrecer una alternativa completamente abierta y sin censura frente a los modelos cerrados dominantes: se entrena sobre un dataset de 5M muestras curado a partir de 20M ejemplos que incluyen anime, furry, arte y fotografia, reintroduciendo de forma explicita conceptos anatomicos que otros modelos suelen filtrar. La licencia es Apache 2.0, lo que permite uso, modificacion y redistribucion comercial sin las restricciones habituales de FLUX.1-dev.

El modelo parte de la arquitectura MMDiT de FLUX (12B parametros) y aplica una poda agresiva de la capa de modulacion AdaLN: los 3.3B parametros que FLUX dedica a codificar el timestep de denoising y los vectores CLIP agrupados se sustituyen por una FFN de 250M parametros, reduciendo el total a 8.9B con una perdida minima de calidad segun el autor. Entre las innovaciones tecnicas declaradas destacan el enmascarado de tokens de padding del codificador T5, modificaciones en la distribucion de timesteps y tecnicas de optimal transport por minibatch (marcadas como trabajo en curso).

Es relevante ahora porque representa un intento de la comunidad de mantener un modelo de difusion de gama alta bajo licencia permisiva, con registros de entrenamiento publicos y codigo disponible. El propio autor marca este repositorio como obsoleto y recomienda migrar a Chroma1-HD, Chroma1-Base o Chroma1-Flash. El repositorio `zhurrka/Chroma` parece ser una copia espejo, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Diffusion Transformer multimodal, derivada de FLUX.1-schnell) |
| Parametros totales | 8.9B (parte de 12B de FLUX.1-schnell tras poda de capa de modulacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del codificador de texto T5 XXL) |
| Tipos de cuantizacion | FP8 scaled (ComfyUI) y GGUF (ComfyUI-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FP8 y GGUF |

## Arquitectura y entrenamiento

Chroma es un Diffusion Transformer (DiT) construido sobre la arquitectura MMDiT de FLUX.1-schnell. La modificacion principal documentada es la reduccion de 12B a 8.9B parametros: FLUX dedica 3.3B parametros a una capa de modulacion (afinidad/proyeccion AdaLN) cuyo unico cometido es codificar el timestep de denoising y la informacion de los vectores CLIP agrupados (pooled). Tras comprobar experimentalmente que poner a cero esos vectores agrupados apenas alteraba la salida, el autor sustituyo dicha capa por una FFN de aproximadamente 250M parametros, completando el proceso en un dia sobre una unica RTX 3090. Otras modificaciones incluyen el enmascarado de los tokens de padding del codificador T5 (MMDiT masking), que segun el autor mejora la fidelidad y la estabilidad del entrenamiento, ajustes en la distribucion de timesteps y tecnicas de optimal transport por minibatch (marcadas como WIP).

El entrenamiento se realiza sobre un dataset de 5M muestras curado a partir de 20M ejemplos (anime, furry, arte y fotografia). Segun la model card, el autor ha consumido mas de 6000 horas de H100 solo en la fase de preentrenamiento, y el modelo seguia entrenandose en el momento de publicacion. Se mencionan tecnicas adicionales como T5 QAT training, prior preserving distribution training, "scramming" y optimizadores con dropout por bloques, todas ellas marcadas como trabajo en curso. El pipeline de inferencia usa el codificador de texto T5 XXL y el VAE de FLUX.

## Capacidades

- Generacion de imagenes texto-a-imagen de alta resolucion a partir de prompts en ingles.
- Modelo declarado como "fully uncensored": reintroduce conceptos anatomicos y contenido que otros modelos filtran, con etiqueta `not-for-all-audiences`.
- Estilizacion amplia: anime, furry, arte digital y fotografia realista gracias a la composicion del dataset de entrenamiento.
- Compatible con el ecosistema ComfyUI mediante workflow dedicado (T2I).
- Soporte de cuantizacion FP8 y GGUF para despliegue con recursos limitados.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo puramente generativo de imagenes.
- Sin capacidades de razonamiento multi-paso, vision, audio ni modo "thinking".
- Cobertura multilingue limitada al ingles en la metadata del modelo (aunque T5 XXL maneja otros idiomas, no se documenta soporte oficial).

## Casos de uso

- Generacion de arte conceptual para videojuegos y animacion: el modelo puede producir bocetos e ilustraciones estilizadas (anime, furry, arte digital) sin las restricciones tematicas de modelos comerciales, aprovechando el dataset de 5M muestras curado especificamente para estos estilos.
- Creacion de ilustraciones para proyectos de la comunidad open source: al estar bajo Apache 2.0, los artistas pueden usar las imagenes generadas en proyectos comerciales o abiertos sin las limitaciones de licencia de FLUX.1-dev.
- Prototipado rapido en ComfyUI: mediante el workflow oficial T2I, un desarrollador puede montar un pipeline de generacion local en minutos, usando checkpoints FP8 o GGUF para adaptarse al hardware disponible.
- Investigacion en destilacion y poda de modelos de difusion: el proceso documentado de reduccion de 12B a 8.9B mediante poda de la capa AdaLN sirve como caso de estudio reproducible para quienes investigan eficiencia en DiT.
- Fine-tuning y LoRAs comunitarias: la licencia permisiva y el formato safetensors facilitan el entrenamiento de adaptadores especificos de estilo sobre la base, algo restringido en modelos con licencias no comerciales.
- Contenido artistico para adultos (AV): la naturaleza sin censura del modelo lo hace adecuado para plataformas que requieren generacion de contenido explicito, siempre que la legislacion local lo permita y el despliegue se acompane de los filtros de seguridad oportunos.
- Despliegue en hardware de consumo: con cuantizacion GGUF o FP8 puede ejecutarse en GPUs de gama alta para consumidores, permitiendo a estudios pequenos generar imagenes localmente sin depender de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa: el transformer de 8.9B ocupa aproximadamente 17,8 GB en fp16, mas el codificador T5 XXL (unos 9,5 GB en fp16 o alrededor de 5 GB en fp8) y el VAE de FLUX.
- VRAM total estimada en fp16: en torno a 25-30 GB, lo que exige GPUs como A100 40GB, H100 o RTX 6000 Ada.
- Opciones de cuantizacion: checkpoints FP8 scaled (compatibles con ComfyUI) y GGUF, que reducen el consumo hasta permitir ejecucion en GPUs de consumo como RTX 3090/4090 (24 GB) y, con cuantizaciones mas agresivas, en GPUs de 12-16 GB.
- Despliegue: el flujo documentado es ComfyUI con el nodo ComfyUI-FluxMod (o el workflow oficial) y el nodo ComfyUI-GGUF para variantes cuantizadas. La integracion con diffusers esta marcada como WIP en la model card.
- Latencia y throughput: no disponibles. El autor menciona que el entrenamiento ha consumido mas de 6000 horas de H100, pero no publica cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Base arquitectonica | Licencia | Contexto/uso |
|---|---|---|---|---|
| Chroma | 8.9B | FLUX.1-schnell (MMDiT) | Apache 2.0 | Text-to-image, sin censura |
| FLUX.1-schnell | 12B | MMDiT | Apache 2.0 | Text-to-image, destilado para pocos pasos |
| FLUX.1-dev | 12B | MMDiT | No comercial | Text-to-image, mayor fidelidad |
| Stable Diffusion 3.5 Large | 8B | MMDiT | Stability AI Community License | Text-to-image, uso comercial con restricciones |

No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada. La comparativa se limita a parametros, arquitectura y licencia.

## Limitaciones y advertencias

- Repositorio marcado como obsoleto por el propio autor; recomienda usar Chroma1-HD, Chroma1-Base o Chroma1-Flash en su lugar.
- Se trata de una copia espejo (`zhurrka/Chroma`) con 0 descargas y 0 likes; el repositorio original es `lodestones/Chroma`, con un tamano de 1291,7 GB que sugiere multitud de checkpoints acumulados.
- Modelo en entrenamiento en el momento de publicacion: los pesos pueden ser inestables o incompletos.
- Etiquetado como `not-for-all-audiences` y declarado "fully uncensored": alto riesgo de generar contenido explicito, violento o potencialmente ilegal segun jurisdiccion. Requiere moderacion obligatoria en despliegues publicos.
- Sesgos: el dataset se centra en anime, furry, arte y fotografia, con posible infrarrepresentacion de otras culturas, etnias o estilos. No hay auditoria de sesgos publicada.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir anatomia incorrecta, texto ilegible y artefactos, especialmente en manos y rostros.
- Idiomas: solo se declara soporte de ingles en la metadata, lo que limita la calidad de la generacion con prompts en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero no cubre la responsabilidad legal derivada del contenido generado ni los derechos de terceros sobre el material de entrenamiento.
- No apto para tareas de razonamiento, texto, codigo ni agentes.
- Ruta diffusers marcada como WIP; la via recomendada es ComfyUI, lo que limita la integracion directa en pipelines Python estandar.

## Enlaces

- HuggingFace (repo consultado): https://huggingface.co/zhurrka/Chroma
- Repositorio original del autor: https://huggingface.co/lodestones/Chroma
- Repo de depuracion de entrenamiento: https://huggingface.co/lodestones/chroma-debug-development-only
- Logs de entrenamiento en vivo: https://training.lodestone-rock.com
- Codigo de entrenamiento: https://github.com/lodestone-rock/flow
- Custom node de ComfyUI: https://github.com/lodestone-rock/ComfyUI_FluxMod
- Galeria en CivitAI: https://civitai.com/posts/13766416
- Modelo en CivitAI: https://civitai.com/models/1330309/chroma
- Cuantizacion FP8 scaled: https://huggingface.co/Clybius/Chroma-fp8-scaled
- Cuantizacion GGUF: https://huggingface.co/silveroxides/Chroma-GGUF
- Codificador de texto T5 XXL: https://huggingface.co/comfyanonymous/flux_text_encoders
- VAE de FLUX: https://huggingface.co/lodestones/Chroma/resolve/main/ae.safetensors
- Workflow de ComfyUI: https://huggingface.co/lodestones/Chroma/resolve/main/ComfyUI_Chroma1-HD_T2I-workflow.json
