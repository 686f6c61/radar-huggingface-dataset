# vanshnarula/gigpo-qwen2.5-1.5b-alfworld-baseline-seed0

## Resumen

GiGPO baseline es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct desarrollado por el usuario vanshnarula, orientado a la resolucion de tareas agenciales en el entorno ALFWorld. Se trata de un checkpoint intermedio del paso 150 de entrenamiento con la semilla 0, resultado de aplicar la tecnica GiGPO (Group-in-Group Policy Optimization, una variante de optimizacion por politica para agentes) sobre el modelo base de Alibaba. El modelo resuelve el problema de dotar a un LLM pequeno de capacidades de planificacion y ejecucion de acciones dentro de entornos simulados de texto, un escenario tipico de investigacion en agentes.

La relevancia de esta publicacion es fundamentalmente experimental: sirve como referencia reproducible (baseline) para comparar variantes de GiGPO y otras tecnicas de RL para agentes. El autor reporta un 93,0 % de exito en validacion sobre el split "seen" de ALFWorld, lo que indica un ajuste muy fuerte al conjunto de entrenamiento. No es un modelo pensado para produccion generalista, sino una pieza de investigacion.

Arquitectonicamente hereda todo del Qwen2.5-1.5B-Instruct: un transformer decoder-only de 1.543.714.304 parametros, con contexto nativo de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5) y licencia Apache 2.0. El checkpoint se distribuye en safetensors BF16 con un tamano de repositorio de 3,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV (caracteristicas de la familia Qwen2). Sobre esa base se aplica un ajuste fino con GiGPO, un algoritmo de optimizacion por politica en el espacio de grupos que agrupa trayectorias para estimar ventajas, pensado para tareas agenciales de horizonte largo donde las recompensas son dispersas. El entrenamiento se realiza sobre ALFWorld, un entorno textual de tareas domesticas (buscar objetos, moverlos, examinarlos) que requiere planificacion multi-paso y ejecucion de comandos.

El checkpoint publicado corresponde al paso 150 de entrenamiento con semilla 0, exportado en BF16 desde la revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306` del modelo base. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases adicionales de RLHF o DPO mas alla del propio GiGPO. La unica metrica reportada es el exito en validacion del 93,0 % sobre el split "seen" de ALFWorld, es decir, sobre tareas vistas durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Planificacion y ejecucion de acciones en entornos textuales tipo ALFWorld: navegacion entre habitaciones, busqueda de objetos, manipulacion (coger, dejar, examinar, calentar, enfriar, limpiar).
- Razonamiento multi-paso orientado a objetivos dentro de un episodio agencial.
- Soporte de formato conversacional (chat template de Qwen2.5), lo que permite integrarlo en pipelines de agentes que usan mensajes de sistema, usuario y asistente.
- Capacidades multilingues: no confirmadas para este checkpoint concreto; dependen del modelo base y no se documentan en la model card.
- Tool calling / function calling: no documentado especificamente para este checkpoint; el modelo base lo soporta, pero el ajuste con GiGPO puede haber alterado ese comportamiento.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: sirve como baseline reproducible (semilla 0, paso 150) para comparar variantes de GiGPO, PPO u otros algoritmos en ALFWorld. Es su uso principal y el motivo de su publicacion.
- Evaluacion de agentes en entornos textuales: permite medir la tasa de exito de un agente entrenado con RL frente a agentes basados en prompting sobre el mismo modelo base, aislando el efecto del ajuste.
- Reproduccion de experimentos: al fijar semilla y paso, facilita la verificacion de resultados en papers o tesis sobre optimizacion de politicas para LLM.
- Generacion de trayectorias sinteticas para ALFWorld: el modelo puede producir secuencias de acciones etiquetadas con exito o fracaso, utiles para entrenar modelos de recompensa o para data augmentation.
- Estudio de sobreajuste en RL para agentes: con un 93,0 % en el split "seen", es un caso de estudio util para analizar la brecha entre tareas vistas y no vistas.
- Prototipado de asistentes de tareas domesticas simuladas: en entornos de investigacion (no produccion) se puede usar para validar la viabilidad de un agente de 1.5B parametros antes de escalar a modelos mayores.
- Docencia y demos de agentes: su tamano reducido permite ejecutarlo en hardware modesto para clases o talleres sobre RL y agentes.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ALFWorld (split seen, validacion) | 93,0 % de exito | Reportado por el autor; corresponde al paso 150, semilla 0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. Tampoco se ofrece comparacion con otros checkpoints del mismo experimento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB para pesos; en 4 bits, en torno a 0,8-1 GB, mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en datacenter, A100, H100 o L4 sin problema.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 8 GB o mas, e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria nativa del repo), vLLM, TGI (el repo esta marcado como `endpoints_compatible` y `text-generation-inference`), llama.cpp y Ollama previa conversion a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GiGPO Qwen2.5-1.5B ALFWorld (este) | 1,54 B | no disponible (base: 32.768) | 93,0 % en ALFWorld seen | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens | No evaluado en ALFWorld en la informacion disponible | Apache 2.0 | Hugging Face |
| Otros checkpoints GiGPO del mismo experimento | 1,54 B | no disponible | no disponible | Apache 2.0 | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoria (por ejemplo, agentes basados en Llama 3.2 1B o Gemma 2 2B ajustados para ALFWorld) en la informacion proporcionada.

## Limitaciones y advertencias

- Sobreajuste al split "seen": el 93,0 % de exito se mide sobre tareas vistas durante el entrenamiento; el rendimiento en tareas no vistas (split "unseen") no se reporta y previsiblemente sera muy inferior.
- Especializacion estrecha: el ajuste con GiGPO sobre ALFWorld puede degradar capacidades generales del modelo base (conversacion abierta, codigo, matematicas) que no se han re-evaluado.
- Riesgo de alucinacion: como todo LLM, puede generar acciones o comandos inexistentes en el entorno; en ALFWorld esto se traduce en acciones invalidas.
- Idiomas: no se documenta el soporte multilingue de este checkpoint; el ajuste se ha hecho presumiblemente en ingles (ALFWorld es un entorno en ingles).
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero al ser un checkpoint de investigacion con un dominio tan restringido, su valor comercial es practicamente nulo.
- Sin garantias de calidad: es un checkpoint intermedio (paso 150) de un experimento de investigacion, no una version final pulida.
- Ausencia de documentacion: no hay informacion sobre sesgos, datos de entrenamiento detallados ni evaluaciones de seguridad.
- Fecha de creacion inusual (2026-11-25): conviene verificar la procedencia y vigencia del repositorio antes de usarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnarula/gigpo-qwen2.5-1.5b-alfworld-baseline-seed0
- Repositorio del experimento: https://github.com/secureswim/gigpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
