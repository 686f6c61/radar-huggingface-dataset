# strongpear/Llama3.1-8B-RAFT_PMIX_P40_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss

## Resumen

Este repositorio publica un adaptador LoRA (PEFT) entrenado sobre el modelo base meta-llama/Llama-3.1-8B, identificado por el autor como strongpear. No se trata por tanto de un modelo completo con pesos propios, sino de un conjunto de matrices de adaptacion de bajo rango (rango declarado r64 en el nombre del repositorio) que deben cargarse sobre el checkpoint completo de Llama 3.1 8B para poder realizar inferencia. El tamano del repositorio, 0,7 GB, es coherente con un adaptador de ese rango y no con un modelo de 8.000 millones de parametros.

El nombre del identificador sugiere, aunque la model card no lo confirma, un proceso de ajuste orientado a dominio biomedico ("MEDICAL") con generacion de cadena de pensamiento ("CoT"), recuperacion aumentada sobre documentos ("RAFT", "3DOCS") y mezcla de datos ("PMIX"), con seleccion del checkpoint de menor perdida de evaluacion ("best-eval-loss"). Todos estos elementos son indicios derivados de la nomenclatura del repositorio y no datos verificados: la model card es la plantilla por defecto de HuggingFace y no contiene informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.

La relevancia de esta ficha es fundamentalmente metodologica: sirve como ejemplo de adaptador medico de bajo coste sobre un modelo abierto de 8B con contexto de 131.072 tokens, pero tambien como advertencia sobre la proliferacion de artefactos sin documentacion, sin licencia declarada y sin evaluacion publicada, que no deberian utilizarse en entornos clinicos ni en produccion sin una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; el base es Llama 3.1 8B (atención grouped-query, SwiGLU, RoPE) |
| Parametros totales | Adaptador: no disponible (rango r64 declarado en el nombre del repositorio). Modelo base: 8,03 mil millones |
| Longitud de contexto | No disponible en el adaptador; el modelo base soporta 131.072 tokens |
| Tipos de cuantizacion | No disponible en el adaptador. El modelo base admite bf16, fp16, int8 y cuantizaciones de 4 bits (GGUF/AWQ/GPTQ mediante herramientas externas) |
| Idiomas soportados | No disponible. El modelo base declara soporte para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | No disponible en el repositorio del adaptador; se hereda la Llama 3.1 Community License del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |
| Libreria | peft 0.20.0, transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,7 GB |
| Modelo base | meta-llama/Llama-3.1-8B |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de tipo LoRA, es decir, un par de matrices de bajo rango insertadas en las capas lineales del transformer base, que permanece congelado durante el ajuste. El repositorio esta etiquetado con library_name peft y la model card indica PEFT 0.20.0, de modo que la carga requiere instanciar primero Llama 3.1 8B y aplicar despues el adaptador con `PeftModel.from_pretrained`. No se publican ni la lista exacta de modulos objetivo, ni el valor de alpha, ni el dropout, ni la tasa de aprendizaje, ni el numero de pasos o de tokens de entrenamiento.

La arquitectura subyacente, Llama 3.1 8B, es un transformer decoder-only denso de 32 capas, con 8 cabezas de clave/valor (GQA), dimension de modelo 4.096 y ventana de contexto de 131.072 tokens. Meta lo entreno sobre aproximadamente 15 billones de tokens con un corte de conocimiento en diciembre de 2023, seguido de ajuste supervisado, rechazo de preferencias y DPO. El adaptador hereda estas capacidades pero anade un sesgo especifico derivado de su dataset de ajuste, que no se documenta en ningun momento.

La nomenclatura del repositorio apunta a RAFT (Retrieval Augmented Fine-Tuning), una variante de ajuste que entrena al modelo a responder preguntas ignorando documentos distractores y citando los relevantes, con menciones a "3DOCS" (tres documentos por ejemplo) y "CoT" (cadena de pensamiento). Si esa lectura es correcta, el adaptador estaria especializado en responder sobre un contexto documental recuperado, no en conocimiento parametrico puro. Al no existir model card real ni dataset card asociada, esta interpretacion no puede confirmarse ni reproducirse.

## Capacidades

- Generacion de texto en ingles y, por herencia del modelo base, en otros idiomas declarados por Meta, incluyendo espanol.
- Razonamiento con cadena de pensamiento, presumiblemente inducido por el sufijo "CoT" del identificador, aunque no hay ejemplos ni evaluacion que lo demuestren.
- Respuesta sobre documentos recuperados (grounded question answering) si el ajuste sigue realmente el esquema RAFT, con capacidad de descartar documentos irrelevantes.
- Ajuste o continuacion de instrucciones en el dominio medico, segun el sufijo "MEDICAL-Instruct".
- Soporte de tool calling y function calling: no disponible de forma especifica; el modelo base Llama 3.1 si lo soporta, pero no hay confirmacion de que el adaptador preserve esta capacidad.
- Capacidades de agente y razonamiento multi-paso: heredadas del base, no verificadas tras el ajuste.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito ("thinking mode"): no disponible como funcionalidad configurable.

## Casos de uso

- Preguntas y respuestas sobre documentacion clinica recuperada: cargando el adaptador sobre Llama 3.1 8B y alimentando tres o cuatro fragmentos de guias o historiales, el modelo podria responder citando el fragmento relevante. Requiere validacion previa, ya que el adaptador no aporta garantias de fidelidad.
- Prototipos de investigacion en NLP biomedico: sirve como punto de partida de bajo coste (0,7 GB) para experimentos academicos sobre ajuste eficiente en dominio medico, comparando contra el modelo base sin adaptador.
- Resumen de informes de alta o notas clinicas en entornos de investigacion retrospectiva, siempre sobre datos anonimizados y con revision humana obligatoria.
- Extraccion de informacion estructurada de textos medicos (entidades, dosis, diagnosticos) en un pipeline de preprocesado, con el adaptador como componente de generacion y validacion posterior por reglas.
- Generacion de material docente medico: creacion de preguntas de autoevaluacion y explicaciones paso a paso a partir de apuntes, aprovechando la ventana de 131.072 tokens del base para procesar temas completos.
- Asistente interno de documentacion tecnica sobre dispositivos medicos, donde el modelo responde sobre manuales recuperados por un sistema RAG y el usuario final es personal tecnico, no pacientes.
- Evaluacion comparativa de metodologias de ajuste (RAFT frente a fine-tuning supervisado clasico) en trabajos de investigacion sobre retrieval augmented generation.
- Base para un ajuste adicional con datos propios mediante QLoRA, dado el reducido coste de almacenamiento y la compatibilidad con PEFT.

En ningun caso debe emplearse para diagnostico, triaje, prescripcion ni comunicacion directa con pacientes sin validacion clinica independiente y sin cumplir la normativa aplicable (por ejemplo, IA Act europea o MDR).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y la busqueda web no ha devuelto ningun articulo, blog o repositorio relacionado con el autor o con este adaptador.

## Requisitos de hardware

Los valores siguientes son estimaciones basadas en la arquitectura del modelo base Llama 3.1 8B, no en mediciones publicadas para este adaptador.

- Pesos en bf16/fp16: aproximadamente 16 GB de VRAM solo para los pesos, mas la cache KV.
- Pesos en int8: aproximadamente 8,5 GB.
- Pesos en cuantizacion de 4 bits: aproximadamente 5 GB, mas overhead de contexto.
- Cache KV: con GQA de 8 cabezas KV y 32 capas, unos 128 KB por token; 8.192 tokens suponen alrededor de 1 GB, y 131.072 tokens alrededor de 16 GB en fp16.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S para contexto largo. Para contexto de 131.072 tokens completos en fp16 se recomienda un acelerador de 80 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en 4 bits con contextos de hasta 32.000-64.000 tokens; en RTX 3090/4080 (16-24 GB) es viable en 4 bits con contextos moderados.
- CPU: posible con llama.cpp y cuantizacion Q4, aunque con latencia muy alta y contexto limitado por RAM.
- Opciones de despliegue: transformers + peft (via principal, ya que el adaptador debe fusionarse o cargarse como modulo adicional), vLLM con soporte LoRA, TGI con adaptadores, Ollama/llama.cpp tras fusionar y convertir el adaptador al modelo base en GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantizacion y de la longitud de contexto efectiva.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B) | 8,03 mil millones (adaptador r64) | 131.072 tokens (heredado) | safetensors PEFT | No declarada en el repo; hereda Llama 3.1 Community License | Sin documentacion ni evaluacion |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 131.072 tokens | safetensors | Llama 3.1 Community License | Modelo oficial con evaluacion publicada por Meta |
| Meditron-7B (EPFL) | 7 mil millones | 4.096 tokens (base Llama-2) | safetensors | Llama 2 Community License | Ajuste medico sobre corpus clinico documentado |
| BioMistral-7B | 7 mil millones | 8.192 tokens (base Mistral) | safetensors, GGUF | Apache 2.0 | Ajuste medico con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla vacia de HuggingFace, sin datos de entrenamiento, hiperparametros ni evaluacion.
- Licencia no declarada en el repositorio del adaptador; el uso comercial queda sujeto a los terminos de la Llama 3.1 Community License y a la politica de uso aceptable de Meta, que exige ademas conservar la atribucion "Built with Llama".
- Riesgo elevado de alucinacion en contenido clinico: un adaptador sin validacion puede generar dosis, diagnosticos o referencias inexistentes con aparente seguridad.
- Sesgos inheridos del modelo base y del corpus de ajuste no identificado; se desconoce la representacion de poblaciones, idiomas y subespecialidades medicas.
- Rendimiento multilingue incierto: el ajuste parece orientado al ingles y podria degradar el comportamiento en espanol respecto al modelo base.
- Sin garantia de que el ajuste conserve tool calling, formato de chat correcto o robustez ante prompts adversarios.
- Cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de uso y de validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-09-11, posterior a la fecha de consulta de la informacion, lo que impide confirmar la trazabilidad del artefacto.
- No apto para uso clinico, diagnostico, triaje ni decision terapeutica bajo ninguna circunstancia sin validacion prospectiva y cumplimiento regulatorio.
- Para produccion se recomienda preferir adaptadores con model card completa, dataset documentado, licencia explicita y resultados de evaluacion reproducibles.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P40_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Bibliografia citada en los tags del repositorio (Lacoste et al., 2019, calculo de emisiones): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Llama 3.1 en Meta: https://ai.meta.com/blog/meta-llama-3-1/
- No se han encontrado articulos, repositorios, demos ni entradas de blog adicionales relacionados con este adaptador en la busqueda web realizada; los resultados devueltos correspondian a servicios de facturacion sin relacion con el modelo.
