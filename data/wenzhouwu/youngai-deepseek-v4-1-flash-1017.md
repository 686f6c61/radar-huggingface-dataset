# wenzhouwu/YoungAi-DeepSeek-V4.1-Flash-1017

## Resumen

YoungAi-DeepSeek-V4.1-Flash-1017 es una cuantización extrema del modelo DeepSeek V4.1 Flash (release 1017) publicada por el usuario wenzhouwu bajo el paraguas del proyecto YoungAi. El modelo original, de 510 GB en BF16, se reduce a una base de 113,6 GB mediante cuantización vectorial conjunta de 8 pesos (~1,6 bits por peso), complementada con sidecars de restauración y parches de índice que corrigen el error de cuantización. El objetivo declarado es ejecutar un asistente personal de IA completamente local en una única máquina de 128 GB, como una DGX Spark o un Mac con Apple Silicon, manteniendo un contexto de 1M de tokens.

La propuesta técnica es poco habitual: en lugar de aceptar la pérdida de calidad típica de las cuantizaciones de 1 bit, el autor entrena correcciones (un sidecar de 145 MB con ganancias por experto y una corrección de rango 64 sobre la salida de cada capa MoE) contra los pesos originales, de modo que el modelo cuantizado reproduce el siguiente token del original en el 85,2% de los casos sobre código. La inferencia se implementa en C99 + CUDA para DGX Spark y Metal para Mac, sin dependencias de terceros.

El modelo base es un Mixture-of-Experts de DeepSeek con capacidades multimodales (torre de visión de 0,97 GB cargada bajo demanda), soporte de agentes y tool calling, y licencia MIT. Los idiomas declarados son inglés y chino. Es relevante ahora porque demuestra que un modelo frontier de 510 GB puede operar en hardware de consumo profesional con pérdidas de calidad medibles y acotadas, algo que hasta hace poco requería clústeres multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con torre de visión separada |
| Parametros totales | 485.283.840 (dato de safetensors del repo; el modelo base completo no reporta cifra en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Vector quantization conjunta de 8 pesos (~1,6 bit/peso), formato GGUF; sidecars de restauración (145 MB) y parche de índice (13 MB) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (base de 113,6 GB) + safetensors para la torre de visión (0,97 GB, BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de DeepSeek (release 1017) con enrutamiento por expertos y una torre de visión independiente de 0,97 GB en BF16. La cuantización no sigue el esquema habitual de escalas por bloque: agrupa 8 pesos y los cuantiza conjuntamente mediante vector quantization, alcanzando ~1,6 bits por peso sin usar datos de entrenamiento en ese paso. Sobre esa base se añaden tres artefactos: un sidecar de 41 MB con ganancias por fila de cada experto enrutado y sesgos por router (resuelto contra los pesos originales), un archivo de post-entrenamiento de 101 MB con una corrección de rango 64 sobre la salida de cada capa MoE (destilada del propio modelo de 510 GB para aprender su distribución de siguiente token), y un parche de índice de 13 MB que ajusta la selección de token final.

El entrenamiento de las correcciones se hace contra los pesos originales, no contra un dataset humano: la corrección de rango 64 aprende la distribución del original en cada posición, y el autor reporta que el inglés general sube 2,7 puntos además del código, lo que sugiere que corrige el error de cuantización en lugar de memorizar. Los conjuntos de evaluación (15.360 tokens de código en 30 lenguajes y WikiText-2) no comparten tramos de 16 tokens con los datos de entrenamiento, salvo dos líneas de boilerplate de Dockerfile. La inferencia está implementada en C99 + CUDA para DGX Spark y Metal para Apple Silicon, con un único Makefile y sin librerías de terceros enlazadas. La torre de visión se carga en GPU solo cuando llega una imagen y se libera al terminar, de modo que las peticiones de texto nunca tocan esos bytes.

## Capacidades

- Generación de texto y razonamiento general en inglés y chino.
- Generación de código en más de 30 lenguajes (evaluado sobre 15.360 tokens de código retenidos).
- Capacidades multimodales: procesamiento de imágenes mediante torre de visión cargada bajo demanda.
- Tool calling y function calling, orientado a flujos de agente.
- Razonamiento multi-paso y seguimiento de tareas de larga duración (el asistente "sigue insistiendo en un trabajo" según la model card).
- Contexto de 1M tokens para conversaciones y documentos extensos.
- Generación de archivos ofimáticos: Word, PDF, PowerPoint y Excel.
- Generación de vídeo y navegación web dentro del flujo de agente.
- Memoria persistente de lo que el usuario le cuenta, almacenada localmente.
- Cambio de dominio en caliente (finanzas, código, derecho, medicina, ciencia) mediante sidecars, en menos de un segundo.
- Autoaprendizaje: el sidecar de restauración sigue aprendiendo de archivos fuente que la API oficial genera.

## Casos de uso

- Asistente personal local con memoria: el modelo recuerda información del usuario entre sesiones y la mantiene en disco, sin salir de la máquina, gracias al contexto de 1M tokens y al almacenamiento local de memoria y archivos.
- Generación de documentos ofimáticos: a partir de una conversación, produce archivos Word, PDF, PowerPoint y Excel, integrándose en el flujo del agente para entregar el resultado a la siguiente aplicación del dispositivo.
- Automatización de tareas de investigación web: el agente navega, recopila información y sigue trabajando en una tarea de forma autónoma, adecuado por su soporte de multi-step reasoning y tool calling.
- Desarrollo de código en local: con 85,2% de coincidencia de siguiente token con el original sobre código en 30 lenguajes, sirve para autocompletado y generación en entornos sin conectividad o con requisitos de privacidad.
- Despliegue en hardware de borde: cabe en una DGX Spark o un Mac de 128 GB, lo que permite asistencia en entornos aislados (laboratorios, sanidad, defensa) donde no se puede usar API en la nube.
- Cambio de dominio especializado: un mismo despliegue puede alternar entre sidecars de finanzas, derecho, medicina o ciencia en menos de un segundo, útil para consultorías que atienden varios verticales con una sola máquina.
- Procesamiento de documentos largos con imágenes: la carga bajo demanda de la torre de visión permite analizar capturas o escaneos dentro de flujos de texto sin penalizar el rendimiento de las peticiones puramente textuales.

## Benchmarks y rendimiento

Los datos publicados miden la coincidencia de siguiente token ("Same top") con el modelo original de 510 GB, no benchmarks estándar como MMLU o HumanEval.

| Configuracion | Tamano | Codigo (Same top) | Ingles general (Same top) |
|---|---:|---:|---:|
| Base | 113,6 GB | 78,4% | 76,8% |
| Base + sidecar de codigo | + 41 MB | 82,0% | 79,7% |
| Base + sidecar + post-entrenamiento | + 101 MB | 84,8% | 82,4% |
| Base + sidecar de restauracion | + 145 MB | 85,1% | 82,2% |
| Base + sidecar + parche de indice (por defecto en Spark) | + 13 MB | 85,2% | 81,6% |

El autor advierte que las comparaciones con Unsloth UD-IQ1_S/IQ1_M y ISTA-DASLab GSQ-RCO IQ1_M se basan en subconjuntos aleatorios pequeños (296 respuestas más 14 ejercicios de Aider, 90 minutos por benchmark, barras de error de ±2,4 a ±13,4 puntos) y que las puntuaciones no representan la capacidad real del modelo. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada: 128 GB para la base de 113,6 GB más sidecars y overhead; la torre de visión añade 0,97 GB solo durante peticiones con imagen.
- GPU recomendadas: NVIDIA DGX Spark (implementación CUDA) y Apple Silicon Mac de 128 GB (implementación Metal).
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB); requiere hardware de memoria unificada o múltiples GPU.
- Opciones de despliegue: motor propio en C99 + CUDA/Metal con un Makefile, sin librerías de terceros; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| YoungAi-DeepSeek-V4.1-Flash-1017 | 485.283.840 (safetensors repo); base 510 GB original | 1M | ~1,6 bit/peso + sidecars | MIT | DGX Spark, Mac 128 GB |
| Unsloth UD-IQ1_S / IQ1_M | no disponible | no disponible | 1 bit (IQ1) | no disponible | no disponible |
| ISTA-DASLab GSQ-RCO IQ1_M | no disponible | no disponible | 1 bit (IQ1) | no disponible | no disponible |
| DeepSeek V4.1 Flash 1017 (original) | 510 GB en BF16 | 1M | BF16 | no disponible | Clúster multi-GPU / API |

La comparación con Unsloth e ISTA-DASLab aparece solo como referencia gráfica en la model card, sin cifras detalladas en la información disponible. El original de DeepSeek sirve como referencia de calidad (Same top 100%) pero requiere 510 GB.

## Limitaciones y advertencias

- La cuantización a ~1,6 bit/peso introduce degradación medible: la coincidencia de siguiente token con el original es del 85,2% en código y 81,6% en inglés general, no del 100%.
- El autor reconoce que las puntuaciones de benchmark no reflejan la capacidad real; el ejemplo del "pelican test" muestra diferencias cualitativas grandes con puntuaciones apenas distintas.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- El repositorio declara 485.283.840 parámetros en safetensors, cifra que no cuadra con un modelo de 510 GB en BF16; conviene verificar antes de planificar el despliegue.
- El motor de inferencia es propio (C99 + CUDA/Metal) y no está integrado en ecosistemas estándar como vLLM o llama.cpp, lo que limita la portabilidad y el soporte comunitario.
- Solo 956 descargas y 7 likes en el momento de la consulta: proyecto joven con validación externa limitada.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo en la información disponible.
- La licencia MIT permite uso comercial, pero el modelo base DeepSeek puede tener condiciones propias que conviene revisar.
- El "autoaprendizaje" del sidecar depende de archivos generados por la API oficial de DeepSeek, lo que introduce una dependencia externa en el flujo de mejora continua.

## Enlaces

- HuggingFace: https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash-1017
- Repositorio GitHub: https://github.com/fodelf/YoungAi
- Sitio web y guía de usuario: https://fodelf.github.io/YoungAi/
- Notas técnicas: https://github.com/fodelf/YoungAi/blob/restructure/docs/TECHNICAL.md
- README en chino: https://github.com/fodelf/YoungAi/blob/restructure/README.zh-CN.md
- Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017 (referenciado en la model card)
