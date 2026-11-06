# tpnlabs/tpn-007-winner

## Resumen

TPN-007 Winner es un artefacto GGUF de 4.205.751.296 parametros derivado de Qwen/Qwen3.5-4B-Base, publicado por tpnlabs como submission ganadora (rank-1) de la competicion TPN-007. No se trata de un modelo entrenado desde cero ni de un fine-tune documentado: es una cuantizacion del modelo base de Qwen seleccionada por su fidelidad al original, empaquetada en un unico fichero `q35-t23.gguf` de 2,16 GiB. El autor original del artefacto es el participante `asura625`, y tpnlabs lo ha copiado byte a byte para su publicacion publica, atando las metricas de benchmark al SHA-256 del fichero.

La relevancia del modelo es, por tanto, metodologica mas que de capacidades: la model card documenta con detalle inusual un protocolo de evaluacion de fidelidad (`fidelity-v1`) que mide divergencia KL entre el candidato cuantizado y el modelo base sin cuantizar, ademas de la deriva de estados ocultos capa por capa. Los resultados publicados indican una similitud KL del 88,91% respecto a Qwen3.5-4B-Base, con una relacion de perplejidad de 1,1025x, lo que situa la perdida por cuantizacion en un rango moderado pero no despreciable.

El modelo es solo texto: el repositorio no incluye el proyector de vision necesario para la entrada de imagenes del modelo base multimodal, por lo que cualquier caso de uso con imagenes queda fuera de alcance. La licencia declarada es Apache 2.0, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GGUF, arquitectura `qwen35`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; el limite nativo del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (se publica un unico fichero GGUF; el esquema de cuantizacion concreto no se detalla) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`q35-t23.gguf`, 2.315.465.632 bytes / 2,16 GiB) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion GGUF del modelo Qwen/Qwen3.5-4B-Base, con arquitectura declarada `qwen35` en el fichero. La model card no documenta el proceso de cuantizacion (tipo de quant, calibracion, herramientas empleadas) ni ningun entrenamiento adicional, RLHF, DPO o ajuste fino por parte de tpnlabs o del participante. El modelo base Qwen3.5-4B-Base es, por su denominacion, un modelo preentrenado sin ajuste de instrucciones, aunque la model card menciona el uso de su plantilla de chat con el modo thinking desactivado cuando esta disponible.

La innovacion tecnica documentada no esta en el modelo sino en el protocolo de evaluacion. `fidelity-v1` compara el candidato GGUF ejecutado en llama.cpp Python 0.3.36 contra la referencia ejecutada en Transformers 5.14.0 / PyTorch 2.7.1+cu128, con contexto de 2.048 tokens, stride de 1.024, 60 documentos y 89 ventanas (90.434 tokens puntuados de 120.190 procesados). Ademas de la divergencia KL direccional (referencia hacia candidato), se mide el NRMSE de estados ocultos en las 32 capas del transformer sobre 4.096 filas de activacion muestreadas deterministicamente con semilla 28.445. Se incluye un control sin cuantizar convertido desde el mismo modelo base para aislar la deriva atribuible a la cuantizacion de la diferencia entre los caminos de ejecucion de Transformers y llama.cpp.

## Capacidades

- Generacion de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y runtimes compatibles.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.5-4B-Base, sin garantia de equivalencia exacta tras la cuantizacion.
- Soporte de plantilla de chat (chat template) del modelo base, con modo thinking desactivable cuando el runtime lo soporta.
- Compatibilidad con endpoints OpenAI a traves de `llama-server`.
- Capacidad multimodal: no disponible en este artefacto (falta el proyector de vision).
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base es una variante Base, no Instruct.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el modelo sirve como caso de referencia reproducible para medir deriva KL y NRMSE de estados ocultos frente a un modelo base de 4B, gracias al protocolo `fidelity-v1` y al SHA-256 fijado del artefacto.
- Despliegue local en hardware de gama media: con 4,20 GiB de VRAM medidos a contexto de 2.048 tokens y un fichero de 2,16 GiB, es viable en GPUs consumer con 8 GB o mas para generacion de texto sin vision.
- Prototipado de servidores compatibles con OpenAI: `llama-server` permite levantar una API local en el puerto 8080 con contexto configurable, util para integrar en aplicaciones de desarrollo sin depender de la nube.
- Generacion de texto por lotes en pipelines de datos: el bajo coste de memoria y la licencia Apache 2.0 facilitan su uso en tareas de sintesis o aumento de datos sobre corpus de texto.
- Comparacion de fidelidad entre runtimes: el control sin cuantizar incluido en la documentacion permite contrastar el comportamiento de llama.cpp frente a Transformers sobre el mismo modelo base, util para validar infraestructura de inferencia.
- Base para experimentos de investigacion en compresion de modelos: al ser un artefacto unico con metricas publicas detalladas (KL, perplejidad, NRMSE por capa), sirve como punto de partida para estudiar el impacto de la cuantizacion en modelos de 4B.
- Educacion y demostraciones de inferencia local: el tamano reducido y la simplicidad de un unico fichero GGUF lo hacen adecuado para tutoriales de despliegue con llama.cpp.

## Benchmarks y rendimiento

| Metrica | Candidato (TPN-007 Winner) | Control sin cuantizar |
|---|---:|---:|
| Fluid Knowledge (1.400 items zero-shot, epoch-000002) | 74,57% | no disponible |
| Similitud KL respecto a Qwen3.5-4B-Base | 88,91% | 99,96% |
| Divergencia KL media | 0,117566 | 0,000371792 |
| Perplejidad del candidato / control | 8,32059 | 7,54431 |
| Perplejidad de referencia | 7,54668 | 7,54668 |
| Relacion de perplejidad | 1,10255x | 0,999686x |
| NRMSE medio de estados ocultos | 0,257174 | 0,0109713 |
| NRMSE maximo de estados ocultos | 0,318872 | 0,0208597 |
| VRAM medida a contexto de 2.048 tokens | 4,20 GiB | no disponible |
| Formato de respuesta valido (Fluid Knowledge) | 99,93% | no disponible |
| Formato de respuesta estricto (Fluid Knowledge) | 100,00% | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas anteriores corresponden al protocolo propio de TPN y no son directamente comparables con benchmarks academicos.

## Requisitos de hardware

- VRAM estimada: 4,20 GiB medidos a contexto de 2.048 tokens en llama.cpp; el consumo crece con la longitud de contexto, el tamano de batch y la precision de la cache KV, por lo que a 8.192 tokens sera superior (cifra exacta no disponible).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para contexto moderado; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100 son sobradas para este artefacto.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas, dado el tamano del fichero (2,16 GiB) y la VRAM medida.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, runtimes derivados como Ollama o llama-cpp-python. vLLM y TGI no estan documentados para este artefacto en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| TPN-007 Winner | 4.205.751.296 | 8.192 (evaluado) | GGUF | Apache 2.0 | Cuantizacion de Qwen3.5-4B-Base; solo texto |
| Qwen/Qwen3.5-4B-Base | 4B (aproximado) | no disponible | safetensors | Apache 2.0 | Modelo base multimodal; incluye vision |
| Otros GGUF de la familia Qwen3.5-4B | ~4B | no disponible | GGUF | Apache 2.0 | No documentados en la informacion disponible |

La comparativa se limita al modelo base y a variantes GGUF de la misma familia, ya que la informacion proporcionada no incluye datos de modelos alternativos de 4B de otros desarrolladores. No disponible para comparaciones con Llama, Gemma o Mistral de tamano similar.

## Limitaciones y advertencias

- El artefacto es una cuantizacion: la relacion de perplejidad de 1,1025x y el NRMSE medio de estados ocultos de 0,257 indican una deriva medible respecto al modelo base, que puede traducirse en diferencias de comportamiento en prompts fuera del corpus de comparacion.
- No incluye el proyector de vision del modelo base multimodal, por lo que no admite entrada de imagenes.
- El modelo base es una variante Base, no Instruct: no se ha documentado ajuste por instrucciones, RLHF ni DPO, lo que limita su uso directo en tareas conversacionales sin prompting adecuado.
- Fluid Knowledge mide una unica epoca y protocolo fijados; no es una medida completa de capacidad general, seguridad o fiabilidad factual.
- Las metricas de fidelidad aplican exclusivamente al fichero exacto (SHA-256 `4d52cdce9898b58252b67aea26f5ca6752b84a185a70587acb0f271793da9748`), revision de referencia y runtimes indicados; no garantizan comportamiento identico en otros entornos.
- Los modelos cuantizados pueden comportarse de forma distinta segun plantilla, runtime, longitud de contexto y parametros de muestreo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; inherente a los modelos de lenguaje de 4B.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; se desconoce la cobertura multilingue real.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen/Qwen3.5-4B-Base antes de redistribuir o desplegar.
- El nombre historico `tpnlabs/tpn-007-base` resuelve a `tpnlabs/tpn-007-winner`, lo que puede generar confusion en referencias antiguas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tpnlabs/tpn-007-winner
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio original del participante: https://huggingface.co/asura625/q35-t23
- Informe publico de fidelidad: https://bench.trueperformancenetwork.com/r/ZAi9xIybXb9X67i9G-Zvaw
