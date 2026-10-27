# sw-voice/maya2-native-swamiji-en-te-kn-sft-lr1e-6-3ep

## Resumen

`maya2-native-swamiji-en-te-kn-sft-lr1e-6-3ep` es un ajuste fino completo (full fine-tune) del modelo de sintesis de voz `maya-research/maya2-native`, publicado por el usuario `sw-voice` con fines de investigacion. El modelo parte de un checkpoint de 2.502.398.656 parametros (unos 2,5 B) y se ha especializado en reproducir la voz de una persona concreta ("Swamiji") a partir de un pequeno corpus de clips en ingles, telugu y kannada. El repositorio ocupa 5,0 GB y distribuye pesos en formato safetensors bajo licencia Apache-2.0.

El problema que aborda es el de la sintesis condicionada por hablante para un registro vocal especifico: el modelo no se presenta como un TTS multihablante generico, sino como un derivado que requiere registrar un clip de referencia de Swamiji y usar el modo `spk` para generar nuevas locuciones con esa identidad vocal. Por el volumen de datos declarado (719 clips en ingles depurados, mas los conjuntos en telugu y kannada) y por la ausencia de evaluacion publica, debe considerarse un artefacto de investigacion y no un modelo listo para produccion.

Su relevancia actual es limitada pero informativa: documenta un procedimiento reproducible de ajuste fino de un TTS de ~2,5 B parametros sobre una sola voz y en tres idiomas, con hiperparametros explicitos (LR 1e-6, 3 epocas, 366 actualizaciones, batch 1x8, warmup 10). Resulta util como referencia metodologica para quien quiera replicar el proceso con otras voces o evaluar el coste de especializar un modelo base de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el model card no describe la arquitectura de `maya2-native`; la carga se realiza con el paquete `maya3` mediante `Maya3TTS`) |
| Parametros totales | 2.502.398.656 (~2,5 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible (modelo de text-to-speech; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no declarados en HuggingFace; los datos de entrenamiento incluyen ingles, telugu y kannada, por lo que la cobertura efectiva se limita a esos tres idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 5,0 GB) |
| Tarea (pipeline) | text-to-speech |
| Modelo base | `maya-research/maya2-native` (fine-tune completo) |
| Modo de inferencia | condicionado por hablante (`mode="spk"` con clip de referencia) |

## Arquitectura y entrenamiento

El model card no describe la arquitectura interna del modelo base `maya-research/maya2-native`: no se indica si se trata de un transformer autorregresivo, un modelo no autorregresivo, un difusor acustico o un esquema hibrido, ni se detallan el tokenizador de texto, el codec de audio o la tasa de muestreo de salida. Lo unico documentado es la interfaz de uso: el modelo se carga con el paquete `maya3` a traves de `Maya3TTS.from_pretrained(...)` y la sintesis se condiciona registrando un clip de referencia de la voz objetivo con `mode="spk"`, lo que situa al sistema en la categoria de TTS con clonacion/condicionamiento por hablante.

El entrenamiento consistio en un ajuste fino completo sobre tres conjuntos de clips: `clips.pt` (719 clips en ingles, deduplicados, procedentes de `sw-voice/swamiji-voice-sft-sidon`) y `clips_te.pt` / `clips_kn.pt` (procedentes de los datasets de temas en telugu y kannada `swamiji-navaratri-telugu-sidon-themes` y `swamiji-navaratri-kannada-sidon-themes`). Los hiperparametros declarados son learning rate 1e-6, 3 epocas, 366 actualizaciones totales, batch de 1x8 y 10 pasos de warmup. No se especifica el numero total de tokens ni de horas de audio, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otro ajuste posterior; tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Sintesis de voz (text-to-speech) condicionada por hablante: genera audio nuevo imitando la identidad vocal del clip de referencia registrado.
- Clonacion de voz mediante clip de referencia en modo `spk`.
- Cobertura idiomatica limitada a los idiomas presentes en los datos de entrenamiento: ingles, telugu y kannada.
- Ajuste fino completo sobre una voz concreta, lo que permite replicar el procedimiento con otros hablantes partiendo del mismo modelo base.
- Integracion programatica via paquete `maya3` (`Maya3TTS.from_pretrained`), con API de registro de referencia y sintesis.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio de entrada (reconocimiento de voz); el modelo es exclusivamente de texto a voz.

## Casos de uso

- Investigacion en clonacion de voz: el modelo sirve como caso reproducible de ajuste fino completo de un TTS de ~2,5 B sobre una unica voz, con hiperparametros y datasets documentados, para estudiar el sobreajuste a un hablante y la fidelidad de timbre.
- Generacion de narracion en ingles para contenidos divulgativos: al estar entrenado sobre clips en ingles depurados, puede emplearse para producir locuciones de referencia en ese idioma, siempre con validacion manual de prosodia y pronunciacion.
- Sintesis en telugu y kannada para contenidos de tematica devocional o cultural: los conjuntos `clips_te` y `clips_kn` proceden de series tematicas concretas, de modo que el modelo es adecuado para ese registro y no para dominio general.
- Prototipado de interfaces de voz personalizadas: integrar `Maya3TTS` en un servicio interno que reciba texto y devuelva audio con la voz registrada, para pruebas de experiencia de usuario antes de contratar un TTS comercial.
- Base para nuevos ajustes finos: partir de este checkpoint (o del base) para entrenar otras voces con el mismo pipeline `research/maya2-sft`, reutilizando la receta de LR 1e-6 y 3 epocas como punto de partida.
- Evaluacion comparativa de tecnicas de condicionamiento por hablante: medir, con un corpus controlado, cuanto de la identidad vocal proviene del clip de referencia y cuanto del ajuste fino, usando este modelo como uno de los brazos del experimento.
- Generacion de material de accesibilidad en ingles: locuciones para lectores de pantalla o audiolibros de caracter interno, con revision previa de inteligibilidad y sin uso comercial de la identidad vocal sin autorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye metricas objetivas (MOS, WER, similitud de hablante, SIM-O, SECS), ni comparaciones con otros sistemas TTS, ni tamanos de conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB solo para pesos en bf16/fp16 (2,5 B parametros x 2 bytes), unos 10 GB en fp32 y en torno a 2,5 GB en una hipotetica cuantizacion a 8 bits. Estas cifras son calculos aritmeticos a partir del numero de parametros, no datos publicados por el autor.
- Con overhead de activaciones, codec de audio y buffers, es razonable reservar 6-8 GB de VRAM para inferencia en bf16/fp16.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100 (80 GB) cubren el modelo con holgura en bf16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 (por ejemplo RTX 3060 Ti 8 GB, RTX 3070, RTX 4060 Ti 16 GB), aunque no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: la via documentada es el paquete `maya3` con `Maya3TTS.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con OpenAI.
- Latencia y throughput: no disponibles. No se publican tiempos de sintesis, RTF ni comparaciones de velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos TTS alternativos en la informacion proporcionada. La unica comparacion posible es con su modelo base, cuyos parametros, contexto y licencia no se documentan en esta ficha.

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `sw-voice/maya2-native-swamiji-en-te-kn-sft-lr1e-6-3ep` | 2,50 B | ingles, telugu, kannada (segun datos) | Apache-2.0 | safetensors | Fine-tune completo sobre una voz |
| `maya-research/maya2-native` (base) | no disponible | no disponible | no disponible | no disponible | Modelo de partida; arquitectura no descrita en el model card |
| Otros TTS de tamano comparable | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo etiqueta como `(research)` y no publica evaluacion objetiva ni resultados de benchmarks.
- Especializado en una unica voz: el ajuste fino completo sobre los clips de Swamiji lo hace inadecuado para sintetizar otras identidades vocales sin un nuevo entrenamiento; el modo `spk` asume una referencia de esa misma voz.
- Volumen de datos reducido en ingles (719 clips deduplicados) y sin cifras de horas o tokens, lo que aumenta el riesgo de sobreajuste y de artefactos en textos fuera del dominio de entrenamiento.
- Cobertura idiomatica no declarada oficialmente en HuggingFace: la extension real a telugu y kannada depende de los conjuntos citados y no se ha verificado de forma independiente.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones incorrectas, prosodia anomalа, silencios o ruido en entradas largas, nombres propios, numeros o codigo; requiere validacion automatica (ASR de retorno) y escucha manual en produccion.
- Sesgos: al derivar de una sola voz y de un corpus tematico concreto (temas de Navaratri en telugu y kannada), hereda el registro, el acento y el estilo de esas grabaciones; el rendimiento fuera de ese dominio no esta caracterizado.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial del artefacto, pero la licencia no cubre los derechos de imagen ni de voz de la persona imitada; cualquier uso de la identidad vocal requiere autorizacion explicita y cumplimiento de la normativa aplicable (por ejemplo, el AI Act europeo en materia de deepfakes y transparencia).
- Sin garantias de produccion: 0 descargas y 0 likes en el momento de la consulta, ausencia de tests, de model card ampliada y de soporte de servidores de inferencia estandar.
- Nomenclatura confusa: el repositorio se llama `maya2` pero la carga se realiza con el paquete `maya3` (`Maya3TTS`), lo que puede provocar errores de versionado en integraciones.
- Fecha de creacion declarada en 2026-10-27; conviene verificar la procedencia y la version exacta del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya2-native-swamiji-en-te-kn-sft-lr1e-6-3ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset de clips en ingles citado en el model card: https://huggingface.co/sw-voice/swamiji-voice-sft-sidon
- Dataset de clips en telugu citado: https://huggingface.co/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset de clips en kannada citado: https://huggingface.co/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Codigo de entrenamiento: repositorio `swamiji-tts`, rama/ruta `research/maya2-sft` (no se proporciona URL en la informacion disponible)
- Paquete de inferencia: `maya3` (`Maya3TTS`); no se proporciona URL en la informacion disponible
- Resultados de busqueda web: no contienen enlaces relevantes al modelo (las entradas recuperadas corresponden a la abreviatura "SW", SolidWorks y accesorios de moto)
