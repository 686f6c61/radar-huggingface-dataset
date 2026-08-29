# ussoewwin/SAM3.1-ConvRot-INT8

## Resumen

El modelo `ussoewwin/SAM3.1-ConvRot-INT8` es una cuantización INT8 del checkpoint SAM 3.1 Multiplex de Meta, adaptada para su uso nativo en ComfyUI mediante la técnica ConvRot. Esta técnica aplica una rotación ortogonal de Hadamard antes de la cuantización por canal, lo que elimina los outliers de activación y reduce drásticamente el footprint de VRAM y disco, manteniendo una fidelidad estructural alta en tareas de segmentación. El repositorio tiene un tamaño de 0,9 GB, lo que sugiere una versión compacta del modelo original, pensada para entornos con recursos limitados.

El autor, `ussoewwin`, ha publicado también otros modelos cuantizados con la misma técnica (ControlNet, SDXL) y mantiene un repositorio de nodos ComfyUI para cargar estos pesos. La relevancia actual radica en la creciente demanda de modelos de segmentación eficientes que puedan ejecutarse en GPUs de consumo sin sacrificar demasiada precisión, especialmente en flujos de trabajo de generación y edición de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (SAM 3.1 Multiplex, segmentacion de imagenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 con ConvRot (rotacion de Hadamard ortogonal) |
| Idiomas soportados | no disponible (modelo de vision, sin texto) |
| Licencia | apache-2.0 (declarada en el repo) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es SAM 3.1 Multiplex de Meta, un transformer diseñado para segmentacion de imagenes con capacidad de procesar multiples mascaras y prompts. La version cuantizada aplica ConvRot, un metodo que rota los pesos mediante una matriz de Hadamard ortogonal antes de cuantizar a INT8 por canal. Esta rotacion distribuye los outliers de activacion de forma mas uniforme, reduciendo el error de cuantizacion y preservando la calidad de la segmentacion. No se dispone de informacion sobre el dataset de entrenamiento ni sobre el proceso de cuantizacion especifico (si se uso calibracion, fine-tuning posterior, etc.). El tamaño del repositorio (0,9 GB) sugiere que se trata de una cuantizacion agresiva del checkpoint original, que en su forma completa supera varios gigabytes.

## Capacidades

- Segmentacion de imagenes: genera mascaras de segmentacion a partir de prompts (puntos, cajas o mascaras previas), heredando las capacidades del modelo SAM 3.1.
- Soporte nativo en ComfyUI: los pesos estan preparados para cargarse con nodos personalizados (HSWQ Checkpoint Loader) que permiten seleccionar precision INT8 o FP8.
- Eficiencia de memoria: la cuantizacion INT8 con ConvRot reduce el uso de VRAM y el espacio en disco, permitiendo ejecutar el modelo en GPUs con menos memoria.
- Compatibilidad con flujos de trabajo de edicion: puede integrarse en pipelines de inpainting, recorte de objetos, generacion de mascaras para ControlNet, etc.
- No se han documentado capacidades de texto, tool calling ni agentes, al ser un modelo puramente visual.

## Casos de uso

- Segmentacion de objetos en ComfyUI: el modelo puede cargarse como checkpoint en un nodo HSWQ Loader y usarse para generar mascaras precisas de objetos en imagenes, facilitando tareas de inpainting o reemplazo de fondo.
- Edicion de imagenes con prompts interactivos: al igual que SAM 3.1, permite indicar puntos o cajas sobre la imagen para segmentar el objeto deseado, ideal para flujos de trabajo de retoque fotografico.
- Generacion de mascaras para ControlNet: las mascaras producidas pueden alimentar modelos de ControlNet para guiar la generacion de imagenes, aprovechando la baja huella de memoria del modelo cuantizado.
- Automatizacion de pipelines de vision por computador: en entornos con GPUs limitadas (por ejemplo, RTX 3060 o inferiores), este modelo permite ejecutar segmentacion sin necesidad de hardware profesional.
- Prototipado rapido de aplicaciones de segmentacion: al ser un checkpoint ligero, se puede integrar en aplicaciones de escritorio o servidores locales sin grandes requisitos de RAM.
- Investigacion en cuantizacion de modelos de vision: el repositorio sirve como ejemplo de aplicacion de ConvRot a un modelo SAM, util para estudios comparativos de metodos de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como mIoU, Dice o comparaciones con el modelo original en tareas de segmentacion. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: con un tamaño de 0,9 GB en INT8, el modelo deberia caber en GPUs con 4 GB de VRAM o menos, aunque el uso real depende del resto del pipeline (VAE, decodificador, etc.).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 2060, RTX 3060, etc.). Para flujos completos de ComfyUI, se recomienda 8 GB o mas.
- Compatibilidad con consumer GPU: si, es uno de los objetivos de la cuantizacion ConvRot.
- Opciones de despliegue: ComfyUI con los nodos HSWQ Loader (repositorio de ussoewwin). Tambien podria usarse con otras herramientas que soporten pesos INT8, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3.1 Multiplex (original) | no disponible | no aplica | FP16/FP32 | SAM license (Meta) | Hugging Face |
| Sparknight/sam3.1-int8-int4-convrot | no disponible | no aplica | INT8 + INT4 ConvRot | sam-license | Hugging Face |
| ussoewwin/SAM3.1-ConvRot-INT8 | no disponible | no aplica | INT8 ConvRot | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre las versiones cuantizadas es el esquema de cuantizacion (INT8 puro vs INT8+INT4) y la licencia declarada. El modelo original de Meta tiene una licencia propia (SAM license) que puede restringir el uso comercial, mientras que este repo declara apache-2.0, aunque conviene verificar la legalidad de la redistribucion.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir perdidas de precision en segmentaciones finas o en imagenes con mucho detalle, aunque ConvRot mitiga parcialmente este efecto.
- No se ha verificado la compatibilidad total con todas las funcionalidades de SAM 3.1 (por ejemplo, prompts de texto si los tuviera, aunque SAM 3.1 es principalmente visual).
- La licencia declarada es apache-2.0, pero el modelo base SAM 3.1 de Meta tiene su propia licencia (SAM license) que puede imponer restricciones adicionales. Se recomienda revisar los terminos antes de un uso comercial.
- No hay informacion sobre el proceso de cuantizacion (calibracion, dataset usado), lo que dificulta evaluar la robustez del modelo en dominios especificos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco probado por la comunidad.
- No se garantiza la ausencia de sesgos en la segmentacion, ya que el modelo base puede tener sesgos de genero, raza o contexto, aunque al ser un modelo de vision el riesgo es menor que en modelos de texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ussoewwin/SAM3.1-ConvRot-INT8
- Repositorio de nodos ComfyUI (HSWQ Loader): https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Modelo similar de Sparknight: https://huggingface.co/Sparknight/sam3.1-int8-int4-convrot
- Modelo ControlNet ConvRot del mismo autor: https://huggingface.co/ussoewwin/ControlNet-models-ConvRot-INT8
- Pagina en Civitai: https://civitai.com/models/2823010/sam-31-int8-int4-native-convrot
