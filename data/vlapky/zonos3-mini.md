# vlapky/ZONOS3-Mini

## Resumen

ZONOS3-Mini es un modelo de síntesis de voz (text-to-speech) compacto y de código abierto desarrollado por Zyphra. Su propuesta central es ofrecer clonación de voz de alta fidelidad y habla natural en tiempo real con un coste computacional muy bajo: la model card declara unos 100 millones de parámetros activos por token, lo que permite ejecutarlo en teléfonos, portátiles e incluso directamente en el navegador mediante WebGPU. Los pesos se publican bajo licencia Apache 2.0.

El modelo emplea una arquitectura híbrida de mezcla de expertos (MoE latente) combinada con capas Gated DeltaNet y atención global, que genera tramas de audio a 15 Hz mediante un códec dual de 10 libros de códigos. Un cabezal iSTFT causal multi-resolución convierte esas tramas en audio a 44,1 kHz conforme se producen, lo que habilita la reproducción en streaming.

Es relevante ahora porque cubre 43 idiomas, permite clonar una voz a partir de una muestra de audio sin transcripción y admite control granular de emoción, ritmo y textura vocal, todo ello con un despliegue que va desde SGLang en GPU NVIDIA hasta runtimes nativos en CPU, Metal o Vulkan. El repositorio de Hugging Face incluye pesos en safetensors y GGUF, así como shards para WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE latente con mezclador de secuencia GDN/atención global (patrón `gdn3_global1`) |
| Parametros totales | 11.332.480 (dato de safetensors); la model card declara 800M totales y ~100M activos por token |
| Parametros activos | ~100M por token (MoE latente: 64 expertos, enrutamiento top-2 desde la capa 1) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (ficheros en `gguf/`); niveles concretos no disponibles |
| Idiomas soportados | 43 idiomas: en, fr, es, de, it, pt, nl, pl, ru, sv, tr, uk, cs, da, fi, el, hu, no, ro, sk, bg, zh, ja, ko, ar, he, vi, id, th, tl, ms, ka, hi, bn, ta, te, mr, gu, kn, ml, pa, or, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF y shards WebGPU |

## Arquitectura y entrenamiento

El texto se normaliza con NeMo (inglés, mandarín, japonés, coreano, alemán, español, francés, italiano y portugués; el resto de idiomas pasa tal cual) y se tokeniza con un SuperBPE de 8.192 entradas. El backbone consta de 11 capas con dimensión de modelo 1.024 y un mezclador de secuencia con patrón `gdn3_global1`: 9 capas Gated DeltaNet más 2 capas de atención global con 16 cabezales. Sobre esa base opera un MoE latente de 64 expertos con enrutamiento top-2 desde la primera capa.

El modelo genera de forma autorregresiva tramas dual-codec a 15 Hz: 10 libros de códigos de 4.096 entradas cada uno, donde el primero es semántico (destilado de un profesor Wav2Vec2-BERT) y los nueve restantes son acústicos. La generación se condiciona al texto, a un prompt de hablante y a tres controles acústicos agrupados en buckets. Un cabezal iSTFT causal multi-resolución renderiza cada trama a 44,1 kHz en cuanto se completa su último libro de códigos, lo que permite streaming de audio real. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Síntesis de voz multilingüe en 43 idiomas, con normalización de texto específica para nueve de ellos.
- Clonación de voz a partir de una muestra de audio de referencia, sin necesidad de transcripción.
- Diseño de voces sintéticas ajustando edad, acento y textura vocal.
- Control de emoción, ritmo y estilo de entrega, incluso a nivel de palabra individual.
- Generación de audio a 44,1 kHz con streaming en tiempo real (respuesta PCM).
- 27 voces por defecto agrupadas por idioma, incluidas en el repositorio.
- Ejecución en navegador mediante WebGPU, sin instalación ni servidor.
- API HTTP compatible con el endpoint `/v1/audio/speech` de OpenAI a través de SGLang-Omni.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; el modelo es exclusivamente de texto a voz.

## Casos de uso

- Asistentes de voz en dispositivos móviles: el modelo corre en tiempo real en teléfonos gracias a sus ~100M de parámetros activos, lo que permite integrar un asistente con voz natural sin depender de la nube.
- Audiolibros y narración automatizada: el control de emoción, ritmo y entrega por palabra permite ajustar la interpretación de cada frase y mantener una voz consistente a lo largo de horas de audio.
- Doblaje y localización de contenidos: con 43 idiomas y clonación de voz, se puede generar una versión en otro idioma conservando el timbre del hablante original a partir de una muestra de referencia.
- Videojuegos y personajes interactivos: el diseño de voces por edad, acento y textura, junto con el control emocional, permite crear elencos de personajes con voces diferenciadas sin actores de doblaje.
- Atención al cliente automatizada: el despliegue con SGLang-Omni expone un endpoint compatible con OpenAI y streaming de audio, lo que facilita integrarlo en pipelines de IVR o agentes conversacionales existentes.
- Accesibilidad: la ejecución local en navegador mediante WebGPU permite ofrecer lectura en voz alta de alta calidad sin enviar texto a servidores externos, útil para usuarios con discapacidad visual o dificultades de lectura.
- Prototipado rápido en frontend: los shards WebGPU y el playground Lite permiten probar clonación de voz directamente en el navegador antes de comprometerse con una infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~100M de parámetros activos y pesos totales declarados de 800M, el modelo está pensado para ejecutarse en hardware muy modesto, pero no se publican cifras de VRAM por cuantización.
- GPU recomendadas: NVIDIA (servidor CUDA de Zyphra y SGLang-Omni), Apple Silicon (servidor MLX), y cualquier GPU compatible con Metal o Vulkan a través del servidor C++/ggml.
- Cabe en GPU de consumo: sí; la model card afirma ejecución en tiempo real en teléfonos y portátiles, incluido el navegador vía WebGPU. No se detallan modelos concretos de GPU de consumo.
- Opciones de despliegue: SGLang-Omni (endpoint compatible con OpenAI), servidor CUDA nativo, servidor MLX para Apple Silicon, servidor y CLI C++/ggml (CPU, CUDA, Metal, Vulkan), y build WebGPU para navegador.
- Latencia y throughput: se declara ejecución en tiempo real, pero no se proporcionan cifras de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZONOS3-Mini | ~100M activos (800M totales declarados) | no disponible | 43 | Apache 2.0 | Hugging Face, Zyphra Cloud, runtimes nativos y WebGPU |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de parámetros son inconsistentes: safetensors reporta 11.332.480 parámetros totales, mientras que la model card declara 800M totales y ~100M activos. Conviene verificar esta discrepancia antes de dimensionar infraestructura.
- No se documentan sesgos conocidos, pero al ser un modelo de voz multilingüe entrenado con datos no especificados, es probable que reproduzca sesgos de acento, género y prosodia presentes en el corpus; no hay información oficial al respecto.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en idiomas sin normalización NeMo (los que pasan tal cual al tokenizador), y en palabras poco frecuentes o nombres propios.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el desplegador.
- La longitud de contexto no está publicada, lo que limita la planificación de síntesis de textos largos en una sola pasada.
- No hay información sobre el dataset de entrenamiento ni sobre procesos de alineación (RLHF/DPO), lo que dificulta evaluar sesgos y robustez.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación (2026-11-11) es posterior a la fecha habitual de referencia; conviene confirmar la vigencia y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/vlapky/ZONOS3-Mini
- Repositorio original en Hugging Face (referenciado en la model card): https://huggingface.co/Zyphra/ZONOS3-Mini
- Blog de Zyphra: https://www.zyphra.com/our-work/zonos3-mini
- Zyphra Cloud: https://cloud.zyphra.com/models/zyphra/ZONOS3-Mini
- Repositorio GitHub de runtimes: https://github.com/Zyphra/ZONOS3-Mini
- SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Guía de instalación de SGLang-Omni: https://github.com/sgl-project/sglang-omni/blob/main/docs/get_started/installation.md
- Cookbook de ZONOS3: https://github.com/sgl-project/sglang-omni/blob/main/docs/cookbook/zonos3.md
- Playground completo (WebGPU): https://zyphra.com/zonos3-mini/localplayground#cast
- Playground Lite (WebGPU): https://zyphra.com/zonos3-mini/localplayground/lite
- Discord de Zyphra: https://discord.gg/gTW9JwST8q
- Ficheros GGUF: https://huggingface.co/Zyphra/ZONOS3-Mini/tree/main/gguf
- Shards WebGPU: https://huggingface.co/Zyphra/ZONOS3-Mini/tree/main/web
- Voces por defecto: https://huggingface.co/Zyphra/ZONOS3-Mini/blob/main/gguf/voices/README.md
