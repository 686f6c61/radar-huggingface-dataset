# susuel/whisper-small-tr-lora-v2

## Resumen

`susuel/whisper-small-tr-lora-v2` es un adaptador LoRA (PEFT) publicado en Hugging Face sobre el modelo base `openai/whisper-small`, el sistema de reconocimiento automático del habla (ASR) de OpenAI de aproximadamente 244 millones de parametros. Por el identificador del repositorio (`-tr-`), el adaptador esta orientado presumiblemente al idioma turco, aunque la model card no lo confirma de forma explicita y no incluye ninguna seccion completada.

El modelo resuelve el problema clasico de adaptar un ASR multilingue generico a un dominio o idioma concreto sin reentrenar los pesos completos: al tratarse de un adaptador LoRA, solo se almacenan las matrices de bajo rango, lo que reduce drasticamente el coste de almacenamiento y de ajuste fino. El repositorio, sin embargo, tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y su model card es la plantilla por defecto de Hugging Face sin rellenar.

La relevancia de esta ficha es, por tanto, limitada y de caracter documental: sirve para dejar constancia de que existe un adaptador PEFT sobre Whisper small supuestamente orientado al turco, pero no hay informacion tecnica publicada que permita evaluar su calidad, sus datos de entrenamiento ni su rendimiento. Cualquier uso en produccion requeriria validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer encoder-decoder de Whisper (modelo base `openai/whisper-small`) |
| Parametros totales | No disponible para el adaptador; el modelo base `whisper-small` tiene aproximadamente 244 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (Whisper procesa audio en ventanas de 30 segundos; el modelo base acepta hasta 1500 posiciones de encoder para mel-spectrograms de 30 s) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite fp16, int8 e int4 via llama.cpp/transformers, pero no hay documentacion al respecto en este repositorio |
| Idiomas soportados | No disponible de forma explicita; el sufijo `-tr-` sugiere turco, sin confirmacion en la model card |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `openai/whisper-small`, un transformer encoder-decoder con atencion estandar (no lineal, no SSM) disenado para ASR. Whisper procesa audio convertido a mel-spectrograms de 80 canales en ventanas de 30 segundos y genera texto de forma autorregresiva. El adaptador LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, reduciendo el numero de parametros entrenables en varios ordenes de magnitud.

No hay informacion publicada sobre los datos de entrenamiento: ni el numero de horas de audio, ni la composicion del dataset, ni si hubo aumentacion de datos, ni hiperparametros de entrenamiento (rango LoRA, alpha, learning rate, epochs). Tampoco se documenta si se aplico RLHF, DPO o alguna tecnica de decodificacion especulativa. La unica referencia tecnica disponible es la version de PEFT utilizada durante el guardado (0.13.2), que figura en la seccion de framework versions de la model card.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), heredado del modelo base Whisper small.
- Traduccion de voz a texto potencialmente, si el adaptador preserva las capacidades multilingues del modelo base (no confirmado).
- Deteccion de idioma y transcripcion multilingue, en funcion de como se haya entrenado el adaptador (no documentado).
- No hay evidencia de soporte de tool calling, function calling ni comportamiento agentico: Whisper es un modelo ASR puro, no un LLM conversacional.
- No hay soporte documentado de vision, audio generativo ni modos de razonamiento extendido (thinking mode).
- Capacidad multilingue: no disponible; el sufijo del repositorio apunta a turco, pero no se especifica si el adaptador degrada el resto de idiomas.

## Casos de uso

- Transcripcion de audio en turco: el adaptador podria emplearse para transcribir reuniones, entrevistas o notas de voz en turco, aprovechando el ajuste fino sobre el modelo base. Requiere validacion empirica previa, dado que no hay metricas publicadas.
- Subtitulado automatico de contenido audiovisual en turco: integrado en un pipeline con `transformers` y `peft`, podria generar subtitulos para videos, aunque la calidad real es desconocida.
- Prototipado de asistentes de voz en turco: util como componente ASR en un sistema de voz a texto dentro de un asistente conversacional, siempre que se valide el WER en el dominio objetivo.
- Investigacion sobre adaptacion eficiente de ASR: el repositorio sirve como ejemplo de como aplicar LoRA a Whisper small para un idioma de bajos recursos, aunque la falta de documentacion limita su valor como referencia reproducible.
- Transcripcion de llamadas de atencion al cliente en turco: potencial uso en analitica de contact center, con la advertencia de que no hay evidencia de robustez ante ruido, acentos o audio telefonico de 8 kHz.
- Experimentacion academica con PEFT: el adaptador puede cargarse con `peft` y `transformers` para comparar tecnicas de ajuste fino, aunque sin datos de entrenamiento publicados la comparacion sera dificil de interpretar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de pequeno tamano (el repositorio ocupa 0.0 GB, lo que sugiere pocos MB), pero requiere cargar el modelo base `whisper-small` (~244 M parametros). En fp16, el modelo base ocupa aproximadamente 0.5 GB; en fp32, alrededor de 1 GB. La VRAM total realista, incluyendo activaciones y buffers de audio, se situa en torno a 1-2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Tambien puede ejecutarse en CPU para transcripcion por lotes, aunque con mayor latencia.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` es la via natural para cargar el adaptador. Tambien puede fusionarse con el modelo base (`merge_and_unload`) y exportarse a otros formatos. `llama.cpp` y `Ollama` no soportan Whisper de forma nativa en todas sus versiones; para ASR conviene usar `faster-whisper` o `whisper.cpp` tras la fusion, aunque la conversion del adaptador no esta documentada.
- Latencia y throughput: no disponibles. Dependen del hardware, del backend y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma objetivo | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `susuel/whisper-small-tr-lora-v2` | Adaptador LoRA sobre ~244 M | Turco (presunto, no confirmado) | Ventanas de 30 s | No disponible | Hugging Face, 0 descargas |
| `openai/whisper-small` | ~244 M | Multilingue (99 idiomas) | Ventanas de 30 s | MIT (modelo base) | Hugging Face, ampliamente usado |
| `therealbee/whisper-small-ha-lora-v2` | Adaptador LoRA sobre ~244 M | Hausa (presunto por el sufijo) | Ventanas de 30 s | No disponible | Hugging Face |

La comparativa es limitada: no hay datos de rendimiento del adaptador que permitan contrastarlo con alternativas. El modelo base `openai/whisper-small` es la referencia natural, y el adaptador de Hausa (`therealbee/whisper-small-ha-lora-v2`) es el ejemplo mas cercano en estructura, aunque orientado a otro idioma.

## Limitaciones y advertencias

- Model card practicamente vacia: todas las secciones relevantes (datos de entrenamiento, evaluacion, sesgos, uso previsto) contienen el marcador `[More Information Needed]`.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. El modelo base Whisper es MIT, pero la licencia del adaptador es independiente y no esta declarada.
- Idioma no confirmado: el sufijo `-tr-` sugiere turco, pero no hay documentacion que lo verifique ni que indique el nivel de degradacion en otros idiomas.
- Sin metricas de calidad: no hay WER, CER ni ninguna otra medida publicada, por lo que no se puede evaluar si el adaptador mejora o empeora respecto al modelo base.
- Riesgo de alucinacion: Whisper es conocido por generar texto plausible en silencios o audio ruidoso; sin validacion especifica, este riesgo persiste.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que haya sido validado por terceros.
- Sin informacion sobre sesgos: no se documentan sesgos de acento, genero, edad ni calidad del audio.
- Advertencia de produccion: no deberia desplegarse en un sistema real sin una evaluacion propia sobre el dominio objetivo (tipo de audio, ruido, acentos, duracion de las muestras).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/susuel/whisper-small-tr-lora-v2
- Modelo base: https://huggingface.co/openai/whisper-small
- Adaptador similar en estructura (Hausa): https://huggingface.co/therealbee/whisper-small-ha-lora-v2
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
