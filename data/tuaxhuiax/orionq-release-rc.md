# TUaxhuiax/orionq-release-rc

## Resumen

Orion-Q es un checkpoint de deteccion de actividad vocal (VAD, voice activity detection) orientado a inferencia en dispositivo, publicado por el usuario TUaxhuiax bajo la etiqueta "Precision Engineering" y procedente del barrido de cuantizacion `orionq-2026-11-sweep-b`. El artefacto publicado corresponde al candidato `gptq4-g128-b03`, una cuantizacion solo de pesos a 4 bits con tamano de grupo 128 aplicada sobre el modelo base Orion-VAD 2.1. No se trata, por tanto, de un modelo generativo de lenguaje, sino de un clasificador binario de voz/no-voz.

La relevancia del checkpoint reside en su perfil de despliegue: 4 bits de precision en pesos y una latencia p99 declarada de 206 ms sobre `cpu-intel-npu`, lo que lo situa en el espacio de soluciones para deteccion de voz en tiempo real en hardware de consumo o en el borde. La precision retenida declarada es del 92,6% sobre el conjunto `vad-eval-hard-2k`.

La informacion publica disponible es muy limitada: el repositorio ocupa 0,0 GB, no incluye model card con especificaciones completas de arquitectura, no declara licencia, idiomas ni pipeline, y el contenido distribuido se reduce a `config.json` y `weights.bin`. Cualquier dato no cubierto por la model card se marca como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Orion-VAD 2.1; tipo de red no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (tarea de clasificacion por tramas, no generativa) |
| Tipos de cuantizacion | solo pesos a 4 bits, group size 128 (candidato `gptq4-g128-b03`) |
| Idiomas soportados | no disponible (la tarea VAD es independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | `weights.bin` (binario propietario) y `config.json`; no se distribuye safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Orion-VAD 2.1: no se especifica si se trata de un transformer, una CNN, un modelo recurrente o una combinacion, ni se detalla el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se documenta el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino alineado (RLHF, DPO) o calibracion especifica mas alla del proceso de cuantizacion.

El unico detalle tecnico verificable es el procedimiento de compresion: cuantizacion solo de pesos a 4 bits con tamano de grupo 128, aplicada sobre el checkpoint Orion-VAD 2.1. La model card cita como referencias metodologicas QLoRA (Dettmers et al., NeurIPS 2023) y DartQuant (Shao et al., NeurIPS 2025), lo que sugiere el uso de calibracion rotacional de distribuciones durante la cuantizacion, aunque no se explicita que tecnica concreta se aplico ni con que conjunto de calibracion.

## Capacidades

- Deteccion de actividad vocal: clasificacion binaria de voz frente a no-voz sobre senal de audio.
- Inferencia en dispositivo: disenado para ejecucion en CPU/NPU de bajo consumo, con latencia p99 declarada de 206 ms en `cpu-intel-npu`.
- Operacion a 4 bits: reduce el espacio de pesos en aproximadamente 8 veces frente a FP32, lo que facilita el despliegue en memoria limitada.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni modo de razonamiento extendido.
- No se documenta soporte multilingue explicito; la tarea VAD es intrinsecamente agnostica al idioma, pero no hay confirmacion del autor.

## Casos de uso

- Deteccion de voz en asistentes embebidos: el modelo puede actuar como puerta de activacion (wake-word previo o post-filtro) en dispositivos con NPU Intel, usando los 206 ms de p99 como cota de latencia para el turno de escucha.
- Segmentacion de audio en pipelines de transcripcion: permite recortar silencios antes de enviar audio a un ASR, reduciendo coste de inferencia en servidores y ancho de banda en clientes.
- Reuniones y notas de voz: deteccion de tramos con habla para generar capitulos o marcas temporales en grabaciones largas sin procesar silencio.
- Telefonia y VoIP: supresion de transmision en silencio y deteccion de turno de palabra en sistemas de atencion automatizada, donde la latencia sub-250 ms es aceptable para conmutacion de canal.
- Vigilancia de consumo y telemetria: monitorizacion de presencia de voz en dispositivos de bajo consumo (wearables, sensores IoT) con pesos de 4 bits que caben en memoria flash reducida.
- Filtrado previo en modelos de voz grandes: usar Orion-Q como etapa barata que descarta segmentos sin voz antes de invocar un modelo de reconocimiento o diarizacion mucho mas costoso.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision retenida en `vad-eval-hard-2k` | 92,6% |
| Latencia p99 en `cpu-intel-npu` | 206 ms |
| Precision de pesos | 4 bits |
| Group size | 128 |

No se han publicado resultados comparativos frente a otros modelos VAD, ni curvas ROC, ni tasas de falsos positivos/negativos, ni mediciones de throughput en otras plataformas. Los unicos datos disponibles son los de la tabla anterior, tal como los declara el autor.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo no declara numero de parametros, por lo que no puede calcularse el footprint exacto. Con cuantizacion a 4 bits, el peso en memoria seria aproximadamente 0,5 bytes por parametro, mas overhead de activaciones y buffers de audio.
- GPU recomendadas: no disponibles. El unico hardware de referencia medido es `cpu-intel-npu`.
- Compatibilidad con GPU de consumo: no confirmada. El formato `weights.bin` no es directamente cargable por llama.cpp, vLLM ni Ollama sin un conversor especifico.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime. El unico artefacto publicado es `config.json` + `weights.bin`, lo que implica un runtime propio o no publicado.
- Latencia y throughput: p99 de 206 ms en `cpu-intel-npu` segun el autor; no hay datos de throughput (tramas/segundo) ni de latencia media.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Orion-Q (`gptq4-g128-b03`) | VAD cuantizado 4 bits | no disponible | no aplica | no disponible | Hugging Face, repo de 0,0 GB |
| Silero VAD | VAD | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha |
| WebRTC VAD | VAD clasico | no aplica (basado en reglas) | no aplica | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de benchmarks comparativos publicados por el autor ni de especificaciones de los modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Repositorio de 0,0 GB y sin pesos verificables en la informacion disponible: el contenido real del checkpoint no puede confirmarse; conviene validar la integridad antes de usarlo en produccion.
- Ausencia total de licencia declarada: no hay permiso explicito para uso comercial, redistribucion ni modificacion. Tratar como no licenciado hasta confirmacion del autor.
- Model card muy escueta: sin arquitectura, sin numero de parametros, sin dataset de entrenamiento ni detalles de calibracion. Imposible auditar sesgos o procedencia de datos.
- Riesgo de sobreajuste al conjunto de evaluacion declarado (`vad-eval-hard-2k`): solo se reporta una metrica agregada, sin desglose por dominio, idioma, ruido o tipo de microfono.
- Posibles sesgos acusticos no documentados: al no conocer la composicion del dataset, no puede descartarse un rendimiento degradado en acentos, idiomas o condiciones de ruido no representadas.
- Latencia medida unicamente en `cpu-intel-npu`: no hay garantia de que los 206 ms p99 se mantengan en otras CPU, GPU o NPUs de otros fabricantes.
- Formato `weights.bin` propietario: requiere un runtime especifico no publicado; la integracion con ecosistemas estandar (ONNX, GGUF, safetensors) no esta soportada de forma nativa.
- Fecha de creacion futura (2026-11-18) en los metadatos: conviene verificar la autenticidad y procedencia del repositorio antes de cualquier uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TUaxhuiax/orionq-release-rc
- QLoRA (referencia citada): https://openreview.net/forum?id=OUIFPHEgJU
- DartQuant (referencia citada): https://openreview.net/forum?id=LfcfwlLCHM
