# trymirai/Qwen3.5-4B-M

## Resumen

Mirai's Qwen3.5-4B Medium Quantization (identificador `trymirai/Qwen3.5-4B-M`) es una cuantizacion de calidad media del modelo base Qwen/Qwen3.5-4B, desarrollada por Mirai Labs bajo el framework de inferencia `uzu`. El objetivo del checkpoint es ofrecer una version compacta del modelo original que pueda ejecutarse de forma eficiente en hardware Apple silicon, manteniendo una divergencia KL baja respecto al modelo de referencia. Se distribuye con licencia Apache 2.0, heredada del modelo base.

El checkpoint emplea cuantizacion entera asimetrica de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 32. El proceso combina cuantizacion post-entrenamiento con destilacion consciente de cuantizacion (quantization-aware distillation) y transformadas de Hadamard aleatorias de bloque diagonal para mitigar valores atipicos en activaciones y pesos. El resultado son aproximadamente 2.300 millones de parametros almacenados en safetensors, lo que supone una reduccion sustancial frente a los 4B nominales del modelo original.

La relevancia actual del checkpoint reside en su posicionamiento en la frontera de Pareto entre tamano y divergencia KL: segun el autor, no existe un checkpoint mas pequeno con menor KL en su mezcla de evaluacion (45% datos agenticos publicos, 30% SFT/contexto largo publico, 25% datos privados de chat). No obstante, la informacion publica es limitada: no se detallan idiomas soportados, benchmarks estandar ni especificaciones del modelo base, y el unico runtime soportado explicitamente es Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B; no detallada en la informacion proporcionada) |
| Parametros totales | 2.302.180.352 (safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit asimetrica con zero points de 4 bits, escalas bfloat16, group size 32; el repo incluye tags de 4-bit y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, cuyos detalles no se reproducen en la informacion proporcionada; la model card remite a la model card original para arquitectura, uso previsto, evaluaciones y limitaciones. El checkpoint distribuido no es un modelo entrenado desde cero, sino una cuantizacion: los pesos se almacenan en 4 bits asimetricos con zero points de 4 bits, escalas bfloat16 y grupos de 32 elementos, lo que explica que el recuento de parametros en safetensors (2.302 millones) sea inferior al nominal de 4B del modelo original.

El metodo de Mirai Medium combina cuantizacion post-entrenamiento con destilacion consciente de cuantizacion, e incorpora transformadas de Hadamard aleatorias de bloque diagonal (Block-diagonal Random Hadamard Transforms) para reducir valores atipicos tanto en activaciones como en pesos. La evaluacion reportada por el autor usa una mezcla de datos con 45% de datos agenticos publicos, 30% de SFT/contexto largo publico y 25% de datos privados de chat, y situa al checkpoint en la frontera de Pareto tamano-KL segun sus propias mediciones. No se especifican el numero de tokens de entrenamiento del modelo base, la composicion completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Razonamiento y conversacion multi-turno: capacidades heredadas del modelo base Qwen3.5-4B, si bien no se detallan en la informacion disponible.
- Codigo y matematicas: no se documentan explicitamente para este checkpoint; dependen del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la mezcla de evaluacion incluye un 45% de datos agenticos publicos, lo que sugiere evaluacion en escenarios agenticos, pero no se confirma soporte nativo de agentes.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Inferencia local en Apple silicon: soportada mediante el runtime `uzu` y el paquete Homebrew `mirai`.

## Casos de uso

- Inferencia local en Mac con Apple silicon: el caso de uso principal documentado. Se instala con `brew install mirai` y se ejecuta con `mirai --model trymirai/Qwen3.5-4B-M`, aprovechando la cuantizacion de 4 bits para reducir el uso de memoria unificada en equipos de sobremesa y portatiles Apple.
- Prototipado de aplicaciones de texto en local: al ser un checkpoint de generacion de texto con licencia Apache 2.0, permite iterar en el desarrollo de asistentes conversacionales sin depender de APIs externas.
- Evaluacion de tecnicas de cuantizacion: util para investigadores que quieran comparar la frontera tamano-KL de Mirai Medium frente a otras cuantizaciones del mismo modelo base.
- Despliegue en entornos con memoria limitada: los aproximadamente 2.300 millones de parametros almacenados en 4 bits reducen el espacio en disco (repo de 7,7 GB) y la memoria necesaria frente al modelo de 4B sin cuantizar.
- Experimentacion con destilacion consciente de cuantizacion: el checkpoint sirve como referencia para estudiar el efecto de las transformadas de Hadamard de bloque diagonal en la calidad final.
- Base para ajuste fino ligero en local: al estar en safetensors y con licencia permisiva, puede servir de punto de partida para experimentos de adaptacion, siempre que el runtime soporte el formato `uzu`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la divergencia KL frente al modelo base, representada en el grafico `kl-vs-size.svg` de la model card, sin valores numericos explicitos en el texto. La evaluacion se realizo sobre una mezcla de 45% datos agenticos publicos, 30% SFT/contexto largo publico y 25% datos privados de chat.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 7,7 GB en el repositorio; en memoria unificada de Apple silicon se requiere espacio suficiente para los pesos en 4 bits mas el overhead del runtime `uzu`, aunque no se publican cifras exactas.
- GPU recomendadas: no se documentan GPU NVIDIA o AMD; el unico backend soportado explicitamente es Apple silicon.
- Compatibilidad con GPU de consumo: si, en equipos Apple silicon con memoria unificada suficiente; no se confirma compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime `uzu` (libreria `uzu`), paquete Homebrew `mirai` y compilacion desde fuente segun la guia del repositorio `trymirai/uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-4B-M | 2.302.180.352 (safetensors) | no disponible | 4-bit asimetrica, group size 32 | Apache 2.0 | uzu (Apple silicon) |
| Qwen/Qwen3.5-4B (modelo base) | 4B (nominal) | no disponible | sin cuantizar | Apache 2.0 | no disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas. La comparacion se limita, por tanto, a parametros almacenados, licencia y runtime soportado.

## Limitaciones y advertencias

- Solo se soporta inferencia en Apple silicon mediante `uzu`; no hay backend documentado para CUDA, ROCm ni CPU generica.
- La cuantizacion de 4 bits introduce perdida de calidad respecto al modelo base; el autor la situa en la frontera de Pareto tamano-KL, pero no se publican valores numericos de esa divergencia.
- No se detallan los idiomas soportados, lo que impide garantizar un comportamiento multilingue adecuado en produccion.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto del modelo base en la informacion proporcionada; deben consultarse en la model card de Qwen/Qwen3.5-4B.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar los terminos del LICENSE enlazado en el repositorio de Qwen.
- El checkpoint tiene un volumen de descargas bajo (450) y solo 2 likes, por lo que la validacion comunitaria es escasa.
- El tag de 8-bit en el repositorio no se corresponde con el metodo descrito (4-bit); conviene verificar la configuracion real antes de desplegar.
- La model card incluye datos de evaluacion con un 25% de datos privados de chat, lo que limita la reproducibilidad de las metricas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trymirai/Qwen3.5-4B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-5-4b-mirai-mirai-m-4
- Guia de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
