# vnhellboy/kokoro-vietnamese-coreml

## Resumen

Kokoro-vietnamese-coreml es una conversión a Core ML del modelo de síntesis de voz Kokoro-82M, adaptada específicamente al vietnamita. Lo publica el usuario vnhellboy a partir del modelo original contextboxai/Kokoro-Vietnamese, y su objetivo es ejecutar la síntesis de voz en hardware Apple mediante la cadena de siete etapas que consume el gestor `KokoroAneManager` de FluidAudio. El resultado es un paquete de pesos orientado a inferencia local en dispositivos Apple, no un modelo entrenado desde cero.

El modelo conserva la arquitectura del Kokoro-82M original (aproximadamente 82 millones de parámetros) y se distribuye como una cadena de siete etapas Core ML con mezcla de precisión: fp16 e int8 palettized para las etapas principales y fp32 para las etapas de prosodia, ruido y cola. Incluye 14 paquetes de voz en formato binario plano de dimensiones [510, 256] en float32, además del diccionario de fonemas sea-g2p 0.10.0 necesario para preprocesar el texto de entrada.

Su relevancia es acotada pero concreta: permite desplegar TTS vietnamita en macOS e iOS sin depender de servicios en la nube, con un tamaño de repositorio de 0,2 GB y licencia Apache 2.0. Está pensado para desarrolladores que ya trabajan con el ecosistema FluidAudio y necesitan una ruta de inferencia compatible con la Neural Engine de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M convertido a cadena Core ML de 7 etapas (fp16 + int8 palettized, fp32 en prosodia/ruido/cola) |
| Parametros totales | aproximadamente 82 millones (heredados de Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | fp16, int8 palettized y fp32 segun la etapa |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (cadena de 7 etapas) y paquetes de voz `.bin` float32 [510, 256] |

## Arquitectura y entrenamiento

La ficha no describe el entrenamiento del modelo base; se trata de una conversión de pesos, no de un entrenamiento nuevo. El modelo subyacente es Kokoro-82M, un TTS de aproximadamente 82 millones de parámetros, y la variante vietnamita procede de contextboxai/Kokoro-Vietnamese. La conversión replica la cadena de siete etapas que ejecuta `KokoroAneManager` de FluidAudio: las etapas principales van en fp16 con paletización int8, mientras que las etapas de prosodia, ruido y cola se mantienen en fp32 para preservar la calidad de la señal.

Según la model card, cada etapa se validó contra el modelo PyTorch original mediante correlación y comparación del espectro de salida. El paquete incluye `vocab.json`, los 14 paquetes de voz y el diccionario `sea_g2p.bin` (sea-g2p 0.10.0). El texto de entrada debe fonemizarse con sea-g2p aplicando las reglas de vig2p, tal como se entrenó el modelo; no se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a partir de texto fonemizado con sea-g2p y reglas vig2p.
- Selección entre 14 paquetes de voz distintos, cada uno almacenado como tensor plano [510, 256] en float32.
- Inferencia local en hardware Apple mediante Core ML y la cadena de siete etapas compatible con la Neural Engine.
- Inclusión de un manifiesto (`manifest.json`) con tamaño y SHA-256 de cada archivo para verificación de integridad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: el modelo se integra como cadena Core ML y permite narrar texto vietnamita sin conexión, aprovechando la Neural Engine para reducir consumo.
- Accesibilidad para personas con discapacidad visual: permite convertir contenido escrito en vietnamita a audio local en el dispositivo, sin enviar texto a servidores externos.
- Asistentes de voz embebidos: los 14 paquetes de voz permiten asignar timbres distintos a personajes o contextos dentro de una misma aplicación.
- Audiolibros y contenido educativo: la síntesis local con licencia Apache 2.0 facilita generar narraciones de material didáctico en vietnamita sin coste por petición.
- Aplicaciones de aprendizaje de idiomas: el modelo puede producir pronunciaciones de referencia en vietnamita para ejercicios de escucha y repetición.
- Prototipado de interfaces conversacionales: al ser un paquete Core ML ligero (0,2 GB), se puede desplegar en entornos de desarrollo Apple para validar flujos de voz antes de escalar a producción.
- Integración en pipelines FluidAudio: los desarrolladores que ya usan `KokoroAneManager` pueden sustituir el modelo por esta variante vietnamita respetando la estructura de siete etapas y el nombre de archivo `af_heart.bin` que exige la comprobación de FluidAudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona verificaciones de correlación y de espectro de salida frente al modelo PyTorch, sin cifras numéricas.

## Requisitos de hardware

- Hardware objetivo: dispositivos Apple con soporte de Core ML y Neural Engine (macOS e iOS); la cadena está diseñada para `KokoroAneManager` de FluidAudio.
- VRAM/unificada estimada: no disponible; el repositorio ocupa 0,2 GB y el modelo base tiene unos 82 millones de parámetros, por lo que el peso en memoria es reducido.
- GPU recomendadas: no aplica en el sentido de GPU dedicadas; el despliegue previsto es en Apple Silicon.
- Compatibilidad con GPU de consumo: no se documenta soporte para CUDA ni para GPUs NVIDIA.
- Opciones de despliegue: Core ML mediante FluidAudio (`KokoroAneManager`); no se indican vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Contexto/notas |
|---|---|---|---|---|---|
| vnhellboy/kokoro-vietnamese-coreml | aprox. 82 M | vietnamita | Core ML 7 etapas | Apache 2.0 | Conversion para Apple/FluidAudio |
| contextboxai/Kokoro-Vietnamese | aprox. 82 M | vietnamita | no disponible en la informacion | no disponible en la informacion | Modelo base del que deriva esta conversion |
| Kokoro-82M (original) | aprox. 82 M | multilingue (segun version) | no disponible en la informacion | no disponible en la informacion | Arquitectura de referencia |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estas variantes entre sí.

## Limitaciones y advertencias

- Solo soporta vietnamita; no es multilingüe.
- Requiere fonemización previa con sea-g2p 0.10.0 y reglas vig2p; un preprocesado distinto degradará la salida.
- Es una conversión de pesos, no un modelo entrenado de nuevo: hereda los sesgos y limitaciones del modelo base contextboxai/Kokoro-Vietnamese.
- Riesgo de alucinación acústica y errores de pronunciación en textos con números, siglas o palabras extranjeras no cubiertas por el diccionario.
- Dependencia del ecosistema FluidAudio y de la estructura exacta de siete etapas; cambios en el gestor pueden romper la compatibilidad.
- El archivo `af_heart.bin` es una copia de un paquete vietnamita incluida solo para satisfacer la comprobación de nombres de FluidAudio, lo que puede inducir a error si se espera una voz inglesa.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del diccionario sea-g2p.
- Sin datos publicados de latencia, throughput ni calidad subjetiva (MOS), la evaluación en producción requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vnhellboy/kokoro-vietnamese-coreml
- Modelo base: https://huggingface.co/contextboxai/Kokoro-Vietnamese
- Diccionario sea-g2p: https://github.com/pnnbao97/sea-g2p
