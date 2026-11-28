# touati-kamel/Hadra-TTS-piper

## Resumen

Hadra-TTS-piper es un modelo de síntesis de voz (text-to-speech) neuronal ultraligero especializado en darja argelina (الدارجة الجزائرية), la variante dialectal del árabe hablada en Argelia. Lo desarrolla el usuario touati-kamel y se publica bajo licencia MIT en Hugging Face. El modelo parte de la arquitectura VITS (Conditional Variational Autoencoder with Adversarial Training and Normalizing Flows) y se exporta a ONNX Runtime mediante el ecosistema Piper, lo que lo orienta a inferencia en CPU y dispositivos de borde.

El problema que resuelve es la ausencia de voces neuronales de calidad para un dialecto con escasa representación en los sistemas TTS comerciales y académicos, habitualmente centrados en árabe estándar moderno (MSA) o en inglés. Hadra-TTS-piper cubre fenómenos propios de la darja argelina como el code-switching con francés transliterado, el léxico coloquial juvenil y la sintaxis de cantidades y moneda local. Con un tamaño de repositorio de 0,1 GB y un checkpoint ONNX de aproximadamente 63 MB, el modelo sintetiza audio a un factor de tiempo real (RTF) medio de 0,124x en CPU, es decir, más de ocho veces más rápido que el tiempo real.

La relevancia actual del modelo radica en su encaje en despliegues de domótica y asistentes de voz locales (Home Assistant, Raspberry Pi) donde no hay GPU disponible y la latencia y el consumo importan. No obstante, la información publicada es limitada: no se detallan el corpus de entrenamiento, el número de horas de audio ni métricas objetivas de calidad (MOS, WER), por lo que la evaluación disponible se apoya en el banco de pruebas cualitativo del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Conditional VAE con entrenamiento adversario y normalizing flows), exportado a ONNX Runtime |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS; sin ventana de contexto de texto definida) |
| Tipos de cuantizacion | no disponible (se distribuye un grafo ONNX de ~63 MB; no se documentan variantes cuantizadas) |
| Idiomas soportados | ar (árabe), ary / arq (darja argelina), con code-switching hacia francés transliterado |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) con configuración JSON (`model.onnx.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema TTS de extremo a extremo que combina un codificador de texto, un prior condicional con normalizing flows, un decodificador generativo y un discriminador adversario durante el entrenamiento. Esta arquitectura permite generar audio de forma no autorregresiva en una sola pasada, lo que explica su baja latencia. La exportación a ONNX Runtime y la integración con Piper permiten ejecutar la inferencia en CPU sin dependencias de GPU, con un grafo de un solo hablante (`num_speakers = 1`).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, la duración total de audio ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La model card indica que se trata de un ajuste fino específico para darja argelina, pero no documenta la receta. La innovación destacable es de ingeniería más que de modelado: la calibración de tres perfiles acústicos (Kahwa, Rawi y Loubna) mediante los parámetros `length_scale` y `noise_scale`, que permiten variar la cadencia y la expresividad sin reentrenar el modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en darja argelina a partir de texto en árabe.
- Tres personas acústicas precalibradas: Kahwa (conversacional, `length_scale` 0,95; `noise_scale` 0,667), Rawi (narrativa, 1,15; 0,667) y Loubna (femenina expresiva, 0,90; 0,667).
- Manejo de code-switching con términos franceses transliterados integrados en la frase (por ejemplo, «c'est bon», «en retard»).
- Cobertura de léxico coloquial urbano y juvenil, partículas discursivas y expresiones idiomáticas argelinas.
- Pronunciación de números, cantidades y sintaxis de moneda local (centimos, dinares, «ملاين», «دورو», «ميات ألف»).
- Síntesis de frases largas de más de 20 segundos con prosodia sostenida y pausas de respiración.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No se documentan capacidades de visión, audio de entrada ni clonación de voz.

## Casos de uso

- Asistentes de voz para domótica local: integración en Home Assistant mediante Piper para anuncios y respuestas en darja argelina, ejecutándose en CPU de un dispositivo doméstico sin GPU y con RTF de 0,124x.
- Notificaciones y avisos en dispositivos de borde: generación de mensajes hablados en Raspberry Pi para sistemas de alarma, recordatorios o paneles informativos, aprovechando el checkpoint de 63 MB y la inferencia sobre ONNX Runtime.
- Audiolibros y narración de contenido folclórico: uso de la persona Rawi (`length_scale` 1,15) para cuentos, refranes y relatos tradicionales argelinos con cadencia pausada y pausas meditadas.
- Contenido educativo y cuentos infantiles: empleo de la persona Loubna (`length_scale` 0,90) para material de e-learning, cuentos y notificaciones amables dirigidas a público infantil.
- Atención al cliente y bots conversacionales en dialecto: la persona Kahwa permite respuestas habladas con cadencia conversacional natural en aplicaciones de soporte telefónico o chatbots de voz orientados a usuarios argelinos.
- Locución de podcasts y piezas breves: generación de intros, cortinillas y segmentos narrados en darja con code-switching francés, sin necesidad de estudio de grabación ni de un hablante nativo disponible.
- Accesibilidad y lectura de textos: conversión de texto en árabe argelino a voz para usuarios con discapacidad visual o para lectura de contenidos digitales en dispositivos de bajo consumo.

## Benchmarks y rendimiento

El autor publica un banco de pruebas cualitativo de 75 clips (25 prompts × 3 personas) distribuido en cinco niveles de estrés lingüístico. No se aportan métricas objetivas como MOS, WER ni comparaciones con otros modelos TTS.

| Nivel de prueba | Foco | Prompts | Personas | Estado | RTF medio (CPU) |
|---|---|---|---|---|---|
| Tier 1 | Saludos panargelinos y code-switching francés | 5 | 3 | 100% PASS | 0,121x |
| Tier 2 | Darja urbana y juvenil | 5 | 3 | 100% PASS | 0,124x |
| Tier 3 | Números, moneda y cantidades | 5 | 3 | 100% PASS | 0,128x |
| Tier 4 | Refranes, sabiduría popular y humor | 5 | 3 | 100% PASS | 0,122x |
| Tier 5 | Frases largas de más de 20 s | 5 | 3 | 100% PASS | 0,125x |
| Global | Suite completa | 25 | 3 (75 clips) | 100% PASS | 0,124x |

El criterio de «PASS» no se define cuantitativamente en la información disponible. El dato de rendimiento más relevante es el RTF de 0,124x: un clip de 10 segundos se sintetiza en aproximadamente 1,24 segundos en un solo núcleo de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo documentado; el modelo está pensado para CPU y ONNX Runtime. No se publica consumo de memoria en GPU.
- GPU recomendadas: no se documentan; el quickstart usa `use_cuda=False`. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay cifras publicadas.
- Cabe en GPU de consumo: sí, por tamaño (63 MB), aunque el caso de uso previsto es CPU.
- Cabe en dispositivos de borde: sí; la model card lo orienta explícitamente a Raspberry Pi y Home Assistant.
- Opciones de despliegue: Piper (`piper-tts` en Python), ONNX Runtime, integración con Home Assistant. No se documentan vLLM, llama.cpp ni TGI (no aplican a un modelo TTS).
- Latencia y throughput: RTF medio de 0,124x en CPU, con un rango de 0,121x a 0,128x según el nivel de prueba; un clip de 10 s tarda unos 1,24 s en un núcleo de CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Tipo | Idiomas | Tamano | Licencia | Despliegue en CPU |
|---|---|---|---|---|---|
| Hadra-TTS-piper | VITS / ONNX (Piper) | Darja argelina (ar, ary) | ~63 MB | MIT | Sí, RTF 0,124x |
| Piper (voces estándar) | VITS / ONNX | Múltiples, principalmente europeos | Variable | MIT | Sí |
| Coqui TTS (XTTS) | TTS neuronal multiidioma | Múltiples | Mayor | MPL-2.0 / Coqui | Parcial |
| Modelos TTS comerciales (p. ej., cloud) | Propietario | Múltiples, sin darja específica | no disponible | Propietaria | No (API) |

Los datos de Coqui TTS y de los servicios comerciales no proceden de la información proporcionada y se incluyen solo como referencia de categoría; no se dispone de cifras de rendimiento comparables.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre un dialecto con variación regional interna (Orán, Argel, etc.), la representatividad de acentos y registros es incierta.
- Riesgo de alucinación en el sentido de pronunciación incorrecta de términos fuera del dominio (nombres propios, tecnicismos, préstamos de otros idiomas distintos del francés).
- El alcance lingüístico es limitado: darja argelina y code-switching francés; no cubre árabe estándar moderno ni otras variedades magrebíes de forma garantizada.
- No se publican métricas objetivas de calidad (MOS, WER) ni detalles del corpus de entrenamiento, lo que dificulta una evaluación rigurosa antes de producción.
- El criterio de «100% PASS» del banco de pruebas no está definido cuantitativamente.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de las dependencias (Piper, ONNX Runtime) y de los datos de entrenamiento, no documentados.
- Al ser un modelo de un solo hablante (`num_speakers = 1`), las tres personas se obtienen variando parámetros de duración y ruido, no mediante voces entrenadas independientes.
- No apto para tareas de comprensión, razonamiento o generación de texto: es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/touati-kamel/Hadra-TTS-piper
- Dashboard de benchmarks en vivo: https://hadra-piper-benchmark.netlify.app/
- Repositorio de Piper: https://github.com/rhasspy/piper
- Checkpoint ONNX: https://huggingface.co/touati-kamel/Hadra-TTS-piper/resolve/main/model.onnx
- Configuración JSON: https://huggingface.co/touati-kamel/Hadra-TTS-piper/resolve/main/model.onnx.json
