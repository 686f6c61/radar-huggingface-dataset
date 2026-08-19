# tryorato/orato-asr-hindi-v1

## Resumen

El modelo **tryorato/orato-asr-hindi-v1** es un sistema de reconocimiento automático del habla (ASR) especializado en hindi, inglés y su combinación habitual en contextos coloquiales (hinglish). Ha sido desarrollado por el equipo de Orato, una iniciativa orientada a construir modelos de voz para agentes conversacionales en tiempo real, y se publica bajo licencia Apache 2.0. Se trata de un ajuste fino completo (full fine-tune) del modelo base **Qwen/Qwen3-ASR-0.6B**, lo que le confiere una arquitectura compacta de aproximadamente 782 millones de parámetros, adecuada para despliegues con requisitos de latencia moderada.

El modelo está pensado específicamente para su integración en agentes de voz que operan en entornos donde el cambio de código entre hindi e inglés es frecuente, como centros de atención al cliente, asistentes virtuales o sistemas de transcripción en tiempo real. Su relevancia radica en que aborda un vacío en el ecosistema de ASR de código abierto para lenguas indias, ofreciendo una alternativa ligera y entrenada sobre una base moderna. El acceso al modelo está restringido (gated) y requiere aceptar las condiciones de uso en Hugging Face, aunque la licencia permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3-ASR-0.6B (encoder-decoder con atención) |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en fp32/fp16) |
| Idiomas soportados | hindi (hi), ingles (en) y mezcla hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de **Qwen3-ASR-0.6B**, que sigue un diseño encoder-decoder con atención estándar, optimizado para tareas de reconocimiento de voz. Al ser un ajuste fino completo, se han actualizado todos los pesos del modelo base durante el entrenamiento, en lugar de emplear técnicas de adaptación ligera como LoRA. Esto sugiere que el entrenamiento se realizó sobre un dataset específico de habla hindi e inglesa, aunque no se han publicado detalles sobre el volumen de datos, la composición exacta del corpus ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas particulares más allá de la propia elección del modelo base y el enfoque de fine-tuning completo.

## Capacidades

- Reconocimiento automático del habla en hindi e ingles, incluyendo transcripción de frases con alternancia de idiomas (code-switching) propia del habla coloquial.
- Diseñado para su uso en agentes de voz en tiempo real, por lo que prioriza latencia baja y procesamiento de audio en streaming.
- Soporta entrada de audio directamente (sin necesidad de texto intermedio) gracias a su naturaleza ASR.
- No se ha documentado soporte para tool calling, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje generativos, ya que su función es exclusivamente transcribir audio a texto.
- Capacidades multilingües limitadas a los idiomas declarados (hi, en), aunque el hinglish cubre una parte significativa del uso real en la India.

## Casos de uso

- **Atención al cliente automatizada en hindi**: el modelo puede transcribir en tiempo real las consultas de clientes que hablan hindi o hinglish, permitiendo a un agente virtual procesar la intención y responder de forma adecuada. Su diseño para agentes de voz lo hace adecuado para entornos de call center.
- **Transcripción de reuniones y videollamadas**: al soportar code-switching, puede transcribir conversaciones donde los participantes mezclan hindi e inglés, algo habitual en entornos corporativos indios, generando actas o resúmenes automáticos.
- **Subtitulación automática de contenido multimedia**: puede generar subtítulos en hindi o inglés para vídeos, podcasts o emisiones en directo, facilitando el acceso a audiencias que prefieren estos idiomas.
- **Asistentes de voz en dispositivos móviles**: integrable en aplicaciones de asistente personal que operan en hindi, permitiendo comandos de voz y dictado de mensajes sin necesidad de conexión a servicios cloud propietarios.
- **Sistemas de transcripción médica o legal**: en consultas o procedimientos donde se usa hindi, el modelo puede convertir audio en texto estructurado para expedientes, siempre que se valide la precisión en dominios especializados.
- **Análisis de sentimiento en llamadas**: combinado con un modelo de NLP posterior, permite extraer el tono y la intención de conversaciones telefónicas en hindi, útil para encuestas de satisfacción o control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen tablas comparativas con otros modelos ASR para hindi (como Whisper, IndicWav2Vec o Bhashini) en el repositorio ni en la documentación pública encontrada. Se recomienda evaluar el modelo con métricas estándar de ASR (WER, CER) sobre conjuntos de datos propios antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 782M parámetros, en fp16 se necesitan aproximadamente 1,6 GB de VRAM solo para los pesos, más overhead de activaciones y buffer de audio. Una GPU con 4 GB de VRAM sería suficiente para inferencia en batch pequeño, y 8 GB para mayor comodidad.
- **GPU recomendadas**: tarjetas de gama media como NVIDIA RTX 3060, RTX 4060 o superiores pueden ejecutar el modelo sin problemas. Para despliegues en servidor, una A10 o T4 es adecuada.
- **Cabe en GPU de consumo**: sí, cualquier GPU moderna con al menos 4 GB de VRAM puede ejecutarlo.
- **Opciones de despliegue**: al ser un modelo basado en Qwen3-ASR, puede servirse con frameworks compatibles con el formato safetensors, como Hugging Face Transformers, o mediante herramientas de inferencia optimizada como vLLM (si soporta la arquitectura ASR), aunque no se ha confirmado soporte explícito. También es posible usar ONNX Runtime o TensorRT si se convierte el modelo.
- **Latencia y throughput**: no se han publicado cifras oficiales. Dado el tamaño del modelo, se espera una latencia de inferencia en el orden de decenas de milisegundos por segmento de audio en GPU moderna, pero depende del hardware y del tamaño del chunk de audio.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Existen alternativas en el ecosistema ASR para hindi como los modelos Whisper de OpenAI (small, base, medium) o IndicWav2Vec, pero no se han encontrado benchmarks que comparen directamente este modelo con ellos. La comparativa queda pendiente de evaluación por parte del usuario.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo es gated en Hugging Face, lo que obliga a los usuarios a aceptar las condiciones de uso antes de descargarlo. Esto puede ser un obstáculo para integraciones automáticas.
- **Sesgos y errores de transcripción**: al ser un fine-tune de un modelo base, puede heredar sesgos del corpus de entrenamiento, especialmente en acentos regionales, ruido de fondo o habla rápida. No se han documentado evaluaciones de sesgo.
- **Riesgo de alucinación**: aunque los modelos ASR no generan texto libre, pueden producir transcripciones incorrectas en frases ambiguas o con bajo SNR (relación señal-ruido). Es recomendable implementar validación adicional en entornos críticos.
- **Limitaciones de idioma**: solo cubre hindi e inglés; no soporta otros idiomas indios (tamil, telugu, bengalí, etc.) ni variantes dialectales del hindi.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el acceso gated implica que el uso está condicionado a la aceptación de los términos del repositorio. Se debe revisar si hay cláusulas adicionales sobre uso comercial o redistribución.
- **Falta de documentación técnica**: no se han publicado detalles sobre el dataset de entrenamiento, hiperparámetros ni metodología de evaluación, lo que dificulta la reproducibilidad y la confianza en su rendimiento en dominios específicos.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/tryorato/orato-asr-hindi-v1)
- [Árbol de archivos del repositorio](https://huggingface.co/tryorato/orato-asr-hindi-v1/tree/main)
- [Publicación en LinkedIn sobre el lanzamiento de Orato ASR y TTS](https://www.linkedin.com/posts/anand-dubey-z2006_tryoratoorato-tts-hindi-v1-hugging-face-activity-7491489215734751232-A4tO)
- [Publicación en LinkedIn de Diwakar T. sobre el lanzamiento](https://www.linkedin.com/posts/activity-7491479794572984320-FGji)
- [Repositorio de evaluación de Orato (menciona el modelo TTS, no el ASR)](https://github.com/Alok-Fusion/orato_assessment/blob/main/README.md)
