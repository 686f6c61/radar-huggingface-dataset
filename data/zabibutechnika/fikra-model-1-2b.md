# zabibutechnika/Fikra-Model-1-2B

## Resumen

Fikra Model 1 2B es un ajuste fino (fine-tune) del modelo Gemma 4 E2B IT distribuido por Unsloth, desarrollado por Zabibu Technika, un proyecto con base en Africa Oriental. Se presenta como un modelo orientado al razonamiento y a la ejecucion de tareas ("action-oriented cognitive extraction") en lugar de la conversacion verbosa, con enfasis en contextos panafricanos, agilidad de negocio y code-switching entre dialectos. El modelo se distribuye con pipeline image-text-to-text, lo que indica que conserva la torre de vision del modelo base Gemma 4.

A pesar de la denominacion "2B" en el nombre comercial, los pesos reales en safetensors suman 5.123.178.051 parametros (aproximadamente 5,1 mil millones), coherente con la arquitectura multimodal Gemma 4 E2B, que combina un modelo de lenguaje con un encoder de vision. El repositorio ocupa 24,1 GB e incluye pesos en safetensors y GGUF, ademas de estar etiquetado para text-generation-inference y transformers.

La relevancia del modelo radica en su propuesta de despliegue local y privado en hardware de consumo o edge, con soporte declarado para ingles y suajili, y una licencia propia (zabibu-technika-license) que restringe el uso. Es un proyecto de autor unico con adopcion muy baja (31 descargas, 4 likes en el momento de la consulta), por lo que debe evaluarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 E2B IT (image-text-to-text) |
| Parametros totales | 5.123.178.051 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (quants de la comunidad por mradermacher); cuantizaciones adicionales no disponibles |
| Idiomas soportados | en (ingles), sw (suajili) |
| Licencia | zabibu-technika-license (license: other) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, un checkpoint de Gemma 4 E2B IT cuantizado en 4 bits y preparado por Unsloth para entrenamiento eficiente. La arquitectura subyacente es la de Gemma 4 E2B, un modelo multimodal que procesa imagen y texto, con una torre de vision acoplada a un decoder de lenguaje. El autor no documenta cambios estructurales sobre la arquitectura base, por lo que se trata de un ajuste fino supervisado sobre el checkpoint original.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, lo que acelera el proceso aproximadamente 2x. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un "fine-tuned dataset" orientado a seguimiento determinista de instrucciones, con parametros de inferencia recomendados (temperature 0.15-0.2, repetition penalty 1.15, top_p 0.95) para evitar derivas hacia los pesos de preentrenamiento. El formato de chat obligatorio es ChatML con `<|im_start|>` y `<|im_end|>`, y el autor exige un system prompt especifico para mantener la identidad del modelo.

## Capacidades

- Generacion de texto y razonamiento: el modelo esta etiquetado con `reasoning` y `thinking`, y el autor lo describe como optimizado para extraccion cognitiva y ejecucion de tareas.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, por herencia de Gemma 4 E2B.
- Soporte de tool calling y function calling: no documentado en la model card; no disponible.
- Soporte de agentes y razonamiento multi-paso: etiquetado como `agentic`, aunque sin detalles tecnicos sobre el entrenamiento agentico.
- Capacidades multilingues: ingles y suajili, con enfasis en code-switching entre ambos.
- Modo thinking: etiqueta presente, sin especificacion de formato de tokens de razonamiento.
- Conversacion multi-turno: soportada mediante el formato ChatML indicado por el autor.

## Casos de uso

- Atencion al cliente en suajili e ingles: el modelo puede gestionar conversaciones multi-turno con code-switching, adecuado para negocios de Africa Oriental que atienden a usuarios bilingues. La ventana de contexto no esta documentada, por lo que conviene validar la longitud efectiva antes de desplegar.
- Despliegue en edge y dispositivos moviles: con aproximadamente 5,1 mil millones de parametros y variantes GGUF, puede ejecutarse en equipos de consumo mediante llama.cpp u Ollama, lo que permite inteligencia local sin dependencia de APIs externas.
- Asistentes privados offline: el autor lo posiciona para redes locales y entornos con requisitos de soberania de datos, donde no se permite enviar informacion a servicios en la nube.
- Procesamiento de documentos con imagen: al conservar la torre de vision de Gemma 4, puede extraer texto o interpretar capturas y formularios en flujos de digitalizacion.
- Automatizacion de tareas deterministas: con temperature baja (0.15-0.2) y un system prompt fijo, es adecuado para clasificacion, extraccion de entidades y respuestas estructuradas en pipelines internos.
- Prototipado de agentes locales: la etiqueta `agentic` y el soporte de ChatML permiten integrarlo en frameworks de agentes que ejecuten herramientas en local, aunque la ausencia de documentacion sobre tool calling exige pruebas previas.
- Educacion y soporte linguistico: util para generar material bilingue suajili-ingles y para experimentos de procesamiento de lenguaje en lenguas africanas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (5,1 mil millones de parametros), en FP16 requeriria aproximadamente 10-11 GB; en cuantizacion de 4 bits, alrededor de 3-4 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no especificadas. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permitirian inferencia holgada en FP16; GPUs consumer de 8-12 GB podrian ejecutar variantes GGUF cuantizadas.
- Compatibilidad con GPU de consumo: probable mediante GGUF de mradermacher, sin confirmacion oficial de latencias.
- Opciones de despliegue: Ollama, llama.cpp, vLLM y LM Studio, segun la propia model card; tambien transformers y text-generation-inference por las etiquetas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fikra Model 1 2B | 5,12 mil millones (safetensors) | no disponible | en, sw | zabibu-technika-license | Hugging Face, GGUF comunitario |
| Gemma 4 E2B IT (base) | no disponible en la informacion | no disponible | multilingue (segun Gemma) | Gemma license | Hugging Face, Unsloth |
| Alternativas de ~2-5B con soporte de suajili | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un fine-tune sobre Gemma 4, puede heredar sesgos del corpus base, y el enfasis en contextos panafricanos no garantiza neutralidad.
- Riesgo de alucinacion: el autor advierte que el modelo puede "derivar hacia los pesos de preentrenamiento" si no se usan los parametros recomendados, lo que sugiere inestabilidad en la adherencia a instrucciones.
- Limitaciones de contexto e idioma: solo se declaran ingles y suajili; el rendimiento en castellano u otras lenguas no esta garantizado. La longitud de contexto no esta documentada.
- Restricciones de licencia: la zabibu-technika-license es una licencia propia no estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que el autor no detalla permisos ni restricciones en la model card.
- Caveats para produccion: proyecto de autor unico, con 31 descargas y 4 likes, sin benchmarks publicados ni documentacion de tool calling; el formato de chat ChatML y el system prompt son obligatorios para un funcionamiento correcto.
- Dependencia del checkpoint base: al derivar de una cuantizacion de 4 bits de Unsloth, la calidad final puede verse afectada por la precision del checkpoint de partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zabibutechnika/Fikra-Model-1-2B
- Modelo base: https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit
- Quants de la comunidad (mradermacher): https://huggingface.co/mradermacher/Zabibu-Fikra-2B-GGUF
- Informe de cuantizacion: https://hf.tst.eu/model#Zabibu-Fikra-2B-GGUF
- Unsloth (repositorio): https://github.com/unslothai/unsloth
