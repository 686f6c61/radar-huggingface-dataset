# syntropic-clx/Clyx_0.3-NM-BASE

## Resumen

Clyx 0.3-NM-BASE es el anuncio de desarrollo de un modelo de lenguaje base de aproximadamente 635,5 millones de parametros, impulsado por el usuario syntropic-clx dentro del proyecto independiente Clyx. Se trata de un Transformer decoder-only de diseno propio, con Grouped-Query Attention (24 cabezas de consulta y 4 de clave/valor), RoPE con base 10.000, RMSNorm y activacion SwiGLU, planteado para entrenarse desde cero, sin importar pesos preentrenados externos, sobre texto en ruso e ingles y codigo (Python, C++ y, como objetivo no confirmado, Luau).

El problema que aborda es la escasez de modelos base pequenos, documentados y con cobertura equilibrada de ruso e ingles: la mayoria de los modelos compactos por debajo de 1.000 millones de parametros estan centrados en ingles o en chino. El objetivo declarado del proyecto es publicar la arquitectura, el tokenizer y el proceso de entrenamiento de forma abierta, de modo que su interes actual es fundamentalmente metodologico.

El estado del proyecto condiciona toda la ficha: no hay pesos descargables, no hay checkpoints publicados, no hay instrucciones de carga verificadas y no existe ningun resultado de evaluacion. La model card describe un plan de entrenamiento (AdamW con decaimiento coseno, precision mixta FP16 o BF16, gradient checkpointing) sujeto a cambios tras las pruebas de GPU. La fecha de creacion indicada en Hugging Face es el 18 de septiembre de 2026, con 0 descargas y 0 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de diseno propio (custom decoder-only Transformer) |
| Parametros totales | 635.512.320 (calculados con un vocabulario de 32.768 tokens); el recuento final dependera del vocabulario real del tokenizer entrenado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens configurados, no validados mediante entrenamiento; longitud de secuencia inicial de preentrenamiento: 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se han publicado pesos ni versiones cuantizadas) |
| Idiomas soportados | Ingles y ruso como objetivo de entrenamiento; codigo en Python y C++; Luau como objetivo no confirmado |
| Licencia | apache-2.0 en los metadatos de Hugging Face; la model card indica que la licencia de los pesos futuros se confirmara antes del lanzamiento |
| Formato de pesos | no disponible (pesos no publicados) |
| Tamano oculto (hidden size) | 1.536 |
| Numero de capas | 24 |
| Cabezas de atencion (query / key-value) | 24 / 4 |
| Dimension de cabeza | 64 |
| Tamano intermedio del MLP | 4.096 |
| Codificacion posicional | RoPE, base 10.000 |
| Normalizacion | RMSNorm |
| Activacion | SwiGLU |
| Tokenizer | ByteLevel BPE, vocabulario objetivo de 32.768 entradas (incluyendo tokens especiales) |
| Embeddings | Entrada y salida atados (tied) |
| Estado | En desarrollo; pesos no publicados |

## Arquitectura y entrenamiento

La arquitectura prevista es un Transformer decoder-only de implementacion propia, con atencion de consultas agrupadas (GQA): 24 cabezas de consulta y 4 cabezas de clave/valor, con dimension de cabeza de 64, lo que reduce el coste de la cache KV en inferencia respecto a atencion multi-cabeza completa. La pila consta de 24 capas con tamano oculto 1.536, MLP de tamano intermedio 4.096, SwiGLU como activacion, RMSNorm como normalizacion y RoPE con base 10.000 como codificacion posicional. Los embeddings de entrada y salida estan atados y el tokenizer es un ByteLevel BPE con un objetivo de 32.768 entradas.

El plan de entrenamiento contempla inicializacion aleatoria desde cero y objetivo de modelado de lenguaje causal (prediccion del siguiente token). Se usara el optimizador AdamW, con implementacion fusionada cuando el hardware lo permita, esquema de learning rate con decaimiento coseno y calentamiento, y un rango inicial de 3e-4 a 3e-5 pendiente de fijacion para la ejecucion definitiva. La precision sera mixta: FP16 o BF16 nativo segun el hardware. Para gestionar memoria se recurrira a gradient checkpointing y a calculo de la perdida por trozos (chunked language-model loss). Las pruebas preliminares de compatibilidad, memoria y reanudacion desde checkpoint se han planteado en Google Colab con una NVIDIA T4 en FP16; el entrenamiento principal se realizara en RunPod con GPU y configuracion aun no seleccionadas. El autor indica explicitamente que la T4 no es el hardware con el que se afirma haber entrenado un modelo de 635M.

El corpus previsto combina texto natural en ruso e ingles, codigo fuente en Python y C++ y, si hay datos adecuados, Luau. La seleccion del dataset, las proporciones de mezcla, el numero de tokens finalmente consumidos y los identificadores de los datasets estan sin cerrar y no se reportan. No se declara ningun uso de RLHF, DPO ni ajuste por instrucciones: se trata de un modelo base, y cualquier futura version conversacional o de asistencia al codigo seria una etapa de entrenamiento y publicacion separada. El proyecto subraya que el modelo 600M+ es un entrenamiento nuevo desde cero y no un fine-tuning ni una ampliacion de pesos de Clyx 0.2 (115,67M).

## Capacidades

Advertencia previa: ninguna de las capacidades siguientes esta verificada, porque no existe checkpoint publicado ni evaluacion. Se listan como objetivos de diseno declarados por el autor.

- Generacion de texto por continuacion: el modelo esta planteado como base causal, es decir, para continuar texto, no para seguir instrucciones.
- Cobertura multilingue ruso-ingles: objetivo de entrenamiento; no hay evidencia de calidad en ninguno de los dos idiomas.
- Exposicion a codigo: Python y C++ estan en el corpus previsto; Luau es un objetivo condicionado a la disponibilidad de datos.
- Tokens especiales de conversacion y de herramientas: la model card advierte que la presencia de estos tokens en el tokenizer no implica capacidad de seguir instrucciones ni de invocar herramientas o funciones.
- Razonamiento multi-paso y uso de agentes: no disponible; no declarado ni evaluado.
- Modo de pensamiento (thinking), vision o audio: no disponible; no contemplado en la arquitectura descrita.
- Ajuste posterior para tareas concretas: el uso previsto del modelo base es el fine-tuning, la continuacion de texto y la investigacion.

## Casos de uso

Todos los escenarios requieren que se publiquen los pesos; a dia de hoy son aplicaciones previstas, no ejecutables.

- Investigacion sobre entrenamiento desde cero: el proyecto documenta arquitectura, tokenizer y plan de entrenamiento, lo que permite reproducir o auditar decisiones de diseno en un modelo de 635M y comparar con alternativas preentrenadas.
- Fine-tuning supervisado para clasificacion o resumen en ruso: un modelo base con cobertura nativa de ruso es un punto de partida razonable para anadir una cabeza de clasificacion o ajustar con datos etiquetados propios, sin depender de modelos centrados en ingles.
- Adaptacion de dominio mediante preentrenamiento continuado: al tener un vocabulario BPE de 32.768 entradas y pesos inicializados desde cero, el modelo puede continuar su entrenamiento sobre corpus sectoriales (legal, medico, industrial) antes de cualquier ajuste supervisado.
- Generacion de codigo en Python y C++ tras ajuste especifico: el corpus objetivo incluye ambos lenguajes, por lo que tiene sentido como base para un modelo de autocompletado de codigo, siempre con revision y tests automatizados antes de integrarlo en un pipeline.
- Analisis de sesgos y evaluacion linguistica en ruso: un modelo base entrenado con un corpus documentado permite estudiar sesgos, cobertura lexica y comportamiento del tokenizer BPE sobre texto ruso e ingles.
- Experimentacion docente y prototipado de bajo coste: con 635M de parametros, el modelo cabe en GPUs de consumo, lo que lo hace util para ensenar el ciclo completo de preentrenamiento, tokenizacion e inferencia sin acceso a clústeres grandes.
- Evaluacion de eficiencia de GQA en modelos compactos: la configuracion de 24 cabezas de consulta frente a 4 de clave/valor permite medir en la practica el ahorro de memoria de la cache KV en comparacion con atencion multi-cabeza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado y que no existen resultados de perdida de validacion, perplejidad, razonamiento ni codigo. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros y de la configuracion declarada; no proceden de mediciones publicadas.

- Pesos en FP16/BF16: aproximadamente 1,27 GB (635,5 millones de parametros por 2 bytes).
- Pesos en FP32: aproximadamente 2,54 GB.
- Cuantizacion hipotetica a INT8: alrededor de 0,64 GB; a INT4, alrededor de 0,32 GB. No existen pesos cuantizados publicados ni se ha confirmado que la arquitectura sea convertible.
- Cache KV: con 24 capas, 4 cabezas KV de 64 dimensiones y FP16, cada token ocupa unos 24 KB; a la maxima longitud configurada de 2.048 tokens supone unos 48-50 MB.
- Huella total en inferencia FP16 con contexto lleno: del orden de 1,5 GB incluyendo pesos, cache y sobrecarga del runtime, dependiendo de la implementacion.
- GPU de consumo: cabe sin problema en cualquier GPU con 4 GB o mas de VRAM, incluidas RTX 3060, RTX 4060 Ti, RTX 4070 y RTX 4090. La NVIDIA T4 de 16 GB se ha usado unicamente para pruebas preliminares de compatibilidad, memoria y reanudacion de checkpoint.
- GPU de centro de datos: A100 y H100 estan claramente sobredimensionadas para la inferencia de un modelo de 635M; tendrian sentido para el entrenamiento principal, cuya GPU final aun no se ha seleccionado.
- Despliegue: no se ha verificado la compatibilidad con Transformers, vLLM, llama.cpp, Ollama, TGI ni con proveedores de inferencia. El autor indica que no debe asumirse ninguna compatibilidad antes de que se pruebe y documente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de Clyx 0.3-NM-BASE proceden de la model card; los de los modelos de referencia son valores publicados habitualmente que conviene verificar en sus fichas oficiales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Pesos disponibles | Benchmarks |
|---|---|---|---|---|---|---|
| Clyx 0.3-NM-BASE | 635,5M (objetivo de diseno) | 2.048 tokens configurados, sin validar | Ruso, ingles (objetivo) | apache-2.0 en metadatos; pendiente de confirmar para los pesos | No | No publicados |
| Clyx 0.2-115.67M-BASE | 115,67M | no disponible | no disponible | no disponible en la informacion proporcionada | Si (version anterior del mismo proyecto) | no disponible |
| Qwen2.5-0.5B | 494M | 32.768 tokens (ampliable con YaRN) | Multilingue, con ingles y chino como ejes | Apache-2.0 | Si | Publicados por el autor |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Principalmente ingles | Apache-2.0 | Si | Publicados por el autor |
| SmolLM2-360M | 362M | 8.192 tokens | Principalmente ingles | Apache-2.0 | Si | Publicados por el autor |

La comparacion de rendimiento con Clyx no es posible: no hay benchmarks, ni pesos, ni checkpoint intermedio del que extraer perplejidad. La diferencia relevante hoy es de disponibilidad y madurez, no de calidad.

## Limitaciones y advertencias

- Ausencia total de pesos: no existe ningun checkpoint descargable. Cualquier intento de uso en inferencia es inviable en la fecha de esta ficha.
- Sin evaluacion: no hay perdida de validacion, perplejidad ni resultados en tareas de razonamiento o codigo. Un mayor numero de parametros no implica mejor calidad.
- Estado en desarrollo: la propia model card advierte que la arquitectura, los datos y la configuracion de entrenamiento pueden cambiar tras las pruebas de GPU.
- Cobertura linguistica no verificada: el ruso, el ingles y los lenguajes de programacion son objetivos de entrenamiento, no capacidades demostradas. Luau es un objetivo condicionado a la disponibilidad de datos.
- Modelo base, no asistente: no sigue instrucciones y no usa herramientas. La presencia de tokens especiales de conversacion o de herramientas en el tokenizer no otorga esas capacidades.
- Riesgo de alucinacion, sesgo y contenido ofensivo: no evaluado. La model card anticipa posibles errores factuales, sesgos, contenido ofensivo y material memorizado.
- Codigo generado potencialmente incorrecto o inseguro: requerira revision y pruebas antes de cualquier uso real.
- Licencia: los metadatos de Hugging Face declaran apache-2.0, pero el texto del autor senala que la licencia de los pesos futuros se confirmara antes del lanzamiento. Para uso comercial debe esperarse la confirmacion explicita.
- Sin validacion de contexto: los 2.048 tokens de capacidad configurada no estan respaldados por entrenamiento; la longitud inicial de preentrenamiento es de 1.024 tokens.
- Sin aptitud para produccion ni para decisiones de alto impacto: no establecida.
- Compatibilidad no garantizada: no debe asumirse que funcione con Transformers, vLLM, llama.cpp, Ollama o cualquier proveedor de inferencia.
- Datos de entrenamiento sin publicar: no hay identificadores de dataset, revisiones fijadas, filtros ni recuento de tokens consumidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntropic-clx/Clyx_0.3-NM-BASE
- Version anterior del proyecto (Clyx 0.2, 115,67M BASE): https://huggingface.co/syntropic-clx/Clyx_0.2-115.67M-BASE
- Paper, repositorio de codigo, blog o demo: no disponible
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo. Los unicos resultados obtenidos corresponden a servicios de reserva de billetes de tren y no guardan relacion con el proyecto Clyx, por lo que no se incluyen.
