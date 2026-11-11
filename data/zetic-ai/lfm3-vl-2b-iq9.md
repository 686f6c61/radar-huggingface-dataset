# ZETIC-ai/LFM3-VL-2B-IQ9

## Resumen

LFM3-VL-2B-IQ9 es un paquete de despliegue del modelo vision-lenguaje LFM3-VL-2B de Liquid AI, adaptado por ZETIC-ai para ejecutarse en la NPU Hexagon del SoC Qualcomm Dragonwing IQ9 (QCS9075). No se trata de un modelo nuevo, sino de una conversión cuantizada del checkpoint original de Liquid AI (revisión `f83d2b0a2296aaa277f394990a9b8b949ddf9691`) con pesos del modelo de lenguaje cuantizados en bloques a 4 bits y un codificador visual en fp16. El paquete corre sobre Ixian Hexagon, el runtime propio de ZETIC para Hexagon, a través del ZeticMLange Hexagon SDK.

El modelo resuelve el problema de llevar un VLM de 2.000 millones de parámetros a inferencia totalmente local en hardware de borde con NPU dedicada, sin depender de GPU ni de servicios en la nube. Acepta texto, imágenes y vídeo (como fotogramas decodificados) y produce texto. Su contexto por defecto es de 2.048 posiciones, ampliable hasta 131.072 en el paquete `v73` (ambos NSP) y hasta 4.096 en `v73-1nsp` (un solo NSP).

Es relevante porque ejemplifica una tendencia concreta: la distribución de modelos open weights empaquetados para aceleradores específicos de borde, con artefactos verificables (SHA256SUMS, manifiestos) y una API C++ estable. La licencia LFM Open License v1.0 y la dependencia de un SDK propietario distribuido aparte son los principales condicionantes para su adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer) sobre LFM3-VL-2B; codificador visual + modelo de lenguaje cuantizado en bloques a 4 bits, codificador visual en fp16 |
| Parametros totales | 2B (según denominación del modelo base; no se detalla desglose en la información disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 2.048 por defecto; hasta 131.072 en `v73`; hasta 4.096 en `v73-1nsp` |
| Tipos de cuantizacion | Pesos del LM con cuantización en bloques a 4 bits (etiqueta IQ9); codificador visual en fp16 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (Liquid AI); el SDK se distribuye aparte con sus propias licencias |
| Formato de pesos | Paquete propietario para el runtime Ixian Hexagon: `manifest.json`, `SHA256SUMS`, tokenizer, configs y pesos (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es LFM3-VL-2B de Liquid AI, un VLM que combina un codificador visual con un modelo de lenguaje para responder preguntas sobre imágenes y vídeos cortos. ZETIC no reentrena el modelo: convierte el checkpoint upstream a un formato ejecutable en la NPU Hexagon, con pesos del LM cuantizados en bloques a 4 bits y el codificador visual mantenido en fp16. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica relevante no está en el modelo sino en el empaquetado: dos variantes de despliegue según el número de NSP utilizados. `v73` ocupa ambos NSP (3,10 GB, 19 ficheros) y es la opción por defecto; `v73-1nsp` usa un solo NSP (2,36 GB, 18 ficheros) y deja el otro libre para otras cargas. El SDK muestrea vídeo a 2 fps y exige imágenes y fotogramas de exactamente 512 x 512 RGB, sin reescalado interno: cualquier otro tamaño se rechaza con `Status::InvalidArgument`.

## Capacidades

- Generación de texto conversacional multi-turno mediante la API `LLM` y el CLI `zetic_lfm3_cli chat`.
- Respuesta a preguntas sobre imágenes (entrada RGB de 512 x 512 exactos; PNG, JPEG, PPM o BMP).
- Comprensión de vídeo a partir de fotogramas decodificados de 512 x 512, muestreados a 2 fps por el SDK.
- Procesamiento totalmente local en la NPU Hexagon del Dragonwing IQ9, sin conexión a servicios externos.
- API C++ (`zetic_llm.h`) con configuración de generación (`GenerationConfig`, temperatura, greedy), selección de target y control de contexto máximo.
- Verificación de integridad de los artefactos mediante `SHA256SUMS` y el comando `info --verify`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Inspección visual en línea de producción: el modelo responde preguntas sobre imágenes de 512 x 512 capturadas por cámaras industriales, ejecutándose en la NPU del propio dispositivo de borde sin enviar imágenes a la nube, lo que reduce latencia y cumple requisitos de privacidad.
- Asistencia visual en dispositivos portátiles o embebidos: integración en equipos con Dragonwing IQ9 para describir escenas o responder consultas del usuario en local, usando la variante `v73-1nsp` si el otro NSP está reservado para otra tarea.
- Análisis de vídeo de baja cadencia: clips muestreados a 2 fps para tareas de vigilancia ligera, verificación de presencia o resumen de secuencias cortas, con fotogramas preprocesados a 512 x 512.
- Control de calidad documental con imagen: verificación de formularios, etiquetas o paneles fotografiados, aprovechando la ventana de contexto ampliable a 131.072 posiciones en `v73` para conversaciones o lotes largos (con un coste de memoria de aproximadamente 0,4 GB adicionales a 32.768).
- Asistente de accesibilidad offline: descripción de imágenes para usuarios con discapacidad visual en dispositivos sin conectividad, con inferencia local y latencia acotada por el hardware.
- Prototipado de pipelines VLM en borde: validación de la cadena completa (preprocesado a 512 x 512, tokenizer, generación) antes de portar a otros aceleradores, usando el CLI y la API C++ como referencia de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una validación funcional: en `v73` (dos NSP) se comprobaron chat de texto, preguntas sobre imágenes con 5/5 respuestas correctas, un clip de vídeo y conversación multi-turno, entre el 31 de octubre y el 2 de noviembre de 2026, con la validación de release del SDK 0.1.0. La variante `v73-1nsp` no fue validada por separado.

## Requisitos de hardware

- Hardware objetivo exclusivo: Qualcomm Dragonwing IQ9 (QCS9075) con NPU Hexagon, sobre Qualcomm Linux (linux-arm64). No se contemplan otros aceleradores.
- Almacenamiento: 3,10 GB para `v73` (dos NSP) o 2,36 GB para `v73-1nsp` (un NSP); 5,47 GB si se descargan ambos paquetes.
- Memoria: el contexto por defecto de 2.048 posiciones puede ampliarse; a 32.768 posiciones el consumo aumenta aproximadamente 0,4 GB.
- GPU: no aplica. El modelo no está pensado para A100, H100 ni RTX 4090, y no se distribuyen pesos en formatos ejecutables en GPU de consumo.
- Opciones de despliegue: únicamente el ZeticMLange Hexagon SDK para el Dragonwing IQ9 (biblioteca, cabeceras, herramientas CLI y librería DSP Hexagon), distribuido en GitHub aparte del repositorio de pesos. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZETIC-ai/LFM3-VL-2B-IQ9 | 2B | 2.048 por defecto; hasta 131.072 (`v73`) | Paquete propietario para NPU Hexagon del QCS9075 | LFM Open License v1.0 | Pesos en Hugging Face; SDK aparte en GitHub |
| LiquidAI/LFM3-VL-2B | 2B | No disponible en la información proporcionada | Pesos upstream (checkpoint original) | LFM Open License v1.0 | Hugging Face |
| Otros VLM de ~2B para borde | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con alternativas de la misma categoría (VLM de aproximadamente 2.000 millones de parámetros para inferencia en borde) no está disponible en la información proporcionada. El único contraste documentado es con el checkpoint upstream de Liquid AI, del que este paquete es una conversión cuantizada y empaquetada.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en el Dragonwing IQ9 (QCS9075) con el runtime Ixian Hexagon y el SDK de ZETIC; no es portable a GPU ni a CPU convencional.
- Restricción estricta de entrada visual: imágenes y fotogramas deben ser exactamente 512 x 512 RGB; el SDK no reescala, por lo que el preprocesado corre por cuenta del integrador.
- Contexto por defecto corto (2.048 posiciones); ampliarlo consume memoria adicional y, en `v73-1nsp`, el máximo es de 4.096.
- La variante `v73-1nsp` no fue validada por separado en un solo NSP, según la propia model card.
- Licencia LFM Open License v1.0: es necesario leer el texto completo antes de uso comercial o redistribución; el SDK tiene licencias separadas que también deben revisarse.
- Los pesos distribuidos son un derivado convertido, no el checkpoint original; el comportamiento puede diferir del modelo upstream.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe sin verificación.
- Repositorio sin descargas ni likes en el momento de la consulta, y creado en noviembre de 2026: ecosistema muy reciente y con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZETIC-ai/LFM3-VL-2B-IQ9
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Revisión upstream concreta: https://huggingface.co/LiquidAI/LFM3-VL-2B/tree/f83d2b0a2296aaa277f394990a9b8b949ddf9691
- SDK ZeticMLange Hexagon para Dragonwing IQ9: https://github.com/zetic-ai/IxianHexagon
- Licencia LFM Open License v1.0: https://huggingface.co/ZETIC-ai/LFM3-VL-2B-IQ9/blob/main/LICENSE
