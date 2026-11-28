# TalasCloud/Stable-Audio-3-Small-SFX-DiT-GSQ-RCO-GGUF

## Resumen

Stable Audio 3 Small SFX DiT GSQ RCO GGUF es una cuantizacion en formato GGUF del modelo de generacion de efectos de sonido Stable Audio 3 Small SFX de Stability AI. El trabajo lo publica TalasCloud, que no es el autor original del modelo, sino un tercero que convierte y calibra los pesos para su ejecucion en CPU. El repositorio contiene el transformador de difusion (DiT) y el acondicionador original, y esta pensado para generar efectos de sonido a partir de descripciones textuales en entornos sin GPU dedicada.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de difusion de audio de aproximadamente 0,5B parametros en un procesador de escritorio convencional con instrucciones AVX2, concretamente un Intel Xeon E5-2696 v3 (Haswell), usando el runtime local sa3.cpp. No se trata de un modelo nuevo, sino de una distribucion optimizada que reduce la barrera de hardware para experimentar con generacion de audio.

El modelo no es autonomo: requiere componentes complementarios del mismo autor, el codec SAME-S y el encoder T5Gemma, ambos publicados como GGUF separados. La licencia es la Stability AI Community License, no una licencia de codigo abierto permisiva, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con acondicionador de texto; pipeline text-to-audio |
| Parametros totales | 0,5B en el DiT (198.144 registrados en safetensors del repo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, F32 y F16 en tensores concretos |
| Idiomas soportados | no disponible (la entrada textual depende del encoder T5Gemma) |
| Licencia | Stability AI Community License |
| Formato de pesos | GGUF |

Detalle del layout de tensores del DiT: Q8_0 x 152, Q6_K x 20, F32 x 245, F16 x 20. El fichero del DiT ocupa 489.208.512 bytes (aproximadamente 466 MB) y el acondicionador 793.184 bytes en F32. El repositorio completo ocupa 0,5 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es un Diffusion Transformer (DiT) para generacion de audio, acompanado de un acondicionador de texto que transforma las descripciones en representaciones latentes. El pipeline completo combina tres piezas: el encoder de texto T5Gemma, el DiT que genera el latente de audio y el codec SAME-S que decodifica el latente a forma de onda. Esta distribucion GGUF solo incluye el DiT y el acondicionador; el codec y el encoder deben obtenerse por separado.

El proceso de cuantizacion aplicado por TalasCloud se denomina GSQ (calibracion de proyecciones matriciales) con retencion RCO. Segun la model card, se calibraron 172 proyecciones matriciales usando Vulkan sobre una Radeon RX 580 y se conservaron tensores en Q8_0 y Q6_K junto a los tensores originales en coma flotante. El error de proyeccion registrado paso de 9.307 a 8.950 en la muestra de calibracion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo etapas de RLHF o ajuste por preferencias; esos datos corresponden al modelo base de Stability AI y no se detallan en la informacion disponible.

## Capacidades

- Generacion de efectos de sonido (SFX) a partir de descripciones textuales, orientada a sonidos cortos y puntuales mas que a musica o voz.
- Ejecucion en CPU con instrucciones AVX2 mediante el runtime sa3.cpp, sin necesidad de GPU para la inferencia.
- Integracion con el ecosistema koboldcpp a traves de la pipeline multimedia del autor.
- Cuantizacion mixta que permite cargar el modelo en sistemas con poca memoria.
- Dependencia de componentes externos: codec SAME-S y encoder T5Gemma para completar el pipeline de generacion.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento extendido.

## Casos de uso

- Generacion de efectos de sonido para prototipos de videojuegos: el modelo produce SFX a partir de prompts descriptivos y puede ejecutarse en la maquina de desarrollo sin GPU, lo que agiliza la iteracion de diseno sonoro en equipos con hardware modesto.
- Postproduccion de audio en entornos de escritorio: estudio o creador individual que necesita efectos puntuales (puertas, pasos, impactos) sin depender de servicios en la nube ni de tarjetas graficas dedicadas.
- Pruebas de concepto de pipelines de audio generativo: investigadores que quieran evaluar el comportamiento de un DiT de audio cuantizado en CPU antes de invertir en infraestructura GPU.
- Educacion y experimentacion: docencia sobre modelos de difusion aplicados a audio usando un equipo de sobremesa con AVX2, dado el reducido consumo de memoria del GGUF.
- Automatizacion de catalogos de sonido: generacion por lotes de variaciones de efectos a partir de plantillas de texto en un servidor sin GPU, aprovechando que el runtime funciona en CPU.
- Integracion en herramientas de creacion con koboldcpp: incorporar generacion de SFX a flujos existentes basados en esta interfaz, usando los binarios multimedia publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es el error de proyeccion de calibracion (9.307 a 8.950), que mide el ajuste de la cuantizacion sobre la muestra registrada y no constituye una evaluacion de calidad de audio.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el DiT ocupa aproximadamente 466 MB en disco y el acondicionador menos de 1 MB.
- GPU: no necesaria para la inferencia segun la model card; se uso una AMD Radeon RX 580 2048SP (Polaris, 8 GB) solo para la calibracion mediante Vulkan.
- CPU de referencia: Intel Xeon E5-2696 v3 (Haswell) con AVX2.
- Sistema objetivo declarado: Windows.
- Componentes adicionales necesarios: codec SAME-S y encoder T5Gemma en GGUF, publicados por el mismo autor.
- Opciones de despliegue: runtime sa3.cpp y la pipeline multimedia de koboldcpp del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| Stable Audio 3 Small SFX DiT GSQ RCO GGUF (este) | ~0,5B (DiT) | no disponible | GGUF (Q8_0/Q6_K/F32/F16) | Stability AI Community License | Si, via sa3.cpp con AVX2 |
| stabilityai/stable-audio-3-small-sfx (base) | ~0,5B (DiT) | no disponible | safetensors | Stability AI Community License | No documentado |
| thepatch/stable-audio-3-small-sfx-GGUF | no disponible | no disponible | GGUF | no disponible | no disponible |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks que permitan contrastar calidad frente a otras familias de generacion de audio.

## Limitaciones y advertencias

- El modelo no funciona de forma aislada: sin el codec SAME-S y el encoder T5Gemma no se puede completar la generacion de audio.
- La calibracion se realizo sobre una muestra concreta y un hardware concreto (RX 580 con Vulkan); el comportamiento en otros equipos puede diferir.
- El error de proyeccion reportado no equivale a una medida de calidad perceptual del audio generado.
- Licencia Stability AI Community License: no es una licencia de codigo abierto permisiva y puede imponer restricciones al uso comercial; conviene revisar los terminos antes de desplegar en produccion.
- Riesgo de alucinacion sonora: como modelo generativo, puede producir efectos que no correspondan fielmente a la descripcion textual.
- Sesgos: no documentados en la informacion disponible; el modelo base puede reflejar sesgos de su dataset de entrenamiento.
- Idiomas: no se especifican; el soporte multilingue depende del encoder T5Gemma utilizado.
- Repositorio con pocas descargas (181) y sin likes, lo que implica escasa validacion comunitaria.
- Model card redactada parcialmente en ruso e ingles; la documentacion tecnica es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TalasCloud/Stable-Audio-3-Small-SFX-DiT-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-small-sfx
- Licencia del modelo base: https://huggingface.co/stabilityai/stable-audio-3-small-sfx/blob/main/LICENSE.md
- Codec SAME-S: https://huggingface.co/TalasCloud/Stable-Audio-3-Small-SFX-SAME-S-GSQ-RCO-GGUF
- Encoder T5Gemma: https://huggingface.co/TalasCloud/T5Gemma-B-B-UL2-F16-GGUF
- Conversion GGUF de entrada: https://huggingface.co/thepatch/stable-audio-3-small-sfx-GGUF/tree/fcbd756cde8f9cc4d0213433d868063593d6ca22
- Benchmarks de calibracion: https://github.com/aktalascloud/gguf-converter/blob/v1.9.0/benchmarks/2026-11-17-whole-gsq-rco-rx580.json
- Runtime multimedia koboldcpp: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
