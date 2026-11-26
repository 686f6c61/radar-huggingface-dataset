# wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a1

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a1` es un checkpoint derivado de Qwen2.5-7B-Instruct, publicado en Hugging Face por el usuario wz7475. El nombre del repositorio sugiere un ajuste fino orientado a un dominio medico ("med") con alguna tecnica de modulacion de activaciones o direcciones de steering ("psteer", "prev-single-a1"), aunque el autor no documenta ni el procedimiento ni los datos utilizados. La model card es la plantilla autogenerada por Hugging Face y no aporta informacion sustantiva sobre el modelo.

El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.600 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN) y entrenamiento multilingue en 29 idiomas. Este checkpoint hereda presumiblemente esas capacidades, pero al no existir documentacion del ajuste, no es posible confirmar el alcance real de la especializacion ni su calidad.

La relevancia de esta ficha es principalmente descriptiva: se trata de un artefacto con cero descargas y cero likes, sin pipeline declarado, sin licencia explicita y con un tamano de repositorio de 0,3 GB que resulta insuficiente para contener los pesos completos en precision de 16 bits (que rondarian los 15 GB), lo que apunta a un fallo de subida o a una publicacion parcial. Cualquier evaluacion practica debe partir de esa premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-7B-Instruct; no confirmada en el repo) |
| Parametros totales | 7.600 millones (heredados del modelo base; no verificados en el repo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con YaRN (segun el modelo base; no confirmado en este checkpoint) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; no se han publicado GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible en este repo; el modelo base declara 29 idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura especifica de este checkpoint. Por herencia del modelo base Qwen2.5-7B-Instruct, se trata de un transformer decoder-only con 28 capas, atencion por consultas agrupadas (GQA) con 28 cabezas de consulta y 4 de clave/valor, embedding de 3.584 dimensiones, activacion SwiGLU y normalizacion RMSNorm. El modelo base empleo atencion con sesgo de decaimiento relativo (RoPE) y fue entrenado sobre aproximadamente 18 billones de tokens, seguido de ajuste supervisado y optimizacion por preferencias.

El nombre del repositorio indica que el autor aplico algun tipo de "steering" (probablemente modulacion de direcciones de activacion, "psteer") sobre un ajuste medico, con una variante "prev-single-a1". No se especifica el numero de tokens de ajuste, la composicion del dataset, si hubo RLHF/DPO adicional ni los hiperparametros empleados. Tampoco se documenta si se congelaron capas o se entreno el modelo completo. Toda esta seccion queda, por tanto, sin datos verificables.

## Capacidades

- Generacion de texto y razonamiento general: heredadas del modelo base Qwen2.5-7B-Instruct, aunque no verificadas en este checkpoint concreto.
- Codigo y matematicas: el modelo base muestra buen rendimiento en generacion de codigo y resolucion de problemas matematicos; se desconoce si el ajuste medico ha degradado estas capacidades.
- Soporte de tool calling / function calling: presente en el modelo base; no confirmado tras el ajuste.
- Razonamiento multi-paso y uso como agente: el modelo base soporta plantillas de chat con roles e instrucciones de sistema; no hay evidencia de que este checkpoint las conserve intactas.
- Capacidades multilingues: el modelo base cubre 29 idiomas; este repo no declara ninguno.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Especializacion medica: presumible por el nombre ("med"), sin documentacion ni evaluacion publicada.

## Casos de uso

- Experimentacion academica con tecnicas de steering: el checkpoint puede servir para reproducir o comparar variantes de modulacion de activaciones en un dominio vertical, dado que el nombre codifica la configuracion ("psteer-prev-single-a1").
- Investigacion sobre ajuste fino en dominio medico: util como punto de partida para analizar como un ajuste especializado afecta a las capacidades generales del modelo base, siempre que se verifique primero la integridad de los pesos.
- Generacion de borradores de texto clinico en entornos controlados: solo tras una evaluacion rigurosa de calidad y seguridad, y nunca en produccion sin validacion humana, dado que no hay benchmarks publicados.
- Comparacion de checkpoints derivados: al compartir base con Qwen2.5-7B-Instruct, permite estudiar el efecto de distintos ajustes sobre el mismo punto de partida en tareas de dominio.
- Analisis de robustez y sesgos: util para medir como un ajuste medico sin documentacion afecta a la calibracion y a la tasa de alucinacion frente al modelo original.
- Docencia y formacion: ejemplo practico de publicacion de checkpoints en Hugging Face y de los riesgos de una model card autogenerada sin trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este checkpoint concreto. Como referencia del modelo base de 7.600 millones de parametros, en FP16 se requieren aproximadamente 15-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 sin cuantizar; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16 con margen; RTX 3090/4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas en FP16, y en GPUs de 8-12 GB con cuantizacion de 4-8 bits, siempre que se disponga de pesos completos.
- Opciones de despliegue: transformers (declarado), vLLM, TGI o llama.cpp si se generan pesos compatibles; no hay GGUF publicado en el repo.
- Latencia y throughput estimados: no disponibles.

Advertencia: el repositorio ocupa 0,3 GB, muy por debajo de los ~15 GB esperables para un modelo de 7.600 millones de parametros en safetensors FP16. Es probable que la subida este incompleta o que se trate de un checkpoint parcial (por ejemplo, solo algunas capas o un adaptador empaquetado de forma no estandar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a1 | 7.600 M (heredados) | No disponible (base: 32.768) | No disponible | Repo de 0,3 GB, 0 descargas |
| Qwen2.5-7B-Instruct | 7.600 M | 32.768 (131.072 con YaRN) | Apache 2.0 (segun el modelo base) | Modelo oficial de Alibaba Qwen |
| Mistral-7B-Instruct-v0.3 | 7.200 M | 32.768 | Apache 2.0 | Modelo oficial de Mistral AI |
| Llama-3.1-8B-Instruct | 8.000 M | 131.072 | Llama 3.1 Community License | Modelo oficial de Meta |

No se dispone de datos de rendimiento de este checkpoint para comparar con las alternativas. La comparativa se limita a parametros y contexto teoricos heredados del modelo base.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin informacion sobre datos, metodo de ajuste, hiperparametros ni evaluacion.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base y contactar con el autor.
- Integridad del repositorio dudosa: 0,3 GB frente a los ~15 GB esperados para 7.600 millones de parametros en FP16.
- Riesgo de alucinacion: no cuantificado para este checkpoint; en dominio medico el riesgo es especialmente critico y exige validacion humana.
- Sesgos: no evaluados; se heredan los del modelo base y se anaden los del dataset de ajuste, que se desconoce.
- Idiomas: no declarados en el repo; no se puede confirmar el soporte multilingue.
- Uso clinico: no debe emplearse en decisiones medicas sin auditoria externa, dado que no hay evidencia de validacion.
- Cero traccion en la comunidad (0 descargas, 0 likes) y creado en una fecha futura respecto a la informacion de referencia, lo que sugiere un artefacto de prueba o experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-psteer-prev-single-a1
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- Calculadora de impacto de ML citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) sobre emisiones: https://arxiv.org/abs/1910.09700
