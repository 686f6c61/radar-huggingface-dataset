# veripazari/seda-tts-v0.1

## Resumen

seda-tts-v0.1 es un modelo de síntesis de voz (text-to-speech) en turco, ligero y de baja latencia, desarrollado originalmente por el usuario atasoglu y reempaquetado por veripazari bajo la licencia Apache 2.0. Se trata de un modelo VITS de tamano "medium" (el mismo que usa el ecosistema Piper) que incorpora un codificador de texto BERT turco congelado y se distribuye exclusivamente en formato ONNX para su ejecucion con onnxruntime, sin dependencia de PyTorch.

El modelo resuelve el problema de generar voz natural en turco con control emocional explicito sobre hardware modesto: funciona en un unico hilo de CPU, empieza a emitir audio en 80-150 ms y sintetiza aproximadamente 4,5 veces mas rapido que tiempo real. Ademas de la emocion inferida del propio texto, permite fijar manualmente una de ocho emociones y ofrece un estilo de susurro independiente.

Su relevancia actual radica en la combinacion de tamano reducido (19,1 M de parametros en el modelo acustico y vocoder, mas 29,3 M del BERT congelado, con 194 MB en fp32 ONNX), licencia permisiva y soporte de sintesis por trozos (streaming de decodificacion), lo que lo hace apto para asistentes de voz, sistemas de accesibilidad y despliegues en el borde sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper "medium") con codificador de texto BERT turco congelado |
| Parametros totales | 19,1 M (acustico + vocoder) + 29,3 M (BERT congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; limite practico de 120 caracteres por sintesis |
| Tipos de cuantizacion | fp32 ONNX (unico formato publicado) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |
| Frecuencia de muestreo | 22050 Hz, mono |
| Tamano del repositorio | 0,2 GB |
| Emociones | 8 (incluye happy, sad, angry, fearful, surprised, neutral, calm) |
| Estilos | normal y whisper |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un modelo generativo de extremo a extremo que combina codificador de texto, alineamiento por monotonic alignment search, decodificador y vocoder en una sola red. En este caso el codificador de texto es un BERT turco congelado, lo que aporta representaciones linguisticas preentrenadas sin necesidad de reentrenarlo. El modelo se entreno desde cero sobre 80 horas de habla sintetica expresiva (el dataset referenciado es atasoglu/turkish-emotional-speech-100h), es decir, todas las locuciones de entrenamiento fueron generadas por IA y no proceden de hablantes reales.

La innovacion practica esta en el empaquetado: exportacion a ONNX fp32 y ejecucion con onnxruntime sin PyTorch, lo que reduce el peso del stack y permite correr en CPU. Aunque VITS no es un modelo de streaming nativo (necesita el texto completo antes de generar), la implementacion expone un metodo `stream` que decodifica por ventanas: el primer trozo contiene 0,28 s de audio y los siguientes 0,56 s, de modo que la reproduccion puede comenzar antes de completar la frase. La voz es sintetica por diseno, creada a partir de una descripcion textual con VoxCPM2, y el autor exige etiquetar los audios generados como producto de IA conforme al articulo 50 de la Ley de IA de la UE.

## Capacidades

- Sintesis de voz en turco a 22050 Hz mono, con salida float32 en el rango [-1, 1].
- Inferencia emocional automatica a partir del texto de entrada.
- Control manual de emocion entre 8 opciones (incluye happy, sad, angry, fearful, surprised, neutral y calm).
- Estilo de susurro (whisper) con ajustes propios, independiente del estilo normal.
- Sintesis por trozos mediante `stream`, con inicio de reproduccion antes de completar la frase.
- Ejecucion en un unico hilo de CPU con onnxruntime, sin PyTorch.
- Soporte de multiples hablantes segun los tags del modelo (multi-speaker), aunque el numero exacto de voces no se detalla.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico.
- Capacidad multilingue limitada al turco.

## Casos de uso

- Asistentes de voz en el borde: al ejecutarse en un solo hilo de CPU con 80-150 ms hasta el primer audio, puede integrarse en dispositivos sin GPU (Raspberry Pi, mini-PC, telefonos) para respuestas habladas de baja latencia.
- Lectura de notificaciones y alertas: la inferencia emocional permite que avisos de emergencia suenen con tono de miedo o sorpresa y que recordatorios neutros mantengan un tono informativo, sin configuracion manual.
- Accesibilidad para personas con discapacidad visual: lectura de textos en turco con voz sintetica ligera, desplegable localmente sin conexion y con coste de computo minimo.
- Audiolibros y contenido narrado: el control de emocion y el estilo de susurro permiten dar variedad expresiva a narraciones, aunque el limite de 120 caracteres por sintesis obliga a trocear el texto.
- Videojuegos y experiencias interactivas: dialogo de NPCs con emociones ajustadas por el guion (enfado, calma, miedo) y susurros para escenas de tension, con latencia compatible con respuestas en tiempo real.
- Sistemas de telefonia y IVR: sintesis en tiempo real (4,5x mas rapido que tiempo real) para mensajes de atencion telefonica en turco, con bajo consumo de CPU en servidores modestos.
- Prototipado de interfaces de voz: la instalacion via `pip install "sedalib[tts]"` y el uso directo con `Synthesizer.from_pretrained()` permiten integrar TTS en pocas lineas para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento aportados por el autor son operativos: primer audio en 80-150 ms, velocidad aproximada de 4,5x tiempo real en un hilo de CPU, primer trozo de streaming de 0,28 s y trozos posteriores de 0,56 s.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para CPU y no requiere GPU.
- GPU recomendadas: no disponibles ni necesarias; puede ejecutarse con onnxruntime en CPU.
- Cabe en cualquier CPU consumer moderna; el conjunto de pesos ONNX fp32 ocupa 194 MB y el repositorio completo 0,2 GB.
- Opciones de despliegue: onnxruntime a traves de la libreria sedalib (>= 1.4.0); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia: 80-150 ms hasta el primer audio; throughput aproximado de 4,5x tiempo real en un solo hilo.
- Memoria RAM: no disponible de forma explicita, pero coherente con un modelo de menos de 50 M de parametros y 194 MB de pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/limite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| seda-tts-v0.1 | 19,1 M + 29,3 M BERT | 120 caracteres por sintesis | Turco | Apache 2.0 | ONNX |
| Piper (voces estandar) | del orden de decenas de M (segun voz) | no disponible | Multiples | MIT (segun voces) | ONNX |
| VITS generico | variable | no disponible | Segun entrenamiento | Segun implementacion | PyTorch/ONNX |

No se dispone de datos de benchmarks que permitan comparar la calidad de sintesis frente a otras alternativas; la comparacion se limita a parametros, licencia y formato. Las cifras de Piper y VITS generico no estan confirmadas en la informacion proporcionada y deben tratarse como orientativas.

## Limitaciones y advertencias

- Solo soporta turco; no es util para otros idiomas.
- Limite practico de 120 caracteres por sintesis, lo que obliga a trocear textos largos.
- VITS no es streaming nativo: necesita el texto completo antes de generar; el streaming solo aplica a la decodificacion.
- Voz completamente sintetica generada por IA (VoxCPM2) a partir de una descripcion textual; no corresponde a ninguna persona real.
- Todas las locuciones de entrenamiento son sinteticas, lo que puede introducir artefactos o sesgos propios del generador usado.
- Riesgo de alucinacion acustica y de pronunciacion incorrecta en palabras poco frecuentes, nombres propios o extranjeros; no se documenta un lexico de pronunciacion.
- Obligacion legal de etiquetar los audios generados como producto de IA (articulo 50 de la Ley de IA de la UE), segun indica el propio autor.
- Licencia Apache 2.0 permisiva para uso comercial, pero el aviso de etiquetado de IA sigue aplicando en produccion.
- El repositorio es un reempaquetado por VeriPazari del modelo original de atasoglu; conviene verificar la version y el mantenimiento en el repositorio original.
- Sin datos publicados de calidad (MOS, WER de resintesis) ni de benchmarks, por lo que la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/veripazari/seda-tts-v0.1
- Modelo original: https://huggingface.co/atasoglu/seda-tts-v0.1
- Repositorio de la libreria sedalib: https://github.com/atasoglu/seda
- Dataset de referencia: https://huggingface.co/datasets/atasoglu/turkish-emotional-speech-100h
- Plataforma del reempaquetado: https://veripazari.com.tr
- Paper VITS (arXiv 2106.06103): https://arxiv.org/abs/2106.06103
- Paper referenciado (arXiv 2307.14134): https://arxiv.org/abs/2307.14134
- Ejemplos de audio: https://huggingface.co/veripazari/seda-tts-v0.1/resolve/main/samples/01-normal-happy.wav (y sucesivos 02 a 10 en la misma carpeta)
