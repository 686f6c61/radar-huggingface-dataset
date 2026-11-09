# zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por ornith-ai, del que esta ficha describe la cuantización GGUF publicada por el usuario zephel01. El modelo base cuenta con 402.941.918.464 parámetros totales (aproximadamente 403B) y emplea 512 expertos enrutados, de los cuales activa 10 por token más un experto compartido. Esta cuantización concreta, denominada IQ2_XXS-32G128G, está diseñada específicamente para ejecutarse en un equipo con una GPU de 32 GB de VRAM y 128 GB de RAM, sin lecturas desde el SSD durante la generación.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo de casi 400B parámetros en hardware de consumo de gama alta (por ejemplo, una RTX 5090), algo impensable con los pesos en BF16 (que ocuparían unos 800 GB). Para lograrlo, el autor aplica una receta de cuantización mixta: los expertos enrutados se cuantizan a IQ2_XXS con una importance matrix (imatrix), mientras que las proyecciones de atención, delta-net y los expertos compartidos se mantienen en Q8_0. El resultado es un archivo de 114,2 GB dividido en tres shards.

El modelo está pensado para generación de texto conversacional, con soporte declarado de inglés y japonés, licencia MIT y compatibilidad con motores como Abyss (versión 1.3.122 o superior) y llama.cpp. Se trata de una publicación en estado BETA, medida en un único equipo, por lo que el autor solicita reportes de otras configuraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), etiquetada como qwen35moe; incluye bloque NextN (MTP) en `blk.60` |
| Parametros totales | 402.941.918.464 (aprox. 403B) |
| Parametros activos | 10 expertos enrutados por token + 1 experto compartido (de 512 expertos totales); número exacto de parámetros activos no disponible |
| Longitud de contexto | 32.768 tokens en las pruebas del autor; contexto máximo nativo no disponible |
| Tipos de cuantizacion | Expertos enrutados IQ2_XXS con imatrix; atención, delta-net y expertos compartidos Q8_0; bloque NextN (MTP) Q4_K |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, generados con `llama-gguf-split`) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer con arquitectura Mixture-of-Experts: 512 expertos en total, de los que se enrutan 10 por token además de un experto compartido. La etiqueta `qwen35moe` sugiere una arquitectura de la familia Qwen 3.5 MoE, aunque no se detalla en la documentación proporcionada. El modelo incluye proyecciones denominadas "delta-net" y un bloque NextN (MTP, multi-token prediction) en la capa `blk.60`, que se conserva a Q4_K para que los motores puedan usarlo como drafter en decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones de entrenamiento. Lo que sí está documentado es el proceso de cuantización: los expertos enrutados se cuantizan a IQ2_XXS con una importance matrix, mientras que las partes sensibles (atención, delta-net, expertos compartidos) se mantienen en Q8_0 para preservar calidad. La calidad se midió con `llama-perplexity --kl-divergence` contra el GGUF Q8_0 de referencia sobre 8 chunks de 1024 tokens de texto inglés y japonés reservado: KL medio de 0,1655, KL al 99% de 1,11, 79,1% de coincidencia en el token top y perplejidad de 12,93 (frente a 12,30 del Q8_0).

## Capacidades

- Generación de texto conversacional multi-turno: las pruebas del autor incluyen una conversación de 11 turnos.
- Razonamiento y aritmética: se evaluó aritmética en japonés, con la advertencia de que las respuestas pueden apoyarse en fórmulas más que en prosa.
- Generación de código: se probaron tres tareas de programación con tests, incluyendo generación de HTML y código con caracteres hiragana.
- Tool calling / function calling: se incluye una prueba específica de llamada a herramienta en el conjunto de verificación.
- Recuperación de información en contexto largo: se validaron needles a 8K, 24K y 31K tokens, con acierto en el needle de 31K.
- Multilingüismo limitado a inglés y japonés según la model card.
- Decodificación especulativa mediante el bloque NextN (MTP) incluido en el archivo, con una tasa de borradores aceptados del 79% en las pruebas del autor.
- Modo thinking desactivable: las mediciones de velocidad se realizaron con thinking off.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local en japonés e inglés: el modelo puede mantener conversaciones multi-turno (se validaron 11 turnos) con hasta 32K tokens de contexto, adecuado para usuarios que necesitan privacidad total sin depender de APIs en la nube.
- Generación de código en local: las pruebas incluyen tareas de programación con tests y generación de HTML; puede integrarse en flujos de trabajo de desarrollo donde el código no deba salir del equipo.
- Automatización con tool calling: la verificación incluye una llamada a herramienta, lo que permite construir agentes sencillos que invoquen funciones externas en un entorno local.
- Análisis de documentos largos en inglés o japonés: con 32K tokens de contexto y recuperación validada a 31K, es apto para resumir o extraer información de informes, contratos o documentación técnica extensa.
- Experimentación e investigación en cuantización extrema: este archivo sirve como referencia para estudiar el compromiso calidad/tamaño en MoE de gran escala (KL de 0,1655 contra Q8_0), útil para investigadores que evalúan técnicas de cuantización mixta con imatrix.
- Despliegue en estaciones de trabajo con RTX 5090: un equipo con 32 GB de VRAM y 128 GB de RAM puede ejecutar el modelo completo sin acceso a disco durante la generación (0 ms de espera de SSD por token), lo que lo hace viable para prototipos y demos en local.
- Procesamiento por lotes de texto en japonés: tareas de traducción, reescritura o clasificación donde el throughput de prompt (386 tok/s a 2K y 882 tok/s a 8K) sea suficiente para volúmenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son las mediciones del autor en un equipo concreto:

| Metrica | Resultado (RTX 5090 32 GB + 123 GB RAM, Abyss v1.3.122) |
|---|---|
| Decodificacion (media de 3 respuestas x 256 tokens, greedy, thinking off) | 42,0 tok/s (codigo 43,2 / prosa 38,8 / HTML 43,9) |
| Borradores NextN aceptados | 79% (sin drafter: ~37,8 tok/s estimados por el motor) |
| Prompt a 2K tokens | 386 tok/s |
| Prompt a 8K tokens | 882 tok/s |
| Prompt a 24K tokens | 1.553 tok/s |
| Espera de SSD por token | 0 ms |
| Mediana de decodificacion en `--check` | 40,0 tok/s |
| Verificacion `--check` (11 pasos, 3 ejecuciones) | 10/11, 10/11, 11/11 |

| Calidad (KL contra Q8_0, 8 chunks de 1024 tokens) | Valor |
|---|---|
| KL medio | 0,1655 |
| KL al 99% | 1,11 |
| Coincidencia token top | 79,1% |
| Perplejidad | 12,93 (Q8_0: 12,30) |

## Requisitos de hardware

- VRAM estimada: 32 GB de GPU para el objetivo declarado; el archivo completo ocupa 114,2 GB y el resto reside en RAM del sistema.
- RAM necesaria: 128 GB recomendados; con 96 GB parte del archivo se leería del SSD en cada token, con degradación de velocidad no medida.
- GPU recomendadas: RTX 5090 (32 GB) validada por el autor; cualquier GPU con 32 GB de VRAM debería encajar en el mismo perfil.
- Cabe en GPU de consumo: sí, en una RTX 5090 (32 GB), combinada con 128 GB de RAM.
- Opciones de despliegue: Abyss v1.3.122 o superior (motor de referencia, con soporte de NextN drafter y CPU offload); llama.cpp (commit `ac8e1694d`) carga los tres shards y responde correctamente, aunque solo se verificó la carga, no la velocidad.
- Latencia y throughput: 42,0 tok/s de decodificación y 386–1.553 tok/s de prompt según longitud, en el equipo de referencia. El autor advierte que un escritorio con DDR5 de doble canal será más lento en el cálculo de expertos en CPU que su equipo con LPDDR5X, y que una GPU que además gestione la pantalla dispone de 1–2 GB menos para el modelo.
- Almacenamiento: NVMe con 3,7 GB/s medidos en el equipo de prueba; el modelo no lee del SSD durante la generación si cabe en VRAM+RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-397B IQ2_XXS (este repo) | ~403B totales, 10 expertos activos | 32K validados | MIT | GGUF (114,2 GB) | Objetivo 32 GB VRAM + 128 GB RAM |
| Ornith-1.5-122B IQ3_XXS | 122B | no disponible | MIT | GGUF (52,1 GB) | Objetivo 16 GB VRAM + 64 GB RAM |
| Ornith-1.5-122B IQ4_XS | 122B | no disponible | MIT | GGUF (68,9 GB) | Objetivo 24–32 GB VRAM + 64 GB RAM, mayor calidad que IQ3_XXS |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos frente a alternativas de otros desarrolladores. La comparación disponible se limita a la propia familia Ornith-1.5 y a los perfiles de hardware objetivo.

## Limitaciones y advertencias

- Estado BETA: las mediciones provienen de un único equipo y el autor solicita reportes de otras configuraciones; el rendimiento en hardware distinto puede diferir sustancialmente.
- No determinismo: en Abyss, los primeros tokens de una respuesta pueden variar entre ejecuciones idénticas en modo greedy, porque la vía de CPU calcula los expertos con un redondeo ligeramente distinto al de la GPU y la asignación de expertos cambia en cada token. El modelo es sensible a este efecto.
- Fallos ocasionales en tareas: en las pruebas `--check`, una de cada tres ejecuciones falló un paso (una tarea de código con hiragana y una respuesta aritmética en japonés con solo un 44% de contenido en japonés). Qué paso falla varía entre ejecuciones.
- Calidad de cuantización: la perplejidad es de 12,93 frente a 12,30 del Q8_0 de referencia, con un 79,1% de coincidencia en el token top; no es equivalente al modelo sin cuantizar.
- Idiomas: solo inglés y japonés declarados; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: el máximo validado es de 32.768 tokens; no se documenta la ventana nativa del modelo base ni su comportamiento más allá de esa longitud.
- Requisito de motor: necesita Abyss v1.3.122 o superior; versiones anteriores se niegan a cargar el archivo por el enrutado de 10 expertos por token.
- Hardware justo: con 96 GB de RAM el modelo lee del SSD en cada token y la velocidad cae; no se ha medido cuánto.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni evaluaciones específicas de alucinación en la información disponible.
- Licencia MIT: permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar las condiciones del modelo base ornith-ai/Ornith-1.5-397B.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-397B
- Motor Abyss: https://github.com/zephel01/Abyss
- Issues de Abyss (reportes de rendimiento): https://github.com/zephel01/Abyss/issues
- Cuantización hermana Ornith-1.5-122B IQ3_XXS (16G64G): https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Cuantización hermana Ornith-1.5-122B IQ4_XS (24G64G): https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
