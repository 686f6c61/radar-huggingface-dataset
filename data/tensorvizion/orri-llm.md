# TensorVizion/Orri-LLM

## Resumen

Orri es un modelo de lenguaje causal de aproximadamente 3 000 millones de parámetros, desarrollado por TensorVizion como un ajuste fino (fine-tuning) supervisado sobre Qwen2.5-3B. Su objetivo es ofrecer una experiencia conversacional más natural y centrada en seguir instrucciones, manteniendo un tamaño reducido que permita su ejecución en hardware modesto. El modelo conserva la arquitectura original de Qwen2.5, lo que facilita su integración con el ecosistema de Transformers y otras herramientas compatibles.

La relevancia de Orri radica en su propuesta como alternativa ligera a modelos de gran escala para tareas cotidianas de generación de texto, conversación, escritura creativa, asistencia de programación y razonamiento general. Al estar licenciado bajo Apache 2.0 y publicarse en formato safetensors, puede utilizarse tanto en investigación como en aplicaciones comerciales sin restricciones significativas. La versión disponible en el repositorio incluye cuantización de 4 bits mediante bitsandbytes, lo que reduce aún más los requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (transformer causal) |
| Parametros totales | 3 085 938 688 (~3B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-3B soporta 32 768 tokens, pero no se especifica para este ajuste) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) en la version publicada; se menciona que pueden existir otras segun la version |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Orri se basa en la arquitectura Qwen2.5, un transformer causal con atencion por ventanas deslizantes y mecanismos de atencion eficientes. El modelo original de 3B parametros fue disenado por Alibaba para ofrecer un equilibrio entre capacidad y eficiencia, y Orri parte de ese checkpoint para realizar un ajuste fino supervisado (SFT) con el objetivo de mejorar la naturalidad de las respuestas y la adherencia a instrucciones.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el numero de tokens utilizados ni la metodologia exacta del ajuste fino. La model card indica unicamente que se empleo aprendizaje supervisado, sin mencionar tecnicas como RLHF o DPO. Tampoco se especifican innovaciones tecnicas adicionales mas alla de las inherentes a la arquitectura base.

## Capacidades

- Generacion de texto general y conversacion multi-turno con respuestas naturales.
- Escritura creativa: cuentos, poemas, dialogos y otros formatos literarios.
- Reescritura y edicion de textos existentes, incluyendo correccion de estilo y tono.
- Brainstorming y generacion de ideas para proyectos, contenidos o soluciones.
- Asistencia basica de programacion: explicacion de conceptos, generacion de fragmentos de codigo y depuracion sencilla.
- Resumen de documentos y articulos.
- Respuesta a preguntas de conocimiento general y razonamiento logico.
- Roleplay y conversaciones basadas en personajes.
- No se menciona soporte para tool calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones de soporte en ingles, respondiendo a consultas frecuentes y derivando problemas complejos a humanos. Su tamano reducido permite desplegarlo en servidores modestos o incluso en entornos edge.
- Asistente de escritura para blogs y redes sociales: Orri puede generar borradores, reescribir parrafos y sugerir titulares, ayudando a creadores de contenido a mantener un flujo constante de publicaciones.
- Herramienta de estudio y aprendizaje: estudiantes pueden usarlo para resumir capitulos, explicar conceptos y generar preguntas de practica, gracias a su capacidad de razonamiento y respuesta a preguntas.
- Generacion de codigo en entornos de desarrollo: aunque no es un modelo especializado, puede ayudar a programadores a esbozar funciones, revisar logica simple y documentar codigo, integrandose en editores o pipelines de CI/CD ligeros.
- Prototipado de chatbots para startups: equipos pequenos pueden crear demos de asistentes conversacionales sin invertir en infraestructura de alto coste, aprovechando la licencia Apache 2.0 para uso comercial.
- Creacion de personajes para juegos o narrativa interactiva: su capacidad de roleplay permite generar dialogos coherentes y personalidades diferenciadas en proyectos de ficcion o videojuegos independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits, un modelo de 3B parametros ocupa aproximadamente 1,5-2 GB de VRAM; en 8 bits, alrededor de 3-4 GB; en 16 bits, unos 6-7 GB. Estas cifras son estimaciones basadas en el tamaño de parametros y no incluyen overhead de activaciones ni cache de atencion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la version de 4 bits (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para la version de 16 bits se recomienda una GPU con 8 GB o mas, como RTX 3070, RTX 4070 o superiores.
- Compatibilidad con hardware de consumo: si, el modelo cabe en GPUs de gama media y baja gracias a su tamano y a la cuantizacion disponible.
- Opciones de despliegue: puede cargarse con la libreria Transformers de Hugging Face, y es compatible con herramientas como llama.cpp, Ollama o vLLM (aunque no se ha verificado su soporte explicito en estas ultimas). Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Latencia y throughput: no se dispone de mediciones publicadas. En una GPU moderna, un modelo de 3B en 4 bits puede generar decenas de tokens por segundo, pero depende del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para Orri. Como referencia estructural, se puede comparar con su modelo base Qwen2.5-3B, del cual hereda arquitectura y parametros, y con otros modelos de tamano similar como Llama-3.2-3B o Gemma-2-2B. Sin embargo, al no existir benchmarks propios, no es posible establecer una comparacion de rendimiento fiable. La principal diferencia frente al base es el ajuste fino orientado a conversacion, mientras que la licencia Apache 2.0 y el formato safetensors facilitan su adopcion.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; su rendimiento en otros idiomas no esta garantizado y puede degradarse significativamente.
- Al ser un modelo de 3B, su capacidad de razonamiento complejo y de manejo de contextos largos es limitada en comparacion con modelos de mayor tamano.
- No se han publicado evaluaciones de sesgos ni de seguridad; como cualquier modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento y generar contenido inapropiado si no se aplican filtros adicionales.
- Riesgo de alucinacion: puede producir informacion falsa o inventada, especialmente en dominios especializados o cuando se le piden datos precisos.
- No se especifica la longitud de contexto efectiva tras el ajuste fino; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- La cuantizacion de 4 bits puede degradar ligeramente la calidad de las respuestas en comparacion con la version de precision completa.
- No hay informacion sobre el proceso de entrenamiento (datos, volumen, filtrado), lo que dificulta evaluar su robustez y posibles sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TensorVizion/Orri-LLM
- Perfil del autor en Hugging Face: https://huggingface.co/TensorVizion
