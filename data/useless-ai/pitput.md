# useless-ai/pitput

## Resumen

pitput (פִּטְפּוּט) es un modelo de síntesis de voz (text-to-speech) para hebreo desarrollado por useless-ai, presentado como un proyecto personal de aprendizaje. Se trata de una adaptación al hebreo de tiny-voca, con la particularidad de ser extremadamente compacto: el modelo completo, vocoder incluido, ocupa solo 18 MB y cuenta con 4,5 millones de parámetros. Genera audio mono a 24 kHz y, según el autor, funciona más rápido que el tiempo real en la CPU de un portátil.

El modelo lee hebreo sin niqqud en una única voz con 8 estilos de entrega (default, excited, sad, angry, fearful, surprised, calm, whisper) y 8 etiquetas de expresión insertables en el texto (`<laugh>`, `<chuckle>`, `<sigh>`, `<breath>`, `<gasp>`, `<throat-clearing>`, `<short pause>`, `<long pause>`). Está entrenado desde cero sobre voz sintética y se publica como "try 1" (paso 104.000, 18 de noviembre de 2026).

Su relevancia radica en la eficiencia: demuestra que es posible un TTS neuronal funcional en hardware muy limitado, sin vocoder neuronal separado, integrando el vocoder en la propia arquitectura. La licencia es exclusivamente para investigación privada, lo que restringe severamente su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastSpeech2 modificada (fork de fiato, fork de tiny-voca) con vocoder source-filter diferenciable integrado |
| Parametros totales | 4,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa el texto oración por oración) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | private-research-only (other) |
| Formato de pesos | PyTorch (`inference.pt`) |
| Frecuencia de muestreo | 24 kHz, mono |
| Tamano del modelo | 18 MB (repo de 0.0 GB) |
| Entrada | 47 tokens (29 fonemas Phonikud, 5 signos de puntuacion, limite de palabra, bordes de enunciado, 8 etiquetas de expresion) |
| Estilos | 8 (default, excited, sad, angry, fearful, surprised, calm, whisper) |
| Etiquetas de expresion | 8 |
| Dependencias | PyTorch, Phonikud (~300 MB, se descarga en el primer uso), onnxruntime, soundfile, huggingface_hub |

## Arquitectura y entrenamiento

pitput es un fork de fiato, que a su vez deriva de tiny-voca. Se trata de un modelo de tipo FastSpeech2 con un vocoder diferenciable de tipo source-filter integrado, de modo que no existe un vocoder neuronal separado. La entrada consta de 47 tokens: 29 fonemas generados por Phonikud, 5 signos de puntuación, un límite de palabra, los bordes de enunciado y las 8 etiquetas de expresión. El acento (stress) se modela como una característica paralela, no como token.

El codificador de texto tiene 4 capas transformer con 192 canales, y la incrustación de estilo se suma a cada token. Un predictor de duración estima los frames por token e incluye un conmutador de "pausa presente" para puntuación, límites de palabra y etiquetas. A nivel de frame, la incrustación de estilo se vuelve a sumar; 2 capas predicen tono (log F0), sonoridad y energía, y 5 capas predicen las características acústicas. El vocoder combina un tren de pulsos armónicos (derivado del tono predicho) con ruido, cada uno modelado por un cepstrum complejo por frame. El modelo se entrenó desde cero sobre voz sintética. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Síntesis de voz en hebreo sin niqqud: Phonikud vocaliza cada oración en contexto y añade el acento; el modelo lee sus fonemas.
- Ocho estilos de entrega controlables: default, excited, sad, angry, fearful, surprised, calm y whisper.
- Ocho etiquetas de expresión insertables en el texto: `<laugh>`, `<chuckle>`, `<sigh>`, `<breath>`, `<gasp>`, `<throat-clearing>`, `<short pause>`, `<long pause>`.
- Control del género del destinatario mediante `--addressee m` o `f` (formas como לך, אותך, אמרת); sin él, Phonikud lee la forma masculina.
- Control de velocidad (`--speed`), desplazamiento de tono (`--pitch-shift`) y rango de tono (`--pitch-range`).
- La puntuación (`, . ? ! …`) modula la entrega.
- Procesamiento de textos largos oración por oración.
- Inferencia en CPU (por defecto) o CUDA (`--device`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Lectura de textos largos en hebreo en entornos sin GPU: al procesar oración por oración y ejecutarse más rápido que el tiempo real en CPU, puede narrar artículos o documentos completos en un portátil.
- Accesibilidad para personas con discapacidad visual: generación de audio para contenidos en hebreo con control de velocidad y pausas mediante etiquetas, útil en lectores de pantalla ligeros.
- Prototipado rápido de asistentes de voz en hebreo: su tamaño de 18 MB y su dependencia mínima permiten integrarlo en aplicaciones de escritorio o dispositivos embebidos durante fases de prueba.
- Audiolibros y pódcast sintéticos con matices: los 8 estilos y las etiquetas de expresión permiten dar entonación (suspiros, risas, pausas) a narrativas en hebreo.
- Sistemas de aviso y megafonía: mensajes pregrabados o dinámicos en hebreo con control de tono y velocidad para entornos como transporte o comercio.
- Investigación en TTS de bajo coste: sirve como base reproducible para estudiar arquitecturas FastSpeech2 con vocoder integrado y entrenamiento sobre voz sintética.
- Pruebas de localización de interfaces: generación de avisos de voz en hebreo para validar experiencias de usuario antes de contratar una voz profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo (18 MB) puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no disponibles; el autor indica CPU por defecto y soporte opcional de CUDA (`--device cuda`).
- Cabe en cualquier GPU consumer e incluso en CPU de portátil; el autor afirma que funciona más rápido que el tiempo real en CPU.
- Opciones de despliegue: inferencia propia mediante `python -m pitput.infer` o desde Python (`pitput.infer.load_model`, `speak_text`); requiere PyTorch, Phonikud, onnxruntime, soundfile y huggingface_hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no se proporcionan cifras concretas; solo la afirmación cualitativa de "más rápido que el tiempo real en CPU de portátil".
- Nota: el repositorio es privado; es necesario `huggingface-cli login` y acceso autorizado para clonarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pitput | 4,5 M | no disponible | hebreo | private-research-only | repositorio privado |
| tiny-voca | no disponible | no disponible | no disponible | no disponible | repositorio publico en GitHub |
| fiato | no disponible | no disponible | no disponible | no disponible | Hugging Face (cfahlgren1/fiato) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia `private-research-only`: uso comercial prohibido; solo investigación privada. Consultar el enlace de licencia en el README del repositorio.
- Repositorio privado: requiere autenticación y autorización para acceder a los pesos.
- Proyecto personal de aprendizaje, "try 1" (paso 104.000): calidad y estabilidad no validadas en producción.
- Entrenado sobre voz sintética: puede presentar artefactos propios de datos sintéticos y no reflejar la variabilidad de voces humanas reales.
- Sin normalizador de texto: los números, fechas, horas, acrónimos y palabras extranjeras deben escribirse en palabras hebreas; los caracteres no legibles se omiten.
- Una única voz; no hay clonación ni selección de hablante.
- Solo hebreo; no soporta otros idiomas.
- Sin datos de sesgos, alucinación (no aplica en sentido estricto al ser TTS) ni evaluación objetiva de calidad (MOS u otras métricas).
- Dependencia externa de Phonikud (~300 MB) que se descarga en el primer uso.
- No se especifican requisitos de latencia ni límites de longitud de texto más allá del procesamiento oración por oración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/useless-ai/pitput
- Licencia: https://huggingface.co/useless-ai/pitput/blob/main/README.md#license
- tiny-voca (repositorio original): https://github.com/n4ze3m/tiny-voca
- fiato (fork intermedio): https://huggingface.co/cfahlgren1/fiato
- Phonikud: https://github.com/thewh1teagle/phonikud
