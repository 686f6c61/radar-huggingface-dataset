# tinytrashlabs/Qwen3-TTS-1.7B-Base-ANE

## Resumen

Qwen3-TTS-1.7B-Base-ANE es una conversión a Core ML del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base del equipo Qwen (Alibaba Cloud), publicada por Tiny Trash Labs. El modelo original es un sistema text-to-speech con capacidad de clonación de voz: a partir de unos segundos de audio de referencia y su transcripción, genera habla nueva con la identidad vocal del hablante de referencia. Esta versión empaqueta el transformer "talker", el predictor de códigos, el vocoder y los codificadores de audio y de hablante como modelos Core ML stateful que se ejecutan en el Neural Engine de un Mac, sin necesidad de GPU, MLX ni ONNX Runtime.

La relevancia de esta ficha está en el objetivo de despliegue: llevar un TTS de 1.700 millones de parámetros a inferencia local en hardware Apple consumer, con streaming de audio en trozos de 0,96 s y un muestreador determinista que reproduce `default_rng(seed)` de numpy. El conjunto pesa aproximadamente 2,7 GB (el repositorio completo, 2,9 GB) y requiere macOS 15 o superior por el uso de modelos Core ML con estado.

El modelo base trabaja a 12 Hz de frames de codec y genera audio mono a 24 kHz. Soporta diez idiomas (inglés, chino, español, francés, alemán, italiano, portugués, japonés, coreano y ruso) y se distribuye bajo licencia Apache 2.0. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo para TTS (talker) + predictor de códigos + vocoder, convertido a Core ML stateful |
| Parámetros totales | 1,7 mil millones (según el nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos en fp16; text embedding almacenado cuantizado; no se detallan otros formatos |
| Idiomas soportados | en, zh, es, fr, de, it, pt, ja, ko, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlmodelc` (Core ML compilado), con componentes auxiliares en CPU (Accelerate) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-Base es un sistema de síntesis de voz autorregresivo que opera sobre tokens de codec a 12 Hz. La conversión a Core ML descompone el "talker" en cuatro chunks stateful (`talker0` a `talker3`) con la caché KV gestionada dentro de Core ML, e incluye un predictor de códigos que emite 15 subcódigos por frame. El vocoder se reparte entre un upsampler en Core ML (`upF`, `upMall`) y una cabeza en CPU mediante Accelerate (`vochead/`). Los codificadores de audio (`QwenSpeechEncoder`) y de hablante (`QwenSpeakerEncoder`) también se ejecutan en el Neural Engine, lo que permite preparar una voz nueva íntegramente en el dispositivo.

Los pesos no fueron ajustados finamente: la model card indica explícitamente que el modelo no ha recibido fine-tuning y que los cambios respecto al original son de conversión (fp16, división del talker en cuatro chunks, reparto del vocoder y almacenamiento cuantizado del text embedding). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La innovación técnica destacable de este port es el muestreador exacto, que reproduce `default_rng(seed)` de numpy y hace que una renderización con semilla sea reproducible y comparable con la referencia en Python.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida mono a 24 kHz.
- Clonación de voz a partir de unos segundos de audio de referencia más su transcripción exacta.
- Preparación de la voz en el dispositivo mediante los codificadores de hablante y de audio incluidos.
- Multilingüe: diez idiomas (inglés, chino, español, francés, alemán, italiano, portugués, japonés, coreano y ruso).
- Streaming de audio en trozos de 0,96 s, con posibilidad de acortar el primer chunk para reducir latencia.
- Renderización determinista con semilla, reproducible y comparable con la implementación de referencia en Python.
- Gestión de lecturas largas: `QwenTalkSession` / `renderBreak` dividen el texto y arrastran los frames de texto y codec de cada parte al prompt de la siguiente, manteniendo un único flujo de muestreo para no reiniciar el ritmo ni el tono en cada corte.
- Redibujado de tomas fallidas ("derailed take") dentro del mismo flujo de muestreo.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni otros modos especiales; es un modelo exclusivamente de voz.

## Casos de uso

- Audiolibros y narración larga: `renderBreak` permite dividir un texto extenso en partes y conservar la continuidad de ritmo y tono entre cortes, algo crítico para capítulos de decenas de minutos con una sola identidad vocal.
- Clonación de voz para doblaje y localización: con unos segundos de referencia y su transcripción se puede generar la misma voz en los diez idiomas soportados, útil para versiones multilingües de un mismo contenido.
- Accesibilidad en macOS: integración en aplicaciones nativas que necesiten leer texto en voz alta sin depender de servicios en la nube, ejecutando todo en el Neural Engine y sin GPU.
- Prototipado de asistentes de voz: el streaming en chunks de 0,96 s y la opción de acortar el primer chunk permiten construir interfaces conversacionales con latencia controlada en un Mac.
- Producción de contenido para podcasts y vídeo: generación de locuciones con una voz propia clonada, con renderizaciones reproducibles mediante semilla para poder repetir tomas idénticas.
- Investigación en TTS y evaluación de ports: al reproducir el muestreador de numpy, sirve para comparar la salida del port Core ML con la referencia en Python y validar conversiones.
- Aplicaciones de estudio de voz en local: los codificadores incluidos permiten preparar una voz nueva en el dispositivo, sin enviar audio de referencia a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una referencia cualitativa de velocidad: en sus pruebas rinde aproximadamente en tiempo real en un Mac con M5, de modo que el streaming va solo ligeramente por delante de la reproducción. El autor advierte que las cifras varían según el Mac y el estado térmico.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en el Neural Engine y en la CPU (Accelerate), no en una GPU dedicada.
- Almacenamiento: el conjunto de modelos Core ML ocupa aproximadamente 2,7 GB; el repositorio completo, 2,9 GB.
- Sistema operativo: macOS 15 o superior, obligatorio por el uso de modelos Core ML stateful.
- GPU recomendadas: no aplica. El requisito es un Mac con Neural Engine; el autor cita un M5 como referencia de rendimiento en tiempo real.
- Compatibilidad con hardware consumer: sí, en Macs; el autor indica que el conjunto es demasiado grande para iPhone de 8 GB y remite a la versión de 0,6B para esos dispositivos.
- Opciones de despliegue: runtime Swift `QwenANE` del repositorio `TinyTrashLabs/gloam-voice-studio`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: streaming en chunks de 0,96 s; aproximadamente tiempo real en M5 según el autor; sin cifras adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3-TTS-1.7B-Base-ANE (este) | 1,7B | no disponible | 10 | Apache 2.0 | Core ML / Neural Engine en macOS 15+ |
| Qwen3-TTS-0.6B-Base-ANE | 0,6B | no disponible | no disponible | Apache 2.0 (según el modelo base) | Core ML / Neural Engine; apto para iPhone |
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1,7B | no disponible | 10 | Apache 2.0 | Framework original de Qwen; requiere GPU o Python |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de benchmarks ni de otros sistemas TTS comparables. La diferencia principal entre el port de 1,7B y el de 0,6B es la calidad de clonación (mejor en 1,7B) frente a velocidad y huella de memoria (mejor en 0,6B).

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo de voz, puede reproducir sesgos acústicos y de pronunciación presentes en los datos del modelo original.
- Alucinación: no aplica en el sentido textual, pero la generación de voz puede desviarse del texto de entrada o producir tomas defectuosas; el port incluye redibujado de tomas fallidas, lo que sugiere que el problema existe en la práctica.
- Idiomas: aunque se listan diez idiomas, no se detalla la calidad por idioma ni el soporte de code-switching.
- Licencia: Apache 2.0 permite uso comercial, pero la model card exige clonar únicamente la propia voz o voces con permiso explícito; el uso indebido de voces de terceros puede tener implicaciones legales ajenas a la licencia.
- Plataforma: requiere macOS 15 o superior y hardware Apple con Neural Engine; no es desplegable en Linux, Windows ni GPUs NVIDIA.
- Memoria: 2,7 GB de modelos impiden su uso en iPhone de 8 GB; el autor remite a la variante de 0,6B.
- Rendimiento: en M5 va aproximadamente en tiempo real, por lo que el margen de streaming es escaso y puede degradarse con el estado térmico o en Macs menos potentes.
- Reproducibilidad: la renderización con semilla es reproducible, pero el autor advierte que los números de velocidad variarán según el equipo.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; conviene tratarlo como una publicación reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinytrashlabs/Qwen3-TTS-1.7B-Base-ANE
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Variante para iPhone (0,6B): https://huggingface.co/tinytrashlabs/Qwen3-TTS-0.6B-Base-ANE
- Repositorio del runtime Swift: https://github.com/TinyTrashLabs/gloam-voice-studio
- Aplicación Gloam Voice Studio: https://gloam.fm
- Sitio del autor: https://tinytrashlabs.com
- Licencia Apache 2.0: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
