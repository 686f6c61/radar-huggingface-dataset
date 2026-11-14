# wayne-SFT/Llama-3.2-3B-Instruct-SFT-WebShop

## Resumen

Llama-3.2-3B-Instruct-SFT-WebShop es un ajuste fino supervisado (SFT) de `meta-llama/Llama-3.2-3B-Instruct` desarrollado por el usuario wayne-SFT. El modelo se ha entrenado mediante clonacion de comportamiento sobre trayectorias expertas recopiladas por el autor en el entorno WebShop, un benchmark de compra online simulada donde un agente debe navegar por un catalogo, buscar productos y completar objetivos de compra. El checkpoint publicado corresponde al paso global 150, es decir, la epoca 1 de 2, y esta pensado como punto de partida para aprendizaje por refuerzo (RL) posterior sobre el mismo entorno.

Se trata de un modelo transformer denso de 3.212.749.824 parametros (3,2 mil millones), con licencia Llama 3.2 Community License y pesos en safetensors. Su relevancia es acotada: no es un modelo de proposito general mejorado, sino un artefacto de investigacion para experimentos de agentes en entornos web simulados. El autor reporta una tasa de exito del 47,2% sobre los objetivos de desarrollo 500-1499 de WebShop (1000 objetivos, semilla 0), lo que lo convierte en una referencia util para comparar tecnicas de RL sobre agentes de navegacion.

El modelo hereda la arquitectura y el tokenizador del Llama 3.2 3B Instruct original, con una unica modificacion en la plantilla de chat: la fecha actual queda fijada al 26 de julio de 2024 en lugar de calcularse dinamicamente con `strftime_now`. Este detalle es relevante para la reproducibilidad de los experimentos, ya que elimina la variabilidad temporal en las observaciones del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de hasta 2432 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; `config.json` declara `bfloat16`) |
| Idiomas soportados | no disponible (heredados del modelo base, sin evaluacion especifica) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (3 shards, todos los tensores en F32) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B-Instruct` (revision `0cb88a4f764b7a12671c53f0838cd831a0843b95`), un transformer denso con atencion causal estandar. El ajuste es de parametros completos (full-parameter SFT), no LoRA ni adaptadores, con tasa de aprendizaje 1e-5, tamano de lote global 64 y longitud maxima de secuencia 2432 tokens. El checkpoint publicado corresponde al paso global 150, equivalente a la epoca 1 de 2, por lo que el entrenamiento no esta finalizado en este artefacto.

Los datos de entrenamiento son trayectorias expertas recopiladas por el autor exclusivamente sobre los objetivos de entrenamiento de WebShop (nombre interno `ws_sft_div233`). No se especifica el numero de trayectorias ni el volumen total de tokens. La unica modificacion respecto al modelo base es la plantilla de chat, donde la fecha se fija al 26 de julio de 2024. Los pesos se guardan tal cual se entrenaron, en fp32, sin conversion, aunque el campo `dtype` de `config.json` indica `bfloat16`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Instruct.
- Clonacion de comportamiento en el entorno WebShop: el modelo ha aprendido a emitir acciones de busqueda, navegacion y compra siguiendo el formato del entorno.
- Razonamiento de agente de un solo paso por observacion, orientado a la seleccion de acciones en un entorno web simulado.
- Capacidad de actuar como checkpoint inicial para RL posterior (el autor lo presenta explicitamente como "start checkpoint for RL on WebShop").
- Soporte de plantilla de chat con fecha fijada, lo que facilita la reproducibilidad de las observaciones.
- No se documentan capacidades de tool calling generico, vision, audio ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el modelo sirve como politica inicial (behavior cloning) sobre la que aplicar algoritmos de RL como PPO o GRPO en WebShop, gracias a que ya parte de una tasa de exito del 47,2% en el conjunto de desarrollo.
- Evaluacion de tecnicas de SFT en entornos de agente: permite comparar recetas de clonacion de comportamiento (learning rate, batch, numero de epocas) contra la linea base Instruct sin ajustar.
- Reproduccion de experimentos de WebShop: al fijar la fecha en la plantilla de chat, se elimina una fuente de variabilidad y se facilita la comparacion entre ejecuciones.
- Generacion de trayectorias sinteticas: el modelo puede usarse para producir rollouts que sirvan como datos adicionales de entrenamiento o para analizar modos de fallo del agente.
- Estudio de alineacion en dominios acotados: analizar como un SFT sobre un entorno especifico afecta al comportamiento linguistico general del modelo base, comparando respuestas antes y despues del ajuste.
- Docencia y prototipado de agentes web: con 3,2 mil millones de parametros, el modelo es desplegable en hardware modesto para demostraciones de agentes de compra simulada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| WebShop dev (objetivos 500-1499) | 47,2% success rate | 1000 objetivos, semilla 0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 12,9 GB solo para pesos (3,21 mil millones de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en bf16/fp16: aproximadamente 6,4 GB para pesos, mas overhead; viable en GPUs consumer de 8-12 GB con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,2 GB; en 4 bits: aproximadamente 1,6 GB, aunque no se han publicado conversiones oficiales.
- GPUs recomendadas: A100 o H100 para entrenamiento o inferencia con lotes grandes; RTX 4090, RTX 3090 o RTX 4080 para inferencia en precision reducida.
- Cabe en GPUs consumer: si, en tarjetas con 8 GB o mas en bf16/fp16, y en 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se publican en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-SFT-WebShop | 3,21 B | no disponible | Agente WebShop (SFT) | Llama 3.2 Community | Hugging Face |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128k (segun modelo base) | Proposito general Instruct | Llama 3.2 Community | Hugging Face |
| Modelos de agente WebShop comparables | no disponible | no disponible | Agente WebShop | no disponible | no disponible |

No se dispone de datos publicados de otros checkpoints SFT especificos de WebShop en la informacion proporcionada para establecer una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- El checkpoint corresponde a la epoca 1 de 2; el entrenamiento no esta completado, por lo que el rendimiento puede no ser el final del proceso.
- El modelo esta especializado exclusivamente en WebShop y puede degradar su comportamiento conversacional general respecto al modelo base.
- Riesgo de alucinacion en acciones fuera de la distribucion de trayectorias expertas, especialmente en objetivos de test no vistos durante el SFT.
- La fecha fijada en la plantilla de chat (26 de julio de 2024) puede producir inconsistencias si se usa el modelo en contextos donde la fecha real importa.
- Pesos en fp32 con `config.json` declarando `bfloat16`: conviene verificar la precision real al cargar para evitar comportamientos inesperados.
- Licencia Llama 3.2 Community: uso comercial permitido con condiciones, incluida la obligacion de mostrar "Built with Llama" y restricciones de la politica de uso aceptable.
- No se documentan sesgos especificos ni evaluaciones multilingues; se heredan los del modelo base sin analisis adicional.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion externa de la comunidad sobre el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Llama-3.2-3B-Instruct-SFT-WebShop
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE.txt
- Politica de uso del modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/USE_POLICY.md
