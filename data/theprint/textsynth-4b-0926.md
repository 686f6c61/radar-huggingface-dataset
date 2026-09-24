# theprint/TextSynth-4B-0926

## Resumen

TextSynth-4B-0926 es un ajuste fino (fine-tuning) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario theprint en HuggingFace. Se trata de un transformer denso decoder-only de 4.022.468.096 parametros (aproximadamente 4,02 B) que hereda la arquitectura y el tokenizador de la familia Qwen3, pero cuyo entrenamiento adicional se ha realizado sobre un modelo base ya cuantizado a 4 bits en formato bitsandbytes. El problema que aborda es acotado: especializar un modelo pequeno en las caracteristicas del dataset propietario theprint/Hemispheres-v0.3-Combo-GPT, orientado a generacion de texto conversacional en ingles.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors y con un tamano de repositorio de 8,1 GB, coherente con pesos almacenados en precision de 16 bits. El idioma declarado es unicamente el ingles (en). El pipeline asociado es text-generation y la libreria de referencia es transformers, con compatibilidad declarada con text-generation-inference y con el ecosistema Unsloth/TRL.

Su relevancia actual es limitada y conviene ser honesto al respecto: en el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no se ha publicado model card extendida, no hay resultados de benchmarks y no se documentan hiperparametros de entrenamiento. Es, por tanto, un artefacto experimental de ajuste fino mas que un modelo listo para produccion, aunque su licencia permisiva y su tamano contenido lo hacen facil de evaluar en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, familia Qwen3 (heredada del modelo base) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | No se publican GGUF, GPTQ ni AWQ. El repositorio contiene safetensors (~8,1 GB, coherente con 16 bits). El modelo base del que deriva se distribuye en bnb-4bit |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit |
| Dataset de ajuste | theprint/Hemispheres-v0.3-Combo-GPT |
| Tamano del repositorio | 8,1 GB |
| Fecha de publicacion | 2026-09-24 (creacion), 2026-09-24 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso decoder-only de la familia Qwen3, con atencion causal y el tokenizador propio de dicha familia. La ficha no documenta el numero de capas, la dimensionalidad del modelo, el numero de cabezas de atencion ni la configuracion exacta de atencion (por ejemplo, si emplea grouped-query attention). Tampoco se detalla la longitud de contexto efectiva tras el ajuste, por lo que cualquier cifra al respecto debe tomarse de la documentacion del modelo base y no de esta publicacion. El modelo no es de mezcla de expertos (MoE), de modo que los 4,02 B de parametros son todos activos en cada paso de inferencia.

El entrenamiento consistio en un ajuste fino supervisado realizado con Unsloth y la libreria TRL de HuggingFace, que el autor describe como "2 veces mas rapido" gracias a las optimizaciones de Unsloth. El punto de partida es un modelo ya cuantizado a 4 bits con bitsandbytes, lo que implica que el ajuste se aplico sobre pesos degradados, no sobre el modelo en precision completa; esto es un caveat tecnico relevante. El dataset utilizado es theprint/Hemispheres-v0.3-Combo-GPT, de composicion y tamano no especificados en la informacion disponible. No se documentan el numero de tokens de entrenamiento, el numero de epochs, la tasa de aprendizaje, el rango de LoRA ni si hubo fases posteriores de RLHF, DPO o similares.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como conversational y orientado a text-generation.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3-4B-Instruct-2507, si bien no se han publicado evaluaciones especificas para este ajuste.
- Modo "thinking" (razonamiento explicito): la familia Qwen3-Instruct-2507 esta disenada sin modo de pensamiento explicito por defecto, pero no se confirma en la informacion proporcionada para este ajuste concreto.
- Tool calling / function calling: no disponible; no se documenta soporte explicito en la ficha.
- Uso en agentes y razonamiento multi-paso: no disponible; no se documenta ni se evalua.
- Capacidades multilingues: declaradas unicamente para ingles (en) en las etiquetas del repositorio.
- Vision, audio u otras modalidades: no soportadas (el modelo es exclusivamente de texto).
- Compatibilidad de despliegue: etiquetado como compatible con text-generation-inference y con endpoints.

## Casos de uso

- Evaluacion comparativa de ajustes finos: dado que no hay benchmarks publicados, el uso mas inmediato es reproducir evaluaciones sobre tareas estandar y comparar el resultado con el modelo base Qwen3-4B-Instruct-2507 para medir el efecto real del ajuste con el dataset Hemispheres.
- Prototipado de asistentes conversacionales en ingles: por su tamano contenido (4,02 B) puede ejecutarse en una unica GPU de consumo y servir como banco de pruebas para flujos multi-turno antes de escalar a modelos mayores.
- Generacion de texto asistida en flujos internos: redaccion de borradores, resumenes y reformulacion de documentos en ingles, ejecutando el modelo en local para evitar enviar datos a APIs externas.
- Fine-tuning sobre dominio propio como plantilla: el hecho de que el repositorio incluya una receta Unsloth/TRL replicable lo convierte en un punto de partida para ajustar Qwen3-4B sobre corpus especificos de una organizacion.
- Despliegue en entornos con recursos limitados: al ser un modelo denso de 4 B, puede servirse en una GPU de 8-16 GB con cuantizacion, lo que permite ofrecer generacion de texto on-premise en equipos modestos.
- Investigacion sobre los efectos de partir de un base cuantizado a 4 bits: el modelo permite estudiar empiricamente como afecta entrenar sobre pesos bnb-4bit frente a entrenar sobre precision completa, comparando con el modelo base original.
- Generacion de datos sinteticos en ingles: util como generador auxiliar para producir pares instruccion-respuesta o textos de relleno en pipelines de aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion en la ficha del modelo, en las etiquetas del repositorio ni en el material proporcionado. Tampoco se documentan mediciones de latencia, throughput ni comparaciones controladas contra el modelo base.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (4,02 B) y no mediciones publicadas por el autor.

- Pesos en FP16/BF16: aproximadamente 8 GB solo para los pesos; con cache KV y overhead de runtime, del orden de 10-12 GB de VRAM para contextos moderados.
- Cuantizacion a 8 bits: aproximadamente 4,5-5 GB de pesos y 6-8 GB de VRAM totales, en funcion de la longitud de contexto.
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF, si se generan a partir de los safetensors): aproximadamente 2,5-3 GB de pesos y 4-6 GB de VRAM totales.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. En tarjetas de 8 GB (RTX 3070, RTX 4060) solo con cuantizacion de 4 bits y contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100 o L40S estan claramente sobredimensionadas para un 4 B, salvo que se busque paralelizar por lote para maximizar throughput.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta explicita), vLLM y SGLang como servidores de inferencia habituales para Qwen3. llama.cpp u Ollama son viables solo si se convierte el modelo a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de la documentacion publica de sus respectivos desarrolladores, no de esta ficha.

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|
| TextSynth-4B-0926 | 4,02 B | No disponible en esta ficha (el base declara 262.144) | Apache 2.0 | HuggingFace, 0 descargas, sin benchmarks |
| Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens | Apache 2.0 | Ampliamente distribuido y evaluado |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Ampliamente distribuido, con restricciones de uso |
| Gemma-3-4B-IT | 4 B | 128.000 tokens | Terminos de uso de Gemma | Distribuido por Google, con condiciones propias |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens | MIT | Distribuido por Microsoft |

La diferencia principal de TextSynth-4B-0926 frente a todos ellos no esta en la arquitectura ni en el tamano, sino en la ausencia total de evaluacion publicada: es el unico de la tabla sin benchmarks, sin descargas y sin documentacion de entrenamiento. Frente al modelo base, la unica diferencia verificable es el ajuste con el dataset Hemispheres-v0.3-Combo-GPT y el hecho de que el punto de partida estaba cuantizado a 4 bits.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, por lo que no puede afirmarse que el ajuste mejore al modelo base en ninguna tarea; podria incluso degradarlo.
- Punto de partida cuantizado: el ajuste se realizo sobre un modelo bnb-4bit, lo que introduce una perdida de precision previa al entrenamiento y limita el techo de calidad alcanzable.
- Sesgos: no se documenta ninguna auditoria de sesgos, composicion del dataset ni filtrado de contenido. El dataset Hemispheres-v0.3-Combo-GPT no esta descrito en la informacion disponible.
- Alucinacion: al ser un modelo de 4 B ajustado sin documentacion de alineamiento adicional, cabe esperar una tasa de alucinacion propia de su escala, sin que existan mediciones que la cuantifiquen.
- Idioma: soporte declarado unicamente para ingles. El rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: la longitud de contexto efectiva tras el ajuste no se documenta y debe verificarse antes de disenar aplicaciones con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restriccion de royalties, siempre que se conserve el aviso de licencia. Conviene verificar que el modelo base y el dataset asociado no impongan condiciones adicionales.
- Reproducibilidad: no se publican hiperparametros, semillas, ni la composicion del dataset, por lo que el ajuste no es reproducible tal cual.
- Madurez: 0 descargas y 0 "likes" implican ausencia de validacion por parte de la comunidad; no se recomienda su uso en produccion sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theprint/TextSynth-4B-0926
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
- Dataset de ajuste: https://huggingface.co/datasets/theprint/Hemispheres-v0.3-Combo-GPT
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
