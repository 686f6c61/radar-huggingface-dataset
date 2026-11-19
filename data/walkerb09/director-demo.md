# Walkerb09/Director-demo

## Resumen

Director Studio es un sistema de orquestación de vídeo generativo multi-plano construido sobre ComfyUI y el modelo MiniMax H3 Ref2VA. No se trata de un modelo de pesos en sentido estricto, sino de un paquete de workflows, nodos auxiliares y scripts de instalación que coordinan varios modelos (generación de vídeo, análisis visual y planificación) para producir secuencias de varios planos con coherencia de personajes. Lo desarrolla Walker Bechtol y se distribuye con licencia MIT.

El problema que aborda es la deriva entre planos: los modelos de vídeo generan bien un plano aislado pero mal secuencias largas, porque caras, ropa y posiciones cambian de un plano a otro, y realimentar un fotograma generado como referencia del siguiente amplifica los defectos. La idea central, denominada Clean Chain, es que ningún fotograma generado se use nunca como condicionamiento visual de planos posteriores: cada plano se genera a partir de las fotos originales de las personas y lugares, y la información de continuidad viaja como texto.

El repositorio público es una demo de 0,1 GB que se instala sola en una máquina Vast.ai con GPU de 24 GB. No contiene pesos de modelo ni personas de ejemplo: el instalador descarga aproximadamente 53 GB de dependencias en el primer arranque. El sistema completo está pensado para GPUs de 96 GB con pesos BF16, y la demo usa versiones reducidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de orquestación sobre ComfyUI; generación con MiniMax H3 Ref2VA, análisis visual con Qwen3-VL 8B, memoria de estado en texto |
| Parametros totales | no disponible (el repo no contiene pesos; la demo usa H3 pruned w6a8 de 16 GB, text encoder nvfp4 de 15,7 GB, VAE int8 de 2,8 GB y Qwen3-VL 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w6a8 (modelo de vídeo pruned), nvfp4 (text encoder), int8 (VAE de vídeo); el sistema completo usa BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | paquete ZIP con workflows y nodos de ComfyUI; pesos descargados aparte (formatos no especificados en la información disponible) |

## Arquitectura y entrenamiento

Director Studio no entrena ningún modelo propio. Es una capa de orquestación modular sobre ComfyUI que combina cuatro componentes: generación de vídeo con MiniMax H3 Ref2VA, invocado con su formato oficial de prompt `<Subject N>` / `<Picture N>`; análisis visual de cada toma con un Qwen3-VL local que describe lo que realmente ocurrió; una memoria de estado de escena exclusivamente textual con posiciones, acciones y hechos de continuidad; y un planificador de planos que redacta cada toma a partir de la historia y del estado de escena.

La innovación técnica principal es la restricción Clean Chain: los fotogramas generados nunca se convierten en condicionamiento visual de generaciones posteriores. Cada plano se construye solo con las fotos originales (y recortes de estas), mientras que la información derivada de las tomas generadas se transforma en texto y se propaga por la memoria de estado. El sistema incluye además evaluación automática de cada toma (identidad facial con YuNet + SFace, colocación, entradas en cuadro, orientación), clasificación de tomas y evaluación editorial de los cortes entre planos, con puertas de revisión humana para los casos inciertos.

El desarrollo se realizó de forma iterativa con asistencia de código de Claude (Anthropic), con pruebas deliberadas de modos de fallo, comparaciones A/B con la misma semilla y cambios de arquitectura guiados por el comportamiento observado. No se dispone de información sobre datasets de entrenamiento porque el sistema no entrena modelos.

## Capacidades

- Orquestación de vídeo multi-plano a partir de una descripción en lenguaje natural, con planificación de encuadre, entradas en escena, movimiento y diálogo.
- Conversión de la descripción del usuario al formato oficial de prompt de H3 (`<Subject N>` / `<Picture N>`), con temporización.
- Consistencia de personajes: un actor tiene una referencia principal que fija ropa, pelo y maquillaje, y fotos adicionales de cara y cuerpo solo la complementan; la identidad se verifica con YuNet + SFace.
- Colocación espacial de personajes en el encuadre, con detección de deriva o intercambio de lados y regeneración de las tomas fallidas.
- Análisis automático de cada toma mediante Qwen3-VL local, que produce descripciones textuales de lo ocurrido para alimentar la continuidad.
- Memoria de estado de escena en texto: posiciones, acciones y hechos de continuidad para el siguiente plano.
- Evaluación automática y clasificación de tomas, y evaluación editorial de los cortes entre planos.
- Puertas de revisión humana que retienen los casos inciertos para aprobación manual.
- Historial de proyecto con deshacer, repetir toma, comparación A/B y edición de clips (recorte y división).
- Ejecución completamente local, sin APIs de pago.

## Casos de uso

- Previsualización de cortometrajes con IA: un guionista describe una secuencia de varios planos y el sistema genera cada toma manteniendo la misma cara y vestuario entre planos, lo que permite validar la continuidad narrativa antes de una producción mayor.
- Prototipado de storyboards animados: el planificador de planos traduce la historia a encuadres concretos con entradas y movimiento, útil para presentar una idea a un cliente o equipo con vídeo en lugar de dibujos estáticos.
- Producción de vídeo publicitario con personajes recurrentes: la referencia principal de cada actor fija la apariencia y la verificación con YuNet + SFace evita que el personaje cambie entre planos de un mismo anuncio.
- Generación de secuencias educativas o explicativas: la memoria de estado textual permite encadenar planos donde un presentador se mueve por escenarios distintos sin perder continuidad de posición ni de vestuario.
- Evaluación comparativa de tomas para equipos de posproducción: el historial con comparación A/B, la clasificación de tomas y la evaluación de cortes permiten elegir la mejor versión de cada plano con criterios medibles de identidad y colocación.
- Investigación sobre coherencia en vídeo generativo: el diseño Clean Chain y las métricas de evaluación incorporadas sirven como banco de pruebas para estudiar la deriva entre planos sin la contaminación de realimentar imágenes generadas.
- Despliegue en infraestructura alquilada: la plantilla de Vast.ai con GPU de 24 GB permite levantar el estudio completo en minutos para sesiones puntuales de generación sin adquirir hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU de 24 GB para la demo: RTX 4090, RTX 3090, A5000 o L4, según la model card.
- Memoria de sistema: 64 GB o más.
- Disco: 120 GB.
- Primer arranque: aproximadamente 53 GB de descargas y una instalación en segundo plano.
- Sistema completo (no demo): pensado para GPUs de 96 GB con pesos BF16; las tomas de la demo tienen algo menos de detalle que con el conjunto BF16 completo.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 con 24 GB, en configuración de demo.
- Despliegue: ComfyUI (el sistema corre oculto tras la interfaz del Director, con la página de nodos en `/?comfy=1`), plantilla de Vast.ai para aprovisionamiento automático; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Enfoque | Modelo base | Requisitos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Director Studio (esta ficha) | Orquestación multi-plano con Clean Chain | MiniMax H3 Ref2VA + Qwen3-VL 8B | GPU 24 GB (demo), 96 GB (completo), 64 GB RAM, 120 GB disco | MIT | Repositorio en Hugging Face y plantilla en Vast.ai |
| ComfyUI (base) | Motor de workflows de generación | Cualquiera compatible | Variable según modelo | GPL-3.0 (no confirmado en la información disponible) | Público |
| MiniMax H3 Ref2VA | Generación de vídeo de un solo plano | Propio | Según cuantización | no disponible | a través de Comfy-Org |
| Qwen3-VL 8B | Análisis visual y descripción | Propio | GPU de consumo | no disponible | Público |

No se dispone de datos de rendimiento comparativo entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- La demo no incluye pesos de modelo: el repositorio de 0,1 GB solo contiene el paquete ZIP, el manifiesto `latest.json` y el script de aprovisionamiento; los modelos se descargan en el primer arranque.
- No contiene personas, fotos ni vídeos de ejemplo; el usuario debe aportar sus propias fotos y solo debe usar imágenes de personas que hayan dado su consentimiento.
- Las tomas de la demo tienen menos detalle que las del sistema completo con BF16, por usar el modelo pruned w6a8, el text encoder nvfp4 y el VAE int8.
- El sistema está diseñado y probado para el formato de prompt oficial de H3; cambios en ese formato o en los modelos de Comfy-Org pueden romper la orquestación.
- La verificación de identidad facial y de colocación depende de YuNet + SFace y de umbrales de evaluación; los casos inciertos se derivan a revisión humana, lo que implica supervisión manual en producción.
- No se dispone de información sobre sesgos, comportamiento multilingüe ni idiomas soportados.
- La licencia MIT del repositorio cubre el código y los workflows, pero no necesariamente los pesos de terceros descargados (MiniMax H3, Qwen3-VL), cuyas condiciones deben verificarse por separado.
- El proyecto se describe como experimental, con cambios de arquitectura guiados por el comportamiento observado; no hay garantías de estabilidad de API o de workflows entre versiones.
- El aprovisionamiento automático está ligado a una plantilla concreta de Vast.ai y a un enlace de referencia; el despliegue en otro proveedor requiere adaptar el script.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Walkerb09/Director-demo
- Plantilla de Vast.ai para el Director Studio: https://cloud.vast.ai?ref_id=711729&template_id=05188193265b52bc7465c1b122e80bfb
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
