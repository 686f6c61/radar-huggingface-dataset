# UnknownResearcher/chatterbox-turbo-coreml

## Resumen

chatterbox-turbo-coreml es una conversión a Core ML del modelo de síntesis de voz Chatterbox Turbo de Resemble AI, empaquetada para ejecutarse en Apple Silicon. La publica el usuario UnknownResearcher como artefacto derivado (conversión, no reentrenamiento) del modelo base ResembleAI/chatterbox-turbo, con licencia MIT y un repositorio de 1,7 GB. No es un modelo entrenado desde cero: reutiliza sin cambios el decodificador S3Gen, el encoder de voz y el tokenizer de FluidInference/chatterbox-nano-coreml, y sustituye el modelo de tokens por el T3 de Turbo (GPT2-medium: 24 capas, 1024 de anchura, 16 cabezas).

El objetivo es ejecutar TTS local y offline en Macs y dispositivos Apple, sin CUDA ni servicios en la nube, aprovechando Core ML y el estado KV (`MLState`) para la decodificación autorregresiva. Resulta relevante para quien necesite síntesis de voz en el dispositivo con privacidad y sin dependencia de servidores, aunque se trata de un artefacto de tercera parte, no oficial y sin benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS: modelo de tokens T3 (transformer decoder tipo GPT2-medium) + decodificador flow-matching S3Gen (`FlowMean-N500`) + vocoder neuronal HiFT (`HiFT-T1000`) + encoder de voz + tokenizer, todo convertido a Core ML |
| Parámetros totales | No disponible (el componente T3 corresponde a la configuración GPT2-medium, ~355 M; no se documenta el recuento del pipeline completo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El artefacto de prefill se nombra T512-M1536, pero la model card no documenta el significado exacto ni los límites de longitud |
| Tipos de cuantización | fp16 (todos los `.mlmodelc`); tablas de embeddings en safetensors fp16 |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | MIT (pesos © Resemble AI) |
| Formato de pesos | Core ML `.mlmodelc` (fp16) + `tables.safetensors` |

## Arquitectura y entrenamiento

El pipeline combina un modelo de tokens autorregresivo y un decodificador generativo. El T3 es un transformer decoder con 24 capas, anchura 1024 y 16 cabezas (configuración GPT2-medium) que consume condicionamiento de voz, texto y token BOS; se despliega en dos artefactos: un prefill (`T3Turbo-Prefill-T512-M1536-fp16.mlmodelc`) y un paso de decodificación con caché KV en `MLState` (`T3Turbo-Decode-M1536-fp16-stateful.mlmodelc`), que requiere macOS 15 o superior. La parte acústica la forman el decodificador flow-matching S3Gen (`FlowMean-N500-fp16.mlmodelc`) y el vocoder HiFT (`HiFT-T1000-fp16.mlmodelc`), copiados sin modificar del repositorio Nano, junto con el tokenizer y el encoder de voz. Las tablas de embeddings de texto y habla, así como la voz por defecto integrada (procedente de `conds.pt`), se distribuyen en `tables/tables.safetensors` y `tables/voice-default.safetensors`.

No hay entrenamiento nuevo: la conversión se realizó con los scripts Nano de FluidInference (proyecto mobius) adaptados a GPT2-medium. Frente a la implementación en PyTorch, los logits fp16 de Core ML difieren como máximo 0,014 en el prefill y 0,016 en la decodificación con estado. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida de audio generada por el vocoder HiFT.
- Condicionamiento de voz mediante encoder de voz y una voz por defecto incluida en el repositorio.
- Ejecución local en Apple Silicon a través de Core ML, sin CUDA y sin conexión a servicios externos.
- Decodificación autorregresiva con caché KV persistida en `MLState` (macOS 15+).
- Precisión fp16 con desviación de logits acotada frente a PyTorch (≤0,014 prefill, ≤0,016 decode).
- Audio generado sin marca de agua Perth, ya que el pipeline Core ML no la aplica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, código, matemáticas ni visión: es un modelo de TTS, no un LLM.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Síntesis de voz en aplicaciones macOS/iOS: integrar el pipeline Core ML para narrar contenido dentro de una app nativa de Apple Silicon, con ejecución offline y sin enviar texto a la nube.
- Lectores de pantalla y accesibilidad: generar locución local para personas con discapacidad visual, manteniendo la privacidad del texto leído y funcionando sin red.
- Audiolibros y pódcast: convertir texto largo en audio por lotes en un Mac, aprovechando el vocoder HiFT y la voz por defecto para una narración consistente.
- Asistentes conversacionales de escritorio: dotar a un asistente local de respuesta hablada en tiempo de ejecución sobre el dispositivo, sin depender de APIs de TTS externas.
- Prototipado de interfaces de voz: validar flujos de conversación y elección de voz en fases tempranas de desarrollo antes de pasar a un servicio en producción.
- Síntesis sensible a la privacidad: generar audio de documentos internos, sanitarios o legales en el propio dispositivo, evitando la exposición del texto a terceros.
- Videojuegos y experiencias interactivas en macOS: generar diálogo dinámico de personajes en local, siempre que el coste de latencia del pipeline Core ML sea aceptable para el caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como dato de fidelidad de conversión (no de calidad de síntesis), la model card indica que los logits fp16 de Core ML difieren de PyTorch como máximo 0,014 en el prefill y 0,016 en la decodificación con estado. No hay métricas objetivas de calidad de audio (MOS, WER, similitud de hablante) en la información proporcionada.

## Requisitos de hardware

- Plataforma: Apple Silicon (Macs y dispositivos Apple compatibles con Core ML); no hay soporte CUDA.
- Sistema operativo: macOS 15 o superior para el artefacto de decodificación con estado (`MLState`).
- Peso en disco: repositorio de 1,7 GB (pesos fp16); el modelo es pequeño para estándares de LLM y cabe holgadamente en cualquier Mac moderno.
- Memoria: al ser Core ML sobre memoria unificada, se estima un consumo de runtime de pocos GB (del orden de 2-4 GB, estimación a partir del tamaño fp16 de los pesos y no confirmada por el autor).
- GPU recomendadas: no aplica el concepto de VRAM discreta; se ejecuta sobre la GPU/Neural Engine de Apple Silicon. No hay datos de rendimiento por chip (M1/M2/M3/M4).
- Despliegue: Core ML a través de FluidAudio, aplicando el parche `ChatterboxNanoVariant.turbo` del fork jordan-schnur/FluidAudio. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Componente de tokens | Formato | Plataforma | Licencia | Marca de agua |
|---|---|---|---|---|---|
| chatterbox-turbo-coreml (este) | T3 GPT2-medium (24 capas, 1024, 16 cabezas) | Core ML fp16 + safetensors | Apple Silicon, macOS 15+ | MIT | No aplicada |
| ResembleAI/chatterbox-turbo | T3 GPT2-medium | PyTorch (no confirmado en detalle) | GPU/CPU (CUDA, MPS) | MIT (pesos © Resemble AI) | Perth (según implica la model card) |
| FluidInference/chatterbox-nano-coreml | T3 variante Nano (más pequeño) | Core ML fp16 + safetensors | Apple Silicon | No disponible | No disponible |

Los recuentos de parámetros totales y las longitudes de contexto de las tres variantes no están disponibles en la información proporcionada. La diferencia principal entre este artefacto y la variante Nano es el modelo de tokens: comparten S3Gen, encoder de voz y tokenizer byte a byte.

## Limitaciones y advertencias

- Artefacto de tercera parte y no oficial: lo publica UnknownResearcher con 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad ni soporte de Resemble AI.
- Ausencia de marca de agua Perth: el pipeline Core ML no la aplica, lo que elimina la trazabilidad de procedencia del audio y puede chocar con requisitos de transparencia (por ejemplo, obligaciones de etiquetado de contenido sintético).
- Riesgo de suplantación de voz: al incluir encoder de voz y condicionamiento, un uso indebido puede generar audio con identidades de hablante; conviene aplicar controles y consentimiento.
- Sesgos del modelo base: la model card no documenta la composición del dataset de entrenamiento, por lo que se heredan sesgos desconocidos de Chatterbox Turbo.
- Idiomas no declarados: no hay lista de idiomas soportados; el comportamiento fuera del idioma o idiomas del modelo base no está garantizado.
- Dependencia de plataforma: requiere Apple Silicon y, para la decodificación con estado, macOS 15+; no es portable a CUDA ni a otras plataformas sin reconversión.
- Solo fp16: no se ofrecen variantes cuantizadas a int8/int4; la desviación de logits frente a PyTorch es de hasta 0,016.
- Licencia MIT permite uso comercial, pero los pesos son © Resemble AI y conviene mantener la atribución; verificar los términos del modelo base antes de producción.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad de audio ni de latencia para planificar un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UnknownResearcher/chatterbox-turbo-coreml
- Modelo base ResembleAI/chatterbox-turbo: https://huggingface.co/ResembleAI/chatterbox-turbo
- Conversión de referencia FluidInference/chatterbox-nano-coreml: https://huggingface.co/FluidInference/chatterbox-nano-coreml
- Scripts de conversión mobius: https://github.com/FluidInference/mobius
- Fork de FluidAudio con el parche `ChatterboxNanoVariant.turbo`: https://github.com/jordan-schnur/FluidAudio
