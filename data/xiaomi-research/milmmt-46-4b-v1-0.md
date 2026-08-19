# xiaomi-research/MiLMMT-46-4B-v1.0

## Resumen

MiLMMT-46-4B-v1.0 es un modelo de traduccion automatica neuronal multilingue desarrollado por Xiaomi Inc. que parte del modelo base Gemma3-4B de Google. El modelo esta disenado para cubrir traduccion entre 46 idiomas, incluyendo lenguas de baja representacion como el khmer, lao, birmano o uzbeko, ademas de los idiomas mayoritarios. Su entrenamiento sigue un pipeline de cuatro fases: preentrenamiento continuo sobre 143 mil millones de tokens, ajuste supervisado, aprendizaje por refuerzo y fusion de modelos.

La relevancia de este modelo radica en su enfoque de post-entrenamiento sin referencias (reference-free) para traduccion multilingue, una estrategia que permite mejorar la calidad de traduccion sin depender de datos paralelos etiquetados en todas las fases. Con 4.300 millones de parametros, ofrece un equilibrio entre calidad de traduccion y requisitos de hardware, posicionandose como una alternativa eficiente a modelos de mayor tamano para tareas de traduccion en produccion. El modelo se distribuye bajo licencia Gemma y es compatible con el ecosistema de Hugging Face Transformers y vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma3) |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Gemma3-4B, 128k tokens) |
| Tipos de cuantizacion | no disponible (safetensors en FP16/BF16) |
| Idiomas soportados | 46: arabe, azerbaiyano, bulgaro, bengali, catalan, checo, danes, aleman, griego, ingles, espanol, persa, finlandes, frances, hebreo, hindi, croata, hungaro, indonesio, italiano, japones, kazajo, khmer, coreano, lao, malayo, birmano, noruego, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandes, tagalo, turco, urdu, uzbeko, vietnamita, cantonés, chino simplificado, chino tradicional |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiLMMT-46-4B-v1.0 se construye sobre la arquitectura Gemma3-4B, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternada, disenada para manejar contextos largos de hasta 128k tokens. El entrenamiento se desarrollo en cuatro etapas secuenciales: primero, un preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingues y paralelos en 46 idiomas, que produjo el checkpoint intermedio MiLMMT-46-4B-Pretrain; segundo, un ajuste supervisado que dio lugar a MiLMMT-46-4B-v0.1; tercero, una fase de aprendizaje por refuerzo; y cuarto, una fase de fusion de modelos que produce la version final v1.0.

La innovacion principal documentada en el articulo asociado (arXiv:2608.10812) es el uso de post-entrenamiento sin referencias (reference-free post-training), una metodologia que permite optimizar la calidad de traduccion sin depender de traducciones de referencia durante el entrenamiento por refuerzo. Este enfoque, combinado con la fusion de modelos, permite obtener mejoras de calidad sobre el checkpoint v0.1 sin necesidad de aumentar la escala del modelo. El articulo reporta que esta estrategia es efectiva incluso aplicada sobre modelos SFT de 12 mil millones de parametros.

## Capacidades

- Traduccion automatica entre 46 idiomas, con especial atencion a lenguas de baja representacion como khmer, lao, birmano, uzbeko y cantonés.
- Generacion de texto condicionada por instrucciones de traduccion en formato prompt estructurado.
- Soporte de traduccion bidireccional entre cualquier par de los 46 idiomas soportados.
- Compatible con el formato de prompt especifico: "Translate this from \<source language name\> to \<target language name\>".
- Capacidad de procesamiento de contexto largo heredada de Gemma3-4B (hasta 128k tokens), util para traducir documentos extensos.
- Integracion con vLLM para inferencia de alta productividad y con Transformers para despliegue estandar.
- Soporte de decodificacion greedy (temperature=0, top_k=1) recomendado por los autores para resultados optimos.

## Casos de uso

- Localizacion de productos software: el modelo puede traducir cadenas de interfaz de usuario, documentacion tecnica y mensajes de error a 46 idiomas, integrandose en pipelines de CI/CD mediante vLLM para generar builds localizados automaticamente.
- Traduccion de documentacion corporativa: con su contexto largo de 128k tokens, permite traducir manuales, contratos y documentos legales completos en una sola pasada, reduciendo la fragmentacion y los errores de coherencia terminologica.
- Atencion al cliente multilingue: el modelo puede integrarse en sistemas de ticketting o chatbots para traducir consultas de clientes y respuestas de agentes en tiempo real, cubriendo idiomas minoritarios que otros servicios de traduccion no soportan adecuadamente.
- Traduccion de contenido generado por usuarios: ideal para plataformas de redes sociales, foros o marketplaces que necesitan traducir comentarios, resenas y mensajes entre usuarios de distintas regiones, incluyendo idiomas como urdu, tamil o tagalo.
- Subtitulado y transcripcion multilingue: el modelo puede traducir transcripciones de video o audio a multiples idiomas simultaneamente, facilitando la distribucion de contenido educativo o de entretenimiento en mercados emergentes.
- Investigacion en NLP multilingue: sirve como modelo base para experimentos de traduccion, evaluacion de calidad sin referencias y desarrollo de metricas automaticas, dado su entrenamiento con tecnicas reference-free documentadas en el articulo asociado.
- Traduccion de codigo y documentacion tecnica: aunque no esta especializado en codigo, puede traducir comentarios, docstrings y documentacion de repositorios a los 46 idiomas soportados, manteniendo la estructura del texto tecnico.

## Benchmarks y rendimiento

La model card incluye una figura con resultados experimentales comparativos, pero no se proporcionan valores numericos desglosados en la informacion disponible. El articulo asociado (arXiv:2608.10812) reporta evaluaciones con metricas como COMET y COMETKiwi, indicando que el post-entrenamiento sin referencias es efectivo a distintas escalas de modelo, incluyendo sobre modelos SFT de 12 mil millones de parametros. No se han publicado resultados numericos detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8.6 GB para los pesos del modelo, mas overhead de activaciones y cache KV. Con contexto de 128k tokens, se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40 GB), H100 (80 GB) para produccion con contexto largo; RTX 4090 (24 GB) para experimentacion y desarrollo.
- Compatible con GPU de consumo: si, una RTX 3090 o RTX 4090 con 24 GB de VRAM puede ejecutar el modelo en FP16 con contexto moderado. Con cuantizacion (no oficialmente publicada, pero posible con herramientas como llama.cpp o AutoGPTQ), cabria en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM (recomendado por los autores), Hugging Face Transformers, FriendliAI para inferencia gestionada, y potencialmente llama.cpp u Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponible. Dependera del hardware y la longitud de contexto. En vLLM con una A100, se espera throughput de cientos de tokens por segundo para lotes pequenos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiLMMT-46-4B-v1.0 | 4.3B | 46 | 128k (heredado) | Gemma | Especializado en traduccion, post-entrenamiento reference-free |
| Gemma3-4B (base) | 4.3B | ~140 | 128k | Gemma | Modelo base generalista, no especializado en traduccion |
| NLLB-200 | 600M-54.5B | 200 | 512 tokens | CC-BY-NC | Traduccion a mas idiomas, pero contexto muy limitado |
| M2M-100 | 418M-12B | 100 | 1024 tokens | MIT | Traduccion multilingue, contexto limitado, sin capacidades LLM |

MiLMMT-46-4B-v1.0 se distingue por combinar las capacidades de razonamiento y generacion de un LLM moderno con una especializacion en traduccion, ofreciendo contexto largo y cobertura de 46 idiomas. Comparado con NLLB-200, cubre menos idiomas pero ofrece un contexto mucho mayor y capacidades de generacion mas flexibles. Frente a su modelo base Gemma3-4B, esta especializado en traduccion y ha sido optimizado mediante post-entrenamiento, aunque pierde parte de la cobertura multilingue generalista.

## Limitaciones y advertencias

- El modelo solo garantiza calidad de traduccion para los 46 idiomas listados; para otros idiomas, el rendimiento no esta garantizado y probablemente sea deficiente.
- La licencia Gemma tiene restricciones de uso comercial especificas; es necesario revisar los terminos de la licencia de Google antes de desplegar el modelo en produccion.
- No se proporcionan datos de sesgos o alucinaciones especificos del modelo; como todo LLM, puede generar traducciones incorrectas o inventar contenido, especialmente con entradas ambiguas o fuera de distribucion.
- La longitud de contexto de 128k tokens es heredada de Gemma3-4B, pero no se ha verificado el rendimiento de traduccion con contextos extremadamente largos en la informacion disponible.
- El modelo no soporta vision, audio ni otras modalidades; es exclusivamente texto.
- No se han publicado resultados de benchmarks estandarizados (BLEU, COMET) con valores numericos en la model card; la evaluacion se basa en la figura incluida y el articulo asociado.
- El prompt de traduccion debe seguir el formato exacto especificado; desviaciones pueden degradar significativamente la calidad de salida.

## Enlaces

- Hugging Face: https://huggingface.co/xiaomi-research/MiLMMT-46-4B-v1.0
- Repositorio GitHub: https://github.com/xiaomi-research/gemmax
- Articulo arXiv (v1.0): https://arxiv.org/abs/2608.10812
- Articulo arXiv (v0.1): https://arxiv.org/abs/2608.10812 (referenciado como "Scaling Model and Data for Multilingual Machine Translation with Open Large Language Models")
- FriendliAI (despliegue gestionado): https://friendli.ai/models/xiaomi-research/MiLMMT-46-4B-v1.0
