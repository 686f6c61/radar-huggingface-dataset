# udgamlabs/shruti-maithili

## Resumen

Shruti Maithili es un modelo de reconocimiento automático del habla (ASR) desarrollado por Udgam Labs, un laboratorio que publica una familia de modelos pequeños de transcripción, uno por idioma, todos con capacidades de code-switching hacia el inglés. Este modelo concreto transcribe audio de 16 kHz en maithili (escrito en devanagari) y en inglés (mantenido en alfabeto latino), incluyendo emisiones mixtas maithili-inglés. Con aproximadamente 56 millones de parámetros y un fichero de 29,7 MB en cuantización de 4 bits, está diseñado explícitamente para inferencia en dispositivo (móvil, portátil o navegador) sin conexión a internet ni servidor.

El modelo deriva de Shruti Hindi, que a su vez se construye sobre Cactus Whistle de Cactus Compute (Apache-2.0). Udgam Labs reentrenó todos los pesos sobre voz en maithili e inglés y añadió 400 piezas de vocabulario específicas del maithili. La relevancia actual radica en su propuesta de despliegue: un único fichero `.cact` que corre en el motor Cactus needle (nativo y WebAssembly), con un consumo medido de 64 MB de memoria y una velocidad de aproximadamente 9 veces tiempo real en un Samsung Galaxy F62 de 2021.

El autor es explícito respecto a sus límites competitivos: no reclama superioridad frente a IndicConformer Maithili, que obtiene mejores cifras en el split de validación de IndicVoices (39,3 frente a 42,5 de WER) y en la referencia nativa de DiarBench (40,2 frente a 51,2). La propuesta de valor es el tamaño reducido y la operación offline, no el rendimiento absoluto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo transformer (8 capas de encoder + 8 de decoder, anchura 512), derivada de Cactus Whistle vía Shruti Hindi |
| Parámetros totales | Aproximadamente 56M (55.722.313) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; acepta audio de 16 kHz de cualquier longitud |
| Tipos de cuantización | Pesos en 4 bits, activaciones en 8 bits (formato `.cact` para el motor Cactus needle) |
| Idiomas soportados | Maithili (`mai`), inglés (`en`) y maithili mezclado con inglés |
| Licencia | Apache-2.0 para el modelo; los términos de los datos de entrenamiento se detallan en la sección de datos de la model card |
| Formato de pesos | `.cact` (motor Cactus needle), 29,7 MB; fichero `config.json` asociado |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder de 8 capas por bloque con anchura 512, heredada de Cactus Whistle (Cactus Compute) a través de Shruti Hindi. Udgam Labs reentrenó la totalidad de los pesos sobre voz en maithili e inglés y amplió el vocabulario con 400 piezas específicas de maithili, lo que permite emitir texto en devanagari para el maithili y preservar palabras inglesas en alfabeto latino cuando el modelo decide mantenerlas en inglés. El resultado se empaqueta en un fichero de 29,7 MB con pesos de 4 bits y activaciones de 8 bits para el motor Cactus needle.

Los datos de entrenamiento provienen de tres fuentes declaradas: `ai4bharat/IndicVoices`, `ARTPARK-IISc/Vaani-transcription-part` y `openslr/librispeech_asr`. La model card no detalla el número exacto de horas ni la composición proporcional del dataset, ni menciona explícitamente fases de RLHF o DPO; el entrenamiento parece ser supervisado sobre pares audio-transcripción. La innovación técnica destacable no está en la arquitectura sino en el empaquetado y el runtime: el motor Cactus needle (Apache-2.0) ofrece ejecución nativa y WebAssembly, lo que permite desplegar el modelo en navegador y en dispositivos móviles sin infraestructura de servidor.

## Capacidades

- Transcripción de voz a texto en maithili con salida en escritura devanagari.
- Transcripción de inglés manteniendo las palabras en alfabeto latino y en minúsculas.
- Manejo de code-switching maithili-inglés dentro de la misma emisión, preservando cada segmento en su escritura correspondiente.
- Detección automática del idioma de la entrada (maithili o inglés) sin configuración previa.
- Procesamiento de audio de 16 kHz de duración arbitraria.
- Ejecución en dispositivo: nativa (macOS, Android) y en navegador mediante WebAssembly.
- Operación completamente offline, sin servidor ni conexión a internet.
- Interfaz de línea de comandos mediante el binario `needle` y API de Python mediante la clase `Whistle`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni entrada multimodal más allá del audio.

## Casos de uso

- Transcripción offline en dispositivos móviles: integración en aplicaciones Android que necesiten convertir dictado o conversaciones en maithili a texto sin enviar audio a la nube, aprovechando el fichero de 29,7 MB y el consumo de 64 MB de memoria medido en un Galaxy F62.
- Subtitulado en navegador: uso del build WebAssembly del motor Cactus needle para transcribir audio directamente en una página web, útil en herramientas de accesibilidad o edición de vídeo que no puedan depender de servicios externos.
- Documentación de reuniones y entrevistas en zonas con conectividad limitada: el modelo funciona sin internet, lo que permite grabar y transcribir en campo, en regiones de habla maithili con cobertura intermitente.
- Procesamiento de habla mixta maithili-inglés en entornos administrativos o comerciales: el modelo mantiene las palabras inglesas en alfabeto latino, lo que facilita la revisión posterior de términos técnicos, nombres de productos o cifras.
- Archivado y búsqueda de material audiovisual en maithili: transcripción por lotes en un portátil o servidor pequeño para indexar grabaciones y permitir búsqueda textual sobre el contenido hablado.
- Prototipado rápido y evaluación de ASR de bajo coste: al ser un fichero único con licencia Apache-2.0 y un runtime ligero, sirve para experimentar con pipelines de voz sin aprovisionar GPU ni infraestructura cloud.
- Aplicaciones de asistencia en tiempo real en el dispositivo: la velocidad de aproximadamente 9 veces tiempo real en un móvil de gama media permite transcripción continua con latencia baja en aplicaciones de notas de voz o asistentes locales.

## Benchmarks y rendimiento

Los resultados publicados por el autor (WER en %, menor es mejor; mismas grabaciones y mismo scorer para todos los modelos; Shruti Maithili ejecutado en su motor on-device sobre un Mac; medición del 3 de noviembre de 2026):

| Modelo | Tamaño de fichero | IndicVoices valid | DiarBench, inglés en inglés | DiarBench, nativo |
|---|---|---|---|---|
| Shruti Maithili | 29,7 MB | 42,5 | 45,7 | 51,2 |
| IndicConformer Maithili (int8) | 137,7 MB | 39,3 | 46,9 | 40,2 |

Intervalos de confianza pareados al 95 % (Shruti Maithili menos el otro modelo, en puntos de WER; un intervalo que incluye 0 indica ausencia de ventaja):

- Frente a IndicConformer Maithili, en IndicVoices valid: +1,01 a +5,73 por clip (peor).
- Frente a IndicConformer Maithili, en DiarBench nativo: +6,67 a +14,77 por clip, +6,62 a +14,84 por conversación, +6,12 a +15,56 ignorando la escritura (peor).
- Frente a IndicConformer Maithili, en DiarBench inglés en inglés: -6,29 a +3,88 por clip, -5,54 a +3,23 por conversación, -2,81 a +7,26 ignorando la escritura (sin diferencia significativa).

DiarBench se compone de 54 turnos de 15 conversaciones, con 727 palabras de referencia, 109 de ellas en inglés, en 30 turnos. El 46,8 % de las 109 palabras inglesas de DiarBench se escriben en alfabeto latino. El autor advierte que IndicVoices valid comparte fuente con los datos de entrenamiento y por tanto favorece al modelo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica VRAM de GPU; el modelo está pensado para ejecución en CPU. Consumo de memoria medido: 64 MB en un Samsung Galaxy F62 durante la transcripción.
- GPU recomendadas: no aplica; el motor Cactus needle está orientado a CPU y WebAssembly. No se documentan requisitos de GPU (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no relevante para el caso de uso previsto; el modelo cabe holgadamente en cualquier dispositivo con al menos 64 MB de memoria disponible para el runtime.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle` (`from needle import Whistle`), binario de línea de comandos `needle` por plataforma, y build `wasm/` para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 9 veces tiempo real en un Samsung Galaxy F62 (2021) con el motor nativo; mediciones también realizadas en un Mac y en Chrome sobre el mismo teléfono. No se publican cifras de latencia absoluta por fragmento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER IndicVoices valid | WER DiarBench nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shruti Maithili | ~56M | Audio de cualquier longitud | 42,5 | 51,2 | Apache-2.0 | Hugging Face, fichero `.cact` de 29,7 MB |
| IndicConformer Maithili (int8) | No disponible | No disponible | 39,3 | 40,2 | No disponible en la información proporcionada | Hugging Face (`OpenVoiceOS/ai4bharat-indicconformer-mai-onnx`), 137,7 MB |
| Shruti Hindi | ~56M (misma familia) | Audio de cualquier longitud | No disponible | No disponible | Apache-2.0 | Hugging Face, familia Shruti |
| Shruti Tamil | ~56M (misma familia) | Audio de cualquier longitud | No disponible | No disponible | Apache-2.0 | Hugging Face, familia Shruti |

IndicConformer Maithili obtiene mejor WER en ambos conjuntos de evaluación, pero ocupa 137,7 MB frente a 29,7 MB. La familia Shruti cubre 11 idiomas según la web del autor, con un modelo por idioma y capacidades de inglés integradas. No se dispone de datos de benchmarks de Shruti Hindi ni Shruti Tamil en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no reclama superioridad frente a IndicConformer Maithili: este último gana en IndicVoices valid y en DiarBench nativo, y en DiarBench inglés en inglés no hay diferencia significativa.
- Ningún hablante nativo de maithili ha revisado las salidas del modelo según la model card, lo que implica un riesgo de errores ortográficos, gramaticales o de normalización no detectados.
- Las líneas de ejemplo de la model card fueron leídas por voces sintéticas de bibliotecas hindi, no por hablantes nativos de maithili, lo que limita la representatividad de la demostración.
- IndicVoices valid comparte fuente con los datos de entrenamiento, por lo que sus cifras están infladas respecto a un dominio genuinamente externo.
- El modelo solo cubre maithili e inglés; otros idiomas requieren sus propios modelos de la familia Shruti.
- La decisión de mantener palabras inglesas en alfabeto latino o en devanagari puede no coincidir con las convenciones del usuario; el 46,8 % de las palabras inglesas de DiarBench se escriben en latino, lo que indica variabilidad en la referencia.
- El paquete `cactus-needle` envía recuentos de uso anónimos por defecto; es necesario definir `NEEDLE_TELEMETRY=0` para desactivarlo, lo que supone una consideración de privacidad en producción.
- La licencia del modelo es Apache-2.0, pero los términos de los datos de entrenamiento (IndicVoices, Vaani, LibriSpeech) se remiten a la sección de datos de la model card y deben verificarse antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan mecanismos de mitigación de sesgos, tasas de alucinación ni evaluación de robustez frente a ruido, acentos o audio de baja calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-maithili
- Página del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/maithili
- Familia Shruti: https://udgamlabs.com/models/shruti
- Colección Shruti en Hugging Face: https://huggingface.co/collections/udgamlabs/shruti-6ad5f80d9d300685a6249c9b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Código y ejemplos (documentación de maithili): https://github.com/udgamlabs/shruti/blob/main/docs/maithili.md
- Modelo base Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Motor Cactus needle: https://huggingface.co/Cactus-Compute/needle3
- Modelo comparable IndicConformer Maithili (int8): https://huggingface.co/OpenVoiceOS/ai4bharat-indicconformer-mai-onnx
- Modelo hermano Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
