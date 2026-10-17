# WindyTranslate/phonepack-de-en

## Resumen

WindyTranslate/phonepack-de-en es un pack de traducción automática alemán→inglés para ejecución en dispositivo, publicado por WindyTranslate (Windstorm Labs). No es un modelo de lenguaje generativo: empaqueta los pesos de WindyTranslate/translate-de-en, derivado a su vez de Helsinki-NLP/opus-mt-de-en (OPUS-MT), en formato ONNX cuantizado a int8. El pack pesa 80,1 MB e incluye un único embedding compartido (`embed.bin`), un `pack.json` con hashes SHA-256, regla de tokenización y ajustes de decodificación, y `test_vectors.json` con 20 frases de devtest para validar ports.

Su interés está en el despliegue offline: permite traducción de frases alemanas a inglés en móviles, navegadores o equipos de bajo consumo sin depender de la nube. La evaluación publicada en FLORES-200 devtest (1.012 frases, beam 4) da chrF++ 64,81 y spBLEU 44,79; la conversión a CTranslate2 int8 del mismo modelo obtiene chrF++ 64,75. No se declaran parámetros totales ni longitud de contexto; el modelo base es de traducción, no de chat.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (OPUS-MT; modelo base declarado Helsinki-NLP/opus-mt-de-en) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; modelo de traducción orientado a frases, sin ventana de contexto declarada |
| Tipos de cuantización | int8 (ONNX); se compara con CTranslate2 int8 del mismo modelo |
| Idiomas soportados | de, en (alemán a inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX int8; embedding compartido en `embed.bin`; metadatos en `pack.json`; vectores de prueba en `test_vectors.json` |
| Tarea | translation (de→en) |
| Modelo base | WindyTranslate/translate-de-en (commit `fb6f91b`); upstream Helsinki-NLP/opus-mt-de-en |
| Tamaño del pack | 80,1 MB de descarga; repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El pack no entrena un modelo nuevo: parte de WindyTranslate/translate-de-en en el commit `fb6f91b`, que a su vez deriva de Helsinki-NLP/opus-mt-de-en, un modelo OPUS-MT de traducción. La arquitectura declarada es transformer encoder-decoder; la información disponible no detalla número de capas, dimensiones ocultas ni parámetros totales. Los cambios de este pack son de despliegue: conversión a ONNX, cuantización int8 y almacenamiento único del embedding compartido para reducir el tamaño.

No se especifican tokens de entrenamiento, composición del dataset, técnicas de alineación como RLHF/DPO ni ajustes de seguridad. La innovación práctica está en el empaquetado: `pack.json` concentra archivos con SHA-256, regla de tokenización y ajustes de decodificación; `test_vectors.json` incluye 20 frases de devtest con ids de tokens y salidas esperadas para comprobar una implementación. La evaluación se hace con beam 4.

## Capacidades

- Traducción automática de alemán a inglés, orientada a frases.
- Ejecución on-device/offline con ONNX Runtime u otro runtime compatible con ONNX int8; requiere implementar tokenización y decodificación según `pack.json`.
- Modelo compacto: descarga de 80,1 MB; repositorio de 0,1 GB.
- Embedding compartido almacenado una sola vez (`embed.bin`).
- Validación de ports mediante `test_vectors.json`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni generación general de texto.
- No es multilingüe más allá de de→en; no se declaran otros pares.
- No se declara modo thinking ni capacidades de chat.

## Casos de uso

- Traducción offline en una app de viajes: el pack se integra en el modo sin conexión de Windy Traveler para convertir avisos, menús y mensajes alemanes a inglés en el dispositivo, con 80,1 MB de descarga y sin enviar texto a la nube.
- Traducción de mensajes de soporte al cliente: agentes que trabajan en inglés pueden traducir correos o chats alemanes en local antes de responder; el tamaño int8 permite ejecutarlo en portátiles y mantener la privacidad del contenido.
- Kioscos y terminales en aeropuertos o estaciones: traducción de instrucciones y avisos de alemán a inglés en pantallas o dispositivos de bajo consumo, con inferencia ONNX y sin dependencia de conectividad.
- Preprocesamiento edge para pipelines NLP: convertir texto alemán a inglés antes de clasificación, búsqueda o análisis de sentimiento en equipos locales; el formato ONNX int8 facilita el despliegue junto a otros modelos pequeños.
- Traducción de documentación técnica y avisos de seguridad en dispositivos de campo: el pack puede traducir frases cortas en entornos offline, con revisión humana obligatoria para textos críticos.
- Validación de runtimes y ports: usar `test_vectors.json` para comprobar que una implementación de tokenizador y decodificador reproduce los ids y salidas esperadas antes de desplegar el pack.
- Traducción por lotes de frases cortas en CPU: adecuado para volúmenes moderados de texto alemán que deban convertirse a inglés en un portátil o servidor pequeño sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | Conjunto | Configuración | Resultado |
|---|---|---|---|
| chrF++ | FLORES-200 devtest (1.012 frases) | beam 4 | 64,81 |
| spBLEU | FLORES-200 devtest (1.012 frases) | beam 4 | 44,79 |
| chrF++ (referencia) | FLORES-200 devtest | CTranslate2 int8 del mismo modelo | 64,75 |

El autor no publica MMLU, HumanEval, GSM8K ni resultados de tareas generativas; no aplican a este modelo de traducción. No hay comparación con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el pack pesa 80,1 MB en int8, por lo que la huella es muy reducida.
- GPU recomendadas: no se especifican; por tamaño no requiere A100/H100 y cabe en GPU consumer, CPU o móvil.
- Cabe en GPU consumer: sí, según el tamaño del pack; no se enumeran modelos concretos en la información disponible.
- Opciones de despliegue: ONNX Runtime o un runtime propio que lea `pack.json`; CTranslate2 int8 aparece solo como referencia de conversión, no como formato del pack. vLLM, llama.cpp, Ollama y TGI no aplican: no es un LLM ni un archivo GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phonepack-de-en (este pack) | no disponible | no disponible | chrF++ 64,81; spBLEU 44,79 (FLORES-200 devtest, beam 4) | Apache-2.0 | HuggingFace |
| WindyTranslate/translate-de-en | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Helsinki-NLP/opus-mt-de-en | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce de alemán a inglés; no cubre otros idiomas ni otros pares.
- Es un modelo de traducción, no un LLM: no razona, no genera código, no resuelve matemáticas ni mantiene conversaciones.
- No se declara contexto largo ni traducción a nivel de documento; está orientado a frases.
- Riesgo de errores en términos técnicos, nombres propios, ambigüedad y omisiones; el autor indica que la traducción automática necesita revisión humana para cualquier contenido importante.
- No se documentan evaluaciones de sesgo ni de robustez en dominios específicos.
- La cuantización int8 puede degradar la calidad frente a pesos sin cuantizar; no se publican resultados de una versión FP en la información disponible.
- La licencia Apache-2.0 permite uso comercial con obligaciones de aviso; deben conservarse la licencia y el texto de atribución del autor, incluida la referencia a Helsinki-NLP/opus-mt-de-en.
- El runtime debe implementar correctamente la tokenización y decodificación descritas en `pack.json`; `test_vectors.json` ayuda a validar el port, pero no sustituye una evaluación propia.

## Enlaces

- https://huggingface.co/WindyTranslate/phonepack-de-en
- https://huggingface.co/WindyTranslate/translate-de-en
- https://huggingface.co/Helsinki-NLP/opus-mt-de-en
- https://windstormlabs.com
- https://www.apache.org/licenses/LICENSE-2.0
