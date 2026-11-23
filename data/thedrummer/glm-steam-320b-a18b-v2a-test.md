# TheDrummer/GLM-Steam-320B-A18B-v2a-TEST

## Resumen

GLM-Steam-320B-A18B-v2a-TEST es un modelo de lenguaje de gran escala publicado por el usuario TheDrummer en Hugging Face bajo el identificador `TheDrummer/GLM-Steam-320B-A18B-v2a-TEST`. Por el nombre y la etiqueta `glm5_next`, se trata de un derivado o ajuste fino de la familia GLM (Zhipu AI), con una arquitectura de mezcla de expertos (MoE) que combina 321.323.031.390 parametros totales con aproximadamente 18 mil millones de parametros activos por token (según la convención de nomenclatura "A18B"). El sufijo "TEST" y "v2a" sugieren una publicacion experimental o de prueba, no una version estable.

El modelo resuelve el problema de ejecutar inferencia de alta capacidad con un coste computacional por token relativamente bajo gracias a su naturaleza MoE: solo se activa una fraccion de los 320B parametros en cada paso, lo que permite desplegar un modelo de clase frontier con requisitos de computo mas moderados que un denso equivalente. Es relevante ahora porque representa el patron habitual de la comunidad de publicar ajustes y variantes sobre modelos base abiertos de gran tamano, aunque en este caso concreto la informacion disponible es muy limitada.

La ficha se basa exclusivamente en los metadatos publicos de Hugging Face. No se dispone de model card, licencia, idiomas declarados ni resultados de benchmarks, por lo que muchos campos se marcan como "no disponible". El repositorio esta sujeto a acceso restringido (gated) y requiere aceptar condiciones en la plataforma antes de descargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, familia GLM (tag `glm5_next`); detalles no disponibles |
| Parametros totales | 321.323.031.390 (~321B) |
| Parametros activos | ~18B (inferido de la nomenclatura "A18B"; no confirmado en model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 642,7 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Fecha de creacion | 2026-11-23 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

La etiqueta `glm5_next` y la estructura de parametros (321B totales, ~18B activos) apuntan a una arquitectura de mezcla de expertos basada en la familia GLM de Zhipu AI, donde cada token activa un subconjunto de expertos en lugar de recorrer toda la red. Este diseno reduce el coste de inferencia por token frente a un modelo denso del mismo tamano total, a cambio de un mayor consumo de memoria para almacenar todos los expertos. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento (top-k), el numero de capas ni la dimension oculta.

Tampoco se han publicado datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporción de codigo o multilingue), ni sobre si hubo fases de alineacion como RLHF, DPO o instruccion tuning. El sufijo "v2a" sugiere una segunda iteracion o variante, y "TEST" indica caracter experimental. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos SSM.

## Capacidades

- Generacion de texto autoregresiva: capacidad base esperada en un modelo de esta familia, aunque no confirmada por model card.
- Razonamiento y conocimiento general: presumible por el tamano (321B totales), sin datos verificables.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Modo de razonamiento explicito: no disponible.

## Casos de uso

- Investigacion sobre arquitecturas MoE de gran escala: el modelo permite estudiar el comportamiento de un MoE de ~321B con ~18B activos, util para analisis de enrutamiento y eficiencia, siempre que se acepten las condiciones de acceso.
- Experimentacion con ajuste fino sobre modelos base GLM: al ser un derivado de la familia GLM, sirve como punto de partida para probar tecnicas de fine-tuning o destilacion, aunque el estado "TEST" desaconseja usarlo como base de produccion.
- Evaluacion comparativa de variantes comunitarias: util para contrastar el rendimiento de ajustes comunitarios frente al modelo base original de Zhipu AI en tareas controladas.
- Despliegue en infraestructura con multiples GPU: sus ~321B parametros en safetensors exigen sharding en varios aceleradores; encaja en entornos de investigacion con clústeres de A100/H100.
- Reproduccion de pipelines de inferencia MoE: sirve para validar configuraciones de vLLM o TGI con modelos de gran tamano y enrutamiento disperso.
- Pruebas de cuantizacion a gran escala: el tamano del repo permite experimentar con tecnicas de cuantizacion (aunque no se publican variantes oficiales), midiendo el impacto en calidad y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 640 GB solo para pesos, mas overhead de activaciones y KV cache; requiere sharding en multiples GPU.
- VRAM estimada en cuantizacion de 8 bits: en torno a 320 GB; en 4 bits, en torno a 160 GB (estimaciones teoricas, no verificadas porque no se publican variantes cuantizadas).
- GPU recomendadas: clústeres de NVIDIA H100 (80 GB) o A100 (80 GB) en configuracion multi-GPU (del orden de 8-16 unidades segun precision); no cabe en una sola GPU de datacenter de 80 GB en BF16.
- GPU de consumo (RTX 4090, 24 GB): no cabe en ninguna configuracion practica, ni siquiera con cuantizacion agresiva, dado el tamano total de parametros.
- Opciones de despliegue: vLLM, TGI o SGLang con soporte MoE y tensor parallelism; llama.cpp solo seria viable con cuantizaciones muy agresivas y offloading a CPU/RAM, con latencia muy alta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-Steam-320B-A18B-v2a-TEST | ~321B | ~18B | no disponible | no disponible | Gated en HF |
| GLM-4.5 (Zhipu AI) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V3 (referencia MoE) | ~671B | ~37B | no disponible | no disponible | no disponible |
| Qwen3-235B-A22B (referencia MoE) | ~235B | ~22B | no disponible | no disponible | no disponible |

Nota: los modelos de comparacion se citan como referencias de categoria MoE de gran escala; los datos concretos no se han verificado en la informacion proporcionada y deben consultarse en sus fichas oficiales.

## Limitaciones y advertencias

- Estado experimental: el sufijo "TEST" y la ausencia de model card indican que no es una version estable ni validada para produccion.
- Licencia no declarada: no se puede confirmar si permite uso comercial; es imprescindible verificar las condiciones antes de cualquier despliegue.
- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Sin informacion sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de evaluacion no se puede cuantificar.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingue o conversaciones largas.
- Sin benchmarks publicados: no hay evidencia de rendimiento frente a alternativas.
- Requisitos de hardware muy elevados: ~642 GB en safetensors y cientos de GB de VRAM en BF16, lo que limita su uso a infraestructura de investigacion.
- Posible inestabilidad por ser un ajuste comunitario: al no ser un modelo oficial de Zhipu AI, puede presentar degradaciones respecto al base.

## Enlaces

- Hugging Face: https://huggingface.co/TheDrummer/GLM-Steam-320B-A18B-v2a-TEST
- Perfil del autor: https://huggingface.co/TheDrummer
- Familia GLM (Zhipu AI) en Hugging Face: https://huggingface.co/zai-org (referencia de la familia base; no confirmado como origen directo)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
