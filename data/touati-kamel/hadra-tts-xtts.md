# touati-kamel/Hadra-TTS-xtts

## Resumen

Hadra-TTS-xtts es un checkpoint de ajuste fino (fine-tuning) del modelo Coqui XTTS-v2, un sistema de síntesis de voz (TTS) autoregresivo basado en arquitectura GPT con un codificador de voz y un decodificador neuronal. Lo desarrolla el usuario de Hugging Face touati-kamel y está entrenado sobre colecciones de audio en darja argelina (árabe dialectal de Argelia), con el objetivo de generar voz sintética en ese dialecto concreto, que habitualmente no está cubierto por los modelos TTS multilingües estándar.

El modelo se distribuye como un checkpoint de 5,8 GB en precisión FP32, con tres voces identificadas (`kahwa`, `rawi` y `loubna`) y un estado de entrenamiento declarado de 2 épocas completadas de 10 previstas. Se integra en el ecosistema Coqui TTS a través de la librería `TTS` y la API `tts_to_file`, lo que permite su uso en Python con PyTorch y CUDA.

Es relevante porque aborda un caso de uso poco frecuente: TTS para un dialecto árabe con mezcla de código (code-switching) con francés, algo que los modelos comerciales rara vez cubren. Sin embargo, el checkpoint está en un estado intermedio de entrenamiento y la información publicada es muy limitada, por lo que debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoregresiva basada en GPT (Coqui XTTS-v2), con codificador de voz y decodificador neuronal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto TTS, no contexto conversacional) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en FP32) |
| Idiomas soportados | Árabe (`ar`) en la inferencia de ejemplo; orientado a darja argelina con code-switching a francés |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`speakers_xtts.pth`, `config.json`) |

## Arquitectura y entrenamiento

El modelo parte de Coqui XTTS-v2, un sistema TTS autoregresivo que combina un transformer tipo GPT para la predicción de tokens de audio discretos con un codificador de altavoz (speaker encoder) que permite clonación de voz a partir de una muestra de referencia (`speaker_wav`). XTTS-v2 es multilingüe por diseño y soporta clonación zero-shot, pero el ajuste fino aquí se ha realizado específicamente sobre audio en darja argelina.

Según la model card, el entrenamiento se realizó en precisión FP32 completa, con descenso estable de la entropía cruzada y sin divergencias NaN, durante 2 épocas de un plan de 10. Se definen tres hablantes: `kahwa` (presentador de podcast urbano conversacional, con realización velar de `g`), `rawi` (narrador masculino expresivo, con realización de `q`) y `loubna` (voz narrativa femenina melódica). No se especifican el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (en TTS no es habitual). La innovación principal es la adaptación de un modelo multilingüe a un dialecto con mezcla de árabe y francés, pero no se documentan detalles técnicos adicionales sobre el proceso de ajuste.

## Capacidades

- Síntesis de voz (TTS) en darja argelina a partir de texto.
- Clonación de voz mediante muestra de referencia (`speaker_wav`) gracias al codificador de hablante de XTTS-v2.
- Soporte de tres voces predefinidas con características fonéticas diferenciadas (`kahwa`, `rawi`, `loubna`).
- Manejo de code-switching árabe-francés en el texto de entrada, como muestra el ejemplo de la model card.
- Inferencia en GPU vía PyTorch y CUDA con la librería Coqui TTS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la muestra de referencia.

## Casos de uso

- **Locución de podcasts y contenido urbano en darja**: la voz `kahwa` está diseñada para un registro conversacional de presentador de podcast, lo que permite generar introducciones, cuñas o resúmenes de episodios en dialecto argelino sin necesidad de un locutor humano.
- **Narración de audiolibros y contenido divulgativo**: las voces `rawi` y `loubna` cubren registros narrativos masculino y femenino, adecuadas para convertir textos largos en audio para plataformas de audiolibros o accesibilidad.
- **Doblaje y localización de contenido al darja**: el soporte de code-switching árabe-francés permite adaptar guiones que mezclan ambas lenguas, frecuente en medios argelinos, manteniendo la naturalidad del dialecto.
- **Asistentes de voz para aplicaciones locales**: integración en apps de información, transporte o servicios públicos dirigidas a usuarios argelinos que se comunican en darja y no en árabe estándar.
- **Generación de voces para vídeos y redes sociales**: creación de narraciones para contenido corto en redes con una voz dialectal reconocible, usando la clonación de voz para mantener consistencia de marca.
- **Prototipado de interfaces conversacionales**: pruebas de concepto de IVR o chatbots de voz en darja, aprovechando la API de Coqui TTS para integrar la síntesis en pipelines existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint ocupa 5,8 GB en FP32, por lo que se requiere al menos esa cantidad de memoria más el overhead de activaciones y del codificador de voz. En la práctica, se recomienda una GPU con 8-12 GB de VRAM como mínimo.
- GPU recomendadas: no disponibles de forma oficial; por el tamaño del checkpoint, cabría esperar funcionamiento en RTX 3090, RTX 4090, A100 o H100, aunque no hay datos publicados de latencia ni throughput.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti), aunque no está confirmado por el autor.
- Opciones de despliegue: Coqui TTS (`TTS.api`), PyTorch con CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hadra-TTS-xtts | TTS autoregresivo (fine-tune XTTS-v2) | no disponible | no aplica | Darja argelina (+ francés) | no disponible | Hugging Face (11 descargas) |
| Coqui XTTS-v2 (base) | TTS autoregresivo | no disponible | no aplica | Multilingüe (17 idiomas) | Coqui Public Model License (no comercial) | Público, ampliamente usado |
| Otros TTS multilingües (p. ej. VITS, Bark) | TTS neuronal | no disponible | no aplica | Variable | Variable | Público |

La comparativa se limita a señalar la relación con el modelo base, ya que no se dispone de datos de rendimiento del checkpoint ajustado ni de alternativas específicas para darja argelina.

## Limitaciones y advertencias

- Checkpoint en estado intermedio: solo 2 de 10 épocas completadas, por lo que la calidad de la síntesis puede ser inferior a la de un modelo totalmente entrenado.
- Dataset de entrenamiento no documentado: se desconoce el número de horas de audio, la procedencia y los permisos de las grabaciones, lo que plantea dudas sobre sesgos y sobre la legalidad de su uso comercial.
- Licencia no especificada: al derivar de Coqui XTTS-v2, que tiene una licencia con restricciones para uso comercial (Coqui Public Model License), es necesario verificar los términos antes de cualquier despliegue en producción.
- Idiomas limitados: el ajuste está orientado a darja argelina; el rendimiento en árabe estándar u otros dialectos no está garantizado.
- Riesgo de alucinación de audio: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos fuera del dominio de entrenamiento.
- Sin benchmarks ni métricas objetivas publicadas (MOS, WER, similitud de hablante), lo que impide evaluar su calidad de forma cuantitativa.
- Repositorio con muy poca tracción (11 descargas, 0 likes) y sin pipeline declarado en Hugging Face, lo que sugiere un proyecto personal sin validación comunitaria.
- No se documentan mecanismos de seguridad, filtrado de contenido ni limitaciones de longitud de texto de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/touati-kamel/Hadra-TTS-xtts
- Coqui TTS (repositorio del framework): https://github.com/coqui-ai/TTS
- XTTS-v2 en Hugging Face: https://huggingface.co/coqui/XTTS-v2
