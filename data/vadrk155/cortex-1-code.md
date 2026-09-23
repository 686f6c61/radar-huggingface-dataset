# VADRK155/Cortex-1-Code

## Resumen

Cortex 1 Code es un modelo de generacion de texto especializado en codigo, publicado por el usuario VADRK155 en HuggingFace. Se trata de un GPT de 30 millones de parametros con arquitectura de transformer decoder-only implementada desde cero en PyTorch, sin utilizar la libreria `transformers` ni pesos preentrenados de terceros. El modelo escribe codigo Python y genera todos sus comentarios y salidas en ingles.

Su relevancia es fundamentalmente didactica y experimental: sirve como ejemplo reproducible de entrenamiento from scratch y como banco de pruebas de bajo coste para pipelines de inferencia, ya que se ejecuta en CPU o en cualquier GPU consumer sin requisitos apreciables de VRAM.

No obstante, conviene ser realista sobre su alcance. Con 30 millones de parametros y una ventana de contexto de solo 512 tokens, el modelo olvida rapidamente el contenido previo de la conversacion o del fichero, y el propio autor advierte en la model card que puede producir codigo roto, incompleto o no funcional. No es un modelo apto para produccion, sino una pieza de curiosidad tecnica y de aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia en PyTorch, sin `transformers`) |
| Parametros totales | 30 millones (30m) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible; solo se distribuyen pesos en fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | fp16 (contenedor no especificado en la model card) |
| Tamano del repositorio | 0,1 GB |
| Lenguaje de generacion | Python (comentarios y salida en ingles) |
| Descargas / likes en HuggingFace | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 30 millones de parametros, codificado de forma manual en PyTorch. La model card indica explicitamente que no se empleo la libreria `transformers`, por lo que el binario de pesos no sigue el formato estandar de HuggingFace `transformers` y requiere el codigo de carga incluido en el propio repositorio (por ejemplo, `chat.py` con sus dependencias en `requirements.txt`).

El entrenamiento se realizo completamente desde cero, sin pesos preentrenados ni inicializacion a partir de otro modelo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, MoE o arquitecturas hibridas); se trata de un transformer denso convencional a escala reducida.

## Capacidades

- Generacion de texto autoregresiva orientada a codigo Python.
- Completado de fragmentos cortos de codigo que caben en la ventana de 512 tokens.
- Generacion de comentarios y documentacion en ingles, coherente con el idioma de entrenamiento declarado.
- Ejecucion local completa en CPU, sin necesidad de GPU, gracias a su tamano de 30 millones de parametros.
- Base para experimentacion con arquitecturas transformer propias y para fine-tuning posterior.
- Tool calling o function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles; el modelo solo declara ingles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Docencia y aprendizaje de arquitecturas transformer: el codigo de implementacion propio permite estudiar el ciclo completo de definicion, entrenamiento e inferencia sin la capa de abstraccion de `transformers`. Es util en asignaturas de deep learning donde se quiera mostrar un GPT minimo funcional.
- Pruebas de pipelines de inferencia en local: al pesar decimas de gigabyte, permite validar scripts de carga de pesos, tokenizacion y generacion en entornos sin GPU (portatiles, contenedores CI, Raspberry Pi) antes de escalar a modelos mayores.
- Generacion de fragmentos cortos de Python en prototipos: puede completar funciones de pocas lineas o sugerir nombres de variables en sesiones interactivas, siempre con revision humana obligatoria dado su reducido tamano.
- Fine-tuning de dominio con datasets pequenos: al partir de una licencia MIT y un modelo de 30M, es viable reentrenarlo o ajustarlo en una unica GPU consumer sobre corpus muy especificos (por ejemplo, un DSL interno o una convencion de codigo concreta).
- Investigacion sobre scaling laws y tokenizadores: su tamano reducido permite ejecutar barridos de hiperparametros y comparar tokenizadores en tiempos de entrenamiento asumibles por un investigador individual.
- Generacion de datos sinteticos de arranque (bootstrapping): puede producir ejemplos de codigo o pares instruccion-respuesta de baja calidad que sirvan como semilla para filtrar y ampliar un dataset posterior.
- Entorno seguro de experimentacion con salidas no confiables: por su tendencia documentada a generar codigo roto, resulta adecuado para probar sistemas de validacion estatica, sandboxing y deteccion automatica de errores sin riesgo de consumir recursos elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion estandar, y los resultados de busqueda web proporcionados no contienen datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 60 MB para los pesos (30M parametros x 2 bytes), mas el overhead del runtime; en la practica, por debajo de 1 GB en cualquier configuracion.
- Inferencia en CPU: plenamente viable; el modelo cabe en memoria RAM sin dificultad y puede ejecutarse en portatiles modernos, contenedores Docker ligeros o dispositivos tipo Raspberry Pi.
- GPU recomendadas: ninguna en concreto es necesaria. Funciona en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en GPUs integradas; una A100 o H100 estaria completamente infrautilizada.
- Cabida en GPU consumer: si, en todas las GPU consumer actuales y en la mayoria de iGPU con soporte CUDA, ROCm o Metal.
- Opciones de despliegue: el modelo requiere el codigo de inferencia propio del repositorio (`chat.py`, `requirements.txt`) por tratarse de una implementacion custom en PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF; su uso con esos motores exigiria una conversion manual de los pesos y la reimplementacion de la arquitectura.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones, aunque dado el tamano del modelo la generacion en CPU deberia alcanzar velocidades de decenas a centenares de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| Cortex 1 Code (VADRK155) | 30M | 512 tokens | Ingles | MIT | No disponible |
| GPT-2 small | 124M | 1024 tokens | Ingles | Licencia MIT modificada | No disponible en la informacion proporcionada |
| Qwen2.5-Coder-0.5B | 0,5B | 32 768 tokens | Multilingue | Apache 2.0 | No disponible en la informacion proporcionada |

La comparacion se limita a caracteristicas objetivas de tamano, contexto y licencia, ya que no se han publicado resultados de rendimiento de Cortex 1 Code. Frente a alternativas como GPT-2 small o Qwen2.5-Coder-0.5B, Cortex 1 Code es entre cuatro y dieciseis veces mas pequeno, tiene una ventana de contexto mucho mas reducida y carece de integracion con el ecosistema `transformers`, lo que limita su adopcion en herramientas estandar.

## Limitaciones y advertencias

- Tamano muy reducido: con 30 millones de parametros, la model card advierte que puede producir codigo roto, incompleto o no funcional. Esto es comportamiento esperado, no un fallo puntual.
- Ventana de contexto de 512 tokens: el modelo olvida rapidamente las partes anteriores del codigo o de la conversacion, lo que rompe cualquier tarea que requiera coherencia a medio plazo.
- Riesgo elevado de alucinacion: no se documenta entrenamiento con RLHF, DPO ni tecnicas de alineacion, ni datos de evaluacion de fidelidad.
- Sesgos: no disponibles. No se ha publicado informacion sobre composicion del dataset de entrenamiento ni sobre analisis de sesgos.
- Limitacion idiomatica: solo se declara soporte de ingles. El castellano no esta contemplado, ni en generacion ni en comentarios.
- Formato de pesos no estandar: al no usar la libreria `transformers`, los pesos no se cargan con `AutoModelForCausalLM` ni con motores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama) sin trabajo adicional de conversion.
- Ausencia de benchmarks: no hay evidencia cuantitativa de calidad que permita justificar su uso en produccion.
- Adopcion practicamente nula: 0 descargas y 1 like en el momento de la consulta, sin comunidad ni mantenimiento documentado.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; es el aspecto mas favorable del modelo, pero no compensa las limitaciones tecnicas para entornos productivos.
- Fecha de publicacion atipica: los metadatos indican creacion y actualizacion en septiembre de 2026, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VADRK155/Cortex-1-Code
- Repositorio de codigo de inferencia: incluido en el propio repositorio de HuggingFace (`chat.py`, `requirements.txt`)
- Paper tecnico: no disponible
- Blog o articulo del autor: no disponible
- Demo o espacio interactivo: no disponible
