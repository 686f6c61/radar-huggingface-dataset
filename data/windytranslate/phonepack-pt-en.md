# WindyTranslate/phonepack-pt-en

## Resumen

WindyTranslate/phonepack-pt-en es un paquete de traducción portugués→inglés para inferencia local, distribuido en ONNX con cuantización int8. Lo publica WindyTranslate (Windstorm Labs) para el modo sin conexión de Windy Traveler y deriva de WindyTranslate/translate-tc-bible-big-roa-en en el commit 7023d24.

El modelo base es el OPUS-MT general-purpose de Helsinki-NLP para lenguas románicas→inglés (Helsinki-NLP/opus-mt-tc-bible-big-roa-en); pese a “bible” en el nombre, la model card indica que no es una variante restringida a textos religiosos. Este pack conserva los mismos pesos, los convierte a ONNX, los cuantiza a int8 y almacena una sola vez el embedding compartido (embed.bin).

El paquete de descarga ocupa 246 MB y el repositorio 0,2 GB; incluye pack.json con sha256, regla de tokenizador y ajustes de decodificación, además de test_vectors.json con 20 frases y salidas esperadas para validar portes. En FLORES-200 devtest (1.012 frases, beam 4) obtiene chrF++ 70,81 y spBLEU 54,08, lo que lo hace relevante para traducción offline en dispositivos con recursos limitados y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia OPUS-MT (Marian) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (ONNX); CTranslate2 int8 se cita solo como referencia comparativa |
| Idiomas soportados | portugués (pt) → inglés (en); el modelo base cubre roa→en, pero este pack declara solo pt y en |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX + embed.bin (embedding compartido almacenado una vez); metadatos en pack.json y test_vectors.json |
| Tamaño del paquete | 246 MB de descarga; 0,2 GB de repositorio |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de la familia OPUS-MT (Marian), según el modelo base declarado. No se documentan en la información disponible el número de capas, la dimensión oculta, las cabezas de atención ni los parámetros totales.

El entrenamiento original corresponde a Helsinki-NLP; no se especifican tokens, composición del dataset ni si hubo RLHF o DPO. Este artefacto no entrena: convierte los pesos a ONNX, los cuantiza a int8 y los reempaqueta. La innovación es de despliegue: embedding compartido en un único archivo, manifiesto con checksums, tokenizador y ajustes de decodificación, y vectores de prueba para verificar una implementación. La decodificación medida usa beam 4.

## Capacidades

- Traducción de frases de portugués a inglés con decodificación beam 4 en la medición publicada.
- Inferencia local y sin conexión, orientada a CPU y a dispositivos con almacenamiento limitado.
- Paquete reproducible: pack.json describe archivos con sha256, regla de tokenizador y ajustes de decodificación.
- Validación de portes mediante test_vectors.json, con 20 frases de devtest, ids de tokens y salidas esperadas.
- Cuantización int8 para reducir el tamaño del artefacto y facilitar el despliegue en el borde.
- No soporta tool calling ni function calling.
- No está documentado como modelo de agentes ni de razonamiento multi-paso.
- No incluye visión, audio ni otras modalidades.
- No se documenta gestión de contexto largo; la evaluación publicada es a nivel de frase.
- El soporte multilingüe se limita al par pt→en declarado por el pack.

## Casos de uso

- Aplicación de viajes sin conexión: traducir frases de restaurante, transporte o alojamiento en el móvil sin enviar texto a la nube, usando un paquete int8 de 246 MB y un runtime ONNX local.
- Traducción de mensajes privados en el dispositivo: procesar conversaciones puntuales en portugués antes de mostrarlas en inglés, con la ventaja de que el contenido no sale del terminal.
- Subtitulado local de vídeo pregrabado: traducir cada subtítulo o frase de forma independiente y revisar después; el modelo está medido sobre frases, no sobre documentos completos.
- Documentos sensibles en equipos de campo: traducir notas, correos o informes breves en un portátil sin conexión y con revisión humana posterior.
- Kioscos o señalética interactiva sin red: integrar el paquete en hardware embebido con ONNX Runtime para traducir consultas frecuentes de usuarios portugueses.
- Investigación de campo: transcribir y traducir entrevistas o respuestas abiertas en portugués para su análisis posterior, manteniendo los datos en local.
- Extensiones de navegador: traducir fragmentos seleccionados de páginas web en el propio cliente, evitando depender de una API externa.
- Pre-traducción en atención al cliente: generar una primera versión en inglés de mensajes entrantes para agentes que no dominan el portugués, con revisión obligatoria antes de responder.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Métrica | Resultado |
|---|---|---|---|
| FLORES-200 devtest | 1.012 frases, beam 4 | chrF++ | 70,81 |
| FLORES-200 devtest | 1.012 frases, beam 4 | spBLEU | 54,08 |
| CTranslate2 int8 del mismo modelo | Referencia del autor | chrF++ | 70,91 |

La única medición publicada es la de FLORES-200 devtest. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de propósito general, que no corresponden a un modelo de traducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo no requiere GPU y el paquete int8 ocupa 246 MB en disco.
- Memoria RAM en ejecución: no disponible en la información proporcionada; el diseño está orientado a CPU y a dispositivos con recursos limitados.
- GPU recomendadas: ninguna. A100, H100 o RTX 4090 pueden ejecutar ONNX Runtime, pero no hay datos publicados de mejora de latencia o throughput frente a CPU.
- Cabe en GPU consumer: sí, pero es innecesario para el tamaño del paquete y no se documentan ventajas medidas.
- Opciones de despliegue: ONNX Runtime y el runtime propio de Windy Traveler; CTranslate2 aparece solo como referencia de rendimiento, no como formato de este pack.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WindyTranslate/phonepack-pt-en (este pack) | no disponible | no disponible | chrF++ 70,81 en FLORES-200 devtest | Apache-2.0 | ONNX int8, 246 MB |
| WindyTranslate/translate-tc-bible-big-roa-en (modelo padre) | no disponible | no disponible | no disponible | Apache-2.0 | Pesos en HuggingFace |
| Helsinki-NLP/opus-mt-tc-bible-big-roa-en (upstream) | no disponible | no disponible | no disponible | Apache-2.0 | Pesos en HuggingFace |
| CTranslate2 int8 del mismo modelo | no disponible | no disponible | chrF++ 70,91 en FLORES-200 devtest | Apache-2.0 | Conversión CTranslate2 |

No se han identificado en la información disponible alternativas públicas comparables con especificaciones verificables; la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La traducción automática requiere revisión humana para cualquier contenido relevante; la propia model card lo indica.
- El nombre “bible” del modelo base puede inducir a error: la model card afirma que es general-purpose, pero no se publican evaluaciones por dominio.
- Solo hay una medición publicada, FLORES-200 devtest; no se documenta rendimiento en dominios como jurídico, médico, técnico o conversacional.
- El pack declara únicamente portugués→inglés; no se especifica si cubre variantes pt-PT y pt-BR por separado.
- La evaluación es a nivel de frase; no se documenta gestión de contexto largo ni coherencia entre turnos.
- La cuantización int8 puede introducir diferencias frente a los pesos originales; el autor solo compara con CTranslate2 int8 (70,81 frente a 70,91), no con FP32.
- Riesgo de omisiones, adiciones o errores en nombres propios, negaciones, números y terminología especializada, habitual en traducción automática.
- No se documentan filtros de seguridad, moderación ni detección de contenido sensible.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar la atribución indicada por el autor y cumplir los términos de la licencia.
- No dispone de tool calling, agentes, visión ni audio; no debe presentarse como un modelo de propósito general.

## Enlaces

- https://huggingface.co/WindyTranslate/phonepack-pt-en
- https://huggingface.co/WindyTranslate/translate-tc-bible-big-roa-en
- https://huggingface.co/Helsinki-NLP/opus-mt-tc-bible-big-roa-en
- https://www.apache.org/licenses/LICENSE-2.0
- https://windstormlabs.com
