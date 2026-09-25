# ukisai/Swift1.5-Qwen3.8-Flash-Next

## Resumen

Swift 1.5 Qwen3.8-Flash-Next es un derivado de razonamiento eficiente del modelo Qwen3.8-Flash-Next, desarrollado por UkisAI y publicado en HuggingFace bajo la licencia swift-open-license-1.0. Se trata de un modelo de arquitectura Mixture of Experts (MoE), multimodal (pipeline image-text-to-text), con 179.999.981.459 parámetros totales y un repositorio de 360 GB en safetensors, lo que indica pesos en BF16.

El problema que resuelve es el sobrepensamiento patológico (*overthinking*): según la model card, el modelo consume un 63,4 % menos de tokens de razonamiento que su base, con una aceleración de 1,8x y una pérdida de precisión inferior al 1 % respecto al modelo base en el ajuste xhigh. En la demo publicada, la generación de un juego 3D endless runner pasó de 8 minutos 52 segundos (base) a 4 minutos 56 segundos (Swift 1.5).

Es relevante ahora porque la reducción de tokens de pensamiento impacta directamente en el coste por consulta y en la latencia de pipelines agénticos de horizonte largo. El modelo está orientado explícitamente a código, uso de terminal y agentes personales, y el repositorio está sujeto a *gating* (acceso controlado). No se dispone de información sobre idiomas soportados ni sobre parámetros activos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiquetas: `moe`, `qwen3_8`, `qwen4_exp`) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF; GSQ-RCO GGUF; NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other` en los metadatos de HuggingFace) |
| Formato de pesos | safetensors, GGUF, NVFP4 |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Modelo base | Qwen/Qwen3.8-Flash-Next (relación: finetune) |
| Modalidad | image-text-to-text (texto, imagen; la documentación de UkisAI menciona también vídeo) |
| Dataset de entrenamiento declarado | ukisai/Qwen3.8-27B-multi-turn-agent-sft |
| Tamano del repositorio | 360,0 GB |
| Descargas | 57 |
| Likes | 17 |
| Acceso | gated (acceso controlado) |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-09-24 |
| Libreria | transformers |

## Arquitectura y entrenamiento

La model card no detalla la configuración interna del MoE (número de expertos, expertos activos por token, dimensión oculta ni mecanismo de atención). Lo que sí se declara es que se trata de un derivado por *finetune* de Qwen3.8-Flash-Next, sobre el que se aplica un proceso de post-entrenamiento propio de UkisAI. La innovación técnica central consiste en identificar y penalizar los tokens asociados a sobrepensamiento patológico sin atacar de forma directa la longitud del razonamiento, recuperando después la precisión mediante RL y OPD (*on-policy distillation*). El resultado declarado es un uso de tokens "comprimido" con trazas de razonamiento más cortas y, según el autor, menos errores de sobrepensamiento. El post-entrenamiento está adaptado específicamente a código y a trabajo agéntico de horizonte largo (agentes personales, uso de terminal e ingeniería de software).

Respecto a los datos, la model card enlaza el dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, pero aclara que no se utiliza tal cual: se remuestrea y se convierte en entornos de RL apropiados. No se especifica el número total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. Fuentes secundarias de UkisAI relativas a otros miembros de la familia Swift (el modelo de 27B) mencionan un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI; esta información no está confirmada para la variante Flash-Next en la model card disponible.

## Capacidades

- Generación de texto conversacional multi-turno orientada a agentes.
- Entrada multimodal image-text-to-text (pipeline declarado en HuggingFace); la documentación de UkisAI para la familia Swift indica soporte de texto, imagen y vídeo con la interfaz estándar de Qwen3.8.
- Razonamiento con modo de pensamiento eficiente: trazas de razonamiento más cortas y un 63,4 % menos de tokens de pensamiento que el modelo base.
- Generación de código de proyecto completo: la demo pública consiste en la creación de un juego 3D endless runner ejecutable en local.
- Trabajo agéntico de horizonte largo: agentes personales, uso de terminal y tareas de ingeniería de software.
- Orientación declarada a Terminal-Bench 2.1 (la model card reporta tokens de salida generados para este benchmark).
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Agentes de terminal automatizados: el modelo está post-entrenado específicamente para uso de terminal, de modo que puede ejecutar secuencias de comandos, interpretar salidas y corregir errores en bucles multi-paso con un coste de tokens de razonamiento reducido al 36,6 % del base.
- Ingeniería de software asistida: generación, refactorización y depuración de código en repositorios reales, con integración en pipelines de CI/CD como paso de revisión o reparación automática de tests.
- Agentes personales de horizonte largo: asistentes que mantienen estado durante sesiones extensas y encadenan decenas de llamadas a herramientas, donde la reducción de tokens de pensamiento se traduce directamente en menor factura de inferencia.
- Generación de prototipos jugables y aplicaciones interactivas: la demo oficial demuestra la creación de un juego 3D completo con mecánicas, *assets* y instrucciones de ejecución local en menos de 5 minutos de generación.
- Asistencia técnica con contexto multimodal: al aceptar entradas de imagen, puede recibir capturas de pantalla de errores, diagramas de arquitectura o interfaces de usuario y responder sobre ellos.
- Documentación técnica automatizada: generación de guías de instalación, README y notas de versión a partir del código, aprovechando el modo de razonamiento comprimido para tareas de bajo riesgo que no requieren deliberación extensa.
- Evaluación comparativa interna: al ser un derivado directo de Qwen3.8-Flash-Next con interfaz compatible, sirve como sustituto en *drop-in* para reducir costes de evaluación sin perder precisión apreciable (<1 % en xhigh).

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparando Qwen3.8-Flash-Next en BF16 con Swift 1.5 en BF16, con cinco ejecuciones por modelo, pero los valores numéricos de la tabla no están disponibles en la información proporcionada (se trunca antes de los datos). Los únicos datos cuantitativos recuperables son los siguientes:

| Metrica | Base Qwen3.8-Flash-Next | Swift 1.5 | Diferencia |
|---|---|---|---|
| Tokens de pensamiento | Referencia | -63,4 % | Reduccion del 63,4 % |
| Velocidad de generacion | 1,0x | 1,8x | Aceleracion de 1,8x |
| Precision (ajuste xhigh) | Referencia | Perdida <1 % | -<1 % |

| Metrica cualitativa | Base Qwen3.8-Flash-Next | Swift 1.5 |
|---|---|---|
| Tiempo de generacion de la demo (juego 3D) | 8 min 52 s | 4 min 56 s |

No se han publicado en la informacion disponible resultados numericos desglosados por benchmark (MMLU, HumanEval, GSM8K, Terminal-Bench 2.1, etc.). La model card indica que Terminal-Bench 2.1 se mide en tokens totales de salida generados, no en tokens de pensamiento, pero no se adjuntan los valores.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del número de parámetros declarado (180B) y del tamaño del repositorio (360 GB en safetensors BF16), no datos publicados por el autor:

- Pesos BF16 completos: aproximadamente 360 GB, coherente con el tamaño del repositorio. Requiere al menos 8x H100 80 GB o 8x A100 80 GB para inferencia sin cuantizar.
- Pesos NVFP4 (4 bits): aproximadamente 90 GB. Se puede desplegar en 2x H100 80 GB o 2x A100 80 GB.
- GGUF Q4: aproximadamente 100 GB. Viable en configuraciones con 128 GB de RAM unificada o en nodos con dos GPU de 80 GB.
- GGUF Q8: aproximadamente 190 GB.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en ninguna cuantización, dado el tamaño mínimo de aproximadamente 90 GB. Se requiere hardware de centro de datos o memoria unificada de gran capacidad (por ejemplo, Apple Silicon con 128 GB o más en cuantizaciones bajas).
- Opciones de despliegue: la librería declarada es `transformers`; existe una variante GGUF oficial para llama.cpp/Ollama y una variante NVFP4. No se confirma compatibilidad explícita con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles de forma absoluta. El único dato relativo es la aceleración de 1,8x frente al modelo base y la reducción de tiempo de generación de 8 min 52 s a 4 min 56 s en la demo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de pensamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next | ~180B | no disponible | -63,4 % vs base | swift-open-license-1.0 | HuggingFace, gated; GGUF y NVFP4 |
| Qwen3.8-Flash-Next (base) | no disponible | no disponible | Referencia | Qwen Community License 1.0 | HuggingFace |
| Swift 1.5 Qwen3.8-27B | 27B | no disponible | -58,5 % vs base, +0,35 % de puntuacion, 1,95x de aceleracion | no disponible | HuggingFace; API en Featherless.ai |

No se dispone de datos suficientes (contexto, puntuaciones por benchmark, parámetros del base) para establecer una comparación cuantitativa completa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta ningún proceso específico de mitigación; el modelo es un derivado por finetune y conserva los sesgos y riesgos del modelo base Qwen3.8-Flash-Next.
- Sesgos conocidos: no disponibles. No se publica ninguna evaluación de sesgo, toxicidad o seguridad.
- Cobertura de idiomas: no disponible. La model card no declara idiomas soportados, por lo que no se puede asumir un rendimiento multilingüe fiable fuera del inglés sin validación propia.
- Restricciones de licencia: la licencia es swift-open-license-1.0, etiquetada como `license: other` en HuggingFace y con nombre de licencia propio, por lo que requiere lectura del texto completo antes de uso comercial. Además, según la documentación de la variante NVFP4, los términos del modelo base (Qwen Community License 1.0) siguen aplicándose: las organizaciones que operan un negocio de Model-as-a-Service o de asistente de trabajo con IA necesitan una licencia adicional de Qwen, y los productos con más de 100 millones de usuarios activos mensuales o más de 20 millones de dólares de facturación mensual deben mostrar el nombre del modelo de forma destacada.
- Acceso restringido: el repositorio está sujeto a *gating*, lo que implica aceptar condiciones adicionales antes de la descarga.
- Proceso de pensamiento comprimido: la reducción de tokens de razonamiento puede degradar el rendimiento en tareas que se benefician de deliberación extensa, aunque el autor declara una pérdida inferior al 1 % en xhigh.
- Idoneidad en produccion: sin datos publicados de latencia absoluta, throughput ni contexto máximo, no es posible dimensionar un despliegue en producción únicamente con la información disponible.
- Verificacion de datos: el dataset de entrenamiento enlazado se declara explícitamente como no utilizado tal cual, sino remuestreado y convertido en entornos de RL, por lo que su contenido no representa el conjunto de entrenamiento final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Variante GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Variante GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Variante NVFP4: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Sitio web de UkisAI: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- Catalogo de modelos de UkisAI: https://ukisai.com/models
- Nota tecnica de presentacion de Swift: https://ukisai.com/news/introducing-swift
- Demo jugable de la generacion de la model card: https://ukisai.com/swift-games/flash-next
- API del modelo hermano de 27B en Featherless.ai: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
