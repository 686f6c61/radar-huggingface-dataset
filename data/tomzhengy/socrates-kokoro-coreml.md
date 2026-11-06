# tomzhengy/socrates-kokoro-coreml

## Resumen

`socrates-kokoro-coreml` es un paquete de voces y pesos convertidos a Core ML del modelo de síntesis de voz Kokoro-82M, publicado por el usuario tomzhengy. No se trata de un modelo entrenado desde cero, sino de una redistribución empaquetada para su uso en una aplicación iOS de lectura (Socrates), que descarga estos artefactos en tiempo de ejecución. El modelo base es `hexgrad/Kokoro-82M`, un TTS ligero de 82 millones de parámetros con licencia Apache-2.0.

El repositorio incluye dos componentes: por un lado, los ficheros de estilo de cuatro voces (`af_heart`, `af_bella`, `am_michael` y `bm_fable`), provenientes de la conversión ONNX con marcas de tiempo de `onnx-community`; por otro, el grafo de Kokoro dividido en etapas Core ML (`KokoroHar`, `KokoroDecoderPre`, `KokoroTailLogits` y `KokoroFoldR4`) más una etapa de ruido en fp16 que se ejecuta en CPU como respaldo.

Su relevancia es acotada: sirve como referencia práctica de cómo desplegar Kokoro en el Neural Engine de Apple mediante Core ML, con un generador "folded" a cuatro filas de 240 frames. No aporta mejoras de calidad sobre el modelo original ni datos de entrenamiento nuevos; es un artefacto de distribución para una app concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (TTS neuronal; grafo dividido en etapas Core ML) |
| Parametros totales | 82 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (etapa de ruido); resto de etapas sin cuantizacion declarada |
| Idiomas soportados | no disponible (las voces incluidas son inglesas: af_*, am_*, bm_*) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`) y ficheros de estilo de voz; base en safetensors/ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es Kokoro-82M, un sistema de text-to-speech neuronal de pequeño tamano. Este repositorio no documenta la arquitectura interna ni el proceso de entrenamiento del modelo base; únicamente describe la conversión a Core ML. El grafo se ha troceado en etapas: `KokoroHar`, `KokoroDecoderPre`, `KokoroTailLogits` y `KokoroFoldR4` corresponden al generador "folded" del proyecto `mattmireles/kokoro-coreml`, configurado a cuatro filas de 240 frames, y se ejecutan en el Neural Engine. La etapa de ruido en fp16 se ejecuta en CPU y actúa como fallback.

La conversión se realizó con la herramienta `laishere/kokoro-coreml`. Los ficheros de estilo de voz provienen de `onnx-community/Kokoro-82M-v1.0-ONNX-timestamped`. No se especifican volúmenes de datos de entrenamiento, composición del dataset ni si hubo RLHF o DPO, ya que se trata de una redistribución y no de un entrenamiento nuevo.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con cuatro voces de estilo predefinidas: `af_heart`, `af_bella`, `am_michael` y `bm_fable`.
- Generación de audio con marcas de tiempo, ya que los ficheros de estilo provienen de la variante ONNX "timestamped".
- Ejecución en el Neural Engine de Apple mediante Core ML, con una etapa de ruido en CPU como respaldo.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni modos de "thinking"; es exclusivamente un modelo TTS.
- El soporte de idiomas no está declarado en la información disponible; las voces incluidas sugieren inglés, pero no se confirma.

## Casos de uso

- Lectura por voz en aplicaciones iOS: el paquete está pensado para que la app Socrates descargue las voces y sintetice texto en el dispositivo, aprovechando el Neural Engine para reducir latencia y consumo.
- Integración de TTS offline en apps móviles: al ser Core ML, permite síntesis sin conexión ni llamadas a servicios externos, útil en lectores, notas de voz o accesibilidad.
- Audiolibros y lectura de artículos: las cuatro voces permiten alternar narradores y generar audio con marcas de tiempo para resaltado sincronizado.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual, ejecutándose localmente en el dispositivo.
- Prototipado de asistentes de voz en el ecosistema Apple: sirve como base para integrar TTS en apps de iOS/macOS sin depender de la nube.
- Evaluación de pipelines Core ML: útil para desarrolladores que quieran estudiar cómo se trocea un modelo TTS en etapas y se reparte la ejecución entre Neural Engine y CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo base tiene 82 M de parámetros; el repositorio ocupa 0,2 GB, por lo que la huella en memoria es muy reducida (del orden de cientos de MB incluyendo etapas y voces).
- GPU recomendadas: no aplica en el sentido habitual; el destino es el Neural Engine de Apple (iPhone/iPad/Mac con chip A-series o M-series).
- Cabe en hardware de consumo: sí, está diseñado para ejecutarse en dispositivos Apple móviles.
- Opciones de despliegue: Core ML en iOS/macOS; el modelo base Kokoro-82M puede desplegarse también con ONNX Runtime, llama.cpp no aplica (no es un LLM) y vLLM/TGI no son adecuados para TTS de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| socrates-kokoro-coreml | 82 M (base) | no disponible | Apache-2.0 | Hugging Face (Core ML) | Paquete de voces y etapas Core ML para iOS |
| hexgrad/Kokoro-82M | 82 M | no disponible | Apache-2.0 | Hugging Face | Modelo base original, sin conversión Core ML |
| onnx-community/Kokoro-82M-v1.0-ONNX-timestamped | 82 M | no disponible | Apache-2.0 | Hugging Face (ONNX) | Variante ONNX con marcas de tiempo, fuente de las voces |
| mattmireles/kokoro-coreml | 82 M | no disponible | no disponible | GitHub | Generador "folded" usado en este paquete |

## Limitaciones y advertencias

- Es un artefacto de distribución, no un modelo nuevo: no aporta mejoras de calidad ni datos de entrenamiento propios.
- Solo incluye cuatro voces, todas de estilo inglés según su nomenclatura; no se declara soporte multilingüe.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a dispositivos y frameworks de Apple.
- El rendimiento y la calidad heredan las limitaciones del modelo base Kokoro-82M, que no se detallan en esta información.
- Riesgo de alucinación no aplica en el sentido de LLM, pero la síntesis puede producir pronunciaciones incorrectas en textos fuera de dominio.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los proyectos de conversión (`laishere/kokoro-coreml`, `mattmireles/kokoro-coreml`), cuya licencia no se especifica aquí.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tomzhengy/socrates-kokoro-coreml
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Voces ONNX con marcas de tiempo: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX-timestamped
- Herramienta de conversión: https://github.com/laishere/kokoro-coreml
- Generador folded: https://github.com/mattmireles/kokoro-coreml
