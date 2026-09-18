# xw17/Llama-3.2-3B-Instruct_SFT_lora_wesad

## Resumen

Llama-3.2-3B-Instruct_SFT_lora_wesad es un adaptador LoRA publicado en HuggingFace por el usuario xw17 bajo el identificador `xw17/Llama-3.2-3B-Instruct_SFT_lora_wesad`. El nombre indica que se trata de un ajuste supervisado (SFT) mediante LoRA sobre el modelo base Llama-3.2-3B-Instruct de Meta, orientado al dataset WESAD (Wearable Stress and Affect Detection). El repositorio ocupa 0,1 GB, un tamano coherente con un adaptador de bajo rango y no con un checkpoint completo de pesos.

El modelo resuelve, en principio, la adaptacion de un LLM de proposito general de 3 000 millones de parametros a una tarea especifica de deteccion de estres y afecto a partir de senales de wearables. Su relevancia practica es limitada de momento: acumula 0 descargas y 0 likes, y la model card es la plantilla automatica de HuggingFace sin ningun campo cumplimentado, por lo que no hay informacion verificable sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion.

Es importante subrayar que el autor no documenta nada: ni la licencia, ni los idiomas, ni el pipeline, ni el procedimiento de entrenamiento. Todo lo que se afirma en esta ficha sobre el modelo base procede de la documentacion publica de Llama-3.2-3B-Instruct y de inferencias a partir del nombre del repositorio, no de la model card del adaptador. Cualquier uso en produccion deberia ir precedido de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el modelo base Llama-3.2-3B-Instruct es un transformer decoder-only denso con RoPE y GQA |
| Parametros totales | no disponible para el adaptador; el modelo base declarado en el nombre tiene 3 210 millones de parametros (3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3.2-3B-Instruct soporta 128 000 tokens segun su documentacion oficial |
| Tipos de cuantizacion | no disponible; al ser un adaptador LoRA en safetensors se puede fusionar y cuantizar despues (GGUF, AWQ, bitsandbytes), pero el autor no publica variantes |
| Idiomas soportados | no disponible en la model card; el modelo base esta entrenado principalmente en ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible; la licencia del modelo base Llama 3.2 es la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador LoRA, ~0,1 GB de repositorio) |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada. La model card es la plantilla autogenerada por HuggingFace y todos los apartados relevantes (Model Details, Training Data, Training Procedure, Training Hyperparameters, Evaluation) contienen el marcador `[More Information Needed]`. El unico dato estructural deducible es el nombre del repositorio, que descompone el artefacto en cuatro partes: modelo base Llama-3.2-3B-Instruct, ajuste supervisado (SFT), tecnica LoRA y dataset wesad.

Si se toma el nombre al pie de la letra, el entrenamiento consistiria en un ajuste supervisado con LoRA de bajo rango sobre el checkpoint instruct de Llama 3.2 3B, con un dataset derivado de WESAD (Wearable Stress and Affect Detection). WESAD es un corpus publico de senales fisiologicas de wearables (respuesta electrodermal, electrocardiograma, electromiograma, temperatura y acelerometro) recogido en escenarios de estres y relajacion; su uso conjunto con un LLM de texto implicaria algun tipo de serializacion o descripcion textual de esas senales, pero el autor no documenta el preprocesado. No hay evidencia de RLHF, DPO ni ninguna innovacion arquitectonica: el adaptador no modifica la arquitectura del modelo base.

Los tags del repositorio incluyen `arxiv:1910.09700`, que corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono. Es una referencia heredada de la plantilla de model card de HuggingFace (el calculador ML Impact), no un paper sobre este modelo. No debe interpretarse como publicacion cientifica asociada.

## Capacidades

- Generacion de texto: heredada del modelo base Llama-3.2-3B-Instruct, un modelo instruct ajustado para seguir instrucciones. No verificada en este adaptador.
- Razonamiento y conocimiento general: capacidades propias del modelo base de 3B, sin evaluacion publicada para el adaptador.
- Codigo y matematicas: el modelo base tiene competencia basica en generacion de codigo y aritmetica simple; en un modelo de 3B estas capacidades son limitadas en comparacion con modelos mayores.
- Tool calling y function calling: Llama-3.2-3B-Instruct soporta plantillas de tool calling; se desconoce si el ajuste SFT sobre WESAD ha preservado esta capacidad, ya que el ajuste especializado puede degradar habilidades generales (olvido catastrofico).
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base lo soporta de forma limitada por su tamano, pero el adaptador no esta documentado.
- Capacidades multilingues: no disponibles en la model card; dependen del modelo base.
- Capacidad especial: segun el nombre, clasificacion o analisis de estres y afecto a partir de datos de wearables (dataset WESAD). No confirmada ni documentada por el autor.
- No hay evidencia de capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion academica sobre deteccion de estres con wearables: el modelo podria emplearse como componente de lenguaje en un pipeline que reciba descriptores textuales de senales fisiologicas (EDA, ECG, temperatura) y produzca una etiqueta de estado afectivo. Es el caso de uso que sugiere el nombre del repositorio, aunque no hay documentacion que lo confirme.
- Prototipado rapido de clasificadores de afecto: al ser un adaptador LoRA de 0,1 GB, se puede cargar sobre el base en minutos y probar hipotesis sin coste de entrenamiento completo.
- Reproducibilidad de experimentos: sirve como punto de partida para quien quiera replicar o auditar un ajuste SFT+LoRA sobre WESAD.
- Educacion y docencia: ejemplo practico de como se publica un adaptador LoRA sobre un modelo instruct de 3B y de los problemas de documentacion en el ecosistema HuggingFace.
- Base para un ajuste posterior: el adaptador puede fusionarse y seguir entrenandose (continued pretraining o nuevas rondas SFT) si el autor no lo prohibe, algo indeterminado por la ausencia de licencia explicita.
- Despliegue en entornos con recursos limitados: un modelo de 3B cuantizado a 4 bits ocupa alrededor de 2 GB, por lo que cabria en GPUs de consumo y en CPU con llama.cpp, aunque la utilidad del ajuste concreto para tareas generales es dudosa.
- Analisis de salud mental asistido: uso potencial en investigacion clinica o de bienestar, siempre con supervision humana y advertencias eticas claras por tratarse de datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada y no se han encontrado resultados en la busqueda web.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluacion especifica sobre WESAD | no disponible |

## Requisitos de hardware

Estimaciones calculadas a partir del tamano del modelo base (3 210 millones de parametros) y del tamano del adaptador; no son datos publicados por el autor.

- Adaptador LoRA: 0,1 GB en safetensors, segun el tamano del repositorio. Requiere cargar ademas el modelo base.
- VRAM para inferencia del modelo base en fp16/bf16: aproximadamente 6,5 GB solo para pesos, mas 1-3 GB de cache KV segun la longitud de contexto. En la practica, 10-12 GB con contexto moderado.
- VRAM en cuantizacion de 8 bits: unos 3,5-4 GB de pesos.
- VRAM en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): unos 2-2,5 GB de pesos.
- GPU de consumo: si cabe. Una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o similar ejecutan el modelo en fp16 sin problema; una RTX 3060 de 8 GB requiere cuantizacion a 4 u 8 bits.
- GPU de datacenter: A100, H100, L40S o A10G son sobredimensionadas para inferencia de un 3B, pero utiles para lotes grandes o contextos muy largos.
- CPU: viable en cuantizacion de 4 bits con llama.cpp, con velocidades del orden de 5-20 tokens por segundo en procesadores modernos de escritorio (estimacion, no medida).
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, Ollama y llama.cpp tras fusionar y convertir el adaptador. El tag `endpoints_compatible` indica compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xw17/Llama-3.2-3B-Instruct_SFT_lora_wesad | 3B (base) + adaptador LoRA | no disponible (128k en el base) | no disponible | no disponible | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | 3,21B | 128 000 tokens | ampliamente evaluado por Meta (resultados publicos en la model card oficial) | Llama 3.2 Community License | HuggingFace, ampliamente adoptado |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens (hasta 128k con RoPE scaling) | resultados publicos en su model card | Apache 2.0 | HuggingFace y multiples proveedores |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128 000 tokens | resultados publicos en su model card | MIT | HuggingFace y multiples proveedores |

La comparacion es desigual: los tres modelos de referencia tienen model cards completas, licencias claras y evaluaciones publicas, mientras que este adaptador no aporta nada de ello. Ademas, los modelos comparados no estan especializados en deteccion de estres con wearables; no se ha identificado en la informacion disponible un adaptador comparable de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica. No hay datos de entrenamiento, hiperparametros, composicion del dataset ni metodologia de evaluacion.
- Licencia indeterminada: el repositorio no declara licencia. Aunque el modelo base tiene su propia licencia (Llama 3.2 Community License, con clausulas de uso aceptable y obligaciones de atribucion), la ausencia de licencia explicita en el adaptador genera incertidumbre juridica para uso comercial.
- Riesgo de alucinacion: inherente a los LLM de 3B, acentuado si el ajuste sobre un dataset especializado ha degradado las capacidades generales.
- Olvido catastrofico: un SFT especializado puede deteriorar el seguimiento de instrucciones, el tool calling y el multilingüismo del modelo base. No hay evaluacion que lo descarte.
- Dominio muy restringido: si el ajuste es realmente sobre WESAD, el modelo puede haber perdido utilidad general y comportarse de forma impredecible fuera de ese dominio.
- Datos sensibles de salud: WESAD contiene senales fisiologicas de personas. Cualquier despliegue orientado a inferir estados emocionales o de estres debe cumplir el RGPD y la normativa sobre datos de salud, y no debe usarse para diagnostico clinico.
- Sesgos: no documentados, pero el modelo base presenta sesgos conocidos de genero, raza y origen; un dataset pequeno de wearables (WESAD tiene 15 sujetos) anade un sesgo de representatividad severo.
- Idiomas: no declarados. Aunque el base sea multilingue, el ajuste SFT probablemente se hizo en ingles, lo que puede degradar el rendimiento en castellano.
- Reputacion y soporte: 0 descargas, 0 likes y sin actualizaciones de contenido desde la creacion. No hay garantia de mantenimiento ni de respuesta del autor.
- Fechas anomales: el repositorio figura creado el 2026-05-01 y actualizado el 2026-09-18, fechas posteriores a lo habitual en los metadatos de HuggingFace; conviene verificar la procedencia antes de confiar en el artefacto.
- Recomendacion: tratar este repositorio como material experimental no auditado. No desplegar en produccion sin validacion propia, sin auditar los pesos y sin resolver la cuestion de la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/xw17/Llama-3.2-3B-Instruct_SFT_lora_wesad
- Referencia citada en los tags (Lacoste et al., 2019, sobre emisiones de carbono, heredada de la plantilla): https://arxiv.org/abs/1910.09700
- Documentacion del modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia del modelo base Llama 3.2: https://www.llama.com/llama3_2/license/
- No se han encontrado papers, blogs, repositorios ni demos especificos de este adaptador en la busqueda web realizada.
