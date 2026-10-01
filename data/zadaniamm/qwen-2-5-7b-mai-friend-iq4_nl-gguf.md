# zadaniamm/qwen-2.5-7b-mai-friend-IQ4_NL-GGUF

## Resumen

`zadaniamm/qwen-2.5-7b-mai-friend-IQ4_NL-GGUF` es una version cuantizada en formato GGUF de un ajuste fino de Qwen2.5-7B realizado por el usuario zadaniamm y publicado bajo licencia MIT. El modelo resultante de la cadena de trabajo (`qwen-2.5-7b-mai-friend-merged-bf16`) se convirtio a GGUF mediante el espacio GGUF-my-repo de ggml.ai y se comprimio con la cuantizacion IQ4_NL calibrada con matrices de importancia (imatrix), lo que reduce el peso a aproximadamente 4,4 GB conservando parte de la coherencia de las capas de atencion.

Se trata de un transformer decoder-only denso de 7.615.616.512 parametros (sin parametros activos, al no ser una arquitectura MoE), derivado de la familia Qwen2.5, que fue preentrenada con hasta 18 billones de tokens segun el informe tecnico de Qwen2.5. El ajuste propio se hizo con QLoRA sobre un conjunto de datos sintetico, segun indican las etiquetas del repositorio, y el modelo se declara exclusivamente para el idioma indonesio (`id`), lo que sugiere un uso conversacional o de acompanamiento en ese idioma, coherente con el nombre "mai-friend".

Su relevancia practica es acotada pero clara: es un artefacto de cuantizacion listo para ejecutarse en hardware de consumo con llama.cpp, con muy pocas descargas y sin benchmarks publicados. Resulta util como ejemplo de pipeline QLoRA -> merge -> GGUF o para experimentar con inferencia local en indonesio, pero carece de evaluaciones verificables que respalden su calidad frente al Qwen2.5-7B-Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens nativos en el modelo base Qwen2.5; ampliable a 131 072 con YaRN. No verificado especificamente para este ajuste fino |
| Tipos de cuantizacion | IQ4_NL con importance matrix (imatrix); el repositorio base esta en bf16 |
| Idiomas soportados | Indonesio (`id`) declarado; el modelo base Qwen2.5 es multilingue, pero este ajuste solo declara `id` |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base del que deriva esta en safetensors/bf16 |

## Arquitectura y entrenamiento

La base es la arquitectura Qwen2.5-7B: un transformer decoder-only denso con 28 capas, atencion con query grouping (GQA), normalizacion RMSNorm, activacion SwiGLU, RoPE y sesgo en las proyecciones QKV. El modelo original se preentreno con hasta 18 billones de tokens segun el informe tecnico de Qwen2.5 y se ajusto posteriormente con instrucciones. Sobre esa base, el autor aplico un ajuste QLoRA (adaptadores de bajo rango con cuantizacion de 4 bits) y despues fusiono los adaptadores en un checkpoint bf16, lo que dio lugar a `qwen-2.5-7b-mai-friend-merged-bf16`.

El unico detalle documentado del proceso de cuantizacion es el uso de IQ4_NL con importance matrix. El calculo de las matrices de importancia se calibro con `wiki.train.raw`, la particion de entrenamiento de WikiText-103 (articulos destacados de Wikipedia en ingles), con el objetivo declarado de preservar la logica de las capas de atencion pese a la compresion a 4 bits. No se especifican el numero de tokens de entrenamiento del ajuste, la composicion del dataset sintetico, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias mas alla del pipeline de cuantizacion.

## Capacidades

- Generacion de texto conversacional en indonesio, que es el unico idioma declarado en la model card.
- Razonamiento y generacion de codigo heredados del modelo base Qwen2.5-7B, aunque no hay evaluaciones que cuantifiquen cuanto se conserva tras el ajuste y la cuantizacion a 4 bits.
- Capacidad multilingue potencial por herencia del modelo base Qwen2.5, no declarada ni validada por el autor.
- Soporte de tool calling y function calling: no disponible; la model card no lo menciona ni aporta plantilla de chat propia.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision, audio u otras modalidades: no disponible.
- Ejecucion local mediante llama.cpp en CPU y GPU, con los comandos de `llama-cli` y `llama-server` incluidos en la model card.

## Casos de uso

- Asistente conversacional en indonesio para uso personal: el modelo se puede desplegar con `llama-server` y una ventana de 2048 tokens, tal como sugiere el ejemplo de la model card, para mantener dialogos de acompanamiento en ese idioma.
- Experimentacion con pipelines de ajuste fino: sirve como caso de estudio reproducible de la secuencia QLoRA, merge a bf16 y conversion a GGUF con cuantizacion IQ4_NL.
- Pruebas de inferencia local en hardware modesto: al ocupar unos 4,4 GB en disco, permite validar integraciones con llama.cpp, Ollama o LM Studio sin necesidad de GPU de gama alta.
- Evaluacion comparativa de metodos de cuantizacion: util para medir la degradacion de un modelo de 7B al pasar de bf16 a IQ4_NL con imatrix en tareas de generacion en indonesio.
- Generacion de texto de bajo coste en entornos sin conectividad: al ejecutarse en local, encaja en escenarios con requisitos de privacidad o sin acceso a APIs externas.
- Base para nuevos ajustes especificos del dominio en indonesio: al estar bajo licencia MIT y en formato GGUF, se puede usar como punto de partida o como referencia para comparar con otros ajustes de Qwen2.5-7B.
- Docencia y demostraciones de cuantizacion: el repositorio incluye los comandos exactos de compilacion e invocacion de llama.cpp, lo que facilita usarlo como ejemplo en talleres tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y tampoco se han encontrado evaluaciones independientes en los resultados de busqueda. Cualquier cifra de rendimiento atribuida a este ajuste concreto seria una extrapolacion no verificada.

## Requisitos de hardware

- Peso en disco de los pesos cuantizados: aproximadamente 4,4 GB (tamano del repositorio).
- VRAM estimada para inferencia: en torno a 5,5-6,5 GB con contexto de 2048 tokens, sumando pesos y cache KV; alrededor de 6,5-7,5 GB con contexto de 8192 tokens. Estas cifras son orientativas y no estan publicadas por el autor.
- GPU consumer compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 3080/3090 y RTX 4090, entre otras; cabe con holgura en cualquier GPU con 8 GB o mas de VRAM si se limita el contexto.
- GPU de centro de datos: A100, H100 y similares son compatibles pero sobredimensionadas para un modelo de 7B en 4 bits; tienen sentido solo para servir muchas peticiones concurrentes.
- Memoria unificada en Apple Silicon: funciona en equipos con 8 GB, y resulta comodo a partir de 16 GB.
- Ejecucion en CPU: viable con llama.cpp, aunque no hay datos publicados de latencia ni de throughput para este checkpoint.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama, LM Studio, Jan y text-generation-webui. El soporte de GGUF en vLLM es experimental y TGI no lo soporta de forma nativa, por lo que no son las rutas recomendadas.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen-2.5-7b-mai-friend-IQ4_NL-GGUF (este modelo) | 7,6B | 32 768 nativos en el base (YaRN hasta 131 072), no verificado en el ajuste | MIT | GGUF en HuggingFace, 0 descargas y 0 likes | Ajuste QLoRA en indonesio, sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | safetensors en HuggingFace, ampliamente adoptado | Modelo de referencia de la familia; su rendimiento no implica el de este ajuste |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32 768 | Apache 2.0 | safetensors y GGUF en HuggingFace | Alternativa densa de tamano similar, con ecosistema de cuantizaciones maduro |
| Llama-3.1-8B-Instruct | 8,0B | 131 072 | Llama 3.1 Community License | safetensors y GGUF en HuggingFace | Tamano ligeramente superior y contexto mayor, con licencia de comunidad en lugar de MIT |

Los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion de este repositorio. No hay benchmarks comparativos disponibles para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, pruebas de regresion ni comparaciones con el modelo base que permitan estimar la perdida de calidad por el ajuste QLoRA y la cuantizacion IQ4_NL.
- Cobertura idiomatica limitada: la model card declara unicamente indonesio; el uso en otros idiomas, incluido el castellano, no esta soportado ni validado.
- Riesgo de alucinacion: no cuantificado, y previsiblemente similar o superior al de Qwen2.5-7B-Instruct, dado que la cuantizacion a 4 bits puede degradar tareas de razonamiento y datos factuales.
- Calibracion en ingles: las matrices de importancia se calcularon con WikiText-103 en ingles, no con corpus en indonesio, lo que puede introducir un sesgo de calibracion respecto al idioma objetivo declarado.
- Trazabilidad incompleta: no se documentan el dataset sintetico empleado, el numero de tokens de entrenamiento, los hiperparametros de QLoRA ni si hubo alineacion posterior tipo RLHF o DPO.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas o validado el comportamiento.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni asume responsabilidad sobre sesgos o salidas incorrectas.
- Compatibilidad: al ser un GGUF, requiere llama.cpp o un runtime compatible; no se puede cargar directamente con Transformers ni desplegar de forma estandar en TGI.
- Plantilla de chat no documentada: no se especifica el formato de prompt, lo que puede degradar las respuestas si se usa una plantilla distinta a la del ajuste.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-IQ4_NL-GGUF
- Modelo base fusionado en bf16: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Qwen2.5-7B-Instruct en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio no oficial mx4ai/qwen2.5: https://github.com/mx4ai/qwen2.5
- Guia de ejecucion de Qwen 2.5 con Ollama: https://ai-ollama.github.io/qwen-2-5.html
