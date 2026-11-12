# supernetworks/LFM3-1.7B-Ask-SPR-GGUF

## Resumen

LFM3-1.7B-Ask-SPR-GGUF es una version afinada y cuantizada del modelo LiquidAI/LFM3-1.7B, publicada por el usuario supernetworks. El autor ha aplicado un proceso de fine-tuning con SFT (supervised fine-tuning) y RL (reinforcement learning) sobre tareas de interfaz de usuario de Supernetworks, y posteriormente ha cuantizado los pesos a formato GGUF en la variante Q4_K_M. El resultado es un modelo conversacional especializado que da soporte a la funcionalidad "Ask SPR" de la interfaz del router SPR.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de Liquid AI y cuenta con aproximadamente 1.728 millones de parametros (1,73 mil millones). Se trata de un modelo de generacion de texto de proposito general que, tras el ajuste del autor, queda orientado a un dominio concreto de asistencia conversacional dentro de una interfaz de router. La distribucion se realiza exclusivamente en un unico archivo GGUF de 1.099.627.072 bytes (aproximadamente 1,1 GB), lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de esta ficha radica en que ejemplifica el patron de adaptacion de un modelo pequeno de codigo abierto a un caso de uso vertical mediante fine-tuning y cuantizacion, con una licencia heredada (LFM Open License v1.0) que condiciona el uso comercial. No se dispone de informacion publicada sobre idiomas soportados, benchmarks ni detalles del dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B de Liquid AI; no se detalla en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (1,73 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LFM3-1.7B en la documentacion proporcionada; la model card solo indica que se trata de un modelo de generacion de texto de Liquid AI. El proceso de adaptacion descrito por el autor consiste en un fine-tuning con SFT y RL sobre tareas de interfaz de usuario de Supernetworks, seguido de una cuantizacion a GGUF Q4_K_M. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como DPO o decodificacion especulativa.

El unico artefacto publicado es el archivo `LFM3-1.7B-Ask-SPR-Q4_K_M.gguf`, con tamano de 1.099.627.072 bytes y hash SHA-256 `f47d227f1b9e9fc5c27b388fe40cdf1b1a56384d7dc1fd72fa563107307b7a5f`. El repositorio completo ocupa 1,1 GB, coherente con la publicacion de una sola variante cuantizada.

## Capacidades

- Generacion de texto conversacional orientada a tareas de interfaz de usuario del router SPR.
- Asistencia dentro de la funcionalidad "Ask SPR" de la interfaz del router, segun declara el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia contextual en la interfaz del router SPR: el modelo se integra en la funcionalidad "Ask SPR" para responder consultas del usuario dentro de la propia interfaz, dado que fue ajustado especificamente con SFT y RL sobre tareas de UI de Supernetworks.
- Despliegue en entornos con recursos limitados: al distribuirse como un unico GGUF Q4_K_M de aproximadamente 1,1 GB, puede ejecutarse en CPUs y GPUs de gama baja mediante llama.cpp u Ollama, lo que lo hace adecuado para dispositivos de borde o estaciones de trabajo sin aceleradores dedicados.
- Prototipado rapido de asistentes conversacionales verticales: sirve como base para experimentar con fine-tuning adicional sobre dominios concretos, ya que parte de un modelo pequeno (1,73 mil millones de parametros) y de una licencia conocida.
- Evaluacion de tecnicas de cuantizacion: el repositorio permite comparar el comportamiento del modelo base frente a la variante Q4_K_M en tareas de UI, como referencia para pipelines de cuantizacion.
- Integracion en herramientas de linea de comandos o plugins de escritorio: el formato GGUF y el tamano reducido permiten embeberlo en utilidades locales que necesiten respuestas conversacionales sin conexion a servicios externos.
- Pruebas de concepto de asistentes para administracion de red: aunque el ajuste es especifico de SPR, el modelo puede emplearse como punto de partida para prototipos de ayuda contextual en paneles de administracion de routers, siempre que se valide su calidad en ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para los pesos en Q4_K_M, mas el overhead de la ventana de contexto y del runtime (estimacion orientativa; no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con 2-4 GB de VRAM libre deberia poder alojar los pesos, pero no se han publicado pruebas.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del archivo; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Ask-SPR-GGUF (este) | 1,73 mil millones | no disponible | GGUF Q4_K_M | LFM Open License v1.0 | Hugging Face (supernetworks) |
| LiquidAI/LFM3-1.7B (base) | 1,73 mil millones | no disponible | safetensors (presumiblemente) | LFM Open License v1.0 | Hugging Face (LiquidAI) |
| Alternativas de ~1-2B parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Modelo afinado para un dominio muy concreto (tareas de UI del router SPR); su rendimiento fuera de ese ambito no esta documentado y podria degradarse respecto al modelo base.
- No se han publicado evaluaciones de sesgo, alucinacion ni robustez; se desconoce su comportamiento en produccion.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano u otros idiomas.
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue comercial.
- Solo se publica una cuantizacion Q4_K_M; no hay variantes de mayor o menor precision para ajustar el equilibrio calidad/recursos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se detalla el dataset de SFT/RL ni el proceso de evaluacion del ajuste, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/supernetworks/LFM3-1.7B-Ask-SPR-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia (archivo en el repositorio): LICENSE (referenciado en la model card como `LICENSE`)
