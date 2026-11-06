# TechnoBaptist/maya2-native

## Resumen

Maya 2 Native es un modelo de síntesis de voz (text-to-speech) desarrollado por Maya Research, diseñado específicamente para generar habla en streaming en 11 lenguas índicas y en inglés. Se construye sobre el modelo de lenguaje Qwen3-1.7B-Base como backbone y emplea el códec de audio Mimi, alcanzando 2.500 millones de parámetros totales y produciendo audio mono a 24 kHz en tramas de 80 ms. Su propuesta diferencial es cubrir un conjunto de lenguas de la India habitualmente desatendidas por los TTS comerciales, con pesos abiertos y licencia Apache-2.0.

El modelo incorpora 20 voces integradas y clonación de voz zero-shot a partir de 3-10 segundos de audio de referencia, incluyendo clonación cruzada entre idiomas (una referencia en hindi puede generar habla en tamil). La release incluye pesos e código de inferencia, con API en Python, endpoint de voz compatible con OpenAI y streaming por WebSocket, además de batching continuo y CUDA graphs para generación concurrente.

Es relevante ahora porque combina tres elementos poco frecuentes en un mismo paquete: cobertura multilingüe índica amplia, clonación de voz y despliegue autoalojado con licencia permisiva. El checkpoint 1.0 se publicó el 25 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS construido sobre Qwen3-1.7B-Base como backbone y códec Mimi para audio) |
| Parametros totales | 2.502.398.656 (2,50B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16, ~5,0 GB) |
| Idiomas soportados | asamés (as), bengalí (bn), inglés (en), gujarati (gu), hindi (hi), kannada (kn), malayalam (ml), marathi (mr), odia (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache-2.0 (ver licencias de componentes) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Maya 2 Native se presenta como un sistema de TTS en streaming que combina un modelo de lenguaje base (Qwen3-1.7B-Base) con el códec de audio Mimi, que actúa como representación discreta del audio generado. El resultado son 2,50B parámetros únicos y aproximadamente 5,0 GB de pesos en BF16. La salida es audio mono a 24 kHz, emitido en tramas de 80 ms, lo que habilita la reproducción incremental mientras el modelo sigue generando.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens de audio o texto utilizados, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se especifican innovaciones de decodificación más allá del streaming por tramas y el soporte de batching continuo con CUDA graphs para generación concurrente. El paquete, la clase Python y el fichero de configuración conservan los identificadores `maya3`, `Maya3TTS` y `maya3_config.json` por compatibilidad con la versión anterior.

## Capacidades

- Generación de voz en 12 idiomas: asamés, bengalí, inglés, gujarati, hindi, kannada, malayalam, marathi, odia, panyabí, tamil y telugu.
- Streaming de audio en tramas de 80 ms, apto para agentes de voz conversacionales con baja latencia percibida.
- 20 voces integradas con nombres propios (Ritvik, Nakul, Jahnavi, Siddhant, Vaidehi, Satvik, Anirban, Charvi, entre otras).
- Clonación de voz zero-shot a partir de 3-10 segundos de audio de referencia.
- Clonación cruzada entre idiomas: una referencia en un idioma puede generar habla en otro.
- Normalización de texto configurable (activada en los ejemplos de la model card).
- Decodificación con muestreo (sampled decoding) soportada.
- Interfaces de despliegue: API Python, endpoint de voz compatible con OpenAI y streaming por WebSocket.
- Batching continuo y CUDA graphs para servir múltiples peticiones concurrentes.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni procesamiento de visión o audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Agentes de voz para atención al cliente en lenguas índicas: el streaming en tramas de 80 ms permite que el agente empiece a responder antes de completar la frase, reduciendo la latencia percibida en conversaciones multi-turno en hindi, tamil o bengalí.
- Lectura de notificaciones y avisos transaccionales: los ejemplos de la model card (recordatorios de EMI, confirmaciones de reembolso, estados de pago) muestran un ajuste claro a la lectura de cifras, fechas e importes con normalización de texto activada.
- Interfaces de voz multilingües autoalojadas: con licencia Apache-2.0 y endpoint compatible con OpenAI, un equipo puede desplegar un servicio de TTS propio sin depender de APIs externas ni ceder audio de usuarios a terceros.
- Audiolibros y contenido narrado en lenguas regionales: las 20 voces integradas y la clonación zero-shot permiten mantener una voz consistente a lo largo de un catálogo y reutilizarla en distintos idiomas.
- Localización de vídeo y formación corporativa: la clonación cruzada permite que un mismo locutor de referencia hable en varias lenguas índicas, simplificando la producción de material formativo multilingüe.
- Accesibilidad y lectura de pantalla: la generación en streaming encaja en lectores de pantalla y asistentes que deben vocalizar texto de forma incremental mientras el usuario navega.
- Prototipado de asistentes conversacionales: el batching continuo y las CUDA graphs permiten servir varias sesiones concurrentes en una sola GPU durante fases de prueba.

## Benchmarks y rendimiento

La model card menciona una evaluación con tres jueces ASR y una métrica de character error rate (CER), e indica que los doce clips de muestra se seleccionaron entre salidas con CER inferior al 2% bajo los tres jueces. Sin embargo, no se publican en la información disponible las tablas numéricas completas del benchmark ni comparaciones cifradas con otros modelos.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 5,0 GB, por lo que se necesita algo más de 5 GB de VRAM solo para los pesos; el total dependerá del backend, del tamaño de lote y de las estructuras de decodificación y del códec Mimi.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo encaja en GPUs de consumo con 8 GB o más de VRAM en BF16, y con holgura en A100, H100 o RTX 4090 para servir con batching continuo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en BF16; no se confirman requisitos exactos ni rendimiento en GPUs concretas.
- Opciones de despliegue: paquete `maya3` con API Python, endpoint de voz compatible con OpenAI, streaming por WebSocket, batching continuo y CUDA graphs. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se emite audio en tramas de 80 ms, lo que marca la granularidad del streaming; no se publican cifras de latencia extremo a extremo ni de throughput por GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de TTS multilingüe índico, por lo que no es posible establecer una comparación cifrada.

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| Maya 2 Native | 2,50B | 12 (11 índicas + inglés) | Sí, zero-shot 3-10 s, cruzada entre idiomas | Apache-2.0 | CER cualitativo, sin tablas públicas |
| Alternativas de TTS multilingüe | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos por idioma, género o variedad dialectal; la cobertura de 11 lenguas índicas no garantiza calidad homogénea entre ellas.
- Riesgo de alucinación y de errores de pronunciación en textos con cifras, fechas, siglas o nombres propios; la propia model card recomienda normalización de texto y sus ejemplos la activan.
- Los clips de muestra se seleccionaron con CER inferior al 2% bajo tres jueces ASR, lo que no representa el rendimiento medio ni los casos difíciles; no deben tomarse como referencia de calidad global.
- No se especifica la longitud máxima de texto de entrada ni el contexto del backbone, lo que limita la planificación de cargas con textos largos.
- La clonación de voz plantea riesgos de suplantación y uso fraudulento; la licencia Apache-2.0 no impone restricciones de uso, por lo que la responsabilidad de consentimiento y trazabilidad recae en el desplegador.
- La licencia Apache-2.0 aplica al modelo, pero la model card remite a las licencias de los componentes (backbone Qwen3 y códec Mimi) que deben verificarse por separado antes de un uso comercial.
- El modelo se publica con 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de la comunidad.
- No se documentan requisitos exactos de VRAM, latencia ni throughput, lo que obliga a realizar pruebas propias antes de dimensionar producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/maya2-native
- Repositorio de código: https://github.com/MayaResearch/maya2-native
- Vídeo de demostración: https://huggingface.co/maya-research/maya2-native/resolve/main/Maya%20Final%20with%20Changes.mp4
- Vídeo alternativo en Google Drive: https://drive.google.com/file/d/1WRd_e8TztpvX1n-DbOBlDj-zP89WE4oX/view
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
