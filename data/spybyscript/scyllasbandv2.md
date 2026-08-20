# spybyscript/scyllasbandv2

## Resumen

Scylla's Band v2 es un modelo de síntesis de voz (text-to-speech) multilingüe, multi-voz y expresivo, desarrollado por spybyscript para inferencia local y autohospedada. El modelo predice la duración de los fonemas, genera latentes acústicos continuos mediante rectified flow y los decodifica a una forma de onda de 24 kHz a través de un adaptador acústico aprendido y un decodificador Vocos congelado. Está orientado a entornos de producción donde la privacidad y el control sobre la síntesis son críticos, ya que no depende de servicios en la nube.

La versión 2 amplía el soporte de idiomas a francés, alemán y vietnamita, además de inglés (con dialectos estadounidense y británico), español e italiano. Mantiene un conjunto fijo de diez voces gestionadas y añade un control de afecto con cinco ejes independientes (calma, alegría, ira, tristeza y susurro). Los formatos de distribución incluyen paquetes ONNX Runtime para escritorio y servidor, LiteRT para móvil y embebido, y checkpoints de PyTorch para investigación y reexportación. La licencia Apache 2.0 permite uso comercial sin restricciones.

La arquitectura se basa en un pipeline de tres etapas: frontend G2P (grafo de texto a fonema), modelo de duración y modelo acústico de flujo rectificado, seguido de un adaptador de vocoder. El repositorio incluye el runtime público en GitHub, con herramientas de descarga, validación y síntesis desde línea de comandos. El tamaño del repositorio es de 4,0 GB, lo que indica que es un modelo considerable para su categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Continuous-latent duration/flow TTS (predicción de duración de fonemas, latentes acústicos con rectified flow, vocoder Vocos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens G2P de texto, 512 fotogramas de fonemas, 640 fotogramas latentes (presupuestos fijos de gráfico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en_us, en_gb, es, it, fr, de, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, LiteRT, PyTorch (.pt) |

## Arquitectura y entrenamiento

Scylla's Band v2 sigue un pipeline de síntesis en tres etapas. Primero, un frontend G2P (grafema a fonema) convierte el texto de entrada en una representación fonética a nivel de frase, con normalización de números y puntuación específica por idioma. Después, un modelo de duración predice la duración de cada fonema usando datos de alineación derivados del audio real. Finalmente, un modelo acústico de flujo rectificado genera latentes continuos de 24 dimensiones, que se decodifican a una forma de onda de 24 kHz mediante un adaptador acústico y el decodificador de forma de onda Vocos, congelado.

El entrenamiento incorpora varias innovaciones técnicas: vistas largas y fragmentadas de la secuencia, silencios de puntuación explícitos, contexto de tres segmentos para mejorar la coherencia, un dropout condicionado más fuerte para robustez, y un adaptador de vocoder entrenado tanto con latentes acústicos reales (oracle) como con latentes generados. Los objetivos de duración se derivan de la alineación real de los audios, y el G2P a nivel de frase que se distribuye es el frontend de tiempo de ejecución, no la fuente de las etiquetas de entrenamiento acústico. La versión 2 también introduce un contrato de afecto versionado (axis-order version 3) que evita malinterpretar las posiciones de los ejes de la v1.

## Capacidades

- Síntesis de voz multilingüe con siete identificadores públicos de idioma: en_us, en_gb, es, it, fr, de y vi.
- Diez voces gestionadas: ariadne, felix, gwen, ink, max, orpheus, rex, scylla, stone y tuesday.
- Control expresivo continuo y mixto sobre cinco dimensiones de afecto: calma, alegría, ira, tristeza y susurro, con escala de emoción configurable.
- Síntesis de diálogo multi-voz mediante texto etiquetado, que permite cambiar de voz en una misma secuencia.
- Narración de formato largo con planificación y fragmentación automática.
- Inferencia multiplataforma con ONNX Runtime (escritorio, servidor, Android, iOS) y LiteRT (nativo y embebido).
- Soporte de dialecto inglés explícito: Ink, Orpheus y Tuesday usan en_gb; el resto de voces gestionadas usan en_us.
- Paquetes de inferencia y checkpoints PyTorch incluidos para inspección, investigación y reexportación.

## Casos de uso

- Narración de audiolibros y contenido de formato largo: el modelo gestiona automáticamente la planificación y fragmentación de texto largo, manteniendo coherencia y naturalidad en la prosodia.
- Diálogos multi-voz para videojuegos o animación: permite asignar voces distintas a cada personaje mediante texto etiquetado, sin necesidad de concatenar clips generados por separado.
- Síntesis expresiva para asistentes virtuales: el control de afecto (calma, alegría, ira, tristeza, susurro) permite ajustar el tono en función del contexto conversacional, mejorando la experiencia de usuario.
- Accesibilidad: conversión de texto a voz en español, inglés, francés, alemán, italiano y vietnamita para aplicaciones de lectura de pantalla o interfaces adaptadas.
- Sistemas de atención al cliente autohospedados: al ejecutarse localmente con ONNX Runtime, no hay dependencia de servicios externos, lo que reduce costes y garantiza privacidad de los datos de los usuarios.
- Generación de contenido para medios y entretenimiento: voces en inglés británico y estadounidense, además de cinco idiomas más, permiten producir locuciones para vídeo, podcast o anuncios sin contratar actores de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas comparativas de calidad de voz (MOS), inteligibilidad o rendimiento en tareas estándar de TTS.

## Requisitos de hardware

- El tamaño del repositorio es de 4,0 GB, por lo que el modelo completo ocupa varios GB en disco.
- No se especifica la VRAM mínima para inferencia en GPU, pero al ser un modelo TTS de tamaño moderado (no un LLM), puede ejecutarse en GPUs consumer como RTX 3060 o superiores.
- No se proporcionan datos de latencia ni throughput. El perfil de calidad por defecto usa 8 pasos de muestreo Heun, lo que sugiere un coste computacional moderado.
- Opciones de despliegue: ONNX Runtime para escritorio, servidor, Android e iOS; LiteRT para móvil y embebido; también se puede ejecutar desde Python con el runtime público de GitHub.
- El modelo puede funcionar en CPU para pruebas, pero para síntesis en tiempo real se recomienda GPU o acelerador.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos de la misma categoría en la información proporcionada. No obstante, se puede situar en el ecosistema de TTS multilingüe expresivo autohospedado, similar a otros sistemas como Piper, Coqui TTS o VITS. La diferencia clave es que Scylla's Band v2 ofrece un control de afecto más granular (5 ejes) y soporte de diálogo multi-voz, mientras que alternativas como Piper son más ligeras pero con menos control expresivo. No se pueden dar cifras de rendimiento sin datos oficiales.

## Limitaciones y advertencias

- No es un sistema de clonación de voz arbitraria: el autor indica explícitamente que no está pensado para suplantar a personas reales ni para uso fraudulento.
- Los presupuestos fijos de gráfico (512 tokens de texto G2P, 512 fotogramas de fonemas, 640 latentes) pueden limitar la longitud máxima de una secuencia de entrada; el modelo fragmenta automáticamente texto largo, pero puede haber cortes en entradas muy extensas.
- El control de afecto se limita a las cinco dimensiones entrenadas; no se incluye un eje de sarcasmo ni otras emociones no entrenadas, para preservar la coherencia con la v1.
- La normalización de texto está adaptada a los seis idiomas soportados, pero puede haber errores en números o puntuación poco frecuentes en cada idioma.
- No se distribuyen datos de entrenamiento, lo que limita la reproducibilidad de la investigación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad de la síntesis en contextos específicos de producción.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/spybyscript/scyllasbandv2
- Repositorio de runtime en GitHub: https://github.com/lowkeytea/scyllasband
- Página de demostración interactiva: https://lowkeytea.github.io/scyllasband/
- Discord del proyecto: https://discord.gg/cNdBuM3tS
- Model card en el repositorio de GitHub: https://github.com/lowkeytea/scyllasband/blob/main/MODEL_CARD.md
