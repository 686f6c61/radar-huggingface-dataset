# whisper-free/whisper-small-arabic-codeswitched-ggml

## Resumen

`whisper-free/whisper-small-arabic-codeswitched-ggml` es una conversión al formato GGML (compatible con whisper.cpp) del modelo `IbrahimAmin/code-switched-egyptian-arabic-whisper-small`, un ajuste fino de Whisper Small de OpenAI orientado a reconocimiento automático del habla (ASR) en árabe egipcio con alternancia de código (code-switching), es decir, mezcla de árabe y otros idiomas (típicamente inglés) dentro de la misma conversación. El modelo lo publica el usuario `whisper-free`, que lo distribuye como artefacto para su aplicación Whisper Free.

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión de formato, no de un modelo nuevo. El autor declara explícitamente que los pesos no se han modificado más allá de la conversión a GGML en precisión F16, y que el vocabulario del tokenizador proviene del modelo Whisper base de OpenAI (licencia MIT). El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

Arquitectónicamente hereda la del Whisper Small original: un transformer encoder-decoder con aproximadamente 244 millones de parámetros y una ventana de audio de 30 segundos por segmento. La utilidad práctica del artefacto depende enteramente de la calidad del ajuste fino de origen, sobre el cual esta conversión no aporta información adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, ajustado para ASR) |
| Parametros totales | ~244 M (heredados de Whisper Small; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | F16 (único formato publicado en el repo) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el nombre indica árabe egipcio con code-switching) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (`.bin`, formato whisper.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de Whisper Small, un transformer encoder-decoder diseñado para ASR que convierte espectrogramas Mel en tokens de texto, con soporte multitarea (transcripción, traducción, detección de idioma). Whisper Small tiene del orden de 244 millones de parámetros y procesa audio en ventanas de 30 segundos. Esta publicación concreta no entrena nada: es una conversión de pesos a GGML F16 para su uso con whisper.cpp y con la aplicación Whisper Free.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens de audio, la composición del corpus code-switched ni si se aplicaron técnicas de RLHF o DPO. La model card del artefacto remite al modelo de origen (`IbrahimAmin/code-switched-egyptian-arabic-whisper-small`) para cualquier detalle de entrenamiento, y advierte que las licencias de los datasets de entrenamiento no fueron auditadas. Tampoco se documentan innovaciones técnicas propias más allá de la conversión de formato.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en árabe egipcio con alternancia de código árabe-inglés, según el nombre y la procedencia del modelo de origen.
- Detección de idioma y transcripción multitarea heredadas de la arquitectura Whisper.
- Ejecución en CPU y en dispositivos de bajos recursos mediante whisper.cpp, al estar en formato GGML.
- No hay evidencia documentada de soporte de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento: son capacidades ajenas al propósito de un modelo ASR.
- Capacidades multilingües generales: no disponibles en la información proporcionada; el artefacto no declara lista de idiomas.

## Casos de uso

- Transcripción de conversaciones coloquiales egipcias con mezcla de árabe e inglés: el ajuste fino de origen está específicamente orientado a este fenómeno, habitual en entornos urbanos y profesionales de Egipto.
- Subtitulado de contenido audiovisual en árabe dialectal: el formato GGML permite integrar la transcripción en pipelines locales sin depender de servicios en la nube.
- Aplicaciones de escritorio o móviles con inferencia en CPU: whisper.cpp y el tamaño de 0,5 GB del artefacto permiten desplegar ASR en dispositivos sin GPU dedicada.
- Procesamiento por lotes de grabaciones de atención al cliente: al ser un modelo pequeño, se pueden transcribir grandes volúmenes de audio con coste computacional bajo en comparación con variantes mayores de Whisper.
- Investigación sobre code-switching árabe-inglés: sirve como punto de partida reproducible para comparar con otros ajustes finos del mismo dominio.
- Prototipado rápido dentro de la app Whisper Free: al ser el artefacto oficial distribuido por el autor de la app, es la vía directa para reproducir su comportamiento de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, comparaciones con Whisper Small original ni evaluaciones sobre conjuntos code-switched.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en F16, dado el tamaño del repositorio (0,5 GB) y los ~244 M de parámetros del modelo base.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; el modelo es viable en GPUs integradas y en CPU.
- Cabe holgadamente en GPU de consumo: GTX 1050, RTX 3050, RTX 4060 y superiores; también en Apple Silicon mediante Metal con whisper.cpp.
- Opciones de despliegue: whisper.cpp (formato nativo), Ollama no soporta modelos ASR de este tipo de forma estándar; vLLM y TGI no aplican a GGML de Whisper.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-free/whisper-small-arabic-codeswitched-ggml | ~244 M | ventanas de 30 s | GGML F16 | Apache-2.0 | Hugging Face (0 descargas) |
| openai/whisper-small | ~244 M | ventanas de 30 s | PyTorch, safetensors | MIT | Hugging Face, ampliamente usado |
| IbrahimAmin/code-switched-egyptian-arabic-whisper-small | ~244 M | ventanas de 30 s | PyTorch (presumiblemente) | Apache-2.0 | Hugging Face (modelo de origen) |

La comparación con modelos de mayor tamaño (Whisper Medium, Large-v3) no se incluye por no disponer de datos de rendimiento del artefacto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Artefacto de conversión, no un modelo entrenado: cualquier mérito o defecto de calidad proviene del ajuste fino de origen, no de esta publicación.
- Sin métricas publicadas: no hay evidencia objetiva de WER ni de comportamiento en code-switching; evaluar antes de usar en producción.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados, lo que dificulta validar su cobertura más allá del árabe egipcio.
- Licencias de los datasets de entrenamiento no auditadas, según advierte el propio autor; esto puede afectar al uso comercial pese a la licencia Apache-2.0 del artefacto.
- El tokenizador proviene de Whisper base de OpenAI (MIT); conviene verificar la compatibilidad exacta con el vocabulario del ajuste fino.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio ruidoso o con cambios bruscos de idioma.
- Sin descargas ni validación comunitaria: no hay retroalimentación de terceros sobre su funcionamiento real.
- Repositorio de 0,5 GB con un único archivo de pesos; el autor recomienda verificar la descarga con `SHA256SUMS`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whisper-free/whisper-small-arabic-codeswitched-ggml
- Modelo de origen: https://huggingface.co/IbrahimAmin/code-switched-egyptian-arabic-whisper-small
- Repositorio de whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Página oficial de Whisper en OpenAI: https://openai.com/fr-FR/index/whisper/
