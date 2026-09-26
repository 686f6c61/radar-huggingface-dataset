# StefanoBalocco/Ling-3.0-Tiny-DSpark-GGUF

## Resumen

Ling-3.0-Tiny-DSpark-GGUF es una conversion a formato GGUF y un conjunto de cuantizaciones del modelo borrador (draft) jayyun98/Ling-3.0-Tiny-DSpark, realizada por StefanoBalocco con llama.cpp. No es un modelo autonomo: se trata de un modelo de borrador disenado para la decodificacion especulativa (speculative decoding) junto al modelo objetivo Ling-3.0-Tiny de inclusionAI. Su funcion es proponer secuencias de tokens candidatas que el modelo objetivo verifica, de modo que se reduce el numero de pasos de decodificacion necesarios y se acelera la inferencia.

El modelo cuenta con unos 274.217.729 parametros (aproximadamente 274 M), lo que lo situa en la gama ultra-ligera y permite almacenarlo y ejecutarlo con un coste de memoria minimo. El repositorio ocupa 1,4 GB e incluye variantes en BF16, Q8_0, Q5_0, Q4_0, Q2_0, TQ2_0 y TQ1_0. La variante BF16 conserva los pesos originales en BF16 dentro de GGUF y puede servir como fuente para generar cuantizaciones adicionales.

Su relevancia actual es practica: permite desplegar el modelo objetivo Ling-3.0-Tiny con soporte de decodificacion especulativa `draft-dspark` de llama.cpp en hardware modesto, mejorando la latencia sin necesidad de recurrir a GPUs de gama alta. Al publicarse exclusivamente como modelo borrador, el valor anadido esta en el binomio draft + target, no en su uso aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificacion especulativa; base transformer segun el modelo origen) |
| Parametros totales | 274.217.729 (~274 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_0, Q4_0, Q2_0, TQ2_0, TQ1_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El modelo es una conversion del original jayyun98/Ling-3.0-Tiny-DSpark, que a su vez deriva del ecosistema Ling-3.0-Tiny de inclusionAI. Los pesos cuantizados se han generado con llama.cpp y se distribuyen en siete variantes de precision.

La innovacion funcional del modelo no reside en la arquitectura, sino en su papel dentro del esquema de decodificacion especulativa `draft-dspark` de llama.cpp. En este esquema, el modelo borrador propone varios tokens por paso y el modelo objetivo valida cuales se aceptan, de forma que las secuencias aceptadas se generan en un unico paso de verificacion. Su utilidad depende de la tasa de aceptacion que consiga frente al modelo objetivo Ling-3.0-Tiny.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: el modelo propone continuaciones que el modelo objetivo valida.
- Aceleracion de inferencia: reduce el numero de pasos de decodificacion del modelo objetivo cuando aumenta la tasa de aceptacion.
- Integracion con llama.cpp mediante el soporte `draft-dspark` de decodificacion especulativa.
- Ejecucion en hardware de bajos recursos por su tamano reducido (~274 M de parametros).
- No esta pensado para uso autonomo: no debe emplearse como modelo conversacional o de generacion final.
- Soporte de cuantizacion en multiples niveles, incluidos formatos ternarios (TQ2_0, TQ1_0).
- Capacidades multilingues: no disponibles.
- Tool calling, agentes o vision: no disponibles.

## Casos de uso

- Aceleracion de la inferencia de Ling-3.0-Tiny con decodificacion especulativa: se carga este modelo borrador junto al modelo objetivo en llama.cpp y se activa `draft-dspark`, de forma que cada paso de verificacion puede producir varios tokens aceptados.
- Despliegue local en hardware de consumo: al ocupar unas pocas centenas de MB, el borrador cabe junto al modelo objetivo en GPUs con poca VRAM (por ejemplo, 8-12 GB), permitiendo servir Ling-3.0-Tiny en equipos de sobremesa.
- Servicios de chat de baja latencia: la decodificacion especulativa reduce el tiempo por token percibido, lo que resulta adecuado para aplicaciones interactivas donde la respuesta debe empezar a generarse cuanto antes.
- Generacion por lotes (batch) en servidores economicos: al disminuir los pasos de decodificacion, se puede aumentar el throughput del modelo objetivo en entornos con recursos limitados.
- Evaluacion y benchmarking de decodificacion especulativa: sirve para medir tasas de aceptacion, speedup y comportamiento de las distintas cuantizaciones frente al modelo objetivo.
- Investigacion sobre modelos borrador: permite experimentar con tecnicas de drafting y comparar el efecto de la precision (BF16 frente a Q4_0, TQ1_0, etc.) en la tasa de aceptacion.
- Integracion en pipelines de inferencia basados en llama.cpp: al ser formato GGUF nativo, se incorpora sin conversiones adicionales a herramientas que ya usen esta libreria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas especificas de decodificacion especulativa (tasa de aceptacion, speedup frente a decodificacion estandar) para este modelo o sus cuantizaciones.

## Requisitos de hardware

- Naturaleza del modelo: es un borrador que debe ejecutarse simultaneamente con el modelo objetivo Ling-3.0-Tiny, por lo que la VRAM total es la suma de ambos.
- VRAM estimada del borrador por variante (calculo aproximado a partir de 274,2 M de parametros; no confirmado por el autor):

| Variante | Precision aproximada | Tamano estimado de pesos |
|---|---|---|
| BF16 | 16 bits | ~549 MB |
| Q8_0 | ~8,5 bits | ~291 MB |
| Q5_0 | ~5,5 bits | ~188 MB |
| Q4_0 | ~4,5 bits | ~154 MB |
| Q2_0 | ~2,6 bits | ~89 MB |
| TQ2_0 | ~2,06 bits | ~71 MB |
| TQ1_0 | ~1,69 bits | ~58 MB |

- GPU recomendadas: no especificadas por el autor. Por el tamano del borrador, cualquier GPU capaz de ejecutar el modelo objetivo es suficiente; el borrador en si cabe incluso en CPU.
- Cabe en GPU de consumo: si, el borrador por si solo cabe en cualquier GPU consumer actual (RTX 3060, RTX 4090, etc.); la limitacion real la marca el modelo objetivo.
- Opciones de despliegue: llama.cpp (requerido para el soporte `draft-dspark`). Otras opciones como vLLM, TGI u Ollama no estan confirmadas para este flujo de decodificacion especulativa concreta.
- Latencia y throughput: no disponibles. El beneficio depende de la tasa de aceptacion del borrador respecto al modelo objetivo, dato que no se proporciona.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos borrador comparables en la documentacion facilitada. A modo de referencia interna, se comparan las variantes de cuantizacion del propio repositorio, ya que es el unico eje de comparacion con datos disponibles:

| Variante | Tamano estimado de pesos | Uso previsto |
|---|---|---|
| BF16 | ~549 MB | Fidelidad maxima; fuente para nuevas cuantizaciones |
| Q8_0 | ~291 MB | Alta fidelidad con menor espacio |
| Q5_0 | ~188 MB | Compromiso calidad/tamano |
| Q4_0 | ~154 MB | Uso general en recursos limitados |
| Q2_0 | ~89 MB | Maxima compresion con perdida notable |
| TQ2_0 | ~71 MB | Cuantizacion ternaria, muy baja precision |
| TQ1_0 | ~58 MB | Cuantizacion ternaria extrema |

Modelos alternativos de la misma categoria (otros modelos borrador para decodificacion especulativa en llama.cpp): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: la propia model card indica explicitamente que es un modelo borrador y que no debe usarse de forma independiente.
- Requiere el modelo objetivo: solo es funcional junto a Ling-3.0-Tiny y con el soporte `draft-dspark` de llama.cpp.
- Dependencia de version de llama.cpp: la decodificacion especulativa con este esquema requiere una version de llama.cpp que incluya dicho soporte; versiones antiguas no podran usarlo.
- Licencia no disponible: al no indicarse licencia, no puede confirmarse la legalidad del uso comercial; conviene verificar la licencia del modelo original jayyun98/Ling-3.0-Tiny-DSpark y de Ling-3.0-Tiny antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no aplica de forma directa porque las propuestas del borrador son verificadas por el modelo objetivo, pero una tasa de aceptacion baja reduce el speedup y puede anular el beneficio.
- Efecto de la cuantizacion: las variantes de muy baja precision (Q2_0, TQ2_0, TQ1_0) pueden degradar la tasa de aceptacion y, con ello, el rendimiento efectivo; no se han publicado mediciones al respecto.
- Idiomas soportados no declarados: la cobertura linguistica del borrador no esta documentada.
- Sin datos de rendimiento: no hay benchmarks, tasas de aceptacion ni cifras de speedup publicadas, por lo que el beneficio real debe medirse en cada despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/StefanoBalocco/Ling-3.0-Tiny-DSpark-GGUF
- Modelo base (draft): https://huggingface.co/jayyun98/Ling-3.0-Tiny-DSpark
- Modelo objetivo Ling-3.0-Tiny: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- llama.cpp: https://github.com/ggml-org/llama.cpp
