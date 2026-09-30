# tanmaygoyal26/Muse-Glimmer-30B-ExecuTorch-PTE

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de 30 000 millones de parametros desarrollado por Meta Superintelligence Lab (publicado en agosto de 2026) y disenado especificamente para tareas agenticas autonomas que se ejecutan en hardware de consumo, sin depender de infraestructura en la nube ni de conectividad de red. El modelo integra razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion de fallos en un unico modelo, y se presenta como destilado de Muse Spark, con un codificador de percepcion dedicado para entrada de imagen. Su ventana de contexto es de 131 072 tokens (128K) en todas las variantes.

La ficha que nos ocupa no documenta el modelo original, sino el repositorio `tanmaygoyal26/Muse-Glimmer-30B-ExecuTorch-PTE`, un reempaquetado de terceros de `meta-models/Muse-Glimmer-30B` (0 descargas y 0 likes en el momento de la consulta) que contiene 16 variantes pre-exportadas en formato PTE de ExecuTorch. Un PTE es el artefacto serializado que produce ExecuTorch a partir de un modelo de PyTorch, rebajado y optimizado para un backend concreto: en este caso, NVIDIA CUDA (`sm80+ptx`) y Apple Silicon (`metal`). El repositorio ocupa 372,1 GB en total.

La relevancia de este artefacto es de ingenieria mas que de modelado: en lugar de reimplementar el modelo a mano para cada runtime, el grafo completo (arquitectura multimodal y estrategia de decodificacion especulativa incluida) se escribe una sola vez en PyTorch y `torch.export` lo rebaja por adelantado. El resultado son variantes listas para servir con backend Metal (via MLX) o CUDA, con y sin decodificacion especulativa DFlash, y en modalidad solo texto o texto+imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con codificador de percepcion dedicado; decodificacion especulativa de bloque (DFlash) integrada en las variantes correspondientes |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | 131 072 tokens (128K), identica en las 16 variantes |
| Tipos de cuantizacion | `k-quant-17G` (~4 bits, K-quant, orientada a un presupuesto de 24 GB) y `k-quant-dynamic` (~4 bits, K-quant, orientada a 32 GB y ligeramente mas precisa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (artefacto serializado de ExecuTorch, obligatorio en todas las variantes); `.ptd` (blob del delegate de CUDA con los pesos, obligatorio y solo en variantes `sm80+ptx`); `pos_embed.bin` (embeddings de posicion de imagen precalculados, solo en variantes `text-image`). Los checkpoints GGUF cuantizados se citan como punto de partida recomendado para exportar |

## Arquitectura y entrenamiento

Muse Glimmer es un modelo de lenguaje causal de 30B parametros con un codificador de percepcion dedicado, lo que lo convierte en un modelo multimodal de tipo image-text-to-text. La arquitectura incorpora dos innovaciones que condicionan todo el proceso de exportacion: la entrada multimodal y una estrategia de decodificacion especulativa basada en difusion de bloques denominada DFlash. En las variantes `dflash`, el modelo objetivo y el modelo borrador (drafter) se exportan juntos en un unico `.pte` y comparten embeddings de tokens y cabeza de salida, de modo que el coste del borrador es muy inferior al de un segundo modelo independiente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO; la unica referencia al proceso de entrenamiento es que el modelo fue destilado a partir de Muse Spark.

El valor tecnico del repositorio reside en el mecanismo de exportacion. ExecuTorch usa `torch.export` para rebajar el grafo completo por adelantado a cada backend: Triton sobre CUDA y MLX nativo mas Metal personalizado sobre Apple Silicon. Esto evita que cada runtime local tenga que reimplementar por separado la arquitectura multimodal y la decodificacion especulativa. El repositorio distribuye 16 directorios con un esquema de nombres fijo, `muse-glimmer-<quant>-128K-<modality>-<decoding>-<backend>`, donde `<quant>` es `k-quant-17G` o `k-quant-dynamic`, `<modality>` es `text` o `text-image`, `<decoding>` es `solo` o `dflash` y `<backend>` es `metal` o `sm80+ptx`. No existe variante para CPU.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas agenticas de larga duracion.
- Uso fiable de herramientas (tool use / function calling), con renderizado de definiciones de herramientas por parte del servidor mediante `chat_template.jinja`.
- Recuperacion de fallos: el modelo esta ajustado explicitamente para detectar y reencauzar ejecuciones que fallan dentro de un flujo agentico.
- Comprension multimodal texto+imagen mediante el codificador de percepcion, disponible solo en las variantes `text-image`.
- Ejecucion totalmente local, sin acceso a red ni a infraestructura en la nube.
- Decodificacion especulativa DFlash opcional, que acelera la generacion a costa de memoria y tamano de descarga.
- Servido compatible con la API de OpenAI a traves del runtime de ExecuTorch.
- Capacidades multilingues: no disponible.
- No se documentan capacidades de audio ni de generacion de imagen.

## Casos de uso

- Agentes autonomos locales en portatil o estacion de trabajo: el modelo esta disenado para ejecutarse sin nube, de modo que se puede desplegar un agente completo en una maquina con 24 o 32 GB de VRAM o memoria unificada, útil cuando los datos no pueden salir del dispositivo.
- Automatizacion de escritorio y computer use: la combinacion de tool calling, razonamiento multi-paso y recuperacion de fallos permite encadenar acciones sobre aplicaciones o sistemas de ficheros y reintentar cuando un paso falla.
- Atencion al cliente on-premise: la ventana de 131 072 tokens admite conversaciones muy largas o historiales completos de incidencias sin truncar, y el despliegue local evita enviar transcripciones a terceros.
- Analisis de documentos con imagen: la variante `text-image` incluye el codificador de percepcion y los embeddings de posicion precalculados, por lo que se puede extraer informacion de capturas, formularios escaneados o diagramas junto al texto asociado.
- Flujos de trabajo multi-paso con validacion y reintento: el ajuste para failure recovery encaja en pipelines donde un paso puede devolver un error y el modelo debe replanificar en lugar de abortar.
- Desarrollo y prototipado en Apple Silicon: las variantes `metal` se sirven mediante MLX nativo y permiten iterar sobre prompts y definiciones de herramientas sin GPU dedicada.
- Despliegue en servidores con GPU NVIDIA SM80 o superior: las variantes `sm80+ptx` cubren A100, H100 y GPUs Ampere/Ada/Hopper en general, con el blob de pesos en el fichero `.ptd` separado.
- Procesamiento por lotes de imagenes y texto en local: util para clasificacion o resumen de contenido visual cuando no se permite usar APIs externas por motivos de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se facilitan datos de latencia o throughput. La unica afirmacion de rendimiento recogida es cualitativa: DFlash es "significativamente mas rapido" en GPUs capaces, frente a la variante `solo`, a cambio de mayor consumo de memoria y mayor tamano de descarga.

## Requisitos de hardware

Los tamanos siguientes son los del conjunto de ficheros de cada variante (`.pte` + `.ptd` + `pos_embed.bin`) y sirven como referencia del orden de magnitud de memoria necesaria; deben sumarse el runtime, el contexto KV y el resto de procesos del sistema.

| Cuantizacion | Modalidad | Decodificacion | `metal` (Apple Silicon) | `sm80+ptx` (NVIDIA CUDA) |
|---|---|---|---|---|
| `k-quant-17G` | `text` | `solo` | 17,9 GB | 19,8 GB |
| `k-quant-17G` | `text` | `dflash` | 19,6 GB | 27,2 GB |
| `k-quant-17G` | `text-image` | `solo` | 19,4 GB | 21,2 GB |
| `k-quant-17G` | `text-image` | `dflash` | 21,1 GB | 28,6 GB |
| `k-quant-dynamic` | `text` | `solo` | 20,7 GB | 22,6 GB |
| `k-quant-dynamic` | `text` | `dflash` | 22,4 GB | 30,0 GB |
| `k-quant-dynamic` | `text-image` | `solo` | 22,2 GB | 24,0 GB |
| `k-quant-dynamic` | `text-image` | `dflash` | 23,8 GB | 31,5 GB |

- VRAM estimada: la cuantizacion `k-quant-17G` esta pensada para un presupuesto de 24 GB y la `k-quant-dynamic` para 32 GB, segun la propia documentacion del autor del reempaquetado. Las variantes `dflash` y `text-image` se acercan al limite superior de cada presupuesto.
- GPU compatibles: cualquier GPU NVIDIA con capacidad de computo SM80 o superior (serie Ampere, Ada Lovelace y Hopper, incluidas A100 y H100) para el backend `sm80+ptx`; Apple Silicon con backend Metal para las variantes `metal`.
- No existe variante para CPU.
- GPU de consumo: si, el modelo esta explicitamente orientado a hardware de consumo. Una GPU con 24 GB (por ejemplo, RTX 3090 o RTX 4090) puede alojar las variantes `k-quant-17G`; las variantes `k-quant-dynamic` requieren 32 GB, lo que en el terreno de consumo apunta a memoria unificada de Apple Silicon o a GPUs profesionales.
- Opciones de despliegue: runtime de ExecuTorch para carga de los `.pte` (y `.ptd` en CUDA), con servidor compatible con la API de OpenAI que acepta `--hf-tokenizer` apuntando al directorio con `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`. Los checkpoints GGUF cuantizados se citan como punto de partida recomendado para exportar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se ha proporcionado informacion sobre modelos comparables, ni cifras de rendimiento que permitan situar a Muse Glimmer 30B frente a alternativas de la misma categoria o tamano, por lo que no es posible establecer una comparativa externa con datos verificables. Como referencia util dentro del propio repositorio, la tabla siguiente compara las opciones internas segun coste de memoria y complejidad, que es el criterio de eleccion que documenta el autor.

| Eje | Opcion ligera | Opcion completa | Comentario |
|---|---|---|---|
| Cuantizacion | `k-quant-17G` (presupuesto 24 GB) | `k-quant-dynamic` (presupuesto 32 GB, mas precisa) | Diferencia de 2,8 GB entre variantes `text-solo` en `sm80+ptx` |
| Modalidad | `text` | `text-image` (incluye codificador de percepcion y `pos_embed.bin`) | Anade 1,4 GB en `k-quant-17G text-image solo sm80+ptx` frente a `text solo` |
| Decodificacion | `solo` | `dflash` (objetivo y borrador en un unico `.pte`) | Hasta 7,4 GB adicionales en `k-quant-17G text dflash sm80+ptx` frente a `solo` |

## Limitaciones y advertencias

- Repositorio de terceros: con 0 descargas y 0 likes, se trata de un reempaquetado de `meta-models/Muse-Glimmer-30B` realizado por el usuario `tanmaygoyal26`. Para produccion conviene verificar los artefactos contra la publicacion oficial de Meta antes de usarlos.
- Tamano del repositorio: 372,1 GB en total. Un `hf download` sin filtro intenta descargar las 16 variantes; hay que usar `--include` para traer una sola variante (17,9-31,5 GB) mas los ficheros compartidos de la raiz.
- En CUDA, el `.pte` no contiene los pesos: en las variantes `sm80+ptx` los pesos viven en el `.ptd` (19-31 GB) y el `.pte` ocupa apenas 16-35 MB. Ambos ficheros son obligatorios; descargar solo el `.pte` produce un modelo que no funciona.
- Nomenclatura de artefactos: los ficheros llevan el nombre de su propio directorio, no `model.pte` ni `aoti_cuda_blob.ptd`. Los quickstarts que referencian esos nombres fallaran porque no existen en este repositorio.
- Sin variante de CPU: el modelo solo cubre Apple Silicon y NVIDIA SM80 o superior, lo que excluye su uso en servidores sin GPU y en hardware NVIDIA anterior a Ampere.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no disponible; no se publican tasas de error ni evaluaciones de fidelidad.
- Idiomas soportados: no disponible, por lo que no se puede garantizar cobertura ni calidad fuera del idioma o idiomas no declarados.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero el repositorio incluye un fichero `USAGE_POLICY.md` que conviene revisar antes de desplegar, ya que puede anadir condiciones adicionales.
- Consumo de memoria ajustado: las variantes estan calibradas para presupuestos de 24 o 32 GB, de modo que el contexto KV a 131 072 tokens y el propio runtime pueden empujar el consumo por encima de esos limites si no se reserva margen.
- Seleccion de variante: elegir `text-image` sin enviar imagenes desperdicia memoria y ancho de banda de descarga; elegir `dflash` sin GPU capaz anade coste sin beneficio claro.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/tanmaygoyal26/Muse-Glimmer-30B-ExecuTorch-PTE
- Modelo base declarado: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Documentacion de exportacion en ExecuTorch: https://github.com/pytorch/executorch/blob/main/examples/models/muse-glimmer/README.md
- Directorio de ejemplos en ExecuTorch: https://github.com/pytorch/executorch/tree/main/examples/models/muse-glimmer
- Pagina del modelo en Meta: https://dev.meta.ai/models/muse-glimmer
- Despliegue con ExecuTorch (Meta): https://ai.developer.meta.com/docs/muse-glimmer/executorch
- Descarga del modelo (Meta): https://ai.developer.meta.com/docs/muse-glimmer/get-the-model
- Anuncio del equipo de PyTorch: https://pytorch.org/blog/fast-ondevice-agentic-ai-with-executorch/
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2504.13181
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2602.06036
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
