# wildnrfm/legal-chatbot-llama3

## Resumen

wildnrfm/legal-chatbot-llama3 es un ajuste fino (fine-tuning) del modelo instructivo Llama 3.2 3B, publicado por el usuario wildnrfm en HuggingFace. Concretamente, parte de `unsloth/llama-3.2-3b-instruct-bnb-4bit`, una version del modelo de Meta cuantizada a 4 bits, y ha sido entrenado con la libreria Unsloth junto a TRL de HuggingFace, segun indica el propio autor. El nombre del repositorio sugiere un enfoque hacia dominios legales, aunque la model card no documenta ni el dataset ni el procedimiento de entrenamiento empleado.

El modelo cuenta con 3.212.749.824 parametros almacenados en formato safetensors (el repositorio ocupa 6,4 GB), lo que es coherente con un guardado en precision de 16 bits en lugar de adaptadores LoRA. Se distribuye bajo licencia Apache 2.0, esta etiquetado exclusivamente para ingles y declara compatibilidad con text-generation-inference y endpoints.

Su relevancia practica es limitada por el momento: cero descargas y cero valoraciones, sin model card tecnica mas alla de la plantilla automatica de Unsloth, y sin resultados de evaluacion publicados. Debe tratarse, por tanto, como un experimento de ajuste fino de un modelo pequeno (3B) para generacion de texto conversacional, no como un sistema validado para produccion legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.2 (no detallada en la model card; heredada del modelo base) |
| Parametros totales | 3.212.749.824 (3,21 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B Instruct declara 128.000 tokens |
| Tipos de cuantizacion | no documentados por el autor; el modelo base era bnb-4bit y los pesos publicados estan en safetensors (compatibles con cuantizacion posterior a GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles, unico idioma declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Al derivar de Llama 3.2 3B Instruct, la arquitectura subyacente es la de la familia Llama 3.2: transformer decoder-only con atencion de consultas agrupadas (GQA) y embeddings rotatorios (RoPE) para la codificacion posicional. El dato verificable es el recuento de parametros en safetensors (3.212.749.824), que coincide con el tamano del modelo base de 3B, lo que indica que el ajuste no anadio ni modifico capas estructurales.

En cuanto al entrenamiento, la unica informacion disponible es que se utilizo Unsloth y la libreria TRL de HuggingFace, y que el autor afirma haber entrenado "2x mas rapido" gracias a Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado, ni la duracion o el hardware empleado. Tampoco se indica si los pesos publicados son el resultado de fusionar (merge) los adaptadores LoRA con el modelo base; el tamano del repositorio (6,4 GB para 3,21 B de parametros) es consistente con un guardado fusionado en 16 bits.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste instructivo de Llama 3.2 3B.
- Razonamiento basico y respuesta a instrucciones de complejidad media, propio de un modelo de 3B parametros.
- Generacion de codigo elemental, sin datos que confirmen un entrenamiento especifico en este dominio.
- Orientacion aparente a dominio legal, deducida unicamente del nombre del repositorio (`legal-chatbot-llama3`); no hay evidencia documentada de ello.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado; no se ha verificado el comportamiento en castellano.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad declarada con text-generation-inference y con endpoints de HuggingFace.

## Casos de uso

- Prototipado de asistentes conversacionales especializados: el modelo puede usarse como banco de pruebas para validar la viabilidad de un chatbot de dominio acotado antes de invertir en un modelo mayor, dado su bajo coste de inferencia.
- Experimentacion academica con ajuste fino: sirve como caso de estudio reproducible de un fine-tuning con Unsloth y TRL sobre una base cuantizada a 4 bits, util para comparar tecnicas de entrenamiento eficiente.
- Consultas legales de baja criticidad con supervision humana: un sistema de respuesta a preguntas frecuentes sobre terminologia juridica generica, siempre con revision por un profesional y sin valor de asesoramiento.
- Clasificacion y resumen de documentos en ingles: resumen extractivo de contratos, politicas o textos normativos para preclasificacion, aprovechando la ventana de contexto teorica del modelo base.
- Moderacion o triaje de consultas en un flujo mayor: uso como primera capa que etiqueta o deriva consultas hacia un modelo mayor o hacia un especialista humano.
- Generacion de borradores de texto administrativo: redaccion de plantillas y borradores en ingles para posterior edicion, con verificacion obligatoria de datos facticos.
- Evaluacion comparativa de fine-tunes: al ser un modelo ligero y con licencia permisiva, resulta util como linea base en experimentos de evaluacion de modelos ajustados frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, TruthfulQA ni ninguna otra metrica, y el repositorio registra cero descargas y cero valoraciones, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada en 16 bits (safetensors originales): aproximadamente 6,5-7 GB solo para los pesos, mas la cache KV; en la practica, entre 8 y 10 GB para inferencia comoda.
- VRAM estimada en 8 bits: alrededor de 3,5-4 GB de pesos, con un total de 5-6 GB incluyendo cache.
- VRAM estimada en 4 bits (GGUF Q4_K_M o similar): aproximadamente 2-2,5 GB de pesos, con un total de 3-4 GB.
- GPU recomendadas para 16 bits: NVIDIA A10G, L4, RTX 3090, RTX 4090, A100 o H100 (sobradas para este tamano).
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en cuantizacion de 4 bits cabe tambien en GPUs de 6-8 GB (RTX 3060 6 GB, RTX 4060 8 GB, RTX 2070).
- Opciones de despliegue: transformers, text-generation-inference (declarado por el autor), vLLM, llama.cpp, Ollama y LM Studio mediante conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Como referencia cualitativa, un modelo denso de 3B en una GPU moderna suele ofrecer decenas de tokens por segundo, pero no hay dato confirmado para este repositorio.
- CPU: viable en cuantizacion de 4 bits con llama.cpp, con velocidades de pocos tokens por segundo, no aptas para produccion interactiva.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden de la informacion proporcionada; los del resto son especificaciones publicas de cada modelo, no verificadas en el contexto de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento |
|---|---|---|---|---|---|
| wildnrfm/legal-chatbot-llama3 | 3,21 B | no disponible (base: 128.000) | Apache 2.0 | en | no disponible |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | multilingue | publicado por Meta |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | multilingue (29 idiomas) | publicado por Alibaba |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | multilingue | publicado por Microsoft |

Frente a estas alternativas, la unica ventaja diferencial del modelo analizado seria su presunta especializacion legal, que no esta documentada ni evaluada. En parametros y contexto queda al mismo nivel o por detras, y carece de datos de rendimiento que permitan recomendarlo por encima de los modelos oficiales.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica de Unsloth, sin dataset, hiperparametros, tokens de entrenamiento ni proceso de alineacion.
- Riesgo elevado de alucinacion: un modelo de 3B ajustado sin datos de calidad verificada puede generar afirmaciones juridicas falsas con apariencia de solidez.
- Sesgos: no evaluados. El modelo base Llama 3.2 presenta sesgos conocidos de genero, raza y cultura, y no hay evidencia de mitigacion en este ajuste.
- Idioma: unicamente se declara ingles. No hay garantia de calidad en castellano ni en ningun otro idioma.
- Contexto: la model card no especifica la ventana de contexto real; aunque el modelo base soporte 128.000 tokens, no se ha verificado que el ajuste preserve ese comportamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Llama 3.2, sujeto a la Llama 3.2 Community License y a su politica de uso aceptable, que impone restricciones adicionales (por ejemplo, obligaciones de atribucion y limites de uso). Conviene revisar la cadena de licencias antes de un despliegue comercial.
- Origen de los datos: se desconoce si el dataset de ajuste contiene material con derechos de autor, lo que anade riesgo legal al uso del modelo, especialmente en un dominio juridico.
- Sin validacion externa: cero descargas y cero valoraciones implican que ningun tercero ha reproducido ni auditado el modelo.
- No apto como asesoramiento legal: bajo ninguna circunstancia debe emplearse para emitir opiniones juridicas sin supervision de un profesional cualificado.
- Inconsistencia en metadatos: la etiqueta incluye `text-generation-inference` y `endpoints_compatible`, pero no se aportan pruebas de despliegue ni configuraciones probadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wildnrfm/legal-chatbot-llama3
- Modelo base: https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
