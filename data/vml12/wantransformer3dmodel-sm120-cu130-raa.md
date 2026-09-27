# vml12/WanTransformer3DModel-sm120-cu130-raa

## Resumen

`vml12/WanTransformer3DModel-sm120-cu130-raa` no es un modelo de lenguaje ni un modelo entrenado desde cero: es un repositorio de artefactos de compilacion anticipada (ahead-of-time, AoT) que contiene los binarios precompilados del modulo `WanTransformer3DModel` empleado por el pipeline `Wan-AI/Wan2.2-I2V-A14B-Diffusers` de generacion de video a partir de imagen (image-to-video). El repositorio se ha generado con un HF Job reproducible, usando la utilidad `spaces.aoti_load` de la libreria `spaces`, y su proposito es eliminar la necesidad de ejecutar `torch.compile` en tiempo de arranque, acelerar la inferencia y habilitar la compatibilidad con ZeroGPU en Hugging Face Spaces.

El artefacto esta compilado especificamente para arquitectura `sm120` (familia Blackwell, en concreto se报告的... 

...en concreto se ejecuto sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition) y para CUDA 13.0 (`cu130`), con PyTorch 2.12.0+cu130 en el entorno de generacion. El author reporta una aceleracion de 1,53x (de 193,05 s a 125,85 s) en la generacion de las muestras de video incluidas como parte del job de compilacion; el propio autor advierte que esta cifra puede no reflejar la ganancia real de rendimiento en todos los escenarios.

La relevancia de este repositorio es de caracter practico y de infraestructura: permite desplegar el transformer de Wan 2.2 I2V en Spaces con ZeroGPU con arranques mas rapidos, pero esta atado a un objetivo de compilacion concreto (GPU sm120 + CUDA 13.0) y no es portable a otras generaciones de GPU sin recompilar. El repositorio aparece con 0 descargas, 0 likes y un tamano de 0,0 GB en el momento de la consulta, y su licencia e idiomas no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D de difusion (`WanTransformer3DModel`) con doble experto (`transformer` y `transformer_2`) para generacion de video imagen-a-video |
| Parametros totales | no disponible |
| Parametros activos | no disponible; la nomenclatura "A14B" del modelo base sugiere 14B de parametros activos por paso, dato no confirmado en la informacion proporcionada |
| Longitud de contexto | no disponible; no aplica el concepto de ventana de contexto de un LLM (el condicionamiento es por prompt de texto e imagen inicial, con numero de fotogramas y resolucion no especificados) |
| Tipos de cuantizacion | float8 en los bloques del transformer (`Float8DynamicActivationFloat8WeightConfig` de `torchao`), int8 en el text encoder (BitsAndBytes), bfloat16 como referencia sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios precompilados AoT de PyTorch, cargados con `spaces.aoti_load`; el repositorio ocupa 0,0 GB y no expone pesos en safetensors ni GGUF |
| Libreria / ecosistema | `diffusers` (`WanImageToVideoPipeline`, `WanTransformer3DModel`) |
| Objetivo de compilacion | `sm120` (Blackwell) y CUDA 13.0 (`cu130`) |
| Entorno de compilacion | PyTorch 2.12.0+cu130, Python 3.10.19, Ubuntu 22.04.5, imagen `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel` |
| Hardware del job | NVIDIA RTX PRO 6000 Blackwell Server Edition (flavor `rtx-6000`), Intel Xeon Platinum 8559C, 192 hilos |
| Fecha de creacion y actualizacion | 2026-09-26T18:04:25.000Z (creado y actualizado en el mismo instante) |
| Etiquetas | `diffusers`, `ahead-of-time`, `pytorch`, `region:us` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino el resultado de compilar el grafo del transformer de Wan 2.2 I2V. La arquitectura subyacente es un transformer 3D de difusion con dos modulos de expertos (uno de ruido alto y otro de ruido bajo), que en el pipeline base se instancian como `transformer` y `transformer_2` y se cargan ambos desde el repositorio `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers`. El scheduler empleado en el ejemplo de uso es `FlowMatchEulerDiscreteScheduler` con `shift=8.0`, propio de los modelos de flujo (flow matching) de la familia Wan.

El proceso de compilacion anticipada sustituye la compilacion en caliente (`torch.compile`) por binarios generados previamente con `spaces.aoti_load`, apuntando al repositorio del modulo compilado. En el procedimiento documentado, antes de cargar el artefacto se cuantizan ambos bloques de transformers en float8 con `torchao` (`Float8DynamicActivationFloat8WeightConfig`) y el text encoder se carga en 8 bits con BitsAndBytes. El propio autor indica que el README se genera automaticamente mediante un HF Job y que todo el repositorio es un artefacto reproducible de dicho job; no se proporcionan datos sobre volumen de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineacion, por lo que esos extremos quedan como no disponibles.

La innovacion tecnica destacable es, por tanto, la propia tecnica de despliegue (AoT + ZeroGPU), no una innovacion en la arquitectura del modelo. El job ejecutado es reproducible con `hf jobs uv run job.py --flavor rtx-6000 --image pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel` o con Docker local, y admite personalizacion del nombre del repositorio de salida mediante las variables `OUTPUT_REPO_NAMESPACE`, `OUTPUT_REPO_BASE_NAME` y `OUTPUT_REPO_ID`.

## Capacidades

- Generacion de video a partir de una imagen inicial y un prompt de texto (image-to-video), como componente del pipeline `WanImageToVideoPipeline`.
- Ejecucion en modo de doble experto: el pipeline gestiona dos transformers (ruido alto y ruido bajo) que deben cargarse y compilarse por separado.
- Arranque rapido sin `torch.compile`: los binarios precompilados eliminan la fase de compilacion en el primer paso de inferencia.
- Compatibilidad con ZeroGPU de Hugging Face Spaces mediante `spaces.aoti_load`.
- Soporte de cuantizacion en float8 para los bloques del transformer y en int8 para el text encoder, con el objetivo de reducir huella de memoria y acelerar la inferencia.
- No es un modelo de lenguaje: no realiza generacion de texto, razonamiento, codigo, matematicas ni vision comprensiva.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponibles (dependen del text encoder del pipeline base, no documentado en este repositorio).
- No se documentan capacidades de audio, thinking mode ni modos alternativos de inferencia.

## Casos de uso

- Despliegue de demos de image-to-video en Hugging Face Spaces con ZeroGPU: el artefacto AoT permite que el Space arranque sin ejecutar `torch.compile`, reduciendo el tiempo hasta la primera inferencia, que es el principal cuello de botella percibido por el usuario en este tipo de demos.
- Prototipado rapido de animaciones a partir de fotografias: un desarrollador puede convertir una imagen fija en un clip corto con movimiento coherente, usando el prompt de texto para dirigir la camara o el movimiento del sujeto, sin necesidad de infraestructura de entrenamiento.
- Generacion de video para marketing y comercio electronico: animar imagenes de producto (giro de 360 grados, acercamiento de camara, cambios de iluminacion) integrando el modulo compilado en un servicio interno que reciba la imagen y el prompt desde una API.
- Previzualizacion en produccion audiovisual: generar storyboards animados o previsiones de plano a partir de un frame clave, con tiempos de generacion medidos en el orden de los 125 s por muestra en una RTX PRO 6000 Blackwell.
- Investigacion en modelos de difusion de video: servir como objetivo de compilacion reproducible para medir el impacto de AoT, float8 y ZeroGPU sobre un transformer 3D de gran tamano, reutilizando el `job.py` y los parametros publicados.
- Reproduccion de entornos de compilacion: el repositorio actua como artefacto reproducible para validar que una combinacion concreta de PyTorch, CUDA y driver (2.12.0+cu130, driver 595.58.03) produce binarios funcionales en sm120.
- Pipelines de generacion de video por lotes: dado que el coste dominante es la inferencia del transformer, integrar el modulo ya compilado en un worker que procese colas de imagenes evita recompilaciones por reinicio del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de calidad de video (FVD, CLIP score, etc.). El unico dato cuantitativo publicado es la ganancia medida durante el propio job de compilacion, que se reproduce a continuacion tal cual figura en la model card:

| Medicion | Valor |
|---|---|
| Tiempo antes de la compilacion | 193,05 s |
| Tiempo despues de la compilacion | 125,85 s |
| Aceleracion reportada | 1,53x |
| Advertencia del autor | Puede no reflejar la ganancia real de rendimiento |
| Hardware de la medicion | NVIDIA RTX PRO 6000 Blackwell Server Edition |
| Ambito de la medicion | Muestras de video generadas como parte del job de compilacion |

## Requisitos de hardware

- Objetivo de compilacion estricto: arquitectura `sm120` (Blackwell) y CUDA 13.0. Los binarios AoT no son portables a GPU Ampere, Ada o Hopper sin recompilar el modulo.
- GPU validada en el job: NVIDIA RTX PRO 6000 Blackwell Server Edition, con driver 595.58.03 y CUDA runtime 13.0.48.
- VRAM estimada: no disponible como cifra oficial; el pipeline base carga dos transformers en bfloat16 y un text encoder en int8 antes de cuantizar los bloques en float8, lo que en la practica exige una GPU de gama profesional con decenas de GB de memoria. No se dispone de la cifra exacta de consumo.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo. La RTX PRO 6000 Blackwell es una tarjeta profesional de centro de datos/estacion de trabajo; el flavor empleado en el job (`rtx-6000`) apunta a ese perfil.
- Software minimo: PyTorch 2.12.0+cu130 en el entorno de compilacion, imagen recomendada `pytorch/pytorch:2.9.1-cuda13.0-cudnn9-devel`, Python 3.10, CUDA 13.0, cuDNN 9.
- Opciones de despliegue: `spaces.aoti_load` para Spaces con ZeroGPU; `hf jobs uv run job.py --flavor rtx-6000` para regenerar o recompilar; Docker local con `--gpus all` para reproduccion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modulo de difusion de video).
- Latencia y throughput: el unico dato disponible es el tiempo de muestreo reportado en el job, 125,85 s despues de la compilacion y 193,05 s antes, sin especificar resolucion, numero de fotogramas ni numero de pasos de muestreo.
- Persistencia: se requiere acceso al repositorio de artefactos en el Hub (o copia local) para cargar los binarios; el repositorio de pesos del modelo base se descarga por separado desde `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers`.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vml12/WanTransformer3DModel-sm120-cu130-raa` | Binarios AoT precompilados del transformer | No disponible (nomenclatura A14B del modelo base) | Imagen + prompt de texto, via pipeline Wan I2V | No disponible | 0 descargas, 0 likes, 0,0 GB |
| `Wan-AI/Wan2.2-I2V-A14B-Diffusers` | Modelo base de difusion de video, sin compilar | No disponible (nomenclatura A14B) | Imagen + prompt de texto | No disponible en la informacion proporcionada | Repositorio oficial referenciado por el pipeline |
| `cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers` | Pesos bf16 de los dos transformers, sin compilar | No disponible | Imagen + prompt de texto | No disponible | Referenciado como origen de los pesos en el ejemplo de uso |
| `cbensimon/WanTransformer3DModel-sm120-cu130-raa` | Artefacto AoT equivalente | No disponible | Imagen + prompt de texto | No disponible | Referenciado en el propio README del repositorio analizado |

No se dispone de datos de rendimiento comparativos entre estas variantes mas alla del 1,53x medido en el job. Tampoco se dispone de informacion sobre otras alternativas de la misma categoria (por ejemplo, otros transformers de difusion de video) en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo completo: solo contiene el artefacto compilado del modulo transformer. Requiere el pipeline, los pesos bf16, el text encoder, el VAE y el scheduler del modelo base para funcionar.
- Dependencia dura de hardware y software: los binarios estan compilados para `sm120` y CUDA 13.0. Cambiar de GPU o de version de CUDA invalida el artefacto y obliga a recompilar.
- Estado del repositorio: 0 descargas, 0 likes, 0,0 GB de tamano y fecha de creacion identica a la de actualizacion. El tamano de 0,0 GB sugiere que el repositorio podria contener unicamente documentacion o metadatos; conviene verificar la existencia real de los binarios antes de integrarlo en cualquier flujo de trabajo.
- Discrepancia de identificadores: el ID del repositorio es `vml12/...` mientras que el README, los ejemplos de codigo y los enlaces de las muestras de video apuntan a `cbensimon/WanTransformer3DModel-sm120-cu130-raa`. Es necesario confirmar cual es el artefacto correcto y su integridad.
- Fechas inconsistentes: la fecha de creacion indicada (2026-09-26) es posterior a la fecha habitual de consulta, lo que puede indicar un error de metadatos o un artefacto generado en un entorno con reloj no estandar.
- Licencia no declarada: no se puede asumir uso comercial. Hay que verificar la licencia del modelo base Wan 2.2 y la del repositorio de pesos utilizado antes de cualquier despliegue productivo.
- Riesgo de alucinacion en el sentido visual: no hay metricas publicadas de fidelidad, coherencia temporal ni adherencia al prompt; es esperable la aparicion de artefactos, deformaciones y movimiento inconsistente, pero no hay datos que lo cuantifiquen para esta variante.
- Sesgos del modelo base no documentados: la model card no describe la composicion del dataset de entrenamiento de Wan 2.2 ni sus sesgos demograficos, culturales o de representacion.
- Idiomas y capacidades multilingues no declarados: el comportamiento con prompts en castellano u otros idiomas distintos del ingles no esta documentado.
- Rendimiento sensible al contexto de ejecucion: la propia model card advierte que el 1,53x medido puede no reflejar la ganancia real en otros escenarios, por lo que la cifra no debe usarse como garantia de servicio.
- Sin soporte de herramientas ni de agentes: cualquier arquitectura de agente, tool calling o razonamiento multi-paso debe implementarse en la capa de orquestacion, no en este modulo.
- Rendimiento en produccion no caracterizado: no hay datos de throughput con concurrencia, ni de latencia p95/p99, ni de comportamiento bajo distintos numeros de pasos o resoluciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vml12/WanTransformer3DModel-sm120-cu130-raa
- Repositorio referenciado en el README y en los ejemplos: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa
- Muestras de video antes de la compilacion: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa/resolve/main/samples/before/video.mp4
- Muestras de video despues de la compilacion: https://huggingface.co/cbensimon/WanTransformer3DModel-sm120-cu130-raa/resolve/main/samples/after/video.mp4
- Pesos bf16 del transformer de Wan 2.2 I2V A14B: https://huggingface.co/cbensimon/Wan2.2-I2V-A14B-bf16-Diffusers
- Modelo base del pipeline: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Documentacion de configuracion de HF Jobs: https://hf.co/docs/hub/en/jobs-configuration
- Instalador de la CLI de Hugging Face: https://hf.co/cli/install.sh
- Paper tecnico de Wan 2.2: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
