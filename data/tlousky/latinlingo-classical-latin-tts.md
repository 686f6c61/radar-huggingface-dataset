# tlousky/latinlingo-classical-latin-tts

## Resumen

LatinLingo Classical Latin TTS es un conjunto de pesos de síntesis de voz (text-to-speech) especializados en latín clásico restaurado (etiqueta interna `la_classica`). Lo publica el autor independiente Tlousky en Hugging Face y está pensado para leer textos latinos con pronunciación restaurada, un problema que los motores TTS generalistas no cubren bien porque el latín clásico tiene reglas fonéticas propias (cantidad vocálica, consonantes aspiradas, grupos como `ph`, `th`, `ch`). El repositorio incluye dos artefactos: un pack de pesos FP16 y estilo para el modelo base Kokoro-82M, y un modelo Student ONNX cuantizado en INT8 de unos 8,10 MiB derivado de Paradee-8M.

La relevancia actual viene de su ligereza y del formato: el Student ONNX INT8 funciona a aproximadamente 24 veces tiempo real sobre 2 hilos de CPU, lo que lo hace viable en entornos sin GPU (servidores modestos, aplicaciones de escritorio, pipelines educativos). El Kokoro fine-tuneado aporta una calidad superior cuando hay más recursos. La licencia MIT permite uso comercial sin restricciones significativas.

El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de la consulta, por lo que se trata de un artefacto muy reciente y de nicho. No se han publicado métricas de calidad (MOS, WER) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal: fine-tune de Kokoro-82M (pesos FP16) y Student ONNX derivado de Paradee-8M |
| Parametros totales | Kokoro-82M: 82 M (modelo base); Paradee-8M: aproximadamente 8 M; no disponible el detalle del Student |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, procesa fonemas IPA, no texto con ventana de contexto) |
| Tipos de cuantizacion | FP16 (Kokoro fine-tune), INT8 (Student ONNX) |
| Idiomas soportados | latín clásico restaurado (`la_classica`) |
| Licencia | MIT |
| Formato de pesos | `.pt` (FP16), `.onnx` (INT8), `config.json` |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna de los modelos base. Kokoro-82M es un modelo TTS compacto de 82 millones de parámetros; aquí se distribuye un fine-tune acoplado a un pack de estilo `[510, 1, 256]` que codifica la voz `la_classica`. Paradee-8M es un modelo TTS de aproximadamente 8 millones de parámetros, del que se publica un Student ONNX cuantizado en INT8 con vocabulario de fonemas IPA y mapeo de voces definido en `config.json`.

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del corpus latino, ni si se aplicaron técnicas de destilación, RLHF o ajuste por preferencias. El término "Student" sugiere destilación desde un modelo mayor, pero no se confirma el procedimiento ni el teacher. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto latino clásico restaurado, con salida de audio.
- Fonemización mediante vocabulario IPA específico para latín (`config.json`).
- Control de voz mediante pack de estilo dedicado (`la_classica`, tensor `[510, 1, 256]`).
- Inferencia en CPU sin GPU: el Student ONNX INT8 alcanza aproximadamente 24x tiempo real sobre 2 hilos.
- Dos niveles de calidad/recursos: Kokoro FP16 para mayor fidelidad, Paradee INT8 para despliegue ligero.
- No soporta tool calling, agentes, visión, audio de entrada ni modo thinking; es exclusivamente TTS.
- Multilingüismo: limitado al latín; no se documentan otras lenguas.

## Casos de uso

- Lectura de textos latinos en entornos educativos: el Student ONNX INT8 permite generar audio de pasajes de César, Cicerón o Virgílio en un servidor escolar sin GPU, con latencia baja gracias a los ~24x tiempo real en 2 hilos de CPU.
- Aplicaciones de escritorio de aprendizaje de latín: integrar el modelo ONNX en una app local (por ejemplo, con onnxruntime) para pronunciar palabras y frases bajo demanda, sin dependencia de servicios en la nube.
- Generación de audiolibros de dominio público en latín: usar el fine-tune Kokoro FP16 para producir narraciones de mayor calidad a partir de textos de Project Gutenberg, procesando por lotes.
- Herramientas de anotación filológica: sintetizar lemas y formas flexionadas con pronunciación restaurada para comparar cantidad vocálica y consonantes aspiradas en materiales de investigación.
- Pipelines de CI para validación de pronunciación: ejecutar el Student ONNX en tests automatizados que verifiquen la fonemización IPA de un corpus latino antes de publicar contenidos.
- Prototipos de asistentes de lectura para estudiantes de humanidades: combinar el modelo con un OCR de textos latinos escaneados y encadenar la salida TTS para lectura asistida.
- Demos interactivas en web: usar el Space oficial como referencia para desplegar una interfaz de prueba con el Student ONNX, dado su reducido tamaño (8,10 MiB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento documentado es el throughput del Student ONNX INT8: aproximadamente 24x tiempo real sobre 2 CPU threads. No hay cifras de MOS, WER, CER ni comparaciones objetivas con otros TTS.

## Requisitos de hardware

- Student ONNX INT8: unos 8,10 MiB de pesos; inferencia viable en CPU con 2 hilos a ~24x tiempo real. VRAM no aplica; RAM estimada en el orden de decenas de MB, no disponible con precisión.
- Kokoro fine-tune FP16: modelo base de 82 M parámetros; VRAM estimada por debajo de 1 GB en FP16, aunque no se documenta oficialmente.
- GPU recomendadas: no disponibles; el artefacto principal está optimizado para CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) sería sobrada para el Kokoro FP16.
- Cabe en GPU consumer: sí, ambos artefactos son de tamaño muy reducido.
- Opciones de despliegue: onnxruntime para el Student ONNX; PyTorch para el `.pt` de Kokoro; el Space oficial como referencia de integración. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: ~24x tiempo real en 2 hilos de CPU para el Student INT8; sin datos para Kokoro FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LatinLingo Classical Latin TTS (este) | Kokoro 82 M + Paradee ~8 M | Latin clasico | `.pt`, `.onnx` INT8 | MIT | Fine-tune especifico para latín restaurado |
| Kokoro-82M (base) | 82 M | Multiples (no latin clasico) | `.pt`, ONNX | Apache 2.0 (segun el proyecto original) | Base del fine-tune; no cubre pronunciacion latina restaurada |
| Paradee-8M (base) | ~8 M | No disponible | ONNX | No disponible | Modelo ultraligero del que deriva el Student |
| Piper TTS | Variable por voz | Multiples | ONNX | MIT/GPL segun voz | Alternativa ligera en CPU, pero sin voz latina clasica documentada |

La comparativa con Piper y otros motores ligeros es aproximada: no hay datos objetivos de calidad que permitan ordenarlos frente a este fine-tune.

## Limitaciones y advertencias

- Cobertura lingüística única: solo latín clásico restaurado; no sirve para latín eclesiástico, latín vulgar ni otras lenguas.
- Sin métricas de calidad publicadas: no hay MOS, WER ni evaluaciones perceptuales que respalden la fidelidad de la pronunciación.
- Riesgo de alucinación fonética: la fonemización IPA puede fallar en palabras raras, nombres propios o textos con macrones inconsistentes.
- Corpus de entrenamiento no documentado: se desconoce la variedad de autores, épocas y estilos cubiertos, lo que puede sesgar la prosodia hacia un registro concreto.
- Adopción nula: 0 descargas y 0 likes; no hay evidencia de uso en producción ni de reportes de la comunidad.
- Dependencia de los modelos base: el comportamiento final hereda limitaciones de Kokoro-82M y Paradee-8M, cuyos detalles no se reproducen aquí.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los modelos base y de cualquier dato de entrenamiento incorporado.
- Repositorio pequeño (0,2 GB) y reciente: la documentación es mínima y pueden faltar scripts de inferencia listos para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tlousky/latinlingo-classical-latin-tts
- Demo interactiva (Space): https://huggingface.co/spaces/tlousky/latinlingo-tts-demo
- Repositorio del proyecto: https://github.com/Tlousky/LatinLingo
