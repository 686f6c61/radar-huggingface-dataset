# sultthegreat/falcon-mamba-7b-instruct

## Resumen

El modelo `sultthegreat/falcon-mamba-7b-instruct` es una versión instruct del modelo Falcon-Mamba-7B, desarrollado por el Technology Innovation Institute (TII) de Abu Dhabi. Se trata de un modelo de lenguaje causal decoder-only basado en la arquitectura Mamba, una alternativa a los transformers basada en state space models (SSM) que ofrece una complejidad lineal respecto a la longitud de secuencia y una generación más eficiente en memoria y velocidad. Este repositorio concreto es un fine-tuning instruct del modelo base `tiiuae/falcon-mamba-7b`, orientado a conversación y generación de texto en inglés.

El modelo cuenta con aproximadamente 7.270 millones de parámetros y fue entrenado sobre unos 5.500 billones de tokens, principalmente del dataset Refined-Web, filtrado y deduplicado. La arquitectura Mamba elimina la necesidad de mecanismos de atención tradicionales, lo que permite manejar ventanas de contexto largas con un coste computacional constante por token generado. Su relevancia actual radica en que representa una alternativa eficiente a los transformers para despliegue en entornos con recursos limitados, manteniendo capacidades competitivas en tareas de razonamiento y generación.

La model card indica que este repositorio es una versión anterior, ya que el autor señala que la nueva versión es `tiiuae/Falcon3-Mamba-7B-Instruct`. No obstante, el modelo aquí descrito sigue siendo funcional y puede utilizarse con `transformers`, `torch.compile` y cuantización de 4 bits mediante `bitsandbytes`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model, SSM) |
| Parametros totales | 7.272.665.088 (7,27 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion) |
| Tipos de cuantizacion | FP16, 4-bit (bitsandbytes), bfloat16 |
| Idiomas soportados | Principalmente ingles |
| Licencia | TII Falcon-Mamba License 2.0 (falcon-mamba-7b-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Mamba, un tipo de state space model selectivo que sustituye la atención por una capa de recurrencia paralelizable. Esto permite una inferencia con complejidad O(n) en longitud de secuencia y un uso de memoria constante durante la generación, a diferencia de los transformers cuya atención es cuadrática. El modelo es un decoder-only causal, entrenado con el objetivo de modelado de lenguaje autorregresivo.

El entrenamiento del modelo base se realizó con aproximadamente 5.500 billones de tokens, principalmente del dataset Refined-Web, un corpus web filtrado y deduplicado. También se menciona el uso de FineWeb-Edu en la model card, aunque no se especifica la proporción exacta. La versión instruct de este repositorio es un fine-tuning del modelo base, pero no se detallan los datos ni el método de alineación (por ejemplo, si se usó RLHF o DPO). La model card original de TII sugiere que el fine-tuning instruct se realizó con datos de conversación, pero esta información no está disponible en el repositorio actual.

## Capacidades

- Generacion de texto en ingles, con formato conversacional mediante chat template.
- Razonamiento basico y respuesta a preguntas factuales.
- Soporte de generacion de codigo limitado (no se menciona entrenamiento especifico en codigo).
- Capacidad de ejecucion en CPU, GPU y con cuantizacion de 4 bits para reducir requisitos de memoria.
- Compatible con `torch.compile` para acelerar la inferencia en GPU.
- No se indica soporte de tool calling, function calling ni capacidades multimodales (vision, audio).
- El modelo es principalmente monolingue en ingles; no se garantiza un rendimiento solido en otros idiomas.

## Casos de uso

- Asistentes conversacionales en ingles: el modelo puede mantener dialogos multi-turno gracias a su arquitectura Mamba, que permite generar respuestas con baja latencia y uso de memoria constante, adecuado para chatbots en produccion.
- Generacion de texto en entornos con recursos limitados: al ser un SSM, requiere menos memoria que un transformer equivalente, lo que permite ejecutarlo en GPUs de gama media o incluso en CPU con cuantizacion.
- Prototipado rapido de aplicaciones NLP: su integracion sencilla con `transformers` y la disponibilidad de cuantizacion 4-bit facilitan experimentos en notebooks o entornos de desarrollo.
- Sistemas de respuesta a preguntas sobre documentos largos: aunque no se especifica la longitud de contexto, la arquitectura Mamba puede manejar secuencias largas de forma eficiente, aunque se desconoce el limite exacto.
- Educacion e investigacion en modelos SSM: sirve como referencia para estudiar el comportamiento de arquitecturas basadas en state space models frente a transformers.
- Inferencia en tiempo real en dispositivos edge: su eficiencia computacional permite desplegarlo en hardware modesto, como Raspberry Pi o GPUs integradas, para tareas de clasificacion o generacion corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se recomienda consultar el blog de FalconMamba o la documentacion oficial de TII para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: en FP16 (2 bytes por parametro) se necesitan aproximadamente 14,5 GB de VRAM para cargar el modelo completo (7,27 B x 2 bytes). Con cuantizacion de 4 bits, el requisito baja a unos 3,6 GB (7,27 B x 0,5 bytes).
- GPU recomendadas: para FP16, una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100 40 GB, H100). Para 4-bit, una GPU con 6 GB o mas (por ejemplo, RTX 3060, RTX 2070).
- En CPU: puede ejecutarse, pero la velocidad de generacion sera baja; se recomienda para pruebas o uso esporadico.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `bitsandbytes` para cuantizacion, y `torch.compile`. No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles. La arquitectura Mamba suele ofrecer una generacion mas rapida que un transformer del mismo tamano, pero no hay datos concretos en este repositorio.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa en la informacion proporcionada. Como referencia cualitativa, el modelo compite con otros LLMs de ~7B parametros como Falcon-7B (transformer), Mamba-2.8B (SSM mas pequeno) o Llama-2-7B (transformer). La ventaja de Mamba frente a transformers es su menor coste de memoria en inferencia y su capacidad para manejar secuencias largas, aunque puede tener un rendimiento inferior en tareas que requieren atencion global extensa. No obstante, no hay benchmarks que respalden estas afirmaciones en este repositorio.

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente con datos web (Refined-Web), puede heredar sesgos presentes en ese corpus, como estereotipos de genero, raza o cultura.
- Alucinaciones: como todo modelo generativo, puede producir informacion falsa o inventada, especialmente en temas especializados o de actualidad.
- Idioma: esta optimizado para ingles; su rendimiento en otros idiomas es limitado y puede generar respuestas incoherentes o incorrectas.
- Contexto: no se especifica la longitud de contexto soportada; es posible que sea limitada (tipicamente 2048 tokens en Falcon-Mamba), lo que restringe su uso en documentos muy largos.
- Licencia: la TII Falcon-Mamba License 2.0 tiene restricciones de uso comercial; es necesario revisar los terminos y condiciones en el enlace proporcionado antes de utilizarlo en produccion.
- Version antigua: el propio autor indica que existe una version mas reciente (`tiiuae/Falcon3-Mamba-7B-Instruct`), por lo que este modelo puede quedar desactualizado en cuanto a mejoras y correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sultthegreat/falcon-mamba-7b-instruct
- Modelo base: https://huggingface.co/tiiuae/falcon-mamba-7b
- Blog de FalconMamba: https://huggingface.co/blog/falconmamba
- Paper Mamba (arxiv 2312.00752): https://arxiv.org/abs/2312.00752
- Paper Falcon-Mamba (arxiv 2410.05355): https://arxiv.org/abs/2410.05355
- Terminos de licencia: https://falconllm.tii.ae/falcon-mamba-7b-terms-and-conditions.html
