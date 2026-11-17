# spyurzad/Gemma-4-Abliterated-LiteRT

## Resumen

Gemma-4-Abliterated-LiteRT es una distribución en formato `.litertlm` de los modelos Gemma 4 E2B y E4B, publicada por el usuario spyurzad a partir de los modelos base de DuoNeural (TurboGemma4E2B y Gemma-4-E4B-Abliterated). El paquete contiene dos ficheros: uno de 2,4 GB correspondiente al modelo de 2,3B parámetros activos y otro de 3,9 GB correspondiente al de 4,5B parámetros activos. El objetivo es permitir la inferencia local en dispositivos Android mediante la aplicación Google AI Edge Gallery, sin conexión a internet ni llamadas a API.

La característica diferencial es la "abliteración": los modelos fuente han sido modificados mediante proyección ortogonal para eliminar los vectores de rechazo del espacio de pesos, de modo que el modelo responde a peticiones que el Gemma original rechazaría. Según el autor, la divergencia KL respecto al modelo base es de aproximadamente 0,067 en el E4B, lo que sugiere que la distribución de salida para consultas normales se mantiene prácticamente idéntica.

El interés de esta ficha es doble: por un lado documenta un caso práctico de despliegue edge de un LLM en Android con LiteRT y cuantización INT4; por otro, ilustra las implicaciones técnicas y de licencia de distribuir variantes "uncensored" derivadas de la familia Gemma. La información disponible es la de la model card del autor; no hay benchmarks publicados ni documentación adicional sobre el proceso de conversión más allá de los parámetros indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, según modelos base; detalles no disponibles) |
| Parametros totales | No disponible (E2B: 2,3B activos; E4B: 4,5B activos) |
| Parametros activos | 2,3B (E2B) / 4,5B (E4B) |
| Longitud de contexto | 1024 tokens (cache_length configurado en la conversión) |
| Tipos de cuantizacion | INT4 dinámico en pesos, activaciones FP32 (`dynamic_wi4_afp32`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | `.litertlm` (LiteRT) |
| Tamano del repo | 13,4 GB |
| Tamano de ficheros | 2,4 GB (E2B) / 3,9 GB (E4B) |
| Herramienta de conversion | litert-torch 0.9.0 |
| Plataforma objetivo | Android 12+ (Google AI Edge Gallery) |

## Arquitectura y entrenamiento

Los modelos subyacentes pertenecen a la familia Gemma 4 de Google, con dos variantes de tamaño (E2B y E4B) identificadas por sus parámetros activos. La model card no detalla la arquitectura interna (número de capas, atención, posible uso de mezcla de expertos), el volumen de tokens de entrenamiento ni la composición del dataset. Tampoco se documentan fases de RLHF o DPO en los modelos fuente.

La innovación técnica documentada es la abliteración aplicada por DuoNeural: se identifica la dirección de rechazo mediante diferencia de medias entre activaciones dañinas e inofensivas, y se proyecta ortogonalmente fuera de las proyecciones Q/K/V/O y de las capas MLP. El autor reporta una divergencia KL de ~0,067 respecto al base en el E4B. La conversión a LiteRT se realizó con la receta `dynamic_wi4_afp32`, `cache_length=1024`, embedder externalizado y `split_cache=False`. No se especifica si los modelos base emplean decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto en inglés con inferencia totalmente offline en dispositivo.
- Razonamiento y conocimiento factual heredados del modelo Gemma 4 base (el autor afirma que la abliteración no altera inteligencia, razonamiento, código ni conocimiento factual).
- Respuestas a consultas que el modelo original rechazaría, al haberse eliminado los vectores de rechazo.
- Ejecución en backends GPU (Vulkan/OpenCL en Adreno/Mali), CPU (XNNPACK) y NPU (si el dispositivo la soporta).
- Integración con Google AI Edge Gallery para chat local.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Chat privado offline en Android: el modelo se carga en AI Edge Gallery y procesa conversaciones sin salir del dispositivo, adecuado para usuarios que no quieren enviar datos a servicios en la nube.
- Asistente personal en movilidad sin conectividad: útil en entornos sin red (campo, aviación, zonas rurales) donde se necesita generación de texto local con 2,4-3,9 GB de almacenamiento.
- Prototipado de aplicaciones edge: desarrolladores que quieran evaluar el rendimiento de Gemma 4 en hardware móvil antes de integrar LiteRT en sus propias apps.
- Investigación sobre alineación y abliteración: el paquete permite estudiar empíricamente el efecto de eliminar vectores de rechazo en un modelo desplegado, comparando respuestas con el base.
- Generación de texto creativo sin restricciones de contenido: escritura de ficción, guiones o material que el modelo original podría rechazar, siempre que el uso cumpla la licencia Gemma.
- Demostraciones educativas de cuantización INT4 en móvil: sirve para ilustrar el compromiso entre tamaño (2,4 GB vs 3,9 GB), velocidad (1-40 tok/s según hardware) y calidad en inferencia edge.
- Evaluación de backends NPU/GPU en dispositivos Snapdragon o MediaTek: el modelo permite medir throughput en distintas clases de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye únicamente estimaciones de throughput por clase de dispositivo:

| Clase de dispositivo | Backend | Tokens/s (estimado) |
|---|---|---|
| Gama alta (Snapdragon 8 Gen 3+) | NPU/GPU | 15–40 |
| Gama media | GPU | 5–15 |
| Cualquier Android 12+ | CPU | 1–5 |

## Requisitos de hardware

- Almacenamiento: 2,4 GB (E2B) o 3,9 GB (E4B) para el fichero `.litertlm`, más espacio para la app.
- Sistema operativo: Android 12 o superior.
- Aplicación: Google AI Edge Gallery instalada.
- Backends disponibles: GPU (Adreno/Mali vía Vulkan/OpenCL), CPU (XNNPACK) y NPU si el SoC la soporta (Snapdragon/MediaTek).
- VRAM/RAM: no se especifica; el modelo se ejecuta en memoria del dispositivo, por lo que se recomienda un terminal con al menos 6-8 GB de RAM para el E4B (dato no confirmado en la model card).
- No cabe en GPU de escritorio mediante este formato: `.litertlm` está orientado a LiteRT/Android, no a vLLM, llama.cpp, Ollama o TGI.
- Throughput estimado: 15-40 tok/s en gama alta con NPU/GPU, 5-15 tok/s en gama media con GPU, 1-5 tok/s en CPU.
- Instalación vía ADB (`adb push`) o descarga directa con Chrome en Android.

## Comparativa con modelos similares

| Modelo | Parametros activos | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Gemma-4-Abliterated-LiteRT (E2B/E4B) | 2,3B / 4,5B | 1024 | `.litertlm` | Gemma Terms of Use | Android (LiteRT) |
| DuoNeural/TurboGemma4E2B | 2,3B | no disponible | safetensors (presumible) | Gemma Terms of Use | Servidor/escritorio |
| DuoNeural/Gemma-4-E4B-Abliterated | 4,5B | no disponible | safetensors (presumible) | Gemma Terms of Use | Servidor/escritorio |
| Gemma 4 base (Google) | no disponible | no disponible | múltiples | Gemma Terms of Use | Múltiples |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero no garantiza corrección factual: el riesgo de alucinación persiste y puede aumentar en temas sensibles.
- Sesgos: no se documenta ningún análisis de sesgos; al derivar de Gemma 4, hereda los sesgos del modelo base, no evaluados en esta ficha.
- Contexto limitado a 1024 tokens por la configuración de conversión, insuficiente para conversaciones largas o documentos extensos.
- Solo inglés; no hay soporte multilingüe declarado.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y de redistribución; debe revisarse antes de integrar en productos.
- El modelo se distribuye sin benchmarks ni evaluación de calidad; el rendimiento real depende del dispositivo y del backend.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El contenido "uncensored" puede generar material dañino o ilegal según jurisdicción; el usuario asume la responsabilidad del uso.
- El formato `.litertlm` no es portable a otros runtimes (vLLM, llama.cpp, Ollama, TGI); queda ligado a LiteRT y Android.
- No se documenta el proceso de conversión más allá de los parámetros indicados, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spyurzad/Gemma-4-Abliterated-LiteRT
- Modelo base E2B: https://huggingface.co/DuoNeural/TurboGemma4E2B
- Modelo base E4B: https://huggingface.co/DuoNeural/Gemma-4-E4B-Abliterated
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- DuoNeural en Hugging Face: https://huggingface.co/DuoNeural
- Web de DuoNeural: https://duoneural.com
- GitHub de DuoNeural: https://github.com/DuoNeural
- X/Twitter: https://x.com/DuoNeural
- Newsletter: https://duoneural.beehiiv.com
- Publicación Nano-CTM: https://doi.org/10.5281/zenodo.19775622
- Publicación Recurrence as World Model: https://doi.org/10.5281/zenodo.19810620
- Publicación Per-Object Slot Decomposition: https://doi.org/10.5281/zenodo.19846804
- Publicación The Dynamical Horizon Principle: https://doi.org/10.5281/zenodo.19952612
