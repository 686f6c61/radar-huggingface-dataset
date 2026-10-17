# WindyTranslate/phonepack-en-fr

## Resumen

WindyTranslate/phonepack-en-fr es un paquete de traducción automática inglés→francés para inferencia local, publicado por WindyTranslate (Windstorm Labs). Deriva del modelo WindyTranslate/translate-tc-big-en-fr en la revisión `5454d15`, a su vez basado en el OPUS-MT Helsinki-NLP/opus-mt-tc-big-en-fr. El pack convierte los pesos a ONNX, los cuantiza a int8 y almacena una sola copia del embedding compartido (`embed.bin`); el repositorio ocupa 0,2 GB y la descarga declarada es de 243,4 MB.

Resuelve un problema concreto: ejecutar traducción EN→FR sin conexión en dispositivos con recursos limitados, con un formato de despliegue autocontenido. `pack.json` incluye la lista de ficheros con sha256, la regla de tokenización y los ajustes de decodificación, y `test_vectors.json` aporta 20 frases de devtest con identificadores de tokens y salidas esperadas para validar portes.

Es relevante porque ofrece una alternativa medible y reproducible para traducción on-device: en FLORES-200 devtest (1.012 frases, beam 4) obtiene chrF++ 70,68 y spBLEU 56,78. No se detallan en la información disponible el número de parámetros ni la longitud de contexto; es un modelo de traducción, no un LLM generativo conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de traducción neuronal de la familia OPUS-MT; modelo base WindyTranslate/translate-tc-big-en-fr, derivado de Helsinki-NLP/opus-mt-tc-big-en-fr |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (ONNX) |
| Idiomas soportados | inglés (en) como origen, francés (fr) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX int8; embedding compartido en `embed.bin`; metadatos y ajustes en `pack.json` |
| Modelo base | WindyTranslate/translate-tc-big-en-fr @ `5454d15` |
| Modelo upstream | Helsinki-NLP/opus-mt-tc-big-en-fr |
| Tarea | traducción (pipeline: translation) |
| Tamaño de descarga | 243,4 MB |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una conversión ONNX int8 de WindyTranslate/translate-tc-big-en-fr, que a su vez procede de Helsinki-NLP/opus-mt-tc-big-en-fr, un modelo OPUS-MT de traducción neuronal. No se especifican en la model card el número de capas, la dimensión oculta, el número de cabezas, el recuento de parámetros ni la longitud máxima de secuencia.

Tampoco se detallan los datos de entrenamiento: no hay información sobre número de tokens, composición del corpus ni si hubo técnicas de ajuste como RLHF o DPO. Lo que sí se documenta es el proceso de empaquetado: mismos pesos que el modelo base en la revisión `5454d15`, conversión a ONNX, cuantización int8, embedding compartido almacenado una sola vez y verificación mediante sha256 en `pack.json`. La decodificación medida usa beam 4; los valores concretos de tokenización y decodificación están en `pack.json`, pero no se reproducen en la model card.

## Capacidades

- Traducción de texto de inglés a francés, orientada a frases o segmentos; no se documenta traducción de documentos completos.
- Inferencia local y offline: el pack está pensado para el modo sin conexión de Windy Traveler.
- Despliegue mediante runtime ONNX; pesos int8 y embedding compartido para reducir la huella de almacenamiento y memoria.
- Integridad y reproducibilidad: `pack.json` contiene sha256, regla de tokenización y ajustes de decodificación; `test_vectors.json` incluye 20 frases con identificadores de tokens y salidas esperadas.
- Calidad medida en FLORES-200 devtest con beam 4: chrF++ 70,68 y spBLEU 56,78.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades de agentes, multi-step reasoning ni modo thinking.
- No se documentan visión, audio ni otras modalidades.
- Solo se documenta el par inglés→francés; no hay otros idiomas ni traducción inversa.
- No es un modelo conversacional: no mantiene contexto de diálogo por sí mismo.

## Casos de uso

- Aplicación de viaje sin conexión: integrar el pack en una aplicación móvil para traducir menús, señales y frases EN→FR en el dispositivo. Los 243,4 MB y el formato ONNX int8 permiten cachear el modelo y evitar enviar texto a un servidor; encaja en el caso de uso declarado de Windy Traveler.
- Kiosco o tableta de atención al cliente: traducir preguntas frecuentes y formularios de inglés a francés en mostrador. Al ser local, reduce la dependencia de la red y mantiene el texto en el dispositivo; conviene revisión humana en respuestas contractuales o sensibles.
- Pretraducción de documentación técnica: procesar por lotes manuales y artículos EN→FR en CPU y enviar la salida a postedición. El formato empaquetado y los vectores de prueba facilitan integraciones reproducibles; no debería publicarse sin revisión.
- Subtítulos o transcripciones: encadenar un ASR en inglés con este traductor por segmentos para generar subtítulos franceses localmente. Es adecuado por su huella pequeña, pero la latencia y el throughput no están publicados.
- Extensión de navegador o lector de correo: traducir texto seleccionado sin enviarlo a un servicio externo. El modelo se puede almacenar en caché local; para párrafos largos habrá que segmentar porque no hay longitud de contexto documentada.
- Dispositivo embebido o Raspberry Pi: desplegar traducción EN→FR en un gadget de viaje con ONNX Runtime. El peso de 243,4 MB es manejable para almacenamiento y memoria, aunque el rendimiento real depende del hardware.
- Validación de portes y CI: usar `test_vectors.json` para comparar identificadores de tokens y salidas esperadas al portar el runtime; es útil para detectar regresiones de tokenización o decodificación antes de desplegar.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Métrica | Resultado |
|---|---|---|---|
| FLORES-200 devtest | 1.012 frases, beam 4 | chrF++ | 70,68 |
| FLORES-200 devtest | 1.012 frases, beam 4 | spBLEU | 56,78 |
| Referencia: CTranslate2 int8 del mismo modelo | FLORES-200 devtest | chrF++ | 70,57 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de LLM; no son aplicables a este modelo de traducción. Tampoco se publican latencia, throughput ni comparaciones de calidad con otros sistemas de traducción en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el pack está diseñado para inferencia on-device. En CPU, para planificación conviene reservar del orden de 0,3-0,5 GB de RAM entre pesos y runtime, como estimación a partir de los 243,4 MB de pesos; no hay medición publicada.
- GPU recomendadas: ninguna en particular. Cualquier GPU compatible con ONNX Runtime puede ejecutarlo; A100 o H100 no son necesarias.
- GPU consumer: sí, cabe en tarjetas como RTX 4090 o RTX 3060, e incluso en gráficas integradas, aunque para este tamaño no hay una ventaja clara frente a CPU.
- Almacenamiento: 243,4 MB de descarga y 0,2 GB de repositorio.
- Opciones de despliegue: ONNX Runtime es el runtime natural. CTranslate2 se menciona solo como referencia de calidad int8 del mismo modelo, no como formato de este pack. vLLM, TGI, llama.cpp y Ollama no son aplicables a este modelo de traducción ONNX.
- Latencia y throughput: no disponibles. Solo se publica calidad (chrF++ y spBLEU) en FLORES-200 devtest con beam 4.
- Entorno móvil: verificar memoria disponible, tamaño del binario y compatibilidad del runtime ONNX en el dispositivo objetivo antes de integrar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Dirección | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|---|
| WindyTranslate/phonepack-en-fr | no disponible | no disponible | ONNX int8 + `embed.bin` | CC-BY-4.0 | EN→FR | chrF++ 70,68; spBLEU 56,78 en FLORES-200 devtest | HuggingFace |
| WindyTranslate/translate-tc-big-en-fr | no disponible | no disponible | no disponible | no disponible en la información | EN→FR | no disponible | HuggingFace |
| Helsinki-NLP/opus-mt-tc-big-en-fr | no disponible | no disponible | no disponible | CC-BY-4.0 | EN→FR | no disponible | HuggingFace |
| CTranslate2 int8 del mismo modelo (referencia) | no disponible | no disponible | CTranslate2 int8 | no disponible | EN→FR | chrF++ 70,57 en el mismo conjunto | referencia en la model card, no es este pack |

No se dispone de datos de parámetros o contexto para estos modelos en la información proporcionada; la comparativa se limita al formato, la licencia, la dirección de traducción y la calidad publicada.

## Limitaciones y advertencias

- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o robustez. Al derivar de OPUS-MT, puede reflejar sesgos presentes en los corpus de traducción utilizados.
- Alucinación y fidelidad: como todo sistema de traducción neuronal, puede omitir, añadir o cambiar información. La model card recomienda comprobación humana para cualquier contenido importante.
- Contexto e idioma: solo se documenta inglés→francés; no hay traducción inversa ni otros pares. No se documenta longitud de contexto, así que los documentos largos deben segmentarse y revisarse por coherencia.
- Licencia: CC-BY-4.0 permite uso comercial con atribución. Es obligatorio conservar el texto de atribución a WindyTranslate/Windstorm Labs y a Helsinki-NLP, e indicar los cambios introducidos (conversión a ONNX y cuantización int8).
- Cuantización: int8 puede degradar casos límite. El único dato publicado es FLORES-200 devtest y no cubre todos los dominios, registros ni tipos de texto.
- No es un LLM: no sigue instrucciones, no soporta tool calling, agentes ni diálogo. No debe usarse como sustituto de un modelo generativo para tareas de razonamiento.
- Integridad: validar los sha256 de `pack.json` y no cargar pesos sin verificar. El pack está pensado para despliegues controlados.
- Reproducibilidad: los ajustes de decodificación están en `pack.json`, pero no se reproducen en la model card; para replicar el benchmark hay que usar ese fichero.

## Enlaces

- Modelo: https://huggingface.co/WindyTranslate/phonepack-en-fr
- Modelo base: https://huggingface.co/WindyTranslate/translate-tc-big-en-fr
- Modelo upstream OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-fr
- Windstorm Labs: https://windstormlabs.com
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- `pack.json`: https://huggingface.co/WindyTranslate/phonepack-en-fr/blob/main/pack.json
- `test_vectors.json`: https://huggingface.co/WindyTranslate/phonepack-en-fr/blob/main/test_vectors.json

No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados disponibles no están relacionados con el modelo.
