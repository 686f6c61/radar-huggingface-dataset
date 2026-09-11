# theoracleguy/pocket-tts-coreml-v3

## Resumen

Pocket TTS Core ML v3 es un paquete de runtime, no un modelo entrenado desde cero: contiene los artefactos convertidos a Core ML del sistema Pocket TTS (un TTS con arquitectura de flow matching y codec neuronal Mimi) listos para ejecutarse en el Apple Neural Engine (ANE) de dispositivos iOS y macOS. Lo publica el usuario theoracleguy en HuggingFace, y los pesos convertidos proceden del repositorio `FluidInference/pocket-tts-coreml`, en el commit `91748676fe3c8b2eb3007b3125253bcd898202c3`. El objetivo declarado es el de servir como conjunto de runtime estable para hosts FluidAudio en produccion.

El paquete cubre cinco idiomas (ingles, aleman, italiano, portugues y espanol) e incluye, por idioma, cuatro redes principales: `cond_prefill_ane.mlmodelc`, `flowlm_step_ane.mlmodelc`, `flow_decoder_fused.mlmodelc` y `mimi_decoder.mlmodelc`, ademas del tokenizador `constants_bin`, embeddings, constantes de protocolo y voces. El repositorio ocupa 3,0 GB en total y se distribuye bajo licencia CC BY 4.0.

Su relevancia practica esta en que permite sintesis de voz en el propio dispositivo, sin llamadas a API externas ni envio de texto a servidores de terceros, algo critico para aplicaciones de accesibilidad, asistentes embebidos y cualquier escenario con requisitos de privacidad o de funcionamiento offline. La contrapartida es que la model card es extremadamente escueta: no publica numero de parametros, contexto, regimen de cuantizacion ni resultados de evaluacion, por lo que buena parte de la ficha queda marcada como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con flow matching y codec neuronal Mimi (inferida de los nombres de los componentes: `cond_prefill`, `flowlm_step`, `flow_decoder` y `mimi_decoder`); no confirmada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (paquetes Core ML `.mlmodelc`; no se especifica precision) |
| Idiomas soportados | en, de, it, pt, es |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML (`.mlmodelc`) |
| Libreria | coreml |
| Pipeline | text-to-speech |
| Tamano del repositorio | 3,0 GB |
| Componentes por idioma | `cond_prefill_ane.mlmodelc`, `flowlm_step_ane.mlmodelc`, `flow_decoder_fused.mlmodelc`, `mimi_decoder.mlmodelc`, tokenizador `constants_bin`, embeddings, constantes de protocolo y voces |
| Encoder especifico | de, it, pt y es incluyen `mimi_encoderv3.mlmodelc`; en usa el `mimi_encoderv2.mlmodelc` compartido del upstream |
| Verificacion de integridad | manifiesto de descarga por idioma con tamanos de archivo y checksums SHA-256 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento ni la composicion del dataset, y no aporta cifras de tokens, fases de RLHF/DPO ni innovaciones de entrenamiento. Lo que si se deduce de los componentes entregados es un pipeline de inferencia por etapas: un modelo de prefill de condicionamiento (`cond_prefill_ane`), un paso autorregresivo sobre el espacio latente (`flowlm_step_ane`), un decodificador de flujo fusionado (`flow_decoder_fused`) y un decodificador de audio basado en Mimi (`mimi_decoder`), el codec neuronal de Kyutai. Los sufijos `_ane` indican que esas dos primeras redes estan optimizadas para ejecutarse en el Apple Neural Engine.

La model card menciona que se trata de paquetes "non-24L" y que "la ruta ANE de rango 4 sigue siendo el conjunto de runtime estable", lo que sugiere que existen variantes alternativas y que la publicada es la considerada estable por el autor; no se detalla que significa exactamente "non-24L". Tambien se incluye `pocket_state.mlmodelc` en ingles solo por compatibilidad y pruebas, no como parte del conjunto de runtime estable, y se conservan las matrices compartidas de inicializacion de Mimi y de recuperacion del encoder para compatibilidad con hosts FluidAudio existentes.

Una asimetria relevante: aleman, italiano, portugues y espanol disponen de `mimi_encoderv3.mlmodelc` especifico, mientras que el ingles recurre al `mimi_encoderv2.mlmodelc` compartido porque no existe un `mimi_encoderv3` publicado para ese idioma. No se documentan implicaciones de calidad derivadas de esta diferencia.

## Capacidades

- Sintesis de texto a voz en cinco idiomas: ingles, aleman, italiano, portugues y espanol.
- Ejecucion completamente on-device sobre Apple Neural Engine, sin dependencia de servicios en la nube.
- Uso de voces predefinidas incluidas en el paquete, junto con embeddings y constantes de protocolo.
- Decodificacion de audio mediante Mimi, con encoder especifico por idioma en de, it, pt y es.
- Integracion prevista con hosts FluidAudio en iOS y macOS.
- Verificacion de integridad de los artefactos mediante checksums SHA-256 por idioma.
- No se documentan capacidades de clonacion de voz, control de estilo, emocion, velocidad ajustable, tool calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de streaming incremental ni marcas de tiempo a nivel de palabra o fonema.

## Casos de uso

- Accesibilidad en aplicaciones iOS: lectura en voz alta de contenido de pantalla para usuarios con discapacidad visual mediante VoiceOver, con la ventaja de que el texto no sale del dispositivo y el coste por inferencia es cero.
- Asistentes de voz embebidos en macOS: integracion en aplicaciones de escritorio que necesitan respuestas habladas sin latencia de red ni cuotas de API, apoyandose en los hosts FluidAudio ya compatibles con este paquete.
- Lectura offline de articulos, correo o documentacion: la ventana de sintesis no depende de conectividad, lo que resulta util en entornos de red restringida o en modo avion.
- Aplicaciones de aprendizaje de idiomas: reproduccion de enunciados en aleman, italiano, portugues y espanol con voces nativas, util para ejercicios de escucha y repeticion.
- Navegacion y notificaciones en tiempo real: anuncios hablados de indicaciones o alertas generados localmente, evitando enviar datos de ubicacion o contexto a un proveedor externo.
- Prototipado y pruebas de pipelines de audio en CI: el paquete permite generar audio de referencia en maquinas macOS sin coste variable y con checksums verificables para tests de regresion.
- Generacion de audiolibros o podcasts en pequenos volumnes: adecuado para tiradas cortas y contenido privado, aunque la licencia CC BY 4.0 exige atribucion.
- Kioscos y terminales interactivos: sintesis local en dispositivos Apple fijos donde la privacidad y la ausencia de red son requisitos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER de transcripcion inversa, similitud de hablante) ni comparaciones con otros sistemas TTS, y la busqueda web asociada no aporto ningun dato tecnico sobre el modelo.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con Neural Engine (familia Apple Silicon, tanto en iOS como en macOS). El paquete se distribuye como Core ML y dos de sus redes estan explicitamente optimizadas para ANE (`cond_prefill_ane`, `flowlm_step_ane`).
- VRAM estimada: no disponible. El repositorio completo ocupa 3,0 GB, pero ese total agrega los cinco idiomas y todos los artefactos auxiliares; no se publica el tamano ni el pico de memoria por idioma.
- GPU recomendadas: no aplica en el sentido convencional. El objetivo es el ANE de Apple; no se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni para aceleradores alternativos.
- Encaje en hardware de consumo: si, en Mac con Apple Silicon y en iPhone/iPad compatibles, siempre que el conjunto de artefactos del idioma elegido quepa en memoria unificada. No hay cifras publicadas por idioma.
- Opciones de despliegue: Core ML en Xcode y en tiempo de ejecucion en iOS/macOS, hosts FluidAudio, y cualquier runtime capaz de cargar `.mlmodelc`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de TTS en Core ML.
- Latencia y throughput: no disponible.
- Requisitos de integridad: conviene validar los checksums SHA-256 del manifiesto de descarga por idioma antes de desplegar.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Cabe senalar una advertencia metodologica: este repositorio no es un modelo base entrenado, sino un paquete de conversion y runtime Core ML, por lo que no es directamente comparable con otros TTS en terminos de parametros, contexto o benchmarks. Cualquier comparacion con alternativas de TTS on-device o en servidor requeriria consultar las fichas de esos sistemas, que no forman parte de la informacion disponible.

| Criterio | Pocket TTS Core ML v3 | Alternativas de TTS on-device | Alternativas de TTS en servidor |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Idiomas | en, de, it, pt, es | no disponible | no disponible |
| Licencia | CC BY 4.0 | no disponible | no disponible |
| Formato | Core ML (`.mlmodelc`) | no disponible | no disponible |
| Ejecucion | on-device, ANE | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta entrenamiento, dataset, numero de parametros ni evaluaciones; no es posible estimar calidad, sesgos o cobertura linguistica real mas alla de la lista de idiomas.
- Artefacto sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, publicado por un autor individual. No hay evidencia externa de funcionamiento correcto.
- Paquete "runtime-only": esta pensado como conjunto de inferencia, no como modelo base documentado. El autor remite al upstream para atribucion y detalles del modelo original.
- Asimetria entre idiomas: el ingles usa `mimi_encoderv2.mlmodelc` mientras que de, it, pt y es usan `mimi_encoderv3.mlmodelc`. Esto puede traducirse en diferencias de calidad o de comportamiento entre idiomas que no estan cuantificadas.
- El termino "non-24L" y el uso de "ruta ANE de rango 4" no se explican en la model card; se desconoce que variantes existen y en que se diferencian.
- `pocket_state.mlmodelc` se incluye en ingles solo por compatibilidad y pruebas, por lo que no deberia tratarse como parte del runtime estable.
- Riesgo de alucinacion y errores de pronunciacion: inherente a cualquier sistema TTS, y no mitigado ni medido en la informacion disponible.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion al autor y al modelo base. Conviene revisar la licencia del modelo original de Pocket TTS antes de distribuir productos derivados.
- Dependencia de plataforma: al estar en Core ML, el paquete solo es utilizable en el ecosistema Apple. No hay ruta oficial a Linux o Windows descrita.
- Las fechas de creacion y actualizacion del repositorio (11 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la coherencia temporal del artefacto.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo (devuelven listados de restaurantes en Hasselt), por lo que no se ha podido contrastar ningun dato con fuentes externas.

## Enlaces

- HuggingFace: https://huggingface.co/theoracleguy/pocket-tts-coreml-v3
- Repositorio de origen de los pesos convertidos: `FluidInference/pocket-tts-coreml`
- Commit de origen: `91748676fe3c8b2eb3007b3125253bcd898202c3`
- Otros enlaces (paper del modelo base, blog del autor, repositorio de FluidAudio, demos): no disponibles en la informacion proporcionada. Los resultados de la busqueda web no aportaron enlaces relevantes.
