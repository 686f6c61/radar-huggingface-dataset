# taurusduan/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF

## Resumen

Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF es una cuantización GGUF de la variante abliterada de Qwen3.8-Flash-Next, publicada por el usuario taurusduan a partir del trabajo de huihui-ai. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 125.743.653.760 parámetros totales, orientado a tareas multimodales de imagen-texto (pipeline `image-text-to-text`) y conversacionales. El modelo base original es Qwen3.8-Flash-Next, desarrollado por el equipo Qwen de Alibaba, y la versión aquí empaquetada incorpora la técnica de *abliteration*, que elimina la dirección de rechazo de los pesos para reducir las negativas del modelo a responder.

La relevancia de esta ficha reside en dos factores. Primero, la cuantización permite ejecutar un modelo MoE de 125B parámetros en hardware de consumo mediante tipos de cuantización propietarios (TQK6/TQK7, TQ2_T, TQP5-7) que reducen el peso a entre 28,8 GiB y 50,21 GiB según la variante (S, M, L). Segundo, la abliteración abre la puerta a usos sin las restricciones de rechazo del modelo original, lo que tiene implicaciones legales y éticas que se detallan en las limitaciones.

El repositorio tiene un tamaño de 383,6 GB, no registra descargas ni *likes* en el momento de la consulta, y se distribuye bajo licencia `qwen-community-1.0` (etiquetada como `other` en los metadatos). El modelo requiere runtimes específicos que aún no están integrados en llama.cpp upstream: Strata 0.2.0+, halo-box/strix-llama.cpp o agentionai/llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención y atención lineal; transformer híbrido (detalles completos no disponibles) |
| Parámetros totales | 125.743.653.760 (125,7B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 64k tokens (referenciado en la model card para el cálculo de memoria) |
| Tipos de cuantización | TQK6/TQK7 (Gyro-S), TQ2_T (Gyro-M), TQP5-7 (Gyro-L); sufijos de archivo TQ1_0, TQ2_0, TQ3_0 como clases de tamaño |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en metadatos) |
| Formato de pesos | GGUF (con proyecto de visión `mmproj-F16.gguf` y borrador MTP `mtp-Qwen3.8-Flash-Next-draft.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura Mixture-of-Experts con 125,7B parámetros totales y atención híbrida que combina atención estándar con atención lineal, según se desprende de la descripción de los tensores modificados por la abliteración (salidas de atención, atención lineal y proyecciones *down* de expertos compartidos y enrutados). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

La innovación técnica destacable de esta publicación no está en el entrenamiento sino en el proceso de *abliteration* llevado a cabo por huihui-ai: se modifican únicamente los tensores que escriben en el flujo residual. En las variantes Gyro-S y Gyro-M (huihui-ai v1) se alteran 144 de 1.224 tensores; en Gyro-L (v2) se alteran 96 tensores, manteniendo los expertos enrutados idénticos a los del modelo Gyro-L original. La cuantización emplea tipos *trellis* propietarios que no son compatibles con llama.cpp upstream. Según la model card, la abliteración introduce una divergencia KL de 0,005 respecto a los archivos Gyro originales en texto técnico y código, lo que sugiere un coste de calidad bajo en esos dominios.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 64k tokens.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), con proyector de visión separado (`mmproj-F16.gguf`).
- Razonamiento y generación de código, según la evaluación de divergencia KL en texto técnico y código reportada por el autor.
- Decodificación especulativa mediante borrador MTP (`mtp-Qwen3.8-Flash-Next-draft.gguf`).
- Ejecución en GPU de consumo mediante cuantizaciones trellis de bajo peso (28,8 GiB en Gyro-S a 64k de contexto).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- **Inferencia local de un MoE de 125B en GPU de consumo**: la variante Gyro-S (TQ1_0) ocupa 28,8 GiB a 64k de contexto, lo que permite desplegar el modelo completo en una tarjeta de 32 GB (por ejemplo, RTX 5090) usando Strata o agentionai/llama.cpp. Es adecuado para investigadores que necesitan un modelo grande sin infraestructura de centro de datos.
- **Análisis de documentos e imágenes en local**: al ser un modelo `image-text-to-text` con proyector de visión, puede emplearse para describir capturas, extraer información de diagramas o responder preguntas sobre imágenes en entornos con requisitos de privacidad, sin enviar datos a APIs externas.
- **Generación de código asistida en pipelines de CI/CD**: la model card reporta una divergencia KL baja en código y texto técnico, lo que lo hace apto para tareas de autocompletado, revisión de parches o generación de tests en flujos automatizados, siempre que se valide la salida.
- **Investigación sobre alineación y abliteración**: al ser una variante abliterada, sirve como objeto de estudio para medir cómo cambia el comportamiento del modelo al eliminar la dirección de rechazo, comparando con el modelo base sin abliterar.
- **Despliegue en estaciones con memoria unificada**: la variante Gyro-L (TQ3_0, 50,21 GiB de pesos) está pensada para máquinas con 64 GB de memoria unificada (Strix Halo), lo que permite ejecutar el modelo con mayor calidad en un equipo compacto.
- **Prototipado de agentes conversacionales**: con 64k de contexto y decodificación especulativa MTP, puede sostener conversaciones largas y tareas de varios pasos en un servidor local expuesto en `localhost:8080`, integrándose en aplicaciones mediante la API compatible con endpoints.
- **Evaluación comparativa de cuantizaciones trellis**: el repositorio ofrece tres clases de tamaño (S, M, L) con divergencias KL de 0,397, 0,295 y 0,164 respectivamente, lo que permite estudiar el compromiso entre memoria y calidad en un mismo modelo.

## Benchmarks y rendimiento

La model card proporciona datos de divergencia KL respecto al modelo original, pero no resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Variante | Archivo | Memoria GPU (64k contexto) | KLD vs modelo original |
|---|---|---|---|
| Gyro-S | `Qwen3.8-Flash-Next-Gyro-S-abliterated-TQ1_0.gguf` | 28,8 GiB | 0,397 |
| Gyro-M | `Qwen3.8-Flash-Next-Gyro-M-abliterated-TQ2_0.gguf` | ~37 GiB | 0,295 |
| Gyro-L | `Qwen3.8-Flash-Next-Gyro-L-abliterated-TQ3_0.gguf` | 50,21 GiB (pesos) | 0,164 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 28,8 GiB para Gyro-S a 64k de contexto; ~37 GiB para Gyro-M; 50,21 GiB de pesos para Gyro-L (más overhead de contexto y caché KV).
- **GPU recomendadas**: tarjetas de 32 GB para Gyro-S (RTX 5090, A100 40GB, etc.); configuraciones de 48 GB (2×24 GB) o máquinas con 64 GB de memoria unificada para Gyro-M; equipos con 64 GB de memoria unificada (Strix Halo) para Gyro-L.
- **Consumer GPU**: sí, Gyro-S cabe en una GPU de consumo de 32 GB; Gyro-M requiere dos tarjetas de 24 GB o memoria unificada; Gyro-L está orientado a memoria unificada, no a GPU discreta de consumo.
- **Runtimes compatibles**: Strata 0.2.0 o superior (NVIDIA, AMD RX 7000 / RX 9000 / R9700); halo-box/strix-llama.cpp master (AMD Strix Halo; CPU, Vulkan, HIP); agentionai/llama.cpp (CPU, Vulkan, CUDA). Gyro-L requiere los tipos *pair-trellis* de agentionai/llama.cpp o la rama Strata de agentionai-group.
- **llama.cpp upstream**: no puede cargar estos archivos todavía.
- **Latencia y throughput**: no disponibles en la información proporcionada; la model card remite a la tarjeta principal de Gyro para datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Gyro-abliterated (este) | 125,7B (MoE) | 64k | TQK6/TQK7, TQ2_T, TQP5-7 (GGUF) | qwen-community-1.0 | Hugging Face, runtimes específicos |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | 125,7B (MoE) | no disponible | safetensors (modelo base sin cuantizar) | no disponible | Hugging Face |
| agentionai/Qwen3.8-Flash-Next-Gyro-GGUF | 125,7B (MoE) | 64k | trellis (GGUF) | no disponible | Hugging Face |
| Qwen3.8-Flash-Next (original) | 125,7B (MoE) | no disponible | safetensors | qwen-community-1.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de benchmarks que permitan contrastar con arquitecturas alternativas de tamaño similar.

## Limitaciones y advertencias

- **Abliteración y seguridad**: la abliteración elimina la mayor parte de los rechazos del modelo. La propia model card incluye un aviso de uso (`usage warning`) y advierte de que debe consultarse antes de emplear el modelo. Esto lo hace inadecuado para aplicaciones orientadas al público sin filtros adicionales.
- **Riesgo de contenido dañino**: al reducirse la dirección de rechazo, aumenta la probabilidad de generar contenido que el modelo original rechazaría. Es responsabilidad del desplegador implementar moderación externa.
- **Compatibilidad de runtimes**: los archivos no cargan en llama.cpp upstream; requieren Strata, strix-llama.cpp o agentionai/llama.cpp. Esto limita la portabilidad y exige verificar la versión del runtime.
- **Licencia**: la licencia `qwen-community-1.0` (etiquetada como `other`) puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegar en producción. La información proporcionada no detalla los términos.
- **Idiomas**: no se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano u otras lenguas distintas del inglés.
- **Alucinación**: no hay datos publicados sobre tasas de alucinación; como en cualquier modelo generativo, debe validarse la salida en dominios factuales.
- **Madurez del repositorio**: 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el mismo día (2026-11-28), lo que indica que no ha sido validado por la comunidad.
- **Sesgos**: no disponibles en la información proporcionada; los sesgos del modelo base no se documentan en esta ficha.
- **Tamaño del repositorio**: 383,6 GB, lo que exige planificar el almacenamiento y la descarga selectiva de archivos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/taurusduan/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF)
- [Modelo base abliterado (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated)
- [Modelo base abliterado v2 GGUF (huihui-ai)](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF)
- [Tarjeta completa de Gyro](https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF)
- [Sitio web de AgentionAI](https://www.agention.ai/)
- [Agente de código Marshall](https://marshall.agention.ai)
- [Strata (runtime)](https://github.com/Niko1221/Strata)
- [halo-box/strix-llama.cpp](https://github.com/halo-box/strix-llama.cpp)
- [agentionai/llama.cpp](https://gitlab.com/agentionai-group/llama.cpp)
- [Rama Strata de agentionai-group](https://gitlab.com/agentionai-group/strata/-/tree/main)
