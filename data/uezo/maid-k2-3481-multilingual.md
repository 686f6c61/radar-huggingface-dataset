# uezo/maid-k2-3481-multilingual

## Resumen

Maid K2-3481 Multilingual es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Style-Bert-VITS2 2.7.0, desarrollado por el usuario uezo. Se trata de un modelo de voz concreta, no de un modelo generativo de propósito general: sintetiza una única voz sintética con estilo `Neutral` en japonés, inglés y chino mandarín. El modelo parte del checkpoint preentrenado litagin/Style-Bert-VITS2-1.0-base y se ha afinado durante 500 épocas sobre datos de habla sintética generados por otros modelos TTS (Irodori-TTS v4.1 Small y Qwen3-TTS).

La relevancia de este modelo es doble. Por un lado, forma parte del ecosistema Style-Bert-VITS2, un framework popular para clonación y estilización de voz que combina representaciones BERT con el modelo acústico VITS2. Por otro, es un ejemplo de entrenamiento completamente sintético: la voz no imita a ninguna persona real, sino que se diseñó a partir de una descripción textual, y el corpus de entrenamiento se generó con otros sistemas TTS. El repositorio libera no solo los pesos sino también los datos de entrenamiento (4.655 clips WAV, listas de fonemas y corpus de texto), lo que lo convierte en un recurso interesante para estudiar pipelines de TTS con datos sintéticos.

El modelo tiene un tamaño de repositorio de 1,6 GB y se distribuye bajo licencia Apache 2.0. No se publican métricas de benchmarks ni especificaciones de parámetros en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Style-Bert-VITS2 2.7.0 (variante normal, no JP-Extra); base Bert-VITS2 2.1 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja), inglés (en), chino mandarín (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`maid-k2-3481-multilingual_e500_s467500_avg.safetensors`), más `config.json` y `style_vectors.npy` |
| Muestreo de audio | 44,1 kHz (entrenamiento y salida de referencia) |
| Estilo / hablante | `maid-k2-3481` / `Neutral` |
| Modelo base | litagin/Style-Bert-VITS2-1.0-base |
| Entrenamiento | 500 épocas, 467.500 pasos, batch size 5 |
| Tamaño del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El modelo emplea Style-Bert-VITS2 2.7.0 en su variante estándar (no JP-Extra), construida sobre la base Bert-VITS2 2.1. Esta arquitectura combina un codificador de texto basado en BERT con el modelo acústico VITS2 y un mecanismo de vectores de estilo que permite controlar la expresividad de la voz. El checkpoint liberado es la media ponderada por igual de cinco checkpoints de una misma ejecución de entrenamiento: el final (época 500, paso 467.500) y cuatro anteriores en los pasos 270.000, 352.000, 408.000 y 460.000 (épocas 289, 377, 437 y 492). Los cinco se seleccionaron por escucha, como los de menor ruido audible, y la media no implica entrenamiento adicional.

Los datos de entrenamiento son completamente sintéticos y suman 4.655 clips: 1.323 en japonés, 1.732 en inglés y 1.600 en chino. El japonés se generó con Irodori-TTS v4.1 Small a partir de una voz elegida por descripción textual, sin grabación de referencia; el inglés y el chino se generaron con Qwen3-TTS Base mediante clonación de voz a partir de un clip de referencia de esa misma voz sintética. Los corpus de texto provienen de AICA500, casual100, ITA recitation, assistant400, CMU ARCTIC y THCHS-30. Todos los clips se procesaron con filtro paso bajo a 16 kHz, de-esser y normalización de sonoridad a −23 LUFS con techo de −1 dBTP. Los clips japoneses están a 48 kHz y los de inglés y chino a 24 kHz (la tasa de salida de Qwen3-TTS); Style-Bert-VITS2 los remuestrea a 44,1 kHz para el entrenamiento. Solo los clips japoneses se verificaron auditivamente para confirmar que leían correctamente su texto; los de inglés y chino no se revisaron.

## Capacidades

- Síntesis de voz (text-to-speech) de una única voz sintética identificada como `maid-k2-3481`, con estilo `Neutral`.
- Soporte multilingüe en japonés, inglés y chino mandarín, seleccionando el idioma del texto de entrada.
- Control de estilo mediante vectores de estilo (`style_vectors.npy`), propio de la arquitectura Style-Bert-VITS2.
- Generación de habla a 44,1 kHz a partir de texto con fonemas y tonos (el `train.list` incluye fonemas y tonos para el entrenamiento).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo acústico, no un LLM.
- No dispone de modo thinking, visión ni audio de entrada; la entrada es texto y la salida es audio.

## Casos de uso

- Doblaje y localización de contenido breve: el modelo puede sintetizar el mismo guion en japonés, inglés y chino manteniendo una voz consistente, útil para tráilers, vídeos promocionales o tutoriales con versiones en varios idiomas.
- Asistentes de voz para aplicaciones de escritorio o web: al ser un modelo TTS ligero (repositorio de 1,6 GB) puede integrarse en un servicio local que convierta respuestas de texto en audio para un personaje virtual o asistente doméstico.
- Prototipado de personajes sintéticos: la voz se diseñó a partir de una descripción textual y no imita a personas reales, lo que facilita crear demos de videojuegos, VTubers o interfaces conversacionales sin problemas de derechos de imagen.
- Generación de audiolibros y contenido narrado en japonés: los clips de entrenamiento japoneses se verificaron auditivamente, por lo que es el idioma con mayor fiabilidad declarada para narración de textos largos.
- Investigación sobre TTS con datos sintéticos: el repositorio incluye las listas de entrenamiento, los 4.655 WAV y los corpus de texto, lo que permite reproducir el pipeline y estudiar el efecto del entrenamiento con habla generada por otros modelos.
- Pruebas de integración en pipelines de Style-Bert-VITS2: al copiar `model_assets/maid-k2-3481-multilingual/` en la carpeta `model_assets/` del proyecto Style-Bert-VITS2, se puede evaluar el modelo dentro de una infraestructura TTS ya existente y comparar su comportamiento con otras voces del ecosistema.
- Generación de avisos y notificaciones habladas: frases cortas como la hora, el tiempo o recordatorios son un caso directo para el que el modelo ofrece muestras de referencia en los tres idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS, MCD, WER de síntesis ni comparaciones cuantitativas con otros modelos TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio (1,6 GB) incluye pesos, datos de entrenamiento, muestras y assets, por lo que no equivale al peso del modelo en memoria.
- GPU recomendadas: no disponible. Al ser un modelo TTS de la familia Style-Bert-VITS2, es habitual ejecutarlo en GPU de gama media, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: el método indicado por el autor es copiar `model_assets/maid-k2-3481-multilingual/` en la carpeta `model_assets/` del proyecto Style-Bert-VITS2 (https://github.com/litagin02/Style-Bert-VITS2) y seleccionar el idioma del texto de entrada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto / notas | Disponibilidad |
|---|---|---|---|---|---|
| Maid K2-3481 Multilingual (uezo) | Style-Bert-VITS2 2.7.0, voz única | ja, en, zh | Apache 2.0 | Entrenado con datos sintéticos; incluye corpus y WAV | Hugging Face |
| litagin/Style-Bert-VITS2-1.0-base | Style-Bert-VITS2 base (Bert-VITS2 2.1) | no disponible | no disponible | Checkpoint preentrenado del que parte este modelo | Hugging Face |
| Irodori-TTS v4.1 Small | TTS generativo | no disponible | no disponible | Usado para generar el habla japonesa de entrenamiento | Hugging Face |
| Qwen3-TTS Base | TTS con clonación de voz | no disponible | no disponible | Usado para generar el habla inglesa y china de entrenamiento | GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de una sola voz y un solo estilo (`Neutral`); no permite elegir entre múltiples hablantes ni estilos expresivos más allá del vector de estilo incluido.
- Los clips de inglés y chino no fueron verificados auditivamente, por lo que pueden contener lecturas erróneas u otros defectos en la síntesis.
- El entrenamiento se realizó íntegramente con habla sintética generada por Irodori-TTS y Qwen3-TTS; los artefactos o sesgos de esos modelos pueden haberse transferido al modelo final.
- Riesgo de alucinación en el sentido de pronunciación incorrecta, entonación anómala o lectura errónea de texto no visto, especialmente en inglés y chino.
- No hay métricas objetivas publicadas (MOS, MCD, WER) que permitan estimar la calidad en producción.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio incluye un archivo NOTICE con atribuciones y avisos de terceros que deben revisarse; los corpus de texto tienen sus propias licencias (por ejemplo, `corpus/licenses/cmu_arctic.txt`).
- El modelo está pensado para una voz de personaje ("AI Maid") y no para imitar voces reales; el autor declara explícitamente que no imita a ninguna persona.
- No se especifican requisitos de hardware ni latencia, lo que dificulta planificar un despliegue en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uezo/maid-k2-3481-multilingual
- Modelo base: https://huggingface.co/litagin/Style-Bert-VITS2-1.0-base
- Repositorio Style-Bert-VITS2: https://github.com/litagin02/Style-Bert-VITS2
- Irodori-TTS v4.1 Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
