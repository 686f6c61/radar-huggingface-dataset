# xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_frac50_s42_20260913_114937

## Resumen

AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_frac50_s42_20260913_114937 es un adaptador LoRA publicado por el usuario xelsoft-ai-lab sobre el modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-0.6B-Base. Su propósito es la generación de voz en wolof con control de acento regional: la model card declara tres acentos soportados (baol, dakar y fouta) y un canal de acento implementado mediante `token`. El repositorio pesa 0,7 GB y se distribuye en formato safetensors bajo la librería PEFT.

El interés de la ficha es acotado y conviene ser explícito: se trata de un adaptador de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados en los metadatos de la plataforma, sin benchmarks publicados y sin métricas subjetivas (MOS) ni de error (WER). No es un modelo autónomo: requiere descargar el modelo base de 0,6B para poder ejecutarse.

La relevancia potencial del proyecto es lingüística más que técnica: el wolof es una lengua níger-congolesa hablada por varios millones de personas en Senegal, Gambia y Mauritania, y la disponibilidad de voces TTS con variación dialectal es escasa. Un adaptador LoRA de rango 16 permite intercambiar variantes de acento sin recargar ni duplicar el modelo base completo, lo que abarata el despliegue de múltiples voces en un mismo servidor. No obstante, la ausencia de licencia y de validación externa impide recomendar su uso en producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-TTS-12Hz-0.6B-Base. Arquitectura interna del modelo base: no disponible |
| Parámetros totales | 0,6B en el modelo base (según la nomenclatura del repositorio); parámetros del adaptador LoRA: no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de síntesis de voz; el contexto relevante es la longitud de texto de entrada y de audio de salida) |
| Tipos de cuantización | no disponible. Los pesos se publican en safetensors en su precisión original; no se documentan variantes GGUF, int8 ni int4 |
| Idiomas soportados | wolof (según las etiquetas del repositorio). Resto de idiomas: no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-Base |
| Tipo de adaptador | LoRA, rango 16 (`lora-r16`), fracción de datos 50% (`frac50`), semilla 42 (`s42`) |
| Tasa de tokens de audio | 12 Hz (según la nomenclatura del modelo base) |
| Acentos soportados | baol, dakar, fouta |
| Canal de acento | `token` (el acento se controla mediante tokens de la secuencia) |
| Tamaño del repositorio | 0,7 GB |
| Librería declarada | peft |
| Fecha de creación | 2026-09-13 |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el modelo Qwen3-TTS-12Hz-0.6B-Base, con una fracción de datos del 50% (`frac50`) y semilla 42. El número de módulos de atención o proyección a los que se aplica el adaptador (target modules), el número exacto de parámetros entrenables, el optimizador, la tasa de aprendizaje y el número de pasos no están publicados en la model card. Tampoco se especifica si hubo ajuste por preferencias (RLHF, DPO) ni ninguna otra etapa de alineamiento.

El modelo base pertenece a la familia Qwen3-TTS y su nomenclatura indica dos características relevantes: un tamaño de 0,6B de parámetros y una tasa de tokens de audio de 12 Hz, es decir, una representación discreta de audio de muy baja cadencia (del orden de una docena de tokens por segundo de audio). Ese diseño reduce el coste de generación frente a codecs de mayor frecuencia, a cambio de una menor resolución temporal de la señal. El control de acento se realiza a través de un canal basado en tokens, lo que implica que el adaptador aprende a asociar un identificador de acento con el estilo prosódico correspondiente (baol, dakar o fouta) sin necesidad de un codificador de hablante separado.

No se ha publicado información sobre el corpus de entrenamiento: ni horas de audio, ni número de hablantes, ni procedencia de los datos, ni proporción por acento. Esto limita seriamente cualquier afirmación sobre cobertura dialectal, equilibrio de la muestra o sesgos. El sufijo `frac50` sugiere además que el adaptador se entrenó con la mitad de la fracción de datos prevista en el protocolo del autor, lo que puede traducirse en un ajuste incompleto respecto a una ejecución con la fracción completa.

## Capacidades

- Síntesis de voz (text-to-speech) en wolof a partir de texto de entrada.
- Control de acento regional entre tres variantes declaradas: baol, dakar y fouta.
- Selección de acento mediante un canal de tokens, lo que permite fijar la variante en tiempo de inferencia sin reentrenar.
- Sustitución modular de voces: al ser un adaptador PEFT, varias variantes de acento pueden convivir sobre un mismo modelo base cargado en memoria.
- Capacidad multilingüe: no disponible. Solo se declara wolof; no hay evidencia de transferencia a francés, árabe hassaniya u otras lenguas de contacto habituales en Senegal.
- Tool calling / function calling: no aplica ni está documentado en un modelo de síntesis de voz.
- Razonamiento multi-paso y uso como agente: no aplica.
- Capacidades de visión o audio de entrada: no disponible.
- Modo "thinking": no disponible.
- Clonación de voz a partir de muestra del hablante: no documentada.

## Casos de uso

- Locución de contenidos informativos y radio comunitaria en wolof: el adaptador permite generar boletines de actualidad en las tres variantes de acento, de modo que una emisora regional pueda emitir con la prosodia local dominante en su área de cobertura sin contratar un hablante distinto por dialecto.
- Audiolibros y material educativo: con una tasa de tokens de 12 Hz, el coste de generación y almacenamiento de audio es bajo, lo que facilita producir volúmenes largos de texto narrado para programas de alfabetización en wolof.
- Doblaje y localización de vídeo: el control de acento por token permite escoger deliberadamente la variante (baol, dakar o fouta) en función del personaje o del público objetivo, manteniendo una única infraestructura de inferencia.
- Sistemas de respuesta de voz interactiva (IVR) y atención telefónica: un servicio de atención en Senegal podría sintetizar respuestas en la variante del cliente, siempre que se resuelva previamente la licencia y se mida la latencia del sistema completo.
- Accesibilidad para personas con discapacidad visual o baja alfabetización: conversión de texto escrito (prensa, administración, sanidad) a voz en la lengua materna del usuario, un escenario donde el acento cercano mejora la comprensión frente a voces de otras lenguas.
- Generación de datos sintéticos para entrenar sistemas ASR en wolof: un TTS con tres acentos permite aumentar la variabilidad acústica de corpus de entrenamiento, útil porque los datos reales de habla wolof son escasos y están desequilibrados por dialecto.
- Preservación y documentación dialectal: la posibilidad de fijar un acento concreto facilita producir material de referencia etiquetado por variante para proyectos de documentación lingüística.
- Prototipado rápido de productos de voz en e-learning: al ser un adaptador LoRA, un equipo puede integrarlo sobre el modelo base ya desplegado y cambiar de variante sin volver a servir un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

En concreto, no hay datos de MOS (Mean Opinion Score), CMOS, WER del texto de entrada, tasa de error de pronunciación, similitud de hablante ni comparativas objetivas frente a otros sistemas TTS en wolof. Tampoco se documentan métricas de latencia ni de tiempo real factor (RTF). El repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa publicada que permita contrastar la calidad declarada.

## Requisitos de hardware

- Estimación de VRAM para el modelo base de 0,6B: aproximadamente 1,2 GB de pesos en fp16, y del orden de 2 a 3 GB de VRAM contando activaciones y el búfer del decodificador de audio. En int8 bajaría a unos 0,6-0,7 GB y en int4 a unos 0,35-0,4 GB, aunque no se distribuyen pesos cuantizados de este adaptador.
- El adaptador LoRA ocupa una fracción pequeña del repositorio de 0,7 GB; el tamaño exacto de los pesos del adaptador no está publicado.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y RTX 4090. También en iGPU con memoria unificada suficiente, con latencias mayores.
- Inferencia en CPU: viable en principio por el reducido tamaño del modelo base, aunque no hay ninguna medición publicada de latencia ni de throughput.
- Opciones de despliegue: la librería declarada es PEFT, por lo que el camino estándar es transformers + peft cargando el modelo base y aplicando el adaptador. Soporte específico en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible. Dependerán del códec de audio asociado al modelo base, de la tasa de 12 Hz y del hardware, pero no se han publicado cifras.
- Nota de despliegue: al tratarse de un adaptador, la VRAM total es la del modelo base más el adaptador; servir tres acentos simultáneos sobre una misma instancia es viable en memoria, siempre que el canal de acento se controle por petición.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos directamente comparables con métricas verificables. La tabla siguiente recoge el modelo base y dos familias de referencia del ecosistema TTS de código abierto; los datos de esas dos filas provienen de conocimiento general del sector y no han podido verificarse en la búsqueda realizada, por lo que deben tratarse como orientativos.

| Modelo | Parámetros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (AfriVoxAccent QW3 LoRA r16) | Adaptador LoRA sobre base de 0,6B; parámetros del adaptador no disponibles | wolof, 3 acentos (baol, dakar, fouta) | no disponible | 0 descargas, 0 likes |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | no disponible | público en HuggingFace |
| Coqui XTTS-v2 (referencia externa, no verificada) | del orden de 0,5B | multilingüe (decenas de idiomas) | licencia de modelo no comercial | público |
| Meta MMS-TTS / VITS (referencia externa, no verificada) | decenas de millones de parámetros | cobertura de más de mil idiomas; presencia de wolof no confirmada | CC-BY-NC 4.0 | público |

Diferencias estructurales relevantes: este adaptador no es un sistema TTS completo, sino una especialización de bajo rango sobre un modelo base que hay que descargar aparte; su ventaja es el control explícito de acento y su bajo coste de almacenamiento por variante. Su desventaja frente a las alternativas citadas es la ausencia total de métricas publicadas y de licencia definida.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse que el uso comercial esté permitido. Además, se debe respetar por separado la licencia del modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base, que tampoco se detalla en la información proporcionada.
- Sin benchmarks ni métricas subjetivas: no hay MOS, CMOS ni evaluaciones de inteligibilidad que respalden la calidad de la síntesis en ninguno de los tres acentos.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el repositorio no ha sido contrastado por terceros.
- El adaptador no es autónomo: requiere el modelo base de 0,6B y la librería PEFT para funcionar. Un error frecuente es intentar cargarlo como modelo independiente.
- Cobertura lingüística muy estrecha: solo se declara wolof. No hay datos sobre el comportamiento con préstamos del francés, del árabe o con nombres propios, siglas y cifras, que suelen degradar la pronunciación en sistemas TTS de baja cobertura.
- Corpus de entrenamiento desconocido: se ignoran el número de hablantes, las horas de audio y la distribución por acento. Esto impide evaluar sesgos de edad, género o procedencia geográfica, y hace plausible que uno de los tres acentos esté peor representado que los otros.
- El sufijo `frac50` indica entrenamiento con el 50% de la fracción de datos prevista, lo que sugiere un ajuste parcial y un rendimiento potencialmente inferior al de una ejecución completa.
- Riesgo de artefactos de audio: en modelos TTS de este tipo son habituales las repeticiones, los cortes, el ruido de fondo y las prosodias anómalas en textos largos o fuera de dominio. No hay datos publicados de robustez.
- Reproducibilidad limitada: aunque se indican semilla (42), rango (16) y fracción de datos (50%), el dataset no se publica, por lo que el entrenamiento no es reproducible de forma exacta.
- Metadatos incompletos en la plataforma: el campo de idiomas aparece como "no disponible" y la model card está redactada en francés, lo que dificulta el filtrado automático y la trazabilidad del proyecto.
- Fecha de creación registrada como 2026-09-13; conviene verificar la coherencia temporal de los metadatos antes de citar el modelo.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_frac50_s42_20260913_114937
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Paper del modelo base: no disponible
- Blog o documentación técnica del adaptador: no disponible
- Repositorio de código o demo: no disponible
- Dataset de entrenamiento: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron exclusivamente páginas del complejo turístico Tropical Islands (tropical-islands.de, holidaycheck.de, booking.com, tui.com), sin relación alguna con este adaptador ni con síntesis de voz en wolof.
