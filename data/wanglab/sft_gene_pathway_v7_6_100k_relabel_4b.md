# wanglab/sft_gene_pathway_v7_6_100k_relabel_4b

## Resumen

El modelo `wanglab/sft_gene_pathway_v7_6_100k_relabel_4b` es un ajuste fino supervisado (SFT) desarrollado por el grupo de investigación wanglab sobre el modelo base multimodal Qwen/Qwen3.5-4B. Con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y pesos en formato safetensors que ocupan 9,1 GB en el repositorio, está orientado a tareas de biología computacional: el identificador y las etiquetas del repositorio apuntan a genética de célula única, perturbación génica, CRISPR y razonamiento sobre rutas biológicas (gene pathways), con soporte de entrada imagen-texto.

El problema que aborda es la necesidad de un modelo de razonamiento especializado que combine comprensión multimodal (por ejemplo, imágenes de microscopía junto a texto) con conocimiento de genómica de célula única y experimentos de perturbación. Al derivar de Qwen3.5-4B, hereda la arquitectura transformer del modelo base, pero los detalles concretos de contexto, tokenizador y composición del dataset no están publicados en la información disponible.

Actualmente el modelo tiene 0 descargas y 0 "likes", fue creado el 12 de septiembre de 2026 y su acceso está restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de descargarlo. Su relevancia es por tanto prospectiva: representa un ejemplo de especialización vertical de un modelo multimodal pequeño en un dominio científico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen3.5 (etiqueta `qwen3_5`), transformer multimodal imagen-texto segun la etiqueta `image-text-to-text` |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | No aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ o GPTQ declaradas |
| Idiomas soportados | No disponible |
| Licencia | `qwen` (el repositorio incluye la etiqueta `license:other`) |
| Formato de pesos | Safetensors (libreria transformers) |

Otros datos: tamano del repositorio 9,1 GB; pipeline declarado `text-generation`; acceso restringido (gated); region `us`; compatible con endpoints; creacion 2026-09-12.

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un ajuste fino por supervised fine-tuning (SFT) del modelo base Qwen/Qwen3.5-4B, etiquetado como `base_model:finetune`. La etiqueta `image-text-to-text` implica que el modelo conserva la capacidad multimodal de su base, es decir, un codificador visual acoplado a un transformer de lenguaje. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas posteriores de RLHF, DPO u optimizacion por preferencias.

El identificador del repositorio sugiere, de forma interpretativa y no confirmada, un entrenamiento sobre aproximadamente 100.000 ejemplos (`100k`) de rutas geneticas (`gene_pathway`) con un reetiquetado de datos (`relabel`), en su version 7.6 (`v7_6`), sobre el modelo de 4B (`4b`). Las etiquetas `biology`, `single-cell`, `perturbation` y `crispr` apuntan a un corpus de biologia computacional centrado en experimentos de celula unica y perturbaciones geneticas. No hay informacion publicada sobre innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicitos.

## Capacidades

Las siguientes capacidades se deducen de las etiquetas y del pipeline declarados en el repositorio; no hay una model card detallada que las confirme con ejemplos:

- Generacion de texto conversacional (`text-generation`, `conversational`).
- Procesamiento multimodal imagen-texto (`image-text-to-text`), presumiblemente imagenes de microscopia junto a texto biologico.
- Razonamiento especializado en biologia (`reasoning`, `biology`).
- Analisis de datos de celula unica (`single-cell`).
- Interpretacion de experimentos de perturbacion genetica (`perturbation`) y de cribado CRISPR (`crispr`).
- Razonamiento sobre rutas geneticas y moleculares, segun el identificador `gene_pathway`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la etiqueta `reasoning` sugiere cierta capacidad, pero no hay confirmacion.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Anotacion de experimentos de celula unica: dado un conjunto de datos scRNA-seq descrito en texto y posiblemente acompanado de graficos de embedding (UMAP/t-SNE) como imagen, el modelo puede generar interpretaciones de clusters y tipos celulares, apoyandose en su entrenamiento en `single-cell`.
- Analisis de cribados CRISPR: interpretacion de resultados de knockout/knockdown genico, resumen de genes candidatos y propuesta de hipotesis sobre mecanismos, aprovechando las etiquetas `crispr` y `perturbation`.
- Razonamiento sobre rutas biologicas: dado un conjunto de genes diferencialmente expresados, el modelo puede razonar sobre rutas (pathways) implicadas y relaciones funcionales, alineado con el identificador `gene_pathway`.
- Asistente conversacional para laboratorio: un chatbot interno que responda preguntas multi-turno de investigadores sobre protocolos, resultados de perturbacion y literatura, gracias al pipeline `conversational` y al ajuste SFT en dominio.
- Analisis multimodal de imagenes de microscopia: combinacion de imagenes de cultivos celulares o tinciones con texto descriptivo para generar informes preliminares, dado el soporte `image-text-to-text`.
- Extraccion y normalizacion de datos experimentales: conversion de descripciones libres de experimentos de perturbacion en estructuras tabulares o JSON, si el modelo conserva capacidades de generacion estructurada del base Qwen3.5-4B.
- Preprocesamiento en pipelines de bioinformatica: uso como componente de generacion de anotaciones y resumenes dentro de flujos que luego se validan con herramientas estadisticas especializadas.
- Prototipado academico de bajo coste: al tener ~4,54B parametros, puede desplegarse en una unica GPU de gama alta de consumo o profesional para experimentacion interna en un laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion (MMLU, HumanEval, GSM8K ni metricas especificas de biologia como GeneBench o similares), y los resultados de la busqueda web no aportan datos relacionados con este modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas a partir del numero de parametros (4,54 mil millones) y no proceden de la documentacion del modelo:

- VRAM estimada en bf16/fp16: en torno a 9-10 GB solo para pesos, mas memoria para el codificador visual y la cache KV.
- VRAM estimada en cuantizacion int8: aproximadamente 4,5-5,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (si se generan variantes GGUF/AWQ, no publicadas): aproximadamente 2,5-3,5 GB de pesos.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Cabe en GPU de consumo de 16 GB o mas en bf16 con contexto moderado; en 8 GB requeriria cuantizacion de 4 bits, no disponible actualmente.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, es compatible con vLLM, TGI y transformers; llama.cpp/Ollama requeririan convertir los pesos a GGUF, conversion no publicada y potencialmente compleja por el componente multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wanglab/sft_gene_pathway_v7_6_100k_relabel_4b` | 4,54B | No disponible | No publicado | `qwen` / `license:other` | Acceso restringido (gated), 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (no confirmado) | No disponible | No disponible en la informacion proporcionada | Licencia Qwen | Publico en HuggingFace |
| Alternativas de tamano similar para biologia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente sobre modelos comparables de biologia computacional con ajuste fino multimodal en el mismo rango de parametros, por lo que la comparativa se limita al modelo base declarado.

## Limitaciones y advertencias

- No hay model card detallada: se desconocen el dataset exacto, el numero de tokens de entrenamiento y el proceso de alineacion, lo que dificulta evaluar la calidad y los sesgos.
- Riesgo elevado de alucinacion en dominio cientifico: la generacion de nombres de genes, rutas o interacciones moleculares no verificadas es un riesgo critico en un modelo ajustado sobre datos biologicos sin validacion publicada.
- Ausencia total de benchmarks: no hay evidencia publica de rendimiento, por lo que no deberia usarse en produccion sin una evaluacion propia.
- Sesgos potenciales derivados del corpus de entrenamiento: si los datos de celula unica y CRISPR se concentran en unos pocos tejidos, organismos o lineas celulares, el modelo podra generalizar mal a otros contextos.
- Idiomas no declarados: se desconoce si el ajuste fino degrada el multilingueismo del modelo base.
- Licencia: la etiqueta `license:other` junto al campo `qwen` implica que las condiciones reales de uso comercial dependen de la licencia de Qwen; debe revisarse el texto completo antes de cualquier uso comercial.
- Acceso restringido: es necesario solicitar acceso y aceptar condiciones en HuggingFace, lo que anade friccion y posibles restricciones de uso.
- Fecha de creacion futura (2026-09-12) y 0 descargas: el modelo no tiene trazabilidad de uso ni validacion por parte de la comunidad.
- Componente multimodal: el despliegue requiere gestionar la entrada de imagenes, lo que complica la integracion en stacks de solo texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wanglab/sft_gene_pathway_v7_6_100k_relabel_4b
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de Qwen: https://github.com/QwenLM
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos (horoscopos, discusiones sobre interfaces de Gemini y articulos genericos sobre modelos multimodales) no guardan relacion con este modelo.
