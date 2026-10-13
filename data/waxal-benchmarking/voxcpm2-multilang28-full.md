# waxal-benchmarking/voxcpm2-multilang28-full

## Resumen

VoxCPM2 (identificador `waxal-benchmarking/voxcpm2-multilang28-full`) es una distribución del modelo de síntesis de voz VoxCPM 2 desarrollado por OpenBMB: un sistema TTS sin tokenizador de 2.290.065.984 parámetros (2,29B) entrenado sobre 2,36 millones de horas de audio multilingüe según la documentación oficial del proyecto. El repositorio analizado lo publica la cuenta `waxal-benchmarking`, contiene pesos en formato safetensors y ocupa 1.127,1 GB, lo que sugiere un conjunto con múltiples checkpoints o artefactos derivados más que un único fichero de pesos.

El modelo aborda la generación de habla operando íntegramente en el espacio latente de AudioVAE V2, mediante un pipeline de cuatro etapas (LocEnc → TSLM → RALM → LocDiT) que produce audio nativo a 48 kHz. Sus capacidades declaradas incluyen diseño de voz a partir de prompts en lenguaje natural, clonación controlable y control de estilo, además de cobertura multilingüe amplia (30 idiomas y 9 dialectos chinos según la web del proyecto, aunque el nombre del repositorio apunta a 28 idiomas).

Su relevancia actual radica en que acerca la calidad y el control de un TTS de escala 2B al ecosistema abierto, con salida a 48 kHz nativa. No obstante, esta copia concreta presenta señales de cautela para producción: no declara licencia, no declara idiomas ni pipeline en la ficha de HuggingFace, acumula 27 descargas y 0 likes, y su tamaño de repositorio (1,1 TB) complica el despliegue directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cuatro etapas (LocEnc → TSLM → RALM → LocDiT) sobre el espacio latente de AudioVAE V2; TTS sin tokenizador |
| Parametros totales | 2.290.065.984 (2,29B) |
| Parametros activos | No aplica / no disponible (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de síntesis de voz; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | La ficha de HuggingFace no los declara; la web del proyecto indica 30 idiomas y 9 dialectos chinos; el identificador del repositorio sugiere 28 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1.127,1 GB |
| Frecuencia de muestreo de salida | 48 kHz nativos (según documentación del proyecto) |
| Datos de entrenamiento | 2,36 millones de horas de audio multilingüe (según documentación del proyecto) |

## Arquitectura y entrenamiento

VoxCPM2 no es un transformer autoregresivo convencional de texto: es un sistema de síntesis de voz sin tokenizador que trabaja directamente en el espacio latente de un códec de audio (AudioVAE V2). La generación se organiza en cuatro etapas encadenadas —LocEnc, TSLM, RALM y LocDiT— que transforman la entrada (texto y, en su caso, referencia de voz o prompt de estilo) en representaciones latentes y, finalmente, en audio a 48 kHz. El enfoque «tokenizer-free» evita la discretización intermedia típica de los TTS basados en códecs de tokens discretos, lo que según el proyecto favorece la expresividad y la fidelidad de la clonación.

En cuanto a entrenamiento, la documentación oficial indica 2,36 millones de horas de datos multilingües, un salto de escala respecto a la serie 1.x, que se traduce en mayor capacidad, calidad y controlabilidad. La información disponible no detalla la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron etapas de RLHF, DPO u optimización por preferencias; tampoco se documentan innovaciones como decodificación especulativa o atención lineal en esta ficha. Las versiones 2.x incorporan de forma explícita diseño de voz y control de estilo como funcionalidades de primera clase.

## Capacidades

- Síntesis de voz multilingüe: generación de habla en 30 idiomas y 9 dialectos chinos según la web del proyecto (28 idiomas según el identificador de este repositorio).
- Salida de audio nativa a 48 kHz, sin necesidad de upsampling posterior.
- Diseño de voz (voice design): creación de voces nuevas a partir de descripciones en lenguaje natural.
- Clonación de voz controlable a partir de muestras de referencia, con grados de fidelidad variables según la documentación.
- Control de estilo: ajuste de atributos expresivos y de estilo del habla mediante instrucciones.
- Generación sin tokenizador en el espacio latente de AudioVAE V2, orientada a preservar matices prosódicos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje de propósito general, sino un modelo de audio.
- No se documentan capacidades de visión, audio de entrada o comprensión multimodal en la información disponible.

## Casos de uso

- Audiolibros y contenido editorial: generación de narración en varios idiomas con voces diseñadas por prompt, aprovechando la salida a 48 kHz para distribución comercial de audio de alta calidad.
- Doblaje y localización de vídeo: clonación de la voz del actor original y re-síntesis en otro idioma, manteniendo el timbre mediante la referencia de voz, con revisión humana obligatoria por posibles inestabilidades en entradas largas.
- Asistentes de voz y agentes conversacionales: capa de TTS de baja latencia integrada junto a un LLM que gestione el diálogo; el control de estilo permite adaptar el tono (formal, cercano, informativo) según el contexto.
- Accesibilidad: conversión de documentos, artículos o interfaces a audio para personas con discapacidad visual, con voces configurables por el usuario.
- Videojuegos y contenidos interactivos: generación dinámica de líneas de diálogo para NPC con voces diferenciadas por personaje, evitando grabar cada variante de guion.
- Sistemas de atención telefónica (IVR): mensajes y respuestas habladas personalizadas por marca, aprovechando el diseño de voz para mantener una identidad sonora coherente.
- Producción de pódcast y contenido sintético: generación de episodios completos con múltiples locutores sintéticos y control de estilo por sección.
- Prototipado de producto de voz: evaluación rápida de voces candidatas antes de contratar locución humana, usando clonación y diseño de voz como herramienta de maquetación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: con 2,29B parámetros, el almacenamiento necesario es de aproximadamente 9,2 GB en fp32, 4,6 GB en bf16/fp16, 2,3 GB en int8 y 1,2 GB en int4 (estimaciones derivadas del recuento de parámetros; el repositorio publica safetensors, presumiblemente en precisión completa o media).
- VRAM de inferencia: se estima en torno a 6-8 GB en bf16/fp16 sumando pesos y memoria de activaciones del decodificador de audio; en int8 podría bajar a 3-4 GB. Son estimaciones, no cifras publicadas por el proyecto.
- GPU recomendadas: para desarrollo y uso individual, RTX 3060 12 GB, RTX 4070/4080 y RTX 4090; para servicio en producción con concurrencia, A100 40/80 GB, H100 o L40S.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-12 GB de VRAM en bf16/fp16 y en tarjetas de 4-6 GB con cuantización a int8/int4, siempre según estimaciones y no según requisitos oficiales.
- Almacenamiento: descargar el repositorio completo implica 1.127,1 GB; conviene seleccionar únicamente los ficheros de pesos necesarios mediante descarga parcial.
- Opciones de despliegue: no disponible en la información proporcionada. Al tratarse de un modelo de audio con pipeline propio (AudioVAE V2 + LocEnc/TSLM/RALM/LocDiT), requiere el código de inferencia del proyecto VoxCPM; no se documentan versiones GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponible. El proyecto declara salida a 48 kHz, pero no se han encontrado cifras de RTF, latencia de primera muestra ni rendimiento por GPU.
- Caveat de despliegue: el repositorio analizado no declara licencia ni pipeline, por lo que la viabilidad comercial debe verificarse antes de integrarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2 (`waxal-benchmarking/voxcpm2-multilang28-full`) | 2,29B | 30 idiomas y 9 dialectos chinos según la web del proyecto; 28 según el identificador del repo | 48 kHz nativos | No disponible en este repositorio | HuggingFace, safetensors |
| VoxCPM2 (`openbmb/VoxCPM2`, repositorio oficial) | 2,29B (mismo modelo base) | Según documentación oficial | 48 kHz nativos | No disponible en la información proporcionada | HuggingFace |
| XTTS-v2 (Coqui) | No disponible en la información proporcionada | Multilingüe | No disponible | No disponible | HuggingFace |
| CosyVoice 2 (Alibaba) | No disponible en la información proporcionada | Multilingüe (chino, inglés y otros) | No disponible | No disponible | HuggingFace |
| OpenAudio / Fish Speech | No disponible en la información proporcionada | Multilingüe | No disponible | No disponible | HuggingFace |

Los datos de parámetros, licencia y especificaciones de los modelos alternativos no se han proporcionado en la búsqueda realizada, por lo que se marcan como «no disponible» en lugar de estimarse. El rasgo diferencial documentado de VoxCPM2 frente a la generación anterior de TTS abiertos es la combinación de escala 2B, pipeline sin tokenizador sobre latentes de AudioVAE V2 y salida nativa a 48 kHz.

## Limitaciones y advertencias

- Licencia no declarada: la ficha de `waxal-benchmarking/voxcpm2-multilang28-full` no especifica licencia, por lo que no puede asumirse uso comercial libre. Es imprescindible verificar la licencia del repositorio oficial de OpenBMB antes de cualquier despliegue productivo.
- Repositorio de terceros: los pesos los publica la cuenta `waxal-benchmarking`, no OpenBMB; conviene contrastar que los ficheros son idénticos a los del repositorio oficial antes de usarlos.
- Inestabilidad documentada: la documentación oficial de VoxCPM 2.0 advierte de que el modelo puede mostrar inestabilidad ocasional, especialmente con entradas muy largas o muy expresivas.
- Control de voz variable: aunque el diseño de voz y el control de estilo son funcionalidades de primera clase, la propia documentación señala que los resultados «pueden variar».
- Idiomas: existe discrepancia entre el nombre del repositorio (28 idiomas) y la web del proyecto (30 idiomas y 9 dialectos chinos). La ficha de HuggingFace no declara ningún idioma, así que la cobertura real debe validarse empíricamente.
- Riesgo de uso indebido en clonación: un sistema de clonación de voz con salida a 48 kHz puede emplearse para suplantación; requiere consentimiento explícito y mecanismos de verificación si se expone a usuarios finales.
- Coste de almacenamiento y despliegue: 1.127,1 GB de repositorio complican el aprovisionamiento; es recomendable descargar solo los ficheros necesarios.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni métricas de calidad de audio (MOS, WER, similitud de hablante) en la información disponible, por lo que la evaluación comparativa debe hacerse de forma interna.
- Sin soporte documentado de integraciones: no se confirman versiones GGUF, ni compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita las opciones de escalado estándar.
- No es un modelo de lenguaje: no debe esperarse razonamiento, tool calling ni generación de texto; su uso es exclusivamente de síntesis de voz.
- Fecha de publicación anómala: la ficha indica creación el 2026-10-12, dato que conviene verificar antes de citarlo.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/waxal-benchmarking/voxcpm2-multilang28-full
- Repositorio oficial del modelo en HuggingFace (OpenBMB): https://huggingface.co/openbmb/VoxCPM2
- Documentación oficial de VoxCPM 2: https://voxcpm.readthedocs.io/en/latest/models/voxcpm2.html
- Documentación general de VoxCPM 2.0: https://voxcpm.readthedocs.io/en/latest/
- Repositorio GitHub del proyecto (waydame/voxcpm): https://github.com/waydame/voxcpm
- Sitio web del proyecto VoxCPM2: https://voxcpm.space/
