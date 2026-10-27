# taurusduan/MiniMax-H3-Turbo-Lora-ComfyUI

## Resumen

Este repositorio no contiene un modelo generativo completo, sino un conjunto de adaptadores LoRA de destilación few-step para MiniMax-H3, un modelo de difusión de vídeo con audio estéreo sincronizado de aproximadamente 33.000 millones de parámetros (dato publicado por MindStudio). Los adaptadores están reconvertidos al formato de pesos que espera ComfyUI, en bfloat16, y su función es reducir el número de pasos de muestreo necesarios para generar un clip, de forma que la inferencia resulte viable en hardware local. El autor del repositorio es taurusduan y el modelo base declarado es Comfy-Org/MiniMax-H3.

El interés técnico del paquete es que agrupa en un solo sitio cinco familias de LoRAs de aceleración que originalmente estaban dispersas: HyperFlow 8 pasos (derivadas del trabajo de Video Rebirth), extracciones VDN-H3 de 8 pasos, una LoRA experimental TaoMate FL2VA de 3 pasos con EMA, y cinco LoRAs dynamic-rank de LightX2V para flujo de imagen a vídeo (FL2V) y de referencia a vídeo (Ref2V). Cada familia cubre variantes para base completa y para base podada (*pruned* / *curve-form*), lo que obliga a emparejar correctamente el adaptador con el checkpoint base.

Es relevante ahora porque el cuello de botella práctico de los modelos de vídeo abiertos no es la calidad del modelo base sino el coste de muestreo: un LoRA de 4 a 8 pasos cambia el régimen de uso de decenas de pasos a unos pocos, y eso determina si el modelo cabe o no en una GPU de consumo. El repositorio, sin embargo, presenta cero descargas y cero interacciones en el momento de la consulta, y sus enlaces internos apuntan a la cuenta `drbaph` en lugar de a `taurusduan`, por lo que debe tratarse como un espejo no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (actualización de bajo rango, alpha igual al rank) sobre un modelo de difusión de vídeo MiniMax-H3; el flujo de muestreo y las secuencias sigma del repositorio confirman un esquema de denoising por pasos |
| Parametros totales | No disponible para el adaptador. El modelo base MiniMax-H3 tiene aproximadamente 33.000 millones de parámetros según MindStudio |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos distribuidos en bfloat16. Variantes remuestreadas a rank medio 20, 21, 28 y 64, y variantes podadas (*pruned*) para bases recortadas. No se documentan GGUF, int8 ni int4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (para el adaptador; la licencia del modelo base debe verificarse por separado) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 30,2 GB (incluye todas las variantes, no una sola) |
| Modelo base | Comfy-Org/MiniMax-H3 (relación: adapter) |
| Pipeline declarado | text-to-video |
| Variantes incluidas | HyperFlow 8 pasos (4 ficheros), LightX2V FL2V/Ref2V dynamic-rank (5 ficheros), VDN-H3 8 pasos (3 ficheros), TaoMate FL2VA 3 pasos EMA (1 fichero, experimental) |
| Fecha de creación / actualización | 2026-10-27 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es una LoRA convencional aplicada sobre el transformer de difusión de MiniMax-H3. La información disponible indica que el alpha se fija igual al rank, de modo que no hay factor de escala oculto que ajustar en el cargador; en la variante turbo de 4 pasos con EMA el fichero pesa aproximadamente 744 MB en bf16. Las distintas familias del repositorio provienen de procesos de destilación distintos: HyperFlow (8 pasos, con horario sigma fijo propio), LightX2V (4 y 8 pasos, con variantes de 768p y remuestreos dynamic-rank basados en SVD con rank medio 20/21/28/64) y VDN-H3 (extracciones DMD de 8 pasos). El repositorio no documenta el dataset de destilación, el número de tokens, ni si hubo RLHF o DPO; tampoco se describen innovaciones de atención o decodificación más allá de la reducción de pasos.

La parte técnicamente crítica es el horario de ruido. Para las conversiones a ComfyUI de HyperFlow, el autor recomienda una secuencia manual de nueve puntos sigma (ocho intervalos de denoising) que va de 1.0 a 0.0 pasando por valores intermedios como 0.9230769231 y 0.4687533149, o bien euler/simple con sigma normal. Para TaoMate FL2VA de 3 pasos la secuencia es `1.0, 0.961165, 0.853333, 0.0`, con una variante de 4 pasos `1.0, 0.970874, 0.907249, 0.640000, 0.0`. El autor advierte que, al usar la implementación original de Video Rebirth, debe respetarse su scheduler y loader nativos en lugar de sustituir el horario a mano. Además, las variantes `pruned` solo funcionan con bases podadas o *curve-form* correspondientes, y las variantes no podadas con la base completa.

## Capacidades

- Generación de texto a vídeo con audio estéreo sincronizado en una sola pasada, heredada del modelo base MiniMax-H3.
- Aceleración por destilación few-step: generación en 4, 8 o 3 pasos según la variante de LoRA, en lugar de un muestreo completo de decenas de pasos.
- Flujos FL2VA (primer y último fotograma a vídeo con audio) y Ref2VA (referencia a vídeo con audio), cubiertos por las extracciones de LightX2V y VDN-H3.
- Variantes específicas a 768p para el flujo FL2V de 4 pasos (v1.0 y v1.1 con distinto rank de remuestreo).
- Compatibilidad con ComfyUI mediante el nodo personalizado ComfyUI-MiniMax-H3-Turbo.
- Reducción de tamaño del adaptador frente al modelo base mediante remuestreo dynamic-rank y poda.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros dominios distintos del vídeo.

## Casos de uso

- Iteración rápida de prompts en local: cargar la variante HyperFlow de 8 pasos en ComfyUI permite comparar varias descripciones de escena en el tiempo que antes costaba una sola generación, porque el coste por clip baja de forma proporcional al número de pasos.
- Previsualización de guiones gráficos: usar la LoRA turbo de 4 pasos para generar borradores de baja exigencia antes de lanzar el render final con el modelo base sin acelerar.
- Animación a partir de un fotograma clave: el flujo FL2VA de 4 pasos a 768p sirve para convertir un *still* de un personaje o producto en un clip corto con audio sintetizado.
- Consistencia de personaje entre planos: el flujo Ref2VA permite usar una imagen de referencia y generar variaciones animadas manteniendo la identidad visual, útil en series cortas de contenido.
- Prototipado de anuncios y vídeo social: con clips de pocos segundos y resolución 768p, el adaptador hace viable un ciclo de prueba y error dentro de una sesión de trabajo en una estación con GPU profesional.
- Evaluación comparativa de métodos de destilación: al reunir HyperFlow, LightX2V, VDN-H3 y TaoMate en un mismo formato, el repositorio sirve para medir en igualdad de condiciones cuánta calidad se pierde al bajar de 8 a 4 o 3 pasos.
- Integración en pipelines de automatización de contenido: el nodo de ComfyUI se puede encadenar con otros nodos (upscaling, interpolación, muxing de audio) para producir lotes de clips de forma desatendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas (FVD, CLIP-score, sincronización audio-vídeo, MOS) ni comparaciones cuantitativas entre las distintas variantes, y tampoco se han encontrado en las fuentes consultadas. Cualquier afirmación sobre la pérdida de calidad al reducir pasos requeriría una evaluación propia.

## Requisitos de hardware

- VRAM del adaptador: un fichero LoRA individual ronda los 744 MB en bf16 (variante turbo 4 pasos EMA); las conversiones completas de HyperFlow y los remuestreos de mayor rank ocupan más. El repositorio completo son 30,2 GB, pero solo se carga un fichero a la vez.
- VRAM del modelo base: con 33.000 millones de parámetros en bf16, los pesos solos ocupan del orden de 66 GB, a lo que hay que sumar el text encoder, los VAE y las activaciones de vídeo. En la práctica esto implica H100 de 80 GB, A100 de 80 GB o reparto multi-GPU.
- Cuantización: no se documentan pesos GGUF, int8 ni fp8 oficiales para este adaptador. Si se recurre a una cuantización de la comunidad del modelo base, hay que verificar que el LoRA siga siendo compatible con el formato de pesos resultante.
- GPU de consumo: no hay soporte documentado para GPU de 24 GB o menos con el modelo base completo en bf16. Cualquier despliegue en RTX 4090 o similar dependería de builds cuantizadas no oficiales.
- Despliegue: la vía prevista es ComfyUI con el nodo personalizado Larryvrh/ComfyUI-MiniMax-H3-Turbo, colocando el `.safetensors` en `ComfyUI/models/loras/`. vLLM, TGI y llama.cpp no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Como referencia aritmética, si el coste por paso es constante, pasar de un muestreo de decenas de pasos a 8 o 4 reduce el tiempo de denoising en un factor aproximado de 6 a 12, pero no hay mediciones publicadas que lo confirmen para este modelo.

## Comparativa con modelos similares

Todas las alternativas comparables son también adaptadores LoRA para el mismo modelo base MiniMax-H3, no modelos independientes.

| Adaptador | Pasos | Origen | Formatos disponibles | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (taurusduan) | 3, 4 y 8 | HyperFlow, LightX2V, VDN-H3, TaoMate | safetensors bf16, versiones remuestreadas y podadas | Apache 2.0 | Agrega varias familias; enlaces internos apuntan a otra cuenta |
| Repositorio drbaph/MiniMax-H3-Turbo-Lora-ComfyUI | 3, 4 y 8 | Mismas fuentes | safetensors bf16 | Apache 2.0 | Mismo contenido aparente; precede a este repositorio |
| larryvrh turbo LoRA (4 pasos EMA, ckpt850) | 4 | Propio | safetensors bf16, ~744 MB | No disponible | Requiere el nodo ComfyUI-MiniMax-H3-Turbo; alpha igual al rank |
| HyperFlow original (Video Rebirth) | 8 | Video Rebirth | Implementación propia con scheduler y loader nativos | No disponible | Usa su propio horario sigma fijo; no sustituir a mano |
| LightX2V MiniMax-h3-Turbo | 4 y 8 | LightX2V | Pesos en layout ComfyUI | No disponible | Origen de las cinco variantes dynamic-rank de este repositorio |

## Limitaciones y advertencias

- El repositorio no contiene el modelo base: sin descargar MiniMax-H3, sus VAE y su text encoder, los ficheros son inutilizables.
- Riesgo alto de emparejamiento incorrecto: las variantes `pruned` solo funcionan con bases podadas o *curve-form*, y las completas con la base completa. Un emparejamiento erróneo produce resultados degradados o errores de carga.
- Sensibilidad al horario sigma: usar el scheduler por defecto en lugar de la secuencia manual recomendada puede arruinar la calidad de los clips de 8 pasos.
- Los ficheros de la carpeta `experimental/` (TaoMate 3 pasos, extracciones VDN-H3) están declarados como tales y no han pasado validación pública.
- Inconsistencia de atribución: el README enlaza repetidamente a `huggingface.co/drbaph/MiniMax-H3-Turbo-Lora-ComfyUI` mientras el repositorio consultado es `taurusduan/...`. Conviene verificar el origen real de los pesos antes de usarlos en producción.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta, sin métricas ni ejemplos publicados.
- Licencia: el adaptador es Apache 2.0, pero la licencia del modelo base Comfy-Org/MiniMax-H3 no se detalla en la información disponible y debe comprobarse para uso comercial.
- Sesgos y alucinación: no hay documentación sobre sesgos del modelo base ni sobre artefactos típicos de vídeo generado (parpadeos, deformaciones de manos, desincronización de audio) para estas variantes concretas.
- Idiomas: no se especifica qué idiomas admiten los prompts de texto ni el audio generado.
- Sin soporte de cuantización documentado, el despliegue en hardware de consumo queda fuera del ámbito soportado por el autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/MiniMax-H3-Turbo-Lora-ComfyUI
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio espejo del mismo contenido: https://huggingface.co/drbaph/MiniMax-H3-Turbo-Lora-ComfyUI
- Repositorio previo del mismo autor: https://huggingface.co/taurusduan/MiniMax-H3-Turbo-Lora
- HyperFlow (código): https://github.com/Video-Rebirth/hyperflow
- HyperFlow (pesos): https://huggingface.co/videorebirth/hyperflow
- LightX2V MiniMax-h3-Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo/tree/main
- Nodo ComfyUI: https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo
- Artículo de MindStudio sobre la LoRA turbo: https://www.mindstudio.ai/blog/minimax-h3-turbo-lora-comfyui-local
- Guía de configuración a 4 pasos: https://www.instasd.com/post/minimax-h3-turbo-lora-comfyui-4-steps
