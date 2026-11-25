# sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet-v2

## Resumen

Qwen3-ASR-1.7B-Lyrics-Viet-v2 es un ajuste fino (fine-tune) del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, desarrollado por el usuario sunbv56, especializado en la transcripción de letras de canciones en vietnamita con voz cantada y música de fondo. El modelo resuelve un problema concreto: los sistemas ASR generalistas rinden mal sobre audio musical, y este ajuste reduce el error de transcripción de forma sustancial en ese dominio específico. Es la segunda versión (v2) del modelo, sucesora de sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet.

Técnicamente se trata de un modelo de aproximadamente 2.038 millones de parámetros (2.038.052.480, según los pesos en safetensors), derivado de la arquitectura Qwen3-ASR, que combina un codificador de audio con un decodificador de texto. El ajuste se realizó mediante LoRA de rango 32 sobre las proyecciones de atención y MLP tanto del codificador de audio como del decodificador de texto (47,4 millones de parámetros entrenables), posteriormente fusionado en los pesos base. La licencia es Apache 2.0 y el idioma objetivo es únicamente el vietnamita.

Su relevancia radica en que demuestra que un ajuste fino ligero y bien orientado puede mejorar notablemente una tarea difícil (ASR sobre música cantada) partiendo de un modelo base de tamaño moderado, con un coste de entrenamiento contenido y resultados medidos de forma transparente frente al modelo base y a su versión anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (codificador de audio + decodificador de texto, transformer) |
| Parametros totales | 2.038.052.480 (~2,04 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con fragmentos de audio de hasta ~20 s) |
| Tipos de cuantizacion | no disponible (pesos en bf16 en safetensors; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | vietnamita (vi); el modelo base soporta otros idiomas, pero este ajuste no los tiene como objetivo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,1 GB |
| Modelo base | Qwen/Qwen3-ASR-1.7B |
| Dataset de entrenamiento | sunbv56/song_dataset_training_20s_cleaned |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-ASR: un codificador de audio que procesa la señal acústica y un decodificador de texto autorregresivo que genera la transcripción. Sobre esta base se aplicó un ajuste fino con LoRA de rango 32 en las proyecciones de atención y MLP tanto del codificador de audio como del decodificador de texto, lo que supone 47,4 millones de parámetros entrenables (frente al rango 8 solo en atención de la v1). Los adaptadores se fusionaron posteriormente en los pesos base, de modo que el modelo distribuido es un modelo denso estándar sin adaptadores separados.

El entrenamiento consistió en 2 épocas sobre 51.648 fragmentos (235,6 horas de audio), con 6456 pasos de 16 muestras, tasa de aprendizaje de 1e-4 y precisión bf16. Una de las innovaciones destacables de la v2 es la limpieza de etiquetas: aproximadamente 11.600 de los 58.632 fragmentos de entrenamiento tenían letras que no coincidían con el clip de audio (líneas que empezaban después del final del clip, créditos, etiquetas y caracteres de aspecto similar), y se corrigieron a partir de las marcas de tiempo del propio dataset. Además, el modelo fue entrenado para escribir por sí mismo la etiqueta de idioma `language Vietnamese`, de modo que `language=None` funciona correctamente para canciones en vietnamita.

## Capacidades

- Transcripción automática de voz cantada en vietnamita con música de fondo (tarea principal del ajuste).
- Generación de la etiqueta de idioma de forma autónoma (`language=None`), aprendida durante el ajuste fino.
- Procesamiento de fragmentos de audio de hasta aproximadamente 20 segundos, que es el formato con el que se entrenó.
- Reconocimiento de habla leída en inglés (heredado del modelo base, con rendimiento prácticamente idéntico: WER 1,60 frente a 1,70 del base en LibriSpeech test-clean).
- Reconocimiento de habla leída en vietnamita (heredado del base, aunque con degradación respecto a este).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.
- No se documenta capacidad multilingüe real: el autor advierte explícitamente que la identificación de idioma aprendida no constituye un sistema multilingüe genuino.

## Casos de uso

- Generación automática de letras sincronizadas para catálogos musicales vietnamitas: el modelo transcribe fragmentos de canciones de hasta 20 segundos con música de fondo, lo que permite construir pipelines de subtitulado o karaoke a partir de segmentación previa con VAD.
- Indexación y búsqueda de contenido musical: transcribir letras permite alimentar motores de búsqueda por texto sobre una fonoteca, algo inviable con ASR generalista por su alto error en audio cantado.
- Moderación y análisis de catálogos de streaming: detectar contenido sensible en letras de canciones vietnamitas transcribiendo automáticamente pistas que de otro modo requerirían revisión manual.
- Investigación en ASR musical: sirve como punto de partida o referencia para experimentos de reconocimiento de voz cantada en vietnamita, con métricas publicadas frente al modelo base y a la v1.
- Enriquecimiento de metadatos de discográficas y agregadores: extraer letras para completar fichas de canciones, con revisión humana en los casos de mayor error (coros densos, voces superpuestas).
- Prototipado de aplicaciones de aprendizaje de idiomas o de identificación de canciones: al transcribir fragmentos cortos, puede integrarse en demos que muestren la letra de un fragmento musical en vietnamita.
- Evaluación comparativa de ajustes finos: por su documentación transparente de métricas y de cambios respecto a la v1, es útil como caso de estudio de LoRA aplicado a ASR.

## Benchmarks y rendimiento

Resultados de WER/CER (%) publicados por el autor, en minúsculas y sin puntuación, con `language="Vietnamese"`. Ninguna canción de los conjuntos de evaluación comparte título y artista ni letras duplicadas con el conjunto de entrenamiento.

| Modelo | Clean set WER | Clean set CER | Original set WER | Original set CER |
|---|---|---|---|---|
| Qwen3-ASR-1.7B (base) | 20,68 | 11,57 | 25,01 | 16,17 |
| Qwen3-ASR-1.7B-Lyrics-Viet (v1) | 14,32 | 8,50 | 18,96 | 12,57 |
| **Qwen3-ASR-1.7B-Lyrics-Viet-v2 (este modelo)** | **11,65** | **6,90** | **17,15** | **12,16** |

Con `language=None` (el modelo escribe la etiqueta de idioma), el mismo conjunto clean da WER 11,77 % y CER 6,99 %.

Rendimiento fuera del dominio de entrenamiento (WER %, minúsculas, sin puntuación):

| Conjunto | Base | Este modelo |
|---|---|---|
| Habla leída en inglés (LibriSpeech test-clean, `language="English"`), 150 clips | 1,70 | 1,60 |
| Habla leída en vietnamita (FLEURS vi_vn test, `language="Vietnamese"`), 150 clips | 5,69 | 8,83 |

El autor advierte que todas las cifras provienen de una única ejecución de entrenamiento y no han sido replicadas, y que las correcciones de etiquetas se derivaron de marcas de tiempo sin verificación por escucha.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (4,1 GB de repositorio), se necesitan aproximadamente 5-6 GB de VRAM para cargar el modelo, más el espacio para activaciones y el buffer de audio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; una RTX 4090, A100 o H100 ofrecen margen sobrado y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante).
- Opciones de despliegue: la model card muestra uso mediante la librería `qwen_asr` (`Qwen3ASRModel.from_pretrained`) con PyTorch y `device_map="cuda:0"`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER clean set (canciones vi) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Lyrics-Viet-v2 | ~2,04 B | no disponible | 11,65 | Apache 2.0 | Hugging Face (sunbv56) |
| Qwen3-ASR-1.7B-Lyrics-Viet (v1) | ~2,04 B | no disponible | 14,32 | Apache 2.0 (según repo base) | Hugging Face (sunbv56) |
| Qwen3-ASR-1.7B (base) | ~2,04 B | no disponible | 20,68 | Apache 2.0 (según repo base) | Hugging Face (Qwen) |

La comparativa se limita a las tres variantes documentadas por el autor; no se dispone de datos de otros modelos ASR especializados en vietnamita cantado en la información proporcionada.

## Limitaciones y advertencias

- Las canciones infantiles son un punto débil conocido: voces infantiles, voces tipo dibujo animado o de caricatura concentran los peores fallos (10 de los 30 fragmentos de evaluación con WER superior al 50 % en una ejecución hermana con los mismos datos), y la mayoría de esos fragmentos también fallan con la v1 y con el modelo base.
- Entrenado y evaluado con una única fuente de grabaciones de estudio; grabaciones en directo, karaoke y remezclas con mucha producción no han sido probadas.
- Alrededor del 3 % de los fragmentos de evaluación superan aún el 50 % de WER (pistas de acompañamiento densas, voces superpuestas).
- Los demás idiomas no son objetivo de este modelo; el rendimiento en vietnamita leído empeora respecto al base (WER 8,83 frente a 5,69 en FLEURS vi_vn).
- La etiqueta de idioma aprendida no constituye una identificación multilingüe real, ya que los datos de entrenamiento son casi exclusivamente vietnamitas.
- Riesgo de alucinación y de transcripciones incorrectas en audio fuera de dominio; el autor recomienda comparar con el modelo base antes de confiar en él para audio no musical o no vietnamita.
- Los resultados provienen de una sola ejecución y no han sido replicados; las correcciones de etiquetas no se verificaron por escucha.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Versión anterior (v1): https://huggingface.co/sunbv56/Qwen3-ASR-1.7B-Lyrics-Viet
- Dataset de entrenamiento: https://huggingface.co/datasets/sunbv56/song_dataset_training_20s_cleaned
