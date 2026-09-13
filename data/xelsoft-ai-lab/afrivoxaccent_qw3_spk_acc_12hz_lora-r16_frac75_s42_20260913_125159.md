# xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_frac75_s42_20260913_125159

## Resumen

AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_frac75_s42_20260913_125159 es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-TTS-12Hz-0.6B-Base` para síntesis de voz (text-to-speech) en wolof con variación de acento. Lo publica la organización `xelsoft-ai-lab` dentro de la iniciativa AfriVoxAccent, orientada a cubrir lenguas y variantes africanas con recursos limitados. El adaptador no es un modelo completo: requiere descargar el checkpoint base de Qwen3-TTS y cargar encima los pesos LoRA.

El interés técnico del artefacto está en dos ejes. Primero, el wolof es una lengua de bajos recursos (aproximadamente 10-12 millones de hablantes, principalmente en Senegal y Gambia) con escasa representación en sistemas TTS comerciales. Segundo, el modelo incorpora un canal explícito de control de acento mediante tokens, con tres variantes etiquetadas en la model card: `baol`, `dakar` y `fouta`. Esto permite generar la misma frase con realizaciones dialectales distintas, algo poco habitual en adaptadores TTS de código abierto.

El modelo se publicó el 13 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 «likes», por lo que no existe validación comunitaria ni resultados de evaluación publicados. La model card original está en francés y es extremadamente breve: se limita a indicar el modelo base, el tipo de adaptador y la lista de acentos. No documenta dataset, hiperparámetros completos, licencia ni idiomas soportados en los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer autorregresivo de TTS; arquitectura interna del modelo base no documentada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base declara 0,6B en su identificador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, presumiblemente fp32 o bf16) |
| Idiomas soportados | Wolof (segun la model card del autor); metadatos de HuggingFace los marcan como no disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | `peft` |
| Modelo base | `Qwen/Qwen3-TTS-12Hz-0.6B-Base` |
| Tamano del repositorio | 0,7 GB |
| Modalidad | Text-to-speech |
| Acentos soportados | baol, dakar, fouta |
| Canal de acento | `token` (segun la model card) |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La model card indica `library_name: peft` y un `base_model` explícito (`Qwen/Qwen3-TTS-12Hz-0.6B-Base`), de modo que la arquitectura efectiva es la del base más las matrices de bajo rango inyectadas. El identificador del repositorio codifica varios hiperparámetros: `lora-r16` (rango 16), `frac75` (probablemente fracción del dataset o de capas entrenadas, no aclarado), `s42` (semilla 42), `12hz` (tasa de tokens de audio del base) y `spk_acc` (probablemente *speaker* y *accent*). Estos valores se deducen del nombre y no están confirmados por documentación del autor.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, la duración total de audio, el hablante o hablantes utilizados, ni sobre si hubo etapas de ajuste fino supervisado, RLHF o DPO. Tampoco se documenta si el adaptador entrena solo los módulos de atención y MLP o si además ajusta embeddings (el tamaño del repositorio, 0,7 GB, es considerablemente mayor del que cabría esperar de un LoRA r=16 sobre 0,6B parámetros, lo que sugiere pesos adicionales o estados de optimizador incluidos). El control de acento se resuelve mediante un canal de tipo `token`, es decir, mediante identificadores discretos introducidos en la secuencia de entrada en lugar de vectores de estilo continuos.

Sobre el modelo base: el nombre `Qwen3-TTS-12Hz` indica una tasa de 12 tokens de audio por segundo, lo que implica que un minuto de audio corresponde aproximadamente a 720 tokens generados. Esta tasa baja reduce el coste autoregresivo frente a codecs de 50 Hz o 75 Hz, a costa de depender de un decodificador de mayor capacidad para reconstruir la forma de onda.

## Capacidades

- Generacion de voz (text-to-speech) a partir de texto en wolof.
- Control de acento dialectal mediante el canal `token`, con tres variantes declaradas: baol, dakar y fouta.
- Adaptacion de un modelo base multilingue a una lengua de bajos recursos mediante LoRA, sin reentrenar el modelo completo.
- Carga incremental: el adaptador se puede intercambiar sobre el mismo base para servir distintas variantes de acento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio de entrada ni clonacion de voz.
- No se documentan capacidades de traduccion ni de generacion de texto; es exclusivamente un modelo de sintesis de voz.
- No se documenta un modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- **Locucion automatica en wolof para medios locales**: radios y televisiones de Senegal y Gambia pueden convertir guiones escritos en audio con la variante de acento adecuada para cada region, usando `dakar` para emisiones urbanas y `baol` o `fouta` para contenido regional.
- **Sistemas de respuesta interactiva de voz (IVR)**: integrado en centralitas telefonicas, el modelo puede sintetizar avisos, menus y confirmaciones en wolof, reduciendo la dependencia de grabaciones humanas y facilitando la actualizacion de textos sin regrabar.
- **Accesibilidad para personas con discapacidad visual**: lectura en voz alta de articulos, mensajes o documentos administrativos en wolof, lengua en la que la oferta de lectores de pantalla es practicamente inexistente.
- **Material educativo y de alfabetizacion**: generacion de audios para programas de ensenanza de wolof, incluida la exposicion de los alumnos a distintas realizaciones dialectales sin necesidad de contar con hablantes nativos de cada variante.
- **Preservacion linguistica y documentacion**: produccion de corpus de audio sintetico etiquetado por acento que sirva como dato de aumento para entrenar futuros modelos de reconocimiento automatico de voz en wolof.
- **Prototipado de asistentes conversacionales**: al ser un adaptador ligero sobre un base de 0,6B, permite iterar rapidamente en entornos de desarrollo con una sola GPU consumer antes de comprometer recursos en un modelo mayor.
- **Doblaje y subtitulado automatizado**: conversion de subtitulos a pista de audio en wolof para plataformas de video de contenido africano, seleccionando el acento segun el publico objetivo.
- **Investigacion en control prosodico**: el canal de acento basado en tokens ofrece un caso de estudio reproduccible para comparar control discreto frente a control continuo (embeddings de estilo) en TTS de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, SIM-O, MCD ni comparaciones con otros sistemas), y los metadatos de HuggingFace no registran evaluaciones asociadas.

## Requisitos de hardware

Las cifras de VRAM que siguen son **estimaciones** derivadas del recuento de parametros del modelo base (0,6B) y de la sobrecarga habitual de un decodificador de audio; no proceden de mediciones publicadas por el autor.

- **Pesos en fp32**: aproximadamente 2,4 GB solo para el modelo base.
- **Pesos en fp16/bf16**: aproximadamente 1,2 GB, mas el decodificador de audio y la cache de atencion.
- **Cuantizacion int8**: aproximadamente 0,6-0,8 GB.
- **Cuantizacion int4**: aproximadamente 0,4-0,6 GB.
- **VRAM total estimada en inferencia**: entre 2 y 4 GB en fp16, segun longitud de secuencia y tamano del decodificador asociado.
- **GPU consumer**: si, cabe con holgura en cualquier GPU con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070, Apple Silicon con memoria unificada). No requiere GPU de centro de datos.
- **GPU recomendadas para produccion**: RTX 4090 o L4 para servicio de baja concurrencia; A100 o H100 solo si se busca agregar muchas peticiones concurrentes o si el decodificador de audio es costoso.
- **Despliegue**: la ruta documentada es `transformers` + `peft` cargando el base y el adaptador por separado. El soporte de vLLM, TGI, llama.cpp u Ollama para este modelo no esta documentado en la informacion disponible; la conversion a GGUF de un modelo TTS con decodificador de audio no es un camino estandar.
- **Latencia y throughput**: no disponibles. Como referencia estructural, la tasa de 12 Hz implica 12 tokens por segundo de audio generado, de modo que una locucion de 30 segundos requiere aproximadamente 360 pasos de decodificacion autoregresiva mas la sintesis del decodificador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador ni de sus alternativas en la informacion proporcionada. La unica comparacion verificable es contra su propio modelo base.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriVoxAccent QW3 LoRA r16 (este modelo) | 0,6B (base) + LoRA r16 | No disponible | Wolof con acentos baol, dakar, fouta | No disponible | HuggingFace, 0 descargas |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B | No disponible | No disponible | No disponible | HuggingFace (modelo base) |
| Otros adaptadores TTS para wolof | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion disponible |

No se han localizado en la informacion proporcionada alternativas comparables de TTS en wolof (ni XTTS-v2, ni Orpheus, ni Kokoro, ni sistemas comerciales) con datos verificables de parametros, contexto o rendimiento para esta lengua, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- **Ausencia de evaluacion**: cero descargas y cero validaciones comunitarias. No hay ninguna metrica objetiva publicada que respalde la calidad del audio generado.
- **Licencia no especificada**: la model card no declara licencia y los metadatos la marcan como no disponible. Esto impide determinar si el uso comercial esta permitido. Es un bloqueante para cualquier despliegue en produccion.
- **Documentacion insuficiente**: la model card esta en frances, tiene cuatro lineas y no detalla dataset, hiperparametros, hablantes, duracion de entrenamiento ni procedimiento de inferencia. Reproducir el resultado no es posible con la informacion publicada.
- **Dependencia del modelo base**: el adaptador no funciona de forma autonoma. La licencia y las limitaciones del `Qwen/Qwen3-TTS-12Hz-0.6B-Base` se heredan y deben verificarse por separado.
- **Riesgo de alucinacion acustica**: como todo modelo de sintesis autoregresiva, puede producir artefactos, saltos, repeticiones o silencios anomalos en entradas largas o con caracteres fuera del dominio de entrenamiento. No hay informacion sobre el comportamiento en texto con numeros, abreviaturas o prestamos del frances y del arabe, frecuentes en wolof escrito.
- **Cobertura limitada a un unico idioma**: no hay evidencia de que el adaptador conserve las capacidades multilingues del base. Es probable, aunque no esta confirmado, que el ajuste LoRA haya desplazado el comportamiento hacia el wolof.
- **Cobertura de acentos incompleta**: solo se declaran tres variantes (baol, dakar, fouta) sobre un continuo dialectal mas amplio. El comportamiento fuera de esas etiquetas es desconocido.
- **Sesgo de hablante**: al no documentarse los hablantes del corpus, no se puede evaluar si la voz resultante esta sesgada hacia un genero, edad o registro concretos. En lenguas de bajos recursos es habitual que los corpus esten desequilibrados hacia voces masculinas adultas.
- **Fecha de publicacion atipica**: el modelo esta fechado el 13 de septiembre de 2026. Conviene verificar la procedencia y la integridad del repositorio antes de integrarlo en cualquier flujo.
- **Riesgo de uso indebido**: la sintesis de voz permite suplantacion. No se documenta marca de agua, huella digital ni mecanismo de deteccion en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/xelsoft-ai-lab/AfriVoxAccent_QW3_spk_acc_12hz_lora-r16_frac75_s42_20260913_125159
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Perfil del autor en HuggingFace: https://huggingface.co/xelsoft-ai-lab
- Paper, blog o repositorio de AfriVoxAccent: no disponible en la informacion proporcionada
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
