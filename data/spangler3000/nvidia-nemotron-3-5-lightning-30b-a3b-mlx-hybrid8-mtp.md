# Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-hybrid8-mtp

## Resumen

Este repositorio contiene una conversión a MLX en precisión mixta del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por el usuario Spangler3000 como artefacto privado de validación (*validation candidate*). No es un modelo entrenado desde cero ni el artefacto oficial de Darkbloom: parte del checkpoint BF16 de NVIDIA identificado como `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` en la revisión `a9904d24`, y le aplica la regla estructural denominada *hybrid8*, que reasigna la precisión de cuantización por grupo de tensores.

La arquitectura es `nemotron_h`, de tipo híbrido: combina proyecciones de tipo Mamba con proyecciones de atención y una capa de mezcla de expertos (MoE), además de una cabecera de predicción multi-token (MTP) embebida. El checkpoint ocupa 19,06 GB repartidos en cuatro shards `safetensors` y declara 32.913.261.824 parámetros totales. La motivación declarada del autor es corregir una regresión de *tool calling* en modo sin razonamiento detectada en el artefacto de 4 bits publicado: elevar a Q8 las proyecciones Mamba y de atención recupera la llamada a herramienta en los casos donde el 4 bits puro respondía con un rechazo.

Su relevancia práctica es acotada y muy específica. Se trata de un candidato de validación marcado explícitamente como no cualificado para producción, que exige un proveedor Darkbloom con un parche de *parser* concreto para evitar la emisión de un `</think>` suelto. Interesa a quien despliegue Nemotron en Apple Silicon con MLX y necesite evaluar el compromiso entre precisión y fiabilidad de *tool calling* antes de promover un artefacto a un entorno servido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h: híbrida Mamba + atención con mezcla de expertos (MoE) y cabecera MTP embebida |
| Parametros totales | 32.913.261.824 (según safetensors del repositorio) |
| Parametros activos | Aproximadamente 3 000 millones según la nomenclatura A3B del nombre; no confirmado en la información proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta affine grupo 64: Q8 en proyecciones Mamba (`in_proj`, `out_proj`) y de atención (`q/k/v/o`); Q4 en expertos MoE (`switch_mlp.fc1/fc2`), expertos compartidos, embeddings y `lm_head`; sin cuantizar en routers, normalizaciones, `conv1d`, `A_log`, `dt_bias` y `D` |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (etiquetada como `license: other`) |
| Formato de pesos | safetensors para MLX, 4 shards; 19.059.764.358 bytes (19,06 GB) |
| Tamano del repositorio | 19,1 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (relación: cuantizado), revisión `a9904d24bcc1d289a1950fa9d2b978c47cf903b9` |
| Libreria de inferencia | mlx |
| Configuracion de generacion | temperature 1.0, top_p 0.95, do_sample true (heredada del vendor) |
| Estado de publicacion | candidato de validación privado, `publication_approved: false` |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. La arquitectura subyacente, `nemotron_h`, es híbrida: intercala proyecciones de tipo Mamba (*state space model*) con proyecciones de atención estándar (`q/k/v/o`) y una capa de expertos con enrutado (`switch_mlp`), a la que se añade una cabecera de predicción multi-token (MTP) embebida que el autor identifica como `nemotron_h_attention_moe`, versión 1. El checkpoint conserva el *chat template*, el tokenizador y el `generation_config.json` del modelo fuente sin modificaciones; el template de la revisión `a9904d24` es byte a byte idéntico al incluido aquí.

La innovación del artefacto es exclusivamente de cuantización. La regla *hybrid8* reparte la precisión por grupo estructural en lugar de aplicar una cuantización uniforme: sube a Q8 las 70 módulos de Mamba y atención (peso y escalas), mantiene en Q4 los expertos MoE, los expertos compartidos, los embeddings y el `lm_head`, y deja sin cuantizar los *router gates*, las normalizaciones, `conv1d`, `A_log`, `dt_bias` y `D`. La auditoría de bytes registrada indica 763 arrays en total, de los cuales 623 quedan sin cambios respecto al artefacto de 4 bits publicado y 140 cambian (los 70 módulos promocionados a Q8, con peso y escalas); todos los *router gates* y todos los arrays de la cabecera MTP son idénticos byte a byte al artefacto de 4 bits. El repositorio incluye un `conversion-receipt.json` con el hash del convertidor, las reglas del perfil, el hash de la configuración fuente y hashes f32 por tensor de cada tensor protegido. No se documenta en la información disponible ningún proceso de RLHF, DPO ni composición del dataset de entrenamiento original.

## Capacidades

- Generación de texto y uso conversacional, con *pipeline* declarado `text-generation`.
- *Tool calling* / *function calling*: es la capacidad central que el artefacto intenta reparar. En la validación del autor, la petición exacta de OpenRouter sobre el tiempo en Boston pasa de un rechazo 3/3 en el 4 bits publicado a llamada a herramienta 3/3 en este artefacto, en ambos modos de MTP.
- Modos de razonamiento conmutables: el modelo admite `enable_thinking=true` y `enable_thinking=false`; la regresión corregida afecta específicamente al modo sin razonamiento.
- Predicción multi-token (MTP): cabecera embebida, operativa en modo off y on. En la validación, las decisiones con MTP activado y desactivado fueron idénticas.
- Selección de herramientas con `tool_choice` en modo auto, required, named y none, tanto en *streaming* como sin *streaming*, según los controles de API registrados.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible; la información proporcionada no describe ninguna.
- Razonamiento matemático, generación de código y otras capacidades de propósito general: no disponible en la información proporcionada para este artefacto concreto; solo se documentan pruebas de selección de herramientas.

## Casos de uso

- Validación de agentes con *tool calling* antes de promover un artefacto a producción: el repositorio existe precisamente para comparar el comportamiento de selección de herramientas entre la cuantización uniforme a 4 bits y la mixta *hybrid8*, con casos de descubrimiento y *held-out*.
- Despliegue local en Apple Silicon para prototipado de asistentes conversacionales: al estar en formato MLX, se ejecuta en memoria unificada de equipos Mac con chip de la serie M, sin necesidad de GPU NVIDIA.
- Pruebas de regresión en *pipelines* de inferencia: el `conversion-receipt.json` y los hashes por tensor permiten verificar que un despliegue sirve exactamente los pesos auditados, útil en entornos con requisitos de trazabilidad.
- Investigación sobre el impacto de la precisión por grupo de tensores: el artefacto aísla el efecto de subir solo Mamba y atención a Q8, lo que sirve para estudiar qué componentes concentran la pérdida de calidad en una cuantización agresiva.
- Evaluación de decodificación especulativa con MTP en modelos híbridos: la cabecera MTP está presente y el autor reporta decisiones idénticas con MTP on y off, lo que permite medir el coste y el beneficio de activarla en la ruta de servicio real.
- Comparación de proveedores de inferencia: el artefacto exige un proveedor Darkbloom con el parche de *parser* para el `</think>` suelto, por lo que resulta útil para verificar que una implementación concreta cumple ese requisito antes de adoptarla.
- Análisis de robustez en enrutado de herramientas bajo muestreo: la validación incluye la misma petición muestreada a temperatura 1.0 / top_p 0.95 con 20 repeticiones por modo MTP, lo que sirve para caracterizar la varianza de la decisión de llamada a herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor presenta explícitamente una tabla de validación que define como "no un benchmark de producción": son conjuntos sintéticos pequeños de selección de herramientas (18 casos fijos, 16 casos frescos y 10 controles de API). Se reproduce a continuación tal cual, comparando el artefacto de 4 bits publicado con este artefacto.

| Comprobacion | 4 bits publicado | Este artefacto |
|---|---|---|
| Petición exacta de OpenRouter (Boston), razonamiento off, greedy | rechazo 3/3 (ambos modos MTP) | llamada a herramienta 3/3, contenido limpio (ambos modos MTP) |
| Misma petición, razonamiento on | llamada a herramienta | llamada a herramienta |
| Corpus de 18 casos (descubrimiento / held-out), greedy | 4/8 · 5/10 | 7/8 · 10/10 |
| 16 casos frescos (descubrimiento / held-out), greedy | 8/8 · 4/8 | 8/8 · 8/8 |
| Controles de API, MTP off / on | 8/10 · 8/10 | 10/10 · 10/10 |
| `</think>` literal en el contenido (con parche de parser) | 0 | 0 |
| Petición exacta muestreada a 1.0 / 0.95, 20 por modo MTP | 5/20 · 10/20 llamadas | 13/20 · 18/20 |
| MTP on frente a off | decisiones idénticas | decisiones idénticas |

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 19,06 GB, por lo que la inferencia requiere al menos 20 GB de memoria unificada solo para los pesos, más la caché KV y el *overhead* del *runtime*.
- Al tratarse de un formato MLX, no se ejecuta sobre CUDA. El destino natural son equipos Apple Silicon con memoria unificada; se recomienda de 32 GB en adelante para trabajar con contexto apreciable, y 64 GB para márgenes cómodos.
- GPU NVIDIA (A100, H100, RTX 4090) y demás aceleradores CUDA: no soportados por este artefacto en su formato actual.
- Cabe en equipos *consumer* de Apple con 32 GB o más de memoria unificada; no cabe en configuraciones de 16 GB ni de 24 GB sin recurrir a otras cuantizaciones.
- Opciones de despliegue: `mlx-lm` y proveedores Darkbloom con el parche de *parser* indicado (PR privado d-inference #2, commit A). No se proporciona formato GGUF ni compatibilidad documentada con vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar contra el modelo base y contra el artefacto de 4 bits del que deriva. No se han proporcionado datos de modelos de terceros de la misma categoría.

| Modelo | Precision | Parametros totales | Tamano | MTP | Tool calling en modo razonamiento off | Licencia |
|---|---|---|---|---|---|---|
| Este artefacto (MLX hybrid8) | Q8 en Mamba/atención, Q4 en MoE | 32,9 mil millones | 19,06 GB | Sí, embebida | Sí en la validación del autor (3/3 greedy) | nvidia-open-model-license |
| Artefacto 4 bits publicado | Q4 uniforme | 32,9 mil millones | 18,61 GB (0,45 GB menos) | Sí | No: rechazo 3/3 greedy | nvidia-open-model-license |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | BF16 | 32,9 mil millones | no disponible | no disponible | Sí, llama a la herramienta | nvidia-open-model-license |
| Checkpoint Q8 mencionado por el autor | Q8 | no disponible | no disponible | no disponible | Sí, llama a la herramienta | no disponible |

## Limitaciones y advertencias

- Estado explícito de candidato de validación privado: no es el artefacto oficial de Darkbloom y el autor lo declara no cualificado para producción, sin garantía adicional.
- Requiere un proveedor Darkbloom con el parche de *parser* para el `</think>` colgante (PR privado d-inference #2, commit A). Sin ese parche, el artefacto emite un `</think>` suelto antes de la llamada a herramienta en modo razonamiento off.
- Persiste un fallo conocido: el *prompt* con estilo de cotización bursátil ("current share price of TSLA") sigue rechazando en modo greedy en 1 de los 18 casos.
- Las decisiones en modo greedy están en "el filo de la navaja": un diagnóstico previo mostró que el primer token generado oscila entre una referencia Python con *split-prefill* y la ruta de *full-prefill* del proveedor con los mismos *token ids*. El propio autor recomienda revalidar sobre la ruta de servicio exacta antes de promoverlo.
- Bajo muestreo, algunas peticiones meteorológicas que funcionan en greedy pasan a rechazar.
- Idiomas soportados no documentados en la información disponible; no se puede asumir cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible.
- No hay datos publicados de sesgos ni de tasa de alucinación para este artefacto.
- Restricciones de licencia: se hereda la NVIDIA Open Model License del modelo fuente; el repositorio no añade garantías. Conviene revisar `LICENSE` y `SOURCE-MODEL-CARD.md` antes de cualquier uso comercial.
- El artefacto es una cuantización derivada: cualquier limitación del modelo base se mantiene, y la cuantización puede introducir degradaciones adicionales no caracterizadas más allá de las pruebas de *tool calling*.
- Registra 0 descargas y 0 *likes*, y no está aprobado para publicación según su propio `config.json`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Spangler3000/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-MLX-hybrid8-mtp
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia del modelo fuente: NVIDIA Open Model License (referenciada como `LICENSE` dentro del repositorio)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. Los resultados devueltos corresponden a guías de sitios de *streaming* en italiano y no guardan relación con el modelo.
