# trentzap/ASVD-Bridge-Coder-1.5B

## Resumen

ASVD-Bridge-Coder-1.5B es un modelo experimental de prueba de concepto (PoC) desarrollado por Trent Ian Parsons (QTensor) que aplica una arquitectura híbrida de compresión denominada ASVD-Bridge (Asymmetric Singular Value Decomposition with Subspace Stabilization) sobre el modelo base Qwen/Qwen2.5-Coder-1.5B. El objetivo es lograr una compresión extrema del modelo manteniendo un footprint de VRAM mínimo, en torno a 1 GB, y un throughput de inferencia elevado, unos 38 TPS, para su despliegue en hardware de gama baja o dispositivos edge.

El modelo combina una descomposición en valores singulares (SVD) de rango dinámico en los bloques de atención con una cuantización simulada de 4 bits (Fake-INT4) en los bloques MLP, más un escalar de "puente de subespacio" (gamma) entrenado mediante destilación consciente de cuantización (QAD) para absorber las pérdidas numéricas. El checkpoint publicado se destiló durante solo 625 pasos de entrenamiento, por lo que el autor advierte explícitamente de que las capacidades lógicas y de generación de sintaxis están gravemente degradadas en esta versión concreta. Es un modelo de investigación, no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (SVD dinamico en atencion + Fake-INT4 en MLP) sobre base Qwen2.5-Coder-1.5B |
| Parametros totales | 527.261.184 (527 M) |
| Parametros activos | no disponible (no es un MoE declarado) |
| Longitud de contexto | no disponible (se hereda de Qwen2.5-Coder-1.5B, que soporta 32 K tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | Fake-INT4 fisico en bloques MLP; SVD de rango dinamico en atencion (no es cuantizacion estandar) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere cargador de topologia personalizado, no es un checkpoint denso estandar) |

## Arquitectura y entrenamiento

La arquitectura ASVD-Bridge es asimetrica e hibrida. En los bloques de atencion (q, k, v, o) se aplica una descomposicion en valores singulares de rango dinamico que reduce de forma lineal el numero de parametros. En los bloques MLP (gate, up, down) se aplica una simulacion fisica de cuantizacion INT4 basada en AWQ (Activation-Aware Weight Quantization). Ademas, se introduce un escalar de "subspace bridge" (gamma) que se entrena mediante destilacion consciente de cuantizacion (QAD) para absorber las truncaciones numericas mas significativas. Este escalar se pliega dentro de los pesos de o_proj en la exportacion, de modo que no anade overhead en tiempo de ejecucion.

El entrenamiento consistio en una destilacion desde Qwen/Qwen2.5-Coder-1.5B durante un ciclo corto de 625 pasos. El autor indica que este ciclo es insuficiente para preservar las capacidades logicas y de generacion de codigo del modelo original, por lo que el checkpoint publicado tiene capacidades degradadas. No se proporcionan datos sobre el dataset de destilacion, el numero de tokens utilizado ni el metodo exacto de destilacion (solo se menciona QAD).

## Capacidades

- Generacion de codigo: el modelo base es Qwen2.5-Coder-1.5B, especializado en codigo, pero el checkpoint publicado tiene capacidades degradadas por el corto ciclo de destilacion.
- Razonamiento logico: severamente degradado en esta version, segun el propio autor.
- Sintaxis de generacion: tambien degradada; no se recomienda para tareas reales de generacion de codigo.
- Compresion extrema: el objetivo del modelo es demostrar que es posible mantener el footprint fisico (VRAM y TPS) con una arquitectura comprimida, aunque a costa de la calidad logica.
- Inferencia en hardware limitado: disenado para caber en GPUs de consumo de gama baja o dispositivos edge (pico de VRAM de 1,03 GB).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

Dado el estado experimental y degradado del checkpoint, los casos de uso realistas son limitados. Se enumeran aquellos que el autor sugiere implicitamente o que son plausibles para un PoC de este tipo:

- Investigacion sobre compresion de modelos: sirve como banco de pruebas para estudiar el impacto de la destilacion corta y la cuantizacion agresiva en la calidad del modelo. Un investigador puede comparar este checkpoint con el modelo base para medir la degradacion.
- Evaluacion de tecnicas de cuantizacion hibrida: permite analizar como se comporta la combinacion SVD + Fake-INT4 en terminos de footprint de memoria y velocidad frente a metodos estandar como GPTQ o AWQ.
- Desarrollo de cargadores personalizados: el modelo requiere un cargador de topologia especifico (QTensor Engine), por lo que es util para desarrolladores que trabajan en runtime de inferencia para modelos comprimidos.
- Pruebas de inferencia en hardware de bajos recursos: con 1,03 GB de VRAM, puede usarse para validar pipelines de inferencia en GPUs antiguas o dispositivos edge, aunque la calidad de salida no sea utilizable en produccion.
- Estudio de "subspace bridging" (QAD): el escalar gamma es una innovacion tecnica que podria aplicarse en otros contextos de cuantizacion; este modelo sirve como demostracion de su funcionamiento.
- Educacion y divulgacion: como ejemplo practico de arquitecturas de compresion no convencionales para cursos avanzados de sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Se indica explicitamente que las capacidades logicas y de sintaxis estan degradadas, por lo que cualquier benchmark seria previsiblemente bajo, pero no hay datos oficiales.

## Requisitos de hardware

- VRAM estimada: 1,03 GB de pico, segun el autor.
- GPU recomendadas: cualquier GPU de consumo con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2050, o integradas con suficiente memoria compartida). No requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: si, es el objetivo principal del diseno.
- Opciones de despliegue: requiere el cargador de topologia personalizado del repositorio QTensor Engine (qtensor_core.py). No es compatible con cargadores estandar como vLLM, llama.cpp, Ollama o TGI sin modificaciones.
- Throughput: 38,39 tokens por segundo, segun el autor.
- Latencia: no disponible.

## Comparativa con modelos similares

La comparativa mas directa es con el modelo base del que deriva, Qwen/Qwen2.5-Coder-1.5B, y con otros modelos de codigo de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ASVD-Bridge-Coder-1.5B | 527 M | no disponible | MIT | safetensors (topologia personalizada) | Capacidades degradadas, PoC experimental |
| Qwen/Qwen2.5-Coder-1.5B | 1,5 B | 32 K | Apache 2.0 | safetensors | Modelo base, capacidades completas de codigo |
| Qwen/Qwen2.5-Coder-0.5B | 0,5 B | 32 K | Apache 2.0 | safetensors | Alternativa de tamano similar con capacidades completas |

No se dispone de datos de rendimiento comparativos entre estos modelos, ya que el autor no ha publicado benchmarks. La comparativa se limita a especificaciones declaradas.

## Limitaciones y advertencias

- Checkpoint experimental: el autor advierte explicitamente de que las capacidades logicas y de generacion de sintaxis estan "gravemente degradadas" en esta version.
- Ciclo de destilacion corto: solo 625 pasos, insuficiente para preservar la calidad del modelo base.
- Carga no estandar: requiere un cargador de topologia personalizado (QTensor Engine). No se puede cargar con AutoModelForCausalLM estandar sin el codigo adicional.
- Sin garantias de produccion: es un PoC, no un modelo listo para uso en aplicaciones reales.
- Riesgo de alucinacion: no evaluado, pero previsiblemente alto dado el estado degradado del modelo.
- Sesgos: no evaluados; se heredan del modelo base Qwen2.5-Coder, pero no hay estudios al respecto.
- Licencia MIT: permite uso comercial, pero el estado del modelo hace que no sea recomendable.
- Documentacion limitada: no hay papers, datasets de entrenamiento publicados ni evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trentzap/ASVD-Bridge-Coder-1.5B
- Repositorio QTensor Engine: https://github.com/trentzap/qtensor-engine
- Perfil del autor en HuggingFace: https://huggingface.co/trentzap/models
- Paper de referencia sobre ASVD (no es el paper de este modelo, pero es la base tecnica): https://arxiv.org/html/2312.05821v5
