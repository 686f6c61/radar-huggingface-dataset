# vllm-sr/Vela-2.0-0.8B

## Resumen

Vela 2.0 0.8B es un modelo compacto de 754.565.953 parámetros (aproximadamente 756M) publicado por la organización vllm-sr, fruto de la colaboración entre vLLM Semantic Router y KR Labs dentro de la familia "Open Foundation Routing Models". No es un modelo generativo: se trata de un modelo de decisión ("decision-model", "system-one") que recibe un estado compuesto por petición, contexto y respuesta, junto con preguntas definidas en tiempo de inferencia, y devuelve decisiones estructuradas con tipo, etiqueta, probabilidad y desplazamientos de caracteres.

Su función principal es resolver tres tareas dentro de una misma interfaz: enrutado semántico multilingüe (elegir entre opciones o etiquetas declaradas en la petición), comprobaciones de seguridad (detección de contenido dañino, ataques de prompt e información personal identificable) y localización de fragmentos de texto concretos (respuestas no soportadas por el contexto, extracción de entidades y spans verbatim). El modelo deriva por ajuste fino de vllm-sr/Decision-2.0-Eos-0.8B y se apoya en una columna vertebral híbrida Qwen3.5 de 24 capas que combina Gated DeltaNet con GQA con compuertas.

Es relevante porque cubre un hueco poco atendido en el despliegue de sistemas con LLM: las decisiones de enrutado, guardarraíles y verificación factual suelen resolverse con modelos grandes y costosos o con clasificadores independientes por tarea. Vela 2.0 concentra varias de esas decisiones en una sola pasada, con un límite de entrada de 16.384 tokens, unos 3 GB de memoria de GPU en FP32 y licencia Apache-2.0, lo que lo hace apto para colocar como componente previo o posterior a un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 de 24 capas: Gated DeltaNet y GQA con compuertas (tag "vela2-decoder", decodificador de decisión) |
| Parametros totales | 754.565.953 (aproximadamente 756M) |
| Parametros activos | No aplica: no es un modelo MoE (no disponible si existe algun componente disperso interno) |
| Longitud de contexto | 16.384 tokens de entrada (límite de entrada declarado) |
| Tipos de cuantizacion | No disponible. El modelo se evalua con pesos en FP32 y la columna vertebral en bf16 autocast en GPU; se indica soporte tambien de FP32 en CPU/GPU y fp16, pero no se publican pesos cuantizados (GGUF, AWQ, GPTQ) |
| Idiomas soportados | arabe, chino, checo, neerlandes, ingles, frances, aleman, hindi, italiano, japones, coreano, polaco, portugues, ruso, espanol, sueco y tailandes (17 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo personalizado (tag "custom_code"; requiere trust_remote_code) |
| Tipo de salida | Choice, Yes/no, Score, Span y Set. No genera texto libre |
| Memoria de parametros en GPU | Aproximadamente 3 GB en FP32 |
| Tamano del repositorio | 2,0 GB |
| Modelo base | vllm-sr/Decision-2.0-Eos-0.8B (relacion: finetune) |
| Tipos de PII entrenados | 17 (expuestos en vela2_engine.cal["pii_schema"]["labels"]) |
| Pipeline declarado | zero-shot-classification |

## Arquitectura y entrenamiento

La columna vertebral es un decodificador híbrido de 24 capas basado en Qwen3.5 que combina Gated DeltaNet (una variante de atención lineal con decaimiento y compuertas, para la que el autor recomienda el kernel flash-linear-attention en GPU) con atención GQA con compuertas. Sobre esa columna se montan cabezas específicas de decisión en FP32 que producen elecciones, puntuaciones, spans con offsets de caracteres y conjuntos de etiquetas. El modelo se evaluó con la columna vertebral en bf16 autocast sobre GPU y las cabezas en FP32; también se declara soporte de FP32 en CPU o GPU. El repositorio incluye código personalizado, por lo que la carga requiere trust_remote_code=True y una versión de transformers igual o superior a 5.17.

El ajuste fino parte de vllm-sr/Decision-2.0-Eos-0.8B y se ha entrenado sobre una mezcla de conjuntos orientados a seguridad, verificación factual y extracción de información. Entre los datos declarados figuran nvidia/Aegis-AI-Content-Safety-Dataset-2.0, nvidia/Nemotron-Safety-Guard-Dataset-v3, ToxicityPrompts/PolyGuardMix, microsoft/llmail-inject-challenge y OpenSafetyLab/Salad-Data para contenido dañino e inyección de prompt; KRLabsOrg/lettucedetect-prose-hallucination, KRLabsOrg/lettucedetect-code-hallucination, KRLabsOrg/verbatim-spans, rajpurkar/squad_v2, hotpotqa/hotpot_qa y google-research-datasets/natural_questions para detección de afirmaciones no soportadas y atribución; numind/NuNER, urchade/pile-mistral-v0.1, knowledgator/GLINER-multi-task-synthetic-data, nlpaueb/finer-139, tonytan48/Re-DocRED, MultiCoNER/multiconer_v2 y martinjosifoski/SynthIE para reconocimiento de entidades y relaciones; y KRLabsOrg/tool-output-extraction-swebench para extracción de salidas de herramientas. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Enrutado semántico zero-shot: clasificación entre opciones o etiquetas definidas en tiempo de petición, con distribución de probabilidades por clase (por ejemplo, 0,929 de confianza para "health" con 0,962 de probabilidad en un caso registrado).
- Preguntas de tipo elección ("choice"), sí/no ("Yes/no"), puntuación ("Score"), span y conjunto ("Set") sobre un estado compuesto por petición, contexto y respuesta.
- Detección de información personal identificable con 17 tipos entrenados, devolviendo etiqueta, offsets de caracteres, texto y probabilidad.
- Detección de alucinaciones y afirmaciones no soportadas por el contexto, con localización del fragmento concreto (en el ejemplo publicado, "to 6 grams" con 0,778 de probabilidad).
- Detección de contenido no seguro, incluyendo contenido dañino y ataques de inyección de prompt, según los datasets de seguridad declarados.
- Extracción de spans abiertos ("open-label extraction") y extracción de entidades y relaciones multilingües.
- Extracción de salidas de herramientas en entornos de ingeniería de software (dataset tool-output-extraction-swebench).
- Multilingüe en 17 idiomas, con soporte declarado de contexto largo hasta 16.384 tokens.
- Múltiples preguntas resueltas en una sola llamada, cada una con su propio tipo, instrucciones, criterios y campo de aplicación ("over": request, source, answer).
- No dispone de generación de texto libre ni de modo "thinking"; su salida es exclusivamente estructurada.

## Casos de uso

- Guardarraíl de entrada en producción: antes de enviar una petición al LLM generativo, Vela 2.0 la clasifica como segura o no segura y detecta intentos de inyección de prompt, lo que permite bloquear o reescribir la entrada sin coste de un modelo grande.
- Enrutado de peticiones entre modelos: con las etiquetas de dominio definidas por el operador, el modelo decide qué modelo especializado atenderá cada consulta (matemáticas, salud, código), aprovechando su salida de probabilidades para fijar umbrales de derivación.
- Redacción de PII en logs y trazas: la detección con offsets de caracteres permite anonimizar nombres, correos y otros 17 tipos de datos personales en tuberías de observabilidad antes de persistir los registros.
- Verificación factual de respuestas RAG: dado el contexto recuperado y la respuesta generada, el modelo marca los fragmentos no soportados, lo que habilita una política de reintento o de aviso al usuario cuando la respuesta se desvía del contexto.
- Moderación de contenido generado por usuarios: clasificación multilingüe de contenido dañino y tóxico sobre los 17 idiomas soportados, con salida estructurada fácil de integrar en un sistema de revisión.
- Extracción de entidades y relaciones en documentos: uso como extractor zero-shot sobre contratos, informes o artículos, definiendo las etiquetas en la propia petición sin reentrenamiento.
- Análisis de salidas de herramientas en agentes de código: extracción de fragmentos verbatim de las salidas de herramientas en flujos tipo SWE-bench para alimentar pasos posteriores del agente con información limpia y localizada.
- Auditoría de pipelines de IA: registrar la decisión, su probabilidad y los spans asociados para trazabilidad de las políticas de seguridad y enrutado aplicadas a cada petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La información proporcionada incluye un ejemplo de respuesta registrada (clasificación de dominio con 0,929 de confianza y detección de PII y de afirmación no soportada), pero no tablas comparativas de MMLU, HumanEval, GSM8K ni métricas de clasificación sobre los conjuntos de evaluación.

## Requisitos de hardware

- Memoria de parámetros: aproximadamente 3 GB de VRAM con pesos en FP32 para los 756M de parámetros; en bf16 la columna vertebral reduciría ese consumo, aunque los pesos se cargan en FP32 según la model card.
- GPU recomendadas: no disponible una lista explícita del autor. Cualquier GPU con al menos 4-6 GB de VRAM libres (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) debería poder alojar el modelo, dado el reducido tamaño, aunque las cifras concretas no están publicadas.
- GPU de centro de datos: A100, H100 y similares son compatibles por capacidad, si bien el modelo no las necesita por tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU con 6 GB o más de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: la model card documenta carga con transformers (AutoModel), safetensors y tokenizers, con trust_remote_code. El kernel flash-linear-attention se marca como opcional y mucho más rápido en GPU. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- CPU: se declara soporte de FP32 en CPU o GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Salida | Licencia | Estado |
|---|---|---|---|---|---|---|
| Vela 2.0 0.8B | Enrutado, seguridad y spans en una sola interfaz | 756M | 16.384 tokens | Choice, Yes/no, Score, Span, Set | Apache-2.0 | Publicado |
| GLiNER (familia, knowledgator) | Clasificacion de tokens y NER zero-shot | No disponible | No disponible | Etiquetas y spans | No disponible en la informacion | Referenciado como fuente de datos de entrenamiento |
| LettuceDetect (KRLabsOrg) | Deteccion de alucinaciones | No disponible | No disponible | Spans no soportados | No disponible en la informacion | Referenciado como fuente de datos de entrenamiento |
| Nemotron Safety Guard / Llama Guard | Guardarrailes de contenido | No disponible | No disponible | Clasificacion de seguridad | No disponible en la informacion | Referenciados como fuentes de datos de entrenamiento |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia funcional destacable de Vela 2.0 0.8B es la unificación de enrutado, seguridad y extracción de spans en una única pasada con salida estructurada.

## Limitaciones y advertencias

- El modelo no genera texto: sus salidas son decisiones estructuradas, por lo que no puede usarse como LLM conversacional ni como generador de resúmenes.
- Límite de entrada de 16.384 tokens; no hay información sobre comportamiento con entradas más largas ni sobre estrategias de troceado.
- Requiere ejecución de código personalizado del repositorio (trust_remote_code), lo que implica una revisión de seguridad previa en entornos sensibles.
- No se publican pesos cuantizados, lo que limita el despliegue en entornos con restricciones de memoria o en runtimes que no soportan transformers con código personalizado.
- No hay resultados de benchmarks publicados en la información disponible, de modo que el rendimiento real en producción debe validarse por cuenta propia antes de sustituir guardarraíles o clasificadores existentes.
- Al ser un modelo de decisión, el riesgo de alucinación se manifiesta como falsos positivos o negativos en las etiquetas y spans, no como texto inventado; las probabilidades publicadas en el ejemplo (por ejemplo 0,778 en una detección de span no soportado) indican que conviene calibrar umbrales por tarea.
- Sesgos conocidos: no disponible. Al entrenar con datasets de seguridad y toxicidad, puede heredar los sesgos de anotación de dichos conjuntos.
- El rendimiento en idiomas distintos del inglés y del chino no está documentado con métricas, pese a declararse soporte de 17 idiomas.
- Licencia Apache-2.0, permisiva y compatible con uso comercial, sin cláusulas de restricción conocidas en la información disponible; conviene revisar los términos de los datasets de entrenamiento si se redistribuye el modelo.
- Fecha de creación declarada en HuggingFace: 3 de octubre de 2026; última actualización: 7 de octubre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Vela-2.0-0.8B
- Colección Vela 2.0: https://huggingface.co/collections/vllm-sr/vela-20
- Documentación del proyecto: https://vllm-sr.ai/
- Blog de presentación: https://vllm-sr.ai/blog/vela-2-0-open-foundation-routing-models
- Repositorio GitHub del Semantic Router: https://github.com/vllm-project/semantic-router
- Documentación de uso del modelo: https://huggingface.co/vllm-sr/Vela-2.0-0.8B/blob/main/USAGE.md
- Modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Eos-0.8B
- Motor de inferencia vLLM: https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
