# tmthang86/Artemis-31B-v1.2-mlx-6bit

## Resumen

Artemis-31B-v1.2-mlx-6bit es una cuantizacion en 6 bits del modelo TheDrummer/Artemis-31B-v1.2, publicada por el usuario tmthang86, destinada a la inferencia en Apple Silicon mediante el framework MLX. El modelo original es un ajuste fino de google/gemma-4-31B-it orientado a escritura creativa y conversacion, con aproximadamente 30.700 millones de parametros. Esta version concreta elimina la torre de vision del checkpoint multimodal original y conserva unicamente la capacidad de generacion de texto.

El interes de esta publicacion es practico: permite ejecutar un modelo de ~31B en equipos Mac con memoria unificada, algo inviable con los pesos en bfloat16 (que rondarian los 60 GB). La cuantizacion de 6 bits con tamano de grupo 64 reduce el repositorio a 25 GB, lo que lo hace accesible en configuraciones de 32 GB de memoria unificada o superiores. La conversion se realizo con mlx-lm 0.32.2 mediante el comando `mlx_lm convert --q-bits 6 --q-group-size 64`.

Se trata de un modelo de nicho: no tiene descargas ni interacciones registradas, la licencia aparece como "other" sin terminos explicitos en la model card de origen, y esta marcado como no apto para todas las audiencias por su contenido para adultos. Es relevante para quienes quieran experimentar con escritura creativa local en Mac sin depender de servicios en la nube, asumiendo las advertencias de licencia y contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4, sin torre de vision) |
| Parametros totales | 30.697.345.280 (~30,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | other (la model card de origen no especifica terminos; el modelo base google/gemma-4-31B-it se publica bajo Apache 2.0 con los terminos de la licencia Gemma 4) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino de google/gemma-4-31B-it, por lo que hereda la arquitectura transformer de la familia Gemma 4. La configuracion del checkpoint incluye parametros propios de la atencion global de esta familia (`global_head_dim` y `num_global_key_value_heads`), lo que sugiere un esquema de atencion hibrida con cabezas globales y locales. Esta version ha eliminado la torre de vision del checkpoint multimodal original, quedando como modelo puramente de texto.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si el ajuste fino de TheDrummer empleo RLHF, DPO u otras tecnicas de alineacion. La model card de esta cuantizacion no aporta detalles sobre el proceso de entrenamiento del modelo base. La unica innovacion tecnica documentada es la propia cuantizacion MLX a 6 bits con group size 64, realizada con mlx-lm 0.32.2, que no requirio cambios en el config.json del checkpoint original.

## Capacidades

- Generacion de texto y escritura creativa: es la funcion principal del modelo, orientado a narrativa, ficcion y prosa larga.
- Conversacion multi-turno: la model card lo etiqueta como "conversational".
- Contenido para adultos: el autor advierte explicitamente que puede generar material maduro o explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision: no soportada en esta version (la torre de vision fue eliminada durante la conversion).
- Modo thinking: no disponible.

## Casos de uso

- Escritura creativa local en Mac: el modelo puede generar narrativa, dialogos y descripciones en un equipo Apple Silicon con 32 GB o mas de memoria unificada, sin enviar prompts a servicios externos. Es adecuado por su orientacion a prosa creativa y por el formato MLX optimizado para estos chips.
- Generacion de borradores de ficcion: util para producir primeros capitulos, esquemas de trama o variaciones de escenas, aprovechando la capacidad conversacional para iterar sobre el texto con instrucciones sucesivas.
- Asistencia en guiones y dialogos: el modelo puede redactar conversaciones entre personajes y refinarlas en turnos posteriores, gracias a su naturaleza conversacional.
- Prototipado de aplicaciones de escritura con LM Studio u oMLX: al estar en formato MLX, se integra directamente en estas herramientas de escritorio para Mac, lo que permite construir demos o interfaces de escritura asistida sin infraestructura de servidor.
- Experimentacion e investigacion en cuantizacion: sirve como caso practico para estudiar el impacto de la cuantizacion a 6 bits con group size 64 sobre un modelo de ~31B en hardware consumer de Apple.
- Generacion de contenido editorial para adultos: el modelo esta explicitamente disenado para este nicho, siempre que el usuario cumpla los requisitos legales de edad y las normas de la plataforma donde se despliegue.
- Uso educativo en entornos controlados: para analizar el comportamiento de modelos ajustados para creatividad y sus riesgos asociados, en contextos de investigacion con las salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 25 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos, mas overhead para el contexto y el runtime de MLX. En la practica, se recomienda un Mac con 32 GB de memoria unificada como minimo.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No esta pensado para GPUs NVIDIA o AMD, ya que el formato es MLX.
- Cabe en hardware consumer: si, en Macs con 32 GB o mas de memoria unificada. En equipos de 16 GB no es viable.
- Opciones de despliegue: mlx-lm (linea de comandos y API Python), LM Studio, oMLX. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1.2-mlx-6bit | ~30,7B | no disponible | MLX safetensors 6-bit | other (base Gemma 4: Apache 2.0 + terminos Gemma 4) | Hugging Face, 0 descargas |
| TheDrummer/Artemis-31B-v1.2 (original) | ~31B | no disponible | safetensors (bf16/fp16) | no especificada en la model card | Hugging Face |
| google/gemma-4-31B-it (base) | ~31B | no disponible | safetensors | Apache 2.0 con terminos de la licencia Gemma 4 | Hugging Face, ampliamente utilizado |

La comparativa se limita a estos tres modelos porque la informacion proporcionada no incluye datos de rendimiento ni de contexto que permitan contrastar con otras alternativas de la misma categoria. La diferencia clave entre ellos es el formato (MLX 6-bit frente a safetensors completos) y el proposito (escritura creativa ajustada frente a modelo base de instrucciones).

## Limitaciones y advertencias

- Contenido para adultos: el autor advierte que el modelo puede generar material maduro o explicito. No es apto para menores ni para entornos sin moderacion.
- Licencia ambigua: la model card de origen no especifica terminos, y esta cuantizacion se etiqueta como "other". Antes de cualquier uso comercial es necesario verificar la licencia del modelo base (Gemma 4) y del ajuste fino de TheDrummer.
- Sesgos: no se documentan sesgos especificos, pero al ser un ajuste fino de un modelo de gran escala sin informacion sobre su dataset, es probable que herede sesgos del corpus de entrenamiento original.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en un modelo generativo de este tamano, especialmente en tareas factuales.
- Limitaciones de contexto e idioma: no se dispone de datos sobre la ventana de contexto ni sobre los idiomas soportados, lo que dificulta planificar su uso en produccion.
- Perdida de capacidades multimodales: la torre de vision fue eliminada, por lo que no puede procesar imagenes.
- Cuantizacion: la reduccion a 6 bits puede introducir degradacion en la calidad de generacion respecto al modelo original, aunque no se han publicado mediciones al respecto.
- Madurez del proyecto: 0 descargas y 0 likes, sin actualizaciones desde su creacion; no hay evidencia de mantenimiento ni de validacion por la comunidad.
- Compatibilidad limitada: solo funciona en el ecosistema MLX (Apple Silicon); no es portable directamente a otras plataformas sin reconversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tmthang86/Artemis-31B-v1.2-mlx-6bit
- Modelo original: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Terminos de la licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
