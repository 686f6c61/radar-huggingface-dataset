# xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge

## Resumen

LFM3-1.7B Agent Orange - Claude Code 2xMerge es un modelo de lenguaje de 1.728.801.536 parámetros creado por el usuario xtools-at mediante la fusión de dos fine-tunes comunitarios del modelo LiquidAI/LFM3-1.7B. No se trata de un entrenamiento desde cero, sino de un merge de pesos con coeficientes 1.0 y 0.8 de los checkpoints mondk/LFM3-1.7B-Claude-Code-Safetensors y saidutta69/LFM3-1.7B-Claude-Fable5.1, respectivamente. El objetivo declarado es combinar el comportamiento agéntico y de código del primer checkpoint con el formato de tool calling del segundo.

El modelo hereda la arquitectura tri-híbrida de LFM3-1.7B, que combina convoluciones cortas con compuertas, atención de ventana deslizante y atención global. Liquid AI anuncia una ventana de contexto de hasta 256K tokens para el modelo base, aunque el fine-tune de Fable se entrenó con ventanas de 4.096 tokens, por lo que el rendimiento en contextos largos tras el merge no está garantizado. El modelo está orientado a flujos de trabajo de agentes de código ligeros, con soporte para tool calling y function calling.

Su relevancia radica en ofrecer un modelo compacto (1,7B parámetros) que puede ejecutarse en hardware de consumo y que imita el comportamiento de harnesses tipo Claude Code, con herramientas como Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, TodoWrite, TaskCreate, TaskUpdate, TaskOutput y ToolSearch. Es un checkpoint experimental de la comunidad, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks independientes publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (convoluciones cortas con compuertas, atencion de ventana deslizante y atencion global) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens anunciados en el modelo base; fine-tune de Fable entrenado con ventanas de 4.096 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B emplea una arquitectura tri-híbrida que intercala convoluciones cortas con compuertas, atención de ventana deslizante y atención global. Esta combinación busca reducir el coste computacional en inferencia manteniendo capacidad de modelado de dependencias de largo alcance, algo relevante para despliegue local con ventanas de contexto grandes.

El checkpoint Agent Orange no se entrena: es un merge lineal de pesos de dos fine-tunes. El primero, mondk/LFM3-1.7B-Claude-Code-Safetensors, se entrenó en varias rondas sobre el dataset mondk/Ultra-Trio-Unfiltered, con foco sucesivo en uso de herramientas, rendimiento en benchmarks y aprendizaje por refuerzo con preguntas y respuestas generadas por el propio modelo. El segundo, saidutta69/LFM3-1.7B-Claude-Fable5.1, se entrenó con LoRA en BF16 sobre la configuración claude_code del dataset saidutta69/fable-5.1-premium-v2, con máscara de pérdida solo en turnos del asistente y ventanas de 4.096 tokens, orientado a la fidelidad de esquemas y la reducción de nombres de herramienta inválidos. La fusión aplica peso 1.0 al primero y 0.8 al segundo.

## Capacidades

- Generación de texto conversacional y asistencia de código en 17 idiomas.
- Tool calling y function calling estructurado, con herramientas tipo Claude Code: Bash, Read, Write, Edit, Glob, Grep, WebFetch, WebSearch, TodoWrite, TaskCreate, TaskUpdate, TaskOutput y ToolSearch.
- Navegación y exploración de repositorios, lectura, edición y creación de archivos.
- Interacción con herramientas de shell y terminal (la ejecución la realiza el harness, no el modelo).
- Razonamiento multi-paso orientado a agentes de codificación.
- Integración en harnesses compatibles con definiciones de herramientas tipo Claude Code.
- Capacidades multilingües limitadas a los 17 idiomas listados; no se documenta calidad por idioma.
- No se documentan capacidades de visión, audio ni modo thinking explícito.

## Casos de uso

- Exploración de repositorios: el modelo puede recibir un árbol de archivos y generar llamadas a Glob y Grep para localizar símbolos o ficheros, integrándose en un harness que ejecute esas herramientas y devuelva resultados.
- Edición asistida de código: con las herramientas Read y Edit, el modelo puede leer un fichero y proponer parches estructurados en formato de tool call, validables por el host antes de aplicarse.
- Automatización de terminal en sandbox: mediante la herramienta Bash, el modelo puede proponer comandos para tareas de build, test o lint; el harness debe revisar y ejecutar cada comando con permisos controlados.
- Agentes de documentación: usando Write y WebFetch, el modelo puede generar o actualizar documentación a partir de contenido descargado y ficheros locales, con validación humana de los cambios.
- Gestión de tareas en agentes multi-paso: con TodoWrite, TaskCreate, TaskUpdate y TaskOutput, el modelo puede mantener un plan de tareas explícito durante sesiones de codificación iterativas.
- Pruebas de harnesses de agentes: al ser un modelo pequeño con formato de tool call tipo Claude Code, sirve para validar pipelines de agente, parsers de tool calls y políticas de permisos sin incurrir en costes de modelos grandes.
- Prototipado local en hardware de consumo: al tener 1,7B parámetros, puede ejecutarse en GPUs de gama media para experimentar con flujos agénticos antes de migrar a modelos mayores.
- Búsqueda asistida en código: combinando Grep y WebSearch, el modelo puede localizar patrones en el repositorio y complementar con búsquedas externas, siempre con validación de resultados por el host.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de benchmarks independientes para este checkpoint fusionado y recomienda evaluarlo con el propio harness y tareas antes de confiar en él para trabajo de codificación exigente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 1,73B parámetros en FP16 se requieren aproximadamente 3,5 GB solo de pesos, más overhead de activaciones y KV cache.
- En cuantización de 8 bits, el peso ronda los 1,7-1,8 GB; en 4 bits, alrededor de 0,9-1,0 GB, aunque el repo no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, así como en A100/H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6-8 GB o más en FP16, y en GPUs con 4 GB o más usando cuantización, aunque no se documenta soporte oficial.
- Opciones de despliegue: transformers (librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El tag custom_code sugiere que requiere código específico del repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge | 1,73B | 256K anunciados en base; 4.096 en fine-tune | Merge agéntico de código | lfm1.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | Modelo base de texto y agentes | lfm1.0 | HuggingFace |
| mondk/LFM3-1.7B-Claude-Code-Safetensors | 1,73B | no disponible | Fine-tune de código y tool use | lfm1.0 | HuggingFace |
| saidutta69/LFM3-1.7B-Claude-Fable5.1 | 1,73B | no disponible (entrenado a 4.096) | Fine-tune de tool calling | lfm1.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Es un merge experimental de la comunidad, no un reemplazo directo de modelos de codificación de mayor tamaño.
- Los esquemas de herramientas aprendidos son reconstrucciones de las herramientas tipo Claude Code y no coinciden necesariamente con la implementación oficial de Anthropic; nombres, argumentos y salidas deben validarse en la aplicación anfitriona.
- El fine-tune de Fable usó ventanas de 4.096 tokens, por lo que el contexto de 256K del modelo base no garantiza rendimiento equivalente tras el merge.
- No hay benchmarks independientes publicados; el rendimiento real en tareas de codificación es desconocido.
- Riesgo de alucinación en nombres de herramienta, argumentos y comandos de shell; se recomienda sandboxing y controles de permisos, revisando comandos y operaciones de fichero antes de ejecutarlos.
- Sesgos conocidos: no documentados por el autor; al derivar de datasets comunitarios sin filtrado declarado (Ultra-Trio-Unfiltered), pueden persistir sesgos de esos datos.
- Licencia lfm1.0: es necesario revisar el fichero LICENSE y los términos upstream antes de redistribuir o desplegar comercialmente.
- El modelo no ejecuta comandos ni modifica ficheros por sí mismo; requiere un runtime o harness compatible que aporte las herramientas.
- Calidad multilingüe no evaluada por idioma; los 17 idiomas listados reflejan el modelo base, no una validación del merge.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xtools-at/LFM3-1.7B-AgentOrange-Claude-Code-2xMerge
- Perfil del autor: https://huggingface.co/xtools-at
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base (Base): https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Fine-tune mondk: https://huggingface.co/mondk/LFM3-1.7B-Claude-Code-Safetensors
- Fine-tune saidutta69: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1
