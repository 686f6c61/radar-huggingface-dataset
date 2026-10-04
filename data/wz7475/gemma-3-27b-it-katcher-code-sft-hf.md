# wz7475/gemma-3-27b-it-katcher-code-sft-hf

## Resumen

`wz7475/gemma-3-27b-it-katcher-code-sft-hf` es un repositorio de pesos publicado en HuggingFace por el usuario `wz7475` el 3 de octubre de 2026. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, y su tamano de repositorio es de tan solo 0,9 GB. El identificador sugiere un ajuste fino supervisado (SFT) orientado a codigo sobre Gemma 3 27B IT, el modelo multimodal abierto de Google DeepMind, pero la model card no confirma ni el modelo base, ni el dataset, ni el procedimiento de entrenamiento empleado.

La model card es la plantilla autogenerada por HuggingFace sin editar: todas las secciones relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluacion, impacto ambiental) figuran literalmente como "[More Information Needed]". El unico tag con contenido informativo es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono citado en la plantilla, no a un paper sobre este modelo.

El dato tecnico mas relevante es la discrepancia de tamano: 0,9 GB es incompatible con los pesos completos de un modelo denso de 27.000 millones de parametros (unos 54 GB en bf16). Esto apunta a un adaptador LoRA, a una conversion parcial, a un repositorio truncado o a un push incompleto, y no puede resolverse con la informacion disponible. En consecuencia, esta ficha se limita a lo verificable en los metadatos y marca como "no disponible" todo lo que el autor no ha publicado; no se recomienda su uso en produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el identificador apunta a un transformer decoder-only (familia Gemma 3), sin confirmar |
| Parametros totales | no disponible; 27.000 millones si se confirma Gemma 3 27B como modelo base |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; 128.000 tokens en el modelo base Gemma 3 27B segun su documentacion oficial |
| Tipos de cuantizacion | no disponible; el repositorio no incluye pesos GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card no la declara |
| Formato de pesos | safetensors (segun los tags del repositorio) |
| Tamano del repositorio | 0,9 GB |
| Libreria declarada | transformers |
| Pipeline declarado | no disponible |
| Compatibilidad declarada | endpoints_compatible |
| Fecha de creacion | 3 de octubre de 2026 |
| Ultima actualizacion | 3 de octubre de 2026 (32 segundos despues de la creacion) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura ni sobre el entrenamiento de este repositorio. La model card no documenta el modelo base, el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por preferencias. El unico indicio es el propio identificador `gemma-3-27b-it-katcher-code-sft-hf`, que sugiere un fine-tuning supervisado (SFT) sobre Gemma 3 27B IT con un corpus de codigo asociado al termino "katcher". Ni el termino "katcher" ni el dataset subyacente aparecen documentados en el repositorio ni en los resultados de busqueda consultados.

La actualizacion del repositorio 32 segundos despues de su creacion y el tamano de 0,9 GB refuerzan la hipotesis de un artefacto incompleto o de un adaptador de bajo rango subido sin fusionar. En cualquier caso, se trata de una inferencia a partir de metadatos, no de un dato confirmado por el autor. Tampoco hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante u otras), hiperparametros de entrenamiento, regimen de precision (fp32, bf16, fp8) ni infraestructura de computo utilizada.

## Capacidades

No se ha publicado ninguna descripcion funcional del modelo. Lo unico que puede afirmarse con la informacion disponible es lo siguiente:

- Generacion de codigo: es la capacidad que sugiere el identificador (`code-sft`), pero no esta verificada por el autor ni respaldada por evaluaciones.
- Generacion de texto y razonamiento: no disponible; dependeria del modelo base, que no se confirma.
- Vision: no disponible; Gemma 3 27B es multimodal (texto e imagen), pero no hay confirmacion de que este ajuste conserve el encoder visual.
- Tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

Los siguientes escenarios son hipoteticos y se derivan unicamente del identificador del repositorio. Cualquier uso real exige validar primero que el checkpoint carga correctamente, que los pesos estan completos y que el rendimiento es aceptable. No deben tomarse como casos de uso confirmados por el autor.

- Asistente de autocompletado en el IDE: si el ajuste SFT esta orientado a codigo, el modelo podria integrarse en extensiones tipo Continue o Copilot alternativo para sugerir fragmentos en linea; el contexto largo del modelo base (hasta 128.000 tokens) permitiria incluir varios ficheros del proyecto como contexto, siempre que el checkpoint lo conserve.
- Revision de pull requests: clasificacion y comentario automatico de diffs en un pipeline de CI/CD, aprovechando la ventana de contexto para analizar el cambio junto con el resto del modulo afectado.
- Migracion de codigo entre lenguajes o frameworks: reescritura de modulos completos (por ejemplo, de Python 2 a Python 3 o de una libreria a otra), tarea en la que un modelo de 27.000 millones de parametros afinado en codigo puede mantener coherencia a nivel de fichero.
- Generacion de tests unitarios: produccion de baterias de pruebas a partir de funciones o clases existentes, encajable en un pre-commit hook o en una tarea programada del repositorio.
- Documentacion tecnica automatica: generacion de docstrings, ficheros README y comentarios de API a partir del codigo fuente, con salida en formato Markdown o reStructuredText.
- Explicacion de codigo heredado: resumen en lenguaje natural de modulos sin documentar, util en procesos de onboarding o de auditoria de deuda tecnica.
- Soporte a desarrollo en local: si finalmente se publican pesos cuantizados a 4 bits, el modelo podria ejecutarse en una GPU de consumo (RTX 4090 de 24 GB) mediante llama.cpp u Ollama, permitiendo uso sin conexion y sin enviar codigo propietario a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada, no hay resultados de MMLU, HumanEval, MBPP, GSM8K, LiveCodeBench ni de ninguna otra prueba, y los resultados de busqueda web consultados no guardan relacion con este repositorio.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingenieria basadas en un modelo denso de 27.000 millones de parametros, no en mediciones de este repositorio concreto. Dado que el repositorio ocupa 0,9 GB, es probable que no contenga pesos utilizables directamente y que sea necesario fusionar un adaptador con el modelo base antes de poder ejecutar inferencia.

- VRAM para pesos en bf16 (27B): aproximadamente 54 GB solo en pesos; con cache KV y activaciones, entre 60 y 70 GB para contextos moderados.
- VRAM en int8: aproximadamente 28-30 GB.
- VRAM en int4 (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 15-17 GB, lo que permite ejecucion en una RTX 4090 (24 GB) o RTX 5090 (32 GB) con contexto limitado.
- Cache KV: con una ventana de 128.000 tokens la cache KV crece de forma muy significativa; en despliegues largos conviene cuantizarla o reducir la longitud de contexto efectiva.
- GPU recomendadas: A100 80 GB, H100 80 GB o 2x A6000 48 GB para precision completa o int8; RTX 4090, RTX 5090 o L40S para versiones cuantizadas a 4 bits.
- GPU de consumo: cabe en tarjetas de 24 GB o mas unicamente con cuantizacion de 4 bits; por debajo de 16 GB de VRAM no es viable sin offloading a CPU, con la consiguiente perdida de velocidad.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors en precision completa o cuantizada compatible; llama.cpp y Ollama si se generan pesos GGUF; transformers como via directa si el artefacto es un adaptador.
- Latencia y throughput: no disponible. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentacion publica de cada modelo y no han sido verificados en este repositorio. La comparacion es orientativa porque de este modelo no se conoce ni siquiera el numero de parametros real.

| Modelo | Parametros | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| wz7475/gemma-3-27b-it-katcher-code-sft-hf | no disponible | no disponible | no disponible | no disponible |
| Gemma 3 27B IT (modelo base probable) | 27.000 millones | 128.000 tokens | texto e imagen | terminos de uso de Gemma |
| Qwen2.5-Coder-32B-Instruct | 32.500 millones | 131.072 tokens | texto | Apache 2.0 |
| Codestral 22B (v0.1) | 22.000 millones | 32.768 tokens | texto | licencia de no produccion de Mistral AI |

Frente a estas alternativas, la diferencia determinante no es de capacidad tecnica sino de trazabilidad: Qwen2.5-Coder-32B-Instruct y Codestral 22B cuentan con model cards completas, licencia explicita y evaluaciones publicadas, mientras que de este repositorio se desconoce todo lo esencial.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin ninguna seccion cumplimentada por el autor.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial, y ademas se desconoce si el ajuste respeta los terminos de uso del modelo base Gemma.
- Tamano de repositorio anomalo: 0,9 GB es incompatible con un modelo de 27.000 millones de parametros; el artefacto puede ser un adaptador, un push incompleto o un fichero corrupto. Verificar la integridad antes de cualquier uso.
- Modelo base no confirmado: toda inferencia sobre arquitectura, contexto, idiomas o capacidades parte del nombre del repositorio, no de una declaracion del autor.
- Procedencia del entrenamiento desconocida: no se documenta el dataset, por lo que no puede evaluarse si contiene codigo con licencias restrictivas, datos personales o material con derechos de autor.
- Riesgo de alucinacion: no evaluado. En modelos de codigo, la alucinacion se manifiesta como APIs inexistentes, dependencias inventadas o firmas de funcion incorrectas.
- Idiomas: no disponible. No puede confirmarse soporte de castellano ni de ningun otro idioma, ni la calidad del mismo tras el ajuste.
- Sin evaluaciones de seguridad: no hay informacion sobre sesgos, filtros de contenido ni alineacion.
- Sin mantenimiento demostrable: 0 descargas, 0 likes y un unico commit aparente; no hay evidencia de que el autor vaya a actualizar o dar soporte al repositorio.
- Recomendacion: no desplegar en produccion ni en entornos con datos sensibles sin una validacion independiente de pesos, licencia y calidad de salida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wz7475/gemma-3-27b-it-katcher-code-sft-hf
- Referencia del modelo base probable, Gemma 3 27B IT (no procede de la busqueda web realizada): https://huggingface.co/google/gemma-3-27b-it
- Terminos de uso de Gemma (aplicables al modelo base): https://ai.google.dev/gemma/terms
- Articulo citado en la plantilla de la model card, Lacoste et al. (2019), sobre estimacion de emisiones: https://arxiv.org/abs/1910.09700
- Calculadora de impacto usada en la plantilla: https://ml2co.github.io/impact

Nota sobre la busqueda web: las consultas realizadas devolvieron exclusivamente resultados sobre el randomizador multijugador Archipelago aplicado al videojuego Digimon World (multiworld.gg, github.com/ArsonAssassin/DWAP, archipelago.gg, archipelago.miraheze.org). Ninguno de ellos guarda relacion con el modelo descrito, por lo que no se incluyen como referencias validas.
