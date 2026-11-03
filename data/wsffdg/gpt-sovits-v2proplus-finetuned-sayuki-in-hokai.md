# wsffdg/GPT-SoVITS-v2ProPlus-Finetuned-Sayuki-in-Hokai

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del sistema de síntesis de voz GPT-SoVITS, en su variante v2ProPlus, orientado a clonar la voz en chino mandarín del personaje March 7th (三月七) del videojuego *Honkai: Star Rail*. No se trata de un modelo de lenguaje generativo ni de un transformer de gran escala, sino de un par de pesos especializados para TTS de un único hablante: un modelo SoVITS (VITS condicionado) y un modelo GPT de texto-a-semántica (t2s). El autor es el usuario de HuggingFace `wsffdg`, que publica los pesos junto con un repositorio de GitHub con el pipeline completo de entrenamiento.

El interés técnico del artefacto está en su metodología de curación de datos: 1459 clips (117,6 minutos) extraídos de las voces públicas del juego, seleccionados mediante un muestreo de cobertura voraz en cuatro capas (fonemas, prosodia, emoción y calidad) con cuotas emocionales, y validados contra un conjunto de 110 clips sin fuga. El entrenamiento se realizó en una RTX 4090 D (8 épocas para SoVITS, 15 para GPT), lo que lo sitúa en el rango de lo reproducible en hardware de consumo.

Es relevante ahora porque ejemplifica una práctica habitual en la comunidad: adaptar sistemas TTS open source a voces de personajes con datasets pequeños pero cuidadosamente muestreados. Conviene subrayar que no incluye audio del juego y que su licencia no está declarada explícitamente, lo que limita seriamente cualquier uso más allá de la investigación personal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus: modelo SoVITS (VITS condicionado) + modelo GPT de texto-a-semántica (t2s), con codificadores de texto BERT (chinese-roberta-wwm-ext-large) y de audio HuBERT (chinese-hubert-base) |
| Parámetros totales | no disponible (pesos de 400 MB para SoVITS y 155 MB para GPT; recuento de parámetros no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por fragmentos; la referencia de audio debe ser de 4,5 a 10 s) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en fp32/fp16 según el checkpoint; el autor recomienda `is_half: True` en inferencia) |
| Idiomas soportados | chino (zh-CN) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (SoVITS, con dict de configuración embebido) y `.ckpt` (GPT t2s) |

## Arquitectura y entrenamiento

El sistema se apoya en la arquitectura GPT-SoVITS v2ProPlus (commit de referencia `b4570b8`). El componente SoVITS es un modelo generativo tipo VITS condicionado por representaciones semánticas y de hablante, mientras que el componente GPT (t2s) predice tokens semánticos a partir del texto y de un prompt de referencia. Ambos se combinan en inferencia: el GPT genera la secuencia semántica y el SoVITS la convierte en waveform. La entrada de texto pasa por un codificador BERT chino y la referencia de audio por un codificador HuBERT chino, de modo que el modelo no aprende una identidad de hablante fija, sino que la condiciona con el audio de referencia proporcionado en cada llamada.

El ajuste fino se realizó sobre 1459 clips (117,6 minutos) de diálogos en chino extraídos de las voces públicas del juego, con un muestreo de cobertura voraz en cuatro capas (fonemas, prosodia, emoción y calidad) más cuotas emocionales; el conjunto de validación de 110 clips se mantuvo aislado para evitar fuga de datos. El entrenamiento se ejecutó en una RTX 4090 D: 8 épocas para SoVITS (batch 8, fp16) y 15 épocas para GPT (batch 12). No se documenta uso de RLHF ni DPO, algo esperable en un sistema TTS de este tipo. El autor advierte de que en entornos con media GPU es necesario definir `TORCH_CUDNN_V8_API_DISABLED=1`, ya que de lo contrario el frontend de cuDNN v8 reconstruye el grafo en cada convolución de longitud variable y la latencia se dispara hasta unos 35 s por frase.

## Capacidades

- Síntesis de voz (text-to-speech) en chino mandarín con la identidad vocal del personaje March 7th.
- Clonación de voz condicionada por referencia: requiere un audio de referencia de 4,5 a 10 s y su transcripción literal en cada inferencia.
- Control de expresividad y prosodia mediante los parámetros de muestreo (`top_k`, `top_p`, `temperature`, `speed_factor`); el autor recomienda `top_k 15`, `top_p 1.0`, `temperature 1.0`.
- Generación de audio a velocidad ajustable mediante `speed_factor`.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es exclusivamente un modelo de síntesis de voz.
- No dispone de capacidades multimodales de entrada (visión, audio de entrada más allá de la referencia de voz) ni de modo "thinking".
- Capacidad multilingüe limitada al chino; no se documenta soporte de otros idiomas.

## Casos de uso

- **Prototipado de chatbots de rol con voz**: integrado en un pipeline de diálogo, el modelo permite dotar de voz al personaje en una aplicación de roleplay personal, usando una referencia de audio propia y autorizada en cada sesión y ajustando la velocidad con `speed_factor` para adaptarse al ritmo conversacional.
- **Investigación en clonación de voz con pocos datos**: sirve como caso de estudio reproducible de ajuste fino de GPT-SoVITS con ~2 horas de audio y una metodología de selección de datos documentada (muestreo de cobertura en cuatro capas), útil para comparar estrategias de curación de datasets pequeños.
- **Generación de doblaje para mods y contenido fan no comercial**: permite sintetizar líneas nuevas en chino para vídeos o modificaciones de juego, siempre que el usuario aporte su propia referencia de voz y respete los derechos del personaje y del estudio.
- **Evaluación de robustez de TTS en dominios restringidos**: al estar entrenado sobre un registro concreto (diálogo diario de un personaje), es adecuado para medir cómo se degrada un sistema VITS+GPT cuando se sale de la distribución de entrenamiento (texto técnico, nombres propios, frases largas).
- **Pruebas de latencia y despliegue en hardware de consumo**: con pesos de 400 MB y 155 MB, permite experimentar con despliegues en una sola GPU (por ejemplo, RTX 4090) y medir el impacto de la bandera `TORCH_CUDNN_V8_API_DISABLED` en el rendimiento, tal como documenta el autor.
- **Generación de audiolibros o locuciones de prueba en chino**: para contenido interno o de investigación donde se necesite una voz consistente y expresiva, con control de velocidad y prosodia, sin salir del ámbito no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas objetivas (MOS, CMOS, WER, similitud de hablante) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Con pesos de 400 MB (SoVITS) y 155 MB (GPT) más los codificadores BERT y HuBERT, el modelo cabe holgadamente en GPUs de consumo; el autor reporta entrenamiento e inferencia en una RTX 4090 D.
- **GPU recomendadas**: RTX 4090 / 4090 D (validada por el autor); cualquier GPU NVIDIA con suficiente VRAM para los codificadores auxiliares debería ser viable, aunque no se documentan pruebas en otras tarjetas.
- **¿Cabe en GPU de consumo?**: sí, según la evidencia del autor en RTX 4090 D; no se confirma en tarjetas de gama media o baja.
- **Opciones de despliegue**: entorno GPT-SoVITS oficial (Python, PyTorch) mediante la API `TTS_infer_pack.TTS`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no se publican cifras de throughput. El autor advierte de que, sin `TORCH_CUDNN_V8_API_DISABLED=1` en media GPU, la latencia puede alcanzar ~35 s por frase debido a la reconstrucción del grafo de cuDNN v8 en convoluciones de longitud variable.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-SoVITS v2ProPlus Fine-tuned — March 7th (este repo) | TTS + clonación (SoVITS + GPT t2s) | zh | 1459 clips / 117,6 min, voz de personaje | no disponible | HuggingFace (0 descargas, 0 likes) |
| GPT-SoVITS v2ProPlus (base) | TTS + clonación | múltiples (según versión) | corpus multilingüe del proyecto | según repositorio oficial | GitHub / HuggingFace |
| XTTS-v2 (Coqui) | TTS + clonación zero-shot | multilingüe | corpus multilingüe | Coqui Public Model License (no comercial) | HuggingFace |
| OpenVoice (MyShell) | Clonación de voz | multilingüe | corpus multilingüe | MIT (con restricciones de uso) | GitHub / HuggingFace |

La comparación es aproximada: este repositorio es un ajuste fino de un único hablante sobre GPT-SoVITS, no un modelo base, por lo que su alcance es mucho más estrecho que el de XTTS-v2 u OpenVoice. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- **Licencia no declarada**: el repositorio no especifica licencia, lo que impide determinar legalmente las condiciones de uso comercial o de redistribución.
- **Derechos de voz e imagen**: el modelo clona la voz de un personaje de *Honkai: Star Rail*; el autor declara explícitamente que no existe relación, aprobación ni autorización de miHoYo, del estudio de doblaje ni de la actriz de voz. El uso puede infringir derechos de voz y de propiedad intelectual.
- **Restricción a uso no comercial**: la model card limita el proyecto a investigación personal y roleplay no comercial; no debe emplearse en producción comercial.
- **Dependencia de audio de referencia**: en cada inferencia se necesita un audio de referencia propio (4,5 a 10 s) con su transcripción literal; el repositorio no incluye audio del juego.
- **Idioma único**: solo chino; el rendimiento en otros idiomas no está soportado ni evaluado.
- **Riesgo de alucinación acústica**: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas fuera de la distribución de entrenamiento (texto técnico, nombres propios, frases largas).
- **Dataset pequeño y de dominio restringido**: 117,6 minutos de diálogo diario de un personaje implican un registro limitado; la expresividad fuera de ese registro puede degradarse.
- **Sesgos**: al derivar de una única voz de personaje, el modelo reproduce sus características prosódicas y de estilo; no es adecuado para representar diversidad de hablantes.
- **Caveat de producción**: la latencia en media GPU puede ser muy alta (~35 s/frase) sin la variable de entorno recomendada; no se documentan pruebas de escalado ni de concurrencia.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; proyecto recién publicado y sin validación externa.

## Enlaces

- [HuggingFace: wsffdg/GPT-SoVITS-v2ProPlus-Finetuned-Sayuki-in-Hokai](https://huggingface.co/wsffdg/GPT-SoVITS-v2ProPlus-Finetuned-Sayuki-in-Hokai)
- [GitHub del autor: gptsovits-sanyueqi (scripts y método de selección de datos)](https://github.com/wsffdg-123/gptsovits-sanyueqi)
- [GPT-SoVITS (repositorio oficial, RVC-Boss)](https://github.com/RVC-Boss/GPT-SoVITS)
