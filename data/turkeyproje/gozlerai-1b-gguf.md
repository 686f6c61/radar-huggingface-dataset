# TurkeyProje/GozlerAI-1B-GGUF

## Resumen

GozlerAI-1B-GGUF es la version cuantizada en formato GGUF del modelo FYaren/Llama-3.2-1B-Instruct-Turkish, un ajuste fino del conocido Llama 3.2 de 1B parametros de Meta orientado a instrucciones en turco. El repositorio, publicado por el usuario TurkeyProje, contiene unicamente los pesos cuantizados generados por mradermacher a partir del modelo base; no se trata de un modelo entrenado desde cero ni de una arquitectura nueva.

El modelo base parte de Llama-3.2-1B-Instruct, un transformer decoder-only denso de aproximadamente 1.235 millones de parametros, y ha sido ajustado para seguir instrucciones. La relevancia de esta ficha radica en que ofrece una via de despliegue ligera en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles con GGUF, con un peso que va desde 0,7 GB en Q2_K hasta 2,6 GB en f16.

La informacion disponible es muy limitada: la model card solo documenta el proceso de cuantizacion y las variantes generadas, sin detallar datos de entrenamiento, benchmarks ni condiciones de licencia. Cualquier dato no confirmado se marca explicitamente como no disponible a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128K tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos del repo); el modelo base esta orientado a turco |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B Instruct: un transformer decoder-only denso con atencion multi-cabeza agrupada (GQA) y normalizacion RMSNorm, tal como se define en la familia Llama 3.2. El modelo original fue entrenado por Meta y posteriormente ajustado por FYaren para instrucciones en turco, dando lugar a FYaren/Llama-3.2-1B-Instruct-Turkish, que es el punto de partida de esta cuantizacion.

El repositorio GozlerAI-1B-GGUF no aporta informacion sobre el dataset de ajuste fino, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. La model card se limita a indicar que se trata de cuantizaciones estaticas del modelo base, generadas con el flujo habitual de mradermacher (convert_type: hf, quantize_version: 2) y sin cuantizaciones ponderadas por matriz de importancia (imatrix), que segun el autor no estan disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional: el modelo esta ajustado para seguir instrucciones y mantener dialogos multi-turno, segun se deduce de su origen como Instruct.
- Razonamiento basico y respuesta a preguntas: propio de un modelo de 1B parametros, con capacidad limitada en tareas complejas.
- Generacion de codigo y matematicas: no se documenta soporte especifico ni resultados que lo confirmen.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos declaran solo ingles ("en"), aunque el modelo base esta orientado al turco; no se confirma el comportamiento en otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue en dispositivos de gama baja: gracias a las cuantizaciones Q4_K_S y Q4_K_M (0,9 GB), el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que lo hace util para prototipos locales de asistentes conversacionales.
- Experimentacion con modelos turcos en entornos con recursos limitados: al derivar de un ajuste fino en turco, permite probar comportamiento conversacional en ese idioma sin necesidad de infraestructura de servidor.
- Educacion e investigacion: sirve como ejemplo didactico de cuantizacion GGUF y de como un modelo de 1B puede ejecutarse en CPU, util para cursos de IA aplicada.
- Filtrado y clasificacion de texto ligera: con Q8_0 (1,4 GB) se puede integrar en pipelines de preprocesamiento donde se requiera baja latencia y no haya GPU.
- Chatbots embebidos en aplicaciones de escritorio o moviles: el tamano reducido de Q2_K y Q3_K (0,7-0,8 GB) permite incluirlo en aplicaciones con requisitos estrictos de espacio.
- Base para ajuste fino adicional: al ser un modelo pequeno, puede servir como punto de partida para fine-tuning en tareas concretas con recursos modestos, aunque la licencia no confirmada supone un riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,1 GB para cuantizaciones Q2_K a Q5_K_M, 1,4 GB para Q8_0 y 2,6 GB para f16, sin contar el espacio adicional para el contexto KV cache.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4 bits; para f16 se recomienda al menos 6 GB. En entornos profesionales, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1650 4 GB en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GozlerAI-1B-GGUF | 1,235 B | no disponible | no disponible | GGUF | Cuantizacion de un ajuste fino turco de Llama 3.2 1B |
| Llama-3.2-1B-Instruct (Meta) | 1,24 B | 128K (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo original en ingles, ampliamente soportado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32K (segun Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa multilingue con licencia permisiva |
| Gemma-2-2B-it | 2,6 B | 8K (segun Google) | Gemma Terms of Use | safetensors, GGUF | Mayor tamano y contexto menor, orientado a instrucciones |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (Llama 3.2 Community License) antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: inherente a los modelos de 1B parametros, especialmente en tareas de razonamiento, matematicas y hechos verificables.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Llama 3.2, hereda los sesgos del modelo original y del ajuste fino turco.
- Limitaciones de idioma: los metadatos declaran solo ingles, mientras que el ajuste fino es turco; el comportamiento en castellano u otros idiomas no esta garantizado.
- Contexto no confirmado: aunque el modelo base soporta ventanas largas, no se especifica en esta ficha la longitud efectiva tras el ajuste fino.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- Sin cuantizaciones imatrix: el autor indica que no estan disponibles, lo que puede suponer una perdida de calidad frente a alternativas ponderadas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TurkeyProje/GozlerAI-1B-GGUF
- Modelo base: https://huggingface.co/FYaren/Llama-3.2-1B-Instruct-Turkish
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Llama-3.2-1B-Instruct-Turkish-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
