# TheStageAI/pocket-tts-100m-el

## Resumen

pocket-tts-100m-el es un paquete de motores Core ML y ANE (Apple Neural Engine) para el modelo de síntesis de voz Pocket TTS, en su variante griega de 100 millones de parámetros. Lo publica TheStageAI como parte del SDK de Apple de TheStage y se distribuye como artefacto de despliegue (`engines.zip`, 174 MB) con motores cifrados mediante QLPA. El modelo subyacente es el fine-tune griego de myned-ai (`myned-ai/pocket-tts-greek`), a su vez derivado de `kyutai/pocket-tts`, entrenado sobre aproximadamente 2.400 horas de habla griega y con ocho voces curadas, dos de ellas chipriotas.

El repositorio no contiene pesos entrenables en formato estándar, sino motores compilados para inferencia en hardware Apple: un flow LM en fp16 con capas transformer palettizadas a 6 bits (6 capas, dimensión 1024, cabeza de flujo LSD) ejecutado en la ANE, y un decodificador Mimi en fp32 ejecutado en CPU. El bundle declara el idioma `el` y el tipo de modelo `pocket-tts`, y está pensado para integración directa en aplicaciones macOS e iOS a través del SDK de TheStage.

Su relevancia es acotada pero específica: cubre el nicho de TTS griego de baja latencia y tamaño reducido con aceleración nativa en silicio Apple, un escenario poco atendido por los modelos TTS multilingües de gran escala. Al estar construido sobre un fine-tune de 100 M de parámetros, el coste computacional y de memoria es bajo, lo que lo hace apto para dispositivos de gama consumer y aplicaciones on-device.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow LM (transformer de 6 capas, d=1024, cabeza de flujo LSD) + decodificador Mimi |
| Parámetros totales | 100 M (según el nombre del modelo y la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Flow LM en fp16 con capas transformer palettizadas a 6 bits (g8); decodificador Mimi en fp32 |
| Idiomas soportados | Griego (`el`); incluye referencias de voz en inglés |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Motores Core ML / ANE compilados (`engines.zip`, cifrado QLPA); no se distribuyen safetensors ni GGUF en este repo |
| Tamaño del repositorio | 0,7 GB |
| Modelo base | `myned-ai/pocket-tts-greek` (a su vez basado en `kyutai/pocket-tts`) |
| Voces incluidas | athina (por defecto), eleni, giorgos, katerina, kostas, nikos, sophia, spyros; referencias inglesas: azelma, alba, charles, cosette, javert, marius |
| Librería | pocket-tts |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Pocket TTS de Kyutai: un flow LM que genera representaciones latentes de audio y un decodificador Mimi que las convierte en forma de onda. En esta distribución concreta, el flow LM tiene 6 capas transformer con dimensión 1024 y una cabeza de flujo LSD, y se ejecuta en la Apple Neural Engine en fp16 con las capas transformer palettizadas a 6 bits (esquema g8). El decodificador Mimi se ejecuta en CPU en fp32. Esta partición busca minimizar el consumo energético y la latencia en dispositivos Apple, delegando la parte más pesada al acelerador neuronal.

El entrenamiento del modelo subyacente corresponde a myned-ai, que realizó un fine-tune sobre `kyutai/pocket-tts` con aproximadamente 2.400 horas de habla griega y ocho voces curadas (dos chipriotas). No se dispone en la información proporcionada de detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron etapas de RLHF o DPO. TheStageAI no documenta un entrenamiento propio: su aportación es la compilación y el empaquetado de los motores para el SDK de Apple, con cifrado QLPA de los artefactos.

## Capacidades

- Síntesis de voz (text-to-speech) en griego a partir de texto.
- Selección entre ocho voces griegas predefinidas, incluidas dos variantes chipriotas.
- Referencias de voz en inglés incluidas en el bundle (azelma, alba, charles, cosette, javert, marius), presumiblemente para clonación o transferencia de estilo; la model card no detalla su uso exacto.
- Inferencia on-device en macOS e iOS mediante Core ML, con el flow LM en la ANE y el decodificador Mimi en CPU.
- Integración con el SDK de Apple de TheStage bajo el tipo de modelo `pocket-tts`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido en griego en aplicaciones iOS y macOS: el modelo puede narrar artículos, libros o notificaciones con voces naturales y acentos griego y chipriota, ejecutándose íntegramente en el dispositivo sin conexión.
- Accesibilidad para usuarios con discapacidad visual: integración como motor de voz del sistema o de una app de lectura de pantalla, con latencia baja gracias a la ejecución en la ANE y sin enviar texto a servidores externos.
- Asistentes de voz locales en griego: un asistente conversacional on-device puede sintetizar respuestas sin depender de la nube, lo que reduce la latencia y preserva la privacidad del usuario.
- Aprendizaje de idiomas: aplicaciones de práctica de griego pueden generar pronunciaciones de referencia con distintas voces y acentos, incluido el chipriota, para ejercicios de escucha.
- Audiolibros y pódcast generados: conversión de texto a audio en pipelines de producción editorial griega, con selección de voz por personaje o sección.
- Integración en apps de navegación o domótica: anuncios hablados en griego dentro de aplicaciones nativas de Apple, aprovechando el bajo consumo del motor en la ANE para uso continuado.
- Prototipado de interfaces de voz en investigación: evaluación de TTS de 100 M de parámetros en hardware consumer sin infraestructura GPU, útil para estudios de usabilidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, RTF) ni comparaciones numéricas con otros sistemas TTS.

## Requisitos de hardware

- VRAM: no aplica; el modelo está compilado para Core ML y se ejecuta en Apple Silicon (ANE y CPU), no en GPU NVIDIA.
- Hardware recomendado: dispositivos Apple con Neural Engine (familias M1 en adelante en Mac, chips A-series recientes en iPhone e iPad).
- No cabe en GPU consumer tipo RTX 4090 en su formato actual, ya que los artefactos son motores Core ML cifrados, no pesos portables.
- Despliegue: exclusivamente mediante el SDK de Apple de TheStage (`model_type: pocket-tts`) y Core ML. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño del bundle (174 MB) y la partición ANE/CPU sugieren un diseño orientado a baja latencia on-device, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| pocket-tts-100m-el (TheStageAI) | 100 M | Griego | no disponible | CC-BY-4.0 | Core ML / ANE (cifrado QLPA) |
| myned-ai/pocket-tts-greek | 100 M | Griego | no disponible | CC-BY-4.0 | Pesos del modelo base (formato no detallado) |
| kyutai/pocket-tts | 100 M (aproximado) | Multilingüe según la familia | no disponible | no disponible en esta ficha | Pesos originales de Kyutai |

La comparación con alternativas TTS de mayor escala (XTTS, Bark, VITS) no está disponible en la información proporcionada, y no se han publicado métricas que permitan una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Solo soporta griego como idioma de síntesis; las referencias inglesas incluidas no implican capacidad TTS general en inglés.
- Los motores están cifrados con QLPA y empaquetados para el SDK de TheStage: no son pesos abiertos reutilizables ni portables a otros frameworks.
- Dependencia total del ecosistema Apple: no hay ruta de despliegue documentada en Linux, Windows o GPU NVIDIA.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad perceptual; al ser un fine-tune sobre 2.400 horas de habla, la cobertura de acentos, edades y registros puede ser limitada.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base (`myned-ai/pocket-tts-greek`) y de `kyutai/pocket-tts`, así como los términos del SDK de TheStage y del cifrado QLPA.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, y no hay evidencia de validación independiente del rendimiento en producción.
- No se especifican límites de longitud de texto de entrada ni de contexto; en TTS esto condiciona la segmentación necesaria para frases largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-el
- Modelo base griego: https://huggingface.co/myned-ai/pocket-tts-greek
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
