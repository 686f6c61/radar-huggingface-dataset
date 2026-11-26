# wenzhouwu/YoungAi-DeepSeek-V4.1-Flash-1017

## Resumen

YoungAi-DeepSeek-V4.1-Flash-1017 es una cuantización extrema del modelo DeepSeek V4.1 Flash (release 1017) publicada por el usuario wenzhouwu bajo el paraguas del proyecto YoungAi. El modelo original, de 510 GB, se reduce a un artefacto de 113,6 GB que cabe en una única máquina de 128 GB (DGX Spark o Apple Silicon Mac) manteniendo, según el autor, una coincidencia del 86,0% en el siguiente token predicho (mismo top-1) frente a los pesos originales en código. El repositorio de Hugging Face ocupa 116,0 GB e incluye pesos en formato GGUF.

La propuesta técnica se apoya en tres piezas: cuantización vectorial de 8 pesos conjuntos (~1,6 bits por peso) sin datos de entrenamiento, un sidecar de restauración de 145 MB (ganancias por experto enrutado y sesgos de router) y un paquete de post-entrenamiento de 101 MB con una corrección de rango 64 sobre la salida de cada capa MoE. La torre de visión (0,97 GB en BF16) se carga bajo demanda y se descarga tras su uso, de modo que el grueso de la memoria se dedica al backbone de texto.

El modelo se orienta a un asistente personal que corre íntegramente en local: conversación por voz, memoria persistente, navegación web, generación de documentos Office, vídeo y encadenamiento de tareas entre aplicaciones. El motor está escrito en C99 con CUDA para DGX Spark y Metal para Mac, sin dependencias de terceros. La licencia es MIT y los idiomas declarados son inglés y chino. La relevancia actual reside en demostrar que un MoE de gran tamaño puede ejecutarse en hardware de escritorio profesional con contexto de 1M de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, derivada de DeepSeek V4.1 Flash 1017 |
| Parametros totales | 485.283.840 (dato de safetensors del repo); el modelo base se publica con 510 GB de pesos |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Cuantizacion vectorial de 8 pesos conjuntos (~1,6 bit/peso), formato GGUF; comparado con UD-IQ1_S / IQ1_M de Unsloth y GSQ-RCO IQ1_M de ISTA-DASLab |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 116,0 GB; base de 113,6 GB + sidecar de restauración de 145 MB + paquete de post-entrenamiento de 495 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) enrutados, del que esta publicación es una cuantización. La compresión se realiza en tres capas. Primero, una cuantización vectorial que agrupa 8 pesos por vector y los codifica a ~1,6 bits por peso, sin usar datos de entrenamiento. Segundo, un sidecar de restauración de 145 MB que contiene una ganancia por cada fila de cada experto enrutado y un sesgo pequeño por router, resueltos contra los pesos originales; existe una variante por dominio (finanzas, código, derecho, medicina, ciencia) intercambiable desde la interfaz en menos de un segundo. Tercero, un paquete de post-entrenamiento de 101 MB que aplica una corrección de rango 64 sobre la salida de cada capa MoE, destilada del propio modelo original de 510 GB: aprende su distribución de siguiente token en cada posición en lugar de memorizar texto.

El autor declara que el código usado para evaluar no comparte ninguna secuencia de 24 tokens con los datos de entrenamiento del sidecar, y que el inglés general mejora 2,7 puntos con el post-entrenamiento, lo que sugiere que la corrección arregla el error de cuantización y no memoriza. La torre de visión (0,97 GB en BF16 original) se almacena como fichero separado y se carga en GPU solo cuando llega una imagen, liberándose al terminar; una petición de texto no toca ninguno de sus bytes. El motor de inferencia es C99 con CUDA (DGX Spark) y Metal (Apple Silicon), con un único Makefile y sin bibliotecas de terceros enlazadas.

## Capacidades

- Generación de texto y razonamiento general, con contexto de hasta 1M de tokens.
- Generación de código en múltiples lenguajes (la evaluación de coincidencia top-1 usa 15.360 tokens retenidos en 30 lenguajes).
- Procesamiento de imágenes mediante torre de visión cargada bajo demanda (0,97 GB en BF16).
- Memoria persistente de lo que se le indica al asistente, con seguimiento de tareas en curso.
- Navegación web dentro del flujo de agente.
- Creación de ficheros Word, PDF, PowerPoint y Excel.
- Generación de vídeo como parte del flujo del asistente.
- Encadenamiento de resultados hacia la siguiente aplicación del dispositivo.
- Interacción por voz ("hold to talk") en el producto YoungAi.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Modo agente con flujo multi-paso (el ejemplo del pelican test usa el flujo de agente `dsh`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente personal local con memoria: el modelo recuerda información aportada por el usuario y la reutiliza en conversaciones posteriores, sin que modelo, memoria ni ficheros salgan de la máquina, gracias al despliegue íntegro en un equipo de 128 GB.
- Generación de documentos ofimáticos: a partir de una instrucción en lenguaje natural produce ficheros Word, PDF, PowerPoint y Excel, adecuado para automatizar informes y presentaciones en entornos con requisitos de confidencialidad.
- Agente de navegación web: el flujo de agente consulta la web y encadena pasos para resolver una tarea (por ejemplo, buscar el DGX Spark más barato, como muestra la captura de YoungAi Studio), apoyándose en el contexto de 1M de tokens para retener el estado de la tarea.
- Asistencia a programadores en local: con un 86,0% de coincidencia top-1 frente al original en código y corrección de rango 64 sobre las capas MoE, sirve para autocompletado y generación de fragmentos en 30 lenguajes sin enviar código a la nube.
- Creación de vídeo automatizada: el asistente genera vídeo como parte de un flujo de trabajo más amplio, útil para prototipos de marketing o documentación interna.
- Despliegue en Apple Silicon: al usar Metal y caber en un Mac de 128 GB, permite prototipar y ejecutar el asistente en portátiles o estaciones de trabajo de Apple sin GPU dedicada.
- Especialización por dominio mediante sidecars: un despacho jurídico o un equipo financiero puede cargar el sidecar de derecho o finanzas correspondiente desde la interfaz en menos de un segundo, sin recargar el modelo base.
- Investigación sobre cuantización extrema: el artefacto sirve como referencia reproducible para estudiar cuantización vectorial a ~1,6 bit/peso y destilación de correcciones sobre MoE.

## Benchmarks y rendimiento

El autor publica métricas de coincidencia top-1 con el modelo original (mismo siguiente token) sobre código (15.360 tokens retenidos en 30 lenguajes) e inglés general (WikiText-2):

| Configuracion | Tamano | Codigo (top-1 same) | Ingles general |
|---|---:|---:|---:|
| Base | 113,6 GB | 78,4% | 76,8% |
| Base + sidecar de codigo | +41 MB | 82,0% | 79,7% |
| Base + sidecar + post-entrenamiento | +101 MB | 84,8% | 82,4% |
| Base + sidecar de restauracion | +145 MB | 85,1% | 82,2% |
| Base + sidecar de restauracion + parche de indice | +13 MB | 85,2% | 81,6% |
| Base + sidecar de restauracion + post-entrenamiento con salida restaurada (por defecto en Spark) | +495 MB | 86,0% | 81,2% |

Además, la model card menciona comparaciones en los benchmarks de Unsloth frente a UD-IQ1_S / IQ1_M e ISTA-DASLab GSQ-RCO IQ1_M, con subconjuntos aleatorios pequeños (296 respuestas más 14 ejercicios de Aider, 90 minutos por benchmark, barras de error de ±2,4 a ±13,4 puntos) y excluyendo los 9 elementos usados en el entrenamiento del sidecar. No se proporcionan los valores numéricos de esos benchmarks (MMLU, HumanEval, GSM8K, GPQA, HMMT) en la información disponible; el autor advierte explícitamente que esas puntuaciones no representan lo que el modelo puede hacer.

## Requisitos de hardware

- VRAM estimada: 113,6 GB para el modelo base; hasta ~114,1 GB con sidecar de restauración y post-entrenamiento (495 MB adicionales). La torre de visión añade 0,97 GB solo mientras se procesa una imagen.
- Equipos objetivo: una única máquina de 128 GB, concretamente NVIDIA DGX Spark o Apple Silicon Mac con 128 GB de memoria unificada.
- GPU recomendadas: DGX Spark (CUDA); Apple Silicon (Metal). Para A100, H100 o RTX 4090 no se documenta soporte ni viabilidad en la información disponible (una RTX 4090 de 24 GB no puede alojar los 113,6 GB del base).
- Cabe en GPU de consumo: no, según los tamaños indicados; requiere 128 GB de memoria en un solo equipo.
- Opciones de despliegue: motor propio en C99 con CUDA y Metal, un Makefile, sin bibliotecas de terceros. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal es el cambio de sidecar por dominio en menos de un segundo.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Coincidencia top-1 vs original | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| YoungAi-DeepSeek-V4.1-Flash-1017 (este) | 113,6 GB base (+495 MB sidecar/post-entrenamiento) | 1M tokens | 86,0% en codigo, 81,2% en ingles general | MIT | Hugging Face (GGUF), 934 descargas, 11 likes |
| Unsloth UD-IQ1_S | no disponible | no disponible | comparado en la figura del autor, valores no publicados en el texto | no disponible | no disponible |
| Unsloth IQ1_M | no disponible | no disponible | comparado en la figura del autor, valores no publicados en el texto | no disponible | no disponible |
| ISTA-DASLab GSQ-RCO IQ1_M | no disponible | no disponible | comparado en la figura del autor, valores no publicados en el texto | no disponible | no disponible |

Los tres comparables son cuantizaciones a ~1 bit del mismo tipo de modelo; la información proporcionada no incluye sus parámetros, contexto ni licencia, por lo que la comparación cuantitativa queda limitada a la gráfica de la model card, cuyos valores numéricos no se transcriben en el texto.

## Limitaciones y advertencias

- La cuantización a ~1,6 bit/peso introduce degradación: la coincidencia top-1 con el original es del 86,0% en código y del 81,2% en inglés general, es decir, entre el 14% y el 19% de las posiciones el modelo elige un token distinto al original.
- El propio autor advierte que las puntuaciones de benchmark no reflejan la capacidad real del modelo; el ejemplo del pelican test muestra diferencias cualitativas grandes con puntuaciones apenas distintas.
- Las evaluaciones de benchmarks se hicieron sobre subconjuntos aleatorios pequeños (296 respuestas, 14 ejercicios de Aider) con barras de error de ±2,4 a ±13,4 puntos, lo que limita la fiabilidad estadística.
- Idiomas soportados únicamente inglés y chino; no se declara castellano ni otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos, agravado por la pérdida de fidelidad de la cuantización.
- Sesgos conocidos: no documentados en la información proporcionada.
- El sidecar de restauración "sigue aprendiendo" de ficheros fuente que escribe la API oficial; este mecanismo de autoaprendizaje introduce variabilidad entre ejecuciones (el ejemplo del 27 y el 30 de octubre muestra dibujos distintos con el mismo modelo y flujo).
- Requiere hardware específico de 128 GB (DGX Spark o Apple Silicon Mac); no hay soporte documentado para GPUs convencionales ni para frameworks estándar como vLLM o llama.cpp.
- La licencia MIT permite uso comercial, pero el modelo base es de DeepSeek y la model card no detalla obligaciones adicionales derivadas de la licencia del original.
- El repositorio tiene 934 descargas y 11 likes, lo que indica una validación comunitaria todavía escasa.

## Enlaces

- Hugging Face: https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash-1017
- Repositorio GitHub: https://github.com/fodelf/YoungAi
- Sitio web y guía de usuario: https://fodelf.github.io/YoungAi/
- Notas técnicas: https://github.com/fodelf/YoungAi/blob/restructure/docs/TECHNICAL.md
- README en chino: https://github.com/fodelf/YoungAi/blob/restructure/README.zh-CN.md
- Modelo base: deepseek-ai/DeepSeek-V4.1-Flash-1017 (referenciado en la model card; URL de Hugging Face no proporcionada)
