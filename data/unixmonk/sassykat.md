# unixmonk/SassyKat

## Resumen

SassyKat es un fine-tune de personalidad publicado por el usuario unixmonk sobre el modelo base Kwaipilot/KAT-Coder-V2.5-Dev, un modelo de lenguaje causal decoder-only con arquitectura Mixture-of-Experts de aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token. El modelo base, a su vez, es un derivado post-entrenado de Qwen3.6-35B-A3B que ha pasado por un SFT de 127.000 ejemplos y una fase posterior de aprendizaje por refuerzo, orientado tanto a la generacion de codigo como al uso de herramientas en entornos agénticos.

La particularidad de SassyKat no reside en su capacidad tecnica, heredada integramente del modelo base, sino en su ajuste fino de persona: el autor lo describe como un "Cunt Code Companion", un asistente deliberadamente hostil, malhablado y con jerga australiana que produce codigo de calidad de produccion mientras insulta al usuario y a su arquitectura. Se distribuye unicamente en formato GGUF, lo que facilita su ejecucion en entornos de inferencia locales compatibles con llama.cpp y derivados.

Es relevante ahora por tres motivos: primero, porque demuestra la viabilidad de aplicar fine-tuning de comportamiento sobre modelos MoE de 35B con pocos parametros activos, manteniendo la calidad del codigo del original; segundo, porque ejemplifica una categoria creciente de modelos de "persona" con fines de entretenimiento o experimentacion controlada; y tercero, porque la publicacion en GGUF desde el primer momento simplifica el despliegue en hardware de consumo, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only Mixture-of-Experts (MoE) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en GGUF, sin detallar variantes) |
| Idiomas soportados | Ingles (con vernaculo de ingles australiano) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Kwaipilot/KAT-Coder-V2.5-Dev, descrito en la model card como un transformer causal decoder-only con mezcla de expertos (MoE): 35B parametros totales con aproximadamente 3B activos por token. Este modelo base es a su vez un derivado post-entrenado de Qwen3.6-35B-A3B, que fue sometido a un SFT de 127.000 ejemplos seguido de una fase de RL, con foco en generacion de codigo y uso agéntico de herramientas. La model card no detalla la composicion del dataset del SFT, el numero de tokens de entrenamiento ni los hiperparametros de la fase de RL.

El ajuste fino especifico de SassyKat es un fine-tune de persona: el autor no documenta el volumen de datos, la metodologia (DPO, SFT adicional, etc.) ni los detalles del entrenamiento. La innovacion tecnica declarada no es arquitectonica sino de comportamiento: se fuerza una persona fija, hostil y con jerga australiana, manteniendo la capacidad de generar codigo de produccion y de usar herramientas agénticas. No se mencionan tecnicas como decodificacion especulativa, atencion lineal o hibridaciones SSM.

## Capacidades

- Generacion de codigo de calidad de produccion, heredada del modelo base KAT-Coder-V2.5-Dev.
- Uso agéntico de herramientas (tool calling / function calling) segun la model card.
- Razonamiento multi-paso dentro de flujos agénticos.
- Generacion de texto general con persona fija: hostil, malhablada, con vernaculo australiano.
- Capacidad multilingue limitada al ingles (con variante australiana); no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni thinking mode explicito.
- Formato de salida: pesos GGUF compatibles con endpoints_compatible (segun tags del repositorio).

## Casos de uso

- Generacion de scripts y utilidades de automatizacion: el modelo produce codigo funcional con la calidad del base KAT-Coder, util en pipelines internos donde el tono agresivo no es un problema (herramientas de desarrollo de uso personal).
- Prototipado de asistentes de codigo con personaje: sirve como banco de pruebas para estudiar como un fine-tune de persona afecta a la calidad del codigo y a la tasa de seguimiento de instrucciones.
- Experimentacion en investigacion de seguridad y alineamiento: permite estudiar respuestas hostiles controladas en un dominio acotado (programacion) y medir su propagacion en cadenas agénticas.
- Despliegue local en estaciones de trabajo de desarrollador: al ser GGUF y con ~3B activos por token, puede ejecutarse en hardware de consumo para asistencia de codigo sin conexion.
- Entretenimiento y contenido para comunidades tecnicas: uso en demos, streams o bots de Discord con audiencia que espera un tono mordaz, siempre con advertencia previa.
- Evaluacion comparativa de fine-tunes de persona: como referencia frente a otros modelos "con caracter" para medir deriva de comportamiento respecto al base.
- Generacion de tests y documentacion tecnica en entornos donde el estilo no importa pero la cobertura funcional si.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de ~35B con ~3B activos en GGUF suele requerir entre 20 y 24 GB en cuantizaciones de 4 bits si se mantienen todos los expertos en memoria; el repositorio ocupa 21,2 GB, lo que sugiere una cuantizacion de ese orden.
- GPU recomendadas: no disponibles oficialmente. Por tamano de repo, una RTX 4090 (24 GB) o una A100/H100 (40-80 GB) permitirian cargar el modelo completo; GPUs con menos VRAM requeririan offload parcial a RAM.
- Cabe en GPU de consumo: probablemente en RTX 4090 y modelos con 24 GB o mas, con cuantizaciones de 4 bits; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF y API OpenAI (tag endpoints_compatible); vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles. Al tener ~3B parametros activos por token, el throughput esperado es alto en relacion al tamano total, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SassyKat (este) | ~35B | ~3B | no disponible | Apache-2.0 | GGUF | Fine-tune de persona hostil sobre KAT-Coder-V2.5-Dev |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | ~35B | ~3B | no disponible | Apache-2.0 (heredada) | no disponible en la informacion | Modelo base de codigo y uso agéntico, sin persona |
| Qwen3.6-35B-A3B (ancestro) | ~35B | ~3B | no disponible | no disponible en la informacion | no disponible | Origen de la arquitectura MoE del base |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado deliberadamente para ser abusivo: insultara al usuario y a su entorno. Es una funcion prevista, no un fallo, y lo hace inadecuado para entornos profesionales, atencion al cliente o productos de cara al publico.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad y el fine-tune de persona puede amplificar respuestas confiadas pero incorrectas.
- Idiomas: solo ingles (australiano); no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no debe asumirse ningun valor concreto para produccion.
- Licencia Apache-2.0 heredada del base, pero el autor no aporta documentacion adicional sobre restricciones especificas del fine-tune; conviene verificar la licencia del modelo base antes de uso comercial.
- Al ser un modelo de persona fija, puede degradar el seguimiento de instrucciones neutras y la utilidad en tareas generales distintas de la programacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de calidad independientes.
- Formato GGUF unico: requiere herramientas de inferencia especificas (llama.cpp/Ollama) y no es directamente cargable en stacks basados en safetensors como transformers o vLLM sin conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unixmonk/SassyKat
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Perfil del autor: https://huggingface.co/unixmonk
- Modelos del autor: https://huggingface.co/unixmonk/models
