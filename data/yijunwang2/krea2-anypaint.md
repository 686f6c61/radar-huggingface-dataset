# yijunwang2/krea2-anypaint

## Resumen

Krea 2 AnyPaint es un adaptador funcional (LoRA) para el modelo de difusion Krea 2 Turbo, desarrollado por el usuario yijunwang2. Su proposito es anadir capacidades de inpainting, outpainting y edicion de imagen con mascaras de forma arbitraria sobre el modelo base, cubriendo casos que los adaptadores de inpainting convencionales no resuelven bien: regiones desconectadas, estructuras estrechas o curvas, y mascaras que cruzan el borde de la imagen original.

El adaptador se distribuye como un repositorio de 0,5 GB en formato diffusers, con un pipeline propio (`anypaint.py`, `pipeline.py`) y un script de ejemplo (`example.py`). No es compatible con el snippet autogenerado de Diffusers ni con importadores LoRA convencionales, lo que exige usar el codigo incluido. El modelo base es `krea/Krea-2-Turbo`, y el adaptador hereda su licencia comunitaria.

La relevancia actual del modelo reside en unificar inpainting y outpainting en una sola pasada y con un unico contrato de entrada: los pixeles blancos de la mascara se generan o editan, los negros se preservan, y todo pixel fuera del lienzo de origen se marca automaticamente como generado. Esto simplifica pipelines de edicion de imagen en produccion, donde antes se requerian herramientas separadas para cada tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusion (Krea 2 Turbo); arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (repositorio de 0,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (enlace: https://krea.ai/krea-2-licensing) |
| Formato de pesos | diffusers (repositorio de 0,5 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA disenado para acoplarse al modelo base Krea 2 Turbo. La innovacion tecnica principal es el uso de restricciones latentes alineadas por timestep (timestep-matched latent constraints) para preservar las regiones no enmascaradas durante la generacion. Esto permite que una unica pasada de inferencia gestione inpainting interno, extension de lienzo (outpainting), regiones desconectadas y mascaras mixtas que cruzan el limite de la fuente.

El contrato de entrada es binario y explicito: los pixeles blancos de la mascara se generan o editan, los negros se conservan, y el helper marca como generado todo pixel situado fuera del lienzo de origen. De este modo, inpainting y outpainting comparten la misma interfaz. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un modelo de difusion de imagen, estos conceptos no aplican de forma directa.

## Capacidades

- Edicion de imagen con mascaras de forma arbitraria y trazos a mano alzada.
- Inpainting sobre el mismo lienzo, preservando las regiones no enmascaradas.
- Outpainting en una sola pasada hacia un lienzo de mayor tamano.
- Gestion de multiples regiones de edicion desconectadas en una misma peticion.
- Manejo de mascaras estrechas, curvas y que cruzan el borde de la imagen original.
- Combinacion de inpainting y outpainting en una unica solicitud.
- Preservacion de las zonas no enmascaradas mediante restricciones latentes alineadas por timestep.
- Integracion con ComfyUI mediante nodos especificos.
- Demo interactiva en un Space de ZeroGPU.

## Casos de uso

- Restauracion y retoque fotografico: eliminar objetos no deseados o rellenar huecos con mascaras de forma libre, manteniendo intacto el resto de la imagen gracias a las restricciones latentes por timestep.
- Ampliacion de lienzo para formatos de impresion o redes sociales: extender una composicion vertical u horizontal en una sola pasada, sin costuras visibles, usando el modo outpainting del adaptador.
- Edicion de producto en e-commerce: cambiar el fondo, el color o el material de un articulo manteniendo la forma original, con mascaras que cubren solo la region del producto (como muestra el ejemplo `11_product_restyle`).
- Postproduccion arquitectonica e inmobiliaria: sustituir vistas por ventanas, anadir mobiliario o modificar acabados en renders, con mascaras que afectan a varias regiones desconectadas a la vez.
- Creacion de contenido para juegos y animacion: editar ilustraciones, renders 3D o arte conceptual con mascaras irregulares, combinando edicion interna y extension de lienzo en un mismo flujo.
- Flujos de trabajo en ComfyUI: integrar los nodos de AnyPaint en grafos de generacion existentes para tareas de edicion iterativa con Krea 2 Turbo como base.
- Prototipado rapido en demos interactivas: usar el Space de ZeroGPU para validar mascaras y prompts antes de desplegar el pipeline en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio del adaptador ocupa 0,5 GB, pero la inferencia requiere cargar el modelo base Krea 2 Turbo completo, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; depende del modelo base y de la cuantizacion empleada.
- Opciones de despliegue: pipeline propio de Diffusers incluido en el repositorio (`example.py`, `pipeline.py`, `anypaint.py`), nodos de ComfyUI y Space de ZeroGPU. El snippet autogenerado de Diffusers y los importadores LoRA convencionales no son compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 AnyPaint | LoRA de inpainting/outpainting sobre Krea 2 Turbo | no disponible (repo 0,5 GB) | no aplica | krea-2-community-license | Hugging Face, ComfyUI, Space |
| Krea 2 Turbo (base) | Modelo de difusion de imagen | no disponible | no aplica | krea-2-community-license | Hugging Face (`krea/Krea-2-Turbo`) |
| Adaptadores funcionales Krea 2 (coleccion del mismo autor) | LoRA sobre Krea 2 Turbo | no disponible | no aplica | krea-2-community-license | Hugging Face (coleccion `krea-2-functional-adapters`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es compatible con el snippet autogenerado de Diffusers ni con importadores LoRA convencionales; es obligatorio usar el codigo incluido (`example.py`, `pipeline.py`, `anypaint.py`).
- La licencia krea-2-community-license impone condiciones especificas para uso comercial; es necesario revisar el enlace oficial antes de desplegar en produccion.
- No se dispone de informacion sobre sesgos, tasas de alucinacion visual ni limitaciones idiomaticas.
- El modelo base Krea 2 Turbo puede imponer sus propias restricciones de uso y calidad de generacion.
- Los ejemplos de la model card son sinteticos y generados con prompts originales; los resultados en dominios reales pueden variar.
- No se han publicado benchmarks que permitan validar el rendimiento frente a alternativas de inpainting.
- El repositorio tiene un tamano reducido (0,5 GB), lo que sugiere que solo contiene el adaptador y no los pesos completos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yijunwang2/krea2-anypaint
- Space interactivo (ZeroGPU): https://huggingface.co/spaces/yijunwang2/krea2-anypaint
- Nodos de ComfyUI: https://github.com/alexw5702-afk/krea2-anypaint
- Coleccion de adaptadores funcionales Krea 2: https://huggingface.co/collections/yijunwang2/krea-2-functional-adapters-6a700e9e5c134888d6615a5d
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia: https://krea.ai/krea-2-licensing
