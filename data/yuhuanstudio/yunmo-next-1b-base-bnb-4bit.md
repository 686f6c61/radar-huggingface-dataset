# yuhuanstudio/Yunmo-Next-1B-Base-bnb-4bit

## Resumen

Yunmo-Next-1B-Base-bnb-4bit es la version cuantizada a 4 bits (formato NF4 de bitsandbytes con doble cuantizacion) del modelo base Yunmo-Next-1B-Base, desarrollado por yuhuanstudio. Se trata de un checkpoint de investigacion preentrenado (no ajustado por instrucciones) de aproximadamente 1.008 millones de parametros, orientado a generacion de texto en chino (incluido chino tradicional) e ingles. Su relevancia radica en que reduce el peso del modelo a 0,62 GB manteniendo el calculo en BF16, lo que permite ejecutarlo en GPUs de consumo con muy poca memoria.

El modelo emplea una arquitectura denominada por el autor como `yunmo_next`, con un mecanismo de atencion etiquetado como `kimi-delta-attention` y dependencia de la libreria `flash-linear-attention`. Requiere `trust_remote_code=True` y una version de transformers del rango 5.14 a 6.0. La ficha del autor lo describe explicitamente como un checkpoint de investigacion: rinde al nivel del azar en preguntas de conocimiento de opcion multiple, comete errores factuales con frecuencia, puede repetirse hasta agotar el limite de tokens y no tiene ajuste de seguridad.

La cuantizacion afecta a las 645 capas lineales del modelo, mientras que la capa de embedding/salida atada, las normalizaciones, las convoluciones y el router se mantienen en BF16. La perdida de calidad medida es pequena en terminos de bits por byte sobre articulos de Wikipedia en chino, pero el coste en velocidad es notable: la decodificacion eager de bitsandbytes ronda los 140 ms por token en una RTX 4070 Ti, frente a unos 11 ms en BF16 con CUDA graphs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `yunmo_next` (transformers, `custom_code`), con `kimi-delta-attention` |
| Parametros totales | 1.008.058.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantizacion (bitsandbytes), calculo en BF16; 645 de 645 capas lineales cuantizadas |
| Idiomas soportados | zh (incluido chino tradicional), en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado 4-bit, repo de 0,6 GB) |

## Arquitectura y entrenamiento

La arquitectura se identifica como `yunmo_next`, un transformer con un mecanismo de atencion propio etiquetado como `kimi-delta-attention`, que requiere la libreria `flash-linear-attention==0.5.2`. El modelo incluye un router y capas convolucionales, lo que sugiere un diseno hibrido mas alla de un transformer denso convencional; la model card no detalla la composicion exacta de esas capas. El checkpoint es la version preentrenada, sin ajuste por instrucciones, y no se publican en la informacion disponible datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica documentada de esta variante es la cuantizacion: pesos en NF4 con doble cuantizacion, manteniendo en BF16 la capa de embedding/salida atada, las normalizaciones, las convoluciones y el router. La evaluacion de calidad reportada es de 0,9246 bits por byte sobre 3.754 articulos de Wikipedia en chino creados despues del 2026-10-01, frente a 0,9178 en BF16 (una diferencia de +0,0067). El autor advierte que el objetivo es ahorrar memoria, no ganar velocidad, ya que el bucle de decodificacion eager de bitsandbytes es sustancialmente mas lento que BF16 con CUDA graphs.

## Capacidades

- Generacion de texto autoregresiva en chino (incluido chino tradicional) e ingles.
- Modelo base preentrenado: completa texto y continua secuencias, pero no esta ajustado para seguir instrucciones.
- Capacidad de razonamiento y conocimiento factual muy limitada: el autor indica rendimiento al nivel del azar en opcion multiple de conocimiento.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a zh y en segun los metadatos.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre cuantizacion: comparar la calidad de la salida NF4 frente al checkpoint BF16 usando la metrica de bits por byte sobre corpus de chino, como hace el propio autor con Wikipedia.
- Experimentacion academica con arquitecturas de atencion alternativas: probar el mecanismo `kimi-delta-attention` y el diseno `yunmo_next` en entornos con recursos limitados.
- Pruebas de infraestructura de despliegue: validar pipelines con `trust_remote_code`, `flash-linear-attention` y bitsandbytes en versiones concretas de transformers antes de escalar a modelos mayores.
- Generacion de texto en chino para tareas de continuacion de secuencia en prototipos, asumiendo la baja calidad factual y el riesgo de repeticion.
- Benchmarking de latencia y memoria: medir el coste real de la decodificacion eager de bitsandbytes (unos 140 ms por token en RTX 4070 Ti) frente a alternativas BF16.
- Docencia y demostraciones: ejecutar un modelo de ~1B en una GPU de consumo con solo 0,62 GB de pesos para ilustrar tecnicas de cuantizacion de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado es la metrica de compresion de 0,9246 bits por byte en NF4 frente a 0,9178 en BF16 sobre 3.754 articulos de Wikipedia en chino, y la latencia de aproximadamente 140 ms por token en una RTX 4070 Ti (frente a unos 11 ms en BF16 con CUDA graphs para el modelo Instruct en el mismo formato).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 0,62 GB; con overhead de activaciones, contexto y calculo en BF16, se puede ejecutar en GPUs con 4 GB o menos de VRAM.
- GPU recomendadas: cualquier GPU con soporte de bitsandbytes y BF16; el autor cita una RTX 4070 Ti para sus mediciones.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: transformers (>=5.14,<6) con `trust_remote_code=True`, bitsandbytes y `flash-linear-attention==0.5.2`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 140 ms por token en RTX 4070 Ti con el bucle eager de bitsandbytes; el autor recomienda no usarlo por velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Yunmo-Next-1B-Base-bnb-4bit | 1,008 M | no disponible | NF4 4-bit | Apache-2.0 | Checkpoint de investigacion, chino/ingles |
| Yunmo-Next-1B-Base (BF16) | 1,008 M | no disponible | BF16 | Apache-2.0 | Version completa, mas rapida con CUDA graphs |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable.
- Rendimiento al nivel del azar en preguntas de conocimiento de opcion multiple y errores factuales frecuentes.
- Tendencia a repetirse hasta agotar el limite de tokens.
- Sin ajuste de seguridad: puede generar contenido inapropiado o danino.
- Sesgos conocidos: no documentados en la informacion disponible.
- Cobertura limitada a chino e ingles; no se garantiza calidad en otros idiomas.
- Longitud de contexto no especificada.
- Penalizacion de velocidad por la decodificacion eager de bitsandbytes (unos 140 ms por token en RTX 4070 Ti).
- Dependencia de versiones concretas de librerias (`transformers>=5.14,<6`, `flash-linear-attention==0.5.2`) y de `trust_remote_code=True`, lo que implica ejecutar codigo del autor.
- Licencia Apache-2.0 permite uso comercial, pero el estado de investigacion del modelo desaconseja su uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base-bnb-4bit
- Modelo base (BF16): https://huggingface.co/yuhuanstudio/Yunmo-Next-1B-Base
- Libreria flash-linear-attention: no disponible enlace directo en la informacion proporcionada
- Paper, blog, repositorio o demo: no disponible
