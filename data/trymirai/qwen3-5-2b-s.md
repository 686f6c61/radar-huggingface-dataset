# trymirai/Qwen3.5-2B-S

## Resumen

Mirai's Qwen3.5-2B Small Quantization (identificador `trymirai/Qwen3.5-2B-S`) es una cuantizacion de alta calidad del modelo base Qwen/Qwen3.5-2B, desarrollada por Mirai Labs. El checkpoint esta disenado especificamente para inferencia local eficiente en silicio de Apple (Apple silicon) mediante el runtime propietario `uzu` y la CLI `mirai`. No se trata de un modelo nuevo entrenado desde cero, sino de una version comprimida del modelo de Qwen que reduce drasticamente el peso en disco a cambio de una perdida de fidelidad medida y documentada.

La tecnica empleada es una cuantizacion con codificacion de trellis estilo QTIP a aproximadamente 2,5 bits por peso, con asignacion de bits por matriz guiada por ablaciones de divergencia KL, rotaciones aleatorias con estructura de Kronecker para mitigar valores atipicos y redondeo ponderado por un esbozo de Fisher de la distribucion de salida del propio modelo. El proceso combina cuantizacion post-entrenamiento con destilacion consciente de la cuantizacion de las escalas.

El resultado es un checkpoint de aproximadamente 580 millones de parametros efectivos (frente al modelo base de 2B) que ocupa unos 2,4 GB en el repositorio y alcanza un 78,33% de acuerdo top-1 con el profesor, con una divergencia KL de 0,2406042 sobre el conjunto de evaluacion por defecto de la herramienta `romakl`. Es relevante para desarrolladores que quieran ejecutar un derivado de Qwen3.5 en Macs sin depender de GPUs dedicadas, asumiendo las limitaciones de un runtime cerrado y una plataforma unica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.5-2B; no se detalla en la informacion disponible) |
| Parametros totales | 580.501.217 (segun safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ~2,5 bits por peso (QTIP-style trellis-coded), con bits por matriz elegidos por ablaciones KL; tags indican 2-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen/Qwen3.5-2B, un transformer del que no se detallan en la informacion disponible el numero de capas, dimensiones ocultas ni mecanismos de atencion. Sobre esa base, Mirai Labs aplica un pipeline de compresion: cuantizacion post-entrenamiento con codificacion de trellis estilo QTIP a ~2,5 bits por peso, seleccion de la profundidad de bits de cada matriz a partir de ablaciones de divergencia KL medidas, rotaciones aleatorias con estructura de Kronecker para reducir valores atipicos en los pesos y redondeo ponderado por un esbozo de Fisher de la distribucion de salida del modelo. Posteriormente se realiza una destilacion consciente de la cuantizacion de las escalas.

La evaluacion se realizo con la herramienta `romakl` sobre su conjunto por defecto: 20 conversaciones y 15.438 tokens de continuacion generados por el profesor. El checkpoint reporta una KL de 0,2406042 y un 78,33% de acuerdo top-1 respecto al profesor. Los pesos de vision, MTP y especulador quedan excluidos del computo de tamano. No se especifican en la informacion disponible el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo es un `text-generation` derivado de Qwen3.5-2B, por lo que hereda las capacidades del base en la medida en que la cuantizacion las preserve (78,33% de acuerdo top-1 con el profesor).
- Razonamiento y codigo: no se documentan evaluaciones especificas en la informacion disponible; se asume herencia del modelo base con la degradacion medida por KL.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio figura como no disponible.
- Capacidades especiales (vision, audio, thinking mode): los pesos de vision y MTP se excluyen explicitamente del computo de tamano, lo que sugiere que el modelo base podria tener componentes multimodales, pero no se confirma su disponibilidad en este checkpoint.

## Casos de uso

- Inferencia local en Mac: el caso de uso principal y documentado. Se instala la CLI `mirai` via Homebrew y se ejecuta `mirai --model trymirai/Qwen3.5-2B-S`, aprovechando el runtime `uzu` optimizado para Apple silicon. Adecuado para desarrolladores que quieran un modelo de generacion de texto sin GPU dedicada.
- Prototipado rapido en portatiles Apple: con ~2,4 GB de repositorio y ~2,5 bits por peso, el checkpoint cabe holgadamente en la memoria unificada de un Mac moderno, permitiendo iterar sobre prompts y plantillas sin infraestructura cloud.
- Asistentes de texto embebidos en aplicaciones macOS: la CLI y el runtime permiten integrar generacion de texto en herramientas de escritorio, scripts o flujos locales donde la privacidad de los datos es prioritaria.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden usar este checkpoint como referencia para comparar la relacion entre tamano, KL y acuerdo top-1 frente a otras cuantizaciones del mismo base, usando la herramienta `romakl`.
- Generacion de texto de baja latencia en entornos con recursos limitados: al reducir el peso a ~2,5 bits, se disminuye el ancho de banda de memoria necesario, lo que beneficia a dispositivos con memoria unificada compartida.
- Docencia y experimentacion: util para cursos o talleres sobre cuantizacion de LLM, dado que la model card documenta el metodo (QTIP, rotaciones de Kronecker, Fisher sketch) y publica metricas reproducibles con `romakl`.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de fidelidad frente al profesor medidas con `romakl`:

| Metrica | Valor |
|---|---|
| Divergencia KL (vs. profesor) | 0,2406042 |
| Acuerdo top-1 | 78,33% |
| Conjunto de evaluacion | 20 conversaciones, 15.438 tokens de continuacion |
| Herramienta | romakl (commit bfb79f5) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 2,4 GB; con ~2,5 bits por peso sobre 580,5 M de parametros, la huella de pesos ronda los 180-200 MB, aunque el runtime y el contexto anaden overhead no especificado.
- GPU recomendadas: la model card indica que actualmente solo se soporta inferencia en Apple silicon; no se documentan GPUs NVIDIA o AMD.
- Cabe en consumer GPU: no se documenta soporte para GPUs de consumo (RTX 4090, etc.); el soporte actual es exclusivamente Apple silicon.
- Opciones de despliegue: CLI `mirai` (Homebrew) y runtime `uzu`; tambien se menciona el runtime Prism (fork de llama.cpp) para las empaquetaduras Bonsai 2, aunque no se confirma que aplique a este checkpoint. No se documenta soporte para vLLM, TGI, llama.cpp estandar ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-2B-S | 580,5 M (cuantizado desde 2B) | no disponible | Apache 2.0 | Apple silicon (`uzu`) | KL 0,2406; top-1 78,33% |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Apache 2.0 | Multiples | Modelo profesor de referencia |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de informacion suficiente para comparar con alternativas de cuantizacion de otros autores sobre el mismo modelo base.

## Limitaciones y advertencias

- Perdida de fidelidad: el checkpoint no reproduce exactamente al profesor; el 78,33% de acuerdo top-1 implica que aproximadamente uno de cada cinco tokens difiere del modelo original en el conjunto evaluado.
- Plataforma unica: la model card afirma explicitamente que actualmente solo se soporta inferencia en Apple silicon, lo que excluye su uso en servidores Linux con GPU NVIDIA o AMD sin trabajo adicional.
- Runtime propietario: depende de la libreria `uzu` y la CLI `mirai`, no de stacks estandar como transformers, vLLM o llama.cpp, lo que limita la portabilidad y la integracion en pipelines existentes.
- Idiomas no documentados: el campo de idiomas figura como no disponible, por lo que no se puede garantizar un rendimiento multilingue concreto.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion disponible; al ser una cuantizacion agresiva, la degradacion puede amplificar errores en tareas de razonamiento largo.
- Uso comercial: la licencia es Apache 2.0, lo que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-2B enlazada en la model card.
- Componentes excluidos: los pesos de vision, MTP y especulador no forman parte del computo de tamano y no se confirma su disponibilidad, por lo que no debe asumirse capacidad multimodal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/trymirai/Qwen3.5-2B-S
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Model card del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Herramienta romakl: https://github.com/trymirai/romakl/tree/bfb79f548a80b6af7d9f4d4e35d0db99b97708e8
- Runtime Prism (fork de llama.cpp): https://github.com/PrismML-Eng/llama.cpp/tree/3f035ba664f8f08c3d9432b6421f8f1a0da1f37a
- Documentacion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
