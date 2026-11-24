# Xabsurd/MOSS-Image-Tile-Control

## Resumen

MOSS-Image Tile Control es un adaptador de control de tipo tile para el modelo de difusion MOSS-Image, desarrollado por el usuario Xabsurd. Su funcion es refinar detalles de imagen preservando la estructura y las caracteristicas del sujeto original, y esta pensado para tareas de image-to-image, restauracion de imagen y refinamiento tras upscaling. Se integra en ComfyUI mediante nodos personalizados del proyecto ComfyUI-MOSS-LLLite.

El adaptador se construye sobre MOSS-Image-Base y MOSS-Image-SFT de OpenMOSS-Team y emplea la tecnica MOSS-LLLite para inyectar la senal de control. La version V1 es la recomendada por el autor tras cuatro iteraciones de diseno, y ofrece la mejor relacion entre claridad, detalle y retencion de color segun sus pruebas visuales. El repositorio ocupa 0,6 GB e incluye varios checkpoints (V1, beta2 y beta3) con distintos caminos de control.

La relevancia del modelo radica en que aporta una via de refinamiento controlado por imagen de referencia dentro del ecosistema MOSS-Image, con un nodo experimental de compensacion de color (Apply MOSS Color Guide) que mitiga la deriva cromatica. No es un modelo generativo autonomo, sino un adaptador que requiere el modelo base y un entorno ComfyUI configurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador de control tile sobre difusion (MOSS-LLLite), basado en MOSS-Image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original) |
| Idiomas soportados | en (etiqueta de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El adaptador sigue el paradigma de ControlNet/LLLite aplicado al modelo MOSS-Image. La version V1 utiliza MOSS-LLLite para inyectar la imagen de referencia como senal de control en el proceso de muestreo, refinando detalles sin alterar la estructura global ni las caracteristicas del sujeto. Las versiones anteriores emplean caminos distintos: beta2 es un LoRA sobre MOSS-Image-Base orientado a maxima preservacion, y beta3 es un adaptador residual sobre MOSS-Image-SFT orientado a velocidad pero con tendencia a suavizar el detalle de alta frecuencia.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, que no aplican a este tipo de adaptador. La innovacion destacable es el nodo experimental Apply MOSS Color Guide, que usa colores decodificados por el VAE Flux2 como retroalimentacion para corregir el latente final y reducir la deriva de color, a costa de un mayor tiempo de procesamiento (nueve decodificaciones VAE completas adicionales con dos iteraciones).

## Capacidades

- Refinamiento de detalle en image-to-image preservando estructura y sujeto.
- Restauracion de imagen guiada por una imagen de referencia existente.
- Refinamiento tras upscaling de imagenes.
- Control estructural mediante tile con distintos niveles de intensidad segun version (V1, beta2, beta3).
- Compensacion experimental de color mediante el nodo Apply MOSS Color Guide.
- Integracion nativa en ComfyUI con nodos personalizados y soporte de la API V3 de nodos.
- Compatibilidad con muestreo por tiles para imagenes de gran tamano.
- No soporta tool calling, agentes ni capacidades multimodales de texto; es exclusivamente un adaptador de imagen.

## Casos de uso

- Restauracion de fotografias antiguas o degradadas: el adaptador reconstruye texturas plausibles guiado por la imagen original, aunque los detalles generados son reconstrucciones plausibles y no recuperacion garantizada de la informacion perdida.
- Refinamiento tras upscaling: se aplica despues de un escalado para recuperar nitidez y detalle fino manteniendo la estructura, usando V1 como opcion recomendada por el autor.
- Limpieza de imagenes generadas previamente: permite repasar resultados de MOSS-Image o de otros pipelines para mejorar claridad y detalle sin cambiar el sujeto.
- Flujos de trabajo en ComfyUI con muestreo por tiles: util para procesar imagenes grandes por regiones, aportando a cada sampler la referencia del tile correspondiente.
- Correccion de deriva cromatica en pipelines de restauracion: el nodo Apply MOSS Color Guide permite reducir el desvio de color cuando la fidelidad cromatica es prioritaria, asumiendo mayor tiempo de proceso.
- Prototipado rapido de restauracion con control: la version beta3 ofrece el camino mas rapido para pruebas donde prima la velocidad sobre el detalle de alta frecuencia.
- Investigacion sobre adaptadores de control: sirve como referencia para estudiar la tecnica LLLite aplicada a modelos de difusion MOSS-Image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente comparaciones visuales subjetivas del autor entre las versiones V1, beta2 y beta3, sin metricas estandarizadas. La tabla de versiones indica que V1 ofrece la mejor claridad y detalle, beta2 la mayor preservacion de caracteristicas originales y beta3 la mayor velocidad de muestreo, pero no se aportan numeros de latencia, FID, PSNR ni SSIM.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image y de la resolucion de muestreo. El adaptador en si ocupa 0,6 GB en disco.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base MOSS-Image.
- Opciones de despliegue: ComfyUI con los nodos personalizados ComfyUI-MOSS-LLLite (requiere version reciente de ComfyUI con soporte nativo de MOSS-Image, Anima LLLite y la API V3 de nodos). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles. El nodo Apply MOSS Color Guide anade coste computacional con dos iteraciones (nueve decodificaciones VAE completas adicionales y seis codificaciones de calibracion).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image Tile Control V1 | Adaptador tile (LLLite) | MOSS-Image-SFT | Refinamiento de detalle y restauracion | no disponible | Hugging Face + ComfyUI |
| MOSS-Image Tile Control beta2 | LoRA | MOSS-Image-Base | Maxima preservacion de caracteristicas | no disponible | Hugging Face + ComfyUI |
| MOSS-Image Tile Control beta3 | Adaptador residual | MOSS-Image-SFT | Velocidad prioritaria | no disponible | Hugging Face + ComfyUI |

No se dispone de informacion sobre adaptadores tile de otros ecosistemas (por ejemplo, ControlNet tile para Stable Diffusion) que permita una comparacion cuantitativa con este modelo.

## Limitaciones y advertencias

- Los detalles generados son reconstrucciones plausibles, no recuperacion garantizada de la informacion original de la imagen.
- La licencia no esta disponible, por lo que el uso comercial queda sin garantia juridica clara y requiere verificacion previa.
- El nodo Apply MOSS Color Guide es experimental: puede alterar brillo y contraste local, reducir la nitidez aparente y aumentar el tiempo de procesamiento; no garantiza colores exactos.
- La version beta3 tiende a suavizar el detalle de alta frecuencia, segun el propio autor.
- Las comparaciones entre versiones son evaluaciones visuales del autor, no benchmarks estandarizados; la misma intensidad numerica no implica la misma intensidad de control entre versiones.
- Requiere un entorno ComfyUI reciente con soporte nativo de MOSS-Image y Anima LLLite; la instalacion incorrecta de nodos antiguos puede provocar IDs duplicados.
- El modelo esta etiquetado unicamente en ingles y no aporta capacidades de texto, razonamiento ni tool calling.
- Riesgo de sesgos y alucinacion visual: el adaptador puede inventar texturas que no existian en la imagen original, especialmente en zonas con poca informacion.

## Enlaces

- Hugging Face: https://huggingface.co/Xabsurd/MOSS-Image-Tile-Control
- Repositorio de nodos ComfyUI-MOSS-LLLite: https://github.com/X-absurd/ComfyUI-MOSS-LLLite
- Documentacion del nodo de guia de color: https://github.com/X-absurd/ComfyUI-MOSS-LLLite#experimental-color-guide
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Apoyo al proyecto (Ko-fi): https://ko-fi.com/xabsurd
