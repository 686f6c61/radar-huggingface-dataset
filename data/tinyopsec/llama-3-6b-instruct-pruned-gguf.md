# tinyopsec/Llama-3-6B-Instruct-pruned-GGUF

## Resumen

Llama-3-6B-Instruct-pruned-GGUF es una distribucion en formato GGUF de un checkpoint derivado de Llama 3 8B Instruct, podado de 8B a aproximadamente 6,28B parametros por el usuario kuotient y empaquetado para llama.cpp por tinyopsec. La poda se realizo con PruneMe/mergekit eliminando un bloque de capas intermedias (se conservan las capas 0-20 y 29-31), lo que reduce el coste de inferencia y de memoria en torno a un 21 % respecto al modelo original sin reentrenamiento posterior.

El interes practico esta en la reduccion de requisitos: al ser un modelo denso de ~6,3B en GGUF, puede ejecutarse en GPUs de consumo con cuantizaciones de 4 bits (Q4_K_M) y en CPU con llama.cpp, Ollama, LM Studio o koboldcpp. Es, por tanto, una opcion de bajo coste para prototipado y despliegue local de un modelo conversacional con la licencia Llama 3.

Ahora bien, se trata de un artefacto experimental: el propio autor advierte que no hubo "post-training healing" tras la poda, no se publican idiomas soportados ni resultados de benchmarks, y el rendimiento real puede degradarse de forma no uniforme respecto al Llama 3 8B Instruct original. Debe evaluarse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3 8B Instruct, podada con PruneMe/mergekit) |
| Parametros totales | 6.285.365.248 (~6,28B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada teoricamente de Llama 3 8B Instruct; no confirmada por el autor) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | GGUF (un fichero por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es un checkpoint Llama 3 8B Instruct al que se le han eliminado capas mediante PruneMe/mergekit, conservando las capas 0-20 y 29-31. Se trata, por tanto, de un transformer decoder-only denso con atencion multi-cabeza por grupos (GQA) heredada de la familia Llama 3, pero con un numero de bloques reducido y, por consiguiente, un grafo de computo mas corto. El resultado son 6.285.365.248 parametros frente a los ~8,03B del original.

No consta en la informacion disponible ningun proceso de reentrenamiento, destilacion ni "healing" tras la poda; el autor lo declara explicitamente como modelo experimental sin post-entrenamiento de recuperacion. Tampoco se documentan tokens de entrenamiento adicionales, composicion del dataset, ni fases de RLHF/DPO propias de esta version: las capacidades conversacionales provienen del Llama 3 8B Instruct original, mientras que la poda puede haber afectado de forma desigual a las capas eliminadas. La conversion a GGUF se realizo con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste instruct de Llama 3 8B.
- Razonamiento basico y respuesta a instrucciones en formato chat.
- Generacion de codigo y tareas de matematicas simples (capacidad no verificada tras la poda; sin benchmarks publicados).
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la poda puede degradar el razonamiento encadenado.
- Capacidades multilingues: no disponible (el autor no declara idiomas; el modelo base Llama 3 cubre principalmente ingles y, en menor medida, otros idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Compatibilidad con endpoints y runtimes GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).

## Casos de uso

- Prototipado local de asistentes conversacionales: con Q4_K_M (~3,8 GB) el modelo cabe en GPUs de consumo de 6-8 GB de VRAM, lo que permite iterar en un portatil sin depender de la nube.
- Despliegue en CPU o entornos sin GPU: al estar en GGUF y disponible en cuantizaciones de 2 a 8 bits, puede servirse con llama.cpp en servidores modestos para tareas de generacion de texto de baja concurrencia.
- Generacion de texto en aplicaciones de escritorio: integrable en LM Studio u Ollama para funciones de redaccion, resumen o reescritura con latencia aceptable en hardware consumer.
- Evaluacion comparativa de tecnicas de poda: sirve como caso de estudio para medir la degradacion de un Llama 3 8B Instruct tras eliminar capas, util en investigacion sobre compresion de modelos.
- Filtrado y clasificacion de texto por lotes: su menor huella de memoria permite ejecutar pipelines de etiquetado o extraccion de informacion en hardware limitado, siempre que se valide la calidad frente al modelo original.
- Base para fine-tuning ligero en entornos con recursos restringidos: al tener menos parametros que el 8B original, reduce los requisitos de memoria para LoRA/QLoRA, aunque la ausencia de healing exige un dataset de recuperacion cuidadoso.
- Educacion y demos: util para mostrar el funcionamiento de un LLM instruct local sin coste de API, con la advertencia de que la calidad puede ser inferior a la del modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,0-2,3 GB.
  - Q4_K_M (recomendado): ~3,6-4,0 GB.
  - Q5_K_M: ~4,3-4,7 GB.
  - Q6_K: ~5,0-5,4 GB.
  - Q8_0: ~6,6-7,0 GB.
  - F16: ~12,6 GB (tamano declarado por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas de 6-8 GB con Q4_K_M y en tarjetas de 8-12 GB con Q5/Q6/Q8.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no se documentan para este artefacto concreto.
- Latencia y throughput estimados: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3-6B-Instruct-pruned-GGUF (este) | ~6,28B | no disponible | Llama 3 Community | GGUF | Poda experimental sin healing; sin benchmarks publicados |
| Llama 3 8B Instruct | ~8,03B | 8.192 tokens (segun documentacion de Meta) | Llama 3 Community | safetensors, GGUF | Modelo de referencia; mayor coste de memoria (~21 % mas de parametros) |
| Mistral 7B Instruct | ~7,24B | 32.768 tokens (segun documentacion de Mistral) | Apache 2.0 | safetensors, GGUF | Licencia permisiva y contexto mayor; alternativa habitual en el mismo rango |
| Qwen2.5 7B Instruct | ~7,62B | 32.768 tokens (segun documentacion de Qwen) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Buen rendimiento en codigo y matematicas; licencia permisiva |

La comparacion con Llama 3 8B Instruct y Mistral 7B se basa en datos publicos de sus respectivas documentaciones; no se dispone de mediciones directas de este derivado podado frente a ellos.

## Limitaciones y advertencias

- Modelo experimental sin post-training healing: la eliminacion de las capas 21-28 puede degradar la coherencia, el razonamiento multi-paso y la fidelidad a instrucciones complejas de forma no uniforme.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la perdida de calidad respecto a Llama 3 8B Instruct.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y potencialmente agravado por la poda; requiere validacion en dominios factuales.
- Idiomas no declarados: el autor no especifica cobertura linguistica; se asume principalmente ingles por herencia del modelo base.
- Contexto no confirmado: aunque el modelo base soporta 8.192 tokens, no se verifica que la poda preserve el comportamiento en contextos largos.
- Tool calling y comportamiento agentico no documentados: no debe asumirse su correcto funcionamiento en pipelines de agentes sin evaluacion previa.
- Licencia Llama 3 Community: impone restricciones de uso comercial (clausula de 700 millones de usuarios mensuales, requisitos de atribucion "Built with Meta Llama 3" y politicas de uso aceptable); revisar antes de desplegar en produccion.
- Repositorio grande (61,0 GB) por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Trazabilidad limitada: autor con pocos likes/descargas y sin documentacion adicional sobre el proceso de poda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyopsec/Llama-3-6B-Instruct-pruned-GGUF
- Modelo base: https://huggingface.co/kuotient/Llama-3-6B-Instruct-pruned
- Llama 3 8B Instruct (modelo de origen): https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- mergekit: https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Llama 3: https://llama.meta.com/llama3/license/
