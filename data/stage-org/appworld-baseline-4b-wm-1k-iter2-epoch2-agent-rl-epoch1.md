# Stage-org/appworld-baseline-4b-wm-1k-iter2-epoch2-agent-rl-epoch1

## Resumen

Stage-org/appworld-baseline-4b-wm-1k-iter2-epoch2-agent-rl-epoch1 es un modelo de lenguaje de aproximadamente 4.540 millones de parametros publicado por la organizacion Stage-org en HuggingFace. El nombre del repositorio indica que se trata de un checkpoint intermedio de un pipeline de entrenamiento por refuerzo (RL) orientado a agentes: la cadena "appworld-baseline-4b" sugiere una base de 4B parametros evaluada sobre AppWorld, un benchmark de interaccion con APIs y entornos de aplicaciones; "wm-1k-iter2-epoch2" apunta a un modelo del mundo (world model) entrenado durante 1.000 iteraciones, en su segunda iteracion y segunda epoca; y "agent-rl-epoch1" corresponde a una primera epoca de ajuste por refuerzo especifico para comportamiento agentico.

El tag de arquitectura declarado es `qwen3_5`, lo que situa al modelo en la familia Qwen 3.5, aunque no se ha publicado la configuracion exacta (numero de capas, dimension oculta, cabezas de atencion ni longitud de contexto). El repositorio ocupa 9,1 GB y almacena los pesos en safetensors, un tamano coherente con un checkpoint de 4,54B parametros en precision bf16 (4,54e9 x 2 bytes ≈ 9,08 GB), sin que existan versiones cuantizadas publicadas.

Su relevancia es doble. Por un lado, es un ejemplo poco habitual de checkpoint publico de un ciclo de RL para agentes sobre un benchmark concreto (AppWorld), lo que permite inspeccionar como evoluciona un modelo base de 4B tras fases de world modeling y agent RL. Por otro, su escasa traccion (8 descargas, 0 likes en el momento de la consulta) y la ausencia de model card, licencia e idiomas declarados lo convierten en un artefacto de investigacion mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag `qwen3_5` indica la familia Qwen 3.5 (transformer decoder-only) |
| Parametros totales | 4.539.265.536 (≈4,54B), segun los tensores safetensors |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repo solo contiene pesos safetensors (presumiblemente bf16, ~9,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna mas alla del tag `qwen3_5`, que asocia el checkpoint a la familia Qwen 3.5. Esto implica, con alta probabilidad, un transformer decoder-only con atencion por grupos de consultas (GQA) y normalizacion RMSNorm, pero no hay datos verificables sobre numero de capas, dimension del modelo, vocabulario ni longitud de contexto soportada. Tampoco hay indicios de que se trate de una arquitectura MoE, SSM o hibrida; con 4,54B parametros totales y 9,1 GB de pesos, todo apunta a un modelo denso en bf16.

El nombre del repositorio describe, en cambio, un pipeline de post-entrenamiento en varias fases: un baseline de 4B sobre AppWorld, despues una fase de world modeling de 1.000 iteraciones ("wm-1k-iter") repetida durante dos epocas en una segunda iteracion ("iter2-epoch2"), y finalmente una epoca de RL para agentes ("agent-rl-epoch1"). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si la fase de RL empleo PPO, GRPO, DPO u otra tecnica. Tampoco hay informacion sobre fases de instruccion, RLHF general o cualquier innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada del modelo base de la familia Qwen 3.5, aunque no hay evaluacion publicada que la cuantifique.
- Comportamiento agentico: el sufijo "agent-rl" indica un ajuste por refuerzo orientado a tareas de agente, presumiblemente interaccion multi-turno con herramientas y APIs.
- Interaccion con entornos tipo AppWorld: el nombre del repo sugiere entrenamiento sobre tareas de uso de aplicaciones y llamadas a funciones, aunque no se documenta el formato exacto de tool calling soportado.
- Razonamiento multi-paso: inferido del pipeline de world modeling y RL para agentes; sin cifras publicadas.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Razonamiento matematico y generacion de codigo: no documentadas para este checkpoint concreto.

## Casos de uso

- Investigacion en RL para agentes: el checkpoint permite reproducir o continuar un ciclo de entrenamiento por refuerzo sobre AppWorld, comparando el comportamiento antes y despues de las fases de world modeling y agent RL.
- Analisis de evolucion de checkpoints: al ser un artefacto intermedio ("iter2-epoch2", "epoch1"), sirve para estudiar como cambia la politica del modelo a lo largo del entrenamiento y detectar degradacion o sobreajuste al benchmark.
- Evaluacion de modelos de 4B en tareas de uso de herramientas: se puede medir la tasa de exito en tareas de llamada a funciones y compararla con el modelo base sin RL.
- Prototipado de agentes sobre APIs en local: con 4,54B parametros y pesos de 9,1 GB, es viable desplegarlo en una GPU de consumo para experimentar con flujos agenticos sin coste de API.
- Generacion de datos sinteticos de trayectorias: un modelo ajustado con RL sobre entornos de aplicaciones puede emplearse para generar rollouts que alimenten un entrenamiento posterior o un sistema de evaluacion.
- Base para fine-tuning especifico de dominio: al ser un checkpoint de 4B con licencia no declarada, puede servir como punto de partida interno para ajustes supervisados en tareas de automatizacion, siempre que se aclare la licencia antes de un uso comercial.
- Docencia y demostraciones: permite mostrar en un entorno controlado como se comporta un modelo pequeno tras un pipeline de RL orientado a agentes, con requisitos de hardware asequibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card, tabla de evaluacion ni resultados de AppWorld, MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9-10 GB solo para los pesos, mas la memoria de la cache KV (dependiente de la longitud de contexto, que no esta documentada). Con contexto corto, un presupuesto de 12-14 GB es razonable.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 5-6 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 3-4 GB de pesos, aunque no se publican ficheros GGUF ni AWQ/GPTQ para este checkpoint, por lo que habria que generarlos.
- GPU recomendadas: cabe con holgura en una NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) e incluso en GPUs de 12 GB en bf16 con contexto reducido. Para despliegue en servidor, A100 40/80 GB, H100 o L40S estan sobredimensionadas para un modelo de este tamano salvo que se busque alto throughput con lotes grandes.
- Opciones de despliegue: al ser un safetensors de arquitectura Qwen 3.5, los candidatos naturales son vLLM, SGLang, TGI y Transformers para inferencia directa. llama.cpp y Ollama requieren conversion previa a GGUF, que no esta publicada.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo denso de 4,5B en bf16 sobre una RTX 4090 suele situarse en el rango de decenas a mas de cien tokens por segundo con lotes pequenos, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/appworld-baseline-4b-wm-1k-iter2-epoch2-agent-rl-epoch1 | 4,54B | No disponible | No disponible | Pesos safetensors en HuggingFace, 8 descargas |
| Qwen3-4B (familia base de referencia) | 4,0B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Ampliamente disponible, con versiones GGUF y cuantizadas |
| Llama 3.2 3B Instruct | 3,2B | 128.000 tokens | Licencia comunitaria de Llama | Ampliamente disponible, con versiones GGUF y cuantizadas |
| Phi-4-mini | 3,8B | 128.000 tokens | MIT | Ampliamente disponible |

La comparacion se limita a parametros, contexto y licencia, porque no existen resultados de benchmarks publicados para el checkpoint de Stage-org que permitan contrastar calidad. Los tres modelos alternativos cuentan con model cards completas, licencias explicitas y ecosistema de cuantizaciones, ventajas operativas claras frente a este repositorio.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, metodologia de evaluacion ni limitaciones conocidas.
- Licencia no declarada: no se puede asumir permiso para uso comercial, redistribucion o modificacion. Es imprescindible contactar con la organizacion antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce el soporte real mas alla del ingles en el que probablemente se entreno el benchmark AppWorld.
- Riesgo de sobreajuste al benchmark: el nombre indica un entrenamiento especifico sobre tareas de AppWorld, por lo que el rendimiento fuera de ese dominio puede degradarse notablemente respecto al modelo base.
- Riesgo de alucinacion: inherente a cualquier modelo de 4B, agravado por la falta de evaluacion publicada y por la naturaleza de las tareas agenticas, donde una llamada a API incorrecta puede tener efectos reales.
- Checkpoint intermedio: los sufijos de iteracion y epoca sugieren un artefacto no final; puede contener inestabilidades derivadas del proceso de RL.
- Contexto desconocido: sin la longitud de contexto declarada no se puede planificar el uso en conversaciones largas ni calcular con precision la memoria de la cache KV.
- Traccion minima: 8 descargas y 0 likes implican que practicamente no hay validacion independiente de su comportamiento.
- Sin cuantizaciones publicadas: desplegarlo en hardware limitado exige generar GGUF, AWQ o GPTQ por cuenta propia, con el riesgo de degradacion asociado.
- Reproducibilidad limitada: al no publicarse la receta de entrenamiento ni los datos, no es posible replicar los resultados ni auditar sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-org/appworld-baseline-4b-wm-1k-iter2-epoch2-agent-rl-epoch1
- AppWorld (benchmark de referencia mencionado en el nombre del modelo): no disponible en los resultados de busqueda proporcionados.
- Paper o blog de entrenamiento: no disponible.
- Repositorio de codigo: no disponible.
- Demo: no disponible.

Nota: las busquedas web realizadas devolvieron unicamente portales de ofertas de practicas (stage.fr, letudiant.fr, 1jeune1solution.gouv.fr, welcometothejungle.com), sin ninguna relacion con el modelo. No se ha encontrado documentacion adicional, paper ni repositorio asociado al checkpoint.
