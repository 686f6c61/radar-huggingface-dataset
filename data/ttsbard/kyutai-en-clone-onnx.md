# TTSBard/kyutai-en-clone-onnx

## Resumen

Kyutai English ONNX with WAV voice reference es un paquete de inferencia para síntesis de voz (text-to-speech) en inglés que empaqueta el checkpoint original de Kyutai Pocket TTS en formato ONNX, cuantizado parcialmente a INT8 y preparado para ejecutarse en CPU dentro de la aplicación TTSBard. Lo publica el usuario TTSBard como adaptación del modelo base `kyutai/pocket-tts`, del que incluye el checkpoint y el tokenizador originales sin modificaciones, junto con cinco grafos ONNX generados mediante herramientas derivadas de PocketTTS.cpp.

El modelo resuelve el problema de desplegar un TTS ligero y local sin GPU ni servicios en la nube, con capacidad de clonación de voz a partir de una referencia WAV de 24 kHz. Con 109.502.146 parámetros totales y un repositorio de 0,4 GB, está pensado para entornos de escritorio y aplicaciones de accesibilidad donde el coste por inferencia y la privacidad importan más que la expresividad de un TTS neuronal grande.

Es relevante ahora porque demuestra una ruta de exportación práctica de un modelo TTS de Kyutai a ONNX con cuantización INT8 del decodificador FlowLM y del códec Mimi, lo que reduce requisitos de hardware y facilita la integración en pipelines nativos. La licencia CC BY 4.0 permite uso comercial con atribución, y el paquete no incluye presets de voz: el usuario debe aportar su propia referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal basado en Kyutai Pocket TTS (FlowLM + codec Mimi), exportado a grafos ONNX |
| Parametros totales | 109.502.146 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 en FlowLM y decodificador Mimi; resto de grafos en precision original (segun model card) |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (5 grafos) + safetensors; checkpoint y tokenizador originales incluidos byte a byte |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: reproduce la arquitectura de Kyutai Pocket TTS, un sistema de síntesis de voz que combina un modelo de lenguaje de flujo (FlowLM) con el códec neuronal Mimi para generar audio a 24 kHz. TTSBard exportó cinco grafos ONNX mediante herramientas adaptadas de PocketTTS.cpp y aplicó cuantización INT8 al FlowLM y al decodificador Mimi, manteniendo el resto de componentes en su precision original. El runtime lee un tensor de condicionamiento de voz desde el checkpoint, lo que habilita la clonación a partir de una referencia WAV.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. La model card indica únicamente que el checkpoint y el tokenizador provienen de la revisión `db04f0e` del repositorio `kyutai/pocket-tts`, en la ruta `languages/english`, y que se incluyen sin alteraciones. Cualquier detalle sobre el preentrenamiento debe consultarse en la model card upstream de Kyutai.

## Capacidades

- Síntesis de voz en inglés a 24 kHz a partir de texto.
- Clonación de voz zero-shot mediante una referencia WAV proporcionada por el usuario.
- Ejecución local en CPU sin GPU, gracias a la exportación ONNX y a la cuantización INT8.
- Integración con la aplicación TTSBard mediante el descriptor de paquete y rutas locales.
- No incluye presets de voz: requiere una referencia externa con permisos de uso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Lectura de documentos en aplicaciones de escritorio: el modelo sintetiza texto en inglés en CPU, lo que permite integrarlo en lectores de PDF o EPUB sin depender de APIs externas ni de GPU.
- Accesibilidad para personas con discapacidad visual: al ejecutarse localmente y a 24 kHz, puede alimentar lectores de pantalla o sistemas de narración con latencia baja y sin enviar contenido sensible a la nube.
- Clonación de voz para contenido personal: un usuario puede aportar una grabación WAV propia y generar narraciones con su timbre para vídeos, pódcast o audiolibros, siempre que tenga derechos sobre la voz.
- Prototipado de asistentes conversacionales: el paquete ONNX se puede insertar en un pipeline de diálogo por turnos para generar respuestas habladas en inglés, con la ventaja de que el formato ONNX facilita el despliegue en entornos .NET o C++.
- Pruebas de integración continua de sistemas TTS: al ser un conjunto de grafos ONNX deterministas y ligeros (0,4 GB), sirve para validar pipelines de audio en CI sin hardware especializado.
- Investigación en cuantización de modelos de audio: la combinación de FlowLM y Mimi en INT8 permite estudiar el impacto de la cuantización en la calidad percibida de la voz frente al checkpoint original.
- Despliegue en dispositivos edge: con 109,5 millones de parámetros y ejecución en CPU, es viable en mini-PC, Raspberry Pi de gama alta o portátiles sin GPU dedicada para anuncios o avisos pregrabados dinámicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; el paquete está diseñado para ejecutarse sin GPU. En caso de forzar ejecución en GPU mediante ONNX Runtime, la huella estimada ronda 0,4-1 GB según el grafo y la precision.
- GPU recomendadas: no disponibles; el diseño apunta a CPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100) podría ejecutar los grafos, pero no se documenta soporte ni rendimiento.
- Cabe en GPU de consumo: sí, por tamaño, aunque el objetivo declarado es CPU.
- Opciones de despliegue: ONNX Runtime (librería declarada), aplicación TTSBard; también podría integrarse en otros runtimes compatibles con ONNX, aunque no está documentado.
- Latencia y throughput: no disponibles. La model card no proporciona métricas de RTF (real-time factor) ni de velocidad de síntesis.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| TTSBard/kyutai-en-clone-onnx | 109.502.146 | no disponible | en | CC BY 4.0 | ONNX + safetensors | Clonación por referencia WAV, CPU, INT8 parcial |
| kyutai/pocket-tts (base) | no disponible | no disponible | varios (incluye en) | consultar model card upstream | safetensors | Checkpoint original de Kyutai; sin cuantizar |
| Alternativas TTS ligeras (p. ej. Piper, Kokoro) | no disponible | no disponible | varios | variable | ONNX | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran otros idiomas.
- No incluye presets de voz: el usuario debe aportar una referencia WAV con permisos de uso, lo que traslada la responsabilidad legal sobre la voz clonada.
- La cuantización INT8 del FlowLM y del decodificador Mimi puede degradar la calidad acústica frente al checkpoint original; no se documenta una evaluación objetiva de esta pérdida.
- Riesgo de alucinación o artefactos en la síntesis ante texto fuera de distribución, puntuación atípica o entradas muy largas; no se especifica el límite de longitud de texto.
- No se documentan sesgos demográficos ni acústicos del modelo base; deben consultarse en la model card de Kyutai.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero es obligatorio citar autoría y cambios. Además, deben respetarse los términos del modelo upstream de Kyutai.
- El paquete está atado a la aplicación TTSBard y a una ruta de instalación concreta (`models/pocket/kyutai-en-clone`); su uso fuera de ese entorno requiere trabajo de integración adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se dispone de información sobre latencia, throughput ni calidad MOS, lo que dificulta evaluar su idoneidad para producción en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TTSBard/kyutai-en-clone-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Checkpoint original (revisión db04f0e): https://huggingface.co/kyutai/pocket-tts/tree/db04f0e653473e5c7333c69686ac92b7460b0c1d/languages/english
- Repositorio TTSBard: https://github.com/ttsbard/TTSBard
- Herramientas de exportación PocketTTS.cpp: https://github.com/VolgaGerm/PocketTTS.cpp
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
