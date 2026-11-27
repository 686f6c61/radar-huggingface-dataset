# Xylolabs/Qwen3-4B-Instruct-2507-MLX-8bit

## Resumen

Qwen3-4B-Instruct-2507-MLX-8bit es una cuantizacion en 8 bits del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por Xylolabs en formato MLX para su uso con la libreria `mlx-lm` de Apple. El modelo base es un transformer denso de 4.022.468.096 parametros (aproximadamente 4B) desarrollado por el equipo Qwen de Alibaba, orientado a generacion de texto, conversacion y tareas de instrucciones.

La aportacion de esta ficha concreta no es un modelo nuevo, sino una conversion optimizada para el ecosistema MLX, el framework de computacion tensorial de Apple Silicon. Xylolabs aplica cuantizacion afina (affine quantization) con tamano de grupo 64, escalas y sesgos en float16, y cuantiza tanto los pesos de las capas lineales como el embedding de tokens y la cabeza LM. El resultado es un repo de 4,3 GB que mantiene una fidelidad muy alta respecto al modelo original en BF16.

Es relevante para desarrolladores que quieran ejecutar un modelo de 4B en Macs con Apple Silicon (chips M1, M2, M3, M4) con una perdida de calidad minima: la divergencia KL frente a BF16 en WikiText-2 es de 0,000614 y la coincidencia top-1 es del 98,63%, muy superior a la variante de 4 bits del mismo autor. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3, familia Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits afin, group size 64, escalas y sesgos en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), libreria `mlx-lm` |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-Instruct-2507 es un transformer denso de aproximadamente 4B parametros de la familia Qwen3, entrenado por el equipo Qwen de Alibaba y afinado para seguir instrucciones (variante Instruct, revision 2507). La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento en el modelo base.

La innovacion tecnica de esta publicacion reside en el proceso de cuantizacion: Xylolabs convierte los pesos a MLX aplicando cuantizacion afina de 8 bits con grupo de 64 elementos, manteniendo las capas de normalizacion en float16 y cuantizando tambien el embedding de tokens y la cabeza de lenguaje. Segun la model card, la fidelidad medida frente a BF16 es muy alta: KL de 0,000614 en WikiText-2, 0,000708 en datos de chat y 0,000567 en texto retenido, con coincidencias top-1 del 98,63%, 98,69% y 98,96% respectivamente, y una tasa de acierto de 7/7 en una prueba de siete preguntas. No se documentan innovaciones de decodificacion especulativa ni atencion lineal en esta conversion.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Seguimiento de instrucciones (variante Instruct del modelo base).
- Capacidades de razonamiento y codigo presumiblemente presentes por herencia del modelo base, aunque no se detallan en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles ni documentados en esta ficha.
- Ejecucion nativa en Apple Silicon mediante MLX, con integracion directa en `mlx-lm`.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse integramente en un Mac con Apple Silicon usando `mlx-lm`, sin conexion a servicios externos, lo que resulta adecuado para prototipos de chatbots y asistentes personales con requisitos de privacidad.
- Generacion de texto en aplicaciones de escritorio para macOS: al ser un repo de 4,3 GB y requerir solo la libreria `mlx-lm`, se puede empaquetar en aplicaciones nativas de escritorio que necesiten generacion de texto sin depender de la nube.
- Prototipado rapido de pipelines de NLP: la cuantizacion de 8 bits mantiene una fidelidad del 98,63% en top-1 respecto a BF16 en WikiText-2, lo que permite usar el modelo para evaluar prompts y flujos antes de pasar a produccion con el modelo completo.
- Educacion e investigacion en eficiencia de modelos: sirve como caso de estudio de cuantizacion afina en MLX, con metricas de KL y top-1 publicadas frente a BF16 y a la variante de 4 bits, util para comparar tecnicas de compresion.
- Desarrollo offline en entornos con recursos limitados: al caber en equipos de consumo con Apple Silicon (frente a los 8,04 GB del BF16), permite trabajar con un modelo de 4B en portatiles sin GPU dedicada.
- Base para experimentos de ajuste fino o evaluacion comparativa: al estar en formato MLX y safetensors, se puede cargar con `mlx-lm` para tareas de evaluacion o como punto de partida en flujos de experimentacion con modelos cuantizados.

## Benchmarks y rendimiento

La model card publica unicamente metricas de fidelidad de la cuantizacion frente a BF16, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Se reproducen a continuacion los datos disponibles:

| Variante | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Prueba de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 2,32 GB | 0,112426 | 85,43% | 0,103188 | 86,73% | 0,074735 | 87,69% | 6/7 |
| MLX 8-bit | 4,27 GB | 0,000614 | 98,63% | 0,000708 | 98,69% | 0,000567 | 98,96% | 7/7 |
| BF16 | 8,04 GB | - | - | - | - | - | - | 7/7 |

Las metricas se calculan sobre 40/20/20 fragmentos de 512 tokens para WikiText-2, chat y texto retenido, respectivamente. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: aproximadamente 4,3 GB de pesos en 8 bits, mas overhead de ejecucion; se recomienda disponer de al menos 8 GB de memoria unificada para margen operativo.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte de MLX. No esta pensado para GPU NVIDIA o AMD, ya que el formato es especifico de MLX.
- Cabe en equipos de consumo: si, en Macs con Apple Silicon; el modelo BF16 original requiere 8,04 GB, por lo que la variante de 8 bits reduce el requisito a la mitad.
- Opciones de despliegue: `mlx-lm` version 0.32.2 o superior, mediante el comando `mlx_lm.generate` o la API Python de MLX. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI, que esperan otros formatos (GGUF, safetensors estandar, etc.).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-Instruct-2507-MLX-8bit | 4,02B | no disponible | MLX safetensors, `mlx-lm` | Apache 2.0 | Hugging Face |
| Xylolabs Qwen3-4B-Instruct-2507 MLX 4-bit | 4,02B | no disponible | MLX safetensors, `mlx-lm` | Apache 2.0 | Hugging Face (mismo autor) |
| Qwen/Qwen3-4B-Instruct-2507 (BF16) | 4,02B | no disponible | safetensors estandar | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion proporcionada. La variante de 4 bits ocupa 2,32 GB pero degrada la fidelidad (top-1 del 85,43% en WikiText-2 frente al 98,63% de la de 8 bits); la variante BF16 ocupa 8,04 GB y sirve como referencia de maxima calidad. No se dispone de datos de benchmarks de tareas para comparar con otros modelos de 4B de la competencia.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda los sesgos, alucinaciones y limitaciones del modelo base Qwen3-4B-Instruct-2507, que no se detallan en la informacion proporcionada.
- La cuantizacion de 8 bits introduce una divergencia minima pero no nula respecto a BF16 (KL de 0,000614 en WikiText-2); en aplicaciones sensibles a la exactitud conviene validar frente al modelo completo.
- Dependencia exclusiva del ecosistema MLX y de Apple Silicon: no es desplegable en GPU NVIDIA/AMD ni en servidores x86 sin GPU Apple, lo que limita su uso en produccion en la nube convencional.
- Requiere `mlx-lm` version 0.32.2 o superior; versiones anteriores pueden no cargar el formato correctamente.
- No se documentan los idiomas soportados ni la longitud de contexto en la informacion disponible, por lo que no se puede garantizar su comportamiento en espanol o en contextos largos sin validacion previa.
- El modelo base tiene 4B parametros, por lo que su capacidad de razonamiento complejo y conocimiento factual es inferior a la de modelos de mayor tamano; no es adecuado para tareas que requieran precision factual alta sin verificacion.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y atribucion (ver `LICENSE` y `NOTICE` del repo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Instruct-2507-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio del proyecto Tensix de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
