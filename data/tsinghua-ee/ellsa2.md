# tsinghua-ee/ELLSA2

## Resumen

ELLSA 2 (standalone generator) es un paquete de checkpoints publicado por el grupo `tsinghua-ee` en HuggingFace que implementa el generador de gestos y expresiones faciales empleado en el estudio ELLSA 2 sobre interacción de voz full-duplex. No es un modelo de lenguaje: recibe audio alineado del hablante objetivo y del interlocutor, junto con un clip de movimiento de estilo, y produce poses corporales y de manos en el espacio SMPL-H más parámetros faciales FLAME. El paquete se publica como módulo de gesto-expresión independiente, junto con el inicializador de entrenamiento (un modelo base ASR dual-stream) y los tokenizadores RVQ-VAE causales.

La relevancia técnica del paquete está en su naturaleza causal y de streaming: procesa la señal en bloques de 0,8 segundos, con 10 embeddings acústicos por flujo de audio y seis pasos latentes de movimiento por bloque, y emite cada nuevo bloque de 24 fotogramas (a 30 fps) de forma inmediata sin contexto derecho. Eso lo sitúa en el terreno de la generación de conducta no verbal en tiempo real para avatares conversacionales, telepresencia y agentes encarnados, en lugar del terreno de los generadores de gestos offline que requieren la secuencia completa de audio para producir la animación.

El repositorio ocupa 7,2 GB y contiene el generador, el modelo base ASR a 50.000 actualizaciones, tres tokenizadores RVQ (cuerpo superior, manos y cara) y los pesos de KaoLRM mono para extracción opcional de etiquetas faciales. La model card no declara licencia del paquete ni número de parámetros, y el proyecto depende de activos geométricos externos (SMPL-H, SMPL-X, FLAME) con licencias académicas que restringen su redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador causal de streaming para gestos y expresiones en diálogo, con tokenizadores RVQ-VAE y un modelo base ASR dual-stream; los detalles de la red (tipo de bloque, atención, difusión) no están disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No se define contexto en tokens. Operación en bloques de 0,8 s (24 fotogramas a 30 fps) con contexto derecho cero; los límites de generación son 300 fotogramas (10 s) de gesto y 240 fotogramas (8 s) de expresión/boca por rama RVQ. La referencia de estilo es de 612 fotogramas SMPL-H (20,4 s) |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, GPTQ, AWQ ni cuantizaciones de 8/4 bits) |
| Idiomas soportados | inglés (etiqueta `en` de la model card) |
| Licencia | no disponible (la model card no declara licencia del paquete; los activos externos tienen licencias propias: SMPL-H, SMPL-X y FLAME académicas, KaoLRM mono CC BY-NC 4.0) |
| Formato de pesos | safetensors (etiqueta del repositorio) y `.pth` de PyTorch para los tokenizadores RVQ |
| Tamaño del repositorio | 7,2 GB |
| Fecha de creación en HuggingFace | 2026-10-16 |
| Fecha de última actualización | 2026-10-16 |

## Arquitectura y entrenamiento

El generador es un módulo causal de diálogo que consume dos flujos de audio alineados (objetivo e interlocutor) y un clip de movimiento de estilo, y produce 18 índices de codebook por paso latente: seis para cuerpo superior, seis para manos y seis para cara (cuatro codebooks de expresión facial y dos de boca). Cada bloque de 0,8 segundos contiene 10 embeddings acústicos por flujo y seis pasos latentes de movimiento, que se decodifican a 30 fps mediante los RVQ-VAE causales. La salida de inferencia es un NPZ con poses de cuerpo y manos, un `motioncode` facial de 108 dimensiones y los códigos discretos. Por defecto se emite cada bloque nuevo de 24 fotogramas con contexto derecho cero; el modo `--rvq-decode-mode whole` permite decodificar la secuencia de referencia completa.

El paquete incluye además `base_asr_model/`, un modelo base dual-stream de ASR en streaming a 50.000 actualizaciones que actúa como inicializador de la primera etapa de entrenamiento. La receta publicada es de dos etapas: primero `--stage expression` (inicializada desde `base_asr_model/`) y después `--stage gesture_expression` (inicializada desde `code/runs/expression/`). El generador distribuido utilizó además una etapa intermedia solo de gesto antes del entrenamiento conjunto, de modo que la receta de dos etapas entrena un modelo compatible pero no reproduce exactamente los pesos publicados. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF o DPO; los estados del optimizador no se incluyen en el paquete.

## Capacidades

- Generación de gestos corporales y de manos en el espacio SMPL-H, con 30 fps de salida.
- Generación de expresiones faciales y de movimiento de boca mediante parámetros FLAME y un `motioncode` facial de 108 dimensiones.
- Interacción full-duplex: procesa simultáneamente el audio del hablante objetivo y el del interlocutor, con 10 embeddings acústicos por flujo y bloque.
- Condicionamiento por estilo: acepta un clip de movimiento de referencia de 612 fotogramas SMPL-H que determina el estilo gestual.
- Streaming causal estricto: emite cada bloque de 24 fotogramas de forma inmediata, con contexto derecho cero, apto para conducción en tiempo real.
- Exportación de códigos discretos RVQ (18 índices por paso) además de la salida geométrica, lo que permite trabajar a nivel de token de movimiento.
- Decodificación de secuencia completa opcional mediante `--rvq-decode-mode whole` para referencias offline.
- No es un LLM: no genera texto, no soporta tool calling ni function calling, no hace razonamiento multi-paso ni matemáticas, y no tiene visión (consume audio, no imágenes).
- Capacidad multilingüe: no; la etiqueta de idioma es únicamente `en`.
- No se documentan modos especiales tipo thinking, audio generativo o síntesis de voz.

## Casos de uso

- Avatares 3D en tiempo real para asistentes conversacionales: el generador produce gestos y expresiones sincronizados con el audio con contexto derecho cero, por lo que puede conectarse a un motor de render para animar un avatar mientras el agente habla, sin esperar al final de la frase.
- Telepresencia y videollamada con animación por audio: sustituyendo vídeo por audio más un clip de estilo, el interlocutor remoto recibe un avatar animado con poses SMPL-H y parámetros FLAME, útil en entornos de bajo ancho de banda.
- Previsualización (previs) en producción de animación: generar una primera pasada de gestos a partir de las pistas de diálogo ya grabadas permite a los animadores iterar sobre el blocking antes de la animación final, aprovechando el modo de decodificación de secuencia completa.
- Doblaje y localización de personajes: aplicar el generador a la pista de audio doblada con el clip de estilo del personaje original para regenerar la conducta no verbal manteniendo el estilo de actuación de referencia.
- Investigación en interacción humano-agente: el modelo expone los códigos discretos RVQ, lo que permite analizar la sincronía gestual por rama (cuerpo superior, manos, expresión, boca) y comparar turnos de habla en corpus de diálogo.
- Agentes encarnados y robótica social: la salida SMPL-H y FLAME se puede retargetear a un esqueleto de robot o a un avatardistribuido para dotar a un agente físico de conducta no verbal coherente con el habla.
- Herramientas de accesibilidad para comunicación aumentativa: un usuario que introduce texto sintetizado puede obtener un avatar expresivo con gestos y expresiones generados a partir del audio, siempre que se resuelvan las restricciones de licencia de los activos geométricos.
- Evaluación objetiva de sincronía audio-gesto: la salida NPZ con poses y códigos discretos sirve como entrada para métricas geométricas de esqueleto y de malla, que es precisamente el uso previsto de los activos SMPL-X y FLAME descritos en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas, métricas objetivas de sincronía, ni evaluaciones subjetivas, y la búsqueda web no devolvió ningún paper, blog o repositorio asociado al modelo que aporte cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como cota superior orientativa, el paquete completo de checkpoints ocupa 7,2 GB en disco, por lo que una GPU con 8 GB o más debería poder alojar los pesos en fp16/bf16; es una estimación derivada y no confirmada por el autor.
- GPU recomendadas: no disponible en la información proporcionada. La receta de entrenamiento usa `NPROC_PER_NODE=8`, lo que implica 8 procesos GPU para el entrenamiento distribuido, pero no se especifica el modelo de GPU ni la VRAM por dispositivo.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño del paquete es plausible en tarjetas con 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090), pero no hay validación publicada.
- Opciones de despliegue: entorno conda `ellsa2` e inferencia mediante `python infer.py --model-path ../checkpoints/standalone_generator`. No hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje y no se publican pesos GGUF.
- Latencia y throughput: no publicados. Por diseño, el modelo no usa contexto derecho y emite cada bloque de 24 fotogramas en cuanto está disponible, lo que fija la granularidad algorítmica en bloques de 0,8 s de audio.
- Almacenamiento y dependencias: 7,2 GB de checkpoints más los activos geométricos externos (SMPL-H FEMALE, SMPL-X neutral 2020 y FLAME 2020), que deben descargarse por separado y no se incluyen en el repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada: ni la model card ni la búsqueda web incluyen métricas de otros sistemas. En la literatura del área los referentes habituales son los generadores de gestos co-hablados y de expresión holística, como EMAGE, DiffSHEG o TalkSHOW, pero no se ha recuperado ninguna especificación ni resultado de ellos en esta búsqueda, por lo que se marcan como no disponibles.

| Modelo | Categoría | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ELLSA 2 (standalone generator) | Generación de gestos y expresiones co-hablados en streaming causal | no disponible | bloques de 0,8 s; 300 fotogramas de gesto y 240 de expresión | no publicado | no disponible | HuggingFace `tsinghua-ee/ELLSA2` |
| EMAGE | Generación holística de gestos co-hablados (referencia orientativa) | no disponible | no disponible | no disponible | no disponible | no disponible |
| DiffSHEG | Generación holística de expresión y gesto por difusión (referencia orientativa) | no disponible | no disponible | no disponible | no disponible | no disponible |
| TalkSHOW | Generación de cuerpo, cara y manos a partir de habla (referencia orientativa) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia del paquete no declarada: la model card no indica licencia, lo que impide determinar si el uso comercial de los checkpoints está permitido.
- Dependencia de activos con licencia restrictiva: SMPL-H, SMPL-X y FLAME 2020 no se incluyen en el repositorio y sus licencias académicas restringen la redistribución y, en la práctica, el uso comercial; los pesos de KaoLRM mono se distribuyen bajo CC BY-NC 4.0, que prohíbe el uso comercial.
- Idioma limitado: la etiqueta de idioma es únicamente inglés; no hay evidencia de soporte para otras lenguas ni de evaluación multilingüe.
- Sin benchmarks publicados: no existen métricas objetivas ni evaluaciones subjetivas que permitan estimar la calidad de los gestos o de las expresiones frente a alternativas.
- Reproducibilidad parcial: la receta de dos etapas publicada entrena un modelo compatible, pero no reproduce exactamente los pesos distribuidos, porque el generador original pasó por una etapa intermedia solo de gesto.
- Límite temporal de generación: las caps de 300 fotogramas para gesto y 240 para expresión/boca restringen la salida a unos 10 y 8 segundos respectivamente por rama RVQ, lo que condiciona secuencias largas.
- Contexto derecho cero: al no observar audio futuro, el modelo puede producir transiciones gestuales menos anticipadas que un generador offline; es una contrapartida deliberada del diseño de streaming.
- Sesgos: la model card no describe el corpus de entrenamiento ni su composición demográfica, por lo que no es posible caracterizar sesgos culturales, de género o de estilo gestual; en generación de movimiento es habitual además encontrar artefactos en manos, contactos e intersecciones corporales, aspecto no evaluado en la información disponible.
- Latencia y consumo no verificados: no hay cifras publicadas de VRAM, throughput ni latencia real, solo la granularidad de bloque de 0,8 s.
- Requisitos de integración: el uso en producción exige montar el pipeline de audio alineado, el clip de estilo de 612 fotogramas y la conversión de los activos externos (por ejemplo, la conversión de FLAME 2020 con `scripts/convert_flame.py`), lo que añade complejidad operativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsinghua-ee/ELLSA2
- Guía de código e inferencia (ruta relativa del paquete): `../code/README.md`
- Guía de datos y preparación del inventario de entrenamiento (ruta relativa del paquete): `../data/README.md`
- Repositorio del autor en HuggingFace: https://huggingface.co/tsinghua-ee
- MANO / SMPL+H: https://mano.is.tue.mpg.de/
- Licencia de MANO / SMPL+H: https://mano.is.tue.mpg.de/license.html
- AMASS (modelos extendidos de espacio de formas): https://amass.is.tue.mpg.de/
- SMPL-X: https://smpl-x.is.tue.mpg.de/
- Licencia de SMPL-X: https://smpl-x.is.tue.mpg.de/modellicense.html
- FLAME: https://flame.is.tue.mpg.de/
- Licencia de FLAME: https://flame.is.tue.mpg.de/modellicense.html
- KaoLRM (CyberAgent AI Lab): https://github.com/CyberAgentAILab/KaoLRM
- Release mono de KaoLRM: https://github.com/CyberAgentAILab/KaoLRM/releases/tag/mono
- Universidad de Tsinghua: https://www.tsinghua.edu.cn/en/
- Paper o publicación asociada: no disponible en la información proporcionada.
