# waveper/WavePerGPT

## Resumen

WavePerGPT es un modelo de lenguaje de 5,75 millones de parametros publicado por el usuario waveper en Hugging Face bajo licencia MIT. Segun su propia model card, se trata de un experimento entrenado "por diversión" sobre los mensajes de Discord del autor, y el propio creador lo describe como "blazingly Fast and Stupid". No es un modelo orientado a producción ni a tareas reales: es una curiosidad técnica de tamano minusculo.

El modelo se distribuye en formato GGUF, lo que sugiere que fue preparado para su ejecución en herramientas de inferencia locales como llama.cpp u Ollama. Con apenas 5,75 millones de parametros, es varios ordenes de magnitud mas pequeno que cualquier LLM convencional, y su calidad de generacion es, por admision explicita del autor, incoherente ("gibberish++").

Su relevancia es practicamente nula para desarrolladores e investigadores que buscan un modelo funcional. Se incluye esta ficha por completitud del catalogo, pero debe quedar claro que no hay datos tecnicos publicados sobre arquitectura, contexto, entrenamiento o rendimiento, y que el propio autor reconoce fallos recurrentes al ejecutarlo en Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 5.752.320 (5,75 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 128 tokens (segun la model card) |
| Tipos de cuantizacion | no disponible (se distribuye en GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tags del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo mas alla del recuento de parametros (5.752.320). No hay datos sobre tipo de transformer, numero de capas, dimensiones ocultas, mecanismo de atencion ni tokenizador. La model card no incluye ninguna especificacion tecnica.

Respecto al entrenamiento, el autor indica unicamente que fue entrenado con sus mensajes de Discord "por diversión". No se especifica el numero de tokens, la composicion del dataset, si hubo ajuste fino supervisado, RLHF, DPO ni ninguna otra etapa. Tampoco se documenta el proceso de conversion a GGUF ni la version de llama.cpp utilizada.

## Capacidades

- Generacion de texto muy limitada: el propio autor la describe como "gibberish++" (incoherente).
- Ventana de contexto de 128 tokens, que segun el autor el modelo agota sin producir una respuesta util.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.
- Segun la model card, el modelo "no puede escribir con normalidad" y no admite respuestas coherentes por parte del usuario.

## Casos de uso

- Experimentacion educativa sobre modelos de lenguaje minimos: util para observar como se comporta un modelo de 5,75 M de parametros en herramientas como llama.cpp u Ollama, sin expectativas de calidad.
- Pruebas de integracion de pipelines GGUF: sirve como artefacto de tamano ridiculo para validar que un flujo de carga y ejecucion de modelos GGUF funciona de extremo a extremo.
- Demostraciones de limitaciones de los LLM: puede emplearse en charlas o docencia para ilustrar por que el tamano y la calidad de los datos de entrenamiento importan.
- Pruebas de manejo de errores en servidores de inferencia: dado que el autor documenta un fallo recurrente en Ollama (formato `peg-native` no esperado), puede usarse para probar la robustez de capas de gestion de errores.
- Reproduccion de experimentos de fine-tuning casero: como ejemplo de modelo entrenado con un corpus personal (mensajes de Discord) y publicado en abierto.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo ni analisis de datos, dada la calidad declarada por el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K ni otras), y el autor no reporta evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion razonable, dado que el modelo tiene 5,75 M de parametros (unos 11,5 MB en FP16 y menos en cuantizaciones de 4-8 bits).
- GPU recomendadas: cualquier GPU, incluida una iGPU o incluso CPU, es suficiente; no se requiere acelerador dedicado.
- Cabe en cualquier GPU de consumo, desde modelos integrados hasta RTX 4090; tambien en Raspberry Pi y dispositivos similares.
- Opciones de despliegue: llama.cpp y Ollama son las opciones coherentes con el formato GGUF distribuido; vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles. El autor lo describe como "blazingly Fast", pero no aporta mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de tamano similar (unos 5,75 M de parametros) con los que establecer una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Calidad de generacion declarada como incoherente por el propio autor ("gibberish++"); no produce texto util.
- Ventana de contexto de solo 128 tokens, insuficiente para cualquier tarea conversacional o de documento.
- Error documentado al ejecutarse en Ollama: `llama-server chat error: map[code:500 message:The model produced output that does not match the expected peg-native format type:server_error]`. El autor no confirma si ocurre en todas las maquinas ni ofrece solucion.
- Sin documentacion sobre sesgos, datos de entrenamiento ni composicion del corpus (mensajes de Discord personales), por lo que no es posible evaluar riesgos de sesgo.
- Riesgo de alucinacion total: al ser un modelo de 5,75 M de parametros entrenado con un corpus personal, la salida no tiene base factual verificable.
- Licencia MIT: permite uso comercial y modificacion, pero ello no implica idoneidad tecnica para produccion.
- El autor no garantiza mantenimiento ni correccion de los fallos ("Will I ever fix those broken stuff? The answer is... Maybe").
- No debe desplegarse en entornos donde se espere una respuesta fiable, legalmente sensible o reproducible.

## Enlaces

- Hugging Face: https://huggingface.co/waveper/WavePerGPT
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repositorios o demos) asociados al modelo.
