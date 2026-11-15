# YuCeong-May/Unified-TS-ASR

## Resumen

Unified-TS-ASR es una familia de checkpoints de investigación para reconocimiento automático del habla dirigido a un hablante objetivo (target-speaker ASR, TS-ASR) en mezclas de dos hablantes en mandarín. Lo desarrolla el autor YuCeong-May y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de transcribir únicamente al hablante designado dentro de una conversación solapada, usando como pista una secuencia de texto conocida del hablante objetivo, una locución de enrolamiento del mismo hablante, o ambas simultáneamente.

La arquitectura se basa en un backbone acústico Conformer entrenado con un objetivo CTC, sobre características de 80 filtros Mel a 16 kHz con ventanas de 25 ms y desplazamiento de 10 ms. El repositorio incluye variantes guiadas por texto, guiadas por enrolamiento y de doble pista, con distintos esquemas de muestreo de pistas negativas y cabezas auxiliares de clasificación de hablante.

Es relevante ahora porque unifica en una sola arquitectura de reconocimiento la información léxica (la pista de texto) y la información de identidad del hablante (el enrolamiento), algo que en la literatura de TS-ASR suele abordarse con sistemas separados. El repositorio tiene 1,6 GB y está pensado como material de revisión anónima, no como un paquete listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con encoder de pista de texto (`KeywordTransformerEncoderDae`) inyectado por cross-attention en `ConformerKceEncoderDae`; variantes con fusión por concatenación y fusión paralela |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana acústica no especificada; pista de texto de 2-5 caracteres chinos) |
| Tipos de cuantizacion | no disponible (checkpoints en `model.pt` de DeepSpeed, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | chino mandarín |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (estado DeepSpeed) más `config.yaml` por checkpoint; tokenizador `tokens_kws8408.json` y diccionario de segmentación `seg_dict_ext` |
| Frecuencia de muestreo | 16 kHz |
| Caracteristicas acusticas | 80 filterbanks, trama de 25 ms, desplazamiento de 10 ms |
| Tokenizador | tokenizador por caracteres con 8.408 entradas |
| Objetivo de entrenamiento | CTC |

## Arquitectura y entrenamiento

El modelo es un sistema de ASR tipo FunASR personalizado, no un checkpoint estándar de Transformers, por lo que no puede cargarse con `AutoModel.from_pretrained()`. El backbone acústico es un Conformer con salida CTC. La condicionalidad del hablante objetivo se implementa de tres formas según la variante: pista de texto codificada con `KeywordTransformerEncoderDae` e inyectada mediante cross-attention en `ConformerKceEncoderDae`; enrolamiento acústico con cross-attention directa sobre las características del enrolamiento (sin encoder de hablante preentrenado separado) o con reducción de tramas de enrolamiento (`enroll_lfr_m: 3`, `enroll_lfr_n: 3`); y embeddings de hablante CAM++ de 192 dimensiones con condicionamiento FiLM, que requieren un encoder de verificación de hablante chino congelado.

El repositorio incluye dos variantes de doble pista: `unified-ts-asr-concat`, que concatena las representaciones de ambas pistas antes de condicionar el encoder, y `unified-ts-asr-parallel`, que procesa las dos rutas de pista con fusión paralela. Las variantes de pista de texto exploran el muestreo de pistas negativas: `positive_prob: 0.7` (30 % de pistas negativas) y `positive_prob: 0.5` (50 % de pistas negativas), además de cabezas auxiliares de clasificación de hablante con pesos 0.1 y 0.5 y regularización de pesos 0.1 y 0.01. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO; el objetivo es CTC, lo que descarta un ajuste por preferencias en la fase descrita.

## Capacidades

- Reconocimiento de habla dirigido a un hablante objetivo en mezclas de dos hablantes en mandarín.
- Condicionamiento por pista de texto: una secuencia contigua de 2 a 5 caracteres chinos presente en el enunciado del hablante objetivo.
- Condicionamiento por enrolamiento: una locución del hablante objetivo a 16 kHz.
- Condicionamiento dual: combinación de pista de texto y enrolamiento en una misma arquitectura.
- Selección de modo de evaluación en las variantes duales: solo texto, solo enrolamiento, ambas pistas o sin pista.
- Transcripción con tokenizador por caracteres de 8.408 entradas.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones con solapamiento de hablantes: dado un fragmento de texto conocido del participante de interés, el modelo aísla y transcribe solo su intervención, lo que resulta útil para actas focalizadas en un responsable concreto.
- Verificación de contenido publicitario o locuciones: si se conoce una frase que pronuncia el locutor objetivo, la pista de texto permite recuperar su intervención completa dentro de una mezcla con música u otra voz.
- Indexación de archivos de audio de centros de contacto: con un enrolamiento del agente, el sistema puede separar y transcribir únicamente sus turnos para auditoría de calidad, sin transcribir al cliente.
- Análisis de debates y entrevistas: la variante dual permite usar el nombre del participante como pista de texto y un clip de su voz como enrolamiento, aumentando la robustez en tramos donde el texto no aparece.
- Investigación en separación de hablantes: los checkpoints con muestreo de pistas negativas (`positive_prob: 0.5` y `0.7`) sirven para estudiar la robustez del condicionamiento cuando la pista no está presente en la mezcla.
- Evaluación comparativa de estrategias de condicionamiento: las variantes con cabeza auxiliar de hablante y regularización permiten medir el efecto de la supervisión de identidad sobre la tasa de error de caracteres.
- Prototipado de subtitulado selectivo: en retransmisiones con dos voces, el modelo puede generar subtítulos solo del presentador usando su enrolamiento, reduciendo el ruido de transcripción del resto de participantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia un conjunto de evaluación propio, el Unified TS-ASR Evaluation Set, sin cifras de WER/CER ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 1,6 GB, pero ese tamaño agrega todos los checkpoints y no permite derivar la VRAM de una variante concreta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo Conformer de ASR, es plausible que quepa en GPUs de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La reconstrucción requiere las clases personalizadas del repositorio de código (modelo, encoder de pista, encoder Conformer, frontend, tokenizador y dataset) y el emparejamiento estricto de `config.yaml`, `model.pt`, `tokens_kws8408.json` y `seg_dict_ext`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Contexto / pista | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unified-TS-ASR | TS-ASR en mezclas de dos hablantes (mandarín) | Conformer + CTC con pista de texto, enrolamiento o ambas | Pista de texto de 2-5 caracteres; audio a 16 kHz | Apache 2.0 | Checkpoints de investigación en HF, carga mediante código propio |
| Whisper (variantes multilingües) | ASR general | Transformer encoder-decoder | Ventana de 30 s por segmento | MIT | Pesos Transformers, ecosistema amplio |
| Modelos de diarización + ASR en cascada | Separación y transcripción por hablante | Pipeline de dos etapas | Depende de los componentes | Variable | Maduro en producción |

No se dispone de datos de rendimiento comparativo entre Unified-TS-ASR y estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo admite chino mandarín; no hay soporte multilingüe documentado.
- Diseñado para mezclas de exactamente dos hablantes; el comportamiento con más hablantes no está descrito.
- La pista de texto debe ser una secuencia contigua de 2 a 5 caracteres presente en el enunciado del objetivo; pistas más largas o ausentes pueden degradar el condicionamiento.
- La variante CAM++ requiere un encoder de verificación de hablante chino congelado de 192 dimensiones cuya ruta de inicialización es local al proyecto original y debe aportarse por separado.
- Los archivos YAML contienen rutas de solo entrenamiento (manifiestos locales, ajustes de DeepSpeed, ruta de inicialización de CAM++) que deben sustituirse en un entorno nuevo.
- No es un checkpoint de Transformers: no funciona con `AutoModel.from_pretrained()` ni con herramientas estándar de despliegue.
- El repositorio está publicado para revisión anónima de doble ciego; la model card pide no usar ni citar mirrors no anónimos durante ese proceso.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Aunque la licencia es Apache 2.0, el estado de investigación de los checkpoints y la dependencia de código personalizado desaconsejan su uso directo en producción sin una validación propia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YuCeong-May/Unified-TS-ASR)
- [Checkpoints (página anónima de revisión)](https://anonymous-hf.com/a/x3aljjy7y3vi/)
- [Conjunto de evaluación (página anónima de revisión)](https://anonymous-hf.com/a/fftzfmfq4pq3/)
- [Código (repositorio anónimo)](https://anonymous.4open.science/r/Unified-TS-ASR-3F35)
