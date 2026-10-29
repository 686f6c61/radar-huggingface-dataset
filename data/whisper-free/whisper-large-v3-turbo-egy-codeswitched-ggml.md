# whisper-free/whisper-large-v3-turbo-egy-codeswitched-ggml

## Resumen

`whisper-large-v3-turbo-egy-codeswitched-ggml` es una conversión al formato GGML (F16) del modelo `mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching`, un ajuste fino de Whisper large-v3-turbo orientado a árabe egipcio con alternancia de código (code-switching, presumiblemente árabe-inglés). El autor de esta ficha, `whisper-free`, no entrena nada: solo cambia el contenedor de los pesos para que se puedan cargar con whisper.cpp, el runtime en C/C++ de referencia para Whisper. Los pesos, según la model card, son idénticos a los del modelo origen salvo por la conversión de formato, y el vocabulario del tokenizador procede del Whisper base de OpenAI (MIT).

El interés práctico es acotado pero claro: permite ejecutar un Whisper large-v3-turbo especializado en dialecto egipcio sin necesidad de PyTorch ni de GPU dedicada, dentro de la aplicación Whisper Free o en cualquier pipeline basado en whisper.cpp. El repositorio ocupa 1,6 GB y contiene un único fichero `.bin` en F16, lo que sitúa la huella de memoria en el entorno de 2 GB en inferencia, algo asumible en portátiles modernos.

Ahora bien, la información publicada es mínima: no hay métricas, no se declaran idiomas soportados, no se documenta el conjunto de entrenamiento del ajuste fino y el repositorio no tiene descargas ni valoraciones. Debe tratarse, por tanto, como un artefacto de conveniencia para un caso de uso muy concreto, no como un modelo validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para reconocimiento automático de voz (heredada de Whisper large-v3-turbo; no detallada en la model card) |
| Parametros totales | No disponible en la información proporcionada; el fichero F16 de 1,6 GB implica del orden de 800 M parámetros (16 bits por peso) |
| Longitud de contexto | No disponible en la información proporcionada (Whisper opera sobre ventanas de audio de 30 s; no confirmado para este ajuste) |
| Tipos de cuantizacion | Únicamente F16 (formato GGML de whisper.cpp); no se incluyen variantes Q4, Q5 ni Q8 |
| Idiomas soportados | No declarados en la model card; por el nombre del modelo, especializado en árabe egipcio con code-switching (sin confirmar por el autor) |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin` para whisper.cpp), fichero `ggml-whisper-large-v3-turbo-egy-codeswitched.bin` |
| Autor de la conversión | whisper-free |
| Modelo origen | mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching (MIT) |
| Librería / pipeline | ggml / `automatic-speech-recognition` |
| Tamaño del repositorio | 1,6 GB |
| Verificación de integridad | Fichero `SHA256SUMS` incluido en el repositorio |
| Fecha de creación | 2026-10-29 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3-turbo: un transformer encoder-decoder que consume espectrogramas log-Mel y genera tokens de texto, con decodificación autoregresiva y tokens de control para idioma, tarea (transcripción o traducción) y marcas temporales. Esta ficha no aporta detalles adicionales sobre número de capas, dimensiones ocultas ni configuración de atención, y la model card no los reproduce. La conversión a GGML no altera la topología: solo serializa los tensores en el formato que espera whisper.cpp, en precisión F16.

Respecto al entrenamiento, no hay información disponible sobre el corpus del ajuste fino: ni número de horas, ni composición del dataset, ni si se empleó alguna técnica de alineación posterior. La propia model card advierte explícitamente de que las licencias de los conjuntos de entrenamiento no fueron auditadas, solo las de los modelos origen. El tokenizador se toma del Whisper base de OpenAI (MIT), según se indica en la documentación.

## Capacidades

- Transcripción de voz a texto en árabe egipcio, con foco declarado en habla con alternancia de código.
- Conversión de formato respecto al modelo origen manteniendo los pesos: el comportamiento acústico debería ser equivalente al del ajuste fino de `mohammedaly22`.
- Generación de marcas temporales a nivel de segmento, como el resto de modelos Whisper (no verificado específicamente en este ajuste).
- Ejecución en CPU y en GPU dentro de whisper.cpp, sin dependencias de PyTorch.
- La arquitectura base admite tarea de traducción al inglés y detección de idioma, pero no hay documentación que confirme que el ajuste fino conserve esas capacidades.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se declara cobertura multilingüe amplia; al ser un ajuste dialectal, es esperable una degradación en idiomas distintos del egipcio, aunque no está medido en la información disponible.

## Casos de uso

- Transcripción de llamadas de atención al cliente en Egipto: el ajuste está pensado para hablantes que mezclan árabe egipcio e inglés en la misma frase, un patrón habitual en soporte técnico y ventas, donde un Whisper genérico suele fallar en los cambios de idioma dentro del turno.
- Subtitulado de contenido audiovisual egipcio: series, entrevistas y directos en los que los hablantes alternan dialecto y terminología inglesa; el modelo puede generar subtítulos con marcas temporales dentro de un pipeline con whisper.cpp.
- Integración en la aplicación Whisper Free: es el destino explícito de esta conversión, de modo que la app puede distribuir un único fichero de 1,6 GB y cargarlo con el runtime C/C++ sin empaquetar PyTorch.
- Procesamiento por lotes en servidores sin GPU: al caber en unos 2 GB de memoria, se puede ejecutar en instancias CPU modestas para transcribir archivos encolados durante la noche.
- Transcripción de reuniones y notas de voz bilingües: equipos con personal egipcio que documenta en árabe y cita términos técnicos en inglés; el modelo evita el cambio manual de idioma que requieren otros pipelines.
- Investigación lingüística sobre code-switching: permite obtener transcripciones de corpus orales mixtos para análisis de alternancia de código, aunque sin métricas publicadas habría que validar manualmente una muestra antes de usarlo como fuente.
- Prototipado rápido en dispositivos de borde: al no requerir CUDA, se puede desplegar en mini-PC o portátiles para demos de transcripción en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, comparaciones con el modelo origen ni evaluaciones por dialecto, y el repositorio no registra descargas ni discusiones de la comunidad que aporten mediciones.

## Requisitos de hardware

- VRAM/RAM estimada: en torno a 2 GB para los pesos en F16 más el overhead del runtime y del búfer de audio; con contexto y lotes grandes, prever 2,5-3 GB.
- GPU recomendadas: cualquier GPU con 3 GB o más de memoria sirve; una RTX 3060, RTX 4060 o RTX 4090 ejecutan el modelo sin problema, y una A100 o H100 resultan sobredimensionadas para 1,6 GB de pesos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna con 4 GB o más; también en iGPU con memoria unificada suficiente.
- CPU: viable en exclusiva, que es el escenario habitual de whisper.cpp; se recomienda AVX2/AVX-512 o NEON en ARM.
- Opciones de despliegue: whisper.cpp (binario, servidor o bindings de Python tipo `pywhispercpp`), la app Whisper Free, y cualquier herramienta que consuma ficheros GGML de Whisper. `faster-whisper` no carga GGML directamente: requeriría convertir a CTranslate2. No hay soporte nativo en vLLM ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la duración del audio, con la referencia habitual de Whisper de procesar audio en ventanas de 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| whisper-large-v3-turbo-egy-codeswitched-ggml (este) | ~800 M (inferido del tamaño F16) | No disponible | No declarados; especializado en árabe egipcio con code-switching | MIT | GGML F16 | Sin benchmarks; 0 descargas |
| mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching | No disponible | No disponible | No disponible | MIT | Pesos originales (no especificado) | Modelo origen del ajuste; misma calidad esperada |
| openai/whisper-large-v3-turbo | No disponible en esta búsqueda | No disponible | Multilingüe (Whisper base) | MIT | Safetensors / bin de OpenAI; conversiones GGML de terceros | Referencia generalista; peor desempeño esperado en dialecto egipcio puro |
| openai/whisper-large-v3 | No disponible en esta búsqueda | No disponible | Multilingüe | MIT | Safetensors / bin; conversiones GGML | Mayor coste de inferencia que turbo; útil como techo de calidad a validar |

No se dispone de datos de rendimiento comparado (WER) para ninguna de las filas, por lo que la comparativa es estructural (tamaño, licencia, formato y especialización), no de calidad.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay WER publicado ni sobre el conjunto de evaluación del ajuste ni sobre el modelo original, lo que impide afirmar que mejore a Whisper large-v3-turbo estándar en egipcio.
- Idiomas no declarados en la model card: la especialización solo se deduce del nombre del modelo, no de documentación del autor.
- Riesgo de degradación multilingüe: los ajustes dialectales suelen sacrificar cobertura en otras lenguas; no se ha verificado qué ocurre con árabe estándar moderno, inglés general u otros idiomas.
- Alucinaciones típicas de Whisper en silencios, música o audio ruidoso, con posibilidad de generar texto inventado en segmentos sin habla; requiere detección de actividad vocal en producción.
- Normalización incierta: no se documenta cómo se transcriben los términos ingleses dentro de una frase árabe (alfabeto latino o transliteración), algo crítico para pipelines posteriores.
- Licencia MIT en el modelo, pero las licencias de los datos de entrenamiento del ajuste fino no fueron auditadas según la propia model card; conviene revisar antes de un uso comercial sensible.
- Un solo formato y precisión (F16 GGML): no hay variantes cuantizadas que reduzcan memoria, ni pesos en safetensors dentro de este repositorio.
- Repositorio sin descargas ni interacción de la comunidad: no hay validación externa ni informes de errores.
- Los metadatos indican fecha de creación 2026-10-29, posterior a la fecha habitual de consulta; conviene verificar la procedencia del repositorio antes de integrarlo.
- La verificación de integridad depende de ejecutar el `SHA256SUMS` incluido; la model card se distribuye "as-is, no warranty".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whisper-free/whisper-large-v3-turbo-egy-codeswitched-ggml
- Modelo origen (ajuste fino): https://huggingface.co/mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching
- Repositorio de OpenAI Whisper (tokenizador y pesos base, MIT): https://github.com/openai/whisper
- Anuncio original de Whisper en OpenAI: https://openai.com/index/whisper/
- Versión en francés del anuncio: https://openai.com/fr-FR/index/whisper/
- whisper.cpp (runtime GGML, referencia de despliegue): https://github.com/ggerganov/whisper.cpp
- Resultados de búsqueda no relacionados con el modelo: whisperai.com y clubic.com corresponden a servicios y fichas de terceros sobre Whisper genérico, no a este repositorio.
