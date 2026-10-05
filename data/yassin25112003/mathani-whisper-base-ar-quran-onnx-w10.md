# Yassin25112003/mathani-whisper-base-ar-quran-onnx-w10

## Resumen

mathani-whisper-base-ar-quran-onnx-w10 es una exportación a ONNX del modelo tarteel-ai/whisper-base-ar-quran, un fine-tuning de OpenAI Whisper base especializado en reconocimiento de voz sobre recitación coránica en árabe. Lo publica el usuario Yassin25112003 y su propósito declarado es el uso del modelo directamente en el navegador, mediante una ventana de audio fija de 10 segundos y pesos en fp32. El modelo original pertenece a Tarteel AI y se distribuye bajo licencia Apache-2.0.

Técnicamente se trata de un transformer encoder-decoder de tipo Whisper en su variante "base", con aproximadamente 74 millones de parámetros, adaptado al dominio del árabe coránico (texto con vocalización completa y reglas de recitación). La aportación de esta ficha concreta no es un nuevo entrenamiento, sino el empaquetado: conversión a formato ONNX, ajuste de la ventana de entrada a 10 segundos y tamaño de repositorio de 0,3 GB, lo que lo hace desplegable con ONNX Runtime, incluida su variante Web.

Su relevancia es práctica: permite integrar transcripción de recitación coránica en aplicaciones web o de escritorio sin backend y sin GPU, algo poco habitual en el ecosistema ASR en árabe. A cambio, el repositorio no incluye model card detallada, no declara idiomas soportados, no publica métricas de evaluación propias y no registra descargas ni interacciones, por lo que debe considerarse un artefacto derivado y no un modelo evaluado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, variante base) exportado a ONNX |
| Parametros totales | ~74 millones (heredados de Whisper base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | ventana de audio de 10 segundos en esta exportacion; Whisper base nativo procesa ventanas de 30 segundos |
| Tipos de cuantizacion | no disponible; la exportacion declarada es fp32 (la etiqueta de HuggingFace indica version cuantizada del modelo base) |
| Idiomas soportados | no disponible en la model card; el modelo base esta especializado en arabe coranico |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (fp32) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | tarteel-ai/whisper-base-ar-quran |
| Autor de la exportacion | Yassin25112003 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder transformer que consume un espectrograma mel logaritmico y un decoder autorregresivo que genera tokens de texto, con normalizacion pre-LayerNorm, atencion multi-cabeza y embeddings sinusoidales. En la variante base, Whisper emplea 6 capas de encoder y 6 de decoder con dimension de modelo 512, lo que da lugar a los aproximadamente 74 millones de parametros. La ventana nativa de Whisper es de 30 segundos (1500 frames); esta exportacion la reduce a 10 segundos, lo que implica un modelo ONNX con formas de entrada adaptadas y la necesidad de segmentar el audio antes de la inferencia.

No hay informacion disponible sobre el proceso de entrenamiento de esta exportacion, que en principio no entrena nada nuevo: es una conversion de pesos. Del modelo base tarteel-ai/whisper-base-ar-quran se sabe que es un fine-tuning de Whisper base sobre audio de recitacion coranica, pero la model card de esta exportacion no detalla el corpus, el numero de tokens de audio, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras); el unico cambio reseñable respecto al original es el formato ONNX y la ventana de 10 segundos.

## Capacidades

- Reconocimiento automatico de voz (ASR) sobre audio de recitacion coranica en arabe, con salida de texto vocalizado segun el fine-tuning original.
- Transcripcion por segmentos: al estar limitada a ventanas de 10 segundos, requiere troceado previo del audio y concatenacion de resultados.
- Ejecucion en navegador y en CPU: al ser un modelo de 74 millones de parametros en ONNX, puede correr con ONNX Runtime Web (WASM o WebGPU) y con Transformers.js.
- Inferencia offline: al no depender de un backend, permite despliegues en local o en dispositivos sin conectividad.
- No hay evidencia de soporte de tool calling, function calling ni capacidades de agente; el modelo es exclusivamente ASR.
- No se documentan capacidades multilingues adicionales; el comportamiento fuera del dominio coranico no esta evaluado en la informacion disponible.
- No dispone de modo "thinking", vision, audio generativo ni ninguna otra capacidad multimodal; es exclusivamente audio a texto.

## Casos de uso

- Transcripcion de recitacion en aplicaciones web: integrado con Transformers.js u ONNX Runtime Web, el modelo puede transcribir fragmentos de 10 segundos directamente en el navegador, sin enviar audio a un servidor, lo que reduce costes y mejora la privacidad.
- Aplicaciones de memorizacion (hifz) y autoevaluacion: un estudiante recita un versiculo y la aplicacion compara la transcripcion con el texto canonico para detectar omisiones o errores, aprovechando la especializacion del fine-tuning en arabe coranico.
- Verificacion de recitacion en tiempo casi real: con ventanas de 10 segundos y un modelo de 74 millones de parametros, es viable un bucle de captura-segmentacion-inferencia en un portatil o incluso en un movil moderno, sin GPU dedicada.
- Generacion de subtitulos para videos de recitacion: se segmenta la pista de audio en bloques de 10 segundos, se transcribe cada bloque y se alinean los tiempos resultantes para producir subtitulos en formato SRT o VTT.
- Busqueda por audio en corpus de recitaciones: transcribir un archivo de audio y usar el texto resultante para localizar el pasaje correspondiente dentro de un corpus indexado, util en bibliotecas digitales de contenido coranico.
- Preprocesado para pipelines de NLP arabe: convertir grandes volumenes de audio en texto para despues aplicar analisis morfologico, busqueda o alineacion con traducciones, aprovechando que la licencia Apache-2.0 permite integrarlo en productos.
- Herramientas educativas sin backend para escuelas: al ser un modelo pequeno y en formato ONNX, puede distribuirse como parte de una aplicacion de escritorio o PWA que funcione en aulas con hardware modesto y conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportacion no incluye tasas de error (WER, CER) ni comparaciones con el modelo original en PyTorch, y no hay datos que permitan cuantificar la posible perdida de precision introducida por la conversion a ONNX o por la reduccion de la ventana a 10 segundos.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB. Los pesos en fp32 de un modelo de 74 millones de parametros ocupan aproximadamente 300 MB, a los que se suman las activaciones de la ventana de 10 segundos.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) puede ejecutarlo, pero es sobredimensionada para esta carga.
- Viabilidad en GPU consumer: si, y tambien en CPU. Es un modelo apto para portatiles, mini-PC y telefonos de gama media-alta mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), ONNX Runtime Web con WebAssembly o WebGPU, Transformers.js, y frameworks de aplicacion que acepten grafos ONNX. No aplica vLLM ni TGI, orientados a modelos generativos de texto.
- Latencia y throughput: no disponible. Dependera del hardware, del backend (WASM frente a WebGPU frente a CPU nativa) y del solapamiento entre ventanas de 10 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| mathani-whisper-base-ar-quran-onnx-w10 | ~74 M | 10 s (exportacion ONNX) | ONNX fp32 | Apache-2.0 | ASR de arabe coranico, orientado a navegador |
| tarteel-ai/whisper-base-ar-quran | ~74 M | 30 s (nativo Whisper) | safetensors / PyTorch | Apache-2.0 | ASR de arabe coranico, inferencia en servidor o GPU |
| openai/whisper-base | ~74 M | 30 s | safetensors / PyTorch | Apache-2.0 | ASR multilingue generico, sin especializacion |
| openai/whisper-small | ~244 M | 30 s | safetensors / PyTorch | Apache-2.0 | ASR multilingue generico, mayor capacidad pero mas coste |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada; la comparacion se limita a parametros, formato, ventana de entrada y licencia.

## Limitaciones y advertencias

- Dominio muy restringido: el fine-tuning esta orientado a recitacion coranica. El rendimiento en arabe conversacional, dialectal o en otros idiomas no esta documentado y previsiblemente sera inferior al de Whisper base sin ajustar.
- Ventana de 10 segundos: obliga a segmentar el audio y a gestionar los cortes entre fragmentos, lo que puede producir perdida de palabras en las fronteras y complica la transcripcion de recitaciones con pausas largas.
- Riesgo de alucinacion: los modelos de la familia Whisper tienden a generar texto plausible en tramos de silencio, ruido o audio musical. En contenido religioso, un error de este tipo es especialmente sensible y exige revision humana.
- Ausencia de evaluacion: no hay WER, CER ni ninguna metrica publicada para esta exportacion, ni comparacion con el modelo original en PyTorch. La conversion a ONNX y la reduccion de ventana pueden degradar ligeramente los resultados.
- Idiomas no declarados: la model card no especifica el conjunto de idiomas soportados, lo que dificulta planificar despliegues multilingues.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, sin garantia de mantenimiento, versionado ni soporte por parte del autor.
- Sesgos: no hay informacion disponible sobre sesgos en el corpus de entrenamiento, variedades de recitacion cubiertas (escuelas de tajwid) o representacion de recitadores.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero exige conservar los avisos de copyright y atribuir tanto a Tarteel AI como a OpenAI Whisper segun corresponda. Conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Verificacion de integridad: al ser un artefacto de un tercero, se recomienda validar el grafo ONNX y los resultados frente al modelo original antes de integrarlo en un sistema critico.

## Enlaces

- Repositorio de la exportacion: https://huggingface.co/Yassin25112003/mathani-whisper-base-ar-quran-onnx-w10
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Pesos de Whisper base en HuggingFace: https://huggingface.co/openai/whisper-base
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Transformers.js: https://huggingface.co/docs/transformers.js
- Tarteel AI: https://www.tarteel.ai/
