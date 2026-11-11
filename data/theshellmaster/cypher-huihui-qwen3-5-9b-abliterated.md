# TheShellMaster/cypher-Huihui-Qwen3.5-9B-abliterated

## Resumen

cypher-Huihui-Qwen3.5-9B-abliterated es un espejo publico, sin modificar, del fichero cuantizado `Huihui-Qwen3.5-9B-abliterated.Q5_K_M.gguf` (6,52 GB) publicado originalmente por mradermacher. El repositorio, mantenido por TheShellMaster, no aplica re-cuantizacion, fine-tuning ni cambios de plantilla: los pesos son identicos bit a bit a la fuente (sha256 `f6fe9129cf02e61601ceae279932ab936bf48c85f428d710edd3bc81b2c2dc95`). Su unico proposito es la redistribucion redundante del artefacto ya existente.

El modelo subyacente es una variante "abliterated" (sin censura conductual) del Qwen3.5-9B de Alibaba, con 9,65 mil millones de parametros y una ventana de contexto nativa de 262.144 tokens. La abliteracion la realizo huihui-ai sobre los pesos en fp16, y mradermacher genero posteriormente la cuantizacion K-quant Q5_K_M (~5,4 bits por peso) para llama.cpp.

Es relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento generalista de ~9B en hardware modesto (la model card apunta a una GPU T4 de 15 GB) con pesos GGUF listos para llama.cpp u Ollama, y que buscan una variante sin los rechazos conductuales tipicos del modelo original. La licencia apache-2.0 se conserva tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer, segun identificador de arquitectura del autor) |
| Parametros totales | 9,65 B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q5_K_M (~5,4 bits/peso); el repo solo distribuye ese fichero |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero de 6,52 GB |

## Arquitectura y entrenamiento

La informacion disponible identifica la arquitectura como `qwen35`, correspondiente a la familia Qwen3.5 de Alibaba, y confirma que se trata de un transformer denso de 9,65 B de parametros con contexto nativo de 262.144 tokens. No se detallan en la model card la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO en el modelo raiz.

La unica transformacion tecnica documentada es la abliteracion aplicada por huihui-ai sobre los pesos fp16 del modelo original, una tecnica que elimina direcciones de activacion asociadas a comportamientos de rechazo. Posteriormente, mradermacher genero la cuantizacion Q5_K_M con bloques mixtos de 256 pesos, en la que las capas de atencion conservan mayor precision que las capas FFN (rango aproximado de 5,3 a 5,7 bits por peso en promedio). No se han publicado innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento generalista, segun el uso previsto declarado en la model card.
- Conversacion multi-turno con ventanas de contexto muy largas (hasta 262.144 tokens nativos).
- Capacidad multilingue limitada a frances e ingles segun los metadatos del repositorio.
- Respuestas sin los rechazos conductuales habituales del modelo base, gracias a la abliteracion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento generalista en local: el fichero Q5_K_M de 6,52 GB se puede cargar con llama.cpp en una GPU T4 de 15 GB, lo que permite desplegar un modelo de 9,65 B en infraestructura de gama media sin depender de APIs externas.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola pasada, algo inviable en modelos de contexto corto.
- Asistencia conversacional en frances e ingles: los dos idiomas declarados lo hacen adecuado para chatbots de atencion al cliente en esos mercados, integrados via Ollama con un `Modelfile` que fije `num_ctx` y `temperature`.
- Generacion de texto creativo sin restricciones conductuales: la variante abliterated resulta util en tareas de escritura de ficcion o guiones donde los rechazos del modelo alineado interrumpen el flujo.
- Prototipado rapido en estaciones de trabajo: al distribuirse como GGUF unico, se integra en pipelines de llama.cpp u Ollama sin necesidad de convertir pesos ni gestionar safetensors.
- Investigacion sobre alineacion y abliteracion: sirve como artefacto de referencia para comparar el comportamiento del modelo base frente a la variante sin censura en las mismas condiciones de cuantizacion.
- Despliegue en entornos con requisitos de reproducibilidad: el hash sha256 publicado permite verificar la integridad del fichero en cada descarga, util en pipelines de CI que validen artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa 6,52 GB en disco; con overhead de contexto y cache KV, se recomienda un minimo de 8-10 GB de VRAM para `num_ctx` moderados.
- GPU objetivo declarada por el autor: NVIDIA T4 con 15 GB, suficiente para cargar el modelo con `-ngl 99`.
- GPU recomendadas: T4 (15 GB), RTX 3090/4090 (24 GB) para contextos largos, A100/H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) con contextos reducidos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante `Modelfile`. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cypher-Huihui-Qwen3.5-9B-abliterated (este) | 9,65 B | 262.144 | Q5_K_M GGUF | apache-2.0 | espejo de mradermacher |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | 9,65 B | 262.144 | fp16 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9,65 B | 262.144 | safetensors fp16/bf16 | apache-2.0 | Hugging Face |
| mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF | 9,65 B | 262.144 | multiples GGUF | apache-2.0 | Hugging Face |

La diferencia practica entre este repositorio y el de mradermacher es nula en cuanto a pesos: se trata de una copia identica del fichero Q5_K_M. Frente al modelo raiz Qwen3.5-9B, la variante abliterated elimina los rechazos conductuales a costa de posibles efectos secundarios en la coherencia, no documentados en la informacion disponible.

## Limitaciones y advertencias

- La abliteracion puede degradar la coherencia y aumentar comportamientos no deseados; no se han publicado evaluaciones que cuantifiquen ese impacto.
- Riesgo de alucinacion inherente a los modelos de 9B, sin datos de benchmarks que lo acoten.
- Idiomas declarados solo frances e ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- El contexto nativo de 262.144 tokens no garantiza atencion efectiva en toda la ventana; la calidad en contextos muy largos no esta verificada.
- Licencia apache-2.0 permite uso comercial, pero el autor del espejo no ofrece garantias y remite a la fuente original en caso de divergencia.
- Este repositorio es un espejo sin valor añadido tecnico: para obtener otras cuantizaciones o los pesos fp16 conviene acudir a los repositorios de origen.
- No se dispone de informacion sobre tool calling, modo thinking ni capacidades de agente, por lo que no deben asumirse en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-Huihui-Qwen3.5-9B-abliterated
- Modelo base (abliterated fp16): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizaciones GGUF originales: https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
