# speach1sdef178/VDN-H3-INT8-ConvRot-ComfyUI

## Resumen

El modelo **VDN-H3-INT8-ConvRot-ComfyUI** es un checkpoint de la etapa VDN (Video Diffusion Network) derivado del modelo de generación de vídeo **MiniMax H3**, preparado específicamente para el nodo **ComfyUI-VDN-H3-24GB**. Ha sido desarrollado por el usuario de HuggingFace **speach1sdef178** y se distribuye como un paquete listo para colocar en el directorio `ComfyUI/models/vdn/`. El repositorio tiene un tamaño de 3.5 GB y contiene únicamente los archivos de la etapa VDN, no el modelo base MiniMax H3, que debe descargarse por separado.

El checkpoint incorpora cuantización **INT8** y una variante técnica denominada **ConvRot**, además de incluir adaptadores `default` y `turbo`. La presencia del sufijo `stage-dmd-step-250` indica que se trata de un modelo destilado mediante **DMD (Diffusion Model Distillation)** con 250 pasos, lo que permite generar vídeos de 10 segundos en solo 8 pasos de muestreo. El modelo está pensado para ejecutarse en GPUs con 24 GB de VRAM, como la RTX 3090 Ti, y se ha validado en esa configuración. No se proporcionan datos sobre parámetros totales, longitud de contexto ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax H3 (derivado, etapa VDN INT8 ConvRot) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | no disponibles |
| Licencia | other (sujeta a la MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (model_int8_convrot_comfyui.safetensors, adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de la etapa VDN derivado de **MiniMax H3**, un modelo de generación de vídeo. La arquitectura subyacente es la de MiniMax H3, sobre la que se ha aplicado una cuantización **INT8** y una variante **ConvRot** (posiblemente una técnica de atención con convolución rotatoria). El nombre `stage-dmd-step-250` sugiere que el modelo ha sido destilado mediante **DMD** con 250 pasos, lo que reduce el número de pasos de muestreo necesarios (8 pasos en la configuración probada). El paquete incluye dos adaptadores, `default` y `turbo`, que se activan mediante parámetros como `apply_turbo_adapter` y `lora_mode=merge` en el nodo de ComfyUI.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas más allá de la cuantización INT8 y la variante ConvRot.

## Capacidades

- **Generacion de video**: el modelo genera secuencias de video a partir de latentes H3 en el entorno de ComfyUI.
- **Integracion con ComfyUI**: disenado especificamente para el nodo `ComfyUI-VDN-H3-24GB`; requiere una estructura de carpetas concreta y un nodo compatible.
- **Adaptadores multiples**: incluye adaptadores `default` y `turbo`, que permiten ajustar el comportamiento de generacion (por ejemplo, activando el adaptador turbo con `strength=1.0`).
- **Cuantizacion INT8**: reduce los requisitos de memoria en comparacion con pesos de precision completa, facilitando la ejecucion en GPUs de 24 GB.
- **Ref2V (referencia a video)**: segun repositorios similares, el modelo puede utilizarse para generar videos a partir de una imagen de referencia.
- **No se documentan** capacidades de texto, codigo, razonamiento, tool calling, agentes ni soporte multilingue.

## Casos de uso

- **Generacion de video local en ComfyUI**: el checkpoint se coloca en `ComfyUI/models/vdn/stage-dmd-step-250-int8_convrot_comfyui/` y se selecciona en el nodo `Apply-VDN`. Es adecuado para producir clips de video cortos sin depender de servicios externos.
- **Ref2V**: a partir de una imagen de referencia, el modelo puede generar un video animado. Segun el repositorio similar de `drbaph`, se usa con 8 pasos y un sampler `er_sde / beta`, lo que lo hace util para animar ilustraciones o fotografias.
- **Prototipado rapido de contenido audiovisual**: gracias al adaptador turbo y la cuantizacion INT8, se puede iterar rapidamente en una RTX 3090 Ti. La prueba documentada muestra 8 pasos de muestreo en 2:08 minutos para un video de 10 segundos.
- **Experimentacion con destilacion DMD**: el checkpoint `stage-dmd-step-250` permite evaluar el efecto de la destilacion en la calidad y velocidad de generacion, comparando con versiones sin destilar o con mas pasos.
- **Investigacion en cuantizacion INT8 y ConvRot**: sirve como referencia para estudiar el impacto de estas tecnicas en modelos de video, especialmente en cuanto a reduccion de memoria y mantenimiento de calidad.
- **Integracion en pipelines de produccion**: al ser un componente modular de ComfyUI, puede integrarse en flujos automatizados de generacion de contenido, siempre que se disponga de una GPU con 24 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El README incluye una prueba de rendimiento en una RTX 3090 Ti 24 GB con MiniMax H3 FL2VA INT8 ConvRot a 0.4 MP:

| Configuracion | Valor |
|---|---|
| Duracion del video | 10 segundos |
| Numero de pasos | 8 |
| Tiempo total de muestreo | 2:08 |
| Tiempo por iteracion | 16.06 s/it |

## Requisitos de hardware

- **VRAM estimada**: 24 GB, segun el preset `ComfyUI-VDN-H3-24GB`.
- **GPU recomendadas**: RTX 3090 Ti 24 GB (validada), RTX 4090 24 GB, A100 40 GB o similares con al menos 24 GB de VRAM.
- **Consumer GPU**: si, en tarjetas de 24 GB como la RTX 3090 Ti o la RTX 4090.
- **Opciones de despliegue**: exclusivamente a traves de ComfyUI con el nodo `ComfyUI-VDN-H3-24GB`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: 16.06 s/it en RTX 3090 Ti para 8 pasos, con un tiempo total de muestreo de 2:08 para un video de 10 segundos.

## Comparativa con modelos similares

| Modelo | Autor | Tamano del repo | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VDN-H3-INT8-ConvRot-ComfyUI | speach1sdef178 | 3.5 GB | INT8 | MiniMax H3 Community License | HuggingFace |
| vdn-minimax-h3-int8-convrot-comfyui | drbaph | no disponible | INT8 | no disponible | HuggingFace |
| Vdn-Minimax-H3-Comfy | t8star | no disponible | no disponible | no disponible | HuggingFace |

Los tres modelos son variantes de la misma base MiniMax H3 para ComfyUI, pero no se dispone de especificaciones detalladas de los repositorios alternativos. La comparativa se limita a la informacion publicada en cada repositorio.

## Limitaciones y advertencias

- **No incluye el modelo base**: el repositorio solo contiene la etapa VDN. El modelo MiniMax H3 debe descargarse por separado.
- **Licencia restrictiva**: esta sujeto a la MiniMax H3 Community License Agreement. Es necesario revisar las condiciones antes de cualquier uso comercial.
- **Dependencia de un nodo especifico**: requiere el nodo `ComfyUI-VDN-H3-24GB`; no es compatible con otros entornos sin adaptacion manual.
- **Estructura de archivos obligatoria**: el README advierte que se debe subir la estructura completa del checkpoint, no solo el archivo `safetensors` de la rama lineal.
- **Sin datos de entrenamiento**: no se publican detalles sobre el dataset, lo que dificulta evaluar sesgos, robustez o riesgos de alucinacion.
- **Posible degradacion por cuantizacion**: la cuantizacion INT8 puede reducir ligeramente la calidad visual en comparacion con pesos de mayor precision.
- **Limitaciones de idioma y contexto**: no se proporciona informacion sobre idiomas soportados ni longitud de contexto; se desconocen estas capacidades.

## Enlaces

- HuggingFace: https://huggingface.co/speach1sdef178/VDN-H3-INT8-ConvRot-ComfyUI
- Repositorio similar (drbaph): https://huggingface.co/drbaph/vdn-minimax-h3-int8-convrot-comfyui
- Repositorio similar (t8star): https://huggingface.co/t8star/Vdn-Minimax-H3-Comfy
- No se han encontrado papers, blogs ni demos adicionales.
