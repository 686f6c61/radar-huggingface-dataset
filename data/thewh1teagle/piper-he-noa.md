# thewh1teagle/piper-he-noa

## Resumen

Piper Hebrew — noa (medium) es un modelo de síntesis de voz (text-to-speech) publicado por el desarrollador thewh1teagle bajo el paraguas de Piper, la herramienta de TTS ligera del proyecto OHF-Voice. Se trata de una voz femenina en hebreo llamada "noa" que incorpora además un hablante en inglés (`ljspeech`) dentro del mismo checkpoint multihablante. El modelo está pensado para inferencia rápida en CPU y se distribuye en formato ONNX estándar de Piper, con un tamaño de repositorio de 0,4 GB.

El modelo resuelve un problema concreto: la escasez de voces Piper de calidad para hebreo. Piper es una librería orientada a despliegues de baja latencia y sin GPU, de modo que esta voz permite integrar TTS hebreo en aplicaciones locales, asistentes o pipelines de accesibilidad sin depender de servicios en la nube. La arquitectura subyacente es VITS en su variante "medium" de Piper, con una frecuencia de muestreo de 22,05 kHz.

La relevancia actual del modelo radica en su enfoque de entrenamiento: la voz hebrea se generó de forma sintética con Chatterbox a partir de frases del Knesset filtradas con Whisper, un pipeline de destilación de datos que evita depender de un corpus hebreo grabado a gran escala. El checkpoint PyTorch también se publica para permitir ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper VITS (variante medium), multihablante |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; Piper soporta ejecución en CPU) |
| Idiomas soportados | hebreo (he), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`he_IL-noa-medium.onnx`) y checkpoint PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS en la implementación de Piper, en su tamaño "medium", y genera audio a 22,05 kHz. Se inicializó a partir de `en_US-ljspeech-medium`, una voz inglesa entrenada desde cero sobre LJSpeech (dominio público), que se convirtió en multihablante con la condicionante de hablante inicializada a cero. El resultado es un único modelo con dos hablantes: `noa` (id 0, hebreo, por defecto) y `ljspeech` (id 1, inglés).

Los datos de entrenamiento combinan dos fuentes. Para el hablante hebreo se usaron 24 horas de voz sintetizada con Chatterbox a partir de frases del Knesset, filtradas con Whisper. Para el hablante inglés se empleó LJSpeech, también en torno a 24 horas. El entrenamiento alcanzó los 20.322 pasos, con un mejor L1 de mel sobre el conjunto de validación de 0,405. Un detalle técnico relevante es el tratamiento fonético: Piper convierte el hebreo sin puntos diacríticos a IPA acentuado mediante la herramienta renikud, y el modelo está entrenado sobre esa convención (`phoneme_type: hebrew`). El código de ajuste fino está publicado en el repositorio `piper-tts-finetune`.

## Capacidades

- Síntesis de voz en hebreo con la voz femenina `noa` a partir de texto plano sin nikud.
- Síntesis de voz en inglés con el hablante `ljspeech` dentro del mismo modelo.
- Conversión automática de hebreo a IPA acentuado mediante renikud.
- Selección de hablante por id (0 para hebreo, 1 para inglés).
- Inferencia en CPU con latencia baja, gracias al formato ONNX y al tamaño medium de Piper.
- Salida de audio a 22,05 kHz en formato WAV mediante la CLI de Piper.
- Punto de partida para ajuste fino adicional gracias al checkpoint PyTorch publicado (generador y discriminador).

## Casos de uso

- Lectura por voz de contenido en hebreo en aplicaciones de accesibilidad: el modelo convierte texto sin nikud a audio inteligible en CPU, lo que permite integrarlo en lectores de pantalla o extensiones de navegador sin infraestructura GPU.
- Asistentes locales y offline: al ejecutarse con Piper sobre ONNX, encaja en dispositivos sin conexión o con requisitos de privacidad estrictos, donde no se puede enviar texto a un servicio de TTS en la nube.
- Generación de audio para audiolibros o pódcasts en hebreo: la voz `noa` produce habla femenina natural a 22,05 kHz, suficiente para previsualizaciones y borradores de narración antes de una grabación profesional.
- Sistemas de respuesta interactiva por voz (IVR) en hebreo: la baja latencia de Piper permite sintetizar respuestas en tiempo real dentro de flujos telefónicos o de atención automatizada.
- Creación de datasets de voz sintética para entrenamiento: el pipeline usado por el autor (Chatterbox más filtrado con Whisper) es reproducible con este modelo como generador de habla hebrea a escala.
- Prototipado de aplicaciones bilingües hebreo-inglés: al incluir ambos hablantes en un único checkpoint, se puede alternar idioma sin cargar dos modelos, útil en demos y pruebas de concepto.
- Ajuste fino para voces o dominios específicos: el checkpoint `.pt` con generador y discriminador permite continuar el entrenamiento con datos propios, por ejemplo para un dominio técnico o una voz concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la métrica de entrenamiento: mejor L1 de mel sobre el conjunto de validación de 0,405 en el paso 20.322.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; Piper está diseñado para ejecución en CPU y el modelo ONNX ocupa una fracción de los 0,4 GB del repositorio.
- GPU recomendadas: no son necesarias; cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa frente a CPU para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: CLI de Piper (`piper-tts`, invocable con `uvx --from piper-tts piper`), y las integraciones habituales de Piper en aplicaciones de escritorio y servidores ligeros.
- Latencia y throughput estimados: no disponibles en la información proporcionada; Piper se caracteriza por latencias bajas en CPU, pero no se han publicado cifras concretas para esta voz.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Piper Hebrew — noa (este modelo) | Piper VITS medium | he, en | ONNX + PyTorch | CC BY 4.0 | Multihablante hebreo-inglés, voz hebrea sintética |
| Otras voces Piper multihablantes | Piper VITS | según voz | ONNX | variable (MIT en el código de Piper) | Ecosistema amplio, pero cobertura de hebreo escasa |
| Chatterbox (resemble-ai) | TTS neuronal | multilingüe | PyTorch | según repositorio | Usado aquí como generador de datos, no como voz final |
| Modelos TTS comerciales en la nube | propietaria | amplio | API | propietaria | Mayor calidad potencial, pero dependencia de servicio y coste por uso |

No se dispone de datos de benchmarks comparativos publicados para esta voz frente a alternativas.

## Limitaciones y advertencias

- La voz hebrea se entrenó sobre habla sintética generada con Chatterbox y filtrada con Whisper; los artefactos o sesgos del generador pueden haberse transferido al modelo final.
- El texto hebreo de entrada debe procesarse con renikud para obtener la IPA acentuada esperada; un preprocesado distinto puede degradar la pronunciación.
- No se han publicado evaluaciones subjetivas (MOS) ni comparativas con voces humanas, por lo que la calidad percibida no está cuantificada.
- El modelo es de dominio TTS: no procesa contexto largo ni mantiene estado conversacional; cada síntesis es independiente.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene verificar las condiciones de las fuentes de datos subyacentes (LJSpeech es de dominio público; el corpus del Knesset y la voz sintética requieren revisión propia).
- El hablante inglés `ljspeech` hereda las características de LJSpeech (voz única, dominio público), no está adaptado a otros acentos ni estilos.
- El repositorio tiene un uso muy bajo (73 descargas, 0 likes) y fue creado recientemente, por lo que la validación comunitaria es limitada.
- No se especifican métricas de latencia ni throughput para producción; deben medirse en el entorno de despliegue concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thewh1teagle/piper-he-noa
- Piper (OHF-Voice): https://github.com/OHF-Voice/piper1-gpl
- renikud (conversión de hebreo a IPA acentuado): https://renikud.github.io
- Chatterbox (generador de datos de voz): https://github.com/resemble-ai/chatterbox
- LJSpeech (dataset inglés de dominio público): https://keithito.com/LJ-Speech-Dataset/
- Código de ajuste fino: https://github.com/thewh1teagle/piper-tts-finetune
