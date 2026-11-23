# Trelis/duplex-1-200m

## Resumen

duplex-1-200m es un modelo de voz a voz (speech-to-speech) en modo full-duplex desarrollado por Trelis. Se trata de un checkpoint de investigación entrenado desde pesos aleatorios sobre habla conversacional en inglés, cuyo objetivo es modelar simultáneamente los dos canales de una conversación (hablante A y hablante B) en lugar de limitarse a la generación de un único flujo de audio. Con 225.455.616 parámetros y un repositorio de 0,9 GB, es un modelo deliberadamente pequeño, pensado para experimentación y para validar arquitecturas de diálogo hablado completo.

Su relevancia radica en que aborda el problema del full-duplex real: predecir el turno de ambos interlocutores de forma continua, con solapamientos y pausas, algo que los asistentes de voz tradicionales (basados en turnos estrictos ASR → LLM → TTS) no resuelven de forma nativa. El autor lo describe explícitamente como un checkpoint de investigación que no constituye un asistente utilizable: en su propio benchmark, el habla generada contiene aproximadamente dos tercios de las palabras confirmadas por minuto del habla real.

El modelo trabaja sobre tokens de audio del códec Mimi y se distribuye con licencia Apache 2.0, lo que permite su uso y modificación con fines de investigación y desarrollo. No se ha publicado información sobre arquitectura interna detallada, número de tokens de entrenamiento ni procesos de alineación (RLHF/DPO) en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de voz a voz full-duplex; opera sobre tokens del codec Mimi) |
| Parametros totales | 225.455.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las muestras se generan en ventanas de 20 s tras una apertura de 10 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La documentación disponible no detalla la arquitectura interna (tipo de transformer, número de capas, dimensión oculta, mecanismo de atención ni esquema de fusión de los dos canales). Lo que sí se explicita es que el modelo es full-duplex y que trabaja en el dominio de tokens del códec Mimi: las muestras publicadas se decodifican desde tokens Mimi con un mismo decodificador, mezclando ambos hablantes a mono. El modelo genera simultáneamente las dos pistas de hablante a partir de una apertura de 10 segundos (240.000 muestras a 24 kHz) y continúa durante 20 segundos adicionales.

El entrenamiento parte de pesos aleatorios (no es un fine-tuning de un modelo preexistente) sobre tres conjuntos de datos publicados por el propio autor: `Trelis/duplex-pre-training-yodas3-mimi-v2`, `Trelis/duplex-pre-training-podcasts-mimi-v2` y `Trelis/duplex-conversational-podcasts-mimi-v2`. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La evaluación publicada se realiza sobre 14 fragmentos de pódcasts conversacionales retenidos (fuera de entrenamiento) y sobre 58 llamadas del test split de AppTek Call-Center Dialogues, un conjunto en el que el modelo no fue entrenado.

## Capacidades

- Generación de voz a voz full-duplex: produce simultáneamente las dos pistas de hablante de una conversación, no un único flujo de audio.
- Continuación de conversaciones habladas a partir de una apertura de audio de 10 segundos, con generación de 20 segundos adicionales por pista.
- Modelado de solapamientos y dinámica conversacional (turnos, pausas, interrupciones) implícito en el paradigma full-duplex.
- Trabajo en el espacio de tokens del códec Mimi, lo que permite decodificar el audio generado con el decodificador Mimi estándar.
- Capacidad limitada de seguimiento semántico: el autor indica que en su benchmark el habla generada contiene aproximadamente dos tercios de las palabras confirmadas por minuto del habla real.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada más allá del contexto hablado, ni soporte multilingüe (solo inglés).

## Casos de uso

- Investigación en modelos de diálogo hablado full-duplex: sirve como checkpoint de referencia y punto de partida para estudiar cómo modelar dos canales de hablante de forma conjunta, gracias a su tamaño reducido (225 M de parámetros) y a su licencia Apache 2.0.
- Experimentación con el códec Mimi: al operar sobre tokens Mimi, permite probar pipelines de codificación/decodificación de audio y evaluar la fidelidad de la reconstrucción en conversaciones generadas.
- Reproducción de benchmarks de conversación: el autor publica un conjunto de evaluación con pódcasts retenidos y llamadas de AppTek, lo que facilita replicar y comparar resultados frente a duplex-0.
- Estudio de naturalidad y ritmo conversacional: útil para analizar métricas como palabras por minuto, solapamientos y coherencia de turnos en habla generada, aunque el propio autor advierte que la tasa de palabras es inferior a la real.
- Prototipado de agentes de voz en entornos controlados: puede integrarse en un pipeline de investigación para generar respuestas de ambos interlocutores en escenarios de call-center o pódcast, siempre con supervisión humana y sin uso en producción.
- Base para fine-tuning sobre dominios concretos: al ser un modelo pequeño entrenado desde cero, es un candidato razonable para adaptación a dominios específicos (atención al cliente, entrevistas) en entornos de investigación con datos propios.
- Docencia y divulgación: su tamaño y la disponibilidad de muestras de audio comparativas lo hacen adecuado para explicar conceptos de full-duplex, códecs neuronales y evaluación de habla generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta muestras de audio cualitativas (pódcasts retenidos y llamadas de AppTek) comparando duplex-0 y duplex-1, y una afirmación del autor: el habla generada contiene aproximadamente dos tercios de las palabras confirmadas por minuto del habla real. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas de ASR/WER.

## Requisitos de hardware

- VRAM estimada para inferencia: con 225 M de parámetros, en fp32 serían aproximadamente 0,9 GB de pesos; en fp16, unos 0,45 GB; en int8, unos 0,23 GB. A ello hay que sumar el decodificador Mimi y el búfer de audio, por lo que un despliegue completo cabe holgadamente en menos de 2-3 GB de VRAM en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia sin problemas. Para lotes grandes o evaluación masiva, una A100 o H100 aporta margen pero no es necesaria.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas puntuales, aunque con mayor latencia.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de audio sobre tokens Mimi, el despliegue requeriría un pipeline propio con el codificador/decodificador Mimi y el runtime del modelo.
- Latencia y throughput estimados: no disponibles. Las muestras publicadas se generan en ventanas de 20 segundos por pista, pero no se aportan cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Full-duplex | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Trelis/duplex-1-200m | 225.455.616 | no disponible | Sí | en | Apache 2.0 | Hugging Face |
| Trelis/duplex-0 | no disponible | no disponible | Sí | en | no disponible | Hugging Face |
| Moshi (Kyutai) | no disponible en la información proporcionada | no disponible | Sí | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con duplex-0, el checkpoint anterior del mismo autor, del que se incluyen muestras de audio comparativas en la model card. No se dispone de datos de benchmarks ni de especificaciones técnicas de duplex-0 ni de otros modelos full-duplex en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un asistente utilizable: el propio autor lo describe como un checkpoint de investigación y advierte que su habla contiene aproximadamente dos tercios de las palabras confirmadas por minuto del habla real.
- Riesgo de alucinación y de contenido incoherente: al ser un modelo generativo de habla entrenado desde cero, puede producir palabras, turnos o solapamientos sin sentido, especialmente fuera del dominio de entrenamiento.
- Limitación idiomática: solo se declara soporte de inglés; no hay evidencia de generalización a otros idiomas.
- Sesgos: no se documentan análisis de sesgos; al entrenarse sobre pódcasts y llamadas de call-center en inglés, puede reproducir sesgos de esos dominios (acentos, registros, géneros, temáticas).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado de investigación del modelo y su calidad limitada desaconsejan su uso en producción sin una evaluación exhaustiva.
- Caveat de evaluación: las muestras publicadas son cualitativas y seleccionadas aleatoriamente con semilla fija, no un benchmark cuantitativo; no se aportan métricas objetivas de inteligibilidad, WER ni naturalidad.
- Dependencia del códec Mimi: el audio generado está condicionado por el decodificador Mimi, y la calidad final depende de la fidelidad de la reconstrucción del códec.
- Sin datos de entrenamiento detallados: no se especifican tokens, composición exacta del dataset ni etapas de alineación, lo que dificulta evaluar la cobertura y los sesgos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Trelis/duplex-1-200m
- Modelo anterior duplex-0: https://huggingface.co/Trelis/duplex-0
- Dataset de preentrenamiento (Yodas3 + Mimi): https://huggingface.co/datasets/Trelis/duplex-pre-training-yodas3-mimi-v2
- Dataset de preentrenamiento (pódcasts + Mimi): https://huggingface.co/datasets/Trelis/duplex-pre-training-podcasts-mimi-v2
- Dataset conversacional (pódcasts + Mimi): https://huggingface.co/datasets/Trelis/duplex-conversational-podcasts-mimi-v2
- Conjunto de evaluación AppTek Call-Center Dialogues: https://huggingface.co/datasets/apptek-com/apptek_callcenter_dialogues
