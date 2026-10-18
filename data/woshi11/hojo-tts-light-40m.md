# woshi11/Hojo-TTS-Light-40M

## Resumen

Hojo-TTS-Light-40M es un sistema de síntesis de voz (text-to-speech) publicado en HuggingFace por el usuario woshi11 bajo el paraguas del proyecto HojoAI. Se distribuye exclusivamente en formato ONNX, dividido en tres grafos independientes: un módulo principal de tipo LLM (`llm.onnx`, 31,34 M de parámetros en bf16), un módulo intermedio denominado `fine_local.onnx` (13,30 M, bf16) y un decodificador de audio (`decoder.onnx`, 30,91 M, fp32). El conjunto suma aproximadamente 75,5 M de parámetros y unos 205 MB de pesos, lo que lo sitúa en la categoría de TTS ligero orientado a inferencia en CPU o en hardware de gama baja.

El modelo cubre dos idiomas, inglés y chino, y ofrece un conjunto cerrado de 15 voces preentrenadas (dos femeninas en chino, ocho femeninas en inglés y cinco masculinas en inglés) identificadas mediante IDs opacos almacenados en un fichero `voice.npz`. No se documenta clonación de voz, control de estilo ni emoción; el enfoque es el de un sintetizador con voces fijas y huella de memoria reducida.

Su relevancia práctica está en el nicho de despliegue local y embebido: al publicarse como ONNX con licencia Apache-2.0, puede integrarse en aplicaciones de escritorio, móviles o servicios sin depender de GPUs ni de APIs externas. Ahora bien, la información publicada es muy escasa: no hay model card técnica, no hay pipeline declarado, no hay resultados de evaluación y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS multi-componente en ONNX (modulo LLM + modulo `fine_local` + decodificador de audio); la etiqueta del repositorio incluye `qwen3`, lo que sugiere un backbone derivado de la familia Qwen3, aunque la model card no lo detalla |
| Parametros totales | ~75,54 M en total: 31.337.600 (`llm.onnx`) + 13.296.256 (`fine_local.onnx`) + 30.910.594 (`decoder.onnx`) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bf16 (`llm`, `fine_local`) y fp32 (`decoder`) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (tres ficheros) + `Hojo-TTS-Light-40M-voice.npz` para los embeddings de voz |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Lo único verificable es la descomposición en tres grafos ONNX con recuentos de parámetros y tipos de dato explícitos: un módulo principal de 31,34 M de parámetros en bf16 (~61 MB), un módulo `fine_local` de 13,30 M en bf16 (~26 MB) y un decodificador de 30,91 M en fp32 (~118 MB). La etiqueta `qwen3` del repositorio apunta a que el módulo principal deriva de la arquitectura Qwen3 a escala muy reducida, pero se trata de una inferencia a partir del metadato, no de una afirmación del autor.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, idioma de los datos, uso de RLHF/DPO, ni sobre la técnica de síntesis empleada (no se confirma si el decodificador es un vocoder neuronal, un modelo tipo flow-matching o un decoder autorregresivo de tokens de audio). Tampoco se documenta la procedencia de las 15 voces incluidas ni si los embeddings de voz son aprendidos, destilados o derivados de grabaciones. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, destilación) sería especulativa y no se incluye aquí.

## Capacidades

- Síntesis de voz a partir de texto en inglés y chino, con salida de audio generada por el decodificador ONNX.
- Quince voces preentrenadas identificadas por ID: `hojo_zh_f_01`, `hojo_zh_f_02` (chino, femeninas); `hojo_en_f_01` a `hojo_en_f_08` (inglés, femeninas); `hojo_en_m_01` a `hojo_en_m_05` (inglés, masculinas).
- Selección de voz mediante el fichero `voice.npz`, que actúa como tabla de embeddings de hablante.
- Inferencia portable: al estar en ONNX, puede ejecutarse con ONNX Runtime en CPU, GPU o aceleradores compatibles sin dependencias de frameworks de deep learning pesados.
- Huella de disco reducida (~0,2 GB de repositorio), adecuada para aplicaciones que deben empaquetar el modelo junto al binario.
- No se documentan: clonación de voz, control de prosodia o emoción, ajuste de velocidad/pitch, salida de marcas de tiempo, streaming, tool calling ni ninguna capacidad ajena a la síntesis de voz.

## Casos de uso

- Lectura de artículos y documentación en inglés o chino dentro de aplicaciones de escritorio: el tamaño de ~205 MB de pesos permite empaquetar el modelo en el instalador y sintetizar en local sin llamadas a servicios externos.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o extensiones de navegador que conviertan texto seleccionado en audio, usando las voces inglesas o chinas según el contenido.
- Asistentes de voz y IVR de prototipo: generación de avisos y respuestas pregrabadas en inglés/chino para flujos de atención telefónica, con la ventaja de que la síntesis puede ejecutarse en el propio servidor de telefonía sin GPU.
- Pre-generación de narración para vídeos y pódcast: conversión por lotes de guiones a audio con una voz consistente, almacenando los ficheros resultantes como caché para evitar síntesis en tiempo real.
- Aprendizaje de idiomas: reproducción de frases en inglés o chino con distintas voces (masculinas y femeninas) para practicar comprensión auditiva, al no requerir conexión ni coste por carácter.
- Dispositivos embebidos y edge computing: despliegue en Raspberry Pi u otros equipos ARM mediante ONNX Runtime para dar feedback hablado a electrodomésticos, kioscos o robots, donde el presupuesto de memoria es de cientos de megabytes.
- Pruebas de regresión en pipelines de CI: generación determinista de audio de referencia para verificar que una actualización del runtime no altera la salida del sintetizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de síntesis (MOS, CMOS, WER de ASR sobre el audio generado), ni comparaciones objetivas, ni latencias medidas. Tampoco se han publicado resultados de benchmarks en la informacion disponible en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos suman ~205 MB (61 MB + 26 MB + 118 MB); el resto corresponde a activaciones y buffers de ONNX Runtime, cuyo tamaño exacto no está documentado.
- Memoria RAM: un despliegue en CPU requiere previsiblemente menos de 1 GB en reposo, aunque esta cifra es una estimación a partir del tamaño de los pesos y no un dato publicado.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer con 2 GB o más de memoria (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es sobradamente suficiente; el modelo está claramente orientado a CPU.
- Cabe en GPU consumer: sí, con margen amplio, y también en CPU de portátil y en placas tipo Raspberry Pi (sujeto a que el runtime ONNX esté disponible para la arquitectura).
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JS/WASM), ejecución en navegador vía onnxruntime-web si el tamaño lo permite, o integración en servidores propios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real (RTF) ni de caracteres por segundo en ningún hardware.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos dentro de la informacion proporcionada, por lo que las celdas no respaldadas se marcan como no disponibles. La comparación se limita a atributos cualitativos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Datos verificados |
|---|---|---|---|---|---|---|
| Hojo-TTS-Light-40M | ~75,5 M (suma de 3 componentes) | no disponible | en, zh | apache-2.0 | ONNX | Si (recuento de parametros por fichero) |
| Kokoro (variantes ~80 M) | no disponible | no disponible | no disponible | no disponible | ONNX | No verificado en esta busqueda |
| Piper (VITS) | no disponible | no disponible | no disponible | no disponible | ONNX | No verificado en esta busqueda |

No hay datos de benchmarks que permitan comparar calidad de síntesis, naturalidad ni latencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay MOS, WER ni ninguna métrica publicada; la calidad de la síntesis no puede estimarse a priori.
- Idiomas limitados a inglés y chino; no hay soporte declarado de castellano ni de otras lenguas, pese a que la licencia permitiría entrenar o adaptar variantes.
- Reparto de voces desequilibrado: el chino solo dispone de dos voces, ambas femeninas; el inglés concentra las trece restantes.
- IDs de voz opacos: no se documenta qué registro, estilo o procedencia tiene cada voz, lo que dificulta elegir la adecuada sin escuchar muestras.
- Sin información sobre los datos de entrenamiento: se desconoce si el corpus tiene sesgos de género, acento, registro o dominio, y no se puede auditar su procedencia.
- Riesgo de errores de pronunciación en números, siglas, nombres propios y puntuación, habitual en TTS sin normalización de texto documentada; la model card no menciona ningún módulo de normalización.
- No se documenta clonación de voz ni control de prosodia, por lo que no sirve para casos que requieran una voz concreta del cliente.
- Licencia Apache-2.0: permisiva para uso comercial y modificación, pero no cubre los derechos sobre las grabaciones que puedan subyacer a los embeddings de voz, cuya procedencia no se declara; conviene revisar este punto antes de un uso comercial.
- Repositorio sin tracción ni mantenimiento verificable: 0 descargas, 0 likes, sin pipeline declarado y con fecha de creación y actualización idénticas, lo que sugiere una publicación única sin seguimiento.
- Discrepancia de nomenclatura: el nombre indica "40M" pero la suma de parámetros publicada es de ~75,5 M; conviene usar la tabla de parámetros como referencia, no el nombre.

## Enlaces

- HuggingFace: https://huggingface.co/woshi11/Hojo-TTS-Light-40M
- Repositorio GitHub con instrucciones de uso: https://github.com/HojoAI/Hojo-TTS-Light/tree/main/Hojo-TTS-Light-40M
- Paper, blog, demo o dataset: no disponibles en la informacion proporcionada.
