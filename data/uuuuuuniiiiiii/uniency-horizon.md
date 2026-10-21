# Uuuuuuniiiiiii/uniency-horizon

## Resumen

Uniency Horizon es un artefacto publicado en HuggingFace por el usuario `Uuuuuuniiiiiii` que se presenta, según su propia model card, como un «electrodoméstico de IA» verticalmente integrado: un modelo de lenguaje denominado GoldWorm v7 (38.167.552 parámetros, BPC 0,5611), una capa de resolución por memoria direccionable por contenido (SHD-CCP CAM de 12 bits, proyecto UtoPiCorn_LM) y un *shell* de agente llamado CIRISClient. No se describe una arquitectura transformer convencional ni se publican pesos en safetensors o GGUF: los pesos se empaquetan en un contenedor propietario `.gw` (MAGIC `GWLOCK`, versión 2) de 152.695.556 bytes, leído mediante `numpy.memmap`.

El repositorio es de 0,2 GB, tiene 0 descargas y 0 *likes*, no declara licencia, idiomas ni pipeline de HuggingFace, y las únicas etiquetas del campo `tags` de la plataforma son `region:us`. La model card incluye rutas absolutas de una máquina local (`/home/darky/horizon/...`), lo que indica que se trata de un registro de despliegue personal y no de un paquete reproducible para terceros. La sección de uso aparece con un bloque de código Python vacío.

Su relevancia potencial es de nicho: documenta un enfoque de inferencia en el borde basado en enrutamiento por CAM, contenedores *zero-copy* y ejecución híbrida local-nube, con métricas declaradas de latencia (5,0 ms por *tile* local; p50 de 140,5 ms y p95 de 152,45 ms en modo híbrido). No obstante, todas las cifras y afirmaciones son del autor y no están verificadas de forma independiente; en particular, la afirmación de comprimir un «modelo de clase 405B» a un CAM de 12 bits no está respaldada por artefactos públicos: lo distribuido son 38,2 millones de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No se declara transformer; la model card describe el sistema GoldWorm v7 con enrutamiento por CAM de 12 bits sobre topología S_6 y MAC sistólico 16×16 por clúster en un NPU de 128 núcleos |
| Parametros totales | 38.167.552 (125 tensores, según la model card) |
| Parametros activos | No disponible; no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican GGUF, AWQ, GPTQ ni similar; los pesos del contenedor se leen como float32. Las «claves de 12 bits» descritas son claves de CAM para enrutamiento, no cuantización de pesos |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara en el repositorio ni en la model card) |
| Formato de pesos | `.gw` propietario (MAGIC `GWLOCK`, versión 2), float32, acceso por `numpy.memmap`; 152.695.556 bytes, SHA256 `e2bf51ebe51bc753eb3324517684138e49d25fc0c7715f3aee3bbc0fe994cd19` |

## Arquitectura y entrenamiento

La documentación disponible no permite reconstruir el entrenamiento. No se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. La única métrica de calidad declarada es BPC_FINAL = 0,5611, junto con la etiqueta `SPARSITY: PASS`, sin definición del conjunto de evaluación ni del procedimiento de medida. El nombre del contenedor de pesos (`checkpoints/max_run/stories.gw`) sugiere un corpus de entrenamiento de tipo narrativo, pero es una inferencia a partir del nombre de fichero, no un dato confirmado.

El componente técnico descrito con más detalle es el mecanismo de despliegue, no el modelo: un contenedor `.gw` con CRC verificado y *round-trip* declarado con error máximo absoluto 0,0; una CAM de 256 entradas con clave de 12 bits y latencia declarada de 0,001 ms por búsqueda, con una sobrecarga de despacho de 0,5 ms; y una topología de interconexión S_6 (76 nodos sobre un grupo de 6 nodos) expuesta mediante `tools/phase2_cam_bridge.py`. Se menciona además un sustrato acústico SAW/BAW entre 800 MHz y 1 GHz para el enrutamiento, sin especificación de hardware comercial asociado. El código fuente citado (`gwlm_v7.py`, `UtoPiCorn_LM/src/shd_ccp/core/`, `horizon/tools/`) no está enlazado públicamente en la información disponible.

## Capacidades

- Generación de texto: es la función implícita del modelo de lenguaje GoldWorm v7; no se documentan dominios concretos de especialización.
- Capacidad de razonamiento, código, matemáticas o visión: no disponible; no se declara ninguna de ellas en la model card.
- *Tool calling* / *function calling*: no declarado. El sistema incluye un *shell* de agente (CIRISClient) que orquesta la inferencia, pero no se especifica un protocolo de llamada a herramientas.
- Ejecución de agentes y razonamiento multi-paso: atribuido al componente CIRISClient, sin detalles de implementación ni ejemplos de uso.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales declaradas: modo híbrido local-nube con *prefetch* de *tiles*, despacho por CAM, contenedor *zero-copy* y presupuesto de latencia por *tile* (5,0 ms con techo duro de 20,0 ms). No se declara *thinking mode*, audio ni vídeo.
- Multimodalidad: no disponible.

## Casos de uso

- Generación de texto narrativo en dispositivos de baja capacidad: con 38,2 millones de parámetros en float32 (unos 153 MB), el contenedor cabe en memoria de un equipo de gama baja y podría ejecutarse en CPU; adecuado para prototipos de escritura asistida siempre que se valide la calidad real, dado que no hay benchmarks publicados.
- Investigación sobre memoria direccionable por contenido aplicada a inferencia: el repositorio documenta un esquema de CAM de 12 bits con 256 entradas y despacho de *tiles*; sirve como referencia conceptual para grupos que exploren *lookup* asociativo frente a *gating* disperso, aunque el código no sea público.
- Evaluación de contenedores *zero-copy*: el formato `.gw` con `mmap` y CRC verificado es un caso de estudio para reducir copias de pesos en memoria; aplicable a pipelines de despliegue que cargan pesos con `numpy.memmap` en lugar de `torch.load` completo.
- Diseño de sistemas híbridos local-nube con presupuesto de latencia: las cifras declaradas (p50 140,5 ms, p95 152,45 ms, máximo 154,0 ms) sirven como plantilla para razonar sobre *tail latency* dominada por el RTT de la nube en lugar del cómputo local.
- Docencia y experimentación sobre topologías de interconexión: la exposición de la topología S_6 como «manifold de enrutamiento» puede usarse en cursos de arquitectura de computadores, con la advertencia de que no hay validación externa.
- Pruebas de agentes con *shell* dedicado: CIRISClient permitiría, en teoría, conducir la pila de extremo a extremo en el dispositivo; útil para prototipar orquestación de agentes con un modelo pequeño y *fallback* a la nube para el resto de la carga.
- Verificación de integridad de artefactos: el SHA256 publicado y el recuento de 125 tensores permiten ejercitar flujos de auditoría de pesos en cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MT-Bench ni similares) en la información disponible. Las únicas métricas son internas y declaradas por el autor, sin conjunto de evaluación ni protocolo descritos:

| Metrica | Valor declarado | Nota |
|---|---|---|
| BPC_FINAL | 0,5611 | Sin definir corpus de evaluación |
| L_LATENCY (*tile* local) | 5,0 ms | Techo duro declarado: 20,0 ms |
| Latencia de búsqueda CAM | 0,001 ms | Con sobrecarga de despacho de 0,5 ms |
| H_LATENCY p50 (híbrido) | 140,5 ms | Objetivo de *handover*: 150,0 ms |
| H_LATENCY p95 (híbrido) | 152,45 ms | Máximo observado: 154,0 ms |
| Autonomía estimada | 16,09 h | BATT_EST_H, sin condiciones de medida |
| SPARSITY | PASS | Sin criterio definido |

No hay comparación con modelos de referencia en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 153 MB solo para pesos en float32; con sobrecarga del *runtime* de PyTorch y caché de activaciones, un presupuesto realista de 0,3-0,6 GB. Estimación propia, no publicada por el autor.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con 1 GB o más sería suficiente (por ejemplo, GTX 1050, RTX 3050, RTX 4090); no hay motivo técnico para requerir A100 o H100 con este número de parámetros.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en iGPU; también es viable la inferencia en CPU. No confirmado por el autor.
- Opciones de despliegue: no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI. El formato `.gw` es propietario y requiere `tools/gw_binary.py` y `gwlm_v7.py`, no incluidos como enlaces públicos en la información disponible.
- Latencia y *throughput*: por *tile* local, 5,0 ms declarados; en modo híbrido, p50 de 140,5 ms y p95 de 152,45 ms, dominados según el autor por el RTT de la nube. El *throughput* en tokens por segundo no está disponible.
- Hardware objetivo declarado: NPU de 128 núcleos (12 clústeres × 16 núcleos) con CAM de 256 entradas y MAC sistólico 16×16 por clúster, sobre un dispositivo tipo Surface con NPU local. No se identifica un producto comercial con esa configuración en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos y no se han identificado alternativas directamente equiparables: el artefacto combina un modelo de 38,2 millones de parámetros con un formato de pesos y una capa de despacho propietarios, lo que impide una comparación homogénea de parámetros, contexto, rendimiento y licencia con modelos públicos de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uniency Horizon (GoldWorm v7) | 38,17 M | No disponible | Solo métricas internas declaradas | No disponible | Repositorio de 0,2 GB, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad lingüística, por lo que no es posible situar el modelo frente a alternativas.
- La afirmación de un «modelo de clase 405B comprimido» no es verificable: el artefacto distribuido contiene 38.167.552 parámetros y la parte de 405B residiría, según el autor, en la nube, sin artefacto ni API pública documentada.
- Licencia no declarada: no se permite determinar si el uso comercial es posible. Tratar como no apto para producción hasta que el autor explicitE una licencia.
- Idiomas no declarados: se desconoce la cobertura lingüística; no asumir soporte de castellano.
- Contexto no documentado: no se puede planificar una aplicación multi-turno sin conocer la ventana máxima.
- Reproducibilidad muy limitada: la model card referencia rutas absolutas de un equipo local (`/home/darky/...`), scripts no enlazados públicamente y un informe de validación interno con SHA256 pero sin URL. El bloque de uso aparece vacío.
- Riesgo de alucinación: con 38,2 millones de parámetros, la fiabilidad factual es estructuralmente baja; el nombre del contenedor (`stories.gw`) apunta a un entrenamiento narrativo, lo que sugeriría debilidad en código, matemáticas y tareas factuales.
- Riesgo de sesgos: no evaluado ni documentado; un corpus pequeño y no descrito tiende a amplificar sesgos y a producir respuestas degeneradas fuera del dominio de entrenamiento.
- Dependencia de la nube en el modo híbrido: la cola de latencia (p95 152,45 ms) está dominada por el RTT externo, fuera del control del dispositivo; el rendimiento en producción dependerá de la red.
- Arquitectura no estándar sin código de inferencia público: no se puede integrar con ecosistemas habituales (transformers, vLLM, Ollama) sin ingeniería inversa del contenedor `.gw`.
- Señales de madurez del repositorio: 0 descargas, 0 *likes*, etiquetas mínimas (`region:us`) y una diferencia de 32 minutos entre creación y última actualización. No hay evidencia de uso por terceros ni de revisión independiente.
- Las métricas de latencia, autonomía y esparsidad no incluyen metodología de medida; no deben citarse como resultados reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Uuuuuuniiiiiii/uniency-horizon
- Paper: no disponible
- Blog o anuncio: no disponible
- Repositorio de código: no disponible (la model card cita `gwlm_v7.py`, `UtoPiCorn_LM/src/shd_ccp/core/` y `horizon/tools/`, sin URL pública)
- Demo: no disponible
- Informe de validación: no disponible públicamente (la model card cita un SHA256 `a1c8faf5497ab6f8639e2b89ce8703585a485d1212edacbd8b0e495dc8e87b23` sin enlace)
