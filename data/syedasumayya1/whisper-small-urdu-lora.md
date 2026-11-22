# syedasumayya1/whisper-small-urdu-lora

## Resumen

Whisper-small-urdu-lora es un adaptador LoRA para el modelo de reconocimiento automático del habla `openai/whisper-small`, especializado en urdu de Pakistán. Lo desarrolla syedasumayya1 y se publica bajo licencia Apache 2.0. El modelo base Whisper-small es un transformer encoder-decoder de OpenAI (arXiv:2212.04356) con aproximadamente 244 millones de parámetros, entrenado originalmente para transcripción multilingüe y traducción de voz. Este adaptador ajusta únicamente las proyecciones de atención (q_proj y v_proj) para mejorar el rendimiento en urdu sin reentrenar el modelo completo.

El problema que resuelve es concreto: el rendimiento de Whisper-small en urdu es deficiente. Según la model card, el modelo base obtiene un WER de 0,415 y un CER de 0,169 en el conjunto de test `ur_pk` de FLEURS, mientras que el adaptador reduce estas cifras a 0,316 y 0,112 respectivamente. Parte de la mejora se atribuye a la eliminación de bucles de repetición que afectaban a algunas muestras del modelo base.

Es relevante por su bajo coste de entrenamiento (71 minutos en una T4, 3,5 millones de parámetros entrenables, el 1,44 % del total) y por demostrar que un ajuste LoRA ligero puede mejorar sustancialmente un idioma de bajos recursos. Sin embargo, el propio autor advierte de sobreajuste y de que solo se ha evaluado en habla leída, no en habla conversacional o con ruido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA |
| Parámetros totales | Aproximadamente 244 M (modelo base Whisper-small); adaptador LoRA: 3,5 M entrenables (1,44 %) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (característica del modelo base Whisper-small) |
| Tipos de cuantización | No disponible (el repositorio solo contiene pesos safetensors del adaptador; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | Urdu (ur, variante de Pakistán) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base `openai/whisper-small` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Whisper-small, un transformer encoder-decoder con atención estándar y 244 millones de parámetros. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel, y el decoder genera texto autoregresivamente. La adaptación LoRA se configura con rango r=32, alpha=64 y dropout 0,05, aplicada exclusivamente a las proyecciones `q_proj` y `v_proj`. Esto da 3,5 millones de parámetros entrenables, el 1,44 % del total del modelo base.

El entrenamiento usó la configuración `ur_pk` del dataset FLEURS (Google), con 2.109 clips de entrenamiento; la validación se usó durante el entrenamiento y el test quedó reservado. Se realizaron 1.000 pasos con batch efectivo de 16, learning rate 1e-3, precisión fp16 y una única GPU T4, en aproximadamente 71 minutos. No se documenta uso de RLHF ni DPO (no aplica a ASR). El autor señala que el WER de validación dejó de mejorar alrededor del paso 250 mientras la pérdida de entrenamiento seguía bajando, lo que indica sobreajuste al pequeño conjunto de datos.

## Capacidades

- Reconocimiento automático del habla (transcripción) en urdu de Pakistán.
- Transcripción de habla leída, que es el dominio de entrenamiento y evaluación.
- No se documenta soporte de traducción voz-a-texto a otros idiomas en este adaptador.
- No se documenta soporte de tool calling ni function calling (no aplica a un modelo ASR).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al urdu; el modelo base es multilingüe, pero el adaptador está entrenado solo para urdu y no se ha evaluado en otros idiomas.
- No dispone de modo thinking, visión ni audio más allá de la transcripción estándar de Whisper.

## Casos de uso

- Transcripción de reuniones y entrevistas en urdu: el adaptador puede convertir audio de habla clara en texto con un WER de 0,316 en FLEURS, adecuado para actas y notas internas donde se tolere un 30 % de errores de palabra y se requiera revisión humana.
- Subtitulado de contenido audiovisual en urdu: integrado en un pipeline con WhisperProcessor, permite generar subtítulos para vídeos de formación o divulgación en urdu, con la ventaja de reducir los bucles de repetición que el modelo base producía en algunas muestras.
- Digitalización de archivos de audio en urdu: para bibliotecas, archivos sonoros o radios comunitarias que necesiten indexar grabaciones históricas de habla leída, el adaptador ofrece una mejora medible frente al modelo base sin requerir GPUs de gran tamaño.
- Prototipado rápido de ASR para urdu: al ser un adaptador LoRA de 3,5 millones de parámetros entrenable en una T4 en poco más de una hora, sirve como punto de partida para equipos que quieran ajustar aún más el modelo con sus propios datos.
- Investigación en idiomas de bajos recursos: útil como referencia reproducible de ajuste LoRA sobre Whisper con FLEURS, para comparar metodologías de adaptación eficiente en urdu.
- Asistentes de voz para atención al ciudadano en urdu: en entornos controlados de habla leída (por ejemplo, lectura de formularios o avisos), el adaptador puede transcribir consultas para su posterior procesamiento, siempre con verificación humana por la tasa de error.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test `ur_pk` de FLEURS (299 clips, texto normalizado):

| Modelo | WER | CER |
|---|---|---|
| openai/whisper-small (base) | 0,415 | 0,169 |
| Este adaptador LoRA | 0,316 | 0,112 |

El autor indica que algunas muestras del modelo base cayeron en bucles de repetición descontrolados y que el modelo ajustado no presentó ninguno. Excluyendo esos bucles, el WER del base sería aproximadamente 0,400 frente a 0,316 del adaptador, por lo que la mayor parte de la mejora se atribuye a un mejor reconocimiento del urdu y no solo a la eliminación de repeticiones. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K no aplican a un modelo ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper-small (244 M de parámetros) en fp16 requiere aproximadamente 0,5 GB de pesos; con overhead de activaciones y procesador de audio, cabe holgadamente en GPUs de 4-6 GB. El adaptador LoRA añade solo 3,5 M de parámetros (unos 7 MB en fp16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento documentado se realizó en una NVIDIA T4. Para inferencia son suficientes GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained` y `merge_and_unload`), y potencialmente llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no documentado en el repositorio). vLLM y TGI no documentados para este adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER (FLEURS ur_pk) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Whisper-small + LoRA urdu) | 244 M base + 3,5 M adaptador | 30 s por segmento | 0,316 | Apache 2.0 | Hugging Face |
| openai/whisper-small (base) | 244 M | 30 s por segmento | 0,415 | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | 30 s por segmento | No disponible en la información | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento | No disponible en la información | Apache 2.0 | Hugging Face |

No se dispone de resultados de otros adaptadores LoRA para urdu ni de comparativas con modelos ASR alternativos (por ejemplo, wav2vec2 o MMS) en la información proporcionada.

## Limitaciones y advertencias

- Sobreajuste: el WER de validación dejó de mejorar alrededor del paso 250 mientras la pérdida de entrenamiento seguía bajando; el autor indica que un entrenamiento más corto probablemente igualaría el resultado.
- Dominio limitado: entrenado y evaluado solo con habla leída (FLEURS); no se ha probado con habla ruidosa ni conversacional.
- Dificultades con nombres propios, números y palabras extranjeras, según la model card.
- Las referencias de FLEURS contienen espaciado de palabras defectuoso, lo que infla el WER; las cifras deben interpretarse con cautela.
- El adaptador solo cubre urdu; no se ha evaluado en otros idiomas aunque el modelo base sea multilingüe.
- Riesgo de alucinación y bucles de repetición: aunque el autor afirma que el adaptador no presentó bucles en el test, es un comportamiento conocido de Whisper que puede reaparecer en dominios distintos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de rendimiento en producción; se recomienda validación con datos propios.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syedasumayya1/whisper-small-urdu-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset FLEURS (paper): https://arxiv.org/abs/2205.12446
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
- Repositorio PEFT: https://github.com/huggingface/peft
