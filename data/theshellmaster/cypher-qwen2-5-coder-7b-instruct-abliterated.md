# TheShellMaster/cypher-Qwen2.5-Coder-7B-Instruct-abliterated

## Resumen

cypher-Qwen2.5-Coder-7B-Instruct-abliterated es un espejo publico y no modificado del fichero GGUF `Qwen2.5-Coder-7B-Instruct-abliterated-Q5_K_M.gguf`, publicado originalmente por bartowski. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son identicos bit a bit a la fuente (sha256 `09d606dc9b5b784dbe74924dc91a63e865ddc2ee3ac0745c531fe01f317a6865`, 5.444.832.096 bytes). El repositorio actua unicamente como punto de distribucion redundante.

El modelo raiz es Qwen2.5-Coder-7B-Instruct de Alibaba, especializado en generacion de codigo y rellenado en medio (FIM). Sobre el se aplico una ablacion de direcciones de rechazo (abliteration) en fp16 por parte de huihui-ai, que elimina el comportamiento de negativa del modelo ante ciertas peticiones. Posteriormente bartowski lo cuantizo a GGUF Q5_K_M.

Es relevante para desarrolladores que necesitan un modelo de codigo de 7,6 B parametros con contexto nativo de 32.768 tokens, ejecutable en GPU de consumo (el autor cita una T4 de 15 GB como objetivo), con licencia Apache 2.0 y sin las restricciones de rechazo del modelo original. La contrapartida es que la ablacion degrada la alineacion de seguridad, lo que exige cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen2 (transformer decoder-only) |
| Parametros totales | 7,6 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativo) |
| Tipos de cuantizacion | Q5_K_M (~5,4 bits/peso, 5,44 GB); el repositorio solo aloja esta cuantizacion |
| Idiomas soportados | fr, en (segun metadatos del autor) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-Coder-7B-Instruct original: un transformer decoder-only de tipo `qwen2` con 7,6 B parametros, sin mezcla de expertos. El entrenamiento original procede de Alibaba (Qwen), que no detalla en esta informacion el numero de tokens ni la composicion del dataset; no se dispone de esos datos. El modelo esta orientado a generacion de codigo y a tareas FIM (fill-in-the-middle), lo que lo hace adecuado para autocompletado en editores.

La innovacion tecnica de esta variante es la abliteration: huihui-ai modifico los pesos en fp16 para eliminar las direcciones de activacion asociadas al rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. bartowski genero despues la cuantizacion GGUF Q5_K_M, un K-quant mixto por bloques de 256 pesos que asigna mas precision a las capas de atencion que a las FFN, con un promedio de 5,3 a 5,7 bits por peso. El espejo de TheShellMaster no re-cuantiza, no hace fine-tuning y no cambia la plantilla de chat.

## Capacidades

- Generacion de codigo en multiples lenguajes, heredada del Qwen2.5-Coder-7B-Instruct.
- Rellenado en medio (FIM), pensado para autocompletado en IDE.
- Generacion de texto general y respuesta a instrucciones (variante Instruct).
- Conversacion multi-turno con contexto de hasta 32.768 tokens.
- Capacidades multilingues limitadas a frances e ingles segun los metadatos del autor.
- Comportamiento sin rechazo (uncensored) gracias a la abliteration.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Autocompletado de codigo en editor: el modelo soporta FIM y contexto de 32.768 tokens, por lo que puede integrarse en plugins de VS Code o Neovim mediante llama.cpp u Ollama para sugerir lineas y bloques completos.
- Asistente de refactorizacion local: con 5,44 GB en Q5_K_M cabe en GPUs de consumo, lo que permite desplegarlo en una estacion de trabajo sin enviar codigo propietario a la nube.
- Generacion de tests unitarios: el modelo puede recibir una funcion y producir casos de prueba, aprovechando su entrenamiento especifico en codigo.
- Documentacion automatica de APIs: dado un fragmento de codigo, generar docstrings y comentarios en ingles o frances.
- Chat tecnico sin filtros: para investigacion sobre comportamiento de modelos ablacionados y estudio de sesgos, al no rechazar peticiones que el modelo original bloquearia.
- Prototipado en entornos con GPU modesta: el autor cita una T4 de 15 GB como objetivo, por lo que sirve para demos en instancias cloud economicas.
- Traduccion tecnica ingles-frances de documentacion y comentarios de codigo, dentro del par de idiomas declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 5,44 GB solo para los pesos en Q5_K_M; con contexto de 8.192 tokens y cache KV hay que anadir aproximadamente 1-3 GB segun la implementacion.
- GPU recomendadas: el autor cita una T4 de 15 GB como objetivo; tambien cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter (A100, H100) sin problema.
- GPU de consumo: si, cabe en cualquier GPU con 8 GB o mas de VRAM en Q5_K_M con contexto moderado.
- Despliegue: llama.cpp (`llama-cli -m ... -c 8192 -ngl 99`) y Ollama mediante `Modelfile`; no se documentan otras opciones como vLLM o TGI para este fichero GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-Qwen2.5-Coder-7B-Instruct-abliterated | 7,6 B | 32.768 | apache-2.0 | GGUF Q5_K_M | Espejo sin cambios de bartowski; sin rechazo |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 | apache-2.0 | safetensors, GGUF | Modelo raiz con alineacion intacta |
| huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated | 7,6 B | 32.768 | apache-2.0 | safetensors (fp16) | Abliteration sin cuantizar |
| bartowski/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF | 7,6 B | 32.768 | apache-2.0 | GGUF (varias cuantizaciones) | Fuente directa del fichero espejado |

## Limitaciones y advertencias

- La abliteration elimina el rechazo del modelo, lo que degrada la alineacion de seguridad y aumenta el riesgo de generar contenido danino si se usa sin supervision.
- Riesgo de alucinacion inherente a un modelo de 7,6 B; no verificado en benchmarks en esta informacion.
- Idiomas declarados solo fr y en; el rendimiento en castellano no esta garantizado ni documentado.
- El repositorio solo contiene la cuantizacion Q5_K_M; no hay otras variantes disponibles en este espejo.
- Al ser un espejo, cualquier correccion o actualizacion debe tomarse de la fuente original (bartowski); en caso de divergencia, la fuente prevalece.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin alineacion recae en el desplegador.
- Sin datos de benchmarks, no se puede comparar cuantitativamente su rendimiento con alternativas.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/TheShellMaster/cypher-Qwen2.5-Coder-7B-Instruct-abliterated
- Modelo raiz: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Abliteration: https://huggingface.co/huihui-ai/Qwen2.5-Coder-7B-Instruct-abliterated
- Cuantizacion GGUF fuente: https://huggingface.co/bartowski/Qwen2.5-Coder-7B-Instruct-abliterated-GGUF
